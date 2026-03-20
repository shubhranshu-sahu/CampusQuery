from langchain_core.messages import AIMessage
from app.ai.model import get_llm
import json


def llm_node(state):
    llm = get_llm()

    response = llm.invoke(state["messages"])

    return {
        "messages": state["messages"] + [AIMessage(content=response.content)]
    }



# backend/app/ai/nodes.py




from app.ai.schemas import IntentOutput


def intent_classifier_node(state):
    """
    Structured intent classification using Pydantic
    """

    llm = get_llm()

    structured_llm = llm.with_structured_output(IntentOutput)

    user_query = state["messages"][-1].content

    response = structured_llm.invoke(f"""
Classify the user query.

Rules:
- If vague → needs_clarification = true
- If unrelated → non_academic
- If greeting → greeting
- Else → academic_query

User Query:
{user_query}
""")

    return {
        "user_query": user_query,
        "intent": response.intent,
        "needs_clarification": response.needs_clarification,
        "clarification_question": response.clarification_question
    }

def clarification_node(state):
    """
    Returns clarification question and ends flow.
    """

    return {
        "final_answer": state["clarification_question"]
    }


def query_rewrite_node(state):
    """
    Rewrites query into a clear structured academic query.
    """

    llm = get_llm()

    user_query = state["user_query"]

    prompt = f"""
Rewrite the following query into a clear, formal academic query.

Do not answer it.
Only rewrite.

User Query:
{user_query}
"""

    response = llm.invoke(prompt)

    return {
        "rewritten_query": response.content
    }


def answer_node(state):
    """
    Final response generation node.
    Uses full conversation context.
    """

    llm = get_llm()

    messages = state["messages"]

    response = llm.invoke(messages)

    return {
        "messages": messages + [AIMessage(content=response.content)],
        "final_answer": response.content
    }