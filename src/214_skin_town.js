//#part 214_skin_town.js
/* =====================================================================
   СКІНИ «БУДІВЛІ»: скін маркету міняє і задні будинки вулиці.
   SHOP_TOWN[скін] = { walls, roofs — 5 кольорів по колу (архітектура епохи лишається), deco — нерухомі прикраси на шарі землі,
   anim — рухомі деталі на будинках (щокадру, лише на рівні даху й вище, щоб дерева не перекривались), shop — рухомі деталі маркету }.
   Гачки: houseColors (140_a), buildGroundLayer (140_b), setSkin (210), render (260), drawSkinShopExtras (212).
   ===================================================================== */
const townHouses = [];            // будинки поточного шару землі: { x, w, h, top, tops[], roofY, cx, i, glass }
function skinTownOn() { const sk = skinOn('shop'); return (sk && SHOP_TOWN[sk]) || null; }
const TW = {
  px(g, x, y, c) { R(g, Math.round(x), Math.round(y), 1, 1, c); },
  disc(g, cx, cy, r, c) { cx = Math.round(cx); cy = Math.round(cy); for (let dy = -r; dy <= r; dy++) { const h = Math.round(Math.sqrt(r * r + 0.5 - dy * dy)); R(g, cx - h, cy + dy, h * 2 + 1, 1, c); } },
  stamp(g, x0, y0, rows, pal, flip) { rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = pal[row[flip ? row.length - 1 - i : i]]; if (c) R(g, x0 + i, y0 + j, 1, 1, c); } }); },
  top(hs, x) { const v = hs.tops[Math.round(x) - hs.x + 6]; return v == null ? hs.top : v; },
  night() { return (typeof sky !== 'undefined' && sky.night) || 0; },
  // рядок вогників уздовж силуету даху (шпилі й антени пропускає)
  roofLine(hs, step, fn) {
    for (let x = hs.x + 2, k = 0; x < hs.x + hs.w - 2; x += step, k++) {
      let y = TW.top(hs, x); const a = TW.top(hs, x - 2), b = TW.top(hs, x + 2);
      if (y < Math.min(a, b) - 2) y = Math.min(a, b);
      if (y < hs.roofY - 16) continue;
      fn(x, y, k);
    }
  },
  // прапорець, що майорить: древко від (x, yb) угору, полотно w×h, кольори смуг
  flag(g, x, yb, pole, w, h, cols, t, dir) {
    R(g, x, yb - pole, 1, pole, '#4a3a2a'); R(g, x, yb - pole - 1, 1, 1, '#ffe08a');
    for (let i = 0; i < w; i++) {
      const off = Math.round(Math.sin(t * 5.2 - i * 0.75) * Math.min(1.6, 0.4 + i * 0.3)), xx = x + (dir < 0 ? -1 - i : 1 + i);
      for (let j = 0; j < h; j++) R(g, xx, yb - pole + j + off, 1, 1, cols[Math.floor(j * cols.length / h)]);
      if (i === w - 1 || i % 3 === 0) R(g, xx, yb - pole + h + off, 1, 1, 'rgba(0,0,0,0.18)');
    }
  },
  puffs(g, x, y, t, cols, n, rise, spd) {             // клубочки диму чи вати, що піднімаються й тануть
    for (let k = 0; k < n; k++) {
      const u = ((t * spd + k / n) % 1 + 1) % 1, r = 1 + Math.round(u * 3);
      g.globalAlpha = Math.max(0, 1 - u * u) * 0.9;
      TW.disc(g, x + Math.sin(u * 5 + k * 2) * 2.4 + u * 4, y - u * rise, r, cols[k % cols.length]);
    }
    g.globalAlpha = 1;
  },
  bat(g, x, y, t, ph, c) {
    const up = Math.floor(t * 9 + ph) % 2 === 0;
    TW.stamp(g, Math.round(x) - 3, Math.round(y) - 1, up ? ['W.....W', 'WW.B.WW', '..BBB..'] : ['...B...', 'WWBBBWW', 'W.....W'], { W: c, B: c });
    TW.px(g, x - 1, y + (up ? 1 : 0), '#ffcf4a'); TW.px(g, x + 1, y + (up ? 1 : 0), '#ffcf4a');
  },
  lolly(g, x, yb, t, c1, c2, r) {                     // льодяник, що крутиться: паличка й спіральний диск
    R(g, x, yb - 7, 1, 7, '#ffffff'); R(g, x + 1, yb - 7, 1, 7, '#e8d6e0');
    const cy = yb - 7 - r;
    for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy); if (d > r + 0.6) continue;
      let c = '#6a2440';
      if (d <= r - 0.4) { const a = Math.atan2(dy, dx) + t * 3 - d * 0.9; c = (Math.floor(a / (Math.PI / 3)) % 2 + 2) % 2 ? c1 : c2; }
      R(g, x + dx, cy + dy, 1, 1, c);
    }
    TW.px(g, x - Math.round(r * 0.45), cy - Math.round(r * 0.45), '#ffffff');
  },
  coin(g, x, y, t, r) {                              // монета, що обертається (ширина за косинусом)
    const k = Math.abs(Math.cos(t * 2.2)), hw = Math.max(0, Math.round(r * k));
    for (let dy = -r; dy <= r; dy++) { const h = Math.round(Math.sqrt(r * r + 0.5 - dy * dy) * k); R(g, x - h - 1, y + dy, h * 2 + 3, 1, '#7a4a14'); }
    for (let dy = -r + 1; dy <= r - 1; dy++) { const h = Math.round(Math.sqrt((r - 1) * (r - 1) + 0.5 - dy * dy) * k); R(g, x - h, y + dy, h * 2 + 1, 1, dy < 0 ? '#ffd84a' : '#f2b62e'); }
    if (hw >= 2) { R(g, x - Math.floor(hw / 2), y - 1, 1, 3, '#b8862a'); R(g, x + Math.floor(hw / 2), y - 1, 1, 3, '#b8862a'); R(g, x - 1, y - r + 1, 1, 1, '#fff6c0'); }
    else R(g, x, y - r, 1, r * 2 + 1, '#b8862a');
  }
};

