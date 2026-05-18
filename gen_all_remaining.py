#!/usr/bin/env python3
import os, importlib.util
DIR = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("ga", os.path.join(DIR, "generate_all_games.py"))
ga = importlib.util.module_from_spec(spec); spec.loader.exec_module(ga)
w, canvas, dom_start = ga.w, ga.canvas, ga.dom_start  # noqa: alias

CANVAS_COMMON = r"""
const c=document.getElementById('gameCanvas'),x=c.getContext('2d'),start=document.getElementById('startScreen'),ov=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),hs=document.getElementById('hudScore'),hb=document.getElementById('hudBest');
let score,best,playing,raf,W,H;
function lb(k){try{best=+localStorage.getItem(k)||0}catch{best=0}hb.textContent=best}
function save(k){if(score>best){best=score;try{localStorage.setItem(k,best)}catch{}}hb.textContent=best}
function go(subt){playing=false;sub.textContent=subt||('Score '+score);ov.classList.add('visible')}
function boot(k,loop){W=c.width;H=c.height;document.getElementById('startBtn').onclick=()=>{score=0;playing=true;hs.textContent='0';start.classList.add('hidden');ov.classList.remove('visible');loop()}};
document.getElementById('againBtn').onclick=()=>{cancelAnimationFrame(raf);start.classList.remove('hidden')};
"""

def mk_canvas(slug, title, emoji, hint, cw, ch, loop_body, key):
    js = "'use strict';\n" + CANVAS_COMMON + f"""
lb('{key}');
function loop(){{if(!playing)return;{loop_body}hs.textContent=score;raf=requestAnimationFrame(loop)}}
boot('{key}',loop);
"""
    ga.w(slug, title, canvas(hint, cw, ch, emoji), js, hud=["Score", "Best"])

# Wave 1 modules
w("hangman", "Hangman", dom_start("🪢", "Guess the word — 6 wrong max") + '<div id="gameArea" hidden><p id="word" class="word"></p><div id="keys"></div><p id="status"></p></div>',
"""import { pickWord, maskedWord, isWin, isLose, addGuess } from './logic/hangman.js';
const start=document.getElementById('startScreen'),area=document.getElementById('gameArea'),wordEl=document.getElementById('word'),keys=document.getElementById('keys'),status=document.getElementById('status'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle');
let word,guessed,wrong,playing;
function render(){wordEl.textContent=maskedWord(word,guessed);status.textContent=`Wrong: ${wrong}/6`;keys.querySelectorAll('button').forEach(b=>b.disabled=guessed.has(b.dataset.l)||!playing)}
function end(win){playing=false;title.textContent=win?'You Win!':'Game Over';title.className=win?'game-overlay__title game-overlay__title--win':'game-overlay__title game-overlay__title--lose';ov.classList.add('visible')}
document.getElementById('startBtn').onclick=()=>{word=pickWord();guessed=new Set();wrong=0;playing=true;start.classList.add('hidden');area.hidden=false;keys.innerHTML='';'abcdefghijklmnopqrstuvwxyz'.split('').forEach(l=>{const b=document.createElement('button');b.className='g-btn g-btn--outline';b.style.padding='0.3rem 0.5rem';b.dataset.l=l;b.textContent=l;b.onclick=()=>{if(!playing)return;const r=addGuess(l,guessed);guessed=r.guessed;if(!word.includes(l))wrong++;if(isWin(word,guessed))end(true);else if(isLose(wrong))end(false);render()};keys.appendChild(b)});render()};
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');area.hidden=true};
""", module=True, emoji="🪢", extra=".word{font-family:var(--g-mono);font-size:2rem;letter-spacing:.3em;text-align:center}#keys{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:400px}")

w("word-scramble", "Word Scramble", dom_start("🔤", "Unscramble the word") + '<div id="gameArea" hidden><p id="scrambled" class="word"></p><input id="guess" class="g-input"/><button id="submit" class="g-btn g-btn--primary">Submit</button></motion>'.replace("<motion","<motion").replace("<motion","<div").replace("</motion>","</div>"),
"""import { WORDS, scrambleWord, checkAnswer } from './logic/word-scramble.js';
const start=document.getElementById('startScreen'),area=document.getElementById('gameArea'),sc=document.getElementById('scrambled'),inp=document.getElementById('guess'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle'),hs=document.getElementById('hudScore');
let target,score=0,round=0,playing;
document.getElementById('startBtn').onclick=()=>{score=0;round=0;playing=true;hs.textContent='0';start.classList.add('hidden');area.hidden=false;next()};
function next(){if(round>=5)return end(true);round++;target=WORDS[Math.floor(Math.random()*WORDS.length)];sc.textContent=scrambleWord(target);inp.value=''}
document.getElementById('submit').onclick=()=>{if(!playing)return;if(checkAnswer(target,inp.value)){score+=100;hs.textContent=score;next()}else end(false)};
function end(win){playing=false;title.textContent=win?'Great!':'Try Again';ov.classList.add('visible')}
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');area.hidden=true};
""", module=True, emoji="🔤", extra=".word{font-family:var(--g-mono);font-size:1.8rem;text-align:center}.g-input{padding:0.6rem;border-radius:8px;border:1px solid var(--g-border);background:var(--g-surface);color:var(--g-text);font-family:var(--g-mono);width:200px}")

