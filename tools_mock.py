"""Deterministic mock implementation of entity intelligence tools for Scam Shield."""

from __future__ import annotations

import re
from typing import Any
import tldextract
from rapidfuzz import fuzz

SUSPICIOUS_TLDS = {
    "xyz", "top", "click", "buzz", "work", "site", "vip", "icu",
    "loan", "app", "club", "info", "online", "live", "rest", "cc",
    "cfd", "monster", "sbs", "quest", "link",
}

KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy",
    "goo.gl", "ow.ly", "wa.me", "v.gd", "shorturl.at", "bl.ink",
}

VERIFIED_DOMAINS = {
    "sbi.co.in", "onlinesbi.sbi", "onlinesbi.com",
    "hdfcbank.com", "hdfcbank.net",
    "icicibank.com", "icicibank.co.in",
    "axisbank.com", "pnbindia.in", "bankofbaroda.in",
    "amazon.in", "amazon.com", "flipkart.com",
    "irctc.co.in", "indiapost.gov.in", "incometax.gov.in",
    "uidai.gov.in", "epfindia.gov.in", "cybercrime.gov.in",
    "swiggy.com", "zomato.com", "airtel.in", "jio.com",
}

BRAND_TARGETS = [
    ("sbi", "State Bank of India"),
    ("onlinesbi", "State Bank of India"),
    ("hdfc", "HDFC Bank"),
    ("hdfcbank", "HDFC Bank"),
    ("icici", "ICICI Bank"),
    ("icicibank", "ICICI Bank"),
    ("axis", "Axis Bank"),
    ("paytm", "Paytm"),
    ("amazon", "Amazon"),
    ("flipkart", "Flipkart"),
    ("irctc", "IRCTC"),
    ("indiapost", "India Post"),
    ("uidai", "UIDAI Aadhaar"),
    ("incometax", "Income Tax Department"),
    ("electricity", "State Electricity Board"),
    ("kbc", "Kaun Banega Crorepati"),
]

LEET_REPLACEMENTS = {
    "0": "o",
    "1": "l",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "8": "b",
    "@": "a",
    "vv": "w",
}


def _normalize_leetspeak(text: str) -> str:
    """Normalize common digit-for-letter substitutions."""
    normalized = text.lower()
    for char, rep in LEET_REPLACEMENTS.items():
        normalized = normalized.replace(char, rep)
    return normalized


def _check_url(url: str, claimed_org: str | None = None) -> dict[str, Any]:
    """Analyze a single URL using deterministic heuristics."""
    clean_url = url.strip()
    is_ip = bool(re.search(r"https?://(?:\d{1,3}\.){3}\d{1,3}", clean_url))

    ext = tldextract.extract(clean_url)
    domain = ext.domain.lower()
    tld = ext.suffix.lower()
    registered_domain = f"{domain}.{tld}".strip(".") if domain and tld else domain
    fqdn = f"{ext.subdomain}.{registered_domain}".strip(".") if ext.subdomain else registered_domain

    is_shortener = registered_domain in KNOWN_SHORTENERS or any(clean_url.startswith(f"http://{s}") or clean_url.startswith(f"https://{s}") for s in KNOWN_SHORTENERS)

    # Check verified official domain
    if registered_domain in VERIFIED_DOMAINS:
        return {
            "url": clean_url,
            "domain": registered_domain,
            "tld": tld,
            "is_shortener": False,
            "is_ip_based": False,
            "lookalike_of": None,
            "domain_age_days": 5400,
            "virustotal": {"malicious": 0, "suspicious": 0, "harmless": 88},
            "safe_browsing": {"flagged": False, "threat_type": None},
            "urlhaus": {"flagged": False, "threat": None},
            "errors": [],
        }

    # Lookalike detection
    lookalike_of: str | None = None
    normalized_domain = _normalize_leetspeak(domain)

    for brand_key, brand_name in BRAND_TARGETS:
        # Exact substring or high fuzzy ratio
        if brand_key in normalized_domain or brand_key in domain:
            lookalike_of = brand_name
            break
        ratio = fuzz.ratio(normalized_domain, brand_key)
        if ratio > 80:
            lookalike_of = brand_name
            break

    # Determine if suspicious
    is_suspicious_tld = tld in SUSPICIOUS_TLDS
    has_threat_keywords = any(kw in clean_url.lower() for kw in ["kyc", "block", "verify", "update", "pan", "yono", "reward", "lottery", "apk", "login"])
    is_threat = is_ip or lookalike_of is not None or is_suspicious_tld or (is_shortener and has_threat_keywords)

    if is_threat:
        domain_age = 3 if is_suspicious_tld or lookalike_of else 15
        malicious_count = 12 if lookalike_of else 6
        return {
            "url": clean_url,
            "domain": registered_domain or fqdn or clean_url,
            "tld": tld,
            "is_shortener": is_shortener,
            "is_ip_based": is_ip,
            "lookalike_of": lookalike_of,
            "domain_age_days": domain_age,
            "virustotal": {"malicious": malicious_count, "suspicious": 4, "harmless": 5},
            "safe_browsing": {
                "flagged": True,
                "threat_type": "SOCIAL_ENGINEERING" if lookalike_of else "MALWARE",
            },
            "urlhaus": {"flagged": True, "threat": "phishing" if lookalike_of else "suspicious_download"},
            "errors": [],
        }

    # Shorteners without explicit threat keywords
    if is_shortener:
        return {
            "url": clean_url,
            "domain": registered_domain,
            "tld": tld,
            "is_shortener": True,
            "is_ip_based": False,
            "lookalike_of": None,
            "domain_age_days": 1800,
            "virustotal": {"malicious": 1, "suspicious": 1, "harmless": 70},
            "safe_browsing": {"flagged": False, "threat_type": None},
            "urlhaus": {"flagged": False, "threat": None},
            "errors": [],
        }

    # General unknown domain
    return {
        "url": clean_url,
        "domain": registered_domain or fqdn or clean_url,
        "tld": tld,
        "is_shortener": False,
        "is_ip_based": False,
        "lookalike_of": None,
        "domain_age_days": 320,
        "virustotal": {"malicious": 0, "suspicious": 0, "harmless": 50},
        "safe_browsing": {"flagged": False, "threat_type": None},
        "urlhaus": {"flagged": False, "threat": None},
        "errors": [],
    }


