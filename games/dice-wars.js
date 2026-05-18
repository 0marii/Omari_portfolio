(function(){'use strict';

const c=document.getElementById('gameCanvas'); if(!c) return;
const x=c.getContext('2d');
const start=document.getElementById('startScreen');
const ov=document.getElementById('overlay');
const sub=document.getElementById('overlaySub');
const hs=document.getElementById('hudScore');
const hb=document.getElementById('hudBest');
let score=0,best=0,playing=false,W,H,round=0,playerWins=0,aiWins=0,animating=false,animFrame=0,playerRoll=1,aiRoll=1;
function lb(k){try{best=+localStorage.getItem(k)||0}catch{best=0}hb.textContent=best}
function save(k){if(score>best){best=score;try{localStorage.setItem(k,best)}catch{}}hb.textContent=best}
function go(subt){playing=false;sub.textContent=subt||('Score '+score);ov.classList.add('visible')}
function roundText(){if(round===0) return 'Ready to roll!'; return 'Last roll: '+playerRoll+' vs '+aiRoll}
function drawDie(cx,cy,value,size){const edge=size;const radius=18; x.save(); x.translate(cx,cy); x.fillStyle='#111827'; x.strokeStyle='#818cf8'; x.lineWidth=5; x.shadowColor='rgba(99,102,241,0.55)'; x.shadowBlur=12; x.beginPath(); x.roundRect(-edge/2,-edge/2,edge,edge,18); x.fill(); x.stroke(); x.shadowBlur=0; x.fillStyle='#f8fafc'; const dots={1:[{x:0,y:0}],2:[{x:-0.22,y:-0.22},{x:0.22,y:0.22}],3:[{x:-0.22,y:-0.22},{x:0, y:0},{x:0.22,y:0.22}],4:[{x:-0.22,y:-0.22},{x:0.22,y:-0.22},{x:-0.22,y:0.22},{x:0.22,y:0.22}],5:[{x:-0.22,y:-0.22},{x:0.22,y:-0.22},{x:0,y:0},{x:-0.22,y:0.22},{x:0.22,y:0.22}],6:[{x:-0.22,y:-0.28},{x:0.22,y:-0.28},{x:-0.22,y:0},{x:0.22,y:0},{x:-0.22,y:0.28},{x:0.22,y:0.28}]}; dots[value].forEach(dot=>{x.beginPath(); x.arc(dot.x*edge, dot.y*edge, radius, 0, Math.PI*2); x.fill();}); x.restore();}
function drawBoard(){x.fillStyle='#050510'; x.fillRect(0,0,W,H); x.fillStyle='#eef2ff'; x.font='28px Inter, sans-serif'; x.textAlign='center'; x.fillText('Dice Wars', W/2, 44); x.fillStyle='#c7d2fe'; x.font='16px Inter, sans-serif'; x.fillText('Click canvas to roll', W/2, 72); x.fillText('Round '+(round+1)+' of 5', W/2, 96); x.fillText('Score: '+score+'   |   '+playerWins+' - '+aiWins, W/2, 120); x.fillStyle='#fff'; x.font='18px Inter, sans-serif'; x.fillText(roundText(), W/2, 150);
  const shake = animating ? Math.sin(animFrame*0.4)*6 : 0;
  drawDie(W*0.32+shake, H*0.55, playerRoll, 110);
  drawDie(W*0.68-shake, H*0.55, aiRoll, 110);
  x.fillStyle='#a5b4fc'; x.font='16px Inter, sans-serif'; x.fillText('Player', W*0.32, H*0.75); x.fillText('AI', W*0.68, H*0.75);
}
function rollDice(){playerRoll=Math.ceil(Math.random()*6); aiRoll=Math.ceil(Math.random()*6)}
function playRound(){rollDice(); if(playerRoll>aiRoll){playerWins++; score++; if(hs) hs.textContent=String(score);} else if(aiRoll>playerRoll){aiWins++;} round++; if(round>=5||playerWins===3||aiWins===3){ save('dice_best'); if(playerWins>aiWins){go('You win!')} else if(playerWins<aiWins){go('You lose!')} else {go('Tie game!')} return; } drawBoard(); }
function roll(){ if(animating||!playing) return; animating=true; animFrame=0; const anim = setInterval(()=>{ animFrame++; rollDice(); drawBoard(); if(animFrame>16){ clearInterval(anim); animating=false; playRound(); } }, 40); }
function reset(){W=c.width; H=c.height; round=0; playerWins=0; aiWins=0; score=0; playerRoll=1; aiRoll=1; animating=false; if(hs) hs.textContent='0'; start.classList.add('hidden'); ov.classList.remove('visible'); playing=true; drawBoard(); }

c.addEventListener('click',()=>{ if(!playing) return; roll(); });
document.getElementById('startBtn').onclick=()=>{ lb('dice_best'); reset(); };
document.getElementById('againBtn').onclick=()=>{ start.classList.remove('hidden'); ov.classList.remove('visible'); playing=false; };
})();
