# backend/app/services/entry_service.py

from datetime import datetime
from bson.objectid import ObjectId
from app.extensions import mongo_db

from app.services.embedding_service import add_entry_to_vector_db
from app.services.embedding_service import update_entry_in_vector_db
from app.services.embedding_service import delete_entry_from_vector_db


# from backend.app.models import entry


def create_entry(user, data):
    """
    Creates a new entry.
    """

    title = data.get("title")
    description = data.get("description")
    tags = data.get("tags", [])

    if not title or not description:
        return {"error": "Title and description are required"}, 400

    now = datetime.utcnow()

    entry = {
        "title": title.strip(),
        "description": description.strip(),
        "tags": tags,
        "author_id": user.id,
        "author_name": user.email,
        "created_at": now,
        "updated_at": now,
        "is_deleted": False
    }

    result = mongo_db.entries.insert_one(entry)

    entry["_id"] = str(result.inserted_id)

    # Add to vector DB
    add_entry_to_vector_db(entry)

    return {
        "message": "Entry created successfully",
        "entry": entry
    }, 201


def get_all_entries():
    """
    Returns all non-deleted entries.
    """

    entries_cursor = mongo_db.entries.find(
        {"is_deleted": False}
    ).sort("created_at", -1)

    entries = []

    for entry in entries_cursor:
        entries.append({
            "id": str(entry["_id"]),
            "title": entry["title"],
            "description": entry["description"],
            "tags": entry.get("tags", []),
            "author_name": entry.get("author_name"),
            "created_at": entry["created_at"]
        })

    return {"entries": entries}, 200


def update_entry(user, entry_id, data):
    """
    Updates an entry (only owner allowed).
    """

    try:
        entry_object_id = ObjectId(entry_id)
    except:
        return {"error": "Invalid entry ID"}, 400

    entry = mongo_db.entries.find_one({
        "_id": entry_object_id,
        "is_deleted": False
    })

    if not entry:
        return {"error": "Entry not found"}, 404

    if entry["author_id"] != user.id:
        return {"error": "Unauthorized"}, 403

    update_data = {}

    if "title" in data:
        update_data["title"] = data["title"].strip()

    if "description" in data:
        update_data["description"] = data["description"].strip()

    if "tags" in data:
        update_data["tags"] = data["tags"]

    if not update_data:
        return {"error": "No valid fields to update"}, 400

    update_data["updated_at"] = datetime.utcnow()

    mongo_db.entries.update_one(
        {"_id": entry_object_id},
        {"$set": update_data}
    )

    # Update vector DB embedding
    updated_entry = mongo_db.entries.find_one({"_id": entry_object_id})
    update_entry_in_vector_db(updated_entry)

    return {"message": "Entry updated successfully"}, 200


def delete_entry(user, entry_id):
    """
    Soft deletes an entry (only owner allowed).
    """

    try:
        entry_object_id = ObjectId(entry_id)
    except:
        return {"error": "Invalid entry ID"}, 400

    entry = mongo_db.entries.find_one({
        "_id": entry_object_id,
        "is_deleted": False
    })

    if not entry:
        return {"error": "Entry not found"}, 404

    if entry["author_id"] != user.id:
        return {"error": "Unauthorized"}, 403

    mongo_db.entries.update_one(
        {"_id": entry_object_id},
        {
            "$set": {
                "is_deleted": True,
                "updated_at": datetime.utcnow()
            }
        }
    )

    delete_entry_from_vector_db(entry_id)


    return {"message": "Entry deleted successfully"}, 200