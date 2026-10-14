//#part 278_b_build_themes.js
// Тема 2 — Диско: будинок «танцює» — росте кроками в ритм, диско-куля, прожектори, танцмайданчик, танцюристи на роликах
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  const BPM_T = 0.5;                                              // одна доля = 0,5 с
  const FLOOR = ['f', 'y', 'N', 'o', 'u', 'm'];
  function dancer(x, y, t, ph, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const beat = Math.floor(t / BPM_T + ph) % 2, skin = ['c', 'l', 'b'][o.skin | 0], shirt = o.shirt || 'f', pants = o.pants || 'n';
    const bob = (Math.floor(t / BPM_T * 2 + ph) % 2) ? 0 : 1; y += bob;
    disc(ctx, x, y - 14, 5, 'd'); disc(ctx, x, y - 14, 4, 'k'); R(ctx, x - 2, y - 17, 3, 1, 'b');          // афро
    R(ctx, x - 3, y - 13, 7, 6, 'd'); R(ctx, x - 2, y - 12, 5, 4, skin); R(ctx, x - 3, y - 11, 7, 1, 'k'); R(ctx, x - 2, y - 11, 1, 1, 'y'); R(ctx, x + 1, y - 9, 2, 1, 'd');   // обличчя й окуляри
    R(ctx, x - 4, y - 7, 9, 7, 'd'); R(ctx, x - 3, y - 6, 7, 5, shirt); R(ctx, x - 1, y - 6, 3, 2, 'w'); R(ctx, x, y - 6, 1, 2, skin);   // сорочка з відкритим коміром
    // руки: одна вгору (вказує в небо), інша на стегні — по долях міняються
    const up = beat ? 1 : -1;
    lineG(ctx, x + up * 4, y - 5, x + up * 9, y - 17, 'd'); lineG(ctx, x + up * 5, y - 5, x + up * 10, y - 17, skin); R(ctx, x + up * 10 - 1, y - 18, 2, 2, skin);
    R(ctx, x - up * 6, y - 4, 3, 2, 'd'); R(ctx, x - up * 5, y - 4, 2, 1, skin);
    // кльош: штани розширюються донизу
    R(ctx, x - 4, y, 9, 3, 'd'); R(ctx, x - 3, y, 7, 3, pants);
    R(ctx, x - 6, y + 3, 5, 5, 'd'); R(ctx, x - 5, y + 3, 3, 5, pants); R(ctx, x + 2, y + 3, 5, 5, 'd'); R(ctx, x + 3, y + 3, 3, 5, pants);
    R(ctx, x - 6, y + 8, 5, 1, 'Y'); R(ctx, x + 2, y + 8, 5, 1, 'Y'); R(ctx, x - 5, y + 9, 1, 1, 'd'); R(ctx, x - 2, y + 9, 1, 1, 'd'); R(ctx, x + 3, y + 9, 1, 1, 'd'); R(ctx, x + 6, y + 9, 1, 1, 'd');   // ролики
  }
  function discoBall(x, y, t, r) {
    x = Math.round(x); y = Math.round(y);
    R(ctx, x, -view.offY - 6, 1, y - r - (-view.offY - 6), 'd');                      // ланцюг
    disc(ctx, x, y, r + 1, 'd'); disc(ctx, x, y, r, 'Y');
    const rot = t * 2.2;
    for (let j = -r + 1; j < r; j += 3) for (let i = -r + 1; i < r; i += 3) {
      const d = Math.hypot(i, j); if (d > r - 0.5) continue;
      const lon = Math.asin(Math.max(-1, Math.min(1, i / r))) + rot, on = (Math.floor((lon + 10) / 0.5) + Math.floor((j + r) / 3)) % 3;
      R(ctx, x + i, y + j, 2, 2, on === 0 ? 'w' : on === 1 ? 'S' : 'e');
    }
    R(ctx, x - r + 2, y - r + 2, 3, 2, 'w'); R(ctx, x - 1, y - r - 4, 3, 3, 'e');
    if (Math.floor(t * 8) % 2) B.spark(x - r - 2, y - r + 1, 'y', 'w', true); else B.spark(x + r + 3, y + 3, 'f', 'w');
  }
  function beam(x, y, ang, len, w, col, a) {                   // конус прожектора
    ctx.globalAlpha = a;
    for (let r = 4; r < len; r += 2) { const hw = 1 + r * w; R(ctx, Math.round(x + Math.sin(ang) * r - hw), Math.round(y + Math.cos(ang) * r), Math.round(hw * 2), 2, col); }
    ctx.globalAlpha = 1;
  }
  function speaker(x, y, t) {
    x = Math.round(x); y = Math.round(y); const pulse = (Math.floor(t / BPM_T * 2) % 2) ? 1 : 0;
    R(ctx, x - 8, y - 26, 16, 26, 'd'); R(ctx, x - 7, y - 25, 14, 24, 'b'); R(ctx, x - 7, y - 25, 14, 1, 'l');
    disc(ctx, x, y - 8, 5 + pulse, 'd'); disc(ctx, x, y - 8, 3 + pulse, 'k'); R(ctx, x, y - 8, 1, 1, 'e');
    disc(ctx, x, y - 19, 3, 'd'); disc(ctx, x, y - 19, 2, 'k'); R(ctx, x, y - 19, 1, 1, 'Y');
  }
  B.list[2] = {
    id: 'disco',
    rise(prog) { const n = 9, s = prog * n, k = Math.min(n - 1, Math.floor(s)), f = s - k, e = 1 - Math.pow(1 - Math.min(1, f * 2.2), 3), over = Math.sin(Math.min(1, f * 2.2) * Math.PI) * 0.18; return Math.min(1, (k + e + over * (f < 0.5 ? 1 : 0)) / n); },
    behind(G) {
      const { t, p, A, x0, x1, gy, base } = G, beat = Math.floor(t / BPM_T);
      // танцмайданчик на бруківці біля магазину
      if (p > 0.04 && G.q < 0.9) {
        const a = Math.min(1, (p - 0.04) / 0.1) * (G.q > 0.6 ? 1 - (G.q - 0.6) / 0.3 : 1);
        ctx.globalAlpha = 0.55 * a;
        const fx0 = Math.round(x0 - 10), fw = Math.round(x1 - x0 + 20);
        for (let i = 0; i < fw / 8; i++) for (let j = 0; j < 2; j++) R(ctx, fx0 + i * 8, base + 3 + j * 4, 8, 4, FLOOR[(i + j + beat) % FLOOR.length]);
        ctx.globalAlpha = 1;
      }
      if (G.mode === 'rise' && p >= A - 0.02 && p < G.C + 0.02) {                // смуга «вогнів» на лінії кладки
        const w = shop.w + 8, y = G.top - 3;
        for (let i = 0; i < w / 6; i++) { const c = FLOOR[(i + beat) % FLOOR.length]; R(ctx, shop.x - 4 + i * 6, y, 5, 3, 'd'); R(ctx, shop.x - 3 + i * 6, y + 1, 3, 1, c); }
        ctx.globalAlpha = 0.25; R(ctx, shop.x - 4, y - 2, w, 2, 'w'); ctx.globalAlpha = 1;
      }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, beat = Math.floor(t / BPM_T);
      // куля й прожектори
      let ball = Math.min(top - 78, base - 175); const bx = G.cx;
      if (p < A) ball = lerp(-view.offY - 20, ball, smooth01(c01(p / A)));
      if (G.q > 0.25) ball -= smooth01(c01((G.q - 0.25) / 0.4)) * 60;
      const sw = Math.sin(t * 1.4);
      if (G.q < 0.9) {
        const colors = ['f', 'y', 'N', 'o'], on = c01(p / 0.1);
        for (let i = 0; i < 4; i++) beam(bx, ball + 4, (i - 1.5) * 0.45 + Math.sin(t * 1.3 + i * 1.7) * 0.4, 330, 0.07, colors[i], 0.16 * on);
      }
      if (G.q > 0.18 && G.q < 0.22) { for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; B.spark(bx + Math.cos(a) * 26, ball + Math.sin(a) * 26, i % 3 ? 'y' : 'f', 'w', i % 2); } }
      if (!(G.q > 0.2)) discoBall(bx, ball, t, 13);
      else for (let i = 0; i < 30; i++) { const u = c01((G.q - 0.2) / 0.5), a = rnd(i) * 6.283, sp = 20 + rnd(i * 3) * 110; B.spark(bx + Math.cos(a) * sp * u, ball + Math.sin(a) * sp * u + 40 * u * u, ['y', 'f', 'N', 'w'][i % 4], 'w', i % 5 === 0); }
      // колонки по краях
      [x0 - 26, x1 + 26].forEach(sx => speaker(sx, gy - 2, t));
      // танцюристи на ґрунті
      const cols = [['f', 'n', 0], ['y', 'u', 1], ['N', 'k', 2], ['o', 'P', 1], ['m', 'n', 0], ['f', 'u', 2]];
      const n = 6;
      for (let i = 0; i < n; i++) {
        let x = lerp(x0 + 6, x1 - 6, (i + 0.5) / n) + Math.sin(t * 0.9 + i * 1.3) * 5, y = gy - 4;
        if (p < A) { const s = smooth01(c01((p - 0.02 * i) / (A - 0.02 * i))); x = lerp(i % 2 ? visR() + 40 : visL() - 40, x, s); }
        if (p > 0.03) dancer(x, y, t, i * 0.37, { shirt: cols[i][0], pants: cols[i][1], skin: cols[i][2] });
      }
      // трійко «серферів» на верхівці стіни
      for (let i = 0; i < 3 && p >= A && G.q < 0.3; i++) {
        const x = lerp(x0 + 40, x1 - 40, (i + 0.5) / 3) + Math.sin(t * 1.2 + i) * 8;
        dancer(x, G.top - 12, t, i * 0.5 + 0.2, { shirt: ['y', 'N', 'f'][i], pants: 'P', skin: i % 3 });
      }
      // прожектор на кожному кроці: «кільце» з-під нової лінії
      if (p >= A && p < G.C) { const k = Math.floor((G.prog * 9)), f = G.prog * 9 - k; if (f < 0.35) { ctx.globalAlpha = 0.5 * (1 - f / 0.35); for (let i = 0; i < 12; i++) { const a = i / 12 * 3.14159; R(ctx, Math.round(G.cx + Math.cos(a) * (40 + f * 160)), Math.round(G.top - Math.sin(a) * (10 + f * 40)), 3, 2, FLOOR[i % 6]); } ctx.globalAlpha = 1; } }
    },
    finale(G) {
      const { t, q } = G, a = c01(q / 0.2) * (1 - c01((q - 0.8) / 0.2));
      if (a > 0) { const txt = 'DISCO!', s = 2, w = (B.textW(txt)) * s; ctx.save(); ctx.translate(Math.round(G.cx - w / 2), Math.round(G.roof - 36 - Math.sin(t * 5) * 2)); ctx.scale(s, s); const cols = ['f', 'y', 'N', 'o']; B.text(0, 0, txt, cols[Math.floor(t * 6) % 4], 'k'); ctx.restore(); }
      if (q > 0.1) for (let i = 0; i < 9; i++) if (Math.sin(t * 7 + i * 1.7) > 0.2) B.spark(shop.x + rnd(i + 5) * shop.w, G.roof + rnd(i + 11) * 40, FLOOR[i % 6], 'w', i % 3 === 0);
      B.bunting(G, ['f', 'y', 'N', 'o', 'u', 'm']);
    }
  };
})();

