//#part 170_ui.js
/* =====================================================================
   МОВА ТА ІНТЕРФЕЙС
   ===================================================================== */

function detectLanguage() {
  const l = (navigator.language || (navigator.languages && navigator.languages[0]) || 'en').toLowerCase();
  return l.startsWith('uk') ? 'uk' : 'en';
}

function setText(el, text, cacheKey) {
  if (uiCache[cacheKey] === text) return;
  uiCache[cacheKey] = text;
  el.textContent = text;
}

// ===== Значки вкладок, набір 2: 24×24, малюються кодом і автоматично обводяться темним контуром =====
function outlineCanvas(c, col) {
  const w = c.width, h = c.height, g = c.getContext('2d'), d = g.getImageData(0, 0, w, h).data, add = [];
  const on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!on(x, y) && (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1))) add.push([x, y]);
  g.fillStyle = col; add.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
}
function tabGlyph(id) {
  const c = document.createElement('canvas'); c.width = 24; c.height = 24;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const P = (x, y, w, h, ch) => R(g, x, y, w, h, ch), C = (x, y, w, h) => g.clearRect(x, y, w, h);
  const clearDisc = (cx, cy, r) => { for (let dy = -r; dy <= r; dy++) { const half = Math.round(Math.sqrt(r * r + 0.5 - dy * dy)); g.clearRect(cx - half, cy + dy, half * 2 + 1, 1); } };
  if (id === 'shop') {                                                     // крамничка з смугастим навісом
    P(3, 10, 18, 11, 'W'); P(3, 10, 1, 11, 'w'); P(3, 19, 18, 2, 'E'); P(3, 10, 18, 1, 'e');
    P(5, 13, 4, 5, 's'); P(5, 13, 1, 5, 'S'); P(5, 18, 4, 1, 'c'); P(15, 13, 4, 5, 's'); P(15, 13, 1, 5, 'S'); P(15, 18, 4, 1, 'c');
    P(10, 13, 4, 8, 'b'); P(10, 13, 4, 1, 'l'); P(11, 14, 2, 3, 'S'); P(13, 18, 1, 1, 'y');
    P(2, 2, 20, 2, 'r'); P(2, 2, 20, 1, 'J');
    for (let i = 0; i < 10; i++) { P(2 + i * 2, 4, 2, 6, i % 2 ? 'w' : 'r'); if (i % 2 === 0) P(2 + i * 2, 10, 2, 1, 'r'); }
  } else if (id === 'departments') {                                       // візок із покупками
    disc(g, 9, 5, 3, 'r'); P(7, 3, 1, 2, 'p'); P(9, 1, 2, 1, 'g');
    P(14, 2, 5, 7, 'w'); P(14, 2, 5, 2, 'T'); P(16, 5, 2, 2, 'r'); P(14, 2, 1, 7, 'W');
    for (let y = 7; y <= 14; y++) { const l = 4 + Math.floor((y - 7) * 0.4), r = 22 - Math.floor((y - 7) * 0.4); P(l, y, r - l + 1, 1, 'h'); }
    P(4, 7, 19, 1, 'y'); P(8, 8, 1, 7, 'o'); P(12, 8, 1, 7, 'o'); P(16, 8, 1, 7, 'o'); P(5, 11, 17, 1, 'o');
    P(1, 3, 4, 2, 'e'); P(3, 5, 2, 3, 'e');
    P(6, 15, 14, 1, 'e'); P(7, 16, 1, 2, 'e'); P(18, 16, 1, 2, 'e');
    disc(g, 8, 19, 2, 'k'); disc(g, 18, 19, 2, 'k'); P(7, 18, 1, 1, 'E'); P(17, 18, 1, 1, 'E');
  } else if (id === 'team') {                                              // лапка
    disc(g, 12, 15, 6, 'l'); disc(g, 5, 9, 2, 'l'); disc(g, 9, 4, 2, 'l'); disc(g, 15, 4, 2, 'l'); disc(g, 19, 9, 2, 'l');
    P(8, 11, 4, 1, 'B'); P(7, 12, 1, 3, 'B'); P(10, 19, 8, 2, 'M'); P(16, 17, 2, 3, 'M');
    disc(g, 12, 16, 3, 'p'); P(11, 15, 2, 1, 'q');
    [[5, 9], [9, 4], [15, 4], [19, 9]].forEach(([x, y]) => { P(x, y, 1, 1, 'p'); P(x - 1, y - 1, 1, 1, 'B'); });
  } else if (id === 'story') {                                             // розкрита книга із закладкою
    P(1, 4, 22, 16, 'b'); P(1, 4, 22, 1, 'l');
    P(2, 5, 9, 14, 'w'); P(13, 5, 9, 14, 'w'); P(11, 4, 2, 16, 'r'); P(2, 19, 9, 1, 'E'); P(13, 19, 9, 1, 'E');
    [8, 10, 12, 14, 16].forEach((y, i) => P(4, y, i === 4 ? 3 : 5, 1, 'e'));
    P(15, 7, 5, 5, 's'); P(15, 10, 5, 2, 'g'); P(18, 8, 1, 1, 'y'); P(15, 14, 5, 1, 'e'); P(15, 16, 3, 1, 'e');
    P(17, 17, 2, 6, 'r'); C(18, 21, 1, 2);
  } else if (id === 'workshop') {                                          // пісочний годинник
    P(3, 1, 18, 2, 'h'); P(3, 1, 18, 1, 'y'); P(3, 21, 18, 2, 'h'); P(3, 22, 18, 1, 'o'); P(3, 21, 18, 1, 'y');
    P(4, 3, 1, 18, 'b'); P(19, 3, 1, 18, 'b');
    for (let i = 0; i < 6; i++) { P(6 + i, 3 + i, 12 - 2 * i, 1, 'a'); P(6 + i, 20 - i, 12 - 2 * i, 1, 'a'); }
    P(11, 9, 2, 6, 'a'); P(6, 3, 1, 3, 'w');
    P(8, 4, 8, 1, 'h'); P(9, 5, 6, 1, 'h'); P(10, 6, 4, 1, 'h'); P(11, 7, 2, 1, 'h'); P(11, 9, 2, 3, 'h');
    P(7, 20, 10, 1, 'h'); P(9, 19, 6, 1, 'h'); P(10, 18, 4, 1, 'h'); P(11, 17, 2, 1, 'h');
  } else if (id === 'skins') {                                             // футболка із зіркою
    P(6, 5, 12, 16, 'T'); P(2, 6, 5, 6, 'T'); P(17, 6, 5, 6, 'T');
    C(9, 5, 6, 2); P(9, 7, 6, 1, 'w'); P(8, 6, 1, 1, 'w'); P(15, 6, 1, 1, 'w');
    P(2, 11, 5, 1, 'w'); P(17, 11, 5, 1, 'w'); P(7, 9, 1, 10, 'm'); P(16, 8, 1, 12, 'g'); P(6, 20, 12, 1, 'g');
    P(11, 12, 3, 3, 'y'); P(12, 10, 1, 7, 'y'); P(9, 13, 7, 1, 'y');
  } else if (id === 'achievements') {                                      // кубок
    P(1, 3, 5, 7, 'o'); C(2, 4, 3, 5); P(18, 3, 5, 7, 'o'); C(19, 4, 3, 5);
    P(6, 2, 12, 9, 'h'); P(7, 11, 10, 1, 'h'); P(8, 12, 8, 1, 'h');
    P(7, 3, 2, 7, 'y'); P(15, 3, 2, 8, 'o'); P(11, 5, 2, 4, 'w'); P(10, 6, 4, 2, 'w');
    P(10, 13, 4, 3, 'o'); P(10, 13, 1, 3, 'h'); P(8, 16, 8, 2, 'h');
    P(5, 18, 14, 4, 'b'); P(5, 18, 14, 1, 'l'); P(10, 19, 4, 2, 'y');
  } else if (id === 'seasons') {                                           // колесо пір року: весна, літо, осінь, зима
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
      if (Math.hypot(x - 11.5, y - 11.5) > 10.4) continue;
      const top = y < 12, left = x < 12;
      P(x, y, 1, 1, top ? (left ? 'g' : 'h') : (left ? 'a' : 'o'));
    }
    P(2, 11, 20, 2, 'd'); P(11, 2, 2, 20, 'd');
    P(5, 4, 5, 1, 'm'); P(4, 5, 1, 3, 'm'); P(7, 6, 2, 2, 'p'); P(6, 7, 1, 1, 'q');        // весна: пагінець і квітка
    P(15, 5, 4, 4, 'y'); P(16, 4, 2, 6, 'y'); P(14, 6, 6, 2, 'y'); P(16, 6, 2, 2, 'w');    // літо: сонце
    P(15, 14, 4, 3, 'r'); P(16, 17, 2, 2, 'r'); P(17, 13, 1, 1, 'b'); P(19, 15, 1, 1, 'h'); // осінь: листок
    P(5, 17, 5, 1, 'w'); P(7, 15, 1, 5, 'w'); P(6, 16, 3, 3, 'w'); P(7, 17, 1, 1, 'S');     // зима: сніжинка
    disc(g, 12, 12, 3, 'w'); P(11, 11, 2, 2, 'y');
  } else if (id === 'more') {                                              // три крапки
    [5, 12, 19].forEach(x => { disc(g, x, 12, 2, 'h'); P(x - 1, 13, 3, 1, 'o'); P(x - 1, 11, 1, 1, 'y'); });
  } else {                                                                 // налаштування: шестерня
    [[10, 1], [10, 19], [1, 10], [19, 10], [3, 3], [17, 3], [3, 17], [17, 17]].forEach(([x, y]) => P(x, y, 4, 4, 'e'));
    disc(g, 12, 12, 8, 'e'); disc(g, 12, 12, 6, 'E'); P(8, 8, 3, 1, 'w'); P(8, 9, 1, 2, 'w');
    clearDisc(12, 12, 3);
  }
  outlineCanvas(c, PALETTE.d);
  return c;
}
function tabIconCanvas(id) { return tabGlyph(id); }
function buildTabs() {
  ui.tabs.innerHTML = '';
  TABS.forEach(tab => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab btn ' + (TABS_PRIMARY.includes(tab.id) ? 'primary' : 'secondary') + (tab.ready ? '' : ' soon');
    b.dataset.tab = tab.id;
    b.setAttribute('role', 'tab');
    b.innerHTML = '<span class="tab-icon"></span><span class="tab-name"></span>';
    b.querySelector('.tab-icon').appendChild(tabIconCanvas(tab.id));
    if (tab.lock) b.appendChild(lockImg('tab-lock'));
    b.addEventListener('click', () => onTabClick(tab.id));
    ui.tabs.appendChild(b);
  });
  const more = document.createElement('button');          // «⋯» — друга частина вкладок (лише на телефоні)
  more.type = 'button'; more.className = 'tabmore btn'; more.setAttribute('aria-label', '…');
  const mi = document.createElement('span'); mi.className = 'tab-icon'; mi.appendChild(tabIconCanvas('more')); more.appendChild(mi);
  more.addEventListener('click', () => ui.app.classList.toggle('more-open'));
  ui.tabs.appendChild(more);
  ui.tabMore = more;
}
const TABS_PRIMARY = ['shop', 'departments', 'team', 'story'];
// На телефоні вміст вкладки виїжджає над смужкою іконок; повторний дотик до тієї ж вкладки його ховає
function setSheet(open) {
  ui.app.classList.toggle('sheet-open', open);
  if (!open) ui.app.classList.remove('more-open');
  if (mobileMQ.matches && layoutReady) layoutScene();               // сцена підлаштовується: над меню видно небо, магазин і дорогу
}
function onTabClick(id) {
  const tb = TABS.find(x => x.id === id);
  if (tb && tb.lock === 'themes' && !themesUnlocked()) { showToast(t('themeLocked'), 'bad'); playSfx('pip'); return; }
  if (mobileMQ.matches) {
    if (ui.app.classList.contains('sheet-open') && state.tab === id) { setSheet(false); return; }
    showTab(id);
    setSheet(true);
    if (TABS_PRIMARY.includes(id)) ui.app.classList.remove('more-open');
    return;
  }
  showTab(id);
}

