//#part 212_skins_shop_anim.js
/* =====================================================================
   РУХОМІ ДЕТАЛІ СКІНІВ МАГАЗИНУ: фон вивіски живе під кожен скін (текст вивіски — HTML поверх), у «Океану» ще
   фонтанчики на даху й акваріум з рибками на першому поверсі. Виклики — у 260_render.js (drawShopLayered).
   ===================================================================== */
const SKIN_SIGN_ANIM = {};
function signStripes(x0, y0, w, h, t, base, hi, speed, step, wid) {          // діагональні смуги, що біжать
  R(ctx, x0, y0, w, h, base);
  const o = Math.floor(t * speed);
  for (let y = 0; y < h; y++) for (let s = -step * 2 - (o % step); s < w + step; s += step) {
    const x = s + (h - y), xa = Math.max(0, x), ww = Math.min(x + wid, w) - xa;
    if (ww > 0) R(ctx, x0 + xa, y0 + y, ww, 1, hi);
  }
}
function signFlakes(x0, y0, w, h, t, n, speed, draw) {                     // частинки, що падають/дрейфують по вивісці
  for (let i = 0; i < n; i++) {
    const x = ((i * 53.7 + Math.sin(t * 0.9 + i) * 4) % w + w) % w, y = (t * speed * (0.7 + (i % 3) * 0.2) + i * 4.3) % (h + 4) - 2;
    draw(Math.round(x0 + x), Math.round(y0 + y), i);
  }
}
function signSpark(x, y, c) { R(ctx, x - 1, y, 3, 1, c); R(ctx, x, y - 1, 1, 3, c); R(ctx, x, y, 1, 1, '#ffffff'); }
SKIN_SIGN_ANIM.ocean = (x0, y0, w, h, t) => {                                // жива вода: хвилі біжать, гребені блищать, бульбашки спливають
  for (let x = 0; x < w; x++) {
    const a = Math.round(4 + Math.sin(x * 0.23 + t * 2.1) * 1.4 + Math.sin(x * 0.07 - t * 1.2) * 1.2), b = Math.round(9 + Math.sin(x * 0.18 - t * 1.7 + 2) * 1.1);
    R(ctx, x0 + x, y0, 1, h, '#1d4f8f'); R(ctx, x0 + x, y0, 1, a, '#2f74bd'); R(ctx, x0 + x, y0 + a, 1, 1, '#9fe2ff'); R(ctx, x0 + x, y0 + b, 1, 1, '#3f8ad0');
    if (((x + Math.floor(t * 6)) % 23) < 3) R(ctx, x0 + x, y0 + a - 1, 1, 1, '#ffffff');
  }
  for (let i = 0; i < 7; i++) { const bx = (i * 47 + 11) % w, by = h - ((t * 5 + i * 2.3) % (h + 2)); R(ctx, x0 + bx + Math.round(Math.sin(t * 3 + i)), Math.round(y0 + by), 1, 1, '#d8f6ff'); }
};
SKIN_SIGN_ANIM.candy = (x0, y0, w, h, t) => signStripes(x0, y0, w, h, t, '#c43d78', '#e46aa0', 7, 10, 5);
SKIN_SIGN_ANIM.gold = (x0, y0, w, h, t) => {
  signStripes(x0, y0, w, h, t, '#8a5a12', '#a8741c', 3, 8, 3);
  const bx = ((t * 60) % (w + 80)) - 40;
  ctx.globalAlpha = 0.55; for (let y = 0; y < h; y++) { const x = Math.round(bx - y * 0.8), xa = Math.max(0, x), ww = Math.min(x + 6, w) - xa; if (ww > 0) R(ctx, x0 + xa, y0 + y, ww, 1, '#fff2b0'); } ctx.globalAlpha = 1;
  for (let i = 0; i < 6; i++) if (Math.sin(t * 2.6 + i * 1.9) > 0.6) signSpark(x0 + (i * 61 + 9) % w, y0 + 3 + (i * 5) % (h - 6), '#fff6c0');
};
SKIN_SIGN_ANIM.diamond = (x0, y0, w, h, t) => {
  signStripes(x0, y0, w, h, t, '#1c2766', '#2c46a0', 4, 12, 4);
  for (let i = 0; i < 8; i++) if (Math.sin(t * 3 + i * 2.3) > 0.5) signSpark(x0 + (i * 43 + 5) % w, y0 + 2 + (i * 7) % (h - 4), '#8ff0ff');
};
SKIN_SIGN_ANIM.xmas = (x0, y0, w, h, t) => {
  R(ctx, x0, y0, w, h, '#2f6b48');
  signFlakes(x0, y0, w, h, t, Math.round(w / 14), 4, (x, y) => R(ctx, x, y, 1, 1, '#ffffff'));
  for (let x = 3; x < w - 3; x += 7) { const on = (Math.floor(t * 2) + x / 7) % 3 !== 0; R(ctx, x0 + x, y0 + h - 2, 2, 2, on ? ['#ff5a5a', '#ffe08a', '#7ad6ff'][(x / 7 | 0) % 3] : '#1d4a30'); }
};
SKIN_SIGN_ANIM.halloween = (x0, y0, w, h, t) => {
  R(ctx, x0, y0, w, h, '#2b1a4f');
  ctx.globalAlpha = 0.7; for (let x = 0; x < w; x++) { const f = Math.max(1, Math.round(3 + Math.sin(x * 0.11 + t * 0.9) * 1.6 + Math.sin(x * 0.27 - t * 1.4))); R(ctx, x0 + x, y0 + h - f, 1, f, '#5d3a8a'); } ctx.globalAlpha = 1;
  for (let i = 0; i < 3; i++) { if (Math.sin(t * 0.7 + i * 2.1) < 0.2 || (t * 3 + i) % 4 < 0.25) continue; const ex = x0 + 10 + (i * 97) % Math.max(1, w - 20), ey = y0 + 4 + (i % 2) * 2; R(ctx, ex, ey, 1, 1, '#ff9e3a'); R(ctx, ex + 3, ey, 1, 1, '#ff9e3a'); }
};
SKIN_SIGN_ANIM.spring = (x0, y0, w, h, t) => {
  R(ctx, x0, y0, w, h, '#3f8a55'); R(ctx, x0, y0, w, 3, '#4f9a63');
  signFlakes(x0, y0, w, h, t, Math.round(w / 16), 3, (x, y, i) => R(ctx, x, y, 2, 1, i % 2 ? '#ffc9d4' : '#ef8fa3'));
};
SKIN_SIGN_ANIM.autumn = (x0, y0, w, h, t) => {
  R(ctx, x0, y0, w, h, '#8a4a1c'); R(ctx, x0, y0, w, 3, '#9a5a24');
  signFlakes(x0, y0, w, h, t, Math.round(w / 15), 4, (x, y, i) => { const c = ['#e8863c', '#c4553d', '#f2b84b'][i % 3]; if (Math.floor(t * 3 + i) % 2) R(ctx, x, y, 2, 1, c); else R(ctx, x, y, 1, 2, c); });
};
/* ---- Океан: фонтанчики на даху (дірочки, з яких б'є вода, бризкає й розвіюється парою) ---- */
function drawRoofFountains(t) {
  const y = shop.y + shop.sign.y - 9;
  [0.1, 0.29, 0.71, 0.9].forEach((f, i) => {
    const x = shop.x + Math.round(shop.w * f), H = Math.round(11 + Math.sin(t * 2.4 + i * 1.7) * 3);
    R(ctx, x - 2, y, 5, 2, 'd'); R(ctx, x - 1, y, 3, 1, 'n');
    for (let k = 1; k <= H; k++) { ctx.globalAlpha = 1 - (k / H) * 0.45; const wx = x + Math.round(Math.sin(t * 9 + k * 0.8 + i) * 0.6); R(ctx, wx - (k < H - 3 ? 1 : 0), y - k, k < H - 3 ? 2 : 1, 1, k % 3 ? '#9fe2ff' : '#d8f6ff'); if (k > H - 3) R(ctx, wx, y - k, 1, 1, '#ffffff'); }
    for (let d = 0; d < 6; d++) {                                                   // бризки, що розлітаються й тануть
      const p = (t * 1.1 + d / 6 + i * 0.37) % 1, s = d % 2 ? 1 : -1;
      ctx.globalAlpha = (1 - p) * 0.9; R(ctx, Math.round(x + s * (1 + p * 5)), Math.round(y - H - 1 + p * p * 9 - p * 4), 1, 1, p < 0.5 ? '#d8f6ff' : '#9fe2ff');
    }
    const m = (t * 0.8 + i * 0.3) % 1; ctx.globalAlpha = (1 - m) * 0.45; R(ctx, x - 1, Math.round(y - H - 2 - m * 6), 3, 1, '#ffffff');   // пара
    ctx.globalAlpha = 1;
  });
}
/* ---- Океан: акваріум з рибками на першому поверсі (у проміжку між відділами, за покупцями) ---- */
function aquariumSpot() {
  if (shop.__aqSig === shop.sig) return shop.__aq;
  let spot = null;
  const fls = shop.floors || [], fl = fls.find(f => f.f === 1 && !f.cinema && !f.cafe) || fls.find(f => f.f === 0);
  if (fl) {
    const xs = fl.xs || [], gaps = [];
    for (let i = 0; i + 1 < xs.length; i++) gaps.push([xs[i] + 34, xs[i + 1]]);
    if (xs.length) { gaps.push([fl.seg[0], xs[0]]); gaps.push([xs[xs.length - 1] + 34, fl.seg[1]]); }
    const g = gaps.filter(([a, b]) => b - a >= 28).sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]))[0];
    if (g) spot = { x: Math.round((g[0] + g[1]) / 2) - 12, y: fl.fy - 23 };
  }
  shop.__aqSig = shop.sig; return (shop.__aq = spot);
}
function drawSkinInterior() {
  if (!shop || build || skinOn('shop') !== 'ocean') return;
  const a = aquariumSpot(); if (!a) return;
  const t = animOn() ? animClock : 0, x = shop.x + a.x, y = shop.y + a.y, W = 24, H = 16;
  R(ctx, x + 2, y + H + 1, 2, 5, 'd'); R(ctx, x + W - 4, y + H + 1, 2, 5, 'd'); R(ctx, x + 1, y + H, W - 2, 2, 'b');            // підставка
  R(ctx, x - 1, y - 1, W + 2, H + 2, 'd'); R(ctx, x, y, W, H, '#2f86c8'); R(ctx, x, y, W, 4, '#4fa8e0'); R(ctx, x, y, W, 1, '#9fe2ff');
  R(ctx, x, y + H - 3, W, 3, '#e8d3a0'); R(ctx, x + 5, y + H - 3, 2, 1, '#ffc9d4'); R(ctx, x + 16, y + H - 2, 3, 1, '#aab7cb');  // пісок, мушля, камінець
  [[3, 9], [8, 7], [19, 10]].forEach(([sx, len], i) => { for (let k = 0; k < len; k++) R(ctx, x + sx + Math.round(Math.sin(t * 2 + k * 0.6 + i)), y + H - 3 - k, 1, 1, k % 3 ? '#4f9a63' : '#8ed4a6'); });
  [['#e8863c', 0.7], ['#ffe08a', 0.5], ['#ef8fa3', 0.85]].forEach(([c, sp], i) => {         // рибки плавають туди-сюди й повертаються
    const ph = t * sp + i * 2.1, fx = Math.round(x + 12 + Math.sin(ph) * 7), fy = Math.round(y + 5 + i * 3 + Math.sin(ph * 1.7)), d = Math.cos(ph) > 0 ? 1 : -1;
    R(ctx, fx - 2, fy, 5, 2, c); R(ctx, fx - 1, fy - 1, 3, 1, c); R(ctx, fx - d * 3, fy - 1, 1, 4, c); R(ctx, fx + d * 2, fy, 1, 1, 'k');
  });
  for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i * 0.33) % 1; R(ctx, x + 20 + (i % 2), Math.round(y + H - 4 - p * (H - 5)), 1, 1, '#d8f6ff'); }
  ctx.globalAlpha = 0.35; R(ctx, x + 2, y + 2, 1, 6, '#ffffff'); R(ctx, x + 3, y + 2, 1, 3, '#ffffff'); ctx.globalAlpha = 1;   // відблиск скла
}
function drawSkinShopExtras(sc) {
  const sk = skinOn('shop');
  if (!shop || !sk || build || !shop.sign) return;
  const t = animOn() ? animClock : 0, s = shop.sign;
  withShopScale(sc, () => {
    if (SKIN_SIGN_ANIM[sk]) { ctx.save(); ctx.beginPath(); ctx.rect(shop.x + s.x, shop.y + s.y, s.w, s.h); ctx.clip(); SKIN_SIGN_ANIM[sk](shop.x + s.x, shop.y + s.y, s.w, s.h, t); ctx.restore(); }
    if (sk === 'ocean') drawRoofFountains(t);
  });
}
