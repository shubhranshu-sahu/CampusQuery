from langchain_core.messages import AIMessage
from .model import get_llm


def llm_node(state):
    llm = get_llm()

    response = llm.invoke(state["messages"])

    return {
        "messages": state["messages"] + [AIMessage(content=response.content)]
    }
