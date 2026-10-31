"""TRAI SMS sender-header validation.

Indian commercial SMS senders use a six-character alphabetic header, often with
a two-character operator prefix (``VK-HDFCBK``). Numeric senders cannot be an
official commercial header. The check is purely local.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Final

from tools import brands

logger = logging.getLogger("scam_shield.tools.sender_checks")

_HEADER_PATTERNS: Final[tuple[re.Pattern[str], ...]] = (
    re.compile(r"^[A-Z]{2}-[A-Z0-9]{6}$"),
    re.compile(r"^[A-Z]{2}[A-Z0-9]{6}$"),
    re.compile(r"^[A-Z]{6}$"),
)

_STOPWORDS: Final[frozenset[str]] = frozenset(
    {
        "bank",
        "limited",
        "ltd",
        "pvt",
        "private",
        "india",
        "indian",
        "of",
        "the",
        "and",
        "for",
        "services",
        "service",
        "department",
        "government",
        "govt",
        "corporation",
        "company",
        "official",
        "team",
        "support",
    }
)


def _header_entity(clean_sender: str) -> str | None:
    """Return the six-character entity part of an official header."""
    if not any(pattern.match(clean_sender) for pattern in _HEADER_PATTERNS):
        return None
    compact = re.sub(r"[^A-Z0-9]", "", clean_sender)
    return compact[-6:]


def _claim_words(claimed: str) -> list[str]:
    """Split a claimed organisation into significant lowercase words."""
    return [
        word
        for word in re.split(r"[^A-Za-z0-9]+", claimed.lower())
        if len(word) >= 3 and word not in _STOPWORDS
    ]


def _header_matches_claim(header: str, claimed: str) -> bool:
    """Return True when the sender header plausibly belongs to the claim."""
    header_lower = re.sub(r"[^a-z0-9]", "", header.lower())
    if not header_lower:
        return False

    brand = brands.brand_for_name(claimed)
    if brand is not None:
        aliases = {
            re.sub(r"[^a-z0-9]", "", alias.lower())
            for alias in brand.tokens + brand.exact_tokens
        }
        aliases.add(re.sub(r"[^a-z0-9]", "", brand.name.lower()))
        for alias in aliases:
            if len(alias) >= 3 and header_lower.startswith(alias):
                return True
            if len(alias) >= 5 and alias in header_lower:
                return True

    words = _claim_words(claimed)
    if words:
        acronym = "".join(word[0] for word in words)
        if len(acronym) >= 2 and header_lower.startswith(acronym):
            return True
        first = words[0]
        if len(first) >= 4 and (
            header_lower.startswith(first[:4]) or first.startswith(header_lower[:4])
        ):
            return True

    compact_claim = re.sub(r"[^a-z0-9]", "", claimed.lower())
    return len(compact_claim) >= 4 and compact_claim.startswith(header_lower[:4])


def analyse_sender(
    raw_sender: str | None,
    claimed_organisation: str | None = None,
) -> dict[str, Any]:
    """Analyse an SMS sender ID and return the contract-shaped dictionary."""
    sender = str(raw_sender or "").strip()
    claimed = str(claimed_organisation or "").strip()

    if not sender:
        return {
            "raw_sender": None,
            "is_official_header": False,
            "header_entity": None,
            "mismatch_with_claimed": False,
            "errors": [],
        }

    clean = sender.upper().replace(" ", "")
    header_entity = _header_entity(clean)
    is_official = header_entity is not None

    mismatch = False
    errors: list[str] = []
    if claimed:
        if is_official:
            mismatch = not _header_matches_claim(header_entity or "", claimed)
        else:
            mismatch = True
            errors.append("Sender is not an official six-character TRAI header")

    logger.debug(
        "Sender check: header=%s official=%s mismatch=%s",
        header_entity,
        is_official,
        mismatch,
    )
    return {
        "raw_sender": sender,
        "is_official_header": is_official,
        "header_entity": header_entity,
        "mismatch_with_claimed": mismatch,
        "errors": errors,
    }
