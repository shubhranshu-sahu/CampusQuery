# backend/app/ai/nodes.py

from langchain_core.messages import AIMessage, SystemMessage

from app.ai.model import get_llm
import json

from app.services.retrieval_service import retrieve_relevant_entries

from app.ai.schemas import AgentDecision



def agent_node(state):
    """
    Single intelligent node:
    - understands query
    - resolves context
    - decides RAG usage
    """

    llm = get_llm()
    structured_llm = llm.with_structured_output(AgentDecision)

    # Include last few messages for context
    history = state["messages"][-6:]

    history_text = "\n".join([
        f"{msg.type.upper()}: {msg.content}" for msg in history
    ])

    prompt = f"""
You are an intelligent academic assistant.

Your job:
1. Understand user query using conversation context
2. Resolve references (him, it, etc.)
3. Decide if RAG is needed
4. Decide if clarification is needed

Rules:
- Use context to resolve vague queries
- Do NOT ask clarification if context is sufficient
- Use RAG if query needs factual database info
- Greeting → no RAG
- Non-academic → reject

Return structured JSON.

Conversation:
{history_text}

User Query:
{state["messages"][-1].content}
"""

    response = structured_llm.invoke(prompt)

    return {
        "intent": response.intent,
        "needs_clarification": response.needs_clarification,
        "clarification_question": response.clarification_question,
        "use_rag": response.use_rag,
        "rewritten_query": response.rewritten_query
    }


def answer_node(state):
    llm = get_llm()

    # Handle clarification early
    if state.get("needs_clarification"):
        return {
            "final_answer": state["clarification_question"]
        }

    if state.get("intent") == "non_academic":
        return {
            "final_answer": "I can only assist with academic or campus-related queries."
        }

    messages = state["messages"]

    rag_context = state.get("retrieved_context", "")

    system_prompt = """
You are CampusQuery AI.

Rules:
- Use provided knowledge base if available
- Do not ask unnecessary clarification
- Be concise and structured
"""

    if rag_context:
        system_prompt += f"""

Relevant Knowledge:
{rag_context}
"""

    messages = [SystemMessage(content=system_prompt)] + messages

    response = llm.invoke(messages)

    return {
        "messages": messages + [AIMessage(content=response.content)],
        "final_answer": response.content
    }


def retriever_node(state):
    """
    Only runs if use_rag = True
    """

    if not state.get("use_rag"):
        return {"retrieved_context": ""}

    query = state.get("rewritten_query") or state["messages"][-1].content

    docs = retrieve_relevant_entries(query)

    rag_context = "\n\n---\n\n".join(docs)

    return {
        "retrieved_context": rag_context
    }

