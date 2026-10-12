//#part 151_arch.js
/* =====================================================================
   АРХІТЕКТУРА ЕПОХ: магазин (фасад, дах, вивіска, поверхи) і будинки на вулиці під кожну з 8 епох.
   Реєструється в ARCH[id епохи] (див. 150_facade.js: buildShopCanvas і 140_sprites.js: drawHouse).
   Інтер'єр зі звірятами й покупцями не чіпається: фасад лише лишає прорізи в склі.
   Скіни магазину (цукерковий, золотий…) обходять ARCH і малюються як раніше.
   ===================================================================== */
// Спільні примітиви й шрифт 3×5 для вивісок
const AR = (function () {
  const hxc = c => PALETTE[c] || c;
  const P = (g, x, y, w, h, c) => { if (w <= 0 || h <= 0) return; g.fillStyle = hxc(c); g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const A = (g, a, fn) => { const o = g.globalAlpha; g.globalAlpha = a; fn(); g.globalAlpha = o; };
  const D = (g, cx, cy, r, c) => { g.fillStyle = hxc(c); for (let dy = -r; dy <= r; dy++) { const half = Math.round(Math.sqrt(r * r + 0.5 - dy * dy)); g.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1); } };
  const rgb = h => { h = hxc(h); return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  const hex = a => '#' + a.map(v => ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2)).join('');
  const mix = (a, b, k) => { const p = rgb(a), q = rgb(b); return hex(p.map((v, i) => v + (q[i] - v) * k)); };
  // п'ять тонів з одного кольору: світлий відблиск, світлий, основний, тінь, глибока тінь
  const ramp = c => [mix(c, '#ffffff', 0.5), mix(c, '#ffffff', 0.2), hxc(c), mix(c, '#2a2038', 0.28), mix(c, '#1a1228', 0.55)];
  // цегла/камінь: блок із світлою кромкою зверху-ліворуч і тінню знизу-праворуч
  function block(g, x, y, w, h, r) { P(g, x, y, w, h, r[2]); P(g, x, y, w, 1, r[1]); P(g, x, y, 1, h, r[1]); P(g, x + w - 1, y, 1, h, r[3]); P(g, x, y + h - 1, w, 1, r[3]); }
  // кладка: ряди блоків зі зсувом
  function masonry(g, x, y, w, h, r, bw, bh, seed) {
    P(g, x, y, w, h, r[2]);
    for (let j = 0, yy = y; yy < y + h; j++, yy += bh) {
      const hh = Math.min(bh, y + h - yy), off = (j % 2) * (bw >> 1) + ((seed || 0) + j * 3) % 3;
      P(g, x, yy + hh - 1, w, 1, r[3]);
      P(g, x, yy, w, 1, r[1]);
      for (let xx = x - off; xx < x + w; xx += bw) { if (xx >= x) P(g, xx, yy, 1, hh, r[3]); if (xx + 1 >= x && xx + 1 < x + w) P(g, xx + 1, yy + 1, 1, hh - 2, r[1]); }
    }
  }
  function lineH(g, x0, y0, x1, y1, c) {                                        // лінія з пікселів
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx - dy, n = 0;
    while (n++ < 2000) { P(g, x0, y0, 1, 1, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } }
  }
  // шрифт 3×5 для вивісок (літери, цифри, знаки)
  const FONT3 = {"0":["###","#.#","#.#","#.#","###"],"1":[".#.","##.",".#.",".#.","###"],"2":["##.","..#",".#.","#..","###"],"3":["##.","..#",".#.","..#","##."],"4":["#.#","#.#","###","..#","..#"],"5":["###","#..","##.","..#","##."],"6":[".##","#..","###","#.#","###"],"7":["###","..#",".#.",".#.",".#."],"8":["###","#.#","###","#.#","###"],"9":["###","#.#","###","..#","##."],"A":[".#.","#.#","###","#.#","#.#"],"B":["##.","#.#","##.","#.#","##."],"C":[".##","#..","#..","#..",".##"],"D":["##.","#.#","#.#","#.#","##."],"E":["###","#..","##.","#..","###"],"F":["###","#..","##.","#..","#.."],"G":[".##","#..","#.#","#.#",".##"],"H":["#.#","#.#","###","#.#","#.#"],"I":["###",".#.",".#.",".#.","###"],"J":["..#","..#","..#","#.#",".#."],"K":["#.#","#.#","##.","#.#","#.#"],"L":["#..","#..","#..","#..","###"],"M":["#.#","###","###","#.#","#.#"],"N":["##.","#.#","#.#","#.#","#.#"],"O":[".#.","#.#","#.#","#.#",".#."],"P":["##.","#.#","##.","#..","#.."],"Q":[".#.","#.#","#.#","##.",".##"],"R":["##.","#.#","##.","#.#","#.#"],"S":[".##","#..",".#.","..#","##."],"T":["###",".#.",".#.",".#.",".#."],"U":["#.#","#.#","#.#","#.#","###"],"V":["#.#","#.#","#.#","#.#",".#."],"W":["#.#","#.#","###","###","#.#"],"X":["#.#","#.#",".#.","#.#","#.#"],"Y":["#.#","#.#",".#.",".#.",".#."],"Z":["###","..#",".#.","#..","###"],"-":["...","...","###","...","..."],".":["...","...","...","...",".#."],"!":[".#.",".#.",".#.","...",".#."]," ":["...","...","...","...","..."],"@":["###","#.#","###","#..","###"]};
  function txt(g, x, y, str, color) { let cx = x; [...String(str).toUpperCase()].forEach(ch => { const gl = FONT3[ch]; if (gl) gl.forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '#') P(g, cx + i, y + j, 1, 1, color); }); cx += 4; }); return cx - x; }
  const rnd = (a, b) => hash2(a * 31 + 7, b * 17 + 3);
  return { txt, P, A, D, rgb, hex, mix, ramp, block, masonry, lineH, rnd, hxc };
})();

