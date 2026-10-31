#!/usr/bin/env bash
# Bash dev runner for Scam Shield v2 (FastAPI backend + Next.js frontend)

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "========================================="
echo "  Starting Scam Shield v2 Dev Services  "
echo "========================================="

# Start backend
python3 -m uvicorn v2.api.main:app --host 127.0.0.1 --port 8000 --reload &
API_PID=$!

# Start frontend
(cd v2/web && npm run dev) &
WEB_PID=$!

trap "echo 'Stopping dev servers...'; kill $API_PID $WEB_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT

echo "[+] Backend API: http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)"
echo "[+] Frontend Web: http://127.0.0.1:3000"
echo "Press Ctrl+C to terminate both servers..."

wait
