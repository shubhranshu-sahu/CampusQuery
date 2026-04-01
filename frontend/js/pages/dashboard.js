// =====================
// AUTH CHECK 
// =====================
const token = localStorage.getItem("campusquery_token");
const user = JSON.parse(localStorage.getItem("campusquery_user"));

if (!token || !user) {
  window.location.replace("login.html");
}

// =====================
// POPULATE USER DATA
// =====================
const greetingEl = document.getElementById("user-greeting");
const welcomeEl = document.getElementById("dash-welcome");

if (user && greetingEl && welcomeEl) {
  const firstName = user.first_name || "User";
  greetingEl.innerText = `${firstName}`;
  welcomeEl.innerText = `Welcome back, ${firstName}!`;
}

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
const logoutBtn = document.getElementById("logout-btn");
if(logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("campusquery_user");
    localStorage.removeItem("campusquery_token");

    // Prevent back-button access
    window.location.replace("login.html");
  });
}

// =====================
// MOBILE SIDEBAR TOGGLE
// =====================
const toggleBtn = document.getElementById("toggle-sidebar");
const closeBtn = document.getElementById("close-sidebar");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");

function openSidebar() {
  if(sidebar) sidebar.classList.add("show");
  if(overlay) overlay.classList.add("show");
}

function closeSidebar() {
  if(sidebar) sidebar.classList.remove("show");
  if(overlay) overlay.classList.remove("show");
}

if (toggleBtn) toggleBtn.addEventListener("click", openSidebar);
if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
if (overlay) overlay.addEventListener("click", closeSidebar);

// =====================
// GSAP ANIMATIONS
// =====================
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Sidebar slides in on desktop, otherwise just normally there
    if(window.innerWidth > 991) {
      tl.from(".gs-sidebar", {
          x: -100,
          opacity: 0,
          duration: 0.8
      });
    }

    // Main content stagger
    tl.from(".gs-dash-item", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1
    }, "-=0.4")
    .from(".gs-dash-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.2)"
    }, "-=0.6");
});