function showTab(id) {
  let tab = TABS.find(x => x.id === id) || TABS[0];
  if (tab.lock === 'themes' && !themesUnlocked()) tab = TABS[0];
  state.tab = tab.id;
  ui.tabs.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab.id)));
  TABS.forEach(x => { const el = document.getElementById('pane-' + x.id); if (el) el.hidden = x.id !== tab.id; });
  ui.paneSoon.hidden = tab.ready;
  if (!tab.ready) ui.soonTitle.textContent = tab.icon + ' ' + t('tab_' + tab.id);
  updateUI();
}

// Режими покупки ×1 / ×10 / ×100 / МАКС
function buildBuyModes() {
  ui.buyModes.innerHTML = '';
  CONFIG.BUY_MODES.forEach(mode => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'buy-mode btn';
    b.dataset.mode = String(mode);
    b.addEventListener('click', () => { state.buyMode = mode; updateUI(); });
    ui.buyModes.appendChild(b);
  });
}

// Картки відділів (створюються один раз, далі оновлюється лише текст)
function buildDeptCards() {
  ui.deptList.innerHTML = '';
  DEPARTMENTS.forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'card dept';
    card.innerHTML =
      '<div class="dept-head"><span class="dept-icon"></span><span class="dept-name"></span><span class="dept-count"></span></div>' +
      '<div class="dept-income"><div class="each"></div><div class="total"></div></div>' +
      '<div class="ms"><div class="ms-bar"><i></i></div><span class="ms-text"></span></div>' +
      '<button type="button" class="btn wide buy"></button>';
    card.querySelector('.dept-icon').textContent = deptIcon(i);
    card.querySelector('.buy').addEventListener('click', () => buyDept(i));
    ui.deptList.appendChild(card);
    deptEls[i] = {
      card, icon: card.querySelector('.dept-icon'),
      name: card.querySelector('.dept-name'), count: card.querySelector('.dept-count'),
      each: card.querySelector('.each'), total: card.querySelector('.total'),
      bar: card.querySelector('.ms-bar i'), msText: card.querySelector('.ms-text'),
      buy: card.querySelector('.buy')
    };
  });
  deptLockedEl = document.createElement('div');
  deptLockedEl.className = 'card dept locked';
  ui.deptList.appendChild(deptLockedEl);
}

