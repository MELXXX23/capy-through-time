//#part 200_travel_settings.js
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
// Скін Капі залежить від статі гравця: дівчина — квіточка, хлопець — листочки
function capySprite() { const s = skinOn('capy'); return s ? 'capy_' + s : (state.settings.gender === 'm' ? 'capy_m' : 'capy'); }
// Скіни: яку назву скіна вдягнено в групі type ('capy' | 'shop' | 'weather' | 'hero') — 'pirate', 'candy' тощо, або null
const skinPreview = {};          // тимчасово «приміряє» скін на час малювання зразка у вкладці
function skinOn(type) {
  if (skinPreview[type] !== undefined) return skinPreview[type];
  const i = state.skins[type];
  if (type === 'capy' && i === -2) return 'ep' + (viewEpoch() % EPOCHS.length);          // скін епохи: сам змінюється, коли перемикається епоха
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
const DEV_OPEN_ALL = false;     // для перевірки можна тимчасово поставити true: відкриє всі сезони й усі 8 епох
function themesUnlocked() { return DEV_OPEN_ALL || state.epoch >= 2; }
function seasonNow() {
  const s = state.settings.season;
  if (s !== 'auto' && SEASONS.includes(s) && themesUnlocked()) return s;
  const forced = forcedHoliday();
  if (forced === 'halloween') return 'halloween';
  if (forced === 'newyear') return 'winter';
  const d = new Date();
  if (inRange(d, [10, 20], [11, 2])) return 'halloween';
  const m = d.getMonth() + 1;
  return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter';
}
function isDebug() {
  try { return new URLSearchParams(location.search).get('debug') === '1' || window.__debug === true; } catch (e) { return false; }
}
function currentEpoch() { return EPOCHS[viewEpoch() % EPOCHS.length]; }

/* ---------- Епохи: зовнішній вигляд міста ---------- */
function rebuildEpochLayers() {
  document.body.dataset.epoch = String(viewEpoch() % EPOCHS.length);
  refreshCoinIcon();
  skyLayer = buildSkyLayer();
  groundLayer = buildGroundLayer();
  theme.key = null;              // змусити updateTheme перерахувати прикраси
  seedEpochFx();
  updateTheme();
  refreshTeamPortraits();
  drawCapiPortrait();             // скін Капі залежить від епохи
  if (shop) rebuildShop(true);
}
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
const EPOCH_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
// Емблема епохи 32×32 пікселі
function drawEpochEmblem(g, i) {
  g.clearRect(0, 0, 32, 32);
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
  const i = epochNo % EPOCHS.length, ep = EPOCHS[i], box = ui.epochIntro;
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
  const target = (view === undefined ? state.epoch + 1 : view) % EPOCHS.length;
  const [fx, fy] = clockFaceFrac();
  clockFx.chime = 1; clockFx.rings.push({ t: 0 }, { t: -0.3 }); playSfx('clockBong');
  warp = { demo: !!demo, fromEpoch: viewEpoch() % EPOCHS.length, toEpoch: target, t: 0, applied: false, fx, fy, W, H, snap, view, dur: (view === undefined || demo) ? CONFIG.WARP_SECONDS : 3, icons: EPOCH_GOODS_ICONS[target].slice() };       // у вирі летять товари тієї епохи, куди ми потрапляємо
  ui.timeWarp.hidden = false;
  closeWheel();
  playSfx('warp', warp.dur, target);
}
// Роки епох для анімації «Перемотка»
const EPOCH_YEARS = [1490, 1957, 1977, 1986, 2001, 2025, 2160, 2099];
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
const NEON_RINGS = ['#ff2fb0', '#2ff5ff', '#b36bff', '#fff23a'];
// Неон: тунель із неонових кілець (у цій епохи кольори сяють)
// Варіант 2 «Тунель»: знімок сцени засмоктує у тунель з кілець кольорів усіх епох, Капі летить крізь нього, наприкінці спалах світла
function drawWarpTunnel(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
  const ks = seg(k, 0, 0.4), kt = seg(k, 0.08, 0.7), kl = seg(k, 0.6, 0.8), kr = seg(k, 0.76, 1);
  const neon = (warp.toEpoch | 0) === 7; g.fillStyle = neon ? '#070016' : '#0d0720'; g.fillRect(0, 0, W, H);
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
  const kg = seg(k, 0, 0.45), kn = seg(k, 0.4, 0.5), kbar = seg(k, 0.5, 0.74), kr = seg(k, 0.74, 1), from = EPOCH_YEARS[(warp.fromEpoch || 0) % 8], to = EPOCH_YEARS[(warp.toEpoch || 0) % 8];
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
// ===== Анімації подорожі під кожну епоху (за епохою, КУДИ ми потрапляємо) =====
function warpPix(g, snap, W, H, b) {                             // знімок сцени, укрупнений до блоків b×b
  if (!warp.px) warp.px = document.createElement('canvas');
  const pw = Math.max(1, Math.ceil(W / b)), ph = Math.max(1, Math.ceil(H / b));
  warp.px.width = pw; warp.px.height = ph;
  const pg = warp.px.getContext('2d'); pg.imageSmoothingEnabled = false; pg.drawImage(snap, 0, 0, pw, ph);
  g.imageSmoothingEnabled = false; g.drawImage(warp.px, 0, 0, pw, ph, 0, 0, pw * b, ph * b);
}
function warpCapy(g, x, y, s, rot, a) {                           // Капі в центрі подорожі
  const cs = getSpriteCanvas(capySprite()), w = cs.width * s, h = cs.height * s;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.drawImage(cs, -w / 2, -h / 2, w, h); g.restore(); g.globalAlpha = 1;
}
function warpFont(g, px) { g.font = Math.max(6, Math.round(px)) + 'px "Press Start 2P", monospace'; }
function warpText(g, txt, x, y, col, sh) { g.fillStyle = sh || '#000'; g.fillText(txt, x + 1, y + 1); g.fillStyle = col; g.fillText(txt, x, y); }

// Диско: дзеркальна куля, промені, танцпол із плитками, що міняють колір під ритм; нова епоха проступає хвилею плиток
function drawWarpDisco(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2;
  const ka = seg(k, 0, 0.22), kt = seg(k, 0.08, 0.74), kr = seg(k, 0.74, 1), beat = Math.floor(k * 24), cols = ['#ff4fa8', '#4fd8ff', '#ffd84f', '#8f5fff'];
  g.drawImage(warp.snap, 0, 0);
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1a0638'); bg.addColorStop(1, '#4a0f5c');
  g.globalAlpha = ez(ka); g.fillStyle = bg; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  const fy = H * 0.64, T = Math.max(8, 15 * sc * 0.6), nr = Math.ceil((H - fy) / T), nc = Math.ceil(W / T);
  for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) { g.globalAlpha = (0.5 + 0.3 * ((r + c + beat) % 2)) * kt; g.fillStyle = cols[(r * 3 + c * 2 + beat) % 4]; g.fillRect(Math.round(c * T), Math.round(fy + r * T), Math.ceil(T - 1), Math.ceil(T - 1)); }
  const R = Math.min(W, H) * 0.17, by = -R + (H * 0.04 + R + H * 0.18) * ez(seg(k, 0.08, 0.34)) + Math.sin(k * 24) * sc * 0.4;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {                                                     // промені прожекторів гойдаються
    const an = Math.PI / 2 + Math.sin(k * 9 + i * 1.3) * 0.7 + (i - 3) * 0.3, hw = 0.1;
    g.globalAlpha = 0.2 * kt; g.fillStyle = cols[i % 4]; g.beginPath(); g.moveTo(cx, by); g.lineTo(cx + Math.cos(an - hw) * diag * 1.2, by + Math.sin(an - hw) * diag * 1.2); g.lineTo(cx + Math.cos(an + hw) * diag * 1.2, by + Math.sin(an + hw) * diag * 1.2); g.closePath(); g.fill();
  }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = kt;
  g.strokeStyle = '#d8d8f0'; g.lineWidth = Math.max(1, sc * 0.6); g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, by - R); g.stroke();
  const gr = g.createRadialGradient(cx - R * 0.35, by - R * 0.35, R * 0.1, cx, by, R); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#b8b8d8'); gr.addColorStop(1, '#5a5a86');
  g.fillStyle = gr; g.beginPath(); g.arc(cx, by, R, 0, 7); g.fill();
  for (let i = 0; i < 70; i++) {                                                    // дзеркальні квадратики мерехтять
    const a = warpSeed(i) * Math.PI * 2, rr = Math.sqrt(warpSeed(i + 5)) * R * 0.92, on = warpSeed(i + beat * 3) > 0.45;
    g.fillStyle = on ? cols[(i + beat) % 4] : '#ffffff'; g.globalAlpha = kt * (on ? 1 : 0.55); const s2 = Math.max(1.5, R * 0.1); g.fillRect(Math.round(cx + Math.cos(a) * rr - s2 / 2), Math.round(by + Math.sin(a) * rr - s2 / 2), s2, s2);
  }
  g.globalAlpha = kt;
  for (let i = 0; i < 26; i++) {                                                    // блиски-хрестики
    const px = warpSeed(i + 40) * W, py = warpSeed(i + 70) * H * 0.7, on = (Math.floor(k * 18) + i) % 5 < 2; if (!on) continue; const s2 = (1.5 + warpSeed(i) * 2.5) * sc * 0.6;
    g.fillStyle = '#fff'; g.fillRect(px - s2, py - 0.5, s2 * 2, 1); g.fillRect(px - 0.5, py - s2, 1, s2 * 2);
  }
  g.globalAlpha = 1;
  warpCapy(g, cx, H * 0.84 - Math.abs(Math.sin(k * 26)) * 4 * sc, sc * 1.5, Math.sin(k * 13) * 0.22, seg(k, 0.2, 0.34) * (1 - seg(k, 0.68, 0.74)));
  if (kr > 0) {                                                                     // хвиля плиток від центру відкриває нову епоху
    const B = Math.max(7, Math.round(12 * sc * 0.6)), e = ez(kr) * 1.2;
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let y = 0; y < H; y += B) for (let x = 0; x < W; x += B) { const d = Math.hypot(x + B / 2 - cx, y + B / 2 - H / 2) / (diag / 2); if (d < e) g.fillRect(x, y, B - (d > e - 0.12 ? 3 : 0), B - (d > e - 0.12 ? 3 : 0)); }
    g.restore();
  }
}

