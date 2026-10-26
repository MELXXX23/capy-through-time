//#part 220_c_epoch_sky_fx.js
const INV_ART = [
  ['..#....#..', '...#..#...', '..######..', '.##.##.##.', '##########', '#.######.#', '#.#....#.#', '...##.##..'],
  ['...####...', '.########.', '##########', '###..##..#', '##########', '..##..##..', '.##.##.##.', '##......##'],
  ['..#....#..', '#..#..#..#', '#.######.#', '###.##.###', '##########', '.########.', '..#....#..', '.#......#.']];
function skyxInvader(x, y, ph, v) {                                // піксельний прибулець: двокадрова анімація, ступінчастий рух
  const art = INV_ART[v % 3], step = Math.floor(ph * 2) % 2, col = ['g', 'f', 'T'][v % 3];
  x = Math.round(x / 2) * 2; y = Math.round(y);
  const at = (i, j) => { const sx = (step && j >= 6) ? (i < 5 ? -1 : 1) : 0; return [x - 5 + i + sx, y + j]; };       // нижні «ніжки» розходяться на другому кадрі
  art.forEach((row, j) => { for (let i = 0; i < 10; i++) if (row[i] === '#') { const p = at(i, j); R(ctx, p[0] + 1, p[1] + 1, 1, 1, 'd'); } });
  art.forEach((row, j) => { for (let i = 0; i < 10; i++) if (row[i] === '#') { const p = at(i, j); R(ctx, p[0], p[1], 1, 1, col); } });
  R(ctx, x - 3, y + 3, 1, 1, 'd'); R(ctx, x + 2, y + 3, 1, 1, 'd');
}
function skyxButterfly(x, y, ph, c) {                              // метелик: крила змахують, опускаючись і піднімаючись
  x = Math.round(x); y = Math.round(y);
  const f = Math.floor(ph * 3) % 3, wH = [4, 2, 0][f];
  R(ctx, x, y - 1, 1, 3, 'd');
  R(ctx, x - 3, y - wH, 3, wH + 1, c[0]); R(ctx, x + 1, y - wH, 3, wH + 1, c[0]);
  R(ctx, x - 2, y + 1, 2, 1, c[1]); R(ctx, x + 1, y + 1, 2, 1, c[1]);
  R(ctx, x - 3, y - wH, 3, 1, 'd'); R(ctx, x + 1, y - wH, 3, 1, 'd');
}
// Планета з кільцем і місяць: малюються один раз піксель за пікселем зі світлом зверху зліва (опукла куля, терминатор, відбите світло, тінь кільця)
let SPACE_PL = null;
function spacePlanets() {
  if (SPACE_PL) return SPACE_PL;
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];                       // матриця 4×4 для м'якого переходу між тонами
  const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const put = (g, x, y, hex, a) => { g.globalAlpha = a === undefined ? 1 : a; g.fillStyle = hex; g.fillRect(x, y, 1, 1); g.globalAlpha = 1; };
  const tone = (ramp, v, x, y, flat) => { const f = Math.max(0, Math.min(0.999, v)) * (ramp.length - 1), i = Math.floor(f), fr = f - i; const th = flat ? 0.5 : 0.5 + ((BAY[(y & 3) * 4 + (x & 3)] + 0.5) / 16 - 0.5) * 0.55; return ramp[i + (fr > th ? 1 : 0)]; };
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  const L = (() => { const x = -0.58, y = -0.55, z = 0.6, n = Math.hypot(x, y, z); return [x / n, y / n, z / n]; })();
  // ---------- планета ----------
  const R0 = 17, W = 92, H = 64, CX = 46, CY = 32, K = 0.26, TILT = -0.3, ct = Math.cos(TILT), st = Math.sin(TILT);
  const pc = mk(W, H), pg = pc.getContext('2d');
  const pRamp = ['#3a1840', '#6e2a4c', '#b04a3a', '#e07a34', '#f6a84a', '#ffd88e', '#fff1c4'];
  const rRamp = ['#6a4a52', '#a07a64', '#d2a878', '#f2d9a0', '#fff0c8'];
  const rot = (px, py) => { const dx = px - CX, dy = py - CY; return [dx * ct + dy * st, -dx * st + dy * ct]; };        // у площину кільця
  const ringAt = (px, py) => { const [u, v] = rot(px, py), s = Math.hypot(u, v / K); return { u, v, s }; };
  const inRing = s => (s >= 1.42 * R0 && s <= 1.72 * R0) || (s >= 1.8 * R0 && s <= 2.22 * R0);
  const ringTone = (s, px, py, shadow) => {
    const wob = noise(s * 0.9, 3.1) * 0.5 + noise(s * 2.4, 7.7) * 0.5;
    let v = 0.55 + 0.35 * Math.sin(s * 0.85) * 0.5 + (wob - 0.5) * 0.45 - (s > 1.72 * R0 ? 0.06 : 0);
    if (s > 2.1 * R0) v -= 0.18;                                                                                          // край кільця темніший
    if (shadow) v *= 0.32;
    return tone(rRamp, v, px, py, true);
  };
  const ringShadowed = (u, v) => {                                                                                       // тінь планети на кільці: промінь до світла перетинає кулю
    const X = u, Z = v / K, Lx = L[0], Lz = L[2];                                             // кільце лежить горизонтально, світло трохи зверху
    const bq = X * Lx + Z * Lz, cq = X * X + Z * Z - R0 * R0, disc2 = bq * bq - cq * (Lx * Lx + Lz * Lz);
    if (disc2 < 0) return false; const t = (-bq - Math.sqrt(disc2)) / (Lx * Lx + Lz * Lz); return t > 0;
  };
  // 1) далека половина кільця (за планетою)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const r = ringAt(x + 0.5, y + 0.5); if (r.v < 0 && inRing(r.s)) put(pg, x, y, ringTone(r.s, x, y, ringShadowed(r.u, r.v))); }
  // 2) куля
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x + 0.5 - CX) / R0, dy = (y + 0.5 - CY) / R0, d2 = dx * dx + dy * dy; if (d2 > 1) continue;
    const nz = Math.sqrt(1 - d2), lam = Math.max(0, dx * L[0] + dy * L[1] + nz * L[2]);
    const lat = dy * 1.15, bands = Math.sin(lat * 9 + noise(dx * 3 + 4, dy * 5) * 2.2) * 0.5 + 0.5, fine = noise(dx * 9 + 1, dy * 24) - 0.5;
    let alb = 0.55 + (bands - 0.5) * 0.34 + fine * 0.16;
    const sx = dx + 0.28, sy = dy - 0.34, spot = sx * sx / 0.028 + sy * sy / 0.012;                                       // велика буря
    if (spot < 1) alb -= 0.2 * (1 - spot); if (spot < 0.35) alb += 0.1;
    let v = (0.06 + lam * 0.94) * (0.45 + alb * 0.7);
    v += Math.pow(1 - nz, 3) * -0.12;                                                                                     // край кулі темніший
    const lit = Math.max(0, dx * -L[0] + dy * -L[1]) * Math.pow(1 - nz, 2.2) * 0.2;                                       // відбите світло з боку тіні
    // тінь кільця на кулі
    const r2 = ringAt(x + 0.5 - 2.5, y + 0.5 - 3.5);
    if (r2.v > 0 && inRing(r2.s)) v *= 0.55;
    put(pg, x, y, tone(pRamp, v + lit, x, y));
  }
  // світла кромка зверху зліва й теплий ореол
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x + 0.5 - CX) / R0, dy = (y + 0.5 - CY) / R0, d = Math.hypot(dx, dy);
    if (d > 1 && d < 1.2) { const lit = Math.max(0, (-dx * 0.58 - dy * 0.55) / 0.8); if (lit > 0.1) put(pg, x, y, '#ffb860', (1.2 - d) * 0.85 * lit); }
    if (d >= 0.93 && d <= 1) { const lit = Math.max(0, (-dx * 0.58 - dy * 0.55) / 0.8); if (lit > 0.55) put(pg, x, y, '#ffe9b0', 0.55 * (lit - 0.55) / 0.45); }
  }
  // 3) близька половина кільця (перед планетою)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const r = ringAt(x + 0.5, y + 0.5); if (r.v >= 0 && inRing(r.s)) put(pg, x, y, ringTone(r.s, x, y, false)); }
  // яскраві краї кільця на світлому боці
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const r = ringAt(x + 0.5, y + 0.5); if (inRing(r.s) && r.v >= 0 && Math.abs(r.s - 1.42 * R0) < 0.7) put(pg, x, y, '#fff6d8', 0.55); }
  // ---------- місяць ----------
  const MR = 10, MS = 2 * MR + 8, mcv = mk(MS, MS), mg = mcv.getContext('2d'), MC = MS / 2;
  const mRamp = ['#1c2240', '#3a4670', '#6a789e', '#a2b0cc', '#dce6f6', '#ffffff'];
  const craters = [[-0.42, -0.38, 0.28], [0.34, -0.05, 0.22], [-0.1, 0.46, 0.2], [0.18, -0.55, 0.14], [-0.55, 0.12, 0.13], [0.5, 0.42, 0.14]];
  for (let y = 0; y < MS; y++) for (let x = 0; x < MS; x++) {
    const dx = (x + 0.5 - MC) / MR, dy = (y + 0.5 - MC) / MR, d2 = dx * dx + dy * dy; if (d2 > 1) continue;
    const nz = Math.sqrt(1 - d2), lam = Math.max(0, dx * L[0] + dy * L[1] + nz * L[2]);
    let v = 0.04 + lam * 0.96; v *= 0.78 + (noise(dx * 6 + 9, dy * 6) - 0.5) * 0.3;
    craters.forEach(([cx, cy, cr]) => {
      const ex = dx - cx, ey = dy - cy, e = Math.hypot(ex, ey);
      if (e < cr * 0.92) v *= 0.55 + e / cr * 0.3;                                                                       // дно кратера темніше
      else if (e < cr * 1.22) { const side = (ex * L[0] + ey * L[1]) / (e || 1); v += side < 0 ? 0.2 : -0.16; }        // освітлений валик з боку світла, тінь з іншого
    });
    v += Math.pow(1 - nz, 2.5) * -0.1;
    const rim = Math.max(0, dx * -L[0] + dy * -L[1]) * Math.pow(1 - nz, 2.4) * 0.22;                                      // відсвіт планети з боку тіні
    put(mg, x, y, tone(mRamp, v + rim, x, y));
  }
  for (let y = 0; y < MS; y++) for (let x = 0; x < MS; x++) { const dx = (x + 0.5 - MC) / MR, dy = (y + 0.5 - MC) / MR, d = Math.hypot(dx, dy); if (d > 1 && d < 1.35) { const lit = Math.max(0, (-dx * 0.58 - dy * 0.55) / 0.8); put(mg, x, y, '#9ec0ff', (1.35 - d) * 0.5 * lit); } }
  SPACE_PL = { planet: pc, planetCx: CX, planetCy: CY, moon: mcv, moonCx: MC, moonCy: MC };
  return SPACE_PL;
}
// Диско: великі прожектори на щоглах за будинками. Стоять на місці у світі (рухаються разом із камерою), кожен має три промені, що гойдаються й блимають різними кольорами
const DISCO_COLS = ['f', 'T', 'y', 'N', 'p', 'j'];
function discoLamps(time) {
  const W = worldR() - worldL(), n = Math.max(4, Math.round(W / 170)), a0 = 0.16 + 0.22 * sky.night, on = animOn();
  for (let k = 0; k < n; k++) {
    const hx = hash2(k * 31, 9), x = Math.round(worldL() + (k + 0.5) * W / n + (hx % 30) - 15), y = -18 + (hx >>> 5) % 16, ph = k * 1.9;
    if (x < visL() - 170 || x > visR() + 170) continue;                              // поза кадром не малюємо
    R(ctx, x - 1, y + 6, 3, LAYOUT.horizonY - y - 6, 'd');                          // щогла (нижню частину закривають будинки)
    for (let b = 0; b < 3; b++) {
      const ang = -Math.PI / 2 + (b - 1) * 0.62 + (on ? Math.sin(time * (0.7 + b * 0.23) + ph + b * 2.1) * 0.55 : 0), len = 118 + b * 14;
      const idx = Math.floor((on ? time * 1.3 : 0) + k + b * 2) % DISCO_COLS.length, blink = on ? Math.floor(time * 2.2 + ph + b * 1.7) % 4 !== 0 : true;
      if (!blink) continue;
      ctx.globalAlpha = a0; ctx.fillStyle = PALETTE[DISCO_COLS[idx]];
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang - 0.12) * len, y + Math.sin(ang - 0.12) * len); ctx.lineTo(x + Math.cos(ang + 0.12) * len, y + Math.sin(ang + 0.12) * len); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = a0 * 0.9; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang - 0.04) * len, y + Math.sin(ang - 0.04) * len); ctx.lineTo(x + Math.cos(ang + 0.04) * len, y + Math.sin(ang + 0.04) * len); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const lens = DISCO_COLS[Math.floor((on ? time * 2 : 0) + k) % DISCO_COLS.length];              // корпус прожектора з кольоровою лінзою, що змінюється
    ctx.globalAlpha = 0.22; disc(ctx, x, y, 15, lens); ctx.globalAlpha = 0.4; disc(ctx, x, y, 11, lens); ctx.globalAlpha = 1;
    disc(ctx, x, y, 8, 'd'); disc(ctx, x, y, 7, 'e'); disc(ctx, x - 1, y - 1, 5, 'E'); disc(ctx, x, y, 5, 'd'); disc(ctx, x, y, 4, lens); disc(ctx, x - 1, y - 1, 2, 'w');
    R(ctx, x - 5, y + 7, 11, 2, 'd'); R(ctx, x - 5, y + 7, 11, 1, 'e');
  }
}
function drawSkyExtra(time) {
  const ep = SKYX.ep, top = 8 - view.offY, noFly = !!state.settings.noFly;
  { const A = ARCH[currentEpoch().id]; if (A && A.skyExtra) A.skyExtra(time, noFly); }
  if (ep === 2) {                                                         // Диско: лазерний віяр над дахами
    discoLamps(time);
    for (let i = 0; i < 6; i++) { const sx = Math.round(worldL() + 20 + i * (view.w - 40) / 5), sy = top + 6 + (i * 13) % 34, v = Math.sin(time * 2.4 + i * 1.7); if (v > 0.3) sparkPlus(sx, sy, (v - 0.3) / 0.7, i % 2 ? '#fff6b0' : '#ffd0f0'); }
  }
  if (ep === 6) {                                                         // Космос: планета з кільцем і місяць
    const spl = spacePlanets(), wl = worldL(), ww = worldR() - worldL();
    const pxp = Math.round(wl + ww * 0.6), pyp = top + 40;                                   // планета й місяць прикріплені до світу: при русі камери стоять на місці, як будинки
    const mxp = Math.round(wl + ww * 0.4), myp = top + 22;
    ctx.drawImage(spl.planet, pxp - spl.planetCx, pyp - spl.planetCy);
    ctx.drawImage(spl.moon, mxp - spl.moonCx, myp - spl.moonCy);
    if (!noFly) SKYX.meteors.forEach(m => { const a = Math.max(0, 1 - m.life / 1.1); for (let k = 0; k < 16; k++) { ctx.globalAlpha = a * (1 - k / 16); R(ctx, Math.round(m.x - m.vx * 0.012 * k), Math.round(m.y - m.vy * 0.012 * k), 1, 1, k < 4 ? 'w' : 'y'); R(ctx, Math.round(m.x - m.vx * 0.012 * k), Math.round(m.y - m.vy * 0.012 * k) + 1, 1, 1, 'o'); } ctx.globalAlpha = a; R(ctx, Math.round(m.x), Math.round(m.y), 3, 2, 'w'); ctx.globalAlpha = 1; });
  }
  if (ep === 1 && SKYX.banner && !noFly) {                                          // Ретро: літак тягне полотнище SALE
    const b = SKYX.banner, x = Math.round(b.x), y = Math.round(b.y + Math.sin(time * 1.5) * 1);
    skyxPlane(x, y, 0, ['r', 'w'], 1);
    skyxLn(ctx, x - 31, y + 1, x - 40, y + 4, 'd');
    for (let i = 0; i < 40; i++) { const yy = y + 4 - 3 + Math.round(Math.sin(time * 5 + i * 0.35) * 1); R(ctx, x - 40 - 40 + i, yy, 1, 13, i < 1 || i > 38 ? 'r' : 'w'); R(ctx, x - 40 - 40 + i, yy, 1, 1, 'r'); R(ctx, x - 40 - 40 + i, yy + 12, 1, 1, 'r'); }
    wordBig(ctx, x - 40 - 36, y + 4 - 3 + 3, 'SALE', 'r');
  }
  (noFly ? [] : SKYX.items).forEach(f => {
    if (f.k === 'hab') skyxBalloon(f.x, f.y, f.r, f.c[0], f.c[1], f.ph);
    else if (f.k === 'drn') skyxDrone2(f.x, f.y, f.ph, f.box);
    else if (f.k === 'isl') skyxIsland2(f.x, f.y, f.w, f.v, f.ph);
    else if (f.k === 'kite') skyxKite(f.x, f.y, f.ph, f.c);
    else if (f.k === 'note') skyxNote(f.x, f.y, f.ph, f.c, f.g, f.amp);
    else if (f.k === 'ppl') skyxPlane(f.x, f.y, f.ph, f.c, f.vx > 0 ? 1 : -1);
    else if (f.k === 'rkt') skyxRocket(f.x, f.y, f.ph, f.vx > 0 ? 1 : -1);
    else if (f.k === 'heli') skyxHeli(f.x, f.y, f.ph, f.vx > 0 ? 1 : -1);
    else if (f.k === 'inv') skyxInvader(f.x, f.y, f.ph, f.v);
    else if (f.k === 'bfly') skyxButterfly(f.x, f.y, f.ph, f.c);
    else if (f.k === 'tet') { f.cells.forEach(([i0, j0]) => { let i = i0, j = j0; for (let r = 0; r < f.rot; r++) { const ni = -j, nj = i; i = ni; j = nj; } const cx = Math.round(f.x + i * 6), cy = Math.round(f.y + j * 6); ctx.drawImage(skyxBlock(f.c), cx, cy); }); }
  });
}

