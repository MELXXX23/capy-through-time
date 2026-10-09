//#part 140_sprites.js
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
  const { c, g } = newLayer();
  const x0 = -view.offX, W = view.w, top = -view.offY, hor = LAYOUT.horizonY + 10;
  const [c1, c2, c3] = currentEpoch().sky;      // три кольори неба залежать від епохи
  const hx = k => { const h = PALETTE[k]; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  const A = hx(c1), B = hx(c2), C = hx(c3), mix = (p, q, t) => p.map((v, i) => Math.round(v + (q[i] - v) * t));
  const col = u => { const lvl = Math.floor(u * 5) / 5; return u < 1 ? mix(A, B, lvl) : mix(B, C, Math.floor((u - 1) * 5) / 5); };
  const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const rows = hor - top;
  for (let y = top; y < hor; y++) {
    const f = (y - top) / rows, u = f < 0.45 ? f / 0.45 : 1 + Math.pow((f - 0.45) / 0.55, 0.9), step = 1 / 5, fr = ((u < 1 ? u : u - 1) / step) % 1;
    const c0 = col(u), c1b = col(Math.min(2, u + step * (u < 1 ? 1 : 1)));
    for (let x = x0; x < x0 + W; x++) {
      const th = bayer[(y & 3)][(x - x0) & 3] / 16, cc = fr > th ? c1b : c0;
      g.fillStyle = 'rgb(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ')'; g.fillRect(x, y, 1, 1);
    }
  }
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
const ROOF_PREF = { renaissance: [2, 5, 3, 4], retro: [0, 0, 6, 4], disco: [5, 0, 8, 4], arcade: [0, 9, 1, 4], internet: [1, 1, 0, 3], eco: [7, 3, 4, 6], space: [1, 10, 0, 3], neon: [11, 0, 5, 1] };
function drawRoofThing(g, k, px, by, hs, i) {
  const cols = ['r', 'p', 'T', 'y', 'o', 'f'], c = cols[(hs >>> (i * 3)) % cols.length];
  switch (k) {
    case 0: R(g, px, by - 10, 1, 10, 'd'); R(g, px - 4, by - 9, 9, 1, 'd'); R(g, px - 3, by - 7, 7, 1, 'd'); R(g, px - 2, by - 5, 5, 1, 'd'); break;
    case 1: R(g, px, by - 5, 1, 5, 'd'); disc(g, px, by - 8, 3, 'd'); disc(g, px, by - 8, 2, 'w'); R(g, px + 2, by - 11, 1, 4, 'd'); R(g, px + 1, by - 11, 3, 1, 'r'); break;
    case 2: R(g, px, by - 11, 1, 11, 'd'); R(g, px - 4, by - 8, 9, 1, 'd'); R(g, px + 4, by - 9, 2, 3, 'r'); R(g, px - 5, by - 9, 2, 3, 'r'); R(g, px - 1, by - 12, 3, 2, 'h'); break;
    case 3: R(g, px - 3, by - 6, 2, 6, 'e'); R(g, px - 4, by - 7, 4, 1, 'd'); R(g, px + 2, by - 8, 2, 8, 'e'); R(g, px + 1, by - 9, 4, 1, 'd'); break;
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
  xs.forEach((px, i) => {
    if (!flat && hs % 3 === 0 && w >= 40 && Math.abs(px - (x + w - 12)) < 11) return;       // тут димар
    if (flat && hs % 3 === 0 && Math.abs(px - (x + w - 12)) < 9) return;                       // тут антена
    if (flat && hs % 3 === 1 && Math.abs(px - (x + 10)) < 11) return;                          // тут кондиціонер
    if ((hs >>> (i * 4 + 1)) % 5 === 0) return;                                                // не на кожному будинку все й одразу
    const roll = (hs >>> (i * 5)) % 10, k = roll < 7 ? pref[(hs >>> (i * 3 + 2)) % pref.length] : [0, 3, 4, 5, 6, 12][(hs >>> (i * 2 + 7)) % 6];
    drawRoofThing(g, k, px, by, hs, i);
  });
  if ((hs >>> 5) % 3 === 0) for (let lx = x + 4; lx < x + w - 2; lx += 5) R(g, lx, top - 1, 1, 1, ['y', 'r', 'T', 'p'][((lx - x) / 5 | 0) % 4]);      // гірлянда вздовж карниза
}
function shopRoofExtras(g, es, w, top, level) {
  const seed = hash2(level * 31 + (es.fx ? es.fx.length : 0), 7), by = top + 4, pref = ROOF_PREF[currentEpoch().id] || [0, 3, 4, 5];
  const ks = lastRoofSign, kl = ks ? ks.x - 20 : w * 0.3, kr = ks ? ks.x + ks.w + 20 : w * 0.68;
  [Math.max(12, Math.min(Math.round(w * 0.3), kl)), Math.min(w - 14, Math.max(Math.round(w * 0.68), kr))].forEach((px, i) => {
    const k = (seed >>> (i * 4)) % 4 === 0 ? 4 : pref[(seed >>> (i * 3 + 1)) % pref.length];
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
  const tone = HOUSE_TONE[viewEpoch() % 8] || HOUSE_TONE[0], k = ((i % 5) + 5) % 5, hue = tone[2] + k * 72;
  return { wall: hslHex(hue, tone[0], tone[1]), roof: hslHex(hue + 170 + (k % 2) * 25, tone[0] * 0.8, 0.38) };
}
function drawHouse(g, spec, lamps) {
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
  const add = (x, y) => benches.push({ x, y: y || LAYOUT.streetTop, slots: [{ dx: -8, who: null }, { dx: 8, who: null }] });
  treeSpots(x0, view.w).forEach(tr => { [26, -26, 32, -32].some(off => { if (free(tr.x + off)) { add(tr.x + off); return true; } return false; }); });
  [0.12, 0.88, 0.3, 0.7, 0.2, 0.8, 0.5].forEach(f => { const bx = Math.round(x0 + view.w * f); if (benches.length < 3 && free(bx)) add(bx); });

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
  ctx.globalAlpha = 0.2; R(ctx, x - 16, y, 32, 2, 'd'); ctx.globalAlpha = 1;
  const [fb, fl] = benchColors();
  R(ctx, x - 16, y - 7, 32, 3, fb); R(ctx, x - 16, y - 7, 32, 1, fl); R(ctx, x - 16, y - 5, 32, 1, 'd');
  R(ctx, x - 15, y - 4, 3, 4, 'd'); R(ctx, x + 12, y - 4, 3, 4, 'd');
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
  disc(g, x, y, 6, 'g');
  disc(g, x - 5, y + 2, 4, 'g');
  disc(g, x + 5, y + 2, 4, 'g');
  disc(g, x - 2, y - 2, 2, 'm');
  R(g, x + 3, y, 1, 1, 'p'); R(g, x - 5, y + 3, 1, 1, 'q');
}

/* ---------- Земля: пагорби, будинки, тротуар, бруківка (статичний шар) ---------- */
// Далекий обрій за будинками: силует міста епохи (вежі, хмарочоси, купола, неонові вежі)
function farSkyline(g, x0, W) {
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
function paintCobble(g, X0, Y0, W, H, style) {
  if (cobbleExtra(g, X0, Y0, W, H, style)) return;
  if (style === 'snow' || style === 'leaves') {                    // звичайний булижник + сніг або листя зверху
    paintCobble(g, X0, Y0, W, H, 'stone');
    const F = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    if (style === 'snow') {
      g.globalAlpha = 0.16; F(X0, Y0, W, H, '#9db8d8'); g.globalAlpha = 1;
      for (let gy = Math.floor(Y0 / 5) * 5; gy < Y0 + H; gy += 5) for (let gx = Math.floor(X0 / 6) * 6; gx < X0 + W; gx += 6) {
        const hs = hash2(gx, gy + 31);
        if (hs % 4 === 0) continue;
        const w = 3 + (hs >>> 3) % 6, x = gx + (hs >>> 7) % 4, y = gy + (hs >>> 11) % 3;
        F(x, y + 2, w, 1, '#a9c0dc'); F(x, y, w, 2, '#f4f9ff'); F(x + 1, y - 1, Math.max(1, w - 3), 1, '#ffffff');
        if (hs % 11 === 0) F(x + 1, y, 1, 1, '#ffffff');
      }
    } else {
      for (let gy = Math.floor(Y0 / 9) * 9; gy < Y0 + H; gy += 9) for (let gx = Math.floor(X0 / 11) * 11; gx < X0 + W; gx += 11) {
        const hs = hash2(gx + 5, gy + 9), n = 1 + hs % 3;
        for (let k = 0; k < n; k++) { const x = gx + (hash2(hs, k) % 10), y = gy + (hash2(k, hs) % 8), c = ['#c4553d', '#e8863c', '#f2b84b', '#a8703f', '#d9a679'][hash2(x, y) % 5]; F(x, y, 3, 2, c); F(x + 1, y, 1, 1, '#7a4f35'); F(x, y + 1, 1, 1, '#ffd98a'); }
      }
    }
    return;
  }
  const RH = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const ANCHOR = -2600;                                            // з цієї точки рахуємо камені, тож візерунок завжди той самий
  if (style === 'wood') {                                          // дерев'яний настил
    RH(X0, Y0, W, H, '#5a3a2a');
    for (let r = 0, y = Y0; y < Y0 + H; r++, y += 7) {
      let x = ANCHOR - (hash2(r, 4) % 40);
      while (x < X0 + W) {
        const w = 28 + (hash2(x, r) % 20), t = ['#a8703f', '#9c6638', '#b57a45', '#946034'][hash2(x + 3, r) % 4];
        if (x + w > X0) {
          RH(x + 1, y + 1, w - 1, 6, t); RH(x + 1, y + 1, w - 1, 1, '#c98d57'); RH(x + 1, y + 6, w - 1, 1, '#6e4528');
          for (let k = 0; k < 3; k++) RH(x + 4 + hash2(x + k, r) % (w - 8), y + 3 + k % 2, 4, 1, '#855430');
          RH(x + 2, y + 3, 1, 1, '#4a3228'); RH(x + w - 3, y + 3, 1, 1, '#4a3228');
        }
        x += w;
      }
    }
  } else if (style === 'brick') {                                  // червона цегла
    RH(X0, Y0, W, H, '#7a5a4a');
    for (let r = 0, y = Y0; y < Y0 + H; r++, y += 6) for (let x = Math.floor((X0 - 12) / 12) * 12 + (r % 2) * 6 - 12; x < X0 + W; x += 12) {
      const t = ['#b5533c', '#a84a35', '#c25e45', '#9f4430'][hash2(x, r) % 4];
      RH(x + 1, y + 1, 11, 5, t); RH(x + 1, y + 1, 11, 1, '#d77a5e'); RH(x + 1, y + 5, 11, 1, '#7d3224');
      if (hash2(x + 5, r) % 9 === 0) RH(x + 4, y + 3, 2, 1, '#8a3a28');
    }
  } else {                                                         // звичайна: нерівний булижник з об'ємом, тріщинами й мохом
    RH(X0, Y0, W, H, '#7d7268');
    const tones = ['#cfc5b8', '#c3b9ab', '#d6ccbf', '#bdb3a6', '#cbc0b2'];
    for (let r = 0, y = Y0; y < Y0 + H; r++) {
      const h = 6 + (hash2(r, 5) % 2);
      let x = ANCHOR - (hash2(r, 9) % 8);
      while (x < X0 + W) {
        const w = 8 + (hash2(x + 7, r) % 6);
        if (x + w > X0) {
          const t = tones[hash2(x, r + 3) % tones.length];
          RH(x + 1, y + 1, w - 1, h - 1, t);
          RH(x + 1, y + 1, w - 1, 1, '#e9e1d4'); RH(x + 1, y + 1, 1, h - 1, '#e0d7ca');
          RH(x + 1, y + h - 1, w - 1, 1, '#9c9087'); RH(x + w - 1, y + 2, 1, h - 2, '#a79d92');
          RH(x + 1, y + 1, 1, 1, '#7d7268'); RH(x + w - 1, y + h - 1, 1, 1, '#7d7268');
          const k = hash2(x * 3, r * 7) % 11;
          if (k === 0) { RH(x + 3, y + 3, 1, 1, '#9c9087'); RH(x + 4, y + 4, 1, 1, '#9c9087'); RH(x + 5, y + 4, 1, 1, '#9c9087'); }
          if (k === 1) { RH(x + w - 4, y + 2, 2, 1, '#bdb3a6'); RH(x + 3, y + 3, 1, 1, '#b3a99c'); }
          if (k === 2) { RH(x + 2, y + h, 3, 1, '#6f9a5a'); RH(x + 4, y + h - 1, 1, 1, '#6f9a5a'); }
        }
        x += w;
      }
      y += h;
    }
  }
}
// Зима: сніг лежить на тротуарі, бруківці, вздовж бордюру й на узбіччі дороги (кучугури, плями на камінні, тінь під ними)
function snowBlob(g, cx, cy, rx, ry) {
  for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5)))); R(g, cx - hw, cy + dy, hw * 2 + 1, 1, dy > ry * 0.35 ? '#d3e1f4' : dy < -ry * 0.3 ? '#ffffff' : '#f1f7ff'); }
  R(g, cx - rx, cy + ry + 1, rx * 2, 1, '#a9bddb');
}
function winterGround(g, x0, W, H) {
  const roadTop = view.extraB >= 30 ? H - 36 : H;
  for (let x = x0; x < x0 + W; x++) {                                                          // кучугура під стінами будинків
    const hh = 2 + hash2(x >> 2, 71) % 3; R(g, x, LAYOUT.horizonY, 1, hh, '#ffffff'); R(g, x, LAYOUT.horizonY + hh, 1, 1, '#c3d6ee');
  }
  for (let gx = Math.floor(x0 / 4) * 4; gx < x0 + W; gx += 4) for (let gy = LAYOUT.horizonY + 5; gy < LAYOUT.curbY - 1; gy += 3) {          // тротуар
    const hs = hash2(gx + 5, gy + 9); if (hs % 100 < 55) { const ww = 2 + hs % 5; R(g, gx + (hs >>> 8) % 3, gy, ww, 1, '#f6f9ff'); if (hs % 3 === 0) R(g, gx + 1 + (hs >>> 8) % 3, gy + 1, ww - 1, 1, '#d3e1f4'); }
  }
  for (let x = x0; x < x0 + W; x++) { const hh = 1 + hash2(x >> 1, 73) % 3; R(g, x, LAYOUT.curbY - hh + 1, 1, hh, '#ffffff'); R(g, x, LAYOUT.curbY + 2, 1, 1, '#c3d6ee'); }       // вал снігу вздовж бордюру
  for (let gx = Math.floor(x0 / 5) * 5; gx < x0 + W; gx += 5) for (let gy = LAYOUT.streetTop + 2; gy < roadTop - 2; gy += 4) {              // бруківка: сніг на каменях і в швах
    const hs = hash2(gx + 13, gy + 17);
    if (hs % 100 < 58) { const ww = 2 + hs % 6; R(g, gx + (hs >>> 9) % 4, gy, ww, 1, '#f6f9ff'); R(g, gx + (hs >>> 9) % 4, gy + 1, Math.max(1, ww - 2), 1, '#d3e1f4'); }
  }
  for (let gx = x0 + 10; gx < x0 + W - 10; gx += 38 + hash2(gx, 4) % 40) snowBlob(g, gx, LAYOUT.streetTop + 6 + hash2(gx, 9) % Math.max(10, roadTop - LAYOUT.streetTop - 14), 6 + hash2(gx, 1) % 7, 2 + hash2(gx, 2) % 2);    // кучугури на вулиці
  if (view.extraB >= 30) {                                                                      // узбіччя дороги: вал снігу й плями
    for (let x = x0; x < x0 + W; x++) { const hh = 2 + hash2(x >> 1, 79) % 3; R(g, x, roadTop, 1, hh, '#f1f7ff'); R(g, x, roadTop + hh, 1, 1, '#a9bddb'); }
    for (let gx = x0; gx < x0 + W; gx += 11) { const hs = hash2(gx, 83); if (hs % 100 < 40) R(g, gx, roadTop + 6 + (hs >>> 6) % Math.max(6, H - roadTop - 12), 3 + hs % 5, 1, '#e4edf8'); }
  }
}
const manholeSpots = [];                                           // де стоять люки (над ними піднімається пара)
function buildGroundLayer() {
  const { c, g } = newLayer();
  const H = worldB();
  const x0 = -view.offX, W = view.w;      // ліва межа й повна ширина полотна (у координатах «ядра»)
  houseGlass = []; houseDoors = [];
  buildSeason = seasonNow();
  const lamps = lampPositions();

  // далекі пагорби
  for (let x = x0; x < x0 + W; x++) {
    const top = Math.round(98 + 7 * Math.sin(x / 41) + 4 * Math.sin(x / 17 + 2));
    R(g, x, top, 1, LAYOUT.horizonY - top, 'm');
    if (top + 1 < LAYOUT.horizonY) R(g, x, top, 1, 1, 'g');
  }
  farSkyline(g, x0, W);
  // будиночки
  HOUSES.concat(extraHouses()).forEach((h0, i) => {
    const h = Object.assign({}, h0, { h: Math.round(h0.h * HOUSE_SCALE) });         // будинки вищі: верхівки сягають середини 4-го поверху торгового центру
    const spec = Object.assign({}, h, houseColors(i));                                // кожен будинок має свій колір стін і даху

    drawHouse(g, spec, lamps);
    if (buildSeason === 'halloween') drawHalloweenHouse(g, spec);
  });
  drawBush(g, 40, 121);
  drawBush(g, 296, 121);
  for (let x = 40 - 92; x > x0 + 6; x -= 92) drawBush(g, x, 121);                  // кущі в розширеній частині вулиці
  for (let x = 296 + 92; x < x0 + W - 6; x += 92) drawBush(g, x, 121);
  // легка димка, щоб фон «відсунувся»
  g.globalAlpha = 0.16; R(g, x0, 60, W, LAYOUT.horizonY - 60, 'W'); g.globalAlpha = 1;

  // тротуар
  R(g, x0, LAYOUT.horizonY, W, LAYOUT.curbY - LAYOUT.horizonY, 'E');
  R(g, x0, LAYOUT.horizonY, W, 1, 'e');
  for (let x = Math.floor(x0 / 20) * 20 + 6; x < x0 + W; x += 20) R(g, x, LAYOUT.horizonY + 1, 1, 9, 'e');
  R(g, x0, LAYOUT.curbY, W, 2, 'e');
  R(g, x0, LAYOUT.curbY, W, 1, 'w');
  R(g, x0, LAYOUT.streetTop, W, 1, 'd');

  // дерева вздовж тротуару
  treeSpots(x0, W).forEach(tr => drawStreetTree(g, tr.x, tr.v, buildSeason));

  // бруківка
  paintCobble(g, x0, LAYOUT.streetTop + 1, W, H - LAYOUT.streetTop - 1, skinOn('street') || 'stone');
  manholeSpots.length = 0;
  const my = Math.min(H - 48, 188);                                   // люки: один ряд уздовж дороги, не часто
  for (let mx = Math.floor(x0 / 340) * 340 + 100; mx < x0 + W - 8; mx += 340) { const hx = mx + (hash2(mx, 3) % 21) - 10, hy = my + (hash2(3, mx) % 5) - 2; manholeG(g, hx, hy); manholeSpots.push({ x: hx, y: hy }); }
  if (view.extraB >= 30) drawRoadG(g, x0, W, H);
  if (buildSeason === 'winter') winterGround(g, x0, W, H);
  if (buildSeason === 'autumn' || buildSeason === 'spring') autumnGroundLeaves(g, x0, W, H, treeSpots(x0, W), buildSeason === 'spring');
  g.globalAlpha = 0.1; R(g, x0, H - 20, W, 20, 'd'); g.globalAlpha = 1;
  const trees = treeSpots(x0, W);
  houseDoors = houseDoors.filter(d => !trees.some(tr => Math.abs(tr.x - d.x) < 28));      // двері, закриті деревом, не використовуються: звірята туди не заходять
  houseGlass = houseGlass.filter(r => !windowHidden(r, trees));        // вікна, закриті деревами чи магазином, не світяться й не блимають привидами
  houseLit = buildLitLayer(houseGlass);
  return c;
}
// Осіннє листя: купи під деревами, розсип по тротуару, бруківці й дорозі
function autumnGroundLeaves(g, x0, W, H, trees, spring) {
  const cols = spring ? ['#ef8fa3', '#ffc9d4', '#f7b6c8', '#ffd9e2', '#e9738f', '#ffb3c6', '#fff0f4'] : ['#c4553d', '#e8863c', '#f2b84b', '#a8703f', '#d9a679', '#b5471f', '#e3a02e'], k = spring ? 0.8 : 1;
  const leaf = (x, y, h) => {
    const c = cols[h % cols.length], f = (h >>> 4) % 3;
    g.fillStyle = c;
    if (f === 0) g.fillRect(x, y, 3, 2); else if (f === 1) g.fillRect(x, y, 2, 3); else { g.fillRect(x, y, 4, 2); g.fillRect(x + 1, y - 1, 2, 1); }
    g.fillStyle = spring ? '#fff6f8' : '#ffd98a'; g.fillRect(x, y, 1, 1); g.fillStyle = spring ? '#c8587a' : '#7a4f35'; g.fillRect(x + (f === 1 ? 1 : 2), y + (f === 1 ? 2 : 1), 1, 1);
  };
  const base = LAYOUT.horizonY + 8, roadTop = view.extraB >= 30 ? H - 36 : H;
  trees.forEach(tr => {                                                         // купа під кожним деревом
    for (let i = 0; i < Math.round(90 * k); i++) {
      const hs = hash2(tr.x * 7 + i, 41 + i), r1 = ((hs >>> 3) % 1000) / 1000, r2 = ((hs >>> 13) % 1000) / 1000;
      const dx = (r1 + r2 - 1) * 30, dy = (((hs >>> 21) % 100) / 100) * 22 - 4;
      leaf(Math.round(tr.x + dx), Math.round(base + dy), hs);
    }
    g.globalAlpha = 0.28; R(g, tr.x - 12, base + 1, 24, 4, 'd'); g.globalAlpha = 1;
    for (let i = 0; i < 14; i++) { const hs = hash2(tr.x + i * 5, 77); leaf(tr.x - 9 + (hs % 18), base + 1 + (hs >>> 5) % 4, hs); }      // щільний горбок
  });
  for (let gy = LAYOUT.horizonY + 2; gy < LAYOUT.curbY - 1; gy += 5) for (let gx = Math.floor(x0 / 9) * 9; gx < x0 + W; gx += 9) {      // тротуар
    const hs = hash2(gx + 3, gy + 7); if (hs % 100 < 22 * k) leaf(gx + (hs >>> 8) % 8, gy + (hs >>> 12) % 4, hs);
  }
  for (let gy = LAYOUT.streetTop + 2; gy < roadTop - 3; gy += 6) for (let gx = Math.floor(x0 / 7) * 7; gx < x0 + W; gx += 7) {              // бруківка
    const hs = hash2(gx + 11, gy + 13); if (hs % 100 < 30 * k) leaf(gx + (hs >>> 8) % 6, gy + (hs >>> 12) % 5, hs);
  }
  if (view.extraB >= 30) for (let gy = roadTop + 8; gy < H - 4; gy += 8) for (let gx = Math.floor(x0 / 13) * 13; gx < x0 + W; gx += 13) {      // дорога
    const hs = hash2(gx + 19, gy + 23); if (hs % 100 < 8 * k) leaf(gx + (hs >>> 8) % 11, gy + (hs >>> 12) % 6, hs);
  }
}
// Смуга дороги знизу сцени: бордюр із каменю, асфальт із зерном, тріщинами й латками, розмітка, затока для поштової машини й острівець для поштомата
function drawRoadG(g, x0, W, H) {
  const top = H - 36, bx = LAYOUT.centerX - 70;
  const F = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // 1. бордюр: тінь від тротуару, світла грань, бокова стінка зі швами й тінню на асфальті
  F(x0, top - 1, W, 1, '#3a2c26'); F(x0, top, W, 2, '#dcd2c4'); F(x0, top + 2, W, 3, '#a39889'); F(x0, top + 5, W, 1, '#4a3228');
  for (let x = Math.floor(x0 / 18) * 18; x < x0 + W; x += 18) { F(x, top, 1, 5, '#8a8076'); F(x + 1, top, 1, 1, '#f1e9dc'); }
  // 2. асфальт: основа, колії, зерно
  F(x0, top + 6, W, 30, '#4b4852'); F(x0, top + 6, W, 3, '#3d3a44');
  F(x0, top + 11, W, 4, '#46434d'); F(x0, top + 26, W, 4, '#46434d');
  for (let x = x0; x < x0 + W; x++) for (let k = 0; k < 3; k++) {
    const h = hash2(x + k * 31, 17 + k), yy = top + 7 + (h >>> 4) % 29;
    if (h % 4 === 0) F(x, yy, 1, 1, h % 8 === 0 ? '#5c5964' : '#38353e');
  }
  // 3. тріщини й ремонтні латки (місця однакові при кожному запуску)
  for (let cx = Math.floor(x0 / 70) * 70; cx < x0 + W; cx += 70) {
    const h = hash2(cx, 91);
    if (h % 3 === 0) { let px = cx + (h >>> 5) % 50, py = top + 9 + (h >>> 9) % 20; for (let i = 0; i < 9; i++) { F(px, py, 1, 1, '#2f2c35'); px += 1 + (hash2(px, i) % 2); py += (hash2(i, px) % 3) - 1; } }
    if (h % 5 === 1) { const px = cx + 10 + (h >>> 6) % 40, py = top + 8 + (h >>> 11) % 18; F(px, py, 12, 7, '#55525c'); F(px, py, 12, 1, '#625f6a'); F(px, py + 6, 12, 1, '#3d3a44'); }
  }
  // 4. розмітка: суцільна біла лінія біля бордюру й жовтий пунктир посередині (із тінню)
  F(x0, top + 8, W, 1, '#8f8c96');
  for (let x = Math.floor(x0 / 18) * 18; x < x0 + W; x += 18) if (x < bx - 44 || x > bx + 28) { F(x, top + 20, 10, 2, '#e8c24a'); F(x, top + 22, 10, 1, '#8a6f22'); }
  // 5. затока для поштової машини: світліший асфальт, біла розмітка, стрілки, колісний обмежувач
  F(bx - 21, top + 11, 46, 23, '#56535e'); F(bx - 21, top + 11, 46, 1, '#69666f');
  F(bx - 22, top + 10, 48, 1, '#e8e2d4'); F(bx - 22, top + 34, 48, 1, '#e8e2d4'); F(bx + 25, top + 10, 1, 25, '#e8e2d4');
  for (let k = 0; k < 3; k++) { const x = bx + 15 - k * 9; lineG(g, x, top + 17, x - 4, top + 22, 'w'); lineG(g, x, top + 27, x - 4, top + 22, 'w'); lineG(g, x + 1, top + 17, x - 3, top + 22, 'w'); lineG(g, x + 1, top + 27, x - 3, top + 22, 'w'); }
  F(bx + 19, top + 16, 3, 13, '#d9d2c4'); F(bx + 19, top + 16, 3, 1, '#f5efe2'); F(bx + 19, top + 28, 3, 1, '#7d7468');
  // 6. острівець безпеки під поштомат: бетон із бордюром і жовто-чорною смугою по краю
  const ix = bx - 68, iw = 49;                                                  // острівець тягнеться під обидві скриньки (синю й червону)
  F(ix - 1, top + 9, iw + 2, 27, '#4a3228'); F(ix, top + 10, iw, 25, '#9c9087'); F(ix, top + 10, iw, 2, '#d6ccbf');
  F(ix, top + 33, iw, 2, '#7f756c');
  for (let i = 0; i < iw - 1; i += 4) { F(ix + i, top + 13, 2, 2, '#2a1d1a'); F(ix + 2 + i, top + 13, 2, 2, '#e8c24a'); F(ix + i, top + 30, 2, 2, '#2a1d1a'); F(ix + 2 + i, top + 30, 2, 2, '#e8c24a'); }
  // 7. конуси на кутах затоки
  [[bx - 21, top + 9], [bx + 25, top + 9], [bx + 25, top + 36]].forEach(([cx, cy]) => { R(g, cx - 3, cy + 4, 7, 1, 'd'); R(g, cx - 2, cy + 3, 5, 1, 'o'); R(g, cx - 1, cy + 1, 3, 2, 'o'); R(g, cx, cy - 1, 1, 2, 'o'); R(g, cx - 1, cy + 2, 3, 1, 'w'); R(g, cx - 1, cy + 1, 1, 1, 'r'); });
  // 8. нижній край дороги: темніше, щоб не зливалося
  g.globalAlpha = 0.35; F(x0, H - 3, W, 3, '#1f1b24'); g.globalAlpha = 1;
}
function manholeG(g, x, y) {                  // люк: чавунна кришка з концентричними кільцями (у перспективі — приплюснутий овал)
  const ell = (rx, ry, c, dy) => { g.fillStyle = c; for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) if ((xx * xx) / (rx * rx + 0.3) + (yy * yy) / (ry * ry + 0.3) <= 1) g.fillRect(x + xx, y + yy + (dy || 0), 1, 1); };
  ell(9, 5, '#4a3228', 1); ell(8, 4, '#8a8076'); ell(6, 3, '#a89e93'); ell(4, 2, '#8a8076'); ell(2, 1, '#a89e93');
  g.fillStyle = '#d6ccbf'; g.fillRect(x - 7, y - 1, 3, 1); g.fillStyle = '#5e554c'; g.fillRect(x + 1, y + 3, 4, 1);
}
// Над люками піднімається пара (легкі білі клубочки, що плавно зникають)
function drawManholeSteam() {
  if (!manholeSpots.length || !state.settings.steam || ecoOn()) return;
  manholeSpots.forEach((m, mi) => {
    if (m.x < visL() - 16 || m.x > visR() + 16) return;
    for (let i = 0; i < 4; i++) {
      const ph = ((animOn() ? animClock * 0.34 : 0) + i / 4 + mi * 0.37) % 1, yy = m.y - 3 - ph * 24;
      const xx = m.x + (animOn() ? Math.sin(animClock * 1.3 + i * 2 + mi) : 0) * (1.5 + ph * 5), r = 1.5 + ph * 3, a = Math.sin(ph * Math.PI);
      ctx.globalAlpha = a * 0.28; disc(ctx, Math.round(xx), Math.round(yy), Math.round(r) + 1, 'E');       // м'який край клубочка
      ctx.globalAlpha = a * 0.46; disc(ctx, Math.round(xx) - 1, Math.round(yy) - 1, Math.round(r), 'w');
    }
  });
  ctx.globalAlpha = 1;
}
function windowHidden(r, trees) {
  const base = LAYOUT.horizonY + 8;
  if (shop && r[0] + r[2] > shop.x - 28 && r[0] < shop.x + shop.w + 28 && r[1] + r[3] > shop.y - 4) return true;      // будинки за магазином не дають відблиску на нього
  return trees.some(tr => r[0] + r[2] > tr.x - 26 && r[0] < tr.x + 26 && r[1] + r[3] > base - 80);
}

