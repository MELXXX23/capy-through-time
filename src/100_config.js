<!--#part 100_config.js-->
<script>
'use strict';

// ---- Прихований «режим бога» власника ----
// Вмикається вставленням коду GOD:<пароль> у поле імпорту прогресу (Налаштування). У грі лишається лише SHA-256 пароля;
// сам пароль — у backups/god_secret.txt (його видає tools/godcode.js). Прапорець живе в localStorage окремо від збереження.
const GOD_HASH = '03f36ce107f620f4bfa0881b4cedfe8b6e7c7a674dacce8d600168fef7583f0c';
function sha256hex(str) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = Array.from(unescape(encodeURIComponent(str))).map(ch => ch.charCodeAt(0));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 255);
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < bytes.length; off += 64) {
    const w = new Array(64);
    for (let i = 0; i < 16; i++) w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
const GOD_ON = (() => { try { return localStorage.getItem('capyGod') === GOD_HASH; } catch (e) { return false; } })();

/* =====================================================================
   КОНФІГИ (усі ігрові дані — тут, на початку скрипту)
   ===================================================================== */

// Журнал помилок для «Звіту» в налаштуваннях (останні 15)
const errLog = [];
function logErr(kind, msg, src, line, col, stack) {
  const clean = s => String(s || '').replace(/(?:file:\/\/\/|[A-Za-z]:[\\/])[^\s)]*[\\/]/g, '');
  if (errLog.length >= 15) errLog.shift();
  errLog.push({ at: new Date().toISOString().slice(11, 19), kind, msg: clean(msg).slice(0, 200), src: clean(src), line: line || 0, col: col || 0, stack: clean(stack).split('\n').slice(0, 4).join(' | ').slice(0, 400) });
}
window.addEventListener('error', e => logErr('error', e.message, e.filename, e.lineno, e.colno, e.error && e.error.stack));
window.addEventListener('unhandledrejection', e => logErr('promise', e.reason && e.reason.message ? e.reason.message : e.reason, '', 0, 0, e.reason && e.reason.stack));

const CONFIG = {
  SCENE_W: 320,               // внутрішня ширина сцени (пікселів)
  SCENE_H: 180,               // внутрішня висота сцени
  OPEN_EXTRA: 60,             // ПК: коли меню відкрите, камера «відїжджає»: у кадр додається стільки рядків неба й дороги (масштаб менший)
  EXTRA_BOTTOM: 36,           // скільки рядків бруківки додається знизу, щоб було більше видно й де гуляти
  MAX_VIEW_W: 2600,            // найширша сцена на великому екрані (пікселів сцени)
  MIN_VIEW_W: 296,            // на вузькому вікні масштаб збільшується, а краї «ядра» (до 12 пікселів) можуть не поміститися
  MAX_OFF_Y: 700,             // скільки додаткового неба можна додати зверху на високому екрані
  WORLD_W: 1400,              // ширина всієї вулиці на ПК (пікселів сцени): її можна гортати стрілками ◀ ▶
  MOBILE_PAD: 360,             // на телефоні вулиця ширша за екран на стільки пікселів з кожного боку (гортається пальцем)
  DAY_SECONDS: 300,           // скільки секунд триває повна доба (день + ніч)
  CIRCUS_FIRST_MINUTES: 5,     // перший «!» цирку з'являється через 4 хвилини гри
  CIRCUS_HOURS: 24,            // раз на 24 ігрові години, тобто щодоби гри (CONFIG.DAY_SECONDS)
  CIRCUS_BANG_SECONDS: 40,     // скільки секунд висить «!», поки гравець не натисне
  CIRCUS_DRIVE_SECONDS: 5,     // скільки їде цирк справа наліво
  CIRCUS_SETUP_SECONDS: 5,     // скільки розкладається шатро
  MAIL_MINUTES: 40,           // поштова машина приїздить раз на 40 хвилин
  MAIL_FIRST_SECONDS: 90,     // перша — через 90 секунд після початку гри
  SUMMER_REST_MIN: 20,        // влітку звірятка раз на 20–38 секунд зупиняються перепочити й попити водички
  SUMMER_REST_MAX: 38,
  SUMMER_REST_SECONDS: 6,     // скільки триває перепочинок
  GHOST_HUNT_MIN_SECONDS: 240, // «Полювання на привидів» на Хелловін: раз на 4–6 хвилин
  GHOST_HUNT_MAX_SECONDS: 360,
  CREATURE_INTERVAL_SECONDS: 300, // герої епох: з'являються (до двох за раз) раз на 5 хвилин
  GHOST_COUNT: 6,             // скільки привидів вилітає
  GHOST_SECONDS: 16,          // скільки секунд їх можна ловити
  GHOST_MAX: 99,              // найбільше кристалів привидів у скарбничці
  GHOST_RESPIN_COST: 12,      // скільки кристалів привидів коштує додатковий оберт колеса фортуни
  SAVE_KEY: 'capyThroughTime_save',
  SAVE_VERSION: 18,            // номер версії збереження (збільшуємо, коли змінюється формат)
  AUTOSAVE_SECONDS: 10,
  START_COINS: 1,             // Капі приїздить з однією монеткою
  START_TAP_POWER: 1,
  MAX_DT: 0.25,               // найбільший крок часу за кадр (секунд)
  MAX_COIN_PARTICLES: 40,
  MAX_SPARKS: 40,
  MAX_DUST: 60,
  MAX_FLOATERS: 14,
  TAP_COINS_MIN: 2,           // скільки монеток вилітає за один тап
  TAP_COINS_MAX: 4,
  UI_REFRESH_SECONDS: 0.1,

  // Тап: сила тапу росте разом з доходом — тап = база × множник рівня + частка доходу за секунду
  TAP_CPS_SHARE: 0.25,

  // Подорож у часі (престиж)
  CRYSTAL_DIVISOR: 5e12,          // кристали = floor(√(зароблено за цей забіг / 5·10¹²))
  CRYSTAL_INCOME_BONUS: 0.01,     // кожен осколок дає +1% до всього доходу
  TEAM_KNOWN_DISCOUNT: 0.3,       // знайомих звіряток наймати за 30% ціни
  WARP_SECONDS: 4.4,              // тривалість анімації подорожі

  // Розпродажі
  SALE_MIN_MINUTES: 15,           // розпродаж раз на 15–25 хвилин
  SALE_MAX_MINUTES: 25,
  SALE_SECONDS: 120,              // триває 2 хвилини
  SALE_MULT: 2,                   // ×2 до доходу
  BLACK_FRIDAY_MULT: 3,           // чорна п'ятниця: ×3 увесь день

  // Неприємності (раз на 20–30 хвилин, після 3-ї глави)
  TROUBLE_MIN_MINUTES: 20,
  TROUBLE_MAX_MINUTES: 30,
  LEAK_INCOME_PENALTY: 0.25,      // протікання: −25% доходу
  LEAK_PUDDLES: 5,                // скільки калюж натапати
  KRIA_CLEAN_SECONDS: 10,         // Кря прибирає одну калюжу за стільки секунд (поділити на швидкість ремонту)
  RACCOON_SECONDS: 9,             // скільки Шнирь бігає
  RACCOON_HITS: 5,                // скільки разів треба влучити
  RACCOON_STEAL_SHARE: 0.05,      // краде 5% монеток...
  RACCOON_STEAL_MAX_MINUTES: 10,  // ...але не більше 10 хвилин доходу
  RACCOON_REWARD_MINUTES: 4,      // за перемогу — 4 хвилини доходу

  // Колесо фортуни
  WHEEL_COOLDOWN_HOURS: 24,
  WHEEL_STREAK_STEP: 0.25,        // кожен день серії дає +25% до призів
  WHEEL_STREAK_MAX_DAYS: 8,
  WHEEL_SPIN_SECONDS: 4.6,

  // Прикраси
  SNOW_FLAKES: 70,
  BATS: 8,

  // Діалоги
  DIALOG_CHARS_PER_SEC: 38,       // швидкість «друкарської машинки»
  STORY_CHECK_SECONDS: 0.5,

  // Команда
  TEAM_MAX_LEVEL: 10,
  TEAM_PLUS_GROWTH: 1.1,          // після 10-го рівня кожне з 30 «зіркових» прокачувань коштує ×1,1 до попереднього (10 прокачувань = зірка)
  TEAM_LEVEL_COST_GROWTH: 2.3,    // ціна кожного наступного рівня звірятка ×2,3 (було 2,2: зірки дають більше сили, тож прокачка трохи важча)
  BUBBLE_SECONDS: 3.4,            // скільки висить бульбашка з фразою
  CHATTER_MIN: 16,                // раз на 16–34 секунди хтось із команди щось каже сам
  CHATTER_MAX: 34,

  // Відділи
  COST_GROWTH: 1.15,          // ціна наступного = базова × 1,15^кількість
  MILESTONES: [25, 50, 100, 200],   // віхи: на кожній — ×2 до доходу відділу
  MILESTONE_MULT: 2,
  LEVEL_MULT: 2,              // кожен рівень магазину дає ×2 до всього доходу
  BUY_MODES: [1, 10, 100, 'max'],

  // Офлайн-заробіток
  OFFLINE_RATE: 0.5,          // 50% доходу
  OFFLINE_MAX_HOURS: 12,
  OFFLINE_MIN_SECONDS: 60,    // коротші відсутності не рахуємо

  // Будівництво нового рівня
  BUILD_SECONDS: 8.5,

  // Покупці
  MAX_CUSTOMERS: 10,          // обмеження для продуктивності

  // Тости
  TOAST_SECONDS: 3.2,
  MAX_TOASTS: 4
};

// Мови: id, підпис на кнопці
const LANGS = [
  { id: 'uk', label: 'UA' },
  { id: 'en', label: 'EN' }
];

// Вкладки панелі. ready: true — вже працює; false — з'явиться на наступних етапах
const TABS = [
  { id: 'shop',        icon: '🏪', ready: true  },
  { id: 'departments', icon: '🛒', ready: true  },
  { id: 'team',        icon: '🐾', ready: true  },
  { id: 'story',       icon: '📖', ready: true  },
  { id: 'workshop',    icon: '⏳', ready: true, needs: 'finale' },   // з'являється після фіналу сюжету
  { id: 'skins',       icon: '👗', ready: true },
  { id: 'seasons',    icon: '🍂', ready: true, lock: 'themes' },   // замок до проходження 2-ї епохи
  { id: 'achievements', icon: '🏆', ready: true },
  { id: 'settings',    icon: '⚙️', ready: true }
];

// Товари в кожній епосі: іконки відділів (назви — у словнику, ключі good_епоха_відділ) і що лежить на полицях
const EPOCH_GOODS_ICONS = [["🕯️","🍯","🪶","🪆","🧼","🍎","🥖","👘","🥾","🔭","🍷","🎭"],["💌","🍦","📓","🚂","🧽","🥫","🍩","👗","👞","📺","🍔","🎞️"],["🪩","🍭","💿","🪀","💄","🍍","🥐","🕺","👢","📼","🍕","💃"],["🪙","🥤","📼","🎮","🔋","🍌","🍪","🧥","👟","🕹️","🌭","📹"],["💾","🍫","🖱️","🐣","🔌","🥗","☕","👕","👟","💻","🍣","📡"],["♻️","🥜","📒","🪵","🧴","🥕","🍞","🧶","🥿","🔆","🥗","🌳"],["⭐","🧃","🪐","🚀","🧪","🌱","🍙","🧑‍🚀","👢","🛰️","🍜","🌌"],["💡","🧋","🖊️","🤖","🫧","🍇","🍰","🧥","🛹","🥽","🍢","🎆"]];
const EPOCH_GOODS_KINDS = [["candle","jar","scroll",null,null,null,null,null,null,"scroll","cup","mask"],[null,"cone","scroll",null,null,"jar",null,null,null,null,null,"cassette"],["bulb","cone","record",null,"tube",null,null,null,null,"cassette",null,"bulb"],[null,"cup","cassette","gamepad","tube",null,null,null,null,"gamepad",null,"cassette"],["cassette","cup","laptop",null,"tube",null,"cup",null,null,"laptop",null,"laptop"],[null,"jar",null,null,"tube",null,null,null,null,"solar","plant","plant"],[null,"tube",null,"rocket","tube","plant",null,null,null,"robot","cup","bulb"],["bulb","cup","laptop","robot","tube",null,"cone","bulb",null,"visor","cup","bulb"]];
function deptIcon(i) { return EPOCH_GOODS_ICONS[viewEpoch() % EPOCH_GOODS_ICONS.length][i] || DEPARTMENTS[i].icon; }
function deptName(i) { return t('good_' + (viewEpoch() % EPOCH_GOODS_ICONS.length) + '_' + i); }

// Відділи: від дешевих до дорогих (ціна ≈ ×11, дохід ≈ ×7 на кожному кроці).
// level — на якому рівні магазину відділ відкривається; display — що лежить у вітрині
const DEPARTMENTS = [
  { id: 'trinkets',    icon: '🧷', level: 1, baseCost: 15,      baseIncome: 0.1,   display: 'trinkets' },
  { id: 'sweets',      icon: '🍬', level: 1, baseCost: 240,     baseIncome: 0.7,   display: 'sweets' },
  { id: 'stationery',  icon: '✏️', level: 2, baseCost: 3.7e3,   baseIncome: 5,     display: 'stationery' },
  { id: 'toys',        icon: '🧸', level: 2, baseCost: 5.8e4,   baseIncome: 35,    display: 'toys' },
  { id: 'cleaning',    icon: '🧴', level: 3, baseCost: 8.8e5,   baseIncome: 250,   display: 'cleaning' },
  { id: 'produce',     icon: '🍎', level: 3, baseCost: 1.3e7,   baseIncome: 1.7e3, display: 'produce' },
  { id: 'bakery',      icon: '🥐', level: 4, baseCost: 2.1e8,   baseIncome: 1.2e4, display: 'bakery' },
  { id: 'clothes',     icon: '👕', level: 4, baseCost: 3.3e9,   baseIncome: 8.5e4, display: 'clothes' },
  { id: 'shoes',       icon: '👟', level: 5, baseCost: 5e10,   baseIncome: 6e5,   display: 'shoes' },
  { id: 'electronics', icon: '📺', level: 5, baseCost: 7.6e11,  baseIncome: 4.2e6, display: 'electronics' }
];                                                       // торговий центр не додає нових відділів (фудкорт і кінотеатр прибрано)

// Рівні магазину. cost — ціна «Розширення»; requires — які відділи і скільки штук потрібно мати
const LEVELS = [
  { cost: 0,      requires: [] },
  { cost: 1.4e3,  requires: [{ dept: 0, count: 25 }, { dept: 1, count: 15 }] },
  { cost: 2.7e5,  requires: [{ dept: 2, count: 28 }, { dept: 3, count: 18 }] },
  { cost: 6.5e7,  requires: [{ dept: 4, count: 31 }, { dept: 5, count: 21 }] },
  { cost: 1.6e10, requires: [{ dept: 6, count: 34 }, { dept: 7, count: 24 }] },
  { cost: 4.1e12, requires: [{ dept: 8, count: 37 }, { dept: 9, count: 27 }] }
];

// Вигляд будівлі кожного рівня.
// w — ширина; top — висота даху над вивіскою; upper — верхні поверхи (знизу вгору):
// bay = вітрина з двома відділами, win = звичайне вікно. Решта — кольори й стиль.
// Магазин — «відкритий розріз»: крізь скляний фасад видно поверхи, стелажі відділів, ескалатори й покупців-звірят.
// floors — скільки стелажів (по 2 відділи) на кожному поверсі, знизу вгору; 0 — верхній поверх-кафе (столики, лампи) без відділів. Кожен рівень, починаючи з 2-го, має такий додатковий поверх.
const FLOOR_H = 36;               // висота верхнього поверху (пікселів)
const SHOP_LOOK = [
  { w: 140, top: 12, floors: [1], inner: ['q'], wall: 'w', line: 'y', roof: 0, awning: ['r', 'w'], door: 0, signFill: 'd', trim: 'b' },
  { w: 176, top: 24, floors: [2, 0], inner: ['y', 'S'], wall: 'y', line: 'h', roof: 1, awning: ['g', 'w'], door: 0, signFill: 'd', trim: 'b' },
  { w: 212, top: 16, floors: [2, 1, 0], inner: ['S', 'm', 'q'], wall: 'm', line: 'S', roof: 2, awning: ['n', 'w'], door: 1, signFill: 'd', trim: 'n' },
  { w: 250, top: 22, floors: [2, 2, 0], inner: ['m', 'q', 'S'], wall: 'w', line: 'E', roof: 3, awning: ['o', 'w'], door: 2, signFill: 'r', trim: 'e' },
  { w: 288, top: 28, floors: [2, 3, 0], inner: ['q', 'S', 'm'], wall: 'c', line: 'e', roof: 4, awning: ['u', 'w'], door: 3, signFill: 'd', trim: 'l' },
  { w: 326, top: 30, floors: [2, 2, 1, 0, -1], inner: ['m', 'q', 'S', 'y'], wall: 'S', line: 's', roof: 5, awning: ['n', 'S'], door: 4, signFill: 'n', trim: 'n' }
];
const DOOR_WIDTHS = [28, 28, 34, 38, 44];

// Типи покупців (звірятка). Спрайти складаються з тіла і двох кадрів ніг (див. SPRITES)
const CUSTOMER_TYPES = ['bunny', 'mouse', 'duck', 'dog', 'cat', 'pig', 'sheep', 'cow', 'squirrel', 'deer', 'raccoon', 'hedgehog', 'penguin', 'koala', 'tiger', 'monkey', 'hamster', 'chick', 'frog', 'foxcub'];
const BAG_COLORS = ['p', 'h', 'g', 'n', 'u'];

// Формат великих чисел: суфікси для перших розрядів, далі aa, ab, ac...
const NUMBER_FORMAT = {
  uk: { suffixes: ['', 'тис.', 'млн', 'млрд', 'трлн'], decimal: ',', space: ' ' },
  en: { suffixes: ['', 'K', 'M', 'B', 'T'],            decimal: '.', space: ''  }
};

// Розташування елементів на сцені (координати у пікселях сцени 320×180)
const LAYOUT = {
  horizonY: 124,   // задня межа тротуару (низ будинків)
  curbY: 134,      // бордюр — тут стоїть магазин
  streetTop: 136,  // початок бруківки
  centerX: 160,    // магазин стоїть по центру
  capy: { x: 212, footY: 146, flip: true },
  lane: { min: 158, max: 176 }   // смуга вулиці, по якій ходять покупці (ноги)
};

// Фонові будиночки
const MAX_HOUSE_H = 124;       // найвищий фоновий будинок після збільшення (рядків сцени)
const HOUSE_SCALE = 1.7;       // у скільки разів вищі за задані h (небо й горизонт не чіпаємо)
const HOUSES = [
  { x: -8,  w: 52, h: 66, wall: 'q', roof: 'r' },
  { x: 44,  w: 46, h: 54, wall: 'y', roof: 'b' },
  { x: 90,  w: 44, h: 70, wall: 'm', roof: 'n' },
  { x: 134, w: 62, h: 62, wall: 'c', roof: 'r' },
  { x: 196, w: 48, h: 60, wall: 'p', roof: 'b' },
  { x: 244, w: 46, h: 72, wall: 'y', roof: 'r' },
  { x: 290, w: 52, h: 58, wall: 'q', roof: 'n' }
];

// Хмаринки: x, y, швидкість (пікселів за секунду)
const CLOUDS = [
  { x: 20,  y: 14, speed: 3.0 },
  { x: 120, y: 38, speed: 2.0 },
  { x: 200, y: 10, speed: 3.6 },
  { x: 290, y: 44, speed: 2.4 }
];

// Палітра: кожна літера — колір. Усього 22 кольори + очі.
const PALETTE = {
  d: '#4a3228', // темно-коричневий
  b: '#7a4f35', // коричневий
  l: '#a8703f', // шерсть капібари
  c: '#dba46a', // пісочний
  h: '#f2b84b', // медовий
  y: '#ffe08a', // світло-жовтий
  w: '#fff4dc', // кремовий
  W: '#fde5c8', // теплий блідий (горизонт)
  r: '#c4553d', // цегляно-червоний
  o: '#e8863c', // помаранчевий
  p: '#ef8fa3', // рожевий
  q: '#ffc9d4', // світло-рожевий
  m: '#8ed4a6', // м'ятний
  g: '#4f9a63', // зелений
  G: '#2f6b48', // темно-зелений
  s: '#86cfe8', // небо
  S: '#c4ebf5', // світле небо
  n: '#3d5a8c', // синій
  u: '#8b6bb0', // фіолетовий
  e: '#9c9087', // камінь
  E: '#cfc5b8', // світлий камінь
  k: '#2a1d1a', // майже чорний
  X: '#2a1d1a', // око (верхній піксель)
  x: '#2a1d1a', // око (нижній піксель)
  t: '#c26b4a', // теракота
  T: '#3fa7a0', // бірюзовий
  P: '#6d3b6e', // сливовий
  f: '#ff5fa2', // яскраво-рожевий
  V: '#2b1a4f', // глибокий фіолетовий
  v: '#7a5cc9', // яскравий фіолетовий
  a: '#b8e3ff', // крижано-блакитний
  j: '#ff9e5e', // захід сонця
  J: '#f4748f', // корал
  z: '#1b2a4a', // темно-синій
  O: '#302418', // контур Капі
  B: '#bd8449', // шерсть Капі
  M: '#7c4830', // морда й вушко Капі
  L: '#9c6c3c', // світліші плями Капі
  K: '#140e0b', // око Капі
  R: '#7a2230', // бордовий
  N: '#33e6ff', // неоновий блакитний
  Y: '#c9d3e0'  // срібло
};

// Покупці: тіло 16×13 і по два кадри ніг (3 рядки). Дивляться вправо.
const CUSTOMER_PARTS = {
  bunny: {
    body: [
      '..........w..w..',
      '..........w..w..',
      '..........q..q..',
      '..........w..w..',
      '.........wwwwww.',
      '.........wwwwkw.',
      '..wwwwwwwwwwwwwp',
      '.wwwwwwwwwwwwww.',
      'wwwwwwwwwwwwwww.',
      '.wwwwwwwwwwww...',
      '.wwwwwwwwwwww...',
      '..wwwwwwwwww....',
      '...EEEEEEEE.....'
    ],
    legsA: ['...w.......w....', '...w.......w....', '..ww.......ww...'],
    legsB: ['.....w...w......', '.....w...w......', '....ww...ww.....']
  },
  mouse: {
    body: [
      '................',
      '................',
      '.........ee..ee.',
      '.........ep..pe.',
      '.........eeeeee.',
      '.........eeeeke.',
      '..eeeeeeeeeeeeep',
      '.eeeeeeeeeeeeee.',
      'peeeeeeeeeeeeee.',
      '.eeeeeeeeeeee...',
      '.eeeeeeeeeeee...',
      '..EEEEEEEEEE....',
      '...EEEEEEEE.....'
    ],
    legsA: ['...e.......e....', '...e.......e....', '..ee.......ee...'],
    legsB: ['.....e...e......', '.....e...e......', '....ee...ee.....']
  },
  duck: {
    body: [
      '................',
      '...........yyy..',
      '..........yyyyy.',
      '..........yyykyo',
      '..........yyyyyo',
      '..y.....yyyyy...',
      '.yyy..yyyyyyyy..',
      '.yyyyyyyyyyyyy..',
      'yyyyyyyyyyyyyy..',
      '.yyyywwwwyyyyy..',
      '.yyyywwwwyyyy...',
      '..yyyyyyyyyy....',
      '...yyyyyyyy.....'
    ],
    legsA: ['....o......o....', '....o......o....', '...oo.....oo....'],
    legsB: ['......o..o......', '......o..o......', '.....oo..oo.....']
  },
  dog: {
    body: [
      '................',
      '................',
      '..........lllll.',
      '.........lllllll',
      '.........blllklc',
      '.........bllllcc',
      'l........bbllcck',
      '.lllllllllllll..',
      '.llllllllllllll.',
      '.llllllllllllll.',
      '.llllllllllllll.',
      '.bbbbbbbbbbbbb..',
      '..bbbbbbbbbbb...'
    ],
    legsA: ['..l..l....l..l..', '..l..l....l..l..', '..bb.bb...bb.bb.'],
    legsB: ['...l..l..l..l...', '...l..l..l..l...', '...bb.bb.bb.bb..']
  }
};

