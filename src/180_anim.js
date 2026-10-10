//#part 180_anim.js
/* =====================================================================
   АНІМАЦІЇ ТА ЕФЕКТИ
   ===================================================================== */

const shopAnim = { squash: 0, vel: 0 };          // пружинка стискання магазину
const capyAnim = { blinkIn: 3, blinkLeft: 0, hopAt: -9 };   // кліпання
const fx = { coins: [], sparks: [], dust: [] };
const clouds = CLOUDS.map(c => ({ ...c }));
// Хмаринки розсипаються по всій ширині й висоті неба (на великому екрані їх більше)
// Погода: дощ вмикається й вимикається крапелькою біля магазину
const weather = { rain: 0, target: 0, timer: 30 };
const raindrops = [];
function updateWeather(dt) {
  weather.target = (animOn() && state.settings.rain && !ecoOn()) ? 0.85 : 0;       // дощ іде лише коли гравець увімкнув його крапелькою біля магазину
  weather.rain += (weather.target - weather.rain) * Math.min(1, dt * 0.6);
  if (weather.rain < 0.02) { raindrops.length = 0; return; }
  const want = Math.min(200, Math.round(weather.rain * 120 * (view.w * view.h) / (320 * 180)));         // не більше 200 крапель, щоб не гальмувало
  while (raindrops.length < want) raindrops.push({ x: rand(worldL(), worldR() + 30), y: rand(-view.offY, worldB()), vy: rand(130, 175) });
  while (raindrops.length > want) raindrops.pop();
  raindrops.forEach(d => {
    d.y += d.vy * dt; d.x -= 20 * dt;
    if (d.y > worldB()) { d.y = -view.offY - rand(0, 20); d.x = rand(worldL(), worldR() + 30); }
  });
}
// Знак дощу на тротуарі праворуч від магазину (високий стовпчик, подалі від тапів по магазину): тап вмикає або вимикає дощ
let rainSpotCache = { key: '', x: 0 };
let rainTreeCache = { key: '', x: 0 };
function rainToggleSpot() {
  if (!shop) return null;
  // знак дощу висить на першому дереві праворуч від магазину: це частина вулиці, тож рухається лише разом з нею і не залежить від екрана
  const key = shop.x + '|' + shop.w + '|' + view.offX + '|' + view.w + '|' + lampXs.length;
  if (rainTreeCache.key !== key) {
    const list = treeSpots(worldL(), view.w).sort((p, q) => p.x - q.x), right = shop.x + shop.w;
    const tr = list.find(t => t.x - 14 > right) || list.filter(t => t.x > shop.x + shop.w / 2).pop() || list[list.length - 1];
    rainTreeCache = { key, x: tr ? tr.x : right + 40 };
  }
  return { x: rainTreeCache.x, cy: LAYOUT.horizonY + 8 - 34 };
}
// Крапелька: загострений кінчик угорі, округле дно, світла грань, тінь і відблиск
function dropG(g, cx, top, body, light, edge, hi) {
  const F = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const rows = [1, 3, 3, 5, 5, 7, 9, 9, 9, 9, 9, 7, 5];          // ширина кожного рядка (центр cx)
  rows.forEach((w, i) => { F(cx - (w >> 1) - 1, top + i, w + 2, 1, edge); });
  F(cx - 3, top + rows.length, 7, 1, edge);
  rows.forEach((w, i) => { F(cx - (w >> 1), top + i, w, 1, body); });
  rows.forEach((w, i) => { if (i > 3 && i < 12) F(cx - (w >> 1), top + i, 2, 1, light); });                 // світла ліва грань
  F(cx + 2, top + 8, 2, 3, edge); F(cx + 1, top + 11, 2, 1, edge);                                         // тінь справа
  F(cx - 2, top + 6, 1, 3, hi); F(cx - 2, top + 5, 1, 1, hi); F(cx - 1, top + 4, 1, 1, hi);                 // відблиск
}
function drawRainToggle() {
  const p = rainToggleSpot(); if (!p) return;
  const on = !!state.settings.rain, x = p.x, anim = on && animOn(), bob = anim && Math.floor(animClock * 3) % 2 ? 1 : 0;
  const cy = p.cy - bob;                                                                                   // круглий знак висить у повітрі біля вивіски
  ctx.globalAlpha = 0.18; disc(ctx, x + 1, cy + 2, 12, 'd'); ctx.globalAlpha = 1;
  disc(ctx, x, cy, 12, 'd');
  disc(ctx, x, cy, 11, on ? 'n' : 'e');
  disc(ctx, x, cy, 10, on ? 'a' : 'E');
  disc(ctx, x, cy, 8, on ? 'S' : 'w');
  R(ctx, x - 8, cy - 7, 6, 1, 'w'); R(ctx, x - 9, cy - 5, 1, 4, 'w'); R(ctx, x - 7, cy - 8, 3, 1, 'w');          // глянцевий відблиск
  R(ctx, x + 5, cy + 6, 3, 1, on ? 'a' : 'E'); R(ctx, x + 7, cy + 3, 1, 3, on ? 'a' : 'E');                    // тінь у куті
  [[x, cy - 11], [x, cy + 11], [x - 11, cy], [x + 11, cy]].forEach(([qx, qy]) => R(ctx, qx, qy, 1, 1, 'w'));  // заклепки
  if (on) {
    dropG(ctx, x, cy - 7, '#3d93e0', '#7cc4f8', '#1f4f94', '#ffffff');
    if (anim) for (let k = 0; k < 3; k++) { const ph = (animClock * 1.6 + k / 3) % 1; R(ctx, x - 14 + k * 14, Math.round(cy - 10 + ph * 20), 1, 3, 'S'); }      // краплі дощу навколо
  } else { dropG(ctx, x, cy - 7, '#a79d92', '#cfc5b8', '#6f655c', '#f1e9dc'); lineG(ctx, x - 7, cy + 7, x + 7, cy - 7, 'r'); lineG(ctx, x - 7, cy + 8, x + 7, cy - 6, 'r'); lineG(ctx, x - 6, cy + 7, x + 8, cy - 7, 'r'); }
}
function hitRainToggle(p) {
  const s = rainToggleSpot(); if (!s) return false;
  if (Math.abs(p.x - s.x) <= 14 && Math.abs(p.y - s.cy) <= 14) {
    state.settings.rain = !state.settings.rain;
    if (state.settings.rain) { weather.rain = Math.max(weather.rain, 0.3); }
    showToast(t(state.settings.rain ? 'rainOn' : 'rainOff'), 'good'); playSfx('pip'); saveGame();
    return true;
  }
  return false;
}
function drawRain() {
  if (!raindrops.length) return;
  ctx.globalAlpha = 0.85;
  raindrops.forEach(d => { R(ctx, Math.round(d.x), Math.round(d.y), 1, 3, 'S'); R(ctx, Math.round(d.x) + 1, Math.round(d.y) + 3, 1, 1, 's'); });
  ctx.globalAlpha = 1;
}

// Птахи: зграї-«клини» і поодинокі вдень (вночі їх нема; на Хелловін замість них кажани).
// Кожен птах — окремий вид (горобець, ластівка, чайка, голуб, ворона, синиця) із власним малюнком: тіло з об'ємом, голова з оком і дзьобом, хвіст, два крила, що змахують у 6 кадрах
const BIRDS_BY_SEASON = { spring: 7, summer: 5, autumn: 8, winter: 4, halloween: 0 };
const BIRD_SPECIES = [
  { back: '#7a5a3c', wing: '#5a3f28', tip: '#3a281a', belly: '#e8d9bd', head: '#8a6a48', beak: '#f2b84b', cap: '#9a4a2a', size: 0.9 },     // горобець
  { back: '#1f2f5a', wing: '#16224a', tip: '#0d1530', belly: '#f4efe6', head: '#1f2f5a', beak: '#2a1d1a', cap: '#c4553d', size: 0.95, fork: 1 },   // ластівка
  { back: '#e9eef2', wing: '#c9d2da', tip: '#3a4452', belly: '#ffffff', head: '#ffffff', beak: '#f2b84b', cap: null, size: 1.25 },            // чайка
  { back: '#9aa3b2', wing: '#7e8898', tip: '#556070', belly: '#c7ccd6', head: '#8f98a8', beak: '#d9a679', cap: '#8bb7a2', size: 1.1 },         // голуб
  { back: '#26262e', wing: '#1a1a22', tip: '#0d0d12', belly: '#32323c', head: '#26262e', beak: '#3a3a44', cap: null, size: 1.25 },            // ворона
  { back: '#4f9ad6', wing: '#3b7ab3', tip: '#27567f', belly: '#ffe08a', head: '#f4f0e0', beak: '#2a1d1a', cap: '#2f6fb0', size: 0.85 }          // синиця
];
const BIRD_FRAMES = 6, birdFrameCache = {};
function birdFrame(sp, f) {                                   // кадр f (0…5) птаха виду sp: дивиться вправо, canvas 30×26
  const key = sp + '|' + f;
  if (birdFrameCache[key]) return birdFrameCache[key];
  const S = BIRD_SPECIES[sp], c = document.createElement('canvas'); c.width = 30; c.height = 26;
  const g = c.getContext('2d');
  const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const ang = [64, 42, 10, -26, -52, -18][f] * Math.PI / 180;      // кут крила: вгору → вниз
  const cx = 14, cy = 13;                                          // центр тіла
  const wing = (ox, oy, col, tip, len, wd) => {                    // крило-«лопать»: від плеча до кінчика, тоншає, на кінці довгі махові пера
    for (let k = 0; k <= len; k++) {
      const t = k / len, bend = Math.sin(t * 1.4) * 0.35 * (ang > 0 ? 1 : -0.6);
      const x = ox - Math.cos(ang + bend) * k * -0.9 - k * 0.15, y = oy - Math.sin(ang + bend) * k;
      const th = Math.max(1, Math.round(wd * (1 - t * 0.7)));
      px(x - 1, y - (ang > 0 ? th - 1 : 0), 3, th, t > 0.72 ? tip : col);
    }
  };
  wing(cx - 1, cy - 1, S.wing, S.tip, 12, 4);                      // дальнє крило (темніше, трохи зміщене)
  px(cx - 10, cy - 1, 5, 2, S.wing); px(cx - 12, cy, 3, S.fork ? 1 : 2, S.tip);   // хвіст
  if (S.fork) { px(cx - 13, cy - 1, 2, 1, S.tip); px(cx - 13, cy + 2, 2, 1, S.tip); }
  for (let y = -3; y <= 3; y++) for (let x = -7; x <= 6; x++) if ((x * x) / 52 + (y * y) / 10 <= 1) px(cx + x, cy + y, 1, 1, y >= 1 ? S.belly : S.back);   // тіло: спинка, живіт
  px(cx - 5, cy - 1, 7, 1, S.wing);                                // темніша смуга вздовж спини
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 9) px(cx + 8 + x, cy - 2 + y, 1, 1, y > 1 ? S.belly : S.head);   // голова
  if (S.cap) px(cx + 6, cy - 5, 4, 1, S.cap);
  px(cx + 10, cy - 3, 2, 2, '#ffffff'); px(cx + 11, cy - 3, 1, 2, '#111111');   // око
  px(cx + 12, cy - 2, 3, 1, S.beak); px(cx + 12, cy - 1, 2, 1, S.beak);         // дзьоб
  px(cx - 1, cy + 3, 1, 2, '#3a2a1a'); px(cx + 2, cy + 3, 1, 2, '#3a2a1a');     // лапки підібрані
  wing(cx + 1, cy - 2, S.back, S.tip, 13, 5);                      // ближнє крило поверх тіла
  px(cx - 2, cy - 2, 4, 1, S.back);
  return (birdFrameCache[key] = c);
}
const birds = [];
function seedBirds() {
  birds.length = 0;
  const total = Math.round((BIRDS_BY_SEASON[theme.season] !== undefined ? BIRDS_BY_SEASON[theme.season] : 5) * Math.max(1, view.w / 320));
  const offs = [[0, 0], [-12, 4], [-12, -4], [-24, 8], [-24, -8]];
  let made = 0;
  while (made < total) {
    const size = Math.min(total - made, 1 + Math.floor(rand(0, 4))), sp = Math.floor(rand(0, BIRD_SPECIES.length));
    const dir = Math.random() < 0.5 ? -1 : 1, vx = rand(14, 26) * dir;
    const fx = rand(worldL(), worldR()), fy = rand(10 - view.offY, 62);
    for (let k = 0; k < size; k++) birds.push({ x: fx + offs[k][0] * -dir, y: fy + offs[k][1], vx: vx * rand(0.94, 1.06), sp, ph: rand(0, 6.3), bob: rand(0, 6.3), wing: rand(5.5, 7.5) * (1.3 - BIRD_SPECIES[sp].size * 0.35) });
    made += size;
  }
}
function updateBirds(dt) {
  if (!animOn()) return;
  birds.forEach(b => {
    b.x += b.vx * dt;
    if (b.vx > 0 && b.x > worldR() + 40) b.x = worldL() - 40;
    else if (b.vx < 0 && b.x < worldL() - 40) b.x = worldR() + 40;
  });
}
function drawBirds() {
  if (!state.settings.birds || state.settings.noFly || ecoOn()) return;
  if (viewEpoch() % 8 >= 1 && !state.settings.birdsLate) return;                     // з 2-ї епохи птахів не видно, доки гравець не ввімкне їх у налаштуваннях
  const vis = 1 - Math.min(1, sky.night * 1.5);
  if (vis <= 0.05 || !birds.length) return;
  birds.forEach(b => {
    const S = BIRD_SPECIES[b.sp], f = animOn() ? Math.floor(animClock * b.wing + b.ph) % BIRD_FRAMES : 2;
    const cv = birdFrame(b.sp, f), dir = b.vx > 0 ? 1 : -1;
    const y = Math.round(b.y + Math.sin(animClock * 1.3 + b.bob) * 2 + (f === 0 || f === 5 ? 1 : f === 3 ? -1 : 0));
    ctx.globalAlpha = vis;
    drawCanvasSprite(ctx, cv, Math.round(b.x) - 15, y - 13, { flip: dir < 0, sx: S.size * 0.6, sy: S.size * 0.6 });
  });
  ctx.globalAlpha = 1;
}

