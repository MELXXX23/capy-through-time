//#part 165_shop.js
/* =====================================================================
   МАГАЗИН: побудова, вивіска, масштаб сцени
   ===================================================================== */

// Перебудовує спрайт магазину, якщо змінився рівень або наповненість вітрин
function rebuildShop(force) {
  const tiers = state.depts.map(tierOf);
  const sig = state.shopLevel + '|' + tiers.slice(0, state.shopLevel * 2).join('') + '|' + seasonNow() + '|' + (viewEpoch() % EPOCH_SHOP.length) + '|' + (skinOn('shop') || '');
  if (!force && shop && shop.sig === sig) return false;
  const levelChanged = !shop || shop.level !== state.shopLevel;
  if (levelChanged && shop) ejectInside();
  const geo = buildShopCanvas(state.shopLevel, tiers);
  shop = Object.assign(geo, {
    sig, level: state.shopLevel, doorOpen: shop ? (shop.doorOpen || 0) : 0,
    x: Math.round(LAYOUT.centerX - geo.w / 2),
    y: LAYOUT.curbY - geo.h
  });
  if (levelChanged) {
    if (layoutReady) { groundLayer = buildGroundLayer(); seedBenches(); }       // ліхтарі зсунулись — вікна будинків, дерева й лавки теж
    propsLayer = buildPropsLayer();
    placeShopOverlay();
    updateSignText();
  }
  return levelChanged;
}

// Розміщує HTML-вивіску поверх спрайта магазину (у відсотках — не залежить від масштабу)
function placeShopOverlay() {
  const o = ui.shopOverlay.style;
  o.left = pctX(shop.x) + '%';
  o.top = pctY(shop.y) + '%';
  o.width = (shop.w / view.w * 100) + '%';
  o.height = (shop.h / view.h * 100) + '%';
  const sg = ui.sign.style;
  const SIGN_PAD = 12;                                           // з боків вивіски стоять прикраси епохи (щити, кулі, прибульці…) — текст їх не чіпає
  sg.left = ((shop.sign.x + SIGN_PAD) / shop.w * 100) + '%';
  sg.top = (shop.sign.y / shop.h * 100) + '%';
  sg.width = ((shop.sign.w - SIGN_PAD * 2) / shop.w * 100) + '%';
  sg.height = (shop.sign.h / shop.h * 100) + '%';
}

function updateSignText() {
  ui.signText.textContent = t('sign_' + state.shopLevel);
  fitSign();
}

