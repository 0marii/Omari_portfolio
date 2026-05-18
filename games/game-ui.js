'use strict';

/** Global pause-on-blur + P key for canvas games */
(function initGameUI() {
  if (window.__gameUIInit) return;
  window.__gameUIInit = true;

  window.GameUI = {
    /** @type {(() => void) | null} */
    onPause: null,
    /** @type {(() => void) | null} */
    onResume: null,
    paused: false,

    togglePause() {
      this.paused = !this.paused;
      if (this.paused && this.onPause) this.onPause();
      if (!this.paused && this.onResume) this.onResume();
    },

    showOverlay(el) {
      if (el) el.classList.add('visible');
    },
    hideOverlay(el) {
      if (el) el.classList.remove('visible');
    },

    popHud(el) {
      if (!el) return;
      el.classList.remove('hud-pop');
      void el.offsetWidth;
      el.classList.add('hud-pop');
    },
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
      if (window.GameUI.onPause || window.GameUI.onResume) {
        e.preventDefault();
        window.GameUI.togglePause();
      }
    }
  });

  window.addEventListener('blur', () => {
    if (window.GameUI.onPause && !window.GameUI.paused) {
      window.GameUI.togglePause();
    }
  });
})();
