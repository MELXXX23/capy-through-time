//#part 211_skins_new_fx.js
/* =====================================================================
   ЛІТАЮЧІ ПРИКРАСИ нових скінів магазину (гачок SHOP_FX_DRAW у drawShopSkinFx, 210_skins.js): «Океан» — бульбашки, рибки, медузи, перлини;
   ===================================================================== */
const SHOP_FX_DRAW = {};
SHOP_FX.ocean = { max: 24, rate: 4.6, kinds: 5 };
const FX_SEA_COLS = ['o', 'y', 'f', 'S', 'u', 'm', 'r'];
SHOP_FX_DRAW.ocean = function (p, x, y) {
  const c = FX_SEA_COLS[p.col % 7], fl = Math.floor(p.age * 6 + p.spin) % 2;
  if (p.kind === 0) {                                                                    // дрібна бульбашка
    R(ctx, x - 1, y - 2, 3, 1, 'S'); R(ctx, x - 2, y - 1, 1, 3, 'S'); R(ctx, x + 2, y - 1, 1, 3, 'S'); R(ctx, x - 1, y + 2, 3, 1, 'S'); R(ctx, x - 1, y - 1, 1, 1, 'w');
  } else if (p.kind === 1) {                                                             // велика бульбашка з бліком
    R(ctx, x - 2, y - 3, 5, 1, 'S'); R(ctx, x - 3, y - 2, 1, 5, 'S'); R(ctx, x + 3, y - 2, 1, 5, 'S'); R(ctx, x - 2, y + 3, 5, 1, 'S');
    R(ctx, x - 2, y - 2, 5, 5, 'a'); ctx.globalAlpha *= 0.55; R(ctx, x - 2, y - 2, 5, 5, 's'); ctx.globalAlpha /= 0.55;
    R(ctx, x - 2, y - 2, 2, 1, 'w'); R(ctx, x - 2, y - 1, 1, 1, 'w'); R(ctx, x + 1, y + 2, 1, 1, 'w');
  } else if (p.kind === 2) {                                                             // рибка (повертається за напрямком)
    const d = (p.col & 1) ? 1 : -1, px = (ox, oy, w, h, col) => R(ctx, d > 0 ? x + ox : x - ox - w + 1, y + oy, w, h, col), ty = fl ? -1 : 0;
    px(-3, -1, 7, 3, 'd'); px(-2, -2, 5, 5, 'd'); px(-2, -1, 5, 3, c); px(-1, -2 + 1, 3, 1, c);
    px(-1, 1, 3, 1, 'w'); px(0, -1, 1, 3, 'w'); px(2, -1, 1, 1, 'k');
    px(-6, -2 + ty, 1, 5 - ty * 0, 'd'); px(-5, -1 + ty, 2, 3, c); px(-5, -2 + ty, 2, 1, 'd'); px(-5, 2 + ty, 2, 1, 'd'); px(-4, 0, 1, 1, c);
  } else if (p.kind === 3) {                                                             // медуза з тентаклями, що хвилюються
    const dome = ['q', 'S', 'y', 'f', 'v'][p.col % 5];
    R(ctx, x - 2, y - 4, 5, 1, 'd'); R(ctx, x - 3, y - 3, 7, 3, 'd'); R(ctx, x - 2, y - 3, 5, 3, dome); R(ctx, x - 2, y - 3, 2, 1, 'w');
    for (let i = -2; i <= 2; i += 2) for (let j = 0; j < 5; j++) R(ctx, x + i + Math.round(Math.sin(p.age * 5 + j * 0.9 + i) * 1), y + j, 1, 1, j % 2 ? dome : 'd');
  } else {                                                                               // перлина
    R(ctx, x - 1, y - 2, 3, 1, 'd'); R(ctx, x - 2, y - 1, 5, 3, 'd'); R(ctx, x - 1, y + 2, 3, 1, 'd'); R(ctx, x - 1, y - 1, 3, 3, 'w'); R(ctx, x - 1, y - 1, 1, 1, 'S');
    if (Math.sin(p.age * 5 + p.ph) > 0.5) { R(ctx, x + 3, y - 3, 1, 3, 'w'); R(ctx, x + 2, y - 2, 3, 1, 'w'); }
  }
};
