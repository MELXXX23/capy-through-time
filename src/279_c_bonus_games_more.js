//#part 279_c_bonus_games_more.js
/* =====================================================================
   БОНУС-ІГРИ ПІД ЕПОХИ (продовження 279_bonus_games.js): 0 Фреска, 1 Джубокс, 3 Клешня, 5 Сортування, 6 Кристали, 7 Нічна траса.
   Ядро (mgMake, mgBars, mgPrize, перезарядка 12 год, приз-скін) — у 279_bonus_games.js. Полотно 192×120; смужки часу/рахунку займають y 0…13.
   Приз дають лише за goalP (скін); goalN — лише для тексту «майже».
   ===================================================================== */

/* ---- епоха 0 (Відродження): «Фреска» — повтори порядок спалахів фарби, і фреска оживає ---- */
(function () {
  const COLS = 8, ROWS = 3, TW = 22, TH = 16, X0 = 8, Y0 = 17, PX = 46, PY = 74;
  const POT = ['r', 'n', 'g', 'h'];
  const o = {
    id: 'fresco', dur: 36, goalP: 29, goalN: 17,      /* р. 68: на 20% важче (було 24/14) */
    k: { title: 'mgFrescoTitle', sub: 'mgFrescoSub', start: 'mgFrescoStart', done: 'mgFrescoDone' },
    init() {
      const seq = []; for (let i = 0; i < 3; i++) seq.push(Math.floor(Math.random() * 4));
      return { seq, mode: 'show', st: 0, pos: 0, credit: 0, fl: [0, 0, 0, 0], tiles: [], bad: 0 };
    },
    tick(G, dt) {
      const S = G.s;
      for (let i = 0; i < 4; i++) if (S.fl[i] > 0) S.fl[i] -= dt;
      if (S.bad > 0) S.bad -= dt;
      S.st += dt;
      if (S.mode === 'show') {
        if (S.st >= S.seq.length * 0.6 + 0.3) { S.mode = 'input'; S.pos = 0; S.st = 0; }
      } else if (S.mode === 'ok') {
        if (S.st > 0.45) { S.seq.push(Math.floor(Math.random() * 4)); S.mode = 'show'; S.st = 0; }
      } else if (S.mode === 'retry') {
        if (S.st > 0.7) { S.mode = 'show'; S.st = 0; }
      }
    },
    tap(G, lx, ly) {
      const S = G.s; if (S.mode !== 'input' || ly < 58) return;
      const i = Math.floor((lx - 4) / PX); if (i < 0 || i > 3) return;
      S.fl[i] = 0.25;
      if (S.seq[S.pos] === i) {
        if (S.pos >= S.credit) { S.credit = S.pos + 1; G.score++; S.tiles.push(POT[i]); playSfx('wheelTick'); }
        S.pos++;
        if (S.pos >= S.seq.length) { S.mode = 'ok'; S.st = 0; S.credit = 0; }
      } else { S.bad = 0.5; S.mode = 'retry'; S.st = 0; S.pos = 0; S.credit = 0; playSfx('pip'); }
    },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#c9b88e'); R(g, 0, 0, W, 14, '#a8946a'); R(g, 0, 70, W, 50, '#8c7650'); R(g, 0, 70, W, 1, '#6a5638');
      // фреска (рамка + тиньк, що «оживає» кольорами)
      R(g, 5, 14, 182, 54, '#7a4f35'); R(g, 6, 15, 180, 52, '#f2b84b');
      for (let i = 0; i < COLS * ROWS; i++) {
        const c = i % COLS, r = Math.floor(i / COLS), x = X0 + c * TW - 1, y = Y0 + r * TH - 1;
        const k = r % 2 ? COLS - 1 - c : c, idx = r * COLS + k;              // порядок «змійкою»
        const col = S.tiles[idx];
        if (col) {
          R(g, x, y, TW, TH, col); R(g, x, y, TW, 2, 'w'); R(g, x, y + TH - 2, TW, 2, 'd');
          g.globalAlpha = 0.25; R(g, x + 3, y + 4, 6, 3, 'w'); g.globalAlpha = 1;
        } else { R(g, x, y, TW, TH, '#e6d8b4'); R(g, x + (c * 5) % 9 + 3, y + 5, 8, 1, '#cbb98c'); R(g, x + 2, y + TH - 1, TW - 4, 1, '#cbb98c'); }
      }
      // баночки з фарбою
      let lit = -1;
      if (S.mode === 'show') { const idx = Math.floor(S.st / 0.6); if (idx < S.seq.length && S.st - idx * 0.6 < 0.4) lit = S.seq[idx]; }
      for (let i = 0; i < 4; i++) {
        const x = 8 + i * PX, on = lit === i || S.fl[i] > 0;
        if (on) { g.globalAlpha = 0.45; R(g, x - 3, 74, 46, 36, POT[i]); g.globalAlpha = 1; }
        R(g, x + 6, 88, 28, 22, '#a8703f'); R(g, x + 6, 88, 4, 22, '#c9945c'); R(g, x + 30, 88, 4, 22, '#7a4f35');
        R(g, x + 9, 82, 22, 7, '#a8703f'); R(g, x + 11, 79, 18, 5, POT[i]); R(g, x + 11, 79, 18, 1, 'w');
        R(g, x + 12, 96, 16, 8, on ? 'w' : POT[i]); R(g, x + 12, 96, 16, 1, 'k');
      }
      // підказка: скільки кроків у послідовності й скільки вже введено
      for (let i = 0; i < S.seq.length; i++) {
        const done = S.mode === 'input' ? i < S.pos : S.mode === 'ok';
        R(g, 96 - S.seq.length * 4 + i * 8, 113, 6, 4, done ? 'g' : S.mode === 'show' ? '#f2b84b' : '#6a5638');
      }
      if (S.bad > 0) { g.globalAlpha = 0.35 * Math.min(1, S.bad * 3); R(g, 0, 14, W, 106, 'r'); g.globalAlpha = 1; }
      if (show) { g.globalAlpha = 0.45; R(g, 0, 70, W, 50, '#3a2a18'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 92);
      mgBars(g, o, G);
    }
  };
  mgMake(0, o);
})();

