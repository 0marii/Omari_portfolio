import { WORDS, scrambleWord, checkAnswer } from './logic/word-scramble.js';
const start=document.getElementById('startScreen'),area=document.getElementById('gameArea'),sc=document.getElementById('scrambled'),inp=document.getElementById('guess'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle'),hs=document.getElementById('hudScore');
let target,score=0,round=0,playing;
document.getElementById('startBtn').onclick=()=>{score=0;round=0;playing=true;hs.textContent='0';start.classList.add('hidden');area.hidden=false;next()};
function next(){if(round>=5)return end(true);round++;target=WORDS[Math.floor(Math.random()*WORDS.length)];sc.textContent=scrambleWord(target);inp.value=''}
document.getElementById('submit').onclick=()=>{if(!playing)return;if(checkAnswer(target,inp.value)){score+=100;hs.textContent=score;next()}else end(false)};
function end(win){playing=false;title.textContent=win?'Great!':'Try Again';ov.classList.add('visible')}
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');area.hidden=true};
