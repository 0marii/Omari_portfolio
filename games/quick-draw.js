(function(){'use strict';

const c=document.getElementById('gameCanvas'); if(!c) return; const x=c.getContext('2d'),start=document.getElementById('startScreen'),ov=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),hs=document.getElementById('hudScore'),hb=document.getElementById('hudBest');
let score,best,playing,raf,W,H;
function lb(k){try{best=+localStorage.getItem(k)||0}catch{best=0}hb.textContent=best}
function save(k){if(score>best){best=score;try{localStorage.setItem(k,best)}catch{}}hb.textContent=best}
function go(subt){playing=false;sub.textContent=subt||('Score '+score);ov.classList.add('visible')}
function boot(k,loop){W=c.width;H=c.height;document.getElementById('startBtn').onclick=()=>{score=0;playing=true;hs.textContent='0';start.classList.add('hidden');ov.classList.remove('visible');loop()}};
document.getElementById('againBtn').onclick=()=>{cancelAnimationFrame(raf);start.classList.remove('hidden');ov.classList.remove('visible')};

lb('draw_best');
function loop(){if(!playing)return;x.fillStyle='#050510';x.fillRect(0,0,W,H);hs.textContent=score;raf=requestAnimationFrame(loop)}
boot('draw_best',loop);

let t0=0;
const origBoot=boot;
boot=function(k,loop){
  document.getElementById('startBtn').onclick=()=>{
    score=0;playing=true;t0=performance.now();hs.textContent='0';
    start.classList.add('hidden');ov.classList.remove('visible');
    requestAnimationFrame(loop);
  };
};
document.getElementById('againBtn').onclick=()=>{
  cancelAnimationFrame(raf);start.classList.remove('hidden');ov.classList.remove('visible');
};
window.__keys={};
window.addEventListener('keydown',e=>{window.__keys[e.key]=true;});
window.addEventListener('keyup',e=>{window.__keys[e.key]=false;});
})();
