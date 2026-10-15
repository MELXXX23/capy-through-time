<!--#part 100_a_core_config.js-->
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
const GOD_OWNER = (() => { try { return localStorage.getItem('capyGod') === GOD_HASH; } catch (e) { return false; } })();     // на цьому пристрої введено код власника
const GOD_PAUSED = (() => { try { return localStorage.getItem('capyGodPause') === '1'; } catch (e) { return false; } })();   // кнопка «Режим бога ВИМК» у Налаштуваннях (діє й на exe)
const GOD_ON = GOD_OWNER && !GOD_PAUSED;

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
  WORLD_W: 1560,              // ширина всієї вулиці на ПК (пікселів сцени): її можна гортати стрілками ◀ ▶
  MOBILE_PAD: 440,             // на телефоні вулиця ширша за екран на стільки пікселів з кожного боку (гортається пальцем)
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
  SAVE_KEY: 'capyThroughTime_save',
  SAVE_VERSION: 19,            // номер версії збереження (збільшуємо, коли змінюється формат)
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
  RACCOON_SECONDS: 9,             // скільки Шнирь бігає
  RACCOON_HITS: 5,                // скільки разів треба влучити
  RACCOON_STEAL_SHARE: 0.05,      // краде 5% монеток...
  RACCOON_STEAL_MAX_MINUTES: 10,  // ...але не більше 10 хвилин доходу
  RACCOON_REWARD_MINUTES: 4,      // за перемогу — 4 хвилини доходу

  // Колесо фортуни
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
const EPOCH_GOODS_ICONS = [["🕯️","🍯","🪶","🪆","🧼","🍎","🥖","👘","🥾","🔭","🍷","🎭"],["💌","🍦","📓","🚂","🧽","🥫","🍩","👗","👞","📺","🍔","🎞️"],["🪩","🍭","💿","🪀","💄","🍍","🥐","🕺","👢","📼","🍕","💃"],["🪙","🥤","📼","🎮","🔋","🍌","🍪","🧥","👟","🕹️","🌭","📹"],["💾","🍫","🖱️","🐣","🔌","🥗","☕","👕","👟","💻","🍣","📡"],["♻️","🥜","📒","🪵","🧴","🥕","🍞","🧶","🥿","🔆","🥗","🌳"],["⭐","🧃","🪐","🚀","🧪","🌱","🍙","🧑‍🚀","👢","🛰️","🍜","🌌"],["💡","🧋","🖊️","🤖","🫧","🍇","🍰","🧥","🛹","🥽","🍢","🎆"],["🍵","🍙","🎏","🪭","🧼","🍡","🍜","👘","🥿","🏮","🍣","🎎"]];
const EPOCH_GOODS_KINDS = [["candle","jar","scroll",null,null,null,null,null,null,"scroll","cup","mask"],[null,"cone","scroll",null,null,"jar",null,null,null,null,null,"cassette"],["bulb","cone","record",null,"tube",null,null,null,null,"cassette",null,"bulb"],[null,"cup","cassette","gamepad","tube",null,null,null,null,"gamepad",null,"cassette"],["cassette","cup","laptop",null,"tube",null,"cup",null,null,"laptop",null,"laptop"],[null,"jar",null,null,"tube",null,null,null,null,"solar","plant","plant"],[null,"tube",null,"rocket","tube","plant",null,null,null,"robot","cup","bulb"],["bulb","cup","laptop","robot","tube",null,"cone","bulb",null,"visor","cup","bulb"],["cup","jar","scroll","cone","tube",null,"cone",null,null,"bulb","cup","mask"]];
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
  { w: 154, top: 12, floors: [1], inner: ['q'], wall: 'w', line: 'y', roof: 0, awning: ['r', 'w'], door: 0, signFill: 'd', trim: 'b' },
  { w: 194, top: 24, floors: [2, 0], inner: ['y', 'S'], wall: 'y', line: 'h', roof: 1, awning: ['g', 'w'], door: 0, signFill: 'd', trim: 'b' },
  { w: 234, top: 16, floors: [2, 1, 0], inner: ['S', 'm', 'q'], wall: 'm', line: 'S', roof: 2, awning: ['n', 'w'], door: 1, signFill: 'd', trim: 'n' },
  { w: 276, top: 22, floors: [2, 2, 2, 0], inner: ['m', 'q', 'y', 'S'], wall: 'w', line: 'E', roof: 3, awning: ['o', 'w'], door: 2, signFill: 'r', trim: 'e' },
  { w: 316, top: 28, floors: [2, 3, 2, 2, 0], inner: ['q', 'S', 'y', 'q', 'm'], wall: 'c', line: 'e', roof: 4, awning: ['u', 'w'], door: 3, signFill: 'd', trim: 'l' },
  { w: 358, top: 30, floors: [2, 2, 1, 2, 0, -1], inner: ['m', 'q', 'S', 'q', 'y', 'm'], wall: 'S', line: 's', roof: 5, awning: ['n', 'S'], door: 4, signFill: 'n', trim: 'n' }
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
  tonya:   { body: 'G', belly: 'm', feet: 'g', top: ['....nnnn', '...nnnnn', '..dnnnnh', '.ddddddd', '..dgwwwg', '..dgwXXg', '..dgwxxg', '..dgggmm', '..dggggg', '...dgggg'] },
  zoya:    { body: 'p', belly: 'q', feet: 'w', top: ['..dwd...', '..dqd...', '..dqd...', '..dwdddd', '..dwwwww', '..dwXwww', '..dwxwww', '..dqwwwp', '..dwwwww', '...dwwww'] },
  mikhas:  { body: 'l', belly: 'o', feet: 'b', top: ['.bb.....', '.bbddddd', '..dlllll', '..dlllll', '..dlllll', '..dlXlll', '..dlxlll', '..dlcccc', '..dlccck', '...dllll'] },
  pao:     { body: 'p', belly: 'q', feet: 'k', top: ['.kk.....', '.kkddddd', '..dwwwww', '..dwwwww', '..dwwwww', '..dkwkww', '..dkkkww', '..dwwwwk', '..dwwwww', '...dwwww'] },
  kria:    { body: 'y', belly: 's', feet: 'o', top: ['.......y', '...ddddd', '..dyyyyy', '..dyyyyy', '..dyyyyy', '..dyXyyy', '..dyxyyy', '..dyyooo', '...dyooo', '....dddd'] },
  leo:     { body: 'n', belly: 'w', feet: 'd', top: ['..d.....', '..dod...', '..dooddd', '..dooooo', '..dooooo', '..doXooo', '..doxooo', '..dowwwk', '..dowwww', '...dwwww'] },
  murzyk:  { body: 'u', belly: 'u', feet: 'e', top: ['..d.....', '..ded...', '..deeddd', '..deeeee', '..deeeee', '..deXeee', '..dexeee', '..deEEEp', '..deEEEE', '...deeee'] },
  zhuzha:  { body: 'p', belly: 'q', feet: 'g', top: ['.ddd....', '.dwkd...', '.dgggddd', '.dgggggg', '..dggggg', '..dggggg', '..dgggmm', '..dddddd', '..dgmmmm', '...dgggg'] },
  shnyr:   { body: 'e', belly: 'E', feet: 'k', top: ['..d.....', '..ded...', '..deeddd', '..deeeee', '..dkkkkE', '..dkwkkE', '..dkkkkE', '..deEEEk', '..deEEEE', '...deeee'] },
  toma:    { body: 'b', belly: 'c', feet: 'e', top: ['....dddd', '..ddEEEE', 'eedEEEEE', 'eqdEEEEE', 'eqdEEEEE', 'eqdEXEEE', 'eedExEEE', '.edEEEEE', '..dEEEEe', '...dEEEe'] },
  nara:    { body: 'l', belly: 'w', feet: 'd', top: ['.y.y.y..', '..yyyy..', '..dlllll', '..dlllll', '..dlllll', '..dlXlll', '..dlxlll', '..dlwwwk', '..dlwwww', '...dllll'] }
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
  { id: 'kria',   level: 4, baseCost: 2.6e8,  bonus: { type: 'global', per: 0.05 },
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
    spot: { f: 0.78, r: 12, y: 156, move: 'patrol', prop: 'none' } },
  { id: 'nara',   level: 2, baseCost: 1.2e5,  bonus: { type: 'global', per: 0.03 }, needs: 'japanJoined',
    spot: { f: 0.69, r: 10, y: 157, move: 'patrol', prop: 'none' } }
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
  pietro: { body: 'o', belly: 'y', feet: 'h', top: ['.....r.r', '...rrrrr', '..dnnnnn', '..dwwwww', '..dwXXww', '..dwxxww', '..dwqwoo', '..dwwwwo', '..dwwwwr', '...dwwww'] },
  shnyr0: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['r..y....', 'rrryyy..', '.dryrddd']) },                // блазень на ярмарку
  shnyr1: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['....yyyy', '...yrrrr', '..dyyyyy']) },        // комівояжер у солом'яному капелюсі
  shnyr2: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['.f.ffff.', '.ffd.dff', '.fdeeddd']) },          // діджей із навушниками
  shnyr3: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['....vvvv', '..vvvvvv', '.dvvvvvv']) },          // геймер у кепці
  shnyr4: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['....kkkk', '..kkkkkk', '.kkkkkkk', '.dkkkkkk'], { 5: '..dkTkkE' }) },   // хакер у капюшоні
  shnyr5: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['.g.g.g..', '.ggggggg', '..dgeddd']) },          // «еко-інспектор» із вінком
  shnyr6: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['....SSSS', '..SSSSSS', '.SSwwwww']) },           // у скафандрі
  shnyr7: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['...f.f.f', '..f.f.f.', '..dfeddd'], { 5: '..dkfkkE' }) },   // неоновий бос
  shnyr8: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['...rrrrr', '..rrrrrr', '..dreddd']) },           // у береті, позує художнику
  shnyr9: { body: 'e', belly: 'E', feet: 'k', top: shnyrWith(['...yyyy.', '..yyyyyy', '.dhhhhhh'], { 5: '..dkwkkE' }) },     // Японія: солом'яний капелюх-кása
  sora:  { body: 'o', belly: 'w', feet: 'k', top: ['.ko.....', '.ooddddd', '..dooooo', '..dooooo', '..dowwww', '..doXwww', '..doxwww', '..dowwwk', '..dowwww', '...dwwww'] }     // Сора, лисиця-кіцуне, гість Японії
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


