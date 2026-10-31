"""Privacy-preserving entity normalization, salted hashing, and community threat matching."""

from __future__ import annotations

import hashlib
import re
from typing import Any
import phonenumbers
import tldextract

from v2.api.config import settings
from v2.api.models.schemas import CommunityLookupMatch


def normalize_entity_value(entity_type: str, raw_val: str) -> str:
    """Normalize raw entity into canonical format before hashing.

    - Phone: E.164 format via phonenumbers (defaults to IN +91)
    - UPI: Lowercase stripped VPA (user@handle)
    - Domain: Registered domain via tldextract (e.g. 'sbi-kyc.xyz' from 'http://login.sbi-kyc.xyz/path')
    """
    clean = raw_val.strip()

    if entity_type == "phone":
        try:
            parsed = phonenumbers.parse(clean, "IN")
            if phonenumbers.is_valid_number(parsed):
                return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        except Exception:
            pass
        # Fallback phone cleanup: strip non-digits, prepend +91 if 10 digits
        digits = re.sub(r"\D", "", clean)
        if len(digits) == 10:
            return f"+91{digits}"
        return f"+{digits}" if digits else clean

    elif entity_type == "upi":
        # Extract user@handle
        match = re.search(r"([a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+)", clean)
        if match:
            return match.group(1).lower()
        return clean.lower()

    elif entity_type == "domain":
        ext = tldextract.extract(clean)
        if ext.domain and ext.suffix:
            return f"{ext.domain}.{ext.suffix}".lower()
        return clean.lower()

    return clean.lower()


def compute_entity_hash(entity_type: str, normalized_val: str, salt: str | None = None) -> str:
    """Compute one-way SHA-256 fingerprint: sha256(HASH_SALT + type:value)."""
    effective_salt = salt or settings.HASH_SALT
    hasher = hashlib.sha256()
    payload = f"{effective_salt}:{entity_type}:{normalized_val}".encode("utf-8")
    hasher.update(payload)
    return hasher.hexdigest()


def mask_entity_for_display(entity_type: str, normalized_val: str) -> str:
    """Mask entity to prevent leaking private information in logs/UI."""
    val = normalized_val.strip()
    if entity_type == "phone":
        if len(val) >= 8:
            return f"{val[:3]}****{val[-3:]}"
        return f"{val[:2]}****"
    elif entity_type == "upi":
        if "@" in val:
            user, handle = val.split("@", 1)
            masked_user = f"{user[:2]}***" if len(user) > 2 else "***"
            return f"{masked_user}@{handle}"
        return "***"
    elif entity_type == "domain":
        if "." in val:
            parts = val.split(".", 1)
            masked_name = f"{parts[0][:3]}***" if len(parts[0]) > 3 else "***"
            return f"{masked_name}.{parts[1]}"
        return "***"
    return "***"


def check_community_escalation(
    current_verdict: str,
    matches: list[CommunityLookupMatch],
    escalation_enabled: bool = False,
) -> tuple[str, str | None]:
    """Check if 3 or more community reports require raising 'safe' to 'suspicious'.

    Rules:
    - Never lowers a risk verdict (never turns scam -> safe).
    - If current_verdict == 'safe' and any entity has >= 3 reports: escalates to 'suspicious'.
    """
    if not escalation_enabled or not matches:
        return current_verdict, None

    max_reports = max((m.report_count for m in matches), default=0)
    if max_reports >= 3 and current_verdict.lower() == "safe":
        note = (
            f"Escalated from 'safe' to 'suspicious': entity has {max_reports} "
            f"verified reports in the citizen fraud intelligence registry."
        )
        return "suspicious", note

    return current_verdict, None
