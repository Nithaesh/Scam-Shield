"""UPI ID analysis for deceptive or impersonating payment handles.

UPI handles are parsed locally. No payment API is called and no money movement
is possible from this module.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Final
from urllib.parse import parse_qs, urlsplit

from tools import brands

logger = logging.getLogger("scam_shield.tools.upi_checks")

#: Well-known UPI payment-service-provider handles and the app behind them.
KNOWN_HANDLES: Final[dict[str, str]] = {
    "ybl": "PhonePe",
    "ibl": "PhonePe",
    "axl": "Axis Bank",
    "okhdfcbank": "Google Pay",
    "okicici": "Google Pay",
    "oksbi": "Google Pay",
    "okaxis": "Google Pay",
    "paytm": "Paytm",
    "apl": "Amazon Pay",
    "upi": "BHIM",
    "barodampay": "Bank of Baroda",
    "idfcbank": "IDFC FIRST Bank",
    "kotak": "Kotak Bank",
    "fbl": "Federal Bank",
    "rbl": "RBL Bank",
    "yesbank": "Yes Bank",
    "indus": "IndusInd Bank",
    "airtel": "Airtel Payments Bank",
    "freecharge": "FreeCharge",
    "mobikwik": "MobiKwik",
    "jupiteraxis": "Jupiter",
    "slice": "Slice",
    "naviaxis": "Navi",
    "timecosmos": "Time Cosmos",
}

_USER_RE: Final[re.Pattern[str]] = re.compile(r"^[a-z0-9][a-z0-9._-]{1,255}$")
_HANDLE_RE: Final[re.Pattern[str]] = re.compile(r"^[a-z][a-z0-9.-]{1,63}$")

_DECEPTIVE_KEYWORDS: Final[tuple[tuple[str, str], ...]] = (
    ("refund", "Refund Desk"),
    ("cashback", "Cashback Desk"),
    ("lottery", "Lottery Desk"),
    ("prize", "Prize Desk"),
    ("reward", "Rewards Desk"),
    ("support", "Customer Support"),
    ("helpdesk", "Customer Support"),
    ("help", "Customer Support"),
    ("customercare", "Customer Support"),
    ("kyc", "KYC Verification Desk"),
    ("verify", "Verification Desk"),
    ("verification", "Verification Desk"),
    ("official", "Official Desk"),
    ("update", "Account Update Desk"),
    ("alert", "Security Alert Desk"),
    ("secure", "Security Desk"),
)

_LEET_REPLACEMENTS: Final[dict[str, str]] = {
    "0": "o",
    "1": "l",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "8": "b",
}


def _compact(value: str) -> str:
    base = "".join(ch for ch in str(value or "").lower() if ch.isalnum())
    return "".join(_LEET_REPLACEMENTS.get(ch, ch) for ch in base)


def _extract_upi(raw: str) -> str:
    """Pull ``pa=`` out of a ``upi://pay?...`` URI, otherwise return the input."""
    text = str(raw or "").strip()
    if text.lower().startswith("upi://"):
        try:
            query = parse_qs(urlsplit(text).query)
            candidate = (query.get("pa") or [""])[0]
            if candidate:
                return candidate.strip()
        except (ValueError, UnicodeError):
            pass
    return text


def _impersonation_target(user: str) -> str | None:
    """Return the entity a UPI username appears to imitate, if any."""
    compact = _compact(user)
    if not compact:
        return None
    segments = {part for part in re.split(r"[^a-z0-9]+", user.lower()) if part}
    for brand in brands.BRANDS:
        for token in brand.tokens:
            if token in segments or (len(token) >= 4 and token in compact):
                return brand.name
        for token in brand.exact_tokens:
            if token == compact or token in segments:
                return brand.name
    for keyword, label in _DECEPTIVE_KEYWORDS:
        if keyword in compact:
            return label
    return None


def analyse_upi(upi_id: str) -> dict[str, Any]:
    """Analyse one UPI ID and return the contract-shaped dictionary."""
    original = str(upi_id or "").strip()
    candidate = _extract_upi(original)
    errors: list[str] = []

    if candidate.count("@") != 1:
        return {
            "upi_id": original,
            "handle": "",
            "user": "",
            "is_impersonation": False,
            "target_entity": None,
            "reputation": "invalid_format",
            "errors": ["UPI ID must contain exactly one '@'"],
        }

    raw_user, raw_handle = candidate.split("@", 1)
    user = raw_user.strip().lower()
    handle = raw_handle.strip().lower()

    if not user or not handle:
        return {
            "upi_id": original,
            "handle": handle,
            "user": user,
            "is_impersonation": False,
            "target_entity": None,
            "reputation": "invalid_format",
            "errors": ["UPI ID has an empty username or handle"],
        }

    if not _USER_RE.match(user):
        errors.append("UPI username contains unusual characters")
    if not _HANDLE_RE.match(handle):
        errors.append("UPI handle contains unusual characters")
    if "." not in handle and handle not in KNOWN_HANDLES:
        errors.append("Unrecognised UPI payment provider handle")

    target = _impersonation_target(user)
    is_impersonation = target is not None
    if is_impersonation:
        reputation = "high_risk_impersonation"
    elif any("unusual characters" in error for error in errors):
        reputation = "invalid_format"
    elif errors:
        reputation = "unverified_handle"
    else:
        reputation = "regular_user"

    logger.debug(
        "UPI check: handle=%s provider=%s impersonation=%s",
        handle,
        KNOWN_HANDLES.get(handle, "unknown"),
        is_impersonation,
    )
    return {
        "upi_id": original,
        "handle": handle,
        "user": user,
        "is_impersonation": is_impersonation,
        "target_entity": target,
        "reputation": reputation,
        "errors": errors,
    }
