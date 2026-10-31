"""Reputation lookups against VirusTotal, Google Safe Browsing and URLhaus.

Only reputation APIs are contacted. The suspicious URL itself is never opened,
downloaded or rendered. Every request has a five-second timeout and every
provider can be absent without breaking the analysis.
"""

from __future__ import annotations

import base64
import logging
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Final

import requests

logger = logging.getLogger("scam_shield.tools.reputation")

TIMEOUT: Final[tuple[float, float]] = (3.05, 5.0)
VIRUSTOTAL_ENDPOINT: Final[str] = "https://www.virustotal.com/api/v3/urls/{url_id}"
SAFE_BROWSING_ENDPOINT: Final[str] = (
    "https://safebrowsing.googleapis.com/v4/threatMatches:find"
)
URLHAUS_ENDPOINT: Final[str] = "https://urlhaus-api.abuse.ch/v1/url/"

SAFE_BROWSING_THREATS: Final[tuple[str, ...]] = (
    "MALWARE",
    "SOCIAL_ENGINEERING",
    "UNWANTED_SOFTWARE",
    "POTENTIALLY_HARMFUL_APPLICATION",
)


def _api_key(name: str) -> str:
    """Read an API key from the environment, stripped and never logged."""
    return str(os.getenv(name, "") or "").strip()


def configured_providers() -> dict[str, bool]:
    """Return which reputation providers currently have credentials."""
    return {
        "virustotal": bool(_api_key("VIRUSTOTAL_API_KEY")),
        "safe_browsing": bool(_api_key("SAFE_BROWSING_API_KEY")),
        "urlhaus": bool(_api_key("URLHAUS_AUTH_KEY")),
    }


def virustotal_lookup(
    url: str, api_key: str | None = None
) -> tuple[dict[str, Any] | None, str | None]:
    """Look up an existing VirusTotal URL report.

    A report is requested, never a new scan, so nothing is submitted for
    analysis and the page is not fetched.
    """
    key = (api_key or _api_key("VIRUSTOTAL_API_KEY")).strip()
    if not key:
        return None, None
    try:
        url_id = base64.urlsafe_b64encode(url.encode("utf-8")).decode("ascii").rstrip("=")
        response = requests.get(
            VIRUSTOTAL_ENDPOINT.format(url_id=url_id),
            headers={"x-apikey": key, "accept": "application/json"},
            timeout=TIMEOUT,
        )
        if response.status_code == 404:
            return None, "VirusTotal has no report for this URL"
        response.raise_for_status()
        stats = (
            response.json()
            .get("data", {})
            .get("attributes", {})
            .get("last_analysis_stats", {})
        )
        if not isinstance(stats, dict):
            return None, "VirusTotal response had no analysis stats"
        return {
            "malicious": int(stats.get("malicious", 0) or 0),
            "suspicious": int(stats.get("suspicious", 0) or 0),
            "harmless": int(stats.get("harmless", 0) or 0),
        }, None
    except requests.Timeout:
        return None, "VirusTotal request timed out"
    except requests.RequestException as exc:
        logger.info("VirusTotal request failed: %s", exc)
        return None, f"VirusTotal request failed ({type(exc).__name__})"
    except (ValueError, TypeError, AttributeError) as exc:
        logger.info("VirusTotal response could not be parsed: %s", exc)
        return None, f"VirusTotal response could not be parsed ({type(exc).__name__})"


def safe_browsing_lookup(
    url: str, api_key: str | None = None
) -> tuple[dict[str, Any] | None, str | None]:
    """Check a URL against Google Safe Browsing's threat lists."""
    key = (api_key or _api_key("SAFE_BROWSING_API_KEY")).strip()
    if not key:
        return None, None
    payload = {
        "client": {"clientId": "scam-shield", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": list(SAFE_BROWSING_THREATS),
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }
    try:
        response = requests.post(
            SAFE_BROWSING_ENDPOINT,
            params={"key": key},
            json=payload,
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        matches = response.json().get("matches") or []
        if not matches:
            return {"flagged": False, "threat_type": None}, None
        first = matches[0] if isinstance(matches[0], dict) else {}
        threat_type = first.get("threatType")
        return {
            "flagged": True,
            "threat_type": str(threat_type) if threat_type else None,
        }, None
    except requests.Timeout:
        return None, "Safe Browsing request timed out"
    except requests.RequestException as exc:
        logger.info("Safe Browsing request failed: %s", exc)
        return None, f"Safe Browsing request failed ({type(exc).__name__})"
    except (ValueError, TypeError, AttributeError) as exc:
        logger.info("Safe Browsing response could not be parsed: %s", exc)
        return None, f"Safe Browsing response could not be parsed ({type(exc).__name__})"


def urlhaus_lookup(
    url: str, auth_key: str | None = None
) -> tuple[dict[str, Any] | None, str | None]:
    """Check whether URLhaus has seen a URL in a malware campaign."""
    key = (auth_key or _api_key("URLHAUS_AUTH_KEY")).strip()
    if not key:
        return None, None
    headers = {"Auth-Key": key, "accept": "application/json"}
    try:
        response = requests.post(
            URLHAUS_ENDPOINT,
            data={"url": url},
            headers=headers,
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        payload = response.json()
        query_status = str(payload.get("query_status", "")).lower()
        if query_status in ("no_results", "not_found"):
            return {"flagged": False, "threat": None}, None
        if query_status != "ok":
            return None, f"URLhaus did not return a result ({query_status or 'unknown'})"
        threat = payload.get("threat")
        if not threat:
            tags = payload.get("tags")
            if isinstance(tags, list) and tags:
                threat = ", ".join(str(tag) for tag in tags[:3])
        return {
            "flagged": True,
            "threat": str(threat) if threat else None,
        }, None
    except requests.Timeout:
        return None, "URLhaus request timed out"
    except requests.RequestException as exc:
        logger.info("URLhaus request failed: %s", exc)
        return None, f"URLhaus request failed ({type(exc).__name__})"
    except (ValueError, TypeError, AttributeError) as exc:
        logger.info("URLhaus response could not be parsed: %s", exc)
        return None, f"URLhaus response could not be parsed ({type(exc).__name__})"


def check_all(url: str) -> tuple[
    dict[str, Any] | None,
    dict[str, Any] | None,
    dict[str, Any] | None,
    list[str],
]:
    """Run every configured provider concurrently for one URL.

    Returns:
        ``(virustotal, safe_browsing, urlhaus, errors)`` where each provider
        value is ``None`` when it is not configured or did not answer.
    """
    providers = configured_providers()
    errors: list[str] = []
    if not any(providers.values()):
        return None, None, None, errors

    tasks: dict[str, Any] = {}
    with ThreadPoolExecutor(max_workers=3, thread_name_prefix="scam-shield-rep") as pool:
        if providers["virustotal"]:
            tasks["virustotal"] = pool.submit(virustotal_lookup, url)
        if providers["safe_browsing"]:
            tasks["safe_browsing"] = pool.submit(safe_browsing_lookup, url)
        if providers["urlhaus"]:
            tasks["urlhaus"] = pool.submit(urlhaus_lookup, url)

        results: dict[str, dict[str, Any] | None] = {}
        for name, future in tasks.items():
            try:
                value, error = future.result(timeout=8)
            except Exception as exc:  # noqa: BLE001 - a provider must never break the run
                logger.info("%s lookup crashed: %s", name, exc)
                value, error = None, f"{name} lookup failed ({type(exc).__name__})"
            results[name] = value
            if error:
                errors.append(error)

    return (
        results.get("virustotal"),
        results.get("safe_browsing"),
        results.get("urlhaus"),
        errors,
    )
