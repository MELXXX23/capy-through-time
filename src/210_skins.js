//#part 210_skins.js
/* =====================================================================
   ВКЛАДКА «СКІНИ»: виграні в цирку наряди для Капі, магазину, погоди й героїв. Тап — вдягнути, ще раз — зняти.
   ===================================================================== */
const SKIN_ICONS = { capy: '🎩', shop: '🏪', weather: '🌈', street: '🧱', hero: '🐾' };
let skinsSig = '';
const skinPage = {};                 // яку «сторінку» (по 3 скіни) показано в кожній групі
function refreshTeamPortraits() {
  document.querySelectorAll('canvas.portrait[data-tid]').forEach(cv => { const c2 = cv.getContext('2d'); c2.clearRect(0, 0, 16, 16); c2.drawImage(getSpriteCanvas(teamSprite(cv.dataset.tid)), 0, 0); });
}
function equipSkin(type, i) {
  if (i >= 0 && !skinOwned(i)) {
    if (/^capy_ep\d$/.test(SKIN_POOL[i])) { showToast(t('skinOtherEpoch'), 'bad'); return; }      // скін епохи не продається: він вдягається сам у своїй епосі
    if (state.crystals < SKIN_PRICE) { showToast(t('skinNoCrystals', SKIN_PRICE), 'bad'); return; }
    askConfirm(t('skinBuyTitle'), t('skinBuyText', skinName(i), SKIN_PRICE, state.crystals), t('skinBuyYes'), () => {
      if (state.crystals < SKIN_PRICE || skinOwned(i)) return;
      state.crystals -= SKIN_PRICE; skinGrant(i);
      showToast(t('skinBought', skinName(i)), 'good');
      equipSkin(type, i); updateUI();
    });
    return;
  }
  setSkin(type, i >= 0 && state.skins[type] === i ? (type === 'capy' ? -2 : -1) : i);   // повторний тап знімає скін (Капі тоді повертається до скіна епохи)
  const now = state.skins[type];
  showToast(now === -2 ? t('skinWornToast', t('skinEpoch', t('epoch_' + (viewEpoch() % EPOCHS.length)))) : now < 0 ? t('skinDefaultToast') : t('skinWornToast', skinName(now)), 'good');
  if (type === 'hero' && !state.team.some(v => v > 0)) showToast(t('skinHeroNone'), 'bad');
}
// Знімає всі вдягнені скіни: усе повертається до початкового вигляду (куплені й виграні скіни лишаються)
function resetAllSkins() {
  const def = { capy: -2, shop: -1, weather: -1, street: -1, hero: -1 };
  let changed = false;
  SKIN_TYPES.forEach(ty => { if (state.skins[ty] !== def[ty]) { state.skins[ty] = def[ty]; changed = true; } });
  if (!changed) { showToast(t('skinsResetNone'), 'good'); return; }
  drawCapiPortrait(); refreshTeamPortraits(); rebuildShop(true); groundLayer = buildGroundLayer();
  playSfx('upgrade'); skinsSig = ''; updateSkinsUI(); showToast(t('skinsResetDone'), 'good'); saveGame();
}
function setSkin(type, i) {
  state.skins[type] = i;
  if (i !== -1) { const nm = skinOn(type); if (nm) setTimeout(() => capySay(type + '_' + nm), 350); }       // Капі коментує новий скін
  if (type === 'capy') drawCapiPortrait();
  else if (type === 'hero') refreshTeamPortraits();
  else if (type === 'shop') rebuildShop(true);
  else if (type === 'street') groundLayer = buildGroundLayer();
  playSfx('upgrade');
  skinsSig = '';
  updateSkinsUI();
  saveGame();
}
// Малює зразок скіна (name — 'pirate' тощо; null — звичайний вигляд) на новому canvas; на час малювання скін «приміряється»
function skinPreviewCanvas(type, name) {
  const cv = document.createElement('canvas');
  skinPreview[type] = name;
  const saveSign = lastRoofSign;
  try {
    let g;
    if (type === 'capy') {
      const c = getSpriteCanvas(capySprite());
      cv.width = Math.max(30, c.width + 2); cv.height = 24; g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(c, (cv.width - c.width) >> 1, 0);
    } else if (type === 'hero') {
      cv.width = 38; cv.height = 18; g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      [TEAM[0].id, TEAM[2].id].forEach((id, k) => g.drawImage(getOutlinedCanvas(teamSprite(id)), 1 + k * 19, 0));
    } else if (type === 'street') {
      cv.width = 64; cv.height = 40; g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      paintCobble(g, 0, 0, 64, 40, name || 'stone');
    } else if (type === 'shop') {
      const geo = buildShopCanvas(state.shopLevel, state.depts.map(tierOf));
      cv.width = geo.w; cv.height = geo.h; g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(geo.canvas, 0, 0);
    } else {
      cv.width = 64; cv.height = 40; g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      for (let y = 0; y < 40; y++) { g.fillStyle = y < 14 ? '#8fd3ea' : y < 28 ? '#b8e3f5' : '#dff3fa'; g.fillRect(0, y, 64, 1); }
      R(g, 0, 34, 64, 6, 'g'); R(g, 0, 34, 64, 1, 'm');
      R(g, 26, 22, 12, 12, 'w'); R(g, 25, 20, 14, 3, 'r'); R(g, 29, 27, 4, 7, 'b'); R(g, 34, 25, 3, 3, 's');
      if (name === 'rainbow') {
        g.drawImage(buildRainbow(30, 3.4, 3, false), -1, 1);
        R(g, 26, 22, 12, 12, 'w'); R(g, 25, 20, 14, 3, 'r'); R(g, 29, 27, 4, 7, 'b'); R(g, 34, 25, 3, 3, 's');
      } else if (CLOUD_SKIN_TINT[name]) {
        R(g, 0, 34, 64, 6, 'g'); R(g, 0, 34, 64, 1, 'm'); R(g, 26, 22, 12, 12, 'w'); R(g, 25, 20, 14, 3, 'r'); R(g, 29, 27, 4, 7, 'b'); R(g, 34, 25, 3, 3, 's');
        g.drawImage(cloudCanvas(0, CLOUD_SKIN_TINT[name]), 2, 0); g.drawImage(cloudCanvas(1, CLOUD_SKIN_TINT[name]), 28, 6);
      } else if (BOLT_COLS[name]) {
        const bc = { lightning: ['#2a1650', '#3d2275'], lightninggreen: ['#0f3a1e', '#1a5a30'], lightningred: ['#3a0f16', '#5a1a24'] }[name];
        g.fillStyle = bc[0]; g.fillRect(0, 0, 64, 40); g.fillStyle = bc[1]; g.fillRect(0, 0, 64, 18);
        R(g, 0, 34, 64, 6, 'G'); R(g, 26, 22, 12, 12, 'e'); R(g, 25, 20, 14, 3, 'd'); R(g, 29, 27, 4, 7, 'b'); R(g, 34, 25, 3, 3, 'y');
        const p1 = [[18, 0], [22, 6], [17, 11], [23, 17], [19, 22], [22, 27]], p2 = [[46, 0], [43, 5], [48, 10], [44, 16]];
        const PV = [[5, BOLT_COLS[name].main[1][1], 0.28], [3, BOLT_COLS[name].main[3][1], 0.75], [1, '#ffffff', 1]], st = pts => { const d = boltDense(pts); strokeBolt(g, d, d.length, PV, 1); };
        st(p1); st([[22, 6], [28, 10], [31, 15]]); st([[17, 11], [11, 15], [9, 19]]); st(p2); st([[48, 10], [54, 14]]);
      } else {
        R(g, 8, 8, 12, 4, 'w'); R(g, 11, 6, 8, 3, 'w'); R(g, 44, 14, 12, 4, 'w'); R(g, 47, 12, 8, 3, 'w');
      }
    }
  } finally { delete skinPreview[type]; lastRoofSign = saveSign; }
  return cv;
}
function updateSkinsUI() {
  const tabEl = ui.tabs.querySelector('[data-tab="skins"]');
  if (tabEl) tabEl.classList.toggle('alert', ((state.skinsMask & ~state.skinsSeen) !== 0 || (state.skinsMask2 & ~state.skinsSeen2) !== 0) && state.tab !== 'skins');
  if (ui.paneSkins.hidden) return;
  state.skinsSeen = state.skinsMask; state.skinsSeen2 = state.skinsMask2;
  const sig = [state.skinsMask, state.skinsMask2, state.crystals >= SKIN_PRICE, SKIN_TYPES.map(ty => state.skins[ty]).join(), JSON.stringify(skinPage), state.lang, state.shopLevel, viewEpoch(), state.settings.gender, seasonNow()].join('|');
  if (sig === skinsSig) return;
  skinsSig = sig;
  ui.skinsList.innerHTML = '';
  [['capy', false], ['shop', false], ['weather', false], ['street', false], ['hero', false]].forEach(([type, epochGroup]) => {
    const card = document.createElement('div');
    card.className = 'card skin-cat';
    const gkey = type + (epochGroup ? 'E' : '');
    card.innerHTML = '<h2><span class="skin-title">' + (epochGroup ? '⏳ ' + t('skinCat_capyEpoch') : SKIN_ICONS[type] + ' ' + t('skinCat_' + type)) + '</span></h2><div class="skin-grid"></div>';
    const grid = card.querySelector('.skin-grid');
    const items = (type === 'capy' ? [{ i: -2, name: 'ep' + (viewEpoch() % EPOCHS.length) }] : []).concat(epochGroup || type === 'capy' ? [] : [{ i: -1, name: null }]).concat(SKIN_POOL.map((id, i) => ({ i, id })).filter(o => o.id.startsWith(type + '_') && !o.id.startsWith('capy_ep')).map(o => ({ i: o.i, name: o.id.slice(type.length + 1) }))).filter(o => !SKIN_HIDDEN.includes(SKIN_POOL[o.i])).sort((a, b) => (a.name === 'mel' || a.name === 'nika' ? 1 : 0) - (b.name === 'mel' || b.name === 'nika' ? 1 : 0) || (type === 'weather' ? WEATHER_ORDER.indexOf(a.name) - WEATHER_ORDER.indexOf(b.name) : 0));      // Мел і Ніка завжди останні, нові скіни стають перед ними
    const pages = Math.ceil(items.length / 3);
    if (skinPage[gkey] === undefined) skinPage[gkey] = epochGroup ? Math.floor((viewEpoch() % EPOCHS.length) / 3) : 0;
    skinPage[gkey] = Math.max(0, Math.min(pages - 1, skinPage[gkey]));
    if (pages > 1) {                                           // стрілки гортання: показано по 3 скіни
      const nav = document.createElement('span'); nav.className = 'skin-nav';
      const mk = (txt, d) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn skin-arrow'; b.textContent = txt; b.disabled = skinPage[gkey] + d < 0 || skinPage[gkey] + d >= pages; b.addEventListener('click', () => { skinPage[gkey] += d; skinsSig = ''; updateSkinsUI(); }); return b; };
      const cnt = document.createElement('span'); cnt.className = 'skin-count'; cnt.textContent = (skinPage[gkey] + 1) + '/' + pages;
      nav.append(mk('◀', -1), cnt, mk('▶', 1));
      card.querySelector('h2').appendChild(nav);
    }
    items.slice(skinPage[gkey] * 3, skinPage[gkey] * 3 + 3).forEach(o => {
      const owned = o.i < 0 || skinOwned(o.i);
      const worn = state.skins[type] === o.i;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn skin-item' + (owned ? '' : ' locked');
      b.setAttribute('aria-pressed', String(worn));
      const cv = skinPreviewCanvas(type, o.name);
      cv.className = 'skin-prev ' + type;
      b.appendChild(cv);
      const nm = document.createElement('span'); nm.className = 'skin-name';
      nm.textContent = (SKIN_SEASON[SKIN_POOL[o.i]] ? SKIN_SEASON[SKIN_POOL[o.i]] + ' ' : '') + (o.i === -2 ? t('skinEpoch', t('epoch_' + (viewEpoch() % EPOCHS.length))) : o.i < 0 ? t('skinDefault') : skinName(o.i));
      const st = document.createElement('span'); st.className = 'skin-state';
      st.textContent = o.i === -2 ? (worn ? '✓ ' + t('skinWorn') : '↩ ' + t('skinBackToEpoch')) : o.i < 0 ? (worn ? '✓ ' + t('skinWorn') : '') : !owned ? (/^capy_ep\d$/.test(SKIN_POOL[o.i]) ? t('skinOtherEpoch') : t('skinBuy', SKIN_PRICE)) : worn ? '✓ ' + t('skinWorn') : t('skinWear');
      if (!owned && o.i >= 0) { st.prepend(lockImg('lock')); b.appendChild(lockImg('lock-badge')); }
      b.append(nm, st);
      b.addEventListener('click', () => equipSkin(type, o.i));
      grid.appendChild(b);
    });
    ui.skinsList.appendChild(card);
  });
}

