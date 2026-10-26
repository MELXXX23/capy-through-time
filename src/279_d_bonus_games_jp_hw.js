//#part 279_d_bonus_games_jp_hw.js
/* =====================================================================
   БОНУС-ІГРИ ЯПОНІЇ І ХЕЛЛОВІНУ (як в усіх епохах: іконка-кнопка, спільна перезарядка 12 год, приз — лише скін; ядро — 279_bonus_games.js).
   Японія (епоха 8) — «Тайко»: кільця стискаються до барабана, бий вчасно. Хелловін (пора, ключ 9 у MG_DEFS) — «Привиди з могил»: тапай привидів, не чіпай кажанів.
   Хелловін перебиває гру епохи, поки вибрана пора Хелловін (mgActive). Полотно 192×120; смужки часу/рахунку — y 0…13.
   ===================================================================== */

const dsc = (g, cx, cy, r, c) => {                                    // диск, як disc(), але колір — літера палітри або будь-який CSS-колір
  g.fillStyle = PALETTE[c] || c;
  for (let dy = -r; dy <= r; dy++) { const half = Math.round(Math.sqrt(r * r + 0.5 - dy * dy)); g.fillRect(cx - half, cy + dy, half * 2 + 1, 1); }
};

/* ---- Японія: «Тайко» ---- */
(function () {
  const DX = [36, 96, 156], DY = 74, R0 = 16, LIFE = 1.15, WIN = 0.34;
  const o = {
    id: 'taiko', dur: 22, goalP: 24, goalN: 14,      /* р. 68: на 20% важче (було 20/12) */
    k: { title: 'mgTaikoTitle', sub: 'mgTaikoSub', start: 'mgTaikoStart', done: 'mgTaikoDone' },
    init() { return { notes: [], sp: 0.5, hit: [0, 0, 0], bad: [0, 0, 0], fx: [], last: -1 }; },
    tick(G, dt) {
      const S = G.s, k = 1 - G.left / o.dur;
      for (let i = 0; i < 3; i++) { if (S.hit[i] > 0) S.hit[i] -= dt; if (S.bad[i] > 0) S.bad[i] -= dt; }
      S.fx.forEach(f => { f.t += dt; }); S.fx = S.fx.filter(f => f.t < 0.5);
      S.notes.forEach(n => { n.t += dt; });
      S.notes = S.notes.filter(n => n.t < LIFE + WIN && !n.done);
      S.sp -= dt;
      if (S.sp <= 0) {
        let d = Math.floor(Math.random() * 3); if (d === S.last && Math.random() < 0.6) d = (d + 1 + Math.floor(Math.random() * 2)) % 3;
        S.last = d; S.notes.push({ d, t: 0, done: false }); S.sp = 0.78 - 0.34 * k + Math.random() * 0.1;
      }
    },
    tap(G, lx, ly) {
      const S = G.s; let best = -1, bd = 1e9;
      for (let i = 0; i < 3; i++) { const dd = Math.hypot(lx - DX[i], ly - DY); if (dd < 30 && dd < bd) { bd = dd; best = i; } }
      if (best < 0) return;
      const cand = S.notes.filter(n => n.d === best && !n.done).sort((a, b) => b.t - a.t)[0];
      if (cand && Math.abs(LIFE - cand.t) <= WIN) { cand.done = true; G.score++; S.hit[best] = 0.18; S.fx.push({ x: DX[best], y: DY - 12, t: 0, p: Math.abs(LIFE - cand.t) < 0.13 }); playSfx('wheelTick'); }
      else S.bad[best] = 0.16;
    },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#1b1740'); R(g, 0, 14, W, 40, '#2a2058'); R(g, 0, 40, W, 20, '#3a2468');
      for (let i = 0; i < 18; i++) { const sx = (i * 37 + 11) % 190, sy = 16 + (i * 53) % 26; if (Math.sin(T * 2 + i) > -0.2) R(g, sx, sy, 1, 1, 'w'); }
      dsc(g, 164, 30, 11, '#fff0c0'); dsc(g, 164, 30, 9, '#ffe6a0'); dsc(g, 160, 27, 2, '#f2d68a');            // повний місяць
      R(g, 0, 56, W, 64, '#241238');                                                                                // сцена
      R(g, 0, 98, W, 22, '#6a3e22'); R(g, 0, 98, W, 2, '#a8683a'); for (let x = 0; x < W; x += 16) R(g, x, 100, 1, 20, '#4e2c16');
      R(g, 4, 17, 184, 1, 'd');                                                                                     // мотузка з ліхтариками
      for (let i = 0; i < 9; i++) { const lx = 12 + i * 21, ly = 18 + Math.round(Math.sin(i * 1.7) * 1), sw = Math.round(Math.sin(T * 2 + i)); R(g, lx + sw, ly, 9, 11, i % 2 ? '#d4302a' : '#e8582a'); R(g, lx + sw, ly, 9, 2, '#ffd23a'); R(g, lx + sw, ly + 9, 9, 2, '#ffd23a'); R(g, lx + 2 + sw, ly + 3, 2, 4, '#ff9a5a'); R(g, lx + 4 + sw, ly + 11, 1, 3, 'd'); }
      for (let i = 0; i < 3; i++) {                                                                                 // барабани
        const x = DX[i], y = DY, hitU = S.hit[i] > 0 ? S.hit[i] / 0.18 : 0, sq = Math.round(hitU * 3), bad = S.bad[i] > 0;
        R(g, x - 16, y + 18, 32, 4, '#1a0e22'); R(g, x - 13, y + 16, 3, 8, 'd'); R(g, x + 10, y + 16, 3, 8, 'd');
        dsc(g, x, y + sq * 0, 17 - (sq ? 1 : 0), 'd'); dsc(g, x, y, 15 - (sq ? 1 : 0), bad ? '#a05a40' : '#d4302a'); dsc(g, x, y, 11, bad ? '#d8b090' : '#fff0d0'); dsc(g, x - 4, y - 5, 3, '#fffaf0');
        for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6; R(g, Math.round(x + Math.cos(an) * 14), Math.round(y + Math.sin(an) * 14), 2, 2, '#ffd23a'); }
        R(g, x - 2, y - 2, 4, 4, '#d4302a'); R(g, x - 1, y - 1, 2, 2, '#ffd23a');
        if (hitU > 0) { g.globalAlpha = hitU * 0.5; dsc(g, x, y, 22, '#ffe08a'); g.globalAlpha = 1; }
      }
      S.notes.forEach(n => {                                                                                         // кільця, що стискаються
        const r = R0 + 26 * Math.max(0, 1 - n.t / LIFE), x = DX[n.d], good = Math.abs(LIFE - n.t) <= WIN;
        g.strokeStyle = good ? '#ffe36a' : '#ffffff'; g.lineWidth = good ? 2.4 : 1.6; g.globalAlpha = Math.min(1, n.t / 0.25) * (n.t > LIFE ? Math.max(0, 1 - (n.t - LIFE) / WIN) : 1);
        g.beginPath(); g.arc(x, DY, r, 0, 7); g.stroke(); g.globalAlpha = 1;
      });
      S.fx.forEach(f => { const u = f.t / 0.5; g.globalAlpha = 1 - u; for (let i = 0; i < 8; i++) { const an = i * 0.785 + 0.2, d = 6 + u * 20; R(g, Math.round(f.x + Math.cos(an) * d), Math.round(f.y + 12 + Math.sin(an) * d * 0.7), 3, 2, i % 2 ? '#ffc9d4' : '#ff8fb3'); } if (f.p) R(g, f.x - 7, Math.round(f.y - u * 12), 14, 5, '#ffe36a'); g.globalAlpha = 1; });
      if (show) { g.globalAlpha = 0.55; R(g, 0, 14, W, 106, '#120c2a'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 62);
      mgBars(g, o, G);
    }
  };
  mgMake(8, o);
})();