// Хмара-канвас: купчаста / середня / довга. Темніші, з об'ємом: світла кромка зверху-ліворуч, борозенки між «бульбашками», важка тінь знизу
const cloudCache = {};
const CLOUD_SKIN_TINT = { cottoncloud: 'cotton', goldcloud: 'gold', starcloud: 'star' };     // скіни погоди, що міняють колір хмар
function cloudCanvas(kind, tint) {
  const key = kind + '|' + tint;
  if (cloudCache[key]) return cloudCache[key];
  const T = {
    '': ['#f4f7fb', '#d6dfec', '#adbacd', '#8795ad', '#66748e'],
    light: ['#eaf0f7', '#c9d4e4', '#a2b0c6', '#7d8ca6', '#5d6c88'],
    grey: ['#c2c9d4', '#a1abbb', '#808b9e', '#626d82', '#464f63'],
    dark: ['#7d7a9c', '#615f84', '#4a4870', '#37355a', '#25243f'],
    cotton: ['#fff1f6', '#ffd9e8', '#f4b6d0', '#d98fb4', '#b86c96'],
    gold: ['#fff6d6', '#ffe49a', '#f2c45a', '#d9a03a', '#b5802a'],
    star: ['#cdbdf2', '#a995e0', '#8670c4', '#6650a4', '#463683'],
    star2: ['#c4f0f4', '#94d8ec', '#6cb4dc', '#4a8ac0', '#33609a'],
    star3: ['#f4cdee', '#e0a0d8', '#c078c4', '#9a52a4', '#703a86']
  }[tint] || ['#f4f7fb', '#d6dfec', '#adbacd', '#8795ad', '#66748e'];
  const puffs = [
    [[14, 19, 10], [27, 13, 13], [42, 16, 11], [53, 20, 8], [22, 21, 10], [36, 21, 11], [47, 22, 8]],
    [[11, 14, 9], [22, 10, 10], [33, 13, 9], [17, 16, 9], [27, 16, 8]],
    [[11, 11, 8], [22, 9, 9], [35, 10, 9], [48, 11, 8], [58, 12, 6], [28, 12, 8], [41, 12, 8]]
  ][kind % 3];
  const W = [64, 44, 68][kind % 3], H = [34, 26, 22][kind % 3], c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const inP = (p, x, y) => (x - p[0]) * (x - p[0]) + (y - p[1]) * (y - p[1]) * 1.2 <= p[2] * p[2];
  const BITES = tint === 'cotton' ? [[[45, 9, 6.3], [51, 12, 4.6], [57, 16, 3.8]], null, [[35, 3, 6.5], [41, 5, 4.6], [29, 5, 3.8]]][kind % 3] : null;      // сліди зубів: хмари 0 і 2 надкушені, хмара 1 цілa
  const inCl = (x, y) => y <= H - 3 && puffs.some(p => inP(p, x, y)) && !(BITES && BITES.some(b => (x - b[0]) * (x - b[0]) + (y - b[1]) * (y - b[1]) <= b[2] * b[2]));
  let top = H, bot = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inCl(x, y)) { top = Math.min(top, y); bot = Math.max(bot, y); }
  const litPts = [], starPts = [];                                                  // світлі точки (для мерехтіння золотих хмар) і зорі (для зоряних)
  for (let y = top; y <= bot; y++) for (let x = 0; x < W; x++) {
    if (!inCl(x, y)) continue;
    const v = (y - top) / Math.max(1, bot - top);
    let sh = v * 0.62 + ((x * 3 + y * 7) % 5 === 0 ? 0.07 : 0) + ((x + y) & 1 ? 0.03 : 0);
    sh -= inCl(x - 2, y - 2) ? 0 : 0.34;                                   // світла кромка зверху-ліворуч
    sh += inCl(x + 2, y + 2) ? 0 : 0.2;                                    // тінь на нижньо-правому краї
    puffs.forEach(p => { const d = Math.hypot(x - p[0], (y - p[1]) * 1.1); if (d > p[2] - 1.6 && d <= p[2] && y > p[1] && inCl(x, y + 3)) sh += 0.17; });   // борозенки між «бульбашками»
    g.fillStyle = sh < 0.1 ? T[0] : sh < 0.3 ? T[1] : sh < 0.5 ? T[2] : sh < 0.72 ? T[3] : T[4];
    g.fillRect(x, y, 1, 1);
    if (sh < 0.3 && (x * 7 + y * 13) % 9 === 0) litPts.push([x, y]);
  }
  for (let x = 0; x < W; x++) if (inCl(x, bot) && x % 2) { g.fillStyle = T[4]; g.fillRect(x, bot + 1, 1, 1); }     // розмитий нижній край
  if (tint === 'star' || tint === 'star2' || tint === 'star3') { g.fillStyle = '#ffe08a'; for (let y = top; y <= bot; y++) for (let x = 0; x < W; x++) if (inCl(x, y) && (x * 31 + y * 17) % 29 === 0) { g.fillRect(x, y, 1, 1); starPts.push([x, y]); } }   // зорі в хмарах
  c.litPts = litPts; c.starPts = starPts; c.topY = top; c.botY = bot;
  return (cloudCache[key] = c);
}
// Хмар по сезонах: влітку мало, навесні помірно, восени й узимку багато й сірі, на Хелловін темні
const CLOUD_BY_SEASON = { spring: [1.0, 'white'], summer: [0.35, 'white'], autumn: [1.8, 'grey'], winter: [1.5, 'light'], halloween: [1.4, 'dark'] };
// Хмари: звичайні, а скіни «Зоряні» (магічні: колір пливе від бузкового до бірюзового й рожевого, зорі мерехтять, падає зоряний пил)
// та «Золоті» (виблискують, а час від часу з них падають монети)
const cloudCoins = [], starDust = [];
let cloudCoinT = 2.5;
function cloudBox(c) {
  const cv = cloudCanvas(c.kind || 0, ''), sc = c.big ? 1.5 : 1, dw = Math.max(1, Math.round(cv.width * sc)), dh = Math.max(1, Math.round(cv.height * sc));
  return { x: Math.round(c.x) + Math.round((cv.width - dw) / 2), y: Math.round(c.y) + Math.round(cv.height - dh), w: dw, h: dh, sc };
}
function sparkPlus(x, y, a, col) { ctx.globalAlpha = a; R(ctx, x, y, 1, 1, '#ffffff'); ctx.globalAlpha = a * 0.7; R(ctx, x - 1, y, 3, 1, col); R(ctx, x, y - 1, 1, 3, col); ctx.globalAlpha = 1; }
function drawCloudsLayer() {
  if (!state.settings.clouds) return;
  const sk = skinOn('weather'), tint0 = CLOUD_SKIN_TINT[sk];
  clouds.forEach(c => {
    const tint = tint0 || c.v || '', sc = c.big ? 1.5 : 1, o = { sx: sc, sy: sc }, cv = cloudCanvas(c.kind || 0, tint);
    if (sk === 'starcloud' && animOn()) {
      const b = cloudBox(c), cx = b.x + b.w / 2, cy = b.y + b.h * 0.55, pu = 0.5 + 0.5 * Math.sin(animClock * 1.3 + c.x * 0.03);
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = (0.05 + 0.04 * pu) * (3 - i) / 3 * 1.6; disc(ctx, Math.round(cx), Math.round(cy), Math.round(b.h * (0.95 - i * 0.2) + b.w * 0.12), '#b49cff'); }     // мерехтливий ореол
      ctx.globalAlpha = 1;
      drawCanvasSprite(ctx, cv, Math.round(c.x), Math.round(c.y), o);
      const m = 0.5 + 0.5 * Math.sin(animClock * 0.7 + c.x * 0.02), m2 = 0.5 + 0.5 * Math.sin(animClock * 0.7 + c.x * 0.02 + 2.1);                // колір «дихає»: бузковий → бірюзовий → рожевий
      drawCanvasSprite(ctx, cloudCanvas(c.kind || 0, 'star2'), Math.round(c.x), Math.round(c.y), { sx: sc, sy: sc, alpha: m * 0.85 });
      drawCanvasSprite(ctx, cloudCanvas(c.kind || 0, 'star3'), Math.round(c.x), Math.round(c.y), { sx: sc, sy: sc, alpha: m2 * 0.6 * (1 - m * 0.5) });
      cv.starPts.forEach(([px, py], i) => {                                                                                                          // зорі мерехтять хрестиками
        const v = Math.sin(animClock * 2.6 + i * 1.9 + c.x * 0.013); if (v < 0.35) return;
        sparkPlus(b.x + Math.round(px * sc), b.y + Math.round(py * sc), (v - 0.35) / 0.65, '#ffe9a0');
      });
      return;
    }
    drawCanvasSprite(ctx, cv, Math.round(c.x), Math.round(c.y), o);
    if (sk === 'goldcloud' && animOn()) {
      const b = cloudBox(c);
      cv.litPts.forEach(([px, py], i) => { if (i % 3) return; const v = Math.sin(animClock * 1.9 + i * 2.7 + c.x * 0.02); if (v > 0.8) sparkPlus(b.x + Math.round(px * sc), b.y + Math.round(py * sc), (v - 0.8) / 0.2, '#fff2b0'); });      // золоті відблиски
    }
  });
  ctx.globalAlpha = 1;
}
function updateCloudSkinFx(dt) {
  const sk = skinOn('weather');
  if (!animOn() || ecoOn() || !state.settings.clouds || (sk !== 'goldcloud' && sk !== 'starcloud')) { cloudCoins.length = 0; starDust.length = 0; return; }
  const vis = clouds.filter(c => c.x > visL() - 20 && c.x < visR() - 20);
  if (sk === 'goldcloud') {
    cloudCoinT -= dt;
    if (cloudCoinT <= 0) {
      cloudCoinT = rand(2.2, 5.5);
      if (vis.length) { const b = cloudBox(vis[Math.floor(Math.random() * vis.length)]); cloudCoins.push({ x: b.x + rand(b.w * 0.25, b.w * 0.75), y: b.y + b.h * 0.8, vy: rand(6, 20), age: 0, spin: rand(0, 4), bounces: 0, ground: Math.min(worldB() - 8, LAYOUT.curbY + rand(8, 38)), rest: 0 }); }
    }
    for (let i = cloudCoins.length - 1; i >= 0; i--) {
      const p = cloudCoins[i]; p.age += dt;
      if (p.rest > 0) { p.rest += dt; if (p.rest > 1.6) cloudCoins.splice(i, 1); continue; }
      p.vy += 150 * dt; p.y += p.vy * dt;
      if (p.y >= p.ground) {
        p.y = p.ground; if (p.bounces < 2) { p.vy = -p.vy * 0.38; p.bounces++; buildSparks(p.x, p.y - 2, 4, ['#fff2b0', '#ffd24a']); } else { p.rest = 0.01; p.vy = 0; buildSparks(p.x, p.y - 2, 6, ['#fff2b0', '#ffd24a', '#ffffff']); }
      }
    }
  } else {
    cloudCoins.length = 0;
    vis.forEach(c => { if (Math.random() < dt * 5) { const b = cloudBox(c); starDust.push({ x: b.x + rand(b.w * 0.1, b.w * 0.9), y: b.y + b.h * rand(0.6, 0.9), vx: rand(-4, 4), vy: rand(7, 15), age: 0, life: rand(1.2, 2.4), c: ['#fff6c0', '#c9b8ff', '#9be8ff', '#ffc4ec'][Math.floor(Math.random() * 4)] }); } });
    for (let i = starDust.length - 1; i >= 0; i--) { const p = starDust[i]; p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.age >= p.life) starDust.splice(i, 1); }
    while (starDust.length > 90) starDust.shift();
  }
}
function drawCloudSkinFx() {
  starDust.forEach(p => { const k = p.age / p.life; ctx.globalAlpha = Math.sin(k * Math.PI) * 0.9; R(ctx, Math.round(p.x), Math.round(p.y), 1, 1, p.c); if (k < 0.6 && (Math.floor(p.age * 6) & 1)) { ctx.globalAlpha *= 0.5; R(ctx, Math.round(p.x) - 1, Math.round(p.y), 3, 1, p.c); } });
  cloudCoins.forEach(p => {
    const fade = p.rest > 0 ? Math.max(0, 1 - p.rest / 1.6) : 1, spin = [1, 0.6, 0.25, 0.6][Math.floor(p.age * 12 + p.spin) % 4];
    drawSprite(ctx, coinSprite(), Math.round(p.x) - 4, Math.round(p.y) - 4, { sx: p.rest > 0 ? 1 : spin, alpha: fade });
  });
  ctx.globalAlpha = 1;
}
function seedClouds() {
  clouds.length = 0;
  const cfg = CLOUD_BY_SEASON[theme.season] || [1, 'white'];
  const base = CLOUDS.length + Math.floor((view.w - 320) / 80) + Math.floor(view.offY / 45);
  const n = Math.max(2, Math.round(base * cfg[0] * 0.65));          // хмар поменшало
  for (let i = 0; i < n; i++) {
    const b = CLOUDS[i % CLOUDS.length];
    const v = cfg[1] === 'white' ? (theme.season === 'spring' && i % 4 === 3 ? 'light' : '') : cfg[1] === 'grey' ? (i % 4 === 3 ? 'light' : 'grey') : cfg[1] === 'light' ? (i % 2 ? 'light' : '') : 'dark';
    clouds.push({ x: rand(worldL(), worldR()), y: rand(4 - view.offY, 46), speed: b.speed * rand(0.8, 1.3), v, kind: i % 3, big: cfg[0] > 1.2 && i % 3 === 0 });
  }
}
let build = null;                                 // триває будівництво нового рівня
const customers = [];
let customerTimer = 1;

function rand(a, b) { return a + Math.random() * (b - a); }

// Масштаб магазину для поточного стискання (використовується і в canvas, і для вивіски)
function withShopScale(sc, fn) {                 // малює у координатах магазину так, ніби він стискається разом зі спрайтом (вивіски й світло не відстають від підстрибування)
  const dw = Math.max(1, Math.round(shop.w * sc.sx)), dh = Math.max(1, Math.round(shop.h * sc.sy));
  ctx.save();
  ctx.translate(Math.round(shop.x + (shop.w - dw) / 2), Math.round(shop.y + (shop.h - dh)));
  ctx.scale(dw / shop.w, dh / shop.h); ctx.translate(-shop.x, -shop.y);
  fn();
  ctx.restore();
}
function getShopScale() {
  const sq = Math.max(-0.5, Math.min(0.5, shopAnim.squash));
  const sx = 1 + 0.14 * sq, sy = 1 - 0.24 * sq;
  // як і в drawCanvasSprite, округлюємо до цілих пікселів, щоб вивіска збігалася зі спрайтом
  return { sx: Math.max(1, Math.round(shop.w * sx)) / shop.w, sy: Math.max(1, Math.round(shop.h * sy)) / shop.h };
}

