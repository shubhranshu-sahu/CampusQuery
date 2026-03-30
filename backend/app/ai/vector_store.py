# backend/app/ai/vector_store.py

from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.config import Config


# Initialize embedding model
embedding_model = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    google_api_key=Config.GOOGLE_API_KEY
)


# Initialize Chroma DB (persistent)
vector_store = Chroma(
    collection_name="entries_collection",
    embedding_function=embedding_model,
    persist_directory="./chroma_db"  # local storage
)