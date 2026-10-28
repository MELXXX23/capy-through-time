//#part 262_fx_plus.js
/* =====================================================================
   ЕФЕКТИ ПЛЮС: світло й тіні, глибина, погода, реакції епох, плавний лічильник монет.
   Усе малюється в координатах сцени (ctx вже зсунуто на view.off*), тож піксель чіткий.
   Вимикач: налаштування «Покращені ефекти» (state.settings.fxPlus); режим економії й вимкнені анімації теж їх гасять.
   Рівень: 0 — вимк., 1 — телефон (вдвічі менше частинок, без туману й тіней хмар), 2 — ПК.
   ===================================================================== */
const FXP = { key: '', eid: '', lv: 0, t: 0, rainPeak: 0, rb: -1, sweep: 0, coin: null, rbCache: null, rbKey: '', falls: [], flies: [] };
function fxLevel() { return (!animOn() || ecoOn() || state.settings.fxPlus === false) ? 0 : (mobileMQ.matches ? 1 : 2); }

// що додає кожна епоха (кольори — палітра самої епохи)
const EPFX = {
  renaissance: { fall: { cols: ['#f6c85a', '#e8903a', '#9bd16a'], n: 22, v: 10 }, fly: { cols: ['#fff3b0', '#ffd36a'], n: 8 }, rays: '#ffe9b0', glint: '#fff6d0' },
  retro: { fall: { cols: ['#ff9bb0', '#ffe08a', '#9be0ff'], n: 18, v: 9 }, rays: '#ffd7a0', glint: '#fff0d0' },
  disco: { beams: ['#ff5ac8', '#46e6ff', '#ffe650', '#aa6eff'], pulse: { c: '#ff78dc', hz: 2 }, fall: { cols: ['#ff4fb8', '#46e6ff', '#ffe34a', '#a56bff'], n: 40, v: 18 }, glint: '#fff0ff' },
  arcade: { fall: { cols: ['#ff5a5a', '#5ac8ff', '#ffd24a', '#7dff7a', '#c47aff'], n: 20, v: 14, sq: 2 }, glint: '#ffffff' },
  internet: { rise: { cols: ['#46e6ff', '#7dff9a', '#ffffff'], n: 30, v: 12 }, pulse: { c: '#46e6ff', hz: 0.5, k: 0.5 }, glint: '#bff6ff' },
  eco: { fall: { cols: ['#7ed957', '#bfe86a', '#4fae3f'], n: 22, v: 9 }, fly: { cols: ['#ffb347', '#ff8fb4', '#7fd0ff', '#fff27a'], n: 10, bfly: true }, rays: '#e6ffc0', glint: '#f6ffe0' },
  space: { aurora: ['#50ffd2', '#a078ff', '#50c8ff'], fly: { cols: ['#8ff5ea', '#b79cff', '#fff3a0'], n: 14 }, glint: '#c8fff7' },
  neon: { pulse: { c: '#ff3ca8', hz: 1.6 }, beams: ['#ff3ca8', '#3cf0ff'], rise: { cols: ['#ff3ca8', '#3cf0ff'], n: 22, v: 20 }, glint: '#ffd6f4' },
  japan: { fall: { cols: ['#ffc3d6', '#ff8fb4', '#ffe3ec'], n: 34, v: 11, big: true }, fly: { cols: ['#ffe9a0', '#ffc86a'], n: 12 }, rays: '#ffd0d8', glint: '#fff2e8' }
};
const fxPx = (x, y, w, h, c) => R(ctx, Math.round(x), Math.round(y), w, h, c);
function fxFrac(i, j) { return (hash2(i * 7 + 3, j * 11 + 5) % 1000) / 1000; }

