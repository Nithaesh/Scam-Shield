"""Entity Checker Tools Interface Contract.

=============================================================================
TEAMMATE CONTRACT NOTE:
This module defines the public interface for external entity intelligence tools.
Teammates implementing real services (WHOIS, VirusTotal, Google Safe Browsing,
URLhaus, Truecaller, UPI verification) must preserve this exact function signature
and return dictionary structure so the multi-agent pipeline works without modification.
=============================================================================
"""

import os
import logging
from typing import Any

logger = logging.getLogger("scam_shield.tools_interface")


def check_entities(extracted: dict[str, Any]) -> dict[str, Any]:
    """Check extracted entities against technical intelligence databases.

    Parameters:
        extracted (dict): Dictionary representation of `Extracted` schema:
            {
                "sender": str | None,
                "message_text": str,
                "urls": list[str],
                "phone_numbers": list[str],
                "upi_ids": list[str],
                "language": str,
                "claimed_organisation": str | None,
                "summary": str
            }

    Returns:
        dict: Standardized raw evidence structure containing:
            {
                "urls": [
                    {
                        "url": str,
                        "domain": str,
                        "tld": str,
                        "is_shortener": bool,
                        "is_ip_based": bool,
                        "lookalike_of": str | None,
                        "domain_age_days": int | None,
                        "virustotal": {"malicious": int, "suspicious": int, "harmless": int} | None,
                        "safe_browsing": {"flagged": bool, "threat_type": str | None} | None,
                        "urlhaus": {"flagged": bool, "threat": str | None} | None,
                        "errors": list[str]
                    }
                ],
                "phones": [
                    {
                        "phone": str,
                        "is_valid_format": bool,
                        "is_shortcode": bool,
                        "carrier_type": str,
                        "scam_reports_count": int,
                        "reputation": str,
                        "errors": list[str]
                    }
                ],
                "upi": [
                    {
                        "upi_id": str,
                        "handle": str,
                        "user": str,
                        "is_impersonation": bool,
                        "target_entity": str | None,
                        "reputation": str,
                        "errors": list[str]
                    }
                ],
                "sender": {
                    "raw_sender": str | None,
                    "is_official_header": bool,
                    "header_entity": str | None,
                    "mismatch_with_claimed": bool,
                    "errors": list[str]
                }
            }
    """
    use_mock = os.getenv("USE_MOCK_TOOLS", "1").lower() in ("1", "true", "yes")

    if use_mock:
        from tools_mock import mock_check_entities
        return mock_check_entities(extracted)

    # Teammate implementation plug-in point:
    try:
        # If real tools module exists, teammates can plug it here:
        from tools_real import real_check_entities  # type: ignore[import-not-found]
        return real_check_entities(extracted)
    except ImportError:
        logger.warning("tools_real not found. Falling back to tools_mock.")
        from tools_mock import mock_check_entities
        return mock_check_entities(extracted)
