import { checkAnswer, nextLives, advance, scoreFor } from './logic/quiz.js';
const start=document.getElementById('startScreen'),area=document.getElementById('gameArea'),qEl=document.getElementById('q'),choices=document.getElementById('choices'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle'),hs=document.getElementById('hudScore');
let bank,idx,lives=3,score=0,playing;
document.getElementById('startBtn').onclick=async()=>{bank=await fetch('./data/trick-quiz.json').then(r=>r.json());idx=0;lives=3;score=0;playing=true;start.classList.add('hidden');area.hidden=false;render()};
function render(){if(idx<0||idx>=bank.length)return end();const q=bank[idx];qEl.textContent=q.q;choices.innerHTML='';q.choices.forEach((c,i)=>{const b=document.createElement('button');b.className='g-btn g-btn--outline';b.textContent=c;b.onclick=()=>pick(i);choices.appendChild(b)})}
function pick(i){const ok=checkAnswer(bank,idx,i);score+=scoreFor(ok,0);hs.textContent=score;lives=nextLives(lives,ok);idx=advance(idx,bank.length);if(lives<=0)return end();render()}
function end(){playing=false;title.textContent=lives>0?'Done!':'Out of lives';ov.classList.add('visible')}
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');area.hidden=true};
