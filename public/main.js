// main.js for ...ffflashcards.

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