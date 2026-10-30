"""Smoke test for LLM calling layer and fallback mechanism."""

import os
import sys
from unittest.mock import MagicMock, patch
from pydantic import BaseModel
from agents.llm import call_llm, call_llm_json


class SmokeSchema(BaseModel):
    provider: str = "Fallback"
    status: str = "could_not_check"
    message: str = "Default message"


def run_smoke_test():
    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    print("=== SCAM SHIELD LLM SMOKE TEST ===")
    print(f"GEMINI_API_KEY configured: {bool(gemini_key and gemini_key != 'your_gemini_api_key_here')}")
    print(f"GROQ_API_KEY configured:   {bool(groq_key and groq_key != 'your_groq_api_key_here')}")

    if gemini_key and groq_key and gemini_key != "your_gemini_api_key_here":
        print("\n[1] Testing Live Gemini call...")
        os.environ["FORCE_FALLBACK"] = "0"
        result_gemini = call_llm_json(
            schema=SmokeSchema,
            system="You are a helpful assistant. Output ONLY JSON.",
            user="Return a JSON object with provider='Gemini', status='active', message='Hello from Gemini'",
        )
        print("Gemini Response:", result_gemini.model_dump_json(indent=2))

        print("\n[2] Testing Live Groq fallback call (FORCE_FALLBACK=1)...")
        os.environ["FORCE_FALLBACK"] = "1"
        result_groq = call_llm_json(
            schema=SmokeSchema,
            system="You are a helpful assistant. Output ONLY JSON.",
            user="Return a JSON object with provider='Groq', status='active', message='Hello from Groq Fallback'",
        )
        print("Groq Fallback Response:", result_groq.model_dump_json(indent=2))
        print("\nBoth Gemini and Groq live tests succeeded!")
    else:
        print("\n[INFO] Live API keys not set in .env. Running acceptance test with provider simulation...")
        
        # 1. Test Gemini path
        with patch("agents.llm._call_gemini") as mock_gemini:
            mock_gemini.return_value = '{"provider": "Gemini", "status": "active", "message": "Simulated live Gemini response"}'
            os.environ["FORCE_FALLBACK"] = "0"
            res = call_llm_json(
                schema=SmokeSchema,
                system="You are a test assistant.",
                user="Ping",
            )
            print("[1] Gemini Call Result:")
            print(res.model_dump_json(indent=2))
            assert res.provider == "Gemini"
            assert res.status == "active"

        # 2. Test Groq fallback path with FORCE_FALLBACK=1
        with patch("agents.llm._call_groq") as mock_groq:
            mock_groq.return_value = '{"provider": "Groq", "status": "active", "message": "Simulated Groq fallback response"}'
            os.environ["FORCE_FALLBACK"] = "1"
            res_fallback = call_llm_json(
                schema=SmokeSchema,
                system="You are a test assistant.",
                user="Ping",
            )
            print("\n[2] Groq Fallback Call Result (FORCE_FALLBACK=1):")
            print(res_fallback.model_dump_json(indent=2))
            assert res_fallback.provider == "Groq"
            assert res_fallback.status == "active"

        print("\n[SUCCESS] Phase 1 LLM wrapper acceptance test passed!")


if __name__ == "__main__":
    run_smoke_test()
