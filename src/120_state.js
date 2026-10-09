//#part 120_state.js
/* =====================================================================
   СТАН ГРИ (весь стан — в одному об'єкті state)
   ===================================================================== */

function createDefaultState() {
  return {
    lang: null,                        // 'uk' | 'en'; null — ще не обрано
    coins: CONFIG.START_COINS,
    totalEarned: CONFIG.START_COINS,
    taps: 0,
    tapPower: CONFIG.START_TAP_POWER,
    cps: 0,                            // дохід за секунду (рахується з відділів)
    shopLevel: 1,                      // 1 = крамничка ... 6 = торговий центр
    depts: DEPARTMENTS.map(() => 0),   // скільки штук кожного відділу куплено
    team: TEAM.map(() => 0),           // рівень кожного звірятка: 0 — не найняте, 1…10
    teamPlus: TEAM.map(() => 0),       // прокачування звірятка після 10-го рівня (0…30): кожні 10 дають зірку, бонус росте з кожним; скидаються з подорожжю разом із рівнями
    story: { done: 0, shnyrFriend: false, finale: false, nights: 0, guests: [0, 0, 0, 0, 0, 0, 0, 0, 0], choices: [0, 0, 0, 0, 0, 0, 0, 0, 0], shnyrJoined: false, help: [0, 0, 0, 0, 0, 0, 0, 0, 0], thx: [0, 0, 0, 0, 0, 0, 0, 0, 0] },   // done — скільки глав прочитано; nights — скільки ночей минуло після торгового центру (потрібно 3)
    // Події: час (мс від 1970 р.) наступного розпродажу / неприємності та активні бусти
    events: { nextSale: 0, saleUntil: 0, nextTrouble: 0, incomeBoostUntil: 0, incomeBoostMult: 1, tapBoostUntil: 0, tapBoostMult: 1, nextMail: 0, mailPending: 0 },
    wheel: { lastSpin: 0, streak: 0 },                       // колесо фортуни
    stats: { ghostsCaught: 0, raccoonsCaught: 0, raccoonsLost: 0, wheelSpins: 0, timeTravels: 0, puddlesFixed: 0, deptsBought: 0, milestones: 0, teamMaxLevel: 0, maxLevel: 1, holidaysSeen: 0, jackpots: 0, teamUps: 0, vipTaps: 0 },
    // звук 0…1; анімації; формат чисел; стать гравця ('f' / 'm'); день і ніч; чи відкрите меню; чи бачив підказку про гортання
    settings: { musicVol: 0.6, sfxVol: 0.8, musicStyle: 0, muted: false, animations: true, rain: false, birds: true, noFly: false, birdsLate: false, eco: false, ecoAsked: false, clouds: true, steam: true, vibrate: true, bigText: false, events: 0, numFmt: 'short', gender: 'f', dayNight: true, panelOpen: true, panHintSeen: false, season: 'auto' },
    dayPhase: 0.3,                     // час доби 0…1: 0.25 — схід сонця, 0.5 — полудень, 0.75 — захід, 0 — північ
    epochIntroSeen: -1,                // для якої епохи вже показали заставку-анімацію
    ghosts: 0,                         // кристали привидів (їх дають за ловлю привидів на Хелловін; 12 штук = ще один оберт колеса)
    // Подорож у часі: кристали, епоха, покращення майстерні, знайомі звірята
    crystals: 0, crystalsTotal: 0, shards: 0, shardsTotal: 0, shardsInit: 0, epoch: 0, runStartEarned: 0,
    circus: { next: 0, phase: 0, spun: 0, hag: 0 },   // цирк Фортуни: коли наступний, на якому він етапі, чи вже крутили колесо
    daily: { day: '', k: [0, 0, 0], b: [0, 0, 0], t: [1, 1, 1], c: [0, 0, 0], bonus: 0, seen: '' },     // завдання дня: який вид, з якого значення рахуємо, ціль, забрано чи ні
    lastExport: 0, exportNag: 0,              // коли востаннє копіювали код збереження / показали нагадування (мс)
    skinsMask: 0,                             // виграні скіни (біти за списком SKIN_POOL)
    skinsMask2: 0,                            // виграні скіни з номерами 32 і далі
    skinsSeen2: 0,
    seasonsIntro: 0,                          // вже показали віконце «пори року відкрито»
    newsGift: 0,                              // 1 — подарунок від розробників (розділ «Про нас» у газеті) вже забрано
    newsSeen: 0,                              // остання прочитана новина з червоної скриньки
    skinsSeen: 0,                             // які з виграних скінів гравець уже бачив у вкладці (для мигаючої точки)
    skins: { capy: -2, shop: -1, weather: -1, street: -1, hero: -1 },   // який скін зараз вдягнено в кожній групі (номер у SKIN_POOL, -1 — звичайний вигляд)
    epochEarned: [0, 0, 0, 0, 0, 0, 0, 0],   // зароблено монет у кожній епосі
    warpSeen: 0,                             // чи бачив гравець повну анімацію подорожі (потім її можна пропустити дотиком)
    epochSeen: -1, activeEpoch: -1,          // до якої суми заробіток уже розписано по епохах; обрана епоха (-1 — поточна)
    ws: WORKSHOP.map(() => 0),
    teamKnown: TEAM.map(() => 0),
    ach: ACHIEVEMENTS.map(() => 0),     // 1 — досягнення отримано
    tutorialDone: false,
    cutSeen: false,                    // вступну заставку з Мел і Нікою вже показано
    buyMode: 1,                        // 1 | 10 | 100 | 'max'
    pendingOffline: 0,                 // офлайн-заробіток, який ще не забрали
    tab: 'shop',
    playTime: 0,                       // секунд у грі
    savedAt: 0
  };
}
const state = createDefaultState();

