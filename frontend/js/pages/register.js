const form = document.getElementById("register-form");
const errorBox = document.getElementById("error-box");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.add("d-none");

  const data = {
    first_name: document.getElementById("first_name").value.trim(),
    last_name: document.getElementById("last_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    confirm_password: document.getElementById("confirm_password").value,
    gender: document.getElementById("gender").value,
    age: document.getElementById("age").value,
    role: document.getElementById("role").value,
  };

  // Basic validation
  if (Object.values(data).some((v) => !v)) {
    showError("Please fill in all fields.");
    return;
  }

  if (data.password.length < 6) {
    showError("Password must be at least 6 characters long.");
    return;
  }

  if (data.password !== data.confirm_password) {
    showError("Passwords do not match.");
    return;
  }

try {
  showLoader("Creating your account...");

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      gender: data.gender,
      age: parseInt(data.age),
      role: data.role
    })
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Registration failed");
  }

  window.location.href = "login.html";

} catch (err) {
  showError(err.message);
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
