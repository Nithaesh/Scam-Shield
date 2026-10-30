"""Pydantic schemas for Scam Shield multi-agent architecture.

All agent inputs and outputs are strictly typed and validated against
the models defined in this module.
"""

from typing import Literal
from pydantic import BaseModel, Field


TacticType = Literal[
    "urgency",
    "fear",
    "impersonation",
    "otp_request",
    "pin_request",
    "click_pressure",
    "prize_lure",
    "kyc_threat",
    "payment_request",
    "remote_access_request",
    "job_offer_lure",
]

LanguageType = Literal["en", "hi", "hinglish", "other"]
AdviceLanguageType = Literal["en", "hi"]
EntityType = Literal["url", "phone", "upi", "sender"]
SeverityType = Literal["low", "medium", "high"]
VerdictType = Literal["safe", "suspicious", "scam"]


class Extracted(BaseModel):
    """Structured entities and metadata extracted from the raw message or image."""

    sender: str | None = Field(default=None, description="Sender name, phone, or ID if present.")
    message_text: str = Field(..., description="Cleaned text of the message or OCR text.")
    urls: list[str] = Field(default_factory=list, description="Extracted URLs.")
    phone_numbers: list[str] = Field(default_factory=list, description="Extracted phone numbers.")
    upi_ids: list[str] = Field(default_factory=list, description="Extracted UPI IDs (e.g. user@okhdfcbank).")
    language: LanguageType = Field(default="en", description="Detected language.")
    claimed_organisation: str | None = Field(
        default=None, description="Claimed entity or brand (e.g., SBI, HDFC, India Post, Police)."
    )
    summary: str = Field(default="", description="1-line summary of message intent.")

    @classmethod
    def fallback(cls, message_text: str = "") -> "Extracted":
        """Safe fallback when extraction fails."""
        return cls(
            sender=None,
            message_text=message_text,
            urls=[],
            phone_numbers=[],
            upi_ids=[],
            language="other",
            claimed_organisation=None,
            summary="Raw unparsed message.",
        )


class PatternReport(BaseModel):
    """Evaluation of psychological and scam manipulation tactics."""

    status: str = Field(default="ok", description="'ok' or 'could_not_check'")
    score: int = Field(..., ge=0, le=100, description="Scam likelihood score from 0 (clean) to 100 (high risk).")
    tactics: list[TacticType] = Field(default_factory=list, description="Identified scam tactics.")
    impersonated_entity: str | None = Field(
        default=None, description="Suspected impersonation target if different from sender."
    )
    reasons: list[str] = Field(default_factory=list, description="Justifications and observations.")

    @classmethod
    def fallback(cls, reason: str = "Pattern analysis could not be completed.") -> "PatternReport":
        """Safe fallback when pattern analysis fails."""
        return cls(
            status="could_not_check",
            score=50,
            tactics=[],
            impersonated_entity=None,
            reasons=[reason],
        )


class EntityFinding(BaseModel):
    """Individual entity threat signal."""

    entity: str = Field(..., description="The checked entity value (e.g. domain, phone, UPI).")
    type: EntityType = Field(..., description="Entity category.")
    signal: str = Field(..., description="Threat or safety signal description.")
    severity: SeverityType = Field(..., description="Risk severity level.")
    source: str = Field(..., description="Signal source (e.g., lookalike_detection, whois, mock).")


class EntityReport(BaseModel):
    """Technical reputation and security checks across extracted entities."""

    status: str = Field(default="ok", description="'ok' or 'could_not_check'")
    risk_score: int = Field(..., ge=0, le=100, description="Overall technical entity risk from 0 to 100.")
    findings: list[EntityFinding] = Field(default_factory=list, description="Security findings.")
    reasons: list[str] = Field(default_factory=list, description="Entity risk summary points.")
    unchecked: list[str] = Field(default_factory=list, description="Entities that could not be evaluated.")

    @classmethod
    def fallback(cls, reason: str = "Entity checking could not be completed.") -> "EntityReport":
        """Safe fallback when entity checking fails."""
        return cls(
            status="could_not_check",
            risk_score=50,
            findings=[],
            reasons=[reason],
            unchecked=["all"],
        )