/* ---------- Відділи й дохід ---------- */

// Скільки віх уже пройдено при такій кількості
function milestonesReached(count) {
  return CONFIG.MILESTONES.filter(m => count >= m).length;
}
function nextMilestone(count) {
  const m = CONFIG.MILESTONES.find(x => count < x);
  return m === undefined ? null : m;
}
function levelMult(level = state.shopLevel) {
  return Math.pow(CONFIG.LEVEL_MULT, level - 1);
}
/* ---------- Бонуси команди ---------- */
function teamLevelOf(id) {
  const i = TEAM.findIndex(m => m.id === id);
  return i < 0 ? 0 : state.team[i];
}
// Зірки звіряток: після 10-го рівня прокачування тривають, кожні 10 дають зірку (до трьох). Зірка 1 / 2 / 3 доводить бонус до ×1,25 / ×1,5 / ×2,
// а кожне з 10 прокачувань між зірками додає свою десяту частину приросту. Ціна: ціна 10-го рівня ×1,1 за кожне наступне прокачування
const STAR_MULT = [1, 1.25, 1.5, 2], STAR_MAX = 3, STAR_STEP = 10, PLUS_MAX = STAR_MAX * STAR_STEP;
const STAR_HARD_CAP = { expandCost: 0.6, thief: 0.8, deptCost: 0.35 };          // зі зірками обмеження «дешевше» й «рідше єнот» теж ростуть, але не безмежно
function teamPlusOf(i) { return Math.min(PLUS_MAX, (state.teamPlus && state.teamPlus[i]) | 0); }
function teamStarsOf(i) { return Math.floor(teamPlusOf(i) / STAR_STEP); }
function starMultAt(plus) {                                                                // множник бонусу після plus прокачувань понад 10-й рівень (росте плавно між зірками)
  const k = Math.min(STAR_MAX, Math.floor(plus / STAR_STEP));
  return k >= STAR_MAX ? STAR_MULT[STAR_MAX] : STAR_MULT[k] + (STAR_MULT[k + 1] - STAR_MULT[k]) * (plus % STAR_STEP) / STAR_STEP;
}
function starMult(i) { return starMultAt(teamPlusOf(i)); }
function plusCost(i, n) { return teamCost(i, CONFIG.TEAM_MAX_LEVEL) * Math.pow(CONFIG.TEAM_PLUS_GROWTH, n); }          // n — номер прокачування понад 10-й рівень (1…30)
// Сума бонусів одного типу від усіх найнятих звіряток (значення × рівень × множник зірок), з обмеженням cap
function teamBonus(type, field = 'per') {
  let sum = 0;
  TEAM.forEach((m, i) => {
    if (m.bonus.type !== type || state.team[i] <= 0) return;
    const sm = starMult(i);
    let v = m.bonus[field] * state.team[i] * sm;
    if (field === 'per' && m.bonus.cap !== undefined) v = Math.min(v, m.bonus.cap * sm, STAR_HARD_CAP[type] || Infinity);
    sum += v;
  });
  return sum;
}
// Множник доходу відділу i від звіряток (Зоя, Михась, Мурзик, Жужа)
function teamDeptMult(i) {
  let mult = 1;
  TEAM.forEach((m, k) => {
    if (m.bonus.type === 'deptIncome' && state.team[k] > 0 && m.bonus.depts.includes(i)) mult *= 1 + m.bonus.per * state.team[k] * starMult(k);
  });
  return mult;
}
function teamGlobalMult() { return 1 + teamBonus('global'); }
// Рівень покращення майстерні (за кристали)
function wsLevel(id) { const i = WORKSHOP.findIndex(w => w.id === id); return i < 0 ? 0 : state.ws[i]; }
function eraStep(n) { return n < 8 ? 1.8 : 1.5; }                                         // у скільки разів росте дохід і тап за подорож номер n+1
function eraMult() { const n = (state.stats && state.stats.timeTravels) || 0; let m = 1; for (let i = 0; i < n; i++) m *= eraStep(i); return m; }
function crystalMult() { return 1 + CONFIG.CRYSTAL_INCOME_BONUS * state.shardsTotal; }       // кожен осколок часу, здобутий за подорожі, дає +2% до доходу
function costMult() { return (1 - teamBonus('deptCost')) * (1 - 0.02 * wsLevel('cheaperDepts')); }              // Тома: відділи дешевші
function expandCostMult() { return 1 - teamBonus('expandCost'); }       // Бодя: розширення дешевші
function offlineRate() { return Math.min(1, CONFIG.OFFLINE_RATE + teamBonus('offline', 'rate') + 0.05 * wsLevel('offlineRate')); }          // Соня
function offlineMaxHours() { return CONFIG.OFFLINE_MAX_HOURS + teamBonus('offline', 'hours') + 4 * wsLevel('offlineHours'); }
// Для наступних етапів: шанс появи єнота (Тоня), сила свят (Пао), швидкість ремонту (Кря)
function thiefChanceMult() { return (1 - teamBonus('thief')) * (1 - 0.1 * wsLevel('thiefLess')); }
function eventPowerMult() { return 1 + teamBonus('event'); }
function fixSpeedMult() { return 1 + teamBonus('fix'); }

