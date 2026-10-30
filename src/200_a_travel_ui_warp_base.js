//#part 200_a_travel_ui_warp_base.js
/* =====================================================================
   ПОДОРОЖ У ЧАСІ, МАЙСТЕРНЯ, ДОСЯГНЕННЯ, СТАТИСТИКА, НАЛАШТУВАННЯ
   ===================================================================== */

let warp = null;                 // триває анімація подорожі: { t, applied }
let confirmCb = null;            // що зробити, якщо гравець підтвердить
let savingDisabled = false;      // перед перезавантаженням (імпорт / скидання) більше не зберігаємо
let achTimer = 0;
let autoTapAcc = 0;
const stars = [];                // зорі неонової епохи
const leaves = [];               // осіннє листя
const wsEls = [];                // картки покращень майстерні
const achEls = [];               // рядки досягнень
const statRows = {};             // рядки статистики

function animOn() { return state.settings.animations; }
function dayNightOn() { return state.settings.dayNight; }
function auroraCalm() { return skinOn('weather') === 'aurora'; }        // скін «Полярне сяйво»: тихе нічне небо — без хмар і всього, що літає
function noFlyOn() { return !!state.settings.noFly || auroraCalm(); }
// Скін Капі залежить від статі гравця: дівчина — квіточка, хлопець — листочки
function capySprite() { const s = skinOn('capy'); return s ? 'capy_' + s : (state.settings.gender === 'm' ? 'capy_m' : 'capy'); }
// Скіни: яку назву скіна вдягнено в групі type ('capy' | 'shop' | 'weather' | 'hero') — 'pirate', 'candy' тощо, або null
const skinPreview = {};          // тимчасово «приміряє» скін на час малювання зразка у вкладці
function skinOn(type) {
  if (skinPreview[type] !== undefined) return skinPreview[type];
  const i = state.skins[type];
  if (type === 'capy' && i === -2) return 'ep' + (viewEpoch() % EPOCHS.length);          // скін епохи: сам змінюється, коли перемикається епоха
  if (SKIN_POOL[i] === 'street_diamond') return null;                                       // діамантову дорогу прибрано (слот лишається заради збережень)
  return (i >= 0 && skinOwned(i)) ? SKIN_POOL[i].slice(type.length + 1) : null;
}
function drawCapiPortrait() {
  const c = getSpriteCanvas(capySprite());
  ui.capiPortrait.width = 30; ui.capiPortrait.height = 30;              // скіни Капі можуть бути трохи ширшими за звичайний вигляд
  const g = ui.capiPortrait.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(c, (30 - c.width) >> 1, 5);
}
// Яка зараз пора року: з налаштувань або (в режимі «Авто») за датою пристрою; Хелловін — за датою свята
// Вибір пори року й Хелловіну відкривається після проходження 2 епохи (поки що діє «Авто»)
const DEV_OPEN_BUILD = false;   // прапорець збірки: для exe його ставить desktop/prepare.js
const DEV_OPEN_ALL = (DEV_OPEN_BUILD && !GOD_PAUSED) || GOD_ON;   // GOD_ON — режим бога за кодом власника (див. 100_config.js)     // для перевірки можна тимчасово поставити true: відкриє всі сезони й усі 8 епох
function themesUnlocked() { return DEV_OPEN_ALL || state.epoch >= 2; }
// Ручний вибір Хелловіну відкривається пізніше: після проходження 5 епохи
function seasonPickLocked(s) { return s !== 'auto' && (!themesUnlocked() || (s === 'halloween' && !DEV_OPEN_ALL && state.epoch < 5)); }
function seasonLockText(s) { return t(s === 'halloween' && themesUnlocked() ? 'themeLockedHalloween' : 'themeLocked'); }
function seasonNow() {
  const s = state.settings.season;
  if (s !== 'auto' && SEASONS.includes(s) && !seasonPickLocked(s)) return s;
  const forced = forcedHoliday();
  if (forced === 'halloween') return 'halloween';
  if (forced === 'newyear') return 'winter';
  const d = new Date();
  if (inRange(d, [10, 20], [11, 2])) return 'halloween';
  const m = d.getMonth() + 1;
  return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter';
}
function isDebug() {
  try { return GOD_ON || (!GOD_PAUSED && (new URLSearchParams(location.search).get('debug') === '1' || window.__debug === true)); } catch (e) { return false; }
}
function currentEpoch() { return EPOCHS[viewEpoch() % EPOCHS.length]; }

/* ---------- Епохи: зовнішній вигляд міста ---------- */
// Етапи перебудови шарів епохи: під час подорожі їх виконуємо по одному на кадр (вир закриває сцену), щоб не було одного довгого провалу
function epochLayerSteps() {
  return [
    () => { document.body.dataset.epoch = String(viewEpoch() % EPOCHS.length); refreshCoinIcon(); skyLayer = buildSkyLayer(); },
    () => { groundLayer = buildGroundLayer(); },
    // спрайти героїв нової епохи — по одному на кадр, ще до портретів (інакше портрети будували їх усі разом — ривок ~0,1 с)
    ...(typeof TEAM !== 'undefined' ? TEAM : []).map(m => () => { try { getSpriteCanvas(teamSprite(m.id)); } catch (e) { /* домалюється в кадрі */ } }),
    () => {
      theme.key = null;              // змусити updateTheme перерахувати прикраси
      seedEpochFx();
      updateTheme();
      refreshTeamPortraits();
      drawCapiPortrait();             // скін Капі залежить від епохи
    },
    () => { if (shop) rebuildShop(true); },
    // спрайти покупців нової епохи — заздалегідь, по одному на кадр: інакше вони будувались у першому кадрі нової епохи (ривок до 0,3 с)
    ...CUSTOMER_TYPES.flatMap(tp => [0, 1].map(f => () => { try { evenScaled(getSpriteCanvas(tp + '_' + f), CUST_K); } catch (e) { /* домалюється */ } }))
  ];
}
function rebuildEpochLayers() { epochLayerSteps().forEach(fn => fn()); }
function resetEpochFx() {
  stars.length = 0; leaves.length = 0;
  const e = currentEpoch();
  const area = (view.w * view.h) / (320 * 180);        // на великій сцені — більше зірок і листя
  if (e.decor.includes('stars')) for (let i = 0; i < Math.round(26 * area); i++) stars.push({ x: rand(worldL(), worldR()), y: rand(2 - view.offY, 70), ph: rand(0, 6.3) });
  if ((e.decor.includes('leaves') || theme.decor.has('autumnleaves')) && animOn()) for (let i = 0; i < Math.round((theme.decor.has('autumnleaves') ? 40 : 24) * area); i++) leaves.push({ x: rand(worldL(), worldR()), y: rand(-view.offY, worldB()), vy: rand(10, 20), ph: rand(0, 6.3), col: ['o', 'r', 'h'][i % 3] });
  if (theme.decor.has('petals') && animOn()) for (let i = 0; i < Math.round(26 * area); i++) leaves.push({ x: rand(worldL(), worldR()), y: rand(-view.offY, worldB()), vy: rand(7, 13), ph: rand(0, 6.3), col: ['p', 'q', 'p'][i % 3], petal: true });
}
function drawEpochBack() {
  stars.forEach(s => { if (Math.sin(animClock * 2 + s.ph) > -0.4) R(ctx, Math.round(s.x), Math.round(s.y), 1, 1, 'w'); });
}
function drawEpochFront() {
  if (!animOn()) return;
  leaves.forEach(l => R(ctx, Math.round(l.x + Math.sin(animClock * 1.5 + l.ph) * 6), Math.round(l.y), l.petal ? 3 : 2, l.petal ? 2 : 1, l.col));
}
function updateEpochFx(dt) {
  if (!animOn()) return;
  leaves.forEach(l => { l.y += l.vy * dt; l.x += 6 * dt; if (l.y > worldB()) { l.y = -view.offY - 2; l.x = rand(worldL(), worldR()); } if (l.x > worldR()) l.x = worldL(); });
}

