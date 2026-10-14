//#part 220_b2_rainbow_lightning_skyx.js
function skyxDrone(x, y, ph, box) {
  x = Math.round(x); y = Math.round(y + Math.sin(ph * 0.7) * 1.5); const bl = Math.floor(ph * 2) % 2 ? 4 : 2;
  R(ctx, x - 5, y, 11, 2, 'e'); R(ctx, x - 3, y - 2, 7, 2, 'z'); R(ctx, x - 8, y - 3, bl * 2, 1, 'w'); R(ctx, x + 8 - bl * 2 + 1, y - 3, bl * 2, 1, 'w'); R(ctx, x - 7, y - 2, 1, 2, 'e'); R(ctx, x + 7, y - 2, 1, 2, 'e'); R(ctx, x - 1, y + 1, 3, 1, 'N');
  if (box) { R(ctx, x - 4, y + 2, 9, 7, 'd'); R(ctx, x - 3, y + 3, 7, 5, 'c'); R(ctx, x - 3, y + 3, 7, 1, 'y'); R(ctx, x, y + 3, 1, 5, 'w'); }
}
function skyxIsland(x, y, w, ph) {
  x = Math.round(x); y = Math.round(y + Math.sin(ph) * 2); const hw = Math.round(w / 2);
  for (let k = 0; k <= 8; k++) { const h2 = Math.round(hw * (1 - k / 9)); R(ctx, x - h2 - 1, y + k, h2 * 2 + 2, 1, 'd'); R(ctx, x - h2, y + k, h2 * 2, 1, k < 2 ? 'g' : k < 5 ? 'b' : 'M'); }
  R(ctx, x - hw, y - 1, hw * 2, 2, 'm'); R(ctx, x - hw, y - 2, hw * 2, 1, 'g');
  R(ctx, x - 4, y - 16, 3, 15, 'b'); disc(ctx, x - 3, y - 19, 8, 'd'); disc(ctx, x - 3, y - 19, 7, 'G'); disc(ctx, x - 5, y - 21, 5, 'g'); R(ctx, x - 6, y - 23, 2, 1, 'm');
  R(ctx, x + 7, y - 5, 3, 3, 'r'); R(ctx, x + 8, y - 8, 1, 3, 'G');
  const wx = x + hw - 6, fl = Math.floor(animClock * 10); R(ctx, wx, y + 6, 3, 18, 'S'); for (let k = 0; k < 6; k++) R(ctx, wx + ((k + fl) % 3), y + 6 + ((k * 3 + fl) % 18), 1, 2, 'w'); R(ctx, wx - 1, y + 24, 5, 1, 'w');
}
// ---------- Якісніші прикраси неба: кеш-спрайти зі світлом зверху-ліворуч і тінню знизу-праворуч (як у куль) ----------
const skyBlockCache = {}, islandCache = {}, droneCache = {};
function skyHash(x, y) { const q = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return q - Math.floor(q); }
function skyxBlock(c) {                                           // блок тетрісу 6×6: темний контур, скошені грані, відблиск
  if (skyBlockCache[c]) return skyBlockCache[c];
  const h = PALETTE[c] || c, cv = document.createElement('canvas'); cv.width = 6; cv.height = 6; const g = cv.getContext('2d');
  g.fillStyle = '#1c1630'; g.fillRect(0, 0, 6, 6);
  g.fillStyle = mixHex(h, '#272048', 0.5); g.fillRect(1, 1, 4, 4);
  g.fillStyle = h; g.fillRect(1, 1, 3, 3);
  g.fillStyle = mixHex(h, '#ffffff', 0.55); g.fillRect(1, 1, 3, 1); g.fillRect(1, 1, 1, 3);
  g.fillStyle = '#ffffff'; g.fillRect(2, 2, 1, 1);
  return (skyBlockCache[c] = cv);
}
function islandCanvas(w, v) {                                      // літаючий острів: каміння з прошарками, трава, об'ємне дерево/кущі, квіти
  const key = w + '_' + v; if (islandCache[key]) return islandCache[key];
  const hw = Math.round(w / 2), depth = Math.round(w * 0.55), treeH = 30, W = w + 14, H = treeH + 6 + depth + 4, cx = W / 2, ty = treeH + 3;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const rock = ['#d2b494', '#b5977a', '#977a62', '#765d4d', '#52413a'], gr = ['#b8e86a', '#7cc84a', '#4e9a38', '#357a30', '#245626'];
  const px = (x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  // каміння: округла «морква» з нерівним низом, світло зверху-ліворуч, прошарки
  for (let y = 0; y < depth; y++) {
    const u = y / depth, half = Math.max(1, Math.round(hw * (1 - Math.pow(u, 1.55) * 0.93)) + (skyHash(y, v) > 0.7 ? 1 : 0));
    for (let x = -half; x <= half; x++) {
      const nx = x / Math.max(1, half), n = skyHash(x + 40, y + v * 9);
      let sh = 0.34 + (nx + 1) * 0.2 + u * 0.38 + (n - 0.5) * 0.18;
      if (y % 6 === 4 && n > 0.25) sh += 0.14;                                  // прошарок
      const ci = sh < 0.3 ? 0 : sh < 0.5 ? 1 : sh < 0.7 ? 2 : sh < 0.9 ? 3 : 4;
      px(cx + x, ty + 2 + y, rock[ci]);
    }
  }
  // трава зверху: ламана кромка зі «шторкою» над каменем
  for (let x = -hw; x <= hw; x++) {
    const n = skyHash(x, 77 + v), dh = n > 0.8 ? 3 : n > 0.4 ? 2 : 1;
    for (let k = -1; k < dh + 1; k++) px(cx + x, ty + k, k < 0 ? gr[0] : k === 0 ? gr[1] : gr[2 + Math.min(1, k - 1)]);
    if (n > 0.55) px(cx + x, ty - 2 - (n > 0.9 ? 1 : 0), gr[1]);              // травинки
  }
  const crown = (ox, oy, r) => {                                             // об'ємна крона-куля з напівтоном
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x + 0.5, y + 0.5); if (d > r) continue;
      const nx = x / r, ny = y / r, nz = Math.sqrt(Math.max(0.02, 1 - nx * nx - ny * ny)), lum = -nx * 0.55 - ny * 0.6 + nz * 0.58;
      let q = 0.62 - lum * 0.55 + ((x + y) & 1 ? 0.04 : 0) + (skyHash(x + ox, y + oy) - 0.5) * 0.16;
      if (d > r - 1.1) q += 0.12;
      px(cx + ox + x, oy + y, gr[q < 0.18 ? 0 : q < 0.4 ? 1 : q < 0.62 ? 2 : q < 0.82 ? 3 : 4]);
    }
  };
  const trunk = (ox, h2) => { g.fillStyle = '#3c2a22'; g.fillRect(cx + ox - 1, ty - h2, 3, h2 + 1); g.fillStyle = '#8a5e3a'; g.fillRect(cx + ox - 1, ty - h2, 1, h2 + 1); };
  if (v === 0) { trunk(-4, 11); crown(-4, ty - 17, 9); crown(3, ty - 12, 6); }
  else if (v === 1) { trunk(-6, 9); crown(-6, ty - 14, 7); crown(5, ty - 5, 5); crown(11, ty - 3, 3); }
  else { trunk(-8, 8); crown(-8, ty - 12, 6); trunk(4, 10); crown(4, ty - 16, 8); }
  for (let k = 0; k < 5; k++) { const fx = cx - hw + 3 + Math.round(skyHash(k, v + 3) * (w - 6)); px(fx, ty - 1, k % 2 ? '#ff7a8a' : '#ffe27a'); }     // квіточки
  // контур: темний 1 px навколо силуету
  const id = g.getImageData(0, 0, W, H), d = id.data, solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 40, out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) out.push([x, y]);
  g.fillStyle = '#2a1f2e'; out.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
  cv.cx = cx; cv.ty = ty;
  return (islandCache[key] = cv);
}
function skyxIsland2(x, y, w, v, ph) {
  const cv = islandCanvas(w, v || 0); x = Math.round(x); y = Math.round(y + Math.sin(ph) * 2);
  ctx.drawImage(cv, Math.round(x - cv.cx), y - cv.ty);
  const hw = Math.round(w / 2), wx = x + hw - Math.max(5, Math.round(w * 0.16)), fl = Math.floor(animClock * 10), wy = y + 7;     // водоспад зі шлейфом бризок
  R(ctx, wx, wy, 3, 20, 'S'); R(ctx, wx, wy, 1, 20, 'w');
  for (let k = 0; k < 6; k++) R(ctx, wx + ((k + fl) % 3), wy + ((k * 3 + fl) % 18), 1, 2, 'w');
  ctx.globalAlpha = 0.45; R(ctx, wx - 2, wy + 20, 7, 1, 'w'); R(ctx, wx - 1, wy + 21, 5, 1, 'w'); ctx.globalAlpha = 1;
}
function droneBody(box) {                                          // корпус дрона 17×14 з об'ємом: світлий верх, темний низ, мотори, вантаж на стропі
  const key = box ? 1 : 0; if (droneCache[key]) return droneCache[key];
  const cv = document.createElement('canvas'); cv.width = 17; cv.height = 15; const g = cv.getContext('2d');
  const P = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  P(2, 4, 13, 1, '#1c1630'); P(2, 5, 13, 1, '#8890b8'); P(2, 6, 13, 1, '#6a7098');                            // рами-промені
  P(1, 3, 3, 3, '#1c1630'); P(2, 4, 1, 1, '#4a4468'); P(13, 3, 3, 3, '#1c1630'); P(14, 4, 1, 1, '#4a4468');     // мотори
  P(5, 2, 7, 6, '#1c1630'); P(6, 3, 5, 4, '#e9edf7'); P(6, 3, 5, 1, '#ffffff'); P(6, 6, 5, 1, '#9aa3c4'); P(10, 3, 1, 4, '#b4bcd8');   // корпус
  P(7, 4, 3, 2, '#2b3566'); P(8, 4, 1, 1, '#7fe3ff');                                                         // камера-«очко»
  P(4, 8, 1, 2, '#1c1630'); P(12, 8, 1, 2, '#1c1630');                                                         // шасі
  if (box) { P(8, 8, 1, 2, '#1c1630'); P(5, 10, 7, 5, '#1c1630'); P(6, 11, 5, 3, '#c98a4a'); P(6, 11, 5, 1, '#ffd07a'); P(8, 11, 1, 3, '#f4e6c8'); }
  return (droneCache[key] = cv);
}
function skyxDrone2(x, y, ph, box) {
  const cv = droneBody(box); x = Math.round(x); y = Math.round(y + Math.sin(ph * 0.7) * 1.5);
  ctx.drawImage(cv, x - 8, y - 4);
  const bl = Math.floor(ph * 3) % 2 ? 4 : 2;                                                                    // пропелери: короткі «розмиті» лопаті
  R(ctx, x - 8 - bl + 1, y - 5, bl * 2 + 1, 1, 'w'); R(ctx, x + 7 - bl, y - 5, bl * 2 + 1, 1, 'w');
  ctx.globalAlpha = 0.25; R(ctx, x - 10, y - 4, 7, 1, 'w'); R(ctx, x + 4, y - 4, 7, 1, 'w'); ctx.globalAlpha = 1;
  R(ctx, x - 7, y + 2, 1, 1, Math.floor(animClock * 2 + ph) % 2 ? 'r' : 'd'); R(ctx, x + 7, y + 2, 1, 1, Math.floor(animClock * 2 + ph) % 2 ? 'd' : 'g');   // бортові вогні
}
function skyxKite(x, y, ph, c) {                                   // повітряний змій-ромб із хвостом і бантиками
  x = Math.round(x); y = Math.round(y + Math.sin(ph) * 2);
  const rp = c.map(b => { const h = PALETTE[b] || b; return [mixHex(h, '#ffffff', 0.4), h, mixHex(h, '#272048', 0.45)]; });
  for (let j = -8; j <= 8; j++) { const half = Math.round(6 * (1 - Math.abs(j) / 9) + (j < 0 ? 1 : 0)); for (let i = -half; i <= half; i++) { const left = i < 0, top = j < 0; R(ctx, x + i, y + j, 1, 1, i === 0 ? '#2a1f2e' : (left === top ? rp[0][top ? 1 : 0] : rp[1][1])); } }
  R(ctx, x, y - 9, 1, 18, '#2a1f2e'); R(ctx, x - 6, y, 13, 1, '#2a1f2e');
  for (let k = 1; k <= 20; k++) { const tx = x + Math.round(Math.sin(ph * 1.5 - k * 0.5) * (1 + k * 0.28)), ty = y + 8 + k; R(ctx, tx, ty, 1, 1, '#2a1f2e'); if (k % 5 === 0) { R(ctx, tx - 2, ty, 5, 1, rp[1][1]); R(ctx, tx, ty - 2, 1, 5, rp[0][1]); } }
}
const noteCache = {};
function noteCanvas(c, g) {                                         // нота-спрайт: заливка з відблиском, темний контур і м'яке сяйво кольору
  const key = c + g; if (noteCache[key]) return noteCache[key];
  const hex = PALETTE[c] || c, W = 30, H = 36, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const q = cv.getContext('2d');
  const sx = 11, by = 27, put = (x, y, w, h, col) => { q.fillStyle = col; q.fillRect(x, y, w, h); };
  const body = document.createElement('canvas'); body.width = W; body.height = H; const b = body.getContext('2d');
  const bp = (x, y, w, h, col) => { b.fillStyle = col; b.fillRect(x, y, w, h); };
  const head = (hx, hy) => { for (let dy = -3; dy <= 3; dy++) for (let dx = -4; dx <= 4; dx++) { const v = (dx * 0.92 + dy * 0.28) * (dx * 0.92 + dy * 0.28) / 16 + (dy * 0.92 - dx * 0.28) * (dy * 0.92 - dx * 0.28) / 9.6; if (v <= 1) bp(hx + dx, hy + dy, 1, 1, (dx < 0 && dy < 0) ? mixHex(hex, '#ffffff', 0.55) : (dx > 1 && dy > 0) ? mixHex(hex, '#272048', 0.35) : hex); } };
  if (g === 0) { head(sx, by); bp(sx + 3, by - 18, 2, 18, hex); bp(sx + 3, by - 18, 1, 18, mixHex(hex, '#ffffff', 0.5)); bp(sx + 5, by - 18, 2, 3, hex); bp(sx + 6, by - 15, 3, 3, hex); bp(sx + 7, by - 12, 2, 4, hex); bp(sx + 6, by - 9, 2, 2, hex); }
  else if (g === 1) { head(sx - 2, by); head(sx + 10, by - 2); bp(sx + 1, by - 18, 2, 18, hex); bp(sx + 13, by - 20, 2, 18, hex); bp(sx + 1, by - 18, 14, 3, hex); bp(sx + 1, by - 18, 14, 1, mixHex(hex, '#ffffff', 0.55)); }
  else { head(sx, by); bp(sx + 3, by - 19, 2, 19, hex); bp(sx + 3, by - 19, 1, 19, mixHex(hex, '#ffffff', 0.5)); head(sx, by); }
  const id = b.getImageData(0, 0, W, H).data, solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && id[(y * W + x) * 4 + 3] > 40;
  // м'яке сяйво, потім контур, потім заливка
  const grd = q.createRadialGradient(W / 2, H / 2, 2, W / 2, H / 2, 17); grd.addColorStop(0, mixHex(hex, '#ffffff', 0.4).replace('rgb', 'rgba').replace(')', ',0.5)')); grd.addColorStop(1, 'rgba(255,255,255,0)');
  q.fillStyle = grd; q.fillRect(0, 0, W, H);
  q.fillStyle = '#2a1f2e';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1) || solid(x - 1, y - 1) || solid(x + 1, y + 1))) q.fillRect(x, y, 1, 1);
  q.drawImage(body, 0, 0);
  return (noteCache[key] = cv);
}
function skyxNote(x, y, ph, c, g, amp) {                            // нота пливе вгору по м'якій хвилі (дві гармоніки), з появою й згасанням
  const cv = noteCanvas(c, g), wob = Math.sin(ph) * (amp || 7) + Math.sin(ph * 2.3 + 1) * 2;
  x = Math.round(x + wob); y = Math.round(y);
  const top = 8 - view.offY, fade = Math.max(0, Math.min(1, (y - top) / 26)) * Math.max(0, Math.min(1, (132 - y) / 16));
  if (fade <= 0.02) return;
  ctx.globalAlpha = 0.92 * fade; ctx.drawImage(cv, x - 15, y - 27); ctx.globalAlpha = 1;
}
// ---------- Ретро: ракета, вертоліт, авіалайнер (кеш-спрайти: світло зверху-ліворуч, 5 відтінків, темний контур 1 px) ----------
const retroCache = {};
function retroCanvas(W, H) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv; }
function retroOutline(cv) {                                          // темний контур навколо силуету
  const W = cv.width, H = cv.height, g = cv.getContext('2d'), d = g.getImageData(0, 0, W, H).data, out = [];
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 40;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) out.push([x, y]);
  g.fillStyle = '#2a1f2e'; out.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
}
const RT_WHITE = ['#ffffff', '#f2eee8', '#d8d0c8', '#b3a9a8', '#8a8296'];
const RT_RED = ['#ff9478', '#ec5640', '#c63a2c', '#982a26', '#6a1c20'];
const RT_STEEL = ['#eef2fa', '#c9d1e2', '#9aa5c0', '#6f7a99', '#4d5673'];
const RT_TEAL = ['#c4f5ea', '#84dccb', '#52bba9', '#31908a', '#216a6c'];
const RT_GLASS = ['#f2fcff', '#c4eefa', '#92d3ea', '#68b0cf', '#4b8ba9'];
function rtPick(ramp, u) { return ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(u * ramp.length)))]; }