// ---- епоха 0: Відродження (палаццо, арки, купол)
(function () {
  const { P, A, D, ramp, mix, rnd, masonry, lineH } = AR;
  const ST = ramp('#dcc693'), SL = ramp('#f0e4c0'), TC = ramp('#c9643a'), GR = ramp('#4f7a45');
  const OUT = '#3a2a1e', GOLD = ['#fff3a8', '#f4cc4c', '#c8962a', '#8a5f18'];

  function hip(g, x0, x1, yT, yB, inset, pal, snow) {                           // черепичний дах-«шатро»: ряди черепиці, коник, звис і тінь
    const H = yB - yT;
    for (let y = yT; y <= yB; y++) {
      const t = H ? (y - yT) / H : 1, lx = Math.round(x0 + inset * (1 - t)), rx = Math.round(x1 - inset * (1 - t)), c = ((y - yT) % 2) ? pal[2] : pal[1];
      P(g, lx, y, rx - lx, 1, c);
      for (let k = lx + 1 + ((y - yT) % 4 < 2 ? 0 : 2); k < rx - 1; k += 4) P(g, k, y, 1, 1, pal[3]);
      P(g, lx, y, 1, 1, pal[4]); P(g, rx - 1, y, 1, 1, pal[4]);
      if (snow) P(g, lx + 1, y, rx - lx - 2, 1, (y - yT) < 2 ? '#ffffff' : '#eaf2fc');
    }
    P(g, Math.round(x0 + inset), yT, Math.round(x1 - x0 - inset * 2), 1, pal[0]);       // світлий коник
    P(g, x0, yB, x1 - x0, 1, pal[4]);
    A(g, 0.28, () => P(g, x0 + 1, yB + 1, x1 - x0 - 2, 2, '#000000'));
  }
  function pilaster(g, x, y0, y1, pw) {                                         // пілястра: база, стовбур із каннелюрами, капітель
    P(g, x + 1, y0 + 3, pw - 2, y1 - y0 - 5, ST[2]); P(g, x + 1, y0 + 3, 1, y1 - y0 - 5, ST[1]); P(g, x + pw - 2, y0 + 3, 1, y1 - y0 - 5, ST[3]);
    for (let k = x + 3; k < x + pw - 2; k += 2) A(g, 0.5, () => P(g, k, y0 + 4, 1, y1 - y0 - 8, ST[4]));
    P(g, x - 1, y0, pw + 2, 1, ST[0]); P(g, x - 1, y0 + 1, pw + 2, 2, ST[2]); P(g, x - 1, y0 + 2, pw + 2, 1, ST[3]);   // капітель
    P(g, x, y0 + 3, pw, 1, ST[4]);
    P(g, x - 1, y1 - 2, pw + 2, 2, ST[2]); P(g, x - 1, y1 - 2, pw + 2, 1, ST[0]); P(g, x, y1, pw, 1, ST[4]);          // база
  }
  function spandrels(g, bx, bw, yTop, ry) {                                     // кам'яні кути над прорізом: пологе еліптичне склепіння з архівольтом і замковим каменем
    const r = bw / 2;
    for (let i = 0; i < bw; i++) {
      const dx = (i + 0.5 - r) / r, d = Math.round(ry * (1 - Math.sqrt(Math.max(0, 1 - dx * dx))));
      if (d > 0) P(g, bx + i, yTop, 1, d, ST[2]);
      P(g, bx + i, yTop + d, 1, 1, ST[0]);
      A(g, 0.38, () => P(g, bx + i, yTop + d + 1, 1, 1, '#1a1228'));
    }
    const kx = Math.round(bx + r - 2);
    P(g, kx, yTop, 4, ry + 2, ST[1]); P(g, kx, yTop, 1, ry + 2, ST[0]); P(g, kx + 3, yTop, 1, ry + 2, ST[3]); P(g, kx, yTop + ry + 1, 4, 1, ST[4]);
  }
  function bays(x0, x1, n, pier) { const bw = (x1 - x0 - (n - 1) * pier) / n, out = []; for (let i = 0; i < n; i++) out.push([Math.round(x0 + i * (bw + pier)), Math.round(bw)]); return out; }
  function quoins(g, x, y0, y1, left) {                                         // кутова кладка: чергування довгих і коротких блоків
    for (let y = y0, j = 0; y < y1; y += 6, j++) {
      const hh = Math.min(6, y1 - y), bw = (j % 2) ? 8 : 5, bx = left ? x : x + 8 - bw;
      P(g, x, y, 8, hh, ST[3]); P(g, bx, y, bw, hh, ST[2]); P(g, bx, y, bw, 1, ST[0]); P(g, bx, y, 1, hh, ST[1]); P(g, bx, y + hh - 1, bw, 1, ST[3]); P(g, bx + bw - 1, y, 1, hh, ST[3]);
    }
  }
  function urn(g, x, y) {                                                       // кам'яна ваза з полум'ям
    P(g, x - 2, y - 1, 5, 1, ST[3]); P(g, x - 1, y - 2, 3, 1, ST[2]); P(g, x - 3, y - 5, 7, 3, ST[2]); P(g, x - 3, y - 5, 1, 3, ST[1]); P(g, x + 3, y - 5, 1, 3, ST[3]);
    P(g, x - 1, y - 6, 3, 1, ST[1]); P(g, x - 2, y - 7, 5, 1, ST[0]); P(g, x, y - 10, 1, 3, GOLD[1]); P(g, x - 1, y - 9, 3, 1, '#ff9a3a'); P(g, x, y - 11, 1, 1, '#ffe08a');
  }
  function pennant(g, x, y, c, flip) {                                          // стяг на древку
    P(g, x, y, 1, 12, OUT); P(g, x - 1, y - 1, 3, 1, GOLD[1]);
    const d = flip ? -1 : 1; P(g, x + (d > 0 ? 1 : -6), y + 1, 6, 4, c); P(g, x + (d > 0 ? 1 : -6), y + 1, 6, 1, mix(c, '#ffffff', 0.35)); P(g, x + (d > 0 ? 7 : -7), y + 2, 1, 2, c);
  }
  function banner(g, x, y, c, hgt) {                                            // вертикальний палій-стяг із золотою смугою
    P(g, x - 1, y, 7, 1, OUT); P(g, x, y + 1, 5, hgt, c); P(g, x, y + 1, 1, hgt, mix(c, '#ffffff', 0.3)); P(g, x + 4, y + 1, 1, hgt, mix(c, '#000000', 0.3));
    P(g, x + 2, y + 3, 1, hgt - 6, GOLD[1]); P(g, x, y + hgt + 1, 2, 2, c); P(g, x + 3, y + hgt + 1, 2, 2, c);
    P(g, x + 1, y + 4, 3, 3, GOLD[1]); P(g, x + 2, y + 5, 1, 1, c);
  }

  function front(g, C) {
    const { es, w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, F = floors.length, cx = w >> 1, ground = floors[0];
    const fill = currentEpoch().signFill || look.signFill;
    // ---- дах: черепична «шатрова» покрівля з балюстрадою; над вивіскою — аттик, фронтон або купол
    const ys = Math.max(0, top - 10), pw = 62;
    hip(g, 4, w - 4, Math.max(1, top - 9), top + 1, Math.round(w * 0.28), TC);
    [Math.round(w * 0.28) + 3, w - Math.round(w * 0.28) - 6].forEach(x => { P(g, x, Math.max(1, top - 9) - 1, 3, 2, GOLD[1]); P(g, x, Math.max(1, top - 9) - 1, 3, 1, GOLD[0]); });   // золоті навершя гребеня
    for (let x = 6; x < w - 6; x += 4) { P(g, x, top, 2, 3, ST[1]); P(g, x + 1, top, 1, 3, ST[3]); }                         // балюстрада
    P(g, 4, top - 1, w - 8, 1, ST[0]); P(g, 4, top, w - 8, 1, ST[2]); P(g, 4, top + 2, w - 8, 1, ST[3]);
    // карниз із зубчиками й модильйонами
    P(g, 0, top + 3, w, 1, ST[0]); P(g, 0, top + 4, w, 2, ST[2]); for (let x = 1; x < w - 1; x += 3) P(g, x, top + 4, 2, 2, ST[3]); P(g, 0, top + 6, w, 1, ST[3]); P(g, 0, top + 7, w, 1, ST[4]);
    // аттик навколо дахової вивіски
    const ax0 = cx - (pw >> 1) - 5, aw = pw + 10, ay = ys - 3;
    if (ay >= 0) {
      P(g, ax0, ay, aw, top - ay, ST[2]); P(g, ax0, ay, aw, 1, ST[0]); P(g, ax0, ay, 1, top - ay, ST[1]); P(g, ax0 + aw - 1, ay, 1, top - ay, ST[3]);
      P(g, ax0 - 2, top - 2, aw + 4, 2, ST[1]); P(g, ax0 - 2, top - 2, aw + 4, 1, ST[0]);
      const rise = Math.min(8, ay - 1);
      if (rise >= 3 && level !== 4 && level !== 5) {                          // трикутний фронтон
        for (let i = 0; i < rise; i++) { const half = Math.round((aw / 2 + 3) * (1 - i / (rise + 1))); P(g, cx - half, ay - 1 - i, half * 2, 1, i === 0 ? ST[3] : ST[1]); P(g, cx - half, ay - 1 - i, 1, 1, ST[0]); }
        P(g, cx - (aw >> 1) - 3, ay, aw + 6, 1, ST[0]); P(g, cx - 1, ay - rise - 1, 3, 2, GOLD[1]);
      }
      if (level === 4 || level === 5) {                                       // ребристий купол із ліхтарем (як у Флоренції)
        const dr = 4, rx = 15, bY = ay, dh = Math.max(8, Math.min(12, bY - 12));
        P(g, cx - 12, bY - dr, 24, dr, ST[2]); P(g, cx - 12, bY - dr, 24, 1, ST[0]); P(g, cx - 12, bY - dr, 1, dr, ST[1]); P(g, cx + 11, bY - dr, 1, dr, ST[3]);
        [-8, 0, 8].forEach(dx => { P(g, cx + dx - 1, bY - dr + 1, 3, 3, ST[4]); P(g, cx + dx, bY - dr + 1, 1, 1, '#ffd870'); });
        for (let x = -rx; x <= rx; x++) { const k = Math.sqrt(1 - (x / rx) * (x / rx)), yt = Math.round(bY - dr - dh * k); P(g, cx + x, yt, 1, bY - dr - yt, ((x + rx) % 6 === 0) ? SL[1] : (x < -3 ? TC[1] : x > 5 ? TC[3] : TC[2])); P(g, cx + x, yt, 1, 1, TC[4]); }
        const topY = Math.round(bY - dr - dh);
        P(g, cx - 3, topY - 5, 7, 6, ST[2]); P(g, cx - 3, topY - 5, 1, 6, ST[1]); P(g, cx + 3, topY - 5, 1, 6, ST[3]); P(g, cx - 1, topY - 4, 3, 3, '#ffd870'); P(g, cx - 4, topY - 6, 9, 1, ST[0]);
        P(g, cx - 2, topY - 8, 5, 2, TC[2]); P(g, cx, topY - 11, 1, 3, GOLD[1]); P(g, cx - 1, topY - 10, 3, 1, GOLD[1]);
      }
    }
    roofSignG(g, cx, ys, false);                                                  // дахова вивіска CAPYTAP (малюється останньою)
    // вази на балюстраді й стяги
    if (level >= 2) [10, w - 10].forEach(x => urn(g, x, top - 1));
    if (level >= 4) { urn(g, Math.round(w * 0.3), top - 1); urn(g, Math.round(w * 0.7), top - 1); }
    if (level >= 3) { pennant(g, 20, Math.max(0, top - 12), '#2a4a8c', false); pennant(g, w - 20, Math.max(0, top - 12), '#b8312a', true); }

    // ---- вивіска: різьблена рама з позолотою (текст накладається HTML-елементом у тому ж місці)
    P(g, 4, top + 7, w - 8, 19, ST[4]); P(g, 5, top + 8, w - 10, 17, ST[1]); P(g, 6, top + 9, w - 12, 15, GOLD[2]); P(g, 6, top + 9, w - 12, 1, GOLD[0]); P(g, 7, top + 10, w - 14, 13, fill);
    P(g, 7, top + 10, w - 14, 1, mix(fill, '#000000', 0.35)); P(g, 7, top + 22, w - 14, 1, mix(fill, '#ffffff', 0.12));
    for (let x = 14; x < w - 14; x += 10) { P(g, x, top + 9, 2, 1, GOLD[0]); P(g, x, top + 23, 2, 1, GOLD[3]); }
    [[5, top + 8], [w - 7, top + 8], [5, top + 23], [w - 7, top + 23]].forEach(([x, y]) => { P(g, x, y, 2, 2, GOLD[1]); P(g, x, y, 1, 1, GOLD[0]); });
    // ---- кутові квоїни на всю висоту
    quoins(g, 0, top + 7, h - 6, true); quoins(g, w - 8, top + 7, h - 6, false);
    if (level >= 4) { banner(g, 1, yB + 4, '#b8312a', 14); banner(g, w - 7, yB + 4, '#2a4a8c', 14); }
    // ---- поверхи з арочними вікнами між пілястрами
    const n = Math.max(2, Math.round(innerW / 40));
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const bs = bays(innerX, innerX + innerW, n, 6), hF = fl.fy - fl.top;
      // шар-стрічка під поверхом (поясок)
      P(g, 0, fl.fy, w, 1, ST[0]); P(g, 0, fl.fy + 1, w, 2, ST[2]); for (let x = 1; x < w - 1; x += 3) P(g, x, fl.fy + 3, 2, 1, ST[3]); P(g, 0, fl.fy + 4, w, 1, ST[3]); P(g, 0, fl.fy + 5, w, 1, ST[4]);
      // стіна між прорізами (під склепіннями) і пілястри
      P(g, innerX, fl.top - 3, innerW, 3, ST[2]); P(g, innerX, fl.top - 3, innerW, 1, ST[1]);
      bs.forEach(([bx, bw], i) => {
        spandrels(g, bx, bw, fl.top, Math.min(9, Math.round(bw * 0.28)));
        const mx = Math.round(bx + bw / 2);
        P(g, mx, fl.top + 9, 1, hF - 9, ST[4]); A(g, 0.6, () => P(g, mx + 1, fl.top + 9, 1, hF - 9, '#fff'));          // середник
        P(g, bx, fl.top + Math.round(hF * 0.42), bw, 1, ST[4]);                                                          // фрамуга
        A(g, 0.2, () => { for (let k = 0; k < 8; k++) P(g, bx + 3 + k, fl.top + 12 + (7 - k), 1, 2, '#ffffff'); });
        if (i < bs.length - 1) pilaster(g, bx + bw, fl.top - 3, fl.fy, 6);
        P(g, bx, fl.fy - 2, bw, 2, ST[2]); P(g, bx, fl.fy - 2, bw, 1, ST[1]);                                            // підвіконня
        if (level >= 3 && (i + fl.f) % 2 === 0) { P(g, bx + 3, fl.fy - 6, bw - 6, 4, '#7a4a2a'); for (let k = 0; k < bw - 8; k += 3) { P(g, bx + 4 + k, fl.fy - 9, 2, 3, ['#e8353a', '#ffd84f', '#ff8fd0'][(k / 3 | 0) % 3]); P(g, bx + 4 + k, fl.fy - 7, 2, 2, '#4f9a63'); } }    // квіти у вазонах
      });
    });
    // ---- нижній поверх: фриз з гірляндами, арки й портал із колонами
    const gy = yG;
    P(g, 0, gy, w, 1, ST[0]); P(g, 0, gy + 1, w, 1, ST[1]);
    P(g, 0, gy + 2, w, 7, '#35523f'); P(g, 0, gy + 2, w, 1, mix('#35523f', '#000000', 0.35));
    for (let x = 6; x < w - 6; x += 16) {                                       // фестони: золоті гірлянди між розетками
      const sag = 3; for (let i = 0; i <= 14; i++) { const yy = gy + 3 + Math.round(sag * Math.sin(Math.PI * i / 14)); P(g, x + 1 + i, yy, 1, 1, (i % 3) ? GOLD[1] : '#e8353a'); P(g, x + 1 + i, yy + 1, 1, 1, GOLD[3]); }
      P(g, x - 1, gy + 3, 3, 3, GOLD[2]); P(g, x, gy + 4, 1, 1, GOLD[0]);
    }
    P(g, 0, gy + 9, w, 1, ST[2]); P(g, 0, gy + 10, w, 1, ST[4]);
    const dl = door.x - 7, dr2 = door.x + door.w + 2;
    const zoneL = [innerX, dl - 2], zoneR = [dr2 + 5 + 2, innerX + innerW];
    [zoneL, zoneR].forEach(z => {
      const m = Math.max(1, Math.round((z[1] - z[0]) / 44));
      bays(z[0], z[1], m, 6).forEach(([bx, bw], i, arr) => {
        spandrels(g, bx, bw, ground.top, Math.min(6, Math.round(bw * 0.2)));
        if (i < arr.length - 1) pilaster(g, bx + bw, ground.top, ground.fy, 6);
        A(g, 0.18, () => { for (let k = 0; k < 7; k++) P(g, bx + 3 + k, ground.top + 9 + (6 - k), 1, 2, '#ffffff'); });
      });
    });
    // портал: дві колони, архітрав і трикутний фронтончик
    pilaster(g, dl, ground.top - 1, h - 6, 5); pilaster(g, dr2, ground.top - 1, h - 6, 5);
    P(g, dl - 1, ground.top - 2, door.w + 14, 3, ST[1]); P(g, dl - 1, ground.top - 2, door.w + 14, 1, ST[0]); P(g, dl - 1, ground.top, door.w + 14, 1, ST[3]);
    for (let i = 0; i < 5; i++) P(g, door.x - 4 + i * 1, gy + 5 - i, door.w + 8 - i * 2, 1, i === 0 ? ST[3] : ST[1]);
    P(g, cx - 1, gy + 1, 3, 1, GOLD[1]);
    // стіна над дверима: щит із гербом
    P(g, cx - 3, gy + 4, 6, 5, ST[2]); P(g, cx - 2, gy + 5, 4, 3, '#b8312a'); P(g, cx - 1, gy + 5, 2, 3, GOLD[1]);
    // боковий мур від квоїнів до порталу: межі нижніх вікон
    // цоколь: рустований камінь
    masonry(g, 0, h - 6, w, 6, ST, 12, 3, 1); P(g, 0, h - 6, w, 1, ST[0]); P(g, 0, h - 1, w, 1, ST[4]);
    P(g, door.x - 6, h - 3, door.w + 12, 3, ST[1]); P(g, door.x - 6, h - 3, door.w + 12, 1, ST[0]); P(g, door.x - 8, h - 2, door.w + 16, 2, ST[2]); P(g, door.x - 8, h - 2, door.w + 16, 1, ST[0]);
    lanternG(g, door.x - 11, yG + 14); lanternG(g, door.x + door.w + 12, yG + 14);
  }
  function deco(g, C) {
    const { w, h, level, door, yG } = C;
    // лимонні деревця в горщиках біля входу (на рівні 2+)
    if (level >= 2) [[door.x - 22, 0], [door.x + door.w + 20, 1]].forEach(([x, k]) => {
      const by = h - 6;
      P(g, x - 3, by - 5, 7, 5, '#b8603a'); P(g, x - 3, by - 5, 7, 1, '#d98a5a'); P(g, x - 2, by - 1, 5, 1, '#7a3a20');
      P(g, x, by - 10, 1, 5, '#6a4a30'); D(g, x, by - 14, 4, '#2e5a34'); D(g, x - 1, by - 15, 3, '#4f8a4a'); P(g, x - 2, by - 14, 1, 1, '#ffe04a'); P(g, x + 2, by - 12, 1, 1, '#ffe04a'); P(g, x, by - 17, 1, 1, '#ffe04a');
    });
  }

  /* ---------- будинки на вулиці ---------- */
  const WALLS = ['#e9c47c', '#e0a070', '#f0e2bc', '#e6b8a0', '#c8d2a8', '#dfcca2', '#d9ae8c'];
  function winArch(g, wx, wy, warm, shut, ped) {                                // арочне вікно 8×11 з віконницями, перемичкою й підвіконням
    const gl = warm ? ['#ffe9a0', '#ffd45c', '#f0a840'] : ['#bfe3f2', '#8ec4de', '#5f95b8'], mask = [4, 6, 8, 8, 8, 8, 8, 8, 8, 8, 8];
    if (shut) [wx - 3, wx + 9].forEach(sx => { P(g, sx, wy + 1, 2, 10, '#4f7a45'); P(g, sx, wy + 1, 1, 10, '#6a9a58'); for (let k = 3; k < 10; k += 2) P(g, sx, wy + k, 2, 1, '#355a30'); });
    if (ped) { P(g, wx - 1, wy - 3, 10, 1, SL[0]); P(g, wx, wy - 4, 8, 1, SL[1]); P(g, wx + 2, wy - 5, 4, 1, SL[1]); P(g, wx - 1, wy - 2, 10, 1, ST[3]); }
    for (let r = 0; r < 11; r++) { const mw = mask[r] + 2; P(g, wx + 4 - (mw >> 1), wy + r - 1, mw, 1, '#4a3228'); }
    for (let r = 0; r < 11; r++) { const mw = mask[r]; P(g, wx + 4 - (mw >> 1), wy + r, mw, 1, r < 3 ? gl[0] : r < 7 ? gl[1] : gl[2]); }
    P(g, wx + 3, wy, 2, 11, '#4a3228'); P(g, wx, wy + 5, 8, 1, '#4a3228'); P(g, wx - 1, wy - 1, 1, 1, ST[1]);
    if (!warm) { P(g, wx + 1, wy + 2, 1, 1, '#ffffff'); P(g, wx + 5, wy + 7, 1, 1, '#d8f0ff'); }
    P(g, wx - 2, wy + 11, 12, 2, SL[1]); P(g, wx - 2, wy + 11, 12, 1, SL[0]); P(g, wx - 2, wy + 13, 12, 1, ST[3]);
  }
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), wp = ramp(WALLS[(hs >>> 3) % WALLS.length]);
    lamps = lamps || [];
    houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const winter = buildSeason === 'winter';
    // стіни: штукатурка з рустованим першим поверхом і кутовими блоками
    P(g, x, top, w, h, wp[2]); P(g, x, top, 1, h, ST[4]); P(g, x + w - 1, top, 1, h, ST[4]);
    A(g, 0.22, () => P(g, x + w - 8, top + 1, 7, h - 1, wp[4])); A(g, 0.5, () => P(g, x + 1, top + 1, 2, h - 1, wp[0]));
    A(g, 0.12, () => { for (let k = 0; k < Math.floor(w * h / 22); k++) P(g, x + 1 + rnd(k, x) % (w - 2), top + 1 + rnd(x, k) % (h - 2), 1, 1, wp[4]); });
    const floors = Math.max(1, Math.floor((h - 6) / 19)), gTop = base - 19;
    masonry(g, x, gTop, w, 19, ST, 10, 4, hs % 3);                                // рустований низ
    P(g, x, gTop, w, 1, ST[0]); P(g, x, gTop + 1, w, 1, ST[3]);
    quoins(g, x, top + 4, gTop, true); quoins(g, x + w - 8, top + 4, gTop, false);
    // дах-шатро з широким звисом
    const rh = 9 + (hs % 3), inset = Math.round(w * 0.2);
    hip(g, x - 4, x + w + 4, top - rh, top - 1, inset, TC, winter);
    P(g, x - 4, top - 1, w + 8, 1, ST[4]);
    // карниз із зубчиками
    P(g, x - 1, top, w + 2, 1, ST[0]); P(g, x - 1, top + 1, w + 2, 2, ST[2]); for (let k = x; k < x + w; k += 3) P(g, k, top + 1, 2, 2, ST[3]); P(g, x - 1, top + 3, w + 2, 1, ST[3]);
    // димар або кампаніла
    if (hs % 7 === 0 && w >= 44 && h > 70) {                                      // дзвіниця
      const tw = 14, tx = x + w - tw - 6, th = 20;
      P(g, tx, top - rh - th + 6, tw, th, ST[2]); P(g, tx, top - rh - th + 6, 1, th, ST[1]); P(g, tx + tw - 1, top - rh - th + 6, 1, th, ST[3]); P(g, tx, top - rh - th + 6, tw, 1, ST[0]);
      P(g, tx + 3, top - rh - th + 11, 8, 8, ST[4]); P(g, tx + 4, top - rh - th + 12, 6, 7, '#2a2038'); P(g, tx + 6, top - rh - th + 15, 2, 3, GOLD[1]);
      for (let i = 0; i < 7; i++) P(g, tx + i, top - rh - th + 5 - i, tw - 2 * i, 1, i % 2 ? TC[2] : TC[1]);
      P(g, tx + 6, top - rh - th - 3, 1, 5, GOLD[1]); P(g, tx + 5, top - rh - th - 2, 3, 1, GOLD[1]);
    } else if (hs % 3 === 0 && w >= 36) {
      const cxp = x + 8 + (hs >>> 6) % Math.max(1, w - 22); P(g, cxp, top - rh - 5, 7, 8, ST[2]); P(g, cxp, top - rh - 5, 7, 1, ST[0]); P(g, cxp, top - rh - 5, 1, 8, ST[1]); P(g, cxp - 1, top - rh - 6, 9, 2, ST[3]); P(g, cxp + 2, top - rh - 8, 3, 2, '#c8c0b0');
    } else if (hs % 5 === 1 && w >= 40) {                                          // альтана-лоджія на даху
      const lx = x + (w >> 1) - 11, ly = top - rh - 9;
      P(g, lx, ly + 3, 22, 6, '#2a2038'); P(g, lx, ly + 3, 3, 6, ST[2]); P(g, lx + 19, ly + 3, 3, 6, ST[2]); P(g, lx + 9, ly + 3, 4, 6, ST[2]);
      P(g, lx - 2, ly, 26, 3, TC[2]); P(g, lx - 2, ly, 26, 1, TC[0]); P(g, lx - 2, ly + 2, 26, 1, TC[4]);
    }
    // вікна
    const doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps), shut = hs % 2 === 0, pedF = (hs >>> 9) % 2;
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 17)), sp = (w - 4) / cols;
      if (f > 0) { P(g, x, y0 - 6, w, 1, SL[0]); P(g, x, y0 - 5, w, 1, SL[2]); P(g, x, y0 - 4, w, 1, ST[3]); }         // поясок між поверхами
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 8) / 2);
        if (f === floors - 1 && wx + 9 >= (doorOk ? doorX : -9999) - 2 && wx <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        winArch(g, wx, y0, ((c + f + x) % 4 === 0), shut && f < floors - 1, pedF && f % 2 === 1);
        houseGlass.push([wx + 1, y0 + 1, 6, 9]);
      }
      if (f === 1 && floors >= 3 && hs % 4 === 1) {                               // балкон з балюстрадою
        const bx = x + 3, bw = Math.min(w - 6, 30), by = y0 + 13;
        P(g, bx, by, bw, 1, SL[0]); P(g, bx, by + 1, bw, 2, ST[2]); for (let k = bx + 1; k < bx + bw - 1; k += 3) P(g, k, by - 4, 2, 4, ST[1]); P(g, bx, by - 5, bw, 1, SL[0]);
      }
    }
    if (doorOk) {                                                                  // арочні двері з замковим каменем
      houseDoors.push({ x: doorX + 5, y: base });
      [[0, 4], [1, 6], [2, 8]].forEach(([r, mw]) => P(g, doorX + 5 - (mw + 2) / 2, base - 17 + r - 1, mw + 2, 1, '#2a2038'));
      P(g, doorX - 1, base - 14, doorW + 2, 14, '#2a2038'); P(g, doorX, base - 14, doorW, 14, '#7a4f35'); P(g, doorX, base - 14, 1, 14, '#946444');
      [[0, 4], [1, 6], [2, 8], [3, 10]].forEach(([r, mw]) => P(g, doorX + 5 - mw / 2, base - 17 + r, mw, 1, '#7a4f35'));
      P(g, doorX + 4, base - 16, 2, 16, '#4a3228'); P(g, doorX + 2, base - 9, 1, 1, GOLD[1]); P(g, doorX + 7, base - 9, 1, 1, GOLD[1]);
      P(g, doorX + 3, base - 19, 4, 2, ST[1]); P(g, doorX + 3, base - 19, 4, 1, ST[0]);
      P(g, doorX - 3, base - 1, doorW + 6, 1, ST[1]);
    }
  }
  ARCH['renaissance'] = { front, deco, house };
})();

