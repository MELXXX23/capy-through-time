//#part 278_c_build_themes.js
// Тема 5 — Еко: жолудь падає й пускає ліани, будинок «вирощують» лози з квітами, пташки несуть гілочки, дощова хмарка поливає
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  function bird(x, y, t, dir, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const P = (dx, dy, w, h, c) => R(ctx, dir > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, c);
    const up = Math.floor(t * 14 + (o.ph || 0)) % 2;
    P(-4, -2, 9, 5, 'd'); P(-3, -1, 7, 3, 'n'); P(-2, 1, 5, 2, 'w'); P(3, -4, 4, 4, 'd'); P(4, -3, 2, 2, 'n'); P(5, -3, 1, 1, 'k'); P(7, -2, 2, 1, 'h'); P(-6, 0, 3, 2, 'd'); P(-5, 0, 2, 1, 'n');
    if (up) { P(-3, -6, 5, 4, 'd'); P(-2, -5, 3, 3, 'S'); } else { P(-3, 2, 5, 3, 'd'); P(-2, 3, 3, 1, 'S'); }
    if (o.carry) { P(5, 2, 8, 1, 'b'); P(11, 0, 3, 3, 'g'); P(11, 0, 2, 1, 'm'); }
  }
  function butterfly(x, y, t, ph, c) {
    x = Math.round(x); y = Math.round(y); const w = Math.floor(t * 10 + ph) % 3;
    R(ctx, x, y - 1, 1, 4, 'd');
    const ww = [4, 2, 1][w]; R(ctx, x - ww, y - 2, ww, 3, c); R(ctx, x + 1, y - 2, ww, 3, c); R(ctx, x - ww, y + 1, Math.max(1, ww - 1), 2, 'w'); R(ctx, x + 1, y + 1, Math.max(1, ww - 1), 2, 'w');
  }
  function flower(x, y, c, s) {
    x = Math.round(x); y = Math.round(y);
    if (s > 1) { R(ctx, x - 1, y - 3, 3, 7, 'd'); R(ctx, x - 3, y - 1, 7, 3, 'd'); R(ctx, x - 1, y - 2, 3, 5, c); R(ctx, x - 2, y - 1, 5, 3, c); R(ctx, x, y, 1, 1, 'y'); R(ctx, x - 1, y - 1, 1, 1, 'w'); }
    else { R(ctx, x - 1, y, 3, 1, c); R(ctx, x, y - 1, 1, 3, c); R(ctx, x, y, 1, 1, 'y'); }
  }
  function acorn(x, y) { x = Math.round(x); y = Math.round(y); R(ctx, x - 4, y - 5, 9, 4, 'd'); R(ctx, x - 3, y - 4, 7, 3, 'b'); R(ctx, x - 1, y - 7, 3, 2, 'd'); R(ctx, x - 3, y - 1, 7, 6, 'd'); R(ctx, x - 2, y, 5, 5, 'c'); R(ctx, x - 2, y, 2, 4, 'y'); R(ctx, x, y + 5, 1, 2, 'd'); }
  function vine(G, side) {
    const { t } = G, bx = side < 0 ? G.x0 - 5 : G.x1 + 5, gh = Math.max(0, G.base - G.top + 6);
    for (let h = 0; h < gh; h++) {
      const y = G.base - h, x = Math.round(bx + side * (Math.sin(h * 0.11 + (side > 0 ? 1.7 : 0)) * 3 + Math.sin(h * 0.04 + t * 0.7) * 1.2));
      R(ctx, x - 1, y, 4, 1, 'd'); R(ctx, x, y, 2, 1, h % 5 === 0 ? 'm' : 'g');
      if (h % 15 === 7) { const dd = (h / 15 | 0) % 2 ? 1 : -1; R(ctx, x + (dd > 0 ? 2 : -6), y - 2, 6, 3, 'd'); R(ctx, x + (dd > 0 ? 3 : -5), y - 1, 4, 1, 'g'); R(ctx, x + (dd > 0 ? 3 : -5), y - 2, 3, 1, 'm'); }
      if (h % 33 === 20) flower(x + side * 4, y - 1, ['f', 'y', 'q', 'p'][(h / 33 | 0) % 4], 2);
    }
  }
  B.list[5] = {
    id: 'eco',
    behind(G) {
      const { t, p, A } = G;
      if (G.mode === 'rise' && p >= A - 0.02 && p < G.C + 0.04) {                          // «зелений дах» на лінії кладки: травинки й квіточки
        const y = G.top;
        R(ctx, shop.x - 4, y - 1, shop.w + 8, 2, 'G');
        for (let x = 0; x < shop.w + 8; x += 2) { const h = 2 + Math.floor(rnd(x * 0.7) * 5), sw = Math.round(Math.sin(t * 2.2 + x * 0.3) * 1.2); R(ctx, shop.x - 4 + x + sw, y - 1 - h, 1, h, x % 6 ? 'g' : 'm'); if (x % 14 === 0) B.px(shop.x - 4 + x + sw, y - 2 - h, ['f', 'y', 'q', 'w'][x / 14 % 4 | 0]); }
      }
      if (p >= A * 0.7) { vine(G, -1); vine(G, 1); }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, tA = A * G.b.dur;
      // жолудь падає й тріскає
      if (p < A) {
        const s = c01(p / (A * 0.55)); if (s < 1) acorn(G.cx, lerp(-view.offY - 20, gy - 9, s * s));
        else { acorn(G.cx, gy - 9); const f = c01((p - A * 0.55) / (A * 0.45)); for (let i = 0; i < 8; i++) { const a = -3.14 + i / 7 * 3.14; B.px(G.cx + Math.cos(a) * f * 22, gy - 12 + Math.sin(a) * f * 20, i % 2 ? 'g' : 'm'); } }
      }
      // сонячна панелька й клумба-«склад» справа
      if (p > A - 0.04 && G.q < 0.3) {
        const cnt = Math.max(0, 6 - Math.round(G.wp * 5));
        R(ctx, x1 + 12, gy - 10, 20, 10, 'd'); R(ctx, x1 + 13, gy - 9, 18, 8, 'b'); R(ctx, x1 + 13, gy - 9, 18, 1, 'l');
        for (let i = 0; i < cnt; i++) { R(ctx, x1 + 15 + i * 3, gy - 16 + (i % 2), 2, 6, 'g'); R(ctx, x1 + 14 + i * 3, gy - 17 + (i % 2), 4, 2, 'm'); }
      }
      // пташки: кущ → лінія кладки
      if (p >= A * 0.4) for (let i = 0; i < 5; i++) {
        const T = 3.1, u = (((t - tA) / T + i * 0.2) % 1 + 1) % 1, sx = x1 + 24, sy = gy - 22, tx = lerp(x0 + 14, x1 - 14, (i + 0.5) / 5), ty = G.top - 10 + Math.sin(t * 5 + i) * 2;
        let x, y, dir, carry = true;
        if (u < 0.5) { const s = smooth01(u / 0.5); x = lerp(sx, tx, s); y = lerp(sy, ty, s) - Math.sin(Math.PI * s) * 16; dir = tx > sx ? 1 : -1; }
        else if (u < 0.6) { x = tx; y = ty; dir = 1; carry = u < 0.55; if (u > 0.5 && u < 0.58) B.spark(tx, G.top - 3, 'm', 'w'); }
        else { const s = smooth01((u - 0.6) / 0.4); x = lerp(tx, sx, s); y = lerp(ty, sy, s) - Math.sin(Math.PI * s) * 10; dir = sx > tx ? 1 : -1; carry = false; }
        if (p < A) { const s = smooth01(c01(p / A)); x = lerp(i % 2 ? visR() + 30 : visL() - 30, x, s); }
        bird(x, y, t, dir, { carry, ph: i });
      }
      // метелики
      for (let i = 0; i < 5; i++) { const bx = G.cx + Math.sin(t * 0.7 + i * 2.1) * (60 + i * 18), by = G.top - 18 - i * 6 + Math.sin(t * 1.6 + i) * 8; butterfly(bx, by, t, i * 3, ['f', 'y', 'N', 'o', 'q'][i]); }
      // дощова хмарка поливає
      if (p >= A && G.q < 0.15) {
        const cx = lerp(x0 + 30, x1 - 30, (Math.sin(t * 0.45) + 1) / 2), cy = G.top - 34;
        [[-8, 0, 6], [0, -3, 8], [9, 1, 6]].forEach(([dx, dy, r]) => { disc(ctx, Math.round(cx + dx), cy + dy, r + 1, 'd'); }); [[-8, 0, 6], [0, -3, 8], [9, 1, 6]].forEach(([dx, dy, r]) => disc(ctx, Math.round(cx + dx), cy + dy, r, 'a'));
        for (let i = 0; i < 9; i++) { const u = ((t * 1.8 + i / 9) % 1); R(ctx, Math.round(cx - 10 + i * 2.5), Math.round(cy + 8 + u * (G.top - cy - 6)), 1, 2, i % 2 ? 'S' : 's'); }
      }
    },
    finale(G) {
      const { t, q } = G;
      if (q > 0.05) for (let i = 0; i < 22; i++) { const u = c01((q - 0.05 - i * 0.01) / 0.5); if (u <= 0) continue; const fx = shop.x + rnd(i * 2.1) * shop.w, fy = G.roof + 10 + rnd(i * 3.3) * 90; if (u < 1) flower(fx, fy, ['f', 'y', 'q', 'p', 'o', 'w'][i % 6], 2); }
      if (q > 0.2) { const a = c01((q - 0.2) / 0.2) * (1 - c01((q - 0.85) / 0.15)); ctx.globalAlpha = 0.7 * a; ['r', 'o', 'y', 'g', 's', 'u'].forEach((c, k) => { for (let ang = 0; ang <= 3.1416; ang += 0.02) R(ctx, Math.round(G.cx + Math.cos(ang) * (62 - k * 3)), Math.round(G.roof - 8 - Math.sin(ang) * (42 - k * 2)), 2, 2, c); }); ctx.globalAlpha = 1; }
      if (q > 0.1) for (let i = 0; i < 18; i++) { const u = ((q * 1.3 + i / 18) % 1), px = shop.x + rnd(i * 5) * shop.w + Math.sin(u * 8 + i) * 6, py = G.roof - 30 + u * 140; R(ctx, Math.round(px), Math.round(py), 2, 1, i % 2 ? 'q' : 'p'); }
      B.bunting(G, ['g', 'm', 'f', 'y', 'w', 'q']);
    }
  };
})();

