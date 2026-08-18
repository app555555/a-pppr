// Service worker for SCIENCE SPACE RUN
// Bump CACHE_NAME whenever index.html (or any cached file) changes,
// so users get the update instead of a stale cached copy.
const CACHE_NAME = "space-run-cache-v1";
 
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];
 
// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});
 
// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
 
// Fetch: cache-first, falling back to network, and caching new same-origin
// GET responses as they come in (so the game works fully offline after first load).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
 
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
 
      return fetch(event.request)
        .then((response) => {
          if (
            response &&
            response.status === 200 &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
 
