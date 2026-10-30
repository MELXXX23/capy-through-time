//#part 263_build_cinema.js
/* =====================================================================
   БУДУВАННЯ: кінематографічний шар поверх анімації (плашка з прогресом, спалах,
   картка «Новий рівень», смуга світла по новому магазину) + стрілка «можна прокачати».
   Сцену й героїв не чіпає: startBuild / updateBuild / finishBuild (180_a) лише викликають ці функції.
   Написи завжди по центру ВИДИМОЇ гри (ui.view): меню збоку не накривають, а коли меню закрите — на весь екран.
   ===================================================================== */
Object.assign(translations.uk, { bcBuilding: 'БУДУЄМО', bcNewLevel: 'НОВИЙ РІВЕНЬ', bcStep: '{0} з {1}' });
Object.assign(translations.en, { bcBuilding: 'BUILDING', bcNewLevel: 'NEW LEVEL', bcStep: '{0} of {1}' });

const bc = { root: null, label: null, name: null, bar: null, flash: null, card: null, ring: null, cardT: 0, hideT: 0, flashed: false, carded: false, box: '' };
let bcSweepCv = null;

function bcMake() {
  if (bc.root) return;
  const mk = (cls, parent) => { const d = document.createElement('div'); d.className = cls; (parent || document.body).appendChild(d); return d; };
  bc.root = mk('bc-banner'); bc.root.setAttribute('aria-hidden', 'true');
  bc.label = mk('bc-label', bc.root); bc.name = mk('bc-name', bc.root);
  bc.bar = mk('bc-fill', mk('bc-track', bc.root));
  bc.flash = mk('bc-flash'); bc.ring = mk('bc-ring'); bc.card = mk('bc-card'); bc.card.setAttribute('aria-hidden', 'true');
}

// Ставить усе по центру видимої сцени; викликається щокадру, але чіпає DOM лише коли розмір/місце змінилися (меню відкрили/закрили, поворот)
function bcPlace() {
  const r = ui.view.getBoundingClientRect(), key = [r.left, r.top, r.width, r.height].map(Math.round).join();
  if (key === bc.box) return;
  bc.box = key;
  const cx = Math.round(r.left + r.width / 2) + 'px', s = Math.max(0.75, Math.min(1.4, Math.min(r.width / 640, r.height / 460)));
  bc.root.style.left = cx; bc.root.style.top = Math.round(r.top + r.height * 0.15) + 'px';
  bc.card.style.left = cx; bc.card.style.top = Math.round(r.top + r.height * 0.3) + 'px';
  bc.ring.style.left = cx; bc.ring.style.top = Math.round(r.top + r.height * 0.4) + 'px';
  Object.assign(bc.flash.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', inset: 'auto' });
  [bc.root, bc.card, bc.ring].forEach(e => e.style.setProperty('--bcs', s.toFixed(2)));
}
function buildCinemaStart() {
  if (!animOn()) return;
  bcMake(); bc.box = ''; bcPlace();
  clearTimeout(bc.hideT); clearTimeout(bc.cardT);
  bc.flashed = bc.carded = false;
  bc.label.textContent = t('bcBuilding') + ' · ' + t('bcStep', state.shopLevel, 6);
  bc.name.textContent = t('levelName_' + state.shopLevel);
  bc.bar.style.width = '0%';
  bc.card.classList.remove('on'); bc.root.classList.remove('done', 'out');
  restartAnim(bc.root, 'in');
}

function buildCinemaTick(p) {
  if (!bc.root || bc.root.classList.contains('out')) return;
  const now = performance.now(); if (!(now - bc.placeT < 500)) { bc.placeT = now; bcPlace(); }      // розміри сцени міряємо двічі на секунду, а не щокадру (вимір змушував перераховувати сторінку)
  bc.bar.style.width = Math.min(100, p * 100).toFixed(1) + '%';
  if (!bc.flashed && p >= BUILD_C + 0.02) {                       // шатро знімається: теплий спалах і ударна хвиля
    bc.flashed = true; bc.root.classList.add('done'); restartAnim(bc.flash, 'on'); restartAnim(bc.ring, 'on');
  }
  if (!bc.carded && p >= BUILD_C + 0.08) {                        // картка нового рівня з променями й іскрами
    bc.carded = true;
    let sp = '';
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2 + Math.random() * 0.3, d = 120 + Math.random() * 150;
      sp += '<u style="--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d * 0.7) + 'px;--dl:' + (Math.random() * 0.25).toFixed(2) + 's"></u>';
    }
    bc.card.innerHTML = '<i></i>' + sp + '<em>★ ★ ★</em><b>' + t('bcNewLevel') + '</b><span>' + t('levelName_' + state.shopLevel) + '</span><small>' + state.shopLevel + ' / 6</small>';
    restartAnim(bc.card, 'on');
    bc.cardT = setTimeout(() => bc.card.classList.remove('on'), 3400);
  }
}

