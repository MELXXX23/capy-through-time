//#part 265_d_card_scenes.js
/* Картки скінів героїв і вулиць (р. 73): у кожного скіна своя сцена 64×40 з живою дрібницею; герої — новий одяг у трьох звірят,
   вулиця — будинки, ліхтар, лавка й покупець, що йде. Малюється з часу t (с) без накопичення стану. */
const cardRect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const cardMod = (a, b) => ((a % b) + b) % b;
function cardSparkle(g, x, y, c) { cardRect(g, x, y, 1, 1, c); cardRect(g, x - 1, y, 3, 1, c); cardRect(g, x, y - 1, 1, 3, c); }
function cardBall(g, cx, cy, rx, ry, c) { for (let y = -ry; y <= ry; y++) { const h = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / ry) * (y / ry)))); cardRect(g, cx - h, cy + y, h * 2 + 1, 1, c); } }
function cardTri(g, cx, y, h, c) { for (let i = 0; i < h; i++) cardRect(g, cx - i, y + i, i * 2 + 1, 1, c); }
function cardSky(g, W, y1, cols) { cols.forEach((c, i) => cardRect(g, 0, Math.round(y1 * i / cols.length), W, Math.ceil(y1 / cols.length) + 1, c)); }
function cardStars(g, W, t, n, h) { for (let i = 0; i < n; i++) { const hs = hash2(i * 5 + 1, 17); if (Math.sin(t * 2 + i * 1.7) > -0.3) cardRect(g, hs % W, (hs >>> 7) % h, 1, 1, i % 3 ? '#ffffff' : '#bfe4ff'); } }
const CARD_GY = 32;
const HERO_SCENES = {
  wood(g, W, H, t) {
    const gy = CARD_GY;
    cardRect(g, 0, 0, W, gy, '#8a5a38'); for (let x = 0; x < W; x += 8) { cardRect(g, x, 0, 1, gy, '#6b4128'); cardRect(g, x + 1, 0, 1, gy, '#9c6a44'); }
    cardRect(g, 38, 5, 18, 15, '#3e2616'); cardRect(g, 40, 7, 14, 11, '#a9dcae'); cardRect(g, 40, 7, 14, 4, '#c6ecc8');
    [[42, 14, 3], [47, 13, 4], [51, 14, 3]].forEach(([x, y, h]) => { cardRect(g, x, y, 3, h + 1, '#3f7a47'); cardRect(g, x + 1, y - 2, 1, 2, '#3f7a47'); });
    cardRect(g, 46, 7, 1, 11, '#3e2616'); cardRect(g, 40, 12, 14, 1, '#3e2616');
    cardRect(g, 12, 2, 1, 4, '#3e2616'); cardRect(g, 10, 6, 5, 3, '#e8b030'); g.globalAlpha = 0.2 + 0.05 * Math.sin(t * 7); cardRect(g, 4, 3, 17, 14, '#ffd860'); g.globalAlpha = 1;
    cardRect(g, 0, gy, W, H - gy, '#a8703f'); cardRect(g, 0, gy, W, 1, '#5a3820'); for (let x = 3; x < W; x += 11) cardRect(g, x, gy + 3, 1, 5, '#7a4f2e');
    cardRect(g, 56, gy - 5, 7, 5, '#6b4128'); cardRect(g, 57, gy - 4, 5, 3, '#c9955a'); cardRect(g, 58, gy - 3, 3, 1, '#e8bd84');
    for (let i = 0; i < 5; i++) cardRect(g, cardMod(i * 13 + t * 3, W), gy + 2 + (i * 3) % 5, 1, 1, '#ffd9a0');
  },
  brick(g, W, H, t) {
    const gy = CARD_GY;
    cardRect(g, 0, 0, W, gy, '#a9d8f0'); cardRect(g, 0, 18, W, 14, '#c6e6f5');
    cardRect(g, 0, 20, 8, 12, '#9bb0c0'); cardRect(g, 10, 15, 7, 17, '#8ea4b6'); cardRect(g, 19, 22, 9, 10, '#9bb0c0');
    cardRect(g, 50, 3, 2, 29, '#e8b020'); for (let y = 5; y < 30; y += 4) cardRect(g, 50, y, 4, 1, '#b8860b');
    cardRect(g, 28, 4, 30, 2, '#e8b020'); cardRect(g, 28, 4, 30, 1, '#ffd860');
    const sw = Math.round(Math.sin(t * 1.6) * 2); cardRect(g, 33 + sw, 6, 1, 8, '#444'); cardRect(g, 31 + sw, 14, 5, 3, '#cc3a2a'); cardRect(g, 31 + sw, 14, 5, 1, '#ff7a5a');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { if (r === 0 && c > 1) continue; const x = 47 + c * 4 + (r % 2) * 2, y = gy - 3 - r * 3; if (x < W) { cardRect(g, x, y, 4, 3, '#b5543c'); cardRect(g, x, y, 4, 1, '#d4725a'); cardRect(g, x + 3, y, 1, 3, '#7a2e22'); } }
    cardRect(g, 0, gy, W, H - gy, '#8e8a84'); cardRect(g, 0, gy, W, 1, '#6a6660'); cardRect(g, 0, gy + 1, W, 1, '#aaa6a0');
    [4, 28].forEach(x => { cardRect(g, x, gy - 4, 4, 5, '#ff8a1e'); cardRect(g, x + 1, gy - 5, 2, 1, '#ff8a1e'); cardRect(g, x, gy - 2, 4, 1, '#fff4dc'); });
  },
  candy(g, W, H, t) {
    const gy = CARD_GY;
    for (let y = 0; y < gy; y++) cardRect(g, 0, y, W, 1, y < 12 ? '#ffc6df' : y < 22 ? '#ffd9ea' : '#fff0f6');
    const lolli = (cx, cy, r, c1, c2) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) { const a = Math.atan2(y, x) + Math.sqrt(x * x + y * y) * 0.9; cardRect(g, cx + x, cy + y, 1, 1, Math.sin(a * 1.5) > 0 ? c1 : c2); } cardRect(g, cx, cy + r, 1, gy - cy - r, '#fff'); };
    lolli(9, 12, 6, '#ff4f8a', '#ffffff'); lolli(54, 9, 5, '#4fc0f0', '#ffffff'); lolli(31, 6, 3, '#ffd23a', '#ffffff');
    cardRect(g, 16, 3, 8, 3, '#fff'); cardRect(g, 19, 1, 6, 3, '#fff'); cardRect(g, 40, 16, 9, 3, '#fff'); cardRect(g, 42, 14, 6, 3, '#fff');
    for (let x = 0; x < W; x += 6) { cardRect(g, x, gy, 3, H - gy, '#ff9fbf'); cardRect(g, x + 3, gy, 3, H - gy, '#fff4f8'); } cardRect(g, 0, gy, W, 1, '#e0608a');
    for (let i = 0; i < 9; i++) cardRect(g, cardMod(i * 7 + 3, W), cardMod(i * 11 + t * 8, gy), 1, 2, ['#ff4f8a', '#4fc0f0', '#ffd23a', '#7ae08a'][i % 4]);
  },
  gold(g, W, H, t) {
    const gy = CARD_GY;
    cardRect(g, 0, 0, W, gy, '#6e1a28'); for (let x = 0; x < W; x += 5) { cardRect(g, x, 0, 1, gy, '#4a0f1a'); cardRect(g, x + 2, 0, 1, gy, '#8e2a3a'); }
    cardRect(g, 0, 0, W, 3, '#e8b030'); for (let x = 0; x < W; x += 3) cardRect(g, x, 3, 1, 3, '#e8b030'); cardRect(g, 0, 0, W, 1, '#ffe27a');
    g.save(); g.globalAlpha = 0.2 + 0.05 * Math.sin(t * 1.5); g.fillStyle = '#fff0b0'; g.beginPath(); g.moveTo(26, 0); g.lineTo(38, 0); g.lineTo(58, gy); g.lineTo(6, gy); g.closePath(); g.fill(); g.restore();
    cardRect(g, 0, gy, W, H - gy, '#b8862a'); cardRect(g, 0, gy, W, 1, '#ffe27a'); cardRect(g, 0, gy + 3, W, 1, '#8a6218');
    for (let i = 0; i < 8; i++) if ((t * 0.9 + i * 0.31) % 1 < 0.45) cardSparkle(g, 4 + (i * 17) % (W - 8), 8 + (i * 7) % 20, '#fff6c0');
  },
  party(g, W, H, t) {
    const gy = CARD_GY;
    cardSky(g, W, gy, ['#3a1e6e', '#4e2682', '#6a2f9a']);
    const bc = ['#ff4f8a', '#ffd23a', '#4fc0f0', '#7ae08a'];
    cardRect(g, 0, 3, W, 1, '#e8e0f0'); for (let x = 1; x < W; x += 6) cardTri(g, x + 2, 4, 3, bc[(x / 6 | 0) % 4]);
    for (let i = 0; i < 5; i++) { const x = 6 + i * 13 + Math.round(Math.sin(t + i) * 2), y = Math.round(gy + 6 - cardMod(t * 4 + i * 9, 44)); if (y > 7 && y < gy) { cardBall(g, x, y, 2, 3, bc[i % 4]); cardRect(g, x - 1, y - 2, 1, 1, '#ffffff'); cardRect(g, x, y + 3, 1, 4, '#d8d0e0'); } }
    for (let y = gy; y < H; y += 4) for (let x = 0; x < W; x += 4) cardRect(g, x, y, 4, 4, (((x >> 2) + (y >> 2) + Math.floor(t * 2)) & 1) ? '#ff4f8a' : '#4fc0f0');
    cardRect(g, 0, gy, W, 1, '#2a1048');
    for (let i = 0; i < 14; i++) cardRect(g, cardMod(i * 9 + Math.sin(t + i) * 2, W), cardMod(i * 7 + t * 9, gy), 1, 1, bc[i % 4]);
  },
  ninja(g, W, H, t) {
    const gy = CARD_GY;
    cardSky(g, W, gy, ['#0f1830', '#1a2a4a', '#233a5e']); cardStars(g, W, t, 10, 14);
    cardBall(g, 46, 11, 6, 6, '#f4f0d0'); cardBall(g, 48, 12, 4, 4, '#e0d8b0');
    [6, 15, 58].forEach((x, k) => { cardRect(g, x, 0, 2, gy, '#1f4a34'); cardRect(g, x, 0, 1, gy, '#2f6a4a'); for (let y = 5 + k * 3; y < gy; y += 8) cardRect(g, x - 1, y, 4, 1, '#14301f'); });
    cardRect(g, 0, gy, W, H - gy, '#1a1f2c'); cardRect(g, 0, gy, W, 1, '#3a4660'); for (let x = 0; x < W; x += 6) cardRect(g, x, gy + 2, 5, 2, '#242c3c');
    for (let i = 0; i < 4; i++) cardRect(g, cardMod(i * 17 - t * 6, W), cardMod(i * 11 + t * 5, gy), 2, 1, '#4f9a63');
  },
  chef(g, W, H, t) {
    const gy = CARD_GY;
    cardRect(g, 0, 0, W, gy, '#f4f0e6'); for (let x = 0; x < W; x += 6) cardRect(g, x, 0, 1, gy, '#d8d0c0'); for (let y = 0; y < gy; y += 6) cardRect(g, 0, y, W, 1, '#d8d0c0');
    cardRect(g, 4, 10, 30, 2, '#8a5a38'); cardRect(g, 5, 5, 6, 5, '#8a929c'); cardRect(g, 5, 5, 6, 1, '#c8d0d8'); cardRect(g, 12, 6, 2, 1, '#8a929c'); cardRect(g, 18, 6, 5, 4, '#c8503a'); cardRect(g, 18, 6, 5, 1, '#e87a62'); cardRect(g, 26, 4, 3, 6, '#e0c870');
    cardRect(g, 50, 0, 1, 6, '#444'); cardBall(g, 50, 9, 4, 3, '#4a4f58'); cardRect(g, 46, 9, 8, 1, '#6a707a'); cardRect(g, 54, 8, 5, 1, '#444');
    for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; g.globalAlpha = Math.sin(k * Math.PI) * 0.7; cardBall(g, 20 + Math.round(Math.sin(t * 2 + i) * 2), Math.round(5 - k * 5), 2, 1, '#ffffff'); g.globalAlpha = 1; }
    cardRect(g, 0, gy - 2, W, 2, '#d8b078'); cardRect(g, 0, gy, W, H - gy, '#8a5a38'); cardRect(g, 0, gy, W, 1, '#c9955a'); for (let x = 8; x < W; x += 16) cardRect(g, x, gy + 2, 1, 6, '#6b4128');
  },
  wizard(g, W, H, t) {
    const gy = CARD_GY;
    cardSky(g, W, gy, ['#1a1040', '#2a1a5c', '#3d2a7a']); cardStars(g, W, t, 14, 22);
    cardBall(g, 50, 9, 5, 5, '#fff0a0'); cardBall(g, 52, 8, 4, 4, '#2a1a5c');
    cardRect(g, 3, 12, 9, 20, '#150c34'); cardTri(g, 7, 6, 6, '#150c34'); cardRect(g, 6, 16, 3, 4, (Math.floor(t * 0.7) & 1) ? '#ffe27a' : '#e8a030');
    cardRect(g, 0, gy, W, H - gy, '#2a1a5a'); cardRect(g, 0, gy, W, 1, '#6a4ab0');
    g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3); for (let a = 0; a < 6.28; a += 0.4) cardRect(g, 32 + Math.cos(a + t * 0.5) * 22, gy + 4 + Math.sin(a + t * 0.5) * 2.4, 1, 1, '#c8a0ff'); g.globalAlpha = 1;
    for (let i = 0; i < 6; i++) if ((t * 0.8 + i * 0.27) % 1 < 0.5) cardSparkle(g, 8 + (i * 11) % 50, 10 + (i * 5) % 18, '#ffe27a');
  },
  royal(g, W, H, t) {
    const gy = CARD_GY;
    cardRect(g, 0, 0, W, gy, '#8a8a96'); for (let y = 0; y < gy; y += 5) { cardRect(g, 0, y, W, 1, '#6a6a76'); for (let x = (y / 5 & 1) * 4; x < W; x += 8) cardRect(g, x, y, 1, 5, '#6a6a76'); }
    [[7], [49]].forEach(([x]) => { cardRect(g, x, 2, 9, 16, '#b02a38'); cardRect(g, x, 2, 9, 1, '#e8b030'); cardRect(g, x, 2, 1, 16, '#e8b030'); cardRect(g, x + 8, 2, 1, 16, '#e8b030'); cardTri(g, x + 4, 18, 4, '#b02a38'); cardRect(g, x + 3, 7, 3, 3, '#ffe27a'); cardRect(g, x + 4, 5, 1, 2, '#ffe27a'); });
    [29, 35].forEach((x, k) => { cardRect(g, x, 8, 2, 4, '#4a3a2a'); const f = Math.sin(t * 9 + k * 2) > 0 ? 1 : 0; cardRect(g, x, 5 - f, 2, 3 + f, '#ff9a2a'); cardRect(g, x, 6, 2, 2, '#ffe27a'); });
    cardRect(g, 0, gy, W, H - gy, '#5a5a66'); cardRect(g, 0, gy, W, 1, '#8a8a96'); cardRect(g, 8, gy + 1, 48, H - gy - 1, '#b02a38'); cardRect(g, 8, gy + 1, 48, 1, '#e8b030'); cardRect(g, 8, gy + 1, 1, H - gy - 1, '#e8b030'); cardRect(g, 55, gy + 1, 1, H - gy - 1, '#e8b030');
  },
  santa(g, W, H, t) {
    const gy = CARD_GY;
    cardSky(g, W, gy, ['#0d1b3a', '#1a3258', '#2a4a7a']); cardStars(g, W, t, 9, 14); cardBall(g, 32, 8, 3, 3, '#fff6d0');
    cardRect(g, 0, gy, W, H - gy, '#f2f6ff'); cardRect(g, 0, gy, W, 1, '#c8d8f0'); cardRect(g, 0, gy + 4, W, 1, '#dfe8f8');
    [3, 56].forEach((x, k) => { cardTri(g, x + 4, 6, 8, '#1f6a3a'); cardTri(g, x + 4, 12, 9, '#2a8a4a'); cardTri(g, x + 4, 19, 10, '#1f6a3a'); cardRect(g, x + 3, 29, 3, 3, '#5a3a20');
      [[3, 10], [6, 16], [2, 22], [7, 26], [4, 14]].forEach(([dx, dy], i) => { if ((Math.floor(t * 2) + i + k) % 3) cardRect(g, x + dx, dy, 1, 1, ['#ff4f4f', '#ffd23a', '#4fc0f0'][i % 3]); }); cardRect(g, x + 4, 4, 1, 2, '#ffd23a'); });
    for (let i = 0; i < 16; i++) cardRect(g, cardMod(i * 9 + Math.sin(t + i) * 2, W), cardMod(i * 7 + t * 9, H), 1, 1, '#ffffff');
  },
  witch(g, W, H, t) {
    const gy = CARD_GY;
    cardSky(g, W, gy, ['#3a1a5a', '#5a2468', '#a8345a', '#e8683c', '#ff9a4a']);
    cardBall(g, 14, 11, 7, 7, '#ffe9a8'); cardBall(g, 16, 13, 4, 4, '#f0d088');
    cardRect(g, 52, 12, 3, 20, '#1a0f24'); cardRect(g, 46, 10, 6, 1, '#1a0f24'); cardRect(g, 55, 8, 6, 1, '#1a0f24'); cardRect(g, 48, 7, 1, 4, '#1a0f24'); cardRect(g, 58, 5, 1, 4, '#1a0f24'); cardRect(g, 44, 13, 1, 3, '#1a0f24');
    for (let i = 0; i < 3; i++) { const x = cardMod(t * 8 + i * 22, W + 10) - 5, y = 10 + i * 6 + Math.round(Math.sin(t * 2 + i) * 2), f = Math.sin(t * 14 + i) > 0; cardRect(g, x, y, 3, 1, '#14081c'); cardRect(g, x - 1, y - (f ? 1 : 0), 1, 1, '#14081c'); cardRect(g, x + 3, y - (f ? 1 : 0), 1, 1, '#14081c'); }
    cardRect(g, 0, gy, W, H - gy, '#2a1a38'); cardRect(g, 0, gy, W, 1, '#4a2a5a'); for (let x = 1; x < W; x += 5) cardRect(g, x, gy - 1, 1, 1, '#2a1a38');
    cardBall(g, 57, gy - 2, 3, 2, '#e8863c'); cardRect(g, 57, gy - 5, 1, 2, '#3a7a3a'); cardRect(g, 55, gy - 3, 1, 1, '#2a1a38'); cardRect(g, 59, gy - 3, 1, 1, '#2a1a38');
  },
  diamond(g, W, H, t) {
    const gy = CARD_GY;
    cardSky(g, W, gy, ['#0c2a44', '#12405e', '#164c72']);
    [[4, 12, 20], [14, 6, 26], [46, 10, 22], [56, 14, 18]].forEach(([x, y, h]) => { cardTri(g, x + 3, y, 7, '#58b8dc'); cardRect(g, x + 3, y + 7, 1, h - 7 > 0 ? gy - y - 7 : 0, '#58b8dc'); cardTri(g, x + 3, y, 7, '#7fd6f0'); cardRect(g, x + 3, y + 1, 1, 5, '#e0f8ff'); });
    g.save(); g.globalAlpha = 0.1 + 0.04 * Math.sin(t); g.fillStyle = '#bdeeff'; g.beginPath(); g.moveTo(20, 0); g.lineTo(30, 0); g.lineTo(46, gy); g.lineTo(10, gy); g.closePath(); g.fill(); g.restore();
    cardRect(g, 0, gy, W, H - gy, '#2a6a92'); cardRect(g, 0, gy, W, 1, '#9fe0f8'); for (let x = 0; x < W; x += 9) cardRect(g, x, gy + 2, 4, 1, '#58b8dc');
    for (let i = 0; i < 9; i++) if ((t * 1.1 + i * 0.29) % 1 < 0.45) cardSparkle(g, 3 + (i * 13) % (W - 6), 4 + (i * 7) % 26, '#ffffff');
  },
  sand(g, W, H, t) {
    const gy = CARD_GY;
    cardSky(g, W, gy, ['#7ec8e8', '#a8dcec', '#ffe0a0', '#ffd080']);
    g.globalAlpha = 0.3; cardBall(g, 50, 9, 8, 8, '#fff2a0'); g.globalAlpha = 1; cardBall(g, 50, 9, 5, 5, '#fff7c0');
    cardTri(g, 36, 14, 18, '#e0b060'); for (let i = 0; i < 18; i++) cardRect(g, 36 + Math.floor(i / 2) - (i < 1 ? 0 : 0), 14 + i, Math.floor(i / 2) + 1, 1, '#b88838');
    cardRect(g, 7, 12, 2, 20, '#6b4a28'); [[-5, -1], [-3, -3], [3, -3], [5, -1], [0, -4]].forEach(([dx, dy]) => cardRect(g, 8 + dx, 12 + dy + (dx > 0 ? Math.round(Math.sin(t * 2) * 0) : 0), 4, 2, '#3f8a4a'));
    cardRect(g, 0, 24, W, 8, '#f0c878'); cardRect(g, 0, 25, W, 1, '#f8dca0'); for (let x = 0; x < W; x++) cardRect(g, x, 26 + Math.round(Math.sin(x * 0.18) * 1.5), 1, 6, '#e8b860');
    cardRect(g, 0, gy, W, H - gy, '#e8c070'); cardRect(g, 0, gy, W, 1, '#c89a40'); for (let x = 0; x < W; x += 7) cardRect(g, x, gy + 3, 4, 1, '#d0a450');
    for (let i = 0; i < 7; i++) cardRect(g, cardMod(i * 11 + t * 14, W), 26 + (i * 5) % 12, 2, 1, '#fff0c8');
  },
  moss(g, W, H, t) {
    const gy = CARD_GY;
    cardSky(g, W, gy, ['#bfe6a8', '#a0d890', '#7ec880', '#6fb878']);
    [[5, 5], [24, 4], [56, 5]].forEach(([x, w]) => { cardRect(g, x, 0, w, gy, '#5a3a20'); cardRect(g, x, 0, 1, gy, '#7a5a36'); cardRect(g, x + w - 1, 0, 1, gy, '#3a2410'); for (let y = 4; y < gy; y += 7) cardRect(g, x, y, w, 2, '#4f9a63'); });
    for (let x = 0; x < W; x += 6) cardBall(g, x + 3, 3 + (x % 12) / 4, 5, 3, '#2f6b48');
    g.save(); g.fillStyle = '#fff6b0'; [[18, 0], [40, 0]].forEach(([x], k) => { g.globalAlpha = 0.14 + 0.07 * Math.sin(t * 1.3 + k * 2); g.beginPath(); g.moveTo(x, 4); g.lineTo(x + 6, 4); g.lineTo(x + 14, gy); g.lineTo(x + 6, gy); g.closePath(); g.fill(); }); g.restore();
    cardRect(g, 0, gy, W, H - gy, '#4f9a63'); cardRect(g, 0, gy, W, 1, '#78c27a'); for (let x = 2; x < W; x += 5) cardRect(g, x, gy - 1, 1, 1, '#78c27a');
    cardBall(g, 40, gy - 2, 3, 2, '#d23a3a'); cardRect(g, 39, gy - 2, 1, 1, '#fff'); cardRect(g, 41, gy - 3, 1, 1, '#fff'); cardRect(g, 40, gy, 1, 2, '#f4ead0');
    for (let i = 0; i < 6; i++) { const k = (t * 0.5 + i * 0.17) % 1; g.globalAlpha = Math.sin(k * Math.PI); cardRect(g, 6 + i * 10 + Math.sin(t + i) * 3, 12 + (i * 5) % 18, 1, 1, '#e8ff7a'); g.globalAlpha = 1; }
  }
};
function heroSkinPreview(cv, t) {                                    // троє героїв у вбранні скіна на сцені скіна, підстрибують по черзі
  const W = 64, H = 40;
  if (cv.width !== W) { cv.width = W; cv.height = H; }
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
  const sc = HERO_SCENES[skinOn('hero')];
  if (sc) sc(g, W, H, t);
  else { iconBackdrop(g, W, H, ['#dfeaf0', '#e8f0f2', '#f0f4f2'], ['#b8b0a4', '#8a8278']); skinTwinkles(g, W, H, t, 5); }
  ['spike', 'zoya', 'leo'].forEach((id, k) => {
    const c = getOutlinedCanvas(teamSprite(id)), x = 1 + k * 21, ph = (t * 1.6 + k * 0.33) % 1, hop = ph < 0.3 ? Math.round(Math.sin(ph / 0.3 * Math.PI) * 3) : 0, fy = H - 6;
    g.globalAlpha = 0.3; g.fillStyle = '#1a0e08'; g.fillRect(x + 4, fy + 1, 14 - hop, 2); g.globalAlpha = 1;
    g.drawImage(c, x, fy - c.height + 2 - hop);
  });
}