/* ---- Хелловін: «Привиди з могил» ---- */
(function () {
  const HX = [32, 96, 160], HY = [58, 98], LIFE0 = 1.25;
  const o = {
    id: 'ghost', dur: 18, goalP: 22, goalN: 12,      /* р. 68: на 20% важче (було 18/10) */
    k: { title: 'mgGhostTitle', sub: 'mgGhostSub', start: 'mgGhostStart', done: 'mgGhostDone' },
    init() { return { up: [null, null, null, null, null, null], sp: 0.4, fx: [], shake: 0 }; },
    tick(G, dt) {
      const S = G.s, k = 1 - G.left / o.dur;
      S.fx.forEach(f => { f.t += dt; }); S.fx = S.fx.filter(f => f.t < 0.45);
      if (S.shake > 0) S.shake -= dt;
      for (let i = 0; i < 6; i++) { const u = S.up[i]; if (u) { u.t += dt; if (u.t >= u.life) S.up[i] = null; } }
      S.sp -= dt;
      if (S.sp <= 0) {
        const free = []; for (let i = 0; i < 6; i++) if (!S.up[i]) free.push(i);
        if (free.length) { const i = free[Math.floor(Math.random() * free.length)]; S.up[i] = { t: 0, life: LIFE0 - 0.5 * k + Math.random() * 0.15, bat: Math.random() < 0.22 }; }
        S.sp = 0.62 - 0.26 * k + Math.random() * 0.12;
      }
    },
    tap(G, lx, ly) {
      const S = G.s; let best = -1, bd = 1e9;
      for (let i = 0; i < 6; i++) { const u = S.up[i]; if (!u) continue; const x = HX[i % 3], y = HY[Math.floor(i / 3)] - 8, dd = Math.hypot(lx - x, ly - y); if (dd < 24 && dd < bd) { bd = dd; best = i; } }
      if (best < 0) return;
      const u = S.up[best], x = HX[best % 3], y = HY[Math.floor(best / 3)];
      if (u.bat) { G.score = Math.max(0, G.score - 1); S.shake = 0.25; S.fx.push({ x, y: y - 10, t: 0, bad: true }); playSfx('pip'); }
      else { G.score++; S.fx.push({ x, y: y - 10, t: 0, bad: false }); playSfx('wheelTick'); }
      S.up[best] = null;
    },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#1a0f2e'); R(g, 0, 14, W, 26, '#2e1850'); R(g, 0, 30, W, 18, '#5a2a6a'); R(g, 0, 44, W, 10, '#8a4a5a');
      dsc(g, 40, 26, 11, '#ffe8b0'); dsc(g, 40, 26, 9, '#ffd98a'); dsc(g, 37, 24, 2, '#e8c070'); dsc(g, 43, 29, 1, '#e8c070');
      for (let i = 0; i < 4; i++) { const bx = ((T * 14 + i * 60) % 230) - 20, by = 20 + i * 7 + Math.round(Math.sin(T * 5 + i) * 3), wg = Math.floor(T * 8 + i) % 2; R(g, bx, by, 6, 2, 'd'); R(g, bx - 2, by - wg * 2 + 1, 3, 2, 'd'); R(g, bx + 5, by - wg * 2 + 1, 3, 2, 'd'); }
      R(g, 0, 52, W, 68, '#2a3a2a'); R(g, 0, 52, W, 2, '#4a6a3a'); R(g, 0, 88, W, 32, '#223022');
      for (let i = 0; i < 14; i++) { const gx = (i * 29 + 9) % 188; R(g, gx, 56 + (i * 7) % 8, 1, 4, '#4f7a3f'); }
      for (let row = 0; row < 2; row++) for (let c = 0; c < 3; c++) {
        const i = row * 3 + c, x = HX[c], y = HY[row], u = S.up[i], sh = S.shake > 0 ? Math.round(Math.sin(T * 60 + i) * 1) : 0;
        R(g, x - 14, y, 28, 6, '#10200f'); dsc(g, x, y + 2, 10, '#10200f');                                          // яма
        if (u) {
          const rise = Math.min(1, u.t / 0.25) * (u.t > u.life - 0.2 ? Math.max(0, (u.life - u.t) / 0.2) : 1), hh = Math.round(22 * rise), top = y - hh + 4;
          g.save(); g.beginPath(); g.rect(x - 16 + sh, y - 30, 32, 30 + 3); g.clip();
          if (u.bat) {
            const wg = Math.floor(T * 10 + i) % 2; dsc(g, x + sh, top + 8, 7, '#2a1838'); dsc(g, x + sh, top + 8, 5, '#3e2658');
            R(g, x - 15 + sh, top + 4 - wg * 3, 9, 6, '#2a1838'); R(g, x + 6 + sh, top + 4 - wg * 3, 9, 6, '#2a1838'); R(g, x - 5 + sh, top, 3, 4, '#2a1838'); R(g, x + 2 + sh, top, 3, 4, '#2a1838');
            R(g, x - 3 + sh, top + 6, 2, 2, '#ff4a4a'); R(g, x + 1 + sh, top + 6, 2, 2, '#ff4a4a'); R(g, x - 2 + sh, top + 10, 1, 2, 'w'); R(g, x + 1 + sh, top + 10, 1, 2, 'w');
          } else {
            const wob = Math.round(Math.sin(T * 6 + i) * 1);
            g.globalAlpha = 0.85; dsc(g, x + wob + sh, top + 8, 9, '#ffffff'); R(g, x - 9 + wob + sh, top + 8, 19, 14, '#ffffff');
            for (let w = 0; w < 4; w++) R(g, x - 9 + w * 5 + wob + sh, top + 22 - (w % 2) * 3, 5, 3 + (w % 2) * 3, '#ffffff');
            g.globalAlpha = 1; R(g, x - 5 + wob + sh, top + 7, 3, 4, '#2a1838'); R(g, x + 2 + wob + sh, top + 7, 3, 4, '#2a1838'); R(g, x - 2 + wob + sh, top + 13, 5, 3, '#2a1838'); R(g, x - 8 + wob + sh, top + 5, 2, 2, '#d8e4ff');
          }
          g.restore();
        }
        R(g, x - 15, y + 3, 30, 3, '#1a2e1a');                                                                       // край ями спереду
        R(g, x - 15, y + 1, 4, 5, '#6a6a7a'); R(g, x - 15, y + 1, 4, 1, '#9a9aaa');                                  // камінчики
        R(g, x + 11, y + 2, 4, 4, '#6a6a7a');
      }
      for (const f of S.fx) { const u = f.t / 0.45; g.globalAlpha = 1 - u; for (let i = 0; i < 7; i++) { const an = i * 0.9, d = 4 + u * 18; R(g, Math.round(f.x + Math.cos(an) * d), Math.round(f.y + Math.sin(an) * d * 0.8), 2, 2, f.bad ? '#ff4a4a' : '#bfe8ff'); } g.globalAlpha = 1; }
      if (show) { g.globalAlpha = 0.55; R(g, 0, 14, W, 106, '#0a0618'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 62);
      mgBars(g, o, G);
    }
  };
  mgMake(9, o);
})();

(function () {
  const UK = {
    mgTaikoTitle: 'Тайко діда Рьо', mgTaikoSub: 'Кільця стискаються до барабана. Бий, коли кільце збігається з ободом! Скін — за ритм.', mgTaikoStart: 'Бити!', mgTaikoDone: 'Гарний ритм!',
    mgGhostTitle: 'Привиди з могил', mgGhostSub: 'Привиди визирають із ям. Тапай їх, а на кажанів не чіпай!', mgGhostStart: 'Ловити!', mgGhostDone: 'Могили спокійні!'
  };
  const EN = {
    mgTaikoTitle: 'Grandpa Ryo’s Taiko', mgTaikoSub: 'Rings shrink onto the drum. Strike when the ring meets the rim! The skin is for the rhythm.', mgTaikoStart: 'Strike!', mgTaikoDone: 'Great rhythm!',
    mgGhostTitle: 'Ghosts of the Graves', mgGhostSub: 'Ghosts peek out of the pits. Tap them, but leave the bats alone!', mgGhostStart: 'Catch!', mgGhostDone: 'The graves are quiet!'
  };
  Object.assign(translations.uk, UK); Object.assign(translations.en, EN);
})();
