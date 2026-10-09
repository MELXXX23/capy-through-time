//#part 220_events.js
/* =====================================================================
   ПОДІЇ: СВЯТА, РОЗПРОДАЖІ, НЕПРИЄМНОСТІ, МІНІ-ІГРИ
   ===================================================================== */

// Поточна тема сцени: яке свято зараз і які прикраси вмикати
const theme = { key: null, season: 'spring', layerSeason: null, holiday: null, blackFriday: false, decor: new Set(), skyTint: null, lights: ['r', 'y', 'g', 'n', 'p'] };
const snow = [];             // сніжинки
const bats = [];             // кажани
const puddles = [];          // калюжі від протікання даху
let trouble = null;          // неприємність, що триває: { type: 'leak' | 'thief', ... }
let sackDrop = null;         // мішок, який кинув Шнирь після поразки
let eventTimer = 0;
let wheelAnim = null;        // обертання колеса: { t, dur, from, to }
let wheelAngle = 0;
let wheelTexture = null;
let wheelWasReady = null;

/* ---------- Свята ---------- */
function inRange(d, from, to) {
  const v = (d.getMonth() + 1) * 100 + d.getDate();
  const a = from[0] * 100 + from[1], b = to[0] * 100 + to[1];
  return a <= b ? (v >= a && v <= b) : (v >= a || v <= b);   // діапазон може перетинати новий рік
}
function isBlackFriday(d) { return d.getMonth() === 10 && d.getDay() === 5 && d.getDate() + 7 > 30; }
function forcedHoliday() {
  try { return new URLSearchParams(location.search).get('holiday'); } catch (e) { return null; }
}
// Оновлює тему за датою пристрою (або за ?holiday=...). Повертає true, якщо тема змінилась
/* ---------- Анімація переходу на нову пору року (≈2 с, піксельна, кожна під свій настрій) ---------- */
const seasonFx = { on: false, t: 0, dur: 2.1, kind: '', n: [], k: 4 };
function sfxHash(i, j) { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); }
function playSeasonFx(kind) {
  if (!animOn() || !ui.seasonFx) return;
  const cv = ui.seasonFx, k = Math.max(3, Math.round(Math.min(innerWidth, 900) / 150));
  seasonFx.k = k; cv.width = Math.ceil(innerWidth / k); cv.height = Math.ceil(innerHeight / k);
  Object.assign(seasonFx, { on: true, t: 0, kind });
  cv.hidden = false;
  ui.sbTitle.textContent = t('season_' + kind); ui.sbSub.textContent = t('seasonFx_' + kind);
  ui.seasonBanner.className = 's-' + kind; ui.seasonBanner.hidden = false;
  ui.seasonBanner.style.animation = 'none'; void ui.seasonBanner.offsetWidth; ui.seasonBanner.style.animation = '';
  playSfx(kind === 'halloween' ? 'trouble' : 'wheelWin');
}
function updateSeasonFx(dt) {
  if (!seasonFx.on) return;
  seasonFx.t += dt;
  const T = seasonFx.t, D = seasonFx.dur, cv = ui.seasonFx, g = cv.getContext('2d'), W = cv.width, H = cv.height;
  if (T >= D) { seasonFx.on = false; cv.hidden = true; ui.seasonBanner.hidden = true; return; }
  g.clearRect(0, 0, W, H);
  const a = Math.min(1, T / 0.35) * Math.min(1, (D - T) / 0.75);
  const F = (x, y, w, h, c, al) => { g.globalAlpha = al === undefined ? 1 : al; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); g.globalAlpha = 1; };
  const D2 = (cx, cy, r, c, al) => { g.globalAlpha = al; g.fillStyle = c; for (let dy = -r; dy <= r; dy++) { const hf = Math.round(Math.sqrt(r * r + 0.5 - dy * dy)); g.fillRect(Math.round(cx - hf), Math.round(cy + dy), hf * 2 + 1, 1); } g.globalAlpha = 1; };
  const n = Math.max(30, Math.round(W * H / 260));
  const kind = seasonFx.kind;
  const TINT = { winter: '207,232,255', spring: '255,196,224', summer: '255,233,160', autumn: '255,176,96', halloween: '70,34,120' }[kind] || '255,255,255';
  const wp = Math.min(1, T / 0.9);
  if (wp < 1) {                                                                 // кольорова хвиля пробігає екраном зліва направо
    const gx = (W + 120) * wp - 60, gr = g.createLinearGradient(gx - 70, 0, gx + 30, 0);
    gr.addColorStop(0, 'rgba(' + TINT + ',0)'); gr.addColorStop(0.65, 'rgba(' + TINT + ',0.5)'); gr.addColorStop(1, 'rgba(' + TINT + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  const BOKEH = { winter: '#dff1ff', spring: '#ffd0e6', summer: '#fff2a0', autumn: '#ffc080', halloween: '#a070ff' }[kind] || '#fff';
  for (let i = 0; i < 9; i++) {                                                  // м'які відблиски на тлі
    const bx = (sfxHash(i, 40) * W + T * (6 + i * 2)) % W, by = H * (0.12 + 0.7 * sfxHash(i, 41)) + Math.sin(T * 1.5 + i) * 3, br = 5 + 11 * sfxHash(i, 42);
    D2(bx, by, br, BOKEH, 0.09 * a); D2(bx, by, Math.max(2, br - 3), BOKEH, 0.06 * a);
  }
  if (kind === 'winter') {
    F(0, 0, W, H, '#cfe8ff', 0.3 * a);
    const fw = 14 * a;                                                         // іній наповзає з країв
    for (let x = 0; x < W; x++) { const j = fw * (0.55 + 0.45 * sfxHash(x, 1)); F(x, 0, 1, j, '#ffffff', 0.55 * a); F(x, H - j, 1, j, '#ffffff', 0.55 * a); }
    for (let y = 0; y < H; y++) { const j = fw * (0.55 + 0.45 * sfxHash(y, 2)); F(0, y, j, 1, '#ffffff', 0.5 * a); F(W - j, y, j, 1, '#ffffff', 0.5 * a); }
    for (let i = 0; i < n; i++) {                                               // сніжинки
      const sp = 60 + sfxHash(i, 3) * 90, x = sfxHash(i, 4) * W + Math.sin(T * 3 + i) * 3, y = ((T * sp + sfxHash(i, 5) * (H + 6)) % (H + 6)) - 3, big = i % 5 === 0;
      F(x, y, big ? 2 : 1, big ? 2 : 1, '#ffffff', 0.95 * Math.min(1, a * 1.4));
      if (big) { F(x - 1, y, 1, 1, '#ffffff', 0.7 * a); F(x + 2, y, 1, 1, '#ffffff', 0.7 * a); F(x, y - 1, 1, 1, '#ffffff', 0.7 * a); F(x, y + 2, 1, 1, '#ffffff', 0.7 * a); }
    }
    [[3, 3], [W - 4, 3], [3, H - 4], [W - 4, H - 4]].forEach(([x, y], i) => { const r = Math.round(6 * a); F(x - r, y, r * 2 + 1, 1, '#ffffff', 0.9); F(x, y - r, 1, r * 2 + 1, '#ffffff', 0.9); });
  } else if (kind === 'spring') {
    F(0, 0, W, H, '#ffd6f0', 0.16 * a);
    const grow = Math.min(1, T / 0.9);
    for (let x = 0; x < W; x++) {                                               // трава й квіти виростають знизу
      const hh = grow * (5 + sfxHash(x, 6) * 9);
      F(x, H - hh, 1, hh, sfxHash(x, 7) > 0.5 ? '#5fbf6a' : '#3d9a50', 0.9 * Math.min(1, a * 1.3));
      if (sfxHash(x, 8) > 0.9 && grow > 0.85) { const fy = H - hh - 2; F(x - 1, fy, 3, 3, ['#ff8fb4', '#fff08a', '#ffffff'][x % 3], 0.95 * a); F(x, fy + 1, 1, 1, '#f2b84b', 0.95 * a); }
    }
    for (let i = 0; i < n; i++) {                                               // пелюстки несе вітер
      const x = (sfxHash(i, 9) * (W + 20) + T * (30 + sfxHash(i, 10) * 40)) % (W + 20) - 10, y = (sfxHash(i, 11) * H + T * (14 + sfxHash(i, 12) * 22) + Math.sin(T * 4 + i) * 5) % H;
      const f = Math.floor(T * 7 + i) % 2;
      F(x, y, f ? 3 : 2, f ? 2 : 3, ['#ffb3cf', '#ff8fb4', '#ffe0ec'][i % 3], 0.95 * Math.min(1, a * 1.4));
    }
  } else if (kind === 'summer') {
    F(0, 0, W, H, '#ffe9a0', 0.22 * a);
    const ease = 1 - Math.pow(1 - Math.min(1, T / 0.8), 3), cx = W * 0.82, cy = H * 0.14;
    for (let i = 0; i < 9; i++) D2(cx, cy, (10 + i * 7) * (0.4 + 0.6 * ease), i < 2 ? '#ffffff' : '#fff2a0', 0.1 * a + (i < 3 ? 0.08 * a : 0));
    for (let r = 0; r < 14; r++) {                                              // промені обертаються
      const an = r / 14 * Math.PI * 2 + T * 0.5, len = (50 + 40 * (r % 2)) * ease;
      for (let d = 8; d < len; d += 2) F(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 2, 2, '#fff6b0', 0.2 * a * (1 - d / len));
    }
    [[0.3, 5], [0.5, 8], [0.68, 3], [0.85, 6]].forEach(([u, r], i) => D2(cx + (W * 0.5 - cx) * u * 2.2, cy + (H * 0.5 - cy) * u * 2.2, r, ['#ffe08a', '#ff9e5e', '#fff', '#ffd0a0'][i], 0.22 * a));      // відблиски об'єктива
    for (let i = 0; i < 26; i++) { if (Math.floor(T * 5 + i * 1.7) % 3) continue; const x = sfxHash(i, 13) * W, y = sfxHash(i, 14) * H * 0.7; F(x - 1, y, 3, 1, '#fff6b0', 0.85 * a); F(x, y - 1, 1, 3, '#fff6b0', 0.85 * a); }
  } else if (kind === 'autumn') {
    F(0, 0, W, H, '#ffb060', 0.2 * a);
    for (let i = 0; i < 14; i++) { const y = sfxHash(i, 15) * H, x = W + 20 - ((T * (160 + sfxHash(i, 16) * 80) + sfxHash(i, 17) * (W + 60)) % (W + 60)); F(x, y, 12 + (i % 3) * 5, 1, '#ffffff', 0.22 * a); }      // смуги вітру
    for (let i = 0; i < n * 1.2; i++) {                                         // листя летить з вітром
      const sp = 55 + sfxHash(i, 18) * 70, x = W + 10 - ((T * sp + sfxHash(i, 19) * (W + 30)) % (W + 30)), y = (sfxHash(i, 20) * H + T * 34 + Math.sin(T * 4 + i) * 6) % H;
      const f = Math.floor(T * 6 + i) % 2, c = ['#e8863c', '#c4553d', '#f2b84b', '#a8703f'][i % 4];
      F(x, y, f ? 3 : 2, f ? 2 : 3, c, 0.95 * Math.min(1, a * 1.4)); F(x + (f ? 1 : 0), y + (f ? 1 : 0), 1, 1, '#ffe08a', 0.8 * a);
    }
  } else {                                                                      // halloween
    F(0, 0, W, H, '#2b1a4f', 0.5 * a);
    for (let r = 0; r < 12; r++) { const w = (12 - r) * a * 1.2; F(0, r * H / 12, w, H / 12 + 1, '#ff8a2a', 0.02 * (12 - r) * (0.6 + 0.4 * Math.sin(T * 8))); F(W - w, r * H / 12, w, H / 12 + 1, '#ff8a2a', 0.02 * (12 - r)); }
    if (T < 0.3) F(0, 0, W, H, '#ffffff', 0.75 * (1 - T / 0.3));                // грозовий спалах на початку
    for (let i = 0; i < 6; i++) {                                               // привиди пливуть угору
      const x = sfxHash(i, 21) * (W - 12) + Math.sin(T * 3 + i * 2) * 4, y = H + 12 - ((T * (22 + sfxHash(i, 22) * 22) + sfxHash(i, 23) * H * 0.6) % (H + 24));
      F(x + 1, y, 6, 1, '#ffffff', 0.55 * a); F(x, y + 1, 8, 7, '#ffffff', 0.55 * a); F(x + 2, y + 3, 1, 2, '#2b1a4f', 0.9 * a); F(x + 5, y + 3, 1, 2, '#2b1a4f', 0.9 * a);
      const wv = Math.floor(T * 6 + i) % 2; F(x + (wv ? 0 : 1), y + 8, 2, 1, '#ffffff', 0.55 * a); F(x + 3 + wv, y + 8, 2, 1, '#ffffff', 0.55 * a); F(x + 6 - (wv ? 0 : 1), y + 8, 2, 1, '#ffffff', 0.55 * a);
    }
    for (let i = 0; i < 9; i++) {                                               // кажани перелітають екран
      const x = W + 12 - ((T * (60 + sfxHash(i, 24) * 50) + sfxHash(i, 25) * (W + 40)) % (W + 40)), y = H * (0.08 + 0.6 * sfxHash(i, 26)) + Math.sin(T * 8 + i) * 5, up = Math.floor(T * 10 + i) % 2;
      F(x, y, 3, 2, '#140e0b', a); F(x - 1, y - 1, 1, 1, '#140e0b', a); F(x + 3, y - 1, 1, 1, '#140e0b', a);
      if (up) { F(x - 4, y - 2, 4, 1, '#140e0b', a); F(x + 3, y - 2, 4, 1, '#140e0b', a); F(x - 2, y - 1, 2, 1, '#140e0b', a); F(x + 3, y - 1, 2, 1, '#140e0b', a); }
      else { F(x - 4, y + 1, 4, 1, '#140e0b', a); F(x + 3, y + 1, 4, 1, '#140e0b', a); F(x - 2, y, 2, 1, '#140e0b', a); F(x + 3, y, 2, 1, '#140e0b', a); }
      F(x, y, 1, 1, '#ff8a2a', a); F(x + 2, y, 1, 1, '#ff8a2a', a);
    }
  }
  const grow = Math.min(1, T / 0.8);                                            // смуга біля землі для кожної пори
  if (kind === 'winter') for (let x = 0; x < W; x++) { const h = (2 + 4 * sfxHash(x, 50)) * grow; F(x, H - h, 1, h, '#ffffff', 0.85 * a); F(x, H - h, 1, 1, '#cfe8ff', 0.9 * a); }
  else if (kind === 'summer') for (let k = 0; k < 7; k++) F(0, H - 5 - k * 5 + Math.round(Math.sin(T * 6 + k) * 1.5), W, 1, '#fff6b0', 0.13 * a);
  else if (kind === 'autumn') for (let x = 0; x < W; x++) { const h = (2 + 4 * sfxHash(x, 51)) * grow; F(x, H - h, 1, h, ['#c4553d', '#e8863c', '#f2b84b'][x % 3], 0.9 * a); }
  else if (kind === 'halloween') for (let x = 0; x < W; x++) { const h = 4 + 3 * Math.sin(x * 0.15 + T * 2) + 2 * Math.sin(x * 0.4 - T); F(x, H - h, 1, h, '#dcd0ff', 0.3 * a); }
}
// Віконце, коли відкрились пори року (після 2-ї епохи)
function showSeasonsIntro() {
  state.seasonsIntro = 1; saveGame();
  ui.siTitle.textContent = t('seasonIntroTitle'); ui.siText.textContent = t('seasonIntroText');
  ui.siGo.textContent = t('seasonIntroGo'); ui.siLater.textContent = t('seasonIntroLater');
  const g = ui.siIcon.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 24, 24); g.drawImage(tabGlyph('seasons'), 0, 0);
  ui.siModal.hidden = false; playSfx('wheelWin');
}
function updateSeasonsIntro() {
  if (state.seasonsIntro || state.epoch < 2) return;
  if (dialog.active || epochIntro.active || build || !ui.modal.hidden || !ui.wheelModal.hidden || !ui.letterModal.hidden || !ui.circusModal.hidden || !ui.lootModal.hidden) return;
  showSeasonsIntro();
}
function updateTheme() {
  const now = new Date(), forced = forcedHoliday();
  let holiday = null, bf = false;
  if (forced === 'blackfriday') bf = true;
  else if (forced) holiday = HOLIDAYS.find(h => h.id === forced) || null;
  else { holiday = HOLIDAYS.find(h => inRange(now, h.from, h.to)) || null; bf = isBlackFriday(now); }
  const season = seasonNow();
  const auto = state.settings.season === 'auto';
  const key = (holiday ? holiday.id : '') + '|' + bf + '|' + (viewEpoch() % EPOCHS.length) + '|' + season;
  if (theme.key === key) return false;
  theme.key = key;
  if (holiday) state.stats.holidaysSeen |= (1 << HOLIDAYS.indexOf(holiday));
  if (bf) state.stats.holidaysSeen |= 1 << 15;
  theme.holiday = holiday;
  theme.blackFriday = bf;
  // прикраси свята за датою малюємо лише в режимі «Авто»; якщо пору року обрано вручну — діють її прикраси
  const seasonDecor = { winter: ['snow'], halloween: ['pumpkins', 'bats', 'witchhats'], autumn: ['autumnleaves'], spring: ['petals'], summer: ['heat'] }[season] || [];
  theme.decor = new Set([...(auto && holiday ? holiday.decor : []), ...seasonDecor, ...(bf ? BLACK_FRIDAY.decor : [])]);
  theme.skyTint = bf ? BLACK_FRIDAY.skyTint : (auto && holiday && holiday.skyTint) || (season === 'halloween' ? { color: 'V', alpha: 0.5 } : currentEpoch().tint);
  theme.lights = bf ? BLACK_FRIDAY.lights : ((holiday && auto && holiday.lights) || (season === 'halloween' ? ['o', 'u'] : ['r', 'y', 'g', 'n', 'p']));
  theme.season = season;
  if (theme.layerSeason !== season) {
    const prevSeason = theme.layerSeason;
    theme.layerSeason = season;
    if (prevSeason && layoutReady) playSeasonFx(season);
    weather.target = 0; weather.timer = rand(12, 35);
    if (layoutReady) { groundLayer = buildGroundLayer(); seedClouds(); seedBirds(); seedBenches(); if (shop) rebuildShop(true); }
  }   // дерева, сніг на дахах, прикраси Хелловіну
  resetEpochFx();
  resetThemeFx();
  return true;
}
// Сніг і кажани розсипаються по всій ширині світу
function resetThemeFx() {
  snow.length = 0; bats.length = 0;
  const area = (view.w * view.h) / (320 * 180);
  if (theme.decor.has('snow') && animOn()) for (let i = 0; i < Math.round(CONFIG.SNOW_FLAKES * area); i++) snow.push({ x: rand(worldL(), worldR()), y: rand(-view.offY, worldB()), vy: rand(10, 26), ph: rand(0, 6.3), big: Math.random() < 0.25 });
  if (theme.decor.has('bats') && animOn()) for (let i = 0; i < Math.round(CONFIG.BATS * Math.max(1, view.w / 320)); i++) bats.push({ x: rand(worldL(), worldR()), y: rand(14 - view.offY, 70), vx: rand(14, 26) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6.3) });
}
function holidayGlobalBonus() { return theme.holiday && theme.holiday.bonus.global ? theme.holiday.bonus.global : 0; }
function holidayDeptBonus(i) { return (theme.holiday && theme.holiday.bonus.depts && theme.holiday.bonus.depts[i]) || 0; }
function secondsToMidnight() {
  const n = new Date();
  return Math.max(0, (new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1) - n) / 1000);
}
function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  const p = n => String(n).padStart(2, '0');
  return h > 0 ? h + ':' + p(m) + ':' + p(s) : m + ':' + p(s);
}

