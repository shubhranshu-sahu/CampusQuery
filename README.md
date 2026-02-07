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

## 🏗️ System Architecture (High-Level)

```
Frontend (HTML / CSS / JS / Bootstrap)
        ↓ (REST APIs)
Flask Backend (API-only, no templating)
        ↓
RAG Pipeline (LangChain + LangGraph)
        ↓
Vector Store (ChromaDB)
        ↓
LLM Inference (Campus-scoped)
```

Supporting Databases:

* **MySQL** → Users, roles, entries metadata
* **MongoDB** → Chat threads, messages, summaries

---

## 🔐 Authentication & Security

* Custom authentication (no Firebase / paid services)
* Role-based authorization (Student / Admin)
* Token-based API protection
* No secrets exposed to frontend
* Clear separation of concerns

---

## 🧩 AI Chat Design (Important)

Each chat thread is treated as a **stateful AI session**:

* Short-term memory (recent messages)
* Summarized memory for long conversations
* Context rewritten before retrieval
* RAG used as the single source of truth

The AI:

* ✅ Answers campus-related and academic questions
* ✅ Helps with writing applications and emails
* ❌ Refuses general internet knowledge
* ❌ Never guesses or hallucinates

This mirrors how real-world enterprise AI assistants are built.

---

## 🛠️ Tech Stack

### Frontend

* HTML, CSS, JavaScript
* Bootstrap
* Fetch API (SPA-style, no reloads)

### Backend

* Python
* Flask (API-only)
* LangChain
* LangGraph
* LangSmith
* MCP

### Data & AI

* MySQL (relational data)
* MongoDB (chat state & memory)
* ChromaDB (vector store)
* Production-grade RAG pipeline

---

## 📌 Current Status

* Core system architecture finalized
* Feature scope locked
* RAG-first AI design planned
* Ready for step-by-step implementation

---

## 🧭 Future Enhancements

* Entry approval workflows
* Admin collaboration & shared ownership
* Analytics dashboard
* Advanced tagging & filters
* Fine-grained AI permissions

---

## 👨‍💻 Author

Built by **Shubhranshu Sahu**

CampusQuery is designed as a serious, industry-aligned major project with real deployment potential for academic institutions.