/* ---------- Особливості епох ---------- */
const epochFx = { blimp: null, plane: null, rocket: null, drones: [], fly: [], timers: { plane: 8, rocket: 20, comet: 3 } };
function epochHas(f) { return currentEpoch().features.includes(f); }
function seedEpochFx() {
  epochFx.blimp = null; epochFx.plane = null; epochFx.rocket = null; epochFx.drones = [];
  if (epochHas('blimp')) epochFx.blimp = { x: rand(worldL(), worldR()), y: rand(34 - view.offY * 0.75, 34 - view.offY * 0.3 + 6), vx: 5 };
  epochFx.fly = [];
  const sgn = () => (Math.random() < 0.5 ? -1 : 1), top = 8 - view.offY, wide = Math.max(1, view.w / 320);
  if (epochHas('drones')) {
    for (let i = 0; i < Math.round(11 * wide); i++) epochFx.drones.push({ x: rand(worldL(), worldR()), y: rand(top + 2, 84), vx: rand(8, 22) * sgn(), ph: rand(0, 6.3), c: ['f', 'T', 'y', 'p'][i % 4] });
    for (let i = 0; i < Math.round(4 * wide); i++) epochFx.fly.push({ k: 'car', x: rand(worldL(), worldR()), y: rand(Math.max(top + 20, 36), 96), vx: rand(24, 42) * sgn(), c: ['f', 'T', 'y', 'p'][i % 4], ph: rand(0, 6) });         // летючі авто з неоновими слідами
    for (let i = 0; i < Math.round(6 * wide); i++) epochFx.fly.push({ k: 'balloon', x: rand(worldL(), worldR()), y: rand(top + 10, 100), vx: rand(-3, 3), vy: -rand(3, 6), c: ['f', 'T', 'y', 'p', 'a', 'v'][i % 6], ph: rand(0, 6) });   // неонові кульки
  }
  if (epochHas('rockets')) {
    for (let i = 0; i < Math.round(3 * wide); i++) epochFx.fly.push({ k: 'sat', x: rand(worldL(), worldR()), y: rand(top + 4, 64), vx: rand(5, 11) * sgn(), ph: rand(0, 6) });                   // супутники
    for (let i = 0; i < Math.round(2 * wide); i++) epochFx.fly.push({ k: 'ufo', x: rand(worldL(), worldR()), y: rand(top + 14, 70), vx: rand(10, 22) * sgn(), ph: rand(0, 6), by: 0 });       // НЛО
    epochFx.fly.push({ k: 'station', x: rand(worldL(), worldR()), y: rand(top + 10, 40), vx: 4 * sgn(), ph: 0 });                                                                        // космічна станція
  }
  epochFx.timers.plane = rand(4, 10); epochFx.timers.rocket = rand(8, 20); epochFx.timers.comet = rand(1, 3);
}
function updateEpochFeatures(dt) {
  updateSkyExtra(dt);
  if (!animOn()) return;
  const comets = epochHas('rockets') || epochHas('drones');
  if (comets) { epochFx.timers.comet -= dt; if (epochFx.timers.comet <= 0) { epochFx.timers.comet = rand(2.5, 6); const dir = Math.random() < 0.5 ? 1 : -1; epochFx.fly.push({ k: 'comet', x: rand(worldL() + 40, worldR() - 40), y: rand(-view.offY, 36), vx: dir * rand(90, 130), vy: rand(24, 44), life: 0, c: epochHas('drones') ? ['f', 'T', 'y'][Math.floor(Math.random() * 3)] : 'w' }); } }
  for (let i = epochFx.fly.length - 1; i >= 0; i--) {
    const f = epochFx.fly[i];
    if (f.k === 'comet') { f.x += f.vx * dt; f.y += f.vy * dt; f.life += dt; if (f.life > 0.9) epochFx.fly.splice(i, 1); continue; }
    f.ph += dt * 2;
    f.x += f.vx * dt;
    if (f.k === 'balloon') { f.y += f.vy * dt; if (f.y < -view.offY - 10) { f.y = rand(96, 118); f.x = rand(worldL(), worldR()); } }
    if (f.k === 'ufo') f.by = Math.sin(f.ph * 0.5) * 3;
    if (f.x > worldR() + 50) f.x = worldL() - 50; else if (f.x < worldL() - 50) f.x = worldR() + 50;
  }
  const b = epochFx.blimp;
  if (b) { b.x += b.vx * dt; if (b.x > worldR() + 80) b.x = worldL() - 80; }
  epochFx.drones.forEach(d => { d.x += d.vx * dt; d.ph += dt * 2; if (d.x < worldL() - 8) d.vx = Math.abs(d.vx); if (d.x > worldR() + 8) d.vx = -Math.abs(d.vx); });
  if (epochHas('planes')) {
    if (epochFx.plane) {
      const p = epochFx.plane; p.x += p.vx * dt;
      if ((p.vx > 0 && p.x > worldR() + 60) || (p.vx < 0 && p.x < worldL() - 60)) { epochFx.plane = null; epochFx.timers.plane = rand(15, 35); }
    } else {
      epochFx.timers.plane -= dt;
      if (epochFx.timers.plane <= 0) { const dir = Math.random() < 0.5 ? 1 : -1; epochFx.plane = { x: dir > 0 ? worldL() - 40 : worldR() + 40, y: rand(8 - view.offY, 40), vx: dir * rand(28, 40) }; }
    }
  }
  if (epochHas('rockets')) {
    if (epochFx.rocket) {
      const r = epochFx.rocket; r.vy -= 40 * dt; r.y += r.vy * dt; r.t += dt;
      if (r.y < -view.offY - 40) { epochFx.rocket = null; epochFx.timers.rocket = rand(25, 55); }
    } else {
      epochFx.timers.rocket -= dt;
      if (epochFx.timers.rocket <= 0) epochFx.rocket = { x: rand(worldL() + 30, worldR() - 30), y: 112, vy: -6, t: 0 };
    }
  }
}
// Дирижабль: спрайт малюється один раз (об'ємне тіло з ребрами й смугами, хвіст, гондола з вікнами), а гвинти, ліхтарики й прапорець — щокадру
let blimpSprite = null;
function buildBlimpSprite() {
  const W = 140, H = 66, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), cx = 70, cy = 24, A = 56, B = 19;
  const body = (x, y) => { const dx = (x + 0.5 - cx) / A, dy = (y + 0.5 - cy) / B; return dx * dx + dy * dy <= 1; };
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  // тяги й підвіска гондоли (позаду корпусу)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!body(x, y)) continue;
    const dy = (y + 0.5 - cy) / B, dx = (x + 0.5 - cx) / A;                                      // -1…1 по висоті
    const t = (dy + 1) / 2 + (dx < 0 ? 0 : 0) - dx * 0.06;                                       // верхній лівий бік світліший
    const chk = (x + y) % 2 === 0;
    const bands = ['#fffaf0', '#fff0d6', '#f4e1bf', '#e6caa0', '#cfa97d', '#a98560'];
    let k = Math.max(0, Math.min(bands.length - 1, Math.floor(t * bands.length * 0.98 + (chk ? 0.5 : 0) - 0.25)));
    P(x, y, 1, 1, bands[k]);
    // поздовжні смуги (червона й синя), що йдуть по обводу корпусу
    const s1 = Math.abs(dy - 0.18), s2 = Math.abs(dy - 0.42);
    if (s1 < 0.07) P(x, y, 1, 1, '#c4553d'); else if (s2 < 0.045) P(x, y, 1, 1, '#2f5f9f');
    if (s1 < 0.07 && dy - 0.18 < -0.04) P(x, y, 1, 1, '#d9705a');
  }
  // ребра жорсткості: вертикальні дуги
  g.globalAlpha = 0.22; for (let rx = -48; rx <= 48; rx += 12) { for (let y = 0; y < H; y++) { const x = cx + rx; if (body(x, y)) P(x, y, 1, 1, '#4a3228'); } } g.globalAlpha = 1;
  // контур
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (body(x, y) && (!body(x - 1, y) || !body(x + 1, y) || !body(x, y - 1) || !body(x, y + 1))) P(x, y, 1, 1, '#4a3228');
  // відблиск
  P(cx - 36, cy - B + 3, 22, 1, '#ffffff'); P(cx - 40, cy - B + 4, 14, 1, '#ffffff'); g.globalAlpha = 0.7; P(cx - 30, cy - B + 5, 12, 1, '#ffffff'); g.globalAlpha = 1;
  // емблема на боку: зірка в колі
  const ex = cx + 6, ey = cy + 2; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) if (dx * dx + dy * dy <= 36) P(ex + dx, ey + dy, 1, 1, dx * dx + dy * dy >= 25 ? '#4a3228' : '#fff4dc');
  P(ex - 1, ey - 4, 3, 9, '#c4553d'); P(ex - 4, ey - 1, 9, 3, '#c4553d'); P(ex - 3, ey - 3, 1, 1, '#c4553d'); P(ex + 3, ey - 3, 1, 1, '#c4553d'); P(ex - 3, ey + 3, 1, 1, '#c4553d'); P(ex + 3, ey + 3, 1, 1, '#c4553d'); P(ex, ey, 1, 1, '#ffe08a');
  // ніс: металевий ковпак із щоглою для прапорця
  P(cx + A - 3, cy - 3, 4, 7, '#b8bcc8'); P(cx + A - 3, cy - 3, 4, 1, '#e6e9f2'); P(cx + A + 1, cy - 2, 1, 5, '#4a3228'); P(cx + A - 3, cy + 3, 4, 1, '#6a6e7a');
  // хвіст: чотири оперення — верхнє, нижнє й два бічні (видно як менші)
  const fin = (pts, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => g.lineTo(p[0], p[1])); g.closePath(); g.fill(); g.strokeStyle = '#4a3228'; g.lineWidth = 1; g.stroke(); };
  fin([[cx - A + 4, cy - 8], [cx - A - 2, cy - B - 9], [cx - A + 16, cy - 13]], '#c4553d');
  fin([[cx - A + 4, cy + 8], [cx - A - 2, cy + B + 9], [cx - A + 16, cy + 13]], '#a8402f');
  fin([[cx - A + 4, cy - 1], [cx - A - 6, cy - 2], [cx - A - 6, cy + 4], [cx - A + 4, cy + 3]], '#d9705a');
  P(cx - A - 4, cy - 1, 2, 4, '#4a3228');
  // гондола під корпусом: дерев'яний каркас, вікна з теплим світлом, ліхтар і драбинка
  const gx = cx - 20, gy = cy + B + 6, gw = 42, gh = 12;
  g.strokeStyle = '#4a3228'; g.lineWidth = 1; [[cx - 18, cy + B - 4], [cx - 6, cy + B - 1], [cx + 8, cy + B - 1], [cx + 18, cy + B - 4]].forEach(([tx, ty], i) => { g.beginPath(); g.moveTo(tx + 0.5, ty); g.lineTo(gx + 4 + i * 11 + 0.5, gy); g.stroke(); });
  P(gx - 1, gy - 1, gw + 2, gh + 2, '#4a3228'); P(gx, gy, gw, gh, '#a87048'); P(gx, gy, gw, 2, '#c8905c'); P(gx, gy + gh - 3, gw, 3, '#7a4f35');
  for (let k = 0; k < 6; k++) { P(gx + 3 + k * 6, gy + 3, 4, 5, '#4a3228'); P(gx + 4 + k * 6, gy + 4, 2, 3, k % 2 ? '#ffe08a' : '#fff0b8'); }
  P(gx + gw - 8, gy + 2, 8, 7, '#4a3228'); P(gx + gw - 7, gy + 3, 6, 5, '#bfe3f2'); P(gx + gw - 7, gy + 3, 2, 1, '#ffffff');                       // передня кабіна
  P(gx + gw, gy + 4, 3, 3, '#ffe08a'); P(gx - 3, gy + 8, 3, 2, '#4a3228');
  // моторні гондоли по боках
  [[cx - 34, cy + B - 3], [cx + 30, cy + B - 3]].forEach(([mx, my]) => { P(mx - 1, my - 1, 11, 8, '#4a3228'); P(mx, my, 9, 6, '#b8bcc8'); P(mx, my, 9, 2, '#e6e9f2'); P(mx + 3, my + 2, 3, 2, '#6a6e7a'); P(mx + 4, my - 4, 1, 4, '#4a3228'); });
  return c;
}
function drawBlimp(b, time) {
  if (!blimpSprite) blimpSprite = buildBlimpSprite();
  const x = Math.round(b.x), y = Math.round(b.y + Math.sin(time * 0.9) * 1.5), W = blimpSprite.width;
  ctx.globalAlpha = 0.16; for (let dy = 0; dy < 4; dy++) R(ctx, x - 50 + dy * 5, y + 54 + dy, 100 - dy * 10, 1, 'd'); ctx.globalAlpha = 1;      // легка тінь знизу
  ctx.drawImage(blimpSprite, x - 70, y - 24);
  // гвинти на моторах крутяться, на хвості — маленький гвинт
  [[x - 24, y + 19], [x + 40, y + 19]].forEach(([px, py], i) => { const ph = Math.floor(time * 18 + i) % 3, hh = [9, 5, 2][ph]; R(ctx, px, py - hh, 1, hh * 2 + 1, '#2a1d1a'); if (ph !== 2) R(ctx, px + 1, py - Math.floor(hh / 2), 1, hh, 'e'); });
  const tp = Math.floor(time * 20) % 2; R(ctx, x - 62, y - 3 + tp, 1, 7 - tp * 2, '#2a1d1a');
  // прапорець на носі майорить, вогники на кінцях світяться по черзі
  const wv = Math.floor(time * 5) % 3; R(ctx, x + 57, y - 8, 1, 6, '#4a3228'); for (let k = 0; k < 7; k++) R(ctx, x + 58 + k, y - 8 + Math.round(Math.sin(time * 6 - k * 0.8) * (1 + k * 0.15)) + (wv === 1 ? 0 : 0), 1, 4 - (k > 4 ? 1 : 0), k % 2 ? '#ffe08a' : '#c4553d');
  const nav = Math.floor(time * 2) % 2; R(ctx, x + 57, y + 22 - 24 + 24, 1, 1, nav ? '#7aff7a' : '#2a6a2a'); R(ctx, x - 64, y + 1, 1, 1, nav ? '#2a0a0a' : '#ff4a4a');
}
// Небо епохи (у координатах «ядра», після хмар і до землі)
function drawEpochSky(time) {
  const fx = currentEpoch().features, noFly = !!state.settings.noFly;           // «Прибрати літаючі об'єкти»: усе, що літає в небі (крім хмар)
  drawSkyExtra(time);
  if (fx.includes('retrosun')) {                      // смугасте сонце з синтвейву
    const sx = worldL() + 84;
    for (let dy = -28; dy <= 28; dy++) {
      if (dy > 4 && ((dy - 4) % 7) < Math.floor((dy - 4) / 6) + 1) continue;
      const half = Math.round(Math.sqrt(784.5 - dy * dy));
      R(ctx, sx - half, 36 + dy, half * 2 + 1, 1, dy < -8 ? 'y' : dy < 8 ? 'j' : 'f');
    }
  }
  const b = epochFx.blimp;
  if (b && !noFly) drawBlimp(b, time);                           // повітряне судно
  const p = epochFx.plane;
  if (p && !noFly) {                                   // літак із білим слідом
    const dir = p.vx > 0 ? 1 : -1, x = Math.round(p.x), y = Math.round(p.y);
    for (let i = 1; i <= 38; i++) { ctx.globalAlpha = 0.7 * (1 - i / 38); R(ctx, x - dir * (i + 4), y, 1, 1, 'w'); }
    ctx.globalAlpha = 1;
    R(ctx, x - 4, y - 1, 9, 2, 'w'); R(ctx, x + (dir > 0 ? 5 : -5), y - 1, 1, 2, 'e'); R(ctx, x - 1, y - 3, 3, 2, 'e'); R(ctx, x - 1, y + 1, 3, 2, 'e'); R(ctx, x - dir * 4, y - 3, 2, 2, 'e');
  }
  const r = epochFx.rocket;
  if (r && !noFly) {                                   // ракета з димовим слідом
    const x = Math.round(r.x), y = Math.round(r.y);
    for (let i = 0; i < 15; i++) { ctx.globalAlpha = 0.6 * (1 - i / 15); disc(ctx, x + Math.round(Math.sin(i + r.t * 6)), y + 9 + i * 3, 2 + (i >> 2), 'w'); }
    ctx.globalAlpha = 1;
    R(ctx, x - 2, y - 6, 5, 10, 'w'); R(ctx, x - 1, y - 8, 3, 2, 'r'); R(ctx, x, y - 9, 1, 1, 'r'); R(ctx, x - 4, y + 1, 2, 4, 'r'); R(ctx, x + 3, y + 1, 2, 4, 'r'); R(ctx, x - 1, y - 3, 3, 2, 's');
    R(ctx, x - 1, y + 4, 3, 3, 'o'); R(ctx, x, y + 4, 1, Math.floor(time * 18) % 2 ? 5 : 3, 'y');
  }
  if (fx.includes('turbines')) {                       // вітряки на пагорбах
    const n = Math.max(3, Math.floor(view.w / 90));
    for (let i = 0; i < n; i++) {
      const x = Math.round(worldL() + 40 + i * ((view.w - 80) / Math.max(1, n - 1))), hy = 78 + (i % 2) * 6;
      R(ctx, x, hy, 2, 36, 'w'); R(ctx, x + 1, hy, 1, 36, 'E');
      disc(ctx, x + 1, hy, 2, 'w');
      const a = (animOn() ? time * 0.9 : 0) + i * 1.3;
      for (let k = 0; k < 3; k++) { const ang = a + k * 2.094; lineG(ctx, x + 1, hy, x + 1 + Math.round(Math.cos(ang) * 13), hy + Math.round(Math.sin(ang) * 13), k ? 'w' : 'E'); }
    }
  }
  (noFly ? [] : epochFx.fly).forEach(f => {
    const x = Math.round(f.x), y = Math.round(f.y);
    if (f.k === 'comet') {                                             // падаюча зірка / неоновий метеор
      const k = f.life / 0.9, n = 16, dx = f.vx / Math.hypot(f.vx, f.vy), dy = f.vy / Math.hypot(f.vx, f.vy);
      for (let i = n; i >= 0; i--) { ctx.globalAlpha = (1 - k) * (1 - i / n) * 0.9; R(ctx, Math.round(x - dx * i * 1.6), Math.round(y - dy * i * 1.6), i < 4 ? 2 : 1, i < 4 ? 2 : 1, i < 3 ? 'w' : f.c); }
      ctx.globalAlpha = 1; return;
    }
    if (f.k === 'sat') {                                               // супутник із панелями
      R(ctx, x - 2, y - 1, 5, 3, 'e'); R(ctx, x - 2, y - 1, 5, 1, 'E'); R(ctx, x - 9, y, 6, 2, 'n'); R(ctx, x + 4, y, 6, 2, 'n');
      R(ctx, x - 9, y, 6, 1, 's'); R(ctx, x + 4, y, 6, 1, 's'); R(ctx, x, y - 3, 1, 2, 'd'); R(ctx, x - 1, y - 4, 3, 1, 'w');
      if (Math.floor(f.ph * 2) % 3 === 0) { R(ctx, x - 8, y, 1, 1, 'w'); R(ctx, x + 9, y, 1, 1, 'w'); }
    } else if (f.k === 'ufo') {                                        // тарілка з променем і вогниками
      const yy = y + Math.round(f.by);
      if (Math.sin(f.ph * 0.35) > 0.2) { ctx.globalAlpha = 0.16; ctx.fillStyle = PALETTE.y; ctx.beginPath(); ctx.moveTo(x - 4, yy + 4); ctx.lineTo(x + 5, yy + 4); ctx.lineTo(x + 14, yy + 44); ctx.lineTo(x - 13, yy + 44); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
      R(ctx, x - 5, yy - 3, 11, 4, 's'); R(ctx, x - 4, yy - 4, 9, 1, 'S'); R(ctx, x - 8, yy, 17, 3, 'e'); R(ctx, x - 8, yy, 17, 1, 'E'); R(ctx, x - 6, yy + 3, 13, 1, 'd');
      for (let k = 0; k < 4; k++) R(ctx, x - 6 + k * 4, yy + 1, 2, 1, Math.floor(f.ph * 3 + k) % 2 ? 'y' : 'f');
    } else if (f.k === 'station') {                                    // космічна станція
      R(ctx, x - 20, y, 40, 2, 'e'); R(ctx, x - 20, y, 40, 1, 'E'); R(ctx, x - 5, y - 4, 10, 10, 'w'); R(ctx, x - 5, y - 4, 10, 1, 'E'); R(ctx, x - 5, y + 5, 10, 1, 'e');
      [-18, -12, 8, 14].forEach(px => { R(ctx, x + px, y - 7, 5, 6, 'n'); R(ctx, x + px, y + 3, 5, 6, 'n'); R(ctx, x + px, y - 7, 5, 1, 's'); R(ctx, x + px, y + 3, 5, 1, 's'); });
      for (let k = 0; k < 3; k++) R(ctx, x - 3 + k * 3, y - 1, 2, 3, Math.floor(f.ph + k) % 2 ? 'y' : 's');
      R(ctx, x + 5, y - 8, 1, 4, 'd'); R(ctx, x + 6, y - 8, 3, 1, 'r');
    } else if (f.k === 'car') {                                        // летюче авто з неоновим слідом
      const dir = f.vx > 0 ? 1 : -1;
      for (let i = 1; i <= 16; i++) { ctx.globalAlpha = 0.6 * (1 - i / 16); R(ctx, x - dir * (6 + i), y + 1, 1, 1, f.c); if (i < 8) R(ctx, x - dir * (6 + i), y + 2, 1, 1, f.c); }
      ctx.globalAlpha = 1;
      R(ctx, x - 6, y, 13, 3, 'k'); R(ctx, x - 6, y, 13, 1, 'e'); R(ctx, x - 3, y - 2, 7, 2, 'k'); R(ctx, x - 2 + (dir > 0 ? 1 : 0), y - 2, 4, 1, 's');
      R(ctx, x - 5, y + 3, 11, 1, f.c); ctx.globalAlpha = 0.28; disc(ctx, x, y + 6, 4, f.c); ctx.globalAlpha = 1;
      R(ctx, x + dir * 6, y + 1, 1, 1, 'y');
    } else if (f.k === 'balloon') {                                    // неонова кулька
      const yy = y + Math.round(Math.sin(f.ph) * 1.5);
      ctx.globalAlpha = 0.25; disc(ctx, x, yy, 6, f.c); ctx.globalAlpha = 1;
      disc(ctx, x, yy, 4, 'k'); disc(ctx, x, yy, 3, f.c); R(ctx, x - 2, yy - 2, 1, 1, 'w'); R(ctx, x, yy + 4, 1, 1, 'k'); R(ctx, x + (Math.floor(f.ph) % 2 ? 1 : 0), yy + 5, 1, 5, 'e');
    }
  });
  (noFly ? [] : epochFx.drones).forEach(d => {         // дрони з вогниками
    const x = Math.round(d.x), y = Math.round(d.y + Math.sin(d.ph) * 2);
    R(ctx, x - 3, y, 7, 2, 'k'); R(ctx, x - 5, y - 1, 3, 1, 'e'); R(ctx, x + 3, y - 1, 3, 1, 'e');
    if (Math.floor(time * 6 + d.ph) % 2) { ctx.globalAlpha = 0.35; disc(ctx, x, y + 3, 3, d.c); ctx.globalAlpha = 1; R(ctx, x, y + 2, 1, 1, d.c); }
  });
}
// Середній план епохи: гірлянди прапорців між ліхтарями (Відродження)
function drawEpochMid(time) {
  if (!epochHas('pennants')) return;
  const xs = [worldL() - 2].concat(lampXs.slice().sort((a, c) => a - c), [worldR() + 2]), cols = ['r', 'y', 'n', 'g', 'p'];
  const mid = shop ? shop.x + shop.w / 2 : 160;
  for (let i = 0; i + 1 < xs.length; i++) {
    const a = xs[i] + 1, b = xs[i + 1] + 1;
    if (a < mid && b > mid) continue;                     // перед магазином гірлянди нема — вона закривала б фасад
    for (let x = a; x <= b; x++) {
      const sag = Math.round(7 * Math.sin((x - a) / (b - a) * Math.PI));
      R(ctx, x, 86 + sag, 1, 1, 'd');
      if ((x - a) % 8 === 4) { const c = cols[Math.floor((x - a) / 8) % cols.length]; R(ctx, x - 1, 87 + sag, 3, 1, c); R(ctx, x - 1, 88 + sag, 3, 1, c); R(ctx, x, 89 + sag, 1, 1, c); }
    }
  }
}
// Світло епохи поверх ночі: промені диско над магазином і блискітки
function drawEpochGlow(time) {
  if (!epochHas('disco') || sky.night < 0.25 || build) return;
  const cx = shop.x + shop.w / 2, cy = shop.y + 14, a = sky.night;
  [['f', 0], ['y', 2.1], ['T', 4.2]].forEach(bm => {
    const ang = -Math.PI / 2 + Math.sin(time * 0.9 + bm[1]) * 0.9, L = 130;
    ctx.globalAlpha = 0.14 * a; ctx.fillStyle = PALETTE[bm[0]];
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang - 0.08) * L, cy + Math.sin(ang - 0.08) * L); ctx.lineTo(cx + Math.cos(ang + 0.08) * L, cy + Math.sin(ang + 0.08) * L); ctx.closePath(); ctx.fill();
  });
  for (let i = 0; i < 26; i++) {
    const hsv = hash2(i * 17, 5), px = shop.x + (hsv % shop.w), py = shop.y + ((hsv >>> 8) % shop.h);
    if (Math.floor(time * 3 + i) % 3) continue;
    ctx.globalAlpha = 0.9 * a; R(ctx, px, py, 1, 1, ['w', 'y', 'f', 'T'][i % 4]); R(ctx, px - 1, py, 3, 1, 'w'); R(ctx, px, py - 1, 1, 3, 'w');
  }
  ctx.globalAlpha = 1;
}