// Аркади: сцена перетворюється на великі пікселі, марширують прибульці, падає монетка, «LEVEL UP!»; нова епоха розсипається зверху вниз
const WARP_INV = ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'];
function drawWarpArcade(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2;
  const kp = seg(k, 0, 0.3), kt = seg(k, 0.26, 0.74), kr = seg(k, 0.74, 1), n2 = (warp.toEpoch || 0) + 1;
  g.fillStyle = '#04030c'; g.fillRect(0, 0, W, H);
  if (kp < 1) { g.globalAlpha = 1 - ez(Math.max(0, kp - 0.4) / 0.6); warpPix(g, warp.snap, W, H, Math.max(1, Math.round(1 + ez(kp) * 15 * sc * 0.6))); g.globalAlpha = 1; }
  for (let i = 0; i < 40; i++) { g.globalAlpha = 0.3 + 0.5 * warpSeed(i + Math.floor(k * 8)); g.fillStyle = '#fff'; g.fillRect(Math.round(warpSeed(i) * W), Math.round(((warpSeed(i + 9) * H) + k * H * (0.5 + warpSeed(i + 3))) % H), 1, 1); }
  g.globalAlpha = 1;
  const p = Math.max(2, Math.round(2.2 * sc * 0.7)), iw = 11 * p, gap = p * 4, step = Math.floor(k * 12) % 2, shift = Math.sin(k * 11) * W * 0.12;
  const cols = ['#ff5a5a', '#ffd84f', '#7aff7a'];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {                          // прибульці марширують і спускаються
    const x = cx - (4 * iw + 3 * gap) / 2 + c * (iw + gap) + shift, y = H * 0.12 + r * (8 * p + p * 3) + ez(kt) * H * 0.12, dead = warpSeed(r * 7 + c) < ez(seg(k, 0.3, 0.5)) * 1.1;
    if (dead || kt <= 0) continue; g.fillStyle = cols[r];
    WARP_INV.forEach((row, ry) => { for (let rx = 0; rx < 11; rx++) if (row[rx] === '1') g.fillRect(Math.round(x + rx * p + (ry === 7 && step ? (rx < 5 ? -p : p) : 0)), Math.round(y + ry * p), p, p); });
  }
  const shipX = cx + Math.sin(k * 9) * W * 0.3, shipY = H * 0.9;                       // кораблик Капі стріляє вгору
  if (kt > 0) {
    g.fillStyle = '#7ad8ff'; g.fillRect(Math.round(shipX - 3 * p), Math.round(shipY), 6 * p, p * 2); g.fillRect(Math.round(shipX - p), Math.round(shipY - p * 2), p * 2, p * 2);
    for (let i = 0; i < 4; i++) { const f = ((k * 5 + i / 4) % 1); g.fillStyle = '#fff'; g.fillRect(Math.round(shipX - p / 2 + Math.sin((k * 9 + i) * 0.9) * 0), Math.round(shipY - f * H * 0.8), Math.max(1, Math.round(p * 0.7)), p * 2); }
  }
  g.textAlign = 'center'; g.textBaseline = 'middle'; warpFont(g, 7 * sc);
  const blink = Math.floor(k * 10) % 2;
  if (kt > 0 && k < 0.5 && blink) { g.globalAlpha = 1; warpText(g, 'INSERT COIN', cx, H * 0.52, '#ffe08a'); }
  const cy = -10 + ez(seg(k, 0.3, 0.46)) * (H * 0.52 + 10);                             // монетка падає в приймач
  if (k > 0.3 && k < 0.47) { g.fillStyle = '#ffd84f'; g.beginPath(); g.ellipse(cx, cy, p * 2.2 * Math.abs(Math.cos(k * 30)) + 1, p * 2.4, 0, 0, 7); g.fill(); g.fillStyle = '#fff6b0'; g.fillRect(cx - 1, cy - p, 2, p); }
  if (k > 0.5) { const f = seg(k, 0.5, 0.58); warpFont(g, 9 * sc * (0.6 + 0.4 * ez(f))); if (Math.floor(k * 14) % 2 || k > 0.7) warpText(g, 'LEVEL UP!', cx, H * 0.5, '#7aff7a'); warpFont(g, 5.5 * sc); warpText(g, 'STAGE ' + n2, cx, H * 0.5 + 11 * sc, '#ffe08a'); }
  g.textAlign = 'left'; warpFont(g, 5.5 * sc); warpText(g, 'SCORE ' + String(Math.floor(k * 98000)).padStart(6, '0'), 5 * sc, 6 * sc, '#fff');
  g.fillStyle = '#000'; g.globalAlpha = 0.22; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1); g.globalAlpha = 1;
  if (kr > 0) {                                                                    // розсипається пікселями зверху вниз
    const B = Math.max(5, Math.round(9 * sc * 0.6)), cc = Math.ceil(W / B), rr = Math.ceil(H / B), e = ez(kr) * 1.3;
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let yy = 0; yy < rr; yy++) for (let xx = 0; xx < cc; xx++) if (warpSeed(yy * cc + xx) * 0.45 + (yy / rr) * 0.55 < e - 0.12) g.fillRect(xx * B, yy * B, B, B);
    g.restore();
  }
}

// Інтернет: цифровий дощ, спливаючі вікна, смуга завантаження; сторінка нової епохи вантажиться зліва направо
function drawWarpNet(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2;
  const kf = seg(k, 0, 0.22), kt = seg(k, 0.1, 0.74), kr = seg(k, 0.74, 1);
  g.fillStyle = '#04141a'; g.fillRect(0, 0, W, H);
  if (kf < 1) { g.globalAlpha = 1 - ez(kf); for (let y = 0; y < H; y += 3) { const off = Math.round(Math.sin(y * 0.5 + k * 60) * kf * 10 * (warpSeed(y + Math.floor(k * 20)) > 0.6 ? 2 : 0.2)); g.drawImage(warp.snap, 0, y, W, 3, off, y, W, 3); } g.globalAlpha = 1; }
  const cw = Math.max(5, 6 * sc * 0.7), nc = Math.ceil(W / cw); warpFont(g, cw * 1.1); g.textAlign = 'center'; g.textBaseline = 'top';
  for (let c = 0; c < nc; c++) {                                                   // цифровий дощ
    const sp = 0.6 + warpSeed(c) * 1.2, head = ((warpSeed(c + 7) + k * sp) % 1.35) * H * 1.35 - H * 0.1;
    for (let j = 0; j < 9; j++) { const y = head - j * cw * 1.2; if (y < -cw || y > H) continue; g.globalAlpha = (1 - j / 9) * 0.85 * kt; g.fillStyle = j === 0 ? '#e6fff4' : '#2ee69a'; g.fillText(warpSeed(c * 13 + j + Math.floor(k * 9)) > 0.5 ? '1' : '0', c * cw + cw / 2, y); }
  }
  g.globalAlpha = 1;
  const nw = 7, ww = Math.max(36, W * 0.36), wh = Math.max(24, 24 * sc * 0.9);
  for (let i = 0; i < nw; i++) {                                                   // вікна «реклами» вискакують одне за одним
    const t0 = 0.14 + i * 0.065, f = seg(k, t0, t0 + 0.05) * (1 - seg(k, 0.68, 0.74)); if (f <= 0) continue;
    const x = Math.round(W * 0.06 + warpSeed(i + 21) * (W - ww - W * 0.12)), y = Math.round(H * 0.08 + warpSeed(i + 31) * (H * 0.62 - wh)), s2 = 0.6 + 0.4 * ez(f);
    g.save(); g.translate(x + ww / 2, y + wh / 2); g.scale(s2, s2); g.globalAlpha = Math.min(1, f * 1.5);
    g.fillStyle = '#1b2a44'; g.fillRect(-ww / 2 - 1, -wh / 2 - 1, ww + 2, wh + 2); g.fillStyle = '#e8edf6'; g.fillRect(-ww / 2, -wh / 2, ww, wh);
    g.fillStyle = ['#2a55d8', '#d84a6a', '#2aa56a'][i % 3]; g.fillRect(-ww / 2, -wh / 2, ww, wh * 0.28);
    g.fillStyle = '#fff'; g.fillRect(ww / 2 - wh * 0.26, -wh / 2 + wh * 0.05, wh * 0.18, wh * 0.18);
    g.fillStyle = '#8a95ad'; for (let l = 0; l < 3; l++) g.fillRect(-ww / 2 + 3, -wh / 2 + wh * (0.4 + l * 0.18), ww * (0.8 - l * 0.2), Math.max(1, wh * 0.07));
    g.restore();
  }
  g.globalAlpha = 1;
  const bw = W * 0.7, bh = Math.max(7, 9 * sc * 0.7), bx = cx - bw / 2, by = H * 0.8, pr = ez(seg(k, 0.12, 0.74)) * 100;     // смуга завантаження
  g.fillStyle = '#04141a'; g.fillRect(bx - 2, by - 2, bw + 4, bh + 4); g.strokeStyle = '#2ee69a'; g.lineWidth = Math.max(1, sc * 0.6); g.strokeRect(bx, by, bw, bh);
  g.fillStyle = '#2ee69a'; const seg2 = Math.max(3, bh * 0.7); for (let x = 0; x < bw * pr / 100 - seg2; x += seg2 * 1.3) g.fillRect(bx + 2 + x, by + 2, seg2, bh - 4);
  g.textAlign = 'center'; g.textBaseline = 'bottom'; warpFont(g, 5.5 * sc); warpText(g, 'LOADING... ' + Math.floor(pr) + '%', cx, by - 4, '#e6fff4');
  if (kr > 0) {                                                                    // сторінка вантажиться зліва направо
    const e = ez(kr) * (W + 24), B = 4;
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let y = 0; y < H; y += B) g.fillRect(0, y, Math.max(0, e - warpSeed(y / B) * 22), B);
    g.restore();
    g.fillStyle = '#7affd0'; g.globalAlpha = 1 - kr * 0.6; g.fillRect(Math.min(W - 1, e), 0, 2, H); g.globalAlpha = 1;
  }
}