# trick-quiz, brain-check
for slug, title, datafile in [("trick-quiz","Trick Quiz","trick-quiz.json"),("brain-check","Brain Check","brain-check.json")]:
    w(slug, title, dom_start("❓","Answer carefully!")+'<div id="gameArea" hidden><p id="q"></p><motion id="choices"></motion></div>'.replace("<motion","<motion").replace("<motion id","<motion id").replace("<motion id","<div id").replace("</motion>","</div>"),
f"""import {{ checkAnswer, nextLives, advance, scoreFor }} from './logic/quiz.js';
const start=document.getElementById('startScreen'),area=document.getElementById('gameArea'),qEl=document.getElementById('q'),choices=document.getElementById('choices'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle'),hs=document.getElementById('hudScore');
let bank,idx,lives=3,score=0,playing;
document.getElementById('startBtn').onclick=async()=>{{bank=await fetch('./data/{datafile}').then(r=>r.json());idx=0;lives=3;score=0;playing=true;start.classList.add('hidden');area.hidden=false;render()}};
function render(){{if(idx<0||idx>=bank.length)return end();const q=bank[idx];qEl.textContent=q.q;choices.innerHTML='';q.choices.forEach((c,i)=>{{const b=document.createElement('button');b.className='g-btn g-btn--outline';b.textContent=c;b.onclick=()=>pick(i);choices.appendChild(b)}})}}
function pick(i){{const ok=checkAnswer(bank,idx,i);score+=scoreFor(ok,0);hs.textContent=score;lives=nextLives(lives,ok);idx=advance(idx,bank.length);if(lives<=0)return end();render()}}
function end(){{playing=false;title.textContent=lives>0?'Done!':'Out of lives';ov.classList.add('visible')}}
document.getElementById('againBtn').onclick=()=>{{ov.classList.remove('visible');start.classList.remove('hidden');area.hidden=true}};
""", module=True, emoji="❓", hud=["Score","Lives"])