function rocketCanvas(dir) {                                         // ретро-ракета з плавниками (дивиться праворуч; dir<0 — дзеркально)
  const key = 'rk' + dir; if (retroCache[key]) return retroCache[key];
  const W = 66, H = 28, cy = 14, cv = retroCanvas(W, H), g = cv.getContext('2d');
  const P = (x, y, c) => { g.fillStyle = c; g.fillRect(dir > 0 ? x : W - 1 - x, y, 1, 1); };
  const half = x => x < 6 ? 0 : x < 11 ? 3 + (x - 6) * 0.5 : x < 44 ? 5.5 : 5.5 * Math.sqrt(Math.max(0, 1 - ((x - 44) / 18) * ((x - 44) / 18)));
  for (let x = 6; x < 63; x++) {
    const h = half(x); if (h <= 0.3) continue;
    for (let y = Math.round(cy - h); y < Math.round(cy + h); y++) {
      const u = ((y + 0.5 - cy) / h + 1) / 2 + ((x + y) % 2 ? 0.05 : 0);
      let ramp = x >= 47 ? RT_RED : RT_WHITE;
      if (x >= 36 && x <= 38) ramp = RT_RED;                                                  // пояс
      if (x === 35 || x === 39) ramp = RT_STEEL;
      if (x >= 40 && x <= 44 && ((x + y) & 1)) ramp = RT_STEEL;                              // шахова смужка
      P(x, y, rtPick(ramp, u * 0.95));
    }
  }
  [[22, cy - 1]].forEach(([cx, py]) => {                                        // ілюмінатори
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) P(cx + dx, py + dy, '#243a66');
    P(cx, py, '#9fdcff'); P(cx - 1, py - 1, '#ffffff');
  });
  for (let x = 28; x <= 33; x += 2) { P(x, cy - 1, '#243a66'); P(x, cy, '#9fdcff'); }   // ряд малих віконець
  for (let x = 3; x <= 17; x++) {                                                            // плавники: верхній світліший, нижній темніший
    const ytop = 1 + Math.round((x - 3) * 0.5), hb = Math.max(3, half(x));
    for (let y = ytop; y < Math.round(cy - hb); y++) P(x, y, rtPick(RT_RED, 0.1 + (y - ytop) / 14 + (x > 14 ? 0.15 : 0)));
    for (let y = Math.round(cy + hb); y < 2 * cy - ytop; y++) P(x, y, rtPick(RT_RED, 0.55 + (2 * cy - ytop - y) / -20 + 0.3));
  }
  for (let y = cy - 2; y <= cy + 2; y++) for (let x = 3; x < 7; x++) P(x, y, y === cy - 2 ? '#b8bcc8' : '#6a6e7a');   // сопло
  retroOutline(cv);
  return (retroCache[key] = cv);
}
function skyxRocket(x, y, ph, dir, g) {
  g = g || ctx; const cv = rocketCanvas(dir); x = Math.round(x); y = Math.round(y + Math.sin(ph * 0.8) * 1.5);
  g.drawImage(cv, x - 33, y - 14);
  const tx = x - dir * 30, L = 9 + (Math.floor(animClock * 14) % 3) * 3;                      // язик полум'я
  for (let k = 0; k < L; k++) { const h = Math.max(0, Math.round(3.2 * (1 - k / L))); R(g, tx - dir * (1 + k) - (dir < 0 ? 0 : 0), y - h, 1, h * 2 + 1, k < L * 0.5 ? 'y' : 'o'); }
  R(g, tx - dir * 2, y - 1, 3, 3, 'w');
  for (let i = 0; i < 6; i++) { g.globalAlpha = 0.55 * (1 - i / 6); disc(g, tx - dir * (L + 4 + i * 6), y + Math.round(Math.sin(ph * 2 + i) * 1.5), 1 + (i >> 1), 'w'); }   // димок
  g.globalAlpha = 1;
}