// ---- епоха 1: Ретро (хром, шашки, заокруглені вікна)
(function () {
  const { P, A, D, ramp, mix, rnd } = AR;
  const TQ = ramp('#4fc6ba'), CR = ramp('#f7edcf'), RD = ramp('#e2453b'), PK = ramp('#f59ab6'), YL = ramp('#ffd84a');
  const CH = ['#ffffff', '#e6eff7', '#b4c3d3', '#74839a', '#3c4660'], BK = '#1e1e28';

  function star(g, x, y, r, c1, c2) {                                              // атомна зірка: промені з кульками на кінцях
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
    dirs.forEach(([dx, dy], i) => {
      for (let k = 2; k <= r; k++) P(g, x + dx * k, y + dy * k, 1, 1, CH[3]);
      const bx = x + dx * (r + 1), by = y + dy * (r + 1); P(g, bx - 1, by - 1, 3, 3, i % 2 ? c1 : c2); P(g, bx - 1, by - 1, 1, 1, '#ffffff');
    });
    D(g, x, y, 2, CH[2]); P(g, x - 1, y - 1, 1, 1, CH[0]);
  }
  function pillRows(h, r) { const out = []; for (let j = 0; j < h; j++) { const jj = j < r ? j : (j >= h - r ? h - 1 - j : r); out.push(jj >= r ? 0 : r - Math.round(Math.sqrt(Math.max(0, r * r - (r - jj - 0.5) * (r - jj - 0.5))))); } return out; }
  function pillFill(g, x, y, w, h, r, c) { pillRows(h, r).forEach((ins, j) => P(g, x + ins, y + j, w - ins * 2, 1, c)); }
  function pillClear(g, x, y, w, h, r) { pillRows(h, r).forEach((ins, j) => g.clearRect(Math.round(x + ins), Math.round(y + j), Math.round(w - ins * 2), 1)); }
  function bays(x0, x1, n, pier) { const bw = (x1 - x0 - (n - 1) * pier) / n, out = []; for (let i = 0; i < n; i++) out.push([Math.round(x0 + i * (bw + pier)), Math.round(bw)]); return out; }
  function atom(g, x, y) { P(g, x - 2, y, 5, 1, CH[3]); P(g, x, y - 2, 1, 5, CH[3]); P(g, x - 1, y - 1, 1, 1, CH[3]); P(g, x + 1, y + 1, 1, 1, CH[3]); P(g, x + 1, y - 1, 1, 1, CH[3]); P(g, x - 1, y + 1, 1, 1, CH[3]); P(g, x - 3, y - 1, 2, 2, RD[2]); P(g, x + 2, y - 1, 2, 2, YL[2]); P(g, x - 1, y - 3, 2, 2, TQ[2]); P(g, x - 1, y + 2, 2, 2, PK[2]); }
  function globe(g, x, y) { D(g, x, y, 1, '#ffffff'); P(g, x, y, 1, 1, '#ffe9a0'); }
  function checker(g, x, y, w, h, s, c1, c2) { for (let j = 0; j * s < h; j++) for (let i = 0; i * s < w; i++) P(g, x + i * s, y + j * s, Math.min(s, w - i * s), Math.min(s, h - j * s), (i + j) % 2 ? c1 : c2); }

  function front(g, C) {
    const { w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, cx = w >> 1, fill = currentEpoch().signFill || look.signFill, ys = Math.max(0, top - 10);
    // дах: парапет із хромом, пілон і зірки
    P(g, 0, top - 2, w, 1, CH[0]); P(g, 0, top - 1, w, 1, CH[2]); P(g, 0, top, w, 4, CR[2]); P(g, 0, top, w, 1, CR[0]); P(g, 0, top + 1, w, 1, RD[2]); P(g, 0, top + 2, w, 1, RD[3]);
    P(g, cx - 31, Math.max(0, ys - 2), 3, top - Math.max(0, ys - 2), CH[2]); P(g, cx + 29, Math.max(0, ys - 2), 3, top - Math.max(0, ys - 2), CH[2]);
    P(g, cx - 31, Math.max(0, ys - 2), 1, top - Math.max(0, ys - 2), CH[0]); P(g, cx + 29, Math.max(0, ys - 2), 1, top - Math.max(0, ys - 2), CH[0]);
    const sy = Math.max(9, top - 8); if (level >= 2) { star(g, 22, sy, 5, RD[2], YL[2]); star(g, w - 22, sy, 5, YL[2], RD[2]); }
    if (level >= 3) { star(g, 46, sy + 1, 3, TQ[2], PK[2]); star(g, w - 46, sy + 1, 3, PK[2], TQ[2]); }
    roofSignG(g, cx, ys, false);
    // пояс зі смугастою кромкою, шахи
    checker(g, 0, top + 4, w, 2, 2, BK, '#ffffff'); P(g, 0, top + 3, w, 1, CH[0]); P(g, 0, top + 6, w, 1, CH[2]);
    // вивіска: хромована рама з червоним окантуванням
    P(g, 0, top + 7, w, 19, CH[3]); P(g, 1, top + 8, w - 2, 17, CH[0]); P(g, 3, top + 9, w - 6, 15, RD[2]); P(g, 7, top + 10, w - 14, 13, fill);
    P(g, 3, top + 9, w - 6, 1, RD[0]); P(g, 7, top + 10, w - 14, 1, mix(fill, '#000000', 0.4));
    for (let k = 0; k < 4; k++) { P(g, 9 + k * 3, top + 11, 2, 11, CH[0]); P(g, w - 11 - k * 3, top + 11, 2, 11, CH[0]); A(g, 0.4, () => { P(g, 10 + k * 3, top + 11, 1, 11, RD[2]); P(g, w - 12 - k * 3, top + 11, 1, 11, RD[2]); }); }
    for (let x = 12; x < w - 12; x += 12) globe(g, x, top + 8);
    // кутові колони: кремові з хромованими ребрами та ілюмінаторами
    const cH = h - 6 - (top + 26);
    [0, w - 8].forEach((x, s) => {
      P(g, x, top + 26, 8, cH, CR[2]); P(g, x + (s ? 7 : 0), top + 26, 1, cH, CR[3]); P(g, x + (s ? 0 : 7), top + 26, 1, cH, CR[0]);
      for (let k = 1; k < 7; k += 2) { P(g, x + k, top + 26, 1, cH, CH[1]); P(g, x + k, top + 26, 1, 1, CH[0]); }
    });
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const hF = fl.fy - fl.top, n = Math.max(2, Math.round(innerW / 40)), bs = bays(innerX, innerX + innerW, n, 8);
      P(g, 0, fl.fy, w, 1, CH[0]); P(g, 0, fl.fy + 1, w, 1, CH[2]); P(g, 0, fl.fy + 2, w, 3, TQ[2]); P(g, 0, fl.fy + 3, w, 1, '#ffffff'); P(g, 0, fl.fy + 5, w, 1, RD[3]);        // облицювання перекриття зі «швидкісною» смугою
      P(g, innerX, fl.top - 3, innerW, hF + 3, CR[2]); P(g, innerX, fl.top - 3, innerW, 1, CH[0]);                                                                             // кремова стіна між вікнами
      for (let y = fl.top + 2; y < fl.fy - 1; y += 5) A(g, 0.5, () => P(g, innerX, y, innerW, 1, TQ[1]));                                                                       // швидкісні смуги
      bs.forEach(([bx, bw], i) => {
        pillFill(g, bx - 2, fl.top - 2, bw + 4, hF + 3, 6, CH[2]); pillFill(g, bx - 1, fl.top - 1, bw + 2, hF + 1, 5, RD[2]); pillClear(g, bx, fl.top, bw, hF - 1, 4);          // хромована рамка, червоний кант, заокруглений проріз
        P(g, bx + 5, fl.top - 2, bw - 10, 1, CH[0]);
        A(g, 0.22, () => { for (let k = 0; k < 8; k++) P(g, bx + 5 + k, fl.top + 5 + (7 - k), 1, 2, '#ffffff'); });
        if (i < bs.length - 1) { const px = bx + bw + 2; atom(g, px + 2, fl.top + (hF >> 1)); for (let k = 0; k < 3; k++) P(g, px + 1, fl.top + 2 + k * 4, 2, 1, '#ffffff'); }
      });
      [4, w - 4].forEach(x => { D(g, x, fl.top + 13, 3, CH[3]); D(g, x, fl.top + 13, 2, '#8fd8f0'); P(g, x - 1, fl.top + 12, 1, 1, '#ffffff'); });
    });
    // навіс над першим поверхом
    P(g, 0, yG, w, 1, CH[0]); P(g, 0, yG + 1, w, 1, CH[2]); P(g, 0, yG + 2, w, 7, TQ[2]); P(g, 0, yG + 2, w, 1, TQ[1]);
    for (let x = 4; x < w - 4; x += 8) P(g, x, yG + 4, 4, 1, '#ffffff');
    P(g, 0, yG + 9, w, 1, RD[2]); P(g, 0, yG + 10, w, 1, RD[4]);
    for (let x = 6; x < w - 6; x += 12) { if (x > door.x - 6 && x < door.x + door.w + 6) continue; globe(g, x, yG + 12); }
    // козирок із червоно-білою смугою над дверима
    const ax = door.x - 5, aw = door.w + 10;
    for (let x = 0; x < aw; x++) P(g, ax + x, yG + 10, 1, 3, (x >> 2) % 2 ? '#ffffff' : RD[2]);
    for (let x = 0; x < aw; x += 4) { P(g, ax + x, yG + 13, 4, 1, (x >> 2) % 2 ? '#ffffff' : RD[2]); }
    P(g, door.x - 3, yG + 13, 2, h - 6 - yG - 13, CH[2]); P(g, door.x + door.w + 1, yG + 13, 2, h - 6 - yG - 13, CH[2]);
    // цоколь: шашки, хромований плінтус
    checker(g, 0, h - 5, w, 4, 4, BK, '#ffffff'); P(g, 0, h - 6, w, 1, CH[1]); P(g, 0, h - 1, w, 1, CH[3]);
    P(g, door.x - 6, h - 3, door.w + 12, 3, CH[2]); P(g, door.x - 6, h - 3, door.w + 12, 1, CH[0]);
    if (level <= 4) { lanternG(g, door.x - 9, yG + 15); lanternG(g, door.x + door.w + 10, yG + 15); }
  }
  function deco(g, C) {
    const { w, h, level, door } = C;
    // будка з журналами та рожевий фламінго (газон)
    if (level >= 2) { const x = door.x + door.w + 22, y = h - 6; P(g, x, y - 12, 1, 12, '#e0e0e8'); D(g, x, y - 15, 3, '#ff7aa8'); P(g, x + 1, y - 18, 3, 1, '#ff7aa8'); P(g, x + 3, y - 18, 1, 2, '#ff7aa8'); P(g, x + 4, y - 17, 2, 1, '#ffb040'); P(g, x - 1, y - 1, 3, 1, '#4a4a58'); P(g, x + 1, y - 6, 1, 6, '#ff7aa8'); }
  }

  /* ---------- будинки: пастельні блоки з плоским дахом, панорамними вікнами й смугастими навісами ---------- */
  const WALLS = ['#bdeedd', '#ffd5df', '#fff1b3', '#c8e4ff', '#e6d4f6', '#ffdcc0', '#cfeede'];
  const AWN = [[RD[2], '#ffffff'], [TQ[2], '#ffffff'], [PK[2], '#ffffff'], [YL[2], '#ffffff']];
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), wp = ramp(WALLS[(hs >>> 3) % WALLS.length]);
    lamps = lamps || []; houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const winter = buildSeason === 'winter';
    P(g, x, top, w, h, wp[2]); P(g, x, top, 1, h, wp[3]); P(g, x + w - 1, top, 1, h, wp[4]); A(g, 0.22, () => P(g, x + w - 7, top + 1, 6, h - 1, wp[4])); A(g, 0.55, () => P(g, x + 1, top + 1, 2, h - 1, wp[0]));
    // плоский дах-плита з хромовою кромкою та тінню
    P(g, x - 3, top - 4, w + 6, 4, CR[1]); P(g, x - 3, top - 4, w + 6, 1, CH[0]); P(g, x - 3, top - 1, w + 6, 1, CR[3]); P(g, x - 3, top - 3 + 1, w + 6, 1, RD[2]);
    A(g, 0.25, () => P(g, x - 1, top, w + 2, 3, '#000000'));
    if (winter) { P(g, x - 3, top - 7, w + 6, 3, '#ffffff'); P(g, x - 3, top - 5, w + 6, 1, '#d9e7f8'); }
    const roofK = hs % 5;
    if (roofK === 0) { const ax = x + 6 + (hs >>> 5) % Math.max(1, w - 24); P(g, ax + 5, top - 16, 1, 12, CH[3]); P(g, ax, top - 14, 11, 1, CH[3]); P(g, ax + 2, top - 11, 7, 1, CH[3]); P(g, ax + 3, top - 8, 5, 1, CH[3]); }
    else if (roofK === 2 && w >= 38) { const bx = x + w - 26; for (let i = 0; i < 12; i++) P(g, bx + i, top - 5 - Math.round(Math.sqrt(36 - (i - 5.5) * (i - 5.5)) * 0.8), 1, Math.round(Math.sqrt(36 - (i - 5.5) * (i - 5.5)) * 0.8) + 1, CH[2]); P(g, bx, top - 5, 12, 1, CH[3]); P(g, bx + 4, top - 12, 4, 8, CH[1]); P(g, bx + 4, top - 12, 4, 1, CH[0]); }
    else if (roofK === 3 && w >= 36) { const nx = x + 4 + (hs >>> 6) % Math.max(1, w - 36); const word = ['EAT', 'BAR', 'SODA', 'DINER'][(hs >>> 8) % 4], sw = word.length * 4 + 4; P(g, nx + 2, top - 14, 1, 10, CH[3]); P(g, nx + sw - 3, top - 14, 1, 10, CH[3]); P(g, nx, top - 17, sw, 13, BK); P(g, nx + 1, top - 16, sw - 2, 11, RD[2]); AR.txt(g, nx + 3, top - 14, word, 'w'); P(g, nx + 1, top - 16, sw - 2, 1, RD[0]); }
    // поверхи: широкі панорамні вікна по два
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 24)), sp = (w - 4) / cols;
      if (f > 0) { P(g, x, y0 - 5, w, 1, '#ffffff'); P(g, x, y0 - 4, w, 2, TQ[2]); P(g, x, y0 - 2, w, 1, wp[4]); }
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 20) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && wx + 20 >= (doorOk ? doorX : -9999) - 2 && wx <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        P(g, wx - 1, y0 - 1, 22, 13, CH[0]); P(g, wx - 1, y0 + 11, 22, 1, CH[3]); P(g, wx, y0, 20, 11, lit ? '#ffd45c' : '#9fd6ec');
        if (!lit) { P(g, wx, y0, 20, 3, '#cfeefa'); P(g, wx + 2, y0 + 1, 2, 1, '#ffffff'); P(g, wx + 5, y0 + 2, 1, 1, '#ffffff'); }
        P(g, wx + 9, y0, 2, 11, CH[1]); P(g, wx + 9, y0, 1, 11, CH[0]);
        if (hash2(wx + 5, y0 + 3) % 3) { P(g, wx + 1, y0, 3, 8, PK[2]); P(g, wx + 16, y0, 3, 8, PK[2]); P(g, wx + 1, y0, 1, 8, PK[0]); }
        P(g, wx - 2, y0 + 12, 24, 1, '#ffffff');
        houseGlass.push([wx, y0, 20, 11]);
      }
    }
    // двері-ілюмінатор і смугастий навіс
    if (doorOk) {
      houseDoors.push({ x: doorX + 5, y: base });
      const [a, b] = AWN[(hs >>> 11) % AWN.length];
      for (let k = 0; k < doorW + 8; k++) P(g, doorX - 4 + k, base - 20, 1, 4, (k >> 1) % 2 ? b : a);
      for (let k = 0; k < doorW + 8; k += 2) P(g, doorX - 4 + k, base - 16, 2, 1, (k >> 1) % 2 ? b : a);
      P(g, doorX - 1, base - 14, doorW + 2, 14, CH[3]); P(g, doorX, base - 14, doorW, 14, TQ[2]); P(g, doorX, base - 14, 1, 14, TQ[1]); P(g, doorX + 4, base - 14, 2, 14, TQ[3]);
      D(g, doorX + 2, base - 9, 1, '#cfeefa'); D(g, doorX + 7, base - 9, 1, '#cfeefa'); P(g, doorX + 8, base - 5, 1, 1, CH[0]);
    }
  }
  ARCH['retro'] = { front, deco, house };
})();

