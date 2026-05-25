"""
RQ Worker entrypoint.

Run with:
    python worker.py

This starts a worker that listens on the "default" queue and
processes generate_assessment_task jobs enqueued by FastAPI.
"""

import os
from redis import Redis
from rq import Worker, Queue
from dotenv import load_dotenv

load_dotenv()
# Load parent root-level .env if it exists
load_dotenv(dotenv_path=os.path.abspath(os.path.join(os.path.dirname(__file__), "../.env")))

redis_conn = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
queue = Queue("default", connection=redis_conn)

if __name__ == "__main__":
    print("🚀 RQ Worker started. Listening on queue: default")
    worker = Worker([queue], connection=redis_conn)
    worker.work()