// Тема 6 — Космос: тарілка-буксир тягне модулі променем, астронавти з ранцями зварюють шов, «T-3…2…1» і зліт тарілки, прапорець на даху
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  function ufo(x, y, t, lit) {
    x = Math.round(x); y = Math.round(y);
    for (let i = -26; i <= 26; i++) {
      const hh = Math.round(6 * Math.sqrt(Math.max(0, 1 - (i / 27) * (i / 27))));
      if (hh <= 0) continue;
      R(ctx, x + i, y - hh, 1, hh * 2 + 1, 'd'); R(ctx, x + i, y - hh + 1, 1, hh * 2 - 1, 'Y'); R(ctx, x + i, y - hh + 1, 1, 2, 'w'); R(ctx, x + i, y + hh - 2, 1, 2, 'e');
    }
    for (let k = 0; k < 7; k++) { const on = (Math.floor(t * 6) + k) % 3; R(ctx, x - 18 + k * 6, y + 1, 2, 2, ['y', 'r', 'N'][on]); }
    disc(ctx, x, y - 7, 9, 'd'); disc(ctx, x, y - 7, 8, 'a'); R(ctx, x - 5, y - 12, 4, 2, 'w');
    disc(ctx, x + 1, y - 5, 3, 'm'); R(ctx, x, y - 6, 1, 2, 'k'); R(ctx, x + 3, y - 6, 1, 2, 'k');
    R(ctx, x - 8, y + 6, 17, 3, 'd'); R(ctx, x - 7, y + 6, 15, 2, 'e');
    if (lit) { const f = Math.floor(t * 16) % 2; R(ctx, x - 6, y + 9, 3, 3 + f, 'o'); R(ctx, x + 4, y + 9, 3, 3 + f, 'o'); R(ctx, x - 5, y + 9, 1, 2, 'y'); R(ctx, x + 5, y + 9, 1, 2, 'y'); }
  }
  function module(x, y, w) { x = Math.round(x); y = Math.round(y); R(ctx, x - (w >> 1), y, w, 11, 'd'); R(ctx, x - (w >> 1) + 1, y + 1, w - 2, 9, 'E'); R(ctx, x - (w >> 1) + 1, y + 1, w - 2, 2, 'w'); for (let i = 0; i < w - 6; i += 6) { R(ctx, x - (w >> 1) + 3 + i, y + 8, 3, 1, 'h'); R(ctx, x - (w >> 1) + 5 + i, y + 8, 1, 1, 'k'); } R(ctx, x - 2, y + 4, 5, 2, 'N'); R(ctx, x - 1, y - 2, 3, 2, 'd'); }
  function astro(x, y, t, dir, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const P = (dx, dy, w, h, c) => R(ctx, dir > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, c);
    P(-6, -9, 4, 10, 'd'); P(-5, -8, 2, 8, 'Y');
    if (o.flame) { const f = Math.floor(t * 18 + (o.ph || 0)) % 3; P(-5, 2, 2, 3 + f, 'o'); P(-5, 2, 1, 2 + f, 'y'); }
    P(-4, -9, 9, 11, 'd'); P(-3, -8, 7, 9, 'w'); P(-3, -3, 7, 1, 'o'); P(-1, -7, 3, 2, 'N'); P(-2, 0, 5, 1, 'E');
    P(-4, -18, 9, 9, 'd'); P(-3, -17, 7, 7, 'w'); P(-1, -16, 5, 6, 'd'); P(0, -15, 3, 4, 'N'); P(0, -15, 1, 1, 'w'); P(2, -12, 1, 1, 'a');
    P(-3, 2, 3, 7, 'd'); P(-2, 2, 1, 5, 'w'); P(2, 2, 3, 7, 'd'); P(3, 2, 1, 5, 'w'); P(-3, 8, 3, 2, 'o'); P(2, 8, 3, 2, 'o');
    if (o.weld) { P(4, -7, 6, 2, 'w'); P(9, -9, 4, 4, 'd'); P(10, -8, 2, 2, 'e'); if (o.fire) { P(13, -8, 4, 3, 'N'); P(14, -7, 2, 1, 'w'); } }
    else P(4, -6, 4, 2, 'w');
  }
  function beamDown(x, ytop, ybot, wTop, wBot, a, col) {
    ctx.globalAlpha = a;
    for (let y = ytop; y < ybot; y += 2) { const u = (y - ytop) / Math.max(1, ybot - ytop), hw = lerp(wTop, wBot, u); R(ctx, Math.round(x - hw), y, Math.round(hw * 2), 2, col); }
    ctx.globalAlpha = 1;
  }
  B.list[6] = {
    id: 'space',
    behind(G) {
      const { t, p, A } = G;
      if (G.mode === 'rise' && p >= A - 0.02 && p < G.C + 0.03) {                       // світлий зварювальний шов по лінії кладки
        const y = G.top - 1, w = shop.w + 8; R(ctx, shop.x - 4, y - 1, w, 3, 'd'); R(ctx, shop.x - 4, y, w, 1, 'N'); ctx.globalAlpha = 0.3; R(ctx, shop.x - 4, y - 3, w, 2, 'N'); ctx.globalAlpha = 1;
        for (let i = 0; i < 10; i++) { const k = Math.floor(t * 8 + i * 5); if (rnd(k) > 0.45) B.spark(shop.x + rnd(k * 2 + i) * shop.w, y - 1, 'N', 'w'); }
      }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, tA = A * G.b.dur;
      let ux = G.cx + Math.sin(t * 0.5) * 20, uy = Math.min(top - 78, base - 170) + Math.sin(t * 1.1) * 3, thr = false;
      if (p < A) { const s = smooth01(c01(p / A)); ux = lerp(visR() + 80, ux, s); uy = lerp(uy - 90, uy, s); thr = s < 0.95; }
      let launch = 0;
      if (G.q > 0.5) launch = smooth01(c01((G.q - 0.5) / 0.45));
      uy -= launch * 260; ux += launch * 60;
      if (launch > 0) thr = true;
      // промінь і модулі
      if (p >= A * 0.7 && G.q < 0.12) {
        const wt = 5, x = ux; beamDown(x, uy + 10, G.top - 2, 4, 26, 0.17, 'N'); beamDown(x, uy + 10, G.top - 2, 1.5, 11, 0.16, 'w');
        for (let i = 0; i < 2; i++) { const T = 2.0, u = (((t - tA) / T + i * 0.5) % 1 + 1) % 1, my = lerp(uy + 14, G.top - 12, smooth01(u)), mx = lerp(x, lerp(x0 + 30, x1 - 30, rnd(Math.floor((t - tA) / T) + i * 3)), smooth01(u)); module(mx, my, 24); if (u > 0.9) B.spark(mx, G.top - 2, 'N', 'w', true); }
      }
      ufo(ux, uy, t, thr);
      // астронавти на прив'язях
      const AS = [-80, -26, 36, 86];
      AS.forEach((dx, i) => {
        let x = G.cx + dx + Math.sin(t * 0.8 + i * 1.7) * 7, y = G.top - 22 + Math.sin(t * 1.5 + i) * 4, dir = dx < 0 ? 1 : -1;
        const fire = Math.floor(t * 5 + i * 1.7) % 2 === 0 && p > A && G.q < 0.1;
        if (p < A) { const s = smooth01(c01((p - 0.01) / (A - 0.01))); x = lerp(i % 2 ? visR() + 30 : visL() - 30, x, s); y = lerp(top - 120, y, s); }
        if (G.q > 0.3) { const s = smooth01(c01((G.q - 0.3) / 0.5)); y -= s * 70; x += dx * 0.01 * s * 60; }
        ctx.globalAlpha = 0.55; lineG(ctx, Math.round(x), Math.round(y - 4), Math.round(ux + dx * 0.15), Math.round(uy + 8), 'w'); ctx.globalAlpha = 1;
        astro(x, y, t, dir, { weld: true, fire, flame: true, ph: i });
        if (fire) B.spark(x + dir * 17, y - 5, 'N', 'w', true);
      });
      // ящики-модулі на майданчику
      if (p > A - 0.04 && G.q < 0.2) { const cnt = Math.max(0, 4 - Math.round(G.wp * 4)); for (let i = 0; i < cnt; i++) module(x1 + 26 + (i % 2) * 28, gy - 12 - Math.floor(i / 2) * 11, 24); }
      // супутникова антена на майданчику
      if (p > 0.02 && G.q < 0.3) { const ax = x0 - 28; R(ctx, ax - 1, gy - 18, 3, 18, 'd'); R(ctx, ax, gy - 17, 1, 16, 'e'); for (let i = -8; i <= 8; i++) { const hh = Math.round(i * i / 16); R(ctx, ax + i, gy - 24 + hh - 6, 1, 2, 'Y'); } R(ctx, ax - 1, gy - 28, 3, 3, Math.floor(t * 3) % 2 ? 'r' : 'd'); }
    },
    finale(G) {
      const { t, q } = G;
      if (q < 0.5 && q > 0.02) {                                                          // відлік
        const n = 3 - Math.floor((q - 0.02) / 0.16), s = 4; if (n >= 1) { ctx.save(); ctx.translate(Math.round(G.cx - 5), Math.round(G.roof - 54)); ctx.scale(s, s); B.text(0, 0, '' + n, 'y', 'z'); ctx.restore(); }
      }
      if (q > 0.5) {                                                                      // дим від стартового майданчика, зорі, прапорець
        for (let i = 0; i < 10; i++) { const u = c01((q - 0.5 - i * 0.02) / 0.4); if (u <= 0 || u >= 1) continue; ctx.globalAlpha = 0.6 * (1 - u); disc(ctx, Math.round(G.cx + (i - 5) * 9 * u), Math.round(G.roof - 20 - u * 14), 3 + Math.round(u * 4), 'w'); ctx.globalAlpha = 1; }
        const fx = G.cx + 40, fy = G.roof; R(ctx, fx, fy - 20, 1, 20, 'd'); R(ctx, fx + 1, fy - 20, 8, 6, 'd'); R(ctx, fx + 1, fy - 19, 7, 4, 'r'); R(ctx, fx + 3, fy - 18, 2, 2, 'w');
      }
      if (q > 0.3) for (let i = 0; i < 12; i++) { const u = ((q * 2 + i / 12) % 1); B.spark(G.x0 + rnd(i * 4) * (G.x1 - G.x0), G.roof - 60 + u * 40, ['w', 'y', 'N'][i % 3], 'w'); }
      B.bunting(G, ['N', 'w', 'y', 'u', 'f', 'S']);
    }
  };
})();

