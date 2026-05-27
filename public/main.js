// main.js for ...ffflashcards.

// Constants
const ROOT_ELEMENT = document.querySelector(':root'); // Root element: allows to change CSS variables.

// Helpers

function getAuthToken() {
    return localStorage.getItem("authToken");
}

function setAuthToken(token) {
    localStorage.setItem("authToken", token);
}

function clearAuthToken() {
    localStorage.removeItem("authToken");
}

function getUsername() {
    return localStorage.getItem("username");
}

function setUsername(username) {
    localStorage.setItem("username", username);
}

function clearUsername() {
    localStorage.removeItem("username");
}

function isLoggedIn() {
    return !!getAuthToken();
}

async function authenticatedFetch(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ... options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
        ...options,
        headers
    });

    // If status is 401, then token is invalid so log out
    if (response.status === 401) {
        logout();
        return null;
    }

    return response;
}

// Function to change CSS variables
function changeStyleVar(variable, value) {
  console.log(`CSS variable ${variable} set to ${value}.`);
  ROOT_ELEMENT.style.setProperty(variable, value);
}

// End helpers

// Account UI logic
document.getElementsByClassName("login-button")[0].addEventListener("click", () => {
  document.getElementById("login").style.display = "block";
  document.getElementById("select-method").style.display = "none";
});

document.getElementsByClassName("signup-button")[0].addEventListener("click", () => {
  document.getElementById("signup").style.display = "block";
  document.getElementById("select-method").style.display = "none";
});

document.getElementsByClassName("login-button")[1].addEventListener("click", () => {
  document.getElementById("login").style.display = "block";
  document.getElementById("signup").style.display = "none";
});

document.getElementsByClassName("signup-button")[1].addEventListener("click", () => {
  document.getElementById("signup").style.display = "block";
  document.getElementById("login").style.display = "none";
});

// Sign up
document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("signup").querySelector('input[type="text"]').value;
  const password = document.getElementById("signup").querySelector('input[type="password"]').value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Successfully signed up! Please log in.");
        document.getElementById("signup-form").reset();
        document.getElementById("signup").style.display = "none";
        document.getElementById("login").style.display = "block";
    } else {
        alert(`Error: ` + (data.error || "Registration failed."));
    }

  } catch (error) {
    alert('Error during registration: ' + error.message);
  }
});

// Login
document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("login").querySelector('input[type="text"]').value;
  const password = document.getElementById("login").querySelector('input[type="password"]').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      setAuthToken(data.token);
      setUsername(data.username);
      document.getElementById("login-form").reset();
      showApp();
    } else {
      alert("Error: " + (data.error || "Login failed."));
    }
  } catch (error) {
    alert("Error during login: " + error.message);
  }
}); 

// Logout
function logout() {
  document.getElementById("home").style.display = "block";
  clearAuthToken();
  clearUsername();
  document.getElementById("start").style.display = "block";
  document.getElementById("app").style.display = "none";
  document.getElementById("select-method").style.display = "block";
  document.getElementById("login").style.display = "none";
  document.getElementById("signup").style.display = "none";
}

document.getElementById("logout-button").addEventListener("click", logout);

function showApp() {
    document.getElementById("start").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("welcome-message").textContent = `Welcome to ...ffflashcards, ${getUsername()}! With ...ffflashcards, you can easily create, manage and study flashcards.`;
}

// End of account UI logic

// Version
const versionElement = document.getElementById("version");
fetch('/get-version')
    .then(response => response.text())
    .then(version => {
        versionElement.textContent = version;
    })
    .catch(error => {
        console.error('Error fetching version:', error);
        versionElement.textContent = "Unknown";
    });

// Settings
// Open settings menu
document.getElementById("settings-button").addEventListener("click", () => {
    document.getElementById("settings-overlay").style.display = "block";
    document.getElementById("settings-button").style.display = "none";
});

// Close settings menu
document.getElementById("close-settings").addEventListener("click", () => {
    document.getElementById("settings-overlay").style.display = "none";
    document.getElementById("settings-button").style.display = "block";
});

// Change primary color
document.getElementById("primary-color-select").addEventListener("change", (event) => {
    const color = event.target.value;
    if (color === "blue") {
        changeStyleVar("--primary-color", "#1e3a5f");
        changeStyleVar("--primary-color-dark", "#152a45");
    }
    if (color === "gray") {
        changeStyleVar("--primary-color", "#5a7c8c");
        changeStyleVar("--primary-color-dark", "#4a6c7c");
    }
    if (color === "black") {
        changeStyleVar("--primary-color", "#383636");
        changeStyleVar("--primary-color-dark", "#000000");
    }
});

// Change secondary color
document.getElementById("secondary-color-select").addEventListener("change", (event) => {
    const color = event.target.value;
    if (color === "gray") {
        changeStyleVar("--secondary-color", "#5a7c8c");
        changeStyleVar("--secondary-color-light", "#6a8c9c");
        changeStyleVar("--secondary-color-lighter", "#7a92a8");
    }
    if (color === "blue") {
        changeStyleVar("--secondary-color", "#1e3a5f");
        changeStyleVar("--secondary-color-light", "#2e4a6f");
        changeStyleVar("--secondary-color-lighter", "#3e5a7f");
    }
    if (color === "green") {
        changeStyleVar("--secondary-color", "#2d7a3e");
        changeStyleVar("--secondary-color-light", "#3d8a4e");
        changeStyleVar("--secondary-color-lighter", "#4d9a5e");
    }
});

// Change link color
document.getElementById("link-color-select").addEventListener("change", (event) => {
    const color = event.target.value;
    if (color === "blue") {
        changeStyleVar("--link", "#007BFF");
    }
    if (color === "green") {
        changeStyleVar("--link", "#28a745");
    }
    if (color === "purple") {
        changeStyleVar("--link", "#6f42c1");
    }
});

// End of settings

// Initialisation
if (isLoggedIn()) {
    showApp();
} else {
    document.getElementById("start").style.display = "block";
    document.getElementById("select-method").style.display = "block";
}
