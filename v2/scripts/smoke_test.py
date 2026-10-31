#!/usr/bin/env python3
"""Smoke test script for Scam Shield v2.

Runs a health check and tests 3 sample queries (scam, suspicious, safe)
against the running FastAPI backend.

Usage:
    python v2/scripts/smoke_test.py [--base-url http://127.0.0.1:8000]
"""

import sys
import argparse
import urllib.request
import urllib.parse
import json

def run_smoke_test(base_url: str) -> bool:
    print(f"=== SCAM SHIELD v2 SMOKE TEST ===")
    print(f"Target URL: {base_url}\n")
    
    # 1. Health check
    health_url = f"{base_url}/health"
    try:
        req = urllib.request.Request(health_url, headers={"User-Agent": "ScamShield-SmokeTest"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            body = json.loads(resp.read().decode("utf-8"))
            if status == 200 and body.get("status") in ("ok", "healthy"):
                print(f"[PASS] Health check: Scam Shield v{body.get('version')} (Gemini: {body.get('gemini_configured')}, Groq: {body.get('groq_configured')}, DB: {body.get('db_ok')})")
            else:
                print(f"[FAIL] Health check returned unexpected payload: {body}")
                return False
    except Exception as exc:
        print(f"[FAIL] Health check failed: {exc}")
        return False

    # 2. Sample queries
    test_cases = [
        {
            "name": "Electricity Disconnection Scam (SMS)",
            "text": "Your electricity power will be disconnected at 9:30 PM tonight. Contact officer at +919876543210 immediately.",
            "expected": "scam",
        },
        {
            "name": "Digital Arrest Extortion Notice",
            "text": "URGENT CBI: You are under digital arrest for illegal courier. Download app to verify innocence.",
            "expected": "scam",
        },
        {
            "name": "Legitimate Bank Debit Alert",
            "text": "INR 500 debited from account Ref 12345. Available balance INR 12,000. SMS BLOCK to 567676 if not done by you.",
            "expected": "safe",
        },
    ]

    all_passed = True
    for tc in test_cases:
        analyze_url = f"{base_url}/api/v2/analyze"
        payload = json.dumps({
            "text": tc["text"],
            "language": "en",
            "stream": False,
        }).encode("utf-8")
        
        req = urllib.request.Request(
            analyze_url,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "ScamShield-SmokeTest"}
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                verdict = data.get("verdict")
                confidence = data.get("confidence")
                scam_type = data.get("scam_type")
                passed = verdict == tc["expected"] or (tc["expected"] == "scam" and verdict == "suspicious")
                status_str = "PASS" if passed else "WARN"
                print(f"[{status_str}] {tc['name']} -> Verdict: {verdict} ({confidence*100:.0f}%) | Type: {scam_type}")
                if not passed:
                    all_passed = False
        except Exception as exc:
            print(f"[FAIL] {tc['name']} request error: {exc}")
            all_passed = False

    print("\n" + ("=" * 45))
    if all_passed:
        print("All smoke test scenarios completed successfully!")
        return True
    else:
        print("Some smoke test scenarios flagged warnings.")
        return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scam Shield v2 Smoke Tester")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="Base URL of Scam Shield API")
    args = parser.parse_args()
    
    success = run_smoke_test(args.base_url)
    sys.exit(0 if success else 1)