/* ---------- Будівництво: риштування і пил ---------- */
function startBuild(old) {
  ejectInside();
  const style = (state.shopLevel + 1) % 3;                       // три способи будівництва по черзі: молоток, кран, дошки
  playSfx('buildTheme');
  build = { t: 0, dur: CONFIG.BUILD_SECONDS * (state.shopLevel >= 4 ? 0.72 : 1), old, dustTimer: 0, burst: false, style, r: 0, shake: 0, hitT: 0, lastSfx: 0, bx: old.x - 30, by: LAYOUT.curbY + 4, bdir: 1, fw: 0, fwT: 0, landed: -1, bands: 0, fin: false };
  ui.shopOverlay.style.visibility = 'hidden';
}
function finishBuild() {
  build = null;
  ui.scene.style.transform = '';
  ui.shopOverlay.style.visibility = '';
  shopAnim.vel = 6;
  playSfx('levelup');
  showToast(t('buildDone', t('levelName_' + state.shopLevel)), 'big');
  const opened = DEPARTMENTS.map((d, i) => d.level === state.shopLevel ? deptName(i) : null).filter(Boolean);
  if (opened.length) showToast(t('newDepts', opened.join(', ')), 'good');
}
function spawnDust(x, y, n) {
  if (!animOn()) return;
  if (ecoOn()) n = Math.ceil(n / 2);
  for (let i = 0; i < n; i++) {
    fx.dust.push({ x: x + rand(-3, 3), y: y + rand(-2, 2), r: rand(2, 4), vx: rand(-14, 14), vy: rand(-18, -4), age: 0, life: rand(0.5, 0.9) });
  }
  while (fx.dust.length > (ecoOn() ? CONFIG.MAX_DUST >> 1 : CONFIG.MAX_DUST)) fx.dust.shift();
}
// Будівництво (≈8,5 с): прибуття Боді, руйнування старого, зведення нового (три стилі), обвалення риштувань, салют
const BUILD_A = 0.16, BUILD_C = 0.84;
function smooth01(v) { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); }
function buildSfx(b, n) { if (b.t - b.lastSfx > n) { b.lastSfx = b.t; playSfx('build'); } }
function buildSparks(x, y, n, cols) { for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), sp = rand(20, 55); fx.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 22, age: 0, life: rand(0.35, 0.65), col: cols[i % cols.length] }); } }
function buildBands() { return Math.max(4, Math.ceil(shop.h / 6)); }
function updateBuild(dt) {
  const b = build; b.t += dt;
  const p = b.t / b.dur, o = b.old, cx = shop.x + shop.w / 2;
  b.shake = Math.max(0, b.shake - dt * 3);
  let tx = cx, ty = LAYOUT.curbY + 4, run = false;
  // Вантажівка-бетономішалка: приїздить вулицею зліва, стоїть біля магазину, наприкінці їде геть праворуч
  b.parkX = shop.x - 46;
  b.pumpPark = shop.x + shop.w + 62; const startP = visR() + 110;                                                                // бетононасос: приїздить справа
  if (p < BUILD_A) { b.pumpX = startP + (b.pumpPark - startP) * smooth01(p / BUILD_A); b.pumpMoving = p < BUILD_A - 0.015; b.pumpExt = 0; }
  else if (p < BUILD_C) { b.pumpX = b.pumpPark; b.pumpMoving = false; b.pumpExt = Math.min(smooth01((p - BUILD_A) / 0.06), 1 - smooth01((p - (BUILD_C - 0.06)) / 0.06)); }
  else { const u = Math.max(0, (p - BUILD_C) / (1 - BUILD_C)); b.pumpX = b.pumpPark + (startP - b.pumpPark) * u * u; b.pumpMoving = u > 0.02; b.pumpExt = 0; }
  b.pumping = p >= BUILD_A + 0.06 && p < BUILD_C - 0.06;
  const startX = visL() - 70, endX = visR() + 70;
  b.truckMoving = false;
  if (p < BUILD_A) { b.truckX = startX + (b.parkX - startX) * smooth01(p / BUILD_A); b.truckMoving = p < BUILD_A - 0.015; }
  else if (p < BUILD_C) b.truckX = b.parkX;
  else { const u = Math.max(0, (p - BUILD_C) / (1 - BUILD_C)); b.truckX = b.parkX + (endX - b.parkX) * u * u; b.truckMoving = u > 0.02; }
  b.pour = p >= BUILD_A && p < BUILD_A + 0.3;
  if (!b.sArr && p > 0.005) { b.sArr = true; playSfx('truckDrive', BUILD_A * b.dur * 0.9); }              // приїзд
  if (!b.sPour && p >= BUILD_A) { b.sPour = true; playSfx('concrete'); }                                // бетон із жолоба
  if (!b.sLeave && p >= BUILD_C + 0.03) { b.sLeave = true; playSfx('truckDrive', 2.2); }                 // від'їзд
  b.build = false; b.carry = false;
  if (p < BUILD_A) {                                           // Боді вибігає назустріч вантажівці, старий магазин ховається під шатро й розсипається
    b.r = 0; run = true; tx = (visL() - 20) + (b.parkX - 10 - (visL() - 20)) * smooth01(p / BUILD_A); b.bx = tx;
    if (p > 0.115 && !b.crumbled) { b.crumbled = true; b.shake = 0.9; playSfx('hammer'); playSfx('truckBrake'); for (let i = 0; i < 16; i++) spawnDust(o.x - 6 + (i / 15) * (o.w + 12), LAYOUT.curbY + 2, 1); buildSparks(o.x + o.w / 2, o.y + 8, 6, ['w', 'E']); }      // шатро лягло на магазин
  } else if (p < BUILD_C) {
    b.r = 0;                                                     // новий магазин лишається під шатром до самого кінця
    const ph = ((b.t - BUILD_A * b.dur) / 1.5) % 1, siteX = shop.x + shop.w * 0.24, pileX = b.parkX - 8;
    b.ph = ph;
    if (ph < 0.36) { tx = pileX + (siteX - pileX) * smooth01(ph / 0.36); run = true; b.carry = true; }                // несе відро бетону й цеглу до шатра
    else if (ph < 0.72) {                                                                                        // будує: мастерок і молоток б'ють по стіні під шатром
      tx = siteX; b.build = true; b.hitT += dt;
      if (b.hitT >= 0.2) { b.hitT = 0; b.shake = Math.max(b.shake, 0.3); buildSparks(siteX + b.bdir * 8, LAYOUT.curbY - 12, 3, ['y', 'w', 'c']); spawnDust(siteX, LAYOUT.curbY + 2, 1); b.hn = (b.hn | 0) + 1; if (b.hn % 2) playSfx('hammer'); }
    } else { tx = siteX + (pileX - siteX) * smooth01((ph - 0.72) / 0.28); run = true; }                       // повертається по нову порцію
    if (b.dustTimer <= 0) { b.dustTimer = 0.14; spawnDust(shop.x + rand(0, shop.w), LAYOUT.curbY + rand(-2, 4), 1); } else b.dustTimer -= dt;
  } else {                                                      // фінал: шатро знімається, салют, Боді підстрибує від радості
    b.r = 1; tx = cx; ty = LAYOUT.curbY + 5;
    if (!b.fin) { b.fin = true; b.shake = 1; playSfx('buildDone'); for (let i = 0; i < 18; i++) spawnDust(shop.x + (i / 17) * shop.w, LAYOUT.curbY, 1); }
    if (!b.cut && (p - BUILD_C) / (1 - BUILD_C) >= 0.5) { b.cut = true; const dr = doorWorld(); for (let i = 0; i < 12; i++) fx.sparks.push({ x: dr.cx + rand(-4, 4), y: shop.y + shop.door.y + 14, vx: rand(-40, 40), vy: rand(-50, -10), age: 0, life: 0.6, col: ['y', 'w', 'r', 'f'][i % 4] }); playSfx('pip'); }
    if (!b.vanish && p >= BUILD_C + 0.1) {                                                       // будівельні матеріали зникають у хмарках пилу
      b.vanish = true; playSfx('pip');
      [b.parkX - 8, shop.x + shop.w * 0.24 - 20].forEach(vx => { spawnDust(vx, LAYOUT.curbY + 8, 3); buildSparks(vx, LAYOUT.curbY + 2, 5, ['y', 'w']); });
    }
    b.fwT -= dt;
    if (b.fwT <= 0 && b.t < b.dur - 0.5) {
      b.fwT = 0.24; const pairs = [['y', 'h'], ['f', 'p'], ['s', 'a'], ['g', 'm'], ['r', 'o']], cols = pairs[b.fw++ % 5];
      const fxX = shop.x + rand(0, shop.w), fyY = shop.y - rand(8, 36);
      for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, sp = rand(26, 62); fx.sparks.push({ x: fxX, y: fyY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10, age: 0, life: rand(0.7, 1.1), col: cols[i % 2] }); }
      playSfx('pip');
    }
  }
  if (!(p < BUILD_A)) { b.bx += (tx - b.bx) * Math.min(1, dt * 7); }
  b.by += (ty - b.by) * Math.min(1, dt * (p < BUILD_A ? 20 : 9));
  if (Math.abs(tx - b.bx) > 0.8) b.bdir = tx > b.bx ? 1 : -1;
  b.run = run || Math.abs(tx - b.bx) > 1.5;
  ui.scene.style.transform = b.shake > 0.03 ? 'translate(' + (rand(-1, 1) * b.shake * 3).toFixed(1) + 'px,' + (rand(-1, 1) * b.shake * 3).toFixed(1) + 'px)' : '';
  if (b.t >= b.dur) finishBuild();
}
// Риштування навколо прямокутника: стовпи й дошки
function drawScaffold(x, y, w, h, alpha) {
  ctx.globalAlpha = alpha;
  const x0 = x - 3, x1 = x + w + 1;
  const poles = Math.max(2, Math.round((x1 - x0) / 20));
  for (let i = 0; i <= poles; i++) {
    const px = Math.round(x0 + (x1 - x0) * i / poles);
    R(ctx, px, y - 4, 2, h + 4, 'b');
    R(ctx, px, y - 4, 1, h + 4, 'l');
  }
  for (let py = LAYOUT.curbY - 14; py > y - 2; py -= 22) {
    R(ctx, x0, py, x1 - x0 + 2, 2, 'l');
    R(ctx, x0, py + 2, x1 - x0 + 2, 1, 'd');
  }
  ctx.globalAlpha = 1;
}

/* ---------- Команда на сцені ---------- */
const actors = [];               // звірятка, що працюють на вулиці
const bubbleEls = {};            // активні бульбашки з фразами (за ключем)
let chatterTimer = 20;

// Де стоїть звірятко: Голка — біля дверей, решта — на фіксованих місцях
function actorHome(m) {
  const s = m.spot;
  if (s.x === null) {
    if (mobileMQ.matches) { const cp = LAYOUT.capy; return cp ? Math.max(cp.x + 27, Math.min(cp.x + 50, visR() - 24)) : shop.x + shop.door.x + shop.door.w / 2 + 40; }   // на телефоні їжак теж праворуч від Капі, впритул до краю екрана (каса — ліворуч від нього, її частково затуляє Капі)
    const cp = LAYOUT.capy; return Math.min(worldR() - 24, cp.x + 14 + 62);          // на ПК їжак із касою стоїть праворуч від Капі, не впритул
  }
  // решта звіряток розставлені по всій ширині вулиці (f — частка ширини); на широкому екрані відстані більші
  const sc = Math.max(1, Math.min(1.3, (view.w - 36) / 284));
  return LAYOUT.centerX + (s.f - 0.5) * 284 * sc;
}
// Узгоджує список звіряток на сцені зі станом (хто найнятий — той на вулиці)
function syncActors() {
  TEAM.forEach((m, i) => {
    const has = state.team[i] > 0;
    const idx = actors.findIndex(a => a.i === i);
    if (has && idx < 0) actors.push({ i, x: actorHome(m), y: m.spot.y, dir: 1, t: rand(0, 10), hop: 0, moving: false, rest: 0, restIn: rand(CONFIG.SUMMER_REST_MIN, CONFIG.SUMMER_REST_MAX) });
    else if (!has && idx >= 0) actors.splice(idx, 1);
  });
}
function updateActors(dt) {
  actors.forEach(a => {
    const s = TEAM[a.i].spot;
    a.t += dt;
    a.hop = Math.max(0, a.hop - dt * 4);
    // влітку звірятка час від часу зупиняються перепочити й попити водички
    if (theme.season === 'summer' && animOn()) {
      if (a.rest > 0) { a.rest -= dt; if (a.rest <= 0) a.restIn = rand(CONFIG.SUMMER_REST_MIN, CONFIG.SUMMER_REST_MAX); }
      else {
        a.restIn -= dt;
        if (a.restIn <= 0) {
          a.rest = CONFIG.SUMMER_REST_SECONDS;
          if (Math.random() < 0.6 && Object.keys(bubbleEls).length < 1) showBubble('t' + a.i, t('summerSay_' + Math.floor(Math.random() * 5)), a.x, a.y - 19, () => ({ x: a.x, y: a.y - 19 }));
        }
      }
    } else a.rest = 0;
    if (a.rest > 0) { a.moving = false; return; }
    if (s.x === null) { a.moving = false; a.x = actorHome(TEAM[a.i]); return; }         // касир стоїть біля каси
    if (!a.mode) { a.mode = 'idle'; a.wait = rand(0.3, 3); a.speed = rand(11, 22); }
    const bottom = roadFloor();
    if (a.mode === 'sit') {                            // сидить на лавочці
      a.moving = false;
      a.sitT -= dt;
      if (a.sitT <= 0) { if (a.bench) a.bench.slots[a.slot].who = null; a.bench = null; a.mode = 'idle'; a.wait = rand(1, 3); a.y = Math.min(bottom, a.y + 6); }
      return;
    }
    if (a.y > bottom) a.y = bottom;
    if (a.mode === 'idle') {                           // стоїть і розглядається
      a.moving = false;
      a.wait -= dt;
      if (a.wait > 0) return;
      a.speed = rand(11, 22);
      const slots = [];
      benches.forEach(bn => bn.slots.forEach((sl, k) => { if (sl.who === null) slots.push([bn, k]); }));
      if (slots.length && Math.random() < 0.22) {      // іноді йде посидіти на лавочці
        const pick = slots[Math.floor(Math.random() * slots.length)];
        pick[0].slots[pick[1]].who = a.i; a.bench = pick[0]; a.slot = pick[1];
        a.mode = 'toBench'; a.tx = pick[0].x + pick[0].slots[pick[1]].dx; a.ty = pick[0].y + 3;
      } else { pickWanderTarget(a); a.mode = 'walk'; }
      return;
    }
    // іде до цілі (випадкова точка вулиці або лавочка)
    const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), step = a.speed * dt;
    if (d <= step) {
      a.x = a.tx; a.y = a.ty; a.moving = false;
      if (a.mode === 'toBench' && a.bench) {
        a.mode = 'sit'; a.sitT = rand(9, 16); a.y = a.bench.y - 3; a.dir = a.x < LAYOUT.centerX ? 1 : -1;
        if (Object.keys(bubbleEls).length < 1) showBubble('t' + a.i, t('team_' + TEAM[a.i].id + '_sit_' + Math.floor(Math.random() * 2)), a.x, a.y - 19, () => ({ x: a.x, y: a.y - 19 }));
      } else { a.mode = 'idle'; a.wait = rand(1, 5); }
    } else {
      a.x += dx / d * step; a.y += dy / d * step; a.moving = true;
      if (Math.abs(dx) > 0.5) a.dir = dx > 0 ? 1 : -1;
    }
  });
  // час від часу хтось сам щось каже
  chatterTimer -= dt;
  if (chatterTimer <= 0) {
    chatterTimer = rand(CONFIG.CHATTER_MIN, CONFIG.CHATTER_MAX);
    if (actors.length && Object.keys(bubbleEls).length < 1) { const a = actors[Math.floor(Math.random() * actors.length)]; actorSay(a); }
  }
}

// Випадкова точка, куди піти: недалеко від свого місця, але подалі від інших звіряток
function pickWanderTarget(a) {
  const home = actorHome(TEAM[a.i]);
  let best = null, bestD = -1;
  for (let k = 0; k < 6; k++) {
    const tx = Math.max(worldL() + 14, Math.min(worldR() - 14, home + rand(-85, 85)));
    const ty = rand(LAYOUT.streetTop + 8, roadFloor());
    let md = 1e9;
    actors.forEach(o => {
      if (o === a) return;
      const walking = o.mode === 'walk' || o.mode === 'toBench';
      md = Math.min(md, Math.hypot(tx - (walking ? o.tx : o.x), (ty - (walking ? o.ty : o.y)) * 1.6));
    });
    if (md > bestD) { bestD = md; best = [tx, ty]; }
  }
  a.tx = best[0]; a.ty = best[1];
}

