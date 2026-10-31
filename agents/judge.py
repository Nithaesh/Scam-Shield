"""Judge Agent: Synthesizes behavioral and technical evidence to arbitrate final verdict."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from agents.llm import call_llm_json
from agents.schemas import Conflict, Extracted, PatternReport, EntityReport, JudgeVerdict

logger = logging.getLogger("scam_shield.judge")

PROMPT_PATH = Path(__file__).parent / "prompts" / "judge.md"


def calibrate_verdict(
    verdict: JudgeVerdict,
    extracted: Extracted,
    pattern: PatternReport,
    entity: EntityReport,
) -> JudgeVerdict:
    """Enforce deterministic, language-invariant confidence calibration.

    Eliminates cross-lingual variance between English, Hindi, and Hinglish
    by anchoring confidence to objective technical and behavioral evidence thresholds.
    """
    has_lookalike = any(f.type == "url" and "lookalike" in f.signal.lower() for f in entity.findings)
    has_otp_pin = "otp_request" in pattern.tactics or "pin_request" in pattern.tactics
    has_apk = any(u.endswith(".apk") for u in extracted.urls) or (
        "click_pressure" in pattern.tactics and any(".apk" in r.lower() for r in pattern.reasons)
    )
    has_fake_upi = any(f.type == "upi" and f.severity == "high" for f in entity.findings)
    has_disconnection = "fear" in pattern.tactics and "urgency" in pattern.tactics
    has_high_threat = any(f.severity == "high" for f in entity.findings)
    has_medium_threats = any(f.severity == "medium" for f in entity.findings)

    if verdict.verdict == "scam":
        # Anchor definitive red lines to 98%
        if has_lookalike or has_otp_pin or has_apk or has_fake_upi:
            verdict.confidence = 98
        # Anchor severe threats (disconnection, digital arrest, KYC block) to 95%
        elif has_high_threat or has_disconnection or pattern.score >= 75 or entity.risk_score >= 70:
            verdict.confidence = max(verdict.confidence, 95)
        else:
            verdict.confidence = max(verdict.confidence, 90)
    elif verdict.verdict == "safe":
        # Clean transaction notifications with verified header or zero threats
        if pattern.score <= 10 and entity.risk_score <= 10 and not has_high_threat and not has_medium_threats:
            verdict.confidence = 95
        else:
            verdict.confidence = max(verdict.confidence, 90)
    elif verdict.verdict == "suspicious":
        # Unverified shorteners or moderate ambiguous pressure
        verdict.confidence = 75

    return verdict


def _synthesize_verdict_fallback(
    extracted: Extracted,
    pattern: PatternReport,
    entity: EntityReport,
) -> JudgeVerdict:
    """Deterministic arbitration when LLM adjudication is offline."""
    key_evidence: list[str] = []
    conflicts: list[Conflict] = []

    # Check high-severity entity findings
    high_threat_entities = [f for f in entity.findings if f.severity == "high"]
    has_otp_pin = "otp_request" in pattern.tactics or "pin_request" in pattern.tactics
    has_remote_app = "remote_access_request" in pattern.tactics
    has_apk = any(u.endswith(".apk") for u in extracted.urls) or "click_pressure" in pattern.tactics

    # Red lines & Scam triggers
    has_medium_threats = any(f.severity == "medium" for f in entity.findings)
    if high_threat_entities or has_otp_pin or has_remote_app or has_apk or pattern.score >= 50 or entity.risk_score >= 60:
        for f in high_threat_entities:
            key_evidence.append(f"{f.type.upper()} threat: {f.signal}")
        if has_otp_pin:
            key_evidence.append("Critical red line: Sensitive OTP/PIN credential request detected.")
        if has_remote_app:
            key_evidence.append("Critical red line: Solicitation of remote desktop screen-sharing.")
        if has_apk:
            key_evidence.append("Malicious third-party Android APK download detected.")
        if pattern.reasons:
            key_evidence.extend(pattern.reasons[:2])

        confidence = min(98, max(pattern.score, entity.risk_score, 88))
        raw_verdict = JudgeVerdict(
            verdict="scam",
            confidence=confidence,
            reasoning="Severe fraud signals confirmed across behavioral patterns and technical entity analysis.",
            conflicts=[],
            key_evidence=key_evidence[:4],
        )
        return calibrate_verdict(raw_verdict, extracted, pattern, entity)

    # Safe criteria: low risk and absence of any threat findings
    if pattern.score <= 15 and entity.risk_score <= 15 and not high_threat_entities and not has_medium_threats:
        raw_verdict = JudgeVerdict(
            verdict="safe",
            confidence=92,
            reasoning="Message conforms to standard legitimate notifications with no suspicious links, credentials, or threats.",
            conflicts=[],
            key_evidence=["Clean entity reputation", "Routine message format without urgency or extortion tactics"],
        )
        return calibrate_verdict(raw_verdict, extracted, pattern, entity)

    # Suspicious criteria
    conflicts.append(Conflict(
        description="Unverified message with moderate risk indicators or masked shortener link.",
        resolution="Arbitrated as suspicious requiring extra caution.",
    ))
    raw_verdict = JudgeVerdict(
        verdict="suspicious",
        confidence=65,
        reasoning="Ambiguous indicators detected. Sender identity or destination link cannot be conclusively verified.",
        conflicts=conflicts,
        key_evidence=["Shortened link or unverified sender identity", "Moderate behavioral pressure"],
    )
    return calibrate_verdict(raw_verdict, extracted, pattern, entity)


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
        raw_verdict = call_llm_json(
            schema=JudgeVerdict,
            system=system_prompt,
            user=user_prompt,
            default_factory=lambda: _synthesize_verdict_fallback(extracted, pattern, entity),
        )
        return calibrate_verdict(raw_verdict, extracted, pattern, entity)
    except Exception as e:
        logger.error("Judge agent failed: %s. Returning fallback.", str(e))
        return _synthesize_verdict_fallback(extracted, pattern, entity)


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
