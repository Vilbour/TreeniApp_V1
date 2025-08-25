// --- Data + Storage ---
const LS_KEY = 'wl_state_v4';

const default1RM = {
  snatch: 70,
  cj: 90,
  deadlift: 170,
  frontSquat: 115,
  backSquat: 140,
  bench: 105
};

// Generate default 8-week, 4-day program with rules
function genProgram() {
  const weeks = [];
  const mainRotation = ['Clean & Jerk', 'Snatch', 'Deadlift', 'Squat'];
  const squatWeek = (w) => (w % 2 === 1 ? 'Front Squat' : 'Back Squat'); // odd=Front, even=Back
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

function loadState() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) return JSON.parse(raw);
  return {
    oneRM: {...default1RM},
    program: genProgram(),
    logs: {} // logs["week-day"] = { done, exercises: {idx:[{w,r,done}]}}
  };
}

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}
let state = loadState();

// --- Helpers ---
function kg(x){ return Math.round(x/2.5)*2.5; }
function vib(ms=30){ if (navigator.vibrate) navigator.vibrate(ms); }
function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }
function setActive(tab){
  document.querySelectorAll('.tabbar button').forEach(b=>b.classList.toggle('active', b.dataset.view===tab));
}

// --- Views ---
const view = document.getElementById('view');
const weekStatus = document.getElementById('weekStatus');

function renderHome(){
  setActive('home'); vib(10);
  view.innerHTML = '';
  const totalDays = state.program.length * 4;
  let doneDays = 0;
  for (const w of state.program){
    for (let d=0; d<4; d++){
      const key = `${w.week}-${d+1}`;
      const dayLogs = state.logs[key];
      if (dayLogs && dayLogs.done) doneDays++;
    }
  }
  weekStatus.textContent = `Kokonaiseteneminen: ${doneDays}/${totalDays} päivää`;

  state.program.forEach(w=>{
    const card = el('div','card');
    const head = el('div','card-head');
    const meta = el('div');
    const eyebrow = el('div','eyebrow'); eyebrow.textContent = `Viikko ${w.week} · ${w.phase}`;
    const h3 = el('h3'); h3.textContent = 'Viikon eteneminen';
    meta.appendChild(eyebrow); meta.appendChild(h3);
    const badge = el('div','badge'); badge.textContent = w.badge;
    head.appendChild(meta); head.appendChild(badge);
    const prog = el('div','progress'); const bar = el('div','bar'); prog.appendChild(bar);
    const done = [0,1,2,3].reduce((acc,d)=>{
      const key=`${w.week}-${d+1}`;
      return acc + ((state.logs[key] && state.logs[key].done)?1:0);
    },0);
    bar.style.width = `${(done/4)*100}%`;
    card.appendChild(head); card.appendChild(prog);
    const kicker = el('div','kicker'); kicker.textContent = `Tehty ${done}/4 päivää`;
    card.appendChild(kicker);

    const btn = el('button'); btn.textContent = 'Avaa viikon päivät';
    btn.onclick = ()=>renderWeek(w.week);
    card.appendChild(btn);
    view.appendChild(card);
  });
}

function renderWeek(week){
  setActive('program'); vib(10);
  view.innerHTML='';
  const data = state.program.find(w=>w.week===week);
  const head = el('div','kicker'); head.textContent = `Viikko ${week} – ${data.phase}`;
  view.appendChild(head);

  data.days.forEach((day, idx)=>{
    const card = el('div','card');
    const head = el('div','card-head');
    const meta = el('div');
    const eyebrow = el('div','eyebrow'); eyebrow.textContent = day.title;
    const h3 = el('h3'); h3.textContent = day.main.name;
    meta.appendChild(eyebrow); meta.appendChild(h3);
    const badge = el('div','badge'); badge.textContent = data.badge;
    head.appendChild(meta); head.appendChild(badge);
    card.appendChild(head);

    const prog = el('div','progress'); const bar = el('div','bar'); prog.appendChild(bar);
    const key = `${week}-${idx+1}`;
    const doneSets = getDoneSets(key);
    const totalSets = totalSetsForDay(day);
    bar.style.width = `${Math.min(100, Math.round((doneSets/totalSets)*100))}%`;
    card.appendChild(prog);

    const btn = el('button'); btn.textContent = 'Avaa päivä';
    btn.onclick = ()=>renderDay(week, idx+1);
    card.appendChild(btn);
    view.appendChild(card);
  });
}

function totalSetsForDay(day){
  let t = day.main.sets + day.accessories.reduce((a,x)=>a+x.sets,0) + day.core.sets;
  return t;
}
function getDoneSets(key){
  const ex = state.logs[key]?.exercises || {};
  return Object.values(ex).flat().filter(s=>s.done).length;
}