/* ---- епоха 1 (Ретро): «Джубокс» — тапай колонку, коли платівка на лінії ---- */
(function () {
  const CX = [53, 96, 139], LINE = 100, COL = ['r', 'y', 'T'];
  const o = {
    id: 'jukebox', dur: 16, goalP: 24, goalN: 14,      /* р. 68: на 20% важче (було 20/12) */
    k: { title: 'mgJukeTitle', sub: 'mgJukeSub', start: 'mgJukeStart', done: 'mgJukeDone' },
    init() { return { notes: [], sp: 0.35, last: -1, fx: [], bad: [0, 0, 0] }; },
    tick(G, dt) {
      const S = G.s, k = 1 - G.left / o.dur;
      S.fx.forEach(f => { f.t += dt; }); S.fx = S.fx.filter(f => f.t < 0.3);
      for (let i = 0; i < 3; i++) if (S.bad[i] > 0) S.bad[i] -= dt;
      S.sp -= dt;
      if (S.sp <= 0) {
        let l = Math.floor(Math.random() * 3); if (l === S.last) l = (l + 1 + Math.floor(Math.random() * 2)) % 3;
        S.last = l; S.notes.push({ l, y: 12 }); S.sp = 0.5 - 0.15 * k + Math.random() * 0.1;
      }
      const v = 78 + 28 * k;
      S.notes.forEach(n => { n.y += v * dt; });
      S.notes = S.notes.filter(n => n.y < 120);
    },
    tap(G, lx) {
      const S = G.s, l = Math.max(0, Math.min(2, Math.floor((lx - 32) / 43)));
      let bi = -1, bd = 14;
      S.notes.forEach((n, i) => { const d = Math.abs(n.y - LINE); if (n.l === l && d <= bd) { bd = d; bi = i; } });
      if (bi >= 0) { S.notes.splice(bi, 1); G.score++; S.fx.push({ l, t: 0 }); playSfx('wheelTick'); }
      else { S.bad[l] = 0.25; G.score = Math.max(0, G.score - 1); }
    },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#0f2a33'); R(g, 4, 14, 184, 106, '#1a3d49'); R(g, 4, 14, 184, 2, '#f4748f'); R(g, 4, 118, 184, 2, '#f4748f');
      for (let i = 0; i < 3; i++) {
        const x = CX[i] - 20;
        R(g, x, 16, 40, 88, i % 2 ? '#15323d' : '#183846');
        R(g, x, 16, 1, 88, '#2a5a6a'); R(g, x + 39, 16, 1, 88, '#2a5a6a');
        g.globalAlpha = 0.25 + 0.15 * Math.sin(T * 5 + i); R(g, x + 2, LINE - 2, 36, 4, COL[i]); g.globalAlpha = 1;
      }
      R(g, 8, LINE, 176, 1, 'w');
      S.notes.forEach(n => {
        const x = CX[n.l], y = Math.round(n.y);
        disc(g, x, y, 9, 'k'); disc(g, x, y, 6, COL[n.l]); disc(g, x, y, 2, 'w');
        R(g, x - 7, y - 5, 2, 2, 'w');
      });
      for (let i = 0; i < 3; i++) {                                              // клавіші знизу
        const x = CX[i] - 18, hit = S.fx.some(f => f.l === i), bad = S.bad[i] > 0;
        R(g, x, 104, 36, 12, bad ? 'r' : hit ? 'w' : COL[i]); R(g, x, 104, 36, 2, 'w'); R(g, x, 114, 36, 2, 'd');
      }
      S.fx.forEach(f => {
        const u = f.t / 0.3; g.globalAlpha = 1 - u;
        for (let s = 0; s < 6; s++) { const an = s * 1.047; R(g, Math.round(CX[f.l] + Math.cos(an) * (6 + u * 14)), Math.round(LINE + Math.sin(an) * (4 + u * 10)), 2, 2, s % 2 ? 'y' : 'w'); }
        g.globalAlpha = 1;
      });
      if (show) { g.globalAlpha = 0.5; R(g, 4, 16, 184, 88, '#06141a'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 58);
      mgBars(g, o, G);
    }
  };
  mgMake(1, o);
})();

