//#part 150_b_facade_epoch_props_roof.js
function withPal(map, fn) {                   // тимчасово підміняє кольори палітри на час малювання
  if (!map) { fn(); return; }
  const sv = {}; Object.keys(map).forEach(k => { sv[k] = PALETTE[k]; PALETTE[k] = PALETTE[map[k]]; });
  try { fn(); } finally { Object.keys(sv).forEach(k => { PALETTE[k] = sv[k]; }); }
}
function bandG(g, w, y, band) {               // візерунок на карнизі (рядки y+1, y+2)
  if (!band) return;
  const kind = band[0], c = band[1];
  for (let x = 2; x < w - 2; x++) {
    if (kind === 'checker') { if (((x >> 1) & 1) === 0) R(g, x, y + 1, 1, 1, c); else R(g, x, y + 2, 1, 1, c); }
    else if (kind === 'dots') { if (x % 5 === 2) R(g, x, y + 1, 1, 2, c); }
    else if (kind === 'leaf') { if (x % 6 === 1) { R(g, x, y + 1, 2, 1, c); R(g, x + 1, y + 2, 1, 1, c); } }
    else if (kind === 'zig') { R(g, x, y + 1 + (((x >> 1) & 1)), 1, 1, c); }
  }
}
function vinesG(g, x, y, len) {               // ліани, що звисають зверху
  for (let i = 0; i < len; i++) { const dx = (i % 6 < 3 ? 0 : 1); R(g, x + dx, y + i, 1, 1, i % 4 === 3 ? 'g' : 'G'); if (i % 5 === 2) R(g, x + dx + 1, y + i, 2, 1, 'g'); if (i % 9 === 4) R(g, x + dx - 1, y + i, 1, 1, 'p'); }
}
function neonLine(g, x, y, w, h, c) {         // неонова трубка: яскрава серцевина + слабке сяйво
  g.globalAlpha = 0.28; R(g, x - 1, y - 1, w + 2, h + 2, c); g.globalAlpha = 1; R(g, x, y, w, h, c);
}
// Рисочки епохи на фасаді (виконуються після основного фасаду)
/* ---------- Деталізація фасаду під кожну епоху: таверна, закусочна, диско-клуб, аркада, інтернет-магазин, еко-ринок, космостанція, неон ---------- */
function barrelG(g, x, yb) {                       // діжка: 9×11
  R(g, x, yb - 11, 9, 11, 'd'); R(g, x + 1, yb - 10, 7, 9, 'b'); R(g, x + 1, yb - 10, 2, 9, 'l');
  R(g, x, yb - 8, 9, 1, 'd'); R(g, x, yb - 3, 9, 1, 'd'); R(g, x + 3, yb - 6, 3, 2, 'h');
}
function crateG(g, x, yb, c) { R(g, x, yb - 8, 10, 8, 'd'); R(g, x + 1, yb - 7, 8, 6, c); R(g, x + 1, yb - 7, 8, 1, 'w'); R(g, x + 4, yb - 7, 2, 6, 'd'); }
function speakerG(g, x, yb) {                       // колонка: 10×16 із двома динаміками
  R(g, x, yb - 16, 10, 16, 'k'); R(g, x + 1, yb - 15, 8, 14, 'z'); disc(g, x + 5, yb - 11, 3, 'k'); disc(g, x + 5, yb - 11, 1, 'e'); disc(g, x + 5, yb - 5, 2, 'k'); disc(g, x + 5, yb - 5, 1, 'e');
}
function cabinetG(g, x, yb, c) {                    // ігровий автомат: 13×22
  R(g, x, yb - 22, 13, 22, 'k'); R(g, x + 1, yb - 21, 11, 20, c); R(g, x + 2, yb - 19, 9, 8, 'k'); R(g, x + 3, yb - 18, 7, 6, 's'); R(g, x + 4, yb - 17, 2, 2, 'y'); R(g, x + 7, yb - 15, 2, 2, 'r');
  R(g, x + 2, yb - 9, 9, 3, 'd'); R(g, x + 4, yb - 8, 1, 1, 'r'); R(g, x + 7, yb - 8, 2, 1, 'y'); R(g, x + 1, yb - 3, 11, 3, 'd');
}
function lockerG(g, x, yb) {                        // посилкові комірки: 18×18
  R(g, x, yb - 18, 18, 18, 'd'); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { R(g, x + 1 + i * 6, yb - 17 + j * 6, 5, 5, [['T', 'S', 'y'], ['p', 'T', 'S'], ['S', 'y', 'p']][j][i]); R(g, x + 4 + i * 6, yb - 15 + j * 6, 1, 1, 'd'); }
}
function bannerHang(g, x, y, c1, c2, n) { for (let i = 0; i < n; i++) { R(g, x + i * 6, y, 5, 1, 'd'); for (let k = 0; k < 4; k++) R(g, x + i * 6 + k, y + 1 + k, 5 - k - (k > 2 ? 1 : 0), 1, i % 2 ? c1 : c2); } }
function solarG(g, x, y, n) { for (let i = 0; i < n; i++) { R(g, x + i * 10, y, 9, 4, 'd'); R(g, x + i * 10 + 1, y + 1, 7, 2, 'n'); R(g, x + i * 10 + 4, y + 1, 1, 2, 'a'); R(g, x + i * 10 + 3, y + 4, 3, 2, 'd'); } }
function dishG(g, x, y) { for (let a = -5; a <= 5; a++) { const hh = Math.round(Math.sqrt(25 - a * a) * 0.8); R(g, x + a, y - hh, 1, hh + 1, 'E'); } R(g, x, y - 5, 1, 7, 'd'); R(g, x - 3, y + 2, 7, 1, 'd'); R(g, x + 1, y - 6, 1, 1, 'r'); }
function hologram(g, x, y, w, h, c) { g.globalAlpha = 0.35; R(g, x, y, w, h, c); g.globalAlpha = 1; for (let k = 2; k < h; k += 3) { g.globalAlpha = 0.6; R(g, x, y + k, w, 1, 'w'); g.globalAlpha = 1; } R(g, x, y, w, 1, c); R(g, x, y + h - 1, w, 1, c); R(g, x, y, 1, h, c); R(g, x + w - 1, y, 1, h, c); }
function epochFacadeDeco(g, es, w, h, look, level, floors, yG, door, yB) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.facadeDeco) return A.facadeDeco(g, es, w, h, look, level, floors, yG, door, yB); }
  const top = look.top, f0 = floors[0], yb = h - 7, big = level >= 4;
  const L0 = 11, L1 = door.x - 6, R0 = door.x + door.w + 6, R1 = w - 12;           // вільні місця біля дверей на нижньому поверсі
  const slotsL = level >= 3 ? 2 : 1, slotsR = level >= 3 ? 2 : 1;                         // по одній (рівні 1–2) чи по дві (з 3-го) тематичні деталі з кожного боку від дверей
  const flat = es.flat;
  switch (es.fx) {
    case 'renaissance': {                              // таверна: дерев'яні балки, діжки, вивіска з кухлем
      for (let i = 0; i < slotsL; i++) barrelG(g, L0 + i * 13, yb);
      if (slotsR > 1) for (let i = 0; i < slotsR - 1; i++) barrelG(g, R1 - 9 - i * 13, yb); else barrelG(g, R1 - 9, yb);
      const bx = w - 38, by = yG + 12;                 // кронштейн і дошка-вивіска «кухоль»
      R(g, bx, by, 18, 2, 'd'); R(g, bx + 17, by - 4, 2, 6, 'd'); R(g, bx + 2, by + 2, 1, 4, 'd'); R(g, bx + 14, by + 2, 1, 4, 'd');
      R(g, bx, by + 6, 17, 13, 'd'); R(g, bx + 1, by + 7, 15, 11, 'l'); R(g, bx + 1, by + 7, 15, 1, 'c');
      R(g, bx + 5, by + 9, 6, 7, 'w'); R(g, bx + 5, by + 9, 6, 2, 'y'); R(g, bx + 11, by + 10, 2, 4, 'w'); R(g, bx + 6, by + 15, 4, 1, 'd');
      [[11, yG + 14], [w - 15, yG + 14]].forEach(p => lanternG(g, p[0], p[1]));
      break;
    }
    case 'retro': {                                    // закусочна 50-х: хромова смужка, неонова стрілка, джюкбокс
      for (let x = 4; x < w - 4; x++) R(g, x, yB, 1, 1, (x >> 1) % 2 ? 'w' : 'E');
      R(g, 4, yB + 1, w - 8, 1, 'e');
      for (let x = 8; x < w - 20; x += 5) R(g, x, top + 7, 1, 1, 'q');
      const jx = L0 + 4; R(g, jx, yb - 20, 14, 20, 'd'); R(g, jx + 1, yb - 19, 12, 18, 'p'); R(g, jx + 3, yb - 16, 8, 8, 'd'); R(g, jx + 4, yb - 15, 6, 6, 'y'); R(g, jx + 6, yb - 14, 2, 4, 'r'); R(g, jx + 2, yb - 6, 10, 3, 'd'); R(g, jx + 3, yb - 5, 8, 1, 'q'); R(g, jx + 3, yb - 20, 8, 1, 'f');
      const sx = R0 + 3; R(g, sx, yb - 13, 9, 13, 'd'); R(g, sx + 1, yb - 12, 7, 11, 'w'); R(g, sx + 2, yb - 11, 5, 3, 'r'); R(g, sx + 2, yb - 7, 5, 5, 'S'); R(g, sx + 3, yb - 4, 3, 1, 'p'); R(g, sx + 4, yb - 14, 1, 1, 'r');   // молочний коктейль
      [[w - 20, top + 12], [10, top + 12]].forEach(p => { R(g, p[0], p[1], 1, 4, 'f'); R(g, p[0] - 1, p[1] + 1, 3, 1, 'f'); });
      break;
    }
    case 'disco': {                                    // диско-клуб: дзеркальна куля, колонки, промені
      const bx = (w >> 1) - 40; R(g, bx, yG + 8, 1, 5, 'd'); disc(g, bx, yG + 18, 6, 'd'); disc(g, bx, yG + 18, 5, 'E');
      for (let a = -5; a <= 5; a += 2) for (let b = -5; b <= 5; b += 2) if (a * a + b * b < 24) R(g, bx + a, yG + 18 + b, 1, 1, ((a + b) / 2) & 1 ? 'w' : 'S'); R(g, bx - 2, yG + 15, 2, 1, 'w');
      g.globalAlpha = 0.18; for (let i = 0; i < 4; i++) for (let k = 0; k < 24; k++) R(g, bx - 18 + i * 12 + (k >> 1) * (i - 1.5) * 0.7, yG + 20 + k, 3, 1, ['f', 'T', 'y', 'p'][i]); g.globalAlpha = 1;
      for (let i = 0; i < slotsL; i++) speakerG(g, L0 + 1 + i * 13, yb);
      for (let i = 0; i < slotsR; i++) speakerG(g, R1 - 10 - i * 13, yb);
      break;
    }
    case 'arcade': {                                   // зал ігрових автоматів
      for (let i = 0; i < Math.min(2, Math.max(1, Math.floor((L1 - L0) / 14))); i++) cabinetG(g, L0 + i * 14, yb, ['v', 'f', 'T'][i % 3]);
      for (let i = 0; i < Math.min(2, Math.max(1, Math.floor((R1 - R0) / 14))); i++) cabinetG(g, R1 - 13 - i * 14, yb, ['T', 'f', 'v'][i % 3]);
      ['.#.#.', '#####', '##.##', '#####', '.#.#.'].forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') { R(g, 8 + rx, yG - 12 + ry, 1, 1, 'T'); R(g, w - 14 + rx, yG - 12 + ry, 1, 1, 'f'); } });   // піксельні прибульці на стіні
      R(g, door.x + (door.w >> 1) - 1, yG - 14, 2, 12, 'd'); disc(g, door.x + (door.w >> 1), yG - 15, 3, 'r');         // великий джойстик над входом
      break;
    }
    case 'internet': {                                 // інтернет-магазин: Wi-Fi, поштомати-комірки, антена, стрічка новин
      for (let a = 1; a <= 3; a++) for (let t2 = -a * 2; t2 <= a * 2; t2++) { const yy = Math.round(Math.sqrt(Math.max(0, a * a * 6 - t2 * t2)) * 0.6); if (yy > 0) R(g, 12 + t2 + 6, yB - yy - 2, 1, 1, 'a'); }
      R(g, 17, yB - 1, 2, 2, 'a');
      for (let i = 0; i < 1; i++) lockerG(g, L0 + i * 20, yb);
      for (let i = 0; i < 1; i++) { const rx = R1 - 18 - i * 20; R(g, rx, yb - 18, 18, 18, 'd'); R(g, rx + 1, yb - 17, 16, 16, 'k'); for (let k = 0; k < 4; k++) R(g, rx + 2, yb - 15 + k * 4, 14 - (k * 3) % 5, 2, k % 2 ? 'a' : 'T'); }
      if (flat) { dishG(g, w - 22, 10); dishG(g, 24, 12); }
      break;
    }
    case 'eco': {                                      // еко-ринок: дерев'яні рейки, кадки з деревами, сонячні панелі
      for (let i = 0; i < slotsL; i++) { const px = L0 + 2 + i * 13; R(g, px, yb - 6, 9, 6, 'b'); R(g, px, yb - 6, 9, 1, 'l'); disc(g, px + 4, yb - 12, 5, 'G'); disc(g, px + 4, yb - 12, 4, 'g'); R(g, px + 3, yb - 8, 3, 3, 'b'); R(g, px + 2, yb - 14, 2, 2, 'm'); }
      for (let i = 0; i < slotsR; i++) { const px = R1 - 12 - i * 13; R(g, px, yb - 6, 9, 6, 'b'); R(g, px, yb - 6, 9, 1, 'l'); R(g, px + 1, yb - 12, 7, 6, 'g'); R(g, px + 2, yb - 14, 2, 2, 'p'); R(g, px + 5, yb - 13, 2, 2, 'y'); R(g, px + 3, yb - 11, 3, 5, 'G'); }
      if (flat) { solarG(g, 14, 0, Math.min(5, Math.floor((w - 70) / 10))); R(g, w - 24, 0, 1, 1, 'd'); }
      break;
    }
    case 'space': {                                    // космічна станція: шви обшивки, попереджувальні смуги, антени
      for (let i = 0; i < 8; i++) { R(g, door.x - 12 + i * 3, yG + 8, 2, 2, i % 2 ? 'y' : 'd'); R(g, door.x + 4 + door.w - 12 + i * 3 - 12 + 12, yG + 8, 0, 0, 'd'); }
      for (let x = door.x - 4; x < door.x + door.w + 4; x += 4) R(g, x, yG + 8, 2, 2, ((x - door.x) / 4 | 0) % 2 ? 'y' : 'k');
      for (let i = 0; i < slotsL; i++) { const px = L0 + i * 13; R(g, px, yb - 14, 10, 14, 'd'); R(g, px + 1, yb - 13, 8, 12, 'e'); disc(g, px + 5, yb - 8, 3, 'n'); disc(g, px + 5, yb - 8, 2, 's'); R(g, px + 4, yb - 9, 1, 1, 'w'); }
      for (let i = 0; i < slotsR; i++) { const px = R1 - 11 - i * 13; R(g, px, yb - 12, 9, 12, 'd'); R(g, px + 1, yb - 11, 7, 10, 'z'); R(g, px + 2, yb - 9, 5, 1, 'T'); R(g, px + 2, yb - 7, 3, 1, 'T'); R(g, px + 2, yb - 5, 4, 1, 'f'); }
      if (flat) { R(g, 18, 0, 1, 8, 'd'); R(g, 15, 2, 7, 1, 'd'); R(g, 16, 4, 5, 1, 'd'); R(g, 18, 0, 1, 1, 'r'); R(g, w - 36, 2, 1, 6, 'd'); R(g, w - 38, 2, 5, 1, 'e'); }
      break;
    }
    case 'neon': {                                     // неонове місто: голографічна реклама, світні стовпи, дрон
      if (flat) { const ks = lastRoofSign, hl = ks ? Math.max(0, Math.min(10, ks.x - 41)) : 10, hr = ks ? Math.min(w - 34, Math.max(w - 46, ks.x + ks.w + 7)) : w - 46;
        hologram(g, hl, 1, 34, 12, 'I'); R(g, hl + 4, 4, 14, 1, 'w'); R(g, hl + 4, 7, 20, 1, 'A'); hologram(g, hr, 0, 34, 14, 'A'); R(g, hr + 4, 4, 18, 1, 'w'); R(g, hr + 4, 8, 10, 1, 'I'); }
      for (let i = 0; i < slotsL; i++) { const px = L0 + 3 + i * 13; R(g, px, yb - 18, 3, 18, 'k'); R(g, px + 1, yb - 18, 1, 18, i % 2 ? 'A' : 'I'); R(g, px - 2, yb - 22, 7, 4, 'k'); R(g, px - 1, yb - 21, 5, 2, i % 2 ? 'I' : 'A'); }
      for (let i = 0; i < slotsR; i++) { const px = R1 - 6 - i * 13; R(g, px, yb - 18, 3, 18, 'k'); R(g, px + 1, yb - 18, 1, 18, i % 2 ? 'I' : 'A'); R(g, px - 2, yb - 22, 7, 4, 'k'); R(g, px - 1, yb - 21, 5, 2, i % 2 ? 'A' : 'I'); }
      neonLine(g, door.x - 2, yG + 10, 1, 24, 'I'); neonLine(g, door.x + door.w + 1, yG + 10, 1, 24, 'A');
      break;
    }
  }
}


