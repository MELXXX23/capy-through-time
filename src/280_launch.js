//#part 280_launch.js
/* =====================================================================
   ЗАПУСК
   ===================================================================== */

/* ---------- Режим економії: сам вмикається, коли гра гальмує ---------- */
const perf = { ema: 1 / 60, slow: 0, auto: false };
function ecoOn() { return !!state.settings.eco; }
function perfSample(raw) {
  if (raw <= 0 || raw > 0.5 || document.hidden) return;             // вкладка спала або була пауза
  perf.ema += (raw - perf.ema) * 0.05;
  if (state.settings.eco || state.settings.ecoAsked || animClock < 8) return;
  if (perf.ema > 0.04) perf.slow += raw; else perf.slow = Math.max(0, perf.slow - raw * 2);       // менше 25 кадрів/с довше 6 секунд
  if (perf.slow > 6) {
    state.settings.eco = true; state.settings.ecoAsked = true; perf.auto = true;
    showToast(t('ecoAuto'), 'good'); updateUI(); saveGame();
  }
}

/* ---------- Звіт про помилки: текст без особистих даних ---------- */
function buildReport() {
  const S = state.settings, n = navigator, scr = window.screen || {}, on = v => (v ? 'on' : 'off');
  let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { /* нічого */ }
  const standalone = !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches) || n.standalone === true;
  const L = [
    'CapyTap: Market — report',
    'Game: news #' + NEWS_VERSION + ', save v' + CONFIG.SAVE_VERSION + (window.__debug ? ', desktop build' : ''),
    'Time: ' + new Date().toISOString() + (tz ? ' (' + tz + ')' : ''),
    'Device: ' + n.userAgent,
    'Screen: ' + scr.width + 'x' + scr.height + ' @' + (window.devicePixelRatio || 1) + ', window ' + innerWidth + 'x' + innerHeight + ', touch ' + (n.maxTouchPoints || 0) + ', app-mode ' + on(standalone),
    'Game state: lang ' + state.lang + ', epoch ' + state.epoch + ' (shown ' + viewEpoch() + '), shop level ' + state.shopLevel + ', travels ' + state.stats.timeTravels + ', played ' + Math.round(state.playTime / 60) + ' min, tab ' + state.tab + ', season ' + S.season + ', day ' + state.dayPhase.toFixed(2),
    'Performance: frame ' + Math.round(perf.ema * 1000) + ' ms (' + Math.round(1 / perf.ema) + ' fps), eco ' + on(S.eco) + (perf.auto ? ' (auto)' : ''),
    'Settings: animations ' + on(S.animations) + ', clouds ' + on(S.clouds) + ', birds ' + on(S.birds) + ', rain ' + on(S.rain) + ', big text ' + on(S.bigText),
    'Storage: ' + (storageOk ? 'ok' : 'FAILED') + ', second copy ' + (hadBak || lastBakAt ? 'yes' : 'no') + (restoredFromBak ? ', RESTORED from second copy' : '') + ', last export ' + (state.lastExport ? new Date(state.lastExport).toISOString().slice(0, 10) : 'never'),
    'Errors (' + errLog.length + '):'
  ];
  if (!errLog.length) L.push('  none');
  errLog.forEach(e => L.push('  [' + e.at + '] ' + e.kind + ': ' + e.msg + (e.src ? ' @ ' + e.src + ':' + e.line + ':' + e.col : '') + (e.stack ? '\n    ' + e.stack : '')));
  return L.join('\n');
}
function copyText(text, box, okKey) {
  const done = () => showToast(t(okKey), 'good');
  const manual = () => {
    box.hidden = false; box.value = text; box.focus(); box.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* нічого */ }
    if (ok) done(); else showToast(t('reportManual'), 'good');
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, manual); else manual();
}

let hiddenAt = 0;

