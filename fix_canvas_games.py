#!/usr/bin/env python3
import os, re
G = os.path.join(os.path.dirname(__file__), "..", "games")

CANVAS_SLUGS = [
    "gold-hook", "bubble-spin", "bull-run", "neon-drift",
    "cell-feast", "home-run", "dice-wars", "lane-defense", "balloon-td", "hex-conquest", "neon-pool",
]

FOOTER = r"""
let t0=0;
const origBoot=boot;
boot=function(k,loop){
  document.getElementById('startBtn').onclick=()=>{
    score=0;playing=true;t0=performance.now();hs.textContent='0';
    start.classList.add('hidden');ov.classList.remove('visible');
    requestAnimationFrame(loop);
  };
};
document.getElementById('againBtn').onclick=()=>{
  cancelAnimationFrame(raf);start.classList.remove('hidden');ov.classList.remove('visible');
};
window.__keys={};
window.addEventListener('keydown',e=>{window.__keys[e.key]=true;});
window.addEventListener('keyup',e=>{window.__keys[e.key]=false;});
"""

for slug in CANVAS_SLUGS:
    path = os.path.join(G, f"{slug}.js")
    if not os.path.exists(path):
        continue
    txt = open(path).read()
    if "t0=performance.now()" in txt:
        continue
    # inject game-over after score increment in loop
    txt = re.sub(
        r"(function loop\(\)\{if\(!playing\)return;)",
        r"\1if(score>=80){save('" + slug.replace("-", "_") + "_best');return go('Great run!');}",
        txt,
        count=1,
    )
    if "function save" not in txt:
        txt = txt.replace(
            "function go(subt)",
            "function save(k){if(score>best){best=score;try{localStorage.setItem(k,best)}catch{}}hb.textContent=best}\nfunction go(subt)",
        )
    if "window.__keys" not in txt:
        txt += FOOTER
    open(path, "w").write(txt)
    print("fixed", slug)
