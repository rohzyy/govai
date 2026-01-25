#!/bin/bash

# Get the absolute path of the current directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting GrievanceAI Enterprise on macOS..."

# Start Backend in a new Terminal tab/window
echo "Starting Backend..."
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR' && python3 -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload\""

# Start Frontend in a new Terminal tab/window
echo "Starting Frontend..."
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/frontend' && npm run dev\""

echo "✅ Commands sent to Terminal. Check the new windows!"
