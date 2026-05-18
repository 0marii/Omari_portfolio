'use strict';
const start=document.getElementById('startScreen'),play=document.getElementById('play'),msg=document.getElementById('msg'),ov=document.getElementById('overlay'),hs=document.getElementById('hudScore');
let score=0,time=60,timer,playing;
document.getElementById('startBtn').onclick=()=>{score=0;time=60;playing=true;hs.textContent='0';start.classList.add('hidden');play.hidden=false;msg.textContent='Serve fast!';timer=setInterval(()=>{time--;if(time<=0){clearInterval(timer);playing=false;document.getElementById('overlayTitle').textContent='Shift Over';ov.classList.add('visible')}},1000)};
document.getElementById('act').onclick=()=>{if(!playing)return;score+=10;hs.textContent=score;msg.textContent='Served! Score '+score};
document.getElementById('againBtn').onclick=()=>{clearInterval(timer);ov.classList.remove('visible');start.classList.remove('hidden');play.hidden=true};