// Еко: вітер здуває сцену, листя й пелюстки закручуються до центру, ліани проростають із країв; нова епоха розцвітає колом
function drawWarpEco(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
  const kw = seg(k, 0, 0.3), kt = seg(k, 0.1, 0.74), kr = seg(k, 0.74, 1);
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#d6f0b8'); bg.addColorStop(1, '#4f9a64'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  if (kw < 1) { g.globalAlpha = 1 - ez(kw); for (let y = 0; y < H; y += 3) g.drawImage(warp.snap, 0, y, W, 3, Math.round(ez(kw) * W * (0.2 + 0.8 * Math.abs(Math.sin(y * 0.2)) ) + ez(kw) * Math.sin(y * 0.3) * 8), y, W, 3); g.globalAlpha = 1; }
  g.globalAlpha = 0.5 * kt; g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, sc * 0.5);
  for (let i = 0; i < 9; i++) { const y = H * (0.1 + 0.1 * i), x0 = ((k * 2.2 + i * 0.37) % 1.4 - 0.2) * W; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + W * 0.1, y - 5 * sc, x0 + W * 0.2, y + 5 * sc, x0 + W * 0.3, y); g.stroke(); }     // лінії вітру
  const leafCols = ['#2f8f4a', '#5fbf5a', '#9fd45a', '#e8b44a', '#e87a4a', '#ff9fc0'];
  for (let i = 0; i < 64; i++) {                                                   // листя й пелюстки по спіралі до центру
    const f = (i / 64 + k * 1.1) % 1, r = (1 - f) * diag * 0.62, an = i * 2.39996 + f * 9, x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r * 0.78, s2 = (2.2 + warpSeed(i) * 2.6) * sc * 0.7 * (0.4 + (1 - f) * 0.9);
    g.save(); g.translate(x, y); g.rotate(an + k * 8 + i); g.globalAlpha = Math.min(1, f * 4) * Math.min(1, (1 - f) * 3 + 0.3) * kt; g.fillStyle = leafCols[i % 6];
    g.beginPath(); g.ellipse(0, 0, s2, s2 * 0.5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(30,70,40,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-s2, 0); g.lineTo(s2, 0); g.stroke(); g.restore();
  }
  const kv = ez(seg(k, 0.12, 0.62));
  [[0, H, 1], [W, H, -1]].forEach(([x0, y0, d], vi) => {                           // ліани ростуть із нижніх кутів
    const N = 40, last = Math.floor(N * kv); g.strokeStyle = '#2f7a42'; g.lineWidth = Math.max(1.5, sc * 1.1); g.beginPath();
    for (let i = 0; i <= last; i++) { const t2 = i / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.07 + t2 * W * 0.34), y = y0 - t2 * H * 0.92; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
    for (let i = 3; i <= last; i += 3) { const t2 = i / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.07 + t2 * W * 0.34), y = y0 - t2 * H * 0.92; g.fillStyle = leafCols[i % 3]; g.beginPath(); g.ellipse(x + d * 3 * sc, y, 3.2 * sc * 0.8, 1.7 * sc * 0.8, d * 0.5, 0, 7); g.fill(); }
    if (kv > 0.85) { const t2 = last / N, x = x0 + d * (Math.sin(t2 * 6 + vi) * W * 0.07 + t2 * W * 0.34), y = y0 - t2 * H * 0.92; for (let p = 0; p < 6; p++) { g.fillStyle = '#ff9fc0'; g.beginPath(); g.arc(x + Math.cos(p * 1.047) * 3 * sc, y + Math.sin(p * 1.047) * 3 * sc, 2 * sc, 0, 7); g.fill(); } g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(x, y, 1.8 * sc, 0, 7); g.fill(); }
  });
  const gl = g.createRadialGradient(cx, cy, 0, cx, cy, 30 * sc); gl.addColorStop(0, 'rgba(255,250,200,.9)'); gl.addColorStop(1, 'rgba(255,250,200,0)'); g.globalAlpha = kt * (0.6 + 0.3 * Math.sin(k * 20)); g.fillStyle = gl; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  warpCapy(g, cx, cy + Math.sin(k * 11) * 2 * sc, sc * 1.5, Math.sin(k * 7) * 0.15 + k * 0.6, seg(k, 0.12, 0.28) * (1 - seg(k, 0.66, 0.74)));
  if (kr > 0) {                                                                    // нова епоха розцвітає колом, по краю летить листя
    const r = ez(kr) * diag * 1.05; warpReveal(g, cx, cy, r, sc, kr);
    for (let i = 0; i < 28; i++) { const an = i / 28 * Math.PI * 2 + k * 2; g.fillStyle = leafCols[i % 6]; g.globalAlpha = 1 - kr; g.beginPath(); g.ellipse(cx + Math.cos(an) * r, cy + Math.sin(an) * r, 3 * sc * 0.8, 1.6 * sc * 0.8, an, 0, 7); g.fill(); } g.globalAlpha = 1;
  }
}

