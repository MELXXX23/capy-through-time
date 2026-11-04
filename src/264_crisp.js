//#part 264_crisp.js
/* Чіткість (р. 78). Шрифт Press Start 2P намальований на сітці 8×8: він чіткий, лише коли його «піксель» (1/8 розміру) лягає на цілі пікселі екрана.
   На звичайних екранах ПК (щільність < 1,75) підбираємо найближчий чіткий розмір прямо в правилах CSS (11 і 13 px → 12, 15 і 18 → 16, 26 → 24).
   Телефони не чіпаємо: там пікселі дрібні, а розкладки затверджені. */
const crispFontRules = [];
function crispFontSize(px, dpr) {
  const cells = [1, 1.5, 2, 3, 4, 5, 6, 7, 8];
  let best = px, cost = 1e9;
  for (const c of cells) {
    const s = c * 8 / dpr;
    if (s < px * 0.85) continue;                                  // не робимо текст помітно дрібнішим: читати важливіше
    const d = Math.abs(s - px) / px + (c % 1 ? 0.1 : 0);
    if (d < cost) { cost = d; best = s; }
  }
  return +best.toFixed(3);
}
function crispCollectRules(list) {
  for (const r of list) {
    if (r.cssRules && r.media) crispCollectRules(r.cssRules);
    else if (r.style && /^[\d.]+px$/.test(r.style.fontSize)) crispFontRules.push({ r, px: parseFloat(r.style.fontSize), imp: r.style.getPropertyPriority('font-size') });
  }
}
function crispFonts() {
  if (!crispFontRules.length) for (const sh of document.styleSheets) { try { crispCollectRules(sh.cssRules); } catch (e) { /* чужий стиль (Google Fonts) */ } }
  const dpr = window.devicePixelRatio || 1, on = dpr < 1.75 && !matchMedia('(max-width: 820px) and (orientation: portrait), (max-width: 560px), (max-height: 599px)').matches;
  crispFontRules.forEach(o => { o.r.style.setProperty('font-size', (on ? crispFontSize(o.px, dpr) : o.px) + 'px', o.imp); });
}
// Полотно у вікні: ширину дає CSS (скільки вміщається), а ми беремо найбільший цілий масштаб, що не більший за неї.
// На щільних екранах телефонів зменшуємо лише якщо втрата менша за 10% (там нерівність пікселів майже не видно, а гра не має дрібнішати).
function pxFit(cv) {
  if (!cv || !cv.width) return;
  cv.style.width = ''; cv.style.height = '';
  const dpr = window.devicePixelRatio || 1, avail = cv.clientWidth;
  if (!avail) return;
  const s = avail * dpr / cv.width, n = s - Math.floor(s) > 0.9 ? Math.ceil(s) : Math.floor(s + 0.02);       // майже наступне ціле (×3,91): беремо його, це +2%
  if (n < 1 || (dpr >= 2 && (s - n) / s > 0.1)) return;
  cv.style.width = (n * cv.width / dpr) + 'px'; cv.style.height = (n * cv.height / dpr) + 'px';
}
let crispSig = '';
function crispSync() {
  const sig = (window.devicePixelRatio || 1) + '|' + (innerWidth > 820 && innerHeight >= 600);
  if (sig === crispSig) return;
  crispSig = sig;
  document.documentElement.style.setProperty('--dpr', window.devicePixelRatio || 1);
  [8, 12, 16, 24].forEach(n => document.documentElement.style.setProperty('--f' + n, crispFontSize(n, window.devicePixelRatio || 1) + 'px'));
  crispFonts();
}
crispSync();
window.addEventListener('resize', () => { crispSync(); if (ui.circusModal && !ui.circusModal.hidden) pxFit(ui.circusWheel); });
