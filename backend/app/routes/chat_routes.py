from flask import Blueprint, jsonify, g , request
from datetime import datetime
from bson.objectid import ObjectId

from app.extensions import mongo_db
from app.utils.decorators import token_required

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/thread", methods=["POST"])
@token_required
def create_thread():
    user = g.current_user

    now = datetime.utcnow()
    formatted_time = now.strftime("%d %b %Y %H:%M")

    thread_data = {
        "user_id": user.id,
        "title": f"New Chat - {formatted_time}",
        "summary": "",
        "summary_updated_at": None,
        "message_count": 0,
        "created_at": now,
        "updated_at": now,
        "is_deleted": False
    }

    result = mongo_db.chat_threads.insert_one(thread_data)

    thread_data["_id"] = str(result.inserted_id)

    return jsonify({
        "message": "Thread created successfully",
        "thread": {
            "id": thread_data["_id"],
            "title": thread_data["title"],
            "created_at": thread_data["created_at"]
        }
    }), 201



@chat_bp.route("/threads", methods=["GET"])
@token_required
def get_threads():
    user = g.current_user

    threads_cursor = mongo_db.chat_threads.find(
        {
            "user_id": user.id,
            "is_deleted": False
        }
    ).sort("updated_at", -1)

    threads = []

    for thread in threads_cursor:
        threads.append({
            "id": str(thread["_id"]),
            "title": thread["title"],
            "updated_at": thread["updated_at"],
            "message_count": thread.get("message_count", 0)
        })

    return jsonify({"threads": threads}), 200


from bson.objectid import ObjectId

@chat_bp.route("/messages/<thread_id>", methods=["GET"])
@token_required
def get_thread_messages(thread_id):
    user = g.current_user

    # Validate ObjectId format
    try:
        thread_object_id = ObjectId(thread_id)
    except:
        return jsonify({"error": "Invalid thread ID"}), 400

    # Fetch thread
    thread = mongo_db.chat_threads.find_one({
        "_id": thread_object_id,
        "is_deleted": False
    })

    if not thread:
        return jsonify({"error": "Thread not found"}), 404

    # Security check
    if thread["user_id"] != user.id:
        return jsonify({"error": "Unauthorized access"}), 403

    # Fetch messages
    messages_cursor = mongo_db.chat_messages.find(
        {"thread_id": thread_object_id}
    ).sort("created_at", 1)

    messages = []

    for msg in messages_cursor:
        messages.append({
            "role": msg["role"],
            "content": msg["content"],
            "created_at": msg["created_at"]
        })

    return jsonify({
        "thread": {
            "id": thread_id,
            "title": thread["title"]
        },
        "messages": messages
    }), 200




### Sending Messages ----------------------------------------------------------------------

@chat_bp.route("/message", methods=["POST"])
@token_required
def send_message():
    user = g.current_user
    data = request.get_json()

    thread_id = data.get("thread_id")
    user_message = data.get("message")

    if not thread_id or not user_message:
        return jsonify({"error": "Thread ID and message required"}), 400

    # Validate ObjectId
    try:
        thread_object_id = ObjectId(thread_id)
    except:
        return jsonify({"error": "Invalid thread ID"}), 400

    # Fetch thread
    thread = mongo_db.chat_threads.find_one({
        "_id": thread_object_id,
        "is_deleted": False
    })

    if not thread:
        return jsonify({"error": "Thread not found"}), 404

    # Security check
    if thread["user_id"] != user.id:
        return jsonify({"error": "Unauthorized access"}), 403

    now = datetime.utcnow()

    # 1️⃣ Save user message
    mongo_db.chat_messages.insert_one({
        "thread_id": thread_object_id,
        "role": "user",
        "content": user_message,
        "token_count": None,
        "metadata": {},
        "created_at": now
    })

    # 2️⃣ Generate dummy assistant response
    assistant_response = "This is a placeholder AI response."

    assistant_now = datetime.utcnow()

    # 3️⃣ Save assistant message
    mongo_db.chat_messages.insert_one({
        "thread_id": thread_object_id,
        "role": "assistant",
        "content": assistant_response,
        "token_count": None,
        "metadata": {},
        "created_at": assistant_now
    })

    # 4️⃣ Update thread metadata
    mongo_db.chat_threads.update_one(
        {"_id": thread_object_id},
        {
            "$set": {"updated_at": assistant_now},
            "$inc": {"message_count": 2}
        }
    )

    return jsonify({
        "assistant": {
            "role": "assistant",
            "content": assistant_response,
            "created_at": assistant_now
        }
    }), 200


### Rename Thread ----------------------------------------------------------------------

@chat_bp.route("/thread/<thread_id>", methods=["PATCH"])
@token_required
def rename_thread(thread_id):
    user = g.current_user
    data = request.get_json()

    new_title = data.get("title")

    if not new_title or not new_title.strip():
        return jsonify({"error": "Title cannot be empty"}), 400

    try:
        thread_object_id = ObjectId(thread_id)
    except:
        return jsonify({"error": "Invalid thread ID"}), 400

    thread = mongo_db.chat_threads.find_one({
        "_id": thread_object_id,
        "is_deleted": False
    })

    if not thread:
        return jsonify({"error": "Thread not found"}), 404

    if thread["user_id"] != user.id:
        return jsonify({"error": "Unauthorized access"}), 403

    now = datetime.utcnow()

    mongo_db.chat_threads.update_one(
        {"_id": thread_object_id},
        {
            "$set": {
                "title": new_title.strip(),
                "updated_at": now
            }
        }
    )

    return jsonify({"message": "Thread renamed successfully"}), 200



### Delete Thread ---------------------------------------------------------------------- for now soft delete only

@chat_bp.route("/thread/<thread_id>", methods=["DELETE"])
@token_required
def delete_thread(thread_id):
    user = g.current_user

    try:
        thread_object_id = ObjectId(thread_id)
    except:
        return jsonify({"error": "Invalid thread ID"}), 400

    thread = mongo_db.chat_threads.find_one({
        "_id": thread_object_id,
        "is_deleted": False
    })

    if not thread:
        return jsonify({"error": "Thread not found"}), 404

    if thread["user_id"] != user.id:
        return jsonify({"error": "Unauthorized access"}), 403

    mongo_db.chat_threads.update_one(
        {"_id": thread_object_id},
        {
            "$set": {
                "is_deleted": True,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return jsonify({"message": "Thread deleted successfully"}), 200