/* ---------- Активні бусти (іконки з таймерами) і банер ---------- */
function updateBoostsUI() {
  const now = Date.now(), power = eventPowerMult(), items = [];
  const ev = state.events;
  const bannerBusy = !!ghostHunt || !!(trouble && ((trouble.type === 'thief' && trouble.state === 'run') || trouble.type === 'leak'));   // інакше цю подію вже показує банер — не дублюємо
  if (!bannerBusy) { /* банер вище покаже розпродаж / чорну п'ятницю */ }
  else if (theme.blackFriday) items.push({ cls: 'dark', icon: BLACK_FRIDAY.icon, text: t('boost_bf', fmt(1 + (CONFIG.BLACK_FRIDAY_MULT - 1) * power, 2)) });
  else if (ev.saleUntil > now) items.push({ icon: '🏷️', text: t('boost_sale', fmt(1 + (CONFIG.SALE_MULT - 1) * power, 2)) + ' ' + fmtTime((ev.saleUntil - now) / 1000) });
  if (theme.holiday) {
    const h = theme.holiday;
    let bonus = '';
    if (h.bonus.global) bonus = t('hb_global', Math.round(h.bonus.global * power * 100));
    else if (h.bonus.depts) bonus = Object.keys(h.bonus.depts).map(i => t('hb_dept', deptName(i), fmt(1 + h.bonus.depts[i] * power, 2))).join(', ');
    items.push({ icon: h.icon, text: t('holiday_' + h.id) + ': ' + bonus });
  }
  // під рахунком завжди: перша рамка — баланс, біля неї — епоха
  items.unshift({ cls: 'quiet', icon: '🕰️', text: t('epochViewing', t('epoch_' + (viewEpoch() % EPOCHS.length))) });
  if (ev.incomeBoostUntil > now) items.push({ icon: '⚡', text: t('boost_income', ev.incomeBoostMult) + ' ' + fmtTime((ev.incomeBoostUntil - now) / 1000) });
  if (ev.tapBoostUntil > now) items.push({ icon: '👆', text: t('boost_tap', ev.tapBoostMult) + ' ' + fmtTime((ev.tapBoostUntil - now) / 1000) });
   // скільки зібрано до додаткового оберту барабана (самі привиди й кристали лишаються)
  if (trouble && trouble.type === 'leak') items.push({ cls: 'bad', icon: '💧', text: t('boost_leak', Math.round(CONFIG.LEAK_INCOME_PENALTY * 100)) });
  const sig = items.map(i => i.icon + i.text).join('|');
  if (uiCache.boostSig === sig) return;
  uiCache.boostSig = sig;
  uiCache.bannerSig = null;                                     // рамки змінились — банер підлаштується під них
  ui.boosts.innerHTML = '';
  items.forEach(it => {
    const chip = document.createElement('span');
    chip.className = 'chip' + (it.cls ? ' ' + it.cls : '');
    const ico = document.createElement('span'); ico.className = 'ico'; ico.textContent = it.icon;
    const tx = document.createElement('span'); tx.textContent = it.text;
    chip.append(ico, tx);
    ui.boosts.appendChild(chip);
  });
}
function updateBanner() {
  const now = Date.now(), power = eventPowerMult(), ev = state.events;
  let kind = '', text = '';
  if (ghostHunt) {
    kind = 'game'; text = ghostHunt.crt < 0 ? t('banner_ghost', ghostHunt.caught, ghostHunt.total, Math.max(0, Math.ceil(ghostHunt.dur - ghostHunt.t))) : t('banner_crt', EPOCH_CREATURES[ghostHunt.crt].icon, t('crt_' + ghostHunt.crt), ghostHunt.caught, ghostHunt.total, Math.max(0, Math.ceil(ghostHunt.dur - ghostHunt.t)));
  } else if (trouble && trouble.type === 'thief' && trouble.state === 'run') {
    kind = 'game'; text = t('banner_thief', trouble.hits, CONFIG.RACCOON_HITS, Math.max(0, Math.ceil(CONFIG.RACCOON_SECONDS - trouble.t)));
  } else if (trouble && trouble.type === 'leak') {
    kind = 'leak'; text = t('banner_leak', CONFIG.LEAK_PUDDLES - puddles.length, CONFIG.LEAK_PUDDLES);
  } else if (theme.blackFriday) {
    kind = 'bf'; text = t('banner_bf', fmt(1 + (CONFIG.BLACK_FRIDAY_MULT - 1) * power, 2), fmtTime(secondsToMidnight()));
  } else if (ev.saleUntil > now) {
    kind = 'sale'; text = t('banner_sale', fmt(1 + (CONFIG.SALE_MULT - 1) * power, 2), fmtTime((ev.saleUntil - now) / 1000));
  }
  const sig = kind + '|' + text;
  if (uiCache.bannerSig === sig) return;
  uiCache.bannerSig = sig;
  ui.eventBanner.hidden = !kind;
  ui.eventBanner.className = kind;
  ui.eventBanner.textContent = text;
  if (kind) placeBanner();
}
function placeBanner() {                                       // банер стоїть просто під рамками з балансом і бустами (на телефоні їх може бути кілька рядків)
  const p = ui.eventBanner.offsetParent;
  if (!p) return;
  ui.eventBanner.style.top = Math.max(60, Math.round(ui.boosts.getBoundingClientRect().bottom - p.getBoundingClientRect().top + 8)) + 'px';
}

