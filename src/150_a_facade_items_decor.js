//#part 150_a_facade_items_decor.js
/* =====================================================================
   ФАСАД МАГАЗИНУ (малюється з прямокутників; росте з рівнем)
   ===================================================================== */

// Чим більше куплено відділу, тим повніша вітрина: 0 — порожньо, 1–3 — поступово більше
function tierOf(count) { return count <= 0 ? 0 : count < 10 ? 1 : count < 50 ? 2 : 3; }

// Один предмет у вітрині. x — ліва межа, yb — лінія полиці (предмет стоїть над нею)
function drawItem(g, kind, x, yb, k) {
  const cols = ['p', 'q', 'o', 'h', 'm', 'u'];
  const c = cols[k % 6];
  switch (kind) {
    case 'trinkets':
      R(g, x, yb - 3, 3, 3, k % 2 ? 'r' : 'h'); R(g, x, yb - 3, 3, 1, 'w'); break;
    case 'sweets':
      R(g, x, yb - 2, 3, 2, c); R(g, x + 1, yb - 3, 1, 1, c); break;
    case 'stationery':
      R(g, x, yb - 6, 1, 6, c); R(g, x, yb - 7, 1, 1, 'y'); R(g, x + 2, yb - 4, 2, 4, 'n'); R(g, x + 2, yb - 4, 2, 1, 'w'); break;
    case 'toys':
      if (k % 2) { R(g, x, yb - 3, 3, 3, c); R(g, x, yb - 3, 1, 1, 'w'); }
      else { R(g, x, yb - 4, 3, 4, 'l'); R(g, x, yb - 5, 1, 1, 'l'); R(g, x + 2, yb - 5, 1, 1, 'l'); R(g, x + 1, yb - 3, 1, 1, 'c'); }
      break;
    case 'cleaning':
      R(g, x, yb - 5, 2, 5, c); R(g, x, yb - 6, 2, 1, 'r'); R(g, x + 3, yb - 4, 2, 4, 's'); break;
    case 'produce':
      R(g, x, yb - 3, 3, 3, ['r', 'o', 'g', 'y', 'r', 'g'][k % 6]); R(g, x + 1, yb - 4, 1, 1, 'G'); break;
    case 'bakery':
      R(g, x, yb - 3, 4, 3, 'c'); R(g, x + 1, yb - 4, 2, 1, 'c'); R(g, x + 1, yb - 2, 2, 1, 'l'); break;
    case 'clothes':
      R(g, x, yb - 5, 4, 4, c); R(g, x + 1, yb - 5, 2, 1, 'w'); R(g, x + 1, yb - 6, 2, 1, 'd'); break;
    case 'shoes':
      R(g, x, yb - 2, 4, 2, c); R(g, x, yb - 3, 2, 1, c); R(g, x, yb - 1, 4, 1, 'd'); break;
    case 'electronics':
      R(g, x, yb - 5, 4, 4, 'd'); R(g, x + 1, yb - 4, 2, 2, k % 2 ? 's' : 'y'); R(g, x + 1, yb - 1, 2, 1, 'e'); break;
    case 'foodcourt':
      if (k % 2) { R(g, x, yb - 4, 1, 4, 'y'); R(g, x + 1, yb - 5, 1, 5, 'y'); R(g, x + 2, yb - 4, 1, 4, 'y'); }
      else { R(g, x, yb - 1, 4, 1, 'c'); R(g, x, yb - 2, 4, 1, 'g'); R(g, x, yb - 3, 4, 1, 'l'); R(g, x, yb - 4, 4, 1, 'c'); }
      break;
    case 'cinema':
      R(g, x, yb - 7, 3, 7, ['u', 'r', 'n'][k % 3]); R(g, x + 1, yb - 5, 1, 1, 'y'); break;
    case 'candle': R(g, x + 1, yb - 6, 1, 1, 'o'); R(g, x, yb - 4, 3, 4, 'w'); R(g, x + 1, yb - 5, 1, 1, 'd'); break;
    case 'jar': R(g, x, yb - 4, 4, 4, c); R(g, x, yb - 5, 4, 1, 'd'); R(g, x + 1, yb - 3, 2, 1, 'w'); break;
    case 'scroll': R(g, x, yb - 5, 4, 5, 'w'); R(g, x, yb - 5, 4, 1, 'c'); R(g, x, yb - 1, 4, 1, 'c'); R(g, x + 1, yb - 3, 2, 1, 'e'); break;
    case 'record': R(g, x, yb - 5, 4, 5, 'k'); R(g, x + 1, yb - 4, 2, 2, c); break;
    case 'cassette': R(g, x, yb - 3, 5, 3, 'd'); R(g, x, yb - 3, 5, 1, c); R(g, x + 1, yb - 2, 1, 1, 'w'); R(g, x + 3, yb - 2, 1, 1, 'w'); break;
    case 'gamepad': R(g, x, yb - 3, 5, 3, 'e'); R(g, x, yb - 3, 5, 1, 'E'); R(g, x + 1, yb - 2, 1, 1, 'r'); R(g, x + 3, yb - 2, 1, 1, 'g'); break;
    case 'laptop': R(g, x, yb - 4, 4, 3, 'd'); R(g, x + 1, yb - 3, 2, 1, 'a'); R(g, x - 1, yb - 1, 6, 1, 'e'); break;
    case 'plant': R(g, x + 1, yb - 2, 2, 2, 'b'); R(g, x, yb - 5, 4, 3, 'g'); R(g, x + 1, yb - 6, 2, 1, 'm'); break;
    case 'robot': R(g, x, yb - 4, 4, 4, 'e'); R(g, x, yb - 4, 4, 1, 'E'); R(g, x + 1, yb - 3, 1, 1, 's'); R(g, x + 2, yb - 3, 1, 1, 's'); R(g, x + 1, yb - 5, 2, 1, 'd'); break;
    case 'rocket': R(g, x + 1, yb - 6, 2, 5, 'w'); R(g, x + 1, yb - 7, 2, 1, 'r'); R(g, x, yb - 3, 1, 3, 'r'); R(g, x + 3, yb - 3, 1, 3, 'r'); break;
    case 'cup': R(g, x, yb - 4, 3, 4, c); R(g, x + 1, yb - 6, 1, 2, 'd'); R(g, x, yb - 1, 3, 1, 'd'); break;
    case 'bulb': R(g, x, yb - 5, 3, 4, c); R(g, x + 1, yb - 4, 1, 2, 'w'); R(g, x, yb - 1, 3, 1, 'd'); break;
    case 'tube': R(g, x, yb - 6, 2, 6, c); R(g, x, yb - 6, 2, 1, 'd'); R(g, x + 3, yb - 4, 2, 4, 's'); break;
    case 'cone': R(g, x, yb - 4, 3, 2, c); R(g, x + 1, yb - 2, 1, 2, 'c'); R(g, x, yb - 4, 3, 1, 'w'); break;
    case 'mask': R(g, x, yb - 4, 4, 4, 'y'); R(g, x + 1, yb - 3, 1, 1, 'd'); R(g, x + 2, yb - 3, 1, 1, 'd'); R(g, x + 1, yb - 1, 2, 1, 'd'); break;
    case 'solar': R(g, x, yb - 4, 5, 4, 'n'); R(g, x, yb - 4, 5, 1, 'a'); R(g, x + 2, yb - 4, 1, 4, 'a'); break;
    case 'visor': R(g, x, yb - 3, 5, 2, 'd'); R(g, x + 1, yb - 2, 3, 1, 's'); R(g, x, yb - 4, 5, 1, c); break;
  }
}

// Вітрина відділу: слот x, y, w, h; tier — наскільки заповнена
function drawDisplay(g, x, y, w, h, kind, tier) {
  if (tier <= 0) return;
  const n = [0, 2, 3, 6][tier];
  const low = y + h - 3, high = y + 7;
  R(g, x, low, w, 1, 'b');
  if (n > 3) R(g, x, high, w, 1, 'b');
  for (let i = 0; i < n; i++) {
    drawItem(g, kind, x + 1 + (i % 3) * 5, i < 3 ? low : high, i);
  }
  if (tier === 3) { R(g, x + w - 3, y + 1, 1, 1, 'w'); R(g, x + 2, y + 2, 1, 1, 'w'); }
}

