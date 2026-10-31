"""Canned, realistic agent stream used for demos and offline fallback.

The event format matches ``ui.adapter`` exactly:
``{"stage": ..., "status": "running|done|could_not_check", "data": ...}`` and a
final ``{"stage": "complete", "status": "done", "data": <AnalysisResult>}``.
"""

from __future__ import annotations

import time
from typing import Any, Generator

SCAM_KEYWORDS = (
    "kyc", "blocked", "block", "lottery", "prize", "winner", "won", "arrest",
    "cbi", "police", "refund", "apk", "urgent", "immediately", "turant",
    "तुरंत", "बंद", "लॉटरी", "जीत", "इनाम", "केवाईसी", "पुलिस", "धोखा",
)
SUSPICIOUS_KEYWORDS = (
    "click", "link", "verify", "verification", "delivery", "electricity",
    "bill", "bit.ly", "pay", "update", "fee", "customs", "courier", "sim",
)
SAFE_KEYWORDS = (
    "debited from", "credited to", "available balance", "is your otp",
    "verification code", "delivered to recipient", "appointment with",
    "order #", "dispatched", "recharge of", "statement for",
)


def _pick_case(text: str) -> str:
    """Pick a canned case from lightweight, explainable keyword rules."""
    lowered = (text or "").lower()
    if any(marker in lowered for marker in SAFE_KEYWORDS) and not any(
        bad in lowered for bad in ("http://", "https://", ".xyz", ".top", ".apk")
    ):
        return "safe"
    if any(word in lowered for word in SAFE_KEYWORDS[:3]) and any(
        word in lowered for word in ("do not share", "valid for")
    ):
        return "safe"
    if any(word in lowered for word in SCAM_KEYWORDS):
        return "scam"
    if any(word in lowered for word in SUSPICIOUS_KEYWORDS):
        return "suspicious"
    return "suspicious"


def _extracted(text: str, sender: str, urls: list[str], phones: list[str],
               upi: list[str], claimed: str | None, summary: str) -> dict[str, Any]:
    """Build an Extracted-shaped dictionary."""
    return {
        "sender": sender,
        "message_text": text,
        "urls": urls,
        "phone_numbers": phones,
        "upi_ids": upi,
        "language": "hi" if any("\u0900" <= ch <= "\u097f" for ch in text) else "en",
        "claimed_organisation": claimed,
        "summary": summary,
    }


def _finding(entity: str, kind: str, signal: str, severity: str, source: str) -> dict[str, str]:
    """Build an EntityFinding-shaped dictionary."""
    return {
        "entity": entity,
        "type": kind,
        "signal": signal,
        "severity": severity,
        "source": source,
    }


