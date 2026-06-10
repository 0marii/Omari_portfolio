'use strict';
const grid=document.getElementById('grid'),start=document.getElementById('startScreen'),overlay=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),title=document.getElementById('overlayTitle'),emoji=document.getElementById('overlayEmoji');
let b=Array(9).fill(''),human='X',ai='O',playing=false;
function lines(){return[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];}
function winner(bd){for(const L of lines()){const[a,c,d]=L;if(bd[a]&&bd[a]===bd[c]&&bd[a]===bd[d])return bd[a];}return bd.every(c=>c)?'draw':null;}
function minimax(bd,isMax){const w=winner(bd);if(w==='X')return{score:-10};if(w==='O')return{score:10};if(w==='draw')return{score:0};
let best=isMax?{score:-1e9}:{score:1e9};
for(let i=0;i<9;i++){if(bd[i])continue;bd[i]=isMax?ai:human;const s=minimax(bd,!isMax).score;bd[i]='';
if(isMax){if(s>best.score)best={score:s,idx:i};}else{if(s<best.score)best={score:s,idx:i};}}
return best;}
function render(){grid.innerHTML='';b.forEach((v,i)=>{const btn=document.createElement('button');btn.className='cell';btn.textContent=v==='X'?'✕':v==='O'?'○':'';btn.disabled=!!v||!playing;btn.onclick=()=>move(i);grid.appendChild(btn);});}
function end(w){playing=false;overlay.classList.add('visible');if(w==='draw'){title.textContent='Draw';title.className='game-overlay__title';emoji.textContent='🤝';sub.textContent='';}else if(w===human){title.textContent='You Win!';title.className='game-overlay__title game-overlay__title--win';emoji.textContent='🏆';sub.textContent='';}else{title.textContent='AI Wins';title.className='game-overlay__title game-overlay__title--lose';emoji.textContent='🤖';sub.textContent='';}}
function move(i){if(!playing||b[i])return;b[i]=human;render();const w=winner(b);if(w)return end(w);const aiMove=minimax(b,true).idx;b[aiMove]=ai;render();const w2=winner(b);if(w2)return end(w2);}
document.getElementById('startBtn').onclick=()=>{b=Array(9).fill('');playing=true;start.classList.add('hidden');grid.hidden=false;render();};
document.getElementById('againBtn').onclick=()=>{overlay.classList.remove('visible');start.classList.remove('hidden');grid.hidden=true;};