// Тема 3 — Аркади: тетріс-фігури падають на лінію кладки, Пакман з привидами біжить по ній, табло SCORE/LEVEL, «LEVEL CLEAR!»
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  const SHAPES = [                                              // клітинки (x,y) для 4 фігур у 4 поворотах задаємо матрицями
    { c: 'N', m: [[0, 0], [1, 0], [2, 0], [3, 0]] },            // I
    { c: 'y', m: [[0, 0], [1, 0], [0, 1], [1, 1]] },            // O
    { c: 'v', m: [[0, 0], [1, 0], [2, 0], [1, 1]] },            // T
    { c: 'o', m: [[0, 0], [1, 0], [2, 0], [0, 1]] },            // L
    { c: 'n', m: [[0, 0], [1, 0], [2, 0], [2, 1]] },            // J
    { c: 'g', m: [[1, 0], [2, 0], [0, 1], [1, 1]] },            // S
    { c: 'r', m: [[0, 0], [1, 0], [1, 1], [2, 1]] }             // Z
  ];
  const CELL = 7;
  function rot(m, r) { let o = m; for (let i = 0; i < r; i++) o = o.map(([x, y]) => [-y, x]); const mx = Math.min(...o.map(c => c[0])), my = Math.min(...o.map(c => c[1])); return o.map(([x, y]) => [x - mx, y - my]); }
  function cellBlock(x, y, c, flash) {
    R(ctx, x, y, CELL, CELL, 'd'); R(ctx, x + 1, y + 1, CELL - 2, CELL - 2, flash ? 'w' : c);
    if (!flash) { R(ctx, x + 1, y + 1, CELL - 2, 1, 'w'); R(ctx, x + 1, y + 1, 1, CELL - 2, 'w'); R(ctx, x + CELL - 2, y + 2, 1, CELL - 3, 'd'); R(ctx, x + 2, y + CELL - 2, CELL - 3, 1, 'd'); }
  }
  function piece(k, G, tA) {
    const T = 1.05, start = tA + k * 0.42, u = (G.t - start) / T;
    if (u < 0 || u > 1.3) return null;
    const sh = SHAPES[Math.floor(rnd(k * 3.1) * 7)], r = Math.floor(rnd(k * 7.7) * 4), m = rot(sh.m, r);
    const w = Math.max(...m.map(c => c[0])) + 1, h = Math.max(...m.map(c => c[1])) + 1;
    const col = Math.floor(rnd(k * 1.9 + 3) * ((G.x1 - G.x0 - 60) / CELL)), px = Math.round(G.x0 + 30 + col * CELL);
    const y0 = -view.offY - 40, yl = G.top - h * CELL;                      // сідає на лінію кладки
    const f = Math.min(1, u), y = Math.round(lerp(y0, yl, f * f * 0.6 + f * 0.4) / CELL) * CELL;
    return { m, c: sh.c, x: px, y: u >= 1 ? yl : y, landed: u >= 1, u, w, h };
  }
  function ghost(x, y, t, c, dir) {
    x = Math.round(x); y = Math.round(y);
    R(ctx, x - 6, y - 6, 13, 13, 'd'); R(ctx, x - 5, y - 8, 11, 2, 'd');
    R(ctx, x - 5, y - 7, 11, 13, c);
    const w = Math.floor(t * 8) % 2; for (let i = 0; i < 4; i++) { if ((i + w) % 2) R(ctx, x - 5 + i * 3, y + 6, 3, 2, 'd'); else R(ctx, x - 5 + i * 3, y + 6, 3, 2, c); }
    R(ctx, x - 4, y - 4, 4, 5, 'w'); R(ctx, x + 1, y - 4, 4, 5, 'w'); R(ctx, x - 3 + (dir > 0 ? 1 : 0), y - 2, 2, 3, 'n'); R(ctx, x + 2 + (dir > 0 ? 1 : 0), y - 2, 2, 3, 'n');
  }
  function pacman(x, y, t, dir) {
    x = Math.round(x); y = Math.round(y);
    const m = Math.abs(Math.sin(t * 14)), mouth = m * 5;
    for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) {
      const d = Math.hypot(i, j); if (d > 7.2) continue;
      const ang = Math.atan2(j, i * dir), open = Math.abs(ang) < 0.15 + m * 0.55 && i * dir > 0;
      if (open) continue;
      R(ctx, x + i, y + j, 1, 1, d > 6 ? 'd' : 'y');
    }
    R(ctx, x - dir * 1 + (dir > 0 ? 0 : 0), y - 4, 2, 2, 'k');
  }
  function coin(x, y, f) { x = Math.round(x); y = Math.round(y - f * 16); if (f > 0.9) return; R(ctx, x, y, 5, 5, 'd'); R(ctx, x + 1, y + 1, 3, 3, 'y'); R(ctx, x + 2, y + 1, 1, 3, 'h'); B.px(x + 5, y - 1, 'w'); }
  B.list[3] = {
    id: 'arcade',
    behind(G) {
      const { t, p, A } = G;
      if (G.mode === 'rise' && p >= A - 0.02 && p < G.C + 0.02) {                // лінія кладки — «підлога» гри
        const y = G.top; R(ctx, shop.x - 4, y - 2, shop.w + 8, 2, 'V'); R(ctx, shop.x - 4, y - 1, shop.w + 8, 1, 'N');
        for (let i = 0; i < shop.w + 8; i += 7) R(ctx, shop.x - 4 + i, y - 2, 1, 1, 'w');
      }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, tA = A * G.b.dur;
      // табло: SCORE і LEVEL
      { const sc = Math.round(c01(G.prog * 1 + (G.q > 0 ? 1 : 0)) * 12840), s = ('' + sc).padStart(6, '0');
        const hx = shop.x - 2, hy = Math.min(G.top - 52, base - 150);
        ctx.save(); ctx.translate(hx, hy); ctx.scale(2, 2);
        B.text(0, 0, 'SCORE', 'w', 'V'); B.text(0, 7, s, 'y', 'V');
        ctx.restore();
        ctx.save(); ctx.translate(shop.x + shop.w - 38, hy); ctx.scale(2, 2); B.text(0, 0, 'LEVEL', 'w', 'V'); B.text(0, 7, '0' + state.shopLevel, 'N', 'V'); ctx.restore(); }
      // тетріс-фігури
      if (p >= A * 0.6 && G.q < 0.15) {
        const k0 = Math.max(0, Math.floor((G.t - tA) / 0.42) - 3);
        for (let k = k0; k < k0 + 8; k++) {
          const pc = piece(k, G, tA); if (!pc) continue;
          const flash = pc.landed && pc.u < 1.1 && Math.floor(pc.u * 40) % 2;
          if (pc.u > 1.18) { const f = (pc.u - 1.18) / 0.12; coin(pc.x + pc.w * CELL / 2, pc.y, f); continue; }
          pc.m.forEach(([cx, cy]) => { if (pc.landed && pc.u > 1.0 && pc.u < 1.18) { ctx.globalAlpha = 1 - (pc.u - 1) / 0.18; } cellBlock(pc.x + cx * CELL, pc.y + cy * CELL, pc.c, flash); ctx.globalAlpha = 1; });
          if (pc.landed && pc.u < 1.08) B.spark(pc.x + pc.w * CELL / 2, pc.y + pc.h * CELL + 2, 'y', 'w', true);
        }
      }
      // Пакман з привидами бігає по лінії кладки, їсть крапки
      if (p >= A - 0.01 && G.q < 0.15) {
        const span = x1 - x0 - 16, tt = (t - tA) / 1.9, ph = tt - Math.floor(tt), dir = (Math.floor(tt) % 2 === 0) ? 1 : -1, px = dir > 0 ? x0 + 8 + ph * span : x1 - 8 - ph * span, py = G.top - 16;
        for (let i = 0; i < span / 9; i++) { const dx = x0 + 8 + i * 9; const eaten = dir > 0 ? dx < px : dx > px; if (!eaten) R(ctx, dx, py, 2, 2, 'w'); }
        ['r', 'f', 'N', 'o'].forEach((c, gi) => ghost(px - dir * (22 + gi * 17), py + Math.sin(t * 8 + gi) * 1.5, t, c, dir));
        pacman(px, py, t, dir);
      }
      if (p < A) { const s = c01(p / A); R(ctx, shop.x, G.top - 6, Math.round(shop.w * s), 1, 'N'); }       // на прильоті — «завантаження» лінії
    },
    finale(G) {
      const { t, q } = G;
      const a = c01(q / 0.15) * (1 - c01((q - 0.85) / 0.15));
      if (a > 0 && Math.floor(t * 5) % 3 !== 2) {
        const txt = 'LEVEL CLEAR!', s = 3, w = B.textW(txt) * s; ctx.save(); ctx.translate(Math.round(G.cx - w / 2), Math.round(G.roof - 62)); ctx.scale(s, s); B.text(0, 0, txt, Math.floor(t * 4) % 2 ? 'y' : 'w', 'V'); ctx.restore();
      }
      if (q > 0.1) for (let i = 0; i < 6; i++) { const u = ((q * 2 + i / 6) % 1); const fx = shop.x + rnd(i + 3) * shop.w, fy = G.roof - 30 + u * 70; const c = ['y', 'N', 'f', 'g', 'o', 'v'][i]; R(ctx, Math.round(fx), Math.round(fy), 4, 4, 'd'); R(ctx, Math.round(fx) + 1, Math.round(fy) + 1, 2, 2, c); }
      if (q > 0.05 && q < 0.6) for (let i = 0; i < 4; i++) { const cx = shop.x + (i + 0.5) / 4 * shop.w, cy = G.roof - 20 - rnd(i) * 30, u = c01((q - 0.05 - i * 0.04) / 0.2); if (u > 0 && u < 1) for (let k = 0; k < 10; k++) { const a2 = k / 10 * 6.283, rr = u * 22; R(ctx, Math.round(cx + Math.cos(a2) * rr), Math.round(cy + Math.sin(a2) * rr), 2, 2, ['y', 'f', 'N', 'g'][i]); } }
      B.bunting(G, ['N', 'y', 'f', 'g', 'o', 'v']);
    }
  };
})();

