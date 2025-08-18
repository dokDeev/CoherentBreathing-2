(function(){
  const circle=document.getElementById('breathCircle');
  const label=document.getElementById('phaseLabel');
  const btn=document.getElementById('toggleBtn');
  const yearEl=document.getElementById('year');
  if(yearEl) yearEl.textContent=new Date().getFullYear();

  const soundInhale=document.getElementById('soundInhale');
  const soundExhale=document.getElementById('soundExhale');

  let running=false,phase='inhale',start=0,raf;
  const D_IN=5000,D_EX=5000,MIN=0.7,MAX=1.0;

  function ease(t){return 0.5*(1-Math.cos(Math.PI*t));}
  function setPhase(p){
    phase=p;start=performance.now();
    label.textContent=(p==='inhale'?'Вдох':'Выдох');
    if(p==='inhale'){ soundInhale.currentTime=0; soundInhale.play(); }
    else { soundExhale.currentTime=0; soundExhale.play(); }
  }
  function frame(now){
    const dur=(phase==='inhale'?D_IN:D_EX);
    const t=Math.min((now-start)/dur,1);
    const e=ease(t);
    const s=(phase==='inhale'?MIN+(MAX-MIN)*e:MAX-(MAX-MIN)*e);
    circle.style.transform=`scale(${s})`;
    if(t>=1) setPhase(phase==='inhale'?'exhale':'inhale');
    if(running) raf=requestAnimationFrame(frame);
  }
  function startAnim(){
    if(running) return;
    running=true;btn.textContent='Пауза';
    setPhase('inhale');raf=requestAnimationFrame(frame);
  }
  function stopAnim(){
    running=false;btn.textContent='Старт';
    cancelAnimationFrame(raf);label.textContent='Пауза';
  }
  btn.addEventListener('click',()=>running?stopAnim():startAnim());
})();