// Команда звіряток. Спрайт 16×16 дивиться прямо, тож малюємо лише ліву половину голови (top, 10 рядків)
// — нижня частина тулуба спільна (body / belly / feet — літери палітри), а права половина дзеркалиться.
const TEAM_PARTS = {
  spike:   { body: 'b', belly: 'c', feet: 'd', top: ['...d.d.d', '..dlldbl', '.dlbdlbd', '.dbldblb', 'dlbbdlbb', 'dbblwwww', 'dbbbwXww', '.dbbwxww', '..dbwwkk', '...dwwwk'] },
  bodya:   { body: 'n', belly: 'y', feet: 'd', top: ['....hhhh', '...hhhhh', '..dhhhhh', '.ddddddd', '..dlllll', '.bdlXlll', '.bdlxlll', '..dlccck', '..dlcccw', '...dllll'] },
  sonia:   { body: 'b', belly: 'c', feet: 'o', top: ['.d......', '.dbd....', '..dbbbbb', '..dbbbbb', '..dyyybb', '..dyXybb', '..dyxybb', '..dyyybo', '...dbbbo', '....dddd'] },
  tonya:   { body: 'G', belly: 'm', feet: 'g', top: ['....nnnn', '...nnnnn', '..dnnnnh', '.ddddddd', '..dggggg', '..dgXggg', '..dgxggg', '..dgggmm', '..dggggg', '...dgggg'] },
  zoya:    { body: 'p', belly: 'q', feet: 'w', top: ['..dwd...', '..dqd...', '..dqd...', '..dwdddd', '..dwwwww', '..dwXwww', '..dwxwww', '..dqwwwp', '..dwwwww', '...dwwww'] },
  mikhas:  { body: 'l', belly: 'o', feet: 'b', top: ['.bb.....', '.bbddddd', '..dlllll', '..dlllll', '..dlllll', '..dlXlll', '..dlxlll', '..dlcccc', '..dlccck', '...dllll'] },
  pao:     { body: 'p', belly: 'q', feet: 'k', top: ['.kk.....', '.kkddddd', '..dwwwww', '..dwwwww', '..dwwwww', '..dkwkww', '..dkkkww', '..dwwwwk', '..dwwwww', '...dwwww'] },
  kria:    { body: 'y', belly: 's', feet: 'o', top: ['.......y', '...ddddd', '..dyyyyy', '..dyyyyy', '..dyyyyy', '..dyXyyy', '..dyxyyy', '..dyyooo', '...dyooo', '....dddd'] },
  leo:     { body: 'n', belly: 'w', feet: 'd', top: ['..d.....', '..dod...', '..dooddd', '..dooooo', '..dooooo', '..doXooo', '..doxooo', '..dowwwk', '..dowwww', '...dwwww'] },
  murzyk:  { body: 'u', belly: 'u', feet: 'e', top: ['..d.....', '..ded...', '..deeddd', '..deeeee', '..deeeee', '..deXeee', '..dexeee', '..deEEEp', '..deEEEE', '...deeee'] },
  zhuzha:  { body: 'p', belly: 'q', feet: 'g', top: ['.ddd....', '.dwkd...', '.dgggddd', '.dgggggg', '..dggggg', '..dggggg', '..dgggmm', '..dddddd', '..dgmmmm', '...dgggg'] },
  shnyr:   { body: 'e', belly: 'E', feet: 'k', top: ['..d.....', '..ded...', '..deeddd', '..deeeee', '..dkkkkE', '..dkwkkE', '..dkkkkE', '..deEEEk', '..deEEEE', '...deeee'] },
  toma:    { body: 'b', belly: 'c', feet: 'e', top: ['....dddd', '..ddEEEE', 'eedEEEEE', 'eqdEEEEE', 'eqdEEEEE', 'eqdEXEEE', 'eedExEEE', '.edEEEEE', '..dEEEEe', '...dEEEe'] }
};

// Звірятка-працівники. level — на якому рівні магазину можна найняти; baseCost — ціна найму (рівень 1);
// кожен наступний рівень коштує ×TEAM_LEVEL_COST_GROWTH. bonus — що дає (значення × рівень).
// spot — де стоїть на сцені: x (null — біля дверей, зі зсувом dx), y — ноги, move: stand / patrol (x…x2), prop — що тримає.
const TEAM = [
  { id: 'spike',  level: 1, baseCost: 100,    bonus: { type: 'tap', per: 0.5 },
    spot: { x: null, dx: -27, y: 139, move: 'stand', prop: 'register' } },
  { id: 'bodya',  level: 2, baseCost: 9.8e3,  bonus: { type: 'expandCost', per: 0.04, cap: 0.4 },
    spot: { f: 0.03, y: 155, move: 'stand', prop: 'hammer' } },
  { id: 'zoya',   level: 2, baseCost: 7.8e3,  bonus: { type: 'deptIncome', depts: [1, 3], per: 0.2 },
    spot: { f: 0.10, y: 146, move: 'stand', prop: 'tray' } },
  { id: 'tonya',  level: 3, baseCost: 1.2e6,  bonus: { type: 'thief', per: 0.06, cap: 0.6 },
    spot: { f: 0.985, y: 146, move: 'stand', prop: 'baton' } },
  { id: 'mikhas', level: 3, baseCost: 1.5e6,  bonus: { type: 'deptIncome', depts: [5, 6], per: 0.2 },
    spot: { f: 0.17, r: 14, y: 158, move: 'patrol', prop: 'box' } },
  { id: 'sonia',  level: 4, baseCost: 2.3e8,  bonus: { type: 'offline', rate: 0.03, hours: 1 },
    spot: { f: 0.24, y: 146, move: 'stand', prop: 'ledger' } },
  { id: 'kria',   level: 4, baseCost: 2.6e8,  bonus: { type: 'fix', per: 0.15 },
    spot: { f: 0.31, r: 14, y: 157, move: 'patrol', prop: 'broom' } },
  { id: 'zhuzha', level: 4, baseCost: 3e8,    bonus: { type: 'deptIncome', depts: [7, 8], per: 0.2 },
    spot: { f: 0.47, y: 156, move: 'stand', prop: 'dress' } },
  { id: 'leo',    level: 5, baseCost: 5.9e10, bonus: { type: 'global', per: 0.08 },
    spot: { f: 0.535, y: 147, move: 'stand', prop: 'clipboard' } },
  { id: 'pao',    level: 5, baseCost: 7.4e10, bonus: { type: 'event', per: 0.1 },
    spot: { f: 0.87, y: 147, move: 'stand', prop: 'megaphone' } },
  { id: 'murzyk', level: 6, baseCost: 1.4e13, bonus: { type: 'deptIncome', depts: [9], per: 0.2 },
    spot: { f: 0.60, y: 157, move: 'stand', prop: 'tablet' } },
  { id: 'toma',   level: 6, baseCost: 1.7e13, bonus: { type: 'deptCost', per: 0.02, cap: 0.2 },
    spot: { f: 0.93, r: 10, y: 158, move: 'patrol', prop: 'cart' } },
  { id: 'shnyr',  level: 2, baseCost: 3e4,    bonus: { type: 'global', per: 0.02 }, needs: 'shnyrJoined',
    spot: { f: 0.78, r: 12, y: 156, move: 'patrol', prop: 'none' } }
];
const TEAM_PHRASES = 16;  // скільки звичайних фраз у кожного звірятка (див. translations; є ще «холодні» взимку й загальні по епохах)
const CAPY_PHRASES = 16;
const lastLine = {};

// Сюжетні персонажі, яких не можна найняти (той самий спосіб збирання 16×16, що й у команди)
const SHNYR_HEAD = ['..d.....', '..ded...', '..deeddd', '..deeeee', '..dkkkkE', '..dkwkkE', '..dkkkkE', '..deEEEk', '..deEEEE', '...deeee'];
const shnyrWith = (rows, extra) => { const t = SHNYR_HEAD.slice(); Object.keys(extra || {}).forEach(k => { t[k] = extra[k]; }); rows.forEach((row, i) => { t[i] = row; }); return t; };
const NPC_PARTS = {
  shnyr: { body: 'e', belly: 'E', feet: 'k', top: SHNYR_HEAD },
  // Гості епох (кожен має свою історію): Піп, Зіна, Макс, Бітик, Лесик, Орбіт, Лумі, Бруно
  pip:   { body: 'k', belly: 'w', feet: 'o', top: ['...wwwww', '..dwwwww', '..dkkkkk', '.dkkkkkk', '.dkwwwww', '.dkwXwww', '.dkwxwwo', '.dkwwwwo', '..dkwwww', '...dkkkk'] },
  zina:  { body: 'w', belly: 'E', feet: 'k', top: ['.kk.....', '.kffffff', '.fdwkwkw', '.fdwwkww', '..dkwwkw', '..dwXwww', '..dwxwww', '..dwEEEE', '..dwEEEk', '...dwwww'] },
  maks:  { body: 'b', belly: 'c', feet: 'd', top: ['.bb.....', '.bbddddd', '..dbbbbb', '.dTTTTTT', 'ccdbbbbb', 'ccdbXccc', '.cdbxccc', '..dbcccc', '..dbccck', '...dcccc'] },
  bitik: { body: 'e', belly: 'S', feet: 'n', top: ['.......r', '.......d', '.dddddEE', '.dEEEEEE', '.dEkkkkk', '.dEkTkkk', '.dEkkkkk', '.dEkkkkk', '.dEkTTTT', '..dEEEEE'] },
  lesyk: { body: 'b', belly: 'c', feet: 'd', top: ['.b.b....', '.bbb.b.b', '..dbbbbb', '..dllllll', '..dlllll', '..dlXlll', '..dlxlll', '..dlcccc', '..dlccck', '...dllll'].map(x => x.slice(0, 8)) },
  orbit: { body: 'w', belly: 'S', feet: 'e', top: ['....SSSS', '..SSSSSS', '.SdllllL', '.SdlllLL', '.SlllbbL', '.SlXllll', '.SlxllLL', '.SlllcccL'.slice(0, 8), '..SlcccL', '...SSSSS'].map(x => x.slice(0, 8)) },
  lumi:  { body: 'y', belly: 'w', feet: 'h', top: ['.f.....f', '..f...f.', '..dddddd', '.dyyyyyy', '.dyyyyyy', '.dyXyyyy', '.dyxyyyy', '.dywwwww', '..dywwww', '...dyyyy'].map(x => x.slice(0, 8)) },
  bruno: { body: 'e', belly: 'E', feet: 'k', top: ['...rrrrr', '..rrrrrr', '..dwwkkw', '..dwwkkw', '..dkwwww', '..dwXwww', '..dwxwww', '..dkkkkk', '..dwwwww', '...dkwww'] },
  // Шнирь у різних ролях (костюми епох)
  pietro: { body: 'o', belly: 'y', feet: 'h', top: ['......pp', '...nnnnn', '..dnnnnn', '..dwwwww', '..dwwwww', '..dwXwww', '..dwxwwo', '..dwwwwo', '..dwwwwr', '...dwwww'] },
  shnyr0: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['r..y....', 'rrryyy..', '.dryrddd']) },                // блазень на ярмарку
  shnyr1: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['....yyyy', '...yrrrr', '..dyyyyy']) },        // комівояжер у солом'яному капелюсі
  shnyr2: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['.f.ffff.', '.ffd.dff', '.fdeeddd']) },          // діджей із навушниками
  shnyr3: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['....vvvv', '..vvvvvv', '.dvvvvvv']) },          // геймер у кепці
  shnyr4: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['....kkkk', '..kkkkkk', '.kkkkkkk', '.dkkkkkk'], { 5: '..dkTkkE' }) },   // хакер у капюшоні
  shnyr5: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['.g.g.g..', '.ggggggg', '..dgeddd']) },          // «еко-інспектор» із вінком
  shnyr6: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['....SSSS', '..SSSSSS', '.SSwwwww']) },           // у скафандрі
  shnyr7: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['...f.f.f', '..f.f.f.', '..dfeddd'], { 5: '..dkfkkE' }) },   // неоновий бос
  shnyr8: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['...rrrrr', '..rrrrrr', '..dreddd']) }            // у береті, позує художнику
};
// Чарівний годинник 16×16 (пише сам діалог у фіналі)
const CLOCK_ROWS = [
  '......hhhh......',
  '......h..h......',
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '..hhhwwwwwwhhh..',
  '.hhwwwwwwwwwwhh.',
  '.hwwwwwdwwwwwwh.',
  'hhwwwwwdwwwwwwhh',
  'hwwwwwwdwwwwwwwh',
  'hwwwwwwdddddwwwh',
  'hwwwwwwwwwwwwwwh',
  '.hwwwwwwwwwwwwh.',
  '.hhwwwwwwwwwwhh.',
  '..hhhwwwwwwhhh..',
  '....hhhhhhhh....',
  '................'
];

// Сюжет. Глава відкривається, коли попередня прочитана і виконано trigger:
// start — одразу; earned — зароблено всього; level — рівень магазину; depts — [[відділ, скільки штук]].
// lines — хто говорить (narr — оповідач); тексти: ch{N}_title і ch{N}_{k} у translations.
const CHAPTERS = [
  { id: 1, trigger: { start: true },
    lines: ['narr', 'narr', 'capy', 'capy', 'capy', 'narr'] },
  { id: 2, trigger: { earned: 100 },
    lines: ['narr', 'spike', 'capy', 'spike', 'capy', 'spike', 'narr'] },
  { id: 3, trigger: { level: 2 },
    lines: ['narr', 'spike', 'capy', 'shnyr', 'capy', 'shnyr', 'spike', 'narr'] },
  { id: 4, trigger: { level: 3 },
    lines: ['narr', 'capy', 'capy', 'spike', 'capy', 'narr'] },
  { id: 5, trigger: { level: 4 },
    lines: ['narr', 'bodya', 'zoya', 'sonia', 'tonya', 'capy', 'spike', 'narr'] },
  { id: 6, trigger: { level: 5 },
    lines: ['narr', 'capy', 'shnyr', 'capy', 'shnyr', 'shnyr', 'capy', 'shnyr', 'narr'] },
  { id: 7, trigger: { level: 6 },
    lines: ['narr', 'narr', 'capy', 'spike', 'shnyr', 'capy', 'narr', 'capy'] },
  { id: 8, trigger: { level: 6, nights: 3 },
    lines: ['narr', 'clock', 'capy', 'clock', 'clock', 'capy', 'clock', 'capy', 'clock', 'narr'] }
];

// Сезонні свята за реальною датою пристрою. Щоб додати нове свято — додай сюди рядок:
//   from / to — [місяць, день] (діапазон може перетинати новий рік);
//   decor — які прикраси вмикати (snow, garlands, tree, hats, pumpkins, bats, witchhats, balloons);
//   skyTint — затемнення неба; lights — кольори гірлянди;
//   bonus — global: +частка до всього доходу, depts: { номерВідділу: +частка }.
// Для перевірки без чекання дати: додай до адреси ?holiday=newyear, ?holiday=halloween або ?holiday=blackfriday
const HOLIDAYS = [
  { id: 'newyear',   icon: '🎄', from: [12, 15], to: [1, 10],
    decor: ['snow', 'garlands', 'tree', 'hats'], skyTint: null, lights: ['r', 'y', 'g', 'n', 'p'],
    music: 'newyear', bonus: { global: 0.25 } },
  { id: 'halloween', icon: '🎃', from: [10, 20], to: [11, 2],
    decor: ['pumpkins', 'bats', 'witchhats'], skyTint: { color: 'V', alpha: 0.5 }, lights: ['o', 'u'],
    music: 'halloween', bonus: { depts: { 1: 1.0 } } }     // солодощі: +100%
];
// Чорна п'ятниця — остання п'ятниця листопада (за реальною датою)
const BLACK_FRIDAY = { icon: '🖤', decor: ['balloons', 'garlands'], skyTint: { color: 'k', alpha: 0.45 }, lights: ['h', 'k', 'y'] };

// Колесо фортуни: 8 секторів. kind: coins / income / tap / jackpot.
// Монети = (дохід за секунду × seconds + flat × множник рівня) × серія днів. weight — шанс випадіння.
const WHEEL_SECTORS = [
  { kind: 'coins',   seconds: 60,   flat: 50,    weight: 18, color: 'r', icon: 'coin1' },
  { kind: 'income',  mult: 2, minutes: 5,        weight: 12, color: 'h', icon: 'up' },
  { kind: 'coins',   seconds: 180,  flat: 200,   weight: 15, color: 'm', icon: 'coin2' },
  { kind: 'tap',     mult: 3, minutes: 3,        weight: 12, color: 'p', icon: 'tap' },
  { kind: 'coins',   seconds: 600,  flat: 1000,  weight: 10, color: 's', icon: 'coin3' },
  { kind: 'income',  mult: 3, minutes: 3,        weight: 8,  color: 'o', icon: 'up' },
  { kind: 'coins',   seconds: 300,  flat: 400,    weight: 8,  color: 'u', icon: 'coin2' },
  { kind: 'jackpot', seconds: 3600, flat: 10000, weight: 3,  color: 'y', icon: 'star' }
];

// ---- Музика: 8-бітні мелодії як масиви нот ----
// Токен «нота:довжина» — довжина в 16-х частках (16 = один такт). «.:N» — пауза.
// Ноти: C4, F#5, Bb3. Канал wave:'noise' — ударні: k бас-барабан, s малий барабан, h тарілка.
// pattern — масив тактів; усі канали треба робити однакової довжини.
function arpBar(a, b, c) { return [a, b, c, b, a, b, c, b, a, b, c, b, a, b, c, b].map(n => n + ':1').join(' '); }
const DRUMS_CALM = '.:4 h:2 .:2 .:4 h:2 .:2';
const DRUMS_BOUNCE = 'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2';
const MUSIC = {
  // спокійна — для крамнички й магазинчика
  calm: { bpm: 92, channels: [
    { wave: 'square', vol: 0.10, pattern: [
      'E5:4 G5:2 E5:2 C5:4 E5:4', 'C5:4 E5:2 A4:2 A4:8', 'A4:4 C5:2 F5:2 E5:4 C5:4', 'D5:4 B4:4 G4:8',
      'E5:4 G5:2 E5:2 C6:4 G5:4', 'E5:4 C5:2 A4:2 E5:8', 'F5:4 E5:2 D5:2 C5:4 A4:4', 'G4:2 B4:2 D5:4 G5:8'] },
    { wave: 'triangle', vol: 0.22, pattern: [
      'C3:4 G3:4 C3:4 G3:4', 'A2:4 E3:4 A2:4 E3:4', 'F2:4 C3:4 F2:4 C3:4', 'G2:4 D3:4 G2:4 D3:4',
      'C3:4 G3:4 C3:4 G3:4', 'A2:4 E3:4 A2:4 E3:4', 'F2:4 C3:4 F2:4 C3:4', 'G2:4 D3:4 G2:4 D3:4'] },
    { wave: 'noise', vol: 0.35, pattern: [DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM, DRUMS_CALM] }
  ] },
  // бадьоріша — для мінімаркету й супермаркету
  market: { bpm: 126, channels: [
    { wave: 'square', vol: 0.09, pattern: [
      'D5:2 G5:2 D5:2 B4:2 G4:2 B4:2 D5:2 G5:2', 'E5:2 G5:2 E5:2 B4:2 E4:2 G4:2 B4:2 E5:2',
      'C5:2 E5:2 G5:2 E5:2 C5:2 E5:2 G5:2 C6:2', 'D5:2 F#5:2 A5:2 F#5:2 D5:2 A4:2 D5:4',
      'G5:4 F#5:2 E5:2 D5:4 B4:4', 'E5:4 G5:4 B5:4 G5:4', 'C6:4 B5:2 A5:2 G5:4 E5:4', 'D5:2 E5:2 F#5:2 G5:2 A5:4 D5:4'] },
    { wave: 'triangle', vol: 0.22, pattern: [
      'G2:2 D3:2 G2:2 D3:2 G2:2 D3:2 G2:2 D3:2', 'E2:2 B2:2 E2:2 B2:2 E2:2 B2:2 E2:2 B2:2',
      'C3:2 G3:2 C3:2 G3:2 C3:2 G3:2 C3:2 G3:2', 'D3:2 A3:2 D3:2 A3:2 D3:2 A3:2 D3:2 A3:2',
      'G2:2 D3:2 G2:2 D3:2 G2:2 D3:2 G2:2 D3:2', 'E2:2 B2:2 E2:2 B2:2 E2:2 B2:2 E2:2 B2:2',
      'C3:2 G3:2 C3:2 G3:2 C3:2 G3:2 C3:2 G3:2', 'D3:2 A3:2 D3:2 A3:2 D3:2 A3:2 D3:2 A3:2'] },
    { wave: 'noise', vol: 0.4, pattern: [DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE, DRUMS_BOUNCE] }
  ] },
  // урочиста — для універмагу й торгового центру
  mall: { bpm: 108, channels: [
    { wave: 'square', vol: 0.10, pattern: [
      'A4:4 D5:4 F#5:4 A5:4', 'E5:4 A5:4 C#6:4 A5:4', 'D5:4 F#5:4 B5:4 F#5:4', 'B4:4 D5:4 G5:4 B5:4',
      'D6:6 C#6:2 A5:4 F#5:4', 'E5:2 F#5:2 G#5:2 A5:2 C#6:8', 'B5:4 A5:4 G5:4 F#5:4', 'E5:4 F#5:4 A5:8'] },
    { wave: 'square', vol: 0.035, pattern: [
      arpBar('D4', 'F#4', 'A4'), arpBar('A3', 'C#4', 'E4'), arpBar('B3', 'D4', 'F#4'), arpBar('G3', 'B3', 'D4'),
      arpBar('D4', 'F#4', 'A4'), arpBar('A3', 'C#4', 'E4'), arpBar('G3', 'B3', 'D4'), arpBar('A3', 'C#4', 'E4')] },
    { wave: 'triangle', vol: 0.22, pattern: [
      'D2:4 D3:4 D2:4 D3:4', 'A2:4 A3:4 A2:4 A3:4', 'B2:4 B3:4 B2:4 B3:4', 'G2:4 G3:4 G2:4 G3:4',
      'D2:4 D3:4 D2:4 D3:4', 'A2:4 A3:4 A2:4 A3:4', 'G2:4 G3:4 G2:4 G3:4', 'A2:4 A3:4 A2:4 A3:4'] },
    { wave: 'noise', vol: 0.38, pattern: Array(8).fill('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2') }
  ] },
  // святкова — Новий рік (мелодія «Jingle Bells», вільна від авторських прав)
  newyear: { bpm: 132, channels: [
    { wave: 'square', vol: 0.10, pattern: [
      'E5:4 E5:4 E5:8', 'E5:4 E5:4 E5:8', 'E5:4 G5:4 C5:6 D5:2', 'E5:16',
      'F5:4 F5:4 F5:6 F5:2', 'F5:4 E5:4 E5:4 E5:2 E5:2', 'E5:4 D5:4 D5:4 E5:4', 'D5:8 G5:8'] },
    { wave: 'triangle', vol: 0.22, pattern: [
      'C3:4 G3:4 C3:4 G3:4', 'C3:4 G3:4 C3:4 G3:4', 'C3:4 G3:4 C3:4 G3:4', 'C3:4 G3:4 C3:4 G3:4',
      'F2:4 C3:4 F2:4 C3:4', 'C3:4 G3:4 C3:4 G3:4', 'G2:4 D3:4 G2:4 D3:4', 'G2:4 D3:4 G2:4 D3:4'] },
    { wave: 'noise', vol: 0.3, pattern: Array(8).fill('.:2 h:2 .:2 h:2 .:2 h:2 .:2 h:2') }
  ] },
  // моторошна — Хелловін
  halloween: { bpm: 104, channels: [
    { wave: 'square', vol: 0.09, pattern: [
      'A4:4 C5:4 E5:4 C5:4', 'A4:4 C5:4 E5:4 D#5:4', 'D5:4 F5:4 A5:4 F5:4', 'E5:8 G#4:4 B4:4',
      'A4:4 C5:4 E5:4 A5:4', 'G5:4 E5:4 C5:4 A4:4', 'F5:4 D5:4 B4:4 G#4:4', 'A4:12 .:4'] },
    { wave: 'triangle', vol: 0.24, pattern: [
      'A2:2 .:2 A2:2 .:2 E3:2 .:2 A2:2 .:2', 'A2:2 .:2 A2:2 .:2 E3:2 .:2 A2:2 .:2',
      'D3:2 .:2 D3:2 .:2 A3:2 .:2 D3:2 .:2', 'E2:2 .:2 E2:2 .:2 B2:2 .:2 E2:2 .:2',
      'A2:2 .:2 A2:2 .:2 E3:2 .:2 A2:2 .:2', 'A2:2 .:2 A2:2 .:2 E3:2 .:2 A2:2 .:2',
      'D3:2 .:2 D3:2 .:2 A3:2 .:2 D3:2 .:2', 'E2:2 .:2 E2:2 .:2 B2:2 .:2 E2:2 .:2'] },
    { wave: 'noise', vol: 0.35, pattern: Array(8).fill('k:4 .:4 s:4 .:4') }
  ] }
};
// Ще два стилі музики (вибирається в налаштуваннях звуку): «Пригодницька» — бадьорий чіптюн, «Спокійна» — м'яка 8-бітна лоу-фай
const DRUMS_CHIP = 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2';
MUSIC.chipA = { bpm: 138, channels: [
  { wave: 'square', vol: 0.09, pattern: [
    'E5:2 G5:2 C6:2 G5:2 E5:2 G5:2 C6:4', 'D5:2 G5:2 B5:2 G5:2 D5:2 G5:2 B5:4', 'C5:2 E5:2 A5:2 E5:2 C5:2 E5:2 A5:4', 'A4:2 C5:2 F5:2 C5:2 A4:2 C5:2 F5:4',
    'G5:4 E5:2 G5:2 C6:4 G5:4', 'B5:4 G5:2 B5:2 D6:4 B5:4', 'A5:4 F5:2 A5:2 C6:4 A5:4', 'B5:2 A5:2 G5:2 F5:2 G5:8'] },
  { wave: 'square', vol: 0.032, pattern: [
    arpBar('C4', 'E4', 'G4'), arpBar('B3', 'D4', 'G4'), arpBar('A3', 'C4', 'E4'), arpBar('A3', 'C4', 'F4'),
    arpBar('C4', 'E4', 'G4'), arpBar('B3', 'D4', 'G4'), arpBar('A3', 'C4', 'F4'), arpBar('B3', 'D4', 'G4')] },
  { wave: 'triangle', vol: 0.22, pattern: [
    'C3:2 C3:2 G3:2 C3:2 E3:2 C3:2 G3:2 C3:2', 'G2:2 G2:2 D3:2 G2:2 B2:2 G2:2 D3:2 G2:2', 'A2:2 A2:2 E3:2 A2:2 C3:2 A2:2 E3:2 A2:2', 'F2:2 F2:2 C3:2 F2:2 A2:2 F2:2 C3:2 F2:2',
    'C3:2 C3:2 G3:2 C3:2 E3:2 C3:2 G3:2 C3:2', 'G2:2 G2:2 D3:2 G2:2 B2:2 G2:2 D3:2 G2:2', 'F2:2 F2:2 C3:2 F2:2 A2:2 F2:2 C3:2 F2:2', 'G2:2 G2:2 D3:2 G2:2 B2:2 G2:2 D3:2 G2:2'] },
  { wave: 'noise', vol: 0.36, pattern: Array(8).fill(DRUMS_CHIP) }
] };
MUSIC.chipB = { bpm: 150, channels: [
  { wave: 'square', vol: 0.09, pattern: [
    'D5:1 F#5:1 A5:2 D6:4 A5:2 F#5:2 A5:4', 'C#5:1 E5:1 A5:2 C#6:4 A5:2 E5:2 A5:4', 'B4:1 D5:1 F#5:2 B5:4 F#5:2 D5:2 F#5:4', 'B4:1 D5:1 G5:2 B5:4 G5:2 D5:2 G5:4',
    'A5:2 F#5:2 D5:2 F#5:2 A5:4 D6:4', 'E6:2 C#6:2 A5:2 C#6:2 E6:4 A5:4', 'D6:2 B5:2 G5:2 B5:2 D6:4 G5:4', 'C#6:2 B5:2 A5:2 G#5:2 A5:8'] },
  { wave: 'square', vol: 0.032, pattern: [
    arpBar('D4', 'F#4', 'A4'), arpBar('A3', 'C#4', 'E4'), arpBar('B3', 'D4', 'F#4'), arpBar('G3', 'B3', 'D4'),
    arpBar('D4', 'F#4', 'A4'), arpBar('A3', 'C#4', 'E4'), arpBar('G3', 'B3', 'D4'), arpBar('A3', 'C#4', 'E4')] },
  { wave: 'triangle', vol: 0.22, pattern: [
    'D2:2 D3:2 D2:2 D3:2 A2:2 A3:2 A2:2 D3:2', 'A2:2 A3:2 A2:2 A3:2 E3:2 E3:2 A2:2 A3:2', 'B2:2 B3:2 B2:2 B3:2 F#3:2 F#3:2 B2:2 B3:2', 'G2:2 G3:2 G2:2 G3:2 D3:2 D3:2 G2:2 G3:2',
    'D2:2 D3:2 D2:2 D3:2 A2:2 A3:2 A2:2 D3:2', 'A2:2 A3:2 A2:2 A3:2 E3:2 E3:2 A2:2 A3:2', 'G2:2 G3:2 G2:2 G3:2 D3:2 D3:2 G2:2 G3:2', 'A2:2 A3:2 A2:2 A3:2 E3:2 E3:2 A2:2 A3:2'] },
  { wave: 'noise', vol: 0.38, pattern: Array(8).fill('k:2 h:2 s:2 h:2 k:2 h:2 s:2 k:2') }
] };
const DRUMS_CHILL = 'k:4 h:2 .:2 s:4 h:2 .:2';
MUSIC.chillA = { bpm: 78, channels: [
  { wave: 'triangle', vol: 0.17, pattern: [
    'E5:6 C5:2 A4:8', 'A4:4 C5:4 F5:8', 'E5:6 G5:2 E5:8', 'D5:4 B4:4 G4:8',
    'E5:4 A5:4 G5:4 E5:4', 'F5:6 E5:2 C5:8', 'D5:4 F5:4 A5:4 C6:4', 'B5:6 G#5:2 E5:8'] },
  { wave: 'square', vol: 0.04, pattern: [
    'A3:4 C4:4 E4:4 G4:4', 'F3:4 A3:4 C4:4 E4:4', 'C4:4 E4:4 G4:4 B4:4', 'G3:4 B3:4 D4:4 B3:4',
    'A3:4 C4:4 E4:4 G4:4', 'F3:4 A3:4 C4:4 E4:4', 'D3:4 F3:4 A3:4 C4:4', 'E3:4 G#3:4 B3:4 D4:4'] },
  { wave: 'triangle', vol: 0.2, pattern: [
    'A2:8 E3:8', 'F2:8 C3:8', 'C3:8 G2:8', 'G2:8 D3:8', 'A2:8 E3:8', 'F2:8 C3:8', 'D3:8 A2:8', 'E2:8 B2:8'] },
  { wave: 'noise', vol: 0.26, pattern: Array(8).fill(DRUMS_CHILL) }
] };
MUSIC.chillB = { bpm: 92, channels: [
  { wave: 'triangle', vol: 0.17, pattern: [
    'A5:4 F5:4 D5:4 F5:4', 'D5:4 F5:4 A5:4 D6:4', 'C6:4 A5:4 F5:4 A5:4', 'G5:4 E5:4 C5:4 E5:4',
    'D5:2 F5:2 A5:4 D6:4 A5:4', 'Bb5:2 A5:2 F5:4 D5:4 F5:4', 'G5:4 Bb5:4 D6:4 Bb5:4', 'C#6:6 E6:2 A5:8'] },
  { wave: 'square', vol: 0.04, pattern: [
    'D3:4 F3:4 A3:4 C4:4', 'Bb2:4 D3:4 F3:4 A3:4', 'F3:4 A3:4 C4:4 A3:4', 'C3:4 E3:4 G3:4 E3:4',
    'D3:4 F3:4 A3:4 C4:4', 'Bb2:4 D3:4 F3:4 A3:4', 'G2:4 Bb2:4 D3:4 F3:4', 'A2:4 C#3:4 E3:4 G3:4'] },
  { wave: 'triangle', vol: 0.2, pattern: [
    'D2:6 D3:2 A2:8', 'Bb1:6 Bb2:2 F2:8', 'F2:6 F3:2 C3:8', 'C2:6 C3:2 G2:8', 'D2:6 D3:2 A2:8', 'Bb1:6 Bb2:2 F2:8', 'G2:6 G3:2 D3:8', 'A1:6 A2:2 E2:8'] },
  { wave: 'noise', vol: 0.28, pattern: Array(8).fill('k:2 h:2 s:2 h:2 k:2 .:2 s:2 h:2') }
] };
// Стилі музики: які мелодії грають на яких рівнях магазину (свята мають власну — поле music у HOLIDAYS)
const MUSIC_STYLES = [
  { id: 'classic', levels: ['calm', 'calm', 'market', 'market', 'mall', 'mall'] },
  { id: 'chip',    levels: ['chipA', 'chipA', 'chipA', 'chipB', 'chipB', 'chipB'] },
  { id: 'chill',   levels: ['chillA', 'chillA', 'chillA', 'chillB', 'chillB', 'chillB'] }
];
// Характер музики в кожній епосі (індекс — як в EPOCHS): bpm — множник темпу, shift — на скільки пів-тонів вище, lead/bass/arp — тембри, drums — малюнок ударних (null — без них).
// Відродження (0) звучить без змін — як оригінал.
const EPOCH_MUSIC = [
  null,
  { bpm: 0.94, shift: 2,  lead: 'triangle', bass: 'triangle', drums: 'k:4 .:4 s:4 .:2 h:2' },                                  // ретро: м'яке, з поштовхом
  { bpm: 1.14, shift: 3,  lead: 'sawtooth', bass: 'square',   drums: 'k:2 h:2 k:2 h:2 k:2 h:2 k:2 h:2' },                      // диско: чотири долі
  { bpm: 1.2,  shift: 5,  lead: 'square',   bass: 'triangle', arp: 'square', drums: 'k:2 h:1 h:1 s:2 h:1 h:1 k:2 h:1 h:1 s:2 h:1 h:1' },   // аркади: швидко й дзвінко
  { bpm: 1.05, shift: 0,  lead: 'sawtooth', bass: 'sawtooth', drums: 'k:3 .:1 h:2 s:2 .:2 k:2 h:2 s:2' },                      // інтернет: цифровий
  { bpm: 0.84, shift: -3, lead: 'sine',     bass: 'sine',     drums: '.:4 h:2 .:2 .:4 h:2 .:2' },                              // еко: легке, повітряне
  { bpm: 0.78, shift: -5, lead: 'sine',     bass: 'triangle', arp: 'sine', drums: null },                                       // космос: повільне, без барабанів
  { bpm: 1.1,  shift: -1, lead: 'sawtooth', bass: 'sawtooth', drums: 'k:2 .:2 s:2 .:2 k:2 k:2 s:2 h:2' }                       // неон: синтвейв
];
const WAVE_GAIN = { square: 1, triangle: 1, sine: 1.45, sawtooth: 0.55 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function shiftNote(tok, semis) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(tok);
  if (!m || !semis) return tok;
  const midi = NOTE_INDEX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12 + semis;
  return SHARP_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}
