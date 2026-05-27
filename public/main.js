// main.js for ...ffflashcards.

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
  document.getElementById("subject-detail").style.display = "none";
  document.getElementById("home").style.display = "block";
  clearAuthToken();
  clearUsername();
  document.getElementById("start").style.display = "block";
  document.getElementById("app").style.display = "none";
  document.getElementById("select-method").style.display = "block";
  document.getElementById("login").style.display = "none";
  document.getElementById("signup").style.display = "none";
}

function showApp() {
    document.getElementById("start").style.display = "none";
    document.getElementById("app").style.display = "block";
    updateTotalProgress();
    initialiseSubjectList();
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