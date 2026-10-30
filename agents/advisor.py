"""Advisor Agent: Produces empathetic, actionable safety advice in Hindi or English."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from agents.llm import call_llm_json
from agents.schemas import Advice, Extracted, JudgeVerdict

logger = logging.getLogger("scam_shield.advisor")

PROMPT_PATH = Path(__file__).parent / "prompts" / "advisor.md"


def _get_system_prompt() -> str:
    """Load advisor system prompt from disk."""
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text(encoding="utf-8")
    return "You are Advisor Agent. Generate simple safety guidance into Advice JSON."


def advise(
    verdict: JudgeVerdict,
    extracted: Extracted,
    requested_language: str = "auto",
) -> Advice:
    """Generate simple, actionable safety advice for ordinary citizens in Hindi or English.

    Parameters:
        verdict: Adjudicated verdict from the Judge agent.
        extracted: Extracted message details and claimed organisation.
        requested_language: "auto", "en", or "hi".

    Returns:
        Advice: Pydantic model with headline, do_not, do_next, report_to, and plain_summary.
    """
    # Language resolution:
    if requested_language == "hi":
        target_lang = "hi"
    elif requested_language == "en":
        target_lang = "en"
    else:
        # "auto": if message is Hindi or Hinglish, default to Hindi, else English
        if extracted.language in ("hi", "hinglish"):
            target_lang = "hi"
        else:
            target_lang = "en"

    system_prompt = _get_system_prompt()

    user_payload = {
        "verdict": verdict.model_dump(),
        "extracted": extracted.model_dump(),
        "target_language": target_lang,
    }

    user_prompt = (
        f"Generate safety advice for the recipient in target language '{target_lang}'. "
        f"Keep all lists to a MAXIMUM of 3 items. Include 1930 and cybercrime.gov.in for threats.\n\n"
        f"CONTEXT:\n{json.dumps(user_payload, indent=2, ensure_ascii=False)}"
    )

    try:
        adv = call_llm_json(
            schema=Advice,
            system=system_prompt,
            user=user_prompt,
            default_factory=lambda: Advice.fallback(language=target_lang),
        )
        # Enforce max 3 items as hard guarantee
        adv.do_not = adv.do_not[:3]
        adv.do_next = adv.do_next[:3]
        return adv
    except Exception as e:
        logger.error("Advisor agent failed: %s. Returning fallback.", str(e))
        return Advice.fallback(language=target_lang)


if __name__ == "__main__":
    test_input = sys.argv[1] if len(sys.argv) > 1 else "SBI Alert: Your account is blocked. Update KYC at http://sbi-kyc.xyz"
    from agents.extractor import extract
    from agents.pattern_analyst import analyze_patterns
    from agents.entity_checker import check_entities_agent
    from agents.judge import adjudicate

    ext = extract(test_input)
    pat = analyze_patterns(ext)
    ent = check_entities_agent(ext)
    j_verdict = adjudicate(ext, pat, ent)
    res = advise(j_verdict, ext)
    print(res.model_dump_json(indent=2))