function buildCinemaEnd() {
  if (!bc.root) return;
  bc.bar.style.width = '100%';
  clearTimeout(bc.hideT);
  bc.hideT = setTimeout(() => { bc.root.classList.add('out'); }, 450);
}

// Смуга світла, що пробігає по новому магазину, коли шатро знято (u: 0…1)
function drawBuildSweep(u) {
  if (!animOn() || u <= 0 || u >= 1) return;
  const w = shop.w, h = shop.h;
  if (!bcSweepCv) bcSweepCv = document.createElement('canvas');
  const c = bcSweepCv; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const g = c.getContext('2d');
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  const x = Math.round(-18 + (w + 36) * u);
  const gr = g.createLinearGradient(x - 14, h * 0.7, x + 14, h * 0.7 - 14);
  gr.addColorStop(0, 'rgba(255,250,210,0)'); gr.addColorStop(0.5, 'rgba(255,252,225,.7)'); gr.addColorStop(1, 'rgba(255,250,210,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(shop.canvas, 0, 0);       // світло лише на пікселях будівлі
  ctx.drawImage(c, shop.x, shop.y);
}

/* ---------- Стрілка «можна прокачати маркет» ---------- */
const UP_ARROW = [[4, 0, 1], [3, 1, 3], [2, 2, 5], [1, 3, 7], [0, 4, 9], [3, 5, 3], [3, 6, 3], [3, 7, 3], [3, 8, 3]];       // [x, y, ширина] рядків
function canUpgradeShop() {
  if (!shop || build || buildPreview) return false;
  const next = nextLevelDef();
  return !!next && requirementsMet(next) && state.coins >= expandCost(next);
}
// Малюється в координатах сцени, зверху зліва від магазину; м'яко підстрибує (піксель ×2, щоб не губилась на тлі будинків)
function drawUpgradeArrow() {
  if (!canUpgradeShop()) return;
  const T = performance.now() / 1000, on = animOn(), S = 2;
  const bob = on ? Math.round(Math.abs(Math.sin(T * 5)) * 5) : 0, x = Math.round(shop.x + 2), y = Math.round(shop.y - 30 - bob);
  ctx.save();
  if (on) {                                                    // ореол під стрілкою пульсує
    ctx.globalAlpha = 0.28 + 0.18 * Math.sin(T * 5); ctx.fillStyle = '#b4ff98';
    ctx.fillRect(x - 3, y + 3, 9 * S + 6, 9 * S + 3); ctx.globalAlpha = 0.14; ctx.fillRect(x - 6, y, 9 * S + 12, 9 * S + 9);
  }
  ctx.globalAlpha = 1;
  const paint = (col, dx, dy) => { ctx.fillStyle = col; UP_ARROW.forEach(r => ctx.fillRect(x + r[0] * S + dx, y + r[1] * S + dy, r[2] * S, S)); };
  [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]].forEach(o => paint('#fff6d0', o[0] * 2, o[1] * 2));   // світлий край
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(o => paint('#1f3a24', o[0], o[1]));                                                  // темний контур
  paint('#3fcf55', 0, 0);
  ctx.fillStyle = '#c4ffa8'; UP_ARROW.forEach(r => ctx.fillRect(x + r[0] * S, y + r[1] * S, S, S));                               // світлий лівий край
  ctx.restore();
}
