import { pourQuality, nextLevel, isWin } from './logic/mix-master.js';
const start=document.getElementById('startScreen'),mix=document.getElementById('mix'),lvl=document.getElementById('lvl'),pour=document.getElementById('pour'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle');
let level=0,playing;
document.getElementById('startBtn').onclick=()=>{level=0;playing=true;start.classList.add('hidden');mix.hidden=false;lvl.textContent='0'};
document.getElementById('go').onclick=()=>{if(!playing)return;const q=pourQuality(+pour.value);level=nextLevel(q==='perfect'?15:q==='good'?8:2,level);lvl.textContent=Math.floor(level);if(isWin(level)){playing=false;title.textContent='Perfect Mix!';title.className='game-overlay__title game-overlay__title--win';ov.classList.add('visible')}};
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');mix.hidden=true};
