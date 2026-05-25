# ==============================================================================
# Stage 1: Build the React Frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy dependency definitions and install packages
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source code and configurations
COPY vite.config.js index.html ./
COPY src/ ./src
COPY public/ ./public

# Build the production React app (compiles to /app/dist)
RUN npm run build


# ==============================================================================
# Stage 2: Build the Production Python App (FastAPI + RQ Worker)
# ==============================================================================
FROM python:3.12-slim
WORKDIR /app

# Prevent Python from writing pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

# Install basic system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for extremely fast package installations
RUN pip install --no-cache-dir uv

# Copy Python dependency lists
COPY backend/pyproject.toml backend/requirements.txt ./

# Install python dependencies system-wide inside the container
RUN uv pip install --system --no-cache -r requirements.txt

# Copy built React frontend assets from Stage 1 into /app/dist
# This is mounted and served natively by our FastAPI app
COPY --from=frontend-builder /app/dist ./dist

# Copy backend Python code
COPY backend/app ./app
COPY backend/tasks.py backend/worker.py ./
COPY entrypoint.sh ./

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose port 8000 for the FastAPI web server
EXPOSE 8000

# Default command: Runs both the FastAPI server and the RQ worker via the entrypoint script
CMD ["./entrypoint.sh"]