// Підбирає найбільший цілий множник, щоб пікселі лишалися чіткими.
// ПК: сцена на весь вільний простір — на широкому екрані додаються будинки, ліхтарі й бруківка з боків, а на високому — небо зверху.
// Телефон: сцена «наближена» до магазину (так вивіска читається), а вся вулиця ширша за екран — її можна гортати пальцем.
const cam = { pan: 0, goal: 0 };                // зсув камери на телефоні (пікселів сцени) відносно центру вулиці
let layoutReady = false;
// Телефон: сцена закінчується рівно над меню (одна смужка іконок, дві смужки, чи з відкритою вкладкою), нічого не залазить на дорогу й цирк
function syncPanelPad() {
  if (!mobileMQ.matches || !ui.panel) { if (ui.stage.style.paddingBottom) ui.stage.style.paddingBottom = ''; return; }
  const r = ui.panel.getBoundingClientRect(); if (!r.height) return;
  const need = Math.ceil(window.innerHeight - r.top) + 4;
  if (Math.abs((parseFloat(ui.stage.style.paddingBottom) || 0) - need) > 1) ui.stage.style.paddingBottom = need + 'px';
}
function snapK(k) { const r = Math.round(k); return (r >= 1 && Math.abs(k - r) < 0.13) ? r : k; }       // масштаб ціле число, якщо майже ціле (чіткі пікселі), інакше дробовий: картинка завжди на всю ширину
function layoutScene() {
  syncPanelPad();
  const W0 = CONFIG.SCENE_W, H0 = CONFIG.SCENE_H;
  const dpr = window.devicePixelRatio || 1;
  const mobile = mobileMQ.matches;
  const cs = getComputedStyle(ui.stage);
  const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const availW = ui.stage.clientWidth - padX;
  // на телефоні з відкритим меню сцена займає не більше ~44% висоти, решту віддаємо панелі
  const availH = ui.stage.clientHeight - padY;
  const pcOpen = !mobile && state.settings.panelOpen;
  const EB = mobile ? (ui.app.classList.contains('sheet-open') ? CONFIG.EXTRA_BOTTOM : 0) : CONFIG.EXTRA_BOTTOM + (pcOpen ? 16 : 0);     // додаткова бруківка знизу (на телефоні — коли відкрито меню: тоді видно більше дороги)
  const needY = shop ? Math.max(0, shop.h + 6 + (shop.level >= 6 ? CLOCK_H : 0) - LAYOUT.curbY) : 0;               // скільки неба над «ядром» потрібно високому магазину
  const skyPad = (mobile && ui.app.classList.contains('sheet-open')) ? 40 : 0;                    // телефон з відкритим меню: запас неба під верхньою панеллю (щоб годинник і дах не ховались)
  const H1 = H0 + EB + needY + skyPad;
  let k, offX, cropW, kz = 0;
  if (mobile) {
    offX = CONFIG.MOBILE_PAD;
    const want = shop ? Math.min(W0, Math.max(150, (shop.w + 40) & ~1)) : W0;      // скільки вулиці хочемо показати (малі маркети — крупніше)
    const shopH = shop ? shop.h + 6 + (shop.level >= 6 ? CLOCK_H : 0) : 120, skyFrac = ui.app.classList.contains('sheet-open') ? 0.42 : 0.5;     // над дахом лишаємо не менше ~третини екрана неба
    const kSky = availH * dpr * (1 - skyFrac) / (shopH + (H0 - LAYOUT.curbY) + EB + 30);
    const topRelM = Math.min(LAYOUT.horizonY - MAX_HOUSE_H, shop ? LAYOUT.curbY - shop.h - 6 - (shop.level >= 6 ? CLOCK_H : 0) : 999), kHouse = availH * dpr * (1 - (ui.app.classList.contains('sheet-open') ? 0.44 : 0.38)) / (H0 + EB - topRelM);       // і над найвищими будинками лишається небо (з відкритим меню — трохи більше)
    k = snapK(Math.max(1, Math.min(availW * dpr / (want * 0.9), availH * dpr / H1, kSky, kHouse)));   // можна обрізати до 10%; масштаб дробовий, щоб маркет займав усю ширину й неба було менше
    cropW = availW * dpr / k;                                                      // на всю ширину екрана, без смуг по боках
    offX = Math.max(CONFIG.MOBILE_PAD, Math.ceil((cropW - W0) / 2) + 8);
  } else {
    let kH = availH * dpr / H1;                                                      // на ПК картинка не зменшується, коли відкрито меню: магазин великий, неба мало      // меню відкрите: камера відїжджає майже вдвічі — видно набагато більше неба й дороги (не дрібніше за ~1,6 px на піксель сцени)
    const lvl = shop ? shop.level : 1, kW = shop ? availW * dpr * (lvl === 1 ? 0.46 : lvl === 2 ? 0.42 : 0.34 + 0.03 * (lvl - 1)) / shop.w : kH;       // частка ширини екрана під магазин росте з рівнем: торговий центр ~49%, нижчі рівні менші, але теж великі
    // неба над найвищим будинком чи дахом лишаємо не менше ~30% висоти кадру (для всіх епох і з відкритим меню, і з закритим); торговий центр — менше, бо він і так високий
    const topRel = Math.min(LAYOUT.horizonY - MAX_HOUSE_H, shop ? LAYOUT.curbY - shop.h - 6 - (shop.level >= 6 ? CLOCK_H : 0) : 999); let skyF = shop && shop.level >= 6 ? (pcOpen ? 0.2 : 0.1) : (pcOpen ? 0.4 : 0.28);
    if (Math.min(innerWidth, innerHeight) < 600) skyF += 0.06;                       // телефон горизонтально: ще більше неба над будинками
    const kSkyPC = availH * dpr * (1 - skyF) / (H0 + EB - topRel);
    k = snapK(Math.max(1, Math.min(availW * dpr / CONFIG.MIN_VIEW_W, kH, kW, kSkyPC) * 0.92));       // ПК: трохи менший масштаб, щоб лишалося більше неба і бруківки
    kz = k;
    const visW = Math.min(CONFIG.MAX_VIEW_W, availW * dpr / kz);                     // скільки пікселів сцени вміщується в ширину (дробове)
    offX = Math.max(0, Math.ceil((visW - W0) / 2), Math.ceil((CONFIG.WORLD_W - W0) / 2));        // вулиця завжди широка, видно лише її частину
    cropW = Math.min(W0 + 2 * offX, visW);
  }
  // Усю висоту займає сцена: зайві рядки діляться між небом зверху (більшість) і бруківкою знизу
  const unit = (kz || k) / dpr;
  const E = Math.max(0, Math.ceil(availH / unit) - H1);
  const botExtra = mobile ? Math.min(Math.round(E * 0.25), 50) : Math.min(Math.round(E * 0.15), 30);       // ПК: зайві рядки йдуть переважно в небо, а не в бруківку
  const offY = Math.min(CONFIG.MAX_OFF_Y, E - botExtra) + needY + skyPad;
  const extraB = EB + botExtra;
  const changed = !layoutReady || offX !== view.offX || offY !== view.offY || extraB !== view.extraB;
  view.offX = offX; view.offY = offY; view.extraB = extraB; view.w = W0 + 2 * offX; view.h = H0 + extraB + offY;
  if (changed) {
    layoutReady = true;
    ui.view.width = view.w; ui.view.height = view.h;
    ctx.imageSmoothingEnabled = false;
    rebuildAllLayers();
  }
  cropW = Math.min(view.w, availW / unit);
  viewCrop = { x: 0, w: cropW };
  sceneUnit = unit;
  const sceneH = Math.min(view.h * unit, availH);
  ui.scene.style.width = availW + 'px';
  ui.scene.style.height = sceneH + 'px';
  ui.world.style.marginTop = (-(view.h * unit - sceneH)) + 'px';                   // зайве небо зверху обрізається, бруківка знизу видна повністю
  ui.scene.style.setProperty('--u', sceneUnit + 'px');
  ui.scene.classList.toggle('pannable', cropW < view.w);
  ui.world.style.width = (view.w * sceneUnit) + 'px';
  ui.world.style.height = (view.h * sceneUnit) + 'px';
  applyCamera();
  if (shop) placeShopOverlay();
  fitSign();
}
// Камера: на телефоні показує частину вулиці (за замовчуванням — середину), на ПК видно все
function applyCamera() {
  const base = view.offX + (CONFIG.SCENE_W - viewCrop.w) / 2;
  const x = Math.max(0, Math.min(view.w - viewCrop.w, base + cam.pan));
  cam.pan = x - base;
  viewCrop.x = x;
  ui.world.style.marginLeft = (-x * sceneUnit) + 'px';
  if (ui.panL) { ui.panL.disabled = x <= 0.5; ui.panR.disabled = x >= view.w - viewCrop.w - 0.5; const can = viewCrop.w < view.w; ui.panL.hidden = ui.panR.hidden = !can; }
}
// Плавний рух камери до цілі (стрілки ◀ ▶, клавіші, перетягування)
function panBy(dx) {
  const base = view.offX + (CONFIG.SCENE_W - viewCrop.w) / 2, lo = -base, hi = view.w - viewCrop.w - base;
  cam.goal = Math.max(lo, Math.min(hi, cam.goal + dx));
}
let edgeT = 0;
function updateStageEdges(dt) {
  edgeT -= dt; if (edgeT > 0 || !layoutReady) return; edgeT = 0.7;
  try {
    const g = ui.view.getContext('2d'), a = g.getImageData(Math.max(0, Math.floor(view.w / 2)), 0, 1, 1).data, b = g.getImageData(Math.max(0, Math.floor(view.w / 2)), Math.max(0, view.h - 1), 1, 1).data;
    const bg = 'linear-gradient(rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ') 0 50%, rgb(' + b[0] + ',' + b[1] + ',' + b[2] + ') 50% 100%)';
    ui.stage.style.background = bg; document.documentElement.style.background = bg; document.body.style.background = bg;       // навіть під рядком стану й жестовою смужкою колір сцени
  } catch (e) { /* без цього теж працює */ }
}
function updateCamera(dt) {
  updateStageEdges(dt);
  if (Math.abs(cam.goal - cam.pan) < 0.2) { if (cam.goal !== cam.pan && !camDragging) { cam.pan = cam.goal; applyCamera(); } return; }
  if (camDragging) { cam.goal = cam.pan; return; }
  cam.pan += (cam.goal - cam.pan) * Math.min(1, dt * 9);
  applyCamera();
}
let camDragging = false;
// Перебудовує всі шари під поточний розмір полотна
function rebuildAllLayers() {
  skyLayer = buildSkyLayer();
  groundLayer = buildGroundLayer();
  if (shop) propsLayer = buildPropsLayer();
  buildSkyStars();
  seedClouds();
  seedBirds();
  seedEpochFx();
  seedBenches();
  resetEpochFx();
  resetThemeFx();
}

