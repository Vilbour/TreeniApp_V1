// Alkuperäinen 8 viikon ohjelma (EI MUUTETA!!!)
const program = [
  // Viikko 1
  [
    { day: "Viikko 1 - Päivä 1", lifts: [
      { name: "Snatch", percent: 0.7, reps: "5x3" },
      { name: "Back Squat", percent: 0.65, reps: "5x5" },
      { name: "Pull-ups", percent: null, reps: "3xMax" },
    ]},
    { day: "Viikko 1 - Päivä 2", lifts: [
      { name: "Clean & Jerk", percent: 0.7, reps: "5x2" },
      { name: "Front Squat", percent: 0.65, reps: "4x4" },
      { name: "Push Press", percent: 0.6, reps: "4x5" },
    ]},
    { day: "Viikko 1 - Päivä 3", lifts: [
      { name: "Deadlift", percent: 0.7, reps: "5x3" },
      { name: "Bench Press", percent: 0.65, reps: "5x5" },
      { name: "Rows", percent: null, reps: "4x8" },
    ]},
  ],
  // Viikot 2–8 täytetään samassa muodossa...
];

// Tallennetaan ja haetaan 1RM:t localStoragesta
function save1RM(values) {
  localStorage.setItem("oneRepMax", JSON.stringify(values));
}

function load1RM() {
  return JSON.parse(localStorage.getItem("oneRepMax")) || {
    snatch: 70,
    cleanjerk: 90,
    deadlift: 195,
    bench: 110,
    back: 130,
    front: 110
  };
}

// Navigointi
function navigate(page) {
  const content = document.getElementById("content");
  if (page === "home") renderHome(content);
  if (page === "program") renderProgram(content);
  if (page === "today") renderToday(content);
  if (page === "settings") renderSettings(content);
}

// Etusivu
function renderHome(container) {
  const oneRM = load1RM();
  container.innerHTML = `
    <h2>Syötä 1RM tulokset</h2>
    <form id="rmForm">
      Snatch: <input type="number" name="snatch" value="${oneRM.snatch}"><br>
      Clean & Jerk: <input type="number" name="cleanjerk" value="${oneRM.cleanjerk}"><br>
      Deadlift: <input type="number" name="deadlift" value="${oneRM.deadlift}"><br>
      Bench Press: <input type="number" name="bench" value="${oneRM.bench}"><br>
      Back Squat: <input type="number" name="back" value="${oneRM.back}"><br>
      Front Squat: <input type="number" name="front" value="${oneRM.front}"><br>
      <button type="submit">Tallenna</button>
    </form>
  `;

  document.getElementById("rmForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    Object.keys(values).forEach(k => values[k] = Number(values[k]));
    save1RM(values);
    alert("Tallennettu!");
  });
}

// Ohjelma (selattava päivä kerrallaan)
let currentWeek = 0;
let currentDay = 0;

function renderProgram(container) {
  const oneRM = load1RM();
  const day = program[currentWeek][currentDay];

  container.innerHTML = `
    <h2>${day.day}</h2>
    <div class="program-day">
      ${day.lifts.map(lift => `
        <p>${lift.name}: 
          ${lift.percent ? Math.round(oneRM[getKey(lift.name)] * lift.percent) + " kg" : ""} 
          (${lift.reps})
        </p>
      `).join("")}
    </div>
    <div class="controls">
      <button onclick="prevDay()">Edellinen</button>
      <button onclick="nextDay()">Seuraava</button>
    </div>
  `;
}

function getKey(name) {
  switch (name) {
    case "Snatch": return "snatch";
    case "Clean & Jerk": return "cleanjerk";
    case "Deadlift": return "deadlift";
    case "Bench Press": return "bench";
    case "Back Squat": return "back";
    case "Front Squat": return "front";
    default: return "";
  }
}

function prevDay() {
  if (currentDay > 0) currentDay--;
  else if (currentWeek > 0) { currentWeek--; currentDay = program[currentWeek].length - 1; }
  navigate("program");
}

function nextDay() {
  if (currentDay < program[currentWeek].length - 1) currentDay++;
  else if (currentWeek < program.length - 1) { currentWeek++; currentDay = 0; }
  navigate("program");
}

// Tänään (ottaa viikonpäivän mukaan, yksinkertaistettu)
function renderToday(container) {
  const weekday = new Date().getDay(); // 0=Su, 1=Ma, ...
  const oneRM = load1RM();
  const today = program[0][(weekday-1+7)%3]; // esim. ma-ke-pe logiikka

  container.innerHTML = `
    <h2>${today.day}</h2>
    <div class="program-day">
      ${today.lifts.map(lift => `
        <p>${lift.name}: 
          ${lift.percent ? Math.round(oneRM[getKey(lift.name)] * lift.percent) + " kg" : ""} 
          (${lift.reps})
        </p>
      `).join("")}
    </div>
  `;
}

// Asetukset (vain RM uudelleen)
function renderSettings(container) {
  renderHome(container);
}

// Käynnistys
navigate("home");
