# Scam Shield v2 Web Frontend

> **Autonomous Multi-Agent Citizen Fraud Intelligence Layer**  
> Built for ordinary Indian citizens on mid-range Android phones and 4G networks. Delivers instant, plain-language fraud verdicts in **English** and **Hindi (हिन्दी)** with zero data retention.

---

## 1. Overview & Architecture

Scam Shield v2 Web is a production-ready **Next.js 16.4 (Turbopack)** application engineered to connect with the FastAPI Scam Shield v2 backend via real-time Server-Sent Events (SSE) or operate with an air-gapped deterministic client simulation.

```
                    ┌────────────────────────┐
                    │ Raw Citizen Submission │
                    │ (Text / Screenshot OCR)│
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │    Extractor Agent     │
                    │ (URLs, Phones, VPAs)   │
                    └─────┬────────────┬─────┘
                          │            │
            ┌─────────────▼──┐      ┌──▼─────────────┐
            │ Pattern Analyst│      │ Entity Checker │
            │ (Psychological)│      │ (Air-Gap WHOIS)│
            └─────────────┬──┘      └──┬─────────────┘
                          │            │
                          └─────┬──────┘
                                │
                    ┌───────────▼────────────┐
                    │  Judge Consensus Gate  │
                    │  (Bayesian Veto Rule)  │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │      Advisor Agent     │
                    │ (Plain Action & 1930)  │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │      Verdict Stamp     │
                    │ Safe / Suspicious/ Scam│
                    └────────────────────────┘
```

---

## 2. Key Features

- **Full-Screen Studio Dashboard**: Edge-to-edge workspace featuring dynamic 3D sentinel visualizer, quick-action scam presets (Bank KYC, Electricity Disconnection, CBI Digital Arrest), and quick evidence loader.
- **Multimodal Screenshot Uploads**:
  - Direct file picker via `<input type="file" accept="image/*" />`.
  - Drag-and-drop dropzone on both composer and modal.
  - Global `Ctrl + V` clipboard paste listener.
  - Interactive thumbnail preview chip with size display, status indicator, and instant removal button.
- **Real-Time N8N-Style DAG Workflow Graph**:
  - Live state tracker for each agent node (`○ QUEUED`, `● PROCESSING... 120ms`, `✓ DONE 120ms`).
  - Animated SVG glowing packet streams that follow the active execution stage in real-time.
  - Bilingual node labels in English and Devanagari Hindi.
- **Detailed 5-Agent Forensic Intelligence Dossier**:
  - **01 Extractor**: Defanged URLs (`hxxp[://]...`) with 1-click copy, phones, UPI VPAs, and GSM sender ID spoof check.
  - **02 Pattern Analyst**: Threat vector, psychological fear cues, and emotional pressure gauge score (0–100).
  - **03 Entity Checker**: Air-gapped DNS query log, WHOIS domain age (`< 7 Days` flag), and official Indian bank allowlist match.
  - **04 Judge Consensus Gate**: Calibrated Bayesian verdict, confidence percentage, and Precautionary Veto Rule audit log.
  - **05 Advisor Action Protocol**: Citizen headline advice, strict DO NOT rules, immediate action step, and pre-formatted National 1930 complaint.
- **Bilingual English & Hindi**: Complete bilingual parity across landing page, studio dashboard, navigation, and speech synthesis (`next-intl` and Web Speech API).
- **Zero-Knowledge Privacy**: Air-gapped OCR in memory; zero bytes saved to disk.
- **Civic Action Toolbar**: 1-click WhatsApp family warning copy, `.txt` Dossier and `.json` Evidence download, and direct 1930 helpline routing.

---

## 3. Tech Stack

- **Framework**: Next.js 16.4.3 (App Router with `[locale]` dynamic routing and Turbopack)
- **Language**: TypeScript 5.6
- **Typography**: Plus Jakarta Sans, Mukta (Devanagari), and JetBrains Mono
- **Styling**: Tailwind CSS 3.4 with custom tokens and dark/light mode
- **Internationalization**: `next-intl` v4
- **Animation**: Native SVG `animateMotion`, CSS keyframes, and `framer-motion`
- **Components & Accessibility**: `@radix-ui/react-accordion`, `@radix-ui/react-dialog`
- **Icons**: `lucide-react`
- **Validation**: `zod` 3.23 (Contract schemas)
- **Testing**: `vitest` with `@testing-library/react` and `jsdom` (9/9 tests passing)

---

## 4. Quickstart Guide

### Windows (PowerShell)
```powershell
# Navigate to web workspace
cd v2/web

# Install dependencies
npm install

# Run development server
npm run dev
# App opens at http://localhost:3000

# Run unit tests (9/9 passing)
npm test

# Build production bundle (14/14 routes compiled)
npm run build
```

### Linux / macOS
```bash
cd v2/web
npm install
npm run dev
npm test
npm run build
```

---

## 5. Environment Configuration

Create a `.env.local` inside `v2/web` if connecting to a custom backend:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | FastAPI backend endpoint for SSE streaming (`/api/v2/analyze`). |

> **Graceful Offline Mode**: If the backend is offline, Scam Shield v2 Web automatically engages local deterministic simulation for testing and demos.

---

## 6. Route Map

| Path | Purpose |
| :--- | :--- |
| `/[locale]` | CyberSafe high-fidelity landing page with rotating radar sweep, Indian infrastructure nodes, and interactive DAG demo. |
| `/[locale]/check` | Full-screen Studio Dashboard: interactive input composer, screenshot upload, live DAG workflow, and 5-agent forensic reports. |
| `/[locale]/how-it-works` | Technical deep-dive into the 5 agents, consensus mechanics, and invariant conflict rules. |
| `/[locale]/community` | Cryptographic threat registry lookup (HMAC-SHA256 salted hashes only). |
| `/[locale]/about` | Civic mission, data privacy guarantees, and evaluation methodology. |
| `/[locale]/dev` | Design system token showcase and component audit harness. |

---

## 7. Verification & Auditing

### 1. Frontend Unit Tests (Vitest)
```bash
npm test
```
*Result: 9/9 tests passing (contract schema conformances, defanger utilities, proof benchmark honesty, and report generation).*

### 2. Protected Files Audit
```powershell
powershell -ExecutionPolicy Bypass -File v2/scripts/check_protected.ps1
```
*Confirms 100% non-destructive build: zero legacy files modified.*

### 3. Legacy Pytest Suite
```bash
pytest tests/ -q
```
*Runs all 125 legacy test cases (100% passing).*

---

## 8. Civic Project Disclaimer

Scam Shield is an independent citizen-protection project developed for **Hacktober Hack Day Prayagraj 2026**. AI analysis provides rapid risk guidance and does not replace official police investigations. Victims of monetary cyber fraud should immediately dial **1930** (National Cybercrime Reporting Portal, Government of India).
