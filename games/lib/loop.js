/**
 * @param {{ update: (dt: number) => void, draw: () => void, fps?: number }} opts
 */
export function createGameLoop({ update, draw, fps = 60 }) {
  let rafId = 0;
  let last = 0;
  let paused = false;
  const frameMs = 1000 / fps;

  function tick(ts) {
    rafId = requestAnimationFrame(tick);
    if (paused) {
      last = ts;
      return;
    }
    if (!last) last = ts;
    let dt = ts - last;
    if (dt > 100) dt = frameMs;
    while (dt >= frameMs) {
      update(frameMs / 1000);
      dt -= frameMs;
    }
    last = ts - dt;
    draw();
  }

  return {
    start() {
      if (rafId) return;
      last = 0;
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      last = 0;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
      last = 0;
    },
    isPaused: () => paused,
  };
}
