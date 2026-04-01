// =====================
// AUTH CHECK 
// =====================
const token = localStorage.getItem("campusquery_token");
const user = JSON.parse(localStorage.getItem("campusquery_user"));

if (!token || !user) {
  window.location.replace("login.html");
}

let currentThreadId = null;

// DOM Elements
const threadList = document.getElementById("thread-list");
const chatMessages = document.getElementById("chat-messages");
const threadName = document.getElementById("current-thread-name");
const welcomeScreen = document.getElementById("welcome-screen");
const chatContainer = document.getElementById("chat-container");
const typingIndicator = document.getElementById("typing-indicator");
const chatInput = document.getElementById("chat-input");

// Event Listeners
document.getElementById("new-chat-btn").addEventListener("click", createNewThread);
document.getElementById("chat-form").addEventListener("submit", handleMessage);
document.getElementById("rename-thread").addEventListener("click", renameThread);
document.getElementById("delete-thread").addEventListener("click", deleteThread);

// Mobile Sidebar
const toggleBtn = document.getElementById("toggle-sidebar");
const closeBtn = document.getElementById("close-sidebar");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");

function openSidebar() {
  if (sidebar) sidebar.classList.add("show");
  if (overlay) overlay.classList.add("show");
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove("show");
  if (overlay) overlay.classList.remove("show");
}

if (toggleBtn) toggleBtn.addEventListener("click", openSidebar);
if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
if (overlay) overlay.addEventListener("click", closeSidebar);

function goBack() {
  window.location.href = "dashboard.html";
}

// UI State Toggles
function showWelcome() {
  welcomeScreen.classList.remove("d-none");
  welcomeScreen.classList.add("d-flex");
  chatContainer.classList.add("d-none");
  chatContainer.classList.remove("d-flex");
}

function showChat() {
  welcomeScreen.classList.add("d-none");
  welcomeScreen.classList.remove("d-flex");
  chatContainer.classList.remove("d-none");
  chatContainer.classList.add("d-flex");
  
  // Close sidebar on mobile automatically when selecting chat
  closeSidebar();
}

// Rename
async function renameThread() {
  if (!currentThreadId) return;
  const newTitle = prompt("Enter new thread name:");
  if (!newTitle || !newTitle.trim()) return;

  try {
    showLoader("Renaming thread...");
    const res = await fetch(`${API_BASE}/chat/thread/${currentThreadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newTitle.trim() })
    });
    if (!res.ok) throw new Error("Rename failed");
    threadName.innerText = newTitle.trim();
    await loadThreads();
  } catch (err) {
    alert("Failed to rename thread");
  } finally {
    hideLoader();
  }
}

// Delete
async function deleteThread() {
  if (!currentThreadId) return;
  const confirmDelete = confirm("Are you sure you want to delete this thread?");
  if (!confirmDelete) return;

  try {
    showLoader("Deleting thread...");
    const res = await fetch(`${API_BASE}/chat/thread/${currentThreadId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Delete failed");
    currentThreadId = null;
    chatMessages.innerHTML = "";
    showWelcome();
    await loadThreads();
  } catch (err) {
    alert("Failed to delete thread");
  } finally {
    hideLoader();
  }
}

// Load Listing
async function loadThreads() {
  try {
    const res = await fetch(`${API_BASE}/chat/threads`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    renderThreads(data.threads || []);
  } catch (err) {
    console.error("Failed to load threads");
  }
}

function renderThreads(threads) {
  threadList.innerHTML = "";
  threads.forEach(thread => {
    const div = document.createElement("div");
    div.className = "thread-item" + (thread.id === currentThreadId ? " active" : "");
    div.innerHTML = `<i class="bi bi-chat-left-text fs-6 me-2 ${thread.id === currentThreadId ? 'text-info' : 'opacity-50'}"></i><span class="align-middle">${thread.title}</span>`;
    div.onclick = () => loadThread(thread.id);
    threadList.appendChild(div);
  });
}

// Create
async function createNewThread() {
  try {
    showLoader("Creating new thread...");
    const res = await fetch(`${API_BASE}/chat/thread`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    currentThreadId = data.thread.id;
    await loadThreads();
    await loadThread(currentThreadId);
  } catch (err) {
    console.error("Failed to create thread");
  } finally {
    hideLoader();
  }
}

// Load Specific Thread
async function loadThread(threadId) {
  currentThreadId = threadId;
  try {
    showLoader("Loading conversation...");
    const res = await fetch(`${API_BASE}/chat/messages/${threadId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    showChat();
    threadName.innerText = data.thread.title;
    chatMessages.innerHTML = "";

    data.messages.forEach(msg => {
      addMessage(msg.role, msg.content, false); // Instant logic
    });

    await loadThreads(); // updates active class
  } catch (err) {
    console.error("Failed to load thread");
  } finally {
    hideLoader();
  }
}

// Message Submission
async function handleMessage(e) {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message || !currentThreadId) return;

  // Optimistic UI insert for user
  addMessage("user", message, false);
  chatInput.value = "";
  typingIndicator.classList.remove("d-none");

  // Scroll visually immediately
  chatMessages.scrollTop = chatMessages.scrollHeight;

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
    typingIndicator.classList.add("d-none");

    if (data.assistant && data.assistant.content) {
      addMessage("assistant", data.assistant.content, true); // True = TypeWriter!
    }

  } catch (err) {
    typingIndicator.classList.add("d-none");
    console.error("Message send failed");
  }
}

// Add Message & Typewriter Simulation
function addMessage(role, content, useTypewriter = false) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `message ${role} shadow-sm`;
  chatMessages.appendChild(msgWrapper);

  if (!useTypewriter) {
    // Instant populate
    msgWrapper.innerHTML = marked.parse(content);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }

  // Typewriter streaming effect for AI
  let typingIndex = 0;
  // Around 3 characters per 15ms is a great fast, dynamic ChatGPT feeling.
  const interval = setInterval(() => {
    typingIndex += 3;
    if (typingIndex >= content.length) {
      typingIndex = content.length;
      clearInterval(interval);
      // Final parse without blinking cursor
      msgWrapper.innerHTML = marked.parse(content);
    } else {
      // Parse substring and add blinking cursor safely
      const rawHTML = marked.parse(content.substring(0, typingIndex)) + "<span class='typewriter-cursor'></span>";
      msgWrapper.innerHTML = rawHTML;
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 10);
}

function showLoader(text) {
  const loaderText = document.getElementById("loader-text");
  if (loaderText) loaderText.innerText = text;
  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.remove("d-none");
}

function hideLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.add("d-none");
}

// Initialization Call
document.addEventListener("DOMContentLoaded", () => {
  showWelcome();
  
  const finishInit = async () => {
    showLoader("Connecting to Campus AI...");
    await loadThreads();
    hideLoader();
  };
  finishInit();

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if(window.innerWidth > 991) {
      tl.from(".gs-sidebar", { x: -50, opacity: 0, duration: 0.6 });
    }
    tl.from(".gs-welcome-card, .gs-chat-item", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1
    }, "-=0.3");
  }
});
