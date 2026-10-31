# Scam Shield v2: Production Deployment Guide

Comprehensive instructions for deploying Scam Shield v2 to Vercel (Next.js Frontend) and Render / Railway / Fly.io (FastAPI Backend), with optional PostgreSQL (Neon / Supabase).

---

## 1. System Architecture

```
[ Citizen Browser / Phone ]
            │
            ▼
┌───────────────────────────┐         ┌───────────────────────────────┐
│ Next.js Frontend (Vercel) │ ──────> │ FastAPI Backend (Render/AWS)  │
│ Port 3000 / Edge Network  │  HTTPS  │ Port 8000 / ASGI Workers      │
└───────────────────────────┘         └───────────────────────────────┘
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                      ┌─────────────────────────┐           ┌────────────────────────┐
                      │ Legacy Agent Core       │           │ Community DB           │
                      │ Read-Only Multi-Agent   │           │ PostgreSQL / SQLite 3  │
                      └─────────────────────────┘           └────────────────────────┘
```

---

## 2. Environment Variables Reference

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | Yes | `production` | Environment tier (`development`, `staging`, `production`) |
| `ALLOWED_ORIGINS` | Yes | `*` | Comma-separated list of trusted CORS origins |
| `GEMINI_API_KEY` | Yes | None | Primary LLM provider key |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Model identifier for extraction & reasoning |
| `GROQ_API_KEY` | Yes | None | Resilient fallback LLM key |
| `GROQ_MODEL` | No | `qwen/qwen3.8-27b` | Model identifier for Groq failover |
| `COMMUNITY_ENABLED` | No | `true` | Enables peer threat intelligence lookup |
| `COMMUNITY_ESCALATION` | No | `true` | Allows reported fraud entities to escalate verdicts |
| `DATABASE_URL` | No | `sqlite:///./v2/scam_shield_v2.db` | SQLAlchemy connection string (SQLite or Postgres) |
| `HASH_SALT` | Yes | Random | Cryptographic salt for irreversible entity hashing |
| `NEXT_PUBLIC_APP_URL`| Yes | None | Canonical frontend domain for WhatsApp share links |
| `API_INTERNAL_URL` | Yes | `http://127.0.0.1:8000` | Backend reverse proxy destination |

---

## 3. Frontend Deployment (Vercel)

1. Connect your repository to **Vercel**.
2. Set **Root Directory** to `v2/web`.
3. Set **Framework Preset** to `Next.js`.
4. Configure Environment Variables:
   - `API_INTERNAL_URL`: URL of your deployed FastAPI backend (e.g., `https://api.scamshield.in`).
   - `NEXT_PUBLIC_APP_URL`: Frontend domain (e.g., `https://scamshield.in`).
5. Deploy.

---

## 4. Backend Deployment (Render / Railway / AWS ECS)

### Method A: Render
1. Create a new **Web Service** on Render.
2. Root Directory: `.` (repository root).
3. Runtime: **Python 3**.
4. Build Command:
   ```bash
   pip install --upgrade pip && pip install -r requirements.txt && pip install sse-starlette pydantic-settings slowapi sqlalchemy alembic pytest-asyncio
   ```
5. Start Command:
   ```bash
   uvicorn v2.api.main:app --host 0.0.0.0 --port $PORT --workers 4
   ```

### Method B: Docker Container
Use the production multi-stage Dockerfile provided in `v2/api/Dockerfile`:
```bash
docker build -f v2/api/Dockerfile -t scam-shield-v2:latest .
docker run -p 8000:8000 --env-file .env scam-shield-v2:latest
```

---

## 5. Database Setup (PostgreSQL)

To use PostgreSQL instead of SQLite in production:
1. Provision a PostgreSQL instance (e.g., Neon Serverless Postgres or AWS RDS).
2. Set `DATABASE_URL=postgresql+psycopg2://user:password@host:5432/scamshield`.
3. Install Postgres driver: `pip install psycopg2-binary`.
4. Run migrations: `alembic -c v2/api/alembic.ini upgrade head` (or allow automated table initialization on startup).

---

## 6. Security Hardening & Zero-Knowledge Verification

- **TLS 1.3**: Terminate SSL at Cloudflare or Vercel edge.
- **Zero-Logging Audit**: Confirm that application logs at INFO level only emit timing and masked entity hashes, never message text or user PII.
- **Rate Limiting**: Enforced at 15 queries/minute per IP address on `/api/v2/analyze`.
- **National Helpline**: 1930 dialing link verified on iOS and Android dialers.
