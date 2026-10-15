//#part 140_a_sprite_core_world_props.js
/* =====================================================================
   СПРАЙТИ ТА МАЛЮВАННЯ
   ===================================================================== */

const spriteCache = new Map();

// Перетворює спрайт-масив рядків на маленький canvas (кешується)
function getSpriteCanvas(name, variant) {
  const key = name + '|' + (variant || '');
  if (spriteCache.has(key)) return spriteCache.get(key);
  const spr = SPRITES[name];
  if (spr.canvas) { spriteCache.set(key, spr.canvas); return spr.canvas; }          // готовий малюнок (покупці)
  const over = (variant && spr.variants && spr.variants[variant]) || {};
  const rows = spr.rows;
  const w = rows[0].length, h = rows.length;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    if (row.length !== w) console.warn('Спрайт «' + name + '»: рядок ' + y + ' має довжину ' + row.length + ', а має бути ' + w);
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ' || ch === undefined) continue;
      const color = over[ch] || PALETTE[ch];
      if (!color) { console.warn('Спрайт «' + name + '»: невідомий колір «' + ch + '»'); continue; }
      g.fillStyle = color;
      g.fillRect(x, y, 1, 1);
    }
  });
  spriteCache.set(key, c);
  return c;
}

// Контур для звіряток: тіні-силуети, зсунуті на піксель у чотири боки, роблять спрайт чітким на будь-якому тлі
const OUTLINED = /^(team_|npc_(?!clock))/;
const outlineCache = new Map();
function getOutlinedCanvas(name, variant) {
  const key = name + '|' + (variant || '');
  if (outlineCache.has(key)) return outlineCache.get(key);
  const s = getSpriteCanvas(name, variant);
  const c = document.createElement('canvas');
  c.width = s.width + 2; c.height = s.height + 2;
  const g = c.getContext('2d');
  const sil = document.createElement('canvas');
  sil.width = s.width; sil.height = s.height;
  const sg = sil.getContext('2d');
  sg.drawImage(s, 0, 0);
  sg.globalCompositeOperation = 'source-in';
  sg.fillStyle = PALETTE.k;
  sg.fillRect(0, 0, s.width, s.height);
  [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(o => g.drawImage(sil, o[0], o[1]));
  g.drawImage(s, 1, 1);
  outlineCache.set(key, c);
  return c;
}

// Малює canvas із масштабуванням відносно нижнього центру.
// opts: flip (дзеркало), sx / sy (розтяг), alpha
function drawCanvasSprite(ctx, c, x, y, opts = {}) {
  const sx = opts.sx || 1, sy = opts.sy || 1;
  const w = c.width, h = c.height;
  const dw = Math.max(1, Math.round(w * sx));
  const dh = Math.max(1, Math.round(h * sy));
  const dx = Math.round(x + (w - dw) / 2);
  const dy = Math.round(y + (h - dh));
  if (opts.alpha !== undefined && opts.alpha < 1) ctx.globalAlpha = Math.max(0, opts.alpha);
  if (opts.flip) {
    ctx.save();
    ctx.translate(dx + dw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(c, 0, dy, dw, dh);
    ctx.restore();
  } else {
    ctx.drawImage(c, dx, dy, dw, dh);
  }
  ctx.globalAlpha = 1;
}

// Головна функція малювання спрайта за назвою (x, y — лівий верхній кут)
function drawSprite(ctx, name, x, y, opts = {}) {
  if (OUTLINED.test(name)) drawCanvasSprite(ctx, getOutlinedCanvas(name, opts.variant), x - 1, y - 1, opts);
  else drawCanvasSprite(ctx, getSpriteCanvas(name, opts.variant), x, y, opts);
}

// Допоміжні примітиви в кольорах палітри
function R(g, x, y, w, h, ch) {
  g.fillStyle = PALETTE[ch] || ch;
  g.fillRect(x, y, w, h);
}
function disc(g, cx, cy, r, ch) {
  g.fillStyle = PALETTE[ch];
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.round(Math.sqrt(r * r + 0.5 - dy * dy));
    g.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
  }
}
function hash2(x, y) { return (((x * 73856093) ^ (y * 19349663)) >>> 0); }
// Полотно: «ядро» сцени 320×180 завжди посередині, а на широкому екрані до нього додаються
// ще вулиця з боків (offX) і небо зверху (offY). Усе, що малюється в шарах, — у координатах «ядра».
const view = { offX: 0, offY: 0, extraB: 0, w: 320, h: 180 };
let glassRects = null;           // вікна магазину (для нічного світла)
let houseDoors = [];            // двері будиночків (центр по x, низ по y): сюди заходять покупці зі своїми пакетами
let houseGlass = null;           // вікна будинків на задньому плані
let houseLit = null;             // шар з освітленими вікнами будинків
let buildSeason = 'spring';      // для якої пори року зараз малюється земля
let lampXs = [];                 // де стоять ліхтарі
function worldL() { return -view.offX; }                    // лівий край світу (у координатах «ядра»)
function worldR() { return CONFIG.SCENE_W + view.offX; }    // правий край світу
function worldB() { return CONFIG.SCENE_H + view.extraB; }  // нижній край світу (бруківки)
function roadFloor() { return worldB() - (view.extraB >= 30 ? 40 : 8); }   // найнижче, куди заходять гуляти (нижче — дорога поштової машини)
function visL() { return viewCrop.x - view.offX; }          // лівий край того, що видно зараз
function visR() { return viewCrop.x + viewCrop.w - view.offX; }
function pctX(x) { return (x + view.offX) / view.w * 100; } // координата сцени → відсотки ширини полотна
function pctY(y) { return (y + view.offY) / view.h * 100; }

function newLayer() {
  const c = document.createElement('canvas');
  c.width = view.w; c.height = view.h;
  const g = c.getContext('2d');
  g.translate(view.offX, view.offY);
  return { c, g };
}

/* ---------- Небо (статичний шар; сонце, місяць і зорі малюються окремо, див. «День і ніч») ---------- */
function buildSkyLayer() {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.buildSky) return A.buildSky(); }
  const { c, g } = newLayer();
  const x0 = -view.offX, W = view.w, top = -view.offY, hor = LAYOUT.horizonY + 10;
  const [c1, c2, c3] = currentEpoch().sky;      // три кольори неба залежать від епохи
  const hx = k => { const h = PALETTE[k]; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  const A = hx(c1), B = hx(c2), C = hx(c3), mix = (p, q, t) => p.map((v, i) => Math.round(v + (q[i] - v) * t));
  const col = u => { const lvl = Math.floor(u * 5) / 5; return u < 1 ? mix(A, B, lvl) : mix(B, C, Math.floor((u - 1) * 5) / 5); };
  const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const rows = hor - top, wpx = view.w, img = g.createImageData(wpx, Math.max(1, rows)), px = img.data;       // пікселі пишемо напряму (fillRect на піксель займав ~300 мс при подорожі)
  for (let y = top; y < hor; y++) {
    const f = (y - top) / rows, u = f < 0.45 ? f / 0.45 : 1 + Math.pow((f - 0.45) / 0.55, 0.9), step = 1 / 5, fr = ((u < 1 ? u : u - 1) / step) % 1;
    const c0 = col(u), c1b = col(Math.min(2, u + step * (u < 1 ? 1 : 1)));
    let o = (y - top) * wpx * 4;
    for (let xi = 0; xi < wpx; xi++, o += 4) {
      const th = bayer[(y & 3)][xi & 3] / 16, cc = fr > th ? c1b : c0;
      px[o] = cc[0]; px[o + 1] = cc[1]; px[o + 2] = cc[2]; px[o + 3] = 255;
    }
  }
  g.putImageData(img, x0 + view.offX, top + view.offY);
  // тепле сяйво біля обрію
  for (let k = 0; k < 14; k++) { g.globalAlpha = 0.012 * (14 - k) * 2; R(g, x0, hor - 28 + k * 2, W, 2, 'W'); }
  g.globalAlpha = 1;
  return c;
}

