// Minimal, dependency-free service worker.
//
// Strategy: network-first for same-origin GET requests, falling back to the
// cache when offline. This keeps the daily-updated content fresh whenever the
// device is online (important — fixtures, results and predictions change every
// morning) while still giving an offline experience from the last visit.
//
// Bump CACHE_VERSION whenever the precached shell list changes.
const CACHE_VERSION = 'wc2026-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/app-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests; let everything else pass through.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache a copy of successful responses for offline fallback.
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // For navigations, fall back to the app shell so the SPA can boot.
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return Response.error();
      }),
  );
});