/* ---- епоха 3 (Аркади): «Клешня» — тапни, щоб опустити клешню точно над іграшкою ---- */
(function () {
  const FLOOR = 104, DOWN = 86, TOP = 26;
  const TC = ['f', 'y', 'T', 'o', 'p', 'm'];
  function freeX(toys) {
    for (let n = 0; n < 30; n++) {
      const x = 16 + Math.floor(Math.random() * 160);
      if (toys.every(t => Math.abs(t.x - x) >= 26)) return x;
    }
    return 16 + Math.floor(Math.random() * 160);
  }
  const o = {
    id: 'claw', dur: 20, goalP: 10, goalN: 5,      /* р. 68: на 20% важче (було 8/4) */
    k: { title: 'mgClawTitle', sub: 'mgClawSub', start: 'mgClawStart', done: 'mgClawDone' },
    init() {
      const toys = []; for (let i = 0; i < 5; i++) toys.push({ x: freeX(toys), c: TC[i % TC.length], kind: i % 3, carried: false });
      return { toys, cl: { x: 20, dir: 1, y: TOP, mode: 'sweep', hold: null }, fx: [] };
    },
    tick(G, dt) {
      const S = G.s, c = S.cl, k = 1 - G.left / o.dur;
      S.fx.forEach(f => { f.t += dt; }); S.fx = S.fx.filter(f => f.t < 0.4);
      if (c.mode === 'sweep') {
        c.x += c.dir * (58 + 28 * k) * dt;
        if (c.x > 178) { c.x = 178; c.dir = -1; } else if (c.x < 14) { c.x = 14; c.dir = 1; }
      } else if (c.mode === 'down') {
        c.y += 190 * dt;
        if (c.y >= DOWN) {
          c.y = DOWN; c.mode = 'up'; let bi = -1, bd = 8;
          S.toys.forEach((t, i) => { const d = Math.abs(t.x - c.x); if (d < bd) { bd = d; bi = i; } });
          if (bi >= 0) { c.hold = S.toys[bi]; c.hold.carried = true; }
        }
      } else if (c.mode === 'up') {
        c.y -= 150 * dt;
        if (c.y <= TOP) {
          c.y = TOP; c.mode = 'sweep';
          if (c.hold) {
            const t = c.hold, i = S.toys.indexOf(t);
            if (i >= 0) S.toys.splice(i, 1);
            S.fx.push({ x: t.x, y: TOP + 10, c: t.c, t: 0 }); G.score++; playSfx('wheelTick');
            S.toys.push({ x: freeX(S.toys), c: TC[Math.floor(Math.random() * TC.length)], kind: Math.floor(Math.random() * 3), carried: false });
            c.hold = null;
          }
        }
      }
    },
    tap(G) { const c = G.s.cl; if (c.mode === 'sweep') c.mode = 'down'; },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, c = S.cl, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#2a1a4a'); R(g, 3, 14, 186, 104, '#3a2466'); R(g, 3, 14, 186, 3, 'f'); R(g, 3, 115, 186, 3, 'T');
      R(g, 0, FLOOR, W, 11, '#56388a'); R(g, 0, FLOOR, W, 1, '#8a68c8');
      for (let i = 0; i < 12; i++) if (Math.sin(T * 4 + i * 1.3) > 0) R(g, 8 + i * 16, 18, 2, 2, TC[i % TC.length]);
      R(g, 3, 20, W - 6, 3, '#6a6a7a');                                         // рейка
      S.toys.forEach(t => {
        const y = t.carried ? c.y + 14 : FLOOR - 5, x = Math.round(t.x);
        if (t.kind === 0) { disc(g, x, y, 5, t.c); R(g, x - 2, y - 2, 2, 2, 'w'); }
        else if (t.kind === 1) { R(g, x - 5, y - 5, 10, 10, t.c); R(g, x - 5, y - 5, 10, 2, 'w'); R(g, x - 3, y, 2, 2, 'k'); R(g, x + 2, y, 2, 2, 'k'); }
        else { disc(g, x, y, 4, t.c); disc(g, x - 4, y - 5, 2, t.c); disc(g, x + 4, y - 5, 2, t.c); R(g, x - 2, y - 1, 1, 1, 'k'); R(g, x + 2, y - 1, 1, 1, 'k'); }
      });
      if (!show && c.mode === 'sweep') { g.globalAlpha = 0.18; R(g, Math.round(c.x), c.y + 12, 1, FLOOR - c.y - 12, 'w'); g.globalAlpha = 1; }
      const cx = Math.round(c.x), cy = Math.round(c.y), open = c.mode === 'sweep' || c.mode === 'down' ? 7 : 4;
      R(g, cx, 20, 1, cy - 20, '#cfc5b8');
      R(g, cx - 4, cy, 9, 4, 'e'); R(g, cx - 4, cy, 9, 1, 'E');
      R(g, cx - open, cy + 3, 2, 9, 'e'); R(g, cx + open - 1, cy + 3, 2, 9, 'e');
      R(g, cx - open + (open > 5 ? 0 : 1), cy + 11, 3, 2, 'E'); R(g, cx + open - 3 + (open > 5 ? 2 : 0), cy + 11, 3, 2, 'E');
      S.fx.forEach(f => { const u = f.t / 0.4; g.globalAlpha = 1 - u; for (let s = 0; s < 5; s++) R(g, Math.round(f.x + Math.cos(s * 1.26) * (3 + u * 14)), Math.round(f.y + Math.sin(s * 1.26) * (3 + u * 10) - u * 6), 2, 2, s % 2 ? 'y' : f.c); g.globalAlpha = 1; });
      if (show) { g.globalAlpha = 0.5; R(g, 3, 24, W - 6, 80, '#150a2a'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 62);
      mgBars(g, o, G);
    }
  };
  mgMake(3, o);
})();

