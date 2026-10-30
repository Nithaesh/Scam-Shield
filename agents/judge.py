"""Judge Agent: Synthesizes behavioral and technical evidence to arbitrate final verdict."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from agents.llm import call_llm_json
from agents.schemas import Extracted, PatternReport, EntityReport, JudgeVerdict

logger = logging.getLogger("scam_shield.judge")

PROMPT_PATH = Path(__file__).parent / "prompts" / "judge.md"


def _get_system_prompt() -> str:
    """Load judge system prompt from disk."""
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text(encoding="utf-8")
    return "You are Judge Agent. Adjudicate verdict into JudgeVerdict JSON."


def adjudicate(
    extracted: Extracted,
    pattern: PatternReport,
    entity: EntityReport,
) -> JudgeVerdict:
    """Arbitrate final scam verdict and resolve conflicting evidence signals.

    Parameters:
        extracted: Extracted message context.
        pattern: Behavioral tactics and score from Pattern Analyst.
        entity: Technical reputation and findings from Entity Checker.

    Returns:
        JudgeVerdict: Pydantic model with final verdict, confidence, and conflict resolutions.
    """
    system_prompt = _get_system_prompt()

    user_payload = {
        "extracted": extracted.model_dump(),
        "pattern_report": pattern.model_dump(),
        "entity_report": entity.model_dump(),
    }

    user_prompt = (
        "Evaluate the following behavioral pattern report and technical entity report. "
        "Apply the arbitration rules and return the final verdict:\n\n"
        f"{json.dumps(user_payload, indent=2, ensure_ascii=False)}"
    )

    try:
        return call_llm_json(
            schema=JudgeVerdict,
            system=system_prompt,
            user=user_prompt,
            default_factory=lambda: JudgeVerdict.fallback(reason="Arbitration LLM failure."),
        )
    except Exception as e:
        logger.error("Judge agent failed: %s. Returning fallback.", str(e))
        return JudgeVerdict.fallback(reason=f"Exception in judge adjudication: {e}")


if __name__ == "__main__":
    test_input = sys.argv[1] if len(sys.argv) > 1 else "Urgent: Your SBI account is blocked. Click http://sbi-kyc.xyz"
    from agents.extractor import extract
    from agents.pattern_analyst import analyze_patterns
    from agents.entity_checker import check_entities_agent

    ext = extract(test_input)
    pat = analyze_patterns(ext)
    ent = check_entities_agent(ext)
    verdict = adjudicate(ext, pat, ent)
    print(verdict.model_dump_json(indent=2))
