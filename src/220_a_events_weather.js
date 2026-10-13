//#part 220_a_events_weather.js
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
  items.splice(1, 0, ...helpChips());                                                      // «Допоможи Піпу: 4/12»
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
  withShopScale(getShopScale(), () => {                                  // гірлянда стискається разом з магазином
    for (let x = shop.x + 2; x < shop.x + shop.w - 2; x++) {
      const sag = Math.round(3 * Math.sin(((x - shop.x) % 22) / 22 * Math.PI));
      R(ctx, x, y0 + sag, 1, 1, 'd');
      if ((x - shop.x) % 5 === 2) {
        const col = theme.lights[(Math.floor((x - shop.x) / 5) + Math.floor(animClock * 2)) % theme.lights.length];
        R(ctx, x, y0 + sag + 1, 2, 2, col);
      }
    }
  });
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
