// =====================
// AUTH CHECK 
// =====================
const token = localStorage.getItem("campusquery_token");
const user = JSON.parse(localStorage.getItem("campusquery_user"));

if (!token || !user) {
    window.location.replace("login.html");
}

let entries = [];
let currentEditId = null;

const container = document.getElementById("entries-container");
const modal = new bootstrap.Modal(document.getElementById("entryModal"));

function getToken() {
    return localStorage.getItem("campusquery_token");
}

// =====================
// UI LOGIC & LOADERS
// =====================
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

// LOGOUT
const logoutBtn = document.getElementById("logout-btn");
if(logoutBtn) {
  logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("campusquery_user");
      localStorage.removeItem("campusquery_token");
      window.location.replace("login.html");
  });
}

// =====================
// LOAD
// =====================
async function loadEntries() {
    try {
        const res = await fetch(`${API_BASE}/entries/`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });

        if (!res.ok) throw new Error("Unauthorized or server error");

        const data = await res.json();
        entries = data.entries || [];
        renderEntries();

    } catch (err) {
        console.error(err);
        container.innerHTML = `
          <div class="col-12 mt-4 text-center">
            <div class="glass-panel p-4 border-danger border-opacity-50 text-danger rounded-4">
              <i class="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
              <span class="fw-bold">Failed to load entries from server.</span>
            </div>
          </div>
        `;
    }
}

