//#part 245_stands.js
/* =====================================================================
    МІСЦЯ ГОСТЕЙ ЕПОХ: біля магазину ліворуч кожен гість має своє місце (джубокс і бар, колонки, автомат-хапалка тощо).
    STANDS[id] = { w, h, draw(g, x, y, t) } — x центр, y земля, t — годинник анімації (с).
   ===================================================================== */
const GUEST_STAND_EPOCH = { pietro: 0, bruno: 0, pip: 1, zina: 2, maks: 3, bitik: 4, lesyk: 5, orbit: 6, lumi: 7 };   // в якій епосі гість стоїть на своєму місці
const STANDS = {};
(function () {
  const rr = Math.round;
  const px = (g, x, y, c) => R(g, rr(x), rr(y), 1, 1, c);
  const rc = (g, x, y, w, h, c) => R(g, rr(x), rr(y), rr(w), rr(h), c);
  const ln = (g, x0, y0, x1, y1, c) => lineG(g, rr(x0), rr(y0), rr(x1), rr(y1), c);
  const box = (g, x, y, w, h, fill, hi, sh) => { x = rr(x); y = rr(y); R(g, x - 1, y - 1, w + 2, h + 2, 'd'); R(g, x, y, w, h, fill); if (hi) R(g, x, y, w, 1, hi); if (sh) R(g, x, y + h - 1, w, 1, sh); };
  const shadow = (g, x, y, w) => { g.globalAlpha = 0.22; R(g, rr(x - w / 2), y, w, 2, 'd'); g.globalAlpha = 1; };
  const glow = (g, x, y, r, c, a) => { for (let i = 3; i >= 1; i--) { g.globalAlpha = a * (4 - i) / 4; disc(g, rr(x), rr(y), r + i * 2, c); } g.globalAlpha = 1; };
  const GL = { A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], R: ['##.', '#.#', '##.', '#.#', '#.#'], C: ['.##', '#..', '#..', '#..', '.##'], L: ['#..', '#..', '#..', '#..', '###'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], E: ['###', '#..', '##.', '#..', '###'] };
  const text = (g, x, y, str, c) => { let cx = x; [...str].forEach(ch => { const gl = GL[ch]; if (!gl) return; gl.forEach((row, j) => { for (let i = 0; i < gl[0].length; i++) if (row[i] === '#') R(g, cx + i, y + j, 1, 1, c); }); cx += GL[ch][0].length + 1; }); };
  const awning = (g, x, y, w, c1, c2) => { for (let i = 0; i < w; i += 4) { const a = (i / 4) % 2 ? c2 : c1, b = (i / 4) % 2 ? c1 : c2; R(g, x + i, y, 4, 4, a); R(g, x + i, y + 4, 4, 1, b); px(g, x + i + 1, y + 5, b); } R(g, x - 1, y - 1, w + 2, 1, 'd'); };

  /* ---------- Піп (Ретро, пінгвін): великий джубокс і бар із коктейлями впритул ---------- */
  STANDS.pip = {
    w: 62, h: 46, draw(g, x, y, t) {
      const jx = x - 20, jl = jx - 12, jt = y - 42;
      shadow(g, x, y, 64);
      // джубокс: арка зверху, золоте обрамлення, екран-еквалайзер, диск, кнопки, динамік
      for (let i = 0; i < 42; i++) { const ins = i < 8 ? [7, 5, 3, 2, 1, 1, 0, 0][i] : 0; R(g, jl + ins, jt + i, 24 - ins * 2, 1, 'd'); }
      for (let i = 1; i < 41; i++) { const ins = i < 8 ? [7, 5, 3, 2, 1, 1, 0, 0][i] : 0; R(g, jl + ins + 1, jt + i, 22 - ins * 2, 1, i < 9 ? 'h' : 'r'); }
      rc(g, jl + 3, jt + 3, 18, 1, 'y'); rc(g, jl + 2, jt + 9, 20, 1, 'y');                                  // світла кромка арки
      box(g, jl + 5, jt + 5, 14, 11, 'z', null, null);                                                         // екран
      for (let k = 0; k < 6; k++) { const hh = 2 + Math.round((Math.sin(t * 6 + k * 1.3) * 0.5 + 0.5) * 6); rc(g, jl + 6 + k * 2 + (k >> 1), jt + 15 - hh, 2, hh, ['N', 'm', 'y', 'p', 'N', 'm'][k]); }
      for (let i = 0; i < 9; i++) px(g, jl + 2, jt + 10 + i * 3, (i + Math.floor(t * 4)) % 3 ? 'r' : 'y');   // лампочки на боці
      for (let i = 0; i < 9; i++) px(g, jl + 21, jt + 10 + i * 3, (i + Math.floor(t * 4)) % 3 ? 'r' : 'y');
      box(g, jl + 4, jt + 19, 16, 9, 'k', null, null); disc(g, jl + 12, jt + 23, 3, 'e');                    // вікно з диском
      const a = t * 5; ln(g, jl + 12 + Math.cos(a) * 3, jt + 23 + Math.sin(a) * 3, jl + 12 - Math.cos(a) * 3, jt + 23 - Math.sin(a) * 3, 'Y'); px(g, jl + 12, jt + 23, 'r');
      for (let k = 0; k < 4; k++) { rc(g, jl + 4 + k * 4, jt + 30, 3, 2, ['f', 'T', 'y', 'N'][k]); }      // кнопки
      rc(g, jl + 5, jt + 34, 14, 4, 'd'); for (let k = 0; k < 4; k++) rc(g, jl + 6 + k * 3, jt + 35, 2, 2, 'e');   // решітка динаміка
      rc(g, jl - 1, y - 2, 26, 2, 'd');
      glow(g, jx, jt + 10, 8, 'y', 0.1 + 0.05 * Math.sin(t * 3));
      // бар упритул
      const bl = x - 6;
      rc(g, bl + 10, y - 40, 1, 9, 'e'); rc(g, bl + 33, y - 40, 1, 9, 'e');
      box(g, bl + 6, y - 46, 32, 9, 'k', null, null); const pulse = 0.65 + 0.35 * Math.sin(t * 4);
      g.globalAlpha = pulse; rc(g, bl + 7, y - 45, 30, 7, 'P'); text(g, bl + 14, y - 44, 'BAR', 'f'); g.globalAlpha = 1; rc(g, bl + 6, y - 46, 32, 1, 'f');
      box(g, bl + 2, y - 15, 40, 15, 'w', 'W', 'E'); rc(g, bl + 2, y - 11, 40, 2, 'p'); rc(g, bl + 2, y - 8, 40, 1, 'T'); rc(g, bl + 1, y - 17, 42, 2, 'Y');
      [[6, 'a'], [14, 'q'], [23, 'y'], [33, 'm']].forEach(([dx, col], i) => {                                  // коктейлі на стійці
        const gx = bl + dx; rc(g, gx, y - 24, 5, 6, col); rc(g, gx, y - 24, 5, 1, 'w'); rc(g, gx + 2, y - 18, 1, 1, 'e');
        rc(g, gx + 3, y - 27, 1, 4, i % 2 ? 'f' : 'r'); rc(g, gx + 3 + (i % 2), y - 28, 3, 1, i % 2 ? 'y' : 'f');
      });
      [[8], [20], [32]].forEach(([dx]) => { rc(g, bl + dx + 1, y - 6, 1, 6, 'e'); rc(g, bl + dx - 1, y - 7, 5, 2, 'r'); rc(g, bl + dx, y - 1, 3, 1, 'd'); });   // високі табурети
      sparkPlus2(g, bl + 36, y - 30 + Math.round(Math.sin(t * 2) * 1), t);
    }
  };

  /* ---------- Зіна (Диско, зебра): великі колонки, діафрагми «б'ють» басом, хвилі від колонок ---------- */
  STANDS.zina = {
    w: 72, h: 52, draw(g, x, y, t) {
      shadow(g, x, y, 74);
      const beat = Math.sin(t * 7.5), kick = beat > 0.55, k2 = Math.max(0, beat);                              // удар басу
      const spk = (cx, w, h, wf, tw) => {
        box(g, cx - w / 2, y - h, w, h, 'k', 'e', 'z');
        rc(g, cx - w / 2 + 2, y - h + 2, w - 4, 1, 'Y'); rc(g, cx - w / 2 + 2, y - 3, w - 4, 1, 'e');
        for (let i = 0; i < 4; i++) { px(g, cx - w / 2 + 2, y - h + 4 + i * (h / 4 - 1), 'N'); }
        const wr = wf + (kick ? 1 : 0);                                                                           // великий вуфер: конус пульсує
        disc(g, rr(cx), rr(y - h * 0.38), wr + 1, 'e'); disc(g, rr(cx), rr(y - h * 0.38), wr, 'k'); disc(g, rr(cx), rr(y - h * 0.38), wr - 2, kick ? 'z' : 'V'); disc(g, rr(cx), rr(y - h * 0.38), Math.max(1, wr - 5), kick ? 'N' : 'v');
        disc(g, rr(cx), rr(y - h * 0.82), tw + (kick ? 1 : 0), 'e'); disc(g, rr(cx), rr(y - h * 0.82), Math.max(1, tw - 1), 'k'); px(g, cx, y - h * 0.82, 'N');   // високочастотник
        if (kick) { g.globalAlpha = 0.5; disc(g, rr(cx), rr(y - h * 0.38), wr + 3, 'N'); g.globalAlpha = 1; }
      };
      spk(x - 20, 28, 50, 9, 3);                                                                                // ліва велика
      spk(x + 20, 28, 50, 9, 3);                                                                                // права велика
      box(g, x - 8, y - 14, 16, 14, 'P', 'f', 'V'); rc(g, x - 6, y - 11, 12, 5, 'k');                           // мікшер між колонками
      for (let i = 0; i < 4; i++) { const hh = 1 + Math.round((Math.sin(t * 9 + i * 1.7) * 0.5 + 0.5) * 4); rc(g, x - 5 + i * 3, y - 6 - hh, 2, hh, ['N', 'm', 'y', 'f'][i]); }
      rc(g, x - 7, y - 4, 2, 2, 'f'); rc(g, x - 3, y - 4, 2, 2, 'T'); rc(g, x + 1, y - 4, 2, 2, 'y'); rc(g, x + 5, y - 4, 2, 2, 'N');
      // звукові хвилі від колонок (кільця, що розходяться на ритм)
      for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 3; i++) {
        const ph = (t * 1.9 + i / 3) % 1, rad = 6 + ph * 14, cx = x + s * 20 + s * 8, cy = y - 20;
        g.globalAlpha = (1 - ph) * 0.55;
        for (let a = -1.0; a <= 1.0; a += 0.17) px(g, cx + s * Math.cos(a) * rad * 0.6 + s * ph * 4, cy + Math.sin(a) * rad, i % 2 ? 'N' : 'f');
        g.globalAlpha = 1;
      }
      // неонові смужки зверху
      rc(g, x - 33, y - 53, 24, 1, 'f'); rc(g, x + 9, y - 53, 24, 1, 'N');
    }
  };

  /* ---------- Макс (Аркади, мавпа): великий автомат-хапалка з м'якими іграшками й рухомою рукою ---------- */
  STANDS.maks = {
    w: 44, h: 60, draw(g, x, y, t) {
      shadow(g, x, y, 44);
      const L = x - 20, T = y - 58;
      // корпус
      box(g, L, T, 40, 58, 'u', 'v', 'P');
      rc(g, L + 2, T + 2, 36, 7, 'k'); for (let i = 0; i < 9; i++) px(g, L + 4 + i * 4, T + 3, (i + Math.floor(t * 5)) % 2 ? 'y' : 'f'); text(g, L + 9, T + 4, 'CLAW', 'y');   // вивіска
      box(g, L + 3, T + 11, 34, 31, 'a', null, null);                                                              // скло
      rc(g, L + 4, T + 12, 3, 28, 'S'); rc(g, L + 5, T + 12, 1, 14, 'w');                                         // відблиск
      // іграшки: купа м'яких звірят
      const toys = [[6, 'r', 'w'], [12, 'y', 'o'], [18, 'p', 'f'], [24, 'm', 'g'], [30, 'a', 'n'], [9, 'o', 'y'], [21, 'f', 'q'], [27, 'T', 'm'], [15, 'q', 'p']];
      toys.forEach(([dx, c1, c2], i) => { const ty = T + 42 - 6 - (i > 4 ? 5 : 0); rc(g, L + 3 + dx, ty, 6, 6, c1); rc(g, L + 3 + dx, ty, 6, 1, c2); rc(g, L + 4 + dx, ty - 2, 1, 2, c1); rc(g, L + 7 + dx, ty - 2, 1, 2, c1); px(g, L + 4 + dx, ty + 2, 'k'); px(g, L + 7 + dx, ty + 2, 'k'); });
      // хапалка: цикл ~9 с (їде вправо, опускається, хапає, піднімається, їде до лотка, відпускає, повертається)
      const P = (t % 9) / 9; let cx = 12, cy = 0, open = 1;
      if (P < 0.18) { cx = 12 + (P / 0.18) * 14; }
      else if (P < 0.32) { cx = 26; cy = ((P - 0.18) / 0.14) * 20; }
      else if (P < 0.38) { cx = 26; cy = 20; open = 1 - (P - 0.32) / 0.06; }
      else if (P < 0.52) { cx = 26; cy = 20 * (1 - (P - 0.38) / 0.14); open = 0; }
      else if (P < 0.74) { cx = 26 - ((P - 0.52) / 0.22) * 18; cy = 0; open = 0; }
      else if (P < 0.82) { cx = 8; cy = 0; open = (P - 0.74) / 0.08; }
      else { cx = 8 + ((P - 0.82) / 0.18) * 4; cy = 0; open = 1; }
      const ax = L + 3 + cx + 2;
      rc(g, L + 3, T + 13, 32, 2, 'Y'); rc(g, L + 3 + cx - 1, T + 12, 7, 4, 'e');                                   // рейка і каретка
      rc(g, ax, T + 15, 1, 3 + cy, 'e');                                                                            // трос
      const hy = T + 18 + cy, sp = 1 + Math.round(open * 3);
      rc(g, ax - 1, hy, 3, 2, 'Y'); ln(g, ax - 1, hy + 2, ax - sp - 1, hy + 6, 'e'); ln(g, ax + 1, hy + 2, ax + sp + 1, hy + 6, 'e'); px(g, ax, hy + 2, 'e');
      if (P > 0.38 && P < 0.76) { rc(g, ax - 2, hy + 3, 5, 5, 'p'); px(g, ax - 1, hy + 5, 'k'); px(g, ax + 1, hy + 5, 'k'); }   // схоплена іграшка
      // лоток для призів і пульт
      box(g, L + 3, T + 38, 8, 5, 'k', null, null); rc(g, L + 4, T + 39, 6, 1, 'e');
      rc(g, L + 2, T + 44, 36, 1, 'v'); box(g, L + 3, T + 46, 34, 8, 'P', 'f', 'V');
      disc(g, L + 9, T + 50, 2, 'k'); rc(g, L + 9, T + 46, 1, 3, 'Y'); disc(g, L + 9, T + 46, 1, 'r');              // джойстик
      disc(g, L + 31, T + 50, 2, 'r'); px(g, L + 30, T + 49, 'q'); rc(g, L + 17, T + 49, 8, 2, 'k'); px(g, L + 20, T + 49, 'y');   // кнопка й монетоприймач
      glow(g, x, y - 42, 12, 'f', 0.07);
    }
  };

  /* ---------- Бітик (Інтернет, робот): чітка велика серверна стійка ---------- */
  STANDS.bitik = {
    w: 40, h: 62, draw(g, x, y, t) {
      shadow(g, x, y, 42);
      const L = x - 17, T = y - 58;
      // антена зі сигналом
      rc(g, x - 1, T - 8, 2, 9, 'e'); disc(g, x, T - 9, 2, Math.floor(t * 2) % 2 ? 'r' : 'R');
      for (let i = 0; i < 3; i++) { const ph = (t * 1.3 + i / 3) % 1; g.globalAlpha = 1 - ph; const rad = 4 + ph * 9; for (let a = -0.9; a <= 0.9; a += 0.2) { px(g, x + Math.sin(a) * rad, T - 9 - Math.cos(a) * rad * 0.8, 'N'); } g.globalAlpha = 1; }
      box(g, L, T, 34, 58, 'z', 'n', 'k');                                                                           // корпус
      rc(g, L + 1, T + 1, 1, 56, 'n'); rc(g, L + 32, T + 1, 1, 56, 'k');
      box(g, L + 3, T + 3, 28, 9, 'k', null, null); rc(g, L + 4, T + 4, 26, 7, 'N'); rc(g, L + 4, T + 4, 26, 1, 'a');  // екран
      for (let i = 0; i < 8; i++) { const hh = 1 + Math.round((Math.sin(t * 3 + i * 0.9) * 0.5 + 0.5) * 5); rc(g, L + 5 + i * 3, T + 10 - hh, 2, hh, 'z'); }
      text(g, L + 10, T + 15, 'WEB', 'N');
      for (let u = 0; u < 5; u++) {                                                                                  // п'ять серверів-«піц»
        const uy = T + 21 + u * 7;
        box(g, L + 3, uy, 28, 5, 'e', 'Y', 'z'); rc(g, L + 4, uy + 1, 18, 3, 'k');
        for (let k = 0; k < 6; k++) rc(g, L + 5 + k * 3, uy + 1, 1, 3, 'z');                                         // решітка
        const cols = ['m', 'y', 'N', 'r', 'f'];                                                                       // індикатори з різною частотою
        for (let k = 0; k < 3; k++) { const on = Math.sin(t * (2 + u * 0.7 + k * 1.3) + u * 2 + k) > -0.2; rc(g, L + 24 + k * 2, uy + 1, 1, 1, on ? cols[(u + k) % 5] : 'k'); rc(g, L + 24 + k * 2, uy + 3, 1, 1, on ? 'w' : 'z'); }
      }
      rc(g, L + 3, T + 55, 28, 1, 'e');
      // кабелі
      ln(g, L + 33, T + 24, L + 38, T + 34, 'N'); ln(g, L + 38, T + 34, L + 36, T + 50, 'N'); ln(g, L + 33, T + 30, L + 36, T + 38, 'f'); ln(g, L + 36, T + 38, L + 35, T + 52, 'f');
      glow(g, x, y - 36, 14, 'N', 0.05);
    }
  };

  /* ---------- Лесик (Еко, олень): грядка з маленькими деревцями, великі горщики з квітами, лопата, лійка, тачка ---------- */
  STANDS.lesyk = {
    w: 64, h: 40, draw(g, x, y, t) {
      shadow(g, x, y, 66);
      const L = x - 30;
      // дерев'яна грядка із землею
      box(g, L + 10, y - 9, 34, 9, 'b', 'c', 'M'); rc(g, L + 11, y - 9, 32, 3, 'd'); for (let i = 0; i < 6; i++) px(g, L + 13 + i * 5, y - 8, 'M');
      // маленькі деревця (гойдаються)
      [[16, 15, 'g'], [26, 19, 'G'], [37, 14, 'g']].forEach(([dx, h, c], i) => {
        const sw = Math.round(Math.sin(t * 1.4 + i * 1.9) * 1), tx = L + dx;
        rc(g, tx, y - 9 - h + 6, 2, h - 6, 'b');
        disc(g, tx + 1 + sw, y - 9 - h + 3, 5, 'G'); disc(g, tx + 1 + sw, y - 9 - h + 3, 4, c); disc(g, tx + sw, y - 9 - h + 2, 2, 'm');
      });
      // великі горщики з квітами
      const pot = (cx, c1, flowers) => {
        box(g, cx - 6, y - 12, 12, 12, 't', 'o', 'r'); rc(g, cx - 7, y - 14, 14, 3, 'o'); rc(g, cx - 7, y - 14, 14, 1, 'h');
        flowers.forEach(([dx, h, c], i) => { const sw = Math.round(Math.sin(t * 1.6 + i * 2.2 + cx) * 1); rc(g, cx + dx, y - 14 - h, 1, h, 'G'); disc(g, cx + dx + sw, y - 15 - h, 3, 'd'); disc(g, cx + dx + sw, y - 15 - h, 2, c); px(g, cx + dx + sw, y - 15 - h, 'y'); });
        rc(g, cx - 4, y - 16, 3, 2, 'g');
      };
      pot(L + 4, 't', [[-3, 6, 'f'], [0, 10, 'y'], [3, 7, 'p']]);
      pot(L + 54, 't', [[-3, 8, 'y'], [0, 5, 'f'], [3, 10, 'q']]);
      // лопата в землі
      rc(g, L + 46, y - 26, 1, 20, 'b'); rc(g, L + 44, y - 27, 5, 2, 'c'); rc(g, L + 45, y - 8, 3, 4, 'Y'); rc(g, L + 45, y - 8, 3, 1, 'w');
      // лійка
      rc(g, L + 22, y - 6, 8, 6, 'm'); rc(g, L + 22, y - 6, 8, 1, 'a'); rc(g, L + 30, y - 5, 4, 1, 'm'); rc(g, L + 33, y - 7, 2, 3, 'G'); ln(g, L + 22, y - 6, L + 24, y - 10, 'g'); ln(g, L + 29, y - 6, L + 26, y - 10, 'g'); rc(g, L + 24, y - 11, 3, 1, 'g');
      // метелик
      const bx = L + 30 + Math.sin(t * 0.7) * 16, by = y - 30 + Math.sin(t * 1.9) * 4, fl = Math.floor(t * 8) % 2;
      px(g, bx, by, 'd'); px(g, bx - 1, by - fl, 'f'); px(g, bx + 1, by - fl, 'f'); px(g, bx - 1, by + 1 - fl, 'q'); px(g, bx + 1, by + 1 - fl, 'q');
    }
  };

  /* ---------- Орбіт (Космос, песик): ракета на стартовому столі з вежею, полум'ям і парою ---------- */
  STANDS.orbit = {
    w: 52, h: 72, draw(g, x, y, t) {
      shadow(g, x, y, 54);
      const cx = x + 4;
      // стартовий стіл
      box(g, x - 22, y - 5, 44, 5, 'e', 'E', 'k'); rc(g, x - 24, y - 2, 48, 2, 'k'); for (let i = 0; i < 6; i++) rc(g, x - 20 + i * 8, y - 4, 4, 1, 'y');
      // вежа обслуговування (ферма) з вогниками
      const tx = x - 18; rc(g, tx, y - 66, 2, 62, 'e'); rc(g, tx + 7, y - 66, 2, 62, 'e'); rc(g, tx + 2, y - 66, 5, 1, 'Y');
      for (let i = 0; i < 10; i++) { const a = y - 66 + i * 6; ln(g, tx + 2, a + 6, tx + 7, a, 'e'); rc(g, tx, a, 9, 1, 'E'); }
      rc(g, tx + 9, y - 52, 8, 2, 'e'); rc(g, tx + 9, y - 36, 8, 2, 'e');                                             // кронштейни до ракети
      disc(g, tx + 1, y - 69, 1, Math.floor(t * 2) % 2 ? 'r' : 'R'); px(g, tx + 7, y - 67, Math.floor(t * 2 + 1) % 2 ? 'y' : 'h');
      // корпус ракети: освітлена ліва грань, тінь справа
      const rh = 54, top = y - 5 - rh;
      for (let i = 0; i < rh; i++) {
        let hw = 7; if (i < 14) hw = Math.round(7 * Math.sin(Math.min(1, (i + 1.5) / 14) * Math.PI / 2));                   // загострений ніс
        const c = i < 14 ? 'r' : (i > 40 && i < 44 ? 'n' : 'w');
        R(g, cx - hw - 1, top + i, hw * 2 + 2, 1, 'd'); R(g, cx - hw, top + i, hw * 2, 1, c);
        if (hw > 2) { R(g, cx - hw, top + i, 2, 1, i < 14 ? 'J' : 'W'); R(g, cx + hw - 2, top + i, 2, 1, i < 14 ? 'R' : 'E'); }
      }
      rc(g, cx - 7, top + 14, 14, 1, 'd'); rc(g, cx - 7, top + 28, 14, 1, 'E');                                            // шви
      // ілюмінатор
      disc(g, cx, top + 22, 4, 'd'); disc(g, cx, top + 22, 3, 'Y'); disc(g, cx, top + 22, 2, 's'); px(g, cx - 1, top + 21, 'S'); px(g, cx - 1, top + 22, 'w');
      rc(g, cx - 7, top + 31, 14, 2, 'r');
      // стабілізатори та бічні прискорювачі
      for (let s = -1; s <= 1; s += 2) {
        const fx = cx + s * 8; ln(g, cx + s * 7, y - 5 - 20, fx + s * 6, y - 5, 'd'); ln(g, cx + s * 7, y - 5 - 18, fx + s * 5, y - 7, 'r');
        for (let i = 0; i < 10; i++) rc(g, s < 0 ? cx - 8 - i * 0.7 : cx + 7 + i * 0.7, y - 5 - 16 + i * 1.6, 2 + Math.round(i * 0.5), 2, i < 2 ? 'R' : 'r');
        rc(g, cx + s * 11 - 1, y - 24, 3, 17, 'Y'); rc(g, cx + s * 11 - 1, y - 24, 1, 17, 'w'); rc(g, cx + s * 11 - 1, y - 27, 3, 3, 'r');
      }
      // сопло, полум'я (тремтить) і пара від стартового столу
      rc(g, cx - 4, y - 8, 8, 3, 'e'); rc(g, cx - 3, y - 8, 6, 1, 'k');
      const fl = 2 + Math.floor(Math.abs(Math.sin(t * 22)) * 3), fl2 = Math.floor(Math.abs(Math.sin(t * 17 + 1)) * 3);
      g.globalAlpha = 0.9; rc(g, cx - 3, y - 5, 6, 1 + fl, 'o'); rc(g, cx - 2, y - 5, 4, fl, 'y'); rc(g, cx - 1, y - 5, 2, fl - 1, 'w'); g.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const ph = (t * 0.7 + i / 6) % 1, sx = cx + (i % 2 ? 1 : -1) * (6 + ph * 14), sy = y - 6 - ph * 8 - fl2; g.globalAlpha = (1 - ph) * 0.5; disc(g, rr(sx), rr(sy), 2 + Math.round(ph * 3), 'E'); g.globalAlpha = 1; }
      // прапорець
      rc(g, x + 22, y - 30, 1, 26, 'b'); const wv = Math.round(Math.sin(t * 4) * 1); rc(g, x + 23, y - 30, 7, 5, 'r'); rc(g, x + 23 + wv, y - 28, 6, 1, 'w');
    }
  };

  /* ---------- Лумі (Неон, світлячок): неонове колесо огляду, ліхтарики-кабінки обертаються ---------- */
  STANDS.lumi = {
    w: 56, h: 66, draw(g, x, y, t) {
      shadow(g, x, y, 50);
      const hy = y - 36, R0 = 22, cols = ['f', 'N', 'y', 'm', 'v', 'o'];
      // опора
      ln(g, x - 14, y, x, hy, 'k'); ln(g, x + 14, y, x, hy, 'k'); ln(g, x - 13, y, x, hy + 1, 'z'); ln(g, x + 13, y, x, hy + 1, 'z'); rc(g, x - 16, y - 2, 32, 2, 'k');
      const ang = t * 0.45;
      // обід колеса з лампочками й спиці
      for (let a = 0; a < 90; a++) { const an = a / 90 * Math.PI * 2; px(g, x + Math.cos(an) * R0, hy + Math.sin(an) * R0, 'k'); px(g, x + Math.cos(an) * (R0 - 1), hy + Math.sin(an) * (R0 - 1), 'v'); }
      for (let a = 0; a < 40; a++) { const an = a / 40 * Math.PI * 2; if ((a + Math.floor(t * 8)) % 4 === 0) px(g, x + Math.cos(an) * (R0 + 1.5), hy + Math.sin(an) * (R0 + 1.5), 'w'); }
      for (let s = 0; s < 6; s++) { const an = ang + s * Math.PI / 3; ln(g, x, hy, x + Math.cos(an) * R0, hy + Math.sin(an) * R0, 'k'); ln(g, x + 1, hy, x + 1 + Math.cos(an) * (R0 - 1), hy + Math.sin(an) * (R0 - 1), 'u'); ln(g, x, hy + 1, x + Math.cos(an) * (R0 - 1), hy + 1 + Math.sin(an) * (R0 - 1), 'u'); }
      // кабінки-ліхтарики: тримаються вертикально
      for (let s = 0; s < 6; s++) {
        const an = ang + s * Math.PI / 3, gx = x + Math.cos(an) * R0, gy = hy + Math.sin(an) * R0, c = cols[s];
        glow(g, gx, gy + 6, 5, c, 0.1 + 0.05 * Math.sin(t * 3 + s));
        rc(g, gx, gy, 1, 3, 'k'); box(g, gx - 2, gy + 3, 5, 7, c, 'w', null); rc(g, gx - 1, gy + 5, 3, 3, 'w'); px(g, gx, gy + 6, c);
      }
      disc(g, x, hy, 3, 'd'); disc(g, x, hy, 2, 'f'); px(g, x - 1, hy - 1, 'w');
      glow(g, x, hy, R0 - 2, 'N', 0.03);
    }
  };

  /* ---------- Бруно (нове коло, борсук-художник): галерея-лоток із картинами ---------- */
  STANDS.bruno = {
    w: 52, h: 46, draw(g, x, y, t) {
      shadow(g, x, y, 54);
      awning(g, x - 24, y - 42, 48, 'P', 'f'); rc(g, x - 24, y - 37, 1, 37, 'b'); rc(g, x + 23, y - 37, 1, 37, 'b');
      box(g, x - 22, y - 12, 44, 12, 'b', 'c', 'M'); rc(g, x - 20, y - 8, 40, 1, 'M');
      [[-20, 'r', 's'], [-6, 'y', 'g'], [8, 'n', 'f']].forEach(([dx, c1, c2], i) => {
        const L = x + dx; box(g, L, y - 34, 13, 20, 'h', 'y', 'c'); rc(g, L + 2, y - 32, 9, 16, c1); rc(g, L + 2, y - 24, 9, 8, c2); disc(g, L + 6, y - 27, 3, i === 1 ? 'y' : 'w');
        if (Math.floor(t * 0.6 + i * 1.7) % 4 === 0) sparkPlus2(g, L + 10, y - 30, t);                                // блиск на картині
      });
      [[-14, 'r'], [0, 'y'], [14, 'n']].forEach(([dx, c]) => { rc(g, x + dx, y - 15, 3, 3, c); px(g, x + dx + 1, y - 16, 'w'); });   // баночки з фарбою
      px(g, x - 22 + Math.round(Math.sin(t * 2) * 1), y - 43, 'f');
    }
  };

  /* ---------- П'єтро (Відродження, півень-бард): розкішний триярусний «Фонтан бажань» — звірята весь час докидають у нього монетки ---------- */
  STANDS.pietro = {
    w: 70, h: 62, draw(g, x, y, t) {
      shadow(g, x, y, 72);
      // ступінь і чаша басейну з різьбленим ободом
      box(g, x - 32, y - 3, 64, 3, 'E', 'w', 'e');
      for (let i = 0; i < 11; i++) { const hw = 29 - (i < 2 ? 2 - i : 0); R(g, x - hw - 1, y - 14 + i, hw * 2 + 2, 1, 'd'); R(g, x - hw, y - 14 + i, hw * 2, 1, i < 2 ? 'w' : i < 4 ? 'E' : i % 3 === 0 ? 'Y' : 'e'); }
      for (let k = -26; k <= 26; k += 6) { rc(g, x + k, y - 10, 3, 6, 'E'); px(g, x + k + 1, y - 9, 'e'); }                      // різьблені панелі
      rc(g, x - 30, y - 15, 60, 2, 'w'); rc(g, x - 31, y - 16, 62, 1, 'd');
      // вода в чаші з відблисками й золотими монетками на дні
      rc(g, x - 27, y - 15, 54, 2, 's'); rc(g, x - 27, y - 14, 54, 1, 'n'); for (let k = 0; k < 9; k++) { const sx = x - 25 + k * 6 + Math.round(Math.sin(t * 1.5 + k) * 1); rc(g, sx, y - 15, 2, 1, 'S'); px(g, sx + 1, y - 14, 'a'); }
      [[-20, 'h'], [-12, 'y'], [-4, 'h'], [6, 'y'], [14, 'h'], [22, 'y']].forEach(([dx, c], i) => { px(g, x + dx, y - 14, c); if (Math.sin(t * 2 + i * 1.9) > 0.8) { px(g, x + dx - 1, y - 14, 'w'); px(g, x + dx + 1, y - 14, 'w'); } });
      // колона і середня чаша
      rc(g, x - 4, y - 36, 8, 22, 'E'); rc(g, x - 4, y - 36, 2, 22, 'w'); rc(g, x + 2, y - 36, 2, 22, 'e'); for (let i = 0; i < 3; i++) rc(g, x - 5, y - 30 + i * 6, 10, 1, 'Y');
      box(g, x - 15, y - 40, 30, 4, 'E', 'w', 'e'); rc(g, x - 14, y - 36, 28, 2, 'Y'); rc(g, x - 16, y - 41, 32, 1, 'd');
      rc(g, x - 3, y - 48, 6, 8, 'E'); rc(g, x - 3, y - 48, 2, 8, 'w'); rc(g, x + 1, y - 48, 2, 8, 'e');
      box(g, x - 9, y - 52, 18, 4, 'E', 'w', 'e'); rc(g, x - 8, y - 48, 16, 1, 'Y');
      // золота рибка-дельфін нагорі
      rc(g, x - 2, y - 60, 5, 7, 'h'); rc(g, x - 3, y - 59, 3, 4, 'y'); rc(g, x + 2, y - 62, 3, 3, 'h'); px(g, x + 1, y - 58, 'k'); rc(g, x - 5, y - 55, 3, 2, 'h'); px(g, x - 6, y - 56, 'h');
      // вода: струмені з верхньої чаші на середню, з середньої в басейн, фонтан-дуги нагорі
      const fall = (cx, y0, y1, n) => { for (let i = 0; i < n; i++) { const ph = (t * 1.3 + i / n) % 1; const yy = y0 + ph * (y1 - y0); px(g, cx, yy, 's'); px(g, cx, yy + 1, i % 2 ? 'S' : 'a'); px(g, cx + 1, yy, 'S'); } };
      for (let dx = -7; dx <= 7; dx += 3.5) fall(x + dx, y - 51, y - 41, 4);
      for (let dx = -13; dx <= 13; dx += 3.25) fall(x + dx, y - 39, y - 16, 6);
      for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 6; i++) { const ph = (t * 0.9 + i / 6) % 1, ax = x + s * ph * 9, ay = y - 62 + Math.sin(ph * Math.PI) * -5 + ph * ph * 14; px(g, ax, ay, 's'); px(g, ax, ay + 1, 'S'); px(g, ax + s, ay, 'a'); }
      // сплески в басейні
      for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1, rw = 3 + ph * 11; g.globalAlpha = (1 - ph) * 0.9; for (let k = -rw; k <= rw; k += 1) px(g, x + k - 6 + i * 6, y - 14 + (Math.abs(k) > rw - 1 ? 0 : 1), 'w'); g.globalAlpha = 1; }
      // монетка, яку кинули звірята: летить дугою справа в басейн і «дзеленькає»
      const cp = (t % 2.6) / 2.6;
      if (cp < 0.55) { const k = cp / 0.55, cx2 = x + 36 - k * 28, cy2 = y - 22 - Math.sin(k * Math.PI) * 14 + k * 8; disc(g, rr(cx2), rr(cy2), 1, k % 0.25 < 0.12 ? 'h' : 'y'); px(g, cx2 - 1, cy2 - 1, 'w'); }
      else if (cp < 0.65) { const k = (cp - 0.55) / 0.1; g.globalAlpha = 1 - k; px(g, x + 8, y - 16 - k * 3, 'y'); px(g, x + 7, y - 15 - k * 2, 'w'); px(g, x + 9, y - 15 - k * 2, 'w'); g.globalAlpha = 1; }
      // пишна зелень з квітами по боках, голуб на ободі
      [-1, 1].forEach(s => {
        const bx = x + s * 31;
        for (let i = 0; i < 10; i++) { const hw = Math.round(7 * Math.sin((i + 1) / 11 * Math.PI)); rc(g, bx - hw, y - 20 + i, hw * 2, 1, i < 3 ? 'm' : i < 7 ? 'g' : 'G'); }
        [[-4, 4, 'f'], [2, 2, 'q'], [-1, 7, 'y'], [4, 6, 'f']].forEach(([dx, dy, c], i) => { const sw = Math.round(Math.sin(t * 1.5 + i + s) * 0.6); rc(g, bx + dx + sw, y - 19 + dy - 3, 2, 2, c); px(g, bx + dx + sw, y - 19 + dy - 3, 'w'); });
        rc(g, bx - 3, y - 3, 6, 3, 't'); rc(g, bx - 3, y - 3, 6, 1, 'o');
      });
      const pk = Math.floor(t * 1.6) % 5 === 0 ? 1 : 0;
      rc(g, x - 22, y - 20, 5, 4, 'Y'); rc(g, x - 19, y - 22 + pk * 2, 3, 3, 'e'); px(g, x - 17, y - 21 + pk * 2, 'o'); px(g, x - 23, y - 19, 'e');
      glow(g, x, y - 36, 16, 'S', 0.04);
    }
  };

  const UKL = {
    pip: ['Бар поряд з джубоксом — це не збіг, це стратегія.', 'Коктейль із парасолькою? Парасолька входить у ціну. Лід — ні.', 'Крутиться диск, крутиться життя. Головне — не крутитися над рахунком.'],
    zina: ['Колонки мовчать, а в мене вже тремтять ноги. Таке в нас диско.', 'Бас такий, що серце вже не своє. Повертати не буду.', 'Хочеш танцювати? Став ногу на ритм. Свою, не мою.'],
    maks: ['Хапалка — це чесна гра. Тільки чесна рука інколи сумнівається.', 'Плюшевий заєць майже мій. «Майже» — ключове слово.', 'Ще монетка — і мавпа з автомата піде зі мною.'],
    bitik: ['Сервер гуде, лампочки блимають. Усе гаразд. Мабуть.', 'Мій сервер працює 99,9 % часу. Решту 0,1 % ми називаємо «відпочинок».', 'Вайфай ловить навіть там, де не ловить розум.'],
    lesyk: ['Лопата — найкращий інструмент для думок. Тихо й корисно.', 'Квіти в горщиках уже зазнали слави. Скоро попросять зарплату.', 'Маленьке деревце сьогодні — велика тінь завтра. Треба терпіти.'],
    orbit: ['Старт за мною. Відлік іде, а печиво вже на борту.', 'Ракета готова, пальне є, тільки каса ще не погодила маршрут.', 'Дим під соплом — це не пожежа, це атмосфера.'],
    lumi: ['Колесо крутиться, ліхтарики світяться. Забирайте добрий настрій.', 'Кожна кабінка — окрема мрія. На жаль, без ременів безпеки.', 'Блим-блим. Навколо неон, а всередині тепло.'],
    bruno: ['У галереї правило одне: дивись, але не чіпай. Чіпати можна лише купувати.', 'Ця картина не закінчена. Як і всі мої картини. Як і я.', 'Кожен мазок дорожчий за попередній. Бюджет — теж мазок.'],
    pietro: ['Ярмарок гомонить, гаманці тремтять. Усе за планом.', 'Мої пісні безцінні. Хоча монета ціну знаходить швидко.', 'Відродження — час, коли всі раптом стали митцями. Навіть я.']
  };
  const ENL = {
    pip: ['A bar right next to the jukebox is not a coincidence, it is a strategy.', 'A cocktail with an umbrella? The umbrella is included. The ice is not.', 'The record spins, life spins. Just do not spin over the bill.'],
    zina: ['The speakers are quiet, but my legs are already trembling. That is our disco.', 'The bass is so strong my heart is not mine anymore. I will not give it back.', 'Want to dance? Put your foot on the beat. Yours, not mine.'],
    maks: ['The claw is an honest game. Only the honest hand sometimes doubts.', 'The plush bunny is almost mine. “Almost” is the key word.', 'One more coin and the monkey from the machine comes home with me.'],
    bitik: ['The server hums, the lights blink. All is well. Probably.', 'My server is up 99.9% of the time. The other 0.1% we call “rest”.', 'Wi-Fi catches even where reason cannot.'],
    lesyk: ['A shovel is the best tool for thinking. Quiet and useful.', 'The flowers in the pots already tasted fame. Soon they will ask for a salary.', 'A small tree today, a big shade tomorrow. We have to be patient.'],
    orbit: ['Launch is on me. The countdown runs and the cookies are already aboard.', 'The rocket is ready, the fuel is in, only the till has not approved the route.', 'The smoke under the nozzle is not a fire, it is atmosphere.'],
    lumi: ['The wheel turns, the lanterns glow. Take a good mood with you.', 'Every cabin is its own dream. Sadly, no seat belts.', 'Blink-blink. Neon outside, warmth inside.'],
    bruno: ['One rule in the gallery: look, do not touch. Touching is only for buying.', 'This painting is unfinished. Like all my paintings. Like me.', 'Every brush stroke costs more than the last. The budget is a stroke too.'],
    pietro: ['The fair is buzzing, wallets are trembling. All according to plan.', 'My songs are priceless. Although a coin finds a price fast.', 'The Renaissance is when everyone suddenly became an artist. Even me.']
  };
  Object.keys(UKL).forEach(id => UKL[id].forEach((line, i) => { translations.uk['guestSay_' + id + '_' + (3 + i)] = line; translations.en['guestSay_' + id + '_' + (3 + i)] = ENL[id][i]; }));
  function sparkPlus2(g, x, y, t) { const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 3 + x)); g.globalAlpha = a; px(g, x, y, 'w'); px(g, x - 1, y, 'y'); px(g, x + 1, y, 'y'); px(g, x, y - 1, 'y'); px(g, x, y + 1, 'y'); g.globalAlpha = 1; }
})();

// Які місця гостей видно зараз (лише для гостей, яких уже зустріли, і лише в їхній епосі): [{ k, id, x, y, w, h }]
function guestStands() {
  const out = [];
  if (!shop || typeof GUEST_IDS === 'undefined') return out;
  const e = viewEpoch() % 8;
  let slot = 0;
  GUEST_IDS.forEach((id, k) => {
    if (GUEST_STAND_EPOCH[id] !== e || !(state.story.guests[k] > 0) || !STANDS[id]) return;
    const S = STANDS[id], x = Math.max(worldL() + S.w / 2 + 6, shop.x - 14 - S.w / 2 - slot * 70);
    out.push({ k, id, x: Math.round(x), y: LAYOUT.streetTop + 24, w: S.w, h: S.h });
    slot++;
  });
  return out;
}
function drawGuestStand(st) { STANDS[st.id].draw(ctx, st.x, st.y, animOn() ? animClock : 0); }