function fxSeed(id, L) {
  const C = EPFX[id] || {}, A = Math.min(3, Math.max(1, view.w * (view.offY + LAYOUT.horizonY) / (320 * 160))) * (L === 1 ? 0.5 : 1);
  const top = -view.offY, bot = LAYOUT.streetTop + 14, x0 = worldL();
  FXP.falls = []; FXP.flies = [];
  const mk = (cfg, up) => { const n = Math.min(90, Math.round(cfg.n * A)); for (let i = 0; i < n; i++) FXP.falls.push({ x: x0 + Math.random() * view.w, y: top + Math.random() * (bot - top), v: cfg.v * (0.6 + Math.random() * 0.8), sw: 3 + Math.random() * 5, ph: Math.random() * 6.28, big: cfg.big ? Math.random() > 0.55 : false, sq: cfg.sq || 0, c: cfg.cols[i % cfg.cols.length], up }); };
  if (C.fall) mk(C.fall, false);
  if (C.rise) mk(C.rise, true);
  if (C.fly) { const n = Math.min(40, Math.round(C.fly.n * A)); for (let i = 0; i < n; i++) FXP.flies.push({ x: x0 + Math.random() * view.w, y: top + (LAYOUT.horizonY - top) * (0.35 + Math.random() * 0.65), ph: Math.random() * 6.28, sp: 0.5 + Math.random() * 1.1, c: C.fly.cols[i % C.fly.cols.length], b: !!C.fly.bfly }); }
}

function updateFxPlus(dt) {
  fxCoin(dt);
  const L = FXP.lv = fxLevel();
  if (!L || !layoutReady) return;
  FXP.t += dt;
  const id = currentEpoch().id, key = id + '|' + view.w + '|' + view.offY + '|' + L;
  if (key !== FXP.key) { if (FXP.eid && FXP.eid !== id) FXP.sweep = 1; FXP.key = key; FXP.eid = id; fxSeed(id, L); }
  FXP.sweep = Math.max(0, FXP.sweep - dt / 1.3);
  FXP.rainPeak = Math.max(weather.rain, FXP.rainPeak - dt * 0.02);
  if (FXP.rb >= 0) { FXP.rb += dt; if (FXP.rb > 50) FXP.rb = -1; }
  else if (FXP.rainPeak > 0.5 && weather.rain < 0.25 && sky.night < 0.45 && theme.season !== 'halloween') { FXP.rb = 0; FXP.rainPeak = 0; }       // після дощу виходить веселка
  const top = -view.offY, bot = LAYOUT.streetTop + 14, x0 = worldL();
  for (const p of FXP.falls) {
    p.y += (p.up ? -p.v : p.v) * dt;
    p.x += ((p.up ? 0 : 4) + Math.sin(FXP.t * 0.8 + p.ph) * 5) * dt + Math.sin(FXP.t * 1.9 + p.ph) * p.sw * dt;
    if (p.y > bot) { p.y = top; p.x = x0 + Math.random() * view.w; } else if (p.y < top) { p.y = bot; p.x = x0 + Math.random() * view.w; }
    if (p.x > x0 + view.w + 4) p.x = x0 - 4; else if (p.x < x0 - 6) p.x = x0 + view.w;
  }
}

// плавний лічильник монет: великі стрибки (покупка, подарунок, подорож) котяться, а повільний дохід лишається звичайним
function fxCoin(dt) {
  if (previewIdx() !== null || !animOn() || ecoOn() || !isFinite(state.coins)) { FXP.coin = null; return; }
  const tgt = Math.floor(state.coins);
  if (FXP.coin === null) FXP.coin = tgt;
  const d = tgt - FXP.coin;
  if (Math.abs(d) < 3 + Math.abs(tgt) * 0.004) { FXP.coin = tgt; return; }
  if (d > 0 && FXP.coin !== null && ui.coinCount) { ui.coinCount.classList.remove('fxPop'); void ui.coinCount.offsetWidth; ui.coinCount.classList.add('fxPop'); }
  FXP.coin += d * Math.min(1, dt * 9);
  setText(ui.coinCount, fmt(Math.floor(FXP.coin)), 'coins');
}
function fxCoinShown() { return (FXP.coin === null || !isFinite(FXP.coin)) ? state.coins : FXP.coin; }