// ---------- малювання будинку під скін: міряємо силует даху (до/після), далі прикраси ----------
function skinTownHouse(g, spec, i, lamps) {
  const tw = skinTownOn();
  if (!tw) return false;
  const top = LAYOUT.horizonY - spec.h, cw = g.canvas.width, ch = g.canvas.height, tf = g.getTransform(), ox = Math.round(tf.e), oy = Math.round(tf.f);
  const y0 = Math.max(-oy, top - 44), hh = LAYOUT.horizonY - y0;
  const sx = spec.x - 6 + ox, ax = Math.max(0, sx), aw = Math.min(cw, sx + spec.w + 12) - ax, ay = y0 + oy;
  const g0 = houseGlass.length;
  let before = null;
  if (aw > 0 && hh > 0 && ay + hh <= ch) before = g.getImageData(ax, ay, aw, hh).data;
  drawHouse(g, spec, lamps);
  const tops = new Array(spec.w + 12).fill(null);
  if (before) {
    const img = g.getImageData(ax, ay, aw, hh), after = img.data, chg = new Uint8Array(aw * hh);
    for (let c = 0; c < aw; c++) for (let r = 0; r < hh; r++) {
      const k = (r * aw + c) * 4;
      if (before[k] !== after[k] || before[k + 1] !== after[k + 1] || before[k + 2] !== after[k + 2] || before[k + 3] !== after[k + 3]) { chg[r * aw + c] = 1; if (tops[ax - sx + c] == null) tops[ax - sx + c] = y0 + r; }
    }
    townRecolor(after, chg, aw, hh, top - y0, sx - ax + 6, spec.w, tw.walls[((i % 5) + 5) % 5], tw.roofs[((i % 5) + 5) % 5]);
    g.putImageData(img, ax, ay);
  }
  const mid = tops.slice(8, spec.w + 4).filter(v => v != null).sort((a, b) => a - b);
  const roofY = mid.length ? mid[Math.floor(mid.length * 0.6)] : top;
  const hs = { x: spec.x, w: spec.w, h: spec.h, top, tops, roofY, i, cx: spec.x + (spec.w >> 1), glass: houseGlass.slice(g0), seed: hash2(spec.x + 91, spec.h + 7) };
  let best = 99;                                                       // точка на даху ближче до середини, де дах рівний
  for (let x = spec.x + 6; x < spec.x + spec.w - 6; x++) { const y = TW.top(hs, x); if (Math.abs(y - roofY) <= 1 && Math.abs(x - hs.cx) < best) { best = Math.abs(x - hs.cx); hs.rx = x; } }
  if (hs.rx == null) hs.rx = hs.cx;
  hs.ry = TW.top(hs, hs.rx);
  if (tw.deco) tw.deco(g, hs);
  townHouses.push(hs);
  return true;
}

