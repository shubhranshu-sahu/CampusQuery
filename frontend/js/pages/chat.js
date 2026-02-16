
// const API_BASE = "http://127.0.0.1:5000/api";

const token = localStorage.getItem("campusquery_token");

if (!token) {
  window.location.replace("login.html");
}

let currentThreadId = null;

const threadList = document.getElementById("thread-list");
const chatMessages = document.getElementById("chat-messages");
const threadName = document.getElementById("current-thread-name");

const welcomeScreen = document.getElementById("welcome-screen");
const chatContainer = document.getElementById("chat-container");

document.getElementById("new-chat-btn").addEventListener("click", createNewThread);
document.getElementById("chat-form").addEventListener("submit", handleMessage);

document.getElementById("rename-thread").addEventListener("click", renameThread);
document.getElementById("delete-thread").addEventListener("click", deleteThread);


// rename thread ---------------------------------
async function renameThread() {
  if (!currentThreadId) return;

  const newTitle = prompt("Enter new thread name:");

  if (!newTitle || !newTitle.trim()) return;

  try {
    const res = await fetch(`${API_BASE}/chat/thread/${currentThreadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newTitle.trim()
      })
    });

    if (!res.ok) throw new Error("Rename failed");

    threadName.innerText = newTitle.trim();
    await loadThreads();

  } catch (err) {
    alert("Failed to rename thread");
  }
}


// delete thread ------------------------------------------------------
async function deleteThread() {
  if (!currentThreadId) return;

  const confirmDelete = confirm("Are you sure you want to delete this thread?");

  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_BASE}/chat/thread/${currentThreadId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Delete failed");

    currentThreadId = null;
    chatMessages.innerHTML = "";
    showWelcome();
    await loadThreads();

  } catch (err) {
    alert("Failed to delete thread");
  }
}
//-----------------------------------------------------------------------------------


function goBack() {
  window.location.href = "dashboard.html";
}

function showWelcome() {
  welcomeScreen.classList.remove("d-none");
  chatContainer.classList.add("d-none");

  document.getElementById("rename-thread").style.display = "none";
  document.getElementById("delete-thread").style.display = "none";
}

function showChat() {
  welcomeScreen.classList.add("d-none");
  chatContainer.classList.remove("d-none");

  document.getElementById("rename-thread").style.display = "inline-block";
  document.getElementById("delete-thread").style.display = "inline-block";

}

async function loadThreads() {
  try {
    const res = await fetch(`${API_BASE}/chat/threads`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    renderThreads(data.threads);
  } catch (err) {
    console.error("Failed to load threads");
  }
}

function renderThreads(threads) {
  threadList.innerHTML = "";

  threads.forEach(thread => {
    const div = document.createElement("div");
    div.className = "thread-item" + (thread.id === currentThreadId ? " active" : "");
    div.innerText = thread.title;
    div.onclick = () => loadThread(thread.id);
    threadList.appendChild(div);
  });
}

async function createNewThread() {
  try {
    const res = await fetch(`${API_BASE}/chat/thread`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    currentThreadId = data.thread.id;

    await loadThreads();
    await loadThread(currentThreadId);

  } catch (err) {
    console.error("Failed to create thread");
  }
}

async function loadThread(threadId) {
  currentThreadId = threadId;

  try {
    const res = await fetch(`${API_BASE}/chat/messages/${threadId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    showChat();
    threadName.innerText = data.thread.title;
    chatMessages.innerHTML = "";

    data.messages.forEach(msg => {
      addMessage(msg.role, msg.content);
    });

    await loadThreads();

  } catch (err) {
    console.error("Failed to load thread");
  }
}

async function handleMessage(e) {
  e.preventDefault();

  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message || !currentThreadId) return;

  addMessage("user", message);
  input.value = "";

  document.getElementById("typing-indicator").classList.remove("d-none");

  try {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        thread_id: currentThreadId,
        message: message
      })
    });

    const data = await res.json();

    document.getElementById("typing-indicator").classList.add("d-none");

    addMessage("assistant", data.assistant.content);

  } catch (err) {
    document.getElementById("typing-indicator").classList.add("d-none");
    console.error("Message send failed");
  }
}

function addMessage(role, content) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.innerText = content;

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initial state
showWelcome();
loadThreads();










// let threads = [];
// let currentThreadId = null;

// const threadList = document.getElementById("thread-list");
// const chatMessages = document.getElementById("chat-messages");
// const threadName = document.getElementById("current-thread-name");

// const welcomeScreen = document.getElementById("welcome-screen");
// const chatContainer = document.getElementById("chat-container");

// document.getElementById("new-chat-btn").addEventListener("click", createNewThread);
// document.getElementById("chat-form").addEventListener("submit", handleMessage);

// function goBack() {
//   window.location.href = "dashboard.html";
// }

// function showWelcome() {
//   welcomeScreen.classList.remove("d-none");
//   chatContainer.classList.add("d-none");
// }

// function showChat() {
//   welcomeScreen.classList.add("d-none");
//   chatContainer.classList.remove("d-none");
// }

// function createNewThread() {
//   const id = Date.now();

//   const thread = {
//     id,
//     name: "New Chat",
//     messages: []
//   };

//   threads.unshift(thread);
//   currentThreadId = id;

//   renderThreads();
//   loadThread(id);
// }

// function renderThreads() {
//   threadList.innerHTML = "";

//   threads.forEach(thread => {
//     const div = document.createElement("div");
//     div.className = "thread-item" + (thread.id === currentThreadId ? " active" : "");
//     div.innerText = thread.name;
//     div.onclick = () => loadThread(thread.id);
//     threadList.appendChild(div);
//   });
// }

// function loadThread(id) {
//   currentThreadId = id;
//   const thread = threads.find(t => t.id === id);

//   if (!thread) return;

//   showChat();
//   threadName.innerText = thread.name;
//   chatMessages.innerHTML = "";

//   thread.messages.forEach(msg => {
//     addMessage(msg.role, msg.content, false);
//   });

//   renderThreads();
// }

// function handleMessage(e) {
//   e.preventDefault();
//   const input = document.getElementById("chat-input");
//   const message = input.value.trim();
//   if (!message) return;

//   addMessage("user", message);
//   input.value = "";

//   simulateBotResponse();
// }

// function addMessage(role, content, save = true) {
//   const msgDiv = document.createElement("div");
//   msgDiv.className = `message ${role}`;
//   msgDiv.innerText = content;

//   chatMessages.appendChild(msgDiv);
//   chatMessages.scrollTop = chatMessages.scrollHeight;

//   if (save) {
//     const thread = threads.find(t => t.id === currentThreadId);
//     thread.messages.push({ role, content });
//   }
// }

// function simulateBotResponse() {
//   document.getElementById("typing-indicator").classList.remove("d-none");

//   setTimeout(() => {
//     document.getElementById("typing-indicator").classList.add("d-none");
//     addMessage("assistant", "This is a mock AI response.");
//   }, 1000);
// }

// // Initial state
// showWelcome();