// Стелаж на два відділи (34×19) із кольоровою шапкою; y — верх рамки
function drawShelf(g, x, y, bayNo, tiers) {
  const hdr = ['r', 'n', 'g', 'o', 'u', 'p'][bayNo % 6];
  R(g, x - 1, y - 2, 36, 2, hdr); R(g, x - 1, y - 2, 36, 1, 'w');
  R(g, x - 1, y, 36, 19, 'b'); R(g, x - 1, y, 1, 19, 'l');
  R(g, x, y + 1, 34, 17, 'w');
  for (let s2 = 0; s2 < 2; s2++) {
    const dept = (bayNo * 2 + s2) % DEPARTMENTS.length;               // нові верхні поверхи показують товари відділів по колу
    drawDisplay(g, x + 1 + s2 * 17, y + 1, s2 ? 16 : 15, 16, (EPOCH_GOODS_KINDS[viewEpoch() % EPOCH_GOODS_KINDS.length] || [])[dept] || DEPARTMENTS[dept].display, tiers[dept]);
  }
  R(g, x + 16, y + 1, 1, 17, 'b');
  R(g, x - 1, y + 18, 36, 1, 'd');
}
function posterG(g, x, y, c) { R(g, x, y, 9, 11, 'd'); R(g, x + 1, y + 1, 7, 9, c); R(g, x + 2, y + 3, 5, 1, 'w'); R(g, x + 2, y + 5, 5, 1, 'w'); R(g, x + 2, y + 7, 3, 1, 'w'); R(g, x + 2, y + 2, 2, 1, 'y'); }
// Автоматичні розсувні двері: open 0…1 — на скільки роз'їхались стулки (ховаються за рамку)
function drawDoorLeaves(g, d, open) {
  const lw = d.w / 2, off = Math.round(open * (lw - 1));
  g.save(); g.beginPath(); g.rect(d.x, d.y, d.w, d.h); g.clip();
  [[d.x - off, false], [d.x + lw + off, true]].forEach(p => {
    const x = Math.round(p[0]);
    if (d.type === 0 || d.type === 3) {                       // дерев'яні стулки
      R(g, x, d.y, lw, d.h, 'd'); R(g, x + 1, d.y + 1, lw - 2, d.h - 1, 'b');
      R(g, x + 3, d.y + 3, lw - 6, 6, 's'); R(g, x + 3, d.y + 3, 3, 1, 'S');
      R(g, x + 3, d.y + 11, lw - 6, d.h - 14, 'l'); R(g, p[1] ? x + 2 : x + lw - 4, d.y + 9, 2, 3, 'h');
    } else {                                                  // скляні стулки
      const fc = d.type === 2 ? 'r' : 'n';
      R(g, x, d.y, lw, d.h, fc);
      g.globalAlpha = 0.5; R(g, x + 1, d.y + 1, lw - 2, d.h - 2, 'S'); g.globalAlpha = 1;
      R(g, x + 1, d.y + 1, lw - 2, 1, 'w'); R(g, x + 2, d.y + 3, 1, 6, 'w'); R(g, x + 3, d.y + 3, 1, 3, 'w');
      R(g, p[1] ? x + 1 : x + lw - 2, d.y + 7, 1, 7, 'd');
      R(g, x, d.y + d.h - 3, lw, 3, fc);
    }
  });
  g.restore();
}

// Розкладає елементи рядка по ширині рівномірно; повертає x кожного
function placeRow(innerX, innerW, widths) {
  const sum = widths.reduce((a, b) => a + b, 0);
  const gap = Math.floor((innerW - sum) / (widths.length + 1));
  let x = innerX + gap;
  return widths.map(w => { const px = x; x += w + gap; return px; });
}