// Предмет у лапках звірятка (малюється поверх спрайта). t — час, dir — куди йде
function drawTeamProp(prop, x, y, t, dir) {
  const ph = Math.floor(t * 3) % 2;
  switch (prop) {
    case 'register': {   // прилавок з касою стоїть збоку (ліворуч від їжака), щоб Голка було повністю видно, а не лише голову
      const rx = x - 27;
      R(ctx, rx, y - 7, 17, 7, 'b'); R(ctx, rx, y - 7, 17, 1, 'l'); R(ctx, rx, y - 1, 17, 1, 'd');
      R(ctx, rx + 2, y - 11, 7, 4, 'e'); R(ctx, rx + 3, y - 10, 5, 2, 'g'); R(ctx, rx + 11, y - 9, 4, 2, 'h');
      if (Math.floor(t * 1.2) % 3 === 0) R(ctx, rx + 12, y - 12 - ph, 2, 2, 'y');
      break;
    }
    case 'hammer': {     // молоток і дошка
      const up = Math.floor(t * 3) % 2 === 0;
      R(ctx, x + 7, y - 2, 13, 2, 'l'); R(ctx, x + 7, y - 1, 13, 1, 'd');
      if (up) { R(ctx, x + 11, y - 15, 1, 8, 'd'); R(ctx, x + 9, y - 17, 5, 3, 'e'); }
      else { R(ctx, x + 11, y - 9, 1, 7, 'd'); R(ctx, x + 9, y - 4, 5, 3, 'e'); R(ctx, x + 15, y - 4, 1, 1, 'y'); }
      break;
    }
    case 'tray':         // таця з цукерками
      R(ctx, x - 9, y - 8, 18, 2, 'b'); R(ctx, x - 9, y - 8, 18, 1, 'l');
      ['p', 'h', 'm', 'q'].forEach((c, k) => R(ctx, x - 7 + k * 4, y - 11 - ((k + ph) % 2), 3, 3, c));
      break;
    case 'baton':        // кийок охоронниці
      R(ctx, x + 9, y - 10, 2, 10, 'd'); R(ctx, x + 9, y - 10, 2, 2, 'h');
      break;
    case 'box':          // ящик
      R(ctx, x - 7, y - 6, 14, 6, 'c'); R(ctx, x - 7, y - 6, 14, 1, 'l'); R(ctx, x - 7, y - 1, 14, 1, 'd');
      R(ctx, x - 7, y - 6, 1, 6, 'd'); R(ctx, x + 6, y - 6, 1, 6, 'd'); R(ctx, x - 1, y - 6, 2, 6, 'b');
      break;
    case 'ledger':       // бухгалтерська книга
      R(ctx, x - 6, y - 8, 12, 6, 'w'); R(ctx, x - 6, y - 8, 12, 1, 'd'); R(ctx, x - 6, y - 3, 12, 1, 'd'); R(ctx, x, y - 8, 1, 6, 'd');
      R(ctx, x - 5, y - 6, 4, 1, 'e'); R(ctx, x + 2, y - 6 + ph, 3, 1, 'e');
      break;
    case 'broom': {      // віник
      const bx = x + 9 * dir;
      R(ctx, bx, y - 13, 1, 12, 'b'); R(ctx, bx - 2 + ph, y - 3, 5, 3, 'h'); R(ctx, bx - 2 + ph, y - 1, 5, 1, 'o');
      break;
    }
    case 'dress':        // сукня на вішаку
      R(ctx, x + 8, y - 14, 1, 3, 'd'); R(ctx, x + 6, y - 11, 5, 6, ph ? 'p' : 'u'); R(ctx, x + 5, y - 5, 7, 2, ph ? 'p' : 'u');
      break;
    case 'clipboard':    // планшет з папером
      R(ctx, x + 6, y - 12, 7, 9, 'l'); R(ctx, x + 7, y - 11, 5, 7, 'w');
      R(ctx, x + 8, y - 10 + ph, 3, 1, 'e'); R(ctx, x + 8, y - 8, 3, 1, 'e'); R(ctx, x + 8, y - 6, 2, 1, 'e');
      break;
    case 'megaphone':    // гучномовець
      R(ctx, x + 7, y - 12, 3, 4, 'p'); R(ctx, x + 10, y - 14, 3, 8, 'p'); R(ctx, x + 10, y - 14, 1, 8, 'q');
      if (ph) { R(ctx, x + 14, y - 12, 1, 1, 'w'); R(ctx, x + 16, y - 10, 1, 1, 'w'); R(ctx, x + 14, y - 8, 1, 1, 'w'); }
      else { R(ctx, x + 15, y - 11, 1, 1, 'w'); R(ctx, x + 17, y - 9, 1, 1, 'w'); }
      break;
    case 'tablet':       // планшет
      R(ctx, x - 5, y - 9, 10, 7, 'd'); R(ctx, x - 4, y - 8, 8, 5, ph ? 's' : 'S'); R(ctx, x - 2, y - 6, 1, 1, 'n');
      break;
    case 'cart': {       // візок
      const cx = x + 11 * dir;
      R(ctx, cx - 5, y - 8, 10, 5, 'e'); R(ctx, cx - 5, y - 8, 10, 1, 'E');
      R(ctx, cx - 4, y - 11, 3, 3, 'r'); R(ctx, cx, y - 11, 3, 3, 'g');
      R(ctx, cx - 4, y - 2, 2, 2, 'd'); R(ctx, cx + 2, y - 2, 2, 2, 'd');
      break;
    }
  }
}