/* ---------- Будиночок на задньому плані (великий, з віконницями, дверима та димарем) ---------- */
function nearLamp(x0, x1, lamps) {          // чи заходить відрізок [x0, x1] на ліхтар (стовп + плафон)
  return lamps.some(lx => x1 >= lx - 6 && x0 <= lx + 8);
}
// Предмети на даху: антени, тарілки, флюгери, труби, голуби, прапорці, білизна, сонячні панелі, дзеркальна кулька, неонова вивіска, купол телескопа, кіт
const ROOF_PREF = { renaissance: [2, 5, 4, 2], retro: [0, 0, 6, 4], disco: [5, 0, 8, 4], arcade: [0, 9, 1, 4], internet: [1, 1, 0, 0], eco: [7, 4, 6, 7], space: [1, 10, 0, 1], neon: [11, 0, 5, 1] };       // труб (3) майже нема: сірі стовпчики на дахах набридали
function drawRoofThing(g, k, px, by, hs, i) {
  const cols = ['r', 'p', 'T', 'y', 'o', 'f'], c = cols[(hs >>> (i * 3)) % cols.length];
  switch (k) {
    case 0: R(g, px, by - 10, 1, 10, 'd'); R(g, px - 4, by - 9, 9, 1, 'd'); R(g, px - 3, by - 7, 7, 1, 'd'); R(g, px - 2, by - 5, 5, 1, 'd'); break;
    case 1: R(g, px, by - 5, 1, 5, 'd'); disc(g, px, by - 8, 3, 'd'); disc(g, px, by - 8, 2, 'w'); R(g, px + 2, by - 11, 1, 4, 'd'); R(g, px + 1, by - 11, 3, 1, 'r'); break;
    case 2: R(g, px, by - 11, 1, 11, 'd'); R(g, px - 4, by - 8, 9, 1, 'd'); R(g, px + 4, by - 9, 2, 3, 'r'); R(g, px - 5, by - 9, 2, 3, 'r'); R(g, px - 1, by - 12, 3, 2, 'h'); break;
    case 3: R(g, px - 1, by - 7, 3, 7, 'e'); R(g, px - 2, by - 8, 5, 1, 'd'); R(g, px + 1, by - 7, 1, 7, 'E'); break;                       // одна невисока труба
    case 4: R(g, px - 4, by - 3, 4, 2, 'e'); R(g, px - 5, by - 4, 2, 2, 'e'); R(g, px - 6, by - 4, 1, 1, 'o'); R(g, px - 4, by - 1, 1, 1, 'd'); R(g, px - 2, by - 1, 1, 1, 'd');
            R(g, px + 2, by - 3, 4, 2, 'w'); R(g, px + 5, by - 4, 2, 2, 'w'); R(g, px + 7, by - 4, 1, 1, 'o'); R(g, px + 3, by - 1, 1, 1, 'd'); R(g, px + 5, by - 1, 1, 1, 'd'); break;
    case 5: R(g, px, by - 12, 1, 12, 'd'); R(g, px + 1, by - 12, 7, 2, c); R(g, px + 1, by - 10, 5, 2, c); R(g, px + 1, by - 8, 3, 1, c); break;
    case 6: R(g, px - 8, by - 8, 1, 8, 'd'); R(g, px + 8, by - 8, 1, 8, 'd'); R(g, px - 8, by - 8, 17, 1, 'e'); R(g, px - 6, by - 7, 3, 4, 'w'); R(g, px - 1, by - 7, 3, 5, 'r'); R(g, px + 4, by - 7, 3, 3, 'n'); break;
    case 7: for (let q = 0; q < 2; q++) { R(g, px - 8 + q * 9, by - 4, 8, 4, 'n'); R(g, px - 8 + q * 9, by - 4, 8, 1, 'S'); R(g, px - 5 + q * 9, by - 4, 1, 4, 'd'); R(g, px - 8 + q * 9, by - 4, 1, 4, 'd'); } break;
    case 8: R(g, px, by - 7, 1, 3, 'd'); disc(g, px, by - 10, 4, 'd'); disc(g, px, by - 10, 3, 'S'); R(g, px - 1, by - 11, 1, 1, 'w'); R(g, px + 1, by - 9, 1, 1, 'y'); R(g, px - 2, by - 9, 1, 1, 'f'); break;
    case 9: R(g, px, by - 5, 1, 5, 'd'); ['.#...#.', '..###..', '.##.##.', '#######', '#.###.#'].forEach((row, ry) => { for (let rx = 0; rx < 7; rx++) if (row[rx] === '#') R(g, px - 3 + rx, by - 11 + ry, 1, 1, 'T'); }); break;
    case 10: R(g, px - 4, by - 3, 9, 3, 'e'); R(g, px - 3, by - 5, 7, 2, 'w'); R(g, px - 2, by - 6, 5, 1, 'w'); R(g, px, by - 6, 1, 4, 'k'); R(g, px - 4, by - 3, 9, 1, 'E'); break;
    case 11: R(g, px, by - 9, 3, 9, 'k'); R(g, px, by - 9, 1, 9, 'f'); R(g, px + 2, by - 9, 1, 9, 'T'); R(g, px + 1, by - 7, 1, 2, 'y'); R(g, px + 1, by - 3, 1, 2, 'y'); break;
    case 12: R(g, px - 2, by - 4, 5, 4, 'k'); R(g, px - 3, by - 6, 3, 3, 'k'); R(g, px - 3, by - 7, 1, 1, 'k'); R(g, px - 1, by - 7, 1, 1, 'k'); R(g, px + 3, by - 3, 3, 1, 'k'); R(g, px - 2, by - 5, 1, 1, 'y'); break;
  }
}
function houseRoofExtras(g, spec, top, rh, flat, hs) {
  const { x, w } = spec, by = flat ? top - 5 : top - rh, pref = ROOF_PREF[currentEpoch().id] || [0, 3, 4, 5];
  const xs = [x + Math.round(w * 0.24), x + Math.round(w * 0.5), x + Math.round(w * 0.76)];
  let chim = !flat && hs % 3 === 0 && w >= 40;                    // на даху вже є цегляний димар — сірих труб не додаємо
  xs.forEach((px, i) => {
    if (!flat && hs % 3 === 0 && w >= 40 && Math.abs(px - (x + w - 12)) < 11) return;       // тут димар
    if (flat && hs % 3 === 0 && Math.abs(px - (x + w - 12)) < 9) return;                       // тут антена
    if (flat && hs % 3 === 1 && Math.abs(px - (x + 10)) < 11) return;                          // тут кондиціонер
    if ((hs >>> (i * 4 + 1)) % 5 === 0) return;                                                // не на кожному будинку все й одразу
    const roll = (hs >>> (i * 5)) % 10;
    let k = roll < 7 ? pref[(hs >>> (i * 3 + 2)) % pref.length] : [0, 3, 4, 5, 6, 12][(hs >>> (i * 2 + 7)) % 6];
    if (k === 3) { if (chim || hs % 2) k = 4; else chim = true; }                          // сіра труба: не більше однієї на дах, і не на кожному
    drawRoofThing(g, k, px, by, hs, i);
  });
  if ((hs >>> 5) % 3 === 0) for (let lx = x + 4; lx < x + w - 2; lx += 5) R(g, lx, top - 1, 1, 1, ['y', 'r', 'T', 'p'][((lx - x) / 5 | 0) % 4]);      // гірлянда вздовж карниза
}
function shopRoofExtras(g, es, w, top, level) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.noRoofExtras) return; }
  const seed = hash2(level * 31 + (es.fx ? es.fx.length : 0), 7), by = top + 4, pref = ROOF_PREF[currentEpoch().id] || [0, 3, 4, 5];
  const ks = lastRoofSign, kl = ks ? ks.x - 20 : w * 0.3, kr = ks ? ks.x + ks.w + 20 : w * 0.68;
  [Math.max(12, Math.min(Math.round(w * 0.3), kl)), Math.min(w - 14, Math.max(Math.round(w * 0.68), kr))].forEach((px, i) => {
    let k = (seed >>> (i * 4)) % 4 === 0 ? 4 : pref[(seed >>> (i * 3 + 1)) % pref.length];
    if (k === 3) k = 5;                                                              // на даху магазину сірих труб нема
    drawRoofThing(g, k === 7 ? 7 : k, px, by, seed, i);
  });
  for (let x = 10; x < w - 10; x += 5) R(g, x, top + 5, 1, 1, ['y', 'r', 'p', 'T'][((x / 5) | 0) % 4]);                                       // гірлянда вздовж карниза
}
// Кольори будинків: кожен будинок свого відтінку (золотий кут не повторюється), а насиченість і яскравість задає епоха
const HOUSE_TONE = [[0.42, 0.66, 20], [0.5, 0.7, 30], [0.72, 0.64, 300], [0.66, 0.6, 180], [0.4, 0.72, 210], [0.45, 0.62, 100], [0.4, 0.56, 250], [0.82, 0.56, 320]];
function hslHex(h, sat, l) {
  h = ((h % 360) + 360) % 360 / 360;
  const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat, p = 2 * l - q, ch = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return '#' + [ch(h + 1 / 3), ch(h), ch(h - 1 / 3)].map(v => ('0' + Math.round(v * 255).toString(16)).slice(-2)).join('');
}
// п'ять кольорів стін по колу (на кожну епоху свої відтінки), дахи — парні до стін
function houseColors(i) {
  const tone = HOUSE_TONE[viewEpoch() % EPOCHS.length] || HOUSE_TONE[0], k = ((i % 5) + 5) % 5, hue = tone[2] + k * 72;
  return { wall: hslHex(hue, tone[0], tone[1]), roof: hslHex(hue + 170 + (k % 2) * 25, tone[0] * 0.8, 0.38) };
}
const HOUSE_COL_W = 4;         // ширина кутової пілястри з кожного боку будинку (px сцени): сусідні будинки не зливаються в одну стіну
function houseEdges(g, spec) {     // пілястра по боках будинку: чіткий контур, світла грань зліва, тіньова справа; колір береться зі стіни самого будинку
  const x = spec.x, w = spec.w, base = LAYOUT.horizonY, top = base - spec.h + 4, hh = base - top, CW = HOUSE_COL_W;
  if (hh < 14 || w < CW * 2 + 6) return;
  const R_ = [], G_ = [], B_ = [];                                                       // колір стіни: медіана двох колонок поруч із пілястрами (вивіски й вікна далі від краю)
  try {
    [x + CW, x + w - CW - 1].forEach(cx => {
      const d = g.getImageData(cx, top + 6, 1, Math.min(34, hh - 8)).data;
      for (let i = 0; i + 3 < d.length; i += 4) if (d[i + 3] > 200) { R_.push(d[i]); G_.push(d[i + 1]); B_.push(d[i + 2]); }
    });
  } catch (e) { }
  const med = arr => arr.length ? arr.sort((p, q) => p - q)[arr.length >> 1] : 128;
  const r = med(R_), gg = med(G_), b = med(B_), n = 1;
  const hex = AR.hex([r / n, gg / n, b / n]), lum = (r * 0.3 + gg * 0.59 + b * 0.11) / n;
  const t = Math.max(0, Math.min(1, (lum - 60) / 120)), k = 0.38 - 0.5 * t;           // темні стіни — світла пілястра, світлі — трохи темніша
  const body = k >= 0 ? AR.mix(hex, '#ffffff', k) : AR.mix(hex, '#000000', -k);
  const hi = AR.mix(hex, '#ffffff', 0.62), sh = AR.mix(body, '#0a0614', 0.5), line = AR.mix(body, '#0a0614', 0.32), OUT = '#1c1428';
  const col = (xx, y0, cols) => cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(xx + i, y0, 1, hh); });
  col(x, top, [OUT, hi, body, line]);                                                   // ліва: контур, світла грань, тіло, внутрішня лінія
  col(x + w - CW, top, [line, body, sh, OUT]);                                          // права: внутрішня лінія, тіло, тінь, контур
  [x, x + w - CW].forEach(xx => {                                                       // капітель і основа: пілястра читається окремою колоною
    g.fillStyle = OUT; g.fillRect(xx, top, CW, 1); g.fillRect(xx, base - 1, CW, 1);
    g.fillStyle = hi; g.fillRect(xx + 1, top + 1, CW - 2, 1);
  });
}
function drawHouse(g, spec, lamps) {
  const arch = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null;
  if (arch && arch.house) { arch.house(g, spec, lamps); houseEdges(g, spec); return; }
  const { x, w, h, wall, roof } = spec;
  const base = LAYOUT.horizonY, top = base - h;
  const hs = hash2(x + 17, h);
  lamps = lamps || [];
  // стіни з контуром, тінню праворуч і фактурою
  R(g, x, top, w, h, wall);
  R(g, x, top, w, 1, 'd'); R(g, x, top, 1, h, 'd'); R(g, x + w - 1, top, 1, h, 'd');
  g.globalAlpha = 0.14; R(g, x + w - 7, top + 1, 6, h - 1, 'd'); g.globalAlpha = 1;
  g.globalAlpha = 0.1; for (let y = top + 7; y < base; y += 6) R(g, x + 1, y, w - 2, 1, 'd'); g.globalAlpha = 1;
  g.globalAlpha = 0.45; for (let y = top + 4; y < base - 3; y += 6) { R(g, x + 1, y, 3, 3, 'w'); R(g, x + w - 4, y, 3, 3, 'w'); } g.globalAlpha = 1;   // кутові камені
  // дах: широка трапеція зі звисом, черепицею й контуром
  const rh = 11;
  const flat = currentEpoch().roofStyle === 'flat';
  if (flat) {                                // сучасний плаский дах: плита, антена, кондиціонер або сонячні панелі
    R(g, x - 2, top - 5, w + 4, 5, roof); R(g, x - 2, top - 5, w + 4, 1, 'l'); R(g, x - 2, top - 5, 1, 5, 'd'); R(g, x + w + 1, top - 5, 1, 5, 'd'); R(g, x - 2, top - 1, w + 4, 1, 'd');
    if (hs % 3 === 0) { R(g, x + w - 12, top - 14, 1, 9, 'd'); R(g, x + w - 14, top - 12, 5, 1, 'd'); R(g, x + w - 14, top - 9, 5, 1, 'd'); }
    else if (hs % 3 === 1) { R(g, x + 6, top - 9, 9, 4, 'd'); R(g, x + 7, top - 8, 7, 2, 'E'); R(g, x + 8, top - 8, 5, 1, 'w'); }
    else { for (let k = 0; k < 3; k++) { R(g, x + 6 + k * 9, top - 8, 8, 3, 'n'); R(g, x + 7 + k * 9, top - 7, 6, 1, 'S'); } }
    if (buildSeason === 'winter') R(g, x - 2, top - 6, w + 4, 2, 'w');
  }
  for (let i = 0; !flat && i < rh; i++) {
    const inset = rh - 1 - i, lx = x - 4 + inset, rw = w + 8 - 2 * inset, ry = top - rh + i;
    R(g, lx, ry, rw, 1, roof);
    R(g, lx, ry, 1, 1, 'd'); R(g, lx + rw - 1, ry, 1, 1, 'd');
    if (i % 2) { g.globalAlpha = 0.18; R(g, lx + 1, ry, rw - 2, 1, 'd'); g.globalAlpha = 1; for (let k = lx + 2 + (i % 4 ? 0 : 2); k < lx + rw - 2; k += 4) R(g, k, ry, 1, 1, 'd'); }
  }
  if (!flat) R(g, x - 4 + rh - 1, top - rh, w + 8 - 2 * (rh - 1), 1, 'd');           // коник
  R(g, x - 4, top - 1, w + 8, 1, 'd'); g.globalAlpha = 0.3; R(g, x - 4, top, w + 8, 2, 'd'); g.globalAlpha = 1;   // край даху й тінь під ним
  if (!flat && hs % 3 === 0 && w >= 40) {              // димар
    const cx = x + w - 15;
    R(g, cx, top - rh - 6, 7, 9, 'b'); R(g, cx, top - rh - 6, 7, 1, 'd'); R(g, cx, top - rh - 6, 1, 9, 'd'); R(g, cx + 6, top - rh - 6, 1, 9, 'd'); R(g, cx - 1, top - rh - 7, 9, 2, 'd');
  }
  if (buildSeason === 'winter' && !flat) {            // зимою дах вкритий товстим снігом: шапка, звиси над краєм і бурульки
    for (let i = 0; i < rh - 1; i++) { const inset = rh - 1 - i, lx = x - 4 + inset, rw = w + 8 - 2 * inset, ry = top - rh + i; R(g, lx + 1, ry, rw - 2, 1, i < 3 ? '#ffffff' : i < 7 ? '#f1f7ff' : '#d9e7f8'); if (i > 3 && i % 2) { g.globalAlpha = 0.35; R(g, lx + 1, ry, rw - 2, 1, '#a9bddb'); g.globalAlpha = 1; } }
    for (let k = x - 4; k < x + w + 4; k += 3) { const hang = 1 + hash2(k, x) % 3; R(g, k, top - 1, 3, hang, '#f1f7ff'); R(g, k, top - 1 + hang, 3, 1, '#c3d6ee'); }
    for (let k = x - 2; k < x + w + 2; k += 6 + hash2(k, 5) % 4) { const il = 2 + hash2(k, x + 3) % 4; R(g, k, top + 1, 1, il, '#dff1ff'); R(g, k, top + il, 1, 1, '#ffffff'); }
  } else if (buildSeason === 'winter' && flat) {
    R(g, x - 3, top - 9, w + 6, 4, '#ffffff'); R(g, x - 3, top - 6, w + 6, 2, '#d9e7f8'); for (let k = x - 2; k < x + w + 2; k += 4) R(g, k, top - 5, 3, 1 + hash2(k, x) % 2, '#f1f7ff');
  }
  houseRoofExtras(g, spec, top, rh, flat, hs);
  // поверхи: нижній — з дверима, решта — тільки вікна
  const floors = Math.max(1, Math.floor((h - 6) / 19));
  const doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4);
  let doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
  const doorLeft = doorOk ? doorX : -9999;
  for (let f = 0; f < floors; f++) {
    const y0 = base - 6 - (floors - f) * 19 + 3;
    const cols = Math.max(1, Math.floor((w - 4) / 17));
    const space = (w - 4) / cols;
    for (let c = 0; c < cols; c++) {
      const wx = Math.round(x + 2 + c * space + (space - 8) / 2), wy = y0;
      if (f === floors - 1 && wx + 9 >= doorLeft - 2 && wx <= doorLeft + doorW + 2) continue;      // тут двері
      houseWindowG(g, wx, wy, hash2(wx * 3 + c, wy * 7 + f), ((c + f + x) % 4 === 0), hs % 2 === 1);
      if (houseGlass) houseGlass.push([wx + 1, wy + 1, 6, 9]);
    }
  }
  if (doorOk) {                              // двері з козирком і сходинкою
    houseDoors.push({ x: doorX + 5, y: base });
    R(g, doorX, base - 15, doorW, 15, 'd'); R(g, doorX + 1, base - 14, doorW - 2, 14, 'b');
    R(g, doorX + 2, base - 12, 3, 5, 'l'); R(g, doorX + 5, base - 12, 3, 5, 'l'); R(g, doorX + 2, base - 6, 6, 5, 'l'); R(g, doorX + doorW - 3, base - 7, 1, 1, 'h');
    const aw = ['r', 'n', 'g', 'u'][(hs >>> 2) % 4];
    R(g, doorX - 2, base - 19, doorW + 4, 3, aw); for (let k = doorX - 2; k < doorX + doorW + 2; k += 3) R(g, k, base - 19, 1, 3, 'w');
    R(g, doorX - 2, base - 16, doorW + 4, 1, 'd');
    R(g, doorX - 1, base - 1, doorW + 2, 1, 'E');
  }
  epochHouseDeco(g, spec, top, base, floors, hs, doorOk ? doorX : -9999);
}
// Вікно будинку 8×11: кам'яна перемичка, рама, скло зі світлим відблиском і градієнтом, завіски, фрамуга, підвіконня зі сніжком чи квітами, інколи віконниці й квітник
function houseWindowG(g, wx, wy, h, warm, shutters) {
  const frame = '#4a3228', glassTop = warm ? '#ffe9a0' : '#bfe3f2', glassMid = warm ? '#ffd45c' : '#8ec4de', glassBot = warm ? '#f0a840' : '#5f95b8';
  if (shutters) {                                                    // віконниці з планками
    [wx - 3, wx + 9].forEach(sx => { R(g, sx, wy, 2, 11, '#7a4f35'); R(g, sx, wy, 2, 1, frame); R(g, sx, wy + 10, 2, 1, frame); for (let k = 2; k < 10; k += 2) R(g, sx, wy + k, 2, 1, '#5a3b2e'); R(g, sx, wy + 1, 1, 9, '#946444'); });
  }
  R(g, wx - 1, wy - 2, 10, 1, '#d8cdb6'); R(g, wx - 1, wy - 1, 10, 1, '#a89c86'); R(g, wx + 3, wy - 3, 2, 1, '#d8cdb6');   // перемичка з замковим каменем
  R(g, wx, wy, 8, 11, frame);
  R(g, wx + 1, wy + 1, 6, 3, glassTop); R(g, wx + 1, wy + 4, 6, 3, glassMid); R(g, wx + 1, wy + 7, 6, 3, glassBot);
  if (!warm) { R(g, wx + 1, wy + 1, 2, 1, '#ffffff'); R(g, wx + 2, wy + 2, 1, 1, '#ffffff'); R(g, wx + 5, wy + 5, 1, 1, '#d8f0ff'); R(g, wx + 6, wy + 4, 1, 1, '#d8f0ff'); }      // відблиск неба на склі
  const cur = ['#c4553d', '#e8b44a', '#5f9fc9', '#ef8fa3', '#8ed4a6'][h % 5];                      // завіска
  if (h % 3 !== 0) { R(g, wx + 1, wy + 1, 2, 5, cur); R(g, wx + 6, wy + 1, 1, 5, cur); R(g, wx + 1, wy + 1, 1, 1, '#ffffff'); }
  else if (h % 2 === 0) { R(g, wx + 5, wy + 7, 2, 2, '#6f9a5a'); R(g, wx + 5, wy + 6, 1, 1, '#ef8fa3'); R(g, wx + 6, wy + 7, 1, 1, '#e8b44a'); }   // кімнатна квітка
  R(g, wx + 4, wy + 1, 1, 9, frame); R(g, wx + 1, wy + 4, 6, 1, frame);                           // перехрестя рами
  R(g, wx - 1, wy + 11, 10, 2, '#c8bda6'); R(g, wx - 1, wy + 13, 10, 1, '#8a7f6a');                  // кам'яне підвіконня з тінню
  if (buildSeason === 'winter') { R(g, wx - 1, wy + 10, 10, 2, '#ffffff'); R(g, wx, wy + 9, 3, 1, '#eaf3ff'); R(g, wx + 6, wy + 9, 2, 1, '#eaf3ff'); }
  else if (buildSeason === 'spring' || buildSeason === 'summer' || h % 4 === 0) {                 // квітник під вікном
    const fc = buildSeason === 'summer' ? ['#e8353a', '#ffd84f', '#ff8fd0'] : ['#ef8fa3', '#ffd9e2', '#fff'];
    R(g, wx - 1, wy + 13, 10, 2, '#7a4f35'); R(g, wx - 1, wy + 13, 10, 1, '#946444');
    for (let k = 0; k < 5; k++) { R(g, wx + k * 2 - 1 + (k % 2), wy + 11, 2, 2, '#4f9a63'); R(g, wx + k * 2 - 1 + (k % 2), wy + 11 + (k % 2), 1, 1, fc[k % 3]); }
  }
}
// Деталі будиночків на фоні під епоху: балки, лампочки, неон, ліани, труби, антени
function epochHouseDeco(g, spec, top, base, floors, hs, doorX) {
  const { x, w, h } = spec, fx = currentEpoch().id;
  switch (fx) {
    case 'renaissance':
      g.globalAlpha = 0.8; R(g, x + 1, top + 1, 2, h - 1, 'b'); R(g, x + w - 3, top + 1, 2, h - 1, 'b');
      for (let f = 1; f < floors; f++) R(g, x + 1, base - 6 - f * 19 + 1, w - 2, 1, 'b');
      g.globalAlpha = 1; if (doorX > 0) { R(g, doorX + 12, base - 13, 1, 3, 'd'); R(g, doorX + 12, base - 10, 5, 4, 'd'); R(g, doorX + 13, base - 9, 3, 2, 'h'); } break;
    case 'retro':
      if (doorX > 0) { R(g, doorX - 4, base - 12, 3, 5, 'd'); R(g, doorX - 3, base - 11, 1, 3, 'f'); }
      for (let k = x + 3; k < x + w - 3; k += 6) R(g, k, top + 3, 3, 1, (k >> 1) % 2 ? 'q' : 'w'); break;
    case 'disco':
      for (let k = x + 2; k < x + w - 2; k += 4) R(g, k, top - 1, 2, 2, ((k >> 2) + hs) % 3 === 0 ? 'f' : ((k >> 2) + hs) % 3 === 1 ? 'y' : 'T'); break;
    case 'arcade':
      R(g, x + 1, top + 2, w - 2, 1, 'T'); R(g, x + 1, top + 4, w - 2, 1, 'f'); break;
    case 'internet':
      if (hs % 2) { for (let a = -4; a <= 4; a++) { const hh = Math.round(Math.sqrt(16 - a * a) * 0.8); R(g, x + w - 8 + a, top + 8 - hh, 1, hh + 1, 'E'); } R(g, x + w - 8, top + 4, 1, 6, 'd'); }
      else { R(g, x + 4, top + 5, 7, 4, 'd'); R(g, x + 5, top + 6, 5, 2, 'E'); } break;
    case 'eco':
      R(g, x + 1, top + 2, 1, Math.min(h - 12, 30), 'G'); for (let k = 0; k < 6; k++) { R(g, x + 2, top + 4 + k * 5, 2, 2, k % 2 ? 'g' : 'm'); } R(g, x + w - 5, top - 2, 4, 3, 'b'); R(g, x + w - 5, top - 4, 4, 2, 'g'); R(g, x + w - 4, top - 5, 1, 1, 'p'); break;
    case 'space':
      R(g, x + 2, top + 2, 1, h - 10, 'e'); R(g, x + w - 3, top + 2, 1, h - 10, 'e'); R(g, x + (w >> 1), top - 16, 1, 10, 'd'); R(g, x + (w >> 1), top - 17, 1, 1, 'r'); break;
    case 'neon':
      R(g, x + w - 4, top + 3, 1, h - 10, hs % 2 ? 'f' : 'T'); R(g, x + 3, top + 3, 1, h - 10, hs % 2 ? 'T' : 'f'); R(g, x + 1, top + 1, w - 2, 1, 'f'); break;
  }
}

