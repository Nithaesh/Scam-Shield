"""Generate synthetic SMS/chat screenshots for multimodal OCR & vision evaluation."""

from __future__ import annotations

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = PROJECT_ROOT / "v2" / "data" / "screenshots"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# List of 10 test cases: 5 scam, 5 genuine
SCREENS = [
    {
        "id": "screen_scam_01",
        "sender": "AX-SBIINB",
        "text": "Dear customer, your SBI NetBanking will be blocked today. Update KYC urgently at http://sbi-kyc-verify.fake/login",
        "expected_verdict": "scam",
        "expected_scam_type": "bank_kyc",
    },
    {
        "id": "screen_scam_02",
        "sender": "+91 90000 00001",
        "text": "Electricity Bill Alert: Your power will be disconnected tonight at 9:30 PM. Call officer at 9000000001 immediately.",
        "expected_verdict": "scam",
        "expected_scam_type": "electricity_bill",
    },
    {
        "id": "screen_scam_03",
        "sender": "CBI-DELHI",
        "text": "POLICE NOTICE: Illegal parcel detected with your Aadhaar. You are under Digital Arrest. Join Skype call immediately.",
        "expected_verdict": "scam",
        "expected_scam_type": "digital_arrest",
    },
    {
        "id": "screen_scam_04",
        "sender": "PhonePe-Bonus",
        "text": "You won Rs 1,999 cashback! Open link and enter your UPI PIN to transfer money into your account.",
        "expected_verdict": "scam",
        "expected_scam_type": "upi_collect_refund",
    },
    {
        "id": "screen_scam_05",
        "sender": "PM-Kisan",
        "text": "Pradhan Mantri Kisan Yojana: Install new official mobile app to claim Rs 6,000 subsidy at http://pmkisan.fake/app.apk",
        "expected_verdict": "scam",
        "expected_scam_type": "govt_scheme_apk",
    },
    {
        "id": "screen_safe_01",
        "sender": "AD-HDFCBK",
        "text": "INR 2,450.00 debited from A/c XX4521 on 31-Oct-26 to UPI/Sample Store. Ref 612345678901. Not you? Call 18002664332.",
        "expected_verdict": "safe",
        "expected_scam_type": "none",
    },
    {
        "id": "screen_safe_02",
        "sender": "VK-SBIOTP",
        "text": "892145 is your secret OTP for NetBanking login. Valid for 5 mins. NEVER share OTP with anyone including bank staff.",
        "expected_verdict": "safe",
        "expected_scam_type": "none",
    },
    {
        "id": "screen_safe_03",
        "sender": "AMAZON",
        "text": "Your package with order #402-9871234 is arriving today by delivery associate Ramesh. Track via Amazon mobile app.",
        "expected_verdict": "safe",
        "expected_scam_type": "none",
    },
    {
        "id": "screen_safe_04",
        "sender": "IRCTC-SMS",
        "text": "IRCTC PNR 2415678901: Train 12423 RAJDHANI EXP confirmed coach B3-45. Chart prepared. Track at irctc.co.in.",
        "expected_verdict": "safe",
        "expected_scam_type": "none",
    },
    {
        "id": "screen_safe_05",
        "sender": "BESCOM",
        "text": "Payment received: Thank you for paying your BESCOM electricity bill of Rs 1,450.00 for A/c 5421098. Receipt: RCP897123.",
        "expected_verdict": "safe",
        "expected_scam_type": "none",
    },
]


def render_screenshot(case: dict) -> Path:
    """Render a clean mobile SMS bubble screenshot using Pillow."""
    width, height = 720, 480
    bg_color = (245, 247, 250)
    card_bg = (255, 255, 255)
    bubble_bg = (235, 240, 248) if case["expected_verdict"] == "safe" else (254, 242, 242)
    border_color = (226, 232, 240) if case["expected_verdict"] == "safe" else (254, 202, 202)
    text_color = (30, 41, 59)
    sender_color = (71, 85, 105)

    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Try loading a system font with Devanagari fallback or default font
    try:
        font_large = ImageFont.truetype("arial.ttf", 26)
        font_body = ImageFont.truetype("arial.ttf", 20)
        font_small = ImageFont.truetype("arial.ttf", 16)
    except Exception:
        font_large = ImageFont.load_default()
        font_body = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw simulated mobile phone status bar
    draw.rectangle([0, 0, width, 50], fill=(238, 242, 246))
    draw.text((30, 15), "10:30 AM", fill=(100, 116, 139), font=font_small)
    draw.text((width - 120, 15), "5G  85%", fill=(100, 116, 139), font=font_small)

    # Header: Sender name
    draw.rectangle([0, 50, width, 120], fill=(255, 255, 255))
    draw.line([0, 120, width, 120], fill=(226, 232, 240), width=1)
    draw.text((40, 68), case["sender"], fill=sender_color, font=font_large)
    draw.text((40, 96), "SMS Messages · Today", fill=(148, 163, 184), font=font_small)

    # Chat bubble
    bubble_x0, bubble_y0 = 40, 150
    bubble_x1, bubble_y1 = width - 40, height - 60

    draw.rounded_rectangle(
        [bubble_x0, bubble_y0, bubble_x1, bubble_y1],
        radius=16,
        fill=bubble_bg,
        outline=border_color,
        width=2,
    )

    # Wrap text manually
    words = case["text"].split()
    lines = []
    current_line = []
    for w in words:
        current_line.append(w)
        if len(" ".join(current_line)) > 42:
            lines.append(" ".join(current_line[:-1]))
            current_line = [w]
    if current_line:
        lines.append(" ".join(current_line))

    # Draw lines
    y_text = bubble_y0 + 25
    for line in lines:
        draw.text((bubble_x0 + 25, y_text), line, fill=text_color, font=font_body)
        y_text += 32

    # Draw timestamp inside bubble
    draw.text((bubble_x1 - 100, bubble_y1 - 30), "10:28 AM", fill=(148, 163, 184), font=font_small)

    file_path = OUTPUT_DIR / f"{case['id']}.png"
    img.save(file_path, "PNG")
    return file_path


def main() -> None:
    manifest = []
    print(f"Generating 10 synthetic screenshots in {OUTPUT_DIR}...")
    for c in SCREENS:
        out_path = render_screenshot(c)
        manifest.append({
            "id": c["id"],
            "filename": out_path.name,
            "sender": c["sender"],
            "text": c["text"],
            "expected_verdict": c["expected_verdict"],
            "expected_scam_type": c["expected_scam_type"],
        })
        print(f" [+] Generated {out_path.name} (Verdict: {c['expected_verdict']})")

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"[+] Saved manifest to {manifest_path}")


if __name__ == "__main__":
    main()
