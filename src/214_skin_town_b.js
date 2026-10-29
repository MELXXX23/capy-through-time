//#part 214_skin_town_b.js
/* Скіни «Будівлі» (продовження): Діамант, Дерево, Сад, Різдво, Океан.
   Спільні помічники для прикрас — TW2; формат записів SHOP_TOWN — як у 214_skin_town.js. Маркет «Океану» не чіпаємо (лише будинки). */
const TW2 = {
  snowCap(g, hs, c1, c2) {                                              // сніг лежить по силуету даху
    for (let x = hs.x - 3; x < hs.x + hs.w + 3; x++) {
      let y = TW.top(hs, x); if (y < hs.roofY - 16) continue;
      const d = 1 + (hash2(x, hs.seed) % 3 === 0 ? 1 : 0);
      R(g, x, y - d, 1, d + 1, c1); if (hash2(x + 1, hs.seed) % 4 === 0) R(g, x, y + 1, 1, 1, c2);
    }
  },
  icicles(g, hs, y, c1, c2) {
    for (let x = hs.x + 1; x < hs.x + hs.w - 1; x += 2) {
      const d = 1 + hash2(x * 7, hs.seed) % 5; R(g, x, y, 1, d, c1); R(g, x, y, 1, 1, c2);
    }
  },
  vine(g, x, y0, y1, seed) {                                            // плющ повзе вгору
    for (let y = y1; y > y0; y--) {
      const dx = Math.round(Math.sin(y * 0.35 + seed) * 1.2); R(g, x + dx, y, 1, 1, '#3f8a3a');
      if ((y + seed) % 4 === 0) { R(g, x + dx - 1, y, 1, 1, '#7ed957'); R(g, x + dx + 1, y - 1, 1, 1, '#5cbf4a'); }
      if ((y * 3 + seed) % 23 === 0) R(g, x + dx + 1, y, 1, 1, ['#ff5c8a', '#ffd23f', '#ffffff'][y % 3]);
    }
  },
  flowerBox(g, r, cols, box) {
    R(g, r[0] - 1, r[1] + r[3], r[2] + 2, 2, box || '#7a4a24'); R(g, r[0] - 1, r[1] + r[3], r[2] + 2, 1, '#a8743a');
    for (let i = 0; i < r[2]; i++) { R(g, r[0] + i, r[1] + r[3] - 1, 1, 1, i % 2 ? '#4fa83a' : cols[(i >> 1) % cols.length]); if (i % 3 === 1) R(g, r[0] + i, r[1] + r[3] - 2, 1, 1, cols[(i + 1) % cols.length]); }
  },
  chimney(g, x, yb, c1, c2) { R(g, x - 2, yb - 7, 5, 7, c2); R(g, x - 1, yb - 7, 3, 7, c1); R(g, x - 3, yb - 8, 7, 2, c2); R(g, x - 2, yb - 8, 5, 1, c1); },
  butterfly(g, x, y, t, ph, c1, c2) {
    const up = Math.floor(t * 12 + ph) % 2 === 0; x = Math.round(x); y = Math.round(y);
    R(g, x, y, 1, 2, '#2a1d1a');
    if (up) { R(g, x - 2, y - 1, 2, 2, c1); R(g, x + 1, y - 1, 2, 2, c1); TW.px(g, x - 2, y - 1, c2); TW.px(g, x + 2, y - 1, c2); }
    else { R(g, x - 1, y, 1, 2, c1); R(g, x + 1, y, 1, 2, c1); }
  },
  gull(g, x, y, t, ph) {
    const up = Math.floor(t * 5 + ph) % 2 === 0; x = Math.round(x); y = Math.round(y);
    TW.stamp(g, x - 4, y - 1, up ? ['WW.....WW', '..WW.WW..', '....O....'] : ['.........', 'WWWWOWWWW', '.W.....W.'], { W: '#ffffff', O: '#f2a63c' });
    TW.px(g, x - 4, y + (up ? -1 : 0), '#8a96a8'); TW.px(g, x + 4, y + (up ? -1 : 0), '#8a96a8');
  },
  pinwheel(g, x, yb, t, cols) {                                         // вітрячок на паличці
    R(g, x, yb - 8, 1, 8, '#7a4a24');
    const a0 = t * 4, cy = yb - 9;
    for (let k = 0; k < 4; k++) { const a = a0 + k * Math.PI / 2; for (let r = 1; r <= 3; r++) R(g, Math.round(x + Math.cos(a) * r + Math.cos(a + 1.2) * (r > 1 ? 1 : 0)), Math.round(cy + Math.sin(a) * r + Math.sin(a + 1.2) * (r > 1 ? 1 : 0)), 1, 1, cols[k]); }
    TW.px(g, x, cy, '#ffffff');
  },
  fall(g, hs, t, n, cols, spd, sway) {                                  // щось падає з краю даху (пелюстки, листя, краплі)
    for (let k = 0; k < n; k++) {
      const u = ((t * spd + k / n + hs.i * 0.13) % 1), x0 = hs.x + 4 + ((hs.seed >>> (k * 3)) % Math.max(1, hs.w - 8));
      const y = TW.top(hs, x0) + u * 40, x = x0 + Math.sin(u * 8 + k) * sway;
      g.globalAlpha = u > 0.8 ? (1 - u) * 5 : 1; R(g, Math.round(x), Math.round(y), 1 + (k % 2), 1, cols[k % cols.length]);
    }
    g.globalAlpha = 1;
  },
  gem(g, x, y, t, r, c1, c2) {                                          // діамант, що обертається й підстрибує
    const k = Math.abs(Math.cos(t * 1.8)), yy = Math.round(y + Math.sin(t * 2.2) * 1.5);
    for (let dy = -r; dy <= r; dy++) { const h = Math.round((r - Math.abs(dy)) * k); R(g, x - h - 1, yy + dy, h * 2 + 3, 1, '#2a3a6a'); }
    for (let dy = -r + 1; dy <= r - 1; dy++) { const h = Math.round((r - 1 - Math.abs(dy)) * k); if (h >= 0) R(g, x - h, yy + dy, h * 2 + 1, 1, dy < 0 ? c1 : c2); }
    TW.px(g, x, yy - r + 1, '#ffffff'); if (Math.sin(t * 2.6) > 0.7) sparkPlus(x + 2, yy - 2, 1, '#ffffff');
  },
  snow(g, x0, y0, w, h, t, n) {
    for (let k = 0; k < n; k++) { const u = ((t * 0.18 + k / n) % 1), x = x0 + ((k * 37) % w) + Math.sin(t * 1.4 + k) * 2, y = y0 + u * h; g.globalAlpha = 0.9 - u * 0.5; R(g, Math.round(x), Math.round(y), k % 3 ? 1 : 2, 1, '#ffffff'); }
    g.globalAlpha = 1;
  }
};

