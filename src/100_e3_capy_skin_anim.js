//#part 100_e3_capy_skin_anim.js
/* Оживлення скінів Капі (р. 73): поверх готового спрайта лягає прозорий шар кадру — коса смуга відблиску по одягу й іскорки-хрестики.
   Шар лише на пікселях одягу (кольори, яких немає в шерсті Капі), тож обличчя, шерсть і моргання не чіпаємо. Скін епохи (ep*) і звичайна Капі — без шару.
   Кадр — той самий skinAF(), що й у героїв; шар кешується за назвою спрайта й кадром. */
let capyFurCols = null;
function capyFurPal() {
  if (capyFurCols) return capyFurCols;
  const seen = {}; capyFurCols = [];
  ['capy', 'capy_m'].forEach(n => { const c = getSpriteCanvas(n), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; if (!seen[k]) { seen[k] = 1; capyFurCols.push([d[i], d[i + 1], d[i + 2]]); } } });
  return capyFurCols;
}
const capyOvCache = {};
function capyOverlayCanvas(name, f) {
  const key = name + '|' + f; if (key in capyOvCache) return capyOvCache[key];
  const src = getSpriteCanvas(name), W = src.width, H = src.height, d = src.getContext('2d').getImageData(0, 0, W, H).data, fur = capyFurPal();
  const cloth = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return false; const i = (y * W + x) * 4; return d[i + 3] > 200 && (d[i] + d[i + 1] + d[i + 2]) / 3 > 75 && !fur.some(k => Math.abs(k[0] - d[i]) + Math.abs(k[1] - d[i + 1]) + Math.abs(k[2] - d[i + 2]) < 34); };
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), band = -2 + f * (W + H + 4) / SKIN_NF;
  const cand = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!cloth(x, y)) continue;
    const i = (y * W + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
    if (Math.abs(x + y - band) <= 1.4) { g.fillStyle = 'rgb(' + Math.round(r + (255 - r) * 0.6) + ',' + Math.round(gg + (255 - gg) * 0.6) + ',' + Math.round(b + (255 - b) * 0.6) + ')'; g.fillRect(x, y, 1, 1); }
    if ((r + gg + b) / 3 > 150) cand.push([x, y, hash2(x * 7 + 3, y * 13 + 1)]);
  }
  cand.sort((a, b) => a[2] - b[2]);
  const pick = [];
  for (const p of cand) { if (pick.length >= 4) break; if (pick.every(q => Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) >= 7)) pick.push(p); }
  pick.forEach((p, i) => {
    const k = (f - (i * 3 + 1) + SKIN_NF * 2) % SKIN_NF; if (k > 2) return;
    g.fillStyle = '#ffffff'; g.fillRect(p[0], p[1], 1, 1);
    if (k === 1) { g.globalAlpha = 0.85; [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => { if (cloth(p[0] + dx, p[1] + dy)) g.fillRect(p[0] + dx, p[1] + dy, 1, 1); }); g.globalAlpha = 1; }
  });
  return (capyOvCache[key] = c);
}
// Шар для скіна, що вдягнений зараз (null — звичайна Капі, скін епохи або вимкнені анімації)
function capyOverlay() {
  if (!animOn()) return null;
  const s = skinOn('capy'); if (!s || /^ep\d$/.test(s)) return null;
  return capyOverlayCanvas('capy_' + s, skinAF());
}