const ACTOR_K = 1.4;                                   // звірята-працівники й гості: 16 px × 1,4 ≈ 22 px (було 1,56; −10%), Капі 24 px × 1,3 ≈ 31 px
function actorK(a) { return ACTOR_K; }
// Чітка «фігурка»: спрайт спершу масштабується (nearest) і лише потім обводиться — контур завжди рівно 1 px,
// без світного німба й без розмитих країв, які давав масштаб 1,56 прямо на сцені.
const crispFigCache = new Map();
function crispFigure(name, flip) {
  const key = name + '|' + (flip ? 1 : 0) + '|' + ACTOR_K;
  let c = crispFigCache.get(key); if (c) return c;
  const src = getSpriteCanvas(name), w = Math.round(src.width * ACTOR_K), h = Math.round(src.height * ACTOR_K);
  const body = document.createElement('canvas'); body.width = w; body.height = h;
  const bg = body.getContext('2d'); bg.imageSmoothingEnabled = false;
  if (flip) { bg.translate(w, 0); bg.scale(-1, 1); }
  bg.drawImage(src, 0, 0, w, h);
  const sil = document.createElement('canvas'); sil.width = w; sil.height = h;
  const sg = sil.getContext('2d'); sg.drawImage(body, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = PALETTE.k; sg.fillRect(0, 0, w, h);
  c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
  const g = c.getContext('2d'); [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(o => g.drawImage(sil, o[0], o[1])); g.drawImage(body, 1, 1);
  crispFigCache.set(key, c);
  return c;
}
function drawCrispFigure(name, x0, y0, bob, flip) {      // x0, y0 — ноги по центру; bob — підстрибування в «малих» пікселях
  ctx.drawImage(crispFigure(name, flip), Math.round(x0 - 8 * ACTOR_K) - 1, Math.round(y0 - (16 + bob) * ACTOR_K) - 1);
}
function actorPose(a) {
  const m = TEAM[a.i];
  const sitting = a.mode === 'sit';
  const waddle = a.moving ? Math.floor(a.t * 5) % 2 : 0;
  const idleBob = !a.moving && !sitting && Math.sin(a.t * 2.4 + a.i) > 0.7 ? 1 : 0;
  const hopY = Math.round(Math.sin(Math.min(1, a.hop) * Math.PI) * 4);
  let flip = a.moving ? waddle === 1 : false;
  if (m.id === 'tonya') flip = Math.floor(a.t / 3) % 2 === 1;   // охоронниця виглядає то вліво, то вправо
  return { m, x: Math.round(a.x), y: a.y, sitting, waddle, idleBob, hopY, flip, bob: waddle + idleBob + hopY };
}
function drawActor(a) {
  const x0 = Math.round(a.x), y0 = a.y, k = actorK(a), p = actorPose(a);
  const scaled = fn => { ctx.save(); ctx.translate(x0, y0); ctx.scale(k, k); ctx.translate(-x0, -y0); fn(); ctx.restore(); };
  scaled(() => { ctx.globalAlpha = 0.32; R(ctx, p.x - 7, p.y, 14, 2, 'd'); ctx.globalAlpha = 1; });
  drawCrispFigure(teamSprite(p.m.id), p.x, p.y, p.bob, p.flip);
  scaled(() => {
    const { m, x, y, sitting, waddle, idleBob, hopY } = p;
    if (hasHats()) drawHat(x, y - 13 - waddle - idleBob - hopY, a.i);
    if (!sitting) drawTeamProp(m.spot.prop, x, y - waddle - idleBob - hopY, a.t, a.dir);
    if (a.rest > 0) drawDrink(x, y - hopY, a.t);
    if (hasScarves()) drawScarf(x, y - 16 - waddle - idleBob - hopY, a.i);
  });
}
// Склянка води в лапках і краплі поту (літній перепочинок)
function drawDrink(x, y, t) {
  const sip = Math.floor(t * 2.5) % 3 === 0;           // час від часу склянка піднімається до рота
  const cy = sip ? y - 13 : y - 9;
  R(ctx, x + 4, cy - 1, 5, 6, 'd'); R(ctx, x + 5, cy, 3, 4, 'S'); R(ctx, x + 5, cy, 3, 1, 'w'); R(ctx, x + 5, cy + 2, 3, 2, 's');
  const ph = Math.floor((t * 3) % 3);
  R(ctx, x - 7, y - 17 + ph, 1, 2, 's'); R(ctx, x + 8, y - 18 + ph, 1, 1, 'S');
}
// Зимою на звірятках шарфики: шия + хвіст шарфа
const SCARF_COLORS = ['r', 'n', 'g', 'u', 'o', 'p'];
function hasScarves() { return theme.season === 'winter'; }
function drawScarf(cx, top, i) {          // top — верх спрайта 16×16
  const c = SCARF_COLORS[i % SCARF_COLORS.length];
  R(ctx, cx - 5, top + 9, 10, 2, c);
  for (let k = -4; k <= 4; k += 3) R(ctx, cx + k, top + 9, 1, 2, 'w');
  R(ctx, cx + 2, top + 11, 3, 4, c); R(ctx, cx + 2, top + 12, 3, 1, 'w'); R(ctx, cx + 2, top + 14, 3, 1, 'w');
}

function hitActor(p) {
  let best = null;
  actors.forEach(a => {
    if (Math.abs(p.x - a.x) <= 10 * actorK(a) && p.y >= a.y - 19 * actorK(a) && p.y <= a.y + 3 && (!best || a.y > best.y)) best = a;
  });
  return best;
}
function hitCapy(p) {
  const c = LAYOUT.capy;
  return p.x >= c.x + 14 - 17 * CAPY_K && p.x <= c.x + 14 + 17 * CAPY_K && p.y >= c.footY - 30 * CAPY_K && p.y <= c.footY;
}

// Межі видимої частини сцени для бульбашок (у координатах сцени)
function bubbleBounds() {
  const sceneH = parseFloat(ui.scene.style.height) || (view.h * sceneUnit);
  const top = -view.offY + (view.h * sceneUnit - sceneH) / sceneUnit;
  const tb = document.getElementById("topbar"), tbh = tb ? tb.getBoundingClientRect().bottom : 0;                        // верхню панель з рахунком бульбашки не перекривають
  return { l: visL(), r: visR(), t: top + 2, b: top + sceneH / sceneUnit, il: visL() + 38 / sceneUnit, ir: visR() - 40 / sceneUnit, it: top + (tbh + 6) / sceneUnit };
}
// Ставить бульбашку так, щоб вона повністю лишалась у кадрі
function placeBubble(el, x, y) {
  const bb = bubbleBounds(), hw = (el._w || (el._w = el.offsetWidth)) / 2 / sceneUnit + 2, hh = (el._h || (el._h = el.offsetHeight)) / sceneUnit + 6;
  const cx = Math.max(bb.il + hw, Math.min(bb.ir - hw, x)), cy = Math.max(bb.it + hh, Math.min(bb.b - 4, y));
  el._cx = cx;
  el.style.left = Math.round((cx + view.offX) * sceneUnit) + 'px'; el.style.top = Math.round((cy + view.offY) * sceneUnit) + 'px';
  const lim = Math.max(0, el.offsetWidth / 2 - 9);
  el.style.setProperty('--tail', Math.max(-lim, Math.min(lim, Math.round((x - cx) * sceneUnit))) + 'px');   // хвостик показує на звірятко, навіть коли бульбашка підсунута від краю кадру
}
function dropBubble(key) { const el = bubbleEls[key]; if (el) { clearTimeout(el._timer); el.remove(); delete bubbleEls[key]; } }
// Бульбашка з фразою над головою (key — щоб у одного персонажа була лише одна). Якщо той, хто говорить, поза видимою частиною вулиці — фраза не з'являється
function showBubble(key, text, x, y, follow) {
  const bb = bubbleBounds();
  if (x < bb.l + 3 || x > bb.r - 3) { dropBubble(key); return; }
  let el = bubbleEls[key];
  if (!el) {
    el = document.createElement('div');
    el.className = 'bubble';
    ui.bubbles.appendChild(el);
    bubbleEls[key] = el;
  }
  el.textContent = text; el._w = 0; el._h = 0;
  playSfx('pip');
  el._follow = follow || null;                  // follow — функція, що дає поточне місце того, хто говорить
  el._x = x; el._y = Math.max(24, y);
  placeBubble(el, x, el._y);
  Object.keys(bubbleEls).forEach(k => {                  // нова бульбашка прибирає старі поруч, щоб репліки не налазили одна на одну
    const o = bubbleEls[k];
    if (k !== key && Math.abs(o._cx - el._cx) < 58) dropBubble(k);
  });
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.remove(); delete bubbleEls[key]; }, Math.max(CONFIG.BUBBLE_SECONDS, 1.8 + text.length * 0.055) * 1000);
}
// Бульбашки йдуть слідом за звірятком, яке говорить
function updateBubbles() {
  const bb = bubbleBounds();
  Object.keys(bubbleEls).forEach(k => {
    const el = bubbleEls[k];
    if (!el._follow) { if (el._x < bb.l + 3 || el._x > bb.r - 3) { dropBubble(k); return; } placeBubble(el, el._x, el._y); return; }
    const p = el._follow();
    if (!p) { dropBubble(k); return; }
    if (p.x < bb.l + 3 || p.x > bb.r - 3) { dropBubble(k); return; }        // звірятко пішло за межі кадру (або камеру посунули) — репліка зникає
    placeBubble(el, p.x, Math.max(24, p.y));
  });
}
// Репліку обирає ситуація: взимку часто «холодні» фрази, часом — загальна репліка епохи, інакше — власна фраза звірятка; та сама фраза підряд не повторюється
function pickLine(id, own, cold, nCold) {
  const winter = theme.season === 'winter', ep = viewEpoch() % 8;
  for (let k = 0; k < 4; k++) {
    const r = Math.random();
    let key;
    if (winter && r < 0.4) key = cold + Math.floor(Math.random() * nCold);
    else if (r < (winter ? 0.62 : 0.3)) key = 'epoch_say_' + ep + '_' + Math.floor(Math.random() * 6);
    else key = own();
    if (key !== lastLine[id] || k === 3) { lastLine[id] = key; return t(key); }
  }
}
function actorSay(a) {
  const m = TEAM[a.i], up = () => ({ x: a.x, y: a.y - 19 * actorK(a) - 1 });
  const p = up();
  showBubble('t' + a.i, pickLine(m.id, () => 'team_' + m.id + '_say_' + Math.floor(Math.random() * TEAM_PHRASES), 'team_' + m.id + '_cold_', 3), p.x, p.y, up);
}
function wornSkinIds() {                                                       // ідентифікатори скінів, які зараз вдягнено (для реплік)
  const ids = [];
  SKIN_TYPES.forEach(ty => { const sk = skinOn(ty); if (sk) ids.push(ty + '_' + sk); });
  return ids;
}
// Живі репліки скінів: по 3–8 на скін, вибираються навмання без повтору поспіль (старі skinSay_* лишились запасним варіантом)
const SKIN_LINES = {"uk":{"capy_pirate":["Папуга знову вкрав моє печиво. Зрадник!","Де скарб? А, ось він. Це каса.","Йо-хо-хо... ой, доброго дня, шановні покупці!","Пов’язка на оці. Тепер бачу лише знижки."],"capy_astro":["Х’юстоне, чуєш? Тут пахне булочками!","У шоломі так тихо... Тільки я і мої думки. О, покупець!","Невагомість — це коли ніхто не просить “ще знижку”.","Один маленький тап для Капі, один гігантський прибуток для магазину."],"capy_wizard":["Абра-кадабра... ні, це не те. Зараз згадаю.","Борода сама росте. Я тут ні до чого. Ну, майже.","Чарівна паличка загубилась. Зате лишились нерви.","Зірки на мантії підморгують. Або мені здається."],"capy_chef":["Щось пахне смачно. То не я, то сусіди!","Ковпак великий, а ложка ще більша. Бачите?","Шеф радить: не їжте товар. Вибір уже зроблений.","Сіль, перець і трохи терпіння. Це весь секрет."],"capy_explorer":["За цим рогом точно щось цікаве. Або кіт.","Бінокль дивиться вгору, а я шукаю печиво.","Рюкзак важкий, зате там три бутерброди!","Мапа показує на північ. А ми на південь. Вибачте."],"capy_santa":["Хо-хо-хо! Хтось тут був чемний. Не будемо називати імен.","Мішок порожній. Усе роздано... мені.","Борода лоскочеться. Це так і має бути?","Кожен день трохи Різдво, коли вдягнеш червоне!"],"capy_witch":["Метла в ремонті. Тепер літаю на надії.","Гарбуз на спині дивиться на мене. Я теж на нього.","Зілля готове! Правда, нічого не пам’ятаю, що там було.","Брррр! Це хтось прошепотів “знижка”?"],"capy_flower":["Метелик сів мені на спину. Тс-с, не рухайтеся.","Квіти пахнуть весною. А я пахну квітами. Гарно!","Вінок трохи з’їхав. Але мені навіть подобається.","Бджоли вже питали, чи можна в нас пожити."],"capy_beach":["Хочу в море. Але тут хоч тінь від магазину.","М’яч на спині не втече. А от я втечу на пляж!","Окуляри темні, настрій світлий.","Лимонад, будь ласка. З льодом. І парасольку!"],"capy_autumn":["Шарф такий довгий, що я за нього чіпляюсь.","Листя шарудить, а в мене кава. Ідеальний ранок.","Осінь пахне корицею. Чи то від мене?","Теплий светр — це як обійми. Тільки трохи кусається."],"capy_ep0":["Береток набік, перо вгору. Ось тепер я митець.","Ця лілія на мантії не проста. Вона дорога!","Лютня десь грає. Хто там, виходьте!","Я весь у ренесансі. А ви?"],"capy_ep1":["Радіо ловить лише одну хвилю. Ну й нехай!","Літера C означає «Супер Капі». Секретна розшифровка.","Бульбашка жуйки... Ой, вона лопнула.","Куртка стара, а настрій новий."],"capy_ep2":["Диско-куля сяє! Я теж трохи сяю.","Окуляри великі, а бачу все. Навіть хто не платить.","Ноги самі просяться в танець!","Блиск, блиск, іще раз блиск!"],"capy_ep3":["Рівень пройдено! Наступний: порожня каса.","Геймпад на грудях. Для швидких рішень.","Один круг монет — і тут уже +1 життя.","Навушники грають восьмибітну музику. Класика!"],"capy_ep4":["Мій телефон на 1%. А настрій на сто!","Wi-Fi знайшов! Тепер можна жити.","Рюкзак повний стікерів. Сорок шість разів “лайк”.","Мене ніхто не підписав. Але я не ображаюсь."],"capy_ep5":["Паросток на рюкзаку підріс на сантиметр. Я пишаюсь!","Дерева ростуть, а ми їм допомагаємо.","Куртка зі старих пляшок. Нова, але з історією!","Дихайте глибоко. Тут майже ліс."],"capy_ep6":["Тиша... Тільки я і зорі. О, це касир кличе.","Шолом запотів, бо я радий!","Невагомість мені подобається. Бо печиво не падає.","Ракета чекає. А я чекаю покупців."],"capy_ep7":["Неон миготить, а я нервово усміхаюсь.","Візор світиться, але бачу гірше. Ох, стиль!","Місто ввечері — це як світломузика.","Кросівки теж світяться. Ходжу, як ліхтарик."],"capy_knight":["Мій меч гострий, а ціни чесні. Принаймні сьогодні.","Шолом великий, а видно тільки носа. Зручно!","Поки я у броні, нікому до мене діла. Мрія.","Хто тут ображає покупців? Назад, лицар уже в дорозі!"],"capy_hero":["Плащ розвівається, а я ні. Контролюю ситуацію.","Моя суперсила: знаходити печиво за три метри.","Маска трохи тисне, але героям так і треба.","Хтось тут кричав? Спокійно, я вже їду!"],"capy_cowboy":["У цьому місті діє закон. І закон каже: купуйте.","Капелюх з’їжджає на очі. Тримаю рівновагу.","Шериф вийшов на вулицю. Тихо!","Хустка пахне пилом і пригодами."],"capy_fairy":["Крильця щекочуть, коли сміюсь. Хі-хі.","Дрібка чарів, і день стає світлішим.","Корона ледь тримається на вухах. Це нормально?","Усі побажання виконую. Окрім “знижка ще більша”."],"capy_viking":["Рогатий шолом зачіпається за двері. Знову.","Щит міцний, а я м’який. Баланс!","На абордаж... тобто на кухню. Там вечеря.","Бородатий вікінг хоче обійми. Хто за?"],"capy_pilot":["Окуляри запотіли. Лечу наосліп, але з любов’ю.","Шарф довгий, а крила короткі. Вирішую по ходу.","Пристебніться! Зараз буде невеличка турбулентність.","Приземлення м’яке, як булочка."],"capy_mel":["Я Мел. Так, лис. Ні, капібарою не стану.","Хвіст пухнастий, а в голові ідей ще пухнастіше!","Хтось казав “хитрий лис”? Я просто думаю наперед.","Мел тут, щоб усе було гарно і смачно.","Дві лапи на клавіатурі, одна на кнопці “зберегти”.","Нашу гру збирали вночі. Тому в ній трохи ночі.","Якщо щось блимає не так, це не баг. Це… задум!","Ніка принесла каву. Я випив. Вона, здається, теж."],"capy_nika":["Я Ніка. Стрибаю, коли хвилююсь.","Бантик на місці, вуха на місці, ідея теж.","Морквину нікому не віддам. Навіть Мелу.","Хтось казав “зайка”? Прийом, ми вже тут!","Зробили гру з любові до міст і до капібар.","Іноді пишу код, іноді малюю, іноді просто ляскаю вухами.","Мел знову плутає тап і клік. Не поправляю.","Дякую, що граєте. Мені аж вушка теплішають."],"shop_candy":["Тут усе липке. Але приємно.","Лоліпоп вищий за мене. Мрія збулась.","Не облизуйте стіни. Я це кажу і собі."],"shop_gold":["Сяє так, що я бачу зайчики.","Золото холодне, а настрій теплий.","Касир носить окуляри від блиску. Правда!"],"shop_ice":["Бр-р-р! Але гарно, як у казці.","Сосулька впала. Не на мене, слава небу.","Знижки тут не тануть. Бо морозні!"],"shop_wood":["Пахне смолою й теплом. Як у лісі.","Дерев’яна хатина тримається міцно. Як я.","Скрип-скрип. Це добре. Це затишок!"],"shop_garden":["Квіти ростуть на даху. Хтось їх поливає?","Тут живе бджола. Ми вже подружились.","Магазин-сад: гуляєш і купуєш. Зручно."],"shop_xmas":["Вогники миготять. Мені теж хочеться.","Під ялинкою точно щось є. Я не дивлюсь... дивлюсь.","У магазині пахне мандаринами. Мрія!"],"shop_halloween":["Хтось ходить на горищі. Не я, чесно.","Гарбуз усміхається ширше за мене.","Цукерки чи жарт? Я вибираю цукерки."],"shop_spring":["Весна прийшла! Навіть у каси.","Пелюстки на даху. Дуже мило.","Птахи співають, а покупці усміхаються."],"shop_autumn":["Листя на даху шарудить, як мишка.","Тепло, затишно, і пахне яблуками.","Осінь у магазині — це як обійми."],"weather_rainbow":["Веселка! Дивіться, дивіться! Ой, зникла.","Кольорів так багато, що я їх не рахую.","Десь під нею точно ховається горщик із печивом."],"weather_lightning":["Бах! Це було гучно, але красиво.","Блискавка фіолетова. Мені подобається.","Тримаю вуха під кепкою. На всяк випадок."],"weather_lightninggreen":["Зелена блискавка! Точно чарівна.","Бах-бах! А чому не червона?","Хтось там у небі грається в неон."],"weather_lightningred":["Червона блискавка! Аж серце тьохнуло.","Вона така яскрава, що я мружусь.","Небо сердиться, але гарно сердиться."],"weather_cottoncloud":["Хмара з цукрової вати. Хто надкусив?","Хочу залізти й поспати. Вона ж солодка!","Дощику з карамелі ще не чекаємо?"],"weather_goldcloud":["Золота хмара! Іноді з неї падають монети.","Небо теж вирішило заробляти. Молодець.","Дивіться вгору. Може, пощастить!"],"weather_starcloud":["Зірки у хмарах мерехтять. Загадаю бажання.","Хмара переливається. Хочу таку шапку.","Тихо, тихо... Чуєте, як вона співає?"],"hero_party":["Свято щодня! Конфеті в кожній кишені.","Помічники в капелюшках. Просто мрія.","Ну що, потанцюємо? Каса почекає."],"hero_ninja":["Хтось пробіг? Ні? Ну, тоді то були ніндзя.","Тихо як тінь. Кажуть, це наші.","Я їх не бачу. І не побачу. Вони молодці."],"hero_chef":["Пахне булочками. Хто там готує?","Помічники-кухарі нагодують і покупців, і мене.","Тільки не їжте товар. Це я собі кажу."],"hero_wizard":["Помічники чаклують! Черга зменшується сама.","Мантії блимають, а я усміхаюсь.","Чарівна паличка в кишені? Мене теж навчіть!"],"hero_royal":["Помічники в коронах. Ваша величносте, каса там!","Король із ковбасою? Це вже вищий рівень.","Королівська команда працює без вихідних."],"hero_santa":["Пакують подарунки так швидко, що я не встигаю.","Червоні шапки скрізь. Свята прийшли!","Хо-хо, це вже не жарт, це команда!"],"hero_witch":["Відьмочки літають між полицями. Тільки б не збили.","Капелюхи гострі. Не підходьте надто близько.","Зілля для швидкого обслуговування. Корисно!"],"street_brick":["Цегляна дорога. Куди вона веде? До каси!","Ходити приємно. Кожна цеглина рівна.","Дорога червона. Як мої щоки зараз."],"street_wood":["Дошки скрипять під лапами. Затишно!","Дерев’яна доріжка пахне лісом.","Скрип-скрип. Наче хтось іде. Ой, це я."],"street_leaves":["Хрум-хрум! Мій улюблений звук осені.","Листя під лапами: як килим із чорного золота.","Хтось розсипав листя. Дякую, добра людино!"],"street_snow":["Сніг! Ні, не їсти. Обійдусь без снігу.","Лапи холодні, а серце тепле.","Скрип-скрип. Сніг — теж музика."],"street_moss":["Мох м’який, як килим. Піду полежу.","Замшіла бруківка пам’ятає багато історій.","У шві росте квіточка. Не наступіть!"],"street_gold":["Золота дорога! Хоч і не з рубінів.","Іду, а під лапами сяє. Приємно.","Цеглина з монети. Не чіпати, не мою."]},"en":{"capy_pirate":["The parrot stole my cookie again. Traitor!","Where's the treasure? Oh, that's the till.","Yo-ho-ho... oh, hello, dear customers!","Eye patch on. Now I only see discounts."],"capy_astro":["Houston, do you smell buns?","So quiet in the helmet... just me and my thoughts. Oh, a customer!","Zero gravity is when nobody asks for 'one more discount'.","One small tap for Capy, one giant profit for the shop."],"capy_wizard":["Abra-ca-dabra... no, wrong one. I'll remember in a sec.","The beard grows on its own. I did nothing. Almost.","I lost my wand. At least my nerves are still here.","The stars on my robe are winking. Or I'm imagining."],"capy_chef":["Something smells great. Not me, it's the neighbours!","Big hat, bigger spoon. See?","The chef advises: don't eat the goods. The choice is made.","Salt, pepper and a little patience. That's the whole secret."],"capy_explorer":["Something interesting is round that corner. Or a cat.","The binoculars look up, I look for cookies.","The backpack is heavy, but it has three sandwiches!","The map says north. We go south. Sorry."],"capy_santa":["Ho-ho-ho! Someone here was good. No names.","The sack is empty. I gave it all... to myself.","The beard tickles. Is it supposed to?","Every day is a bit of Christmas when you wear red!"],"capy_witch":["The broom is being repaired. I fly on hope now.","The pumpkin on my back stares at me. I stare back.","The potion is ready! I just forgot what's in it.","Brrr! Did someone whisper 'discount'?"],"capy_flower":["A butterfly landed on my back. Shh, nobody move.","Flowers smell like spring. And I smell like flowers. Nice!","The wreath slipped a bit. I kind of like it.","The bees already asked if they can live here."],"capy_beach":["I want the sea. But at least here's the shop's shade.","The ball on my back won't run away. I will, to the beach!","Dark glasses, bright mood.","Lemonade, please. With ice. And an umbrella!"],"capy_autumn":["The scarf is so long that I trip on it.","Leaves rustle, I have coffee. Perfect morning.","Autumn smells like cinnamon. Or is it me?","A warm sweater is like a hug. Slightly scratchy."],"capy_ep0":["Beret aside, feather up. Now I'm an artist.","This lily on my cloak isn't plain. It's expensive!","A lute is playing somewhere. Come out, whoever you are!","I'm all Renaissance. And you?"],"capy_ep1":["The radio catches one wave only. Fine!","The C stands for 'Super Capy'. I made it up.","A bubblegum bubble... oh, it popped.","The jacket is old, the mood is new."],"capy_ep2":["The disco ball is shining! I shine a little too.","Big glasses, and I see everything. Even who doesn't pay.","My feet are asking for a dance!","Sparkle, sparkle, one more sparkle!"],"capy_ep3":["Level cleared! Next: an empty till.","A gamepad on my chest. For quick decisions.","One coin lap and that's +1 life.","My headphones play 8-bit music. A classic!"],"capy_ep4":["My phone is at 1%. My mood is at 100!","Found Wi-Fi! Now life can go on.","The backpack is full of stickers. Forty-six likes.","Nobody followed me. But I'm not offended."],"capy_ep5":["The sprout on my backpack grew a centimetre. So proud!","Trees grow, and we help them.","A jacket from old bottles. New, but with a story!","Breathe deeply. It's almost a forest here."],"capy_ep6":["Silence... just me and the stars. Oh, the cashier is calling.","The helmet fogged up because I'm happy!","I like zero gravity. The cookies don't fall.","The rocket is waiting. I'm waiting for customers."],"capy_ep7":["The neon blinks and I smile nervously.","My visor glows, but I see worse. Oh, style!","The city at night is like a light show.","My sneakers glow too. I walk like a lantern."],"capy_knight":["My sword is sharp, my prices are honest. At least today.","Big helmet, only my nose is visible. Handy!","While I'm in armour, nobody bothers me. A dream.","Who's bothering the customers? Step back, I'm ready!"],"capy_hero":["The cape flutters, I don't. Situation under control.","My superpower: finding cookies from three metres away.","The mask is a bit tight, but that's how heroes are.","Did someone shout? Calm down, I'm already coming!"],"capy_cowboy":["There's law in this town. And the law says: buy.","My hat slides over my eyes. Keeping my balance.","The sheriff is on the street. Quiet!","The bandana smells of dust and adventure."],"capy_fairy":["My wings tickle when I laugh. Hee-hee.","A pinch of magic, and the day gets brighter.","The crown barely stays on my ears. Is that normal?","I grant every wish. Except 'an even bigger discount'."],"capy_viking":["The horned helmet snags on the door. Again.","The shield is strong, I'm soft. Balance!","To the boarding... I mean to the kitchen. Dinner's there.","A bearded Viking wants a hug. Who's in?"],"capy_pilot":["My goggles fogged up. Flying blind, but with love.","Long scarf, short wings. I'll figure it out.","Buckle up! A bit of turbulence ahead.","The landing is soft as a bun."],"capy_mel":["I'm Mel. Yes, a fox. No, I won't turn into a capybara.","My tail is fluffy, and my ideas are even fluffier!","Someone said 'sly fox'? I just plan ahead.","Mel is here to keep everything pretty and tasty.","Two paws on the keyboard, one on the 'save' button.","We built this game at night. That's why it has a bit of night.","If something blinks wrong, it's not a bug. It's... a feature!","Nika brought coffee. I drank it. She did too, I think."],"capy_nika":["I'm Nika. I hop when I'm excited.","Bow in place, ears in place, idea in place.","I won't give my carrot to anyone. Not even Mel.","Someone said 'bunny'? Roger, we're here!","We made this game out of love for towns and capybaras.","Sometimes I code, sometimes I draw, sometimes I just flap my ears.","Mel mixes up tap and click again. I don't correct him.","Thanks for playing. My ears get warm."],"shop_candy":["Everything is sticky here. But nice.","The lollipop is taller than me. Dream come true.","Don't lick the walls. I'm telling myself too."],"shop_gold":["It shines so much I see sparkles.","Gold is cold, but the mood is warm.","The cashier wears sunglasses against the glare. True!"],"shop_ice":["Brr! But so pretty, like a fairy tale.","An icicle fell. Not on me, thank goodness.","Discounts don't melt here. They're frozen!"],"shop_wood":["Smells of resin and warmth. Like a forest.","The wooden cabin stands firm. Like me.","Creak-creak. That's good. That's cosy!"],"shop_garden":["Flowers grow on the roof. Who waters them?","A bee lives here. We're already friends.","A shop-garden: stroll and shop. Handy."],"shop_xmas":["The lights blink. I want to blink too.","There's definitely something under the tree. I'm not looking... I'm looking.","The shop smells of tangerines. A dream!"],"shop_halloween":["Someone's walking in the attic. Not me, honest.","The pumpkin smiles wider than me.","Trick or treat? I choose the treat."],"shop_spring":["Spring is here! Even at the till.","Petals on the roof. So sweet.","Birds sing and customers smile."],"shop_autumn":["Leaves on the roof rustle like a mouse.","Warm, cosy, smells of apples.","Autumn in a shop is like a hug."],"weather_rainbow":["A rainbow! Look, look! Oh, gone.","So many colours I stopped counting.","Somewhere under it hides a pot of cookies."],"weather_lightning":["Boom! That was loud, but pretty.","The lightning is purple. I like it.","Keeping my ears under my cap. Just in case."],"weather_lightninggreen":["Green lightning! Definitely magic.","Boom-boom! Why not red?","Someone up there is playing with neon."],"weather_lightningred":["Red lightning! My heart skipped.","It's so bright I squint.","The sky is angry, but in a pretty way."],"weather_cottoncloud":["A cotton candy cloud. Who took a bite?","I want to climb in and nap. It's sweet!","Caramel rain, anyone?"],"weather_goldcloud":["A gold cloud! Sometimes coins fall from it.","The sky decided to earn too. Good job.","Look up. Maybe you'll be lucky!"],"weather_starcloud":["Stars in the clouds are twinkling. Making a wish.","The cloud shimmers. I want that hat.","Hush, hush... Can you hear it singing?"],"hero_party":["A party every day! Confetti in every pocket.","Helpers in party hats. Just a dream.","Shall we dance? The till can wait."],"hero_ninja":["Did someone run by? No? Then it was ninjas.","Quiet as a shadow. They say that's ours.","I didn't see them. And I won't. Good work."],"hero_chef":["Smells like buns. Who's cooking?","Chef helpers will feed the customers and me.","Just don't eat the goods. I'm telling myself."],"hero_wizard":["Helpers are casting spells! The queue shrinks by itself.","Robes blink, and I smile.","A magic wand in your pocket? Teach me too!"],"hero_royal":["Helpers in crowns. Your Majesty, the till is that way!","A king with a sausage? That's the next level.","The royal team works without days off."],"hero_santa":["They wrap gifts so fast I can't keep up.","Red hats everywhere. The holidays are here!","Ho-ho, that's not a joke, that's a team!"],"hero_witch":["Little witches fly between the shelves. Hope nobody gets hit.","The hats are pointy. Don't get too close.","A potion for fast service. Useful!"],"street_brick":["A brick road. Where does it lead? To the till!","Nice to walk on. Every brick is straight.","The road is red. Like my cheeks right now."],"street_wood":["Boards creak under my paws. Cosy!","A wooden path smells of the forest.","Creak-creak. Like someone's coming. Oh, it's me."],"street_leaves":["Crunch-crunch! My favourite autumn sound.","Leaves under paws: a carpet of dark gold.","Someone scattered leaves. Thanks, kind soul!"],"street_snow":["Snow! No, don't eat it. I'm stopping myself too.","My paws are cold, my heart is warm.","Crunch-crunch. Snow is music too."],"street_moss":["Moss is soft like a carpet. Going to lie down.","Mossy cobbles remember many stories.","A little flower grows in the crack. Don't step on it!"],"street_gold":["A golden road! Not made of rubies though.","I walk and it sparkles under my paws. Nice.","A brick made from coins. Not touching, not mine."]}};
const skinLineLast = {};
function skinLine(id) {
  const arr = (SKIN_LINES[state.lang] || SKIN_LINES.en)[id]; if (!arr || !arr.length) return null;
  let i = Math.floor(Math.random() * arr.length); if (arr.length > 1 && i === skinLineLast[id]) i = (i + 1 + Math.floor(Math.random() * (arr.length - 1))) % arr.length;
  skinLineLast[id] = i; return arr[i];
}
function capySay(forceId) {
  const c = LAYOUT.capy, worn = wornSkinIds();
  let id = forceId || null;
  if (!id && worn.length && Math.random() < 0.65) { const cs = worn.find(w => w.startsWith('capy_')); id = (cs && Math.random() < 0.6) ? cs : worn[Math.floor(Math.random() * worn.length)]; }
  const key = id ? 'skinSay_' + id : '';
  let pi = Math.floor(Math.random() * CAPY_PHRASES); if (skinOn('capy')) { const ok = [...Array(CAPY_PHRASES).keys()].filter(n => n !== 1 && n !== 4); pi = ok[Math.floor(Math.random() * ok.length)]; }       // у скіні Капі не жартує про квіточку на голові
  const txt = (id && skinLine(id)) || (key && t(key) !== key ? t(key) : pickLine('capy', () => 'capy_say_' + pi, 'capy_cold_', 3));
  showBubble('capy', txt, c.x + 14, c.footY - 32 * CAPY_K);
}

