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
  let neonSigns = [], neonOwner = null, neonLayer = null;      // неонові вивіски будинків: уночі світяться окремим шаром (скидається разом із houseGlass)

  /* ---------- небо: багато відтінків градієнта з дізерингом (не кулі кольорів, а плавний захід) ---------- */
  let fujiC = null, fujiT = null, fujiKey = '';
  function fujiDims() { const avail = LAYOUT.horizonY - (8 - view.offY), H = Math.round(Math.max(315, Math.min(560, avail - 40 - 70 / Math.max(0.3, sceneUnit)))); return { H, hw: Math.round(600 + (H - 315) * 1.2) }; }      // Фудзі росте, поки на екрані є місце над горизонтом (телефон-горизонт лишається як був)
  function roofTopY() { return (typeof shop !== 'undefined' && shop) ? shop.y - (shop.level >= 6 && clockReady() ? CLOCK_H : 0) : LAYOUT.horizonY - MAX_HOUSE_H; }      // найвища точка ТЦ (з годинниковою вежею)
  function skySpan(top) { return Math.max(60, Math.min(LAYOUT.horizonY - MAX_HOUSE_H - 6, roofTopY() - 24) - top - 24); }      // дракон літає лише в небі над ТЦ
  const fujiOcCache = {};
  function buildSky() {
    const { c, g } = newLayer();
    const x0 = -view.offX, W = view.w, top = -view.offY, hor = LAYOUT.horizonY + 10;
    const stops = [[0, '#18356e'], [0.16, '#2a5aa8'], [0.34, '#4f8fd8'], [0.5, '#8fc4ec'], [0.64, '#cfe2f4'], [0.76, '#ffd9e2'], [0.88, '#ffc0c8'], [1, '#ffd8a0']];
    const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const at = f => { let i = 0; while (i < stops.length - 2 && f > stops[i + 1][0]) i++; const a = stops[i], b = stops[i + 1], t2 = Math.max(0, Math.min(1, (f - a[0]) / (b[0] - a[0]))), A1 = rgb(a[1]), B1 = rgb(b[1]); return A1.map((v, k) => v + (B1[k] - v) * t2); };
    const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], rows = hor - top;
    const img = g.createImageData(W, Math.max(1, rows)), px = img.data;                    // пікселі напряму (fillRect на піксель — сотні мілісекунд при подорожі)
    for (let y = top; y < hor; y++) {
      const f = (y - top) / rows, col = at(f), lv = 8;
      let o = (y - top) * W * 4;
      for (let xi = 0; xi < W; xi++, o += 4) {
        const th = bayer[y & 3][xi & 3] / 16;
        for (let ch = 0; ch < 3; ch++) { const q = col[ch] / lv, fl = Math.floor(q); px[o + ch] = Math.min(255, Math.round((q - fl > th ? fl + 1 : fl) * lv)); }
        px[o + 3] = 255;
      }
    }
    g.putImageData(img, x0 + view.offX, top + view.offY);
    { const L2 = newLayer(); const FD = fujiDims(); fuji(L2.g, x0 + Math.round(W * 0.5), LAYOUT.horizonY, FD.H, FD.hw); fujiC = L2.c; fujiKey = ''; }       // Фудзі окремим шаром: малюється ПІСЛЯ сонця й місяця (вони сходять з-за гори)
    for (let k = 0; k < 14; k++) { g.globalAlpha = 0.012 * (14 - k) * 2; R(g, x0, hor - 28 + k * 2, W, 2, 'W'); }
    g.globalAlpha = 1;
    for (let i = 0; i < 9; i++) { const hs = hash2(i * 31, 9), cx = x0 + (hs % W), cy = top + rows * (0.4 + (hs >>> 8) % 40 / 100), ww = 40 + hs % 70; g.globalAlpha = 0.22; R(g, cx, cy, ww, 2, '#ffffff'); R(g, cx + 8, cy + 2, ww - 16, 1, '#ffd0d8'); g.globalAlpha = 1; }
    return c;
  }

  /* ---------- далекий вид, сакура, кущі ---------- */
  const fjTri = x => Math.abs((((x % 2) + 2) % 2) - 1);
  function fjCloud(g, x, y, w, h, pink) {                      // чітка піксельна хмара: плоскі тони й контур на сітці 2×2
    const lumps = [[0.2, 0.62, 0.2], [0.42, 0.42, 0.26], [0.68, 0.56, 0.24], [0.86, 0.68, 0.16], [0.5, 0.72, 0.34]];
    const ins = (px, py) => lumps.some(l => ((px + 1 - l[0] * w) ** 2 + ((py + 1 - l[1] * h) * 1.7) ** 2) < (l[2] * w) ** 2 && py + 1 < h * 0.92);
    for (let py = 0; py < h; py += 2) for (let px = 0; px < w; px += 2) {
      if (!ins(px, py)) continue;
      let c = py < h * 0.42 ? (pink ? '#fff1ee' : '#ffffff') : py < h * 0.66 ? (pink ? '#ffd9d6' : '#e3e9ff') : (pink ? '#e9b9c8' : '#bccaf3');
      if (!(ins(px - 2, py) && ins(px + 2, py) && ins(px, py - 2) && ins(px, py + 2))) c = pink ? '#c98fa8' : '#8f9ed8';
      g.fillStyle = c; g.fillRect(x + px, y + py, 2, 2);
    }
  }
  function fjSun(g, cx, cy, r) {                               // червоне сонце за вершиною: два кільця сяйва ступінчасто, диск, відблиск
    const disc2 = (rr, c, a) => { g.globalAlpha = a; g.fillStyle = c; for (let y = -rr; y <= rr; y += 2) { const hw2 = Math.floor(Math.sqrt(rr * rr - y * y) / 2) * 2; if (hw2 > 0) g.fillRect(cx - hw2, cy + y, hw2 * 2, 2); } g.globalAlpha = 1; };
    disc2(Math.round(r * 2.1), '#ffe2dc', 0.35); disc2(Math.round(r * 1.6), '#ffc4c0', 0.45); disc2(r, '#e8453c', 1);
    g.fillStyle = '#ff7a64'; for (let y = -r + 2; y <= -r * 0.2; y += 2) for (let x = -r * 0.7; x <= -r * 0.1; x += 2) if (x * x + y * y < (r - 3) * (r - 3)) g.fillRect(cx + Math.round(x / 2) * 2, cy + y, 2, 2);
  }
  function fuji(g, cx, bY, H, hw) {                            // Фудзі: чіткі плоскі тони (4 скелі + 4 снігу), зубчастий сніг, яри, кант силуету, ступінчастий серпанок; червоне сонце й хмари; пікселі 2×2
    const heightAt = dx => H * Math.pow(Math.max(0, 1 - Math.abs(dx) / hw), 1.3);      // гостра вершина
    const snowEndAt = dx => { const streak = Math.pow(Math.max(0, Math.sin(dx * 0.11 + 1)), 6) * 22 + Math.pow(Math.max(0, Math.sin(dx * 0.061 + 2.3)), 8) * 28; return bY - H * 0.68 + 9 * fjTri(dx / 15) + 5 * fjTri(dx / 5.5 + 0.4) + streak * (Math.abs(dx) / hw < 0.1 ? 1 : 0.45); };
    const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const lerp = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
    const RL = hex('#c2c8fb'), RS = hex('#454b90'), SL = hex('#ffffff'), SS = hex('#8fa1e6'), HZ = hex('#d0d4f8'), OT = hex('#2c2b66');
    const ROCK = [0, 0.34, 0.68, 1].map(t => lerp(RS, RL, t)), SNOW = [SS, lerp(SS, SL, 0.5), lerp(SS, SL, 0.82), SL];
    const s = hw / 300;                                        // сонце й хмари намальовані для hw = 300: масштабуємо
    const W = hw * 2 + 8, Hc = Math.ceil(H / 2) * 2 + 2, y0 = bY - Hc, x0 = cx - hw - 4;
    const fk = hw + '|' + H;
    let oc = fujiOcCache[fk];                                  // Фудзі однакова на всіх розмірах екрана з тим самим hw/H: кеш (~30 мс при подорожі)
    if (!oc) {
      oc = document.createElement('canvas'); oc.width = W; oc.height = Hc;
      const ox = oc.getContext('2d'), im = ox.createImageData(W, Hc), d = im.data;
      const inside = (px, py) => { if (px < 0 || py < 0 || px >= W || py >= Hc) return false; const dx = px + 1 - hw - 4, hgt = bY - (y0 + py + 1); return hgt >= 0 && hgt <= heightAt(dx); };
      for (let px = 0; px < W; px += 2) {
        const dx = px + 1 - hw - 4, hh = heightAt(dx);
        if (hh < 1) continue;
        const sE = Math.round(snowEndAt(dx) / 2) * 2;
        for (let py = 0; py < Hc; py += 2) {
          if (!inside(px, py)) continue;
          const y = y0 + py + 1, hgt = bY - y, u = dx / (y - (bY - H) + 46);
          const ridge = Math.sin(u * 15 + 0.9 * Math.sin(u * 4.3 + 1)) * 0.6 + Math.sin(u * 38 + 2) * 0.25 + Math.sin(u * 7 + 0.4) * 0.4;
          const nxe = Math.max(-1, Math.min(1, dx / (hw * 0.75) + 0.26 * ridge));
          let I = Math.max(0, Math.min(1, 0.5 - 0.46 * nxe + 0.1 * (hgt / H))); I = I * I * (3 - 2 * I) * 0.85 + I * 0.15;
          let L = Math.min(3, Math.floor(I * 4));
          const gul = Math.sin(u * 21 + 1.3 * Math.sin(u * 5 + 0.5)); if (gul > 0.9 && hgt > 12) L = Math.max(0, L - 2);
          let c = y <= sE ? SNOW[L] : ROCK[L];
          const hz = hgt < 10 ? 0.62 : hgt < 22 ? 0.4 : hgt < 36 ? 0.2 : 0; if (hz) c = lerp(c, HZ, hz);
          if (!(inside(px - 2, py) && inside(px + 2, py) && inside(px, py - 2) && inside(px, py + 2))) c = OT;
          else if (!inside(px - 4, py - 2) && dx < 0) c = lerp(c, SL, 0.55);
          for (let qy = 0; qy < 2; qy++) for (let qx = 0; qx < 2; qx++) { if (px + qx >= W) continue; const o = ((py + qy) * W + px + qx) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; }
        }
      }
      ox.putImageData(im, 0, 0);
      fujiOcCache[fk] = oc;
    }
    g.drawImage(oc, x0, y0);
  }
  function farSkyline(g, x0, W) {                       // гора Фудзі, телевежа, пагода, високі будинки
    const base = 112;
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
    if (neonOwner !== houseGlass) { neonOwner = houseGlass; neonSigns = []; neonLayer = null; }
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
    if (hasK) { P(g, sx + 6, sy - 6, 2, 5, DKW); P(g, sx - 2, sy - 6, 18, 1, DKW); neonBox(g, sx, sy, 14, sh, kb[0]); neonText(g, (dx, dy, col) => vtext(g, word, sx + 2 + dx, sy + 3 + dy, col, 11, true), kb[0]);
      neonSigns.push({ x: sx, y: sy, w: 14, h: sh, c: kb[0], draw: g2 => { neonBox(g2, sx, sy, 14, sh, kb[0]); neonText(g2, (dx, dy, col) => vtext(g2, word, sx + 2 + dx, sy + 3 + dy, col, 11, true), kb[0]); } }); }
    P(g, gx - 2, gy - 3, gw + 4, 2, TILE[1]); P(g, gx - 2, gy - 3, gw + 4, 1, TILE[2]); P(g, gx - 3, gy - 4, 1, 2, TILE[1]); P(g, gx + gw + 2, gy - 4, 1, 2, TILE[1]);   // тонкий навіс над вивіскою (нижче вікон верхнього поверху)
    neonBox(g, gx, gy, gw, 14, kh[0]); neonText(g, (dx, dy, col) => text(g, wh, gx + 3 + dx, gy + 1 + ((11 - gsz) >> 1) + dy, col, gsz, true), kh[0]);
    neonSigns.push({ x: gx, y: gy, w: gw, h: 14, c: kh[0], draw: g2 => { neonBox(g2, gx, gy, gw, 14, kh[0]); neonText(g2, (dx, dy, col) => text(g2, wh, gx + 3 + dx, gy + 1 + ((11 - gsz) >> 1) + dy, col, gsz, true), kh[0]); } });
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
  const headCache = {};
  function headSprite(s, sleep) {                       // голова дракона (дивиться ліворуч); s — масштаб (1 — звичайний), sleep — заплющені очі
    s = s || 1; const key = s + (sleep ? 's' : ''); if (headCache[key]) return headCache[key];
    const c = cvs(Math.ceil(58 * s), Math.ceil(44 * s)), g = c.getContext('2d');
    const Rr = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x * s), Math.round(y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); };
    [[40, 12, 5, 8], [34, 6, 4, 7], [28, 10, 4, 6], [44, 20, 4, 6], [38, 26, 3, 5]].forEach(([x, y, a, b], i) => shadeEllipse(g, x * s, y * s, a * s, b * s, i % 2 ? '#ff7a30' : '#e8503a'));
    const h2 = Math.max(2, Math.round(2 * s)), h1 = Math.max(1, Math.round(s));
    const horn = (x, y) => { const n = Math.round(12 * s); for (let i = 0; i < n; i++) { const u = i / s, px = (x + u * 1.2) * s, py = (y - Math.sin(u / 11 * Math.PI * 0.8) * 7 + u * 0.5) * s, w = Math.max(1, Math.round(Math.max(1, 3 - u * 0.2) * s)); g.fillStyle = u < 3 ? '#fff2b0' : '#ffd24a'; g.fillRect(Math.round(px), Math.round(py), w, h2); g.fillStyle = '#a07818'; g.fillRect(Math.round(px), Math.round(py) + h2, w, h1); } };
    horn(30, 11); horn(22, 9);
    shadeEllipse(g, 30 * s, 22 * s, 13 * s, 11 * s, '#2fbf86'); shadeEllipse(g, 14 * s, 25 * s, 12 * s, 6 * s, '#2fbf86'); shadeEllipse(g, 15 * s, 31 * s, 10 * s, 3 * s, '#f0d890'); shadeEllipse(g, 5 * s, 23 * s, 4 * s, 3 * s, '#5fe0a8');
    [[6, 28], [10, 29], [15, 29]].forEach(([x, y]) => Rr(x, y, 1, 2, '#ffffff'));
    Rr(3, 22, 2, 2, '#12301f');
    if (sleep) { Rr(22, 17, 6, 5, '#2fbf86'); Rr(22, 19, 6, 1, '#12301f'); Rr(22, 20, 1, 1, '#12301f'); Rr(27, 20, 1, 1, '#12301f'); Rr(24, 21, 3, 1, '#5fe0a8'); }       // заплющене око: рисочка з віями
    else { Rr(22, 17, 6, 5, '#ffffff'); Rr(23, 18, 4, 4, '#e8503a'); Rr(24, 18, 2, 3, '#1a1a1a'); Rr(24, 18, 1, 1, '#ffffff'); }
    Rr(21, 15, 8, 2, '#12301f'); Rr(20, 16, 2, 2, '#12301f');
    Rr(34, 26, 3, 5, '#e8503a'); Rr(36, 29, 2, 3, '#e8503a');
    const sil = cvs(c.width, c.height), sgc = sil.getContext('2d'); sgc.drawImage(c, 0, 0); sgc.globalCompositeOperation = 'source-in'; sgc.fillStyle = '#143d2e'; sgc.fillRect(0, 0, sil.width, sil.height);
    const oc = cvs(c.width + 2, c.height + 2), og = oc.getContext('2d'); [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(([dx, dy]) => og.drawImage(sil, dx, dy)); og.drawImage(c, 1, 1);       // 1px темний контур голови
    return (headCache[key] = oc);
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
  function dragonDraw(g, t, pos, night, o) {            // pos(tt) → [x, y, ззаду?] голови в момент tt; однаковий для неба й будівництва. o: k — масштаб, headX — поворот голови (-1…1), tilt — нахил морди донизу, sleep, from — час, з якого береться тіло, коли дракон стоїть, wob — хвиля тіла, hbob — дихання голови, noFire, clip — обрізка «лише над горою» для частин за Фудзі
    o = o || {}; const kk = o.k || 1, S = n => Math.max(1, Math.round(n * kk)), N = 30, SP = 7.4 * kk, pts = [], dt = 0.04, h0 = pos(t), wob = (o.wob != null ? o.wob : 3) * kk;
    pts.push([h0[0], h0[1] + (o.hbob || 0), h0[2]]);
    let tt = o.from != null ? o.from : t, prev = o.from != null ? pos(tt) : h0, acc = 0;
    for (let it = 0; it < 4000 && pts.length < N; it++) {
      tt -= dt; const p = pos(tt); acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p;
      if (acc >= SP) { acc = 0; pts.push([p[0], p[1] + Math.sin(t * (o.sleep ? 1.1 : 2.2) - pts.length * 0.5) * wob, p[2]]); }
    }
    while (pts.length < N) pts.push(pts[pts.length - 1]);
    const back = pos(t - 0.15), hv = [pts[0][0] - back[0], pts[0][1] - back[1]], faceL = o.headX != null ? o.headX < 0 : hv[0] < 0;
    const bodyR = i => Math.max(3, Math.round((11 - i * 0.27) * kk));
    const isBk = pt => !!(pt[2] && o.clip);             // частина тіла за горою: малюється лише там, де її не закриває Фудзі
    const [tx, ty] = pts[N - 1], OUT = '#143d2e';
    const body = bk => {
      if (isBk(pts[N - 1]) === bk) for (let k = 0; k < 6; k++) P(g, tx + (faceL ? 3 : -5) * kk + (faceL ? k : -k) * 2 * kk, ty - 2 * kk + Math.round(Math.sin(t * 3 + k) * 2), S(3), S(2), k % 2 ? '#e8503a' : '#ffd24a');
      for (let i = N - 1; i >= 1; i--) if (isBk(pts[i]) === bk) D(g, Math.round(pts[i][0]), Math.round(pts[i][1]), bodyR(i) + 1, OUT);        // чіткий темний контур усього силуету
      for (let i = N - 1; i >= 1; i--) {
        if (isBk(pts[i]) !== bk) continue;
        const [x, y] = pts[i], r = bodyR(i);
        if (i % 2 === 0 && i < N - 5) { const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], n = Math.hypot(dx, dy) || 1, sx = x + (dy / n) * (r + 1), sy = y + (-dx / n) * (r + 1); P(g, Math.round(sx) - S(1), Math.round(sy) - S(2), S(3), S(4), '#e8503a'); P(g, Math.round(sx), Math.round(sy) - S(4), S(1), S(2), '#ffd24a'); P(g, Math.round(sx) - S(1), Math.round(sy) - S(2), S(1), S(4), '#ff9a80'); }
        g.drawImage(ball(r, i % 2 ? '#2fbf86' : '#38c88e'), Math.round(x - r - 2), Math.round(y - r - 2));
        if (i > 1) { const rb = Math.max(1, Math.round(r * 0.55)); g.drawImage(ball(rb, '#f4e4a0'), Math.round(x - rb - 2), Math.round(y + r * 0.45 - rb - 2)); }
      }
      [6, 12, 19].forEach(li => { if (isBk(pts[li]) !== bk) return; const [x, y] = pts[li], r = bodyR(li); P(g, x - S(1), y + r - S(1), S(3), S(6), '#1c7a58'); P(g, x - S(1), y + r - S(1), S(1), S(6), '#5fe0a8'); P(g, x - S(3), y + r + S(5), S(7), S(2), '#2fbf86'); [-2, 0, 2].forEach(d => P(g, x + d * kk, y + r + S(7), S(1), S(2), '#ffd24a')); });
    };
    if (o.clip && pts.some(isBk)) { g.save(); o.clip(g); body(true); g.restore(); }
    body(false);
    const [hx, hy] = pts[0], hs = headSprite(kk, o.sleep), ang = o.tilt != null ? -o.tilt : Math.max(-0.7, Math.min(0.7, Math.atan2(hv[1], Math.abs(hv[0]) + 0.001))) * (faceL ? 1 : -1) * -1;
    const hh = isBk(pts[0]); if (hh) { g.save(); o.clip(g); }
    g.save(); g.translate(Math.round(hx), Math.round(hy));
    const sxh = o.headX != null ? Math.max(0.12, Math.abs(o.headX)) : 1; g.scale((faceL ? 1 : -1) * sxh, 1); g.imageSmoothingEnabled = false;
    g.rotate(Math.round((o.tilt != null ? ang : (faceL ? ang : -ang)) * 6) / 6); if (!o.noFire && kk === 1) breathFire(g, t, night); g.drawImage(hs, Math.round(-30 * kk) - 1, Math.round(-22 * kk) - 1); g.restore();
    const dir = faceL ? -1 : 1;
    for (let k = 0; k < 14; k++) { const wx = hx + dir * (14 + k * 2) * kk, wy = hy + 6 * kk + Math.round(Math.sin(t * 3 + k * 0.5) * 3) + k * 0.4 * kk; P(g, wx, wy, S(2), S(1), '#ffd24a'); P(g, wx, wy - 7 * kk - Math.round(Math.sin(t * 3 + k * 0.4) * 2), S(2), S(1), '#ffe08a'); }
    const px = hx + dir * 36 * kk, py = hy + 8 * kk + Math.sin(t * 2) * 2, pr = Math.max(3, Math.round(3 * kk)); g.globalAlpha = 0.25 * GA; D(g, Math.round(px), Math.round(py), 7 * kk, '#fff2b0'); g.globalAlpha = GA; g.drawImage(ball(pr, '#ffffff'), Math.round(px - pr - 2), Math.round(py - pr - 2));
    if (hh) g.restore();
    return { x: hx, y: hy, faceL };
  }

  /* ---------- нічний дракон: щоразу, коли сонце сідає, летить до Фудзі, зупиняється, озирається, каже репліку, лягає спати на гору й хропе до ранку.
     Три маршрути (нічна черга): ліворуч, праворуч і над вершиною. Усе залежить лише від фази доби (state.dayPhase) — тому однаково працює й при перемотуванні ---------- */
  const DSEQ = { p0: 0.73, p1: 0.205, K: 1.75, KR: 1.5, wake: 10 };      // початок вечора (фаза), ранок, масштаб великого дракона, секунд на відліт уранці
  const DSEQ_TXT = {
    uk: [['Ох… я так втомився. Хочу відпочити.', 'Той японський чай… очі самі закриваються.', 'Фудзі, пусти на подушку. Хр-р…'],
         ['Шостий чайник за вечір. Усе, я здався.', 'Фудзі, посунься! Я тільки на хвилинку.', 'Спокійної ночі, Капі. Хр-р…'],
         ['Цілий день над дахами. Крила не тримають.', 'Гора м’яка, як ковдра. Лягаю.', 'Тільки не будіть… Zzz']],
    en: [['Ugh… I’m so tired. I need a rest.', 'That Japanese tea… my eyes close by themselves.', 'Fuji, lend me a pillow. Zzz…'],
         ['Sixth teapot tonight. I give up.', 'Fuji, scoot over! Just for a minute.', 'Good night, Capy. Zzz…'],
         ['All day over the roofs. My wings give up.', 'This mountain is soft as a blanket. Lying down.', 'Don’t wake me… Zzz']],
    es: [['Uf… estoy agotado. Quiero descansar.', 'Ese té japonés… los ojos se cierran solos.', 'Fuji, déjame tu almohada. Zzz…'],
         ['La sexta tetera de la noche. Me rindo.', '¡Fuji, hazme sitio! Solo un minuto.', 'Buenas noches, Capy. Zzz…'],
         ['Todo el día sobre los tejados. Las alas no dan más.', 'Esta montaña es suave como una manta. Me tumbo.', 'No me despiertes… Zzz']],
    it: [['Uff… sono stanchissimo. Voglio riposare.', 'Quel tè giapponese… gli occhi si chiudono da soli.', 'Fuji, prestami il cuscino. Zzz…'],
         ['Sesta teiera stasera. Mi arrendo.', 'Fuji, fai posto! Solo un minuto.', 'Buonanotte, Capy. Zzz…'],
         ['Tutto il giorno sopra i tetti. Le ali non reggono.', 'Questa montagna è morbida come una coperta. Mi sdraio.', 'Non svegliarmi… Zzz']],
    pl: [['Uff… jestem tak zmęczony. Chcę odpocząć.', 'Ta japońska herbata… oczy same się zamykają.', 'Fuji, daj poduszkę. Zzz…'],
         ['Szósty czajnik dziś. Poddaję się.', 'Fuji, przesuń się! Tylko na chwilę.', 'Dobranoc, Capy. Zzz…'],
         ['Cały dzień nad dachami. Skrzydła nie niosą.', 'Ta góra jest miękka jak koc. Kładę się.', 'Nie budź mnie… Zzz']],
    pt: [['Ufa… estou exausto. Quero descansar.', 'Aquele chá japonês… os olhos fecham sozinhos.', 'Fuji, empresta o travesseiro. Zzz…'],
         ['Sexto bule desta noite. Desisto.', 'Fuji, chega para lá! Só um minutinho.', 'Boa noite, Capy. Zzz…'],
         ['O dia todo sobre os telhados. As asas não aguentam.', 'Esta montanha é macia como um cobertor. Deito.', 'Não me acorde… Zzz']]
  };
  let dseq = null, dseqN = Math.floor(Math.random() * 3), dseqWas = false;
  const smooth01 = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
  function hermPath(kn) {                               // кноти {s,x,y,stop?,vx?,vy?} → s ↦ [x, y]; швидкості за Катмулом–Ромом, у зупинках нуль
    const n = kn.length;
    kn.forEach((k, i) => {
      if (k.stop) { k.vx = 0; k.vy = 0; }
      else if (k.vx == null) { const a = kn[Math.max(0, i - 1)], b = kn[Math.min(n - 1, i + 1)], d = Math.max(0.01, b.s - a.s); k.vx = (b.x - a.x) / d; k.vy = (b.y - a.y) / d; }
    });
    return s => {
      if (s <= kn[0].s) return [kn[0].x, kn[0].y];
      if (s >= kn[n - 1].s) return [kn[n - 1].x, kn[n - 1].y];
      let i = 0; while (i < n - 2 && s > kn[i + 1].s) i++;
      const a = kn[i], b = kn[i + 1], d = b.s - a.s, u = (s - a.s) / d, u2 = u * u, u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
      return [h00 * a.x + h10 * d * a.vx + h01 * b.x + h11 * d * b.vx, h00 * a.y + h10 * d * a.vy + h01 * b.y + h11 * d * b.vy];
    };
  }
  function dseqGeo(wl, wr, top, span) {                 // та сама Фудзі, що в buildSky: центр, основа, вершина
    const { H, hw } = fujiDims(), cx = -view.offX + Math.round(view.w * 0.5), bY = LAYOUT.horizonY;
    return { H, hw, kS: Math.max(0.6, Math.min(1, (bY - top - 250) / 150)), cx, bY, top, wl, wr, span, ex: Math.max(150, Math.min(300, (visR() - visL()) / 2 - 10)), sy: bY - H * 0.985, surf: dx => bY - H * Math.pow(Math.max(0, 1 - Math.abs(dx) / hw), 1.3) };
  }
  function dseqBuild(route, G, T0) {                    // будує політ: підліт → зупинка (3 фіксовані точки неба) → розворот → спуск на гору → сон → відліт уранці
    const { cx, top, surf, ex } = G, room = Math.max(60, G.sy - (top + 36));
    const normal = tt => dragonPath(tt, G.wl, G.wr, G.top + 12, G.span);
    const st = normal(T0), st2 = normal(T0 + 0.05), st1 = normal(T0 - 0.05);
    const kn = [{ s: 0, x: st[0], y: st[1], vx: (st2[0] - st1[0]) / 0.1, vy: (st2[1] - st1[1]) / 0.1 }];
    const sg = route === 1 ? 1 : -1;                    // бік, на якому дракон ляже (маршрут 0 — ліворуч, 1 — праворуч; 2 — через вершину)
    const ox = Math.min(170, ex * 0.62), PT = [[cx - ox, Math.max(top + 34, G.sy - Math.min(130, room * 0.55))], [cx + ox, Math.max(top + 34, G.sy - Math.min(95, room * 0.4))], [cx + 10, Math.max(top + 30, G.sy - Math.min(170, room * 0.85))]][route];   // ТРИ ТОЧКИ НЕБА, де дракон зупиняється й дивиться на Фудзі
    const W1 = route === 2 ? [cx + ex * 1.1, PT[1] + 14] : [cx - sg * ex * 0.9, PT[1] + 10], dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const dirA = PT[0] < W1[0] ? -1 : 1;                // у якому напрямку дракон підлітає (потім обертається до гори)
    const d1 = Math.max(7, dist(st, W1) / 60 + 2), d2 = Math.max(5, dist(W1, PT) / 45);
    const ux = (PT[0] - W1[0]) / Math.max(1, dist(W1, PT)), uy = (PT[1] - W1[1]) / Math.max(1, dist(W1, PT));
    kn.push({ s: d1, x: W1[0], y: W1[1], vx: ux * 55, vy: uy * 55 });
    const sP = d1 + d2; kn.push({ s: sP, x: PT[0], y: PT[1], stop: true });
    const leave = sP + 5.4; kn.push({ s: leave, x: PT[0], y: PT[1], stop: true });
    const faceRest = sg, tlRest = 0.28;                 // дракон лягає, обвивши Фудзі спіраллю, як змія дерево: спершу заходить за гору (ззаду її не видно), потім виринає спереду
    const depthCap = Math.max(18, ((typeof shop !== 'undefined' && shop) ? shop.y : G.sy + 90) - G.sy - 70), phone = landscapePhoneMQ.matches || mobileMQ.matches, pitch = phone ? 12 : 22, ryC = 12, H0 = G.H * 0.985;      // на телефоні виток тісніший, а сон піднято над дахом ТЦ (нижче)
    const th0 = [Math.PI, Math.PI, Math.PI * 1.5][route], thEnd = Math.PI * 4.5, thC = Math.PI * 2.5;      // орбіта від точки зупинки до thC, далі обвиває верхівку (1 виток) і лягає спереду
    const rxBig = Math.min(ex * 0.62, 150),  ryBig = 28, itop = (typeof bubbleBounds === 'function') ? bubbleBounds().it + 80 : top + 80, cyO = route === 2 ? Math.max(itop + ryBig, G.sy - 46) : Math.max(itop, G.sy - 42);      // голова не лізе під верхню панель: над нею ще місце для репліки          // великий овал навколо гори: центр на висоті точки зупинки
    const roofY = roofTopY(), depth0 = Math.max(3, Math.min(G.H * 0.3, roofY - 36 - G.sy - pitch - ryC));      // дракон лягає на схил (приблизно на 30% висоти від вершини), але не нижче даху ТЦ
    const headY = G.sy + depth0 + pitch + ryC, lift = Math.max(0, Math.min(headY - (roofY - 36), headY - (G.top + 70)));      // голова сплячого дракона не нижче ніж на 36 від даху ТЦ (чи вежі з годинником)
    const depF = th => depth0 + Math.max(0, th - thC) / (2 * Math.PI) * pitch;
    const rxCone = th => Math.min(Math.max(70, ex * 0.7), G.hw * (1 - Math.pow(Math.max(0.05, (H0 - depF(th)) / G.H), 1 / 1.3)) + 12);         // півширина гори на тій висоті + товщина тіла
    const wOf = th => smooth01((th - th0) / (thC - th0));
    const hxf = th => { const w = wOf(th); return cx - sg * (rxBig + (rxCone(th) - rxBig) * w) * Math.cos(th); };
    const hyf = th => { const w = wOf(th), cy = cyO + (G.sy + depF(th) - lift - cyO) * w, ry = ryBig + (ryC - ryBig) * w; return cy + ry * Math.sin(th); };
    PT[0] = hxf(th0); PT[1] = hyf(th0);                       // зупинка — це початок орбіти
    kn[kn.length - 2].x = PT[0]; kn[kn.length - 2].y = PT[1]; kn[kn.length - 1].x = PT[0]; kn[kn.length - 1].y = PT[1];
    const nH = Math.round((thEnd - th0) / (Math.PI / 6)); let sc = leave, prevP = [PT[0], PT[1]];
    for (let i = 0; i <= nH; i++) { const th = th0 + (thEnd - th0) * i / nH, x = hxf(th), y = hyf(th); sc += Math.max(0.5, Math.hypot(x - prevP[0], y - prevP[1]) / (i > nH - 4 ? 40 : 78)); prevP = [x, y]; kn.push({ s: sc, x, y, th, stop: i === nH }); }
    const hk = kn.filter(k => k.th != null);
    const thAt = ss => { if (ss < hk[0].s - 0.01 || ss > hk[hk.length - 1].s) return null; let i = 0; while (i < hk.length - 2 && ss > hk[i + 1].s) i++; const a = hk[i], b = hk[i + 1]; return a.th + (b.th - a.th) * Math.max(0, Math.min(1, (ss - a.s) / Math.max(1e-6, b.s - a.s))); };
    const back = ss => { const th = thAt(ss); return th != null && Math.sin(th) < -0.02 ? 1 : 0; };     // 1 — тіло за горою
    const sR = kn[kn.length - 1].s, R = kn[kn.length - 1];
    const p1 = ((DSEQ.p1 - DSEQ.p0 + 1) % 1) * CONFIG.DAY_SECONDS, sWake = Math.max(sR + 6, p1);
    kn.push({ s: sWake, x: R.x, y: R.y, stop: true });
    const fin = normal(T0 + sWake + DSEQ.wake), f2 = normal(T0 + sWake + DSEQ.wake + 0.05), f1 = normal(T0 + sWake + DSEQ.wake - 0.05);
    kn.push({ s: sWake + 5.5, x: R.x - faceRest * 40, y: R.y - 120 });
    kn.push({ s: sWake + DSEQ.wake, x: fin[0], y: fin[1], vx: (f2[0] - f1[0]) / 0.1, vy: (f2[1] - f1[1]) / 0.1 });
    return { route, T0, G, path: hermPath(kn), back, normal, sP, leave, sR, sWake, end: sWake + DSEQ.wake, dirA, faceRest, tlRest, tlPause: route === 2 ? 0.55 : 0.12, hx: dirA, lastT: null, f: [0, 0, 0], head: null, key: [cx, G.bY, G.top, G.span, G.wl, G.wr].join('|'), says: [sP + 1.4, sP + 4.4, sR + 1.2] };
  }
  function dseqSay(sq, i) {                             // репліка дракона над головою
    const lines = DSEQ_TXT[state.lang] || DSEQ_TXT.en, txt = lines[sq.route][i];
    if (typeof showBubble !== 'function') return;
    const follow = () => { const h = sq.head; if (!h) return null; return { x: h.x, y: h.y - 30 * (sq.kNow || 1), sky: true }; };
    if (!sq.head) return;
    showBubble('dragon', txt, sq.head.x, sq.head.y - 30 * (sq.kNow || 1), follow);
  }
  function dseqUpdate(t, wl, wr, top, span) {            // стан нічного маршруту на цей кадр (або null — дракон літає як удень)
    if (!dayNightOn() || state.settings.noFly || build) { dseq = null; dseqWas = false; return null; }
    const DAY = CONFIG.DAY_SECONDS, s = ((state.dayPhase - DSEQ.p0 + 1) % 1) * DAY;
    const G = dseqGeo(wl, wr, top - 12, span), key = [G.cx, G.bY, G.top, span, wl, wr, G.H].join('|');
    const total = Math.max(((DSEQ.p1 - DSEQ.p0 + 1) % 1) * DAY, 0) + DSEQ.wake;
    if (s >= total) { dseq = null; dseqWas = false; return null; }
    if (!dseqWas) { dseqWas = true; dseq = null; dseqN++; }
    const T0 = t - s;
    if (!dseq || dseq.key !== key || dseq.route !== dseqN % 3) {
      const keep = dseq && dseq.key !== key ? dseq : null;
      dseq = dseqBuild(dseqN % 3, G, T0);
      if (keep) { dseq.hx = keep.hx; dseq.f = keep.f; }
      else if (s >= dseq.sR) dseq.hx = dseq.faceRest;
      dseq.f = keep ? keep.f : [s > dseq.says[0] + 2.5 ? 1 : 0, s > dseq.says[1] + 2.5 ? 1 : 0, s > dseq.says[2] + 2.5 ? 1 : 0];
    }
    const sq = dseq; sq.T0 = T0; sq.s = s;
    const pos = tt => {
      const ss = tt - sq.T0; if (ss < 0 || ss >= sq.end) return sq.normal(tt);
      const p = sq.path(ss); if (ss > sq.sP && ss < sq.leave) return [p[0], p[1] + Math.sin(tt * 1.7) * 2, 0];
      const a = sq.path(ss - 0.06), b = sq.path(ss + 0.06), vx = (b[0] - a[0]) / 0.12, vy = (b[1] - a[1]) / 0.12, sp = Math.hypot(vx, vy), f = Math.min(1, sp / 45), am = 7 * f * (sq.kNow || 1) * (1 - smooth01((ss - sq.sR + 5) / 5)), w = Math.sin(ss * 2.7) * am;      // тіло пливе хвилею, на зупинці хвиля згасає
      return [p[0] - vy / (sp || 1) * w, p[1] + vx / (sp || 1) * w, sq.back(ss)];
    };
    sq.pos = pos;
    const sp0 = sq.path(s), sp1 = sq.path(s + 0.1), vx = (sp1[0] - sp0[0]) / 0.1, vy = (sp1[1] - sp0[1]) / 0.1;
    let target = sq.hx;                                 // куди дивиться голова: за рухом, а на зупинці — ось сценарій: спершу туди, куди летів, потім до Фудзі
    if (s < sq.sP) target = vx < -4 ? -1 : vx > 4 ? 1 : sq.hx;
    else if (s < sq.leave) target = s < sq.sP + 0.7 ? sq.dirA : -sq.dirA;
    else if (s < sq.sR - 1) target = vx < -6 ? -1 : vx > 6 ? 1 : sq.hx;
    else if (s < sq.sWake) target = sq.faceRest;
    else target = vx < -6 ? -1 : vx > 6 ? 1 : sq.hx;
    const dt = sq.lastT == null ? 9 : Math.max(0, t - sq.lastT); sq.lastT = t;
    if (dt > 0.5) sq.hx = target; else { const d = target - sq.hx, m = 2.4 * dt; sq.hx += Math.abs(d) <= m ? d : Math.sign(d) * m; }
    // нахил морди: за рухом; на зупинці дивиться на гору вниз; на відпочинку голова лежить на схилі
    let tilt = Math.max(-0.7, Math.min(0.7, Math.atan2(vy, Math.abs(vx) + 0.001)));
    if (s > sq.sP && s < sq.leave + 1.2) tilt += (sq.tlPause - tilt) * smooth01((s - sq.sP - 0.8) / 1.2) * (s < sq.leave ? 1 : smooth01((sq.leave + 1.2 - s) / 1.2));
    if (s >= sq.sR - 2.4 && s < sq.sWake) tilt += (sq.tlRest - tilt) * smooth01((s - (sq.sR - 2.4)) / 2.2);
    else if (s >= sq.sWake) tilt = tilt * smooth01((s - sq.sWake) / 1.6);
    const kBase = s < sq.leave + 1 ? 1 + (DSEQ.K - 1) * smooth01(s / 12) : DSEQ.K + (DSEQ.KR - DSEQ.K) * smooth01((s - sq.leave - 1) / Math.max(1, sq.sR - sq.leave - 1));      // удалині дракон меншає (але не надто)
    const wk = 1 - smooth01((s - sq.sWake - 1) / (DSEQ.wake - 1)), k = (1 + (kBase - 1) * wk) * (1 + (sq.G.kS - 1) * smooth01(s / 12) * wk);      // на низькому екрані (телефон-горизонт) дракон дрібніший
    sq.kNow = k;
    const resting = s >= sq.sR && s < sq.sWake;
    const GG = sq.G; sq.o = { clip: g => { const x0 = GG.cx - 640; g.beginPath(); g.moveTo(x0, GG.top - 90); for (let i = 0; i <= 214; i++) { const x = x0 + i * 6; g.lineTo(x, GG.surf(x - GG.cx)); } g.lineTo(x0 + 214 * 6, GG.top - 90); g.closePath(); g.clip(); }, k, headX: sq.hx, tilt, sleep: s >= sq.sR - 1.2 && s < sq.sWake + 0.8, noFire: true, wob: resting ? 1.3 : 3, hbob: resting ? Math.sin(t * 1.3) * 1.5 * k : 0, from: resting ? sq.T0 + sq.sR : null };
    sq.sleeping = resting && s > sq.sR + 1.5;
    sq.says.forEach((ts, i) => { if (!sq.f[i] && s >= ts) { sq.f[i] = 1; if (s - ts < 2.5) sq.sayQ = i; } });
    return sq;
  }
  function zzz(g, x, y, t, kk, dir) {                   // «Zzz»: пікселькові літери ростуть і пливуть угору
    const Z = [[0, 0, 5, 1], [3, 1, 1, 1], [2, 2, 1, 1], [1, 3, 1, 1], [0, 4, 5, 1]];
    for (let i = 0; i < 4; i++) {
      const u = (t * 0.2 + i / 4) % 1, zs = Math.max(1, Math.round((0.9 + u * 1.8) * Math.max(1, kk * 0.8)));
      const px = Math.round(x + dir * u * 30 * kk + Math.sin(u * 7 + i * 2) * 4), py = Math.round(y - u * 70 * kk);
      g.globalAlpha = Math.min(1, u * 5) * Math.min(1, (1 - u) * 3);
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([ox, oy]) => Z.forEach(([rx, ry, rw, rh]) => P(g, px + rx * zs + ox, py + ry * zs + oy, rw * zs, rh * zs, '#1a2a5a')));
      Z.forEach(([rx, ry, rw, rh]) => P(g, px + rx * zs, py + ry * zs, rw * zs, rh * zs, '#ffffff'));
    }
    g.globalAlpha = 1;
  }
  function drawNightDragon(g, t, wl, wr, top, span, mode, night) {      // true — малює великий нічний політ замість денного; mode: 'sky' (під затемненням) або 'night' (світиться поверх)
    const sq = dseqUpdate(t, wl, wr, top, span); if (!sq) return false;
    const h = dragonDraw(g, t, sq.pos, mode === 'night' ? night : 0, sq.o);
    sq.head = { x: h.x, y: h.y, faceL: h.faceL };
    if (sq.sayQ != null) { const i = sq.sayQ; sq.sayQ = null; dseqSay(sq, i); }
    if (sq.sleeping && (mode === 'night' || sky.night < 0.05)) { const sa = g.globalAlpha; g.globalAlpha = 1; zzz(g, h.x + (h.faceL ? -8 : 8) * sq.kNow, h.y - 16 * sq.kNow, t, sq.kNow, h.faceL ? -1 : 1); g.globalAlpha = sa; }
    return true;
  }
  function neonNight() {                                  // уночі вивіски світяться яскравіше за затемнення, з ореолом і легким мерехтінням
    const Lm = sky.lamp; if (!neonSigns.length || Lm <= 0.02) return;
    if (!neonLayer) {
      const { c, g } = newLayer();
      neonSigns.forEach(s => { A(g, 0.1, () => P(g, s.x - 7, s.y - 7, s.w + 14, s.h + 14, s.c)); A(g, 0.17, () => P(g, s.x - 4, s.y - 4, s.w + 8, s.h + 8, s.c)); s.draw(g); });
      neonLayer = c;
    }
    ctx.globalAlpha = Math.min(1, Lm) * (0.92 + 0.08 * Math.sin(animClock * 3.1)); ctx.drawImage(neonLayer, -view.offX, -view.offY); ctx.globalAlpha = 1;
  }
  function skyExtra(time, noFly) {
    const g = ctx, wl = worldL(), wr = worldR(), top = 8 - view.offY, span = skySpan(top), W = wr - wl;
    if (!noFly) { if (!build && !drawNightDragon(g, time, wl, wr, top + 12, span, 'sky', 0)) dragon(g, time, wl, wr, top + 12, span); drawLanterns(g, time, wl, wr, top + 12, span); }       // під час будівництва той самий дракон літає біля будинку (278)
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
    sunRx: W => Math.round(W * 0.26),                              // вужча дуга сонця й місяця: виходять з-за схилу Фудзі, ховаються за нею близько полудня й виходять знову
    skyFront(c) {                                                   // Фудзі поверх сонця/місяця/зір, із нічним і вечірнім затемненням як у шару неба
      if (!fujiC) return;
      const n = Math.round(sky.night * 24), d = Math.round(sky.dusk * 12), key = n + ':' + d + ':' + fujiC.width + 'x' + fujiC.height;
      if (key !== fujiKey || !fujiT) {
        fujiKey = key; if (!fujiT) fujiT = document.createElement('canvas');
        fujiT.width = fujiC.width; fujiT.height = fujiC.height;
        const t = fujiT.getContext('2d'); t.drawImage(fujiC, 0, 0); t.globalCompositeOperation = 'source-atop';
        if (n > 0) { t.globalAlpha = n / 24 * 0.72; t.fillStyle = '#141a40'; t.fillRect(0, 0, fujiT.width, fujiT.height); }
        if (d > 0) { t.globalAlpha = d / 12 * 0.1; t.fillStyle = '#ff8a4a'; t.fillRect(0, 0, fujiT.width, fujiT.height); }
      }
      c.drawImage(fujiT, 0, 0);
    },
    filterNeon(keep) { neonSigns = neonSigns.filter(s => keep([s.x, s.y, s.w, s.h])); neonLayer = null; },
    skyPath() { const wl = worldL(), wr = worldR(), top = 8 - view.offY, span = skySpan(top); return tt => dragonPath(tt, wl, wr, top + 12, span); },       // маршрут дракона в небі: за ним злітає й вертається будівельний
    drawDragon: (g, t, pos) => dragonDraw(g, t, pos, 0),
    dragonNight: { set(n) { dseqN = n - 1; dseq = null; dseqWas = false; }, state: () => dseq && { route: dseq.route, s: Math.round(dseq.s * 10) / 10, sP: dseq.sP, leave: dseq.leave, sR: dseq.sR, sWake: dseq.sWake, hx: dseq.hx, head: dseq.head } },      // перевірка: set(n) — маршрут наступної ночі (0 ліворуч, 1 праворуч, 2 над вершиною)          // той самий дракон, що в небі (використовує будівництво, 278)
    nightExtra(time, noFly) {                                       // після нічного затемнення: дракон ледь підсвічений, вогонь світиться
      neonNight();
      const n = sky.night; if (noFly || n < 0.05 || build) return;
      const wl = worldL(), wr = worldR(), top = 8 - view.offY, span = skySpan(top);
      GA = Math.min(0.5, n * 0.55); ctx.globalAlpha = GA;
      if (!drawNightDragon(ctx, time, wl, wr, top + 12, span, 'night', n)) dragon(ctx, time, wl, wr, top + 12, span, n);
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
