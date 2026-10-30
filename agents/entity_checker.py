"""Entity Checker Agent: Gathers external intelligence and interprets technical risk."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from agents.llm import call_llm_json
from agents.schemas import EntityFinding, EntityReport, Extracted
from tools_interface import check_entities

logger = logging.getLogger("scam_shield.entity_checker")

PROMPT_PATH = Path(__file__).parent / "prompts" / "entity_checker.md"


def _get_system_prompt() -> str:
    """Load entity checker system prompt from disk."""
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text(encoding="utf-8")
    return "You are Entity Checker Agent. Interpret technical evidence into EntityReport JSON."


def _synthesize_entity_report_from_evidence(raw_evidence: dict[str, Any], unchecked: list[str]) -> EntityReport:
    """Deterministic fallback synthesizer when LLM reasoning is offline."""
    findings: list[EntityFinding] = []
    reasons: list[str] = []
    max_risk = 0

    # URLs
    for u in raw_evidence.get("urls", []):
        url = u.get("url", "")
        lookalike = u.get("lookalike_of")
        vt = u.get("virustotal") or {}
        sb = u.get("safe_browsing") or {}
        is_short = u.get("is_shortener", False)
        is_ip = u.get("is_ip_based", False)
        domain_age = u.get("domain_age_days")

        if lookalike:
            findings.append(EntityFinding(
                entity=url,
                type="url",
                signal=f"Deceptive lookalike domain imitating {lookalike}",
                severity="high",
                source="lookalike_detection",
            ))
            reasons.append(f"URL imitates {lookalike}")
            max_risk = max(max_risk, 95)
        elif vt.get("malicious", 0) >= 3 or sb.get("flagged"):
            findings.append(EntityFinding(
                entity=url,
                type="url",
                signal="Domain confirmed malicious on VirusTotal or Google Safe Browsing",
                severity="high",
                source="security_intelligence",
            ))
            reasons.append(f"Domain flagged as malicious or phishing: {url}")
            max_risk = max(max_risk, 90)
        elif is_ip:
            findings.append(EntityFinding(
                entity=url,
                type="url",
                signal="Raw IP-based URL hosting potential malware",
                severity="high",
                source="ip_heuristic",
            ))
            max_risk = max(max_risk, 85)
        elif is_short:
            findings.append(EntityFinding(
                entity=url,
                type="url",
                signal="Shortened link masking final destination",
                severity="medium",
                source="shortener_detection",
            ))
            reasons.append("Shortened link used without destination visibility.")
            max_risk = max(max_risk, 50)
        elif domain_age and domain_age > 365:
            findings.append(EntityFinding(
                entity=url,
                type="url",
                signal="Established domain with clean security reputation",
                severity="low",
                source="whois_reputation",
            ))

    # Phones
    for p in raw_evidence.get("phones", []):
        rep = p.get("reputation", "")
        phone = p.get("phone", "")
        if rep == "reported_fraud":
            findings.append(EntityFinding(
                entity=phone,
                type="phone",
                signal="Personal mobile used to issue institutional banking alerts with prior fraud reports",
                severity="high",
                source="telecom_intelligence",
            ))
            reasons.append(f"Suspicious phone number: {phone}")
            max_risk = max(max_risk, 80)
        elif rep == "official_helpline":
            findings.append(EntityFinding(
                entity=phone,
                type="phone",
                signal="Official toll-free helpline number",
                severity="low",
                source="telecom_whitelist",
            ))

    # UPI
    for upi in raw_evidence.get("upi", []):
        if upi.get("is_impersonation"):
            findings.append(EntityFinding(
                entity=upi.get("upi_id", ""),
                type="upi",
                signal=f"Deceptive UPI handle imitating {upi.get('target_entity')}",
                severity="high",
                source="upi_handle_analyzer",
            ))
            reasons.append(f"Deceptive UPI ID: {upi.get('upi_id')}")
            max_risk = max(max_risk, 90)

    # Sender
    sender_info = raw_evidence.get("sender") or {}
    if sender_info.get("mismatch_with_claimed"):
        findings.append(EntityFinding(
            entity=str(sender_info.get("raw_sender", "")),
            type="sender",
            signal="Sender header does not match claimed financial/government institution",
            severity="medium",
            source="trai_header_check",
        ))
        reasons.append("Sender identity does not match claimed organization.")
        max_risk = max(max_risk, 60)
    elif sender_info.get("is_official_header"):
        findings.append(EntityFinding(
            entity=str(sender_info.get("raw_sender", "")),
            type="sender",
            signal="Verified TRAI official commercial SMS header",
            severity="low",
            source="trai_header_check",
        ))

    if not reasons:
        reasons = ["Entity checks completed with neutral reputation."]

    return EntityReport(
        status="ok",
        risk_score=max_risk,
        findings=findings,
        reasons=reasons,
        unchecked=unchecked,
    )


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
            default_factory=lambda: _synthesize_entity_report_from_evidence(raw_evidence, unchecked_items),
        )
        if unchecked_items:
            report.unchecked.extend(unchecked_items)
        return report
    except Exception as e:
        logger.error("Entity Checker agent failed: %s. Returning fallback.", str(e))
        return _synthesize_entity_report_from_evidence(raw_evidence, unchecked_items)


if __name__ == "__main__":
    test_input = sys.argv[1] if len(sys.argv) > 1 else "Visit http://sbi-kyc.xyz or call 9876543210"
    from agents.extractor import extract
    extracted_data = extract(test_input)
    res = check_entities_agent(extracted_data)
    print(res.model_dump_json(indent=2))