// Додаткові тематичні деталі на верхніх поверхах і біля вивіски: щоб магазини різних епох не були однаковими
function epochFacadeExtra(g, es, w, h, look, level, floors, yG, door, yB) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.facadeExtra) return A.facadeExtra(g, es, w, h, look, level, floors, yG, door, yB); }
  if (level < 2) return;
  const fx = es.fx, ups = floors.filter(fl => fl.f >= 1), yb = h - 7, top = look.top;
  const colL = 12, colR = w - 22, art = (x, y, rows, cm) => rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] !== '.') R(g, x + i, y + j, 1, 1, cm ? cm[row[i]] || row[i] : row[i]); });
  const INV = ['..#...#..', '...#.#...', '..#####..', '.##.#.##.', '#########', '#.#####.#', '#.#...#.#'];
  if (fx === 'renaissance' && level >= 3) [9, w - 16].forEach(bx => {                                                // знамена під вивіскою
    const by = top + 26; R(g, bx, by, 7, 12, 'd'); R(g, bx + 1, by + 1, 5, 10, 'r'); R(g, bx + 3, by + 1, 1, 10, 'y');
    R(g, bx + 1, by + 12, 5, 1, 'r'); R(g, bx + 2, by + 13, 3, 1, 'r'); R(g, bx + 3, by + 14, 1, 1, 'r');
  });
  if (fx === 'retro' && level >= 2) {                                                                                  // смугастий стовпчик перукарні біля дверей
    const px = door.x - 5; R(g, px - 1, yb - 20, 5, 20, 'd'); R(g, px, yb - 19, 3, 18, 'w');
    for (let k = 0; k < 18; k += 4) R(g, px, yb - 19 + k, 3, 2, 'r'); R(g, px - 1, yb - 22, 5, 2, 'd'); R(g, px, yb - 21, 3, 1, 'y');
  }
  ups.forEach((fl, n) => {
    const t0 = fl.top, fy = fl.fy, hF = fy - t0;
    switch (fx) {
      case 'renaissance':                                                                                              // ящики з квітами на підвіконнях
        [colL, colR].forEach((x, k) => { R(g, x, fy - 3, 10, 3, 'd'); R(g, x + 1, fy - 2, 8, 1, 'b'); for (let i = 0; i < 5; i++) { R(g, x + 1 + i * 2, fy - 5 - (i & 1), 1, 3, 'G'); R(g, x + 1 + i * 2, fy - 6 - (i & 1), 1, 1, ['r', 'y', 'p', 'w', 'r'][(i + k + n) % 5]); } });
        break;
      case 'retro':                                                                                                   // вінілові платівки й зірки на стіні
        disc(g, 18, t0 + 13, 6, 'd'); disc(g, 18, t0 + 13, 5, 'k'); disc(g, 18, t0 + 13, 2, n % 2 ? 'p' : 'y'); R(g, 14, t0 + 9, 3, 1, 'w');
        disc(g, w - 18, t0 + 13, 5, 'd'); disc(g, w - 18, t0 + 13, 4, 'y'); disc(g, w - 18, t0 + 13, 2, 'r');
        break;
      case 'disco':                                                                                                   // світлова доріжка вздовж підлоги
        for (let x = 9; x < w - 9; x += 2) { R(g, x, fy - 2, 2, 1, (x >> 1) % 2 ? 'w' : 'S'); if ((x >> 1) % 4 === n % 4) R(g, x, fy - 3, 2, 1, ['f', 'T', 'y', 'p'][(x >> 3) % 4]); }
        break;
      case 'arcade':                                                                                                  // піксельні прибульці на стінах
        art(11, t0 + 6, INV, { '#': ['g', 'f', 'T'][n % 3] }); art(w - 20, t0 + 6, INV, { '#': ['T', 'g', 'f'][n % 3] });
        break;
      case 'internet': {                                                                                              // ряд іконок застосунків і QR-код
        for (let r2 = 0; r2 < 2; r2++) for (let c2 = 0; c2 < 3; c2++) { R(g, 11 + c2 * 5, t0 + 6 + r2 * 5, 4, 4, 'd'); R(g, 12 + c2 * 5, t0 + 7 + r2 * 5, 2, 2, ['a', 'g', 'f', 'y', 'T', 'n'][(c2 + r2 * 3 + n) % 6]); }
        const qx = w - 20, qy = t0 + 6; R(g, qx - 1, qy - 1, 10, 10, 'w'); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if (((i * 7 + j * 13 + n * 5) % 5) < 2 || (i < 2 && j < 2)) R(g, qx + i, qy + j, 1, 1, 'k');
        break;
      }
      case 'eco':                                                                                                     // зелена стіна: ліани й горщики
        vinesG(g, 13, t0 + 3, Math.min(16, hF - 8)); vinesG(g, w - 15, t0 + 3, Math.min(14, hF - 8)); vinesG(g, 19, t0 + 3, Math.min(9, hF - 10));
        break;
      case 'space':                                                                                                   // ілюмінатори
        [[16, t0 + 13], [w - 17, t0 + 13]].forEach(([px, py]) => { disc(g, px, py, 5, 'd'); disc(g, px, py, 4, 'e'); disc(g, px, py, 3, n % 2 ? 'n' : 'z'); R(g, px - 2, py - 2, 2, 1, 'w'); });
        break;
      case 'neon':                                                                                                    // неонові смуги вздовж поверху й по краях
        neonLine(g, 9, fy - 2, w - 18, 1, n % 2 ? 'I' : 'A'); neonLine(g, 11, t0 + 5, 1, hF - 9, n % 2 ? 'A' : 'I'); neonLine(g, w - 12, t0 + 5, 1, hF - 9, n % 2 ? 'I' : 'A');
        break;
    }
  });
  if (fx === 'eco' && es.flat && level >= 3) [34, w - 40].forEach(tx => {                                              // вітряки на даху
    R(g, tx, top - 16, 1, 16, 'd'); R(g, tx - 5, top - 17, 5, 1, 'w'); R(g, tx + 1, top - 17, 5, 1, 'w'); R(g, tx, top - 22, 1, 5, 'w'); R(g, tx, top - 17, 1, 2, 'd');
  });
}

