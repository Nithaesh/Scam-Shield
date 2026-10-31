"""Comprehensive unit tests for v2 backend services."""

import base64
import io
import json
import pytest
from PIL import Image

from v2.api.services.normalize import normalize_text, detect_devanagari, resolve_language
from v2.api.services.image_validation import validate_and_sanitize_image
from v2.api.services.scam_taxonomy import classify_scam_taxonomy
from v2.api.services.share_text import generate_share_text
from v2.api.services.conflict import detect_evidence_conflict
from v2.api.services.community import (
    normalize_entity_value,
    compute_entity_hash,
    mask_entity_for_display,
    check_community_escalation,
)
from v2.api.models.schemas import CommunityLookupMatch


# ============================================================================
# 1. Normalization Tests
# ============================================================================

def test_normalize_strips_null_and_zero_width():
    raw = "Ur\x00gent: Yo\u200bur S\u200bB\u200bI ac\u200bcount is bl\u200bocked.\ufeff"
    cleaned = normalize_text(raw)
    assert "\x00" not in cleaned
    assert "\u200b" not in cleaned
    assert "\ufeff" not in cleaned
    assert "Urgent: Your SBI account is blocked." in cleaned


def test_normalize_caps_max_length():
    long_text = "A" * 6000
    cleaned = normalize_text(long_text, max_chars=5000)
    assert len(cleaned) == 5000


def test_detect_devanagari_and_resolve_language():
    hi_text = "प्रिय ग्राहक आपका खाता ब्लॉक है"
    en_text = "Dear customer your account is blocked"
    assert detect_devanagari(hi_text) is True
    assert detect_devanagari(en_text) is False
    assert resolve_language("auto", hi_text) == "hi"
    assert resolve_language("auto", en_text) == "en"
    assert resolve_language("hi", en_text) == "hi"


# ============================================================================
# 2. Image Validation Tests
# ============================================================================

def _make_dummy_image_b64(fmt="PNG", size=(300, 300)):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=(255, 0, 0))
    img.save(buf, format=fmt)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def test_validate_and_sanitize_image_success():
    b64 = _make_dummy_image_b64("PNG")
    raw_bytes, mime = validate_and_sanitize_image(b64, "image/png")
    assert mime == "image/png"
    assert len(raw_bytes) > 0


def test_validate_image_rejects_empty():
    with pytest.raises(ValueError, match="empty"):
        validate_and_sanitize_image("")


def test_validate_image_rejects_invalid_base64():
    with pytest.raises(ValueError, match="Invalid Base64"):
        validate_and_sanitize_image("!!!NotBase64!!!")


def test_validate_image_rejects_unsupported_format():
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100))
    img.save(buf, format="GIF")
    gif_b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    with pytest.raises(ValueError, match="Unsupported image format"):
        validate_and_sanitize_image(gif_b64)


def test_validate_image_rejects_oversized_dimensions():
    b64 = _make_dummy_image_b64("PNG", size=(4001, 100))
    with pytest.raises(ValueError, match="dimensions"):
        validate_and_sanitize_image(b64)


# ============================================================================
# 3. Scam Taxonomy Tests
# ============================================================================

@pytest.mark.parametrize(
    "text,verdict,expected_tax",
    [
        ("Your electricity power will be disconnected at 9:30 PM", "scam", "electricity_bill"),
        ("बिजली बिल बकाया है कनेक्शन काट दिया जाएगा", "scam", "electricity_bill"),
        ("SBI YONO account KYC blocked update immediately", "scam", "bank_kyc"),
        ("CBI notice you are under Digital Arrest", "scam", "digital_arrest"),
        ("KBC lottery winner Rs 25 Lakh", "scam", "lottery_prize"),
        ("Daily YouTube video like work from home Rs 3500", "scam", "job_offer"),
        ("Download pm-kisan yojana app link at http://test.com/app.apk", "scam", "govt_scheme_apk"),
        ("INR 500 debited from account Ref 12345", "safe", "none"),
    ],
)
def test_scam_taxonomy_classification(text, verdict, expected_tax):
    tax = classify_scam_taxonomy(text=text, verdict=verdict)
    assert tax == expected_tax


# ============================================================================
# 4. WhatsApp Share Text Tests
# ============================================================================

def test_share_text_constraints():
    en_share = generate_share_text(verdict="scam", scam_type="bank_kyc", language="en")
    hi_share = generate_share_text(verdict="scam", scam_type="electricity_bill", language="hi")

    assert len(en_share) <= 280
    assert len(hi_share) <= 280
    assert "1930" in en_share
    assert "1930" in hi_share
    assert "Scam Shield" in en_share
    assert "Scam Shield" in hi_share


# ============================================================================
# 5. Conflict Detection Tests
# ============================================================================

def test_conflict_polite_language_malicious_link():
    conflict = detect_evidence_conflict(
        pattern_score=15,
        entity_risk_score=85,
        tactics=[],
        findings=[{"type": "url", "signal": "Lookalike domain of SBI", "severity": "high"}],
    )
    assert conflict is not None
    assert conflict.winner == "checker"
    assert "precedence" in conflict.resolution.lower()


