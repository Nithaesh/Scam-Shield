"""Five realistic demo messages for the "Try an example" row.

The teammate's benchmark data is the source of truth. If it is missing or
malformed, small fictional fallbacks keep the UI usable.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Final

logger = logging.getLogger("scam_shield.ui.samples")

DATA_DIR: Final[Path] = Path(__file__).resolve().parent.parent / "data"

SAMPLE_SPECS: Final[list[dict[str, str]]] = [
    {
        "id": "SCAM_001",
        "title_key": "sample_kyc",
        "kind": "scam",
        "fallback": (
            "Dear SBI User, your account has been blocked due to pending KYC verification. "
            "Update your PAN card immediately to avoid permanent deactivation: "
            "http://sbi-kyc-update.xyz"
        ),
    },
    {
        "id": "SCAM_005",
        "title_key": "sample_lottery",
        "kind": "scam",
        "fallback": (
            "Congratulations! Aapka mobile number KBC All India SIM Card Lucky Draw 2026 "
            "mein Rs 25,00,000 cash prize jeet chuka hai. Apni prize claim karne ke liye "
            "WhatsApp manager Rana Pratap ko turant contact karein: +919876500001"
        ),
    },
    {
        "id": "SCAM_009",
        "title_key": "sample_upi_refund",
        "kind": "scam",
        "fallback": (
            "I have sent you advance payment of Rs 12,000 for your second-hand sofa. "
            "To receive the refund, scan this QR code and enter your UPI PIN: "
            "refund.support@ybl"
        ),
    },
    {
        "id": "GENUINE_002",
        "title_key": "sample_otp",
        "kind": "safe",
        "fallback": (
            "194820 is your OTP for login to your HDFC Bank NetBanking. Valid for 5 mins. "
            "Do not share this OTP with anyone, including bank staff. Bank never asks for OTP."
        ),
    },
    {
        "id": "GENUINE_003",
        "title_key": "sample_delivery",
        "kind": "safe",
        "fallback": (
            "Your order #402-9841029 from Amazon has been dispatched with delivery agent "
            "Suresh (PIN: 48). Track your package directly on the Amazon app: "
            "https://amazon.in/orders"
        ),
    },
]


def _read_dataset(filename: str) -> list[dict[str, Any]]:
    """Read a benchmark JSON file, returning an empty list on any failure."""
    path = DATA_DIR / filename
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        return payload if isinstance(payload, list) else []
    except FileNotFoundError:
        logger.info("Sample dataset not found: %s", path)
    except (OSError, json.JSONDecodeError) as exc:
        logger.warning("Could not read sample dataset %s: %s", path, exc)
    return []


def load_samples() -> list[dict[str, str]]:
    """Return five sample messages, preferring the teammate's datasets."""
    datasets = _read_dataset("scams.json") + _read_dataset("genuine.json")
    by_id = {
        str(item.get("id")): item
        for item in datasets
        if isinstance(item, dict) and item.get("id")
    }

    samples: list[dict[str, str]] = []
    for spec in SAMPLE_SPECS:
        item = by_id.get(spec["id"], {})
        text = item.get("input_text") or spec["fallback"]
        samples.append(
            {
                "id": spec["id"],
                "title_key": spec["title_key"],
                "kind": spec["kind"],
                "text": str(text).strip(),
            }
        )
    return samples
