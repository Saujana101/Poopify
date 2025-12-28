const CACHE = "pooptrack-v1";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
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

// Fetch → cache-first dengan fallback
self.addEventListener("fetch", e => {
  if (FILES.includes(new URL(e.request.url).pathname)) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(resp =>
          resp || fetch(e.request).then(r => {
            cache.put(e.request, r.clone());
            return r;
          })
        )
      )
    );
  } else {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("./"))
    );
  }
});
