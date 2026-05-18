/**
 * Performance tier detection + master animation loop
 */
'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection?.saveData === true;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const mem = navigator.deviceMemory || 4;
const cores = navigator.hardwareConcurrency || 4;
const narrow = window.matchMedia('(max-width: 768px)').matches;

let tier = 'high';
if (saveData || mem < 3) tier = 'low';
else if (narrow || mem < 5 || cores < 6) tier = 'medium';

export const perf = {
  tier,
  reducedMotion,
  coarsePointer,
  saveData,
  getDprCap() {
    const dpr = window.devicePixelRatio || 1;
    if (tier === 'low') return 1;
    if (tier === 'medium') return Math.min(dpr, 1.25);
    return Math.min(dpr, 2);
  },
  useGsapPin() {
    return tier === 'high' && !reducedMotion && !coarsePointer;
  },
};

const tickers = new Set();
let rafId = null;
let last = performance.now();
let paused = false;

export function registerTicker(fn) {
  tickers.add(fn);
  if (!rafId) loop();
}

export function unregisterTicker(fn) {
  tickers.delete(fn);
  if (!tickers.size && rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function loop(now) {
  rafId = requestAnimationFrame(loop);
  if (paused || document.hidden) return;
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  tickers.forEach((fn) => fn(dt, now));
}

export function setLoopPaused(p) {
  paused = p;
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) last = performance.now();
});

window.__perf = perf;