function renderDay(week, dayIdx){
  setActive('today'); vib(10);
  view.innerHTML = '';
  const data = state.program.find(w=>w.week===week);
  const day = data.days[dayIdx-1];

  const dayCard = el('div','card');
  const head = el('div','card-head');
  const meta = el('div');
  const eyebrow = el('div','eyebrow'); eyebrow.textContent = `Viikko ${week} · ${day.title}`;
  const h3 = el('h3'); h3.textContent = `${day.main.name} — ${day.main.sets}×${day.main.reps}`;
  meta.appendChild(eyebrow); meta.appendChild(h3);
  const badge = el('div','badge'); badge.textContent = data.badge;
  head.appendChild(meta); head.appendChild(badge);
  dayCard.appendChild(head);

  const prog = el('div','progress'); const bar = el('div','bar'); prog.appendChild(bar);
  const key = `${week}-${dayIdx}`;
  const updateBar = ()=>{
    const done = getDoneSets(key);
    const total = totalSetsForDay(day);
    bar.style.width = `${Math.round((done/total)*100)}%`;
  };
  updateBar();
  dayCard.appendChild(prog);
  view.appendChild(dayCard);

  // Render exercises
  const exWrap = el('div','grid');
  view.appendChild(exWrap);

  function renderExercise(ex, i, isMain=false){
    const card = el('div','card');
    const title = el('div','row');
    const left = el('div','title'); left.textContent = ex.name + (isMain? ' (pääliike)':'');
    const right = el('div','suggest');
    let suggestTxt = '';
    if (isMain){
      const rmKeyMap = { 'clean & jerk':'cj', 'snatch':'snatch', 'front squat':'frontSquat', 'back squat':'backSquat', 'deadlift':'deadlift' };
      const mapKey = rmKeyMap[ex.name.toLowerCase()] || '';
      const rm = (mapKey && state.oneRM[mapKey]) ? state.oneRM[mapKey] : 100;
      suggestTxt = `${ex.pctFrom}–${ex.pctTo}% · ${ex.sets}×${ex.reps} · ~${kg(rm*ex.pctFrom/100)}–${kg(rm*ex.pctTo/100)} kg`;
    } else {
      suggestTxt = `${ex.sets}×${ex.reps}`;
    }
    right.textContent = suggestTxt;
    const row = el('div','row'); row.appendChild(left); row.appendChild(right);
    card.appendChild(row);

    // sets
    const setsWrap = el('div','sets');
    const total = ex.sets;
    const logs = ensureDayLog(key);
    if (!logs.exercises) logs.exercises = {};
    if (!logs.exercises[i]) logs.exercises[i] = [];
    while (logs.exercises[i].length < total) logs.exercises[i].push({w:null, r:null, done:false});
    // render inputs
    logs.exercises[i].forEach((s, sIdx)=>{
      const sEl = el('div','set');
      const wInput = el('input'); wInput.className='w'; wInput.type='number'; wInput.step='0.5'; wInput.placeholder='kg';
      const rInput = el('input'); rInput.className='r'; rInput.type='number'; rInput.placeholder='toistot';
      if (s.w!=null) wInput.value = s.w;
      if (s.r!=null) rInput.value = s.r;
      const btn = el('button'); btn.className='small check'; btn.textContent = s.done?'✓':'○';
      btn.onclick = ()=>{ s.done = !s.done; btn.textContent = s.done?'✓':'○'; vib(25); saveState(); updateBar(); };
      wInput.onchange = ()=>{ s.w = parseFloat(wInput.value||'0'); saveState(); };
      rInput.onchange = ()=>{ s.r = parseInt(rInput.value||'0'); saveState(); };
      sEl.appendChild(wInput); sEl.appendChild(rInput); sEl.appendChild(btn);
      setsWrap.appendChild(sEl);
    });
    card.appendChild(setsWrap);

    // actions
    const act = el('div','actions');
    const add = el('button'); add.className='ghost small'; add.textContent='+ Sarja';
    add.onclick = ()=>{ logs.exercises[i].push({w:null,r:null,done:false}); vib(15); saveState(); renderDay(week,dayIdx); };
    const rem = el('button'); rem.className='ghost small'; rem.textContent='– Sarja';
    rem.onclick = ()=>{ logs.exercises[i].pop(); vib(15); saveState(); renderDay(week,dayIdx); };
    const doneBtn = el('button'); doneBtn.className='ghost small'; doneBtn.textContent='Merkitse liike tehdyksi';
    doneBtn.onclick = ()=>{ logs.exercises[i].forEach(s=>s.done=true); vib(40); saveState(); renderDay(week,dayIdx); };
    act.appendChild(add); act.appendChild(rem); act.appendChild(doneBtn);
    card.appendChild(act);

    exWrap.appendChild(card);
  }

  renderExercise(day.main, 0, true);
  day.accessories.forEach((a, idx)=>renderExercise(a, idx+1, false));
  renderExercise(day.core, day.accessories.length+1, false);

  // Footer controls
  const f = el('div','card');
  const dayDone = el('button'); dayDone.textContent = 'Merkitse päivä tehdyksi';
  dayDone.onclick = ()=>{
    ensureDayLog(key);
    state.logs[key].done = true; saveState(); vib(60);
    renderWeek(week);
  };
  f.appendChild(dayDone);

  const edit = el('button'); edit.className='ghost'; edit.textContent='Muokkaa päivän liikkeitä';
  edit.onclick = ()=> editDay(week, dayIdx);
  f.appendChild(edit);
  view.appendChild(f);
}

