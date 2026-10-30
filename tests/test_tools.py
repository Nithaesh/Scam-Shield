"""Offline tests for the real Entity Checker tools.

Every network call is stubbed. The suite verifies the exact contract shape,
lookalike coverage, timeout behaviour and crash safety.
"""

from __future__ import annotations

import base64
import datetime as dt
import json
import time

import pytest
import requests

import tools_interface
from tools import (
    brands,
    domain_checks,
    phone_checks,
    real,
    reputation,
    sender_checks,
    upi_checks,
    whois_check,
)
from tools_real import real_check_entities

URL_KEYS = {
    "url",
    "domain",
    "tld",
    "is_shortener",
    "is_ip_based",
    "lookalike_of",
    "domain_age_days",
    "virustotal",
    "safe_browsing",
    "urlhaus",
    "errors",
}
PHONE_KEYS = {
    "phone",
    "is_valid_format",
    "is_shortcode",
    "carrier_type",
    "scam_reports_count",
    "reputation",
    "errors",
}
UPI_KEYS = {
    "upi_id",
    "handle",
    "user",
    "is_impersonation",
    "target_entity",
    "reputation",
    "errors",
}
SENDER_KEYS = {
    "raw_sender",
    "is_official_header",
    "header_entity",
    "mismatch_with_claimed",
    "errors",
}


class FakeResponse:
    """Minimal requests.Response stand-in."""

    def __init__(self, status_code: int = 200, payload: object = None) -> None:
        self.status_code = status_code
        self._payload = payload

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise requests.HTTPError(f"status {self.status_code}")

    def json(self) -> object:
        if isinstance(self._payload, Exception):
            raise self._payload
        return self._payload


@pytest.fixture(autouse=True)
def offline(monkeypatch: pytest.MonkeyPatch) -> None:
    """Keep every test offline and deterministic by default."""
    for key in ("VIRUSTOTAL_API_KEY", "SAFE_BROWSING_API_KEY", "URLHAUS_AUTH_KEY"):
        monkeypatch.delenv(key, raising=False)
    monkeypatch.setattr(
        whois_check,
        "_query",
        lambda domain, timeout_s: {"creation_date": dt.datetime(2019, 1, 1)},
    )


def _extracted(**overrides: object) -> dict[str, object]:
    base: dict[str, object] = {
        "sender": None,
        "message_text": "test message",
        "urls": [],
        "phone_numbers": [],
        "upi_ids": [],
        "language": "en",
        "claimed_organisation": None,
        "summary": "",
    }
    base.update(overrides)
    return base


# --------------------------------------------------------------------------- URLs


@pytest.mark.parametrize(
    "url",
    [
        "https://sbi.co.in/portal/web/home",
        "https://netbanking.hdfcbank.com/login",
        "https://www.amazon.co.uk/orders",
        "https://pay.google.com/",
        "https://github.com/openai",
        "https://example.com/path?q=1",
        "http://sbi-kyc-update.xyz/login",
        "http://hdfcbank-security.top/verify",
        "http://amaz0n-giftcard.site/win",
        "http://irctc-refund-ticket.click/auth",
        "https://bit.ly/claim-lottery-prize",
        "http://192.168.1.100/apk/bank.apk",
        "http://[2001:db8::1]/x",
        "sbi-kyc-update.xyz/login",
        "hxxp://paytm-kyc[.]xyz/login",
        "javascript:alert(1)",
        "ftp://example.com/x",
        "not a url",
    ],
)
def test_url_contract_shape(url: str) -> None:
    """Every URL produces exactly the documented fields."""
    evidence = real_check_entities(_extracted(urls=[url]))
    assert set(evidence) == {"urls", "phones", "upi", "sender"}
    assert len(evidence["urls"]) == 1
    record = evidence["urls"][0]
    assert set(record) == URL_KEYS
    assert isinstance(record["errors"], list)
    assert isinstance(record["is_shortener"], bool)
    assert isinstance(record["is_ip_based"], bool)
    assert record["virustotal"] is None
    assert record["safe_browsing"] is None
    assert record["urlhaus"] is None


