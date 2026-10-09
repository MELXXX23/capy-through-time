//#part 125_save.js
/* =====================================================================
   ЗБЕРЕЖЕННЯ
   ===================================================================== */

let storageOk = true;

// Міграції старих збережень: ключ N — функція, що перетворює версію N у N+1.
// Додаючи нові поля в state, нічого ламати не треба: відсутні поля беруться зі значень за замовчуванням.
const SAVE_MIGRATIONS = {
  // версія 17 → 18: перемикач птахів став «Прибрати літаючі об'єкти»
  17: (data) => {
    const st = data.state;
    if (st) {
      if (st.settings && st.settings.birds === false) st.settings.noFly = true;
    }
    return data;
  },
  // версія 16 → 17: зірки звіряток більше не купуються, а набираються прокачуванням (10 прокачувань = зірка): стара зірка = 10 прокачувань
  16: (data) => {
    const st = data.state;
    if (st && Array.isArray(st.teamStars)) { st.teamPlus = st.teamStars.map(n => Math.max(0, Math.min(3, n | 0)) * 10); delete st.teamStars; }
    return data;
  },
  // версія 1 (етап 1) → 2 (етап 2): з'явилися відділи, офлайн-заробіток та режим покупки
  1: (data) => {
    if (data.state && !Array.isArray(data.state.depts)) data.state.depts = DEPARTMENTS.map(() => 0);
    return data;
  },
  // версія 2 (етап 2) → 3 (етап 3): з'явилася команда звіряток
  2: (data) => {
    if (data.state && !Array.isArray(data.state.team)) data.state.team = TEAM.map(() => 0);
    return data;
  },
  // версія 3 (етап 3) → 4 (етап 4): з'явився сюжет. Глави, умови яких гравець уже виконав,
  // вважаємо прочитаними — щоб вони не посипалися всі одразу (їх можна перечитати у вкладці «Історія»)
  // версія 4 (етап 4) → 5 (етап 5): з'явилися події, колесо й статистика — нові поля беруться зі значень за замовчуванням
  4: (data) => data,
  // версія 5 (етап 5) → 6 (етап 6): з'явилися налаштування звуку — беруться зі значень за замовчуванням
  5: (data) => data,
  // версія 6 (етап 6) → 7 (етап 7): гравець, що вже грає, туторіал не бачить; уже найнятих звіряток вважаємо знайомими
  // версія 15 → 16: осколки обнулено ще раз (Магазин часу став дорожчим)
  15: (data) => {
    const st = data.state;
    if (st) { st.shards = 0; st.shardsTotal = 0; st.shardsInit = 1; }
    return data;
  },
  // версія 14 → 15: усім обнулено осколки часу (баланс і загальну суму, що давала бонус до доходу)
  14: (data) => {
    const st = data.state;
    if (st) { st.shards = 0; st.shardsTotal = 0; st.shardsInit = 1; }
    return data;
  },
  // версія 13 → 14: новий старт для всіх (гру стало легко проходити): скидаємо монети, осколки, покращення Магазину часу, рівень магазину, відділи, звірят, подорожі й бусти.
  // Лишаються скіни, кристали, налаштування, прочитані глави й досягнення.
  13: (data) => {
    const st = data.state;
    if (st) {
      st.coins = CONFIG.START_COINS; st.totalEarned = CONFIG.START_COINS; st.runStartEarned = 0; st.cps = 0;
      st.tapPower = CONFIG.START_TAP_POWER; st.shopLevel = 1;
      st.depts = DEPARTMENTS.map(() => 0); st.team = TEAM.map(() => 0); st.teamKnown = TEAM.map(() => 0);
      st.shards = 0; st.shardsTotal = 0; st.shardsInit = 1; st.ws = WORKSHOP.map(() => 0);
      st.epoch = 0; st.activeEpoch = -1; st.epochSeen = -1; st.epochEarned = [0, 0, 0, 0, 0, 0, 0, 0]; st.pendingOffline = 0;
      if (st.events) Object.assign(st.events, { saleUntil: 0, incomeBoostUntil: 0, incomeBoostMult: 1, tapBoostUntil: 0, tapBoostMult: 1, mailPending: 0 });
      if (!st.stats) st.stats = {};
      Object.assign(st.stats, { timeTravels: 0, maxLevel: 1, teamMaxLevel: 0, deptsBought: 0, milestones: 0, teamUps: 0 });
    }
    return data;
  },
  // версія 12 → 13: монети всіх гравців підлаштовуємо під рівень магазину: не більше ціни наступного розширення (на останньому рівні — половина порога подорожі);
  // заробіток поточної гри теж обмежуємо, щоб подорож не відкривалась одразу
  12: (data) => {
    const st = data.state;
    if (st) {
      const L = Math.max(1, Math.min(6, (st.shopLevel | 0) || 1)), trips = Math.max(0, Math.min(8, ((st.stats && st.stats.timeTravels) | 0)));
      const cap = L < LEVELS.length ? LEVELS[L].cost : 2.5e12 * Math.pow(4, trips);
      if (!(Number(st.coins) <= cap)) st.coins = cap;
      const total = Number(st.totalEarned) || 0, runEarned = total - (Number(st.runStartEarned) || 0);
      if (runEarned > cap * 4) st.runStartEarned = Math.max(0, total - cap * 4);
    }
    return data;
  },
  // версія 11 → 12: +1 осколок за кожну вже зроблену подорож (нові правила осколків)
  11: (data) => {
    const st = data.state;
    if (st) {
      const trips = Math.max(0, Math.min(40, ((st.stats && st.stats.timeTravels) | 0)));
      st.shards = (Number(st.shards) || 0) + trips; st.shardsTotal = (Number(st.shardsTotal) || 0) + trips;
    }
    return data;
  },
  // версія 10 → 11: нові правила розширення (25 і 15 штук, звірята до 3 рівня): усіх, хто пішов далі за 2-гу епоху, повертаємо в 2-гу (Ретро) і починаємо епоху заново
  10: (data) => {
    const st = data.state;
    if (st && (Number(st.epoch) || 0) >= 2) {
      st.epoch = 1; st.activeEpoch = -1;
      st.coins = CONFIG.START_COINS; st.shopLevel = 1;
      st.depts = DEPARTMENTS.map(() => 0); st.team = TEAM.map(() => 0);
      st.runStartEarned = Number(st.totalEarned) || 0;
      if (Array.isArray(st.epochEarned)) st.epochEarned = st.epochEarned.map((v, i) => (i >= 1 ? 0 : v));
      st.epochSeen = Number(st.totalEarned) || 0;
      if (st.events) { st.events.incomeBoostUntil = 0; st.events.tapBoostUntil = 0; }
      if (!st.stats) st.stats = {};
      st.stats.timeTravels = 1;                                   // одна подорож позаду: ×2 до доходу й 2 осколки
      st.shards = 2; st.shardsTotal = 2;
      if (Array.isArray(st.ws)) st.ws = st.ws.map(() => 0);
    }
    return data;
  },
  // версія 9 → 10: нові правила осколків (менше за подорож, глибша механіка): усім перераховуємо осколки за вже зроблені подорожі й скидаємо покращення
  9: (data) => {
    const st = data.state;
    if (st) {
      const trips = Math.max(0, Math.min(40, ((st.stats && st.stats.timeTravels) | 0)));
      let total = 0; for (let i = 0; i < trips; i++) total += 2 + Math.min(i, 6);
      st.shards = total; st.shardsTotal = total;
      if (Array.isArray(st.ws)) st.ws = st.ws.map(() => 0);
    }
    return data;
  },
  // версія 8 → 9: Магазин часу переписано (немає «Швидкого старту», усе дорожче й слабше): повертаємо витрачені осколки й скидаємо покращення
  8: (data) => {
    const st = data.state;
    if (st && Array.isArray(st.ws)) {
      const OLD = [[1, 2, 3], [1, 1, 2, 2, 3], [1, 1, 2], [1, 1, 2, 2], [1, 1, 2, 2], [1, 1, 1, 2], [2, 3], [1, 1, 2, 2], [1, 2, 2, 3, 4], [1, 2, 2, 3, 4], [1, 2, 2, 3, 4], [2, 2, 3, 4, 5]];
      let back = 0; st.ws.forEach((L, i) => { const c = OLD[i] || []; for (let k = 0; k < L && k < c.length; k++) back += c[k]; });
      st.shards = (Number(st.shards) || 0) + back; st.ws = st.ws.map(() => 0);
    }
    return data;
  },
  // версія 7 → 8: день і ніч вмикаємо знову (раніше його можна було вимкнути випадково й не помітити)
  7: (data) => {
    if (data.state && data.state.settings) data.state.settings.dayNight = true;
    return data;
  },
  6: (data) => {
    const s = data.state;
    if (s) {
      s.tutorialDone = true;
      if (Array.isArray(s.team)) s.teamKnown = s.team.map(v => (v > 0 ? 1 : 0));
    }
    return data;
  },
  3: (data) => {
    const s = data.state;
    if (s && !s.story) {
      let done = 0;
      while (done < CHAPTERS.length && triggerMet(CHAPTERS[done].trigger, s)) done++;
      s.story = { done, shnyrFriend: done >= 6, finale: done >= 8 };
    }
    return data;
  }
};