function ensureDayLog(key){
  if (!state.logs[key]) state.logs[key] = { sets:[], done:false, exercises:{} };
  return state.logs[key];
}

// --- Editor ---
const dlg = document.getElementById('dlgExercise');
const exName = document.getElementById('exName');
const exSets = document.getElementById('exSets');
const exReps = document.getElementById('exReps');
const exPct  = document.getElementById('exPct');

function editDay(week, dayIdx){
  view.innerHTML='';
  const w = state.program.find(x=>x.week===week);
  const d = w.days[dayIdx-1];

  const card = el('div','card');
  const h = el('div','card-head');
  const meta = el('div'); const e = el('div','eyebrow'); e.textContent = `Muokkaus`; const h3 = el('h3'); h3.textContent = `Viikko ${week} · ${d.title}`; meta.appendChild(e); meta.appendChild(h3);
  const b = el('div','badge'); b.textContent = w.badge;
  h.appendChild(meta); h.appendChild(b);
  card.appendChild(h);

  function renderList(){
    card.querySelectorAll('.exercise').forEach(x=>x.remove());
    const list = [
      {ex:d.main, label:'(pääliike)', main:true},
      ...d.accessories.map(x=>({ex:x,label:'',main:false})),
      {ex:d.core, label:'(core)', main:false}
    ];
    list.forEach((item)=>{
      const exDiv = el('div','exercise');
      const row = el('div','row');
      const t = el('div','title'); t.textContent = item.ex.name + ' ' + item.label; row.appendChild(t);
      const sub = el('div','suggest'); sub.textContent = `${item.ex.sets}×${item.ex.reps}${item.ex.pctFrom?` @ ${item.ex.pctFrom}–${item.ex.pctTo}%`:''}`;
      row.appendChild(sub); exDiv.appendChild(row);
      const act = el('div','actions');
      const btnE = el('button'); btnE.className='ghost small'; btnE.textContent='Muokkaa';
      btnE.onclick = ()=>{ openEditor(item.ex, (updated)=>{ Object.assign(item.ex, updated); saveState(); renderList(); }); };
      const btnDel = el('button'); btnDel.className='ghost small'; btnDel.textContent='Poista';
      btnDel.onclick = ()=>{
        if (item.main){ alert('Pääliikettä ei voi poistaa.'); return; }
        const i = d.accessories.indexOf(item.ex);
        if (i>=0) d.accessories.splice(i,1); else d.core = {name:'Plank', sets:3, reps:30};
        saveState(); renderList();
      };
      act.appendChild(btnE);
      if (!item.main) act.appendChild(btnDel);
      exDiv.appendChild(act);
      card.appendChild(exDiv);
    });
  }
  renderList();

  const addWrap = el('div','actions');
  const addAcc = el('button'); addAcc.textContent = '+ Lisää apuliike'; addAcc.className='ghost';
  addAcc.onclick = ()=>{
    openEditor({name:'', sets:3, reps:10}, (u)=>{ d.accessories.push(u); saveState(); renderList(); });
  };
  const addCore = el('button'); addCore.textContent = '+ Lisää core'; addCore.className='ghost';
  addCore.onclick = ()=>{
    openEditor({name:'Plank', sets:3, reps:30}, (u)=>{ d.core = u; saveState(); renderList(); });
  };
  addWrap.appendChild(addAcc); addWrap.appendChild(addCore);
  card.appendChild(addWrap);

  const back = el('button'); back.textContent='Valmis – takaisin päivään';
  back.onclick = ()=> renderDay(week, dayIdx);
  card.appendChild(back);

  view.appendChild(card);
}

function openEditor(ex, onSave){
  exName.value = ex.name || '';
  exSets.value = ex.sets || 3;
  exReps.value = ex.reps || 5;
  exPct.value  = ex.pctFrom || '';
  dlg.returnValue = '';
  dlg.showModal();
  dlg.querySelector('#btnSaveExercise').onclick = (ev)=>{
    ev.preventDefault();
    const updated = {
      name: exName.value.trim(),
      sets: parseInt(exSets.value||'1'),
      reps: parseInt(exReps.value||'1')
    };
    const pct = parseInt(exPct.value||'0');
    if (pct>0){ updated.pctFrom = pct; updated.pctTo = pct; }
    dlg.close();
    vib(20);
    onSave(updated);
  };
}