/* ---------- Вулиці ---------- */
const STREET_THEME = {                                              // [стіна, тінь, світло, небо] будинків над вулицею
  stone: ['#9a8f84', '#6a6258', '#bdb2a6', '#cfeaf8'], wood: ['#8a5a38', '#6b4128', '#b0784a', '#cfeaf8'], brick: ['#b5543c', '#7a2e22', '#d4725a', '#cfeaf8'],
  snow: ['#dfe8f2', '#a9bccf', '#ffffff', '#b8cde6'], leaves: ['#b8683a', '#7a3c20', '#e0925a', '#e8d8b0'], moss: ['#7f927c', '#55684f', '#a3b89c', '#d4ecd0'],
  gold: ['#e8b030', '#a87414', '#ffe27a', '#fff0c0'], diamond: ['#7fd6f0', '#3a8ab0', '#bdeeff', '#e0f8ff'], candy: ['#ffc4da', '#e0608a', '#ffe4ef', '#e8f4ff'], sand: ['#d9b878', '#a07838', '#f0d8a0', '#bfe6f5']
};
const streetCobbleCache = {};
function streetSkinPreview(cv, name, t) {
  const W = 64, H = 40; cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const T = STREET_THEME[name] || STREET_THEME.stone;
  cardRect(g, 0, 0, W, 12, T[3]);
  for (let i = 0; i < 4; i++) { const x = i * 17 - 2, hh = 10 + (i % 2) * 3; cardRect(g, x, 12 - hh, 16, hh, T[0]); cardRect(g, x, 12 - hh, 16, 2, T[2]); cardRect(g, x + 15, 12 - hh, 1, hh, T[1]);
    for (let w = 0; w < 2; w++) cardRect(g, x + 3 + w * 6, 12 - hh + 4, 4, 5, (Math.floor(t * 0.4) + i + w) % 3 ? '#ffe27a' : '#4a5a70'); }
  cardRect(g, 0, 12, W, 4, '#c9c4bc'); cardRect(g, 0, 12, W, 1, '#e8e4dc'); cardRect(g, 0, 15, W, 1, '#8e8a84');
  let cob = streetCobbleCache[name];
  if (!cob) { cob = streetCobbleCache[name] = document.createElement('canvas'); cob.width = W; cob.height = H - 16; const cg = cob.getContext('2d'); cg.imageSmoothingEnabled = false; paintCobble(cg, 0, 0, W, H - 16, name); }
  g.drawImage(cob, 0, 16);
  cardRect(g, 8, 4, 2, 14, '#2e3a46'); cardRect(g, 6, 3, 6, 2, '#2e3a46'); g.globalAlpha = (0.5 + 0.2 * Math.sin(t * 3)) * 0.45; cardRect(g, 3, 2, 12, 9, '#ffe27a'); g.globalAlpha = 1; cardRect(g, 7, 4, 4, 1, '#fff4c0');
  cardRect(g, 48, 22, 12, 2, '#6b4128'); cardRect(g, 48, 24, 1, 3, '#3a2616'); cardRect(g, 59, 24, 1, 3, '#3a2616'); cardRect(g, 48, 20, 12, 1, '#8a5a38');
  const sp = getSpriteCanvas('bunny_' + (Math.floor(t * 6) % 2)), wx = cardMod(t * 9, W + 24) - 20;
  g.globalAlpha = 0.3; cardRect(g, wx + 3, 36, 12, 2, '#1a0e08'); g.globalAlpha = 1; g.drawImage(sp, Math.round(wx), 14);
  if (name === 'snow') for (let i = 0; i < 14; i++) cardRect(g, cardMod(i * 9 + Math.sin(t + i) * 2, W), cardMod(i * 7 + t * 10, H), 1, 1, '#ffffff');
  else if (name === 'moss') for (let i = 0; i < 5; i++) { const ph = (t * 0.6 + i * 0.2) % 1; g.globalAlpha = Math.sin(ph * Math.PI); cardRect(g, 6 + i * 12 + Math.sin(t + i) * 3, 20 + (i * 5) % 14, 1, 1, '#d8ff7a'); g.globalAlpha = 1; }
  else if (name === 'candy') for (let i = 0; i < 8; i++) cardRect(g, cardMod(i * 8 + 3, W), cardMod(i * 9 + t * 7, H), 1, 2, ['#ff4f8a', '#4fc0f0', '#ffd23a'][i % 3]);
  else if (name === 'brick') for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i * 0.33) % 1; g.globalAlpha = 0.5 * Math.sin(ph * Math.PI); cardRect(g, 26 + i * 8, 6 + (1 - ph) * 8, 2, 2, '#e0e0e0'); g.globalAlpha = 1; }
  else if (name === 'wood') for (let i = 0; i < 6; i++) cardRect(g, cardMod(i * 11 + t * 4, W), cardMod(i * 7 + t * 6, H), 1, 1, '#ffd9a0');
  else if (name === 'leaves') for (let i = 0; i < 9; i++) cardRect(g, cardMod(i * 8 + Math.sin(t * 1.5 + i) * 4, W), cardMod(i * 6 + t * 8, H), 2, 1, ['#d9602a', '#e8a030', '#b8402a'][i % 3]);
  else if (name === 'gold' || name === 'diamond') for (let i = 0; i < 7; i++) if ((t * 0.9 + i * 0.29) % 1 < 0.45) cardSparkle(g, 4 + (i * 17) % (W - 8), 18 + (i * 7) % 18, name === 'gold' ? '#fff6c0' : '#ffffff');
  else if (name === 'sand') for (let i = 0; i < 7; i++) cardRect(g, cardMod(i * 11 + t * 14, W), 18 + (i * 5) % 20, 2, 1, '#fff0c8');
}