function migrateSave(data) {
  let v = Number(data.v) || 1;
  while (v < CONFIG.SAVE_VERSION) {
    const step = SAVE_MIGRATIONS[v];
    if (step) data = step(data);
    v++;
  }
  data.v = CONFIG.SAVE_VERSION;
  return data;
}

// Переносимо в target лише ті поля з src, що існують у target і мають той самий тип
function mergeInto(target, src) {
  if (!src || typeof src !== 'object') return;
  for (const key of Object.keys(target)) {
    if (!(key in src)) continue;
    const a = target[key], b = src[key];
    if (key === 'buyMode') {
      if (CONFIG.BUY_MODES.includes(b)) target[key] = b;
    } else if (a && typeof a === 'object' && !Array.isArray(a)) {
      mergeInto(a, b);
    } else if (Array.isArray(a)) {
      if (Array.isArray(b)) {
        // довжину масиву лишаємо за новим станом, значення беремо зі збереження
        for (let i = 0; i < a.length; i++) if (typeof b[i] === 'number' && isFinite(b[i]) && b[i] >= 0) a[i] = Math.floor(b[i]);
      }
    } else if (typeof a === 'number') {
      if (typeof b === 'number' && isFinite(b)) target[key] = b;
    } else if (a === null) {
      if (typeof b === 'string') target[key] = b;
    } else if (typeof a === typeof b) {
      target[key] = b;
    }
  }
}