// --- Settings ---
function renderSettings(){
  setActive('settings'); vib(10);
  view.innerHTML='';
  const card = el('div','card');
  const head = el('div','card-head'); const m = el('div'); const e = el('div','eyebrow'); e.textContent='1RM asetukset'; const h3 = el('h3'); h3.textContent='Syötä 1RM (kg)'; m.appendChild(e); m.appendChild(h3);
  head.appendChild(m); card.appendChild(head);

  const grid = el('div','grid');
  Object.entries(state.oneRM).forEach(([k,v])=>{
    const c = el('div','exercise');
    const r = el('div','row'); const t=el('div','title'); t.textContent = k; r.appendChild(t);
    c.appendChild(r);
    const set = el('div','set');
    const input = el('input'); input.type='number'; input.step='0.5'; input.value=v;
    const save = el('button'); save.className='small'; save.textContent='Tallenna';
    save.onclick = ()=>{ state.oneRM[k]=parseFloat(input.value||'0'); saveState(); vib(20); };
    set.appendChild(input); set.appendChild(save); c.appendChild(set);
    grid.appendChild(c);
  });
  card.appendChild(grid);
  view.appendChild(card);

  const reset = el('button'); reset.className='ghost'; reset.textContent='Nollaa data (varovasti)';
  reset.onclick = ()=>{ if (confirm('Poistetaanko kaikki kirjaukset ja ohjelma?')) { localStorage.removeItem(LS_KEY); state=loadState(); vib(60); renderHome(); } };
  view.appendChild(reset);
}

// --- Program root ---
function renderProgram(){
  setActive('program'); vib(10);
  view.innerHTML='';
  state.program.forEach(w=>{
    const card = el('div','card');
    const head = el('div','card-head');
    const meta = el('div'); const e = el('div','eyebrow'); e.textContent = `Viikko ${w.week}`; const h3=el('h3'); h3.textContent=w.phase; meta.appendChild(e); meta.appendChild(h3);
    const b = el('div','badge'); b.textContent = w.badge;
    head.appendChild(meta); head.appendChild(b);
    card.appendChild(head);

    const prog = el('div','progress'); const bar = el('div','bar'); prog.appendChild(bar);
    const done = [0,1,2,3].reduce((acc,d)=>acc + ((state.logs[`${w.week}-${d+1}`]?.done)?1:0), 0);
    bar.style.width = `${(done/4)*100}%`; card.appendChild(prog);
    const btn = el('button'); btn.textContent='Avaa viikon päivät'; btn.onclick=()=>renderWeek(w.week);
    card.appendChild(btn);
    view.appendChild(card);
  });
}

// --- Today ---
function renderToday(){
  setActive('today'); vib(10);
  view.innerHTML='';
  const card = el('div','card');
  const head = el('div','card-head'); const m=el('div'); const e=el('div','eyebrow'); e.textContent='Tänään'; const h3=el('h3'); h3.textContent='Valitse viikko & päivä'; m.appendChild(e); m.appendChild(h3); head.appendChild(m); card.appendChild(head);
  const set = el('div','set');
  const wk = el('input'); wk.type='number'; wk.min=1; wk.max=8; wk.placeholder='Viikko (1-8)';
  const dy = el('input'); dy.type='number'; dy.min=1; dy.max=4; dy.placeholder='Päivä (1-4)';
  const go = el('button'); go.className='small'; go.textContent='Avaa';
  go.onclick = ()=>{
    const w = parseInt(wk.value||'1'); const d = parseInt(dy.value||'1');
    renderDay(w,d);
  };
  set.appendChild(wk); set.appendChild(dy); set.appendChild(go);
  card.appendChild(set);
  view.appendChild(card);
}

// --- Import/Export ---
document.getElementById('btnExport').onclick = ()=>{
  vib(10);
  const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'treenipäiväkirja_backup.json';
  a.click();
};
document.getElementById('btnImport').onclick = ()=> document.getElementById('fileImport').click();
document.getElementById('fileImport').onchange = (e)=>{
  const file = e.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = ()=>{ try{ state = JSON.parse(r.result); saveState(); vib(30); renderHome(); } catch(err){ alert('Virheellinen tiedosto'); } };
  r.readAsText(file);
};

// --- Routing ---
document.querySelectorAll('.tabbar button').forEach(b=>{
  b.onclick = ()=>{
    const v = b.dataset.view;
    if (v==='home') renderHome();
    if (v==='program') renderProgram();
    if (v==='today') renderToday();
    if (v==='settings') renderSettings();
  };
});

// Initial
renderHome();

// Register SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js');
  });
}
