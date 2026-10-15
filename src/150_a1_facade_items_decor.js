//#part 150_a1_facade_items_decor.js
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
// Стулки «дерев'яних» дверей (рівні 1, 2 і 5) під стиль епохи d.ep: 1 ретро, 2 диско, 3 аркади, 4 інтернет, 5 еко, 6 космос, 7 неон, 8 Японія (0 — класична дерев'яна)
const DOOR_LEAF_STYLES = {
  1(g, x, y, lw, h, rt) {       // ретро: хромований дайнер, червона нижня панель
    R(g, x, y, lw, h, 'e'); R(g, x + 1, y + 1, lw - 2, h - 1, 'E');
    R(g, x + 3, y + 3, lw - 6, 7, 'k'); R(g, x + 4, y + 4, lw - 8, 5, 's'); R(g, x + 4, y + 4, lw - 8, 1, 'S');
    R(g, x + 1, y + 12, lw - 2, 1, 'w'); R(g, x + 1, y + 14, lw - 2, h - 17, 'r'); R(g, x + 1, y + 14, lw - 2, 1, 'J');
    R(g, rt ? x + 2 : x + lw - 4, y + 12, 2, 8, 'k');
  },
  2(g, x, y, lw, h, rt) {       // диско: сливова з неоновими смугами
    R(g, x, y, lw, h, 'V'); R(g, x + 1, y + 1, lw - 2, h - 1, 'P');
    R(g, x + 3, y + 3, lw - 6, 6, 'v'); R(g, x + 4, y + 4, 2, 1, 'w'); R(g, x + lw - 6, y + 7, 2, 1, 'w');
    R(g, x + 1, y + 11, lw - 2, 1, 'f'); R(g, x + 1, y + 13, lw - 2, 1, 'T'); R(g, x + 1, y + 15, lw - 2, 1, 'h');
    R(g, x + 3, y + 18, lw - 6, h - 21, 'V'); R(g, rt ? x + 2 : x + lw - 4, y + 9, 2, 3, 'h');
  },
  3(g, x, y, lw, h, rt) {       // аркади: темно-синя з кольоровими «пікселями»
    R(g, x, y, lw, h, 'k'); R(g, x + 1, y + 1, lw - 2, h - 1, 'z');
    R(g, x + 3, y + 3, lw - 6, 6, 'k'); R(g, x + 4, y + 4, lw - 8, 1, 'T'); R(g, x + 4, y + 6, lw - 8, 1, 'f');
    for (let i = 0; i < 12; i++) R(g, x + 3 + (i % 4) * Math.floor((lw - 6) / 4), y + 12 + Math.floor(i / 4) * 4, 2, 2, ['r', 'y', 'T', 'f'][(i + (i >> 2)) % 4]);
    R(g, rt ? x + 2 : x + lw - 4, y + 9, 2, 3, 'y');
  },
  4(g, x, y, lw, h, rt) {       // інтернет: сіра рама, скло з відблиском і «схема»
    R(g, x, y, lw, h, 'e'); R(g, x + 1, y + 1, lw - 2, h - 1, 'a');
    R(g, x + 2, y + 2, 1, h - 5, 'w'); R(g, x + 3, y + 2, 1, 4, 'w'); R(g, x + 1, y + h - 3, lw - 2, 3, 'e');
    R(g, x + 4, y + h - 10, lw - 8, 1, 'T'); R(g, x + (lw >> 1), y + h - 13, 1, 4, 'T'); R(g, x + (lw >> 1) - 2, y + h - 13, 2, 1, 'T');
    R(g, rt ? x + 1 : x + lw - 2, y + 7, 1, 7, 'k');
  },
  5(g, x, y, lw, h, rt) {       // еко: бамбуково-зелена з листком
    R(g, x, y, lw, h, 'G'); R(g, x + 1, y + 1, lw - 2, h - 1, 'g');
    R(g, x + 3, y + 3, lw - 6, 6, 's'); R(g, x + 3, y + 3, 3, 1, 'S');
    R(g, x + 3, y + 11, lw - 6, h - 14, 'm');
    R(g, x + (lw >> 1), y + 13, 1, h - 18, 'G'); for (let k = 0; k < 3; k++) { R(g, x + (lw >> 1) - 2, y + 15 + k * 4, 2, 1, 'G'); R(g, x + (lw >> 1) + 1, y + 17 + k * 4, 2, 1, 'G'); }
    R(g, rt ? x + 2 : x + lw - 4, y + 9, 2, 3, 'y');
  },
  6(g, x, y, lw, h, rt) {       // космос: шлюз з ілюмінатором і смугами небезпеки
    R(g, x, y, lw, h, 'e'); R(g, x + 1, y + 1, lw - 2, h - 1, 'E');
    R(g, x + 3, y + 3, lw - 6, 7, 'e'); R(g, x + 4, y + 4, lw - 8, 5, 'a'); R(g, x + 4, y + 4, 2, 1, 'w');
    for (let i = 0; i < lw - 2; i += 4) { R(g, x + 1 + i, y + 12, 2, 2, 'o'); R(g, x + 3 + i, y + 12, 2, 2, 'k'); }
    R(g, x + 2, y + 16, lw - 4, h - 19, 'e'); R(g, x + 3, y + 17, lw - 6, 1, 'w');
    R(g, rt ? x + 2 : x + lw - 5, y + 15, 3, 3, 'r');
  },
  7(g, x, y, lw, h, rt) {       // неон: чорна з рожево-блакитним світлом
    R(g, x, y, lw, h, 'f'); R(g, x + 1, y + 1, lw - 2, h - 1, 'k');
    R(g, x + 2, y + 2, lw - 4, 1, 'T'); R(g, x + 2, y + 2, 1, h - 3, 'T'); R(g, x + lw - 3, y + 2, 1, h - 3, 'T');
    R(g, x + 4, y + 4, lw - 8, 6, 'V'); R(g, x + 4, y + 4, lw - 8, 1, 'v');
    R(g, x + 4, y + 13, lw - 8, 1, 'f'); R(g, x + 4, y + 16, lw - 8, 1, 'T'); R(g, x + 4, y + 19, lw - 8, 1, 'f');
    R(g, rt ? x + 3 : x + lw - 5, y + 9, 2, 3, 'T');
  },
  8(g, x, y, lw, h, rt) {       // Японія: сьоджі — рама з дерева й паперові клітинки
    R(g, x, y, lw, h, 'b'); R(g, x + 1, y + 1, lw - 2, h - 1, 'w');
    R(g, x + (lw >> 1), y + 1, 1, h - 1, 'b'); for (let k = 5; k < h - 8; k += 5) R(g, x + 1, y + k, lw - 2, 1, 'b');
    R(g, x + 1, y + h - 9, lw - 2, 8, 'l'); R(g, x + 1, y + h - 9, lw - 2, 1, 'b');
    R(g, rt ? x + 2 : x + lw - 3, y + 11, 1, 3, 'r');
  }
};
function drawDoorLeaves(g, d, open) {
  const lw = d.w / 2, off = Math.round(open * (lw - 1));
  g.save(); g.beginPath(); g.rect(d.x, d.y, d.w, d.h); g.clip();
  [[d.x - off, false], [d.x + lw + off, true]].forEach(p => {
    const x = Math.round(p[0]);
    if ((d.type === 0 || d.type === 3) && DOOR_LEAF_STYLES[d.ep]) DOOR_LEAF_STYLES[d.ep](g, x, d.y, lw, d.h, p[1]);
    else if (d.type === 0 || d.type === 3) {                  // дерев'яні стулки
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
