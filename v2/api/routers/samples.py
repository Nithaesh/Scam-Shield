"""Sample messages retrieval for evaluation and one-click testing."""

from __future__ import annotations

import json
from pathlib import Path
from fastapi import APIRouter
from v2.api.models.schemas import SampleItem

router = APIRouter(tags=["Samples"])

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


@router.get("/samples", response_model=list[SampleItem])
async def get_samples() -> list[SampleItem]:
    """Return a curated list of sample test messages in English, Hindi, and Hinglish."""
    samples: list[SampleItem] = []

    # 1. Fallback core defaults if data files are missing
    defaults = [
        SampleItem(
            id="sample_sbi_kyc_en",
            label="Fake SBI KYC Block (English)",
            category="bank_kyc",
            language="en",
            text="Dear customer, your SBI account will be blocked tonight at 12:00 PM. Update your KYC urgently at http://sbi-kyc-update.xyz/login",
        ),
        SampleItem(
            id="sample_bijli_hi",
            label="Electricity Disconnection (Hindi)",
            category="electricity_bill",
            language="hi",
            text="प्रिय उपभोक्ता, आपके पिछले महीने के बिजली बिल का भुगतान न होने के कारण आज रात 9:30 बजे बिजली काट दी जाएगी। तुरंत अधिकारी 9876543210 पर कॉल करें।",
        ),
        SampleItem(
            id="sample_digital_arrest",
            label="Digital Arrest / CBI Notice (English/Hindi)",
            category="digital_arrest",
            language="hinglish",
            text="CBI & Mumbai Police Notice: Aapke naam par narcotics parcel mila hai. You are under Digital Arrest. Join Skype call immediately or police will arrest you.",
        ),
        SampleItem(
            id="sample_upi_cashback",
            label="Fake UPI Cashback / PIN Trap",
            category="upi_collect_refund",
            language="en",
            text="Congratulations! You received cashback of Rs 1,499 from PhonePe. Click here and enter UPI PIN to receive money in bank.",
        ),
        SampleItem(
            id="sample_genuine_debit",
            label="Genuine Bank Debit Notification",
            category="bank_debit_alert",
            language="en",
            text="INR 1,250.00 debited from A/c XX4521 on 31-Oct-26 to UPI/Sample Stores. Ref 612345678901. If this was not you, contact your bank through its official app.",
        ),
        SampleItem(
            id="sample_genuine_otp",
            label="Genuine Bank OTP Security Warning",
            category="bank_otp",
            language="en",
            text="984512 is your secret OTP for transaction of INR 500.00 at Merchant Store. NEVER share this OTP with anyone, including bank employees.",
        ),
    ]

    # 2. Try loading from data/scams.json, data/genuine.json, v2/data/*.json
    try:
        scams_path = PROJECT_ROOT / "data" / "scams.json"
        if scams_path.exists():
            data = json.loads(scams_path.read_text(encoding="utf-8"))
            for item in data[:6]:
                samples.append(
                    SampleItem(
                        id=item.get("id", "scam"),
                        label=f"{item.get('category', 'Scam').replace('_', ' ').title()}",
                        category=item.get("category", "scam"),
                        language=item.get("language", "en"),
                        text=item.get("input_text", ""),
                    )
                )

        genuine_path = PROJECT_ROOT / "data" / "genuine.json"
        if genuine_path.exists():
            data = json.loads(genuine_path.read_text(encoding="utf-8"))
            for item in data[:4]:
                samples.append(
                    SampleItem(
                        id=item.get("id", "genuine"),
                        label=f"Genuine: {item.get('category', 'Alert').replace('_', ' ').title()}",
                        category=item.get("category", "safe"),
                        language=item.get("language", "en"),
                        text=item.get("input_text", ""),
                    )
                )
    except Exception:
        pass

    return samples if len(samples) >= 5 else defaults
