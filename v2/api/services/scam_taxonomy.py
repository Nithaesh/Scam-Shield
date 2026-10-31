"""Deterministic scam taxonomy classification covering English, Hindi, and Hinglish."""

from __future__ import annotations

import re
from typing import Any

VALID_TAXONOMIES = {
    "bank_kyc",
    "electricity_bill",
    "digital_arrest",
    "upi_collect_refund",
    "job_offer",
    "lottery_prize",
    "courier_customs",
    "loan_app",
    "govt_scheme_apk",
    "impersonation_other",
    "phishing_link_other",
    "none",
}

# Regex patterns for fast deterministic taxonomy matching
PATTERNS = {
    "electricity_bill": re.compile(
        r"(electricity|bijli|power\s+cut|bill\s+due|sub-station|disconnection|power\s+will\s+be\s+disconnected|"
        r"बिजली|बिल\s*बकाया|विद्युत|काट\s*दी\s*जाएगी|बिजली\s*अधिकारी)",
        re.IGNORECASE,
    ),
    "bank_kyc": re.compile(
        r"(kyc|pan\s+card|aadhaar|netbanking|account\s+blocked|account\s+suspended|debit\s+card\s+blocked|"
        r"yono|sbi|hdfc|icici|pnb|axis|bob|canara|खाता\s*ब्लॉक|केवाईसी|अकाउंट\s*बंद)",
        re.IGNORECASE,
    ),
    "digital_arrest": re.compile(
        r"(digital\s+arrest|cbi|police|narcotics|customs\s+officer|cyber\s+crime\s+dcp|illegal\s+parcel|"
        r"arrest\s+warrant|court\s+notice|skype\s+video|money\s+laundering|डिजिटल\s*अरेस्ट|गिरफ्तारी\s*वारंट|पुलिस)",
        re.IGNORECASE,
    ),
    "upi_collect_refund": re.compile(
        r"(upi\s+pin|enter\s+pin\s+to\s+receive|collect\s+request|cashback|refund\s+amount|gpay|phonepe|paytm|"
        r"रिफंड|पिन\s*दर्ज\s*करें|कैशबैक|प्राप्त\s*करने\s*के\s*लिए\s*पिन)",
        re.IGNORECASE,
    ),
    "job_offer": re.compile(
        r"(part\s*time\s*job|work\s*from\s*home|youtube\s*like|hotel\s*review|daily\s*income|earn\s*5000|telegram\s*task|"
        r"घर\s*बैठे\s*कमाई|पार्ट\s*टाइम\s*जॉब|टास्क)",
        re.IGNORECASE,
    ),
    "lottery_prize": re.compile(
        r"(kbc|lottery|winner|won\s+25\s+lakh|prize\s+money|lucky\s+draw|processing\s+fee|dear\s+winner|"
        r"लॉटरी|इनाम|केबीसी|२५\s*लाख|विजेता)",
        re.IGNORECASE,
    ),
    "courier_customs": re.compile(
        r"(india\s*post|courier|delivery\s+failed|package\s+held|customs\s+fee|dhl|fedex|unclaimed\s+parcel|"
        r"डाक\s*विभाग|पार्सल|कूरियर|सीमा\s*शुल्क)",
        re.IGNORECASE,
    ),
    "loan_app": re.compile(
        r"(instant\s*loan|loan\s*approved|low\s*interest|no\s*cibil|contact\s*access|loan\s*repayment|threaten\s*family|"
        r"लोन|ऋण|आसान\s*किस्त)",
        re.IGNORECASE,
    ),
    "govt_scheme_apk": re.compile(
        r"(\.apk|pm-kisan|pm\s*yojana|ladli\s*behna|free\s*recharge|download\s*app\s*link|subsidy|"
        r"सरकारी\s*योजना|मुफ्त\s*रिचार्ज|ऐप\s*डाउनलोड)",
        re.IGNORECASE,
    ),
}


def classify_scam_taxonomy(
    text: str,
    verdict: str,
    reasoning: str = "",
    tactics: list[str] | None = None,
    urls: list[str] | None = None,
    category_hint: str = "",
) -> str:
    """Deterministically categorize a message into the 12 canonical Scam Shield taxonomies.

    Returns one of:
        bank_kyc, electricity_bill, digital_arrest, upi_collect_refund, job_offer,
        lottery_prize, courier_customs, loan_app, govt_scheme_apk, impersonation_other,
        phishing_link_other, none
    """
    v = (verdict or "").strip().lower()
    if v == "safe":
        return "none"

    corpus = f"{text} {reasoning} {category_hint} {' '.join(tactics or [])}".lower()
    url_str = " ".join(urls or []).lower()

    # Direct APK match
    if ".apk" in url_str or ".apk" in corpus or "apk" in corpus and "govt" in corpus:
        return "govt_scheme_apk"

    # Priority match against distinct threat signatures
    if PATTERNS["electricity_bill"].search(corpus):
        return "electricity_bill"

    if PATTERNS["digital_arrest"].search(corpus):
        return "digital_arrest"

    if PATTERNS["lottery_prize"].search(corpus) or "prize_lure" in (tactics or []):
        return "lottery_prize"

    if PATTERNS["job_offer"].search(corpus) or "job_offer_lure" in (tactics or []):
        return "job_offer"

    if PATTERNS["loan_app"].search(corpus):
        return "loan_app"

    if PATTERNS["courier_customs"].search(corpus):
        return "courier_customs"

    if PATTERNS["upi_collect_refund"].search(corpus) or "pin_request" in (tactics or []):
        return "upi_collect_refund"

    if PATTERNS["bank_kyc"].search(corpus) or "kyc_threat" in (tactics or []):
        return "bank_kyc"

    if PATTERNS["govt_scheme_apk"].search(corpus):
        return "govt_scheme_apk"

    # Catch-all impersonation / generic phishing
    if "impersonation" in (tactics or []) or "police" in corpus or "bank" in corpus:
        return "impersonation_other"

    if urls or "url" in corpus or "link" in corpus or "click_pressure" in (tactics or []):
        return "phishing_link_other"

    return "impersonation_other" if v == "scam" else "none"
