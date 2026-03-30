# backend/app/ai/state.py

from typing import TypedDict, List
from langchain_core.messages import BaseMessage


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

    use_rag: bool

    # Rewritten query (for better reasoning / future RAG)
    rewritten_query: str
    
    # Retrieved context from vector DB
    retrieved_context: str

    # Final response
    final_answer: str