/* ---------- дрібні деталі фасаду ---------- */
function pilasterG(g, x, y, h, trim) {            // колона 3 px з капітеллю й базою
  R(g, x - 1, y, 5, 2, 'd'); R(g, x - 1, y + 1, 5, 1, 'l');
  R(g, x, y + 2, 3, h - 4, trim); R(g, x, y + 2, 1, h - 4, 'l'); R(g, x + 2, y + 2, 1, h - 4, 'd');
  R(g, x - 1, y + h - 2, 5, 2, 'd'); R(g, x - 1, y + h - 2, 5, 1, 'l');
}
function lanternG(g, x, y) {                       // настінний ліхтарик (вночі світиться)
  R(g, x, y, 1, 2, 'd'); R(g, x - 2, y + 2, 5, 1, 'd'); R(g, x - 2, y + 3, 1, 4, 'd'); R(g, x + 2, y + 3, 1, 4, 'd');
  R(g, x - 1, y + 3, 3, 4, 'y'); R(g, x - 1, y + 3, 1, 4, 'h'); R(g, x - 2, y + 7, 5, 1, 'd');
  if (glassRects) glassRects.push([x - 1, y + 3, 3, 4]);
}
function potG(g, x, y, c) {                        // горщик із рослиною
  R(g, x, y + 4, 6, 5, 'd'); R(g, x + 1, y + 4, 4, 4, 'r'); R(g, x + 1, y + 4, 4, 1, 'o');
  R(g, x + 1, y + 1, 4, 3, 'g'); R(g, x, y + 2, 1, 2, 'G'); R(g, x + 5, y + 2, 1, 2, 'G'); R(g, x + 2, y, 2, 1, c); R(g, x, y + 1, 1, 1, c); R(g, x + 5, y + 1, 1, 1, c);
}
function palmG(g, x, y) {                          // пальма в діжці
  R(g, x - 4, y + 8, 9, 6, 'd'); R(g, x - 3, y + 8, 7, 5, 'b'); R(g, x - 3, y + 8, 7, 1, 'l');
  R(g, x, y - 3, 1, 11, 'd'); R(g, x - 1, y - 1, 1, 9, 'b');
  [[-5, -3], [-3, -5], [3, -5], [5, -3], [0, -6]].forEach(p => { lineG(g, x, y - 3, x + p[0], y + p[1], 'G'); R(g, x + p[0], y + p[1], 2, 1, 'g'); });
}
function buntingG(g, x0, x1, y) {                  // гірлянда з кольорових кульок
  for (let x = x0; x <= x1; x++) {
    const sag = Math.round(3 * Math.sin((x - x0) / (x1 - x0) * Math.PI));
    R(g, x, y + sag, 1, 1, 'd');
    if ((x - x0) % 6 === 3) { const c = ['r', 'y', 'g', 'n', 'p'][Math.floor((x - x0) / 6) % 5]; R(g, x - 1, y + sag + 1, 3, 3, 'd'); R(g, x, y + sag + 1, 2, 2, c); R(g, x, y + sag + 1, 1, 1, 'w'); }
  }
}
function acG(g, x, y) { R(g, x, y, 9, 6, 'd'); R(g, x + 1, y + 1, 7, 4, 'E'); R(g, x + 2, y + 2, 5, 1, 'e'); R(g, x + 2, y + 4, 5, 1, 'e'); R(g, x + 1, y + 1, 7, 1, 'w'); }
function cartG(g, x, y) {                          // візок для покупок
  R(g, x, y - 7, 11, 1, 'd'); R(g, x, y - 3, 10, 1, 'd'); for (let k = 0; k < 11; k += 2) R(g, x + k, y - 7, 1, 5, 'd');
  R(g, x + 1, y - 6, 9, 3, 'e'); R(g, x - 2, y - 8, 3, 1, 'd'); R(g, x - 2, y - 8, 1, 3, 'd');
  R(g, x + 1, y - 2, 2, 2, 'd'); R(g, x + 7, y - 2, 2, 2, 'd');
  R(g, x + 2, y - 6, 2, 2, 'r'); R(g, x + 5, y - 6, 2, 2, 'g'); R(g, x + 8, y - 6, 1, 2, 'y');
}
function spireG(g, x, y) {                          // нейтральний шпиль із кулькою та кільцем
  R(g, x, y + 3, 1, 8, 'd'); R(g, x - 1, y + 2, 3, 1, 'd'); R(g, x - 1, y, 3, 2, 'y'); R(g, x, y - 1, 1, 1, 'y'); R(g, x - 1, y + 5, 3, 1, 'h');
}
function flagG(g, x, y, c) { R(g, x, y, 1, 11, 'd'); R(g, x + 1, y, 8, 5, c); R(g, x + 1, y, 8, 1, 'w'); R(g, x + 1, y + 4, 8, 1, 'd'); R(g, x, y - 1, 1, 1, 'h'); }
const FONT5 = { S: ['.####', '#....', '.###.', '....#', '####.'], U: ['#...#', '#...#', '#...#', '#...#', '.###.'], P: ['####.', '#...#', '####.', '#....', '#....'], E: ['#####', '#....', '####.', '#....', '#####'], L: ['#....', '#....', '#....', '#....', '#####'], R: ['####.', '#...#', '####.', '#..#.', '#...#'], C: ['.####', '#....', '#....', '#....', '.####'], A: ['.###.', '#...#', '#####', '#...#', '#...#'], Y: ['#...#', '#...#', '.###.', '..#..', '..#..'], T: ['#####', '..#..', '..#..', '..#..', '..#..'] };
function wordG(g, x, y, word, c) {                  // крихітний напис пікселями
  for (let i = 0; i < word.length; i++) FONT5[word[i]].forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') R(g, x + i * 6 + rx, y + ry, 1, 1, c); });
}
// Вивіска «CAPYTAP» на даху: однакова назва на кожному рівні, але кольори свої в кожній епосі
const EPOCH_ROOF_SIGN = [['d', 'y'], ['u', 'w'], ['P', 'y'], ['k', 'T'], ['n', 'w'], ['G', 'y'], ['z', 'a'], ['k', 'f']];   // [фон, літери]
const ROOF_GLOW = ['T', 'T', 'y', 'f', 'f', 'p', 'f', 'y'];        // колір нічного сяйва «CAPYTAP» по епохах (не збігається з назвою магазину)
let lastRoofSign = null, deferSign = false, pendingSign = null;
function wordBig(g, x, y, word, c) {                // товстий напис: літери 6×7, крок 7 (кожна літера дрібного шрифта розтягнута по висоті й подвоєна по ширині штриха)
  const rows = [0, 1, 1, 2, 3, 3, 4];
  for (let i = 0; i < word.length; i++) rows.forEach((fr, ry) => { const row = FONT5[word[i]][fr]; for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') { R(g, x + i * 7 + rx, y + ry, 2, 1, c); } });
}
function roofSignG(g, cx, y, big) {
  const [fill, ink] = EPOCH_ROOF_SIGN[viewEpoch() % EPOCH_ROOF_SIGN.length];
  const pw = big ? 70 : 62, ph = big ? 17 : 14, x = cx - (pw >> 1), ty = y + ((ph - 8) >> 1);
  lastRoofSign = { x, y, w: pw, h: ph, tx: cx - 24, ty };
  if (deferSign) { pendingSign = [cx, y, big]; return; }               // малюємо останньою, щоб ніщо не накрило вивіску
  R(g, x, y, pw, ph, 'd'); R(g, x + 1, y + 1, pw - 2, ph - 2, fill);
  [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1]].forEach(([dx, dy]) => wordBig(g, cx - 24 + dx, ty + dy, 'CAPYTAP', 'd'));       // темне обведення літер
  wordBig(g, cx - 24, ty, 'CAPYTAP', ink);
  if (big) { R(g, x + 2, y + 2, 1, 1, ink); R(g, x + pw - 3, y + 2, 1, 1, ink); R(g, x + 2, y + ph - 3, 1, 1, ink); R(g, x + pw - 3, y + ph - 3, 1, 1, ink); }
}
function corniceG(g, w, y, trim) {                  // карниз під дахом
  R(g, 0, y, w, 1, 'l'); R(g, 0, y + 1, w, 2, trim); R(g, 0, y + 3, w, 1, 'd');
}

// Стиль магазину в кожній епосі (індекс — як в EPOCHS): flat — плаский дах замість черепиці; roofPal — перефарбування даху;
// trim — колір карнизу; col — [колона, відблиск]; frame — [рамка, кільце] вивіски; glass — колір скла; base — цоколь; band — візерунок карниза;
// awning — 'scallop' (зубчики) чи 'flat' (пряма стрічка з підсвіткою); fx — особливий декор епохи
const EPOCH_SHOP = [
  { flat: false, roofPal: { r: 't' }, trim: null, col: ['b', 'l'], frame: ['d', 'h'], glass: 'S', base: 'e', band: null, awning: 'scallop', inner: null, fx: 'renaissance', roofs: [0, 1, 1, 4, 4, 1] },
  { flat: false, roofPal: { r: 'T', n: 'r' }, trim: 'w', col: ['T', 'a'], frame: ['d', 'T'], glass: 'S', base: 'E', band: ['checker', 'w'], awning: 'scallop', inner: ['w', 'm', 'y'], fx: 'retro', roofs: [2, 2, 2, 3, 3, 3] },
  { flat: false, roofPal: { r: 'J', n: 'P' }, trim: 'P', col: ['P', 'J'], frame: ['d', 'f'], glass: 'j', base: 'P', band: ['dots', 'y'], awning: 'scallop', inner: ['J', 'j', 'P'], fx: 'disco', roofs: [2, 2, 3, 3, 6, 3] },
  { flat: true, roofPal: { r: 'v', n: 'V' }, trim: 'V', col: ['V', 'v'], frame: ['k', 'T'], glass: 'v', base: 'V', band: ['checker', 'v'], awning: 'flat', inner: ['V', 'P', 'v'], fx: 'arcade' },
  { flat: true, roofPal: { r: 'n', n: 'e' }, trim: 'a', col: ['e', 'E'], frame: ['n', 'a'], glass: 'a', base: 'e', band: ['dots', 'n'], awning: 'flat', inner: ['a', 'w', 'S'], fx: 'internet' },
  { flat: true, roofPal: { r: 'g', n: 'G' }, trim: 'g', col: ['b', 'c'], frame: ['G', 'm'], glass: 'm', base: 'b', band: ['leaf', 'G'], awning: 'flat', inner: ['m', 'c', 'y'], fx: 'eco' },
  { flat: true, roofPal: { r: 'n', n: 'u' }, trim: 'z', col: ['n', 's'], frame: ['z', 'S'], glass: 'n', base: 'z', band: ['dots', 'S'], awning: 'flat', inner: ['z', 'n', 'V'], fx: 'space' },
  { flat: true, roofPal: { r: 'f', n: 'T' }, trim: 'k', col: ['k', 'T'], frame: ['k', 'f'], glass: 'v', base: 'k', band: ['zig', 'T'], awning: 'flat', inner: ['k', 'V', 'z'], fx: 'neon' }
];
// Архітектура під епоху (ARCH[id епохи]): { front(g, C) — увесь фасад (дах, карниз, вивіска, поверхи, навіс, цоколь, двері), deco(g, C) — декор поверх, house(g, spec, lamps) — будинки на вулиці }.
// Порожньо = звичайний вигляд. C = { es, w, h, look, level, floors, yG, yB, door, innerX, innerW }. Інтер'єр (звірята, покупці) не чіпається: фасад лише лишає в склі прорізи.
const ARCH = {};
const FLAT_ROOF = [2, 2, 2, 3, 6, 5];       // який дах у «плоских» епохах для кожного рівня
function epochShopStyle() { return EPOCH_SHOP[viewEpoch() % EPOCH_SHOP.length]; }
// Варіант вигляду магазину: залежить від епохи й рівня, тож усі магазини схожі за стилем епохи, але не однакові
function shopVariant(level) { return hash2(viewEpoch() * 17 + level * 5 + 3, 7) % 4; }
const EPOCH_AWN = [
  [['r', 'w'], ['g', 'w'], ['n', 'y'], ['u', 'w']], [['r', 'w'], ['T', 'w'], ['y', 'w'], ['T', 'r']], [['f', 'y'], ['J', 'w'], ['u', 'y'], ['T', 'f']], [['T', 'f'], ['v', 'y'], ['r', 'k'], ['y', 'k']],
  [['n', 'w'], ['a', 'w'], ['e', 'w'], ['S', 'n']], [['g', 'y'], ['m', 'w'], ['G', 'c'], ['o', 'w']], [['e', 'w'], ['n', 'S'], ['z', 'w'], ['S', 'e']], [['f', 'T'], ['T', 'k'], ['v', 'f'], ['f', 'k']]
];
const EPOCH_STREET = [['bench', 'planter', 'aboard'], ['aboard', 'bench', 'bike'], ['planter', 'parasol', 'aboard'], ['bike', 'aboard', 'bin'], ['bin', 'bench', 'bike'], ['planter', 'bin', 'bike'], ['bin', 'planter', 'aboard'], ['aboard', 'bench', 'parasol']];
function benchG(g, x, yb, c) { R(g, x, yb - 7, 14, 2, 'd'); R(g, x + 1, yb - 7, 12, 1, c); R(g, x, yb - 4, 14, 2, 'd'); R(g, x + 1, yb - 4, 12, 1, 'l'); R(g, x + 1, yb - 2, 2, 2, 'd'); R(g, x + 11, yb - 2, 2, 2, 'd'); R(g, x, yb - 8, 1, 1, 'd'); R(g, x + 13, yb - 8, 1, 1, 'd'); }
function aboardG(g, x, yb, c) { R(g, x + 1, yb - 12, 9, 12, 'd'); R(g, x + 2, yb - 11, 7, 9, c); R(g, x + 3, yb - 9, 5, 1, 'w'); R(g, x + 3, yb - 7, 4, 1, 'w'); R(g, x + 3, yb - 5, 5, 1, 'w'); R(g, x + 2, yb - 11, 7, 1, 'l'); R(g, x + 1, yb - 2, 1, 2, 'd'); R(g, x + 9, yb - 2, 1, 2, 'd'); }
function planterG(g, x, yb, c) { R(g, x, yb - 5, 12, 5, 'd'); R(g, x + 1, yb - 4, 10, 3, 'b'); R(g, x + 1, yb - 4, 10, 1, 'l'); for (let k = 0; k < 3; k++) { R(g, x + 1 + k * 4, yb - 9, 3, 4, 'g'); R(g, x + 2 + k * 4, yb - 10, 1, 1, c); R(g, x + 1 + k * 4, yb - 8, 1, 1, 'G'); } }
function bikeG(g, x, yb, c) { disc(g, x + 3, yb - 3, 3, 'd'); disc(g, x + 3, yb - 3, 2, 'w'); disc(g, x + 13, yb - 3, 3, 'd'); disc(g, x + 13, yb - 3, 2, 'w'); lineG(g, x + 3, yb - 3, x + 8, yb - 8, c); lineG(g, x + 8, yb - 8, x + 13, yb - 3, c); lineG(g, x + 8, yb - 8, x + 6, yb - 3, c); R(g, x + 6, yb - 9, 4, 1, 'd'); R(g, x + 12, yb - 9, 2, 1, 'd'); R(g, x + 13, yb - 8, 1, 4, 'd'); }
function binG(g, x, yb, c) { R(g, x, yb - 9, 8, 9, 'd'); R(g, x + 1, yb - 8, 6, 7, c); R(g, x - 1, yb - 10, 10, 2, 'd'); R(g, x, yb - 10, 8, 1, 'w'); R(g, x + 2, yb - 6, 4, 1, 'w'); R(g, x + 3, yb - 5, 2, 2, 'w'); }
function parasolG(g, x, yb, c) { R(g, x + 6, yb - 14, 1, 14, 'd'); for (let r = 0; r < 4; r++) R(g, x + 1 + r, yb - 14 + r, 12 - r * 2, 1, r % 2 ? 'w' : c); R(g, x, yb - 11, 14, 1, 'd'); R(g, x + 3, yb - 5, 8, 2, 'c'); R(g, x + 6, yb - 3, 2, 3, 'd'); R(g, x + 3, yb - 1, 8, 1, 'd'); }
const SHOP_STREET_FN = { bench: benchG, aboard: aboardG, planter: planterG, bike: bikeG, bin: binG, parasol: parasolG };
// Додаткові речі фасаду за варіантом: гірлянда прапорців, підвісні квіти, ліхтарики або вертикальні стяги; і одна вулична річ біля дверей
function shopVariantDeco(g, es, w, h, look, level, floors, yG, door, yB, sv) {
  const ep = viewEpoch() % EPOCH_SHOP.length, pal = PAV_PAL[ep];
  if (sv === 0 && level !== 2) buntingG(g, 8, w - 9, yB + 1);
  else if (sv === 1) { for (let x = 12; x < w - 14; x += 15) { if (x > door.x - 4 && x < door.x + door.w + 2) continue; R(g, x + 1, yG + 10, 1, 2, 'd'); R(g, x - 1, yG + 12, 5, 3, 'd'); R(g, x, yG + 13, 3, 1, 'b'); R(g, x - 1, yG + 11, 1, 1, pal[(x >> 3) % 4]); R(g, x + 1, yG + 11, 1, 1, pal[(x >> 4) % 4]); R(g, x + 3, yG + 11, 1, 1, 'g'); } }
  else if (sv === 2) { [door.x - 7, door.x + door.w + 5].forEach(lx => lanternG(g, lx, yG + 14)); for (let x = 9; x < w - 9; x += 4) R(g, x, yB + 1, 2, 1, pal[(x >> 2) % 4]); }
  else { [9, w - 14].forEach((bx, i) => { const by = look.top + 27; R(g, bx, by, 6, 1, 'd'); R(g, bx + 1, by + 1, 4, 14, pal[(i + 1) % 4]); R(g, bx + 1, by + 1, 4, 1, 'w'); R(g, bx + 2, by + 4, 2, 2, 'w'); R(g, bx + 2, by + 9, 2, 1, 'w'); R(g, bx + 2, by + 15, 2, 1, 'd'); R(g, bx + 3, by + 16, 1, 1, 'd'); }); }
  const pool = EPOCH_STREET[ep], kind = pool[(sv + level) % pool.length], fn = SHOP_STREET_FN[kind], yb = h - 7;
  const left = (sv + level) % 2 === 0, x = left ? door.x - 17 : door.x + door.w + 6;
  if (x > 14 && x + 14 < w - 14 && fn) fn(g, x, yb, pal[(sv + 1) % 4]);
}
// Скіни магазину (виграш у цирку): накладаються поверх вигляду епохи — кольори даху, колон, вивіски, навісу й пару своїх прикрас
const SHOP_SKINS = {
  candy: { roofPal: { r: 'f', n: 'q' }, trim: 'q', col: ['f', 'w'], frame: ['d', 'q'], glass: 'q', base: 'p', band: ['dots', 'w'], awningCols: ['f', 'w'], signFill: 'f' },
  gold:  { roofPal: { r: 'h', n: 'y' }, trim: 'h', col: ['h', 'y'], frame: ['h', 'y'], glass: 'y', base: 'h', band: ['checker', 'y'], awningCols: ['r', 'h'], signFill: 'k' },
  diamond: { roofPal: { r: 'a', n: 's' }, trim: 'S', col: ['a', 'w'], frame: ['n', 'a'], glass: 'S', base: 's', band: ['checker', 'w'], awningCols: ['a', 'w'], signFill: 'n' },
  ice:   { roofPal: { r: 'S', n: 'a' }, trim: 'a', col: ['a', 'w'], frame: ['n', 'a'], glass: 'a', base: 'a', band: ['dots', 'w'], awningCols: ['a', 'w'], signFill: 'n' },
  wood:  { roofPal: { r: 'b', n: 'l' }, trim: 'l', col: ['b', 'c'], frame: ['d', 'c'], glass: 'y', base: 'b', band: ['dots', 'c'], awningCols: ['r', 'w'], signFill: 'b' },
  garden: { roofPal: { r: 'g', n: 'G' }, trim: 'g', col: ['G', 'm'], frame: ['G', 'm'], glass: 'm', base: 'G', band: ['leaf', 'm'], awningCols: ['m', 'w'], signFill: 'G' },
  xmas: { roofPal: { r: 'w', n: 'E' }, trim: 'r', col: ['r', 'w'], frame: ['d', 'r'], glass: 'S', base: 'G', band: ['dots', 'w'], awningCols: ['r', 'w'], signFill: 'G' },
  halloween: { roofPal: { r: 'V', n: 'P' }, trim: 'o', col: ['P', 'o'], frame: ['d', 'o'], glass: 'j', base: 'P', band: ['zig', 'o'], awningCols: ['o', 'k'], signFill: 'k' },
  spring: { roofPal: { r: 'p', n: 'q' }, trim: 'q', col: ['w', 'q'], frame: ['d', 'p'], glass: 'm', base: 'm', band: ['dots', 'p'], awningCols: ['p', 'w'], signFill: 'g' },
  autumn: { roofPal: { r: 'o', n: 't' }, trim: 'b', col: ['b', 'l'], frame: ['d', 'h'], glass: 'y', base: 'b', band: ['leaf', 'o'], awningCols: ['o', 'b'], signFill: 'b' }
};
function lollipopG(g, x, yb, c1, c2) {                // льодяник: паличка й закручений диск, yb — низ палички
  R(g, x, yb - 6, 1, 6, 'w');
  const cy = yb - 10;
  disc(g, x, cy, 4, 'd'); disc(g, x, cy, 3, c1);
  R(g, x - 3, cy, 7, 1, c2); R(g, x, cy - 3, 1, 7, c2); R(g, x - 2, cy - 2, 1, 1, c2); R(g, x + 2, cy + 2, 1, 1, c2); R(g, x + 2, cy - 2, 1, 1, 'w');
}
function goldCoinG(g, x, yb) {                        // велика золота монета на підставці
  R(g, x - 3, yb - 2, 7, 2, 'd'); R(g, x - 2, yb - 2, 5, 1, 'h');
  disc(g, x, yb - 8, 5, 'd'); disc(g, x, yb - 8, 4, 'h'); disc(g, x, yb - 8, 2, 'y');
  R(g, x - 3, yb - 10, 1, 2, 'y'); R(g, x, yb - 10, 1, 4, 'h');
}
function pumpkinG(g, x, yb, r) {                   // гарбуз із різьбленим обличчям
  disc(g, x, yb - r, r + 1, 'd'); disc(g, x, yb - r, r, 'o'); R(g, x - 1, yb - r * 2 - 1, 3, 2, 'g'); R(g, x, yb - r * 2 - 2, 1, 1, 'G');
  R(g, x - r + 1, yb - r - 2, 2, 2, 'y'); R(g, x + r - 2, yb - r - 2, 2, 2, 'y'); R(g, x - 2, yb - r + 1, 5, 1, 'y'); R(g, x - 1, yb - r + 2, 3, 1, 'y');
  R(g, x - 1, yb - r * 2 + 1, 1, r * 2 - 3, 'j');
}
function treeXmasG(g, x, yb) {                      // ялинка з кульками й зіркою
  R(g, x - 1, yb - 3, 3, 3, 'd'); R(g, x, yb - 3, 1, 3, 'b');
  for (let r = 0; r < 18; r++) { const w = 1 + Math.round(r * 0.95); R(g, x - (w >> 1) - 1, yb - 21 + r, w + 2, 1, 'd'); }
  for (let r = 0; r < 18; r++) { const w = 1 + Math.round(r * 0.95); R(g, x - (w >> 1), yb - 21 + r, w, 1, r % 6 === 5 ? 'G' : 'g'); }
  [[0, -17, 'y'], [-3, -12, 'r'], [3, -10, 'n'], [-5, -6, 'f'], [4, -5, 'y'], [0, -8, 'r']].forEach(([dx, dy, c]) => R(g, x + dx, yb + dy, 2, 2, c));
  R(g, x - 1, yb - 24, 3, 3, 'y'); R(g, x, yb - 25, 1, 1, 'y');
}
function leafPileG(g, x, yb) {                       // купа осіннього листя
  for (let i = 0; i < 40; i++) { const hh = (i * 37 + 11) % 100, dx = (hh % 15) - 7, dy = Math.floor(((i * 53) % 100) / 100 * Math.max(1, 6 - Math.abs(dx) * 0.7)); R(g, x + dx, yb - 1 - dy, 2, 1, ['o', 'r', 'h', 'y', 't'][i % 5]); }
}
let skinGlints = [];                                    // точки, де золотий скін блищить (мерехтіння малює drawShopShine)
function bigLollipopG(g, x, yb, cy, r) {                // один великий довгий лоліпоп: паличка з рожевими смужками й спіральний диск
  for (let y = cy; y < yb; y++) { R(g, x - 2, y, 1, 1, 'd'); R(g, x + 1, y, 1, 1, 'd'); R(g, x - 1, y, 2, 1, ((y >> 1) & 1) ? 'f' : 'w'); }
  R(g, x - 2, yb - 1, 4, 1, 'd');
  disc(g, x, cy, r + 1, 'd'); disc(g, x, cy, r, 'w');
  for (let arm = 0; arm < 2; arm++) for (let t = 0; t < 1; t += 0.008) { const an = t * Math.PI * 2 * 2.3 + arm * Math.PI, rad = t * (r - 0.4); R(g, Math.round(x + Math.cos(an) * rad), Math.round(cy + Math.sin(an) * rad), 1, 1, arm ? 'm' : 'f'); }
  R(g, x - r + 2, cy - r + 3, 2, 1, 'w'); R(g, x - r + 3, cy - r + 2, 1, 1, 'w');
  R(g, x - 5, cy + r + 1, 4, 3, 'd'); R(g, x - 4, cy + r + 1, 3, 2, 'y'); R(g, x + 2, cy + r + 1, 4, 3, 'd'); R(g, x + 2, cy + r + 1, 3, 2, 'y'); R(g, x - 1, cy + r + 1, 3, 3, 'd'); R(g, x, cy + r + 2, 1, 1, 'h');       // бантик
}
function gumdropG(g, x, yb, c) { for (let dy = 0; dy < 4; dy++) { const hw = [1, 2, 3, 3][dy]; R(g, x - hw, yb - 4 + dy, hw * 2 + 1, 1, dy === 3 ? 'd' : c); R(g, x - hw - 1, yb - 4 + dy, 1, 1, 'd'); R(g, x + hw + 1, yb - 4 + dy, 1, 1, 'd'); } R(g, x - 3, yb, 7, 1, 'd'); R(g, x - 1, yb - 3, 1, 1, 'w'); }
function coinStackG(g, x, yb, n) { for (let i = 0; i < n; i++) { const y = yb - 2 - i * 2; R(g, x - 4, y, 9, 3, 'd'); R(g, x - 3, y, 7, 2, i % 2 ? 'h' : 'y'); R(g, x - 3, y, 7, 1, 'y'); } R(g, x - 1, yb - n * 2, 3, 1, 'w'); }
function goldBarsG(g, x, yb) { const bar = (bx, by) => { R(g, bx - 1, by - 3, 11, 5, 'd'); R(g, bx, by - 2, 9, 3, 'h'); R(g, bx, by - 2, 9, 1, 'y'); R(g, bx + 1, by - 2, 2, 1, 'w'); }; bar(x, yb); bar(x + 10, yb); bar(x + 5, yb - 4); }
function gemG(g, x, y, c1, c2) { R(g, x + 1, y, 3, 1, 'd'); R(g, x, y + 1, 5, 1, 'd'); R(g, x + 1, y + 1, 3, 1, c2); R(g, x, y + 2, 5, 1, 'd'); R(g, x + 1, y + 2, 3, 1, c1); R(g, x + 1, y + 3, 3, 1, 'd'); R(g, x + 2, y + 3, 1, 1, c1); R(g, x + 1, y + 1, 1, 1, 'w'); }
function snowmanG(g, x, yb) { disc(g, x, yb - 4, 5, 'd'); disc(g, x, yb - 4, 4, 'w'); disc(g, x, yb - 11, 4, 'd'); disc(g, x, yb - 11, 3, 'w'); R(g, x - 2, yb - 12, 1, 1, 'd'); R(g, x + 1, yb - 12, 1, 1, 'd'); R(g, x, yb - 10, 3, 1, 'o'); R(g, x - 3, yb - 8, 7, 1, 'r'); R(g, x + 2, yb - 7, 2, 3, 'r'); R(g, x - 3, yb - 15, 7, 1, 'd'); R(g, x - 2, yb - 18, 5, 3, 'd'); R(g, x - 1, yb - 3, 1, 1, 'd'); R(g, x + 1, yb - 5, 1, 1, 'd'); }
function giftG(g, x, yb, w, h, c) { R(g, x, yb - h, w, h, 'd'); R(g, x + 1, yb - h + 1, w - 2, h - 2, c); R(g, x + (w >> 1), yb - h + 1, 1, h - 2, 'y'); R(g, x + 1, yb - (h >> 1) - 1, w - 2, 1, 'y'); R(g, x + (w >> 1) - 1, yb - h - 1, 3, 1, 'y'); }
function candyCaneG(g, x, yb, hh) { for (let y = 0; y < hh; y++) { R(g, x, yb - y, 3, 1, ((y >> 1) & 1) ? 'r' : 'w'); } R(g, x - 1, yb - hh, 1, 3, 'd'); R(g, x, yb - hh - 1, 4, 1, 'd'); for (let k = 0; k < 4; k++) R(g, x + k, yb - hh, 1, 1, k % 2 ? 'r' : 'w'); }
function wreathG(g, x, y, r, c1, c2) { disc(g, x, y, r, 'd'); disc(g, x, y, r - 1, c1); disc(g, x, y, r - 3, 'd'); for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; R(g, Math.round(x + Math.cos(an) * (r - 2)), Math.round(y + Math.sin(an) * (r - 2)), 1, 1, c2); } R(g, x - 2, y + r - 2, 5, 2, 'r'); R(g, x - 1, y + r - 3, 3, 1, 'r'); }
function tombstoneG(g, x, yb) { R(g, x - 4, yb - 10, 9, 10, 'd'); R(g, x - 3, yb - 9, 7, 9, 'e'); R(g, x - 2, yb - 11, 5, 1, 'd'); R(g, x - 2, yb - 10, 5, 1, 'E'); R(g, x - 3, yb - 9, 1, 8, 'E'); R(g, x - 1, yb - 7, 3, 1, 'd'); R(g, x, yb - 8, 1, 4, 'd'); R(g, x - 3, yb - 1, 7, 1, 'd'); }
function candleG(g, x, yb) { R(g, x - 1, yb - 6, 4, 6, 'd'); R(g, x, yb - 5, 2, 5, 'w'); R(g, x, yb - 8, 2, 2, 'y'); R(g, x, yb - 9, 1, 1, 'o'); R(g, x, yb - 7, 2, 1, 'd'); }
function spiderG(g, x, y, len) { for (let i = 0; i < len; i++) R(g, x, y + i, 1, 1, 'w'); R(g, x - 2, y + len, 5, 3, 'd'); R(g, x - 1, y + len, 3, 2, 'k'); R(g, x - 1, y + len, 1, 1, 'r'); R(g, x + 1, y + len, 1, 1, 'r'); [[-4, 0], [-4, 2], [4, 0], [4, 2]].forEach(([dx, dy]) => R(g, x + dx, y + len + dy, 2, 1, 'k')); }
function butterflyG(g, x, y, c1, c2) { R(g, x, y + 1, 1, 3, 'd'); R(g, x - 3, y, 3, 3, 'd'); R(g, x - 2, y + 1, 2, 1, c1); R(g, x - 2, y + 2, 1, 1, c2); R(g, x + 1, y, 3, 3, 'd'); R(g, x + 1, y + 1, 2, 1, c1); R(g, x + 2, y + 2, 1, 1, c2); R(g, x - 1, y - 1, 1, 1, 'd'); R(g, x + 1, y - 1, 1, 1, 'd'); }
function sunflowerG(g, x, yb) { R(g, x, yb - 14, 1, 14, 'G'); R(g, x + 1, yb - 7, 3, 1, 'g'); R(g, x - 3, yb - 10, 3, 1, 'g'); disc(g, x, yb - 17, 4, 'd'); disc(g, x, yb - 17, 3, 'h'); disc(g, x, yb - 17, 1, 'b'); R(g, x - 4, yb - 17, 1, 1, 'y'); R(g, x + 4, yb - 17, 1, 1, 'y'); R(g, x, yb - 21, 1, 1, 'y'); }
function hayBaleG(g, x, yb) { R(g, x, yb - 9, 14, 9, 'd'); R(g, x + 1, yb - 8, 12, 7, 'h'); R(g, x + 1, yb - 8, 12, 1, 'y'); for (let k = 3; k < 13; k += 4) R(g, x + k, yb - 8, 1, 7, 'o'); R(g, x + 1, yb - 4, 12, 1, 'c'); }
function cornG(g, x, yb) { R(g, x, yb - 14, 1, 14, 'G'); R(g, x + 1, yb - 9, 3, 1, 'g'); R(g, x - 3, yb - 11, 3, 1, 'g'); R(g, x - 1, yb - 9, 4, 6, 'd'); R(g, x, yb - 8, 2, 4, 'h'); R(g, x, yb - 8, 1, 4, 'y'); R(g, x - 1, yb - 3, 1, 1, 'g'); R(g, x + 1, yb - 14, 1, 1, 'y'); }
function ghostG(g, x, y) {                          // маленький привид: біле тіло, хвилястий низ, чорні очі
  R(g, x - 3, y, 7, 8, 'd'); R(g, x - 2, y - 1, 5, 1, 'd'); R(g, x - 2, y, 5, 8, 'w'); R(g, x - 3, y + 1, 7, 6, 'w'); R(g, x - 3, y + 1, 1, 5, 'S');
  R(g, x - 2, y + 8, 1, 1, 'd'); R(g, x, y + 8, 1, 1, 'd'); R(g, x + 2, y + 8, 1, 1, 'd'); R(g, x - 1, y + 7, 1, 1, 'w'); R(g, x + 1, y + 7, 1, 1, 'w');
  R(g, x - 2, y + 2, 1, 2, 'k'); R(g, x + 1, y + 2, 1, 2, 'k'); R(g, x - 1, y + 5, 2, 1, 'k');
}
function cauldronG(g, x, yb) {                       // казанок із зеленим варивом і пухирцями
  R(g, x - 6, yb - 8, 13, 6, 'd'); R(g, x - 5, yb - 7, 11, 5, 'k'); R(g, x - 5, yb - 8, 11, 2, 'm'); R(g, x - 4, yb - 8, 3, 1, 'y');
  R(g, x - 5, yb - 2, 2, 2, 'd'); R(g, x + 4, yb - 2, 2, 2, 'd'); R(g, x - 7, yb - 7, 1, 2, 'd'); R(g, x + 7, yb - 7, 1, 2, 'd');
  R(g, x - 2, yb - 11, 2, 2, 'm'); R(g, x + 2, yb - 13, 1, 1, 'm'); R(g, x + 1, yb - 10, 1, 1, 'y');
}
function batG(g, x, y) { R(g, x - 3, y, 2, 1, 'k'); R(g, x + 2, y, 2, 1, 'k'); R(g, x - 4, y + 1, 3, 1, 'k'); R(g, x + 2, y + 1, 3, 1, 'k'); R(g, x - 1, y, 3, 2, 'k'); R(g, x - 1, y - 1, 1, 1, 'k'); R(g, x + 1, y - 1, 1, 1, 'k'); R(g, x - 3, y + 2, 1, 1, 'k'); R(g, x + 3, y + 2, 1, 1, 'k'); R(g, x, y, 1, 1, 'r'); }
function bunnyG(g, x, yb) {                          // кролик-статуетка: вуха, мордочка, хвостик
  R(g, x - 3, yb - 14, 2, 6, 'd'); R(g, x + 1, yb - 14, 2, 6, 'd'); R(g, x - 2, yb - 13, 1, 5, 'q'); R(g, x + 1, yb - 13, 1, 5, 'q');
  R(g, x - 4, yb - 9, 9, 7, 'd'); R(g, x - 3, yb - 8, 7, 5, 'w'); R(g, x - 2, yb - 7, 1, 1, 'k'); R(g, x + 1, yb - 7, 1, 1, 'k'); R(g, x - 1, yb - 5, 2, 1, 'p');
  R(g, x - 5, yb - 4, 11, 4, 'd'); R(g, x - 4, yb - 3, 9, 3, 'w'); R(g, x + 5, yb - 3, 2, 2, 'w');
}
function scarecrowG(g, x, yb) {                      // опудало: стовп, соломяні руки, сорочка в латках, гарбузова голова й капелюх
  R(g, x, yb - 22, 1, 22, 'd'); R(g, x - 7, yb - 15, 15, 2, 'd'); R(g, x - 6, yb - 15, 13, 1, 'b');
  R(g, x - 3, yb - 16, 7, 7, 'd'); R(g, x - 2, yb - 15, 5, 5, 'r'); R(g, x - 1, yb - 13, 2, 2, 'h'); R(g, x - 2, yb - 11, 5, 1, 'b');
  R(g, x - 9, yb - 15, 2, 4, 'y'); R(g, x + 8, yb - 15, 2, 4, 'y'); R(g, x - 3, yb - 9, 2, 3, 'y'); R(g, x + 2, yb - 9, 2, 3, 'y');
  disc(g, x, yb - 21, 4, 'd'); disc(g, x, yb - 21, 3, 'o'); R(g, x - 2, yb - 22, 1, 1, 'k'); R(g, x + 1, yb - 22, 1, 1, 'k'); R(g, x - 1, yb - 19, 3, 1, 'k');
  R(g, x - 5, yb - 25, 11, 1, 'd'); R(g, x - 3, yb - 29, 7, 4, 'd'); R(g, x - 3, yb - 26, 7, 1, 'h');
}
function mushroomG(g, x, yb) { R(g, x - 1, yb - 3, 3, 3, 'd'); R(g, x, yb - 3, 1, 3, 'w'); R(g, x - 3, yb - 6, 7, 3, 'd'); R(g, x - 2, yb - 5, 5, 2, 'r'); R(g, x - 1, yb - 5, 1, 1, 'w'); R(g, x + 1, yb - 4, 1, 1, 'w'); }
function tulipG(g, x, yb, c) { R(g, x, yb - 4, 1, 4, 'G'); R(g, x - 1, yb - 7, 3, 3, 'd'); R(g, x, yb - 6, 1, 2, c); R(g, x - 1, yb - 6, 1, 1, c); R(g, x + 1, yb - 6, 1, 1, c); }
function arrowShine(g, x, y, big) { skinGlints.push([x, y, big ? 1 : 0]); }
function crystalG(g, x, yb, hh) {                  // кристал-стовпчик з гострою верхівкою: світла ліва грань, темна права
  R(g, x, yb - hh, 1, 1, 'n');
  R(g, x - 1, yb - hh + 1, 3, 1, 'n'); R(g, x, yb - hh + 1, 1, 1, 'w');
  for (let y = yb - hh + 2; y < yb; y++) { R(g, x - 2, y, 5, 1, 'n'); R(g, x - 1, y, 1, 1, 'w'); R(g, x, y, 1, 1, 'S'); R(g, x + 1, y, 1, 1, 's'); }
  R(g, x - 1, yb, 3, 1, 'n');
}

