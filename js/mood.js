const params = new URLSearchParams(window.location.search);
const moodQuery = (params.get("mood") || "").trim();

const valueEl = document.getElementById("mood-value");
const hintEl = document.getElementById("mood-hint");
const gridEl = document.getElementById("movies-grid");
const emptyEl = document.getElementById("empty-state");

const MOOD_GROUPS = {
  радость: ["радость", "радост", "весел", "счаст", "позитив", "восторг"],
  грусть: ["грусть", "груст", "печал", "тоск", "одинок", "слез"],
  злость: ["злость", "злост", "злое", "злой", "гнев", "ярост", "агресс", "раздраж"],
  ужас: ["ужас", "ужасн", "страх", "страш", "жутк", "бояз", "боят", "паник", "испуг", "кошмар"],
  мотивация: ["мотивация", "мотив", "вдохнов", "бодр", "энерг"],
  мистика: ["мистика","мистик","мистику"]
};

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMoodGroups(text) {
  const normalized = normalize(text);
  if (!normalized) return [];

  return Object.entries(MOOD_GROUPS)
    .filter(([, stems]) => stems.some((stem) => normalized.includes(stem)))
    .map(([group]) => group);
}

function getCanonicalMood(text) {
  const groups = getMoodGroups(text);
  return groups.length ? groups[0] : normalize(text);
}

function capitalizeFirst(text) {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

const mood = moodQuery ? getCanonicalMood(moodQuery) : "";
valueEl.textContent = mood ? capitalizeFirst(mood) : "настроение не выбрано";

function getMovieMoods(movie) {
  const seen = new Set();

  return (movie.moods || [])
    .map((value) => String(value).trim())
    .filter((value) => {
      const key = normalize(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function createMoodTag(value) {
  const tag = document.createElement("span");
  tag.className = "mood-tag";
  tag.textContent = capitalizeFirst(value);
  return tag;
}

function createMoodFallbackTag() {
  const tag = document.createElement("span");
  tag.className = "mood-tag mood-tag--muted";
  tag.textContent = "Настроение не указано";
  return tag;
}

function createCard(movie) {
  const link = document.createElement("a");
  link.className = "movie-card";
  link.href = `movie.html?id=${encodeURIComponent(movie.id)}${
    mood ? `&mood=${encodeURIComponent(mood)}` : ""
  }`;

  const poster = document.createElement("img");
  poster.className = "movie-poster";
  poster.src = movie.poster;
  poster.alt = `Постер фильма «${movie.title}»`;
  poster.loading = "lazy";

  const body = document.createElement("span");
  body.className = "movie-card-body";

  const title = document.createElement("span");
  title.className = "movie-card-title";
  title.textContent = movie.title;

  const meta = document.createElement("span");
  meta.className = "movie-card-meta";
  meta.textContent = `${movie.year} · ★ ${movie.rating}`;

  const moodValues = getMovieMoods(movie);

  const moods = document.createElement("span");
  moods.className = "movie-card-moods";
  moods.append(
    ...(moodValues.length
      ? moodValues.map(createMoodTag)
      : [createMoodFallbackTag()])
  );

  body.append(title, meta, moods);
  link.append(poster, body);
  return link;
}

function matchesMood(movie, query) {
  const queryGroups = getMoodGroups(query);
  const movieGroups = getMoodGroups(movie.moods.join(" "));

  const groupsMatch = queryGroups.some((group) => movieGroups.includes(group));
  if (groupsMatch) return true;

  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  return [movie.title, movie.description, ...movie.genre]
    .map(normalize)
    .join(" ")
    .includes(normalizedQuery);
}

async function loadMovies() {
  try {
    const response = await fetch("data/movies.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    hintEl.textContent =
      "Не удалось загрузить фильмы. Открой сайт через локальный сервер, например: python -m http.server";
    return null;
  }
}

loadMovies().then((movies) => {
  if (!movies) return;

  if (!movies.length) {
    hintEl.textContent = "";
    emptyEl.textContent = "В базе пока нет фильмов.";
    emptyEl.hidden = false;
    return;
  }

  const found = mood ? movies.filter((movie) => matchesMood(movie, mood)) : movies;

  if (!found.length) {
    const available = [
      ...new Set(movies.flatMap((movie) => movie.moods.map(getCanonicalMood))),
    ].join(", ");
    hintEl.textContent = "";
    emptyEl.textContent = `По запросу «${mood}» ничего не нашлось. Сейчас в базе: ${available}. Попробуй другое настроение.`;
    emptyEl.hidden = false;
    return;
  }

  hintEl.textContent = `Найдено фильмов: ${found.length}`;
  gridEl.append(...found.map(createCard));
});