function init() {
  const hadSave = loadGame();
  const awaySeconds = hadSave && state.savedAt > 0 ? (Date.now() - state.savedAt) / 1000 : 0;
  if (!translations[state.lang]) state.lang = detectLanguage();
  if (!TABS.some(x => x.id === state.tab)) state.tab = 'shop';
  recalcIncome();

  // графіка
  skyLayer = buildSkyLayer();
  groundLayer = buildGroundLayer();
  rebuildShop(true);
  refreshCoinIcon();
  drawCapiPortrait();

  // інтерфейс
  buildTabs();
  buildBuyModes();
  buildDeptCards();
  buildTeamCards();
  setupProgression();
  syncActors();
  syncGuests();
  showTab(state.tab);
  applyTranslations();
  updateSaveWarning();
  setupInput();
  applyPanel();                           // згортає або розгортає меню й розставляє сцену (layoutScene)
  collapseOnLandscapePhone();
  if (landscapePhoneMQ.addEventListener) landscapePhoneMQ.addEventListener('change', collapseOnLandscapePhone);
  if (mobileMQ.matches && !state.settings.panHintSeen) { state.settings.panHintSeen = true; showToast(t('panHint'), 'good'); }

  // масштаб і шрифт
  if (typeof ResizeObserver !== 'undefined') { new ResizeObserver(layoutScene).observe(ui.stage); if (ui.panel) new ResizeObserver(() => { if (mobileMQ.matches) layoutScene(); }).observe(ui.panel); }
  window.addEventListener('resize', layoutScene);
  if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', layoutScene);
  if (document.fonts) {
    document.fonts.ready.then(fitSign);
    document.fonts.addEventListener('loadingdone', fitSign);
  }

  // збереження при закритті / згортанні сторінки; повернення на вкладку = офлайн-заробіток
  window.addEventListener('beforeunload', saveGame);
  window.addEventListener('pagehide', saveGame);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      saveGame();
    } else {
      lastFrame = performance.now();
      if (hiddenAt) { addOfflineEarnings((Date.now() - hiddenAt) / 1000); hiddenAt = 0; }
    }
  });

  setupSound();
  initEvents();
  recalcIncome();
  addOfflineEarnings(awaySeconds);
  showOfflineModal();     // якщо з минулого разу лишилися незабрані монетки
  lastBakAt = hadBak ? Date.now() : 0;                                  // існуючу копію не перезаписуємо одразу після запуску
  if (restoredFromBak) setTimeout(() => showToast(t('restoredBak'), 'bad'), 1200);
  setTimeout(checkExportNag, 40000);
  if (!hadSave) saveGame();
  requestAnimationFrame(t0 => { lastFrame = t0; requestAnimationFrame(frame); });
}

// Телефонна обгортка: пауза/збереження у фоні, кнопка «Назад»
function setupNativeApp() {
  const A = nativePlugin('App'); if (!A) return;
  try {
    A.addListener('appStateChange', s => { if (!s.isActive) { saveGame(); try { audio.ctx && audio.ctx.suspend(); } catch (e) { /* нічого */ } } else resumeAudio(); });
    A.addListener('backButton', () => {
      const open = [...document.querySelectorAll("[id$=Modal], #modal")].find(m => !m.hidden);
      const close = open && open.querySelector('[id$=Close], [id$=close], .modal-close');
      if (close) close.click(); else if (open) open.hidden = true; else A.minimizeApp();
    });
  } catch (e) { /* нічого */ }
}
// Якщо в обгортці localStorage порожній (його стерла система), а копія в застосунку є — відновлюємо її перед стартом
function startGame() { init(); bootDone(); setupNativeApp(); }
(function () {
  const P = nativePlugin('Preferences');
  let has = true; try { has = !!localStorage.getItem(CONFIG.SAVE_KEY); } catch (e) { /* нічого */ }
  if (!P || has) { startGame(); return; }
  Promise.race([P.get({ key: CONFIG.SAVE_KEY }), new Promise(r => setTimeout(() => r(null), 2500))]).then(r => {
    try { if (r && r.value) localStorage.setItem(CONFIG.SAVE_KEY, r.value); } catch (e) { /* нічого */ }
  }).catch(() => {}).then(startGame);
})();
</script>
</body>
</html>
