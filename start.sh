#!/bin/bash
# start.sh

echo "=== Starting AI Tutor Screener ==="
echo ">>> Python version: $(python --version)"
echo ">>> Working directory: $(pwd)"

# Start FastAPI — it serves both API and React frontend
echo ">>> Starting FastAPI on port 8000..."
cd /app
exec python -m uvicorn backend.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1