// Космос: сцена летить геть, як маленька планета, Капі в скафандрі мчить крізь зорі й повз планети, спалах гіперстрибка
function drawWarpSpace(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
  const kp = seg(k, 0, 0.36), kt = seg(k, 0.1, 0.74), kr = seg(k, 0.74, 1), fl = seg(k, 0.6, 0.76);
  const bg = g.createRadialGradient(cx, cy, 0, cx, cy, diag * 0.6); bg.addColorStop(0, '#16123a'); bg.addColorStop(1, '#02020c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.lineCap = 'round';
  for (let i = 0; i < 130; i++) {                                                  // зорі витягуються в смужки гіперпростору
    const an = warpSeed(i) * Math.PI * 2, f = (warpSeed(i + 9) + k * (0.5 + 2.4 * kt * kt)) % 1, r0 = f * f * diag * 0.62 + 2, len = 1 + f * f * diag * 0.26 * kt;
    g.globalAlpha = Math.min(1, f * 2.5); g.strokeStyle = i % 5 === 0 ? '#9fc8ff' : i % 7 === 0 ? '#ffd8a0' : '#fff'; g.lineWidth = Math.max(1, sc * (0.4 + f * 0.9));
    g.beginPath(); g.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); g.lineTo(cx + Math.cos(an) * (r0 + len), cy + Math.sin(an) * (r0 + len)); g.stroke();
  }
  g.globalAlpha = 1;
  const pls = [['#e8794a', '#f2b48a', 0.5, 0.0, 0], ['#5fa8e8', '#bfe0ff', 1.9, 0.3, 1], ['#b46ae8', '#e6c4ff', 3.8, 0.55, 0]];
  pls.forEach(([c1, c2, an, t0, ring], i) => {                                      // планети пролітають повз
    const f = seg(k, 0.12 + t0 * 0.4, 0.62 + t0 * 0.2); if (f <= 0 || f >= 1) return; const r = ez(f) * diag * 0.66 + 4, x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r * 0.8, rad = (2 + f * f * 22) * sc * 0.8;
    g.globalAlpha = Math.min(1, f * 4) * (1 - fl); const gr = g.createRadialGradient(x - rad * 0.35, y - rad * 0.35, rad * 0.1, x, y, rad); gr.addColorStop(0, c2); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
    if (ring) { g.strokeStyle = c2; g.lineWidth = Math.max(1, rad * 0.14); g.beginPath(); g.ellipse(x, y, rad * 1.7, rad * 0.45, -0.4, 0, 7); g.stroke(); }
  });
  g.globalAlpha = 1;
  if (kp < 1) {                                                                    // знімок «до» — маленька планета, що відлітає
    const sz = 1 - ez(kp), rad = Math.min(W, H) * 0.46 * sz;
    if (rad > 1) { g.save(); g.translate(cx + ez(kp) * W * 0.25, cy - ez(kp) * H * 0.1); g.beginPath(); g.arc(0, 0, rad, 0, 7); g.clip(); g.rotate(ez(kp) * 1.5); g.scale(sz, sz); g.drawImage(warp.snap, -W / 2, -H / 2); g.restore(); g.strokeStyle = '#9fc8ff'; g.lineWidth = Math.max(1, sc * 0.8); g.beginPath(); g.arc(cx + ez(kp) * W * 0.25, cy - ez(kp) * H * 0.1, rad, 0, 7); g.stroke(); }
  }
  const ca = seg(k, 0.14, 0.3) * (1 - seg(k, 0.62, 0.74)), sh = Math.sin(k * 60) * sc * 0.5 * kt;       // Капі в скафандрі, позаду вогонь
  if (ca > 0) {
    for (let i = 0; i < 3; i++) { g.globalAlpha = ca * (0.8 - i * 0.2); g.fillStyle = ['#fff6b0', '#ffb43a', '#ff5a2a'][i]; const fh = (7 + i * 5 + Math.sin(k * 80 + i) * 3) * sc * 0.8; g.beginPath(); g.moveTo(cx - 5 * sc * (1 - i * 0.2) + sh, cy + 10 * sc); g.lineTo(cx + 5 * sc * (1 - i * 0.2) + sh, cy + 10 * sc); g.lineTo(cx + sh, cy + 10 * sc + fh); g.closePath(); g.fill(); }
    warpCapy(g, cx + sh, cy, sc * 1.5, Math.sin(k * 8) * 0.12, ca);
    g.globalAlpha = ca * 0.6; g.strokeStyle = '#bfe8ff'; g.lineWidth = Math.max(1, sc * 0.9); g.beginPath(); g.arc(cx + sh, cy - 2 * sc, 11 * sc, 0, 7); g.stroke(); g.fillStyle = 'rgba(160,220,255,.15)'; g.fill(); g.globalAlpha = 1;
  }
  g.textAlign = 'center'; g.textBaseline = 'middle'; warp.icons.forEach((ic, i) => { const f = (kt * 1.7 + i / warp.icons.length) % 1, an = i * 2.4 + k * 2, r = Math.pow(f, 1.6) * diag * 0.7; g.globalAlpha = Math.sin(f * Math.PI) * kt * 0.9; g.font = Math.round((5 + f * 18) * sc) + 'px sans-serif'; g.fillText(ic, cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.75); });
  g.globalAlpha = 1;
  if (fl > 0) { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, ez(fl) * diag * 0.9 + 1); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(190,220,255,.9)'); gr.addColorStop(1, 'rgba(190,220,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  if (kr > 0) { g.fillStyle = '#fff'; g.globalAlpha = 1 - kr; g.fillRect(0, 0, W, H); g.globalAlpha = 1; warpReveal(g, cx, cy, ez(kr) * diag * 1.05, sc, kr); }
}
// Відродження: давня Греція. Біле мармурове небо, колони, оливкові гілки й дерева, звірята-ангелятка з німбами й крильцями
function warpWing(g, x, y, s, flap, dir) {                         // одне пір'яне крильце
  g.save(); g.translate(x, y); g.scale(dir, 1); g.rotate(-0.55 + flap * 0.75);
  g.fillStyle = '#ffffff'; g.strokeStyle = '#cdbb8a'; g.lineWidth = Math.max(1, s * 0.07);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.6, -s * 1.0, s * 1.5, -s * 0.55); g.quadraticCurveTo(s * 1.2, -s * 0.25, s * 1.45, -s * 0.02); g.quadraticCurveTo(s * 1.0, 0.0, s * 1.08, s * 0.3); g.quadraticCurveTo(s * 0.5, s * 0.15, 0, s * 0.35); g.closePath(); g.fill(); g.stroke();
  g.restore();
}
function warpAngel(g, cs, x, y, s, flap, a, rot) {                  // звірятко з крильцями й золотим німбом
  const w = cs.width * s, h = cs.height * s;
  g.save(); g.translate(x, y); g.rotate(rot || 0); g.globalAlpha = a;
  warpWing(g, -w * 0.18, -h * 0.05, w * 0.5, flap, -1); warpWing(g, w * 0.18, -h * 0.05, w * 0.5, flap, 1);
  g.drawImage(cs, -w / 2, -h / 2, w, h);
  g.strokeStyle = '#8a6a10'; g.lineWidth = Math.max(1.6, s * 1.9); g.beginPath(); g.ellipse(0, -h * 0.6, w * 0.26, h * 0.085, 0, 0, 7); g.stroke();
  g.strokeStyle = '#ffe36a'; g.lineWidth = Math.max(1, s * 1.1); g.beginPath(); g.ellipse(0, -h * 0.6, w * 0.26, h * 0.085, 0, 0, 7); g.stroke();
  g.restore(); g.globalAlpha = 1;
}
function warpOlive(g, x, y, s, sway, a) {                           // оливкове дерево: покручений стовбур, сріблясто-зелена крона, чорні оливки
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#5a4630'; g.lineCap = 'round'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-7, -9, 6, -14, -2 + sway, -26); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(-1, -14); g.quadraticCurveTo(-10, -20, -13 + sway, -27); g.stroke(); g.beginPath(); g.moveTo(1, -16); g.quadraticCurveTo(10, -22, 13 + sway, -28); g.stroke();
  [[-12, -29, 11, '#6f8a3e'], [12, -30, 11, '#6f8a3e'], [0, -35, 14, '#8aa650'], [-6, -27, 9, '#a9c06c'], [8, -26, 9, '#a9c06c']].forEach(([cx, cy, r, c]) => { g.fillStyle = c; g.beginPath(); g.ellipse(cx + sway, cy, r, r * 0.72, 0, 0, 7); g.fill(); });
  g.fillStyle = '#d5e1a0'; for (let i = 0; i < 10; i++) { g.fillRect(-16 + warpSeed(i) * 32 + sway, -44 + warpSeed(i + 5) * 22, 3, 1); }
  g.fillStyle = '#2c2038'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-12 + warpSeed(i + 20) * 24 + sway, -40 + warpSeed(i + 30) * 18, 1.5, 1.1, 0, 0, 7); g.fill(); }
  g.restore();
}
function warpOliveBranch(g, x0, y0, dx, len, sc, a, sw) {            // гілка з листям і оливками, що росте з кута
  const N = 22, last = Math.floor(N * len), pt = i => { const t = i / N; return [x0 + dx * (t * 62 * sc + Math.sin(t * 5 + sw) * 3 * sc), y0 + t * 70 * sc + Math.sin(t * 3 + sw) * 2 * sc]; };
  g.save(); g.globalAlpha = a; g.strokeStyle = '#5a4630'; g.lineWidth = Math.max(1, sc * 0.9); g.beginPath();
  for (let i = 0; i <= last; i++) { const [x, y] = pt(i); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
  for (let i = 2; i <= last; i += 2) {
    const [x, y] = pt(i); [-1, 1].forEach(side => { g.save(); g.translate(x, y); g.rotate(side * 0.9 + dx * 0.3); g.fillStyle = i % 4 ? '#8fa85a' : '#a9c06c'; g.beginPath(); g.ellipse(side * 4 * sc, 0, 4.4 * sc, 1.5 * sc, 0, 0, 7); g.fill(); g.restore(); });
    if (i % 6 === 0) { g.fillStyle = '#2c2038'; g.beginPath(); g.ellipse(x - dx * 2 * sc, y + 3 * sc, 1.7 * sc, 2.3 * sc, 0, 0, 7); g.fill(); g.fillStyle = '#7a6aa0'; g.fillRect(x - dx * 2.6 * sc, y + 2 * sc, 0.7 * sc, 0.9 * sc); }
  }
  g.restore();
}
function warpMeander(g, y, h, W, sc, off, col, a) {                  // грецький меандр, що біжить уздовж краю
  const s = h, step = s * 1.3; g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = Math.max(1, s * 0.16); g.lineCap = 'square';
  for (let x = -step + (off % step); x < W; x += step) { g.beginPath(); g.moveTo(x, y + s); g.lineTo(x, y); g.lineTo(x + s, y); g.lineTo(x + s, y + s * 0.7); g.lineTo(x + s * 0.3, y + s * 0.7); g.lineTo(x + s * 0.3, y + s * 0.35); g.lineTo(x + s * 0.65, y + s * 0.35); g.stroke(); }
  g.restore();
}
function drawWarpGreece(k) {
  const { g, W, H, sc, diag, seg, ez } = warpSetup(), cx = W / 2, cy = H / 2;
  const ka = seg(k, 0, 0.24), kt = seg(k, 0.1, 0.74), kc = ez(seg(k, 0.08, 0.34)), kv = ez(seg(k, 0.16, 0.6)), kr = seg(k, 0.74, 1);
  g.drawImage(warp.snap, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9fd0f2'); sky.addColorStop(0.55, '#e6f2fb'); sky.addColorStop(1, '#fbe9b8');
  g.globalAlpha = ez(ka); g.fillStyle = sky; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  g.globalCompositeOperation = 'lighter';                                           // промені світла згори
  for (let i = 0; i < 9; i++) { const an = Math.PI / 2 + (i - 4) * 0.2 + Math.sin(k * 3 + i) * 0.04; g.globalAlpha = 0.16 * kt; g.fillStyle = '#ffe9a0'; g.beginPath(); g.moveTo(cx, -H * 0.1); g.lineTo(cx + Math.cos(an - 0.05) * diag * 1.2, -H * 0.1 + Math.sin(an - 0.05) * diag * 1.2); g.lineTo(cx + Math.cos(an + 0.05) * diag * 1.2, -H * 0.1 + Math.sin(an + 0.05) * diag * 1.2); g.closePath(); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 5; i++) { const x = ((warpSeed(i + 3) + k * (0.15 + 0.1 * i)) % 1.4 - 0.2) * W, y = H * (0.12 + 0.14 * i), r = (9 + warpSeed(i) * 7) * sc * 0.8; g.globalAlpha = 0.85 * kt; g.fillStyle = '#fff'; [[0, 0, 1], [-0.8, 0.2, 0.7], [0.8, 0.25, 0.75], [0.2, -0.35, 0.7]].forEach(([dx, dy, f]) => { g.beginPath(); g.ellipse(x + dx * r, y + dy * r, r * f, r * f * 0.55, 0, 0, 7); g.fill(); }); }
  g.globalAlpha = 1;
  const fy = H * 0.88, ty = H * 0.14;                                               // колони піднімаються знизу
  const col = (x, w2, a) => {
    const off = (1 - kc) * H, top2 = ty + off, bot = fy + off; g.save(); g.globalAlpha = a * kt;
    g.fillStyle = '#e9e1d0'; g.fillRect(x - w2 * 0.62, top2, w2 * 1.24, h2(2)); g.fillRect(x - w2 * 0.7, top2 + h2(2), w2 * 1.4, h2(1.2));                      // капітель
    g.fillStyle = '#f7f2e6'; g.fillRect(x - w2 / 2, top2 + h2(3.2), w2, bot - top2 - h2(5));                                                                 // стовбур
    g.fillStyle = '#d6ccb4'; g.fillRect(x + w2 * 0.18, top2 + h2(3.2), w2 * 0.32, bot - top2 - h2(5));
    g.strokeStyle = '#cfc4a8'; g.lineWidth = 1; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * w2 * 0.2, top2 + h2(3.2)); g.lineTo(x + i * w2 * 0.2, bot - h2(1.8)); g.stroke(); }
    g.fillStyle = '#e9e1d0'; g.fillRect(x - w2 * 0.66, bot - h2(1.8), w2 * 1.32, h2(1.8)); g.restore();
  }, h2 = f => f * sc * 1.6;
  col(W * 0.07, W * 0.07, 1); col(W * 0.93, W * 0.07, 1); col(W * 0.25, W * 0.045, 0.7); col(W * 0.75, W * 0.045, 0.7);
  g.fillStyle = '#f2ead6'; g.globalAlpha = kt; g.fillRect(0, ty - h2(3) - (1 - kc) * H, W, h2(3));                       // балка
  warpMeander(g, ty - h2(2.7) - (1 - kc) * H, h2(2), W, sc, k * 60, '#c19a2e', kt);
  g.globalAlpha = kt; g.fillStyle = '#d9c9a0'; g.fillRect(0, fy + (1 - kc) * H, W, H); g.globalAlpha = 1;
  warpMeander(g, fy + h2(0.4) + (1 - kc) * H, h2(2), W, sc, -k * 60, '#c19a2e', kt);
  warpOliveBranch(g, W * 0.1, H * 0.1, 1, kv, sc, kt, k * 4); warpOliveBranch(g, W * 0.9, H * 0.1, -1, kv, sc, kt, k * 4 + 2);
  warpOlive(g, W * 0.16, fy + h2(1.2), sc * 0.9 * kv, Math.sin(k * 6) * 1.5, kt); warpOlive(g, W * 0.84, fy + h2(1.2), sc * 0.9 * kv, Math.sin(k * 6 + 2) * 1.5, kt); warpOlive(g, W * 0.5, fy + h2(0.9), sc * 0.55 * kv, Math.sin(k * 6 + 4) * 1.2, kt * 0.9);
  const R = Math.min(W, H * 1.3) * 0.34 * ez(seg(k, 0.3, 0.7));                     // лавровий вінок розкривається навколо Капі
  if (R > 2) for (let i = 0; i < 30; i++) { const an = i / 30 * Math.PI * 2 + k * 1.2; g.save(); g.translate(cx + Math.cos(an) * R, cy + Math.sin(an) * R * 0.78); g.rotate(an + Math.PI / 2 + (i % 2 ? 0.5 : -0.5)); g.globalAlpha = kt; g.fillStyle = i % 2 ? '#6fa04a' : '#9bc46a'; g.beginPath(); g.ellipse(0, 0, 4 * sc * 0.8, 1.6 * sc * 0.8, 0, 0, 7); g.fill(); g.restore(); }
  const flap = Math.sin(k * 40) * 0.5 + 0.5, fa = seg(k, 0.16, 0.3) * (1 - seg(k, 0.68, 0.74));
  const kids = ['spike', 'bodya', 'zoya', 'mikhas', 'sonia', 'kria', 'murzyk'].map(id => TEAM.find(m => m.id === id)).filter(Boolean);       // звірята-ангелятка літають по колу
  kids.forEach((m, i) => { const an = i / kids.length * Math.PI * 2 - k * 4.2, rr = Math.min(W, H * 1.4) * (0.27 + 0.03 * Math.sin(k * 9 + i)); warpAngel(g, getSpriteCanvas('team_' + m.id + '_e0'), cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * 0.62 + Math.sin(k * 20 + i) * sc, sc * 0.8, Math.sin(k * 40 + i) * 0.5 + 0.5, fa, Math.sin(k * 7 + i) * 0.12); });
  warpAngel(g, getSpriteCanvas(capySprite()), cx, cy + Math.sin(k * 14) * 1.5 * sc, sc * 1.6, flap, fa, Math.sin(k * 6) * 0.06);
  g.textAlign = 'center'; g.textBaseline = 'middle'; warp.icons.forEach((ic, i) => { const f = (kt * 1.5 + i / warp.icons.length) % 1; g.globalAlpha = Math.sin(f * Math.PI) * kt * 0.85; g.font = Math.round((6 + f * 12) * sc) + 'px sans-serif'; g.fillText(ic, cx + Math.cos(i * 2.2 + k * 2) * f * diag * 0.45, cy + Math.sin(i * 2.2 + k * 2) * f * diag * 0.3); }); g.globalAlpha = 1;
  if (kr > 0) {                                                                    // золоте сяйво й коло з оливкових листочків відкривають нову епоху
    g.globalAlpha = Math.sin(kr * Math.PI) * 0.55; g.fillStyle = '#fff6c8'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    const r = ez(kr) * diag * 1.05; warpReveal(g, cx, cy, r, sc, kr);
    for (let i = 0; i < 36; i++) { const an = i / 36 * Math.PI * 2; g.save(); g.translate(cx + Math.cos(an) * r, cy + Math.sin(an) * r); g.rotate(an + Math.PI / 2 + (i % 2 ? 0.6 : -0.6)); g.globalAlpha = 1 - kr; g.fillStyle = i % 2 ? '#7f9a4a' : '#a9c06c'; g.beginPath(); g.ellipse(0, 0, 4 * sc * 0.8, 1.5 * sc * 0.8, 0, 0, 7); g.fill(); g.restore(); }
    g.globalAlpha = 1;
  }
}
const WARP_BY_EPOCH = [drawWarpGreece, drawWarpRewind, drawWarpDisco, drawWarpArcade, drawWarpNet, drawWarpEco, drawWarpSpace, drawWarpTunnel];
function updateWarp(dt) {
  if (!warp) return;
  warp.t += dt;
  const k = Math.min(1, warp.t / warp.dur);
  (WARP_BY_EPOCH[(warp.toEpoch | 0) % 8] || drawWarpGreece)(k);               // у кожної епохи своя анімація подорожі
  if ((state.warpSeen || warp.demo) && warp.t > 0.5 && k < 0.7) {                // після першого перегляду анімацію можна пропустити
    const g = ui.warpCanvas.getContext('2d'), sc = warp.W / 160; g.globalAlpha = 0.9; g.textAlign = 'center'; g.textBaseline = 'bottom'; warpFont(g, 4.4 * sc); warpText(g, t('warpSkip'), warp.W / 2, warp.H - 3 * sc, '#fff'); g.globalAlpha = 1;
  }
  if (!warp.applied && k >= 0.5) { warp.applied = true; if (warp.view !== undefined) setEpochPreview(warp.view); else applyTimeTravel(); }
  if (k >= 1) {
    const viewOnly = warp.view !== undefined;
    if (!warp.demo) state.warpSeen = 1;
    warp = null;
    ui.timeWarp.hidden = true;
    if (viewOnly) return;
    // новий сюжетний фрагмент епохи
    const storyNo = ((state.epoch - 1) % EPOCHS.length) + 1, label = (state.epoch % EPOCHS.length) + 1;
    playEpochIntro(state.epoch, () => { if (!state.story.guests[storyNo - 1]) startDialogue(storyNo, false, 'ep', label); });      // історія — лише вперше, далі тільки заставка
  }
}
// Власне скидання: лишаються кристали, досягнення, статистика, прочитані глави й покращення майстерні
function applyTimeTravel() {
  syncEpochEarned();
  const gain = prestigeGain();
  state.shards += gain;
  state.shardsTotal += gain;
  state.stats.timeTravels++;
  state.stats.maxLevel = Math.max(state.stats.maxLevel, state.shopLevel);
  state.epoch++;
  state.activeEpoch = -1;
  state.team.forEach((lv, i) => { if (lv > 0) state.teamKnown[i] = 1; });      // звірятка лишаються знайомими
  state.coins = CONFIG.START_COINS;
  state.depts = DEPARTMENTS.map(() => 0);
  state.team = TEAM.map(() => 0);
  state.teamStars = TEAM.map(() => 0);
  state.shopLevel = startLevel();
  state.runStartEarned = state.totalEarned;
  state.events.incomeBoostUntil = 0; state.events.tapBoostUntil = 0;
  trouble = null; puddles.length = 0; sackDrop = null;
  build = null; ui.shopOverlay.style.visibility = '';
  actors.length = 0;
  customers.length = 0;
  recalcIncome();
  rebuildEpochLayers();
  resetEpochFx();
  rebuildShop(true);
  syncActors();
  syncGuests();
  layoutScene();
  updateMusic();
  updateUI();
  checkAchievements();
  saveGame();
}

