# --- Stage 1: Build Frontend ---
FROM node:20-slim AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Run Backend ---
FROM python:3.11-slim
# ✅ Keep ffmpeg! It is required for the Groq Whisper transcription to work
RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install dependencies first (for faster caching)
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# 2. Copy the backend code FIRST
COPY backend/ /app/backend/

# 3. Create the static folder explicitly
RUN mkdir -p /app/backend/static

# 4. Copy the React build INTO the static folder (Overwrite anything there)
COPY --from=build-stage /app/frontend/dist/ /app/backend/static/

# Final environment setup
WORKDIR /app/backend

# Render uses the PORT environment variable
ENV PORT=8000
EXPOSE 8000

CMD ["python", "main.py"]