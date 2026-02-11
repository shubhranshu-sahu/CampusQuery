const form = document.getElementById("login-form");
const errorBox = document.getElementById("error-box");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.add("d-none");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showError("Please fill in all fields.");
    return;
  }

  try {
    showLoader("Signing you in...");

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Store token & user
    localStorage.setItem("campusquery_token", data.token);
    localStorage.setItem("campusquery_user", JSON.stringify(data.user));

    // Redirect
    window.location.replace("dashboard.html");

  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
});

function showError(message) {
  errorBox.innerText = message;
  errorBox.classList.remove("d-none");
}

function showLoader(text) {
  document.getElementById("loader-text").innerText = text;
  document.getElementById("global-loader").classList.remove("d-none");
}

function hideLoader() {
  document.getElementById("global-loader").classList.add("d-none");
}
