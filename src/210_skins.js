//#part 210_skins.js
/* =====================================================================
   ВКЛАДКА «СКІНИ»: виграні в цирку наряди для Капі, магазину, погоди й героїв. Тап — вдягнути, ще раз — зняти.
   ===================================================================== */
const SKIN_ICONS = { capy: '🎩', shop: '🏪', weather: '🌈', street: '🧱', hero: '🐾' };
let skinsSig = '';
/* ---- Літаючі прикраси навколо скінів магазину: цукерки / золоті монетки / кристали. Повільно спливають угору, гойдаються
        й м'яко підстрибують при тапі разом із магазином (пружина shopAnim) ---- */
const shopFx = { list: [], acc: 0 };
const SHOP_FX = { candy: { max: 18, rate: 3.4 }, gold: { max: 15, rate: 3 }, diamond: { max: 17, rate: 3.2 }, xmas: { max: 22, rate: 4.2, fall: 1 }, halloween: { max: 12, rate: 2.2 }, spring: { max: 16, rate: 3, fall: 1 }, autumn: { max: 18, rate: 3.2, fall: 1 } };
const FX_CANDY_COLS = ['f', 'y', 'm', 'u', 'o', 's', 'q'];
function updateShopSkinFx(dt) {
  const sk = skinOn('shop'), cfg = SHOP_FX[sk];
  if (!cfg || !shop || !animOn() || build || !layoutReady) { shopFx.list.length = 0; return; }
  const cap = ecoOn() ? cfg.max >> 1 : cfg.max;
  shopFx.acc += dt * cfg.rate;
  while (shopFx.acc >= 1) {
    shopFx.acc -= 1;
    if (shopFx.list.length >= cap) continue;
    const w = shop.w, h = shop.h, side = Math.random(), L = shop.level || 1;
    let x, y;
    if (side < 0.25) { x = rand(-18, 8); y = rand(h * 0.2, h - 6); }                    // ліворуч від магазину
    else if (side < 0.5) { x = rand(w - 8, w + 18); y = rand(h * 0.2, h - 6); }        // праворуч
    else { x = rand(2, w - 2); y = rand(-12, h * 0.2); }                                // над дахом і по верху фасаду
    if (cfg.fall) { x = rand(-16, w + 16); y = rand(-24, h * 0.3); }
    shopFx.list.push({ fall: cfg.fall ? 1 : 0, x, y, age: 0, life: cfg.fall ? rand(6, 10) : rand(5, 9), vy: cfg.fall ? rand(5, 10) : rand(1.2, 3.6), amp: rand(1.5, 4.5), f: rand(0.7, 1.6), ph: rand(0, 6.28), kind: Math.floor(Math.random() * 3), col: Math.floor(Math.random() * 7), spin: rand(0, 4), j: rand(0.6, 1.5) });
  }
  for (let i = shopFx.list.length - 1; i >= 0; i--) { const p = shopFx.list[i]; p.age += dt; if (p.age >= p.life) shopFx.list.splice(i, 1); }
}
/* ---- Золотий / діамантовий пил: дрібні пікселі й хрестики-блиски на магазині, Капі та героях ---- */
const skinDust = [];
const DUST_COLS = { gold: ['#fff6b0', '#ffd24a', '#ffffff', '#f2b84b'], diamond: ['#ffffff', '#d8f6ff', '#9be8ff', '#b4a8ff'] };
let dustAcc = { shop: 0, capy: 0, hero: 0 };
function dustKind(type) { const s = skinOn(type); return (s === 'gold' || s === 'diamond') ? s : null; }
function updateSkinDust(dt) {
  if (!animOn() || build || !layoutReady) { skinDust.length = 0; return; }
  const cap = ecoOn() ? 50 : 110, mk = (kind, x, y, big) => { if (skinDust.length < cap) skinDust.push({ kind, x, y, vx: rand(-3, 3), vy: rand(-7, -1.5), age: 0, life: rand(0.9, 2.2), c: Math.floor(Math.random() * 4), big, ph: rand(0, 6.28) }); };
  const sk = dustKind('shop');
  if (sk && shop) { dustAcc.shop += dt * 26; while (dustAcc.shop >= 1) { dustAcc.shop -= 1; const e = Math.random(); mk(sk, shop.x + rand(-10, shop.w + 10), shop.y + rand(-8, shop.h - 4), e < 0.18); } }
  const ck = dustKind('capy'), cp = LAYOUT.capy;
  if (ck && cp) { dustAcc.capy += dt * 12; while (dustAcc.capy >= 1) { dustAcc.capy -= 1; mk(ck, cp.x + 14 + rand(-21, 21), cp.footY - rand(2, 38), Math.random() < 0.3); } }
  const hk = dustKind('hero');
  if (hk) { dustAcc.hero += dt * 2.2 * actors.length; while (dustAcc.hero >= 1 && actors.length) { dustAcc.hero -= 1; const a = actors[Math.floor(Math.random() * actors.length)]; mk(hk, a.x + rand(-9, 9), a.y - rand(2, 24), Math.random() < 0.3); } }
  for (let i = skinDust.length - 1; i >= 0; i--) { const p = skinDust[i]; p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.age >= p.life) skinDust.splice(i, 1); }
}
function drawSkinDust() {
  if (!skinDust.length || !animOn() || build) return;
  skinDust.forEach(p => {
    const k = p.age / p.life, a = Math.sin(k * Math.PI), col = DUST_COLS[p.kind][p.c], x = Math.round(p.x), y = Math.round(p.y);
    ctx.globalAlpha = a;
    if (p.big) { R(ctx, x, y, 1, 1, '#ffffff'); ctx.globalAlpha = a * 0.8; R(ctx, x - 1, y, 3, 1, col); R(ctx, x, y - 1, 1, 3, col); if (a > 0.7) { ctx.globalAlpha = (a - 0.7) / 0.3; R(ctx, x - 2, y, 5, 1, '#ffffff'); R(ctx, x, y - 2, 1, 5, '#ffffff'); } }
    else { R(ctx, x, y, 1, 1, col); if (Math.sin(p.age * 14 + p.ph) > 0.5) { ctx.globalAlpha = a * 0.6; R(ctx, x + 1, y, 1, 1, '#ffffff'); } }
  });
  ctx.globalAlpha = 1;
}
const FX_CRYSTALS = [
  ['...n...', '..nwn..', '.nwSan.', 'nwSSasn', 'nSSaasn', '.nSaan.', '..nsn..', '...n...'],
  ['..n..', '.nwn.', 'nwSan', 'nSasn', '.nan.', '..n..'],
  ['..N..', '..w..', 'NwwwN', '..w..', '..N..']
];
const FX_CRYSTAL_COLS = [{ S: 'S', a: 'a', s: 's' }, { S: 'q', a: 'p', s: 'J' }, { S: 'S', a: 'm', s: 'g' }, { S: 'a', a: 'v', s: 'u' }];
function fxRows(rows, x0, y0, map) {
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = r[i]; if (c !== '.') R(ctx, x0 + i, y0 + j, 1, 1, map[c] || c); } });
}
function drawShopSkinFx() {
  const sk = skinOn('shop');
  if (!SHOP_FX[sk] || !shop || !animOn() || build) return;
  const hop = shopAnim.squash * 12;                                                     // тап: спершу присідають разом із магазином, потім пружно злітають
  shopFx.list.forEach(p => {
    const k = p.age / p.life, a = Math.min(1, k * 5, (1 - k) * 3.5);
    const x = Math.round(shop.x + p.x + Math.sin(p.age * p.f + p.ph) * p.amp), y = Math.round(shop.y + p.y + (p.fall ? 1 : -1) * p.age * p.vy + hop * p.j);
    ctx.globalAlpha = a;
    if (sk === 'candy') {
      const c = FX_CANDY_COLS[p.col], c2 = FX_CANDY_COLS[(p.col + 3) % 7];
      if (p.kind === 0) {                                                               // цукерка в обгортці з крильцями
        R(ctx, x - 3, y - 2, 7, 5, 'd'); R(ctx, x - 2, y - 1, 5, 3, c); R(ctx, x - 2, y - 1, 2, 1, 'w');
        R(ctx, x - 6, y - 2, 1, 5, c2); R(ctx, x - 5, y - 1, 2, 3, c2); R(ctx, x + 4, y - 2, 1, 5, c2); R(ctx, x + 3, y - 1, 2, 3, c2); R(ctx, x + 5, y - 3, 1, 1, c2); R(ctx, x - 6, y + 3, 1, 1, c2);
      } else if (p.kind === 1) {                                                        // мармеладка-кулька
        disc(ctx, x, y, 3, 'd'); disc(ctx, x, y, 2, c); R(ctx, x - 1, y - 1, 1, 1, 'w'); R(ctx, x + 1, y + 1, 1, 1, c2);
      } else {                                                                          // льодяник на паличці
        R(ctx, x, y + 3, 1, 6, 'd'); R(ctx, x, y + 3, 1, 5, 'w');
        disc(ctx, x, y, 4, 'd'); disc(ctx, x, y, 3, c); R(ctx, x - 2, y, 5, 1, c2); R(ctx, x, y - 2, 1, 5, c2); R(ctx, x - 2, y - 2, 1, 1, 'w');
      }
    } else if (sk === 'xmas') {                                                         // сніжинки й зірочки
      if (p.kind === 0) { R(ctx, x, y - 2, 1, 5, 'w'); R(ctx, x - 2, y, 5, 1, 'w'); R(ctx, x - 1, y - 1, 1, 1, 'S'); R(ctx, x + 1, y + 1, 1, 1, 'S'); R(ctx, x - 1, y + 1, 1, 1, 'S'); R(ctx, x + 1, y - 1, 1, 1, 'S'); }
      else if (p.kind === 1) { R(ctx, x, y, 2, 2, 'w'); R(ctx, x + 1, y + 1, 1, 1, 'S'); }
      else { R(ctx, x, y - 2, 1, 5, 'y'); R(ctx, x - 2, y, 5, 1, 'y'); R(ctx, x - 1, y - 1, 3, 3, 'y'); R(ctx, x, y, 1, 1, 'w'); }
    } else if (sk === 'halloween') {                                                    // кажани, привиди-димки й помаранчеві іскри
      const fl = Math.floor(p.age * 7) % 2;
      if (p.kind === 0) { R(ctx, x - 1, y, 3, 2, 'k'); R(ctx, x - 1, y - 1, 1, 1, 'k'); R(ctx, x + 1, y - 1, 1, 1, 'k'); if (fl) { R(ctx, x - 4, y - 2, 3, 1, 'k'); R(ctx, x + 2, y - 2, 3, 1, 'k'); R(ctx, x - 5, y - 1, 1, 1, 'k'); R(ctx, x + 5, y - 1, 1, 1, 'k'); } else { R(ctx, x - 4, y + 1, 3, 1, 'k'); R(ctx, x + 2, y + 1, 3, 1, 'k'); R(ctx, x - 5, y + 2, 1, 1, 'k'); R(ctx, x + 5, y + 2, 1, 1, 'k'); } R(ctx, x, y, 1, 1, 'r'); }
      else if (p.kind === 1) { R(ctx, x - 2, y - 2, 5, 5, 'w'); R(ctx, x - 1, y - 3, 3, 1, 'w'); R(ctx, x - 2, y + 3, 1, 1, 'w'); R(ctx, x, y + 3, 1, 1, 'w'); R(ctx, x + 2, y + 3, 1, 1, 'w'); R(ctx, x - 1, y - 1, 1, 2, 'k'); R(ctx, x + 1, y - 1, 1, 2, 'k'); }
      else { R(ctx, x, y, 2, 2, 'o'); R(ctx, x, y, 1, 1, 'y'); R(ctx, x + 2, y - 1, 1, 1, 'y'); }
    } else if (sk === 'spring') {                                                       // пелюстки й метелики
      const fl = Math.floor(p.age * 6) % 2;
      if (p.kind === 0) { R(ctx, x, y, 3, 2, 'q'); R(ctx, x + 1, y, 1, 1, 'p'); }
      else if (p.kind === 1) { R(ctx, x, y - 1, 1, 3, 'd'); const c = ['f', 'y', 'o', 'v'][p.col % 4]; if (fl) { R(ctx, x - 3, y - 2, 3, 2, c); R(ctx, x + 1, y - 2, 3, 2, c); R(ctx, x - 2, y, 2, 1, 'w'); R(ctx, x + 1, y, 2, 1, 'w'); } else { R(ctx, x - 3, y - 1, 3, 3, c); R(ctx, x + 1, y - 1, 3, 3, c); } }
      else { R(ctx, x - 1, y, 3, 1, 'w'); R(ctx, x, y - 1, 1, 3, 'w'); R(ctx, x, y, 1, 1, 'y'); }
    } else if (sk === 'autumn') {                                                       // листя, що кружляє
      const fl = Math.floor(p.age * 3 + p.spin) % 2, c = ['o', 'r', 'h', 'y', 't'][p.col % 5];
      if (p.kind === 2) { R(ctx, x - 1, y - 1, 3, 3, 'b'); R(ctx, x - 1, y - 2, 3, 1, 'd'); R(ctx, x, y + 2, 1, 1, 'd'); }
      else if (fl) { R(ctx, x - 2, y, 5, 2, c); R(ctx, x - 1, y - 1, 3, 1, c); R(ctx, x - 1, y, 1, 1, 'y'); R(ctx, x + 3, y + 1, 1, 1, 'b'); }
      else { R(ctx, x - 1, y - 2, 2, 5, c); R(ctx, x, y - 3, 1, 1, c); R(ctx, x, y, 1, 1, 'y'); R(ctx, x, y + 3, 1, 1, 'b'); }
    } else if (sk === 'gold') {                                                         // золота монета, що крутиться (не залежить від епохи)
      const ph = Math.floor(p.age * 7 + p.spin) % 4, w = [7, 5, 3, 5][ph], x0 = x - (w >> 1);
      R(ctx, x0, y - 3, w, 7, 'd');
      if (w >= 5) { R(ctx, x0 + 1, y - 2, w - 2, 5, 'h'); R(ctx, x0 + 1, y - 2, 1, 5, 'y'); R(ctx, x0 + 1, y - 2, w - 2, 1, 'y'); if (w === 7) R(ctx, x - 1, y, 3, 1, 'y'); }
      else R(ctx, x, y - 2, 1, 5, 'h');
      if (Math.sin(p.age * 5 + p.ph) > 0.8) { R(ctx, x + 4, y - 5, 1, 1, '#ffffff'); R(ctx, x + 3, y - 5, 3, 1, '#fff6b0'); R(ctx, x + 4, y - 6, 1, 3, '#fff6b0'); }
    } else {                                                                            // кристали: ромби різних кольорів
      const rows = FX_CRYSTALS[p.kind % 3], map = FX_CRYSTAL_COLS[p.col % 4];
      fxRows(rows, x - (rows[0].length >> 1), y - (rows.length >> 1), map);
      if (p.kind % 3 !== 2 && Math.sin(p.age * 4 + p.ph) > 0.8) { R(ctx, x + 4, y - 5, 1, 3, '#ffffff'); R(ctx, x + 3, y - 4, 3, 1, '#ffffff'); }
    }
  });
  ctx.globalAlpha = 1;
}
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
  // список перебудовується повністю: запам'ятовуємо прокрутку, щоб після вибору скіна гравця не кидало на початок
  let sc = ui.skinsList.parentElement;
  while (sc && sc !== document.body) { const cs = getComputedStyle(sc); if (/(auto|scroll)/.test(cs.overflowY) && sc.scrollHeight > sc.clientHeight + 2) break; sc = sc.parentElement; }
  if (sc === document.body) sc = null;
  const keepTop = sc ? sc.scrollTop : 0, keepH = ui.skinsList.offsetHeight;
  if (keepH) ui.skinsList.style.minHeight = keepH + 'px';
  Promise.resolve().then(() => { ui.skinsList.style.minHeight = ''; if (sc) sc.scrollTop = keepTop; });
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
  setText(ui.statEpoch, t('epoch_' + curEpoch()), 'statEpoch');
}