def test_url_specific_findings() -> None:
    """Check the important classifications explicitly."""
    def analyse(url: str) -> dict[str, object]:
        return real_check_entities(_extracted(urls=[url]))["urls"][0]

    official = analyse("https://netbanking.hdfcbank.com/login")
    assert official["domain"] == "hdfcbank.com"
    assert official["lookalike_of"] is None
    assert official["domain_age_days"] is not None
    assert official["domain_age_days"] > 365

    lookalike = analyse("http://sbi-kyc-update.xyz/login")
    assert lookalike["lookalike_of"] == "State Bank of India"
    assert lookalike["domain"] == "sbi-kyc-update.xyz"
    assert lookalike["tld"] == "xyz"

    shortener = analyse("https://bit.ly/claim-lottery-prize")
    assert shortener["is_shortener"] is True
    assert shortener["lookalike_of"] is None

    ip_based = analyse("http://192.168.1.100/apk/bank.apk")
    assert ip_based["is_ip_based"] is True
    assert ip_based["domain"] == "192.168.1.100"
    assert ip_based["tld"] == ""
    assert ip_based["domain_age_days"] is None

    defanged = analyse("hxxp://paytm-kyc[.]xyz/login")
    assert defanged["lookalike_of"] == "Paytm"
    assert defanged["domain"] == "paytm-kyc.xyz"

    bad_scheme = analyse("javascript:alert(1)")
    assert bad_scheme["domain"] == ""
    assert bad_scheme["errors"]

    no_host = analyse("not a url")
    assert no_host["errors"]


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("http://sbi-kyc-update.xyz/login", "State Bank of India"),
        ("http://hdfcbank-security.top/verify", "HDFC Bank"),
        ("http://amaz0n-giftcard.site/win", "Amazon"),
        ("http://irctc-refund-ticket.click/auth", "IRCTC"),
        ("http://paytm-kyc.xyz", "Paytm"),
        ("http://phonepe-cashback.top", "PhonePe"),
        ("http://airtel-reward.xyz", "Airtel"),
        ("http://jio-recharge.xyz", "Jio"),
        ("http://flipkart-offer.xyz", "Flipkart"),
        ("http://indigo-refund.xyz", "IndiGo"),
        ("http://bluedart-tracking.xyz", "Blue Dart"),
        ("http://lic-kyc.top", "LIC"),
        ("http://sbicard-verify.xyz", "SBI Card"),
        ("http://netflix-payment.xyz", "Netflix"),
        ("http://whatsapp-verify.xyz", "WhatsApp"),
        ("http://uidai-aadhaar.xyz", "UIDAI (Aadhaar)"),
        ("http://incometax-refund.xyz", "Income Tax Department"),
        ("http://epfo-claim.xyz", "Employees' Provident Fund Organisation"),
        ("http://rbi-alert.xyz", "Reserve Bank of India"),
        ("http://gst-refund.xyz", "GST Portal"),
        ("http://tata-power-bill.xyz", "Tata Power"),
        ("http://dominos-offer.xyz", "Domino's India"),
        ("http://swiggy-refund.xyz", "Swiggy"),
        ("http://zomato-gold.xyz", "Zomato"),
        ("http://makemytrip-refund.xyz", "MakeMyTrip"),
        ("http://ola-refund.xyz", "Ola"),
        ("http://uber-payment.xyz", "Uber India"),
        ("http://delhivery-fee.xyz", "Delhivery"),
        ("http://dtdc-parcel.xyz", "DTDC"),
        ("http://bescom-bill.xyz", "BESCOM"),
        ("http://mahadiscom-bill.xyz", "MSEDCL (Mahadiscom)"),
        ("http://mobikwik-kyc.xyz", "MobiKwik"),
        ("http://razorpay-refund.xyz", "Razorpay"),
        ("http://cred-reward.xyz", "CRED"),
        ("http://kotak-kyc.xyz", "Kotak Mahindra Bank"),
        ("http://pnb-kyc.xyz", "Punjab National Bank"),
        ("http://bob-kyc.xyz", "Bank of Baroda"),
        ("http://axis-kyc.xyz", "Axis Bank"),
        ("http://vi-kyc.xyz", "Vi (Vodafone Idea)"),
        ("http://bsnl-recharge.xyz", "BSNL"),
        ("http://myntra-sale.xyz", "Myntra"),
    ],
)
def test_lookalike_matrix(url: str, expected: str) -> None:
    """Forty-plus impersonation cases map to the right brand."""
    assert domain_checks.analyse_url(url).lookalike_of == expected


