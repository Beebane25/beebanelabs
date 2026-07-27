/* BeebaneLabs Service Worker v19.0
   Cache-first for static assets, stale-while-revalidate for pages,
   network-first for API calls.
   Updated: 2026-07-06
*/

const CACHE_NAME = 'beebanelabs-v10';
const STATIC_CACHE = 'beebanelabs-static-v6';
const PAGE_CACHE = 'beebanelabs-pages-v6';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/offline.html',
  '/offline',
  '/css/style.css?v=27.4',
  '/js/app.js?v=19.3',
  '/js/security.js?v=1.0',
  '/js/mobile-zoom.js?v=9.2',
  '/manifest.json',
  '/images/logo_beebane_webp.webp',
  '/favicon.ico'
];

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  const keepCaches = [STATIC_CACHE, PAGE_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !keepCaches.includes(k)).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls (network-first)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Skip external resources (CDN, fonts, ads)
  if (url.origin !== location.origin) return;

  // Static assets (cache-first)
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // HTML pages (stale-while-revalidate)
  if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
    event.respondWith(staleWhileRevalidate(event.request, PAGE_CACHE));
    return;
  }
});

// Cache-first strategy
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

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // If fetch fails and we have cached version, return it
    if (cached) return cached;
    // Otherwise return offline page
    return caches.match('/offline.html');
  });

  return cached || fetchPromise;
}

// Network-first strategy (for API)
async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Check if path is a static asset
function isStaticAsset(pathname) {
  const extensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return extensions.some(ext => pathname.endsWith(ext));
}