/* ---------- Лавочки: на них сидять звірятка ---------- */
const benches = [];              // { x, y, slots: [{ dx, who }] } — who: номер звірятка або null
function seedBenches() {
  benches.length = 0;
  const lamps = lampPositions();
  const x0 = -view.offX, x1 = CONFIG.SCENE_W + view.offX;
  const free = x => x > x0 + 22 && x < x1 - 22 && !lamps.some(lx => Math.abs(x - lx) < 20) &&
    !(shop && x > shop.x - 14 && x < shop.x + shop.w + 14) && benches.every(b => Math.abs(b.x - x) > 46);
  const add = (x, y) => benches.push({ x, y: y || LAYOUT.streetTop, slots: [{ dx: -10, who: null }, { dx: 10, who: null }] });
  // одна лавка на пару дерев: стоїть між двома деревами поряд; біля одинокого дерева — збоку від нього
  const trees = treeSpots(x0, view.w).sort((p, q) => p.x - q.x), groups = [];
  trees.forEach(tr => { const g = groups[groups.length - 1]; if (g && tr.x - g[g.length - 1].x < 110) g.push(tr); else groups.push([tr]); });
  groups.forEach(g => {
    const first = g[0].x, last = g[g.length - 1].x, mid = Math.round((first + last) / 2);
    const cands = g.length > 1 ? [0, 6, -6, 12, -12, 18, -18, 24, -24].map(d => mid + d).filter(c => c > first - 4 && c < last + 4) : [26, -26, 32, -32].map(d => first + d);
    const spot = cands.find(free); if (spot !== undefined) add(Math.round(spot));
  });
  if (!benches.length) [0.3, 0.7, 0.2, 0.8, 0.5].some(f => { const bx = Math.round(x0 + view.w * f); if (free(bx)) { add(bx); return true; } return false; });      // дерев нема — хоч одна лавка
  // біля кожної лавки — одна урна: збоку, де вільно від ліхтаря, магазину й краю
  benches.forEach(b => {
    b.binX = null;
    [21, -21, 25, -25].some(off => {
      const bx = b.x + off;
      if (bx < x0 + 6 || bx > x1 - 6 || lamps.some(lx => Math.abs(bx - lx - 1) < 8) || (shop && bx > shop.x - 10 && bx < shop.x + shop.w + 10) || benches.some(o => o !== b && Math.abs(o.x - bx) < 22)) return false;
      b.binX = bx; return true;
    });
  });

  actors.forEach(a => { if (a.mode === 'toBench' || a.mode === 'sit') { a.mode = 'idle'; a.wait = 1; a.bench = null; if (a.y < LAYOUT.streetTop + 6) a.y = LAYOUT.streetTop + 8; } });
}
const BENCH_PAL = { renaissance: ['E', 'w', 'e'], retro: ['p', 'q', 'f'], disco: ['P', 'f', 'u'], arcade: ['v', 'T', 'V'], internet: ['e', 'E', 'n'], eco: ['b', 'g', 'G'], space: ['E', 'S', 'n'], neon: ['k', 'T', 'f'] };
function benchColors() { return BENCH_PAL[currentEpoch().id] || ['b', 'l', 'c']; }
function drawBenchBack(b) {        // спинка й сидіння (малюється ПЕРЕД тим, хто сидить)
  const x = b.x, y = b.y, [bb, bl, bc] = benchColors();
  R(ctx, x - 16, y - 18, 32, 2, bb); R(ctx, x - 16, y - 18, 32, 1, bl); R(ctx, x - 16, y - 14, 32, 2, bb);
  R(ctx, x - 16, y - 19, 2, 12, 'd'); R(ctx, x + 14, y - 19, 2, 12, 'd');
  R(ctx, x - 16, y - 9, 32, 2, bl); R(ctx, x - 16, y - 9, 32, 1, bc);
  if (currentEpoch().id === 'neon') { R(ctx, x - 14, y - 16, 28, 1, 'f'); R(ctx, x - 14, y - 8, 28, 1, 'T'); }
}
function drawBenchFront(b) {       // передня планка й ніжки (малюється ПІСЛЯ того, хто сидить — ніби він сидить на лавці)
  const x = b.x, y = b.y;
  ctx.globalAlpha = 0.22; R(ctx, x - 17, y, 34, 2, 'd'); ctx.globalAlpha = 0.12; R(ctx, x - 14, y + 2, 28, 1, 'd'); ctx.globalAlpha = 1;
  const [fb, fl] = benchColors();
  R(ctx, x - 16, y - 7, 32, 3, fb); R(ctx, x - 16, y - 7, 32, 1, fl); R(ctx, x - 16, y - 5, 32, 1, 'd');
  R(ctx, x - 15, y - 4, 3, 4, 'd'); R(ctx, x + 12, y - 4, 3, 4, 'd');
}