/* ---------- Розпродажі ---------- */
function scheduleSale(now) { state.events.nextSale = now + rand(CONFIG.SALE_MIN_MINUTES, CONFIG.SALE_MAX_MINUTES) * 60000 * (1 - 0.05 * wsLevel('salesFreq')) * evMult(); }
function startSale(now) {
  state.events.saleUntil = now + (CONFIG.SALE_SECONDS + 20 * wsLevel('saleLength')) * 1000;
  scheduleSale(now);
  recalcIncome();
  playSfx('sale');
  showToast(t('saleStart', fmt(1 + (CONFIG.SALE_MULT - 1) * eventPowerMult(), 2)), 'big');
}

/* ---------- Неприємності ---------- */
function scheduleTrouble(now) { state.events.nextTrouble = now + rand(CONFIG.TROUBLE_MIN_MINUTES, CONFIG.TROUBLE_MAX_MINUTES) * 60000 * evMult(); }
// Після зміни частоти подій: наступні події переносимо на новий розклад
function rescheduleEvents() {
  const now = Date.now(), c = state.circus;
  scheduleSale(now); scheduleTrouble(now);
  nextGhostAt = now + CONFIG.CREATURE_INTERVAL_SECONDS * 1000 * evMult();
  if (c.phase === 0) c.next = now + CONFIG.DAY_SECONDS * 1000 * evMult();
}
function startTrouble(now) {
  scheduleTrouble(now);
  if (Math.random() < 0.5) {
    // єнот; Тоня може прогнати його ще біля входу
    if (Math.random() > thiefChanceMult()) {
      const a = actors.find(x => TEAM[x.i].id === 'tonya');
      if (a) { a.hop = 1; showBubble('t' + a.i, t('team_tonya_say_1'), a.x, a.y - 19, () => ({ x: a.x, y: a.y - 19 })); }
      showToast(t('tonyaScared'), 'good');
      return;
    }
    startRaccoon();
  } else {
    startLeak();
  }
}

