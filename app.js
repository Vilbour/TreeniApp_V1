/* TreeniApp v1.0 - toimiva versio
   - generaattori 8 viikkoa x 4 päivää
   - muokattavat 1RM-asetukset (tallentuu localStorage)
   - päivä- ja viikkoprogess, päivä avattavissa
   - vie/tuo JSON (backup)
*/
(() => {
  const LS_KEY = 'treeniapp_v1';
  const default1RM = { Snatch:70, 'Clean & Jerk':90, Deadlift:170, 'Front Squat':115, 'Back Squat':140, 'Bench':105 };

  // --- state ---
  let state = loadState();

  // --- DOM refs ---
  const tabs = document.querySelectorAll('.tabs button');
  const view = document.getElementById('view');
  const tmplWeek = document.getElementById('tmpl-week');
  const tmplDay = document.getElementById('tmpl-day');
  const fileImport = document.getElementById('fileImport');
  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');

  // Init
  document.addEventListener('DOMContentLoaded', init);

  function init(){
    attachTabHandlers();
    renderHome();
    attachImportExport();
  }

  function attachTabHandlers(){
    tabs.forEach(b => b.addEventListener('click', e=>{
      tabs.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const viewName = b.dataset.view;
      if(viewName==='home') renderHome();
      if(viewName==='program') renderProgram();
      if(viewName==='today') renderTodayPicker();
      if(viewName==='settings') renderSettings();
    }));
  }

  // --- State helpers ---
  function loadState(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    // fallback
    return {
      oneRM: default1RM,
      program: buildProgram(), // generated
      logs: {} // keys: "w-d" -> { done:Boolean, exercises: { idx:[{w,r,done}] } }
    };
  }
  function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

  // --- Program generator (rules from brief) ---
  function buildProgram(){
    const weeks = [];
    // rotation: day1 Snatch, day2 C&J, day3 Squat (Front/Back alternating), day4 Deadlift
    for(let w=1; w<=8; w++){
      const phase = (w===1) ? 'Tekniikka' : (w<=4 ? 'Rakenna' : (w<=7 ? 'Voima' : 'Maksimit'));
      const squat = (w%2===1) ? 'Front Squat' : 'Back Squat';
      const days = [
        makeDay('Snatch', w, phase),
        makeDay('Clean & Jerk', w, phase),
        makeDay(squat, w, phase),
        makeDay('Deadlift', w, phase)
      ];
      weeks.push({ week:w, phase, days });
    }
    return weeks;
  }

  function makeDay(name, week, phase){
    // set/reps rules
    let sets=4, reps=3;
    if(week===1){ sets=4; reps=3; }         // Tekniikka (lighter)
    else if(week<=4){ sets=5; reps=3; }     // building
    else if(week<=7){ sets=5; reps=2; }     // strength
    else { sets=3; reps=1; }                // max (week 8 will be treated specially)
    // pct ranges (simplified)
    const pct = (phase==='Tekniikka') ? [50,65] : (phase==='Rakenna') ? [65,80] : (phase==='Voima') ? [80,92] : [95,100];
    const accessories = pickAccessories(name);
    const core = (week%2===0) ? { name:'Weighted Plank', sets:3, reps:30 } : { name:'Plank', sets:3, reps:60 };
    return { name, sets, reps, pctFrom:pct[0], pctTo:pct[1], accessories, core };
  }

  function pickAccessories(main){
    // simple deterministic choices to keep UI stable
    const acc = {
      'Snatch':['Overhead Squat','Snatch High Pull'],
      'Clean & Jerk':['Push Press','Clean Pull'],
      'Front Squat':['Romanian Deadlift','DB Row'],
      'Back Squat':['Hip Thrust','Leg Curl'],
      'Deadlift':['Good Morning','Back Extension']
    };
    return (acc[main]||['Accessory1','Accessory2']).map(n=>({name:n, sets:3, reps:8}));
  }

  // --- Rendering views ---
  function renderHome(){
    view.innerHTML = '';
    const header = el('div','card');
    header.innerHTML = `<div class="card-head"><div><div class="eyebrow">Yhteenveto</div><h3>Ohjelma</h3></div><div class="badge">8 vk</div></div>
      <p class="kicker">1RM asetukset näkyvät Asetukset-välilehdellä. Tallennetut merkinnät pysyvät laitteessa.</p>`;
    view.appendChild(header);

    // quick week cards (shows progress)
    state.program.forEach(w=>{
      const weekNode = tmplWeek.content.cloneNode(true);
      const card = weekNode.querySelector('.week-card');
      card.querySelector('.eyebrow').textContent = `Viikko ${w.week}`;
      card.querySelector('h3').textContent = w.phase;
      card.querySelector('.badge').textContent = `Viikko ${w.week}`;
      const daysWrap = card.querySelector('.week-days');
      w.days.forEach((d, idx)=>{
        const dayNode = tmplDay.content.cloneNode(true);
        const dayCard = dayNode.querySelector('.day-card');
        dayCard.querySelector('.eyebrow.small').textContent = `Päivä ${idx+1}`;
        dayCard.querySelector('h4').textContent = d.name;
        // progress based on logs
        const key = `${w.week}-${idx+1}`;
        const doneSets = getDoneSets(key);
        const totalSets = d.sets + d.accessories.reduce((a,b)=>a+b.sets,0) + d.core.sets;
        const pct = totalSets===0?0:Math.round((doneSets/totalSets)*100);
        dayCard.querySelector('.bar').style.width = pct + '%';
        dayCard.querySelector('.day-kicker').textContent = `${doneSets}/${totalSets} sarjaa tehty`;
        // open handler
        dayCard.querySelector('.openDay').addEventListener('click', ()=> renderDay(w.week, idx+1));
        daysWrap.appendChild(dayCard);
      });
      view.appendChild(card);
    });
  }

  function renderProgram(){
    view.innerHTML = '';
    state.program.forEach(w=>{
      const weekNode = tmplWeek.content.cloneNode(true);
      const card = weekNode.querySelector('.week-card');
      card.querySelector('.eyebrow').textContent = `Viikko ${w.week}`;
      card.querySelector('h3').textContent = w.phase;
      card.querySelector('.badge').textContent = `Viikko ${w.week}`;
      const daysWrap = card.querySelector('.week-days');
      w.days.forEach((d,idx)=>{
        const dayNode = tmplDay.content.cloneNode(true);
        const dayCard = dayNode.querySelector('.day-card');
        dayCard.querySelector('.eyebrow.small').textContent = `Päivä ${idx+1}`;
        dayCard.querySelector('h4').textContent = d.name;
        const key = `${w.week}-${idx+1}`;
        const doneSets = getDoneSets(key);
        const totalSets = d.sets + d.accessories.reduce((a,b)=>a+b.sets,0) + d.core.sets;
        const pct = totalSets===0?0:Math.round((doneSets/totalSets)*100);
        dayCard.querySelector('.bar').style.width = pct + '%';
        dayCard.querySelector('.day-kicker').textContent = `${doneSets}/${totalSets} sarjaa tehty`;
        dayCard.querySelector('.openDay').addEventListener('click', ()=> renderDay(w.week, idx+1));
        daysWrap.appendChild(dayCard);
      });
      view.appendChild(card);
    });
  }

  function renderDay(week, dayIdx){
    const w = state.program.find(x=>x.week===week);
    if(!w) return;
    const d = w.days[dayIdx-1];
    view.innerHTML = '';
    // header
    const head = el('div','card');
    head.innerHTML = `<div class="card-head"><div><div class="eyebrow">Viikko ${week}</div><h3>${d.name} — ${d.sets}×${d.reps}</h3></div><div class="badge">${w.phase}</div></div>`;
    view.appendChild(head);

    const key = `${week}-${dayIdx}`;
    ensureDayLog(key);

    // main lift
    const mainCard = el('div','card');
    const mainRmKey = mapToRmKey(d.name);
    const rmVal = state.oneRM[mainRmKey] || 0;
    const lowKg = roundKg(rmVal * d.pctFrom / 100);
    const highKg = roundKg(rmVal * d.pctTo / 100);
    mainCard.innerHTML = `<div class="eyebrow">Pääliike</div><h3>${d.name}</h3>
      <p class="kicker">Suositus: ${d.sets}×${d.reps} — ${d.pctFrom}%–${d.pctTo}% (~${lowKg}–${highKg} kg)</p>`;
    view.appendChild(mainCard);

    // accessory + core rendering and sets with inputs
    const exercises = [{type:'main', ex:d}].concat(d.accessories.map(a=>({type:'acc',ex:a}))).concat([{type:'core',ex:d.core}]);
    exercises.forEach((item, idx)=>{
      const card = el('div','card');
      const title = item.ex.name;
      const sets = item.ex.sets;
      const reps = item.ex.reps;
      card.innerHTML = `<div class="eyebrow">${item.type==='main'?'Pääliike':item.type==='acc'?'Apuliike':'Core'}</div>
        <h3>${title}</h3><p class="kicker">${sets}×${reps}</p>`;
      // sets inputs
      const logs = ensureDayLog(key);
      if(!logs.exercises[idx]) logs.exercises[idx] = Array.from({length:sets}).map(()=>({w:null,r:null,done:false}));
      const wrap = el('div');
      logs.exercises[idx].forEach((s,si)=>{
        const row = el('div','set-row');
        row.style.display='flex'; row.style.gap='8px'; row.style.marginTop='8px';
        const wInp = el('input'); wInp.type='number'; wInp.placeholder='kg'; wInp.value = s.w==null?'':s.w;
        const rInp = el('input'); rInp.type='number'; rInp.placeholder='toistot'; rInp.value = s.r==null?'':s.r;
        const chk = el('button'); chk.textContent = s.done? '✓':'○'; chk.className='ghost small';
        chk.addEventListener('click', ()=>{
          s.done = !s.done; chk.textContent = s.done?'✓':'○'; saveState(); updateDayProgress();
          navigator.vibrate?.(20);
        });
        wInp.addEventListener('change', ()=>{ s.w = parseFloat(wInp.value||'0'); saveState(); });
        rInp.addEventListener('change', ()=>{ s.r = parseInt(rInp.value||'0'); saveState(); });
        row.appendChild(wInp); row.appendChild(rInp); row.appendChild(chk);
        wrap.appendChild(row);
      });
      // action buttons
      const btnRow = el('div'); btnRow.style.marginTop='10px';
      const addBtn = el('button','ghost'); addBtn.textContent = '+ Sarja'; addBtn.addEventListener('click', ()=>{
        logs.exercises[idx].push({w:null,r:null,done:false}); saveState(); renderDay(week,dayIdx);
      });
      const fillDone = el('button','ghost'); fillDone.textContent='Merkitse tehty'; fillDone.addEventListener('click', ()=>{
        logs.exercises[idx].forEach(s=>s.done=true); saveState(); renderDay(week,dayIdx);
      });
      btnRow.appendChild(addBtn); btnRow.appendChild(fillDone);
      card.appendChild(wrap); card.appendChild(btnRow);
      view.appendChild(card);
    });

    // footer controls
    const f = el('div','card');
    const doneBtn = el('button'); doneBtn.textContent = 'Merkitse päivä tehdyksi'; doneBtn.addEventListener('click', ()=>{
      state.logs[key].done = true; saveState(); renderProgram(); navigator.vibrate?.(50);
    });
    const backBtn = el('button','ghost'); backBtn.textContent = 'Takaisin'; backBtn.addEventListener('click', ()=> renderProgram());
    f.appendChild(doneBtn); f.appendChild(backBtn);
    view.appendChild(f);

    function updateDayProgress(){
      const doneSets = getDoneSets(key);
      const totalSets = d.sets + d.accessories.reduce((a,b)=>a+b.sets,0) + d.core.sets;
      // find bar inside header if exists
      // no need; save done
    }
  }

  function renderTodayPicker(){
    view.innerHTML = '';
    const card = el('div','card');
    card.innerHTML = `<div class="card-head"><div><div class="eyebrow">Tänään</div><h3>Avaa viikon & päivän</h3></div></div>`;
    const set = el('div');
    const wInp = el('input'); wInp.type='number'; wInp.min=1; wInp.max=8; wInp.placeholder='Viikko (1-8)';
    const dInp = el('input'); dInp.type='number'; dInp.min=1; dInp.max=4; dInp.placeholder='Päivä (1-4)';
    const go = el('button'); go.textContent='Avaa'; go.addEventListener('click', ()=>{
      const w = parseInt(wInp.value||'1'); const d = parseInt(dInp.value||'1');
      if(w<1||w>8||d<1||d>4){ alert('Viikko 1-8 ja päivä 1-4'); return; }
      renderDay(w,d);
    });
    set.appendChild(wInp); set.appendChild(dInp); set.appendChild(go);
    card.appendChild(set); view.appendChild(card);
  }

  function renderSettings(){
    view.innerHTML = '';
    const card = el('div','card');
    card.innerHTML = `<div class="card-head"><div><div class="eyebrow">Asetukset</div><h3>1RM asetukset</h3></div></div>`;
    const grid = el('div');
    Object.keys(state.oneRM).forEach(k=>{
      const row = el('div'); row.style.marginTop='10px';
      const label = el('div'); label.textContent = k; label.style.color = '#9aa7b6';
      const input = el('input'); input.type='number'; input.value = state.oneRM[k];
      const btn = el('button'); btn.textContent='Tallenna'; btn.className='small';
      btn.addEventListener('click', ()=>{ state.oneRM[k] = parseFloat(input.value||'0'); saveState(); navigator.vibrate?.(20); alert(`${k} tallennettu`); });
      row.appendChild(label); row.appendChild(input); row.appendChild(btn);
      grid.appendChild(row);
    });
    card.appendChild(grid);
    // reset/export buttons
    const row2 = el('div'); row2.style.marginTop='12px';
    const reset = el('button','ghost'); reset.textContent='Nollaa kaikki merkinnät'; reset.addEventListener('click', ()=>{
      if(confirm('Poistetaanko kaikki tallennetut merkinnät (ei 1RM:t)?')){ state.logs = {}; saveState(); renderHome(); }
    });
    row2.appendChild(reset);
    card.appendChild(row2);
    view.appendChild(card);
  }

  // --- logging helpers ---
  function ensureDayLog(key){
    if(!state.logs[key]) state.logs[key] = { done:false, exercises:{} };
    saveState();
    return state.logs[key];
  }
  function getDoneSets(key){
    const ex = state.logs[key]?.exercises || {};
    return Object.values(ex).flat().filter(s=>s.done).length;
  }

  // --- utilities ---
  function mapToRmKey(name){
    const k = name.toLowerCase();
    if(k.includes('snatch')) return 'Snatch';
    if(k.includes('clean')) return 'Clean & Jerk';
    if(k.includes('front')) return 'Front Squat';
    if(k.includes('back')) return 'Back Squat';
    if(k.includes('dead')) return 'Deadlift';
    if(k.includes('bench')) return 'Bench';
    return Object.keys(state.oneRM)[0];
  }
  function roundKg(x){ return Math.round(x/2.5)*2.5; }
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className = cls; return e; }

  // --- Import / Export ---
  function attachImportExport(){
    btnExport.addEventListener('click', ()=>{
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'treeniapp_backup.json'; a.click();
    });
    btnImport.addEventListener('click', ()=> fileImport.click());
    fileImport.addEventListener('change', e=>{
      const f = e.target.files[0]; if(!f) return;
      const r = new FileReader();
      r.onload = ()=> {
        try{
          const obj = JSON.parse(r.result);
          // minimal validation
          if(obj.oneRM && obj.program){ state = obj; saveState(); alert('Tuonti valmis'); renderHome(); }
          else alert('Virheellinen tuontitiedosto');
        }catch(err){ alert('Virheellinen tiedosto'); }
      };
      r.readAsText(f);
    });
  }

  // --- helpers: DOM delegation for initial default view ---
  function renderHomeIfEmpty(){ renderHome(); }
  // initial
  renderHomeIfEmpty();

})();