// Картки звіряток (створюються один раз; портрет — той самий спрайт, що й на сцені)
function buildTeamCards() {
  ui.teamList.innerHTML = '';
  TEAM.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'card team-card';
    card.innerHTML =
      '<canvas class="portrait" width="16" height="16" aria-hidden="true"></canvas>' +
      '<div class="info"><div class="t-name"></div><div class="t-role"></div><div class="t-trait"></div>' +
      '<div class="t-lvl"></div><div class="t-now"></div><div class="t-next"></div>' +
      '<button type="button" class="btn wide go"></button></div>';
    const cv = card.querySelector('.portrait');
    const pc = cv.getContext('2d');
    pc.imageSmoothingEnabled = false;
    pc.drawImage(getSpriteCanvas(teamSprite(m.id)), 0, 0);
    cv.dataset.tid = m.id;
    card.querySelector('button').addEventListener('click', () => hireOrUpgrade(i));
    ui.teamList.appendChild(card);
    teamEls[i] = {
      card, name: card.querySelector('.t-name'), role: card.querySelector('.t-role'), trait: card.querySelector('.t-trait'),
      lvl: card.querySelector('.t-lvl'), now: card.querySelector('.t-now'), next: card.querySelector('.t-next'),
      btn: card.querySelector('button')
    };
  });
  teamLockedEl = document.createElement('div');
  teamLockedEl.className = 'card dept locked';
  ui.teamList.appendChild(teamLockedEl);
}

