// Bump the number in CACHE (plan-v3 -> plan-v4) every time you change any file, so phones pick up the update.
const CACHE = 'plan-v3';
const SHELL = ['./', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  // animated demos (~6 MB total, downloaded once so the gym works offline)
  'media/catcamel.webp', 'media/hipflexor.webp', 'media/ninety.webp', 'media/ankle.webp', 'media/goblet.webp', 'media/rdl.webp', 'media/row.webp', 'media/incline.webp', 'media/deadbug.webp', 'media/sideplank.webp', 'media/shortfoot.webp', 'media/calf.webp', 'media/stepup.webp', 'media/bridge.webp', 'media/pulldown.webp', 'media/press.webp', 'media/pallof.webp', 'media/birddog.webp', 'media/farmer.webp', 'media/bike.webp', 'media/hamstring.webp', 'media/wallcalf.webp', 'media/openbook.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => {
    const net = fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
