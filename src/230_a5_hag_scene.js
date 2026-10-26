//#part 230_a5_hag_scene.js
/* «Хатка відьми» v2: портрет у вікні хатки (144×80) і сцена з трьома казанками (256×160). Палітра гри, 1px контури, нічний цвинтар із місяцем, кажанами, туманом і світлячками. */
const HAG_W = 256, HAG_H = 160;
const hvHash = n => { let h = (n * 2654435761) >>> 0; h ^= h >>> 15; return (h >>> 0) / 4294967296; };
function hvBat(g, x, y, t, c) {                                       // кажан: тіло, два крила, що змахують
  const up = Math.floor(t * 9) % 2;
  R(g, x - 1, y, 3, 2, c); R(g, x - 1, y - 1, 1, 1, c); R(g, x + 1, y - 1, 1, 1, c);
  if (up) { R(g, x - 5, y - 2, 4, 1, c); R(g, x - 7, y - 3, 2, 1, c); R(g, x + 2, y - 2, 4, 1, c); R(g, x + 6, y - 3, 2, 1, c); }
  else { R(g, x - 5, y + 1, 4, 1, c); R(g, x - 7, y + 2, 2, 1, c); R(g, x + 2, y + 1, 4, 1, c); R(g, x + 6, y + 2, 2, 1, c); }
}
function hvMoon(g, cx, cy, r, t) {                                    // великий місяць: сяйво, диск, кратери, блік
  g.globalAlpha = 0.07 + 0.02 * Math.sin(t * 1.4); disc(g, cx, cy, r + 14, 'y'); g.globalAlpha = 0.12; disc(g, cx, cy, r + 8, 'y'); g.globalAlpha = 0.2; disc(g, cx, cy, r + 3, 'h'); g.globalAlpha = 1;
  disc(g, cx, cy, r + 1, 'o'); disc(g, cx, cy, r, 'h'); disc(g, cx - 2, cy - 2, r - 3, 'y');
  disc(g, cx + Math.round(r * 0.35), cy + Math.round(r * 0.3), 3, 'o'); disc(g, cx - Math.round(r * 0.4), cy + Math.round(r * 0.45), 2, 'o'); disc(g, cx + Math.round(r * 0.45), cy - Math.round(r * 0.45), 1, 'o');
  R(g, cx - Math.round(r * 0.6), cy - Math.round(r * 0.55), 3, 1, 'w');
}
function hvTree(g, x, y, h, dir, c) {                                  // голе покручене дерево
  let px = x, py = y; const rnd = i => hvHash(x * 7 + i);
  for (let i = 0; i < h; i++) { px += Math.round((rnd(i) - 0.5) * 1.6 + dir * 0.12); py--; R(g, px, py, i < h * 0.5 ? 3 : 2, 1, c); }
  const br = (bx, by, len, d, dep) => { let cx = bx, cy = by; for (let i = 0; i < len; i++) { cx += d; cy -= (rnd(i + len) > 0.4 ? 1 : 0); R(g, cx, cy, 1, 1, c); if (dep < 2 && i === Math.floor(len / 2)) br(cx, cy, Math.floor(len * 0.7), -d, dep + 1); } };
  br(px, py + Math.floor(h * 0.3), Math.floor(h * 0.5), -1, 0); br(px, py + Math.floor(h * 0.18), Math.floor(h * 0.45), 1, 0); br(px, py, Math.floor(h * 0.35), dir, 1);
}
let hagBg = null;
function hagBgBuild() {                                               // нерухомий задник: небо, пагорби, дерева, далека хатка, плити двору
  const c = document.createElement('canvas'); c.width = HAG_W; c.height = HAG_H; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  R(g, 0, 0, HAG_W, 34, 'z'); R(g, 0, 34, HAG_W, 24, 'V'); R(g, 0, 58, HAG_W, 18, 'P'); R(g, 0, 76, HAG_W, 12, 'u'); R(g, 0, 88, HAG_W, 40, 'P');
  for (let x = 0; x < HAG_W; x += 2) { R(g, x, 33 + (x % 4 ? 1 : 0), 2, 1, 'V'); R(g, x, 57 + (x % 4 ? 1 : 0), 2, 1, 'P'); R(g, x, 75 + (x % 4 ? 1 : 0), 2, 1, 'u'); }
  for (let x = 0; x < HAG_W; x++) { const h1 = 92 + Math.round(Math.sin(x * 0.035 + 1) * 8 + Math.sin(x * 0.09) * 3); R(g, x, h1, 1, HAG_H, 'u'); R(g, x, h1, 1, 1, 'v'); }
  for (let x = 0; x < HAG_W; x++) { const h2 = 104 + Math.round(Math.sin(x * 0.05 + 3) * 7 + Math.sin(x * 0.13) * 2); R(g, x, h2, 1, HAG_H, 'P'); R(g, x, h2, 1, 1, 'u'); }
  // далека хатка на лапках на горі (силует із теплими віконцями)
  { const hx = 176, hy = 88;
    R(g, hx + 1, hy, 1, 8, 'z'); R(g, hx + 11, hy, 1, 8, 'z'); R(g, hx - 1, hy + 8, 5, 1, 'z'); R(g, hx + 9, hy + 8, 5, 1, 'z'); R(g, hx - 1, hy + 3, 1, 1, 'z'); R(g, hx + 13, hy + 3, 1, 1, 'z');
    R(g, hx - 1, hy - 9, 15, 9, 'z'); for (let r = 0; r < 9; r++) R(g, hx + 6 - (r + 1), hy - 18 + r, (r + 1) * 2 + 1, 1, 'z');
    R(g, hx + 1, hy - 6, 3, 3, 'y'); R(g, hx + 9, hy - 6, 3, 3, 'y'); R(g, hx + 5, hy - 7, 3, 7, 'k'); R(g, hx + 5, hy - 3, 1, 1, 'h'); R(g, hx + 10, hy - 19, 3, 5, 'z'); }
  hvTree(g, 22, 112, 52, 1, 'V'); hvTree(g, 238, 114, 46, -1, 'V'); hvTree(g, 96, 106, 30, 1, 'z');
  [[60, 108], [76, 110], [118, 107], [214, 108]].forEach(([tx, ty], i) => { R(g, tx - 4, ty - 8, 9, 9, 'z'); R(g, tx - 3, ty - 9, 7, 1, 'z'); R(g, tx - 2, ty - 10, 5, 1, 'z'); R(g, tx - 2, ty - 7, 1, 4, 'P'); R(g, tx, ty - 6, 1, 3, 'P'); R(g, tx - 3, ty - 8, 1, 1, 'u'); });
  // двір: плити з кількома відтінками
  R(g, 0, 118, HAG_W, 42, 'V'); R(g, 0, 118, HAG_W, 1, 'u'); R(g, 0, 119, HAG_W, 1, 'P');
  for (let row = 0; row < 4; row++) { const y = 120 + row * 10 + (row > 1 ? row - 1 : 0); R(g, 0, y + 9, HAG_W, 1, 'z'); for (let x = (row % 2) * 14; x < HAG_W; x += 28) { R(g, x, y, 1, 10, 'z'); R(g, x + 1, y, 26, 1, 'P'); R(g, x + 1, y + 1, 12, 1, 'u'); } }
  for (let i = 0; i < 40; i++) { const x = Math.floor(hvHash(i * 3 + 1) * HAG_W), y = 122 + Math.floor(hvHash(i * 5 + 2) * 36); R(g, x, y, 2 + (i % 3), 1, i % 3 ? 'z' : 'P'); }
  // трава й кістки по краях
  for (let x = 0; x < HAG_W; x += 3) { const h = 3 + Math.floor(hvHash(x + 77) * 5); R(g, x, 160 - h, 1, h, 'G'); R(g, x + 1, 160 - h + 1, 1, h - 1, 'g'); }
  R(g, 6, 144, 10, 8, 'k'); R(g, 7, 145, 8, 6, 'w'); R(g, 7, 145, 3, 3, 'W'); R(g, 8, 148, 2, 2, 'k'); R(g, 12, 148, 2, 2, 'k'); R(g, 8, 152, 6, 1, 'k'); R(g, 4, 153, 14, 2, 'w'); R(g, 4, 155, 14, 1, 'k');
  R(g, 236, 150, 14, 2, 'k'); R(g, 237, 150, 12, 1, 'w'); R(g, 234, 148, 3, 3, 'k'); R(g, 235, 149, 1, 1, 'w'); R(g, 249, 148, 3, 3, 'k'); R(g, 250, 149, 1, 1, 'w');
  return c;
}
function hagCauldronV2(g, x, y, lid, t, dim, i) {                      // чавунний казан на трьох лапках з вогнем, зеленим варивом, бульбашками й капелюхом-кришкою
  g.globalAlpha = 0.35; hvEll(g, x, y + 1, 21, 4, 'k'); g.globalAlpha = 1;
  g.globalAlpha = 0.16; hvEll(g, x, y, 22, 5, 'o'); g.globalAlpha = 1;
  for (let k = -11; k <= 11; k += 3) { const h = 5 + Math.round(Math.abs(Math.sin(t * 9 + k + i * 2)) * 7); R(g, x + k, y - h, 3, h, 'o'); R(g, x + k + 1, y - Math.max(2, h - 4), 1, Math.max(2, h - 4), 'y'); if (h > 9) R(g, x + k + 1, y - h - 1, 1, 1, 'w'); }
  R(g, x - 16, y - 7, 5, 8, 'k'); R(g, x - 15, y - 7, 3, 7, 'd'); R(g, x + 12, y - 7, 5, 8, 'k'); R(g, x + 13, y - 7, 3, 7, 'd'); R(g, x - 3, y - 6, 7, 7, 'k'); R(g, x - 2, y - 6, 5, 6, 'd');
  const cy = y - 24;
  hvEll(g, x, cy, 19, 16, 'k'); hvEll(g, x, cy, 18, 15, 'z');
  for (let dy = -14; dy <= 14; dy++) { const half = Math.round(18 * Math.sqrt(Math.max(0, 1 - (dy / 15) * (dy / 15)))); R(g, x + half - 5, cy + dy, 5, 1, 'k'); R(g, x - half + 1, cy + dy, 2, 1, 'n'); }
  R(g, x - 13, cy - 8, 3, 12, 'n'); R(g, x - 13, cy - 8, 1, 3, 'Y'); R(g, x - 10, cy + 5, 2, 1, 'n');
  R(g, x - 16, cy + 2, 33, 2, 'k'); for (let k = -14; k <= 14; k += 4) { R(g, x + k, cy + 2, 2, 2, 'e'); }
  R(g, x - 21, cy - 7, 6, 6, 'k'); R(g, x - 19, cy - 5, 2, 2, 'z'); R(g, x + 16, cy - 7, 6, 6, 'k'); R(g, x + 18, cy - 5, 2, 2, 'z');
  R(g, x - 20, cy - 8, 41, 6, 'k'); R(g, x - 19, cy - 7, 39, 4, 'e'); R(g, x - 19, cy - 7, 39, 1, 'E'); R(g, x - 19, cy - 4, 39, 1, 'd');
  const by = cy - 7;
  R(g, x - 17, by - 1, 35, 4, 'g'); R(g, x - 15, by - 2, 31, 2, 'm'); R(g, x - 15, by - 2, 8, 1, 'a');
  g.globalAlpha = 0.16 + 0.06 * Math.sin(t * 3 + i); disc(g, x, by - 4, 18, 'm'); g.globalAlpha = 1;
  const open = 1 - Math.max(0, Math.min(1, lid / 0.9));
  if (lid < 0.99) {
    for (let k = 0; k < 4; k++) { const ph = (t * 0.55 + k / 4 + i * 0.13) % 1; g.globalAlpha = Math.min(1, ph * 4) * (1 - ph) * 0.9 * open; const bx = x - 11 + k * 7 + Math.round(Math.sin(t * 3 + k + i) * 2), byy = Math.round(by - 3 - ph * 18); disc(g, bx, byy, 2 + (k % 2), 'm'); R(g, bx - 1, byy - 1, 1, 1, 'w'); }
    for (let k = 0; k < 3; k++) { const ph = (t * 0.3 + k / 3 + i * 0.2) % 1; g.globalAlpha = (1 - ph) * 0.5 * open; R(g, x - 9 + k * 9 + Math.round(Math.sin(t * 2 + k * 2) * 4), Math.round(by - 12 - ph * 26), 4 + Math.round(ph * 4), 3, 'a'); }
    g.globalAlpha = 1;
    R(g, x + 17, cy - 1, 1, 8 + Math.floor(t * 3 + i) % 3, 'm'); R(g, x + 17, cy + 6 + Math.floor(t * 3 + i) % 3, 2, 2, 'g');
  }
  if (lid > 0.02) {
    const up = Math.round((1 - lid) * 34), sx = Math.round((1 - lid) * 16), lx = x + sx, ly = by - 6 - up, tilt = Math.round((1 - lid) * 4);
    R(g, lx - 19, ly - 3 + Math.floor(tilt / 2), 39, 5, 'k'); R(g, lx - 18, ly - 3 + Math.floor(tilt / 2), 37, 4, 'v'); R(g, lx - 18, ly - 3 + Math.floor(tilt / 2), 37, 1, 'u'); R(g, lx - 18, ly + Math.floor(tilt / 2), 37, 1, 'P');
    for (let r = 0; r < 18; r++) { const half = Math.max(1, Math.round(12 * (1 - r / 18)) + 1), off = -Math.round(r * 0.3) + (r > 11 ? -Math.round((r - 11) * 0.4) : 0); R(g, lx + off - half - 1, ly - 4 - r, half * 2 + 3, 1, 'k'); R(g, lx + off - half, ly - 4 - r, half * 2 + 1, 1, 'v'); R(g, lx + off - half, ly - 4 - r, 3, 1, 'u'); R(g, lx + off + half - 2, ly - 4 - r, 3, 1, 'P'); }
    R(g, lx - 12, ly - 9, 25, 3, 'k'); R(g, lx - 11, ly - 8, 23, 2, 'h'); R(g, lx - 11, ly - 8, 23, 1, 'y'); R(g, lx - 3, ly - 10, 7, 5, 'k'); R(g, lx - 2, ly - 9, 5, 3, 'o'); R(g, lx - 1, ly - 8, 3, 1, 'k');
    R(g, lx - 6, ly - 14, 1, 3, 'y'); R(g, lx - 7, ly - 13, 3, 1, 'y'); R(g, lx + 5, ly - 19, 1, 3, 'y'); R(g, lx + 4, ly - 18, 3, 1, 'y');
  }
  if (dim) { g.globalAlpha = 0.45; hvEll(g, x, cy, 19, 16, 'V'); R(g, x - 20, cy - 8, 41, 6, 'V'); g.globalAlpha = 1; }
}
function drawHagGame() {
  const cv = ui.circusWheel; if (cv.width !== HAG_W) return;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const G = hagGame, tt = G.t;
  if (!hagBg) hagBg = hagBgBuild();
  g.clearRect(0, 0, HAG_W, HAG_H); g.drawImage(hagBg, 0, 0);
  // небо: зорі, місяць, хмари, кажани
  for (let i = 0; i < 34; i++) { const sx = Math.floor(hvHash(i * 11 + 3) * HAG_W), sy = Math.floor(hvHash(i * 13 + 5) * 78), tw = Math.sin(tt * (1.2 + (i % 5) * 0.4) + i); if (tw > -0.4) { R(g, sx, sy, 1, 1, i % 4 ? 'w' : 'y'); if (i % 7 === 0 && tw > 0.5) { R(g, sx - 1, sy, 3, 1, 'y'); R(g, sx, sy - 1, 1, 3, 'y'); } } }
  hvMoon(g, 214, 34, 15, tt);
  [[18, 0.07, 3], [52, 0.05, 2], [70, 0.04, 2]].forEach(([cy, sp, sz], i) => { const cx = Math.round(((tt * sp * 60 + i * 110) % 330) - 40); g.globalAlpha = 0.85; hvEll(g, cx, cy, 20 * sz / 2 + 8, 4 + sz, 'P'); hvEll(g, cx + 12, cy - 3, 11 + sz * 2, 3 + sz, 'P'); R(g, cx - 14, cy + 2, 30, 1, 'V'); g.globalAlpha = 1; });
  for (let i = 0; i < 3; i++) hvBat(g, Math.round(((tt * (20 + i * 5) + i * 95) % 300) - 22), Math.round(26 + i * 15 + Math.sin(tt * 2 + i * 2) * 6), tt + i, 'k');
  // туман і світлячки над двором
  for (let L = 0; L < 2; L++) for (let k = 0; k < 4; k++) { const fx = Math.round(((tt * (4 + L * 3) + k * 84 + L * 40) % 340) - 40); g.globalAlpha = 0.08 + L * 0.03; hvEll(g, fx, 122 + L * 18, 40, 4 + L, 'w'); }
  g.globalAlpha = 1;
  for (let i = 0; i < 9; i++) { const fx = Math.round(20 + hvHash(i * 7) * 216 + Math.sin(tt * 0.7 + i) * 9), fy = Math.round(100 + hvHash(i * 5 + 1) * 48 + Math.cos(tt * 0.9 + i * 2) * 6), pl = 0.5 + 0.5 * Math.sin(tt * 2.3 + i * 1.7); g.globalAlpha = 0.12 * pl; disc(g, fx, fy, 4, 'y'); g.globalAlpha = 0.5 + 0.5 * pl; R(g, fx, fy, 1, 1, 'y'); g.globalAlpha = 1; }
  // грибочки, що світяться
  [[34, 150], [222, 152], [128, 156]].forEach(([mx, my], i) => { const gl = 0.5 + 0.5 * Math.sin(tt * 2 + i * 2); g.globalAlpha = 0.18 * gl; disc(g, mx, my - 3, 8, 'm'); g.globalAlpha = 1; R(g, mx - 1, my - 1, 3, 4, 'w'); R(g, mx - 3, my - 5, 7, 4, 'k'); R(g, mx - 2, my - 5, 5, 3, 'T'); R(g, mx - 1, my - 5, 2, 1, 'a'); R(g, mx - 2, my - 3, 1, 1, 'w'); });
  const list = G.c.map((c, i) => ({ c, i, p: hagPos(c) })).sort((a, b) => a.p.y - b.p.y);
  list.forEach(({ c, i, p }) => {
    hagCauldronV2(g, p.x, p.y, c.lid, tt, c.dim, i);
    if (c.lid < 0.6) {                                            // приз у золотому сяйві з променями
      const bob = Math.round(Math.sin(tt * 3 + i) * 2), a = Math.min(1, (0.6 - c.lid) / 0.4), py = p.y - 64 + bob;
      g.globalAlpha = 0.22 * a; disc(g, p.x, py, 22, 'w'); g.globalAlpha = 0.4 * a; disc(g, p.x, py, 15, 'y');
      g.globalAlpha = 0.5 * a; for (let k = 0; k < 8; k++) { const an = tt * 0.8 + k * Math.PI / 4; lineG(g, p.x + Math.round(Math.cos(an) * 14), py + Math.round(Math.sin(an) * 14), p.x + Math.round(Math.cos(an) * 24), py + Math.round(Math.sin(an) * 24), 'y'); }
      g.globalAlpha = a; drawCircusIcon(g, c.prize.icon || 'gem', p.x, py); g.globalAlpha = 1;
      if (G.phase === 'reveal' && i === G.pick) for (let k = 0; k < 10; k++) { const an = k * 0.628 + tt * 2, rr = 22 + (tt * 30 + k * 7) % 14; if (Math.floor(tt * 7 + k) % 2) R(g, p.x + Math.round(Math.cos(an) * rr), py + Math.round(Math.sin(an) * rr), 1, 1, k % 2 ? 'y' : 'w'); }
    }
  });
  if (G.phase === 'pick') list.forEach(({ p }) => { const b = Math.round(Math.abs(Math.sin(tt * 4)) * 4); R(g, p.x - 3, p.y - 68 - b, 7, 1, 'y'); R(g, p.x - 2, p.y - 67 - b, 5, 1, 'y'); R(g, p.x - 1, p.y - 66 - b, 3, 1, 'y'); R(g, p.x, p.y - 65 - b, 1, 1, 'y'); R(g, p.x - 4, p.y - 69 - b, 9, 1, 'h'); });
}
function hagPortraitV2(g, t) {                                         // портрет відьми 144×80: місяць, кажани, цвинтар, відьма з котом і свічкою
  if (g.canvas.width !== 144) { g.canvas.width = 144; g.canvas.height = 80; g.imageSmoothingEnabled = false; }
  g.clearRect(0, 0, 144, 80);
  R(g, 0, 0, 144, 18, 'V'); R(g, 0, 18, 144, 16, 'P'); R(g, 0, 34, 144, 12, 'v'); R(g, 0, 46, 144, 34, 'u');
  for (let x = 0; x < 144; x += 2) { R(g, x, 17 + (x % 4 ? 1 : 0), 2, 1, 'P'); R(g, x, 33 + (x % 4 ? 1 : 0), 2, 1, 'v'); R(g, x, 45 + (x % 4 ? 1 : 0), 2, 1, 'u'); }
  for (let i = 0; i < 24; i++) { const sx = Math.floor(hvHash(i * 9 + 2) * 144), sy = Math.floor(hvHash(i * 3 + 1) * 40); if (Math.sin(t * 2 + i) > -0.5) R(g, sx, sy, 1, 1, i % 3 ? 'w' : 'y'); }
  hvMoon(g, 22, 18, 11, t);
  hvBat(g, Math.round(((t * 14) % 190) - 20), Math.round(14 + Math.sin(t * 1.7) * 5), t, 'k'); hvBat(g, Math.round(130 - ((t * 10) % 170)), Math.round(30 + Math.sin(t * 1.3 + 1) * 4), t + 1, 'k');
  for (let x = 0; x < 144; x++) { const h = 56 + Math.round(Math.sin(x * 0.06 + 2) * 4); R(g, x, h, 1, 30, 'P'); }
  hvTree(g, 124, 62, 34, -1, 'V'); hvTree(g, 8, 64, 26, 1, 'V');
  [[100, 62], [112, 64], [20, 63]].forEach(([tx, ty]) => { R(g, tx - 3, ty - 6, 7, 7, 'V'); R(g, tx - 2, ty - 7, 5, 1, 'V'); R(g, tx - 1, ty - 5, 1, 3, 'P'); });
  // відьма: волосся ззаду, плащ, обличчя, капелюх
  const bob = Math.round(Math.sin(t * 2) * 1), cx = 68, cy = 46 + bob, blink = (t % 3.2) > 3.05;
  hvEll(g, cx, cy + 4, 19, 20, 'k'); hvEll(g, cx, cy + 4, 18, 19, 'f'); R(g, cx - 18, cy + 8, 5, 22, 'J'); R(g, cx + 13, cy + 8, 5, 22, 'J'); R(g, cx - 12, cy + 12, 2, 18, 'q');
  hvEll(g, cx, 82 + bob, 36, 20, 'k'); hvEll(g, cx, 82 + bob, 35, 19, 'P'); hvEll(g, cx - 6, 84 + bob, 28, 14, 'v'); R(g, cx - 36, 66 + bob, 72, 1, 'k');
  R(g, cx - 13, cy + 17, 27, 7, 'k'); R(g, cx - 12, cy + 17, 25, 6, 'V'); R(g, cx - 12, cy + 17, 4, 6, 'P'); R(g, cx - 6, cy + 22, 13, 3, 'k'); R(g, cx - 4, cy + 22, 9, 2, 'y'); R(g, cx - 1, cy + 22, 3, 3, 'f'); R(g, cx, cy + 22, 1, 1, 'q');
  R(g, cx - 24, cy + 26, 5, 20, 'k'); R(g, cx - 23, cy + 26, 3, 19, 'V');
  hvEll(g, cx, cy + 2, 13, 13, 'k'); hvEll(g, cx, cy + 2, 12, 12, 'W'); hvEll(g, cx, cy - 6, 11, 4, 'q');
  R(g, cx - 13, cy - 9, 27, 7, 'f'); R(g, cx - 13, cy - 9, 12, 2, 'q'); R(g, cx - 14, cy - 6, 4, 14, 'f'); R(g, cx + 11, cy - 6, 4, 14, 'f'); R(g, cx - 14, cy - 6, 1, 14, 'J'); R(g, cx + 14, cy - 6, 1, 14, 'J');
  R(g, cx - 4, cy - 10, 9, 4, 'f'); R(g, cx - 1, cy - 9, 3, 3, 'W');
  [-6, 5].forEach(ex => { if (blink) { R(g, cx + ex - 1, cy + 2, 5, 1, 'k'); } else { R(g, cx + ex, cy - 2, 3, 6, 'k'); R(g, cx + ex, cy - 2, 1, 2, 'w'); R(g, cx + ex + 1, cy + 3, 2, 1, 'z'); R(g, cx + ex - 1, cy - 3, 2, 1, 'k'); } });
  R(g, cx - 9, cy + 6, 5, 2, 'q'); R(g, cx + 6, cy + 6, 5, 2, 'q'); R(g, cx - 1, cy + 5, 3, 2, 'q');
  R(g, cx - 4, cy + 9, 9, 1, 'r'); R(g, cx - 5, cy + 8, 1, 1, 'r'); R(g, cx + 5, cy + 8, 1, 1, 'r'); R(g, cx - 3, cy + 10, 7, 1, 'r'); R(g, cx - 3, cy + 9, 1, 1, 'w'); R(g, cx + 3, cy + 9, 1, 1, 'w');
  R(g, cx - 24, cy - 14, 49, 7, 'k'); R(g, cx - 23, cy - 13, 47, 5, 'v'); R(g, cx - 23, cy - 13, 47, 1, 'u'); R(g, cx - 23, cy - 9, 47, 1, 'P');
  for (let r = 0; r < 30; r++) { const half = Math.max(1, Math.round(13 * (1 - r / 30)) + 1), off = -Math.round(r * 0.2) + (r > 20 ? -Math.round((r - 20) * 0.7 + Math.sin(t * 2) * 0.8) : 0); R(g, cx + off - half - 1, cy - 15 - r, half * 2 + 3, 1, 'k'); R(g, cx + off - half, cy - 15 - r, half * 2 + 1, 1, 'v'); R(g, cx + off - half, cy - 15 - r, 3, 1, 'u'); R(g, cx + off + half - 3, cy - 15 - r, 4, 1, 'P'); }
  R(g, cx - 14, cy - 20, 29, 5, 'k'); R(g, cx - 13, cy - 19, 27, 3, 'h'); R(g, cx - 13, cy - 19, 27, 1, 'y'); R(g, cx - 4, cy - 22, 9, 8, 'k'); R(g, cx - 3, cy - 21, 7, 6, 'o'); R(g, cx - 2, cy - 20, 5, 4, 'y'); R(g, cx - 1, cy - 19, 3, 2, 'k');
  R(g, cx + 6, cy - 32, 1, 3, 'y'); R(g, cx + 5, cy - 31, 3, 1, 'y'); R(g, cx - 10, cy - 28, 1, 3, 'y'); R(g, cx - 11, cy - 27, 3, 1, 'y');
  // кіт на правому плечі, свічка й гарбузик на підвіконні
  const bl = (t % 4) > 3.8, tw = Math.round(Math.sin(t * 2.5) * 2);
  R(g, 100, 54, 13, 16, 'k'); R(g, 99, 52, 4, 5, 'k'); R(g, 109, 52, 4, 5, 'k'); hvEll(g, 106, 58, 6, 6, 'k'); R(g, 102, 58, 2, 2, bl ? 'k' : 'y'); R(g, 108, 58, 2, 2, bl ? 'k' : 'y'); R(g, 105, 61, 2, 1, 'q'); R(g, 112, 62, 4, 2, 'k'); R(g, 115 + tw, 58, 2, 6, 'k'); R(g, 116 + tw, 56, 2, 3, 'k');
  R(g, 0, 70, 144, 10, 'k'); R(g, 0, 71, 144, 3, 'b'); R(g, 0, 71, 144, 1, 'l'); R(g, 0, 74, 144, 6, 'd'); for (let x = 6; x < 144; x += 22) R(g, x, 75, 8, 1, 'k');
  R(g, 10, 60, 7, 11, 'w'); R(g, 10, 60, 2, 11, 'E'); R(g, 12, 56, 3, 4, Math.floor(t * 9) % 2 ? 'h' : 'o'); R(g, 13, 54, 1, 3, 'y'); g.globalAlpha = 0.09; disc(g, 13, 58, 17, 'y'); g.globalAlpha = 0.14; disc(g, 13, 58, 11, 'y'); g.globalAlpha = 1;
  R(g, 26, 62, 11, 9, 'k'); R(g, 27, 63, 9, 7, 'o'); R(g, 27, 63, 3, 7, 'h'); R(g, 29, 65, 2, 2, 'y'); R(g, 33, 65, 2, 2, 'y'); R(g, 29, 68, 5, 1, 'y'); R(g, 30, 60, 3, 3, 'g');
  R(g, 118, 64, 12, 7, 'w'); R(g, 119, 64, 10, 1, 'E'); R(g, 120, 66, 2, 2, 'k'); R(g, 126, 66, 2, 2, 'k'); R(g, 122, 69, 4, 1, 'k');
}