// Текст бонусу звірятка на рівні lvl
function bonusText(i, lvl, sm) {
  const b = TEAM[i].bonus;
  if (sm === undefined) sm = starMult(i);                                       // множник зірок (за замовчуванням — поточний)
  const pct = v => Math.round(v * 100), cap = b.cap === undefined ? Infinity : Math.min(b.cap * sm, STAR_HARD_CAP[b.type] || Infinity);
  switch (b.type) {
    case 'tap': return t('bonus_tap', fmt(1 + b.per * lvl * sm, 2));
    case 'expandCost': return t('bonus_expandCost', pct(Math.min(b.per * lvl * sm, cap)));
    case 'offline': return t('bonus_offline', pct(CONFIG.OFFLINE_RATE + b.rate * lvl * sm), CONFIG.OFFLINE_MAX_HOURS + b.hours * lvl * sm);
    case 'thief': return t('bonus_thief', pct(Math.min(b.per * lvl * sm, cap)));
    case 'deptIncome': return t('bonus_deptIncome', b.depts.map(d => deptName(d)).join(', '), fmt(1 + b.per * lvl * sm, 2));
    case 'global': return t('bonus_global', fmt(1 + b.per * lvl * sm, 2));
    case 'event': return t('bonus_event', pct(b.per * lvl * sm));
    case 'fix': return t('bonus_fix', pct(b.per * lvl * sm));
    case 'deptCost': return t('bonus_deptCost', pct(Math.min(b.per * lvl * sm, cap)));
  }
  return '';
}

// Підставляє тексти поточної мови в усі елементи з data-i18n
function applyTranslations() {
  document.documentElement.lang = state.lang;
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  ui.tabs.querySelectorAll('.tab').forEach(b => { b.querySelector('.tab-name').textContent = t('tab_' + b.dataset.tab); b.title = t('tab_' + b.dataset.tab); b.setAttribute('aria-label', t('tab_' + b.dataset.tab)); });
  if (ui.tabMore) ui.tabMore.setAttribute('aria-label', t('tabMore'));
  const tab = TABS.find(x => x.id === state.tab);
  if (tab && !tab.ready) ui.soonTitle.textContent = tab.icon + ' ' + t('tab_' + tab.id);
  DEPARTMENTS.forEach((d, i) => { deptEls[i].name.textContent = deptName(i); deptEls[i].icon.textContent = deptIcon(i); });
  ui.buyModes.querySelectorAll('.buy-mode').forEach(b => {
    b.textContent = b.dataset.mode === 'max' ? t('buyMax') : '×' + b.dataset.mode;
  });
  ui.modalTitle.textContent = t('offlineTitle');
  ui.modalText.textContent = t('offlineText');
  ui.modalBtn.textContent = t('offlineBtn');
  if (shop) updateSignText();
  ui.dlgSkip.textContent = t('storySkip');
  updateSoundUI();
  refreshDialogLanguage();
  for (const k in uiCache) delete uiCache[k];
  updateUI();
  if (!ui.modal.hidden) refreshOfflineModal();
}