// ---- епоха 2: Диско (смуги заходу, круглі вікна, дзеркальні кулі)
(function () {
  const { P, A, D, ramp, mix, rnd } = AR;
  const PU = ramp('#6a2a9a'), MG = ramp('#e0409a'), OR = ramp('#f08a30'), YL = ramp('#ffd24a'), BR = ramp('#6a3a20'), CY = ramp('#35c6d8'), DK = '#24103a';
  const SUN = [YL[1], YL[2], OR[1], OR[2], MG[1], MG[2], PU[2], PU[3]];

  function clearDisc(g, cx, cy, r) { for (let dy = -r; dy <= r; dy++) { const half = Math.round(Math.sqrt(r * r + 0.5 - dy * dy)); g.clearRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1); } }
  function mirrorBall(g, cx, cy, r) {                                           // кулька з гранями: світло зверху-ліворуч, іскри
    const L = [-0.55, -0.6, 0.58];
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r + 0.5) continue;
      const nx = x / r, ny = y / r, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)), lum = nx * L[0] + ny * L[1] + nz * L[2], tile = rnd((x + 40) >> 1, (y + 40) >> 1) % 5;
      let v = 0.45 + lum * 0.45 + (tile - 2) * 0.07; v = Math.max(0, Math.min(1, v));
      const c = v < 0.3 ? '#4a5266' : v < 0.5 ? '#8a94aa' : v < 0.7 ? '#c4ccdc' : v < 0.88 ? '#eaf0fa' : '#ffffff';
      P(g, cx + x, cy + y, 1, 1, c);
      if (((x >> 1) + (y >> 1)) % 2 === 0 && x % 2 === 0) P(g, cx + x, cy + y, 1, 1, mix(c, '#2a3048', 0.25));
    }
    P(g, cx - r + 1, cy - r + 2, 1, 1, '#ffffff'); P(g, cx + 2, cy - 1, 2, 1, '#ffffff'); P(g, cx + 3, cy - 2, 1, 3, '#ffffff');
  }
  function sparkle(g, x, y, c) { P(g, x, y - 2, 1, 5, c); P(g, x - 2, y, 5, 1, c); }
  function bulbs(g, x0, x1, y, step) { for (let x = x0, i = 0; x < x1; x += step, i++) { P(g, x, y, 2, 2, i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? YL[0] : OR[0]); } }

  function front(g, C) {
    const { w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, cx = w >> 1, fill = currentEpoch().signFill || look.signFill, ys = Math.max(0, top - 10);
    // дах: смугастий парапет, дзеркальні кулі на стовпчиках, зірки
    for (let i = 0; i < 4; i++) P(g, 0, top - 1 + i, w, 1, [YL[2], OR[2], MG[2], PU[2]][i]);
    P(g, 0, top - 2, w, 1, PU[4]); P(g, 0, top + 3, w, 1, PU[4]);
    const by = Math.max(7, top - 7);
    [[20, 6], [w - 20, 6]].forEach(([x, r]) => { P(g, x, by + r, 1, top - by - r, '#9aa4b8'); mirrorBall(g, x, by, r); });
    if (level >= 3) [[44, 4], [w - 44, 4]].forEach(([x, r]) => { P(g, x, by - 1 + r, 1, top - by - r + 1, '#9aa4b8'); mirrorBall(g, x, by - 1, r); });
    sparkle(g, 12, Math.max(4, by - 8), '#ffffff'); sparkle(g, w - 10, Math.max(4, by - 6), YL[0]); if (level >= 2) { sparkle(g, 34, Math.max(3, by - 9), MG[0]); sparkle(g, w - 32, Math.max(3, by - 8), '#ffffff'); }
    roofSignG(g, cx, ys, false);
    // карниз: смуги заходу сонця
    P(g, 0, top + 4, w, 3, DK); for (let x = 0; x < w; x += 8) { P(g, x, top + 5, 4, 1, OR[2]); P(g, x + 4, top + 5, 4, 1, MG[2]); }
    // вивіска: подвійна рамка з лампочками
    P(g, 0, top + 7, w, 19, DK); P(g, 1, top + 8, w - 2, 17, MG[2]); P(g, 3, top + 9, w - 6, 15, YL[2]); P(g, 5, top + 10, w - 10, 13, DK); P(g, 7, top + 10, w - 14, 13, fill);
    bulbs(g, 7, w - 8, top + 8, 5); bulbs(g, 9, w - 8, top + 23, 5);
    // кутові колони: коричневі з помаранчевими смугами
    const cH = h - 6 - (top + 26);
    [0, w - 8].forEach((x, s) => { P(g, x, top + 26, 8, cH, BR[2]); for (let k = 1; k < 8; k += 2) P(g, x + k, top + 26, 1, cH, k % 4 === 1 ? OR[2] : YL[2]); P(g, x + (s ? 7 : 0), top + 26, 1, cH, BR[4]); });
    // поверхи: стіна-«захід сонця» з круглими ілюмінаторами
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const hF = fl.fy - fl.top, y0 = fl.top - 3, H2 = hF + 3, n = Math.max(2, Math.round(innerW / 34)), pitch = innerW / n;
      P(g, 0, fl.fy, w, 1, YL[1]); for (let i = 0; i < 4; i++) P(g, 0, fl.fy + 1 + i, w, 1, [YL[2], OR[2], MG[2], PU[3]][i]); P(g, 0, fl.fy + 5, w, 1, DK);
      for (let j = 0; j < H2; j++) { const ci = Math.min(SUN.length - 1, Math.floor(j / (H2 / SUN.length))); P(g, innerX, y0 + j, innerW, 1, SUN[ci]); }
      for (let i = 0; i < n; i++) {
        const mx = innerX + pitch * (i + 0.5), cy = fl.top + (hF >> 1) - 1, r = Math.min(12, (hF >> 1) - 3, Math.floor(pitch / 2) - 4);
        D(g, mx, cy, r + 3, DK); D(g, mx, cy, r + 2, OR[2]); D(g, mx, cy, r + 1, YL[1]); clearDisc(g, mx, cy, r);
        A(g, 0.28, () => { for (let k = 0; k < r; k++) P(g, mx - r + 4 + k, cy - 2 + (r - 4 - k > 0 ? (r - 4 - k) : 0) - 1, 1, 2, '#ffffff'); });
      }
    });
    // навіс: темно-фіолетовий із лампочками
    P(g, 0, yG, w, 1, YL[1]); P(g, 0, yG + 1, w, 8, PU[3]); for (let x = 2; x < w - 2; x += 10) { P(g, x, yG + 3, 6, 1, MG[2]); P(g, x + 3, yG + 5, 6, 1, OR[2]); }
    P(g, 0, yG + 9, w, 1, DK); bulbs(g, 3, w - 4, yG + 10, 6);
    // портал: золота рамка, зірка
    P(g, door.x - 4, yG + 10, door.w + 8, 3, YL[2]); P(g, door.x - 4, yG + 10, door.w + 8, 1, YL[0]); P(g, door.x - 4, yG + 10, 3, h - 6 - yG - 10, YL[2]); P(g, door.x + door.w + 1, yG + 10, 3, h - 6 - yG - 10, YL[2]);
    sparkle(g, door.x + (door.w >> 1), yG + 5, '#ffffff'); D(g, door.x + (door.w >> 1), yG + 5, 2, YL[1]);
    // цоколь: танцпол — кольорові плитки
    for (let x = 0, i = 0; x < w; x += 4, i++) for (let j = 0; j < 2; j++) P(g, x, h - 6 + j * 3, 4, 3, [MG[2], PU[2], CY[2], YL[2]][(i + j * 2) % 4]);
    P(g, 0, h - 6, w, 1, '#ffffff'); P(g, 0, h - 1, w, 1, DK);
    if (level <= 4) { lanternG(g, door.x - 9, yG + 15); lanternG(g, door.x + door.w + 10, yG + 15); }
  }
  function deco(g, C) {
    const { w, h, level, door, yG } = C;
    if (level >= 2) { const x = door.x - 18, y = yG + 14; P(g, x, yG + 10, 1, 4, '#9aa4b8'); mirrorBall(g, x, y + 1, 3); }
  }

  /* ---------- будинки ---------- */
  const WALLS = ['#d97a3a', '#e4b43a', '#7ca03a', '#9a6a44', '#c8a0d8', '#e8d8b0', '#d9548a'];
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), wp = ramp(WALLS[(hs >>> 3) % WALLS.length]);
    lamps = lamps || []; houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const winter = buildSeason === 'winter';
    P(g, x, top, w, h, wp[2]); P(g, x, top, 1, h, wp[4]); P(g, x + w - 1, top, 1, h, wp[4]); A(g, 0.25, () => P(g, x + w - 7, top + 1, 6, h - 1, wp[4])); A(g, 0.5, () => P(g, x + 1, top + 1, 2, h - 1, wp[0]));
    // горизонтальні смуги-«захід» під дахом
    for (let i = 0; i < 4; i++) P(g, x + 1, top + 5 + i * 2, w - 2, 2, [YL[2], OR[2], MG[2], PU[2]][(i + hs) % 4]);
    // дах: коричнева плита й зсув (односхилий)
    P(g, x - 3, top - 5, w + 6, 5, BR[2]); P(g, x - 3, top - 5, w + 6, 1, BR[0]); P(g, x - 3, top - 1, w + 6, 1, BR[4]);
    for (let i = 0; i < 4; i++) P(g, x - 3 + i * 2, top - 9 + i, w + 6 - i * 4 - 0, 1, i % 2 ? BR[1] : BR[3]);
    A(g, 0.28, () => P(g, x - 1, top, w + 2, 3, '#000000'));
    if (winter) P(g, x - 3, top - 8, w + 6, 3, '#ffffff');
    const roofK = hs % 6;
    if (roofK === 0) { const bx = x + 8 + (hs >>> 5) % Math.max(1, w - 16); P(g, bx, top - 14, 1, 6, '#9aa4b8'); mirrorBall(g, bx, top - 16, 4); sparkle(g, bx + 6, top - 20, '#ffffff'); }
    else if (roofK === 1 && w >= 30) { const wd = ['DISCO', 'FUNK', 'SOUL', 'GO GO'][(hs >>> 8) % 4], sw = wd.length * 4 + 5, sx = x + Math.max(2, Math.min(w - sw - 2, 4 + (hs >>> 9) % Math.max(1, w - sw))); P(g, sx, top - 15, sw, 6, DK); P(g, sx + 1, top - 14, sw - 2, 4, MG[2]); AR.txt(g, sx + 3, top - 13, wd, 'w'); }
    // поверхи з круглими вікнами
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 15)), sp = (w - 4) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = x + 2 + c * sp + sp / 2, cy = y0 + 5, lit = hash2(Math.round(wx), y0) % 3 === 0;
        if (f === floors - 1 && wx + 6 >= (doorOk ? doorX : -9999) - 2 && wx - 6 <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        D(g, wx, cy, 6, DK); D(g, wx, cy, 5, c % 2 ? OR[2] : YL[2]); D(g, wx, cy, 4, lit ? '#ffd45c' : '#9fd6ec');
        if (!lit) { P(g, wx - 3, cy - 3, 2, 1, '#ffffff'); P(g, wx - 2, cy - 2, 1, 1, '#ffffff'); } else { A(g, 0.3, () => D(g, wx, cy, 3, '#ffffff')); }
        P(g, wx - 1, cy - 4, 1, 9, DK); P(g, wx - 4, cy, 9, 1, DK);
        houseGlass.push([Math.round(wx) - 3, cy - 3, 7, 7]);
      }
    }
    if (doorOk) {
      houseDoors.push({ x: doorX + 5, y: base });
      P(g, doorX - 2, base - 17, doorW + 4, 3, [YL[2], MG[2], OR[2]][(hs >>> 11) % 3]); P(g, doorX - 2, base - 15, doorW + 4, 1, DK);
      P(g, doorX - 1, base - 14, doorW + 2, 14, DK); P(g, doorX, base - 14, doorW, 14, BR[2]); P(g, doorX, base - 14, 1, 14, BR[1]); D(g, doorX + 5, base - 9, 3, '#ffd45c'); D(g, doorX + 5, base - 9, 2, '#fff0b0'); P(g, doorX + 4, base - 12, 1, 6, DK);
    }
  }
  ARCH['disco'] = { front, deco, house };
})();