class Conflict(BaseModel):
    """Discrepancy between pattern analysis and entity technical reputation."""

    description: str = Field(..., description="Description of the conflict between agents.")
    resolution: str = Field(..., description="How the conflict was adjudicated.")


class JudgeVerdict(BaseModel):
    """Final arbitration verdict combining behavioral and technical signals."""

    verdict: VerdictType = Field(..., description="Final verdict: safe, suspicious, or scam.")
    confidence: int = Field(..., ge=0, le=100, description="Confidence in the verdict (0-100).")
    reasoning: str = Field(..., description="Detailed synthesis explaining the verdict.")
    conflicts: list[Conflict] = Field(default_factory=list, description="Any conflicting signals resolved.")
    key_evidence: list[str] = Field(default_factory=list, description="Top evidence points supporting verdict.")

    @classmethod
    def fallback(cls, reason: str = "Judge arbitration degraded due to upstream component failure.") -> "JudgeVerdict":
        """Safe fallback when judge arbitration fails."""
        return cls(
            verdict="suspicious",
            confidence=30,
            reasoning=f"Could not complete full verdict adjudication: {reason}. Treating as suspicious out of abundance of caution.",
            conflicts=[],
            key_evidence=["Automated analysis pipeline encountered an error."],
        )


class Advice(BaseModel):
    """Actionable guidance tailored for ordinary citizens in Hindi or English."""

    language: AdviceLanguageType = Field(default="en", description="Output language ('en' or 'hi').")
    headline: str = Field(..., description="Clear, immediate header advice.")
    do_not: list[str] = Field(default_factory=list, description="Top actions to avoid (max 3).")
    do_next: list[str] = Field(default_factory=list, description="Top proactive steps to take (max 3).")
    report_to: list[str] = Field(default_factory=list, description="Official escalation channels (e.g. 1930).")
    plain_summary: str = Field(..., description="Simple, jargon-free summary.")

    @classmethod
    def fallback(cls, language: AdviceLanguageType = "en") -> "Advice":
        """Safe fallback advice providing default protective guidance."""
        if language == "hi":
            return cls(
                language="hi",
                headline="सावधान रहें: किसी भी अनजान लिंक या व्यक्ति पर भरोसा न करें",
                do_not=[
                    "कोई भी OTP, PIN या पासवर्ड कभी साझा न करें।",
                    "संदेश में आए किसी भी लिंक पर क्लिक न करें।",
                    "कोई भी अज्ञात ऐप (जैसे AnyDesk, TeamViewer) इंस्टॉल न करें।",
                ],
                do_next=[
                    "यदि पैसे कट गए हैं तो तुरंत 1930 पर कॉल करें।",
                    "अपने बैंक के आधिकारिक कस्टमर केयर नंबर पर बात करें।",
                    "cybercrime.gov.in पर रिपोर्ट दर्ज करें।",
                ],
                report_to=["National Cyber Crime Helpline: 1930", "cybercrime.gov.in"],
                plain_summary="तकनीकी समस्या के कारण पूरी जांच नहीं हो सकी। सुरक्षा के लिए किसी अनजान लिंक या फोन कॉल पर भरोसा न करें।",
            )
        return cls(
            language="en",
            headline="Stay cautious: Do not trust unknown links or callers",
            do_not=[
                "Never share OTP, UPI PIN, or bank passwords with anyone.",
                "Do not click on links from unverified numbers or emails.",
                "Do not install remote access apps (e.g. AnyDesk, RustDesk).",
            ],
            do_next=[
                "If money was deducted, immediately dial 1930.",
                "Contact your bank only through their official app or website.",
                "Report suspicious messages to cybercrime.gov.in.",
            ],
            report_to=["National Cyber Crime Helpline: 1930", "cybercrime.gov.in"],
            plain_summary="Due to a temporary technical issue, a complete check could not be performed. When in doubt, do not share credentials or money.",
        )


class AnalysisResult(BaseModel):
    """Consolidated end-to-end output returned by the Scam Shield orchestrator."""

    extracted: Extracted
    pattern: PatternReport
    entity: EntityReport
    verdict: JudgeVerdict
    advice: Advice
    timings_ms: dict[str, float] = Field(default_factory=dict, description="Agent execution latency in ms.")
    cache_hit: bool = Field(default=False, description="Whether result was served from cache.")