/* ======================= ДІАМАНТ ======================= */
SHOP_TOWN.diamond = {
  walls: ['#dff2ff', '#d2dcff', '#ecfaff', '#c8eef4', '#e4dcff'],
  roofs: ['#4a6fd8', '#6a4fd8', '#2a9ac8', '#5a5ae8', '#3a7ab8'],
  deco(g, hs) {
    const { x, w, top } = hs, base = LAYOUT.horizonY;
    R(g, x, top, w, 1, '#2a3a6a'); R(g, x, top + 1, w, 2, '#bfe8ff'); R(g, x, top + 1, w, 1, '#ffffff');      // кришталевий карниз
    for (let xx = x + 3; xx < x + w - 3; xx += 6) { R(g, xx, top + 3, 3, 1, '#5fb8ff'); TW.px(g, xx + 1, top + 4, '#5fb8ff'); TW.px(g, xx + 1, top + 3, '#ffffff'); }   // грані-ромбики
    [x + 1, x + w - 3].forEach(cx => { for (let y = top + 5; y < base - 1; y++) R(g, cx, y, 2, 1, (y % 4) < 2 ? '#a8d8ff' : '#e8f6ff'); });
    if (hs.i % 2 === 0) {                                               // кристал на даху
      const cx = hs.rx, yb = hs.ry;
      for (let j = 0; j < 12; j++) { const hw = Math.max(0, Math.round((12 - j) * 0.35)); R(g, cx - hw - 1, yb - j, hw * 2 + 3, 1, '#2a3a6a'); R(g, cx - hw, yb - j, hw + 1, 1, '#bfe8ff'); if (hw) R(g, cx + 1, yb - j, hw, 1, '#5f8fe8'); }
      R(g, cx - 5, yb - 5, 2, 5, '#2a3a6a'); R(g, cx - 5, yb - 4, 1, 4, '#bfe8ff'); R(g, cx + 4, yb - 6, 2, 6, '#2a3a6a'); R(g, cx + 4, yb - 5, 1, 5, '#8fb8ff');
    }
  },
  anim(g, hs, t) {
    for (let xx = hs.x + 4; xx < hs.x + hs.w - 3; xx += 6) { const v = Math.sin(t * 3 - xx * 0.13 + hs.i); if (v > 0.6) sparkPlus(xx, hs.top + 2, (v - 0.6) / 0.4, '#bfe8ff'); }
    if (hs.i % 2 === 0) { const v = Math.sin(t * 1.9 + hs.i); if (v > 0.2) sparkPlus(hs.rx, hs.ry - 10, (v - 0.2) / 0.8, '#ffffff'); }
    else TW2.gem(g, hs.rx, hs.ry - 9, t + hs.i, 4, '#bfe8ff', '#5f8fe8');
  },
  shop(g, t, sx, roofY) {
    shopBulbs(g, t, ['#ffffff', '#8fd8ff', '#c8a8ff'], 4);
    TW2.gem(g, sx + 8, roofY - 6, t, 5, '#e8f6ff', '#6aa8ff');
    TW2.gem(g, sx + shop.w - 9, roofY - 6, t + 1.3, 5, '#f0e8ff', '#a07aff');
  }
};

