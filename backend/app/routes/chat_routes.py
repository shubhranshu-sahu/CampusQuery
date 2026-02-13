from flask import Blueprint, jsonify, g
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