/* ---- епоха 5 (Еко): «Сортування» — тап ліворуч: у зелений бак, праворуч: у синій ---- */
(function () {
  const BX = 84, BW = 24, END = 86;
  function item(g, type, cx, cy) {                                           // 0 — яблучний огризок (органіка), 1 — пляшка (пластик)
    if (type === 0) { disc(g, cx, cy + 1, 5, 'r'); R(g, cx - 1, cy - 7, 2, 4, 'd'); R(g, cx + 1, cy - 8, 4, 2, 'g'); R(g, cx - 3, cy - 1, 2, 2, 'w'); R(g, cx - 1, cy + 3, 3, 2, 'y'); }
    else { R(g, cx - 3, cy - 4, 7, 11, '#8ad8ff'); R(g, cx - 2, cy - 8, 5, 4, 'n'); R(g, cx - 1, cy - 3, 1, 8, 'w'); R(g, cx - 3, cy + 1, 7, 2, '#5aa8d8'); }
  }
  const o = {
    id: 'sort', dur: 16, goalP: 18, goalN: 11,      /* р. 68: на 20% важче (було 15/9) */
    k: { title: 'mgSortTitle', sub: 'mgSortSub', start: 'mgSortStart', done: 'mgSortDone' },
    init() { return { items: [], sp: 0.3, fx: [], bad: 0 }; },
    tick(G, dt) {
      const S = G.s, k = 1 - G.left / o.dur;
      S.fx.forEach(f => { f.t += dt; }); S.fx = S.fx.filter(f => f.t < 0.28);
      if (S.bad > 0) S.bad -= dt;
      S.sp -= dt;
      if (S.sp <= 0) { S.items.push({ y: 14, type: Math.random() < 0.5 ? 0 : 1 }); S.sp = 0.95 - 0.4 * k + Math.random() * 0.12; }
      const v = 44 + 30 * k;
      S.items.forEach(it => { it.y += v * dt; });
      while (S.items.length && S.items[0].y > END) { S.items.shift(); G.score = Math.max(0, G.score - 1); S.bad = 0.25; }
    },
    tap(G, lx) {
      const S = G.s, it = S.items[0]; if (!it) return;
      const side = lx < 96 ? 0 : 1; S.items.shift();
      S.fx.push({ y: it.y, side, type: it.type, t: 0 });
      if (it.type === side) { G.score++; playSfx('wheelTick'); } else { G.score = Math.max(0, G.score - 1); S.bad = 0.25; playSfx('pip'); }
    },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#bfe3a8'); R(g, 0, 14, W, 12, '#a8d8f0'); disc(g, 170, 22, 5, 'y');
      for (let i = 0; i < 5; i++) { R(g, 6 + i * 4 + (i % 2) * 2, 26, 3, 6 + i % 3, '#5fa860'); }
      R(g, BX, 14, BW, 74, '#4d4d58'); R(g, BX, 14, 1, 74, '#2a2a30'); R(g, BX + BW - 1, 14, 1, 74, '#2a2a30');
      const off = Math.floor(T * 30) % 8;
      for (let y = 6 + off; y < END + 2; y += 8) if (y >= 14) R(g, BX + 2, y, BW - 4, 1, '#62626e');
      [[10, 'g', 'G', 0], [132, 'n', 'z', 1]].forEach(([x, col, dk, ty]) => {
        R(g, x - 2, 88, 54, 5, dk); R(g, x, 93, 50, 26, col); R(g, x, 93, 50, 2, 'w'); R(g, x + 20, 99, 10, 10, 'w');
        g.globalAlpha = 0.9; item(g, ty, x + 25, 104); g.globalAlpha = 1;
      });
      R(g, 62, 70, 14, 2, 'y'); R(g, 62, 70, 3, 5, 'y'); R(g, 116, 70, 14, 2, 'y'); R(g, 127, 70, 3, 5, 'y');   // стрілки
      S.items.forEach((it, i) => item(g, it.type, 96, Math.round(it.y)));
      S.fx.forEach(f => {
        const u = f.t / 0.28, tx = f.side ? 157 : 35;
        item(g, f.type, Math.round(96 + (tx - 96) * u), Math.round(f.y + (100 - f.y) * u - Math.sin(u * Math.PI) * 8));
      });
      if (S.bad > 0) { g.globalAlpha = 0.3; R(g, 0, 14, W, 106, 'r'); g.globalAlpha = 1; }
      if (show) { g.globalAlpha = 0.45; R(g, BX, 14, BW, 74, '#1a2a1a'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 50);
      mgBars(g, o, G);
    }
  };
  mgMake(5, o);
})();

