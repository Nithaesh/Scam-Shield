# Scam Shield v2 Web Frontend

> **Autonomous Multi-Agent Citizen Fraud Intelligence Layer**  
> Built for ordinary Indian citizens on mid-range Android phones and 4G networks. Delivers instant, plain-language fraud verdicts in **English** and **Hindi (हिन्दी)** with zero data retention.

---

## 1. Overview & Architecture

Scam Shield v2 Web is a production-ready Next.js 14 application built to pair with the FastAPI Scam Shield v2 backend or run with graceful local deterministic mock simulation.

```
                    ┌────────────────────────┐
                    │ Raw Citizen Submission │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │    Extractor Agent     │
                    └─────┬────────────┬─────┘
                          │            │
            ┌─────────────▼──┐      ┌──▼─────────────┐
            │ Pattern Analyst│      │ Entity Checker │
            │ (Psychological)│      │  (Forensics)   │
            └─────────────┬──┘      └──┬─────────────┘
                          │            │
                          └─────┬──────┘
                                │
                    ┌───────────▼────────────┐
                    │   Judge Consensus Gate │
                    │   (Conflict Veto Rule) │
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

- **Investigation Desk Concept**: Clean, technical trust interface designed around evidence collection rather than dark hacker tropes.
- **Signature PipelineGraph**: Custom SVG cubic bezier n8n-style agent graph with live glowing packet animations, branch rendering, and clickable agent prompt inspector drawers.
- **Multilingual Support**: First-class English (`en`) and Devanagari Hindi (`hi`) via `next-intl` with 100% key parity across all copy.
- **Zero-Knowledge Privacy**: No citizen SMS, WhatsApp forwards, or phone numbers are stored to disk. Local history defaults to discarding text previews unless opted in.
- **WCAG AA Compliance**: High-contrast, tactile design system with dark (default) and light themes, accessible minimum 48px/54px touch targets, and skip links.
- **Citizen Action Bar**: Built-in Web Speech API Text-to-Speech (Hindi and English Indian accents), one-tap family warning copy, TXT/JSON evidence report download, and direct 1930 helpline routing.

---

## 3. Tech Stack

- **Framework**: Next.js 14 (App Router with `[locale]` dynamic routing)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS 3.4 with custom CSS variables & semantic tokens
- **Internationalization**: `next-intl` v4
- **Animation**: `framer-motion` 14
- **Components & Accessibility**: `@radix-ui/react-accordion`, `@radix-ui/react-dialog`
- **Icons**: `lucide-react` (Strict rule: zero emoji as icons)
- **Validation**: `zod` 3.23 (Contract schemas)
- **Testing**: `vitest` with `@testing-library/react` and `jsdom`

---

## 4. Quickstart Guide

### Windows (PowerShell)
```powershell
# Navigate to web workspace
cd v2/web

# Install dependencies (if not already installed)
npm install

# Run development server
npm run dev
# App opens at http://localhost:3000

# Build production bundle
npm run build

# Run unit tests
npm test
```

### Linux / macOS
```bash
cd v2/web
npm install
npm run dev
npm run build
npm test
```

---

## 5. Environment Configuration

Create a `.env.local` inside `v2/web` if connecting to a custom backend:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | FastAPI backend endpoint for SSE streaming (`/api/v2/analyze/stream`). |

> **Graceful Offline Mode**: If the FastAPI backend is offline or unreachable, Scam Shield v2 Web automatically engages local deterministic simulation for testing and demos.

---

## 6. Route Map

| Path | Purpose |
| :--- | :--- |
| `/[locale]` | High-converting citizen landing page with live hero demo, evidence strip, bento features, scam matrix, and honest numbers. |
| `/[locale]/check` | Hermes-style 3-column investigation workspace: sidebar history, parallel agent replies, verdict card, and sticky forensic rail. |
| `/[locale]/how-it-works` | Technical deep-dive into the 5 agents, consensus mechanics, and invariant conflict rules. |
| `/[locale]/community` | Cryptographic threat registry lookup (HMAC-SHA256 salted hashes only). |
| `/[locale]/about` | Civic mission, data privacy guarantees, and evaluation methodology. |
| `/[locale]/dev` | Token showcase and Storybook-style component audit harness. |

---

## 7. Verification & Auditing

### 1. Frontend Unit Tests (Vitest)
```bash
npm test
```
*Tests: contract schema conformances, defanger utilities, proof benchmark honesty, and report generation.*

### 2. Protected Files Audit
```powershell
powershell -ExecutionPolicy Bypass -File v2/scripts/check_protected.ps1
```
*Confirms 100% non-destructive build: legacy Streamlit app, agents, tools, tests, and configuration remain untouched.*

### 3. Legacy Pytest Suite
```bash
pytest tests/ -q
```
*Runs all 125 legacy test cases (100% passing).*

---

## 8. Civic Project Disclaimer

Scam Shield is an independent citizen-protection project developed for **Hacktober Hack Day Prayagraj 2026**. AI analysis provides rapid risk guidance and does not replace official police investigations. Victims of monetary cyber fraud should immediately dial **1930** (National Cybercrime Reporting Portal, Government of India).