// Прокачування звірятка після 10-го рівня: кожні 10 дають зірку (бонус доходить до ×1,25 / ×1,5 / ×2)
function buyStar(i) {
  const plus = teamPlusOf(i);
  if (plus >= PLUS_MAX) return;
  const cost = plusCost(i, plus + 1);
  if (!(state.coins >= cost)) return;
  state.coins -= cost; state.stats.teamUps = (state.stats.teamUps || 0) + 1;
  state.teamPlus[i] = plus + 1;
  recalcIncome();
  const a = actors.find(x => x.i === i), name = t('team_' + TEAM[i].id), n = (plus + 1) / STAR_STEP;
  if (n === Math.floor(n)) {
    if (a) { a.hop = 1; spawnDust(a.x, a.y - 2, 8); }
    showToast(t('teamStarred', name, n), 'big');
  } else showToast(t('teamPlus', name, (plus + 1) % STAR_STEP, STAR_STEP, Math.floor(n) + 1), 'good');
  playSfx('upgrade');
  updateUI(); saveGame();
}
// Найняти або прокачати звірятко
function hireOrUpgrade(i) {
  const lvl = state.team[i];
  if (isTeamUnlocked(i) && lvl >= CONFIG.TEAM_MAX_LEVEL) { buyStar(i); return; }
  if (!isTeamUnlocked(i) || lvl >= CONFIG.TEAM_MAX_LEVEL) return;
  const cost = teamCost(i, lvl + 1);
  if (!(state.coins >= cost)) return;
  state.coins -= cost; state.stats.teamUps = (state.stats.teamUps || 0) + 1;
  state.team[i] = lvl + 1;
  state.teamKnown[i] = 1;
  state.stats.teamMaxLevel = Math.max(state.stats.teamMaxLevel, lvl + 1);
  recalcIncome();
  const name = t('team_' + TEAM[i].id);
  if (lvl === 0) {
    syncActors();
    const a = actors.find(x => x.i === i);
    a.hop = 1;
    spawnDust(a.x, a.y - 2, 6);
    showToast(t('teamHired', name), 'big');
    playSfx('hire');
    actorSay(a);
  } else {
    showToast(t('teamUpgraded', name, lvl + 1), 'good');
    playSfx('upgrade');
  }
  updateUI();
}

