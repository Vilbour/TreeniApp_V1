// app.js — V3 puhdas & toimiva
(function(){
  const LS = 'wl_v3_state';
  const defaults = { snatch:70, cj:90, deadlift:170, frontSquat:115, backSquat:140, bench:105 };

  // ===== 8 VIIKON OHJELMA (deterministinen, ei arpomista) =====
  function buildProgram(){
    const weeks = [];
    const phases = {
      1:{name:'Tekniikka',   pct:{CJ:[60,65], SN:[60,65], SQ:[60,70], DL:[60,70]}, sr:{s:4,r:3, note:'Tekniikka: kontrolli, pysähdykset, kevyet sarjat'}},
      2:{name:'Sarjapainot', pct:{CJ:[70,75], SN:[70,75], SQ:[70,80], DL:[70,80]}, sr:{s:5,r:3, note:'Nosta sarjapainoja nousujohteisesti'}},
      3:{name:'Sarjapainot', pct:{CJ:[75,80], SN:[75,80], SQ:[75,85], DL:[75,85]}, sr:{s:5,r:3, note:'Pidä tekniikka siistinä'}},
      4:{name:'Sarjapainot', pct:{CJ:[80,82], SN:[78,82], SQ:[80,87], DL:[78,85]}, sr:{s:5,r:3, note:'Hieman kovempi viikko'}},
      5:{name:'Voima',       pct:{CJ:[80,85], SN:[78,83], SQ:[85,90], DL:[82,90]}, sr:{s:5,r:2, note:'Voima: pidemmät palautukset'}},
      6:{name:'Voima',       pct:{CJ:[83,87], SN:[80,85], SQ:[87,92], DL:[85,92]}, sr:{s:5,r:2, note:'Kovat pääsarjat'}},
      7:{name:'Voima',       pct:{CJ:[85,88], SN:[82,86], SQ:[88,92], DL:[86,92]}, sr:{s:5,r:2, note:'Huipennus ennen maksimeja'}},
      8:{name:'Maksimit',    pct:{CJ:[90,100],SN:[90,100],SQ:[90,100],DL:[90,100]}, sr:{s:5,r:1, note:'Maksimi-viikko: 1RM testit'}}
    };

    // apuliikkeet (pääliikekohtaiset, järjestys deterministinen)
    const ACC = {
      'Snatch':       [{name:'Overhead Squat',sets:3,reps:5},{name:'Snatch Pull',sets:4,reps:3},{name:'Snatch Balance',sets:3,reps:3},{name:'Face Pull',sets:3,reps:12}],
      'Clean & Jerk': [{name:'Clean Pull',sets:4,reps:3},{name:'Push Press',sets:4,reps:5},{name:'Jerk Dip',sets:3,reps:5},{name:'Strict Press',sets:3,reps:8}],
      'Front Squat':  [{name:'Romanian Deadlift',sets:3,reps:6},{name:'DB Row',sets:3,reps:10},{name:'Lunge',sets:3,reps:8},{name:'Leg Curl',sets:3,reps:12}],
      'Back Squat':   [{name:'Hip Thrust',sets:4,reps:6},{name:'Leg Press',sets:3,reps:10},{name:'Good Morning',sets:3,reps:6},{name:'Back Extension',sets:3,reps:12}],
      'Deadlift':     [{name:'Good Morning',sets:3,reps:6},{name:'Back Extension',sets:3,reps:12},{name:'Hamstring Curl',sets:3,reps:10},{name:'Row (Cable/DB)',sets:3,reps:10}]
    };

    const CORE_K = ['Plank', 'Side Plank', 'Hollow Hold', 'Dead Bug'];               // parittomat = kestävyys
    const CORE_V = ['Weighted Plank', 'KB Farmer Carry', 'Turkish Get-up', 'GHD Sit-up (weighted)']; // parilliset = voima

    const dayOrder = ['Snatch','Clean & Jerk','Squat','Deadlift'];
    const squatOf = (w)=> (w%2===1 ? 'Front Squat' : 'Back Squat');

    for(let w=1; w<=8; w++){
      const ph = phases[w];
      const days = [];
      for(let d=0; d<4; d++){
        let mainName = dayOrder[d];
        if(mainName==='Squat') mainName = squatOf(w);

        const pct = (()=>{
          if(mainName.includes('Snatch')) return ph.pct.SN;
          if(mainName.includes('Clean'))  return ph.pct.CJ;
          if(mainName.includes('Squat'))  return ph.pct.SQ;
          return ph.pct.DL; // Deadlift
        })();

        // apuliikkeiden määrä 2–4, deterministisesti viikon mukaan
        const accList = ACC[mainName] || [];
        const accCount = 2 + ((w+ d) % 3); // 2,3,4 kiertäen
        const accessories = accList.slice(0, Math.min(accCount, accList.length));

        // core valinta: parilliset = VOIMA, parittomat = KESTÄVYYS
        const coreList = (w%2===0 ? CORE_V : CORE_K);
        const core = { name: coreList[d % coreList.length], sets: (w%2===0?4:3), reps: (w%2===0?8:45) };

        days.push({
          title: `Päivä ${d+1}`,
          main: {
            name: mainName,
            key: rmKeyByName(mainName),
            pctFrom: pct[0],
            pctTo: pct[1],
            sets: ph.sr.s,
            reps: ph.sr.r,
            notes: ph.sr.note
          },
          accessories,
          core
        });
      }
      weeks.push({ week:w, phase: ph.name, days });
    }
    return weeks;
  }

  // ===== State =====
  const state = load();
  function load(){
    try{ const raw = localStorage.getItem(LS); if(raw) return JSON.parse(raw); }catch{}
    return { oneRM: {...defaults}, program: buildProgram() };
  }
  function save(){ localStorage.setItem(LS, JSON.stringify(state)); }

  // ===== Helpers =====
  function $(s){ return document.querySelector(s); }
  function el(t,c){ const e=document.createElement(t); if(c) e.className=c; return e; }
  function kg(x){ return Math.round(x/2.5)*2.5; }
  function rmKeyByName(n){
    const k=n.toLowerCase();
    if(k.includes('snatch')) return 'snatch';
    if(k.includes('clean')) return 'cj';
    if(k.includes('front')) return 'frontSquat';
    if(k.includes('back'))  return 'backSquat';
    if(k.includes('dead'))  return 'deadlift';
    if(k.includes('bench')) return 'bench';
    return 'snatch';
  }

  let curW = 0, curD = 0;

  // ===== Views =====
  function renderHome(){
    const c = $('#content'); c.innerHTML='';
    const card = el('div','card');
    card.innerHTML = `
      <h2>1RM-arvot</h2>
      <div class="inputs">
        <label>Snatch <input name="snatch" type="number" value="${state.oneRM.snatch}"></label>
        <label>Clean & Jerk <input name="cj" type="number" value="${state.oneRM.cj}"></label>
        <label>Deadlift <input name="deadlift" type="number" value="${state.oneRM.deadlift}"></label>
        <label>Front Squat <input name="frontSquat" type="number" value="${state.oneRM.frontSquat}"></label>
        <label>Back Squat <input name="backSquat" type="number" value="${state.oneRM.backSquat}"></label>
        <label>Bench <input name="bench" type="number" value="${state.oneRM.bench}"></label>
      </div>
      <div class="row">
        <button id="saveRM" class="btn">Tallenna</button>
        <button id="openProgram" class="btn ghost">Avaa ohjelma</button>
      </div>
      <div class="hr"></div>
      <p class="muted">Arvot tallentuvat tälle laitteelle. Voit päivittää koska tahansa.</p>
    `;
    c.appendChild(card);

    $('#saveRM').onclick = ()=>{
      ['snatch','cj','deadlift','frontSquat','backSquat','bench'].forEach(k=>{
        const el = document.querySelector(`input[name="${k}"]`);
        state.oneRM[k] = Number(el.value||0);
      });
      save(); alert('Tallennettu');
    };
    $('#openProgram').onclick = ()=> navigate('program');
  }

  function renderProgram(){
    const c = $('#content'); c.innerHTML='';
    const w = state.program[curW];
    const d = w.days[curD];

    const head = el('div','card');
    head.innerHTML = `<h3>Viikko ${w.week} · ${w.phase}</h3><h4>${d.title}</h4>`;
    c.appendChild(head);

    const main = el('div','card');
    const rm = state.oneRM[d.main.key] || 0;
    const low = kg(rm*d.main.pctFrom/100), high = kg(rm*d.main.pctTo/100);
    main.innerHTML = `
      <h4>${d.main.name} (pääliike)</h4>
      <p>${d.main.sets}×${d.main.reps} — ${d.main.pctFrom}%–${d.main.pctTo}% → <span class="kg">${low}–${high} kg</span></p>
      <p class="muted">${d.main.notes}</p>
    `;
    c.appendChild(main);

    d.accessories.forEach(a=>{
      const acc = el('div','card');
      acc.innerHTML = `<h4>${a.name}</h4><p>${a.sets}×${a.reps}</p>`;
      c.appendChild(acc);
    });

    const core = el('div','card');
    core.innerHTML = `<h4>Core</h4><p>${d.core.name} — ${d.core.sets}×${d.core.reps}</p>`;
    c.appendChild(core);

    const ctrl = el('div','card controls');
    const prev = el('button','btn ghost'); prev.textContent='◀ Edellinen';
    const next = el('button','btn'); next.textContent='Seuraava ▶';
    prev.onclick = ()=>{
      if(curD>0) curD--; else if(curW>0){ curW--; curD=3; }
      renderProgram();
    };
    next.onclick = ()=>{
      if(curD<3) curD++; else if(curW<7){ curW++; curD=0; }
      renderProgram();
    };
    ctrl.appendChild(prev); ctrl.appendChild(next); c.appendChild(ctrl);
  }

  function renderToday(){
    const c = $('#content'); c.innerHTML='';
    // yksinkertainen: viikon 1 treenit, viikonpäivän mukaan
    const weekday = (new Date()).getDay(); // 0=su..6=la
    const dIdx = Math.max(0, (weekday-1)) % 4; // ma=0..to=3, pe->0 jne.
    const w = state.program[0], d = w.days[dIdx];

    const head = el('div','card');
    head.innerHTML = `<h3>Tänään</h3><p class="muted">Viikko 1 · ${d.title}</p>`;
    c.appendChild(head);

    const main = el('div','card');
    const rm = state.oneRM[d.main.key] || 0;
    const low = kg(rm*d.main.pctFrom/100), high = kg(rm*d.main.pctTo/100);
    main.innerHTML = `<h4>${d.main.name}</h4><p>${d.main.sets}×${d.main.reps} → <span class="kg">${low}–${high} kg</span></p>`;
    c.appendChild(main);

    d.accessories.forEach(a=>{
      const acc = el('div','card'); acc.innerHTML=`<p>${a.name} — ${a.sets}×${a.reps}</p>`; c.appendChild(acc);
    });
  }

  function renderSettings(){ renderHome(); }

  // ===== Nav =====
  function navigate(view){
    if(view==='home') renderHome();
    else if(view==='program') renderProgram();
    else if(view==='today') renderToday();
    else if(view==='settings') renderSettings();
  }
  window.navigate = navigate;

  // SW rekisteröinti (ei pakollinen, mutta hyödyllinen Netlifyssä)
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }

  document.addEventListener('DOMContentLoaded', ()=> navigate('home'));
})();