function setupProgression() {
  buildWorkshop();
  buildAchievements();
  buildStats();
  // мова в налаштуваннях
  ui.setLangBtns.innerHTML = '';
  LANGS.forEach(l => {
    if (l.wip && !DEV_OPEN_ALL) return;
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
    b.addEventListener('click', () => { if (seasonPickLocked(s)) { showToast(seasonLockText(s), 'bad'); return; } state.settings.season = s; theme.key = null; updateTheme(); updateMusic(); updateUI(); saveGame(); });
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
  [['setBirds', 'noFly'], ['setBirdsLate', 'birdsLate'], ['setClouds', 'clouds'], ['setSteam', 'steam'], ['setVibrate', 'vibrate']].forEach(([id, key]) => ui[id].addEventListener('click', () => { state.settings[key] = !state.settings[key]; if (key === 'vibrate') buzz(30); updateUI(); saveGame(); }));
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
  ui.godCard.hidden = !(GOD_OWNER || DEV_OPEN_BUILD);                                  // кнопка бачить лише власник (код GOD або збірка exe)
  ui.godToggle.addEventListener('click', toggleGodMode);
  ui.dbgBuildBtns.innerHTML = '';
  for (let L = 2; L <= LEVELS.length; L++) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn wide'; b.dataset.lvl = String(L);
    b.addEventListener('click', () => debugBuild(L));
    ui.dbgBuildBtns.appendChild(b);
  }
  ui.dbgBuildKeep.addEventListener('click', () => { dbgBuildKeep = !dbgBuildKeep; refreshGodCard(); });
  refreshGodCard();
  document.body.dataset.epoch = String(viewEpoch() % EPOCHS.length);
  applyViewSettings();
}