// веселка: малюється один раз у кеш, потім лише м'яко з'являється й гасне
function fxRainbowCanvas(Rr) {
  if (FXP.rbCache && FXP.rbKey === Rr) return FXP.rbCache;
  const cv = document.createElement('canvas'); cv.width = 2 * Rr + 8; cv.height = Rr + 8; const g = cv.getContext('2d');
  const cols = ['#e8453c', '#f5953a', '#f6d44a', '#5cc86a', '#4aa8e8', '#5a6ae0', '#9a5ad0'], cx = Rr + 4, base = Rr + 4;
  cols.forEach((c, i) => { const ro = Rr - i * 3, ri = ro - 3; g.fillStyle = c; for (let x = -ro; x <= ro; x++) { const yo = Math.sqrt(ro * ro - x * x), yi = Math.abs(x) < ri ? Math.sqrt(ri * ri - x * x) : 0; g.fillRect(cx + x, Math.round(base - yo), 1, Math.max(1, Math.round(yo - yi))); } });
  FXP.rbCache = cv; FXP.rbKey = Rr; return cv;
}
function fxBehind() {                                          // за будинками: веселка після дощу
  if (!FXP.lv || FXP.rb < 0 || !shop) return;
  const Rr = Math.round(Math.max(110, Math.min(Math.max(shop.h + 80, shop.w * 0.72), 340))), cv = fxRainbowCanvas(Rr), a = Math.pow(Math.sin(Math.PI * FXP.rb / 50), 0.7) * 0.55 * Math.max(0, 1 - sky.night * 1.6);
  ctx.globalAlpha = a; ctx.drawImage(cv, Math.round(shop.x + shop.w / 2 - Rr - 4), LAYOUT.horizonY + 2 - Rr - 4); ctx.globalAlpha = 1;
}

// глибина: серпанок над обрієм і повільні смуги туману різної швидкості (дальні будинки бліднуть)
function fxDepth() {
  const L = FXP.lv; if (!L) return;
  const ep = currentEpoch(), hz = LAYOUT.horizonY, x0 = worldL(), t = FXP.t, rain = weather.rain || 0;
  const col = PALETTE[ep.sky && ep.sky[2]] || '#dfeaf5', a = (0.2 + rain * 0.16) * (1 - sky.night * 0.45);
  const g = ctx.createLinearGradient(0, hz - 44, 0, hz + 3); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col);
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x0, hz - 44, view.w, 47); ctx.globalAlpha = 1;
  if (L < 2) return;
  const n = 3 + (rain > 0.3 ? 2 : 0), tint = sky.dusk > 0.3 ? '#ffd9b8' : '#ffffff';
  for (let i = 0; i < n; i++) {
    const sp = 2.5 + i * 1.7, w = 110 + i * 30, x = ((t * sp + i * 210) % (view.w + w * 2)) - w + x0, y = hz - 6 - i * 6, al = (0.06 + 0.02 * i + rain * 0.05) * (1 - sky.night * 0.6);
    ctx.globalAlpha = al; for (let k = -4; k <= 4; k++) { const ww = Math.round(w * Math.sqrt(1 - (k / 5) * (k / 5))); fxPx(x - ww / 2, y + k, ww, 1, tint); }
  }
  ctx.globalAlpha = 1;
}

