//#part 200_b_warp_epoch_animations.js
// ===== Анімації подорожі під кожну епоху (за епохою, КУДИ ми потрапляємо) =====
function warpPix(g, snap, W, H, b) {                             // знімок сцени, укрупнений до блоків b×b
  if (!warp.px) warp.px = document.createElement('canvas');
  const pw = Math.max(1, Math.ceil(W / b)), ph = Math.max(1, Math.ceil(H / b));
  warp.px.width = pw; warp.px.height = ph;
  const pg = warp.px.getContext('2d'); pg.imageSmoothingEnabled = false; pg.drawImage(snap, 0, 0, pw, ph);
  g.imageSmoothingEnabled = false; g.drawImage(warp.px, 0, 0, pw, ph, 0, 0, pw * b, ph * b);
}
function warpCapy(g, x, y, s, rot, a) {                           // Капі в центрі подорожі
  const cs = getSpriteCanvas(capySprite()), w = cs.width * s, h = cs.height * s;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.drawImage(cs, -w / 2, -h / 2, w, h); g.restore(); g.globalAlpha = 1;
}
function warpFont(g, px) { g.font = Math.max(6, Math.round(px)) + 'px "Press Start 2P", monospace'; }
function warpText(g, txt, x, y, col, sh) { g.fillStyle = sh || '#000'; g.fillText(txt, x + 1, y + 1); g.fillStyle = col; g.fillText(txt, x, y); }

// Диско: дзеркальна куля, промені, танцпол із плитками, що міняють колір під ритм; нова епоха проступає хвилею плиток
function drawWarpDisco(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2;
  const ka = seg(k, 0, 0.22), kt = seg(k, 0.08, 0.74), kr = seg(k, 0.74, 1), beat = Math.floor(k * 24), cols = ['#ff4fa8', '#4fd8ff', '#ffd84f', '#8f5fff'];
  g.drawImage(warp.snap, 0, 0);
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1a0638'); bg.addColorStop(1, '#4a0f5c');
  g.globalAlpha = ez(ka); g.fillStyle = bg; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  const fy = H * 0.64, T = Math.max(8, 15 * sc * 0.6), nr = Math.ceil((H - fy) / T), nc = Math.ceil(W / T);
  for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) { g.globalAlpha = (0.5 + 0.3 * ((r + c + beat) % 2)) * kt; g.fillStyle = cols[(r * 3 + c * 2 + beat) % 4]; g.fillRect(Math.round(c * T), Math.round(fy + r * T), Math.ceil(T - 1), Math.ceil(T - 1)); }
  const R = Math.min(W, H) * 0.17, by = -R + (H * 0.04 + R + H * 0.18) * ez(seg(k, 0.08, 0.34)) + Math.sin(k * 24) * sc * 0.4;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {                                                     // промені прожекторів гойдаються
    const an = Math.PI / 2 + Math.sin(k * 9 + i * 1.3) * 0.7 + (i - 3) * 0.3, hw = 0.1;
    g.globalAlpha = 0.2 * kt; g.fillStyle = cols[i % 4]; g.beginPath(); g.moveTo(cx, by); g.lineTo(cx + Math.cos(an - hw) * diag * 1.2, by + Math.sin(an - hw) * diag * 1.2); g.lineTo(cx + Math.cos(an + hw) * diag * 1.2, by + Math.sin(an + hw) * diag * 1.2); g.closePath(); g.fill();
  }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = kt;
  g.strokeStyle = '#d8d8f0'; g.lineWidth = Math.max(1, sc * 0.6); g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, by - R); g.stroke();
  const gr = g.createRadialGradient(cx - R * 0.35, by - R * 0.35, R * 0.1, cx, by, R); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#b8b8d8'); gr.addColorStop(1, '#5a5a86');
  g.fillStyle = gr; g.beginPath(); g.arc(cx, by, R, 0, 7); g.fill();
  for (let i = 0; i < 70; i++) {                                                    // дзеркальні квадратики мерехтять
    const a = warpSeed(i) * Math.PI * 2, rr = Math.sqrt(warpSeed(i + 5)) * R * 0.92, on = warpSeed(i + beat * 3) > 0.45;
    g.fillStyle = on ? cols[(i + beat) % 4] : '#ffffff'; g.globalAlpha = kt * (on ? 1 : 0.55); const s2 = Math.max(1.5, R * 0.1); g.fillRect(Math.round(cx + Math.cos(a) * rr - s2 / 2), Math.round(by + Math.sin(a) * rr - s2 / 2), s2, s2);
  }
  g.globalAlpha = kt;
  for (let i = 0; i < 26; i++) {                                                    // блиски-хрестики
    const px = warpSeed(i + 40) * W, py = warpSeed(i + 70) * H * 0.7, on = (Math.floor(k * 18) + i) % 5 < 2; if (!on) continue; const s2 = (1.5 + warpSeed(i) * 2.5) * sc * 0.6;
    g.fillStyle = '#fff'; g.fillRect(px - s2, py - 0.5, s2 * 2, 1); g.fillRect(px - 0.5, py - s2, 1, s2 * 2);
  }
  g.globalAlpha = 1;
  warpCapy(g, cx, H * 0.84 - Math.abs(Math.sin(k * 26)) * 4 * sc, sc * 1.5, Math.sin(k * 13) * 0.22, seg(k, 0.2, 0.34) * (1 - seg(k, 0.68, 0.74)));
  if (kr > 0) {                                                                     // хвиля плиток від центру відкриває нову епоху
    const B = Math.max(7, Math.round(12 * sc * 0.6)), e = ez(kr) * 1.2;
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let y = 0; y < H; y += B) for (let x = 0; x < W; x += B) { const d = Math.hypot(x + B / 2 - cx, y + B / 2 - H / 2) / (diag / 2); if (d < e) g.fillRect(x, y, B - (d > e - 0.12 ? 3 : 0), B - (d > e - 0.12 ? 3 : 0)); }
    g.restore();
  }
}

