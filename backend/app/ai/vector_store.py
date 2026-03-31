# backend/app/ai/vector_store.py
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.config import Config

VECTOR_DB = os.getenv("VECTOR_DB", "chroma")


# Initialize embedding model
embedding_model = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    google_api_key=Config.GOOGLE_API_KEY
)


# -------------------------------
# CHROMA (LOCAL)
# -------------------------------
if VECTOR_DB == "chroma":
    from langchain_community.vectorstores import Chroma

    vector_store = Chroma(
        collection_name="entries_collection",
        embedding_function=embedding_model,
        persist_directory="./chroma_db" # local storage
    )


# -------------------------------
# QDRANT (CLOUD)
# -------------------------------
elif VECTOR_DB == "qdrant":
    from langchain_qdrant import QdrantVectorStore
    from qdrant_client import QdrantClient

    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=os.getenv("QDRANT_COLLECTION", "entries_collection"),
        embedding=embedding_model
    )

else:
    raise ValueError("Invalid VECTOR_DB setting")