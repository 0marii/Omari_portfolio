#!/usr/bin/env python3
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from generate_all_games import w, canvas, dom_start, G

# pong
w("pong","Pong",canvas("W/S or ↑↓ · First to 7",640,400,"🏓"),"""'use strict';
const c=document.getElementById('gameCanvas'),x=c.getContext('2d'),W=640,H=400,start=document.getElementById('startScreen'),ov=document.getElementById('overlay'),sub=document.getElementById('overlaySub'),hs=document.getElementById('hudScore'),hb=document.getElementById('hudBest');
let p1,p2,ball,score,best,playing,raf,keys;
function lb(){try{best=+localStorage.getItem('pong_best')||0}catch{best=0}hb.textContent=best}
function reset(){p1={y:H/2-40,h:80};p2={y:H/2-40,h:80};ball={x:W/2,y:H/2,vx:5*(Math.random()>.5?1:-1),vy:3,r:8};score=[0,0];hs.textContent='0'}
function win(){playing=false;const s=score[0];if(s>best){best=s;try{localStorage.setItem('pong_best',best)}catch{}}hb.textContent=best;sub.textContent='You '+score[0]+' - AI '+score[1];ov.classList.add('visible')}
function loop(){if(!playing)return;x.fillStyle='#050510';x.fillRect(0,0,W,H);if(keys.w||keys.ArrowUp)p1.y=Math.max(0,p1.y-6);if(keys.s||keys.ArrowDown)p1.y=Math.min(H-p1.h,p1.y+6);p2.y+=(ball.y-(p2.y+p2.h/2))*0.08;p2.y=Math.max(0,Math.min(H-p2.h,p2.y));ball.x+=ball.vx;ball.y+=ball.vy;if(ball.y-ball.r<0||ball.y+ball.r>H)ball.vy*=-1;if(ball.x<30&&ball.y>p1.y&&ball.y<p1.y+p1.h){ball.vx=Math.abs(ball.vx);ball.vy+=(ball.y-(p1.y+p1.h/2))*0.1}else if(ball.x>W-30&&ball.y>p2.y&&ball.y<p2.y+p2.h)ball.vx=-Math.abs(ball.vx);if(ball.x<0){score[1]++;if(score[1]>=7)return win();ball={x:W/2,y:H/2,vx:5,vy:3,r:8}}if(ball.x>W){score[0]++;hs.textContent=score[0];if(score[0]>=7)return win();ball={x:W/2,y:H/2,vx:-5,vy:-3,r:8}}x.fillStyle='#6366f1';x.fillRect(10,p1.y,12,p1.h);x.fillStyle='#ec4899';x.fillRect(W-22,p2.y,12,p2.h);x.fillStyle='#f59e0b';x.beginPath();x.arc(ball.x,ball.y,ball.r,0,7);x.fill();raf=requestAnimationFrame(loop)}
document.getElementById('startBtn').onclick=()=>{reset();playing=true;keys={};start.classList.add('hidden');ov.classList.remove('visible');loop()};
document.getElementById('againBtn').onclick=()=>{cancelAnimationFrame(raf);start.classList.remove('hidden');document.getElementById('startBtn').click()};
window.onkeydown=e=>keys[e.key]=true;window.onkeyup=e=>keys[e.key]=false;lb();
""",hud=["Score","Best"])

# connect4
w("connect4","Connect 4",dom_start("🔴","Drop discs — beat the AI!")+'<div id="board" hidden></motion>'.replace('</motion>','</motion>').replace('<motion','<div'),"""'use strict';
import { } from './logic/connect4.js';
""",module=True)

print('batch2 partial')