// Аркади: сцена перетворюється на великі пікселі, марширують прибульці, падає монетка, «LEVEL UP!»; нова епоха розсипається зверху вниз
const WARP_INV = ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'];
function drawWarpArcade(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2;
  const kp = seg(k, 0, 0.3), kt = seg(k, 0.26, 0.74), kr = seg(k, 0.74, 1), n2 = (warp.toEpoch || 0) + 1;
  g.fillStyle = '#04030c'; g.fillRect(0, 0, W, H);
  if (kp < 1) { g.globalAlpha = 1 - ez(Math.max(0, kp - 0.4) / 0.6); warpPix(g, warp.snap, W, H, Math.max(1, Math.round(1 + ez(kp) * 15 * sc * 0.6))); g.globalAlpha = 1; }
  for (let i = 0; i < 40; i++) { g.globalAlpha = 0.3 + 0.5 * warpSeed(i + Math.floor(k * 8)); g.fillStyle = '#fff'; g.fillRect(Math.round(warpSeed(i) * W), Math.round(((warpSeed(i + 9) * H) + k * H * (0.5 + warpSeed(i + 3))) % H), 1, 1); }
  g.globalAlpha = 1;
  const p = Math.max(2, Math.round(2.2 * sc * 0.7)), iw = 11 * p, gap = p * 4, step = Math.floor(k * 12) % 2, shift = Math.sin(k * 11) * W * 0.12;
  const cols = ['#ff5a5a', '#ffd84f', '#7aff7a'];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {                          // прибульці марширують і спускаються
    const x = cx - (4 * iw + 3 * gap) / 2 + c * (iw + gap) + shift, y = H * 0.12 + r * (8 * p + p * 3) + ez(kt) * H * 0.12, dead = warpSeed(r * 7 + c) < ez(seg(k, 0.3, 0.5)) * 1.1;
    if (dead || kt <= 0) continue; g.fillStyle = cols[r];
    WARP_INV.forEach((row, ry) => { for (let rx = 0; rx < 11; rx++) if (row[rx] === '1') g.fillRect(Math.round(x + rx * p + (ry === 7 && step ? (rx < 5 ? -p : p) : 0)), Math.round(y + ry * p), p, p); });
  }
  const shipX = cx + Math.sin(k * 9) * W * 0.3, shipY = H * 0.9;                       // кораблик Капі стріляє вгору
  if (kt > 0) {
    g.fillStyle = '#7ad8ff'; g.fillRect(Math.round(shipX - 3 * p), Math.round(shipY), 6 * p, p * 2); g.fillRect(Math.round(shipX - p), Math.round(shipY - p * 2), p * 2, p * 2);
    for (let i = 0; i < 4; i++) { const f = ((k * 5 + i / 4) % 1); g.fillStyle = '#fff'; g.fillRect(Math.round(shipX - p / 2 + Math.sin((k * 9 + i) * 0.9) * 0), Math.round(shipY - f * H * 0.8), Math.max(1, Math.round(p * 0.7)), p * 2); }
  }
  g.textAlign = 'center'; g.textBaseline = 'middle'; warpFont(g, 7 * sc);
  const blink = Math.floor(k * 10) % 2;
  if (kt > 0 && k < 0.5 && blink) { g.globalAlpha = 1; warpText(g, 'INSERT COIN', cx, H * 0.52, '#ffe08a'); }
  const cy = -10 + ez(seg(k, 0.3, 0.46)) * (H * 0.52 + 10);                             // монетка падає в приймач
  if (k > 0.3 && k < 0.47) { g.fillStyle = '#ffd84f'; g.beginPath(); g.ellipse(cx, cy, p * 2.2 * Math.abs(Math.cos(k * 30)) + 1, p * 2.4, 0, 0, 7); g.fill(); g.fillStyle = '#fff6b0'; g.fillRect(cx - 1, cy - p, 2, p); }
  if (k > 0.5) { const f = seg(k, 0.5, 0.58); warpFont(g, 9 * sc * (0.6 + 0.4 * ez(f))); if (Math.floor(k * 14) % 2 || k > 0.7) warpText(g, 'LEVEL UP!', cx, H * 0.5, '#7aff7a'); warpFont(g, 5.5 * sc); warpText(g, 'STAGE ' + n2, cx, H * 0.5 + 11 * sc, '#ffe08a'); }
  g.textAlign = 'left'; warpFont(g, 5.5 * sc); warpText(g, 'SCORE ' + String(Math.floor(k * 98000)).padStart(6, '0'), 5 * sc, 6 * sc, '#fff');
  g.fillStyle = '#000'; g.globalAlpha = 0.22; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1); g.globalAlpha = 1;
  if (kr > 0) {                                                                    // розсипається пікселями зверху вниз
    const B = Math.max(5, Math.round(9 * sc * 0.6)), cc = Math.ceil(W / B), rr = Math.ceil(H / B), e = ez(kr) * 1.3;
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let yy = 0; yy < rr; yy++) for (let xx = 0; xx < cc; xx++) if (warpSeed(yy * cc + xx) * 0.45 + (yy / rr) * 0.55 < e - 0.12) g.fillRect(xx * B, yy * B, B, B);
    g.restore();
  }
}

