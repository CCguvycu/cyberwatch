// CyberWatch Service Worker v2.0.0
// Shipped 2026-04-13 — robust offline mode for Play Store readiness
//
// Caching strategies:
//   1. APP_SHELL  - cache-first, pre-cached on install (HTML, manifest)
//   2. API_CACHE  - stale-while-revalidate for live data (HN, Reddit, NVD, CoinGecko)
//   3. Navigation - network-first with cached index.html fallback
//   4. Runtime    - network-first with runtime cache for everything else
//
// Version bumps invalidate old caches automatically on activate.

const VERSION = 'v2.0.0';
const APP_SHELL_CACHE = `cyberwatch-shell-${VERSION}`;
const API_CACHE = `cyberwatch-api-${VERSION}`;
const RUNTIME_CACHE = `cyberwatch-runtime-${VERSION}`;

// Resources to pre-cache on install — the minimum needed for the app to boot offline.
const SHELL_URLS = [
  '/cyberwatch/',
  '/cyberwatch/index.html',
  '/cyberwatch/manifest.json',
];

// API hosts — requests to these get the stale-while-revalidate treatment so users
// see cached data instantly and the cache refreshes in the background.
const API_HOSTS = [
  'hacker-news.firebaseio.com',
  'www.reddit.com',
  'services.nvd.nist.gov',
  'api.coingecko.com',
];

// ─── INSTALL ─────────────────────────────────────────
// Pre-cache the app shell. Fail gracefully so a missing file doesn't break install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] install pre-cache failed:', err);
        return self.skipWaiting();
      })
  );
});

// ─── ACTIVATE ────────────────────────────────────────
// Clean up old versioned caches so we don't accumulate stale data across deploys.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('cyberwatch-') && !k.endsWith(VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH — routing ────────────────────────────────
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only intercept GET
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return; // Malformed URL, let the browser handle it
  }

  // Skip non-http(s) schemes (chrome-extension://, data:, etc.)
  if (!url.protocol.startsWith('http')) return;

  // 1. API requests — stale-while-revalidate
  if (API_HOSTS.some((h) => url.hostname.endsWith(h))) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // 2. Navigation requests (HTML) — network first, fall back to cached shell
  const acceptHeader = request.headers.get('accept') || '';
  if (request.mode === 'navigate' || acceptHeader.includes('text/html')) {
    event.respondWith(networkFirstWithShellFallback(request));
    return;
  }

  // 3. Same-origin static assets — cache-first
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // 4. Everything else — network first with runtime cache fallback
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// ─── STRATEGIES ──────────────────────────────────────

// Stale-while-revalidate: serve cache instantly, refresh in background.
// Perfect for API data that's useful even when slightly stale.
function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached); // Network failed? Return cache (if we have it)

      // Return cached immediately if available, otherwise wait for network
      return cached || networkFetch;
    })
  );
}

// Network-first with cached index.html fallback for navigation requests.
// This is what makes the app load offline.
function networkFirstWithShellFallback(request) {
  return fetch(request)
    .then((response) => {
      // Stash the latest navigation response for offline use
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() =>
      // Offline — serve cached index.html (or the root URL)
      caches.match('/cyberwatch/index.html').then(
        (cached) => cached || caches.match('/cyberwatch/')
      )
    );
}

// Cache-first: serve cache if we have it, otherwise fetch and cache.
// Good for static assets that rarely change.
function cacheFirst(request, cacheName) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(cacheName).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => cached);
  });
}

// Network-first: try fresh first, fall back to cache if offline.
function networkFirst(request, cacheName) {
  return fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

// ─── MESSAGE ─────────────────────────────────────────
// Allow the app to tell us to skip waiting (for instant updates after a new deploy)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
