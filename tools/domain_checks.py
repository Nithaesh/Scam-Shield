"""Static URL analysis: parsing, shorteners, IP literals and lookalikes.

Nothing in this module opens a URL. It only parses the text the user received
and compares the host with the offline brand registry.
"""

from __future__ import annotations

import ipaddress
import logging
import re
from dataclasses import dataclass, field
from typing import Final
from urllib.parse import urlsplit

import tldextract
from rapidfuzz import fuzz

from tools import brands

logger = logging.getLogger("scam_shield.tools.domain_checks")

MAX_URL_LENGTH: Final[int] = 2048

#: Bundled public-suffix snapshot. ``suffix_list_urls=()`` keeps parsing fully
#: offline; the fallback snapshot ships with tldextract.
_EXTRACTOR: Final[tldextract.TLDExtract] = tldextract.TLDExtract(
    suffix_list_urls=(),
    cache_dir=None,
    fallback_to_snapshot=True,
)

_DEFANG_REPLACEMENTS: Final[tuple[tuple[str, str], ...]] = (
    ("[.]", "."),
    ("(.)", "."),
    ("{.}", "."),
    ("[dot]", "."),
    (" dot ", "."),
)

_LEET_REPLACEMENTS: Final[dict[str, str]] = {
    "0": "o",
    "1": "l",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "8": "b",
    "@": "a",
}

_UNSUPPORTED_SCHEMES: Final[frozenset[str]] = frozenset(
    {"javascript", "data", "file", "mailto", "tel", "sms", "about", "blob"}
)

_TOKEN_SPLIT_RE: Final[re.Pattern[str]] = re.compile(r"[^a-z0-9]+")
_ASCII_LETTER_RE: Final[re.Pattern[str]] = re.compile(r"[a-z]")


@dataclass
class UrlFacts:
    """Static facts about one URL in a message.

    Attributes:
        url: The URL as it appeared in the message, after light de-fanging.
        hostname: Lowercase host without port or userinfo.
        registered_domain: Registrable domain (``sbi.co.in``) or IP literal.
        tld: Public suffix, or an empty string for IPs and bare hosts.
        is_ip_based: True for IPv4/IPv6 literals.
        is_shortener: True for known link shorteners.
        lookalike_of: Brand name the host imitates, when detected.
        parse_error: Why the URL could not be parsed, when applicable.
        notes: Extra non-fatal observations (for diagnostics only).
    """

    url: str
    hostname: str = ""
    registered_domain: str = ""
    tld: str = ""
    is_ip_based: bool = False
    is_shortener: bool = False
    lookalike_of: str | None = None
    parse_error: str | None = None
    notes: list[str] = field(default_factory=list)


def _strip_wrappers(raw: str) -> str:
    """Remove surrounding punctuation that messages often include."""
    text = str(raw or "").strip().strip("<>\"'`")
    text = text.rstrip(".,;:!?)")
    # Restore the closing bracket of an IPv6 literal, if we removed it.
    if text.count("[") > text.count("]"):
        text += "]"
    return text


def de_fang(raw: str) -> str:
    """Undo common written obfuscation such as ``hxxp://`` and ``[.]``."""
    text = _strip_wrappers(raw)
    lowered = text.lower()
    if lowered.startswith("hxxps://"):
        text = "https://" + text[8:]
    elif lowered.startswith("hxxp://"):
        text = "http://" + text[7:]
    for needle, replacement in _DEFANG_REPLACEMENTS:
        if needle in text.lower():
            text = re.sub(re.escape(needle), replacement, text, flags=re.IGNORECASE)
    return text


def normalise_url(raw: str) -> tuple[str, str | None]:
    """Return ``(url, error)`` with a scheme added when the message omitted it."""
    text = de_fang(raw)
    if not text:
        return "", "Empty URL"
    if len(text) > MAX_URL_LENGTH:
        return text[:MAX_URL_LENGTH], "URL is longer than 2048 characters"
    lowered = text.lower()
    scheme_match = re.match(r"^([a-z][a-z0-9+.-]*):", lowered)
    if "://" not in lowered:
        if lowered.startswith("//"):
            text = "http:" + text
        elif scheme_match:
            scheme = scheme_match.group(1)
            rest = text[len(scheme) + 1 :]
            if scheme in ("http", "https"):
                text = f"{scheme}://" + rest.lstrip("/")
            elif scheme in _UNSUPPORTED_SCHEMES or not rest[:1].isdigit():
                return text, f"Unsupported URL scheme: {scheme}"
            else:
                # ``example.com:8080/path`` is a host and port, not a scheme.
                text = "http://" + text
        else:
            text = "http://" + text
    scheme = text.split("://", 1)[0].lower()
    if scheme in _UNSUPPORTED_SCHEMES:
        return text, f"Unsupported URL scheme: {scheme}"
    if scheme not in ("http", "https"):
        return text, f"Unsupported URL scheme: {scheme}"
    return text, None


