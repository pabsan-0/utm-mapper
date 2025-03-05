const textArea = document.getElementById("coordinates");

textArea.value = localStorage.getItem("cachedText") || "";

textArea.addEventListener("input", () => {
    localStorage.setItem("cachedText", textArea.value);
});
