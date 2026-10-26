//#part 220_b1_rainbow_lightning_skyx.js
const RAINBOW_M = 56;
let rainbowM = RAINBOW_M, rainbowBw = 4;
function rainbowCanvas(R0) {                                    // перемальовується лише коли змінюється розмір магазину
  if (rainbowCv && rainbowKey === R0) return rainbowCv;
  rainbowKey = R0; rainbowBw = Math.max(5, R0 / 14); rainbowM = Math.round(rainbowBw * 10);
  return (rainbowCv = buildRainbow(R0, rainbowBw, rainbowM, true));
}
// Велика веселка: дуга сягає майже верху неба, тож видно над високими будинками і на ПК, і на телефоні
function rainbowGeom() {
  const cy = LAYOUT.curbY + 14, top = -view.offY + 10;
  const base = Math.max(120, Math.min((cy - top) * 0.93, 240));
  const need = shop ? Math.max(cy - shop.y + 26, shop.w * 0.62 + 20) : 0;                 // дуга охоплює магазин будь-якого рівня (вежу й ширину ТЦ), а не ховається за ним
  return { R0: Math.round(Math.max(base, Math.min(need, (cy - top) * 1.25, 330))), cy, px: LAYOUT.centerX };
}
function drawRainbowSkin() {                                  // веселка — лише як скін погоди: позаду будинків, велика, видна над ними
  const a = (1 - sky.night) * (1 - weather.rain * 0.7);
  if (a < 0.03) return;
  const gm = rainbowGeom(), s = { cy: gm.cy }, R0 = gm.R0, px = gm.px, shimmer = animOn() ? Math.sin(animClock * 1.3) : 0;
  ctx.globalAlpha = Math.min(1, (0.86 + 0.06 * shimmer) * a);
  const rbCv = rainbowCanvas(R0); ctx.drawImage(rbCv, Math.round(px - R0 - rainbowM), Math.round(s.cy - R0 - rainbowM));
  if (animOn()) {                                              // блискітки, що пливуть по веселці
    for (let k = 0; k < 9; k++) {
      const ph = (animClock * 0.07 + k / 9) % 1, th = ph * Math.PI, r = R0 - 3 - ((k * 7) % Math.round(rainbowBw * 7)), sx = Math.round(px - Math.cos(th) * r), sy = Math.round(s.cy - Math.sin(th) * r);
      if (Math.sin(animClock * 4 + k * 2.3) > 0.1) { ctx.globalAlpha = 0.9 * a; R(ctx, sx, sy - 2, 1, 5, 'w'); R(ctx, sx - 2, sy, 5, 1, 'w'); R(ctx, sx - 1, sy - 1, 3, 3, 'y'); R(ctx, sx, sy, 1, 1, 'w'); }
    }
  }
  [[-R0 - 8, 0], [R0 - 20, 1]].forEach(([dx, kind]) => {       // пухнасті хмаринки біля основ веселки
    ctx.globalAlpha = 0.95 * a; const cv = cloudCanvas(kind, ''); ctx.drawImage(cv, Math.round(px + dx), Math.round(s.cy - 16));
  });
  ctx.globalAlpha = 1;
}
/* ---------- Скін погоди «Фіолетові блискавки»: грозові спалахи високо над містом (за будинками й магазином) ---------- */
const bolts = [];                                              // блискавки, що зараз видно
let boltTimer = 1.2, skyFlash = 0;
// Шлях блискавки: зрушення середніх точок (так виглядає справжня блискавка — природні зламані гілки)
function boltPath(x0, y0, x1, y1, rough, depth) {
  let pts = [[x0, y0], [x1, y1]], disp = rough;
  for (let d = 0; d < depth; d++) {
    const np = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, off = rand(-disp, disp);
      np.push([(a[0] + b[0]) / 2 + (-dy / len) * off, (a[1] + b[1]) / 2 + (dx / len) * off], b);
    }
    pts = np; disp *= 0.55;
  }
  return pts;
}
function boltDense(pts) {                                      // ламана → щільний ряд пікселів
  const out = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
    for (let k = 0; k < n; k++) out.push([Math.round(ax + (bx - ax) * k / n), Math.round(ay + (by - ay) * k / n)]);
  }
  const l = pts[pts.length - 1]; out.push([Math.round(l[0]), Math.round(l[1])]);
  return out;
}
function makeBolt() {
  const vl = visL(), vr = visR(), top = -view.offY, roll = Math.random();
  let sx, sy, ex, ey, glow = 0;
  if (roll < 0.34) { sx = rand(vl + 14, vr - 14); sy = top - 4; ex = sx + rand(-28, 28); ey = rand(88, 128); }                                      // згори вниз
  else if (roll < 0.62) { const L = Math.random() < 0.5; sx = L ? vl - 6 : vr + 6; sy = rand(top + 24, 70); ex = sx + (L ? 1 : -1) * rand(70, 150); ey = sy + rand(-16, 54); glow = 0.45; }   // збоку, углиб неба
  else if (roll < 0.8) { sx = rand(vl + 20, vr - 20); sy = rand(104, 124); ex = sx + rand(-40, 40); ey = top + rand(8, 32); glow = 1; }               // знизу вгору, з-за дахів до хмар
  else { const R2 = Math.random() < 0.5; sx = R2 ? vl - 4 : vr + 4; sy = rand(top + 28, 72); ex = sx + (R2 ? 1 : -1) * rand(110, 200); ey = sy + rand(-18, 18); glow = 0.5; }   // майже горизонтальна між хмарами
  const len = Math.hypot(ex - sx, ey - sy), ux = (ex - sx) / len, uy = (ey - sy) / len;
  const main = boltDense(boltPath(sx, sy, ex, ey, len * 0.16, 6)), branches = [];
  const nb = 2 + Math.floor(rand(0, 3));
  for (let i = 0; i < nb; i++) {
    const at = Math.floor(rand(0.22, 0.8) * main.length), [bx, by] = main[at], sg = Math.random() < 0.5 ? -1 : 1, px = -uy * sg, py = ux * sg;
    const l2 = rand(16, 36);
    const bp = boltDense(boltPath(bx, by, bx + px * l2 + ux * rand(8, 24), by + py * l2 + uy * rand(8, 24), 9, 5));
    const twigs = [];
    if (Math.random() < 0.6) { const ti = Math.floor(rand(0.3, 0.7) * bp.length), [tx, ty] = bp[ti]; twigs.push({ at: ti, pts: boltDense(boltPath(tx, ty, tx + px * rand(6, 14) + ux * 6, ty + py * rand(6, 14) + uy * 6, 4, 4)) }); }
    branches.push({ at, pts: bp, twigs });
  }
  const gi = Math.floor(glow * (main.length - 1));
  return { main, branches, t: 0, dur: rand(0.8, 1.05), seed: Math.random() * 100, gx: main[gi][0], gy: main[gi][1] };
}
function updateLightning(dt) {
  if (!lightningKind()) { bolts.length = 0; skyFlash = 0; return; }
  if (!animOn()) return;
  boltTimer -= dt;
  if (boltTimer <= 0) {                                          // грозові спалахи: одна, іноді дві блискавки підряд
    boltTimer = rand(1.0, 2.6);
    bolts.push(makeBolt());
    if (Math.random() < 0.4) { const bt = makeBolt(); bt.t = -rand(0.12, 0.3); bolts.push(bt); }
    skyFlash = 1;
  }
  skyFlash = Math.max(0, skyFlash - dt * 1.5);
  for (let i = bolts.length - 1; i >= 0; i--) { bolts[i].t += dt; if (bolts[i].t >= bolts[i].dur) bolts.splice(i, 1); }
}
// шари: [товщина, колір, прозорість] — широке м'яке світіння, яскраве тіло, біле ядро
const BOLT_COLS = {                                              // три кольори блискавок: однакові за кодом, різні лише за кольором
  lightning: { main: [[13, '#5a1aa8', 0.07], [9, '#7a2fd0', 0.14], [6, '#a56ae8', 0.34], [4, '#c9a0ff', 0.72], [2, '#f0e0ff', 1], [1, '#ffffff', 1]], branch: [[7, '#7a2fd0', 0.12], [4, '#a56ae8', 0.4], [2, '#e0ccff', 0.9], [1, '#ffffff', 1]], twig: [[3, '#a56ae8', 0.3], [1, '#ece0ff', 0.9]], tint: '#3b1470', flash: '#c9a0ff', glow: ['v', 'a'], ring: ['v', 'u'], spark: 'a' },
  lightninggreen: { main: [[13, '#0b5a24', 0.07], [9, '#1d9a45', 0.14], [6, '#4fd77a', 0.34], [4, '#a0f5b8', 0.72], [2, '#e8ffee', 1], [1, '#ffffff', 1]], branch: [[7, '#1d9a45', 0.12], [4, '#4fd77a', 0.4], [2, '#d0ffdc', 0.9], [1, '#ffffff', 1]], twig: [[3, '#4fd77a', 0.3], [1, '#e8ffee', 0.9]], tint: '#0e4a22', flash: '#a0f5b8', glow: ['#1d9a45', '#4fd77a'], ring: ['#1d9a45', '#7ef0a0'], spark: '#7ef0a0' },
  lightningred: { main: [[13, '#6a0a14', 0.07], [9, '#b01a2a', 0.14], [6, '#e8505a', 0.34], [4, '#ffa0a0', 0.72], [2, '#ffe8e8', 1], [1, '#ffffff', 1]], branch: [[7, '#b01a2a', 0.12], [4, '#e8505a', 0.4], [2, '#ffd0d0', 0.9], [1, '#ffffff', 1]], twig: [[3, '#e8505a', 0.3], [1, '#ffe8e8', 0.9]], tint: '#5a0a14', flash: '#ffa0a0', glow: ['#b01a2a', '#e8505a'], ring: ['#b01a2a', '#ff8088'], spark: '#ff8088' }
};
function lightningKind() { const k = skinOn('weather'); return k && BOLT_COLS[k] ? k : null; }
function strokeBolt(g, pts, count, layers, I) {
  const n = Math.min(pts.length, Math.floor(count));
  if (n < 1) return;
  layers.forEach(([w, c, al]) => {
    g.globalAlpha = Math.min(1, al * I); g.fillStyle = c;
    const h = w >> 1;
    for (let i = 0; i < n; i++) g.fillRect(pts[i][0] - h, pts[i][1] - h, w, w);
  });
  g.globalAlpha = 1;
}
function boltIntensity(ph) {                                     // різкий удар, плавне згасання, другий слабший «зворотний» спалах
  if (ph < 0) return 0;
  const main = ph < 0.16 ? 1 : Math.max(0, 1 - (ph - 0.16) / 0.84);
  const flick = 0.82 + 0.18 * Math.cos(ph * 40);
  const second = 0.42 * Math.exp(-Math.pow((ph - 0.32) / 0.045, 2));
  return Math.min(1, main * main * flick + second);
}
function drawLightningBack() {                                 // у небі: грозовий відтінок, світіння хмар і самі блискавки
  const BC = BOLT_COLS[lightningKind()];
  ctx.globalAlpha = bolts.length || skyFlash > 0 ? 0.16 + 0.2 * skyFlash : 0.12; ctx.fillStyle = BC.tint; ctx.fillRect(worldL(), -view.offY, view.w, view.h); ctx.globalAlpha = 1;
  bolts.forEach(bt => {
    if (bt.t < 0) return;
    const ph = bt.t / bt.dur, I = boltIntensity(ph); if (I <= 0.02) return;
    const q = Math.min(1, bt.t / 0.13), cnt = bt.main.length * q;
    for (let i = 0; i < 4; i++) { ctx.globalAlpha = (0.05 + 0.025 * i) * I; disc(ctx, bt.gx, bt.gy + 6, 34 - i * 8, i < 2 ? BC.glow[0] : BC.glow[1]); }      // хмара світиться зсередини
    strokeBolt(ctx, bt.main, cnt, BC.main, I);
    bt.branches.forEach(br => {
      const p0 = br.at / bt.main.length, bq = Math.max(0, Math.min(1, (q - p0) / 0.35 + (q >= 1 ? 1 : 0)));
      strokeBolt(ctx, br.pts, br.pts.length * bq, BC.branch, I);
      br.twigs.forEach(tw => { const tq = Math.max(0, Math.min(1, (bq * br.pts.length - tw.at) / tw.pts.length)); strokeBolt(ctx, tw.pts, tw.pts.length * tq, BC.twig, I); });
    });
    if (q > 0.97) {                                                // вогник у місці удару, кільце світла й іскри
      const [ex, ey] = bt.main[bt.main.length - 1];
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = (0.07 + 0.05 * i) * I; disc(ctx, ex, ey, 16 - i * 4, i < 2 ? BC.ring[0] : BC.ring[1]); }
      ctx.globalAlpha = I; disc(ctx, ex, ey, 2, 'w');
      for (let k = 0; k < 7; k++) { const an = bt.seed + k * 0.9 + bt.t * 7, r = 3 + (bt.t * 26 + k * 4) % 16; ctx.globalAlpha = 0.9 * I * (1 - ph); R(ctx, Math.round(ex + Math.cos(an) * r), Math.round(ey + Math.sin(an) * r * 0.55 - 2), 1, 1, k % 2 ? 'w' : BC.spark); }
    } else { const [lx, ly] = bt.main[Math.max(0, Math.floor(cnt) - 1)]; ctx.globalAlpha = 0.5; disc(ctx, lx, ly, 3, 'w'); }      // яскравий кінчик, що біжить униз
  });
  ctx.globalAlpha = 1;
}
function drawLightningFront() {                                // спалах освітлює все місто фіолетовим
  if (!lightningKind() || skyFlash <= 0.02) return;
  ctx.globalAlpha = 0.24 * skyFlash * skyFlash; ctx.fillStyle = BOLT_COLS[lightningKind()].flash; ctx.fillRect(worldL(), -view.offY, view.w, view.h); ctx.globalAlpha = 1;
}
function updateDecorFx(dt) {
  updateLightning(dt);
  updateCloudSkinFx(dt);
  updateShopSkinFx(dt);
  updateSkinDust(dt);
  if (!animOn()) return;
  snow.forEach(f => { f.y += f.vy * dt; if (f.y > worldB()) { f.y = -view.offY - 2; f.x = rand(worldL(), worldR()); } });
  bats.forEach(b => {
    b.x += b.vx * dt;
    if (b.x < worldL() - 10) b.x = worldR() + 10; else if (b.x > worldR() + 10) b.x = worldL() - 10;
  });
}


