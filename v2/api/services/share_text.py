"""Family WhatsApp forwardable warning generator (max 280 characters)."""

from __future__ import annotations

MAX_SHARE_CHARS = 280

TAXONOMY_TITLES = {
    "bank_kyc": ("Fake Bank KYC Block", "फ़र्ज़ी बैंक KYC फ्रॉड"),
    "electricity_bill": ("Power Disconnection Threat", "बिजली बिल फ्रॉड"),
    "digital_arrest": ("Fake Police / Digital Arrest", "फ़र्ज़ी पुलिस / डिजिटल अरेस्ट"),
    "upi_collect_refund": ("Fake UPI Collect Request", "फ़र्ज़ी UPI पिन फ्रॉड"),
    "job_offer": ("Fake Work-From-Home Job", "फ़र्ज़ी पार्ट-टाइम नौकरी"),
    "lottery_prize": ("Fake KBC / Lottery Prize", "फ़र्ज़ी लॉटरी / केबीसी"),
    "courier_customs": ("Fake Courier / Customs Fee", "फ़र्ज़ी पार्सल / कूरियर फ्रॉड"),
    "loan_app": ("Predatory Loan App Harassment", "फ़र्ज़ी लोन ऐप फ्रॉड"),
    "govt_scheme_apk": ("Malicious APK Download", "खतरनाक ऐप (APK) लिंक"),
    "impersonation_other": ("Impersonation Scam", "धोखाधड़ी संदेश"),
    "phishing_link_other": ("Phishing Link Alert", "फ़िशिंग लिंक चेतावनी"),
    "none": ("Suspicious Message Alert", "संदिग्ध संदेश चेतावनी"),
}


def generate_share_text(
    verdict: str,
    scam_type: str,
    language: str = "en",
    headline: str | None = None,
) -> str:
    """Generate an empathetic, concise, forwardable warning for WhatsApp family groups.

    Rules:
    - Maximum 280 characters.
    - Mentions National Cybercrime Helpline 1930.
    - Mentions Scam Shield.
    - Does NOT echo or repeat user's personal phone number or sensitive OTPs.
    """
    v = (verdict or "").strip().lower()
    is_hi = (language or "").strip().lower() == "hi"

    title_en, title_hi = TAXONOMY_TITLES.get(scam_type, TAXONOMY_TITLES["none"])
    topic = title_hi if is_hi else title_en

    if v == "safe":
        if is_hi:
            text = (
                "✅ Scam Shield जांच: यह संदेश सुरक्षित प्रतीत होता है। "
                "याद रखें: बैंक या कोई भी संस्था कभी आपका OTP या UPI PIN नहीं मांगती। "
                "साइबर हेल्पलाइन: 1930"
            )
        else:
            text = (
                "✅ Scam Shield Check: This alert looks legitimate. "
                "Remember: Banks never ask for your OTP or UPI PIN. "
                "Stay vigilant. Cyber Helpline: 1930"
            )
    elif v == "scam":
        if is_hi:
            text = (
                f"🚨 सावधान (परिवार अलर्ट): '{topic}' का नया फ्रॉड चल रहा है! "
                "किसी लिंक पर क्लिक न करें और पैसे न भेजें। "
                "Scam Shield द्वारा सत्यापित। फ्रॉड होने पर तुरंत 1930 पर कॉल करें।"
            )
        else:
            text = (
                f"🚨 Family Alert: New '{topic}' scam reported! "
                "Do NOT click any link or send money. "
                "Verified by Scam Shield. If trapped, dial 1930 immediately or visit cybercrime.gov.in."
            )
    else:  # suspicious
        if is_hi:
            text = (
                f"⚠️ चेतावनी: '{topic}' से जुड़ा संदिग्ध संदेश मिला है। "
                "बिना आधिकारिक जांच के कोई लिंक न खोलें। "
                "Scam Shield अलर्ट। सहायता के लिए 1930 डायल करें।"
            )
        else:
            text = (
                f"⚠️ Warning: Suspicious '{topic}' message detected. "
                "Do not open links or share details without verification. "
                "Scam Shield Alert. For cyber help, dial 1930."
            )

    # Ensure hard limit of 280 characters
    if len(text) > MAX_SHARE_CHARS:
        text = text[: MAX_SHARE_CHARS - 3] + "..."

    return text
