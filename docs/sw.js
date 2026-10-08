/* CapyTap: Market — службовий файл (PWA). Спершу завжди питаємо сайт (щоб оновлення з'являлись одразу),
   а коли інтернету нема — віддаємо збережену копію. Прогрес гравця (localStorage) цей файл не чіпає. */
const CACHE = 'capytap-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'fonts/PressStart2P-Regular.ttf', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 5000);
      const res = await fetch(r, { cache: 'no-cache', signal: ctl.signal }); clearTimeout(tm);
      if (res && res.ok) { cache.put(r, res.clone()); return res; }
      const old = await cache.match(r, { ignoreSearch: true }); return old || res;
    } catch (err) {
      return (await cache.match(r, { ignoreSearch: true })) || (r.mode === 'navigate' ? await cache.match('index.html') : undefined) || Response.error();
    }
  })());
});
