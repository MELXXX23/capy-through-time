//#part 230_a4_hag_hut.js
/* Хатка на курячих лапках v2 (канва 160×84): лапи, паркан із черепами, колоди, вікна з котом і свічкою, двері з черепом, вигнутий дах-капелюх, сова, димар. */
function hutLeg(g, x, hipY, footY, lift, sw) {                      // куряча лапа: пір'яста «галіфе», луската гомілка, суглоб, три пальці з пазурами й задній
  const fy = footY - lift, ax = x + sw, ay = fy - 6, y0 = hipY + 8;
  for (let d = -3; d <= 3; d++) lineG(g, x + d, y0, ax + d, ay, 'k');
  for (let d = -2; d <= 2; d++) lineG(g, x + d, y0, ax + d, ay, 'h');
  for (let d = -2; d <= -1; d++) lineG(g, x + d, y0, ax + d, ay, 'y');
  for (let d = 1; d <= 2; d++) lineG(g, x + d, y0, ax + d, ay, 'o');
  for (let k = 1; k < 5; k++) { const px = Math.round(x + (ax - x) * k / 5), py = Math.round(y0 + (ay - y0) * k / 5); R(g, px - 2, py, 5, 1, 'd'); R(g, px - 2, py - 1, 2, 1, 'y'); }
  R(g, x - 10, hipY - 1, 21, 10, 'k'); R(g, x - 9, hipY, 19, 8, 'w'); R(g, x - 9, hipY, 6, 8, 'W'); R(g, x + 5, hipY, 5, 8, 'E');
  for (let i = 0; i < 5; i++) { R(g, x - 9 + i * 4, hipY + 8, 3, 2 + (i % 2), 'k'); R(g, x - 8 + i * 4, hipY + 8, 1, 1 + (i % 2), 'w'); }
  R(g, x - 6, hipY + 2, 1, 4, 'E'); R(g, x - 1, hipY + 1, 1, 5, 'E'); R(g, x + 3, hipY + 2, 1, 4, 'E');
  R(g, ax - 6, ay - 1, 12, 5, 'k'); R(g, ax - 5, ay, 10, 3, 'h'); R(g, ax - 5, ay, 4, 1, 'y'); R(g, ax + 2, ay + 2, 3, 1, 'o');
  [[-1, -10], [0, 0], [1, 10]].forEach(([s0, dx]) => {            // пальці віялом із темними пазурами
    for (let d = 0; d < 3; d++) lineG(g, ax + s0 + d - 1, ay + 3, ax + dx + d - 1, fy, 'k');
    lineG(g, ax + s0, ay + 3, ax + dx, fy, 'h'); lineG(g, ax + s0 + 1, ay + 3, ax + dx + 1, fy, 'o');
    R(g, ax + dx - 2, fy - 1, 5, 2, 'k'); R(g, ax + dx - 1, fy - 1, 3, 1, 'w');
  });
  R(g, ax - 14, fy - 1, 4, 2, 'k'); R(g, ax + 11, fy - 1, 4, 2, 'k');
}
function hutFace(g, cx, top, t) {                                   // Баба Яга у дверях: капелюх, рожеве волосся, усмішка
  const blink = (t % 3.2) > 3.05;
  R(g, cx - 2, top - 2, 5, 1, 'k'); R(g, cx - 3, top - 1, 7, 1, 'k'); R(g, cx - 1, top - 1, 3, 1, 'v'); R(g, cx - 6, top, 13, 3, 'k'); R(g, cx - 5, top, 11, 2, 'v'); R(g, cx - 5, top + 1, 11, 1, 'P'); R(g, cx - 1, top - 1, 3, 1, 'y');
  R(g, cx - 6, top + 3, 3, 9, 'f'); R(g, cx + 4, top + 3, 3, 9, 'f'); R(g, cx - 6, top + 3, 1, 9, 'J'); R(g, cx + 6, top + 3, 1, 9, 'J');
  R(g, cx - 3, top + 3, 7, 8, 'W'); R(g, cx - 3, top + 3, 7, 1, 'f'); R(g, cx - 3, top + 3, 2, 2, 'f');
  if (blink) { R(g, cx - 2, top + 7, 2, 1, 'k'); R(g, cx + 2, top + 7, 2, 1, 'k'); } else { R(g, cx - 2, top + 6, 1, 2, 'k'); R(g, cx + 2, top + 6, 1, 2, 'k'); }
  R(g, cx - 3, top + 8, 2, 1, 'q'); R(g, cx + 3, top + 8, 2, 1, 'q'); R(g, cx, top + 9, 2, 1, 'r'); R(g, cx - 2, top + 11, 5, 1, 'W');
}
function hutV2(g, t, s, moving) {                                   // 160×84; s — присідання (0 — на лапках, 1 — стоїть), moving — іде
  g.clearRect(0, 0, 160, 84);
  const ss = s * s * (3 - 2 * s), walk = moving ? t * 5.2 : 0;
  const bob = moving ? Math.round(Math.abs(Math.sin(walk)) * 1.6) : 0, hipY = 56 + Math.round(ss * 18) - bob;
  const cabB = hipY + 3, cabH = 32, cabT = cabB - cabH, x0 = 44, x1 = 116, W = x1 - x0, groundY = 83;
  const stA = moving ? Math.sin(walk) : 0, stB = moving ? Math.sin(walk + Math.PI) : 0;
  hutLeg(g, 66, hipY, groundY, Math.round(Math.max(0, stA) * 8), Math.round(stA * 3));
  hutLeg(g, 96, hipY, groundY, Math.round(Math.max(0, stB) * 8), Math.round(stB * 3));
  // кістяний паркан, черепи з вогником і гарбузи, коли хатка присіла
  if (ss > 0.5) {
    const a = Math.min(1, (ss - 0.5) * 2); g.globalAlpha = a;
    R(g, 24, 74, 112, 1, 'k'); R(g, 24, 75, 112, 1, 'E');
    [[14, 0], [26, 1], [134, 1], [146, 0]].forEach(([fx, tall]) => {
      const ty = 62 + tall * 3; R(g, fx - 1, ty + 6, 4, 22 - tall * 3, 'k'); R(g, fx, ty + 6, 2, 21 - tall * 3, 'w');
      R(g, fx - 4, ty, 10, 8, 'k'); R(g, fx - 3, ty + 1, 8, 6, 'w'); R(g, fx - 3, ty + 1, 3, 3, 'W');
      const fl = Math.floor(t * 7 + fx) % 3; R(g, fx - 2, ty + 3, 2, 2, fl ? 'o' : 'y'); R(g, fx + 2, ty + 3, 2, 2, fl ? 'o' : 'y');
      R(g, fx - 2, ty + 7, 6, 1, 'k'); R(g, fx - 1, ty + 7, 1, 1, 'w'); R(g, fx + 1, ty + 7, 1, 1, 'w'); R(g, fx - 5, ty + 14, 2, 1, 'E'); R(g, fx + 4, ty + 17, 2, 1, 'E');
    });
    [[52, 80, 0], [108, 80, 1]].forEach(([px, py, v]) => {
      const gl = 0.2 + 0.1 * Math.sin(t * 5 + px); g.globalAlpha = a * gl; disc(g, px, py - 3, 10, 'y'); g.globalAlpha = a;
      R(g, px - 7, py - 7, 15, 9, 'k'); R(g, px - 6, py - 6, 13, 7, 'o'); R(g, px - 6, py - 6, 4, 7, 'h'); R(g, px + 3, py - 6, 4, 7, 'r'); R(g, px - 1, py - 6, 1, 7, 'r');
      R(g, px - 4, py - 4, 2, 2, 'y'); R(g, px + 2, py - 4, 2, 2, 'y'); R(g, px - 3, py - 1, 7, 1, 'y'); R(g, px - 2, py - 1, 1, 1, 'k'); R(g, px + 1, py - 1, 1, 1, 'k');
      R(g, px - 1, py - 9, 3, 3, 'k'); R(g, px, py - 9, 2, 2, 'g'); R(g, px + 2, py - 10, 3, 1, 'g'); R(g, px + (v ? 4 : -4), py - 9, 1, 1, 'g');
    });
    g.globalAlpha = 1;
  }
  // стіни з колод: світло зліва-зверху, торці колод по кутах, мох
  R(g, x0, cabT, W, cabH, 'k'); R(g, x0 + 1, cabT + 1, W - 2, cabH - 2, 'b');
  for (let y = cabT + 1, k = 0; y < cabB - 3; y += 6, k++) {
    R(g, x0 + 1, y, W - 2, 1, 'l'); R(g, x0 + 1, y + 5, W - 2, 1, 'd');
    for (let i = 0; i < 4; i++) R(g, x0 + 5 + ((i * 19 + k * 11) % (W - 12)), y + 2 + (i + k) % 2, 3 + (i % 2), 1, 'd');
    R(g, x0 - 3, y, 6, 6, 'k'); R(g, x0 - 2, y + 1, 4, 4, 'c'); R(g, x0 - 1, y + 2, 2, 2, 'h'); R(g, x1 - 3, y, 6, 6, 'k'); R(g, x1 - 2, y + 1, 4, 4, 'c'); R(g, x1 - 1, y + 2, 2, 2, 'h');
  }
  R(g, x0 + 1, cabB - 7, 9, 3, 'g'); R(g, x0 + 2, cabB - 7, 4, 1, 'm'); R(g, x1 - 12, cabB - 6, 11, 3, 'g'); R(g, x1 - 10, cabB - 6, 4, 1, 'm'); R(g, x0 + 30, cabT + 1, 10, 2, 'g');
  // вікна: тепле мерехтливе світло, фіолетові віконниці з місяцем, підвіконня, кіт і свічка
  const wf = Math.floor(t * 6) % 7 === 0 ? 'h' : 'y';
  [50, 98].forEach((wx, wi) => {
    const wy = cabT + 8;
    [-5, 13].forEach((ox, si) => { R(g, wx + ox, wy - 1, 5, 15, 'k'); R(g, wx + ox + 1, wy, 3, 13, 'P'); R(g, wx + ox + 1, wy, 1, 13, 'v'); R(g, wx + ox + 2, wy + 3 + si, 1, 1, 'y'); R(g, wx + ox + 2, wy + 9, 1, 2, 'V'); });
    R(g, wx - 1, wy - 2, 14, 16, 'k'); R(g, wx + 1, wy - 2, 10, 1, 'd');
    [[0, 0], [7, 0], [0, 7], [7, 7]].forEach(([dx, dy]) => { R(g, wx + dx, wy + dy, 5, 6, wf); R(g, wx + dx, wy + dy, 2, 1, 'w'); R(g, wx + dx, wy + dy + 5, 5, 1, 'h'); });
    R(g, wx + 5, wy, 2, 13, 'd'); R(g, wx, wy + 5, 12, 2, 'd');
    R(g, wx, wy, 3, 2, 'r'); R(g, wx + 9, wy, 3, 2, 'r'); R(g, wx, wy + 2, 1, 2, 'r'); R(g, wx + 11, wy + 2, 1, 2, 'r');
    R(g, wx - 3, wy + 13, 18, 3, 'k'); R(g, wx - 2, wy + 13, 16, 1, 'l'); R(g, wx - 2, wy + 14, 16, 1, 'd');
    if (wi === 0) { const bl = (t % 4) > 3.8; R(g, wx + 1, wy + 7, 5, 6, 'k'); R(g, wx + 1, wy + 5, 2, 3, 'k'); R(g, wx + 5, wy + 5, 2, 3, 'k'); R(g, wx + 2, wy + 8, 1, 1, bl ? 'k' : 'y'); R(g, wx + 4, wy + 8, 1, 1, bl ? 'k' : 'y'); R(g, wx + 6, wy + 9, 3, 1, 'k'); R(g, wx + 7, wy + 8, 1, 1, 'k'); }
    else { R(g, wx + 7, wy + 7, 3, 6, 'w'); R(g, wx + 7, wy + 7, 1, 6, 'E'); R(g, wx + 8, wy + 5, 1, 2, Math.floor(t * 9) % 2 ? 'h' : 'o'); R(g, wx + 8, wy + 4, 1, 1, 'y'); }
  });
  // двері: дошки, залізні пояси, череп-стукалка; відчиняються й видно Бабу Ягу
  const open = Math.max(0, Math.min(1, (s - 0.6) / 0.3));
  R(g, 71, cabB - 26, 19, 26, 'k'); R(g, 72, cabB - 27, 17, 1, 'k'); R(g, 73, cabB - 25, 15, 25, open > 0.05 ? 'k' : 'P');
  if (open > 0.05) {
    R(g, 74, cabB - 24, 13, 24, 'o'); R(g, 74, cabB - 24, 13, 9, 'h'); R(g, 74, cabB - 24, 13, 2, 'y');
    if (s > 0.85) { const wv = Math.floor(t * 2.5) % 2; hutFace(g, 80, cabB - 22, t); R(g, 76, cabB - 9, 9, 9, 'k'); R(g, 77, cabB - 9, 7, 9, 'P'); R(g, 77, cabB - 9, 2, 9, 'v'); R(g, wv ? 85 : 86, cabB - 13 - wv * 2, 2, 5, 'm'); R(g, wv ? 85 : 86, cabB - 14 - wv * 2, 2, 2, 'W'); }
    R(g, 73, cabB - 25, Math.max(1, Math.round(3 * (1 - open))), 25, 'P');
  } else {
    R(g, 74, cabB - 24, 13, 24, 'P'); R(g, 74, cabB - 24, 3, 24, 'v'); R(g, 80, cabB - 24, 1, 24, 'V'); R(g, 85, cabB - 24, 2, 24, 'V');
    R(g, 74, cabB - 19, 13, 2, 'k'); R(g, 74, cabB - 18, 13, 1, 'Y'); R(g, 74, cabB - 9, 13, 2, 'k'); R(g, 74, cabB - 8, 13, 1, 'Y');
    R(g, 78, cabB - 16, 6, 6, 'k'); R(g, 79, cabB - 15, 4, 4, 'w'); R(g, 79, cabB - 15, 1, 1, 'W'); R(g, 79, cabB - 14, 1, 1, 'k'); R(g, 81, cabB - 14, 1, 1, 'k'); R(g, 80, cabB - 12, 2, 1, 'k');
    const kg = Math.floor(t * 3) % 2; R(g, 84, cabB - 4, 2, 2, kg ? 'y' : 'h');
  }
  R(g, 70, cabB, 21, 3, 'k'); R(g, 71, cabB, 19, 2, 'E'); R(g, 71, cabB, 19, 1, 'w');
  // дах: вигнутий капелюх-конус із фіолетової черепиці, місячні латки, загнута верхівка
  const apex = cabT - 27, rows = 27, ov = 9, half0 = W / 2 + ov;
  for (let r = 0; r < rows; r++) {
    const u = (r + 1) / rows, half = Math.max(1, Math.round(half0 * Math.pow(u, 0.78))), bend = -Math.round(Math.pow(Math.max(0, (9 - r) / 9), 2) * 6), cx = 80 + bend, y = apex + r;
    R(g, cx - half, y, half * 2, 1, 'k');
    const tr = Math.floor(r / 3), rr = r % 3;
    R(g, cx - half + 1, y, half * 2 - 2, 1, rr === 2 ? 'V' : 'P');
    for (let k = ((tr % 2) * 3); k < half * 2 - 2; k += 6) { if (rr === 0) R(g, cx - half + 1 + k, y, 3, 1, 'v'); if (rr === 2) R(g, cx - half + 1 + k + 5, y, 1, 1, 'k'); }
    if (rr === 0) R(g, cx - half + 1, y, Math.min(4, half * 2 - 2), 1, 'u');
    if ((r * 7 + 3) % 13 < 2 && half > 8) { const px = cx - half + 6 + (r * 5) % Math.max(4, half * 2 - 14); R(g, px, y, 3, 1, 'h'); R(g, px + 1, y - 1, 1, 1, 'y'); }
  }
  R(g, 80 - half0, cabT - 2, half0 * 2, 4, 'k'); R(g, 80 - half0 + 1, cabT - 1, half0 * 2 - 2, 2, 'E'); R(g, 80 - half0 + 1, cabT - 1, half0 * 2 - 2, 1, 'w');
  for (let i = 0; i < 9; i++) { R(g, 80 - half0 + 4 + i * 9, cabT + 2, 2, 3 + (i % 3), 'k'); R(g, 80 - half0 + 4 + i * 9, cabT + 2, 1, 2 + (i % 3), 'w'); }
  R(g, 74, apex - 1, 4, 3, 'k'); R(g, 75, apex - 1, 2, 2, 'y');
  // димар із каменю, зелений дим
  R(g, 101, apex + 8, 11, 17, 'k'); R(g, 102, apex + 9, 9, 16, 'e'); R(g, 102, apex + 9, 3, 16, 'E'); R(g, 100, apex + 7, 13, 3, 'k'); R(g, 101, apex + 7, 11, 2, 'E');
  for (let r = 0; r < 4; r++) R(g, 102, apex + 12 + r * 4, 9, 1, 'd');
  for (let k = 0; k < 5; k++) { const ph = (t * 0.45 + k / 5) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.7; const sz = 3 + Math.round(ph * 3); R(g, 103 + Math.round(Math.sin(t * 1.3 + k * 2) * 4) + Math.round(ph * 9), apex + 3 - Math.round(ph * 24), sz, sz - 1, k % 2 ? 'm' : 'g'); }
  g.globalAlpha = 1;
  // сова на даху, ліхтарик і гірлянда мініатюрних гарбузів
  const ob = (t % 3.6) > 3.45;
  R(g, 55, apex + 15, 9, 10, 'k'); R(g, 56, apex + 16, 7, 8, 'b'); R(g, 56, apex + 16, 2, 8, 'c'); R(g, 55, apex + 14, 2, 2, 'k'); R(g, 62, apex + 14, 2, 2, 'k');
  R(g, 57, apex + 18, 2, 2, ob ? 'b' : 'y'); R(g, 61, apex + 18, 2, 2, ob ? 'b' : 'y'); R(g, 59, apex + 20, 2, 2, 'h'); R(g, 57, apex + 24, 5, 1, 'w');
  const lf = wf === 'h' ? 'h' : 'o';
  R(g, 52, cabT + 1, 1, 6, 'k'); R(g, 49, cabT + 7, 7, 9, 'k'); R(g, 50, cabT + 8, 5, 7, lf); R(g, 50, cabT + 8, 2, 7, 'y'); R(g, 52, cabT + 10, 1, 3, 'w');
  for (let i = 0; i < 7; i++) { const gx = 52 + i * 10, gy = cabT + 3 + Math.round(Math.sin(i * 0.9) * 1.5); if (gx > 112) break; R(g, gx - 2, gy, 5, 4, 'k'); R(g, gx - 1, gy, 3, 3, i % 2 ? 'o' : 'h'); R(g, gx, gy, 1, 3, 'r'); }
}
