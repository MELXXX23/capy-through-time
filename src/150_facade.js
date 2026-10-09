//#part 150_facade.js
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
    const dept = bayNo * 2 + s2;
    if (dept < DEPARTMENTS.length) drawDisplay(g, x + 1 + s2 * 17, y + 1, s2 ? 16 : 15, 16, (EPOCH_GOODS_KINDS[viewEpoch() % EPOCH_GOODS_KINDS.length] || [])[dept] || DEPARTMENTS[dept].display, tiers[dept]);
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
  { flat: false, roofPal: { r: 'p', n: 'T' }, trim: 'q', col: ['T', 'a'], frame: ['d', 'T'], glass: 'q', base: 'E', band: ['checker', 'w'], awning: 'scallop', inner: ['q', 'm', 'y'], fx: 'retro', roofs: [2, 2, 2, 3, 3, 3] },
  { flat: false, roofPal: { r: 'J', n: 'P' }, trim: 'P', col: ['P', 'J'], frame: ['d', 'f'], glass: 'j', base: 'P', band: ['dots', 'y'], awning: 'scallop', inner: ['J', 'j', 'P'], fx: 'disco', roofs: [2, 2, 3, 3, 6, 3] },
  { flat: true, roofPal: { r: 'v', n: 'V' }, trim: 'V', col: ['V', 'v'], frame: ['k', 'T'], glass: 'v', base: 'V', band: ['checker', 'v'], awning: 'flat', inner: ['V', 'P', 'v'], fx: 'arcade' },
  { flat: true, roofPal: { r: 'n', n: 'e' }, trim: 'a', col: ['e', 'E'], frame: ['n', 'a'], glass: 'a', base: 'e', band: ['dots', 'n'], awning: 'flat', inner: ['a', 'w', 'S'], fx: 'internet' },
  { flat: true, roofPal: { r: 'g', n: 'G' }, trim: 'g', col: ['b', 'c'], frame: ['G', 'm'], glass: 'm', base: 'b', band: ['leaf', 'G'], awning: 'flat', inner: ['m', 'c', 'y'], fx: 'eco' },
  { flat: true, roofPal: { r: 'n', n: 'u' }, trim: 'z', col: ['n', 's'], frame: ['z', 'S'], glass: 'n', base: 'z', band: ['dots', 'S'], awning: 'flat', inner: ['z', 'n', 'V'], fx: 'space' },
  { flat: true, roofPal: { r: 'f', n: 'T' }, trim: 'k', col: ['k', 'T'], frame: ['k', 'f'], glass: 'v', base: 'k', band: ['zig', 'T'], awning: 'flat', inner: ['k', 'V', 'z'], fx: 'neon' }
];
const FLAT_ROOF = [2, 2, 2, 3, 6, 5];       // який дах у «плоских» епохах для кожного рівня
function epochShopStyle() { return EPOCH_SHOP[viewEpoch() % EPOCH_SHOP.length]; }
// Варіант вигляду магазину: залежить від епохи й рівня, тож усі магазини схожі за стилем епохи, але не однакові
function shopVariant(level) { return hash2(viewEpoch() * 17 + level * 5 + 3, 7) % 4; }
const EPOCH_AWN = [
  [['r', 'w'], ['g', 'w'], ['n', 'y'], ['u', 'w']], [['p', 'w'], ['q', 'w'], ['y', 'w'], ['T', 'w']], [['f', 'y'], ['J', 'w'], ['u', 'y'], ['T', 'f']], [['T', 'f'], ['v', 'y'], ['r', 'k'], ['y', 'k']],
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
function arrowShine(g, x, y, big) { skinGlints.push([x, y, big ? 1 : 0]); }

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
  } else if (skin === 'halloween') {
    pumpkinG(g, door.x - 12, h - 7, 5); pumpkinG(g, door.x + door.w + 11, h - 7, 4);
    tombstoneG(g, 14, h - 7); tombstoneG(g, w - 12, h - 7); candleG(g, 24, h - 7); candleG(g, w - 22, h - 7);
    spiderG(g, door.x + door.w - 4, yG + 10, 8); spiderG(g, 30, yG + 12, 5);
    for (let x = 6; x < w - 6; x += 9) { R(g, x, yG + 10, 2, 2 + ((x * 3) % 4), 'm'); }                                               // слиз із навісу
    g.globalAlpha = 0.85; lineG(g, 3, top + 6, 17, top + 6, 'w'); lineG(g, 3, top + 6, 3, top + 20, 'w'); lineG(g, 3, top + 6, 14, top + 17, 'w'); lineG(g, 3, top + 10, 10, top + 10, 'w'); lineG(g, 3, top + 14, 7, top + 14, 'w'); g.globalAlpha = 1;
    [[w - 20, top + 3], [w - 12, top + 7]].forEach(([bx, by]) => { R(g, bx, by, 5, 1, 'k'); R(g, bx - 1, by - 1, 2, 2, 'k'); R(g, bx + 4, by - 1, 2, 2, 'k'); R(g, bx + 2, by + 1, 1, 1, 'k'); });
  } else if (skin === 'spring') {
    lineG(g, 2, top + 5, 26, top + 12, 'b'); lineG(g, 2, top + 6, 26, top + 13, 'd');
    for (let i = 0; i < 16; i++) { const px = 4 + ((i * 7) % 24), py = top + 6 + Math.round(px * 0.28) + ((i * 5) % 7) - 3; R(g, px, py, 2, 2, i % 3 ? 'p' : 'q'); R(g, px, py, 1, 1, 'w'); }
    potG(g, door.x - 18, yG + 24, 'f'); potG(g, door.x + door.w + 13, yG + 24, 'y');
    for (let x = 6; x < w - 6; x += 11) R(g, x, yG + 12, 2, 2, 'q');
    for (let a = 0; a < 15; a++) { const t = a / 14, ax = door.x - 4 + t * (door.w + 8), ay = yG + 9 - Math.sin(t * Math.PI) * 6; if (a % 2) { R(g, Math.round(ax) - 1, Math.round(ay) - 1, 3, 3, 'd'); R(g, Math.round(ax) - 1, Math.round(ay) - 1, 2, 2, a % 4 === 1 ? 'p' : 'w'); } else R(g, Math.round(ax), Math.round(ay), 1, 2, 'g'); }       // арка з квітів над дверима
    butterflyG(g, 24, top + 22, 'p', 'w'); butterflyG(g, w - 24, top + 18, 'y', 'o');
    R(g, 8, h - 13, 12, 6, 'd'); R(g, 9, h - 12, 10, 4, 'b'); for (let i = 0; i < 4; i++) { R(g, 10 + i * 2, h - 15, 2, 3, i % 2 ? 'f' : 'p'); R(g, 10 + i * 2, h - 13, 1, 1, 'g'); }       // ящик із тюльпанами
    R(g, w - 20, h - 12, 10, 5, 'd'); R(g, w - 19, h - 11, 8, 3, 'w'); R(g, w - 16, h - 14, 4, 3, 'w'); R(g, w - 15, h - 15, 2, 1, 'd'); R(g, w - 14, h - 13, 1, 1, 'f');                   // великодній кошик
  } else if (skin === 'autumn') {
    for (let x = 5; x < w - 8; x += 8) { const c = ['o', 'r', 'h'][(x >> 3) % 3]; R(g, x, top + 8, 3, 2, c); R(g, x + 1, top + 10, 1, 1, 'b'); }
    pumpkinG(g, door.x + door.w + 12, h - 7, 4); leafPileG(g, door.x - 14, h - 7); leafPileG(g, w - 12, h - 7);
    hayBaleG(g, 8, h - 7); hayBaleG(g, 12, h - 16); cornG(g, 26, h - 7); cornG(g, 31, h - 7);
    wreathG(g, door.x + (door.w >> 1), yG + 4, 6, 'o', 'r'); R(g, door.x + (door.w >> 1) - 2, yG + 9, 5, 1, 'd');
    R(g, w - 30, h - 12, 12, 6, 'd'); R(g, w - 29, h - 11, 10, 4, 'b'); for (let i = 0; i < 4; i++) { disc(g, w - 27 + i * 3, h - 13, 2, 'd'); disc(g, w - 27 + i * 3, h - 13, 1, i % 2 ? 'r' : 'J'); }     // ящик яблук
    for (let x = 6; x < w - 6; x += 4) R(g, x, yG + 12 + ((x >> 2) & 1), 2, 2, ['o', 'r', 'h'][(x >> 2) % 3]);                          // гірлянда з листя
    R(g, door.x + 1, yG + 11, door.w - 2, 1, 'r'); R(g, door.x + 2, yG + 12, door.w - 4, 1, 'o');
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
function withPal(map, fn) {                   // тимчасово підміняє кольори палітри на час малювання
  if (!map) { fn(); return; }
  const sv = {}; Object.keys(map).forEach(k => { sv[k] = PALETTE[k]; PALETTE[k] = PALETTE[map[k]]; });
  try { fn(); } finally { Object.keys(sv).forEach(k => { PALETTE[k] = sv[k]; }); }
}
function bandG(g, w, y, band) {               // візерунок на карнизі (рядки y+1, y+2)
  if (!band) return;
  const kind = band[0], c = band[1];
  for (let x = 2; x < w - 2; x++) {
    if (kind === 'checker') { if (((x >> 1) & 1) === 0) R(g, x, y + 1, 1, 1, c); else R(g, x, y + 2, 1, 1, c); }
    else if (kind === 'dots') { if (x % 5 === 2) R(g, x, y + 1, 1, 2, c); }
    else if (kind === 'leaf') { if (x % 6 === 1) { R(g, x, y + 1, 2, 1, c); R(g, x + 1, y + 2, 1, 1, c); } }
    else if (kind === 'zig') { R(g, x, y + 1 + (((x >> 1) & 1)), 1, 1, c); }
  }
}
function vinesG(g, x, y, len) {               // ліани, що звисають зверху
  for (let i = 0; i < len; i++) { const dx = (i % 6 < 3 ? 0 : 1); R(g, x + dx, y + i, 1, 1, i % 4 === 3 ? 'g' : 'G'); if (i % 5 === 2) R(g, x + dx + 1, y + i, 2, 1, 'g'); if (i % 9 === 4) R(g, x + dx - 1, y + i, 1, 1, 'p'); }
}
function neonLine(g, x, y, w, h, c) {         // неонова трубка: яскрава серцевина + слабке сяйво
  g.globalAlpha = 0.28; R(g, x - 1, y - 1, w + 2, h + 2, c); g.globalAlpha = 1; R(g, x, y, w, h, c);
}
// Рисочки епохи на фасаді (виконуються після основного фасаду)
/* ---------- Деталізація фасаду під кожну епоху: таверна, закусочна, диско-клуб, аркада, інтернет-магазин, еко-ринок, космостанція, неон ---------- */
function barrelG(g, x, yb) {                       // діжка: 9×11
  R(g, x, yb - 11, 9, 11, 'd'); R(g, x + 1, yb - 10, 7, 9, 'b'); R(g, x + 1, yb - 10, 2, 9, 'l');
  R(g, x, yb - 8, 9, 1, 'd'); R(g, x, yb - 3, 9, 1, 'd'); R(g, x + 3, yb - 6, 3, 2, 'h');
}
function crateG(g, x, yb, c) { R(g, x, yb - 8, 10, 8, 'd'); R(g, x + 1, yb - 7, 8, 6, c); R(g, x + 1, yb - 7, 8, 1, 'w'); R(g, x + 4, yb - 7, 2, 6, 'd'); }
function speakerG(g, x, yb) {                       // колонка: 10×16 із двома динаміками
  R(g, x, yb - 16, 10, 16, 'k'); R(g, x + 1, yb - 15, 8, 14, 'z'); disc(g, x + 5, yb - 11, 3, 'k'); disc(g, x + 5, yb - 11, 1, 'e'); disc(g, x + 5, yb - 5, 2, 'k'); disc(g, x + 5, yb - 5, 1, 'e');
}
function cabinetG(g, x, yb, c) {                    // ігровий автомат: 13×22
  R(g, x, yb - 22, 13, 22, 'k'); R(g, x + 1, yb - 21, 11, 20, c); R(g, x + 2, yb - 19, 9, 8, 'k'); R(g, x + 3, yb - 18, 7, 6, 's'); R(g, x + 4, yb - 17, 2, 2, 'y'); R(g, x + 7, yb - 15, 2, 2, 'r');
  R(g, x + 2, yb - 9, 9, 3, 'd'); R(g, x + 4, yb - 8, 1, 1, 'r'); R(g, x + 7, yb - 8, 2, 1, 'y'); R(g, x + 1, yb - 3, 11, 3, 'd');
}
function lockerG(g, x, yb) {                        // посилкові комірки: 18×18
  R(g, x, yb - 18, 18, 18, 'd'); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { R(g, x + 1 + i * 6, yb - 17 + j * 6, 5, 5, [['T', 'S', 'y'], ['p', 'T', 'S'], ['S', 'y', 'p']][j][i]); R(g, x + 4 + i * 6, yb - 15 + j * 6, 1, 1, 'd'); }
}
function bannerHang(g, x, y, c1, c2, n) { for (let i = 0; i < n; i++) { R(g, x + i * 6, y, 5, 1, 'd'); for (let k = 0; k < 4; k++) R(g, x + i * 6 + k, y + 1 + k, 5 - k - (k > 2 ? 1 : 0), 1, i % 2 ? c1 : c2); } }
function solarG(g, x, y, n) { for (let i = 0; i < n; i++) { R(g, x + i * 10, y, 9, 4, 'd'); R(g, x + i * 10 + 1, y + 1, 7, 2, 'n'); R(g, x + i * 10 + 4, y + 1, 1, 2, 'a'); R(g, x + i * 10 + 3, y + 4, 3, 2, 'd'); } }
function dishG(g, x, y) { for (let a = -5; a <= 5; a++) { const hh = Math.round(Math.sqrt(25 - a * a) * 0.8); R(g, x + a, y - hh, 1, hh + 1, 'E'); } R(g, x, y - 5, 1, 7, 'd'); R(g, x - 3, y + 2, 7, 1, 'd'); R(g, x + 1, y - 6, 1, 1, 'r'); }
function hologram(g, x, y, w, h, c) { g.globalAlpha = 0.35; R(g, x, y, w, h, c); g.globalAlpha = 1; for (let k = 2; k < h; k += 3) { g.globalAlpha = 0.6; R(g, x, y + k, w, 1, 'w'); g.globalAlpha = 1; } R(g, x, y, w, 1, c); R(g, x, y + h - 1, w, 1, c); R(g, x, y, 1, h, c); R(g, x + w - 1, y, 1, h, c); }
function epochFacadeDeco(g, es, w, h, look, level, floors, yG, door, yB) {
  const top = look.top, f0 = floors[0], yb = h - 7, big = level >= 4;
  const L0 = 11, L1 = door.x - 6, R0 = door.x + door.w + 6, R1 = w - 12;           // вільні місця біля дверей на нижньому поверсі
  const slotsL = 1, slotsR = 1;                         // лише по одній тематичній деталі з кожного боку від дверей
  const flat = es.flat;
  switch (es.fx) {
    case 'renaissance': {                              // таверна: дерев'яні балки, діжки, вивіска з кухлем
      for (let i = 0; i < slotsL; i++) barrelG(g, L0 + i * 13, yb);
      if (slotsR > 1) for (let i = 0; i < slotsR - 1; i++) barrelG(g, R1 - 9 - i * 13, yb); else barrelG(g, R1 - 9, yb);
      const bx = w - 38, by = yG + 12;                 // кронштейн і дошка-вивіска «кухоль»
      R(g, bx, by, 18, 2, 'd'); R(g, bx + 17, by - 4, 2, 6, 'd'); R(g, bx + 2, by + 2, 1, 4, 'd'); R(g, bx + 14, by + 2, 1, 4, 'd');
      R(g, bx, by + 6, 17, 13, 'd'); R(g, bx + 1, by + 7, 15, 11, 'l'); R(g, bx + 1, by + 7, 15, 1, 'c');
      R(g, bx + 5, by + 9, 6, 7, 'w'); R(g, bx + 5, by + 9, 6, 2, 'y'); R(g, bx + 11, by + 10, 2, 4, 'w'); R(g, bx + 6, by + 15, 4, 1, 'd');
      [[11, yG + 14], [w - 15, yG + 14]].forEach(p => lanternG(g, p[0], p[1]));
      break;
    }
    case 'retro': {                                    // закусочна 50-х: хромова смужка, неонова стрілка, джюкбокс
      for (let x = 4; x < w - 4; x++) R(g, x, yB, 1, 1, (x >> 1) % 2 ? 'w' : 'E');
      R(g, 4, yB + 1, w - 8, 1, 'e');
      for (let x = 8; x < w - 20; x += 5) R(g, x, top + 7, 1, 1, 'q');
      const jx = L0 + 4; R(g, jx, yb - 20, 14, 20, 'd'); R(g, jx + 1, yb - 19, 12, 18, 'p'); R(g, jx + 3, yb - 16, 8, 8, 'd'); R(g, jx + 4, yb - 15, 6, 6, 'y'); R(g, jx + 6, yb - 14, 2, 4, 'r'); R(g, jx + 2, yb - 6, 10, 3, 'd'); R(g, jx + 3, yb - 5, 8, 1, 'q'); R(g, jx + 3, yb - 20, 8, 1, 'f');
      const sx = R0 + 3; R(g, sx, yb - 13, 9, 13, 'd'); R(g, sx + 1, yb - 12, 7, 11, 'w'); R(g, sx + 2, yb - 11, 5, 3, 'r'); R(g, sx + 2, yb - 7, 5, 5, 'S'); R(g, sx + 3, yb - 4, 3, 1, 'p'); R(g, sx + 4, yb - 14, 1, 1, 'r');   // молочний коктейль
      [[w - 20, top + 12], [10, top + 12]].forEach(p => { R(g, p[0], p[1], 1, 4, 'f'); R(g, p[0] - 1, p[1] + 1, 3, 1, 'f'); });
      break;
    }
    case 'disco': {                                    // диско-клуб: дзеркальна куля, колонки, промені
      const bx = (w >> 1) - 40; R(g, bx, yG + 8, 1, 5, 'd'); disc(g, bx, yG + 18, 6, 'd'); disc(g, bx, yG + 18, 5, 'E');
      for (let a = -5; a <= 5; a += 2) for (let b = -5; b <= 5; b += 2) if (a * a + b * b < 24) R(g, bx + a, yG + 18 + b, 1, 1, ((a + b) / 2) & 1 ? 'w' : 'S'); R(g, bx - 2, yG + 15, 2, 1, 'w');
      g.globalAlpha = 0.18; for (let i = 0; i < 4; i++) for (let k = 0; k < 24; k++) R(g, bx - 18 + i * 12 + (k >> 1) * (i - 1.5) * 0.7, yG + 20 + k, 3, 1, ['f', 'T', 'y', 'p'][i]); g.globalAlpha = 1;
      for (let i = 0; i < slotsL; i++) speakerG(g, L0 + 1 + i * 13, yb);
      for (let i = 0; i < slotsR; i++) speakerG(g, R1 - 10 - i * 13, yb);
      break;
    }
    case 'arcade': {                                   // зал ігрових автоматів
      for (let i = 0; i < Math.min(2, Math.max(1, Math.floor((L1 - L0) / 14))); i++) cabinetG(g, L0 + i * 14, yb, ['v', 'f', 'T'][i % 3]);
      for (let i = 0; i < Math.min(2, Math.max(1, Math.floor((R1 - R0) / 14))); i++) cabinetG(g, R1 - 13 - i * 14, yb, ['T', 'f', 'v'][i % 3]);
      ['.#.#.', '#####', '##.##', '#####', '.#.#.'].forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') { R(g, 8 + rx, yG - 12 + ry, 1, 1, 'T'); R(g, w - 14 + rx, yG - 12 + ry, 1, 1, 'f'); } });   // піксельні прибульці на стіні
      R(g, door.x + (door.w >> 1) - 1, yG - 14, 2, 12, 'd'); disc(g, door.x + (door.w >> 1), yG - 15, 3, 'r');         // великий джойстик над входом
      break;
    }
    case 'internet': {                                 // інтернет-магазин: Wi-Fi, поштомати-комірки, антена, стрічка новин
      for (let a = 1; a <= 3; a++) for (let t2 = -a * 2; t2 <= a * 2; t2++) { const yy = Math.round(Math.sqrt(Math.max(0, a * a * 6 - t2 * t2)) * 0.6); if (yy > 0) R(g, 12 + t2 + 6, yB - yy - 2, 1, 1, 'a'); }
      R(g, 17, yB - 1, 2, 2, 'a');
      for (let i = 0; i < 1; i++) lockerG(g, L0 + i * 20, yb);
      for (let i = 0; i < 1; i++) { const rx = R1 - 18 - i * 20; R(g, rx, yb - 18, 18, 18, 'd'); R(g, rx + 1, yb - 17, 16, 16, 'k'); for (let k = 0; k < 4; k++) R(g, rx + 2, yb - 15 + k * 4, 14 - (k * 3) % 5, 2, k % 2 ? 'a' : 'T'); }
      if (flat) { dishG(g, w - 22, 10); dishG(g, 24, 12); }
      break;
    }
    case 'eco': {                                      // еко-ринок: дерев'яні рейки, кадки з деревами, сонячні панелі
      for (let i = 0; i < slotsL; i++) { const px = L0 + 2 + i * 13; R(g, px, yb - 6, 9, 6, 'b'); R(g, px, yb - 6, 9, 1, 'l'); disc(g, px + 4, yb - 12, 5, 'G'); disc(g, px + 4, yb - 12, 4, 'g'); R(g, px + 3, yb - 8, 3, 3, 'b'); R(g, px + 2, yb - 14, 2, 2, 'm'); }
      for (let i = 0; i < slotsR; i++) { const px = R1 - 12 - i * 13; R(g, px, yb - 6, 9, 6, 'b'); R(g, px, yb - 6, 9, 1, 'l'); R(g, px + 1, yb - 12, 7, 6, 'g'); R(g, px + 2, yb - 14, 2, 2, 'p'); R(g, px + 5, yb - 13, 2, 2, 'y'); R(g, px + 3, yb - 11, 3, 5, 'G'); }
      if (flat) { solarG(g, 14, 0, Math.min(5, Math.floor((w - 70) / 10))); R(g, w - 24, 0, 1, 1, 'd'); }
      break;
    }
    case 'space': {                                    // космічна станція: шви обшивки, попереджувальні смуги, антени
      for (let i = 0; i < 8; i++) { R(g, door.x - 12 + i * 3, yG + 8, 2, 2, i % 2 ? 'y' : 'd'); R(g, door.x + 4 + door.w - 12 + i * 3 - 12 + 12, yG + 8, 0, 0, 'd'); }
      for (let x = door.x - 4; x < door.x + door.w + 4; x += 4) R(g, x, yG + 8, 2, 2, ((x - door.x) / 4 | 0) % 2 ? 'y' : 'k');
      for (let i = 0; i < slotsL; i++) { const px = L0 + i * 13; R(g, px, yb - 14, 10, 14, 'd'); R(g, px + 1, yb - 13, 8, 12, 'e'); disc(g, px + 5, yb - 8, 3, 'n'); disc(g, px + 5, yb - 8, 2, 's'); R(g, px + 4, yb - 9, 1, 1, 'w'); }
      for (let i = 0; i < slotsR; i++) { const px = R1 - 11 - i * 13; R(g, px, yb - 12, 9, 12, 'd'); R(g, px + 1, yb - 11, 7, 10, 'z'); R(g, px + 2, yb - 9, 5, 1, 'T'); R(g, px + 2, yb - 7, 3, 1, 'T'); R(g, px + 2, yb - 5, 4, 1, 'f'); }
      if (flat) { R(g, 18, 0, 1, 8, 'd'); R(g, 15, 2, 7, 1, 'd'); R(g, 16, 4, 5, 1, 'd'); R(g, 18, 0, 1, 1, 'r'); R(g, w - 36, 2, 1, 6, 'd'); R(g, w - 38, 2, 5, 1, 'e'); }
      break;
    }
    case 'neon': {                                     // неонове місто: голографічна реклама, світні стовпи, дрон
      if (flat) { const ks = lastRoofSign, hl = ks ? Math.max(0, Math.min(10, ks.x - 41)) : 10, hr = ks ? Math.min(w - 34, Math.max(w - 46, ks.x + ks.w + 7)) : w - 46;
        hologram(g, hl, 1, 34, 12, 'T'); R(g, hl + 4, 4, 14, 1, 'w'); R(g, hl + 4, 7, 20, 1, 'f'); hologram(g, hr, 0, 34, 14, 'f'); R(g, hr + 4, 4, 18, 1, 'w'); R(g, hr + 4, 8, 10, 1, 'T'); }
      for (let i = 0; i < slotsL; i++) { const px = L0 + 3 + i * 13; R(g, px, yb - 18, 3, 18, 'k'); R(g, px + 1, yb - 18, 1, 18, i % 2 ? 'f' : 'T'); R(g, px - 2, yb - 22, 7, 4, 'k'); R(g, px - 1, yb - 21, 5, 2, i % 2 ? 'T' : 'f'); }
      for (let i = 0; i < slotsR; i++) { const px = R1 - 6 - i * 13; R(g, px, yb - 18, 3, 18, 'k'); R(g, px + 1, yb - 18, 1, 18, i % 2 ? 'T' : 'f'); R(g, px - 2, yb - 22, 7, 4, 'k'); R(g, px - 1, yb - 21, 5, 2, i % 2 ? 'f' : 'T'); }
      neonLine(g, door.x - 2, yG + 10, 1, 24, 'T'); neonLine(g, door.x + door.w + 1, yG + 10, 1, 24, 'f');
      break;
    }
  }
}

/* ---------- Вивіска й дах: окремий вигляд під кожну епоху ---------- */
// Прикраси по краях вивіски (текст лежить посередині, тож малюємо ліворуч і праворуч) та рамка в стилі епохи
function signMotif(g, es, w, top) {
  const y0 = top + 8, y1 = top + 24, mx = [10, w - 10];                       // межі вивіски й центри лівої/правої прикраси
  switch (es.fx) {
    case 'renaissance':                                                        // дерев'яна дошка з гербовими щитами та ланцюгами
      mx.forEach(x => { R(g, x - 5, y0 + 3, 11, 11, 'd'); R(g, x - 4, y0 + 4, 9, 9, 'r'); R(g, x - 4, y0 + 4, 9, 2, 'y'); R(g, x - 1, y0 + 6, 3, 7, 'w'); R(g, x - 3, y0 + 8, 7, 2, 'w'); R(g, x - 4, y0 + 13, 9, 1, 'd'); });
      for (let x = 22; x < w - 22; x += 14) { R(g, x, y0 + 1, 1, 1, 'y'); R(g, x + 7, y1 - 1, 1, 1, 'y'); }
      R(g, 26, y0 - 6, 1, 6, 'd'); R(g, w - 27, y0 - 6, 1, 6, 'd');
      break;
    case 'retro':                                                              // хром, ромби й зірки
      for (let x = 6; x < w - 6; x++) { R(g, x, y0 + 1, 1, 1, (x >> 1) % 2 ? 'w' : 'E'); R(g, x, y1 - 1, 1, 1, (x >> 1) % 2 ? 'E' : 'w'); }
      mx.forEach(x => { ['..#..', '.###.', '#####', '.###.', '..#..'].forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') R(g, x - 2 + rx, y0 + 5 + ry, 1, 1, 'f'); }); R(g, x - 1, y0 + 6, 3, 1, 'q'); });
      break;
    case 'disco':                                                              // маркізні лампочки і дзеркальні кулі
      for (let x = 7; x < w - 7; x += 4) { R(g, x, y0, 2, 2, (x >> 2) % 2 ? 'y' : 'f'); R(g, x, y1 - 1, 2, 2, (x >> 2) % 2 ? 'f' : 'y'); }
      mx.forEach(x => { disc(g, x, y0 + 8, 5, 'd'); disc(g, x, y0 + 8, 4, 'E'); [[-2, -2], [1, -1], [-1, 1], [2, 2], [0, -3]].forEach(p => R(g, x + p[0], y0 + 8 + p[1], 1, 1, 'w')); R(g, x, y0 + 2, 1, 2, 'd'); });
      break;
    case 'arcade':                                                             // піксельні прибульці та сітка
      mx.forEach((x, i) => { ['.#.....#.', '..#...#..', '.#######.', '##.###.##', '#########', '#.#####.#', '#.#...#.#', '...##.##.'].forEach((row, ry) => { for (let rx = 0; rx < 9; rx++) if (row[rx] === '#') R(g, x - 4 + rx, y0 + 4 + ry, 1, 1, i ? 'f' : 'T'); }); });
      for (let x = 24; x < w - 24; x += 6) R(g, x, y1 - 1, 3, 1, (x / 6 | 0) % 2 ? 'f' : 'T');
      break;
    case 'internet':                                                           // вікно браузера: кнопки, адресний рядок
      R(g, 7, y0 + 1, w - 14, 4, 'e'); R(g, 7, y0 + 1, w - 14, 1, 'E'); R(g, 9, y0 + 2, 2, 2, 'r'); R(g, 13, y0 + 2, 2, 2, 'y'); R(g, 17, y0 + 2, 2, 2, 'g');
      R(g, 24, y0 + 2, w - 48, 2, 'w'); R(g, w - 20, y0 + 2, 10, 2, 'a');
      [w - 9].forEach(x => { disc(g, x, y0 + 10, 3, 'a'); R(g, x - 1, y0 + 9, 3, 2, 'n'); });
      R(g, 9, y0 + 8, 6, 5, 'a'); R(g, 10, y0 + 9, 4, 3, 'n'); R(g, 11, y0 + 12, 2, 1, 'a');
      break;
    case 'eco':                                                                // вінки з листя й ліани
      mx.forEach(x => { for (let a = 0; a < 12; a++) { const ang = a / 12 * Math.PI * 2; R(g, Math.round(x + Math.cos(ang) * 5), Math.round(y0 + 9 + Math.sin(ang) * 5), 2, 2, a % 3 ? 'g' : 'm'); } R(g, x - 1, y0 + 8, 2, 2, 'p'); R(g, x + 1, y0 + 10, 2, 2, 'y'); });
      for (let x = 20; x < w - 20; x += 9) { R(g, x, y0, 1, 2 + (x % 3), 'g'); R(g, x - 1, y0 + 2 + (x % 3), 3, 1, 'm'); }
      break;
    case 'space':                                                              // металева панель із болтами й попереджувальними смугами
      mx.forEach((x, i) => { for (let k = 0; k < 11; k++) { R(g, x - 6 + k, y0 + 2 + (k % 4), 1, 2, 'y'); } for (let k = 0; k < 11; k++) { R(g, x - 6 + k, y0 + 11 + (k % 4) % 3, 1, 2, 'k'); } R(g, x - 6, y0 + 2, 12, 1, 'd'); R(g, x - 6, y0 + 14, 12, 1, 'd'); });
      for (let x = 24; x < w - 24; x += 10) { R(g, x, y0 + 1, 1, 1, 'E'); R(g, x, y1 - 1, 1, 1, 'E'); }
      break;
    case 'neon':                                                               // неонова трубка по контуру та стрілки
      neonLine(g, 7, y0 + 1, w - 14, 1, 'f'); neonLine(g, 7, y1 - 1, w - 14, 1, 'T'); neonLine(g, 7, y0 + 1, 1, 15, 'T'); neonLine(g, w - 8, y0 + 1, 1, 15, 'f');
      mx.forEach((x, i) => { for (let k = 0; k < 4; k++) { R(g, x - 3 + k, y0 + 4 + k, 1, 1, i ? 'T' : 'f'); R(g, x - 3 + k, y0 + 12 - k, 1, 1, i ? 'T' : 'f'); R(g, x + 1 + k, y0 + 4 + k, 1, 1, i ? 'f' : 'T'); R(g, x + 1 + k, y0 + 12 - k, 1, 1, i ? 'f' : 'T'); } });
      break;
  }
}
// Велика примітна деталь на даху в центрі: те, що одразу видно здалеку
function roofProp(g, es, w, top, level, cx) {
  cx = cx || (w >> 1); const y = Math.max(0, top - 8);
  switch (es.fx) {
    case 'renaissance': R(g, cx - 1, y - 2, 2, 12, 'd'); R(g, cx - 5, y + 2, 10, 1, 'd'); [[-5, 0], [4, 0]].forEach(p => R(g, cx + p[0], y + p[1] + 1, 2, 2, 'd')); R(g, cx, y - 3, 6, 3, 'r'); R(g, cx + 5, y - 2, 2, 1, 'y'); break;   // флюгер-півник
    case 'retro': R(g, cx - 1, y - 3, 3, 14, 'd'); for (let a = -2; a <= 2; a++) R(g, cx - 6 + Math.abs(a), y - 2 + a + 2, 12 - 2 * Math.abs(a), 1, a % 2 ? 'f' : 'p'); R(g, cx - 6, y + 3, 12, 1, 'd'); break;                          // пілон-зірка
    case 'disco': disc(g, cx, y + 4, 7, 'd'); disc(g, cx, y + 4, 6, 'E'); for (let a = -6; a <= 6; a += 2) for (let b = -6; b <= 6; b += 2) if (a * a + b * b < 30) R(g, cx + a, y + 4 + b, 1, 1, ((a + b) / 2) & 1 ? 'w' : 'S'); R(g, cx - 3, y + 1, 2, 1, 'w'); R(g, cx, y - 4, 1, 3, 'd'); break;
    case 'arcade': disc(g, cx, y + 4, 8, 'd'); disc(g, cx, y + 4, 7, 'y'); R(g, cx + 1, y + 3, 8, 3, 'd'); R(g, cx + 1, y + 4, 7, 1, 'd'); R(g, cx - 2, y + 0, 2, 2, 'd'); [[11, 4], [14, 4]].forEach(p => R(g, cx + p[0], y + p[1], 2, 2, 'y')); break;                                    // піксельний «Пакман» із крапками
    case 'internet': for (let a = 1; a <= 3; a++) for (let t2 = -a * 3; t2 <= a * 3; t2++) { const yy = Math.round(Math.sqrt(Math.max(0, a * a * 11 - t2 * t2)) * 0.7); if (yy > 0) R(g, cx + t2, y + 10 - yy, 1, 1, 'a'); } disc(g, cx, y + 10, 2, 'a'); R(g, cx - 1, y + 10, 3, 1, 'n'); break;
    case 'eco': R(g, cx - 1, y + 2, 2, 12, 'w'); for (let k = 0; k < 3; k++) { const a = k * 2.09 + 0.5; for (let i = 1; i < 8; i++) R(g, cx + Math.cos(a) * i, y + 2 + Math.sin(a) * i, 1, 1, 'w'); } R(g, cx - 1, y + 1, 3, 3, 'g'); break;                                       // вітряк
    case 'space': R(g, cx - 2, y + 2, 5, 11, 'w'); R(g, cx - 2, y + 2, 5, 1, 'd'); R(g, cx - 1, y - 2, 3, 4, 'r'); R(g, cx, y - 4, 1, 2, 'r'); R(g, cx - 5, y + 9, 3, 4, 'r'); R(g, cx + 3, y + 9, 3, 4, 'r'); R(g, cx - 1, y + 5, 3, 3, 's'); break;                     // ракета
    case 'neon': hologram(g, cx - 18, y - 2, 36, 12, 'T'); R(g, cx - 14, y + 1, 18, 1, 'w'); R(g, cx - 14, y + 4, 28, 1, 'f'); R(g, cx - 14, y + 7, 12, 1, 'T'); break;
  }
}

function epochFacadeFx(g, es, w, h, look, level, floors, yG) {
  const top = look.top, flatTop = es.flat && level <= 3;
  switch (es.fx) {
    case 'renaissance':
      for (let x = 14; x < w - 12; x += 12) { R(g, x, top + 11, 1, 1, 'y'); R(g, x + 4, top + 21, 1, 1, 'y'); }
      break;
    case 'retro':
      [[8, top + 9], [w - 10, top + 9], [8, top + 21], [w - 10, top + 21]].forEach(p => { R(g, p[0], p[1], 1, 3, 'y'); R(g, p[0] - 1, p[1] + 1, 3, 1, 'y'); });
      break;
    case 'disco':
      for (let x = 8; x < w - 8; x += 4) { R(g, x, top + 8, 1, 1, (x >> 2) % 2 ? 'y' : 'f'); R(g, x, top + 24, 1, 1, (x >> 2) % 2 ? 'f' : 'y'); }
      break;
    case 'arcade':
      if (flatTop) { ['.#...#.', '..###..', '.##.##.', '#######', '#.#.#.#'].forEach((row, ry) => { for (let rx = 0; rx < 7; rx++) if (row[rx] === '#') R(g, 6 + rx, ry, 1, 1, 'T'); }); }
      for (let x = 10; x < w - 10; x += 8) R(g, x, top + 24, 4, 1, (x >> 3) % 2 ? 'f' : 'T');
      break;
    case 'internet':
      if (flatTop) { R(g, w - 18, 1, 8, 1, 'E'); R(g, w - 17, 2, 6, 1, 'E'); R(g, w - 16, 3, 4, 1, 'e'); R(g, w - 14, 0, 1, 1, 'r'); R(g, w - 14, 4, 1, 1, 'd'); }
      break;
    case 'eco':
      if (flatTop) for (let x = 3; x < w - 3; x += 3) { R(g, x, 3, 2, 2, ((x / 3) | 0) % 3 ? 'g' : 'G'); if (x % 15 === 0) R(g, x, 2, 1, 1, ((x / 15) | 0) % 2 ? 'p' : 'y'); }
      vinesG(g, 6, top + 26, 20 + (floors.length - 1) * 14); vinesG(g, w - 8, top + 26, 14 + (floors.length - 1) * 14);
      break;
    case 'space':
      if (flatTop) { for (let a = -4; a <= 4; a++) { const hh = Math.round(Math.sqrt(16 - a * a)); R(g, w - 14 + a, 5 - hh, 1, hh, 'S'); } R(g, w - 14, 0, 1, 2, 'd'); R(g, w - 14, 0, 1, 1, 'r'); }
      for (let x = 12; x < w - 12; x += 12) { R(g, x, top + 11, 1, 1, 'S'); R(g, x + 6, top + 21, 1, 1, 'S'); }
      break;
    case 'neon':
      neonLine(g, 6, top + 9, w - 12, 1, 'f'); neonLine(g, 6, top + 23, w - 12, 1, 'T');
      neonLine(g, 6, top + 9, 1, 15, 'f'); neonLine(g, w - 7, top + 9, 1, 15, 'T');
      floors.forEach(fl => { neonLine(g, 8, fl.top, w - 16, 1, 'T'); });
      if (flatTop) { for (let x = 4; x < w - 4; x += 6) neonLine(g, x, 3 + ((x / 6) & 1), 3, 1, (x / 6) & 1 ? 'f' : 'T'); }
      break;
  }
}

// Дах: стилі 0..5 (див. SHOP_LOOK). Малює від y=0 до y=top+3; карниз — рядки top+4…top+7
function drawRoof(g, style, w, top, look) {
  const cx = w >> 1, y1 = top + 3;
  const tiles = (y, lx, rw, c, odd) => {
    R(g, lx, y, rw, 1, c); R(g, lx, y, 1, 1, 'd'); R(g, lx + rw - 1, y, 1, 1, 'd');
    if (odd) { g.globalAlpha = 0.2; R(g, lx + 1, y, rw - 2, 1, 'd'); g.globalAlpha = 1; }
    for (let k = lx + 2 + (y % 2) * 3; k < lx + rw - 2; k += 6) R(g, k, y, 1, 1, 'd');
  };
  switch (style) {
    case 0: {                                       // низький черепичний дах із димарем
      const y0 = 4;
      for (let y = y0; y <= y1; y++) {
        const t = (y - y0) / (y1 - y0), half = (w - 36) / 2 + t * ((w - 2) / 2 - (w - 36) / 2);
        tiles(y, Math.round(cx - half), Math.round(half * 2), 'r', (y - y0) % 2);
      }
      R(g, cx - Math.round((w - 36) / 2), y0, w - 36, 1, 'd');
      const kx = w - 30; R(g, kx, 0, 8, 12, 'b'); R(g, kx, 0, 1, 12, 'd'); R(g, kx + 7, 0, 1, 12, 'd'); R(g, kx - 1, 0, 10, 2, 'd'); R(g, kx + 2, 4, 3, 1, 'l'); R(g, kx + 2, 7, 3, 1, 'l');
      break;
    }
    case 1: {                                       // двосхилий дах із фронтоном, круглим віконцем і прапорцем
      const y0 = 8;
      for (let y = y0; y <= y1; y++) {
        const t = (y - y0) / (y1 - y0), half = 6 + t * ((w / 2 - 1) - 6);
        const lx = Math.round(cx - half), rw = Math.round(half * 2);
        tiles(y, lx, rw, 'r', (y - y0) % 2);
        R(g, lx, y, 2, 1, 'b'); R(g, lx + rw - 2, y, 2, 1, 'b');                 // дошки по краях фронтону
      }
      spireG(g, cx, 0);                                           // шпиль із кулькою замість прапорця
      break;
    }
    case 2: {                                       // плаский дах із парапетом, кондиціонерами й антеною
      const trim = look.trim;
      R(g, 0, 5, w, 2, 'w'); R(g, 0, 5, w, 1, 'd');
      R(g, 1, 7, w - 2, y1 - 6, trim); R(g, 1, 7, w - 2, 1, 'l');
      for (let x = 8; x < w - 20; x += 22) { R(g, x, 9, 16, y1 - 9, 'd'); R(g, x + 1, 10, 14, y1 - 11, 'S'); R(g, x + 1, 10, 14, 1, 'w'); }
      acG(g, Math.round(w * 0.22), 0); acG(g, Math.round(w * 0.22) + 13, 1);
      R(g, w - 26, 0, 1, 6, 'd'); R(g, w - 28, 1, 5, 1, 'd'); R(g, w - 28, 3, 5, 1, 'd');
      R(g, cx + 14, 2, 3, 4, 'e'); R(g, cx + 13, 1, 5, 1, 'd');
      break;
    }
    case 3: {                                       // парапет із великим рекламним щитом «SUPER» і прапорами
      const trim = look.trim;
      R(g, 0, 14, w, 2, 'w'); R(g, 0, 14, w, 1, 'd');
      R(g, 1, 16, w - 2, y1 - 15, trim); R(g, 1, 16, w - 2, 1, 'E');
      for (let x = 8; x < w - 20; x += 22) { R(g, x, 18, 16, y1 - 18, 'd'); R(g, x + 1, 19, 14, y1 - 20, 'w'); }
      roofSignG(g, cx, 1, true);
      R(g, cx - 28, 14, 2, 1, 'd'); R(g, cx + 26, 14, 2, 1, 'd');
      spireG(g, 10, 3); spireG(g, w - 20, 3);
      break;
    }
    case 4: {                                       // мансардний дах із слуховими вікнами та годинниковою вежею
      const y0 = 10;
      for (let y = y0; y <= y1; y++) {
        const t = (y - y0) / (y1 - y0), half = (w - 80) / 2 + t * ((w - 2) / 2 - (w - 80) / 2);
        tiles(y, Math.round(cx - half), Math.round(half * 2), 'n', (y - y0) % 2);
      }
      [0.2, 0.8].forEach(f => {                                   // слухові вікна
        const dx = Math.round(w * f) - 6;
        R(g, dx, 18, 12, 10, 'd'); R(g, dx + 1, 19, 10, 8, 's'); R(g, dx + 5, 19, 1, 8, 'd'); R(g, dx + 2, 20, 2, 1, 'S');
        for (let i = 0; i < 5; i++) R(g, dx - 1 + i, 17 - i, 14 - 2 * i, 1, 'r');
        R(g, dx - 1, 17, 14, 1, 'd');
        if (glassRects) glassRects.push([dx + 1, 19, 10, 8]);
      });
      R(g, cx - 12, 4, 24, y1 - 3, 'c'); R(g, cx - 13, 3, 26, 2, 'd'); R(g, cx - 12, 4, 1, y1 - 3, 'd'); R(g, cx + 11, 4, 1, y1 - 3, 'd');     // вежа
      for (let i = 0; i < 4; i++) R(g, cx - 12 + i * 3, i, 24 - i * 6, 1, i ? 'r' : 'd');
      R(g, cx, 0, 1, 2, 'h');
      disc(g, cx, 14, 8, 'd'); disc(g, cx, 14, 7, 'h'); disc(g, cx, 14, 6, 'w');                                              // годинник
      R(g, cx, 9, 1, 5, 'd'); R(g, cx, 14, 4, 1, 'd'); R(g, cx, 8, 1, 1, 'd'); R(g, cx, 20, 1, 1, 'd'); R(g, cx - 6, 14, 1, 1, 'd'); R(g, cx + 6, 14, 1, 1, 'd');
      break;
    }
    case 6: {                                       // сучасний парапет із вежею-годинником та антенами
      const trim = look.trim;
      R(g, 0, 14, w, 2, 'w'); R(g, 0, 14, w, 1, 'd');
      R(g, 1, 16, w - 2, y1 - 15, trim); R(g, 1, 16, w - 2, 1, 'E');
      for (let x = 8; x < w - 20; x += 22) { R(g, x, 18, 16, y1 - 18, 'd'); R(g, x + 1, 19, 14, y1 - 20, 'S'); R(g, x + 1, 19, 14, 1, 'w'); }
      R(g, cx - 13, 2, 26, 13, 'd'); R(g, cx - 12, 3, 24, 11, 'e'); R(g, cx - 12, 3, 24, 1, 'E');
      disc(g, cx, 8, 5, 'd'); disc(g, cx, 8, 4, 'w'); R(g, cx, 5, 1, 4, 'd'); R(g, cx, 8, 3, 1, 'd');
      R(g, cx - 10, 6, 3, 5, 'S'); R(g, cx + 8, 6, 3, 5, 'S');
      R(g, 14, 4, 1, 10, 'd'); R(g, 11, 6, 7, 1, 'd'); R(g, 12, 9, 5, 1, 'd'); R(g, w - 16, 4, 1, 10, 'd'); R(g, w - 19, 6, 7, 1, 'd'); R(g, w - 18, 9, 5, 1, 'd');
      R(g, 14, 3, 1, 1, 'r'); R(g, w - 16, 3, 1, 1, 'r');
      break;
    }
    case 5: {                                       // скляний купол, бічні башточки з прапорами
      const base = y1, rx = Math.min(100, cx - 28), dh = 27;
      for (let x = cx - rx; x <= cx + rx; x++) {
        const k = Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2)));
        const yt = base - Math.round(dh * k);
        R(g, x, yt, 1, base - yt + 1, 'S');
        if ((x - cx) % 12 === 0) R(g, x, yt, 1, base - yt + 1, 'n');
        R(g, x, yt, 1, 1, 'w');
        for (let y = yt + 1; y <= base; y++) if ((base - y) % 9 === 0) R(g, x, y, 1, 1, 'n');
        if ((x * 5) % 11 === 0) R(g, x, yt + 2 + (x % 5), 1, 2, 'w');
      }
      R(g, cx - rx - 2, base - 1, rx * 2 + 5, 2, 'n'); R(g, cx - rx - 2, base - 1, rx * 2 + 5, 1, 'd');
      [3, w - 23].forEach(tx => {                                  // башточки
        R(g, tx, 12, 20, y1 - 11, 'S'); R(g, tx, 12, 20, 1, 'w'); R(g, tx - 1, 11, 22, 2, 'n'); R(g, tx, 12, 1, y1 - 11, 'd'); R(g, tx + 19, 12, 1, y1 - 11, 'd');
        for (let k = 0; k < 4; k++) R(g, tx + 3 + k * 4, 16, 2, y1 - 17, 'n');
        spireG(g, tx + 9, 0);
      });
      break;
    }
  }
  if (style !== 3) roofSignG(g, cx, Math.max(0, y1 - 13), false);
}

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
  ctx.globalAlpha = 0.12 + 0.05 * Math.sin(t * 40); R(ctx, x0, y0, W, H, 'w'); ctx.globalAlpha = 1;      // мерехтіння плівки
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
  const base = h - 7, L = 12, Rt = w - 33, ep = viewEpoch() % 8;
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
        const dI = fl.d0 + (pavNo % Math.max(1, fl.xs.length * 2));
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
    for (let i = 0; i <= e.run; i++) {
      const x = e.xLow + dir * i, y = e.yLow - Math.round(i * e.rise / e.run);
      R(b, x, y, 1, 3, (i % 4 < 2) ? 'e' : 'E'); R(b, x, y + 3, 1, 2, 'd');       // сходинки й підпорка
      b.globalAlpha = 0.35; R(b, x, y - 9, 1, 8, 'S'); b.globalAlpha = 1;          // скляна огорожа
      R(b, x, y - 9, 1, 1, 'd'); R(b, x, y - 8, 1, 1, 'h');                          // поручень
    }
    R(b, e.xLow, e.yLow - 9, 1, 9, 'd'); R(b, e.xHigh, e.yHigh - 9, 1, 9, 'd');
  });

  /* ========== ФАСАД (front) ========== */
  deferSign = true; pendingSign = null;
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

  // декор даху малюємо на окремому шарі: навколо вивіски «CAPYTAP» лишається вільний проміжок
  const ks = lastRoofSign, K = { x: ks.x - 5, y: ks.y - 4, w: ks.w + 10, h: ks.h + 4 };
  const dcv = mk(), gD = dcv.getContext('2d'); const gFront = g;
  g = gD;
  epochFacadeFx(g, es, w, h, look, level, floors, yG);
  const half = es.fx === 'neon' ? 19 : 8, pL = Math.max(half, Math.min(Math.round(w * 0.16), K.x - half - 2)), pR = Math.min(w - half, Math.max(Math.round(w * 0.84), K.x + K.w + half + 2));
  roofProp(g, es, w, look.top, level, pL); if (es.fx !== "neon") roofProp(g, es, w, look.top, level, pR);
  shopRoofExtras(g, es, w, look.top, level);       // примітні деталі на даху по боках від вивіски
  epochFacadeDeco(g, es, w, h, look, level, floors, yG, door, yB);
  if (!skinShop) shopVariantDeco(g, es, w, h, look, level, floors, yG, door, yB, shopVariant(level));
  if (skinShop) skinShopDeco(g, skinOn('shop'), w, h, look, yG, door);
  gD.save(); gD.globalCompositeOperation = 'destination-out'; gD.fillStyle = '#000'; gD.fillRect(K.x, K.y, K.w, K.h); gD.restore();
  g = gFront; g.drawImage(dcv, 0, 0);
  if (level <= 2 && viewEpoch() % 8 !== 0) openSignG(g, yG);                      // у Відродженні вивіски OPEN немає
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
      lg.globalAlpha = 1; for (let bx = r[0] + 5; bx < r[0] + r[2] - 3; bx += 12) { R(lg, bx, r[1] + 1, 3, 2, 'w'); lg.globalAlpha = 0.28; R(lg, bx - 2, r[1] + 3, 7, 6, 'y'); lg.globalAlpha = 1; }          // лампи під стелею з конусом світла
    }
    else { R(lg, r[0], r[1], r[2], r[3], 'y'); R(lg, r[0], r[1] + r[3] - 3, r[2], 3, 'h'); }                 // ліхтарики й дрібні вікна світяться яскраво
  });
  lg.clearRect(door.x - 3, door.y - 3, door.w + 6, door.h + 3);                                                                  // двері лишаються без підсвітки — вночі їх чітко видно
  lg.globalAlpha = 0.5; R(lg, door.x - 3, door.y - 4, door.w + 6, 1, 'h'); lg.globalAlpha = 1;                                 // тонка лампа над дверима
  shelfLights.forEach(([x, y]) => {                                                                                               // вночі прилавки підсвічені теплим жовтим світлом (не надто яскравим)
    lg.globalAlpha = 0.1; R(lg, x - 4, y - 7, 44, 31, 'y');
    lg.globalAlpha = 0.28; R(lg, x - 1, y - 2, 36, 21, 'y');
    lg.globalAlpha = 0.6; R(lg, x + 1, y - 4, 32, 2, 'h'); R(lg, x + 2, y - 3, 30, 1, 'y');
    lg.globalAlpha = 1;
  });
  if (lastRoofSign) { lg.globalAlpha = 0.1; R(lg, lastRoofSign.x + 1, lastRoofSign.y + 1, lastRoofSign.w - 2, lastRoofSign.h - 2, 'y'); lg.globalAlpha = 1; }          // вивіска «CAPYTAP» світиться вночі
  lg.globalAlpha = 0.28; R(lg, 7, look.top + 10, w - 14, 13, 'y'); lg.globalAlpha = 1;                                                                                       // і назва магазину теж
  glassRects = null;

  return {
    canvas, back, front, w, h, lit, yB, roofSign: lastRoofSign, glints: skinGlints,
    sign: { x: 7, y: look.top + 10, w: w - 14, h: 13 },
    door, floors, escalators, cinema: (floors.find(f => f.cinema) || {}).screen || null
  };
}

