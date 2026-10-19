//#part 279_bonus_games.js
/* =====================================================================
   БОНУС-ІГРИ ПІД ЕПОХИ: окрема іконка у верхньому правому куті (там, де був барабан). Цирк Фортуни лишається цирком з колесом.
   Гра відкривається у тому самому вікні, що й цирк (circusModal), у «бонус-режимі» (circus.bonus). Перезарядка 12 год
   (BONUS_COOLDOWN_MIN), один спільний таймер на всі епохи (час виграшу пишеться в state.wheel.mg[eid], діє найпізніший). Приз лише скін: ціль goalP виконано → скін і 12 год чекання;
   не вийшло → можна одразу ще раз (BONUS_RETRY_ON_MISS). Ігри епох 0,1,3,5,6,7 — у 279_c_bonus_games_more.js.
   Реєстр MG_DEFS[номер епохи] → опис гри; їх робить mgMake: таймер (dur), ціль «ідеально» (goalP) і «майже» (goalN),
   рахунок G.score, фази idle → play → reveal → done. Гра задає: init() → стан, tick(G, dt), tap(G, lx, ly) (полотно 192×120),
   draw(g, G, T). Додати гру: mgMake(eid, {...}) + тексти mg<Ім'я>Title/Sub/Start/Done. Лапшична (Японія) і відьма — окремі, на візку.
   ===================================================================== */
const BONUS_COOLDOWN_MIN = 720;                                      // 12 годин; один спільний таймер на всі епохи (найпізніший з state.wheel.mg)
const BONUS_RETRY_ON_MISS = true;                                    // не вийшло — спробуй ще, перезарядка йде лише після виграного скіна
const MG_DEFS = {};
const mgGame = { phase: 'idle', t: 0, left: 0, score: 0, rt: 0, res: '', prize: null, main: false, s: null };
function mgForEpoch(eid) { return MG_DEFS[eid] || null; }
function mgCur() { return circus.bonusDef; }                         // гра, що зараз у вікні (circus.bonus)
function bonusCooldownMs() { return BONUS_COOLDOWN_MIN * 60000; }
function bonusLastWin() { return (state.wheel.mg || []).reduce((m, v) => Math.max(m, v || 0), 0); }   // один таймер на всі епохи: береться найпізніший виграш
function bonusWaitMs(eid = viewEpoch(), now = Date.now()) { return Math.max(0, bonusLastWin() + bonusCooldownMs() - now); }
function mgSkinSector() {                                            // приз бонус-гри — лише скін (як усі вільні скіни закінчились — 5 кристалів)
  const pool = BONUS_GAME_SKINS.filter(x => circusFreeSkins(x.skin).length);
  if (!pool.length) return { kind: 'crystal', amount: 5, icon: 'gem2', color: 'v', weight: 0 };
  return pool[Math.floor(Math.random() * pool.length)];
}
function openBonus(def) {                                            // def — лише для тестів; інакше гра поточної епохи
  if (dialog.active || !ui.circusModal.hidden) return;
  const d = def || mgForEpoch(viewEpoch()); if (!d) return;
  const w = bonusWaitMs(d.eid);
  if (w > 0) { if (typeof adsOfferBonusSkip !== 'function' || !adsOfferBonusSkip(def, w)) showToast(t('mgWait', fmtTime(w / 1000))); return; }
  circus.bonus = true; circus.bonusDef = d;
  ui.circusModal.classList.add('hag', 'mg');                           // mg: без клоуна, гра на всю рамку
  ui.circusWheel.width = 192; ui.circusWheel.height = 120;
  mgReset(d.o);
  ui.circusModal.hidden = false;
  ui.circusTitle.textContent = t(d.k.title); ui.circusSub.textContent = t(d.k.sub);
  ui.circusClose.textContent = t('wheelClose'); ui.circusResult.textContent = '';
  updateCircusButtons();
}
function updateBonusBtn(dt) {                                        // іконка: є лише в епохах із грою; світиться, коли готова
  circus.bt = (circus.bt || 0) - dt; if (circus.bt > 0) return; circus.bt = 0.4;
  const d = mgForEpoch(viewEpoch()), b = ui.bonusOpen;
  b.hidden = !d; if (!d) return;
  const w = bonusWaitMs(viewEpoch());
  b.classList.toggle('ready', w <= 0); b.classList.toggle('wait', w > 0);
  ui.bonusOpenT.textContent = w > 0 ? fmtTime(w / 1000) : '';
  b.setAttribute('aria-label', t(d.k.title));
}
function updateBonusGame(dt) { if (circus.bonus) mgUpdate(mgCur().o, dt); }