// --- Протікання даху ---
function startLeak() {
  trouble = { type: 'leak', kriaTimer: 0 };
  puddles.length = 0;
  const minX = visL() + 24, maxX = visR() - 24;
  for (let tries = 0; puddles.length < CONFIG.LEAK_PUDDLES && tries < 100; tries++) {
    const p = { x: Math.round(rand(minX, maxX)), y: Math.round(rand(150, worldB() - 6)), age: rand(0, 3) };
    if (puddles.every(q => Math.abs(q.x - p.x) > 26 || Math.abs(q.y - p.y) > 9)) puddles.push(p);
  }
  recalcIncome();
  playSfx('leak');
  showToast(t('leakStart'), 'bad');
}
function removePuddle(i) {
  const p = puddles.splice(i, 1)[0];
  state.stats.puddlesFixed++;
  playSfx('splash');
  for (let k = 0; k < 6; k++) fx.sparks.push({ x: p.x, y: p.y, vx: rand(-40, 40), vy: rand(-60, -20), age: 0, life: rand(0.3, 0.5), col: k % 2 ? 's' : 'S' });
  if (!puddles.length) {
    trouble = null;
    recalcIncome();
    showToast(t('leakFixed'), 'good');
  }
  updateUI();
}

// --- Єнот Шнирь: міні-гра «Впіймай єнота» ---
function startRaccoon() {
  const minX = visL() + 24, maxX = visR() - 24;
  const side = Math.random() < 0.5 ? minX : maxX;
  trouble = { type: 'thief', state: 'run', t: 0, hits: 0, x: side, y: rand(148, worldB() - 8), vx: 0, vy: 0, dirT: 0, flash: 0, hop: 0, exitDir: 1 };
  showBubble('shnyr', t('shnyrSay_' + Math.floor(Math.random() * 3)), trouble.x, trouble.y - 26, () => trouble ? { x: trouble.x, y: trouble.y - 26 } : { x: -99999, y: 0 });
  playSfx('raccoon');
  showToast(t('raccoonStart'), 'bad');
}
function hitRaccoon() {
  const r = trouble;
  r.hits++; r.flash = 0.35; r.hop = 1;
  playSfx('hit');
  for (let k = 0; k < 6; k++) fx.sparks.push({ x: r.x, y: r.y - 8, vx: rand(-60, 60), vy: rand(-70, 10), age: 0, life: rand(0.25, 0.4), col: k % 2 ? 'y' : 'w' });
  showBubble('shnyr', t('shnyrOuch_' + Math.floor(Math.random() * 3)), r.x, r.y - 26, () => trouble ? { x: trouble.x, y: trouble.y - 26 } : { x: -99999, y: 0 });
  r.dirT = 0;     // одразу змінює напрям
  if (r.hits >= CONFIG.RACCOON_HITS) winRaccoon();
}
function winRaccoon() {
  const r = trouble;
  const reward = Math.floor(Math.max(tapValue() * 10, state.cps * CONFIG.RACCOON_REWARD_MINUTES * 60));
  state.coins += reward; state.totalEarned += reward;
  state.stats.raccoonsCaught++;
  for (let k = 0; k < 12; k++) fx.coins.push({ x: r.x + rand(-8, 8), y: r.y - 10, vx: rand(-60, 60), vy: rand(-140, -60), age: 0, life: rand(0.8, 1.2), spin: rand(0, 4) });
  sackDrop = { x: r.x + 6, y: r.y, t: 0 };
  r.state = 'exit'; r.exitDir = r.x < 160 ? -1 : 1; r.hasSack = false;
  playSfx('caught');
  showToast(t('raccoonWin', fmt(reward)), 'big');
  updateUI();
}
function loseRaccoon() {
  const r = trouble;
  const steal = state.story.shnyrFriend ? 0 : Math.floor(Math.min(state.coins * CONFIG.RACCOON_STEAL_SHARE * (1 - 0.2 * wsLevel('thiefLess')), state.cps * CONFIG.RACCOON_STEAL_MAX_MINUTES * 60));
  if (steal >= 1) {
    state.coins -= steal;
    state.stats.raccoonsLost++;
    playSfx('lose');
    showToast(t('raccoonLose', fmt(steal)), 'bad');
  } else {
    showToast(t('raccoonFriend'), 'good');
  }
  r.state = 'exit'; r.exitDir = r.x < 160 ? -1 : 1; r.hasSack = true;
  updateUI();
}
function updateTrouble(dt) {
  if (sackDrop) { sackDrop.t += dt; if (sackDrop.t > 3) sackDrop = null; }
  if (!trouble) return;
  puddles.forEach(p => { p.age += dt; });
  if (trouble.type === 'leak') {
    // Качка Кря сама прибирає калюжі
    if (teamLevelOf('kria') > 0 && puddles.length) {
      trouble.kriaTimer += dt;
      if (trouble.kriaTimer >= CONFIG.KRIA_CLEAN_SECONDS / fixSpeedMult()) {
        trouble.kriaTimer = 0;
        const a = actors.find(x => TEAM[x.i].id === 'kria');
        if (a) { a.hop = 1; showBubble('t' + a.i, t('kriaMop'), a.x, a.y - 19, () => ({ x: a.x, y: a.y - 19 })); }
        removePuddle(Math.floor(Math.random() * puddles.length));
      }
    }
    return;
  }
  const r = trouble;
  r.t += dt;
  r.flash = Math.max(0, r.flash - dt);
  r.hop = Math.max(0, r.hop - dt * 4);
  if (r.state === 'run') {
    r.dirT -= dt;
    if (r.dirT <= 0) {
      r.dirT = rand(0.5, 1.1);
      const a = rand(0, Math.PI * 2), sp = 55 + r.hits * 16;
      r.vx = Math.cos(a) * sp; r.vy = Math.sin(a) * sp * 0.5;
    }
    r.x += r.vx * dt; r.y += r.vy * dt;
    const minX = visL() + 14, maxX = visR() - 14;
    if (r.x < minX) { r.x = minX; r.vx = Math.abs(r.vx); }
    if (r.x > maxX) { r.x = maxX; r.vx = -Math.abs(r.vx); }
    if (r.y < 146) { r.y = 146; r.vy = Math.abs(r.vy); }
    if (r.y > worldB() - 6) { r.y = worldB() - 6; r.vy = -Math.abs(r.vy); }
    if (r.hits < CONFIG.RACCOON_HITS && r.t >= CONFIG.RACCOON_SECONDS) loseRaccoon();
  } else {   // тікає за межі екрана
    r.x += r.exitDir * 120 * dt;
    r.vx = r.exitDir * 120;
    if (r.x < worldL() - 24 || r.x > worldR() + 24) { trouble = null; }
  }
}
// Тап по калюжі чи єнотові; true — тап «з'їдено» і по магазину не рахується
function handleEventTap(p) {
  if (!trouble) return false;
  if (trouble.type === 'thief' && trouble.state === 'run') {
    if (Math.abs(p.x - trouble.x) <= 17 && p.y >= trouble.y - 28 && p.y <= trouble.y + 5) { hitRaccoon(); return true; }
  } else if (trouble.type === 'leak') {
    for (let i = 0; i < puddles.length; i++) {
      if (Math.abs(p.x - puddles[i].x) <= 13 && Math.abs(p.y - puddles[i].y) <= 9) { removePuddle(i); return true; }
    }
  }
  return false;
}