// Інтернет: цифровий дощ, спливаючі вікна, смуга завантаження; сторінка нової епохи вантажиться зліва направо
function drawWarpNet(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2;
  const kf = seg(k, 0, 0.22), kt = seg(k, 0.1, 0.74), kr = seg(k, 0.74, 1);
  g.fillStyle = '#04141a'; g.fillRect(0, 0, W, H);
  if (kf < 1) { g.globalAlpha = 1 - ez(kf); for (let y = 0; y < H; y += 3) { const off = Math.round(Math.sin(y * 0.5 + k * 60) * kf * 10 * (warpSeed(y + Math.floor(k * 20)) > 0.6 ? 2 : 0.2)); g.drawImage(warp.snap, 0, y, W, 3, off, y, W, 3); } g.globalAlpha = 1; }
  const cw = Math.max(5, 6 * sc * 0.7), nc = Math.ceil(W / cw); warpFont(g, cw * 1.1); g.textAlign = 'center'; g.textBaseline = 'top';
  for (let c = 0; c < nc; c++) {                                                   // цифровий дощ
    const sp = 0.6 + warpSeed(c) * 1.2, head = ((warpSeed(c + 7) + k * sp) % 1.35) * H * 1.35 - H * 0.1;
    for (let j = 0; j < 9; j++) { const y = head - j * cw * 1.2; if (y < -cw || y > H) continue; g.globalAlpha = (1 - j / 9) * 0.85 * kt; g.fillStyle = j === 0 ? '#e6fff4' : '#2ee69a'; g.fillText(warpSeed(c * 13 + j + Math.floor(k * 9)) > 0.5 ? '1' : '0', c * cw + cw / 2, y); }
  }
  g.globalAlpha = 1;
  const nw = 7, ww = Math.max(36, W * 0.36), wh = Math.max(24, 24 * sc * 0.9);
  for (let i = 0; i < nw; i++) {                                                   // вікна «реклами» вискакують одне за одним
    const t0 = 0.14 + i * 0.065, f = seg(k, t0, t0 + 0.05) * (1 - seg(k, 0.68, 0.74)); if (f <= 0) continue;
    const x = Math.round(W * 0.06 + warpSeed(i + 21) * (W - ww - W * 0.12)), y = Math.round(H * 0.08 + warpSeed(i + 31) * (H * 0.62 - wh)), s2 = 0.6 + 0.4 * ez(f);
    g.save(); g.translate(x + ww / 2, y + wh / 2); g.scale(s2, s2); g.globalAlpha = Math.min(1, f * 1.5);
    g.fillStyle = '#1b2a44'; g.fillRect(-ww / 2 - 1, -wh / 2 - 1, ww + 2, wh + 2); g.fillStyle = '#e8edf6'; g.fillRect(-ww / 2, -wh / 2, ww, wh);
    g.fillStyle = ['#2a55d8', '#d84a6a', '#2aa56a'][i % 3]; g.fillRect(-ww / 2, -wh / 2, ww, wh * 0.28);
    g.fillStyle = '#fff'; g.fillRect(ww / 2 - wh * 0.26, -wh / 2 + wh * 0.05, wh * 0.18, wh * 0.18);
    g.fillStyle = '#8a95ad'; for (let l = 0; l < 3; l++) g.fillRect(-ww / 2 + 3, -wh / 2 + wh * (0.4 + l * 0.18), ww * (0.8 - l * 0.2), Math.max(1, wh * 0.07));
    g.restore();
  }
  g.globalAlpha = 1;
  const bw = W * 0.7, bh = Math.max(7, 9 * sc * 0.7), bx = cx - bw / 2, by = H * 0.8, pr = ez(seg(k, 0.12, 0.74)) * 100;     // смуга завантаження
  g.fillStyle = '#04141a'; g.fillRect(bx - 2, by - 2, bw + 4, bh + 4); g.strokeStyle = '#2ee69a'; g.lineWidth = Math.max(1, sc * 0.6); g.strokeRect(bx, by, bw, bh);
  g.fillStyle = '#2ee69a'; const seg2 = Math.max(3, bh * 0.7); for (let x = 0; x < bw * pr / 100 - seg2; x += seg2 * 1.3) g.fillRect(bx + 2 + x, by + 2, seg2, bh - 4);
  g.textAlign = 'center'; g.textBaseline = 'bottom'; warpFont(g, 5.5 * sc); warpText(g, 'LOADING... ' + Math.floor(pr) + '%', cx, by - 4, '#e6fff4');
  if (kr > 0) {                                                                    // сторінка вантажиться зліва направо
    const e = ez(kr) * (W + 24), B = 4;
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let y = 0; y < H; y += B) g.fillRect(0, y, Math.max(0, e - warpSeed(y / B) * 22), B);
    g.restore();
    g.fillStyle = '#7affd0'; g.globalAlpha = 1 - kr * 0.6; g.fillRect(Math.min(W - 1, e), 0, 2, H); g.globalAlpha = 1;
  }
}