/* ---- епоха 6 (Космос): «Кристали» — лети під кристали й обминай астероїди ---- */
(function () {
  const o = {
    id: 'crystals', dur: 18, goalP: 17, goalN: 10,      /* р. 68: на 20% важче (було 14/8) */
    k: { title: 'mgCrysTitle', sub: 'mgCrysSub', start: 'mgCrysStart', done: 'mgCrysDone' },
    init() { return { x: 96, tx: 96, items: [], sp: 0.35, fx: [], hit: 0 }; },
    tick(G, dt) {
      const S = G.s, k = 1 - G.left / o.dur;
      S.fx.forEach(f => { f.t += dt; }); S.fx = S.fx.filter(f => f.t < 0.3);
      if (S.hit > 0) S.hit -= dt;
      const d = S.tx - S.x, mv = 150 * dt; S.x += Math.abs(d) <= mv ? d : Math.sign(d) * mv;
      S.sp -= dt;
      if (S.sp <= 0) { S.items.push({ x: 12 + Math.random() * 168, y: 14, bad: Math.random() < 0.3 }); S.sp = 0.5 - 0.2 * k + Math.random() * 0.1; }
      const v = 52 + 34 * k;
      for (let i = S.items.length - 1; i >= 0; i--) {
        const it = S.items[i]; it.y += v * dt;
        if (it.y >= 92 && it.y <= 108 && Math.abs(it.x - S.x) < 11) {
          S.items.splice(i, 1);
          if (it.bad) { G.score = Math.max(0, G.score - 1); S.hit = 0.35; playSfx('pip'); }
          else { G.score++; S.fx.push({ x: it.x, y: it.y, t: 0 }); playSfx('wheelTick'); }
        } else if (it.y > 122) S.items.splice(i, 1);
      }
    },
    tap(G, lx) { G.s.tx = Math.max(12, Math.min(180, lx)); },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#080c24');
      for (let i = 0; i < 28; i++) { const y = (14 + (i * 29) % 100 + T * (8 + i % 4 * 5)) % 106 + 14; R(g, (i * 53 + 7) % W, Math.floor(y), 1, 1, i % 5 ? '#9aa8d8' : 'w'); }
      disc(g, 28, 40, 12, 'u'); R(g, 14, 38, 28, 2, 'v'); R(g, 18, 46, 20, 2, 'P');
      S.items.forEach(it => {
        const x = Math.round(it.x), y = Math.round(it.y);
        if (it.bad) { disc(g, x, y, 6, 'e'); R(g, x - 3, y - 2, 3, 3, 'k'); R(g, x + 1, y + 2, 3, 2, 'k'); R(g, x - 5, y - 4, 2, 2, 'E'); }
        else {
          const tw = Math.floor(T * 6 + it.x) % 2;
          R(g, x - 1, y - 6, 3, 2, 'a'); R(g, x - 3, y - 4, 7, 3, 'a'); R(g, x - 4, y - 1, 9, 3, 'T'); R(g, x - 2, y + 2, 5, 3, 'T'); R(g, x - 1, y + 5, 3, 1, 'n');
          R(g, x - 2, y - 4, 2, 2, 'w'); if (tw) R(g, x + 4, y - 6, 1, 3, 'w');
        }
      });
      const sx = Math.round(S.x), sy = 100;
      if (S.hit > 0 && Math.floor(T * 30) % 2) { R(g, sx - 11, sy - 11, 22, 24, 'r'); }
      R(g, sx - 4, sy - 8, 9, 14, 'w'); R(g, sx - 4, sy - 8, 2, 14, 'E'); R(g, sx - 2, sy - 12, 5, 4, 'r'); R(g, sx - 1, sy - 14, 3, 2, 'r');
      R(g, sx - 8, sy + 1, 4, 7, 'r'); R(g, sx + 5, sy + 1, 4, 7, 'r'); disc(g, sx, sy - 3, 2, 'a');
      R(g, sx - 2, sy + 6, 5, 3 + (Math.floor(T * 20) % 3), 'o'); R(g, sx - 1, sy + 6, 3, 2, 'y');
      S.fx.forEach(f => { const u = f.t / 0.3; g.globalAlpha = 1 - u; for (let s = 0; s < 6; s++) R(g, Math.round(f.x + Math.cos(s * 1.047) * (3 + u * 12)), Math.round(f.y + Math.sin(s * 1.047) * (3 + u * 12)), 2, 2, s % 2 ? 'w' : 'a'); g.globalAlpha = 1; });
      if (show) { g.globalAlpha = 0.45; R(g, 0, 14, W, 106, '#04061a'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 56);
      mgBars(g, o, G);
    }
  };
  mgMake(6, o);
})();