// Телефонна обгортка (Capacitor): копія збереження ще й у сховищі застосунку (воно не стирається, як localStorage браузера). У браузері й на ПК нічого не робить.
function nativeApp() { try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); } catch (e) { return false; } }
function nativePlugin(name) { try { return nativeApp() && window.Capacitor.Plugins ? window.Capacitor.Plugins[name] : null; } catch (e) { return null; } }
let lastNativeAt = 0;
function nativeMirror(json) {
  const P = nativePlugin('Preferences'); if (!P || Date.now() - lastNativeAt < 15000) return;      // не частіше раз на 15 с
  lastNativeAt = Date.now();
  try { P.set({ key: CONFIG.SAVE_KEY, value: json }).catch(() => {}); } catch (e) { /* нічого */ }
}
const SAVE_BAK_KEY = CONFIG.SAVE_KEY + '_bak';      // друга копія збереження
let lastBakAt = 0, forceBakNext = false, restoredFromBak = false, hadBak = false;
function saveGame() {
  if (savingDisabled) return;
  try {
    syncEpochEarned();
    state.savedAt = Date.now();
    const json = JSON.stringify({ v: CONFIG.SAVE_VERSION, state });
    localStorage.setItem(CONFIG.SAVE_KEY, json);
    nativeMirror(json);
    if (forceBakNext || Date.now() - lastBakAt > 120000) {                  // друга копія: не частіше раз на 2 хвилини
      forceBakNext = false; lastBakAt = Date.now();
      try { localStorage.setItem(SAVE_BAK_KEY, json); } catch (e2) { /* місця нема — головне збереження вже записане */ }
    }
    if (!storageOk) { storageOk = true; updateSaveWarning(); }
  } catch (e) {
    if (storageOk) { storageOk = false; updateSaveWarning(); }
  }
}