/* ---- спільний мінірушій ---- */
function mgReset(o) {
  const G = mgGame;
  G.phase = 'idle'; G.t = 0; G.left = o.dur; G.score = 0; G.rt = 0; G.res = ''; G.prize = null; G.main = false; G.s = o.init();
}
function mgStart(o) {
  const G = mgGame; if (G.phase !== 'idle') return;
  mgReset(o); G.phase = 'play';
  ui.circusResult.textContent = t('mgScore', 0, o.goalP); updateCircusButtons(); playSfx('pip');
}
function mgFinish(o) {                                               // час вийшов: ціль виконана — скін, ні — спробуй ще
  const G = mgGame; if (G.phase !== 'play') return;
  const eid = mgCur().eid, win = G.score >= o.goalP;
  G.res = win ? 'perfect' : G.score >= o.goalN ? 'near' : 'miss';
  G.main = win; G.phase = 'reveal'; G.rt = 0; G.prize = null;
  if (win || !BONUS_RETRY_ON_MISS) { if (!state.wheel.mg) state.wheel.mg = []; state.wheel.mg[eid] = Date.now(); }
  let text = t(win ? 'mgPerfect' : G.res === 'near' ? 'mgNear' : 'mgMiss');
  if (win) {
    const sec = mgSkinSector(), pr = applyCircusSector(sec, Date.now());
    G.prize = sec; text += ' ' + pr.text;
    if (pr.skin >= 0) setTimeout(() => openLoot(pr.skin), 1500); else showToast(pr.text, 'good');
  }
  ui.circusResult.textContent = text;
  playSfx(win ? 'wheelWin' : 'pip'); buzz(25);
  updateUI(); saveGame(); updateCircusButtons();
}
function mgUpdate(o, dt) {
  const G = mgGame; G.t += dt;
  if (G.phase === 'play') {
    G.left -= dt; o.tick(G, dt);
    if (G.left <= 0) { G.left = 0; mgFinish(o); }
  } else if (G.phase === 'reveal') {
    G.rt += dt;
    if (G.rt > 2.2) { G.phase = 'done'; updateCircusButtons(); ui.circusClose.textContent = t(mgCur().k.done); }
  }
}
function mgPoint(e) {                                                // координати тапа в системі полотна 192×120
  const cv = ui.circusWheel, r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height };
}
function mgMake(eid, o) { MG_DEFS[eid] = { id: o.id, eid, o, k: o.k }; }
// гачки для вікна цирку (230_a2/230_b), коли circus.bonus
function mgBusy() { return mgGame.phase === 'play' || mgGame.phase === 'reveal'; }
function mgAct() { mgStart(mgCur().o); }
function mgClick(e) {
  const G = mgGame; if (G.phase !== 'play') return;
  const o = mgCur().o, p = mgPoint(e); o.tap(G, p.x, p.y);
  ui.circusResult.textContent = t('mgScore', G.score, o.goalP);
}
function mgDraw() {
  const cv = ui.circusWheel; if (cv.width !== 192) return;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  mgCur().o.draw(g, mgGame, circus.t);
}
function mgButton() { return { key: mgCur().k.start, off: mgGame.phase !== 'idle' }; }
// смужки «час» і «рахунок» угорі полотна (спільні для всіх ігор)
function mgBars(g, o, G) {
  R(g, 7, 1, 178, 4, 'd'); R(g, 8, 2, Math.round(176 * Math.max(0, G.left) / o.dur), 2, 'y');
  R(g, 7, 7, 178, 6, 'd'); const f = Math.min(1, G.score / o.goalP);
  R(g, 8, 8, Math.round(176 * f), 4, G.score >= o.goalP ? 'g' : 'o');
  R(g, 183, 7, 1, 6, 'w');
}
// приз над ігровим полем у фазах reveal/done (центр cx, cy)
function mgPrize(g, G, T, cx, cy) {
  if ((G.phase !== 'reveal' && G.phase !== 'done') || !G.prize) return;
  const a = Math.min(1, G.rt / 0.35 + (G.phase === 'done' ? 1 : 0)), by = Math.round(cy + Math.sin(T * 3) * 2);
  g.globalAlpha = 0.3 * a; disc(g, cx, by, 15, 'h'); g.globalAlpha = 0.5 * a; disc(g, cx, by, 11, 'y'); g.globalAlpha = a;
  if (G.prize) drawCircusIcon(g, G.prize.icon || 'gem', cx, by);
  g.globalAlpha = 1;
  if (G.main && Math.floor(T * 6) % 2) { R(g, cx - 18, by - 12, 1, 3, 'y'); R(g, cx - 19, by - 11, 3, 1, 'y'); R(g, cx + 18, by - 6, 1, 3, 'y'); R(g, cx + 17, by - 5, 3, 1, 'y'); }
}

