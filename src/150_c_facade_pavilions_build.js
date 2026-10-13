//#part 150_c_facade_pavilions_build.js
// Сніг на даху: верхні два пікселі кожного стовпчика даху стають білими (тонкі стовпчики — прапори, антени — не чіпаємо)
function snowCap(c, maxY) {
  const g = c.getContext('2d');
  const W = c.width, img = g.getImageData(0, 0, W, maxY), d = img.data;
  const has = (x, y) => x >= 0 && x < W && d[(y * W + x) * 4 + 3] > 0;
  for (let x = 0; x < W; x++) {
    let y0 = -1;
    for (let y = 0; y < maxY; y++) if (has(x, y)) { y0 = y; break; }
    if (y0 < 0 || (!has(x - 1, y0) && !has(x + 1, y0))) continue;
    const depth = 4 + (((x * 7) ^ (x >> 2)) % 3);                                            // нерівна шапка снігу: 4–6 рядків
    const cols = [[255, 255, 255], [248, 251, 255], [236, 244, 253], [220, 233, 249], [204, 220, 242], [188, 207, 234]];
    for (let k = 0; k < depth; k++) { if (y0 + k < maxY) { const i = ((y0 + k) * W + x) * 4, col = cols[Math.min(cols.length - 1, k)]; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; } }
  }
  g.putImageData(img, 0, 0);
}

// Будує спрайт магазину рівня level: back — інтер'єр (поверхи, стелажі, ескалатори), front — фасад зі склом.
// Покупці гуляють між ними. Повертає canvas (back+front разом) і геометрію.

/* ---------- Павільйони на поверхах: одяг, іграшки, техніка, книжки, прикраси й рослини під тему епохи ----------
   Кожен павільйон — крамничка в крамниці: задня стінка, навіс і товари. Поки відділ не куплено — павільйон зачинений
   (жалюзі й папірець), а що вищий рівень відділу, то повніший: більше речей, на верхньому рівні з'являються прикраси. */
