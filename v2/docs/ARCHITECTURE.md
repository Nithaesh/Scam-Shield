# Scam Shield v2: Architecture Specification

## 1. High-Level Architecture

```
User (Browser / Mobile)
        │
        ▼
Next.js 14/15 App Router Frontend (v2/web)
   • Strict TypeScript & next-intl (EN / HI)
   • Tailwind CSS & Framer Motion
   • Fetch + ReadableStream (POST SSE)
   • Web Speech API (Client-side TTS)
        │
        ▼ (HTTP REST / SSE)
FastAPI Backend (v2/api)
   • Uvicorn ASGI Server
   • Rate Limiting (slowapi per-IP)
   • Image Validation & EXIF stripper (Pillow)
   • Request Tracing & Structured Logging
        │
        ▼
Pipeline Bridge (`v2/api/services/pipeline.py`)
   • Worker thread execution + async Queue
   • Overall timeout guard (25s)
   • Fallback enrichment (Taxonomy, WhatsApp Share, Conflicts)
        │
        ▼ (Read-Only Import)
Legacy Multi-Agent Core (orchestrator.py, agents/, tools/)
   • Extractor -> Pattern Analyst & Entity Checker -> Judge -> Advisor
   • Dual LLM (Gemini Flash + Groq fallback)
   • Domain / Phone / UPI intelligence
```

## 2. Privacy & Data Protection

- No raw message text, OTPs, or uploaded images are stored on server disk or database.
- Community intelligence stores only one-way cryptographic hashes (`sha256(HASH_SALT + entity)`).
- Safe Browsing / VirusTotal queries are read-only threat lookups; URLs are never actively fetched or rendered.
