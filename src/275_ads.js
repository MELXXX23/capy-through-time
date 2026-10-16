//#part 275_ads.js
/* =====================================================================
   РЕКЛАМА (AdMob) — лише в Android-обгортці й лише нагороджений ролик за бажанням гравця.
   Увімкнено, тільки коли mobile/sync-web.js вставив window.__ADS (у game.html, на сайті, в exe — нічого не робить).
   Гра для всіх віків → усі гравці вважаються дитячою аудиторією (child-directed, рейтинг G, без персоналізації).
   Збій реклами ніколи не блокує гру: кнопка просто не з'являється. Лічильники — окремий ключ localStorage (збереження гри не чіпаємо).
   ===================================================================== */
const Ads = (() => {
  const CFG = (typeof window !== 'undefined' && window.__ADS) || null;
  const KEY = 'capyAdsDaily';
  const MAX_DAY = 5;               // роликів на добу
  const GAP_MS = 60000;            // мінімальна пауза між роликами
  let plugin = null, ready = false, loaded = false, busy = false, lastEndAt = 0, retry = 0, retryTimer = 0;

  const dayKey = () => new Date().toISOString().slice(0, 10);
  function daily() {
    try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); if (o.d === dayKey()) return o; } catch (e) { /* нічого */ }
    return { d: dayKey(), n: 0, last: 0 };
  }
  function bump() { const o = daily(); o.n++; o.last = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* нічого */ } }
  function opts() { return { adId: CFG.rewardedId, isTesting: !!CFG.testing, npa: true }; }

  function preload() {
    if (!ready || loaded || busy) return;
    plugin.prepareRewardVideoAd(opts()).then(() => { loaded = true; retry = 0; updateAdButtons(); })
      .catch(() => { loaded = false; if (retry < 5) { clearTimeout(retryTimer); retryTimer = setTimeout(preload, 30000 * Math.pow(2, retry++)); } });
  }

  async function init() {
    if (!CFG || !CFG.rewardedId || ready) return;
    try {
      if (typeof nativeApp !== 'function' || !nativeApp()) return;
      plugin = nativePlugin('AdMob'); if (!plugin) return;
      let canRequest = true;
      try {                                                        // згода Google (UMP): форму покаже сама, якщо це потрібно в регіоні
        let ci = await plugin.requestConsentInfo({ tagForUnderAgeOfConsent: true });
        if (ci && ci.isConsentFormAvailable && ci.status === 'REQUIRED') ci = await plugin.showConsentForm();
        if (ci && ci.canRequestAds === false) canRequest = false;
      } catch (e) { /* без згоди (збій) — реклама тихіша, але гра працює */ canRequest = false; }
      if (!canRequest) return;
      await plugin.initialize({
        initializeForTesting: !!CFG.testing, tagForChildDirectedTreatment: true, tagForUnderAgeOfConsent: true, maxAdContentRating: 'General',
      });
      ready = true;
      preload();
    } catch (e) { ready = false; }
  }

  // Можна пропонувати ролик саме зараз?
  function available() {
    if (!ready || !loaded || busy) return false;
    const d = daily();
    return d.n < MAX_DAY && Date.now() - d.last > GAP_MS;
  }
  // Щойно закрився ролик (щоб повернення з реклами не рахувати «офлайном»)
  function justShown() { return busy || Date.now() - lastEndAt < 8000; }

  // Показує ролик. Повертає Promise<true>, лише якщо гравець дивився до нагороди; інакше false.
  async function showRewarded() {
    if (!available()) return false;
    busy = true; loaded = false;
    let rewarded = false, dismissed = null;
    const wait = new Promise(res => { dismissed = res; });
    let h = null;
    try { h = await plugin.addListener('onRewardedVideoAdDismissed', () => dismissed()); } catch (e) { /* нічого */ }
    try {
      await plugin.showRewardVideoAd();
      rewarded = true;
      await Promise.race([wait, new Promise(res => setTimeout(res, 5000))]);
    } catch (e) { rewarded = false; }
    try { if (h && h.remove) await h.remove(); } catch (e) { /* нічого */ }
    busy = false; lastEndAt = Date.now();
    if (rewarded) bump();
    preload(); updateAdButtons();
    return rewarded;
  }

  return { init, available, showRewarded, justShown, enabled: () => !!CFG };
})();

// ---------- Місця, де пропонуємо ролик (кнопки з'являються лише коли Ads.available()) ----------
function adsLog(e) { try { if (typeof logErr === 'function') logErr('ads', String(e && e.message || e), '', 0, 0); } catch (x) { /* нічого */ } }

// 1) Вікно «З поверненням!»: ×2 непозбраних монет
let adOfflineDone = false;
function updateAdButtons() {
  try {
    const btn = document.getElementById('adOfflineBtn');
    const show = Ads.available() && ui.modal && !ui.modal.hidden && state.pendingOffline >= 1 && !adOfflineDone && ui.modalBtn.id === 'modalBtn';
    if (btn) btn.hidden = !show;
    if (typeof uiCache !== 'undefined') uiCache.boostSig = null;      // чіп «×2 за ролик» у смужці перемалюється
  } catch (e) { adsLog(e); }
}
function adsOfferOffline() {                                          // викликає showOfflineModal
  try {
    if (!Ads.enabled()) return;
    let btn = document.getElementById('adOfflineBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button'; btn.id = 'adOfflineBtn'; btn.className = 'btn wide'; btn.hidden = true;
      ui.modalBtn.parentNode.insertBefore(btn, ui.modalBtn);
      btn.addEventListener('click', () => {
        btn.hidden = true;
        Ads.showRewarded().then(ok => {
          if (!ok) { updateAdButtons(); return; }
          state.pendingOffline *= 2; adOfflineDone = true;
          refreshOfflineModal(); saveGame();
        }).catch(adsLog);
      });
    }
    adOfflineDone = false;
    btn.textContent = t('adOfflineBtn');
    updateAdButtons();
  } catch (e) { adsLog(e); }
}

// 3) Чіп «×2 прибуток 10 хв» у смужці під рахунком (малює updateBoostsUI, коли Ads.available() і підсилення ще нема)
function adsBoostClick() {
  Ads.showRewarded().then(ok => {
    if (!ok) { updateAdButtons(); return; }
    state.events.incomeBoostUntil = Date.now() + 10 * 60000; state.events.incomeBoostMult = 2;
    recalcIncome(); saveGame(); updateBoostsUI(); showToast(t('prize_income', 2, 10));
  }).catch(adsLog);
}

// 2) Очікування бонус-гри: «пропустити очікування за ролик» (не частіше за саму перезарядку, бо після пропуску вона починається знову)
function adsOfferBonusSkip(def, waitMs) {                                      // повертає true, якщо показали пропозицію (тоді openBonus нічого більше не робить)
  try {
    if (!Ads.available()) return false;
    askConfirm(t('adBonusTitle'), t('adBonusText', fmtTime(waitMs / 1000)), t('adBonusYes'), () => {
      Ads.showRewarded().then(ok => {
        if (!ok) return;
        const past = Date.now() - bonusCooldownMs() - 1000;           // «виграш був давно» → очікування 0
        state.wheel.mg = (state.wheel.mg || []).map(v => (v ? Math.min(v, past) : v));
        saveGame(); openBonus(def);
      }).catch(adsLog);
    });
    return true;
  } catch (e) { adsLog(e); return false; }
}

setTimeout(() => { try { Ads.init(); } catch (e) { adsLog(e); } }, 4000);   // після запуску гри, щоб форма згоди не лізла на першому кадрі
