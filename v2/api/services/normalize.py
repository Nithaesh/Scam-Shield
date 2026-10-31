"""Input text normalization, sanitation, and language detection."""

from __future__ import annotations

import re
import unicodedata

# Unicode range for Devanagari script: U+0900 to U+097F
DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")

# Invisible, null, and zero-width characters to strip
ZERO_WIDTH_REGEX = re.compile(
    r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]"
)


def normalize_text(text: str | None, max_chars: int = 5000) -> str:
    """Sanitize and normalize untrusted user text input.

    - Applies Unicode Normalization Form C (NFC)
    - Strips null bytes and invisible zero-width characters
    - Trims leading/trailing whitespace
    - Clamps to max_chars limit safely
    """
    if not text:
        return ""

    # Normalize unicode to standard composed form
    normalized = unicodedata.normalize("NFC", text)

    # Strip null bytes and zero-width characters
    cleaned = ZERO_WIDTH_REGEX.sub("", normalized)

    # Strip surrounding whitespace
    trimmed = cleaned.strip()

    # Enforce maximum character boundary
    if len(trimmed) > max_chars:
        trimmed = trimmed[:max_chars]

    return trimmed


def detect_devanagari(text: str) -> bool:
    """Return True if text contains significant Devanagari (Hindi) script characters."""
    if not text:
        return False
    # If text has 3 or more Devanagari characters, consider it Hindi
    matches = DEVANAGARI_REGEX.findall(text)
    return len(matches) >= 3


def resolve_language(requested: str, text: str) -> str:
    """Resolve 'auto' language choice into concrete 'en' or 'hi'."""
    req = (requested or "auto").strip().lower()
    if req in ("en", "hi"):
        return req
    return "hi" if detect_devanagari(text) else "en"
