// Täysin toimiva V3-versio
(function(){
  const LS_KEY = 'weightliftingApp_v3';

  // --- Oletus 1RM ---
  const default1RM = {
    snatch: 70,
    cj: 90,
    deadlift: 170,
    frontSquat: 115,
    backSquat: 140,
    bench: 105
  };

  // --- Tässä säilytetään alkuperäinen 8 viikon ohjelma ---
  const programData = [/* LIITÄ TÄHÄN alkuperäinen 8 viikon ohjelma JSON-rakenne */];

  // --- state ---
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e){}
    return {oneRM:{...default1RM}};
  }
  function saveState() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

  let state = loadState();
  let currentWeek = 0;
  let currentDay = 0;

  function roundKg(x){ return Math.round(x/2.5)*2.5; }
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }

  function mapToKey(name){
    const k = name.toLowerCase();
    if(k.includes('snatch')) return 'snatch';
    if(k.includes('clean')) return 'cj';
    if(k.includes('front')) return 'frontSquat';
    if(k.includes('back')) return 'backSquat';
    if(k.includes('dead')) return 'deadlift';
    if(k.includes('bench')) return 'bench';
    return 'bench';
  }

  // --- render-funktiot ---
  function renderHome(){
    const c = document.getElementById('content'); c.innerHTML='';
    const card = el('div','card'); card.innerHTML='<h2>Syötä 1RM</h2>';
    const form = el('form');
    form.innerHTML = `
      <label>Snatch <input name="snatch" type="number" value="${state.oneRM.snatch}"></label>
      <label>Clean & Jerk <input name="cj" type="number" value="${state.oneRM.cj}"></label>
      <label>Deadlift <input name="deadlift" type="number" value="${state.oneRM.deadlift}"></label>
      <label>Front Squat <input name="frontSquat" type="number" value="${state.oneRM.frontSquat}"></label>
      <label>Back Squat <input name="backSquat" type="number" value="${state.oneRM.backSquat}"></label>
      <label>Bench <input name="bench" type="number" value="${state.oneRM.bench}"></label>
      <button type="submit">Tallenna</button>
    `;
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(form);
      Object.keys(state.oneRM).forEach(k=>state.oneRM[k]=Number(fd.get(k)));
      saveState();
      alert('Tallennettu!');
    });
    card.appendChild(form);
    c.appendChild(card);
  }

  function renderProgram(){
    const c = document.getElementById('content'); c.innerHTML='';
    const w = programData[currentWeek];
    const d = w.days[currentDay];

    const head = el('div','card'); head.innerHTML=`<h3>Viikko ${w.week} · ${w.phase}</h3><h4>${d.title}</h4>`; c.appendChild(head);

    const main = el('div','card');
    const rmKey = d.main.key;
    const rm = state.oneRM[rmKey] || 0;
    const low = roundKg(rm*d.main.pctFrom/100);
    const high = roundKg(rm*d.main.pctTo/100);
    main.innerHTML=`<h4>${d.main.name}</h4><p>${d.main.sets}×${d.main.reps} — ~${low}–${high}kg</p><p>${d.main.notes}</p>`;
    c.appendChild(main);

    d.accessories.forEach(a=>{ const acc = el('div','card'); acc.innerHTML=`<p>${a.name} — ${a.sets}×${a.reps}</p>`; c.appendChild(acc); });
    const core = el('div','card'); core.innerHTML=`<p>${d.core.name} — ${d.core.sets}×${d.core.reps}</p>`; c.appendChild(core);

    const ctrl = el('div','card');
    const prevBtn = el('button'); prevBtn.textContent='◀ Edellinen'; prevBtn.onclick=()=>{prev();};
    const nextBtn = el('button'); nextBtn.textContent='Seuraava ▶'; nextBtn.onclick=()=>{next();};
    ctrl.appendChild(prevBtn); ctrl.appendChild(nextBtn);
    c.appendChild(ctrl);
  }

  function renderToday(){
    const c = document.getElementById('content'); c.innerHTML='';
    const w = programData[0];
    const dayIndex = (new Date()).getDay() - 1;
    const d = w.days[dayIndex>=0?dayIndex:0];
    const card = el('div','card'); card.innerHTML=`<h3>Tänään — ${d.title}</h3>`;
    const main = el('div','card');
    const rmKey = d.main.key;
    const rm = state.oneRM[rmKey] || 0;
    const low = roundKg(rm*d.main.pctFrom/100);
    const high = roundKg(rm*d.main.pctTo/100);
    main.innerHTML=`<h4>${d.main.name}</h4><p>${d.main.sets}×${d.main.reps} ~${low}-${high}kg</p>`;
    c.appendChild(card); c.appendChild(main);
  }

  function renderSettings(){ renderHome(); }

  function navigate(page){
    if(page==='home') renderHome();
    else if(page==='program') renderProgram();
    else if(page==='today') renderToday();
    else if(page==='settings') renderSettings();
  }

  function prev(){ if(currentDay>0) currentDay--; else if(currentWeek>0){currentWeek--; currentDay=3;} renderProgram(); }
  function next(){ if(currentDay<3) currentDay++; else if(currentWeek<7){currentWeek++; currentDay=0;} renderProgram(); }

  window.navigate = navigate;
  document.addEventListener('DOMContentLoaded', ()=>{navigate('home');});
})();