// ---- епоха 3: Аркади (неон, прибульці, мемфіс)
(function () {
  const { P, A, D, ramp, mix, rnd } = AR;
  const BK = '#14141c', BK2 = '#22222e', PK = '#ff3fa0', CY = '#2ee8ff', YL = '#ffe83a', PU = '#7a3cff', PP = '#ffb8e0', TL = '#20c8b0', WH = '#ffffff';
  const NEON = [PK, CY, YL, PU, TL];

  const INV = ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'];   // піксельний прибулець
  const GHO = ['..#####..', '.#######.', '#########', '#.##.##.#', '#########', '#########', '#.##.##.#'];
  function sprite(g, x, y, rows, c, c2) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') P(g, x + i, y + j, 1, 1, c); }); }
  function neonBox(g, x, y, w, h, c) { P(g, x, y, w, 1, c); P(g, x, y + h - 1, w, 1, c); P(g, x, y, 1, h, c); P(g, x + w - 1, y, 1, h, c); A(g, 0.28, () => { P(g, x - 1, y - 1, w + 2, 1, c); P(g, x - 1, y + h, w + 2, 1, c); P(g, x - 1, y - 1, 1, h + 2, c); P(g, x + w, y - 1, 1, h + 2, c); }); }
  function memphis(g, x, y, w, h, k) {                                          // мотив мемфіс на стовпі: зигзаг, трикутник, кружечки, хвиля
    const m = k % 4;
    if (m === 0) { for (let j = 0; j + 2 < h; j += 4) { P(g, x + 1, y + j, 3, 1, YL); P(g, x + 3, y + j + 1, 3, 1, YL); P(g, x + 1, y + j + 2, 3, 1, YL); } }
    else if (m === 1) { for (let t = 0; t < 4; t++) P(g, x + 3 - t, y + 4 + t, t * 2 + 1, 1, PK); for (let t = 0; t < 4; t++) P(g, x + 3 - t, y + 16 + t, t * 2 + 1, 1, CY); }
    else if (m === 2) { for (let j = 4; j + 3 < h; j += 7) D(g, x + 3, y + j, 2, j % 2 ? CY : PP); }
    else { for (let j = 0; j + 4 < h; j += 5) { P(g, x + 1, y + j, 2, 1, TL); P(g, x + 3, y + j + 1, 2, 1, TL); P(g, x + 5, y + j, 1, 1, TL); } }
  }
  function chase(g, x0, x1, y, t0) { for (let x = x0, i = 0; x < x1; x += 5, i++) { P(g, x, y, 3, 3, (i + t0) % 3 === 0 ? YL : (i % 2 ? WH : '#ff9a3a')); A(g, 0.3, () => P(g, x - 1, y - 1, 5, 5, YL)); } }
  function carpet(g, x, y, w, h) { for (let j = 0; j * 3 < h; j++) for (let i = 0; i * 3 < w; i++) P(g, x + i * 3, y + j * 3, 3, Math.min(3, h - j * 3), (i + j) % 2 ? BK : (i % 4 < 2 ? '#3a1a6a' : '#0a3a4a')); for (let i = 0; i < w; i += 9) P(g, x + i + 1, y + 1, 1, 1, i % 18 ? PK : CY); }

  function front(g, C) {
    const { w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, cx = w >> 1, fill = currentEpoch().signFill || look.signFill, ys = Math.max(0, top - 10);
    // дах: чорний парапет з неоновою лінією, прибульці-вивіски й антена
    P(g, 0, top - 1, w, 8, BK); P(g, 0, top - 1, w, 1, PK); P(g, 0, top + 1, w, 1, BK2); A(g, 0.3, () => P(g, 0, top - 2, w, 1, PK));
    const iy = Math.max(1, top - 11);
    if (level >= 2) { sprite(g, 12, iy, INV, CY); sprite(g, w - 23, iy, INV, PK); }
    if (level >= 3) { sprite(g, 36, iy + 2, GHO, YL); sprite(g, w - 45, iy + 2, GHO, TL); }
    if (level === 1) { sprite(g, 8, Math.max(0, top - 9), GHO, CY); sprite(g, w - 17, Math.max(0, top - 9), GHO, PK); }
    roofSignG(g, cx, ys, false);
    // вивіска: неонова рамка з маркізою лампочок
    P(g, 0, top + 7, w, 19, BK); neonBox(g, 4, top + 8, w - 8, 17, PK); neonBox(g, 6, top + 10, w - 12, 13, CY); P(g, 7, top + 11, w - 14, 11, fill);
    chase(g, 8, w - 10, top + 5, 0); chase(g, 10, w - 10, top + 24, 1);
    // кутові колони: чорні з мемфіс-мотивами
    const cH = h - 6 - (top + 26);
    [0, w - 8].forEach((x, s) => { P(g, x, top + 26, 8, cH, BK); P(g, x + (s ? 0 : 7), top + 26, 1, cH, PK); memphis(g, x, top + 28, 8, cH - 4, s + level); });
    // поверхи
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const hF = fl.fy - fl.top, n = Math.max(2, Math.round(innerW / 40)), pier = 8, bw = (innerW - (n - 1) * pier) / n;
      P(g, 0, fl.fy, w, 6, BK); P(g, 0, fl.fy, w, 1, CY); P(g, 0, fl.fy + 2, w, 1, PK); for (let x = 3; x < w - 3; x += 8) P(g, x, fl.fy + 4, 3, 1, YL);
      P(g, innerX, fl.top - 3, innerW, hF + 3, BK); P(g, innerX, fl.top - 3, innerW, 1, PU);
      for (let i = 0; i < n; i++) {
        const bx = Math.round(innerX + i * (bw + pier)), bwi = Math.round(bw);
        g.clearRect(bx, fl.top, bwi, hF - 1);
        neonBox(g, bx - 1, fl.top - 1, bwi + 2, hF + 1, NEON[(i + fl.f) % 3]);
        A(g, 0.2, () => { for (let k = 0; k < 8; k++) P(g, bx + 4 + k, fl.top + 5 + (7 - k), 1, 2, WH); });
        if (i < n - 1) memphis(g, bx + bwi + 1, fl.top - 2, 6, hF, i + fl.f * 2 + level);
      }
    });
    // навіс-маркіза над першим поверхом: чорний із чергою лампочок
    P(g, 0, yG, w, 10, BK); P(g, 0, yG, w, 1, CY); P(g, 0, yG + 2, w, 1, PK);
    for (let x = 6, i = 0; x < w - 30; i++) { const wd = ['GAME', 'PLAY', 'COIN', 'START'][i % 4]; if (x + wd.length * 4 > door.x - 8 && x < door.x + door.w + 8) { x = door.x + door.w + 14; continue; } AR.txt(g, x, yG + 3, wd, NEON[i % 5]); x += wd.length * 4 + 12; }
    chase(g, 3, w - 5, yG + 7, 2);
    // портал: рожева неонова рамка
    neonBox(g, door.x - 4, yG + 10, door.w + 8, h - 6 - yG - 9, PK); P(g, door.x - 3, yG + 11, door.w + 6, 1, CY);
    // цоколь: плитка-килим
    carpet(g, 0, h - 6, w, 6); P(g, 0, h - 6, w, 1, CY);
    if (level <= 4) { lanternG(g, door.x - 10, yG + 15); lanternG(g, door.x + door.w + 11, yG + 15); }
  }
  function deco(g, C) {
    const { w, h, level, door } = C;
    if (level >= 2) { const x = 6, y = h - 6;                                         // ігровий автомат біля стіни
      P(g, x, y - 22, 12, 22, BK2); P(g, x + 1, y - 21, 10, 7, '#2a8a9a'); P(g, x + 2, y - 20, 8, 5, '#1c4a5a'); sprite(g, x + 2, y - 19, ['.#...#.', '..###..', '.#####.'], YL); P(g, x + 2, y - 11, 8, 2, PK); P(g, x + 3, y - 8, 2, 2, YL); P(g, x + 7, y - 8, 2, 2, CY); P(g, x, y - 22, 12, 1, PK); }
  }

  /* ---------- будинки ---------- */
  const WALLS = ['#2a1a4a', '#0e3a48', '#4a1a3a', '#1a2a5a', '#3a1a5a', '#18383a', '#5a1a4a'];
  const WORDS = ['GAME', 'PIZZA', 'VIDEO', 'COIN', 'PLAY', 'MUSIC', 'JUKE'];
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), wc = WALLS[(hs >>> 3) % WALLS.length], wp = ramp(wc);
    lamps = lamps || []; houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const winter = buildSeason === 'winter';
    P(g, x, top, w, h, wc); P(g, x, top, 1, h, '#000000'); P(g, x + w - 1, top, 1, h, '#000000'); A(g, 0.3, () => P(g, x + w - 7, top + 1, 6, h - 1, '#000000'));
    // сітка неонових ліній
    A(g, 0.5, () => { for (let y = top + 6; y < base - 4; y += 12) P(g, x + 1, y, w - 2, 1, NEON[(hs + y) % 5]); });
    // мурал-прибулець на глухому шматку
    if ((hs >>> 7) % 2 && w >= 36) { const mx = x + 4 + (hs >>> 9) % Math.max(1, w - 20), my = top + 8; sprite(g, mx, my, INV, NEON[(hs >>> 11) % 5]); }
    // дах: чорна плита з неоновою кромкою; зверху вивіска або супутникова тарілка
    P(g, x - 2, top - 4, w + 4, 4, BK); P(g, x - 2, top - 4, w + 4, 1, NEON[hs % 3]); A(g, 0.3, () => P(g, x - 1, top, w + 2, 3, '#000000'));
    if (winter) P(g, x - 2, top - 7, w + 4, 3, '#ffffff');
    const roofK = hs % 4;
    if (roofK === 0 && w >= 30) { const wd = WORDS[(hs >>> 5) % WORDS.length], sw = wd.length * 4 + 5, sx = x + 2 + (hs >>> 6) % Math.max(1, w - sw - 2); P(g, sx + 2, top - 10, 1, 6, '#444'); P(g, sx + sw - 3, top - 10, 1, 6, '#444'); P(g, sx, top - 17, sw, 8, BK); neonBox(g, sx, top - 17, sw, 8, NEON[(hs >>> 8) % 5]); AR.txt(g, sx + 3, top - 15, wd, NEON[(hs >>> 8) % 5]); }
    else if (roofK === 1) { const ax = x + 6 + (hs >>> 5) % Math.max(1, w - 18); for (let a = -5; a <= 5; a++) { const hh = Math.round(Math.sqrt(25 - a * a) * 0.9); P(g, ax + 6 + a, top - 5 - hh, 1, hh + 1, '#8a8aa0'); } P(g, ax + 6, top - 5, 1, 5, '#555'); P(g, ax + 6, top - 12, 1, 1, PK); }
    // поверхи: вікна з неоновим контуром
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 17)), sp = (w - 4) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 8) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && wx + 9 >= (doorOk ? doorX : -9999) - 2 && wx <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        neonBox(g, wx - 1, y0 - 1, 10, 13, NEON[(c + f + hs) % 5]); P(g, wx, y0, 8, 11, lit ? '#ffd45c' : '#173a5a');
        if (!lit) { P(g, wx + 1, y0 + 1, 2, 1, '#6a9ac8'); } P(g, wx + 4, y0, 1, 11, BK); P(g, wx, y0 + 5, 8, 1, BK);
        houseGlass.push([wx, y0, 8, 11]);
      }
    }
    if (doorOk) {
      houseDoors.push({ x: doorX + 5, y: base });
      P(g, doorX - 1, base - 14, doorW + 2, 14, BK); neonBox(g, doorX - 1, base - 15, doorW + 2, 15, PK); P(g, doorX + 1, base - 12, doorW - 2, 12, '#2a1a4a'); P(g, doorX + 7, base - 6, 1, 1, YL);
      P(g, doorX + 2, base - 11, 2, 1, CY);
    }
  }
  ARCH['arcade'] = { front, deco, house };
})();