function parseTokens(text) {
  let step = 0;
  const events = text.trim().split(/\s+/).map(tok => {
    const [name, len] = tok.split(':');
    const e = { step, len: parseInt(len, 10) || 1, tok: name };
    step += e.len;
    return e;
  });
  return { events, total: step };
}
// Мелодія для пари (базова мелодія, епоха): темп, тональність, тембри й ударні змінюються (результат кешується)
function trackDef(key) {
  const [baseId, epStr] = key.split('#');
  if (epStr === undefined) return MUSIC_PARSED[baseId];
  const ep = Number(epStr), prof = EPOCH_MUSIC[ep], base = MUSIC_PARSED[baseId];
  if (!prof) return base;
  if (MUSIC_PARSED[key]) return MUSIC_PARSED[key];
  const channels = base.channels.map((ch, ci) => {
    if (ch.wave === 'noise') {
      if (!prof.drums) return { wave: 'noise', vol: 0, events: [{ step: 0, len: ch.total, tok: '.' }], total: ch.total };
      const bar = parseTokens(prof.drums).total;
      const text = Array(Math.max(1, Math.round(ch.total / bar))).fill(prof.drums).join(' ');
      const parsed = parseTokens(text);
      return { wave: 'noise', vol: ch.vol, events: parsed.events, total: parsed.total };
    }
    const role = ci === 0 ? 'lead' : ch.wave === 'triangle' ? 'bass' : 'arp';
    const wave = prof[role] || ch.wave;
    const events = ch.events.map(e => ({ step: e.step, len: e.len, tok: e.tok === '.' ? '.' : shiftNote(e.tok, prof.shift) }));
    return { wave, vol: ch.vol * (WAVE_GAIN[wave] || 1) / (WAVE_GAIN[ch.wave] || 1), events, total: ch.total };
  });
  return (MUSIC_PARSED[key] = { bpm: base.bpm * prof.bpm, channels, total: base.total });
}

// ---- Подорож у часі, майстерня, епохи, досягнення (етап 7) ----

// Покращення за Кристали. costs — ціна кожного рівня (довжина = максимум рівнів).
// Що саме робить кожне — див. функції wsEffect… нижче.
const WORKSHOP = [
  { id: 'goldenFreq',   icon: '🌟', costs: [6, 11, 17] },              // золоті покупці приходять частіше: +15% за рівень
  { id: 'autoTap',      icon: '🤖', costs: [6, 11, 17] },              // автотапи: +1 тап на секунду за рівень
  { id: 'offlineHours', icon: '🌙', costs: [5, 8, 12] },               // офлайн довше: +4 години за рівень
  { id: 'offlineRate',  icon: '💤', costs: [5, 8, 12, 18] },           // офлайн щедріший: +5% за рівень
  { id: 'salesFreq',    icon: '🏷️', costs: [5, 8, 12, 18] },          // розпродажі частіші: −5% до проміжку
  { id: 'saleLength',   icon: '⏱️', costs: [5, 8, 12, 18] },           // розпродаж довший: +20 с
  { id: 'wheelFast',    icon: '🎡', costs: [12, 21] },                 // колесо двічі на день, потім тричі
  { id: 'thiefLess',    icon: '🦝', costs: [5, 8, 12, 18] },           // єнот краде менше й рідше
  { id: 'cheaperDepts', icon: '🛒', costs: [8, 12, 18, 26, 36] },    // відділи дешевші на 2%
  { id: 'cheaperTeam',  icon: '🐾', costs: [8, 12, 18, 26, 36] },    // звірята дешевші на 2%
  { id: 'tapPower',     icon: '👆', costs: [8, 12, 18, 26, 36] },    // тап сильніший: +10%
  { id: 'crystalGain',  icon: '💎', costs: [12, 18, 27, 39, 54] }   // більше осколків за подорож: +10%
];
const WHEEL_HOURS_BY_LEVEL = [24, 12, 8];

// Епохи: після кожної подорожі місто змінюється. Епохи йдуть по колу (епоха N використовує запис N mod 4).
// sky — три кольори неба (угорі / посередині / біля горизонту); tint — затемнення; decor — листя чи зорі;
// signFill — колір вивіски; houses — кольори стін і дахів фонових будинків.
// Епохи: після кожної подорожі в часі місто змінюється. Їх 8, далі коло починається знов (епоха N використовує запис N mod 8).
// sky — три кольори неба; tint — загальний відтінок; decor — зорі/листя; signFill — фон вивіски; awning — кольори навісів;
// roofStyle — tile (черепиця) або flat (плаский дах); features — особливості пейзажу (див. «Особливості епох»).
const EPOCHS = [
  { id: 'renaissance', sky: ['s', 'S', 'y'], tint: null, decor: [], signFill: 'b', awning: ['t', 'w'], roofStyle: 'tile', features: ['pennants'],
    houses: { walls: ['W', 'c', 'y', 'q'], roofs: ['t', 'r', 'b'] } },
  { id: 'retro', sky: ['q', 'w', 'W'], tint: { color: 'm', alpha: 0.10 }, decor: [], signFill: 'u', awning: ['p', 'w'], roofStyle: 'tile', features: ['blimp'],
    houses: { walls: ['m', 'q', 'y', 'S'], roofs: ['p', 'n'] } },
  { id: 'disco', sky: ['J', 'j', 'y'], tint: { color: 'o', alpha: 0.10 }, decor: [], signFill: 'P', awning: ['f', 'y'], roofStyle: 'tile', features: ['disco'],
    houses: { walls: ['o', 'h', 'y', 'c'], roofs: ['b', 'P', 't'] } },
  { id: 'arcade', sky: ['V', 'v', 'f'], tint: { color: 'u', alpha: 0.14 }, decor: ['stars'], signFill: 'k', awning: ['T', 'f'], roofStyle: 'flat', features: ['retrosun'],
    houses: { walls: ['v', 'P', 'T', 'f'], roofs: ['k', 'V', 'n'] } },
  { id: 'internet', sky: ['a', 'S', 'w'], tint: null, decor: [], signFill: 'n', awning: ['n', 'S'], roofStyle: 'flat', features: ['planes'],
    houses: { walls: ['S', 'a', 'w', 'e'], roofs: ['n', 'e', 'd'] } },
  { id: 'eco', sky: ['s', 'S', 'm'], tint: { color: 'g', alpha: 0.06 }, decor: [], signFill: 'G', awning: ['g', 'w'], roofStyle: 'flat', features: ['turbines'],
    houses: { walls: ['m', 'w', 'S', 'c'], roofs: ['g', 'G', 'm'] } },
  { id: 'space', sky: ['z', 'n', 's'], tint: { color: 'n', alpha: 0.12 }, decor: ['stars'], signFill: 'z', awning: ['u', 'S'], roofStyle: 'flat', features: ['rockets'],
    houses: { walls: ['e', 'E', 'S', 'w'], roofs: ['n', 'u', 'z'] } },
  { id: 'neon', sky: ['n', 'u', 'p'], tint: { color: 'n', alpha: 0.22 }, decor: ['stars'], signFill: 'k', awning: ['f', 'T'], roofStyle: 'flat', features: ['drones'],
    houses: { walls: ['n', 'u', 'e', 'd'], roofs: ['p', 'y'] } }
];

// Досягнення: набори за показником (metric). Для кожної цілі — свій значок-медаль (бронза → срібло → золото → кристал).
const ACH_SETS = [
  { metric: 'taps',        glyph: 'hand',     targets: [100, 1e3, 1e4, 1e5] },
  { metric: 'earned',      glyph: 'coin',     targets: [1e3, 1e6, 1e9, 1e12, 1e15] },
  { metric: 'level',       glyph: 'shop',     targets: [2, 3, 4, 5, 6] },
  { metric: 'deptsBought', glyph: 'bag',      targets: [10, 100, 500] },
  { metric: 'milestones',  glyph: 'star',     targets: [1, 10, 25] },
  { metric: 'teamEver',    glyph: 'paw',      targets: [1, 6, 12] },
  { metric: 'teamMax',     glyph: 'hammer',   targets: [5, 10] },
  { metric: 'raccoons',    glyph: 'raccoon',  targets: [1, 10, 50] },
  { metric: 'puddles',     glyph: 'drop',     targets: [5, 25] },
  { metric: 'wheel',       glyph: 'wheel',    targets: [1, 7] },
  { metric: 'travels',     glyph: 'clock',    targets: [1, 3, 10] },
  { metric: 'crystals',    glyph: 'gem',      targets: [5, 50, 200] },
  { metric: 'chapters',    glyph: 'book',     targets: [3, 8] },
  { metric: 'holidays',    glyph: 'calendar', targets: [1, 3] },
  { metric: 'hours',       glyph: 'clock',    targets: [1, 12] }
];
const ACHIEVEMENTS = ACH_SETS.flatMap(set => set.targets.map((target, tier) => ({ id: set.metric + '_' + tier, metric: set.metric, glyph: set.glyph, target, tier })));
const ACH_TIER_COLORS = ['c', 'E', 'h', 'S'];     // колір медалі: бронза, срібло, золото, кристал
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
function popcount(n) { let c = 0; n = Math.floor(n); while (n > 0) { c += n & 1; n >>= 1; } return c; }
// Як рахується кожен показник зі стану
const METRICS = {
  taps: s => s.taps,
  earned: s => s.totalEarned,
  level: s => Math.max(s.stats.maxLevel, s.shopLevel),
  deptsBought: s => s.stats.deptsBought,
  milestones: s => s.stats.milestones,
  teamEver: s => s.teamKnown.reduce((a, b) => a + b, 0),
  teamMax: s => s.stats.teamMaxLevel,
  raccoons: s => s.stats.raccoonsCaught,
  puddles: s => s.stats.puddlesFixed,
  wheel: s => s.stats.wheelSpins,
  travels: s => s.stats.timeTravels,
  crystals: s => s.crystalsTotal,
  chapters: s => s.story.done,
  holidays: s => popcount(s.stats.holidaysSeen),
  hours: s => s.playTime / 3600
};

// Значки досягнень 8×8 (літери — з палітри)
const GLYPHS = {
  hand:     ['...dd...', '..dwwd..', '..dwwd..', '..dwwdd.', '.dwwwwwd', '.dwwwwwd', '..dwwwd.', '...ddd..'],
  shop:     ['rwrwrwrw', 'rwrwrwrw', '.dddddd.', '.dsddbd.', '.dsddbd.', '.dsddbd.', '.dddddd.', '........'],
  bag:      ['..d..d..', '...dd...', '.dppppd.', 'dppwwppd', 'dppppppd', 'dppppppd', '.dppppd.', '..dddd..'],
  star:     ['...dd...', '..dyyd..', 'ddyyyydd', '.dyyyyd.', '..dyyd..', '.dyddyd.', '.dd..dd.', '........'],
  paw:      ['d..dd..d', 'd..dd..d', '..dddd..', '.dddddd.', '.dddddd.', '..dddd..', '........', '........'],
  hammer:   ['.ddddd..', '.deeeed.', '.ddddd..', '..dbd...', '..dbd...', '..dbd...', '..dbd...', '...dd...'],
  raccoon:  ['.d....d.', 'deeeeeed', 'dkkeekkd', 'dkwkkwkd', 'deeEEeed', '.dEEkEd.', '..dEEd..', '...dd...'],
  drop:     ['...dd...', '..dsSd..', '.dsSSsd.', '.dsSSsd.', 'dsSSSssd', 'dsSSSssd', '.dsSssd.', '..dddd..'],
  wheel:    ['..dddd..', '.dhrrhd.', 'dhrrrrhd', 'drrddrrd', 'drrddrrd', 'dhrrrrhd', '.dhrrhd.', '..dddd..'],
  clock:    ['..dddd..', '.dwwwwd.', 'dwwwdwwd', 'dwwwdwwd', 'dwwwddwd', 'dwwwwwwd', '.dwwwwd.', '..dddd..'],
  gem:      ['..dddd..', '.dSSwSd.', 'dSwSSSSd', 'dsSSSSsd', '.dsSSsd.', '..dssd..', '...dd...', '........'],
  shard:    ['...VV...', '..VwuV..', '.VwuvvV.', '.VuvvvV.', 'VuvvvPV.', '.VvvPPV.', '..VvPV..', '...VV...'],       // осколок часу
  book:     ['dddddddd', 'dwwwdwwd', 'dwewdwed', 'dwwwdwwd', 'dwewdwed', 'dwwwdwwd', 'dddddddd', '........'],
  calendar: ['dddddddd', 'drrrrrrd', 'dwwwwwwd', 'dwdwdwwd', 'dwwwwwwd', 'dwdwwwwd', 'dwwwwwwd', 'dddddddd']
};

// Нові сюжетні фрагменти: kind 'ep' — епохи (ep1…ep4), 'tut' — туторіал. Тексти: ep{N}_title, ep{N}_{k}, tut1_{k}.
// 8 історій: прихід у епохи 2…8 і нове коло. guest — гість епохи; pre — репліки до вибору; потім Капі обирає (o1/o2), reply — хто відповідає; post — кінець.
// Тексти: ep{N}_title, ep{N}_{k} (по порядку pre, потім post), ep{N}_o1/o2 (варіанти Капі), ep{N}_r1/r2 (відповіді)
const EPOCH_STORIES = [
  { guest: 'pip', pre: ['narr', 'pip', 'capy', 'shnyr1', 'pip', 'capy'], reply: ['shnyr1', 'shnyr1'], post: ['pip', 'capy', 'clock'], thx: ['pip', 'capy', 'pip'] },
  { guest: 'zina', pre: ['narr', 'zina', 'capy', 'shnyr2', 'zina', 'capy'], reply: ['shnyr2', 'shnyr2'], post: ['zina', 'capy', 'clock'], thx: ['zina', 'capy', 'zina'] },
  { guest: 'maks', pre: ['narr', 'maks', 'capy', 'shnyr3', 'maks', 'capy'], reply: ['shnyr3', 'shnyr3'], post: ['maks', 'capy', 'clock'], thx: ['maks', 'capy', 'maks'] },
  { guest: 'bitik', pre: ['narr', 'bitik', 'capy', 'shnyr4', 'bitik', 'capy'], reply: ['shnyr4', 'bitik'], post: ['bitik', 'capy', 'clock'], thx: ['bitik', 'capy', 'bitik'] },
  { guest: 'lesyk', pre: ['narr', 'lesyk', 'capy', 'shnyr5', 'lesyk', 'capy'], reply: ['shnyr5', 'shnyr5'], post: ['lesyk', 'capy', 'clock'], thx: ['lesyk', 'capy', 'lesyk'] },
  { guest: 'orbit', pre: ['narr', 'orbit', 'capy', 'shnyr6', 'orbit', 'capy'], reply: ['shnyr6', 'orbit'], post: ['orbit', 'capy', 'clock'], thx: ['orbit', 'capy', 'orbit'] },
  { guest: 'lumi', pre: ['narr', 'lumi', 'capy', 'shnyr7', 'lumi', 'capy'], reply: ['shnyr7', 'shnyr7'], post: ['lumi', 'shnyr7', 'capy', 'clock'], thx: ['lumi', 'capy', 'lumi'] },
  { guest: 'bruno', pre: ['narr', 'bruno', 'capy', 'shnyr8', 'bruno', 'capy'], reply: ['bruno', 'bruno'], post: ['bruno', 'capy', 'clock'], thx: ['bruno', 'capy', 'bruno'] },
  { guest: 'pietro', pre: ['narr', 'pietro', 'capy', 'shnyr0', 'pietro', 'capy'], reply: ['shnyr0', 'shnyr0'], post: ['pietro', 'capy', 'clock'], thx: ['pietro', 'capy', 'pietro'] }
];
const GUEST_IDS = EPOCH_STORIES.map(e => e.guest);
const TUTORIAL = { lines: ['capy', 'capy'] };

// Умова відкриття глави для стану s (використовується і в грі, і при міграції старих збережень)
function triggerMet(trig, s) {
  if (trig.earned !== undefined && !(s.totalEarned >= trig.earned)) return false;
  if (trig.level !== undefined && !(s.shopLevel >= trig.level)) return false;
  if (trig.nights !== undefined && !(s.story && s.story.nights >= trig.nights)) return false;
  if (trig.depts && !trig.depts.every(([i, n]) => s.depts && s.depts[i] >= n)) return false;
  return true;
}

