#!/bin/bash

# Prevent the container from exiting if any command fails, but print errors
set -e

# Set macOS/Linux Objective-C/Python fork safety check (crucial for background task execution)
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

# 1. Start the RQ Worker in the background
echo "🚀 Starting RQ Background Task Worker..."
python worker.py &
WORKER_PID=$!

# 2. Start the FastAPI Web Server (blocking process)
echo "🌐 Starting FastAPI Server via Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
