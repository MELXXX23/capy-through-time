//#part 220_d_night_garlands_halloween.js
// Небо цілком (координати полотна, до зсуву сцени): шар неба, сутінки, зорі, сонце й місяць
function drawSkyScreen(time) {
  ctx.drawImage(skyLayer, 0, 0);
  const W = view.w, hor = view.offY + 118;
  if (sky.night > 0.01) { ctx.globalAlpha = sky.night * 0.72; ctx.fillStyle = '#141a40'; ctx.fillRect(0, 0, W, view.h); }
  if (sky.dusk > 0.01) {
    ctx.fillStyle = '#ff8a4a';
    [[70, 0.07], [45, 0.07], [22, 0.09]].forEach(a => { ctx.globalAlpha = sky.dusk * a[1]; ctx.fillRect(0, hor - a[0], W, a[0] + 8); });
  }
  ctx.globalAlpha = 1;
  if (sky.night > 0.05) {
    const nt = Math.min(1, sky.night * 1.1);
    skyDust.forEach(d => { ctx.globalAlpha = nt * d.a; R(ctx, d.x, d.y, 1, 1, d.c); });
    skyStars.forEach(s => {
      const tw = animOn() ? 0.55 + 0.45 * Math.sin(time * s.sp + s.ph) : 1;
      if (s.t === 0) { ctx.globalAlpha = nt * 0.5 * tw; R(ctx, s.x, s.y, 1, 1, 'w'); }
      else if (s.t === 1) { ctx.globalAlpha = nt * 0.85 * tw; R(ctx, s.x, s.y, 1, 1, s.c); }
      else if (s.t === 2) { ctx.globalAlpha = nt * tw; R(ctx, s.x, s.y, 1, 1, 'w'); ctx.globalAlpha = nt * tw * 0.55; R(ctx, s.x - 1, s.y, 3, 1, s.c); R(ctx, s.x, s.y - 1, 1, 3, s.c); }
      else { ctx.globalAlpha = nt * tw; R(ctx, s.x, s.y, 2, 2, 'w'); ctx.globalAlpha = nt * tw * 0.6; R(ctx, s.x - 2, s.y, 6, 1, s.c); R(ctx, s.x + 0, s.y - 2, 1, 6, s.c); R(ctx, s.x + 1, s.y - 2, 1, 6, s.c); }
    });
    // падаюча зірка: раз на кілька секунд вночі
    if (animOn() && sky.night > 0.6) {
      if (shootingStar) {
        const q = shootingStar;
        for (let k = 0; k < 9; k++) { ctx.globalAlpha = nt * (1 - k / 9) * Math.min(1, (q.life - q.t) * 3); R(ctx, Math.round(q.x - q.vx * 0.012 * k), Math.round(q.y - q.vy * 0.012 * k), 1, 1, k < 2 ? 'w' : 'S'); }
      }
    }
    ctx.globalAlpha = 1;
  }
  const EA = ARCH[currentEpoch().id], arcRx = EA && EA.sunRx ? EA.sunRx(W) : W * 0.44, front = () => { if (EA && EA.skyFront) EA.skyFront(ctx); };      // епоха може малювати гору поверх сонця й місяця
  if (theme.season === 'halloween') { drawSkyBody('hmoon', Math.round(viewCrop.x + viewCrop.w * 0.2 - (viewCrop.x - (view.w - viewCrop.w) / 2) * 0.1), Math.max(32, hor - 96)); front(); return; }
  // сонце вдень, місяць уночі: рухаються дугою зліва направо
  const a = dayNightOn() ? (state.dayPhase - 0.25) * Math.PI * 2 : Math.PI * 0.42;
  const arcH = Math.min(hor - 26, 190), rx = arcRx;
  if (Math.sin(a) > -0.25) drawSkyBody('sun', W / 2 - Math.cos(a) * rx, hor - Math.sin(a) * arcH);
  if (dayNightOn() && -Math.sin(a) > -0.25) drawSkyBody('moon', W / 2 + Math.cos(a) * rx, hor + Math.sin(a) * arcH);
  front();
}
// Затемнення всієї сцени вночі й тепле світло в сутінки (координати «ядра»)
function drawNightShade() {
  if (sky.night > 0.01) { ctx.globalAlpha = sky.night * 0.4; ctx.fillStyle = '#121a48'; ctx.fillRect(worldL(), -view.offY, view.w, view.h); }
  if (sky.dusk > 0.01) { ctx.globalAlpha = sky.dusk * 0.1; ctx.fillStyle = '#ff8040'; ctx.fillRect(worldL(), -view.offY, view.w, view.h); }
  if (weather.rain > 0.02) { ctx.globalAlpha = 0.2 * weather.rain; ctx.fillStyle = '#3b4d6b'; ctx.fillRect(worldL(), -view.offY, view.w, view.h); ctx.globalAlpha = 1; }   // під час дощу темніше
  const mood = SEASON_MOOD[theme.season];                 // літо тепле й жарке, осінь золота, зима прохолодна
  if (mood && sky.night < 0.7) { ctx.globalAlpha = mood[1] * (1 - sky.night); ctx.fillStyle = mood[0]; ctx.fillRect(worldL(), -view.offY, view.w, view.h); }
  ctx.globalAlpha = 1;
}
const SEASON_MOOD = { summer: ['#ffc060', 0.08], autumn: ['#ff9a50', 0.06], winter: ['#cfe6ff', 0.09] };

