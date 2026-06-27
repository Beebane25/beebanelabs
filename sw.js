// BeebaneLabs Service Worker v2.0 — Enhanced caching strategy
const CACHE_NAME = 'beebanelabs-v2';
const FONT_CACHE = 'beebanelabs-fonts-v1';
const IMAGE_CACHE = 'beebanelabs-images-v1';

const STATIC_ASSETS = [
  '/',
  '/css/style.css',
  '/css/mobile-quick-menu.css',
  '/js/app.js',
  '/images/logo_beebane.png',
  '/images/logo_beebane_webp.webp',
  '/favicon.ico'
];

// Install: cache critical static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches (keep current versions)
self.addEventListener('activate', event => {
  const validCaches = [CACHE_NAME, FONT_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !validCaches.includes(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch handler with multi-cache strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls and serverless functions
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/functions/')) return;

  // Skip third-party tracking/analytics/ads (never cache these)
  if (url.hostname.includes('googlesyndication') ||
      url.hostname.includes('google-analytics') ||
      url.hostname.includes('googletagmanager') ||
      url.hostname.includes('pagead')) return;

  // Google Fonts: cache-first (fonts rarely change)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          return cached || fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Images: cache-first with separate cache
  if (event.request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          return cached || fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Static assets (CSS/JS): stale-while-revalidate
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          const fetched = fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
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
