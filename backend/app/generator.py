"""
AI Question Generator.

Flow:
  1. build_prompt()       — converts form input into a clear LLM instruction
  2. generate_assessment() — calls OpenAI, parses JSON response into AssessmentPaper

To swap LLM provider: only change _call_llm() below.
"""

import os
import json
import uuid
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_client = OpenAI(
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    api_key=os.getenv("OPENAI_API_KEY"))
_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


# ── Step 1: Build Prompt ──────────────────────────────────────────────────────

def build_prompt(payload: dict) -> str:
    """Convert form data into a structured LLM prompt."""

    question_spec = "\n".join(
        f"  - {q['count']} × {q['type']} ({q['marks']} mark each)"
        for q in payload["questionTypes"]
    )

    topics = ", ".join(payload["syllabusTopics"]) or "General syllabus"
    levels = ", ".join(payload["cognitiveLevels"]) or "Mixed"

    return f"""
You are an expert academic exam paper generator.

Generate a structured assessment paper with the following requirements:

Title         : {payload["title"]}
Difficulty    : {payload["difficulty"]}
Cognitive Levels : {levels}
Syllabus Topics  : {topics}
Instructions  : {payload["instructions"]}

Question Breakdown:
{question_spec}

Rules:
1. Group questions into Sections (A, B, C...) — one section per question type.
2. Each question must have a "difficulty" field: "easy", "medium", or "hard".
3. For Multiple Choice Questions, include 4 options (A–D) and a "correctOption" (0-indexed integer).
4. Every question must have a "rubric" field with a marking guide.
5. Do NOT include any extra commentary — return ONLY valid JSON.

Return a JSON object exactly matching this structure:
{{
  "schoolName": "Delhi Public School",
  "title": "{payload["title"]}",
  "subject": "Science",
  "timeAllowed": "3 Hours",
  "totalMarks": <sum of all marks>,
  "dueDate": "{payload["dueDate"]}",
  "instructions": "{payload["instructions"]}",
  "sections": [
    {{
      "label": "A",
      "title": "Section A: Multiple Choice Questions",
      "questions": [
        {{
          "id": "q-1",
          "number": 1,
          "type": "Multiple Choice Questions",
          "text": "<question text>",
          "marks": 1,
          "difficulty": "easy",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "correctOption": 0,
          "rubric": "<marking guide>"
        }}
      ]
    }}
  ]
}}
"""


# ── Step 2: Call LLM ──────────────────────────────────────────────────────────

def _call_llm(prompt: str) -> str:
    """
    Call OpenAI and return raw JSON string.
    To swap provider (Gemini, Ollama, etc.) — replace this function only.
    """
    response = _client.chat.completions.create(
        model=_model,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},  # enforces JSON output
        temperature=0.7,
    )
    return response.choices[0].message.content


# ── Step 3: Parse + Validate ──────────────────────────────────────────────────

def _parse_response(raw_json: str) -> dict:
    """
    Parse LLM JSON into our expected structure.
    Assigns UUIDs to questions and re-numbers them sequentially.
    LLM output is NEVER passed raw to the frontend.
    """
    data = json.loads(raw_json)

    q_number = 1
    for section in data.get("sections", []):
        for q in section.get("questions", []):
            q["id"] = f"q-{uuid.uuid4().hex[:8]}"
            q["number"] = q_number
            q.setdefault("options", None)
            q.setdefault("correctOption", None)
            q.setdefault("difficulty", "medium")
            q.setdefault("rubric", "Award marks for correct and complete answer.")
            q_number += 1

    # Recalculate totalMarks from actual questions
    total = sum(
        q["marks"]
        for section in data.get("sections", [])
        for q in section.get("questions", [])
    )
    data["totalMarks"] = total

    return data


# ── Public API ────────────────────────────────────────────────────────────────

def generate_assessment(payload: dict) -> dict:
    """
    Main entry point called by the RQ worker.
    Returns a fully structured AssessmentPaper dict.
    """
    prompt = build_prompt(payload)
    raw = _call_llm(prompt)
    paper = _parse_response(raw)
    return paper
