from typing import TypedDict, List
from langchain_core.messages import BaseMessage


# class ChatState(TypedDict):
#     messages: List[BaseMessage]

# backend/app/ai/state.py

from typing import TypedDict, List
from langchain_core.messages import BaseMessage


class ChatState(TypedDict):
    """
    Shared state across LangGraph nodes.
    """

    # Full conversation messages (from memory_service)
    messages: List[BaseMessage]

    # Latest user query
    user_query: str

    # Intent classification outputs
    intent: str
    needs_clarification: bool
    clarification_question: str

    # Rewritten query (for better reasoning / future RAG)
    rewritten_query: str

    # Final response
    final_answer: str