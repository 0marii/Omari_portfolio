#!/usr/bin/env python3
"""Generate all M.GAMES HTML + JS files."""
import os
import json

G = os.path.join(os.path.dirname(__file__), "..", "games")


def shell(title, slug, emoji, hud, body, extra="", module=False, script=None):
    hud_items = []
    for label in (hud or ["Score", "Best"]):
        lid = "hud" + label.replace(" ", "")
        hud_items.append(
            f'<div class="hud-item"><span class="hud-item__label">{label}</span>'
            f'<span class="hud-item__value" id="{lid}">0</span></div>'
        )
    mod = ' type="module"' if module else ""
    scr = script or f"{slug}.js"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="icon" type="image/png" href="../Images/logo.png"/>
<title>{title} — M.Games</title>
<link rel="stylesheet" href="shared.css"/>
<style>
.game-main{{gap:1rem;min-height:50vh}}
#startScreen{{position:absolute;inset:0;z-index:5;background:rgba(5,5,16,.88);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;border-radius:12px}}
#startScreen.hidden{{opacity:0;pointer-events:none;visibility:hidden}}
.start-emoji{{font-size:3rem}}.start-hint{{font-family:var(--g-mono);font-size:.8rem;color:var(--g-muted);text-align:center;padding:0 1rem;max-width:24rem}}
.canvas-wrap{{position:relative;width:min(100%,640px);border-radius:12px;overflow:hidden;border:1px solid var(--g-border)}}
.canvas-wrap canvas{{display:block;width:100%;touch-action:none}}
{extra}
</style>
</head>
<body>
<div class="g-noise" aria-hidden="true"></div>
<header class="game-header"><div class="game-header__inner">
<a href="./" class="game-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back</a>
<span class="game-title">{title.upper()}</span>
<div class="game-hud">{"".join(hud_items)}</div>
</div></header>
<main class="game-main">{body}</main>
<div class="game-overlay" id="overlay"><div class="game-overlay__box">
<span class="game-overlay__emoji" id="overlayEmoji">{emoji}</span>
<div class="game-overlay__title" id="overlayTitle">Game Over</div>
<p class="game-overlay__sub" id="overlaySub"></p>
<button type="button" class="g-btn g-btn--primary" id="againBtn">Play Again</button>
</div></div>
<script{mod} src="{scr}"></script><script src="game-ui.js"></script>
</body></html>""".replace("<motion ", "<div ")


def w(slug, title, body, js, **kw):
    path = os.path.join(G, f"{slug}.html")
    with open(path, "w") as f:
        f.write(
            shell(
                title,
                slug,
                kw.get("emoji", "🎮"),
                kw.get("hud"),
                body,
                kw.get("extra", ""),
                kw.get("module", False),
                kw.get("script"),
            )
        )
    jname = kw.get("js_name", f"{slug}.js")
    with open(os.path.join(G, jname), "w") as f:
        f.write(js)


def canvas(hint, w, h, emoji="🎮"):
    return f"""<div class="canvas-wrap">
<canvas id="gameCanvas" width="{w}" height="{h}"></canvas>
<div id="startScreen"><span class="start-emoji">{emoji}</span>
<p class="start-hint">{hint}</p><button type="button" class="g-btn g-btn--primary" id="startBtn">Start</button></div></div>"""


def dom_start(emoji, hint, inner=""):
    return f"""<div id="startScreen"><span class="start-emoji">{emoji}</span>
<p class="start-hint">{hint}</p>{inner}<button type="button" class="g-btn g-btn--primary" id="startBtn">Start</button></div>"""


# --- ORIGINALS ---
w(
    "whack",
    "Whack-a-Mole",
    dom_start("🔨", "Click moles before time runs out!")
    + '<motion id="grid" class="mole-grid" hidden></motion>'.replace("<motion ", "<div "),
    """'use strict';
const grid=document.getElementById('grid'),start=document.getElementById('startScreen'),ov=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),hs=document.getElementById('hudScore'),hb=document.getElementById('hudBest'),ht=document.getElementById('hudTime');
let score,best,time,playing,timer;
function lb(){try{best=+localStorage.getItem('whack_best')||0}catch{best=0}hb.textContent=best}
function build(){grid.innerHTML='';for(let i=0;i<9;i++){const b=document.createElement('button');b.className='hole';b.textContent='🕳️';b.onclick=()=>whack(i,b);grid.appendChild(b)}}
function pop(){document.querySelectorAll('.hole').forEach(b=>{b.textContent=Math.random()<.25?'🐹':'🕳️';b.dataset.active=b.textContent==='🐹'})}
function whack(i,b){if(!playing||b.textContent!=='🐹')return;score+=10;hs.textContent=score;b.textContent='🕳️'}
function end(){clearInterval(timer);playing=false;if(score>best){best=score;try{localStorage.setItem('whack_best',best)}catch{}}hb.textContent=best;sub.textContent='Score '+score;ov.classList.add('visible')}
document.getElementById('startBtn').onclick=()=>{score=0;time=30;playing=true;hs.textContent='0';ht.textContent='30';start.classList.add('hidden');grid.hidden=false;build();timer=setInterval(()=>{pop();time--;ht.textContent=time;if(time<=0)end()},1000)};
document.getElementById('againBtn').onclick=()=>{ov.classList.remove('visible');start.classList.remove('hidden');grid.hidden=true};
lb();
""",
    emoji="🔨",
    hud=["Score", "Best", "Time"],
    extra=".mole-grid{display:grid;grid-template-columns:repeat(3,100px);gap:10px}.hole{width:100px;height:100px;font-size:2rem;border-radius:50%;border:1px solid var(--g-border);background:var(--g-card);cursor:pointer}",
)

print("whack")
