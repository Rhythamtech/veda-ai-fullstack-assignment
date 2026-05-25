# VedaAI - Hiring Assignment

A pixel-perfect, highly responsive React application paired with a robust Python backend built for the VedaAI hiring assignment. The project implements a dynamic layout system with support for desktop and mobile orientations, managing application state through Zustand, and leveraging a background job generation queue using **FastAPI**, **RQ (Redis Queue)**, **MongoDB**, and **WebSockets**.

---

## 🚀 Setup & Execution Instructions

Follow these steps to get the entire monorepo running locally.

### 📋 Prerequisites

Ensure the following tools and databases are installed and running on your system:
- **Node.js** (v18 or higher recommended) + `npm`
- **Python** (v3.11 or higher recommended) + `uv` (or `pip`)
- **MongoDB** (running locally on `mongodb://localhost:27017`)
- **Redis** (running locally on `redis://localhost:6379`)

> [!TIP]
> If you are on macOS and need to install/start Redis:
> ```bash
> brew install redis
> brew services start redis
> ```

---

### 1. 🐍 Running the Backend Services

Open your terminal, navigate to the `backend/` directory, and run the services:

#### A. Install Backend Dependencies:
We recommend using `uv` for ultra-fast setup, but standard `pip` works perfectly:
```bash
cd backend
# Using uv (recommended):
uv pip install -r pyproject.toml
# Or using standard pip:
pip install .
```

#### B. Setup Environment Variables:
Create a `.env` file in the `backend/` directory and add your credentials:
```env
OPENAI_API_KEY=sk-your-real-openai-api-key
OPENAI_MODEL=gpt-4o-mini
MONGO_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
```

#### C. Start the RQ Worker (Terminal 1):
The background worker processes question generation tasks sequentially so long LLM delays never block your API server.
```bash
cd backend
python worker.py
```

#### D. Start the FastAPI API Server (Terminal 2):
Streams live task state updates over WebSocket and registers REST endpoints.
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

---

### 2. ⚛️ Running the Frontend Server (Terminal 3)

Open a new terminal window at the root of the project to install and run the React web application:

#### A. Install Frontend Dependencies:
```bash
npm install
```

#### B. Start Vite Development Server:
```bash
npm run dev
```
*The React app will typically start on `http://localhost:5173/`. Open this URL in your browser.*

---

## 🏗 Architecture & Stack Overview

The application is built using a modern, lightweight, and scalable stack to ensure high performance and a seamless developer experience:

### Frontend
- **Framework**: React 19 + Vite for rapid development and optimized builds.
- **State Management**: **Zustand** is utilized for centralized, lightweight global state management (`useAssessmentStore.js`).
- **WebSocket Streaming**: Connects directly to the FastAPI server and displays a live, multi-step progress bar showing worker state (building, generating, saving, finished).
- **Styling**: Pure Vanilla CSS leveraging CSS Variables (Custom Properties) and modern Flexbox/Grid layouts.

### Backend
- **Framework**: **FastAPI** for async route handlers and lightweight WebSocket connection pooling.
- **Queue/Worker**: **RQ (Redis Queue)** to process question generation asynchronously in a separate process.
- **LLM Engine**: **OpenAI API** configured to output structured JSON papers parsed directly into safe backend data objects using **Pydantic**.
- **Databases**: **MongoDB** (using the non-blocking **Motor** async driver) to persist generated assessments, and **Redis** to cache/share job progress.
- **Graceful Fallback**: If the local Python backend is not running, the React app automatically falls back to an offline simulated stream, keeping the UI fully operational!
