//#part 151_c_arch_arcade_internet_eco.js
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
  const V2 = () => window.ARCH_V2 !== false;                                     // деталі v2 (р. 68)
  function pacRow(g, x0, x1, y) {                                               // пакмен женеться за крапками й привидом уздовж парапету
    for (let x = x0 + 12; x < x1; x += 5) P(g, x, y + 2, 2, 2, x > x1 - 30 ? '#ffffff' : YL);
    D(g, x0 + 4, y + 3, 4, YL); for (let k = 0; k < 4; k++) P(g, x0 + 5 + k, y + 3 - Math.ceil(k * 0.6), 1, 1 + Math.ceil(k * 1.2), BK); P(g, x0 + 3, y, 1, 1, BK);
  }
  function joystick(g, x, y) { P(g, x - 7, y - 4, 15, 4, BK2); P(g, x - 7, y - 4, 15, 1, '#5a5a6e'); P(g, x - 1, y - 14, 2, 10, '#9a9aaa'); D(g, x, y - 17, 4, '#e8243a'); P(g, x - 2, y - 19, 2, 2, '#ff8a9a'); P(g, x + 4, y - 3, 2, 2, YL); P(g, x - 6, y - 3, 2, 2, CY); }
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
    if (V2() && level >= 2) { const zw = cx - 42 - (level >= 3 ? 56 : 30); if (zw > 30) pacRow(g, level >= 3 ? 56 : 30, cx - 42, top - 6); if (level >= 4) joystick(g, w - 64, top - 1); }      // v2: пакмен на парапеті, великий джойстик
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
    if (V2() && roofK === 0 && w >= 30 && AR.word45) { const wd = WORDS[(hs >>> 5) % WORDS.length].slice(0, Math.max(3, Math.floor((w - 9) / 5))), c = NEON[(hs >>> 8) % 5], sw = wd.length * 5 + 7, sx = x + 1 + (hs >>> 6) % Math.max(1, w - sw - 1), sy = top - 19;
      P(g, sx + 3, sy + 11, 1, 8, '#444'); P(g, sx + sw - 4, sy + 11, 1, 8, '#444'); A(g, 0.22, () => P(g, sx - 2, sy - 2, sw + 4, 15, c)); P(g, sx, sy, sw, 11, BK); neonBox(g, sx, sy, sw, 11, c); AR.word45(g, sx + 4, sy + 4, wd, '#000000'); AR.word45(g, sx + 3, sy + 3, wd, mix(c, '#ffffff', 0.5)); }      // v2: жирні неонові літери
    else if (V2() && roofK === 2 && w >= 24) { const hx = x + 6 + (hs >>> 6) % Math.max(1, w - 18); sprite(g, hx, top - 12, ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'], PK); P(g, hx + 1, top - 11, 1, 1, WH); P(g, hx + 3, top - 6, 1, 2, '#444'); }      // v2: піксельне серце-життя
    else if (V2() && roofK === 3 && w >= 24) { const tx = x + w - 16; P(g, tx, top - 13, 11, 9, '#3a3a4e'); P(g, tx, top - 13, 11, 1, '#6a6a80'); P(g, tx, top - 9, 11, 1, NEON[hs % 5]); P(g, tx + 1, top - 4, 1, 4, '#555'); P(g, tx + 9, top - 4, 1, 4, '#555'); }      // v2: бак для води з неоновою смугою
    else if (roofK === 0 && w >= 30) { const wd = WORDS[(hs >>> 5) % WORDS.length], sw = wd.length * 4 + 5, sx = x + 2 + (hs >>> 6) % Math.max(1, w - sw - 2); P(g, sx + 2, top - 10, 1, 6, '#444'); P(g, sx + sw - 3, top - 10, 1, 6, '#444'); P(g, sx, top - 17, sw, 8, BK); neonBox(g, sx, top - 17, sw, 8, NEON[(hs >>> 8) % 5]); AR.txt(g, sx + 3, top - 15, wd, NEON[(hs >>> 8) % 5]); }
    else if (roofK === 1) { const ax = x + 6 + (hs >>> 5) % Math.max(1, w - 18); for (let a = -5; a <= 5; a++) { const hh = Math.round(Math.sqrt(25 - a * a) * 0.9); P(g, ax + 6 + a, top - 5 - hh, 1, hh + 1, '#8a8aa0'); } P(g, ax + 6, top - 5, 1, 5, '#555'); P(g, ax + 6, top - 12, 1, 1, PK); }
    // поверхи: вікна з неоновим контуром
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, DG = AR.doorGrid(x, w, hs, 17, 4, 2), doorX = Math.round(DG.cx - 5), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 17)), sp = (w - 4) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 8) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && doorOk && Math.abs((wx + 4) - DG.cx) < 16) continue;
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
  const V2 = () => window.ARCH_V2 !== false;                                     // деталі v2 (р. 68)
  function wifi(g, x, y, c) { [[7, 0], [5, 2], [3, 4]].forEach(([r, o]) => { for (let a = -r; a <= r; a++) { const yy = Math.round(-Math.sqrt(Math.max(0, r * r - a * a)) * 0.8); if (Math.abs(a) > r * 0.25 || r === 3) P(g, x + a, y + yy, 1, 1, c); } }); P(g, x, y - 1, 2, 2, c); }
  function cursor(g, x, y) { const R = ['#.......', '##......', '#w#.....', '#ww#....', '#www#...', '#wwww#..', '#wwwww#.', '#www###.', '#w#w#...', '##.#w#..', '#..#w#..', '....##..']; R.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') P(g, x + i, y + j, 1, 1, r[i] === '#' ? DK : '#ffffff'); }); }
  function fanUnit(g, x, y) { P(g, x, y - 8, 14, 8, ST[2]); P(g, x, y - 8, 14, 1, WH[0]); [3, 10].forEach(cx2 => { D(g, x + cx2, y - 4, 3, ST[3]); P(g, x + cx2 - 2, y - 4, 5, 1, ST[1]); P(g, x + cx2, y - 6, 1, 5, ST[1]); }); P(g, x + 6, y - 7, 2, 1, '#28c840'); }
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
    if (V2() && level >= 2 && top >= 14) { wifi(g, w - 58, top - 4, CY); if (level >= 3) { fanUnit(g, 70, top - 1); cursor(g, w - 72, top - 14); } }      // v2: Wi-Fi, сервери з вентиляторами, курсор
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
    if (V2()) { const lx = innerX + 4, lw = Math.min(60, door.x - innerX - 14); if (lw > 20) { P(g, lx, yG + 2, lw, 4, DK); P(g, lx + 1, yG + 3, Math.round((lw - 2) * 0.7), 2, '#28c840'); for (let k = lx + 2; k < lx + (lw - 2) * 0.7; k += 4) P(g, k, yG + 3, 1, 2, '#8cf0a0'); } }      // v2: «смуга завантаження» на навісі
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
    else if (V2() && rk === 3 && w >= 26) { const bx = x + 3 + (hs >>> 6) % Math.max(1, w - 22); P(g, bx + 3, top - 6, 1, 4, ST[3]); P(g, bx + 13, top - 6, 1, 4, ST[3]); P(g, bx, top - 17, 17, 11, ST[3]); P(g, bx + 1, top - 16, 15, 9, '#ffffff'); txt(g, bx + 3, top - 14, '@', NV[2]); wifi(g, bx + 12, top - 9, BL[2]); }      // v2: щит «@» з Wi-Fi
    // поверхи: стрічкові скляні вікна з білою перемичкою
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, DG = AR.doorGrid(x, w, hs, 14, 4, 2), doorX = Math.round(DG.cx - 5), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 14)), sp = (w - 4) / cols;
      P(g, x + 1, y0 - 4, w - 2, 1, WH[0]); P(g, x + 1, y0 - 3, w - 2, 1, ST[2]);
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 10) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && doorOk && Math.abs((wx + 5) - DG.cx) < 17) continue;
        P(g, wx - 1, y0 - 1, 12, 13, ST[3]); P(g, wx, y0, 10, 11, lit ? '#ffe9a0' : '#7ab4e0');
        if (!lit) { P(g, wx, y0, 10, 4, '#a8d4f2'); P(g, wx + 1, y0 + 1, 3, 1, '#ffffff'); P(g, wx + 2, y0 + 2, 1, 1, '#ffffff'); P(g, wx, y0 + 7, 10, 4, '#5a98cc'); }
        P(g, wx + 4, y0, 1, 11, ST[3]);
        if (V2() && lit && hash2(wx, y0 + 5) % 2) { P(g, wx + 5, y0 + 4, 4, 3, '#2a6ad8'); P(g, wx + 5, y0 + 4, 4, 1, '#8ac8ff'); P(g, wx + 6, y0 + 7, 2, 1, DK); A(g, 0.3, () => P(g, wx + 4, y0 + 2, 6, 7, '#6ab0ff')); }      // v2: світиться монітор
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
  const EV2 = () => window.ECO_V2 !== false;                                   // Еко v2 (р. 68); false — як було (для зразка)
  function bed(g, x, y, w, seed) {                                              // грядка: дерев'яний ящик, зелень, соняшники й помідори
    P(g, x, y, w, 3, WK[3]); P(g, x, y, w, 1, WD[1]); P(g, x + 1, y + 1, w - 2, 1, '#5a3a20');
    for (let i = 1; i < w - 1; i += 2) { const r = rnd(x + i, seed); P(g, x + i, y - 2 - (r % 3), 1, 2 + (r % 3), GN[r % 2 ? 1 : 2]); if (r % 5 === 0) P(g, x + i, y - 2, 1, 1, '#e8402a'); }
    for (let i = 4; i < w - 2; i += 9) { const hh = 7 + rnd(x, i) % 4; P(g, x + i, y - hh, 1, hh, GD[1]); P(g, x + i + 1, y - hh + 3, 2, 1, GN[1]);
      P(g, x + i - 2, y - hh - 2, 5, 3, '#f4c020'); P(g, x + i - 1, y - hh - 3, 3, 5, '#f4c020'); P(g, x + i - 1, y - hh - 2, 3, 3, '#7a4a1a'); P(g, x + i - 1, y - hh - 2, 1, 1, '#a86a2a'); }
  }
  function hive(g, x, y) {                                                      // вулик на ніжках і бджілки
    P(g, x - 4, y - 9, 9, 8, '#5a3a14'); P(g, x - 3, y - 8, 7, 6, '#f2c24a'); P(g, x - 3, y - 6, 7, 1, '#c8902a'); P(g, x - 3, y - 4, 7, 1, '#c8902a');
    P(g, x - 5, y - 10, 11, 2, WK[2]); P(g, x - 5, y - 10, 11, 1, WD[1]); P(g, x - 1, y - 3, 3, 1, '#2a1a08'); P(g, x - 3, y - 1, 1, 2, WK[3]); P(g, x + 3, y - 1, 1, 2, WK[3]);
    [[7, -12], [-8, -14], [4, -16]].forEach(([dx, dy]) => { P(g, x + dx, y + dy, 2, 1, '#f2c24a'); P(g, x + dx, y + dy - 1, 1, 1, '#ffffff'); });
  }
  function greenhouse(g, x, y) {                                                // маленька скляна теплиця з розсадою
    P(g, x - 7, y - 8, 15, 8, '#2a4a3a'); P(g, x - 6, y - 7, 13, 6, '#bfe8e0'); A(g, 0.5, () => P(g, x - 6, y - 4, 13, 3, GN[1]));
    for (let i = 0; i < 4; i++) P(g, x - 6 + i, y - 9 - i, 13 - i * 2, 1, i === 3 ? '#2a4a3a' : '#d8f4ee');
    P(g, x - 7, y - 9, 1, 1, '#2a4a3a'); P(g, x + 7, y - 9, 1, 1, '#2a4a3a'); P(g, x, y - 12, 1, 12, '#2a4a3a'); P(g, x - 5, y - 6, 2, 1, '#ffffff');
  }
  function ivy(g, x, y, len, seed) {                                            // плющ, що звисає з балки
    for (let k = 0; k < len; k++) { const xx = x + Math.round(Math.sin(k * 0.7 + seed) * 1.2); P(g, xx, y + k, 1, 1, GD[1]); if (k % 2 === 0) P(g, xx + (k % 4 ? 1 : -1), y + k, 1, 1, GN[k % 3 ? 1 : 2]); }
  }
  function basket(g, x, y) {                                                   // підвісне кашпо з квітами
    P(g, x, y - 3, 1, 3, '#6a4a2a'); P(g, x - 3, y, 7, 3, WK[2]); P(g, x - 2, y + 3, 5, 1, WK[3]); P(g, x - 3, y, 7, 1, WD[1]);
    [[-3, -1, '#ff6a8a'], [-1, -2, '#ffd84f'], [1, -1, '#ff6a8a'], [3, -2, '#ffffff']].forEach(([dx, dy, c]) => { P(g, x + dx, y + dy, 1, 1, c); P(g, x + dx, y + dy + 1, 1, 1, GN[1]); });
    P(g, x - 3, y + 3, 1, 3, GN[2]); P(g, x + 3, y + 3, 1, 2, GN[2]);
  }
  function birdhouse(g, x, y) {                                                 // шпаківня на опорі
    P(g, x - 3, y - 3, 7, 2, '#b8402a'); P(g, x - 2, y - 4, 5, 1, '#b8402a'); P(g, x - 2, y - 1, 5, 5, WD[1]); P(g, x - 2, y - 1, 1, 5, WD[0]); P(g, x, y + 1, 1, 1, '#2a1a10'); P(g, x, y + 3, 1, 1, WK[3]);
  }
  function rainBarrel(g, x, y) {                                                // бочка для дощової води
    P(g, x - 4, y - 9, 9, 9, WK[3]); P(g, x - 3, y - 9, 7, 9, WD[2]); P(g, x - 3, y - 9, 1, 9, WD[1]); P(g, x - 4, y - 7, 9, 1, '#5a5f66'); P(g, x - 4, y - 3, 9, 1, '#5a5f66'); P(g, x - 3, y - 10, 7, 1, '#4a8ad8');
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
    if (EV2()) for (let x = 3; x < w - 3; x += 3) { const r = rnd(x, 41); if (r % 3 === 0) P(g, x, top - 4 - (r % 2), 1, 1, ['#ffd84f', '#ff8fd0', '#ffffff', '#c89aff', '#ff6a4a'][r % 5]); }      // v2: польові квіти на трав'яному даху
    if (level >= 2) { solar(g, 10, Math.max(0, top - 10), 24); solar(g, w - 40, Math.max(0, top - 10), 24); }
    if (level >= 3) turbine(g, w - 12, Math.max(6, top - 18));
    if (level >= 4) turbine(g, 12, Math.max(6, top - 18));
    if (EV2() && level >= 2 && top >= 12) {      // дах-город (р. 68): грядки з соняшниками, вулик, теплиця — у проміжках між сонячними панелями й вивіскою
      const zL = [38, cx - 42], zR = [cx + 42, w - 44];
      [zL, zR].forEach(([a, b], k) => { if (b - a < 16) return; const bw = Math.min(26, b - a - 2); bed(g, a + 1, top - 3, bw, k * 11 + level);
        if (b - a > 40) (k ? hive : greenhouse)(g, a + bw + 4 + ((b - a - bw - 4) >> 1), top - 2); });
    }
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
        if (EV2() && i < n - 1) { const px = bx + bwi + (pier >> 1); ivy(g, px, fl.top - 2, Math.min(hF - 2, 10 + rnd(px, fl.f) % 8), px + fl.f); if (hF > 20) basket(g, px, fl.top + 3); if (fl.f === floors.length - 1 && i % 2 === 0) birdhouse(g, px, fl.top + Math.round(hF * 0.55)); }      // v2: плющ, кашпо, шпаківні
      }
    });
    // навіс: дерев'яні рейки з листковим кантом
    P(g, 0, yG, w, 1, WD[0]); P(g, 0, yG + 1, w, 8, WD[2]); for (let x = 0; x < w; x += 4) P(g, x, yG + 1, 1, 8, WK[3]);
    P(g, 0, yG + 9, w, 1, WK[4]);
    for (let x = 0; x < w; x += 5) { const r = rnd(x, 9); P(g, x, yG + 10, 3, 1 + r % 2, GN[(r >> 3) % 2 ? 1 : 2]); P(g, x + 1, yG + 11, 1, 1, GD[2]); }
    P(g, door.x - 4, yG + 10, door.w + 8, 3, WK[2]); P(g, door.x - 4, yG + 10, 3, h - 6 - yG - 10, WK[2]); P(g, door.x + door.w + 1, yG + 10, 3, h - 6 - yG - 10, WK[2]);
    if (EV2()) { rainBarrel(g, w - 12, h - 6); P(g, w - 5, top + 5, 1, h - 12 - top, '#8a8f96'); for (let y = top + 8; y < h - 14; y += 4) P(g, w - 6, y, 3, 2, '#b8bec6'); }      // v2: бочка для дощової води й ланцюг-водостік
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
    else if (EV2() && w >= 30) { bed(g, x + 4, top - rh - 1, Math.min(26, w - 8), hs); if (w >= 44) hive(g, x + w - 8, top - rh); }      // v2: грядка з соняшниками й вулик на даху
    if (EV2() && (hs >>> 4) % 2 && h > 50) { ivy(g, x + 1, top + 2, Math.round(h * 0.55), hs); ivy(g, x + 3, top + 2, Math.round(h * 0.35), hs + 3); }      // v2: плющ по стіні
    // вікна з ящиками рослин
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, DG = AR.doorGrid(x, w, hs, 17, 4, 2), doorX = Math.round(DG.cx - 5), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 17)), sp = (w - 4) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 9) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && doorOk && Math.abs((wx + 4.5) - DG.cx) < 16) continue;
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

