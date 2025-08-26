/* app.js - korjattu versio
   - säilyttää alkuperäisen 8 viikon generaattorin (EI MUUTETA!)
   - navigointi: home / program / today / settings
   - Program näyttää 1 päivä per view, prev/next -napit
   - 1RM tallennus localStorageen
   - palauta mahdolliset virheilmoitukset konsoliin
*/

(function(){
  const LS_KEY = 'wl_state_v4_fixed';

  // Oletus 1RM (voit muuttaa etusivulta)
  const default1RM = {
    snatch: 70,
    cj: 90,
    deadlift: 170,
    frontSquat: 115,
    backSquat: 140,
    bench: 105
  };

  // --- Program generator (SAMA LOGIIKKA kuin aiemmin, älä MUUTA sisältöä) ---
  function genProgram() {
    const weeks = [];
    const mainRotation = ['Clean & Jerk', 'Snatch', 'Deadlift', 'Squat'];
    const squatWeek = (w) => (w % 2 === 1 ? 'Front Squat' : 'Back Squat');
    const phases = {
      1:{label:'Tekniikka', badge:'TEKNIikka', pct: {CJ:[60,65], SN:[60,65], SQ:[60,70], DL:[60,70]}},
      2:{label:'Rakenna',   badge:'RAKENNA',   pct: {CJ:[70,75], SN:[70,75], SQ:[70,80], DL:[70,80]}},
      3:{label:'Rakenna',   badge:'RAKENNA',   pct: {CJ:[75,80], SN:[75,80], SQ:[75,85], DL:[75,85]}},
      4:{label:'Rakenna',   badge:'RAKENNA',   pct: {CJ:[80,82], SN:[78,82], SQ:[80,87], DL:[78,85]}},
      5:{label:'Voima',     badge:'VOIMA',     pct: {CJ:[80,85], SN:[78,83], SQ:[82,88], DL:[80,88]}},
      6:{label:'Voima',     badge:'VOIMA',     pct: {CJ:[83,87], SN:[80,85], SQ:[85,90], DL:[82,90]}},
      7:{label:'Voima',     badge:'VOIMA',     pct: {CJ:[85,88], SN:[82,86], SQ:[87,92], DL:[85,92]}},
      8:{label:'Maksimit',  badge:'MAKSIMI',   pct: {CJ:[90,100],SN:[90,100],SQ:[90,100],DL:[90,100]}}
    };
    const accessoriesBase = {
      pull:['Penkkipunnerrus','Kulmasoutu', 'Leuanveto', 'Pystypunnerrus'],
      legs:['Askelkyykky', 'Reidenkoukistus', 'Reidenojennus', 'Bulgarialainen kyykky'],
      posterior:['Hip thrust', 'Glute ham raise', 'Selänojennus', 'Romanian deadlift'],
      push:['Dippi', 'Rintaprässi', 'Flyes käsipainoilla', 'Arnold press']
    };
    const coreStrength = ['Painotettu hollow hold', 'Painotettu russian twist', 'Kahvakuula-farmarikävely', 'Turkish get-up'];
    const coreEndurance = ['Hollow hold', 'Plank', 'Side plank', 'Dead bug'];

    for (let w = 1; w <= 8; w++) {
      const phase = phases[w];
      const days = [];
      for (let d = 0; d < 4; d++) {
        let main = mainRotation[d];
        if (main === 'Squat') main = squatWeek(w);
        const mainKey = (n)=>{
          const k = n.toLowerCase();
          if (k.includes('clean')) return 'cj';
          if (k.includes('snatch')) return 'snatch';
          if (k.includes('front')) return 'frontSquat';
          if (k.includes('back')) return 'backSquat';
          if (k.includes('dead')) return 'deadlift';
          return 'bench';
        };
        const pctRange = (()=>{
          if (main.includes('Clean')) return phase.pct.CJ;
          if (main.includes('Snatch')) return phase.pct.SN;
          if (main.includes('Squat')) return phase.pct.SQ;
          if (main.includes('Dead')) return phase.pct.DL;
          return [65,75];
        })();
        const pct = w===8 ? [95, 100] : pctRange;
        const setsReps = (()=>{
          if (w===1) return {sets:4, reps:3, notes:'Tekniikkapainotus, pysähdyksiä ja nostoja alustalla'};
          if (w<=4) return {sets:5, reps:3, notes:'Rakenna sarjapainoja nousujohteisesti'};
          if (w<=7) return {sets:5, reps:2, notes:'Voimapainotus, pidemmät palautukset'};
          return {sets:5, reps:1, notes:'Maksimiykköset, hyvät lämmöt ja spottaus'};
        })();

        // accessories 2-4
        function pick(arr, n){
          const a = [...arr];
          const out = [];
          while (out.length < n && a.length) {
            const i = Math.floor(Math.random()*a.length);
            out.push(a.splice(i,1)[0]);
          }
          return out;
        }
        const accPool = [
          ...pick(accessoriesBase.pull,1),
          ...pick(accessoriesBase.push,1),
          ...pick(accessoriesBase.legs,1),
          ...pick(accessoriesBase.posterior,1)
        ];
        const accessoryCount = 2 + (w%3===0 ? 2:1); // 2–4 vaihtelua
        const accessories = pick(accPool, accessoryCount).map(n=>({name:n, sets:3, reps:10}));

        const core = (w%2===0?coreStrength:coreEndurance);
        const coreSel = pick(core, 1)[0];

        days.push({
          title: `Päivä ${d+1}`,
          main: { name: main, pctFrom: pct[0], pctTo: pct[1], ...setsReps, key: mainKey(main) },
          accessories,
          core: { name: coreSel, sets: (w%2===0?4:3), reps: (w%2===0?8:20) }
        });
      }
      weeks.push({week:w, phase:phase.label, badge:phase.badge, days});
    }
    return weeks;
  }

  // --- State (load/save) ---
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e){
      console.error('loadState error', e);
    }
    return {
      oneRM: {...default1RM},
      program: genProgram(),
      logs: {}
    };
  }
  function saveState() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch(e){
      console.error('saveState error', e);
    }
  }

  // --- small helpers ---
  function roundKg(x){ return Math.round(x/2.5)*2.5; }
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }
  function mapToKey(name){
    const k = name.toLowerCase();
    if (k.includes('snatch')) return 'snatch';
    if (k.includes('clean')) return 'cj';
    if (k.includes('front')) return 'frontSquat';
    if (k.includes('back')) return 'backSquat';
    if (k.includes('dead')) return 'deadlift';
    if (k.includes('bench')) return 'bench';
    return Object.keys(state.oneRM)[0];
  }

  // --- application state ---
  let state = loadState();
  let currentWeek = 0;
  let currentDay = 0;

  // --- renderers ---
  function renderHome(){
    const container = document.getElementById('content') || document.body;
    container.innerHTML = '';
    const card = el('div','card');
    const h = el('h2'); h.textContent = 'Syötä 1RM tulokset'; card.appendChild(h);

    const form = el('form');
    form.innerHTML = `
      <label>Snatch <input name="snatch" type="number" value="${state.oneRM.snatch}"></label><br>
      <label>Clean & Jerk <input name="cj" type="number" value="${state.oneRM.cj}"></label><br>
      <label>Deadlift <input name="deadlift" type="number" value="${state.oneRM.deadlift}"></label><br>
      <label>Front Squat <input name="frontSquat" type="number" value="${state.oneRM.frontSquat}"></label><br>
      <label>Back Squat <input name="backSquat" type="number" value="${state.oneRM.backSquat}"></label><br>
      <label>Bench <input name="bench" type="number" value="${state.oneRM.bench}"></label><br>
      <button type="submit">Tallenna</button>
      <button type="button" id="goProgram">Avaa ohjelma</button>
    `;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      Object.keys(state.oneRM).forEach(k => {
        const val = Number(fd.get(k));
        if (!isNaN(val) && val>0) state.oneRM[k]=val;
      });
      saveState();
      alert('1RM tallennettu');
    });
    card.appendChild(form);
    container.appendChild(card);

    // quick info card
    const info = el('div','card');
    info.innerHTML = `<p>Kokonaisohjelma: 8 viikkoa. Pääliikkeet kiertävät viikoittain — ei kaikkia yhdessä päivässä.</p>`;
    container.appendChild(info);

    // go program button handler
    setTimeout(()=>{
      const btn = document.getElementById('goProgram');
      if (btn) btn.addEventListener('click', ()=>{ navigate('program'); });
    }, 0);
  }

  function renderProgram(){
    const container = document.getElementById('content') || document.body;
    container.innerHTML = '';
    const weeks = state.program;

    // clamp indexes
    if (currentWeek < 0) currentWeek = 0;
    if (currentWeek > weeks.length-1) currentWeek = weeks.length-1;
    if (currentDay < 0) currentDay = 0;
    if (currentDay > weeks[currentWeek].days.length-1) currentDay = weeks[currentWeek].days.length-1;

    const w = weeks[currentWeek];
    const d = w.days[currentDay];

    const headCard = el('div','card');
    headCard.innerHTML = `<div><strong>Viikko ${w.week} · ${w.phase}</strong></div><div>${d.title}</div>`;
    container.appendChild(headCard);

    // main lift card
    const mainCard = el('div','card');
    const main = d.main;
    const rmKey = mapToKey(main.name);
    const rmVal = state.oneRM[rmKey] || 0;
    const low = roundKg(rmVal * (main.pctFrom/100));
    const high = roundKg(rmVal * (main.pctTo/100));
    mainCard.innerHTML = `<h3>${main.name} (pääliike)</h3>
      <p>${main.sets}×${main.reps} — ${main.pctFrom}%–${main.pctTo}% → noin ${low}–${high} kg</p>
      <p class="muted">${main.notes || ''}</p>`;
    container.appendChild(mainCard);

    // accessories
    d.accessories.forEach((acc,i)=>{
      const c = el('div','card');
      c.innerHTML = `<h4>${acc.na
