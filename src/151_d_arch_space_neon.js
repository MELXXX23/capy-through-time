//#part 151_d_arch_space_neon.js
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
  const V2 = () => window.ARCH_V2 !== false;                                     // деталі v2 (р. 68)
  function solarArr(g, x, y, n) { P(g, x - 1, y, n * 9 + 1, 1, SV[3]); for (let i = 0; i < n; i++) { const px = x + i * 9; P(g, px, y - 7, 8, 6, '#1c2a6a'); P(g, px, y - 7, 8, 1, '#5a7ae0'); P(g, px + 3, y - 7, 1, 6, '#3a4a9a'); P(g, px, y - 4, 8, 1, '#3a4a9a'); P(g, px + 3, y - 1, 1, 2, SV[3]); } P(g, x - 1, y - 9, 1, 9, SV[2]); P(g, x - 2, y - 10, 3, 1, '#ff3a3a'); }
  function conduit(g, x0, x1, y) { P(g, x0, y, x1 - x0, 2, OR); P(g, x0, y, x1 - x0, 1, '#ffb070'); for (let x = x0 + 10; x < x1 - 4; x += 26) { P(g, x, y - 1, 4, 4, SV[3]); P(g, x + 1, y, 2, 2, [CY, '#3adca0', '#ff3a3a'][(x >> 3) % 3]); } }
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
    if (V2() && level >= 3 && top >= 10) { const sx0 = 54, n = Math.floor((cx - 40 - sx0) / 9); if (n >= 2) solarArr(g, sx0, top - 2, Math.min(5, n)); }      // v2: масив сонячних панелей із маячком
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
      if (V2()) conduit(g, innerX, innerX + innerW, fl.fy - 2);      // v2: трубопровід із вузлами під ілюмінаторами
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
    if (V2()) { P(g, x + 3, top + 2, 2, 2, '#ff3a3a'); P(g, x + w - 5, top + 2, 2, 2, '#3adca0'); A(g, 0.3, () => { P(g, x + 2, top + 1, 4, 4, '#ff3a3a'); P(g, x + w - 6, top + 1, 4, 4, '#3adca0'); }); }      // v2: навігаційні вогні на кутах
    if (winter) P(g, x + 3, top - 1, w - 6, 2, '#ffffff');
    // ілюмінатори
    const floors = Math.max(1, Math.floor((h - 12) / 19)), doorW = 10, DG = AR.doorGrid(x, w, hs, 16, 4, 2), doorX = Math.round(DG.cx - 5), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 4) / 16)), sp = (w - 4) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 2 + c * sp + (sp - 10) / 2), lit = hash2(wx, y0) % 3 === 0;
        if (f === floors - 1 && doorOk && Math.abs((wx + 5) - DG.cx) < 17) continue;
        cham(g, wx - 1, y0 - 1, 12, 13, DK[2], 3); cham(g, wx, y0, 10, 11, lit ? '#ffe9a0' : mix('#6ab4f0', tr, 0.2), 3);
        if (!lit) { P(g, wx + 2, y0 + 2, 3, 1, '#ffffff'); P(g, wx + 2, y0 + 3, 1, 1, '#ffffff'); }
        else if (V2() && hash2(wx, y0 + 3) % 2) { A(g, 0.6, () => P(g, wx + 1, y0 + 6, 8, 4, '#6ad87a')); for (let k = 0; k < 4; k++) P(g, wx + 2 + k * 2, y0 + 5 - (k % 2), 1, 2, '#2a8a4a'); P(g, wx + 1, y0 + 9, 8, 1, '#c8a0ff'); }      // v2: гідропоніка у вікні
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
  const V2 = () => window.ARCH_V2 !== false;                                     // деталі v2 (р. 68)
  function waterTower(g, x, y) { P(g, x - 6, y - 16, 13, 10, '#2a2e40'); P(g, x - 6, y - 16, 13, 1, '#4a4e62'); for (let k = -5; k < 7; k += 3) P(g, x + k, y - 15, 1, 9, '#1a1e2c'); P(g, x - 7, y - 18, 15, 2, '#3a3e50'); P(g, x - 5, y - 6, 1, 6, '#444'); P(g, x + 5, y - 6, 1, 6, '#444'); P(g, x - 5, y - 3, 11, 1, '#444'); glow(g, x - 6, y - 11, 13, 1, CY); }
  function steam(g, x, y) { A(g, 0.28, () => { P(g, x, y - 3, 3, 2, '#d8d8e8'); P(g, x + 2, y - 7, 4, 3, '#d8d8e8'); P(g, x, y - 12, 3, 3, '#d8d8e8'); }); P(g, x - 1, y - 1, 5, 2, '#3a3e50'); }
  function acUnit(g, x, y) { P(g, x, y, 7, 5, '#5a5e72'); P(g, x, y, 7, 1, '#8a8ea2'); D(g, x + 3, y + 3, 1, '#2a2e40'); P(g, x + 3, y + 5, 1, 3, '#2a2e40'); }
  function hazard(g, x, y, w, h) { for (let i = 0; i < w; i++) P(g, x + i, y, 1, h, ((i + 4000) >> 2) % 2 ? YL : '#1a1a22'); }

  function front(g, C) {
    const { w, h, look, level, floors, yG, yB, door, innerX, innerW } = C, top = look.top, cx = w >> 1, fill = currentEpoch().signFill || look.signFill, ys = Math.max(0, top - 10);
    // дах: плита з неоновим краєм, вертикальні вивіски й голощит
    P(g, 0, top - 1, w, 7, BK[2]); P(g, 0, top - 1, w, 1, BK[0]); P(g, 0, top + 3, w, 1, BK[4]); glow(g, 4, top - 2, w - 8, 1, MG);
    if (top >= 14) { vsign(g, 8, Math.max(0, top - 18), Math.min(17, top - 1), MG, 1); vsign(g, w - 15, Math.max(0, top - 18), Math.min(17, top - 1), CY, 2); }
    if (level >= 3 && top >= 14) { holo(g, 22, Math.max(1, top - 12), 24, 10, 3); holo(g, w - 46, Math.max(1, top - 12), 24, 10, 7); }
    if (level >= 2) { [[18, 5], [w - 18, 5]].forEach(([x, k]) => { for (let j = 0; j < 6; j++) A(g, 0.25 - j * 0.03, () => P(g, x - 2 - j, Math.max(0, top - 8 - j * 2), 5 + j * 2, 2, CY)); }); }
    if (V2() && level >= 2 && top >= 18) { const tx = Math.min(70, cx - 50); if (tx >= 34) waterTower(g, tx, top - 1); if (w - 70 > cx + 44) steam(g, w - 70, top - 2); if (level >= 4 && cx - 96 > 40) steam(g, 96, top - 2); }      // v2: бак для води з неоновою смугою, пара з вентиляції
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
        if (V2() && i < n - 1) { const px = bx + bwi + 3, nx = Math.round(innerX + (i + 1) * (bw + pier) + bw + 3); for (let k = 0; k <= bwi + pier; k++) { const t = k / (bwi + pier), yy = fl.top + 2 + Math.round(Math.sin(t * Math.PI) * 3); if (px + k < innerX + innerW) P(g, px + k, yy, 1, 1, '#0a0a14'); if (k % 9 === 4 && px + k < innerX + innerW) { P(g, px + k - 1, yy + 1, 3, 3, NE[(k + i) % 4]); A(g, 0.3, () => P(g, px + k - 2, yy, 5, 5, NE[(k + i) % 4])); } } }      // v2: провиси кабелів із ліхтариками між колонами
      }
    });
    if (V2() && level >= 3 && cH > 40) { const vx = w - 7, vy = top + 34, wd = '24/7'; P(g, vx - 1, vy - 1, 9, 30, '#06060e'); glow(g, vx - 1, vy - 1, 9, 1, LM); glow(g, vx - 1, vy + 28, 9, 1, LM); [...wd].forEach((ch, i) => AR.txt && AR.txt(g, vx + 2, vy + 2 + i * 7, ch, LM)); }      // v2: вертикальна вивіска «24/7» на пілоні
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
  /* дахова неонова вивіска-слово (р. 68): жирні літери 4×5 з темною тінню й ореолом, подвійна трубка рамки з лампами в кутах, ферма-опора */
  const F45 = { A: ['.##.', '#..#', '####', '#..#', '#..#'], B: ['###.', '#..#', '###.', '#..#', '###.'], C: ['.###', '#...', '#...', '#...', '.###'], D: ['###.', '#..#', '#..#', '#..#', '###.'],
    E: ['####', '#...', '###.', '#...', '####'], H: ['#..#', '#..#', '####', '#..#', '#..#'], K: ['#..#', '#.#.', '##..', '#.#.', '#..#'], L: ['#...', '#...', '#...', '#...', '####'],
    M: ['#..#', '####', '####', '#..#', '#..#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.##.', '#..#', '#..#', '#..#', '.##.'], R: ['###.', '#..#', '###.', '#.#.', '#..#'],
    T: ['####', '.#..', '.#..', '.#..', '.#..'], U: ['#..#', '#..#', '#..#', '#..#', '.##.'] };
  function word45(g, x, y, wd, c) { [...wd].forEach((ch, i) => (F45[ch] || []).forEach((row, j) => { for (let k = 0; k < 4; k++) if (row[k] === '#') P(g, x + i * 5 + k, y + j, 1, 1, c); })); }
  AR.word45 = word45; AR.F45 = F45;                                             // спільний жирний шрифт 4×5 для вивісок інших епох
  function wordSign(g, hx, hw, top, wd, ne, ne2, hs) {
    let sw = wd.length * 5 + 7; if (sw > hw - 2) { wd = wd.slice(0, Math.max(3, Math.floor((hw - 9) / 5))); sw = wd.length * 5 + 7; }
    const sx = hx + 1 + (hs >>> 6) % Math.max(1, hw - sw - 1), sh = 11, sy = top - 4 - sh - 4;
    [sx + 3, sx + sw - 4].forEach(px => { P(g, px, sy + sh, 1, top - sy - sh, '#3a3e50'); P(g, px + 1, sy + sh, 1, top - sy - sh, '#22263a'); });      // опори
    for (let y = sy + sh + 1; y < top - 1; y += 2) P(g, sx + 4, y, sw - 8, 1, '#2a2e40');                                                           // ферма між опорами
    A(g, 0.16, () => P(g, sx - 3, sy - 3, sw + 6, sh + 6, ne)); A(g, 0.26, () => P(g, sx - 1, sy - 1, sw + 2, sh + 2, ne));                        // ореол
    P(g, sx, sy, sw, sh, '#05050c'); P(g, sx + 1, sy + 1, sw - 2, sh - 2, mix(ne, '#05050c', 0.88));
    P(g, sx, sy, sw, 1, ne); P(g, sx, sy + sh - 1, sw, 1, ne); P(g, sx, sy, 1, sh, ne); P(g, sx + sw - 1, sy, 1, sh, ne);                             // зовнішня трубка
    A(g, 0.55, () => { P(g, sx + 2, sy + 2, sw - 4, 1, ne2); P(g, sx + 2, sy + sh - 3, sw - 4, 1, ne2); });                                      // внутрішня трубка іншого кольору
    [[sx, sy], [sx + sw - 1, sy], [sx, sy + sh - 1], [sx + sw - 1, sy + sh - 1]].forEach(([px, py]) => P(g, px, py, 1, 1, '#ffffff'));                // лампи-кутики
    word45(g, sx + 4, sy + 4, wd, '#000000');                                                                                                     // тінь літер
    A(g, 0.35, () => { word45(g, sx + 3, sy + 2, wd, ne); word45(g, sx + 4, sy + 3, wd, ne); });                                                  // світіння літер
    word45(g, sx + 3, sy + 3, wd, mix(ne, '#ffffff', 0.55));                                                                                      // самі літери: світла серцевина трубки
  }
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
    if (k === 0 && w >= 30) wordSign(g, x, w, top, WORDS[(hs >>> 5) % WORDS.length], ne, ne2, hs);
    else if (k === 1) holo(g, x + 4 + (hs >>> 5) % Math.max(1, w - 24), top - 14, 18, 10, hs);
    else if (k === 2) { const ax = x + 8 + (hs >>> 5) % Math.max(1, w - 16); P(g, ax, top - 18, 1, 15, '#4a4e60'); P(g, ax - 2, top - 14, 5, 1, '#4a4e60'); P(g, ax - 3, top - 10, 7, 1, '#4a4e60'); P(g, ax - 1, top - 19, 3, 1, '#ff3a3a'); }
    else if (k === 3) { P(g, x + 4, top - 8, 8, 5, '#2a2e40'); D(g, x + 8, top - 6, 2, '#0a0a14'); P(g, x + 14, top - 6, 6, 3, '#2a2e40'); }
    if (V2()) for (let y = top + 18; y < base - 24; y += 38) { const ax = x + 3 + (hash2(x, y) % Math.max(1, w - 12)); acUnit(g, ax, y); }      // v2: кондиціонери на фасаді
    // труби по стіні
    if ((hs >>> 9) % 2) { P(g, x + w - 5, top + 6, 2, h - 14, '#3a3e50'); P(g, x + w - 5, top + 6, 1, h - 14, '#5a5e72'); for (let y = top + 14; y < base - 8; y += 18) P(g, x + w - 6, y, 4, 1, '#1a1e2c'); }
    // вікна
    const floors = Math.max(1, Math.floor((h - 6) / 19)), doorW = 10, DG = AR.doorGrid(x, w, hs, 14, 6, 3), doorX = Math.round(DG.cx - 5), doorOk = !nearLamp(doorX - 2, doorX + doorW + 2, lamps);
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 19 + 3, cols = Math.max(1, Math.floor((w - 6) / 14)), sp = (w - 6) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(x + 3 + c * sp + (sp - 7) / 2), r = hash2(wx, y0), lit = r % 3 !== 0, col = NE[(r >>> 4) % 4];
        if (f === floors - 1 && doorOk && Math.abs((wx + 3.5) - DG.cx) < 15) continue;
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

