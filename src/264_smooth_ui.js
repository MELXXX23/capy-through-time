//#part 264_smooth_ui.js
/* Плавне закриття вікон [id$="Modal"]: коли гра ховає вікно (hidden), поверх лишається його «привид»-копія,
   що тане за 0,2 с. Справжнє вікно ховається одразу, стан гри не змінюється (р. 71). */
(function smoothModals() {
  if (typeof MutationObserver === 'undefined') return;
  const reduce = () => (typeof animOn === 'function' && !animOn()) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function ghost(m) {
    try {
      if (reduce() || !m.isConnected) return;
      const g = m.cloneNode(true); g.hidden = false; g.classList.add('fxGhost'); g.setAttribute('aria-hidden', 'true');
      g.querySelectorAll('canvas').forEach((cv, i) => { const src = m.querySelectorAll('canvas')[i]; try { cv.getContext('2d').drawImage(src, 0, 0); } catch (e) { /* нічого */ } });
      document.body.appendChild(g);
      setTimeout(() => { if (g.parentNode) g.parentNode.removeChild(g); }, 260);
    } catch (e) { /* нічого */ }
  }
  const mo = new MutationObserver(list => {
    for (const r of list) {
      const m = r.target;
      if (!m || !m.id || !/Modal$/.test(m.id) || m.classList.contains('fxGhost')) continue;
      if (m.hidden && r.oldValue === null) ghost(m);                       // було видно → сховали
    }
  });
  function arm() { document.querySelectorAll('[id$="Modal"]').forEach(m => mo.observe(m, { attributes: true, attributeFilter: ['hidden'], attributeOldValue: true })); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm); else arm();
})();