/* ---------- День і ніч ---------- */
// Один повний день триває CONFIG.DAY_SECONDS. Сонце йде дугою зліва направо, увечері небо червоніє,
// вночі з'являються зорі й місяць, горять ліхтарі та вікна.
const sky = { night: 0, dusk: 0, lamp: 0, h: 1 };   // стан неба на цьому кадрі
let skyStars = [];                                  // зорі (координати полотна)
let skyDust = [];                                  // слабкий пил Чумацького Шляху
let shootingStar = null, shootTimer = 6;
function buildSkyStars() {
  skyStars = []; skyDust = [];
  const n = Math.round(view.w * (view.offY + 100) / 120);          // зір багато
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    skyStars.push({ x: Math.floor(rand(0, view.w)), y: Math.floor(rand(0, view.offY + 100)), ph: rand(0, 6.3), sp: rand(0.8, 2.6),
      t: r < 0.58 ? 0 : r < 0.86 ? 1 : r < 0.96 ? 2 : 3, c: ['w', 'w', 'S', 'y'][Math.floor(rand(0, 4))] });
  }
  const m = Math.round(view.w * 0.8);                               // діагональна смуга з дрібних цяточок
  for (let i = 0; i < m; i++) {
    const u = Math.random();
    skyDust.push({ x: Math.floor(u * view.w), y: Math.floor(view.offY + 92 - u * (view.offY + 62) + rand(-9, 9) + rand(-9, 9)), a: rand(0.12, 0.4), c: ['S', 'u', 'w', 'S'][i % 4] });
  }
}
function updateSkyState() {
  const hal = theme.season === 'halloween';
  if (!dayNightOn()) { sky.night = hal ? 0.6 : 0; sky.dusk = 0; sky.lamp = hal ? 0.85 : 0; sky.h = hal ? -0.4 : 0.9; return; }
  const h = Math.sin((state.dayPhase - 0.25) * Math.PI * 2);      // висота сонця: 1 — полудень, −1 — північ
  const n = Math.max(0, Math.min(1, 0.3 - h * 1.5));
  sky.night = n * n * (3 - 2 * n);
  sky.dusk = Math.max(0, 1 - Math.abs(h - 0.05) / 0.3);          // сутінки: схід і захід
  sky.lamp = Math.max(0, Math.min(1, (sky.night - 0.25) / 0.4));  // ліхтарі вмикаються, коли вже темно
  sky.h = h;
  if (hal) { sky.night = Math.max(sky.night, 0.6); sky.lamp = Math.max(sky.lamp, 0.85); sky.dusk = 0; }
}
function updateShootingStar(dt) {
  if (!animOn() || sky.night < 0.6) { shootingStar = null; return; }
  if (shootingStar) {
    const q = shootingStar;
    q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.t >= q.life) { shootingStar = null; shootTimer = currentEpoch().id === 'space' ? rand(1.65, 5.3) : rand(1.9, 6.15); }      // уночі зорепади частіші: Космос +50%, решта +30%
  } else {
    shootTimer -= dt;
    if (shootTimer <= 0) shootingStar = { x: rand(view.w * 0.1, view.w * 0.8), y: rand(4, view.offY + 40), vx: rand(110, 160), vy: rand(40, 70), t: 0, life: 0.7 };
  }
}
function drawSkyBody(kind, x, y) {
  x = Math.round(x); y = Math.round(y);
  const jp = currentEpoch().id === 'japan', K = jp ? 1 : 1.15, S = v => Math.round(v * K);     // у всіх епохах сонце й місяць на 15% більші, в Японії як було
  const dsc = (cx, cy, r, c) => { ctx.fillStyle = PALETTE[c] || c; for (let dy = -r; dy <= r; dy++) { const h = Math.round(Math.sqrt(r * r + 0.5 - dy * dy)); ctx.fillRect(cx - h, cy + dy, h * 2 + 1, 1); } };
  const RS = (dx, dy, w, h, c) => R(ctx, x + S(dx), y + S(dy), Math.max(1, S(w)), Math.max(1, S(h)), c);
  if (kind === 'sun' && jp) {                          // Японія: червоне сонце-диск (хіномару), рухається по небу вдень
    ctx.globalAlpha = 0.35; dsc(x, y, 13, '#ffc4c0'); ctx.globalAlpha = 1;
    dsc(x, y, 9, '#e8453c'); dsc(x - 2, y - 2, 4, '#ff7a64');
  } else if (kind === 'sun') {
    const low = sky.h < 0.35;
    ctx.globalAlpha = 0.45; disc(ctx, x, y, S(13), low ? 'o' : 'w');
    ctx.globalAlpha = 1;
    disc(ctx, x, y, S(9), low ? 'o' : 'y'); disc(ctx, x, y, S(6), low ? 'h' : 'w');
  } else if (kind === 'hsun') {                        // хелловінське сонце: помаранчеве, з темною ухмилкою гарбуза й зубами
    ctx.globalAlpha = 0.3; dsc(x, y, S(15), '#ffb060'); ctx.globalAlpha = 1;
    disc(ctx, x, y, 11, 'd'); disc(ctx, x, y, 10, 'o'); disc(ctx, x - 2, y - 2, 8, 'h'); disc(ctx, x - 3, y - 3, 4, 'y');
    [-1, 1].forEach(s => { R(ctx, x + s * 4, y - 5, 1, 1, 'd'); R(ctx, x + s * 4 - 1, y - 4, 3, 1, 'd'); R(ctx, x + s * 4 - 2, y - 3, 5, 1, 'd'); });          // очі-трикутники
    R(ctx, x - 7, y, 2, 1, 'd'); R(ctx, x + 6, y, 2, 1, 'd'); R(ctx, x - 6, y + 1, 13, 1, 'd'); R(ctx, x - 5, y + 2, 11, 1, 'd'); R(ctx, x - 3, y + 3, 7, 1, 'd'); R(ctx, x - 1, y + 4, 3, 1, 'd');   // широка ухмилка
    R(ctx, x - 3, y + 1, 2, 1, 'y'); R(ctx, x + 1, y + 1, 2, 1, 'y'); R(ctx, x - 1, y + 3, 2, 1, 'y');                                                    // зуби
  } else if (kind === 'hmoon') {                      // хелловінський місяць: помаранчевий, з кратерами, павутиння в куті й павук на нитці
    ctx.globalAlpha = 0.1; disc(ctx, x, y, 27, 'o'); ctx.globalAlpha = 0.16; disc(ctx, x, y, 22, 'o'); ctx.globalAlpha = 0.28; disc(ctx, x, y, 18, 'h'); ctx.globalAlpha = 1;
    disc(ctx, x, y, 14, 'd'); disc(ctx, x, y, 13, 'o'); disc(ctx, x - 2, y - 2, 11, 'h'); disc(ctx, x - 3, y - 3, 7, 'y');
    ctx.globalAlpha = 0.5; R(ctx, x - 8, y - 3, 4, 3, 'o'); R(ctx, x + 2, y - 8, 5, 3, 'o'); R(ctx, x + 4, y + 2, 4, 4, 'o'); R(ctx, x - 7, y + 4, 3, 3, 'o'); R(ctx, x - 1, y + 6, 3, 2, 'o'); ctx.globalAlpha = 1;
    const wx = x + 9, wy = y - 10;                    // павутиння: промені з кута й дві дуги
    ctx.globalAlpha = 0.9;
    [[-9, 1], [-8, 5], [-5, 8], [-1, 10], [1, 7]].forEach(([dx, dy]) => lineG(ctx, wx, wy, wx + dx, wy + dy, 'w'));
    [4, 7].forEach(r => { let px0 = wx - r, py0 = wy; for (let i = 1; i <= 4; i++) { const a = Math.PI * (i / 4) / 2, nx = Math.round(wx - Math.cos(a) * r), ny = Math.round(wy + Math.sin(a) * r); lineG(ctx, px0, py0, nx, ny, 'w'); px0 = nx; py0 = ny; } });
    ctx.globalAlpha = 1;
    const sw = animOn() ? Math.round(Math.sin(animClock * 1.4) * 2) : 0, sx0 = x - 6, sy0 = y + 12 + (animOn() ? Math.round(Math.sin(animClock * 2) * 1) : 0);    // павук гойдається на нитці
    const bx = sx0 + sw, by = sy0 + 14;
    lineG(ctx, sx0, y + 12, bx, by, 'w');
    R(ctx, bx - 2, by, 5, 3, 'k'); R(ctx, bx - 1, by - 1, 3, 1, 'k'); R(ctx, bx - 1, by + 3, 3, 1, 'k'); R(ctx, bx - 1, by, 1, 1, 'r'); R(ctx, bx + 1, by, 1, 1, 'r');
    [[-4, 0], [-4, 2], [3, 0], [3, 2]].forEach(([dx, dy]) => R(ctx, bx + dx, by + dy, 2, 1, 'Y'));
  } else if (jp) {                                     // Японія: ідеальний напівмісяць (світла ліва половина) того ж розміру, що сонце
    ctx.globalAlpha = 0.2; dsc(x, y, 13, '#ffffff'); ctx.globalAlpha = 0.1; dsc(x, y, 9, '#8f9ed8'); ctx.globalAlpha = 1;
    for (let dy = -9; dy <= 9; dy++) { const h = Math.round(Math.sqrt(81.5 - dy * dy)); R(ctx, x - h, y + dy, h + 1, 1, 'W'); R(ctx, x - h + 1, y + dy, Math.max(0, h - 2), 1, 'w'); }
    R(ctx, x, y - 9, 1, 19, 'e');                      // пряма межа напівмісяця
    ctx.globalAlpha = 0.5; R(ctx, x - 6, y - 4, 3, 2, 'e'); R(ctx, x - 4, y + 3, 3, 3, 'e'); R(ctx, x - 7, y + 1, 2, 2, 'e'); ctx.globalAlpha = 1;
  } else {                                           // місяць: ореол, освітлений бік, тінь, кратери й моря
    ctx.globalAlpha = 0.09; disc(ctx, x, y, S(20), 'w');
    ctx.globalAlpha = 0.14; disc(ctx, x, y, S(16), 'w');
    ctx.globalAlpha = 0.24; disc(ctx, x, y, S(13), 'w');
    ctx.globalAlpha = 1;
    const r9 = S(9);
    disc(ctx, x, y, S(10), 'e');                      // темний контур
    disc(ctx, x, y, r9, 'W');
    disc(ctx, x - 1, y - 1, S(8), 'w');               // яскравий верхній лівий бік
    ctx.globalAlpha = 0.35;
    for (let dy = -r9; dy <= r9; dy++) { const half = Math.round(Math.sqrt(r9 * r9 + 0.5 - dy * dy)), st = Math.max(S(2), half - S(4) - Math.max(0, dy)); R(ctx, x + st, y + dy, Math.max(0, half - st + 1), 1, 'e'); }   // тінь справа-знизу
    ctx.globalAlpha = 0.55;
    RS(-6, -4, 4, 3, 'e'); RS(1, -6, 5, 3, 'e'); RS(2, 1, 4, 4, 'e'); RS(-5, 2, 3, 3, 'e'); RS(-1, 5, 3, 2, 'e');   // моря
    ctx.globalAlpha = 0.8;
    RS(-6, -5, 2, 1, 'w'); RS(1, -7, 3, 1, 'w'); RS(2, 0, 2, 1, 'w'); RS(-5, 1, 2, 1, 'w'); RS(-1, 4, 2, 1, 'w');         // світлі краї кратерів
    ctx.globalAlpha = 1;
  }
}