def test_official_and_allowed_domains_are_never_lookalikes() -> None:
    """Every registered official domain, and its subdomains, stays clean."""
    for brand in brands.BRANDS:
        for domain in brand.domains:
            assert brands.host_is_official(domain)
            facts = domain_checks.analyse_url(f"https://{domain}/path")
            assert facts.lookalike_of is None, domain
            assert facts.registered_domain
        first = brand.domains[0]
        subdomain = domain_checks.analyse_url(f"https://secure.{first}/login")
        assert subdomain.lookalike_of is None, first

    for allowed in ("github.com", "wikipedia.org", "npci.org.in", "paypal.com"):
        assert domain_checks.analyse_url(f"https://{allowed}/x").lookalike_of is None


def test_defanging_and_idna() -> None:
    """Written obfuscation and punycode are decoded for analysis."""
    assert domain_checks.analyse_url("hxxps://sbi[.]co[.]in/x").registered_domain == "sbi.co.in"
    assert domain_checks.analyse_url("https://sbi(.)co(.)in/x").registered_domain == "sbi.co.in"
    punycode = domain_checks.analyse_url("https://xn--sbi-kyc-9va.xyz/login")
    assert punycode.registered_domain.endswith(".xyz")
    assert punycode.hostname != punycode.url


# ------------------------------------------------------------------------- WHOIS


def test_whois_date_parsing(monkeypatch: pytest.MonkeyPatch) -> None:
    """Datetime, list and string creation dates are all understood."""
    def age_for(value: object) -> tuple[int | None, str | None]:
        monkeypatch.setattr(whois_check, "_query", lambda d, t: {"creation_date": value})
        return whois_check.domain_age_days("example.com", timeout_s=0.2)

    age, error = age_for(dt.datetime(2020, 1, 1))
    assert error is None and age is not None and age > 365

    age, error = age_for([dt.datetime(2021, 1, 1), dt.datetime(2018, 1, 1)])
    assert error is None and age is not None and age > 1000

    age, error = age_for("2018-06-01")
    assert error is None and age is not None and age > 365

    age, error = age_for("2018-06-01T10:00:00Z")
    assert error is None and age is not None and age > 365

    age, error = age_for(dt.datetime(2999, 1, 1))
    assert error is None and age == 0

    age, error = age_for(None)
    assert age is None and error == "WHOIS returned no creation date"

    monkeypatch.setattr(whois_check, "_query", lambda d, t: {})
    age, error = whois_check.domain_age_days("example.com", timeout_s=0.2)
    assert age is None and error == "WHOIS returned no creation date"


