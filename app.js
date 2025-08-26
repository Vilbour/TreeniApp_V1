// --- DATA ---
let user1RM = JSON.parse(localStorage.getItem("user1RM")) || {
  snatch: 70,
  cleanjerk: 90,
  squat: 130,
  bench: 110,
  deadlift: 195,
};

let program = [
  { day: 1, exercises: [
    { name: "Snatch", pct: 0.7, reps: "5x3" },
    { name: "Back Squat", pct: 0.75, reps: "5x5" },
  ]},
  { day: 2, exercises: [
    { name: "Clean & Jerk", pct: 0.7, reps: "5x3" },
    { name: "Front Squat", pct: 0.7, reps: "5x5" },
  ]},
  { day: 3, exercises: [
    { name: "Snatch Pull", pct: 0.9, reps: "4x3" },
    { name: "Bench Press", pct: 0.7, reps: "5x5" },
  ]}
];

let currentDayIndex = 0;

// --- NAVIGATION ---
function navigate(page) {
  if (page === "home") renderHome();
  if (page === "program") renderProgram();
  if (page === "today") renderToday();
  if (page === "settings") renderSettings();
}

function renderHome() {
  document.getElementById("view").innerHTML = `
    <h2>Syötä 1RM tuloksesi</h2>
    <form id="rmForm">
      ${Object.keys(user1RM).map(lift => `
        <label>${lift}: <input type="number" name="${lift}" value="${user1RM[lift]}" /></label>
      `).join("<br>")}
      <button type="submit">Tallenna</button>
    </form>
  `;

  document.getElementById("rmForm").onsubmit = e => {
    e.preventDefault();
    const data = new FormData(e.target);
    Object.keys(user1RM).forEach(lift => {
      user1RM[lift] = parseFloat(data.get(lift)) || 0;
    });
    localStorage.setItem("user1RM", JSON.stringify(user1RM));
    alert("Tallennettu!");
  };
}

function renderProgram() {
  const day = program[currentDayIndex];
  document.getElementById("view").innerHTML = `
    <h2>Päivä ${day.day}</h2>
    <ul>
      ${day.exercises.map(ex =>
        `<li>${ex.name}: ${(ex.pct * user1RM[mapLift(ex.name)]).toFixed(1)} kg (${ex.reps})</li>`
      ).join("")}
    </ul>
    <button onclick="prevDay()">Edellinen</button>
    <button onclick="nextDay()">Seuraava</button>
  `;
}

function renderToday() {
  const todayIndex = new Date().getDay() % program.length;
  const day = program[todayIndex];
  document.getElementById("view").innerHTML = `
    <h2>Tänään - Päivä ${day.day}</h2>
    <ul>
      ${day.exercises.map(ex =>
        `<li>${ex.name}: ${(ex.pct * user1RM[mapLift(ex.name)]).toFixed(1)} kg (${ex.reps})</li>`
      ).join("")}
    </ul>
  `;
}

function renderSettings() {
  document.getElementById("view").innerHTML = `
    <h2>Asetukset</h2>
    <p>Voit muokata 1RM arvojasi etusivulla.</p>
  `;
}

// --- HELPERS ---
function mapLift(name) {
  if (name.toLowerCase().includes("snatch")) return "snatch";
  if (name.toLowerCase().includes("clean")) return "cleanjerk";
  if (name.toLowerCase().includes("squat") && !name.toLowerCase().includes("front")) return "squat";
  if (name.toLowerCase().includes("front")) return "squat";
  if (name.toLowerCase().includes("bench")) return "bench";
  if (name.toLowerCase().includes("dead")) return "deadlift";
  return "snatch";
}

function nextDay() {
  currentDayIndex = (currentDayIndex + 1) % program.length;
  renderProgram();
}
function prevDay() {
  currentDayIndex = (currentDayIndex - 1 + program.length) % program.length;
  renderProgram();
}

// --- INIT ---
navigate("home");