/* ---------- Малювання подій і прикрас ---------- */
function drawPuddle(p) {
  for (let dy = -3; dy <= 3; dy++) {
    const half = Math.round(10 * Math.sqrt(Math.max(0, 1 - Math.pow(dy / 3.6, 2))));
    R(ctx, p.x - half, p.y + dy, half * 2 + 1, 1, dy === -3 ? 'S' : 's');
  }
  R(ctx, p.x - 5, p.y - 1, 3, 1, 'S');
  const rr = Math.floor((p.age * 7) % 8);
  if (rr > 1) { R(ctx, p.x - rr, p.y, 1, 1, 'w'); R(ctx, p.x + rr, p.y, 1, 1, 'w'); }
  const dropPhase = (p.age * 34) % 30;                    // крапля з даху
  if (dropPhase < 24) R(ctx, p.x, Math.round(p.y - 28 + dropPhase), 1, 3, 'S');
}
function drawRaccoon() {
  const r = trouble;
  if (r.flash > 0 && Math.floor(r.flash * 20) % 2) return;
  const step = Math.floor(r.t * 8) % 2;
  const hop = Math.round(Math.sin(Math.min(1, r.hop) * Math.PI) * 4);
  const x = Math.round(r.x), y = Math.round(r.y);
  ctx.globalAlpha = 0.22; R(ctx, x - 8, y, 16, 2, 'd'); ctx.globalAlpha = 1;
  const face = r.vx < 0;
  drawSprite(ctx, 'npc_shnyr', x - 8, y - 16 - step - hop, { flip: step === 1, sx: 1.35, sy: 1.35 });
  if (r.hasSack !== false) {   // мішок із монетами
    const sx = face ? x - 19 : x + 10, sy0 = y - 19 - step - hop;
    R(ctx, sx, sy0, 9, 11, 'l'); R(ctx, sx, sy0, 9, 1, 'c');
    R(ctx, sx + 2, sy0 - 2, 5, 2, 'd'); R(ctx, sx + 3, sy0 + 5, 3, 3, 'h');
  }
}
function drawSackDrop() {
  const s = sackDrop;
  const x = Math.round(s.x), y = Math.round(s.y);
  ctx.globalAlpha = Math.min(1, 3 - s.t) ;
  R(ctx, x - 5, y - 8, 10, 8, 'l'); R(ctx, x - 5, y - 8, 10, 1, 'c'); R(ctx, x - 2, y - 10, 4, 2, 'd'); R(ctx, x - 1, y - 5, 2, 3, 'h');
  R(ctx, x + 6, y - 2, 2, 2, 'h'); R(ctx, x - 8, y - 1, 2, 2, 'h');
  ctx.globalAlpha = 1;
}

// Капелюх на голові звірятка (Новий рік — шапка Діда Мороза, Хелловін — капелюх чарівниці)
const HAT_COLORS = ['u', 'k', 'o', 'g', 'r', 'n', 'p'];     // кольори хелловінських шапочок
function drawHat(cx, ht, seed) {
  if (theme.decor.has('hats')) {
    R(ctx, cx - 4, ht - 1, 9, 2, 'w'); R(ctx, cx - 3, ht - 3, 7, 2, 'r'); R(ctx, cx - 2, ht - 5, 5, 2, 'r'); R(ctx, cx - 1, ht - 7, 3, 2, 'r'); R(ctx, cx + 1, ht - 9, 3, 2, 'w');
  } else if (theme.decor.has('witchhats')) {
    // у кожного звірятка своя шапочка: 6 форм × 7 кольорів, стиль той самий
    const s = Math.abs(seed | 0), shape = s % 6, c = HAT_COLORS[(s * 2 + 1) % 7];
    const band = (c === 'o' || c === 'p' || c === 'g') ? 'k' : 'h';
    switch (shape) {
      case 0:                                                  // класичний капелюх чарівниці
        R(ctx, cx - 5, ht - 1, 11, 2, c); R(ctx, cx - 3, ht - 4, 7, 3, c); R(ctx, cx - 3, ht - 3, 7, 1, band);
        R(ctx, cx - 2, ht - 6, 5, 2, c); R(ctx, cx - 1, ht - 8, 3, 2, c); R(ctx, cx + 1, ht - 10, 2, 2, c); break;
      case 1:                                                  // високий чарівничий, кінчик зігнутий, із зіркою
        R(ctx, cx - 4, ht - 1, 9, 2, c); R(ctx, cx - 3, ht - 4, 7, 3, c); R(ctx, cx - 3, ht - 2, 7, 1, band);
        R(ctx, cx - 2, ht - 7, 5, 3, c); R(ctx, cx - 1, ht - 10, 3, 3, c); R(ctx, cx, ht - 12, 3, 2, c); R(ctx, cx + 2, ht - 11, 2, 2, c);
        R(ctx, cx - 1, ht - 6, 1, 1, 'y'); R(ctx, cx, ht - 5, 1, 1, 'y'); break;
      case 2:                                                  // циліндр
        R(ctx, cx - 5, ht - 1, 11, 2, c); R(ctx, cx - 3, ht - 8, 7, 7, c); R(ctx, cx - 3, ht - 3, 7, 1, band); R(ctx, cx - 3, ht - 8, 1, 7, 'd');
        R(ctx, cx - 2, ht - 8, 5, 1, 'd'); R(ctx, cx + 1, ht - 7, 1, 3, 'w'); break;
      case 3:                                                  // шапочка-гарбузик
        R(ctx, cx - 4, ht - 2, 9, 2, c); R(ctx, cx - 5, ht - 4, 11, 2, c); R(ctx, cx - 3, ht - 6, 7, 2, c);
        R(ctx, cx - 1, ht - 4, 1, 3, band); R(ctx, cx + 2, ht - 4, 1, 3, band); R(ctx, cx - 1, ht - 8, 3, 2, 'g'); R(ctx, cx + 1, ht - 9, 2, 1, 'g'); break;
      case 4:                                                  // ковпак блазня зі звисаючим кінчиком і помпоном
        R(ctx, cx - 4, ht - 1, 9, 2, band); R(ctx, cx - 3, ht - 3, 7, 2, c); R(ctx, cx - 2, ht - 5, 5, 2, c); R(ctx, cx - 1, ht - 7, 4, 2, c);
        R(ctx, cx + 2, ht - 8, 3, 2, c); R(ctx, cx + 4, ht - 7, 2, 3, c); R(ctx, cx + 4, ht - 4, 2, 2, 'w'); break;
      default:                                                 // обідок із вушками (кіт / кажан)
        R(ctx, cx - 4, ht - 1, 9, 2, c);
        R(ctx, cx - 4, ht - 4, 3, 3, c); R(ctx, cx - 4, ht - 6, 2, 2, c); R(ctx, cx - 3, ht - 3, 1, 2, 'q');
        R(ctx, cx + 2, ht - 4, 3, 3, c); R(ctx, cx + 3, ht - 6, 2, 2, c); R(ctx, cx + 3, ht - 3, 1, 2, 'q'); break;
    }
  }
}
function hasHats() { return theme.decor.has('hats') || theme.decor.has('witchhats'); }

