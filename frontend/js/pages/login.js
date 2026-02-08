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

    // TEMP: simulate API delay
    await new Promise(res => setTimeout(res, 1200));

    // TODO (later):
    // const res = await fetch(`${API_BASE}/auth/login`, {...})

    // TEMP SUCCESS
    window.location.href = "dashboard.html";

  } catch (err) {
    showError("Invalid email or password.");
  } finally {
    hideLoader();
  }
});

function showError(message) {
  errorBox.innerText = message;
  errorBox.classList.remove("d-none");
}

// Loader helpers (same pattern as index)
function showLoader(text) {
  document.getElementById("loader-text").innerText = text;
  document.getElementById("global-loader").classList.remove("d-none");
}

function hideLoader() {
  document.getElementById("global-loader").classList.add("d-none");
}