function skinShopDeco(g, skin, w, h, look, yG, door) {
  const top = look.top, rb = top + 3;
  if (skin === 'xmas') {
    for (let x = 4; x < w - 4; x += 4) { const c = ['r', 'y', 'g', 'n'][(x >> 2) % 4], wy = yG + 11 + ((x >> 2) % 2); R(g, x, wy, 2, 2, c); R(g, x, wy - 1, 1, 1, 'd'); }
    treeXmasG(g, door.x + door.w + 14, h - 7);
    R(g, door.x - 4, yG + 10, door.w + 8, 2, 'r'); R(g, door.x - 2, yG + 12, 2, 2, 'y');
    wreathG(g, door.x + (door.w >> 1), yG + 4, 6, 'g', 'G'); R(g, door.x + (door.w >> 1) - 2, yG + 9, 5, 1, 'd');
    giftG(g, 11, h - 7, 9, 7, 'r'); giftG(g, 21, h - 7, 8, 5, 'n'); giftG(g, 14, h - 14, 7, 5, 'g');
    candyCaneG(g, door.x - 8, h - 7, 10); candyCaneG(g, door.x + door.w + 6, h - 7, 8);
    R(g, 4, top + 14, 1, 14, 'd'); R(g, 5, top + 24, 7, 8, 'd'); R(g, 6, top + 25, 5, 6, 'r'); R(g, 6, top + 25, 5, 1, 'w');             // шкарпетка біля краю
    snowCap(g.canvas, top + 4);
    for (let x = 6; x < w - 6; x += 5) { if (x > door.x - 8 && x < door.x + door.w + 8) continue; const c = ['r', 'y', 'g', 'n'][(x / 5 | 0) % 4]; R(g, x, top + 6, 2, 2, c); R(g, x, top + 6, 1, 1, 'w'); R(g, x, top + 5, 1, 1, 'd'); }           // вогники по краю даху
    [3, w - 8].forEach(cx => { for (let y = top + 12; y < h - 12; y += 6) R(g, cx + 1, y, 1, 1, 'y'); });                                            // золоті вогники на колонах
    for (let x = 4; x < w - 4; x += 9) { if (x > door.x - 6 && x < door.x + door.w + 6) continue; R(g, x, h - 9, 5, 2, 'w'); R(g, x + 1, h - 10, 3, 1, 'w'); }   // замети під вітриною
    if (w - 14 > door.x + door.w + 28) snowmanG(g, w - 14, h - 7);
  } else if (skin === 'halloween') {
    pumpkinG(g, door.x - 12, h - 7, 5); pumpkinG(g, door.x + door.w + 11, h - 7, 4);
    tombstoneG(g, 14, h - 7); tombstoneG(g, w - 12, h - 7); candleG(g, 24, h - 7); candleG(g, w - 22, h - 7);
    spiderG(g, door.x + door.w - 4, yG + 10, 8); spiderG(g, 30, yG + 12, 5);
    for (let x = 6; x < w - 6; x += 9) { R(g, x, yG + 10, 2, 2 + ((x * 3) % 4), 'm'); }                                               // слиз із навісу
    g.globalAlpha = 0.85; lineG(g, 3, top + 6, 17, top + 6, 'w'); lineG(g, 3, top + 6, 3, top + 20, 'w'); lineG(g, 3, top + 6, 14, top + 17, 'w'); lineG(g, 3, top + 10, 10, top + 10, 'w'); lineG(g, 3, top + 14, 7, top + 14, 'w'); g.globalAlpha = 1;
    [[w - 20, top + 3], [w - 12, top + 7]].forEach(([bx, by]) => { R(g, bx, by, 5, 1, 'k'); R(g, bx - 1, by - 1, 2, 2, 'k'); R(g, bx + 4, by - 1, 2, 2, 'k'); R(g, bx + 2, by + 1, 1, 1, 'k'); });
    ghostG(g, w - 22, top + 18); ghostG(g, 26, yG + 6);
    if (door.x - 20 > 10) cauldronG(g, door.x - 18, h - 7);
    batG(g, Math.round(w * 0.3), top + 14); batG(g, Math.round(w * 0.7), top + 10); batG(g, door.x + door.w + 20, yG + 8);
    for (let x = 8; x < w - 8; x += 6) R(g, x, top + 6, 2, 1, x % 12 ? 'o' : 'P');                                                              // оранжево-фіолетовий ряд по даху
  } else if (skin === 'spring') {
    lineG(g, 2, top + 5, 26, top + 12, 'b'); lineG(g, 2, top + 6, 26, top + 13, 'd');
    for (let i = 0; i < 16; i++) { const px = 4 + ((i * 7) % 24), py = top + 6 + Math.round(px * 0.28) + ((i * 5) % 7) - 3; R(g, px, py, 2, 2, i % 3 ? 'p' : 'q'); R(g, px, py, 1, 1, 'w'); }
    potG(g, door.x - 18, yG + 24, 'f'); potG(g, door.x + door.w + 13, yG + 24, 'y');
    for (let x = 6; x < w - 6; x += 11) R(g, x, yG + 12, 2, 2, 'q');
    for (let a = 0; a < 15; a++) { const t = a / 14, ax = door.x - 4 + t * (door.w + 8), ay = yG + 9 - Math.sin(t * Math.PI) * 6; if (a % 2) { R(g, Math.round(ax) - 1, Math.round(ay) - 1, 3, 3, 'd'); R(g, Math.round(ax) - 1, Math.round(ay) - 1, 2, 2, a % 4 === 1 ? 'p' : 'w'); } else R(g, Math.round(ax), Math.round(ay), 1, 2, 'g'); }       // арка з квітів над дверима
    butterflyG(g, 24, top + 22, 'p', 'w'); butterflyG(g, w - 24, top + 18, 'y', 'o');
    R(g, 8, h - 13, 12, 6, 'd'); R(g, 9, h - 12, 10, 4, 'b'); for (let i = 0; i < 4; i++) { R(g, 10 + i * 2, h - 15, 2, 3, i % 2 ? 'f' : 'p'); R(g, 10 + i * 2, h - 13, 1, 1, 'g'); }       // ящик із тюльпанами
    R(g, w - 20, h - 12, 10, 5, 'd'); R(g, w - 19, h - 11, 8, 3, 'w'); R(g, w - 16, h - 14, 4, 3, 'w'); R(g, w - 15, h - 15, 2, 1, 'd'); R(g, w - 14, h - 13, 1, 1, 'f');                   // великодній кошик
    lineG(g, w - 3, top + 5, w - 27, top + 12, 'b'); lineG(g, w - 3, top + 6, w - 27, top + 13, 'd');                                      // друга гілка з цвітом справа
    for (let i = 0; i < 14; i++) { const px = w - 5 - ((i * 7) % 24), py = top + 6 + Math.round((w - px) * 0.28) + ((i * 5) % 7) - 3; R(g, px, py, 2, 2, i % 3 ? 'q' : 'w'); R(g, px, py, 1, 1, 'p'); }
    for (let x = 5; x < w - 5; x += 7) { if (x > door.x - 4 && x < door.x + door.w + 4) continue; tulipG(g, x, h - 7, ['f', 'p', 'y', 'q', 'o'][(x / 7 | 0) % 5]); }   // клумба з тюльпанами
    if (w - 18 > door.x + door.w + 26) bunnyG(g, w - 18, h - 7);
    butterflyG(g, Math.round(w * 0.5), top + 14, 'q', 'f');
  } else if (skin === 'autumn') {
    for (let x = 5; x < w - 8; x += 8) { const c = ['o', 'r', 'h'][(x >> 3) % 3]; R(g, x, top + 8, 3, 2, c); R(g, x + 1, top + 10, 1, 1, 'b'); }
    pumpkinG(g, door.x + door.w + 12, h - 7, 4); leafPileG(g, door.x - 14, h - 7); leafPileG(g, w - 12, h - 7);
    hayBaleG(g, 8, h - 7); hayBaleG(g, 12, h - 16); cornG(g, 26, h - 7); cornG(g, 31, h - 7);
    wreathG(g, door.x + (door.w >> 1), yG + 4, 6, 'o', 'r'); R(g, door.x + (door.w >> 1) - 2, yG + 9, 5, 1, 'd');
    R(g, w - 30, h - 12, 12, 6, 'd'); R(g, w - 29, h - 11, 10, 4, 'b'); for (let i = 0; i < 4; i++) { disc(g, w - 27 + i * 3, h - 13, 2, 'd'); disc(g, w - 27 + i * 3, h - 13, 1, i % 2 ? 'r' : 'J'); }     // ящик яблук
    for (let x = 6; x < w - 6; x += 4) R(g, x, yG + 12 + ((x >> 2) & 1), 2, 2, ['o', 'r', 'h'][(x >> 2) % 3]);                          // гірлянда з листя
    R(g, door.x + 1, yG + 11, door.w - 2, 1, 'r'); R(g, door.x + 2, yG + 12, door.w - 4, 1, 'o');
    if (w - 14 > door.x + door.w + 30) scarecrowG(g, w - 14, h - 7);
    mushroomG(g, 40, h - 7); mushroomG(g, 46, h - 7); if (door.x + door.w + 12 < w - 40) mushroomG(g, door.x + door.w + 10, h - 7);
    [3, w - 8].forEach((cx, i) => { for (let y = top + 10; y < h - 12; y += 5) R(g, cx + (y % 2), y, 2, 1, ['o', 'r', 'h'][((y / 5 | 0) + i) % 3]); });         // листя на колонах
    for (let x = 7; x < w - 7; x += 11) R(g, x, top + 6, 3, 1, ['o', 'r', 'h'][(x / 11 | 0) % 3]);
  }
  else if (skin === 'candy') {
    const colTop = top + 8;
    [3, w - 8].forEach(cx => { for (let yy = colTop; yy < h - 8; yy++) for (let dx = 0; dx < 3; dx++) R(g, cx + dx, yy, 1, 1, ((yy + dx * 2) % 8 < 4) ? 'r' : 'w'); R(g, cx - 1, colTop, 1, h - 8 - colTop, 'd'); R(g, cx + 3, colTop, 1, h - 8 - colTop, 'd'); });      // колони — цукерові тростини в червоно-білу смужку
    for (let x = 6; x < w - 16; x += 6) { const dh = 2 + ((x * 7) % 4); R(g, x, top + 8, 4, 1, 'w'); R(g, x, top + 9, 4, dh, 'w'); R(g, x + 1, top + 9 + dh, 2, 1, 'w'); R(g, x + 1, top + 9, 1, dh, 'q'); }        // глазур стікає з верху вивіски
    for (let i = 0; i < 26; i++) { const sx = 8 + ((i * 53) % (w - 30)), sy = top + 8 + ((i * 29) % 3); R(g, sx, sy, 2, 1, ['y', 'm', 's', 'o', 'u', 'f'][i % 6]); }      // посипка
    R(g, door.x - 3, yG + 10, door.w + 6, 4, 'd'); R(g, door.x - 2, yG + 10, door.w + 4, 3, 'h'); for (let x = door.x - 2; x < door.x + door.w + 2; x += 3) { R(g, x, yG + 10, 1, 3, 'c'); } R(g, door.x - 2, yG + 11, door.w + 4, 1, 'c');         // вафельний наличник над дверима
    [['f'], ['m'], ['y'], ['u'], ['o']].forEach((c, i) => { const gx = 12 + i * 8; if (gx < door.x - 6) gumdropG(g, gx, h - 7, c[0]); });         // мармеладки під вітриною ліворуч
    [['y'], ['f'], ['m'], ['u']].forEach((c, i) => { const gx = door.x + door.w + 10 + i * 8; if (gx < w - 24) gumdropG(g, gx, h - 7, c[0]); });
    bigLollipopG(g, w - 15, h - 7, top + 6, 7);                // єдиний великий довгий лоліпоп попереду
  } else if (skin === 'ice') {                                   // бурульки під навісом, сніг на даху, сніговик і крижані блоки
    for (let x = 3; x < w - 3; x += 6) { const L = 3 + ((x * 5) % 4); R(g, x, yG + 11, 2, L, 'a'); R(g, x, yG + 11 + L, 1, 2, 'w'); R(g, x + 3, yG + 11, 1, 2, 'S'); R(g, x, yG + 11, 1, L, 'w'); }
    snowCap(g.canvas, top + 4);
    snowmanG(g, w - 14, h - 7);
    [[10, 0], [20, 1], [15, -7]].forEach(([bx, k]) => { const by = h - 7 + (k < 0 ? -9 + 7 : 0); R(g, bx - 4, by - 8 + (k < 0 ? 2 : 0), 9, 8, 'd'); R(g, bx - 3, by - 7 + (k < 0 ? 2 : 0), 7, 6, k < 0 ? 'S' : 'a'); R(g, bx - 3, by - 7 + (k < 0 ? 2 : 0), 7, 1, 'w'); R(g, bx - 2, by - 6 + (k < 0 ? 2 : 0), 1, 3, 'w'); });
    for (let x = 6; x < w - 6; x += 4) if ((x * 7) % 5 < 2) R(g, x, h - 8 + ((x >> 2) & 1), 4, 2, 'w');                  // замети
    [[w - 6, top + 14], [8, top + 14]].forEach(([sx, sy]) => { R(g, sx, sy - 2, 1, 5, 'w'); R(g, sx - 2, sy, 5, 1, 'w'); R(g, sx - 1, sy - 1, 3, 3, 'S'); });                // сніжинки
  } else if (skin === 'wood') {                                  // колоди біля дверей і діжка
    for (let i = 0; i < 3; i++) { R(g, 11, h - 14 + i * 4, 12, 4, 'd'); R(g, 12, h - 13 + i * 4, 10, 2, 'l'); R(g, 12, h - 13 + i * 4, 3, 2, 'c'); R(g, 21, h - 13 + i * 4, 1, 2, 'b'); }
    barrelG(g, w - 24, h - 7);
    R(g, 26, h - 12, 8, 5, 'd'); R(g, 27, h - 11, 6, 3, 'l'); R(g, 28, h - 11, 2, 3, 'c'); R(g, 31, h - 17, 1, 6, 'b'); R(g, 29, h - 18, 5, 3, 'd'); R(g, 30, h - 17, 3, 1, 'Y'); R(g, 33, h - 18, 1, 2, 'Y');     // пеньок із сокирою
    R(g, door.x - 2, yG + 9, door.w + 4, 1, 'd'); [[-2, -1], [door.w + 1, 1]].forEach(([dx, s]) => { R(g, door.x + dx, yG + 5, 1, 4, 'c'); R(g, door.x + dx + s, yG + 4, 1, 3, 'c'); R(g, door.x + dx - s, yG + 6, 1, 2, 'c'); });     // роги над дверима
    for (let y = yG + 14; y < h - 8; y += 4) { R(g, 2, y, 2, 1, 'd'); R(g, w - 4, y, 2, 1, 'd'); }          // стики колод по краях
    R(g, door.x + door.w + 9, yG + 5, 1, 6, 'd'); R(g, door.x + door.w + 6, yG + 11, 7, 5, 'd'); R(g, door.x + door.w + 7, yG + 12, 5, 3, 'y'); R(g, door.x + door.w + 9, yG + 12, 1, 3, 'h');           // підвісний ліхтар
  } else if (skin === 'garden') {                                // ліани з даху, квіткові горщики, шпалера з трояндами, лійка, соняшники й метелики
    [8, w - 10, Math.round(w * 0.5)].forEach((x, i) => vinesG(g, x, top + 8, 6 + i * 2));
    potG(g, door.x - 18, yG + 24, 'f'); potG(g, door.x + door.w + 13, yG + 24, 'y');
    sunflowerG(g, 12, h - 7); sunflowerG(g, 21, h - 7); sunflowerG(g, w - 12, h - 7);
    for (let y = yG + 12; y < h - 9; y += 3) { R(g, w - 30, y, 14, 1, 'b'); } for (let x = w - 30; x < w - 16; x += 4) R(g, x, yG + 12, 1, h - 9 - yG - 12, 'b');
    for (let i = 0; i < 10; i++) { const rx = w - 29 + ((i * 5) % 13), ry = yG + 13 + ((i * 7) % 18); R(g, rx, ry, 3, 3, 'd'); R(g, rx, ry, 2, 2, i % 2 ? 'r' : 'f'); R(g, rx, ry, 1, 1, 'q'); R(g, rx + 3, ry + 2, 2, 1, 'g'); }
    R(g, door.x - 14, h - 11, 8, 5, 'd'); R(g, door.x - 13, h - 10, 6, 3, 'Y'); R(g, door.x - 7, h - 13, 4, 1, 'd'); R(g, door.x - 5, h - 12, 1, 2, 'd'); R(g, door.x - 17, h - 12, 3, 1, 'd');       // лійка
    butterflyG(g, 30, top + 22, 'o', 'y'); butterflyG(g, w - 38, top + 16, 'v', 'a'); butterflyG(g, 44, h - 24, 'p', 'q');
  } else if (skin === 'diamond') {
    R(g, door.x - 3, yG + 10, door.w + 6, 1, 'w'); R(g, door.x - 2, yG + 11, 1, 22, 'a'); R(g, door.x + door.w + 1, yG + 11, 1, 22, 'a');      // кришталева рамка дверей
    gemG(g, door.x + (door.w >> 1) - 2, yG + 5, 'N', 'a');                                                                                // діамант над дверима
    for (let x = 6; x < w - 6; x += 6) { R(g, x, yG + 11, 1, 3, 'S'); R(g, x, yG + 14, 1, 1, 'w'); R(g, x + 3, yG + 11, 1, 2, 'a'); }       // кришталеві підвіски під навісом
    [3, w - 8].forEach(cx => { R(g, cx + 1, top + 8, 1, h - 16 - top, 'w'); R(g, cx + 2, top + 8, 1, h - 16 - top, 'S'); });                 // блиск на колонах
    for (let x = 4; x < w - 4; x += 7) { R(g, x, h - 6, 1, 3, 'S'); R(g, x + 1, h - 6, 1, 1, 'w'); }                                       // кришталевий цоколь
    crystalG(g, 12, h - 7, 9); crystalG(g, 18, h - 7, 6); crystalG(g, door.x - 8, h - 7, 7);
    crystalG(g, w - 24, h - 7, 6); crystalG(g, w - 17, h - 7, 11); crystalG(g, w - 10, h - 7, 7);
    gemG(g, 6, yG + 18, 'N', 'a'); gemG(g, w - 11, yG + 18, 'S', 'w'); gemG(g, 6, yG + 30, 'a', 'w'); gemG(g, w - 11, yG + 30, 'N', 'a');         // самоцвіти на колонах
    [[8, top + 9, 1], [w - 9, top + 9, 1], [8, yG + 20, 0], [w - 9, yG + 20, 0], [8, yG + 32, 1], [w - 9, yG + 32, 0], [door.x + (door.w >> 1), yG + 6, 1], [12, h - 17, 0], [w - 17, h - 19, 1], [door.x - 8, h - 15, 0], [4, h - 20, 0], [w - 6, h - 26, 0]].forEach(([x, y, b]) => arrowShine(g, x, y, b));
  } else if (skin === 'gold') {
    R(g, door.x - 3, yG + 10, door.w + 6, 1, 'y'); R(g, door.x - 2, yG + 11, 1, 22, 'h'); R(g, door.x + door.w + 1, yG + 11, 1, 22, 'h');   // позолочена рамка дверей
    R(g, door.x - 3, yG + 10, door.w + 6, 1, 'w'); gemG(g, door.x + (door.w >> 1) - 2, yG + 5, 'N', 'a');                                       // діамант над дверима
    for (let x = 6; x < w - 6; x += 5) { R(g, x, yG + 11, 3, 3, 'd'); R(g, x, yG + 11, 2, 2, 'w'); R(g, x, yG + 11, 1, 1, 'S'); }               // нитки перлів під навісом
    [3, w - 8].forEach(cx => { R(g, cx + 1, top + 8, 1, h - 16 - top, 'w'); R(g, cx + 2, top + 8, 1, h - 16 - top, 'y'); });                  // блиск на колонах
    for (let x = 4; x < w - 4; x += 7) { R(g, x, h - 6, 1, 3, 'y'); R(g, x + 1, h - 6, 1, 1, 'w'); }                                              // позолочений цоколь
    coinStackG(g, 12, h - 7, 4); coinStackG(g, 24, h - 7, 2); coinStackG(g, door.x - 8, h - 7, 3);
    goldBarsG(g, w - 30, h - 7); coinStackG(g, w - 12, h - 7, 5);
    gemG(g, 6, yG + 18, 'f', 'q'); gemG(g, w - 11, yG + 18, 'N', 'a'); gemG(g, 6, yG + 30, 'r', 'J'); gemG(g, w - 11, yG + 30, 'f', 'q');         // самоцвіти на колонах
    [[8, top + 9, 1], [w - 9, top + 9, 1], [8, yG + 20, 0], [w - 9, yG + 20, 0], [8, yG + 32, 1], [w - 9, yG + 32, 0], [door.x + (door.w >> 1), yG + 6, 1], [12, h - 14, 0], [w - 30, h - 15, 0], [w - 12, h - 18, 1], [door.x - 8, h - 12, 0], [4, h - 20, 0], [w - 6, h - 26, 0]].forEach(([x, y, b]) => arrowShine(g, x, y, b));
  }
}