// Еко: вітер здуває сцену, листя й пелюстки закручуються до центру, ліани проростають із країв; нова епоха розцвітає колом
function drawWarpEco(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
  const kw = seg(k, 0, 0.3), kt = seg(k, 0.1, 0.74), kr = seg(k, 0.74, 1);
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#d6f0b8'); bg.addColorStop(1, '#4f9a64'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  if (kw < 1) { g.globalAlpha = 1 - ez(kw); for (let y = 0; y < H; y += 3) g.drawImage(warp.snap, 0, y, W, 3, Math.round(ez(kw) * W * (0.2 + 0.8 * Math.abs(Math.sin(y * 0.2)) ) + ez(kw) * Math.sin(y * 0.3) * 8), y, W, 3); g.globalAlpha = 1; }
  g.globalAlpha = 0.5 * kt; g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, sc * 0.5);
  for (let i = 0; i < 9; i++) { const y = H * (0.1 + 0.1 * i), x0 = ((k * 2.2 + i * 0.37) % 1.4 - 0.2) * W; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + W * 0.1, y - 5 * sc, x0 + W * 0.2, y + 5 * sc, x0 + W * 0.3, y); g.stroke(); }     // лінії вітру
  const leafCols = ['#2f8f4a', '#5fbf5a', '#9fd45a', '#e8b44a', '#e87a4a', '#ff9fc0'];
  for (let i = 0; i < 64; i++) {                                                   // листя й пелюстки по спіралі до центру
    const f = (i / 64 + k * 1.1) % 1, r = (1 - f) * diag * 0.62, an = i * 2.39996 + f * 9, x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r * 0.78, s2 = (2.2 + warpSeed(i) * 2.6) * sc * 0.7 * (0.4 + (1 - f) * 0.9);
    g.save(); g.translate(x, y); g.rotate(an + k * 8 + i); g.globalAlpha = Math.min(1, f * 4) * Math.min(1, (1 - f) * 3 + 0.3) * kt; g.fillStyle = leafCols[i % 6];
    g.beginPath(); g.ellipse(0, 0, s2, s2 * 0.5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(30,70,40,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-s2, 0); g.lineTo(s2, 0); g.stroke(); g.restore();
  }
  const kv = ez(seg(k, 0.12, 0.62));
  [[0, H, 1], [W, H, -1]].forEach(([x0, y0, d], vi) => {                           // ліани ростуть із нижніх кутів
    const N = 40, last = Math.floor(N * kv); g.strokeStyle = '#2f7a42'; g.lineWidth = Math.max(1.5, sc * 1.1); g.beginPath();
    for (let i = 0; i <= last; i++) { const t2 = i / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.07 + t2 * W * 0.34), y = y0 - t2 * H * 0.92; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
    for (let i = 3; i <= last; i += 3) { const t2 = i / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.07 + t2 * W * 0.34), y = y0 - t2 * H * 0.92; g.fillStyle = leafCols[i % 3]; g.beginPath(); g.ellipse(x + d * 3 * sc, y, 3.2 * sc * 0.8, 1.7 * sc * 0.8, d * 0.5, 0, 7); g.fill(); }
    if (kv > 0.85) { const t2 = last / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.07 + t2 * W * 0.34), y = y0 - t2 * H * 0.92; for (let p = 0; p < 6; p++) { g.fillStyle = '#ff9fc0'; g.beginPath(); g.arc(x + Math.cos(p * 1.047) * 3 * sc, y + Math.sin(p * 1.047) * 3 * sc, 2 * sc, 0, 7); g.fill(); } g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(x, y, 1.8 * sc, 0, 7); g.fill(); }
  });
  const gl = g.createRadialGradient(cx, cy, 0, cx, cy, 30 * sc); gl.addColorStop(0, 'rgba(255,250,200,.9)'); gl.addColorStop(1, 'rgba(255,250,200,0)'); g.globalAlpha = kt * (0.6 + 0.3 * Math.sin(k * 20)); g.fillStyle = gl; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  warpCapy(g, cx, cy + Math.sin(k * 11) * 2 * sc, sc * 1.5, Math.sin(k * 7) * 0.15 + k * 0.6, seg(k, 0.12, 0.28) * (1 - seg(k, 0.66, 0.74)));
  if (kr > 0) {                                                                    // нова епоха розцвітає колом, по краю летить листя
    const r = ez(kr) * diag * 1.05; warpReveal(g, cx, cy, r, sc, kr);
    for (let i = 0; i < 28; i++) { const an = i / 28 * Math.PI * 2 + k * 2; g.fillStyle = leafCols[i % 6]; g.globalAlpha = 1 - kr; g.beginPath(); g.ellipse(cx + Math.cos(an) * r, cy + Math.sin(an) * r, 3 * sc * 0.8, 1.6 * sc * 0.8, an, 0, 7); g.fill(); } g.globalAlpha = 1;
  }
}

