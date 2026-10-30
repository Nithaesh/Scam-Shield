"""Small, dependency-free translation layer for the Scam Shield UI.

The language toggle uses ``auto`` / ``en`` / ``hi``. ``auto`` resolves to Hindi
when the pasted message contains Devanagari, otherwise English.
"""

from __future__ import annotations

import re
from typing import Final

DEVANAGARI_RE: Final[re.Pattern[str]] = re.compile(r"[\u0900-\u097F]")

STRINGS: Final[dict[str, dict[str, str]]] = {
    "brand": {"en": "Scam Shield", "hi": "स्कैम शील्ड"},
    "brand_sub": {"en": "Multi-agent fraud checker", "hi": "मल्टी-एजेंट धोखाधड़ी जाँच"},
    "hero_title": {
        "en": "Forward any suspicious message. Get a verdict in seconds.",
        "hi": "कोई भी संदिग्ध संदेश भेजें। कुछ सेकंड में साफ़ जवाब पाएँ।",
    },
    "hero_subtitle": {
        "en": "Paste an SMS, WhatsApp message or UPI request — or upload a screenshot. Five agents check the words, links, phone numbers and payment handles before you act.",
        "hi": "SMS, WhatsApp संदेश या UPI रिक्वेस्ट पेस्ट करें — या स्क्रीनशॉट अपलोड करें। पाँच एजेंट शब्दों, लिंक, फ़ोन नंबर और UPI हैंडल की जाँच करते हैं, ताकि आप कोई कदम उठाने से पहले सुरक्षित रहें।",
    },
    "hero_badge_fast": {"en": "Verdict in seconds", "hi": "सेकंडों में नतीजा"},
    "hero_badge_private": {"en": "Links are never opened", "hi": "लिंक कभी नहीं खोले जाते"},
    "hero_badge_lang": {"en": "Hindi + English", "hi": "हिन्दी + English"},
    "demo_badge": {"en": "Demo mode", "hi": "डेमो मोड"},
    "demo_reason_no_key": {
        "en": "No LLM key found — showing realistic demo data.",
        "hi": "LLM कुंजी नहीं मिली — नमूना डेमो डेटा दिखाया जा रहा है।",
    },
    "demo_reason_forced": {
        "en": "Demo mode is switched on in the sidebar.",
        "hi": "साइडबार में डेमो मोड चालू है।",
    },
    "demo_reason_import": {
        "en": "Agent layer could not be loaded — demo data is active.",
        "hi": "एजेंट लेयर लोड नहीं हो सकी — डेमो डेटा चालू है।",
    },
    "input_title": {"en": "Check a message", "hi": "संदेश जाँचें"},
    "input_sub": {
        "en": "Your message stays in this session. We never open the links inside it.",
        "hi": "आपका संदेश इस सेशन में ही रहता है। हम उसमें दिए लिंक कभी नहीं खोलते।",
    },
    "tab_text": {"en": "Paste text", "hi": "टेक्स्ट पेस्ट करें"},
    "tab_image": {"en": "Upload screenshot", "hi": "स्क्रीनशॉट अपलोड करें"},
    "placeholder": {
        "en": "Paste the full SMS / WhatsApp message here…\n\nExample: Dear SBI user, your account is blocked. Update KYC at http://sbi-kyc-update.xyz",
        "hi": "पूरा SMS / WhatsApp संदेश यहाँ पेस्ट करें…\n\nउदाहरण: प्रिय SBI ग्राहक, आपका खाता बंद है। KYC यहाँ अपडेट करें: http://sbi-kyc-update.xyz",
    },
    "chars": {"en": "{count} / {limit} characters", "hi": "{count} / {limit} अक्षर"},
    "clear": {"en": "Clear", "hi": "साफ़ करें"},
    "analyze": {"en": "Check this message", "hi": "इस संदेश की जाँच करें"},
    "analyzing": {"en": "Agents are checking…", "hi": "एजेंट जाँच कर रहे हैं…"},
    "try_example": {"en": "Try an example", "hi": "एक उदाहरण आज़माएँ"},
    "samples_hint": {
        "en": "Tap a sample to fill the box. All examples are fictional.",
        "hi": "बॉक्स भरने के लिए कोई नमूना चुनें। सभी उदाहरण काल्पनिक हैं।",
    },
    "upload_hint": {
        "en": "PNG, JPG or JPEG · maximum 5 MB. The screenshot is read on this device before analysis.",
        "hi": "PNG, JPG या JPEG · अधिकतम 5 MB। स्क्रीनशॉट इसी डिवाइस पर पढ़ा जाता है।",
    },
    "upload_too_large": {
        "en": "That image is larger than 5 MB. Please upload a smaller screenshot.",
        "hi": "यह इमेज 5 MB से बड़ी है। कृपया छोटा स्क्रीनशॉट अपलोड करें।",
    },
    "upload_bad_type": {
        "en": "Please upload a PNG, JPG or JPEG image.",
        "hi": "कृपया PNG, JPG या JPEG इमेज अपलोड करें।",
    },
    "upload_selected": {"en": "Screenshot ready", "hi": "स्क्रीनशॉट तैयार है"},
    "language_label": {"en": "Advice language", "hi": "सलाह की भाषा"},
    "lang_auto": {"en": "Auto", "hi": "ऑटो"},
    "lang_en": {"en": "English", "hi": "English"},
    "lang_hi": {"en": "हिन्दी", "hi": "हिन्दी"},
    "need_input": {
        "en": "Paste a message or upload a screenshot first.",
        "hi": "पहले संदेश पेस्ट करें या स्क्रीनशॉट अपलोड करें।",
    },
    "pipeline_title": {"en": "Agent pipeline", "hi": "एजेंट पाइपलाइन"},
    "pipeline_sub": {
        "en": "Five specialists work in sequence. The Judge resolves conflicts.",
        "hi": "पाँच विशेषज्ञ क्रम से काम करते हैं। जज टकराव सुलझाता है।",
    },
    "stage_extractor": {"en": "Extractor", "hi": "एक्सट्रैक्टर"},
    "stage_pattern_analyst": {"en": "Pattern Analyst", "hi": "पैटर्न विश्लेषक"},
    "stage_entity_checker": {"en": "Entity Checker", "hi": "एंटिटी चेकर"},
    "stage_judge": {"en": "Judge", "hi": "जज"},
    "stage_advisor": {"en": "Advisor", "hi": "सलाहकार"},
    "desc_extractor": {
        "en": "Finds the sender, links, phone numbers and UPI IDs.",
        "hi": "प्रेषक, लिंक, फ़ोन नंबर और UPI ID ढूँढता है।",
    },
    "desc_pattern_analyst": {
        "en": "Spots urgency, fear, KYC threats and prize lures.",
        "hi": "जल्दबाज़ी, डर, KYC धमकी और इनाम के लालच को पहचानता है।",
    },
    "desc_entity_checker": {
        "en": "Checks domains, numbers and handles against reputation data.",
        "hi": "डोमेन, नंबर और हैंडल की प्रतिष्ठा की जाँच करता है।",
    },
    "desc_judge": {
        "en": "Weighs language and technical evidence, then decides.",
        "hi": "भाषा और तकनीकी सबूत तौलकर फैसला देता है।",
    },
    "desc_advisor": {
        "en": "Turns the verdict into simple next steps in your language.",
        "hi": "फैसले को आपकी भाषा में आसान अगले कदमों में बदलता है।",
    },
    "status_waiting": {"en": "Waiting", "hi": "प्रतीक्षा"},
    "status_running": {"en": "Running", "hi": "चल रहा है"},
    "status_done": {"en": "Done", "hi": "पूरा"},
    "status_could_not_check": {"en": "Could not check", "hi": "जाँच नहीं हो सकी"},
    "sender": {"en": "Sender", "hi": "प्रेषक"},
    "claimed": {"en": "Claims to be", "hi": "दावा"},
    "links": {"en": "Links", "hi": "लिंक"},
    "phones": {"en": "Phone numbers", "hi": "फ़ोन नंबर"},
    "upi": {"en": "UPI IDs", "hi": "UPI ID"},
    "summary": {"en": "Summary", "hi": "सारांश"},
    "none_found": {"en": "None found", "hi": "कुछ नहीं मिला"},
    "score": {"en": "Risk score", "hi": "जोखिम स्कोर"},
    "tactics": {"en": "Tactics detected", "hi": "पहचानी गई चालें"},
    "no_tactics": {"en": "No manipulation tactics detected.", "hi": "कोई हेरफेर की चाल नहीं मिली।"},
    "reasons": {"en": "Why", "hi": "कारण"},
    "findings": {"en": "Findings", "hi": "निष्कर्ष"},
    "no_findings": {
        "en": "No technical red flags found for the entities in this message.",
        "hi": "इस संदेश में मिली एंटिटी में कोई तकनीकी खतरा नहीं मिला।",
    },
    "unchecked": {"en": "Could not verify", "hi": "पुष्टि नहीं हो सकी"},
    "reasoning": {"en": "Judge reasoning", "hi": "जज का तर्क"},
    "conflicts": {"en": "Conflicts resolved", "hi": "सुलझाए गए टकराव"},
    "no_conflicts": {
        "en": "The agents agreed on this verdict.",
        "hi": "सभी एजेंट इस फैसले पर सहमत थे।",
    },
    "key_evidence": {"en": "Key evidence", "hi": "मुख्य सबूत"},
    "advice": {"en": "What to do", "hi": "क्या करें"},
    "do_not": {"en": "Do NOT", "hi": "यह न करें"},
    "do_next": {"en": "Do next", "hi": "अब यह करें"},
    "confidence": {"en": "Confidence", "hi": "भरोसा"},
    "verdict_safe": {"en": "SAFE", "hi": "सुरक्षित"},
    "verdict_suspicious": {"en": "BE CAREFUL", "hi": "सावधान रहें"},
    "verdict_scam": {"en": "SCAM", "hi": "धोखाधड़ी"},
    "verdict_kicker": {"en": "Verdict", "hi": "फैसला"},
    "verdict_empty_title": {"en": "Your verdict will appear here", "hi": "आपका फैसला यहाँ दिखेगा"},
    "verdict_empty_body": {
        "en": "Paste a message above and tap “Check this message”. Nothing leaves this page except the reputation lookups.",
        "hi": "ऊपर संदेश पेस्ट करें और “इस संदेश की जाँच करें” दबाएँ। प्रतिष्ठा जाँच के अलावा कोई डेटा बाहर नहीं जाता।",
    },
    "report_help": {
        "en": "Report fraud or get help",
        "hi": "धोखाधड़ी की रिपोर्ट करें या मदद लें",
    },
    "helpline": {"en": "Helpline 1930", "hi": "हेल्पलाइन 1930"},
    "cybercrime": {"en": "cybercrime.gov.in", "hi": "cybercrime.gov.in"},
    "read_aloud": {"en": "Read this aloud", "hi": "यह सुनें"},
    "listen_hint": {
        "en": "Uses your browser voice. No audio leaves this device.",
        "hi": "आपके ब्राउज़र की आवाज़ का उपयोग करता है। कोई ऑडियो डिवाइस से बाहर नहीं जाता।",
    },
    "download_json": {"en": "Download JSON report", "hi": "JSON रिपोर्ट डाउनलोड करें"},
    "download_text": {"en": "Download text summary", "hi": "टेक्स्ट सारांश डाउनलोड करें"},
    "check_another": {"en": "Check another message", "hi": "दूसरा संदेश जाँचें"},
    "analyzed_in": {"en": "Analysed in {ms} ms", "hi": "{ms} ms में जाँच पूरी"},
    "cached": {"en": "Cached result", "hi": "सहेजा गया नतीजा"},
    "fresh": {"en": "Fresh analysis", "hi": "नई जाँच"},
    "error_title": {"en": "Something went wrong", "hi": "कुछ गड़बड़ हो गई"},
    "error_body": {
        "en": "The analysis could not finish. Your message was not sent anywhere unsafe. Please try again.",
        "hi": "जाँच पूरी नहीं हो सकी। आपका संदेश कहीं असुरक्षित नहीं भेजा गया। कृपया दोबारा कोशिश करें।",
    },
    "retry": {"en": "Try again", "hi": "दोबारा कोशिश करें"},
    "sidebar_about": {"en": "About", "hi": "परिचय"},
    "about_text": {
        "en": "Scam Shield is a free, explainable fraud check for everyday messages in India. It combines language analysis with public reputation data — and tells you what to do next.",
        "hi": "स्कैम शील्ड भारत में रोज़ाना आने वाले संदेशों के लिए एक मुफ़्त, स्पष्ट धोखाधड़ी जाँच है। यह भाषा विश्लेषण और सार्वजनिक प्रतिष्ठा डेटा को जोड़कर आपको अगला कदम बताता है।",
    },
    "sidebar_how": {"en": "How it works", "hi": "यह कैसे काम करता है"},
    "sidebar_disclaimer": {"en": "Important", "hi": "ज़रूरी बात"},
    "disclaimer_text": {
        "en": "Not a legal or financial guarantee. When unsure, call your bank's official number printed on your card or passbook. Never use a number from the suspicious message.",
        "hi": "यह कानूनी या वित्तीय गारंटी नहीं है। संदेह होने पर अपने बैंक के आधिकारिक नंबर पर कॉल करें जो कार्ड या पासबुक पर छपा है। संदिग्ध संदेश में दिया नंबर कभी न इस्तेमाल करें।",
    },
    "sidebar_credits": {"en": "Built with", "hi": "इनके साथ बनाया"},
    "credits_text": {
        "en": "Agent pipeline by the Scam Shield team. UI and entity tools by the frontend/tools team.",
        "hi": "एजेंट पाइपलाइन स्कैम शील्ड टीम द्वारा। UI और एंटिटी टूल्स फ्रंटएंड/टूल्स टीम द्वारा।",
    },
    "demo_toggle": {"en": "Demo mode", "hi": "डेमो मोड"},
    "demo_toggle_help": {
        "en": "Use canned results instead of the live agent pipeline.",
        "hi": "लाइव एजेंट पाइपलाइन की जगह तैयार नतीजे दिखाएँ।",
    },
    "partial_toggle": {"en": "Simulate an unavailable check", "hi": "अनुपलब्ध जाँच का अनुकरण करें"},
    "partial_toggle_help": {
        "en": "Demo only: makes the Entity Checker show “could not check”.",
        "hi": "केवल डेमो: एंटिटी चेकर “जाँच नहीं हो सकी” दिखाएगा।",
    },
    "footer": {
        "en": "Scam Shield · An AI-assisted advisory tool. Not a legal or financial guarantee. Report fraud at cybercrime.gov.in or call 1930.",
        "hi": "स्कैम शील्ड · AI-सहायता वाला सलाहकार टूल। कानूनी या वित्तीय गारंटी नहीं। धोखाधड़ी की रिपोर्ट cybercrime.gov.in पर करें या 1930 पर कॉल करें।",
    },
    "tactic_urgency": {"en": "Urgency", "hi": "जल्दबाज़ी"},
    "tactic_fear": {"en": "Fear", "hi": "डर"},
    "tactic_impersonation": {"en": "Impersonation", "hi": "नकल"},
    "tactic_otp_request": {"en": "OTP request", "hi": "OTP माँग"},
    "tactic_pin_request": {"en": "PIN request", "hi": "PIN माँग"},
    "tactic_click_pressure": {"en": "Click pressure", "hi": "लिंक दबाव"},
    "tactic_prize_lure": {"en": "Prize lure", "hi": "इनाम का लालच"},
    "tactic_kyc_threat": {"en": "KYC threat", "hi": "KYC धमकी"},
    "tactic_payment_request": {"en": "Payment request", "hi": "भुगतान माँग"},
    "tactic_remote_access_request": {"en": "Remote access", "hi": "रिमोट एक्सेस"},
    "tactic_job_offer_lure": {"en": "Job lure", "hi": "नौकरी का लालच"},
    "severity_high": {"en": "High", "hi": "गंभीर"},
    "severity_medium": {"en": "Medium", "hi": "मध्यम"},
    "severity_low": {"en": "Low", "hi": "कम"},
    "sample_kyc": {"en": "Fake KYC block", "hi": "फ़र्ज़ी KYC ब्लॉक"},
    "sample_lottery": {"en": "Lottery win", "hi": "लॉटरी जीत"},
    "sample_upi_refund": {"en": "UPI refund", "hi": "UPI रिफंड"},
    "sample_otp": {"en": "Genuine bank OTP", "hi": "असली बैंक OTP"},
    "sample_delivery": {"en": "Delivery update", "hi": "डिलीवरी अपडेट"},
    "sample_tag_scam": {"en": "Scam", "hi": "धोखा"},
    "sample_tag_suspicious": {"en": "Be careful", "hi": "सावधान"},
    "sample_tag_safe": {"en": "Likely safe", "hi": "सुरक्षित"},
    "sound_unsupported": {
        "en": "Your browser does not support read-aloud.",
        "hi": "आपका ब्राउज़र पढ़कर सुनाने की सुविधा नहीं देता।",
    },
    "voice_play": {"en": "Read aloud", "hi": "सुनें"},
    "voice_stop": {"en": "Stop", "hi": "रोकें"},
    "copy_note": {
        "en": "Screenshots are analysed only when the live agent layer is available.",
        "hi": "स्क्रीनशॉट की जाँच तभी होती है जब लाइव एजेंट लेयर उपलब्ध हो।",
    },
    "stub_failure": {
        "en": "Demo data could not be produced. Please retry.",
        "hi": "डेमो डेटा नहीं बन सका। कृपया दोबारा कोशिश करें।",
    },
}


def resolve_ui_language(language: str, text: str = "") -> str:
    """Resolve the UI language from the toggle and the message content."""
    if language in ("en", "hi"):
        return language
    return "hi" if DEVANAGARI_RE.search(text or "") else "en"


def t(key: str, language: str = "en", **kwargs: object) -> str:
    """Translate ``key`` with a safe English fallback and optional formatting."""
    entry = STRINGS.get(key, {})
    value = entry.get(language) or entry.get("en") or key
    if kwargs:
        try:
            return value.format(**kwargs)
        except (KeyError, ValueError):
            return value
    return value


def has_devanagari(text: str) -> bool:
    """Return True when the text contains at least one Devanagari character."""
    return bool(DEVANAGARI_RE.search(text or ""))
