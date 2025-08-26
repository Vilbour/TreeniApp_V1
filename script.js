// Tallennetaan RM-tulokset localStorageen
document.getElementById('rmForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const data = {
    snatch: document.getElementById('snatch').value,
    cleanjerk: document.getElementById('cleanjerk').value,
    backsquat: document.getElementById('backsquat').value,
    frontsquat: document.getElementById('frontsquat').value,
    bench: document.getElementById('bench').value,
    deadlift: document.getElementById('deadlift').value,
  };
  localStorage.setItem('rmData', JSON.stringify(data));
  alert('Tallennettu!');
});

// Sivujen vaihto
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// --- Ohjelma ---
let currentDay = 1;
const totalDays = 5;

// Esimerkkiohjelma
const program = {
  1: ["Snatch 5x3 @70%", "C&J 5x2 @75%", "Takakyykky 5x5 @70%"],
  2: ["Penkki 5x5 @70%", "Mave 5x3 @75%", "Etukyykky 4x5 @65%"],
  3: ["Snatch 6x2 @75%", "C&J 6x2 @80%", "Takakyykky 5x5 @75%"],
  4: ["Penkki 5x3 @75%", "Mave 5x2 @80%", "Etukyykky 5x3 @70%"],
  5: ["Snatch max", "C&J max", "Kevyt takakyykky 3x5"],
};

function renderProgram() {
  const content = document.getElementById('programContent');
  content.innerHTML = "";
  program[currentDay].forEach(ex => {
    const li = document.createElement('p');
    li.textContent = ex;
    content.appendChild(li);
  });
  document.getElementById('dayIndicator').textContent = "Päivä " + currentDay;
}
renderProgram();

function nextDay() {
  if (currentDay < totalDays) {
    currentDay++;
    renderProgram();
  }
}

function prevDay() {
  if (currentDay > 1) {
    currentDay--;
    renderProgram();
  }
}

// --- Tänään ---
function renderToday() {
  const content = document.getElementById('todayContent');
  content.innerHTML = "";
  program[currentDay].forEach(ex => {
    const li = document.createElement('p');
    li.textContent = ex;
    content.appendChild(li);
  });
}
showPage('home');
