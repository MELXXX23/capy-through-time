//#part 175_buy.js
/* =====================================================================
   ПОКУПКИ: відділи й розширення
   ===================================================================== */

function buyDept(i) {
  if (!isDeptUnlocked(i)) return;
  const n = plannedBuy(i);
  const cost = deptCost(i, n);
  if (!(state.coins >= cost)) return;
  const before = state.depts[i];
  state.coins -= cost;
  state.depts[i] += n;
  state.stats.deptsBought += n;
  CONFIG.MILESTONES.forEach(m => {
    if (before < m && state.depts[i] >= m) { showToast(t('milestoneToast', deptName(i), m), 'good'); playSfx('milestone'); state.stats.milestones++; }
  });
  recalcIncome();
  rebuildShop();
  playSfx('buy');
  updateUI();
}

function expandShop() {
  const next = nextLevelDef();
  if (!next || !requirementsMet(next) || state.coins < expandCost(next)) return;
  const old = { canvas: shop.canvas, x: shop.x, y: shop.y, w: shop.w, h: shop.h };
  state.coins -= expandCost(next);
  state.shopLevel += 1;
  recalcIncome();
  rebuildShop(true);
  startBuild(old);
  playSfx('build');
  updateMusic();
  layoutScene();
  updateUI();
  saveGame();
}

