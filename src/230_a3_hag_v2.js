//#part 230_a3_hag_v2.js
/* «Хатка відьми» v2 (Хелловін): відьма на мітлі (політ, коло, спуск у хатку), хатка на курячих лапках, портрет і сцена з казанками.
   Палітра гри, 1px темні контури, світло зліва-зверху. Усе малюється кодом (R/disc/lineG), кожен кадр, тож усе анімоване. */
function hvEll(g, cx, cy, rx, ry, c) {                          // заповнений еліпс з пікселів
  for (let dy = -ry; dy <= ry; dy++) { const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.0001)))); R(g, cx - half, cy + dy, half * 2 + 1, 1, c); }
}
function witchV2(g, x, y, dir, t, o) {                           // відьма на мітлі; (x, y) — сідло; dir −1 дзеркалить; o.pitch — нахил мітли (рад, + носом угору); повертає кінець віника у світі
  o = o || {};
  const th = Math.max(-0.7, Math.min(0.7, o.pitch || 0)), ca = Math.cos(th), sa = Math.sin(th), lean = Math.round(-th * 3);
  const mx = dx => dir < 0 ? x - dx : x + dx;
  const P = (dx, dy, w, h, c) => R(g, dir < 0 ? x - dx - w + 1 : x + dx, y + dy, w, h, c);
  const L = (x0, y0, x1, y1, c) => lineG(g, mx(Math.round(x0)), Math.round(y + y0), mx(Math.round(x1)), Math.round(y + y1), c);
  const fw = Math.sin(t * 8), sw = Math.round(Math.sin(t * 5) * 1.5);
  const Ax = -17 * ca, Ay = 2 + 17 * sa, Bx = 19 * ca, By = 2 - 19 * sa;     // тильний і передній кінці держака
  // плащ позаду: широкий, хвилястий, зі «ластівчиним» краєм
  for (let i = 0; i < 17; i++) {
    const w = Math.sin(t * 7 - i * 0.55) * (0.5 + i * 0.12), top = -8 + Math.round(i * 0.18 + w), h = Math.max(3, 11 - Math.round(i * 0.45)) + (i % 4 === 3 ? -1 : 0);
    P(-4 - i + lean, top - 1, 1, h + 2, 'k'); P(-4 - i + lean, top, 1, h, i % 6 < 3 ? 'v' : 'P'); P(-4 - i + lean, top, 1, 1, 'u'); P(-4 - i + lean, top + h - 2, 1, 2, 'P');
  }
  // віник: стеблини віялом, перев'язь
  for (let i = -4; i <= 4; i++) {
    const d = i * 0.17 + Math.sin(t * 10 + i * 1.3) * 0.09, len = 10 + (Math.abs(i) < 3 ? 3 : 0) + (i & 1);
    const ex = Ax - len * Math.cos(th + d), ey = Ay + len * Math.sin(th + d);
    L(Ax, Ay + i * 0.4, ex, ey + i * 0.4, Math.abs(i) > 2 ? 'd' : Math.abs(i) > 0 ? 'o' : 'h');
    if (Math.abs(i) < 2) L(Ax - 2 * ca, Ay + 2 * sa + i * 0.4, ex + 1, ey + i * 0.4, 'y');
  }
  P(Math.round(Ax) - 1, Math.round(Ay) - 3, 3, 6, 'k'); P(Math.round(Ax), Math.round(Ay) - 2, 1, 4, 'r');
  // держак: три лінії (блік, тіло, контур)
  L(Ax, Ay - 1, Bx, By - 1, 'c'); L(Ax, Ay, Bx, By, 'b'); L(Ax, Ay + 1, Bx, By + 1, 'd');
  P(Math.round(Bx), Math.round(By) - 1, 3, 3, 'd'); P(Math.round(Bx), Math.round(By) - 1, 2, 1, 'c');
  // задня нога
  P(-4 + lean, 1, 5, 8, 'k'); P(-3 + lean, 1, 3, 6, 'V'); P(-5 + lean, 8, 6, 3, 'k'); P(-4 + lean, 8, 4, 1, 'V');
  // тулуб: коротка сукня зі складками, пояс із пряжкою
  P(-5 + lean, -9, 11, 11, 'k'); P(-4 + lean, -8, 9, 10, 'P'); P(-4 + lean, -8, 3, 10, 'v'); P(-4 + lean, -8, 1, 10, 'u'); P(3 + lean, -8, 2, 10, 'V');
  P(-4 + lean, -3, 9, 2, 'V'); P(-1 + lean, -3, 3, 2, 'y'); P(0 + lean, -3, 1, 2, 'h');
  P(-5, 0, 12, 3, 'k'); P(-4, 0, 10, 2, 'P'); P(-4, 0, 3, 1, 'u'); P(-5, 2, 1, 1, 'k'); P(1, 2, 1, 1, 'V'); P(4, 2, 1, 1, 'V');
  // передня нога: коліно на держаку, гомілка й гострий чобіт гойдаються
  P(0, 0, 7, 4, 'k'); P(1, 0, 5, 3, 'v'); P(1, 0, 3, 1, 'u');
  P(3 + sw, 3, 5, 7, 'k'); P(4 + sw, 3, 3, 6, 'P'); P(4 + sw, 3, 1, 6, 'v');
  P(2 + sw, 9, 8, 4, 'k'); P(3 + sw, 9, 6, 2, 'V'); P(9 + sw, 10, 3, 2, 'k'); P(3 + sw, 9, 2, 1, 'v'); P(3 + sw, 12, 6, 1, 'd');
  // рука до держака
  const hx = Math.round(9 * ca), hy = Math.round(1 - 9 * sa);
  L(1 + lean, -6, hx, hy - 1, 'k'); L(1 + lean, -5, hx, hy, 'v'); L(2 + lean, -7, hx + 1, hy - 1, 'k');
  P(hx - 1, hy - 2, 4, 4, 'k'); P(hx, hy - 1, 2, 2, 'W');
  // голова (велика, мила): лице, ніс, око з відблиском, рум'янець, усмішка
  const cx = 2 + lean, cy = -14;
  P(cx - 5, cy - 4, 11, 10, 'k'); P(cx - 4, cy - 3, 9, 8, 'W'); P(cx - 4, cy - 3, 9, 1, 'q'); P(cx + 5, cy, 3, 3, 'k'); P(cx + 5, cy + 1, 2, 2, 'W');
  P(cx + 2, cy - 1, 2, 3, 'k'); P(cx + 2, cy - 1, 1, 1, 'w'); P(cx - 1, cy + 2, 2, 1, 'f'); P(cx + 2, cy + 4, 3, 1, 'r'); P(cx + 5, cy + 3, 1, 1, 'r');
  // волосся: рожеві пасма розвіваються назад
  for (let i = 0; i < 4; i++) {
    let px = cx - 5, py = cy - 2 + i * 2;
    for (let j = 0; j < 9; j++) { px -= 1; py += Math.round(Math.sin(t * 9 - j * 0.6 + i) * 0.8 * (j / 8)) + (j % 3 === 2 ? 1 : 0); P(px, py - 1, 1, 3, 'k'); P(px, py, 1, 2, i === 0 ? 'q' : i === 3 ? 'J' : 'f'); }
  }
  P(cx - 4, cy - 6, 10, 3, 'f'); P(cx - 4, cy - 6, 5, 1, 'q'); P(cx + 4, cy - 4, 2, 3, 'f');
  // капелюх: широкі крисси, конус із вигином і пряжка
  P(cx - 9, cy - 9, 19, 4, 'k'); P(cx - 8, cy - 8, 17, 2, 'v'); P(cx - 8, cy - 9, 17, 1, 'u'); P(cx - 8, cy - 7, 17, 1, 'P'); P(cx - 9, cy - 8, 1, 1, 'u');
  for (let r = 0; r < 13; r++) {
    const half = Math.max(1, Math.round(5.5 * (1 - r / 13)) + 1), bend = -Math.round(r * 0.4) - (r > 6 ? Math.round((r - 6) * 0.35 + Math.sin(t * 6) * 0.6) : 0);
    P(cx + bend - half - 1, cy - 10 - r, half * 2 + 3, 1, 'k'); P(cx + bend - half, cy - 10 - r, half * 2 + 1, 1, 'v'); P(cx + bend - half, cy - 10 - r, 2, 1, 'u'); P(cx + bend + half - 1, cy - 10 - r, 2, 1, 'P');
    if (r === 0 || r === 1) P(cx + bend - half, cy - 10 - r, half * 2 + 1, 1, r === 0 ? 'h' : 'y');
  }
  P(cx - 1, cy - 10, 3, 2, 'o'); P(cx, cy - 10, 1, 2, 'k');
  // ліхтарик-гарбуз на мотузці (м'яке сяйво)
  const sx = Bx + Math.sin(t * 3) * 2.2, sy = By + 7;
  L(Bx + 1, By + 1, sx, sy, 'd');
  const px = Math.round(sx) - 3, py = Math.round(sy), ga = o.k == null ? 1 : o.k;
  g.globalAlpha = ga * 0.1; disc(g, mx(px + 3), y + py + 3, 13, 'y'); g.globalAlpha = ga * 0.16; disc(g, mx(px + 3), y + py + 3, 9, 'y'); g.globalAlpha = ga;
  P(px - 1, py, 8, 7, 'k'); P(px, py, 6, 6, 'o'); P(px, py, 2, 6, 'h'); P(px + 4, py, 2, 6, 'r'); P(px + 2, py + 2, 1, 2, 'y'); P(px + 4, py + 2, 1, 2, 'y'); P(px + 2, py + 4, 3, 1, 'y'); P(px + 2, py - 2, 2, 2, 'g');
  return { tx: mx(Math.round(Ax - 11 * Math.cos(th))), ty: Math.round(y + Ay + 11 * Math.sin(th)) };
}

