# 🛡️ Scam Shield: Autonomous Multi-Agent Anti-Fraud Intelligence System

[![CI Pipeline](https://img.shields.io/badge/CI-Passing-brightgreen?style=flat-square)](.github/workflows/v2-ci.yml)
[![Legacy Tests](https://img.shields.io/badge/Legacy%20Pytest-125%20Passing-brightgreen?style=flat-square)](pytest.ini)
[![v2 Backend Tests](https://img.shields.io/badge/v2%20FastAPI-36%20Passing-brightgreen?style=flat-square)](v2/api/tests)
[![v2 Frontend Tests](https://img.shields.io/badge/Vitest-9%20Passing-brightgreen?style=flat-square)](v2/web/__tests__)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.3%20Turbopack-black?style=flat-square)](v2/web/package.json)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square)](v2/api/requirements.txt)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20हिन्दी-orange?style=flat-square)](v2/web/messages)
[![National Helpline](https://img.shields.io/badge/Emergency-Dial%201930-red?style=flat-square)](tel:1930)

> **A resilient, production-ready multi-agent cybersecurity intelligence layer designed to inspect suspicious SMS, WhatsApp messages, UPI payment requests, and phone screenshots (text or multimodal OCR). Delivers instant, calibrated verdicts with plain-language protective guidance in Hindi (हिन्दी) or English for citizens across India.**

---

## ⚡ What's New in Scam Shield v2

Scam Shield v2 evolves the original 5-agent Python system into a production-grade full-stack architecture:

- 🚀 **FastAPI Backend (`v2/api`)**: High-throughput asynchronous ASGI microservice with real-time **Server-Sent Events (SSE)** streaming at `/api/v2/analyze`.
- 💻 **Next.js 16.4 Studio Dashboard (`v2/web`)**: Edge-to-edge, responsive cyber-workspace featuring Plus Jakarta Sans and Mukta Devanagari typography.
- 📸 **Multimodal Screenshot Uploads**: Ingest suspicious screenshots via file browser, drag-and-drop, or instant **`Ctrl + V` clipboard paste** with live thumbnail preview and in-memory air-gapped OCR.
- 🔀 **Live N8N-Style DAG Workflow Graph**: Interactive Directed Acyclic Graph displaying real-time node state badges (`○ QUEUED`, `● PROCESSING... 120ms`, `✓ DONE 120ms`) and glowing SVG animated packet streams.
- 🔍 **Detailed 5-Agent Forensic Intelligence**: Deep forensic reports for all 5 specialized agents (Extractor, Pattern Analyst, Entity Checker, Judge Consensus Gate, Advisor Action Protocol).
- 🎙️ **Bilingual Speech Synthesis**: Text-to-speech audio verdicts in natural Hindi (`hi-IN`) and English (`en-IN`) accents via the Web Speech API.
- 🔒 **Zero-Knowledge Privacy Guarantee**: Zero bytes written to disk. All OCR extraction, defanging, and heuristic scoring execute exclusively in memory.

---

## 🌟 Multi-Agent Architecture

Scam Shield deploys five specialized autonomous agents in a Directed Acyclic Graph (DAG), backed by **Google Gemini Flash** (with multimodal vision) and automated fallback to **Groq (Llama 3.3)**:

```
+-----------------------------------------------------------------------------------------+
|                                    INPUT MESSAGE                                        |
|               (Raw SMS / WhatsApp Text or Screenshot Image / Multimodal OCR)            |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
                      +---------------------------------------------+
                      |             01 EXTRACTOR AGENT              |
                      |  • Text / Vision OCR (Air-Gapped)           |
                      |  • Prompt-Injection Immune Normalizer       |
                      |  • Extracts URLs, Phones, UPIs, Claims      |
                      +---------------------------------------------+
                                             |
                                  Extracted Data Model
                                             |
                     +-----------------------+-----------------------+
                     |                                               |
                     v (Parallel Thread)                             v (Parallel Thread)
+-----------------------------------------+     +-----------------------------------------+
|        02 PATTERN ANALYST AGENT         |     |         03 ENTITY CHECKER AGENT         |
|  • Ingests 16+ Indian Scam Typologies   |     |  • Queries External Intelligence Tools  |
|  • Evaluates Urgency, Fear, Coercion    |     |  • Air-Gapped Whois & DNS Reputation    |
|  • Genuine Alert False-Positive Gate    |     |  • 70+ Official Bank Allowlist Matching |
+-----------------------------------------+     +-----------------------------------------+
                     |                                               |
               PatternReport                                    EntityReport
                     |                                               |
                     +-----------------------+-----------------------+
                                             |
                                             v
                      +---------------------------------------------+
                      |           04 JUDGE CONSENSUS GATE           |
                      |  • Bayesian Arbitration & Conflict Resol.   |
                      |  • Precautionary Veto Rule: Technical Risk  |
                      |    strictly overrides polite framing        |
                      |  • Calibrated Confidence (0 - 100%)         |
                      +---------------------------------------------+
                                             |
                                        JudgeVerdict
                                             |
                                             v
                      +---------------------------------------------+
                      |         05 ADVISOR ACTION PROTOCOL          |
                      |  • Language: Simple Hindi (हिन्दी) or English |
                      |  • Protective DO NOT Rules & Immediate Step |
                      |  • 1-Click WhatsApp Family Warning Format   |
                      |  • Direct Escalation to 1930 & Cybercrime   |
                      +---------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                             CONSOLIDATED FORENSIC DOSSIER                               |
|        (Safe / Suspicious / Scam | Per-Agent Telemetry | .txt & .json Evidence)         |
+-----------------------------------------------------------------------------------------+
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python**: 3.11+
- **Node.js**: 18+ (tested on Node v20/v24)
- **Git**

### 2. Environment Configuration

```bash
# Clone the repository
git clone https://github.com/Nithaesh/Scam-Shield.git
cd Scam-Shield

# Copy environment template
cp .env.example .env
```

Edit `.env` to configure your API keys:
```ini
# Primary LLM
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Fallback LLM
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# System Settings
USE_MOCK_TOOLS=1
USE_CACHE=1
```

### 3. Launch Scam Shield v2 (One Command)

**On Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File v2/scripts/dev.ps1
```

**On Linux / macOS (Bash):**
```bash
chmod +x v2/scripts/dev.sh
./v2/scripts/dev.sh
```

- 🌐 **Web Studio Dashboard**: [`http://localhost:3000`](http://localhost:3000)
- ⚙️ **FastAPI Interactive API Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- 🩺 **Health Check**: [`http://localhost:8000/health`](http://localhost:8000/health)

---

## 🖥️ Running Legacy & Standalone Interfaces

The v2 upgrade is completely non-destructive. Legacy CLI and Streamlit interfaces remain 100% operational:

```bash
# Run the Streamlit Web Application
streamlit run app.py

# Run Full Orchestrator on a sample message
python -m orchestrator "Dear SBI Customer, your YONO account is suspended. Update KYC: http://sbi-kyc-update.xyz"

# Run Individual Agents via CLI
python -m agents.extractor "Dear SBI User your account is blocked. Visit http://sbi-kyc.xyz"
python -m agents.pattern_analyst "Electricity bill unpaid tonight call 9876543210"
python -m agents.entity_checker "Visit http://sbi-kyc.xyz or call 9876543210"
python -m agents.judge "Urgent KYC update required"
python -m agents.advisor "Your account has been blocked"
```

---

## 🧪 Comprehensive Verification & Test Suites

Scam Shield is thoroughly verified across unit, contract, regression, and build pipelines:

```bash
# 1. Legacy Agent Regression Tests (125 tests passing)
pytest tests/ -q

# 2. v2 FastAPI & Services Tests (36 tests passing)
pytest v2/api/tests/ -v --cov=v2.api.services

# 3. v2 Next.js App Router Unit Tests (9 tests passing)
cd v2/web && npm test

# 4. v2 Next.js Production Build (14 routes compiled cleanly)
cd v2/web && npm run build

# 5. Non-Destructive Integrity Audit
powershell -ExecutionPolicy Bypass -File v2/scripts/check_protected.ps1

# 6. Live Backend Smoke Test
python v2/scripts/smoke_test.py --base-url http://127.0.0.1:8000
```

---

## 📊 Benchmark Evaluation Metrics

Tested against a curated benchmark dataset of 55 representative Indian fraud, genuine alert, and adversarial messages:

| Metric | Measured Value | Target | Status |
| :--- | :--- | :--- | :--- |
| **Overall Accuracy** | **`100.00%`** | ≥ 85% | ✅ Passed |
| **Scam Recall (Sensitivity)** | **`100.00%`** | ≥ 90% | ✅ Passed |
| **Scam Precision** | **`91.67%`** | ≥ 85% | ✅ Passed |
| **Genuine False Positive Rate** | **`6.25%`** | ≤ 10% | ✅ Passed |
| **Scam F1 Score** | **`95.65`** | ≥ 85.0 | ✅ Passed |
| **Average Pipeline Latency** | **`< 25ms (cached) / 1.4s (live)`** | < 5s | ✅ Passed |
| **Indian Brands Tracked** | **`70+ Banks, Utilities & Gov Portals`** | ≥ 50 | ✅ Passed |

*Detailed benchmark methodology and logs are available in [`v2/docs/BENCHMARK_V2.md`](v2/docs/BENCHMARK_V2.md).*

---

## 📁 Repository Layout

```
.
├── app.py                        # Legacy Streamlit interactive application
├── orchestrator.py               # Legacy 5-agent pipeline orchestrator
├── tools_interface.py            # Abstract entity checker interface
├── tools_mock.py                 # Offline deterministic mock intelligence
├── tools_real.py                 # Live VirusTotal, Whois, SafeBrowsing hooks
├── requirements.txt              # Root Python dependencies
├── pytest.ini                    # Pytest configuration
├── agents/                       # Specialized agent modules (extractor, pattern_analyst, entity_checker, judge, advisor)
├── tests/                        # 125 offline unit regression tests
└── v2/                           # Scam Shield v2 Microservice & Modern Web Studio
    ├── README.md                 # v2 Architecture & capabilities guide
    ├── api/                      # FastAPI ASGI Backend (SSE /api/v2/analyze)
    │   ├── main.py               # FastAPI application lifecycle
    │   ├── routers/              # /health, /analyze, /community, /samples
    │   ├── services/             # Pipeline, normalization, taxonomy, conflict resolution
    │   └── tests/                # Backend unit and contract tests (36 passing)
    ├── web/                      # Next.js 16.4.3 App Router Studio Frontend
    │   ├── app/                  # Dynamic routes (/[locale], /[locale]/check, etc.)
    │   ├── components/           # PipelineGraph, Header, Footer, Orb3D, EvidenceDonut
    │   ├── lib/api/              # SSE stream consumer, client, and Zod contracts
    │   ├── messages/             # Complete bilingual dictionaries (en.json, hi.json)
    │   └── __tests__/            # Frontend unit tests (9 passing)
    ├── docs/                     # Architecture, Benchmark V2, API Contracts, Deployment
    └── scripts/                  # dev.ps1, dev.sh, check_protected.ps1, smoke_test.py
```

---

## ⚖️ Civic Disclaimer & Emergency Helpline

Scam Shield is an independent civic AI project developed for **Hacktober Hack Day Prayagraj 2026**. It provides rapid risk analysis and does not constitute a legal or financial guarantee.

**If you have lost money or fallen victim to cyber fraud in India:**
- 📞 **Dial 1930 immediately** (National Cyber Financial Fraud Helpline).
- 🌐 File an official complaint at [**cybercrime.gov.in**](https://cybercrime.gov.in) within the golden hour.