/* ---- епоха 2 (Диско): «Танцпол» — тапай світні плитки вчасно ---- */
(function () {
  const COLS = 4, ROWS = 2, TW = 42, TH = 32, X0 = 8, Y0 = 46, PX = 44, PY = 34;
  const LIT = ['f', 'y', 'T', 'm', 'o', 'p'];
  const o = {
    id: 'dance', dur: 16, goalP: 20, goalN: 11,
    k: { title: 'mgDanceTitle', sub: 'mgDanceSub', start: 'mgDanceStart', done: 'mgDanceDone' },
    init() {
      const tiles = []; for (let i = 0; i < COLS * ROWS; i++) tiles.push({ life: 0, max: 1, col: 'f', pop: 0, bad: 0 });
      return { tiles, sp: 0.5 };
    },
    tick(G, dt) {
      const S = G.s, k = 1 - G.left / o.dur;                         // k: 0 → 1 за час гри (темп росте)
      let lit = 0;
      S.tiles.forEach(x => { if (x.life > 0) { x.life -= dt; if (x.life > 0) lit++; } if (x.pop > 0) x.pop -= dt; if (x.bad > 0) x.bad -= dt; });
      S.sp -= dt;
      if (S.sp <= 0 && lit < 3) {
        const free = S.tiles.filter(x => x.life <= 0);
        if (free.length) {
          const x = free[Math.floor(Math.random() * free.length)];
          x.max = x.life = 1.3 - 0.45 * k; x.col = LIT[Math.floor(Math.random() * LIT.length)]; x.pop = 0;
          S.sp = 0.62 - 0.24 * k + Math.random() * 0.14;
        }
      }
    },
    tap(G, lx, ly) {
      const c = Math.floor((lx - X0) / PX), r = Math.floor((ly - Y0) / PY);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      const x = G.s.tiles[r * COLS + c];
      if (x.life > 0) { x.life = 0; x.pop = 0.35; G.score++; playSfx('wheelTick'); }
      else { x.bad = 0.3; G.score = Math.max(0, G.score - 1); }
    },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, 44, 'k'); R(g, 0, 30, W, 14, '#2a1840'); R(g, 0, 43, W, 1, 'f');
      for (let i = 0; i < 18; i++) if (Math.sin(T * 3 + i * 1.7) > -0.2) R(g, (i * 37 + 9) % W, 15 + (i * 13) % 26, 1, 1, LIT[i % LIT.length]);
      // підлога: плитки
      R(g, 0, 44, W, H - 44, '#1c1030');
      S.tiles.forEach((x, i) => {
        const c = i % COLS, r = Math.floor(i / COLS), px = X0 + c * PX, py = Y0 + r * PY;
        R(g, px, py, TW, TH, (c + r) % 2 ? '#34204e' : '#2a1944');
        R(g, px, py, TW, 1, '#46306a'); R(g, px, py + TH - 1, TW, 1, '#150a24');
        if (x.life > 0) {
          const fl = 0.75 + 0.25 * Math.sin(T * 14 + i * 2);
          g.globalAlpha = 0.35 * fl; R(g, px - 1, py - 1, TW + 2, TH + 2, x.col); g.globalAlpha = 1;
          R(g, px + 2, py + 2, TW - 4, TH - 4, x.col); R(g, px + 2, py + 2, TW - 4, 3, 'w'); R(g, px + 2, py + TH - 5, TW - 4, 3, 'd');
          g.globalAlpha = 0.5; R(g, px + 2, py + TH - 4, Math.round((TW - 4) * Math.max(0, x.life) / x.max), 1, 'w'); g.globalAlpha = 1;
        }
        if (x.pop > 0) {
          const u = 1 - x.pop / 0.35;
          g.globalAlpha = 1 - u; R(g, px + 1, py + 1, TW - 2, TH - 2, 'w'); g.globalAlpha = 1;
          for (let s = 0; s < 6; s++) { const an = s * 1.047 + 0.4, d = 6 + u * 16; R(g, Math.round(px + TW / 2 + Math.cos(an) * d), Math.round(py + TH / 2 + Math.sin(an) * d * 0.8), 2, 2, LIT[s % LIT.length]); }
        }
        if (x.bad > 0) { g.globalAlpha = 0.55 * (x.bad / 0.3); R(g, px, py, TW, TH, 'r'); g.globalAlpha = 1; }
      });
      // промені диско-кулі
      if (!show) for (let b = 0; b < 3; b++) {
        const tx = 96 + Math.sin(T * 1.1 + b * 2.1) * 84, col = LIT[(b * 2) % LIT.length];
        g.globalAlpha = 0.09;
        for (let y = 30; y < H; y += 2) { const cx = 96 + (tx - 96) * (y - 26) / 90, hw = 1 + (y - 26) * 0.1; R(g, Math.round(cx - hw), y, Math.round(hw * 2), 2, col); }
        g.globalAlpha = 1;
      }
      // куля
      if (!show) {
        R(g, 96, 14, 1, 3, 'E'); disc(g, 96, 26, 9, 'e'); disc(g, 95, 25, 7, 'E');
        for (let i = 0; i < 7; i++) { const an = T * 1.6 + i * 0.9, sx = Math.round(96 + Math.cos(an) * 8), sy = Math.round(26 + Math.sin(an * 0.7 + i) * 7); R(g, sx, sy, 1, 1, Math.sin(T * 8 + i) > 0 ? 'w' : 'y'); }
        for (let y = -8; y <= 8; y += 4) R(g, 88, 26 + y, 17, 1, 'e');
      }
      mgPrize(g, G, T, 96, 27);
      mgBars(g, o, G);
    }
  };
  mgMake(2, o);
})();