function setLanguage(id) {
  if (!translations[id] || state.lang === id) return;
  state.lang = id;
  applyTranslations();
  saveGame();
}

function updateSaveWarning() {
  ui.saveWarn.hidden = storageOk;
}

// Оновлює лічильник і панель (тільки якщо текст змінився)
// Найближча ціль: одна підказка зверху, що робити далі
function currentGoal() {
  const gain = prestigeGain();
  if (state.story.finale && gain >= 1) return t('goalTravel', gain);
  const next = nextLevelDef();
  if (next) {
    const need = next.requires.find(r => state.depts[r.dept] < r.count);
    if (need) return t('goalDept', deptName(need.dept), state.depts[need.dept], need.count);
    const hire = hireRequirements().find(i => state.team[i] < hireLevel());
    if (hire !== undefined) return t('goalHire', t('team_' + TEAM[hire].id), hireLevel());
    const cost = expandCost(next);
    return state.coins >= cost ? t('goalExpandNow') : t('goalExpand', Math.min(99, Math.floor(state.coins / cost * 100)));
  }
  if (state.story.finale) { const run = Math.max(0, state.totalEarned - state.runStartEarned); return t('goalCrystal', Math.min(99, Math.floor(run / shardThreshold() * 100))); }
  let best = -1, bc = Infinity;
  DEPARTMENTS.forEach((d, i) => { if (isDeptUnlocked(i)) { const c = deptCost(i, 1); if (c < bc) { bc = c; best = i; } } });
  return best >= 0 ? t('goalNext', deptName(best), Math.min(100, Math.floor(state.coins / bc * 100))) : '';
}
function updateGoal() {
  const txt = state.story.done >= 1 ? currentGoal() : '';
  ui.goalLine.hidden = !txt;
  setText(ui.goalLine, txt, 'goal');
}
const DAILY_KINDS = [
  { id: 'taps',  get: () => state.taps, target: () => 120, from: 0 },
  { id: 'depts', get: () => state.stats.deptsBought, target: () => 6, from: 0 },
  { id: 'team',  get: () => state.stats.teamUps || 0, target: () => 2, from: 0 },
  { id: 'catch', get: () => state.stats.ghostsCaught, target: () => 3, from: 2 },
  { id: 'vip',   get: () => state.stats.vipTaps || 0, target: () => 2, from: 2 },
  { id: 'earn',  get: () => state.totalEarned, target: () => Math.max(500, Math.floor(state.cps * 420)), from: 0 },
  { id: 'wheel', get: () => state.stats.wheelSpins, target: () => 1, from: 0 }
];
function dayKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function ensureDaily() {
  const D = state.daily, key = dayKey();
  if (D.day === key) return;
  D.day = key; D.bonus = 0;
  const pool = DAILY_KINDS.map((k, i) => i).filter(i => state.story.done >= DAILY_KINDS[i].from);
  for (let i = 0; i < 3; i++) {
    const j = Math.floor(Math.random() * pool.length), k = pool.splice(j, 1)[0];
    D.k[i] = k; D.b[i] = DAILY_KINDS[k].get(); D.t[i] = DAILY_KINDS[k].target(); D.c[i] = 0;
  }
  dailyNotified.length = 0;
  saveGame();
}
const dailyNotified = [];
function dailyProgress(i) { const D = state.daily, K = DAILY_KINDS[D.k[i]]; return Math.max(0, Math.min(D.t[i], K.get() - D.b[i])); }
function claimDaily(i) {
  const D = state.daily;
  if (D.c[i] || dailyProgress(i) < D.t[i]) return;
  D.c[i] = 1; let gain = 1;
  if (D.c.every(v => v === 1) && !D.bonus) { D.bonus = 1; gain += 1; }
  state.crystals += gain; state.crystalsTotal += gain;
  showToast(t('dailyGot', gain), 'big'); playSfx('wheelWin'); buzz(30);
  updateUI(); saveGame();
}
// М'яке нагадування: через ~25 с після початку й далі раз на 10 хвилин, поки є невиконані або незабрані завдання
let dailyRemindT = 25;
function updateDailyReminder(dt) {
  if (!state.story || state.story.done < 1) return;
  dailyRemindT -= dt; if (dailyRemindT > 0) return;
  if (dialog.active || epochIntro.active || build || warp || !ui.modal.hidden || !ui.wheelModal.hidden || !ui.letterModal.hidden || !ui.circusModal.hidden || !ui.siModal.hidden || !ui.newsModal.hidden) { dailyRemindT = 4; return; }
  ensureDaily();
  const D = state.daily, open = D.c.filter(v => !v).length;
  dailyRemindT = 600;
  if (!open) return;
  const claimable = [0, 1, 2].some(i => !D.c[i] && dailyProgress(i) >= D.t[i]);
  showToast(claimable ? t('dailyRemindClaim') : t('dailyRemind', 3 - open), 'good'); playSfx('pip');
}
let dailySig = '';
function updateDaily() {
  if (!state.story || state.story.done < 1) return;
  ensureDaily();
  const D = state.daily;
  let claimable = false;
  for (let i = 0; i < 3; i++) {
    const done = dailyProgress(i) >= D.t[i];
    if (done && !D.c[i]) { claimable = true; if (!dailyNotified[i]) { dailyNotified[i] = 1; showToast(t('dailyDoneToast'), 'good'); playSfx('achievement'); } }
  }
  if (!ui.paneAch.hidden && D.seen !== D.day) { D.seen = D.day; saveGame(); }
  const unseen = D.seen !== D.day && D.c.some(v => !v);                       // новий день: на вкладці нагород горить точка, поки не заглянеш
  const tabEl = ui.tabs.querySelector('[data-tab="achievements"]');
  if (tabEl) tabEl.classList.toggle('alert', (claimable || unseen) && state.tab !== 'achievements');
  if (ui.paneAch.hidden) return;
  const sig = [D.day, D.c.join(), [0, 1, 2].map(dailyProgress).join(), D.bonus, state.lang].join('|');
  if (sig === dailySig) return;
  dailySig = sig;
  const card = ui.dailyCard;
  card.innerHTML = '<h2></h2><p class="ws-line"></p>';
  card.querySelector('h2').textContent = t('dailyTitle');
  card.querySelector('p').textContent = t('dailyNote');
  for (let i = 0; i < 3; i++) {
    const K = DAILY_KINDS[D.k[i]], p = dailyProgress(i), row = document.createElement('div');
    row.className = 'daily-row' + (D.c[i] ? ' claimed' : '');
    const tx = document.createElement('div'); tx.className = 'dtext';
    const target = K.id === 'earn' ? fmt(D.t[i]) : String(D.t[i]);
    tx.textContent = t('daily_' + K.id, target);
    const sm = document.createElement('small'); sm.textContent = (K.id === 'earn' ? fmt(Math.floor(p)) : p) + ' / ' + target; tx.appendChild(sm);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn';
    b.textContent = D.c[i] ? '✓' : t('dailyClaim');
    b.disabled = !!D.c[i] || p < D.t[i];
    b.addEventListener('click', () => claimDaily(i));
    row.append(tx, b); card.appendChild(row);
  }
  const foot = document.createElement('p'); foot.className = 'ws-line'; foot.textContent = D.bonus ? t('dailyAllDone') : t('dailyAll'); card.appendChild(foot);
}
function updateUI() {
  setText(ui.gemCount, fmt(Math.floor(state.crystals)), 'gems');
  setText(ui.shardCount, fmt(Math.floor(state.shards)), 'shards'); ui.shardBox.hidden = !(state.story.finale || state.story.done >= 7 || state.shardsTotal > 0 || state.shards > 0);     // осколки видно лише коли відкрилась Майстерня часу
  if (uiCache.gemEp !== viewEpoch()) { uiCache.gemEp = viewEpoch(); setGemEpoch(uiCache.gemEp); }
  updateGoal(); updateDaily();
  if (previewIdx() !== null) {                       // обрана минула епоха: угорі її заробіток, баланс для витрат — у підписі
    setText(ui.coinCount, fmt(Math.floor(state.epochEarned[previewIdx()] || 0)), 'coins');
    setText(ui.cps, t('perSecondHud', fmt(state.cps, 1)), 'cps');
  } else {
    setText(ui.coinCount, fmt(Math.floor(state.coins)), 'coins');
    setText(ui.cps, t('perSecondHud', fmt(state.cps, 1)), 'cps');
  }

  // вкладка «Магазин»
  setText(ui.shopName, t('levelName_' + state.shopLevel), 'shopName');
  setText(ui.shopLevelLabel, t('shopLevelLabel', state.shopLevel, LEVELS.length), 'level');
  setText(ui.statTapPower, fmt(tapValue(), 1), 'tapPower');
  setText(ui.statLevelMult, '×' + fmt(levelMult()), 'levelMult');
  setText(ui.statTaps, fmt(state.taps), 'taps');
  setText(ui.statEarned, fmt(Math.floor(state.totalEarned)), 'earned');

  updateDepartmentsUI();
  updateTeamUI();
  updateStoryUI();
  updateProgressionUI();
  updatePanelToggle();
}

