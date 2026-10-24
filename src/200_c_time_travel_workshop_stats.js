//#part 200_c_time_travel_workshop_stats.js
// Власне скидання: лишаються кристали, досягнення, статистика, прочитані глави й покращення майстерні
// Подорож у часі по етапах (updateWarp виконує по одному на кадр, поки вир закриває сцену); applyTimeTravel виконує всі одразу
function applyTimeTravelSteps() {
  return [
    () => {
  syncEpochEarned();
  const gain = prestigeGain();
  state.shards += gain;
  state.shardsTotal += gain;
  state.stats.timeTravels++;
  state.stats.maxLevel = Math.max(state.stats.maxLevel, state.shopLevel);
  state.epoch++;
  state.eid = nextEpochId(curEpoch());
  state.activeEpoch = -1;
  state.team.forEach((lv, i) => { if (lv > 0) state.teamKnown[i] = 1; });      // звірятка лишаються знайомими
  state.coins = CONFIG.START_COINS;
  state.depts = DEPARTMENTS.map(() => 0);
  state.team = TEAM.map(() => 0);
  state.teamPlus = TEAM.map(() => 0);
  state.shopLevel = startLevel();
  state.runStartEarned = state.totalEarned;
  state.events.incomeBoostUntil = 0; state.events.tapBoostUntil = 0;
  trouble = null; sackDrop = null;
  build = null; ui.shopOverlay.style.visibility = '';
  actors.length = 0;
  customers.length = 0;
  recalcIncome();
    },
    ...epochLayerSteps(),
    () => {
  resetEpochFx();
  rebuildShop(true);
  syncActors();
  syncGuests();
  layoutScene();
    },
    () => {
  updateMusic();
  updateUI();
  checkAchievements();
  saveGame();
    }
  ];
}
function applyTimeTravel() { applyTimeTravelSteps().forEach(fn => fn()); }