// ---- епоха 4: Інтернет (скло, вікно-браузер, тарілки)
(function () {
  const { P, A, D, ramp, mix, rnd, txt } = AR;
  const WH = ramp('#eef2f6'), ST = ramp('#8a98aa'), NV = ramp('#1c3a78'), BL = ramp('#4a8fd8'), CY = '#38e0f0', OR = '#ff8a2a', DK = '#10203c';

  function dish(g, x, y, r) {                                                   // супутникова тарілка
    for (let a = -r; a <= r; a++) { const hh = Math.round(Math.sqrt(r * r - a * a) * 0.55); P(g, x + a, y - hh, 1, hh + 1, a < 0 ? WH[0] : ST[1]); P(g, x + a, y - hh, 1, 1, ST[3]); }
    P(g, x - r, y, r * 2 + 1, 1, ST[3]); P(g, x, y, 1, 4, ST[3]); P(g, x - 2, y + 4, 5, 1, ST[3]);
    P(g, x + r - 2, y - r - 1, 1, r, ST[3]); P(g, x + r - 3, y - r - 2, 3, 2, ST[2]);
  }
  function mast(g, x, y, hgt, t) { P(g, x, y - hgt, 1, hgt, ST[3]); for (let k = 4; k < hgt; k += 5) { P(g, x - 2, y - k, 5, 1, ST[2]); } P(g, x - 1, y - hgt - 1, 3, 2, '#ff3a3a'); A(g, 0.35, () => D(g, x, y - hgt - 1, 3, '#ff3a3a')); }
  function glassPanel(g, x, y, w, h, tint) {                                    // тоноване скло зі сталевими перемичками
    A(g, 0.24, () => P(g, x, y, w, h, tint || BL[2]));
    A(g, 0.65, () => { for (let k = 1; k * 9 < w; k++) P(g, x + k * 9, y, 1, h, ST[3]); for (let j = 8; j < h; j += 9) P(g, x, y + j, w, 1, ST[3]); });
  }

  function front(g, C) {
    const { w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, cx = w >> 1, fill = currentEpoch().signFill || look.signFill, ys = Math.max(0, top - 10);
    // дах: біла плита, скляний пентхаус, тарілки, антена
    P(g, 0, top - 1, w, 5, WH[2]); P(g, 0, top - 1, w, 1, '#ffffff'); P(g, 0, top + 3, w, 1, ST[2]); P(g, 0, top + 4, w, 2, ST[3]);
    const px = 14, pw = 28, ph = Math.min(9, top);
    P(g, px, top - 1 - ph, pw, ph, DK); P(g, px + 1, top - ph, pw - 2, ph - 1, BL[2]); P(g, px + 1, top - ph, pw - 2, 2, BL[0]); for (let k = 7; k < pw - 1; k += 7) P(g, px + k, top - ph, 1, ph - 1, DK); P(g, px - 1, top - 2 - ph, pw + 2, 1, WH[0]);
    if (level >= 2) { const gx = 54, gy = Math.max(7, top - 8); P(g, gx, gy + 5, 1, top - gy - 4, ST[3]); D(g, gx, gy, 5, NV[3]); D(g, gx, gy, 4, BL[2]); D(g, gx - 1, gy - 1, 2, BL[0]); P(g, gx - 4, gy, 9, 1, NV[2]); P(g, gx, gy - 4, 1, 9, NV[2]); P(g, gx - 3, gy - 2, 7, 1, NV[2]); P(g, gx - 3, gy + 2, 7, 1, NV[2]); }
    dish(g, w - 18, top - 3, 6); if (level >= 3) dish(g, w - 40, top - 2, 4);
    if (level >= 2) { mast(g, 8, top, Math.min(14, top + 6), 0); mast(g, w - 8, top, Math.min(12, top + 4), 0); }
    roofSignG(g, cx, ys, false);
    // вивіска: темно-синя з LED-контуром
    // вивіска як вікно браузера: рядок заголовка з кружечками, адресна стрічка, смуга прокрутки
    P(g, 0, top + 6, w, 20, ST[3]); P(g, 1, top + 7, w - 2, 18, WH[1]); P(g, 1, top + 7, w - 2, 3, WH[2]); P(g, 1, top + 7, w - 2, 1, '#ffffff');
    [['#ff5f57', 7], ['#ffbd2e', 11], ['#28c840', 15]].forEach(([c, x]) => { P(g, x, top + 8, 2, 2, c); });
    P(g, 21, top + 8, w - 52, 2, '#ffffff'); P(g, 21, top + 8, w - 52, 1, ST[1]); P(g, w - 28, top + 8, 20, 2, ST[1]);
    P(g, 5, top + 10, w - 10, 14, DK); P(g, 6, top + 10, w - 12, 14, NV[2]); P(g, 7, top + 10, w - 14, 13, fill);
    P(g, w - 9, top + 10, 3, 13, WH[2]); P(g, w - 8, top + 12, 1, 5, ST[2]); P(g, w - 9, top + 24, w > 0 ? 3 : 0, 1, ST[3]);
    for (let x = 8; x < w - 12; x += 3) P(g, x, top + 24, 1, 1, CY);
    txt(g, 9, top + 14, 'WWW', CY); txt(g, w - 26, top + 14, 'NET', CY);
    // кутові опори: білі з сталевими смугами
    const cH = h - 6 - (top + 26);
    [0, w - 8].forEach((x, s) => { P(g, x, top + 26, 8, cH, WH[2]); P(g, x + (s ? 7 : 0), top + 26, 1, cH, ST[2]); P(g, x + (s ? 0 : 7), top + 26, 1, cH, WH[0]); for (let y = top + 30; y < h - 10; y += 10) { P(g, x + 1, y, 6, 1, ST[1]); P(g, x + 2, y + 1, 4, 2, BL[2]); } });
    // поверхи: скляна завіса
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const hF = fl.fy - fl.top;
      P(g, 0, fl.fy, w, 1, '#ffffff'); P(g, 0, fl.fy + 1, w, 3, WH[2]); P(g, 0, fl.fy + 4, w, 1, ST[2]); P(g, 0, fl.fy + 5, w, 1, ST[4]);
      for (let x = 8; x < w - 8; x += 6) P(g, x, fl.fy + 2, 3, 1, CY);                                                     // LED-стрічка
      P(g, innerX, fl.top - 3, innerW, 3, WH[2]); P(g, innerX, fl.top - 3, innerW, 1, '#ffffff'); P(g, innerX, fl.top - 1, innerW, 1, ST[2]);
      glassPanel(g, innerX, fl.top, innerW, hF, BL[2]); A(g, 0.12, () => P(g, innerX, fl.top, innerW, hF >> 1, '#a8d8ff'));
      const n = Math.max(2, Math.round(innerW / 76));
      for (let i = 1; i < n; i++) { const mx = Math.round(innerX + i * innerW / n); P(g, mx - 1, fl.top - 3, 3, hF + 3, WH[2]); P(g, mx - 1, fl.top - 3, 1, hF + 3, '#ffffff'); P(g, mx + 1, fl.top - 3, 1, hF + 3, ST[2]); }
      A(g, 0.22, () => { for (let x = innerX + 6; x < innerX + innerW - 8; x += 22) for (let k = 0; k < 9; k++) P(g, x + k, fl.top + 4 + (8 - k), 1, 2, '#ffffff'); });
    });
    // скляний вестибюль: консоль, стійки
    P(g, 0, yG, w, 1, '#ffffff'); P(g, 0, yG + 1, w, 6, WH[2]); P(g, 0, yG + 7, w, 1, ST[2]); P(g, 0, yG + 8, w, 1, NV[3]);
    for (let x = 4; x < w - 4; x += 4) P(g, x, yG + 9, 2, 1, (x >> 2) % 2 ? CY : BL[1]);
    A(g, 0.5, () => P(g, innerX, yG + 11, innerW, 1, CY));
    glassPanel(g, innerX, yG + 10, innerW, h - 6 - yG - 10, BL[2]);
    const dl = door.x - 5, dr = door.x + door.w + 3;
    P(g, dl, yG + 9, 2, h - 6 - yG - 9, WH[2]); P(g, dr, yG + 9, 2, h - 6 - yG - 9, WH[2]); P(g, dl - 1, yG + 9, door.w + 12, 3, WH[2]); P(g, dl - 1, yG + 9, door.w + 12, 1, '#ffffff');
    // цоколь: темний граніт
    P(g, 0, h - 6, w, 6, '#3a4252'); P(g, 0, h - 6, w, 1, ST[1]); for (let x = 12; x < w; x += 16) P(g, x, h - 5, 1, 4, '#262c3a'); P(g, 0, h - 1, w, 1, '#1a1e28');
    P(g, door.x - 6, h - 3, door.w + 12, 3, ST[1]); P(g, door.x - 6, h - 3, door.w + 12, 1, WH[0]);
  }
  function deco(g, C) {
    const { w, h, level, door } = C;
    if (level >= 2) [[10, 0], [w - 14, 1]].forEach(([x, k]) => { const y = h - 6; P(g, x, y - 5, 6, 5, '#d9dfe6'); P(g, x, y - 5, 6, 1, '#ffffff'); P(g, x + 1, y - 9, 1, 4, '#3a7a3a'); P(g, x + 3, y - 11, 1, 6, '#4a9a4a'); P(g, x + 4, y - 8, 1, 3, '#3a7a3a'); });
  }

  /* ---------- будинки: офісні й житлові блоки зі скла та бетону ---------- */
  const WALLS = ['#c8d2de', '#aebccc', '#d8d8d2', '#b8c8c0', '#c4c0d0', '#d8ccc0', '#9fb0c2'];
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), wp = ramp(WALLS[(hs >>> 3) % WALLS.length]);
    lamps = lamps || []; houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const winter = buildSeason === 'winter';
    P(g, x, top, w, h, wp[2]); P(g, x, top, 1, h, wp[4]); P(g, x + w - 1, top, 1, h, wp[4]); A(g, 0.25, () => P(g, x + w - 7, top + 1, 6, h - 1, wp[4])); A(g, 0.5, () => P(g, x + 1, top + 1, 2, h - 1, wp[0]));
    // дах: парапет, тарілки, кондиціонери
    P(g, x - 1, top - 3, w + 2, 3, WH[1]); P(g, x - 1, top - 3, w + 2, 1, '#ffffff'); P(g, x - 1, top - 1, w + 2, 1, ST[3]); A(g, 0.25, () => P(g, x, top, w, 3, '#000000'));
    if (winter) P(g, x - 1, top - 6, w + 2, 3, '#ffffff');
    const rk = hs % 4;
    if (rk === 0) dish(g, x + 8 + (hs >>> 5) % Math.max(1, w - 22), top - 5, 5);
    else if (rk === 1) { const ax = x + 6 + (hs >>> 5) % Math.max(1, w - 24); P(g, ax, top - 7, 10, 4, ST[2]); P(g, ax, top - 7, 10, 1, WH[0]); P(g, ax + 2, top - 6, 6, 2, ST[3]); P(g, ax + 14, top - 6, 8, 3, ST[2]); }
    else if (rk === 2) mast(g, x + 8 + (hs >>> 5) % Math.max(1, w - 18), top - 3, 12, 0);
    // поверхи: стрічкові скляні вікна з білою перемичкою
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 14)), sp = (w - 4) / cols;
      P(g, x + 1, y0 - 4, w - 2, 1, WH[0]); P(g, x + 1, y0 - 3, w - 2, 1, ST[2]);
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 10) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && wx + 11 >= (doorOk ? doorX : -9999) - 2 && wx <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        P(g, wx - 1, y0 - 1, 12, 13, ST[3]); P(g, wx, y0, 10, 11, lit ? '#ffe9a0' : '#7ab4e0');
        if (!lit) { P(g, wx, y0, 10, 4, '#a8d4f2'); P(g, wx + 1, y0 + 1, 3, 1, '#ffffff'); P(g, wx + 2, y0 + 2, 1, 1, '#ffffff'); P(g, wx, y0 + 7, 10, 4, '#5a98cc'); }
        P(g, wx + 4, y0, 1, 11, ST[3]);
        houseGlass.push([wx, y0, 10, 11]);
        if (hash2(wx + 1, y0 + 2) % 5 === 0) { P(g, wx - 1, y0 + 11, 12, 1, ST[1]); dish(g, wx + 5, y0 + 10, 3); }
      }
    }
    if (doorOk) {
      houseDoors.push({ x: doorX + 5, y: base });
      P(g, doorX - 2, base - 17, doorW + 4, 3, NV[2]); txt(g, doorX - 1, base - 16, ['NET', 'WEB', 'PC', 'MAIL'][(hs >>> 11) % 4], '#ffffff');
      P(g, doorX - 1, base - 14, doorW + 2, 14, ST[3]); P(g, doorX, base - 14, doorW, 14, '#7ab4e0'); P(g, doorX, base - 14, doorW, 4, '#a8d4f2'); P(g, doorX + 4, base - 14, 2, 14, ST[3]);
    }
  }
  ARCH['internet'] = { front, deco, house };
})();

// ---- епоха 5: Еко (дерево, дах-сад, сонячні панелі)
(function () {
  const { P, A, D, ramp, mix, rnd, txt } = AR;
  const GN = ramp('#5fa04a'), GD = ramp('#2f6a34'), WD = ramp('#c08a4e'), WK = ramp('#8a5a2c'), CR = ramp('#f1e9d2'), SOL = '#1c3a6a';

  function grass(g, x0, x1, y, depth, seed) {                                   // дерен із пучками трави й квітами
    P(g, x0, y, x1 - x0, depth, GN[2]); P(g, x0, y, x1 - x0, 1, GN[1]); P(g, x0, y + depth - 1, x1 - x0, 1, GD[2]);
    for (let x = x0; x < x1; x++) { const r = rnd(x, seed); if (r % 3 === 0) P(g, x, y - 1 - (r >> 4) % 2, 1, 1 + (r >> 4) % 2, GN[(r >> 8) % 2 ? 1 : 2]); if (r % 17 === 0) P(g, x, y - 2, 1, 1, ['#ffd84f', '#ff8fb0', '#ffffff'][(r >> 6) % 3]); }
  }
  function solar(g, x, y, w) {                                                  // сонячна панель на опорі
    for (let i = 0; i < 4; i++) P(g, x + (3 - i), y + i, w, 1, i === 0 ? '#6a8ac8' : SOL);
    for (let k = 0; k < w; k += 5) for (let i = 0; i < 4; i++) P(g, x + (3 - i) + k, y + i, 1, 1, '#4a6aa8');
    P(g, x + 3, y, w, 1, '#8ab0e8'); P(g, x + 4, y + 4, 1, 2, '#555a60'); P(g, x + w - 1, y + 4, 1, 2, '#555a60');
  }
  function turbine(g, x, y) {                                                   // вітряк
    P(g, x, y, 1, 14, '#e8ecee'); P(g, x - 1, y - 1, 3, 3, '#c8ced4');
    [[-6, -3], [6, -3], [0, 7]].forEach(([dx, dy], i) => { const n = 7; for (let k = 1; k <= n; k++) P(g, x + Math.round(dx * k / n), y + Math.round(dy * k / n) - (i === 2 ? 0 : 0), 1, 1, '#ffffff'); });
    P(g, x, y, 1, 1, '#4a8ad8');
  }
  function leafWall(g, x, y, w, h, seed) {                                      // вертикальний сад
    P(g, x, y, w, h, GD[2]);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const r = rnd(x + i * 3, y + j + seed); if (r % 3 === 0) P(g, x + i, y + j, 1, 1, GN[2]); else if (r % 7 === 0) P(g, x + i, y + j, 1, 1, GN[0]); else if (r % 29 === 0) P(g, x + i, y + j, 1, 1, '#ff8fb0'); }
  }
  function planter(g, x, y, w, seed) {                                          // ящик з рослинами
    P(g, x, y, w, 3, WK[2]); P(g, x, y, w, 1, WD[1]); P(g, x, y + 2, w, 1, WK[4]);
    for (let i = 0; i < w; i += 2) { const r = rnd(x + i, seed); P(g, x + i, y - 2 - (r % 2), 2, 2 + (r % 2), GN[(r >> 3) % 2 ? 1 : 2]); if (r % 4 === 0) P(g, x + i, y - 3 - (r % 2), 1, 1, ['#ffd84f', '#ff7aa0', '#ffffff'][(r >> 5) % 3]); }
    for (let i = 1; i < w - 1; i += 3) { const r = rnd(i + x, seed + 5); P(g, x + i, y + 3, 1, 2 + r % 3, GN[2]); }
  }

  function front(g, C) {
    const { w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, cx = w >> 1, fill = currentEpoch().signFill || look.signFill, ys = Math.max(0, top - 10);
    // дах-сад
    P(g, 0, top + 1, w, 6, WK[2]); P(g, 0, top + 1, w, 1, WD[1]); P(g, 0, top + 3, w, 1, WK[3]); P(g, 0, top + 6, w, 1, WK[4]);
    grass(g, 0, w, top - 3, 4, level);
    if (level >= 2) { solar(g, 10, Math.max(0, top - 10), 24); solar(g, w - 40, Math.max(0, top - 10), 24); }
    if (level >= 3) turbine(g, w - 12, Math.max(6, top - 18));
    if (level >= 4) turbine(g, 12, Math.max(6, top - 18));
    roofSignG(g, cx, ys, false);
    for (let x = 6; x < w - 6; x += 7) { const r = rnd(x, 3), d = 2 + r % 6; if (r % 3) { P(g, x, top + 4, 1, d, GN[2]); P(g, x, top + 4 + d, 1, 1, GN[0]); } }   // ліани зі стріхи
    // вивіска: дошки з листям
    P(g, 0, top + 7, w, 19, WK[3]); P(g, 1, top + 8, w - 2, 17, WD[2]); for (let y = top + 11; y < top + 24; y += 4) P(g, 1, y, w - 2, 1, WK[3]); P(g, 7, top + 10, w - 14, 13, fill); P(g, 7, top + 10, w - 14, 1, mix(fill, '#000000', 0.4));
    [[8, 0], [w - 17, 1]].forEach(([x, f]) => { for (let k = 0; k < 4; k++) { P(g, x + k * 2, top + 13 + (k % 2), 2, 3, GN[k % 2 ? 1 : 2]); } P(g, x + 3, top + 17, 1, 3, GD[2]); });
    // кутові колони: вертикальні сади
    const cH = h - 6 - (top + 26);
    [0, w - 8].forEach((x, s) => { leafWall(g, x, top + 26, 8, cH, s * 7); P(g, x + (s ? 0 : 7), top + 26, 1, cH, WK[3]); P(g, x + (s ? 7 : 0), top + 26, 1, cH, WK[3]); });
    // поверхи: дерев'яні опори з вигнутими балками й рослинами
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const hF = fl.fy - fl.top, n = Math.max(2, Math.round(innerW / 44)), pier = 6, bw = (innerW - (n - 1) * pier) / n;
      P(g, 0, fl.fy, w, 1, WD[0]); P(g, 0, fl.fy + 1, w, 3, WD[2]); P(g, 0, fl.fy + 4, w, 1, WK[3]); P(g, 0, fl.fy + 5, w, 1, WK[4]); for (let x = 5; x < w - 5; x += 9) P(g, x, fl.fy + 2, 4, 1, WK[2]);
      P(g, innerX, fl.top - 3, innerW, 3, WD[2]); P(g, innerX, fl.top - 3, innerW, 1, WD[0]); P(g, innerX, fl.top - 1, innerW, 1, WK[3]);
      for (let i = 0; i < n; i++) {
        const bx = Math.round(innerX + i * (bw + pier)), bwi = Math.round(bw), r = bwi / 2;
        for (let k = 0; k < bwi; k++) { const dx = (k + 0.5 - r) / r, d = Math.round(6 * (1 - Math.sqrt(Math.max(0, 1 - dx * dx)))); if (d > 0) { P(g, bx + k, fl.top, 1, d, WD[2]); } P(g, bx + k, fl.top + d, 1, 1, WD[1]); A(g, 0.3, () => P(g, bx + k, fl.top + d + 1, 1, 1, '#000000')); }
        A(g, 0.14, () => P(g, bx, fl.top, bwi, hF - 1, '#9ad8a0'));
        A(g, 0.2, () => { for (let k = 0; k < 8; k++) P(g, bx + 3 + k, fl.top + 9 + (7 - k), 1, 2, '#ffffff'); });
        planter(g, bx + 2, fl.fy - 5, bwi - 4, i + fl.f * 3);
        if (i < n - 1) { const px = bx + bwi; P(g, px, fl.top - 3, pier, hF + 3, WD[2]); P(g, px, fl.top - 3, 1, hF + 3, WD[0]); P(g, px + pier - 1, fl.top - 3, 1, hF + 3, WK[3]); for (let y = fl.top; y < fl.fy; y += 5) P(g, px + 2, y, 2, 1, WK[3]); }
      }
    });
    // навіс: дерев'яні рейки з листковим кантом
    P(g, 0, yG, w, 1, WD[0]); P(g, 0, yG + 1, w, 8, WD[2]); for (let x = 0; x < w; x += 4) P(g, x, yG + 1, 1, 8, WK[3]);
    P(g, 0, yG + 9, w, 1, WK[4]);
    for (let x = 0; x < w; x += 5) { const r = rnd(x, 9); P(g, x, yG + 10, 3, 1 + r % 2, GN[(r >> 3) % 2 ? 1 : 2]); P(g, x + 1, yG + 11, 1, 1, GD[2]); }
    P(g, door.x - 4, yG + 10, door.w + 8, 3, WK[2]); P(g, door.x - 4, yG + 10, 3, h - 6 - yG - 10, WK[2]); P(g, door.x + door.w + 1, yG + 10, 3, h - 6 - yG - 10, WK[2]);
    // цоколь: габіон із каменів
    P(g, 0, h - 6, w, 6, '#4a4a46');
    for (let x = 0; x < w; x += 4) for (let j = 0; j < 2; j++) { const r = rnd(x, j + 5); P(g, x + (j ? 2 : 0), h - 6 + j * 3, 3 + r % 2, 3, ['#9a9a90', '#b0aaa0', '#827e76', '#a8a090'][r % 4]); }
    P(g, 0, h - 6, w, 1, '#4a4a46'); P(g, 0, h - 1, w, 1, '#2a2a28');
  }
  function deco(g, C) {
    const { w, h, level, door } = C;
    if (level >= 2) { const x = door.x - 22, y = h - 6; D(g, x + 4, y - 6, 5, '#2a5a8a'); P(g, x - 1, y - 11, 10, 11, '#4a7ab0'); P(g, x - 1, y - 11, 10, 1, '#6a9ad0'); P(g, x - 1, y - 8, 10, 1, '#2a4a78'); P(g, x - 1, y - 3, 10, 1, '#2a4a78'); P(g, x, y - 12, 8, 2, '#3a5a8a'); }
  }

  /* ---------- будинки ---------- */
  const WALLS = ['#e8dcc0', '#c8a070', '#e0c8a0', '#9ab090', '#d8b890', '#bcc8a8', '#c8b098'];
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), wp = ramp(WALLS[(hs >>> 3) % WALLS.length]);
    lamps = lamps || []; houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const winter = buildSeason === 'winter';
    P(g, x, top, w, h, wp[2]); P(g, x, top, 1, h, wp[4]); P(g, x + w - 1, top, 1, h, wp[4]); A(g, 0.22, () => P(g, x + w - 7, top + 1, 6, h - 1, wp[4])); A(g, 0.5, () => P(g, x + 1, top + 1, 2, h - 1, wp[0]));
    // дерев'яна обшивка на частині стіни
    if ((hs >>> 6) % 2) { A(g, 0.9, () => { P(g, x + 1, top + (h >> 1), w - 2, (h >> 1) - 1, WD[2]); for (let y = top + (h >> 1); y < base - 2; y += 3) P(g, x + 1, y, w - 2, 1, WK[3]); }); }
    // зелений дах (двосхилий із дерном) і сонячні панелі
    const rh = 9 + hs % 3;
    for (let i = 0; i < rh; i++) { const inset = rh - 1 - i, lx = x - 3 + inset * 2, rw = w + 6 - 4 * inset; if (rw <= 2) continue; P(g, lx, top - rh + i, rw, 1, i < 2 ? GN[1] : (i % 2 ? GN[2] : GN[3])); if (i % 3 === 1) for (let k = lx + 2; k < lx + rw - 2; k += 5) P(g, k, top - rh + i, 1, 1, ['#ffd84f', '#ff8fb0', '#ffffff'][(k + hs) % 3]); }
    P(g, x - 3, top - 1, w + 6, 1, GD[3]); P(g, x - 3, top, w + 6, 2, WK[2]);
    if (winter) P(g, x - 3 + 4, top - rh - 1, w - 2, 3, '#ffffff');
    if (hs % 3 === 0) solar(g, x + 6 + (hs >>> 5) % Math.max(1, w - 34), top - rh - 5, 24);
    else if (hs % 3 === 1 && w >= 36) turbine(g, x + 8 + (hs >>> 5) % Math.max(1, w - 18), top - rh - 12);
    // вікна з ящиками рослин
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 17)), sp = (w - 4) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 9) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && wx + 10 >= (doorOk ? doorX : -9999) - 2 && wx <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        P(g, wx - 1, y0 - 1, 11, 12, WK[3]); P(g, wx, y0, 9, 10, lit ? '#ffe9a0' : '#a8dccc'); if (!lit) { P(g, wx, y0, 9, 3, '#d0f2e4'); P(g, wx + 1, y0 + 1, 2, 1, '#ffffff'); }
        P(g, wx + 4, y0, 1, 10, WK[3]); P(g, wx - 1, y0 + 11, 11, 1, WD[1]);
        planter(g, wx - 1, y0 + 9, 11, wx + f); houseGlass.push([wx, y0, 9, 10]);
      }
    }
    if (hs % 4 === 2) { leafWall(g, x + w - 4, top + 6, 3, h - 14, hs); }
    if (doorOk) {
      houseDoors.push({ x: doorX + 5, y: base });
      P(g, doorX - 2, base - 16, doorW + 4, 3, GD[2]); for (let k = 0; k < doorW + 4; k += 2) P(g, doorX - 2 + k, base - 13, 1, 1 + (k % 4 ? 1 : 0), GN[2]);
      P(g, doorX - 1, base - 14, doorW + 2, 14, WK[4]); P(g, doorX, base - 14, doorW, 14, WD[2]); P(g, doorX, base - 14, 1, 14, WD[0]); for (let y = base - 11; y < base; y += 3) P(g, doorX, y, doorW, 1, WK[3]); D(g, doorX + 5, base - 9, 2, GN[1]); P(g, doorX + 7, base - 6, 1, 1, '#ffd84f');
    }
  }
  ARCH['eco'] = { front, deco, house };
})();