// ---------- перефарбування: основний колір стін (і даху) з усіма відтінками переходить у колір скіна; вікна й дрібниці лишаються ----------
function rgbHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, k = Math.floor(((h % 360) + 360) % 360 / 60);
  const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
function townRecolor(d, chg, aw, hh, wallRow, hx, hw, wallHex, roofHex) {
  const hex = s => rgbHsl(parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16));
  const dom = (r0, r1) => {                                            // найчастіший колір серед намальованих пікселів у смузі рядків
    const cnt = new Map(); let best = null, bn = 0;
    for (let r = Math.max(0, r0); r < Math.min(hh, r1); r++) for (let c = 0; c < aw; c++) {
      const p = r * aw + c; if (!chg[p] || d[p * 4 + 3] < 250) continue;
      const e = c - hx, wt = e < 5 || e >= hw - 5 ? 0 : 1;                // кутові камені й пілястри не рахуються
      if (!wt) continue;
      const key = (d[p * 4] << 16) | (d[p * 4 + 1] << 8) | d[p * 4 + 2], n = (cnt.get(key) || 0) + wt; cnt.set(key, n);
      if (n > bn) { bn = n; best = key; }
    }
    return best == null || bn < 12 ? null : rgbHsl(best >> 16, (best >> 8) & 255, best & 255);
  };
  const near = (p, q) => {
    if (p[1] < 0.14 && q[1] < 0.14) return Math.abs(p[2] - q[2]) < 0.3;
    const dh = Math.abs(((p[0] - q[0]) % 360 + 540) % 360 - 180);
    return dh < 24 && Math.abs(p[1] - q[1]) < 0.32 && Math.abs(p[2] - q[2]) < 0.34;
  };
  const W = dom(wallRow + 3, hh - 3), Rf = dom(0, wallRow + 1), tW = hex(wallHex), tR = hex(roofHex);
  const map = (k, src, tg) => {
    const p = rgbHsl(d[k], d[k + 1], d[k + 2]), l = Math.max(0.04, Math.min(0.97, tg[2] + (p[2] - src[2]) * 1.1));
    const [r, g, b] = hslRgb(tg[0] + (src[1] < 0.14 ? 0 : (((p[0] - src[0]) % 360 + 540) % 360 - 180) * 0.5), tg[1], l);
    d[k] = r; d[k + 1] = g; d[k + 2] = b;
  };
  for (let r = 0; r < hh; r++) for (let c = 0; c < aw; c++) {
    const p = r * aw + c; if (!chg[p] || d[p * 4 + 3] < 200) continue;
    const k = p * 4, hsl = rgbHsl(d[k], d[k + 1], d[k + 2]);
    if (W && r >= wallRow - 1 && near(hsl, W)) map(k, W, tW);
    else if (Rf && r <= wallRow + 1 && near(hsl, Rf)) map(k, Rf, tR);
  }
}

