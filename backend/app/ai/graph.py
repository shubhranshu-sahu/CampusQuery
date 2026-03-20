# from langgraph.graph import StateGraph, END
# from .state import ChatState
# from .nodes import llm_node


# def build_graph():
#     graph = StateGraph(ChatState)

#     graph.add_node("llm", llm_node)

#     graph.set_entry_point("llm")
#     graph.add_edge("llm", END)

#     return graph.compile()


# # Compile once
# chat_graph = build_graph()




# backend/app/ai/graph.py

from langgraph.graph import StateGraph, END

from app.ai.state import ChatState
from app.ai.nodes import (
    intent_classifier_node,
    clarification_node,
    query_rewrite_node,
    answer_node
)


def route_after_intent(state):
    """
    Decides next node after intent classification.
    """

    if state["needs_clarification"]:
        return "clarification"

    return "rewrite"


# Build graph
builder = StateGraph(ChatState)

# Nodes
builder.add_node("intent_classifier", intent_classifier_node)
builder.add_node("clarification", clarification_node)
builder.add_node("rewrite", query_rewrite_node)
builder.add_node("answer", answer_node)

# Entry
builder.set_entry_point("intent_classifier")

# Conditional routing
builder.add_conditional_edges(
    "intent_classifier",
    route_after_intent,
    {
        "clarification": "clarification",
        "rewrite": "rewrite"
    }
)

# Normal edges
builder.add_edge("rewrite", "answer")
builder.add_edge("clarification", END)
builder.add_edge("answer", END)

# Compile
chat_graph = builder.compile()