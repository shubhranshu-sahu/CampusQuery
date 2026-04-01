// =====================
// AUTH CHECK 
// =====================
const token = localStorage.getItem("campusquery_token");
const user = JSON.parse(localStorage.getItem("campusquery_user"));

if (!token || !user) {
    window.location.replace("login.html");
}

// =====================
// MOBILE SIDEBAR
// =====================
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

// =====================
// ROLE-BASED UI
// =====================
if (user?.role === "admin") {
  const adminLink = document.getElementById("admin-entry-link");
  if(adminLink) adminLink.classList.remove("d-none");
}

// =====================
// LOGOUT
// =====================
function triggerLogout() {
  localStorage.removeItem("campusquery_user");
  localStorage.removeItem("campusquery_token");
  window.location.replace("login.html");
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) logoutBtn.addEventListener("click", triggerLogout);

const profileLogoutBtn = document.getElementById("profile-logout-btn");
if (profileLogoutBtn) profileLogoutBtn.addEventListener("click", triggerLogout);


// =====================
// POPULATE PROFILE UI
// =====================
document.addEventListener("DOMContentLoaded", () => {
    
    // Inject custom strings securely
    const fname = user.first_name || "User";
    const lname = user.last_name || "";
    
    const fullName = `${fname} ${lname}`.trim();

    document.getElementById("profile-name").innerText = fullName;
    document.getElementById("profile-email").innerText = user.email || "No email provided";
    document.getElementById("profile-role").innerText = user.role || "user";
    document.getElementById("profile-initial").innerText = fname.charAt(0).toUpperCase();

    // Secondary Meta
    document.getElementById("profile-gender").innerText = user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not specified";
    document.getElementById("profile-age").innerText = user.age || "Not specified";

    // Trigger GSAP Initial load 
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if(window.innerWidth > 991) {
        tl.from(".gs-sidebar", { x: -100, opacity: 0, duration: 0.8 });
      }
      tl.from(".gs-dash-item", { y: -20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".gs-profile-card", { scale: 0.95, y: 30, opacity: 0, duration: 0.8 }, "-=0.2")
        .from(".gs-profile-btn", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3");
    }
});