def test_whois_errors_and_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    """Failures become an error string, never an exception."""
    monkeypatch.setattr(
        whois_check,
        "_query",
        lambda domain, timeout_s: (_ for _ in ()).throw(ConnectionError("registry down")),
    )
    age, error = whois_check.domain_age_days("example.com", timeout_s=0.2)
    assert age is None and "WHOIS lookup failed" in str(error)

    def slow_query(domain: str, timeout_s: float) -> dict[str, object]:
        time.sleep(1.5)
        return {"creation_date": dt.datetime(2020, 1, 1)}

    monkeypatch.setattr(whois_check, "_query", slow_query)
    age, error = whois_check.domain_age_days("example.com", timeout_s=0.1)
    assert age is None and "timed out" in str(error)

    assert whois_check.domain_age_days("192.0.2.1") == (None, None)
    assert whois_check.domain_age_days("")[0] is None


# -------------------------------------------------------------------- reputation


def test_virustotal_parsing(monkeypatch: pytest.MonkeyPatch) -> None:
    """The VirusTotal report is reduced to malicious/suspicious/harmless."""
    monkeypatch.setenv("VIRUSTOTAL_API_KEY", "vt-key")
    calls: list[tuple[str, dict[str, object]]] = []

    def fake_get(url: str, **kwargs: object) -> FakeResponse:
        calls.append((url, kwargs))
        return FakeResponse(
            200,
            {
                "data": {
                    "attributes": {
                        "last_analysis_stats": {
                            "malicious": 7,
                            "suspicious": 2,
                            "harmless": 60,
                        }
                    }
                }
            },
        )

    monkeypatch.setattr(reputation.requests, "get", fake_get)
    payload, error = reputation.virustotal_lookup("https://example.com/a?b=1")
    assert error is None
    assert payload == {"malicious": 7, "suspicious": 2, "harmless": 60}
    assert calls[0][1]["timeout"] == reputation.TIMEOUT
    assert calls[0][1]["headers"]["x-apikey"] == "vt-key"  # type: ignore[index]
    expected_id = base64.urlsafe_b64encode(b"https://example.com/a?b=1").decode().rstrip("=")
    assert calls[0][0].endswith(expected_id)

    monkeypatch.setattr(
        reputation.requests, "get", lambda url, **kwargs: FakeResponse(404, {})
    )
    payload, error = reputation.virustotal_lookup("https://example.com/missing")
    assert payload is None and "no report" in str(error)

    monkeypatch.setattr(
        reputation.requests, "get", lambda url, **kwargs: FakeResponse(429, {})
    )
    payload, error = reputation.virustotal_lookup("https://example.com/limited")
    assert payload is None and "failed" in str(error)


def test_safe_browsing_parsing(monkeypatch: pytest.MonkeyPatch) -> None:
    """Safe Browsing matches become a flagged result with a threat type."""
    monkeypatch.setenv("SAFE_BROWSING_API_KEY", "sb-key")
    seen: dict[str, object] = {}

    def fake_post(url: str, **kwargs: object) -> FakeResponse:
        seen.update(kwargs)
        return FakeResponse(
            200,
            {"matches": [{"threatType": "SOCIAL_ENGINEERING"}]},
        )

    monkeypatch.setattr(reputation.requests, "post", fake_post)
    payload, error = reputation.safe_browsing_lookup("https://evil.example")
    assert error is None
    assert payload == {"flagged": True, "threat_type": "SOCIAL_ENGINEERING"}
    assert seen["params"] == {"key": "sb-key"}
    assert seen["timeout"] == reputation.TIMEOUT

    monkeypatch.setattr(
        reputation.requests, "post", lambda url, **kwargs: FakeResponse(200, {})
    )
    payload, error = reputation.safe_browsing_lookup("https://clean.example")
    assert payload == {"flagged": False, "threat_type": None} and error is None


