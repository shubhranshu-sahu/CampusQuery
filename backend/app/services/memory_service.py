# backend/app/services/memory_service.py

from datetime import datetime
from bson.objectid import ObjectId
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.extensions import mongo_db
from app.config import Config
from app.ai.prompts import get_system_prompt

BLOCK_SIZE = 20

# LLM used only for memory summarization
summary_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=Config.GOOGLE_API_KEY,
    temperature=0.3
)


def should_update_summary(thread):
    """
    Determines whether summary must be updated.

    Summary is updated every BLOCK_SIZE messages.
    """
    message_count = thread.get("message_count", 0)

    if message_count > 0 and message_count % BLOCK_SIZE == 0:
        return True

    return False


def generate_summary(previous_summary, messages):
    """
    Generates a new compressed summary using:
    - Previous summary
    - The latest BLOCK_SIZE messages
    """

    content_to_summarize = ""

    if previous_summary:
        content_to_summarize += f"Previous Summary:\n{previous_summary}\n\n"

    content_to_summarize += "New Messages:\n"

    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        content_to_summarize += f"{role.upper()}: {content}\n"

    prompt = f"""
You are a conversation memory compression system.

Create a concise but information-rich summary of the following conversation.
Preserve:
- User goals
- Key facts
- Important decisions
- Context required for future reasoning

Do not include irrelevant detail.
Do not exceed 300 words.

{content_to_summarize}
"""

    response = summary_llm.invoke(prompt)
    return response.content


def update_summary_if_needed(thread_id):
    """
    Checks if summary must be updated.
    If yes:
    - Fetch last BLOCK_SIZE messages
    - Combine with previous summary
    - Generate new summary
    - Save into thread document
    """

    if not isinstance(thread_id, ObjectId):
        thread_id = ObjectId(thread_id)

    thread = mongo_db.chat_threads.find_one({"_id": thread_id})

    if not thread:
        return

    if not should_update_summary(thread):
        return

    previous_summary = thread.get("summary", "")

    # Fetch last BLOCK_SIZE messages
    messages = list(
        mongo_db.chat_messages.find(
            {"thread_id": thread_id}
        )
        .sort("created_at", -1)
        .limit(BLOCK_SIZE)
    )

    messages.reverse()

    new_summary = generate_summary(previous_summary, messages)

    mongo_db.chat_threads.update_one(
        {"_id": thread_id},
        {
            "$set": {
                "summary": new_summary,
                "summary_updated_at": datetime.utcnow()
            }
        }
    )


def build_context(thread_id, new_user_message):
    """
    Builds conversation context for LLM invocation.

    Context structure:
    - System prompt
    - Conversation summary (if exists)
    - Last BLOCK_SIZE raw messages
    - Current user message
    """

    if not isinstance(thread_id, ObjectId):
        thread_id = ObjectId(thread_id)

    thread = mongo_db.chat_threads.find_one({"_id": thread_id})
    summary = thread.get("summary", "")

    # Fetch last BLOCK_SIZE messages
    messages_cursor = mongo_db.chat_messages.find(
        {"thread_id": thread_id}
    ).sort("created_at", -1).limit(BLOCK_SIZE)

    history = list(messages_cursor)
    history.reverse()

    #langchain format messages

    lc_messages = []

    # Add system prompt
    lc_messages.append(
        SystemMessage(content=get_system_prompt())
    )

    # Inject summary if available
    if summary:
        lc_messages.append(
            SystemMessage(
                content=f"Conversation Summary:\n{summary}"
            )
        )

    # Add recent raw history
    for msg in history:
        if msg["role"] == "user":
            lc_messages.append(HumanMessage(content=msg["content"]))
        else:
            lc_messages.append(AIMessage(content=msg["content"]))

    # Add new user message
    lc_messages.append(
        HumanMessage(content=new_user_message)
    )

    return lc_messages