// Гірлянди між ліхтарями вздовж вулиці: удень тьмяні, вночі яскраво світяться кольоровими вогниками
const BULB_SETS = [['y', 'h', 'p', 'm', 's'], ['p', 'T', 'w', 'y', 'q'], ['f', 'y', 'j', 'w', 'J'], ['v', 'T', 'f', 'y', 'w'], ['a', 'S', 'w', 's', 'T'], ['g', 'm', 'y', 'h', 'w'], ['S', 'w', 'u', 's', 'y'], ['f', 'T', 'v', 'f', 'T']];
function bulbColors() { return (theme.holiday && theme.lights && theme.lights.length) ? theme.lights : BULB_SETS[viewEpoch() % BULB_SETS.length]; }
function awningBulbs(fn) {
  if (build || !shop) return;
  const cols = bulbColors(), tw = Math.floor(animClock * 1.5), y0 = shop.y + shop.h - 39 + 13;
  const sc = getShopScale(), dw = Math.max(1, Math.round(shop.w * sc.sx)), dh = Math.max(1, Math.round(shop.h * sc.sy));
  const kx = dw / shop.w, ky = dh / shop.h, ox = Math.round(shop.x + (shop.w - dw) / 2), oy = Math.round(shop.y + (shop.h - dh));       // лампочки навісу їдуть разом із магазином при тапі
  for (let x = shop.x + 3; x < shop.x + shop.w - 3; x += 6) {
    const sag = Math.round(2 * Math.sin(((x - shop.x) % 12) / 12 * Math.PI));
    fn(Math.round(ox + (x - shop.x) * kx), Math.round(oy + (y0 + sag - shop.y) * ky), cols[(Math.floor((x - shop.x) / 6) + tw) % cols.length]);
  }
}
function garlandSpans() {
  const xs = lampXs.slice().sort((a, b) => a - b), out = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    const a = xs[i] + 1, b = xs[i + 1] + 1;
    if (shop && a < shop.x + shop.w && b > shop.x) continue;          // між ліхтарями біля магазину гірлянда закрила б фасад
    out.push([a, b]);
  }
  return out;
}
function garlandY(a, b, x) { return 92 + Math.round(6 * Math.sin((x - a) / (b - a) * Math.PI)); }
function forEachBulb(fn) {
  const cols = bulbColors(), tw = Math.floor(animClock * 1.5);
  garlandSpans().forEach(([a, b]) => {
    for (let k = 4; k < b - a - 2; k += 7) { const x = a + k; fn(x, garlandY(a, b, x) + 1, cols[(Math.floor(k / 7) + tw) % cols.length]); }
  });
}
function drawStreetGarlands() {
  garlandSpans().forEach(([a, b]) => { for (let x = a; x <= b; x++) R(ctx, x, garlandY(a, b, x), 1, 1, 'd'); });
  const day = 1 - Math.min(1, sky.lamp * 1.4);                           // удень — тьмяні лампочки
  ctx.globalAlpha = 0.55 + 0.45 * (1 - day);
  forEachBulb((x, y, c) => R(ctx, x, y, 2, 2, c));
  awningBulbs((x, y, c) => R(ctx, x, y, 2, 2, c));
  ctx.globalAlpha = 1;
}
function drawStreetGarlandGlow(L) {
  awningBulbs((x, y, c) => { ctx.globalAlpha = L * 0.16; disc(ctx, x, y, 6, c); ctx.globalAlpha = L; R(ctx, x, y, 2, 2, c); });
  forEachBulb((x, y, c) => {
    ctx.globalAlpha = L * 0.13; disc(ctx, x, y, 8, c);
    ctx.globalAlpha = L * 0.3; disc(ctx, x, y, 4, c);
    ctx.globalAlpha = L; R(ctx, x - 1, y - 1, 3, 3, c); R(ctx, x, y, 1, 1, 'w');
  });
  ctx.globalAlpha = 1;
}
const litTmp = document.createElement('canvas');
function drawShopLitMasked(sc, alpha) {                         // світло магазину малюється окремо, а силует Капі з нього вирізається — підсвітка її не перекриває
  const pad = 12, w = shop.w + pad * 2, h = shop.h + pad * 2;
  if (litTmp.width !== w || litTmp.height !== h) { litTmp.width = w; litTmp.height = h; }
  const g = litTmp.getContext('2d'); g.imageSmoothingEnabled = false;
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, w, h);
  drawCanvasSprite(g, shop.lit, pad, pad, { sx: sc.sx, sy: sc.sy, alpha });
  const cp = LAYOUT.capy, bx = cp.x - shop.x + pad, by = cp.footY - 24 - shop.y + pad;
  if (bx < w && bx + 32 > 0 && by < h && by + 26 > 0) {
    g.globalCompositeOperation = 'destination-out';
    g.save(); g.translate(bx + 14, by + 24); g.scale(CAPY_K, CAPY_K); g.translate(-(bx + 14), -(by + 24));
    drawSprite(g, capySprite(), bx, by, { flip: cp.flip, sy: 1 + 0.045 * (Math.sin(animClock * 2.2) + 1) / 2 });
    g.restore();
    g.globalCompositeOperation = 'source-over';
  }
  ctx.drawImage(litTmp, shop.x - pad, shop.y - pad);
}
// Світло поверх затемнення: вікна будинків і магазину, ліхтарі з ореолом і плямою на тротуарі
function drawNightLights() {
  const L = sky.lamp;
  ui.shopOverlay.classList.toggle('lit', L > 0.3);                  // назва магазину теж світиться (CSS)
  if (L <= 0.02) return;
  ctx.globalAlpha = L * 0.9;
  if (houseLit) ctx.drawImage(houseLit, -view.offX, -view.offY);
  ctx.globalAlpha = 1;
  if (!build && shop.lit) {
    const sc = getShopScale();
    drawShopLitMasked(sc, Math.min(1, L * 0.9));
    withShopScale(sc, () => {
    const rs = shop.roofSign, pulse = 0.85 + 0.15 * Math.sin(animClock * 2.2);        // м'яке сяйво навколо вивісок
    if (rs) {                                                   // «CAPYTAP» світиться іншим кольором, ніж назва магазину
      const gc = ROOF_GLOW[viewEpoch() % ROOF_GLOW.length];
      [[10, 0.07], [7, 0.1], [4, 0.14], [2, 0.2]].forEach(([pad, al]) => { ctx.globalAlpha = L * al * pulse; R(ctx, shop.x + rs.x - pad, shop.y + rs.y - pad, rs.w + pad * 2, rs.h + pad * 2, gc); });
      ctx.globalAlpha = L * 0.14; R(ctx, shop.x + rs.x + 1, shop.y + rs.y + 1, rs.w - 2, rs.h - 2, gc);
      ctx.globalAlpha = L * 0.55 * pulse; wordBig(ctx, shop.x + rs.tx - 1, shop.y + rs.ty, 'CAPYTAP', gc); wordBig(ctx, shop.x + rs.tx + 1, shop.y + rs.ty, 'CAPYTAP', gc); wordBig(ctx, shop.x + rs.tx, shop.y + rs.ty - 1, 'CAPYTAP', gc); wordBig(ctx, shop.x + rs.tx, shop.y + rs.ty + 1, 'CAPYTAP', gc);
      ctx.globalAlpha = L; wordBig(ctx, shop.x + rs.tx, shop.y + rs.ty, 'CAPYTAP', 'w');
    }
    const sg = shop.sign; [[5, 0.06], [2, 0.1]].forEach(([pad, al]) => { ctx.globalAlpha = L * al; R(ctx, shop.x + sg.x - pad, shop.y + sg.y - pad, sg.w + pad * 2, sg.h + pad * 2, 'y'); });
    ctx.globalAlpha = 1;
    });
  }
  lampXs.forEach(x => {
    const cp = LAYOUT.capy, nearC = cp ? Math.max(0.3, Math.min(1, (Math.abs(x - cp.x) - 6) / 44)) : 1;       // біля Капі ореол слабшає: світло не засвічує саму Капі
    ctx.globalAlpha = L * 0.07 * nearC;
    for (let i = 0; i < 6; i++) { const hw = 30 - i * 4; R(ctx, x + 1 - hw, 126 + i * 4, hw * 2, 4, 'y'); }   // пляма світла на землі (слабка: вона лежить поверх звірят і Капі)
    ctx.globalAlpha = L * 0.06 * nearC; disc(ctx, x + 1, 90, 28, 'y');
    ctx.globalAlpha = L * 0.13 * nearC; disc(ctx, x + 1, 90, 18, 'y');
    ctx.globalAlpha = L * 0.24 * (0.5 + 0.5 * nearC); disc(ctx, x + 1, 90, 11, 'y');
    ctx.globalAlpha = L;
    R(ctx, x - 2, 88, 6, 5, 'y'); R(ctx, x - 1, 89, 2, 2, 'w');
  });
  if (!build && shop && L > 0.05) {                                  // теплий ореол навколо магазину й торгового центру: світло виливається на вулицю
    ctx.save();
    const big = shop.level >= 4 ? 1.35 : 1;                              // прямокутний ореол по контуру прибрано: він давав різкі смуги світла на сусідніх будинках
    ctx.translate(shop.x + shop.w / 2, LAYOUT.curbY + 4); ctx.scale(1, 0.3); ctx.fillStyle = '#ffc060';                                  // м'яка овальна пляма світла на бруківці перед входом
    for (let i = 0; i < 9; i++) { ctx.globalAlpha = L * 0.022 * big; ctx.beginPath(); ctx.arc(0, 0, shop.w * (0.72 - i * 0.07), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  if (!build && shop) {                                              // світло з дверей і вітрин падає на тротуар
    const ws = getShopScale(), sw = shop.w * ws.sx, cx = shop.x + (shop.w - sw) / 2 + (shop.door.x + shop.door.w / 2) * ws.sx;
    for (let i = 0; i < 8; i++) { ctx.globalAlpha = L * 0.12; R(ctx, Math.round(cx - 15 - i * 4), LAYOUT.curbY + i * 4, 30 + i * 8, 4, 'y'); }
    ctx.globalAlpha = L * 0.1; R(ctx, Math.round(shop.x + (shop.w - sw) / 2) - 4, LAYOUT.curbY, Math.round(sw) + 8, 9, 'y');
  }
  drawStreetGarlandGlow(L);
  if (mail.state !== 'idle' || state.events.mailPending) {            // фари поштової машини й підсвітка поштомата
    const bx = mailBoxX(), by = mailRoadY() - 16;
    ctx.globalAlpha = L * (state.events.mailPending ? 0.18 + 0.1 * Math.sin(animClock * 5) : 0.1); disc(ctx, bx, by, 14, 'T');
    if (mail.state === 'arriving' || mail.state === 'leaving') { ctx.globalAlpha = L * 0.22; disc(ctx, Math.round(mail.x) - 18, mailRoadY() - 6, 9, 'y'); ctx.globalAlpha = L * 0.1; R(ctx, Math.round(mail.x) - 44, mailRoadY() - 8, 26, 5, 'y'); }
  }
  ctx.globalAlpha = 1;
  drawEpochGlow(animClock);
}

/* ---------- Хелловін: привиди; в усі інші часи — герої епох (сова, їжак, броненосець…), яких так само ловлять тапом ---------- */
let ghostHunt = null;            // триває полювання: { t, dur, caught, total, ghosts, crt } (crt — номер епохи героя; -1 — привиди на Хелловін)
let nextGhostAt = 0;             // коли почнеться наступне полювання (мс); 0 — ще не заплановано
const windowGhosts = [];         // привиди, що на мить блимають у вікнах будинків
let windowGhostTimer = 3;

// Герої епох: кожен рухається по-своєму (move) — летить хвилею, котиться, ходить «місячною ходою», шмигає по сітці, глючить, маскується, пливе в невагомості, стрибає
const EPOCH_CREATURES = [
  { icon: '🦉', move: 'glide' }, { icon: '🦔', move: 'roll' }, { icon: '🪩', move: 'moonwalk' }, { icon: '🐹', move: 'dash' },
  { icon: '🐛', move: 'glitch' }, { icon: '🦎', move: 'camo' }, { icon: '🪐', move: 'float' }, { icon: '🐱', move: 'leap' }
];
function makeCreatureCanvas(i) {                              // 18×16, дивиться вправо; малюється кодом
  const c = document.createElement('canvas'); c.width = 18; c.height = 16;
  const g = c.getContext('2d');
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const inD = (cx, cy, r) => (x, y) => (x + 0.5 - cx) * (x + 0.5 - cx) + (y + 0.5 - cy) * (y + 0.5 - cy) <= r * r;
  const inE = (cx, cy, rx, ry) => (x, y) => ((x + 0.5 - cx) / rx) * ((x + 0.5 - cx) / rx) + ((y + 0.5 - cy) / ry) * ((y + 0.5 - cy) / ry) <= 1;
  const fill = (test, col) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 18; x++) if (test(x, y)) P(x, y, 1, 1, col); };
  const D = (cx, cy, r, col) => fill(inD(cx, cy, r), col);
  if (i === 0) {                                              // Сова Мазок: бордовий берет, кремовий живіт, великі очі
    D(9, 9, 5.2, '#a8703f'); P(3, 8, 3, 5, '#7a4f35'); D(10, 11, 3, '#f0dcb4');
    D(9, 6, 4.3, '#a8703f'); P(5, 2, 2, 3, '#7a4f35'); P(12, 2, 2, 3, '#7a4f35');
    D(7.5, 6, 1.7, '#ffffff'); D(11.5, 6, 1.7, '#ffffff'); P(8, 6, 1, 2, '#111111'); P(12, 6, 1, 2, '#111111');
    P(9, 8, 2, 2, '#f2b84b'); P(6, 12, 1, 1, '#c8a878'); P(8, 13, 1, 1, '#c8a878');
    P(5, 2, 9, 2, '#8a2a3a'); P(6, 1, 7, 1, '#8a2a3a'); P(9, 0, 1, 1, '#c4553d'); P(11, 3, 2, 1, '#f2b84b');
    P(7, 14, 2, 1, '#f2b84b'); P(11, 14, 2, 1, '#f2b84b');
  } else if (i === 1) {                                       // Їжак Платівка: колючки-платівка з червоною наліпкою
    for (let a = 10; a < 360; a += 17) { const r = a * Math.PI / 180; P(Math.round(8 + Math.cos(r) * 6.8), Math.round(8.5 - Math.sin(r) * 6.8), 1, 1, '#2a1d1a'); }
    D(8, 8.5, 6, '#2a1d1a'); D(8, 8.5, 5, '#3c3c46'); D(8, 8.5, 4, '#24242c'); D(8, 8.5, 3, '#3c3c46'); D(8, 8.5, 2, '#d62f2f'); P(8, 8, 1, 1, '#ffffff');
    D(14, 11, 3, '#d9a679'); P(16, 11, 1, 1, '#2a1d1a'); P(14, 10, 1, 1, '#111111'); P(5, 14, 2, 2, '#7a4f35'); P(10, 14, 2, 2, '#7a4f35');
  } else if (i === 2) {                                       // Броненосець Диско: панцир — дзеркальна куля, блискітки
    fill((x, y) => inD(8, 9, 5.6)(x, y) && y <= 11, '#9fb8e8');
    fill((x, y) => inD(8, 9, 5.6)(x, y) && y <= 11 && (x + y) % 2 === 0, '#e6f4ff');
    P(5, 5, 2, 1, '#ffffff'); P(10, 6, 1, 1, '#ffffff');
    D(14, 11, 2.6, '#d9a0b0'); P(13, 8, 2, 2, '#c98a9a'); P(16, 11, 1, 1, '#2a1d1a'); P(14, 10, 1, 1, '#111111');
    P(5, 12, 2, 3, '#9a8a9a'); P(10, 12, 2, 3, '#9a8a9a'); P(1, 12, 4, 1, '#9a8a9a');
    P(1, 2, 1, 3, '#ffe08a'); P(0, 3, 3, 1, '#ffe08a'); P(15, 2, 1, 3, '#ff9ed1'); P(14, 3, 3, 1, '#ff9ed1');
  } else if (i === 3) {                                       // Хом'як Жетон: рудий, за щокою золота монета
    D(8, 9, 5.6, '#e8863c'); D(9, 11, 3, '#fff4dc'); P(11, 3, 2, 2, '#e8863c'); P(12, 4, 1, 1, '#ef8fa3');
    D(13, 11, 2.3, '#f2b84b'); P(12, 10, 1, 2, '#ffe08a'); P(12, 8, 1, 2, '#111111'); P(15, 10, 1, 1, '#ef8fa3');
    P(6, 14, 2, 1, '#ef8fa3'); P(10, 14, 2, 1, '#ef8fa3');
  } else if (i === 4) {                                       // Баг Глюкович: зелений жук з антенами й «глітч»-смужками
    fill((x, y) => inD(8, 10, 6)(x, y) && y <= 11, '#4f9a63'); P(5, 6, 3, 1, '#8ed4a6'); P(9, 8, 2, 2, '#2f6b48'); P(6, 10, 2, 1, '#2f6b48');
    D(14, 10, 2.5, '#2f6b48'); P(15, 9, 1, 1, '#ffffff'); P(14, 4, 1, 4, '#111111'); P(16, 4, 1, 4, '#111111'); P(14, 3, 1, 1, '#ff5fa2'); P(16, 3, 1, 1, '#33e6ff');
    [4, 7, 10].forEach(x => { P(x, 12, 1, 3, '#111111'); }); P(12, 12, 1, 3, '#111111');
    P(10, 5, 4, 1, '#33e6ff'); P(12, 7, 3, 1, '#ff5fa2'); P(2, 9, 2, 1, '#33e6ff');
  } else if (i === 5) {                                       // Хамелеон Листок: зелений, очі-башточки, закручений хвіст, листочок на голові
    fill(inE(8, 10, 6.2, 3.6), '#4f9a63'); P(5, 8, 3, 1, '#8ed4a6'); P(9, 8, 2, 1, '#8ed4a6'); P(6, 12, 5, 1, '#e8f0a0');
    D(14, 9, 3, '#4f9a63'); D(14, 7, 1.6, '#3f8a53'); P(14, 7, 1, 1, '#111111'); P(16, 10, 1, 1, '#2f6b48'); P(11, 5, 3, 2, '#2f6b48');
    for (let a = 0; a < 360; a += 30) { const r = a * Math.PI / 180; P(Math.round(3 + Math.cos(r) * 2.6), Math.round(10 + Math.sin(r) * 2.6), 1, 1, '#4f9a63'); }
    P(5, 13, 2, 3, '#4f9a63'); P(10, 13, 2, 3, '#4f9a63');
  } else if (i === 6) {                                       // Астро Аксолотль: рожевий у скляному шоломі, зовнішні зябра, ранець
    fill(inE(9, 10.5, 6, 3), '#ef8fa3'); P(0, 9, 4, 3, '#ffc9d4'); P(5, 6, 3, 3, '#9c9087'); P(5, 7, 1, 1, '#c4ebf5');
    D(13, 9, 3, '#ef8fa3'); P(10, 4, 1, 3, '#ff5fa2'); P(11, 3, 1, 3, '#ff5fa2'); P(10, 11, 1, 2, '#ff5fa2'); P(14, 8, 1, 1, '#111111'); P(14, 11, 2, 1, '#b04a6a');
    P(8, 13, 2, 2, '#ef8fa3'); P(11, 13, 2, 2, '#ef8fa3');
    for (let a = 0; a < 360; a += 8) { const r = a * Math.PI / 180; P(Math.round(13 + Math.cos(r) * 5.4), Math.round(8.5 + Math.sin(r) * 5.4), 1, 1, '#b8e3ff'); }
    P(10, 4, 2, 1, '#ffffff'); P(9, 6, 1, 1, '#ffffff');
  } else if (i === 8) {                                       // Японія: журавлик-орігамі (малюнок у 275_japan.js)
    drawJapanCrane(g);
  } else {                                                    // Кіт Вивіска: неоновий контур рожевим, темна заливка, блакитні очі
    const body = inE(8, 10, 6.2, 3.6), head = inD(14, 8, 3), ear1 = (x, y) => x >= 12 && x <= 13 && y >= 3 && y <= 5 - (x - 12), ear2 = (x, y) => x >= 15 && x <= 16 && y >= 3 && y <= 4 + (x - 15) * 0,
      legs = (x, y) => y >= 13 && y <= 15 && (x === 4 || x === 5 || x === 10 || x === 11), tail = (x, y) => (x >= 0 && x <= 2 && y >= 5 && y <= 11 && (x === 1 || (x === 2 && y >= 10) || (x === 0 && y <= 6)));
    const inAll = (x, y) => body(x, y) || head(x, y) || ear1(x, y) || ear2(x, y) || legs(x, y) || tail(x, y);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 18; x++) if (inAll(x, y)) {
      const edge = !inAll(x - 1, y) || !inAll(x + 1, y) || !inAll(x, y - 1) || !inAll(x, y + 1);
      P(x, y, 1, 1, edge ? '#ff5fa2' : '#2b1a4f');
    }
    P(14, 7, 2, 1, '#33e6ff'); P(12, 7, 1, 1, '#33e6ff'); P(16, 10, 1, 1, '#ff5fa2'); P(6, 8, 4, 1, '#7a5cc9'); P(6, 10, 4, 1, '#7a5cc9');
  }
  return c;
}
for (let i = 0; i < 8; i++) SPRITES['npc_crt' + i] = { canvas: makeCreatureCanvas(i) };

