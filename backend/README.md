# VedaAI Python Backend

This is the Python-based backend for VedaAI, implementing async background job generation, MongoDB persistence, Redis caching, and real-time progress updates using **RQ (Redis Queue)** and **FastAPI WebSocket**.

---

## 🛠 Prerequisites

Make sure the following services are installed and running locally:

1. **MongoDB** (running on `mongodb://localhost:27017`)
2. **Redis** (running on `redis://localhost:6379`)

If you don't have Redis running on your Mac:
```bash
brew install redis
brew services start redis
```

---

## 🚀 Setup & Installation

We use `uv` (modern Python package manager) for extremely fast installs and environment management.

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies** (in your `.venv` virtual environment):
   ```bash
   uv pip install -r pyproject.toml
   # or with standard pip:
   pip install .
   ```

3. **Configure environment variables**:
   Create or edit `backend/.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-real-openai-api-key
   OPENAI_MODEL=gpt-4o-mini
   MONGO_URL=mongodb://localhost:27017
   REDIS_URL=redis://localhost:6379
   ```

---

## 🏃 Running the Services

You need to run two separate processes in the `backend/` directory:

### 1. Start the Background Job Worker
The RQ worker processes question generation tasks in the background so that long LLM response delays do not block the HTTP server.

> [!IMPORTANT]
> **macOS Fork Safety Note**: 
> On macOS, you must disable the Objective-C fork safety check to prevent RQ from crashing during job execution. Set the `OBJC_DISABLE_INITIALIZE_FORK_SAFETY` environment variable before running the worker:
> ```bash
> export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
> python worker.py
> ```

### 2. Start the FastAPI API Server
The API server receives requests, enqueues background tasks, lists saved assessments, and streams live progress logs to the frontend via WebSocket.
```bash
uvicorn app.main:app --reload --port 8000
```

---

## 🧪 Testing the API directly (Optional)

You can check if the API is working by dispatching a test payload:

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chemistry Midterm",
    "dueDate": "2025-06-30",
    "instructions": "Focus on chemical equations",
    "questionTypes": [
      {"type": "Multiple Choice Questions", "count": 2, "marks": 1}
    ],
    "difficulty": "Easy",
    "cognitiveLevels": ["Remembering"],
    "syllabusTopics": ["Electrochemistry"]
  }'
```

This returns a `job_id`:
```json
{"job_id": "8c6f49f485744bb5837de9f1966da075"}
```

You can then track progress via the React dashboard!
