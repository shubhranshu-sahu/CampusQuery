# backend/app/ai/schemas.py

from pydantic import BaseModel
from typing import Literal


class IntentOutput(BaseModel):
    intent: Literal["academic_query", "non_academic", "greeting", "unclear"]
    needs_clarification: bool
    clarification_question: str


class AgentDecision(BaseModel):
    intent: str
    needs_clarification: bool
    clarification_question: str
    use_rag: bool
    rewritten_query: str