// Спрайти: масиви рядків, кожна літера — колір з PALETTE, крапка — прозорість.
// variants — заміни кольорів для альтернативних кадрів (наприклад, кліпання).
const SPRITES = {
  // Монетка 8×8
  coin: { rows: [
    '..dddd..',
    '.dhyyhd.',
    'dhyhhhhd',
    'dhyhhhhd',
    'dhhhhhhd',
    'dhhhhhod',
    '.dhhhod.',
    '..dddd..'
  ] },
  // Хмаринка 24×7
  cloud: { rows: [
    '..........wwww..........',
    '......wwww.wwwwww..www..',
    '....wwwwwwwwwwwwwwwwww..',
    '.wwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwww',
    '.WWWWWWWWWWWWWWWWWWWWWW.',
    '..WWWWWWWWWWWWWWWWWWWW..'
  ], variants: { grey: { w: '#b8b6bf', W: '#9d9ba7' }, light: { w: '#e4e7ee', W: '#cbd0db' }, dark: { w: '#7c7890', W: '#625f78' } } },
  // Капі 28×24 (дивиться вправо; X — око, при кліпанні стає шерстю). Дівчина: квіточка, рожева сукня й бантик

};
// Покупці у стилі «чібі»: велика голова, тіло-ґудзик, дві ніжки, м'який контур. Малюються кодом один раз на старті (18×23, ноги внизу)
const CHIBI = (function () {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, g: c.getContext('2d'), w, h }; };
  const rect = (S, x, y, w, h, col) => { S.g.fillStyle = col; S.g.fillRect(x, y, w, h); };
  const px = (S, x, y, col) => { if (x >= 0 && y >= 0 && x < S.w && y < S.h) rect(S, x, y, 1, 1, col); };
  const ell = (S, cx, cy, rx, ry, col, shade, hi) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) { let c = col; if (shade && (dy > 0.35 || dx * 0.6 + dy > 0.75)) c = shade; if (hi && dx < -0.35 && dy < -0.35) c = hi; px(S, x, y, c); }
    }
  };
  const outline = (S, col) => {
    const o = mk(S.w + 2, S.h + 2), d = S.g.getImageData(0, 0, S.w, S.h).data;
    const has = (x, y) => x >= 0 && y >= 0 && x < S.w && y < S.h && d[(y * S.w + x) * 4 + 3] > 0;
    o.g.fillStyle = col;
    for (let y = -1; y <= S.h; y++) for (let x = -1; x <= S.w; x++) if (!has(x, y) && (has(x - 1, y) || has(x + 1, y) || has(x, y - 1) || has(x, y + 1))) o.g.fillRect(x + 1, y + 1, 1, 1);
    o.g.drawImage(S.c, 1, 1);
    return o.c;
  };
  const PK = '#ef8fa3', E = '#2a1d1a', WH = '#ffffff';
  // Кожен покупець: b — шерсть, s — тінь, h — відблиск, o — колір контуру (м'який, темніший за звіря)
  const PAL = {
    bunny:    { b: '#fff4dc', s: '#e2d3b8', h: '#ffffff', o: '#8a7560' },
    mouse:    { b: '#aaa6a2', s: '#8d8884', h: '#c9c5c0', o: '#4f4a48' },
    duck:     { b: '#ffe08a', s: '#f0bf55', h: '#fff0b5', o: '#8a5a2a' },
    dog:      { b: '#b57a45', s: '#8f5c33', h: '#d49a62', o: '#4a2d18' },
    cat:      { b: '#e8863c', s: '#c46a28', h: '#f6a860', o: '#6e3a14' },
    pig:      { b: '#f4a8b8', s: '#d98aa0', h: '#ffc8d4', o: '#8a4258' },
    sheep:    { b: '#fdf6ea', s: '#e6dac6', h: '#ffffff', o: '#6a5a52' },
    cow:      { b: '#fff4dc', s: '#e2d3b8', h: '#ffffff', o: '#4a3a34' },
    squirrel: { b: '#c9743a', s: '#a65a28', h: '#e09258', o: '#5e2e12' },
    deer:     { b: '#c9955a', s: '#a87a44', h: '#e0b078', o: '#5a3a1c' },
    raccoon:  { b: '#9a9a9e', s: '#7c7c82', h: '#b8b8bc', o: '#3a3a40' },
    hedgehog: { b: '#a07850', s: '#80603c', h: '#b89068', o: '#4a3020' },
    penguin:  { b: '#3a3d4a', s: '#2a2c38', h: '#55596a', o: '#171822' },
    koala:    { b: '#9aa0a8', s: '#7e848c', h: '#b8bec6', o: '#3e4248' },
    tiger:    { b: '#f09a38', s: '#d07c24', h: '#f8b862', o: '#6a3a10' },
    monkey:   { b: '#9c6a3c', s: '#7e522c', h: '#b88456', o: '#4a2c14' },
    hamster:  { b: '#f2d4a0', s: '#dcb878', h: '#fae8c4', o: '#7a5a30' },
    chick:    { b: '#ffe566', s: '#f2c840', h: '#fff2a0', o: '#8a6a1a' },
    frog:     { b: '#6dbb5a', s: '#4f9a43', h: '#8ad278', o: '#2a5a24' },
    foxcub:   { b: '#e8742c', s: '#c85a1c', h: '#f4985a', o: '#5e2a10' }
  };
  const eye = (S, x, y) => { rect(S, x, y, 2, 2, E); px(S, x, y, WH); };
  function make(a, frame) {
    const p = PAL[a], S = mk(16, 21), hy = 11, step = frame ? 1 : 0, DK = '#2a1d1a';
    let fc = p.s, belly = p.h;                                    // колір ніжок і животика
    // --- що за головою / тілом (вуха, роги, хвіст)
    switch (a) {
      case 'bunny': ell(S, 5.5, 4, 1.8, 4.5, p.b, p.s); ell(S, 10.5, 4, 1.8, 4.5, p.b, p.s); rect(S, 5, 2, 1, 5, PK); rect(S, 10, 2, 1, 5, PK); break;
      case 'mouse': ell(S, 3.5, 7, 2.6, 2.6, p.b, p.s); ell(S, 12.5, 7, 2.6, 2.6, p.b, p.s); ell(S, 3.5, 7, 1.4, 1.4, PK); ell(S, 12.5, 7, 1.4, 1.4, PK); break;
      case 'dog': ell(S, 3, 10, 2, 3.4, '#6f4526'); ell(S, 13, 10, 2, 3.4, '#6f4526'); belly = '#e8c08a'; break;
      case 'duck': px(S, 7, 4, p.b); px(S, 8, 3, p.b); px(S, 9, 4, p.b); fc = '#e8863c'; break;
      case 'cat': rect(S, 3, 4, 3, 3, p.b); px(S, 3, 3, p.b); px(S, 4, 5, PK); rect(S, 10, 4, 3, 3, p.b); px(S, 12, 3, p.b); px(S, 11, 5, PK); rect(S, 13, 14, 3, 5, p.b); px(S, 15, 13, p.b); belly = '#fff4dc'; break;
      case 'pig': ell(S, 3.5, 6, 2, 2, p.b, p.s); ell(S, 12.5, 6, 2, 2, p.b, p.s); px(S, 3, 6, PK); px(S, 12, 6, PK); fc = '#d98aa0'; break;
      case 'sheep': ell(S, 2.5, 9, 2, 1.6, '#4a3e38'); ell(S, 13.5, 9, 2, 1.6, '#4a3e38'); fc = '#4a3e38'; break;
      case 'cow': ell(S, 2.5, 8, 2.2, 1.4, '#fff4dc', p.s); ell(S, 13.5, 8, 2.2, 1.4, '#fff4dc', p.s); rect(S, 4, 4, 2, 2, '#e8d8a8'); rect(S, 10, 4, 2, 2, '#e8d8a8'); fc = '#4a3a34'; break;
      case 'squirrel': ell(S, 13.5, 14, 2.6, 5, p.b, p.s); ell(S, 13.5, 12, 1.4, 3, p.h); rect(S, 4, 4, 2, 3, p.b); px(S, 4, 3, DK); rect(S, 10, 4, 2, 3, p.b); px(S, 11, 3, DK); belly = '#fff0d0'; break;
      case 'deer': rect(S, 4, 2, 1, 4, '#7a5030'); rect(S, 3, 2, 1, 1, '#7a5030'); px(S, 5, 3, '#7a5030'); rect(S, 11, 2, 1, 4, '#7a5030'); rect(S, 12, 2, 1, 1, '#7a5030'); px(S, 10, 3, '#7a5030'); ell(S, 2.5, 8, 2, 1.4, p.b, p.s); ell(S, 13.5, 8, 2, 1.4, p.b, p.s); belly = '#fff0d0'; break;
      case 'raccoon': ell(S, 3.5, 6.5, 2.4, 2.4, p.b, p.s); ell(S, 12.5, 6.5, 2.4, 2.4, p.b, p.s); ell(S, 3.5, 6.5, 1.2, 1.2, '#3a3a40'); ell(S, 12.5, 6.5, 1.2, 1.2, '#3a3a40'); rect(S, 13, 15, 3, 4, p.b); rect(S, 13, 16, 3, 1, '#3a3a40'); rect(S, 13, 18, 3, 1, '#3a3a40'); belly = '#cfcfd2'; break;
      case 'hedgehog': for (let i = 0; i < 6; i++) { px(S, 3 + i * 2, 5 + (i % 2), '#5a4030'); px(S, 3 + i * 2, 6 + (i % 2), '#5a4030'); } px(S, 1, 9, '#5a4030'); px(S, 14, 9, '#5a4030'); px(S, 1, 12, '#5a4030'); px(S, 14, 12, '#5a4030'); belly = '#f0d8b0'; break;
      case 'penguin': belly = '#ffffff'; fc = '#f08a2e'; ell(S, 2, 17, 1.6, 2.6, p.b); ell(S, 14, 17, 1.6, 2.6, p.b); break;
      case 'koala': ell(S, 2.5, 7, 3, 3, p.b, p.s); ell(S, 13.5, 7, 3, 3, p.b, p.s); ell(S, 2.5, 7, 1.6, 1.6, '#f4eee6'); ell(S, 13.5, 7, 1.6, 1.6, '#f4eee6'); belly = '#e6e8ea'; break;
      case 'tiger': ell(S, 3.5, 6.5, 2.2, 2.2, p.b, p.s); ell(S, 12.5, 6.5, 2.2, 2.2, p.b, p.s); ell(S, 3.5, 6.5, 1.1, 1.1, '#fff4dc'); ell(S, 12.5, 6.5, 1.1, 1.1, '#fff4dc'); belly = '#fff4dc'; break;
      case 'monkey': ell(S, 1.8, 11, 2.2, 2.4, p.b, p.s); ell(S, 14.2, 11, 2.2, 2.4, p.b, p.s); ell(S, 1.8, 11, 1.1, 1.2, '#f0c898'); ell(S, 14.2, 11, 1.1, 1.2, '#f0c898'); rect(S, 13, 15, 3, 1, p.b); rect(S, 15, 13, 1, 3, p.b); belly = '#f0c898'; break;
      case 'hamster': ell(S, 3.5, 6.5, 1.8, 1.8, p.b, p.s); ell(S, 12.5, 6.5, 1.8, 1.8, p.b, p.s); px(S, 3, 6, PK); px(S, 12, 6, PK); belly = '#fff4dc'; break;
      case 'chick': px(S, 8, 3, p.b); px(S, 7, 4, p.b); px(S, 9, 4, p.b); px(S, 8, 4, p.b); fc = '#f08a2e'; break;
      case 'frog': fc = '#4f9a43'; belly = '#d8f0b0'; break;
      case 'foxcub': rect(S, 3, 3, 3, 4, p.b); px(S, 3, 2, DK); px(S, 4, 2, DK); rect(S, 10, 3, 3, 4, p.b); px(S, 11, 2, DK); px(S, 12, 2, DK); rect(S, 13, 14, 3, 5, p.b); rect(S, 14, 17, 2, 2, '#fff4dc'); belly = '#fff4dc'; break;
    }
    // --- ніжки й тіло
    ell(S, 5.5, 20, 2.2, 1, fc); ell(S, 10.5, 20, 2.2, 1, fc); if (step) rect(S, 4, 19, 3, 1, fc);
    ell(S, 8, 17, 4.6, 3.3, p.b, p.s);
    ell(S, 8, 17.5, 2.6, 1.8, belly);
    if (a === 'cow') { rect(S, 10, 15, 3, 2, '#3a2a24'); }
    if (a === 'tiger') { [[4, 15], [11, 15], [4, 18], [11, 18]].forEach(q => rect(S, q[0], q[1], 1, 2, DK)); }
    if (a === 'deer') { [[6, 15], [10, 16], [8, 18]].forEach(q => px(S, q[0], q[1], '#fff4dc')); }
    if (a === 'hedgehog') ell(S, 8, 17.5, 2.6, 1.8, '#f0d8b0');
    // --- голова
    ell(S, 8, hy, 6.2, 5.2, p.b, p.s, p.h);
    // --- обличчя
    switch (a) {
      case 'bunny': case 'mouse': eye(S, 4, hy - 1); eye(S, 10, hy - 1); [[7, 2], [8, 2], [3, 2], [12, 2], [4, 2], [11, 2]].forEach(q => px(S, q[0], hy + q[1], PK)); break;
      case 'dog': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.4, 3, 2, '#e8c08a'); px(S, 7, hy + 1, E); px(S, 8, hy + 1, E); rect(S, 7, hy + 3, 2, 1, PK); break;
      case 'duck': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.4, 3, 1.5, '#e8863c'); rect(S, 5, hy + 3, 6, 1, '#c96d28'); px(S, 3, hy + 2, '#ffb0a0'); px(S, 12, hy + 2, '#ffb0a0'); break;
      case 'cat': eye(S, 4, hy - 1); eye(S, 10, hy - 1); [[7, -5], [9, -5], [8, -4]].forEach(q => px(S, q[0], hy + q[1], p.s)); rect(S, 3, hy - 4, 1, 2, p.s); rect(S, 12, hy - 4, 1, 2, p.s); px(S, 7, hy + 2, PK); px(S, 8, hy + 2, PK); px(S, 7, hy + 3, DK); px(S, 8, hy + 3, DK); rect(S, 0, hy + 1, 2, 1, '#fff4dc'); rect(S, 14, hy + 1, 2, 1, '#fff4dc'); break;
      case 'pig': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.6, 3, 2, '#e888a0'); px(S, 7, hy + 2, '#8a4258'); px(S, 9, hy + 2, '#8a4258'); px(S, 3, hy + 2, '#ff9ab0'); px(S, 12, hy + 2, '#ff9ab0'); break;
      case 'sheep': ell(S, 8, hy + 0.6, 4.2, 4.2, '#6a5a52'); rect(S, 5, hy - 1, 2, 2, WH); rect(S, 9, hy - 1, 2, 2, WH); px(S, 5, hy, DK); px(S, 10, hy, DK); px(S, 7, hy + 2, '#3a2e2a'); px(S, 8, hy + 2, '#3a2e2a'); ell(S, 5, 6, 1.6, 1.4, p.b); ell(S, 8, 5.4, 1.8, 1.5, p.b); ell(S, 11, 6, 1.6, 1.4, p.b); break;
      case 'cow': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 5.5, hy - 3, 2.2, 1.6, '#3a2a24'); ell(S, 8, hy + 2.8, 3.6, 2, '#f4a8b8'); px(S, 7, hy + 2, '#a8586c'); px(S, 9, hy + 2, '#a8586c'); break;
      case 'squirrel': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.4, 2.8, 1.8, '#fff0d0'); px(S, 7, hy + 2, DK); px(S, 8, hy + 2, DK); px(S, 3, hy + 2, '#ff9a7a'); px(S, 12, hy + 2, '#ff9a7a'); break;
      case 'deer': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.6, 2.6, 1.8, '#e8c898'); px(S, 7, hy + 2, DK); px(S, 8, hy + 2, DK); break;
      case 'raccoon': rect(S, 2, hy - 2, 12, 3, '#3a3a40'); rect(S, 3, hy - 1, 2, 2, WH); rect(S, 11, hy - 1, 2, 2, WH); px(S, 4, hy, DK); px(S, 11, hy, DK); ell(S, 8, hy + 2.6, 2.6, 1.8, '#d8d8dc'); rect(S, 7, hy + 1, 2, 1, DK); break;
      case 'hedgehog': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2, 5, 3.4, '#f0d8b0'); eye(S, 4, hy - 1); eye(S, 10, hy - 1); px(S, 7, hy + 2, DK); px(S, 8, hy + 2, DK); break;
      case 'penguin': ell(S, 8, hy + 1, 4.8, 4, '#ffffff'); eye(S, 4, hy - 1); eye(S, 10, hy - 1); rect(S, 6, hy + 2, 4, 2, '#f08a2e'); rect(S, 7, hy + 4, 2, 1, '#d4701c'); break;
      case 'koala': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.2, 2, 1.8, '#3a3438'); break;
      case 'tiger': eye(S, 4, hy - 1); eye(S, 10, hy - 1); rect(S, 7, hy - 5, 2, 2, DK); rect(S, 3, hy - 4, 1, 2, DK); rect(S, 12, hy - 4, 1, 2, DK); rect(S, 1, hy + 1, 2, 1, DK); rect(S, 13, hy + 1, 2, 1, DK); ell(S, 8, hy + 2.6, 3, 2, '#fff4dc'); rect(S, 7, hy + 2, 2, 1, '#e0707a'); break;
      case 'monkey': ell(S, 8, hy + 1.4, 4.6, 3.6, '#f0c898'); eye(S, 4, hy - 1); eye(S, 10, hy - 1); px(S, 7, hy + 2, '#7a4a30'); px(S, 8, hy + 2, '#7a4a30'); rect(S, 6, hy + 4, 4, 1, '#7a4a30'); break;
      case 'hamster': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 3.5, hy - 2, 2.4, 1.8, '#e0a860'); ell(S, 12.5, hy - 2, 2.4, 1.8, '#e0a860'); ell(S, 8, hy + 2.6, 4.6, 2, '#fff4dc'); px(S, 7, hy + 1, PK); px(S, 8, hy + 1, PK); px(S, 3, hy + 2, '#ffb0a0'); px(S, 12, hy + 2, '#ffb0a0'); break;
      case 'chick': eye(S, 4, hy - 1); eye(S, 10, hy - 1); rect(S, 6, hy + 2, 4, 2, '#f08a2e'); px(S, 3, hy + 2, '#ffb0a0'); px(S, 12, hy + 2, '#ffb0a0'); break;
      case 'frog': ell(S, 4.5, hy - 5, 2.4, 2.4, p.b, p.s, p.h); ell(S, 11.5, hy - 5, 2.4, 2.4, p.b, p.s, p.h); rect(S, 3, hy - 6, 3, 3, WH); rect(S, 10, hy - 6, 3, 3, WH); rect(S, 4, hy - 5, 2, 2, DK); rect(S, 11, hy - 5, 2, 2, DK); rect(S, 4, hy + 2, 8, 1, '#2a5a24'); rect(S, 3, hy + 1, 1, 1, '#2a5a24'); rect(S, 12, hy + 1, 1, 1, '#2a5a24'); px(S, 6, hy, '#2a5a24'); px(S, 9, hy, '#2a5a24'); px(S, 3, hy + 3, '#ff9ab0'); px(S, 12, hy + 3, '#ff9ab0'); break;
      case 'foxcub': eye(S, 4, hy - 1); eye(S, 10, hy - 1); ell(S, 8, hy + 2.8, 5.4, 2.4, '#fff4dc'); ell(S, 8, hy + 2.8, 5.4, 2.4, '#fff4dc'); rect(S, 7, hy + 1, 2, 2, DK); break;
    }
    return outline(S, p.o);
  }
  // Пакети з покупками: 3 види (багет і зелень / квіти / яблуко), різні кольори, білі ручки
  const BAGS = {};
  const BAG_COL = { p: ['#ef8fa3', '#d4537e'], h: ['#f2b84b', '#c98a1e'], g: ['#4f9a63', '#2f7a4a'], n: ['#3d5a8c', '#2d467a'], u: ['#8b6bb0', '#6a4a94'] };
  function bag(kind, color) {
    const ep = (typeof viewEpoch === 'function') ? viewEpoch() % 8 : 1;
    const key = kind + color + '_' + ep;
    if (BAGS[key]) return BAGS[key];
    if (window.SHOPBAG_OPT && SHOPBAG_OPT[ep]) { const k2 = 'A_' + ep; return BAGS[k2] || (BAGS[k2] = SHOPBAG_OPT[ep].A()); }       // у кожної епохи свій пакет
    const S = mk(10, 13), col = (BAG_COL[color] || BAG_COL.p)[0], sh = (BAG_COL[color] || BAG_COL.p)[1];
    if (kind === 0) { rect(S, 4, 0, 2, 5, '#e8b060'); px(S, 4, 0, '#f6d28a'); px(S, 5, 2, '#c98a3a'); px(S, 5, 4, '#c98a3a'); rect(S, 6, 2, 1, 3, '#4f9a63'); }
    if (kind === 1) { ell(S, 3, 3, 1.3, 1.3, PK); ell(S, 6, 2, 1.3, 1.3, '#ffe08a'); rect(S, 3, 4, 1, 2, '#4f9a63'); rect(S, 6, 3, 1, 3, '#4f9a63'); }
    if (kind === 2) { rect(S, 3, 1, 4, 4, '#e0604a'); px(S, 4, 1, '#ff9a8a'); rect(S, 5, 0, 1, 2, '#4f9a63'); }
    rect(S, 1, 5, 8, 8, col); rect(S, 1, 11, 8, 2, sh); rect(S, 1, 5, 8, 1, WH); rect(S, 3, 7, 4, 3, '#fff4dc');
    if (kind === 0) { px(S, 4, 8, sh); px(S, 5, 8, sh); }
    if (kind === 1) { rect(S, 4, 8, 2, 1, '#e0604a'); px(S, 4, 7, '#e0604a'); px(S, 5, 7, '#e0604a'); }
    if (kind === 2) { px(S, 4, 8, sh); px(S, 5, 9, sh); px(S, 6, 8, sh); }
    rect(S, 2, 3, 1, 3, '#fff4dc'); rect(S, 7, 3, 1, 3, '#fff4dc');
    // покупки залежать від епохи: кошик, блискучий пакет, коробка гри, посилка, сітка з овочами, капсула, неонова торба
    if (ep === 0) { rect(S, 1, 6, 8, 7, '#c98a3a'); for (let y = 6; y < 13; y++) for (let x = 1; x < 9; x++) if ((x + y) % 2) px(S, x, y, '#a8703f'); rect(S, 1, 6, 8, 1, '#8a5a2a'); rect(S, 2, 2, 1, 4, '#8a5a2a'); rect(S, 7, 2, 1, 4, '#8a5a2a'); rect(S, 2, 2, 6, 1, '#8a5a2a'); rect(S, 3, 3, 2, 3, '#e8b060'); rect(S, 5, 4, 2, 2, '#4f9a63'); }
    else if (ep === 2) { for (let k = 0; k < 6; k++) px(S, 2 + (k * 3) % 7, 6 + (k * 5) % 6, k % 2 ? '#ffffff' : '#ffe08a'); rect(S, 1, 9, 8, 1, '#ff5fa2'); }
    else if (ep === 3) { rect(S, 1, 5, 8, 8, '#2a1d1a'); rect(S, 1, 5, 8, 1, '#7a5cc9'); rect(S, 2, 7, 6, 2, '#3fa7a0'); rect(S, 3, 10, 1, 1, '#ffe08a'); rect(S, 5, 10, 2, 1, '#ff5fa2'); px(S, 3, 8, '#ffffff'); rect(S, 4, 1, 2, 4, '#c26b4a'); }
    else if (ep === 4) { rect(S, 1, 5, 8, 8, '#d9a066'); rect(S, 1, 5, 8, 1, '#e8b87a'); rect(S, 4, 5, 2, 8, '#fff4dc'); rect(S, 1, 10, 3, 2, '#ffffff'); px(S, 2, 11, '#4a3228'); px(S, 7, 8, '#3d5a8c'); rect(S, 2, 3, 1, 2, '#4a3228'); rect(S, 7, 3, 1, 2, '#4a3228'); }
    else if (ep === 5) { rect(S, 1, 5, 8, 8, '#4f9a63'); for (let y = 5; y < 13; y++) for (let x = 1; x < 9; x++) if ((x + y) % 2) px(S, x, y, '#2f6b48'); rect(S, 2, 7, 2, 2, '#e8863c'); rect(S, 5, 8, 3, 3, '#c4553d'); rect(S, 3, 10, 2, 2, '#ffe08a'); rect(S, 6, 5, 1, 3, '#8ed4a6'); rect(S, 2, 3, 1, 2, '#8ed4a6'); rect(S, 7, 3, 1, 2, '#8ed4a6'); }
    else if (ep === 6) { rect(S, 2, 5, 6, 8, '#9c9087'); rect(S, 1, 6, 8, 6, '#cfc5b8'); rect(S, 3, 7, 4, 2, '#86cfe8'); rect(S, 2, 10, 6, 1, '#4a3228'); rect(S, 4, 12, 2, 1, '#ffe08a'); rect(S, 4, 2, 2, 3, '#9c9087'); px(S, 4, 1, '#c4553d'); }
    else if (ep === 7) { rect(S, 1, 5, 8, 8, '#1b1230'); for (let x = 1; x < 9; x++) { px(S, x, 5, '#ff5fa2'); px(S, x, 12, '#3fa7a0'); } for (let y = 5; y < 13; y++) { px(S, 1, y, '#ff5fa2'); px(S, 8, y, '#3fa7a0'); } rect(S, 3, 8, 4, 1, '#3fa7a0'); px(S, 4, 7, '#ff5fa2'); px(S, 5, 9, '#ffffff'); }
    return (BAGS[key] = outline(S, '#4a3228'));
  }
  return { make, bag };
})();
// Пакети з покупками по епохах (SHOPBAG_OPT[епоха].A() → canvas 12×16 з контуром): кошик, паперовий пакет, глітер-пакет, коробка гри, посилка, сітка з овочами, капсула, неонова торба
(function () {
  const mk = () => { const c = document.createElement('canvas'); c.width = 12; c.height = 16; return c; };
  const rc = (S, x, y, w, h, col) => { const g = S.getContext('2d'); g.fillStyle = col; g.fillRect(x, y, w, h); };
  const pxl = (S, x, y, col) => rc(S, x, y, 1, 1, col);
  const el = (S, cx, cy, rx, ry, col) => { const g = S.getContext('2d'); g.fillStyle = col; for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy <= 1) g.fillRect(x, y, 1, 1); } };
  const outl = (S, col) => { const g = S.getContext('2d'), d = g.getImageData(0, 0, 12, 16), o = g.createImageData(12, 16); const a = (x, y) => (x < 0 || y < 0 || x > 11 || y > 15) ? 0 : d.data[(y * 12 + x) * 4 + 3]; const cc = col; const rgb = [parseInt(cc.slice(1, 3), 16), parseInt(cc.slice(3, 5), 16), parseInt(cc.slice(5, 7), 16)];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 12; x++) if (!a(x, y) && (a(x + 1, y) || a(x - 1, y) || a(x, y + 1) || a(x, y - 1))) { const i = (y * 12 + x) * 4; o.data[i] = rgb[0]; o.data[i + 1] = rgb[1]; o.data[i + 2] = rgb[2]; o.data[i + 3] = 255; }
    for (let i = 0; i < d.data.length; i += 4) if (d.data[i + 3]) { o.data[i] = d.data[i]; o.data[i + 1] = d.data[i + 1]; o.data[i + 2] = d.data[i + 2]; o.data[i + 3] = 255; } g.putImageData(o, 0, 0); return S; };
  const O = '#4a3228', W = '#fff4dc';
  const E = [];
  const f = (ep, k, fn) => { (E[ep] = E[ep] || {})[k] = () => { const S = mk(); fn(S); return outl(S, O); }; };
  // 0 Відродження
  f(0, 'A', S => { rc(S, 1, 6, 10, 9, '#c98a3a'); for (let y = 6; y < 15; y++) for (let x = 1; x < 11; x++) if ((x + y) % 2) pxl(S, x, y, '#a8703f'); rc(S, 1, 6, 10, 1, '#8a5a2a'); rc(S, 2, 2, 1, 5, '#8a5a2a'); rc(S, 9, 2, 1, 5, '#8a5a2a'); rc(S, 2, 2, 8, 1, '#8a5a2a'); rc(S, 3, 3, 2, 4, '#e8b060'); el(S, 7, 5, 1.6, 1.6, '#8b6bb0'); el(S, 6, 4, 1.3, 1.3, '#8b6bb0'); pxl(S, 7, 3, '#4f9a63'); });
  // 1 Ретро
  f(1, 'A', S => { rc(S, 2, 5, 8, 10, '#d9a066'); rc(S, 2, 5, 8, 1, '#e8b87a'); rc(S, 2, 5, 1, 10, '#c48a50'); rc(S, 4, 1, 2, 5, '#e8b060'); pxl(S, 4, 1, '#f6d28a'); rc(S, 7, 2, 2, 4, '#4f9a63'); for (let k = 0; k < 5; k++) pxl(S, 3 + (k * 2) % 7, 8 + (k * 3) % 6, '#ffffff'); rc(S, 3, 12, 6, 2, '#c4553d'); });
  // 2 Диско
  f(2, 'A', S => { rc(S, 1, 5, 10, 10, '#c9d3e0'); rc(S, 1, 5, 10, 1, '#ffffff'); for (let k = 0; k < 8; k++) pxl(S, 2 + (k * 3) % 9, 7 + (k * 5) % 7, k % 2 ? '#ffffff' : '#ff5fa2'); rc(S, 1, 10, 10, 1, '#ff5fa2'); rc(S, 2, 2, 1, 4, '#ffe08a'); rc(S, 9, 2, 1, 4, '#ffe08a'); pxl(S, 5, 7, '#ffe08a'); });
  // 3 Аркади
  f(3, 'A', S => { rc(S, 1, 3, 10, 12, '#2a1d1a'); rc(S, 2, 4, 8, 6, '#3fa7a0'); rc(S, 3, 5, 6, 4, '#1b2a4a'); pxl(S, 4, 6, '#33e6ff'); pxl(S, 7, 6, '#33e6ff'); rc(S, 4, 8, 4, 1, '#33e6ff'); rc(S, 2, 11, 3, 2, '#ff5fa2'); rc(S, 7, 11, 3, 2, '#ffe08a'); });
  // 4 Інтернет
  f(4, 'A', S => { rc(S, 1, 4, 10, 11, '#d9a066'); rc(S, 1, 4, 10, 2, '#e8b87a'); rc(S, 5, 4, 2, 11, '#fff4dc'); rc(S, 1, 10, 4, 3, '#ffffff'); pxl(S, 2, 11, '#4a3228'); pxl(S, 3, 11, '#4a3228'); rc(S, 8, 8, 2, 3, '#ffffff'); pxl(S, 9, 9, '#3d5a8c'); });
  // 5 Еко
  f(5, 'A', S => { rc(S, 1, 5, 10, 10, '#c9b070'); for (let y = 5; y < 15; y++) for (let x = 1; x < 11; x++) if ((x + y) % 2) pxl(S, x, y, '#9a8040'); rc(S, 2, 2, 1, 4, '#8a6a30'); rc(S, 9, 2, 1, 4, '#8a6a30'); rc(S, 2, 2, 8, 1, '#8a6a30'); el(S, 4, 8, 1.7, 1.7, '#e8863c'); el(S, 8, 9, 1.7, 1.7, '#c4553d'); el(S, 6, 12, 1.7, 1.7, '#4f9a63'); rc(S, 6, 5, 1, 3, '#8ed4a6'); });
  // 6 Космос
  f(6, 'A', S => { rc(S, 1, 4, 10, 11, '#9c9087'); rc(S, 1, 4, 10, 1, '#cfc5b8'); rc(S, 2, 6, 8, 7, '#cfc5b8'); el(S, 6, 8, 2.2, 2.2, '#86cfe8'); pxl(S, 5, 7, '#ffffff'); rc(S, 2, 12, 8, 1, '#4a3228'); rc(S, 5, 1, 2, 3, '#9c9087'); pxl(S, 5, 0, '#c4553d'); });
  // 7 Неон
  f(7, 'A', S => { rc(S, 1, 5, 10, 10, '#1b1230'); for (let x = 1; x < 11; x++) { pxl(S, x, 5, '#ff5fa2'); pxl(S, x, 14, '#3fa7a0'); } for (let y = 5; y < 15; y++) { pxl(S, 1, y, '#ff5fa2'); pxl(S, 10, y, '#3fa7a0'); } rc(S, 3, 9, 6, 1, '#3fa7a0'); pxl(S, 4, 8, '#ff5fa2'); pxl(S, 6, 11, '#ffffff'); rc(S, 2, 2, 1, 3, '#ff5fa2'); rc(S, 9, 2, 1, 3, '#3fa7a0'); rc(S, 2, 2, 8, 1, '#ffe08a'); });
  window.SHOPBAG_OPT = E;
})();
// Додаємо покупців як спрайти «тип_кадр» (готові малюнки-canvas)
CUSTOMER_TYPES.forEach(type => {
  SPRITES[type + '_0'] = { canvas: CHIBI.make(type, 0) };
  SPRITES[type + '_1'] = { canvas: CHIBI.make(type, 1) };
});
// Звірята-працівники: збираємо 16×16 з верхньої половини голови + спільного тулуба, права половина — дзеркало
const CHIBI_LOWER = ['...d1111', '...d1122', '...d1222', '...d1222', '...d1111', '....33..'];
function composeChibi(p) {
  const lower = CHIBI_LOWER.map(r => r.replace(/1/g, p.body).replace(/2/g, p.belly).replace(/3/g, p.feet));
  return [...p.top, ...lower].map(r => r + r.split('').reverse().join(''));
}
TEAM.forEach(m => { SPRITES['team_' + m.id] = { rows: composeChibi(TEAM_PARTS[m.id]) }; });
// ===== Костюми героїв по епохах =====
const TEAM_GLASSES = (put, kind) => {
  if (kind === 'round') { [4,5,6,9,10,11].forEach(x => { put(x, 5, 'k'); put(x, 6, 'k'); }); put(7, 5, 'k'); put(8, 5, 'k'); put(4, 5, 'w'); put(9, 5, 'w'); }
  else if (kind === 'visor') { for (let x = 3; x <= 12; x++) { put(x, 4, 'T'); put(x, 6, 'T'); } put(3, 5, 'T'); put(12, 5, 'T'); put(2, 5, 'f'); put(13, 5, 'f'); }
  else if (kind === 'nerd') { [4,5,6,9,10,11].forEach(x => { put(x, 4, 'k'); put(x, 6, 'k'); }); put(4, 5, 'k'); put(6, 5, 'k'); put(9, 5, 'k'); put(11, 5, 'k'); put(7, 5, 'k'); put(8, 5, 'k'); }
};
// прикраси на тулубі
function teamDeco(kind, c, put) {
  const row = (y, x0, x1, col) => { for (let x = x0; x <= x1; x++) put(x, y, col); };
  switch (kind) {
    case 'belt': row(13, 4, 11, c); put(7, 13, 'y'); put(8, 13, 'y'); break;
    case 'stripes': row(11, 4, 11, c); row(13, 4, 11, c); break;
    case 'bow': row(10, 6, 9, c); put(7, 11, c); put(8, 11, c); break;
    case 'buttons': put(7, 11, c); put(8, 11, c); put(7, 13, c); put(8, 13, c); break;
    case 'scarf': row(10, 4, 11, c); put(10, 11, c); put(10, 12, c); put(11, 12, c); break;
    case 'pocket': row(13, 4, 6, c); put(5, 12, c); put(6, 12, c); break;
    case 'dots': [[4,11],[6,12],[9,11],[11,12],[5,14],[10,14],[7,13]].forEach(q => put(q[0], q[1], c)); break;
    case 'collar': put(5, 10, c); put(6, 10, c); put(9, 10, c); put(10, 10, c); break;
  }
}
const TEAM_COSTUMES = [
 {
   hats: [
     ['......dddd....y.', '....ddrrrrdd.yy.', '...drrrrrrrrd.y.', '...dddddddddd...'],
     ['................', '....dddddd......', '...dbbbbbbd.....', '..ddbbbbbbdd....'],
     ['.....dwwwwd.....', '....dwwwwwwd....', '...dwwqqqwwwd...', '...dwwwwwwwwd...'],
     ['....h.h..h.h....', '....hhhhhhhh....', '....hrhhhhrh....', '................'],
     ['.....dddd...y...', '....dGGGGd..yy..', '...dGGGGGGd.y...', '...dddddddddd...'],
     null ],
   outfits: [ {b:'c',l:'w',d:'belt',c:'b'}, {b:'r',l:'y',d:'collar',c:'w'}, {b:'g',l:'c',d:'pocket',c:'G'}, {b:'n',l:'w',d:'scarf',c:'y'}, {b:'u',l:'q',d:'buttons',c:'y'}, {b:'t',l:'W',d:'stripes',c:'b'} ] },
 {
   hats: [
     ['.....dddddd.....', '....dwwwwwwd....', '....drrrrrrd....', '....dwwwwwwd....'],
     ['.....dd..dd.....', '....dppddppd....', '.....dd..dd.....', '................'],
     ['................', '....dddddd......', '...duuuuuud.....', '..dduuuuuudd....'],
     ['................', '....dddddd......', '...dnnnnnnd.....', '..ddwwwwwwdd....'],
     ['.....rrrrr......', '....rrrrrrr.....', '....drrrrrd.....', '.......w........'],
     null ],
   outfits: [ {b:'S',l:'w',d:'bow',c:'r'}, {b:'p',l:'w',d:'dots',c:'w'}, {b:'w',l:'S',d:'stripes',c:'r'}, {b:'T',l:'w',d:'collar',c:'w'}, {b:'y',l:'w',d:'buttons',c:'r'}, {b:'n',l:'w',d:'pocket',c:'w'} ] },
 {
   hats: [
     ['.....dddddd.....', '.....dPPPPd..y..', '.....dffffd.....', '..dddddddddddd..'],
     ['...dkkkkkkkkd...', '..dkkkkkkkkkkd..', '..dkkkkkkkkkkd..', '...dkkkkkkkkd...'],
     ['....dEwEwEd.....', '...dEEEEEEEd....', '...dwEEwEEEd....', '....dEEEEEd.....'],
     ['................', '................', '..dffffffffffd..', '..dyffffffffyd..'],
     ['....dyyyyyyd....', '...dyyyyyyyyd...', '.dddddddddddddd.', '................'],
     null ],
   outfits: [ {b:'P',l:'f',d:'collar',c:'y'}, {b:'o',l:'y',d:'stripes',c:'r'}, {b:'f',l:'q',d:'buttons',c:'y'}, {b:'T',l:'w',d:'collar',c:'w'}, {b:'v',l:'P',d:'dots',c:'y'}, {b:'k',l:'f',d:'belt',c:'y'} ],
   glasses: ['round'] },
 {
   hats: [
     ['.....dddddd.....', '...dTTTTTTTd....', '..dTTffffTTTd...', '.dddddddddddd...'],
     ['.......f........', '......fff.......', '.....fffff......', '....dfffffd.....'],
     ['................', '....dgggggg.....', '...dgggggggd....', '..ddddddddd.....'],
     ['.....y..........', '....dddd........', '...dTTTTd.......', '...dfTfTd.......'],
     ['................', '................', '..dryyyyyyrd....', '..drrrrrrrrd....'],
     null ],
   outfits: [ {b:'v',l:'k',d:'buttons',c:'T'}, {b:'f',l:'z',d:'stripes',c:'y'}, {b:'T',l:'k',d:'collar',c:'y'}, {b:'o',l:'w',d:'stripes',c:'v'}, {b:'g',l:'k',d:'belt',c:'y'}, {b:'n',l:'y',d:'dots',c:'f'} ] },
 {
   hats: [
     'headphones',
     ['....dnnnnnnd....', '...dnnnnnnnnd...', '...dnnnnnnnnd...', '...dn......nd...'],
     ['................', '....dwwwwwd.....', '...dwwwwwwwd....', '..ddddddddddd...'],
     ['.....dkkkkd.....', '....dkkkkkkd....', '....dkkkkkkd....', '....dkkkkkkd....'],
     ['.......k........', '......kkk.......', '......k.k.......', '................'],
     null ],
   outfits: [ {b:'n',l:'S',d:'buttons',c:'w'}, {b:'k',l:'e',d:'stripes',c:'a'}, {b:'r',l:'w',d:'pocket',c:'w'}, {b:'u',l:'q',d:'dots',c:'w'}, {b:'g',l:'m',d:'collar',c:'w'}, {b:'w',l:'a',d:'belt',c:'n'} ],
   glasses: ['nerd'] },
 {
   hats: [
     ['.....hhhhhh.....', '....hhhhhhhh....', '....hggggggh....', '.hhhhhhhhhhhhhh.'],
     ['..g..g..g..g....', '..GgGgGgGgGg....', '...dGGGGGGd.....', '................'],
     ['................', '................', '..dgggggggggd...', '..dgwgwgwgwgd...'],
     ['....dwwwwwwd....', '...dwwwwwwwwd...', '.dwwwwwwwwwwwwd.', '.....p..p.......'],
     ['.....dmmmmd.....', '....dmmmmmmd....', '....dmwmwmmd....', '....dmmmmmmd....'],
     null ],
   outfits: [ {b:'c',l:'g',d:'pocket',c:'G'}, {b:'m',l:'w',d:'stripes',c:'g'}, {b:'w',l:'g',d:'belt',c:'b'}, {b:'g',l:'c',d:'buttons',c:'y'}, {b:'y',l:'w',d:'collar',c:'g'}, {b:'b',l:'c',d:'dots',c:'y'} ] },
 {
   hats: [
     'bubble',
     ['....y......y....', '.....e....e.....', '.....dddddd.....', '................'],
     ['................', '.....dddddd.....', '....dkaakaad....', '....dddddddd....'],
     ['................', '.....dddddd.....', '....drrrrrrd....', '....dryyyyrd....'],
     ['.....eeeee......', '....eEEEEEe.....', '....eEEEEEe.....', '.....eeeee......'],
     'bubble' ],
   outfits: [ {b:'E',l:'a',d:'buttons',c:'r'}, {b:'w',l:'E',d:'stripes',c:'r'}, {b:'o',l:'y',d:'collar',c:'w'}, {b:'n',l:'a',d:'belt',c:'y'}, {b:'u',l:'E',d:'dots',c:'y'}, {b:'g',l:'m',d:'pocket',c:'w'} ] },
 {
   hats: [
     ['.....f....f.....', '....fTffffTf....', '................', '................'],
     ['......TTTT......', '.....T....T.....', '......TTTT......', '................'],
     ['...f........f...', '...ff......ff...', '..dffffffffffd..', '................'],
     ['.......T........', '......TT........', '.....TTT........', '....dTTTTd......'],
     ['................', '.....dddddd.....', '....dTTTTTTd....', '....dffffffd....'],
     null ],
   outfits: [ {b:'k',l:'z',d:'stripes',c:'f'}, {b:'z',l:'T',d:'buttons',c:'f'}, {b:'u',l:'k',d:'belt',c:'T'}, {b:'f',l:'k',d:'collar',c:'T'}, {b:'T',l:'z',d:'dots',c:'w'}, {b:'v',l:'k',d:'pocket',c:'f'} ],
   glasses: ['visor'] }
];
function teamEyes(g, base) { for (let y = 4; y <= 7; y++) for (let x = 0; x < 16; x++) { const c = base[y][x]; if (c === 'X' || c === 'x') g[y][x] = c; } }       // костюм не закриває очі
// Костюм героя в епосі: тулуб, капелюх і прикраси (кожен герой одягнений по-своєму)
function composeTeamCostume(id, epoch) {
  const p = TEAM_PARTS[id], k = Object.keys(TEAM_PARTS).indexOf(id), cs = TEAM_COSTUMES[epoch % TEAM_COSTUMES.length];
  const o = cs.outfits[(k * 5 + 1) % cs.outfits.length], hat = cs.hats[(k * 2 + (k >> 2)) % cs.hats.length];
  const lower = CHIBI_LOWER.map(row => row.replace(/1/g, o.b).replace(/2/g, o.l).replace(/3/g, p.feet));
  const g = [...p.top, ...lower].map(row => (row + row.split('').reverse().join('')).split(''));
  const base0 = g.map(r => r.slice());
  const put = (x, y, c) => { if (y >= 0 && y < 16 && x >= 0 && x < 16) g[y][x] = c; };
  teamDeco(o.d, o.c, put);
  if (id === 'spike') { /* їжак без капелюха: колючки лишаються видимими */ }
  else if (Array.isArray(hat)) hat.forEach((row, i) => row.split('').forEach((c, x) => { if (c !== '.') put(x, i, c); }));
  else if (hat === 'headphones') {
    for (let x = 4; x <= 11; x++) put(x, 0, 'k');
    [[3, 1], [12, 1], [2, 2], [13, 2], [2, 3], [13, 3]].forEach(q => put(q[0], q[1], 'k'));
    [5, 6, 7].forEach(y => { put(1, y, 'k'); put(2, y, 'a'); put(14, y, 'k'); put(13, y, 'a'); });
  } else if (hat === 'bubble') {                                  // скляний шолом навколо голови
    const inE = (x, y) => Math.pow((x + .5 - 8) / 7.4, 2) + Math.pow((y + .5 - 5.2) / 6.1, 2) <= 1;
    for (let y = 0; y <= 10; y++) for (let x = 0; x < 16; x++) if (!inE(x, y) && (inE(x - 1, y) || inE(x + 1, y) || inE(x, y - 1) || inE(x, y + 1)) && g[y][x] === '.') g[y][x] = 'a';
    put(3, 2, 'w'); put(4, 1, 'w');
    for (let x = 3; x <= 12; x++) if (g[10][x] !== '.' && g[10][x] !== 'd') g[10][x] = 'e';
  }
  if (cs.glasses && k % 5 === 3) TEAM_GLASSES(put, cs.glasses[0]);
  teamEyes(g, base0);
  return g.map(row => row.join(''));
}
// Спрайти героїв для кожної епохи: team_<id>_e<номер>
TEAM.forEach(m => { for (let e = 0; e < 8; e++) SPRITES['team_' + m.id + '_e' + e] = { rows: composeTeamCostume(m.id, e) }; });
// Скіни героїв (виграш у цирку): святкові костюми й ніндзя — однакові в усіх епохах
function composeTeamSkin(id, kind) {
  const p = TEAM_PARTS[id], k = Object.keys(TEAM_PARTS).indexOf(id);
  let body, legs, deco, decoC;
  if (kind === 'party') { body = ['f', 'T', 'o', 'v', 'p', 'm'][k % 6]; legs = 'w'; deco = ['dots', 'stripes', 'bow'][k % 3]; decoC = 'y'; }
  else if (kind === 'chef') { body = 'w'; legs = 'E'; deco = 'buttons'; decoC = 'r'; }
  else if (kind === 'wizard') { body = 'v'; legs = 'u'; deco = 'dots'; decoC = 'y'; }
  else if (kind === 'royal') { body = 'r'; legs = 'w'; deco = 'collar'; decoC = 'w'; }
  else if (kind === 'santa') { body = 'r'; legs = 'k'; deco = 'belt'; decoC = 'k'; }
  else if (kind === 'witch') { body = 'V'; legs = 'P'; deco = 'dots'; decoC = 'o'; }
  else { body = 'z'; legs = 'n'; deco = 'belt'; decoC = 'r'; }
  const lower = CHIBI_LOWER.map(row => row.replace(/1/g, body).replace(/2/g, legs).replace(/3/g, p.feet));
  const g = [...p.top, ...lower].map(row => (row + row.split('').reverse().join('')).split(''));
  const base0 = g.map(r => r.slice());
  const put = (x, y, c) => { if (y >= 0 && y < 16 && x >= 0 && x < 16) g[y][x] = c; };
  const row = (y, x0, x1, c) => { for (let x = x0; x <= x1; x++) put(x, y, c); };
  const hat = rows => rows.forEach((r, y) => r.split('').forEach((c, x) => { if (c !== '.') put(x, y, c); }));
  teamDeco(deco, decoC, put);
  if (kind === 'party') {                                         // ковпак-конус із помпоном, конфеті на одязі
    hat(['.......yy.......', '......dffd......', '.....dfTfTd.....', '....dfTfTfTd....']);
    [[3, 11, 'y'], [11, 12, 'T'], [5, 13, 'w'], [9, 14, 'y'], [12, 13, 'f'], [4, 14, 'T']].forEach(q => put(q[0], q[1], q[2]));
  } else if (kind === 'chef') {                                   // високий білий ковпак
    hat(['.....wwwwww.....', '....wwwwwwww....', '....wwwwwwww....', '....EEEEEEEE....']);
  } else if (kind === 'wizard') {                                 // гостроверхий капелюх із зіркою
    hat(['.......yy.......', '......uuuu......', '.....uuyuuu.....', '...hhhhhhhhhh...']);
  } else if (kind === 'santa') {                                  // червоний ковпак з білим помпоном
    hat(['.......ww.......', '......rrrr......', '.....rrrrrr.....', '....wwwwwwww....']);
  } else if (kind === 'witch') {                                  // капелюх відьми з помаранчевою стрічкою
    hat(['.......VV.......', '......VVVV......', '....oooooooo....', '...VVVVVVVVVV...']);
  } else if (kind === 'royal') {                                  // золота корона з рубінами
    hat(['...h..h..h..h...', '...hhhhhhhhhh...', '...hrhhhhhhrh...', '................']);
  } else {                                                        // капюшон ніндзя з червоною пов'язкою, маска на нижній частині морди
    row(1, 4, 11, 'z'); row(2, 3, 12, 'z'); row(3, 3, 12, 'z'); row(4, 2, 13, 'r');
    put(14, 4, 'r'); put(14, 5, 'r'); put(15, 6, 'r');
    row(8, 3, 12, 'z'); row(9, 4, 11, 'z');
    put(5, 5, 'w'); put(10, 5, 'w');
  }
  teamEyes(g, base0);
  return g.map(r => r.join(''));
}
['party', 'ninja', 'chef', 'wizard', 'royal', 'santa', 'witch'].forEach(kind => TEAM.forEach(m => { SPRITES['team_' + m.id + '_sk_' + kind] = { rows: composeTeamSkin(m.id, kind) }; }));
function teamSprite(id) { const s = skinOn('hero'); return s ? 'team_' + id + '_sk_' + s : 'team_' + id + '_e' + (viewEpoch() % 8); }
Object.keys(NPC_PARTS).forEach(id => { SPRITES['npc_' + id] = { rows: composeChibi(NPC_PARTS[id]) }; });
SPRITES.npc_clock = { rows: CLOCK_ROWS };
// Капі: 28×24, дивиться вправо (у грі віддзеркалюється). Контур намальований прямо в спрайті.
// База — 27×21, намальована дивлячись ліворуч: O — контур, B — шерсть, M — морда/вушко, L — світліші плями, K — око.
// Одяг (капелюшок + вбрання) накладається поверх бази, потім усе віддзеркалюється.
const CAPY_BASE = [
  '......OO...OO..............',
  '.....OOOOOOMMO.............',
  '...OOBBBBBOBMO.............',
  '..OBBBBBBBBBOBO............',
  '.OBBBBBBBBBBBBBO...........',
  'OBBBBBBKKBBBBBBBOOOOOOO....',
  'OMMMBBBKKBBBBBBBBBBBBBBO...',
  'OMOMMBBBBBBBBBBBBBBBBBBBO..',
  'OMMMMBBBBBBBBBBBBBBBBBBBBO.',
  'OMMMMBBBBBBBBBBBBBBBBBBBBBO',
  'OMMMMBBBBBBBBBBBBBBBBBBBBBO',
  '.OMMMBBBBBBBBBBBBBBBBBBBBBO',
  '..OOOOLLBBBBBBBBBBBBBBBBBBO',
  '......OBBBBBBBBBBBBBBBBBBBO',
  '......OBBBBBBBBBBBBBBBBBBBO',
  '.......OBBBBBBBBBBBBBBBBBO.',
  '.......OLLBBBBBBBBBBBBBBBO.',
  '.......OLLOBBBOLLLLBBBBBO..',
  '........OMOBBOOOOOMMOBBO...',
  '........OOOMMO....OOOMMO...',
  '..........OOO.......OOO....'
];
// Одяг на все тулуб: фарбує кожен піксель шерсті від шиї до крупа (голова й ноги лишаються).
// paint(x, y, f) повертає колір; f — чи піксель на верхньому / нижньому / лівому / правому краю одягу
function paintBody(grid, off, paint) {
  const fur = (x, y) => { const c = grid[y] && grid[y][x + off]; return c === 'B' || c === 'L'; };
  const cells = new Set();
  for (let y = 9; y <= 20; y++) for (let x = 0; x < 27; x++) if (fur(x, y) && (x >= 12 || (y >= 15 && x >= 7))) cells.add(x + ',' + y);
  const on = (x, y) => cells.has(x + ',' + y);
  [...cells].map(k => k.split(',').map(Number)).forEach(([x, y]) => {
    const c = paint(x, y, { top: !on(x, y - 1), bottom: !on(x, y + 1), left: !on(x - 1, y), right: !on(x + 1, y) });
    if (c) grid[y][x + off] = c;
  });
}
function makeCapyRows(outfit) {
  const W = 27, grid = Array.from({ length: 24 }, (_, y) => y < 3 ? Array(W).fill('.') : CAPY_BASE[y - 3].split(''));
  const put = (x, y, c) => { if (grid[y] && x >= 0 && x < W) grid[y][x] = c; };
  const dye = (x0, x1, y0, y1, col) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (grid[y][x] === 'B' || grid[y][x] === 'L') grid[y][x] = col; };   // фарбує лише шерсть
  const box = (x, y, w, h, fill) => { for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) put(x + i, y + j, (i < 0 || j < 0 || i >= w || j >= h) ? 'O' : fill); };   // прямокутник із контуром
  const around = cells => cells.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (grid[y + dy] && grid[y + dy][x + dx] === '.') grid[y + dy][x + dx] = 'O'; }));   // контур навколо прикраси
  const pack = (fill, flap, strap) => {                    // портфель на спині (Капі дивиться вліво, потім усе віддзеркалюється)
    box(18, 6, 5, 4, fill);
    for (let x = 18; x < 23; x++) put(x, 6, flap);
    put(20, 8, 'y');
    put(18, 11, strap); put(18, 12, strap);
  };
  if (outfit === 'girl') {                                 // рожева квіточка на голові + рожевий портфель
    pack('p', 'f', 'q');                                  // маленький рожевий портфель на спині
    const fl = [[7, 1, 'p'], [6, 2, 'p'], [7, 2, 'y'], [8, 2, 'p'], [7, 3, 'p']];
    fl.forEach(([x, y, c]) => put(x, y, c)); around(fl);
  } else if (outfit === 'boy') {                           // зелений листочок на голові + синій портфель
    pack('n', 's', 'w');                                  // маленький синій портфель на спині
    const lf = [[6, 1, 'g'], [5, 2, 'g'], [6, 2, 'g'], [8, 1, 'g'], [8, 2, 'g'], [9, 2, 'g'], [7, 2, 'G'], [7, 3, 'G']];
    lf.forEach(([x, y, c]) => put(x, y, c)); around(lf);
  }
  return grid.map(row => '.' + row.reverse().join(''));
}
SPRITES.capy = { rows: makeCapyRows('girl'), variants: { blink: { K: PALETTE.B } } };
SPRITES.capy_m = { rows: makeCapyRows('boy'), variants: { blink: { K: PALETTE.B } } };
// Скіни Капі (виграш у цирку): капелюх і вбрання накладаються на ту саму базу, що й звичайний одяг (однакові для дівчинки й хлопчика)
function makeCapySkinRows(kind) {
  const ox = (kind === 'astro' || kind === 'ep6') ? 2 : 0, W = 27 + ox;          // у космічному скіні спереду є відступ на скляний шолом
  const grid = Array.from({ length: 24 }, (_, y) => y < 3 ? Array(W).fill('.') : ('.'.repeat(ox) + CAPY_BASE[y - 3]).split(''));
  const at = (x, y) => (grid[y] ? grid[y][x + ox] : undefined);
  const put = (x, y, c) => { if (grid[y] && x + ox >= 0 && x + ox < W) grid[y][x + ox] = c; };
  const dye = (x0, x1, y0, y1, col) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (at(x, y) === 'B' || at(x, y) === 'L') put(x, y, col); };
  const rect = (x0, x1, y0, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  const around = cells => cells.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (at(x + dx, y + dy) === '.') put(x + dx, y + dy, 'O'); }));
  const cellsOf = (x0, y0, rows) => { const out = []; rows.forEach((r, j) => r.split('').forEach((c, i) => { if (c !== '.') { put(x0 + i, y0 + j, c); out.push([x0 + i, y0 + j]); } })); return out; };
  if (kind === 'pirate') {                                   // трикутний капелюх з черепом, пов'язка на оці, смугаста тільняшка й червоний пояс
    paintBody(grid, ox, (x, y, f) => {                     // бордова піратська куртка на все тіло: золота облямівка, ґудзики, чорний пояс із пряжкою, біле жабо
      if ((x === 12 || x === 13) && y <= 15) return y % 2 ? 'w' : 'E';
      if (f.bottom) return 'h';
      if (x === 19 || x === 20) return (y === 14 || y === 15) ? 'h' : 'k';
      if (f.top) return 'r';
      if (x === 15 && y % 3 === 0) return 'h';
      return y <= 11 ? 'r' : (y >= 17 ? 'P' : 'R');
    });
    cellsOf(6, 14, ['rrrrr', '.rrr.', '..r..']);              // червона хустка на шиї
    around(cellsOf(2, 1, [
      '....kkkkkk....',
      '..kkkkkkkkkk..',
      '.kkkkkwwkkkkk.',
      '.kkkkwkkwkkkk.',
      'hhhhhhhhhhhhhh'
    ]));
    cellsOf(6, 8, ['kkk', 'kkk', 'kkk']);                    // пов'язка на оці (3×3)
    put(5, 7, 'k'); put(4, 6, 'k'); put(9, 9, 'k');          // зав'язка пов'язки
    put(14, 5, 'h'); put(14, 6, 'h');                         // золота сережка
  } else if (kind === 'astro') {                             // білий скафандр, ранець, шолом із блакитним склом
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'w') put(x, 17, 'E'); if (at(x, 16) === 'w') put(x, 16, 'E'); }
    rect(14, 19, 11, 11, 'o'); rect(14, 19, 12, 12, 'r');     // кольорова смужка на грудях
    put(21, 11, 'n'); put(22, 11, 'n'); put(21, 12, 'n'); put(22, 12, 'w');   // нашивка
    put(14, 14, 'a'); put(16, 14, 'o'); put(18, 14, 'r');     // кнопки на панелі
    cellsOf(5, 14, ['EEEEEE', '.EEEE.']);                     // комір
    around(cellsOf(17, 5, ['EEEEEE', 'EaEEaE', 'EEEEEE']));  // ранець на спині
    for (let y = 0; y <= 15; y++) for (let x = -2; x < 25; x++) {   // скляна куля навколо голови
      const d = Math.pow((x - 7.5) / 9.7, 2) + Math.pow((y - 8.8) / 9.1, 2);
      if (d >= 0.8 && d <= 1.1 && at(x, y) === '.') put(x, y, d >= 0.95 ? 'O' : 'a');   // скло з темним контуром, як у решти спрайтів
    }
    [[5, 1], [6, 1], [3, 2], [2, 3], [1, 4]].forEach(q => put(q[0], q[1], 'w'));   // блик на склі
    cellsOf(10, 0, ['.d', '.d']);                              // антенка на шоломі
    put(10, 0, 'r');
  } else if (kind === 'ep0') {                               // Відродження: бордовий берет із білим пером і брошкою, брижі, бордова накидка із золотою лілією
    dye(12, 25, 9, 17, 'R');
    for (let x = 12; x <= 25; x += 2) put(x, 9, 'h');
    [[19, 12], [19, 13], [19, 14], [18, 13], [20, 13], [19, 11]].forEach(q => put(q[0], q[1], 'h'));
    for (let y = 9; y <= 17; y++) if (at(25, y) === 'R') put(25, y, 'h');
    around(cellsOf(3, 1, ['...RRRRRR...', '.RRRRRRRRRR.', 'RRRRRRRRRRRR', 'hhhhhhhhhhhh']));
    put(9, 3, 'y'); put(8, 3, 'y');                           // брошка
    around(cellsOf(13, 0, ['.ww', 'www', 'ww.']));            // біле перо
    cellsOf(12, 10, ['.ww', 'ww.', '.ww', 'ww.', '.ww', 'ww.', '.ww']);   // брижі на шиї (між головою й накидкою)
  } else if (kind === 'ep1') {                               // Ретро: червоно-біла кепка, синя університетська куртка з літерою «C»
    dye(12, 25, 9, 17, 'n');
    for (let x = 12; x <= 25; x++) if (at(x, 9) === 'n') put(x, 9, 'w');
    cellsOf(15, 11, ['wwww', 'w...', 'w...', 'w...', 'wwww']);
    for (let y = 9; y <= 17; y++) if (at(12, y) === 'n') put(12, y, 'w');
    around(cellsOf(3, 2, ['...rrrrrrr...', '..rrrwwwrrr..', '.rrrrwrwrrrr.']));
    cellsOf(0, 5, ['rrrrrrrr']); put(8, 3, 'r');
  } else if (kind === 'ep2') {                               // Диско: великі фіолетові окуляри, блискуча срібна куртка, намисто з перлин
    dye(12, 25, 9, 17, 'E');
    for (let y = 9; y <= 17; y++) for (let x = 12; x <= 25; x++) { if (at(x, y) !== 'E') continue; const k = (x * 7 + y * 13) % 6; put(x, y, k === 0 ? 'w' : k === 1 ? 'a' : k === 2 ? 'S' : k === 3 ? 'q' : 'E'); }
    cellsOf(5, 6, ['.uuuu.', 'u....u', 'u....u', 'u....u', 'u....u', '.uuuu.']); put(6, 7, 'f'); cellsOf(11, 8, ['uuu']);
    put(16, 3, 'w'); put(15, 2, 'q'); put(17, 2, 'a');
  } else if (kind === 'ep3') {                               // Аркади: чорна кепка з інопланетянином, бірюзові навушники, темна толстовка з геймпадом
    dye(12, 25, 9, 17, 'z'); for (let x = 12; x <= 25; x++) if (at(x, 9) === 'z') put(x, 9, 'n');
    cellsOf(16, 12, ['wwwwww', 'wNwwrw', 'wwwwww']);
    around(cellsOf(3, 2, ['...kkkkkk...', '..kkkkkkkk..', '.kkkkkkkkkk.']));
    cellsOf(0, 5, ['kkkkkkkk']); cellsOf(6, 3, ['f.f', '.f.', 'f.f']);
    around(cellsOf(10, 6, ['NN', 'NN', 'NN', 'NN']));
  } else if (kind === 'ep4') {                               // Інтернет: синя кепка, навушники, біла толстовка, синій рюкзак
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 13) === 'w') put(x, 13, 'n'); if (at(x, 17) === 'w') put(x, 17, 'n'); }
    cellsOf(15, 10, ['.nn.', 'n..n', '.nn.']);
    cellsOf(6, 15, ['n.n']);
    around(cellsOf(3, 2, ['...nnnnnn...', '..nnnwwnnnn..', '.nnnnwwnnnnn.']));
    cellsOf(0, 5, ['nnnnnnn']);
    around(cellsOf(10, 6, ['kk', 'kN', 'kk']));
    around(cellsOf(18, 5, ['zzzzzz', 'zzzzzz', 'zNNzzz', 'zzzzzz', 'zzzzzz', 'zzzzzz']));
  } else if (kind === 'ep5') {                               // Еко: солом'яний капелюх із листочками, зелена куртка, рюкзак з листком
    dye(12, 25, 9, 17, 'g');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'g') put(x, 17, 'G'); if (at(x, 16) === 'g') put(x, 16, 'G'); }
    cellsOf(15, 12, ['.m.', 'mmm', 'mGm', '.G.']);
    around(cellsOf(18, 5, ['GGGGGG', 'GmmmGG', 'GGmGGG', 'GGGGGG', 'GGGGGG', 'GGGGGG']));
    around(cellsOf(2, 2, ['....cccccc....', '...cccccccc...', '...gggggggg...', '.cccccccccccc.', 'cccccccccccccc']));
    cellsOf(1, 4, ['gg']); cellsOf(14, 4, ['gg']); put(2, 5, 'G'); put(15, 5, 'G'); put(8, 1, 'g'); put(8, 0, 'm'); put(9, 0, 'g');
  } else if (kind === 'ep6') {                               // Космос: скляний шолом, білий скафандр з помаранчевими латками, синій ранець
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'w') put(x, 17, 'E'); if (at(x, 16) === 'w') put(x, 16, 'E'); }
    cellsOf(14, 11, ['oo', 'oo']); cellsOf(21, 12, ['nn', 'nw']); cellsOf(17, 13, ['rrr']);
    cellsOf(5, 14, ['EEEEEE', '.EEEE.']);
    around(cellsOf(17, 5, ['nnnnnn', 'nanana', 'nnnnnn']));
    for (let y = 0; y <= 15; y++) for (let x = -2; x < 25; x++) {
      const d = Math.pow((x - 7.5) / 9.7, 2) + Math.pow((y - 8.8) / 9.1, 2);
      if (d >= 0.8 && d <= 1.1 && at(x, y) === '.') put(x, y, d >= 0.95 ? 'O' : 'a');
    }
    [[5, 1], [6, 1], [3, 2], [2, 3], [1, 4]].forEach(q => put(q[0], q[1], 'w'));
  } else if (kind === 'ep7') {                               // Неон: чорний капюшон, бірюзовий візор, рожеві навушники, куртка з неоновими лініями
    dye(12, 25, 9, 17, 'V');
    for (let x = 12; x <= 25; x++) { if (at(x, 11) === 'V') put(x, 11, 'f'); if (at(x, 14) === 'V') put(x, 14, 'N'); }
    for (let y = 9; y <= 17; y++) { if (at(17, y) === 'V') put(17, y, 'N'); if (at(21, y) === 'V') put(21, y, 'f'); }
    around(cellsOf(2, 2, ['..VVVVVVVV..', '.VVVVVVVVVV.', 'VVVVVVVVVVVV', 'VVVVVVVVVVVV']));
    cellsOf(3, 7, ['NNNNNNNNN', 'NNwNNNNNN']); cellsOf(12, 7, ['NNN']);
    around(cellsOf(10, 5, ['ff', 'ff', 'ff', 'ff']));
  } else if (kind === 'wizard') {                            // чарівник: фіолетовий капелюх із зорями й золотою стрічкою, мантія із зірками
    dye(12, 25, 9, 17, 'u');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'u') put(x, 17, 'v'); if (at(x, 16) === 'u') put(x, 16, 'v'); }
    [[14, 11], [18, 13], [22, 11], [16, 15], [21, 15], [24, 13]].forEach(q => put(q[0], q[1], 'y'));
    around(cellsOf(4, 0, ['.....uy.....', '....uuuu....', '...uuuuuu...', '..uuuuyuuu..', '.uuuuuuuuuu.', 'hhhhhhhhhhhh']));
    put(14, 4, 'y');
  } else if (kind === 'santa') {                             // Дід Мороз: червона шуба з білим хутром і поясом, ковпак з помпоном
    dye(12, 25, 9, 17, 'r');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'r') put(x, 17, 'w'); if (at(x, 16) === 'r') put(x, 16, 'w'); if (at(x, 13) === 'r') put(x, 13, 'k'); }
    put(18, 13, 'h'); put(19, 13, 'h'); put(18, 12, 'r');
    for (let y = 9; y <= 17; y++) if (at(12, y) === 'r') put(12, y, 'w');
    cellsOf(6, 14, ['wwwww', '.www.', '..w..']);
    around(cellsOf(4, 0, ['.....ww.....', '....rrrr....', '...rrrrrr...', '..rrrrrrrr..', '.rrrrrrrrrr.', 'wwwwwwwwwwww']));
  } else if (kind === 'witch') {                             // відьма: гостроверхий капелюх з помаранчевою стрічкою, чорно-фіолетова накидка, гарбуз на спині
    dye(12, 25, 9, 17, 'V');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'V') put(x, 17, 'o'); if (at(x, 16) === 'V') put(x, 16, 'P'); }
    [[14, 11], [19, 12], [23, 11], [17, 14]].forEach(q => put(q[0], q[1], 'y'));
    around(cellsOf(18, 5, ['..gg..', '.oooo.', 'oooooo', 'oooooo', '.oooo.']));
    around(cellsOf(2, 0, ['.......VV.....', '......VVV.....', '.....VVVV.....', '....VVVVVV....', '....oooooo....', '.VVVVVVVVVVVV.']));
  } else if (kind === 'flower') {                            // весна: вінок із квітів, рожева сукня в квіточку
    dye(12, 25, 9, 17, 'q');
    for (let y = 9; y <= 17; y++) for (let x = 12; x <= 25; x++) if (at(x, y) === 'q' && (x * 3 + y * 5) % 7 === 0) put(x, y, 'f');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'q') put(x, 17, 'p'); if (at(x, 9) === 'q') put(x, 9, 'w'); }
    around(cellsOf(3, 3, ['..p...w...p.', '.pyp.wyw.pyp', 'gGgggggGgggg']));
    cellsOf(14, 12, ['.y.', 'yfy', '.y.']);
  } else if (kind === 'beach') {                             // літо: солом'яний капелюх, сонцезахисні окуляри, гавайська сорочка, намисто з квітів
    dye(12, 25, 9, 17, 'T');
    [[14, 11], [17, 13], [20, 11], [23, 13], [15, 15], [21, 15], [24, 16]].forEach(q => put(q[0], q[1], 'y'));
    for (let x = 12; x <= 25; x++) { if (at(x, 9) === 'T') put(x, 9, 'w'); if (at(x, 17) === 'T') put(x, 17, 'n'); }
    cellsOf(6, 14, ['fyofy', '.pyp.']);
    around(cellsOf(5, 8, ['kkkkk', 'kwkkk'])); cellsOf(10, 8, ['kkkk']);
    around(cellsOf(2, 2, ['....cccccc....', '...cccccccc...', '...rrrrrrrr...', '.cccccccccccc.']));
    cellsOf(0, 5, ['cccccccccccccccc']);
  } else if (kind === 'autumn') {                            // осінь: помаранчева в'язана кофта, смугастий шарф, ковпак-жолудь, кленовий листок на спині
    dye(12, 25, 9, 17, 'o');
    for (let x = 12; x <= 25; x++) { if (at(x, 12) === 'o') put(x, 12, 'r'); if (at(x, 15) === 'o') put(x, 15, 'r'); if (at(x, 17) === 'o') put(x, 17, 'b'); }
    cellsOf(5, 13, ['rwrwrwr', '.rwrwr.', '..rwr..']);
    around(cellsOf(18, 5, ['.r.r.', 'rrrrr', '.rrr.', '..b..']));
    around(cellsOf(4, 1, ['...bbbbbb...', '..bbbbbbbb..', '.hhhhhhhhhh.', 'hhhhhhhhhhhh']));
    put(9, 0, 'b'); put(9, 1, 'b');
  } else if (kind === 'chef') {                              // шеф-кухар: високий білий ковпак, біла куртка з ґудзиками, червона хустка
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'w') put(x, 17, 'E'); if (at(x, 16) === 'w') put(x, 16, 'E'); }
    [11, 13, 15].forEach(y => put(16, y, 'k'));
    cellsOf(6, 14, ['rrrrr', '.rrr.', '..r..']);
    around(cellsOf(5, 0, ['..wwwwww..', '.wwwwwwww.', 'wwwwwwwwww', 'wwwwwwwwww', 'EEEEEEEEEE']));
  } else if (kind === 'explorer') {                          // дослідник: сафарі-капелюх, жилетка з кишенями, зелений рюкзак
    dye(12, 25, 9, 17, 'c');
    cellsOf(14, 12, ['bbbb', 'bccb', 'bbbb']); cellsOf(20, 12, ['bbbb', 'bccb', 'bbbb']);
    for (let x = 12; x <= 25; x++) if (at(x, 13) === 'c') put(x, 13, 'b');
    around(cellsOf(18, 5, ['gggggg', 'gGGGGg', 'gggggg', 'gggggg', 'gggggg']));
    around(cellsOf(3, 2, ['...cccccc...', '..cccccccc..', '.bbbbbbbbbb.']));
    cellsOf(0, 5, ['cccccccccccccccc']);
  } else if (kind === 'detective') {                         // детектив: коричневий капелюх-федора, бежевий плащ із поясом
    dye(12, 25, 9, 17, 'c');
    for (let x = 12; x <= 25; x++) { if (at(x, 13) === 'c') put(x, 13, 'b'); if (at(x, 17) === 'c') put(x, 17, 'l'); }
    [11, 15].forEach(y => put(16, y, 'b'));
    cellsOf(10, 9, ['bb', 'bw']); cellsOf(7, 14, ['cc.', 'ccc']);
    around(cellsOf(3, 2, ['..bbbbbbbb..', '.bbbbbbbbbb.', '.dddddddddd.']));
    cellsOf(1, 5, ['bbbbbbbbbbbbbb']);
  } else if (kind === 'mel' || kind === 'nika') {            // скіни розробників: MEL — лис, NIKA — зайка
    const fox = kind === 'mel';
    for (let y = 0; y < 24; y++) for (let x = 0; x < 27; x++) {
      const c = at(x, y); if (c !== 'B' && c !== 'L' && c !== 'M') continue;
      if (fox) put(x, y, c === 'B' ? 'o' : c === 'L' ? 'w' : (y >= 20 ? 'd' : (x <= 6 && y >= 10 ? 'w' : 'r')));
      else put(x, y, c === 'B' ? 'w' : c === 'L' ? 'q' : (y >= 20 ? 'q' : 'p'));
    }
    if (fox) {
      for (let y = 9; y <= 16; y++) for (let x = 0; x < 10; x++) if (at(x, y) === 'o' && (x < 5 || (y > 12 && x < 8))) put(x, y, 'w');                  // біла мордочка
      put(1, 8, 'k'); put(2, 8, 'k');
      around(cellsOf(4, -1 + 1, ['.oo.', 'oord'.replace('d', 'o'), 'orro', 'oooo'])); around(cellsOf(9, 0, ['..oo', '.oro', 'orro', 'oooo']));       // гострі вушка
      around(cellsOf(20, 1, ['....ww', '...wwo', '..wooo', '.ooooo', '.ooooo', '.oooo.', '..ooo.']));                                              // пухнастий хвіст із білим кінчиком
      cellsOf(12, 15, ['w', 'ww']); for (let x = 12; x <= 24; x++) { if (at(x, 15) === 'o') put(x, 15, 'w'); }                                       // біле черевце
    } else {
      around(cellsOf(4, 0, ['.ww.', 'wppw', 'wppw', 'wppw', 'wwww'])); around(cellsOf(9, 0, ['.ww.', 'wppw', 'wppw', 'wppw', 'wwww']));                       // довгі вушка
      around(cellsOf(21, 11, ['.ww', 'www', 'www', '.ww']));                                                                                       // хвостик-помпон
      cellsOf(6, 14, ['pp.pp', '.ppp.', 'pp.pp']); put(8, 14, 'f');                                                                                 // рожевий бант
      put(4, 10, 'q'); put(5, 10, 'q');
    }
  } else if (kind === 'sailor') {                            // моряк: біла матроска з синім коміром, шапка з якорем, червона хустка
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 9) === 'w') put(x, 9, 'n'); if (at(x, 10) === 'w') put(x, 10, 'n'); if (at(x, 16) === 'w') put(x, 16, 'n'); }
    for (let x = 13; x <= 24; x += 3) put(x, 12, 'n');
    cellsOf(6, 14, ['rrrr', '.rr.']);
    around(cellsOf(4, 2, ['..wwwwww..', '.wwwwwwww.', 'wwwwnnwwww']));
    cellsOf(3, 5, ['nnnnnnnnnn']);
  }
  return grid.map(row => '.' + row.reverse().join(''));
}
SPRITES.capy_pirate = { rows: makeCapySkinRows('pirate') };
SPRITES.capy_astro = { rows: makeCapySkinRows('astro'), variants: { blink: { K: PALETTE.B } } };
['wizard', 'chef', 'explorer', 'detective', 'sailor', 'santa', 'witch', 'flower', 'beach', 'autumn'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapySkinRows(k), variants: { blink: { K: PALETTE.B } } }; });   // незалежні від епохи скіни Капі
// Нові скіни Капі (затінені еліпсами, плащі й шарфи вигнуті): лицар, супергерой, ковбой, фея, вікінг, пілот
Object.assign(PALETTE, { '1': '#f1f5fb', '2': '#aab7cb', '3': '#6f7f9a', '4': '#454f69', '5': '#9a3326', '6': '#ec8a6e', '7': '#e3b04b', '8': '#b57a1f', '9': '#7a5a3a', '@': '#5a3d28', '#': '#c9a678', '%': '#e8d3a0', '&': '#3a6fb0', '*': '#8fc1f0' });
function makeCapyNewRows(kind) {
  const W = 38, H = 24;
  const grid = Array.from({ length: H }, (_, y) => (y < 3 || y > 23) ? Array(W).fill('.') : (CAPY_BASE[y - 3] + '.'.repeat(W - 27)).split(''));
  const at = (x, y) => (grid[y] ? grid[y][x] : undefined);
  const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (y >= 0 && y < H && x >= 0 && x < W) grid[y][x] = c; };
  const isFur = (x, y) => at(x, y) === 'B' || at(x, y) === 'L';
  const dye = (x0, x1, y0, y1, fn) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (isFur(x, y)) put(x, y, typeof fn === 'string' ? fn : fn(x, y)); };
  const rect = (x0, x1, y0, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  const art = (x0, y0, rows) => rows.forEach((r, j) => r.split('').forEach((c, i) => { if (c !== '.') put(x0 + i, y0 + j, c); }));
  // еліпс із освітленням зверху-ліворуч: tones = [світлий, середній, темний]; over — чи малювати поверх будь-чого
  const ell = (cx, cy, rx, ry, tones, over, y0, y1) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { if (y0 !== undefined && (y < y0 || y > y1)) continue; const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy; if (d > 1) continue; if (!over && at(x, y) !== '.') continue; const l = -dx * 0.6 - dy * 0.8; put(x, y, l > 0.55 ? tones[0] : l > -0.25 ? tones[1] : tones[2]); } };
  const outlineAll = (chars, col) => { const todo = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (chars.includes(at(x, y))) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (at(x + dx, y + dy) === '.') todo.push([x + dx, y + dy]); }); todo.forEach(([x, y]) => put(x, y, col || 'O')); };
  const stream = (x0, y0, x1, amp, th0, th1, wav, cols) => { for (let x = x0; x <= x1; x++) { const t = (x - x0) / (x1 - x0), cy = y0 + t * amp + Math.sin(t * wav) * 1.6, th = th0 + (th1 - th0) * t; for (let k = 0; k < th; k++) { const y = cy + k - th / 2; put(x, y, cols(x, k, th, t)); } } };
  if (kind === 'knight') {
    dye(12, 25, 9, 17, (x, y) => y === 9 ? '1' : y <= 11 ? '2' : y <= 14 ? '2' : y <= 16 ? '3' : '4');
    for (let y = 10; y <= 17; y++) if (isFur(12, y)) put(12, y, '1');
    for (let x = 16; x <= 25; x += 4) for (let y = 10; y <= 16; y++) if (at(x, y) === '2' || at(x, y) === '3') put(x, y, y > 13 ? '4' : '3');
    rect(14, 21, 11, 17, 'r'); rect(14, 21, 11, 12, '6'); rect(14, 14, 11, 17, '6'); rect(21, 21, 12, 17, '5'); rect(14, 21, 17, 17, '5');
    art(16, 12, ['.7.', '777', '.7.', '.7.', '.8.']);
    for (let x = 14; x <= 21; x += 2) put(x, 18, x % 4 ? '5' : 'r');
    ell(12.5, 10.5, 3.2, 2.6, ['1', '2', '3'], true);                               // наплічник
    ell(11, 10.5, 2.5, 3, ['2', '3', '3'], true, 9, 12);                            // горжет на шиї
    ell(8.2, 5.8, 7, 3.9, ['1', '2', '3'], true, 2, 7);                               // шолом
    rect(2, 14, 7, 7, '3'); rect(2, 14, 6, 6, '2'); put(3, 6, '1'); put(4, 6, '1');
    rect(8, 9, 7, 7, '4');
    art(7, 0, ['.66r.', '6rrr5', 'rrr55']); art(12, 2, ['5', '5']);

    outlineAll('123456rR');
  } else if (kind === 'hero') {
    stream(14, 8, 36, 5, 2, 5, 4.2, (x, k, th, t) => (k < 1 ? '6' : k > th - 2 ? '5' : 'r'));
    for (let x = 14; x < 27; x++) { put(x, 8, 'r'); put(x, 7, '5'); }
    rect(13, 14, 8, 10, 'r'); put(13, 9, '7'); put(14, 9, '7');
    dye(12, 25, 9, 17, (x, y) => y === 9 ? '*' : y <= 12 ? '&' : y <= 15 ? 'n' : 'z');
    for (let y = 10; y <= 16; y++) if (isFur(12, y)) put(12, y, '*');
    art(16, 11, ['..y..', '.y7y.', 'y777y', '.y7y.', '..y..']);
    rect(12, 25, 16, 16, '7'); put(18, 16, '8'); put(19, 16, 'y');
    for (let y = 21; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 21 ? 'r' : '5');
    for (let y = 7; y <= 10; y++) for (let x = 4; x <= 12; x++) if (isFur(x, y) || at(x, y) === 'K') put(x, y, 'z');
    put(7, 8, 'w'); put(8, 8, 'w'); put(7, 9, 'K'); put(8, 9, 'K'); put(4, 8, '4');
    put(13, 9, 'z'); put(14, 8, 'z'); put(15, 8, '4');
    outlineAll('rR56z&n*7');
  } else if (kind === 'cowboy') {
    dye(12, 25, 9, 17, (x, y) => y === 9 ? '#' : y >= 16 ? '@' : (x % 6 === 0 ? '@' : y <= 12 ? '9' : 'b'));
    for (let y = 10; y <= 16; y++) if (isFur(12, y)) put(12, y, '@');
    for (let x = 12; x <= 25; x++) { put(x, 17, x % 2 ? 'd' : 'b'); if (at(x, 18) === 'B') put(x, 18, x % 2 ? 'b' : '@'); }
    art(17, 11, ['..y..', 'yyyyy', '.yyy.', 'y.y.y']);
    art(5, 13, ['rrrrr', 'rwrwr', '.rrr.', '..r..']); put(4, 13, 'r'); put(10, 13, 'r');
    ell(8.3, 4.2, 4.6, 3.6, ['%', '#', '9'], true, 0, 5);                              // тулія
    rect(4, 12, 4, 4, '@'); put(8, 4, '7'); put(9, 4, '7');                            // стрічка з пряжкою
    for (let x = -1; x <= 17; x++) { const t = (x - 8) / 9, y = 5 + t * t * -2.2 + 2.2; put(x, y, x < 8 ? '#' : '9'); put(x, y + 1, '@'); }
    put(-1, 4, '9'); put(17, 4, '9');
    outlineAll('%#9@bd');
  } else if (kind === 'fairy') {
    const wing = (cx, cy, rx, ry, rot) => { for (let y = Math.floor(cy - ry - 4); y <= Math.ceil(cy + ry + 4); y++) for (let x = Math.floor(cx - rx - 4); x <= Math.ceil(cx + rx + 4); x++) { const dx = x - cx, dy = y - cy, c = Math.cos(rot), s = Math.sin(rot), u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry, d = u * u + v * v; if (d > 1 || at(x, y) !== '.') continue; put(x, y, d > 0.68 ? 'f' : d < 0.12 ? 'w' : (u * 0.6 + v * 0.8 < -0.1 ? 'q' : 'p')); } };
    wing(22, 3.5, 7, 3, -0.7); wing(25.5, 8, 5.2, 2.3, -0.2); wing(17.5, 2.5, 4.5, 2.2, -1.1);
    dye(12, 25, 9, 17, (x, y) => y === 9 ? 'w' : y <= 12 ? 'q' : y <= 14 ? 'p' : 'f');
    for (let y = 10; y <= 17; y++) if (isFur(12, y)) put(12, y, 'w');
    for (let x = 12; x <= 25; x++) { put(x, 17, x % 2 ? 'p' : 'q'); if (isFur(x, 18)) put(x, 18, x % 2 ? 'f' : 'p'); }
    art(16, 11, ['..y..', '.y7y.', '..y..']); for (let k = 0; k < 6; k++) put(13 + k * 2, 14, 'w');
    art(11, 9, ['www']); art(4, 3, ['.y.y.y.', '.y7y7y.', '..y6y..']); put(7, 2, 'w'); put(6, 1, 'y');
    [[26, 4], [30, 6], [20, 0], [3, 1]].forEach(([x, y]) => { put(x, y, 'y'); put(x - 1, y, 'w'); put(x + 1, y, 'w'); put(x, y - 1, 'w'); put(x, y + 1, 'w'); });
    outlineAll('qpfw', 'u');
    outlineAll('y7', 'O');
  } else if (kind === 'viking') {
    ell(26.5, 12.5, 4.6, 4.6, ['7', '8', '9'], true); ell(26.5, 12.5, 3.4, 3.4, ['b', '9', '@'], true); for (let a = 0; a < 8; a++) put(26.5 + Math.cos(a * 0.785) * 3.8, 12.5 + Math.sin(a * 0.785) * 3.8, '7');
    ell(26.5, 12.5, 1.5, 1.5, ['1', '7', '8'], true); put(26, 12, '1');
    outlineAll('789b@1', 'O');
    dye(12, 25, 9, 17, (x, y) => y <= 11 ? (x % 2 ? 'w' : 'E') : y <= 13 ? 'e' : 'b');
    for (let x = 12; x <= 25; x++) { put(x, 12, x % 2 ? 'E' : 'e'); if (isFur(x, 9)) put(x, 9, 'w'); }
    rect(12, 25, 15, 15, '@'); art(17, 15, ['77']); art(17, 14, ['88']);
    for (let x = 12; x <= 25; x++) { put(x, 17, x % 2 ? 'd' : 'b'); }

    ell(8.2, 5.8, 7, 3.9, ['Y', 'E', 'e'], true, 2, 7);
    rect(2, 14, 6, 6, '7'); rect(2, 14, 7, 7, '8'); put(8, 7, '7'); put(8, 6, '1'); rect(1, 15, 5, 5, 'e');
    art(0, 0, ['w.w'.slice(0,1)+'..', 'ww.', '.ww', '.ww', '..w']); art(0, 1, ['']);
    art(13, 0, ['..w', '.ww', 'ww.', 'ww.', 'w..']);

    outlineAll('wYEe7o', 'O');
  } else {
    stream(13, 10, 32, -2, 3, 3, 4.5, (x, k, th, t) => (Math.floor(x / 2) % 2 ? 'w' : 'r'));

    dye(12, 25, 9, 17, (x, y) => y === 9 ? '#' : y <= 11 ? 'b' : (y <= 15 ? '9' : '@'));
    for (let y = 10; y <= 17; y++) if (isFur(12, y)) put(12, y, 'b');
    for (let x = 13; x <= 25; x += 4) for (let y = 11; y <= 16; y++) if (['b', '9', '@'].includes(at(x, y))) put(x, y, y < 13 ? '9' : '@');
    rect(13, 25, 13, 13, '@'); art(17, 14, ['yy', 'yy']); put(17, 15, 'y');
    for (let x = 11; x <= 14; x++) { put(x, 9, 'w'); put(x, 10, x % 2 ? 'E' : 'w'); put(x, 11, 'w'); }
    art(10, 11, ['ww']); art(13, 12, ['w']);
    ell(8.3, 5.6, 6.8, 4.4, ['#', 'b', '@'], true, 1, 7);
    rect(2, 14, 7, 7, '@'); rect(2, 4, 8, 9, '@');                                          // клапани шолома над вухом
    put(3, 9, 'd'); put(13, 8, '@'); put(14, 8, '@'); put(14, 9, '@');
    ell(5.5, 4.8, 2.2, 1.9, ['y', 'h', '8'], true); ell(5.5, 4.8, 1.3, 1.1, ['1', 'a', '*'], true);
    ell(10.5, 4.8, 2.2, 1.9, ['y', 'h', '8'], true); ell(10.5, 4.8, 1.3, 1.1, ['1', 'a', '*'], true);
    rect(7, 9, 5, 5, 'd');
    outlineAll('#b9@hy8wEr5', 'O');
  }
  let maxX = 26; grid.forEach(r => r.forEach((c, x) => { if (c !== '.' && x > maxX) maxX = x; }));     // зайвий порожній простір ззаду обрізаємо
  return grid.map(row => '.' + row.slice(0, maxX + 1).reverse().join(''));
}