// ---------- тло картки скіна: небо епохи, ряд будинків під скін, тротуар (глобальні списки вікон і будинків не змінюються) ----------
function skinTownPreview(g, W, H) {
  const sky = currentEpoch().sky || ['s', 'S', 'w'], base = H - 9;
  for (let y = 0; y < base; y++) R(g, 0, y, W, 1, sky[Math.min(2, Math.floor(y * 3 / base))]);
  const keep = { glass: houseGlass, doors: houseDoors, list: townHouses.slice(), ready: townHouses.glassReady };
  houseGlass = []; houseDoors = [];
  g.save(); g.translate(0, base - LAYOUT.horizonY);
  try {
    for (let x = -10, i = 0; x < W; i++) {
      const hs = hash2(i * 7 + 3, 11), w = 44 + hs % 14, spec = Object.assign({ x, w, h: Math.round((54 + (hs >>> 4) % 20) * HOUSE_SCALE) }, houseColors(i));
      if (!skinTownHouse(g, spec, i, [])) drawHouse(g, spec, []);
      x += w;
    }
  } finally { g.restore(); houseGlass = keep.glass; houseDoors = keep.doors; townHouses.length = 0; keep.list.forEach(h => townHouses.push(h)); townHouses.glassReady = keep.ready; }
  g.globalAlpha = 0.12; R(g, 0, 0, W, base, 'W'); g.globalAlpha = 1;
  R(g, 0, base, W, H - base, 'E'); R(g, 0, base, W, 1, 'e');
}

// ---------- рухомі деталі будинків (щокадру, після шару землі) ----------
function drawSkinTownAnim(time) {
  const tw = skinTownOn();
  if (!tw || !tw.anim || !townHouses.length) return;
  const t = animOn() ? animClock : 0, L = -view.offX - 30, Rr = -view.offX + view.w + 30;
  if (!townHouses.glassReady) {                                        // вікна, сховані деревами чи магазином, не анімуються
    const vis = new Set(houseGlass.map(r => r[0] + ',' + r[1]));
    townHouses.forEach(hs => { hs.glass = hs.glass.filter(r => vis.has(r[0] + ',' + r[1])); });
    townHouses.glassReady = true;
  }
  townHouses.forEach(hs => {
    if (hs.x + hs.w < L || hs.x > Rr) return;
    if (shop && hs.x + hs.w > shop.x + 6 && hs.x < shop.x + shop.w - 6 && hs.roofY > shop.y + 4) return;     // за маркетом не видно
    tw.anim(ctx, hs, t);
  });
  ctx.globalAlpha = 1;
}
function drawSkinShopAnim(sk, t) {
  const tw = SHOP_TOWN[sk];
  if (tw && tw.shop && shop && shop.sign) { tw.shop(ctx, t, shop.x, shop.y + shop.sign.y - 9); ctx.globalAlpha = 1; }
}
// гірлянда з лампочок, що біжать по краю вивіски маркету
function shopBulbs(g, t, cols, step) {
  const s = shop.sign, x0 = shop.x + s.x - 1, y0 = shop.y + s.y - 2, x1 = shop.x + s.x + s.w, y1 = shop.y + s.y + s.h + 1;
  const n = TW.night(), ph = Math.floor(t * 6);
  let k = 0;
  const bulb = (x, y) => { const on = (k + ph) % 3 !== 0, c = cols[(k + (ph >> 1)) % cols.length]; k++;
    if (on && n > 0.15) { g.globalAlpha = 0.3 * n; R(g, x - 1, y - 1, 3, 3, c); g.globalAlpha = 1; }
    R(g, x, y, 1, 1, on ? c : '#5a4a50'); };
  for (let x = x0; x <= x1; x += step) bulb(x, y0);
  for (let x = x1; x >= x0; x -= step) bulb(x, y1);
}

