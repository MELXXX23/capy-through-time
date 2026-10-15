//#part 140_b_ground_houses_layers.js
function paintCobble(g, X0, Y0, W, H, style) {
  if (cobbleExtra(g, X0, Y0, W, H, style)) return;
  if (style === 'snow' || style === 'leaves') {                    // звичайний булижник + сніг або листя зверху
    paintCobble(g, X0, Y0, W, H, 'stone');
    const F = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    if (style === 'snow') {
      g.globalAlpha = 0.16; F(X0, Y0, W, H, '#9db8d8'); g.globalAlpha = 1;
      for (let gy = Math.floor(Y0 / 5) * 5; gy < Y0 + H; gy += 5) for (let gx = Math.floor(X0 / 6) * 6; gx < X0 + W; gx += 6) {
        const hs = hash2(gx, gy + 31);
        if (hs % 4 === 0) continue;
        const w = 3 + (hs >>> 3) % 6, x = gx + (hs >>> 7) % 4, y = gy + (hs >>> 11) % 3;
        F(x, y + 2, w, 1, '#a9c0dc'); F(x, y, w, 2, '#f4f9ff'); F(x + 1, y - 1, Math.max(1, w - 3), 1, '#ffffff');
        if (hs % 11 === 0) F(x + 1, y, 1, 1, '#ffffff');
      }
    } else {
      for (let gy = Math.floor(Y0 / 9) * 9; gy < Y0 + H; gy += 9) for (let gx = Math.floor(X0 / 11) * 11; gx < X0 + W; gx += 11) {
        const hs = hash2(gx + 5, gy + 9), n = 1 + hs % 3;
        for (let k = 0; k < n; k++) { const x = gx + (hash2(hs, k) % 10), y = gy + (hash2(k, hs) % 8), c = ['#c4553d', '#e8863c', '#f2b84b', '#a8703f', '#d9a679'][hash2(x, y) % 5]; F(x, y, 3, 2, c); F(x + 1, y, 1, 1, '#7a4f35'); F(x, y + 1, 1, 1, '#ffd98a'); }
      }
    }
    return;
  }
  const RH = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const ANCHOR = -2600;                                            // з цієї точки рахуємо камені, тож візерунок завжди той самий
  if (style === 'wood') {                                          // дерев'яний настил
    RH(X0, Y0, W, H, '#5a3a2a');
    for (let r = 0, y = Y0; y < Y0 + H; r++, y += 7) {
      let x = ANCHOR - (hash2(r, 4) % 40);
      while (x < X0 + W) {
        const w = 28 + (hash2(x, r) % 20), t = ['#a8703f', '#9c6638', '#b57a45', '#946034'][hash2(x + 3, r) % 4];
        if (x + w > X0) {
          RH(x + 1, y + 1, w - 1, 6, t); RH(x + 1, y + 1, w - 1, 1, '#c98d57'); RH(x + 1, y + 6, w - 1, 1, '#6e4528');
          for (let k = 0; k < 3; k++) RH(x + 4 + hash2(x + k, r) % (w - 8), y + 3 + k % 2, 4, 1, '#855430');
          RH(x + 2, y + 3, 1, 1, '#4a3228'); RH(x + w - 3, y + 3, 1, 1, '#4a3228');
        }
        x += w;
      }
    }
  } else if (style === 'brick') {                                  // червона цегла
    RH(X0, Y0, W, H, '#7a5a4a');
    for (let r = 0, y = Y0; y < Y0 + H; r++, y += 6) for (let x = Math.floor((X0 - 12) / 12) * 12 + (r % 2) * 6 - 12; x < X0 + W; x += 12) {
      const t = ['#b5533c', '#a84a35', '#c25e45', '#9f4430'][hash2(x, r) % 4];
      RH(x + 1, y + 1, 11, 5, t); RH(x + 1, y + 1, 11, 1, '#d77a5e'); RH(x + 1, y + 5, 11, 1, '#7d3224');
      if (hash2(x + 5, r) % 9 === 0) RH(x + 4, y + 3, 2, 1, '#8a3a28');
    }
  } else {                                                         // звичайна: нерівний булижник з об'ємом, тріщинами й мохом
    RH(X0, Y0, W, H, '#7d7268');
    const tones = ['#cfc5b8', '#c3b9ab', '#d6ccbf', '#bdb3a6', '#cbc0b2'];
    for (let r = 0, y = Y0; y < Y0 + H; r++) {
      const h = 6 + (hash2(r, 5) % 2);
      let x = ANCHOR - (hash2(r, 9) % 8);
      while (x < X0 + W) {
        const w = 8 + (hash2(x + 7, r) % 6);
        if (x + w > X0) {
          const t = tones[hash2(x, r + 3) % tones.length];
          RH(x + 1, y + 1, w - 1, h - 1, t);
          RH(x + 1, y + 1, w - 1, 1, '#e9e1d4'); RH(x + 1, y + 1, 1, h - 1, '#e0d7ca');
          RH(x + 1, y + h - 1, w - 1, 1, '#9c9087'); RH(x + w - 1, y + 2, 1, h - 2, '#a79d92');
          RH(x + 1, y + 1, 1, 1, '#7d7268'); RH(x + w - 1, y + h - 1, 1, 1, '#7d7268');
          const k = hash2(x * 3, r * 7) % 11;
          if (k === 0) { RH(x + 3, y + 3, 1, 1, '#9c9087'); RH(x + 4, y + 4, 1, 1, '#9c9087'); RH(x + 5, y + 4, 1, 1, '#9c9087'); }
          if (k === 1) { RH(x + w - 4, y + 2, 2, 1, '#bdb3a6'); RH(x + 3, y + 3, 1, 1, '#b3a99c'); }
          if (k === 2) { RH(x + 2, y + h, 3, 1, '#6f9a5a'); RH(x + 4, y + h - 1, 1, 1, '#6f9a5a'); }
        }
        x += w;
      }
      y += h;
    }
  }
}
// Зима: сніг лежить на тротуарі, бруківці, вздовж бордюру й на узбіччі дороги (кучугури, плями на камінні, тінь під ними)
function snowBlob(g, cx, cy, rx, ry) {
  for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5)))); R(g, cx - hw, cy + dy, hw * 2 + 1, 1, dy > ry * 0.35 ? '#d3e1f4' : dy < -ry * 0.3 ? '#ffffff' : '#f1f7ff'); }
  R(g, cx - rx, cy + ry + 1, rx * 2, 1, '#a9bddb');
}
function winterGround(g, x0, W, H) {
  const roadTop = view.extraB >= 30 ? H - 36 : H;
  for (let x = x0; x < x0 + W; x++) {                                                          // кучугура під стінами будинків
    const hh = 2 + hash2(x >> 2, 71) % 3; R(g, x, LAYOUT.horizonY, 1, hh, '#ffffff'); R(g, x, LAYOUT.horizonY + hh, 1, 1, '#c3d6ee');
  }
  for (let gx = Math.floor(x0 / 4) * 4; gx < x0 + W; gx += 4) for (let gy = LAYOUT.horizonY + 5; gy < LAYOUT.curbY - 1; gy += 3) {          // тротуар
    const hs = hash2(gx + 5, gy + 9); if (hs % 100 < 55) { const ww = 2 + hs % 5; R(g, gx + (hs >>> 8) % 3, gy, ww, 1, '#f6f9ff'); if (hs % 3 === 0) R(g, gx + 1 + (hs >>> 8) % 3, gy + 1, ww - 1, 1, '#d3e1f4'); }
  }
  for (let x = x0; x < x0 + W; x++) { const hh = 1 + hash2(x >> 1, 73) % 3; R(g, x, LAYOUT.curbY - hh + 1, 1, hh, '#ffffff'); R(g, x, LAYOUT.curbY + 2, 1, 1, '#c3d6ee'); }       // вал снігу вздовж бордюру
  for (let gx = Math.floor(x0 / 5) * 5; gx < x0 + W; gx += 5) for (let gy = LAYOUT.streetTop + 2; gy < roadTop - 2; gy += 4) {              // бруківка: сніг на каменях і в швах
    const hs = hash2(gx + 13, gy + 17);
    if (hs % 100 < 58) { const ww = 2 + hs % 6; R(g, gx + (hs >>> 9) % 4, gy, ww, 1, '#f6f9ff'); R(g, gx + (hs >>> 9) % 4, gy + 1, Math.max(1, ww - 2), 1, '#d3e1f4'); }
  }
  for (let gx = x0 + 10; gx < x0 + W - 10; gx += 38 + hash2(gx, 4) % 40) snowBlob(g, gx, LAYOUT.streetTop + 6 + hash2(gx, 9) % Math.max(10, roadTop - LAYOUT.streetTop - 14), 6 + hash2(gx, 1) % 7, 2 + hash2(gx, 2) % 2);    // кучугури на вулиці
  if (view.extraB >= 30) {                                                                      // узбіччя дороги: вал снігу й плями
    for (let x = x0; x < x0 + W; x++) { const hh = 2 + hash2(x >> 1, 79) % 3; R(g, x, roadTop, 1, hh, '#f1f7ff'); R(g, x, roadTop + hh, 1, 1, '#a9bddb'); }
    for (let gx = x0; gx < x0 + W; gx += 11) { const hs = hash2(gx, 83); if (hs % 100 < 40) R(g, gx, roadTop + 6 + (hs >>> 6) % Math.max(6, H - roadTop - 12), 3 + hs % 5, 1, '#e4edf8'); }
  }
}
const manholeSpots = [];                                           // де стоять люки (над ними піднімається пара)
function buildGroundLayer() {
  const { c, g } = newLayer();
  const H = worldB();
  const x0 = -view.offX, W = view.w;      // ліва межа й повна ширина полотна (у координатах «ядра»)
  houseGlass = []; houseDoors = [];
  buildSeason = seasonNow();
  const lamps = lampPositions();

  // далекі пагорби
  for (let x = x0; x < x0 + W; x++) {
    const top = Math.round(98 + 7 * Math.sin(x / 41) + 4 * Math.sin(x / 17 + 2));
    R(g, x, top, 1, LAYOUT.horizonY - top, 'm');
    if (top + 1 < LAYOUT.horizonY) R(g, x, top, 1, 1, 'g');
  }
  farSkyline(g, x0, W);
  // будиночки
  HOUSES.concat(extraHouses()).forEach((h0, i) => {
    const h = Object.assign({}, h0, { h: Math.round(h0.h * HOUSE_SCALE) });         // будинки вищі: верхівки сягають середини 4-го поверху торгового центру
    const spec = Object.assign({}, h, houseColors(i));                                // кожен будинок має свій колір стін і даху

    drawHouse(g, spec, lamps);
    if (buildSeason === 'halloween') drawHalloweenHouse(g, spec);
  });
  drawBush(g, 40, 121);
  drawBush(g, 296, 121);
  for (let x = 40 - 92; x > x0 + 6; x -= 92) drawBush(g, x, 121);                  // кущі в розширеній частині вулиці
  for (let x = 296 + 92; x < x0 + W - 6; x += 92) drawBush(g, x, 121);
  // легка димка, щоб фон «відсунувся»
  g.globalAlpha = 0.16; R(g, x0, 60, W, LAYOUT.horizonY - 60, 'W'); g.globalAlpha = 1;

  // тротуар
  R(g, x0, LAYOUT.horizonY, W, LAYOUT.curbY - LAYOUT.horizonY, 'E');
  R(g, x0, LAYOUT.horizonY, W, 1, 'e');
  for (let x = Math.floor(x0 / 20) * 20 + 6; x < x0 + W; x += 20) R(g, x, LAYOUT.horizonY + 1, 1, 9, 'e');
  R(g, x0, LAYOUT.curbY, W, 2, 'e');
  R(g, x0, LAYOUT.curbY, W, 1, 'w');
  R(g, x0, LAYOUT.streetTop, W, 1, 'd');

  // дерева вздовж тротуару
  treeSpots(x0, W).forEach(tr => drawStreetTree(g, tr.x, tr.v, buildSeason));

  // бруківка
  paintCobble(g, x0, LAYOUT.streetTop + 1, W, H - LAYOUT.streetTop - 1, skinOn('street') || 'stone');
  manholeSpots.length = 0;
  const my = Math.min(H - 48, 188);                                   // люки: один ряд уздовж дороги, не часто
  for (let mx = Math.floor(x0 / 340) * 340 + 100; mx < x0 + W - 8; mx += 340) { const hx = mx + (hash2(mx, 3) % 21) - 10, hy = my + (hash2(3, mx) % 5) - 2; manholeG(g, hx, hy); manholeSpots.push({ x: hx, y: hy }); }
  if (view.extraB >= 30) drawRoadG(g, x0, W, H);
  if (buildSeason === 'winter') winterGround(g, x0, W, H);
  if (buildSeason === 'autumn' || buildSeason === 'spring') autumnGroundLeaves(g, x0, W, H, treeSpots(x0, W), buildSeason === 'spring');
  g.globalAlpha = 0.1; R(g, x0, H - 20, W, 20, 'd'); g.globalAlpha = 1;
  const trees = treeSpots(x0, W);
  houseDoors = houseDoors.filter(d => !trees.some(tr => Math.abs(tr.x - d.x) < 28));      // двері, закриті деревом, не використовуються: звірята туди не заходять
  houseGlass = houseGlass.filter(r => !windowHidden(r, trees));        // вікна, закриті деревами чи магазином, не світяться й не блимають привидами
  if (typeof ARCH !== 'undefined' && ARCH.japan && ARCH.japan.filterNeon) ARCH.japan.filterNeon(r => !windowHidden(r, trees));      // неонові вивіски Японії, закриті деревами чи магазином, уночі не світяться
  houseLit = buildLitLayer(houseGlass);
  return c;
}
// Осіннє листя: купи під деревами, розсип по тротуару, бруківці й дорозі
function autumnGroundLeaves(g, x0, W, H, trees, spring) {
  const cols = spring ? ['#ef8fa3', '#ffc9d4', '#f7b6c8', '#ffd9e2', '#e9738f', '#ffb3c6', '#fff0f4'] : ['#c4553d', '#e8863c', '#f2b84b', '#a8703f', '#d9a679', '#b5471f', '#e3a02e'], k = spring ? 0.8 : 1;
  const leaf = (x, y, h) => {
    const c = cols[h % cols.length], f = (h >>> 4) % 3;
    g.fillStyle = c;
    if (f === 0) g.fillRect(x, y, 3, 2); else if (f === 1) g.fillRect(x, y, 2, 3); else { g.fillRect(x, y, 4, 2); g.fillRect(x + 1, y - 1, 2, 1); }
    g.fillStyle = spring ? '#fff6f8' : '#ffd98a'; g.fillRect(x, y, 1, 1); g.fillStyle = spring ? '#c8587a' : '#7a4f35'; g.fillRect(x + (f === 1 ? 1 : 2), y + (f === 1 ? 2 : 1), 1, 1);
  };
  const base = LAYOUT.horizonY + 8, roadTop = view.extraB >= 30 ? H - 36 : H;
  trees.forEach(tr => {                                                         // купа під кожним деревом
    for (let i = 0; i < Math.round(90 * k); i++) {
      const hs = hash2(tr.x * 7 + i, 41 + i), r1 = ((hs >>> 3) % 1000) / 1000, r2 = ((hs >>> 13) % 1000) / 1000;
      const dx = (r1 + r2 - 1) * 30, dy = (((hs >>> 21) % 100) / 100) * 22 - 4;
      leaf(Math.round(tr.x + dx), Math.round(base + dy), hs);
    }
    g.globalAlpha = 0.28; R(g, tr.x - 12, base + 1, 24, 4, 'd'); g.globalAlpha = 1;
    for (let i = 0; i < 14; i++) { const hs = hash2(tr.x + i * 5, 77); leaf(tr.x - 9 + (hs % 18), base + 1 + (hs >>> 5) % 4, hs); }      // щільний горбок
  });
  for (let gy = LAYOUT.horizonY + 2; gy < LAYOUT.curbY - 1; gy += 5) for (let gx = Math.floor(x0 / 9) * 9; gx < x0 + W; gx += 9) {      // тротуар
    const hs = hash2(gx + 3, gy + 7); if (hs % 100 < 22 * k) leaf(gx + (hs >>> 8) % 8, gy + (hs >>> 12) % 4, hs);
  }
  for (let gy = LAYOUT.streetTop + 2; gy < roadTop - 3; gy += 6) for (let gx = Math.floor(x0 / 7) * 7; gx < x0 + W; gx += 7) {              // бруківка
    const hs = hash2(gx + 11, gy + 13); if (hs % 100 < 30 * k) leaf(gx + (hs >>> 8) % 6, gy + (hs >>> 12) % 5, hs);
  }
  if (view.extraB >= 30) for (let gy = roadTop + 8; gy < H - 4; gy += 8) for (let gx = Math.floor(x0 / 13) * 13; gx < x0 + W; gx += 13) {      // дорога
    const hs = hash2(gx + 19, gy + 23); if (hs % 100 < 8 * k) leaf(gx + (hs >>> 8) % 11, gy + (hs >>> 12) % 6, hs);
  }
}
// Смуга дороги знизу сцени: бордюр із каменю, асфальт із зерном, тріщинами й латками, розмітка, затока для поштової машини й острівець для поштомата
function drawRoadG(g, x0, W, H) {
  const top = H - 36, bx = LAYOUT.centerX - 70;
  const F = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // 1. бордюр: тінь від тротуару, світла грань, бокова стінка зі швами й тінню на асфальті
  F(x0, top - 1, W, 1, '#3a2c26'); F(x0, top, W, 2, '#dcd2c4'); F(x0, top + 2, W, 3, '#a39889'); F(x0, top + 5, W, 1, '#4a3228');
  for (let x = Math.floor(x0 / 18) * 18; x < x0 + W; x += 18) { F(x, top, 1, 5, '#8a8076'); F(x + 1, top, 1, 1, '#f1e9dc'); }
  // 2. асфальт: основа, колії, зерно
  F(x0, top + 6, W, 30, '#4b4852'); F(x0, top + 6, W, 3, '#3d3a44');
  F(x0, top + 11, W, 4, '#46434d'); F(x0, top + 26, W, 4, '#46434d');
  for (let x = x0; x < x0 + W; x++) for (let k = 0; k < 3; k++) {
    const h = hash2(x + k * 31, 17 + k), yy = top + 7 + (h >>> 4) % 29;
    if (h % 4 === 0) F(x, yy, 1, 1, h % 8 === 0 ? '#5c5964' : '#38353e');
  }
  // 3. тріщини й ремонтні латки (місця однакові при кожному запуску)
  for (let cx = Math.floor(x0 / 70) * 70; cx < x0 + W; cx += 70) {
    const h = hash2(cx, 91);
    if (h % 3 === 0) { let px = cx + (h >>> 5) % 50, py = top + 9 + (h >>> 9) % 20; for (let i = 0; i < 9; i++) { F(px, py, 1, 1, '#2f2c35'); px += 1 + (hash2(px, i) % 2); py += (hash2(i, px) % 3) - 1; } }
    if (h % 5 === 1) { const px = cx + 10 + (h >>> 6) % 40, py = top + 8 + (h >>> 11) % 18; F(px, py, 12, 7, '#55525c'); F(px, py, 12, 1, '#625f6a'); F(px, py + 6, 12, 1, '#3d3a44'); }
  }
  // 4. розмітка: суцільна біла лінія біля бордюру й жовтий пунктир посередині (із тінню)
  F(x0, top + 8, W, 1, '#8f8c96');
  for (let x = Math.floor(x0 / 18) * 18; x < x0 + W; x += 18) if (x < bx - 44 || x > bx + 28) { F(x, top + 20, 10, 2, '#e8c24a'); F(x, top + 22, 10, 1, '#8a6f22'); }
  // 5. затока для поштової машини: світліший асфальт, біла розмітка, стрілки, колісний обмежувач
  F(bx - 21, top + 11, 46, 23, '#56535e'); F(bx - 21, top + 11, 46, 1, '#69666f');
  F(bx - 22, top + 10, 48, 1, '#e8e2d4'); F(bx - 22, top + 34, 48, 1, '#e8e2d4'); F(bx + 25, top + 10, 1, 25, '#e8e2d4');
  for (let k = 0; k < 3; k++) { const x = bx + 15 - k * 9; lineG(g, x, top + 17, x - 4, top + 22, 'w'); lineG(g, x, top + 27, x - 4, top + 22, 'w'); lineG(g, x + 1, top + 17, x - 3, top + 22, 'w'); lineG(g, x + 1, top + 27, x - 3, top + 22, 'w'); }
  F(bx + 19, top + 16, 3, 13, '#d9d2c4'); F(bx + 19, top + 16, 3, 1, '#f5efe2'); F(bx + 19, top + 28, 3, 1, '#7d7468');
  // 6. острівець безпеки під поштомат: бетон із бордюром і жовто-чорною смугою по краю
  const ix = bx - 68, iw = 49;                                                  // острівець тягнеться під обидві скриньки (синю й червону)
  F(ix - 1, top + 9, iw + 2, 27, '#4a3228'); F(ix, top + 10, iw, 25, '#9c9087'); F(ix, top + 10, iw, 2, '#d6ccbf');
  F(ix, top + 33, iw, 2, '#7f756c');
  for (let i = 0; i < iw - 1; i += 4) { F(ix + i, top + 13, 2, 2, '#2a1d1a'); F(ix + 2 + i, top + 13, 2, 2, '#e8c24a'); F(ix + i, top + 30, 2, 2, '#2a1d1a'); F(ix + 2 + i, top + 30, 2, 2, '#e8c24a'); }
  // 7. конуси на кутах затоки
  [[bx - 21, top + 9], [bx + 25, top + 9], [bx + 25, top + 36]].forEach(([cx, cy]) => { R(g, cx - 3, cy + 4, 7, 1, 'd'); R(g, cx - 2, cy + 3, 5, 1, 'o'); R(g, cx - 1, cy + 1, 3, 2, 'o'); R(g, cx, cy - 1, 1, 2, 'o'); R(g, cx - 1, cy + 2, 3, 1, 'w'); R(g, cx - 1, cy + 1, 1, 1, 'r'); });
  // 8. нижній край дороги: темніше, щоб не зливалося
  g.globalAlpha = 0.35; F(x0, H - 3, W, 3, '#1f1b24'); g.globalAlpha = 1;
}
function manholeG(g, x, y) {                  // люк: чавунна кришка з концентричними кільцями (у перспективі — приплюснутий овал)
  const ell = (rx, ry, c, dy) => { g.fillStyle = c; for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) if ((xx * xx) / (rx * rx + 0.3) + (yy * yy) / (ry * ry + 0.3) <= 1) g.fillRect(x + xx, y + yy + (dy || 0), 1, 1); };
  ell(9, 5, '#4a3228', 1); ell(8, 4, '#8a8076'); ell(6, 3, '#a89e93'); ell(4, 2, '#8a8076'); ell(2, 1, '#a89e93');
  g.fillStyle = '#d6ccbf'; g.fillRect(x - 7, y - 1, 3, 1); g.fillStyle = '#5e554c'; g.fillRect(x + 1, y + 3, 4, 1);
}
// Над люками піднімається пара (легкі білі клубочки, що плавно зникають)
function drawManholeSteam() {
  if (!manholeSpots.length || !state.settings.steam || ecoOn()) return;
  manholeSpots.forEach((m, mi) => {
    if (m.x < visL() - 16 || m.x > visR() + 16) return;
    for (let i = 0; i < 4; i++) {
      const ph = ((animOn() ? animClock * 0.34 : 0) + i / 4 + mi * 0.37) % 1, yy = m.y - 3 - ph * 24;
      const xx = m.x + (animOn() ? Math.sin(animClock * 1.3 + i * 2 + mi) : 0) * (1.5 + ph * 5), r = 1.5 + ph * 3, a = Math.sin(ph * Math.PI);
      ctx.globalAlpha = a * 0.36; disc(ctx, Math.round(xx), Math.round(yy), Math.round(r) + 1, 'E');       // м'який край клубочка
      ctx.globalAlpha = a * 0.6; disc(ctx, Math.round(xx) - 1, Math.round(yy) - 1, Math.round(r), 'w');
    }
  });
  ctx.globalAlpha = 1;
}
function windowHidden(r, trees) {
  const base = LAYOUT.horizonY + 8;
  if (shop && r[0] + r[2] > shop.x - 28 && r[0] < shop.x + shop.w + 28 && r[1] + r[3] > shop.y - 4) return true;      // будинки за магазином не дають відблиску на нього
  return trees.some(tr => r[0] + r[2] > tr.x - 26 && r[0] < tr.x + 26 && r[1] + r[3] > base - 80);
}

