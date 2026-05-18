#!/usr/bin/env python3
import os, importlib.util

DIR = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("ga", os.path.join(DIR, "generate_all_games.py"))
ga = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ga)
w, canvas, dom_start, G = ga.w, ga.canvas, ga.dom_start, ga.G

def go(items):
    for item in items:
        slug, title, body, js = item[:4]
        kw = item[4] if len(item) > 4 else {}
        w(slug, title, body, js, **kw)

# Tower - vanilla canvas
tower_html_body = '''<div class="canvas-wrap" style="width:min(100%,400px)">
<canvas id="gameCanvas" width="400" height="560"></canvas>
<div id="startScreen"><span class="start-emoji">🏗️</span><p class="start-hint">Click or Enter to drop the swinging block</p>
<button type="button" class="g-btn g-btn--primary" id="startBtn">Start</button></div></div>
<p class="start-hint" style="margin-top:.5rem">Space — restart after game over</p>'''
tower_js = r"""'use strict';
const c=document.getElementById('gameCanvas'),x=c.getContext('2d'),W=400,H=560,start=document.getElementById('startScreen'),ov=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),hf=document.getElementById('hudFloors'),hb=document.getElementById('hudBest');
let blocks,swing,playing,score,best,raf,dir=1;
function lb(){try{best=+localStorage.getItem('tower_best')||0}catch{best=0}hb.textContent=best}
function reset(){blocks=[{x:50,y:H-40,w:W-100,h:30}];swing={x:0,w:80,y:80,t:0};score=0;playing=true;hf.textContent='0';start.classList.add('hidden');ov.classList.remove('visible');loop()}
function drop(){const top=blocks[blocks.length-1];const w=swing.w;const bx=swing.x;const overlap=Math.min(bx+w,top.x+top.w)-Math.max(bx,top.x);if(overlap<=10){playing=false;sub.textContent='Score '+score+' · Best '+best;ov.classList.add('visible');return}
const nx=Math.max(bx,top.x);blocks.push({x:nx,y:top.y-32,w:overlap,h:28});score++;hf.textContent=score;if(score>best){best=score;try{localStorage.setItem('tower_best',best)}catch{}hb.textContent=best}
swing={x:0,w:overlap,y:blocks[blocks.length-1].y-50,t:0}}
function loop(){if(!playing)return;x.fillStyle='#050510';x.fillRect(0,0,W,H);blocks.forEach(b=>{x.fillStyle='#6366f1';x.fillRect(b.x,b.y,b.w,b.h)});swing.t+=0.04*dir;swing.x=(W-swing.w)/2+Math.sin(swing.t)*(W-swing.w-20)/2;x.fillStyle='#f59e0b';x.fillRect(swing.x,swing.y,swing.w,24);raf=requestAnimationFrame(loop)}
document.getElementById('startBtn').onclick=()=>{lb();reset()};
document.getElementById('againBtn').onclick=()=>{cancelAnimationFrame(raf);start.classList.remove('hidden')};
c.addEventListener('click',()=>playing&&drop());window.onkeydown=e=>{if(e.code==='Space'&&ov.classList.contains('visible')){ov.classList.remove('visible');reset()}if(e.code==='Enter')drop()};
lb();
"""
w("tower", "Building Tower", tower_html_body, tower_js, js_name="tower-game.js", hud=["Floors", "Best"], emoji="🏗️")

MODULE_BOOT = r"""
const start=document.getElementById('startScreen'),ov=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),title=document.getElementById('overlayTitle');
function showEnd(msg,win){title.textContent=msg;title.className=win?'game-overlay__title game-overlay__title--win':'game-overlay__title game-overlay__title--lose';sub.textContent='';ov.classList.add('visible')}
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');location.reload()};
"""

go([
("connect4","Connect 4",dom_start("🔴","Click column to drop")+'<motion id="board" hidden></motion>'.replace("<motion ","<div ").replace("</motion>","</motion>").replace("</motion>","</div>"),
r"""'use strict';
const R=6,C=7,start=document.getElementById('startScreen'),boardEl=document.getElementById('board'),ov=document.getElementById('overlay'),title=document.getElementById('overlayTitle');
let g,turn,playing,me=1,ai=2;
const empty=()=>Array.from({length:R},()=>Array(C).fill(0));
function check(p){for(let y=0;y<R;y++)for(let x=0;x<C;x++){if(g[y][x]!==p)continue;for(const[dy,dx]of[[0,1],[1,0],[1,1],[1,-1]]){let n=1;for(let k=1;k<4;k++){const ny=y+dy*k,nx=x+dx*k;if(g[ny]?.[nx]===p)n++;else break}if(n>=4)return true}}return false}
function render(){boardEl.innerHTML='';boardEl.style.display='grid';boardEl.style.gridTemplateColumns=`repeat(${C},minmax(40px,1fr))`;boardEl.style.gap='6px';
for(let c=0;c<C;c++){const b=document.createElement('button');b.textContent='⬇';b.className='g-btn g-btn--outline';b.style.padding='0.3rem';b.onclick=()=>play(c);boardEl.appendChild(b)}
for(let y=0;y<R;y++)for(let x=0;x<C;x++){const d=document.createElement('motion');d.className='cell';d.textContent=g[y][x]===me?'🔴':g[y][x]===ai?'🟡':'';boardEl.appendChild(d)}}
function play(c){if(!playing)return;for(let y=R-1;y>=0;y--)if(!g[y][c]){g[y][c]=turn;if(check(turn))return end(turn===me);if(g.every(r=>r.every(v=>v)))return end(null);turn=turn===me?ai:me;render();if(turn===ai)setTimeout(()=>{for(let cc=0;cc<C;cc++){for(let y=R-1;y>=0;y--)if(!g[y][cc]){g[y][cc]=ai;if(check(ai))return end(false);break}}render();if(!check(ai)&&!g.every(r=>r.every(v=>v)))turn=me},400);return}}
function end(w){playing=false;title.textContent=w===true?'You Win!':w===false?'AI Wins':'Draw';title.className=w===true?'game-overlay__title game-overlay__title--win':'game-overlay__title';ov.classList.add('visible')}
document.getElementById('startBtn').onclick=()=>{g=empty();turn=me;playing=true;start.classList.add('hidden');boardEl.hidden=false;render()};
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');boardEl.hidden=true};
""".replace("<motion","<div").replace("</motion>","</div>"),
dict(emoji="🔴",extra=".cell{aspect-ratio:1;border-radius:50%;border:1px solid var(--g-border);background:var(--g-card);display:flex;align-items:center;justify-content:center;font-size:1.2rem}")),
])

print("tower, connect4 done")
