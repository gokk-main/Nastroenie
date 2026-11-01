const form = document.getElementById("mood-form");
const input = document.getElementById("mood-input");
const cards = document.querySelectorAll(".mood-card");

function goToMood(mood) {
  window.location.href = `mood.html?mood=${encodeURIComponent(mood)}`;
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