def _decode_idna(hostname: str) -> tuple[str, bool]:
    """Decode punycode labels and report whether a label is mixed-script."""
    decoded_labels: list[str] = []
    mixed = False
    for label in (hostname or "").split("."):
        if label.startswith("xn--"):
            try:
                decoded = label.encode("ascii").decode("idna")
            except (UnicodeError, ValueError):
                decoded_labels.append(label)
                continue
            decoded_labels.append(decoded)
            has_ascii = bool(_ASCII_LETTER_RE.search(decoded.lower()))
            has_non_ascii = any(ord(ch) > 127 for ch in decoded)
            if has_ascii and has_non_ascii:
                mixed = True
        else:
            decoded_labels.append(label)
    return ".".join(decoded_labels), mixed


def _variants(text: str) -> set[str]:
    """Return the compact label plus common character-substitution variants."""
    base = "".join(ch for ch in text.lower() if ch.isalnum())
    variants = {base}
    leet = "".join(_LEET_REPLACEMENTS.get(ch, ch) for ch in base)
    variants.add(leet)
    variants.add(leet.replace("rn", "m"))
    variants.add(leet.replace("vv", "w"))
    return {variant for variant in variants if variant}


def _host_parts(hostname: str) -> set[str]:
    """Split a hostname into lowercase alphanumeric parts."""
    return {part for part in _TOKEN_SPLIT_RE.split(hostname.lower()) if part}


def detect_lookalike(hostname: str, registered_domain: str, is_ip: bool) -> str | None:
    """Return the brand name ``hostname`` imitates, or ``None``.

    Official and allow-listed hosts are never treated as lookalikes.
    """
    host = (hostname or "").strip().lower().rstrip(".")
    if not host or is_ip:
        return None
    if brands.host_is_official(host) or brands.host_is_official(registered_domain):
        return None

    parts = _host_parts(host)
    label_compact = "".join(ch for ch in (registered_domain or host).lower() if ch.isalnum())
    variants = _variants(label_compact)
    host_variants = _variants(host)

    for brand in brands.BRANDS:
        for token in brand.tokens:
            if len(token) < 3:
                continue
            if token in parts:
                return brand.name
            if any(token in variant for variant in variants):
                return brand.name
            if len(token) >= 5 and any(token in variant for variant in host_variants):
                # A brand token in a subdomain, e.g. sbi-login.attacker.com.
                return brand.name
            if len(token) >= 5:
                best = max(
                    (fuzz.ratio(variant, token) for variant in variants),
                    default=0.0,
                )
                if best >= 88:
                    return brand.name
        for token in brand.exact_tokens:
            if token in parts or token == label_compact:
                return brand.name
    return None


def _is_ip(hostname: str) -> bool:
    """Return True when the host is an IPv4 or IPv6 literal."""
    candidate = (hostname or "").strip("[]")
    try:
        ipaddress.ip_address(candidate)
        return True
    except ValueError:
        return False


def is_shortener(hostname: str, registered_domain: str) -> bool:
    """Return True when the host belongs to a known link shortener."""
    candidates = {h for h in (hostname, registered_domain) if h}
    for host in candidates:
        if host in brands.SHORTENERS:
            return True
        for short in brands.SHORTENERS:
            if host.endswith("." + short):
                return True
    return False


def analyse_url(raw: str) -> UrlFacts:
    """Parse one URL and return static facts without any network access."""
    text, normalise_error = normalise_url(raw)
    facts = UrlFacts(url=text or str(raw or ""), parse_error=normalise_error)

    try:
        split = urlsplit(text)
        hostname = (split.hostname or "").strip().rstrip(".")
    except (ValueError, UnicodeError) as exc:
        facts.parse_error = f"Unparseable URL: {type(exc).__name__}"
        logger.info("Could not parse URL %r: %s", text, exc)
        return facts

    if not hostname:
        facts.parse_error = facts.parse_error or "URL has no host"
        return facts
    if " " in hostname:
        facts.parse_error = facts.parse_error or "URL host contains spaces"
        return facts

    decoded_host, mixed_script = _decode_idna(hostname)
    facts.hostname = decoded_host.lower().rstrip(".")
    facts.is_ip_based = _is_ip(hostname)

    if facts.is_ip_based:
        facts.registered_domain = hostname.strip("[]")
        facts.tld = ""
        facts.notes.append("URL uses a raw IP address instead of a domain")
        return facts

    extracted = _EXTRACTOR(hostname)
    registered = (
        f"{extracted.domain}.{extracted.suffix}"
        if extracted.domain and extracted.suffix
        else extracted.domain or hostname
    )
    facts.registered_domain = registered.lower()
    facts.tld = extracted.suffix.lower()
    facts.is_shortener = is_shortener(facts.hostname, facts.registered_domain)
    facts.lookalike_of = detect_lookalike(
        facts.hostname, facts.registered_domain, facts.is_ip_based
    )
    if mixed_script:
        facts.notes.append("Punycode host mixes scripts and may be a homograph")
    return facts