// світло й тіні на землі: тінь маркету від сонця, калюжі з колами, іскри снігу, світло ліхтарів і вікон, тіні хмар
function fxLight() {
  const L = FXP.lv; if (!L || !shop) return;
  const t = FXP.t, cb = LAYOUT.curbY, x0 = worldL(), W = view.w, rain = weather.rain || 0;
  const h = dayNightOn() ? sky.h : 0.9;
  if (h > 0.04 && !build) {                                   // тінь від сонця: довга вранці й увечері, коротка в полудень
    const dir = (dayNightOn() ? state.dayPhase < 0.5 : true) ? 1 : -1, s = Math.max(0, Math.min(1, 1 - h)), len = Math.round(shop.h * 0.5 * (0.15 + 0.85 * s)), al = (0.13 + 0.1 * s) * (1 - sky.night) * (1 - rain * 0.7);
    ctx.globalAlpha = al;
    for (let r = 0; r < 9; r++) { const off = Math.round(dir * len * (r / 8)); fxPx(Math.min(shop.x, shop.x + off), cb + 1 + r, shop.w + Math.abs(off), 1, 'd'); }
    ctx.globalAlpha = 1;
  }
  if (sky.lamp > 0.06) {                                      // вікна маркету кидають теплу пляму на тротуар, ліхтарі — калюжі світла
    const a = Math.min(0.26, sky.lamp * 0.28), g = ctx.createLinearGradient(0, cb, 0, cb + 26); g.addColorStop(0, 'rgba(255,214,130,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,214,130,0)');
    ctx.fillStyle = g; ctx.fillRect(shop.x - 10, cb, shop.w + 20, 26);
    ctx.globalAlpha = Math.min(0.16, sky.lamp * 0.18);
    for (const lx of lampXs) { if (lx < x0 - 20 || lx > x0 + W + 20) continue; for (let k = 0; k < 4; k++) fxPx(lx - 18 + k * 3, cb - 3 + k, 36 - k * 6, 1, '#ffd98a'); for (let k = 3; k >= 0; k--) fxPx(lx - 18 + k * 3, cb + 1 + (3 - k), 36 - k * 6, 1, '#ffd98a'); }
    ctx.globalAlpha = 1;
  }
  if (L >= 2 && sky.night < 0.5 && state.settings.clouds !== false && rain < 0.4) {       // тіні хмар повзуть вулицею
    ctx.globalAlpha = 0.075 * (1 - sky.night * 1.6);
    for (let i = 0; i < 2; i++) { const w = 130 + i * 40, x = ((t * (5 + i * 2) + i * 230) % (W + w * 2)) - w + x0, y = LAYOUT.streetTop + 10 + i * 16; for (let k = -6; k <= 6; k++) { const ww = Math.round(w * Math.sqrt(1 - (k / 7) * (k / 7))); fxPx(x - ww / 2, y + k, ww, 1, 'd'); } }
    ctx.globalAlpha = 1;
  }
  if (rain > 0.15) {                                          // калюжі: відблиск неба й кола від крапель
    const top = LAYOUT.streetTop + 6, hh = worldB() - top - 14, n = L === 1 ? 5 : 9;
    for (let i = 0; i < n; i++) {
      const px = x0 + fxFrac(i, 1) * W, py = top + fxFrac(i, 2) * Math.max(10, hh), w = 22 + Math.round(fxFrac(i, 3) * 26);
      ctx.globalAlpha = 0.5 * Math.min(1, rain * 1.3); fxPx(px - w / 2, py, w, 3, '#8fbde6'); fxPx(px - w / 2 + 2, py - 1, w - 4, 1, '#8fbde6'); fxPx(px - w / 2 + 2, py + 3, w - 4, 1, '#8fbde6');
      ctx.globalAlpha = 0.6 * rain; fxPx(px - w / 4, py, w / 2, 1, '#ffffff'); fxPx(px - w / 3, py + 2, w / 3, 1, '#d8ecff');
      const rr = (t * 1.3 + i * 0.37) % 1, rw = 4 + rr * w * 0.8; ctx.globalAlpha = (1 - rr) * 0.55 * rain; fxPx(px - rw / 2, py + 1, rw, 1, '#ffffff'); fxPx(px - rw / 2 + 1, py - 1, rw - 2, 1, '#ffffff'); fxPx(px - rw / 2 + 1, py + 3, rw - 2, 1, '#ffffff');
    }
    ctx.globalAlpha = 1;
  }
  if (theme.season === 'winter' && rain < 0.2) {              // сніг іскриться на тротуарі
    for (let i = 0; i < (L === 1 ? 14 : 30); i++) { const hs = hash2(i + 9, 41), v = Math.sin(t * 2.2 + (hs % 628) / 100); if (v < 0.86) continue; const x = x0 + fxFrac(i, 7) * W, y = LAYOUT.horizonY + 2 + fxFrac(i, 8) * (cb - LAYOUT.horizonY + 8); fxPx(x, y, 1, 1, '#ffffff'); if (v > 0.95) { fxPx(x - 1, y, 3, 1, '#e8f6ff'); fxPx(x, y - 1, 1, 3, '#e8f6ff'); } }
  }
}

