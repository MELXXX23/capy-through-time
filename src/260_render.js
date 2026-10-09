//#part 260_render.js
/* =====================================================================
   МАЛЮВАННЯ КАДРУ
   ===================================================================== */

function render(time) {
  drawSkyScreen(time);
  ctx.save();
  ctx.translate(view.offX, view.offY);          // далі все малюється в координатах «ядра» сцени
  drawEpochBack();
  drawDecorBack();
  if (skinOn('weather') === 'rainbow') drawRainbowSkin();     // веселка — позаду будинків і магазину, вища за магазин
  else if (lightningKind()) drawLightningBack();
  drawCloudsLayer();
  drawBirds();
  drawEpochSky(time);
  ctx.drawImage(groundLayer, -view.offX, -view.offY);
  drawStreetShine();
  drawDecorDusk();
  ctx.drawImage(propsLayer, -view.offX, -view.offY);
  drawEpochMid(time);

  if (shop && shop.level >= 6 && !build) withShopScale(getShopScale(), drawClockTower);      // вежа стискається разом з магазином
  // магазин: тінь + спрайт зі стисканням (або будівництво)
  ctx.globalAlpha = 0.22; R(ctx, shop.x - 2, LAYOUT.curbY + 1, shop.w + 4, 3, 'd'); ctx.globalAlpha = 1;
  if (build) {
    renderBuild();
  } else {
    const sc = getShopScale();
    drawShopLayered(sc);
    drawShopShine(sc);
    // вивіска слідує за стисканням
    ui.shopOverlay.style.transform = (sc.sx === 1 && sc.sy === 1) ? 'none' : 'scale(' + sc.sx + ',' + sc.sy + ')';
  }

  drawManholeSteam();
  drawDecorGround();
  drawHalloweenFog();
  puddles.forEach(drawPuddle);
  if (sackDrop) drawSackDrop();

  // Капі та покупці — від дальніх до ближніх (за положенням ніг)
  const cp = LAYOUT.capy;
  const items = customers.filter(c => !c.inside).map(c => ({ y: c.y, draw: () => drawCustomer(c) }));       // ті, хто всередині, малюються разом з магазином
  actors.forEach(a => items.push({ y: a.y, draw: () => drawActor(a) }));
  cameos.forEach(c => items.push({ y: c.y, draw: () => drawCameo(c) }));
  guestWalkers.forEach(g => items.push({ y: g.y, draw: () => drawGuest(g) }));
  guestStands().forEach(st => items.push({ y: st.y, draw: () => drawGuestStand(st) }));
  if (trouble && trouble.type === 'thief') items.push({ y: trouble.y, draw: drawRaccoon });
  benches.forEach(b => { items.push({ y: b.y - 6, draw: () => drawBenchBack(b) }); items.push({ y: b.y - 1, draw: () => drawBenchFront(b) }); if (b.binX != null) items.push({ y: b.y, draw: () => drawBin(b) }); });
  if (view.extraB >= 30 || state.events.mailPending || mail.state !== 'idle') items.push({ y: mailRoadY() - 1, draw: drawMailBox });
  items.push({ y: mailRoadY() - 1, draw: drawNewsBox });
  if (mail.state !== 'idle') items.push({ y: mailRoadY(), draw: drawMailTruck });
  if (shop) items.push({ y: LAYOUT.curbY, draw: drawRainToggle });
  if (state.circus.phase >= 2) items.push({ y: circusY(), draw: drawCircus });
  if (state.circus.phase === 1) items.push({ y: bangPos().y, draw: drawBang });
  items.push({ y: cp.footY, draw: () => drawCapyFull(time, true) });
  function drawCapyFull(time, shadow) {
      const breath = (Math.sin(time * 2.2) + 1) / 2;
      capyScaled(() => {
        if (shadow) { ctx.globalAlpha = 0.22; R(ctx, cp.x, cp.footY, 28, 2, 'd'); ctx.globalAlpha = 1; }
        ctx.save(); ctx.translate(0, -capyHopY());
        drawCapyBody(breath);
        const capySkin = skinOn('capy');       // у скіні вже є свій капелюх і вбрання — сезонні не потрібні
        const lift = Math.round(24 * 1.2 * 0.045 * breath);        // тіло «дихає» (розтягується вгору), тож капелюх і шарфик піднімаються разом із ним
        if (hasHats() && !capySkin) drawHat(cp.x + 4, cp.footY - 24 - lift, 9);
        if (hasScarves() && !capySkin) {       // шарфик Капі
          R(ctx, cp.x + 4, cp.footY - 17 - lift, 11, 3, 'r'); R(ctx, cp.x + 4, cp.footY - 16 - lift, 11, 1, 'w');
          R(ctx, cp.x + 8, cp.footY - 14 - lift, 3, 6, 'r'); R(ctx, cp.x + 8, cp.footY - 11 - lift, 3, 1, 'w');
        }
        ctx.restore();
      });
  }
  items.sort((a, b) => a.y - b.y).forEach(it => it.draw());

  // пил від будівництва
  fx.dust.forEach(p => {
    const k = p.age / p.life;
    ctx.globalAlpha = 0.7 * (1 - k);
    disc(ctx, Math.round(p.x), Math.round(p.y), Math.round(p.r * (0.6 + k)), k < 0.5 ? 'w' : 'E');
  });
  ctx.globalAlpha = 1;

  drawRain();
  drawNightShade();
  if (sky.night > 0.2 && !build) { ctx.globalAlpha = Math.min(0.4, sky.night * 0.45); capyScaled(() => drawCapyBody((Math.sin(time * 2.2) + 1) / 2)); ctx.globalAlpha = 1; }       // вночі Капі не тьмяніє разом із вулицею
  drawNightLights();
  if (sky.lamp > 0.05 && !build) { ctx.globalAlpha = Math.min(0.92, 0.5 + sky.lamp * 0.45); drawCapyFull(time, false); ctx.globalAlpha = 1; }          // Капі поверх сяйва магазину
  drawHalloweenAir();
  drawHagFlyer();
  drawGhostHunt();

  // монетки
  fx.coins.forEach(p => {
    const fade = 1 - Math.max(0, (p.age - p.life * 0.6) / (p.life * 0.4));
    const spin = [1, 0.6, 0.25, 0.6][Math.floor(p.age * 12 + p.spin) % 4];
    drawSprite(ctx, coinSprite(), p.x - 4, p.y - 4, { sx: spin, alpha: fade });
  });
  // іскорки
  fx.sparks.forEach(p => {
    ctx.globalAlpha = 1 - p.age / p.life;
    R(ctx, Math.round(p.x), Math.round(p.y), 2, 2, p.col);
  });
  ctx.globalAlpha = 1;
  drawCloudSkinFx();
  drawSnow();
  drawLightningFront();
  drawEpochFront();
  ctx.restore();
}

