//#part 151_e_arch_skins.js
/* =====================================================================
   ФАСАДИ СКІНІВ МАГАЗИНУ (р. 78): раніше скін вимикав архітектуру епохи й малював простий плоский фасад,
   тож будівля в скіні виглядала біднішою за звичайну. Тепер кожен скін має власну архітектуру тієї ж якості:
   дах, карниз, вивіска в рамі, кутові стовпи, арки з простінками, пояси між поверхами, фриз, портал і цоколь.
   Реєструється в SKIN_ARCH[назва скіна] = { front, deco } (гачок у buildShopCanvas, 150_c).
   Прорізи вікон лишаються прозорими: інтер'єр зі звірятами й покупцями видно, як і раніше.
   ===================================================================== */
const SKIN_ARCH = {};
(function () {
  const { P, A, D, ramp, mix, masonry } = AR;
  function bays(x0, x1, n, pier) { const bw = (x1 - x0 - (n - 1) * pier) / n, out = []; for (let i = 0; i < n; i++) out.push([Math.round(x0 + i * (bw + pier)), Math.round(bw)]); return out; }

  /* ---------- ДЕРЕВ'ЯНИЙ: різьблений терем (колоди, гонт, геранька, смугастий навіс) ---------- */
  const WD = ['#f4d6a4', '#dcaa6e', '#b47e48', '#83562f', '#4e2f1b'], HN = ['#ffeec0', '#f4c67e', '#cc9048', '#90602c'], SH = ['#9a6236', '#7c4c2a', '#643b20', '#4c2c18', '#2e1a0e'];
  function planks(g, x, y, w, h, seed) {                                         // горизонтальні дошки: світла кромка, темний стик, сучки
    P(g, x, y, w, h, WD[2]);
    for (let yy = y, j = 0; yy < y + h; yy += 4, j++) {
      const hh = Math.min(4, y + h - yy);
      P(g, x, yy, w, 1, WD[1]); if (hh > 2) P(g, x, yy + hh - 1, w, 1, WD[3]);
      const hs = hash2(j * 7 + (seed || 0), y);
      for (let k = x + (hs % 17); k < x + w; k += 19 + (hs % 9)) { P(g, k, yy, 1, hh, WD[4]); P(g, k + 1, yy + 1, 1, Math.max(0, hh - 2), WD[1]); }
      if (hs % 3 === 0 && w > 9 && hh > 2) { const kx = x + 3 + (hs >>> 6) % (w - 6); P(g, kx, yy + 1, 2, 1, WD[3]); }
    }
  }
  function logEnds(g, x, y0, y1) {                                                // кут зрубу: торці колод стовпчиком
    P(g, x, y0, 8, y1 - y0, WD[4]);
    for (let y = y0; y < y1; y += 6) {
      const hh = Math.min(6, y1 - y);
      P(g, x, y, 8, hh, WD[3]); P(g, x, y, 8, 1, WD[2]);
      if (hh >= 5) { D(g, x + 4, y + 3, 2, WD[4]); P(g, x + 2, y + 2, 4, 2, HN[1]); P(g, x + 3, y + 1, 2, 4, HN[1]); P(g, x + 3, y + 2, 2, 2, HN[0]); P(g, x + 4, y + 3, 1, 1, HN[3]); }
    }
  }
  function post(g, x, y0, y1, pw) {                                               // стовп між вікнами: світла кромка, тінь, різьблені капітель і основа
    P(g, x, y0, pw, y1 - y0, WD[3]); P(g, x + 1, y0, pw - 2, y1 - y0, WD[2]); P(g, x + 1, y0, 1, y1 - y0, WD[0]); P(g, x + pw - 2, y0, 1, y1 - y0, WD[3]);
    P(g, x - 1, y0, pw + 2, 1, HN[0]); P(g, x - 1, y0 + 1, pw + 2, 2, HN[2]); P(g, x, y0 + 3, pw, 1, WD[4]);
    P(g, x - 1, y1 - 3, pw + 2, 1, HN[1]); P(g, x - 1, y1 - 2, pw + 2, 2, HN[3]);
    for (let y = y0 + 6; y < y1 - 6; y += 5) { P(g, x + (pw >> 1) - 1, y, 2, 2, WD[4]); P(g, x + (pw >> 1) - 1, y, 1, 1, HN[1]); }      // різьблені ромбики
  }
  function woodArch(g, bx, bw, yTop, ry) {                                         // дерев'яне склепіння над вікном: дошки в кутах, світла різьблена кромка, замковий брусок
    const r = bw / 2;
    for (let i = 0; i < bw; i++) {
      const dx = (i + 0.5 - r) / r, d = Math.round(ry * (1 - Math.sqrt(Math.max(0, 1 - dx * dx))));
      if (d > 0) { P(g, bx + i, yTop, 1, d, WD[2]); for (let k = 3; k < d; k += 4) P(g, bx + i, yTop + k, 1, 1, WD[3]); }
      P(g, bx + i, yTop + d, 1, 1, HN[1]); P(g, bx + i, yTop + d + 1, 1, 1, WD[4]);
    }
    const kx = Math.round(bx + r - 2); P(g, kx, yTop, 4, ry + 2, HN[2]); P(g, kx, yTop, 4, 1, HN[0]); P(g, kx, yTop, 1, ry + 2, HN[1]); P(g, kx + 3, yTop, 1, ry + 2, HN[3]); P(g, kx + 1, yTop + 2, 2, 1, WD[4]);
  }
  function beam(g, y, w) {                                                        // брус між поверхами: кілочки й різьблений зигзаг
    P(g, 0, y, w, 1, WD[0]); P(g, 0, y + 1, w, 3, WD[2]); P(g, 0, y + 4, w, 1, WD[3]); P(g, 0, y + 5, w, 1, WD[4]);
    for (let x = 2; x < w - 2; x += 4) { P(g, x, y + 1 + (x >> 2) % 2, 2, 1, WD[4]); P(g, x, y + 2 + (x >> 2) % 2, 2, 1, HN[1]); }
  }
  function geranium(g, x, y, bw) {                                                 // ящик із геранями
    P(g, x, y + 3, bw, 3, WD[4]); P(g, x + 1, y + 3, bw - 2, 2, WD[2]); P(g, x + 1, y + 3, bw - 2, 1, WD[1]);
    for (let k = 0; k < bw - 3; k += 3) { P(g, x + 1 + k, y, 3, 3, '#3f7a3f'); P(g, x + 1 + k, y - 1 + (k % 2), 2, 2, ['#e8353a', '#ff6a8a', '#e8353a'][(k / 3 | 0) % 3]); P(g, x + 1 + k, y - 1 + (k % 2), 1, 1, '#ffc4c4'); }
  }
  function shingles(g, x0, x1, yT, yB, inset) {                                    // гонтовий дах: ряди дощечок, світлий коник, темний звис
    const H = yB - yT;
    for (let y = yT; y <= yB; y++) {
      const t = H ? (y - yT) / H : 1, lx = Math.round(x0 + inset * (1 - t)), rx = Math.round(x1 - inset * (1 - t)), row = (y - yT) >> 1;
      P(g, lx, y, rx - lx, 1, (y - yT) % 2 ? SH[1] : SH[0]);
      if ((y - yT) % 2) for (let k = lx + 1 + (row % 2) * 2; k < rx - 1; k += 4) P(g, k, y, 1, 1, SH[3]);
      P(g, lx, y, 1, 1, SH[4]); P(g, rx - 1, y, 1, 1, SH[4]);
    }
    P(g, Math.round(x0 + inset), yT, Math.round(x1 - x0 - inset * 2), 1, WD[1]); P(g, x0, yB, x1 - x0, 1, SH[4]);
    A(g, 0.3, () => P(g, x0 + 1, yB + 1, x1 - x0 - 2, 2, '#000000'));
  }
  function woodFront(g, C) {
    const { w, h, look, level, floors, yG, door, innerX, innerW } = C, top = look.top, cx = w >> 1, ground = floors[0], fill = '#5e3a20';
    // ---- дах і вивіска
    const ys = Math.max(0, top - 10), pw = 62;
    shingles(g, 2, w - 2, Math.max(1, top - 9), top + 1, Math.round(w * 0.26));
    const ax0 = cx - (pw >> 1) - 5, aw = pw + 10, ay = ys - 3;
    if (ay >= 0) {                                                                // дерев'яний фронтон під вивіскою
      planks(g, ax0, ay, aw, top - ay, 3); P(g, ax0, ay, aw, 1, WD[0]); P(g, ax0, ay, 1, top - ay, WD[1]); P(g, ax0 + aw - 1, ay, 1, top - ay, WD[3]);
      const rise = Math.min(9, ay - 1);
      for (let i = 0; i < rise; i++) { const half = Math.round((aw / 2 + 3) * (1 - i / (rise + 1))); P(g, cx - half, ay - 1 - i, half * 2, 1, i % 2 ? SH[0] : SH[1]); P(g, cx - half, ay - 1 - i, 2, 1, HN[1]); P(g, cx + half - 2, ay - 1 - i, 2, 1, HN[2]); }
      if (rise >= 4) { P(g, cx - 1, ay - rise - 3, 3, 3, HN[1]); P(g, cx, ay - rise - 5, 1, 2, HN[0]); }      // різьблений коник на вершині
    }
    roofSignG(g, cx, ys, false);
    // різьблений звис: зубці вздовж усього даху
    P(g, 0, top + 2, w, 1, WD[0]); P(g, 0, top + 3, w, 2, WD[2]); for (let x = 1; x < w - 1; x += 4) { P(g, x, top + 5, 3, 1, WD[2]); P(g, x + 1, top + 6, 1, 1, WD[3]); }
    if (level >= 2) [Math.round(w * 0.16), Math.round(w * 0.84)].forEach(dx => {                                 // слухові віконця в гонті
      if (top < 11) return;
      for (let i = 0; i < 4; i++) P(g, dx - 5 + i, top - 7 - i, 11 - i * 2, 1, i % 2 ? SH[0] : SH[1]);
      P(g, dx - 4, top - 7, 9, 7, WD[3]); P(g, dx - 3, top - 6, 7, 6, WD[2]); P(g, dx - 2, top - 5, 5, 4, WD[4]); P(g, dx - 1, top - 4, 3, 3, '#ffd27a'); P(g, dx, top - 4, 1, 3, WD[4]); P(g, dx - 1, top - 3, 3, 1, WD[4]);
    });
    // ---- вивіска в різьбленій рамі (текст накладається HTML-елементом у тому ж місці)
    P(g, 4, top + 7, w - 8, 19, WD[4]); P(g, 5, top + 8, w - 10, 17, WD[1]); P(g, 6, top + 9, w - 12, 15, WD[3]); P(g, 6, top + 9, w - 12, 1, HN[1]); P(g, 7, top + 10, w - 14, 13, fill);
    P(g, 7, top + 10, w - 14, 1, mix(fill, '#000000', 0.35)); P(g, 7, top + 22, w - 14, 1, mix(fill, '#ffffff', 0.12));
    for (let x = 12; x < w - 12; x += 10) { P(g, x, top + 8, 2, 1, HN[0]); P(g, x, top + 24, 2, 1, HN[3]); }
    [[5, top + 8], [w - 7, top + 8], [5, top + 23], [w - 7, top + 23]].forEach(([x, y]) => { P(g, x, y, 2, 2, HN[1]); P(g, x, y, 1, 1, HN[0]); });
    // ---- зруб на кутах
    logEnds(g, 0, top + 7, h - 6); logEnds(g, w - 8, top + 7, h - 6);
    // ---- верхні поверхи
    const n = Math.max(2, Math.round(innerW / 40));
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const bs = bays(innerX, innerX + innerW, n, 6), hF = fl.fy - fl.top;
      beam(g, fl.fy, w);
      P(g, innerX, fl.top - 3, innerW, 3, WD[2]); P(g, innerX, fl.top - 3, innerW, 1, WD[1]);
      bs.forEach(([bx, bw], i) => {
        woodArch(g, bx, bw, fl.top, Math.min(9, Math.round(bw * 0.28)));
        const mx = Math.round(bx + bw / 2);
        P(g, mx, fl.top + 9, 1, hF - 9, WD[4]); A(g, 0.5, () => P(g, mx + 1, fl.top + 9, 1, hF - 9, '#fff'));
        P(g, bx, fl.top + Math.round(hF * 0.42), bw, 1, WD[4]);
        A(g, 0.2, () => { for (let k = 0; k < 8; k++) P(g, bx + 3 + k, fl.top + 12 + (7 - k), 1, 2, '#ffffff'); });
        if (i < bs.length - 1) post(g, bx + bw, fl.top - 3, fl.fy, 6);
        P(g, bx, fl.fy - 2, bw, 2, WD[2]); P(g, bx, fl.fy - 2, bw, 1, WD[0]);
        if ((i + fl.f) % 2 === 0) geranium(g, bx + 3, fl.fy - 8, bw - 6);
      });
    });
    // ---- низ: брус, смугастий навіс із зубцями
    const gy = yG;
    P(g, 0, gy, w, 1, WD[0]); P(g, 0, gy + 1, w, 1, WD[3]);
    for (let x = 2, i = 0; x < w - 2; x += 6, i++) {
      const cw = Math.min(6, w - 2 - x), cl = i % 2 ? ['#fff4dc', '#ecd8ae'] : ['#cf4632', '#a23020'];
      P(g, x, gy + 2, cw, 6, cl[0]); P(g, x, gy + 2, cw, 1, mix(cl[0], '#ffffff', 0.3)); P(g, x, gy + 6, cw, 2, cl[1]);
      P(g, x + 1, gy + 8, Math.max(1, cw - 2), 1, cl[1]); P(g, x + 2, gy + 9, Math.max(1, cw - 4), 1, cl[1]);
    }
    A(g, 0.28, () => P(g, 2, gy + 10, w - 4, 1, '#1a0e08'));
    const dl = door.x - 7, dr2 = door.x + door.w + 2, zoneL = [innerX, dl - 2], zoneR = [dr2 + 7, innerX + innerW];
    [zoneL, zoneR].forEach(z => {
      const m = Math.max(1, Math.round((z[1] - z[0]) / 44));
      bays(z[0], z[1], m, 6).forEach(([bx, bw], i, arr) => {
        woodArch(g, bx, bw, ground.top, Math.min(6, Math.round(bw * 0.2)));
        if (i < arr.length - 1) post(g, bx + bw, ground.top, ground.fy, 6);
        A(g, 0.18, () => { for (let k = 0; k < 7; k++) P(g, bx + 3 + k, ground.top + 9 + (6 - k), 1, 2, '#ffffff'); });
      });
    });
    // портал: два стовпи, брус і дашок із гонту над дверима
    post(g, dl, ground.top - 1, h - 6, 5); post(g, dr2, ground.top - 1, h - 6, 5);
    P(g, dl - 1, ground.top - 2, door.w + 14, 3, WD[2]); P(g, dl - 1, ground.top - 2, door.w + 14, 1, WD[0]); P(g, dl - 1, ground.top, door.w + 14, 1, WD[4]);
    for (let i = 0; i < 5; i++) { P(g, door.x - 4 + i, gy + 5 - i, door.w + 8 - i * 2, 1, i % 2 ? SH[0] : SH[1]); P(g, door.x - 4 + i, gy + 5 - i, 1, 1, HN[1]); P(g, door.x + door.w + 3 - i, gy + 5 - i, 1, 1, HN[2]); }
    P(g, cx - 1, gy, 3, 1, HN[0]);
    // цоколь: рваний камінь
    masonry(g, 0, h - 6, w, 6, ramp('#a59684'), 12, 3, 1); P(g, 0, h - 6, w, 1, '#d8ccbc'); P(g, 0, h - 1, w, 1, '#4a3e34');
    P(g, door.x - 6, h - 3, door.w + 12, 3, WD[1]); P(g, door.x - 6, h - 3, door.w + 12, 1, WD[0]); P(g, door.x - 8, h - 2, door.w + 16, 2, WD[2]); P(g, door.x - 8, h - 2, door.w + 16, 1, WD[0]);
    lanternG(g, door.x - 11, yG + 14); lanternG(g, door.x + door.w + 12, yG + 14);
  }
  function woodDeco(g, C) {
    const { w, h, level, door } = C, by = h - 6;
    // діжки біля входу й поліняниця
    [[door.x - 20, 1], [door.x + door.w + 16, 0]].forEach(([x]) => { P(g, x - 3, by - 8, 7, 8, WD[4]); P(g, x - 2, by - 8, 5, 8, WD[2]); P(g, x - 2, by - 8, 1, 8, WD[1]); P(g, x + 2, by - 8, 1, 8, WD[3]); P(g, x - 3, by - 6, 7, 1, '#3a3a44'); P(g, x - 3, by - 2, 7, 1, '#3a3a44'); P(g, x - 2, by - 9, 5, 1, WD[0]); });
    if (level >= 2) { const lx = 12; for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) { const px = lx + k * 5 + r * 2, py = by - 3 - r * 4; D(g, px + 2, py, 2, WD[4]); P(g, px + 1, py - 1, 3, 2, HN[1]); P(g, px + 2, py, 1, 1, HN[3]); } }
    if (level >= 3) { const rx = w - 18; P(g, rx, by - 4, 8, 4, '#b8603a'); P(g, rx, by - 4, 8, 1, '#d98a5a'); P(g, rx + 3, by - 9, 2, 5, '#3f7a3f'); D(g, rx + 4, by - 11, 3, '#3f7a3f'); P(g, rx + 2, by - 12, 2, 2, '#e8353a'); P(g, rx + 5, by - 10, 2, 2, '#ff6a8a'); }
  }
  SKIN_ARCH.wood = { front: woodFront, deco: woodDeco };
})();
