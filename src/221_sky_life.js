//#part 221_sky_life.js
/* =====================================================================
   ЖИВИЙ ФОН: листя, пелюстки й пушинки летять за вітром перед будинками (позаду маркету),
   у нічних епохах (аркада, космос, неон) — мерехтливі вогники-світлячки. Пориви вітру то сильніші, то слабші.
   Малюється щокадру після шару землі; вимикається разом з анімаціями й економ-режимом.
   ===================================================================== */
const skyLife = { list: [], key: '' };
const SKY_LIFE_COLS = {
  spring: [['#ffc0d8', '#ff94b8'], ['#ffe2ee', '#ffc0d8'], ['#ffffff', '#ffd8e8']],
  summer: [['#8ee05a', '#4fa83a'], ['#fff8d8', '#e8dca8'], ['#b8ec6a', '#6cbf3a']],
  autumn: [['#f29a3a', '#c4553d'], ['#ffd23f', '#d89a2a'], ['#e8603a', '#a83a2a']],
  halloween: [['#f29a3a', '#c4553d'], ['#9b5de5', '#5c2a8e'], ['#ffd23f', '#d89a2a']],
  winter: [['#ffffff', '#cfe4f8'], ['#eaf4ff', '#b8d4f0']]
};
function skyLifeGlow() { const id = currentEpoch().id; return id === 'arcade' || id === 'space' || id === 'neon'; }
function seedSkyLife() {
  const L = -view.offX, W = view.w, n = Math.max(5, Math.round(W / 95));
  skyLife.list.length = 0;
  for (let i = 0; i < n; i++) skyLife.list.push({ x: L + Math.random() * W, y: 20 + Math.random() * (LAYOUT.horizonY - 10), ph: Math.random() * 6.3, sp: 0.7 + Math.random() * 0.6, c: i % 3, fl: 1.5 + Math.random() * 2 });
}
function drawSkyLife() {
  if (!animOn() || ecoOn() || !state.settings.clouds) return;
  const key = view.w + '|' + view.offX + '|' + viewEpoch();
  if (key !== skyLife.key) { skyLife.key = key; seedSkyLife(); }
  const glow = skyLifeGlow(), season = theme.season, cols = SKY_LIFE_COLS[season] || SKY_LIFE_COLS.summer;
  const t = animClock, gust = 0.6 + 0.4 * Math.sin(t * 0.21) + 0.25 * Math.sin(t * 0.67), L = -view.offX - 10, Rr = -view.offX + view.w + 10;
  const night = (typeof sky !== 'undefined' && sky.night) || 0, now = performance.now(), dt = Math.min(0.05, Math.max(0, (now - (skyLife.last || now)) / 1000));
  skyLife.last = now;
  skyLife.list.forEach(p => {
    if (glow) {                                                         // вогники повільно плавають і мерехтять
      p.x += Math.sin(t * 0.4 + p.ph) * 6 * dt; p.y += Math.cos(t * 0.33 + p.ph) * 4 * dt;
      const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * p.fl + p.ph)), c = ['#ff5fd2', '#5fe8ff', '#ffe066'][p.c];
      const x = Math.round(p.x), y = Math.round(p.y);
      ctx.globalAlpha = a * 0.3; R(ctx, x - 1, y - 1, 3, 3, c); ctx.globalAlpha = a; R(ctx, x, y, 1, 1, '#ffffff');
    } else {                                                            // листок за вітром: пливе, гойдається, перевертається
      p.x += (14 + 26 * gust) * p.sp * dt; p.y += (5 + Math.sin(t * 1.3 + p.ph) * 9) * p.sp * dt;
      const x = Math.round(p.x + Math.sin(t * 2.1 + p.ph) * 3), y = Math.round(p.y), f = Math.floor(t * p.fl * 2 + p.ph) % 4, cc = cols[p.c % cols.length];
      ctx.globalAlpha = 0.9 - night * 0.4;
      if (f === 0) { R(ctx, x, y, 2, 1, cc[0]); R(ctx, x + 1, y + 1, 1, 1, cc[1]); }
      else if (f === 1) { R(ctx, x, y, 1, 2, cc[0]); R(ctx, x + 1, y, 1, 1, cc[1]); }
      else if (f === 2) { R(ctx, x, y, 2, 1, cc[1]); R(ctx, x, y + 1, 1, 1, cc[0]); }
      else R(ctx, x, y, 1, 1, cc[0]);
    }
    if (p.x > Rr) { p.x = L; p.y = 10 + Math.random() * (LAYOUT.horizonY - 10); }
    if (p.y > LAYOUT.curbY + 30 || p.y < -view.offY) p.y = 10 + Math.random() * 60;
    if (p.x < L) p.x = Rr;
  });
  ctx.globalAlpha = 1;
}
