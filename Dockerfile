# --- Stage 1: Build Frontend ---
FROM node:20-slim AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Run build and then list files so we can see the output folder name in logs
RUN npm run build && ls -la

# --- Stage 2: Run Backend ---
FROM python:3.11-slim
RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the build output. 
# If Vite is building to 'dist', this works. 
# If it's building to 'build', change 'dist' to 'build' below.
COPY --from=build-stage /app/frontend/dist /app/backend/static

# Copy the rest of the backend code
COPY backend/ /app/backend/

# Final environment setup
WORKDIR /app/backend
EXPOSE 8000

CMD ["python", "main.py"]