def test_conflict_urgent_tone_official_domain():
    conflict = detect_evidence_conflict(
        pattern_score=75,
        entity_risk_score=5,
        tactics=["urgency"],
        findings=[],
    )
    assert conflict is not None
    assert conflict.winner == "checker"


def test_conflict_none_when_agree():
    conflict = detect_evidence_conflict(
        pattern_score=90,
        entity_risk_score=90,
        tactics=["urgency", "kyc_threat"],
        findings=[{"type": "url", "signal": "malicious", "severity": "high"}],
    )
    assert conflict is None


# ============================================================================
# 6. Community Hashing, Masking & Escalation Tests
# ============================================================================

def test_community_normalization_and_hashing():
    phone_norm = normalize_entity_value("phone", "9876543210")
    assert phone_norm.startswith("+91")

    upi_norm = normalize_entity_value("upi", "SBI.KYC@PAYTM")
    assert upi_norm == "sbi.kyc@paytm"

    domain_norm = normalize_entity_value("domain", "http://login.sbi-kyc.xyz/auth")
    assert domain_norm == "sbi-kyc.xyz"

    h1 = compute_entity_hash("domain", domain_norm, salt="test_salt")
    h2 = compute_entity_hash("domain", domain_norm, salt="test_salt")
    assert h1 == h2
    assert len(h1) == 64


def test_community_masking():
    masked_phone = mask_entity_for_display("phone", "+919876543210")
    assert "****" in masked_phone
    masked_upi = mask_entity_for_display("upi", "frauduser@ybl")
    assert "@ybl" in masked_upi
    masked_dom = mask_entity_for_display("domain", "sbi-kyc.xyz")
    assert ".xyz" in masked_dom


def test_community_escalation_never_lowers():
    matches = [
        CommunityLookupMatch(
            entity_type="domain",
            entity_masked="sbi-***.xyz",
            report_count=5,
        )
    ]
    # 'safe' escalated to 'suspicious'
    v, note = check_community_escalation("safe", matches, escalation_enabled=True)
    assert v == "suspicious"
    assert note is not None

    # 'scam' is NOT lowered
    v_scam, _ = check_community_escalation("scam", matches, escalation_enabled=True)
    assert v_scam == "scam"


# ============================================================================
# 7. Enrichment Service Tests
# ============================================================================

from v2.api.services.enrichment import enrich_analysis_result


def test_enrich_analysis_result_dict_input():
    raw_dict = {
        "extracted": {
            "urls": ["http://sbi-fake-kyc.com"],
            "phone_numbers": ["+919876543210"],
            "upi_ids": ["scammer@upi"],
            "sender": "VK-SBI",
            "message_text": "Update your SBI YONO account kyc immediately",
        },
        "pattern": {
            "score": 85,
            "tactics": ["urgency", "threat"],
        },
        "entity": {
            "risk_score": 90,
            "findings": [{"type": "url", "signal": "Phishing URL", "severity": "high"}],
        },
        "verdict": {
            "verdict": "scam",
            "confidence": 95,
            "reasoning": "Fake domain imitating SBI with threat tactics.",
            "conflicts": [],
        },
        "advice": {
            "headline": "Do not open any link from this SMS",
            "actions": ["Delete message", "Call 1930"],
        },
    }
    result = enrich_analysis_result(
        result=raw_dict,
        raw_text="Update your SBI YONO account kyc immediately http://sbi-fake-kyc.com",
        language="en",
        request_id="req-12345",
        total_ms=45.2,
        cached=False,
    )
    assert result.verdict == "scam"
    assert result.confidence == 0.95
    assert result.scam_type == "bank_kyc"
    assert result.request_id == "req-12345"
    assert result.total_ms == 45.2
    assert "1930" in result.share_text
    assert len(result.advice.do_not) > 0


def test_share_text_variations():
    for verdict in ["scam", "suspicious", "safe"]:
        for lang in ["en", "hi"]:
            text = generate_share_text(verdict=verdict, scam_type="electricity_bill", language=lang)
            assert len(text) <= 280
            assert "Scam Shield" in text


# ============================================================================
# 8. Pipeline Service Unit Tests
# ============================================================================

from v2.api.services.pipeline import stream_pipeline_analysis


@pytest.mark.asyncio
async def test_stream_pipeline_analysis_offline():
    events = []
    async for item in stream_pipeline_analysis(
        input_data="Your electricity connection will be disconnected tonight",
        language="en",
        request_id="req-test-pipeline-1",
        raw_text="Your electricity connection will be disconnected tonight",
    ):
        events.append(item)

    event_names = [e["event"] for e in events]
    assert "stage_start" in event_names
    assert "stage_result" in event_names
    assert "final" in event_names

    # Check final event payload
    final_payload = json.loads(events[-1]["data"])
    assert final_payload["verdict"] == "scam"
    assert final_payload["request_id"] == "req-test-pipeline-1"


