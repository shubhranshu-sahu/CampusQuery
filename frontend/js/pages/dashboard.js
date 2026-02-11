// =====================
// AUTH CHECK 
// =====================
const token = localStorage.getItem("campusquery_token");
const user = JSON.parse(localStorage.getItem("campusquery_user"));

if (!token || !user) {
  window.location.replace("login.html");
}

// =====================
// ROLE-BASED UI
// =====================
if (user?.role === "admin") {
  document.getElementById("admin-entry-link").classList.remove("d-none");
}

// =====================
// LOGOUT
// =====================
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("campusquery_user");
  localStorage.removeItem("campusquery_token");

  // Prevent back-button access
  window.location.replace("login.html");
});

// =====================
// MOBILE SIDEBAR TOGGLE
// =====================
const toggleBtn = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
}
