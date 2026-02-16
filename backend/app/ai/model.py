import os
from langchain_google_genai import ChatGoogleGenerativeAI

# Load Gemini model
def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.7,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
