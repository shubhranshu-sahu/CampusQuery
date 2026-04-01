# CampusQuery

CampusQuery is a production-grade, AI-powered campus knowledge platform designed for colleges and universities. It provides a ChatGPT-like conversational interface that is strictly campus-scoped, powered by advanced Retrieval-Augmented Generation (RAG).

The platform enables **students** to ask questions, get academic help, and interact with verified campus information, while **admins** curate, manage, and govern the knowledge base. CampusQuery is fully API-driven, scalable, and built with real-world deployment in mind.

---

## 🚀 Why CampusQuery?

In most colleges, information is scattered across PDFs, notices, portals, WhatsApp groups, and word-of-mouth. Students struggle to find accurate, up-to-date answers, while administrators repeatedly answer the same questions.

CampusQuery solves this by acting as a **centralized AI knowledge system**:

* One source of truth
* Admin-controlled content
* AI-assisted access for students
* No hallucinations, no internet guessing

This is not just a chatbot — it is **campus knowledge infrastructure**.

---

## 🎯 Key Features

### 👥 Role-Based Access

* **Students**: Ask questions, get academic assistance, and use a campus-restricted AI chat
* **Admins**: Create, update, and manage campus entries that power the AI system

### 🤖 ChatGPT-like AI Chat

* Multiple chat threads
* Per-thread memory
* Context-aware follow-up questions
* Query rewriting for pronouns and references
* Academic assistance (applications, emails, formatting, explanations)
* Strict refusal of unrelated or out-of-scope questions

### 🧠 Production-Grade RAG

* Chunk-level vector retrieval
* Entry-level reasoning
* Context window control
* Source-grounded answers
* Hallucination prevention by design

### 📚 Admin Knowledge Management

* Create, edit, and delete text-based entries
* All admins can view all entries
* Only the creator can modify their own entries
* Entries tagged with creator metadata to avoid duplication

### 🖥️ Modern Frontend UX

* Persistent sidebar navigation
* Fully responsive (desktop + mobile)
* No page reloads
* Pure API-based communication

---

## 🏗️ Tech Stack

### Backend

* Python (Flask)
* LangChain + LangGraph
* Google Gemini (LLM)
* SQLAlchemy (MySQL)
* MongoDB (Chat history)
* ChromaDB (local vector DB)
* Qdrant (cloud vector DB)

### Frontend

* HTML, CSS, JavaScript
* Bootstrap 5

---

## 🧠 Architecture Overview

```text
Frontend (Vercel)
        ↓
Flask Backend (Render)
        ↓
-----------------------------
MySQL → Users
MongoDB → Chat + Entries
Vector DB → RAG (Chroma/Qdrant)
```

---

## 📂 Project Structure

### Backend

```text
backend/
│   run.py
│   requirements.txt
│   .env
│
└───app/
    │   config.py
    │   extensions.py
    │   __init__.py
    │
    ├───ai/
    │   │   graph.py
    │   │   model.py
    │   │   nodes.py
    │   │   prompts.py
    │   │   schemas.py
    │   │   state.py
    │   │   vector_store.py
    │
    ├───models/
    │   │   base.py
    │   │   entry.py
    │   │   user.py
    │
    ├───routes/
    │   │   auth_routes.py
    │   │   chat_routes.py
    │   │   entry_routes.py
    │   │   user_routes.py
    │
    ├───services/
    │   │   auth_service.py
    │   │   chat_service.py
    │   │   embedding_service.py
    │   │   entry_service.py
    │   │   memory_service.py
    │   │   retrieval_service.py
    │
    └───utils/
        │   decorators.py
        │   jwt_utils.py
```

---

### Frontend

```text
frontend/
│   index.html
│
├───css/
│       animations.css
│       chat.css
│       theme.css
│
├───js/
│   │   config.js
│   │   index.js
│   │
│   └───pages/
│           chat.js
│           dashboard.js
│           entries.js
│           login.js
│           register.js
│
├───pages/
│       chat.html
│       dashboard.html
│       entries.html
│       login.html
│       profile.html
│       register.html
│
└───public/
    └───assets/
```

---

## ⚙️ Environment Variables

Create a `.env` file in `/backend`

```env
# Flask
SECRET_KEY=your_secret_key
ENV=development

# MySQL
MYSQL_URL=your_mysql_connection_string

# MongoDB
MONGO_URL=your_mongodb_connection_string
MONGO_DB_NAME=campusquery

# Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# Vector DB
VECTOR_DB=chroma   # or qdrant

# Qdrant
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION=entries_collection
```

---

## 🗄️ Databases Used

### 1. MySQL

* Stores users
* Managed via SQLAlchemy

### 2. MongoDB

* Chat threads
* Chat messages
* Entries (knowledge base)

### 3. Vector Database

#### Local (Development)

* ChromaDB

#### Production

* Qdrant

---

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone <repo_url>
cd CampusQuery
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

---

### 3. Configure Environment

Create `.env` file using `.env.example`

---

### 4. Run Backend

```bash
python run.py
```

Server will start at:

```text
http://127.0.0.1:5000
```

---

### 5. Frontend Setup

Just open:

```text
frontend/index.html
```

Or use Live Server (recommended)

---

## 🧠 AI System Flow

```text
User Query
   ↓
Agent Node (intent + rewrite)
   ↓
Retriever (Vector DB)
   ↓
Answer Node (LLM + Context)
```

---

## 📦 RAG Implementation

* Chunking using RecursiveCharacterTextSplitter
* Embeddings via Gemini
* Vector storage (Chroma/Qdrant)
* Metadata filtering supported

---

## 🌐 Deployment

### Frontend

* Vercel

### Backend

* Render

### Databases

* MongoDB Atlas
* Aiven MySQL
* Qdrant Cloud

---

## ⚠️ Common Issues

### CORS Error

Ensure Flask CORS is enabled:

```python
CORS(app)
```

---

### Vector DB Issues

* Use UUID for Qdrant IDs
* Recreate embeddings when switching DB

---

### API Not Working

* Check API_BASE in frontend
* Ensure backend is running



---

## 👨‍💻 Author

Shubhranshu Sahu

---

## 📜 License

MIT License