// ---- епоха 6: Космос (гермомодулі, купол, ракета)
(function () {
  const { P, A, D, ramp, mix, rnd, txt } = AR;
  const WH = ramp('#eef4fb'), SV = ramp('#9fb0c6'), DK = ramp('#2a3450'), BL = '#38b8ff', CY = '#6af4ff', OR = '#ff8a3a', PU = '#8a6aff';

  function cham(g, x, y, w, h, c, k) {                                          // прямокутник зі скошеними кутами (k пікселів)
    for (let j = 0; j < h; j++) { const ins = j < k ? k - j : (j >= h - k ? j - (h - 1 - k) : 0); P(g, x + ins, y + j, w - ins * 2, 1, c); }
  }
  function chamClear(g, x, y, w, h, k) { for (let j = 0; j < h; j++) { const ins = j < k ? k - j : (j >= h - k ? j - (h - 1 - k) : 0); g.clearRect(x + ins, y + j, w - ins * 2, 1); } }
  function dome(g, cx, by, r, hgt) {                                            // скляний купол із гексагональною сіткою
    for (let x = -r; x <= r; x++) {
      const k = Math.sqrt(Math.max(0, 1 - (x / r) * (x / r))), yt = Math.round(by - hgt * k);
      for (let y = yt; y <= by; y++) { const shade = (cx + x < cx - r / 3) ? 0.3 : 0.18; A(g, shade, () => P(g, cx + x, y, 1, 1, '#9ad8ff')); }
      P(g, cx + x, yt, 1, 1, '#ffffff');
      for (let y = yt + 1; y <= by; y++) if (((x + r * 4) % 8 === 0) || ((y - yt) % 7 === 0)) A(g, 0.5, () => P(g, cx + x, y, 1, 1, SV[1]));
    }
    P(g, cx - r - 1, by, r * 2 + 3, 2, SV[2]); P(g, cx - r - 1, by, r * 2 + 3, 1, WH[0]);
  }
  function rocket(g, x, y, hgt) {                                               // ракета на стартовому майданчику
    for (let j = 0; j < hgt; j++) { const t = j / hgt, hw = j < 8 ? Math.round(1 + j * 0.45) : 4; P(g, x - hw, y - hgt + j, hw * 2 + 1, 1, WH[2]); P(g, x - hw, y - hgt + j, 1, 1, WH[0]); P(g, x + hw, y - hgt + j, 1, 1, SV[2]); }
    P(g, x, y - hgt - 2, 1, 3, '#ff3a3a'); P(g, x - 1, y - hgt, 3, 1, '#ff3a3a');
    D(g, x, y - hgt + 9, 2, DK[2]); D(g, x, y - hgt + 9, 1, CY);
    P(g, x - 7, y - 8, 4, 8, '#e8503a'); P(g, x + 4, y - 8, 4, 8, '#e8503a'); P(g, x - 6, y - 8, 1, 8, '#ff8a70');
    P(g, x - 4, y, 9, 2, DK[3]); A(g, 0.5, () => { P(g, x - 2, y + 2, 5, 2, OR); });
  }
  function radar(g, x, y, r) { for (let a = -r; a <= r; a++) { const hh = Math.round(Math.sqrt(r * r - a * a) * 0.5); P(g, x + a, y - hh, 1, 1, a < 0 ? WH[0] : SV[2]); P(g, x + a, y, 1, 1, SV[3]); } P(g, x, y, 1, 4, SV[3]); P(g, x - 3, y + 4, 7, 1, SV[3]); P(g, x + 2, y - r + 1, 1, r - 1, SV[3]); P(g, x + 2, y - r, 1, 1, OR); }

  function front(g, C) {
    const { w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, cx = w >> 1, fill = currentEpoch().signFill || look.signFill, ys = Math.max(0, top - 10);
    // дах: білий корпус, купол, радар, ракета
    cham(g, 0, top - 2, w, 3, WH[2], 2); P(g, 0, top, w, 5, WH[2]); P(g, 3, top - 2, w - 6, 1, WH[0]); P(g, 0, top + 3, w, 1, SV[2]);
    for (let x = 8; x < w - 8; x += 12) P(g, x, top, 6, 1, BL);
    if (top >= 8) { const dr = Math.min(18, (cx - 40) >> 0); if (dr >= 8) { dome(g, 8 + dr + 4, top - 2, dr, Math.min(top - 2, 12)); } }
    if (level >= 2) radar(g, w - 18, top - 3, 7);
    if (level >= 3) rocket(g, w - 42, top - 2, Math.min(24, top + 6));
    if (level >= 4) radar(g, 20, top - 3, 5);
    roofSignG(g, cx, ys, false);
    // вивіска: корпус зі скошеними кутами та світним краєм
    P(g, 0, top + 5, w, 21, DK[3]); P(g, 1, top + 6, w - 2, 19, SV[1]); P(g, 2, top + 7, w - 4, 17, DK[2]);
    P(g, 7, top + 10, w - 14, 13, fill); P(g, 7, top + 10, w - 14, 1, mix(fill, '#000000', 0.4));
    for (let x = 10; x < w - 10; x += 8) { P(g, x, top + 8, 4, 1, BL); P(g, x + 4, top + 24, 4, 1, CY); }
    P(g, 8, top + 15, 3, 3, OR); P(g, w - 11, top + 15, 3, 3, OR);
    // кутові колони: білі з панелями й індикаторами
    const cH = h - 6 - (top + 26);
    [0, w - 8].forEach((x, s) => { P(g, x, top + 26, 8, cH, WH[2]); P(g, x + (s ? 7 : 0), top + 26, 1, cH, SV[2]); P(g, x + (s ? 0 : 7), top + 26, 1, cH, WH[0]); for (let y = top + 30; y < h - 10; y += 8) { P(g, x + 1, y, 6, 4, SV[1]); P(g, x + 2, y + 1, 4, 2, DK[2]); P(g, x + 3, y + 1, 1, 1, [CY, OR, PU][(y >> 3) % 3]); } });
    // поверхи: ілюмінатори зі скошеними кутами, світні кайми
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const hF = fl.fy - fl.top, n = Math.max(2, Math.round(innerW / 40)), pier = 8, bw = (innerW - (n - 1) * pier) / n;
      P(g, 0, fl.fy, w, 1, WH[0]); P(g, 0, fl.fy + 1, w, 3, WH[2]); P(g, 0, fl.fy + 4, w, 1, SV[2]); P(g, 0, fl.fy + 5, w, 1, DK[3]); for (let x = 6; x < w - 6; x += 10) P(g, x, fl.fy + 2, 6, 1, BL);
      P(g, innerX, fl.top - 3, innerW, hF + 3, WH[2]); P(g, innerX, fl.top - 3, innerW, 1, WH[0]);
      for (let i = 0; i < n; i++) {
        const bx = Math.round(innerX + i * (bw + pier)), bwi = Math.round(bw);
        cham(g, bx - 2, fl.top - 2, bwi + 4, hF + 2, DK[2], 4); cham(g, bx - 1, fl.top - 1, bwi + 2, hF, CY, 4); chamClear(g, bx, fl.top, bwi, hF - 2, 4);
        A(g, 0.14, () => P(g, bx, fl.top, bwi, hF - 2, '#9ad8ff'));
        A(g, 0.3, () => { for (let k = 0; k < 8; k++) P(g, bx + 5 + k, fl.top + 6 + (7 - k), 1, 2, '#ffffff'); });
        if (i < n - 1) { const px = bx + bwi + 3; P(g, px + 1, fl.top + 2, 2, 5, SV[1]); P(g, px + 1, fl.top + 9, 2, 1, BL); P(g, px + 1, fl.top + 12, 2, 1, BL); P(g, px, fl.top + 16, 4, 4, DK[2]); P(g, px + 1, fl.top + 17, 2, 2, [CY, OR, PU][(i + fl.f) % 3]); }
      }
    });
    // навіс-шлюз
    P(g, 0, yG, w, 1, WH[0]); cham(g, 0, yG + 1, w, 9, WH[2], 2); P(g, 0, yG + 9, w, 1, SV[2]); for (let x = 5; x < w - 5; x += 10) { P(g, x, yG + 4, 6, 1, BL); P(g, x, yG + 6, 6, 1, DK[2]); }
    P(g, 0, yG + 10, w, 1, DK[3]);
    // портал-шлюз: кільце навколо дверей
    D(g, door.x + (door.w >> 1), yG + 7, 6, DK[3]); D(g, door.x + (door.w >> 1), yG + 7, 5, SV[1]); D(g, door.x + (door.w >> 1), yG + 7, 3, BL); D(g, door.x + (door.w >> 1), yG + 7, 2, '#ffffff');
    P(g, door.x - 4, yG + 10, door.w + 8, 3, DK[2]); P(g, door.x - 4, yG + 10, 3, h - 6 - yG - 10, SV[2]); P(g, door.x + door.w + 1, yG + 10, 3, h - 6 - yG - 10, SV[2]);
    // цоколь: темний метал із помаранчевою смугою
    P(g, 0, h - 6, w, 6, DK[2]); for (let x = 0; x < w; x += 12) P(g, x, h - 4, 6, 2, OR); P(g, 0, h - 6, w, 1, SV[1]); P(g, 0, h - 1, w, 1, DK[4]);
    P(g, door.x - 6, h - 3, door.w + 12, 3, SV[2]); P(g, door.x - 6, h - 3, door.w + 12, 1, WH[0]);
  }
  function deco(g, C) {
    const { w, h, level, door } = C;
    if (level >= 2) { const x = door.x + door.w + 20, y = h - 6; P(g, x, y - 4, 10, 4, SV[2]); P(g, x, y - 4, 10, 1, WH[0]); P(g, x + 2, y - 9, 6, 5, WH[2]); D(g, x + 5, y - 11, 3, WH[1]); P(g, x + 4, y - 12, 2, 2, CY); }
  }

  /* ---------- будинки: гермомодулі ---------- */
  const TRIM = [BL, OR, PU, '#3adca0', '#ff5aa0', '#ffd84a'];
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), tr = TRIM[(hs >>> 3) % TRIM.length];
    lamps = lamps || []; houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const winter = buildSeason === 'winter';
    cham(g, x, top, w, h + 0, WH[2], 4); P(g, x + 1, top + 4, 1, h - 5, SV[1]); P(g, x + w - 2, top + 4, 1, h - 5, SV[3]); A(g, 0.22, () => P(g, x + w - 7, top + 4, 6, h - 5, SV[3]));
    P(g, x + 4, top, w - 8, 1, WH[0]);
    // кольорова смуга, панелі
    P(g, x, top + 8, w, 3, tr); P(g, x, top + 8, w, 1, mix(tr, '#ffffff', 0.4)); A(g, 0.35, () => P(g, x, top + 11, w, 1, '#000000'));
    for (let y = top + 16; y < base - 4; y += 12) A(g, 0.4, () => P(g, x + 1, y, w - 2, 1, SV[3]));
    // дах: купол, антена чи радар
    const k = hs % 4;
    if (k === 0 && w >= 30) dome(g, x + (w >> 1), top, Math.min(14, (w >> 1) - 3), 9);
    else if (k === 1) radar(g, x + 8 + (hs >>> 5) % Math.max(1, w - 18), top - 4, 5);
    else if (k === 2) { const ax = x + 6 + (hs >>> 5) % Math.max(1, w - 12); P(g, ax, top - 16, 1, 16, SV[2]); P(g, ax - 2, top - 12, 5, 1, SV[2]); P(g, ax - 3, top - 8, 7, 1, SV[2]); P(g, ax - 1, top - 17, 3, 1, '#ff3a3a'); }
    else { P(g, x + (w >> 1) - 5, top - 6, 10, 6, WH[2]); P(g, x + (w >> 1) - 5, top - 6, 10, 1, WH[0]); P(g, x + (w >> 1) - 3, top - 4, 6, 2, DK[2]); }
    if (winter) P(g, x + 3, top - 1, w - 6, 2, '#ffffff');
    // ілюмінатори
    const floors = Math.max(1, Math.floor((h - 12) / 19)), doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 16)), sp = (w - 4) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 10) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && wx + 11 >= (doorOk ? doorX : -9999) - 2 && wx <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        cham(g, wx - 1, y0 - 1, 12, 13, DK[2], 3); cham(g, wx, y0, 10, 11, lit ? '#ffe9a0' : mix('#6ab4f0', tr, 0.2), 3);
        if (!lit) { P(g, wx + 2, y0 + 2, 3, 1, '#ffffff'); P(g, wx + 2, y0 + 3, 1, 1, '#ffffff'); }
        houseGlass.push([wx + 1, y0 + 1, 8, 9]);
      }
    }
    if (doorOk) {
      houseDoors.push({ x: doorX + 5, y: base });
      cham(g, doorX - 1, base - 15, doorW + 2, 15, DK[2], 2); cham(g, doorX, base - 14, doorW, 14, SV[1], 2); P(g, doorX + 4, base - 14, 2, 14, DK[2]); P(g, doorX + 1, base - 12, 3, 1, BL); P(g, doorX + 6, base - 12, 3, 1, BL);
      P(g, doorX - 2, base - 18, doorW + 4, 2, tr);
    }
  }
  ARCH['space'] = { front, deco, house };
})();