/* ---------- Майстерня часу ---------- */
function wsEffectText(id, L) {
  switch (id) {
    case 'goldenFreq':   return t('wsEff_goldenFreq', Math.round(L * 15));
    case 'autoTap':      return t('wsEff_autoTap', L);
    case 'offlineHours': return t('wsEff_offlineHours', CONFIG.OFFLINE_MAX_HOURS + 4 * L);
    case 'offlineRate':  return t('wsEff_offlineRate', Math.round((CONFIG.OFFLINE_RATE + 0.05 * L) * 100));
    case 'salesFreq':    return t('wsEff_salesFreq', Math.round((1 / (1 - 0.05 * L) - 1) * 100));
    case 'saleLength':   return t('wsEff_saleLength', CONFIG.SALE_SECONDS + 20 * L);
    case 'wheelFast':    return t('wsEff_wheelFast', WHEEL_HOURS_BY_LEVEL[L] || 24);
    case 'thiefLess':    return t('wsEff_thiefLess', Math.round(L * 20));
    case 'cheaperDepts': return t('wsEff_cheaperDepts', Math.round(L * 2));
    case 'cheaperTeam':  return t('wsEff_cheaperTeam', Math.round(L * 2));
    case 'tapPower':     return t('wsEff_tapPower', fmt(1 + 0.1 * L, 2));
    case 'crystalGain':  return t('wsEff_crystalGain', Math.round(L * 10));
  }
  return '';
}
function buildWorkshop() {
  ui.wsList.innerHTML = '';
  WORKSHOP.forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'card ws-card';
    card.innerHTML = '<div class="dept-head"><span class="dept-icon"></span><span class="dept-name"></span><span class="dept-count"></span></div>' +
      '<div class="ws-now"></div><div class="ws-next"></div><button type="button" class="btn wide go"></button>';
    card.querySelector('.dept-icon').textContent = w.icon;
    card.querySelector('button').addEventListener('click', () => buyWorkshop(i));
    ui.wsList.appendChild(card);
    wsEls[i] = { name: card.querySelector('.dept-name'), lvl: card.querySelector('.dept-count'), now: card.querySelector('.ws-now'), next: card.querySelector('.ws-next'), btn: card.querySelector('button') };
  });
}
function wsNeedTrips(L) { return Math.max(0, L - 1); }                  // рівень 3 — після 1 подорожі, 4 — після 2, 5 — після 3
function buyWorkshop(i) {
  const w = WORKSHOP[i], L = state.ws[i];
  if (L >= w.costs.length || state.shards < w.costs[L] || tripsDone() < wsNeedTrips(L)) return;
  state.shards -= w.costs[L];
  state.ws[i]++;
  recalcIncome();
  playSfx('upgrade');
  showToast(t('ws_' + w.id) + ' ' + state.ws[i] + '/' + w.costs.length, 'good');
  updateUI();
  saveGame();
}
// Умови переходу в наступну епоху: що вже зроблено, що лишилось і яка команда далі
let routeSig = '';
function updateRouteCard(gain) {
  const fin = state.story.finale, run = Math.max(0, state.totalEarned - state.runStartEarned), nights = Math.min(3, state.story.nights || 0);
  const rows = [];
  if (!fin) { rows.push([state.shopLevel >= LEVELS.length, t('routeLevel', LEVELS.length)]); rows.push([nights >= 3, t('routeNights', nights)]); }
  rows.push([gain >= 1, t('routeEarn', fmt(Math.floor(run)), fmt(shardThreshold()))]);
  rows.push([false, t('routeGo')]);
  const next = (state.epoch + 1) % EPOCHS.length;
  const sig = JSON.stringify(rows) + state.lang + next;
  if (sig === routeSig) return;
  routeSig = sig;
  ui.routeTitle.textContent = t('routeTitle'); ui.routeNext.textContent = t('routeNext', t('epoch_' + next));
  ui.routeList.innerHTML = '';
  rows.forEach(([done, text], i) => {
    const r = document.createElement('div'); r.className = 'route-row' + (done ? ' done' : '');
    const m = document.createElement('span'); m.className = 'rt'; m.textContent = done ? '✓' : (i === rows.length - 1 ? '👉' : '○');
    const x = document.createElement('span'); x.textContent = text;
    r.append(m, x); ui.routeList.appendChild(r);
  });
}
function updateWorkshopUI() {
  if (ui.paneWorkshop.hidden) return;
  setText(ui.wsInfo, t('wsCrystals', fmt(state.shards)), 'wsInfo');
  setText(ui.wsBonus, t('wsBonus', fmt(state.shardsTotal), fmt(crystalMult(), 2), fmt(eraMult(), 2), Math.round(CONFIG.CRYSTAL_INCOME_BONUS * 1000) / 10), 'wsBonus');
  const gain = prestigeGain();
  setText(ui.warpPreview, gain >= 1 ? t('warpGain', gain, eraStep((state.stats && state.stats.timeTravels) || 0)) : t('warpNone', fmt(shardThreshold())), 'warpPrev');
  ui.warpBtn.disabled = gain < 1 || !state.story.finale;
  updateRouteCard(gain);
  setText(ui.warpBtn, t('warpBtn'), 'warpBtn');
  WORKSHOP.forEach((w, i) => {
    const e = wsEls[i], L = state.ws[i], max = w.costs.length;
    setText(e.name, t('ws_' + w.id), 'wn' + i);
    setText(e.lvl, L + '/' + max, 'wl' + i);
    setText(e.now, t('teamNow', wsEffectText(w.id, L)), 'wnow' + i + '_' + L);
    setText(e.next, L < max ? t('teamNext', wsEffectText(w.id, L + 1)) : '', 'wnext' + i + '_' + L);
    if (L >= max) { setText(e.btn, t('teamMax'), 'wb' + i); e.btn.disabled = true; }
    else if (tripsDone() < wsNeedTrips(L)) { setText(e.btn, t('wsGate', wsNeedTrips(L)), 'wbg' + i + '_' + L); e.btn.disabled = true; }
    else { setText(e.btn, t('wsBuy', w.costs[L]), 'wb' + i + '_' + L); e.btn.disabled = state.shards < w.costs[L]; }
  });
}

