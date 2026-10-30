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
// Емблема епохи 32×32 пікселі
function drawEpochEmblem(g, i) {
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
function eiFont(g, px) { g.font = Math.max(5, Math.round(px)) + 'px "Press Start 2P", monospace'; }
function eiRand(i, k) { return warpSeed(i * 7 + (k || 0)); }
const EI_DRAW = [
  // 0 Відродження — давня Греція: колони підіймаються, оливкові гілки гойдаються, золотий пил і промені світла
  (g, W, H, t) => {
    const e = Math.min(1, t / 1.8), ez = e * e * (3 - 2 * e), sc = W / 160;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const an = Math.PI / 2 + (i - 4) * 0.22 + Math.sin(t * 0.4 + i) * 0.03; g.globalAlpha = 0.10; g.fillStyle = '#ffe9a0'; g.beginPath(); g.moveTo(W / 2, -H * 0.1); g.lineTo(W / 2 + Math.cos(an - 0.05) * W * 1.4, -H * 0.1 + Math.sin(an - 0.05) * W * 1.4); g.lineTo(W / 2 + Math.cos(an + 0.05) * W * 1.4, -H * 0.1 + Math.sin(an + 0.05) * W * 1.4); g.closePath(); g.fill(); }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const col = (x, w2, a) => { const top = H * 0.1 + (1 - ez) * H, bot = H * 0.9 + (1 - ez) * H; g.globalAlpha = a; g.fillStyle = '#f4efe4'; g.fillRect(x - w2 / 2, top, w2, bot - top); g.fillStyle = '#d6ccb4'; g.fillRect(x + w2 * 0.2, top, w2 * 0.3, bot - top); g.strokeStyle = '#cfc4a8'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * w2 * 0.2, top + 4); g.lineTo(x + i * w2 * 0.2, bot - 3); g.stroke(); } g.fillStyle = '#e9e1d0'; g.fillRect(x - w2 * 0.7, top - 3, w2 * 1.4, 4); g.fillRect(x - w2 * 0.7, bot - 1, w2 * 1.4, 4); g.globalAlpha = 1; };
    col(W * 0.07, W * 0.075, 1); col(W * 0.93, W * 0.075, 1); col(W * 0.2, W * 0.045, 0.6); col(W * 0.8, W * 0.045, 0.6);
    g.fillStyle = '#f2ead6'; g.fillRect(0, H * 0.1 - 7 + (1 - ez) * -H * 0.3, W, 7); warpMeander(g, H * 0.1 - 6 - (1 - ez) * H * 0.3, 5, W, sc, t * 30, '#c19a2e', 1);
    g.fillStyle = '#d9c9a0'; g.fillRect(0, H * 0.9 + 1 + (1 - ez) * H, W, H); warpMeander(g, H * 0.9 + 2 + (1 - ez) * H, 5, W, sc, -t * 30, '#c19a2e', 1);
    warpOliveBranch(g, W * 0.12, H * 0.1, 1, Math.min(0.6, t / 2.2), sc, 1, t * 1.3); warpOliveBranch(g, W * 0.88, H * 0.1, -1, Math.min(0.6, t / 2.2), sc, 1, t * 1.3 + 2);
    for (let i = 0; i < 26; i++) { const x = ((eiRand(i) + t * 0.02 * (1 + eiRand(i, 3))) % 1) * W, y = ((eiRand(i, 5) + t * 0.05) % 1) * H; g.globalAlpha = 0.7 * Math.sin(t * 2 + i); g.fillStyle = '#ffe9a0'; if (g.globalAlpha > 0) g.fillRect(x, y, 2, 2); }
    g.globalAlpha = 1;
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
  // 2 Диско — промені прожекторів, танцпол із плитками під ритм, дзеркальні кулі
  (g, W, H, t) => {
    const cols = ['#ff4fa8', '#4fd8ff', '#ffd84f', '#8f5fff'], beat = Math.floor(t * 6), sc = W / 160;
    const fy = H * 0.7, T = Math.max(10, 14 * sc * 0.6);
    for (let r = 0; r < Math.ceil((H - fy) / T); r++) for (let c = 0; c < Math.ceil(W / T); c++) { g.globalAlpha = 0.45 + 0.3 * ((r + c + beat) % 2); g.fillStyle = cols[(r * 3 + c * 2 + beat) % 4]; g.fillRect(c * T, fy + r * T, T - 1, T - 1); }
    g.globalCompositeOperation = 'lighter';
    [[0.1, 0], [0.5, 0], [0.9, 0]].forEach(([px, py], j) => { for (let i = 0; i < 3; i++) { const an = Math.PI / 2 + Math.sin(t * 1.3 + j * 2 + i) * 0.8 + (i - 1) * 0.35; g.globalAlpha = 0.17; g.fillStyle = cols[(i + j) % 4]; g.beginPath(); g.moveTo(W * px, 0); g.lineTo(W * px + Math.cos(an - 0.09) * W, Math.sin(an - 0.09) * W); g.lineTo(W * px + Math.cos(an + 0.09) * W, Math.sin(an + 0.09) * W); g.closePath(); g.fill(); } });
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    [[0.1, 0.16], [0.9, 0.2]].forEach(([bx, by]) => { const R0 = Math.min(W, H) * 0.09 * (1 + 0.04 * Math.sin(t * 6)); g.strokeStyle = '#d8d8f0'; g.beginPath(); g.moveTo(W * bx, 0); g.lineTo(W * bx, H * by - R0); g.stroke(); const gr = g.createRadialGradient(W * bx - R0 * 0.3, H * by - R0 * 0.3, R0 * 0.1, W * bx, H * by, R0); gr.addColorStop(0, '#fff'); gr.addColorStop(0.5, '#b8b8d8'); gr.addColorStop(1, '#5a5a86'); g.fillStyle = gr; g.beginPath(); g.arc(W * bx, H * by, R0, 0, 7); g.fill(); for (let i = 0; i < 22; i++) { const a = eiRand(i) * 6.28, rr = Math.sqrt(eiRand(i + 5)) * R0 * 0.9; g.fillStyle = eiRand(i + beat) > 0.5 ? cols[i % 4] : '#fff'; g.fillRect(W * bx + Math.cos(a) * rr - 1, H * by + Math.sin(a) * rr - 1, 2, 2); } });
    for (let i = 0; i < 24; i++) { if ((Math.floor(t * 5) + i) % 5 > 1) continue; const x = eiRand(i + 40) * W, y = eiRand(i + 70) * H * 0.7, s = (1.5 + eiRand(i) * 2.5) * sc * 0.6; g.fillStyle = '#fff'; g.fillRect(x - s, y - 0.5, s * 2, 1); g.fillRect(x - 0.5, y - s, 1, s * 2); }
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
  // 4 Інтернет — цифровий дощ у вікні браузера, смуга завантаження
  (g, W, H, t) => {
    const sc = W / 160, cw = Math.max(5, 6 * sc * 0.7);
    eiFont(g, cw * 1.1); g.textAlign = 'center'; g.textBaseline = 'top';
    for (let c = 0; c < Math.ceil(W / cw); c++) { const sp = 0.4 + eiRand(c) * 0.9, head = ((eiRand(c + 7) + t * sp * 0.4) % 1.4) * H * 1.3 - H * 0.1; for (let j = 0; j < 9; j++) { const y = head - j * cw * 1.2; if (y < -cw || y > H) continue; g.globalAlpha = (1 - j / 9) * 0.55; g.fillStyle = j === 0 ? '#e6fff4' : '#2ee69a'; g.fillText(eiRand(c * 13 + j + Math.floor(t * 8)) > 0.5 ? '1' : '0', c * cw + cw / 2, y); } }
    g.globalAlpha = 1;
    const m = 5 * sc * 0.6, tb = 10 * sc * 0.7;
    g.fillStyle = '#1b2a44'; g.fillRect(m - 1, m - 1, W - 2 * m + 2, H - 2 * m + 2); g.fillStyle = 'rgba(4,20,26,.55)'; g.fillRect(m, m + tb, W - 2 * m, H - 2 * m - tb);
    g.fillStyle = '#2a55d8'; g.fillRect(m, m, W - 2 * m, tb); [0, 1, 2].forEach(i => { g.fillStyle = ['#ef8fa3', '#ffe08a', '#8ed4a6'][i]; g.fillRect(W - m - (3 - i) * (tb * 0.8), m + tb * 0.25, tb * 0.5, tb * 0.5); });
    eiFont(g, 5 * sc * 0.8); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText('www.capytap.net', m + 4, m + tb / 2);
    const pr = Math.min(1, t / 3.4), bw = W * 0.6, bx = W / 2 - bw / 2, by = H - m - tb * 1.6; g.fillStyle = '#04141a'; g.fillRect(bx - 1, by - 1, bw + 2, tb * 0.7 + 2); g.fillStyle = '#2ee69a'; const sg = Math.max(3, tb * 0.35); for (let x = 0; x < bw * pr - sg; x += sg * 1.3) g.fillRect(bx + x, by + 1, sg, tb * 0.7 - 2);
    g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillStyle = '#e6fff4'; g.fillText(pr < 1 ? 'LOADING ' + Math.floor(pr * 100) + '%' : 'DONE', W / 2, by - 3);
  },
  // 5 Еко — листя в повітрі, ліани з квітами, сонячні промені й метелики
  (g, W, H, t) => {
    const sc = W / 160, leaf = ['#2f8f4a', '#5fbf5a', '#9fd45a', '#e8b44a', '#e87a4a', '#ff9fc0'];
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { g.globalAlpha = 0.11; g.fillStyle = '#fff6c8'; g.beginPath(); g.moveTo(W * (0.7 + i * 0.04), -4); g.lineTo(W * (0.7 + i * 0.04) - W * 0.5 - i * 6, H); g.lineTo(W * (0.7 + i * 0.04) - W * 0.5 + 10, H); g.closePath(); g.fill(); } g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const kv = Math.min(1, t / 2.6);
    [[0, H, 1], [W, H, -1]].forEach(([x0, y0, d], vi) => { const N = 40, last = Math.floor(N * kv); g.strokeStyle = '#2f7a42'; g.lineWidth = Math.max(1.5, sc); g.beginPath(); for (let i = 0; i <= last; i++) { const t2 = i / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.06 + t2 * W * 0.3), y = y0 - t2 * H * 0.92; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); for (let i = 3; i <= last; i += 3) { const t2 = i / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.06 + t2 * W * 0.3), y = y0 - t2 * H * 0.92; g.fillStyle = leaf[i % 3]; g.beginPath(); g.ellipse(x + d * 3 * sc, y, 3.2 * sc, 1.7 * sc, d * 0.5, 0, 7); g.fill(); } if (kv > 0.85) { const t2 = last / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.06 + t2 * W * 0.3), y = y0 - t2 * H * 0.92; for (let p = 0; p < 6; p++) { g.fillStyle = '#ff9fc0'; g.beginPath(); g.arc(x + Math.cos(p * 1.047) * 3 * sc, y + Math.sin(p * 1.047) * 3 * sc, 2 * sc, 0, 7); g.fill(); } g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(x, y, 1.8 * sc, 0, 7); g.fill(); } });
    for (let i = 0; i < 40; i++) { const x = ((eiRand(i) + Math.sin(t * 0.7 + i) * 0.04) % 1) * W, y = ((eiRand(i + 9) + t * (0.04 + eiRand(i + 3) * 0.05)) % 1.1) * H - 8, s = (2 + eiRand(i + 5) * 3) * sc * 0.7; g.save(); g.translate(x, y); g.rotate(t * 1.2 + i); g.fillStyle = leaf[i % 6]; g.beginPath(); g.ellipse(0, 0, s, s * 0.5, 0, 0, 7); g.fill(); g.restore(); }
    for (let i = 0; i < 3; i++) { const bx = (0.2 + 0.3 * i + Math.sin(t * 0.6 + i) * 0.08) * W, by = (0.3 + 0.1 * i + Math.cos(t * 0.8 + i) * 0.06) * H, fl = Math.abs(Math.sin(t * 9 + i)); g.fillStyle = ['#ffd84f', '#ff9fc0', '#9fd4ff'][i]; g.fillRect(bx - 3 * sc * fl, by - 2, 3 * sc * fl, 4); g.fillRect(bx, by - 2, 3 * sc * fl, 4); g.fillStyle = '#4a3228'; g.fillRect(bx - 0.5, by - 2, 1, 4); }
  },
  // 6 Космос — зорі летять із центру, планети з кільцями, ракета, зорепад
  (g, W, H, t) => {
    const sc = W / 160, cx = W / 2, cy = H / 2, diag = Math.hypot(W, H);
    g.globalAlpha = 0.5; const nb = g.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.5); nb.addColorStop(0, 'rgba(154,85,232,.45)'); nb.addColorStop(1, 'rgba(154,85,232,0)'); g.fillStyle = nb; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    g.lineCap = 'round'; for (let i = 0; i < 110; i++) { const an = eiRand(i) * 6.28, f = (eiRand(i + 9) + t * 0.18) % 1, r0 = f * f * diag * 0.6 + 2, len = 1 + f * f * diag * 0.12; g.globalAlpha = Math.min(1, f * 2.5); g.strokeStyle = i % 5 === 0 ? '#9fc8ff' : '#fff'; g.lineWidth = Math.max(1, sc * (0.3 + f * 0.7)); g.beginPath(); g.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); g.lineTo(cx + Math.cos(an) * (r0 + len), cy + Math.sin(an) * (r0 + len)); g.stroke(); }
    g.globalAlpha = 1;
    [[0.12, 0.2, 0.09, '#e8794a', '#f2b48a', 0], [0.9, 0.78, 0.13, '#5fa8e8', '#bfe0ff', 1], [0.82, 0.14, 0.05, '#b46ae8', '#e6c4ff', 0]].forEach(([px, py, pr, c1, c2, ring], i) => { const rad = Math.min(W, H) * pr, x = W * px + Math.sin(t * 0.3 + i) * 3, y = H * py; const gr = g.createRadialGradient(x - rad * 0.35, y - rad * 0.35, rad * 0.1, x, y, rad); gr.addColorStop(0, c2); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); if (ring) { g.strokeStyle = c2; g.lineWidth = Math.max(1, rad * 0.14); g.beginPath(); g.ellipse(x, y, rad * 1.7, rad * 0.45, -0.4, 0, 7); g.stroke(); } });
    const rx = ((t * 0.12) % 1.4 - 0.2) * W, ry = H * 0.45 - ((t * 0.12) % 1.4) * H * 0.4; g.save(); g.translate(rx, ry); g.rotate(-0.5); g.fillStyle = '#fff'; g.fillRect(-2 * sc, -5 * sc, 4 * sc, 10 * sc); g.fillStyle = '#e04a4a'; g.fillRect(-1 * sc, -7 * sc, 2 * sc, 2 * sc); g.fillRect(-4 * sc, 2 * sc, 2 * sc, 4 * sc); g.fillRect(2 * sc, 2 * sc, 2 * sc, 4 * sc); g.fillStyle = Math.floor(t * 18) % 2 ? '#ffb43a' : '#fff6b0'; g.fillRect(-1.5 * sc, 5 * sc, 3 * sc, 5 * sc + Math.sin(t * 40) * sc); g.restore();
    const sh = (t * 0.5) % 1; if (sh < 0.3) { const k = sh / 0.3; g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, sc * 0.6); g.globalAlpha = 1 - k; g.beginPath(); g.moveTo(W * (0.8 - k * 0.5), H * (0.05 + k * 0.4)); g.lineTo(W * (0.8 - k * 0.5 + 0.12), H * (0.05 + k * 0.4 - 0.08)); g.stroke(); g.globalAlpha = 1; }
  },
  // 7 Неон — сітка синтвейву, смугасте сонце, лазери й неонова рамка
  (g, W, H, t) => {
    const sc = W / 160, hy = H * 0.6, cx = W / 2;
    const sun = g.createLinearGradient(0, hy - H * 0.35, 0, hy); sun.addColorStop(0, '#ffe36a'); sun.addColorStop(1, '#ff2fb0'); g.fillStyle = sun; g.beginPath(); g.arc(cx, hy, H * 0.33, Math.PI, 0); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = '#12002a'; g.fillRect(cx - H * 0.34, hy - H * 0.3 * (i / 6) - 2 - i * 0.6 + 2, H * 0.68, 1 + i * 0.7); }
    g.fillStyle = '#12002a'; g.fillRect(0, hy, W, H - hy);
    g.strokeStyle = '#ff2fb0'; g.lineWidth = Math.max(1, sc * 0.5); g.shadowColor = '#ff2fb0'; g.shadowBlur = 5 * sc;
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(cx + i * 2, hy); g.lineTo(cx + i * W * 0.14, H); g.stroke(); }
    for (let i = 0; i < 9; i++) { const f = ((i + t * 1.2) % 9) / 9, y = hy + f * f * (H - hy); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.shadowBlur = 0;
    g.globalCompositeOperation = 'lighter'; [['#2ff5ff', 0], ['#ff2fb0', W]].forEach(([c, x0], j) => { for (let i = 0; i < 3; i++) { const an = (j ? Math.PI : 0) + (j ? -1 : 1) * (0.2 + 0.2 * i + Math.sin(t * 1.5 + i + j) * 0.12); g.globalAlpha = 0.45; g.strokeStyle = c; g.lineWidth = Math.max(1, sc * 0.6); g.beginPath(); g.moveTo(x0, H * 0.05); g.lineTo(x0 + Math.cos(an) * W, H * 0.05 + Math.sin(an) * W); g.stroke(); } });
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.6 + 0.3 * Math.sin(t * 9) * (Math.floor(t * 3) % 5 === 0 ? 1 : 0.2); g.strokeStyle = '#2ff5ff'; g.shadowColor = '#2ff5ff'; g.shadowBlur = 6 * sc; g.lineWidth = Math.max(1.5, sc * 0.8); g.strokeRect(4 * sc * 0.6, 4 * sc * 0.6, W - 8 * sc * 0.6, H - 8 * sc * 0.6); g.shadowBlur = 0; g.globalAlpha = 1;
  }
];
function eiLoop() {
  if (!epochIntro.active) { eiRaf = 0; return; }
  const cv = ui.eiFx, g = cv.getContext('2d'), t = (performance.now() - eiT0) / 1000, i = epochIntro.idx || 0;
  if (cv._ep !== i || cv._w !== window.innerWidth || cv._h !== window.innerHeight) { cv._ep = i; cv._w = window.innerWidth; cv._h = window.innerHeight; cv.width = 240; cv.height = Math.max(120, Math.round(240 * window.innerHeight / Math.max(1, window.innerWidth))); }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false; g.lineWidth = 1; g.shadowBlur = 0;
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
