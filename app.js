let pages = document.querySelectorAll('.page');
function navigate(id) {
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// 1RM:t localStorage
let rm = JSON.parse(localStorage.getItem('rm')) || {
  snatch: 70,
  cj: 90,
  deadlift: 170,
  bench: 105,
  backsquat: 140,
  frontsquat: 115
};

function saveRM(e) {
  e.preventDefault();
  const form = e.target;
  for (let key in rm) {
    rm[key] = Number(form[key].value);
  }
  localStorage.setItem('rm', JSON.stringify(rm));
  generateProgram();
}

document.getElementById('settings-form').addEventListener('submit', saveRM);

// Täydellinen 8 viikon ohjelma
const programTemplate = [
  { week: 1, type: 'kevyempi', exercises: ['snatch','cj','deadlift','frontsquat','backsquat'] },
  { week: 2, type: 'sarjapaino', exercises: ['snatch','cj','deadlift','frontsquat','backsquat'] },
  { week: 3, type: 'sarjapaino', exercises: ['snatch','cj','deadlift','frontsquat','backsquat'] },
  { week: 4, type: 'sarjapaino', exercises: ['snatch','cj','deadlift','frontsquat','backsquat'] },
  { week: 5, type: 'voima', exercises: ['snatch','cj','deadlift','frontsquat','backsquat'] },
  { week: 6, type: 'voima', exercises: ['snatch','cj','deadlift','frontsquat','backsquat'] },
  { week: 7, type: 'voima', exercises: ['snatch','cj','deadlift','frontsquat','backsquat'] },
  { week: 8, type: 'max', exercises: ['snatch','cj','deadlift','frontsquat','backsquat'] }
];

function calcWeight(base, type) {
  switch(type) {
    case 'kevyempi': return Math.round(base*0.5);
    case 'sarjapaino': return Math.round(base*0.7);
    case 'voima': return Math.round(base*0.85);
    case 'max': return base;
  }
}

function generateProgram() {
  const container = document.getElementById('program-container');
  container.innerHTML = '';
  programTemplate.forEach(w => {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'week';
    const h3 = document.createElement('h3');
    h3.textContent = `Viikko ${w.week} (${w.type})`;
    weekDiv.appendChild(h3);

    w.exercises.forEach(ex => {
      const div = document.createElement('div');
      div.className = 'exercise';
      const name = document.createElement('span');
      name.textContent = ex.charAt(0).toUpperCase() + ex.slice(1);
      const weight = document.createElement('span');
      weight.textContent = calcWeight(rm[ex], w.type) + ' kg';
      div.appendChild(name);
      div.appendChild(weight);
      weekDiv.appendChild(div);

      // Progressbar
      const bar = document.createElement('div');
      bar.className = 'progress-bar';
      bar.style.width = (calcWeight(rm[ex], w.type)/rm[ex]*100) + '%';
      weekDiv.appendChild(bar);
    });

    container.appendChild(weekDiv);
  });
}

// Alustetaan ohjelma heti
generateProgram();