/* ---- епоха 7 (Неон): «Нічна траса» — тапни на смугу: збирай монети, об'їжджай машини ---- */
(function () {
  const CX = [52, 96, 140], PY = 98;
  const CARC = ['f', 'o', 'u', 'r'];
  const o = {
    id: 'road', dur: 16, goalP: 16, goalN: 8,      /* р. 68: на 20% важче (було 13/7) */
    k: { title: 'mgRoadTitle', sub: 'mgRoadSub', start: 'mgRoadStart', done: 'mgRoadDone' },
    init() { return { lane: 1, items: [], sp: 0.4, fx: [], hit: 0 }; },
    tick(G, dt) {
      const S = G.s, k = 1 - G.left / o.dur;
      S.fx.forEach(f => { f.t += dt; }); S.fx = S.fx.filter(f => f.t < 0.3);
      if (S.hit > 0) S.hit -= dt;
      S.sp -= dt;
      if (S.sp <= 0) {
        const bad = Math.random() < 0.4;
        S.items.push({ l: Math.floor(Math.random() * 3), y: 12, bad, c: CARC[Math.floor(Math.random() * CARC.length)] });
        S.sp = 0.55 - 0.2 * k + Math.random() * 0.1;
      }
      const v = 72 + 42 * k;
      for (let i = S.items.length - 1; i >= 0; i--) {
        const it = S.items[i]; it.y += v * dt;
        if (it.l === S.lane && it.y >= PY - 10 && it.y <= PY + 8) {
          S.items.splice(i, 1);
          if (it.bad) { G.score = Math.max(0, G.score - 1); S.hit = 0.35; playSfx('pip'); }
          else { G.score++; S.fx.push({ x: CX[it.l], y: it.y, t: 0 }); playSfx('wheelTick'); }
        } else if (it.y > 124) S.items.splice(i, 1);
      }
    },
    tap(G, lx) { G.s.lane = Math.max(0, Math.min(2, Math.floor((lx - 30) / 44))); },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#0a0820');
      for (let i = 0; i < 9; i++) {                                              // силует міста по боках
        const hh = 18 + (i * 17) % 40, x = (i % 2 ? 0 : 162) + (i % 4) * 8;
        R(g, x, 14 + 60 - hh, 12, hh + 46, '#14123a');
        for (let w = 0; w < 4; w++) if (Math.sin(T * 2 + i + w) > -0.3) R(g, x + 2 + (w % 2) * 5, 14 + 64 - hh + w * 9, 3, 3, w % 2 ? 'f' : 'T');
      }
      R(g, 30, 14, 132, 106, '#161630'); R(g, 28, 14, 2, 106, 'f'); R(g, 162, 14, 2, 106, 'T');
      g.globalAlpha = 0.35; R(g, 25, 14, 3, 106, 'f'); R(g, 164, 14, 3, 106, 'T'); g.globalAlpha = 1;
      const off = (T * 90) % 18;
      for (let d = 0; d < 7; d++) { const y = 14 - 18 + d * 18 + off; [74, 118].forEach(x => { if (y >= 14 && y < 118) R(g, x, Math.floor(y), 2, 9, '#6a6a9a'); }); }
      S.items.forEach(it => {
        const x = CX[it.l], y = Math.round(it.y);
        if (it.bad) {
          R(g, x - 8, y - 11, 17, 22, 'k'); R(g, x - 7, y - 10, 15, 20, it.c); R(g, x - 5, y - 6, 11, 6, 'S'); R(g, x - 7, y + 7, 4, 2, 'r'); R(g, x + 4, y + 7, 4, 2, 'r');
        } else {
          g.globalAlpha = 0.35; disc(g, x, y, 9, 'y'); g.globalAlpha = 1;
          disc(g, x, y, 6, 'h'); disc(g, x, y, 4, 'y'); R(g, x - 1, y - 3, 2, 6, 'w');
        }
      });
      const px = CX[S.lane];
      if (S.hit > 0 && Math.floor(T * 30) % 2) R(g, px - 11, PY - 14, 23, 28, 'r');
      R(g, px - 8, PY - 11, 17, 22, 'k'); R(g, px - 7, PY - 10, 15, 20, 'T'); R(g, px - 7, PY - 10, 15, 3, 'a'); R(g, px - 5, PY - 6, 11, 6, 'w');
      R(g, px - 7, PY + 7, 4, 2, 'y'); R(g, px + 4, PY + 7, 4, 2, 'y'); R(g, px - 1, PY - 10, 2, 20, 'w');
      S.fx.forEach(f => { const u = f.t / 0.3; g.globalAlpha = 1 - u; for (let s = 0; s < 6; s++) R(g, Math.round(f.x + Math.cos(s * 1.047) * (4 + u * 12)), Math.round(f.y + Math.sin(s * 1.047) * (4 + u * 12)), 2, 2, s % 2 ? 'y' : 'f'); g.globalAlpha = 1; });
      if (show) { g.globalAlpha = 0.5; R(g, 30, 14, 132, 106, '#05031a'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 56);
      mgBars(g, o, G);
    }
  };
  mgMake(7, o);
})();