/* ---------- Заставка нової епохи (на весь екран) ---------- */
const epochIntro = { active: false, timers: [], startedAt: 0, done: null };
const EPOCH_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
// Емблема епохи: малюнок 32×32 на полотні 36×36, довкола — темний контур, по краях — світло зліва згори й тінь справа знизу (р. 73е)
function drawEpochEmblem(g, i) {
  const c = g.canvas; if (c.width !== 36) { c.width = 36; c.height = 36; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 36, 36); g.save(); g.translate(2, 2); eiEmblemArt(g, i); g.restore();
  const d = g.getImageData(0, 0, 36, 36), p = d.data, o = new Uint8ClampedArray(p), A = k => p[k * 4 + 3] > 100;
  for (let y = 0; y < 36; y++) for (let x = 0; x < 36; x++) {
    const k = y * 36 + x, j = k * 4;
    if (!A(k)) { if ((x > 0 && A(k - 1)) || (x < 35 && A(k + 1)) || (y > 0 && A(k - 36)) || (y < 35 && A(k + 36))) { o[j] = 26; o[j + 1] = 16; o[j + 2] = 36; o[j + 3] = 255; } continue; }
    const ul = (x > 0 && !A(k - 1)) || (y > 0 && !A(k - 36)), dr = (x < 35 && !A(k + 1)) || (y < 35 && !A(k + 36));
    if (ul && !dr) for (let q = 0; q < 3; q++) o[j + q] = p[j + q] + (255 - p[j + q]) * 0.35; else if (dr && !ul) for (let q = 0; q < 3; q++) o[j + q] = p[j + q] * 0.72;
  }
  d.data.set(o); g.putImageData(d, 0, 0);
}
function eiEmblemArt(g, i) {
  g.clearRect(0, 0, 32, 32);
  if (i === 8) { drawJapanEmblem(g); return; }
  switch (i) {
    case 0:                                            // лавровий вінок і колона
      for (let a = 0.35; a < 2 * Math.PI - 0.35; a += 0.28) { const x = Math.round(16 + Math.cos(a + 1.57) * 13), y = Math.round(16 + Math.sin(a + 1.57) * 13); R(g, x - 1, y - 1, 3, 2, Math.floor(a * 3.5) % 2 ? 'g' : 'G'); }
      R(g, 14, 27, 5, 3, 'r'); R(g, 10, 8, 12, 3, 'w'); R(g, 9, 9, 2, 3, 'h'); R(g, 21, 9, 2, 3, 'h'); R(g, 12, 11, 8, 14, 'W'); R(g, 14, 11, 1, 14, 'e'); R(g, 17, 11, 1, 14, 'e'); R(g, 10, 25, 12, 2, 'w');
      break;
    case 1:                                            // вінілова платівка
      disc(g, 16, 16, 14, 'k'); disc(g, 16, 16, 11, 'd'); disc(g, 16, 16, 10, 'k'); disc(g, 16, 16, 7, 'd'); disc(g, 16, 16, 6, 'k'); disc(g, 16, 16, 4, 'r'); R(g, 16, 16, 1, 1, 'w');
      R(g, 8, 7, 5, 1, 'w'); R(g, 7, 8, 1, 3, 'w'); lineG(g, 29, 3, 20, 15, 'e'); R(g, 28, 2, 3, 3, 'E');
      break;
    case 2:                                            // дзеркальна куля
      R(g, 16, 0, 1, 3, 'd');
      for (let y = 3; y < 30; y++) for (let x = 3; x < 30; x++) { const dx = x - 16.5, dy = y - 16.5; if (dx * dx + dy * dy <= 182) R(g, x, y, 1, 1, ((Math.floor(x / 3) + Math.floor(y / 3)) % 2) ? 'a' : 'S'); }
      [[8, 9], [20, 8], [12, 20], [22, 21], [16, 14]].forEach((p, k) => { R(g, p[0], p[1], 1, 1, 'w'); R(g, p[0] - 1, p[1], 3, 1, k % 2 ? 'y' : 'f'); R(g, p[0], p[1] - 1, 1, 3, k % 2 ? 'y' : 'f'); });
      break;
    case 3:                                            // прибулець з аркадної гри
      ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'].forEach((row, ry) => { for (let rx = 0; rx < 11; rx++) if (row[rx] === '#') R(g, 5 + rx * 2, 8 + ry * 2, 2, 2, 'T'); });
      R(g, 11, 14, 2, 2, 'k'); R(g, 19, 14, 2, 2, 'k'); R(g, 5, 28, 22, 1, 'f');
      break;
    case 4:                                            // глобус зі стрічкою-орбітою
      disc(g, 16, 16, 12, 's'); disc(g, 12, 12, 5, 'g'); disc(g, 21, 18, 6, 'g'); disc(g, 14, 24, 3, 'g'); R(g, 9, 8, 4, 1, 'S');
      for (let a = 0; a < 6.28; a += 0.12) R(g, Math.round(16 + Math.cos(a) * 15), Math.round(16 + Math.sin(a) * 5 + Math.cos(a) * 3), 1, 1, 'n');
      break;
    case 5:                                            // листок і сонце
      for (let y = 4; y < 29; y++) { const half = Math.round(11 * Math.sin(Math.PI * (y - 4) / 25)); R(g, 16 - half, y, half * 2 + 1, 1, y % 5 < 3 ? 'g' : 'G'); R(g, 16, y, 1, 1, 'G'); }
      R(g, 15, 28, 3, 3, 'b'); disc(g, 26, 6, 4, 'y'); R(g, 24, 4, 2, 1, 'w');
      break;
    case 6:                                            // ракета серед зір
      R(g, 13, 7, 6, 15, 'w'); R(g, 15, 2, 2, 2, 'r'); R(g, 14, 4, 4, 3, 'r'); R(g, 9, 16, 4, 8, 'r'); R(g, 19, 16, 4, 8, 'r'); disc(g, 16, 12, 2, 's');
      R(g, 14, 22, 4, 4, 'o'); R(g, 15, 26, 2, 4, 'y');
      [[4, 5], [27, 8], [6, 24], [26, 22], [24, 2]].forEach(p => { R(g, p[0], p[1], 1, 1, 'y'); R(g, p[0] - 1, p[1], 3, 1, 'w'); R(g, p[0], p[1] - 1, 1, 3, 'w'); });
      break;
    default:                                           // неонова блискавка в колі
      disc(g, 16, 16, 15, 'f'); disc(g, 16, 16, 13, 'z');
      [[5, 17, 20], [6, 16, 19], [7, 15, 18], [8, 14, 17], [9, 13, 16], [10, 12, 15], [11, 11, 14], [12, 10, 19], [13, 16, 19], [14, 15, 18], [15, 14, 17], [16, 13, 16], [17, 12, 15], [18, 11, 14], [19, 10, 13], [20, 9, 12]]
        .forEach(r => { R(g, r[1] + 1, r[0] + 1, r[2] - r[1] + 1, 1, 'T'); R(g, r[1], r[0], r[2] - r[1] + 1, 1, 'y'); });
  }
}
/* ---------- Заставка епохи: у кожної епохи свій фон-анімація й свій вихід на сцену ---------- */
let eiRaf = 0, eiT0 = 0;
function eiFont(g, px) { g.font = (px >= 12 ? 16 : 8) + 'px "Press Start 2P", monospace'; }      // піксельний шрифт лише в рідному розмірі 8/16 — літери чіткі
function eiRand(i, k) { return warpSeed(i * 7 + (k || 0)); }
/* ---------- Заставка епохи: чисті пікселі (р. 73е) ----------
   Полотно заставки 240 px завширшки розтягується на весь екран «квадратиками», тож кожна фігура тут малюється цілими пікселями:
   прямокутники й текст прилипають до сітки (eiCrisp), овали, лінії й багатокутники — по пікселях (eiEll, eiLine, eiPoly), без розмитих країв. */
