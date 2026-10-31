"""Real Entity Checker tools for Scam Shield.

``real_check_entities`` is the public entry point used by ``tools_real`` and,
through it, by ``tools_interface.check_entities`` when ``USE_MOCK_TOOLS=0``.

Design rules:
    * Return exactly the dictionary shape documented in ``tools_interface``.
    * Never raise: every entity is checked inside its own guard, and every
      network call has a five-second budget.
    * Never fetch a URL from a message. Only WHOIS and reputation APIs are
      contacted.
    * Check at most five URLs, five phone numbers and five UPI IDs per message.
"""

from __future__ import annotations

import json
import logging
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Final, Iterable

from tools import domain_checks, phone_checks, reputation, sender_checks, upi_checks, whois_check

logger = logging.getLogger("scam_shield.tools.real")

MAX_URLS: Final[int] = 5
MAX_PHONES: Final[int] = 5
MAX_UPI: Final[int] = 5
MAX_URL_WORKERS: Final[int] = 4

_SCHEME_URL_RE: Final[re.Pattern[str]] = re.compile(
    r"(?i)\b(?:https?://|hxxps?://)[^\s<>\"']+"
)
_BARE_DOMAIN_RE: Final[re.Pattern[str]] = re.compile(
    r"(?i)\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+"
    r"(?:com|in|co\.in|org|net|xyz|top|site|online|info|club|app|link|click|"
    r"live|shop|store|icu|buzz|vip|me|us|uk)(?:/[^\s<>\"']*)?"
)
_PHONE_RE: Final[re.Pattern[str]] = re.compile(
    r"(?:\+?91[\s-]?)?(?:1800[\s-]?\d{3}[\s-]?\d{3,4}|[6-9]\d{9})\b"
)
_UPI_RE: Final[re.Pattern[str]] = re.compile(
    r"\b[a-z0-9][a-z0-9._-]{1,255}@[a-z][a-z0-9.-]{1,63}\b",
    re.IGNORECASE,
)


def _as_list(value: Any) -> list[Any]:
    """Normalise an extracted field into a list without raising."""
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, (list, tuple, set)):
        return [item for item in value]
    return []


def _unique_strings(values: Iterable[Any], limit: int) -> list[str]:
    """Trim, de-duplicate (case-insensitively) and cap a list of entities."""
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if not isinstance(value, (str, int, float)):
            continue
        text = str(value).strip()
        key = text.lower()
        if not text or key in seen:
            continue
        seen.add(key)
        result.append(text)
        if len(result) >= max(1, limit):
            break
    return result


def _claimed(extracted: dict[str, Any]) -> str | None:
    value = extracted.get("claimed_organisation")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _failed_url(raw: str, exc: BaseException) -> dict[str, Any]:
    """Return a complete URL record when a check crashed unexpectedly."""
    logger.exception("URL check crashed for %r: %s", raw, exc)
    return {
        "url": str(raw or ""),
        "domain": "",
        "tld": "",
        "is_shortener": False,
        "is_ip_based": False,
        "lookalike_of": None,
        "domain_age_days": None,
        "virustotal": None,
        "safe_browsing": None,
        "urlhaus": None,
        "errors": [f"URL check failed ({type(exc).__name__})"],
    }


def _analyse_url(raw: str, claimed_organisation: str | None) -> dict[str, Any]:
    """Analyse one URL with WHOIS and every configured reputation provider."""
    facts = domain_checks.analyse_url(raw)

    age: int | None = None
    age_error: str | None = None
    virustotal: dict[str, Any] | None = None
    safe_browsing: dict[str, Any] | None = None
    urlhaus: dict[str, Any] | None = None
    reputation_errors: list[str] = []

    if not facts.parse_error:
        with ThreadPoolExecutor(
            max_workers=2, thread_name_prefix="scam-shield-url"
        ) as pool:
            age_future = pool.submit(
                whois_check.domain_age_days, facts.registered_domain
            )
            reputation_future = pool.submit(reputation.check_all, facts.url)

            try:
                age, age_error = age_future.result()
            except Exception as exc:  # noqa: BLE001 - never fail the URL
                logger.info("WHOIS future failed for %s: %s", facts.registered_domain, exc)
                age_error = f"WHOIS lookup failed ({type(exc).__name__})"

            try:
                virustotal, safe_browsing, urlhaus, reputation_errors = (
                    reputation_future.result()
                )
            except Exception as exc:  # noqa: BLE001
                logger.info("Reputation future failed for %s: %s", facts.url, exc)
                reputation_errors = [f"Reputation lookup failed ({type(exc).__name__})"]

    errors: list[str] = []
    if facts.parse_error:
        errors.append(facts.parse_error)
    if age_error:
        errors.append(age_error)
    errors.extend(reputation_errors)

    logger.debug(
        "URL check: url=%s domain=%s age=%s lookalike=%s vt=%s sb=%s urlhaus=%s",
        facts.url,
        facts.registered_domain,
        age,
        facts.lookalike_of,
        bool(virustotal),
        bool(safe_browsing),
        bool(urlhaus),
    )
    return {
        "url": facts.url,
        "domain": facts.registered_domain or facts.hostname,
        "tld": facts.tld,
        "is_shortener": bool(facts.is_shortener),
        "is_ip_based": bool(facts.is_ip_based),
        "lookalike_of": facts.lookalike_of,
        "domain_age_days": age,
        "virustotal": virustotal,
        "safe_browsing": safe_browsing,
        "urlhaus": urlhaus,
        "errors": errors,
    }