def _advice(language: str, case: str) -> dict[str, Any]:
    """Return Advice in English or Hindi for the chosen canned case."""
    if case == "safe":
        if language == "hi":
            return {
                "language": "hi",
                "headline": "यह संदेश सुरक्षित लगता है",
                "do_not": [
                    "फिर भी OTP, PIN या पासवर्ड किसी को न दें।",
                    "संदेश में दिए किसी भी संदिग्ध लिंक पर क्लिक न करें।",
                    "कॉल पर बैंक कर्मचारी बताकर कोई दूर से ऐप इंस्टॉल न कराएँ।",
                ],
                "do_next": [
                    "अपने बैंक ऐप में लॉगिन करके लेन-देन खुद जाँचें।",
                    "बैंक के आधिकारिक नंबर पर ही कॉल करें।",
                    "अनजान संदेश को 1930 या cybercrime.gov.in पर रिपोर्ट करें।",
                ],
                "report_to": ["राष्ट्रीय साइबर अपराध हेल्पलाइन: 1930", "cybercrime.gov.in"],
                "plain_summary": "यह एक सामान्य बैंक/डिलीवरी सूचना जैसा दिखता है। फिर भी कोई OTP या पैसा साझा करने से पहले official ऐप में पुष्टि करें।",
            }
        return {
            "language": "en",
            "headline": "This looks like a normal message",
            "do_not": [
                "Still never share an OTP, PIN or password with anyone.",
                "Do not click unexpected links, even in a message that looks official.",
                "Do not install a remote-access app because a caller asks you to.",
            ],
            "do_next": [
                "Verify the transaction inside your official bank or delivery app.",
                "Call your bank only on the number printed on your card or passbook.",
                "Report unexpected messages at cybercrime.gov.in or on 1930.",
            ],
            "report_to": ["National Cyber Crime Helpline: 1930", "cybercrime.gov.in"],
            "plain_summary": "The wording and sender match a routine notification. Confirm it in the official app before acting on any OTP or payment request.",
        }

    if case == "scam":
        if language == "hi":
            return {
                "language": "hi",
                "headline": "यह धोखाधड़ी है। लिंक पर क्लिक न करें और नंबर पर कॉल न करें।",
                "do_not": [
                    "OTP, UPI PIN, ATM PIN या बैंक पासवर्ड किसी को न बताएँ।",
                    "संदेश में दिए लिंक पर क्लिक न करें या फॉर्म न भरें।",
                    "AnyDesk, TeamViewer जैसा रिमोट ऐप इंस्टॉल न करें।",
                ],
                "do_next": [
                    "बैंक के आधिकारिक नंबर पर खुद कॉल करके खाता जाँचें।",
                    "cybercrime.gov.in पर रिपोर्ट दर्ज करें या 1930 पर कॉल करें।",
                    "पैसे कट गए हों तो तुरंत बैंक को बताएँ और कार्ड ब्लॉक कराएँ।",
                ],
                "report_to": ["राष्ट्रीय साइबर अपराध हेल्पलाइन: 1930", "cybercrime.gov.in"],
                "plain_summary": "संदेश नकली बैंक लिंक और निजी मोबाइल नंबर का इस्तेमाल करके डर बना रहा है। इसे अनदेखा करें और केवल आधिकारिक बैंक ऐप से जाँच करें।",
            }
        return {
            "language": "en",
            "headline": "This is a scam. Do not click the link or call the number.",
            "do_not": [
                "Never share an OTP, UPI PIN, ATM PIN or bank password.",
                "Do not click the link or fill any form in the message.",
                "Do not install AnyDesk, TeamViewer or any remote-access app.",
            ],
            "do_next": [
                "Call your bank on its official number and verify your account.",
                "Report the message at cybercrime.gov.in or call 1930.",
                "If money left your account, tell your bank and block the card now.",
            ],
            "report_to": ["National Cyber Crime Helpline: 1930", "cybercrime.gov.in"],
            "plain_summary": "The message uses a lookalike bank link and a personal mobile number to create panic. Ignore it and verify only inside your bank's official app.",
        }

    if language == "hi":
        return {
            "language": "hi",
            "headline": "सावधान रहें। यह बिल या भुगतान अभी सत्यापित नहीं है।",
            "do_not": [
                "संदेश के लिंक से भुगतान न करें।",
                "OTP या UPI PIN किसी को न बताएँ।",
                "अनजान UPI हैंडल पर पैसे न भेजें।",
            ],
            "do_next": [
                "बिजली/सेवा प्रदाता के आधिकारिक ऐप या वेबसाइट पर बिल जाँचें।",
                "अपने बैंक ऐप में पिछला भुगतान देखें।",
                "संदेह हो तो 1930 पर कॉल करें या cybercrime.gov.in पर रिपोर्ट करें।",
            ],
            "report_to": ["राष्ट्रीय साइबर अपराध हेल्पलाइन: 1930", "cybercrime.gov.in"],
            "plain_summary": "संदेश में जल्दबाज़ी और छोटा लिंक है, लेकिन प्रेषक की पुष्टि नहीं हो सकी। भुगतान से पहले आधिकारिक ऐप में बिल जाँचें।",
        }
    return {
        "language": "en",
        "headline": "Be careful. This bill or payment cannot be verified yet.",
        "do_not": [
            "Do not pay through the link in this message.",
            "Do not share an OTP or UPI PIN with anyone.",
            "Do not send money to an unverified UPI handle.",
        ],
        "do_next": [
            "Open the electricity or service provider's official app and check the bill.",
            "Look up the last payment inside your bank app.",
            "If unsure, call 1930 or report at cybercrime.gov.in.",
        ],
        "report_to": ["National Cyber Crime Helpline: 1930", "cybercrime.gov.in"],
        "plain_summary": "The message combines urgency with a shortened link, but the sender cannot be verified. Check the bill in the official app before paying anything.",
    }


