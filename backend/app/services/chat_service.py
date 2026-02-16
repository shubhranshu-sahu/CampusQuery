from bson.objectid import ObjectId
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.extensions import mongo_db
from app.ai.graph import chat_graph


def generate_ai_response(thread_id, user_message):
    thread_object_id = ObjectId(thread_id)

    # Fetch last 10 messages
    messages_cursor = mongo_db.chat_messages.find(
        {"thread_id": thread_object_id}
    ).sort("created_at", -1).limit(10)

    # Reverse to chronological order
    history = list(messages_cursor)[::-1]

    lc_messages = [
    SystemMessage(content="""
You are CampusQuery AI, an academic assistant for a college campus.

Your role:
- Help students and admins with academic queries.
- Assist in writing formal applications, letters, and notices.
- Clarify academic procedures, schedules, or campus information.
- Provide structured, clear, professional answers.

Rules:
- If the question is unrelated to academics or campus life (e.g., general social media, entertainment, politics, random trivia), politely refuse.
- Keep answers concise but well structured.
- Use proper formatting with headings and bullet points where needed.
- Do not hallucinate unknown campus-specific facts.
- If unsure, respond with: "I don’t have official information about that. Please contact the administration."

Maintain a polite and professional tone.
""")
]


    for msg in history:
        if msg["role"] == "user":
            lc_messages.append(HumanMessage(content=msg["content"]))
        else:
            lc_messages.append(AIMessage(content=msg["content"]))

    # Add new user message
    lc_messages.append(HumanMessage(content=user_message))

    # Invoke graph
    result = chat_graph.invoke({"messages": lc_messages})

    ai_message = result["messages"][-1]

    return ai_message.content