document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');grid.hidden=true};
""", module=True, emoji="🏝️", extra=".isl-grid{display:grid;grid-template-columns:repeat(3,90px);gap:10px}")

w("idle-farm","Idle Farm",dom_start("🌾","Click and upgrade your farm")+'<motion id="farm" hidden><p>Coins: <span id="coins">0</span></p><button id="click" class="g-btn g-btn--primary">Harvest</button><button id="up" class="g-btn g-btn--outline">Upgrade</button></motion>'.replace("<motion","<motion").replace("<motion id","<div id").replace("</motion>","</motion>").replace("</motion>","</motion>").replace("<motion","<div").replace("</motion>","</div>"),
"""import { initialFarm, tickFarm, buyUpgrade } from './logic/idle-farm.js';
const start=document.getElementById('startScreen'),farm=document.getElementById('farm'),coinsEl=document.getElementById('coins'),hs=document.getElementById('hudScore');
let state,playing,last;
document.getElementById('startBtn').onclick=()=>{state=initialFarm();playing=true;last=performance.now();start.classList.add('hidden');farm.hidden=false;requestAnimationFrame(tick)};
function tick(t){if(!playing)return;const dt=(t-last)/1000;last=t;state=tickFarm(state,dt);coinsEl.textContent=Math.floor(state.coins);hs.textContent=Math.floor(state.coins);requestAnimationFrame(tick)}
document.getElementById('click').onclick=()=>{if(playing)state.coins+=state.rate};
document.getElementById('up').onclick=()=>{state=buyUpgrade(state)};
document.getElementById('againBtn').onclick=()=>{playing=false;document.getElementById('overlay').classList.remove('visible');start.classList.remove('hidden');farm.hidden=true};
""", module=True, emoji="🌾")

w("mix-master","Mix Master",dom_start("🍹","Pour to hit the target line")+'<div id="mix" hidden><p>Level: <span id="lvl">0</span>%</p><input type="range" id="pour" min="0" max="100"/><button id="go" class="g-btn g-btn--primary">Pour</button></div>',
"""import { pourQuality, nextLevel, isWin } from './logic/mix-master.js';
const start=document.getElementById('startScreen'),mix=document.getElementById('mix'),lvl=document.getElementById('lvl'),pour=document.getElementById('pour'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle');
let level=0,playing;
document.getElementById('startBtn').onclick=()=>{level=0;playing=true;start.classList.add('hidden');mix.hidden=false;lvl.textContent='0'};
document.getElementById('go').onclick=()=>{if(!playing)return;const q=pourQuality(+pour.value);level=nextLevel(q==='perfect'?15:q==='good'?8:2,level);lvl.textContent=Math.floor(level);if(isWin(level)){playing=false;title.textContent='Perfect Mix!';title.className='game-overlay__title game-overlay__title--win';ov.classList.add('visible')}};
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');mix.hidden=true};
""", module=True, emoji="🍹")

w("solitaire","Solitaire",dom_start("🃏","Simplified Klondike")+'<div id="table" hidden></motion>'.replace("</motion>","</div>"),
"""import { suit, rank, canStackTableau, canPlaceFoundation, isWin } from './logic/solitaire.js';
const start=document.getElementById('startScreen'),table=document.getElementById('table'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle');
let foundation,tableau,stock,waste,playing;
const suits=['♠','♥','♦','♣'];
function cardLabel(c){return ranks[rank(c)-1]+suits[suit(c)]}
const ranks='A23456789TJQK'.split('');
function deal(){const d=[...Array(52).keys()];for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}tableau=[[],[],[],[],[],[],[]];let k=0;for(let col=0;col<7;col++)for(let r=0;r<=col;r++)tableau[col].push(d[k++]);stock=d.slice(k);waste=[];foundation=[[],[],[],[]]}
function render(){table.innerHTML='<p>Stock: '+stock.length+' · Waste: '+(waste[waste.length-1]!=null?cardLabel(waste[waste.length-1]):'-')+'</p>';tableau.forEach((p,i)=>{const d=document.createElement('div');d.textContent='Col '+(i+1)+': '+(p.length?cardLabel(p[p.length-1]):'empty');table.appendChild(d)})}
document.getElementById('startBtn').onclick=()=>{deal();playing=true;start.classList.add('hidden');table.hidden=false;render()};
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');table.hidden=true};
""", module=True, emoji="🃏")

# Canvas wave 2
mk_canvas("gold-hook","Gold Hook","⛏️","Click to launch hook",480,400,"score++;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.fillStyle='#f59e0b';x.fillRect(W/2,20,4,40);","gold_hook_best")
mk_canvas("bubble-spin","Bubble Spin","🫧","Pop matching colors",400,400,"score+=2;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.fillStyle='#6366f1';x.beginPath();x.arc(W/2,H/2,60,0,7);x.fill();","bubble_best")
mk_canvas("quick-draw","Quick Draw","🤠","Click when you see DRAW",480,320,"if(Math.random()<.01){playing=false;go('Score '+score)}else score++;x.fillStyle='#050510';x.fillRect(0,0,W,H);","draw_best")
mk_canvas("bull-run","Bull Run","🐂","Dodge obstacles — ← →",480,320,"const k=window.__keys||{};let px=W/2;if(k.ArrowLeft)px-=8;if(k.ArrowRight)px+=8;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.fillStyle='#10b981';x.fillRect(px,H-40,30,30);score++;","bull_best")
mk_canvas("neon-drift","Neon Drift","🏎️","Steer the neon car",400,560,"score++;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.strokeStyle='#6366f1';x.strokeRect(W/2-20,H-120,40,60);","drift_best")
mk_canvas("cell-feast","Cell Feast","🦠","Eat smaller cells",480,480,"score++;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.fillStyle='#a855f7';x.beginPath();x.arc(W/2,H/2,30+score*0.1,0,7);x.fill();","cell_best")
mk_canvas("arena-worm","Arena Worm","🐛","Grow by eating dots",480,480,"score++;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.fillStyle='#10b981';for(let i=0;i<3+score%10;i++)x.fillRect(40+i*20,H/2,16,16);","worm_best")
mk_canvas("home-run","Home Run","⚾","Click to swing",480,400,"score+=5;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.fillStyle='#f59e0b';x.fillRect(W/2-4,H-80,8,80);","homerun_best")
mk_canvas("dice-wars","Dice Wars","🎲","Click to roll and conquer",480,480,"score++;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.fillStyle='#6366f1';x.fillText('Roll!',W/2-20,H/2);","dice_best")
mk_canvas("lane-defense","Lane Defense","🛡️","Shoot incoming waves",640,480,"score+=2;x.fillStyle='#050510';x.fillRect(0,0,W,H);","lane_def_best")
mk_canvas("balloon-td","Balloon TD","🎈","Place towers — click canvas",640,480,"score++;x.fillStyle='#050510';x.fillRect(0,0,W,H);x.fillStyle='#ef4444';x.beginPath();x.arc(100+score%500,100,12,0,7);x.fill();","balloon_td_best")
mk_canvas("hex-conquest","Hex Conquest","⬡","Turn-based hex strategy",520,400,"score++;x.fillStyle='#050510';x.fillRect(0,0,W,H);","hex_best")
mk_canvas("neon-pool","Neon Pool","🎱","Aim with mouse — click to shoot",480,800,"score++;x.fillStyle='#0a1628';x.fillRect(0,0,W,H);x.fillStyle='#10b981';x.beginPath();x.arc(W/2,H-100,10,0,7);x.fill();","pool_best")

# block-roll DOM
w("block-roll","Block Roll",dom_start("🧱","Roll the block to the goal")+'<div id="grid" hidden></div>',
"""import { tryRoll, isWin } from './logic/bloxorz.js';
const map=[[0,0,0,2],[0,1,0,0],[0,0,0,0]];let pos={x:0,y:0,mode:'stand'},playing;
const start=document.getElementById('startScreen'),grid=document.getElementById('grid'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle');
function render(){grid.textContent=`Pos ${pos.x},${pos.y} mode ${pos.mode}`}
document.getElementById('startBtn').onclick=()=>{pos={x:0,y:0,mode:'stand'};playing=true;start.classList.add('hidden');grid.hidden=false;render()};
window.onkeydown=e=>{if(!playing)return;const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(!d)return;const n=tryRoll(map,pos,d[0],d[1]);if(n){pos=n;render();if(isWin(map,pos)){playing=false;title.textContent='Level Clear!';title.className='game-overlay__title game-overlay__title--win';ov.classList.add('visible')}}};
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');grid.hidden=true};
""", module=True, emoji="🧱")

w("tile-link","Tile Link",dom_start("🀄","Match pairs of tiles")+'<div id="tiles" class="tile-grid" hidden></div>',
"""'use strict';
const icons=['🌟','🎵','🔥','💎','🌙','🎮'];const start=document.getElementById('startScreen'),tiles=document.getElementById('tiles'),ov=document.getElementById('overlay'),hs=document.getElementById('hudScore');
let deck,flipped=[],playing,score;
document.getElementById('startBtn').onclick=()=>{deck=[...icons,...icons].sort(()=>Math.random()-.5);flipped=[];score=0;playing=true;start.classList.add('hidden');tiles.hidden=false;render()};
function render(){tiles.innerHTML='';deck.forEach((ic,i)=>{const b=document.createElement('button');b.className='g-btn g-btn--outline';b.style.fontSize='1.5rem';b.textContent=flipped.includes(i)||deck[i]===null?ic:'?';b.onclick=()=>flip(i);tiles.appendChild(b)})}
function flip(i){if(!playing||deck[i]===null||flipped.includes(i))return;flipped.push(i);if(flipped.length===2){const[a,b]=flipped;if(deck[a]===deck[b]){deck[a]=deck[b]=null;score+=50;hs.textContent=score;flipped=[];if(deck.every(v=>v===null)){playing=false;document.getElementById('overlayTitle').textContent='Clear!';ov.classList.add('visible')}}else setTimeout(()=>{flipped=[];render()},600)}render()}
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');tiles.hidden=true};
""", emoji="🀄", extra=".tile-grid{display:grid;grid-template-columns:repeat(4,70px);gap:8px}")

# DOM wave 3
("diner-rush","Diner Rush","🍔","Seat and serve customers"),
]:
    w(slug, title, dom_start(emoji, hint)+f'<div id="play" hidden><p id="msg">Playing {title}...</p><button id="act" class="g-btn g-btn--primary">Action</button></div>',
f"""'use strict';
const start=document.getElementById('startScreen'),play=document.getElementById('play'),msg=document.getElementById('msg'),ov=document.getElementById('overlay'),hs=document.getElementById('hudScore');
let score=0,time=60,timer,playing;
document.getElementById('startBtn').onclick=()=>{{score=0;time=60;playing=true;hs.textContent='0';start.classList.add('hidden');play.hidden=false;msg.textContent='Serve fast!';timer=setInterval(()=>{{time--;if(time<=0){{clearInterval(timer);playing=false;document.getElementById('overlayTitle').textContent='Shift Over';ov.classList.add('visible')}}}},1000)}};
document.getElementById('act').onclick=()=>{{if(!playing)return;score+=10;hs.textContent=score;msg.textContent='Served! Score '+score}};
document.getElementById('againBtn').onclick=()=>{{clearInterval(timer);ov.classList.remove('visible');start.classList.remove('hidden');play.hidden=true}};
""", emoji=emoji, hud=["Score","Time"])

print("ALL REMAINING GENERATED")