/* ======================= ДЕРЕВО ======================= */
SHOP_TOWN.wood = {
  walls: ['#c89a64', '#b07a48', '#d8b07a', '#a8744a', '#c0905a'],
  roofs: ['#6a3a1e', '#7a4a24', '#5a3018', '#8a5a2a', '#4a2a14'],
  deco(g, hs) {
    const { x, w, top } = hs, base = LAYOUT.horizonY;
    g.globalAlpha = 0.22; for (let y = top + 4; y < base - 2; y += 4) R(g, x + 2, y, w - 4, 1, '#4a2a14'); g.globalAlpha = 1;      // дошки
    [x + 1, x + w - 4].forEach(cx => { for (let y = top + 3; y < base - 3; y += 5) { TW.disc(g, cx + 1, y + 1, 1, '#6a3a1e'); TW.px(g, cx + 1, y + 1, '#e8c08a'); } });   // торці колод
    hs.glass.forEach((r, k) => { if (k % 2 === 0) TW2.flowerBox(g, r, ['#ff5c5c', '#ffd23f'], '#6a3a1e'); R(g, r[0] - 2, r[1], 1, r[3], '#6a3a1e'); R(g, r[0] + r[2] + 1, r[1], 1, r[3], '#6a3a1e'); });   // віконниці
    if (hs.i % 3 === 0) {                                               // шпаківня на жердині
      const cx = hs.rx, yb = hs.ry;
      R(g, cx, yb - 8, 1, 8, '#4a2a14'); R(g, cx - 3, yb - 14, 7, 6, '#4a2a14'); R(g, cx - 2, yb - 13, 5, 5, '#c89a64'); TW.disc(g, cx, yb - 11, 1, '#2a1a0a');
      for (let j = 0; j < 3; j++) R(g, cx - 4 + j, yb - 15 - j, 9 - j * 2, 1, '#8a3a1e');
    }
    if (hs.i % 3 === 1) TW2.chimney(g, hs.rx + 5, hs.ry, '#a85a3a', '#5a2a1a');
  },
  anim(g, hs, t) {
    if (hs.i % 3 === 1) TW.puffs(g, hs.rx + 5, hs.ry - 10, t + hs.i * 0.4, ['#d8d0c8', '#eae4dc', '#c0b8b0'], 4, 22, 0.28);
    else if (hs.i % 3 === 2) {                                          // флюгер-півник крутиться
      const cx = hs.rx, yb = hs.ry, k = Math.cos(t * 0.7 + hs.i);
      R(g, cx, yb - 12, 1, 12, '#4a3a2a'); R(g, cx - 3, yb - 6, 7, 1, '#4a3a2a'); TW.px(g, cx - 4, yb - 6, '#c8a050'); TW.px(g, cx + 4, yb - 6, '#c8a050');
      const hw = Math.max(1, Math.round(Math.abs(k) * 4)), dir = k > 0 ? 1 : -1;
      R(g, cx - hw, yb - 14, hw * 2 + 1, 2, '#2a2a2a'); R(g, cx + dir * hw, yb - 16, 1, 2, '#2a2a2a'); TW.px(g, cx + dir * hw, yb - 17, '#d8203c'); R(g, cx - dir * hw, yb - 16, 1, 2, '#2a2a2a');
    } else {                                                            // пташка визирає зі шпаківні
      const up = Math.sin(t * 1.3 + hs.i) > 0.2; if (up) { TW.px(g, hs.rx, hs.ry - 12, '#6a4a2a'); TW.px(g, hs.rx - 1, hs.ry - 12, '#f2a63c'); }
    }
  },
  shop(g, t, sx, roofY) {
    shopBulbs(g, t, ['#ffd27a', '#ffb347', '#fff0c0'], 5);
    TW2.chimney(g, sx + 10, roofY + 1, '#a85a3a', '#5a2a1a');
    TW.puffs(g, sx + 10, roofY - 9, t, ['#d8d0c8', '#eae4dc', '#c0b8b0'], 5, 26, 0.25);
    const s = shop.sign, lx = sx + s.x + s.w - 6, ly = shop.y + s.y + s.h + 1, a = Math.sin(t * 2) * 0.35;   // ліхтар гойдається
    const ex = Math.round(lx + Math.sin(a) * 6), ey = Math.round(ly + Math.cos(a) * 6);
    lineG(g, lx, ly, ex, ey, '#4a2a14'); R(g, ex - 2, ey, 5, 6, '#4a2a14'); R(g, ex - 1, ey + 1, 3, 4, '#ffd27a'); g.globalAlpha = 0.3 + 0.3 * TW.night(); R(g, ex - 3, ey - 1, 7, 8, '#ffd27a'); g.globalAlpha = 1;
  }
};

