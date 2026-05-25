"""
MongoDB connection and helpers using Motor (async driver).

Database : vedaai
Collections:
  - assignments : completed assessment papers
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Single client re-used across requests (Motor handles pooling internally)
_client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
_db = _client["vedaai"]


async def save_assignment(paper: dict) -> str:
    """Insert a completed assessment paper and return its MongoDB _id."""
    result = await _db["assignments"].insert_one(paper)
    return str(result.inserted_id)


async def get_all_assignments() -> list[dict]:
    """Return all saved assignments (newest first), without _id field."""
    cursor = _db["assignments"].find({}, {"_id": 0}).sort("_id", -1)
    return await cursor.to_list(length=100)