// Додаткові будиночки з боків для широкого екрана (різні розміри й кольори; однакові при кожному запуску)
function extraHouses() {
  const walls = ['q', 'y', 'm', 'p', 'c', 'w', 'y', 'm'], roofs = ['r', 'b', 'n', 'b', 'r', 'n'];
  const make = (i) => {
    const hs = hash2(i * 7 + 3, 11);
    return { w: 44 + hs % 14, h: 54 + (hs >>> 4) % 20, wall: walls[hs % walls.length], roof: roofs[(hs >>> 3) % roofs.length], gap: 0 };
  };
  const list = [];
  let x = -8;                                    // ліворуч від ядра (крайній будинок ядра починається з −8)
  for (let i = 0; x > -view.offX - 40; i++) {
    const hs = make(i);
    x -= hs.w;
    list.push({ x, w: hs.w, h: hs.h, wall: hs.wall, roof: hs.roof });
  }
  x = 342;                                       // праворуч (крайній будинок ядра закінчується на 342)
  for (let i = 20; x < CONFIG.SCENE_W + view.offX + 4; i++) {
    const hs = make(i);
    list.push({ x, w: hs.w, h: hs.h, wall: hs.wall, roof: hs.roof });
    x += hs.w;
  }
  return list;
}

// Шар освітлених вікон будинків (вночі вмикається поверх затемнення)
function buildLitLayer(rects) {
  const { c, g } = newLayer();
  rects.forEach(r => {
    if (hash2(r[0] + 5, r[1] + 9) % 4 === 0) return;      // частина вікон лишається темною
    const hall = buildSeason === 'halloween';
    g.globalAlpha = 0.22; R(g, r[0] - 2, r[1] - 2, r[2] + 4, r[3] + 4, hall ? '#ff9a3c' : '#ffd36a'); g.globalAlpha = 1;          // ореол світла навколо вікна
    R(g, r[0], r[1], r[2], 3, hall ? '#ffb347' : '#fff0b8'); R(g, r[0], r[1] + 3, r[2], 3, hall ? '#ff9a3c' : '#ffd860'); R(g, r[0], r[1] + 6, r[2], r[3] - 6, hall ? '#e8742c' : '#f2a63c');
    R(g, r[0] + 3, r[1], 1, r[3], '#6a4a28'); R(g, r[0], r[1] + 3, r[2], 1, '#6a4a28');                  // рама лишається видно
    if (hash2(r[0], r[1]) % 3 === 0) R(g, r[0] + 1, r[1] + 5, 2, 4, '#a85a28');                         // силует людини чи лампи в кімнаті
  });
  return c;
}

