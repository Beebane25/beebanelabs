// BeebaneLabs Service Worker v1.0
const CACHE_NAME = 'beebanelabs-v1';
const STATIC_ASSETS = [
  '/',
  '/css/style.css',
  '/css/mobile-quick-menu.css',
  '/js/app.js',
  '/js/mobile-zoom.js',
  '/images/logo_beebane.png'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for dynamic
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API calls: network only
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/functions/')) return;

  // Static assets: cache-first
  if (STATIC_ASSETS.some(a => url.pathname === a || url.pathname.endsWith('.css') || url.pathname.endsWith('.js'))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetched = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
    return;
  }

  // HTML pages: network-first with cache fallback
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