['knight', 'hero', 'cowboy', 'fairy', 'viking', 'pilot'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapyNewRows(k), variants: { blink: { K: PALETTE.B } } }; });
SPRITES.capy_mel = { canvas: SPRITES.foxcub_0.canvas }; SPRITES.capy_nika = { canvas: SPRITES.bunny_0.canvas };      // скіни розробників: лисеня (MEL) і зайчик (NIKA) з гри
for (let e = 0; e < 8; e++) SPRITES['capy_ep' + e] = { rows: makeCapySkinRows('ep' + e), variants: { blink: { K: PALETTE.B } } };   // по скіну Капі на кожну епоху
// Старі скіни Капі, детальна версія (як супергерой): еліпси з освітленням, 2–3 тони, чіткі деталі; замінює спрайти зі старої makeCapySkinRows
function makeCapyOldDetail(kind) {
  const ox = (kind === 'astro' || kind === 'ep6') ? 4 : kind === 'beach' ? 2 : 0, W = 40 + ox, H = 24;
  const grid = Array.from({ length: H }, (_, y) => (y < 3 || y > 23) ? Array(W).fill('.') : ('.'.repeat(ox) + CAPY_BASE[y - 3] + '.'.repeat(W - 27 - ox)).split(''));
  const at = (x, y) => (grid[y] ? grid[y][x + ox] : undefined);
  const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (y >= 0 && y < H && x + ox >= 0 && x + ox < W) grid[y][x + ox] = c; };
  const isFur = (x, y) => at(x, y) === 'B' || at(x, y) === 'L';
  const dye = (x0, x1, y0, y1, fn) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (isFur(x, y)) put(x, y, typeof fn === 'string' ? fn : fn(x, y)); };
  const rect = (x0, x1, y0, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  const art = (x0, y0, rows) => rows.forEach((r, j) => r.split('').forEach((c, i) => { if (c !== '.') put(x0 + i, y0 + j, c); }));
  const ell = (cx, cy, rx, ry, tones, over, y0, y1) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { if (y0 !== undefined && (y < y0 || y > y1)) continue; const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy; if (d > 1) continue; if (!over && at(x, y) !== '.') continue; const l = -dx * 0.6 - dy * 0.8; put(x, y, l > 0.55 ? tones[0] : l > -0.25 ? tones[1] : tones[2]); } };
  const outlineAll = (chars, col) => { const todo = []; for (let y = 0; y < H; y++) for (let x = -ox; x < W - ox; x++) if (chars.includes(at(x, y))) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (at(x + dx, y + dy) === '.') todo.push([x + dx, y + dy]); }); todo.forEach(([x, y]) => put(x, y, col || 'O')); };
  const stream = (x0, y0, x1, amp, th0, th1, wav, cols) => { for (let x = x0; x <= x1; x++) { const t = (x - x0) / (x1 - x0), cy = y0 + t * amp + Math.sin(t * wav) * 1.6, th = th0 + (th1 - th0) * t; for (let k = 0; k < th; k++) { const y = cy + k - th / 2; put(x, y, cols(x, k, th, t)); } } };
  const cloth = c => dye(12, 25, 9, 17, (x, y) => y === 9 ? c[0] : y <= 12 ? c[1] : y <= 15 ? c[2] : (c[3] || c[2]));
  const leftEdge = c => { for (let y = 10; y <= 17; y++) if (isFur(12, y)) put(12, y, c); };
  const folds = (cols, every, from) => { for (let x = 13 + (from || 0); x <= 25; x += every) for (let y = 10; y <= 17; y++) if (cols.includes(at(x, y))) put(x, y, cols[cols.length - 1]); };
  const glass = (tint) => { const inside = (x, y) => Math.pow((x - 7.5) / 10.2, 2) + Math.pow((y - 8.8) / 9.4, 2) <= 1; const ring = [], out = [];
    for (let y = -1; y <= 19; y++) for (let x = -4; x <= 25; x++) { if (at(x, y) !== '.') continue; if (inside(x, y)) { if (!(inside(x + 1, y) && inside(x - 1, y) && inside(x, y + 1) && inside(x, y - 1))) ring.push([x, y]); } else if (inside(x + 1, y) || inside(x - 1, y) || inside(x, y + 1) || inside(x, y - 1)) out.push([x, y]); }
    out.forEach(([x, y]) => put(x, y, 'O')); ring.forEach(([x, y]) => put(x, y, (x - 7.5 < -3 && y - 8.8 < -3) ? 'w' : tint)); };
  const sparkle = (x, y, c) => { put(x, y, c || 'y'); put(x - 1, y, 'w'); put(x + 1, y, 'w'); put(x, y - 1, 'w'); put(x, y + 1, 'w'); };
  const beard = cols => { [[15, 1, 8], [16, 1, 8], [17, 2, 8], [18, 2, 7], [19, 3, 6], [20, 4, 5]].forEach(([y, x0, x1]) => { for (let x = x0; x <= x1; x++) put(x, y, x === x0 ? cols[0] : (x === x1 ? cols[2] : cols[1])); }); art(1, 14, [cols[1] + cols[1] + cols[1] + cols[1] + cols[1]]); put(0, 13, cols[1]); put(1, 13, cols[0]); };

  const suit = (rows, rim, dark) => { for (let y = 9; y <= 17; y++) for (let x = 12; x <= 25; x++) if (isFur(x, y)) { let c = rows[y - 9]; if (dark && x >= 24 && y >= 11) c = dark; put(x, y, c); } };
  const cone = (spec, cols) => { spec.forEach(([y, x0, x1]) => { for (let x = x0; x <= x1; x++) put(x, y, x - x0 < 2 ? cols[0] : (x1 - x < 2 ? cols[2] : cols[1])); }); };
  const plus = (x, y, petal, mid) => { put(x, y, mid); put(x - 1, y, petal); put(x + 1, y, petal); put(x, y - 1, petal); put(x, y + 1, petal); };

  if (kind === 'pirate') {
    suit(['r', 'R', 'R', 'R', 'R', 'R', 'R', 'P', 'h'], 'w', 'P');
    for (let x = 12; x <= 25; x++) put(x, 9, x % 2 ? 'h' : 'r');
    rect(13, 25, 14, 14, 'k'); art(18, 13, ['hh', 'hh']); put(18, 14, 'k');                                  // чорний пояс із пряжкою
    [10, 11, 12].forEach(y => { put(14, y, 'h'); put(16, y, 'h'); });                                          // золоті ґудзики
    art(11, 9, ['ww', 'wE']); art(5, 13, ['rrrrr', '.rrr.', '..r..']);                                          // жабо й хустка
    art(19, 3, ['..rr.', '.rkrr', 'yrrr.', '.gggg', '.gnng', '..gg.']);                                         // зелений папуга
    ell(8.2, 5.2, 7, 3.7, ['4', 'k', 'k'], true, 1, 7);                                                         // трикутний капелюх
    rect(1, 15, 6, 6, 'k'); rect(0, 16, 7, 7, 'k'); put(0, 6, 'k'); put(16, 6, 'k'); rect(2, 14, 7, 7, 'h'); put(3, 7, 'y'); put(4, 7, 'y');
    art(6, 3, ['.ww.', 'wkkw', '.ww.']); put(3, 2, 'y'); put(13, 2, 'y');                                       // череп і золоті кутики
    rect(6, 8, 8, 10, 'k'); put(5, 7, 'k'); put(5, 6, 'k'); put(10, 9, 'k'); put(11, 8, 'k'); put(9, 10, 'k'); put(7, 9, '4'); put(6, 8, '4');   // пов'язка на оці
    put(13, 12, 'h'); put(13, 13, 'y');                                                                          // сережка
    outlineAll('rRPkh4wnyEgo', 'O');
  } else if (kind === 'astro') {
    suit(['1', '1', '1', '1', '1', '2', '2', '3', '3'], null, '2');
    rect(14, 20, 11, 13, '4'); rect(14, 20, 11, 11, '3'); put(15, 12, 'r'); put(17, 12, 'y'); put(19, 12, 'N'); put(15, 13, 'o'); put(17, 13, 'a'); put(19, 13, 'w');   // панель на грудях
    art(22, 10, ['nnn', 'wrw', 'nnn']);                                                                           // прапорець
    rect(12, 25, 15, 15, 'r');                                                                                    // червоний пояс
    rect(18, 24, 3, 8, 'E'); rect(18, 24, 3, 3, '1'); rect(24, 24, 4, 8, '3'); rect(18, 24, 8, 8, '3'); rect(20, 22, 5, 6, '4'); put(21, 5, 'N'); put(21, 6, 'o');   // ранець
    glass('a');
    [[6, 2], [7, 1], [4, 3]].forEach(q => put(q[0], q[1], 'w')); put(11, 2, 'w');
    art(10, -1 + 1, ['d', 'd']); put(10, 0, 'r');
    for (let y = 21; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 21 ? '2' : '3');
    outlineAll('1w23E4rynod', 'O');
  } else if (kind === 'wizard') {
    suit(['v', 'u', 'u', 'u', 'P', 'P', 'P', 'V', 'y'], 'v', 'V');
    [[15, 11], [19, 13], [22, 11], [16, 15], [21, 15], [24, 13]].forEach(q => put(q[0], q[1], 'y')); put(19, 12, 'w'); put(19, 14, 'w');
    art(13, 9, ['hhh']);
    beard(['1', 'w', 'E']);   // борода
    cone([[6, 2, 15], [5, 3, 14], [4, 4, 13], [3, 5, 12], [2, 7, 13], [1, 10, 14], [0, 12, 15]], ['v', 'u', 'P']);
    rect(0, 16, 7, 7, 'P'); rect(1, 15, 7, 7, 'u'); rect(0, 16, 7, 7, 'P'); rect(2, 14, 6, 6, 'h'); put(7, 6, 'y'); put(8, 6, 'w'); put(6, 6, 'y');
    put(7, 4, 'y'); put(10, 3, 'y'); put(9, 5, 'w'); sparkle(14, 1, 'y');
    outlineAll('vuPVyhw1E', 'O');
  } else if (kind === 'chef') {
    suit(['1', 'w', 'w', 'w', 'w', 'w', 'w', 'E', 'E'], '1', 'E');
    [11, 13, 15].forEach(y => { put(15, y, 'k'); put(19, y, 'k'); }); for (let y = 10; y <= 17; y++) put(17, y, 'E');
    art(5, 13, ['rrrrr', '.rwr.', '..r..']);
    art(21, 11, ['EEE', 'EEE']); put(22, 10, 'n');
    art(21, 3, ['l', 'c', 'c', 'c', 'c', 'c']); ell(21, 2, 1.7, 1.9, ['y', 'c', 'l'], true);                       // дерев'яна ложка на спині
    ell(5.2, 3.2, 3.2, 2.9, ['1', 'w', 'E'], true); ell(8.6, 2.4, 3.4, 2.6, ['1', 'w', 'E'], true); ell(12, 3.4, 3, 2.7, ['1', 'w', 'E'], true);
    rect(3, 14, 5, 7, 'w'); rect(3, 14, 7, 7, 'E'); rect(3, 14, 5, 5, '1');
    [4, 7, 10, 13].forEach(x => { put(x, 5, 'E'); put(x, 6, 'E'); }); [6, 9, 12].forEach(x => { put(x, 3, 'E'); put(x, 2, 'E'); });
    outlineAll('1wEclyn', 'O');
  } else if (kind === 'explorer') {
    suit(['%', 'c', 'c', 'c', 'c', 'c', 'c', 'l', 'b'], null, 'l');
    art(14, 11, ['bbbb', 'bccb', 'bbbb']); art(20, 11, ['bbbb', 'bccb', 'bbbb']); put(15, 11, 'h'); put(21, 11, 'h');
    for (let x = 12; x <= 25; x++) put(x, 14, 'b');
    art(5, 13, ['rrrrr', '.rwr.', '..r..']);                                                                    // хустка на шиї
    rect(19, 24, 2, 9, 'g'); rect(19, 24, 2, 2, 'm'); rect(24, 24, 3, 9, 'G'); rect(19, 24, 9, 9, 'G'); rect(19, 24, 5, 5, 'G'); put(21, 6, 'y'); put(22, 6, 'y');   // рюкзак із клапаном
    rect(18, 25, -1 + 1, 1, 'c'); put(18, 0, '.'); rect(18, 25, 0, 0, '%'); rect(18, 25, 1, 1, 'l'); put(19, 1, 'b'); put(23, 1, 'b');                              // згорнутий килимок
    ell(8.2, 5.2, 7.2, 3.6, ['%', 'c', 'l'], true, 1, 7);
    rect(0, 16, 7, 7, 'l'); rect(1, 15, 6, 6, 'b'); put(8, 1, '%'); [4, 12].forEach(x => put(x, 3, 'l')); put(8, 2, 'c');
    outlineAll('%clbgGhykad', 'O');
  } else if (kind === 'santa') {
    suit(['w', 'r', 'r', 'r', 'r', 'r', 'r', 'R', 'w'], 'w', 'R');
    for (let x = 12; x <= 25; x++) { put(x, 14, 'k'); put(x, 9, 'w'); }
    art(18, 13, ['hhh', 'hkh', 'hhh']);
    beard(['1', 'w', 'E']);
    ell(8.2, 5.2, 7, 3.4, ['p', 'r', 'R'], true, 2, 6);
    cone([[5, 13, 17], [4, 14, 18], [6, 16, 20]], ['p', 'r', 'R']);
    rect(1, 15, 6, 7, 'w'); rect(2, 14, 7, 7, 'E'); [3, 7, 10, 13].forEach(x => put(x, 6, 'E'));
    ell(19.5, 7.5, 2.3, 2.3, ['1', 'w', 'E'], true);
    outlineAll('prRw1Ekhy', 'O');
  } else if (kind === 'witch') {
    suit(['v', 'V', 'V', 'V', 'P', 'P', 'P', 'V', 'o'], 'v', 'V');
    for (let x = 12; x <= 25; x++) if (isFur(x, 16) || at(x, 16) === 'V') put(x, 16, 'j');
    art(16, 10, ['yy', 'y.', 'y.', 'yy']); put(21, 12, 'y'); put(23, 15, 'y'); put(14, 14, 'y'); put(12, 10, 'h');
    ell(21.5, 6.6, 3.4, 2.8, ['y', 'o', 'j'], true); rect(21, 22, 2, 3, 'G'); put(23, 3, 'g'); put(20, 3, 'g');
    put(20, 5, 'k'); put(22, 5, 'k'); put(23, 5, 'k'); rect(20, 23, 7, 7, 'k'); put(21, 6, 'k'); put(22, 8, 'o'); put(21, 7, 'y');
    cone([[6, 2, 15], [5, 3, 14], [4, 4, 13], [3, 5, 12], [2, 7, 13], [1, 10, 14], [0, 12, 15]], ['v', 'V', 'P']);
    rect(0, 16, 7, 7, 'P'); rect(1, 15, 7, 7, 'V'); rect(2, 14, 6, 6, 'o'); put(7, 6, 'h'); put(8, 6, 'y'); put(6, 6, 'h'); put(3, 6, 'j'); put(4, 6, 'j');
    sparkle(14, 2, 'y');
    outlineAll('vVPojyGgkh', 'O');
  } else if (kind === 'flower') {
    suit(['w', 'q', 'q', 'q', 'q', 'm', 'p', 'p', 'w'], 'w', 'p');
    for (let x = 12; x <= 25; x++) { if (isFur(x, 18)) put(x, 18, x % 2 ? 'q' : 'w'); put(x, 17, x % 2 ? 'w' : 'q'); }
    plus(16, 12, 'w', 'f'); plus(22, 12, 'w', 'y'); put(14, 16, 'f'); put(19, 16, 'w'); put(24, 16, 'f');
    art(17, 13, ['pp.pp']);
    art(19, 5, ['uu.k.uu', 'uvukuvu', '.uukuu.', '..ukuu.'.slice(0, 7)]); put(20, 4, 'k'); put(22, 4, 'k');         // метелик
    rect(2, 14, 4, 4, 'g'); rect(2, 14, 5, 5, 'G');
    plus(3, 3, 'p', 'y'); plus(6, 3, 'w', 'y'); plus(9, 3, 'u', 'y'); plus(12, 3, 'f', 'y');
    put(4, 5, 'g'); put(8, 5, 'g'); put(11, 5, 'g'); put(13, 5, 'g');
    outlineAll('wqpfmgGuyabk', 'O');
  } else if (kind === 'beach') {
    suit(['*', 'T', 'T', 'T', 'T', 'T', 'n', 'n', 'w'], '*', 'n');
    plus(15, 12, 'f', 'y'); plus(21, 12, 'w', 'y'); plus(18, 15, 'y', 'f'); put(24, 15, 'f');
    art(6, 14, ['fyofyo', '.pyp.p', '..f.f.']); art(5, 13, ['m.m.m']);                                          // гірлянда з квітів
    ell(21.5, 5.5, 3.4, 3.4, ['w', 'w', 'E'], true); for (let y = 2; y <= 9; y++) for (let x = 18; x <= 25; x++) { const dx = x - 21.5, dy = y - 5.5; if (dx * dx + dy * dy <= 11.6) { const a = Math.atan2(dy, dx); put(x, y, ['r', 'w', 'n', 'w', 'h', 'w'][Math.floor(((a + Math.PI) / (Math.PI * 2)) * 6) % 6]); } }
    put(20, 3, '1'); put(21, 3, '1');
    rect(5, 10, 8, 9, 'k'); rect(11, 13, 8, 8, 'k'); put(6, 8, 'a'); put(9, 8, 'a'); put(6, 9, '4'); put(9, 9, '4');   // сонцезахисні окуляри
    ell(8.2, 5.4, 6.4, 3.3, ['%', 'c', 'h'], true, 2, 6);
    rect(-1, 17, 7, 7, 'h'); rect(0, 16, 6, 6, 'c'); rect(2, 14, 5, 5, 'r'); rect(2, 14, 4, 4, 'f');
    plus(14, 3, 'w', 'y'); [3, 5, 7, 9].forEach(x => put(x, 3, 'h'));
    outlineAll('*Tnwfyrgmhc%Ek4pao', 'O');
  } else if (kind === 'autumn') {
    stream(14, 11, 34, 3, 3, 4, 3.6, (x) => (Math.floor(x / 2) % 2 ? 'w' : 'r'));
    suit(['h', 'o', 'o', 'o', 'o', 'o', 'j', 'j', 'b'], 'h', 'j');
    for (let x = 12; x <= 25; x++) { if (at(x, 11) === 'o') put(x, 11, x % 4 < 2 ? 'r' : 'w'); if (at(x, 14) === 'o') put(x, 14, 'r'); if (at(x, 16) === 'j') put(x, 16, 'r'); }
    [[14, 12], [18, 12], [22, 12]].forEach(([x, y]) => { put(x, y, 'y'); put(x + 1, y + 1, 'y'); });
    art(4, 12, ['rwrwrwr']); art(4, 13, ['.rwrwr.']); art(5, 14, ['rwrwr']); art(6, 15, ['rwr']);
    art(20, 4, ['..r..', '.rrr.', 'rrorr', '.rrr.', '..b..']); put(19, 6, 'r'); put(25, 6, 'r');
    ell(8.2, 5.2, 6.4, 3.5, ['h', 'o', 'j'], true, 2, 5);
    rect(1, 15, 6, 7, 'r'); rect(1, 15, 7, 7, 'b'); [2, 4, 6, 8, 10, 12, 14].forEach(x => put(x, 6, 'w'));
    [4, 6, 8, 10, 12].forEach(x => { put(x, 3, 'j'); put(x, 4, 'j'); });
    ell(8.5, 1, 2.3, 2.1, ['y', 'h', 'o'], true);
    outlineAll('hojrwybk', 'O');
  } else if (kind === 'ep0') {
    suit(['h', 'R', 'R', 'R', 'R', 'R', 'P', 'P', 'h'], null, 'P');
    [14, 25].forEach(x => { for (let y = 10; y <= 16; y++) if (['R', 'P'].includes(at(x, y))) put(x, y, 'h'); });
    for (let x = 12; x <= 25; x++) put(x, 9, x % 2 ? 'h' : 'r');
    art(17, 11, ['.h.h.', 'hhhhh', '.hhh.', '..h..', '.hhh.']);
    ell(11, 12, 2.6, 3.8, ['1', 'w', 'E'], true, 9, 15); [10, 12, 14].forEach(y => { put(9, y, 'E'); put(10, y, 'E'); put(11, y, 'E'); put(12, y, 'E'); });          // гофрований комір
    art(5, 12, ['hh']); put(6, 13, 'h'); put(6, 14, 'y');
    ell(8.2, 5.2, 7, 3.2, ['r', 'R', 'P'], true, 2, 7);
    rect(1, 15, 6, 7, 'R'); rect(1, 15, 7, 7, 'P'); rect(2, 14, 6, 6, 'h'); put(3, 6, 'y'); put(4, 6, 'y');
    put(9, 4, 'y'); put(8, 4, 'y'); put(9, 5, 'a'); put(8, 5, 'y');
    art(12, 1, ['..ww', '.www', 'www.']); art(15, 0, ['ww']); art(16, 1, ['w']); put(17, 1, 'E'); put(14, 3, 'E');
    outlineAll('rRPhyw1Ea', 'O');
  } else if (kind === 'ep1') {
    suit(['w', '&', '&', 'n', 'n', 'n', 'n', 'z', 'w'], null, 'z');
    for (let x = 12; x <= 25; x++) { put(x, 9, 'w'); if (isFur(x, 17) || at(x, 17) === 'w') put(x, 17, 'r'); if (at(x, 16) === 'z') put(x, 16, 'w'); }
    for (let y = 10; y <= 16; y++) put(13, y, y % 2 ? 'w' : 'r');
    art(16, 10, ['.wwww', 'wwwww', 'ww...', 'ww...', 'ww...', 'wwwww', '.wwww']); put(22, 12, 'y'); put(22, 13, 'y');          // велика літера C
    art(18, 4, ['EEEEEEE', 'EkkEoYE', 'EkkE..E', '3333333']); put(24, 3, 'Y'); put(25, 2, 'Y'); put(25, 1, 'Y');   // радіоприймач
    ell(8.2, 5.3, 7, 3.7, ['p', 'r', '5'], true, 2, 7);
    rect(1, 15, 6, 6, 'r'); rect(1, 15, 7, 7, '5'); rect(0, 5, 7, 7, 'r'); rect(0, 5, 8, 8, '5');
    rect(3, 13, 4, 4, 'w'); art(8, 2, ['w', 'w']); put(3, 5, 'E'); put(13, 5, 'E');
    outlineAll('prw5y&nzEk3oYE', 'O');
  } else if (kind === 'ep2') {
    suit(['w', 'v', 'v', 'v', 'u', 'u', 'u', 'P', 'f'], null, 'P');
    for (let y = 9; y <= 14; y++) put(11 + (y - 9), y, 'w');
    for (let y = 10; y <= 16; y += 2) for (let x = 15; x <= 25; x += 4) if (['v', 'u'].includes(at(x, y))) put(x, y, 'q');
    plus(19, 12, 'y', 'w'); art(13, 15, ['y']);
    ell(20.5, 5.5, 3.3, 3.3, ['w', 'Y', '3'], true); for (let y = 2; y <= 9; y++) for (let x = 17; x <= 24; x++) { const dx = x - 20.5, dy = y - 5.5; if (dx * dx + dy * dy <= 10.9) { const bi = (Math.floor((x - 17) / 2) + Math.floor((y - 2) / 2)); put(x, y, bi % 3 === 0 ? 'w' : bi % 3 === 1 ? 'Y' : 'a'); } }
    put(20, 1, 'k'); put(20, 0, 'k'); sparkle(24, 3, 'q'); sparkle(16, 1, 'y');
    rect(1, 15, 4, 5, 'f'); rect(1, 15, 4, 4, 'p'); [3, 6, 9, 12].forEach(x => put(x, 4, 'y'));
    art(4, 6, ['.uuuu.', 'u....u', 'u....u', 'u....u', 'u....u', '.uuuu.']); art(11, 8, ['uuu']); put(5, 7, 'w'); put(6, 8, 'q'); put(8, 8, 'q'); put(9, 9, 'q'); put(10, 7, 'u');
    outlineAll('wvuPfqyYak3', 'O');
  } else if (kind === 'ep3') {
    suit(['4', 'z', 'z', 'z', 'z', 'k', 'k', 'k', 'n'], null, 'k');
    art(14, 10, ['.YYYYYYY.', 'YYYYYYYYY', 'YYYYYYYYY', '.EEEEEEE.']); put(16, 11, 'k'); put(15, 11, 'k'); put(17, 11, 'k'); put(16, 10, 'k'); put(16, 12, 'k'); put(20, 11, 'r'); put(21, 11, 'y'); put(20, 12, 'N'); put(21, 10, 'f');
    rect(14, 22, 15, 15, '4');
    ell(8.2, 5.2, 7, 3.7, ['4', 'z', 'k'], true, 2, 7);
    rect(1, 15, 6, 7, 'k'); rect(2, 14, 6, 6, '4'); rect(0, 4, 7, 8, 'k'); rect(0, 3, 7, 7, '4');
    art(5, 3, ['N.N.N', 'NNNNN', 'N.N.N']);
    ell(11.5, 8.2, 1.9, 2.6, ['a', 'T', 'n'], true); rect(11, 12, 6, 6, 'T'); put(12, 10, 'N');
    outlineAll('4zkNfyTnaYrE', 'O');
  } else if (kind === 'ep4') {
    suit(['1', 'w', 'w', 'w', 'w', 'w', 'E', 'n', '&'], null, 'E');
    art(15, 10, ['.nnn.', 'n...n', '.n.n.', '..n..']);
    rect(12, 25, 13, 13, 'a'); art(6, 14, ['n.n']); put(6, 15, 'a'); put(8, 15, 'a');
    ell(21.5, 6.3, 3.8, 3.3, ['3', '4', 'z'], true); art(21, 4, ['nnn', 'nNn', 'nnn']); put(23, 8, 'y'); put(19, 6, 'r'); put(19, 4, 'n'); put(19, 5, 'n');
    ell(8.2, 5.3, 7, 3.7, ['*', '&', 'n'], true, 2, 7);
    rect(1, 15, 6, 7, 'n'); rect(0, 4, 7, 8, '&'); rect(0, 4, 8, 8, 'n'); rect(0, 3, 7, 7, '*');
    art(6, 3, ['.ww.', 'wnnw', '.ww.']);
    ell(11.8, 8.6, 1.8, 2.8, ['f', 'p', 'r'], true); rect(11, 12, 6, 6, 'k'); put(12, 11, 'w');
    outlineAll('1wEan&*nfprzyhN34k', 'O');
  } else if (kind === 'ep5') {
    suit(['m', 'g', 'g', 'g', 'g', 'g', 'G', 'G', 'b'], 'm', 'G');
    art(15, 11, ['.m.', 'mgm', 'mGm', '.G.']); put(16, 12, 'g');
    ell(21.5, 7.3, 3.7, 3.1, ['g', 'G', 'G'], true); rect(18, 25, 8, 8, 'b'); art(19, 5, ['mmmm']); put(24, 8, 'b');
    art(21, 2, ['G', 'G']); art(19, 1, ['mm', '.m']); art(22, 1, ['gg', 'g.']);
    ell(8.2, 5.3, 7, 3.6, ['%', 'c', 'l'], true, 2, 6);
    rect(0, 16, 7, 7, 'l'); rect(1, 15, 6, 6, 'c'); rect(2, 14, 5, 5, 'g'); rect(3, 13, 6, 6, 'G'); [4, 7, 10].forEach(x => { put(x, 4, 'm'); put(x + 1, 4, 'g'); });
    plus(13, 3, 'f', 'y'); art(2, 4, ['mg']);
    outlineAll('mgGbl%cfyN', 'O');
  } else if (kind === 'ep6') {
    suit(['*', '&', '&', 'n', 'n', 'n', 'n', 'z', 'z'], null, 'z');
    rect(12, 25, 12, 12, 'N'); rect(12, 25, 15, 15, 'N');
    rect(14, 18, 10, 11, 'w'); put(15, 10, 'k'); put(17, 10, 'k'); art(21, 10, ['oo', 'oo']); art(21, 13, ['rr']);
    ell(21, 6, 3.8, 2.8, ['E', 'Y', '3'], true); rect(18, 24, 5, 5, '4'); put(19, 5, 'N'); put(21, 5, 'N'); put(23, 5, 'N'); put(25, 6, 'o'); put(26, 6, 'y'); put(25, 7, 'o'); put(26, 7, 'o'); put(27, 7, 'y'); put(25, 8, 'o'); put(26, 8, 'y');
    glass('N');
    [[6, 2], [7, 1], [4, 3]].forEach(q => put(q[0], q[1], 'w'));
    for (let y = 21; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 21 ? 'N' : '4');
    outlineAll('E1Y34nBoywrz*&', 'O');
  } else if (kind === 'ep7') {
    suit(['u', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'k'], 'N', 'k');
    for (let x = 12; x <= 25; x++) { if (at(x, 11) === 'V') put(x, 11, 'f'); if (at(x, 14) === 'V') put(x, 14, 'N'); if (isFur(x, 17) || at(x, 17) === 'k') put(x, 17, 'N'); }
    for (let y = 9; y <= 17; y++) { if (['V', 'k'].includes(at(17, y))) put(17, y, 'N'); if (['V', 'k'].includes(at(21, y))) put(21, y, 'f'); }
    put(15, 12, 'w'); put(24, 15, 'w'); put(19, 15, 'w');
    ell(11, 10.8, 3.2, 2.8, ['u', 'V', 'k'], true, 9, 12);
    ell(8.2, 5.4, 7, 3.7, ['u', 'V', 'k'], true, 2, 7); rect(1, 15, 6, 7, 'V'); rect(2, 14, 6, 6, 'u');
    rect(3, 13, 6, 7, 'N'); rect(3, 13, 6, 6, 'w'); put(5, 6, 'T'); put(10, 6, 'T'); put(6, 7, 'T'); put(9, 7, 'T');
    ell(10.8, 4.2, 1.7, 2.6, ['f', 'p', 'r'], true); put(10, 4, 'w');
    sparkle(25, 3, 'N'); sparkle(2, 1, 'f');
    for (let y = 21; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 21 ? 'N' : 'f');
    outlineAll('uVkNfwTprn', 'O');
  }
  let maxX = 26 + ox; grid.forEach(r => r.forEach((c, x) => { if (c !== '.' && x > maxX) maxX = x; }));
  return grid.map(row => '.' + row.slice(0, maxX + 1).reverse().join(''));
}
['pirate', 'astro', 'wizard', 'chef', 'explorer', 'santa', 'witch', 'flower', 'beach', 'autumn', 'ep0', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapyOldDetail(k), variants: k === 'pirate' ? undefined : { blink: { K: PALETTE.B } } }; });
// Привид 11×13 (для «Полювання на привидів») і малий привид 5×7 (блимає у вікнах будинків на Хелловін)
SPRITES.ghost = { rows: [
  '...ddddd...',
  '..dwwwwwd..',
  '.dwwwwwwwd.',
  'dwwkkwkkwwd',
  'dwwkkwkkwwd',
  'dwwwwwwwwwd',
  'dwwwkkkwwwd',
  'dwwwwkwwwwd',
  'dwwwwwwwwwd',
  'dwwwwwwwwwd',
  'dwSwwwwwSwd',
  'dwwdwwwdwwd',
  'dd.ddd.dd.d'
] };
SPRITES.ghost_s = { rows: ['.www.', 'wwwww', 'wkwkw', 'wwwww', 'wwwww', 'wwwww', 'w.w.w'] };
Object.keys(GLYPHS).forEach(k => { SPRITES['glyph_' + k] = { rows: GLYPHS[k] }; });
SPRITES.glyph_coin = SPRITES.coin;
// Монетки й кристали під стиль кожної епохи (індекс — як в EPOCHS): флорин, кафе-жетон, платівка, аркадний жетон, цифрова монета, листок, зоряна монета, неон
const EPOCH_COIN_ROWS = [
  ['..dddd..', '.dhyyhd.', 'dhyhohhd', 'dhhooohd', 'dhhhohhd', 'dhhooohd', '.dhhhhd.', '..dddd..'],
  ['..dddd..', '.dTwwTd.', 'dTTTwTTd', 'dTwwwwwd', 'dTTwwwTd', 'dTwTTwTd', '.dTTTTd.', '..dddd..'],
  ['..dddd..', '.dkkkwd.', 'dkkkkwkd', 'dkkffkkd', 'dkkffkkd', 'dkwkkkkd', '.dwkkkd.', '..dddd..'],
  ['..dddd..', '.dvTTvd.', 'dvTvvTvd', 'dvTTTTvd', 'dvTvvvvd', 'dvTvvvvd', '.dvvvvd.', '..dddd..'],
  ['..dddd..', '.dnaand.', 'dnanaand', 'dnaaaand', 'dnanaand', 'dnaannnd', '.dnnnnd.', '..dddd..'],
  ['..dddd..', '.dgmmgd.', 'dgmgggGd', 'dgggGGgd', 'dgGGGggd', 'dgGgggwd', '.dgggGd.', '..dddd..'],
  ['..dddd..', '.dEwwEd.', 'dEwEEEEd', 'dEEnnEEd', 'duunnuud', 'dEEnnEEd', '.dEEEEd.', '..dddd..'],
  ['..ffff..', '.fkkkkf.', 'fkkTTkkf', 'fkTkkTkf', 'fkTkkTkf', 'fkkTTkkf', '.fkkkkf.', '..ffff..']
];
EPOCH_COIN_ROWS.forEach((rows, i) => { SPRITES['coin_' + i] = { rows }; });
const EPOCH_COIN_COLORS = [['h', 'y'], ['T', 'w'], ['k', 'f'], ['v', 'T'], ['n', 'a'], ['g', 'm'], ['E', 'w'], ['k', 'T']];    // [основа, відблиск] для колеса фортуни
[{ S: 'p', s: 'r', w: 'w' }, { S: 'T', s: 'n', w: 'w' }, { S: 'f', s: 'P', w: 'y' }, { S: 'v', s: 'V', w: 'T' },
 { S: 'a', s: 'n', w: 'w' }, { S: 'm', s: 'g', w: 'w' }, { S: 'S', s: 'u', w: 'y' }, { S: 'T', s: 'f', w: 'w' }].forEach((map, i) => {
  SPRITES['gem_' + i] = { rows: GLYPHS.gem.map(row => row.replace(/[A-Za-z]/g, ch => map[ch] || ch)) };
  SPRITES.shard = { rows: GLYPHS.shard.slice() };
});
const SHARD_CH = '';                                                          // у текстах осколок позначається цим символом, а на екрані замінюється піксельним малюнком
const GEM_CH = '\uE001';                                                     // у текстах кристал позначається цим символом (як осколок), а на екрані замінюється піксельним значком епохи
const GEM_ROWS = [["..hhhh..",".dSSssd.","dSSsssnd","dSsssnnd",".dssnnd.","..dsnd..","...dd...","........"],["..dddd..",".dwqqpd.","dwqqppfd","dqqppffd",".dqppfd.","..dpfd..","...dd...","........"],["..dddd..",".dwSwSd.","dSqSwSEd","dwSEqwSd","dSwSEqwd",".dqwSEd.","..dddd..","...dd..."],["..dddd..",".dvvwud.","dvwvvuud","dvvvuuPd","dvvuuPPd",".duuPPd.","..dPPd..","...dd..."],["..dddd..",".dNNwNd.","dNwNNaad","dNNNaaad","dNNaaand",".dnnnnd.","..dddd..","........"],["...ddd..","..dmmgd.",".dmwmgGd","dmwmggGd","dmmgggGd",".dgggGd.","..dGGd..",".dd.dd.."],["...dd...","..dyyd..","dddyyddd","dyywhhyd","dyyhhhyd","dddhhddd","..dhhd..","...dd..."],["...kk...","..kNNk..",".kNffNk.","kNfwwfNk","kNffffNk",".kNNNNk.","..kkkk..","........"]];    // 8 епох: Відродження, Ретро, Диско, Аркади, Інтернет, Еко, Космос, Неон
const gemUrls = [];
function setGemEpoch(ep) {
  ep = ((ep % GEM_ROWS.length) + GEM_ROWS.length) % GEM_ROWS.length;
  if (!gemUrls[ep]) { const c = document.createElement('canvas'); c.width = 8; c.height = 8; const g = c.getContext('2d'); GEM_ROWS[ep].forEach((row, y) => { for (let x = 0; x < 8; x++) if (row[x] !== '.' && PALETTE[row[x]]) { g.fillStyle = PALETTE[row[x]]; g.fillRect(x, y, 1, 1); } }); gemUrls[ep] = 'url(' + c.toDataURL() + ')'; }
  document.documentElement.style.setProperty('--gem', gemUrls[ep]);
}
(function shardIcons() {
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; const g = c.getContext('2d');
  GLYPHS.shard.forEach((row, y) => { for (let x = 0; x < 8; x++) if (row[x] !== '.') { g.fillStyle = PALETTE[row[x]]; g.fillRect(x, y, 1, 1); } });
  document.documentElement.style.setProperty('--shard', 'url(' + c.toDataURL() + ')');
  const RE = /[\uE000\uE001]/;
  const fix = node => {
    if (node.nodeType === 3) {
      if (!RE.test(node.data)) return;
      const parts = node.data.split(/([\uE000\uE001])/), frag = document.createDocumentFragment();
      parts.forEach(p => { if (p === '\uE000' || p === '\uE001') { const sp = document.createElement('span'); sp.className = p === '\uE000' ? 'shard' : 'gem'; frag.appendChild(sp); } else if (p) frag.appendChild(document.createTextNode(p)); });
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1 && node.tagName !== 'TEXTAREA' && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') { [...node.childNodes].forEach(fix); }
  };
  window.__shardFix = () => fix(document.body);
  new MutationObserver(muts => muts.forEach(m => { if (m.type === 'characterData') fix(m.target); else m.addedNodes.forEach(fix); })).observe(document.body, { childList: true, characterData: true, subtree: true });
  fix(document.body);
})();
// Яку епоху зараз показуємо: справжню або ту, що користувач переглядає (лише вигляд, прогрес не змінюється)
// Обрана минула епоха (state.activeEpoch, -1 — поточна). Заробіток, зокрема офлайн, записується в обрану епоху
function previewIdx() { const a = state.activeEpoch; return ((DEV_OPEN_ALL || state.epoch >= 1) && a >= 0 && a < EPOCHS.length && a !== state.epoch % EPOCHS.length) ? a : null; }
function viewEpoch() { const p = previewIdx(); return p !== null ? p : state.epoch; }
// Скільки монет зароблено в кожній епосі: різницю від останньої перевірки додаємо до обраної епохи
function syncEpochEarned() {
  if (state.epochSeen < 0) {                         // перший запуск після оновлення: те, що зароблено в цьому проході, — до поточної епохи
    if (state.epochEarned.every(v => v === 0)) state.epochEarned[state.epoch % EPOCHS.length] = Math.floor(Math.max(0, state.totalEarned - state.runStartEarned));
    state.epochSeen = state.totalEarned; return;
  }
  const d = state.totalEarned - state.epochSeen;
  if (d > 0) { const i = viewEpoch() % EPOCHS.length; state.epochEarned[i] = (state.epochEarned[i] || 0) + d; }
  state.epochSeen = state.totalEarned;
}
function coinSprite() { return 'coin_' + (viewEpoch() % EPOCH_COIN_ROWS.length); }
function gemSprite() { return 'gem_' + (viewEpoch() % EPOCH_COIN_ROWS.length); }
function refreshCoinIcon() {
  const g = ui.coinIcon.getContext('2d');
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, 8, 8);
  g.drawImage(getSpriteCanvas(coinSprite()), 0, 0);
}

