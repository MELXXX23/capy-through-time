//#part 275_z_itch_rate.js
/* =====================================================================
   «Оціни на itch.io» — лише у веб-версії на itch.io (її видно за доменом iframe; для перевірки — ?itch=1).
   У Android-обгортці, Steam, на сайті й у PWA кнопки немає (дитяча аудиторія: зовнішні заклики до оцінки там недоречні).
   Кнопка в налаштуваннях під «Політикою конфіденційності»; один раз за ~10 хв гри — тихий тост-підказка (прапорець у localStorage).
   ===================================================================== */
const ITCH_PAGE = 'https://melxxxnika.itch.io/capytap-market';
function onItchBuild() {
  try { return /(^|\.)itch\.(io|zone)$/.test(location.hostname) || /[?&]itch=1/.test(location.search); } catch (e) { return false; }
}
translations.uk.itchRateBtn = '⭐ Оціни гру на itch.io';
translations.en.itchRateBtn = '⭐ Rate the game on itch.io';
translations.uk.itchRateHint = 'Подобається гра? Постав оцінку на itch.io: меню → Налаштування.';
translations.en.itchRateHint = 'Enjoying the game? Rate it on itch.io: menu → Settings.';
(function itchRateInit() {
  if (!onItchBuild() || !ui.privacyBtn) return;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.id = 'itchRateBtn'; btn.className = 'btn wide'; btn.setAttribute('data-i18n', 'itchRateBtn');
  btn.textContent = t('itchRateBtn');
  ui.privacyBtn.parentNode.insertBefore(btn, ui.privacyBtn);
  btn.addEventListener('click', () => { window.open(ITCH_PAGE, '_blank', 'noopener'); });
  let asked = false, seen = 0;
  try { asked = localStorage.getItem('capyItchRateHint') === '1'; } catch (e) { asked = false; }
  if (asked) return;
  const iv = setInterval(() => {                                    // лише хвилини, коли вкладка видима
    if (document.hidden) return;
    if (++seen < 600) return;
    clearInterval(iv);
    try { localStorage.setItem('capyItchRateHint', '1'); } catch (e) { /* нічого */ }
    try { showToast(t('itchRateHint')); } catch (e) { /* нічого */ }
  }, 1000);
})();
