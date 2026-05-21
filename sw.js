const CACHE_PREFIX = 'scrubber-dx';
const ASSETS = [
  './',
  './index.html',
  './sw.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_PREFIX + '-v1').then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k.startsWith(CACHE_PREFIX)) {
          return caches.delete(k);
        }
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_PREFIX + '-v1').then(cache => {
          cache.put(e.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        return caches.match(e.request);
      });
    })
  );
});