function eiCrisp(g) {
  if (g._crisp) return g; g._crisp = 1;
  const fr = g.fillRect, ft = g.fillText;
  g.fillRect = function (x, y, w, h) { const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.round(x + w), y1 = Math.round(y + h); if (x1 > x0 && y1 > y0) fr.call(this, x0, y0, x1 - x0, y1 - y0); };
  g.fillText = function (s, x, y) { ft.call(this, s, Math.round(x), Math.round(y)); };
  return g;
}
const eiR = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function eiEll(g, cx, cy, rx, ry, rot, c) {                    // заповнений (повернутий) овал по пікселях
  const co = Math.cos(rot || 0), si = Math.sin(rot || 0), m = Math.ceil(Math.max(rx, ry)) + 1, X0 = Math.round(cx), Y0 = Math.round(cy); g.fillStyle = c;
  for (let y = Y0 - m; y <= Y0 + m; y++) {
    let a = null, b = null;
    for (let x = X0 - m; x <= X0 + m; x++) { const dx = x + 0.5 - cx, dy = y + 0.5 - cy, u = (dx * co + dy * si) / rx, v = (-dx * si + dy * co) / ry; if (u * u + v * v <= 1) { if (a === null) a = x; b = x; } }
    if (a !== null) g.fillRect(a, y, b - a + 1, 1);
  }
}
const eiDisc = (g, cx, cy, r, c) => eiEll(g, cx, cy, r, r, 0, c);
function eiLine(g, x0, y0, x1, y1, c, w) {                      // лінія з квадратиків w×w
  w = w || 1; const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); g.fillStyle = c;
  for (let k = 0; k <= n; k++) g.fillRect(Math.round(x0 + (x1 - x0) * k / n - w / 2 + 0.5), Math.round(y0 + (y1 - y0) * k / n - w / 2 + 0.5), w, w);
}
function eiPoly(g, pts, c) {                                    // багатокутник рядками пікселів
  const Hc = g.canvas.height; let y0 = Infinity, y1 = -Infinity; pts.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); g.fillStyle = c;
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(Hc, Math.ceil(y1)); y++) {
    const yc = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
  }
}
function eiBall(g, cx, cy, r, cols, tile) {                      // куля зі світлом зліва згори: cols — від темного до світлого; tile — квадратики дзеркальної кулі
  cx = Math.round(cx); cy = Math.round(cy);
  for (let y = -r; y < r; y++) for (let x = -r; x < r; x++) {
    const nx = (x + 0.5) / r, ny = (y + 0.5) / r, q = nx * nx + ny * ny; if (q > 1) continue;
    let l = -nx * 0.55 - ny * 0.65 + Math.sqrt(1 - q) * 0.55; if (tile && ((Math.floor((x + 40) / tile) + Math.floor((y + 40) / tile)) & 1)) l -= 0.22;
    eiR(g, cx + x, cy + y, 1, 1, cols[Math.max(0, Math.min(cols.length - 1, Math.floor((l + 0.35) * cols.length / 1.25)))]);
  }
}
function eiSprite(g, rows, x, y, map, k) {                      // піксельний малюнок рядками; k — розмір пікселя
  k = k || 1; x = Math.round(x); y = Math.round(y);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = map[r[i]]; if (c) eiR(g, x + i * k, y + j * k, k, k, c); } });
}
const EI_KEY = ['#####.', '#...#.', '#.#.#.', '#.###.', '#.....', '######'];
const eiKeyCache = {};
function eiKey(g, y, W, off, col, hi) {                         // грецький меандр, що біжить уздовж краю (готова смуга, зсув — цілими пікселями)
  const key = W + col; let c = eiKeyCache[key];
  if (!c) { c = eiKeyCache[key] = document.createElement('canvas'); c.width = W + 12; c.height = 8; const kg = c.getContext('2d'); eiR(kg, 0, 0, W + 12, 1, col); eiR(kg, 0, 7, W + 12, 1, col); for (let x = 0; x < W + 12; x += 6) EI_KEY.forEach((r, j) => { for (let i = 0; i < 6; i++) if (r[i] === '#') eiR(kg, x + i, j + 1, 1, 1, j > 0 && EI_KEY[j - 1][i] === '#' ? col : hi); }); }
  g.drawImage(c, -6 + (((Math.round(off) % 6) + 6) % 6), Math.round(y));
}
function eiColumn(g, cx, w, top, bot, back) {                   // іонічна колона: капітель із волютами, канелюри, база
  const C = back ? ['#a39a8a', '#bdb4a2', '#cfc6b4', '#ddd5c4', '#b3aa98'] : ['#b8ab8c', '#d6ccb4', '#f4efe4', '#fffaf0', '#cfc4a8'];   // контур, тінь, тіло, відблиск, канелюра
  const x0 = Math.round(cx - w / 2); top = Math.round(top); bot = Math.round(bot);
  eiR(g, x0, top + 5, w, bot - top - 9, C[2]); eiR(g, x0 + w - Math.ceil(w / 3), top + 5, Math.ceil(w / 3), bot - top - 9, C[1]);
  for (let fx = x0 + 2; fx < x0 + w - 2; fx += 3) { eiR(g, fx, top + 6, 1, bot - top - 11, C[4]); if (fx + 1 < x0 + w - Math.ceil(w / 3)) eiR(g, fx + 1, top + 6, 1, bot - top - 11, C[3]); }
  eiR(g, x0, top + 5, 1, bot - top - 9, C[0]); eiR(g, x0 + w - 1, top + 5, 1, bot - top - 9, C[0]);
  eiR(g, x0 - 3, top, w + 6, 3, C[2]); eiR(g, x0 - 3, top, w + 6, 1, C[3]); eiR(g, x0 - 3, top + 2, w + 6, 1, C[0]);            // абака
  eiR(g, x0 - 1, top + 3, w + 2, 2, C[1]); eiR(g, x0 - 1, top + 4, w + 2, 1, C[0]);                                                // ехін
  [x0 - 4, x0 + w + 1].forEach(vx => { eiR(g, vx, top + 2, 3, 3, C[0]); eiR(g, vx + 1, top + 3, 1, 1, C[3]); });                    // волюти
  eiR(g, x0 - 2, bot - 4, w + 4, 2, C[2]); eiR(g, x0 - 2, bot - 4, w + 4, 1, C[3]); eiR(g, x0 - 2, bot - 3, w + 4, 1, C[0]);      // база
  eiR(g, x0 - 3, bot - 2, w + 6, 3, C[1]); eiR(g, x0 - 3, bot - 2, w + 6, 1, C[2]); eiR(g, x0 - 3, bot, w + 6, 1, C[0]);
}
function eiOlive(g, x0, y0, dx, len, sw) {                      // оливкова гілка з кута: листки з контуром і прожилкою, темні оливки з відблиском
  const N = 22, last = Math.floor(N * len), pt = i => { const t = i / N; return [x0 + dx * (t * 93 + Math.sin(t * 5 + sw) * 4.5), y0 + t * 105 + Math.sin(t * 3 + sw) * 3]; };
  for (let i = 1; i <= last; i++) { const [ax, ay] = pt(i - 1), [bx, by] = pt(i); eiLine(g, ax, ay, bx, by, '#3e2f1e', 2); eiLine(g, ax, ay - 1, bx, by - 1, '#7a6040', 1); }
  for (let i = 2; i <= last; i += 2) {
    const [x, y] = pt(i);
    [-1, 1].forEach(side => {
      const an = side * 0.9 + dx * 0.3 + Math.sin(sw * 1.7 + i) * 0.12, lx = x + Math.cos(an) * side * 6, ly = y + Math.sin(an) * side * 6;
      eiEll(g, lx, ly, 6.2, 2.7, an, '#4f6a30'); eiEll(g, lx, ly, 5.2, 1.8, an, i % 4 ? '#8fa85a' : '#a9c06c'); eiEll(g, lx - 1, ly - 1, 3, 0.8, an, '#c4d88a');
    });
    if (i % 6 === 0) { const ox = x - dx * 3, oy = y + 4.5; eiEll(g, ox, oy, 2.8, 3.6, 0, '#160f20'); eiEll(g, ox, oy, 2.1, 2.9, 0, '#2c2038'); eiR(g, ox - 1, oy - 2, 1, 1, '#7a6aa0'); }
  }
}
const EI_DOVE = [['w.....w', 'ww...ww', '.wwgww.', '..www..'], ['.......', '..wgw..', 'wwwwwww', 'w.....w']];
const EI_AMPHORA = ['.ddddd.', '..ooo..', '.ohooo.', 'ohoooOd', 'okkkkkd', 'ohoyooO', 'ohooooO', '.ohoOd.', '..oOd..', '.ddddd.'];
const eiDigit = {};
function eiGlyph(d, col) {                                      // цифри 0/1 «цифрового дощу» 3×5
  const k = d + col; if (eiDigit[k]) return eiDigit[k];
  const c = document.createElement('canvas'); c.width = 3; c.height = 5; eiSprite(c.getContext('2d'), d === '1' ? ['.1.', '11.', '.1.', '.1.', '111'] : ['111', '1.1', '1.1', '1.1', '111'], 0, 0, { 1: col });
  return (eiDigit[k] = c);
}
const EI_DRAW = [
  // 0 Відродження — давня Греція: іонічні колони підіймаються, фриз із меандром і зубчиками, оливкові гілки гойдаються, амфори, голуби, золотий пил і промені
  (g, W, H, t) => {
    const e = Math.min(1, t / 1.8), ez = e * e * (3 - 2 * e), lift = Math.round((1 - ez) * H), top = Math.round(H * 0.1), bot = Math.round(H * 0.9);
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const an = Math.PI / 2 + (i - 4) * 0.22 + Math.sin(t * 0.4 + i) * 0.03, L = W * 1.4, ox = W / 2, oy = -H * 0.1; g.globalAlpha = i % 2 ? 0.08 : 0.12; eiPoly(g, [[ox, oy], [ox + Math.cos(an - 0.05) * L, oy + Math.sin(an - 0.05) * L], [ox + Math.cos(an + 0.05) * L, oy + Math.sin(an + 0.05) * L]], '#ffe9a0'); }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    eiColumn(g, W * 0.2, 11, top + lift, bot + lift, 1); eiColumn(g, W * 0.8, 11, top + lift, bot + lift, 1);
    eiColumn(g, W * 0.07, 18, top + lift, bot + lift, 0); eiColumn(g, W * 0.93, 18, top + lift, bot + lift, 0);
    const fy = bot + lift;                                                                                   // сходинки знизу
    eiR(g, 0, fy, W, H - fy, '#d9c9a0'); eiR(g, 0, fy, W, 1, '#fffaf0'); eiKey(g, fy + 2, W, -t * 12, '#c19a2e', '#ecd078'); eiR(g, 0, fy + 10, W, 1, '#b8ab8c'); eiR(g, 0, fy + 11, W, H, '#c9b78c'); eiR(g, 0, fy + 11, W, 1, '#e9dcb8');
    if (ez > 0.9) [0.3, 0.7].forEach((ax, k) => eiSprite(g, EI_AMPHORA, W * ax - (k ? 0 : 7), fy - 10, { d: '#6e2a1c', o: '#c4553d', O: '#8a3a2a', h: '#e8a07a', k: '#2a1d1a', y: '#c19a2e' }));
    const ty = top - Math.round((1 - ez) * H * 0.3);                                                          // фриз згори: меандр і зубчики
    eiR(g, 0, ty - 10, W, 10, '#f2ead6'); eiR(g, 0, ty - 10, W, 1, '#fffaf0'); eiKey(g, ty - 9, W, t * 12, '#c19a2e', '#ecd078'); eiR(g, 0, ty - 1, W, 1, '#b8ab8c');
    for (let x = 0; x < W; x += 4) { eiR(g, x, ty, 2, 2, '#e9e1d0'); eiR(g, x + 1, ty + 1, 1, 1, '#b8ab8c'); }
    eiOlive(g, W * 0.12, ty, 1, Math.min(0.6, t / 2.2), t * 1.3); eiOlive(g, W * 0.88, ty, -1, Math.min(0.6, t / 2.2), t * 1.3 + 2);
    for (let k = 0; k < 2; k++) { const f = ((t * 0.09 + k * 0.5) % 1.2) - 0.1, x = f * W * (k ? -1 : 1) + (k ? W : 0), y = H * (0.3 + k * 0.08) + Math.sin(t * 2 + k) * 4; eiSprite(g, EI_DOVE[Math.floor(t * 5 + k) % 2], x, y, { w: '#fffaf0', g: '#cfc8d8' }); }
    for (let i = 0; i < 26; i++) { const x = ((eiRand(i) + t * 0.02 * (1 + eiRand(i, 3))) % 1) * W, y = ((eiRand(i, 5) + t * 0.05) % 1) * H, s = Math.sin(t * 2 + i); if (s < 0.1) continue; eiR(g, x, y, 1, 1, '#ffe9a0'); if (s > 0.8) { eiR(g, x - 1, y, 3, 1, '#ffe9a0'); eiR(g, x, y - 1, 1, 3, '#ffe9a0'); eiR(g, x, y, 1, 1, '#fff'); } }
  },
  // 1 Ретро — відеокасета: смуги відстеження, шум, ▶ PLAY і лічильник
  (g, W, H, t) => {
    const sc = W / 160;
    for (let y = 0; y < H; y += 2) { g.globalAlpha = 0.16; g.fillStyle = '#05030c'; g.fillRect(0, y, W, 1); }
    const noise = Math.max(0, 1 - t / 1.4);
    for (let i = 0; i < 260 * noise; i++) { g.globalAlpha = 0.5 * noise; g.fillStyle = eiRand(i, Math.floor(t * 30)) > 0.5 ? '#fff' : '#889'; g.fillRect(eiRand(i + 3, Math.floor(t * 30)) * W, eiRand(i + 9, Math.floor(t * 30)) * H, 3, 1); }
    const bars = ['#fff4dc', '#ffe08a', '#86cfe8', '#8ed4a6', '#ef8fa3', '#c4553d', '#3d5a8c', '#2a1d1a'];
    if (t < 0.9) { g.globalAlpha = (0.9 - t) * 0.9; bars.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * W / 8, 0, W / 8 + 1, H); }); }
    const ty = ((t * 0.28) % 1.3 - 0.15) * H; g.globalAlpha = 0.18; g.fillStyle = '#fff'; g.fillRect(0, ty, W, 5 * sc * 0.6);
    for (let k = 0; k < 4; k++) { const y = H * (0.2 + eiRand(k + Math.floor(t * 2)) * 0.6); g.globalAlpha = 0.28; g.drawImage(g.canvas, 4, y, W - 4, 3, 0, y, W, 3); }
    g.globalAlpha = 1; eiFont(g, 8 * sc * 0.8); g.textBaseline = 'top'; g.textAlign = 'left';
    g.fillStyle = '#000'; g.fillText('▶ PLAY', 9 * sc * 0.6 + 1, 9 * sc * 0.6 + 1); g.fillStyle = '#fff'; g.fillText('▶ PLAY', 9 * sc * 0.6, 9 * sc * 0.6);
    g.textAlign = 'right'; const sec = Math.floor(t); g.fillStyle = '#000'; g.fillText('SP 0:00:0' + Math.min(9, sec), W - 9 * sc * 0.6 + 1, 9 * sc * 0.6 + 1); g.fillStyle = Math.floor(t * 2) % 2 ? '#ff5fa2' : '#fff'; g.fillText('SP 0:00:0' + Math.min(9, sec), W - 9 * sc * 0.6, 9 * sc * 0.6);
    g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillStyle = '#ffe08a'; g.fillText('1957', 9 * sc * 0.6, H - 8 * sc * 0.6);
  },
  // 2 Диско — промені прожекторів, танцпол із плитками під ритм, дзеркальні кулі з квадратиками
  (g, W, H, t) => {
    const cols = ['#ff4fa8', '#4fd8ff', '#ffd84f', '#8f5fff'], beat = Math.floor(t * 6), fy = Math.round(H * 0.7), T = 12;
    for (let r = 0; r < Math.ceil((H - fy) / T); r++) for (let c = 0; c < Math.ceil(W / T); c++) { const cc = cols[(r * 3 + c * 2 + beat) % 4], on = (r + c + beat) % 2; g.globalAlpha = on ? 0.8 : 0.5; eiR(g, c * T, fy + r * T, T - 1, T - 1, cc); g.globalAlpha = on ? 0.6 : 0.25; eiR(g, c * T + 1, fy + r * T + 1, T - 3, 1, '#fff'); }
    g.globalAlpha = 1; eiR(g, 0, fy - 1, W, 1, '#1a1024');
    g.globalCompositeOperation = 'lighter';
    [0.1, 0.5, 0.9].forEach((px, j) => { for (let i = 0; i < 3; i++) { const an = Math.PI / 2 + Math.sin(t * 1.3 + j * 2 + i) * 0.8 + (i - 1) * 0.35, ox = W * px; g.globalAlpha = 0.17; eiPoly(g, [[ox, 0], [ox + Math.cos(an - 0.09) * W, Math.sin(an - 0.09) * W], [ox + Math.cos(an + 0.09) * W, Math.sin(an + 0.09) * W]], cols[(i + j) % 4]); } });
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    [[0.1, 0.16], [0.9, 0.2]].forEach(([bx, by], j) => {
      const r = Math.round(Math.min(W, H) * 0.09), cx = Math.round(W * bx), cy = Math.round(H * by);
      eiR(g, cx, 0, 1, cy - r, '#d8d8f0'); eiR(g, cx - 1, cy - r - 1, 3, 2, '#8a8ab0');
      eiBall(g, cx, cy, r, ['#3a3a66', '#5a5a86', '#8a8ab0', '#b8b8d8', '#e8e8ff', '#fff'], 3);
      for (let i = 0; i < 9; i++) { const a = eiRand(i + j * 20) * 6.28, rr = Math.sqrt(eiRand(i + 5)) * r * 0.8; if ((i + beat) % 3) eiR(g, Math.floor((cx + Math.cos(a) * rr) / 3) * 3, Math.floor((cy + Math.sin(a) * rr) / 3) * 3, 2, 2, cols[(i + beat) % 4]); }
    });
    for (let i = 0; i < 24; i++) { if ((Math.floor(t * 5) + i) % 5 > 1) continue; const x = Math.round(eiRand(i + 40) * W), y = Math.round(eiRand(i + 70) * H * 0.7), s = 1 + Math.round(eiRand(i) * 2); eiR(g, x - s, y, s * 2 + 1, 1, '#fff'); eiR(g, x, y - s, 1, s * 2 + 1, '#fff'); }
  },
  // 3 Аркади — зорі, марш прибульців, INSERT COIN і рахунок
  (g, W, H, t) => {
    const sc = W / 160, p = Math.max(2, Math.round(2.2 * sc * 0.7));
    for (let i = 0; i < 50; i++) { g.globalAlpha = 0.3 + 0.5 * eiRand(i + Math.floor(t * 6)); g.fillStyle = '#fff'; g.fillRect(Math.round(eiRand(i) * W), Math.round(((eiRand(i + 9) * H) + t * H * (0.1 + eiRand(i + 3) * 0.2)) % H), 1, 1); }
    g.globalAlpha = 1;
    const cols = ['#ff5a5a', '#ffd84f', '#7aff7a'], step = Math.floor(t * 3) % 2, iw = 11 * p, gap = p * 4, shift = Math.sin(t * 1.2) * W * 0.1;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const x = W / 2 - (6 * iw + 5 * gap) / 2 + c * (iw + gap) + shift, y = H * 0.06 + r * (8 * p + p * 3) + (Math.floor(t * 0.8) % 3) * p; g.fillStyle = cols[r]; WARP_INV.forEach((row, ry) => { for (let rx = 0; rx < 11; rx++) if (row[rx] === '1') g.fillRect(Math.round(x + rx * p + (ry === 7 && step ? (rx < 5 ? -p : p) : 0)), Math.round(y + ry * p), p, p); }); }
    const sx = W / 2 + Math.sin(t * 1.7) * W * 0.3, sy = H * 0.9; g.fillStyle = '#7ad8ff'; g.fillRect(sx - 3 * p, sy, 6 * p, p * 2); g.fillRect(sx - p, sy - p * 2, p * 2, p * 2);
    for (let i = 0; i < 3; i++) { const f = ((t * 1.4 + i / 3) % 1); g.fillStyle = '#fff'; g.fillRect(sx - p / 2, sy - f * H * 0.75, Math.max(1, p * 0.7), p * 2); }
    eiFont(g, 7 * sc * 0.8); g.textBaseline = 'top'; g.textAlign = 'left'; g.fillStyle = '#fff'; g.fillText('1UP ' + String(Math.floor(t * 4300)).padStart(6, '0'), 7 * sc * 0.6, 6 * sc * 0.6);
    g.textAlign = 'right'; g.fillStyle = '#ffd84f'; g.fillText('HI 099990', W - 7 * sc * 0.6, 6 * sc * 0.6);
    g.textAlign = 'center'; g.textBaseline = 'bottom'; if (Math.floor(t * 2.5) % 2) { g.fillStyle = '#ffe08a'; g.fillText('INSERT COIN', W / 2, H - 4 * sc * 0.6); }
  },
  // 4 Інтернет — цифровий дощ (піксельні 0 і 1) у вікні браузера, смуга завантаження
  (g, W, H, t) => {
    const cw = 6;
    for (let c = 0; c < Math.ceil(W / cw); c++) { const sp = 0.4 + eiRand(c) * 0.9, head = ((eiRand(c + 7) + t * sp * 0.4) % 1.4) * H * 1.3 - H * 0.1; for (let j = 0; j < 9; j++) { const y = Math.round(head - j * 7); if (y < -6 || y > H) continue; g.globalAlpha = j === 0 ? 0.9 : (1 - j / 9) * 0.55; g.drawImage(eiGlyph(eiRand(c * 13 + j + Math.floor(t * 8)) > 0.5 ? '1' : '0', j === 0 ? '#e6fff4' : '#2ee69a'), c * cw + 1, y); } }
    g.globalAlpha = 1;
    const m = 3, tb = 11;
    eiR(g, m - 1, m - 1, W - 2 * m + 2, H - 2 * m + 2, '#1b2a44'); eiR(g, m, m + tb, W - 2 * m, H - 2 * m - tb, 'rgba(4,20,26,.55)');
    eiR(g, m, m, W - 2 * m, tb, '#2a55d8'); eiR(g, m, m, W - 2 * m, 1, '#6a8cff'); [0, 1, 2].forEach(i => { eiR(g, W - m - (3 - i) * 9 - 1, m + 3, 6, 5, '#0e1a3a'); eiR(g, W - m - (3 - i) * 9, m + 3, 5, 4, ['#ef8fa3', '#ffe08a', '#8ed4a6'][i]); });
    eiFont(g, 8); g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = '#fff'; g.fillText('www.capytap.net', m + 4, m + 2);
    const pr = Math.min(1, t / 3.4), bw = Math.round(W * 0.6), bx = Math.round(W / 2 - bw / 2), by = H - m - 18; eiR(g, bx - 1, by - 1, bw + 2, 9, '#04141a'); eiR(g, bx - 1, by - 1, bw + 2, 1, '#2a55d8');
    for (let x = 0; x < bw * pr - 4; x += 5) { eiR(g, bx + x + 1, by + 1, 4, 5, '#2ee69a'); eiR(g, bx + x + 1, by + 1, 4, 1, '#b8ffe0'); }
    g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillStyle = '#e6fff4'; g.fillText(pr < 1 ? 'LOADING ' + Math.floor(pr * 100) + '%' : 'DONE', W / 2, by - 3);
  },
  // 5 Еко — ліани з листям і квітами ростуть із кутів, листя кружляє, сонячні промені, метелики
  (g, W, H, t) => {
    const leaf = ['#2f8f4a', '#5fbf5a', '#9fd45a', '#e8b44a', '#e87a4a', '#ff9fc0'];
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { g.globalAlpha = 0.11; const x = W * (0.7 + i * 0.04); eiPoly(g, [[x, -4], [x - W * 0.5 - i * 6, H], [x - W * 0.5 + 10, H]], '#fff6c8'); } g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const kv = Math.min(1, t / 2.6);
    [[0, H, 1], [W, H, -1]].forEach(([x0, y0, d], vi) => {
      const N = 40, last = Math.floor(N * kv), P = i => { const t2 = i / N; return [x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.06 + t2 * W * 0.3), y0 - t2 * H * 0.92]; };
      for (let i = 1; i <= last; i++) { const [ax, ay] = P(i - 1), [bx, by] = P(i); eiLine(g, ax, ay, bx, by, '#1f5a30', 3); eiLine(g, ax, ay, bx, by, '#2f7a42', 2); }
      for (let i = 3; i <= last; i += 3) { const [x, y] = P(i), sw = Math.sin(t * 1.6 + i) * 0.15; eiEll(g, x + d * 4, y, 5.2, 2.8, d * 0.5 + sw, '#1f5a30'); eiEll(g, x + d * 4, y, 4.3, 2, d * 0.5 + sw, leaf[i % 3]); eiR(g, x + d * 4 - 1, y - 1, 2, 1, '#c8f08a'); }
      if (kv > 0.85) { const [x, y] = P(last); for (let p = 0; p < 6; p++) eiDisc(g, x + Math.cos(p * 1.047 + t * 0.5) * 4.5, y + Math.sin(p * 1.047 + t * 0.5) * 4.5, 2.8, p % 2 ? '#ff9fc0' : '#ffb8d0'); eiDisc(g, x, y, 2.6, '#ffe08a'); eiR(g, x - 1, y - 1, 1, 1, '#fff'); }
    });
    for (let i = 0; i < 40; i++) { const x = ((eiRand(i) + Math.sin(t * 0.7 + i) * 0.04) % 1) * W, y = ((eiRand(i + 9) + t * (0.04 + eiRand(i + 3) * 0.05)) % 1.1) * H - 8, s = 2 + eiRand(i + 5) * 2.5; eiEll(g, x, y, s, s * 0.5, t * 1.2 + i, leaf[i % 6]); }
    for (let i = 0; i < 3; i++) { const bx = Math.round((0.2 + 0.3 * i + Math.sin(t * 0.6 + i) * 0.08) * W), by = Math.round((0.3 + 0.1 * i + Math.cos(t * 0.8 + i) * 0.06) * H), up = Math.floor(t * 8 + i) % 2, c = ['#ffd84f', '#ff9fc0', '#9fd4ff'][i];
      eiSprite(g, up ? ['cc.cc', 'cckcc', '.ckc.', '..k..'] : ['.....', 'cckcc', 'cckcc', '..k..'], bx - 2, by - 2, { c, k: '#4a3228' }); }
  },
  // 6 Космос — зорі летять із центру, планети з кільцем, ракета, зорепад
  (g, W, H, t) => {
    const cx = W / 2, cy = H / 2, diag = Math.hypot(W, H);
    g.globalAlpha = 0.5; const nb = g.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.5); nb.addColorStop(0, 'rgba(154,85,232,.45)'); nb.addColorStop(1, 'rgba(154,85,232,0)'); g.fillStyle = nb; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    for (let i = 0; i < 110; i++) { const an = eiRand(i) * 6.28, f = (eiRand(i + 9) + t * 0.18) % 1, r0 = f * f * diag * 0.6 + 2, len = f * f * diag * 0.12; g.globalAlpha = Math.min(1, f * 2.5); eiLine(g, cx + Math.cos(an) * r0, cy + Math.sin(an) * r0, cx + Math.cos(an) * (r0 + len), cy + Math.sin(an) * (r0 + len), i % 5 === 0 ? '#9fc8ff' : '#fff', f > 0.7 ? 2 : 1); }
    g.globalAlpha = 1;
    [[0.12, 0.2, 0.09, ['#5a2418', '#a84a2a', '#e8794a', '#f2b48a', '#ffe0c8'], 0], [0.9, 0.78, 0.13, ['#1a3a70', '#2f6ab0', '#5fa8e8', '#bfe0ff', '#f0f8ff'], 1], [0.82, 0.14, 0.05, ['#4a2070', '#7a3ab0', '#b46ae8', '#e6c4ff'], 0]].forEach(([px, py, pr, cs, ring], i) => {
      const r = Math.round(Math.min(W, H) * pr), x = Math.round(W * px + Math.sin(t * 0.3 + i) * 3), y = Math.round(H * py);
      const ringPx = front => { if (!ring) return; const co = Math.cos(-0.4), si = Math.sin(-0.4); for (let yy = -r * 2; yy <= r * 2; yy++) for (let xx = -r * 2; xx <= r * 2; xx++) { const u = ((xx + 0.5) * co + (yy + 0.5) * si) / (r * 1.7), v = (-(xx + 0.5) * si + (yy + 0.5) * co) / (r * 0.45), q = u * u + v * v; if (q < 0.78 || q > 1.08 || (v > 0) !== front) continue; eiR(g, x + xx, y + yy, 1, 1, q > 0.95 ? cs[2] : cs[3]); } };
      ringPx(false); eiBall(g, x, y, r, cs); ringPx(true);
    });
    const f = (t * 0.12) % 1.4, rx = (f - 0.2) * W, ry = H * 0.45 - f * H * 0.4, fl = Math.floor(t * 18) % 2;
    eiSprite(g, ['..r..', '.rrr.', '.www.', '.wsw.', '.www.', 'rwwwr', 'r.o.r', '..' + (fl ? 'y' : 'o') + '..', fl ? '..y..' : '.....'], rx - 5, ry - 9, { r: '#e04a4a', w: '#fff', s: '#5fa8e8', o: '#ffb43a', y: '#fff6b0' }, 2);
    const sh = (t * 0.5) % 1; if (sh < 0.3) { const k = sh / 0.3; g.globalAlpha = 1 - k; eiLine(g, W * (0.8 - k * 0.5), H * (0.05 + k * 0.4), W * (0.8 - k * 0.5 + 0.12), H * (0.05 + k * 0.4 - 0.08), '#fff', 1); g.globalAlpha = 1; }
  },
  // 7 Неон — сітка синтвейву, смугасте сонце, лазери й неонова рамка
  (g, W, H, t) => {
    const hy = Math.round(H * 0.6), cx = W / 2, R0 = Math.round(H * 0.33), SUN = ['#ffe36a', '#ffc04a', '#ff9a5a', '#ff6a7a', '#ff2fb0'];
    for (let y = hy - R0; y < hy; y++) { const k = (y - (hy - R0)) / R0, gap = k > 0.45 && ((hy - y) % 6) < 1 + Math.floor((k - 0.45) * 6); if (gap) continue; const hw = Math.round(Math.sqrt(Math.max(0, R0 * R0 - (hy - y) * (hy - y)))); eiR(g, cx - hw, y, hw * 2, 1, SUN[Math.min(4, Math.floor(k * 5))]); }
    eiR(g, 0, hy, W, H - hy, '#12002a');
    const glowLine = (x0, y0, x1, y1, c) => { g.globalAlpha = 0.3; eiLine(g, x0, y0, x1, y1, c, 3); g.globalAlpha = 1; eiLine(g, x0, y0, x1, y1, c, 1); };
    for (let i = -14; i <= 14; i++) glowLine(cx + i * 2, hy, cx + i * W * 0.14, H, '#ff2fb0');
    for (let i = 0; i < 9; i++) { const f = ((i + t * 1.2) % 9) / 9, y = Math.round(hy + f * f * (H - hy)); g.globalAlpha = 0.3; eiR(g, 0, y - 1, W, 3, '#ff2fb0'); g.globalAlpha = 1; eiR(g, 0, y, W, 1, '#ff2fb0'); }
    eiR(g, 0, hy, W, 1, '#ff8ad8');
    [['#2ff5ff', 0], ['#ff2fb0', W]].forEach(([c, x0], j) => { for (let i = 0; i < 3; i++) { const an = (j ? Math.PI : 0) + (j ? -1 : 1) * (0.2 + 0.2 * i + Math.sin(t * 1.5 + i + j) * 0.12); g.globalAlpha = 0.45; eiLine(g, x0, H * 0.05, x0 + Math.cos(an) * W, H * 0.05 + Math.sin(an) * W, c, 1); } });
    const fa = 0.6 + 0.3 * Math.sin(t * 9) * (Math.floor(t * 3) % 5 === 0 ? 1 : 0.2), fr = (x, y, w, h) => { g.globalAlpha = fa * 0.35; eiR(g, x - 1, y - 1, w + 2, h + 2, '#2ff5ff'); g.globalAlpha = fa; eiR(g, x, y, w, h, '#2ff5ff'); };
    fr(2, 2, W - 4, 1); fr(2, H - 3, W - 4, 1); fr(2, 2, 1, H - 4); fr(W - 3, 2, 1, H - 4); g.globalAlpha = 1;
  }
];
function eiLoop() {
  if (!epochIntro.active) { eiRaf = 0; return; }
  const cv = ui.eiFx, g = cv.getContext('2d'), t = (performance.now() - eiT0) / 1000, i = epochIntro.idx || 0;
  if (cv._ep !== i || cv._w !== window.innerWidth || cv._h !== window.innerHeight) { cv._ep = i; cv._w = window.innerWidth; cv._h = window.innerHeight; cv.width = 240; cv.height = Math.max(120, Math.round(240 * window.innerHeight / Math.max(1, window.innerWidth))); }
  eiCrisp(g); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false; g.lineWidth = 1; g.shadowBlur = 0;
  try { (EI_DRAW[i] || EI_DRAW[0])(g, cv.width, cv.height, t); } catch (e) { /* заставка не має ламати гру */ }
  eiRaf = requestAnimationFrame(eiLoop);
}
function finishEpochIntro() {
  epochIntro.timers.forEach(clearTimeout); epochIntro.timers = [];
  if (eiRaf) { cancelAnimationFrame(eiRaf); eiRaf = 0; }
  ui.epochIntro.hidden = true; ui.epochIntro.classList.remove('out');
  epochIntro.active = false;
  const cb = epochIntro.done; epochIntro.done = null;
  if (cb) cb();
  if (state.epoch > 0) setTimeout(() => showToast(t('routeToast', fmt(shardThreshold())), 'big'), 900);       // нагадування, що робити далі
}
// Показує анімацію приходу епохи №epochNo (0 — Відродження); done — що зробити після неї
function playEpochIntro(epochNo, done) {
  if (epochIntro.active) return;
  epochIntro.active = true; epochIntro.done = done || null; epochIntro.startedAt = performance.now();
  state.epochIntroSeen = epochNo; saveGame();
  const i = curEpoch(), ep = EPOCHS[i], box = ui.epochIntro;
  box.dataset.ep = i; epochIntro.idx = i; eiT0 = performance.now(); if (eiRaf) cancelAnimationFrame(eiRaf); eiRaf = requestAnimationFrame(eiLoop);
  box.style.setProperty('--ei1', PALETTE[ep.sky[0]]); box.style.setProperty('--ei2', PALETTE[ep.sky[1]]); box.style.setProperty('--ei3', PALETTE[ep.sky[2]]);
  drawEpochEmblem(ui.eiEmblem.getContext('2d'), i);
  ui.eiNum.textContent = t('epochLabel', EPOCH_ROMAN[i]);
  ui.eiTitle.textContent = '';
  ui.eiSub.textContent = t('epochSub_' + i);
  ui.eiSparks.innerHTML = '';
  for (let k = 0; k < 30; k++) {                       // іскорки, що злітають угору
    const sp = document.createElement('i');
    sp.className = 'ei-spark';
    sp.style.left = (Math.random() * 100) + '%';
    sp.style.background = PALETTE[['w', 'y', 'f', 'T', 'h'][k % 5]];
    sp.style.animationDuration = (3 + Math.random() * 3) + 's';
    sp.style.animationDelay = (Math.random() * 4) + 's';
    ui.eiSparks.appendChild(sp);
  }
  box.hidden = false; box.classList.remove('out');
  playSfx('levelup');
  const full = t('epochTitle_' + i);
  for (let k = 1; k <= full.length; k++) epochIntro.timers.push(setTimeout(() => { ui.eiTitle.textContent = full.slice(0, k); if (k % 3 === 0) playSfx('pip'); }, 1900 + k * 65));
  epochIntro.timers.push(setTimeout(() => box.classList.add('out'), 6200));
  epochIntro.timers.push(setTimeout(finishEpochIntro, 6900));
}