/* ---------- Майстерня часу ---------- */
function wsEffectText(id, L) {
  switch (id) {
    case 'goldenFreq':   return t('wsEff_goldenFreq', Math.round(L * 15));
    case 'autoTap':      return t('wsEff_autoTap', L);
    case 'offlineHours': return t('wsEff_offlineHours', CONFIG.OFFLINE_MAX_HOURS + 4 * L);
    case 'offlineRate':  return t('wsEff_offlineRate', Math.round((CONFIG.OFFLINE_RATE + 0.05 * L) * 100));
    case 'salesFreq':    return t('wsEff_salesFreq', Math.round((1 / (1 - 0.05 * L) - 1) * 100));
    case 'saleLength':   return t('wsEff_saleLength', CONFIG.SALE_SECONDS + 20 * L);
    case 'wheelFast':    return t('wsEff_wheelFast', Math.round(CONFIG.DAY_SECONDS / 6 * (CIRCUS_FREQ_BY_LEVEL[L] || 1)) / 10);
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
  const next = nextEpochId(curEpoch());
  const sig = JSON.stringify(rows) + state.lang + next;
  if (sig === routeSig) return;
  routeSig = sig;
  ui.routeTitle.textContent = t('routeTitle'); ui.routeNext.textContent = t(next === 8 ? 'routeNextBonus' : 'routeNext', t('epoch_' + next));
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
  const done = state.ach.reduce((s, v, i) => s + (ACHIEVEMENTS[i].hidden ? 0 : v), 0);
  setText(ui.achSummary, t('achSummary', done, achTotal()), 'achSum');
  ACHIEVEMENTS.forEach((a, i) => {
    const e = achEls[i], got = state.ach[i] === 1, v = achValue(a);
    e.card.style.display = a.hidden ? 'none' : '';
    if (a.hidden) return;
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
  const rows = ['stEpoch', 'stPlay', 'stEarned', 'stRun', 'stCps', 'stTap', 'stTaps', 'stDepts', 'stCrystals', 'stShards', 'stTravels', 'stRaccoons', 'stGhosts', 'stWheel', 'stAch', 'stChapters'];
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
    stEpoch: t('epoch_' + epochOf(s)) + ' (' + (epochOf(s) + 1) + ')',
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
    stGhosts: fmt(st.ghostsCaught),
    stWheel: fmt(st.wheelSpins),
    stAch: s.ach.reduce((a, b, i) => a + (ACHIEVEMENTS[i].hidden ? 0 : b), 0) + ' / ' + achTotal(),
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
function setEpochPreviewSteps(e) {
  return [
    () => { syncEpochEarned(); state.activeEpoch = (e === null || e === curEpoch()) ? -1 : e; },
    ...epochLayerSteps(),
    () => { refreshDeptTexts(); updateMusic(); updateUI(); saveGame(); }
  ];
}
function setEpochPreview(e) { setEpochPreviewSteps(e).forEach(fn => fn()); }
function refreshDeptTexts() { uiCache.reqSig = ''; uiCache.boostSig = ''; DEPARTMENTS.forEach((d, i) => { if (deptEls[i]) { deptEls[i].name.textContent = deptName(i); deptEls[i].icon.textContent = deptIcon(i); } }); }
function updateEpochViewUI() {
  const card = $('epochViewCard');
  if (!card) return;
  card.hidden = false;                              // картка видна завжди; поки пройдено лише одну епоху — одна кнопка
  if (!DEV_OPEN_ALL && state.epoch < 1 && state.activeEpoch >= 0) { state.activeEpoch = -1; rebuildEpochLayers(); }
  const box = ui.setEpochView, top = DEV_OPEN_ALL ? EPOCHS.length - 1 : Math.min(Math.max(state.epoch, curEpoch()), EPOCHS.length - 1), cur = viewEpoch() % EPOCHS.length, sig = state.lang + '|' + top;
  if (box._sig !== sig) {                          // кнопки створюються ОДИН раз (інакше клік губиться, коли вони перемальовуються між натисканням і відпусканням)
    box._sig = sig; box.innerHTML = '';
    for (let e = 0; e < EPOCHS.length; e++) {                                  // усі епохи видно, ще не пройдені — із замочком
      if (e === 8) { const sp = document.createElement('p'); sp.className = 'ws-line ev-sep'; sp.textContent = t('epochBonus'); box.appendChild(sp); }
      const bt = document.createElement('button');
      bt.type = 'button'; bt.className = 'btn lang-pick'; bt.dataset.ep = String(e);
      const n1 = document.createElement('span'); n1.textContent = t('epoch_' + e);
      const n2 = document.createElement('span'); n2.className = 'ev-earned';
      bt.append(n1, n2);
      if (e > top) { bt.classList.add('locked'); bt.append(lockImg('lock')); }
      bt.addEventListener('click', () => { if (e > top) { showToast(t('epochLocked'), 'bad'); playSfx('pip'); return; } if (e === viewEpoch() % EPOCHS.length || warp) return; if (animOn()) startWarp(e); else setEpochPreview(e); });
      box.appendChild(bt);
    }
  }
  box.querySelectorAll('button').forEach(bt => {   // далі оновлюються лише підписи й стан «вибрано»
    const e = +bt.dataset.ep, txt = e > top ? '' : '🪙 ' + fmt(Math.floor(e === curEpoch() ? state.coins : (state.epochEarned[e] || 0))), n2 = bt.querySelector('.ev-earned');
    if (n2.textContent !== txt) n2.textContent = txt;
    const on = String(e === cur && e <= top);
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
  const pe = $('pane-epochs'); if (pe && !pe.hidden) updateEpochViewUI();       // кнопки епох живуть у вкладці «Епохи»
  if (ui.paneSettings.hidden) return;
  ui.setTime.querySelectorAll('button').forEach(b => { b.textContent = t('time_' + b.dataset.time); });          // «Час доби» живе в налаштуваннях: працює й поки «Пори року» закриті
  setSwitch(ui.setAnim, t('swAnim'), animOn());
  setSwitch(ui.setDayNight, t('swDayNight'), dayNightOn());
  const S = state.settings;
  setSwitch(ui.setBirds, t('swNoFly'), S.noFly);
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
  ui.setSeason.querySelectorAll('button').forEach(b => {
    const locked = seasonPickLocked(b.dataset.season);
    b.textContent = t('season_' + b.dataset.season);
    b.classList.toggle('locked', locked);
    b.title = locked ? seasonLockText(b.dataset.season) : '';
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
// Код власника: GOD:<пароль> вмикає режим бога на цьому пристрої, GOD:OFF — вимикає
function godCommand(pass) {
  try {
    if (pass.toUpperCase() === 'OFF') { localStorage.removeItem('capyGod'); showToast(t('godOff'), 'good'); setTimeout(() => location.reload(), 900); return; }
    if (sha256hex('capy-god|' + pass) === GOD_HASH) { localStorage.setItem('capyGod', GOD_HASH); showToast(t('godOn'), 'good'); setTimeout(() => location.reload(), 900); return; }
  } catch (e) { /* нічого */ }
  showToast(t('importFail'), 'bad');
}
function importSave() {
  const raw = ui.importBox.value.trim();
  if (/^GOD:/i.test(raw)) { godCommand(raw.slice(4).trim()); return; }
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
  state.settings.rain = false; state.settings.season = season || 'summer'; state.epoch = ep; state.eid = ep % EPOCHS.length; state.activeEpoch = -1; state.shopLevel = L; state.team = state.team.map((v, i) => (i < 8 ? 3 : 0)); state.dayPhase = ph; state.settings.panelOpen = !!panel;
  recalcIncome(); try { rebuildEpochLayers(); } catch (e) { /* ок */ } rebuildShop(true); syncActors(); layoutScene(); applyPanel(); document.querySelectorAll('.toast').forEach(e => e.remove()); return 'ok';
};
// Кнопка «Режим бога ВИМК/УВІМК» у Налаштуваннях (лише власнику): зберігає гру, ставить/знімає прапорець паузи й перезавантажує
function toggleGodMode() {
  try { saveGame(); if (GOD_PAUSED) localStorage.removeItem('capyGodPause'); else localStorage.setItem('capyGodPause', '1'); } catch (e) { showToast(t('importNoStorage'), 'bad'); return; }
  savingDisabled = true;
  showToast(t(GOD_PAUSED ? 'godOn' : 'godOff'), 'good');
  setTimeout(() => location.reload(), 700);
}
// Підписи кнопок режиму бога: стан, рівні для показу будівництва й «повернути/лишити рівень»
let dbgBuildKeep = false;
function refreshGodCard() {
  ui.godToggle.textContent = t(GOD_PAUSED ? 'godToggleOff' : 'godToggleOn');
  ui.godToggle.classList.toggle('danger', !GOD_PAUSED);
  ui.dbgBuildBtns.querySelectorAll('button').forEach(b => { b.textContent = '→ ' + b.dataset.lvl + '. ' + t('levelName_' + b.dataset.lvl); });
  ui.dbgBuildKeep.textContent = t(dbgBuildKeep ? 'dbgBuildKeepOn' : 'dbgBuildKeepOff');
}
// Режим бога: показати анімацію будівництва переходу на рівень L (без витрат і вимог). Після показу рівень повертається, якщо не ввімкнено «лишити»
function debugBuild(L) {
  if (build || buildPreview || !shop) { showToast(t('dbgBuildBusy'), 'bad'); return; }
  closeAllOverlaysForBuild();
  const back = state.shopLevel;
  buildPreview = { back, keep: dbgBuildKeep };
  state.shopLevel = L - 1; rebuildShop(true);
  const old = { canvas: shop.canvas, x: shop.x, y: shop.y, w: shop.w, h: shop.h };
  state.shopLevel = L; rebuildShop(true);
  startBuild(old);
  playSfx('build'); updateMusic(); layoutScene(); updateUI();
}
function closeAllOverlaysForBuild() {                                      // вкладку з меню на телефоні ховаємо, щоб було видно сцену
  try { if (mobileMQ.matches && state.settings.panelOpen) { state.settings.panelOpen = false; applyPanel(); } } catch (e) { /* не страшно */ }
}
// Режим тестування (?debug=1): швидко перевірити баланс
function debugHour() {
  const add = state.cps * 3600;
  state.coins += add; state.totalEarned += add; state.playTime += 3600;
  const shift = 3600000;
  ['nextSale', 'saleUntil', 'nextTrouble', 'incomeBoostUntil', 'tapBoostUntil'].forEach(k => { if (state.events[k]) state.events[k] -= shift; });
  if (state.wheel.lastSpin) state.wheel.lastSpin -= shift;
  if (state.wheel.mg) state.wheel.mg = state.wheel.mg.map(v => (v ? v - shift : 0));
  updateUI();
}
function debugX100() {
  const add = Math.max(100, state.coins * 99);
  state.coins += add; state.totalEarned += add;
  updateUI();
}