/* ---------- Досягнення ---------- */
function achName(a) {
  const tiers = ACH_SETS.find(s => s.metric === a.metric).targets.length;
  return t('achName_' + a.metric) + (tiers > 1 ? ' ' + ROMAN[a.tier] : '');
}
function achValue(a) { return METRICS[a.metric](state); }
// Піксельна медаль 16×16 з символом усередині; закрита — сіра
function makeBadge(a, unlocked) {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  const g = c.getContext('2d');
  disc(g, 8, 8, 7, 'd');
  disc(g, 8, 8, 6, unlocked ? ACH_TIER_COLORS[a.tier % ACH_TIER_COLORS.length] : 'E');
  if (unlocked) { R(g, 4, 3, 3, 1, 'w'); R(g, 3, 4, 1, 2, 'w'); }
  g.globalAlpha = unlocked ? 1 : 0.3;
  g.drawImage(getSpriteCanvas(a.glyph === 'coin' ? coinSprite() : a.glyph === 'gem' ? gemSprite() : 'glyph_' + a.glyph), 4, 4);
  return c;
}
function buildAchievements() {
  ui.achList.innerHTML = '';
  ACHIEVEMENTS.forEach((a, i) => {
    const card = document.createElement('div');
    card.className = 'card ach-row';
    card.innerHTML = '<canvas class="badge" width="16" height="16"></canvas><div class="info"><div class="a-name"></div><div class="a-desc"></div>' +
      '<div class="ms"><div class="ms-bar"><i></i></div><span class="ms-text"></span></div></div>';
    ui.achList.appendChild(card);
    achEls[i] = { card, badge: card.querySelector('.badge'), name: card.querySelector('.a-name'), desc: card.querySelector('.a-desc'), bar: card.querySelector('.ms-bar i'), text: card.querySelector('.ms-text'), shown: -1 };
  });
}
function updateAchUI() {
  if (ui.paneAch.hidden) return;
  const done = state.ach.reduce((s, v) => s + v, 0);
  setText(ui.achSummary, t('achSummary', done, ACHIEVEMENTS.length), 'achSum');
  ACHIEVEMENTS.forEach((a, i) => {
    const e = achEls[i], got = state.ach[i] === 1, v = achValue(a);
    if (e.shown !== (got ? 1 : 0)) {
      e.shown = got ? 1 : 0;
      const bc = e.badge.getContext('2d');
      bc.clearRect(0, 0, 16, 16);
      bc.drawImage(makeBadge(a, got), 0, 0);
      e.card.classList.toggle('locked-ach', !got);
    }
    setText(e.name, achName(a), 'an' + i);
    setText(e.desc, t('achDesc_' + a.metric, fmt(a.target)), 'ad' + i);
    e.bar.style.width = Math.min(100, v / a.target * 100) + '%';
    setText(e.text, got ? '✓' : fmt(Math.floor(v)) + ' / ' + fmt(a.target), 'ap' + i);
  });
}
function checkAchievements() {
  state.stats.maxLevel = Math.max(state.stats.maxLevel, state.shopLevel);
  ACHIEVEMENTS.forEach((a, i) => {
    if (state.ach[i] || achValue(a) < a.target) return;
    state.ach[i] = 1;
    playSfx('achievement');
    showToast('🏆 ' + t('achGot') + '\n' + achName(a), 'big', makeBadge(a, true));
    for (let k = 0; k < 24; k++) fx.sparks.push({ x: rand(40, 280), y: rand(20, 120), vx: rand(-30, 30), vy: rand(10, 60), age: 0, life: rand(0.6, 1.2), col: ['y', 'h', 'p', 'm', 'w'][k % 5] });
  });
}