function heliCanvas(dir) {                                           // вертоліт 50-х: скляна «бульба», хвіст, лижі
  const key = 'hl' + dir; if (retroCache[key]) return retroCache[key];
  const W = 48, H = 26, cv = retroCanvas(W, H), g = cv.getContext('2d');
  const P = (x, y, c) => { g.fillStyle = c; g.fillRect(dir > 0 ? x : W - 1 - x, y, 1, 1); };
  const cx = 31, cy = 14, rx = 12, ry = 8.5;
  for (let x = 3; x < 22; x++) {                                                             // хвостова балка (звужується) і хвостове оперення
    const th = x < 12 ? 2 : 3, y0 = 12 + (x < 12 ? 0 : 0);
    for (let y = y0; y < y0 + th; y++) P(x, y, rtPick(RT_TEAL, (y - y0) / th * 0.9));
  }
  for (let x = 3; x <= 8; x++) for (let y = 4 + Math.floor((x - 3) * 0.5); y < 12; y++) P(x, y, rtPick(RT_RED, 0.15 + (y - 4) / 14 + (x - 3) * 0.04));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {                                  // корпус-еліпс
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy > 1) continue;
    const u = (dy + 1) / 2 - dx * 0.08;
    if (x >= cx - 2 && dy < 0.25) P(x, y, rtPick(RT_GLASS, Math.max(0, Math.min(0.99, u * 1.1))));   // скло спереду й зверху
    else P(x, y, rtPick(RT_TEAL, Math.max(0, Math.min(0.99, u))));
    if (Math.abs(dy - 0.45) < 0.1 && dx < 0.9) P(x, y, rtPick(RT_RED, u * 0.8));              // червона смуга
  }
  for (let y = 4; y < 14; y++) { P(cx - 8, y, '#1f6a68'); if (y > 5) P(cx - 7, y, '#4b8ba9'); }  // стійка скла (вертикальна рамка)
  P(cx - 5, cy - 6, '#ffffff'); P(cx - 4, cy - 7, '#ffffff'); P(cx + 4, cy - 5, '#ffffff'); // відблиски
  for (let y = 3; y <= 6; y++) P(cx - 1, y, '#3a3248'); P(cx - 1, 6, '#6a6e7a'); P(cx, 6, '#6a6e7a');   // щогла гвинта
  for (let x = 22; x <= 41; x++) P(x, 23, '#3a3248'); P(22, 22, '#3a3248'); P(41, 22, '#3a3248');       // лижі
  P(26, 20, '#3a3248'); P(26, 21, '#3a3248'); P(26, 22, '#3a3248'); P(36, 20, '#3a3248'); P(36, 21, '#3a3248'); P(36, 22, '#3a3248');
  retroOutline(cv);
  return (retroCache[key] = cv);
}
function skyxHeli(x, y, ph, dir, g) {
  g = g || ctx; const cv = heliCanvas(dir); x = Math.round(x); y = Math.round(y + Math.sin(ph * 1.1) * 1.5);
  g.drawImage(cv, x - 24, y - 13);
  const f = Math.floor(animClock * 24) % 2, hx = x + dir * (31 - 24) , hy = y - 13 + 2;       // головний гвинт: розмите коло з двома лопатями
  g.globalAlpha = 0.28; R(g, hx - 17, hy, 35, 1, 'w'); g.globalAlpha = 1;
  R(g, hx - (f ? 17 : 12), hy, f ? 13 : 11, 1, '#3a3248'); R(g, hx + (f ? 5 : 2), hy, f ? 13 : 11, 1, '#3a3248');
  const tx = x - dir * (24 - 3) + (dir > 0 ? 0 : 0), tg = Math.floor(animClock * 30) % 2;      // хвостовий гвинт
  R(g, tx, y - 13 + 6 + tg, 1, 5, '#3a3248');
}