def _build_result(text: str, language: str, case: str, simulate_partial: bool) -> dict[str, Any]:
    """Build a complete AnalysisResult-shaped dictionary for a canned case."""
    advice_language = "hi" if language == "hi" else "en"
    if language == "auto":
        advice_language = "hi" if any("\u0900" <= ch <= "\u097f" for ch in text) else "en"

    if case == "scam":
        extracted = _extracted(
            text,
            "AX-SBIINB",
            ["http://sbi-kyc-update.xyz/login"],
            ["9876543210"],
            [],
            "State Bank of India",
            "Fake SBI KYC suspension notice with a lookalike phishing link.",
        )
        pattern = {
            "status": "ok",
            "score": 88,
            "tactics": ["urgency", "fear", "kyc_threat", "impersonation", "click_pressure"],
            "impersonated_entity": "State Bank of India",
            "reasons": [
                "Artificial deadline: “blocked immediately” and “permanent deactivation”.",
                "KYC threat used to force a click.",
                "Bank name used with a link that is not on sbi.co.in.",
            ],
        }
        entity = {
            "status": "ok",
            "risk_score": 96,
            "findings": [
                _finding(
                    "sbi-kyc-update.xyz",
                    "url",
                    "Lookalike domain imitates State Bank of India",
                    "high",
                    "lookalike_detection",
                ),
                _finding(
                    "sbi-kyc-update.xyz",
                    "url",
                    "Domain registered 3 days ago on a high-abuse .xyz TLD",
                    "high",
                    "whois",
                ),
                _finding(
                    "9876543210",
                    "phone",
                    "Personal mobile number presented as a bank helpline",
                    "high",
                    "telecom_heuristics",
                ),
                _finding(
                    "AX-SBIINB",
                    "sender",
                    "Sender header does not match the official bank domain",
                    "medium",
                    "trai_header_check",
                ),
            ],
            "reasons": [
                "The link is a lookalike of SBI, not an official sbi.co.in address.",
                "The domain is newly registered and uses a high-abuse TLD.",
                "The contact number is a personal mobile, not a bank helpline.",
            ],
            "unchecked": [],
        }
        verdict = {
            "verdict": "scam",
            "confidence": 96,
            "reasoning": "The message pressures the reader with a fake KYC block and sends them to a newly registered lookalike domain. Technical evidence outweighs the official-looking bank language.",
            "conflicts": [
                {
                    "description": "The message imitates an official SBI alert, but the link is sbi-kyc-update.xyz and the contact is a personal mobile.",
                    "resolution": "The lookalike domain and new registration override the polite, official-sounding language. Verdict: scam.",
                }
            ],
            "key_evidence": [
                "Lookalike domain: sbi-kyc-update.xyz (not sbi.co.in)",
                "Domain registered 3 days ago",
                "Personal mobile 9876543210 used as a bank helpline",
                "KYC threat with an artificial deadline",
            ],
        }
        timings = {"extractor": 410.0, "pattern_analyst_and_entity_checker_parallel": 720.0, "judge": 360.0, "advisor": 300.0, "total": 1830.0}
    elif case == "safe":
        lowered = text.lower()
        if "otp" in lowered or "verification code" in lowered:
            summary = "Routine OTP notification that tells the user not to share the code."
            sender = "AD-HDFCBK"
        elif "delivery" in lowered or "order" in lowered or "dispatched" in lowered:
            summary = "Routine delivery update pointing to the official Amazon app."
            sender = "AM-AZONIN"
        else:
            summary = "Routine bank debit alert with a masked account and no links."
            sender = "AD-HDFCBK"
        extracted = _extracted(text, sender, [], [], [], "HDFC Bank", summary)
        pattern = {
            "status": "ok",
            "score": 4,
            "tactics": [],
            "impersonated_entity": None,
            "reasons": [
                "Standard notification format with no artificial deadline.",
                "No request for an OTP, PIN or password.",
            ],
        }
        entity = {
            "status": "ok",
            "risk_score": 0,
            "findings": [
                _finding(sender, "sender", "Verified TRAI commercial SMS header", "low", "trai_header_check")
            ],
            "reasons": ["No links, phone numbers or UPI IDs to investigate."],
            "unchecked": [],
        }
        verdict = {
            "verdict": "safe",
            "confidence": 94,
            "reasoning": "The format matches a routine bank or delivery notification. There is no link, no credential request and no pressure tactic.",
            "conflicts": [],
            "key_evidence": [
                "Official-style TRAI sender header",
                "No links or payment handles",
                "No urgency or credential request",
            ],
        }
        timings = {"extractor": 300.0, "pattern_analyst_and_entity_checker_parallel": 480.0, "judge": 260.0, "advisor": 220.0, "total": 1260.0}
    else:
        extracted = _extracted(
            text,
            "+919812345670",
            ["https://bit.ly/3xPayNow"],
            ["9812345670"],
            ["electricity.help@ybl"],
            "State Electricity Board",
            "Unverified electricity disconnection notice with a shortened payment link.",
        )
        pattern = {
            "status": "ok",
            "score": 58,
            "tactics": ["urgency", "fear", "impersonation", "payment_request"],
            "impersonated_entity": "State Electricity Board",
            "reasons": [
                "Disconnection threatened tonight at 9:30 pm.",
                "The payment link is shortened, so the destination is hidden.",
                "A personal mobile number is given as the electricity office.",
            ],
        }
        entity = {
            "status": "ok",
            "risk_score": 55,
            "findings": [
                _finding(
                    "https://bit.ly/3xPayNow",
                    "url",
                    "Shortened link hides the final payment destination",
                    "medium",
                    "shortener_detection",
                ),
                _finding(
                    "electricity.help@ybl",
                    "upi",
                    "UPI handle uses support language but is not an official board handle",
                    "medium",
                    "upi_handle_analyzer",
                ),
                _finding(
                    "9812345670",
                    "phone",
                    "Personal mobile presented as an electricity office",
                    "medium",
                    "telecom_heuristics",
                ),
            ],
            "reasons": [
                "The shortened link prevents destination verification.",
                "The UPI handle cannot be tied to the electricity board.",
            ],
            "unchecked": ["One reputation provider returned no data."],
        }
        verdict = {
            "verdict": "suspicious",
            "confidence": 71,
            "reasoning": "There is real pressure and a hidden payment path, but the evidence is not strong enough to prove a scam. Treat it as unsafe until the bill is checked in the official app.",
            "conflicts": [
                {
                    "description": "The message looks like a routine bill reminder, but the shortened link and personal mobile number are not official.",
                    "resolution": "Resolved as suspicious: do not pay through the message, verify the bill independently.",
                }
            ],
            "key_evidence": [
                "Shortened payment link hides the destination",
                "Personal mobile 9812345670 used as an electricity office",
                "UPI handle electricity.help@ybl is not an official board handle",
                "Disconnection threatened tonight",
            ],
        }
        timings = {"extractor": 380.0, "pattern_analyst_and_entity_checker_parallel": 610.0, "judge": 330.0, "advisor": 270.0, "total": 1590.0}

    if simulate_partial:
        entity = {
            "status": "could_not_check",
            "risk_score": 0,
            "findings": [],
            "reasons": ["Reputation services did not respond in time."],
            "unchecked": [
                "sbi-kyc-update.xyz" if case == "scam" else "shortened link destination",
                "WHOIS lookup",
            ],
        }
        verdict = {
            "verdict": "suspicious" if case != "safe" else "safe",
            "confidence": 42 if case != "safe" else 70,
            "reasoning": (
                "The behavioural pattern is suspicious, but the technical entity checks could not complete. "
                "Out of caution, treat the message as unverified."
            ),
            "conflicts": [
                {
                    "description": "Pattern analysis raised concerns while the Entity Checker could not return evidence.",
                    "resolution": "Missing technical evidence is not treated as proof of safety. Verdict stays cautious.",
                }
            ],
            "key_evidence": [
                "Entity checks unavailable",
                "Behavioural pressure still present",
                "Verify independently before acting",
            ],
        }

    result = {
        "extracted": extracted,
        "pattern": pattern,
        "entity": entity,
        "verdict": verdict,
        "advice": _advice(advice_language, case),
        "timings_ms": timings,
        "cache_hit": False,
    }
    if advice_language == "hi":
        _localize_to_hindi(result, case, simulate_partial)
    return result