def test_urlhaus_parsing(monkeypatch: pytest.MonkeyPatch) -> None:
    """URLhaus hits and misses are both shaped correctly."""
    monkeypatch.setenv("URLHAUS_AUTH_KEY", "uh-key")
    seen: dict[str, object] = {}

    def fake_post(url: str, **kwargs: object) -> FakeResponse:
        seen.update(kwargs)
        return FakeResponse(200, {"query_status": "ok", "threat": "malware_download"})

    monkeypatch.setattr(reputation.requests, "post", fake_post)
    payload, error = reputation.urlhaus_lookup("https://evil.example/a.apk")
    assert error is None
    assert payload == {"flagged": True, "threat": "malware_download"}
    assert seen["headers"]["Auth-Key"] == "uh-key"  # type: ignore[index]

    monkeypatch.setattr(
        reputation.requests,
        "post",
        lambda url, **kwargs: FakeResponse(200, {"query_status": "no_results"}),
    )
    payload, error = reputation.urlhaus_lookup("https://clean.example")
    assert payload == {"flagged": False, "threat": None} and error is None


def test_reputation_without_keys_never_calls_the_network(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """With no credentials, all providers are skipped without HTTP calls."""
    def explode(*args: object, **kwargs: object) -> None:
        raise AssertionError("network call attempted without credentials")

    monkeypatch.setattr(reputation.requests, "get", explode)
    monkeypatch.setattr(reputation.requests, "post", explode)
    assert reputation.check_all("https://example.com") == (None, None, None, [])


def test_reputation_timeouts_and_errors(monkeypatch: pytest.MonkeyPatch) -> None:
    """Timeouts and malformed responses never raise."""
    monkeypatch.setenv("VIRUSTOTAL_API_KEY", "vt-key")
    monkeypatch.setenv("SAFE_BROWSING_API_KEY", "sb-key")
    monkeypatch.setenv("URLHAUS_AUTH_KEY", "uh-key")

    def timeout(*args: object, **kwargs: object) -> None:
        raise requests.Timeout("too slow")

    monkeypatch.setattr(reputation.requests, "get", timeout)
    monkeypatch.setattr(reputation.requests, "post", timeout)

    vt, sb, uh, errors = reputation.check_all("https://example.com")
    assert vt is None and sb is None and uh is None
    assert len(errors) == 3
    assert all("timed out" in error for error in errors)


# ------------------------------------------------------------------------ phones


@pytest.mark.parametrize(
    ("phone", "claimed", "valid", "shortcode", "carrier", "reputation_value"),
    [
        ("9876543210", None, True, False, "mobile", "neutral"),
        (
            "+91 98765 43210",
            "State Bank of India",
            True,
            False,
            "mobile",
            "personal_mobile_claimed_official",
        ),
        ("1800123456", "SBI", True, False, "toll_free", "official_helpline"),
        ("1930", "Cyber Crime", True, True, "short_code", "shortcode"),
        ("123456", None, True, True, "short_code", "shortcode"),
        ("+91 1800 123 456", "SBI", True, False, "toll_free", "official_helpline"),
        ("+14155552671", None, True, False, "landline_or_mobile", "neutral"),
    ],
)
def test_phone_cases(
    phone: str,
    claimed: str | None,
    valid: bool,
    shortcode: bool,
    carrier: str,
    reputation_value: str,
) -> None:
    """Valid numbers are classified by type and context."""
    result = phone_checks.analyse_phone(phone, claimed)
    assert set(result) == PHONE_KEYS
    assert result["phone"] == phone
    assert result["is_valid_format"] is valid
    assert result["is_shortcode"] is shortcode
    assert result["carrier_type"] == carrier
    assert result["reputation"] == reputation_value
    assert isinstance(result["scam_reports_count"], int)
    assert isinstance(result["errors"], list)


@pytest.mark.parametrize("phone", ["", "abc", "not-a-number", "+", "----"])
def test_phone_invalid_input(phone: str) -> None:
    """Empty and non-numeric input is rejected without raising."""
    result = phone_checks.analyse_phone(phone)
    assert set(result) == PHONE_KEYS
    assert result["is_valid_format"] is False
    assert result["reputation"] == "invalid_format"
    assert result["errors"]


def test_phone_contract_inside_real_checker() -> None:
    """The full checker keeps the phone shape."""
    evidence = real_check_entities(
        _extracted(phone_numbers=["9876543210", "9876543210", "1800123456"])
    )
    assert len(evidence["phones"]) == 2
    assert all(set(record) == PHONE_KEYS for record in evidence["phones"])


# --------------------------------------------------------------------------- UPI


@pytest.mark.parametrize(
    ("upi", "impersonation", "target", "reputation_value"),
    [
        ("sbi.kyc@paytm", True, "State Bank of India", "high_risk_impersonation"),
        ("hdfc.refund@ybl", True, "HDFC Bank", "high_risk_impersonation"),
        ("electricity.help@ybl", True, "Customer Support", "high_risk_impersonation"),
        ("refund@oksbi", True, "Refund Desk", "high_risk_impersonation"),
        ("regular.user@okhdfcbank", False, None, "regular_user"),
        ("user@unknownhandle", False, None, "unverified_handle"),
        ("upi://pay?pa=sbi.kyc@paytm&pn=Shop", True, "State Bank of India", "high_risk_impersonation"),
    ],
)
def test_upi_cases(
    upi: str,
    impersonation: bool,
    target: str | None,
    reputation_value: str,
) -> None:
    """Impersonation and normal handles are distinguished."""
    result = upi_checks.analyse_upi(upi)
    assert set(result) == UPI_KEYS
    assert result["is_impersonation"] is impersonation
    assert result["target_entity"] == target
    assert result["reputation"] == reputation_value
    assert isinstance(result["errors"], list)


@pytest.mark.parametrize("upi", ["badupi", "a@b@c", "@ybl", "user@", ""])
def test_upi_invalid_input(upi: str) -> None:
    """Malformed UPI IDs return the full shape with an error."""
    result = upi_checks.analyse_upi(upi)
    assert set(result) == UPI_KEYS
    assert result["is_impersonation"] is False
    assert result["reputation"] == "invalid_format"
    assert result["errors"]


# ------------------------------------------------------------------------ sender


@pytest.mark.parametrize(
    ("sender", "claimed", "official", "header", "mismatch"),
    [
        ("AX-SBIINB", "State Bank of India", True, "SBIINB", False),
        ("VK-HDFCBK", "HDFC Bank", True, "HDFCBK", False),
        ("AD-HDFCBK", "State Bank of India", True, "HDFCBK", True),
        ("HDFCBK", "HDFC Bank", True, "HDFCBK", False),
        ("AXISBK", "Axis Bank", True, "AXISBK", False),
        ("PNBBNK", "Punjab National Bank", True, "PNBBNK", False),
        ("AMAZON", "Amazon", True, "AMAZON", False),
        ("ICICIB", "ICICI Bank", True, "ICICIB", False),
        ("ACMEBK", "Acme Bank", True, "ACMEBK", False),
        ("ACMEBK", "Zenith Corp", True, "ACMEBK", True),
        ("+919876543210", "SBI", False, None, True),
        ("TEST", None, False, None, False),
        (None, "SBI", False, None, False),
        ("", None, False, None, False),
    ],
)
def test_sender_cases(
    sender: str | None,
    claimed: str | None,
    official: bool,
    header: str | None,
    mismatch: bool,
) -> None:
    """TRAI headers are parsed and compared with the claimed organisation."""
    result = sender_checks.analyse_sender(sender, claimed)
    assert set(result) == SENDER_KEYS
    assert result["is_official_header"] is official
    assert result["header_entity"] == header
    assert result["mismatch_with_claimed"] is mismatch


# --------------------------------------------------------- integration & safety


def test_full_contract_and_claimed_organisation() -> None:
    """A realistic message produces all four entity sections."""
    evidence = real_check_entities(
        _extracted(
            sender="AX-SBIINB",
            claimed_organisation="State Bank of India",
            urls=["http://sbi-kyc-update.xyz/login"],
            phone_numbers=["9876543210", "1800123456"],
            upi_ids=["sbi.kyc@paytm"],
        )
    )
    assert set(evidence) == {"urls", "phones", "upi", "sender"}
    assert set(evidence["urls"][0]) == URL_KEYS
    assert set(evidence["phones"][0]) == PHONE_KEYS
    assert set(evidence["upi"][0]) == UPI_KEYS
    assert set(evidence["sender"]) == SENDER_KEYS
    assert evidence["urls"][0]["lookalike_of"] == "State Bank of India"
    assert evidence["phones"][0]["reputation"] == "personal_mobile_claimed_official"
    assert evidence["upi"][0]["reputation"] == "high_risk_impersonation"
    assert evidence["sender"]["mismatch_with_claimed"] is False


def test_limits_and_deduplication() -> None:
    """At most five URLs are checked and duplicates collapse."""
    urls = [f"https://site{i}.in/path" for i in range(8)]
    urls += ["HTTPS://SITE0.IN/PATH", "https://site1.in/path"]
    evidence = real_check_entities(_extracted(urls=urls))
    assert len(evidence["urls"]) == 5
    domains = [record["domain"] for record in evidence["urls"]]
    assert len(domains) == len(set(domains))


def test_all_network_failures_keep_the_shape(monkeypatch: pytest.MonkeyPatch) -> None:
    """When WHOIS and every provider fail, the record is still complete."""
    monkeypatch.setenv("VIRUSTOTAL_API_KEY", "vt")
    monkeypatch.setenv("SAFE_BROWSING_API_KEY", "sb")
    monkeypatch.setenv("URLHAUS_AUTH_KEY", "uh")

    def fail(*args: object, **kwargs: object) -> None:
        raise requests.Timeout("offline")

    monkeypatch.setattr(reputation.requests, "get", fail)
    monkeypatch.setattr(reputation.requests, "post", fail)
    monkeypatch.setattr(
        whois_check,
        "_query",
        lambda domain, timeout_s: (_ for _ in ()).throw(TimeoutError("offline")),
    )

    evidence = real_check_entities(
        _extracted(
            urls=["https://sbi-kyc-update.xyz/login"],
            phone_numbers=["9876543210"],
            upi_ids=["sbi.kyc@paytm"],
            sender="AX-SBIINB",
        )
    )
    record = evidence["urls"][0]
    assert set(record) == URL_KEYS
    assert record["virustotal"] is None
    assert record["safe_browsing"] is None
    assert record["urlhaus"] is None
    assert record["domain_age_days"] is None
    assert record["lookalike_of"] == "State Bank of India"
    assert any("WHOIS" in error for error in record["errors"])
    assert any("timed out" in error for error in record["errors"])


def test_crash_safety_for_bad_input_and_crashing_checks(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Malformed input and unexpected exceptions never escape the checker."""
    assert real_check_entities({}) == {
        "urls": [],
        "phones": [],
        "upi": [],
        "sender": {
            "raw_sender": None,
            "is_official_header": False,
            "header_entity": None,
            "mismatch_with_claimed": False,
            "errors": [],
        },
    }
    assert real_check_entities("not a dict")["urls"] == []  # type: ignore[arg-type]

    evidence = real_check_entities(
        _extracted(
            urls={"bad": "shape"},
            phone_numbers={"bad": "shape"},
            upi_ids=[[], {}],
            sender={"bad": "shape"},
        )
    )
    assert evidence["urls"] == []
    assert evidence["phones"] == []
    assert evidence["upi"] == []
    assert evidence["sender"]["raw_sender"] is None

    monkeypatch.setattr(
        domain_checks,
        "analyse_url",
        lambda url: (_ for _ in ()).throw(RuntimeError("parser bug")),
    )
    monkeypatch.setattr(
        phone_checks,
        "analyse_phone",
        lambda phone, claimed=None: (_ for _ in ()).throw(RuntimeError("phone bug")),
    )
    monkeypatch.setattr(
        upi_checks,
        "analyse_upi",
        lambda upi: (_ for _ in ()).throw(RuntimeError("upi bug")),
    )
    monkeypatch.setattr(
        sender_checks,
        "analyse_sender",
        lambda sender, claimed=None: (_ for _ in ()).throw(RuntimeError("sender bug")),
    )

    crashed = real_check_entities(
        _extracted(
            urls=["https://example.com"],
            phone_numbers=["9876543210"],
            upi_ids=["a@b"],
            sender="AX-SBIINB",
        )
    )
    assert set(crashed["urls"][0]) == URL_KEYS
    assert "URL check failed" in crashed["urls"][0]["errors"][0]
    assert "Phone check failed" in crashed["phones"][0]["errors"][0]
    assert "UPI check failed" in crashed["upi"][0]["errors"][0]
    assert "Sender check failed" in crashed["sender"]["errors"][0]


def test_tools_interface_routes_to_real_tools(monkeypatch: pytest.MonkeyPatch) -> None:
    """USE_MOCK_TOOLS=0 goes through tools_real with the same contract."""
    monkeypatch.setenv("USE_MOCK_TOOLS", "0")
    evidence = tools_interface.check_entities(
        _extracted(
            urls=["https://sbi.co.in/portal"],
            phone_numbers=["1800123456"],
            upi_ids=["regular.user@okhdfcbank"],
            sender="AX-SBIINB",
            claimed_organisation="State Bank of India",
        )
    )
    assert set(evidence) == {"urls", "phones", "upi", "sender"}
    assert set(evidence["urls"][0]) == URL_KEYS
    assert evidence["urls"][0]["virustotal"] is None
    assert evidence["phones"][0]["reputation"] == "official_helpline"
    assert evidence["sender"]["is_official_header"] is True


def test_api_keys_never_leak_into_output(monkeypatch: pytest.MonkeyPatch) -> None:
    """Provider failures mention the exception type, never the credential."""
    secret = "super-secret-key-value"
    monkeypatch.setenv("VIRUSTOTAL_API_KEY", secret)
    monkeypatch.setenv("SAFE_BROWSING_API_KEY", secret)
    monkeypatch.setenv("URLHAUS_AUTH_KEY", secret)

    def fail(*args: object, **kwargs: object) -> None:
        raise requests.ConnectionError("network down")

    monkeypatch.setattr(reputation.requests, "get", fail)
    monkeypatch.setattr(reputation.requests, "post", fail)

    payload = json.dumps(
        real_check_entities(_extracted(urls=["https://sbi-kyc-update.xyz/login"])),
        ensure_ascii=False,
    )
    assert secret not in payload


# --------------------------------------------------------------------------- CLI


def test_cli_text_extraction() -> None:
    """The CLI pulls URLs, phones and UPI IDs out of free text."""
    text = (
        "प्रिय ग्राहक, KYC बंद हो जाएगा। "
        "http://sbi-kyc-update.xyz/login पर जाएँ, "
        "9876543210 पर कॉल करें या sbi.kyc@paytm पर भुगतान करें।"
    )
    extracted = real._extract_from_text(text)
    assert "http://sbi-kyc-update.xyz/login" in extracted["urls"]
    assert "9876543210" in extracted["phone_numbers"]
    assert "sbi.kyc@paytm" in extracted["upi_ids"]
    assert extracted["language"] == "hi"


def test_cli_main_prints_json(capsys: pytest.CaptureFixture[str]) -> None:
    """``python -m tools.real <url>`` returns parseable JSON."""
    assert real.main(["https://example.com"]) == 0
    captured = capsys.readouterr()
    payload = json.loads(captured.out)
    assert payload["urls"][0]["domain"] == "example.com"
    assert set(payload) == {"urls", "phones", "upi", "sender"}

    assert real.main([]) == 2
    assert "Usage" in capsys.readouterr().err