// Дохід одної штуки відділу (з віхами, рівнем магазину й бонусом звіряток)
function deptIncomeEach(i) {
  const d = DEPARTMENTS[i];
  return d.baseIncome * Math.pow(CONFIG.MILESTONE_MULT, milestonesReached(state.depts[i])) * levelMult() * teamDeptMult(i) *
    (1 + holidayDeptBonus(i) * eventPowerMult());
}
// Тимчасові множники: розпродаж, чорна п'ятниця, свято, бусти з колеса, протікання даху (Пао підсилює свята й розпродажі)
function tempIncomeMult() {
  const now = Date.now(), power = eventPowerMult();
  let m = 1;
  if (theme.blackFriday) m *= 1 + (CONFIG.BLACK_FRIDAY_MULT - 1) * power;
  else if (state.events.saleUntil > now) m *= 1 + (CONFIG.SALE_MULT - 1) * power;
  m *= 1 + holidayGlobalBonus() * power;
  if (state.events.incomeBoostUntil > now) m *= state.events.incomeBoostMult;
  if (trouble && trouble.type === 'leak') m *= 1 - CONFIG.LEAK_INCOME_PENALTY;
  return m;
}
function tapBoostMult() { return state.events.tapBoostUntil > Date.now() ? state.events.tapBoostMult : 1; }
// Перерахунок похідних величин
function recalcIncome() {
  let sum = 0;
  DEPARTMENTS.forEach((d, i) => { sum += state.depts[i] * deptIncomeEach(i); });
  state.cps = sum * teamGlobalMult() * tempIncomeMult() * crystalMult() * eraMult();
}
// Скільки монеток дає один тап: база × рівень магазину + частка доходу за секунду, ще × бонус Голки.
// Тож тап росте разом з доходом: 1 → десятки → сотні → тисячі → мільйони…
function tapValue() {
  const base = state.tapPower * levelMult() * eraMult() + state.cps * CONFIG.TAP_CPS_SHARE;
  return base * (1 + teamBonus('tap')) * (1 + 0.1 * wsLevel('tapPower')) * tapBoostMult();
}
function isDeptUnlocked(i) {
  return DEPARTMENTS[i].level <= state.shopLevel;
}