/* ---- відьма в небі ---- */
const hagFly = { on: false, x: 0, y: 0, dir: -1, t: 0, wait: 0, mode: 'cruise', pitch: 0, base: 0, parts: [], emit: 0, ot: 0, ph: 0, ox: 0, oy: 0, du: 0, sx: 0, sy: 0 };      // mode: cruise — плавно небом; orbit — коло над хаткою після тапу; dive — спуск у двері
const hagOrbitPos = ph => ({ x: circusStopX() + 58 * Math.cos(ph), y: hallowSkyY() + 16 + 15 * Math.sin(ph) });
const hagEase = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
function hagCruiseY(t) { return hagFly.base + Math.sin(t * 1.25) * 15 + Math.sin(t * 0.47 + 1) * 7; }
function hagStartFlight() { const F = hagFly; F.on = true; F.mode = 'cruise'; F.dir = -1; F.x = visR() + 60; F.base = hallowSkyY() + rand(0, 12); F.y = hagCruiseY(0); F.t = 0; F.pitch = 0; playSfx('hagCackle'); }
function hagTap() {                                                  // тап по «!»: відьма робить коло над місцем стоянки
  const F = hagFly; if (!F.on) hagStartFlight();
  F.mode = 'orbit'; F.ot = 0; let best = 0, bd = 1e9;
  for (let k = 0; k < 24; k++) { const p = hagOrbitPos(k / 24 * Math.PI * 2), d = Math.hypot(p.x - F.x, p.y - F.y); if (d < bd) { bd = d; best = k / 24 * Math.PI * 2; } }
  F.ph = best; const p0 = hagOrbitPos(best); F.ox = F.x - p0.x; F.oy = F.y - p0.y;
}
function hagDoor() { return { x: circus.x + 2, y: circusY() - 11 }; }
function hagPosAt(F, dt) {                                           // нова позиція за режимом
  if (F.mode === 'cruise') return { x: F.x + F.dir * 54 * dt, y: hagCruiseY(F.t) };
  if (F.mode === 'orbit') { const p = hagOrbitPos(F.ph), k = 1 - hagEase(F.ot / 1.3); return { x: p.x + F.ox * k, y: p.y + F.oy * k }; }
  const u = Math.min(1, F.du / 1.5), e = hagEase(u), D = hagDoor(), r = Math.sin(u * Math.PI) * 30, a = u * 8;
  return { x: F.sx + (D.x - F.sx) * e + Math.cos(a) * r, y: F.sy + (D.y - F.sy) * e + Math.sin(a) * r * 0.45 };
}
function hagBurst(x, y, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = rand(12, 46); hagFly.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10, life: rand(0.5, 1.1), max: 1.1, big: i % 4 === 0 }); } }
function updateHagFly(dt) {
  const c = state.circus, F = hagFly;
  for (let i = F.parts.length - 1; i >= 0; i--) { const p = F.parts[i]; p.life -= dt; if (p.life <= 0) { F.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 22 * dt; p.vx *= 0.985; }
  const active = c.hag && (c.phase === 1 || ((c.phase === 2.5 || c.phase === 2.7) && F.on));
  if (!active) { F.on = false; F.mode = 'cruise'; return; }
  if (!F.on) { if (c.phase !== 1) return; F.wait -= dt; if (F.wait <= 0) hagStartFlight(); return; }
  F.t += dt;
  if (F.mode === 'orbit') { F.ot += dt; F.ph += 2.1 * dt; if (c.phase === 2.7) { F.mode = 'dive'; F.du = 0; F.sx = F.x; F.sy = F.y; } }
  if (F.mode === 'dive') F.du += dt;
  const q = hagPosAt(F, dt), vx = (q.x - F.x) / Math.max(dt, 1e-3), vy = (q.y - F.y) / Math.max(dt, 1e-3);
  F.x = q.x; F.y = q.y;
  if (Math.abs(vx) > 6) F.dir = vx < 0 ? -1 : 1;
  F.pitch += (Math.max(-0.6, Math.min(0.6, Math.atan2(-vy, Math.max(20, Math.abs(vx))))) - F.pitch) * Math.min(1, dt * 6);
  F.emit -= dt;                                                       // зоряний шлейф із віника
  while (F.emit <= 0) { F.emit += 0.03; const tl = hagTail(F); F.parts.push({ x: tl.x, y: tl.y, vx: -F.dir * rand(4, 22), vy: rand(-10, 8), life: rand(0.6, 1.1), max: 1.1, big: Math.random() < 0.2 }); }
  if (F.mode === 'dive' && F.du >= 1.5) { const D = hagDoor(); hagBurst(D.x, D.y, 22); spawnDust(D.x, D.y + 10, 8); playSfx('pip'); F.on = false; F.mode = 'cruise'; }
  if (F.mode === 'cruise' && F.x < visL() - 100) { F.on = false; F.wait = rand(2.5, 5); }
}
function hagTail(F) { const th = F.pitch, a = Math.cos(th), s = Math.sin(th); return { x: Math.round(F.x - F.dir * (17 + 11) * a), y: Math.round(F.y + 2 + (17 + 11) * s) }; }
function drawHagFlyer() {                                           // єдина відьма: летить на мітлі замість цирку (лише на Хелловін)
  const F = hagFly;
  F.parts.forEach(p => { const a = p.life / p.max, col = a > 0.7 ? 'w' : a > 0.45 ? 'y' : a > 0.25 ? 'o' : 'f'; ctx.globalAlpha = Math.min(1, a * 1.6); const px = Math.round(p.x), py = Math.round(p.y); R(ctx, px, py, 1, 1, col); if (p.big && a > 0.3) { R(ctx, px - 1, py, 3, 1, col); R(ctx, px, py - 1, 1, 3, col); } });
  ctx.globalAlpha = 1;
  if (!F.on) return;
  witchV2(ctx, Math.round(F.x), Math.round(F.y), F.dir, F.t, { pitch: F.pitch });
}
