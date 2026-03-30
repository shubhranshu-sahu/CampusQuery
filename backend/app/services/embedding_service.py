# backend/app/services/embedding_service.py

from app.ai.vector_store import vector_store


def format_entry_for_embedding(entry):
    """
    Converts entry into structured text for embedding.
    """

    return f"""
Title: {entry['title']}
Description: {entry['description']}
Tags: {", ".join(entry.get("tags", []))}
"""


def add_entry_to_vector_db(entry):
    """
    Adds entry to vector database.
    """

    content = format_entry_for_embedding(entry)

    tags = entry.get("tags", [])

    metadata = {
        "entry_id": str(entry["_id"]),
        "author_id": str(entry["author_id"]),  # convert to string (safer)
        "tags": ",".join([str(tag) for tag in tags])
    }

    vector_store.add_texts(
        texts=[content],
        metadatas=[metadata],
        ids=[str(entry["_id"])]
    )


def update_entry_in_vector_db(entry):
    """
    Updates entry embedding (delete + re-add).
    """

    entry_id = str(entry["_id"])

    vector_store.delete(ids=[entry_id])
    add_entry_to_vector_db(entry)


def delete_entry_from_vector_db(entry_id):
    """
    Deletes entry from vector DB.
    """

    vector_store.delete(ids=[str(entry_id)])