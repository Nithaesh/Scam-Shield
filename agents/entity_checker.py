"""Entity Checker Agent: Gathers external intelligence and interprets technical risk."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from agents.llm import call_llm_json
from agents.schemas import Extracted, EntityReport
from tools_interface import check_entities

logger = logging.getLogger("scam_shield.entity_checker")

PROMPT_PATH = Path(__file__).parent / "prompts" / "entity_checker.md"


def _get_system_prompt() -> str:
    """Load entity checker system prompt from disk."""
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text(encoding="utf-8")
    return "You are Entity Checker Agent. Interpret technical evidence into EntityReport JSON."


def check_entities_agent(extracted: Extracted) -> EntityReport:
    """Query intelligence tools for extracted entities and interpret findings with LLM.

    Parameters:
        extracted: Extracted entity metadata.

    Returns:
        EntityReport: Pydantic model with risk score, findings, and unchecked items.
    """
    raw_evidence: dict[str, Any] = {}
    unchecked_items: list[str] = []

    try:
        extracted_dict = extracted.model_dump()
        raw_evidence = check_entities(extracted_dict)
    except Exception as tool_err:
        logger.error("Tools interface execution failed: %s", str(tool_err))
        unchecked_items.append("tools_interface_error")
        raw_evidence = {"error": str(tool_err), "urls": [], "phones": [], "upi": [], "sender": {}}

    # If no entities to check at all, return low risk clean report directly
    if (
        not extracted.urls
        and not extracted.phone_numbers
        and not extracted.upi_ids
        and not extracted.sender
    ):
        return EntityReport(
            status="ok",
            risk_score=0,
            findings=[],
            reasons=["No external URLs, phone numbers, or UPI IDs present in message."],
            unchecked=[],
        )

    system_prompt = _get_system_prompt()
    user_prompt = (
        "Interpret the following raw technical intelligence collected from security tools.\n"
        "Ground your findings and risk score strictly on this evidence:\n\n"
        f"EXTRACTED CONTEXT:\n{json.dumps(extracted.model_dump(), indent=2, ensure_ascii=False)}\n\n"
        f"RAW TECHNICAL EVIDENCE:\n{json.dumps(raw_evidence, indent=2, ensure_ascii=False)}"
    )

    try:
        report = call_llm_json(
            schema=EntityReport,
            system=system_prompt,
            user=user_prompt,
            default_factory=lambda: EntityReport.fallback(reason="LLM interpretation of entity evidence failed."),
        )
        if unchecked_items:
            report.unchecked.extend(unchecked_items)
        return report
    except Exception as e:
        logger.error("Entity Checker agent failed: %s. Returning fallback.", str(e))
        return EntityReport.fallback(reason=f"Exception in entity reasoning: {e}")


if __name__ == "__main__":
    test_input = sys.argv[1] if len(sys.argv) > 1 else "Visit http://sbi-kyc.xyz or call 9876543210"
    from agents.extractor import extract
    extracted_data = extract(test_input)
    res = check_entities_agent(extracted_data)
    print(res.model_dump_json(indent=2))
