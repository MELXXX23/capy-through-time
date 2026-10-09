// Виконується ВСЕРЕДИНІ гри (її запускає tools/autotest.js). Повертає { fails: [...], notes: [...] }.
// Перевіряє: усі епохи × рівні магазину, сезони × час доби, вкладки меню × епохи (чи не вилазить текст),
// події (розпродаж, протікання, єнот, привиди, цирк, відьма, колесо, газета, заставки епох, подорож),
// переклади (uk/en однакові ключі й підстановки), збереження (код туди й назад) і помилки в консолі.
(async () => {
  const QUICK = !!window.__QUICK;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fails = [], notes = [], errs = [];
  window.addEventListener('error', e => /ResizeObserver loop/.test(e.message) || errs.push('ERR ' + e.message + ' @' + (e.lineno || '')));
  window.addEventListener('unhandledrejection', e => errs.push('PROMISE ' + (e.reason && e.reason.message || e.reason)));
  const fail = m => { if (fails.length < 80 && !fails.includes(m)) fails.push(m); };
  const check = async (label, fn, wait) => {
    const before = errs.length;
    try { await fn(); } catch (e) { fail(label + ' → THROW ' + e.message); }
    await sleep(wait === undefined ? 250 : wait);
    if (errs.length > before) fail(label + ' → ' + errs.slice(before).slice(0, 2).join('; '));
  };
  const closeAll = () => {
    document.querySelectorAll('[id$="Modal"]').forEach(m => { m.hidden = true; });
    try { if (epochIntro.active) finishEpochIntro(); } catch (e) { /* нічого */ }
    try { ui.dialog.hidden = true; dialog.active = false; } catch (e) { /* нічого */ }
  };

  // ---------- підготовка: пропускаємо заставки й діалоги ----------
  await sleep(3500);
  try { cutStop(false); } catch (e) { /* нічого */ }
  try { tourStop(false); } catch (e) { /* нічого */ }
  closeAll();
  state.cutSeen = true; state.tutorialDone = true; state.story.finale = true; state.story.done = 8;
  state.epochIntroSeen = 99; storyTimer = 1e9; state.settings.dayNight = false; state.settings.panelOpen = false;
  state.coins = 1e30; state.totalEarned = 1e30;
  await sleep(500);

  const sceneOK = label => {                                     // сцена не порожня: на полотні багато різних кольорів
    const c = ui.view, g = c.getContext('2d'), seen = new Set();
    const W = c.width, H = c.height;
    for (let y = 2; y < H; y += Math.max(2, H >> 5)) for (let x = 2; x < W; x += Math.max(2, W >> 6)) { const d = g.getImageData(x, y, 1, 1).data; seen.add(d[0] >> 3 << 16 | d[1] >> 3 << 8 | d[2] >> 3); }
    if (seen.size < 14) fail(label + ' → сцена майже порожня (' + seen.size + ' кольорів)');
  };
  const setWorld = (ep, lvl, phase) => {
    state.epoch = ep; state.activeEpoch = -1; state.shopLevel = lvl; state.dayPhase = phase;
    state.team = TEAM.map((m, i) => (m.level <= lvl && !m.needs ? 3 : 0));
    state.depts = DEPARTMENTS.map(d => (d.level <= lvl ? 3 : 0));
    state.settings.season = 'summer'; state.story.guests = state.story.guests.map(() => 1);          // усі гості зустрінуті: видно їхні місця
    updateTheme(); recalcIncome(); rebuildShop(true); syncActors(); syncGuests();
  };

  // ---------- 1. усі епохи × рівні магазину ----------
  const phases = [0.3, 0.5, 0.75, 0.02];
  const levels = QUICK ? [1, 3, 6] : [1, 2, 3, 4, 5, 6];
  for (let ep = 0; ep < EPOCHS.length; ep++) for (const lvl of levels) {
    const label = 'епоха ' + ep + ' рівень ' + lvl;
    await check(label, () => setWorld(ep, lvl, phases[(ep + lvl) % 4]), 280);
    sceneOK(label);
  }
  notes.push('епохи × рівні: ' + EPOCHS.length * levels.length);

  // ---------- 2. сезони × час доби ----------
  setWorld(2, 4, 0.5);
  for (const s of SEASONS) if (s !== 'auto') for (const ph of phases) {
    const label = 'сезон ' + s + ' час ' + ph;
    await check(label, () => { state.settings.season = s; state.dayPhase = ph; updateTheme(); }, 220);
    sceneOK(label);
  }
  state.settings.season = 'summer'; updateTheme();

  // ---------- 3. вкладки меню × епохи: нічого не вилазить, нема «сирих» ключів ----------
  let scanned = 0;
  const scan = tag => {
    const root = document.querySelector('#panel'); if (!root) return;
    const pr = root.getBoundingClientRect();
    root.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (!el.offsetParent && cs.position !== 'fixed') return;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
      if (!own) return;
      scanned++;
      if (/^[a-z][a-zA-Z0-9]*_[a-zA-Z0-9_]+$/.test(own) || /^(team|good|skin|ach|news|np|sw|set|epoch|story)[A-Z][A-Za-z0-9]+$/.test(own)) fail(tag + ' → сирий ключ "' + own + '"');
      if (r.right > pr.right + 1 || r.left < pr.left - 1) fail(tag + ' → ' + el.tagName + '.' + el.className + ' "' + own.slice(0, 30) + '" виходить за панель');
      if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll' && cs.overflowX !== 'hidden') fail(tag + ' → ' + el.tagName + '.' + el.className + ' "' + own.slice(0, 30) + '" обрізається (' + el.scrollWidth + '>' + el.clientWidth + ')');
    });
  };
  const tabIds = TABS.map(x => x.id);
  const epochsForTabs = QUICK ? [0, 3, 7] : [0, 1, 2, 3, 4, 5, 6, 7];
  for (const ep of epochsForTabs) {
    setWorld(ep, 4, 0.5); state.shards = 123456; state.crystals = 789;
    for (const id of tabIds) {
      await check('вкладка ' + id + ' епоха ' + ep, () => { showTab(id); try { setSheet(true); ui.app.classList.add('more-open'); } catch (e) { /* ПК */ } }, 260);
      scan('вкладка ' + id + ' епоха ' + ep);
      const tc = document.querySelector('#tabContent');
      if (tc && !QUICK) for (let y = 0; y < tc.scrollHeight; y += Math.max(240, tc.clientHeight - 60)) { tc.scrollTop = y; await sleep(80); scan('вкладка ' + id + ' епоха ' + ep + ' @' + y); }
    }
  }
  try { setSheet(false); } catch (e) { /* нічого */ }
  showTab('shop');
  if (document.documentElement.scrollWidth > innerWidth + 1) fail('сторінка гортається вбік (' + document.documentElement.scrollWidth + '>' + innerWidth + ')');

  // ---------- 4. події ----------
  setWorld(3, 4, 0.5); closeAll();
  await check('розпродаж', () => startSale(Date.now()), 600);
  await check('протікання даху', () => { startLeak(); }, 700);
  await check('протікання: лагодження', () => { while (puddles.length) removePuddle(0); }, 300);
  await check('єнот', () => { startRaccoon(); }, 900);
  await check('єнот: кінець', () => { trouble = null; recalcIncome(); }, 200);
  for (const ep of [1, 3, 6]) {
    await check('герої епохи ' + ep, () => { setWorld(ep, 4, 0.5); startGhostHunt(); }, 1200);
    await check('герої епохи ' + ep + ': кінець', () => { endGhostHunt(); }, 200);
  }
  setWorld(2, 4, 0.5); state.settings.season = 'halloween'; updateTheme();
  await check('привиди Хелловіну', () => { startGhostHunt(); }, 1500);
  await check('привиди: кінець', () => { endGhostHunt(); }, 200);
  state.settings.season = 'summer'; updateTheme(); closeAll();
  // цирк: по черзі кожна фаза
  for (const ph of [1, 2.5, 2.7, 3, 3.5, 4]) await check('цирк фаза ' + ph, () => { state.circus.phase = ph; state.circus.hag = 0; }, 700);
  await check('цирк: колесо', () => { openCircus(); }, 400);
  await check('цирк: закрити', () => { closeAll(); state.circus.phase = 0; state.circus.next = Date.now() + 1e9; }, 200);
  // відьма й «Три казанки»
  state.settings.season = 'halloween'; updateTheme(); state.circus.hag = 1;
  await check('відьма: політ', () => { hagStartFlight(); }, 1500);
  await check('відьма: гра', () => { openCircus(); hagStart(); }, 800);
  await check('відьма: закрити', () => { closeAll(); state.circus.hag = 0; hagFly.on = false; }, 200);
  state.settings.season = 'summer'; updateTheme();
  await check('колесо фортуни', () => { openWheel(); }, 500);
  await check('газета', () => { openNews(); }, 700);
  for (let p = 0; p < 6; p++) await check('газета сторінка ' + p, () => { try { npGo(p); } catch (e) { /* менше сторінок */ } }, 160);
  await check('відгук', () => { closeAll(); openFeedback(); }, 300);
  closeAll();
  for (let ep = 0; ep < EPOCHS.length; ep++) {
    await check('заставка епохи ' + ep, () => { state.epoch = ep; playEpochIntro(ep, null); }, 1300);
    closeAll();
  }
  // подорож у часі: анімація (демо) для кожної епохи
  for (let ep = 0; ep < EPOCHS.length; ep++) {
    await check('подорож → епоха ' + ep, () => { if (!warp) startWarp(ep, true); }, 1200);
    try { warp = null; ui.timeWarp.hidden = true; } catch (e) { /* нічого */ }
  }
  closeAll();
  // глави історії
  for (let n = 1; n <= 8; n++) await check('глава ' + n, () => { startDialogue(n, true); }, 350).then(() => { try { endDialogue(); } catch (e) { /* нічого */ } closeAll(); });

  // історії гостей епох і подяки: усі сторінки з текстом, без сирих ключів; допомога гостю: ловимо істот і рахуємо
  for (let n = 1; n <= 9; n++) for (const kind of ['ep', 'thx']) {
    await check('історія гостя ' + n + ' ' + kind, () => {
      startDialogue(n, true, kind, n);
      if (!dialog.active) throw new Error('діалог не відкрився');
      let guard = 0;
      while (dialog.active && guard++ < 40) {
        if (dialog.choosing) { chooseOption(1); continue; }
        if (!dialog.text || /^(ep|thx)d/.test(dialog.text) || dialog.text.length < 8) throw new Error('порожній або сирий текст сторінки ' + dialog.page + ': ' + dialog.text);
        dialog.shown = dialog.text.length; advanceDialog();
      }
    }, 60);
    closeAll();
  }
  {
    const sv = JSON.stringify(state.story);
    setWorld(1, 4, 0.5); state.story.guests[0] = 1; state.story.help[0] = HELP_NEED - 1; state.story.thx[0] = 0; state.crystals = 0;
    await check('допомога гостю: лови', () => {
      startGhostHunt();
      const g = ghostHunt.ghosts[0]; g.alive = true; ghostHunt.t = 5; g.sy = g.y; g.sx = g.x; g.x = g.x;
      if (!hitGhost({ x: g.x, y: g.sy - 6 })) throw new Error('не влучили по істоті');
      if (!helpDone(0)) throw new Error('допомогу не зараховано: ' + state.story.help[0]);
      if (state.crystals < 1) throw new Error('кристал за допомогу не видано');
      if (!helpThanksNow().includes(0) && helpThanksLate().length === 0) throw new Error('подяка не поставлена в чергу');
      endGhostHunt();
    }, 200);
    state.story = JSON.parse(sv); closeAll();
  }

  notes.push('перевірено підписів у меню: ' + scanned);
  if (scanned < 100) fail('перевірка меню побачила замало підписів (' + scanned + '): меню не відкрилось?');

  // ---------- 5. переклади ----------
  const U = translations.uk, E = translations.en, ph = s => (String(s).match(/\{\d+\}/g) || []).sort().join('');
  const onlyUk = Object.keys(U).filter(k => !(k in E)), onlyEn = Object.keys(E).filter(k => !(k in U));
  if (onlyEn.length) fail('переклади: є в en, нема в uk (' + onlyEn.length + '): ' + onlyEn.slice(0, 8).join(', '));
  if (onlyUk.length) fail('переклади: є в uk, нема в en (' + onlyUk.length + '): ' + onlyUk.slice(0, 8).join(', '));
  const badPh = Object.keys(U).filter(k => k in E && typeof U[k] === 'string' && typeof E[k] === 'string' && ph(U[k]) !== ph(E[k]));
  if (badPh.length) fail('переклади: різні {0}/{1} в uk і en (' + badPh.length + '): ' + badPh.slice(0, 8).join(', '));
  const emptyT = Object.keys(U).filter(k => typeof U[k] === 'string' && !U[k].trim());
  if (emptyT.length) fail('переклади: порожні тексти uk: ' + emptyT.slice(0, 8).join(', '));
  notes.push('ключів перекладу: uk ' + Object.keys(U).length + ', en ' + Object.keys(E).length);

  // ---------- 6. збереження ----------
  await check('збереження: код туди й назад', () => {
    const code = makeExportCode(), back = parseImportCode(code);
    if (Math.floor(back.state.totalEarned) !== Math.floor(state.totalEarned) || back.state.shopLevel !== state.shopLevel) throw new Error('код збереження не збігається зі станом');
    const fresh = createDefaultState(); mergeInto(fresh, back.state);
    if (fresh.epoch !== state.epoch) throw new Error('після mergeInto епоха інша');
  }, 50);
  await check('збереження: старі версії', () => {
    for (const v of [1, 5, 9, 12, 14, 15]) { const d = migrateSave({ v, state: createDefaultState() }); if (d.v !== CONFIG.SAVE_VERSION) throw new Error('міграція з v' + v + ' не дійшла до кінця'); }
  }, 50);
  await check('зірки помічників: 10 прокачувань = зірка, міграція зі старих зірок', () => {
    const d = migrateSave({ v: 16, state: Object.assign(createDefaultState(), { teamStars: TEAM.map((m, i) => (i === 0 ? 2 : 0)) }) });
    if (d.state.teamPlus[0] !== 20 || d.state.teamStars !== undefined) throw new Error('стара зірка не стала 10 прокачуваннями');
    const keep = state.teamPlus.slice(), keepLvl = state.team[0], keepCoins = state.coins;
    try {
      state.team[0] = CONFIG.TEAM_MAX_LEVEL; state.shopLevel = Math.max(state.shopLevel, TEAM[0].level); state.coins = 1e60; state.teamPlus[0] = 0;
      if (starMult(0) !== 1) throw new Error('без зірок множник не 1');
      for (let k = 1; k <= PLUS_MAX; k++) {
        buyStar(0);
        if (state.teamPlus[0] !== k) throw new Error('прокачування ' + k + ' не зарахувалось');
        if (k % STAR_STEP === 0 && (teamStarsOf(0) !== k / STAR_STEP || Math.abs(starMult(0) - STAR_MULT[k / STAR_STEP]) > 1e-9)) throw new Error('зірка на ' + k + ' неправильна');
      }
      buyStar(0); if (state.teamPlus[0] !== PLUS_MAX) throw new Error('понад 3 зірки можна купити');
    } finally { state.teamPlus = keep; state.team[0] = keepLvl; state.coins = keepCoins; recalcIncome(); }
  }, 50);
  await check('збереження: запис і друга копія', () => {
    forceBakNext = true; saveGame();
    if (!localStorage.getItem(CONFIG.SAVE_KEY) || !localStorage.getItem(SAVE_BAK_KEY)) throw new Error('нема основної або другої копії');
  }, 50);
  await check('звіт про помилки', () => { const r = buildReport(); if (!/Errors \(/.test(r)) throw new Error('звіт порожній'); }, 50);

  // ---------- підсумок ----------
  notes.push('помилок у консолі гри: ' + errs.length);
  notes.push('кадр: ' + Math.round(perf.ema * 1000) + ' мс (' + Math.round(1 / perf.ema) + ' к/с)');
  return { fails, notes };
})()
