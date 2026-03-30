# backend/app/services/embedding_service.py

from app.ai.vector_store import vector_store
from langchain_text_splitters import RecursiveCharacterTextSplitter


text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,      # characters per chunk
    chunk_overlap=50     # overlap for context continuity
)




def format_entry_for_embedding(entry):
    """
    Converts entry into structured text for embedding.
    """

    return f"""
Title: {entry['title']}
Description: {entry['description']}
Tags: {", ".join(entry.get("tags", []))}
"""


# def add_entry_to_vector_db(entry):
#     """
#     Adds entry to vector database.
#     """

#     content = format_entry_for_embedding(entry)

#     tags = entry.get("tags", [])

#     metadata = {
#         "entry_id": str(entry["_id"]),
#         "author_id": str(entry["author_id"]),  # convert to string (safer)
#         "tags": ",".join([str(tag) for tag in tags])
#     }

#     vector_store.add_texts(
#         texts=[content],
#         metadatas=[metadata],
#         ids=[str(entry["_id"])]
#     )


def add_entry_to_vector_db(entry):
    """
    Adds entry to vector DB with chunking.
    """

    content = format_entry_for_embedding(entry)

    # Split into chunks
    chunks = text_splitter.split_text(content)

    texts = []
    metadatas = []
    ids = []

    for i, chunk in enumerate(chunks):
        texts.append(chunk)

        metadatas.append({
            "entry_id": str(entry["_id"]),
            "chunk_index": i,
            "author_id": str(entry["author_id"]),
            "tags": ",".join([str(t) for t in entry.get("tags", [])])
        })

        ids.append(f"{entry['_id']}_{i}")  # UNIQUE per chunk

    vector_store.add_texts(
        texts=texts,
        metadatas=metadatas,
        ids=ids
    )

def update_entry_in_vector_db(entry):
    entry_id = str(entry["_id"])

    # delete all chunks of this entry
    delete_entry_from_vector_db(entry_id)

    # re-add
    add_entry_to_vector_db(entry)


def delete_entry_from_vector_db(entry_id):
    """
    Deletes all chunks of an entry
    """

    # fetch all matching ids
    results = vector_store.get(where={"entry_id": str(entry_id)})

    if results and "ids" in results:
        vector_store.delete(ids=results["ids"])


# def update_entry_in_vector_db(entry):
#     """
#     Updates entry embedding (delete + re-add).
#     """

#     entry_id = str(entry["_id"])

#     vector_store.delete(ids=[entry_id])
#     add_entry_to_vector_db(entry)


# def delete_entry_from_vector_db(entry_id):
#     """
#     Deletes entry from vector DB.
#     """

#     vector_store.delete(ids=[str(entry_id)])