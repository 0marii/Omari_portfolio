#!/usr/bin/env python3
"""Generate all remaining M.GAMES files."""
import os, importlib.util

spec = importlib.util.spec_from_file_location("g", os.path.join(os.path.dirname(__file__), "generate_all_games.py"))
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)
w, canvas, dom_start = g.w, g.canvas, g.dom_start
G = g.G

games = []

# connect4
games.append(("connect4", "Connect 4", dom_start("🔴", "Click a column — connect 4 to win!") + '<div id="board" hidden></motion>'.replace("</motion>", "</div>"), r"""'use strict';
const ROWS=6,COLS=7,start=document.getElementById('startScreen'),boardEl=document.getElementById('board'),ov=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),title=document.getElementById('overlayTitle');
let grid,turn,playing,human=1,ai=2;
function empty(){return Array.from({length:ROWS},()=>Array(COLS).fill(0))}
function render(){boardEl.style.display='grid';boardEl.style.gridTemplateColumns=`repeat(${COLS},48px)`;boardEl.style.gap='4px';boardEl.innerHTML='';
for(let c=0;c<COLS;c++){const col=document.createElement('button');col.className='col-btn';col.textContent='▼';col.onclick=()=>drop(c);boardEl.appendChild(col)}
for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const cell=document.createElement('div');cell.className='cell';const v=grid[r][c];cell.textContent=v===human?'🔴':v===ai?'🟡':'';boardEl.appendChild(cell)}}
function drop(c){if(!playing)return;for(let r=ROWS-1;r>=0;r--)if(!grid[r][c]){grid[r][c]=turn;if(win(turn)){end(turn===human);return}if(full()){end(null);return}turn=turn===human?ai:human;if(turn===ai)setTimeout(aiMove,300);return}}
function full(){return grid.every(row=>row.every(v=>v))}
function win(p){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(!grid[r][c]||grid[r][c]!==p)continue;
const dirs=[[1,0],[0,1],[1,1],[1,-1]];for(const[dr,dc]of dirs){let n=1;for(let k=1;k<4;k++){const nr=r+dr*k,nc=c+dc*k;if(grid[nr]?.[nc]===p)n++;else break}if(n>=4)return true}}return false}
function aiMove(){let best=-1,bc=0;for(let c=0;c<COLS;c++){for(let r=ROWS-1;r>=0;r--)if(!grid[r][c]){grid[r][c]=ai;if(win(ai)){best=c;grid[r][c]=0;bc=100;break}grid[r][c]=0;if(bc<100)best=c;break}}drop(best>=0?best:0)}
function end(w){playing=false;title.textContent=w===true?'You Win!':w===false?'AI Wins':'Draw';title.className=w===true?'game-overlay__title game-overlay__title--win':'game-overlay__title game-overlay__title--lose';sub.textContent='';ov.classList.add('visible')}
document.getElementById('startBtn').onclick=()=>{grid=empty();turn=human;playing=true;start.classList.add('hidden');boardEl.hidden=false;render()};
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');boardEl.hidden=true};
""", dict(emoji="🔴", extra=".col-btn{width:48px;height:32px;border-radius:8px;border:1px solid var(--g-border);background:var(--g-surface);cursor:pointer}.cell{width:48px;height:48px;border-radius:50%;border:1px solid var(--g-border);background:var(--g-card);display:flex;align-items:center;justify-content:center;font-size:1.4rem}#board{display:grid;gap:4px}")))

for slug, title, body, js, kw in games:
    w(slug, title, body, js, **kw)

print("connect4")