// ---------- Прикраси неба по епохах ----------
const SKYX = { items: [], banner: null, tBanner: 6, meteors: [], tMeteor: 0.6, ep: -1 };
const SKYX_TET = [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]]];
function skyxLn(g, x0, y0, x1, y1, c) { lineG(g, Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), c); }
function skyxTetris(init) { const top = 8 - view.offY; return { k: 'tet', x: Math.round(rand(worldL() + 10, worldR() - 20)), y: init ? rand(top, 70) : top - 22, vy: rand(5, 9), cells: SKYX_TET[Math.floor(Math.random() * SKYX_TET.length)], c: ['N', 'f', 'y', 'g', 'o', 'v', 'T'][Math.floor(Math.random() * 7)], rt: rand(0.8, 2), rot: 0 }; }
function seedSkyExtra() {
  const ep = viewEpoch() % EPOCHS.length, wide = Math.max(1, view.w / 320), top = 8 - view.offY;
  SKYX.ep = ep; SKYX.items = []; SKYX.banner = null; SKYX.tBanner = rand(3, 8); SKYX.meteors = []; SKYX.tMeteor = rand(0.3, 1);
  if (ep === 0) {                                                       // повітряні кулі: рідко (одна на ~260 px світу), рівномірно по світу, летять в один бік з близькою швидкістю, тож не збиваються докупи
    const n = Math.max(4, Math.round((worldR() - worldL()) / 165)), step = (worldR() - worldL()) / n, dir = Math.random() < 0.5 ? -1 : 1;
    for (let i = 0; i < n; i++) SKYX.items.push({ k: 'hab', x: worldL() + step * (i + 0.5) + rand(-step * 0.15, step * 0.15), y: Math.max(top + 16, LAYOUT.horizonY - 134 - [0, 12, 24, 6, 18][i % 5] + rand(-4, 4)), r: [13, 11, 9][i % 3], vx: dir * rand(1.2, 1.6), ph: rand(0, 6), c: [['r', 'w'], ['n', 'y'], ['g', 'w'], ['p', 'w'], ['h', 'n']][i % 5] });
  }
  if (ep === 0) for (let i = 0; i < Math.max(2, Math.round(2 * wide)); i++) SKYX.items.push({ k: 'kite', x: rand(worldL() + 20, worldR() - 20), y: rand(top + 14, 58), vx: rand(0.8, 1.8) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6), c: [['r', 'w'], ['y', 'n'], ['g', 'w']][i % 3] });
  if (ep === 1) {
    const nP = Math.max(3, Math.round((worldR() - worldL()) / 380));                                   // пропелерні літаки різних кольорів: на екрані завжди хоча б один
    for (let i = 0; i < nP; i++) SKYX.items.push({ k: 'ppl', x: worldL() + (worldR() - worldL()) * (i + rand(0.2, 0.8)) / nP, y: rand(top + 16, Math.max(top + 34, 8)), vx: rand(16, 26) * (i % 2 ? -1 : 1), ph: rand(0, 6), c: [['r', 'w'], ['n', 'y'], ['g', 'w'], ['o', 'w']][i % 4] });
    for (let i = 0; i < Math.max(1, Math.round((worldR() - worldL()) / 700)); i++) SKYX.items.push({ k: 'rkt', x: rand(worldL() + 20, worldR() - 20), y: rand(top + 14, Math.max(top + 30, 0)), vx: rand(7, 12) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6) });
    for (let i = 0; i < Math.max(2, Math.round((worldR() - worldL()) / 420)); i++) SKYX.items.push({ k: 'heli', x: rand(worldL() + 20, worldR() - 20), y: rand(top + 24, Math.max(top + 44, 14)), vx: rand(9, 15) * (i % 2 ? -1 : 1), ph: rand(0, 6) });
  }
  if (ep === 2) for (let i = 0; i < Math.max(7, Math.round(8 * wide)); i++) SKYX.items.push({ k: 'note', x: rand(worldL() + 10, worldR() - 10), x0: 0, y: rand(top + 16, 128), vy: -rand(6, 10), ph: rand(0, 6.28), amp: rand(5, 11), c: ['f', 'T', 'y', 'p', 'a'][i % 5], g: i % 3 });
  if (ep === 3) for (let i = 0; i < Math.round(9 * wide); i++) SKYX.items.push(skyxTetris(true));
  if (ep === 3) for (let i = 0; i < Math.max(2, Math.round(3 * wide)); i++) SKYX.items.push({ k: 'inv', x: rand(worldL() + 20, worldR() - 20), y: rand(top + 10, 46), vx: rand(6, 11) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6), v: i % 3 });
  if (ep === 4) for (let i = 0; i < Math.round(6 * wide); i++) SKYX.items.push({ k: 'drn', x: rand(worldL(), worldR()), y: rand(top + 8, 66), vx: rand(8, 15) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6), box: i % 3 !== 2 });
  if (ep === 5) for (let i = 0; i < Math.round(5 * wide); i++) SKYX.items.push({ k: 'bfly', x: rand(worldL(), worldR()), y: rand(top + 30, 112), vx: rand(5, 10) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6), c: [['o', 'y'], ['f', 'w'], ['a', 'S'], ['p', 'w']][i % 4] });
  if (ep === 5) for (let i = 0; i < Math.max(3, Math.round(3.5 * wide)); i++) SKYX.items.push({ k: 'isl', v: i % 3, x: rand(worldL() + 30, worldR() - 30), y: rand(top + 30, 62), w: [44, 36, 54, 40][i % 4] + Math.round(rand(0, 6)), vx: rand(0.6, 1.4) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6) });
}
function updateSkyExtra(dt) {
  if (SKYX.ep !== viewEpoch() % EPOCHS.length) seedSkyExtra();
  if (!animOn()) return;
  const top = 8 - view.offY;
  SKYX.items.forEach(f => {
    if (f.k === 'hab') { f.x += f.vx * dt; f.ph += dt * 0.6; }
    else if (f.k === 'drn') { f.x += f.vx * dt; f.ph += dt * 3; if (f.x < worldL() - 8) f.vx = Math.abs(f.vx); if (f.x > worldR() + 8) f.vx = -Math.abs(f.vx); }
    else if (f.k === 'isl') { f.x += f.vx * dt; f.ph += dt * 0.5; }
    else if (f.k === 'kite') { f.x += f.vx * dt; f.ph += dt * 1.2; }
    else if (f.k === 'note') { f.y += f.vy * dt; f.ph += dt * 1.1; if (f.y < top - 6) { f.y = 130; f.x = rand(worldL() + 10, worldR() - 10); f.ph = rand(0, 6.28); } }
    else if (f.k === 'ppl') { f.x += f.vx * dt; f.ph += dt; }
    else if (f.k === 'rkt') { f.x += f.vx * dt; f.ph += dt * 1.2; }
    else if (f.k === 'heli') { f.x += f.vx * dt; f.ph += dt * 1.6; }
    else if (f.k === 'inv') { f.x += f.vx * dt; f.ph += dt; if (f.x > worldR() + 12) f.vx = -Math.abs(f.vx); if (f.x < worldL() - 12) f.vx = Math.abs(f.vx); }
    else if (f.k === 'bfly') { f.x += f.vx * dt; f.y += Math.sin(f.ph * 1.7) * 6 * dt; f.ph += dt * 3; if (f.y < top + 24) f.y += 10 * dt; if (f.y > 122) f.y -= 10 * dt; }
    else if (f.k === 'tet') { f.y += f.vy * dt; f.rt -= dt; if (f.rt <= 0) { f.rt = rand(1, 2.2); f.rot = (f.rot + 1) % 4; } if (f.y > 96) Object.assign(f, skyxTetris(false)); }
    if (f.k !== 'tet' && f.k !== 'drn' && f.k !== 'note' && f.k !== 'inv') { if (f.x > worldR() + 60) f.x = worldL() - 60; else if (f.x < worldL() - 60) f.x = worldR() + 60; }
  });
  if (SKYX.ep === 1) {
    if (SKYX.banner) { SKYX.banner.x += SKYX.banner.vx * dt; if (SKYX.banner.x > worldR() + 90) { SKYX.banner = null; SKYX.tBanner = rand(5, 11); } }
    else { SKYX.tBanner -= dt; if (SKYX.tBanner <= 0) SKYX.banner = { x: worldL() - 90, y: rand(top + 12, 44), vx: rand(38, 52) }; }
  }
  if (SKYX.ep === 6) {
    SKYX.tMeteor -= dt; if (SKYX.tMeteor <= 0) { SKYX.tMeteor = rand(0.23, 0.73); SKYX.meteors.push({ x: rand(worldL() + 20, worldR() + 40), y: rand(top - 6, 30), vx: -rand(70, 110), vy: rand(30, 50), life: 0 }); }
    for (let i = SKYX.meteors.length - 1; i >= 0; i--) { const m = SKYX.meteors[i]; m.x += m.vx * dt; m.y += m.vy * dt; m.life += dt; if (m.life > 1.1) SKYX.meteors.splice(i, 1); }
  }
}
// Повітряна куля: об'ємна (шість відтінків, світло зверху-ліворуч, тінь знизу-праворуч, як у хмар), справжній «грушевий» силует, меридіани-смуги, пояс, канати й кошик. Малюється один раз у полотно
const balloonCache = {};
function hexRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function mixHex(a, b, k) { const p = hexRgb(a), q = hexRgb(b); return 'rgb(' + p.map((v, i) => Math.round(v + (q[i] - v) * k)).join(',') + ')'; }
function balloonCanvas(r, c1, c2) {
  const key = r + c1 + c2;
  if (balloonCache[key]) return balloonCache[key];
  const rampOf = base => { const h = PALETTE[base] || base; return [mixHex(h, '#ffffff', 0.42), mixHex(h, '#ffffff', 0.16), h, mixHex(h, '#3b3560', 0.3), mixHex(h, '#272048', 0.55)]; };
  const R1 = rampOf(c1), R2 = rampOf(c2), TRIM = rampOf('y');
  const Henv = Math.round(r * 2.4), cy = r, low = Henv - r, ropeL = Math.max(3, Math.round(r * 0.5)), bw = Math.max(5, Math.round(r * 0.75)), bh = Math.max(3, Math.round(r * 0.42));
  const W = r * 2 + 4, H = 1 + Henv + ropeL + bh + 2, cx = W / 2;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const half = y => { const dy = y - cy; if (dy <= 0) return Math.sqrt(Math.max(0, r * r - dy * dy)); const u = Math.min(1, dy / low); return Math.max(r * 0.3, r * (1 - 0.7 * Math.pow(u, 1.5))); };
  const gores = r >= 9 ? 6 : 5, L = [-0.55, -0.6, 0.58];
  const inside = (x, y) => y >= 1 && y < 1 + Henv && Math.abs(x + 0.5 - cx) <= half(y - 1);
  for (let y = 1; y < 1 + Henv; y++) {
    const hw = half(y - 1);
    for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - cx; if (Math.abs(dx) > hw) continue;
      const nx = Math.max(-1, Math.min(1, dx / Math.max(0.5, hw))), th = Math.asin(nx);
      const dyN = y - 1 - cy, ny = Math.max(-1, Math.min(1, dyN / (r * (dyN > 0 ? 1.4 : 1)))), nz = Math.sqrt(Math.max(0.02, 1 - nx * nx * 0.8 - ny * ny * 0.6));
      const lum = (nx * L[0] + ny * L[1] + nz * L[2]);
      let sh = 0.72 - lum * 0.58 + (((x * 3 + y * 7) % 5 === 0) ? 0.05 : 0) + (((x + y) & 1) ? 0.025 : 0);
      if (!inside(x - 1, y - 1)) sh -= 0.18;          // світла кромка зверху-ліворуч
      if (!inside(x + 1, y + 1)) sh += 0.24;          // тінь на нижньо-правому краї
      const gi = Math.floor((th + Math.PI / 2) / (Math.PI / gores) + 1e-6) % 2;
      let rp = gi ? R1 : R2;
      if (y - 1 >= cy + r * 0.5 && y - 1 < cy + r * 0.5 + Math.max(2, Math.round(r * 0.28))) rp = TRIM;       // пояс-оздоба
      g.fillStyle = sh < 0.14 ? rp[0] : sh < 0.34 ? rp[1] : sh < 0.55 ? rp[2] : sh < 0.76 ? rp[3] : rp[4];
      g.fillRect(x, y, 1, 1);
    }
  }
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(Math.round(cx - r * 0.55), 1 + Math.round(r * 0.45), 2, 1); g.fillRect(Math.round(cx - r * 0.55) - 1, 1 + Math.round(r * 0.45) + 1, 1, 2);    // відблиск
  g.fillStyle = R1[4]; g.fillRect(Math.round(cx) - 1, 1, 2, 1);                                                    // верхній клапан
  const nw = Math.max(2, Math.round(half(Henv - 1))), nyb = 1 + Henv;                                           // обідок горловини
  g.fillStyle = '#3a2f3d'; g.fillRect(Math.round(cx - nw), nyb - 1, nw * 2, 1);
  const bx0 = Math.round(cx - bw / 2), by0 = nyb + ropeL;                                                         // канати й кошик
  g.fillStyle = '#5a4a52';
  const rope = (xa, ya, xb, yb) => { const n = Math.max(1, Math.abs(yb - ya)); for (let i = 0; i <= n; i++) g.fillRect(Math.round(xa + (xb - xa) * i / n), Math.round(ya + (yb - ya) * i / n), 1, 1); };
  rope(cx - nw + 0.5, nyb, bx0 + 0.5, by0); rope(cx + nw - 1.5, nyb, bx0 + bw - 1.5, by0);
  g.fillStyle = '#4a3228'; g.fillRect(bx0, by0, bw, bh);
  for (let yy = 0; yy < bh - 1; yy++) for (let xx = 1; xx < bw - 1; xx++) { g.fillStyle = (xx + yy) & 1 ? '#a8703f' : '#7a4f35'; g.fillRect(bx0 + xx, by0 + 1 + yy, 1, 1); }
  g.fillStyle = '#dba46a'; g.fillRect(bx0, by0, bw, 1);
  cv.cx = cx; cv.topY = 1; cv.neckY = nyb; cv.burnY = nyb + 1;
  return (balloonCache[key] = cv);
}
function skyxBalloon(x, y, r, c1, c2, ph) {
  const cv = balloonCanvas(r, c1, c2), sway = Math.sin(ph) * 1.5;
  x = Math.round(x - cv.cx); y = Math.round(y + sway - r - 1);
  ctx.drawImage(cv, x, y);
  if (Math.floor(animClock * 7 + ph * 3) % 3) { const fx = Math.round(x + cv.cx) - 1; R(ctx, fx, y + cv.burnY, 1, 2, 'o'); R(ctx, fx, y + cv.burnY, 1, 1, 'y'); }       // пальник блимає
}
