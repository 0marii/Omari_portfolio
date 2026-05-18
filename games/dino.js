(function(){'use strict';
const c = document.getElementById('gameCanvas');
if (!c) return;
const x = c.getContext('2d');
const W = 800;
const H = 200;
const groundY = H - 24;
const start = document.getElementById('startScreen');
const ov = document.getElementById('overlay');
const sub = document.getElementById('overlaySub');
const hs = document.getElementById('hudScore');
const hb = document.getElementById('hudBest');

let d, obs, score, best, playing, vy, raf, frame;

function lb() {
  try { best = +localStorage.getItem('dino_best') || 0; } catch { best = 0; }
  hb.textContent = best;
}

function reset() {
  d = { x: 60, y: groundY - 40, w: 34, h: 40 };
  obs = [];
  score = 0;
  vy = 0;
  frame = 0;
  hs.textContent = '0';
}

function saveScore() {
  if (score > best) {
    best = score;
    try { localStorage.setItem('dino_best', best); } catch {}
  }
  hb.textContent = best;
}

function go() {
  playing = false;
  saveScore();
  sub.textContent = 'Score ' + score;
  ov.classList.add('visible');
}

function drawDino() {
  const legOffset = Math.sin(frame * 0.2) > 0 ? 3 : 0;
  x.fillStyle = '#222';
  x.fillRect(d.x, d.y + 20, 34, 20);
  x.fillRect(d.x + 26, d.y + 8, 10, 16);
  x.fillRect(d.x + 2, d.y, 16, 18);
  x.fillRect(d.x + 14, d.y + 4, 14, 10);
  x.fillRect(d.x + 6, d.y + 32, 8, 10);
  x.fillRect(d.x + 20, d.y + 32 + legOffset, 8, 10);
}

function drawCactus(o) {
  x.fillStyle = '#222';
  x.fillRect(o.x, groundY - o.h, o.w, o.h);
  x.fillRect(o.x - 4, groundY - o.h + 10, 8, 8);
  x.fillRect(o.x + o.w - 4, groundY - o.h + 6, 8, 8);
  x.fillRect(o.x + o.w / 2 - 3, groundY - o.h - 8, 6, 8);
}

function draw() {
  x.fillStyle = '#f7f7f7';
  x.fillRect(0, 0, W, H);

  x.fillStyle = '#757575';
  x.fillRect(0, groundY, W, 4);

  obs.forEach(o => drawCactus(o));
  drawDino();

  x.fillStyle = '#222';
  x.font = '20px Inter, sans-serif';
  x.textAlign = 'right';
  x.fillText(String(score).padStart(5, '0'), W - 20, 34);
}

function spawnObstacle() {
  const speed = 6 + Math.min(6, Math.floor(score / 100));
  if (Math.random() < 0.015) {
    const height = 30 + Math.random() * 24;
    const width = 16;
    obs.push({ x: W, h: height, w: width, speed });
  }
}

function update() {
  d.y += vy;
  vy += 0.8;
  if (d.y >= groundY - d.h) {
    d.y = groundY - d.h;
    vy = 0;
  }

  const speed = 6 + Math.min(6, Math.floor(score / 100));
  obs.forEach(o => {
    o.x -= o.speed || speed;
    const dinoRight = d.x + d.w;
    const dinoBottom = d.y + d.h;
    if (o.x < dinoRight && o.x + o.w > d.x && groundY - o.h < dinoBottom) {
      go();
    }
  });
  obs = obs.filter(o => o.x > -40);

  spawnObstacle();
  score += 1;
  hs.textContent = score;
}

function loop() {
  if (!playing) return;
  frame += 1;
  update();
  draw();
  raf = requestAnimationFrame(loop);
}

function jmp() {
  if (!playing) return;
  if (d.y >= groundY - d.h) vy = -12;
}

document.getElementById('startBtn').onclick = () => {
  reset();
  playing = true;
  start.classList.add('hidden');
  ov.classList.remove('visible');
  loop();
};

document.getElementById('againBtn').onclick = () => {
  cancelAnimationFrame(raf);
  start.classList.remove('hidden');
  document.getElementById('startBtn').click();
};

window.onkeydown = e => {
  if (e.code === 'Space') {
    e.preventDefault();
    jmp();
  }
};

c.onclick = jmp;

lb();
})();
