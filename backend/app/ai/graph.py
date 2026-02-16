from langgraph.graph import StateGraph, END
from .state import ChatState
from .nodes import llm_node


def build_graph():
    graph = StateGraph(ChatState)

    graph.add_node("llm", llm_node)

    graph.set_entry_point("llm")
    graph.add_edge("llm", END)

    return graph.compile()


# Compile once
chat_graph = build_graph()
