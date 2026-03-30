# backend/app/services/retrieval_service.py

from app.ai.vector_store import vector_store


def retrieve_relevant_entries(query, k=3):
    """
    Retrieves top-k relevant entries from vector DB.
    """

    results = vector_store.similarity_search(query, k=k)

    formatted_docs = []

    for doc in results:
        content = doc.page_content
        metadata = doc.metadata

        formatted_docs.append(f"""
{content}

Source:
- Entry ID: {metadata.get('entry_id')}
- Tags: {metadata.get('tags')}
""")

    return formatted_docs