/* ======================= ЦУКЕРКИ ======================= */
const SHOP_TOWN = {};
SHOP_TOWN.candy = {
  walls: ['#ffd3e4', '#c9f2df', '#fff1b8', '#ddd0ff', '#c4e8ff'],
  roofs: ['#e8467c', '#3fb89a', '#ff8a5c', '#9b6ae0', '#4aa6e8'],
  deco(g, hs) {
    const { x, w, top } = hs, base = LAYOUT.horizonY;
    for (let xx = x + 1; xx < x + w - 1; xx++) {                        // глазур по верху стін з патьоками
      const d = (hash2(xx * 3 + 1, hs.seed) % 7) < 3 ? 1 + hash2(xx, 5) % 4 : 0;
      R(g, xx, top, 1, 2 + d, '#fffafc'); R(g, xx, top + 2 + d, 1, 1, '#f3b6cf');
      if (hash2(xx, top) % 9 === 0) R(g, xx, top + 1, 1, 1, ['#ff5c8a', '#4fc3f7', '#ffd23f', '#7ed957'][xx % 4]);
    }
    [x + 1, x + w - 3].forEach(cx => {                                    // кути — смугасті цукрові палички
      for (let y = top + 3; y < base - 1; y++) for (let dx = 0; dx < 2; dx++) R(g, cx + dx, y, 1, 1, ((y + dx) % 6) < 3 ? '#e8467c' : '#ffffff');
    });
    hs.glass.forEach((r, k) => {                                          // під вікнами — ящики з драже
      if (k % 2) return;
      R(g, r[0] - 1, r[1] + r[3], r[2] + 2, 2, '#c43d78'); R(g, r[0] - 1, r[1] + r[3], r[2] + 2, 1, '#ff8fb8');
      for (let i = 0; i < r[2]; i += 2) R(g, r[0] + i, r[1] + r[3] - 1, 1, 1, ['#ffd23f', '#7ed957', '#4fc3f7', '#ff5c8a'][(i >> 1) % 4]);
    });
    if (hs.i % 3 === 0) {                                                // кекс на даху
      const cx = hs.rx, yb = hs.ry;
      for (let j = 0; j < 4; j++) R(g, cx - 4 + (j >> 1), yb - 4 + j, 9 - (j >> 1) * 2, 1, j % 2 ? '#e8467c' : '#ff8fb8');
      for (let k = -3; k <= 3; k += 2) R(g, cx + k, yb - 4, 1, 4, '#c43d78');
      TW.disc(g, cx, yb - 7, 4, '#7a2a4a'); TW.disc(g, cx, yb - 7, 3, '#fffafc'); R(g, cx - 3, yb - 6, 7, 2, '#ffd3e4');
      [[-2, -8, '#4fc3f7'], [1, -9, '#ffd23f'], [2, -6, '#7ed957'], [-1, -6, '#ff5c8a']].forEach(([dx, dy, c]) => R(g, cx + dx, yb + dy, 1, 1, c));
      TW.disc(g, cx, yb - 12, 1, '#d8203c'); R(g, cx, yb - 14, 1, 1, '#3f8a3a');
    }
  },
  anim(g, hs, t) {
    const n = TW.night();
    TW.roofLine(hs, 4, (x, y, k) => {                                    // вогники-драже по краю даху, переливаються
      const c = ['#ff5c8a', '#ffd23f', '#7ed957', '#4fc3f7', '#c78bff'][(k + Math.floor(t * 2.5)) % 5];
      if (n > 0.15) { g.globalAlpha = 0.28 * n; R(g, x - 1, y - 2, 3, 3, c); g.globalAlpha = 1; }
      R(g, x, y - 1, 1, 1, c);
    });
    if (hs.i % 3 === 1) TW.lolly(g, hs.rx, hs.ry, t + hs.i, '#ff5c8a', '#ffffff', 4);
    else if (hs.i % 3 === 2) {                                           // рожева труба з цукровою ватою
      const x = hs.rx + 6, y = hs.ry;
      R(g, x - 2, y - 6, 5, 6, '#7a2a4a'); R(g, x - 1, y - 6, 3, 6, '#ff8fb8'); R(g, x - 2, y - 7, 5, 1, '#e8467c'); R(g, x - 1, y - 5, 1, 4, '#ffd3e4');
      TW.puffs(g, x, y - 9, t + hs.i * 0.37, ['#ffc4dc', '#fff0f6', '#ffb0d0'], 4, 20, 0.32);
    }
    if (hs.i % 4 === 0 && !state.settings.noFly) {                       // повітряна кулька злітає з даху й повертається
      const u = ((t * 0.09 + hs.i * 0.21) % 1), y = hs.ry - 10 - u * 70, x = hs.x + 5 + Math.sin(u * 9 + hs.i) * 3;
      g.globalAlpha = u > 0.85 ? (1 - u) / 0.15 : 1;
      const c = ['#ff5c8a', '#4fc3f7', '#ffd23f'][hs.i % 3];
      TW.disc(g, x, y, 3, '#5a2440'); TW.disc(g, x, y, 2, c); TW.px(g, x - 1, y - 1, '#ffffff'); TW.px(g, x, y + 4, '#5a2440');
      for (let k = 5; k < 11; k++) TW.px(g, x + Math.round(Math.sin(t * 4 + k) * 0.6), y + k, '#ffffff');
      g.globalAlpha = 1;
    }
  },
  shop(g, t, sx, roofY) {
    shopBulbs(g, t, ['#ff5c8a', '#ffd23f', '#7ed957', '#4fc3f7'], 4);
    TW.lolly(g, sx + 9, roofY + 1, t, '#ff5c8a', '#ffffff', 5);
    TW.lolly(g, sx + shop.w - 10, roofY + 1, -t * 1.1, '#4fc3f7', '#ffffff', 5);
    if (shop.roofSign && !state.settings.noFly) {                        // посипка злітає над вивіскою
      const rs = shop.roofSign, cx = sx + rs.x + (rs.w >> 1);
      for (let k = 0; k < 8; k++) {
        const u = ((t * 0.45 + k / 8) % 1), x = cx + Math.round(Math.sin(k * 2.3) * (rs.w / 2 + 4) * u), y = shop.y + rs.y - 2 - Math.round(Math.sin(u * Math.PI) * 14);
        g.globalAlpha = 1 - u * 0.6; R(g, x, y, 2, 1, ['#ff5c8a', '#ffd23f', '#7ed957', '#4fc3f7'][k % 4]);
      }
      g.globalAlpha = 1;
    }
  }
};

