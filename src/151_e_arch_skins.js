//#part 151_e_arch_skins.js
/* =====================================================================
   ФАСАДИ СКІНІВ МАГАЗИНУ (р. 78): раніше скін вимикав архітектуру епохи й малював простий плоский фасад,
   тож будівля в скіні виглядала біднішою за звичайну. Тепер кожен скін має власну архітектуру тієї ж якості:
   дах, карниз, вивіска в рамі, кутові стовпи, арки з простінками, пояси між поверхами, фриз, портал і цоколь.
   skinFront — спільний каркас (та сама геометрія, що в епох), тема T дає матеріали й мотиви.
   Реєструється в SKIN_ARCH[назва скіна] = { front, deco } (гачок у buildShopCanvas, 150_c).
   Прорізи вікон лишаються прозорими: інтер'єр зі звірятами й покупцями видно, як і раніше.
   ===================================================================== */
const SKIN_ARCH = {};
(function () {
  const { P, A, D, ramp, mix } = AR;
  const HS = (a, b) => hash2(a * 31 + 7, b * 17 + 3);
  function bays(x0, x1, n, pier) { const bw = (x1 - x0 - (n - 1) * pier) / n, out = []; for (let i = 0; i < n; i++) out.push([Math.round(x0 + i * (bw + pier)), Math.round(bw)]); return out; }
  const paint = (g, x, y, w, h, T) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) P(g, xx, yy, 1, 1, T.tex(xx, yy)); };
  const plus = (g, x, y, c, mid) => { P(g, x - 1, y, 3, 1, c); P(g, x, y - 1, 1, 3, c); P(g, x, y, 1, 1, mid); };

  /* ---------- спільні частини (типові варіанти; тема може замінити будь-яку) ---------- */
  const DEF = {
    archKind: 'round',
    tex(x, y) { return this.M[2]; },
    roofRow(g, lx, rx, y, k) { const S = this.S; P(g, lx, y, rx - lx, 1, k % 2 ? S[1] : S[0]); if (k % 2) for (let i = lx + 1 + ((k >> 1) % 2) * 2; i < rx - 1; i += 4) P(g, i, y, 1, 1, S[3]); },
    gableRow(g, cx, half, y, i) { const S = this.S, Ac = this.A; P(g, cx - half, y, half * 2, 1, i % 2 ? S[0] : S[1]); P(g, cx - half, y, 2, 1, Ac[1]); P(g, cx + half - 2, y, 2, 1, Ac[2]); },
    dormer(g, dx, top) {
      const S = this.S, M = this.M;
      for (let i = 0; i < 4; i++) P(g, dx - 5 + i, top - 7 - i, 11 - i * 2, 1, i % 2 ? S[0] : S[1]);
      P(g, dx - 4, top - 7, 9, 7, M[3]); P(g, dx - 3, top - 6, 7, 6, M[2]); P(g, dx - 2, top - 5, 5, 4, M[4]); P(g, dx - 1, top - 4, 3, 3, this.lamp || '#ffd27a'); P(g, dx, top - 4, 1, 3, M[4]); P(g, dx - 1, top - 3, 3, 1, M[4]);
    },
    eave(g, w, top) { const M = this.M; P(g, 0, top + 2, w, 1, M[0]); P(g, 0, top + 3, w, 2, M[2]); for (let x = 1; x < w - 1; x += 4) { P(g, x, top + 5, 3, 1, M[2]); P(g, x + 1, top + 6, 1, 1, M[3]); } },
    corner(g, x, y0, y1) {                                                        // кутова кладка
      const M = this.M;
      for (let y = y0, j = 0; y < y1; y += 6, j++) { const hh = Math.min(6, y1 - y), bw = j % 2 ? 8 : 5, bx = x < 40 ? x : x + 8 - bw; P(g, x, y, 8, hh, M[3]); P(g, bx, y, bw, hh, M[2]); P(g, bx, y, bw, 1, M[0]); P(g, bx, y, 1, hh, M[1]); P(g, bx, y + hh - 1, bw, 1, M[3]); P(g, bx + bw - 1, y, 1, hh, M[3]); }
    },
    post(g, x, y0, y1, pw) {                                                      // пілястра між вікнами
      const M = this.M, Ac = this.A;
      P(g, x, y0, pw, y1 - y0, M[3]); P(g, x + 1, y0, pw - 2, y1 - y0, M[2]); P(g, x + 1, y0, 1, y1 - y0, M[0]); P(g, x + pw - 2, y0, 1, y1 - y0, M[3]);
      P(g, x - 1, y0, pw + 2, 1, Ac[0]); P(g, x - 1, y0 + 1, pw + 2, 2, Ac[2]); P(g, x, y0 + 3, pw, 1, M[4]);
      P(g, x - 1, y1 - 3, pw + 2, 1, Ac[1]); P(g, x - 1, y1 - 2, pw + 2, 2, Ac[3]);
    },
    archRim(g, x, y) { P(g, x, y, 1, 1, this.A[1]); P(g, x, y + 1, 1, 1, this.M[4]); },
    keystone(g, kx, yTop, ry) { const Ac = this.A; P(g, kx, yTop, 4, ry + 2, Ac[2]); P(g, kx, yTop, 4, 1, Ac[0]); P(g, kx, yTop, 1, ry + 2, Ac[1]); P(g, kx + 3, yTop, 1, ry + 2, Ac[3]); },
    beam(g, y, w) { const M = this.M; P(g, 0, y, w, 1, M[0]); P(g, 0, y + 1, w, 3, M[2]); P(g, 0, y + 4, w, 1, M[3]); P(g, 0, y + 5, w, 1, M[4]); },
    sill(g, bx, bw, fy) { const M = this.M; P(g, bx, fy - 2, bw, 2, M[2]); P(g, bx, fy - 2, bw, 1, M[0]); },
    mullion: null,
    box() {},
    frieze(g, gy, w) {                                                            // смугастий навіс із зубцями
      const M = this.M, AW = this.awn;
      P(g, 0, gy, w, 1, M[0]); P(g, 0, gy + 1, w, 1, M[3]);
      for (let x = 2, i = 0; x < w - 2; x += 6, i++) {
        const cw = Math.min(6, w - 2 - x), cl = AW[i % 2];
        P(g, x, gy + 2, cw, 6, cl[0]); P(g, x, gy + 2, cw, 1, mix(cl[0], '#ffffff', 0.3)); P(g, x, gy + 6, cw, 2, cl[1]);
        P(g, x + 1, gy + 8, Math.max(1, cw - 2), 1, cl[1]); P(g, x + 2, gy + 9, Math.max(1, cw - 4), 1, cl[1]);
      }
      A(g, 0.28, () => P(g, 2, gy + 10, w - 4, 1, '#1a0e08'));
    },
    portalTop(g, door, gy, cx) { const S = this.S, Ac = this.A; for (let i = 0; i < 5; i++) { P(g, door.x - 4 + i, gy + 5 - i, door.w + 8 - i * 2, 1, i % 2 ? S[0] : S[1]); P(g, door.x - 4 + i, gy + 5 - i, 1, 1, Ac[1]); P(g, door.x + door.w + 3 - i, gy + 5 - i, 1, 1, Ac[2]); } P(g, cx - 1, gy, 3, 1, Ac[0]); },
    base(g, w, h, door) {
      const B = this.B; AR.masonry(g, 0, h - 6, w, 6, B, 12, 3, 1); P(g, 0, h - 6, w, 1, B[0]); P(g, 0, h - 1, w, 1, B[4]);
      P(g, door.x - 6, h - 3, door.w + 12, 3, B[1]); P(g, door.x - 6, h - 3, door.w + 12, 1, B[0]); P(g, door.x - 8, h - 2, door.w + 16, 2, B[2]); P(g, door.x - 8, h - 2, door.w + 16, 1, B[0]);
    },
    lantern(g, door, yG) { lanternG(g, door.x - 11, yG + 14); lanternG(g, door.x + door.w + 12, yG + 14); },
    roofExtra() {},
    deco() {}
  };
  const theme = o => Object.assign({}, DEF, o);

  function skinFront(g, C, T) {
    const { es, w, h, look, level, floors, yG, door, innerX, innerW } = C, top = look.top, cx = w >> 1, ground = floors[0], M = T.M, Ac = T.A, S = T.S, fill = T.fill || es.signFill || 'd';
    // ---- дах
    const ys = Math.max(0, top - 10), pw = 62, yT = Math.max(1, top - 9), yB = top + 1, inset = Math.round(w * 0.26), HR = yB - yT;
    for (let y = yT; y <= yB; y++) {
      const t = HR ? (y - yT) / HR : 1, lx = Math.round(2 + inset * (1 - t)), rx = Math.round(w - 2 - inset * (1 - t));
      T.roofRow(g, lx, rx, y, y - yT);
      P(g, lx, y, 1, 1, S[4]); P(g, rx - 1, y, 1, 1, S[4]);
    }
    P(g, Math.round(2 + inset), yT, Math.round(w - 4 - inset * 2), 1, T.ridge || Ac[1]); P(g, 2, yB, w - 4, 1, S[4]);
    A(g, 0.3, () => P(g, 3, yB + 1, w - 6, 2, '#000000'));
    const ax0 = cx - (pw >> 1) - 5, aw = pw + 10, ay = ys - 3;
    if (ay >= 0) {                                                                // фронтон під дахову вивіску
      paint(g, ax0, ay, aw, top - ay, T); P(g, ax0, ay, aw, 1, M[0]); P(g, ax0, ay, 1, top - ay, M[1]); P(g, ax0 + aw - 1, ay, 1, top - ay, M[3]);
      const rise = Math.min(9, ay - 1);
      for (let i = 0; i < rise; i++) T.gableRow(g, cx, Math.round((aw / 2 + 3) * (1 - i / (rise + 1))), ay - 1 - i, i);
      if (rise >= 4 && T.finial) T.finial(g, cx, ay - rise - 1);
    }
    roofSignG(g, cx, ys, false);
    T.eave(g, w, top);
    if (level >= 2 && top >= 11) [Math.round(w * 0.16), Math.round(w * 0.84)].forEach(dx => T.dormer(g, dx, top));
    T.roofExtra(g, C);
    // ---- вивіска в рамі (текст накладається HTML-елементом у тому ж місці)
    P(g, 4, top + 7, w - 8, 19, M[4]); P(g, 5, top + 8, w - 10, 17, M[1]); P(g, 6, top + 9, w - 12, 15, M[3]); P(g, 6, top + 9, w - 12, 1, Ac[1]); P(g, 7, top + 10, w - 14, 13, fill);
    P(g, 7, top + 10, w - 14, 1, mix(fill, '#000000', 0.35)); P(g, 7, top + 22, w - 14, 1, mix(fill, '#ffffff', 0.12));
    for (let x = 12; x < w - 12; x += 10) { P(g, x, top + 8, 2, 1, Ac[0]); P(g, x, top + 24, 2, 1, Ac[3]); }
    [[5, top + 8], [w - 7, top + 8], [5, top + 23], [w - 7, top + 23]].forEach(([x, y]) => { P(g, x, y, 2, 2, Ac[1]); P(g, x, y, 1, 1, Ac[0]); });
    // ---- кути на всю висоту
    T.corner(g, 0, top + 7, h - 6); T.corner(g, w - 8, top + 7, h - 6);
    // ---- верхні поверхи: вікна-арки між пілястрами
    const n = Math.max(2, Math.round(innerW / 40));
    const arch = (bx, bw, yTop, ry, i) => {
      const r = bw / 2;
      for (let k = 0; k < bw; k++) {
        const dx = (k + 0.5 - r) / r, d = T.archKind === 'gothic' ? Math.round(ry * 1.7 * (1 - Math.sqrt(Math.max(0, 1 - Math.abs(dx))))) : Math.round(ry * (1 - Math.sqrt(Math.max(0, 1 - dx * dx))));
        if (d > 0) for (let q = 0; q < d; q++) P(g, bx + k, yTop + q, 1, 1, T.tex(bx + k, yTop + q));
        T.archRim(g, bx + k, yTop + d);
      }
      T.keystone(g, Math.round(bx + r - 2), yTop, ry, i);
    };
    floors.forEach(fl => {
      if (fl.f === 0) return;
      const bs = bays(innerX, innerX + innerW, n, 6), hF = fl.fy - fl.top;
      T.beam(g, fl.fy, w, fl);
      paint(g, innerX, fl.top - 3, innerW, 3, T); P(g, innerX, fl.top - 3, innerW, 1, M[1]);
      bs.forEach(([bx, bw], i) => {
        arch(bx, bw, fl.top, Math.min(9, Math.round(bw * 0.28)), i);
        const mx = Math.round(bx + bw / 2), mc = T.mullion || M[4];
        P(g, mx, fl.top + 9, 1, hF - 9, mc); A(g, 0.5, () => P(g, mx + 1, fl.top + 9, 1, hF - 9, '#fff'));
        P(g, bx, fl.top + Math.round(hF * 0.42), bw, 1, mc);
        A(g, 0.2, () => { for (let k = 0; k < 8; k++) P(g, bx + 3 + k, fl.top + 12 + (7 - k), 1, 2, '#ffffff'); });
        if (i < bs.length - 1) T.post(g, bx + bw, fl.top - 3, fl.fy, 6, fl.f + i);
        T.sill(g, bx, bw, fl.fy);
        if ((i + fl.f) % 2 === 0) T.box(g, bx + 3, fl.fy - 8, bw - 6, i + fl.f);
      });
    });
    // ---- низ: фриз, вітрини, портал, цоколь
    T.frieze(g, yG, w, C);
    const dl = door.x - 7, dr2 = door.x + door.w + 2, zoneL = [innerX, dl - 2], zoneR = [dr2 + 7, innerX + innerW];
    [zoneL, zoneR].forEach(z => {
      if (z[1] - z[0] < 12) return;
      const m = Math.max(1, Math.round((z[1] - z[0]) / 44));
      bays(z[0], z[1], m, 6).forEach(([bx, bw], i, arr) => {
        arch(bx, bw, ground.top, Math.min(6, Math.round(bw * 0.2)), i + 1);
        if (i < arr.length - 1) T.post(g, bx + bw, ground.top, ground.fy, 6, i);
        A(g, 0.18, () => { for (let k = 0; k < 7; k++) P(g, bx + 3 + k, ground.top + 9 + (6 - k), 1, 2, '#ffffff'); });
      });
    });
    T.post(g, dl, ground.top - 1, h - 6, 5, 0); T.post(g, dr2, ground.top - 1, h - 6, 5, 1);
    P(g, dl - 1, ground.top - 2, door.w + 14, 3, M[2]); P(g, dl - 1, ground.top - 2, door.w + 14, 1, M[0]); P(g, dl - 1, ground.top, door.w + 14, 1, M[4]);
    T.portalTop(g, door, yG, cx);
    T.base(g, w, h, door);
    T.lantern(g, door, yG);
  }
  const reg = (name, T) => { SKIN_ARCH[name] = { front: (g, C) => skinFront(g, C, T), deco: (g, C) => T.deco(g, C) }; return T; };

  /* ---------- ДЕРЕВ'ЯНИЙ: різьблений терем (колоди, гонт, геранька, смугастий навіс) ---------- */
  const WD = ['#f4d6a4', '#dcaa6e', '#b47e48', '#83562f', '#4e2f1b'], HN = ['#ffeec0', '#f4c67e', '#cc9048', '#90602c'], SH = ['#9a6236', '#7c4c2a', '#643b20', '#4c2c18', '#2e1a0e'];
  const WOOD = {
    M: WD, A: HN, S: SH, B: ramp('#a59684'), ridge: WD[1], awn: [['#cf4632', '#a23020'], ['#fff4dc', '#ecd8ae']], fill: '#5e3a20',
    tex(x, y) { const r = y >> 2, yy = y & 3, hs = HS(r, 5); if (yy === 0) return WD[1]; if (yy === 3) return WD[3]; if ((x + hs) % 23 === 0) return WD[4]; if ((x + hs) % 23 === 1) return WD[1]; return WD[2]; },
    corner(g, x, y0, y1) {                                                        // зруб: торці колод стовпчиком
      P(g, x, y0, 8, y1 - y0, WD[4]);
      for (let y = y0; y < y1; y += 6) {
        const hh = Math.min(6, y1 - y);
        P(g, x, y, 8, hh, WD[3]); P(g, x, y, 8, 1, WD[2]);
        if (hh >= 5) { D(g, x + 4, y + 3, 2, WD[4]); P(g, x + 2, y + 2, 4, 2, HN[1]); P(g, x + 3, y + 1, 2, 4, HN[1]); P(g, x + 3, y + 2, 2, 2, HN[0]); P(g, x + 4, y + 3, 1, 1, HN[3]); }
      }
    },
    post(g, x, y0, y1, pw) {
      DEF.post.call(this, g, x, y0, y1, pw);
      for (let y = y0 + 6; y < y1 - 6; y += 5) { P(g, x + (pw >> 1) - 1, y, 2, 2, WD[4]); P(g, x + (pw >> 1) - 1, y, 1, 1, HN[1]); }
    },
    keystone(g, kx, yTop, ry) { DEF.keystone.call(this, g, kx, yTop, ry); P(g, kx + 1, yTop + 2, 2, 1, WD[4]); },
    beam(g, y, w) { DEF.beam.call(this, g, y, w); for (let x = 2; x < w - 2; x += 4) { P(g, x, y + 1 + (x >> 2) % 2, 2, 1, WD[4]); P(g, x, y + 2 + (x >> 2) % 2, 2, 1, HN[1]); } },
    box(g, x, y, bw) {                                                            // ящик із геранями
      P(g, x, y + 3, bw, 3, WD[4]); P(g, x + 1, y + 3, bw - 2, 2, WD[2]); P(g, x + 1, y + 3, bw - 2, 1, WD[1]);
      for (let k = 0; k < bw - 3; k += 3) { P(g, x + 1 + k, y, 3, 3, '#3f7a3f'); P(g, x + 1 + k, y - 1 + (k % 2), 2, 2, ['#e8353a', '#ff6a8a', '#e8353a'][(k / 3 | 0) % 3]); P(g, x + 1 + k, y - 1 + (k % 2), 1, 1, '#ffc4c4'); }
    },
    finial(g, cx, y) { P(g, cx - 1, y - 2, 3, 3, HN[1]); P(g, cx, y - 4, 1, 2, HN[0]); },
    deco(g, C) {
      const { w, h, level, door } = C, by = h - 6;
      [door.x - 20, door.x + door.w + 16].forEach(x => { P(g, x - 3, by - 8, 7, 8, WD[4]); P(g, x - 2, by - 8, 5, 8, WD[2]); P(g, x - 2, by - 8, 1, 8, WD[1]); P(g, x + 2, by - 8, 1, 8, WD[3]); P(g, x - 3, by - 6, 7, 1, '#3a3a44'); P(g, x - 3, by - 2, 7, 1, '#3a3a44'); P(g, x - 2, by - 9, 5, 1, WD[0]); });
      if (level >= 2) { const lx = 12; for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) { const px = lx + k * 5 + r * 2, py = by - 3 - r * 4; D(g, px + 2, py, 2, WD[4]); P(g, px + 1, py - 1, 3, 2, HN[1]); P(g, px + 2, py, 1, 1, HN[3]); } }
      if (level >= 3) { const rx = w - 18; P(g, rx, by - 4, 8, 4, '#b8603a'); P(g, rx, by - 4, 8, 1, '#d98a5a'); P(g, rx + 3, by - 9, 2, 5, '#3f7a3f'); D(g, rx + 4, by - 11, 3, '#3f7a3f'); P(g, rx + 2, by - 12, 2, 2, '#e8353a'); P(g, rx + 5, by - 10, 2, 2, '#ff6a8a'); }
    }
  };
  reg('wood', theme(WOOD));

  /* ---------- ЦУКЕРКОВИЙ: пряниковий будиночок (шоколадний дах, глазур, колони-льодяники) ---------- */
  const CM = ['#ffffff', '#ffe4ef', '#ffc4da', '#ee97ba', '#a8527c'], CA = ['#ffffff', '#fff0f6', '#ff8fbc', '#c43d78'];
  const CDOT = ['#ffd23f', '#52c4ff', '#7ad66a', '#ff6fa8', '#b48aff', '#ff9a4a'];
  reg('candy', theme({
    M: CM, A: CA, S: ['#a56a44', '#84502f', '#6b3e24', '#532f1a', '#351c0f'], B: ['#fff0c4', '#f0cf8e', '#d9a05a', '#b87a3a', '#7a4e24'], ridge: '#ffffff', awn: [['#ff8fbc', '#e0609a'], ['#ffffff', '#f2d4e2']], lamp: '#ffe9a0',
    tex(x, y) { return (x + ((y / 6 | 0) % 2) * 3) % 6 === 0 && y % 6 === 2 ? '#ffffff' : (x + ((y / 6 | 0) % 2) * 3) % 6 === 1 && y % 6 === 2 ? CM[1] : CM[2]; },
    roofRow(g, lx, rx, y, k) { DEF.roofRow.call(this, g, lx, rx, y, k); if (k % 2 === 0) for (let i = lx + 3 + (HS(k, 2) % 5); i < rx - 3; i += 11) P(g, i, y, 2, 1, CDOT[(i + k) % 6]); },       // посипка на шоколаді
    gableRow(g, cx, half, y, i) { P(g, cx - half, y, half * 2, 1, i % 2 ? '#84502f' : '#a56a44'); P(g, cx - half, y, 2, 1, '#ffffff'); P(g, cx + half - 2, y, 2, 1, '#ffffff'); },
    finial(g, cx, y) { D(g, cx, y - 2, 2, '#e8353a'); P(g, cx - 1, y - 3, 1, 1, '#ffb0b0'); P(g, cx + 1, y - 6, 1, 3, '#3f7a3f'); },        // вишенька
    eave(g, w, top) {                                                             // біла глазур стікає з даху
      P(g, 0, top + 2, w, 2, '#ffffff'); P(g, 0, top + 4, w, 1, '#ffe4ef');
      for (let x = 0; x < w; x += 3) { const L = 1 + HS(x, 7) % 3; P(g, x, top + 5, 2, L, '#ffffff'); P(g, x + 1, top + 5, 1, L, '#ffe4ef'); }
    },
    corner(g, x, y0, y1) {                                                        // колона-льодяник
      for (let y = y0; y < y1; y++) for (let k = 0; k < 8; k++) { const red = ((k + y) % 8) < 4; let c = red ? '#e8434f' : '#ffffff'; if (k === 0) c = red ? '#a82a3a' : '#c8a0b0'; else if (k === 7) c = red ? '#8a2030' : '#a8809a'; else if (k === 1) c = red ? '#ff7a80' : '#ffffff'; P(g, x + k, y, 1, 1, c); }
    },
    post(g, x, y0, y1, pw) {                                                      // білий стовпчик із рожевою спіраллю й мармеладкою
      for (let y = y0; y < y1; y++) for (let k = 0; k < pw; k++) { const pk = ((k + y) % 6) < 2; let c = pk ? '#ff8fbc' : '#ffffff'; if (k === 0) c = pk ? '#d9608f' : '#e8c8d6'; else if (k === pw - 1) c = pk ? '#b84a78' : '#d0a8bc'; P(g, x + k, y, 1, 1, c); }
      P(g, x - 1, y0, pw + 2, 1, '#ffffff'); P(g, x - 1, y0 + 1, pw + 2, 2, '#ffc4da'); P(g, x, y0 + 3, pw, 1, CM[4]); P(g, x - 1, y1 - 3, pw + 2, 1, '#ffffff'); P(g, x - 1, y1 - 2, pw + 2, 2, '#ee97ba');
    },
    archRim(g, x, y) { P(g, x, y, 1, 1, '#ffffff'); P(g, x, y + 1, 1, 1, CM[3]); },
    keystone(g, kx, yTop) { P(g, kx, yTop + 1, 4, 3, '#ff5f8f'); P(g, kx + 1, yTop, 2, 1, '#ff5f8f'); P(g, kx + 1, yTop + 1, 1, 1, '#ffc4d8'); P(g, kx, yTop + 4, 4, 1, '#a8527c'); },       // мармеладка
    beam(g, y, w) {                                                               // вафля з глазур'ю
      P(g, 0, y, w, 2, '#ffffff'); P(g, 0, y + 2, w, 3, '#e8b878'); P(g, 0, y + 5, w, 1, '#a8703c');
      for (let x = 0; x < w; x += 3) { P(g, x, y + 2, 1, 3, '#c98f52'); const L = HS(x, y) % 3; if (L) { P(g, x + 1, y + 2, 2, L, '#ffffff'); } }
      for (let x = 2; x < w - 2; x += 9) P(g, x, y, 2, 1, CDOT[(x / 9 | 0) % 6]);
    },
    box(g, x, y, bw) {                                                            // цукерки в рядок
      P(g, x, y + 4, bw, 2, '#ffffff'); P(g, x, y + 5, bw, 1, '#ee97ba');
      for (let k = 2; k < bw - 2; k += 6) { const c = CDOT[(k + x) % 6]; D(g, x + k, y + 2, 2, c); P(g, x + k - 1, y + 1, 1, 1, '#ffffff'); }
    },
    portalTop(g, door, gy, cx) { for (let i = 0; i < 5; i++) { P(g, door.x - 4 + i, gy + 5 - i, door.w + 8 - i * 2, 1, i % 2 ? '#84502f' : '#a56a44'); P(g, door.x - 4 + i, gy + 5 - i, 2, 1, '#ffffff'); P(g, door.x + door.w + 2 - i, gy + 5 - i, 2, 1, '#ffffff'); } D(g, cx, gy - 1, 2, '#e8353a'); P(g, cx - 1, gy - 2, 1, 1, '#ffb0b0'); },
    base(g, w, h, door) {                                                         // вафельний цоколь із глазур'ю
      P(g, 0, h - 6, w, 6, '#d9a05a'); for (let x = 0; x < w; x += 4) P(g, x, h - 6, 1, 6, '#b87a3a'); P(g, 0, h - 4, w, 1, '#b87a3a'); P(g, 0, h - 2, w, 1, '#b87a3a'); P(g, 0, h - 6, w, 1, '#ffffff'); P(g, 0, h - 1, w, 1, '#7a4e24');
      P(g, door.x - 6, h - 3, door.w + 12, 3, '#ffe4ef'); P(g, door.x - 6, h - 3, door.w + 12, 1, '#ffffff'); P(g, door.x - 8, h - 2, door.w + 16, 2, '#ffc4da'); P(g, door.x - 8, h - 2, door.w + 16, 1, '#ffffff');
    },
    roofExtra(g, C) {
      const { w, look, level } = C, top = look.top;
      if (top >= 16) [Math.round(w * 0.3), Math.round(w * 0.7)].forEach((x, i) => lollipopG(g, x, top + 1, i ? 'n' : 'f', 'w'));
      if (level >= 4) [14, w - 14].forEach((x, i) => lollipopG(g, x, top + 1, i ? 'f' : 'g', 'w'));
    },
    deco(g, C) {
      const { w, h, door, level } = C;
      ['f', 'm', 'y', 'u'].forEach((c, i) => { const gx = 12 + i * 8; if (gx < door.x - 22) gumdropG(g, gx, h - 7, c); });
      ['y', 'f', 'm', 'u'].forEach((c, i) => { const gx = door.x + door.w + 22 + i * 8; if (gx < w - 12) gumdropG(g, gx, h - 7, c); });
      if (level >= 2) { bigLollipopG(g, door.x - 18, h - 7, h - 25, 5); bigLollipopG(g, door.x + door.w + 16, h - 7, h - 25, 5); }
    }
  }));

  /* ---------- ЗОЛОТИЙ: палац із золотими панелями, каннелюрами, меандром і малиновим оксамитом ---------- */
  const GM = ['#fff6c8', '#ffe27a', '#e8b53c', '#b9842a', '#6e4a14'], GA = ['#ffffff', '#fff2b8', '#f2c230', '#a86f12'];
  const GEM = (g, x, y, c, hi) => { P(g, x - 1, y, 3, 1, c); P(g, x, y - 1, 1, 3, c); P(g, x, y, 1, 1, hi); };
  reg('gold', theme({
    M: GM, A: GA, S: ['#ffe9a0', '#f4c84c', '#d9a02e', '#a8741a', '#6a4510'], B: ramp('#4a3a52'), ridge: '#ffffff', awn: [['#b3202e', '#7a1420'], ['#f2c230', '#b9842a']], lamp: '#fff6c8', mullion: '#a86f12',
    tex(x, y) { const u = x % 14, v = y % 10; if (u === 0 || v === 9) return GM[3]; if (v === 0 || u === 1) return GM[1]; if ((x + y * 2) % 23 === 0) return GM[0]; return GM[2]; },
    finial(g, cx, y) { P(g, cx - 4, y - 1, 9, 2, '#f2c230'); P(g, cx - 4, y - 4, 1, 3, '#f2c230'); P(g, cx, y - 5, 1, 4, '#f2c230'); P(g, cx + 4, y - 4, 1, 3, '#f2c230'); P(g, cx - 2, y - 3, 1, 2, '#f2c230'); P(g, cx + 2, y - 3, 1, 2, '#f2c230'); P(g, cx - 4, y, 9, 1, '#a86f12'); P(g, cx, y - 6, 1, 1, '#e8353a'); P(g, cx - 4, y - 5, 1, 1, '#33e6ff'); P(g, cx + 4, y - 5, 1, 1, '#33e6ff'); arrowShine(cx, y - 4, true); },       // корона
    corner(g, x, y0, y1) {                                                        // колона з каннелюрами
      const fl = [GM[3], GM[0], GM[2], GM[3], GM[1], GM[2], GM[3], GM[4]];
      for (let k = 0; k < 8; k++) P(g, x + k, y0, 1, y1 - y0, fl[k]);
      for (let y = y0 + 14; y < y1 - 8; y += 18) { P(g, x, y, 8, 2, GA[2]); P(g, x, y, 8, 1, GA[0]); GEM(g, x + 4, y + 5, '#e8353a', '#ffc4c4'); arrowShine(x + 4, y + 5, false); }
      P(g, x, y0, 8, 2, GA[0]); P(g, x, y1 - 2, 8, 2, GM[3]);
    },
    post(g, x, y0, y1, pw) {
      DEF.post.call(this, g, x, y0, y1, pw);
      for (let k = x + 2; k < x + pw - 2; k += 2) P(g, k, y0 + 4, 1, y1 - y0 - 8, GM[3]);
      const my = Math.round((y0 + y1) / 2); GEM(g, x + (pw >> 1), my, '#3a7ae8', '#bfe0ff'); arrowShine(x + (pw >> 1), my, false);
    },
    archRim(g, x, y) { P(g, x, y, 1, 1, '#ffffff'); P(g, x, y + 1, 1, 1, GM[3]); },
    keystone(g, kx, yTop, ry) { P(g, kx - 1, yTop, 6, 2, GA[2]); P(g, kx - 1, yTop, 6, 1, GA[0]); P(g, kx, yTop + 2, 4, Math.max(1, ry - 1), GA[2]); GEM(g, kx + 2, yTop + 2, '#e8353a', '#ffc4c4'); arrowShine(kx + 2, yTop + 2, true); },
    beam(g, y, w) {                                                               // меандр
      P(g, 0, y, w, 1, GM[0]); P(g, 0, y + 1, w, 3, GM[1]); P(g, 0, y + 4, w, 1, GM[3]); P(g, 0, y + 5, w, 1, GM[4]);
      for (let x = 0; x < w; x += 6) { P(g, x, y + 1, 4, 1, GM[3]); P(g, x + 3, y + 1, 1, 3, GM[3]); P(g, x + 1, y + 3, 3, 1, GM[3]); P(g, x + 1, y + 2, 1, 1, GM[3]); }
    },
    box(g, x, y, bw) {                                                            // золота балюстрада
      P(g, x, y + 1, bw, 1, GA[0]); P(g, x, y + 2, bw, 1, GA[2]); for (let k = x + 1; k < x + bw - 1; k += 3) { P(g, k, y + 3, 2, 2, GM[2]); P(g, k, y + 3, 1, 2, GM[0]); } P(g, x, y + 5, bw, 1, GM[3]);
    },
    frieze(g, gy, w, C) {
      DEF.frieze.call(this, g, gy, w, C);
      for (let x = 3; x < w - 3; x += 3) P(g, x, gy + 9, 1, 2, x % 6 === 0 ? '#ffe27a' : '#b9842a');
    },
    roofExtra(g, C) {
      const { w, look, level } = C, top = look.top;
      const urn = (x, y) => { P(g, x - 2, y - 1, 5, 1, GM[3]); P(g, x - 1, y - 2, 3, 1, GM[2]); P(g, x - 3, y - 5, 7, 3, GM[1]); P(g, x - 3, y - 5, 1, 3, GM[0]); P(g, x + 3, y - 5, 1, 3, GM[3]); P(g, x - 1, y - 6, 3, 1, GM[0]); P(g, x, y - 8, 1, 2, '#e8353a'); arrowShine(x, y - 5, false); };
      if (top >= 16) [Math.round(w * 0.29), Math.round(w * 0.71)].forEach(x => urn(x, top + 1));
      if (level >= 3) [12, w - 12].forEach(x => urn(x, top + 1));
      for (let x = 20; x < w - 20; x += 16) arrowShine(x, top + 3, false);
    },
    deco(g, C) {
      const { w, h, door, level } = C;
      coinStackG(g, door.x - 18, h - 7, 4); coinStackG(g, door.x + door.w + 16, h - 7, 3);
      if (level >= 2) { goldBarsG(g, 12, h - 7); coinStackG(g, w - 14, h - 7, 5); }
      if (level >= 4) gemG(g, door.x - 30, h - 13, 'r', 'J');
    }
  }));

  /* ---------- ДІАМАНТОВИЙ: кришталевий палац (грані, шпилі, сапфіровий дах) ---------- */
  const DM = ['#ffffff', '#e4f7ff', '#b4e4fa', '#7cc0e8', '#3d6fa8'], DA = ['#ffffff', '#d8f6ff', '#33e6ff', '#2a8ac0'];
  const facet = (x, y) => { const CELL = 6, u = Math.floor(x / CELL), v = Math.floor(y / CELL), tri = (x % CELL) + (y % CELL) < CELL ? 0 : 1, k = HS(u * 3 + tri, v * 5 + tri); return [DM[1], DM[2], DM[2], DM[0], DM[3], DM[2], DM[1]][k % 7]; };
  const DIAM = {
    M: DM, A: DA, S: ['#9fd4f8', '#6aa8e4', '#4a86cc', '#335fa4', '#1c3a70'], B: ramp('#2f4a8c'), ridge: '#ffffff', awn: [['#7cc0e8', '#4f94cc'], ['#ffffff', '#d4ecf8']], lamp: '#d8f6ff', mullion: '#3d6fa8', tex: facet,
    roofRow(g, lx, rx, y, k) { const S = this.S; P(g, lx, y, rx - lx, 1, k % 2 ? S[1] : S[0]); for (let i = lx + 1 + ((k >> 1) % 2) * 3; i < rx - 1; i += 6) { P(g, i, y, 1, 1, S[3]); if (HS(i, k) % 5 === 0) P(g, i + 2, y, 1, 1, '#ffffff'); } },
    finial(g, cx, y) { P(g, cx - 2, y - 2, 5, 2, '#33e6ff'); P(g, cx - 1, y - 3, 3, 1, '#ffffff'); P(g, cx - 1, y, 3, 1, '#2a8ac0'); P(g, cx, y + 1, 1, 1, '#2a8ac0'); P(g, cx, y - 6, 1, 3, '#d8f6ff'); arrowShine(cx, y - 2, true); },
    corner(g, x, y0, y1) {                                                        // стовп із гранованих кристалів
      for (let y = y0; y < y1; y += 8) {
        const hh = Math.min(8, y1 - y);
        for (let j = 0; j < hh; j++) for (let k = 0; k < 8; k++) { const dx = Math.abs(k - 3.5), dy = Math.abs(j - 3.5), m = dx + dy; P(g, x + k, y + j, 1, 1, m > 5 ? DM[4] : m > 3.6 ? (k + j < 7 ? DM[2] : DM[3]) : (k + j < 7 ? DM[0] : DM[1])); }
        if (hh >= 8) { P(g, x + 3, y + 3, 2, 2, '#33e6ff'); P(g, x + 3, y + 3, 1, 1, '#ffffff'); arrowShine(x + 4, y + 4, false); }
      }
    },
    post(g, x, y0, y1, pw) {
      P(g, x, y0, 1, y1 - y0, DM[3]); P(g, x + 1, y0, 2, y1 - y0, DM[0]); P(g, x + 3, y0, pw - 4, y1 - y0, DM[2]); P(g, x + pw - 1, y0, 1, y1 - y0, DM[4]);
      for (let y = y0 + 6; y < y1 - 4; y += 7) { P(g, x + 1, y, pw - 2, 1, DM[3]); P(g, x + 1, y + 1, pw - 3, 1, DM[0]); }
      P(g, x - 1, y0, pw + 2, 1, DA[0]); P(g, x - 1, y0 + 1, pw + 2, 2, DA[2]); P(g, x, y0 + 3, pw, 1, DM[4]); P(g, x - 1, y1 - 3, pw + 2, 1, DA[1]); P(g, x - 1, y1 - 2, pw + 2, 2, DA[3]);
    },
    archRim(g, x, y) { P(g, x, y, 1, 1, '#ffffff'); P(g, x, y + 1, 1, 1, DM[3]); },
    keystone(g, kx, yTop) { P(g, kx, yTop, 4, 1, '#ffffff'); P(g, kx - 1, yTop + 1, 6, 2, '#33e6ff'); P(g, kx, yTop + 1, 2, 1, '#ffffff'); P(g, kx, yTop + 3, 4, 1, '#2a8ac0'); P(g, kx + 1, yTop + 4, 2, 1, '#2a8ac0'); arrowShine(kx + 2, yTop + 1, true); },
    beam(g, y, w) {
      P(g, 0, y, w, 1, '#ffffff'); P(g, 0, y + 1, w, 3, DM[3]); P(g, 0, y + 4, w, 1, DM[4]); P(g, 0, y + 5, w, 1, '#1c3a70');
      for (let x = 2; x < w - 2; x += 6) { const c = (x / 6 | 0) % 3 === 0 ? '#33e6ff' : (x / 6 | 0) % 3 === 1 ? '#ffffff' : '#ffb0e8'; P(g, x, y + 2, 3, 1, c); P(g, x + 1, y + 1, 1, 3, c); }
    },
    box(g, x, y, bw) {                                                            // друзи кристалів
      P(g, x, y + 5, bw, 1, DM[4]);
      for (let k = 1; k < bw - 1; k += 3) { const H = 2 + HS(k, x) % 4; P(g, x + k, y + 5 - H, 2, H, k % 2 ? DM[2] : DM[1]); P(g, x + k, y + 5 - H, 1, H, '#ffffff'); P(g, x + k + 1, y + 5 - H, 1, 1, '#33e6ff'); }
    },
    frieze(g, gy, w, C) {
      DEF.frieze.call(this, g, gy, w, C);
      for (let x = 4; x < w - 4; x += 7) { const L = 2 + HS(x, 9) % 3; P(g, x, gy + 10, 2, L, '#d8f6ff'); P(g, x, gy + 10 + L, 1, 1, '#ffffff'); }       // бурульки-кристали
    },
    roofExtra(g, C) {
      const { w, look, level } = C, top = look.top;
      const spire = (x, y, H) => { for (let i = 0; i < H; i++) { const hw = Math.max(0, Math.round((H - i) * 0.34)); P(g, x - hw, y - i, hw + 1, 1, '#ffffff'); P(g, x + 1, y - i, hw, 1, '#7cc0e8'); } P(g, x, y - H, 1, 1, '#33e6ff'); arrowShine(x, y - H + 2, false); };
      if (top >= 16) [Math.round(w * 0.3), Math.round(w * 0.7)].forEach(x => spire(x, top + 1, 9));
      if (level >= 3) [10, w - 10].forEach(x => spire(x, top + 1, 11));
      for (let x = 24; x < w - 24; x += 18) arrowShine(x, top + 3, false);
    },
    deco(g, C) {
      const { w, h, door, level } = C;
      const cluster = (x, H) => { [[0, H], [-3, H - 3], [3, H - 2]].forEach(([dx, hh]) => { P(g, x + dx - 1, h - 7 - hh, 3, hh, '#b4e4fa'); P(g, x + dx - 1, h - 7 - hh, 1, hh, '#ffffff'); P(g, x + dx, h - 8 - hh, 1, 1, '#ffffff'); P(g, x + dx + 1, h - 7 - hh, 1, hh, '#7cc0e8'); }); P(g, x - 4, h - 7, 9, 1, '#3d6fa8'); };
      cluster(door.x - 18, 9); cluster(door.x + door.w + 17, 7);
      if (level >= 2) { cluster(13, 8); cluster(w - 13, 10); }
      if (level >= 3) { gemG(g, door.x - 32, h - 12, 'N', 'a'); gemG(g, door.x + door.w + 30, h - 12, 'f', 'q'); }
    }
  };
  reg('diamond', theme(DIAM));

  /* ---------- САДОВИЙ: оранжерея в плющі (зелений дах у квітах, альтанки, квіти з кожного ящика) ---------- */
  const SM = ['#fffdf0', '#f7f3d8', '#ece6bc', '#c4bd8c', '#74704a'], SA = ['#ffffff', '#fbf7e4', '#d8dcb4', '#7a9a5a'], LEAF = ['#7fc06a', '#5a9f50', '#3f7f42', '#2f6236'], FL = ['#ff6a8a', '#ffd84f', '#ffffff', '#b48aff', '#ff9a4a'];
  const leaves = (g, x, y, k) => { P(g, x, y, 2, 2, LEAF[k % 3]); P(g, x, y, 1, 1, LEAF[0]); };
  const GARDEN = {
    M: SM, A: SA, S: ['#86c070', '#62a256', '#4a8a4a', '#336a3a', '#1e4628'], B: ramp('#9a9a7e'), ridge: '#a8dc8a', awn: [['#6ab06a', '#4a8a4f'], ['#fdf8e0', '#e4dcb8']], lamp: '#ffe9a0', mullion: '#5a6e3e', flower: FL,
    tex(x, y) { const h0 = HS(x, y); if (h0 % 37 === 0) return SM[1]; if (h0 % 41 === 0) return SM[3]; return SM[2]; },
    roofRow(g, lx, rx, y, k) { const S = this.S, F = this.flower; P(g, lx, y, rx - lx, 1, k % 2 ? S[1] : S[0]); for (let i = lx + 1; i < rx - 1; i += 3) { const h0 = HS(i, k * 3 + 1); if (h0 % 3 === 0) P(g, i, y, 1, 1, S[3]); if (h0 % 17 === 0) P(g, i, y, 2, 1, F[h0 % F.length]); } },      // моховий дах із квітами
    gableRow(g, cx, half, y, i) { const S = this.S; P(g, cx - half, y, half * 2, 1, i % 2 ? S[0] : S[1]); P(g, cx - half, y, 2, 1, SA[0]); P(g, cx + half - 2, y, 2, 1, SA[0]); },
    finial(g, cx, y) { const F = this.flower; P(g, cx, y - 3, 1, 4, LEAF[2]); plus(g, cx, y - 5, F[0], F[1]); P(g, cx + 1, y - 2, 2, 1, LEAF[1]); },
    eave(g, w, top) { DEF.eave.call(this, g, w, top); const F = this.flower; for (let x = 1; x < w - 1; x += 2) { const L = HS(x, 3) % 4; if (L) P(g, x, top + 2, 2, L, LEAF[(x >> 1) % 3]); if (HS(x, 8) % 11 === 0) P(g, x, top + 2 + L, 1, 1, F[x % F.length]); } },     // плющ звисає зі звису
    corner(g, x, y0, y1) {                                                        // біла решітка, а по ній в'ється плющ
      const F = this.flower;
      P(g, x, y0, 8, y1 - y0, SM[1]); P(g, x, y0, 1, y1 - y0, SM[3]); P(g, x + 7, y0, 1, y1 - y0, SM[4]);
      for (let y = y0; y < y1; y++) for (let k = 1; k < 7; k++) if ((k + y) % 6 === 0 || (k - y + 600) % 6 === 0) P(g, x + k, y, 1, 1, SM[3]);
      for (let y = y0; y < y1 - 1; y += 2) { const dx = Math.round(3.5 + Math.sin(y * 0.42 + x) * 2.6); leaves(g, x + dx, y, y >> 1); if (HS(y, x) % 7 === 0) plus(g, x + dx, y, F[y % F.length], '#ffd84f'); }
    },
    post(g, x, y0, y1, pw, i) {
      const F = this.flower;
      DEF.post.call(this, g, x, y0, y1, pw);
      for (let y = y0 + 4; y < y1 - 3; y += 2) { const dx = Math.round((pw - 2) / 2 + Math.sin(y * 0.55 + (i || 0)) * (pw / 2 - 1)); P(g, x + dx, y, 2, 2, LEAF[(y >> 1) % 3]); if (HS(y, x + 1) % 9 === 0) P(g, x + dx, y, 1, 1, F[y % F.length]); }
    },
    archRim(g, x, y) { P(g, x, y, 1, 1, '#ffffff'); const h0 = HS(x, y); if (h0 % 3 === 0) P(g, x, y + 1, 1, 1 + h0 % 2, LEAF[h0 % 3]); else P(g, x, y + 1, 1, 1, SM[4]); },
    keystone(g, kx, yTop) { const F = this.flower; plus(g, kx + 2, yTop + 2, F[0], F[1]); P(g, kx - 1, yTop + 3, 2, 1, LEAF[1]); P(g, kx + 4, yTop + 3, 2, 1, LEAF[1]); },
    beam(g, y, w) {
      const F = this.flower;
      P(g, 0, y, w, 1, SM[0]); P(g, 0, y + 1, w, 2, SM[2]); P(g, 0, y + 3, w, 1, SM[3]); P(g, 0, y + 4, w, 1, SM[4]);
      for (let x = 0; x < w; x += 2) { const L = HS(x, y) % 6; if (L) P(g, x, y + 2, 2, L, LEAF[(x >> 1) % 3]); if (HS(x, y + 1) % 13 === 0) plus(g, x, y + 2 + L, F[x % F.length], '#ffd84f'); }
    },
    box(g, x, y, bw) {                                                            // квіти переливаються через край
      const F = this.flower;
      P(g, x, y + 3, bw, 3, '#7a4a2a'); P(g, x + 1, y + 3, bw - 2, 1, '#a06a3a');
      for (let k = 0; k < bw; k += 2) { P(g, x + k, y + 1 + (k % 4 === 0 ? 0 : 1), 2, 2, LEAF[k % 3]); if ((k + x) % 3 === 0) P(g, x + k, y - (k % 4 === 0 ? 1 : 0), 2, 2, F[(k + x) % F.length]); if (k % 6 === 0) P(g, x + k, y + 5, 1, 2, LEAF[1]); }
    },
    frieze(g, gy, w, C) {
      DEF.frieze.call(this, g, gy, w, C);
      const F = this.flower; for (let x = 10; x < w - 10; x += 26) { P(g, x, gy + 10, 1, 2, '#74704a'); D(g, x, gy + 13, 2, LEAF[1]); P(g, x - 1, gy + 12, 1, 1, F[0]); P(g, x + 1, gy + 13, 1, 1, F[1]); P(g, x, gy + 14, 1, 1, F[2]); }       // кошики з квітами
    },
    base(g, w, h, door) { DEF.base.call(this, g, w, h, door); for (let x = 0; x < w; x += 2) if (HS(x, 4) % 3 === 0) P(g, x, h - 6, 2, 1 + HS(x, 6) % 2, LEAF[x % 3]); },
    roofExtra(g, C) {
      const { w, look, level } = C, top = look.top, F = this.flower;
      const sun = (x, y) => { P(g, x, y - 8, 1, 8, LEAF[2]); P(g, x + 1, y - 4, 2, 1, LEAF[1]); D(g, x, y - 10, 2, '#ffd84f'); P(g, x, y - 10, 1, 1, '#7a4a2a'); };
      if (top >= 16) [Math.round(w * 0.3), Math.round(w * 0.7)].forEach(x => sun(x, top + 1));
      if (level >= 3) [12, w - 12].forEach(x => { P(g, x - 3, top - 3, 7, 4, '#b8603a'); P(g, x - 3, top - 3, 7, 1, '#d98a5a'); P(g, x, top - 7, 1, 4, LEAF[2]); D(g, x, top - 8, 2, LEAF[1]); P(g, x - 1, top - 9, 1, 1, F[0]); P(g, x + 1, top - 8, 1, 1, F[1]); });
    },
    deco(g, C) {
      const { w, h, door, level } = C, by = h - 6;
      const tree = (x, c) => { P(g, x - 3, by - 5, 7, 5, '#b8603a'); P(g, x - 3, by - 5, 7, 1, '#d98a5a'); P(g, x, by - 10, 1, 5, '#6a4a30'); D(g, x, by - 14, 4, '#2e5a34'); D(g, x - 1, by - 15, 3, '#4f8a4a'); P(g, x - 2, by - 14, 1, 1, c); P(g, x + 2, by - 12, 1, 1, c); P(g, x, by - 17, 1, 1, c); };
      tree(door.x - 20, '#ffe04a'); tree(door.x + door.w + 19, '#ff6a8a');
      if (level >= 2) for (let x = 8; x < door.x - 28; x += 7) tulipG(g, x, h - 7, ['f', 'y', 'q', 'o'][(x / 7 | 0) % 4]);
      if (level >= 2) for (let x = door.x + door.w + 28; x < w - 8; x += 7) tulipG(g, x, h - 7, ['y', 'f', 'o', 'q'][(x / 7 | 0) % 4]);
      butterflyG(g, 26, C.look.top + 30, 'p', 'w'); if (level >= 2) butterflyG(g, w - 26, C.look.top + 26, 'y', 'o');
    }
  };
  reg('garden', theme(GARDEN));

  /* ---------- РІЗДВЯНИЙ: червона цегла під снігом, хвоя з вогниками, вінки, бурульки ---------- */
  const XM = ['#ee9c88', '#d6715c', '#bc4a3c', '#8c3228', '#561c16'], XA = ['#ffffff', '#f6f2ea', '#dcd4c4', '#9a9080'], BULB = ['#ff4a4a', '#ffd84f', '#4ad0ff', '#7ae06a'];
  const icicles = (g, x0, x1, y, step, seed) => { for (let x = x0; x < x1; x += step) { const L = 1 + HS(x, seed || 1) % 4; P(g, x, y, 2, L, '#e4f4ff'); P(g, x, y, 1, L, '#ffffff'); P(g, x, y + L, 1, 1, '#b4dcf4'); } };
  const garland = (g, x0, x1, y, seed) => { for (let x = x0; x < x1; x += 2) { const dy = Math.round(Math.sin(x * 0.3) * 1); P(g, x, y + dy, 2, 2, ['#2f6b48', '#3f8a58', '#245a3c'][(x >> 1) % 3]); if (HS(x, seed || 2) % 5 === 0) P(g, x, y + dy, 1, 1, BULB[(x >> 1) % 4]); } };
  reg('xmas', theme({
    M: XM, A: XA, S: ['#ffffff', '#eef4fc', '#d4e4f4', '#9fb8d4', '#4a3a3e'], B: ramp('#8a8a94'), ridge: '#ffffff', awn: [['#d23a3a', '#9c2a2a'], ['#ffffff', '#e4ecf4']], lamp: '#ffe9a0', mullion: '#561c16',
    tex(x, y) { const r = y >> 2, xx = (x + (r % 2) * 4) % 8, yy = y & 3; if (yy === 3 || xx === 7) return '#7a2c22'; if (yy === 0) return XM[1]; return HS(r, (x + (r % 2) * 4) >> 3) % 5 === 0 ? XM[3] : XM[2]; },
    roofRow(g, lx, rx, y, k) { P(g, lx, y, rx - lx, 1, k % 2 ? '#eef4fc' : '#ffffff'); if (k > 1) for (let i = lx + 1 + ((k >> 1) % 2) * 2; i < rx - 1; i += 7) P(g, i, y, 2, 1, HS(i, k) % 3 ? '#d4e4f4' : '#8a3a30'); },     // дах під снігом
    gableRow(g, cx, half, y, i) { P(g, cx - half, y, half * 2, 1, i < 3 ? '#ffffff' : '#eef4fc'); P(g, cx - half, y, 1, 1, '#b4c8dc'); P(g, cx + half - 1, y, 1, 1, '#b4c8dc'); },
    finial(g, cx, y) { P(g, cx - 2, y - 2, 5, 1, '#ffd84f'); P(g, cx - 1, y - 3, 3, 3, '#ffd84f'); P(g, cx, y - 4, 1, 5, '#ffd84f'); P(g, cx, y - 2, 1, 1, '#ffffff'); },       // зірка
    eave(g, w, top) { P(g, 0, top + 2, w, 2, '#ffffff'); P(g, 0, top + 4, w, 1, '#d4e4f4'); icicles(g, 2, w - 2, top + 5, 5, 3); },
    corner(g, x, y0, y1) {                                                        // білий камінь, по ньому хвоя з вогниками
      DEF.corner.call(Object.assign({}, this, { M: ['#ffffff', '#f6f2ea', '#e8e0d0', '#b0a898', '#6a6258'] }), g, x, y0, y1);
      for (let y = y0; y < y1 - 1; y += 2) { const dx = Math.round(3 + Math.sin(y * 0.5 + x) * 3); P(g, x + dx, y, 2, 2, ['#2f6b48', '#3f8a58'][(y >> 1) % 2]); if ((y >> 1) % 3 === 0) P(g, x + dx, y, 1, 1, BULB[(y >> 1) % 4]); }
    },
    post(g, x, y0, y1, pw, i) {
      P(g, x, y0, pw, y1 - y0, '#b0a898'); P(g, x + 1, y0, pw - 2, y1 - y0, '#f6f2ea'); P(g, x + 1, y0, 1, y1 - y0, '#ffffff'); P(g, x + pw - 2, y0, 1, y1 - y0, '#dcd4c4');
      for (let y = y0 + 3; y < y1 - 2; y++) if ((y + (i || 0) * 2) % 8 < 3) P(g, x + 1, y, pw - 2, 1, '#d23a3a');                        // червона стрічка
      P(g, x - 1, y0, pw + 2, 2, '#ffffff'); P(g, x, y0 + 2, pw, 1, '#d4e4f4'); P(g, x - 1, y1 - 2, pw + 2, 2, '#b0a898');
    },
    archRim(g, x, y) { P(g, x, y, 1, 1, '#ffffff'); P(g, x, y + 1, 1, 1, '#b0a898'); },
    keystone(g, kx, yTop) { D(g, kx + 2, yTop + 3, 3, '#2f6b48'); D(g, kx + 2, yTop + 3, 1, '#bc4a3c'); P(g, kx + 2, yTop + 3, 1, 1, '#561c16'); P(g, kx, yTop + 1, 1, 1, '#ff4a4a'); P(g, kx + 4, yTop + 1, 1, 1, '#ffd84f'); P(g, kx + 1, yTop + 6, 3, 1, '#d23a3a'); },        // вінок
    beam(g, y, w, fl) { P(g, 0, y, w, 2, '#ffffff'); P(g, 0, y + 2, w, 1, '#d4e4f4'); P(g, 0, y + 3, w, 2, '#e8e0d0'); P(g, 0, y + 5, w, 1, '#6a6258'); garland(g, 0, w, y + 3, fl.f + 2); icicles(g, 3, w - 3, y + 6, 9, fl.f + 5); },
    box(g, x, y, bw) {                                                            // ящик у снігу з гостролистом
      P(g, x, y + 3, bw, 3, '#6a4a30'); P(g, x, y + 2, bw, 2, '#ffffff'); P(g, x, y + 4, bw, 1, '#d4e4f4');
      for (let k = 2; k < bw - 2; k += 5) { P(g, x + k, y, 3, 2, '#2f6b48'); P(g, x + k + 1, y + 1, 1, 1, '#ff4a4a'); }
    },
    frieze(g, gy, w, C) { DEF.frieze.call(this, g, gy, w, C); P(g, 2, gy + 2, w - 4, 1, '#ffffff'); for (let x = 2; x < w - 2; x += 3) if (HS(x, gy) % 2) P(g, x, gy + 3, 3, 1, '#ffffff'); icicles(g, 5, w - 5, gy + 10, 8, 7); },
    portalTop(g, door, gy, cx) { DEF.portalTop.call(this, g, door, gy, cx); D(g, cx, gy + 2, 4, '#2f6b48'); D(g, cx, gy + 2, 2, '#d23a3a'); P(g, cx, gy + 2, 1, 1, '#ffffff'); P(g, cx - 3, gy, 1, 1, '#ffd84f'); P(g, cx + 3, gy + 4, 1, 1, '#4ad0ff'); },
    base(g, w, h, door) { DEF.base.call(this, g, w, h, door); for (let x = 0; x < w; x += 5) { if (x > door.x - 8 && x < door.x + door.w + 8) continue; const H = 1 + HS(x, 12) % 3; P(g, x, h - 5 - H, 7, H + 1, '#ffffff'); P(g, x + 1, h - 6 - H, 5, 1, '#ffffff'); P(g, x, h - 4, 7, 1, '#d4e4f4'); } },
    roofExtra(g, C) {
      const { w, look, level } = C, top = look.top;
      const ch = (x, y) => { P(g, x - 3, y - 7, 7, 8, '#561c16'); P(g, x - 2, y - 6, 5, 7, XM[2]); P(g, x - 2, y - 4, 5, 1, '#7a2c22'); P(g, x - 3, y - 9, 7, 3, '#ffffff'); P(g, x - 2, y - 10, 5, 1, '#ffffff'); A(g, 0.5, () => { P(g, x, y - 13, 2, 2, '#e8eef4'); P(g, x + 2, y - 16, 3, 2, '#e8eef4'); }); };
      if (top >= 16) ch(Math.round(w * 0.3), top - 1);
      if (level >= 3) ch(Math.round(w * 0.72), top - 2);
    },
    deco(g, C) {
      const { w, h, door, level } = C;
      treeXmasG(g, door.x + door.w + 18, h - 7); giftG(g, door.x - 24, h - 7, 9, 7, 'r'); giftG(g, door.x - 34, h - 7, 8, 5, 'n');
      candyCaneG(g, door.x - 9, h - 7, 10); candyCaneG(g, door.x + door.w + 7, h - 7, 8);
      if (level >= 2) { snowmanG(g, 14, h - 7); giftG(g, w - 26, h - 7, 8, 6, 'g'); giftG(g, w - 18, h - 7, 7, 5, 'r'); }
    }
  }));

  /* ---------- ХЕЛЛОВІН: готичний замок (стрілчасті вікна, контрфорси, помаранчеве світло, шпилі) ---------- */
  const HM = ['#8e7cac', '#6e5e8e', '#524674', '#3a3158', '#231c38'], HA = ['#ffd27a', '#ff9e3c', '#e8701e', '#8a3a10'];
  reg('halloween', theme({
    M: HM, A: HA, S: ['#4e3e70', '#3e305e', '#30244c', '#20183a', '#120c24'], B: ramp('#3e3650'), ridge: '#6e5e8e', awn: [['#e8701e', '#b04e12'], ['#2a2040', '#181028']], archKind: 'gothic', lamp: '#ff9e3c', mullion: '#120c24',
    tex(x, y) { const r = (y / 5) | 0, xx = (x + (r % 2) * 5) % 10, yy = y % 5; if (yy === 4 || xx === 9) return HM[3]; if (yy === 0) return HM[1]; const h0 = HS(r, (x + (r % 2) * 5) / 10 | 0); if (h0 % 11 === 0 && xx > 2 && xx < 7) return '#3f5a3a'; return h0 % 5 === 0 ? HM[3] : HM[2]; },
    gableRow(g, cx, half, y, i) { P(g, cx - half, y, half * 2, 1, i % 2 ? '#3e305e' : '#4e3e70'); P(g, cx - half, y, 2, 1, '#1e1634'); P(g, cx + half - 2, y, 2, 1, '#1e1634'); },
    finial(g, cx, y) { P(g, cx, y - 6, 1, 7, '#1e1634'); P(g, cx - 2, y - 3, 5, 1, '#1e1634'); D(g, cx, y - 8, 2, '#e8701e'); P(g, cx - 1, y - 8, 1, 1, '#ffd27a'); P(g, cx + 1, y - 8, 1, 1, '#ffd27a'); },
    eave(g, w, top) { DEF.eave.call(this, g, w, top); for (let x = 2; x < w - 2; x += 6) { P(g, x, top + 5, 3, 1, HM[4]); P(g, x + 1, top + 6, 1, 2, HM[4]); } },       // зубці-кажани
    corner(g, x, y0, y1) {                                                        // контрфорс із вузькими вікнами
      for (let y = y0; y < y1; y++) for (let k = 0; k < 8; k++) P(g, x + k, y, 1, 1, this.tex(x + k, y));
      P(g, x, y0, 1, y1 - y0, HM[0]); P(g, x + 7, y0, 1, y1 - y0, HM[4]);
      for (let y = y0 + 5; y < y1 - 12; y += 22) { P(g, x + 2, y + 1, 4, 9, HM[4]); P(g, x + 3, y, 2, 1, HM[4]); P(g, x + 3, y + 2, 2, 7, '#ff9e3c'); P(g, x + 3, y + 1, 2, 1, '#ffd27a'); P(g, x + 3, y + 5, 2, 1, HM[4]); }
    },
    post(g, x, y0, y1, pw, i) {
      DEF.post.call(this, g, x, y0, y1, pw);
      const my = y0 + 8; if (y1 - y0 > 18) { P(g, x + 1, my, pw - 2, 4, '#e8e0cc'); P(g, x + 1, my, 1, 1, HM[3]); P(g, x + pw - 2, my, 1, 1, HM[3]); P(g, x + 1, my + 1, 1, 1, '#120c24'); P(g, x + pw - 2, my + 1, 1, 1, '#120c24'); P(g, x + 1, my + 4, pw - 2, 1, '#c8c0ac'); }       // череп
    },
    archRim(g, x, y) { P(g, x, y, 1, 1, '#e8701e'); P(g, x, y + 1, 1, 1, '#231c38'); },
    keystone(g, kx, yTop) { D(g, kx + 2, yTop + 3, 2, '#e8701e'); P(g, kx + 1, yTop + 2, 1, 1, '#ffd27a'); P(g, kx + 3, yTop + 2, 1, 1, '#ffd27a'); P(g, kx + 1, yTop + 4, 3, 1, '#ffd27a'); P(g, kx + 2, yTop, 1, 1, '#3f7a3f'); },
    beam(g, y, w) { P(g, 0, y, w, 1, HM[1]); P(g, 0, y + 1, w, 3, '#181028'); P(g, 0, y + 4, w, 1, HM[3]); P(g, 0, y + 5, w, 1, '#120c24'); for (let x = 0; x < w; x += 4) { P(g, x, y + 1 + ((x >> 1) & 1) * 2, 2, 1, '#e8701e'); P(g, x + 2, y + 2, 1, 1, '#ff9e3c'); } },
    box(g, x, y, bw) {                                                            // гарбузи й свічки
      P(g, x, y + 5, bw, 1, HM[4]);
      for (let k = 3; k < bw - 2; k += 7) { D(g, x + k, y + 3, 2, '#e8701e'); P(g, x + k - 1, y + 2, 1, 1, '#ffd27a'); P(g, x + k + 1, y + 2, 1, 1, '#ffd27a'); P(g, x + k, y, 1, 1, '#3f7a3f'); }
      for (let k = 6; k < bw - 2; k += 7) { P(g, x + k, y + 2, 1, 3, '#e8e0cc'); P(g, x + k, y + 1, 1, 1, '#ffd27a'); }
    },
    frieze(g, gy, w, C) { DEF.frieze.call(this, g, gy, w, C); for (let x = 4; x < w - 4; x += 5) { const L = HS(x, 6) % 5; if (L > 1) { P(g, x, gy + 9, 2, L, '#7ad66a'); P(g, x, gy + 9, 1, L, '#b6ff8a'); } } },       // слиз
    portalTop(g, door, gy, cx) { DEF.portalTop.call(this, g, door, gy, cx); D(g, cx, gy + 1, 3, '#181028'); D(g, cx, gy + 1, 2, '#ffd27a'); P(g, cx, gy - 1, 1, 5, '#181028'); P(g, cx - 2, gy + 1, 5, 1, '#181028'); },
    base(g, w, h, door) { DEF.base.call(this, g, w, h, door); for (let x = 1; x < w; x += 3) if (HS(x, 21) % 3 === 0) P(g, x, h - 6, 2, 1 + HS(x, 22) % 2, '#3f5a3a'); },
    roofExtra(g, C) {
      const { w, look, level } = C, top = look.top;
      const spire = (x, y, H) => { for (let i = 0; i < H; i++) { const hw = Math.max(0, Math.round((H - i) * 0.3)); P(g, x - hw, y - i, hw * 2 + 1, 1, i % 2 ? '#30244c' : '#3e305e'); P(g, x - hw, y - i, 1, 1, '#120c24'); } P(g, x, y - H - 3, 1, 4, '#120c24'); P(g, x - 1, y - H - 2, 3, 1, '#120c24'); };
      if (top >= 16) [Math.round(w * 0.3), Math.round(w * 0.7)].forEach(x => spire(x, top + 1, 11));
      if (level >= 3) [11, w - 11].forEach(x => spire(x, top + 1, 14));
      A(g, 0.85, () => { for (let i = 0; i < 6; i++) AR.lineH(g, 8, top + 8, 8 + 3 * i, top + 26 - 3 * i, '#e8e0cc'); });
    },
    deco(g, C) {
      const { w, h, door, level, look, yG } = C, top = look.top;
      pumpkinG(g, door.x - 13, h - 7, 5); pumpkinG(g, door.x + door.w + 12, h - 7, 4);
      if (level >= 2) { tombstoneG(g, 14, h - 7); tombstoneG(g, w - 12, h - 7); candleG(g, 24, h - 7); candleG(g, w - 22, h - 7); if (door.x - 26 > 26) cauldronG(g, door.x - 26, h - 7); }
      spiderG(g, door.x + door.w - 4, yG + 11, 8); ghostG(g, w - 24, top + 30); batG(g, Math.round(w * 0.3), top + 2); batG(g, Math.round(w * 0.7), top - 2);
    }
  }));

  /* ---------- ОКЕАНСЬКИЙ: морський палац (луска-черепиця, канатні колони, хвилі, мушлі й корали) ---------- */
  const OM = ['#e8fbff', '#bfeaf2', '#7fd0dc', '#4aa4b8', '#1f6a84'], OA = ['#fff4dc', '#f2d8a8', '#d9b070', '#8a6a3a'];
  const rope = (g, x, y0, y1, pw) => { for (let y = y0; y < y1; y++) for (let k = 0; k < pw; k++) { const r = (k + y) % 4; let c = r === 0 ? OA[3] : r === 1 ? OA[1] : OA[2]; if (k === 0) c = OA[3]; if (k === pw - 1) c = '#5a4220'; P(g, x + k, y, 1, 1, c); } };
  const shell = (g, x, y) => { P(g, x - 2, y, 5, 2, '#ffc9d4'); P(g, x - 1, y - 1, 3, 1, '#ffe4e8'); P(g, x - 1, y, 1, 2, '#ef8fa3'); P(g, x + 1, y, 1, 2, '#ef8fa3'); P(g, x - 1, y + 2, 3, 1, '#c98a9a'); };
  reg('ocean', theme({
    M: OM, A: OA, S: ['#7fc8e8', '#4f9fd0', '#3a7fb4', '#285e94', '#143868'], B: ramp('#2f6a80'), ridge: '#e8fbff', awn: [['#1f5488', '#123460'], ['#ffffff', '#d4ecf4']], lamp: '#fff4b8', mullion: '#1f6a84',
    tex(x, y) { const r = y >> 2, xx = (x + (r % 2) * 3) % 6, yy = y & 3; if (yy === 3 && xx > 0 && xx < 5) return OM[3]; if (yy === 2 && (xx === 0 || xx === 5)) return OM[3]; if (yy === 0 && xx > 1 && xx < 4) return OM[1]; return OM[2]; },      // луска
    roofRow(g, lx, rx, y, k) { const S = this.S; P(g, lx, y, rx - lx, 1, k % 3 === 2 ? S[1] : S[0]); if (k % 3 === 2) for (let i = lx + 1 + ((k / 3 | 0) % 2) * 3; i < rx - 1; i += 6) { P(g, i, y, 2, 1, S[3]); P(g, i + 3, y - 1, 2, 1, '#bfe8f8'); } },
    gableRow(g, cx, half, y, i) { const S = this.S; P(g, cx - half, y, half * 2, 1, i % 2 ? S[0] : S[1]); P(g, cx - half, y, 2, 1, OA[1]); P(g, cx + half - 2, y, 2, 1, OA[2]); },
    finial(g, cx, y) { P(g, cx, y - 5, 1, 6, '#5a4220'); P(g, cx - 3, y - 7, 6, 3, '#ff9a4a'); P(g, cx + 3, y - 8, 2, 1, '#ff9a4a'); P(g, cx + 3, y - 6, 2, 1, '#ff9a4a'); P(g, cx + 2, y - 7, 3, 1, '#ff9a4a'); P(g, cx - 2, y - 7, 1, 1, '#ffffff'); P(g, cx - 2, y - 6, 1, 1, '#1a1a2a'); },    // рибка-флюгер
    eave(g, w, top) { P(g, 0, top + 2, w, 1, OM[0]); P(g, 0, top + 3, w, 2, OM[3]); for (let x = 0; x < w; x += 6) { P(g, x, top + 2, 4, 1, '#ffffff'); P(g, x + 2, top + 3, 3, 1, OM[1]); P(g, x + 1, top + 5, 4, 1, OM[3]); P(g, x + 2, top + 6, 2, 1, OM[4]); } },        // хвилі
    corner(g, x, y0, y1) { rope(g, x, y0, y1, 8); for (let y = y0 + 12; y < y1 - 6; y += 22) { P(g, x, y, 8, 3, '#1f5488'); P(g, x, y, 8, 1, '#7fc8e8'); shell(g, x + 4, y - 4); } },
    post(g, x, y0, y1, pw) {
      P(g, x, y0, pw, y1 - y0, OM[3]); P(g, x + 1, y0, pw - 2, y1 - y0, OM[1]); P(g, x + 1, y0, 1, y1 - y0, OM[0]); P(g, x + pw - 2, y0, 1, y1 - y0, OM[3]);
      for (let y = y0 + 8; y < y1 - 4; y += 9) rope(g, x, y, y + 3, pw);
      P(g, x - 1, y0, pw + 2, 1, OA[0]); P(g, x - 1, y0 + 1, pw + 2, 2, OA[2]); P(g, x, y0 + 3, pw, 1, OM[4]); P(g, x - 1, y1 - 2, pw + 2, 2, OA[3]);
    },
    archRim(g, x, y) { P(g, x, y, 1, 1, (x & 1) ? OA[1] : OA[3]); P(g, x, y + 1, 1, 1, OM[4]); },
    keystone(g, kx, yTop) { shell(g, kx + 2, yTop + 2); },
    beam(g, y, w) { P(g, 0, y, w, 1, OM[0]); P(g, 0, y + 1, w, 4, '#3a7fb4'); P(g, 0, y + 5, w, 1, '#143868'); for (let x = 0; x < w; x++) { const dy = Math.round(Math.sin(x * 0.52) * 1); P(g, x, y + 2 + dy, 1, 1, '#ffffff'); P(g, x, y + 3 + dy, 1, 1, '#7fc8e8'); } },
    box(g, x, y, bw) {                                                            // кораловий риф у ящику
      P(g, x, y + 5, bw, 1, OM[4]); P(g, x, y + 4, bw, 1, '#e8d4a0');
      for (let k = 2; k < bw - 2; k += 5) { const c = ['#ff6f8a', '#ff9a4a', '#b48aff'][(k + x) % 3]; P(g, x + k, y + 1, 1, 3, c); P(g, x + k - 1, y, 1, 2, c); P(g, x + k + 1, y + 1, 1, 2, c); P(g, x + k, y, 1, 1, '#ffd0e0'); }
    },
    deco(g, C) { const { w, h, look, yG, door } = C; SHOP_DECO_EXTRA.ocean(g, w, h, look, yG, door, look.top); }
  }));

  /* ---------- приховані сезонні (зі списку прибрані, але можуть лишитись одягненими у старих збереженнях) ---------- */
  reg('ice', theme(Object.assign({}, DIAM, { S: ['#ffffff', '#eef8ff', '#d4ecfa', '#9fc8e4', '#5a88b0'], roofRow(g, lx, rx, y, k) { P(g, lx, y, rx - lx, 1, k % 2 ? '#eef8ff' : '#ffffff'); }, keystone(g, kx, yTop) { P(g, kx, yTop, 4, 3, '#d8f6ff'); P(g, kx, yTop, 4, 1, '#ffffff'); }, deco(g, C) { DIAM.deco(g, C); snowmanG(g, C.w - 14, C.h - 7); } })));
  reg('spring', theme(Object.assign({}, GARDEN, { S: ['#ffc4d8', '#ff9fc0', '#ef7fa6', '#c85a84', '#7a3656'], ridge: '#ffe4ef', awn: [['#ff9fc0', '#e0709a'], ['#ffffff', '#f2dce6']], flower: ['#ff8fbc', '#ffffff', '#ffc4d8', '#ffd84f', '#b48aff'] })));
  reg('autumn', theme(Object.assign({}, WOOD, { S: ['#e8903c', '#c9702a', '#a85a22', '#7a3e16', '#4a240c'], ridge: '#ffd27a', awn: [['#e8701e', '#b04e12'], ['#7a4f35', '#4e2f1b']], box(g, x, y, bw) { P(g, x, y + 3, bw, 3, WD[4]); P(g, x + 1, y + 3, bw - 2, 1, WD[2]); for (let k = 0; k < bw - 2; k += 2) P(g, x + 1 + k, y + 1 + (k % 4 ? 1 : 0), 2, 2, ['#e8701e', '#d23a2a', '#f2b84b'][(k / 2 | 0) % 3]); }, deco(g, C) { const { h, door } = C; pumpkinG(g, door.x - 13, h - 7, 5); pumpkinG(g, door.x + door.w + 12, h - 7, 4); leafPileG(g, 12, h - 7); leafPileG(g, C.w - 12, h - 7); } })));
})();
