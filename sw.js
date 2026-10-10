// Label Print – offline support. Change the version when you upload a new index.html.
const CACHE = "label-print-v38";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" || url.hostname === "cdn.jsdelivr.net";
  if (url.origin !== location.origin && !isFont) return;
  // Show the saved copy straight away, and refresh it in the background when online.
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req);
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
