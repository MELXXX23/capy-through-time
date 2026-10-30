/* CapyTap: Market — службовий файл (PWA). Спершу завжди питаємо сайт (щоб оновлення з'являлись одразу),
   а коли інтернету нема — віддаємо збережену копію. Прогрес гравця (localStorage) цей файл не чіпає.
   Повільний інтернет: якщо сайт мовчить понад 5 с, гра відкривається зі збереженої копії, а нова версія докачується
   у фоні (не обриваємо!) і кладеться в кеш; якщо вона інша — сторінка отримує 'capy-update' і пропонує перезапуск. */
const CACHE = 'capytap-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'fonts/PressStart2P-Regular.ttf', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const nav = r.mode === 'navigate';
  let servedOld = null;                                                   // копія з кешу, яку віддали, поки мережа повільна
  const raw = fetch(r, { cache: 'no-cache' });
  const saved = raw.then(async res => {
    if (!res || !res.ok) return;
    const copy = res.clone(), cache = await caches.open(CACHE);
    if (nav && servedOld) {
      const [a, b] = await Promise.all([servedOld.text(), copy.clone().text()]);
      if (a !== b) (await self.clients.matchAll({ type: 'window' })).forEach(c => c.postMessage({ type: 'capy-update' }));
    }
    await cache.put(r, copy);
  }).catch(() => {});
  e.waitUntil(saved);
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const old = (await cache.match(r, { ignoreSearch: true })) || (nav ? await cache.match('index.html') : undefined);
    try {
      const res = old ? await Promise.race([raw, new Promise(ok => setTimeout(() => ok(null), 5000))]) : await raw;
      if (!res) { servedOld = old.clone(); return old; }                  // мережа повільна: стара копія зараз, нова — у фоні
      return res.ok || !old ? res : old;
    } catch (err) {
      return old || Response.error();
    }
  })());
});
