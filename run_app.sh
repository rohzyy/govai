#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting GrievanceAI Enterprise (local dev)"
echo "Make sure you have created a .env file from .env.example and installed dependencies."

# Load .env variables if file exists (simple loader)
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs -d '\n' 2>/dev/null || true)
fi

# Start backend using uvicorn in background (for macOS / Linux)
cd "$PROJECT_DIR"
echo "Starting backend on port 8000..."
nohup python3 -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload > backend_dev.log 2>&1 &

# Start frontend
echo "Starting frontend (Next.js) on port 3000..."
cd "$PROJECT_DIR/frontend"
npm run dev > ../frontend_dev.log 2>&1 &

echo "Backend logs: $PROJECT_DIR/backend_dev.log"
echo "Frontend logs: $PROJECT_DIR/frontend_dev.log"
echo "Servers started in background (check logs)."