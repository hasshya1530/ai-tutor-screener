FROM python:3.11-slim

# Install system deps
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node (for frontend build)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# ❌ REMOVE MODEL DOWNLOAD COMPLETELY
# (Do NOT copy download_models.py)
# (Do NOT run it)

# Build frontend
COPY frontend/ /app/frontend/
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Copy backend
WORKDIR /app
COPY backend/ /app/backend/

# Start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["/app/start.sh"]