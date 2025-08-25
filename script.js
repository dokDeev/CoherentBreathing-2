(() => {
  const circle = document.getElementById('circle');
  const count  = document.getElementById('count');
  const left   = document.getElementById('left');
  const progress = document.getElementById('progress');
  const phaseEl  = document.getElementById('phase');
  const phaseLabel = document.getElementById('phaseLabel');

  const modeSel = document.getElementById('mode');
  const durSel  = document.getElementById('duration');
  const startBtn= document.getElementById('startBtn');
  const pauseBtn= document.getElementById('pauseBtn');
  const focusBtn= document.getElementById('focusBtn');

  const soundToggle = document.getElementById('soundToggle');
  const sndInhale = document.getElementById('sndInhale');
  const sndExhale = document.getElementById('sndExhale');

  // Восстановление предпочтений
  try{
    const saved = JSON.parse(localStorage.getItem('cb_prefs')||'{}');
    if(saved.mode) modeSel.value = saved.mode;
    if(saved.dur)  durSel.value  = saved.dur;
    left.textContent = fmt(parseInt(durSel.value,10));
  }catch(_){}

  function savePrefs(){
    localStorage.setItem('cb_prefs', JSON.stringify({ mode: modeSel.value, dur: durSel.value }));
  }
  modeSel.addEventListener('change', savePrefs);
  durSel .addEventListener('change', savePrefs);

  let running=false, paused=false, tStart=0, tPaused=0, total=600, raf, seq=[], idx=0, phase="—";
  let phaseEndAt = 0, countdownTimer=null;

  function fmt(sec){
    const m = Math.floor(sec/60), s = Math.max(0, Math.floor(sec%60));
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  function buildSequence(mode){
    if(mode==='5-5') return [{p:'Вдох',s:5},{p:'Выдох',s:5}];
    if(mode==='4-6') return [{p:'Вдох',s:4},{p:'Выдох',s:6}];
    return [{p:'Вдох',s:4},{p:'Задержка',s:4},{p:'Выдох',s:4},{p:'Пауза',s:4}];
  }

  function playCue(p){
    if(!soundToggle || !soundToggle.checked) return;
    try{
      if(p==='Вдох'){ sndInhale.currentTime=0; sndInhale.play(); }
      else { sndExhale.currentTime=0; sndExhale.play(); }
    }catch(_){}
  }

  function clearCountdown(){
    if(countdownTimer){ clearTimeout(countdownTimer); countdownTimer=null; }
  }

  function applyPhase(p, seconds){
    phase = p; phaseEl.textContent = p;
    phaseLabel.textContent = (p==='Вдох' ? 'Расширение круга — вдох' : 'Сужение круга — выдох/пауза');
    playCue(p);

    const scale = (p==='Вдох')? 1.0 : 0.75;
    circle.style.setProperty('--phase', seconds+'s');
    circle.style.setProperty('--scale', scale);

    // обратный отсчёт цифрами в центре
    clearCountdown();
    let rem = seconds;
    count.textContent = rem;
    const step = () => {
      if(!running || paused) return;
      rem -= 1;
      if(rem >= 0){
        count.textContent = rem;
        countdownTimer = setTimeout(step, 1000);
      }
    };
    countdownTimer = setTimeout(step, 1000);
  }

  function loop(){
    if(!running){ cancelAnimationFrame(raf); return; }
    const now = performance.now();
    const elapsed = (now - tStart) / 1000; // s
    const remain = Math.max(0, total - elapsed);
    left.textContent = fmt(remain);
    const donePct = 100 * (elapsed / total);
    progress.style.width = Math.max(0, Math.min(100, donePct)) + '%';

    if(!phaseEndAt || now >= phaseEndAt){
      const step = seq[idx % seq.length];
      idx++;
      applyPhase(step.p, step.s);
      phaseEndAt = now + step.s * 1000;
    }
    if(remain <= 0){
      stop();
      phaseEl.textContent = 'Готово';
      phaseLabel.textContent = 'Сессия завершена. Отметьте ощущения и ЧСС.';
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function start(){
    total = parseInt(durSel.value, 10);
    seq   = buildSequence(modeSel.value);
    idx   = 0;
    tStart = performance.now();
    running = true; paused = false; pauseBtn.disabled=false; startBtn.disabled=true;
    phaseEl.textContent='—';
    phaseEndAt = 0;
    document.getElementById('coach')?.scrollIntoView({behavior:'smooth', block:'start'});
    loop();
  }
  function stop(){
    running=false; paused=false; startBtn.disabled=false; pauseBtn.disabled=true;
    cancelAnimationFrame(raf); clearCountdown();
  }
  function togglePause(){
    if(!running) return;
    if(!paused){
      paused = true; tPaused = performance.now();
      pauseBtn.textContent='Продолжить';
      phaseLabel.textContent='Пауза: сделайте мягкий обычный вдох-выдох.';
      cancelAnimationFrame(raf);
      clearCountdown();
    }else{
      const delta = performance.now() - tPaused;
      tStart += delta; phaseEndAt += delta;
      paused = false; pauseBtn.textContent='Пауза';
      loop();
    }
  }

  // UI
  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', togglePause);
  focusBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('focus');
    focusBtn.textContent = document.body.classList.contains('focus') ? 'Выйти из фокуса' : 'Фокус-режим';
  });

  modeSel.addEventListener('change', ()=> {
    savePrefs();
    if(!running){ phaseLabel.textContent='Режим выбран. Нажмите «Старт».';
    } else {
      // мягкое переключение режима на лету
      const elapsed = (performance.now() - tStart)/1000;
      tStart = performance.now() - elapsed;
      seq = buildSequence(modeSel.value);
      idx = 0; phaseEndAt = 0;
    }
  });

  durSel.addEventListener('change', ()=> { savePrefs(); if(!running) left.textContent = fmt(parseInt(durSel.value,10)); });

  // начальные значения
  left.textContent = fmt(parseInt(durSel.value,10));
  circle.style.setProperty('--scale', .75);
})();
