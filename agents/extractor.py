"""Extractor Agent: Extracts structured entities and metadata from text or screenshot."""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from agents.llm import call_llm_json
from agents.schemas import Extracted

logger = logging.getLogger("scam_shield.extractor")

PROMPT_PATH = Path(__file__).parent / "prompts" / "extractor.md"


def _get_system_prompt() -> str:
    """Load extractor system prompt from disk."""
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text(encoding="utf-8")
    return "Extract structured entities into Extracted schema. Output ONLY valid JSON."


def extract(
    input_data: str | bytes,
    image_mime_type: str = "image/png",
) -> Extracted:
    """Extract entities and metadata from text or image bytes.

    Parameters:
        input_data: Raw text string or image file bytes.
        image_mime_type: MIME type of image if input_data is bytes.

    Returns:
        Extracted: Pydantic model populated with extracted entities.
    """
    system_prompt = _get_system_prompt()

    try:
        if isinstance(input_data, bytes):
            logger.info("Extracting entities from image input via vision.")
            user_prompt = "Perform OCR on this image and extract all entities, text, links, and sender into the Extracted schema."
            return call_llm_json(
                schema=Extracted,
                system=system_prompt,
                user=user_prompt,
                image=input_data,
                image_mime_type=image_mime_type,
                default_factory=lambda: Extracted.fallback(message_text="[Image input could not be OCR-parsed]"),
            )
        else:
            text_str = str(input_data)
            logger.info("Extracting entities from text input (%d chars).", len(text_str))
            user_prompt = f"Analyze and extract entities from the following input message:\n\n---\n{text_str}\n---"
            return call_llm_json(
                schema=Extracted,
                system=system_prompt,
                user=user_prompt,
                default_factory=lambda: Extracted.fallback(message_text=text_str),
            )
    except Exception as e:
        logger.error("Extractor agent failed: %s. Returning fallback.", str(e))
        fallback_text = str(input_data) if isinstance(input_data, str) else "[Binary image data]"
        return Extracted.fallback(message_text=fallback_text)


if __name__ == "__main__":
    test_input = sys.argv[1] if len(sys.argv) > 1 else "SBI Alert: Your account is blocked due to KYC. Update here: http://sbi-kyc.xyz or call 9876543210"
    res = extract(test_input)
    print(res.model_dump_json(indent=2))
