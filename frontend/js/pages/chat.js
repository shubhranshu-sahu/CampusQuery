let threads = [];
let currentThreadId = null;

const threadList = document.getElementById("thread-list");
const chatMessages = document.getElementById("chat-messages");
const threadName = document.getElementById("current-thread-name");

const welcomeScreen = document.getElementById("welcome-screen");
const chatContainer = document.getElementById("chat-container");

document.getElementById("new-chat-btn").addEventListener("click", createNewThread);
document.getElementById("chat-form").addEventListener("submit", handleMessage);

function goBack() {
  window.location.href = "dashboard.html";
}

function showWelcome() {
  welcomeScreen.classList.remove("d-none");
  chatContainer.classList.add("d-none");
}

function showChat() {
  welcomeScreen.classList.add("d-none");
  chatContainer.classList.remove("d-none");
}

function createNewThread() {
  const id = Date.now();

  const thread = {
    id,
    name: "New Chat",
    messages: []
  };

  threads.unshift(thread);
  currentThreadId = id;

  renderThreads();
  loadThread(id);
}

function renderThreads() {
  threadList.innerHTML = "";

  threads.forEach(thread => {
    const div = document.createElement("div");
    div.className = "thread-item" + (thread.id === currentThreadId ? " active" : "");
    div.innerText = thread.name;
    div.onclick = () => loadThread(thread.id);
    threadList.appendChild(div);
  });
}

function loadThread(id) {
  currentThreadId = id;
  const thread = threads.find(t => t.id === id);

  if (!thread) return;

  showChat();
  threadName.innerText = thread.name;
  chatMessages.innerHTML = "";

  thread.messages.forEach(msg => {
    addMessage(msg.role, msg.content, false);
  });

  renderThreads();
}

function handleMessage(e) {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";

  simulateBotResponse();
}

function addMessage(role, content, save = true) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.innerText = content;

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (save) {
    const thread = threads.find(t => t.id === currentThreadId);
    thread.messages.push({ role, content });
  }
}

function simulateBotResponse() {
  document.getElementById("typing-indicator").classList.remove("d-none");

  setTimeout(() => {
    document.getElementById("typing-indicator").classList.add("d-none");
    addMessage("assistant", "This is a mock AI response.");
  }, 1000);
}

// Initial state
showWelcome();