// Прикраси ПЕРЕД землею: затемнення неба й кажани
function drawDecorBack() {
  if (theme.skyTint) { ctx.globalAlpha = theme.skyTint.alpha; R(ctx, worldL(), -view.offY, view.w, LAYOUT.horizonY + view.offY, theme.skyTint.color); ctx.globalAlpha = 1; }
  bats.forEach(b => {
    const flap = Math.sin(animClock * 14 + b.ph) > 0;
    const x = Math.round(b.x), y = Math.round(b.y + Math.sin(animClock * 2 + b.ph) * 4);
    R(ctx, x - 1, y, 3, 2, 'k'); R(ctx, x - 1, y - 1, 1, 1, 'k'); R(ctx, x + 1, y - 1, 1, 1, 'k');
    if (flap) { R(ctx, x - 5, y - 2, 4, 1, 'k'); R(ctx, x + 2, y - 2, 4, 1, 'k'); R(ctx, x - 6, y - 3, 1, 1, 'k'); R(ctx, x + 6, y - 3, 1, 1, 'k'); }
    else { R(ctx, x - 5, y + 1, 4, 1, 'k'); R(ctx, x + 2, y + 1, 4, 1, 'k'); R(ctx, x - 6, y + 2, 1, 1, 'k'); R(ctx, x + 6, y + 2, 1, 1, 'k'); }
  });
}
// Легке затемнення над будинками та землею (щоб вечірня тема була цілісною)
function drawDecorDusk() {
  if (!theme.skyTint) return;
  const y0 = theme.skyTint.alpha > 0.3 ? -view.offY : 40;                // сильна тема (Хелловін, Чорна п'ятниця) затемнює й верх неба — без різкої смуги
  ctx.globalAlpha = theme.skyTint.alpha * 0.55;
  R(ctx, worldL(), y0, view.w, worldB() - y0, theme.skyTint.color);
  ctx.globalAlpha = 1;
}

function drawTree(x, base) {
  R(ctx, x - 2, base - 4, 4, 4, 'b');
  const tier = (top, h, halfw) => {
    for (let r = 0; r < h; r++) {
      const half = Math.max(1, Math.round(halfw * (r + 1) / h));
      R(ctx, x - half, top + r, half * 2, 1, 'g');
      R(ctx, x - half, top + r, 2, 1, 'G'); R(ctx, x + half - 2, top + r, 2, 1, 'G');
    }
  };
  tier(base - 14, 10, 13); tier(base - 22, 10, 10); tier(base - 30, 10, 7);
  const cols = ['r', 'y', 'p', 'n', 'w'];
  [[-8, -7], [6, -8], [-2, -11], [9, -5], [-5, -17], [4, -19], [-1, -26], [-12, -5]].forEach(([ox, oy], k) => {
    R(ctx, x + ox, base + oy, 2, 2, cols[(k + Math.floor(animClock * 2)) % cols.length]);
  });
  if (Math.floor(animClock * 3) % 2) R(ctx, x - 2, base - 35, 5, 5, 'y'); else R(ctx, x - 1, base - 34, 3, 3, 'y');
}
function drawPumpkin(x, base) {
  const glow = Math.floor(animClock * 3 + x) % 4 === 0 ? 'h' : 'y';
  disc(ctx, x, base - 5, 6, 'o');
  R(ctx, x - 6, base - 6, 1, 3, 'r'); R(ctx, x + 6, base - 6, 1, 3, 'r'); R(ctx, x, base - 11, 1, 12, 'r');
  R(ctx, x - 1, base - 12, 3, 3, 'g');
  R(ctx, x - 4, base - 7, 3, 2, glow); R(ctx, x + 2, base - 7, 3, 2, glow);
  R(ctx, x - 3, base - 3, 7, 1, glow); R(ctx, x - 2, base - 2, 1, 1, glow); R(ctx, x + 2, base - 2, 1, 1, glow);
}
function drawBalloon(x, y, col) {
  disc(ctx, x, y, 5, col);
  R(ctx, x - 2, y - 3, 2, 2, col === 'k' ? 'e' : 'w');
  R(ctx, x, y + 6, 1, 12, 'h');
}
// Гірлянда під навісом магазину
function drawGarland() {
  const y0 = shop.y + shop.h - 39 + 12;
  for (let x = shop.x + 2; x < shop.x + shop.w - 2; x++) {
    const sag = Math.round(3 * Math.sin(((x - shop.x) % 22) / 22 * Math.PI));
    R(ctx, x, y0 + sag, 1, 1, 'd');
    if ((x - shop.x) % 5 === 2) {
      const col = theme.lights[(Math.floor((x - shop.x) / 5) + Math.floor(animClock * 2)) % theme.lights.length];
      R(ctx, x, y0 + sag + 1, 2, 2, col);
    }
  }
}

