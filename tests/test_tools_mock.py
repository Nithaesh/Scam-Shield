"""Unit tests for tools_mock and tools_interface verifying 10 diverse URLs."""

import pytest
from tools_interface import check_entities
from tools_mock import mock_check_entities


def test_mock_on_ten_urls():
    """Verify mock tool classification across 10 distinct URLs."""
    test_urls = [
        # (url, expected_lookalike, expected_threat_or_safe)
        ("https://sbi.co.in/portal/web/home", None, "safe"),
        ("https://hdfcbank.com/personal", None, "safe"),
        ("https://amazon.in/orders", None, "safe"),
        ("http://sbi-kyc-update.xyz/login", "State Bank of India", "threat"),
        ("http://hdfcbank-security.top/verify", "HDFC Bank", "threat"),
        ("https://bit.ly/claim-lottery-prize", None, "threat"),
        ("http://192.168.1.100/apk/bank.apk", None, "threat"),
        ("http://irctc-refund-ticket.click/auth", "IRCTC", "threat"),
        ("http://amaz0n-giftcard.site/win", "Amazon", "threat"),
        ("https://tinyurl.com/meeting123", None, "neutral_shortener"),
    ]

    for url, exp_lookalike, exp_status in test_urls:
        extracted = {
            "sender": "TEST",
            "message_text": f"Visit {url}",
            "urls": [url],
            "phone_numbers": [],
            "upi_ids": [],
            "language": "en",
            "claimed_organisation": None,
            "summary": "Testing url",
        }
        evidence = check_entities(extracted)
        assert "urls" in evidence
        assert len(evidence["urls"]) == 1
        url_evidence = evidence["urls"][0]

        # Check required schema fields
        for field in [
            "url", "domain", "tld", "is_shortener", "is_ip_based",
            "lookalike_of", "domain_age_days", "virustotal",
            "safe_browsing", "urlhaus", "errors",
        ]:
            assert field in url_evidence, f"Missing field {field} for {url}"

        if exp_status == "safe":
            assert url_evidence["virustotal"]["malicious"] == 0
            assert url_evidence["safe_browsing"]["flagged"] is False
            assert url_evidence["lookalike_of"] is None
            assert url_evidence["domain_age_days"] > 365
        elif exp_status == "threat":
            if exp_lookalike:
                assert url_evidence["lookalike_of"] == exp_lookalike, f"Lookalike mismatch for {url}"
            assert (
                url_evidence["virustotal"]["malicious"] > 0
                or url_evidence["safe_browsing"]["flagged"] is True
                or url_evidence["is_ip_based"] is True
            ), f"Expected threat signals for {url}"
        elif exp_status == "neutral_shortener":
            assert url_evidence["is_shortener"] is True


def test_phone_and_upi_mock_checks():
    """Verify phone and UPI checks work correctly in the mock."""
    extracted = {
        "sender": "+919876543210",
        "message_text": "SBI account blocked. Call 9876543210 or pay to sbi.kyc@paytm",
        "urls": [],
        "phone_numbers": ["9876543210", "1800123456"],
        "upi_ids": ["sbi.kyc@paytm", "regularuser@okhdfcbank"],
        "language": "en",
        "claimed_organisation": "SBI",
        "summary": "Fake block message",
    }
    evidence = check_entities(extracted)

    # Phone checks
    phones = evidence["phones"]
    assert len(phones) == 2
    fraud_phone = next(p for p in phones if p["phone"] == "9876543210")
    toll_free = next(p for p in phones if p["phone"] == "1800123456")
    assert fraud_phone["reputation"] == "reported_fraud"
    assert toll_free["reputation"] == "official_helpline"

    # UPI checks
    upi_list = evidence["upi"]
    assert len(upi_list) == 2
    scam_upi = next(u for u in upi_list if u["upi_id"] == "sbi.kyc@paytm")
    assert scam_upi["is_impersonation"] is True
    assert scam_upi["reputation"] == "high_risk_impersonation"

    # Sender mismatch
    sender_info = evidence["sender"]
    assert sender_info["is_official_header"] is False
    assert sender_info["mismatch_with_claimed"] is True
