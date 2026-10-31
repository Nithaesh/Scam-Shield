# 🛡️ Scam Shield v2: Citizen Fraud Protection Layer

[![CI Pipeline](https://img.shields.io/badge/CI-Passing-brightgreen?style=flat-square)](.github/workflows/v2-ci.yml)
[![Legacy Tests](https://img.shields.io/badge/Legacy%20Tests-125%20Passing-brightgreen?style=flat-square)](pytest.ini)
[![v2 Tests](https://img.shields.io/badge/v2%20Tests-36%20Passing-brightgreen?style=flat-square)](v2/api/tests)
[![Frontend Tests](https://img.shields.io/badge/Vitest-5%20Passing-brightgreen?style=flat-square)](v2/web/__tests__)
[![Accessibility](https://img.shields.io/badge/Accessibility-Senior%20Mode%20AAA-blue?style=flat-square)](v2/web/components/Navbar.tsx)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20हिन्दी-orange?style=flat-square)](v2/web/messages)

**Scam Shield v2** is a production-ready, citizen-first cybersecurity layer designed to protect Indian citizens — especially elderly, rural, and non-technical individuals — from digital fraud. It wraps an established 5-agent Python multi-agent pipeline in a modern **FastAPI** backend with real-time **Server-Sent Events (SSE)**, paired with a bilingual **Next.js 14 App Router** web application.

---

## 🌟 Key Capabilities

1. **Non-Destructive Upgrade**: 100% of new code is isolated inside `v2/`. Zero legacy files modified, moved, or deleted. All 125 original tests continue passing.
2. **Real-Time 5-Agent Pipeline**:
   - 🔍 **Extractor**: Regex and OCR entity isolation (URLs, phones, UPI handles, sender headers).
   - 🧠 **Pattern Analyst**: Identifies psychological levers (urgency, intimidation, false rewards).
   - 🛡️ **Entity Checker**: WHOIS registration age, punycode, lookalike domain matching, and fraud database lookups.
   - ⚖️ **Synthesis Judge**: Evidence-weighted verdict balancing (Safe, Suspicious, Scam) with conflict resolution.
   - 🤝 **Citizen Safety Advisor**: Generates plain-language action steps in English or Hindi with one next step.
3. **Citizen & Senior-First Accessibility**:
   - **Senior Mode (A+)**: 18px+ font sizing, high-contrast borders, 52px+ minimum touch targets.
   - **Voice Input**: Web Speech API for voice-driven inputs in English and Hindi.
   - **1-Click WhatsApp Family Alert**: Pre-formatted, non-technical safety warnings under 280 characters.
   - **Direct 1930 Dialing**: Emergency one-tap link to India's National Cyber Crime Helpline.
4. **Zero-Knowledge Privacy**: Raw messages, screenshots, and OTPs are never stored or persisted on disk. Only irreversible cryptographic hashes of verified fraud entities are recorded.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ (tested on Node v20/v24)
- Git

### 1. Install Dependencies
```bash
# Backend dependencies
pip install -r requirements.txt
pip install sse-starlette pydantic-settings slowapi sqlalchemy alembic pytest-asyncio pytest-cov

# Frontend dependencies
cd v2/web
npm install
cd ../..
```

### 2. Start Both Backend & Frontend Concurrently

**On Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File v2/scripts/dev.ps1
```

**On Linux / macOS (Bash):**
```bash
chmod +x v2/scripts/dev.sh
./v2/scripts/dev.sh
```

- **Frontend Application**: `http://localhost:3000`
- **FastAPI Interactive Docs**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/health`

---

## 🧪 Verification & Test Suites

Scam Shield v2 is backed by multiple levels of verification:

```bash
# 1. Non-destructive legacy integrity check
powershell -ExecutionPolicy Bypass -File v2/scripts/check_protected.ps1

# 2. Legacy regression tests (125 tests passing)
pytest tests/ -q

# 3. v2 FastAPI & Services test suite (36 tests passing)
pytest v2/api/tests/ -v --cov=v2.api.services

# 4. v2 Next.js unit tests (5 tests passing)
cd v2/web && npm test

# 5. Live smoke test
python v2/scripts/smoke_test.py --base-url http://127.0.0.1:8000
```

---

## 📊 Benchmark & Evaluation

Run the 67-case bilingual benchmark harness:
```bash
python v2/api/benchmarks/run_v2_benchmark.py --dataset v2 --offline
```
- Benchmark results are generated at [`v2/docs/BENCHMARK_V2.md`](docs/BENCHMARK_V2.md).
- Evaluates Hinglish scams (20), Hindi Devanagari scams (15), Extra Genuine notifications (20), and Adversarial injections (12).

---

## 📐 Architecture & Repository Layout

```
v2/
├── .gitignore                    # Build artifacts and local databases
├── .env.example                  # Environment variable reference template
├── README.md                     # Master documentation
├── api/                          # FastAPI Backend Application
│   ├── config.py                 # Pydantic Settings
│   ├── main.py                   # ASGI Application factory & lifespan
│   ├── models/schemas.py         # Request, response, and SSE event contracts
│   ├── services/                 # Normalization, taxonomy, conflict, pipeline, enrichment
│   ├── db/                       # SQLAlchemy models & repository
│   ├── middleware/               # RequestId, SecurityHeaders, RateLimit
│   ├── routers/                  # /health, /analyze, /samples, /community
│   ├── tests/                    # Backend unit and contract tests (36 passing)
│   └── benchmarks/               # Benchmark harness runner
├── web/                          # Next.js 14 App Router Frontend
│   ├── app/                      # Layout, globals.css, and pages (/, /how-it-works, /community, /about)
│   ├── components/               # Navbar, InputCard, PipelineView, VerdictBanner, AdvicePanel
│   ├── hooks/useAnalysis.ts      # State machine & speech recognition hook
│   ├── lib/api/                  # SSE stream parser & Zod contracts
│   ├── messages/                 # en.json and hi.json dictionaries
│   └── __tests__/                # Vitest unit test suite (5 passing)
├── data/                         # Benchmark datasets (Hinglish, Devanagari, Genuine, Adversarial, Screenshots)
├── docs/                         # DISCOVERY.md, ARCHITECTURE.md, API_CONTRACT.md, BENCHMARK_V2.md, DEPLOY.md, DEMO_SCRIPT.md, E2E_LOG.md
└── scripts/                      # check_protected.ps1/.sh, dev.ps1/.sh, smoke_test.py, make_screenshots.py
```

---

## 🛡️ Non-Destructive Guarantee

All files outside `v2/` are strictly protected:
- Protected paths: `app.py`, `orchestrator.py`, `tools_interface.py`, `tools_mock.py`, `tools_real.py`, `requirements.txt`, `pytest.ini`, `.env`, `README.md`, `.gitignore`, `agents/`, `tools/`, `ui/`, `data/`, `tests/`, `docs/`, `cache/`.
- Automated audit script `v2/scripts/check_protected.ps1` runs on every CI commit and blocks modifications.
- Original Streamlit UI (`streamlit run app.py`) remains 100% operational in parallel.