// реакції світу на епоху: промені, прожектори, полярне сяйво, листя й пелюстки, метелики, світлячки, пульс музики, блиски на фасаді
function fxFront() {
  const L = FXP.lv; if (!L) return;
  const C = EPFX[currentEpoch().id] || {}, t = FXP.t, x0 = worldL(), W = view.w, top = -view.offY, hz = LAYOUT.horizonY, rain = weather.rain || 0, day = Math.max(0, 1 - sky.night * 1.4), nightK = Math.max(0, Math.min(1, (sky.night - 0.2) / 0.4));
  if (C.rays && day > 0.15 && sky.h > 0.1) {                  // пасма світла, що тихо дихають
    ctx.fillStyle = C.rays;
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = (0.05 + 0.03 * Math.sin(t * 0.7 + i * 1.7)) * day * (1 - rain); const bx = x0 + W * (0.1 + i * 0.3) + Math.sin(t * 0.3 + i) * 6; for (let y = top; y < hz + 8; y += 3) fxPx(bx + (y - top) * 0.55, y, 12 + (y - top) * 0.04, 3, C.rays); }
  }
  if (C.beams) {                                              // прожектори хитаються
    const ba = 0.1 * (0.5 + 0.5 * Math.max(nightK, 0.5)) * (L === 1 ? 0.8 : 1);
    for (let i = 0; i < (L === 1 ? 2 : 4); i++) {
      const bx = i % 2 ? x0 + W - 14 : x0 + 14, ang = (i % 2 ? -1 : 1) * (0.5 + 0.45 * Math.sin(t * 1.3 + i * 1.9)) - 1.57, len = Math.round(LAYOUT.streetTop - top - 10);
      ctx.globalAlpha = ba + 0.04 * Math.sin(t * 3 + i);
      for (let k = 0; k < len; k += 3) fxPx(bx + Math.cos(ang) * k, LAYOUT.streetTop - 4 + Math.sin(ang) * k, 3 + k * 0.16, 3, C.beams[i % C.beams.length]);
    }
  }
  if (C.aurora && nightK > 0.05) {                            // полярне сяйво ступінчастими смугами
    const step = L === 1 ? 5 : 3, bands = L === 1 ? 2 : 3;
    for (let b = 0; b < bands; b++) for (let x = 0; x < W; x += step) { const y = top + 12 + b * 7 + Math.sin(x * 0.03 + t * 0.6 + b * 1.4) * 6 + Math.sin(x * 0.07 - t) * 2; ctx.globalAlpha = 0.17 * nightK; fxPx(x0 + x, y, step, 7, C.aurora[b % C.aurora.length]); ctx.globalAlpha = 0.08 * nightK; fxPx(x0 + x, y + 7, step, 5, C.aurora[b % C.aurora.length]); }
  }
  if (C.pulse) {                                              // удар музики: коротке світіння всієї сцени
    const ph = (t * C.pulse.hz) % 1, a = Math.pow(1 - ph, 3) * 0.07 * (C.pulse.k || 1) * (0.5 + 0.5 * Math.max(nightK, 0.4));
    ctx.globalAlpha = a; ctx.fillStyle = C.pulse.c; ctx.fillRect(x0, top, W, LAYOUT.streetTop - top + 6);
  }
  for (const p of FXP.falls) {                                // листя, пелюстки, конфеті, блоки, цифрові іскри
    ctx.globalAlpha = 1; const x = Math.round(p.x), y = Math.round(p.y), f = Math.floor(FXP.t * 4 + p.ph) % 2;
    if (p.sq) fxPx(x, y, p.sq, p.sq, p.c); else { fxPx(x, y, p.big ? 3 : 2, f ? 2 : 1, p.c); }
  }
  for (const f of FXP.flies) {
    const x = Math.round(f.x + Math.sin(t * f.sp + f.ph) * 8), y = Math.round(f.y + Math.cos(t * f.sp * 0.8 + f.ph) * 4);
    if (f.b) { const vis = 1 - sky.night * 1.3; if (vis < 0.1) continue; ctx.globalAlpha = Math.min(1, vis); const w = Math.floor(t * 8 + f.ph) % 2; fxPx(x - 2, y - w, 2, 2, f.c); fxPx(x + 1, y - w, 2, 2, f.c); fxPx(x, y, 1, 2, '#3a2418'); }
    else { const vis = Math.max(0.35, sky.night + sky.dusk * 0.6); ctx.globalAlpha = Math.min(1, vis) * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2.4 + f.ph))); fxPx(x, y, 2, 2, f.c); ctx.globalAlpha *= 0.6; fxPx(x - 1, y, 4, 2, '#ffffff'); }
  }
  ctx.globalAlpha = 1;
  if (C.glint && shop && !build && L >= 1) {                  // блиски-зірочки на фасаді й даху
    for (let i = 0; i < (L === 1 ? 4 : 8); i++) {
      const cyc = 3.6, tt = t + i * 0.9 + fxFrac(i, 90) * 3, k = (tt % cyc) / 0.9; if (k > 1) continue;
      const n = Math.floor(tt / cyc), x = shop.x + shop.w * (0.06 + 0.88 * fxFrac(i + n * 8, 91)), y = LAYOUT.curbY - shop.h * (0.1 + 0.88 * fxFrac(i + n * 8, 92)), s = Math.sin(k * Math.PI), r = Math.round(1 + s * 3);
      fxPx(x - r, y, r * 2 + 1, 1, C.glint); fxPx(x, y - r, 1, r * 2 + 1, C.glint); ctx.globalAlpha = 0.5; fxPx(x - 1, y - 1, 3, 3, '#ffffff'); ctx.globalAlpha = 1;
    }
  }
  if (FXP.sweep > 0) {                                        // перехід між епохами: хвиля світла від маркету
    const k = 1 - FXP.sweep, cx = shop ? shop.x + shop.w / 2 : LAYOUT.centerX, rr = k * (W * 0.75);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = FXP.sweep * FXP.sweep * 0.42; ctx.fillStyle = '#fff3c8'; ctx.fillRect(x0, top, W, worldB() - top);
    ctx.globalAlpha = FXP.sweep * 0.7; for (let y = top; y < worldB(); y += 2) { const dy = y - (LAYOUT.curbY - 40), hw = Math.sqrt(Math.max(0, rr * rr - dy * dy * 0.5)); if (hw > 2) { fxPx(cx - hw, y, 3, 2, '#ffffff'); fxPx(cx + hw - 3, y, 3, 2, '#ffffff'); } }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
}

