const input = document.getElementById("search");
const suggestionsBox = document.getElementById("suggestions");
const loader = document.getElementById("loader");

const API = "http://localhost:3000/autocomplete";

let currentIndex = -1;

// Debounce function (important for performance)
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

const fetchSuggestions = async () => {
    const query = input.value;

    if (!query) {
        suggestionsBox.innerHTML = "";
        return;
    }

    loader.style.display = "block";

    try {
        const res = await fetch(`${API}?prefix=${query}`);
        const data = await res.json();

        loader.style.display = "none";
        suggestionsBox.innerHTML = "";

        data.suggestions.forEach((word) => {
            const div = document.createElement("div");

            const highlighted = word.replace(
                new RegExp(`^${query}`, "i"),
                `<span class="highlight">${query}</span>`
            );

            div.innerHTML = highlighted;

            div.addEventListener("click", () => {
                input.value = word;
                suggestionsBox.innerHTML = "";
            });

            suggestionsBox.appendChild(div);
        });

    } catch (err) {
        loader.style.display = "none";
        console.error(err);
    }
};

input.addEventListener("input", debounce(fetchSuggestions, 300));

// Keyboard navigation
input.addEventListener("keydown", (e) => {
    const items = suggestionsBox.querySelectorAll("div");

    if (e.key === "ArrowDown") {
        currentIndex++;
        updateActive(items);
    } else if (e.key === "ArrowUp") {
        currentIndex--;
        updateActive(items);
    } else if (e.key === "Enter" && currentIndex >= 0) {
        input.value = items[currentIndex].innerText;
        suggestionsBox.innerHTML = "";
    }
});

function updateActive(items) {
    items.forEach(i => i.classList.remove("active"));

    if (currentIndex >= items.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = items.length - 1;

    items[currentIndex].classList.add("active");
}