// Чи є зараз що купити (для мигаючої точки на вкладці «Відділи»)
function hasAffordableAction() {
  for (let i = 0; i < DEPARTMENTS.length; i++) {
    if (isDeptUnlocked(i) && state.coins >= deptCost(i, 1)) return true;
  }
  const next = nextLevelDef();
  return !!(next && requirementsMet(next) && state.coins >= expandCost(next));
}
// Чи можна зараз найняти або прокачати когось із команди
function hasTeamAction() {
  return TEAM.some((m, i) => isTeamUnlocked(i) && (state.team[i] < CONFIG.TEAM_MAX_LEVEL ? state.coins >= teamCost(i, state.team[i] + 1) : teamPlusOf(i) < PLUS_MAX && state.coins >= plusCost(i, teamPlusOf(i) + 1)));
}

function updateTeamUI() {
  const alertTab = ui.tabs.querySelector('[data-tab="team"]');
  if (alertTab) alertTab.classList.toggle('alert', hasTeamAction() && state.tab !== 'team');
  if (ui.paneTeam.hidden) return;
  TEAM.forEach((m, i) => {
    const el = teamEls[i];
    const unlocked = isTeamUnlocked(i);
    el.card.hidden = !unlocked;
    if (!unlocked) return;
    const lvl = state.team[i];
    el.card.classList.toggle('unhired', lvl === 0);
    setText(el.name, t('team_' + m.id), 'tn' + i);
    setText(el.role, t('team_' + m.id + '_role'), 'tr' + i);
    setText(el.trait, t('team_' + m.id + '_trait'), 'tt' + i);
    const stars = teamStarsOf(i), plus = teamPlusOf(i);
    setText(el.lvl, lvl === 0 ? '' : t('teamLevel', lvl, CONFIG.TEAM_MAX_LEVEL) + (lvl >= CONFIG.TEAM_MAX_LEVEL ? '  ★ ' + stars + '/' + STAR_MAX : ''), 'tl' + i + '_' + lvl + '_' + stars);
    if (lvl === 0) {
      setText(el.now, t('teamGives', bonusText(i, 1)), 'tw' + i);
      setText(el.next, '', 'tx' + i);
    } else {
      setText(el.now, t('teamNow', bonusText(i, lvl)), 'tw' + i + '_' + lvl + '_' + plus);
      setText(el.next, lvl < CONFIG.TEAM_MAX_LEVEL ? t('teamNext', bonusText(i, lvl + 1)) : (plus < PLUS_MAX ? t('teamNext', bonusText(i, lvl, starMultAt(plus + 1))) : ''), 'tx' + i + '_' + lvl + '_' + plus);
    }
    if (lvl >= CONFIG.TEAM_MAX_LEVEL) {
      if (plus >= PLUS_MAX) { setText(el.btn, t('teamMax'), 'tb' + i); el.btn.disabled = true; }
      else { const sc = plusCost(i, plus + 1); setText(el.btn, t('teamStarBtn', stars + 1, plus % STAR_STEP + 1, STAR_STEP, fmt(sc)), 'tb' + i + '_' + plus); el.btn.disabled = state.coins < sc; }
    } else {
      const cost = teamCost(i, lvl + 1);
      setText(el.btn, t(lvl === 0 ? 'teamHire' : 'teamUpgrade', fmt(cost)), 'tb' + i);
      el.btn.disabled = state.coins < cost;
    }
  });
  const nextLocked = TEAM.find((m, i) => !isTeamUnlocked(i) && !m.needs);
  teamLockedEl.hidden = !nextLocked;
  if (nextLocked) setText(teamLockedEl, t('lockedTeam', t('levelName_' + nextLocked.level)), 'tlocked');
}