/* ---------- Вивіска й дах: окремий вигляд під кожну епоху ---------- */
// Прикраси по краях вивіски (текст лежить посередині, тож малюємо ліворуч і праворуч) та рамка в стилі епохи
function signMotif(g, es, w, top) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.signMotif) return A.signMotif(g, es, w, top); }
  const y0 = top + 8, y1 = top + 24, mx = [10, w - 10];                       // межі вивіски й центри лівої/правої прикраси
  switch (es.fx) {
    case 'renaissance':                                                        // дерев'яна дошка з гербовими щитами та ланцюгами
      mx.forEach(x => { R(g, x - 5, y0 + 3, 11, 11, 'd'); R(g, x - 4, y0 + 4, 9, 9, 'r'); R(g, x - 4, y0 + 4, 9, 2, 'y'); R(g, x - 1, y0 + 6, 3, 7, 'w'); R(g, x - 3, y0 + 8, 7, 2, 'w'); R(g, x - 4, y0 + 13, 9, 1, 'd'); });
      for (let x = 22; x < w - 22; x += 14) { R(g, x, y0 + 1, 1, 1, 'y'); R(g, x + 7, y1 - 1, 1, 1, 'y'); }
      R(g, 26, y0 - 6, 1, 6, 'd'); R(g, w - 27, y0 - 6, 1, 6, 'd');
      break;
    case 'retro':                                                              // хром, ромби й зірки
      for (let x = 6; x < w - 6; x++) { R(g, x, y0 + 1, 1, 1, (x >> 1) % 2 ? 'w' : 'E'); R(g, x, y1 - 1, 1, 1, (x >> 1) % 2 ? 'E' : 'w'); }
      mx.forEach(x => { ['..#..', '.###.', '#####', '.###.', '..#..'].forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') R(g, x - 2 + rx, y0 + 5 + ry, 1, 1, 'f'); }); R(g, x - 1, y0 + 6, 3, 1, 'q'); });
      break;
    case 'disco':                                                              // маркізні лампочки і дзеркальні кулі
      for (let x = 7; x < w - 7; x += 4) { R(g, x, y0, 2, 2, (x >> 2) % 2 ? 'y' : 'f'); R(g, x, y1 - 1, 2, 2, (x >> 2) % 2 ? 'f' : 'y'); }
      mx.forEach(x => { disc(g, x, y0 + 8, 5, 'd'); disc(g, x, y0 + 8, 4, 'E'); [[-2, -2], [1, -1], [-1, 1], [2, 2], [0, -3]].forEach(p => R(g, x + p[0], y0 + 8 + p[1], 1, 1, 'w')); R(g, x, y0 + 2, 1, 2, 'd'); });
      break;
    case 'arcade':                                                             // піксельні прибульці та сітка
      mx.forEach((x, i) => { ['.#.....#.', '..#...#..', '.#######.', '##.###.##', '#########', '#.#####.#', '#.#...#.#', '...##.##.'].forEach((row, ry) => { for (let rx = 0; rx < 9; rx++) if (row[rx] === '#') R(g, x - 4 + rx, y0 + 4 + ry, 1, 1, i ? 'f' : 'T'); }); });
      for (let x = 24; x < w - 24; x += 6) R(g, x, y1 - 1, 3, 1, (x / 6 | 0) % 2 ? 'f' : 'T');
      break;
    case 'internet':                                                           // вікно браузера: кнопки, адресний рядок
      R(g, 7, y0 + 1, w - 14, 4, 'e'); R(g, 7, y0 + 1, w - 14, 1, 'E'); R(g, 9, y0 + 2, 2, 2, 'r'); R(g, 13, y0 + 2, 2, 2, 'y'); R(g, 17, y0 + 2, 2, 2, 'g');
      R(g, 24, y0 + 2, w - 48, 2, 'w'); R(g, w - 20, y0 + 2, 10, 2, 'a');
      [w - 9].forEach(x => { disc(g, x, y0 + 10, 3, 'a'); R(g, x - 1, y0 + 9, 3, 2, 'n'); });
      R(g, 9, y0 + 8, 6, 5, 'a'); R(g, 10, y0 + 9, 4, 3, 'n'); R(g, 11, y0 + 12, 2, 1, 'a');
      break;
    case 'eco':                                                                // вінки з листя й ліани
      mx.forEach(x => { for (let a = 0; a < 12; a++) { const ang = a / 12 * Math.PI * 2; R(g, Math.round(x + Math.cos(ang) * 5), Math.round(y0 + 9 + Math.sin(ang) * 5), 2, 2, a % 3 ? 'g' : 'm'); } R(g, x - 1, y0 + 8, 2, 2, 'p'); R(g, x + 1, y0 + 10, 2, 2, 'y'); });
      for (let x = 20; x < w - 20; x += 9) { R(g, x, y0, 1, 2 + (x % 3), 'g'); R(g, x - 1, y0 + 2 + (x % 3), 3, 1, 'm'); }
      break;
    case 'space':                                                              // металева панель із болтами й попереджувальними смугами
      mx.forEach((x, i) => { for (let k = 0; k < 11; k++) { R(g, x - 6 + k, y0 + 2 + (k % 4), 1, 2, 'y'); } for (let k = 0; k < 11; k++) { R(g, x - 6 + k, y0 + 11 + (k % 4) % 3, 1, 2, 'k'); } R(g, x - 6, y0 + 2, 12, 1, 'd'); R(g, x - 6, y0 + 14, 12, 1, 'd'); });
      for (let x = 24; x < w - 24; x += 10) { R(g, x, y0 + 1, 1, 1, 'E'); R(g, x, y1 - 1, 1, 1, 'E'); }
      break;
    case 'neon':                                                               // неонова трубка по контуру та стрілки
      neonLine(g, 7, y0 + 1, w - 14, 1, 'A'); neonLine(g, 7, y1 - 1, w - 14, 1, 'I'); neonLine(g, 7, y0 + 1, 1, 15, 'I'); neonLine(g, w - 8, y0 + 1, 1, 15, 'A');
      mx.forEach((x, i) => { for (let k = 0; k < 4; k++) { R(g, x - 3 + k, y0 + 4 + k, 1, 1, i ? 'I' : 'A'); R(g, x - 3 + k, y0 + 12 - k, 1, 1, i ? 'I' : 'A'); R(g, x + 1 + k, y0 + 4 + k, 1, 1, i ? 'A' : 'I'); R(g, x + 1 + k, y0 + 12 - k, 1, 1, i ? 'A' : 'I'); } });
      break;
  }
}
// Велика примітна деталь на даху в центрі: те, що одразу видно здалеку
function roofProp(g, es, w, top, level, cx) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.roofProp) return A.roofProp(g, es, w, top, level, cx); }
  cx = cx || (w >> 1); const y = Math.max(0, top - 8);
  switch (es.fx) {
    case 'renaissance': R(g, cx - 1, y - 2, 2, 12, 'd'); R(g, cx - 5, y + 2, 10, 1, 'd'); [[-5, 0], [4, 0]].forEach(p => R(g, cx + p[0], y + p[1] + 1, 2, 2, 'd')); R(g, cx, y - 3, 6, 3, 'r'); R(g, cx + 5, y - 2, 2, 1, 'y'); break;   // флюгер-півник
    case 'retro': R(g, cx - 1, y - 3, 3, 14, 'd'); for (let a = -2; a <= 2; a++) R(g, cx - 6 + Math.abs(a), y - 2 + a + 2, 12 - 2 * Math.abs(a), 1, a % 2 ? 'f' : 'p'); R(g, cx - 6, y + 3, 12, 1, 'd'); break;                          // пілон-зірка
    case 'disco': disc(g, cx, y + 4, 7, 'd'); disc(g, cx, y + 4, 6, 'E'); for (let a = -6; a <= 6; a += 2) for (let b = -6; b <= 6; b += 2) if (a * a + b * b < 30) R(g, cx + a, y + 4 + b, 1, 1, ((a + b) / 2) & 1 ? 'w' : 'S'); R(g, cx - 3, y + 1, 2, 1, 'w'); R(g, cx, y - 4, 1, 3, 'd'); break;
    case 'arcade': disc(g, cx, y + 4, 8, 'd'); disc(g, cx, y + 4, 7, 'y'); R(g, cx + 1, y + 3, 8, 3, 'd'); R(g, cx + 1, y + 4, 7, 1, 'd'); R(g, cx - 2, y + 0, 2, 2, 'd'); [[11, 4], [14, 4]].forEach(p => R(g, cx + p[0], y + p[1], 2, 2, 'y')); break;                                    // піксельний «Пакман» із крапками
    case 'internet': for (let a = 1; a <= 3; a++) for (let t2 = -a * 3; t2 <= a * 3; t2++) { const yy = Math.round(Math.sqrt(Math.max(0, a * a * 11 - t2 * t2)) * 0.7); if (yy > 0) R(g, cx + t2, y + 10 - yy, 1, 1, 'a'); } disc(g, cx, y + 10, 2, 'a'); R(g, cx - 1, y + 10, 3, 1, 'n'); break;
    case 'eco': R(g, cx - 1, y + 2, 2, 12, 'w'); for (let k = 0; k < 3; k++) { const a = k * 2.09 + 0.5; for (let i = 1; i < 8; i++) R(g, cx + Math.cos(a) * i, y + 2 + Math.sin(a) * i, 1, 1, 'w'); } R(g, cx - 1, y + 1, 3, 3, 'g'); break;                                       // вітряк
    case 'space': R(g, cx - 2, y + 2, 5, 11, 'w'); R(g, cx - 2, y + 2, 5, 1, 'd'); R(g, cx - 1, y - 2, 3, 4, 'r'); R(g, cx, y - 4, 1, 2, 'r'); R(g, cx - 5, y + 9, 3, 4, 'r'); R(g, cx + 3, y + 9, 3, 4, 'r'); R(g, cx - 1, y + 5, 3, 3, 's'); break;                     // ракета
    case 'neon': hologram(g, cx - 18, y - 2, 36, 12, 'I'); R(g, cx - 14, y + 1, 18, 1, 'w'); R(g, cx - 14, y + 4, 28, 1, 'A'); R(g, cx - 14, y + 7, 12, 1, 'I'); break;
  }
}