const PAV_SEQ = [
  ['clothes', 'books', 'toys', 'jewel', 'clothes', 'plants'],
  ['clothes', 'toys', 'tech', 'books', 'clothes', 'jewel'],
  ['clothes', 'jewel', 'tech', 'clothes', 'books', 'toys'],
  ['tech', 'clothes', 'toys', 'tech', 'clothes', 'books'],
  ['tech', 'clothes', 'tech', 'books', 'clothes', 'toys'],
  ['plants', 'clothes', 'books', 'plants', 'toys', 'clothes'],
  ['tech', 'clothes', 'toys', 'tech', 'jewel', 'clothes'],
  ['tech', 'clothes', 'jewel', 'tech', 'clothes', 'toys']
];
const PAV_PAL = [['r', 'h', 'n', 'g'], ['p', 'q', 'T', 'y'], ['f', 'y', 'u', 'T'], ['T', 'f', 'v', 'y'], ['n', 'S', 'w', 'e'], ['g', 'm', 'c', 'y'], ['w', 'S', 'e', 'r'], ['f', 'T', 'v', 'w']];
const PAV_BACK = ['W', 'q', 'P', 'V', 'S', 'm', 'n', 'V'];
const PAV_CANOPY = [['r', 'w'], ['p', 'w'], ['f', 'y'], ['T', 'f'], ['n', 'w'], ['g', 'y'], ['e', 'w'], ['f', 'T']];
const PAV_TECH = [                                   // по одному пристрою на епоху: глобус, телевізор, колонка, автомат, ноутбук, лампа, робот, голограма
  ['..ddddd..', '.dsssggd.', 'dsgsssgsd', 'dsssggsgd', 'dgsssssgd', '.dsgsssd.', '..ddddd..', '...hhh...', '..hhhhh..'],
  ['..d...d...', '...d.d....', 'dddddddddd', 'dSSSSSSdhd', 'dSwwSSSddd', 'dSwwSSSdfd', 'dSSSSSSdhd', 'dddddddddd', '.d......d.'],
  ['dddddddd', 'dEEEEEEd', 'dEddddEd', 'dEdwwdEd', 'dEddddEd', 'dEEEEEEd', 'dEddddEd', 'dEdwwdEd', 'dEddddEd', 'dddddddd'],
  ['.dddddd.', 'dvvvvvvd', 'dkSSSSkd', 'dkSfSTkd', 'dkSSSSkd', 'dvvvvvvd', 'dvyvrvvd', 'dvvvvvvd', 'dvvvvvvd', 'dddddddd'],
  ['.dddddddd.', '.dSSSSSSd.', '.dSnnnSSd.', '.dSSSSSSd.', '.dddddddd.', 'dEEEEEEEEd', 'dddddddddd'],
  ['..dddd..', '.dyyyyd.', 'dyywwyyd', 'dywyyyyd', '.dyyyyd.', '..dggd..', '..dggd..', '...dd...'],
  ['...dd...', '...ee...', '.dddddd.', 'deSSSSed', 'deSkkSed', 'deSSSSed', '.dddddd.', '.deeeed.', 'dedeeded', '.dd..dd.'],
  ['..TTTT..', '.TffffT.', 'TfwwwwfT', 'TfwTTwfT', 'TfwwwwfT', '.TffffT.', '..TTTT..', '...dd...', '..dddd..']
];
function artG(g, x, y, rows) { rows.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] !== '.') R(g, x + rx, y + ry, 1, 1, row[rx]); }); }
function garmentG(g, x, y, c, acc, len, dress) {      // речі на вішалці: кофтинка або сукня
  R(g, x + 2, y - 1, 1, 1, 'd');
  R(g, x, y, 5, 2, c); R(g, x + 1, y + 2, 3, len - 2, c);
  if (len > 4) { R(g, x, y + 2, 1, 2, c); R(g, x + 4, y + 2, 1, 2, c); }
  if (dress) R(g, x, y + len - 2, 5, 2, c);
  R(g, x + 2, y, 1, 1, 'd'); R(g, x + 1, y + 3, 3, 1, acc);
}
function mannequinG(g, x, base, ia, c, acc, ep) {     // манекен у вбранні епохи
  const th = ia >= 18 ? 8 : 5, pole = ia >= 18 ? 4 : 2;
  R(g, x, base, 6, 1, 'd'); R(g, x + 2, base - pole, 2, pole, 'd');
  R(g, x, base - pole - th, 6, th, c); R(g, x, base - pole - th, 1, th, 'd'); R(g, x + 5, base - pole - th, 1, th, 'd'); R(g, x + 1, base - pole - th, 4, 1, 'w');
  R(g, x + 1, base - pole - th + 3, 4, 1, acc);
  const hy = base - pole - th - 5; R(g, x + 2, hy + 3, 2, 1, 'c'); R(g, x + 1, hy, 4, 3, 'c'); R(g, x + 1, hy, 4, 1, 'W');
  switch (ep) {                                                       // що на голові в цій епосі
    case 0: R(g, x, hy - 1, 6, 1, 'r'); R(g, x + 1, hy - 2, 3, 1, 'r'); R(g, x + 4, hy - 4, 1, 3, 'y'); break;
    case 1: R(g, x + 1, hy - 1, 4, 1, 'p'); R(g, x + 4, hy - 2, 2, 1, 'p'); break;
    case 2: R(g, x, hy - 2, 6, 2, 'f'); R(g, x + 1, hy + 1, 4, 1, 'k'); break;
    case 3: R(g, x, hy - 1, 6, 1, 'T'); R(g, x + 4, hy, 3, 1, 'T'); break;
    case 4: R(g, x, hy - 1, 6, 1, 'd'); R(g, x, hy, 1, 3, 'd'); R(g, x + 5, hy, 1, 3, 'd'); break;
    case 5: R(g, x + 1, hy - 1, 4, 1, 'g'); R(g, x + 3, hy - 2, 2, 1, 'g'); R(g, x + 1, hy - 2, 1, 1, 'p'); break;
    case 6: R(g, x, hy - 1, 6, 5, 'S'); R(g, x + 1, hy - 2, 4, 1, 'S'); R(g, x + 1, hy - 1, 2, 1, 'w'); R(g, x + 1, hy + 1, 4, 2, 'c'); break;
    case 7: R(g, x, hy + 1, 6, 1, 'T'); R(g, x + 1, hy + 1, 4, 1, 'f'); break;
  }
}
function pavilionG(g, kind, x, fy, w, hF, ep, tier, slot) {
  const H = Math.max(18, Math.min(hF - 5, 27)), y0 = fy - H, pal = PAV_PAL[ep], cn = PAV_CANOPY[ep];
  const top = y0 + 4, base = fy - 2, ia = base - top, cx = x + (w >> 1);
  R(g, x, y0 + 3, w, H - 3, PAV_BACK[ep]); R(g, x, y0 + 3, 1, H - 3, 'd'); R(g, x + w - 1, y0 + 3, 1, H - 3, 'd');
  g.globalAlpha = 0.18; R(g, x + 1, y0 + 4, w - 2, 2, 'd'); g.globalAlpha = 1;                                  // тінь під навісом
  for (let k = 0; k < w + 2; k++) R(g, x - 1 + k, y0, 1, 3, (k >> 2) % 2 ? cn[1] : cn[0]);                          // навіс у смужку
  R(g, x - 1, y0, w + 2, 1, 'd'); R(g, x - 1, y0 + 3, w + 2, 1, 'd');
  for (let k = 0; k < w + 2; k += 4) R(g, x - 1 + k + 1, y0 + 4, 2, 1, (k >> 2) % 2 ? cn[1] : cn[0]);           // зубчики
  R(g, x + 1, base + 1, w - 2, 1, 'E');                                                                         // килимок
  if (tier <= 0) {                                                                                              // зачинено: жалюзі й папірець
    R(g, x + 1, top + 1, w - 2, ia - 1, 'e'); for (let yy = top + 2; yy < base; yy += 2) R(g, x + 1, yy, w - 2, 1, 'E');
    R(g, cx - 3, top + 4, 7, Math.min(9, ia - 6), 'w'); R(g, cx - 3, top + 4, 7, 1, 'd'); R(g, cx - 1, top + 6, 3, 1, 'r'); R(g, cx, top + 7, 1, 2, 'r'); R(g, cx, top + 10, 1, 1, 'r');
    return;
  }
  const full = tier >= 3, cnt = tier + 1;                                                                       // повнота: 2, 3 або 4 речі
  switch (kind) {
    case 'clothes': {
      const rw = w - 13, rx = x + 3, len = Math.min(8, ia - 7), pc = Math.min(cnt + 1, Math.floor(rw / 5));
      R(g, rx, top + 1, rw, 1, 'd'); R(g, rx, top + 1, 1, 3, 'd'); R(g, rx + rw - 1, top + 1, 1, 3, 'd');
      for (let k = 0; k < pc; k++) garmentG(g, rx + 1 + Math.round(k * (rw - 6) / Math.max(1, pc - 1)), top + 3, pal[(k + slot) % 4], pal[(k + slot + 2) % 4], len, ep <= 2 && k % 2 === 1);
      R(g, rx, base - 5, rw, 1, 'b');                                                                           // полиця зі складеними речами
      for (let k = 0; k < Math.min(3, tier + 1); k++) { R(g, rx + 1 + k * 7, base - 7, 6, 2, pal[(k + 1) % 4]); R(g, rx + 1 + k * 7, base - 7, 6, 1, 'w'); }
      mannequinG(g, x + w - 9, base, ia, pal[(slot + 1) % 4], pal[(slot + 3) % 4], ep);
      if (full) { R(g, x + w - 8, top, 1, 1, 'y'); R(g, x + 3, top - 0, 1, 1, 'y'); }
      break;
    }
    case 'toys': {
      R(g, x + 2, base - 8, w - 4, 1, 'b');
      R(g, x + 3, base - 8 - 7, 8, 6, 'l'); R(g, x + 3, base - 8 - 9, 2, 2, 'l'); R(g, x + 9, base - 8 - 9, 2, 2, 'l'); R(g, x + 5, base - 8 - 5, 4, 3, 'c'); R(g, x + 5, base - 8 - 5, 4, 1, 'k'); R(g, x + 4, base - 8 - 6, 1, 1, 'k'); R(g, x + 9, base - 8 - 6, 1, 1, 'k');
      if (cnt >= 3) { R(g, x + 14, base - 8 - 4, 4, 4, pal[0]); R(g, x + 19, base - 8 - 4, 4, 4, pal[2]); R(g, x + 16, base - 8 - 8, 4, 4, pal[1]); }
      if (cnt >= 4) { R(g, x + 3, base - 3, 7, 2, pal[3]); R(g, x + 4, base - 1, 2, 1, 'd'); R(g, x + 8, base - 1, 2, 1, 'd'); disc(g, x + w - 8, base - 3, 2, 'r'); }
      if (full) { [[w - 6, 'f'], [w - 11, 'y'], [w - 16, 'T']].forEach(([bx, c]) => { R(g, x + bx, top + 1, 1, 6, 'd'); disc(g, x + bx, top + 1, 2, c); }); }
      break;
    }
    case 'tech': {
      const art = PAV_TECH[ep], aw = art[0].length, ah = art.length, shelfY = base - 5;
      R(g, x + 2, shelfY, w - 4, 1, 'b'); R(g, x + 2, shelfY + 1, w - 4, 1, 'd');
      artG(g, Math.round(cx - aw / 2), shelfY - ah, art);
      if (cnt >= 3) { artG(g, x + 3, shelfY - 5, ['dddd', 'dSSd', 'dSSd', 'dddd']); }
      if (cnt >= 4) { artG(g, x + w - 7, shelfY - 5, ['dddd', 'dyyd', 'dyyd', 'dddd']); }
      if (full) { R(g, x + 2, top + 1, 1, 1, 'w'); R(g, x + w - 3, top + 2, 1, 1, 'y'); R(g, x + (w >> 1), top, 1, 1, 'w'); }
      break;
    }
    case 'books': {
      const rows = Math.min(3, Math.max(1, Math.floor(ia / 6))), cols = ['r', 'n', 'g', 'y', 'u', 'o', 'p', 'T'];
      for (let r = 0; r < rows; r++) {
        const ry = base - 1 - r * 6; R(g, x + 2, ry, w - 4, 1, 'b');
        const nb = Math.min(Math.floor((w - 6) / 3), 2 + tier * (r === 0 ? 3 : 2));
        for (let k = 0; k < nb; k++) { const bh = 3 + ((k * 5 + r * 3 + slot) % 3); R(g, x + 3 + k * 3, ry - bh, 2, bh, cols[(k + r * 3 + slot) % 8]); R(g, x + 3 + k * 3, ry - bh, 2, 1, 'w'); }
      }
      break;
    }
    case 'jewel': {
      R(g, x + 3, base - 6, w - 6, 6, 'P'); R(g, x + 3, base - 6, w - 6, 1, 'u'); R(g, x + 3, base - 1, w - 6, 1, 'd');
      g.globalAlpha = 0.55; R(g, x + 3, base - 10, w - 6, 4, 'S'); g.globalAlpha = 1; R(g, x + 3, base - 10, w - 6, 1, 'w');
      const gcol = ['f', 's', 'y', 'm', 'r', 'u'];
      for (let k = 0; k < Math.min(cnt + 1, Math.floor((w - 10) / 4)); k++) { R(g, x + 5 + k * 4, base - 9, 2, 2, gcol[(k + slot) % 6]); R(g, x + 5 + k * 4, base - 9, 1, 1, 'w'); }
      if (tier >= 2) { R(g, cx - 3, top + 2, 1, 4, 'h'); R(g, cx + 3, top + 2, 1, 4, 'h'); R(g, cx - 3, top + 6, 7, 1, 'h'); R(g, cx, top + 7, 1, 2, 'f'); }
      if (full) { R(g, x + w - 11, base - 14, 7, 3, 'h'); R(g, x + w - 11, base - 16, 1, 2, 'h'); R(g, x + w - 8, base - 16, 1, 2, 'h'); R(g, x + w - 5, base - 16, 1, 2, 'h'); R(g, x + w - 8, base - 13, 1, 1, 'f'); }
      break;
    }
    case 'cafe': {                                                                                              // кав'ярня: меню, кавоварка, вітрина з тістечками
      R(g, x + 4, top + 1, w - 8, 8, 'd'); R(g, x + 5, top + 2, w - 10, 6, 'k');
      for (let k = 0; k < 3; k++) { R(g, x + 7, top + 3 + k * 2, 10 + (k % 2) * 4, 1, 'w'); R(g, x + w - 14, top + 3 + k * 2, 5, 1, 'y'); }
      R(g, x + 2, base - 8, w - 4, 8, 'b'); R(g, x + 2, base - 8, w - 4, 1, 'l'); R(g, x + 2, base - 1, w - 4, 1, 'd');
      for (let k = x + 4; k < x + w - 4; k += 4) R(g, k, base - 6, 1, 4, 'd');
      R(g, x + 5, base - 16, 9, 8, 'e'); R(g, x + 5, base - 16, 9, 1, 'E'); R(g, x + 7, base - 14, 3, 2, 'd'); R(g, x + 11, base - 14, 1, 1, 'r'); R(g, x + 8, base - 11, 3, 3, 'd'); R(g, x + 8, base - 10, 3, 2, 'w');
      for (let k = 0; k < 3; k++) { R(g, x + 17 + k * 4, base - 10, 3, 2, 'w'); R(g, x + 20 + k * 4, base - 10, 1, 1, 'w'); }
      g.globalAlpha = 0.5; R(g, x + w - 15, base - 15, 11, 7, 'S'); g.globalAlpha = 1; R(g, x + w - 15, base - 15, 11, 1, 'w');
      R(g, x + w - 13, base - 11, 3, 3, 'p'); R(g, x + w - 13, base - 11, 3, 1, 'w'); R(g, x + w - 9, base - 11, 3, 3, 'o'); R(g, x + w - 9, base - 11, 3, 1, 'y');
      break;
    }
    case 'plants': {
      R(g, x + 2, base - 8, w - 4, 1, 'b');
      const np = Math.min(cnt + 1, Math.floor((w - 4) / 8));
      for (let k = 0; k < np; k++) { const px = x + 3 + k * 8; potG(g, px, base - 8 - 8, ['p', 'y', 'f', 'o'][(k + slot) % 4]); }
      for (let k = 0; k < Math.min(3, cnt); k++) { const px = x + 4 + k * 9; R(g, px, base - 5, 6, 5, 'd'); R(g, px + 1, base - 5, 4, 4, 't'); R(g, px + 1, base - 9, 4, 4, 'g'); R(g, px + 2, base - 10, 2, 1, ['p', 'y', 'f'][(k + slot) % 3]); }
      break;
    }
  }
}
function boxG(g, x, y, c1, c2) { R(g, x, y, 14, 4, 'd'); R(g, x + 1, y + 1, 12, 3, 'b'); for (let k = 0; k < 6; k++) { R(g, x + 1 + k * 2, y - 2 + (k % 2), 1, 2, [c1, c2, 'y'][k % 3]); R(g, x + 2 + k * 2, y - 1, 1, 1, 'g'); } }
const MINI_FONT = { C: ['.###', '#...', '#...', '#...', '.###'], I: ['###', '.#.', '.#.', '.#.', '###'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'], E: ['###', '#..', '##.', '#..', '###'], M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], A: ['.##.', '#..#', '####', '#..#', '#..#'], O: ['.##.', '#..#', '#..#', '#..#', '.##.'], P: ['###.', '#..#', '###.', '#...', '#...'] };
function pixText(g, x, y, str, col, shadow) {                   // 5-піксельні літери; shadow — тінь праворуч-вниз
  let cx = x;
  [...str].forEach(ch => { const gl = MINI_FONT[ch]; if (!gl) return; gl.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') { if (shadow) R(g, cx + i + 1, y + j + 1, 1, 1, shadow); } }); gl.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') R(g, cx + i, y + j, 1, 1, col); }); cx += gl[0].length + 1; });
  return cx - x;
}
// Рухоме «кіно» на екрані кінозалу: чотири сцени змінюють одна одну, з легким мерехтінням плівки
function drawCinemaMovie() {
  const sc = shop && shop.cinema; if (!sc || !animOn()) return;
  const t = animClock, k = Math.floor(t / 5) % 4, u = (t % 5), x0 = shop.x + sc.x, y0 = shop.y + sc.y, W = sc.w, H = sc.h;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, W, H); ctx.clip();
  const Rr = (x, y, w, h, c) => R(ctx, x0 + Math.round(x), y0 + Math.round(y), w, h, c);
  if (k === 0) {                                                // дорога крізь пустелю: сонце, пагорби, біжить звірятко
    Rr(0, 0, W, H, 's'); Rr(0, 0, W, 4, 'S'); disc(ctx, x0 + W - 24, y0 + 4, 3, 'y');
    for (let i = 0; i < 6; i++) { const hx = ((i * 48 - t * 14) % (W + 48) + W + 48) % (W + 48) - 24; Rr(hx, H - 6, 22, 3, 'o'); Rr(hx + 4, H - 8, 14, 2, 'o'); }
    Rr(0, H - 3, W, 3, 'c'); for (let i = 0; i < 10; i++) Rr(((i * 30 - t * 40) % W + W) % W, H - 2, 8, 1, 'w');
    const bx = W * 0.45, by = H - 6 - (Math.floor(t * 8) % 2); Rr(bx, by, 7, 4, 'l'); Rr(bx + 5, by - 1, 3, 3, 'l'); Rr(bx + 7, by, 1, 1, 'k'); Rr(bx + 1, by + 4, 1, 1, 'd'); Rr(bx + 5, by + 4, 1, 1, 'd');
  } else if (k === 1) {                                         // космос: зірки пролітають, ракета й планета
    Rr(0, 0, W, H, 'z');
    for (let i = 0; i < 26; i++) { const sx = ((i * 37 - t * (10 + (i % 3) * 8)) % W + W) % W; Rr(sx, (i * 7) % H, 1, 1, i % 3 ? 'w' : 'y'); }
    disc(ctx, x0 + W * 0.78, y0 + H * 0.55, 5, 'u'); Rr(W * 0.78 - 7, H * 0.55 - 1, 14, 1, 'v');
    const rx = (t * 26) % (W + 30) - 15, ry = H * 0.4 + Math.sin(t * 3) * 2; Rr(rx, ry, 9, 3, 'w'); Rr(rx + 9, ry, 2, 3, 'r'); Rr(rx - 4 - (Math.floor(t * 10) % 3), ry + 1, 4, 1, 'o');
  } else if (k === 2) {                                         // нічне місто: місяць, будинки, їде машина
    Rr(0, 0, W, H, 'V'); disc(ctx, x0 + 20, y0 + 4, 3, 'w');
    for (let i = 0; i < 9; i++) { const bx = ((i * 26 - t * 8) % (W + 26) + W + 26) % (W + 26) - 13, bh = 4 + (i * 5) % 6; Rr(bx, H - bh - 2, 12, bh, 'z'); for (let w = 0; w < 3; w++) if ((i + w) % 2) Rr(bx + 2 + w * 3, H - bh, 1, 1, 'y'); }
    Rr(0, H - 2, W, 2, 'k'); const cx = (t * 36) % (W + 20) - 10; Rr(cx, H - 5, 8, 3, 'r'); Rr(cx + 2, H - 7, 4, 2, 'r'); Rr(cx + 1, H - 3, 2, 1, 'k'); Rr(cx + 5, H - 3, 2, 1, 'k'); Rr(cx + 8, H - 4, 1, 1, 'y');
  } else {                                                      // море: хвилі, човник
    Rr(0, 0, W, H, 'S'); Rr(0, 0, W, 3, 's'); disc(ctx, x0 + W * 0.2, y0 + 3, 2, 'y');
    Rr(0, 6, W, H - 6, 'n'); for (let i = 0; i < 14; i++) { const wx = ((i * 16 - t * 18) % W + W) % W; Rr(wx, 7 + (i % 3) * 2, 6, 1, 'a'); }
    const bx = W * 0.55 + Math.sin(t * 1.5) * 6, by = 4 + Math.sin(t * 3) * 1; Rr(bx, by + 2, 11, 2, 'r'); Rr(bx + 5, by - 3, 1, 5, 'd'); Rr(bx + 6, by - 3, 4, 4, 'w');
  }
  ctx.globalAlpha = 0.1 + 0.025 * Math.sin(t * 11); R(ctx, x0, y0, W, H, 'w'); ctx.globalAlpha = 1;      // мерехтіння плівки
  if (u < 0.35) { ctx.globalAlpha = 1 - u / 0.35; R(ctx, x0, y0, W, H, 'k'); ctx.globalAlpha = 1; }          // затемнення між сценами
  Rr(Math.floor(((t * 53) % 1) * W), 0, 1, H, 'w'); ctx.globalAlpha = 0.5; Rr(0, 0, 3, H, 'k'); Rr(W - 3, 0, 3, H, 'k'); ctx.globalAlpha = 1;   // рівні краї «кіноплівки»
  ctx.restore();
}
function openSignG(g, yG) {                                                      // неонова вивіска OPEN у вітрині: малюється ПІСЛЯ всього декору, тож її ніщо не закриває
  const ox = 14, oy = yG + 17;
  R(g, ox + 3, oy - 6, 1, 4, 'd'); R(g, ox + 18, oy - 6, 1, 4, 'd');                  // ланцюжки, на яких вона висить
  R(g, ox - 2, oy - 2, 24, 10, 'k'); R(g, ox - 1, oy - 1, 22, 8, 'z'); R(g, ox - 2, oy - 2, 24, 1, 'f'); pixText(g, ox + 1, oy, 'OPEN', 'f', null); glassRects.push([ox - 1, oy - 1, 22, 8]);
}
function modernG(g, level, w, h, yG, door, look, yB) {
  const base = h - 7, L = 12, Rt = w - 33, ep = viewEpoch() % EPOCHS.length;
  if (level > 5) return;
  if (ep === 0) {                                                               // Відродження: дерев'яні ящики з квітами під вітринами
    [[L, 'p'], [Rt + 14, 'y']].forEach(([x, c]) => { R(g, x, base - 4, 17, 5, 'd'); R(g, x + 1, base - 3, 15, 3, 'b'); for (let i = 0; i < 7; i++) { R(g, x + 2 + i * 2, base - 7 + (i % 2), 2, 3, i % 2 ? c : 'q'); R(g, x + 2 + i * 2, base - 5, 1, 1, 'g'); } });
    return;
  }
  // охоронна камера на куті вивіски
  R(g, w - 12, look.top + 26, 6, 1, 'd'); R(g, w - 14, look.top + 27, 8, 3, 'E'); R(g, w - 14, look.top + 27, 8, 1, 'w'); R(g, w - 8, look.top + 28, 2, 2, 'k'); R(g, w - 7, look.top + 28, 1, 1, 'r');
  if (level >= 2 && level <= 4) {                                               // автомат із напоями
    const vx = Rt, vy = base - 19; R(g, vx, vy, 12, 19, 'd'); R(g, vx + 1, vy + 1, 10, 17, 'n'); R(g, vx + 2, vy + 2, 7, 11, 'k'); R(g, vx + 3, vy + 3, 5, 9, 'S');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) R(g, vx + 3 + c * 3, vy + 4 + r * 3, 2, 2, ['r', 'y', 'g', 'p', 'o', 'T'][(r * 2 + c) % 6]);
    R(g, vx + 9, vy + 3, 1, 3, 'y'); R(g, vx + 2, vy + 14, 8, 2, 'k'); glassRects.push([vx + 3, vy + 3, 5, 9]);
  }
  if (level >= 3 && level <= 5) {                                               // банкомат
    const ax = L, ay = base - 16; R(g, ax, ay, 10, 16, 'd'); R(g, ax + 1, ay + 1, 8, 14, 'e'); R(g, ax + 2, ay + 2, 6, 4, 'k'); R(g, ax + 3, ay + 3, 4, 2, 'g'); R(g, ax + 2, ay + 8, 6, 4, 'E'); for (let i = 0; i < 3; i++) R(g, ax + 3 + i * 2, ay + 9, 1, 1, 'd'); R(g, ax + 2, ay + 13, 6, 1, 'k'); glassRects.push([ax + 3, ay + 3, 4, 2]);
    R(g, ax + 1, ay - 3, 8, 3, 'd'); R(g, ax + 2, ay - 2, 6, 1, 'y');
  }
  if (level >= 3) { for (let x = 14; x < w - 14; x += 4) R(g, x, yB + 1, 2, 1, [ 'y', 'f', 'T', 'w' ][(x >> 2) % 4]); }       // світлодіодна стрічка під вивіскою
  if (level >= 4) {                                                             // цифровий екран біля входу
    const sx = door.x + door.w + 9, sy = yG + 15; R(g, sx, sy, 15, 11, 'd'); R(g, sx + 1, sy + 1, 13, 9, 'k'); R(g, sx + 2, sy + 2, 4, 3, 'T'); R(g, sx + 7, sy + 2, 6, 1, 'w'); R(g, sx + 7, sy + 4, 5, 1, 'y'); R(g, sx + 2, sy + 6, 11, 1, 'f'); R(g, sx + 2, sy + 8, 7, 1, 'w'); glassRects.push([sx + 1, sy + 1, 13, 9]);
  }
  if (level === 5) {                                                            // зарядка для електрокарів
    const ex = Rt + 16, ey = base - 15; R(g, ex, ey, 6, 15, 'd'); R(g, ex + 1, ey + 1, 4, 13, 'w'); R(g, ex + 1, ey + 2, 4, 4, 'k'); R(g, ex + 2, ey + 3, 2, 2, 'g'); R(g, ex + 6, ey + 6, 3, 1, 'k'); R(g, ex + 8, ey + 6, 1, 6, 'k'); glassRects.push([ex + 2, ey + 3, 2, 2]);
  }
}
function roofTopOf(cv, w) {                                          // рядок, де біля центру починається дах (на нього ставимо годинникову вежу)
  try { const x0 = Math.max(0, (w >> 1) - 20), n = Math.min(40, w - x0), d = cv.getContext('2d').getImageData(x0, 0, n, Math.min(70, cv.height)).data; for (let y = 0; y < Math.min(70, cv.height); y++) for (let x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3] > 40) return y; } catch (e) { /* без цього теж працює */ }
  return 0;
}
function buildShopCanvas(level, tiers) {
  glassRects = []; skinGlints = [];
  const shelfLights = [];            // де стоять прилавки (вночі над ними м'яке тепле світло)
  const skinShop = SHOP_SKINS[skinOn('shop')] || null, es = Object.assign({}, epochShopStyle(), skinShop || {}), look0 = SHOP_LOOK[level - 1];
  const look = Object.assign({}, look0, { trim: es.trim || look0.trim, roof: es.flat ? FLAT_ROOF[level - 1] : (es.roofs ? es.roofs[level - 1] : look0.roof), inner: es.inner || look0.inner });
  if (look.roof === 4) look.top += 12;                  // під годинниковою вежею вивіска не накриває циферблат
  const w = look.w, trim = look.trim, F = look.floors.length, up = F - 1;
  const yB = look.top + 25;          // тут закінчується вивіска
  const yG = yB + FLOOR_H * up;      // тут починається нижній поверх (навіс)
  const h = yG + 41;
  const mk = () => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
  const back = mk(), front = mk(), canvas = mk();
  const b = back.getContext('2d'); let g = front.getContext('2d');
  const innerX = 8, innerW = w - 16;

  // --- геометрія поверхів: top — стеля, fy — підлога (де стоять ноги)
  const floors = look.floors.map((nb, f) => f === 0
    ? { f, bays: nb, top: yG + 11, fy: h - 6 }
    : { f, bays: nb, top: yG - FLOOR_H * f + 3, fy: yG - FLOOR_H * f + FLOOR_H - 3 });
  // --- ескалатори між поверхами (зигзагом: то ліворуч, то праворуч)
  const escalators = [];
  for (let k = 0; k < F - 1; k++) {
    const lo = floors[k], hi = floors[k + 1];
    const rise = lo.fy - hi.fy, run = Math.round(rise * 1.15), left = k % 2 === 0;
    const xLow = left ? innerX + 6 : innerX + innerW - 6;
    escalators.push({ k, lo: k, hi: k + 1, xLow, xHigh: left ? xLow + run : xLow - run, yLow: lo.fy, yHigh: hi.fy, run, rise });
  }
  const doorW = DOOR_WIDTHS[look.door], doorX = Math.round((w - doorW) / 2);
  const door = { x: doorX, w: doorW, y: yG + 13, h: h - 6 - (yG + 13), type: look.door };

  // --- де стоять стелажі на кожному поверсі (в обхід ескалаторів)
  floors.forEach(fl => {
    const blocked = [];
    escalators.forEach(e => {
      const x0 = Math.min(e.xLow, e.xHigh), x1 = Math.max(e.xLow, e.xHigh);
      if (e.lo === fl.f) blocked.push([x0 - 4, x1 + 4]);
      if (e.hi === fl.f) blocked.push(e.xHigh > e.xLow ? [e.xHigh - 14, e.xHigh + 4] : [e.xHigh - 4, e.xHigh + 14]);
    });
    let segs = [[innerX + 2, innerX + innerW - 2]];
    blocked.forEach(bl => {
      const ns = [];
      segs.forEach(sg => { if (bl[1] <= sg[0] || bl[0] >= sg[1]) ns.push(sg); else { if (bl[0] > sg[0]) ns.push([sg[0], bl[0]]); if (bl[1] < sg[1]) ns.push([bl[1], sg[1]]); } });
      segs = ns;
    });
    segs.sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]));
    const seg = segs[0] || [innerX + 2, innerX + innerW - 2];
    fl.seg = seg;
    if (fl.bays < 0) {                                                           // кінозал: екран, завіси, ряди крісел
      fl.cinema = true; fl.xs = [];
      fl.shelves = [seg[0] + 18, Math.round((seg[0] + seg[1]) / 2), seg[1] - 18];
    } else if (!fl.bays) {                                                       // поверх-кафе: столики замість стелажів
      fl.cafe = true; fl.xs = [];
      fl.bar = (seg[1] - seg[0]) >= 190 ? seg[1] - 48 : -1;                       // на широкому поверсі в кінці стоїть кав'ярня з прилавком
      const tEnd = fl.bar >= 0 ? fl.bar - 4 : seg[1];
      const nT = Math.max(2, Math.min(4, Math.floor((tEnd - seg[0]) / 62)));
      fl.tables = placeRow(seg[0], tEnd - seg[0], Array(nT).fill(18));
      fl.shelves = fl.tables.map(x => x + 9);
    } else {
      fl.xs = placeRow(seg[0], seg[1] - seg[0], Array(fl.bays).fill(34));
      fl.shelves = fl.xs.map(x => x + 17);
    }
  });

  /* ========== ІНТЕР'ЄР (back) ========== */
  let bayNo = 0;
  floors.forEach(fl => {
    const hF = fl.fy - fl.top;
    R(b, innerX, fl.top, innerW, hF, fl.cinema ? 'V' : look.inner[fl.f % look.inner.length]);        // стіна (кожен поверх свого кольору; у кінозалі темна)
    b.globalAlpha = 0.12; for (let x = innerX + 3; x < innerX + innerW; x += 6) R(b, x, fl.top, 1, hF, 'e'); b.globalAlpha = 1;
    R(b, innerX, fl.top, innerW, 2, 'E'); R(b, innerX, fl.top + 2, innerW, 1, 'e');   // стеля
    for (let x = innerX + 14; x < innerX + innerW - 8; x += 26) { R(b, x, fl.top + 3, 6, 1, 'd'); R(b, x + 1, fl.top + 4, 4, 1, 'y'); }   // лампи
    R(b, innerX, fl.fy, innerW, 3, 'e'); R(b, innerX, fl.fy, innerW, 1, 'E');                                                              // перекриття
    R(b, innerX + 1, fl.fy - 1, innerW - 2, 1, 'r'); for (let x = innerX + 3; x < innerX + innerW - 3; x += 4) R(b, x, fl.fy - 1, 1, 1, 'h');   // килимова доріжка
    fl.d0 = bayNo * 2;                                                           // перший відділ цього поверху
    fl.xs.forEach(x => { drawShelf(b, x, fl.fy - 20, bayNo++, tiers); shelfLights.push([x, fl.fy - 20]); });
    if (fl.cinema) {                                                             // кінозал: екран (рухома картинка малюється окремо), завіси, крісла й вивіска CINEMA
      const sw = Math.min(innerW - 70, 210), sx = Math.round(innerX + (innerW - sw) / 2), sy = fl.top + 10, sh = 13;
      R(b, sx - 8, fl.top + 3, 7, hF - 4, 'R'); R(b, sx - 6, fl.top + 3, 1, hF - 4, 'r'); R(b, sx - 3, fl.top + 3, 1, hF - 4, 'r');
      R(b, sx + sw + 1, fl.top + 3, 7, hF - 4, 'R'); R(b, sx + sw + 3, fl.top + 3, 1, hF - 4, 'r'); R(b, sx + sw + 6, fl.top + 3, 1, hF - 4, 'r');
      R(b, sx - 2, sy - 2, sw + 4, sh + 4, 'k'); R(b, sx - 1, sy - 1, sw + 2, sh + 2, 'e');
      for (let x = sx; x < sx + sw; x += 5) R(b, x, sy - 2, 2, 1, (x / 5 | 0) % 2 ? 'y' : 'f');
      R(b, sx, sy, sw, sh, 'k');
      fl.screen = { x: sx, y: sy, w: sw, h: sh };
      pixText(b, Math.round(innerX + (innerW - 29) / 2), fl.top + 4, 'CINEMA', 'f', 'k');
      for (let x = fl.seg[0] + 6; x < fl.seg[1] - 8; x += 11) { if (Math.abs(x - (innerX + innerW / 2)) < 7) continue; R(b, x, fl.fy - 9, 8, 6, 'd'); R(b, x + 1, fl.fy - 8, 6, 5, 'R'); R(b, x + 1, fl.fy - 8, 6, 1, 'r'); R(b, x - 1, fl.fy - 6, 1, 4, 'd'); R(b, x + 8, fl.fy - 6, 1, 4, 'd'); }
      glassRects.push([sx - 2, fl.top + 3, 29, 6]);
    }
    if (fl.cafe) {                                                               // кафе: круглі столики, стільці, чашки, підвісні лампи, рослини
      fl.tables.forEach((tx, i) => {
        R(b, tx + 8, fl.top + 3, 1, 6, 'd'); R(b, tx + 4, fl.top + 9, 10, 3, 'h'); R(b, tx + 4, fl.top + 9, 10, 1, 'y'); R(b, tx + 5, fl.top + 12, 8, 1, 'y');
        R(b, tx, fl.fy - 11, 18, 2, 'c'); R(b, tx, fl.fy - 11, 18, 1, 'y'); R(b, tx, fl.fy - 9, 18, 1, 'd');
        R(b, tx + 8, fl.fy - 8, 2, 6, 'd'); R(b, tx + 4, fl.fy - 3, 10, 2, 'd');
        R(b, tx - 5, fl.fy - 8, 4, 2, i % 2 ? 'r' : 'n'); R(b, tx - 5, fl.fy - 6, 1, 5, 'd'); R(b, tx - 2, fl.fy - 6, 1, 5, 'd');
        R(b, tx + 19, fl.fy - 8, 4, 2, i % 2 ? 'n' : 'r'); R(b, tx + 19, fl.fy - 6, 1, 5, 'd'); R(b, tx + 22, fl.fy - 6, 1, 5, 'd');
        R(b, tx + 4, fl.fy - 14, 4, 3, 'w'); R(b, tx + 8, fl.fy - 13, 1, 1, 'w'); R(b, tx + 5, fl.fy - 16 + (i % 2), 1, 2, 'S');
        R(b, tx + 11, fl.fy - 14, 4, 3, i % 2 ? 'p' : 'o'); R(b, tx + 11, fl.fy - 14, 4, 1, 'w');
        shelfLights.push([tx, fl.fy - 20]);
      });
      potG(b, fl.seg[0] + 1, fl.fy - 12, 'g'); potG(b, (fl.bar >= 0 ? fl.bar - 10 : fl.seg[1] - 9), fl.fy - 12, 'p');
      if (fl.bar >= 0) { pavilionG(b, 'cafe', fl.bar, fl.fy, 46, hF, viewEpoch() % EPOCH_SHOP.length, 3, fl.f); shelfLights.push([fl.bar - 2, fl.fy - 22]); }
    }
    // плакати й рослини у вільних місцях
    const seg = fl.seg, gaps = [];
    if (!fl.cafe && !fl.cinema && fl.xs.length) { let pos = seg[0]; fl.xs.forEach(sx => { gaps.push([pos, sx]); pos = sx + 34; }); gaps.push([pos, seg[1]]); }
    let pavNo = 0;
    gaps.forEach((gp, i) => {
      const gw = gp[1] - gp[0];
      if (gw >= 32) {                                                            // у просторі між стелажами — павільйон під тему епохи (його повнота залежить від рівня відділу)
        const pw = Math.min(42, gw - 4), px = Math.round(gp[0] + (gw - pw) / 2), ep = viewEpoch() % EPOCH_SHOP.length;
        const dI = (fl.d0 + (pavNo % Math.max(1, fl.xs.length * 2))) % DEPARTMENTS.length;
        pavilionG(b, PAV_SEQ[ep][(fl.f * 2 + pavNo) % 6], px, fl.fy, pw, hF, ep, (tiers && tiers[dI]) || 0, pavNo + fl.f);
        shelfLights.push([px - 2, fl.fy - 22]);
        pavNo++;
      } else if (gw >= 14) {                                                     // вузьке місце: плакат або рослина
        const fx = (gp[0] + gp[1]) / 2;
        if ((fl.f + i) % 2) potG(b, Math.round(fx) - 3, fl.fy - 12, 'p'); else posterG(b, Math.round(fx) - 4, fl.fy - 17, ['p', 'n', 'g', 'o'][(fl.f + i) % 4]);
      }
    });
    glassRects.push([innerX, fl.top, innerW, hF]);                                // вночі інтер'єр світиться
  });
  escalators.forEach(e => {
    const dir = e.xHigh > e.xLow ? 1 : -1, hi = floors[e.hi];
    const ox = dir > 0 ? e.xHigh - 14 : e.xHigh - 1;
    R(b, ox, hi.fy, 16, 3, 'd');                                                  // отвір у перекритті
    // посадкові майданчики з жовтою смугою безпеки (знизу й нагорі)
    R(b, e.xLow - dir * 3 - (dir > 0 ? 0 : 2), e.yLow, 5, 2, 'y'); R(b, e.xHigh + dir * 1 - (dir > 0 ? 0 : 4), e.yHigh, 5, 2, 'y');
    for (let i = 0; i <= e.run; i++) {
      const x = e.xLow + dir * i, y = e.yLow - Math.round(i * e.rise / e.run);
      R(b, x, y + 3, 1, 5, 'e'); R(b, x, y + 7, 1, 1, 'd');                              // корпус-ферма під сходинками
      R(b, x, y, 1, 1, (i % 4 === 0) ? 'w' : 'l');                                       // світла кромка сходинки
      R(b, x, y + 1, 1, 2, (i % 4 < 2) ? 'e' : 'E');                                    // підступінок і протектор
      R(b, x, y + 2, 1, 1, 'd');
      b.globalAlpha = 0.38; R(b, x, y - 8, 1, 7, 'S'); b.globalAlpha = 0.16; R(b, x, y - 8, 1, 2, 'w'); b.globalAlpha = 1;   // скляна огорожа з відблиском
      R(b, x, y - 10, 1, 1, 'd'); R(b, x, y - 9, 1, 2, (i % 7 === 3) ? 'h' : 'E'); R(b, x, y - 7, 1, 1, 'd');             // товстий поручень (стрічка) з рухомою позначкою
      if (i % 12 === 0) R(b, x, y - 8, 1, 8, 'd');                                      // стійки огорожі
    }
    R(b, e.xLow, e.yLow - 11, 2, 11, 'd'); R(b, e.xLow, e.yLow - 10, 1, 9, 'e'); R(b, e.xHigh - (dir > 0 ? 1 : 0), e.yHigh - 11, 2, 11, 'd'); R(b, e.xHigh - (dir > 0 ? 0 : 0), e.yHigh - 10, 1, 9, 'e');
  });

  /* ========== ФАСАД (front) ========== */
  const arch = skinShop ? null : (ARCH[currentEpoch().id] || null), AC = { es, w, h, look, level, floors, yG, yB, door, innerX, innerW };
  deferSign = true; pendingSign = null;
  if (arch && arch.front) { arch.front(g, AC); deferSign = false; } else {
  withPal(es.roofPal, () => drawRoof(g, look.roof, w, look.top, look));
  deferSign = false;
  corniceG(g, w, look.top + 4, trim);
  bandG(g, w, look.top + 4, es.band && !skinShop ? [['checker', 'dots', 'leaf', 'zig'][(shopVariant(level) + level) % 4], es.band[1]] : es.band);
  const colTop = look.top + 8, colH = h - 6 - colTop;
  [4, w - 8].forEach(cxp => { R(g, cxp - 1, colTop, 5, colH, 'd'); R(g, cxp, colTop, 3, colH, es.col[0]); R(g, cxp, colTop, 1, colH, es.col[1]); R(g, cxp + 2, colTop, 1, colH, 'd'); });
  // вивіска (текст накладається HTML-елементом, щоб був чіткий шрифт)
  R(g, 5, look.top + 8, w - 10, 17, es.frame[0]);
  R(g, 6, look.top + 9, w - 12, 15, es.frame[1]);
  R(g, 7, look.top + 10, w - 14, 13, (skinShop && skinShop.signFill) || currentEpoch().signFill || look.signFill);
  R(g, 5, look.top + 8, 2, 2, 'y'); R(g, w - 7, look.top + 8, 2, 2, 'y'); R(g, 5, look.top + 23, 2, 2, 'y'); R(g, w - 7, look.top + 23, 2, 2, 'y');
  if (level >= 3) for (let x = 12; x < w - 12; x += 6) R(g, x, look.top + 9, 1, 1, 'y');
  if (level === 2) buntingG(g, 8, w - 9, yB + 1);
  signMotif(g, es, w, look.top);

  floors.forEach(fl => {
    const hF = fl.fy - fl.top;
    if (fl.f > 0) {                                                               // верхні поверхи: верхня планка й пояс-перекриття
      const y0 = fl.top - 3;
      R(g, 4, y0, w - 8, 1, 'l'); R(g, 4, y0 + 1, w - 8, 1, trim); R(g, 4, y0 + 2, w - 8, 1, 'd');
      R(g, 4, fl.fy, w - 8, 1, 'l'); R(g, 4, fl.fy + 1, w - 8, 1, trim); R(g, 4, fl.fy + 2, w - 8, 1, 'd');
    }
    // скло: легке забарвлення, мулліони, відблиски (напівпрозорі — крізь них видно покупців)
    g.globalAlpha = 0.12; R(g, innerX, fl.top, innerW, hF, es.glass); g.globalAlpha = 1;
    const n = Math.max(2, Math.round(innerW / 38)) + (shopVariant(level) % 2);                                  // кількість шибок залежить від варіанта
    for (let i = 1; i < n; i++) {
      const mx = Math.round(innerX + i * innerW / n);
      if (fl.f === 0 && mx > door.x - 4 && mx < door.x + door.w + 4) continue;
      R(g, mx, fl.top, 1, hF, 'd'); g.globalAlpha = 0.5; R(g, mx + 1, fl.top, 1, hF, 'w'); g.globalAlpha = 1;
    }
    g.globalAlpha = 0.28;
    for (let x = innerX + 6; x < innerX + innerW - 8; x += 28) for (let i = 0; i < 9; i++) R(g, x + i, fl.top + 4 + (8 - i), 1, 2, 'w');   // діагональні відблиски
    g.globalAlpha = 1;
  });

  // навіс у смужку з зубчиками
  const sv = shopVariant(level), [a1, a2] = (skinShop && skinShop.awningCols) || (EPOCH_AWN[viewEpoch() % EPOCH_AWN.length] || [])[sv] || currentEpoch().awning || look.awning;
  for (let x = 0; x < w; x++) R(g, x, yG, 1, 8, (Math.floor(x / 6) % 2) ? a2 : a1);
  R(g, 0, yG, w, 1, 'd');
  if (es.awning === 'flat') {                                  // сучасний прямий навіс зі світлодіодною стрічкою
    R(g, 0, yG + 8, w, 1, 'd'); for (let x = 1; x < w - 1; x += 3) R(g, x, yG + 9, 2, 1, (x / 3 | 0) % 2 ? a1 : a2);
  } else for (let sx = 0; sx < w; sx += 6) {
    const col = (Math.floor(sx / 6) % 2) ? a2 : a1;
    R(g, sx, yG + 8, 6, 1, col); R(g, sx + 1, yG + 9, 4, 1, col); R(g, sx + 2, yG + 10, 2, 1, col);
  }
  g.globalAlpha = 0.18; R(g, 4, yG + 11, w - 8, 2, 'd'); g.globalAlpha = 1;

  // основа з кам'яних блоків
  R(g, 0, h - 6, w, 6, es.base); R(g, 0, h - 6, w, 1, 'E'); R(g, 0, h - 1, w, 1, 'd');
  for (let x = 12; x < w; x += 14) R(g, x, h - 5, 1, 4, 'd');

  // рамка автоматичних дверей, датчик і сходинки
  R(g, door.x - 3, yG + 10, door.w + 6, 3, 'd'); R(g, door.x - 3, yG + 10, door.w + 6, 1, 'l');
  R(g, door.x - 3, yG + 10, 3, 24, 'd'); R(g, door.x + door.w, yG + 10, 3, 24, 'd');
  R(g, door.x + (door.w >> 1) - 2, yG + 11, 4, 1, 'k'); R(g, door.x + (door.w >> 1) + 3, yG + 11, 1, 1, 'r');
  R(g, door.x - 4, h - 5, door.w + 8, 1, 'w'); R(g, door.x - 4, h - 4, door.w + 8, 2, 'E');

  // деталі фасаду
  if (level <= 4) { lanternG(g, door.x - 9, yG + 14); lanternG(g, door.x + door.w + 10, yG + 14); }
  if (level <= 2) { potG(g, door.x - 18, yG + 24, 'p'); potG(g, door.x + door.w + 13, yG + 24, 'y'); }
  if (level === 3) { const nx = door.x + door.w + 6; R(g, nx, yG + 17, 12, 6, 'd'); R(g, nx + 1, yG + 18, 10, 4, 'k'); R(g, nx + 2, yG + 19, 2, 2, 'r'); R(g, nx + 5, yG + 19, 2, 2, 'r'); R(g, nx + 8, yG + 19, 2, 2, 'r'); glassRects.push([nx + 1, yG + 18, 10, 4]); }
  if (level === 4) cartG(g, door.x - 22, yG + 32);
  if (level >= 5) { palmG(g, innerX + 8, yG + 17); palmG(g, w - 16, yG + 17); }
  if (level >= 3 && level <= 5) floors.forEach(fl => { if (fl.f > 0 && !fl.cafe) { boxG(g, innerX + 3, fl.fy - 4, 'r', 'p'); boxG(g, w - 25, fl.fy - 4, 'p', 'q'); } });
  if (level === 3) { acG(g, w - 22, floors[1].top + 4); }
  modernG(g, level, w, h, yG, door, look, yB);
  }

  // декор даху малюємо на окремому шарі: навколо вивіски «CAPYTAP» лишається вільний проміжок
  const ks = lastRoofSign, K = { x: ks.x - 5, y: ks.y - 4, w: ks.w + 10, h: ks.h + 4 };
  const dcv = mk(), gD = dcv.getContext('2d'); const gFront = g;
  g = gD;
  if (arch && arch.front) { if (arch.deco) arch.deco(g, AC); } else {
  epochFacadeFx(g, es, w, h, look, level, floors, yG);
  const half = es.fx === 'neon' ? 19 : 8, pL = Math.max(half, Math.min(Math.round(w * 0.16), K.x - half - 2)), pR = Math.min(w - half, Math.max(Math.round(w * 0.84), K.x + K.w + half + 2));
  roofProp(g, es, w, look.top, level, pL); if (es.fx !== "neon") roofProp(g, es, w, look.top, level, pR);
  shopRoofExtras(g, es, w, look.top, level);       // примітні деталі на даху по боках від вивіски
  epochFacadeDeco(g, es, w, h, look, level, floors, yG, door, yB);
  epochFacadeExtra(g, es, w, h, look, level, floors, yG, door, yB);
  if (!skinShop) shopVariantDeco(g, es, w, h, look, level, floors, yG, door, yB, shopVariant(level));
  if (skinShop) skinShopDeco(g, skinOn('shop'), w, h, look, yG, door);
  }
  gD.save(); gD.globalCompositeOperation = 'destination-out'; gD.fillStyle = '#000'; gD.fillRect(K.x, K.y, K.w, K.h); gD.restore();
  g = gFront; g.drawImage(dcv, 0, 0);
  if (level <= 2 && viewEpoch() % EPOCHS.length !== 0) openSignG(g, yG);                      // у Відродженні вивіски OPEN немає
  if (pendingSign) roofSignG(g, pendingSign[0], pendingSign[1], pendingSign[2]);

  if (seasonNow() === 'winter') snowCap(front, look.top + 4);      // взимку на даху лежить сніг

  // загальний спрайт (для будівництва, перевірок): інтер'єр + фасад + зачинені двері
  const cg = canvas.getContext('2d');
  cg.drawImage(back, 0, 0); cg.drawImage(front, 0, 0); drawDoorLeaves(cg, door, 0);

  // освітлені вітрини й інтер'єр (вночі накладаються поверх магазину)
  const lit = document.createElement('canvas');
  lit.width = w; lit.height = h;
  const lg = lit.getContext('2d');
  glassRects.forEach(r => {
    if (r[2] > 30) {                                                                                           // інтер'єр: тепле світло, крізь яке все ще видно звірят
      lg.globalAlpha = 0.2; R(lg, r[0], r[1], r[2], r[3], 'y'); lg.globalAlpha = 0.12; R(lg, r[0], r[1], r[2], 3, 'w'); R(lg, r[0], r[1] + r[3] - 5, r[2], 5, 'h');
      lg.globalAlpha = 1;                                                                                // лампочки під стелею прибрано: лишається м'яке природне світло інтер'єру
    }
    else { R(lg, r[0], r[1], r[2], r[3], 'y'); R(lg, r[0], r[1] + r[3] - 3, r[2], 3, 'h'); }                 // ліхтарики й дрібні вікна світяться яскраво
  });
  lg.clearRect(door.x - 3, door.y - 3, door.w + 6, door.h + 3);                                                                  // двері лишаються без підсвітки — вночі їх чітко видно
  lg.globalAlpha = 0.5; R(lg, door.x - 3, door.y - 4, door.w + 6, 1, 'h'); lg.globalAlpha = 1;                                 // тонка лампа над дверима
  // окремі «квадрати» світла над прилавками прибрано: вночі лишається лише м'яке фонове світло інтер'єру
  if (lastRoofSign) { lg.globalAlpha = 0.1; R(lg, lastRoofSign.x + 1, lastRoofSign.y + 1, lastRoofSign.w - 2, lastRoofSign.h - 2, 'y'); lg.globalAlpha = 1; }          // вивіска «CAPYTAP» світиться вночі
  lg.globalAlpha = 0.28; R(lg, 7, look.top + 10, w - 14, 13, 'y'); lg.globalAlpha = 1;                                                                                       // і назва магазину теж
  glassRects = null;

  return {
    canvas, back, front, w, h, lit, yB, roofSign: lastRoofSign, glints: skinGlints, roofTop: (level >= 6 ? roofTopOf(front, w) : 0),
    sign: { x: 7, y: look.top + 10, w: w - 14, h: 13 },
    door, floors, escalators, cinema: (floors.find(f => f.cinema) || {}).screen || null
  };
}