/* ======================= ЗОЛОТО ======================= */
SHOP_TOWN.gold = {
  walls: ['#f6e3a8', '#efd17e', '#fff2cc', '#e2bf6a', '#f3dc9a'],
  roofs: ['#8a5a1c', '#b8862a', '#6e4518', '#a8742a', '#7a4a14'],
  deco(g, hs) {
    const { x, w, top } = hs, base = LAYOUT.horizonY;
    R(g, x, top, w, 1, '#7a4a14'); R(g, x, top + 1, w, 2, '#f2c94c'); R(g, x, top + 1, w, 1, '#fff3b0'); R(g, x, top + 3, w, 1, '#b8862a');   // золотий карниз
    for (let xx = x + 2; xx < x + w - 2; xx += 4) R(g, xx, top + 4, 2, 1, '#d9a83a');                                                       // зубчики під ним
    R(g, x, base - 4, w, 1, '#7a4a14'); R(g, x, base - 3, w, 3, '#e2b648'); R(g, x, base - 3, w, 1, '#fff3b0');                               // цоколь
    [x + 1, x + w - 4].forEach(cx => {                                   // пілястри з капітелями
      R(g, cx, top + 5, 3, base - top - 9, '#f2c94c'); R(g, cx, top + 5, 1, base - top - 9, '#fff3b0'); R(g, cx + 2, top + 5, 1, base - top - 9, '#b8862a');
      R(g, cx - 1, top + 5, 5, 2, '#b8862a'); R(g, cx - 1, top + 5, 5, 1, '#fff3b0');
    });
    hs.glass.forEach(r => { R(g, r[0] - 1, r[1] - 2, r[2] + 2, 1, '#b8862a'); R(g, r[0], r[1] - 3, r[2], 1, '#f2c94c'); TW.px(g, r[0] + (r[2] >> 1), r[1] - 4, '#f2c94c'); });   // золоті брівки над вікнами
    if (hs.i % 2 === 0) {                                                // золотий купол зі шпилем
      const cx = hs.rx, yb = hs.ry;
      R(g, cx - 5, yb - 2, 11, 2, '#7a4a14'); R(g, cx - 4, yb - 2, 9, 1, '#e2b648');
      for (let dy = 0; dy <= 5; dy++) { const h = Math.round(Math.sqrt(30.5 - dy * dy)); R(g, cx - h, yb - 3 - dy, h * 2 + 1, 1, '#7a4a14'); if (h > 1) R(g, cx - h + 1, yb - 3 - dy, h * 2 - 1, 1, dy > 3 ? '#ffe27a' : '#f2c94c'); }
      R(g, cx - 2, yb - 7, 1, 3, '#fff3b0'); R(g, cx + 3, yb - 6, 1, 3, '#b8862a');
      R(g, cx, yb - 13, 1, 5, '#b8862a'); TW.disc(g, cx, yb - 14, 1, '#ffe27a');
    }
  },
  anim(g, hs, t) {
    for (let xx = hs.x + 3, k = 0; xx < hs.x + hs.w - 3; xx += 7, k++) {   // зблиски бігають по карнизу
      const v = Math.sin(t * 2.4 - xx * 0.09 + hs.i); if (v > 0.55) sparkPlus(xx, hs.top + 1, (v - 0.55) / 0.45, '#fff3b0');
    }
    if (hs.i % 2 === 1) TW.flag(g, hs.rx, hs.ry, 12, 8, 5, ['#ffd84a', '#d8203c', '#ffd84a'], t + hs.i, hs.i % 4 === 1 ? 1 : -1);
    else { const v = Math.sin(t * 1.7 + hs.i * 2); if (v > 0.3) sparkPlus(hs.rx, hs.ry - 14, (v - 0.3) / 0.7, '#ffffff'); }
  },
  shop(g, t, sx, roofY) {
    shopBulbs(g, t, ['#ffe27a', '#fff6c0', '#f2b62e'], 4);
    TW.flag(g, sx + 6, roofY + 1, 16, 10, 6, ['#d8203c', '#ffd84a', '#d8203c'], t, 1);
    TW.flag(g, sx + shop.w - 7, roofY + 1, 16, 10, 6, ['#d8203c', '#ffd84a', '#d8203c'], t + 0.7, -1);
    if (shop.roofSign) { const rs = shop.roofSign; TW.coin(g, sx + rs.x + (rs.w >> 1), shop.y + rs.y - 8, t, 5); }
  }
};