/* ---------- Вкладки: показ / сховання ---------- */
function updateTabsVisibility() {
  ui.tabs.querySelectorAll('.tab').forEach(b => {
    const tab = TABS.find(x => x.id === b.dataset.tab);
    b.hidden = !!(tab.needs === 'finale' && !(state.story.finale || state.story.done >= 7));
    b.classList.toggle('locked', tab.lock === 'themes' && !themesUnlocked());
  });
}

function updateProgressionUI() {
  updateTabsVisibility();
  updateWorkshopUI();
  updateAchUI();
  updateStatsUI();
  updateSettingsUI();
  updateSeasonsUI();
  updateSkinsUI();
  setText(ui.statEpoch, t('epoch_' + (state.epoch % EPOCHS.length)), 'statEpoch');
}

function setupProgression() {
  buildWorkshop();
  buildAchievements();
  buildStats();
  // мова в налаштуваннях
  ui.setLangBtns.innerHTML = '';
  LANGS.forEach(l => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn lang-pick'; b.dataset.lang = l.id; b.textContent = l.label;
    b.addEventListener('click', () => setLanguage(l.id));
    ui.setLangBtns.appendChild(b);
  });
  ui.timeWarp.addEventListener('pointerdown', () => { if (warp && (state.warpSeen || warp.demo) && warp.t < warp.dur) warp.t = warp.dur; });          // дотик пропускає анімацію (після першого перегляду)
  ui.setNumFmt.innerHTML = '';
  ['short', 'sci', 'full'].forEach(f => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn lang-pick'; b.dataset.fmt = f;
    b.addEventListener('click', () => { state.settings.numFmt = f; for (const k in uiCache) delete uiCache[k]; updateUI(); saveGame(); });
    ui.setNumFmt.appendChild(b);
  });
  ui.setAnim.addEventListener('click', () => { state.settings.animations = !animOn(); applyViewSettings(); updateUI(); saveGame(); });
  // стать гравця: змінює звернення в історії та підказках
  ui.setGender.innerHTML = '';
  ['f', 'm'].forEach(g => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn lang-pick'; b.dataset.gender = g;
    b.addEventListener('click', () => { state.settings.gender = g; applyTranslations(); drawCapiPortrait(); saveGame(); });
    ui.setGender.appendChild(b);
  });
  // пора року: свої дерева, погода й прикраси
  ui.setSeason.innerHTML = '';
  SEASONS.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn lang-pick'; b.dataset.season = s;
    b.addEventListener('click', () => { if (s !== 'auto' && !themesUnlocked()) { showToast(t('themeLocked'), 'bad'); return; } state.settings.season = s; theme.key = null; updateTheme(); updateMusic(); updateUI(); saveGame(); });
    ui.setSeason.appendChild(b);
  });
  // швидко перемкнути час доби (далі сонце й місяць рухаються самі)
  ui.setTime.innerHTML = '';
  [['morning', 0.27], ['day', 0.5], ['evening', 0.74], ['night', 0.95]].forEach(p => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn lang-pick'; b.dataset.time = p[0];
    b.addEventListener('click', () => { state.dayPhase = p[1]; state.settings.dayNight = true; updateUI(); saveGame(); });
    ui.setTime.appendChild(b);
  });
  ui.setDayNight.addEventListener('click', () => { state.settings.dayNight = !dayNightOn(); updateUI(); saveGame(); });
  [['setBirds', 'birds'], ['setBirdsLate', 'birdsLate'], ['setClouds', 'clouds'], ['setSteam', 'steam'], ['setVibrate', 'vibrate']].forEach(([id, key]) => ui[id].addEventListener('click', () => { state.settings[key] = !state.settings[key]; if (key === 'vibrate') buzz(30); updateUI(); saveGame(); }));
  ui.setRain.addEventListener('click', () => { state.settings.rain = !state.settings.rain; if (state.settings.rain) weather.rain = Math.max(weather.rain, 0.3); updateUI(); saveGame(); });
  ui.setEco.addEventListener('click', () => { state.settings.eco = !state.settings.eco; state.settings.ecoAsked = true; perf.slow = 0; perf.auto = false; updateUI(); saveGame(); });
  ui.licenseBtn.addEventListener('click', () => { window.open('https://openfontlicense.org/', '_blank', 'noopener'); });
  ui.privacyBtn.addEventListener('click', () => { window.open('https://melxxx23.github.io/capy-through-time/privacy.html', '_blank', 'noopener'); });
  ui.reportBtn.addEventListener('click', () => copyText(buildReport(), ui.reportBox, 'reportCopied'));
  ui.setBigText.addEventListener('click', () => { state.settings.bigText = !state.settings.bigText; applyViewSettings(); updateUI(); saveGame(); });
  ui.setSound.addEventListener('click', () => { ui.soundModal.hidden = false; updateSoundUI(); });
  ui.exportBtn.addEventListener('click', showExport);
  if (navigator.share) { ui.shareBtn.hidden = false; ui.shareBtn.addEventListener('click', shareExport); }
  ui.copyBtn.addEventListener('click', copyExport);
  ui.importBtn.addEventListener('click', importSave);
  ui.resetBtn.addEventListener('click', () => askConfirm(t('resetTitle'), t('resetText'), t('resetYes'), hardReset));
  ui.warpBtn.addEventListener('click', askTimeTravel);
  document.getElementById('skinsReset').addEventListener('click', resetAllSkins);
  ui.newsClose.addEventListener('click', closeNews);
  ui.npWrite.addEventListener('click', openFeedback); ui.fbCancel.addEventListener('click', closeFeedback); ui.fbSend.addEventListener('click', sendFeedback);
  ui.fbModal.addEventListener('click', e => { if (e.target === ui.fbModal) closeFeedback(); });
  ui.fbText.addEventListener('input', () => { ui.fbCount.textContent = ui.fbText.value.length + ' / 800'; try { localStorage.setItem('capyFeedbackDraft', ui.fbText.value); } catch (e) { /* ok */ } });
  ui.newsModal.addEventListener('click', e => { if (e.target === ui.newsModal || e.target.classList.contains('np-wrap')) closeNews(); });
  ui.npPrev.addEventListener('click', () => npGo(-1)); ui.npNext.addEventListener('click', () => npGo(1));
  ui.npPaper.addEventListener('pointerdown', e => { npDrag = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  ui.npPaper.addEventListener('pointerup', e => {                                  // свайп гортає сторінку; короткий тап: правий бік — далі, лівий — назад
    if (!npDrag) return; const dx = e.clientX - npDrag.x, dy = e.clientY - npDrag.y; npDrag = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) npGo(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && !e.target.closest('button')) { const r = ui.npPaper.getBoundingClientRect(); npGo(e.clientX > r.left + r.width * 0.5 ? 1 : -1); }
  });
  document.addEventListener('keydown', e => { if (ui.newsModal.hidden || !ui.fbModal.hidden || e.target.closest('input,textarea')) return; if (e.key === 'ArrowRight') npGo(1); else if (e.key === 'ArrowLeft') npGo(-1); else if (e.key === 'Escape') closeNews(); });
  ui.siLater.addEventListener('click', () => { ui.siModal.hidden = true; });
  ui.siGo.addEventListener('click', () => { ui.siModal.hidden = true; onTabClick('seasons'); });
  ui.confirmYes.addEventListener('click', () => { ui.confirmModal.hidden = true; const cb = confirmCb; confirmCb = null; if (cb) cb(); });
  ui.confirmNo.addEventListener('click', () => { ui.confirmModal.hidden = true; confirmCb = null; });
  ui.debugCard.hidden = !isDebug();
  ui.dbgHour.addEventListener('click', debugHour);
  ui.dbgX100.addEventListener('click', debugX100);
  document.body.dataset.epoch = String(viewEpoch() % EPOCHS.length);
  applyViewSettings();
}