function drawBin(b) {              // урна біля лавки: колір тримається епохи лавки
  if (b.binX === null || b.binX === undefined) return;
  const x = Math.round(b.binX) - 4, y = b.y + 1, [bb, bl] = benchColors();
  ctx.globalAlpha = 0.2; R(ctx, x - 1, y, 10, 2, 'd'); ctx.globalAlpha = 1;
  R(ctx, x, y - 10, 8, 10, 'd'); R(ctx, x + 1, y - 9, 6, 8, bb); R(ctx, x + 1, y - 9, 1, 8, bl); R(ctx, x + 6, y - 9, 1, 8, 'd');
  R(ctx, x - 1, y - 11, 10, 2, 'd'); R(ctx, x, y - 11, 8, 1, bl);                          // кришка
  R(ctx, x + 2, y - 7, 4, 1, 'd'); R(ctx, x + 2, y - 5, 4, 1, 'd'); R(ctx, x + 2, y - 3, 4, 1, 'd');       // прорізи
}

/* ---------- Лампа, ящики, кущ ---------- */
// Де стоять ліхтарі: по одному з боків магазину й далі вздовж усієї вулиці
function lampPositions() {
  const sx = shop ? shop.x : 108, sw = shop ? shop.w : 104;
  const left = sx - 12, right = sx + sw + 12, step = right - left;        // однаковий крок між усіма ліхтарями
  const list = [left, right];
  for (let x = left - step; x > -view.offX - 24; x -= step) list.push(x);
  for (let x = right + step; x < CONFIG.SCENE_W + view.offX + 24; x += step) list.push(x);
  return list;
}
function drawLamp(g, x) {
  g.globalAlpha = 0.22; R(g, x - 6, 134, 14, 2, 'd'); g.globalAlpha = 0.12; R(g, x - 3, 136, 8, 1, 'd'); g.globalAlpha = 1;        // тінь біля основи ліхтаря
  R(g, x, 94, 2, 40, 'd');
  R(g, x - 2, 130, 6, 4, 'd');
  R(g, x - 4, 92, 10, 2, 'd');
  R(g, x - 3, 85, 8, 2, 'd');
  R(g, x - 3, 87, 8, 7, 'd');
  R(g, x - 2, 88, 6, 5, 'y');
  R(g, x - 1, 89, 2, 2, 'w');
}
function drawCrates(g, x) {
  R(g, x, 122, 16, 12, 'b');
  R(g, x, 122, 16, 1, 'l');
  R(g, x, 133, 16, 1, 'd');
  R(g, x, 122, 1, 12, 'd'); R(g, x + 15, 122, 1, 12, 'd');
  R(g, x, 127, 16, 1, 'd');
  R(g, x + 7, 122, 2, 12, 'd');
  R(g, x + 2, 119, 3, 3, 'r');
  R(g, x + 6, 118, 3, 4, 'o');
  R(g, x + 10, 119, 3, 3, 'g');
}
function drawBush(g, x, y) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.bush) return A.bush(g, x, y); }
  disc(g, x, y, 6, 'g');
  disc(g, x - 5, y + 2, 4, 'g');
  disc(g, x + 5, y + 2, 4, 'g');
  disc(g, x - 2, y - 2, 2, 'm');
  R(g, x + 3, y, 1, 1, 'p'); R(g, x - 5, y + 3, 1, 1, 'q');
}

