/**
 * Mongols-style project exhibition — pinned slides, modal READ MORE, progress
 */
import { perf } from './perf.js';

function initProjectsExhibit() {
  const section = document.getElementById('projects');
  if (!section || typeof gsap === 'undefined') return;

  const progressEl = section.querySelector('.exhibit-progress span');
  const slides = section.querySelectorAll('.exhibit-slide');
  const dialog = document.getElementById('exhibitDialog');
  const dialogBody = document.getElementById('exhibitDialogBody');
  const dialogClose = dialog?.querySelector('.exhibit-dialog__close');
  const usePin = !perf.reducedMotion;

  /* ── Pin each full-viewport slide ── */
  if (usePin) {
    slides.forEach((slide) => {
      const viewport = slide.querySelector('.exhibit-slide__viewport');
      if (!viewport) return;

      ScrollTrigger.create({
        trigger: slide,
        start: 'top top',
        end: '+=130%',
        pin: viewport,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => activateSlide(slide),
        onEnterBack: () => activateSlide(slide),
        onToggle: (self) => {
          slide.classList.toggle('exhibit-slide--active', self.isActive);
        },
      });

      /* Fade content in as slide enters */
      const content = slide.querySelector('.exhibit-slide__content');
      const art = slide.querySelector('.exhibit-slide__art');
      if (content && !perf.reducedMotion) {
        gsap.fromTo(
          content,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: slide,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
        if (art) {
          gsap.fromTo(
            art,
            { opacity: 0, scale: 0.94, x: 40 },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              duration: 1.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: slide,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      }
    });
  } else {
    section.classList.add('projects-exhibition--no-pin');
  }

  /* ── READ MORE → native dialog ── */
  slides.forEach((slide) => {
    const btn = slide.querySelector('.exhibit-slide__more');
    const source = slide.querySelector('.exhibit-detail-source');
    if (!btn || !source || !dialog || !dialogBody) return;

    btn.addEventListener('click', () => {
      dialogBody.innerHTML = source.innerHTML;
      dialog.showModal();
      document.body.classList.add('exhibit-dialog-open');
    });
  });

  function closeDialog() {
    if (!dialog?.open) return;
    dialog.close();
    document.body.classList.remove('exhibit-dialog-open');
    dialogBody.innerHTML = '';
  }

  dialogClose?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) closeDialog();
  });
  dialog?.addEventListener('cancel', () => {
    document.body.classList.remove('exhibit-dialog-open');
    dialogBody.innerHTML = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDialog();
  });

  /* ── Section scroll progress ── */
  let progRaf = 0;
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (!progressEl) return;
      cancelAnimationFrame(progRaf);
      progRaf = requestAnimationFrame(() => {
        progressEl.textContent = `${Math.round(self.progress * 100)}%`;
      });
    },
  });

  const intro = section.querySelector('.exhibit-intro');
  if (intro) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      onEnter: () => intro.classList.add('exhibit-intro--passed'),
      onLeaveBack: () => intro.classList.remove('exhibit-intro--passed'),
    });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 180);
  });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 20%',
    end: 'bottom 80%',
    onEnter: () => document.body.classList.add('in-projects', 'cursor-in-projects'),
    onLeave: () => document.body.classList.remove('in-projects', 'cursor-in-projects'),
    onEnterBack: () => document.body.classList.add('in-projects', 'cursor-in-projects'),
    onLeaveBack: () => document.body.classList.remove('in-projects', 'cursor-in-projects'),
  });

  section.addEventListener('mouseenter', () => document.body.classList.add('cursor-in-projects'));
  section.addEventListener('mouseleave', () => document.body.classList.remove('cursor-in-projects'));
}

function activateSlide(slide) {
  const idx = parseInt(slide.dataset.projectIndex, 10);
  if (window.__scene?.setProjectState && !Number.isNaN(idx)) {
    window.__scene.setProjectState(idx);
  }
}

export function initProjectsExhibitModule() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });
  initProjectsExhibit();
}

window.initProjectsExhibitModule = initProjectsExhibitModule;

function bootExhibit() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    initProjectsExhibitModule();
  } else {
    setTimeout(bootExhibit, 50);
  }
}

if (document.readyState === 'complete') {
  setTimeout(bootExhibit, 100);
} else {
  window.addEventListener('load', () => setTimeout(bootExhibit, 100));
}
