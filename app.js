let oneRM = JSON.parse(localStorage.getItem("oneRM")) || {
  snatch: 70,
  cj: 90,
  squat: 130
};

let program = [
  { day: "Päivä 1", workout: ["Snatch 5x3 @70%", "CJ 5x2 @75%", "Squat 5x5 @80%"] },
  { day: "Päivä 2", workout: ["Snatch pulls 4x3 @90%", "Front squat 5x3 @75%"] },
  { day: "Päivä 3", workout: ["Power snatch 5x2 @65%", "CJ 5x2 @70%", "Back squat 5x3 @85%"] }
];

let currentDay = 0;

function navigate(view) {
  const app = document.getElementById("app");
  if (view === "home") renderHome(app);
  if (view === "program") renderProgram(app);
  if (view === "today") renderToday(app);
  if (view === "settings") renderSettings(app);
}

function renderHome(app) {
  app.innerHTML = `
    <div class="card">
      <h2>Syötä 1RM tulokset</h2>
      <label>Snatch: <input id="snatch" type="number" value="${oneRM.snatch}"></label><br>
      <label>C&J: <input id="cj" type="number" value="${oneRM.cj}"></label><br>
      <label>Squat: <input id="squat" type="number" value="${oneRM.squat}"></label><br>
      <button onclick="saveOneRM()">Tallenna</button>
    </div>
  `;
}

function renderProgram(app) {
  const day = program[currentDay];
  app.innerHTML = `
    <div class="card">
      <h2>${day.day}</h2>
      <ul>${day.workout.map(w => `<li>${parseWeights(w)}</li>`).join("")}</ul>
      <button onclick="prevDay()">← Edellinen</button>
      <button onclick="nextDay()">Seuraava →</button>
    </div>
  `;
}

function renderToday(app) {
  app.innerHTML = `<div class="card"><h2>Tänään</h2><p>Tee ohjelman mukaan!</p></div>`;
}

function renderSettings(app) {
  app.innerHTML = `
    <div class="card">
      <h2>Asetukset</h2>
      <p>Voit muokata 1RM tuloksia etusivulta.</p>
    </div>
  `;
}

function saveOneRM() {
  oneRM = {
    snatch: parseInt(document.getElementById("snatch").value),
    cj: parseInt(document.getElementById("cj").value),
    squat: parseInt(document.getElementById("squat").value)
  };
  localStorage.setItem("oneRM", JSON.stringify(oneRM));
  alert("Tallennettu!");
}

function parseWeights(text) {
  return text.replace(/@(\d+)%/g, (m, p) => {
    if (text.includes("Snatch")) return Math.round(oneRM.snatch * p / 100) + "kg";
    if (text.includes("CJ")) return Math.round(oneRM.cj * p / 100) + "kg";
    if (text.includes("Squat")) return Math.round(oneRM.squat * p / 100) + "kg";
    return m;
  });
}

function nextDay() {
  currentDay = (currentDay + 1) % program.length;
  navigate("program");
}

function prevDay() {
  currentDay = (currentDay - 1 + program.length) % program.length;
  navigate("program");
}

navigate("home");