// Прикраси ПІСЛЯ магазину (малюються до звіряток — стоять на землі)
function drawDecorGround() {
  if (build) return;
  if (theme.decor.has('tree')) drawTree(Math.max(18, shop.x - 30), LAYOUT.curbY + 2);
  if (theme.decor.has('pumpkins')) {
    drawPumpkin(shop.x - 8, LAYOUT.curbY + 5);
    drawPumpkin(shop.x + shop.w + 8, LAYOUT.curbY + 5);
    drawPumpkin(Math.min(300, shop.x + shop.w + 40), LAYOUT.curbY + 7);
  }
  drawStreetGarlands();
  if (theme.decor.has('garlands')) drawGarland();
  if (theme.decor.has('balloons')) {
    const bob = Math.round(Math.sin(animClock * 1.5) * 2);
    drawBalloon(shop.x + 6, shop.y - 10 + bob, 'k');
    drawBalloon(shop.x + shop.w - 6, shop.y - 12 - bob, 'h');
    drawBalloon(shop.x + 18, shop.y - 6 - bob, 'h');
  }
}
// Сніг, що падає, — поверх усього
function drawSnow() {
  if (!animOn()) return;
  snow.forEach(f => {
    const x = Math.round(f.x + Math.sin(animClock * 1.2 + f.ph) * 3);
    R(ctx, x, Math.round(f.y), f.big ? 2 : 1, f.big ? 2 : 1, 'w');
  });
}
/* ---------- Скіни погоди (виграш у цирку): веселка над містом і сніжна куля ---------- */
const RAINBOW_COLORS = ['#e0524a', '#f29a45', '#ffe36a', '#6fcf7a', '#5fb4f0', '#6b6fd6', '#b07be0'];
function skyArcSize() {
  const cy = LAYOUT.curbY + 14, top = -view.offY + 8;           // вище верху видимого неба не піднімаємо
  const w = (shop ? shop.w : 130), h = (shop ? shop.h : 100);
  return { cy, rx: w / 2 + 44, ry: Math.min(cy - top, Math.max(h + 22, w / 2 + 44)) };
}
let rainbowCv = null, rainbowKey = '';
// Веселка: 7 смуг із м'якими переходами (шаховий дізеринг), світле сяйво по краях і слабка друга веселка в зворотному порядку
function buildRainbow(R0, bw, M, secondary) {
  const c = document.createElement('canvas'); c.width = 2 * (R0 + M); c.height = R0 + M + 2;
  const g = c.getContext('2d'), cx = R0 + M, cy = R0 + M, n = RAINBOW_COLORS.length;
  const col = i => RAINBOW_COLORS[Math.max(0, Math.min(n - 1, i))];
  for (let y = 0; y <= cy; y++) for (let x = 0; x < c.width; x++) {
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy), t = (R0 - d) / bw, chk = (x + y) % 2 === 0;
    if (t < -1.6 || t > n + 2.2) {
      if (secondary) { const t2 = (d - (R0 + bw * 3.2)) / (bw * 0.75); if (t2 >= 0 && t2 < n) { g.globalAlpha = 0.26; g.fillStyle = RAINBOW_COLORS[n - 1 - Math.floor(t2)]; g.fillRect(x, y, 1, 1); g.globalAlpha = 1; } }
      continue;
    }
    if (t < 0) { g.globalAlpha = 0.28 * (1 + t / 1.6); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); g.globalAlpha = 1; continue; }     // зовнішнє сяйво
    if (t >= n) { g.globalAlpha = 0.2 * (1 - (t - n) / 2.2); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); g.globalAlpha = 1; continue; }     // внутрішнє сяйво
    const idx = Math.floor(t), fr = t - idx;
    let k = idx;
    if (fr < 0.22 && idx > 0 && chk) k = idx - 1; else if (fr > 0.78 && idx < n - 1 && chk) k = idx + 1;
    g.fillStyle = col(k); g.fillRect(x, y, 1, 1);
    if (idx === 0 && fr < 0.34) { g.globalAlpha = 0.45; g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); g.globalAlpha = 1; }          // світла кромка зверху
  }
  return c;
}
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
  return { R0: Math.round(Math.max(120, Math.min((cy - top) * 0.93, 240))), cy, px: LAYOUT.centerX };
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
  const ep = viewEpoch() % 8, wide = Math.max(1, view.w / 320), top = 8 - view.offY;
  SKYX.ep = ep; SKYX.items = []; SKYX.banner = null; SKYX.tBanner = rand(3, 8); SKYX.meteors = []; SKYX.tMeteor = rand(0.3, 1);
  if (ep === 0) for (let i = 0; i < Math.round(3 * wide); i++) SKYX.items.push({ k: 'hab', x: rand(worldL(), worldR()), y: rand(top + 14, 62), r: [9, 7, 5][i % 3], vx: rand(1, 2.5) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6), c: [['r', 'w'], ['n', 'y'], ['g', 'w'], ['p', 'w'], ['h', 'n']][i % 5] });
  if (ep === 3) for (let i = 0; i < Math.round(5 * wide); i++) SKYX.items.push(skyxTetris(true));
  if (ep === 4) for (let i = 0; i < Math.round(4 * wide); i++) SKYX.items.push({ k: 'drn', x: rand(worldL(), worldR()), y: rand(top + 8, 66), vx: rand(8, 15) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6), box: i % 3 !== 2 });
  if (ep === 5) for (let i = 0; i < Math.max(2, Math.round(2 * wide)); i++) SKYX.items.push({ k: 'isl', x: rand(worldL() + 30, worldR() - 30), y: rand(top + 26, 54), w: rand(26, 36), vx: rand(0.6, 1.4) * (Math.random() < 0.5 ? -1 : 1), ph: rand(0, 6) });
}
function updateSkyExtra(dt) {
  if (SKYX.ep !== viewEpoch() % 8) seedSkyExtra();
  if (!animOn()) return;
  const top = 8 - view.offY;
  SKYX.items.forEach(f => {
    if (f.k === 'hab') { f.x += f.vx * dt; f.ph += dt * 0.6; }
    else if (f.k === 'drn') { f.x += f.vx * dt; f.ph += dt * 3; if (f.x < worldL() - 8) f.vx = Math.abs(f.vx); if (f.x > worldR() + 8) f.vx = -Math.abs(f.vx); }
    else if (f.k === 'isl') { f.x += f.vx * dt; f.ph += dt * 0.5; }
    else if (f.k === 'tet') { f.y += f.vy * dt; f.rt -= dt; if (f.rt <= 0) { f.rt = rand(1, 2.2); f.rot = (f.rot + 1) % 4; } if (f.y > 96) Object.assign(f, skyxTetris(false)); }
    if (f.k !== 'tet' && f.k !== 'drn') { if (f.x > worldR() + 60) f.x = worldL() - 60; else if (f.x < worldL() - 60) f.x = worldR() + 60; }
  });
  if (SKYX.ep === 1) {
    if (SKYX.banner) { SKYX.banner.x += SKYX.banner.vx * dt; if (SKYX.banner.x > worldR() + 90) { SKYX.banner = null; SKYX.tBanner = rand(14, 28); } }
    else { SKYX.tBanner -= dt; if (SKYX.tBanner <= 0) SKYX.banner = { x: worldL() - 90, y: rand(top + 12, 44), vx: rand(38, 52) }; }
  }
  if (SKYX.ep === 6) {
    SKYX.tMeteor -= dt; if (SKYX.tMeteor <= 0) { SKYX.tMeteor = rand(0.35, 1.1); SKYX.meteors.push({ x: rand(worldL() + 20, worldR() + 40), y: rand(top - 6, 30), vx: -rand(70, 110), vy: rand(30, 50), life: 0 }); }
    for (let i = SKYX.meteors.length - 1; i >= 0; i--) { const m = SKYX.meteors[i]; m.x += m.vx * dt; m.y += m.vy * dt; m.life += dt; if (m.life > 1.1) SKYX.meteors.splice(i, 1); }
  }
}
function skyxBalloon(x, y, r, c1, c2, ph) {
  x = Math.round(x); y = Math.round(y + Math.sin(ph) * 1.5);
  for (let dy = -r; dy <= r; dy++) { const hw = Math.round(r * Math.sqrt(Math.max(0, 1 - dy * dy / (r * r + 0.5)))); for (let dx = -hw; dx <= hw; dx++) R(ctx, x + dx, y + dy, 1, 1, Math.floor((dx + 40) / 3) % 2 ? c1 : c2); R(ctx, x - hw - 1, y + dy, 1, 1, 'd'); R(ctx, x + hw + 1, y + dy, 1, 1, 'd'); }
  R(ctx, x - 1, y - r - 1, 3, 1, 'd'); R(ctx, x - 1, y + r + 1, 3, 1, 'd');
  skyxLn(ctx, x - r + 2, y + r - 1, x - 2, y + r + 6, 'd'); skyxLn(ctx, x + r - 2, y + r - 1, x + 2, y + r + 6, 'd'); R(ctx, x - 2, y + r + 6, 5, 4, 'b'); R(ctx, x - 2, y + r + 6, 5, 1, 'c');
}
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
function drawSkyExtra(time) {
  const ep = SKYX.ep, top = 8 - view.offY;
  if (ep === 2) {                                                         // Диско: лазерний віяр над дахами
    const ox = Math.round((visL() + visR()) / 2), oy = LAYOUT.horizonY + 4, cols = ['f', 'T', 'y', 'N', 'p'], base = animOn() ? Math.sin(time * 0.6) * 0.22 : 0;
    ctx.globalAlpha = 0.6; for (let i = 0; i < 9; i++) { const a = -2.75 + i * 0.28 + base * (i % 2 ? 1 : -1), c = cols[i % 5]; skyxLn(ctx, ox, oy, ox + Math.cos(a) * 150, oy + Math.sin(a) * 150, c); skyxLn(ctx, ox + 1, oy, ox + 1 + Math.cos(a) * 150, oy + Math.sin(a) * 150, c); } ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { const sx = Math.round(worldL() + 20 + i * (view.w - 40) / 5), sy = top + 6 + (i * 13) % 34, v = Math.sin(time * 2.4 + i * 1.7); if (v > 0.3) sparkPlus(sx, sy, (v - 0.3) / 0.7, i % 2 ? '#fff6b0' : '#ffd0f0'); }
  }
  if (ep === 6) {                                                         // Космос: планета з кільцем і місяць
    const spl = spacePlanets(), cxw = (worldL() + worldR()) / 2, dlt = (visL() + visR()) / 2 - cxw, vw = visR() - visL();     // dlt — на скільки камера зсунута від центру світу
    const pxp = Math.round(cxw + (0.74 - 0.5) * vw + 0.75 * dlt), pyp = top + 40;                                          // планета далеко: зсувається за камерою лише на 25%
    const mxp = Math.round(cxw + (0.2 - 0.5) * vw + 0.7 * dlt), myp = top + 22;                                           // місяць ближче: на 40%
    ctx.drawImage(spl.planet, pxp - spl.planetCx, pyp - spl.planetCy);
    ctx.drawImage(spl.moon, mxp - spl.moonCx, myp - spl.moonCy);
    SKYX.meteors.forEach(m => { const a = Math.max(0, 1 - m.life / 1.1); for (let k = 0; k < 16; k++) { ctx.globalAlpha = a * (1 - k / 16); R(ctx, Math.round(m.x - m.vx * 0.012 * k), Math.round(m.y - m.vy * 0.012 * k), 1, 1, k < 4 ? 'w' : 'y'); R(ctx, Math.round(m.x - m.vx * 0.012 * k), Math.round(m.y - m.vy * 0.012 * k) + 1, 1, 1, 'o'); } ctx.globalAlpha = a; R(ctx, Math.round(m.x), Math.round(m.y), 3, 2, 'w'); ctx.globalAlpha = 1; });
  }
  if (ep === 1 && SKYX.banner) {                                          // Ретро: літак тягне полотнище SALE
    const b = SKYX.banner, x = Math.round(b.x), y = Math.round(b.y + Math.sin(time * 1.5) * 1);
    R(ctx, x, y, 14, 4, 'w'); R(ctx, x + 14, y + 1, 3, 2, 'e'); R(ctx, x + 3, y - 2, 6, 2, 'r'); R(ctx, x + 4, y + 4, 4, 2, 'r'); R(ctx, x + 12, y, 2, 1, 'S'); R(ctx, x - 2, y + 1, 2, 2, 'e'); R(ctx, x + 17, y + 1, 1, 2, Math.floor(time * 30) % 2 ? 'd' : 'e');
    skyxLn(ctx, x - 2, y + 2, x - 8, y + 4, 'd');
    for (let i = 0; i < 40; i++) { const yy = y + 4 - 3 + Math.round(Math.sin(time * 5 + i * 0.35) * 1); R(ctx, x - 8 - 40 + i, yy, 1, 13, i < 1 || i > 38 ? 'r' : 'w'); R(ctx, x - 8 - 40 + i, yy, 1, 1, 'r'); R(ctx, x - 8 - 40 + i, yy + 12, 1, 1, 'r'); }
    wordBig(ctx, x - 8 - 36, y + 4 - 3 + 3, 'SALE', 'r');
  }
  SKYX.items.forEach(f => {
    if (f.k === 'hab') skyxBalloon(f.x, f.y, f.r, f.c[0], f.c[1], f.ph);
    else if (f.k === 'drn') skyxDrone(f.x, f.y, f.ph, f.box);
    else if (f.k === 'isl') skyxIsland(f.x, f.y, f.w, f.ph);
    else if (f.k === 'tet') { f.cells.forEach(([i0, j0]) => { let i = i0, j = j0; for (let r = 0; r < f.rot; r++) { const ni = -j, nj = i; i = ni; j = nj; } const cx = Math.round(f.x + i * 5), cy = Math.round(f.y + j * 5); R(ctx, cx, cy, 5, 5, 'k'); R(ctx, cx + 1, cy + 1, 3, 3, f.c); R(ctx, cx + 1, cy + 1, 3, 1, 'w'); }); }
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
  const fx = currentEpoch().features;
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
  if (b) drawBlimp(b, time);                           // повітряне судно
  const p = epochFx.plane;
  if (p) {                                             // літак із білим слідом
    const dir = p.vx > 0 ? 1 : -1, x = Math.round(p.x), y = Math.round(p.y);
    for (let i = 1; i <= 38; i++) { ctx.globalAlpha = 0.7 * (1 - i / 38); R(ctx, x - dir * (i + 4), y, 1, 1, 'w'); }
    ctx.globalAlpha = 1;
    R(ctx, x - 4, y - 1, 9, 2, 'w'); R(ctx, x + (dir > 0 ? 5 : -5), y - 1, 1, 2, 'e'); R(ctx, x - 1, y - 3, 3, 2, 'e'); R(ctx, x - 1, y + 1, 3, 2, 'e'); R(ctx, x - dir * 4, y - 3, 2, 2, 'e');
  }
  const r = epochFx.rocket;
  if (r) {                                             // ракета з димовим слідом
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
  epochFx.fly.forEach(f => {
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
  epochFx.drones.forEach(d => {                        // дрони з вогниками
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
    if (q.t >= q.life) { shootingStar = null; shootTimer = rand(8, 22); }
  } else {
    shootTimer -= dt;
    if (shootTimer <= 0) shootingStar = { x: rand(view.w * 0.1, view.w * 0.8), y: rand(4, view.offY + 40), vx: rand(110, 160), vy: rand(40, 70), t: 0, life: 0.7 };
  }
}
function drawSkyBody(kind, x, y) {
  x = Math.round(x); y = Math.round(y);
  if (kind === 'sun') {
    const low = sky.h < 0.35;
    ctx.globalAlpha = 0.45; disc(ctx, x, y, 13, low ? 'o' : 'w');
    ctx.globalAlpha = 1;
    disc(ctx, x, y, 9, low ? 'o' : 'y'); disc(ctx, x, y, 6, low ? 'h' : 'w');
  } else if (kind === 'hmoon') {                      // хелловінський місяць: великий, помаранчевий, з кратерами
    ctx.globalAlpha = 0.1; disc(ctx, x, y, 27, 'o'); ctx.globalAlpha = 0.16; disc(ctx, x, y, 22, 'o'); ctx.globalAlpha = 0.28; disc(ctx, x, y, 18, 'h'); ctx.globalAlpha = 1;
    disc(ctx, x, y, 14, 'd'); disc(ctx, x, y, 13, 'o'); disc(ctx, x - 2, y - 2, 11, 'h'); disc(ctx, x - 3, y - 3, 7, 'y');
    ctx.globalAlpha = 0.5; R(ctx, x - 8, y - 3, 4, 3, 'o'); R(ctx, x + 2, y - 8, 5, 3, 'o'); R(ctx, x + 4, y + 2, 4, 4, 'o'); R(ctx, x - 7, y + 4, 3, 3, 'o'); R(ctx, x - 1, y + 6, 3, 2, 'o'); ctx.globalAlpha = 1;
  } else {                                           // місяць: ореол, освітлений бік, тінь, кратери й моря
    ctx.globalAlpha = 0.09; disc(ctx, x, y, 20, 'w');
    ctx.globalAlpha = 0.14; disc(ctx, x, y, 16, 'w');
    ctx.globalAlpha = 0.24; disc(ctx, x, y, 13, 'w');
    ctx.globalAlpha = 1;
    disc(ctx, x, y, 10, 'e');                         // темний контур
    disc(ctx, x, y, 9, 'W');
    disc(ctx, x - 1, y - 1, 8, 'w');                  // яскравий верхній лівий бік
    ctx.globalAlpha = 0.35;
    for (let dy = -9; dy <= 9; dy++) { const half = Math.round(Math.sqrt(81.5 - dy * dy)); R(ctx, x + Math.max(2, half - 4 - Math.max(0, dy)), y + dy, Math.max(0, half - Math.max(2, half - 4 - Math.max(0, dy)) + 1), 1, 'e'); }   // тінь справа-знизу
    ctx.globalAlpha = 0.55;
    R(ctx, x - 6, y - 4, 4, 3, 'e'); R(ctx, x + 1, y - 6, 5, 3, 'e'); R(ctx, x + 2, y + 1, 4, 4, 'e'); R(ctx, x - 5, y + 2, 3, 3, 'e'); R(ctx, x - 1, y + 5, 3, 2, 'e');   // моря
    ctx.globalAlpha = 0.8;
    R(ctx, x - 6, y - 5, 2, 1, 'w'); R(ctx, x + 1, y - 7, 3, 1, 'w'); R(ctx, x + 2, y, 2, 1, 'w'); R(ctx, x - 5, y + 1, 2, 1, 'w'); R(ctx, x - 1, y + 4, 2, 1, 'w');         // світлі краї кратерів
    ctx.globalAlpha = 1;
  }
}
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
  if (theme.season === 'halloween') { drawSkyBody('hmoon', Math.round(viewCrop.x + viewCrop.w * 0.2 - (viewCrop.x - (view.w - viewCrop.w) / 2) * 0.1), Math.max(32, hor - 96)); return; }
  // сонце вдень, місяць уночі: рухаються дугою зліва направо
  const a = dayNightOn() ? (state.dayPhase - 0.25) * Math.PI * 2 : Math.PI * 0.42;
  const arcH = Math.min(hor - 26, 190), rx = W * 0.44;
  if (Math.sin(a) > -0.25) drawSkyBody('sun', W / 2 - Math.cos(a) * rx, hor - Math.sin(a) * arcH);
  if (dayNightOn() && -Math.sin(a) > -0.25) drawSkyBody('moon', W / 2 + Math.cos(a) * rx, hor + Math.sin(a) * arcH);
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
  for (let x = shop.x + 3; x < shop.x + shop.w - 3; x += 6) {
    const sag = Math.round(2 * Math.sin(((x - shop.x) % 12) / 12 * Math.PI));
    fn(x, y0 + sag, cols[(Math.floor((x - shop.x) / 6) + tw) % cols.length]);
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
    ctx.beginPath(); ctx.rect(-3000, -3000, 8000, 8000); ctx.rect(shop.x, shop.y, shop.w, shop.h); ctx.clip('evenodd');       // фасад, вітрина й двері лишаються чіткими: світло лише довкола
    const big = shop.level >= 4 ? 1.35 : 1;
    for (let i = 0; i < 6; i++) { const pad = 3 + i * 5; ctx.globalAlpha = L * 0.035 * big; ctx.fillStyle = '#ffb94a'; ctx.fillRect(shop.x - pad, shop.y + shop.h * 0.18 - pad * 0.6, shop.w + pad * 2, shop.h * 0.82 - 44 + pad * 0.6); }
    ctx.translate(shop.x + shop.w / 2, LAYOUT.curbY + 4); ctx.scale(1, 0.3); ctx.fillStyle = '#ffc060';                                  // м'яка овальна пляма світла на бруківці перед входом
    for (let i = 0; i < 9; i++) { ctx.globalAlpha = L * 0.022 * big; ctx.beginPath(); ctx.arc(0, 0, shop.w * (0.72 - i * 0.07), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  if (!build && shop) {                                              // світло з дверей і вітрин падає на тротуар
    const cx = shop.x + shop.door.x + shop.door.w / 2;
    for (let i = 0; i < 8; i++) { ctx.globalAlpha = L * 0.12; R(ctx, Math.round(cx - 15 - i * 4), LAYOUT.curbY + i * 4, 30 + i * 8, 4, 'y'); }
    ctx.globalAlpha = L * 0.1; R(ctx, shop.x - 4, LAYOUT.curbY, shop.w + 8, 9, 'y');
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


