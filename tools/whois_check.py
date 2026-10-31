"""WHOIS domain-age lookup with a hard five-second budget.

The WHOIS protocol is queried directly through ``python-whois``. The URL from
the message is never fetched. Lookups run in a daemon thread so a slow registry
cannot freeze the analysis pipeline.
"""

from __future__ import annotations

import datetime as _dt
import ipaddress
import logging
import threading
from typing import Any, Final

try:  # pragma: no cover - exercised through the public function
    import whois as _whois
except Exception:  # noqa: BLE001 - the module must import even if the dep is absent
    _whois = None

logger = logging.getLogger("scam_shield.tools.whois_check")

DEFAULT_TIMEOUT_SECONDS: Final[float] = 5.0


def _query(domain: str, timeout_s: float) -> Any:
    """Perform the raw WHOIS query. Kept separate so tests can stub it."""
    if _whois is None:
        raise RuntimeError("python-whois is not installed")
    try:
        return _whois.whois(domain, timeout=int(max(1, round(timeout_s))))
    except TypeError:  # older python-whois without the timeout keyword
        return _whois.whois(domain)


def _as_datetime(value: Any) -> _dt.datetime | None:
    """Coerce a WHOIS creation date into a naive UTC ``datetime``."""
    if isinstance(value, _dt.datetime):
        result = value
    elif isinstance(value, _dt.date):
        result = _dt.datetime(value.year, value.month, value.day)
    elif isinstance(value, str):
        text = value.strip().replace("Z", "+00:00")
        result = None
        for candidate in (text, text[:19], text[:10]):
            try:
                result = _dt.datetime.fromisoformat(candidate)
                break
            except ValueError:
                continue
        if result is None:
            return None
    else:
        return None

    if result.tzinfo is not None:
        return result.astimezone(_dt.timezone.utc).replace(tzinfo=None)
    return result


def _earliest_creation_date(record: Any) -> _dt.datetime | None:
    """Extract the earliest creation date from a WHOIS record."""
    if record is None:
        return None
    try:
        value = record.get("creation_date") if hasattr(record, "get") else None
    except (TypeError, ValueError):
        return None
    if value is None:
        return None
    candidates = value if isinstance(value, (list, tuple, set)) else [value]
    parsed = [moment for moment in (_as_datetime(item) for item in candidates) if moment]
    return min(parsed) if parsed else None


def _looks_like_ip(domain: str) -> bool:
    try:
        ipaddress.ip_address(domain.strip("[]"))
        return True
    except ValueError:
        return False


def domain_age_days(
    domain: str,
    timeout_s: float = DEFAULT_TIMEOUT_SECONDS,
) -> tuple[int | None, str | None]:
    """Return ``(age_in_days, error)`` for a registrable domain.

    ``(None, None)`` means the age is simply not applicable (IP literal).
    ``(None, "<reason>")`` means a lookup was possible but did not succeed.
    """
    host = str(domain or "").strip().lower().rstrip(".")
    if not host:
        return None, "WHOIS skipped: empty domain"
    if _looks_like_ip(host):
        return None, None
    if "." not in host:
        return None, "WHOIS skipped: not a registrable domain"

    result: dict[str, Any] = {}

    def worker() -> None:
        try:
            result["record"] = _query(host, timeout_s)
        except BaseException as exc:  # noqa: BLE001 - never let a registry crash us
            result["error"] = exc

    thread = threading.Thread(
        target=worker,
        name=f"scam-shield-whois-{host[:32]}",
        daemon=True,
    )
    thread.start()
    thread.join(max(0.5, timeout_s + 0.5))

    if thread.is_alive():
        logger.warning("WHOIS lookup timed out for %s", host)
        return None, f"WHOIS lookup timed out after {timeout_s:.0f}s"

    if "error" in result:
        error = result["error"]
        logger.info("WHOIS lookup failed for %s: %s", host, error)
        detail = f"{type(error).__name__}: {error}".strip()[:160]
        return None, f"WHOIS lookup failed ({detail})"

    created = _earliest_creation_date(result.get("record"))
    if created is None:
        return None, "WHOIS returned no creation date"

    age = (_dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None) - created).days
    return max(0, int(age)), None
