"""
Pydantic models for request validation and response structure.

- GenerationRequest  : what the frontend sends
- AssessmentPaper    : what we store in MongoDB and stream back
"""

from pydantic import BaseModel


# ── Input Models ──────────────────────────────────────────────────────────────

class QuestionTypeConfig(BaseModel):
    type: str    # e.g. "Multiple Choice Questions"
    count: int
    marks: int


class GenerationRequest(BaseModel):
    title: str
    dueDate: str
    instructions: str
    questionTypes: list[QuestionTypeConfig]
    difficulty: str                  # "Easy" | "Medium" | "Hard" | "Mixed"
    cognitiveLevels: list[str]       # e.g. ["Remembering", "Applying"]
    syllabusTopics: list[str]        # e.g. ["Chemical Equilibrium"]


# ── Output Models ─────────────────────────────────────────────────────────────

class Question(BaseModel):
    id: str
    number: int
    type: str
    text: str
    marks: int
    difficulty: str                  # "easy" | "medium" | "hard"
    options: list[str] | None = None # MCQ only
    correctOption: int | None = None # MCQ only  (0-indexed)
    rubric: str


class Section(BaseModel):
    label: str                       # "A", "B", "C" …
    title: str                       # "Section A: Multiple Choice Questions"
    questions: list[Question]


class AssessmentPaper(BaseModel):
    schoolName: str
    title: str
    subject: str
    timeAllowed: str
    totalMarks: int
    dueDate: str
    instructions: str
    sections: list[Section]
