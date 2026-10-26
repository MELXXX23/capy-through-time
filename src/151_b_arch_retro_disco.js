//#part 151_b_arch_retro_disco.js
// ---- епоха 1: Ретро (хром, шашки, заокруглені вікна)
(function () {
  const { P, A, D, ramp, mix, rnd } = AR;
  const TQ = ramp('#4fc6ba'), CR = ramp('#f7edcf'), RD = ramp('#e2453b'), PK = ramp('#f59ab6'), YL = ramp('#ffd84a');
  const CH = ['#ffffff', '#e6eff7', '#b4c3d3', '#74839a', '#3c4660'], BK = '#1e1e28';

  const V2 = () => window.ARCH_V2 !== false;                                     // деталі v2 (р. 68); false — як було (для зразка)
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
    if (V2()) {                                                                   // v2: хромовані «плавники» на кутах і лампочки-маркіза по парапету
      [[2, 1], [w - 3, -1]].forEach(([x0, d]) => { for (let k = 0; k < 9; k++) { const hh = Math.round(14 - k * 1.4); P(g, x0 + d * k, top - 2 - hh, 1, hh, k < 2 ? CH[0] : k < 6 ? RD[2] : RD[3]); P(g, x0 + d * k, top - 2 - hh, 1, 1, CH[0]); } P(g, x0 + d * 1, top - 14, 1, 2, '#ffe9a0'); });
      for (let x = 14; x < w - 14; x += 5) { if (Math.abs(x - cx) < 36) continue; P(g, x, top - 2, 2, 1, (x / 5 | 0) % 2 ? '#ffe9a0' : '#ffffff'); }
    }
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
        if (V2()) { P(g, bx - 3, fl.top - 4, bw + 6, 2, CH[1]); P(g, bx - 3, fl.top - 4, bw + 6, 1, CH[0]); A(g, 0.25, () => P(g, bx - 1, fl.top - 2, bw + 2, 2, '#000000')); }      // v2: хромований козирок над вікном
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
    if (V2() && level >= 2) { const ax0 = door.x - 34, ay = yG + 16; if (ax0 > innerX + 2) { P(g, ax0, ay, 18, 5, BK); P(g, ax0 + 1, ay + 1, 16, 3, RD[2]); for (let k = 0; k < 5; k++) P(g, ax0 + 18 + k, ay - 2 + k, 1, 9 - k * 2, k ? RD[2] : BK); for (let k = 0; k < 16; k += 3) P(g, ax0 + 1 + k, ay + 2, 1, 1, '#ffe9a0'); } }      // v2: неонова стрілка «сюди» з лампочками
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
    if (V2() && roofK === 1 && w >= 34) { const bx = x + 4 + (hs >>> 6) % Math.max(1, w - 30); P(g, bx + 3, top - 6, 1, 4, CH[3]); P(g, bx + 18, top - 6, 1, 4, CH[3]); P(g, bx, top - 18, 22, 12, BK); P(g, bx + 1, top - 17, 20, 10, '#fff4d6'); P(g, bx + 3, top - 16, 3, 8, RD[2]); P(g, bx + 4, top - 18, 1, 2, RD[2]); P(g, bx + 8, top - 15, 11, 2, RD[2]); P(g, bx + 8, top - 12, 8, 1, TQ[2]); P(g, bx + 8, top - 10, 10, 1, TQ[2]); }      // v2: щит із пляшкою содової
    if (V2() && roofK === 4) { const cxh = x + w - 10; P(g, cxh, top - 9, 5, 9, PK[3]); P(g, cxh, top - 9, 5, 1, PK[1]); P(g, cxh - 1, top - 10, 7, 1, CH[2]); A(g, 0.35, () => { P(g, cxh + 1, top - 13, 2, 2, '#ffffff'); P(g, cxh + 3, top - 16, 2, 2, '#ffffff'); }); }      // v2: пастельний димар
    // поверхи: широкі панорамні вікна по два
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, DG = AR.doorGrid(x, w, hs, 24, 4, 2), doorX = Math.round(DG.cx - 5), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 24)), sp = (w - 4) / cols;
      if (f > 0) { P(g, x, y0 - 5, w, 1, '#ffffff'); P(g, x, y0 - 4, w, 2, TQ[2]); P(g, x, y0 - 2, w, 1, wp[4]); }
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 20) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && doorOk && Math.abs((wx + 10) - DG.cx) < 22) continue;
        P(g, wx - 1, y0 - 1, 22, 13, CH[0]); P(g, wx - 1, y0 + 11, 22, 1, CH[3]); P(g, wx, y0, 20, 11, lit ? '#ffd45c' : '#9fd6ec');
        if (!lit) { P(g, wx, y0, 20, 3, '#cfeefa'); P(g, wx + 2, y0 + 1, 2, 1, '#ffffff'); P(g, wx + 5, y0 + 2, 1, 1, '#ffffff'); }
        P(g, wx + 9, y0, 2, 11, CH[1]); P(g, wx + 9, y0, 1, 11, CH[0]);
        if (V2() && lit && hash2(wx, y0 + 7) % 2) A(g, 0.35, () => { for (let k = 1; k < 10; k += 2) P(g, wx, y0 + k, 20, 1, '#c89030'); });      // v2: жалюзі в освітлених вікнах
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
  const V2 = () => window.ARCH_V2 !== false;                                     // деталі v2 (р. 68)
  function speaker(g, x, y) { P(g, x, y - 12, 8, 12, DK); P(g, x + 1, y - 11, 6, 10, '#3a2450'); D(g, x + 4, y - 4, 2, '#1a0a26'); D(g, x + 4, y - 4, 1, '#9aa4b8'); D(g, x + 4, y - 9, 1, '#9aa4b8'); P(g, x, y - 12, 8, 1, PU[1]); }
  function searchlight(g, x, y, d) { A(g, 0.12, () => { for (let k = 0; k < 26; k++) P(g, x + d * Math.round(k * 0.45), y - 4 - k, 3 + (k >> 3), 1, '#fff6c0'); }); P(g, x - 2, y - 4, 5, 4, '#9aa4b8'); P(g, x - 1, y - 5, 3, 1, '#fff6c0'); P(g, x - 2, y - 1, 5, 1, DK); }
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
    if (V2() && level >= 2) { [[30, -1], [w - 30, 1]].forEach(([x, d]) => searchlight(g, x, top - 2, d)); if (level >= 3) { speaker(g, 2, top - 2); speaker(g, w - 10, top - 2); } }      // v2: прожектори з променями й колонки на даху
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
      if (V2()) for (let i = 1; i < n; i++) { const sx = Math.round(innerX + pitch * i); P(g, sx, fl.top - 2, 1, hF + 1, MG[1]); A(g, 0.35, () => P(g, sx - 1, fl.top - 2, 3, hF + 1, MG[0])); sparkle(g, sx, fl.top + 3, '#ffffff'); }      // v2: неонові рожеві ребра між ілюмінаторами з блискітками
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
    if (V2() && level >= 2) { const y = h - 6; P(g, door.x - 2, y - 1, door.w + 4, 1, '#c8243a'); [door.x - 12, door.x - 5, door.x + door.w + 4, door.x + door.w + 11].forEach(px => { P(g, px, y - 8, 2, 8, YL[2]); P(g, px, y - 8, 2, 1, YL[0]); P(g, px - 1, y - 1, 4, 1, YL[3]); }); [[door.x - 11, door.x - 4], [door.x + door.w + 5, door.x + door.w + 12]].forEach(([a, b]) => { for (let px = a; px < b; px++) P(g, px, y - 6 + (Math.abs(px - (a + b) / 2) < 2 ? 1 : 0), 1, 1, '#c8243a'); }); }      // v2: червона доріжка, золоті стовпчики й оксамитова мотузка
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
    if (V2() && roofK === 2 && w >= 30) { const rx = x + (w >> 1), R0 = Math.min(12, (w >> 1) - 4); [MG[2], OR[2], YL[2], CY[2]].forEach((c, i) => { const r = R0 - i * 2; for (let a = 0; a <= 20; a++) { const t = Math.PI * a / 20; P(g, Math.round(rx - Math.cos(t) * r), Math.round(top - 6 - Math.sin(t) * r * 0.8), 2, 2, c); } }); }      // v2: веселкова дуга 70-х на даху
    else if (V2() && roofK === 3 && w >= 26) speaker(g, x + 4 + (hs >>> 6) % Math.max(1, w - 14), top - 5);
    // поверхи з круглими вікнами
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, DG = AR.doorGrid(x, w, hs, 15, 4, 2), doorX = Math.round(DG.cx - 5), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 15)), sp = (w - 4) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = x + 2 + c * sp + sp / 2, cy = y0 + 5, lit = hash2(Math.round(wx), y0) % 3 === 0;
        if (f === floors - 1 && doorOk && Math.abs(wx - DG.cx) < 17) continue;
        D(g, wx, cy, 6, DK); D(g, wx, cy, 5, c % 2 ? OR[2] : YL[2]); D(g, wx, cy, 4, lit ? '#ffd45c' : '#9fd6ec');
        if (!lit) { P(g, wx - 3, cy - 3, 2, 1, '#ffffff'); P(g, wx - 2, cy - 2, 1, 1, '#ffffff'); } else { A(g, 0.3, () => D(g, wx, cy, 3, '#ffffff')); }
        P(g, wx - 1, cy - 4, 1, 9, DK); P(g, wx - 4, cy, 9, 1, DK);
        if (V2() && hash2(Math.round(wx), y0 + 9) % 3 === 0) { P(g, wx - 4, cy + 7, 8, 2, OR[3]); P(g, wx - 4, cy + 7, 8, 1, OR[1]); for (let k = 0; k < 8; k += 2) P(g, wx - 4 + k, cy + 5 + (k % 4 ? 1 : 0), 2, 2, k % 4 ? '#4f9a3a' : MG[1]); }      // v2: кашпо під вікном
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