// Меню справа (на телефоні — внизу): стрілка згортає його, і вся гра стає на екран
function applyPanel() {
  const open = state.settings.panelOpen;
  ui.app.classList.toggle('panel-closed', !open);
  ui.panelToggle.setAttribute('aria-expanded', String(open));
  updatePanelToggle();
  layoutScene();
}
// Підпис стрілки й червона точка, якщо за згорнутим меню є що купити
function updatePanelToggle() {
  const open = state.settings.panelOpen;
  const label = t(open ? 'panelHide' : 'panelShow');
  if (uiCache.panelLabel !== label) {
    uiCache.panelLabel = label;
    ui.panelToggle.setAttribute('aria-label', label);
    ui.panelToggle.title = label;
  }
  ui.panelToggle.classList.toggle('alert', !open && (hasAffordableAction() || hasTeamAction()));
}

// Підбирає розмір шрифту, щоб напис вмістився на вивісці (в один або два рядки)
function fitSign() {
  const el = ui.sign, span = ui.signText;
  let size = 9;
  el.style.fontSize = (size * sceneUnit) + 'px';
  while (size > 3 && (span.offsetHeight > el.clientHeight * 0.92 || span.scrollWidth > el.clientWidth * 0.94)) {         // з запасом, щоб довгі назви (напр. англійські) не торкались краю вивіски
    size -= 0.5;
    el.style.fontSize = (size * sceneUnit) + 'px';
  }
}

