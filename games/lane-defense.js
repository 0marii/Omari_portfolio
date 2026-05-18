(function(){'use strict';

const c=document.getElementById('gameCanvas'); if(!c) return;
const x=c.getContext('2d');
const start=document.getElementById('startScreen');
const ov=document.getElementById('overlay');
const sub=document.getElementById('overlaySub');
const hs=document.getElementById('hudScore');
const hb=document.getElementById('hudBest');
let score=0,best=0,playing=false,raf,W,H,enemies=[],spawnTimer=0;
function lb(k){try{best=+localStorage.getItem(k)||0}catch{best=0}hb.textContent=best}
function save(k){if(score>best){best=score;try{localStorage.setItem(k,best)}catch{}}hb.textContent=best}
function go(subt){playing=false;sub.textContent=subt||('Score '+score);ov.classList.add('visible')}
function spawnEnemy(){return{lane:Math.floor(Math.random()*3),x:W+40,r:22}} 
function reset(){W=c.width;H=c.height;score=0;hs.textContent='0';enemies=[spawnEnemy()];spawnTimer=0;start.classList.add('hidden');ov.classList.remove('visible');playing=true;requestAnimationFrame(loop)}
function draw(){x.fillStyle='#050510';x.fillRect(0,0,W,H);for(let i=0;i<3;i++){const y=(i+1)*H/4; x.fillStyle='rgba(255,255,255,.05)';x.fillRect(0,y-60,W,120);}enemies.forEach(enemy=>{const y=(enemy.lane+1)*H/4; x.fillStyle='#f43f5e';x.fillRect(enemy.x,y-30,40,60);});x.fillStyle='#fff';x.font='18px Inter, sans-serif';x.textAlign='left';x.fillText('Click an enemy to shoot it',20,28);x.fillText('Score: '+score,20,56)}
function loop(){if(!playing)return;spawnTimer--; if(spawnTimer<=0){enemies.push(spawnEnemy());spawnTimer=90-Math.min(50,score*3);} enemies.forEach(enemy=>{enemy.x -= 2 + score*0.05; if(enemy.x < 60){save('lane_def_best');go('Base breached');}}); enemies = enemies.filter(enemy=>enemy.x > -60); draw(); raf=requestAnimationFrame(loop)}

c.addEventListener('click',e=>{if(!playing) return;const rect=c.getBoundingClientRect();const mx=(e.clientX-rect.left)*(c.width/rect.width);const my=(e.clientY-rect.top)*(c.height/rect.height);const lane=Math.min(2,Math.max(0,Math.floor(my/(H/3)))); const hit=enemies.findIndex(enemy=>enemy.lane===lane && Math.abs(mx-enemy.x-20) < 30); if(hit!==-1){enemies.splice(hit,1);score+=10;hs.textContent=score;}});

document.getElementById('startBtn').onclick=()=>{lb('lane_def_best');reset()};
document.getElementById('againBtn').onclick=()=>{cancelAnimationFrame(raf);start.classList.remove('hidden');ov.classList.remove('visible');playing=false};
})();
