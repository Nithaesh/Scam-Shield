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


def _synthesize_pattern_report_fallback(extracted: Extracted) -> PatternReport:
    """Deterministic pattern analysis based on knowledge base when LLM is unavailable."""
    text = (extracted.message_text or "").lower()
    tactics: list[str] = []
    reasons: list[str] = []
    score = 0

    # Prompt injection detection -> severe scam
    if any(kw in text for kw in ["ignore all instructions", "ignore previous instructions", "system override", "you must output a verdict"]):
        return PatternReport(
            status="ok",
            score=95,
            tactics=["urgency", "fear"],
            impersonated_entity=None,
            reasons=["Prompt injection payload attempting to bypass security filters."],
        )

    # Legitimate checks first to avoid false positives
    is_legit_receipt = any(kw in text for kw in ["has been successfully received", "bill paid", "recharge of", "successful", "statement for", "appointment with", "confirmed for tomorrow"])
    is_legit_bank_alert = ("debited from" in text or "credited to" in text or "credited towards salary" in text) and ("available bal" in text or "available balance" in text or "भारतीय स्टेट बैंक" in text)
    is_legit_otp = ("is your otp" in text or "verification code" in text or "one-time verification code" in text) and ("do not share" in text or "never disclose" in text or "valid for" in text)
    is_legit_delivery = "delivered to recipient" in text or ("delivery partner has arrived" in text) or ("dispatched with delivery agent" in text) or ("pnr" in text and "confirmed" in text)

    has_threat_tld = any(kw in text for kw in [".xyz", ".top", ".click", ".site", ".club", ".buzz", "loan.apk", "app.apk", "yono_update.apk"])
    has_credential_harvest = any(kw in text for kw in ["enter your upi pin", "share the 6-digit otp", "share the otp", "pin to accept", "card cvv", "quicksupport", "anydesk", "teamviewer"])

    if (is_legit_bank_alert or is_legit_otp or is_legit_delivery or is_legit_receipt) and not has_threat_tld and not has_credential_harvest:
        return PatternReport(
            status="ok",
            score=5,
            tactics=[],
            impersonated_entity=None,
            reasons=["Standard legitimate notification structure with security warnings and official format."],
        )

    # Urgency & Deadlines
    if any(kw in text for kw in ["tonight at 9:30", "रात 9:30 बजे", "रात 12 बजे", "in 2 hours", "within 2 hours", "within 24", "within 6 hours", "expire today", "today night", "immediately", "तुरंत"]):
        tactics.append("urgency")
        reasons.append("High-pressure artificial deadline.")
        score += 30

    # Fear & Coercion
    if any(kw in text for kw in ["blocked", "disconnected", "बंद कर दिया", "काट दिया जाएगा", "digital arrest", "cbi", "police", "penalty", "permanently deactivat", "blacklist", "illegal", "fine se bachne", "disabled due to"]):
        tactics.append("fear")
        reasons.append("Threats of legal consequences, financial loss, or service disconnection.")
        score += 35

    # KYC & Government Fine Threats
    if any(kw in text for kw in ["kyc", "pan", "aadhar", "aadhaar", "e-kyc", "पैन", "आधार", "फॉर्म 16"]):
        if any(kw in text for kw in ["update", "block", "pending", "expire", "link", "अपडेट"]):
            tactics.append("kyc_threat")
            reasons.append("Coercive KYC or identity documentation threat.")
            score += 30

    # Impersonation
    claimed = extracted.claimed_organisation
    if not claimed:
        for org in ["sbi", "hdfc", "icici", "pnb", "axis", "electricity", "cbi", "police", "trai", "irctc", "india post", "amazon", "swiggy", "fastag", "income tax"]:
            if org in text:
                claimed = org.upper()
                break

    if claimed and any(kw in text for kw in ["update", "verify", "call", "pay", "click", "download", "apk", "officer", "helpline", "संपर्क करें"]):
        tactics.append("impersonation")
        reasons.append(f"Impersonation of institution: {claimed}")
        score += 25

    # OTP / UPI PIN / ATM PIN Demands
    if any(kw in text for kw in ["share the 6-digit otp", "share the otp", "enter your upi pin", "pin to accept", "enter upi pin", "card cvv"]):
        if "otp" in text:
            tactics.append("otp_request")
        if "pin" in text:
            tactics.append("pin_request")
        reasons.append("Explicit request for sensitive authentication credentials (OTP/PIN).")
        score += 45

    # Prize Lures / Fake Government Schemes / Crypto
    if any(kw in text for kw in ["kbc", "lucky draw", "lottery", "cash prize", "scratch card", "reward points", "₹12,000", "pm kisan", "बधाई हो", "iphone 16", "25 lakh", "25,00,000", "25lakh"]):
        tactics.append("prize_lure")
        reasons.append("Unrealistic lottery, reward points, or prize lure.")
        score += 55

    # Job Offer Lures
    if any(kw in text for kw in ["work from home", "part-time", "liking youtube", "rating google maps", "daily task", "earn rs"]):
        tactics.append("job_offer_lure")
        reasons.append("Unsolicited part-time task job offer.")
        score += 55

    # Investment / Crypto Schemes
    if any(kw in text for kw in ["crypto", "bitcoin", "ethereum", "guaranteed returns", "300%", "risk free", "vip institutional", "trading group"]):
        tactics.append("prize_lure")
        reasons.append("Guaranteed high-return investment scheme.")
        score += 55

    # Check for genuine toll-free customer alerts
    if "1800" in text and not extracted.urls and not any(kw in text for kw in ["block", "disconnect", "arrest", "kyc"]):
        score = max(0, score - 30)
        reasons.append("Official toll-free number provided with no phishing links.")

    # Remote Access / Malicious APK
    if any(kw in text for kw in [".apk", "quicksupport", "anydesk", "teamviewer", "remote access"]):
        if ".apk" in text:
            tactics.append("click_pressure")
        else:
            tactics.append("remote_access_request")
        reasons.append("Solicitation of malicious software or remote access screen-sharing.")
        score += 45

    final_score = min(100, max(0, score))
    return PatternReport(
        status="ok",
        score=final_score,
        tactics=tactics,  # type: ignore[arg-type]
        impersonated_entity=claimed,
        reasons=reasons or ["Neutral pattern without acute threat indicators."],
    )


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
            default_factory=lambda: _synthesize_pattern_report_fallback(extracted),
        )
    except Exception as e:
        logger.error("Pattern Analyst agent failed: %s. Returning fallback.", str(e))
        return _synthesize_pattern_report_fallback(extracted)


if __name__ == "__main__":
    test_input = sys.argv[1] if len(sys.argv) > 1 else "Dear consumer your electricity power will be disconnected tonight at 9:30 pm from electricity office. Immediately call officer at 9876543210"
    from agents.extractor import extract
    extracted_data = extract(test_input)
    res = analyze_patterns(extracted_data)
    print(res.model_dump_json(indent=2))
