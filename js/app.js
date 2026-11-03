const form = document.getElementById("mood-form");
const input = document.getElementById("mood-input");
const cards = document.querySelectorAll(".mood-card");
const luckyBtn = document.getElementById("lucky-btn");
const luckyStatus = document.getElementById("lucky-status");

function goToMood(mood) {
  window.location.href = `mood.html?mood=${encodeURIComponent(mood)}`;
}

function goToMovie(id) {
  window.location.href = `movie.html?id=${encodeURIComponent(id)}`;
}

let moviesPromise = null;

function loadMovies() {
  if (!moviesPromise) {
    moviesPromise = fetch("data/movies.json")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        moviesPromise = null;
        throw error;
      });
  }

  return moviesPromise;
}

function setLuckyLoading(isLoading) {
  luckyBtn.disabled = isLoading;
  luckyBtn.setAttribute("aria-busy", String(isLoading));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const mood = input.value.trim();
  if (!mood) return;
  goToMood(mood);
});

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const mood = card.dataset.mood;
    if (!mood) return;
    goToMood(mood);
  });
});

luckyBtn.addEventListener("click", async () => {
  luckyStatus.hidden = true;
  setLuckyLoading(true);

  try {
    const movies = await loadMovies();
    if (!movies.length) throw new Error("empty movies list");

    const movie = movies[Math.floor(Math.random() * movies.length)];
    goToMovie(movie.id);
  } catch (error) {
    setLuckyLoading(false);
    luckyStatus.textContent =
      "Не удалось выбрать фильм. Открой сайт через локальный сервер, например: python -m http.server";
    luckyStatus.hidden = false;
  }
});