// Додаткові будиночки з боків для широкого екрана (різні розміри й кольори; однакові при кожному запуску)
function extraHouses() {
  const walls = ['q', 'y', 'm', 'p', 'c', 'w', 'y', 'm'], roofs = ['r', 'b', 'n', 'b', 'r', 'n'];
  const make = (i) => {
    const hs = hash2(i * 7 + 3, 11);
    return { w: 44 + hs % 14, h: 54 + (hs >>> 4) % 20, wall: walls[hs % walls.length], roof: roofs[(hs >>> 3) % roofs.length], gap: 0 };
  };
  const list = [];
  let x = -8;                                    // ліворуч від ядра (крайній будинок ядра починається з −8)
  for (let i = 0; x > -view.offX - 40; i++) {
    const hs = make(i);
    x -= hs.w;
    list.push({ x, w: hs.w, h: hs.h, wall: hs.wall, roof: hs.roof });
  }
  x = 342;                                       // праворуч (крайній будинок ядра закінчується на 342)
  for (let i = 20; x < CONFIG.SCENE_W + view.offX + 4; i++) {
    const hs = make(i);
    list.push({ x, w: hs.w, h: hs.h, wall: hs.wall, roof: hs.roof });
    x += hs.w;
  }
  return list;
}

// Шар освітлених вікон будинків (вночі вмикається поверх затемнення)
function buildLitLayer(rects) {
  const { c, g } = newLayer();
  rects.forEach(r => {
    if (hash2(r[0] + 5, r[1] + 9) % 4 === 0) return;      // частина вікон лишається темною
    const hall = buildSeason === 'halloween';
    g.globalAlpha = 0.22; R(g, r[0] - 2, r[1] - 2, r[2] + 4, r[3] + 4, hall ? '#ff9a3c' : '#ffd36a'); g.globalAlpha = 1;          // ореол світла навколо вікна
    R(g, r[0], r[1], r[2], 3, hall ? '#ffb347' : '#fff0b8'); R(g, r[0], r[1] + 3, r[2], 3, hall ? '#ff9a3c' : '#ffd860'); R(g, r[0], r[1] + 6, r[2], r[3] - 6, hall ? '#e8742c' : '#f2a63c');
    R(g, r[0] + 3, r[1], 1, r[3], '#6a4a28'); R(g, r[0], r[1] + 3, r[2], 1, '#6a4a28');                  // рама лишається видно
    if (hash2(r[0], r[1]) % 3 === 0) R(g, r[0] + 1, r[1] + 5, 2, 4, '#a85a28');                         // силует людини чи лампи в кімнаті
  });
  return c;
}

