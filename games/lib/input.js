/**
 * @param {HTMLElement} el
 * @param {(dir: 'up'|'down'|'left'|'right') => void} onDir
 */
export function bindArrowKeys(onDir) {
  const map = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
  };
  function onKey(e) {
    const dir = map[e.key];
    if (!dir) return;
    e.preventDefault();
    onDir(dir);
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {(x: number, y: number) => void} onTap
 */
export function bindCanvasTap(canvas, onTap) {
  function handle(ev) {
    const r = canvas.getBoundingClientRect();
    const cx = ('touches' in ev && ev.touches.length) ? ev.touches[0].clientX : ev.clientX;
    const cy = ('touches' in ev && ev.touches.length) ? ev.touches[0].clientY : ev.clientY;
    const x = ((cx - r.left) / r.width) * canvas.width;
    const y = ((cy - r.top) / r.height) * canvas.height;
    onTap(x, y);
  }
  canvas.addEventListener('click', handle);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handle(e); }, { passive: false });
  return () => {
    canvas.removeEventListener('click', handle);
  };
}