/* ---------- Земля: пагорби, будинки, тротуар, бруківка (статичний шар) ---------- */
// Далекий обрій за будинками: силует міста епохи (вежі, хмарочоси, купола, неонові вежі)
function farSkyline(g, x0, W) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.farSkyline) return A.farSkyline(g, x0, W); }
  const ep = currentEpoch().id, base = 112, col = { renaissance: 'e', retro: 'S', disco: 'P', arcade: 'V', internet: 'n', eco: 'G', space: 'n', neon: 'V' }[ep] || 'e';
  g.globalAlpha = 0.5;
  for (let x = x0; x < x0 + W; ) {
    const hs = hash2(x + 31, 7), bw = 12 + hs % 14, bh = 14 + (hs >>> 4) % 28;
    switch (ep) {
      case 'renaissance': R(g, x, base - bh, bw, bh, col); R(g, x + (bw >> 1) - 1, base - bh - 8, 3, 8, col); for (let k = 0; k < bw; k += 3) R(g, x + k, base - bh - 2, 2, 2, col); break;
      case 'retro': R(g, x, base - bh / 2, bw, bh / 2, col); if (hs % 3 === 0) { R(g, x + 2, base - bh / 2 - 7, bw - 4, 7, col); R(g, x + 4, base - bh / 2 - 10, 2, 3, col); } break;
      case 'disco': R(g, x, base - bh, bw, bh, col); for (let yy = base - bh + 3; yy < base - 3; yy += 5) for (let k = 2; k < bw - 2; k += 4) R(g, x + k, yy, 2, 2, hash2(k + x, yy) % 3 ? col : 'y'); break;
      case 'arcade': for (let k = 0; k < bh; k++) R(g, x + Math.round(k * bw / (2 * bh)), base - k, Math.max(1, bw - Math.round(k * bw / bh)), 1, col); break;
      case 'internet': R(g, x, base - bh - 10, bw - 3, bh + 10, col); R(g, x + (bw >> 2), base - bh - 16, 1, 6, col); for (let yy = base - bh - 6; yy < base - 3; yy += 6) R(g, x + 2, yy, bw - 7, 2, 'a'); break;
      case 'eco': disc(g, x + (bw >> 1), base - 6, 9 + hs % 5, col); R(g, x + (bw >> 1), base - 3, 1, 3, 'd'); break;
      case 'space': for (let a = -bw; a <= bw; a++) { const hh = Math.round(Math.sqrt(Math.max(0, bw * bw - a * a)) * 0.9); R(g, x + bw + a, base - hh, 1, hh, col); } if (hs % 3 === 0) R(g, x + bw, base - bh - 10, 1, 10, col); break;
      case 'neon': R(g, x, base - bh - 14, bw - 4, bh + 14, col); for (let yy = base - bh - 10; yy < base - 3; yy += 5) R(g, x + 2, yy, bw - 8, 1, hash2(yy, x) % 2 ? 'f' : 'T'); break;
    }
    x += (ep === 'space' ? bw * 2 : bw) + 2 + hs % 6;
  }
  g.globalAlpha = 1;
}

