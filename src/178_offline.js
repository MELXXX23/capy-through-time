//#part 178_offline.js
/* =====================================================================
   ОФЛАЙН-ЗАРОБІТОК
   ===================================================================== */

// Рахує, скільки магазин заробив за seconds секунд відсутності, і кладе в «непозбране»
function addOfflineEarnings(seconds) {
  if (!(seconds >= CONFIG.OFFLINE_MIN_SECONDS) || state.cps <= 0) return;
  const capped = Math.min(seconds, offlineMaxHours() * 3600);
  const earned = state.cps * capped * offlineRate();
  if (earned >= 1) {
    state.pendingOffline += earned;
    showOfflineModal();
  }
}
function refreshOfflineModal() {
  ui.modalBig.textContent = t('offlineCoins', fmt(Math.floor(state.pendingOffline)));
}
function showOfflineModal() {
  if (state.pendingOffline < 1) return;
  ui.modalTitle.textContent = t('offlineTitle');
  ui.modalText.textContent = t('offlineText');
  ui.modalBtn.textContent = t('offlineBtn');
  refreshOfflineModal();
  ui.modal.hidden = false;
  ui.modalBtn.focus({ preventScroll: true });
}
function claimOffline() {
  const gain = state.pendingOffline;
  state.coins += gain;
  state.totalEarned += gain;
  state.pendingOffline = 0;
  playSfx('coins');
  ui.modal.hidden = true;
  updateUI();
  saveGame();
}

