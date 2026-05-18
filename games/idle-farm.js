import { initialFarm, tickFarm, buyUpgrade } from './logic/idle-farm.js';
const start=document.getElementById('startScreen'),farm=document.getElementById('farm'),coinsEl=document.getElementById('coins'),hs=document.getElementById('hudScore');
let state,playing,last;
document.getElementById('startBtn').onclick=()=>{state=initialFarm();playing=true;last=performance.now();start.classList.add('hidden');farm.hidden=false;requestAnimationFrame(tick)};
function tick(t){if(!playing)return;const dt=(t-last)/1000;last=t;state=tickFarm(state,dt);coinsEl.textContent=Math.floor(state.coins);hs.textContent=Math.floor(state.coins);requestAnimationFrame(tick)}
document.getElementById('click').onclick=()=>{if(playing)state.coins+=state.rate};
document.getElementById('up').onclick=()=>{state=buyUpgrade(state)};
document.getElementById('againBtn').onclick=()=>{playing=false;document.getElementById('overlay').classList.remove('visible');start.classList.remove('hidden');farm.hidden=true};