function epochFacadeFx(g, es, w, h, look, level, floors, yG) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.facadeFx) return A.facadeFx(g, es, w, h, look, level, floors, yG); }
  const top = look.top, flatTop = es.flat && level <= 3;
  switch (es.fx) {
    case 'renaissance':
      for (let x = 14; x < w - 12; x += 12) { R(g, x, top + 11, 1, 1, 'y'); R(g, x + 4, top + 21, 1, 1, 'y'); }
      break;
    case 'retro':
      [[8, top + 9], [w - 10, top + 9], [8, top + 21], [w - 10, top + 21]].forEach(p => { R(g, p[0], p[1], 1, 3, 'y'); R(g, p[0] - 1, p[1] + 1, 3, 1, 'y'); });
      break;
    case 'disco':
      for (let x = 8; x < w - 8; x += 4) { R(g, x, top + 8, 1, 1, (x >> 2) % 2 ? 'y' : 'f'); R(g, x, top + 24, 1, 1, (x >> 2) % 2 ? 'f' : 'y'); }
      break;
    case 'arcade':
      if (flatTop) { ['.#...#.', '..###..', '.##.##.', '#######', '#.#.#.#'].forEach((row, ry) => { for (let rx = 0; rx < 7; rx++) if (row[rx] === '#') R(g, 6 + rx, ry, 1, 1, 'T'); }); }
      for (let x = 10; x < w - 10; x += 8) R(g, x, top + 24, 4, 1, (x >> 3) % 2 ? 'f' : 'T');
      break;
    case 'internet':
      if (flatTop) { R(g, w - 18, 1, 8, 1, 'E'); R(g, w - 17, 2, 6, 1, 'E'); R(g, w - 16, 3, 4, 1, 'e'); R(g, w - 14, 0, 1, 1, 'r'); R(g, w - 14, 4, 1, 1, 'd'); }
      break;
    case 'eco':
      if (flatTop) for (let x = 3; x < w - 3; x += 3) { R(g, x, 3, 2, 2, ((x / 3) | 0) % 3 ? 'g' : 'G'); if (x % 15 === 0) R(g, x, 2, 1, 1, ((x / 15) | 0) % 2 ? 'p' : 'y'); }
      vinesG(g, 6, top + 26, 20 + (floors.length - 1) * 14); vinesG(g, w - 8, top + 26, 14 + (floors.length - 1) * 14);
      break;
    case 'space':
      if (flatTop) { for (let a = -4; a <= 4; a++) { const hh = Math.round(Math.sqrt(16 - a * a)); R(g, w - 14 + a, 5 - hh, 1, hh, 'S'); } R(g, w - 14, 0, 1, 2, 'd'); R(g, w - 14, 0, 1, 1, 'r'); }
      for (let x = 12; x < w - 12; x += 12) { R(g, x, top + 11, 1, 1, 'S'); R(g, x + 6, top + 21, 1, 1, 'S'); }
      break;
    case 'neon':
      neonLine(g, 6, top + 9, w - 12, 1, 'A'); neonLine(g, 6, top + 23, w - 12, 1, 'I');
      neonLine(g, 6, top + 9, 1, 15, 'A'); neonLine(g, w - 7, top + 9, 1, 15, 'I');
      floors.forEach(fl => { neonLine(g, 8, fl.top, w - 16, 1, 'I'); });
      if (flatTop) { for (let x = 4; x < w - 4; x += 6) neonLine(g, x, 3 + ((x / 6) & 1), 3, 1, (x / 6) & 1 ? 'A' : 'I'); }
      break;
  }
}

