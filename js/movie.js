const params = new URLSearchParams(window.location.search);
const movieId = (params.get("id") || "").trim();
const mood = (params.get("mood") || "").trim();

const detailEl = document.getElementById("movie-detail");
const posterEl = document.getElementById("movie-poster");
const titleEl = document.getElementById("movie-title");
const metaEl = document.getElementById("movie-meta");
const genresEl = document.getElementById("movie-genres");
const descriptionEl = document.getElementById("movie-description");
const backLink = document.getElementById("back-link");
const emptyEl = document.getElementById("movie-empty");
const homeLink = document.getElementById("home-link");

backLink.href = mood ? `mood.html?mood=${encodeURIComponent(mood)}` : "index.html";

function showError(message) {
  emptyEl.textContent = message;
  emptyEl.hidden = false;
  detailEl.hidden = true;
  homeLink.hidden = false;
}

function buildMeta(movie) {
  const year = document.createElement("span");
  year.textContent = movie.year;

  const rating = document.createElement("span");
  rating.className = "rating-badge";
  rating.textContent = `★ ${Number(movie.rating).toFixed(1)}`;

  metaEl.replaceChildren(year, rating);
}

function renderMovie(movie) {
  posterEl.src = movie.poster;
  posterEl.alt = `Постер фильма «${movie.title}»`;
  titleEl.textContent = movie.title;
  document.title = `${movie.title} (${movie.year}) — NASTROENIE`;
  buildMeta(movie);

  genresEl.replaceChildren(
    ...movie.genre.map((genre) => {
      const item = document.createElement("li");
      item.className = "genre-tag";
      item.textContent = genre;
      return item;
    })
  );

  descriptionEl.textContent = movie.description;
  detailEl.hidden = false;
  emptyEl.hidden = true;
  homeLink.hidden = true;
}

async function init() {
  if (!movieId) {
    showError("Фильм не выбран. Вернись на главную и выбери настроение.");
    return;
  }

  try {
    const response = await fetch("data/movies.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const movies = await response.json();
    const movie = movies.find((item) => String(item.id) === movieId);

    if (!movie) {
      showError("Такой фильм не найден. Попробуй выбрать настроение заново.");
      return;
    }

    renderMovie(movie);
  } catch (error) {
    showError(
      "Не удалось загрузить данные. Открой сайт через локальный сервер, например: python -m http.server"
    );
  }
}

init();