// Ціна n штук відділу i, якщо вже куплено count
function deptCost(i, n, count = state.depts[i]) {
  const r = CONFIG.COST_GROWTH;
  return DEPARTMENTS[i].baseCost * costMult() * Math.pow(r, count) * (Math.pow(r, n) - 1) / (r - 1);
}
// Скільки штук можна купити на всі наявні монетки
function maxAffordable(i, coins = state.coins) {
  const r = CONFIG.COST_GROWTH;
  const first = DEPARTMENTS[i].baseCost * costMult() * Math.pow(r, state.depts[i]);
  if (!(coins >= first)) return 0;
  let n = Math.floor(Math.log(1 + coins * (r - 1) / first) / Math.log(r));
  if (!isFinite(n)) return 0;
  n = Math.min(n, 100000);
  while (n > 0 && deptCost(i, n) > coins) n--;
  while (n < 100000 && deptCost(i, n + 1) <= coins) n++;
  return n;
}
// Скільки штук покаже кнопка зараз (для МАКС — скільки реально можна купити, мінімум 1)
function plannedBuy(i) {
  if (state.buyMode === 'max') return Math.max(1, maxAffordable(i));
  return state.buyMode;
}

/* ---------- Розширення магазину ---------- */
function nextLevelDef() {
  return state.shopLevel < LEVELS.length ? LEVELS[state.shopLevel] : null;
}
// Щоб перейти на новий рівень, треба найняти лише нових звірят цього рівня (хто вже відкритий); тих, кого наймали раніше, не питаємо
function hireRequirements() {
  return TEAM.map((m, i) => i).filter(i => TEAM[i].level === state.shopLevel && isTeamUnlocked(i));
}
const HIRE_BY_STAGE = [2, 2, 2, 3, 3];                 // звірят поточного етапу прокачати до 2-го (ранні етапи) або 3-го (пізні) рівня
function hireLevel() { return HIRE_BY_STAGE[Math.min(HIRE_BY_STAGE.length, state.shopLevel) - 1] || 3; }
function requirementsMet(def) {
  return def.requires.every(r => state.depts[r.dept] >= r.count) && hireRequirements().every(i => state.team[i] >= hireLevel());
}
function expandCost(def) { return def.cost * expandCostMult(); }

/* ---------- Команда: найм і прокачка ---------- */
function isTeamUnlocked(i) { return TEAM[i].level <= state.shopLevel && (!TEAM[i].needs || !!state.story[TEAM[i].needs]); }
// Ціна переходу звірятка на рівень lvl (lvl = 1 — найм)
function teamCost(i, lvl) {
  const known = lvl === 1 && state.teamKnown[i] ? CONFIG.TEAM_KNOWN_DISCOUNT : 1;   // знайоме звірятко наймати дешевше
  return TEAM[i].baseCost * Math.pow(CONFIG.TEAM_LEVEL_COST_GROWTH, lvl - 1) * known * (1 - 0.02 * wsLevel('cheaperTeam'));
}