/* ---------- Кристали і подорож ---------- */
// Осколки за подорож: 4 + 2,5·lg(зароблено за забіг / X), плюс бонус майстерні (мало, щоб не купити все одразу)
// Осколки за подорож: основа росте повільно (2…8), а понад неї додаються бонуси за те, наскільки далеко ти зайшла в епосі (до +5).
// Поріг подорожі теж росте з кожною подорожжю ×2,5, тож кожна наступна епоха довша за попередню.
function tripsDone() { return (state.stats && state.stats.timeTravels) || 0; }
function shardThreshold(n) { n = n === undefined ? tripsDone() : n; return CONFIG.CRYSTAL_DIVISOR * Math.pow(4, Math.min(n, 8)); }
function shardBase(n) { return 3 + Math.min(n, 6); }
function prestigeGain() {
  const run = Math.max(0, state.totalEarned - state.runStartEarned), n = tripsDone(), th = shardThreshold(n);
  if (run < th) return 0;
  const perf = Math.min(5, Math.floor(Math.log10(run / th) * 1.5));
  return Math.max(1, Math.floor((shardBase(n) + perf) * (1 + 0.1 * wsLevel('crystalGain'))));
}
function startLevel() { return 1; }                                                      // «Швидкий старт» прибрано: кожна подорож починається з крамнички