// тексти перемикача (до пакетів мов у 279_*, які копіюють англійську)
translations.uk.swFx = 'Покращені ефекти'; translations.uk.setFxNote = 'Світло, тіні, туман, пелюстки й сяйво епох. Вимкни, якщо гра гальмує.';
translations.en.swFx = 'Enhanced effects'; translations.en.setFxNote = 'Light, shadows, mist, petals and era glow. Turn off if the game feels slow.';

// гості й помічники реагують на епоху: у Диско й Неоні підстрибують у такт, в Аркаді крокують «по кадрах», у Космосі пливуть у слабкій гравітації
function fxBob(seed) {
  if (!FXP.lv) return 0;
  const id = FXP.eid, t = FXP.t, s = (hash2(Math.round(seed), 3) % 628) / 100;
  if (id === 'disco' || id === 'neon') { const ph = (t * (id === 'disco' ? 2 : 1.6) + s * 0.07) % 1; return ph < 0.18 ? 2 : ph < 0.34 ? 1 : 0; }
  if (id === 'arcade') return Math.floor(t * 4 + s) % 2;
  if (id === 'space') return Math.round(1.2 + Math.sin(t * 1.3 + s) * 1.2);
  return 0;
}

// будинки: світлі краї зверху й зліва, тінь під виступами, темніший правий бік (піксель-арт «об'єм» без перемальовування кожної епохи)
function fxHousePass(c) {
  if (state.settings.fxPlus === false) return;
  const y0 = Math.max(0, view.offY + 30), y1 = Math.min(c.height, view.offY + LAYOUT.horizonY), h = y1 - y0, w = c.width;
  if (h < 8) return;
  const g2 = c.getContext('2d'), im = g2.getImageData(0, y0, w, h), d = im.data, src = new Uint8ClampedArray(d);
  const lum = i => 0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2];
  const mix = (i, k) => { if (k > 0) { d[i] += (255 - d[i]) * k; d[i + 1] += (255 - d[i + 1]) * k; d[i + 2] += (255 - d[i + 2]) * k; } else { d[i] *= 1 + k; d[i + 1] *= 1 + k; d[i + 2] *= 1 + k; } };
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = (y * w + x) * 4; if (src[i + 3] < 200) continue;
    const up = i - w * 4, lf = i - 4, rt = i + 4, dn = i + w * 4, L = lum(i);
    if (src[up + 3] < 40) { mix(i, 0.24); continue; }                              // верхній силует
    if (src[lf + 3] < 40) { mix(i, 0.14); continue; }
    if (src[rt + 3] < 40) { mix(i, -0.14); continue; }                             // правий бік у тіні
    const Lu = lum(up), Ll = lum(lf);
    if (Lu - L > 16) mix(i, -0.12);                                                // тінь під карнизом, підвіконням і балконом
    else if (L - Lu > 16 && src[up + 3] > 200) mix(i, 0.07);                       // верхня грань виступу
    if (Ll - L > 20) mix(i, -0.07);                                                // тінь праворуч від світлого елемента
  }
  g2.putImageData(im, 0, y0);
}
