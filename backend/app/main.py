"""
FastAPI Application

Routes:
  POST /api/generate        → enqueue RQ job, return { job_id }
  WS   /ws/{job_id}         → stream progress from Redis to frontend
  GET  /api/assignments     → list all saved assessments from MongoDB
"""

import os
import asyncio
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis
from rq import Queue
from dotenv import load_dotenv

from app.models import GenerationRequest
from app.cache import get_job_state
from app.database import get_all_assignments

load_dotenv()

# ── Redis + RQ Setup ──────────────────────────────────────────────────────────

redis_conn = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
job_queue = Queue("default", connection=redis_conn)


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="VedaAI Backend", version="1.0.0")

# Allow requests from the Vite dev server (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "VedaAI Backend"}


@app.post("/api/generate")
def enqueue_generation(request: GenerationRequest):
    """
    Accept form data, enqueue a background job, return job_id.
    Frontend uses job_id to open a WebSocket and receive progress.
    """
    from tasks import generate_assessment_task  # import here to avoid circular issues

    job_id = uuid.uuid4().hex
    payload = request.model_dump()

    job_queue.enqueue(
        generate_assessment_task,
        job_id,
        payload,
        job_timeout=120,  # 2 min max per job
    )

    return {"job_id": job_id}


@app.websocket("/ws/{job_id}")
async def websocket_stream(websocket: WebSocket, job_id: str):
    """
    Stream job progress from Redis to the frontend.

    Polls Redis every 500ms. Sends each new state as a JSON message.
    Closes the connection once step == "complete" or "failed".
    """
    await websocket.accept()

    last_step = None  # track last sent step to avoid duplicate messages

    try:
        while True:
            state = get_job_state(job_id)

            if state and state.get("step") != last_step:
                await websocket.send_json(state)
                last_step = state["step"]

                # Close gracefully after sending the final state
                if state["step"] in ("complete", "failed"):
                    break

            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        pass  # client closed the connection — that's fine


@app.get("/api/assignments")
async def list_assignments():
    """Return all saved assessments from MongoDB."""
    assignments = await get_all_assignments()
    return {"assignments": assignments}
