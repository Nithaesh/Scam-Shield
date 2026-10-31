"""Phone-number analysis using Google's libphonenumber data.

The module validates numbers, classifies them (mobile, landline, toll-free,
shortcode) and applies conservative reputation labels. No paid phone-reputation
database is bundled, so the report count stays at zero and the limitation is
stated in ``errors`` rather than invented.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Final

import phonenumbers
from phonenumbers import NumberParseException, PhoneNumberFormat, PhoneNumberType

logger = logging.getLogger("scam_shield.tools.phone_checks")

REGION: Final[str] = "IN"

_TYPE_LABELS: Final[dict[int, str]] = {
    PhoneNumberType.MOBILE: "mobile",
    PhoneNumberType.FIXED_LINE: "landline",
    PhoneNumberType.FIXED_LINE_OR_MOBILE: "landline_or_mobile",
    PhoneNumberType.TOLL_FREE: "toll_free",
    PhoneNumberType.PREMIUM_RATE: "premium_rate",
    PhoneNumberType.SHARED_COST: "shared_cost",
    PhoneNumberType.VOIP: "voip",
    PhoneNumberType.PERSONAL_NUMBER: "personal_number",
    PhoneNumberType.PAGER: "pager",
    PhoneNumberType.UAN: "uan",
    PhoneNumberType.VOICEMAIL: "voicemail",
    PhoneNumberType.UNKNOWN: "unknown",
}

_TOLL_FREE_PREFIXES: Final[tuple[str, ...]] = ("1800", "1860", "1600")

_NO_PROVIDER_NOTE: Final[str] = (
    "No phone-report provider configured; scam_reports_count is not a clearance"
)


def _digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def _format_e164(number: phonenumbers.PhoneNumber) -> str:
    try:
        return phonenumbers.format_number(number, PhoneNumberFormat.E164)
    except Exception:  # noqa: BLE001 - formatting is cosmetic
        return ""


def analyse_phone(phone: str, claimed_organisation: str | None = None) -> dict[str, Any]:
    """Analyse one phone number and return the contract-shaped dictionary."""
    raw = str(phone or "").strip()
    digits = _digits(raw)
    errors: list[str] = []

    if not raw or not digits:
        return {
            "phone": raw,
            "is_valid_format": False,
            "is_shortcode": False,
            "carrier_type": "unknown",
            "scam_reports_count": 0,
            "reputation": "invalid_format",
            "errors": ["Phone number is empty or has no digits"],
        }

    # Indian SMS shortcodes are 4-6 digits and never carry a country code.
    if len(digits) <= 6 and not raw.startswith("+"):
        return {
            "phone": raw,
            "is_valid_format": True,
            "is_shortcode": True,
            "carrier_type": "short_code",
            "scam_reports_count": 0,
            "reputation": "shortcode",
            "errors": [],
        }

    parsed: phonenumbers.PhoneNumber | None = None
    try:
        parsed = phonenumbers.parse(raw, None if raw.startswith("+") else REGION)
    except NumberParseException as exc:
        errors.append(f"Could not parse phone number ({exc.error_type.name})")

    is_valid = bool(parsed and phonenumbers.is_valid_number(parsed))
    carrier_type = "unknown"
    if parsed is not None:
        carrier_type = _TYPE_LABELS.get(phonenumbers.number_type(parsed), "unknown")
        if not is_valid:
            errors.append("Number is not valid for its region")

    is_toll_free = digits.startswith(_TOLL_FREE_PREFIXES) or carrier_type == "toll_free"
    if is_toll_free:
        carrier_type = "toll_free"

    if is_toll_free:
        reputation = "official_helpline"
    elif carrier_type == "premium_rate":
        reputation = "premium_rate_number"
    elif carrier_type == "mobile" and claimed_organisation:
        reputation = "personal_mobile_claimed_official"
    elif not is_valid:
        reputation = "invalid_format"
    else:
        reputation = "neutral"

    if not is_toll_free:
        errors.append(_NO_PROVIDER_NOTE)

    logger.debug(
        "Phone check: type=%s valid=%s reputation=%s e164=%s",
        carrier_type,
        is_valid,
        reputation,
        _format_e164(parsed) if parsed else "",
    )
    return {
        "phone": raw,
        "is_valid_format": is_valid,
        "is_shortcode": False,
        "carrier_type": carrier_type,
        "scam_reports_count": 0,
        "reputation": reputation,
        "errors": errors,
    }