// Дах: стилі 0..5 (див. SHOP_LOOK). Малює від y=0 до y=top+3; карниз — рядки top+4…top+7
function drawRoof(g, style, w, top, look) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.roof) return A.roof(g, style, w, top, look); }
  const cx = w >> 1, y1 = top + 3;
  const tiles = (y, lx, rw, c, odd) => {
    R(g, lx, y, rw, 1, c); R(g, lx, y, 1, 1, 'd'); R(g, lx + rw - 1, y, 1, 1, 'd');
    if (odd) { g.globalAlpha = 0.2; R(g, lx + 1, y, rw - 2, 1, 'd'); g.globalAlpha = 1; }
    for (let k = lx + 2 + (y % 2) * 3; k < lx + rw - 2; k += 6) R(g, k, y, 1, 1, 'd');
  };
  switch (style) {
    case 0: {                                       // низький черепичний дах із димарем
      const y0 = 4;
      for (let y = y0; y <= y1; y++) {
        const t = (y - y0) / (y1 - y0), half = (w - 36) / 2 + t * ((w - 2) / 2 - (w - 36) / 2);
        tiles(y, Math.round(cx - half), Math.round(half * 2), 'r', (y - y0) % 2);
      }
      R(g, cx - Math.round((w - 36) / 2), y0, w - 36, 1, 'd');
      const kx = w - 30; R(g, kx, 0, 8, 12, 'b'); R(g, kx, 0, 1, 12, 'd'); R(g, kx + 7, 0, 1, 12, 'd'); R(g, kx - 1, 0, 10, 2, 'd'); R(g, kx + 2, 4, 3, 1, 'l'); R(g, kx + 2, 7, 3, 1, 'l');
      break;
    }
    case 1: {                                       // двосхилий дах із фронтоном, круглим віконцем і прапорцем
      const y0 = 8;
      for (let y = y0; y <= y1; y++) {
        const t = (y - y0) / (y1 - y0), half = 6 + t * ((w / 2 - 1) - 6);
        const lx = Math.round(cx - half), rw = Math.round(half * 2);
        tiles(y, lx, rw, 'r', (y - y0) % 2);
        R(g, lx, y, 2, 1, 'b'); R(g, lx + rw - 2, y, 2, 1, 'b');                 // дошки по краях фронтону
      }
      spireG(g, cx, 0);                                           // шпиль із кулькою замість прапорця
      break;
    }
    case 2: {                                       // плаский дах із парапетом, кондиціонерами й антеною
      const trim = look.trim;
      R(g, 0, 5, w, 2, 'w'); R(g, 0, 5, w, 1, 'd');
      R(g, 1, 7, w - 2, y1 - 6, trim); R(g, 1, 7, w - 2, 1, 'l');
      for (let x = 8; x < w - 20; x += 22) { R(g, x, 9, 16, y1 - 9, 'd'); R(g, x + 1, 10, 14, y1 - 11, 'S'); R(g, x + 1, 10, 14, 1, 'w'); }
      acG(g, Math.round(w * 0.22), 0); acG(g, Math.round(w * 0.22) + 13, 1);
      R(g, w - 26, 0, 1, 6, 'd'); R(g, w - 28, 1, 5, 1, 'd'); R(g, w - 28, 3, 5, 1, 'd');
      R(g, cx + 14, 2, 3, 4, 'e'); R(g, cx + 13, 1, 5, 1, 'd');
      break;
    }
    case 3: {                                       // парапет із великим рекламним щитом «SUPER» і прапорами
      const trim = look.trim;
      R(g, 0, 14, w, 2, 'w'); R(g, 0, 14, w, 1, 'd');
      R(g, 1, 16, w - 2, y1 - 15, trim); R(g, 1, 16, w - 2, 1, 'E');
      for (let x = 8; x < w - 20; x += 22) { R(g, x, 18, 16, y1 - 18, 'd'); R(g, x + 1, 19, 14, y1 - 20, 'w'); }
      roofSignG(g, cx, 1, true);
      R(g, cx - 28, 14, 2, 1, 'd'); R(g, cx + 26, 14, 2, 1, 'd');
      spireG(g, 10, 3); spireG(g, w - 20, 3);
      break;
    }
    case 4: {                                       // мансардний дах із слуховими вікнами та годинниковою вежею
      const y0 = 10;
      for (let y = y0; y <= y1; y++) {
        const t = (y - y0) / (y1 - y0), half = (w - 80) / 2 + t * ((w - 2) / 2 - (w - 80) / 2);
        tiles(y, Math.round(cx - half), Math.round(half * 2), 'n', (y - y0) % 2);
      }
      [0.2, 0.8].forEach(f => {                                   // слухові вікна
        const dx = Math.round(w * f) - 6;
        R(g, dx, 18, 12, 10, 'd'); R(g, dx + 1, 19, 10, 8, 's'); R(g, dx + 5, 19, 1, 8, 'd'); R(g, dx + 2, 20, 2, 1, 'S');
        for (let i = 0; i < 5; i++) R(g, dx - 1 + i, 17 - i, 14 - 2 * i, 1, 'r');
        R(g, dx - 1, 17, 14, 1, 'd');
        if (glassRects) glassRects.push([dx + 1, 19, 10, 8]);
      });
      R(g, cx - 12, 4, 24, y1 - 3, 'c'); R(g, cx - 13, 3, 26, 2, 'd'); R(g, cx - 12, 4, 1, y1 - 3, 'd'); R(g, cx + 11, 4, 1, y1 - 3, 'd');     // вежа
      for (let i = 0; i < 4; i++) R(g, cx - 12 + i * 3, i, 24 - i * 6, 1, i ? 'r' : 'd');
      R(g, cx, 0, 1, 2, 'h');
      disc(g, cx, 14, 8, 'd'); disc(g, cx, 14, 7, 'h'); disc(g, cx, 14, 6, 'w');                                              // годинник
      R(g, cx, 9, 1, 5, 'd'); R(g, cx, 14, 4, 1, 'd'); R(g, cx, 8, 1, 1, 'd'); R(g, cx, 20, 1, 1, 'd'); R(g, cx - 6, 14, 1, 1, 'd'); R(g, cx + 6, 14, 1, 1, 'd');
      break;
    }
    case 6: {                                       // сучасний парапет із вежею-годинником та антенами
      const trim = look.trim;
      R(g, 0, 14, w, 2, 'w'); R(g, 0, 14, w, 1, 'd');
      R(g, 1, 16, w - 2, y1 - 15, trim); R(g, 1, 16, w - 2, 1, 'E');
      for (let x = 8; x < w - 20; x += 22) { R(g, x, 18, 16, y1 - 18, 'd'); R(g, x + 1, 19, 14, y1 - 20, 'S'); R(g, x + 1, 19, 14, 1, 'w'); }
      R(g, cx - 13, 2, 26, 13, 'd'); R(g, cx - 12, 3, 24, 11, 'e'); R(g, cx - 12, 3, 24, 1, 'E');
      disc(g, cx, 8, 5, 'd'); disc(g, cx, 8, 4, 'w'); R(g, cx, 5, 1, 4, 'd'); R(g, cx, 8, 3, 1, 'd');
      R(g, cx - 10, 6, 3, 5, 'S'); R(g, cx + 8, 6, 3, 5, 'S');
      R(g, 14, 4, 1, 10, 'd'); R(g, 11, 6, 7, 1, 'd'); R(g, 12, 9, 5, 1, 'd'); R(g, w - 16, 4, 1, 10, 'd'); R(g, w - 19, 6, 7, 1, 'd'); R(g, w - 18, 9, 5, 1, 'd');
      R(g, 14, 3, 1, 1, 'r'); R(g, w - 16, 3, 1, 1, 'r');
      break;
    }
    case 5: {                                       // скляний купол, бічні башточки з прапорами
      const base = y1, rx = Math.min(100, cx - 28), dh = 27;
      for (let x = cx - rx; x <= cx + rx; x++) {
        const k = Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2)));
        const yt = base - Math.round(dh * k);
        R(g, x, yt, 1, base - yt + 1, 'S');
        if ((x - cx) % 12 === 0) R(g, x, yt, 1, base - yt + 1, 'n');
        R(g, x, yt, 1, 1, 'w');
        for (let y = yt + 1; y <= base; y++) if ((base - y) % 9 === 0) R(g, x, y, 1, 1, 'n');
        if ((x * 5) % 11 === 0) R(g, x, yt + 2 + (x % 5), 1, 2, 'w');
      }
      R(g, cx - rx - 2, base - 1, rx * 2 + 5, 2, 'n'); R(g, cx - rx - 2, base - 1, rx * 2 + 5, 1, 'd');
      [3, w - 23].forEach(tx => {                                  // башточки
        R(g, tx, 12, 20, y1 - 11, 'S'); R(g, tx, 12, 20, 1, 'w'); R(g, tx - 1, 11, 22, 2, 'n'); R(g, tx, 12, 1, y1 - 11, 'd'); R(g, tx + 19, 12, 1, y1 - 11, 'd');
        for (let k = 0; k < 4; k++) R(g, tx + 3 + k * 4, 16, 2, y1 - 17, 'n');
        spireG(g, tx + 9, 0);
      });
      break;
    }
  }
  if (style !== 3) roofSignG(g, cx, Math.max(0, y1 - 13), false);
}