function huntLimits() { return { l: visL() + 12, r: visR() - 12, yMin: 138, yMax: worldB() - 8 }; }
function startGhostHunt() {
  const L = huntLimits(), halloween = theme.season === 'halloween', ep = viewEpoch() % EPOCH_CREATURES.length;
  const cnt = halloween ? CONFIG.GHOST_COUNT : 6;                // герої епох: шестеро за раз (як привиди), але рідкість винагороди та сама
  ghostHunt = { t: 0, dur: halloween ? CONFIG.GHOST_SECONDS : 28, caught: 0, total: cnt, ghosts: [], crt: halloween ? -1 : ep };
  const mv = halloween ? 'ghost' : EPOCH_CREATURES[ep].move;
  for (let i = 0; i < cnt; i++) {
    const sg = Math.random() < 0.5 ? -1 : 1, g = { x: rand(L.l, L.r), y: rand(L.yMin - 6, L.yMax), vx: rand(12, 26) * sg, vy: 0, ph: rand(0, 6.3), alive: true, born: i * 0.9, tm: rand(0.2, 1), rot: 0, alpha: 1, glitch: 0, jt: 0, air: false, flip: sg < 0 };
    if (mv === 'glide') { g.y0 = rand(66, 116); g.vx = rand(30, 44) * sg; }
    else if (mv === 'roll') { g.rolling = true; g.vx = rand(56, 76) * sg; }
    else if (mv === 'moonwalk') g.vx = rand(14, 20) * sg;
    else if (mv === 'camo') g.vx = rand(8, 13) * sg;
    else if (mv === 'float') { g.y = rand(56, 118); g.vx = rand(-10, 10) || 6; g.vy = rand(-8, 8); }
    else if (mv === 'leap') { g.vx = rand(40, 52) * sg; g.tm = rand(0.1, 0.6); }
    ghostHunt.ghosts.push(g);
  }
  playSfx('raccoon');
  showToast(halloween ? t('ghostStart') : t('crtStart', EPOCH_CREATURES[ep].icon + ' ' + t('crt_' + ep)), 'big');
}
function endGhostHunt() {
  const h = ghostHunt;
  ghostHunt = null;
  nextGhostAt = Date.now() + (h.crt < 0 ? rand(CONFIG.GHOST_HUNT_MIN_SECONDS, CONFIG.GHOST_HUNT_MAX_SECONDS) : CONFIG.CREATURE_INTERVAL_SECONDS) * 1000 * evMult();   // герої епох — рівно раз на 5 хвилин
  if (h.caught && h.caught >= h.total) { state.crystals += 1; state.crystalsTotal += 1; showToast(t('huntAll'), 'big'); }     // зловив усіх — кристал
  else if (h.caught) showToast(t('huntEnd', h.caught, h.total), 'good');
  else showToast(t(h.crt < 0 ? 'ghostEndNone' : 'crtEndNone'), 'bad');
  saveGame();
  updateUI();
}
function stepCreature(g, dt, L, mv) {                          // рух одного героя епохи (g.x — центр, g.sy — де стоять «ноги» на екрані)
  g.tm -= dt; g.ph += dt * 2.2;
  const bounceX = () => { if (g.x < L.l) { g.x = L.l; g.vx = Math.abs(g.vx); } else if (g.x > L.r) { g.x = L.r; g.vx = -Math.abs(g.vx); } };
  switch (mv) {
    case 'glide':                                              // сова летить хвилею поперек вулиці
      g.x += g.vx * dt; bounceX(); g.sy = g.y0 + Math.sin(g.ph * 1.1) * 15; break;
    case 'roll':                                               // їжак котиться короткими ривками й зупиняється
      if (g.tm <= 0) { g.rolling = !g.rolling; g.tm = g.rolling ? rand(1, 1.6) : rand(0.6, 1); if (g.rolling) g.vx = rand(56, 76) * (Math.random() < 0.5 ? -1 : 1); }
      if (g.rolling) { g.x += g.vx * dt; g.rot += g.vx * dt / 6; bounceX(); }
      g.sy = g.y; break;
    case 'moonwalk': {                                         // броненосець — крок уперед, ковзання назад
      const k = Math.sin(g.ph * 1.2);
      g.x += g.vx * (k > 0.15 ? 2.4 : -1.1) * dt; bounceX(); g.sy = g.y - Math.max(0, Math.sin(g.ph * 2.4)) * 3; break;
    }
    case 'dash':                                               // хом'як шмигає по сітці: вліво, вправо, вгору, вниз
      if (g.tm <= 0) { g.tm = rand(0.4, 0.85); const d = Math.floor(rand(0, 4)); g.vx = d === 0 ? 70 : d === 1 ? -70 : 0; g.vy = d === 2 ? 36 : d === 3 ? -36 : 0; if (g.vx) g.flip = g.vx < 0; }
      g.x += g.vx * dt; g.y += g.vy * dt; if (g.y < L.yMin) { g.y = L.yMin; g.vy = 0; } if (g.y > L.yMax) { g.y = L.yMax; g.vy = 0; }
      if (g.x < L.l) { g.x = L.l; g.vx = 70; g.flip = false; } else if (g.x > L.r) { g.x = L.r; g.vx = -70; g.flip = true; }
      g.sy = g.y; break;
    case 'glitch':                                             // баг стоїть, мерехтить і раптом «телепортується»
      if (g.tm <= 0) { g.tm = rand(0.9, 1.5); g.glitch = 0.28; g.x = rand(L.l, L.r); g.y = rand(L.yMin, L.yMax); g.flip = Math.random() < 0.5; }
      g.glitch = Math.max(0, g.glitch - dt); g.sy = g.y; break;
    case 'camo':                                               // хамелеон повільно йде й зникає в кольорі фону
      g.x += g.vx * dt; bounceX(); g.alpha = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(g.ph * 0.55)); g.sy = g.y; break;
    case 'float':                                              // аксолотль пливе в невагомості по всьому небу над вулицею
      g.x += g.vx * dt; g.y += g.vy * dt; bounceX(); if (g.y < 50) { g.y = 50; g.vy = Math.abs(g.vy); } else if (g.y > 122) { g.y = 122; g.vy = -Math.abs(g.vy); }
      g.rot = Math.sin(g.ph * 0.6) * 0.35; g.sy = g.y + Math.sin(g.ph) * 3; break;
    case 'leap': {                                             // кіт стрибає дугами через вулицю
      if (!g.air) { g.sy = g.y; if (g.tm <= 0) { g.air = true; g.jt = 0; if (g.x < L.l + 40) g.vx = Math.abs(g.vx); else if (g.x > L.r - 40) g.vx = -Math.abs(g.vx); g.flip = g.vx < 0; } }
      else { g.jt += dt / 0.75; g.x += g.vx * dt; bounceX(); g.sy = g.y - 22 * 4 * g.jt * (1 - g.jt); if (g.jt >= 1) { g.air = false; g.tm = rand(0.4, 0.8); g.sy = g.y; } }
      break;
    }
  }
}
const hwitch = { on: false, x: 0, y: 0, dir: -1, t: 0, timer: 6 };                              // відьма на мітлі прилітає час від часу
const fogWisps = [];
function hallowSkyY() { return Math.round(34 - view.offY * 0.45); }
function updateHalloweenAir(dt) {
  if (theme.season !== 'halloween' || !animOn()) { hwitch.on = false; fogWisps.length = 0; return; }
  if (!fogWisps.length) for (let i = 0; i < 16; i++) fogWisps.push({ x: rand(worldL(), worldR()), y: rand(LAYOUT.curbY - 2, worldB() - 28), w: rand(34, 70), vx: rand(2, 6), a: rand(0.07, 0.14) });
  fogWisps.forEach(f => { f.x += f.vx * dt; if (f.x - f.w > worldR()) f.x = worldL() - f.w; });
  if (!hwitch.on) {
    hwitch.timer = 99;
    return;
    hwitch.timer -= dt;
    if (hwitch.timer <= 0) { hwitch.on = true; hwitch.t = 0; hwitch.dir = Math.random() < 0.5 ? -1 : 1; hwitch.x = hwitch.dir < 0 ? visR() + 40 : visL() - 40; hwitch.y = hallowSkyY() + rand(-8, 14); playSfx('hagCackle'); }
  } else {
    hwitch.t += dt; hwitch.x += hwitch.dir * 42 * dt;
    if (hwitch.x < visL() - 70 || hwitch.x > visR() + 70) { hwitch.on = false; hwitch.timer = rand(18, 40); }
  }
}
let witchCv = null;
function buildWitchCanvas() {                                                              // відьма 26×22 «великих пікселів» (кожен 2×2), дивиться вправо
  const MAP = ["..........kk..............",".........kVVk............","..........kVVk...........","..........kVvVk..........","...........kVvVk.........","...........kVVVVk........","..........kPPyyPPk.......","........kkVVVVVVVVkk.....",".......kVVVVVVVVVVVVk....","........kkkkkkkkkkkkk....",".......kfffkWWWWWWk......","......kffJfkWkWWqWWk.....","......kfJffkWWWWWWk......","......kffffkWWrrWk.......",".......kfJfkkkkkkk.......","....kkk.kffkVVVVVkk......","...khyhkkfkVvVVVVPkWk....","..khyyhkkkkVVVPPPkWWk....","..kyohhoooooooooooooookk.","..khohhkkdkPPPPPPkk.....","...kkkk...kPkk.kPk......","..........kkk..kkkk....."];
  const c = document.createElement('canvas'); c.width = 52; c.height = 44; const g = c.getContext('2d');
  MAP.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') R(g, i * 2, j * 2, 2, 2, r[i]); });
  return c;
}
function drawWitchSprite(x, y, dir, t) {
  if (!witchCv) witchCv = buildWitchCanvas();
  const bob = Math.round(Math.sin(t * 6) * 1);
  drawCanvasSprite(ctx, witchCv, x - 26, y - 22 + bob, { flip: dir < 0 });
  for (let k = 0; k < 7; k++) {                                                              // зоряний шлейф за віником
    const a = (1 - k / 7) * 0.8, px = 28 + k * 5, py = 14 + Math.round(Math.sin(t * 5 + k) * 2) + (k % 2 ? -2 : 2);
    ctx.globalAlpha = a; R(ctx, dir < 0 ? x + px : x - px, y + py, 1, 1, ['y', 'o', 'u', 'w'][k % 4]); if (k % 3 === 0) R(ctx, dir < 0 ? x + px - 1 : x - px + 1, y + py, 3, 1, 'y');
    ctx.globalAlpha = 1;
  }
}
function drawWitchSpriteOld(x, y, dir, t) {                                                           // відьма на мітлі (летить уліво при dir < 0)
  const P = (dx, dy, w, h, c) => R(ctx, dir < 0 ? x + dx : x - dx - w + 1, y + dy, w, h, c);
  const fl = Math.floor(t * 8) % 2;
  P(-9, 0, 24, 1, 'd'); P(-9, 0, 24, 1, 'b'); P(-9, -1, 24, 1, 'd');                          // держак
  P(14, -2, 7, 5, 'h'); P(15, -1, 6, 1, 'o'); P(15, 1, 6, 1, 'o'); P(21, -1, 2, 1, 'h'); P(21, 1, 2, 1, 'h'); P(14, -3, 7, 1, 'd'); P(14, 3, 7, 1, 'd');         // віник
  P(-2, -8, 7, 8, 'd'); P(-1, -7, 5, 7, 'V'); P(-1, -7, 1, 7, 'u'); P(1 + fl, -3, 3, 3, 'V');   // мантія
  P(-1, 0, 2, 5 + fl, 'V'); P(-2, 4 + fl, 3, 2, 'k');                                          // нога з чобітком
  P(-7, -12, 6, 5, 'd'); P(-6, -11, 4, 4, 'm'); P(-8, -9, 2, 2, 'm'); P(-8, -9, 1, 1, 'g'); P(-5, -10, 1, 1, 'y');   // обличчя з носом і оком
  P(-9, -13, 11, 2, 'd'); P(-8, -13, 9, 1, 'k'); P(-6, -17, 5, 4, 'd'); P(-5, -17, 3, 4, 'k'); P(-4, -20, 3, 3, 'd'); P(-3, -20, 1, 3, 'k'); P(-6, -14, 7, 1, 'o');   // капелюх
  for (let k = 0; k < 7; k++) {                                                                // зоряний шлейф
    const a = (1 - k / 7) * 0.8, px = 22 + k * 5, py = Math.round(Math.sin(t * 5 + k) * 2) + (k % 2 ? -2 : 2);
    ctx.globalAlpha = a; R(ctx, dir < 0 ? x + px : x - px, y + py, 1, 1, ['y', 'o', 'u', 'w'][k % 4]); if (k % 3 === 0) R(ctx, dir < 0 ? x + px - 1 : x - px + 1, y + py, 3, 1, 'y');
    ctx.globalAlpha = 1;
  }
}
const capyRimCache = {};
const CAPY_K = 1.3;                                   // Капі збільшена на 30%
function capyHopY() { const k = (animClock - capyAnim.hopAt) / 0.5; return k >= 0 && k < 1 ? Math.round(Math.sin(k * Math.PI) * 10) : 0; }       // підскок Капі при тапі на неї (пікселі сцени)
function capyScaled(fn) { const cp = LAYOUT.capy, px = cp.x + 14, py = cp.footY; ctx.save(); ctx.translate(px, py); ctx.scale(CAPY_K, CAPY_K); ctx.translate(-px, -py); fn(); ctx.restore(); }
function drawCapyBody(breath) {
  const cp = LAYOUT.capy;
  drawSprite(ctx, capySprite(), cp.x, cp.footY - 24, { flip: cp.flip, sx: 1.2, sy: 1.2 * (1 + 0.045 * breath), variant: capyAnim.blinkLeft > 0 ? 'blink' : '' });
}
function drawCapyRim(x, y, flip) {                                              // тонкий теплий контур: Капі вночі не зливається з темною вулицею
  const name = capySprite(), src = getSpriteCanvas(name);
  let rim = capyRimCache[name];
  if (!rim) {
    rim = document.createElement('canvas'); rim.width = src.width; rim.height = src.height;
    const g = rim.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#ffe9b0'; g.fillRect(0, 0, rim.width, rim.height);
    capyRimCache[name] = rim;
  }
  const a = Math.min(0.85, 0.35 + sky.night * 0.7);
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => drawCanvasSprite(ctx, rim, x + dx, y + dy, { flip, alpha: a, sx: 1.2, sy: 1.2 }));
}
function drawHalloweenFog() {
  if (theme.season !== 'halloween') return;
  fogWisps.forEach(f => { if (f.x + f.w < visL() || f.x - f.w > visR()) return; ctx.globalAlpha = f.a; for (let dy = -3; dy <= 3; dy++) { const half = Math.round(f.w * 0.5 * Math.sqrt(1 - (dy * dy) / 12)); R(ctx, Math.round(f.x) - half, Math.round(f.y) + dy, half * 2, 1, 'w'); } });
  ctx.globalAlpha = 1;
}
function drawHalloweenAir() {
  if (theme.season !== 'halloween') return;
  if (hwitch.on) drawWitchSprite(Math.round(hwitch.x), Math.round(hwitch.y + Math.sin(hwitch.t * 1.8) * 6), hwitch.dir, hwitch.t);
}
function updateGhostHunt(dt) {
  updateHalloweenAir(dt);
  // привиди, що блимають у вікнах (лише на Хелловін)
  if (theme.season !== 'halloween' || !houseGlass || !houseGlass.length || !animOn()) windowGhosts.length = 0;
  else {
    windowGhostTimer -= dt;
    if (windowGhostTimer <= 0) {
      windowGhostTimer = rand(1.0, 2.8);
      const seen = houseGlass.filter(r => r[0] > visL() && r[0] < visR());
      if (seen.length && windowGhosts.length < 5) { const r = seen[Math.floor(Math.random() * seen.length)]; windowGhosts.push({ x: r[0], y: r[1], t: 0, dur: rand(2.0, 2.8), dx: Math.random() < 0.5 ? -1 : 1, ph: rand(0, 6.3), scared: false }); }
    }
    for (let i = windowGhosts.length - 1; i >= 0; i--) {
      const w = windowGhosts[i]; w.t += dt;
      if (!w.scared && w.t > w.dur * 0.22) { w.scared = true; scareNear(w.x + 3, w.y + 4); }                       // вилетів — найближчі звірята лякаються
      if (w.t >= w.dur) windowGhosts.splice(i, 1);
    }
  }
  if (!ghostHunt) return;
  const h = ghostHunt, L = huntLimits(), mv = h.crt < 0 ? 'ghost' : EPOCH_CREATURES[h.crt].move;
  h.t += dt;
  h.ghosts.forEach(g => {
    if (!g.alive || h.t < g.born) return;
    if (mv === 'ghost') {
      g.x += g.vx * dt; g.ph += dt * 2.2;
      if (g.x < L.l) { g.x = L.l; g.vx = Math.abs(g.vx); } else if (g.x > L.r) { g.x = L.r; g.vx = -Math.abs(g.vx); }
      g.sy = g.y + Math.sin(g.ph) * 6; g.flip = g.vx < 0;
    } else {
      stepCreature(g, dt, L, mv);
      if (mv !== 'dash' && mv !== 'glitch' && mv !== 'leap' && g.vx) g.flip = g.vx < 0;
    }
    g.sx = g.x;
  });
  if (h.t >= h.dur || h.ghosts.every(g => !g.alive)) endGhostHunt();
}
// Тап по привидові чи герою: ловимо його (повертає true, якщо влучили)
function hitGhost(p) {
  if (!ghostHunt) return false;
  const h = ghostHunt;
  for (const g of h.ghosts) {
    if (!g.alive || h.t < g.born || g.sy === undefined) continue;
    if (Math.abs(p.x - g.x) <= 10 && p.y >= g.sy - 17 && p.y <= g.sy + 5) {
      g.alive = false; buzz(25);
      h.caught++;
      const prize = Math.floor(state.cps * 20 + 100 * levelMult()); state.coins += prize; state.totalEarned += prize;        // за кожного — готова нагорода монетами
      if (h.crt >= 0) helpCredit(h.crt);                                                                                     // і крок до допомоги гостеві цієї епохи
      state.stats.ghostsCaught++;
      for (let i = 0; i < 8; i++) { const a = rand(0, Math.PI * 2), sp = rand(30, 70); fx.sparks.push({ x: g.x, y: g.sy - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, age: 0, life: rand(0.3, 0.5), col: i % 2 ? 'w' : (h.crt < 0 ? 'S' : 'y') }); }
      spawnFloater(g.x, g.sy - 14, '+' + fmt(prize));
      playSfx('upgrade');
      updateUI();
      return true;
    }
  }
  return false;
}
function drawGhostHunt() {
  if (ghostHunt) {
    const h = ghostHunt, fade = Math.min(1, (h.dur - h.t) / 2);     // в кінці полювання вони тануть
    h.ghosts.forEach(g => {
      if (!g.alive || h.t < g.born || g.sy === undefined) return;
      const x = Math.round(g.x), y = Math.round(g.sy);
      if (h.crt < 0) {
        ctx.globalAlpha = 0.18 * fade; R(ctx, x - 5, y + 4, 11, 2, 'd');
        ctx.globalAlpha = (0.8 + 0.15 * Math.sin(g.ph * 1.7)) * fade;
        drawSprite(ctx, 'ghost', x - 6, y - 13, { flip: g.flip });
        return;
      }
      const mv = EPOCH_CREATURES[h.crt].move, c = getOutlinedCanvas('npc_crt' + h.crt), airborne = mv === 'glide' || mv === 'float' || g.air;
      const gy = (mv === 'leap' ? g.y : y);                              // тінь лишається на землі
      if (!(mv === 'glide' || mv === 'float')) { ctx.globalAlpha = 0.2 * fade * (g.alpha || 1); R(ctx, x - 6, Math.round(gy) + 1, 13, 2, 'd'); }
      ctx.globalAlpha = fade * g.alpha;
      if (mv === 'glitch' && g.glitch > 0) {                              // «глітч»: кольорові зміщені копії
        ctx.globalAlpha = 0.55 * fade; drawCanvasSprite(ctx, c, x - 12, y - 17, { flip: g.flip }); drawCanvasSprite(ctx, c, x - 8, y - 17, { flip: g.flip });
        ctx.globalAlpha = fade; R(ctx, x - 10, y - 9, 20, 1, 'T'); R(ctx, x - 6, y - 5, 14, 1, 'f');
      }
      if (g.rot) { ctx.save(); ctx.translate(x, y - 8); ctx.rotate(g.rot * (g.flip ? -1 : 1)); ctx.drawImage(c, -10, -9); ctx.restore(); }
      else if (mv === 'camo' || mv === 'glitch' || mv === 'leap' || mv === 'dash' || mv === 'moonwalk' || mv === 'glide') drawCanvasSprite(ctx, c, x - 10, y - 17, { flip: g.flip, sy: airborne && mv === 'glide' ? 1 + 0.08 * Math.sin(g.ph * 5) : 1 });
      else drawCanvasSprite(ctx, c, x - 10, y - 17, { flip: g.flip });
      if (mv === 'moonwalk' && animOn() && Math.floor(g.ph * 3) % 2) { ctx.globalAlpha = fade; R(ctx, x - 12, y - 14, 1, 1, 'y'); R(ctx, x + 11, y - 12, 1, 1, 'f'); }
    });
    ctx.globalAlpha = 1;
  }
  windowGhosts.forEach(w => {
    const k = w.t / w.dur;
    if (k < 0.22) {                                                                // зблиск у вікні
      const a = Math.min(1, k / 0.1);
      ctx.globalAlpha = 0.55 * a; R(ctx, w.x - 1, w.y - 1, 7, 9, 'o');
      ctx.globalAlpha = a; drawSprite(ctx, 'ghost_s', w.x, w.y);
    } else {                                                                       // вилітає з вікна, звивається вгору й вбік і тане
      const u = (k - 0.22) / 0.78, gx = Math.round(w.x + 3 + w.dx * u * 40 + Math.sin(u * 8 + w.ph) * 3), gy = Math.round(w.y + 6 - u * 30 - u * u * 10), sc = 0.7 + 0.45 * u;
      ctx.globalAlpha = 0.16 * (1 - u); disc(ctx, gx, gy - 6, 11, 'S');
      ctx.globalAlpha = Math.min(0.9, (1 - Math.pow(u, 1.6)) * 1.1); drawSprite(ctx, 'ghost', gx - Math.round(6 * sc), gy - Math.round(13 * sc), { flip: w.dx < 0, sx: sc, sy: sc });
    }
  });
  ctx.globalAlpha = 1;
}


