//#part 213_epoch_roof_anim.js
/* Рухомі прикраси на даху маркету за епохою (малюються щокадру поверх фасаду, разом зі стисканням магазину).
   Космос: телескоп середнього розміру на триніжку повільно оглядає небо, лінза зблискує, уночі світиться. */
function drawEpochRoofAnim(sc) {
  if (!shop || build || !shop.sign || skinOn('shop')) return;
  if (currentEpoch().id !== 'space') return;
  const t = animOn() ? animClock : 0;
  withShopScale(sc, () => drawSpaceTelescope(t));
}
function drawSpaceTelescope(t) {
  const tower = shop.level >= 6, bx = shop.x + Math.round(shop.w * (tower ? 0.36 : 0.5)), by = shop.y + shop.sign.y - 9;   // точка на даху (біля вежі, якщо вона є)
  const a = -Math.PI / 2 + Math.sin(t * 0.23) * 0.75 + Math.sin(t * 0.61) * 0.12;                   // повільно водить трубою по небу
  const OUT = '#1d1f33', D = '#3a3f63', M = '#8a93c4', L = '#d6dcf5', W = '#ffffff';
  [[-6, 0], [6, 0], [0, 1]].forEach(([dx, dy]) => {                                                 // триніжок
    const n = 8; for (let i = 0; i <= n; i++) { const x = Math.round(bx + dx * i / n), y = Math.round(by - 8 + (8 + dy) * i / n); R(ctx, x, y, 1, 1, i % 3 ? D : OUT); }
  });
  R(ctx, bx - 3, by - 11, 7, 4, OUT); R(ctx, bx - 2, by - 10, 5, 2, M); R(ctx, bx - 2, by - 10, 5, 1, L);   // поворотна головка
  const cx = bx + 0.5, cy = by - 10, Lt = 15, ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
  for (let i = -5; i <= Lt; i++) {                                                                  // труба: темний край, тіло, світлий бік
    const r = i > Lt - 4 ? 2 : 1.5, px = cx + ca * i, py = cy + sa * i;
    for (let k = -2; k <= 2; k++) {
      if (Math.abs(k) > r + 0.5) continue;
      const x = Math.round(px + nx * k), y = Math.round(py + ny * k), edge = Math.abs(k) >= Math.floor(r + 0.5);
      R(ctx, x, y, 1, 1, edge ? OUT : k < 0 ? L : i % 6 === 0 ? D : M);
    }
  }
  const ex = Math.round(cx + ca * Lt), ey = Math.round(cy + sa * Lt), ox = Math.round(cx - ca * 5), oy = Math.round(cy - sa * 5);
  R(ctx, ox - 1, oy - 1, 3, 3, OUT); R(ctx, ox, oy, 1, 1, '#ffd24a');                               // окуляр
  const night = sky.night || 0, g = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.7)) ** 6;              // лінза: зблиск і нічне сяйво
  if (night > 0.2) { ctx.globalAlpha = 0.18 * night; R(ctx, ex - 4, ey - 4, 9, 9, '#8fd8ff'); ctx.globalAlpha = 0.3 * night; R(ctx, ex - 2, ey - 2, 5, 5, '#8fd8ff'); ctx.globalAlpha = 1; }
  R(ctx, ex - 1, ey - 1, 3, 3, '#5fb8ff'); ctx.globalAlpha = g; R(ctx, ex, ey - 1, 1, 1, W); R(ctx, ex - 1, ey, 1, 1, W); ctx.globalAlpha = 1;
  if (animOn() && (t % 7) < 0.6) { const u = (t % 7) / 0.6; ctx.globalAlpha = 1 - u; R(ctx, ex + Math.round(ca * 3), ey + Math.round(sa * 3) - 2, 1, 5, W); R(ctx, ex + Math.round(ca * 3) - 2, ey + Math.round(sa * 3), 5, 1, W); ctx.globalAlpha = 1; }   // спалах-хрестик раз на 7 с
}