(function () {
  const UK = {
    mgFrescoTitle: 'Фреска майстра Капі', mgFrescoSub: 'Баночки з фарбою спалахують по черзі. Повтори порядок — і фреска оживе!', mgFrescoStart: 'Малювати!', mgFrescoDone: 'Яка краса!',
    mgJukeTitle: 'Джубокс Капі', mgJukeSub: 'Платівки падають на лінію. Тапай колонку, коли платівка на лінії!', mgJukeStart: 'Грати!', mgJukeDone: 'Чудова музика!',
    mgClawTitle: 'Клешня-автомат', mgClawSub: 'Клешня їздить туди-сюди. Тапни, щоб опустити її точно над іграшкою!', mgClawStart: 'Хапати!', mgClawDone: 'Повні кишені іграшок!',
    mgSortTitle: 'Сортування сміття', mgSortSub: 'Сміття їде стрічкою. Тап ліворуч — у зелений бак (органіка), праворуч — у синій (пластик)!', mgSortStart: 'Сортувати!', mgSortDone: 'Планета чистіша!',
    mgCrysTitle: 'Кристали в космосі', mgCrysSub: 'Лови кристали й обминай астероїди. Тапни туди, куди має летіти ракета!', mgCrysStart: 'Летіти!', mgCrysDone: 'Повний трюм!',
    mgRoadTitle: 'Нічна траса', mgRoadSub: 'Збирай неонові монети й об\'їжджай машини. Тапни на смугу, де хочеш їхати!', mgRoadStart: 'Поїхали!', mgRoadDone: 'Гарна поїздка!'
  };
  const EN = {
    mgFrescoTitle: 'Master Capy\'s Fresco', mgFrescoSub: 'The paint pots light up one by one. Repeat the order to bring the fresco to life!', mgFrescoStart: 'Paint!', mgFrescoDone: 'How beautiful!',
    mgJukeTitle: 'Capy\'s Jukebox', mgJukeSub: 'Records fall toward the line. Tap the lane the moment a record reaches it!', mgJukeStart: 'Play!', mgJukeDone: 'Great music!',
    mgClawTitle: 'Claw Machine', mgClawSub: 'The claw slides back and forth. Tap to drop it right above a toy!', mgClawStart: 'Grab!', mgClawDone: 'Pockets full of toys!',
    mgSortTitle: 'Trash Sorting', mgSortSub: 'Trash rides the belt. Tap left for the green bin (organic), right for the blue one (plastic)!', mgSortStart: 'Sort!', mgSortDone: 'The planet is cleaner!',
    mgCrysTitle: 'Space Crystals', mgCrysSub: 'Catch the crystals and dodge the asteroids. Tap where the rocket should fly!', mgCrysStart: 'Fly!', mgCrysDone: 'Cargo hold full!',
    mgRoadTitle: 'Night Road', mgRoadSub: 'Collect neon coins and dodge the cars. Tap the lane you want to drive in!', mgRoadStart: 'Drive!', mgRoadDone: 'What a ride!'
  };
  Object.assign(translations.uk, UK); Object.assign(translations.en, EN);
})();