function updateDepartmentsUI() {
  const alertTab = ui.tabs.querySelector('[data-tab="departments"]');
  if (alertTab) alertTab.classList.toggle('alert', hasAffordableAction() && state.tab !== 'departments');
  if (ui.paneDepts.hidden) return;

  // режими покупки
  ui.buyModes.querySelectorAll('.buy-mode').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === String(state.buyMode))));

  // картка розширення
  const next = nextLevelDef();
  if (!next) {
    ui.expandTitle.textContent = t('levelName_' + state.shopLevel);
    setText(ui.expandNote, t('expandMax'), 'expandNote');
    ui.expandReqs.innerHTML = '';
    uiCache.reqSig = '';
    ui.expandBtn.hidden = true;
  } else {
    ui.expandBtn.hidden = false;
    const nextLevel = state.shopLevel + 1;
    setText(ui.expandTitle, t('expandTitle', t('levelName_' + nextLevel)), 'expandTitle');
    setText(ui.expandNote, t('expandNote'), 'expandNote');
    const hires = hireRequirements();
    const sig = nextLevel + '|' + state.lang + '|' + next.requires.map(r => Math.min(state.depts[r.dept], r.count)).join(',') + '|' + hires.map(i => Math.min(state.team[i], hireLevel())).join(',');
    if (uiCache.reqSig !== sig) {
      uiCache.reqSig = sig;
      ui.expandReqs.innerHTML = '';
      next.requires.forEach(r => {
        const row = document.createElement('div');
        const have = state.depts[r.dept];
        row.className = 'req' + (have >= r.count ? ' ok' : '');
        const name = document.createElement('span');
        name.textContent = deptIcon(r.dept) + ' ' + deptName(r.dept);
        const val = document.createElement('b');
        val.textContent = (have >= r.count ? '✓ ' : '') + Math.min(have, r.count) + ' / ' + r.count;
        row.append(name, val);
        ui.expandReqs.appendChild(row);
      });
      hires.forEach(i => {                                            // найняти звірят цього рівня
        const done = state.team[i] >= hireLevel();
        const row = document.createElement('div');
        row.className = 'req' + (done ? ' ok' : '');
        const name = document.createElement('span');
        name.textContent = '🐾 ' + t('reqHire', t('team_' + TEAM[i].id), hireLevel());
        const val = document.createElement('b');
        val.textContent = (done ? '✓ ' : '') + Math.min(state.team[i], hireLevel()) + ' / ' + hireLevel();
        row.append(name, val);
        ui.expandReqs.appendChild(row);
      });
    }
    setText(ui.expandBtn, t('expandBtn', fmt(expandCost(next))), 'expandBtn');
    ui.expandBtn.disabled = !(requirementsMet(next) && state.coins >= expandCost(next));
  }

  // картки відділів
  DEPARTMENTS.forEach((d, i) => {
    const el = deptEls[i];
    const unlocked = isDeptUnlocked(i);
    el.card.hidden = !unlocked;
    if (!unlocked) return;
    const count = state.depts[i];
    const each = deptIncomeEach(i);
    setText(el.name, deptName(i), 'dn' + i); setText(el.icon, deptIcon(i), 'di' + i);
    setText(el.count, '×' + fmt(count), 'dc' + i);
    setText(el.each, t('deptEach', fmt(each, 1)), 'de' + i);
    setText(el.total, t('deptTotal', fmt(each * count, 1)), 'dt' + i);
    const nm = nextMilestone(count);
    if (nm === null) {
      el.bar.style.width = '100%';
      setText(el.msText, t('msDone'), 'dm' + i);
    } else {
      const prev = CONFIG.MILESTONES.filter(m => m <= count).pop() || 0;
      el.bar.style.width = ((count - prev) / (nm - prev) * 100) + '%';
      setText(el.msText, t('msNext', count, nm), 'dm' + i);
    }
    const n = plannedBuy(i);
    const cost = deptCost(i, n);
    setText(el.buy, t('buyLabel', fmt(n), fmt(cost)), 'db' + i);
    el.buy.disabled = state.coins < cost;
  });

  // підказка про наступні відділи
  const nextLocked = DEPARTMENTS.find((d, i) => !isDeptUnlocked(i));
  deptLockedEl.hidden = !nextLocked;
  if (nextLocked) setText(deptLockedEl, t('lockedDepts', t('levelName_' + nextLocked.level)), 'locked');
}

/* ---------- Тости ---------- */
function showToast(text, kind, icon) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  if (icon) { el.appendChild(icon); const tx = document.createElement('span'); tx.textContent = text; el.appendChild(tx); }   // icon — маленький canvas (значок досягнення)
  else el.textContent = text;
  el.style.setProperty('--life', CONFIG.TOAST_SECONDS + 's');
  el.addEventListener('animationend', e => { if (e.animationName === 'toastOut') el.remove(); });
  ui.toasts.appendChild(el);
  while (ui.toasts.childElementCount > CONFIG.MAX_TOASTS) ui.toasts.firstChild.remove();
}

