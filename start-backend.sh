#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Terminate background processes on Ctrl+C
cleanup() {
    echo -e "\n${RED}🛑 Stopping all backend services...${NC}"
    kill $WORKER_PID $UVICORN_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🚀 Starting VedaAI Backend Stack...${NC}"

# Navigate to the backend directory
cd "$(dirname "$0")/backend" || exit 1

# Check if .env exists
if [ -f .env ]; then
    echo -e "${GREEN}✓ Loading environment variables from backend/.env${NC}"
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${YELLOW}⚠ Warning: backend/.env not found. Using default environment variables.${NC}"
fi

# Set macOS objective-c fork safety check (required for macOS)
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
echo -e "${GREEN}✓ Set OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES${NC}"

# 1. Start the RQ Worker in the background
echo -e "${BLUE}📦 Starting RQ Worker in the background...${NC}"
python worker.py &
WORKER_PID=$!

# Give the worker a moment to start
sleep 1

# 2. Start FastAPI via Uvicorn (blocking)
echo -e "${BLUE}🌐 Starting FastAPI Server (uvicorn)...${NC}"
uvicorn app.main:app --reload --port 8000 &
UVICORN_PID=$!

# Wait for both background processes
wait $WORKER_PID $UVICORN_PID
