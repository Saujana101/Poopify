const CACHE = "pooptrack-v1";
const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install → cache semua file
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// Activate → hapus cache lama
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE)
          .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Fetch → cache-first dengan fallback ke index.html
self.addEventListener("fetch", e => {
  const requestPath = new URL(e.request.url).pathname;

  if (FILES.includes(requestPath)) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(resp =>
          resp || fetch(e.request).then(r => {
            cache.put(e.request, r.clone());
            return r;
          }).catch(() => resp) // fallback ke cache jika offline
        )
      )
    );
  } else {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/index.html"))
    );
  }
});
