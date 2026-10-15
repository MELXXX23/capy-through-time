//#part 275_japan.js
/* =====================================================================
   БОНУСНА ЕПОХА «ЯПОНІЯ» (9-та, індекс 8; після Неону): дерев'яні будинки з дашками, сакура, ліхтарі, дракон, чайний будиночок гостя,
   магазин із чотирисхилим дахом і торіями. Реєструється в ARCH.japan (див. 151_arch.js) і в масивах епох.
   Лише малювання й дані: тексти — у 276_japan_text.js, сюжет — у 241_epoch_story.js (EC_DATA[8]), гість — 245/246.
   ===================================================================== */
(function () {
  const hxc = c => PALETTE[c] || c;
  const P = (g, x, y, w, h, c) => { if (w > 0 && h > 0) { g.fillStyle = hxc(c); g.fillRect(Math.round(x), Math.round(y), w, h); } };
  const D = (g, cx, cy, r, c) => { g.fillStyle = hxc(c); for (let dy = -r; dy <= r; dy++) { const half = Math.round(Math.sqrt(r * r + 0.5 - dy * dy)); g.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1); } };
  const A = (g, a, fn) => { const o = g.globalAlpha; g.globalAlpha = a; fn(); g.globalAlpha = o; };
  const mixc = AR.mix;
  const DKW = '#2a1a10', TILE = ['#27393a', '#41605c', '#6b8d85', '#15221f'];            // черепиця з патиною: тіньова, основна, світла, контур

  /* ---------- піксельний текст: кана й ієрогліфи системним шрифтом, зведені до пікселів ---------- */
  const tc = document.createElement('canvas'), tg = tc.getContext('2d', { willReadFrequently: true });
  const FONT = '"MS Gothic","Yu Gothic","Meiryo","Hiragino Sans","Noto Sans CJK JP","Noto Sans JP",sans-serif';
  function text(g, str, x, y, color, size, bold) {
    size = size || 9; tc.width = str.length * size + 4; tc.height = size + 4;
    tg.clearRect(0, 0, tc.width, tc.height); tg.fillStyle = '#000'; tg.font = (bold ? 'bold ' : '') + size + 'px ' + FONT; tg.textBaseline = 'top'; tg.fillText(str, 0, 0);
    const d = tg.getImageData(0, 0, tc.width, tc.height).data; g.fillStyle = hxc(color);
    for (let j = 0; j < tc.height; j++) for (let i = 0; i < tc.width; i++) if (d[(j * tc.width + i) * 4 + 3] > 118) g.fillRect(x + i, y + j, 1, 1);
    return str.length * size;
  }
  function vtext(g, str, x, y, color, size, bold) { [...str].forEach((ch, i) => text(g, ch, x, y + i * (size - 1), color, size, bold)); }
  function neonBox(g, x, y, w, h, c) {                  // неонова вивіска: темний короб, світла трубка по краю, м'яке сяйво навколо
    A(g, 0.14, () => P(g, x - 3, y - 3, w + 6, h + 6, c)); A(g, 0.22, () => P(g, x - 2, y - 2, w + 4, h + 4, c));
    P(g, x - 1, y - 1, w + 2, h + 2, '#0c0a18'); P(g, x, y, w, h, mixc(c, '#0a0818', 0.86));
    P(g, x, y, w, 1, c); P(g, x, y + h - 1, w, 1, c); P(g, x, y, 1, h, c); P(g, x + w - 1, y, 1, h, c);
    A(g, 0.5, () => { P(g, x + 1, y + 1, w - 2, 1, c); P(g, x + 1, y + h - 2, w - 2, 1, c); P(g, x + 1, y + 1, 1, h - 2, c); P(g, x + w - 2, y + 1, 1, h - 2, c); });
    P(g, x, y, 1, 1, '#ffffff'); P(g, x + w - 1, y + h - 1, 1, 1, '#ffffff');
  }
  function neonText(g, draw, c) { A(g, 0.32, () => { draw(-1, 0, c); draw(1, 0, c); draw(0, 1, c); }); draw(0, 0, mixc(c, '#ffffff', 0.6)); }   // літери: сяйво навколо + світла серцевина

  /* ---------- небо: багато відтінків градієнта з дізерингом (не кулі кольорів, а плавний захід) ---------- */
  function buildSky() {
    const { c, g } = newLayer();
    const x0 = -view.offX, W = view.w, top = -view.offY, hor = LAYOUT.horizonY + 10;
    const stops = [[0, '#18356e'], [0.16, '#2a5aa8'], [0.34, '#4f8fd8'], [0.5, '#8fc4ec'], [0.64, '#cfe2f4'], [0.76, '#ffd9e2'], [0.88, '#ffc0c8'], [1, '#ffd8a0']];
    const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const at = f => { let i = 0; while (i < stops.length - 2 && f > stops[i + 1][0]) i++; const a = stops[i], b = stops[i + 1], t2 = Math.max(0, Math.min(1, (f - a[0]) / (b[0] - a[0]))), A1 = rgb(a[1]), B1 = rgb(b[1]); return A1.map((v, k) => v + (B1[k] - v) * t2); };
    const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], rows = hor - top;
    for (let y = top; y < hor; y++) {
      const f = (y - top) / rows, col = at(f), lv = 8;
      for (let x = x0; x < x0 + W; x++) {
        const th = bayer[y & 3][(x - x0) & 3] / 16, cc = col.map(v => { const q = v / lv, fl = Math.floor(q), fr = q - fl; return Math.min(255, Math.round((fr > th ? fl + 1 : fl) * lv)); });
        g.fillStyle = 'rgb(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ')'; g.fillRect(x, y, 1, 1);
      }
    }
    for (let k = 0; k < 14; k++) { g.globalAlpha = 0.012 * (14 - k) * 2; R(g, x0, hor - 28 + k * 2, W, 2, 'W'); }
    g.globalAlpha = 1;
    for (let i = 0; i < 9; i++) { const hs = hash2(i * 31, 9), cx = x0 + (hs % W), cy = top + rows * (0.4 + (hs >>> 8) % 40 / 100), ww = 40 + hs % 70; g.globalAlpha = 0.22; R(g, cx, cy, ww, 2, '#ffffff'); R(g, cx + 8, cy + 2, ww - 16, 1, '#ffd0d8'); g.globalAlpha = 1; }
    return c;
  }

  /* ---------- далекий вид, сакура, кущі ---------- */
  function fuji(g, cx, bY, H, hw) {                       // гладкий конус зі сніжною шапкою (рваний край), імла до підніжжя; світло зліва
    for (let dx = -hw; dx <= hw; dx++) {
      const a = Math.abs(dx) / hw, hh = Math.min(Math.round(H * 0.985), Math.round(H * Math.pow(Math.max(0, 1 - a), 1.2)));
      if (hh < 1) continue;
      const top = bY - hh, lit = dx < 0, ridge = Math.sin(dx * 0.23) + Math.sin(dx * 0.61 + 2) > 1.15;
      const snowEnd = bY - H * 0.74 + 6 * Math.sin(dx * 0.33) + 4 * Math.sin(dx * 0.12 + 1) + 9 * Math.pow(Math.max(0, Math.sin(dx * 0.55 + 1.3)), 3);
      for (let y = top; y < bY; y += 2) {
        const hz = Math.max(0, Math.min(1, (y - (bY - H * 0.34)) / (H * 0.34)));
        let col = y < snowEnd ? (lit ? '#fbf8ff' : '#dcd7f2') : (lit ? '#8c88c0' : '#6c68ae');
        if (y >= snowEnd && ridge) col = mixc(col, '#4f4a96', 0.35);
        P(g, cx + dx, y, 1, Math.min(2, bY - y), mixc(col, '#f0c8dc', hz * 0.6));
      }
    }
  }
  function farSkyline(g, x0, W) {                       // гора Фудзі, телевежа, пагода, високі будинки
    const base = 112;
    fuji(g, x0 + Math.round(W * 0.5) + 90, LAYOUT.horizonY, 215, 250);        // велика Фудзі за торговим центром і будинками
    A(g, 0.45, () => {
      for (let x = x0, i = 0; x < x0 + W; i++) { const hs = hash2(x + 31, 7), bw = 10 + hs % 12, bh = 16 + (hs >>> 4) % 30; P(g, x, base - bh, bw, bh, i % 2 ? '#7a74b8' : '#6a66a8'); if (hs % 3 === 0) P(g, x + (bw >> 1), base - bh - 5, 1, 5, '#6a66a8'); x += bw + 1 + hs % 5; }
      const tx = x0 + Math.round(W * 0.62);
      for (let k = 0; k < 40; k++) { const half = Math.round(1 + (40 - k) * 0.12); P(g, tx - half, base - 52 + k, half * 2 + 1, 1, k % 8 < 4 ? '#e8503a' : '#f4ece0'); }
      P(g, tx - 4, base - 36, 9, 2, '#e8503a'); P(g, tx, base - 62, 1, 12, '#e8503a');
      const px = x0 + Math.round(W * 0.82);
      for (let t2 = 0; t2 < 5; t2++) { const ww = 22 - t2 * 3, yy = base - 14 - t2 * 8; P(g, px - (ww >> 1) - 3, yy, ww + 6, 2, '#5a4f98'); P(g, px - (ww >> 1), yy + 2, ww, 6, '#6a60a8'); }
      P(g, px, base - 58, 1, 8, '#5a4f98');
    });
  }
  function tree(g, x, v, season) {                      // сакура: товстий стовбур, пишна крона (восени — клени, взимку — гола)
    if (season === 'winter') { drawBareTree(g, x, v, season); return; }
    const base = LAYOUT.horizonY + 8, seed = x * 7 + v * 13, autumn = season === 'autumn';
    const C = autumn ? ['#a8382a', '#e8863c', '#f2b84b'] : ['#c8587a', '#ef8fa3', '#ffc9d4'];
    A(g, 0.26, () => { P(g, x - 27, base, 54, 4, 'd'); P(g, x - 19, base + 4, 38, 2, 'd'); });
    P(g, x - 4, base - 26, 8, 28, '#2a1d1a'); P(g, x - 3, base - 26, 6, 28, '#6b4a3a'); P(g, x - 3, base - 26, 2, 28, '#8a6450'); P(g, x - 7, base - 1, 5, 3, '#4a3228'); P(g, x + 3, base - 1, 5, 3, '#4a3228');
    P(g, x - 10, base - 30, 7, 2, '#4a3228'); P(g, x + 4, base - 34, 8, 2, '#4a3228'); P(g, x - 1, base - 36, 2, 10, '#4a3228');
    const blobs = [[0, -50, 17], [-17, -42, 12], [17, -42, 12], [-9, -58, 11], [10, -58, 11], [0, -38, 14], [-25, -34, 8], [25, -34, 8]];
    blobs.forEach(b => D(g, x + b[0] + 1, base + b[1] + 2, b[2], C[0]));
    blobs.forEach(b => D(g, x + b[0], base + b[1], b[2], C[1]));
    blobs.forEach(b => D(g, x + b[0] - 1, base + b[1] - 2, Math.round(b[2] * 0.7), C[2]));
    for (let i = 0; i < 38; i++) { const hs = hash2(seed + i * 3, 17), bx = x - 28 + hs % 56, by = base - 72 + (hs >>> 6) % 50; P(g, bx, by, 2, 1, i % 3 ? (autumn ? '#ffd9a0' : '#fff0f4') : '#ffffff'); if (i % 5 === 0) P(g, bx, by + 1, 1, 1, C[0]); }
    for (let i = 0; i < 16; i++) { const hs = hash2(seed + i * 5, 29); P(g, x - 30 + hs % 60, base + 1 + (hs >>> 7) % 5, 2, 1, i % 2 ? C[2] : (autumn ? '#e8863c' : '#fff0f4')); }
  }
  function bush(g, x, y) {                              // замість куща: торії, бамбук, кам'яний ліхтар
    const k = Math.abs(Math.round(x / 7)) % 3;
    if (x === 40) {
      const bx = x, by = y + 8;
      P(g, bx - 17, by - 36, 5, 36, DKW); P(g, bx - 16, by - 36, 3, 36, '#d3342c'); P(g, bx + 12, by - 36, 5, 36, DKW); P(g, bx + 13, by - 36, 3, 36, '#d3342c');
      P(g, bx - 24, by - 42, 49, 5, DKW); P(g, bx - 23, by - 41, 47, 3, '#d3342c'); P(g, bx - 26, by - 44, 53, 3, DKW); P(g, bx - 25, by - 43, 51, 1, '#3a3a3a');
      P(g, bx - 17, by - 31, 34, 3, DKW); P(g, bx - 16, by - 30, 32, 1, '#d3342c'); P(g, bx - 3, by - 38, 7, 7, DKW); P(g, bx - 2, by - 37, 5, 5, '#f4ece0');
      P(g, bx - 18, by - 2, 7, 3, '#4a4440'); P(g, bx + 11, by - 2, 7, 3, '#4a4440');
    } else if (k === 0) {
      for (let i = 0; i < 5; i++) { const bx = x - 8 + i * 4, hh = 34 + (i * 7) % 12; P(g, bx, y - hh + 8, 3, hh, '#2a4a2a'); P(g, bx + 1, y - hh + 8, 1, hh, '#6fbf5a'); for (let s = 6; s < hh; s += 9) P(g, bx, y - hh + 8 + s, 3, 1, '#2a4a2a'); P(g, bx - 3, y - hh + 10, 4, 1, '#4f9a3a'); P(g, bx + 2, y - hh + 14, 5, 1, '#4f9a3a'); }
    } else {
      P(g, x - 5, y + 6, 11, 3, '#6a645c'); P(g, x - 2, y - 6, 5, 12, '#8f897b'); P(g, x - 7, y - 10, 15, 4, '#a39d92'); P(g, x - 4, y - 18, 9, 8, '#6a645c'); P(g, x - 3, y - 17, 7, 6, '#ffd45c');
      P(g, x - 8, y - 22, 17, 4, '#8f897b'); P(g, x - 3, y - 25, 7, 3, '#a39d92'); P(g, x - 1, y - 28, 3, 3, '#6a645c');
    }
  }

  /* ---------- дерев'яні будинки з дашками ---------- */
  const WOOD = [['#b9743c', '#93572b', '#6a3a1c'], ['#cc8a4c', '#a46a34', '#7a4a24'], ['#8f4a2c', '#6e3620', '#4e2414'], ['#c4532f', '#9c3b1d', '#762810'], ['#dcbc8c', '#bb9866', '#8e6c40'], ['#6a4a36', '#523828', '#3a281c'], ['#a8683a', '#845028', '#5e381a']];
  const PLASTER = ['#f1e8d3', '#d6caae', '#b0a488'];
  const KANBAN = ['#ff3ea5', '#35e6ff', '#ffe84a', '#4dff88', '#ff8a2a', '#b46cff', '#ff4560', '#6aa0ff'].map(c => [c, mixc(c, '#ffffff', 0.6)]);   // неонові вивіски: [колір трубки, колір літер]
  const WORDS_V = ['ラーメン', '居酒屋', 'カフェ', '薬局', '旅館', '寿司', 'ゲーム', '焼肉', '書店', '喫茶', '電器', 'パン', '銭湯', '花屋', 'カラオケ', '麺屋'];
  const WORDS_H = ['ラーメン', '居酒屋', 'カフェ', 'ドラッグ', '本屋', 'ゲーム', '焼肉', 'コンビニ', 'そば', '寿司', 'ホテル'];
  function eave(g, x, y, w, drop) {                     // навіс-хісасі з черепиці, кінці загнуті вгору
    P(g, x - 2, y, w + 4, 3, TILE[1]); P(g, x - 2, y, w + 4, 1, TILE[2]); P(g, x - 2, y + 2, w + 4, 1, TILE[0]); P(g, x - 2, y + 3, w + 4, 1, TILE[3]);
    P(g, x - 4, y - 1, 2, 2, TILE[1]); P(g, x - 5, y - 2, 1, 1, TILE[1]); P(g, x + w + 2, y - 1, 2, 2, TILE[1]); P(g, x + w + 4, y - 2, 1, 1, TILE[1]);
    for (let k = x; k < x + w; k += 4) P(g, k, y + 1, 1, 1, TILE[3]);
    if (drop) A(g, 0.3, () => P(g, x - 1, y + 4, w + 2, 3, '#000000'));
  }
  /* дах у японському стилі: вигнутий профіль «сорі» (стрімкий біля коника, пологий до карниза), задерті краї, чорепиця з рядами,
     коник із золотими прикрасами-сьатіхоко на кінцях. Малюється по колонках: верхня межа — крива, нижня — пряма лінія карниза. */
  function jpRoofCols(g, xs, wr, yRidge, yEave, thick, ridgeF, tipLen, tipLift, snow) {
    const cxm = (wr - 1) / 2, yb = yEave;
    for (let i = 0; i < wr; i++) {
      const d = Math.abs(i - cxm) / cxm, u = Math.max(0, Math.min(1, (d - ridgeF) / (1 - ridgeF)));
      const drop = Math.round(Math.max(0, yEave - thick - yRidge) * (1 - Math.pow(1 - u, 2.2)));
      const e = Math.min(i, wr - 1 - i), lift = e < tipLen ? Math.round(tipLift * Math.pow(1 - e / tipLen, 1.3)) : 0;
      const yt = yRidge + drop - lift;
      for (let y = yt; y <= yb; y++) {
        const r = y - yt, row = yb - y;
        let c = row % 2 ? TILE[1] : TILE[0];
        if (r === 0) c = TILE[3];
        else if (y === yb) c = TILE[3];
        else if (row === 1) c = TILE[2];
        else if (row % 2 && (i + (row % 4 === 1 ? 0 : 2)) % 4 === 0) c = TILE[2];       // шви між рядами черепиці
        else if (u === 0 && r === 1) c = TILE[2];                                       // блиск на коникові
        if (snow && r < 3) c = r === 0 ? '#ffffff' : '#eaf2fc';
        g.fillStyle = hxc(c); g.fillRect(xs + i, y, 1, 1);
      }
    }
    const iL = Math.round(cxm - ridgeF * cxm), iR = Math.round(cxm + ridgeF * cxm), gold = '#e8b030';   // кінці коника: золоті «хвости» сьатіхоко
    [[iL, -1], [iR, 1]].forEach(([ii, s]) => {
      const bx = xs + ii;
      P(g, bx - 1, yRidge - 2, 3, 2, gold); P(g, bx - 1 + s, yRidge - 4, 2, 2, gold); P(g, bx + 2 * s, yRidge - 5, 1, 2, '#ffe08a'); P(g, bx - 1, yRidge - 2, 1, 1, '#ffe08a');
    });
  }
  function capRoof(g, x, w, yb, hgt, snow) {            // дах будинку: коник на 34% напівширини, задерті краї, виступ 6 px
    jpRoofCols(g, x - 6, w + 12, yb - hgt + 1, yb, 3, 0.34, 6, 2, snow);
  }
  function house(g, spec, lamps) {
    const { x, w, h } = spec, base = LAYOUT.horizonY, top = base - h, hs = hash2(x + 17, h), S = WOOD[(hs >>> 3) % WOOD.length];
    houseGlass = houseGlass || []; houseDoors = houseDoors || [];
    const CAP = 9, tb = top - 4 - CAP - 1, winter = buildSeason === 'winter';
    P(g, x, top, w, h, S[0]); P(g, x, top, w, 1, DKW); P(g, x, top, 1, h, DKW); P(g, x + w - 1, top, 1, h, DKW);
    A(g, 0.4, () => { for (let xx = x + 3; xx < x + w - 1; xx += 4) P(g, xx, top + 1, 1, h - 1, S[2]); });
    A(g, 0.22, () => { for (let xx = x + 4; xx < x + w - 1; xx += 4) P(g, xx, top + 1, 1, h - 1, '#ffffff'); });
    A(g, 0.38, () => P(g, x + w - 6, top + 1, 5, h - 1, S[2]));
    P(g, x + 1, top + 1, 2, h - 1, '#3a2418'); P(g, x + w - 3, top + 1, 2, h - 1, '#3a2418');
    P(g, x - 1, top - 4, w + 2, 4, S[1]); P(g, x - 1, top - 4, w + 2, 1, S[0]); P(g, x - 1, top - 1, w + 2, 1, DKW);
    const roofK = hs % 5, rx = x + 6 + ((hs >>> 5) % Math.max(1, w - 30));
    if (roofK === 1) { P(g, rx + 4, tb - 10, 1, 12, DKW); P(g, rx, tb - 8, 9, 1, DKW); P(g, rx + 1, tb - 5, 7, 1, DKW); }
    else if (roofK === 3) { P(g, rx, tb - 2, 12, 3, '#d9d3c4'); }
    capRoof(g, x, w, top - 4, CAP, winter);
    const floors = Math.max(2, Math.floor((h - 6) / 18)), doorX = x + (w >> 1) - 5;
    /* вивіски рахуємо ДО вікон: вікна обходять їх, а не лежать під ними */
    const kb = KANBAN[(hs >>> 7) % KANBAN.length], kh = KANBAN[(hs >>> 14) % KANBAN.length], wh = WORDS_H[(hs >>> 17) % WORDS_H.length];
    const gy = base - 23, gw = Math.min(w - 8, wh.length * 11 + 8), gx = x + 4 + ((w - 8 - gw) >> 1), gsz = Math.max(7, Math.min(11, Math.floor((gw - 6) / wh.length)));
    const kLeft = !((hs >>> 2) % 2), sy = top + 6 + ((hs >>> 9) % 12), kMax = Math.min(4, Math.floor((gy - 5 - sy - 5) / 10));
    const wordsV = WORDS_V.filter(wd => wd.length <= kMax), word = wordsV.length ? wordsV[(hs >>> 11) % wordsV.length] : '', n = word.length, sh = n * 10 + 5;
    const hasK = h > 66 && n >= 2, sx = kLeft ? x + 5 : x + w - 19, ky0 = sy - 7, ky1 = sy + sh + 2;
    for (let f = 0; f < floors; f++) {
      const y0 = base - 6 - (floors - f) * 18 + 4;
      let ax0 = x + 4, aw = w - 8;
      if (hasK && y0 - 1 < ky1 && y0 + 18 > ky0) { aw -= 17; if (kLeft) ax0 += 17; }         // стовпчик вертикальної вивіски на цьому поверсі
      const cols = aw < 13 ? 0 : Math.max(1, Math.floor(aw / 15)), sp = cols ? aw / cols : 0;
      if (f > 0) { P(g, x + 3, y0 - 5, w - 6, 2, '#3a2418'); P(g, x + 3, y0 - 5, w - 6, 1, S[1]); }
      if (f > 0 && f % 2 === 1) eave(g, x + 1, y0 - 9, w - 2, true);
      if (f > 0 && (hs >>> 12) % 3 === f % 3) { P(g, x + 4, y0 - 3, w - 8, 14, PLASTER[0]); P(g, x + w - 9, y0 - 3, 5, 14, PLASTER[1]); }
      for (let c = 0; c < cols; c++) {
        const wx = Math.round(ax0 + c * sp + (sp - 11) / 2), lit = hash2(wx, y0) % 3 === 0, glass = hash2(wx + 7, y0) % 4 === 0;
        if (f === floors - 1 && wx + 11 >= doorX - 6 && wx <= doorX + 16) continue;
        if (f === floors - 1 && wx + 12 >= gx - 1 && wx - 1 <= gx + gw + 1) continue;       // нижній поверх: горизонтальна вивіска над дверима
        const underSign = f === floors - 2 && wx + 12 >= gx - 1 && wx - 1 <= gx + gw + 1;       // знизу вікна лежать вивіска: кондиціонери/квіти пропускаємо
        P(g, wx - 1, y0 - 1, 13, 12, DKW);
        if (glass) { P(g, wx, y0, 11, 10, lit ? '#ffd45c' : '#8fb8d8'); P(g, wx, y0, 11, 3, lit ? '#ffe9a0' : '#bfe3f2'); P(g, wx + 5, y0, 1, 10, DKW); }
        else { P(g, wx, y0, 11, 10, lit ? '#ffd45c' : '#f3e8c4'); A(g, 0.8, () => { for (let k = 2; k < 11; k += 3) P(g, wx + k, y0, 1, 10, '#4a3020'); for (let k = 3; k < 10; k += 3) P(g, wx, y0 + k, 11, 1, '#4a3020'); }); if (lit) A(g, 0.35, () => P(g, wx, y0, 11, 10, '#ffffff')); }
        P(g, wx - 1, y0 + 10, 13, 2, S[2]); houseGlass.push([wx, y0, 11, 10]);
        const k = underSign ? -1 : hash2(wx + 3, y0 + 5) % 8;
        if (k === 0) { P(g, wx + 1, y0 + 12, 7, 4, '#e8e8ea'); P(g, wx + 1, y0 + 12, 7, 1, '#fff'); P(g, wx + 2, y0 + 14, 4, 1, '#7a7a82'); }
        else if (k === 1) { P(g, wx - 1, y0 + 12, 13, 1, DKW); P(g, wx + 1, y0 + 13, 3, 4, '#f26a8b'); P(g, wx + 5, y0 + 13, 3, 5, '#fff'); P(g, wx + 9, y0 + 13, 2, 4, '#5f9fc9'); }
        else if (k === 2) { P(g, wx + 2, y0 + 12, 8, 1, DKW); P(g, wx + 3, y0 + 10, 2, 2, '#4f9a3a'); P(g, wx + 7, y0 + 10, 2, 2, '#ef8fa3'); }
        else if (k === 3) { P(g, wx + 2, y0 + 12, 1, 5, '#d3342c'); D(g, wx + 2, y0 + 15, 2, '#d3342c'); D(g, wx + 2, y0 + 15, 1, '#ffd45c'); }
      }
    }
    if (hasK) { P(g, sx + 6, sy - 6, 2, 5, DKW); P(g, sx - 2, sy - 6, 18, 1, DKW); neonBox(g, sx, sy, 14, sh, kb[0]); neonText(g, (dx, dy, col) => vtext(g, word, sx + 2 + dx, sy + 3 + dy, col, 11, true), kb[0]); }
    P(g, gx - 2, gy - 3, gw + 4, 2, TILE[1]); P(g, gx - 2, gy - 3, gw + 4, 1, TILE[2]); P(g, gx - 3, gy - 4, 1, 2, TILE[1]); P(g, gx + gw + 2, gy - 4, 1, 2, TILE[1]);   // тонкий навіс над вивіскою (нижче вікон верхнього поверху)
    neonBox(g, gx, gy, gw, 14, kh[0]); neonText(g, (dx, dy, col) => text(g, wh, gx + 3 + dx, gy + 1 + ((11 - gsz) >> 1) + dy, col, gsz, true), kh[0]);
    houseDoors.push({ x: doorX + 5, y: base });
    P(g, doorX, base - 14, 10, 14, DKW); P(g, doorX + 1, base - 13, 8, 13, '#e8dcb8'); A(g, 0.7, () => { P(g, doorX + 4, base - 13, 1, 13, '#4a3020'); for (let k = -10; k < 0; k += 3) P(g, doorX + 1, base + k, 8, 1, '#4a3020'); });
    ['#1c3a78', '#f4ece0', '#1c3a78'].forEach((c, i) => { P(g, doorX - 1 + i * 4, base - 17, 4, 6, c); P(g, doorX - 1 + i * 4, base - 17, 4, 1, DKW); });
    if (hs % 4 === 1) { P(g, x + w + 1, top + 8, 2, base - top - 8, '#3a2f2a'); P(g, x + w - 4, top + 10, 12, 1, '#3a2f2a'); P(g, x + w - 3, top + 14, 10, 1, '#3a2f2a'); }
  }

  /* ---------- об'ємні кеш-спрайти (світло зверху-ліворуч, тінь знизу-праворуч — як у куль інших епох) ---------- */
  const rampOf = base => [mixc(base, '#ffffff', 0.45), mixc(base, '#ffffff', 0.18), base, mixc(base, '#3b3560', 0.3), mixc(base, '#272048', 0.55)];
  const LGT = [-0.55, -0.6, 0.58], cache = {};
  const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function shadeEllipse(g, cx, cy, rx, ry, base) {
    const r = rampOf(base), inside = (x, y) => { const dx = (x + 0.5 - cx) / (rx + 0.5), dy = (y + 0.5 - cy) / (ry + 0.5); return dx * dx + dy * dy <= 1; };
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      if (!inside(x, y)) continue;
      const nx = Math.max(-1, Math.min(1, (x + 0.5 - cx) / (rx + 0.5))), ny = Math.max(-1, Math.min(1, (y + 0.5 - cy) / (ry + 0.5))), nz = Math.sqrt(Math.max(0.02, 1 - nx * nx * 0.9 - ny * ny * 0.9));
      let sh = 0.7 - (nx * LGT[0] + ny * LGT[1] + nz * LGT[2]) * 0.58 + ((x * 3 + y * 7) % 5 === 0 ? 0.04 : 0) + (((x + y) & 1) ? 0.02 : 0);
      if (!inside(x - 1, y - 1)) sh -= 0.16;
      if (!inside(x + 1, y + 1)) sh += 0.26;
      g.fillStyle = sh < 0.14 ? r[0] : sh < 0.34 ? r[1] : sh < 0.55 ? r[2] : sh < 0.76 ? r[3] : r[4];
      g.fillRect(x, y, 1, 1);
    }
  }
  function ball(r, base) { const k = 'b' + r + base; if (cache[k]) return cache[k]; const c = cvs(r * 2 + 4, r * 2 + 4); shadeEllipse(c.getContext('2d'), r + 2, r + 2, r, r, base); return (cache[k] = c); }
  const LCOL = ['#e8503a', '#ff9a3a', '#f26a9b', '#f4e4a0', '#e8b030'];
  function lanternSprite(k, idx) {                      // ліхтар: світиться зсередини, ребра, шапки, китиця, ієрогліф «щастя»
    const key = 'l' + k + '_' + idx; if (cache[key]) return cache[key];
    const rx = [5, 6, 7][k], ry = [6, 8, 9][k], W = rx * 2 + 6, H = ry * 2 + 14, c = cvs(W, H), g = c.getContext('2d'), cx = W / 2, cy = ry + 3, base = LCOL[idx % LCOL.length], rp = rampOf(base);
    const inside = (x, y) => { const dx = (x + 0.5 - cx) / (rx + 0.3), dy = (y + 0.5 - cy) / (ry + 0.3); return dx * dx + dy * dy <= 1; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!inside(x, y)) continue;
      const nx = (x + 0.5 - cx) / (rx + 0.3), ny = (y + 0.5 - cy) / (ry + 0.3), rr = Math.sqrt(nx * nx + ny * ny), nz = Math.sqrt(Math.max(0.02, 1 - nx * nx * 0.85 - ny * ny * 0.85));
      let sh = 0.62 - (nx * LGT[0] + ny * LGT[1] + nz * LGT[2]) * 0.5 - (1 - rr) * 0.28;
      if (!inside(x + 1, y + 1)) sh += 0.22; if (!inside(x - 1, y - 1)) sh -= 0.12;
      const glow = Math.max(0, 1 - rr * 1.05);
      g.fillStyle = glow > 0.55 ? '#fff8d8' : glow > 0.3 ? mixc('#ffe9a0', base, 0.3) : sh < 0.15 ? rp[0] : sh < 0.35 ? rp[1] : sh < 0.56 ? rp[2] : sh < 0.78 ? rp[3] : rp[4];
      g.fillRect(x, y, 1, 1);
    }
    for (const f of [-0.6, 0, 0.6]) { const xx = Math.round(cx + f * rx); for (let y = 0; y < H; y++) if (inside(xx, y)) { g.fillStyle = f === 0 ? rp[3] : rp[4]; g.globalAlpha = 0.55; g.fillRect(xx, y, 1, 1); g.globalAlpha = 1; } }
    g.fillStyle = DKW; g.fillRect(Math.round(cx - rx * 0.55), cy - ry - 1, Math.round(rx * 1.1), 2); g.fillRect(Math.round(cx - rx * 0.55), cy + ry, Math.round(rx * 1.1), 2);
    g.fillStyle = '#6a4a30'; g.fillRect(Math.round(cx - rx * 0.55), cy - ry - 1, Math.round(rx * 1.1), 1);
    g.fillStyle = '#ffd24a'; g.fillRect(Math.round(cx) - 1, cy + ry + 2, 3, 2); g.fillStyle = '#fff2b0'; g.fillRect(Math.round(cx) - 1, cy + ry + 2, 1, 1);
    g.fillStyle = '#d83a2a'; for (let i = -1; i <= 1; i++) g.fillRect(Math.round(cx) + i, cy + ry + 4, 1, 4 + (i === 0 ? 1 : 0));
    g.fillStyle = DKW; g.fillRect(Math.round(cx), cy - ry - 3, 1, 2);
    const T = cvs(12, 12); text(T.getContext('2d'), '福', 1, 1, idx % 2 ? '#7a1a0a' : '#3a1008', 9, true);
    g.drawImage(T, Math.round(cx - 5), Math.round(cy - 5), 12, 12);
    return (cache[key] = c);
  }
  const LANT = [[0.07, 0.35, 1], [0.2, 0.62, 0], [0.31, 0.22, 2], [0.43, 0.5, 0], [0.55, 0.3, 1], [0.67, 0.58, 0], [0.78, 0.2, 2], [0.9, 0.46, 1], [0.97, 0.7, 0]];
  function drawLanterns(g, t, wl, wr, top, span) {
    const W = wr - wl, N = Math.max(LANT.length, Math.round(W / 105));            // ліхтарі розвішані по ВСЬОМУ світу (камера їх не тягне за собою)
    for (let i = 0; i < N; i++) {
      const [u0, v, k] = LANT[i % LANT.length], u = (i + u0) / N;
      const x = wl + W * u + Math.sin(t * 0.35 + i * 1.7) * 7, y = top + 10 + span * v + Math.sin(t * 0.6 + i) * 3 - ((t * 1.5 + i * 11) % 10);
      const s = lanternSprite(k, i); g.globalAlpha = 0.14; D(g, Math.round(x), Math.round(y + 3), 8 + k * 2, '#ffd45c'); g.globalAlpha = 1;
      g.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height / 2));
    }
  }
  let headSp = null;
  function headSprite() {                               // голова дракона (дивиться ліворуч)
    if (headSp) return headSp;
    const c = cvs(58, 44), g = c.getContext('2d');
    [[40, 12, 5, 8], [34, 6, 4, 7], [28, 10, 4, 6], [44, 20, 4, 6], [38, 26, 3, 5]].forEach(([x, y, a, b], i) => shadeEllipse(g, x, y, a, b, i % 2 ? '#ff7a30' : '#e8503a'));
    const horn = (x, y) => { for (let i = 0; i < 12; i++) { const px = x + i * 1.2, py = y - Math.sin(i / 11 * Math.PI * 0.8) * 7 + i * 0.5, w = Math.max(1, 3 - i * 0.2); g.fillStyle = i < 3 ? '#fff2b0' : '#ffd24a'; g.fillRect(Math.round(px), Math.round(py), Math.round(w), 2); g.fillStyle = '#a07818'; g.fillRect(Math.round(px), Math.round(py) + 2, Math.round(w), 1); } };
    horn(30, 11); horn(22, 9);
    shadeEllipse(g, 30, 22, 13, 11, '#2fbf86'); shadeEllipse(g, 14, 25, 12, 6, '#2fbf86'); shadeEllipse(g, 15, 31, 10, 3, '#f0d890'); shadeEllipse(g, 5, 23, 4, 3, '#5fe0a8');
    g.fillStyle = '#ffffff'; [[6, 28], [10, 29], [15, 29]].forEach(([x, y]) => g.fillRect(x, y, 1, 2));
    g.fillStyle = '#12301f'; g.fillRect(3, 22, 2, 2);
    g.fillStyle = '#ffffff'; g.fillRect(22, 17, 6, 5); g.fillStyle = '#e8503a'; g.fillRect(23, 18, 4, 4); g.fillStyle = '#1a1a1a'; g.fillRect(24, 18, 2, 3); g.fillStyle = '#ffffff'; g.fillRect(24, 18, 1, 1);
    g.fillStyle = '#12301f'; g.fillRect(21, 15, 8, 2); g.fillRect(20, 16, 2, 2);
    g.fillStyle = '#e8503a'; g.fillRect(34, 26, 3, 5); g.fillRect(36, 29, 2, 3);
    return (headSp = c);
  }
  function dragonPath(t, wl, wr, top, span) {           // повільний політ по всьому небу: хвилі, розвороти, петлі
    const W = wr - wl, cxm = wl + W * 0.5, a = t * 0.07;
    return [cxm + Math.sin(a) * W * 0.5 + Math.sin(a * 2.3 + 1.1) * W * 0.1, top + span * (0.5 + 0.42 * Math.sin(a * 1.7 + 0.6)) + Math.sin(a * 4.1) * 5];
  }
  let GA = 1;                                           // множник прозорості: уночі дракон малюється ще раз поверх затемнення
  function breathFire(g, t, night) {                    // вогонь із пащі (координати голови, дивиться ліворуч): раз на ~11 с, ~2,4 с; уночі яскравий і з м'яким ореолом
    const ph = (t + 3.7) % 11, env = ph < 2.4 ? Math.sin(ph / 2.4 * Math.PI) : 0;
    if (env < 0.03) return;
    const L = 8 + 44 * env, ga = night > 0 ? Math.min(1, night * 1.4) : g.globalAlpha, cols = ['#fffbe6', '#ffe45e', '#ffb02e', '#ff6a2b', '#d93a2a'];
    if (night > 0) { g.globalAlpha = ga * env * 0.09; D(g, Math.round(-27 - L * 0.5), 5, Math.round(7 + L * 0.28), '#ff8a30'); g.globalAlpha = ga * env * 0.14; D(g, Math.round(-27 - L * 0.45), 5, Math.round(4 + L * 0.16), '#ffc060'); }
    for (let i = 23; i >= 0; i--) {
      const u = i / 23, x = -27 - u * L, y = 5 + Math.sin(t * 15 + i * 0.9) * (0.8 + 3 * u) * env - u * u * 4;
      g.globalAlpha = ga * Math.min(1, env * 1.6) * (1 - u * 0.55);
      D(g, Math.round(x), Math.round(y), Math.max(1, Math.round(1 + u * (2 + 4 * env))), cols[Math.min(4, Math.floor(u * 5))]);
    }
    g.globalAlpha = ga * env;
    for (let k = 0; k < 6; k++) { const u = (t * 1.7 + k / 6) % 1; P(g, -30 - u * (L + 10), 4 + Math.sin(k * 2.3 + t * 5) * 7 * u, 1, 1, k % 2 ? '#ffe45e' : '#ff9a2b'); }
    g.globalAlpha = night > 0 ? GA : ga;
  }
  function dragon(g, t, wl, wr, top, span, night) { return dragonDraw(g, t, tt => dragonPath(tt, wl, wr, top, span), night); }
  function dragonDraw(g, t, pos, night) {                // pos(tt) → [x, y] голови в момент tt; однаковий для неба й будівництва
    const N = 30, SP = 7.4, pts = [], dt = 0.04, h0 = pos(t);
    pts.push(h0);
    let tt = t, prev = h0, acc = 0;
    for (let it = 0; it < 4000 && pts.length < N; it++) {
      tt -= dt; const p = pos(tt); acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p;
      if (acc >= SP) { acc = 0; pts.push([p[0], p[1] + Math.sin(t * 2.2 - pts.length * 0.5) * 3]); }
    }
    while (pts.length < N) pts.push(pts[pts.length - 1]);
    const back = pos(t - 0.15), hv = [pts[0][0] - back[0], pts[0][1] - back[1]], faceL = hv[0] < 0;
    const bodyR = i => Math.max(3, Math.round(11 - i * 0.27));
    const [tx, ty] = pts[N - 1];
    for (let k = 0; k < 6; k++) P(g, tx + (faceL ? 3 : -5) + (faceL ? k : -k) * 2, ty - 2 + Math.round(Math.sin(t * 3 + k) * 2), 3, 2, k % 2 ? '#e8503a' : '#ffd24a');
    for (let i = N - 1; i >= 1; i--) {
      const [x, y] = pts[i], r = bodyR(i);
      if (i % 2 === 0 && i < N - 5) { const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], n = Math.hypot(dx, dy) || 1, sx = x + (dy / n) * (r + 1), sy = y + (-dx / n) * (r + 1); P(g, Math.round(sx) - 1, Math.round(sy) - 2, 3, 4, '#e8503a'); P(g, Math.round(sx), Math.round(sy) - 4, 1, 2, '#ffd24a'); P(g, Math.round(sx) - 1, Math.round(sy) - 2, 1, 4, '#ff9a80'); }
      g.drawImage(ball(r, i % 2 ? '#2fbf86' : '#38c88e'), Math.round(x - r - 2), Math.round(y - r - 2));
      if (i > 1) { const rb = Math.max(1, Math.round(r * 0.55)); g.drawImage(ball(rb, '#f4e4a0'), Math.round(x - rb - 2), Math.round(y + r * 0.45 - rb - 2)); }
    }
    [6, 12, 19].forEach(li => { const [x, y] = pts[li], r = bodyR(li); P(g, x - 1, y + r - 1, 3, 6, '#1c7a58'); P(g, x - 1, y + r - 1, 1, 6, '#5fe0a8'); P(g, x - 3, y + r + 5, 7, 2, '#2fbf86'); [-2, 0, 2].forEach(d => P(g, x + d, y + r + 7, 1, 2, '#ffd24a')); });
    const [hx, hy] = pts[0], hs = headSprite(), ang = Math.max(-0.7, Math.min(0.7, Math.atan2(hv[1], Math.abs(hv[0]) + 0.001))) * (faceL ? 1 : -1) * -1;
    g.save(); g.translate(Math.round(hx), Math.round(hy)); if (!faceL) g.scale(-1, 1); g.rotate(Math.round((faceL ? ang : -ang) * 6) / 6); breathFire(g, t, night); g.drawImage(hs, -30, -22); g.restore();
    const dir = faceL ? -1 : 1;
    for (let k = 0; k < 14; k++) { const wx = hx + dir * (14 + k * 2), wy = hy + 6 + Math.round(Math.sin(t * 3 + k * 0.5) * 3) + k * 0.4; P(g, wx, wy, 2, 1, '#ffd24a'); P(g, wx, wy - 7 - Math.round(Math.sin(t * 3 + k * 0.4) * 2), 2, 1, '#ffe08a'); }
    const px = hx + dir * 36, py = hy + 8 + Math.sin(t * 2) * 2; g.globalAlpha = 0.25 * GA; D(g, Math.round(px), Math.round(py), 7, '#fff2b0'); g.globalAlpha = GA; g.drawImage(ball(3, '#ffffff'), Math.round(px - 5), Math.round(py - 5));
  }
  function skyExtra(time, noFly) {
    const g = ctx, wl = worldL(), wr = worldR(), top = 8 - view.offY, span = Math.max(60, LAYOUT.horizonY - MAX_HOUSE_H - 6 - top - 24), W = wr - wl;
    if (!noFly) { dragon(g, time, wl, wr, top + 12, span); drawLanterns(g, time, wl, wr, top + 12, span); }
    const nP = Math.min(420, Math.round(90 * Math.max(1, W / Math.max(200, visR() - visL()))));      // лепестки теж у світі; щільність на екрані та сама
    for (let i = 0; i < nP; i++) { const hs = hash2(i * 13, 5), px = wl + ((hs % 1000) / 1000 * W + time * (6 + hs % 5)) % W, py = top + 8 + (((hs >>> 10) % 1000) / 1000 * 170 + time * (8 + hs % 6)) % 170; P(g, Math.round(px), Math.round(py), 2, 1, '#ffc9d4'); P(g, Math.round(px) + (hs % 2), Math.round(py) + 1, 1, 1, '#ef8fa3'); }
  }

  /* ---------- магазин: чотирисхилий дах-ірімоя, навіси між поверхами, шодзі, торії-вхід ---------- */
  function noren(g, x, y, w, cols) {
    const n = Math.max(2, Math.floor(w / 6)), cw = Math.floor(w / n);
    P(g, x - 1, y - 1, w + 2, 1, DKW);
    for (let i = 0; i < n; i++) { P(g, x + i * cw, y, cw - 1, 9, cols[i % cols.length]); P(g, x + i * cw, y + 9, cw - 1, 1, DKW); P(g, x + i * cw, y + 7, cw - 1, 2, 'rgba(0,0,0,0.12)'); }
  }
  function chochin(g, x, y, c) {
    P(g, x - 1, y - 3, 3, 2, DKW); P(g, x - 3, y - 1, 7, 9, DKW); P(g, x - 2, y, 5, 7, c); P(g, x - 2, y, 2, 7, '#ff8a70'); P(g, x - 2, y + 2, 5, 1, DKW); P(g, x - 2, y + 5, 5, 1, DKW); P(g, x - 1, y + 8, 3, 1, DKW); P(g, x, y + 9, 1, 2, '#ffd24a');
  }
  function maneki(g, x, yb) {
    P(g, x - 5, yb - 14, 11, 14, DKW); P(g, x - 4, yb - 13, 9, 12, '#fff8ee'); P(g, x - 4, yb - 13, 3, 12, '#ffffff'); P(g, x - 5, yb - 17, 3, 4, DKW); P(g, x + 3, yb - 17, 3, 4, DKW);
    P(g, x - 4, yb - 16, 1, 3, '#fff8ee'); P(g, x + 4, yb - 16, 1, 3, '#fff8ee'); P(g, x - 3, yb - 10, 2, 1, DKW); P(g, x + 1, yb - 10, 2, 1, DKW); P(g, x - 1, yb - 8, 2, 1, '#e8503a');
    P(g, x - 4, yb - 6, 9, 2, '#d3342c'); P(g, x - 1, yb - 5, 3, 3, '#ffd24a'); P(g, x + 5, yb - 18, 3, 8, DKW); P(g, x + 5, yb - 17, 2, 6, '#fff8ee');
  }
  function vending(g, x, yb, c) {
    P(g, x, yb - 20, 12, 20, DKW); P(g, x + 1, yb - 19, 10, 18, c); P(g, x + 2, yb - 18, 8, 9, '#cfe9f4'); for (let i = 0; i < 6; i++) P(g, x + 3 + (i % 3) * 2 + (i % 3), yb - 16 + (i >> 1) * 3, 2, 2, ['#e8503a', '#2c6fbf', '#4f9a3a', '#f2c200'][i % 4]);
    P(g, x + 2, yb - 7, 8, 3, '#1a1a1a'); P(g, x + 8, yb - 10, 2, 2, '#ffd45c');
  }
  function shopRoof(g, style, w, top, look) {
    const y1 = top + 3, cx = w >> 1;
    jpRoofCols(g, 0, w, 6, y1, Math.min(6, Math.max(4, Math.round((y1 - 6) * 0.35))), 0.26, 9, 3, false);   // вигнутий дах-ірімоя на всю ширину (нижній ряд суцільний)
    roofSignG(g, cx, Math.max(0, y1 - 13), false);                       // вивіска CAPYTAP на фронтоні
  }
  function shopDeco(g, es, w, h, look, level, floors, yG, door, yB) {
    const top = look.top, yb = h - 7;
    [0, w - 3].forEach(px => { P(g, px, top + 7, 3, h - 6 - (top + 7), '#7a0f1c'); P(g, px + (px ? 0 : 1), top + 7, 1, h - 6 - (top + 7), '#d3342c'); });      // бічні червоні стовпи: фасад на всю ширину без сходинок
    floors.forEach((fl, i) => { if (i > 0) eave(g, 3, fl.top - 3, w - 6, true); });
    eave(g, 2, yG + 4, w - 4, true);
    floors.filter(fl => fl.f >= 1).forEach(fl => A(g, 0.5, () => { for (let x = 8; x < w - 8; x += 6) P(g, x, fl.top + 3, 1, fl.fy - fl.top - 6, '#fff7e8'); for (let y = fl.top + 7; y < fl.fy - 4; y += 7) P(g, 8, y, w - 16, 1, '#fff7e8'); }));
    const tx0 = door.x - 6, tx1 = door.x + door.w + 3, tyT = yG + 2;
    P(g, tx0, tyT, 3, yb - tyT, '#7a0f1c'); P(g, tx0 + 1, tyT, 1, yb - tyT, '#d3342c'); P(g, tx1, tyT, 3, yb - tyT, '#7a0f1c'); P(g, tx1 + 1, tyT, 1, yb - tyT, '#d3342c');
    P(g, tx0 - 4, tyT - 3, tx1 - tx0 + 11, 3, DKW); P(g, tx0 - 3, tyT - 2, tx1 - tx0 + 9, 1, '#d3342c'); P(g, tx0 - 6, tyT - 5, 3, 2, DKW); P(g, tx1 + 7, tyT - 5, 3, 2, DKW);
    P(g, tx0, tyT + 5, tx1 - tx0 + 3, 2, '#7a0f1c');
    noren(g, door.x - 2, tyT + 7, door.w + 4, ['#1c3a78', '#f4ece0', '#1c3a78']);
    for (let x = 22; x < w - 18; x += 24) { if (x > tx0 - 14 && x < tx1 + 14) continue; chochin(g, x, yG + 8, '#d3342c'); }
    chochin(g, tx0 - 10, tyT + 8, '#d3342c'); chochin(g, tx1 + 14, tyT + 8, '#d3342c');
    if (level >= 2) { maneki(g, 15, yb); vending(g, w - 24, yb, ['#d33', '#27a', '#3a5'][level % 3]); }
    if (level >= 3) { P(g, 28, yb - 12, 10, 3, '#6a645c'); P(g, 30, yb - 18, 6, 6, '#8f897b'); P(g, 31, yb - 17, 4, 4, '#ffd45c'); P(g, 28, yb - 21, 10, 3, '#8f897b'); }
    for (let i = 0; i < 16; i++) { P(g, 2 + i * 2 + (i % 3), top + 8 + (i * 3) % 7, 2, 2, i % 3 ? '#ef8fa3' : '#fff0f4'); P(g, w - 4 - i * 2 - (i % 3), top + 9 + (i * 5) % 6, 2, 2, i % 3 ? '#ffc9d4' : '#ef8fa3'); }
  }
  function facadeFx(g, es, w, h, look, level, floors, yG) { const top = look.top; for (let x = 10; x < w - 10; x += 14) { P(g, x, top + 11, 1, 1, '#fff'); P(g, x + 6, top + 21, 1, 1, '#ffc9d4'); } }
  function signMotif(g, es, w, top) {
    const y0 = top + 8;
    [10, w - 10].forEach(x => { D(g, x, y0 + 8, 7, '#fff'); D(g, x, y0 + 8, 6, '#d3342c'); D(g, x, y0 + 8, 4, '#fff'); D(g, x, y0 + 8, 2, '#d3342c'); });
    for (let x = 22; x < w - 22; x += 8) { P(g, x, y0 + 1, 3, 1, '#f4ece0'); P(g, x + 4, y0 + 14, 3, 1, '#ffc9d4'); }
  }

  /* ---------- реєстрація ---------- */
  ARCH.japan = {
    buildSky, farSkyline, bush, tree, house, skyExtra,
    drawDragon: (g, t, pos) => dragonDraw(g, t, pos, 0),          // той самий дракон, що в небі (використовує будівництво, 278)
    nightExtra(time, noFly) {                                       // після нічного затемнення: дракон ледь підсвічений, вогонь світиться
      const n = sky.night; if (noFly || n < 0.05) return;
      const wl = worldL(), wr = worldR(), top = 8 - view.offY, span = Math.max(60, LAYOUT.horizonY - MAX_HOUSE_H - 6 - top - 24);
      GA = Math.min(0.5, n * 0.55); ctx.globalAlpha = GA;
      dragon(ctx, time, wl, wr, top + 12, span, n);
      GA = 1; ctx.globalAlpha = 1;
    },
    roof: shopRoof, facadeDeco: shopDeco, facadeFx, facadeExtra() { /* немає */ }, signMotif, roofProp() { /* дахові прикраси лишились у торіях і ліхтарях */ }, noRoofExtras: true
  };
  HOUSE_TONE.push([0.1, 0.8, 30]);
  EPOCH_SHOP.push({ flat: false, roofPal: { r: 'n', n: 'z' }, trim: 'w', col: ['r', 'E'], frame: ['d', 'r'], glass: 'S', base: 'e', band: ['checker', 'w'], awning: 'scallop', inner: ['w', 'q', 'y'], fx: 'japan', roofs: [0, 1, 1, 4, 4, 1] });
  EPOCH_AWN.push([['r', 'w'], ['n', 'w'], ['r', 'y'], ['y', 'r']]);
  EPOCH_STREET.push(['aboard', 'bench', 'planter']);
  EPOCH_ROOF_SIGN.push(['n', 'y']);
  ROOF_GLOW.push('y');
  BULB_SETS.push(['r', 'y', 'w', 'p', 'q']);
  CLOCK_ROOF.push('n');
  PAV_SEQ.push(['clothes', 'plants', 'books', 'toys', 'jewel', 'clothes']);
  PAV_PAL.push(['r', 'w', 'n', 'h']);
  PAV_BACK.push('W');
  PAV_CANOPY.push(['r', 'w']);
  PAV_TECH.push(['.d....d.', '.dd..dd.', 'dwwwwwwd', 'dwkwwkwd', 'dwwrrwwd', '.dwwwwd.', 'dwwhhwwd', 'dwwhhwwd', 'dwwwwwwd', '.dddddd.']);
  BENCH_PAL.japan = ['b', 'c', 'd'];
  ROOF_PREF.japan = [0, 5, 4, 1];
  EPOCH_CREATURES.push({ icon: '🕊️', move: 'float' });

  /* ---------- журавлик-орігамі (істота епохи), емблема, перехід, заставка ---------- */
  window.drawJapanCrane = function (g) {                // 18×16, дивиться вправо
    const p = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    p(4, 9, 8, 4, '#f7f2e6'); p(5, 8, 6, 1, '#ffffff'); p(2, 6, 4, 4, '#e4dccb'); p(3, 5, 2, 2, '#f7f2e6'); p(0, 8, 3, 2, '#e4dccb');
    p(10, 6, 5, 3, '#f7f2e6'); p(13, 4, 3, 3, '#ffffff'); p(15, 5, 2, 1, '#e8863c'); p(14, 4, 1, 1, '#d3342c');
    p(6, 4, 3, 5, '#ffffff'); p(7, 2, 2, 3, '#f1ece0'); p(5, 11, 5, 1, '#cfc5b8'); p(7, 13, 1, 2, '#8a7f6a'); p(9, 13, 1, 2, '#8a7f6a');
    p(8, 9, 1, 3, '#d3342c');
  };
  window.drawJapanEmblem = function (g) {               // 32×32: сонце й торії
    D(g, 16, 14, 11, '#d3342c'); D(g, 16, 14, 9, '#e8503a');
    P(g, 3, 8, 26, 3, DKW); P(g, 4, 9, 24, 1, '#d3342c'); P(g, 1, 6, 30, 3, DKW); P(g, 2, 7, 28, 1, '#3a3a3a');
    P(g, 7, 11, 4, 17, DKW); P(g, 8, 11, 2, 17, '#d3342c'); P(g, 21, 11, 4, 17, DKW); P(g, 22, 11, 2, 17, '#d3342c');
    P(g, 8, 15, 16, 2, DKW); P(g, 9, 15, 14, 1, '#d3342c'); P(g, 5, 28, 8, 2, '#4a4440'); P(g, 19, 28, 8, 2, '#4a4440');
  };
  function drawWarpJapan(k) {
    const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
    const ka = seg(k, 0, 0.25), kt = seg(k, 0.1, 0.74), kr = seg(k, 0.74, 1);
    g.drawImage(warp.snap, 0, 0);
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#1c2a6e'); sky.addColorStop(0.55, '#ef8fa3'); sky.addColorStop(1, '#ffd9a0');
    g.globalAlpha = ez(ka); g.fillStyle = sky; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    g.globalAlpha = 0.9 * kt; g.fillStyle = '#d3342c'; g.beginPath(); g.arc(cx, cy, Math.min(W, H) * 0.26, 0, 7); g.fill(); g.globalAlpha = 1;
    const N = 8, spd = k * 9;
    for (let j = 0; j < N; j++) {                                                   // тунель із торіїв: далекі малі, близькі великі
      const z = ((j + spd) % N) / N, s = Math.pow(z, 2.1) * Math.min(W, H) * 0.95 + 4, a = Math.min(1, z * 3) * kt;
      if (a <= 0.02) continue;
      g.save(); g.translate(cx, cy + s * 0.18); g.globalAlpha = a;
      const pw = Math.max(1, s * 0.07), ph = s * 0.9;
      g.fillStyle = '#2a1a10'; g.fillRect(-s * 0.46 - 1, -ph * 0.62 - 1, s * 0.92 + 2, s * 0.1 + 2);
      g.fillStyle = '#d3342c'; g.fillRect(-s * 0.46, -ph * 0.62, s * 0.92, s * 0.1);
      g.fillRect(-s * 0.4, -ph * 0.5, s * 0.8, s * 0.05);
      g.fillStyle = '#2a1a10'; g.fillRect(-s * 0.3 - pw - 1, -ph * 0.5, pw + 2, ph); g.fillRect(s * 0.3 - 1, -ph * 0.5, pw + 2, ph);
      g.fillStyle = '#d3342c'; g.fillRect(-s * 0.3 - pw, -ph * 0.5, pw, ph); g.fillRect(s * 0.3, -ph * 0.5, pw, ph);
      g.restore();
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 40; i++) {                                                  // пелюстки сакури кружляють до центру
      const an = warpSeed(i) * 6.283 + k * 2.4, f = (spd * 0.1 + warpSeed(i + 9)) % 1, r = (1 - f) * diag * 0.55 + 6;
      g.globalAlpha = Math.min(1, f * 3) * kt; g.fillStyle = i % 2 ? '#ffc9d4' : '#ef8fa3'; g.fillRect(cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.75, Math.max(1, sc * 1.4), Math.max(1, sc * 0.9));
    }
    g.globalAlpha = 1;
    const cs = getSpriteCanvas(capySprite()), cap = Math.min(1, seg(k, 0.12, 0.3) * (1 - seg(k, 0.66, 0.76))), cw = cs.width * sc * 1.5, chh = cs.height * sc * 1.5;
    if (cap > 0) { g.save(); g.translate(cx, cy + Math.sin(k * 24) * sc * 1.5); g.rotate(Math.sin(k * 7) * 0.2); g.globalAlpha = cap; g.drawImage(cs, -cw / 2, -chh / 2, cw, chh); g.restore(); g.globalAlpha = 1; }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    warp.icons.forEach((ic, i) => { const f = (kt * 2.1 + i / warp.icons.length) % 1, an = i * 2.4 + k * 2, r = Math.pow(f, 1.6) * diag * 0.7; g.globalAlpha = Math.sin(f * Math.PI) * kt; g.font = Math.round((5 + f * 20) * sc) + 'px sans-serif'; g.fillText(ic, cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.75); });
    g.globalAlpha = 1;
    if (kr > 0) { g.fillStyle = '#fff'; g.globalAlpha = 1 - kr; g.fillRect(0, 0, W, H); g.globalAlpha = 1; warpReveal(g, cx, cy, ez(kr) * diag * 1.05, sc, kr); }
  }
  WARP_BY_EPOCH.push(drawWarpJapan);
  EI_DRAW.push((g, W, H, t) => {                        // заставка епохи: сонце сходить над Фудзі, торії, пелюстки, ліхтарі
    const e = Math.min(1, t / 1.8), ez = e * e * (3 - 2 * e), cx = W / 2, hy = H * 0.64, sc = W / 160;
    const sun = g.createRadialGradient(cx, hy - H * 0.2, 2, cx, hy - H * 0.2, H * 0.4); sun.addColorStop(0, 'rgba(255,246,216,0.95)'); sun.addColorStop(0.4, 'rgba(255,208,112,0.5)'); sun.addColorStop(1, 'rgba(255,120,140,0)');
    g.fillStyle = sun; g.fillRect(0, 0, W, H);
    g.fillStyle = '#d3342c'; g.beginPath(); g.arc(cx, hy - H * 0.2 * ez, H * 0.15, 0, 7); g.fill();
    g.fillStyle = '#5a4f98'; g.beginPath(); g.moveTo(cx - W * 0.42, hy); g.lineTo(cx - W * 0.1, hy - H * 0.3 * ez); g.lineTo(cx, hy - H * 0.36 * ez); g.lineTo(cx + W * 0.1, hy - H * 0.3 * ez); g.lineTo(cx + W * 0.42, hy); g.fill();
    g.fillStyle = '#f6f3ff'; g.beginPath(); g.moveTo(cx - W * 0.1, hy - H * 0.3 * ez); g.lineTo(cx, hy - H * 0.36 * ez); g.lineTo(cx + W * 0.1, hy - H * 0.3 * ez); g.lineTo(cx + W * 0.04, hy - H * 0.26 * ez); g.lineTo(cx, hy - H * 0.29 * ez); g.lineTo(cx - W * 0.04, hy - H * 0.26 * ez); g.fill();
    g.fillStyle = '#2a2040'; g.fillRect(0, hy, W, H - hy);
    const tw = W * 0.3, th = H * 0.32, tx = cx - tw / 2, ty = hy - th * ez - 2;
    g.fillStyle = '#2a1a10'; g.fillRect(tx - tw * 0.12, ty, tw * 1.24, th * 0.1); g.fillRect(tx + tw * 0.04, ty + th * 0.28, tw * 0.92, th * 0.07);
    g.fillRect(tx + tw * 0.1, ty + th * 0.1, tw * 0.1, th * 0.9); g.fillRect(tx + tw * 0.8, ty + th * 0.1, tw * 0.1, th * 0.9);
    g.fillStyle = '#d3342c'; g.fillRect(tx - tw * 0.1, ty + 1, tw * 1.2, th * 0.07); g.fillRect(tx + tw * 0.12, ty + th * 0.1, tw * 0.06, th * 0.9); g.fillRect(tx + tw * 0.82, ty + th * 0.1, tw * 0.06, th * 0.9);
    for (let i = 0; i < 28; i++) { const x = ((eiRand(i) + t * 0.03 * (1 + eiRand(i, 3))) % 1) * W, y = ((eiRand(i, 5) + t * 0.07) % 1) * H; g.globalAlpha = 0.85; g.fillStyle = i % 2 ? '#ffc9d4' : '#ef8fa3'; g.fillRect(x, y, Math.max(1, sc * 1.3), Math.max(1, sc * 0.8)); }
    for (let i = 0; i < 6; i++) { const x = W * (0.1 + 0.16 * i) + Math.sin(t * 0.6 + i) * 4 * sc, y = H * 0.75 - ((t * 9 + i * 31) % (H * 0.7)); g.globalAlpha = 0.9; g.fillStyle = '#ff9a3a'; g.fillRect(x - 2 * sc, y - 3 * sc, 4 * sc, 6 * sc); g.fillStyle = '#ffe9a0'; g.fillRect(x - sc, y - sc, 2 * sc, 3 * sc); }
    g.globalAlpha = 1;
  });
  SPRITES.npc_crt8 = { canvas: makeCreatureCanvas(8) };

  /* ---------- місце гостя: чайний будиночок Сори ---------- */
  STANDS.sora = {
    w: 58, h: 52, draw(g, x, y, t) {
      const rr = Math.round, rc = (a, b, w2, h2, c) => R(g, rr(a), rr(b), rr(w2), rr(h2), c);
      g.globalAlpha = 0.22; rc(x - 30, y, 60, 2, 'd'); g.globalAlpha = 1;
      rc(x - 24, y - 4, 48, 4, '#6e3620'); rc(x - 24, y - 4, 48, 1, '#a46a34');                                  // помост
      rc(x - 22, y - 30, 3, 26, '#4e2414'); rc(x + 19, y - 30, 3, 26, '#4e2414');                               // стовпи
      rc(x - 22, y - 30, 1, 26, '#a46a34'); rc(x + 19, y - 30, 1, 26, '#a46a34');
      for (let i = 0; i < 8; i++) { const ins = (7 - i) * 1.4, lx = x - 29 + ins, rw = 58 - 2 * ins; rc(lx, y - 46 + i, rw, 1, i % 2 ? '#41605c' : '#27393a'); if (i % 2) for (let k = lx + 2; k < lx + rw - 2; k += 5) rc(k, y - 46 + i, 1, 1, '#6b8d85'); }
      rc(x - 30, y - 38, 60, 1, '#15221f'); rc(x - 5, y - 49, 10, 3, '#e8b030');
      const sw = Math.round(Math.sin(t * 1.4) * 1);                                                              // норен: коливається
      [0, 1, 2, 3].forEach(i => { rc(x - 17 + i * 9 + (i % 2 ? sw : 0), y - 36, 8, 12, i % 2 ? '#f4ece0' : '#1c3a78'); rc(x - 17 + i * 9 + (i % 2 ? sw : 0), y - 25, 8, 1, '#2a1a10'); });
      rc(x - 15, y - 14, 30, 8, '#8f4a2c'); rc(x - 15, y - 14, 30, 1, '#c8864a');                               // прилавок
      rc(x - 6, y - 18, 8, 4, '#f4ece0'); rc(x - 7, y - 20, 4, 3, '#f4ece0'); rc(x + 2, y - 19, 2, 1, '#f4ece0'); rc(x - 2, y - 21, 3, 1, '#d3342c');   // чайник
      rc(x + 6, y - 17, 3, 3, '#ffffff'); rc(x + 10, y - 17, 3, 3, '#ffffff'); rc(x + 7, y - 16, 1, 1, '#4f9a3a'); rc(x + 11, y - 16, 1, 1, '#4f9a3a');    // чашки
      for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; g.globalAlpha = (1 - ph) * 0.7; rc(x - 3 + Math.sin(t * 2 + i) * 1.5, y - 24 - ph * 10, 1, 2, '#ffffff'); }
      g.globalAlpha = 1;
      [[-26, '#d3342c'], [26, '#e8503a']].forEach(([dx, c], i) => {                                           // ліхтарі: ледь розгойдуються
        const lx = x + dx + Math.sin(t * 1.2 + i) * 1.5, ly = y - 30;
        rc(lx - 1, ly - 3, 2, 3, '#2a1a10'); rc(lx - 3, ly, 7, 9, '#2a1a10'); rc(lx - 2, ly + 1, 5, 7, c); rc(lx - 2, ly + 1, 2, 7, '#ff8a70'); rc(lx - 1, ly + 3, 3, 3, '#ffe08a');
        g.globalAlpha = 0.12 + 0.04 * Math.sin(t * 3 + i); rc(lx - 6, ly - 2, 13, 13, '#ffd45c'); g.globalAlpha = 1;
      });
      rc(x + 22, y - 9, 8, 2, '#a46a34'); rc(x + 23, y - 7, 1, 3, '#4e2414'); rc(x + 28, y - 7, 1, 3, '#4e2414');       // лавка
    }
  };
})();
