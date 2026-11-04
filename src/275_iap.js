//#part 275_iap.js
/* =====================================================================
   ОПЛАТИ Google Play — лише в Android-обгортці.
   Увімкнено, тільки коли mobile/sync-web.js вставив window.__IAP (є файл mobile/iap.json).
   На сайті, в itch і в exe нічого не робить: платні скіни там не показуються.
   Що продається — SKIN_PAID (230_a1). Куплене зберігається в Google, тут лише копія на випадок без мережі;
   у збереження й у код збереження покупки НЕ пишемо, інакше кодом можна було б ділитися.
   Деталі й кроки власника гри: store/PLAY_PAYMENTS.md.
   ===================================================================== */
const Iap = (() => {
  const CFG = (typeof window !== 'undefined' && window.__IAP) || null;
  let plugin = null, prices = {}, busy = false;

  function dropNotOwned() {                                         // повернули гроші: купленого скіна більше нема, знімаємо його
    SKIN_TYPES.forEach(ty => { const i = state.skins[ty]; if (i >= 0 && SKIN_PAID[SKIN_POOL[i]] && !skinOwned(i)) setSkin(ty, ty === 'capy' ? -2 : -1); });
  }
  function apply(list) {
    const was = [...iapOwned].sort().join();
    iapOwned = new Set(list); iapKeep();
    if ([...iapOwned].sort().join() !== was) { dropNotOwned(); skinsSig = ''; try { updateUI(); } catch (e) { /* ще не готово */ } }
  }
  async function refresh() {
    if (!plugin) return false;
    try { const r = await plugin.owned(); apply(r.owned || []); return true; } catch (e) { return false; }    // без мережі лишається остання копія
  }
  async function loadPrices() {
    const ids = (CFG && CFG.products) || [...new Set(Object.values(SKIN_PAID))];
    if (!plugin || !ids.length) return;
    try { const r = await plugin.getProducts({ products: ids }); (r.products || []).forEach(p => { prices[p.id] = p.price; }); skinsSig = ''; } catch (e) { /* покажемо ціну пізніше */ }
  }
  async function buy(pid, type, i) {
    if (busy) return;
    busy = true;
    try {
      const r = await plugin.buy({ product: pid });
      if (r.status === 'ok' || r.status === 'owned') {
        apply([...iapOwned, pid]);
        showToast(t('iapThanks'), 'good');
        if (skinOwned(i)) equipSkin(type, i);
        updateUI();
      } else if (r.status === 'pending') showToast(t('iapPending'), 'good');
      else if (r.status !== 'cancelled') showToast(t('iapFail'), 'bad');
    } catch (e) { showToast(t('iapFail'), 'bad'); }
    busy = false;
  }
  function offer(type, i) {
    const pid = SKIN_PAID[SKIN_POOL[i]];
    if (!plugin || !pid) { showToast(t('iapFail'), 'bad'); return; }
    if (!prices[pid]) { loadPrices(); showToast(t('iapNoPrice'), 'bad'); return; }
    askConfirm(t('iapBuyTitle'), t('iapBuyText', skinName(i), prices[pid]), t('iapBuyYes'), () => buy(pid, type, i));
  }
  function priceLabel(skinId) { return prices[SKIN_PAID[skinId]] || t('iapBuyYes'); }
  async function restore() {
    const ok = await refresh();
    showToast(t(ok ? (iapOwned.size ? 'iapRestored' : 'iapNothing') : 'iapFail'), ok ? 'good' : 'bad');
  }
  async function init(testPlugin) {                                 // testPlugin — лише для автотесту
    if (plugin) return;
    plugin = testPlugin || (CFG ? nativePlugin('CapyBilling') : null);
    if (!plugin) return;
    const btn = document.getElementById('iapRestoreBtn');
    if (btn) { btn.hidden = false; btn.onclick = restore; }
    if (plugin.addListener) { try { plugin.addListener('changed', refresh); } catch (e) { /* нічого */ } }
    await Promise.all([refresh(), loadPrices()]);
    try { updateUI(); } catch (e) { /* ще не готово */ }
  }
  function testReset() { plugin = null; prices = {}; busy = false; const btn = document.getElementById('iapRestoreBtn'); if (btn) btn.hidden = true; }
  return { init, offer, restore, refresh, priceLabel, testReset, on: () => !!plugin, active: !!CFG };
})();
if (!Iap.active) Object.keys(SKIN_PAID).forEach(id => { if (!SKIN_HIDDEN.includes(id)) SKIN_HIDDEN.push(id); });   // без оплат платних скінів не видно
if (Iap.active) setTimeout(() => { try { Iap.init(); } catch (e) { /* гра працює й без оплат */ } }, 3000);
