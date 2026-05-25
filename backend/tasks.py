"""
RQ Task: Assessment Generation

This function runs inside the RQ worker process (not in FastAPI).
It writes progress updates to Redis so the WebSocket can stream them.

Steps:
  1. Analyzing   → 20%
  2. Generating  → 60%  ← OpenAI call
  3. Saving      → 85%  ← MongoDB insert
  4. Complete    → 100% ← full paper in Redis
"""

import asyncio
from app.cache import set_job_state
from app.database import save_assignment
from app.generator import generate_assessment


def generate_assessment_task(job_id: str, payload: dict) -> None:
    """
    Background job enqueued by POST /api/generate.
    Progress is written to Redis; the WebSocket reads and streams it.
    """

    # Step 1 — Analyze
    set_job_state(job_id, {
        "type": "progress",
        "step": "analyzing",
        "progress": 20,
        "message": "Analyzing syllabus and building prompt...",
    })

    # Step 2 — Generate (OpenAI call)
    set_job_state(job_id, {
        "type": "progress",
        "step": "generating",
        "progress": 60,
        "message": "AI is generating questions...",
    })

    paper = generate_assessment(payload)  # ← actual LLM call

    # Step 3 — Save to MongoDB
    set_job_state(job_id, {
        "type": "progress",
        "step": "saving",
        "progress": 85,
        "message": "Saving assessment to database...",
    })

    asyncio.run(save_assignment(paper))

    # Step 4 — Done: write full paper to Redis for WebSocket to pick up
    set_job_state(job_id, {
        "type": "complete",
        "step": "complete",
        "progress": 100,
        "message": "Assessment ready!",
        "paper": paper,
    })
