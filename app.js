(function(){
  const LS_KEY = 'wl_state_v4_fixed';

  // Oletus 1RM
  const default1RM = {
    snatch: 70,
    cj: 90,
    deadlift: 170,
    frontSquat: 115,
    backSquat: 140,
    bench: 105
  };

  // --- Program generator (täsmälleen alkuperäinen 8 viikkoa) ---
  function genProgram() {
    const weeks = [];
    const mainRotation = ['Clean & Jerk', 'Snatch', 'Deadlift', 'Squat'];
    const squatWeek = (w) => (w % 2 === 1 ? 'Front Squat' : 'Back Squat');
    const phases = {
      1:{label:'Tekniikka', pct: {CJ:[60,65], SN:[60,65], SQ:[60,70], DL:[60,70]}},
      2:{label:'Rakenna',   pct: {CJ:[70,75], SN:[70,75], SQ:[70,80], DL:[70,80]}},
      3:{label:'Rakenna',   pct: {CJ:[75,80], SN:[75,80], SQ:[75,85], DL:[75,85]}},
      4:{label:'Rakenna',   pct: {CJ:[80,82], SN:[78,82], SQ:[80,87], DL:[78,85]}},
      5:{label:'Voima',     pct: {CJ:[80,85], SN:[78,83], SQ:[82,88], DL:[80,88]}},
      6:{label:'Voima',     pct: {CJ:[83,87], SN:[80,85], SQ:[85,90], DL:[82,90]}},
      7:{label:'Voima',     pct: {CJ:[85,88], SN:[82,86], SQ:[87,92], DL:[85,92]}},
      8:{label:'Maksimit',  pct: {CJ:[90,100],SN:[90,100],SQ:[90,100],DL:[90,100]}}
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
          if (w===1) return {sets:4, reps:3, notes:'Tekniikkapainotus'};
          if (w<=4) return {sets:5, reps:3, notes:'Rakenna sarjapainoja'};
          if (w<=7) return {sets:5, reps:2, notes:'Voimapainotus'};
          return {sets:5, reps:1, notes:'Maksimiykköset'};
        })();

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
        const accessoryCount = 2 + (w%3===0 ? 2:1);
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
      weeks.push({week:w, phase:phase.label, days});
    }
    return weeks;
  }

  // --- state ---
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e){}
    return {oneRM:{...default1RM}, program: genProgram()};
  }
  function saveState() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

  let state = loadState();
  let currentWeek = 0;
  let currentDay = 0;

  // --- helpers ---
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

  // --- render ---
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
    const w = state.program[currentWeek];
    const d = w.days[currentDay];

    const head = el('div','card'); head.innerHTML=`<h3>Viikko ${w.week} · ${w.phase}</h3><h4>${d.title}</h4>`; c.appendChild(head);

    const main = el('div','card'); 
    const rm = state.oneRM[mapToKey(d.main.name)];
    const low = roundKg(rm*d.main.pctFrom/100), high = roundKg(rm*d.main.pctTo/100);
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
    const w = state.program[0]; 
    const weekday = (new Date()).getDay(); 
    const dayIndex = weekday<=0 ? 0 : ((weekday-1)%4);
    const d = w.days[dayIndex];
    const card = el('div','card'); card.innerHTML=`<h3>Tänään — ${d.title}</h3>`;
    const main = el('div','card'); const rm = state.oneRM[mapToKey(d.main.name)];
    const low = roundKg(rm*d.main.pctFrom/100), high = roundKg(rm*d.main.pctTo/100);
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
  function prev(){ if(currentDay>0) currentDay--; else if(currentWeek>0){currentWeek--; currentDay=3;} renderProgram();}
  function next(){ if(currentDay<3) currentDay++; else if(currentWeek<7){currentWeek++; currentDay=0;} renderProgram(); }

  window.navigate = navigate;
  document.addEventListener('DOMContentLoaded', ()=>{navigate('home');});
})();
