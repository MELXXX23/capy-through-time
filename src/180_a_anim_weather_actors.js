//#part 180_a_anim_weather_actors.js
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
  if (viewEpoch() % EPOCHS.length >= 1 && !state.settings.birdsLate) return;                     // з 2-ї епохи птахів не видно, доки гравець не ввімкне їх у налаштуваннях
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
const CLOUD_SKIN_TINT = { cottoncloud: 'cotton', goldcloud: 'gold', starcloud: 'star', diamondcloud: 'diamond' };     // скіни погоди, що міняють колір хмар
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
    diamond: ['#ffffff', '#e0f6ff', '#b4e2fa', '#82c2ec', '#5a98d0'],
    star: ['#cdbdf2', '#a995e0', '#8670c4', '#6650a4', '#463683'],
    star2: ['#c4f0f4', '#94d8ec', '#6cb4dc', '#4a8ac0', '#33609a'],
    star3: ['#f4cdee', '#e0a0d8', '#c078c4', '#9a52a4', '#703a86'],
    sp_blue: ['#c6d8ff', '#95b4f4', '#6a8ede', '#4a68b8', '#334a8a'],
    sp_green: ['#d2f8c8', '#a2e89a', '#72cc6c', '#4ca24c', '#337a3a'],
    sp_gold: ['#fff6c0', '#ffe388', '#f5c750', '#d9a030', '#b0782a'],
    sp_orange: ['#ffe0c4', '#ffbe8a', '#f59a5a', '#d46e3a', '#a84a28'],
    sp_red: ['#ffd0d8', '#ff9aa8', '#e86a82', '#c04464', '#8c2c48']
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
  if (tint === 'star' || tint === 'star2' || tint === 'star3' || /^sp_/.test(tint)) { g.fillStyle = '#ffe08a'; for (let y = top; y <= bot; y++) for (let x = 0; x < W; x++) if (inCl(x, y) && (x * 31 + y * 17) % 29 === 0) { g.fillRect(x, y, 1, 1); starPts.push([x, y]); } }   // зорі в хмарах
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
      const b = cloudBox(c), SPEC = ['star', 'sp_blue', 'star2', 'sp_green', 'sp_gold', 'sp_orange', 'sp_red', 'star3'];
      const u = (((animClock * 0.14 + c.x * 0.0035) % 1) + 1) % 1 * SPEC.length, i0 = Math.floor(u) % SPEC.length, fr = u - Math.floor(u), sm = fr * fr * (3 - 2 * fr);        // повільний перелив усім спектром
      ctx.globalAlpha = 1;
      drawCanvasSprite(ctx, cloudCanvas(c.kind || 0, SPEC[i0]), Math.round(c.x), Math.round(c.y), o);
      drawCanvasSprite(ctx, cloudCanvas(c.kind || 0, SPEC[(i0 + 1) % SPEC.length]), Math.round(c.x), Math.round(c.y), { sx: sc, sy: sc, alpha: sm });
      cloudCanvas(c.kind || 0, 'star').starPts.forEach(([px, py], i) => {                                                                                                          // зорі мерехтять хрестиками
        const v = Math.sin(animClock * 2.6 + i * 1.9 + c.x * 0.013); if (v < 0.35) return;
        sparkPlus(b.x + Math.round(px * sc), b.y + Math.round(py * sc), (v - 0.35) / 0.65, '#ffe9a0');
      });
      return;
    }
    drawCanvasSprite(ctx, cv, Math.round(c.x), Math.round(c.y), o);
    if ((sk === 'goldcloud' || sk === 'diamondcloud') && animOn()) {
      const b = cloudBox(c);
      const dia = sk === 'diamondcloud', step = dia ? 2 : 3, thr = dia ? 0.62 : 0.8;      // діамантові: удвічі більше відблисків, довші спалахи, кольорові іскорки
      cv.litPts.forEach(([px, py], i) => { if (i % step) return; const v = Math.sin(animClock * (dia ? 2.3 : 1.9) + i * 2.7 + c.x * 0.02); if (v > thr) sparkPlus(b.x + Math.round(px * sc), b.y + Math.round(py * sc), (v - thr) / (1 - thr), dia ? ['#d8f6ff', '#ffffff', '#ffd6f4', '#c8fff0'][i % 4] : '#fff2b0'); });      // золоті й діамантові відблиски
    }
  });
  ctx.globalAlpha = 1;
}
function updateCloudSkinFx(dt) {
  const sk = skinOn('weather');
  if (!animOn() || ecoOn() || !state.settings.clouds || (sk !== 'goldcloud' && sk !== 'starcloud' && sk !== 'diamondcloud')) { cloudCoins.length = 0; starDust.length = 0; return; }
  const vis = clouds.filter(c => c.x > visL() - 20 && c.x < visR() - 20);
  if (sk === 'goldcloud') {
    cloudCoinT -= dt;
    if (cloudCoinT <= 0) {
      cloudCoinT = rand(1.5, 3.8);      // монетки трохи частіше (було 2,2–5,5 с)
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
    vis.forEach(c => { if (Math.random() < dt * (sk === 'diamondcloud' ? 10 : 5)) { const b = cloudBox(c); starDust.push({ x: b.x + rand(b.w * 0.1, b.w * 0.9), y: b.y + b.h * rand(0.6, 0.9), vx: rand(-4, 4), vy: rand(7, 15), age: 0, life: rand(1.2, 2.4), c: (sk === 'diamondcloud' ? ['#ffffff', '#d8f6ff', '#9be8ff', '#b4e2fa'] : ['#fff6c0', '#c9b8ff', '#9be8ff', '#ffc4ec'])[Math.floor(Math.random() * 4)] }); } });
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
let build = null;
let buildPreview = null;                           // режим бога: показ будівництва без зміни прогресу ({ back: рівень, який повернути, keep })                                 // триває будівництво нового рівня
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
  if (!buildPreview) showToast(t('buildTapHint'), 'good');
  build = { t: 0, dur: CONFIG.BUILD_SECONDS, boost: 0, hitSfx: 0, old, dustTimer: 0, burst: false, style, r: 0, shake: 0, hitT: 0, lastSfx: 0, bx: old.x - 30, by: LAYOUT.curbY + 4, bdir: 1, fw: 0, fwT: 0, landed: -1, bands: 0, fin: false };
  ui.shopOverlay.style.visibility = 'hidden';
}
function finishBuild() {
  build = null;
  ui.scene.style.transform = '';
  ui.shopOverlay.style.visibility = '';
  shopAnim.vel = 6;
  playSfx('levelup');
  if (buildPreview) {                                                      // показ у режимі бога: повертаємо справжній рівень (або лишаємо новий, якщо так обрано)
    const bp = buildPreview; buildPreview = null;
    if (!bp.keep && state.shopLevel !== bp.back) { state.shopLevel = bp.back; rebuildShop(true); }
    recalcIncome(); layoutScene(); updateMusic(); updateUI(); saveGame();
    showToast(t(bp.keep ? 'dbgBuildKept' : 'dbgBuildDone'), 'good');
    return;
  }
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
  const b = build;
  b.boost = Math.max(0, (b.boost || 0) - dt * 0.4);      // тап-прискорення згасає, якщо не тапати
  dt *= 1 + b.boost;
  b.t += dt;
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
  const themed = !!BTH.list[viewEpoch() % BTH.list.length];                                              // у тематичній анімації немає вантажівок — звуки епохи
  if (!b.sArr && p > 0.005) { b.sArr = true; playSfx(themed ? 'themeArrive' : 'truckDrive', themed ? viewEpoch() : BUILD_A * b.dur * 0.9); }   // приїзд
  if (!b.sPour && p >= BUILD_A) { b.sPour = true; if (!themed) playSfx('concrete'); }                  // бетон із жолоба
  if (!b.sLeave && p >= BUILD_C + 0.03) { b.sLeave = true; if (!themed) playSfx('truckDrive', 2.2); }       // від'їзд
  if (themed && p >= BUILD_A && p < BUILD_C && b.t - b.hitSfx > 0.55) { b.hitSfx = b.t; playSfx('themeHit', viewEpoch()); }   // ритмічний «стук» епохи
  b.build = false; b.carry = false;
  if (p < BUILD_A) {                                           // Боді вибігає назустріч вантажівці, старий магазин ховається під шатро й розсипається
    b.r = 0; run = true; tx = (visL() - 20) + (b.parkX - 10 - (visL() - 20)) * smooth01(p / BUILD_A); b.bx = tx;
    if (p > 0.115 && !b.crumbled) { b.crumbled = true; b.shake = 0.9; playSfx('hammer'); if (!themed) playSfx('truckBrake'); for (let i = 0; i < 16; i++) spawnDust(o.x - 6 + (i / 15) * (o.w + 12), LAYOUT.curbY + 2, 1); buildSparks(o.x + o.w / 2, o.y + 8, 6, ['w', 'E']); }      // шатро лягло на магазин
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
    // їжак із касою прибитий до світу, а не до краю екрана: місце не залежить від гортання камери й ширини вікна
    const cp = LAYOUT.capy; if (!cp) return shop.x + shop.door.x + shop.door.w / 2 + 40;
    return mobileMQ.matches ? cp.x + 58 : cp.x + 14 + 66;   // телефон: ближче до Капі, щоб лишався в кадрі; ПК: праворуч, не впритул
  }
  // решта звіряток розставлені рівномірно по ВСІЙ вулиці (f — частка ширини світу), а не лише біля магазину
  return worldL() + 16 + s.f * (worldR() - worldL() - 32);
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
// Капі ніхто не перекриває й не ходить за нею: у смузі ±34 px від неї спереду звірята відступають на смугу перед нею, а ті, що опинились позаду, виходять убік
function capyZone(x, y) { const cp = LAYOUT.capy; return !!cp && Math.abs(x - (cp.x + 14)) < 34 && y < cp.footY + 24; }
function capyPathBlocked(x0, y0, x1, y1) { for (let k = 1; k <= 8; k++) if (capyZone(x0 + (x1 - x0) * k / 8, y0 + (y1 - y0) * k / 8)) return true; return false; }
function capyAvoid(o, dt) {
  const cp = LAYOUT.capy; if (!cp) return;
  const dx = o.x - (cp.x + 14), lim = cp.footY + 24;
  if (Math.abs(dx) >= 34 || o.y >= lim) return;
  if (o.y > cp.footY + 2) o.y = Math.min(lim, o.y + 48 * dt);                    // трохи попереду: спускається на смугу перед Капі
  else o.x += (dx >= 0 ? 1 : -1) * 70 * dt;                                       // позаду чи впритул: відходить убік
}
function updateActors(dt) {
  actors.forEach(a => {
    const s = TEAM[a.i].spot;
    a.t += dt;
    if (a.mode !== 'sit' && s.x !== null) capyAvoid(a, dt);
    a.hop = Math.max(0, a.hop - dt * 4);
    // влітку звірятка час від часу зупиняються перепочити й попити водички
    if (theme.season === 'summer' && animOn()) {
      if (a.rest > 0) { a.rest -= dt; if (a.rest <= 0) a.restIn = rand(CONFIG.SUMMER_REST_MIN, CONFIG.SUMMER_REST_MAX); }
      else {
        a.restIn -= dt;
        if (a.restIn <= 0) {
          a.rest = CONFIG.SUMMER_REST_SECONDS;      // звірятко зупиняється перепочити (без самовільних реплік: говорять лише по тапу й на лавочці)
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
      a.route = null;
      if (slots.length && Math.random() < 0.22) {      // іноді йде посидіти на лавочці
        const pick = slots[Math.floor(Math.random() * slots.length)];
        pick[0].slots[pick[1]].who = a.i; a.bench = pick[0]; a.slot = pick[1];
        a.mode = 'toBench'; a.tx = pick[0].x + pick[0].slots[pick[1]].dx; a.ty = pick[0].y + 3;
      } else { pickWanderTarget(a); a.mode = 'walk'; }
      return;
    }
    // іде до цілі (випадкова точка вулиці або лавочка)
    const wp = a.route && a.route.length ? a.route[0] : null;                 // обхід Капі: проміжні точки перед справжньою ціллю
    const gx = wp ? wp.x : a.tx, gy = wp ? wp.y : a.ty;
    const dx = gx - a.x, dy = gy - a.y, d = Math.hypot(dx, dy), step = a.speed * dt;
    if (d > step && !capyZone(a.x, a.y) && capyZone(a.x + dx / d * step, a.y + dy / d * step)) {      // шлях упирається в Капі: обходить її спереду
      const cp = LAYOUT.capy, cx = cp.x + 14, side = a.tx >= cx ? 1 : -1, fy = cp.footY + 26;
      if (!wp && Math.abs(a.tx - cx) > 34 && side * (a.x - cx) < 0) a.route = [{ x: a.x, y: Math.max(a.y, fy) }, { x: cx + side * 40, y: fy }];
      else { a.route = null; if (a.bench) { a.bench.slots[a.slot].who = null; a.bench = null; } a.mode = 'idle'; a.moving = false; a.wait = rand(0.4, 1.2); }
      return;
    }
    if (wp && d <= step) { a.x = wp.x; a.y = wp.y; a.route.shift(); if (!a.route.length) a.route = null; return; }
    if (d <= step) {
      a.x = a.tx; a.y = a.ty; a.moving = false;
      if (a.mode === 'toBench' && a.bench) {
        a.mode = 'sit'; a.sitT = rand(9, 16); a.y = a.bench.y - 3; a.dir = a.x < LAYOUT.centerX ? 1 : -1;
        if (Object.keys(bubbleEls).length < 1) showBubble('t' + a.i, t('team_' + TEAM[a.i].id + '_sit_' + Math.floor(Math.random() * 2)), a.x, a.y - 19, () => ({ x: a.x, y: a.y - 19 }));
      } else { a.mode = 'idle'; a.wait = rand(0.6, 3); }
    } else {
      a.x += dx / d * step; a.y += dy / d * step; a.moving = true;
      if (Math.abs(dx) > 0.5) a.dir = dx > 0 ? 1 : -1;
    }
  });
  // звірята самі більше не базікають: репліка лише по тапу (250_tap.js) і коли сіли на лавочку (вище)
}