/* ---------- Дерева (пора року змінює їхній вигляд) ---------- */
// Де садити дерева: посередині вільних проміжків між ліхтарями, магазином і краями вулиці (щоб ліхтарі їх не затуляли)
function treeSpots(x0, W) {
  const blocks = lampPositions().map(lx => [lx - 12, lx + 14]);
  if (shop) blocks.push([shop.x - 2, shop.x + shop.w + 2]);
  blocks.sort((a, b) => a[0] - b[0]);
  const list = [];
  let prev = x0;
  const gap = (a, b, i) => {
    const room = b - a;
    if (room < 50) return;
    const n = room >= 150 ? 2 : 1;
    for (let k = 1; k <= n; k++) {
      const hs = hash2(Math.round(a) + 31 + k, 5);
      list.push({ x: Math.round(a + room * k / (n + 1)), v: (hs >>> 5) % 3 });
    }
  };
  blocks.forEach((bl, i) => { gap(prev, bl[0], i); prev = Math.max(prev, bl[1]); });
  gap(prev, x0 + W, blocks.length);
  return list;
}
function lineG(g, x0, y0, x1, y1, c) {      // лінія з пікселів (Брезенхем)
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
  for (;;) {
    R(g, x0, y0, 1, 1, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
let TREE_CROWN_MASK = null;
const TREE_CACHE = new Map();       // готові дерева (x, вид, сезон) → полотно: звичайне дерево не залежить від епохи, тож при подорожі береться з кешу, а не малюється заново (~40 мс)
function drawStreetTree(g, x, v, season) {
  { const A = (typeof ARCH !== 'undefined') ? ARCH[currentEpoch().id] : null; if (A && A.tree) return A.tree(g, x, v, season); }
  const base = LAYOUT.horizonY + 8, key = x + '|' + v + '|' + season + '|' + base, ox = x - 48, oy = base - 92;
  let c = TREE_CACHE.get(key);
  if (!c) {
    if (TREE_CACHE.size > 80) TREE_CACHE.clear();
    c = document.createElement('canvas'); c.width = 98; c.height = 112;
    const cg = c.getContext('2d'); cg.translate(-ox, -oy);
    drawStreetTreeRaw(cg, x, v, season);
    TREE_CACHE.set(key, c);
  }
  g.drawImage(c, ox, oy);
}
function drawStreetTreeRaw(g, x, v, season) {
  const base = LAYOUT.horizonY + 8;
  if (season === 'winter') { drawBareTree(g, x, v, season); return; }
  // Дерево ×1,45 від колишнього: розлогий стовбур із корою й корінням, об'ємна крона з кількох шарів, світло зверху-зліва, тінь знизу-праворуч, сезонні деталі
  const pal = {
    spring: ['q', 'p', 'w', 'b', ['p', 'p', 'w', 'q', 'm']],
    summer: ['g', 'G', 'm', 'G', ['m', 'G', 'y']],
    autumn: ['o', 'r', 'h', 'b', ['h', 'y', 'r', 'h', 'o']],
    halloween: ['u', 'n', 'p', 'k', ['o', 'o', 'y', 'p']]
  }[season];
  const seed = x * 7 + v * 13;
  g.globalAlpha = 0.26; R(g, x - 27, base, 54, 4, 'd'); R(g, x - 19, base + 4, 38, 2, 'd'); R(g, x - 12, base + 6, 24, 1, 'd'); g.globalAlpha = 1;      // тінь на землі
  // ствол: світлий лівий бік, темний правий, кора з тріщинами, мох, потовщення в корінні
  R(g, x - 5, base - 26, 10, 26, 'd'); R(g, x - 4, base - 26, 8, 26, 'b'); R(g, x - 4, base - 26, 2, 26, 'l');
  g.globalAlpha = 0.4; R(g, x + 1, base - 26, 3, 26, 'd'); g.globalAlpha = 1;
  for (let k = 0; k < 9; k++) { const kx = x - 3 + (hash2(k, seed) % 6), ky = base - 24 + k * 3; R(g, kx, ky, 1, 2, 'd'); if (k % 3 === 0) R(g, kx + 1, ky + 1, 1, 1, 'l'); }
  R(g, x - 4, base - 9, 2, 2, 'g'); R(g, x - 3, base - 15, 2, 1, 'm'); R(g, x - 4, base - 14, 1, 1, 'g');
  R(g, x - 9, base - 3, 18, 4, 'd'); R(g, x - 8, base - 3, 16, 3, 'b'); R(g, x - 8, base - 3, 4, 1, 'l');
  R(g, x - 12, base - 1, 5, 3, 'd'); R(g, x - 11, base - 1, 3, 2, 'b'); R(g, x + 7, base - 1, 5, 3, 'd'); R(g, x + 7, base - 1, 3, 2, 'b');       // коріння
  lineG(g, x - 1, base - 24, x - 13, base - 38, 'd'); lineG(g, x, base - 24, x - 12, base - 38, 'b'); lineG(g, x + 1, base - 24, x + 13, base - 38, 'd'); lineG(g, x, base - 24, x + 12, base - 38, 'b');
  lineG(g, x, base - 26, x - 3, base - 42, 'd'); lineG(g, x + 1, base - 26, x - 2, base - 42, 'b');
  // крона з багатьох кульок (нерівний силует)
  const cy = base - 51;
  const discs = [[0, -3, 17], [-14, 7, 13], [14, 7, 13], [0, 10, 16], [-7, -13, 12], [9, -12, 11], [-22, -1, 9], [22, 0, 9], [0, -19, 9], [-12, 19, 9], [13, 19, 9], [-18, 14, 8], [19, 13, 8]];
  if (!TREE_CROWN_MASK) {                                                                              // форма крони не залежить від x: рахуємо один раз (колись discs.some на кожен піксель з'їдало ~40 мс при подорожі)
    TREE_CROWN_MASK = new Uint8Array(75 * 67);
    for (let my = 0; my < 67; my++) for (let mx = 0; mx < 75; mx++) {
      const px = mx - 37, py = my - 33;
      TREE_CROWN_MASK[my * 75 + mx] = discs.some(d => { const dx = px - d[0], dy = py - (-51 + 51 + d[1]); return dx * dx + dy * dy <= d[2] * d[2] + 1; }) ? 1 : 0;
    }
  }
  const cm = TREE_CROWN_MASK, inside = (px, py) => { const mx = px - x + 37, my = py - cy + 33; return mx >= 0 && mx < 75 && my >= 0 && my < 67 && cm[my * 75 + mx] === 1; };
  discs.forEach(d => disc(g, x + d[0], cy + d[1], d[2] + 1, pal[3]));                                   // контур
  const band = (py) => season === 'autumn' ? (py < cy - 9 ? 'h' : py < cy + 8 ? 'o' : 'r') : season === 'summer' ? (py < cy - 6 ? 'g' : 'g') : pal[0];     // восени крона від жовтої до червоної
  for (let py = cy - 32; py <= cy + 32; py++) for (let px = x - 36; px <= x + 36; px++) {
    if (!inside(px, py)) continue;
    const sh = (px - x) * 0.42 + (py - cy) * 0.85, n = hash2(px * 3 + 1, py * 5 + 7) % 11, n2 = hash2(px + 17, py * 3 + 5) % 7;
    const edge = !inside(px - 1, py) || !inside(px + 1, py) || !inside(px, py - 1) || !inside(px, py + 1);
    R(g, px, py, 1, 1, band(py));
    if (sh > 18 && n < 6) R(g, px, py, 1, 1, pal[3]);                                                      // глибока тінь знизу-праворуч
    else if (sh > 12 || (sh > 6 && n < 4)) R(g, px, py, 1, 1, pal[1]);
    else if (sh < -15 && n < 8) R(g, px, py, 1, 1, pal[2]);                                                // світло зверху-зліва
    else if (sh < -8 && n < 3) R(g, px, py, 1, 1, pal[2]);
    else if (n === 0) R(g, px, py, 1, 1, pal[1]);
    if (n2 === 0 && sh < 4) R(g, px, py, 2, 1, pal[2]);                                                    // дрібні листочки-відблиски
    if (edge && py > cy + 3 && hash2(px, py) % 3 === 0) R(g, px, py, 1, 1, pal[1]);                        // зубчики листя знизу
    if (edge && py < cy - 6 && hash2(py, px) % 3 === 0) R(g, px, py, 1, 1, pal[2]);                        // блиск на верхніх краях
  }
  // купки листя: світла шапка зверху й темна підкладка знизу — крона виглядає об'ємною
  for (let k = 0; k < 26; k++) {
    const a = (hash2(seed + k, 3) % 628) / 100, rr = 6 + hash2(k, seed + 9) % 24, px = x + Math.round(Math.cos(a) * rr * 1.2), py = cy + Math.round(Math.sin(a) * rr * 0.9);
    if (!inside(px - 3, py) || !inside(px + 3, py) || !inside(px, py - 2) || !inside(px, py + 3)) continue;
    R(g, px - 2, py + 2, 5, 1, pal[1]); R(g, px - 3, py + 1, 7, 1, pal[1]); R(g, px - 2, py - 1, 5, 2, season === 'autumn' ? band(py) : pal[0]); R(g, px - 2, py - 1, 3, 1, pal[2]);
  }
  // сезонні деталі: цвіт навесні, плоди й сонячні плями влітку, строкате листя восени
  if (season === 'spring') {
    for (let k = 0; k < 90; k++) {
      const a = (hash2(seed + k, 3) % 628) / 100, rr = hash2(k, seed + 9) % 27, px = x + Math.round(Math.cos(a) * rr * 1.25), py = cy + 1 + Math.round(Math.sin(a) * rr * 1.0);
      if (!inside(px, py) || !inside(px + 2, py + 2)) continue;
      const c1 = pal[4][k % pal[4].length];
      if (k % 4 === 0) { R(g, px, py, 3, 3, c1); R(g, px + 1, py + 1, 1, 1, 'y'); R(g, px + 1, py - 1, 1, 1, c1); R(g, px + 1, py + 3, 1, 1, c1); R(g, px - 1, py + 1, 1, 1, c1); R(g, px + 3, py + 1, 1, 1, c1); }       // повна квітка
      else R(g, px, py, 2, 2, c1);
    }
    for (let k = 0; k < 7; k++) R(g, x - 22 + hash2(k, seed + 2) % 44, cy + 28 + hash2(seed, k) % 12, 2, 1, ['q', 'p', 'w'][k % 3]);              // пелюстки в повітрі
  } else if (season === 'summer') {
    for (let k = 0; k < 40; k++) {
      const a = (hash2(seed + k, 3) % 628) / 100, rr = hash2(k, seed + 9) % 26, px = x + Math.round(Math.cos(a) * rr * 1.25), py = cy + 2 + Math.round(Math.sin(a) * rr * 1.0);
      if (inside(px, py)) R(g, px, py, 2, 1, pal[4][k % pal[4].length]);
    }
    for (let k = 0; k < 14; k++) {                                                                             // сонячні плями на листі
      const a = (hash2(seed + k * 3, 5) % 628) / 100, rr = hash2(k, seed + 33) % 20, px = x - 8 + Math.round(Math.cos(a) * rr), py = cy - 8 + Math.round(Math.sin(a) * rr * 0.8);
      if (inside(px, py) && inside(px + 2, py + 1)) { R(g, px, py, 3, 1, 'y'); R(g, px + 1, py + 1, 1, 1, 'y'); }
    }
    [[-12, 6], [10, 10], [-2, 20], [16, 0], [-20, 14], [4, -4], [-8, -8]].forEach(([dx, dy], i) => { if (inside(x + dx, cy + dy)) { R(g, x + dx - 1, cy + dy - 1, 4, 4, 'd'); R(g, x + dx, cy + dy, 2, 2, i % 2 ? 'r' : 'o'); R(g, x + dx, cy + dy, 1, 1, 'w'); } });   // плоди
  } else if (season === 'autumn') {
    for (let k = 0; k < 100; k++) {
      const a = (hash2(seed + k, 3) % 628) / 100, rr = hash2(k, seed + 9) % 27, px = x + Math.round(Math.cos(a) * rr * 1.25), py = cy + 2 + Math.round(Math.sin(a) * rr * 1.0);
      if (inside(px, py)) R(g, px, py, 2, 1, pal[4][k % pal[4].length]);
    }
    for (let k = 0; k < 9; k++) R(g, x - 24 + hash2(k, seed + 2) % 48, cy + 27 + hash2(seed, k) % 14, 2, 1, pal[4][k % pal[4].length]);              // листя, що падає
  }
  if (season === 'halloween') treeHalloweenDecor(g, x, cy);
  // на землі: трава, пелюстки навесні, опале листя восени
  for (let k = 0; k < 9; k++) { R(g, x - 22 + hash2(k, seed + 4) % 44, base + 1, 1, 2, 'g'); }
  if (season === 'spring' || season === 'autumn') {
    const gp = season === 'spring' ? ['q', 'p', 'w'] : ['o', 'h', 'r'];
    for (let k = 0; k < 30; k++) R(g, x - 24 + (hash2(k, seed) % 48), base + 1 + (hash2(seed, k) % 3), 2, 1, gp[k % 3]);
  }
}
// Хелловін: на дереві висять гарбузи-ліхтарики, привиди й гірлянда з вогників
function treeHalloweenDecor(g, x, cy) {
  const pump = (px, py) => { R(g, px - 2, py, 5, 4, 'd'); R(g, px - 1, py + 1, 3, 2, 'o'); R(g, px, py + 1, 1, 1, 'y'); R(g, px - 2, py + 1, 1, 2, 'o'); R(g, px + 2, py + 1, 1, 2, 'o'); R(g, px, py - 1, 1, 1, 'g'); };
  const ghost = (px, py) => { R(g, px - 2, py, 5, 6, 'd'); R(g, px - 1, py + 1, 3, 4, 'w'); R(g, px - 1, py + 2, 1, 1, 'k'); R(g, px + 1, py + 2, 1, 1, 'k'); R(g, px - 1, py + 5, 1, 1, 'w'); R(g, px + 1, py + 5, 1, 1, 'w'); };
  [[-9, 12, 6], [0, 18, 9], [9, 12, 6]].forEach(p => { R(g, x + p[0], cy + p[1], 1, p[2], 'd'); pump(x + p[0], cy + p[1] + p[2]); });      // гарбузи на мотузках
  [[-15, 9, 5], [14, 10, 4]].forEach(p => { R(g, x + p[0], cy + p[1], 1, p[2], 'd'); ghost(x + p[0], cy + p[1] + p[2]); });                  // привиди на мотузках
  for (let gx = x - 12; gx <= x + 12; gx++) {                                                                                                 // гірлянда
    const sag = Math.round(4 * Math.sin((gx - x + 12) / 24 * Math.PI));
    R(g, gx, cy + 9 + sag, 1, 1, 'd');
    if ((gx - x) % 4 === 0) R(g, gx, cy + 10 + sag, 2, 2, ['o', 'y', 'p'][(gx - x + 12) / 4 % 3 | 0]);
  }
  // гарбузи на землі під деревом (замість гарбузів на бруківці: не заважають звірятам); [зсув по x, зсув по землі, розмір 0–2, різьблене обличчя]
  const base = cy + 51;
  const gpump = (px, py, size, face) => {
    const w = [7, 9, 12][size], h = [5, 7, 9][size], x0 = px - (w >> 1);
    R(g, x0 + 1, py - h, w - 2, h + 1, 'd'); R(g, x0, py - h + 1, w, h - 1, 'd');                                  // контур
    R(g, x0 + 1, py - h + 1, w - 2, h - 1, 'o'); R(g, x0 + 1, py - 1, w - 2, 1, 'r');                                // тіло й тінь знизу
    R(g, x0 + 1, py - h + 1, 2, h - 2, 'h');                                                                          // світлий бік
    R(g, px, py - h + 1, 1, h - 1, 'r'); if (size > 0) { R(g, px - 3, py - h + 1, 1, h - 2, 'r'); R(g, px + 3, py - h + 1, 1, h - 2, 'r'); }   // борозни
    R(g, px, py - h - 1, 2, 2, 'g'); R(g, px + 1, py - h - 2, 1, 1, 'g');                                            // хвостик
    if (face) { const e = size > 0 ? 2 : 1; R(g, px - 2, py - h + 2, e, e, 'y'); R(g, px + 1, py - h + 2, e, e, 'y'); R(g, px - 2, py - 3, 5, 1, 'y'); if (size > 0) R(g, px - 1, py - 2, 3, 1, 'y'); }
  };
  [[-30, 8, 2, 1], [-22, 11, 1, 0], [-15, 7, 2, 0], [-9, 12, 0, 1], [10, 12, 1, 1], [16, 8, 2, 1], [23, 11, 0, 0], [30, 7, 2, 0], [-36, 11, 0, 0], [36, 12, 1, 1]]
    .forEach(p => gpump(x + p[0], base + p[1], p[2], p[3]));
}
// Зимове дерево: пишні гілки з багатьма відгалуженнями, на яких лежить сніг
function drawBareTree(g, x, v, season) {
  const base = LAYOUT.horizonY + 8, top = base - 28;
  g.globalAlpha = 0.24; R(g, x - 24, base, 48, 3, 'd'); g.globalAlpha = 1;
  R(g, x - 5, top, 10, 28, 'd'); R(g, x - 4, top, 8, 28, 'b'); R(g, x - 4, top, 2, 28, 'l'); g.globalAlpha = 0.4; R(g, x + 1, top, 3, 28, 'd'); g.globalAlpha = 1;
  for (let k = 0; k < 7; k++) R(g, x - 3 + (hash2(k, x) % 6), top + 2 + k * 4, 1, 2, 'd');
  R(g, x - 9, base - 3, 18, 4, 'd'); R(g, x - 8, base - 3, 16, 3, 'b'); R(g, x - 12, base - 1, 5, 3, 'd'); R(g, x + 7, base - 1, 5, 3, 'd');
  const seed = x * 7 + v * 13;
  const branch = (bx, by, ang, len, depth) => {
    const ex = Math.round(bx + Math.sin(ang) * len), ey = Math.round(by - Math.cos(ang) * len);
    lineG(g, bx, by, ex, ey, depth <= 1 ? 'd' : 'b');
    if (depth <= 1) { lineG(g, bx + 1, by, ex + 1, ey, 'd'); if (depth === 0) lineG(g, bx - 1, by, ex - 1, ey, 'b'); }                  // товсті гілки
    const midx = Math.round((bx + ex) / 2), midy = Math.round((by + ey) / 2);
    if (depth <= 2 && Math.abs(Math.sin(ang)) > 0.3) { R(g, midx - 2, midy - 1, 5, 1, 'w'); R(g, midx - 1, midy - 2, 3, 1, 'w'); }        // сніг лежить на похилих гілках
    if (depth >= 3) { R(g, ex - 1, ey - 2, 3, 2, 'w'); return; }                                                                            // кінчик гілочки зі сніжком
    const kids = depth === 0 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const h = hash2(seed + depth * 31 + k * 7, bx + by);
      const da = (k - (kids - 1) / 2) * (0.75 + (h % 30) / 100) + ((h >>> 5) % 20 - 10) / 60;
      branch(ex, ey, ang + da, len * (0.68 + (h % 12) / 100), depth + 1);
    }
  };
  [-1.15, -0.6, 0, 0.6, 1.15].forEach((a, i) => branch(x + (i % 2 ? 1 : 0), top + (i === 2 ? 0 : 4 + (i % 2) * 4), a, i === 2 ? 22 : 18, 0));
  R(g, x - 5, top - 1, 11, 2, 'w'); R(g, x - 14, base - 2, 28, 4, 'w'); R(g, x - 10, base - 5, 20, 3, 'w'); R(g, x - 6, base - 7, 12, 2, 'w'); R(g, x - 16, base, 6, 2, 'w'); R(g, x + 11, base, 6, 2, 'w');   // кучугури біля стовбура
}

/* ---------- Хелловін: гірлянда й скелет на будинку ---------- */
const SKEL_ROWS = [
  '..wwwww..',
  '.wwwwwww.',
  '.wkkwkkw.',
  '.wwwkwww.',
  '..wwwww..',
  '..wkwkw..',
  '....w....',
  '.wwwwwww.',
  'w.wkwkw.w',
  'w.wwwww.w',
  'w.wkwkw.w',
  '.w..w..w.',
  '..wwwww..',
  '..ww.ww..',
  '..w...w..',
  '..w...w..',
  '.ww...ww.'];
function skelFig(g, x, y, rows) {                                                    // скелет із чорним контуром, кістки світліють зліва
  const on = (c, r) => !!(rows[r] && rows[r][c] && rows[r][c] !== '.');
  for (let r = -1; r <= rows.length; r++) for (let c = -1; c <= 9; c++) { if (on(c, r)) continue; if (on(c - 1, r) || on(c + 1, r) || on(c, r - 1) || on(c, r + 1)) R(g, x + c, y + r, 1, 1, 'd'); }
  rows.forEach((row, r) => { for (let c = 0; c < row.length; c++) { const ch = row[c]; if (ch !== '.') R(g, x + c, y + r, 1, 1, ch === 'k' ? 'k' : (c >= 6 ? 'E' : 'w')); } });
}
function webG(g, x, y, dirX) {                                                       // павутиння в кутку: промені й дужки
  g.globalAlpha = 0.85;
  const L = (x1, y1, x2, y2) => lineG(g, x + dirX * x1, y + y1, x + dirX * x2, y + y2, 'w');
  L(0, 0, 14, 0); L(0, 0, 0, 14); L(0, 0, 10, 10);
  [4, 7, 10].forEach(r => { const d = Math.round(r * 0.7); L(r, 0, d, d); L(d, d, 0, r); });
  g.globalAlpha = 1;
}
function drawHalloweenHouse(g, spec) {
  const { x, w } = spec, top = LAYOUT.horizonY - spec.h, hs = hash2(x + 3, 9), kind = hs % 5;
  // гірлянда з помаранчевих і фіолетових вогників під дахом
  for (let gx = x + 1; gx < x + w - 1; gx++) {
    const sag = Math.round(2 * Math.sin((gx - x) / (w - 2) * Math.PI));
    R(g, gx, top + 1 + sag, 1, 1, 'd');
    if ((gx - x) % 4 === 2) R(g, gx, top + 2 + sag, 2, 2, ['o', 'u', 'y'][((gx - x) >> 2) % 3]);
  }
  const roomy = spec.h >= 40 && w >= 36;
  if ((kind === 0 || kind === 4) && roomy) {                                         // скелет висить на мотузці з карниза
    const sx = x + w - 13, sy = top + 7;
    R(g, sx + 4, sy - 7, 1, 7, 'd'); skelFig(g, sx, sy, SKEL_ROWS);
  } else if (kind === 1 && roomy) {                                                  // скелет сидить на краю даху, ноги звисають
    const sx = x + 6; skelFig(g, sx, top - 13, SKEL_ROWS);
    R(g, sx + 10, top - 7, 5, 4, 'd'); R(g, sx + 11, top - 6, 3, 2, 'o'); R(g, sx + 12, top - 8, 1, 1, 'g');         // гарбуз поруч
  }
  if (kind === 2 || kind === 4) {                                                    // павутиння в кутку й павучок на нитці
    webG(g, x + 1, top + 3, 1);
    const spx = x + 9; R(g, spx, top + 4, 1, 9, 'w'); R(g, spx - 1, top + 13, 3, 2, 'k'); R(g, spx - 2, top + 14, 1, 1, 'k'); R(g, spx + 2, top + 14, 1, 1, 'k'); R(g, spx - 1, top + 12, 1, 1, 'r'); R(g, spx + 1, top + 12, 1, 1, 'r');
  }
  if (kind === 3 || (kind === 0 && !roomy)) {                                        // кажани висять догори ногами під карнизом
    [x + 8, x + (w >> 1), x + w - 12].forEach((bx, i) => { if (i === 1 && w < 44) return; R(g, bx, top + 3, 1, 2, 'd'); R(g, bx - 1, top + 5, 3, 3, 'k'); R(g, bx - 2, top + 6, 1, 2, 'k'); R(g, bx + 2, top + 6, 1, 2, 'k'); R(g, bx - 1, top + 6, 1, 1, 'r'); R(g, bx + 1, top + 6, 1, 1, 'r'); });
  }
}

/* ---------- Речі біля магазину (залежать від ширини будівлі) ---------- */
function buildPropsLayer() {
  const { c, g } = newLayer();
  lampXs = lampPositions();
  lampXs.forEach(x => drawLamp(g, x));
  return c;
}