/* ---- епоха 4 (Інтернет): «Спам» — закривай вікна-спам, поки їх не завалило ---- */
(function () {
  const MAXW = 7;                                                   // стільки відкритих вікон — і «система не витримала»
  const BAR = ['r', 'o', 'u', 'T', 'n', 'f'];
  const o = {
    id: 'spam', dur: 16, goalP: 18, goalN: 10,
    k: { title: 'mgSpamTitle', sub: 'mgSpamSub', start: 'mgSpamStart', done: 'mgSpamDone' },
    init() { return { wins: [], sp: 0.4, fx: [], crash: 0 }; },
    tick(G, dt) {
      const S = G.s, k = 1 - G.left / o.dur;
      S.fx.forEach(f => { f.t += dt; }); S.fx = S.fx.filter(f => f.t < 0.35);
      if (S.crash > 0) S.crash -= dt;
      S.sp -= dt;
      if (S.sp <= 0) {
        const w = 46 + Math.floor(Math.random() * 16), h = 30 + Math.floor(Math.random() * 8);
        S.wins.push({ x: 4 + Math.floor(Math.random() * (192 - 8 - w)), y: 16 + Math.floor(Math.random() * (100 - h)), w, h,
                      c: BAR[Math.floor(Math.random() * BAR.length)], k: Math.floor(Math.random() * 3), age: 0 });
        if (S.wins.length > MAXW) { S.wins.shift(); G.score = Math.max(0, G.score - 1); S.crash = 0.3; }   // переповнення: старе вікно «зависло»
        S.sp = 0.75 - 0.36 * k + Math.random() * 0.15;
      }
      S.wins.forEach(w => { w.age += dt; });
    },
    tap(G, lx, ly) {
      const S = G.s;
      for (let i = S.wins.length - 1; i >= 0; i--) {                // верхнє вікно під пальцем
        const w = S.wins[i];
        if (lx >= w.x - 2 && lx <= w.x + w.w + 2 && ly >= w.y - 2 && ly <= w.y + w.h + 2) {
          S.wins.splice(i, 1); S.fx.push({ x: w.x + w.w / 2, y: w.y + w.h / 2, t: 0, c: w.c }); G.score++; playSfx('wheelTick'); return;
        }
      }
    },
    draw(g, G, T) {
      const W = 192, H = 120, S = G.s, show = G.phase === 'reveal' || G.phase === 'done';
      g.clearRect(0, 0, W, H);
      R(g, 0, 0, W, H, '#1d3f78'); R(g, 0, 0, W, 14, '#16305c');                    // робочий стіл
      for (let i = 0; i < 6; i++) { const ix = 150 + (i % 2) * 18, iy = 22 + Math.floor(i / 2) * 20; R(g, ix, iy, 10, 8, i % 2 ? 'y' : 'w'); R(g, ix, iy + 9, 10, 1, 'S'); }   // значки
      R(g, 0, 111, W, 9, '#9aa5b8'); R(g, 0, 111, W, 1, 'w'); R(g, 3, 113, 18, 5, 'g'); R(g, 150, 113, 38, 5, '#6a7488');   // панель задач
      for (let i = 0; i < 10; i++) if (Math.sin(T * 2 + i) > 0.3) R(g, 6 + i * 18, 6, 12, 2, '#3a64b4');
      S.wins.forEach(w => {
        const sh = S.crash > 0 && Math.floor(T * 30) % 2 ? 1 : 0;
        R(g, w.x + 2, w.y + 2, w.w, w.h, '#0b1830');                                 // тінь
        R(g, w.x - 1 + sh, w.y - 1, w.w + 2, w.h + 2, 'd'); R(g, w.x + sh, w.y, w.w, w.h, 'w');
        R(g, w.x + sh, w.y, w.w, 7, w.c);
        R(g, w.x + w.w - 8 + sh, w.y + 1, 6, 5, 'r'); R(g, w.x + w.w - 7 + sh, w.y + 2, 4, 1, 'w'); R(g, w.x + w.w - 7 + sh, w.y + 4, 4, 1, 'w');   // кнопка «×»
        R(g, w.x + 3 + sh, w.y + 2, 12, 2, 'w');
        if (w.k === 0) { R(g, w.x + 4 + sh, w.y + 11, w.w - 8, 5, 'y'); R(g, w.x + 4 + sh, w.y + 19, w.w - 20, 2, 'e'); R(g, w.x + w.w - 14 + sh, w.y + w.h - 9, 10, 5, 'g'); }
        else if (w.k === 1) { R(g, w.x + 4 + sh, w.y + 10, 14, 14, 'f'); R(g, w.x + 21 + sh, w.y + 11, w.w - 26, 2, 'k'); R(g, w.x + 21 + sh, w.y + 16, w.w - 30, 2, 'e'); R(g, w.x + 21 + sh, w.y + 21, w.w - 34, 2, 'e'); }
        else { R(g, w.x + 4 + sh, w.y + 10, w.w - 8, w.h - 14, 'o'); R(g, w.x + 6 + sh, w.y + 12, 3, 3, 'k'); R(g, w.x + 11 + sh, w.y + 12, w.w - 20, 3, 'w'); R(g, w.x + 6 + sh, w.y + 18, w.w - 12, 2, 'y'); }
      });
      S.fx.forEach(f => { const u = f.t / 0.35; g.globalAlpha = 1 - u; for (let i = 0; i < 6; i++) { const an = i * 1.047, d = 4 + u * 14; R(g, Math.round(f.x + Math.cos(an) * d), Math.round(f.y + Math.sin(an) * d * 0.8), 2, 2, i % 2 ? 'y' : f.c); } g.globalAlpha = 1; });
      if (show) { g.globalAlpha = 0.55; R(g, 0, 14, W, 97, '#0b1830'); g.globalAlpha = 1; }
      mgPrize(g, G, T, 96, 62);
      mgBars(g, o, G);
    }
  };
  mgMake(4, o);
})();