// Тема 7 — Неон: лазерний 3D-принтер на порталі «друкує» будинок за неоновим голографічним каркасом, дрони, цифровий дощ, «ONLINE»
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  function dashV(x, y0, y1, c, a, ph) { ctx.globalAlpha = a; for (let y = y0; y < y1; y += 4) if ((((y + (ph | 0)) >> 2) & 1) === 0) R(ctx, Math.round(x), y, 1, 3, c); ctx.globalAlpha = 1; }
  function dashH(x0, x1, y, c, a, ph) { ctx.globalAlpha = a; for (let x = x0; x < x1; x += 4) if ((((x + (ph | 0)) >> 2) & 1) === 0) R(ctx, Math.round(x), Math.round(y), 3, 1, c); ctx.globalAlpha = 1; }
  function neonDrone(x, y, t, c, ph) {
    x = Math.round(x); y = Math.round(y);
    ctx.globalAlpha = 0.25; disc(ctx, x, y, 7, c); ctx.globalAlpha = 1;
    R(ctx, x - 4, y - 2, 9, 4, 'd'); R(ctx, x - 3, y - 1, 7, 2, 'k'); R(ctx, x - 1, y - 1, 3, 2, c); R(ctx, x, y - 1, 1, 1, 'w');
    const f = Math.floor(t * 28 + ph) % 2; R(ctx, x - 7, y - 4, 5 + f, 1, c); R(ctx, x + 3 - f, y - 4, 5 + f, 1, c);
    R(ctx, x - 3, y + 2, 1, 2, 'd'); R(ctx, x + 3, y + 2, 1, 2, 'd');
  }
  B.list[7] = {
    id: 'neon',
    behind(G) {
      const { t, p, A, x0, x1 } = G, xa = shop.x, xb = shop.x + shop.w;
      // цифровий дощ по краях
      if (p > 0.02 && G.q < 0.6) for (let c = 0; c < 8; c++) {
        const cx = c < 4 ? x0 - 30 - c * 14 : x1 + 30 + (c - 4) * 14, sp = 0.5 + rnd(c) * 0.5, head = ((t * sp + rnd(c * 3.1)) % 1) * (G.base + view.offY + 20) - view.offY;
        for (let k = 0; k < 8; k++) { ctx.globalAlpha = 0.9 * (1 - k / 8); const ch = (Math.floor(t * 8 + c * 5 + k * 3) % 2) + ''; B.text(cx, head - k * 7, ch, k === 0 ? 'w' : 'N'); }
        ctx.globalAlpha = 1;
      }
      // голографічний каркас майбутнього будинку над лінією кладки
      if (p >= A * 0.8 && p < G.C + 0.03) {
        const top = G.top, roof = G.roof, ph = t * 20;
        dashV(xa, roof, top, 'N', 0.85, ph); dashV(xb, roof, top, 'N', 0.85, ph);
        dashH(xa, xb, roof, 'N', 0.85, -ph);
        for (let y = roof + 38; y < top; y += 38) dashH(xa, xb, y, 'f', 0.5, ph);
        for (let x = xa + 46; x < xb; x += 46) dashV(x, roof, top, 'u', 0.45, 0);
        [[xa, roof], [xb, roof]].forEach(([cx, cy]) => { R(ctx, cx - 3, cy - 3, 7, 1, 'w'); R(ctx, cx - 3, cy - 3, 1, 7, 'w'); });
        ctx.globalAlpha = 0.9; B.text(G.cx - 18, roof + 6, 'SCANNING', 'N'); ctx.globalAlpha = 1;
      }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, grow = c01(p / A);
      // портал: дві опори з неоновими трубками й рейка над лінією кладки
      const railY = G.top - 18 + (p < A ? 0 : 0), ph = Math.floor(t * 4);
      [x0 - 8, x1 + 8].forEach((px, k) => {
        const hh = Math.round((base - railY + 8) * smooth01(grow) * (1 - smooth01(c01((G.q - 0.35) / 0.4))));
        R(ctx, px - 2, base - hh, 5, hh, 'd'); R(ctx, px - 1, base - hh, 3, hh, 'k'); R(ctx, px, base - hh, 1, hh, k ? 'f' : 'N');
        for (let y = base - hh + 6; y < base; y += 12) R(ctx, px - 2, y, 5, 1, 'u');
        if (hh > 4) { ctx.globalAlpha = 0.25; R(ctx, px - 4, base - hh, 9, hh, k ? 'f' : 'N'); ctx.globalAlpha = 1; }
      });
      if (grow > 0.6 && G.q < 0.75) {
        const w = x1 - x0 + 24, rx = x0 - 12; R(ctx, rx, railY, w, 5, 'd'); R(ctx, rx, railY + 1, w, 3, 'k'); R(ctx, rx, railY + 2, w, 1, 'f'); ctx.globalAlpha = 0.25; R(ctx, rx, railY - 2, w, 9, 'f'); ctx.globalAlpha = 1;
        // головка друку
        const hx = Math.round(lerp(x0 + 6, x1 - 6, (Math.sin(t * 1.6) + 1) / 2));
        R(ctx, hx - 8, railY - 4, 17, 11, 'd'); R(ctx, hx - 7, railY - 3, 15, 9, 'e'); R(ctx, hx - 7, railY - 3, 15, 2, 'Y'); R(ctx, hx - 2, railY + 3, 5, 4, 'k'); R(ctx, hx - 1, railY + 4, 3, 2, 'N'); R(ctx, hx, railY + 4, 1, 1, 'w');
        if (p >= A && G.q < 0.1) {                                                       // промінь друку: лазер вниз до лінії кладки
          const yb = G.top; R(ctx, hx, railY + 7, 1, yb - railY - 7, 'w'); ctx.globalAlpha = 0.45; R(ctx, hx - 1, railY + 7, 3, yb - railY - 7, 'N'); ctx.globalAlpha = 1;
          B.spark(hx, yb, 'N', 'w', true);
          // лінія сканування по всій ширині з глітчами
          R(ctx, shop.x - 3, yb - 1, shop.w + 6, 1, 'N'); ctx.globalAlpha = 0.35; R(ctx, shop.x - 3, yb - 3, shop.w + 6, 2, 'N'); ctx.globalAlpha = 1;
          for (let i = 0; i < 5; i++) { const k = Math.floor(t * 10 + i * 7); if (rnd(k) > 0.4) R(ctx, Math.round(shop.x + rnd(k * 2) * shop.w), yb - 2 - Math.floor(rnd(k * 3) * 3), 6 + Math.floor(rnd(k * 4) * 12), 1, i % 2 ? 'f' : 'w'); }
        }
      }
      // дрони летять по периметру каркаса
      if (p >= A * 0.8 && G.q < 0.2) {
        const xa = shop.x, xb = shop.x + shop.w, ya = G.roof, yb = G.top, per = (xb - xa) * 2 + (yb - ya) * 2;
        ['N', 'f', 'g'].forEach((c, i) => {
          let s = (((t * 0.15 + i / 3) % 1) * per), x, y;
          if (s < xb - xa) { x = xa + s; y = ya; } else if ((s -= xb - xa) < yb - ya) { x = xb; y = ya + s; } else if ((s -= yb - ya) < xb - xa) { x = xb - s; y = yb; } else { s -= xb - xa; x = xa; y = yb - s; }
          neonDrone(x, y - 6, t, c, i * 5);
        });
      }
      if (p < A) { const s = smooth01(grow); for (let i = 0; i < 3; i++) neonDrone(lerp(i % 2 ? visR() + 40 : visL() - 40, G.cx + (i - 1) * 60, s), lerp(top - 120, railY - 24, s) + i * 6, t, ['N', 'f', 'g'][i], i); }
    },
    finale(G) {
      const { t, q } = G;
      if (q < 0.35) { const fl = Math.sin(q * 90) * 0.5 + 0.5; ctx.globalAlpha = 0.28 * fl * (1 - q / 0.35); R(ctx, G.x0 - 140, G.roof - 80, G.x1 - G.x0 + 280, 300, 'V'); ctx.globalAlpha = 1; }
      if (q > 0.12) {                                                                     // ударна хвиля від вивіски
        for (let k = 0; k < 2; k++) { const u = c01((q - 0.12 - k * 0.1) / 0.5); if (u <= 0 || u >= 1) continue; ctx.globalAlpha = 1 - u; const rr = 10 + u * 190; for (let a = 0; a < 6.283; a += 0.07) R(ctx, Math.round(G.cx + Math.cos(a) * rr), Math.round(G.roof + 10 + Math.sin(a) * rr * 0.4), 2, 1, k ? 'f' : 'N'); ctx.globalAlpha = 1; }
        const txt = 'ONLINE', s = 3, w = B.textW(txt) * s; ctx.save(); ctx.translate(Math.round(G.cx - w / 2), Math.round(G.roof - 46)); ctx.scale(s, s); ctx.globalAlpha = 0.5; B.text(0, 0, txt, 'f'); ctx.globalAlpha = 1; B.text(-0, 0, txt, Math.floor(t * 8) % 7 === 0 ? 'k' : 'N', 'V'); ctx.restore();
      }
      if (q > 0.2) for (let i = 0; i < 12; i++) { const u = ((q * 1.5 + i / 12) % 1); R(ctx, Math.round(G.x0 + rnd(i * 3) * (G.x1 - G.x0)), Math.round(G.roof - 30 + u * 60), 2, 2, ['N', 'f', 'g', 'w'][i % 4]); }
      B.bunting(G, ['N', 'f', 'g', 'u', 'y', 'w']);
    }
  };
})();