function airlinerCanvas(c, dir) {                                    // повітряний лайнер 50-х: сріблястий, з хвостом і смугою кольору, два двигуни з гвинтами
  const key = 'al' + c.join() + dir; if (retroCache[key]) return retroCache[key];
  const W = 60, H = 26, cy = 11, cv = retroCanvas(W, H), g = cv.getContext('2d');
  const P = (x, y, col) => { g.fillStyle = col; g.fillRect(dir > 0 ? x : W - 1 - x, y, 1, 1); };
  const liv = PALETTE[c[0]], acc = PALETTE[c[1]] || '#ffffff';
  const livRamp = [mixHex(liv, '#ffffff', 0.4), mixHex(liv, '#ffffff', 0.12), liv, mixHex(liv, '#272048', 0.32), mixHex(liv, '#272048', 0.55)];
  const half = x => x < 12 ? 1.6 + (x - 5) * 0.22 : x < 40 ? 3.3 : 3.3 * Math.sqrt(Math.max(0, 1 - ((x - 40) / 13) * ((x - 40) / 13)));
  for (let x = 5; x < 53; x++) {                                                             // фюзеляж
    const h = half(x); if (h <= 0.4) continue;
    for (let y = Math.round(cy - h); y < Math.round(cy + h); y++) P(x, y, rtPick(RT_STEEL, ((y + 0.5 - cy) / h + 1) / 2 * 0.95 - 0.04 * (x > 20 ? 1 : 0)));
  }
  for (let x = 8; x < 50; x++) { P(x, cy, rtPick(livRamp, 0.45)); if (x < 46) P(x, cy + 1, rtPick(livRamp, 0.7)); }   // смуга-«cheat line»
  for (let x = 17; x <= 37; x += 3) { P(x, cy - 2, '#26335e'); P(x, cy - 3, '#b8e4ff'); }   // ілюмінатори
  P(45, cy - 2, '#7fd0ff'); P(46, cy - 2, '#7fd0ff'); P(47, cy - 2, '#b8e4ff'); P(44, cy - 2, '#26335e');   // кабіна
  for (let x = 5; x <= 15; x++) {                                                            // кіль
    const ytop = cy - 9 + Math.round((x - 5) * 0.55);
    for (let y = ytop; y < cy - 1; y++) P(x, y, rtPick(livRamp, 0.3 + (y - ytop) / 18));
  }
  for (let x = 5; x <= 12; x++) P(x, cy + 1 - (x > 9 ? 1 : 0), '#6f7a99');                 // стабілізатор
  for (let r = 0; r < 6; r++) for (let x = 31 - r * 2; x <= 39 - r * 2; x++) P(x, cy + 3 + r, rtPick(RT_STEEL, 0.2 + r * 0.1));   // крило, що йде вниз у перспективі
    [[34, 4], [23, 8]].forEach(([ex, ey]) => { for (let x = ex; x < ex + 9; x++) for (let y = 0; y < 3; y++) P(x, cy + ey + y, rtPick(RT_STEEL, 0.15 + y * 0.35)); P(ex + 8, cy + ey + 1, '#3a3248'); });
  retroOutline(cv);
  
  return (retroCache[key] = cv);
}
function skyxPlane(x, y, ph, c, dir, g) {                           // літак із пропелерами (4 кольори лівреї), слід
  g = g || ctx; const cv = airlinerCanvas(c, dir); x = Math.round(x); y = Math.round(y + Math.sin(ph * 1.3) * 1.5);
  g.drawImage(cv, x - 30, y - 11);
  const bl = Math.floor(animClock * 20) % 2 ? 4 : 2;
  [[43, 5], [32, 9]].forEach(([ex, ey]) => { const px = x + dir * (ex - 30) + (dir > 0 ? 1 : -1), py = y - 11 + 11 + ey; g.globalAlpha = 0.45; R(g, px, py - 4, 1, 9, 'w'); g.globalAlpha = 1; R(g, px, py - bl, 1, bl * 2 + 1, '#3a3248'); });
  for (let k = 1; k <= 14; k++) { g.globalAlpha = 0.5 * (1 - k / 15); R(g, x - dir * (34 + k * 3), y + 1 + (k >> 3), 3, 1, 'w'); } g.globalAlpha = 1;   // слід
}