// Тема 4 — Інтернет: хмарний сервер «качає» будинок пакетами даних, дрони доставляють посилки, курсор клікає, вікно «Завантаження N%»
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  function cloud(x, y, t) {
    x = Math.round(x); y = Math.round(y);
    [[-22, 4, 9], [-10, -3, 12], [6, -6, 13], [20, 0, 10], [30, 6, 7], [0, 6, 11], [-30, 8, 6]].forEach(([dx, dy, r]) => disc(ctx, x + dx, y + dy, r + 1, 'd'));
    [[-22, 4, 9], [-10, -3, 12], [6, -6, 13], [20, 0, 10], [30, 6, 7], [0, 6, 11], [-30, 8, 6]].forEach(([dx, dy, r]) => disc(ctx, x + dx, y + dy, r, 'w'));
    R(ctx, x - 32, y + 8, 66, 5, 'S'); R(ctx, x - 24, y - 12, 18, 2, 'w');
    R(ctx, x - 3, y - 12, 7, 11, 'n'); R(ctx, x - 2, y - 11, 5, 9, 'N'); for (let i = 0; i < 5; i++) R(ctx, x - 6 + i, y - 1 + i, 13 - i * 2, 1, 'n');   // стрілка вниз
    R(ctx, x - 14, y + 4, 2, 2, Math.floor(t * 6) % 2 ? 'g' : 'G'); R(ctx, x + 12, y + 4, 2, 2, Math.floor(t * 6 + 1) % 2 ? 'r' : 'G');
  }
  function win(x, y, w, h, title) {
    x = Math.round(x); y = Math.round(y);
    R(ctx, x, y, w, h, 'd'); R(ctx, x + 1, y + 1, w - 2, 7, 'n'); R(ctx, x + 1, y + 8, w - 2, h - 9, 'w');
    R(ctx, x + w - 8, y + 3, 2, 2, 'r'); R(ctx, x + w - 12, y + 3, 2, 2, 'y'); R(ctx, x + w - 16, y + 3, 2, 2, 'g');
    if (title) B.text(x + 4, y + 2, title, 'w');
  }
  function drone(x, y, t, ph, parcel) {
    x = Math.round(x); y = Math.round(y);
    const rf = Math.floor(t * 30 + ph) % 2;
    R(ctx, x - 6, y - 3, 13, 5, 'd'); R(ctx, x - 5, y - 2, 11, 3, 'Y'); R(ctx, x - 2, y - 1, 5, 2, 'n'); R(ctx, x, y - 1, 1, 1, 'N');
    [[-9, -5], [5, -5]].forEach(([dx, dy]) => { R(ctx, x + dx + 2, y + dy + 2, 1, 2, 'd'); R(ctx, x + dx - (rf ? 1 : 0), y + dy + 1, 6 + (rf ? 2 : 0), 1, 'e'); });
    R(ctx, x - 5, y + 2, 1, 2, 'd'); R(ctx, x + 5, y + 2, 1, 2, 'd');
    if (parcel) { R(ctx, x - 5, y + 4, 11, 9, 'd'); R(ctx, x - 4, y + 5, 9, 7, 'c'); R(ctx, x - 4, y + 5, 9, 1, 'y'); R(ctx, x - 1, y + 5, 3, 7, 'b'); R(ctx, x - 3, y + 9, 1, 1, 'k'); R(ctx, x + 3, y + 9, 1, 1, 'k'); R(ctx, x - 2, y + 11, 5, 1, 'k'); }
  }
  const CUR = ['#', '##', '###', '####', '#####', '######', '#######', '########', '#####.##', '###.##', '##..##', '#...###', '.....##'];
  function cursor(x, y) {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < CUR.length; j++) for (let i = 0; i < CUR[j].length; i++) if (CUR[j][i] === '#') { [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([a, b]) => R(ctx, x + i + a, y + j + b, 1, 1, 'k')); }
    for (let j = 0; j < CUR.length; j++) for (let i = 0; i < CUR[j].length; i++) if (CUR[j][i] === '#') R(ctx, x + i, y + j, 1, 1, 'w');
  }
  function heart(x, y, c) { x = Math.round(x); y = Math.round(y); R(ctx, x, y, 2, 2, c); R(ctx, x + 3, y, 2, 2, c); R(ctx, x, y + 1, 5, 2, c); R(ctx, x + 1, y + 3, 3, 1, c); R(ctx, x + 2, y + 4, 1, 1, c); }
  B.list[4] = {
    id: 'internet',
    behind(G) {
      const { t, p, A } = G;
      if (G.mode === 'rise' && p >= A - 0.02 && p < G.C + 0.02) {                       // лінія кладки — смужка прогресу «Завантаження»
        const y = G.top - 4, w = shop.w + 8; R(ctx, shop.x - 4, y, w, 4, 'd'); R(ctx, shop.x - 3, y + 1, w - 2, 2, 'S'); const fw = Math.round((w - 2) * G.prog); R(ctx, shop.x - 3, y + 1, fw, 2, 'N'); R(ctx, shop.x - 3 + Math.max(0, fw - 6), y + 1, 6, 2, 'w');
      }
      // потік даних із хмари на лінію кладки
      if (p >= 0.04 && G.q < 0.1) {
        const cy = Math.min(G.top - 96, G.base - 190), x = G.cx; ctx.globalAlpha = 0.16; R(ctx, x - 10, cy + 14, 20, Math.max(0, G.top - cy - 14), 'N'); ctx.globalAlpha = 1;
        for (let i = 0; i < 16; i++) { const u = ((t * 0.9 + i / 16) % 1), py = lerp(cy + 14, G.top - 4, u), px = x - 8 + rnd(i * 3.3) * 16; const k = i % 4; if (k === 0) { R(ctx, Math.round(px), Math.round(py), 5, 4, 'd'); R(ctx, Math.round(px) + 1, Math.round(py) + 1, 3, 2, 'w'); R(ctx, Math.round(px) + 1, Math.round(py) + 1, 3, 1, 'n'); } else if (k === 1) { R(ctx, Math.round(px), Math.round(py), 3, 3, 'N'); } else if (k === 2) { R(ctx, Math.round(px), Math.round(py), 3, 3, 'w'); R(ctx, Math.round(px) + 1, Math.round(py) + 1, 1, 1, 'n'); } else B.text(px, py, (Math.floor(t * 6 + i) % 2) + '', 'N'); }
      }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, tA = A * G.b.dur;
      // хмара
      let cy = Math.min(top - 96, base - 190), cx = G.cx + Math.sin(t * 0.5) * 6;
      if (p < A) { cx = lerp(visR() + 60, cx, smooth01(c01(p / A))); }
      if (G.q > 0.4) cx = lerp(cx, visL() - 80, smooth01(c01((G.q - 0.4) / 0.5)));
      cloud(cx, cy, t);
      // вікно «Завантаження»
      if (p >= 0.04 && G.q < 0.35) {
        const wx = G.x0 - 78, wy = Math.min(G.top - 12, G.base - 90), pc = Math.round(c01(G.prog + (G.q > 0 ? 1 : 0)) * 100);
        win(wx, wy, 68, 34, 'LOADING');
        const bw = 56; R(ctx, wx + 6, wy + 20, bw, 6, 'd'); R(ctx, wx + 7, wy + 21, bw - 2, 4, 'S'); R(ctx, wx + 7, wy + 21, Math.round((bw - 2) * pc / 100), 4, 'N');
        B.text(wx + 6, wy + 12, pc + '%', 'n');
        R(ctx, wx + 52, wy + 11, 3, 3, Math.floor(t * 6) % 2 ? 'n' : 'S');
      }
      // дрони з посилками
      if (p >= A * 0.5 && G.q < 0.12) {
        for (let i = 0; i < 4; i++) {
          const T = 3.0, u = (((t - tA) / T + i * 0.25) % 1 + 1) % 1, side = i % 2 ? 1 : -1, tx = lerp(x0 + 24, x1 - 24, (i + 0.5) / 4), ty = G.top - 24 + Math.sin(t * 4 + i) * 2;
          let x, y, has = true;
          if (u < 0.45) { const s = smooth01(u / 0.45); x = lerp(side > 0 ? visR() + 30 : visL() - 30, tx, s); y = lerp(ty - 70, ty, s); }
          else if (u < 0.6) { x = tx; y = ty; has = u < 0.52; if (u >= 0.5 && u < 0.56) B.spark(tx, G.top - 2, 'N', 'w', true); }
          else { const s = smooth01((u - 0.6) / 0.4); x = lerp(tx, side > 0 ? visR() + 30 : visL() - 30, s); y = lerp(ty, ty - 70, s); has = false; }
          drone(x, y, t, i * 7, has);
        }
      }
      // курсор клікає по лінії кладки
      if (p >= A && G.q < 0.1) {
        const k = Math.floor((t - tA) / 1.4), u = ((t - tA) / 1.4) - k, nx = lerp(x0 + 20, x1 - 40, rnd(k * 1.7 + 2)), px = lerp(lerp(x0 + 20, x1 - 40, rnd((k - 1) * 1.7 + 2)), nx, smooth01(c01(u / 0.6))), py = G.top - 14 + Math.sin(u * 3) * 2;
        if (u > 0.62 && u < 0.9) { const f = (u - 0.62) / 0.28; ctx.globalAlpha = 1 - f; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; R(ctx, Math.round(px + Math.cos(a) * (3 + f * 14)), Math.round(py + 3 + Math.sin(a) * (3 + f * 8)), 1, 1, 'N'); } ctx.globalAlpha = 1; }
        cursor(px, py + (u > 0.62 && u < 0.7 ? 1 : 0));
      }
      if (p < A) { const wd = Math.round(shop.w * c01(p / A)); R(ctx, shop.x, G.base - 2, wd, 1, 'N'); }
    },
    finale(G) {
      const { t, q } = G;
      if (q > 0.04 && q < 0.8) {
        const wx = G.cx - 36, wy = G.roof - 16, a = c01((q - 0.04) / 0.1);
        if (a > 0) { win(wx, wy, 72, 36, 'DONE'); R(ctx, wx + 6, wy + 14, 12, 12, 'd'); R(ctx, wx + 7, wy + 15, 10, 10, 'g'); R(ctx, wx + 9, wy + 20, 2, 2, 'w'); R(ctx, wx + 11, wy + 22, 2, 2, 'w'); R(ctx, wx + 13, wy + 18, 2, 2, 'w'); R(ctx, wx + 15, wy + 16, 2, 2, 'w'); B.text(wx + 22, wy + 14, '100%', 'n'); R(ctx, wx + 22, wy + 24, 36, 9, 'd'); R(ctx, wx + 23, wy + 25, 34, 7, 'N'); B.text(wx + 31, wy + 26, 'OPEN', 'n'); cursor(wx + 36 + (q > 0.25 ? 0 : (0.25 - q) * 60), wy + 28 + (q > 0.25 ? 0 : (0.25 - q) * 30)); }
      }
      if (q > 0.25) for (let i = 0; i < 14; i++) { const u = c01((q - 0.25 - i * 0.02) / 0.6); if (u <= 0 || u >= 1) continue; const a = -2.2 + i / 14 * 1.5 + rnd(i) * 0.2; heart(G.cx + Math.cos(a) * 120 * u * (i % 2 ? 1 : -1) * 0.6, G.roof + 10 - u * 110 + 40 * u * u, ['f', 'r', 'p', 'N'][i % 4]); }
      if (q > 0.2) { const ph = Math.floor(t * 4) % 4, rx = G.cx, ry = G.roof - 4; for (let k = 0; k < 3; k++) { if (k > ph) break; const r = 10 + k * 9; for (let a = -0.75; a <= 0.75; a += 0.1) R(ctx, Math.round(rx + Math.sin(a) * r), Math.round(ry - Math.cos(a) * r - 18), 2, 2, 'N'); } R(ctx, G.cx - 1, G.roof - 22, 3, 3, 'N'); }
      B.bunting(G, ['N', 'n', 'w', 'S', 'f', 'y']);
    }
  };
})();