/* ---------- Статистика ---------- */
function fmtDuration(sec) {
  sec = Math.floor(sec);
  return t('durationFmt', Math.floor(sec / 86400), Math.floor(sec % 86400 / 3600), Math.floor(sec % 3600 / 60));
}
function buildStats() {
  ui.statsCard.innerHTML = '';
  const rows = ['stEpoch', 'stPlay', 'stEarned', 'stRun', 'stCps', 'stTap', 'stTaps', 'stDepts', 'stCrystals', 'stShards', 'stTravels', 'stRaccoons', 'stPuddles', 'stGhosts', 'stWheel', 'stAch', 'stChapters'];
  rows.forEach(k => {
    const row = document.createElement('div');
    row.className = 'stat';
    row.innerHTML = '<span></span><b></b>';
    ui.statsCard.appendChild(row);
    statRows[k] = { label: row.children[0], value: row.children[1] };
  });
}
function updateStatsUI() {
  if (ui.paneAch.hidden) return;
  const s = state, st = s.stats;
  const vals = {
    stEpoch: t('epoch_' + (s.epoch % EPOCHS.length)) + ' (' + (s.epoch + 1) + ')',
    stPlay: fmtDuration(s.playTime),
    stEarned: fmt(Math.floor(s.totalEarned)),
    stRun: fmt(Math.floor(Math.max(0, s.totalEarned - s.runStartEarned))),
    stCps: t('perSecond', fmt(s.cps, 1)),
    stTap: fmt(tapValue(), 1),
    stTaps: fmt(s.taps),
    stDepts: fmt(st.deptsBought),
    stCrystals: GEM_CH + ' ' + fmt(s.crystals) + ' / ' + fmt(s.crystalsTotal),
    stShards: SHARD_CH + ' ' + fmt(s.shards || 0) + ' / ' + fmt(s.shardsTotal || 0),
    stTravels: fmt(st.timeTravels),
    stRaccoons: st.raccoonsCaught + ' / ' + st.raccoonsLost,
    stPuddles: fmt(st.puddlesFixed),
    stGhosts: fmt(st.ghostsCaught),
    stWheel: fmt(st.wheelSpins),
    stAch: s.ach.reduce((a, b) => a + b, 0) + ' / ' + ACHIEVEMENTS.length,
    stChapters: s.story.done + ' / ' + CHAPTERS.length
  };
  Object.keys(statRows).forEach(k => {
    setText(statRows[k].label, t(k), 'sl' + k);
    setText(statRows[k].value, vals[k], 'sv' + k);
  });
}

/* ---------- Підтвердження (вікно «Так / Ні») ---------- */
function askConfirm(title, text, yesLabel, onYes) {
  ui.confirmTitle.textContent = title;
  ui.confirmText.textContent = text;
  ui.confirmYes.textContent = yesLabel;
  ui.confirmNo.textContent = t('confirmNo');
  confirmCb = onYes;
  ui.confirmModal.hidden = false;
}