/* ======================= САД ======================= */
SHOP_TOWN.garden = {
  walls: ['#eaf4d4', '#d4ecc4', '#f6f2d4', '#cce6b4', '#e2f2cc'],
  roofs: ['#4a9a3a', '#3a8a4a', '#5aaa3a', '#2a7a3a', '#6aaa4a'],
  deco(g, hs) {
    const { x, w, top } = hs, base = LAYOUT.horizonY;
    TW2.vine(g, x + 2, top + 2, base - 1, hs.seed % 7); if (hs.i % 2) TW2.vine(g, x + w - 3, top + 10, base - 1, hs.seed % 5 + 2);
    hs.glass.forEach(r => TW2.flowerBox(g, r, ['#ff5c8a', '#ffd23f', '#ffffff', '#c78bff'], '#8a5a2a'));
    for (let xx = x + 2; xx < x + w - 2; xx += 3) { const y = TW.top(hs, xx); if (y < hs.roofY - 3) continue; TW.disc(g, xx, hs.roofY - 1, 1 + (hash2(xx, hs.seed) % 2), (xx >> 1) % 3 ? '#4fa83a' : '#6cbf3a'); }   // садок на даху
    for (let xx = x + 4; xx < x + w - 4; xx += 7) TW.px(g, xx, hs.roofY - 3, ['#ff5c8a', '#ffd23f', '#ffffff'][(xx >> 2) % 3]);
  },
  anim(g, hs, t) {
    if (hs.i % 2 === 0) for (let k = 0; k < 2; k++) {                   // соняшники гойдаються
      const x = hs.x + 6 + k * Math.max(8, hs.w - 12) / 1, sw = Math.round(Math.sin(t * 1.6 + k + hs.i) * 1.2), yb = hs.roofY - 1;
      if (x > hs.x + hs.w - 4) continue;
      R(g, x, yb - 8, 1, 8, '#3f8a3a'); TW.px(g, x + 1, yb - 4, '#6cbf3a');
      TW.disc(g, x + sw, yb - 10, 2, '#ffd23f'); R(g, x + sw, yb - 10, 1, 1, '#7a4a14');
    }
    if (!noFlyOn()) {
      const a = t * 0.9 + hs.i * 2.1; TW2.butterfly(g, hs.cx + Math.cos(a) * hs.w * 0.4, hs.roofY - 10 + Math.sin(a * 1.7) * 6, t, hs.i, ['#ff8fb8', '#ffd23f', '#8fd8ff'][hs.i % 3], '#ffffff');
    }
  },
  shop(g, t, sx, roofY) {
    shopBulbs(g, t, ['#7ed957', '#ffd23f', '#ff8fb8'], 4);
    if (!noFlyOn()) for (let b = 0; b < 3; b++) { const a = t * 0.8 + b * 2.1; TW2.butterfly(g, sx + shop.w / 2 + Math.cos(a) * shop.w * 0.45, roofY - 12 + Math.sin(a * 1.6) * 8, t, b, ['#ff8fb8', '#ffd23f', '#8fd8ff'][b], '#ffffff'); }
    [sx + 7, sx + shop.w - 8].forEach((x, k) => { const sw = Math.round(Math.sin(t * 1.5 + k) * 1.2); R(g, x - 2, roofY - 2, 5, 3, '#8a5a2a'); R(g, x, roofY - 11, 1, 9, '#3f8a3a'); TW.disc(g, x + sw, roofY - 13, 3, '#ffd23f'); TW.disc(g, x + sw, roofY - 13, 1, '#7a4a14'); });
  }
};