// Тема 8 — Японія: дракон кружляє над будовою, паперові журавлики несуть плитки, ліхтарики на мотузці-сімена, тануки-теслі, пелюстки сакури, ханабі
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  function crane(x, y, t, dir, c, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const P = (dx, dy, w, h, col) => R(ctx, dir > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, col);
    const up = Math.floor(t * 7 + (o.ph || 0)) % 2;
    P(-7, 1, 3, 1, 'd'); P(-6, 0, 3, 1, c);
    P(-4, -1, 9, 4, 'd'); P(-3, 0, 7, 2, c); P(-1, 2, 3, 1, 'E');
    P(4, -4, 2, 5, 'd'); P(4, -3, 1, 4, c); P(5, -7, 4, 4, 'd'); P(5, -6, 2, 2, c); P(9, -5, 3, 1, 'o'); P(6, -8, 1, 1, 'r'); P(7, -5, 1, 1, 'k');
    if (up) { P(-3, -7, 7, 6, 'd'); P(-2, -6, 5, 4, c); P(-1, -5, 3, 2, 'E'); P(-2, -7, 2, 1, c); }
    else { P(-3, 3, 7, 5, 'd'); P(-2, 3, 5, 3, c); P(-1, 4, 3, 1, 'E'); }
    if (o.tile) { P(0, 6, 7, 7, 'd'); P(1, 7, 5, 5, 'w'); P(3, 9, 1, 1, 'r'); lineG(ctx, x + (dir > 0 ? 2 : -2), y + 3, x + (dir > 0 ? 4 : -4), y + 6, 'd'); }
  }
  function tanuki(x, y, t, ph) {
    x = Math.round(x); y = Math.round(y);
    const hit = Math.floor(t * 4 + ph) % 2;
    R(ctx, x - 6, y - 8, 13, 11, 'd'); R(ctx, x - 5, y - 7, 11, 9, 'b'); R(ctx, x - 3, y - 3, 7, 5, 'c');                  // тіло з білим животом
    R(ctx, x - 6, y - 15, 13, 8, 'd'); R(ctx, x - 5, y - 14, 11, 6, 'b'); R(ctx, x - 6, y - 16, 3, 3, 'd'); R(ctx, x + 4, y - 16, 3, 3, 'd');       // голова, вуха
    R(ctx, x - 4, y - 12, 3, 3, 'k'); R(ctx, x + 2, y - 12, 3, 3, 'k'); R(ctx, x - 3, y - 11, 1, 1, 'w'); R(ctx, x + 3, y - 11, 1, 1, 'w'); R(ctx, x - 1, y - 9, 3, 2, 'c'); R(ctx, x, y - 9, 1, 1, 'k');
    R(ctx, x - 5, y - 16, 11, 2, 'w'); R(ctx, x - 1, y - 16, 3, 2, 'r');                                              // хатімакі
    R(ctx, x - 5, y + 3, 4, 3, 'd'); R(ctx, x + 2, y + 3, 4, 3, 'd');
    // колотушка
    const my = hit ? y - 20 : y - 6;
    R(ctx, x + 7, y - 8, 4, 2, 'd'); R(ctx, x + 9, my, 2, 14, 'd'); R(ctx, x + 10, my, 1, 13, 'l'); R(ctx, x + 6, my - 4, 8, 6, 'd'); R(ctx, x + 7, my - 3, 6, 4, 'e'); R(ctx, x + 7, my - 3, 6, 1, 'E');
  }
  function lantern(x, y, t, s, big) {
    x = Math.round(x + Math.sin(t * 1.3 + s) * 1); y = Math.round(y);
    ctx.globalAlpha = big ? 0.4 : 0.22; disc(ctx, x, y + 6, big ? 13 : 9, 'o'); ctx.globalAlpha = 1;
    R(ctx, x - 1, y - 3, 2, 3, 'd'); R(ctx, x - 5, y, 11, 2, 'd'); R(ctx, x - 6, y + 2, 13, 10, 'd'); R(ctx, x - 5, y + 2, 11, 10, 'r'); R(ctx, x - 5, y + 2, 3, 10, 'J'); R(ctx, x - 5, y + 5, 11, 1, 'o'); R(ctx, x - 5, y + 8, 11, 1, 'o'); R(ctx, x - 5, y + 12, 11, 2, 'd'); R(ctx, x - 1, y + 14, 1, 3, 'y');
  }
  function dragon(G, t, mode) {
    const base = G.base, y0 = Math.min(G.top - 60, base - 165);
    const rx = (G.x1 - G.x0) * 0.5 + 24, spiral = G.q > 0 ? smooth01(c01(G.q / 0.55)) : 0;
    const pos = tt => {
      let x = G.cx + Math.sin(tt * 0.62) * rx * (1 - spiral * 0.75), y = y0 + Math.sin(tt * 1.3) * 20 - spiral * 40;
      if (G.p < G.A) { const s = smooth01(c01(G.p / G.A)); x = lerp(visR() + 120 + (tt - t) * 40, x, s); y = lerp(y0 - 130, y, s); }
      if (spiral > 0) { const a = tt * 4.2; x = lerp(x, G.cx + Math.cos(a) * 34, spiral); y = lerp(y, G.roof - 42 + Math.sin(a) * 12 - (tt - t) * 14 * 0, spiral); }
      return [x, y];
    };
    const N = 28, pts = []; for (let i = 0; i < N; i++) pts.push(pos(t - i * 0.075));
    for (let i = N - 1; i >= 0; i--) {
      const [x, y] = pts[i], r = lerp(5.5, 1.6, i / N), xi = Math.round(x), yi = Math.round(y + Math.sin(t * 8 - i * 0.7) * 1.2);
      disc(ctx, xi, yi, Math.round(r) + 1, 'd');
    }
    for (let i = N - 1; i >= 0; i--) {
      const [x, y] = pts[i], r = Math.max(1, Math.round(lerp(5.5, 1.6, i / N))), xi = Math.round(x), yi = Math.round(y + Math.sin(t * 8 - i * 0.7) * 1.2);
      disc(ctx, xi, yi, r, i % 4 < 2 ? 'g' : 'm'); if (r > 2) R(ctx, xi - 1, yi + Math.round(r * 0.5), 3, 1, 'y');
      if (i % 3 === 1 && r > 1) R(ctx, xi, yi - r - 1, 1, 2, 'r');
    }
    // голова
    const [hx, hy] = pts[0], nx = pts[1][0], dir = hx >= nx ? 1 : -1, x = Math.round(hx), y = Math.round(hy);
    const P = (dx, dy, w, h, c) => R(ctx, dir > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, c);
    P(-5, -7, 12, 12, 'd'); P(-4, -6, 10, 10, 'g'); P(4, -1, 6, 5, 'd'); P(5, 0, 5, 3, 'm'); P(7, 2, 3, 1, 'w');
    P(-1, -5, 3, 3, 'd'); P(0, -4, 2, 2, 'w'); P(1, -3, 1, 1, 'r');                                         // око
    P(-3, -12, 2, 6, 'o'); P(1, -12, 2, 6, 'o'); P(-3, -13, 1, 1, 'y');                                      // роги
    P(-8, -2, 4, 8, 'r'); P(-10, 2, 3, 4, 'r');                                                              // грива
    P(9, 3, 7, 1, 'y'); P(10, 5, 6, 1, 'y');                                                                 // вуса
    if (Math.floor(t * 3) % 2) B.spark(x + dir * 18, y + 6, 'y', 'w');
    return pts;
  }
  B.list[8] = {
    id: 'japan',
    behind(G) {
      const { t, p, A } = G;
      if (G.mode === 'rise' && p >= A - 0.02 && p < G.C + 0.04) {                          // мотузка-сімена з білими папірцями й ліхтариками по лінії кладки
        const y = G.top - 6, x0 = shop.x - 4, w = shop.w + 8;
        for (let i = 0; i < w; i++) { const sag = Math.round(3 * Math.sin(i / w * Math.PI)); R(ctx, x0 + i, y + sag, 1, 2, i % 3 ? 'c' : 'b'); }
        for (let k = 0; k < Math.floor(w / 14); k++) { const x = x0 + 7 + k * 14, sag = Math.round(3 * Math.sin((k * 14 + 7) / w * Math.PI)); R(ctx, x, y + sag + 2, 3, 3, 'w'); R(ctx, x + 1, y + sag + 5, 3, 3, 'w'); R(ctx, x, y + sag + 8, 3, 2, 'w'); }
        const nL = Math.floor(w / 46); for (let k = 0; k < nL; k++) { const x = x0 + 23 + k * 46; lantern(x, y + 3, t, k, false); }
      }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, tA = A * G.b.dur, pileX = x0 - 26;
      // кошик із паперовими плитками й бамбук
      if (p > A - 0.04 && G.q < 0.2) {
        const n = Math.max(0, 8 - Math.round(G.wp * 7));
        R(ctx, pileX - 8, gy - 12, 18, 12, 'd'); R(ctx, pileX - 7, gy - 11, 16, 10, 'l'); for (let i = 0; i < 4; i++) R(ctx, pileX - 7 + i * 4, gy - 11, 1, 10, 'b');
        for (let i = 0; i < n; i++) { R(ctx, pileX - 6 + (i % 4) * 4, gy - 15 - Math.floor(i / 4) * 3, 4, 3, 'd'); R(ctx, pileX - 5 + (i % 4) * 4, gy - 14 - Math.floor(i / 4) * 3, 2, 2, i % 3 ? 'w' : 'q'); }
        for (let i = 0; i < 3; i++) { R(ctx, x1 + 14 + i * 4, gy - 30, 2, 30, 'd'); R(ctx, x1 + 15 + i * 4, gy - 30, 1, 30, 'g'); for (let k = 0; k < 4; k++) R(ctx, x1 + 14 + i * 4, gy - 8 - k * 7, 2, 1, 'G'); }
      }
      // журавлики
      if (p >= A * 0.3) for (let i = 0; i < 6; i++) {
        const T = 3.6, u = (((t - tA) / T + i / 6) % 1 + 1) % 1, tx = lerp(x0 + 18, x1 - 18, (i + 0.5) / 6), ty = G.top - 14, c = ['w', 'r', 'q', 'w', 'p', 'w'][i];
        let x, y, dir = 1, tile = true;
        if (u < 0.45) { const s = smooth01(u / 0.45); x = lerp(pileX, tx, s); y = lerp(gy - 22, ty, s) - Math.sin(Math.PI * s) * 26; dir = tx > pileX ? 1 : -1; }
        else if (u < 0.58) { x = tx; y = ty + Math.sin(t * 6 + i) * 1.5; tile = u < 0.52; dir = 1; if (u > 0.5 && u < 0.56) B.spark(tx, G.top - 2, 'q', 'w'); }
        else { const s = smooth01((u - 0.58) / 0.42); x = lerp(tx, pileX, s); y = lerp(ty, gy - 22, s) - Math.sin(Math.PI * s) * 14; dir = -1; tile = false; }
        if (p < A) { const s = smooth01(c01(p / A)); x = lerp(i % 2 ? visR() + 40 : visL() - 40, x, s); y = lerp(top - 120 - i * 8, y, s); }
        if (G.q > 0.15) { const s = smooth01(c01((G.q - 0.15) / 0.6)); y -= s * (120 + i * 10); x += (i - 2.5) * 16 * s; }
        crane(x, y, t, dir, c, { tile, ph: i });
      }
      // тануки-теслі на лінії кладки
      if (p >= A * 0.8 && G.q < 0.25) {
        [x0 + 40, x1 - 40].forEach((tx, i) => { const lift = G.q > 0.1 ? (G.q - 0.1) * 80 : 0; tanuki(tx, G.top - 2 - lift, t, i * 0.5); if (Math.floor(t * 4 + i * 0.5) % 2 === 0 && G.q === 0) B.spark(tx + 12, G.top - 2, 'y', 'w'); });
      }
      // дракон
      dragon(G, t);
      // пелюстки сакури
      for (let i = 0; i < 26; i++) { const u = ((t * 0.12 + rnd(i * 1.9)) % 1), px = visL() + rnd(i * 2.7) * (visR() - visL()) + Math.sin(u * 14 + i) * 10, py = -view.offY + u * (G.base + view.offY); ctx.globalAlpha = 0.85; R(ctx, Math.round(px), Math.round(py), 2, 1, i % 3 ? 'q' : 'p'); R(ctx, Math.round(px) + 1, Math.round(py) + 1, 1, 1, 'w'); ctx.globalAlpha = 1; }
    },
    finale(G) {
      const { t, q } = G;
      // ліхтарики вздовж даху, великі й сяючі
      if (q > 0.05) for (let k = 0; k < 6; k++) lantern(shop.x + 20 + k * (shop.w - 40) / 5, G.roof + 8 + Math.sin(k * 1.9) * 2, t, k, true);
      // ханабі: три салюти
      for (let f = 0; f < 3; f++) { const u = c01((q - 0.15 - f * 0.12) / 0.45); if (u <= 0 || u >= 1) continue; const cx = G.cx + (f - 1) * 90, cy = G.roof - 60 - (f % 2) * 24, cols = [['y', 'o'], ['f', 'q'], ['N', 'w']][f]; ctx.globalAlpha = 1 - u * u; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283, rr = 6 + u * 38; R(ctx, Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr + u * u * 14), 2, 2, cols[i % 2]); if (i % 2) R(ctx, Math.round(cx + Math.cos(a) * rr * 0.6), Math.round(cy + Math.sin(a) * rr * 0.6 + u * u * 10), 1, 1, 'w'); } ctx.globalAlpha = 1; }
      // червона печатка-ханко
      if (q > 0.45) { const a = c01((q - 0.45) / 0.15), sx = shop.x + shop.w - 18, sy = G.roof + 26; if (a > 0) { const s = 12 - Math.round((1 - a) * 4); R(ctx, sx, sy, s, s, 'd'); R(ctx, sx + 1, sy + 1, s - 2, s - 2, 'r'); R(ctx, sx + 3, sy + 3, s - 6, 1, 'w'); R(ctx, sx + 3, sy + s - 4, s - 6, 1, 'w'); R(ctx, sx + (s >> 1), sy + 3, 1, s - 6, 'w'); R(ctx, sx + 3, sy + 3, 1, s - 6, 'w'); R(ctx, sx + s - 4, sy + 3, 1, s - 6, 'w'); } }
      if (q > 0.1) for (let i = 0; i < 20; i++) { const u = ((q * 1.4 + i / 20) % 1), px = shop.x + rnd(i * 4) * shop.w + Math.sin(u * 9 + i) * 8, py = G.roof - 10 + u * 120; R(ctx, Math.round(px), Math.round(py), 2, 2, ['q', 'p', 'w'][i % 3]); }
      B.bunting(G, ['r', 'w', 'q', 'y', 'G', 'p']);
    }
  };
})();