(function () {
  const UK = {
    mgScore: 'Влучань: {0} з {1}', mgWait: 'Бонус-гра цієї епохи буде готова через {0}', mgBonusTitle: 'Бонус-гра', mgPerfect: 'Ідеально! Ось твій скін!', mgNear: 'Майже! Спробуй ще раз.', mgMiss: 'Не вийшло. Спробуй ще раз!',
    mgDanceTitle: 'Танцпол Диско-Капі',
    mgDanceSub: 'Плитки спалахують і гаснуть. Тапай світні вчасно, а на темні не наступай!', mgDanceStart: 'Танцювати!', mgDanceDone: 'Гарно потанцювали!',
    mgSpamTitle: 'Спам-бомба', mgSpamSub: 'Вікна-спам лізуть на екран. Закривай їх тапом, поки не завалило!', mgSpamStart: 'Закривати!', mgSpamDone: 'Екран чистий!'
  };
  const EN = {
    mgScore: 'Hits: {0} of {1}', mgWait: 'The bonus game of this era will be ready in {0}', mgBonusTitle: 'Bonus game', mgPerfect: 'Perfect! Here is your skin!', mgNear: 'So close! Try again.', mgMiss: 'Not this time. Try again!',
    mgDanceTitle: 'Disco Capy Dance Floor',
    mgDanceSub: 'Tiles light up and fade. Tap the glowing ones in time and keep off the dark ones!', mgDanceStart: 'Dance!', mgDanceDone: 'What a dance!',
    mgSpamTitle: 'Spam Bomb', mgSpamSub: 'Spam windows pop up everywhere. Tap them shut before they pile up!', mgSpamStart: 'Close them!', mgSpamDone: 'Screen is clean!'
  };
  Object.assign(translations.uk, UK); Object.assign(translations.en, EN);
})();
