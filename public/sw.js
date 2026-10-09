const CACHE_NAME = 'jensenji-v4';
const urlsToCache = [
  '/',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);

  // Don't intercept API requests - always let them go to network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Don't intercept static assets (JS, CSS) - let browser handle them
  // This prevents stale cached JS bundles from causing blank pages
  if (url.pathname.startsWith('/assets/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.ts') ||
      url.pathname.endsWith('.tsx')) {
    return;
  }

  // For HTML pages, use network-first strategy
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (response && response.status === 200 && response.type === 'basic') {
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request).then(function(cached) {
        return cached || new Response('Offline', { status: 503 });
      });
    })
  );
});
