 (function(){'use strict';
const c=document.getElementById('gameCanvas'); if(!c) return; const x=c.getContext('2d'),W=400,H=560,start=document.getElementById('startScreen'),ov=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),hf=document.getElementById('hudFloors'),hb=document.getElementById('hudBest');
let blocks,swing,playing,score,best,raf,dir=1;
function lb(){try{best=+localStorage.getItem('tower_best')||0}catch{best=0}hb.textContent=best}
function reset(){blocks=[{x:50,y:H-40,w:W-100,h:30}];swing={x:0,w:80,y:80,t:0};score=0;playing=true;hf.textContent='0';start.classList.add('hidden');ov.classList.remove('visible');loop()}
function drop(){const top=blocks[blocks.length-1];const w=swing.w;const bx=swing.x;const overlap=Math.min(bx+w,top.x+top.w)-Math.max(bx,top.x);if(overlap<=10){playing=false;sub.textContent='Score '+score+' · Best '+best;ov.classList.add('visible');return}
const nx=Math.max(bx,top.x);blocks.push({x:nx,y:top.y-32,w:overlap,h:28});score++;hf.textContent=score;if(score>best){best=score;try{localStorage.setItem('tower_best',best)}catch{}hb.textContent=best}
swing={x:0,w:overlap,y:blocks[blocks.length-1].y-50,t:0}}
function loop(){if(!playing)return;x.fillStyle='#050510';x.fillRect(0,0,W,H);blocks.forEach(b=>{x.fillStyle='#6366f1';x.fillRect(b.x,b.y,b.w,b.h)});swing.t+=0.04*dir;swing.x=(W-swing.w)/2+Math.sin(swing.t)*(W-swing.w-20)/2;x.fillStyle='#f59e0b';x.fillRect(swing.x,swing.y,swing.w,24);raf=requestAnimationFrame(loop)}
document.getElementById('startBtn').onclick=()=>{lb();reset()};
document.getElementById('againBtn').onclick=()=>{cancelAnimationFrame(raf);start.classList.remove('hidden');ov.classList.remove('visible');playing=false};
c.addEventListener('click',()=>playing&&drop());window.onkeydown=e=>{if(e.code==='Space'&&ov.classList.contains('visible')){ov.classList.remove('visible');reset()}if(e.code==='Enter')drop()};
lb();
})();