/* ---------- Налаштування ---------- */
function applyViewSettings() {
  document.body.classList.toggle('no-anim', !animOn());
  document.body.classList.toggle('big-text', !!state.settings.bigText);
  resetEpochFx();
}
// Перегляд минулих епох: лише вигляд, прогрес не змінюється
function setEpochPreview(e) {
  syncEpochEarned();
  state.activeEpoch = (e === null || e === state.epoch % EPOCHS.length) ? -1 : e;
  rebuildEpochLayers();
  refreshDeptTexts();
  updateMusic();
  updateUI();
  saveGame();
}
function refreshDeptTexts() { uiCache.reqSig = ''; uiCache.boostSig = ''; DEPARTMENTS.forEach((d, i) => { if (deptEls[i]) { deptEls[i].name.textContent = deptName(i); deptEls[i].icon.textContent = deptIcon(i); } }); }
function updateEpochViewUI() {
  const card = $('epochViewCard');
  if (!card) return;
  card.hidden = false;                              // картка видна завжди; поки пройдено лише одну епоху — одна кнопка
  if (!DEV_OPEN_ALL && state.epoch < 1 && state.activeEpoch >= 0) { state.activeEpoch = -1; rebuildEpochLayers(); }
  const box = ui.setEpochView, top = DEV_OPEN_ALL ? EPOCHS.length - 1 : Math.min(state.epoch, EPOCHS.length - 1), cur = viewEpoch() % EPOCHS.length, sig = state.lang + '|' + top;
  if (box._sig !== sig) {                          // кнопки створюються ОДИН раз (інакше клік губиться, коли вони перемальовуються між натисканням і відпусканням)
    box._sig = sig; box.innerHTML = '';
    for (let e = 0; e <= top; e++) {
      const bt = document.createElement('button');
      bt.type = 'button'; bt.className = 'btn lang-pick'; bt.dataset.ep = String(e);
      const n1 = document.createElement('span'); n1.textContent = t('epoch_' + e);
      const n2 = document.createElement('span'); n2.className = 'ev-earned';
      bt.append(n1, n2);
      bt.addEventListener('click', () => { if (e === viewEpoch() % EPOCHS.length || warp) return; if (animOn()) startWarp(e); else setEpochPreview(e); });
      box.appendChild(bt);
    }
  }
  box.querySelectorAll('button').forEach(bt => {   // далі оновлюються лише підписи й стан «вибрано»
    const e = +bt.dataset.ep, txt = '🪙 ' + fmt(Math.floor(e === state.epoch % EPOCHS.length ? state.coins : (state.epochEarned[e] || 0))), n2 = bt.querySelector('.ev-earned');
    if (n2.textContent !== txt) n2.textContent = txt;
    const on = String(e === cur);
    if (bt.getAttribute('aria-pressed') !== on) bt.setAttribute('aria-pressed', on);
  });
}
// Маленький піксельний замочок для закритих тем
let lockUrl = '';
function lockIconUrl() {
  if (lockUrl) return lockUrl;
  const cv = document.createElement('canvas'); cv.width = 12; cv.height = 14; const g = cv.getContext('2d');
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const D = '#4a3228', L = '#e8e0d4', M = '#a79d92';
  px(3, 0, 6, 1, D); px(2, 1, 1, 6, D); px(9, 1, 1, 6, D);                                  // дужка: контур
  px(3, 1, 6, 1, L); px(3, 2, 1, 5, L); px(8, 2, 1, 5, M); px(4, 2, 4, 1, D); px(4, 3, 1, 4, D); px(7, 3, 1, 4, D);
  px(1, 6, 10, 1, D); px(0, 7, 12, 7, D); px(1, 13, 10, 1, D);                               // корпус: контур
  px(1, 7, 10, 6, '#f2b84b'); px(1, 7, 10, 1, '#ffe08a'); px(1, 8, 1, 4, '#ffe08a');        // корпус: медове тіло й світла грань
  px(1, 11, 10, 2, '#d98a1d'); px(10, 8, 1, 4, '#d98a1d');                                   // тінь знизу й праворуч
  px(5, 8, 2, 2, D); px(6, 10, 1, 2, D); px(2, 8, 1, 1, '#fff4dc');                          // замкова шпарина й блік
  return (lockUrl = cv.toDataURL());
}
function lockImg(cls) { const im = document.createElement('img'); im.className = cls; im.alt = ''; im.src = lockIconUrl(); return im; }
function setSwitch(el, label, on) {
  const lb = el.querySelector('.sw-label'); if (lb.textContent !== label) lb.textContent = label;
  el.classList.toggle('on', !!on); el.setAttribute('aria-checked', String(!!on));
}
function updateSettingsUI() {
  if (ui.paneSettings.hidden) return;
  updateEpochViewUI();
  setSwitch(ui.setAnim, t('swAnim'), animOn());
  setSwitch(ui.setDayNight, t('swDayNight'), dayNightOn());
  const S = state.settings;
  setSwitch(ui.setBirds, t('swBirds'), S.birds);
  setSwitch(ui.setBirdsLate, t('swBirdsLate'), S.birdsLate);
  setSwitch(ui.setClouds, t('swClouds'), S.clouds);
  setSwitch(ui.setSteam, t('swSteam'), S.steam);
  setSwitch(ui.setRain, t('swRain'), S.rain);
  setSwitch(ui.setBigText, t('swBig'), S.bigText);
  setSwitch(ui.setVibrate, t('swVib'), S.vibrate);
  setSwitch(ui.setEco, t('swEco'), S.eco);
  ui.exportLast.textContent = exportLastText();
  ui.aboutInfo.textContent = t('aboutInfo', NEWS_VERSION);
  ui.setGender.querySelectorAll('button').forEach(b => { b.textContent = t('gender_' + b.dataset.gender); b.setAttribute('aria-pressed', String(b.dataset.gender === state.settings.gender)); });
  ui.setNumFmt.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fmt === state.settings.numFmt)));
  ui.setNumFmt.querySelectorAll('button').forEach(b => { b.textContent = t('numFmt_' + b.dataset.fmt); });
  ui.setLangBtns.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
}
function updateSeasonsUI() {
  if (ui.paneSeasons.hidden) return;
  ui.setTime.querySelectorAll('button').forEach(b => { b.textContent = t('time_' + b.dataset.time); });
  ui.setSeason.querySelectorAll('button').forEach(b => {
    const locked = b.dataset.season !== 'auto' && !themesUnlocked();
    b.textContent = t('season_' + b.dataset.season);
    b.classList.toggle('locked', locked);
    b.title = locked ? t('themeLocked') : '';
    if (locked) b.appendChild(lockImg('lock'));
    b.setAttribute('aria-pressed', String(b.dataset.season === state.settings.season && !locked));
  });
}
// Код збереження: «CTT7:» + текст у base64 — його можна скопіювати на інший пристрій
function makeExportCode() {
  const json = JSON.stringify({ v: CONFIG.SAVE_VERSION, state });
  return 'CTT' + CONFIG.SAVE_VERSION + ':' + btoa(unescape(encodeURIComponent(json)));
}
function parseImportCode(text) {
  const m = /^CTT\d+:([A-Za-z0-9+/=]+)$/.exec(text.replace(/\s+/g, ''));
  if (!m) throw new Error('format');
  const data = migrateSave(JSON.parse(decodeURIComponent(escape(atob(m[1])))));
  if (!data.state || typeof data.state !== 'object') throw new Error('state');
  return data;
}
// Коротко про те, що лежить у збереженні (щоб перед перенесенням було видно, чи це справді твій прогрес)
function saveSummary(st) {
  const lvl = Math.max(1, Math.min(LEVELS.length, Math.floor(st.shopLevel || 1)));
  const depts = (st.depts || []).reduce((a, b) => a + (b || 0), 0);
  const team = (st.team || []).filter(v => v > 0).length;
  return t('saveSummary', t('levelName_' + lvl), fmt(depts), team, fmt(st.crystalsTotal || 0), fmt(Math.floor(st.totalEarned || 0)));
}
function markExported() { state.lastExport = Date.now(); state.exportNag = state.lastExport; saveGame(); ui.exportLast.textContent = exportLastText(); }
function exportLastText() {
  if (!state.lastExport) return t('exportNever');
  const d = Math.floor((Date.now() - state.lastExport) / 864e5);
  return t('exportLast', d <= 0 ? t('exportToday') : t('exportDaysAgo', d));
}
// Раз на тиждень нагадуємо скопіювати код, якщо прогрес уже вартий збереження
function checkExportNag() {
  const now = Date.now(), last = Math.max(state.lastExport || 0, state.exportNag || 0);
  if (!last) { state.exportNag = now; saveGame(); return; }
  if (!(state.stats.timeTravels >= 1 || state.shopLevel >= 3) || now - last < 7 * 864e5) return;
  state.exportNag = now; saveGame(); showToast(t('exportNag'), 'good');
}
function showExport() {
  markExported();
  ui.exportBox.value = makeExportCode();
  ui.exportBox.select();
  ui.exportInfo.textContent = saveSummary(state);
}
function importSave() {
  let data;
  try { data = parseImportCode(ui.importBox.value); } catch (e) { showToast(t('importFail'), 'bad'); return; }
  askConfirm(t('importTitle'), t('importText') + '\n\n' + saveSummary(data.state), t('importYes'), () => {
    const fresh = createDefaultState();
    mergeInto(fresh, data.state);
    Object.assign(state, fresh);
    forceBakNext = true;
    saveGame();
    if (!storageOk) { showToast(t('importNoStorage'), 'bad'); return; }
    savingDisabled = true;
    location.reload();
  });
}
function hardReset() {
  savingDisabled = true;
  try { localStorage.removeItem(CONFIG.SAVE_KEY); localStorage.removeItem(SAVE_BAK_KEY); } catch (e) { /* нічого */ }
  location.reload();
}
function shareExport() {
  showExport();
  if (navigator.share) navigator.share({ text: ui.exportBox.value }).catch(() => {});
}
function copyExport() {
  markExported();
  ui.exportBox.value = makeExportCode();
  ui.exportInfo.textContent = saveSummary(state);
  ui.exportBox.focus(); ui.exportBox.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { /* нічого */ }
  if (!ok && navigator.clipboard) navigator.clipboard.writeText(ui.exportBox.value).then(() => showToast(t('exportCopied'), 'good'), () => {});
  else if (ok) showToast(t('exportCopied'), 'good');
}

// Тільки для перевірки (?debug=1): window.__show(рівень, епоха, час доби 0…1, сезон, меню відкрите) ставить гру в потрібний вигляд
if (/[?&]debug=1/.test(location.search)) window.__show = (L, ep, ph, season, panel) => {
  Storage.prototype.setItem = function () {};
  document.querySelectorAll('button').forEach(b => { if (/Пропустити/.test(b.textContent)) b.click(); }); if (ui.modalBtn) ui.modalBtn.click();
  state.settings.rain = false; state.settings.season = season || 'summer'; state.epoch = ep; state.activeEpoch = -1; state.shopLevel = L; state.team = state.team.map((v, i) => (i < 8 ? 3 : 0)); state.dayPhase = ph; state.settings.panelOpen = !!panel;
  recalcIncome(); try { rebuildEpochLayers(); } catch (e) { /* ок */ } rebuildShop(true); syncActors(); layoutScene(); applyPanel(); document.querySelectorAll('.toast').forEach(e => e.remove()); return 'ok';
};
// Режим тестування (?debug=1): швидко перевірити баланс
function debugHour() {
  const add = state.cps * 3600;
  state.coins += add; state.totalEarned += add; state.playTime += 3600;
  const shift = 3600000;
  ['nextSale', 'saleUntil', 'nextTrouble', 'incomeBoostUntil', 'tapBoostUntil'].forEach(k => { if (state.events[k]) state.events[k] -= shift; });
  if (state.wheel.lastSpin) state.wheel.lastSpin -= shift;
  updateUI();
}
function debugX100() {
  const add = Math.max(100, state.coins * 99);
  state.coins += add; state.totalEarned += add;
  updateUI();
}

