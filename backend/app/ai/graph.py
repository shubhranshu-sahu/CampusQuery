# backend/app/ai/graph.py

from langgraph.graph import StateGraph, END

from app.ai.state import ChatState
from app.ai.nodes import (
    agent_node,
    retriever_node,
    answer_node
)


# -------------------------------
# Build Graph
# -------------------------------

builder = StateGraph(ChatState)


# -------------------------------
# Add Nodes
# -------------------------------

builder.add_node("agent", agent_node)
builder.add_node("retriever", retriever_node)
builder.add_node("answer", answer_node)


# -------------------------------
# Entry Point
# -------------------------------

builder.set_entry_point("agent")


# -------------------------------
# Flow Definition
# -------------------------------

# Agent → Retriever (always runs, but internally decides whether to use RAG)
builder.add_edge("agent", "retriever")

# Retriever → Answer
builder.add_edge("retriever", "answer")

# End
builder.add_edge("answer", END)


# -------------------------------
# Compile Graph
# -------------------------------

chat_graph = builder.compile()

