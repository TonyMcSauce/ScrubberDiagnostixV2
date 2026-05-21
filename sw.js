// ─────────────────────────────────────────────────────────────────────────────
// ScrubberDiagnostix — Service Worker  (Network-First Strategy)
// Bump APP_VERSION on every deploy to bust the cache instantly.
// ─────────────────────────────────────────────────────────────────────────────
const APP_VERSION = 'scrubber-dx-v7.2';   // ← increment this on every deploy
const CACHE       = `cache-${APP_VERSION}`;
const NETWORK_TIMEOUT_MS = 3000;           // fall back to cache after 3 s

const PRECACHE_ASSETS = [
  './',
  './index.html'
];

// ── INSTALL: pre-cache shell ─────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())   // take over immediately
  );
});

// ── ACTIVATE: delete every old cache version ─────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k !== CACHE)  // keep only current version
            .map(k => {
              console.log('[SW] Deleting old cache:', k);
              return caches.delete(k);
            })
        )
      )
      .then(() => self.clients.claim())  // take control of all open tabs
  );
});

// ── FETCH: Network-First with cache fallback ─────────────────────────────────
self.addEventListener('fetch', e => {
  // Only handle GET requests — skip POST/PUT/etc.
  if (e.request.method !== 'GET') return;

  // Skip cross-origin requests (fonts, analytics, etc.)
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(networkFirst(e.request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);

  try {
    // Race the network against a timeout
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);

    // Network won — update cache in the background, then serve fresh response
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());  // async, no await
    }
    return networkResponse;

  } catch (err) {
    // Network failed or timed out — fall back to cache
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Serving from cache (network unavailable):', request.url);
      return cached;
    }

    // Nothing in cache either — return a minimal offline response
    return new Response(
      '<html><body style="font-family:monospace;padding:20px;background:#181816;color:#EF9F27">' +
      '<h2>OFFLINE — ScrubberDiagnostix</h2>' +
      '<p>No network connection and page not cached. Connect and reload.</p>' +
      '</body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), ms);
    fetch(request)
      .then(res => { clearTimeout(timer); resolve(res); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

// ── MESSAGE: force update from the page ──────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
