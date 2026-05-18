'use strict';
const icons=['🌟','🎵','🔥','💎','🌙','🎮'];const start=document.getElementById('startScreen'),tiles=document.getElementById('tiles'),ov=document.getElementById('overlay'),hs=document.getElementById('hudScore');
let deck,flipped=[],playing,score;
document.getElementById('startBtn').onclick=()=>{deck=[...icons,...icons].sort(()=>Math.random()-.5);flipped=[];score=0;playing=true;start.classList.add('hidden');tiles.hidden=false;render()};
function render(){tiles.innerHTML='';deck.forEach((ic,i)=>{const b=document.createElement('button');b.className='g-btn g-btn--outline';b.style.fontSize='1.5rem';b.textContent=flipped.includes(i)||deck[i]===null?ic:'?';b.onclick=()=>flip(i);tiles.appendChild(b)})}
function flip(i){if(!playing||deck[i]===null||flipped.includes(i))return;flipped.push(i);if(flipped.length===2){const[a,b]=flipped;if(deck[a]===deck[b]){deck[a]=deck[b]=null;score+=50;hs.textContent=score;flipped=[];if(deck.every(v=>v===null)){playing=false;document.getElementById('overlayTitle').textContent='Clear!';ov.classList.add('visible')}}else setTimeout(()=>{flipped=[];render()},600)}render()}
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');tiles.hidden=true};