def _check_phone(phone: str, claimed_org: str | None = None) -> dict[str, Any]:
    """Analyze phone numbers for legitimacy or fraud signals."""
    digits_only = re.sub(r"\D", "", phone)
    is_toll_free = digits_only.startswith("1800")
    is_standard_mobile = len(digits_only) == 10 and digits_only[0] in "6789"
    is_with_country = len(digits_only) == 12 and digits_only.startswith("91") and digits_only[2] in "6789"

    is_mobile = is_standard_mobile or is_with_country

    if is_toll_free:
        return {
            "phone": phone,
            "is_valid_format": True,
            "is_shortcode": False,
            "carrier_type": "toll_free",
            "scam_reports_count": 0,
            "reputation": "official_helpline",
            "errors": [],
        }

    # If message claims to be an official bank/police entity but uses personal mobile
    if is_mobile and claimed_org:
        return {
            "phone": phone,
            "is_valid_format": True,
            "is_shortcode": False,
            "carrier_type": "mobile",
            "scam_reports_count": 37,
            "reputation": "reported_fraud",
            "errors": [],
        }

    return {
        "phone": phone,
        "is_valid_format": True,
        "is_shortcode": len(digits_only) <= 6,
        "carrier_type": "mobile" if is_mobile else "unknown",
        "scam_reports_count": 0,
        "reputation": "neutral",
        "errors": [],
    }


def _check_upi(upi_id: str) -> dict[str, Any]:
    """Analyze UPI ID handles for deceptive patterns."""
    parts = upi_id.strip().split("@")
    user = parts[0].lower() if parts else ""
    handle = parts[1].lower() if len(parts) > 1 else ""

    is_impersonation = False
    target_entity: str | None = None

    for brand_key, brand_name in BRAND_TARGETS:
        if brand_key in user and not (brand_key in handle and brand_key in ["paytm", "sbi", "hdfc", "icici"]):
            is_impersonation = True
            target_entity = brand_name
            break

    # Look for deceptive keywords in username
    if any(kw in user for kw in ["refund", "cashback", "lottery", "support", "helpdesk", "kyc"]):
        is_impersonation = True
        if not target_entity:
            target_entity = "Customer Support/Refund Desk"

    return {
        "upi_id": upi_id,
        "handle": handle,
        "user": user,
        "is_impersonation": is_impersonation,
        "target_entity": target_entity,
        "reputation": "high_risk_impersonation" if is_impersonation else "regular_user",
        "errors": [],
    }


def _check_sender(raw_sender: str | None, claimed_org: str | None) -> dict[str, Any]:
    """Check SMS sender ID against TRAI standard patterns and claimed org."""
    if not raw_sender:
        return {
            "raw_sender": None,
            "is_official_header": False,
            "header_entity": None,
            "mismatch_with_claimed": False,
            "errors": [],
        }

    clean_sender = raw_sender.strip().upper()
    # TRAI SMS Header: 2 prefix chars + hyphen/no-hyphen + 6 alphanumeric (e.g. VK-HDFCBK, AX-SBIINB)
    trai_pattern = re.match(r"^[A-Z]{2}-?([A-Z]{6})$", clean_sender)
    is_official_header = bool(trai_pattern)
    header_entity = trai_pattern.group(1) if trai_pattern else None

    # Check mismatch
    mismatch = False
    if claimed_org:
        claimed_clean = claimed_org.upper()
        if is_official_header and header_entity:
            mismatch = not (claimed_clean in header_entity or header_entity[:3] in claimed_clean)
        elif not is_official_header:
            mismatch = True

    return {
        "raw_sender": raw_sender,
        "is_official_header": is_official_header,
        "header_entity": header_entity,
        "mismatch_with_claimed": mismatch,
        "errors": [],
    }


def mock_check_entities(extracted: dict[str, Any]) -> dict[str, Any]:
    """Deterministic entity intelligence analysis for mock testing."""
    claimed_org = extracted.get("claimed_organisation")

    urls = [_check_url(u, claimed_org) for u in extracted.get("urls", [])]
    phones = [_check_phone(p, claimed_org) for p in extracted.get("phone_numbers", [])]
    upi = [_check_upi(u) for u in extracted.get("upi_ids", [])]
    sender = _check_sender(extracted.get("sender"), claimed_org)

    return {
        "urls": urls,
        "phones": phones,
        "upi": upi,
        "sender": sender,
    }