function askTimeTravel() {
  const gain = prestigeGain();
  if (!state.story.finale || gain < 1) return;
  askConfirm(t('warpConfirmTitle'), t('warpConfirmText', gain, eraStep((state.stats && state.stats.timeTravels) || 0)), t('warpConfirmYes'), travelWithThanks);
}
function startWarp(view, demo) {
  if (warp) return;
  const cv = ui.warpCanvas, W = 200, H = Math.max(80, Math.round(W * window.innerHeight / Math.max(1, window.innerWidth)));
  cv.width = W; cv.height = H;
  const snap = document.createElement('canvas'); snap.width = W; snap.height = H;
  const sg = snap.getContext('2d'); sg.imageSmoothingEnabled = false; sg.drawImage(ui.view, 0, 0, W, H);     // знімок сцени «до»: вона закручується у вир
  const target = view === undefined ? nextEpochId(curEpoch()) : (view % EPOCHS.length);
  const [fx, fy] = clockFaceFrac();
  clockFx.chime = 1; clockFx.rings.push({ t: 0 }, { t: -0.3 }); playSfx('clockBong');
  warp = { demo: !!demo, fromEpoch: viewEpoch() % EPOCHS.length, toEpoch: target, t: 0, applied: false, fx, fy, W, H, snap, view, dur: (view === undefined || demo) ? CONFIG.WARP_SECONDS : 3, icons: EPOCH_GOODS_ICONS[target].slice() };       // у вирі летять товари тієї епохи, куди ми потрапляємо
  ui.timeWarp.classList.remove('out'); ui.timeWarp.hidden = false;
  playSfx('warp', warp.dur, target);
}
// Роки епох для анімації «Перемотка»
const EPOCH_YEARS = [1490, 1957, 1977, 1986, 2001, 2025, 2160, 2099, 1868];
function warpSeed(i) { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); }
function warpCog(g, x, y, r, teeth, rot, c1, c2, a) {          // шестерня: зубці, тіло, отвір
  g.globalAlpha = a; g.fillStyle = c1;
  for (let i = 0; i < teeth; i++) { const an = rot + i / teeth * Math.PI * 2; g.save(); g.translate(x + Math.cos(an) * (r + 1), y + Math.sin(an) * (r + 1)); g.rotate(an); g.fillRect(-1, -r * 0.16, r * 0.3, r * 0.32); g.restore(); }
  g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = c2; g.beginPath(); g.arc(x, y, r * 0.56, 0, 7); g.fill(); g.fillStyle = c1; g.beginPath(); g.arc(x, y, r * 0.2, 0, 7); g.fill(); g.globalAlpha = 1;
}
function warpSetup() {
  const cv = ui.warpCanvas, g = cv.getContext('2d'), W = warp.W, H = warp.H;
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
  return { g, W, H, sc: W / 160, diag: Math.hypot(W, H), seg: (k, a, b) => Math.max(0, Math.min(1, (k - a) / (b - a))), ez: x => x * x * (3 - 2 * x) };
}
function warpReveal(g, cx, cy, r, sc, k3) {                     // «дірка» у покритті, крізь яку видно нову епоху; золоте кільце по краю
  g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.restore();
  g.strokeStyle = '#ffe08a'; g.lineWidth = 3 * sc * (1 - k3); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
}
const NEON_RINGS = ['#ff8a1a', '#3af0d0', '#b6ff2a', '#ff3a2a'];
// Неон: тунель із неонових кілець (у цій епохи кольори сяють)
// Варіант 2 «Тунель»: знімок сцени засмоктує у тунель з кілець кольорів усіх епох, Капі летить крізь нього, наприкінці спалах світла
function drawWarpTunnel(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
  const ks = seg(k, 0, 0.4), kt = seg(k, 0.08, 0.7), kl = seg(k, 0.6, 0.8), kr = seg(k, 0.76, 1);
  const neon = (warp.toEpoch | 0) === 7; g.fillStyle = neon ? '#03141a' : '#0d0720'; g.fillRect(0, 0, W, H);
  const N = 20, spd = k * 11, big = Math.max(W, H) * 1.7;
  for (let j = 0; j < N; j++) {                                                    // кільця тунелю в перспективі: далекі малі, близькі великі
    const z = ((j + spd) % N) / N, size = Math.pow(z, 2.4) * big + 3, ei = (j + Math.floor((j + spd) / N) * 3) % EPOCHS.length, sky = EPOCHS[ei].sky;
    g.save(); g.translate(cx, cy); g.rotate(k * 2.2 + z * 1.1 * (j % 2 ? 1 : -1)); g.globalAlpha = Math.min(1, z * 3) * Math.min(1, kt * 2) * 0.95;
    g.lineWidth = Math.max(1, (1 + z * 7) * sc * 0.6); g.strokeStyle = neon ? NEON_RINGS[j % 4] : PALETTE[sky[j % 3]]; if (neon) { g.shadowColor = g.strokeStyle; g.shadowBlur = 6 * sc; } g.strokeRect(-size / 2, -size / 2, size, size); g.shadowBlur = 0;
    g.lineWidth = Math.max(1, g.lineWidth * 0.35); g.strokeStyle = '#fff'; g.strokeRect(-size / 2 + g.lineWidth * 2, -size / 2 + g.lineWidth * 2, size - g.lineWidth * 4, size - g.lineWidth * 4);
    g.restore();
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 46; i++) {                                                   // лінії швидкості від центру
    const an = warpSeed(i) * Math.PI * 2, f = (spd * 0.5 + warpSeed(i + 7)) % 1, r0 = f * f * diag * 0.6 + 4, len = 3 + f * diag * 0.25 * kt;
    g.globalAlpha = Math.min(1, f * 2) * kt; g.strokeStyle = i % 3 ? '#ffe08a' : '#fff'; g.lineWidth = Math.max(1, sc * (0.5 + f)); g.beginPath(); g.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); g.lineTo(cx + Math.cos(an) * (r0 + len), cy + Math.sin(an) * (r0 + len)); g.stroke();
  }
  g.globalAlpha = 1;
  if (ks < 1) {                                                                     // знімок сцени закручується й зменшується до точки
    const sz = 1 - ez(ks), a = Math.min(1, 1.2 - ks * 0.4);
    g.save(); g.translate(cx, cy); g.rotate(ez(ks) * 4.2); g.scale(sz, sz); g.globalAlpha = a; g.drawImage(warp.snap, -W / 2, -H / 2);
    g.strokeStyle = '#ffe08a'; g.lineWidth = 2 * sc / Math.max(0.15, sz); g.strokeRect(-W / 2, -H / 2, W, H); g.restore(); g.globalAlpha = 1;
  }
  const cs = getSpriteCanvas(capySprite());                                         // Капі летить тунелем
  const cap = Math.min(1, seg(k, 0.12, 0.3) * (1 - seg(k, 0.66, 0.76))), cw = cs.width * sc * 1.5, chh = cs.height * sc * 1.5;
  if (cap > 0) { g.save(); g.translate(cx, cy + Math.sin(k * 30) * sc * 1.5); g.rotate(Math.sin(k * 9) * 0.25 + k * 1.2); g.globalAlpha = cap; g.drawImage(cs, -cw / 2, -chh / 2, cw, chh); g.restore(); g.globalAlpha = 1; }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  warp.icons.forEach((ic, i) => {                                                  // значки нової епохи летять уздовж стін
    const f = (kt * 2.1 + i / warp.icons.length) % 1, an = i * 2.4 + k * 2, r = Math.pow(f, 1.6) * diag * 0.7;
    g.globalAlpha = Math.sin(f * Math.PI) * kt; g.font = Math.round((5 + f * 20) * sc) + 'px sans-serif'; g.fillText(ic, cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.75);
  });
  g.globalAlpha = 1;
  if (kl > 0) { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, ez(kl) * diag * 0.8 + 1); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,224,138,.85)'); gr.addColorStop(1, 'rgba(255,224,138,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }   // світло в кінці тунелю
  if (kr > 0) { g.fillStyle = '#fff'; g.globalAlpha = 1 - kr; g.fillRect(0, 0, W, H); g.globalAlpha = 1; warpReveal(g, cx, cy, ez(kr) * diag * 1.05, sc, kr); }
}
// Варіант 3 «Перемотка»: відеокасета перемотується назад: збої, смуги, шум, роки, а потім картинка розсипається пікселями
function drawWarpRewind(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup();
  const kg = seg(k, 0, 0.45), kn = seg(k, 0.4, 0.5), kbar = seg(k, 0.5, 0.74), kr = seg(k, 0.74, 1), from = EPOCH_YEARS[(warp.fromEpoch || 0) % EPOCHS.length], to = EPOCH_YEARS[(warp.toEpoch || 0) % EPOCHS.length];
  const bh = Math.max(3, Math.round(5 * sc * 0.6));
  if (k < 0.5) {
    for (let y = 0; y < H; y += bh) {                                               // горизонтальні смуги зсуваються, як на зіпсованій плівці
      const off = Math.round(Math.sin(y * 0.37 + k * 70) * kg * 14 * (warpSeed(Math.floor(y / bh) + Math.floor(k * 14)) > 0.55 ? 1.4 : 0.15));
      g.drawImage(warp.snap, 0, y, W, bh, off, y, W, bh);
    }
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.28 * kg;                // розбіжність кольорів
    g.drawImage(warp.snap, 2 + kg * 3, 0); g.drawImage(warp.snap, -2 - kg * 3, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.globalAlpha = kg * 0.45; g.fillStyle = '#1a0f33'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  } else { g.fillStyle = '#05030c'; g.fillRect(0, 0, W, H); }
  if (kbar > 0 || kn > 0) {                                                         // кольорові смуги настройки й шум
    const bars = ['#fff4dc', '#ffe08a', '#86cfe8', '#8ed4a6', '#ef8fa3', '#c4553d', '#3d5a8c', '#2a1d1a'], bw = W / bars.length, a = Math.max(kn * 0.6, kbar > 0 ? 1 : 0);
    g.globalAlpha = a * (0.55 + 0.45 * warpSeed(Math.floor(k * 30))); bars.forEach((c, i) => { g.fillStyle = c; g.fillRect(Math.round(i * bw), 0, Math.ceil(bw), H); });
    g.globalAlpha = 1; g.fillStyle = '#05030c'; g.globalAlpha = 0.35 * a; for (let y = Math.floor(warpSeed(Math.floor(k * 40)) * 6); y < H; y += 6) g.fillRect(0, y, W, 2); g.globalAlpha = 1;
  }
  for (let i = 0; i < 160 * (kg * 0.5 + kn + kbar); i++) { const v = warpSeed(i * 3 + Math.floor(k * 60)); g.fillStyle = v > 0.5 ? '#fff' : '#889'; g.globalAlpha = 0.5; g.fillRect(Math.round(warpSeed(i + 11 + Math.floor(k * 60)) * W), Math.round(warpSeed(i + 51 + Math.floor(k * 60)) * H), Math.round(2 + v * 6 * sc * 0.5), Math.max(1, Math.round(sc * 0.5))); }
  g.globalAlpha = 1;
  g.fillStyle = '#05030c'; g.globalAlpha = 0.2; for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1); g.globalAlpha = 1;      // рядки екрана
  const ry = (k * H * 3.2) % (H + 20) - 10; g.fillStyle = '#fff'; g.globalAlpha = 0.1; g.fillRect(0, ry, W, 8 * sc * 0.6); g.globalAlpha = 1;   // смуга, що біжить
  const fs = Math.max(7, Math.round(8 * sc)); g.font = fs + 'px "Press Start 2P", monospace'; g.textBaseline = 'top';
  const blink = Math.floor(k * 10) % 2;
  g.textAlign = 'left'; g.fillStyle = '#000'; g.fillText('◀◀ REW', 7 * sc * 0.6 + 1, 7 * sc * 0.6 + 1); g.fillStyle = blink ? '#fff' : '#ff5fa2'; g.fillText('◀◀ REW', 7 * sc * 0.6, 7 * sc * 0.6);
  const year = Math.round(from + (to - from) * ez(Math.min(1, k / 0.74)));
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = Math.round(fs * 2.1) + 'px "Press Start 2P", monospace';
  const ya = Math.min(1, seg(k, 0.1, 0.25)) * (1 - seg(k, 0.7, 0.76));
  if (ya > 0) { g.globalAlpha = ya; g.fillStyle = '#000'; g.fillText(String(year), W / 2 + 2, H / 2 + 2); g.fillStyle = '#ffe08a'; g.fillText(String(year), W / 2, H / 2); g.globalAlpha = 1; }
  if (kr > 0) {                                                                    // картинка проступає пікселями (блоки зникають у випадковому порядку)
    const B = Math.max(4, Math.round(10 * sc * 0.6)), cols = Math.ceil(W / B), rows = Math.ceil(H / B), e = ez(kr);
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let yy = 0; yy < rows; yy++) for (let xx = 0; xx < cols; xx++) if (warpSeed(yy * cols + xx) < e * 1.04) g.fillRect(xx * B, yy * B, B, B);
    g.restore();
  }
}