/* ======================= РІЗДВО ======================= */
SHOP_TOWN.xmas = {
  walls: ['#c8402e', '#3a8a4a', '#f4e8d8', '#a8362e', '#2e6e5a'],
  roofs: ['#eef4fa', '#ffffff', '#dde8f4', '#f0f4fa', '#e4eef8'],
  deco(g, hs) {
    TW2.snowCap(g, hs, '#ffffff', '#d8ecf8');
    TW2.icicles(g, hs, hs.top, '#e8f6ff', '#ffffff');
    hs.glass.forEach((r, k) => { if ((k + hs.i) % 4) return; const cx = r[0] + (r[2] >> 1), cy = r[1] - 4;   // вінок над вікном
      for (let a = 0; a < 12; a++) R(g, Math.round(cx + Math.cos(a * 0.52) * 3), Math.round(cy + Math.sin(a * 0.52) * 3), 1, 1, a % 3 ? '#2e7a3a' : '#5cbf4a'); TW.px(g, cx, cy + 3, '#d8203c'); });
    if (hs.i % 3 === 1) TW2.chimney(g, hs.rx + 4, hs.ry, '#a8362e', '#5a1a1a');
  },
  anim(g, hs, t) {
    const n = TW.night();
    TW.roofLine(hs, 3, (x, y, k) => {
      const on = (k + Math.floor(t * 3)) % 4 !== 0, c = ['#ff4040', '#ffd23f', '#5cbf4a', '#4fa8ff'][k % 4];
      if (on && n > 0.15) { g.globalAlpha = 0.35 * n; R(g, x - 1, y, 3, 3, c); g.globalAlpha = 1; }
      R(g, x, y + 1, 1, 1, on ? c : '#4a4a5a');
    });
    if (hs.i % 3 === 1) TW.puffs(g, hs.rx + 4, hs.ry - 10, t + hs.i * 0.3, ['#e8eef4', '#ffffff', '#d0d8e0'], 4, 22, 0.26);
    if (hs.i % 3 === 0) { const v = 0.5 + 0.5 * Math.sin(t * 3 + hs.i); TW.stamp(g, hs.rx - 2, hs.ry - 7, ['..Y..', 'YYYYY', '.YYY.', 'Y...Y'], { Y: '#ffd23f' }); if (v > 0.6) sparkPlus(hs.rx, hs.ry - 8, v, '#fff6c0'); R(g, hs.rx, hs.ry - 3, 1, 3, '#7a4a14'); }
    TW2.snow(g, hs.x, hs.roofY - 30, hs.w, 34, t + hs.i, 2);
  },
  shop(g, t, sx, roofY) {
    shopBulbs(g, t, ['#ff4040', '#ffd23f', '#5cbf4a', '#4fa8ff'], 3);
    TW2.snow(g, sx, roofY - 44, shop.w, 48, t, 16);
    if (!noFlyOn()) {                                       // сани з оленем пролітають над маркетом
      const u = (t * 0.07) % 1; if (u < 0.45) {
        const v = u / 0.45, x = Math.round(sx - 40 + v * (shop.w + 80)), y = Math.round(roofY - 34 - Math.sin(v * Math.PI) * 10);
        TW.stamp(g, x, y, ['..B.B.........', '..BBB.....RRR.', '.BBBB....RRRRR', 'BB..B.YYYRRRRR', 'B...B.....Y..Y'], { B: '#8a5a2a', R: '#d8203c', Y: '#ffd23f' });
        if (Math.floor(t * 8) % 2) TW.px(g, x + 1, y + 1, '#ff4040');
        for (let k = 1; k < 6; k++) { g.globalAlpha = 1 - k / 6; TW.px(g, x + 14 + k * 2, y + 3 + (k % 2), '#fff6c0'); } g.globalAlpha = 1;
      }
    }
  }
};

