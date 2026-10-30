"""Pattern Analyst Agent: Identifies psychological manipulation and scam patterns."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from agents.llm import call_llm_json
from agents.schemas import Extracted, PatternReport

logger = logging.getLogger("scam_shield.pattern_analyst")

PROMPT_PATH = Path(__file__).parent / "prompts" / "pattern_analyst.md"
KNOWLEDGE_PATH = Path(__file__).parent.parent / "knowledge" / "scam_patterns.md"


def _get_system_prompt() -> str:
    """Load system prompt and inject scam patterns knowledge base."""
    base_prompt = ""
    if PROMPT_PATH.exists():
        base_prompt = PROMPT_PATH.read_text(encoding="utf-8")
    else:
        base_prompt = "You are Pattern Analyst Agent. Return PatternReport JSON."

    knowledge_text = ""
    if KNOWLEDGE_PATH.exists():
        knowledge_text = KNOWLEDGE_PATH.read_text(encoding="utf-8")
    else:
        knowledge_text = "Standard India scam patterns: KYC threat, electricity cut, KBC lottery, digital arrest."

    return base_prompt.replace("{{SCAM_PATTERNS_KNOWLEDGE}}", knowledge_text)


def analyze_patterns(extracted: Extracted) -> PatternReport:
    """Analyze manipulation tactics and score fraud patterns.

    Parameters:
        extracted: Output from Extractor agent.

    Returns:
        PatternReport: Pydantic model with scam tactics and score.
    """
    system_prompt = _get_system_prompt()

    user_payload = {
        "sender": extracted.sender,
        "message_text": extracted.message_text,
        "claimed_organisation": extracted.claimed_organisation,
        "urls": extracted.urls,
        "phone_numbers": extracted.phone_numbers,
        "upi_ids": extracted.upi_ids,
        "language": extracted.language,
        "summary": extracted.summary,
    }

    user_prompt = (
        "Analyze the following extracted message data for manipulation tactics, urgency, fear, "
        "and scam indicators:\n\n"
        f"{json.dumps(user_payload, indent=2, ensure_ascii=False)}"
    )

    try:
        return call_llm_json(
            schema=PatternReport,
            system=system_prompt,
            user=user_prompt,
            default_factory=lambda: PatternReport.fallback(reason="Pattern analysis LLM failure."),
        )
    except Exception as e:
        logger.error("Pattern Analyst agent failed: %s. Returning fallback.", str(e))
        return PatternReport.fallback(reason=f"Exception in pattern analysis: {e}")


if __name__ == "__main__":
    test_input = sys.argv[1] if len(sys.argv) > 1 else "Dear consumer your electricity power will be disconnected tonight at 9:30 pm from electricity office. Immediately call officer at 9876543210"
    from agents.extractor import extract
    extracted_data = extract(test_input)
    res = analyze_patterns(extracted_data)
    print(res.model_dump_json(indent=2))