function loadGame() {
  let raw = null, bak = null;
  try { raw = localStorage.getItem(CONFIG.SAVE_KEY); bak = localStorage.getItem(SAVE_BAK_KEY); } catch (e) { storageOk = false; return false; }
  hadBak = !!bak;
  if (!raw && !bak) return false;
  if (raw && applySave(raw)) return true;
  if (raw) { try { localStorage.setItem(CONFIG.SAVE_KEY + '_broken', raw); } catch (e2) { /* нічого */ } }
  if (bak && bak !== raw && applySave(bak)) {                         // головне збереження зламане: беремо другу копію й одразу відновлюємо головне
    restoredFromBak = true;
    try { localStorage.setItem(CONFIG.SAVE_KEY, bak); } catch (e3) { /* нічого */ }
    return true;
  }
  return false;
}
function applySave(raw) {
  let data;
  try { data = migrateSave(JSON.parse(raw)); } catch (e) { return false; }
  if (!data || !data.state || typeof data.state !== 'object') return false;
  try {
    mergeInto(state, data.state);
    state.shopLevel = Math.max(1, Math.min(LEVELS.length, Math.floor(state.shopLevel)));
    if (state.settings.gender !== 'm') state.settings.gender = 'f';
    if (!SEASONS.includes(state.settings.season)) state.settings.season = 'auto';
    state.story.done = Math.min(state.story.done | 0, CHAPTERS.length);
    state.ghosts = Math.max(0, Math.min(CONFIG.GHOST_MAX, Math.floor(state.ghosts)));
  if (!state.shardsInit) { state.shardsInit = 1; if (!(state.shards > 0)) { state.shards = state.crystals; state.shardsTotal = state.crystalsTotal; } }       // одноразово: старі збереження отримують осколки, рівні кристалам (раніше валюта була одна)
  if (state.ghosts > 0) { const conv = Math.floor(state.ghosts / 2); state.crystals += conv; state.crystalsTotal += conv; state.ghosts = 0; }       // кристали привидів більше не існують
    if (!(state.dayPhase >= 0 && state.dayPhase < 1)) state.dayPhase = 0.3;
    SKIN_TYPES.forEach(ty => {                                       // -1 — звичайний; -2 (лише Капі) — скін епохи, що змінюється разом з епохою; інакше це має бути доступний скін своєї групи
      const i = state.skins[ty];
      if ((i === -1 && ty !== 'capy') || (i === -2 && ty === 'capy')) return;               // «звичайного» скіна Капі більше нема: лишається скін епохи
      if (!(i >= 0 && SKIN_POOL[i] && !SKIN_HIDDEN.includes(SKIN_POOL[i]) && SKIN_POOL[i].startsWith(ty + '_') && !SKIN_POOL[i].startsWith('capy_ep') && skinOwned(i))) state.skins[ty] = ty === 'capy' ? -2 : -1;
    });   // вдягнений лише виграний скін своєї групи
    return true;
  } catch (e) {
    return false;
  }
}

