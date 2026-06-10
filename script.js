/**
 * Mohammed Al-Omari — Portfolio Scripts
 * GSAP + ScrollTrigger · Cursor · Tilt · Magnetic · Typewriter
 * Ripple · Parallax · Copy · Progress · Back-to-top · Tooltips
 */

(function () {
  'use strict';

  const LOADER_MSGS = [
    'Compiling TypeScript…',
    'Wiring n8n webhooks…',
    'Spinning up Docker…',
    'Ready.',
  ];

  let bindSceneScroll = () => {};

  function finishLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
    window.dispatchEvent(new CustomEvent('portfolio:loader-done'));
  }

  function setupLoader() {
    const loader = document.getElementById('loader');
    const loaderStatus = document.getElementById('loaderStatus');
    if (!loader) {
      finishLoader();
      return;
    }
    if (document.readyState === 'complete') {
      if (loaderStatus) loaderStatus.textContent = LOADER_MSGS[LOADER_MSGS.length - 1];
      setTimeout(finishLoader, 200);
      return;
    }
    let msgIdx = 0;
    let interval;
    if (loaderStatus) {
      interval = setInterval(() => {
        msgIdx = (msgIdx + 1) % LOADER_MSGS.length;
        loaderStatus.textContent = LOADER_MSGS[msgIdx];
      }, 320);
    }
    const endLoader = () => {
      clearInterval(interval);
      if (loaderStatus) loaderStatus.textContent = LOADER_MSGS[LOADER_MSGS.length - 1];
      setTimeout(finishLoader, 400);
    };
    window.addEventListener('DOMContentLoaded', endLoader, { once: true });
    window.addEventListener('load', endLoader, { once: true });
    setTimeout(() => {
      if (!loader.classList.contains('hidden')) {
        endLoader();
      }
    }, 2000);
  }

  function onPortfolioReturn() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh(true);
      bindSceneScroll();
    }
    window.dispatchEvent(new CustomEvent('portfolio:loader-done'));
  }

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) onPortfolioReturn();
  });

  if (window.__portfolioBooted) {
    onPortfolioReturn();
    return;
  }
  window.__portfolioBooted = true;

  setupLoader();

  /* ─────────────────────────────────────────────────────────────────────────
     GSAP GUARD
  ───────────────────────────────────────────────────────────────────────── */
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('[data-gsap]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  bindSceneScroll = function bindSceneScrollFn() {
    if (reducedMotion || !window.__scene?.setScrollProgress) return;
    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars?.id === 'webgl-scroll') st.kill();
    });
    ScrollTrigger.create({
      id: 'webgl-scroll',
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => window.__scene.setScrollProgress(self.progress),
    });
  };

  /* ─────────────────────────────────────────────────────────────────────────
     SCROLL PROGRESS BAR
  ───────────────────────────────────────────────────────────────────────── */
  let progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);
  }

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      progressBar.style.transform = `scaleX(${self.progress})`;
    }
  });

  /* ─────────────────────────────────────────────────────────────────────────
     BACK TO TOP BUTTON
  ───────────────────────────────────────────────────────────────────────── */
  let btt = document.querySelector('.back-to-top');
  if (!btt) {
    btt = document.createElement('button');
    btt.className = 'back-to-top';
    btt.setAttribute('aria-label', 'Back to top');
    btt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btt);

    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      spawnRipple(btt, btt.getBoundingClientRect().width / 2, btt.getBoundingClientRect().height / 2);
    });
  }

  ScrollTrigger.getAll().forEach((st) => {
    if (st.vars?.id === 'back-to-top') st.kill();
  });
  ScrollTrigger.create({
    id: 'back-to-top',
    start: '400px top',
    onEnter:     () => btt.classList.add('visible'),
    onLeaveBack: () => btt.classList.remove('visible'),
  });

  /* ─────────────────────────────────────────────────────────────────────────
     CUSTOM CURSOR
  ───────────────────────────────────────────────────────────────────────── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!isTouchDevice && dot && ring && !window.__cursorRafStarted) {
    window.__cursorRafStarted = true;
    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
    }, { passive: true });

    (function animateCursor() {
      dot.style.left  = dotX + 'px';
      dot.style.top   = dotY + 'px';
      ringX += (dotX - ringX) * 0.12;
      ringY += (dotY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateCursor);
    })();

    // Cursor states per element type
    function bindCursorState(selector, state) {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => {
          document.body.dataset.cursorState = state;
        });
        el.addEventListener('mouseleave', () => {
          delete document.body.dataset.cursorState;
        });
      });
    }

    bindCursorState('a, button, .btn, label', 'pointer');
    bindCursorState('.tilt-card, .card, .pc, .stat-card', 'card');
    bindCursorState('p, li, .hero__bio', 'text');
    bindCursorState('.code-window', 'code');

    document.querySelectorAll('a, button, .btn, .card, .pc, .stat-card, .tilt-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  } else {
    document.body.style.cursor = 'auto';
    if (dot)  dot.style.display  = 'none';
    if (ring) ring.style.display = 'none';
  }

  /* ─────────────────────────────────────────────────────────────────────────
     RIPPLE EFFECT (all buttons + links)
  ───────────────────────────────────────────────────────────────────────── */
  function spawnRipple(el, x, y) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top  = y + 'px';
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  document.querySelectorAll('.btn, .nav__menu a, .footer__socials a').forEach(el => {
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      spawnRipple(el, e.clientX - rect.left, e.clientY - rect.top);
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     HERO ANIMATIONS
  ───────────────────────────────────────────────────────────────────────── */
  const heroTl = gsap.timeline({ delay: 1.0 });
  heroTl
    .to('.status-badge',    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .to('.hero__identity',  { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('.hero__title',     { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
    .to('.hero__bio',       { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    .to('.hero__actions',   { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .to('.hero__visual',    { opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.6')
    .to('.scroll-indicator',{ opacity: 1, duration: 0.6 }, '-=0.3');

  gsap.fromTo('.float-badge',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.7)', delay: 2 }
  );

  /* ─────────────────────────────────────────────────────────────────────────
     HERO MOUSE PARALLAX
  ───────────────────────────────────────────────────────────────────────── */
  if (!isTouchDevice) {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        gsap.to('.hero__visual', { x: dx * 18, y: dy * 10, duration: 0.8, ease: 'power2.out' });
        gsap.to('.hero__content', { x: dx * -6, y: dy * -4, duration: 0.8, ease: 'power2.out' });
        gsap.to('.float-badge--1', { x: dx * 30, y: dy * 20, duration: 1, ease: 'power1.out' });
        gsap.to('.float-badge--2', { x: dx * -20, y: dy * 15, duration: 1, ease: 'power1.out' });
        gsap.to('.float-badge--3', { x: dx * 25, y: dy * -12, duration: 1, ease: 'power1.out' });
        gsap.to('.float-badge--4', { x: dx * -15, y: dy * 25, duration: 1, ease: 'power1.out' });
      }, { passive: true });
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     CODE WINDOW TYPEWRITER
  ───────────────────────────────────────────────────────────────────────── */
  const codeEl = document.querySelector('.code-window__body pre code');
  if (codeEl) {
    const originalHTML = codeEl.innerHTML;
    // Add blinking cursor to code
    const cursor = document.createElement('span');
    cursor.className = 'code-cursor';
    cursor.textContent = '▋';
    cursor.setAttribute('aria-hidden', 'true');
    codeEl.appendChild(cursor);

    // Re-run typing animation when code window scrolls into view
    ScrollTrigger.create({
      trigger: '.code-window',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.fromTo('.code-window',
          { rotateY: -8, rotateX: 6 },
          { rotateY: -5, rotateX: 5, duration: 0.8, ease: 'power2.out', transformPerspective: 800 }
        );
      }
    });

    // Syntax tokens light up on hover
    codeEl.querySelectorAll('.kw, .fn, .str, .prop, .cm').forEach(token => {
      token.style.transition = 'filter 0.2s, opacity 0.2s';
      token.addEventListener('mouseenter', () => {
        token.style.filter = 'brightness(1.4)';
        token.style.textShadow = '0 0 12px currentColor';
      });
      token.addEventListener('mouseleave', () => {
        token.style.filter = '';
        token.style.textShadow = '';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SCROLL FADE-UP ANIMATIONS
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.9,
      delay: parseFloat(el.dataset.delay || 0),
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  document.querySelectorAll('[data-gsap="fade-in"]').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      duration: 1,
      delay: parseFloat(el.dataset.delay || 0),
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION LABEL GLITCH ON HOVER
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.section__label').forEach(label => {
    label.style.cursor = 'default';
    label.addEventListener('mouseenter', () => label.classList.add('glitch'));
    label.addEventListener('animationend', () => label.classList.remove('glitch'));
  });

  /* ─────────────────────────────────────────────────────────────────────────
     3D TILT CARDS
  ───────────────────────────────────────────────────────────────────────── */
  if (!isTouchDevice) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        gsap.to(card, {
          rotateY: dx * 12, rotateX: -dy * 12,
          duration: 0.3, ease: 'power2.out', transformPerspective: 900,
        });
        const glow = card.querySelector('.card__glow');
        if (glow) {
          card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
        }
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', transformPerspective: 900 });
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     PROJECT CARDS — click-to-expand accordion
  ───────────────────────────────────────────────────────────────────────── */
  const projectCards = document.querySelectorAll('.pc');

  projectCards.forEach(card => {
    const toggle = card.querySelector('.pc__toggle');

    function openCard() {
      // Close all others
      projectCards.forEach(c => {
        if (c !== card && c.classList.contains('is-open')) {
          c.classList.remove('is-open');
          c.setAttribute('aria-expanded', 'false');
        }
      });
      card.classList.toggle('is-open');
      const isOpen = card.classList.contains('is-open');
      card.setAttribute('aria-expanded', String(isOpen));

      // Smooth scroll card into view if opening
      if (isOpen) {
        setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    }

    // Click anywhere on card
    card.addEventListener('click', (e) => {
      // Don't intercept clicks on links/buttons inside expanded area
      if (e.target.closest('a, .btn')) return;
      openCard();
    });

    // Keyboard: Enter / Space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard();
      }
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     MAGNETIC BUTTONS
  ───────────────────────────────────────────────────────────────────────── */
  if (!isTouchDevice) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.3;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.3;
        gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     TAG TOOLTIPS (expertise tags)
  ───────────────────────────────────────────────────────────────────────── */
  const TAG_INFO = {
    'NestJS':         'Progressive Node.js framework',
    'Express.js':     'Fast, minimal web framework',
    'Node.js':        'JavaScript runtime',
    'TypeScript':     'Typed superset of JavaScript',
    'REST APIs':      'REpresentational State Transfer',
    'Microservices':  'Distributed service architecture',
    'n8n':            'Open-source workflow automation',
    'Webhooks':       'Event-driven HTTP callbacks',
    'Event-Driven':   'Async event-based architecture',
    'Docker':         'Container platform',
    'GitHub Actions': 'CI/CD automation',
    'CI/CD':          'Continuous integration & delivery',
    'MySQL':          'Relational database',
    'MongoDB':        'NoSQL document database',
    'TypeORM':        'TypeScript ORM',
    'React':          'UI component library',
    'Accessibility':  'WCAG-compliant web design',
    'Web Vitals':     'Core performance metrics',
  };

  let tooltip = document.querySelector('.tag-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'tag-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);
  }

  document.querySelectorAll('.tag-list li').forEach(tag => {
    const info = TAG_INFO[tag.textContent.trim()];
    if (!info) return;
    tag.style.cursor = 'default';

    tag.addEventListener('mouseenter', (e) => {
      tooltip.textContent = info;
      tooltip.classList.add('visible');
      positionTooltip(e);
    });
    tag.addEventListener('mousemove', positionTooltip);
    tag.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });

  function positionTooltip(e) {
    const x = e.clientX + 14;
    const y = e.clientY - 34;
    tooltip.style.left = Math.min(x, window.innerWidth - tooltip.offsetWidth - 10) + 'px';
    tooltip.style.top  = y + 'px';
  }

  /* ─────────────────────────────────────────────────────────────────────────
     COPY EMAIL TO CLIPBOARD
  ───────────────────────────────────────────────────────────────────────── */
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink) {
    const original = emailLink.innerHTML;
    emailLink.setAttribute('title', 'Click to copy email');

    emailLink.addEventListener('click', (e) => {
      const email = emailLink.href.replace('mailto:', '');
      if (navigator.clipboard) {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(() => {
          emailLink.innerHTML = '✓ Copied! <i class="fa-solid fa-check"></i>';
          emailLink.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
          setTimeout(() => {
            emailLink.innerHTML = original;
            emailLink.style.background = '';
          }, 2200);
        }).catch(() => { /* fallback: let default mailto: handle it */ });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     HERO STRONG TEXT HIGHLIGHT ON HOVER
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.hero__bio strong').forEach(strong => {
    strong.style.position = 'relative';
    strong.style.cursor = 'default';
    strong.addEventListener('mouseenter', () => {
      gsap.to(strong, { scale: 1.05, color: 'var(--cyan)', duration: 0.2, ease: 'back.out(3)' });
    });
    strong.addEventListener('mouseleave', () => {
      gsap.to(strong, { scale: 1, color: '', duration: 0.2, ease: 'power2.out' });
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     ABOUT TEXT STRONG HIGHLIGHTS
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.about__text strong').forEach(strong => {
    strong.style.cursor = 'default';
    strong.addEventListener('mouseenter', () => {
      gsap.to(strong, { color: 'var(--cyan)', duration: 0.2 });
    });
    strong.addEventListener('mouseleave', () => {
      gsap.to(strong, { color: '', duration: 0.2 });
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     TIMELINE ITEM HOVER EXPAND
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.timeline-item').forEach(item => {
    const dot = item.querySelector('.timeline__dot');
    item.addEventListener('mouseenter', () => {
      gsap.to(dot, { scale: 1.5, boxShadow: '0 0 20px var(--cyan)', duration: 0.3, ease: 'back.out(3)' });
      gsap.to(item.querySelectorAll('.timeline__bullets li'), {
        x: 4, stagger: 0.04, duration: 0.25, ease: 'power2.out'
      });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(dot, { scale: 1, boxShadow: '', duration: 0.3 });
      gsap.to(item.querySelectorAll('.timeline__bullets li'), {
        x: 0, stagger: 0.04, duration: 0.25, ease: 'power2.out'
      });
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     EXPERTISE CARD ICON POP ON HOVER
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.card').forEach(card => {
    const icon = card.querySelector('.card__icon');
    if (!icon) return;
    card.addEventListener('mouseenter', () => {
      gsap.to(icon, { rotate: 8, scale: 1.15, duration: 0.3, ease: 'back.out(3)' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(icon, { rotate: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    });
    // Tag pop stagger on hover
    card.addEventListener('mouseenter', () => {
      gsap.fromTo(card.querySelectorAll('.tag-list li'),
        { y: 4, opacity: 0.7 },
        { y: 0, opacity: 1, stagger: 0.04, duration: 0.3, ease: 'back.out(2)' }
      );
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     PROJECT CARD TAG HOVER POP
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.pc__stack .tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      gsap.to(tag, { y: -3, scale: 1.08, duration: 0.2, ease: 'back.out(3)' });
    });
    tag.addEventListener('mouseleave', () => {
      gsap.to(tag, { y: 0, scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     DIVIDERS — ANIMATED GRADIENT PULSE ON SCROLL
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.divider').forEach(div => {
    ScrollTrigger.create({
      trigger: div,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.fromTo(div,
          { background: 'var(--border)' },
          {
            background: 'linear-gradient(90deg, transparent, var(--cyan), var(--violet), transparent)',
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(div, { background: 'var(--border)', duration: 1.5, delay: 0.5 });
            }
          }
        );
      }
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     PLAYGROUND — HOVER GLOW
  ───────────────────────────────────────────────────────────────────────── */
  const playgroundBox = document.querySelector('.playground__box');
  if (playgroundBox) {
    playgroundBox.addEventListener('mouseenter', () => {
      gsap.to(playgroundBox, { boxShadow: '0 0 60px rgba(168,85,247,0.3)', duration: 0.4 });
    });
    playgroundBox.addEventListener('mouseleave', () => {
      gsap.to(playgroundBox, { boxShadow: 'none', duration: 0.4 });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     STATUS BADGE PULSE ON HOVER
  ───────────────────────────────────────────────────────────────────────── */
  const statusBadge = document.querySelector('.status-badge');
  if (statusBadge) {
    statusBadge.style.cursor = 'default';
    statusBadge.addEventListener('mouseenter', () => {
      gsap.to(statusBadge, { scale: 1.04, borderColor: 'var(--cyan)', duration: 0.2, ease: 'power2.out' });
    });
    statusBadge.addEventListener('mouseleave', () => {
      gsap.to(statusBadge, { scale: 1, borderColor: '', duration: 0.3, ease: 'power2.out' });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     FOOTER SOCIAL BOUNCE
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.footer__socials a').forEach((icon, i) => {
    icon.addEventListener('mouseenter', () => {
      gsap.fromTo(icon,
        { y: 0 },
        { y: -6, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 }
      );
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     SCROLL INDICATOR — CLICK TO SCROLL TO ABOUT
  ───────────────────────────────────────────────────────────────────────── */
  const scrollInd = document.querySelector('.scroll-indicator');
  if (scrollInd) {
    scrollInd.style.cursor = 'pointer';
    scrollInd.addEventListener('click', () => {
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     CONTACT BOX INTERACTIVE GLOW
  ───────────────────────────────────────────────────────────────────────── */
  const contactBox = document.querySelector('.contact-box');
  if (contactBox) {
    contactBox.addEventListener('mousemove', (e) => {
      const r  = contactBox.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      contactBox.style.setProperty('--gx', x + '%');
      contactBox.style.setProperty('--gy', y + '%');
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SMOOTH IN-PAGE ANCHOR SCROLLING (all #hash links)
  ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────────────────────────────────────────────
     ACTIVE NAV + HEADER SCROLL
  ───────────────────────────────────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__menu a[href^="#"]');
  const header    = document.querySelector('.site-header');

  sections.forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter:     () => setActiveLink(section.id),
      onEnterBack: () => setActiveLink(section.id),
    });
  });

  function setActiveLink(id) {
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  }

  ScrollTrigger.create({
    start: 'top -10',
    onUpdate: (self) => header.classList.toggle('scrolled', self.scroll() > 10)
  });

  /* ─────────────────────────────────────────────────────────────────────────
     MOBILE NAVIGATION
  ───────────────────────────────────────────────────────────────────────── */
  const toggle = document.querySelector('.nav__toggle');
  const menu   = document.querySelector('.nav__menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
      const h = toggle.querySelector('.hamburger');
      gsap.to(h, !open
        ? { rotate: 45, scaleX: 1, duration: 0.3 }
        : { rotate: 0,  scaleX: 1, duration: 0.3 }
      );
    });
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }

  bindSceneScroll();

})();