/* ---------- Дерева (пора року змінює їхній вигляд) ---------- */
// Де садити дерева: посередині вільних проміжків між ліхтарями, магазином і краями вулиці (щоб ліхтарі їх не затуляли)
function treeSpots(x0, W) {
  const blocks = lampPositions().map(lx => [lx - 12, lx + 14]);
  if (shop) blocks.push([shop.x - 2, shop.x + shop.w + 2]);
  blocks.sort((a, b) => a[0] - b[0]);
  const list = [];
  let prev = x0;
  const gap = (a, b, i) => {
    const room = b - a;
    if (room < 50) return;
    const n = room >= 150 ? 2 : 1;
    for (let k = 1; k <= n; k++) {
      const hs = hash2(Math.round(a) + 31 + k, 5);
      list.push({ x: Math.round(a + room * k / (n + 1)), v: (hs >>> 5) % 3 });
    }
  };
  blocks.forEach((bl, i) => { gap(prev, bl[0], i); prev = Math.max(prev, bl[1]); });
  gap(prev, x0 + W, blocks.length);
  return list;
}
function lineG(g, x0, y0, x1, y1, c) {      // лінія з пікселів (Брезенхем)
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
  for (;;) {
    R(g, x0, y0, 1, 1, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function drawStreetTree(g, x, v, season) {
  const base = LAYOUT.horizonY + 8;
  if (season === 'winter') { drawBareTree(g, x, v, season); return; }
  // Дерево ×1,45 від колишнього: розлогий стовбур із корою й корінням, об'ємна крона з кількох шарів, світло зверху-зліва, тінь знизу-праворуч, сезонні деталі
  const pal = {
    spring: ['q', 'p', 'w', 'b', ['p', 'p', 'w', 'q', 'm']],
    summer: ['g', 'G', 'm', 'G', ['m', 'G', 'y']],
    autumn: ['o', 'r', 'h', 'b', ['h', 'y', 'r', 'h', 'o']],
    halloween: ['u', 'n', 'p', 'k', ['o', 'o', 'y', 'p']]
  }[season];
  const seed = x * 7 + v * 13;
  g.globalAlpha = 0.26; R(g, x - 27, base, 54, 4, 'd'); R(g, x - 19, base + 4, 38, 2, 'd'); R(g, x - 12, base + 6, 24, 1, 'd'); g.globalAlpha = 1;      // тінь на землі
  // ствол: світлий лівий бік, темний правий, кора з тріщинами, мох, потовщення в корінні
  R(g, x - 5, base - 26, 10, 26, 'd'); R(g, x - 4, base - 26, 8, 26, 'b'); R(g, x - 4, base - 26, 2, 26, 'l');
  g.globalAlpha = 0.4; R(g, x + 1, base - 26, 3, 26, 'd'); g.globalAlpha = 1;
  for (let k = 0; k < 9; k++) { const kx = x - 3 + (hash2(k, seed) % 6), ky = base - 24 + k * 3; R(g, kx, ky, 1, 2, 'd'); if (k % 3 === 0) R(g, kx + 1, ky + 1, 1, 1, 'l'); }
  R(g, x - 4, base - 9, 2, 2, 'g'); R(g, x - 3, base - 15, 2, 1, 'm'); R(g, x - 4, base - 14, 1, 1, 'g');
  R(g, x - 9, base - 3, 18, 4, 'd'); R(g, x - 8, base - 3, 16, 3, 'b'); R(g, x - 8, base - 3, 4, 1, 'l');
  R(g, x - 12, base - 1, 5, 3, 'd'); R(g, x - 11, base - 1, 3, 2, 'b'); R(g, x + 7, base - 1, 5, 3, 'd'); R(g, x + 7, base - 1, 3, 2, 'b');       // коріння
  lineG(g, x - 1, base - 24, x - 13, base - 38, 'd'); lineG(g, x, base - 24, x - 12, base - 38, 'b'); lineG(g, x + 1, base - 24, x + 13, base - 38, 'd'); lineG(g, x, base - 24, x + 12, base - 38, 'b');
  lineG(g, x, base - 26, x - 3, base - 42, 'd'); lineG(g, x + 1, base - 26, x - 2, base - 42, 'b');
  // крона з багатьох кульок (нерівний силует)
  const cy = base - 51;
  const discs = [[0, -3, 17], [-14, 7, 13], [14, 7, 13], [0, 10, 16], [-7, -13, 12], [9, -12, 11], [-22, -1, 9], [22, 0, 9], [0, -19, 9], [-12, 19, 9], [13, 19, 9], [-18, 14, 8], [19, 13, 8]];
  const inside = (px, py) => discs.some(d => { const dx = px - (x + d[0]), dy = py - (cy + d[1]); return dx * dx + dy * dy <= d[2] * d[2] + 1; });
  discs.forEach(d => disc(g, x + d[0], cy + d[1], d[2] + 1, pal[3]));                                   // контур
  const band = (py) => season === 'autumn' ? (py < cy - 9 ? 'h' : py < cy + 8 ? 'o' : 'r') : season === 'summer' ? (py < cy - 6 ? 'g' : 'g') : pal[0];     // восени крона від жовтої до червоної
  for (let py = cy - 32; py <= cy + 32; py++) for (let px = x - 36; px <= x + 36; px++) {
    if (!inside(px, py)) continue;
    const sh = (px - x) * 0.42 + (py - cy) * 0.85, n = hash2(px * 3 + 1, py * 5 + 7) % 11, n2 = hash2(px + 17, py * 3 + 5) % 7;
    const edge = !inside(px - 1, py) || !inside(px + 1, py) || !inside(px, py - 1) || !inside(px, py + 1);
    R(g, px, py, 1, 1, band(py));
    if (sh > 18 && n < 6) R(g, px, py, 1, 1, pal[3]);                                                      // глибока тінь знизу-праворуч
    else if (sh > 12 || (sh > 6 && n < 4)) R(g, px, py, 1, 1, pal[1]);
    else if (sh < -15 && n < 8) R(g, px, py, 1, 1, pal[2]);                                                // світло зверху-зліва
    else if (sh < -8 && n < 3) R(g, px, py, 1, 1, pal[2]);
    else if (n === 0) R(g, px, py, 1, 1, pal[1]);
    if (n2 === 0 && sh < 4) R(g, px, py, 2, 1, pal[2]);                                                    // дрібні листочки-відблиски
    if (edge && py > cy + 3 && hash2(px, py) % 3 === 0) R(g, px, py, 1, 1, pal[1]);                        // зубчики листя знизу
    if (edge && py < cy - 6 && hash2(py, px) % 3 === 0) R(g, px, py, 1, 1, pal[2]);                        // блиск на верхніх краях
  }
  // купки листя: світла шапка зверху й темна підкладка знизу — крона виглядає об'ємною
  for (let k = 0; k < 26; k++) {
    const a = (hash2(seed + k, 3) % 628) / 100, rr = 6 + hash2(k, seed + 9) % 24, px = x + Math.round(Math.cos(a) * rr * 1.2), py = cy + Math.round(Math.sin(a) * rr * 0.9);
    if (!inside(px - 3, py) || !inside(px + 3, py) || !inside(px, py - 2) || !inside(px, py + 3)) continue;
    R(g, px - 2, py + 2, 5, 1, pal[1]); R(g, px - 3, py + 1, 7, 1, pal[1]); R(g, px - 2, py - 1, 5, 2, season === 'autumn' ? band(py) : pal[0]); R(g, px - 2, py - 1, 3, 1, pal[2]);
  }
  // сезонні деталі: цвіт навесні, плоди й сонячні плями влітку, строкате листя восени
  if (season === 'spring') {
    for (let k = 0; k < 90; k++) {
      const a = (hash2(seed + k, 3) % 628) / 100, rr = hash2(k, seed + 9) % 27, px = x + Math.round(Math.cos(a) * rr * 1.25), py = cy + 1 + Math.round(Math.sin(a) * rr * 1.0);
      if (!inside(px, py) || !inside(px + 2, py + 2)) continue;
      const c1 = pal[4][k % pal[4].length];
      if (k % 4 === 0) { R(g, px, py, 3, 3, c1); R(g, px + 1, py + 1, 1, 1, 'y'); R(g, px + 1, py - 1, 1, 1, c1); R(g, px + 1, py + 3, 1, 1, c1); R(g, px - 1, py + 1, 1, 1, c1); R(g, px + 3, py + 1, 1, 1, c1); }       // повна квітка
      else R(g, px, py, 2, 2, c1);
    }
    for (let k = 0; k < 7; k++) R(g, x - 22 + hash2(k, seed + 2) % 44, cy + 28 + hash2(seed, k) % 12, 2, 1, ['q', 'p', 'w'][k % 3]);              // пелюстки в повітрі
  } else if (season === 'summer') {
    for (let k = 0; k < 40; k++) {
      const a = (hash2(seed + k, 3) % 628) / 100, rr = hash2(k, seed + 9) % 26, px = x + Math.round(Math.cos(a) * rr * 1.25), py = cy + 2 + Math.round(Math.sin(a) * rr * 1.0);
      if (inside(px, py)) R(g, px, py, 2, 1, pal[4][k % pal[4].length]);
    }
    for (let k = 0; k < 14; k++) {                                                                             // сонячні плями на листі
      const a = (hash2(seed + k * 3, 5) % 628) / 100, rr = hash2(k, seed + 33) % 20, px = x - 8 + Math.round(Math.cos(a) * rr), py = cy - 8 + Math.round(Math.sin(a) * rr * 0.8);
      if (inside(px, py) && inside(px + 2, py + 1)) { R(g, px, py, 3, 1, 'y'); R(g, px + 1, py + 1, 1, 1, 'y'); }
    }
    [[-12, 6], [10, 10], [-2, 20], [16, 0], [-20, 14], [4, -4], [-8, -8]].forEach(([dx, dy], i) => { if (inside(x + dx, cy + dy)) { R(g, x + dx - 1, cy + dy - 1, 4, 4, 'd'); R(g, x + dx, cy + dy, 2, 2, i % 2 ? 'r' : 'o'); R(g, x + dx, cy + dy, 1, 1, 'w'); } });   // плоди
  } else if (season === 'autumn') {
    for (let k = 0; k < 100; k++) {
      const a = (hash2(seed + k, 3) % 628) / 100, rr = hash2(k, seed + 9) % 27, px = x + Math.round(Math.cos(a) * rr * 1.25), py = cy + 2 + Math.round(Math.sin(a) * rr * 1.0);
      if (inside(px, py)) R(g, px, py, 2, 1, pal[4][k % pal[4].length]);
    }
    for (let k = 0; k < 9; k++) R(g, x - 24 + hash2(k, seed + 2) % 48, cy + 27 + hash2(seed, k) % 14, 2, 1, pal[4][k % pal[4].length]);              // листя, що падає
  }
  if (season === 'halloween') treeHalloweenDecor(g, x, cy);
  // на землі: трава, пелюстки навесні, опале листя восени
  for (let k = 0; k < 9; k++) { R(g, x - 22 + hash2(k, seed + 4) % 44, base + 1, 1, 2, 'g'); }
  if (season === 'spring' || season === 'autumn') {
    const gp = season === 'spring' ? ['q', 'p', 'w'] : ['o', 'h', 'r'];
    for (let k = 0; k < 30; k++) R(g, x - 24 + (hash2(k, seed) % 48), base + 1 + (hash2(seed, k) % 3), 2, 1, gp[k % 3]);
  }
}
// Хелловін: на дереві висять гарбузи-ліхтарики, привиди й гірлянда з вогників
function treeHalloweenDecor(g, x, cy) {
  const pump = (px, py) => { R(g, px - 2, py, 5, 4, 'd'); R(g, px - 1, py + 1, 3, 2, 'o'); R(g, px, py + 1, 1, 1, 'y'); R(g, px - 2, py + 1, 1, 2, 'o'); R(g, px + 2, py + 1, 1, 2, 'o'); R(g, px, py - 1, 1, 1, 'g'); };
  const ghost = (px, py) => { R(g, px - 2, py, 5, 6, 'd'); R(g, px - 1, py + 1, 3, 4, 'w'); R(g, px - 1, py + 2, 1, 1, 'k'); R(g, px + 1, py + 2, 1, 1, 'k'); R(g, px - 1, py + 5, 1, 1, 'w'); R(g, px + 1, py + 5, 1, 1, 'w'); };
  [[-9, 12, 6], [0, 18, 9], [9, 12, 6]].forEach(p => { R(g, x + p[0], cy + p[1], 1, p[2], 'd'); pump(x + p[0], cy + p[1] + p[2]); });      // гарбузи на мотузках
  [[-15, 9, 5], [14, 10, 4]].forEach(p => { R(g, x + p[0], cy + p[1], 1, p[2], 'd'); ghost(x + p[0], cy + p[1] + p[2]); });                  // привиди на мотузках
  for (let gx = x - 12; gx <= x + 12; gx++) {                                                                                                 // гірлянда
    const sag = Math.round(4 * Math.sin((gx - x + 12) / 24 * Math.PI));
    R(g, gx, cy + 9 + sag, 1, 1, 'd');
    if ((gx - x) % 4 === 0) R(g, gx, cy + 10 + sag, 2, 2, ['o', 'y', 'p'][(gx - x + 12) / 4 % 3 | 0]);
  }
}
// Зимове дерево: пишні гілки з багатьма відгалуженнями, на яких лежить сніг
function drawBareTree(g, x, v, season) {
  const base = LAYOUT.horizonY + 8, top = base - 28;
  g.globalAlpha = 0.24; R(g, x - 24, base, 48, 3, 'd'); g.globalAlpha = 1;
  R(g, x - 5, top, 10, 28, 'd'); R(g, x - 4, top, 8, 28, 'b'); R(g, x - 4, top, 2, 28, 'l'); g.globalAlpha = 0.4; R(g, x + 1, top, 3, 28, 'd'); g.globalAlpha = 1;
  for (let k = 0; k < 7; k++) R(g, x - 3 + (hash2(k, x) % 6), top + 2 + k * 4, 1, 2, 'd');
  R(g, x - 9, base - 3, 18, 4, 'd'); R(g, x - 8, base - 3, 16, 3, 'b'); R(g, x - 12, base - 1, 5, 3, 'd'); R(g, x + 7, base - 1, 5, 3, 'd');
  const seed = x * 7 + v * 13;
  const branch = (bx, by, ang, len, depth) => {
    const ex = Math.round(bx + Math.sin(ang) * len), ey = Math.round(by - Math.cos(ang) * len);
    lineG(g, bx, by, ex, ey, depth <= 1 ? 'd' : 'b');
    if (depth <= 1) { lineG(g, bx + 1, by, ex + 1, ey, 'd'); if (depth === 0) lineG(g, bx - 1, by, ex - 1, ey, 'b'); }                  // товсті гілки
    const midx = Math.round((bx + ex) / 2), midy = Math.round((by + ey) / 2);
    if (depth <= 2 && Math.abs(Math.sin(ang)) > 0.3) { R(g, midx - 2, midy - 1, 5, 1, 'w'); R(g, midx - 1, midy - 2, 3, 1, 'w'); }        // сніг лежить на похилих гілках
    if (depth >= 3) { R(g, ex - 1, ey - 2, 3, 2, 'w'); return; }                                                                            // кінчик гілочки зі сніжком
    const kids = depth === 0 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const h = hash2(seed + depth * 31 + k * 7, bx + by);
      const da = (k - (kids - 1) / 2) * (0.75 + (h % 30) / 100) + ((h >>> 5) % 20 - 10) / 60;
      branch(ex, ey, ang + da, len * (0.68 + (h % 12) / 100), depth + 1);
    }
  };
  [-1.15, -0.6, 0, 0.6, 1.15].forEach((a, i) => branch(x + (i % 2 ? 1 : 0), top + (i === 2 ? 0 : 4 + (i % 2) * 4), a, i === 2 ? 22 : 18, 0));
  R(g, x - 5, top - 1, 11, 2, 'w'); R(g, x - 14, base - 2, 28, 4, 'w'); R(g, x - 10, base - 5, 20, 3, 'w'); R(g, x - 6, base - 7, 12, 2, 'w'); R(g, x - 16, base, 6, 2, 'w'); R(g, x + 11, base, 6, 2, 'w');   // кучугури біля стовбура
}

/* ---------- Хелловін: гірлянда й скелет на будинку ---------- */
const SKEL_ROWS = [
  '..wwwww..',
  '.wwwwwww.',
  '.wkkwkkw.',
  '.wwwkwww.',
  '..wwwww..',
  '..wkwkw..',
  '....w....',
  '.wwwwwww.',
  'w.wkwkw.w',
  'w.wwwww.w',
  'w.wkwkw.w',
  '.w..w..w.',
  '..wwwww..',
  '..ww.ww..',
  '..w...w..',
  '..w...w..',
  '.ww...ww.'];
function skelFig(g, x, y, rows) {                                                    // скелет із чорним контуром, кістки світліють зліва
  const on = (c, r) => !!(rows[r] && rows[r][c] && rows[r][c] !== '.');
  for (let r = -1; r <= rows.length; r++) for (let c = -1; c <= 9; c++) { if (on(c, r)) continue; if (on(c - 1, r) || on(c + 1, r) || on(c, r - 1) || on(c, r + 1)) R(g, x + c, y + r, 1, 1, 'd'); }
  rows.forEach((row, r) => { for (let c = 0; c < row.length; c++) { const ch = row[c]; if (ch !== '.') R(g, x + c, y + r, 1, 1, ch === 'k' ? 'k' : (c >= 6 ? 'E' : 'w')); } });
}
function webG(g, x, y, dirX) {                                                       // павутиння в кутку: промені й дужки
  g.globalAlpha = 0.85;
  const L = (x1, y1, x2, y2) => lineG(g, x + dirX * x1, y + y1, x + dirX * x2, y + y2, 'w');
  L(0, 0, 14, 0); L(0, 0, 0, 14); L(0, 0, 10, 10);
  [4, 7, 10].forEach(r => { const d = Math.round(r * 0.7); L(r, 0, d, d); L(d, d, 0, r); });
  g.globalAlpha = 1;
}
function drawHalloweenHouse(g, spec) {
  const { x, w } = spec, top = LAYOUT.horizonY - spec.h, hs = hash2(x + 3, 9), kind = hs % 5;
  // гірлянда з помаранчевих і фіолетових вогників під дахом
  for (let gx = x + 1; gx < x + w - 1; gx++) {
    const sag = Math.round(2 * Math.sin((gx - x) / (w - 2) * Math.PI));
    R(g, gx, top + 1 + sag, 1, 1, 'd');
    if ((gx - x) % 4 === 2) R(g, gx, top + 2 + sag, 2, 2, ['o', 'u', 'y'][((gx - x) >> 2) % 3]);
  }
  const roomy = spec.h >= 40 && w >= 36;
  if ((kind === 0 || kind === 4) && roomy) {                                         // скелет висить на мотузці з карниза
    const sx = x + w - 13, sy = top + 7;
    R(g, sx + 4, sy - 7, 1, 7, 'd'); skelFig(g, sx, sy, SKEL_ROWS);
  } else if (kind === 1 && roomy) {                                                  // скелет сидить на краю даху, ноги звисають
    const sx = x + 6; skelFig(g, sx, top - 13, SKEL_ROWS);
    R(g, sx + 10, top - 7, 5, 4, 'd'); R(g, sx + 11, top - 6, 3, 2, 'o'); R(g, sx + 12, top - 8, 1, 1, 'g');         // гарбуз поруч
  }
  if (kind === 2 || kind === 4) {                                                    // павутиння в кутку й павучок на нитці
    webG(g, x + 1, top + 3, 1);
    const spx = x + 9; R(g, spx, top + 4, 1, 9, 'w'); R(g, spx - 1, top + 13, 3, 2, 'k'); R(g, spx - 2, top + 14, 1, 1, 'k'); R(g, spx + 2, top + 14, 1, 1, 'k'); R(g, spx - 1, top + 12, 1, 1, 'r'); R(g, spx + 1, top + 12, 1, 1, 'r');
  }
  if (kind === 3 || (kind === 0 && !roomy)) {                                        // кажани висять догори ногами під карнизом
    [x + 8, x + (w >> 1), x + w - 12].forEach((bx, i) => { if (i === 1 && w < 44) return; R(g, bx, top + 3, 1, 2, 'd'); R(g, bx - 1, top + 5, 3, 3, 'k'); R(g, bx - 2, top + 6, 1, 2, 'k'); R(g, bx + 2, top + 6, 1, 2, 'k'); R(g, bx - 1, top + 6, 1, 1, 'r'); R(g, bx + 1, top + 6, 1, 1, 'r'); });
  }
}

/* ---------- Речі біля магазину (залежать від ширини будівлі) ---------- */
function buildPropsLayer() {
  const { c, g } = newLayer();
  lampXs = lampPositions();
  lampXs.forEach(x => drawLamp(g, x));
  return c;
}

