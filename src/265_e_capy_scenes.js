//#part 265_e_capy_scenes.js
/* Декорації карток скінів Капі (р. 73): між тлом і Капі малюється сценка скіна. Картка ≈ 46×38, небо до H−8, далі підлога. Ключ — назва скіна без «capy_». */
const CAPY_SCENES = {
  pirate(g, W, H, t) {
    const gy = H - 8;
    cardBall(g, 8, 7, 4, 4, '#fff2a0');
    cardRect(g, 0, 17, W, gy - 17, '#3a8ac8'); cardRect(g, 0, 17, W, 1, '#8fd0f0');
    for (let i = 0; i < 6; i++) cardRect(g, cardMod(i * 9 + t * 5, W), 20 + (i * 3) % 9, 3, 1, '#8fd0f0');
    cardRect(g, W - 16, 14, 9, 3, '#5a3a20'); cardRect(g, W - 15, 17, 7, 1, '#3a2410'); cardRect(g, W - 12, 5, 1, 9, '#3a2410'); cardTri(g, W - 11, 6, 6, '#f4f0e0'); cardRect(g, W - 11, 7, 1, 1, '#2a2020');
    const f = Math.sin(t * 6) > 0; cardRect(g, cardMod(t * 6, W + 8) - 4, 5 + Math.round(Math.sin(t) * 2), 2, 1, '#ffffff'); cardRect(g, cardMod(t * 6, W + 8) - 5, 4 + (f ? 1 : 0), 1, 1, '#ffffff');
  },
  astro(g, W, H, t) {
    const gy = H - 8;
    cardStars(g, W, t, 12, gy - 6);
    cardBall(g, W - 10, 9, 5, 5, '#d8905a'); cardRect(g, W - 17, 9, 14, 1, '#f0c890'); cardRect(g, W - 16, 10, 12, 1, '#c07848'); cardBall(g, W - 11, 8, 2, 1, '#e8a878');
    cardBall(g, 8, 8, 3, 3, '#3a78c8'); cardRect(g, 6, 7, 3, 1, '#4fa860'); cardRect(g, 9, 9, 1, 2, '#4fa860');
    cardBall(g, 6, gy + 3, 4, 1, '#454a60'); cardBall(g, W - 8, gy + 4, 5, 1, '#454a60');
    cardRect(g, 3, gy - 7, 1, 8, '#c8c8d0'); cardRect(g, 4, gy - 7, 5, 3, '#d23a3a'); cardRect(g, 4, gy - 7, 5, 1, '#ff7a6a');
  },
  santa(g, W, H, t) {
    const gy = H - 8;
    cardBall(g, W - 9, 7, 3, 3, '#fff6d0');
    cardTri(g, 6, 6, 8, '#1f6a3a'); cardTri(g, 6, 11, 9, '#2a8a4a'); cardRect(g, 5, gy - 3, 3, 3, '#5a3a20');
    [[3, 10], [8, 14], [5, 18], [9, 21]].forEach(([dx, dy], i) => { if ((Math.floor(t * 2) + i) % 3) cardRect(g, dx, dy, 1, 1, ['#ff4f4f', '#ffd23a', '#4fc0f0'][i % 3]); }); cardRect(g, 6, 4, 1, 2, '#ffd23a');
    cardBall(g, W - 8, gy - 2, 3, 2, '#ffffff'); cardBall(g, W - 8, gy - 6, 2, 2, '#ffffff'); cardRect(g, W - 9, gy - 7, 1, 1, '#222'); cardRect(g, W - 7, gy - 7, 1, 1, '#222'); cardRect(g, W - 8, gy - 6, 2, 1, '#ff8a1e'); cardRect(g, W - 10, gy - 5, 5, 1, '#d23a3a');
  },
  knight(g, W, H, t) {
    const gy = H - 8;
    cardRect(g, 0, 10, W, gy - 10, '#8a8a96'); for (let y = 10; y < gy; y += 5) { cardRect(g, 0, y, W, 1, '#6a6a76'); for (let x = (y / 5 & 1) * 3; x < W; x += 7) cardRect(g, x, y, 1, 5, '#6a6a76'); }
    for (let x = 0; x < W; x += 6) { cardRect(g, x, 6, 4, 4, '#8a8a96'); cardRect(g, x, 6, 4, 1, '#a8a8b4'); }
    cardRect(g, W - 9, 0, 1, 10, '#5a5a66'); const w = Math.round(Math.sin(t * 3) * 1); cardRect(g, W - 8, 1, 6 + w, 4, '#b02a38'); cardRect(g, W - 8, 1, 6 + w, 1, '#e8b030');
    const f = Math.sin(t * 9) > 0 ? 1 : 0; cardRect(g, 5, 14, 2, 3, '#4a3a2a'); cardRect(g, 5, 11 - f, 2, 3 + f, '#ff9a2a'); cardRect(g, 5, 12, 2, 2, '#ffe27a');
  },
  witch(g, W, H, t) {
    const gy = H - 8;
    cardBall(g, 9, 8, 5, 5, '#ffe9a8'); cardBall(g, 11, 9, 3, 3, '#f0d088');
    for (let i = 0; i < 2; i++) { const x = cardMod(t * 7 + i * 20, W + 10) - 5, y = 6 + i * 7 + Math.round(Math.sin(t * 2 + i) * 2), f = Math.sin(t * 14 + i) > 0; cardRect(g, x, y, 3, 1, '#14081c'); cardRect(g, x - 1, y - (f ? 1 : 0), 1, 1, '#14081c'); cardRect(g, x + 3, y - (f ? 1 : 0), 1, 1, '#14081c'); }
    cardBall(g, W - 7, gy - 3, 4, 3, '#14081c'); cardRect(g, W - 11, gy - 6, 8, 1, '#2a1a38'); g.globalAlpha = 0.5 + 0.2 * Math.sin(t * 4); cardRect(g, W - 10, gy - 6, 6, 1, '#7aff7a'); g.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { const k = (t * 0.7 + i / 3) % 1; g.globalAlpha = 1 - k; cardRect(g, W - 9 + i * 2 + Math.round(Math.sin(t * 3 + i)), gy - 8 - k * 8, 1, 1, '#9aff9a'); g.globalAlpha = 1; }
  },
  beach(g, W, H, t) {
    const gy = H - 8;
    cardBall(g, W - 9, 8, 4, 4, '#fff2a0'); g.globalAlpha = 0.3; cardBall(g, W - 9, 8, 6, 6, '#fff2a0'); g.globalAlpha = 1;
    cardRect(g, 0, 18, W, 6, '#3aa8d8'); cardRect(g, 0, 18, W, 1, '#b8ecf8'); for (let i = 0; i < 5; i++) cardRect(g, cardMod(i * 10 + t * 4, W), 20 + (i * 2) % 4, 3, 1, '#b8ecf8');
    cardRect(g, 5, 10, 2, gy - 10, '#6b4a28'); [[-4, 0], [-2, -2], [2, -2], [4, 0], [0, -3]].forEach(([dx, dy]) => cardRect(g, 6 + dx, 10 + dy + Math.round(Math.sin(t * 2 + dx) * 0.6), 4, 2, '#3f8a4a'));
    cardRect(g, cardMod(t * 5, W + 8) - 4, 4 + Math.round(Math.sin(t * 2) * 1), 2, 1, '#ffffff');
  },
  gold(g, W, H, t) {
    const gy = H - 8;
    cardRect(g, W - 13, gy - 5, 11, 5, '#6b4128'); cardRect(g, W - 13, gy - 5, 11, 1, '#e8b030'); cardRect(g, W - 8, gy - 3, 2, 2, '#ffe27a');
    for (let i = 0; i < 5; i++) { cardRect(g, 3 + i * 2, gy - 1 - (i % 2), 2, 1, '#ffd23a'); } cardRect(g, 3, gy - 3, 3, 2, '#e8b030'); cardRect(g, 3, gy - 4, 3, 1, '#ffe27a');
    cardRect(g, 0, 0, 4, gy, '#c9a040'); cardRect(g, 0, 0, 1, gy, '#ffe27a'); cardRect(g, W - 4, 0, 4, gy, '#c9a040'); cardRect(g, W - 1, 0, 1, gy, '#8a6218');
    for (let i = 0; i < 6; i++) if ((t * 0.9 + i * 0.27) % 1 < 0.45) cardSparkle(g, 6 + (i * 9) % (W - 12), 4 + (i * 5) % 20, '#fff6c0');
  },
  ep0(g, W, H, t) {                                                     // Ренесанс: арки, кипариси, пагорби
    const gy = H - 8;
    cardSky(g, W, gy, ['#9fd0f0', '#c8e4f4', '#f4ecd0']);
    cardBall(g, W - 9, 7, 3, 3, '#fff2a0'); [[10, 14], [W - 20, 12]].forEach(([x, y]) => { cardTri(g, x + 2, y, 8, '#2f6b48'); cardRect(g, x + 2, y + 8, 1, 6, '#5a3a20'); });
    cardBall(g, 14, gy, 22, 7, '#7ab868'); cardBall(g, W - 8, gy, 20, 5, '#8ac878');
    [0, W - 5].forEach(x => { cardRect(g, x, 3, 5, gy - 3, '#e8dcc0'); cardRect(g, x, 3, 5, 2, '#f8f0d8'); cardRect(g, x + 4, 3, 1, gy - 3, '#b8aa88'); cardRect(g, x + 1, 5, 1, gy - 5, '#f8f0d8'); });
    cardRect(g, 5, 0, W - 10, 3, '#e8dcc0'); cardRect(g, 5, 3, W - 10, 1, '#b8aa88');
    cardRect(g, W / 2 - 1, 5, 3, 5, '#b02a38'); cardRect(g, W / 2, 6, 1, 2, '#ffd84a');
  },
  ep1(g, W, H, t) {                                                     // Ретро: мемфіс-фігури й магнітофон
    const gy = H - 8;
    cardTri(g, 8, 6, 5, '#3ac8c0'); cardBall(g, W - 9, 9, 3, 3, '#ffd23a'); cardRect(g, 20, 10, 8, 1, '#7a5ad0'); cardRect(g, 22, 11, 2, 1, '#7a5ad0'); cardRect(g, 24, 12, 2, 1, '#7a5ad0'); cardRect(g, 26, 11, 2, 1, '#7a5ad0');
    cardRect(g, 4, 18, 4, 4, '#ff7fa8'); cardRect(g, W - 14, 16, 6, 1, '#3ac8c0');
    cardRect(g, W - 13, gy - 7, 11, 7, '#2a2a36'); cardRect(g, W - 13, gy - 7, 11, 1, '#8a8a98'); cardBall(g, W - 10, gy - 3, 2, 2, '#c8c8d4'); cardBall(g, W - 5, gy - 3, 2, 2, '#c8c8d4');
    const k = Math.floor(t * 6) % 2; cardRect(g, W - 10 + k, gy - 4, 1, 1, '#2a2a36'); cardRect(g, W - 5 + k, gy - 4, 1, 1, '#2a2a36'); cardRect(g, W - 12, gy - 9, 9, 1, '#8a8a98');
  },
  ep2(g, W, H, t) {                                                     // Диско: дзеркальна куля, промені, миготлива підлога
    const gy = H - 8;
    cardSky(g, W, gy, ['#2a0f4a', '#4a1a6a', '#6a2a8a']);
    const sw = Math.round(Math.sin(t * 1.4) * 2); cardRect(g, W / 2 + sw, 0, 1, 5, '#c8c8d4'); cardBall(g, W / 2 + sw, 8, 4, 4, '#d8d8e8'); for (let y = 5; y < 12; y += 2) for (let x = W / 2 + sw - 4; x < W / 2 + sw + 5; x += 2) if (((x + y + Math.floor(t * 5)) & 3) === 0) cardRect(g, x, y, 1, 1, '#ffffff');
    g.save(); g.globalAlpha = 0.16; [['#ff7fd0', 6], ['#7ad0ff', W - 6]].forEach(([c, x], i) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 4, 0); g.lineTo(W / 2 + Math.sin(t * 2 + i * 3) * 10 + 4, gy); g.lineTo(W / 2 + Math.sin(t * 2 + i * 3) * 10 - 6, gy); g.closePath(); g.fill(); }); g.restore();
    for (let y = gy; y < H; y += 4) for (let x = 0; x < W; x += 4) cardRect(g, x, y, 4, 4, ['#ff4f8a', '#4fc0f0', '#ffd23a', '#7a4ad0'][((x >> 2) + (y >> 2) + Math.floor(t * 3)) & 3]);
  },
  ep3(g, W, H, t) {                                                     // Аркада: прибульці рядами, ігровий автомат
    const gy = H - 8;
    cardSky(g, W, gy, ['#0a0a28', '#14143c', '#1c1c50']);
    const ox = Math.round(Math.sin(t * 1.2) * 3), fr = Math.floor(t * 2) & 1;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const x = 5 + c * 8 + ox, y = 3 + r * 6, col = r ? '#4aff8a' : '#ff4ad8'; cardRect(g, x + 1, y, 5, 1, col); cardRect(g, x, y + 1, 7, 2, col); cardRect(g, x + 1, y + 1, 1, 1, '#0a0a28'); cardRect(g, x + 5, y + 1, 1, 1, '#0a0a28'); cardRect(g, x + (fr ? 0 : 1), y + 3, 2, 1, col); cardRect(g, x + (fr ? 5 : 4), y + 3, 2, 1, col); }
    cardRect(g, W - 13, gy - 14, 11, 14, '#3a2a8a'); cardRect(g, W - 12, gy - 13, 9, 6, '#10102a'); cardRect(g, W - 11, gy - 12, 3, 1, '#4aff8a'); cardRect(g, W - 7, gy - 10, 2, 2, '#ff4a4a'); cardRect(g, W - 12, gy - 5, 9, 1, '#ffd23a'); cardRect(g, W - 13, gy - 14, 11, 1, '#7a6ae0');
    for (let x = 0; x < W; x += 6) cardRect(g, x, gy + 3, 3, 1, '#4a4aa8');
  },
  ep4(g, W, H, t) {                                                     // Інтернет: вікно браузера, Wi-Fi, курсор
    const gy = H - 8;
    cardSky(g, W, gy, ['#1a2a5a', '#2a4a8a', '#4a74b8']);
    cardRect(g, 3, 3, W - 6, 15, '#e8f0fa'); cardRect(g, 3, 3, W - 6, 3, '#4a74b8'); cardRect(g, 5, 4, 1, 1, '#ff6a6a'); cardRect(g, 7, 4, 1, 1, '#ffd23a'); cardRect(g, 9, 4, 1, 1, '#7ae08a');
    const lw = Math.round((t * 0.5 % 1) * (W - 14)); cardRect(g, 6, 10, W - 12, 2, '#c8d4e8'); cardRect(g, 6, 10, lw, 2, '#4aa8ff'); cardRect(g, 6, 14, 14, 1, '#c8d4e8'); cardRect(g, 6, 16, 9, 1, '#c8d4e8');
    for (let a = 1; a <= 3; a++) if (Math.floor(t * 3) % 4 >= a - 1) cardRect(g, W - 12 - a, 21 - a * 2, a * 2 + 1, 1, '#9fe4ff');
    cardRect(g, W - 12, 22, 1, 1, '#9fe4ff');
    const cx = 18 + Math.round(Math.sin(t * 1.5) * 6); cardRect(g, cx, 12, 1, 4, '#101828'); cardRect(g, cx + 1, 13, 1, 2, '#101828'); cardRect(g, cx + 2, 14, 1, 1, '#101828');
  },
  ep5(g, W, H, t) {                                                     // Еко: вітряк і сонячна панель на пагорбах
    const gy = H - 8;
    cardBall(g, 10, gy + 2, 18, 7, '#7ab868'); cardBall(g, W - 6, gy + 3, 16, 6, '#5aa85a');
    cardRect(g, W - 12, 8, 1, gy - 8, '#e8f0f0'); const a = t * 2.4;
    for (let k = 0; k < 3; k++) { const an = a + k * 2.094; for (let r = 1; r < 8; r++) cardRect(g, W - 12 + Math.cos(an) * r, 8 + Math.sin(an) * r, 1, 1, '#ffffff'); }
    cardRect(g, W - 13, 7, 3, 3, '#c8d0d8');
    cardRect(g, 4, gy - 5, 8, 4, '#2a4a8a'); cardRect(g, 4, gy - 5, 8, 1, '#6a9ae0'); cardRect(g, 8, gy - 1, 1, 3, '#555'); for (let x = 5; x < 12; x += 2) cardRect(g, x, gy - 4, 1, 3, '#4a74b8');
    cardBall(g, W - 4, 5, 2, 2, '#fff2a0');
  },
  ep6(g, W, H, t) {                                                     // Космос: величезна Земля, супутник
    const gy = H - 8;
    cardStars(g, W, t, 14, gy - 4);
    cardBall(g, 6, gy + 6, 16, 16, '#2a68b8'); cardRect(g, 0, gy - 6, 8, 2, '#4fa860'); cardRect(g, 3, gy - 3, 7, 2, '#4fa860'); cardRect(g, 9, gy - 8, 3, 1, '#e8f4ff');
    const sx = cardMod(t * 4, W + 14) - 7, sy = 8 + Math.round(Math.sin(t)); cardRect(g, sx, sy, 4, 3, '#c8c8d4'); cardRect(g, sx - 5, sy, 4, 3, '#3a68c8'); cardRect(g, sx + 5, sy, 4, 3, '#3a68c8'); if (Math.floor(t * 4) & 1) cardRect(g, sx + 1, sy - 1, 1, 1, '#ff6a6a');
  },
  ep7(g, W, H, t) {                                                     // Неон: смугасте сонце й сітка до горизонту
    const gy = H - 8, hz = gy - 6;
    for (let y = 0; y < 12; y++) { const w = Math.round(Math.sqrt(144 - (y - 12) * (y - 12))); if (y % 3 !== 2 || y < 5) cardRect(g, W / 2 - w, hz - 12 + y, w * 2, 1, y < 6 ? '#ffd23a' : y < 9 ? '#ff7a4a' : '#ff3a9a'); }
    cardRect(g, 0, hz, W, 1, '#4ad8ff');
    for (let i = -4; i <= 4; i++) for (let y = hz + 1; y < H; y++) cardRect(g, W / 2 + i * (7 + (y - hz) * 1.6), y, 1, 1, '#ff4ad8');
    for (let y = hz + 3 + Math.round(cardMod(t * 4, 3)) - 3; y < H; y += 3) if (y > hz) cardRect(g, 0, y, W, 1, '#4ad8ff');
  },
  wizard(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#1a1040', '#2a1a5c', '#3d2a7a']); cardStars(g, W, t, 12, gy - 8);
    [[6, 6], [W - 9, 10], [W / 2, 4]].forEach(([x, y], i) => { const yy = y + Math.round(Math.sin(t * 1.6 + i * 2)); cardRect(g, x, yy, 4, 3, ['#b02a38', '#2a5ab0', '#2a8a4a'][i]); cardRect(g, x, yy, 4, 1, '#ffe27a'); });
    cardRect(g, W - 12, gy - 4, 6, 4, '#4a3a6a'); g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3); cardBall(g, W - 9, gy - 8, 4, 4, '#c8a0ff'); g.globalAlpha = 1; cardBall(g, W - 9, gy - 8, 3, 3, '#7a5ad0'); cardRect(g, W - 10, gy - 9, 1, 1, '#ffffff');
    [[4, gy - 3], [9, gy - 2]].forEach(([x, y], i) => { cardRect(g, x, y, 2, 3, '#f4ead0'); cardRect(g, x, y - 1 - (Math.sin(t * 8 + i) > 0 ? 1 : 0), 1, 2, '#ffb02a'); });
  },
  chef(g, W, H, t) {
    const gy = H - 8;
    cardRect(g, 0, 0, W, gy, '#f4f0e6'); for (let x = 0; x < W; x += 6) cardRect(g, x, 0, 1, gy, '#d8d0c0'); for (let y = 0; y < gy; y += 6) cardRect(g, 0, y, W, 1, '#d8d0c0');
    cardRect(g, 2, 8, 14, 2, '#8a5a38'); cardRect(g, 3, 3, 5, 5, '#8a929c'); cardRect(g, 3, 3, 5, 1, '#c8d0d8'); cardRect(g, 10, 4, 4, 4, '#c8503a');
    [W - 14, W - 9, W - 4].forEach((x, i) => { cardRect(g, x, 0, 1, 4 + i, '#8a929c'); cardRect(g, x - 1, 4 + i, 3, 3, '#c8d0d8'); });
    cardRect(g, 0, gy - 2, W, 2, '#d8b078'); cardRect(g, W - 11, gy - 8, 9, 6, '#5a5a66'); cardRect(g, W - 11, gy - 8, 9, 1, '#8a8a98');
    for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; g.globalAlpha = Math.sin(k * Math.PI) * 0.7; cardBall(g, W - 8 + Math.round(Math.sin(t * 2 + i)), Math.round(gy - 10 - k * 10), 2, 1, '#ffffff'); g.globalAlpha = 1; }
  },
  explorer(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#7ec8a8', '#5aa878', '#3f8a5a']);
    [0, W - 9].forEach((x, i) => { for (let k = 0; k < 4; k++) { cardRect(g, x + (i ? 8 - k * 2 : k * 2), k * 2, 8, 2, '#2f6b48'); cardRect(g, x + (i ? 8 - k * 2 : k * 2), k * 2, 8, 1, '#4f9a63'); } });
    cardRect(g, W - 13, gy - 12, 10, 12, '#9a9684'); cardRect(g, W - 13, gy - 12, 10, 2, '#b8b4a0'); cardRect(g, W - 10, gy - 8, 4, 4, '#4a4638'); cardRect(g, W - 9, gy - 7, 2, 2, '#e8c040');
    for (let i = 0; i < 4; i++) cardRect(g, 10 + i * 6 + Math.round(Math.sin(t * 1.5 + i)), 6, 1, 6 + (i % 2) * 3, '#2f6b48');
    cardRect(g, 4, gy - 3, 3, 3, '#e8c040'); cardRect(g, 4, gy - 3, 3, 1, '#fff0a0');
  },
  detective(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#14182a', '#1e2438', '#2a3248']); cardBall(g, W - 9, 7, 3, 3, '#e8e4c8');
    [[0, 14, 8], [9, 9, 7], [W - 12, 12, 9], [W - 5, 16, 6]].forEach(([x, y, w], i) => { cardRect(g, x, y, w, gy - y, '#0e1220'); for (let r = y + 2; r < gy - 2; r += 4) for (let c = x + 1; c < x + w - 1; c += 3) if ((r + c + i + Math.floor(t * 0.3)) % 3) cardRect(g, c, r, 1, 2, '#ffd860'); });
    cardRect(g, W / 2, 10, 1, gy - 10, '#3a4258'); g.globalAlpha = 0.35 + 0.1 * Math.sin(t * 4); cardBall(g, W / 2, 10, 6, 5, '#ffe27a'); g.globalAlpha = 1; cardRect(g, W / 2 - 1, 9, 3, 2, '#fff4c0');
    g.globalAlpha = 0.25; for (let i = 0; i < 3; i++) cardRect(g, cardMod(i * 17 + t * 3, W + 20) - 10, 16 + i * 5, 20, 3, '#a8b0c8'); g.globalAlpha = 1;
  },
  sailor(g, W, H, t) {
    const gy = H - 8;
    cardRect(g, 0, 15, W, gy - 15, '#2e78a8'); cardRect(g, 0, 15, W, 1, '#8fd0f0'); for (let i = 0; i < 6; i++) cardRect(g, cardMod(i * 9 + t * 5, W), 18 + (i * 3) % 9, 3, 1, '#8fd0f0');
    cardRect(g, W - 9, 2, 5, 12, '#f4f0e0'); cardRect(g, W - 9, 6, 5, 2, '#d23a3a'); cardRect(g, W - 9, 10, 5, 2, '#d23a3a'); cardRect(g, W - 10, 0, 7, 3, '#3a3a46'); cardRect(g, W - 8, 1, 3, 1, '#ffe27a');
    g.save(); g.globalAlpha = 0.2 + 0.1 * Math.sin(t * 2); g.fillStyle = '#fff2a0'; g.beginPath(); g.moveTo(W - 7, 2); g.lineTo(W - 28, Math.sin(t) * 3); g.lineTo(W - 28, 8 + Math.sin(t) * 3); g.closePath(); g.fill(); g.restore();
    cardRect(g, 4, 6, 1, 7, '#3a3a46'); cardRect(g, 2, 7, 5, 1, '#3a3a46'); cardRect(g, 2, 12, 2, 1, '#3a3a46'); cardRect(g, 5, 12, 2, 1, '#3a3a46');
    cardRect(g, cardMod(t * 5, W + 8) - 4, 4 + Math.round(Math.sin(t * 2)), 2, 1, '#ffffff');
  },
  flower(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#cfe8f8', '#e4f2f8', '#f4f8e8']);
    cardBall(g, 10, 8, 5, 3, '#ffffff'); cardBall(g, 16, 7, 4, 3, '#ffffff'); cardBall(g, W - 12, 12, 5, 2, '#ffffff');
    for (let x = 2; x < W; x += 6) { const h = 5 + (x * 7) % 5, sw = Math.round(Math.sin(t * 1.5 + x)); cardRect(g, x, gy - h, 1, h + 1, '#3f8a4a'); cardRect(g, x - 1 + sw, gy - h - 2, 3, 3, ['#ff7fa8', '#ffd23a', '#ffffff', '#b07aff'][(x / 6 | 0) % 4]); cardRect(g, x + sw, gy - h - 1, 1, 1, '#ffe27a'); }
    const bx = cardMod(t * 10, W + 10) - 5, by = 14 + Math.round(Math.sin(t * 6) * 2); cardRect(g, bx, by, 2, 1, '#ffd23a'); cardRect(g, bx, by + 1, 2, 1, '#3a2a1a'); cardRect(g, bx - 1, by - 1, 1, 1, '#ffffff'); cardRect(g, bx + 2, by - 1, 1, 1, '#ffffff');
  },
  autumn(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#f4b86a', '#f8d090', '#fce4b8']);
    cardRect(g, 6, 10, 3, gy - 10, '#6b4128'); cardBall(g, 7, 8, 8, 5, '#d9602a'); cardBall(g, 4, 11, 4, 3, '#e8a030'); cardBall(g, 11, 11, 4, 3, '#b8402a');
    cardBall(g, W - 7, gy - 2, 4, 3, '#e8863c'); cardRect(g, W - 7, gy - 5, 1, 2, '#3a7a3a'); cardRect(g, W - 17, gy - 3, 6, 3, '#e8863c'); cardRect(g, W - 15, gy - 5, 1, 2, '#3a7a3a');
    cardRect(g, 0, gy - 4, 1, 4, '#8a5a38'); cardRect(g, 0, gy - 3, 22, 1, '#8a5a38');
    for (let i = 0; i < 7; i++) cardRect(g, cardMod(i * 7 + Math.sin(t * 1.5 + i) * 4, W), cardMod(i * 6 + t * 7, gy), 2, 1, ['#d9602a', '#e8a030', '#b8402a'][i % 3]);
  },
  mel(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#4a3a7a', '#a8587a', '#f4965a']);
    [[3, 9], [W - 13, 12], [W - 6, 8]].forEach(([x, h]) => cardTri(g, x + 3, gy - h - 3, h, '#1a2a2a'));
    cardBall(g, W - 17, 6, 3, 3, '#fff0c0');
    const f = Math.sin(t * 9) > 0 ? 1 : 0; cardRect(g, 12, gy - 1, 5, 1, '#3a2a1a'); cardRect(g, 13, gy - 4 - f, 3, 4 + f, '#ff9a2a'); cardRect(g, 14, gy - 3, 1, 2, '#ffe27a'); g.globalAlpha = 0.25; cardBall(g, 14, gy - 3, 7, 5, '#ff9a2a'); g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) { const k = (t * 0.6 + i * 0.25) % 1; g.globalAlpha = 1 - k; cardRect(g, 13 + i + Math.round(Math.sin(t * 3 + i) * 2), gy - 6 - k * 12, 1, 1, '#ffd23a'); g.globalAlpha = 1; }
  },
  nika(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#ffd0e4', '#ffe0ee', '#fff0f6']);
    for (let i = 0; i < 6; i++) { const col = ['#ff6a6a', '#ffb03a', '#ffe23a', '#7ae08a', '#5ab0ff', '#b07aff'][i]; for (let a = 0; a <= 12; a++) { const an = Math.PI * a / 12; cardRect(g, W / 2 + Math.cos(an) * (16 - i), gy - 2 - Math.sin(an) * (13 - i), 1, 1, col); } }
    [[4, 8], [W - 11, 6]].forEach(([x, y], i) => { const dx = cardMod(x + t * 2 + i * 8, W + 14) - 7; cardBall(g, dx, y, 4, 2, '#ffffff'); cardBall(g, dx + 3, y - 1, 3, 2, '#ffffff'); });
    for (let i = 0; i < 3; i++) { const k = (t * 0.3 + i / 3) % 1, x = 8 + i * 14, y = gy - 4 - k * 18; cardRect(g, x - 2, y, 2, 2, '#ff7fa8'); cardRect(g, x + 1, y, 2, 2, '#ff7fa8'); cardRect(g, x - 2, y + 1, 5, 1, '#ff7fa8'); cardRect(g, x - 1, y + 2, 3, 1, '#ff7fa8'); }
    for (let x = 3; x < W; x += 7) { cardRect(g, x, gy - 3, 1, 3, '#4fa860'); cardRect(g, x - 1, gy - 5, 3, 2, ['#ff7fa8', '#ffffff'][(x / 7 | 0) % 2]); }
  },
  hero(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#4aa8ff', '#7ac4ff', '#bfe4ff']);
    [[0, 14, 7, '#3a4a68'], [7, 10, 6, '#4a5a78'], [W - 13, 12, 7, '#3a4a68'], [W - 6, 16, 6, '#4a5a78']].forEach(([x, y, w, c]) => { cardRect(g, x, y, w, gy - y, c); for (let r = y + 2; r < gy - 1; r += 3) for (let k = x + 1; k < x + w - 1; k += 2) cardRect(g, k, r, 1, 1, '#bfe4ff'); });
    cardTri(g, W / 2, 3, 4, '#ff5a5a'); cardRect(g, W / 2 - 1, 5, 3, 1, '#ffd84a'); g.globalAlpha = 0.35; cardRect(g, W / 2 - 5, 3, 11, 1, '#ffffff'); g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) cardRect(g, cardMod(t * 40 + i * 13, W + 20) - 10, 6 + i * 5, 8, 1, '#ffffff');
  },
  cowboy(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#6a3a7a', '#e8683c', '#ffb85a']); cardBall(g, W / 2, gy - 3, 7, 5, '#ffe9a8');
    cardRect(g, 2, gy - 9, 10, 9, '#a8502a'); cardRect(g, 2, gy - 9, 10, 1, '#d0703a'); cardRect(g, 5, gy - 11, 6, 2, '#a8502a'); cardRect(g, W - 12, gy - 6, 8, 6, '#a8502a');
    cardRect(g, W - 7, gy - 8, 2, 6, '#3f6a3a'); cardRect(g, W - 9, gy - 6, 2, 1, '#3f6a3a'); cardRect(g, W - 9, gy - 8, 1, 3, '#3f6a3a'); cardRect(g, W - 5, gy - 7, 1, 3, '#3f6a3a');
    const tx = cardMod(t * 8, W + 10) - 5; cardBall(g, tx, gy + 1, 2, 2, '#8a6a3a'); cardRect(g, tx - 1, gy, 3, 1, '#c09a5a');
  },
  fairy(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#3a2a6a', '#6a4a9a', '#a87ac8']);
    cardBall(g, 9, 7, 4, 4, '#fff6d0'); cardBall(g, 11, 6, 3, 3, '#6a4a9a');
    cardRect(g, W - 11, gy - 8, 3, 8, '#f4ead0'); cardBall(g, W - 9, gy - 9, 7, 3, '#ff7fa8'); cardRect(g, W - 12, gy - 10, 1, 1, '#ffffff'); cardRect(g, W - 8, gy - 11, 2, 1, '#ffffff'); cardRect(g, W - 6, gy - 9, 1, 1, '#ffffff');
    for (let i = 0; i < 8; i++) { const a = (t * 0.6 + i * 0.13) % 1; g.globalAlpha = Math.sin(a * Math.PI); cardRect(g, 4 + (i * 11) % (W - 8) + Math.sin(t + i) * 3, 8 + (i * 7) % 22, 1, 1, ['#ffe27a', '#9fe8ff', '#ff9fe0'][i % 3]); g.globalAlpha = 1; }
  },
  viking(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#8fb0c8', '#b0cade', '#d0e2ee']);
    g.globalAlpha = 0.35; for (let x = 0; x < W; x++) cardRect(g, x, 5 + Math.sin(x * 0.25 + t) * 2, 1, 6, '#6aff9a'); g.globalAlpha = 1;
    cardTri(g, 10, 8, 14, '#5a6a86'); cardTri(g, 10, 8, 4, '#ffffff'); cardTri(g, W - 10, 12, 11, '#4a5a76'); cardTri(g, W - 10, 12, 3, '#ffffff');
    cardRect(g, 0, gy - 4, W, 4, '#3a6a98'); for (let i = 0; i < 4; i++) cardRect(g, cardMod(i * 12 + t * 4, W), gy - 3 + (i % 2), 3, 1, '#8fd0f0');
    cardBall(g, W - 6, gy - 6, 4, 4, '#a07838'); cardBall(g, W - 6, gy - 6, 1, 1, '#d8d8e0'); cardRect(g, W - 10, gy - 7, 8, 1, '#d23a3a');
  },
  pilot(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#5aa8f0', '#8ac8f8', '#c8e8fc']); cardBall(g, 9, 7, 3, 3, '#fff2a0');
    [[2, 12], [W - 14, 8], [W - 8, 20]].forEach(([x, y], i) => { const dx = cardMod(x + t * (2 + i), W + 16) - 8; cardBall(g, dx, y, 5, 2, '#ffffff'); cardBall(g, dx + 4, y - 1, 4, 2, '#ffffff'); });
    const px = cardMod(t * 9, W + 24) - 12, py = 6 + Math.round(Math.sin(t * 2)); cardRect(g, px, py + 2, 9, 3, '#d23a3a'); cardRect(g, px + 1, py, 7, 1, '#e8b030'); cardRect(g, px + 1, py + 6, 7, 1, '#e8b030'); cardRect(g, px + 9, py + 2, 1, 3, '#555'); if (Math.floor(t * 20) & 1) cardRect(g, px + 10, py + 1, 1, 5, '#cccccc'); cardRect(g, px - 2, py + 3, 2, 1, '#ffffff');
  },
  diamond(g, W, H, t) {
    const gy = H - 8;
    cardSky(g, W, gy, ['#0c2a44', '#12405e', '#164c72']);
    [[3, 10, 6], [11, 5, 9], [W - 15, 8, 8], [W - 7, 12, 6]].forEach(([x, y, h]) => { cardTri(g, x + 2, y, h, '#58b8dc'); cardRect(g, x + 2, y + 1, 1, h - 2, '#e0f8ff'); cardTri(g, x + 2, y, Math.max(3, h - 3), '#7fd6f0'); });
    for (let i = 0; i < 7; i++) if ((t * 1.1 + i * 0.29) % 1 < 0.45) cardSparkle(g, 3 + (i * 13) % (W - 6), 3 + (i * 7) % 22, '#ffffff');
  }
};