def _analyse_url_safe(raw: str, claimed_organisation: str | None) -> dict[str, Any]:
    """Run :func:`_analyse_url`, converting any crash into a shaped record."""
    try:
        return _analyse_url(raw, claimed_organisation)
    except Exception as exc:  # noqa: BLE001
        return _failed_url(raw, exc)


def _analyse_phone_safe(phone: str, claimed_organisation: str | None) -> dict[str, Any]:
    """Check one phone number, never raising."""
    try:
        return phone_checks.analyse_phone(phone, claimed_organisation)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Phone check crashed for %r: %s", phone, exc)
        return {
            "phone": str(phone or ""),
            "is_valid_format": False,
            "is_shortcode": False,
            "carrier_type": "unknown",
            "scam_reports_count": 0,
            "reputation": "invalid_format",
            "errors": [f"Phone check failed ({type(exc).__name__})"],
        }


def _analyse_upi_safe(upi_id: str) -> dict[str, Any]:
    """Check one UPI ID, never raising."""
    try:
        return upi_checks.analyse_upi(upi_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("UPI check crashed for %r: %s", upi_id, exc)
        return {
            "upi_id": str(upi_id or ""),
            "handle": "",
            "user": "",
            "is_impersonation": False,
            "target_entity": None,
            "reputation": "invalid_format",
            "errors": [f"UPI check failed ({type(exc).__name__})"],
        }


def _analyse_sender_safe(
    raw_sender: Any, claimed_organisation: str | None
) -> dict[str, Any]:
    """Check the SMS sender, never raising."""
    sender = raw_sender if isinstance(raw_sender, str) and raw_sender.strip() else None
    try:
        return sender_checks.analyse_sender(sender, claimed_organisation)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Sender check crashed: %s", exc)
        return {
            "raw_sender": sender,
            "is_official_header": False,
            "header_entity": None,
            "mismatch_with_claimed": False,
            "errors": [f"Sender check failed ({type(exc).__name__})"],
        }


def real_check_entities(extracted: dict[str, Any]) -> dict[str, Any]:
    """Check extracted entities against live WHOIS and reputation sources.

    Args:
        extracted: The pipeline's ``Extracted`` dictionary. Missing or malformed
            fields are treated as empty lists rather than errors.

    Returns:
        The exact raw-evidence structure expected by ``tools_interface``:
        ``urls``, ``phones``, ``upi`` and ``sender``, with all documented keys
        present on every record.
    """
    if not isinstance(extracted, dict):
        logger.warning("real_check_entities received %s, expected dict", type(extracted))
        extracted = {}

    claimed_organisation = _claimed(extracted)
    urls = _unique_strings(_as_list(extracted.get("urls")), MAX_URLS)
    phones = _unique_strings(_as_list(extracted.get("phone_numbers")), MAX_PHONES)
    upi_ids = _unique_strings(_as_list(extracted.get("upi_ids")), MAX_UPI)

    logger.info(
        "Real entity check: %d url(s), %d phone(s), %d UPI ID(s), providers=%s",
        len(urls),
        len(phones),
        len(upi_ids),
        reputation.configured_providers(),
    )

    if urls:
        workers = min(MAX_URL_WORKERS, len(urls))
        with ThreadPoolExecutor(
            max_workers=workers, thread_name_prefix="scam-shield-entities"
        ) as pool:
            url_records = list(
                pool.map(lambda value: _analyse_url_safe(value, claimed_organisation), urls)
            )
    else:
        url_records = []

    return {
        "urls": url_records,
        "phones": [
            _analyse_phone_safe(phone, claimed_organisation) for phone in phones
        ],
        "upi": [_analyse_upi_safe(upi_id) for upi_id in upi_ids],
        "sender": _analyse_sender_safe(extracted.get("sender"), claimed_organisation),
    }


def _extract_from_text(text: str) -> dict[str, Any]:
    """Build an ``Extracted``-shaped dictionary for the command line."""
    scheme_urls = [match.group(0) for match in _SCHEME_URL_RE.finditer(text)]
    scheme_blob = " ".join(scheme_urls).lower()
    bare_urls = [
        match.group(0)
        for match in _BARE_DOMAIN_RE.finditer(text)
        if match.group(0).lower() not in scheme_blob
    ]
    urls = scheme_urls + bare_urls
    phones = [match.group(0) for match in _PHONE_RE.finditer(text)]
    upi_ids = [match.group(0) for match in _UPI_RE.finditer(text)]
    has_devanagari = any("\u0900" <= ch <= "\u097f" for ch in text)
    return {
        "sender": None,
        "message_text": text,
        "urls": urls,
        "phone_numbers": phones,
        "upi_ids": upi_ids,
        "language": "hi" if has_devanagari else "en",
        "claimed_organisation": None,
        "summary": "",
    }


def main(argv: list[str] | None = None) -> int:
    """Run the real entity checker from the command line.

    Examples:
        ``python -m tools.real https://example.com``
        ``python -m tools.real "Pay to refund.help@ybl or call 9876543210"``
    """
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except Exception:  # noqa: BLE001 - dotenv is optional for the CLI
        pass

    logging.basicConfig(
        level=logging.WARNING,
        format="[%(levelname)s] %(name)s: %(message)s",
    )

    arguments = list(sys.argv[1:] if argv is None else argv)
    text = " ".join(arguments).strip()
    if not text:
        sys.stderr.write(
            "Usage: python -m tools.real <url | message>\n"
            "Example: python -m tools.real https://example.com\n"
        )
        return 2

    extracted = _extract_from_text(text)
    evidence = real_check_entities(extracted)
    sys.stdout.write(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
