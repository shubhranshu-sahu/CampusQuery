
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


// ---------------- LOAD ----------------

async function loadEntries() {
    try {
        const res = await fetch(`${API_BASE}/entries/`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        if (!res.ok) {
            throw new Error("Unauthorized or server error");
        }

        const data = await res.json();

        entries = data.entries || [];

        renderEntries();

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="text-danger">Failed to load entries</p>`;
    }
}


// ---------------- RENDER ----------------

function renderEntries() {
    container.innerHTML = "";

    if (entries.length === 0) {
        container.innerHTML = `<p>No entries yet</p>`;
        return;
    }

    entries.forEach(entry => {

        const isOwner = entry.author_name === user.email;

        const div = document.createElement("div");
        div.className = "col-md-4";

        div.innerHTML = `
        <div class="card shadow-sm" style="cursor: pointer; height: 280px; display: flex; flex-direction: column;" onclick="openViewModal('${entry.id}')">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title text-truncate title-text">${entry.title}</h5>
                <p class="card-text text-muted flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; white-space: normal;">
                    ${entry.description}
                </p>

                <div class="mt-auto">
                    <small class="text-info d-block text-truncate">Tags: ${entry.tags.join(", ")}</small>
                    <small class="text-secondary d-block text-truncate">Author: ${entry.author_name}</small>

                    <div class="mt-3 d-flex justify-content-end gap-2" onclick="event.stopPropagation()">
                        ${isOwner ? `
                            <button class="btn btn-sm btn-warning" onclick="openEditModal('${entry.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteEntry('${entry.id}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        ` : ""}
                    </div>
                </div>
            </div>
        </div>
        `;

        container.appendChild(div);
    });
}


// ---------------- VIEW ----------------

function openViewModal(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const isOwner = entry.author_name === user.email;

    document.getElementById("viewModalTitle").innerText = entry.title;
    document.getElementById("viewModalAuthor").innerText = "Author: " + entry.author_name;
    document.getElementById("viewModalDescription").innerText = entry.description;
    document.getElementById("viewModalTags").innerText = "Tags: " + entry.tags.join(", ");

    const actionsContainer = document.getElementById("viewModalActions");
    if (isOwner) {
        actionsContainer.innerHTML = `
            <button class="btn btn-sm btn-warning" onclick="openEditModal('${entry.id}'); bootstrap.Modal.getInstance(document.getElementById('viewEntryModal')).hide();">
                <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteEntry('${entry.id}'); bootstrap.Modal.getInstance(document.getElementById('viewEntryModal')).hide();">
                <i class="bi bi-trash"></i> Delete
            </button>
        `;
    } else {
        actionsContainer.innerHTML = "";
    }

    const viewModal = new bootstrap.Modal(document.getElementById("viewEntryModal"));
    viewModal.show();
}

// ---------------- CREATE ----------------

function openCreateModal() {
    currentEditId = null;

    document.getElementById("modalTitle").innerText = "New Entry";
    document.getElementById("entry-title").value = "";
    document.getElementById("entry-description").value = "";
    document.getElementById("entry-tags").value = "";

    modal.show();
}


// ---------------- EDIT ----------------

function openEditModal(id) {
    const entry = entries.find(e => e.id === id);

    currentEditId = id;

    document.getElementById("modalTitle").innerText = "Edit Entry";
    document.getElementById("entry-title").value = entry.title;
    document.getElementById("entry-description").value = entry.description;
    document.getElementById("entry-tags").value = entry.tags.join(",");

    modal.show();
}


// ---------------- SAVE ----------------

async function saveEntry() {

    const payload = {
        title: document.getElementById("entry-title").value,
        description: document.getElementById("entry-description").value,
        tags: document.getElementById("entry-tags").value
            .split(",")
            .map(t => t.trim())
            .filter(t => t)
    };

    if (currentEditId) {
        await fetch(`${API_BASE}/entries/${currentEditId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify(payload)
        });
    } else {
        await fetch(`${API_BASE}/entries/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify(payload)
        });
    }

    modal.hide();
    loadEntries();
}


// ---------------- DELETE ----------------

async function deleteEntry(id) {
    if (!confirm("Delete this entry?")) return;

    await fetch(`${API_BASE}/entries/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    loadEntries();
}


// ---------------- LOGOUT ----------------

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("campusquery_user");
    localStorage.removeItem("campusquery_token");
    window.location.replace("login.html");
});


// ---------------- INIT ----------------

loadEntries();