// Бруківка: малює прямокутник [X0, X0+W) × [Y0, Y0+H) у світових координатах (каміння розташоване однаково при кожному перебудовуванні шару)
function cobbleExtra(g, X0, Y0, W, H, style) {                       // нові варіанти бруківки; true — намальовано
  const RH = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const ANCHOR = -2600;
  if (style === 'moss') {                                          // стародавні замшілі камені з травою в швах і квіточками
    RH(X0, Y0, W, H, '#4e5a48');
    for (let r = 0, y = Y0; y < Y0 + H; r++) {
      const h = 6 + (hash2(r, 5) % 3); let x = ANCHOR - (hash2(r, 9) % 8);
      while (x < X0 + W) {
        const w = 9 + (hash2(x + 7, r) % 7);
        if (x + w > X0) {
          const t = ['#9aa392', '#8f9a88', '#a3ab9a', '#869080'][hash2(x, r + 3) % 4];
          RH(x + 1, y + 1, w - 1, h - 1, t); RH(x + 1, y + 1, w - 1, 1, '#c0c8b4'); RH(x + 1, y + h - 1, w - 1, 1, '#667060'); RH(x + w - 1, y + 2, 1, h - 2, '#707a68');
          const k = hash2(x * 3, r * 7) % 7;
          if (k < 3) { RH(x + 1, y + 1, 3 + k, 2, '#5f8f4a'); RH(x + 2, y + 1, 2, 1, '#86bf62'); RH(x + w - 4, y + h - 2, 3, 2, '#4f7f3c'); }
          if (k === 3) { RH(x + 3, y + 2, 5, 2, '#6a9a54'); RH(x + 4, y + 2, 3, 1, '#9ad070'); }
          if (hash2(x, r * 11) % 17 === 0) { RH(x + 3, y - 1, 1, 2, '#3f6f34'); RH(x + 4, y - 2, 1, 1, '#ffe08a'); }
        }
        x += w;
      }
      y += h;
    }
    return true;
  }
  if (style === 'diamond') {                                     // діамантова дорога: кожна плитка — гранований самоцвіт (насичені діагональні грані, призматичні відтінки, зірочки)
    RH(X0, Y0, W, H, '#1c2766');
    const SETS = [['#243a8c', '#3f6fe0', '#86ccff', '#e8fbff'], ['#1f4f86', '#2f98d8', '#7fe8ff', '#f0ffff'], ['#3e2a8a', '#6f55e0', '#c3a4ff', '#f6ecff'], ['#1f3a7a', '#3d86e8', '#9fdcff', '#ffffff']];
    for (let r = 0, y = Y0; y < Y0 + H; r++, y += 6) for (let x = Math.floor((X0 - 12) / 12) * 12 + (r % 2) * 6 - 12; x < X0 + W; x += 12) {
      const hs = hash2(x, r), P = SETS[hs % 4], off = (hs >>> 3) % 8, fl = (hs >>> 7) & 1;
      for (let py = 0; py < 5; py++) for (let px = 0; px < 11; px++) {
        const v = ((fl ? 10 - px : px) + py * 2 + off) % 8;
        RH(x + 1 + px, y + 1 + py, 1, 1, P[[0, 1, 2, 3, 2, 1, 0, 1][v]]);
      }
      RH(x + 1, y + 1, 11, 1, '#d6f4ff'); RH(x + 1, y + 5, 11, 1, '#121a4c'); RH(x + 11, y + 2, 1, 4, '#16205a'); RH(x + 1, y + 2, 1, 3, '#a8dcff');
      if (hs % 5 === 0) { RH(x + 5, y + 3, 1, 1, '#ffffff'); RH(x + 4, y + 3, 1, 1, '#8ff0ff'); RH(x + 6, y + 3, 1, 1, '#8ff0ff'); RH(x + 5, y + 2, 1, 1, '#8ff0ff'); RH(x + 5, y + 4, 1, 1, '#8ff0ff'); }
    }
    return true;
  }
  if (style === 'gold') {                                        // золота цегляна дорога
    RH(X0, Y0, W, H, '#9a6a1e');
    for (let r = 0, y = Y0; y < Y0 + H; r++, y += 6) for (let x = Math.floor((X0 - 12) / 12) * 12 + (r % 2) * 6 - 12; x < X0 + W; x += 12) {
      const t = ['#f4c84a', '#ecbc38', '#ffd966', '#e3b030'][hash2(x, r) % 4];
      RH(x + 1, y + 1, 11, 5, t); RH(x + 1, y + 1, 11, 1, '#fff0a0'); RH(x + 1, y + 5, 11, 1, '#b8841c'); RH(x + 11, y + 2, 1, 4, '#c8941e');
      if (hash2(x + 5, r) % 7 === 0) { RH(x + 3, y + 2, 1, 1, '#ffffff'); RH(x + 2, y + 3, 3, 1, '#fff6c0'); }
    }
    return true;
  }
  return false;
}
