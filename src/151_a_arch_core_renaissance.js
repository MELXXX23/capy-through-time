//#part 151_a_arch_core_renaissance.js
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
  // двері будинку стоять під колонкою вікон (непарна кількість колонок — під середньою, парна — під однією із двох середніх): вікна й двері на одній сітці
  function doorGrid(x, w, hs, K, pad, off) { const cols = Math.max(1, Math.floor((w - pad) / K)), sp = (w - pad) / cols, dc = cols % 2 ? (cols - 1) >> 1 : cols / 2 - ((hs >>> 4) & 1); return { cols, sp, dc, cx: x + off + dc * sp + sp / 2 }; }
  return { txt, P, A, D, rgb, hex, mix, ramp, block, masonry, lineH, rnd, hxc, doorGrid };
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
  function balconyG(g, wxs, y0, hx, hw, long, iron, seed, snow) {              // балкони однієї «стрічки» вікон: суцільний на весь фасад або окремі «французькі» під кожним вікном
    const DK = '#2a2038', segs = long ? [[hx + 5, hx + hw - 6]] : wxs.map(wx => [wx - 3, wx + 10]);
    const clothC = ['#b8312a', '#2a4a8c', '#e0b030', '#4f7a45'][seed % 4];
    segs.forEach(([a, b], si) => {
      const W = b - a + 1, posts = [a, b - 1];
      if (long) for (let i = 0; i < wxs.length - 1; i++) { const gx = Math.round((wxs[i] + 8 + wxs[i + 1]) / 2) - 1; if (gx > a + 4 && gx < b - 5) posts.push(gx); }
      // нижня стрічка-консолі під плитою
      for (let k = a + 1; k < b; k += 3) P(g, k, y0 + 14, 1, 1, ST[3]);
      A(g, 0.28, () => P(g, a + 1, y0 + 15, W - 2, 1, '#000000'));
      // плита балкона
      P(g, a - 1, y0 + 11, W + 2, 1, snow ? '#ffffff' : SL[0]); P(g, a - 1, y0 + 12, W + 2, 1, ST[2]); P(g, a - 1, y0 + 13, W + 2, 1, ST[3]);
      // балюстрада: поручень, бальки, нижня планка
      if (iron) {
        P(g, a, y0 + 6, W, 1, DK); P(g, a, y0 + 10, W, 1, DK);
        for (let k = a + 3; k < b - 2; k += 3) { P(g, k, y0 + 7, 1, 3, DK); P(g, k, y0 + 7, 1, 1, GOLD[2]); }
        A(g, 0.45, () => P(g, a, y0 + 6, W, 1, '#7a6a88'));
      } else {
        P(g, a, y0 + 6, W, 1, snow ? '#eaf2fc' : SL[0]); P(g, a, y0 + 7, W, 1, ST[2]); P(g, a, y0 + 10, W, 1, ST[3]);
        for (let k = a + 2; k < b - 1; k += 2) { P(g, k, y0 + 8, 1, 2, ST[1]); P(g, k, y0 + 9, 1, 1, ST[2]); }
      }
      // стовпці з кулями й консолі під ними
      posts.forEach(p => {
        if (iron) { P(g, p, y0 + 4, 2, 7, DK); P(g, p, y0 + 4, 1, 7, '#5a4a68'); P(g, p, y0 + 2, 2, 2, GOLD[1]); P(g, p, y0 + 2, 1, 1, GOLD[0]); P(g, p + 1, y0 + 3, 1, 1, GOLD[3]); }
        else { P(g, p, y0 + 4, 2, 7, ST[1]); P(g, p, y0 + 4, 1, 7, SL[0]); P(g, p + 1, y0 + 4, 1, 7, ST[3]); P(g, p - 1, y0 + 3, 4, 1, ST[0]); P(g, p, y0 + 1, 2, 2, SL[1]); P(g, p, y0 + 1, 1, 1, SL[0]); }
        P(g, p - 1, y0 + 14, 4, 1, ST[2]); P(g, p, y0 + 15, 2, 1, ST[3]); P(g, p, y0 + 16, 2, 1, ST[4]);
      });
      // горщики з квітами (за ознакою від зерна) і одна тканина-стяг на поручні
      wxs.forEach((wx, i) => {
        if (wx + 5 < a || wx + 2 > b) return;
        const sd = hash2(seed + i * 7 + si, wx);
        if (sd % 3 === 0) { const px = wx + 2; P(g, px, y0 + 9, 3, 1, '#d98a5a'); P(g, px, y0 + 10, 3, 1, '#b8603a'); P(g, px, y0 + 8, 3, 1, '#4f9a63'); P(g, px + 1, y0 + 7, 1, 1, '#4f9a63'); P(g, px, y0 + 7, 1, 1, ['#e8353a', '#ffd84f', '#ff8fd0'][(sd >>> 4) % 3]); P(g, px + 2, y0 + 7, 1, 1, ['#ffd84f', '#ff8fd0', '#e8353a'][(sd >>> 4) % 3]); }
        else if (sd % 3 === 1 && (seed >>> 5) % 2 === 0) { const cx0 = wx + 2; P(g, cx0, y0 + 6, 4, 5, clothC); P(g, cx0, y0 + 6, 4, 1, mix(clothC, '#ffffff', 0.35)); P(g, cx0 + 1, y0 + 8, 1, 3, mix(clothC, '#ffffff', 0.25)); P(g, cx0 + 1, y0 + 10, 1, 1, GOLD[1]); P(g, cx0 + 3, y0 + 10, 1, 1, GOLD[1]); }
      });
    });
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
    const winX = [];
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 17)), sp = (w - 4) / cols;
      if (f > 0) { P(g, x, y0 - 6, w, 1, SL[0]); P(g, x, y0 - 5, w, 1, SL[2]); P(g, x, y0 - 4, w, 1, ST[3]); }         // поясок між поверхами
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 8) / 2);
        if (f === floors - 1 && wx + 9 >= (doorOk ? doorX : -9999) - 2 && wx <= (doorOk ? doorX : -9999) + doorW + 2) continue;
        winArch(g, wx, y0, ((c + f + x) % 4 === 0), shut && f < floors - 1, pedF && f % 2 === 1);
        houseGlass.push([wx + 1, y0 + 1, 6, 9]);
        (winX[f] = winX[f] || []).push(wx);
      }
    }
    // балкони: кожен другий поверх (над першим — ближче до землі), вікна на ньому виходять на балюстраду
    if (floors >= 2) {
      const hb = hash2(x * 5 + 9, h + 23), par = hb & 1, mode = (hb >>> 1) % 3, iron = ((hb >>> 4) & 1) === 1;
      const pick = [];
      for (let f = floors - 2; f >= 0; f--) if (((floors - 2 - f) % 2) === par) pick.push(f);
      if (!pick.length) pick.push(floors - 2);                                    // низький будинок: хоча б один балкон
      pick.forEach((f, k) => {
        const wxs = winX[f]; if (!wxs || !wxs.length) return;
        const y0 = base - 6 - (floors - f) * 19 + 3, long = mode === 0 || (mode === 2 && k === 0);
        balconyG(g, wxs, y0, x, w, long, iron, hash2(hb + f * 13, x), winter);
      });
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