def _replace_text(container: dict[str, Any], key: str, value: str) -> None:
    """Replace a text field when it exists."""
    if key in container:
        container[key] = value


def _replace_list(container: dict[str, Any], key: str, values: list[str]) -> None:
    """Replace as many list items as the original list had."""
    current = container.get(key)
    if not isinstance(current, list):
        return
    for index, value in enumerate(values[: len(current)]):
        current[index] = value


def _localize_to_hindi(result: dict[str, Any], case: str, partial: bool) -> None:
    """Translate the canned demo's agent prose into Hindi.

    Technical values (domains, phone numbers, UPI IDs) stay unchanged.
    """
    extracted = result["extracted"]
    pattern = result["pattern"]
    entity = result["entity"]
    verdict = result["verdict"]

    if case == "scam":
        _replace_text(extracted, "summary", "नकली SBI KYC निलंबन संदेश और फ़र्ज़ी लिंक।")
        _replace_list(pattern, "reasons", [
            "कृत्रिम समय-सीमा: “तुरंत ब्लॉक” और “स्थायी रूप से बंद”।",
            "क्लिक कराने के लिए KYC की धमकी।",
            "बैंक का नाम, लेकिन लिंक sbi.co.in पर नहीं है।",
        ])
        _replace_list(entity, "reasons", [
            "लिंक SBI की नकल है, आधिकारिक sbi.co.in नहीं।",
            "डोमेन नया है और संदिग्ध TLD पर है।",
            "संपर्क नंबर निजी मोबाइल है, बैंक हेल्पलाइन नहीं।",
        ])
        signals = [
            "नकली डोमेन भारतीय स्टेट बैंक की नकल कर रहा है",
            "डोमेन 3 दिन पहले खरीदा गया और .xyz TLD का दुरुपयोग करता है",
            "निजी मोबाइल नंबर को बैंक हेल्पलाइन बताया गया",
            "प्रेषक हेडर आधिकारिक बैंक डोमेन से मेल नहीं खाता",
        ]
        _replace_text(verdict, "reasoning", (
            "संदेश नकली KYC ब्लॉक का डर दिखाकर नए बने नकली डोमेन पर भेजता है। "
            "तकनीकी सबूत आधिकारिक दिखने वाली भाषा से ज़्यादा महत्वपूर्ण हैं।"
        ))
        _replace_list(verdict, "key_evidence", [
            "नकली डोमेन: sbi-kyc-update.xyz (sbi.co.in नहीं)",
            "डोमेन 3 दिन पहले रजिस्टर हुआ",
            "निजी मोबाइल 9876543210 को बैंक हेल्पलाइन बताया गया",
            "KYC की धमकी और कृत्रिम समय-सीमा",
        ])
        conflicts = verdict.get("conflicts") or []
        if conflicts:
            conflicts[0]["description"] = (
                "संदेश आधिकारिक SBI अलर्ट जैसा है, लेकिन लिंक sbi-kyc-update.xyz है और संपर्क निजी मोबाइल है।"
            )
            conflicts[0]["resolution"] = (
                "नकली डोमेन और नई रजिस्ट्रेशन विनम्र भाषा पर भारी पड़ती है। फैसला: धोखाधड़ी।"
            )
    elif case == "safe":
        _replace_text(extracted, "summary", "सामान्य बैंक या डिलीवरी सूचना, कोई संदिग्ध लिंक नहीं।")
        _replace_list(pattern, "reasons", [
            "मानक सूचना, कोई कृत्रिम समय-सीमा नहीं।",
            "OTP, PIN या पासवर्ड माँगने का अनुरोध नहीं।",
        ])
        _replace_list(entity, "reasons", ["जाँचने के लिए कोई लिंक, फ़ोन नंबर या UPI ID नहीं।"])
        findings = entity.get("findings") or []
        if findings:
            findings[0]["signal"] = "सत्यापित TRAI व्यावसायिक SMS हेडर"
        _replace_text(verdict, "reasoning", (
            "स्वरूप सामान्य बैंक या डिलीवरी सूचना जैसा है। कोई लिंक, गोपनीय जानकारी की माँग "
            "या दबाव नहीं है।"
        ))
        _replace_list(verdict, "key_evidence", [
            "आधिकारिक TRAI हेडर जैसा स्वरूप",
            "कोई लिंक या भुगतान हैंडल नहीं",
            "कोई जल्दबाज़ी या OTP माँग नहीं",
        ])
    else:
        _replace_text(extracted, "summary", "बिजली कनेक्शन कटने की अप्रमाणित सूचना, छोटा भुगतान लिंक।")
        _replace_list(pattern, "reasons", [
            "आज रात 9:30 बजे बिजली कटने की धमकी।",
            "भुगतान लिंक छोटा है, असली मंज़िल छिपी है।",
            "बिजली कार्यालय के नाम पर निजी मोबाइल नंबर।",
        ])
        _replace_list(entity, "reasons", [
            "छोटा लिंक होने से भुगतान की मंज़िल की पुष्टि नहीं होती।",
            "UPI हैंडल बिजली बोर्ड से जुड़ा नहीं जा सकता।",
        ])
        _replace_list(entity, "unchecked", ["एक प्रतिष्ठा सेवा ने डेटा नहीं दिया।"])
        _replace_text(verdict, "reasoning", (
            "दबाव और छिपा भुगतान रास्ता है, लेकिन धोखाधड़ी सिद्ध करने के लिए सबूत कम हैं। "
            "आधिकारिक ऐप में बिल जाँचे बिना भुगतान न करें।"
        ))
        _replace_list(verdict, "key_evidence", [
            "छोटा भुगतान लिंक असली मंज़िल छिपाता है",
            "निजी मोबाइल 9812345670 को बिजली कार्यालय बताया गया",
            "UPI हैंडल electricity.help@ybl आधिकारिक बोर्ड का नहीं है",
            "आज रात बिजली कटने की धमकी",
        ])
        conflicts = verdict.get("conflicts") or []
        if conflicts:
            conflicts[0]["description"] = (
                "संदेश सामान्य बिल रिमाइंडर जैसा है, लेकिन छोटा लिंक और निजी मोबाइल आधिकारिक नहीं हैं।"
            )
            conflicts[0]["resolution"] = (
                "सावधानी के लिए संदिग्ध माना गया: संदेश से भुगतान न करें, बिल अलग से जाँचें।"
            )

    findings = entity.get("findings") or []
    if findings and case == "scam":
        for index, signal in enumerate(signals[: len(findings)]):
            findings[index]["signal"] = signal

    if partial:
        _replace_list(entity, "reasons", ["प्रतिष्ठा सेवाओं ने समय पर जवाब नहीं दिया।"])
        _replace_list(entity, "unchecked", ["डोमेन की प्रतिष्ठा", "WHOIS जाँच"])
        _replace_text(verdict, "reasoning", (
            "व्यवहार का पैटर्न संदिग्ध है, लेकिन तकनीकी जाँच पूरी नहीं हो सकी। "
            "सावधानी के लिए संदेश को अपुष्ट मानें।"
        ))
        _replace_list(verdict, "key_evidence", [
            "तकनीकी जाँच उपलब्ध नहीं",
            "व्यवहार में दबाव अभी भी मौजूद",
            "कोई कदम उठाने से पहले खुद पुष्टि करें",
        ])
        conflicts = verdict.get("conflicts") or []
        if conflicts:
            conflicts[0]["description"] = "पैटर्न विश्लेषण ने चिंता जताई, लेकिन एंटिटी चेकर सबूत नहीं दे सका।"
            conflicts[0]["resolution"] = "तकनीकी सबूत न मिलना सुरक्षा का सबूत नहीं है। फैसला सावधानी भरा रहेगा।"


def stream_stub(
    text: str,
    language: str = "auto",
    *,
    simulate_partial: bool = False,
    delay: float = 0.32,
) -> Generator[dict[str, Any], None, None]:
    """Yield a canned agent stream with short, readable delays."""
    case = _pick_case(text)
    if text.strip().lower().startswith("[screenshot"):
        case = "suspicious"
    result = _build_result(text, language, case, simulate_partial)
    stages = [
        ("extractor", "extracted"),
        ("pattern_analyst", "pattern"),
        ("entity_checker", "entity"),
        ("judge", "verdict"),
        ("advisor", "advice"),
    ]

    for stage, key in stages:
        yield {"stage": stage, "status": "running"}
        time.sleep(delay)
        status = "could_not_check" if (stage == "entity_checker" and simulate_partial) else "done"
        yield {"stage": stage, "status": status, "data": result[key]}
        time.sleep(delay / 2)

    yield {"stage": "complete", "status": "done", "data": result}


def stub_result(text: str, language: str = "auto", simulate_partial: bool = False) -> dict[str, Any]:
    """Return the final canned result without streaming (used by tests)."""
    case = _pick_case(text)
    return _build_result(text, language, case, simulate_partial)