// Будівництво: спершу старий магазин у риштуванні, потім новий «виростає» знизу вгору
// Магазин-«розріз»: інтер'єр, покупці всередині, скляний фасад, розсувні двері (все зі стисканням при тапі)
const shineTmp = document.createElement('canvas');
function drawStreetShine() {                                    // золота дорога: широка смуга блиску біжить діагоналлю, а на цеглинах спалахують зірочки
  if (skinOn('street') !== 'gold' || !animOn() || !layoutReady) return;
  const x0 = -view.offX, W = view.w, top = LAYOUT.streetTop + 1, bot = worldB() - (view.extraB >= 30 ? 36 : 0);
  if (bot <= top) return;
  const cyc = (animClock * 0.18) % 1, span = W + (bot - top) * 0.8 + 60, bx = x0 - 30 + cyc * span;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, top, W, bot - top); ctx.clip();
  for (let y = top; y < bot; y += 2) { const x = Math.round(bx - (y - top) * 0.8); ctx.globalAlpha = 0.30; R(ctx, x - 8, y, 34, 2, '#fff7c0'); ctx.globalAlpha = 0.55; R(ctx, x, y, 14, 2, '#ffffff'); }
  ctx.globalAlpha = 1;
  for (let r = 0, y = top; y < bot; r++, y += 6) for (let x = Math.floor((x0 - 12) / 12) * 12 + (r % 2) * 6 - 12; x < x0 + W; x += 12) {                    // ті самі цеглини, що малює cobbleExtra
    const hs = hash2(x + 11, r * 3 + 1); if (hs % 3 !== 0) continue;
    const v = Math.sin(animClock * 2.1 + (hs % 628) / 100); if (v < 0.3) continue;
    sparkPlus(x + 4 + (hs >>> 5) % 5, y + 3, (v - 0.3) / 0.7, '#fff6b0');
  }
  ctx.restore();
}
function drawShopShine(sc) {                                    // золотий скін блищить: біла смуга біжить по фасаду, а на золоті спалахують зірочки
  if (!shop || !shop.glints || !shop.glints.length || skinOn('shop') !== 'gold' || !animOn() || build) return;
  const w = shop.w, h = shop.h, cyc = (animClock * 0.32) % 1, show = cyc < 0.62;                    // смуга ходить із паузами
  if (show) {
    if (shineTmp.width !== w || shineTmp.height !== h) { shineTmp.width = w; shineTmp.height = h; }
    const g = shineTmp.getContext('2d'); g.imageSmoothingEnabled = false; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, w, h);
    g.drawImage(shop.canvas, 0, 0); g.globalCompositeOperation = 'source-atop';
    const x0 = (cyc / 0.62) * (w + h * 0.7 + 24) - 12;
    for (let y = 0; y < h; y++) { const x = Math.round(x0 - y * 0.7); g.fillStyle = 'rgba(255,248,210,0.42)'; g.fillRect(x, y, 8, 1); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(x + 2, y, 3, 1); }
    g.globalCompositeOperation = 'source-over';
  }
  withShopScale(sc, () => {
    if (show) ctx.drawImage(shineTmp, shop.x, shop.y);
    shop.glints.forEach(([gx, gy, big], i) => { const v = Math.sin(animClock * 2.4 + i * 1.7); if (v < 0.25) return; sparkPlus(shop.x + gx, shop.y + gy, (v - 0.25) / 0.75, '#fff6b0'); if (big && v > 0.7) { ctx.globalAlpha = (v - 0.7) / 0.3; R(ctx, shop.x + gx - 2, shop.y + gy, 5, 1, '#ffffff'); R(ctx, shop.x + gx, shop.y + gy - 2, 1, 5, '#ffffff'); ctx.globalAlpha = 1; } });
  });
}
function drawShopLayered(sc) {
  const w = shop.w, h = shop.h;
  const dw = Math.max(1, Math.round(w * sc.sx)), dh = Math.max(1, Math.round(h * sc.sy));
  const dx = Math.round(shop.x + (w - dw) / 2), dy = Math.round(shop.y + (h - dh));
  ctx.drawImage(shop.back, dx, dy, dw, dh);
  ctx.save();
  ctx.translate(dx, dy); ctx.scale(dw / w, dh / h); ctx.translate(-shop.x, -shop.y);     // далі малюємо у світових координатах
  ctx.beginPath(); ctx.rect(shop.x + 8, shop.y + shop.yB, w - 16, h - shop.yB); ctx.clip();
  drawCinemaMovie();
  customers.filter(c => c.inside).sort((p, q) => p.y - q.y).forEach(drawCustomer);
  ctx.restore();
  ctx.drawImage(shop.front, dx, dy, dw, dh);
  ctx.save();
  ctx.translate(dx, dy); ctx.scale(dw / w, dh / h);
  drawDoorLeaves(ctx, shop.door, shop.doorOpen || 0);
  ctx.restore();
  if (skinOn('shop') === 'gold' && animOn()) {               // золотий магазин мерехтить: чотири зірочки по черзі спалахують
    withShopScale(sc, () => [[0.12, 0.3], [0.88, 0.26], [0.5, 0.12], [0.33, 0.62], [0.7, 0.5]].forEach((p, i) => {
      if (Math.sin(animClock * 2.2 + i * 2.1) < 0.7) return;
      const x = Math.round(shop.x + shop.w * p[0]), y = Math.round(shop.y + shop.h * p[1]);
      R(ctx, x - 2, y, 5, 1, 'w'); R(ctx, x, y - 2, 1, 5, 'w'); R(ctx, x - 1, y - 1, 3, 3, 'y'); R(ctx, x, y, 1, 1, 'w');
    }));
  }
}
// Біле полотно-шатро: трикутний дах, складки, мотузки й кілочки, смуга «обережно» знизу; при відкритті нижній край піднімається вгору, як штора
function drawBuildTent(b, x0, x1, top, base, lift, t) {
  const W = x1 - x0, peak = 7, hemY = Math.round(base - lift), cx = Math.round((x0 + x1) / 2), mid = Math.round((top + hemY) / 2);
  for (let x = 0; x < W; x++) {
    const u = x / Math.max(1, W - 1), yT = top + Math.round(peak * Math.abs(u - 0.5) * 2), fold = Math.floor((x + Math.sin(t * 1.4 + x * 0.05) * 1.3) / 5);
    const h = hemY - yT; if (h <= 0) continue;
    const col = (x % 5 === 0) ? 'E' : (fold & 1 ? 'w' : 'W');
    R(ctx, x0 + x, yT, 1, h, col);
    R(ctx, x0 + x, yT, 1, 1, 'd'); R(ctx, x0 + x, yT + 1, 1, 1, 'w');
    if (x === 0 || x === W - 1) R(ctx, x0 + x, yT, 1, h, 'd');
    for (let k = 1; k * 22 < h - 4; k++) { const ry = yT + k * 22 + Math.round(Math.sin(u * Math.PI) * 1.4); if (ry < hemY - 5) R(ctx, x0 + x, ry, 1, 1, 'b'); }          // мотузки впоперек
    const hy = hemY - 4;                                                                                                                                       // смуга-попередження внизу
    for (let y = 0; y < 4; y++) if (hy + y > yT) R(ctx, x0 + x, hy + y, 1, 1, y === 3 ? 'd' : (((x + y * 2) >> 1) & 1 ? 'h' : 'k'));
  }
  if (hemY - 6 > top + 12) {                                                                                                                                   // знак «будівництво»: молоток на полотні
    R(ctx, cx - 1, mid - 5, 3, 12, 'd'); R(ctx, cx, mid - 5, 1, 12, 'b'); R(ctx, cx - 5, mid - 8, 11, 6, 'd'); R(ctx, cx - 4, mid - 7, 9, 4, 'e'); R(ctx, cx - 4, mid - 7, 9, 1, 'E');
    R(ctx, cx - 11, mid + 8, 23, 1, 'd');
  }
  if (lift < 2) {
    lineG(ctx, x0, top + peak + 3, x0 - 7, base, 'b'); lineG(ctx, x1 - 1, top + peak + 3, x1 + 6, base, 'b'); R(ctx, x0 - 9, base - 2, 3, 3, 'd'); R(ctx, x1 + 5, base - 2, 3, 3, 'd');       // розтяжки й кілочки
    R(ctx, cx, top - 8, 1, 9, 'd'); const wv = Math.round(Math.sin(t * 6) * 1); R(ctx, cx + 1, top - 8 + wv, 7, 4, 'r'); R(ctx, cx + 1, top - 8 + wv, 7, 1, 'J'); R(ctx, cx + 6, top - 6 + wv, 2, 1, 'd');     // прапорець на гребені
  }
}
// Спільне для будівельних машин: конічний барабан зі спіральними смугами вздовж осі (x0,y0)→(x1,y1); phase зсуває смуги, і барабан «крутиться»
function drawDrum(g, x0, y0, x1, y1, r0, r1, phase, cA, cB, cL) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, cells = new Map(), R0 = Math.max(r0, r1) + 2;
  for (let yy = Math.floor(Math.min(y0, y1) - R0); yy <= Math.ceil(Math.max(y0, y1) + R0); yy++) for (let xx = Math.floor(Math.min(x0, x1) - R0); xx <= Math.ceil(Math.max(x0, x1) + R0); xx++) {
    const vx = xx - x0, vy = yy - y0, u = (vx * ux + vy * uy) / len, v = -vx * uy + vy * ux;
    if (u < 0 || u > 1) continue;
    const prof = (u < 0.18 ? 0.55 + 0.45 * (u / 0.18) : (u > 0.82 ? 0.55 + 0.45 * ((1 - u) / 0.18) : 1)) * (r0 + (r1 - r0) * u);
    if (Math.abs(v) > prof) continue;
    const stripe = Math.floor((u * len * 0.9 + v * 0.55 + phase) / 3.2) % 2 === 0;
    let c = stripe ? cA : cB; if (v < -prof * 0.5) c = stripe ? cL : cA; if (v > prof * 0.6) c = stripe ? cB : 'e';
    cells.set(xx + ',' + yy, c);
  }
  cells.forEach((c, k) => { const [xx, yy] = k.split(',').map(Number); R(g, xx, yy, 1, 1, c); });
  cells.forEach((c, k) => { const [xx, yy] = k.split(',').map(Number); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([p, q]) => { if (!cells.has((xx + p) + ',' + (yy + q))) R(g, xx + p, yy + q, 1, 1, 'd'); }); });
}
function drawTruckWheel(g, wx, wy, r, ang) {
  disc(g, wx, wy, r + 1, 'd'); disc(g, wx, wy, r, 'k'); disc(g, wx, wy, Math.max(1, r - 2), 'E');
  R(g, wx + Math.round(Math.cos(ang) * (r - 2)), wy + Math.round(Math.sin(ang) * (r - 2)), 1, 1, 'e'); R(g, wx, wy, 1, 1, 'e');
}
// Вантажівка-бетономішалка 52×30, дивиться праворуч: x — лівий край, y — земля під колесами. moving — їде (коливається, димить), pour — виливає бетон із жолоба. Барабан крутиться завжди
function drawMixerTruck(x, y, t, moving, pour) {
  const bob = moving ? Math.floor(t * 14) % 2 : 0, by = y - bob, ph = animOn() ? t * 9 : 0, wa = t * (moving ? 14 : 0);
  ctx.globalAlpha = 0.25; R(ctx, x + 2, y, 50, 2, 'd'); ctx.globalAlpha = 1;
  R(ctx, x, by - 10, 52, 4, 'd'); R(ctx, x + 1, by - 9, 50, 2, 'e');                                                                 // рама
  R(ctx, x + 36, by - 25, 16, 15, 'd'); R(ctx, x + 37, by - 24, 14, 13, 'h'); R(ctx, x + 37, by - 24, 14, 2, 'y');                    // кабіна
  R(ctx, x + 40, by - 22, 10, 8, 'd'); R(ctx, x + 41, by - 21, 8, 6, 'S'); R(ctx, x + 41, by - 21, 3, 1, 'w');                         // вікно
  R(ctx, x + 47, by - 17, 3, 3, 'B'); R(ctx, x + 47, by - 18, 3, 2, 'y'); R(ctx, x + 48, by - 16, 1, 1, 'k');                         // Бодя-водій у касці
  R(ctx, x + 50, by - 14, 3, 3, 'y'); R(ctx, x + 38, by - 12, 14, 2, 'd');                                                            // фара, бампер
  drawDrum(ctx, x + 3, by - 26, x + 35, by - 16, 10, 8.5, ph, 'o', 'w', 'y');
  R(ctx, x + 16, by - 11, 12, 2, 'r'); R(ctx, x + 16, by - 11, 12, 1, 'J');
  R(ctx, x - 1, by - 14, 8, 3, 'd'); R(ctx, x, by - 13, 6, 1, 'e'); R(ctx, x - 3, by - 12, 2, 6, 'd'); R(ctx, x - 2, by - 11, 1, 4, 'e');   // жолоб
  [x + 9, x + 24, x + 42].forEach((wx, i) => drawTruckWheel(ctx, wx, y - 4, 4, wa + i));
  if (pour) { for (let k = 0; k < 8; k++) R(ctx, x - 3 + (k % 2 ? 0 : 1), by - 7 + k * 2, 1 + (k % 2), 2, (Math.floor(t * 12) + k) % 3 ? 'E' : 'e'); }       // струмінь бетону
  if (moving || Math.floor(t * 2) % 2) { ctx.globalAlpha = 0.45; disc(ctx, x + 46, by - 28 - (Math.floor(t * 6) % 3), 2, 'E'); disc(ctx, x + 48, by - 32 - (Math.floor(t * 4) % 4), 2, 'W'); ctx.globalAlpha = 1; }   // вихлоп
}
// Бетононасос 52 (від заду x=0 до перед x=52); dir=1 дивиться праворуч, dir=-1 — ліворуч (x — задня межа). ext 0…1 — стріла складена…розкладена; pump — качає бетон; повертає кінець шланга (x, y) у світових координатах
const PUMP_L = [20, 30, 13];
function pumpBoom(ext, t, pump) {
  const sw = pump ? Math.sin(t * 2.2) * 0.07 : 0;
  const a1 = (-3.1 + (3.1 - 0.87) * ext) + sw, a2 = (-3.0 + (3.0 - 0.17) * ext) + sw * 0.8, a3 = (-2.6 + (2.6 + 1.4) * ext) + sw;      // складено — вздовж даху назад, розкладено — вперед і вниз
  const p0 = [30, -26], p1 = [p0[0] + Math.cos(a1) * PUMP_L[0], p0[1] + Math.sin(a1) * PUMP_L[0]], p2 = [p1[0] + Math.cos(a2) * PUMP_L[1], p1[1] + Math.sin(a2) * PUMP_L[1]], p3 = [p2[0] + Math.cos(a3) * PUMP_L[2], p2[1] + Math.sin(a3) * PUMP_L[2]];
  return [p0, p1, p2, p3].map(p => [Math.round(p[0]), Math.round(p[1])]);       // цілі координати: lineG (Брезенхем) на дробових зависає
}
function drawPumpTruck(x, y, t, moving, dir, ext, pump, groundY) {
  const bob = moving ? Math.floor(t * 14) % 2 : 0, by = y - bob, wa = t * (moving ? 14 : 0) * -dir;
  ctx.save(); ctx.translate(x, 0); ctx.scale(dir, 1);
  ctx.globalAlpha = 0.25; R(ctx, 2, y, 50, 2, 'd'); ctx.globalAlpha = 1;
  R(ctx, 0, by - 10, 52, 4, 'd'); R(ctx, 1, by - 9, 50, 2, 'e');
  R(ctx, 37, by - 23, 15, 13, 'd'); R(ctx, 38, by - 22, 13, 11, 'h'); R(ctx, 38, by - 22, 13, 2, 'y'); R(ctx, 41, by - 20, 9, 7, 'd'); R(ctx, 42, by - 19, 7, 5, 'S'); R(ctx, 42, by - 19, 3, 1, 'w'); R(ctx, 51, by - 13, 2, 3, 'y');   // кабіна
  R(ctx, 3, by - 16, 31, 7, 'd'); R(ctx, 4, by - 15, 29, 5, 'o'); R(ctx, 4, by - 15, 29, 1, 'y'); R(ctx, 4, by - 12, 29, 1, 'r');                  // корпус насоса
  R(ctx, 3, by - 22, 11, 6, 'd'); R(ctx, 4, by - 21, 9, 4, 'e'); R(ctx, 4, by - 21, 9, 1, 'E');                                                  // бункер
  const sp = animOn() ? Math.floor(t * 8) % 4 : 0; R(ctx, 5 + sp, by - 20, 1, 3, 'd'); R(ctx, 11 - sp, by - 20, 1, 3, 'd'); R(ctx, 8, by - 19, 1, 2, 'k');   // мішалка в бункері крутиться
  for (let k = 0; k < 4; k++) R(ctx, 5 + k * 2, by - 22, 1, 1, (Math.floor(t * 6) + k) % 2 ? 'E' : 'e');                                          // бетон у бункері «булькає»
  R(ctx, 30, by - 10, 18, 2, 'd');
  const B = pumpBoom(ext, t, pump);
  for (let i = 0; i < 3; i++) { const [a, b2] = [B[i], B[i + 1]]; lineG(ctx, a[0], by + a[1], b2[0], by + b2[1], 'd'); lineG(ctx, a[0], by + a[1] - 1, b2[0], by + b2[1] - 1, 'd'); lineG(ctx, a[0], by + a[1] + 1, b2[0], by + b2[1] + 1, 'd'); lineG(ctx, a[0], by + a[1], b2[0], by + b2[1], 'o'); }
  B.slice(0, 3).forEach(p => { disc(ctx, Math.round(p[0]), Math.round(by + p[1]), 2, 'd'); R(ctx, Math.round(p[0]), Math.round(by + p[1]), 1, 1, 'y'); });
  const tip = B[3], tx = Math.round(tip[0]), ty = Math.round(by + tip[1]);
  R(ctx, tx - 1, ty, 3, 5, 'd'); R(ctx, tx, ty, 1, 4, 'e');                                                                                          // кінець шланга
  if (pump && groundY !== undefined) { for (let k = 0; ty + 5 + k * 2 < groundY; k++) R(ctx, tx - 1 + (k % 2 ? 0 : 1), ty + 5 + k * 2, 1 + (k % 2), 2, (Math.floor(t * 12) + k) % 3 ? 'E' : 'e'); }   // струмінь бетону
  [8, 22, 41].forEach((wx, i) => drawTruckWheel(ctx, wx, y - 4, 4, wa + i));
  if (moving || Math.floor(t * 2) % 2) { ctx.globalAlpha = 0.45; disc(ctx, 47, by - 27 - (Math.floor(t * 6) % 3), 2, 'E'); ctx.globalAlpha = 1; }
  ctx.restore();
  return { tipX: x + dir * tip[0], tipY: ty };
}
function drawBuildExtras(b, p) {
  const gy = LAYOUT.curbY + 12, prog = Math.max(0, Math.min(1, (p - BUILD_A) / (BUILD_C - BUILD_A)));
  const siteX = shop.x + shop.w * 0.24, signX = shop.x + shop.w - 16, bx0 = Math.round(b.parkX - 24);
  if (b.pumpX !== undefined && p > 0.01) drawPumpTruck(Math.round(b.pumpX), LAYOUT.curbY + 38, b.t, !!b.pumpMoving, -1, b.pumpExt || 0, !!b.pumping, shop.y + 14);
  if (b.truckX !== undefined && p > 0.01) drawMixerTruck(Math.round(b.truckX), LAYOUT.curbY + 34, b.t, !!b.truckMoving, !!b.pour);
  if (p > BUILD_A - 0.02 && p < BUILD_C + 0.1) {
    const fill = Math.max(0, Math.min(1, (p - BUILD_A) / 0.25)) * (1 - prog * 0.5);                                              // тачка з бетоном: наповнюється, потім витрачається
    R(ctx, bx0, gy - 5, 14, 5, 'd'); R(ctx, bx0 + 1, gy - 4, 12, 3, 'e'); R(ctx, bx0 + 1, gy - 5 - Math.round(fill * 3), 12, 1 + Math.round(fill * 3), 'E'); R(ctx, bx0 + 14, gy - 4, 6, 1, 'd'); R(ctx, bx0 + 3, gy - 1, 3, 3, 'd'); R(ctx, bx0 + 4, gy, 1, 1, 'e');
    const left = Math.round(12 * (1 - prog));                                                                                  // купа цегли біля шатра меншає
    for (let i = 0; i < left; i++) { const bx = Math.round(siteX - 22 + (i % 4) * 5), by = gy - 3 - Math.floor(i / 4) * 3; R(ctx, bx, by, 5, 3, 'd'); R(ctx, bx + 1, by, 3, 2, i % 2 ? 'r' : 't'); R(ctx, bx + 1, by, 3, 1, 'o'); }
    R(ctx, Math.round(siteX + 6), gy - 3, 15, 2, 'd'); R(ctx, Math.round(siteX + 6), gy - 3, 15, 1, 'c'); R(ctx, Math.round(siteX + 7), gy - 6, 13, 2, 'd'); R(ctx, Math.round(siteX + 7), gy - 6, 13, 1, 'l');     // дошки
    R(ctx, signX, gy - 12, 2, 12, 'd'); R(ctx, signX - 11, gy - 21, 24, 10, 'd'); R(ctx, signX - 10, gy - 20, 22, 8, 'w');   // табло прогресу
    R(ctx, signX - 8, gy - 18, 18, 4, 'd'); R(ctx, signX - 7, gy - 17, Math.round(16 * prog), 2, prog > 0.9 ? 'y' : 'g'); R(ctx, signX - 9, gy - 13, 3, 1, 'r');
  }
  if (p >= BUILD_C && (p - BUILD_C) / (1 - BUILD_C) >= 0.2) {                                // гірлянда з прапорців і стрічка на відкритті (коли полотно знято)
    const q = (p - BUILD_C) / (1 - BUILD_C), cols = ['r', 'y', 'g', 'n', 'p', 'o'];
    for (let x = 0; x < shop.w; x++) { const sag = Math.round(5 * Math.sin(x / shop.w * Math.PI)); R(ctx, shop.x + x, shop.y + 20 + sag, 1, 1, 'd'); if (x % 9 === 4) { const c = cols[Math.floor(x / 9) % cols.length]; R(ctx, shop.x + x - 1, shop.y + 21 + sag, 3, 2, c); R(ctx, shop.x + x, shop.y + 23 + sag, 1, 1, c); } }
    const dr = doorWorld(), hw = (shop.door.w >> 1) + 9, ry = shop.y + shop.door.y + 14;
    R(ctx, dr.cx - hw - 1, ry - 4, 2, 16, 'd'); R(ctx, dr.cx + hw - 1, ry - 4, 2, 16, 'd'); R(ctx, dr.cx - hw - 2, ry - 5, 4, 2, 'h'); R(ctx, dr.cx + hw - 2, ry - 5, 4, 2, 'h');
    if (q < 0.5) { R(ctx, dr.cx - hw, ry, hw * 2, 2, 'r'); R(ctx, dr.cx - hw, ry, hw * 2, 1, 'J'); R(ctx, dr.cx - 3, ry - 2, 7, 6, 'r'); R(ctx, dr.cx - 1, ry - 1, 3, 3, 'y'); }
    else if (q < 0.85) {                                                                     // розрізана стрічка падає двома половинками
      const f = (q - 0.5) / 0.35;
      for (let i = 0; i < hw - 1; i++) { const d = i / hw; R(ctx, dr.cx - hw + i, ry + Math.round(f * (0.4 + d) * 12), 1, 2, 'r'); R(ctx, dr.cx + hw - 1 - i, ry + Math.round(f * (0.4 + d) * 12), 1, 2, 'r'); }
    }
  }
}
function drawBeaverBuilder(b, p) {
  const name = teamSprite('bodya'), c = getSpriteCanvas(name), w = c.width, h = c.height, fl = b.bdir < 0;
  let dy = 0;
  if (p >= BUILD_C) dy = -Math.abs(Math.sin(b.t * 9)) * 7;
  else if (b.run) dy = Math.floor(b.t * 12) % 2 ? -1 : 0;
  const x = Math.round(b.bx), foot = Math.round(b.by + dy), top = foot - h;
  ctx.globalAlpha = 0.25; R(ctx, x - 6, Math.round(b.by), 13, 1, 'd'); ctx.globalAlpha = 1;
  drawSprite(ctx, name, x - (w >> 1), top, { flip: fl });
  R(ctx, x - 5, top - 1, 11, 3, 'h'); R(ctx, x - 3, top - 2, 7, 1, 'h'); R(ctx, x - 3, top - 1, 3, 1, 'y'); R(ctx, x - 6, top + 1, 13, 1, 'o');          // жовта каска
  const hd = fl ? -1 : 1, hx = x + hd * 7, hy = foot - Math.round(h * 0.5);
  if (p >= BUILD_C) {                                                                                                                              // ура: лапки вгору
    R(ctx, x - 8, hy - 7, 2, 5, 'B'); R(ctx, x + 7, hy - 7, 2, 5, 'B'); R(ctx, x - 8, hy - 8, 2, 1, 'O'); R(ctx, x + 7, hy - 8, 2, 1, 'O');
  } else if (b.carry) {                                                                                                                            // несе відро бетону й цеглину
    R(ctx, hx - 2, hy - 2, 7, 6, 'd'); R(ctx, hx - 1, hy - 1, 5, 4, 'E'); R(ctx, hx - 1, hy - 2, 5, 1, 'e'); R(ctx, hx - 3, hy - 4, 2, 5, 'd'); R(ctx, hx + 4, hy - 4, 2, 5, 'd');
    R(ctx, x - 3, top - 6, 7, 3, 'd'); R(ctx, x - 2, top - 6, 5, 2, 'r'); R(ctx, x - 2, top - 6, 5, 1, 'o');
  } else if (b.build) {                                                                                                                            // мастерок і молоток
    const sw = Math.floor(b.t * 10) % 3;
    if (sw === 0) { R(ctx, hx, hy - 8, 1, 9, 'b'); R(ctx, hx - 2, hy - 10, 5, 3, 'e'); R(ctx, hx - 2, hy - 10, 5, 1, 'E'); }
    else if (sw === 1) { R(ctx, hx, hy - 4, 1, 6, 'b'); R(ctx, hx - 2 + hd * 2, hy - 6, 5, 3, 'e'); }
    else { R(ctx, hx + (hd > 0 ? 0 : -6), hy, 7, 1, 'b'); R(ctx, hx + hd * 6 - 1, hy - 2, 3, 5, 'e'); }
  }
}
function renderBuild() {
  const b = build, p = b.t / b.dur, o = b.old;
  if (p < BUILD_A) drawCanvasSprite(ctx, o.canvas, o.x, o.y, {});                // старий магазин лишається, поки його не накрило шатро
  if (p >= BUILD_C) ctx.drawImage(shop.canvas, shop.x, shop.y);                  // новий магазин показується лише коли шатро знімається: ніяких «поверхів, що вкладаються»
  // шатро: падає зверху на старий магазин, розтягується на новий розмір, а наприкінці знімається знизу вгору
  const base = shop.y + shop.h, q = p >= BUILD_C ? (p - BUILD_C) / (1 - BUILD_C) : 0;
  const wk = smooth01((p - 0.1) / 0.16), prog = smooth01((p - BUILD_A) / (BUILD_C - BUILD_A));
  const tx0 = Math.round(o.x - 3 + (shop.x - 3 - (o.x - 3)) * wk), tx1 = Math.round(o.x + o.w + 3 + (shop.x + shop.w + 3 - (o.x + o.w + 3)) * wk);
  const H = (p < BUILD_A ? o.h : Math.round(o.h + (shop.h - o.h) * prog)) + 2;
  const fall = p < 0.12 ? (1 - Math.pow(p / 0.12, 2)) * (H + 70) : 0;
  const tentLift = q > 0 ? smooth01(q / 0.3) * (H + 6) : 0;
  const bounce = p >= 0.12 && p < 0.2 ? Math.round(Math.sin((p - 0.12) / 0.08 * Math.PI) * 2) : 0;
  if (p > 0 && tentLift < H + 4) { ctx.save(); ctx.translate(0, -Math.round(fall) + bounce); drawBuildTent(b, tx0, tx1, base - H, base, tentLift, b.t); ctx.restore(); }
  drawBuildExtras(b, p);
  drawBeaverBuilder(b, p);
}

