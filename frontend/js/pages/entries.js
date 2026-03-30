const API_BASE = "http://127.0.0.1:5000/api";

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
        <div class="card h-100 shadow-sm">
            <div class="card-body">
                <h5>${entry.title}</h5>
                <p>${entry.description}</p>

                <small>Tags: ${entry.tags.join(", ")}</small><br>
                <small>Author: ${entry.author_name}</small>

                <div class="mt-3 d-flex justify-content-end gap-2">
                    ${isOwner ? `
                        <button class="btn btn-sm btn-warning"
                            onclick="openEditModal('${entry.id}')">
                            Edit
                        </button>

                        <button class="btn btn-sm btn-danger"
                            onclick="deleteEntry('${entry.id}')">
                            Delete
                        </button>
                    ` : ""}
                </div>
            </div>
        </div>
        `;

        container.appendChild(div);
    });
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