// =====================
// RENDER
// =====================
function renderEntries() {
    container.innerHTML = "";

    if (entries.length === 0) {
        container.innerHTML = `
        <div class="col-12 mt-4 text-center gs-entry-card">
          <div class="glass-panel p-5 border-secondary border-opacity-25 rounded-4 shadow-sm">
            <i class="bi bi-journal-x fs-1 text-muted d-block mb-3"></i>
            <h5 class="text-white fw-bold">No Entries Yet</h5>
            <p class="text-white-50">Your knowledge base is currently empty. Click "New Entry" to add intelligence blocks.</p>
          </div>
        </div>
        `;
        return;
    }

    entries.forEach(entry => {
        const isOwner = entry.author_name === user.email;
        const tagHTML = entry.tags.map(tag => `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-2 py-1 me-1 mb-1 fw-medium">${tag}</span>`).join("");

        const div = document.createElement("div");
        div.className = "col-md-6 col-lg-4 gs-entry-card";

        div.innerHTML = `
        <div class="glass-panel hover-lift rounded-4 p-4 border border-secondary border-opacity-25 shadow-lg position-relative d-flex flex-column h-100" 
             style="cursor: pointer; overflow: hidden;" onclick="openViewModal('${entry.id}')">
            
            <div class="d-flex justify-content-between align-items-start mb-3">
               <div class="bg-dark border border-secondary border-opacity-50 rounded-circle p-2 text-info d-flex align-items-center justify-content-center shadow-sm" style="width: 44px; height: 44px;">
                   <i class="bi bi-file-earmark-text fs-5"></i>
               </div>
               ${isOwner ? `<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3 py-1 shadow-sm"><i class="bi bi-star-fill me-1"></i>Owner</span>` : ''}
            </div>

            <h5 class="fw-bolder text-white text-truncate title-text mb-2">${entry.title}</h5>
            
            <p class="text-white-50 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; font-size: 0.95rem; line-height: 1.6;">
                ${entry.description}
            </p>

            <div class="mt-3 pt-3 border-top border-secondary border-opacity-25">
                <div class="mb-2 text-truncate" style="line-height:1.8;">
                   ${tagHTML || '<span class="text-muted small">No tags</span>'}
                </div>
                <div class="d-flex align-items-center text-muted small mt-2">
                    <i class="bi bi-person-fill me-1"></i> <span class="text-truncate fw-semibold">${entry.author_name}</span>
                </div>
            </div>
        </div>
        `;
        container.appendChild(div);
    });

    // Trigger GSAP Stagger Entrance
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(".gs-entry-card", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out", clearProps: "all" }
      );
    }
}

// =====================
// VIEW
// =====================
window.openViewModal = function(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const isOwner = entry.author_name === user.email;
    const tagHTML = entry.tags.map(tag => `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3 py-2 me-2 mb-2 fw-medium">${tag}</span>`).join("");

    document.getElementById("viewModalTitle").innerText = entry.title;
    document.getElementById("viewModalAuthor").innerText = entry.author_name;
    document.getElementById("viewModalDescription").innerText = entry.description;
    
    // Inject custom HTML badges
    document.getElementById("viewModalTags").innerHTML = tagHTML || `<span class="text-muted small">No tags</span>`;

    const actionsContainer = document.getElementById("viewModalActions");
    if (isOwner) {
        actionsContainer.innerHTML = `
            <button class="btn btn-outline-warning rounded-pill px-3 fw-bold hover-white" onclick="openEditModal('${entry.id}'); bootstrap.Modal.getInstance(document.getElementById('viewEntryModal')).hide();">
                <i class="bi bi-pencil-fill me-1"></i> Edit
            </button>
            <button class="btn btn-danger rounded-pill px-3 fw-bold shadow-sm hover-lift" onclick="deleteEntry('${entry.id}'); bootstrap.Modal.getInstance(document.getElementById('viewEntryModal')).hide();">
                <i class="bi bi-trash3-fill me-1"></i> Delete
            </button>
        `;
    } else {
        actionsContainer.innerHTML = "";
    }

    const viewModal = new bootstrap.Modal(document.getElementById("viewEntryModal"));
    viewModal.show();
}

// =====================
// CREATE & EDIT
// =====================
window.openCreateModal = function() {
    currentEditId = null;
    document.getElementById("modalTitle").innerHTML = `<i class="bi bi-plus-circle me-2"></i>New Entry`;
    document.getElementById("entry-title").value = "";
    document.getElementById("entry-description").value = "";
    document.getElementById("entry-tags").value = "";
    modal.show();
}

window.openEditModal = function(id) {
    const entry = entries.find(e => e.id === id);
    currentEditId = id;
    document.getElementById("modalTitle").innerHTML = `<i class="bi bi-pencil-square me-2"></i>Edit Entry`;
    document.getElementById("entry-title").value = entry.title;
    document.getElementById("entry-description").value = entry.description;
    document.getElementById("entry-tags").value = entry.tags.join(", ");
    modal.show();
}

// =====================
// SAVE
// =====================
window.saveEntry = async function() {
    const titleVal = document.getElementById("entry-title").value.trim();
    const descVal = document.getElementById("entry-description").value.trim();

    if(!titleVal || !descVal) {
      alert("Title and Description are required.");
      return;
    }

    const payload = {
        title: titleVal,
        description: descVal,
        tags: document.getElementById("entry-tags").value
            .split(",")
            .map(t => t.trim())
            .filter(t => t)
    };

    try {
      showLoader("Saving entry...");
      if (currentEditId) {
          await fetch(`${API_BASE}/entries/${currentEditId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
              body: JSON.stringify(payload)
          });
      } else {
          await fetch(`${API_BASE}/entries/`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
              body: JSON.stringify(payload)
          });
      }
      modal.hide();
      await loadEntries();

    } catch(err) {
      console.error(err);
      alert("Failed to save entry. Check network.");
    } finally {
      hideLoader();
    }
}

// =====================
// DELETE
// =====================
window.deleteEntry = async function(id) {
    if (!confirm("Are you entirely sure you want to delete this knowledge block?")) return;

    try {
      showLoader("Deleting entry...");
      await fetch(`${API_BASE}/entries/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` }
      });
      await loadEntries();
    } catch(err) {
      console.error(err);
      alert("Failed to delete entry.");
    } finally {
      hideLoader();
    }
}

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {
    // Initial UI animations
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if(window.innerWidth > 991) {
        tl.from(".gs-sidebar", { x: -100, opacity: 0, duration: 0.8 });
      }
      tl.from(".gs-dash-item", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1
      }, "-=0.4");
    }

    // Load data
    showLoader("Fetching knowledge base...");
    loadEntries().finally(() => {
      hideLoader();
    });
});