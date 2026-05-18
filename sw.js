/**
 * Service Worker — mohammedalomari.dev
 * Strategy:
 *   HTML pages      → Network-first  (always fresh, offline fallback)
 *   CSS / JS        → Cache-first    (instant, background revalidation)
 *   Images / Fonts  → Cache-first    (immutable for a year)
 *   CDN assets      → Stale-while-revalidate
 */

const CACHE_VERSION  = 'v11';
const STATIC_CACHE   = `static-${CACHE_VERSION}`;
const CDN_CACHE      = `cdn-${CACHE_VERSION}`;
const PAGE_CACHE     = `pages-${CACHE_VERSION}`;
const ALL_CACHES     = [STATIC_CACHE, CDN_CACHE, PAGE_CACHE];

/* ── Assets to pre-cache on install ──────────────────────────────────── */
const PRECACHE_STATIC = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/js/perf.js",
  "/js/scene.js",
  "/games/",
  "/games/index.html",
  "/games/games.css",
  "/games/shared.css",
  "/games/game-ui.js",
  "/games/lib/storage.js",
  "/games/lib/loop.js",
  "/games/lib/input.js",
  "/games/lib/grid.js",
  "/games/catalog.json",
  "/games/data/trick-quiz.json",
  "/games/data/brain-check.json",
  "/games/tower-game.js",
  "/404.html",
  "/Images/logo.png",
  "/Images/wordle-game.jpg",
  "/games/wordle.html",
  "/games/wordle.js",
  "/games/hangman.html",
  "/games/hangman.js",
  "/games/word-scramble.html",
  "/games/word-scramble.js",
  "/games/snake.html",
  "/games/snake.js",
  "/games/tetris.html",
  "/games/tetris.js",
  "/games/flappy.html",
  "/games/flappy.js",
  "/games/breakout.html",
  "/games/breakout.js",
  "/games/tower.html",
  "/games/tower-game.js",
  "/games/gold-hook.html",
  "/games/gold-hook.js",
  "/games/bubble-spin.html",
  "/games/bubble-spin.js",
  "/games/2048.html",
  "/games/2048.js",
  "/games/block-roll.html",
  "/games/block-roll.js",
  "/games/tile-link.html",
  "/games/tile-link.js",
  "/games/memory.html",
  "/games/memory.js",
  "/games/tictactoe.html",
  "/games/tictactoe.js",
  "/games/connect4.html",
  "/games/connect4.js",
  "/games/balloon-td.html",
  "/games/balloon-td.js",
  "/games/hex-conquest.html",
  "/games/hex-conquest.js",
  "/games/space.html",
  "/games/space.js",
  "/games/dino.html",
  "/games/dino.js",
  "/games/whack.html",
  "/games/whack.js",
  "/games/pong.html",
  "/games/pong.js",
  "/games/dice-wars.html",
  "/games/dice-wars.js",
  "/games/mix-master.html",
  "/games/mix-master.js",
  "/games/solitaire.html",
  "/games/solitaire.js",
  "/games/idle-farm.html",
  "/games/idle-farm.js",
  "/games/bull-run.html",
  "/games/bull-run.js",
  "/games/neon-drift.html",
  "/games/neon-drift.js",
  "/games/cell-feast.html",
  "/games/cell-feast.js",
  "/games/arena-worm.html",
  "/games/arena-worm.js",
  "/games/quick-draw.html",
  "/games/quick-draw.js",
  "/games/lane-defense.html",
  "/games/lane-defense.js",
  "/games/pizza-queue.html",
  "/games/pizza-queue.js",
  "/games/diner-rush.html",
  "/games/diner-rush.js",
  "/games/home-run.html",
  "/games/home-run.js",
  "/games/neon-pool.html",
  "/games/neon-pool.js",
  "/games/trick-quiz.html",
  "/games/trick-quiz.js",
  "/games/brain-check.html",
  "/games/brain-check.js"
];

/* ── CDN resources to cache on first use ─────────────────────────────── */
const CDN_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com',
];

/* ══════════════════════════════════════════════════════════════════════
   INSTALL — pre-cache all static assets
══════════════════════════════════════════════════════════════════════ */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      // Resilient precache: a single 404 must NOT abort install
      Promise.all(
        PRECACHE_STATIC.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      )
    )
  );
});

/* ══════════════════════════════════════════════════════════════════════
   ACTIVATE — delete old cache versions
══════════════════════════════════════════════════════════════════════ */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !ALL_CACHES.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ══════════════════════════════════════════════════════════════════════
   FETCH — route-based caching strategy
══════════════════════════════════════════════════════════════════════ */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip Vercel analytics / speed insights
  if (url.hostname.includes('vercel-insights') || url.pathname.startsWith('/_vercel')) return;

  // ── CDN resources: stale-while-revalidate ──────────────────────────
  if (CDN_ORIGINS.some((origin) => request.url.startsWith(origin))) {
    event.respondWith(staleWhileRevalidate(request, CDN_CACHE));
    return;
  }

  // ── Images & fonts: cache-first (long-lived) ──────────────────────
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|woff2?|ttf|otf)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── CSS & JS: cache-first with background refresh ─────────────────
  if (url.pathname.match(/\.(css|js)$/)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // ── HTML pages: network-first, offline fallback ───────────────────
  if (
    request.destination === 'document' ||
    request.headers.get('accept')?.includes('text/html') ||
    url.pathname === '/' || url.pathname.endsWith('.html')
  ) {
    event.respondWith(networkFirst(request, PAGE_CACHE));
    return;
  }

  // ── Everything else: network with cache fallback ──────────────────
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

/* ══════════════════════════════════════════════════════════════════════
   STRATEGY HELPERS
══════════════════════════════════════════════════════════════════════ */

/** Cache-first: serve from cache, fall back to network + cache the result */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

/** Network-first: always try network, fall back to cache, then offline page */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback for HTML
    const offline = await caches.match('/404.html');
    return offline || new Response('Offline', { status: 503 });
  }
}

/** Stale-while-revalidate: serve cache immediately, refresh in background */
async function staleWhileRevalidate(request, cacheName) {
  const cache   = await caches.open(cacheName);
  const cached  = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || fetchPromise;
}