/* ======================= ХЕЛЛОВІН ======================= */
SHOP_TOWN.halloween = {
  walls: ['#5d4a78', '#465264', '#6e4c3c', '#53406e', '#5a6470'],
  roofs: ['#2a1d33', '#c45a1c', '#1f2633', '#5c2a6e', '#3a2a1a'],
  deco(g, hs) {
    const { x, w, top } = hs, base = LAYOUT.horizonY;
    for (let xx = x + 1; xx < x + w - 1; xx++) {                        // зелений слиз стікає з-під даху
      if (hash2(xx * 5, hs.seed) % 5) continue;
      const d = 2 + hash2(xx, 9) % 6; R(g, xx, top, 1, d, '#7ed957'); R(g, xx, top + d, 1, 1, '#3f8a3a'); TW.px(g, xx, top + 1, '#c8f59a');
    }
    const wx = x + 1, wy = top + 2;                                      // павутина в кутку
    lineG(g, wx, wy, wx + 9, wy, '#e8e4f0'); lineG(g, wx, wy, wx, wy + 9, '#e8e4f0'); lineG(g, wx, wy, wx + 7, wy + 7, '#e8e4f0');
    lineG(g, wx + 4, wy, wx, wy + 4, '#c8c0d8'); lineG(g, wx + 7, wy, wx + 5, wy + 5, '#c8c0d8'); lineG(g, wx + 5, wy + 5, wx, wy + 7, '#c8c0d8');
    hs.glass.forEach((r, k) => {                                         // забиті дошками вікна
      if ((k + hs.i) % 5) return;
      lineG(g, r[0] - 1, r[1], r[0] + r[2], r[1] + r[3] - 1, '#6b4a2a'); lineG(g, r[0] - 1, r[1] + r[3] - 1, r[0] + r[2], r[1], '#4a301a');
      TW.px(g, r[0], r[1] + 1, '#c8c0a0'); TW.px(g, r[0] + r[2] - 1, r[1] + 1, '#c8c0a0');
    });
    if (hs.i % 3 === 1) {                                                // криве опудало-флюгер з кажаном
      const cx = hs.rx, yb = hs.ry;
      R(g, cx, yb - 12, 1, 12, '#2a1d33'); lineG(g, cx - 4, yb - 9, cx + 4, yb - 10, '#2a1d33');
      TW.stamp(g, cx - 3, yb - 15, ['W..B..W', 'WWBBBWW', '..B.B..'], { W: '#2a1d33', B: '#2a1d33' });
    }
    if (hs.i % 2 === 0) { const px = x + 5 + (hs.seed % Math.max(1, w - 14)); pumpkinG(g, px, base, 3); }   // гарбуз біля порога
  },
  anim(g, hs, t) {
    const n = TW.night();
    hs.glass.forEach((r, k) => {                                         // вікна тремтять оранжевим світлом свічок
      if ((k + hs.i) % 3) return;
      const f = 0.45 + 0.35 * Math.sin(t * 9 + k * 3.1) + 0.2 * Math.sin(t * 23 + k);
      g.globalAlpha = Math.max(0, Math.min(1, (0.3 + 0.6 * n) * f)); R(g, r[0], r[1], r[2], r[3], '#ff9a2c');
      g.globalAlpha = Math.max(0, Math.min(1, (0.2 + 0.4 * n) * f)); R(g, r[0] + 1, r[1] + 1, r[2] - 2, r[3] - 2, '#ffe07a');
    });
    g.globalAlpha = 1;
    if (!state.settings.noFly) {
      if (hs.i % 2 === 0) {                                              // кажани кружляють над дахом вісімкою
        for (let b = 0; b < 2; b++) { const a = t * 1.3 + hs.i * 1.7 + b * Math.PI; TW.bat(g, hs.cx + Math.cos(a) * (hs.w * 0.45), hs.ry - 16 + Math.sin(a * 2) * 6 - b * 5, t, b + hs.i, '#2a1d33'); }
      }
      if (hs.i % 3 === 2) {                                              // привид виринає з даху й тане
        const u = ((t * 0.12 + hs.i * 0.29) % 1); if (u < 0.6) {
          const v = u / 0.6, y = hs.ry - 4 - Math.round(v * 22), x = hs.rx + Math.round(Math.sin(v * 7) * 3);
          g.globalAlpha = Math.sin(v * Math.PI) * 0.85;
          TW.stamp(g, x - 3, y - 5, ['.OOOOO.', 'OWWWWWO', 'OWKWKWO', 'OWWWWWO', 'OWWOWWO', 'OWWWWWO', 'OW.W.WO'], { O: '#9a90b8', W: '#f4f0ff', K: '#2a1d33' });
          g.globalAlpha = 1;
        }
      }
    }
  },
  shop(g, t, sx, roofY) {
    shopBulbs(g, t, ['#ff8c2a', '#9b5de5', '#7ed957'], 5);
    if (!state.settings.noFly) for (let b = 0; b < 4; b++) {               // зграйка кажанів над маркетом
      const a = t * 1.1 + b * 1.6; TW.bat(g, sx + shop.w / 2 + Math.cos(a) * shop.w * 0.42, roofY - 20 + Math.sin(a * 2) * 7 - (b % 2) * 6, t, b, '#2a1d33');
    }
    const s = shop.sign, hx = sx + s.x + 14, hy = shop.y + s.y + s.h + 1, len = 6 + Math.round((Math.sin(t * 0.8) + 1) * 6);   // павук спускається на нитці
    R(g, hx, hy, 1, len, '#e8e4f0');
    TW.stamp(g, hx - 2, hy + len, ['L.B.L', '.BBB.', 'LBRBL', '.BBB.', 'L...L'], { B: '#2a1d33', L: '#2a1d33', R: '#d8203c' });
    [sx + 4, sx + shop.w - 6].forEach((cx, i) => {                        // гарбузи-ліхтарі на кутах даху мерехтять
      pumpkinG(g, cx, roofY + 1, 3);
      g.globalAlpha = 0.55 + 0.45 * Math.sin(t * 11 + i * 2); R(g, cx - 2, roofY - 4, 2, 2, '#fff2a0'); R(g, cx + 1, roofY - 4, 2, 2, '#fff2a0'); R(g, cx - 1, roofY - 2, 3, 1, '#fff2a0'); g.globalAlpha = 1;
    });
  }
};