/* ---------- Покупці ---------- */
function customerTarget() {
  if (state.cps <= 0) return 2;
  return Math.min(CONFIG.MAX_CUSTOMERS + 4, 4 + Math.floor(Math.log10(state.cps + 1) * 2));      // трохи більше покупців, ніж раніше
}
// Куди йде звіреня, що покидає сцену: трохи за краєм того, що видно (світ широкий, тож до його краю йти надто довго)
function passEdge(dir) { return dir > 0 ? Math.min(worldR() + 16, visR() + 30 + rand(0, 120)) : Math.max(worldL() - 16, visL() - 30 - rand(0, 120)); }
function spawnCustomer() {
  const fromLeft = Math.random() < 0.5;
  const lane = rand(LAYOUT.lane.min, Math.max(LAYOUT.lane.min + 4, roadFloor()));
  const goesShopping = Math.random() < 0.7;
  const c = {
    type: CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)],
    x: fromLeft ? Math.max(worldL() - 14, visL() - 20 - rand(0, 110)) : Math.min(worldR() + 14, visR() + 20 + rand(0, 110)),
    y: lane, lane,
    dir: fromLeft ? 1 : -1,
    speed: rand(16, 26),
    anim: rand(0, 2),
    mode: goesShopping ? 'toDoor' : 'pass',
    doorX: shop.x + shop.door.x + shop.door.w / 2 + rand(-4, 4),
    passTo: fromLeft ? Math.min(worldR() + 16, visR() + 30 + rand(0, 160)) : Math.max(worldL() - 16, visL() - 30 - rand(0, 160)),
    alpha: 1, t: 0, stay: 0,
    bag: null
  };
  customers.push(c);
}
// Золотий покупець: проходить вулицею з побажанням; тап по ньому дає монети (іноді кристал)
let vipTimer = 70;
const goldCache = {};
function goldCanvas(type, frame) {
  const key = type + frame;
  if (goldCache[key]) return goldCache[key];
  const src = getSpriteCanvas(type + '_' + frame), c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255, 196, 48, 0.66)'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(255, 255, 255, 0.22)'; g.fillRect(0, 0, c.width, c.height >> 1);
  return (goldCache[key] = c);
}
function spawnVip() {
  const fromLeft = Math.random() < 0.5, lane = rand(LAYOUT.lane.min, Math.max(LAYOUT.lane.min + 4, roadFloor()));
  const open = DEPARTMENTS.map((d, i) => i).filter(isDeptUnlocked);
  customers.push({ type: CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)], x: fromLeft ? visL() - 12 : visR() + 12, y: lane, lane, dir: fromLeft ? 1 : -1, speed: 25, anim: 0, mode: 'pass', passTo: fromLeft ? visR() + 18 : visL() - 18, alpha: 1, t: 0, stay: 0, bag: null, vip: true, wish: open[Math.floor(Math.random() * open.length)] });
  showToast(t('vipToast'), 'good'); playSfx('pip');
}
function hitVip(p) {
  for (const c of customers) {
    if (!c.vip || c.vipDone) continue;
    if (Math.abs(p.x - c.x) <= 20 && p.y >= c.y - 44 && p.y <= c.y + 5) {
      c.vipDone = true; c.speed = 62; state.stats.vipTaps = (state.stats.vipTaps || 0) + 1;
      const crystal = Math.random() < 0.2;                                  // нагорода одна з двох: кристал або ×5 золота
      const gain = crystal ? 0 : Math.floor((state.cps * 40 + 200 * levelMult()) * 5);
      if (crystal) { state.crystals += 1; state.crystalsTotal += 1; } else { state.coins += gain; state.totalEarned += gain; }
      for (let i = 0; i < 14; i++) { const a = rand(0, Math.PI * 2), sp = rand(30, 80); fx.sparks.push({ x: c.x, y: c.y - 12, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 24, age: 0, life: rand(0.4, 0.7), col: i % 2 ? 'y' : 'h' }); }
      spawnFloater(c.x, c.y - 24, crystal ? '+1 ' + GEM_CH : '×5 +' + fmt(gain)); playSfx(crystal ? 'wheelWin' : 'upgrade'); buzz(30);
      showBubble('vip', t(crystal ? 'vipSayCrystal' : 'vipSayGold'), c.x, c.y - 34, () => ({ x: c.x, y: c.y - 34 }));
      showToast(crystal ? t('vipCrystal') : t('vipGold', fmt(gain)), 'big');                // спливає, що саме він дав
      updateUI();
      return true;
    }
  }
  return false;
}
// Транспорт, що їде дорогою (поштова машина, цирк): звірята на дорозі лякаються, підскакують, тікають на бруківку й трусяться, поки він проїде
function roadHazards() {
  const hz = [];
  if (mail.state === 'arriving' || mail.state === 'leaving') hz.push({ x: mail.x, hw: 22 });
  if (state.circus.phase === 2.5 || state.circus.phase === 4) hz.push({ x: circus.x, hw: 84 });
  return hz;
}
function hazardNearX(c, hz) { return hz.find(h => { const dx = c.x - h.x; return dx > -(h.hw + 40) && dx < h.hw + 12; }); }
function roadDanger(c) {
  if (c.y < mailRoadY() - 24) return null;
  return hazardNearX(c, roadHazards()) || null;
}
const FEAR_LINES = 6;
let lastFearSay = 0;
function startFear(c, hz) {
  c.fear = { t: 0, stage: 0, ty: mailRoadY() - 27 - rand(0, 6), fy: 0, sx: 0, origDir: c.dir, away: c.x < hz.x ? -1 : 1, said: false, wait: 0 };
  playSfx('pip'); buzz(10);
}
function scareNear(gx, gy) {
  let n = 0;
  customers.forEach(c => {
    if (n >= 2 || c.fear || c.inside || c.alpha < 0.9 || !animOn() || !(c.mode === 'pass' || c.mode === 'toDoor' || c.mode === 'toHome')) return;
    if (Math.abs(c.x - gx) > 56 || c.x < visL() + 4 || c.x > visR() - 4) return;
    n++; c.fear = { ghost: true, t: 0, stage: 0, ty: c.y, fy: 0, sx: 0, origDir: c.dir, away: c.x < gx ? -1 : 1, said: false, wait: 0, run: 0 }; playSfx('pip'); buzz(10);
  });
}
function updateFear(c, dt) {
  const f = c.fear; f.t += dt;
  if (f.ghost) {                                                             // привид! підскочив, закричав і втік убік
    if (f.stage === 0) {
      f.fy = -Math.abs(Math.sin(Math.min(1, f.t / 0.5) * Math.PI)) * 7; f.sx = Math.round(Math.sin(f.t * 55));
      if (!f.said) { f.said = true; fearSay(c, true); }
      if (f.t >= 0.5) { f.stage = 1; f.fy = 0; f.sx = 0; c.dir = f.away; }
    } else {
      f.run += dt; c.x += f.away * 78 * dt; f.fy = -(Math.floor(c.anim * 14) % 2);
      if (Math.random() < dt * 22) spawnDust(c.x, c.y + 1, 1);
      if (f.run >= 1.1) { c.dir = f.origDir; c.fear = null; }
    }
    return;
  }
  if (f.stage === 0) {                                                       // завмер, підскочив і витріщився: «!» над головою
    f.fy = -Math.abs(Math.sin(Math.min(1, f.t / 0.5) * Math.PI)) * 7; f.sx = Math.round(Math.sin(f.t * 55));
    if (!f.said) { f.said = true; fearSay(c); }
    if (f.t >= 0.5) { f.stage = 1; f.fy = 0; f.sx = 0; c.dir = f.away; }
  } else if (f.stage === 1) {                                                // тікає вгору на бруківку, здіймаючи пил
    c.y -= 80 * dt; c.x += f.away * 6 * dt; f.fy = -(Math.floor(c.anim * 14) % 2);
    if (Math.random() < dt * 22) spawnDust(c.x, c.y + 1, 1);
    if (c.y <= f.ty) { c.y = f.ty; f.stage = 2; f.wait = 0; f.fy = 0; }
  } else {                                                                   // тремтить і витирає піт, поки машина проїде
    f.wait += dt; f.sx = Math.round(Math.sin(f.wait * 48));
    if (f.wait > 0.9 && (!hazardNearX(c, roadHazards()) || f.wait > 5)) { if (c.lane > c.y) c.lane = c.y; c.dir = f.origDir; c.fear = null; }
  }
}
function fearSay(c, ghost) {
  const now = performance.now(); if (now - lastFearSay < 1800) return; lastFearSay = now;
  showBubble('fear', t((ghost ? 'gfear' : 'fear') + Math.floor(Math.random() * FEAR_LINES)), c.x, c.y - 26, () => ({ x: c.x, y: c.y - 26 + (c.fear ? c.fear.fy : 0) }));
}
// Бордюр біля магазину: звірятко легко переступає його невеликою дугою, а не ковзає крізь нього
function curbLift(y) { const a = LAYOUT.curbY - 5, b = LAYOUT.curbY + 9; return y > a && y < b ? Math.sin((y - a) / (b - a) * Math.PI) * 3.4 : 0; }
function updateCustomers(dt) {
  vipTimer -= dt;
  if (vipTimer <= 0) { vipTimer = rand(100, 160) * evMult() / (1 + 0.15 * wsLevel('goldenFreq')); if (!customers.some(c => c.vip) && state.story.done >= 2 && animOn() && !dialog.active) spawnVip(); }
  customers.forEach(c => { if (c.vip && !c.said && !c.vipDone && c.x > visL() + 10 && c.x < visR() - 10) { c.said = true; showBubble('vip', t('vipWish', deptName(c.wish)), c.x, c.y - 34, () => ({ x: c.x, y: c.y - 34 })); } });
  customerTimer -= dt;
  if (customerTimer <= 0) {
    customerTimer = rand(0.9, 2.4);
    if (customers.length < customerTarget()) spawnCustomer();
  }
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    c.anim += dt;
    const step = c.speed * dt;
    if (c.fear) { updateFear(c, dt); continue; }
    if ((c.mode === 'pass' || c.mode === 'toDoor' || c.mode === 'toHome') && animOn()) { const hz = roadDanger(c); if (hz) { startFear(c, hz); continue; } }
    switch (c.mode) {
      case 'pass':
        c.x += c.dir * step;
        if ((c.dir > 0 && c.x >= c.passTo) || (c.dir < 0 && c.x <= c.passTo)) customers.splice(i, 1);
        break;
      case 'toDoor': {
        const dx = c.doorX - c.x;
        if (Math.abs(dx) <= step) { c.x = c.doorX; c.mode = 'toEntrance'; }
        else { c.dir = Math.sign(dx); c.x += c.dir * step; }
        break;
      }
      case 'toEntrance':
        c.y -= step * 0.8 * (curbLift(c.y) > 0 ? 0.65 : 1);                      // біля бордюру крок повільніший: переступає
        if (c.y <= LAYOUT.curbY + 10) { c.y = LAYOUT.curbY + 10; c.mode = 'doorWait'; c.t = 0; c.dir = c.x < shop.x + shop.w / 2 ? 1 : -1; }
        break;
      case 'doorWait':                                    // біля порога: дивиться на двері, що розсуваються, і заходить
        c.t += dt;
        c.x += (doorWorld().cx - c.x) * Math.min(1, dt * 3);
        if (c.t > 0.12 && !c.dinged) { c.dinged = true; for (let i = 0; i < 3; i++) fx.sparks.push({ x: doorWorld().cx + rand(-8, 8), y: shop.y + shop.door.y - 4, vx: rand(-14, 14), vy: rand(-26, -10), age: 0, life: 0.5, col: i % 2 ? 'y' : 'w' }); }
        if (c.t >= 0.34) { c.mode = 'entering'; c.t = 0; c.dinged = false; }
        break;
      case 'entering': {                                  // заходить у відчинені розсувні двері
        const dr = doorWorld();
        c.x += (dr.cx - c.x) * Math.min(1, dt * 4);
        c.y -= step * 0.8 * (curbLift(c.y) > 0 ? 0.65 : 1);
        if (c.y <= LAYOUT.curbY - 1) c.inside = true;
        if (c.y <= dr.baseY) { c.y = dr.baseY; c.mode = 'inside'; c.f = 0; c.esc = null; c.plan = planVisit(); c.dwell = 0; }
        break;
      }
      case 'inside': updateInside(c, dt); break;
      case 'exiting':
        c.t += dt;
        if (c.t < 0.38) { if (!c.exitSp) { c.exitSp = true; for (let i = 0; i < 4; i++) fx.sparks.push({ x: c.x + rand(-6, 6), y: c.y - 20, vx: rand(-18, 18), vy: rand(-30, -12), age: 0, life: 0.5, col: ['y', 'h', 'f', 'w'][i] }); } break; }       // радісно підстрибує з покупками біля дверей
        c.y += step * 0.8 * (curbLift(c.y) > 0 ? 0.65 : 1);                      // біля бордюру крок повільніший: переступає
        if (c.y >= LAYOUT.curbY + 1) c.inside = false;
        if (c.y >= c.lane) { c.y = c.lane; c.mode = c.homeDoor ? 'toHome' : 'pass'; c.alpha = 1; c.inside = false; }
        break;
      case 'toHome': {                                    // несе покупки додому: йде до дверей будиночка
        const dx = c.homeDoor.x - c.x;
        if (Math.abs(dx) <= step) { c.x = c.homeDoor.x; c.mode = 'homeUp'; }
        else { c.dir = Math.sign(dx); c.x += c.dir * step; }
        break;
      }
      case 'homeUp':
        c.y -= step * 0.8;
        if (c.y <= c.homeDoor.y + 1) { c.y = c.homeDoor.y + 1; c.mode = 'homeKnock'; c.t = 0; }
        break;
      case 'homeKnock':                                   // стукає в двері й чекає
        c.t += dt;
        if (c.t >= 0.7) { c.mode = 'homeIn'; c.t = 0; c.said2 = false; }
        break;
      case 'homeIn': {                                    // двері відчиняються, тепле світло; звірятко заходить усередину (меншає й тане), двері зачиняються
        c.t += dt;
        const u = Math.max(0, Math.min(1, (c.t - 0.3) / 0.45));
        c.alpha = 1 - u * u; c.scale = 1 - 0.45 * u; c.y = c.homeDoor.y + 1 - u * 2;
        if (u > 0.35) c.bag = null;
        if (u > 0.5 && !c.said2) { c.said2 = true; homeSparks(c.homeDoor, 4); }
        if (c.t >= 0.95) { c.mode = 'homeStay'; c.t = 0; c.stay = rand(7, 16); c.inside = true; c.bag = null; c.alpha = 0; c.scale = 1; c.y = c.homeDoor.y + 1; }
        break;
      }
      case 'homeStay':
        c.t += dt;
        if (c.t >= c.stay) { c.mode = 'homeOut'; c.t = 0; c.inside = false; c.alpha = 0; c.scale = 0.55; c.said2 = false; }
        break;
      case 'homeOut': {                                   // двері відчиняються, звірятко виходить на світло (росте й проявляється), двері зачиняються за ним
        c.t += dt;
        const u = Math.max(0, Math.min(1, (c.t - 0.3) / 0.5));
        c.alpha = u; c.scale = 0.55 + 0.45 * u; c.y = c.homeDoor.y + 1 - (1 - u) * 2;
        if (u > 0.5 && !c.said2) { c.said2 = true; homeSparks(c.homeDoor, 3); }
        if (c.t >= 1.1) { c.mode = 'homeDown'; c.alpha = 1; c.scale = 1; c.y = c.homeDoor.y + 1; c.said2 = false; }
        break;
      }
      case 'homeDown':
        c.y += step * 0.8;
        if (c.y >= c.lane) {
          c.y = c.lane; c.homeDoor = null; c.dir = c.x < shop.x + shop.w / 2 ? 1 : -1;
          if (Math.random() < 0.5) { c.mode = 'toDoor'; c.doorX = shop.x + shop.door.x + shop.door.w / 2 + rand(-4, 4); }
          else { c.mode = 'pass'; c.passTo = passEdge(c.dir); }
        }
        break;
    }
  }
  // автоматичні двері роз'їжджаються, коли хтось підходить або виходить
  if (shop && shop.door) {
    const dr = doorWorld();
    const want = customers.some(c => (c.mode === 'toEntrance' || c.mode === 'doorWait' || c.mode === 'entering' || c.mode === 'exiting' || (c.mode === 'inside' && c.f === 0 && !c.esc)) &&
      Math.abs(c.x - dr.cx) < 34 && c.y > dr.baseY - 6 && c.y < LAYOUT.curbY + 14);
    shop.doorOpen = (shop.doorOpen || 0) + ((want ? 1 : 0) - (shop.doorOpen || 0)) * Math.min(1, dt * 7);
  }
}
// Де в світі двері магазину (центр) і підлога першого поверху
function doorWorld() { return { cx: shop.x + shop.door.x + shop.door.w / 2, baseY: shop.y + shop.floors[0].fy }; }
// План візиту: 1–3 зупинки біля стелажів (часто на верхніх поверхах), наприкінці — вихід через двері
function planVisit() {
  const F = shop.floors.length, stops = [], dr = doorWorld();
  const n = 1 + Math.floor(Math.random() * Math.min(3, F + 1));
  for (let i = 0; i < n; i++) {
    let f = Math.random() < 0.35 ? 0 : Math.floor(Math.random() * F);
    if (F > 1 && i === 0 && Math.random() < 0.6) f = 1 + Math.floor(Math.random() * (F - 1));
    const sh = shop.floors[f].shelves;
    stops.push({ f, x: shop.x + sh[Math.floor(Math.random() * sh.length)] + rand(-8, 8), t: rand(1.2, 3) });
  }
  stops.push({ f: 0, x: dr.cx + rand(-5, 5), exit: true });
  return stops;
}
// Рух усередині: до стелажа, на інший поверх ескалатором, до виходу
function updateInside(c, dt) {
  const step = c.speed * dt;
  if (c.esc) {                                                  // їде ескалатором
    const e = shop.escalators[c.esc.k], len = Math.hypot(e.run, e.rise);
    c.esc.u += c.esc.dir * (c.speed * 0.9 * dt) / len;
    c.moving = false;
    c.dir = c.esc.dir * (e.xHigh > e.xLow ? 1 : -1);
    if (c.esc.u >= 1) { c.f = e.hi; c.esc = null; c.x = shop.x + e.xHigh; c.y = shop.y + e.yHigh; return; }
    if (c.esc.u <= 0) { c.f = e.lo; c.esc = null; c.x = shop.x + e.xLow; c.y = shop.y + e.yLow; return; }
    c.x = shop.x + e.xLow + (e.xHigh - e.xLow) * c.esc.u;
    c.y = shop.y + e.yLow - e.rise * c.esc.u;
    return;
  }
  const stop = c.plan[0];
  c.y = shop.y + shop.floors[c.f].fy;
  if (!stop) { c.mode = 'exiting'; return; }
  if (c.f !== stop.f) {                                         // треба на інший поверх — іде до ескалатора
    const upDir = stop.f > c.f ? 1 : -1, e = shop.escalators[upDir > 0 ? c.f : c.f - 1];
    const ex = shop.x + (upDir > 0 ? e.xLow : e.xHigh), dx = ex - c.x;
    if (Math.abs(dx) <= step) { c.x = ex; c.esc = { k: e.k, dir: upDir, u: upDir > 0 ? 0 : 1 }; }
    else { c.x += Math.sign(dx) * step; c.dir = Math.sign(dx); c.moving = true; }
    return;
  }
  const dx = stop.x - c.x;
  if (Math.abs(dx) > step) { c.x += Math.sign(dx) * step; c.dir = Math.sign(dx); c.moving = true; return; }
  c.x = stop.x; c.moving = false;
  if (stop.exit) {                                              // виходить із покупками
    c.mode = 'exiting'; c.t = 0;
    c.bag = BAG_COLORS[Math.floor(Math.random() * BAG_COLORS.length)]; c.bagKind = Math.floor(Math.random() * 3);
    c.dir = Math.random() < 0.5 ? 1 : -1;
    c.passTo = passEdge(c.dir);
    c.homeDoor = pickHome(c);                                   // частина покупців іде зі своїми пакетами додому
    return;
  }
  c.dwell += dt;
  if (c.dwell >= stop.t) { c.plan.shift(); c.dwell = 0; }
}
// Чи піде покупець додому: обираємо двері будиночка недалеко від магазину (не за самим магазином)
function pickHome(c) {
  if (!houseDoors.length || Math.random() > 0.55) return null;
  const cx = shop.x + shop.w / 2;
  const cand = houseDoors.filter(d => Math.abs(d.x - cx) > shop.w / 2 + 8 && Math.abs(d.x - c.x) < 340);
  return cand.length ? cand[Math.floor(Math.random() * cand.length)] : null;
}
// Коли магазин перебудовується, усі, хто всередині, виходять надвір
function ejectInside() {
  if (!shop || !shop.door) return;
  const dr = doorWorld();
  customers.forEach(c => {
    if (!(c.inside || c.mode === 'inside' || c.mode === 'entering')) return;
    c.inside = false; c.mode = 'exiting'; c.x = dr.cx; c.y = LAYOUT.curbY + 2; c.alpha = 1; c.esc = null;
    c.bag = BAG_COLORS[Math.floor(Math.random() * BAG_COLORS.length)]; c.bagKind = Math.floor(Math.random() * 3);
    c.dir = Math.random() < 0.5 ? 1 : -1;
    c.passTo = passEdge(c.dir);
  });
}
// Скін героїв надягається й на звірят-покупців: головний убір + деталь на тулубі (кожен скін той самий, що на героях)
function drawSkinGear(sx, sy, kind, head) {
  const cx = sx + 9, ht = sy + 8;
  if (kind === 'party') {
    if (head) { R(ctx, cx - 3, ht - 1, 7, 2, 'f'); R(ctx, cx - 2, ht - 3, 5, 2, 'T'); R(ctx, cx - 1, ht - 5, 3, 2, 'f'); R(ctx, cx, ht - 7, 2, 2, 'y'); }
    [[sx + 5, sy + 17, 'y'], [sx + 8, sy + 19, 'T'], [sx + 11, sy + 17, 'w'], [sx + 12, sy + 20, 'y'], [sx + 6, sy + 21, 'f']].forEach(q => R(ctx, q[0], q[1], 1, 1, q[2]));
  } else if (kind === 'chef') {
    if (head) { R(ctx, cx - 4, ht - 5, 9, 5, 'w'); R(ctx, cx - 3, ht - 7, 7, 2, 'w'); R(ctx, cx - 4, ht - 1, 9, 2, 'E'); R(ctx, cx - 4, ht - 5, 1, 4, 'E'); }
    R(ctx, cx - 3, sy + 17, 7, 5, 'w'); R(ctx, cx - 3, sy + 17, 7, 1, 'E'); R(ctx, cx, sy + 18, 1, 1, 'r'); R(ctx, cx, sy + 20, 1, 1, 'r');
  } else if (kind === 'wizard') {
    if (head) { R(ctx, cx - 5, ht - 1, 11, 2, 'u'); R(ctx, cx - 3, ht - 4, 7, 3, 'u'); R(ctx, cx - 3, ht - 2, 7, 1, 'h'); R(ctx, cx - 2, ht - 7, 5, 3, 'u'); R(ctx, cx - 1, ht - 10, 3, 3, 'u'); R(ctx, cx, ht - 5, 1, 1, 'y'); }
    R(ctx, cx - 4, sy + 17, 9, 5, 'v'); R(ctx, cx - 4, sy + 17, 9, 1, 'h'); R(ctx, cx - 2, sy + 19, 1, 1, 'y'); R(ctx, cx + 2, sy + 20, 1, 1, 'y');
  } else if (kind === 'royal') {
    if (head) { R(ctx, cx - 4, ht - 3, 9, 3, 'h'); R(ctx, cx - 4, ht - 5, 2, 2, 'h'); R(ctx, cx - 1, ht - 6, 3, 3, 'h'); R(ctx, cx + 3, ht - 5, 2, 2, 'h'); R(ctx, cx, ht - 2, 1, 1, 'r'); R(ctx, cx - 4, ht - 3, 9, 1, 'y'); }
    R(ctx, cx - 5, sy + 16, 11, 3, 'r'); R(ctx, cx - 4, sy + 16, 9, 1, 'w'); R(ctx, cx - 5, sy + 19, 2, 3, 'r'); R(ctx, cx + 4, sy + 19, 2, 3, 'r');
  } else if (kind === 'santa') {
    if (head) { R(ctx, cx - 4, ht - 1, 9, 2, 'w'); R(ctx, cx - 3, ht - 3, 7, 2, 'r'); R(ctx, cx - 2, ht - 5, 5, 2, 'r'); R(ctx, cx - 1, ht - 7, 3, 2, 'r'); R(ctx, cx, ht - 8, 2, 2, 'w'); }
    R(ctx, cx - 4, sy + 17, 9, 5, 'r'); R(ctx, cx - 4, sy + 17, 9, 1, 'w'); R(ctx, cx - 4, sy + 20, 9, 1, 'k'); R(ctx, cx - 1, sy + 20, 2, 1, 'h');
  } else if (kind === 'witch') {
    if (head) { R(ctx, cx - 5, ht - 1, 11, 2, 'V'); R(ctx, cx - 3, ht - 4, 7, 3, 'V'); R(ctx, cx - 3, ht - 3, 7, 1, 'o'); R(ctx, cx - 2, ht - 6, 5, 2, 'V'); R(ctx, cx - 1, ht - 9, 3, 3, 'V'); }
    R(ctx, cx - 4, sy + 17, 9, 5, 'V'); R(ctx, cx - 4, sy + 17, 9, 1, 'o'); R(ctx, cx - 2, sy + 19, 1, 1, 'y'); R(ctx, cx + 2, sy + 20, 1, 1, 'y');
  } else if (kind === 'ninja') {
    if (head) { R(ctx, cx - 4, ht - 2, 9, 4, 'z'); R(ctx, cx - 4, ht, 9, 1, 'r'); R(ctx, cx + 4, ht + 1, 2, 2, 'r'); }
    R(ctx, cx - 4, sy + 19, 9, 1, 'r'); R(ctx, cx - 4, sy + 17, 9, 2, 'z');
  }
}
// Двері будиночка: відчиненість 0…1 залежить від етапу (стук → відчиняються → зачиняються)
function homeDoorOpen(c) {
  const t = c.t;
  if (c.mode === 'homeIn') return t < 0.3 ? t / 0.3 : t < 0.75 ? 1 : Math.max(0, 1 - (t - 0.75) / 0.2);
  if (c.mode === 'homeOut') return t < 0.3 ? t / 0.3 : t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.25);
  return 0;
}
function drawHomeDoor(c) {
  const d = c.homeDoor, o = homeDoorOpen(c);
  if (c.mode === 'homeKnock') {                                      // «тук-тук»: маленькі риски біля дверей
    const k = Math.floor(c.t * 8) % 2;
    if (c.t > 0.1 && c.t < 0.55 && k) { R(ctx, d.x + 6, d.y - 10, 1, 2, 'w'); R(ctx, d.x + 8, d.y - 9, 1, 2, 'w'); R(ctx, d.x - 7, d.y - 10, 1, 2, 'w'); }
    return;
  }
  if (!(o > 0.02)) return;
  const x0 = d.x - 4, w = 8, leaf = Math.max(1, Math.round(w * (1 - o)));          // полотно складається до лівого краю
  R(ctx, d.x - 5, d.y - 15, 10, 15, 'd');
  R(ctx, x0, d.y - 14, w, 14, 'h'); R(ctx, x0, d.y - 14, w, 2, 'y'); R(ctx, x0 + 5, d.y - 8, 2, 4, 'w'); R(ctx, x0, d.y - 3, w, 3, 'o');   // тепла кімната: світло, лампа, підлога
  R(ctx, x0, d.y - 14, leaf, 14, 'b'); R(ctx, x0, d.y - 14, leaf, 1, 'l');
  ctx.globalAlpha = 0.3 * o; R(ctx, d.x - 5, d.y, 10, 2, 'y'); R(ctx, d.x - 4, d.y + 2, 8, 2, 'y'); R(ctx, d.x - 2, d.y + 4, 4, 1, 'y'); ctx.globalAlpha = 1;      // світло падає на ґанок
}
function homeSparks(d, n) { for (let i = 0; i < n; i++) fx.sparks.push({ x: d.x + rand(-4, 4), y: d.y - 12, vx: rand(-12, 12), vy: rand(-34, -16), age: 0, life: rand(0.5, 0.9), col: i % 2 ? 'f' : 'y' }); }
function drawCustomer(c) {
  const exitPause = c.mode === 'exiting' && c.t < 0.38;
  const moving = (c.fear && c.fear.stage !== 1) ? false : (c.mode === 'homeKnock' || c.mode === 'doorWait' || exitPause) ? false : c.mode === 'inside' ? !!c.moving : true;
  const frame = moving ? Math.floor(c.anim * 6) % 2 : 0;
  const bob = frame ? -1 : 0;
  const sx = Math.round(c.x - 9) + (c.fear ? c.fear.sx : 0), sy = Math.round(c.y - 23) + bob + (c.fear ? Math.round(c.fear.fy) : 0) - ((c.mode === 'exiting' || c.mode === 'toEntrance' || c.mode === 'entering' || c.mode === 'doorWait') ? Math.round(curbLift(c.y)) : 0) - (exitPause ? Math.round(Math.abs(Math.sin(c.t / 0.38 * Math.PI * 2)) * 3) : 0);            // спрайт 18×23: ноги внизу, центр по x
  if ((c.mode === 'homeKnock' || c.mode === 'homeIn' || c.mode === 'homeOut') && c.homeDoor) drawHomeDoor(c);
  ctx.globalAlpha = 0.2 * c.alpha; R(ctx, sx + 3, Math.round(c.y), 12, 1, 'd'); ctx.globalAlpha = 1;
  if (c.vip) {
    const pulse = animOn() ? Math.sin(animClock * 5) : 0;
    ctx.globalAlpha = (0.2 + 0.08 * pulse) * c.alpha; disc(ctx, sx + 9, sy + 8, 21, 'y'); ctx.globalAlpha = 1;
    drawCanvasSprite(ctx, goldCanvas(c.type, frame), sx, sy, { flip: c.dir < 0, alpha: c.alpha, sx: 1.56, sy: 1.56 });
    for (let k = 0; k < 3; k++) { const a = animClock * 2.2 + k * 2.1, px = Math.round(sx + 9 + Math.cos(a) * 13), py = Math.round(sy + 7 + Math.sin(a * 1.3) * 12); if (Math.floor(animClock * 6 + k) % 2) { R(ctx, px, py - 1, 1, 3, 'y'); R(ctx, px - 1, py, 3, 1, 'y'); } }
    if (!c.vipDone) { const by = sy - 13 + (animOn() ? Math.round(Math.sin(animClock * 4)) : 0); R(ctx, sx + 7, by + 2, 5, 3, 'd'); R(ctx, sx + 8, by + 1, 3, 1, 'd'); R(ctx, sx + 8, by + 2, 3, 2, 'h'); R(ctx, sx + 9, by, 1, 1, 'y'); }
  } else { const sc = c.scale || 1; drawSprite(ctx, c.type + '_' + frame, sx, sy, { flip: c.dir < 0, alpha: c.alpha, sx: sc, sy: sc }); }
  if (c.fear) {                                                               // жартівливий переляк
    const f = c.fear;
    if (f.stage === 0) {                                                      // великий «!» і волоски дибки
      const hx = sx + 9, hy = sy - 11;
      R(ctx, hx - 2, hy - 1, 5, 10, 'd'); R(ctx, hx - 1, hy, 3, 5, 'r'); R(ctx, hx - 1, hy + 6, 3, 2, 'r'); R(ctx, hx - 1, hy, 1, 5, 'p');
      R(ctx, sx + 4, sy - 2, 1, 3, 'd'); R(ctx, sx + 9, sy - 3, 1, 3, 'd'); R(ctx, sx + 13, sy - 2, 1, 3, 'd');
    } else if (f.stage === 1) {                                               // швидкісні смужки позаду
      const bx = f.away > 0 ? sx - 6 : sx + 20;
      R(ctx, bx, sy + 8, 5, 1, 'w'); R(ctx, bx + 1, sy + 12, 6, 1, 'w'); R(ctx, bx, sy + 16, 4, 1, 'w');
    } else {                                                                  // піт градом і тремтіння
      const k = Math.floor(f.wait * 6) % 3;
      R(ctx, sx + 1, sy + 1 + k, 1, 2, 'S'); R(ctx, sx + 16, sy + 3 + ((k + 1) % 3), 1, 2, 'S'); R(ctx, sx + 2, sy + 6 - k, 1, 1, 'a');
      if (Math.floor(f.wait * 4) % 2) { R(ctx, sx + 7, sy - 4, 1, 3, 'd'); R(ctx, sx + 11, sy - 4, 1, 3, 'd'); }
    }
  }
  const gx = sx + (c.dir < 0 ? -1 : 0);                                       // у дзеркальному вигляді тіло зсунуте на піксель, одяг іде слідом
  const hs = skinOn('hero');
  if (c.vip) return;                                                           // золотий покупець: без скінів, капелюхів і шарфів
  if (hs && c.alpha > 0.9) drawSkinGear(gx, sy, hs, !hasHats());
  if (hasHats() && c.alpha > 0.9) { if (c.hat === undefined) c.hat = Math.floor(Math.random() * 42); drawHat(gx + 9, sy + 8, c.hat); }
  if (hasScarves() && c.alpha > 0.9) {       // шарфик на шиї покупця
    const sc = SCARF_COLORS[CUSTOMER_TYPES.indexOf(c.type) % SCARF_COLORS.length], nx = c.dir > 0 ? gx + 10 : gx + 5;
    R(ctx, gx + 4, sy + 16, 10, 2, sc); R(ctx, gx + 4, sy + 17, 10, 1, 'w'); R(ctx, nx, sy + 18, 3, 4, sc);
  }
  if (c.bag && !(c.scale && c.scale < 0.9)) {   // пакет з покупками в лапці, злегка гойдається
    const bc = CHIBI.bag(c.bagKind || 0, c.bag), bx = c.dir > 0 ? sx + 14 : sx - 6;
    drawCanvasSprite(ctx, bc, bx, sy + 11 + (frame ? 1 : 0), { alpha: c.alpha });
  }
}