// ---- епоха 7: Неон (кіберпанк, голощити)
(function () {
  const { P, A, D, ramp, mix, rnd, txt } = AR;
  const BK = ramp('#1c2034'), MG = '#ff2fa0', CY = '#20f0ff', PU = '#8a3cff', LM = '#a8ff3a', YL = '#ffd84a', WH = '#ffffff';
  const NE = [MG, CY, PU, LM];

  function glow(g, x, y, w, h, c) { A(g, 0.22, () => P(g, x - 1, y - 1, w + 2, h + 2, c)); P(g, x, y, w, h, c); P(g, x + (w > 1 ? 0 : 0), y, 1, h, mix(c, '#ffffff', 0.5)); }
  function holo(g, x, y, w, h, seed) {                                          // голографічний щит: діагональні кольорові смуги й скан-лінії
    P(g, x - 1, y - 1, w + 2, h + 2, '#06060e');
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const t = ((i + j * 2 + seed) % 12) / 12; P(g, x + i, y + j, 1, 1, t < 0.33 ? '#7a1a6a' : t < 0.66 ? '#1a4a88' : '#1a8a8a'); }
    for (let j = 1; j < h; j += 2) A(g, 0.35, () => P(g, x, y + j, w, 1, '#000000'));
    A(g, 0.5, () => { P(g, x, y, w, 1, CY); P(g, x, y + h - 1, w, 1, MG); P(g, x, y, 1, h, CY); P(g, x + w - 1, y, 1, h, MG); });
  }
  function vsign(g, x, y, hgt, c, seed) {                                       // вертикальна неонова вивіска з «ієрогліфами»
    P(g, x, y, 7, hgt, '#06060e'); A(g, 0.3, () => P(g, x - 1, y - 1, 9, hgt + 2, c)); P(g, x, y, 7, 1, c); P(g, x, y + hgt - 1, 7, 1, c); P(g, x, y, 1, hgt, c); P(g, x + 6, y, 1, hgt, c);
    for (let j = 3; j < hgt - 3; j += 4) { const r = rnd(seed, j); P(g, x + 2, y + j, 3, 1, c); if (r % 2) P(g, x + 2, y + j + 1, 1, 2, c); if (r % 3) P(g, x + 4, y + j + 1, 1, 2, c); }
  }
  function hazard(g, x, y, w, h) { for (let i = 0; i < w; i++) P(g, x + i, y, 1, h, ((i + 4000) >> 2) % 2 ? YL : '#1a1a22'); }

  function front(g, C) {
    const { w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, cx = w >> 1, fill = currentEpoch().signFill || look.signFill, ys = Math.max(0, top - 10);
    // дах: плита з неоновим краєм, вертикальні вивіски й голощит
    P(g, 0, top - 1, w, 7, BK[2]); P(g, 0, top - 1, w, 1, BK[0]); P(g, 0, top + 3, w, 1, BK[4]); glow(g, 4, top - 2, w - 8, 1, MG);
    if (top >= 14) { vsign(g, 8, Math.max(0, top - 18), Math.min(17, top - 1), MG, 1); vsign(g, w - 15, Math.max(0, top - 18), Math.min(17, top - 1), CY, 2); }
    if (level >= 3 && top >= 14) { holo(g, 22, Math.max(1, top - 12), 24, 10, 3); holo(g, w - 46, Math.max(1, top - 12), 24, 10, 7); }
    if (level >= 2) { [[18, 5], [w - 18, 5]].forEach(([x, k]) => { for (let j = 0; j < 6; j++) A(g, 0.25 - j * 0.03, () => P(g, x - 2 - j, Math.max(0, top - 8 - j * 2), 5 + j * 2, 2, CY)); }); }
    roofSignG(g, cx, ys, false);
    // вивіска: чорна з двома неоновими рамками
    P(g, 0, top + 6, w, 20, '#05050c'); glow(g, 4, top + 7, w - 8, 1, MG); glow(g, 4, top + 24, w - 8, 1, MG); glow(g, 4, top + 7, 1, 18, MG); glow(g, w - 5, top + 7, 1, 18, MG);
    P(g, 6, top + 9, w - 12, 15, '#0a0a1a'); P(g, 7, top + 10, w - 14, 13, fill); A(g, 0.6, () => { P(g, 6, top + 9, w - 12, 1, CY); P(g, 6, top + 23, w - 12, 1, CY); });
    // кутові пілони: бетон з неоновим стрижнем і попереджувальними лампами
    const cH = h - 6 - (top + 26);
    [0, w - 8].forEach((x, s) => { P(g, x, top + 26, 8, cH, BK[2]); P(g, x + (s ? 7 : 0), top + 26, 1, cH, BK[4]); P(g, x + (s ? 0 : 7), top + 26, 1, cH, BK[1]); glow(g, x + 3, top + 28, 2, cH - 4, NE[(s + level) % 4]); for (let y = top + 32; y < h - 10; y += 14) P(g, x + 1, y, 2, 2, '#ff3a3a'); });
    // поверхи: щілинні вікна, між ними неонові колони
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const hF = fl.fy - fl.top, n = Math.max(2, Math.round(innerW / 36)), pier = 6, bw = (innerW - (n - 1) * pier) / n;
      P(g, 0, fl.fy, w, 6, BK[2]); P(g, 0, fl.fy, w, 1, BK[0]); glow(g, 0, fl.fy + 2, w, 1, CY); P(g, 0, fl.fy + 4, w, 1, BK[4]); for (let x = 6; x < w - 6; x += 14) P(g, x, fl.fy + 3, 4, 1, MG);
      P(g, innerX, fl.top - 3, innerW, hF + 3, BK[2]); P(g, innerX, fl.top - 3, innerW, 1, BK[1]);
      for (let i = 0; i < n; i++) {
        const bx = Math.round(innerX + i * (bw + pier)), bwi = Math.round(bw);
        g.clearRect(bx, fl.top, bwi, hF - 1);
        P(g, bx - 1, fl.top - 1, bwi + 2, 1, BK[4]); P(g, bx - 1, fl.top - 1, 1, hF, BK[4]); P(g, bx + bwi, fl.top - 1, 1, hF, BK[4]);
        A(g, 0.2, () => { for (let k = 0; k < 8; k++) P(g, bx + 4 + k, fl.top + 6 + (7 - k), 1, 2, CY); });
        A(g, 0.12, () => P(g, bx, fl.top, bwi, hF - 1, MG));
        if (i < n - 1) { const px = bx + bwi + 2; glow(g, px + 1, fl.top - 1, 2, hF, NE[(i + fl.f) % 4]); }
      }
    });
    // навіс: темна плита з небезпечною смугою
    P(g, 0, yG, w, 10, BK[2]); P(g, 0, yG, w, 1, BK[0]); hazard(g, 0, yG + 6, w, 3); P(g, 0, yG + 9, w, 1, '#000000'); glow(g, 0, yG + 10, w, 1, MG);
    txt(g, 6, yG + 1, 'OPEN 24H', CY); if (w > 160) txt(g, w - 6 - 8 * 4, yG + 1, 'NO.9', LM);
    // портал: червоні лампи й неонові стійки
    P(g, door.x - 4, yG + 10, door.w + 8, 3, BK[4]); glow(g, door.x - 4, yG + 11, 1, h - 6 - yG - 11, MG); glow(g, door.x + door.w + 3, yG + 11, 1, h - 6 - yG - 11, MG);
    // цоколь: решітка з рожевим світінням
    P(g, 0, h - 6, w, 6, '#0a0a14'); for (let x = 0; x < w; x += 3) P(g, x, h - 5, 1, 4, BK[3]); glow(g, 0, h - 6, w, 1, MG); P(g, 0, h - 1, w, 1, '#000000');
    P(g, door.x - 6, h - 3, door.w + 12, 3, BK[3]); P(g, door.x - 6, h - 3, door.w + 12, 1, CY);
  }
  function deco(g, C) {
    const { w, h, level, door } = C;
    if (level >= 2) { const x = door.x - 22, y = h - 6; P(g, x, y - 14, 9, 14, '#0a0a18'); P(g, x + 1, y - 13, 7, 8, '#1a3a5a'); P(g, x + 2, y - 12, 5, 6, CY); A(g, 0.4, () => P(g, x + 2, y - 12, 5, 3, WH)); P(g, x + 1, y - 4, 7, 2, MG); A(g, 0.3, () => P(g, x - 1, y - 15, 11, 16, CY)); }
  }

  /* ---------- будинки: мегаблоки ---------- */
  const WALLS = ['#161a2c', '#1c1630', '#10202a', '#201830', '#141c24', '#241626'];
  const WORDS = ['BAR', 'HOTEL', 'NOODLE', 'CLUB', 'TECH', 'HACK', 'RAMEN'];
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), wc = WALLS[(hs >>> 3) % WALLS.length], wp = ramp(wc);
    lamps = lamps || []; houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const winter = buildSeason === 'winter', ne = NE[hs % 4], ne2 = NE[(hs >>> 3) % 4];
    P(g, x, top, w, h, wc); P(g, x, top, 1, h, '#000000'); P(g, x + w - 1, top, 1, h, '#000000'); A(g, 0.35, () => P(g, x + w - 7, top + 1, 6, h - 1, '#000000')); A(g, 0.25, () => P(g, x + 1, top + 1, 2, h - 1, wp[0]));
    // панельні шви
    A(g, 0.5, () => { for (let y = top + 10; y < base - 4; y += 16) P(g, x + 1, y, w - 2, 1, '#000000'); });
    // неонова окантовка даху та стійки
    P(g, x - 1, top - 3, w + 2, 3, wp[3]); glow(g, x - 1, top - 3, w + 2, 1, ne); A(g, 0.3, () => P(g, x, top, w, 3, '#000000'));
    glow(g, x + 2, top + 4, 1, h - 12, ne2);
    if (winter) P(g, x - 1, top - 6, w + 2, 3, '#ffffff');
    // дахове обладнання
    const k = hs % 5;
    if (k === 0 && w >= 30) { const wd = WORDS[(hs >>> 5) % WORDS.length], sw = wd.length * 4 + 6, sx = x + 2 + (hs >>> 6) % Math.max(1, w - sw - 2); P(g, sx + 2, top - 9, 1, 6, '#444'); P(g, sx + sw - 3, top - 9, 1, 6, '#444'); P(g, sx, top - 16, sw, 8, '#06060e'); glow(g, sx, top - 16, sw, 1, ne); glow(g, sx, top - 9, sw, 1, ne); txt(g, sx + 3, top - 14, wd, ne); }
    else if (k === 1) holo(g, x + 4 + (hs >>> 5) % Math.max(1, w - 24), top - 14, 18, 10, hs);
    else if (k === 2) { const ax = x + 8 + (hs >>> 5) % Math.max(1, w - 16); P(g, ax, top - 18, 1, 15, '#4a4e60'); P(g, ax - 2, top - 14, 5, 1, '#4a4e60'); P(g, ax - 3, top - 10, 7, 1, '#4a4e60'); P(g, ax - 1, top - 19, 3, 1, '#ff3a3a'); }
    else if (k === 3) { P(g, x + 4, top - 8, 8, 5, '#2a2e40'); D(g, x + 8, top - 6, 2, '#0a0a14'); P(g, x + 14, top - 6, 6, 3, '#2a2e40'); }
    // труби по стіні
    if ((hs >>> 9) % 2) { P(g, x + w - 5, top + 6, 2, h - 14, '#3a3e50'); P(g, x + w - 5, top + 6, 1, h - 14, '#5a5e72'); for (let y = top + 14; y < base - 8; y += 18) P(g, x + w - 6, y, 4, 1, '#1a1e2c'); }
    // вікна
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, doorX = x + (w >> 1) - 5 + ((hs >>> 4) % 9 - 4), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 6) / 14)), sp = (w - 6) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 3 + c * sp + (sp - 7) / 2), r = hash2(wx, y0), lit = r % 3 !== 0, col = NE[(r >>> 4) % 4];
        if (f === floors - 1 && wx + 8 >= (doorOk ? doorX : -9999) - 2 && wx <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        P(g, wx - 1, y0 - 1, 9, 12, '#05050c'); P(g, wx, y0, 7, 10, lit ? mix(col, '#000000', 0.45) : '#0a1a2a');
        if (lit) { P(g, wx, y0, 7, 3, mix(col, '#000000', 0.15)); A(g, 0.5, () => P(g, wx + 1, y0 + 1, 2, 1, WH)); } else { P(g, wx + 1, y0 + 1, 2, 1, '#2a5a8a'); }
        P(g, wx - 1, y0 + 10, 9, 1, ne);
        houseGlass.push([wx, y0, 7, 10]);
      }
    }
    if (doorOk) {
      houseDoors.push({ x: doorX + 5, y: base });
      P(g, doorX - 1, base - 14, doorW + 2, 14, '#05050c'); P(g, doorX, base - 13, doorW, 13, '#10162a'); glow(g, doorX - 1, base - 15, doorW + 2, 1, ne2); P(g, doorX + 4, base - 13, 2, 13, '#05050c');
      A(g, 0.5, () => P(g, doorX + 1, base - 12, 3, 5, '#2a6a9a')); P(g, doorX + 7, base - 7, 1, 1, LM);
    }
  }
  ARCH['neon'] = { front, deco, house };
})();

