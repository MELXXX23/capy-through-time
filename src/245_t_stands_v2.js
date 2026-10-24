//#part 245_t_stands_v2.js
/* Гості v2: Піп і Зіна перемальовані (чисті пікселі, 1px контур, більше деталей і руху); решті гостей додано загальний 1px контур і «літаючі» деталі поверх старого малюнка. Зразок: previews/mock10/pair_pip_zina.png */
(() => {
  const rr = Math.round;
  const px = (g, x, y, c) => R(g, rr(x), rr(y), 1, 1, c);
  const rc = (g, x, y, w, h, c) => R(g, rr(x), rr(y), rr(w), rr(h), c);
  const ln = (g, x0, y0, x1, y1, c) => lineG(g, rr(x0), rr(y0), rr(x1), rr(y1), c);
  const box = (g, x, y, w, h, fill, hi, sh) => { x = rr(x); y = rr(y); R(g, x - 1, y - 1, w + 2, h + 2, 'd'); R(g, x, y, w, h, fill); if (hi) R(g, x, y, w, 1, hi); if (sh) R(g, x, y + h - 1, w, 1, sh); };
  const shadow = (g, x, y, w) => { g.globalAlpha = 0.22; R(g, rr(x - w / 2), y, w, 2, 'd'); g.globalAlpha = 1; };
  const glow = (g, x, y, r, c, a) => { for (let i = 3; i >= 1; i--) { g.globalAlpha = a * (4 - i) / 4; disc(g, rr(x), rr(y), r + i * 2, c); } g.globalAlpha = 1; };
  const GL = { A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], R: ['##.', '#.#', '##.', '#.#', '#.#'], C: ['.##', '#..', '#..', '#..', '.##'], L: ['#..', '#..', '#..', '#..', '###'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], E: ['###', '#..', '##.', '#..', '###'] };
  const text = (g, x, y, str, c) => { let cx = x; [...str].forEach(ch => { const gl = GL[ch]; if (!gl) return; gl.forEach((row, j) => { for (let i = 0; i < gl[0].length; i++) if (row[i] === '#') R(g, cx + i, y + j, 1, 1, c); }); cx += GL[ch][0].length + 1; }); };
  function sparkPlus2(g, x, y, t) { const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 3 + x)); g.globalAlpha = a; px(g, x, y, 'w'); px(g, x - 1, y, 'y'); px(g, x + 1, y, 'y'); px(g, x, y - 1, 'y'); px(g, x, y + 1, 'y'); g.globalAlpha = 1; }
  const OUT = '#1d1210';
  const ob = (g, x, y, w, h, c) => { rc(g, x - 1, y - 1, w + 2, h + 2, OUT); rc(g, x, y, w, h, c); };

  /* ---------- Піп (Ретро): джубокс із трубками-бульбашками, платівкою й нотами; бар із тентом, пляшками й неоном ---------- */
  const pipNew = (g, x, y, t) => {
    const jx = x - 20, jl = jx - 12, jt = y - 42, bl = x - 6, INS = [7, 5, 3, 2, 1, 1, 0, 0];
    shadow(g, x, y, 66);
    // джубокс: контур арки, золота арка, червоний корпус, світла й темна грані
    for (let i = 0; i < 42; i++) { const ins = i < 8 ? INS[i] : 0; rc(g, jl + ins, jt + i, 24 - ins * 2, 1, OUT); }
    for (let i = 1; i < 41; i++) { const ins = i < 8 ? INS[i] : 0; rc(g, jl + ins + 1, jt + i, 22 - ins * 2, 1, i < 9 ? 'h' : 'r'); }
    for (let i = 1; i < 9; i++) { const ins = INS[Math.min(i, 7)]; px(g, jl + ins + 1, jt + i, 'y'); px(g, jl + 22 - ins, jt + i, 'o'); }
    rc(g, jl + 3, jt + 3, 18, 1, 'y'); rc(g, jl + 2, jt + 9, 20, 1, 'y');
    rc(g, jl + 1, jt + 10, 1, 29, '#e8776a'); rc(g, jl + 22, jt + 10, 1, 29, '#8a2a24');
    // хромовані стовпчики з трубками-бульбашками, що біжать
    [[jl + 1, 0], [jl + 21, 1]].forEach(([c0, s]) => {
      rc(g, c0 + (s ? -1 : 2), jt + 10, 1, 29, OUT); rc(g, c0, jt + 10, 2, 29, 'Y'); rc(g, c0, jt + 10, 1, 29, 'w');
      for (let i = 0; i < 9; i++) rc(g, c0 + s, jt + 11 + i * 3, 1, 2, ['f', 'y', 'N', 'm', 'o'][(i + s * 2 + Math.floor(t * 5)) % 5]);
    });
    // екран-еквалайзер зі шкалою, пікові точки, відблиск
    ob(g, jl + 6, jt + 5, 12, 11, 'z');
    g.globalAlpha = 0.3; for (let yy = jt + 6; yy < jt + 15; yy += 2) rc(g, jl + 6, yy, 12, 1, 'k'); g.globalAlpha = 1;
    for (let k = 0; k < 4; k++) { const hh = 2 + Math.round((Math.sin(t * 6 + k * 1.3) * 0.5 + 0.5) * 6), bx = jl + 7 + k * 3; rc(g, bx, jt + 15 - hh, 2, hh, ['N', 'm', 'y', 'p', 'N', 'm'][k]); px(g, bx, jt + 14 - hh, 'w'); }
    px(g, jl + 7, jt + 6, 'w'); px(g, jl + 8, jt + 6, 'w'); px(g, jl + 7, jt + 7, 'w');
    // вікно з платівкою, що крутиться, і тонармом
    ob(g, jl + 6, jt + 20, 12, 8, 'k'); rc(g, jl + 6, jt + 20, 12, 1, 'e');
    disc(g, jl + 12, jt + 24, 3, 'e'); disc(g, jl + 12, jt + 24, 2, 'k'); px(g, jl + 12, jt + 24, 'r');
    const a = t * 5; ln(g, jl + 12 + Math.cos(a) * 2, jt + 24 + Math.sin(a) * 2, jl + 12 - Math.cos(a) * 2, jt + 24 - Math.sin(a) * 2, 'Y'); px(g, jl + 12, jt + 24, 'y');
    rc(g, jl + 15, jt + 21, 2, 1, 'Y'); ln(g, jl + 16, jt + 22, jl + 14, jt + 23 + (Math.sin(t * 3) > 0.6 ? 1 : 0), 'w');
    px(g, jl + 7, jt + 21, 'w'); px(g, jl + 8, jt + 21, 'w');
    // кнопки вибору (одна підсвічена), решітка динаміка, цоколь
    for (let k = 0; k < 4; k++) { const bx = jl + 6 + k * 3; rc(g, bx, jt + 31, 2, 3, OUT); rc(g, bx, jt + 31, 2, 2, ['f', 'T', 'y', 'N'][k]); if (Math.floor(t * 3) % 4 === k) { px(g, bx, jt + 31, 'w'); px(g, bx + 1, jt + 32, 'w'); } }
    ob(g, jl + 6, jt + 36, 12, 3, 'k'); rc(g, jl + 7, jt + 36, 10, 1, 'e'); rc(g, jl + 7, jt + 38, 10, 1, 'e');
    rc(g, jl - 1, jt + 40, 26, 2, OUT); rc(g, jl, jt + 40, 24, 1, 'e');
    glow(g, jx, jt + 10, 8, 'y', 0.08 + 0.04 * Math.sin(t * 3));
    // ноти летять угору
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.5 + i / 3) % 1, nx = rr(jl + 5 + i * 6 + Math.sin(t * 2 + i * 2) * 3), ny = rr(jt - 2 - ph * 10), col = ['f', 'N', 'y'][i];
      g.globalAlpha = Math.min(1, ph * 6) * (1 - ph * 0.7); rc(g, nx, ny + 3, 2, 2, col); rc(g, nx + 1, ny - 1, 1, 5, col); rc(g, nx + 1, ny - 1, 2, 1, col); g.globalAlpha = 1;
    }
    // бар: стовпи, неонова вивіска, смугастий тент, пляшки на полиці, стійка, коктейлі, табурети
    ob(g, bl + 5, y - 32, 34, 15, 'P'); rc(g, bl + 5, y - 32, 34, 1, 'V'); rc(g, bl + 6, y - 27, 32, 1, 'h'); rc(g, bl + 6, y - 26, 32, 1, '#7a4a28');
    [[7, 'm', 4], [12, 'y', 3], [17, 'f', 4], [23, 'N', 3], [28, 'a', 4], [33, 'o', 3]].forEach(([dx, c, h]) => { rc(g, bl + dx, y - 27 - h, 3, h, OUT); rc(g, bl + dx, y - 27 - h + 1, 2, h - 1, c); rc(g, bl + dx + 1, y - 27 - h, 1, 1, 'w'); px(g, bl + dx, y - 27 - h + 1, 'w'); });
    [bl + 2, bl + 40].forEach(c0 => { rc(g, c0 - 1, y - 39, 4, 24, OUT); rc(g, c0, y - 39, 2, 24, 'Y'); rc(g, c0, y - 39, 1, 24, 'w'); });
    rc(g, bl - 1, y - 38, 46, 1, OUT);
    for (let i = 0; i < 11; i++) { const c1 = i % 2 ? 'w' : 'f', c2 = i % 2 ? 'E' : 'J'; rc(g, bl + i * 4, y - 37, 4, 4, c1); rc(g, bl + i * 4, y - 34, 4, 1, c2); rc(g, bl + i * 4 + 1, y - 33, 2, 1, c1); rc(g, bl + i * 4 + 1, y - 32, 2, 1, OUT); rc(g, bl + i * 4, y - 37, 1, 3, i % 2 ? '#fff' : '#ff9ac0'); }
    rc(g, bl - 1, y - 37, 1, 5, OUT); rc(g, bl + 44, y - 37, 1, 5, OUT);
    ob(g, bl + 6, y - 46, 32, 7, 'P'); const pulse = 0.65 + 0.35 * Math.sin(t * 4);
    g.globalAlpha = pulse; rc(g, bl + 7, y - 46, 30, 1, 'f'); text(g, bl + 17, y - 45, 'BAR', 'f'); g.globalAlpha = 1;
    rc(g, bl + 9, y - 45, 5, 1, 'q'); rc(g, bl + 10, y - 44, 3, 1, 'q'); px(g, bl + 11, y - 43, 'q'); px(g, bl + 11, y - 42, 'q'); px(g, bl + 12, y - 45, 'g'); px(g, bl + 31, y - 44, Math.floor(t * 4) % 2 ? 'y' : 'w');
    ob(g, bl + 1, y - 17, 42, 2, 'Y'); rc(g, bl + 1, y - 17, 42, 1, 'w');
    rc(g, bl + 2, y - 15, 40, 15, OUT); rc(g, bl + 3, y - 15, 38, 14, 'w'); rc(g, bl + 3, y - 15, 38, 1, 'W'); rc(g, bl + 3, y - 12, 38, 2, 'p'); rc(g, bl + 3, y - 12, 38, 1, 'q'); rc(g, bl + 3, y - 9, 38, 1, 'T'); rc(g, bl + 3, y - 8, 38, 1, 'm');
    for (let i = 0; i < 19; i++) { rc(g, bl + 3 + i * 2, y - 5 + (i % 2) * 2, 2, 2, i % 2 ? 'E' : 'k'); rc(g, bl + 3 + i * 2, y - 3 + (i % 2) * 2, 2, 2, i % 2 ? 'k' : 'E'); }
    rc(g, bl + 2, y - 1, 40, 1, OUT);
    [[6, 'a'], [14, 'q'], [23, 'y'], [33, 'm']].forEach(([dx, col], i) => {
      const gx = bl + dx; rc(g, gx - 1, y - 25, 7, 1, OUT); rc(g, gx, y - 24, 5, 1, 'w'); rc(g, gx, y - 23, 5, 2, col); rc(g, gx + 1, y - 21, 3, 1, col); rc(g, gx + 2, y - 20, 1, 2, 'Y'); rc(g, gx + 1, y - 18, 3, 1, 'Y');
      px(g, gx - 1, y - 24, OUT); px(g, gx + 5, y - 24, OUT); px(g, gx, y - 23, 'w'); px(g, gx + 1, y - 24, i % 2 ? 'r' : 'g');
      rc(g, gx + 3, y - 28, 1, 4, i % 2 ? 'f' : 'r'); rc(g, gx + 3 + (i % 2), y - 29, 3, 1, i % 2 ? 'y' : 'f');
    });
    [8, 20, 32].forEach(dx => { rc(g, bl + dx + 1, y - 5, 1, 4, 'Y'); rc(g, bl + dx - 2, y - 8, 7, 3, OUT); rc(g, bl + dx - 1, y - 7, 5, 2, 'r'); rc(g, bl + dx - 1, y - 7, 5, 1, 'o'); rc(g, bl + dx - 1, y - 1, 3, 1, OUT); });
    sparkPlus2(g, bl + 36, y - 30 + Math.round(Math.sin(t * 2) * 1), t);
  };

  /* ---------- Зіна (Диско): колонки з басом, діскобол, діджейський стіл з платівками, хвилі ---------- */
  const zinaNew = (g, x, y, t) => {
    shadow(g, x, y, 76);
    const beat = Math.sin(t * 7.5), kick = beat > 0.55;
    const spk = (cx, s) => {
      const w = 28, h = 50, L = cx - 14 + (kick ? s : 0), T = y - h, mx = L + 14;
      rc(g, L - 1, T - 1, w + 2, h + 2, OUT); rc(g, L, T, w, h, 'k'); rc(g, L, T, w, 1, 'e'); rc(g, L, T, 1, h, 'z'); rc(g, L + w - 1, T, 1, h, '#0e0a14');
      [[L, T], [L + w - 3, T], [L, y - 3], [L + w - 3, y - 3]].forEach(([cx0, cy0]) => { rc(g, cx0, cy0, 3, 3, 'Y'); px(g, cx0, cy0, 'w'); px(g, cx0 + 1, cy0 + 1, 'e'); });
      for (let i = 0; i < 8; i++) px(g, s > 0 ? L + w - 3 : L + 2, T + 6 + i * 4 + 1, kick || i * 3 < ((t * 9) % 24) ? ['m', 'y', 'f'][Math.min(2, i >> 1 >> 1)] : 'z');
      // високочастотник з рупором
      rc(g, mx - 6, T + 5, 12, 8, OUT); rc(g, mx - 5, T + 6, 10, 6, 'e'); rc(g, mx - 5, T + 6, 10, 1, 'E'); disc(g, mx, T + 9, 2 + (kick ? 1 : 0), 'k'); px(g, mx, T + 9, 'N'); px(g, mx - 1, T + 8, 'w');
      // великий вуфер: хромоване кільце, пружне підвішення, пульсуючий конус
      const cy = T + 30, r = 9 + (kick ? 1 : 0);
      disc(g, mx, cy, r + 2, OUT); disc(g, mx, cy, r + 1, 'Y'); disc(g, mx, cy, r, 'e'); disc(g, mx, cy, r - 2, 'k'); disc(g, mx, cy, r - 3, kick ? 'z' : 'V'); disc(g, mx, cy, Math.max(2, r - 6), kick ? 'N' : 'v'); disc(g, mx, cy, 2, 'k');
      px(g, mx - 2, cy - 1, 'w'); px(g, mx - 3, cy - 2, 'w'); px(g, mx - r, cy - 2, 'w'); px(g, mx - r + 1, cy - 4, 'w');
      if (kick) { g.globalAlpha = 0.5; disc(g, mx, cy, r + 3, 'N'); g.globalAlpha = 1; }
      rc(g, mx - 5, y - 8, 10, 3, OUT); rc(g, mx - 4, y - 7, 8, 1, 'z');                      // фазоінвертор
      rc(g, L + 6, T + 15, 16, 1, 'f'); rc(g, L + 9, T + 16, 10, 1, '#a8286a');               // неонова планка-логотип
    };
    spk(x - 20, -1); spk(x + 20, 1);
    // діскобол на ланцюжку між колонками, грані мерехтять
    const bx = x, by = y - 40; rc(g, bx, y - 52, 1, 7, 'e');
    disc(g, bx, by, 6, OUT); disc(g, bx, by, 5, 'Y');
    for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) if (i * i + j * j <= 25) { const q = (i * 3 + j * 5 + Math.floor(t * 6) + 40) % 6; px(g, bx + i, by + j, q === 0 ? 'w' : q === 1 ? 'a' : q === 2 ? 'Y' : q === 3 ? 'e' : q === 4 ? 'S' : 'E'); }
    px(g, bx - 3, by - 3, 'w'); px(g, bx - 2, by - 3, 'w'); px(g, bx - 3, by - 2, 'w');
    for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.6, rr0 = 8 + (i % 2) * 2; g.globalAlpha = 0.5 + 0.5 * Math.sin(t * 6 + i); px(g, bx + Math.cos(a) * rr0, by + Math.sin(a) * rr0 * 0.8, ['f', 'N', 'y', 'w'][i]); g.globalAlpha = 1; }
    // діджейський стіл: дві вертушки, мікшер із повзунками, ніжки
    ob(g, x - 16, y - 14, 32, 11, 'P'); rc(g, x - 16, y - 14, 32, 1, 'f'); rc(g, x - 16, y - 13, 32, 1, 'v'); rc(g, x - 16, y - 4, 32, 1, 'V');
    [-9, 9].forEach((dx, k) => {
      const cx0 = x + dx, cy0 = y - 8; disc(g, cx0, cy0, 4, OUT); disc(g, cx0, cy0, 3, 'k'); disc(g, cx0, cy0, 1, k ? 'N' : 'f');
      const a = t * 4 * (k ? -1 : 1); ln(g, cx0 + Math.cos(a) * 3, cy0 + Math.sin(a) * 3, cx0 - Math.cos(a) * 1, cy0 - Math.sin(a) * 1, 'Y');
    });
    rc(g, x - 3, y - 12, 6, 7, OUT); rc(g, x - 2, y - 11, 4, 5, 'z');
    for (let i = 0; i < 3; i++) { const hh = 1 + Math.round((Math.sin(t * 9 + i * 1.7) * 0.5 + 0.5) * 3); rc(g, x - 2 + i * 1, y - 7 - hh + 1, 1, hh, ['N', 'm', 'y'][i]); }
    rc(g, x - 14, y - 3, 2, 3, OUT); rc(g, x + 12, y - 3, 2, 3, OUT);
    // звукові хвилі
    for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 3; i++) {
      const ph = (t * 1.9 + i / 3) % 1, rad = 6 + ph * 14, cx = x + s * 20 + s * 8, cy = y - 20;
      g.globalAlpha = (1 - ph) * 0.55;
      for (let a = -1.0; a <= 1.0; a += 0.17) px(g, cx + s * Math.cos(a) * rad * 0.6 + s * ph * 4, cy + Math.sin(a) * rad, i % 2 ? 'N' : 'f');
      g.globalAlpha = 1;
    }
    // неонові смужки зверху
    rc(g, x - 34, y - 54, 26, 2, OUT); rc(g, x - 33, y - 53, 24, 1, 'f'); rc(g, x + 8, y - 54, 26, 2, OUT); rc(g, x + 9, y - 53, 24, 1, 'N');
  };


  /* ---------- Загальний контур 1px: гість малюється на тимчасове полотно, навколо суцільних пікселів лягає темний кант (кольори не міняються) ---------- */
  const OTW = 150, OTH = 120, AX = 75, AY = 104;
  const otc = document.createElement('canvas'); otc.width = OTW; otc.height = OTH; const otg = otc.getContext('2d', { willReadFrequently: true });
  const olc = document.createElement('canvas'); olc.width = OTW; olc.height = OTH; const olg = olc.getContext('2d');
  const outlined = (draw, extra) => (g, x, y, t) => {
    otg.clearRect(0, 0, OTW, OTH); draw(otg, AX, AY, t);
    const d = otg.getImageData(0, 0, OTW, OTH).data, out = olg.createImageData(OTW, OTH), o = out.data;
    for (let j = 1; j < OTH - 1; j++) for (let i = 1; i < OTW - 1; i++) {
      const k = (j * OTW + i) * 4 + 3; if (d[k] >= 200) continue;
      if (d[k - 4] >= 200 || d[k + 4] >= 200 || d[k - OTW * 4] >= 200 || d[k + OTW * 4] >= 200) { o[k - 3] = 29; o[k - 2] = 18; o[k - 1] = 16; o[k] = 255; }
    }
    olg.putImageData(out, 0, 0);
    const ox = rr(x) - AX, oy = rr(y) - AY; g.drawImage(olc, ox, oy); g.drawImage(otc, ox, oy);
    if (extra) extra(g, rr(x), rr(y), t);
  };
  const fade = (g, a) => { g.globalAlpha = Math.max(0, Math.min(1, a)); };
  const twink = (t, k) => Math.sin(t * 3 + k * 1.7) > 0.2;

  const oldMaks = STANDS.maks.draw, oldBitik = STANDS.bitik.draw, oldLesyk = STANDS.lesyk.draw, oldOrbit = STANDS.orbit.draw, oldLumi = STANDS.lumi.draw, oldPietro = STANDS.pietro.draw;
  STANDS.pip.draw = pipNew; STANDS.zina.draw = zinaNew;

  // Макс: бігуть лампочки по контуру, блиск ковзає по склу, квиток гойдається з лотка, зірочки злітають
  STANDS.maks.draw = outlined(oldMaks, (g, x, y, t) => {
    const L = x - 20, T = y - 58;
    for (let i = 0; i < 11; i++) { const on = (i + Math.floor(t * 6)) % 3 === 0; px(g, L - 2, T + 2 + i * 5, on ? 'y' : 'f'); px(g, L + 41, T + 2 + i * 5, on ? 'f' : 'y'); }
    const sw = Math.round(Math.sin(t * 2) * 1); rc(g, L + 5 + sw, y - 12, 2, 7, 'w'); rc(g, L + 5 + sw, y - 10, 2, 1, 'r'); rc(g, L + 5 + sw, y - 7, 2, 1, 'r');
    g.globalAlpha = 0.35; const bx = ((t * 9) % 52) - 10; for (let j = 0; j < 28; j++) { const px0 = L + 4 + bx + j * 0.6; if (px0 > L + 4 && px0 < L + 35) rc(g, px0, T + 12 + j, 2, 1, 'w'); } g.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { const ph = (t * 0.4 + i / 3) % 1; fade(g, 1 - ph); px(g, x - 12 + i * 12 + Math.sin(t * 2 + i) * 2, T - 3 - ph * 7, ['y', 'f', 'N'][i]); px(g, x - 13 + i * 12 + Math.sin(t * 2 + i) * 2, T - 3 - ph * 7, 'w'); g.globalAlpha = 1; }
  });
  // Бітик: пакети даних біжать кабелями, двійкові цифри летять з екрана, промінь сканера
  STANDS.bitik.draw = outlined(oldBitik, (g, x, y, t) => {
    const L = x - 17, T = y - 58, path = [[L + 33, T + 24], [L + 38, T + 34], [L + 36, T + 50]];
    for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i / 4) % 1, s = ph * 2, seg = Math.min(1, Math.floor(s)), k = s - seg, a = path[seg], b = path[seg + 1]; rc(g, a[0] + (b[0] - a[0]) * k - 1, a[1] + (b[1] - a[1]) * k - 1, 2, 2, i % 2 ? 'f' : 'N'); }
    g.globalAlpha = 0.5; rc(g, L + 4, T + 4 + Math.floor((t * 6) % 7), 26, 1, 'a'); g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) { const ph = (t * 0.45 + i / 4) % 1, dx = x - 12 + i * 8 + Math.sin(t + i) * 2, dy = T - 2 - ph * 16; fade(g, Math.min(1, ph * 5) * (1 - ph)); if ((i + Math.floor(t * 2)) % 2) rc(g, dx, dy, 1, 3, 'N'); else { rc(g, dx, dy, 2, 3, 'N'); px(g, dx + 1, dy + 1, 'z'); } g.globalAlpha = 1; }
  });
  // Лесик: дві метелики, пилок і світлячки, листя падає, краплі з лійки, сонечко повзе по горщику
  STANDS.lesyk.draw = outlined(oldLesyk, (g, x, y, t) => {
    const L = x - 30;
    const bf = (bx, by, c1, c2, k) => { const fl = Math.floor(t * 9 + k) % 2; px(g, bx, by, 'd'); px(g, bx - 1, by - fl, c1); px(g, bx + 1, by - fl, c1); px(g, bx - 1, by + 1 - fl, c2); px(g, bx + 1, by + 1 - fl, c2); };
    bf(L + 14 + Math.sin(t * 0.9 + 2) * 12, y - 24 + Math.sin(t * 2.2) * 4, 'y', 'o', 1); bf(L + 46 + Math.sin(t * 0.6) * 10, y - 34 + Math.sin(t * 1.7 + 1) * 3, 'v', 'u', 2);
    for (let i = 0; i < 6; i++) { const ph = (t * 0.25 + i / 6) % 1; fade(g, Math.sin(ph * Math.PI)); px(g, L + 8 + ((i * 11 + ph * 12) % 50), y - 14 - ph * 22 + Math.sin(t * 2 + i) * 2, i % 2 ? 'y' : 'w'); g.globalAlpha = 1; }
    for (let i = 0; i < 2; i++) { const ph = (t * 0.3 + i * 0.5) % 1; fade(g, 1 - ph * 0.5); const lx = L + 18 + i * 22 + Math.sin(ph * 6 + i) * 4, ly = y - 36 + ph * 30; rc(g, lx, ly, 2, 1, 'g'); px(g, lx + 1, ly + 1, 'G'); g.globalAlpha = 1; }
    for (let i = 0; i < 3; i++) { const ph = (t * 1.4 + i / 3) % 1; fade(g, 1 - ph * 0.6); px(g, L + 35 + ph * 3, y - 7 + ph * 7, 'S'); g.globalAlpha = 1; }
    const cx = L + 4 + Math.round(((Math.sin(t * 0.5) + 1) / 2) * 8) - 4; px(g, cx, y - 15, 'r'); px(g, cx + 1, y - 15, 'k');
  });
  // Орбіт: мерехтливі зорі, супутник на орбіті, радар на вежі крутиться, іскри з сопла, комета
  STANDS.orbit.draw = outlined(oldOrbit, (g, x, y, t) => {
    [[-26, -76], [20, -78], [-8, -80], [30, -60], [-30, -50], [34, -72], [12, -70]].forEach(([dx, dy], i) => { if (twink(t, i)) { px(g, x + dx, y + dy, 'w'); if (i % 2) { px(g, x + dx - 1, y + dy, 'y'); px(g, x + dx + 1, y + dy, 'y'); px(g, x + dx, y + dy - 1, 'y'); } } else px(g, x + dx, y + dy, 'S'); });
    const sa = t * 0.9, sx = x + 4 + Math.cos(sa) * 24, sy = y - 44 + Math.sin(sa) * 9 - 8; if (Math.sin(sa) > -0.2) { rc(g, sx - 1, sy, 3, 2, 'Y'); rc(g, sx - 4, sy, 3, 1, 'n'); rc(g, sx + 2, sy, 3, 1, 'n'); px(g, sx, sy - 1, 'r'); }
    const ra = t * 2, tx = x - 17; ln(g, tx + 4, y - 70, tx + 4 + Math.cos(ra) * 5, y - 70 - Math.abs(Math.sin(ra)) * 3, 'Y'); px(g, tx + 4, y - 70, 'r');
    for (let i = 0; i < 5; i++) { const ph = (t * 2.2 + i / 5) % 1, ang = (i % 2 ? 1 : -1) * (0.6 + ph * 1.1); fade(g, 1 - ph); px(g, x + 4 + Math.sin(ang) * (4 + ph * 10), y - 5 + Math.cos(ang) * ph * 8, i % 2 ? 'y' : 'o'); g.globalAlpha = 1; }
    const cp = (t % 9) / 9; if (cp < 0.18) { const k = cp / 0.18; fade(g, 1 - k * 0.4); for (let i = 0; i < 6; i++) px(g, x + 26 - k * 40 + i, y - 68 + k * 16 - i * 0.4, i === 5 ? 'w' : i > 2 ? 'S' : 'a'); g.globalAlpha = 1; }
  });
  // Лумі: світлячки кружляють навколо колеса, блискітки сиплються з кабінок
  STANDS.lumi.draw = outlined(oldLumi, (g, x, y, t) => {
    const hy = y - 36, R0 = 22, ang = t * 0.45, cols = ['f', 'N', 'y', 'm', 'v', 'o'];
    for (let s = 0; s < 6; s++) { const an = ang + s * Math.PI / 3, gx = x + Math.cos(an) * R0, gy = hy + Math.sin(an) * R0; for (let k = 0; k < 3; k++) { const ph = (t * 0.9 + s * 0.3 + k / 3) % 1; fade(g, (1 - ph) * 0.9); px(g, gx + Math.sin(t * 3 + k + s) * 2, gy + 11 + ph * 9, cols[(s + k) % 6]); g.globalAlpha = 1; } }
    for (let i = 0; i < 5; i++) { const a = t * (0.7 + i * 0.13) + i * 1.3, r = 27 + (i % 3) * 5; fade(g, 0.5 + 0.5 * Math.sin(t * 5 + i)); px(g, x + Math.cos(a) * r, hy + Math.sin(a) * r * 0.9, 'y'); px(g, x + Math.cos(a) * r + 1, hy + Math.sin(a) * r * 0.9, 'w'); g.globalAlpha = 1; }
    if (twink(t, 4)) { px(g, x, hy - 5, 'w'); px(g, x - 1, hy - 5, 'f'); px(g, x + 1, hy - 5, 'f'); }
  });
  // П'єтро: бульбашки бажань здіймаються з води, пелюстки падають, голуб пролітає, золоті блиски
  STANDS.pietro.draw = outlined(oldPietro, (g, x, y, t) => {
    for (let i = 0; i < 5; i++) { const ph = (t * 0.35 + i / 5) % 1; fade(g, Math.sin(ph * Math.PI) * 0.9); const bx = x - 20 + i * 10 + Math.sin(t * 2 + i) * 2, by = y - 16 - ph * 26; px(g, bx, by, 'S'); px(g, bx + 1, by, 'w'); px(g, bx, by + 1, 'a'); g.globalAlpha = 1; }
    for (let i = 0; i < 6; i++) { const ph = (t * 0.2 + i / 6) % 1, sd = i % 2 ? 1 : -1; fade(g, Math.sin(ph * Math.PI)); const pxx = x + sd * (28 + (i % 3) * 3) + Math.sin(ph * 7 + i) * 3, pyy = y - 40 + ph * 36; rc(g, pxx, pyy, 2, 1, i % 3 ? 'q' : 'p'); px(g, pxx + 1, pyy + 1, 'f'); g.globalAlpha = 1; }
    const dp = (t % 14) / 14; if (dp < 0.7) { const k = dp / 0.7, bx = x - 40 + k * 80, by = y - 66 + Math.sin(k * 6) * 3, wf = Math.floor(t * 8) % 2; rc(g, bx, by, 4, 2, 'w'); px(g, bx + 4, by, 'e'); px(g, bx + 4, by + 1, 'o'); px(g, bx + 1, by - 1 - wf, 'w'); px(g, bx + 2, by - 1 - wf, 'W'); px(g, bx, by + 2, 'E'); }
    [[-22, 'h'], [8, 'y'], [20, 'h']].forEach(([dx, c], i) => { if (twink(t, i + 6)) { px(g, x + dx, y - 15, 'w'); px(g, x + dx - 1, y - 16, c); px(g, x + dx + 1, y - 16, c); px(g, x + dx, y - 17, 'w'); } });
  });
})();