/* ======================= ОКЕАН (лише будинки: пляжні хатки) ======================= */
SHOP_TOWN.ocean = {
  walls: ['#eaf8ff', '#d4f2ee', '#fff6e2', '#cceaf8', '#e2f6ea'],
  roofs: ['#2a7ab8', '#e8604a', '#3aa8a8', '#f0a040', '#4a5ad8'],
  deco(g, hs) {
    const { x, w, top } = hs, base = LAYOUT.horizonY;
    g.globalAlpha = 0.18; for (let xx = x + 3; xx < x + w - 3; xx += 6) R(g, xx, top + 3, 3, base - top - 6, ['#2a7ab8', '#e8604a', '#3aa8a8'][hs.i % 3]); g.globalAlpha = 1;   // смуги пляжної хатки
    for (let xx = x; xx < x + w; xx++) TW.px(g, xx, top + 2 + Math.round(Math.sin(xx * 0.7) * 0.6), '#c8a060');                 // мотузка під дахом
    if (hs.i % 3 === 0) lifeRingG(g, x + w - 9, top + 12);
    else if (hs.i % 3 === 1) sprG(g, x + 3, top + 8, SPR_STARFISH);
    else sprG(g, x + w - 12, top + 9, SPR_SHELL);
  },
  anim(g, hs, t) {
    if (hs.i % 2 === 0) TW.flag(g, hs.rx, hs.ry, 12, 8, 5, ['#2a7ab8', '#ffffff', '#e8604a'], t + hs.i, hs.i % 4 ? 1 : -1);
    else if (!noFlyOn()) { const a = t * 0.6 + hs.i * 1.9; TW2.gull(g, hs.cx + Math.cos(a) * hs.w * 0.6, hs.roofY - 20 + Math.sin(a * 2) * 5, t, hs.i); }
  }
};