// Космос: сцена летить геть, як маленька планета, Капі в скафандрі мчить крізь зорі й повз планети, спалах гіперстрибка
function drawWarpSpace(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
  const kp = seg(k, 0, 0.36), kt = seg(k, 0.1, 0.74), kr = seg(k, 0.74, 1), fl = seg(k, 0.6, 0.76);
  const bg = g.createRadialGradient(cx, cy, 0, cx, cy, diag * 0.6); bg.addColorStop(0, '#16123a'); bg.addColorStop(1, '#02020c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.lineCap = 'round';
  for (let i = 0; i < 130; i++) {                                                  // зорі витягуються в смужки гіперпростору
    const an = warpSeed(i) * Math.PI * 2, f = (warpSeed(i + 9) + k * (0.5 + 2.4 * kt * kt)) % 1, r0 = f * f * diag * 0.62 + 2, len = 1 + f * f * diag * 0.26 * kt;
    g.globalAlpha = Math.min(1, f * 2.5); g.strokeStyle = i % 5 === 0 ? '#9fc8ff' : i % 7 === 0 ? '#ffd8a0' : '#fff'; g.lineWidth = Math.max(1, sc * (0.4 + f * 0.9));
    g.beginPath(); g.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); g.lineTo(cx + Math.cos(an) * (r0 + len), cy + Math.sin(an) * (r0 + len)); g.stroke();
  }
  g.globalAlpha = 1;
  const pls = [['#e8794a', '#f2b48a', 0.5, 0.0, 0], ['#5fa8e8', '#bfe0ff', 1.9, 0.3, 1], ['#b46ae8', '#e6c4ff', 3.8, 0.55, 0]];
  pls.forEach(([c1, c2, an, t0, ring], i) => {                                      // планети пролітають повз
    const f = seg(k, 0.12 + t0 * 0.4, 0.62 + t0 * 0.2); if (f <= 0 || f >= 1) return; const r = ez(f) * diag * 0.66 + 4, x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r * 0.8, rad = (2 + f * f * 22) * sc * 0.8;
    g.globalAlpha = Math.min(1, f * 4) * (1 - fl); const gr = g.createRadialGradient(x - rad * 0.35, y - rad * 0.35, rad * 0.1, x, y, rad); gr.addColorStop(0, c2); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
    if (ring) { g.strokeStyle = c2; g.lineWidth = Math.max(1, rad * 0.14); g.beginPath(); g.ellipse(x, y, rad * 1.7, rad * 0.45, -0.4, 0, 7); g.stroke(); }
  });
  g.globalAlpha = 1;
  if (kp < 1) {                                                                    // знімок «до» — маленька планета, що відлітає
    const sz = 1 - ez(kp), rad = Math.min(W, H) * 0.46 * sz;
    if (rad > 1) { g.save(); g.translate(cx + ez(kp) * W * 0.25, cy - ez(kp) * H * 0.1); g.beginPath(); g.arc(0, 0, rad, 0, 7); g.clip(); g.rotate(ez(kp) * 1.5); g.scale(sz, sz); g.drawImage(warp.snap, -W / 2, -H / 2); g.restore(); g.strokeStyle = '#9fc8ff'; g.lineWidth = Math.max(1, sc * 0.8); g.beginPath(); g.arc(cx + ez(kp) * W * 0.25, cy - ez(kp) * H * 0.1, rad, 0, 7); g.stroke(); }
  }
  const ca = seg(k, 0.14, 0.3) * (1 - seg(k, 0.62, 0.74)), sh = Math.sin(k * 60) * sc * 0.5 * kt;       // Капі в скафандрі, позаду вогонь
  if (ca > 0) {
    for (let i = 0; i < 3; i++) { g.globalAlpha = ca * (0.8 - i * 0.2); g.fillStyle = ['#fff6b0', '#ffb43a', '#ff5a2a'][i]; const fh = (7 + i * 5 + Math.sin(k * 80 + i) * 3) * sc * 0.8; g.beginPath(); g.moveTo(cx - 5 * sc * (1 - i * 0.2) + sh, cy + 10 * sc); g.lineTo(cx + 5 * sc * (1 - i * 0.2) + sh, cy + 10 * sc); g.lineTo(cx + sh, cy + 10 * sc + fh); g.closePath(); g.fill(); }
    warpCapy(g, cx + sh, cy, sc * 1.5, Math.sin(k * 8) * 0.12, ca);
    g.globalAlpha = ca * 0.6; g.strokeStyle = '#bfe8ff'; g.lineWidth = Math.max(1, sc * 0.9); g.beginPath(); g.arc(cx + sh, cy - 2 * sc, 11 * sc, 0, 7); g.stroke(); g.fillStyle = 'rgba(160,220,255,.15)'; g.fill(); g.globalAlpha = 1;
  }
  g.textAlign = 'center'; g.textBaseline = 'middle'; warp.icons.forEach((ic, i) => { const f = (kt * 1.7 + i / warp.icons.length) % 1, an = i * 2.4 + k * 2, r = Math.pow(f, 1.6) * diag * 0.7; g.globalAlpha = Math.sin(f * Math.PI) * kt * 0.9; g.font = Math.round((5 + f * 18) * sc) + 'px sans-serif'; g.fillText(ic, cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.75); });
  g.globalAlpha = 1;
  if (fl > 0) { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, ez(fl) * diag * 0.9 + 1); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(190,220,255,.9)'); gr.addColorStop(1, 'rgba(190,220,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  if (kr > 0) { g.fillStyle = '#fff'; g.globalAlpha = 1 - kr; g.fillRect(0, 0, W, H); g.globalAlpha = 1; warpReveal(g, cx, cy, ez(kr) * diag * 1.05, sc, kr); }
}
// Відродження: давня Греція. Біле мармурове небо, колони, оливкові гілки й дерева, звірята-ангелятка з німбами й крильцями
function warpWing(g, x, y, s, flap, dir) {                         // одне пір'яне крильце
  g.save(); g.translate(x, y); g.scale(dir, 1); g.rotate(-0.55 + flap * 0.75);
  g.fillStyle = '#ffffff'; g.strokeStyle = '#cdbb8a'; g.lineWidth = Math.max(1, s * 0.07);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.6, -s * 1.0, s * 1.5, -s * 0.55); g.quadraticCurveTo(s * 1.2, -s * 0.25, s * 1.45, -s * 0.02); g.quadraticCurveTo(s * 1.0, 0.0, s * 1.08, s * 0.3); g.quadraticCurveTo(s * 0.5, s * 0.15, 0, s * 0.35); g.closePath(); g.fill(); g.stroke();
  g.restore();
}
function warpAngel(g, cs, x, y, s, flap, a, rot) {                  // звірятко з крильцями й золотим німбом
  const w = cs.width * s, h = cs.height * s;
  g.save(); g.translate(x, y); g.rotate(rot || 0); g.globalAlpha = a;
  warpWing(g, -w * 0.18, -h * 0.05, w * 0.5, flap, -1); warpWing(g, w * 0.18, -h * 0.05, w * 0.5, flap, 1);
  g.drawImage(cs, -w / 2, -h / 2, w, h);
  g.strokeStyle = '#8a6a10'; g.lineWidth = Math.max(1.6, s * 1.9); g.beginPath(); g.ellipse(0, -h * 0.6, w * 0.26, h * 0.085, 0, 0, 7); g.stroke();
  g.strokeStyle = '#ffe36a'; g.lineWidth = Math.max(1, s * 1.1); g.beginPath(); g.ellipse(0, -h * 0.6, w * 0.26, h * 0.085, 0, 0, 7); g.stroke();
  g.restore(); g.globalAlpha = 1;
}
function warpOlive(g, x, y, s, sway, a) {                           // оливкове дерево: покручений стовбур, сріблясто-зелена крона, чорні оливки
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#5a4630'; g.lineCap = 'round'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-7, -9, 6, -14, -2 + sway, -26); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(-1, -14); g.quadraticCurveTo(-10, -20, -13 + sway, -27); g.stroke(); g.beginPath(); g.moveTo(1, -16); g.quadraticCurveTo(10, -22, 13 + sway, -28); g.stroke();
  [[-12, -29, 11, '#6f8a3e'], [12, -30, 11, '#6f8a3e'], [0, -35, 14, '#8aa650'], [-6, -27, 9, '#a9c06c'], [8, -26, 9, '#a9c06c']].forEach(([cx, cy, r, c]) => { g.fillStyle = c; g.beginPath(); g.ellipse(cx + sway, cy, r, r * 0.72, 0, 0, 7); g.fill(); });
  g.fillStyle = '#d5e1a0'; for (let i = 0; i < 10; i++) { g.fillRect(-16 + warpSeed(i) * 32 + sway, -44 + warpSeed(i + 5) * 22, 3, 1); }
  g.fillStyle = '#2c2038'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-12 + warpSeed(i + 20) * 24 + sway, -40 + warpSeed(i + 30) * 18, 1.5, 1.1, 0, 0, 7); g.fill(); }
  g.restore();
}
function warpOliveBranch(g, x0, y0, dx, len, sc, a, sw) {            // гілка з листям і оливками, що росте з кута
  const N = 22, last = Math.floor(N * len), pt = i => { const t = i / N; return [x0 + dx * (t * 62 * sc + Math.sin(t * 5 + sw) * 3 * sc), y0 + t * 70 * sc + Math.sin(t * 3 + sw) * 2 * sc]; };
  g.save(); g.globalAlpha = a; g.strokeStyle = '#5a4630'; g.lineWidth = Math.max(1, sc * 0.9); g.beginPath();
  for (let i = 0; i <= last; i++) { const [x, y] = pt(i); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
  for (let i = 2; i <= last; i += 2) {
    const [x, y] = pt(i); [-1, 1].forEach(side => { g.save(); g.translate(x, y); g.rotate(side * 0.9 + dx * 0.3); g.fillStyle = i % 4 ? '#8fa85a' : '#a9c06c'; g.beginPath(); g.ellipse(side * 4 * sc, 0, 4.4 * sc, 1.5 * sc, 0, 0, 7); g.fill(); g.restore(); });
    if (i % 6 === 0) { g.fillStyle = '#2c2038'; g.beginPath(); g.ellipse(x - dx * 2 * sc, y + 3 * sc, 1.7 * sc, 2.3 * sc, 0, 0, 7); g.fill(); g.fillStyle = '#7a6aa0'; g.fillRect(x - dx * 2.6 * sc, y + 2 * sc, 0.7 * sc, 0.9 * sc); }
  }
  g.restore();
}
function warpMeander(g, y, h, W, sc, off, col, a) {                  // грецький меандр, що біжить уздовж краю
  const s = h, step = s * 1.3; g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = Math.max(1, s * 0.16); g.lineCap = 'square';
  for (let x = -step + (off % step); x < W; x += step) { g.beginPath(); g.moveTo(x, y + s); g.lineTo(x, y); g.lineTo(x + s, y); g.lineTo(x + s, y + s * 0.7); g.lineTo(x + s * 0.3, y + s * 0.7); g.lineTo(x + s * 0.3, y + s * 0.35); g.lineTo(x + s * 0.65, y + s * 0.35); g.stroke(); }
  g.restore();
}
function drawWarpGreece(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
  const ka = seg(k, 0, 0.24), kt = seg(k, 0.1, 0.74), kc = ez(seg(k, 0.08, 0.34)), kv = ez(seg(k, 0.16, 0.6)), kr = seg(k, 0.74, 1);
  g.drawImage(warp.snap, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9fd0f2'); sky.addColorStop(0.55, '#e6f2fb'); sky.addColorStop(1, '#fbe9b8');
  g.globalAlpha = ez(ka); g.fillStyle = sky; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  g.globalCompositeOperation = 'lighter';                                           // промені світла згори
  for (let i = 0; i < 9; i++) { const an = Math.PI / 2 + (i - 4) * 0.2 + Math.sin(k * 3 + i) * 0.04; g.globalAlpha = 0.16 * kt; g.fillStyle = '#ffe9a0'; g.beginPath(); g.moveTo(cx, -H * 0.1); g.lineTo(cx + Math.cos(an - 0.05) * diag * 1.2, -H * 0.1 + Math.sin(an - 0.05) * diag * 1.2); g.lineTo(cx + Math.cos(an + 0.05) * diag * 1.2, -H * 0.1 + Math.sin(an + 0.05) * diag * 1.2); g.closePath(); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 5; i++) { const x = ((warpSeed(i + 3) + k * (0.15 + 0.1 * i)) % 1.4 - 0.2) * W, y = H * (0.12 + 0.14 * i), r = (9 + warpSeed(i) * 7) * sc * 0.8; g.globalAlpha = 0.85 * kt; g.fillStyle = '#fff'; [[0, 0, 1], [-0.8, 0.2, 0.7], [0.8, 0.25, 0.75], [0.2, -0.35, 0.7]].forEach(([dx, dy, f]) => { g.beginPath(); g.ellipse(x + dx * r, y + dy * r, r * f, r * f * 0.55, 0, 0, 7); g.fill(); }); }
  g.globalAlpha = 1;
  const fy = H * 0.88, ty = H * 0.14;                                               // колони піднімаються знизу
  const col = (x, w2, a) => {
    const off = (1 - kc) * H, top2 = ty + off, bot = fy + off; g.save(); g.globalAlpha = a * kt;
    g.fillStyle = '#e9e1d0'; g.fillRect(x - w2 * 0.62, top2, w2 * 1.24, h2(2)); g.fillRect(x - w2 * 0.7, top2 + h2(2), w2 * 1.4, h2(1.2));                      // капітель
    g.fillStyle = '#f7f2e6'; g.fillRect(x - w2 / 2, top2 + h2(3.2), w2, bot - top2 - h2(5));                                                                 // стовбур
    g.fillStyle = '#d6ccb4'; g.fillRect(x + w2 * 0.18, top2 + h2(3.2), w2 * 0.32, bot - top2 - h2(5));
    g.strokeStyle = '#cfc4a8'; g.lineWidth = 1; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * w2 * 0.2, top2 + h2(3.2)); g.lineTo(x + i * w2 * 0.2, bot - h2(1.8)); g.stroke(); }
    g.fillStyle = '#e9e1d0'; g.fillRect(x - w2 * 0.66, bot - h2(1.8), w2 * 1.32, h2(1.8)); g.restore();
  }, h2 = f => f * sc * 1.6;
  col(W * 0.07, W * 0.07, 1); col(W * 0.93, W * 0.07, 1); col(W * 0.25, W * 0.045, 0.7); col(W * 0.75, W * 0.045, 0.7);
  g.fillStyle = '#f2ead6'; g.globalAlpha = kt; g.fillRect(0, ty - h2(3) - (1 - kc) * H, W, h2(3));                       // балка
  warpMeander(g, ty - h2(2.7) - (1 - kc) * H, h2(2), W, sc, k * 60, '#c19a2e', kt);
  g.globalAlpha = kt; g.fillStyle = '#d9c9a0'; g.fillRect(0, fy + (1 - kc) * H, W, H); g.globalAlpha = 1;
  warpMeander(g, fy + h2(0.4) + (1 - kc) * H, h2(2), W, sc, -k * 60, '#c19a2e', kt);
  warpOliveBranch(g, W * 0.1, H * 0.1, 1, kv, sc, kt, k * 4); warpOliveBranch(g, W * 0.9, H * 0.1, -1, kv, sc, kt, k * 4 + 2);
  warpOlive(g, W * 0.16, fy + h2(1.2), sc * 0.9 * kv, Math.sin(k * 6) * 1.5, kt); warpOlive(g, W * 0.84, fy + h2(1.2), sc * 0.9 * kv, Math.sin(k * 6 + 2) * 1.5, kt); warpOlive(g, W * 0.5, fy + h2(0.9), sc * 0.55 * kv, Math.sin(k * 6 + 4) * 1.2, kt * 0.9);
  const R = Math.min(W, H * 1.3) * 0.34 * ez(seg(k, 0.3, 0.7));                     // лавровий вінок розкривається навколо Капі
  if (R > 2) for (let i = 0; i < 30; i++) { const an = i / 30 * Math.PI * 2 + k * 1.2; g.save(); g.translate(cx + Math.cos(an) * R, cy + Math.sin(an) * R * 0.78); g.rotate(an + Math.PI / 2 + (i % 2 ? 0.5 : -0.5)); g.globalAlpha = kt; g.fillStyle = i % 2 ? '#6fa04a' : '#9bc46a'; g.beginPath(); g.ellipse(0, 0, 4 * sc * 0.8, 1.6 * sc * 0.8, 0, 0, 7); g.fill(); g.restore(); }
  const flap = Math.sin(k * 40) * 0.5 + 0.5, fa = seg(k, 0.16, 0.3) * (1 - seg(k, 0.68, 0.74));
  const kids = ['spike', 'bodya', 'zoya', 'mikhas', 'sonia', 'kria', 'murzyk'].map(id => TEAM.find(m => m.id === id)).filter(Boolean);       // звірята-ангелятка літають по колу
  kids.forEach((m, i) => { const an = i / kids.length * Math.PI * 2 - k * 4.2, rr = Math.min(W, H * 1.4) * (0.27 + 0.03 * Math.sin(k * 9 + i)); warpAngel(g, getSpriteCanvas('team_' + m.id + '_e0'), cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * 0.62 + Math.sin(k * 20 + i) * sc, sc * 0.8, Math.sin(k * 40 + i) * 0.5 + 0.5, fa, Math.sin(k * 7 + i) * 0.12); });
  warpAngel(g, getSpriteCanvas(capySprite()), cx, cy + Math.sin(k * 14) * 1.5 * sc, sc * 1.6, flap, fa, Math.sin(k * 6) * 0.06);
  g.textAlign = 'center'; g.textBaseline = 'middle'; warp.icons.forEach((ic, i) => { const f = (kt * 1.5 + i / warp.icons.length) % 1; g.globalAlpha = Math.sin(f * Math.PI) * kt * 0.85; g.font = Math.round((6 + f * 12) * sc) + 'px sans-serif'; g.fillText(ic, cx + Math.cos(i * 2.2 + k * 2) * f * diag * 0.45, cy + Math.sin(i * 2.2 + k * 2) * f * diag * 0.3); }); g.globalAlpha = 1;
  if (kr > 0) {                                                                    // золоте сяйво й коло з оливкових листочків відкривають нову епоху
    g.globalAlpha = Math.sin(kr * Math.PI) * 0.55; g.fillStyle = '#fff6c8'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    const r = ez(kr) * diag * 1.05; warpReveal(g, cx, cy, r, sc, kr);
    for (let i = 0; i < 36; i++) { const an = i / 36 * Math.PI * 2; g.save(); g.translate(cx + Math.cos(an) * r, cy + Math.sin(an) * r); g.rotate(an + Math.PI / 2 + (i % 2 ? 0.6 : -0.6)); g.globalAlpha = 1 - kr; g.fillStyle = i % 2 ? '#7f9a4a' : '#a9c06c'; g.beginPath(); g.ellipse(0, 0, 4 * sc * 0.8, 1.5 * sc * 0.8, 0, 0, 7); g.fill(); g.restore(); }
    g.globalAlpha = 1;
  }
}
const WARP_BY_EPOCH = [drawWarpGreece, drawWarpRewind, drawWarpDisco, drawWarpArcade, drawWarpNet, drawWarpEco, drawWarpSpace, drawWarpTunnel];
function updateWarp(dt) {
  if (!warp) return;
  warp.t += dt;
  const k = Math.min(1, warp.t / warp.dur);
  (WARP_BY_EPOCH[(warp.toEpoch | 0) % EPOCHS.length] || drawWarpGreece)(k);               // у кожної епохи своя анімація подорожі
  if ((state.warpSeen || warp.demo) && warp.t > 0.5 && k < 0.7) {                // після першого перегляду анімацію можна пропустити
    const g = ui.warpCanvas.getContext('2d'), sc = warp.W / 160; g.globalAlpha = 0.9; g.textAlign = 'center'; g.textBaseline = 'bottom'; warpFont(g, 4.4 * sc); warpText(g, t('warpSkip'), warp.W / 2, warp.H - 3 * sc, '#fff'); g.globalAlpha = 1;
  }
  if (!warp.applied && k >= 0.5) { warp.applied = true; warp.steps = warp.view !== undefined ? setEpochPreviewSteps(warp.view) : applyTimeTravelSteps(); }
  if (warp.steps && warp.steps.length) warp.steps.shift()();          // по одному етапу на кадр: вир закриває сцену, тож перебудова епохи не дає провалу
  if (k >= 1) {
    while (warp.steps && warp.steps.length) warp.steps.shift()();
    warp.steps = null;
    const viewOnly = warp.view !== undefined;
    if (!warp.demo) state.warpSeen = 1;
    warp = null;
    ui.timeWarp.hidden = true;
    if (viewOnly) return;
    // новий сюжетний фрагмент епохи
    const storyNo = guestStoryNoOf(curEpoch()), label = curEpoch() + 1;
    playEpochIntro(state.epoch, () => {
      setTimeout(() => { try { capySay(); } catch (e) { /* не страшно */ } }, 700);
      const ek = curEpoch(), st = state.story, guestStory = () => { if (!st.guests[storyNo - 1]) startDialogue(storyNo, false, 'ep', label); };
      // нова епоха: спершу відкривається її ПЕРША глава, а гість зі своїми речами приходить одразу після неї
      if (ek >= 1 && EPOCH_CHAPTERS[ek] && !((st.epDone && st.epDone[ek]) || 0)) { startDialogue(1, false, 'ec', 1, ek); if (dialog.active) dialog.after = guestStory; else guestStory(); }
      else guestStory();
    });      // історія — лише вперше, далі тільки заставка
  }
}