function updateAnimations(dt) {
  // пружина: стискання → повернення з легким відскоком
  const steps = Math.max(1, Math.ceil(dt / 0.01));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    shopAnim.vel += (-300 * shopAnim.squash - 17 * shopAnim.vel) * h;
    shopAnim.squash += shopAnim.vel * h;
  }
  if (Math.abs(shopAnim.squash) < 0.001 && Math.abs(shopAnim.vel) < 0.01) { shopAnim.squash = 0; shopAnim.vel = 0; }

  // Капі кліпає
  if (capyAnim.blinkLeft > 0) {
    capyAnim.blinkLeft -= dt;
  } else {
    capyAnim.blinkIn -= dt;
    if (capyAnim.blinkIn <= 0) { capyAnim.blinkLeft = 0.14; capyAnim.blinkIn = rand(2.5, 5.5); }
  }

  // хмаринки пливуть
  clouds.forEach(c => {
    c.x += c.speed * dt;
    if (c.x > worldR() + 4) c.x = worldL() - 28;
  });

  if (build) updateBuild(dt);
  updateClockFx(dt);
  updateCustomers(dt);
  updateActors(dt);
  updateCameos(dt);
  updateGuests(dt);

  // монетки: політ, гравітація, зникання
  for (let i = fx.coins.length - 1; i >= 0; i--) {
    const p = fx.coins[i];
    p.age += dt;
    p.vy += 320 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.age >= p.life) fx.coins.splice(i, 1);
  }
  for (let i = fx.sparks.length - 1; i >= 0; i--) {
    const p = fx.sparks[i];
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.age >= p.life) fx.sparks.splice(i, 1);
  }
  for (let i = fx.dust.length - 1; i >= 0; i--) {
    const p = fx.dust[i];
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.age >= p.life) fx.dust.splice(i, 1);
  }
}

function spawnTapEffects(x, y) {
  if (!animOn()) return;
  const n = Math.floor(rand(CONFIG.TAP_COINS_MIN, CONFIG.TAP_COINS_MAX + 1));
  for (let i = 0; i < n; i++) {
    fx.coins.push({ x: x + rand(-6, 6), y: y - 4, vx: rand(-45, 45), vy: rand(-125, -70), age: 0, life: rand(0.7, 1.0), spin: rand(0, 4) });
  }
  for (let i = 0; i < 5; i++) {
    const a = rand(0, Math.PI * 2), sp = rand(30, 70);
    fx.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, age: 0, life: rand(0.25, 0.4), col: i % 2 ? 'y' : 'w' });
  }
  while (fx.coins.length > CONFIG.MAX_COIN_PARTICLES) fx.coins.shift();
  while (fx.sparks.length > (ecoOn() ? CONFIG.MAX_SPARKS >> 1 : CONFIG.MAX_SPARKS)) fx.sparks.shift();
}

// Текст «+1», що піднімається і зникає (HTML-елемент — чіткий піксельний шрифт)
function spawnFloater(x, y, text) {
  if (!animOn()) return;
  const el = document.createElement('div');
  el.className = 'floater';
  el.textContent = text;
  el.style.left = pctX(x) + '%';
  el.style.top = pctY(y) + '%';
  el.addEventListener('animationend', () => el.remove());
  ui.floaters.appendChild(el);
  while (ui.floaters.childElementCount > CONFIG.MAX_FLOATERS) ui.floaters.firstChild.remove();
}

