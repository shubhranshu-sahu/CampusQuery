# backend/app/services/chat_service.py

from bson.objectid import ObjectId
from datetime import datetime

from app.extensions import mongo_db
from app.ai.graph import chat_graph
from app.services.memory_service import (
    update_summary_if_needed,
    build_context
)


def generate_ai_response(thread_id, user_message):
    """
    Main orchestration function for chat flow.

    Steps:
    1. Save user message
    2. Update summary if needed
    3. Build context (summary + raw history)
    4. Invoke LangGraph
    5. Save AI response
    6. Update summary again if needed
    """

    thread_object_id = ObjectId(thread_id)

    # Save user message
    mongo_db.chat_messages.insert_one({
        "thread_id": thread_object_id,
        "role": "user",
        "content": user_message,
        "created_at": datetime.utcnow()
    })

    # Increment message_count
    mongo_db.chat_threads.update_one(
        {"_id": thread_object_id},
        {"$inc": {"message_count": 1}}
    )

    # Check if summary must be updated
    update_summary_if_needed(thread_object_id)

    # Build context
    lc_messages = build_context(thread_object_id, user_message)

    # Invoke graph
    result = chat_graph.invoke({"messages": lc_messages})

    ai_message = result["messages"][-1].content

    # Save AI response
    mongo_db.chat_messages.insert_one({
        "thread_id": thread_object_id,
        "role": "assistant",
        "content": ai_message,
        "created_at": datetime.utcnow()
    })

    # Increment message_count again
    mongo_db.chat_threads.update_one(
        {"_id": thread_object_id},
        {"$inc": {"message_count": 1}}
    )

    # Check summary again
    update_summary_if_needed(thread_object_id)

    return ai_message