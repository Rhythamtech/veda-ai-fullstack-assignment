"""
Redis helpers for job state.

The RQ worker writes progress updates here.
The WebSocket in main.py reads them and streams to the frontend.

Key format : job:{job_id}
TTL         : 1 hour (auto-cleaned after job is consumed)
"""

import os
import json
import redis
from dotenv import load_dotenv

load_dotenv()

# Synchronous Redis client (used by both worker and FastAPI via polling)
_r = redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379"),
    decode_responses=True,
)


def set_job_state(job_id: str, state: dict) -> None:
    """Save current job progress to Redis. TTL = 1 hour."""
    _r.set(f"job:{job_id}", json.dumps(state), ex=3600)


def get_job_state(job_id: str) -> dict | None:
    """Read current job state. Returns None if key doesn't exist yet."""
    raw = _r.get(f"job:{job_id}")
    return json.loads(raw) if raw else None
