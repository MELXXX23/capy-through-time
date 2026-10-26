//#part 230_a2_skins_circus_hag.js
function hagReset() {
  const main = mgSkinSector(), dec = { kind: 'crystal', amount: 1, icon: 'gem', color: 'u' }, top = Math.floor(Math.random() * 3);
  hagGame.c = [0, 1, 2].map(i => ({ slot: i, lid: 1, prize: i === top ? main : dec, main: i === top, dim: false }));
  hagGame.phase = 'idle'; hagGame.t = 0; hagGame.pick = -1; hagGame.top = top; hagGame.si = 0; hagGame.st = 0; hagGame.rt = 0;
  hagGame.swaps = [0.36, 0.32, 0.29, 0.26, 0.24, 0.22, 0.2, 0.19, 0.18, 0.17];
  hagGame.pairs = hagGame.swaps.map((d, i) => { let a = Math.floor(Math.random() * 3), b = (a + 1 + Math.floor(Math.random() * 2)) % 3; return [a, b]; });
}
function hagStart() {
  if (circusBusy() || state.circus.spun) return;
  state.circus.spun = 1; hagReset(); hagGame.phase = 'show'; hagGame.t = 0;
  ui.circusResult.textContent = t('hagWatch'); updateCircusButtons(); saveGame(); playSfx('hagCackle');
}
function updateHagGame(dt) {
  const G = hagGame; G.t += dt;
  if (G.phase === 'show') {
    G.c.forEach(c => { c.lid = G.t < 0.35 ? 1 - G.t / 0.35 : G.t < 2.5 ? 0 : Math.min(1, (G.t - 2.5) / 0.4); });
    if (G.t >= 2.9) { G.phase = 'shuffle'; G.si = 0; G.st = 0; ui.circusResult.textContent = t('hagShuffle'); }
  } else if (G.phase === 'shuffle') {
    G.st += dt; const dur = G.swaps[G.si];
    if (G.st >= dur) {
      const [a, b] = G.pairs[G.si], ca = G.c.find(c => c.slot === a), cb = G.c.find(c => c.slot === b);
      if (ca && cb) { ca.slot = b; cb.slot = a; }
      G.si++; G.st = 0; if (G.si % 2 === 0) playSfx('wheelTick');
      if (G.si >= G.swaps.length) { G.phase = 'pick'; ui.circusResult.textContent = t('hagPick'); }
    }
  } else if (G.phase === 'reveal') {
    G.rt += dt; const ch = G.c[G.pick];
    ch.lid = Math.max(0, 1 - G.rt / 0.4);
    if (G.rt > 1.0) G.c.forEach((c, i) => { if (i !== G.pick) { c.lid = Math.max(0, 1 - (G.rt - 1.0) / 0.4); c.dim = true; } });
    if (G.rt > 2.4) { G.phase = 'done'; updateCircusButtons(); ui.circusClose.textContent = t('hagDone'); }
  }
}
function hagPos(c) {                                          // де зараз казанок (під час обміну двох — дугою один спереду, другий позаду)
  const G = hagGame; let x = HAG_X[c.slot], y = HAG_CY;
  if (G.phase === 'shuffle' && G.si < G.swaps.length) {
    const [a, b] = G.pairs[G.si], u0 = Math.min(1, G.st / G.swaps[G.si]), u = u0 * u0 * (3 - 2 * u0);
    if (c.slot === a) { x = HAG_X[a] + (HAG_X[b] - HAG_X[a]) * u; y += Math.sin(u * Math.PI) * 18; }
    else if (c.slot === b) { x = HAG_X[b] + (HAG_X[a] - HAG_X[b]) * u; y -= Math.sin(u * Math.PI) * 12; }
  }
  return { x: Math.round(x), y: Math.round(y) };
}
function hagClick(e) {
  if (circus.bonus) { mgClick(e); return; }
  if (state.circus.noodle) { noodleClick(); return; }
  const G = hagGame; if (G.phase !== 'pick') return;
  const cv = ui.circusWheel, r = cv.getBoundingClientRect(), lx = (e.clientX - r.left) * cv.width / r.width, ly = (e.clientY - r.top) * cv.height / r.height;
  let best = -1, bd = 1e9; G.c.forEach((c, i) => { const p = hagPos(c), d = Math.abs(lx - p.x); if (d < 27 && ly > 56 && d < bd) { bd = d; best = i; } });
  if (best < 0) return;
  G.pick = best; G.phase = 'reveal'; G.rt = 0;
  const c = G.c[best], pr = applyCircusSector(c.prize, Date.now());
  ui.circusResult.textContent = t(c.main ? 'hagGood' : 'hagMiss') + ' ' + pr.text;
  playSfx(c.main ? 'wheelWin' : 'pip'); buzz(25);
  if (pr.skin >= 0) setTimeout(() => openLoot(pr.skin), 1500); else showToast(pr.text, 'good');
  updateUI(); saveGame(); updateCircusButtons();
}
// казанок і сцена — у 230_a5_hag_scene.js (hagCauldronV2, drawHagGame)

/* ---- логіка ---- */
function circusStopX() { return mailBoxX() + 150; }   // стоїть на дорозі прямо над поштоматом (так, щоб шатра повністю його закрили) — прив'язаний до дороги, а не до екрана
function circusStartX() { return circus.sx !== undefined ? circus.sx : Math.max(visR() + 90, circusStopX() + 150); }   // звідки в'їжджає: трохи правіше від того, що видно в момент тапу, далі їде по дорозі
function bangPos() {
  const hi = TEAM.findIndex(m => m.spot && m.spot.x === null), hx = hi >= 0 ? actorHome(TEAM[hi]) : 0;      // «!» стоїть правіше за їжака з касою, щоб не перекривати його
  let x = Math.max(shop.x + shop.w + 50, hx + 36);
  if (x > visR() - 12) x = Math.max(visL() + 14, shop.x - 36);                                        // справа немає місця (телефон): ліворуч від магазину
  return { x, y: LAYOUT.streetTop + 9 };
}   // «!» стоїть далеко праворуч від магазину, щоб не заважав обзору й тапам   // «!» стоїть біля самого магазину, на тротуарі біля правої стіни
function circusY() { return mailRoadY() + 2; }
function circusQuiet() { return !dialog.active && !epochIntro.active && !build && !trouble && !ghostHunt && ui.modal.hidden && ui.letterModal.hidden && ui.circusModal.hidden; }
function updateCircus(dt) {
  const c = state.circus, now = Date.now();
  circus.t += dt;
  // уже стоїть/їде візок — вигляд за поточною епохою (у Японії лапшична, не цирк), поки вікно гри закрите
  if (c.phase > 0 && !c.hag && ui.circusModal.hidden) c.noodle = viewEpoch() === 8 ? 1 : 0;
  const dayMs = CONFIG.DAY_SECONDS * 1000;
  if (!c.next) c.next = now + CONFIG.CIRCUS_FIRST_MINUTES * 60000;
  if (!circus.inited) {                           // після перезапуску цирк уже стоїть розкладений (або від'їжджає)
    circus.inited = true;
    if (c.phase === 2 || c.phase === 2.5 || c.phase === 2.7) { c.phase = 3; circus.setup = 1; }
    else if (c.phase === 3.5) c.phase = 4;
    if (c.phase === 3) circus.setup = 1;
  }
  if (c.phase === 0) {
    if (now >= c.next && circusQuiet() && mail.state === 'idle') { c.next = now + dayMs * circusFreq() * (1.0 + 0.6 * Math.random()); c.phase = 1; c.spun = 0; c.hag = theme.season === 'halloween' ? 1 : 0; c.noodle = (!c.hag && viewEpoch() === 8) ? 1 : 0; circus.bangT = 0; hagFly.on = false; hagFly.fast = false; hagFly.wait = 1.2; playSfx(c.hag ? 'hagTheme' : c.noodle ? 'noodleTheme' : 'circusMarch'); showToast(t(c.hag ? 'hagBang' : c.noodle ? 'noodleBang' : 'circusBang'), 'good'); saveGame(); }
  } else if (c.phase === 1) {                      // «!» чекає на тап, а з часом зникає (гравець сам вирішує, чи тикати)
    circus.bangT += dt;
    if (circus.bangT > CONFIG.CIRCUS_BANG_SECONDS) { c.phase = 0; saveGame(); }
  } else if (c.phase === 2.5) {                    // їде справа наліво
    if (c.hag && circus.hold) {                    // спершу Баба Яга пролітає, потім хатка виходить на дорогу
      circus.holdT += dt; circus.x = circusStartX(); circus.drive = 0; circus.setup = 0;
      if (!hagFly.on || circus.holdT > 1.6) circus.hold = false;
    }
    if (!(c.hag && circus.hold)) circus.drive += dt;
    const k = Math.min(1, circus.drive / (c.hag ? 6 : CONFIG.CIRCUS_DRIVE_SECONDS));
    circus.x = circusStartX() + (circusStopX() - circusStartX()) * k;
    circus.setup = 0;
    if (k >= 1 && !(c.hag && circus.hold)) { c.phase = 2.7; circus.x = circusStopX(); circus.setupT = 0; playSfx(c.hag ? 'hagCackle' : 'build'); if (c.hag) spawnDust(circus.x, circusY(), 6); }
  } else if (c.phase === 2.7) {                    // шатро розкладається: колеса й платформа зникають, вилазять три куполи, виходить клоун
    circus.setupT += dt; circus.x = circusStopX();
    circus.setup = Math.min(1, circus.setupT / CONFIG.CIRCUS_SETUP_SECONDS);
    if (circus.setup >= 1) { c.phase = 3; showToast(t(c.hag ? 'hagArrived' : c.noodle ? 'noodleArrived' : 'circusArrived'), 'good'); playSfx('wheelWin'); saveGame(); }
  } else if (c.phase === 3) {
    circus.x = circusStopX(); circus.setup = 1;
  } else if (c.phase === 3.5) {                    // збирається назад
    circus.setupT -= dt; circus.x = circusStopX();
    circus.setup = Math.max(0, circus.setupT / CONFIG.CIRCUS_SETUP_SECONDS);
    if (circus.setup <= 0) { c.phase = 4; playSfx('pip'); }
  } else if (c.phase === 4) {                      // від'їжджає ліворуч
    circus.x -= (c.hag ? 48 : 60) * dt;
    if (circus.x < worldL() - 140) { c.phase = 0; if (c.next < now + 3 * 60000) c.next = now + 3 * 60000; saveGame(); }
  }
  updateHagFly(dt);
  updateCircusSpin(dt);
  if (c.hag) updateHagGame(dt);
  if (c.noodle) updateNoodleGame(dt);
  updateBonusGame(dt); updateBonusBtn(dt);
  if (!ui.circusModal.hidden) { const g = ui.clownCanvas.getContext('2d'); g.imageSmoothingEnabled = false; if (circus.bonus) { mgDraw(); } else if (c.hag) { drawHagGame(); HAG_ART.window(g, circus.t); } else if (c.noodle) { drawNoodleGame(); NOODLE_ART.window(g, circus.t); } else { drawCircusWheel(); CIRCUS_ART.clownWindow(g, circus.t); } }
}
/* ---- Баба Яга ---- */
// відьма в небі: політ, коло й спуск — у 230_a3_hag_v2.js (hagFly, hagStartFlight, hagTap, updateHagFly, drawHagFlyer)

const HAG_ART = (function () {
  function leg(g, x, hipY, footY, lift, sw) {                   // куряча лапа спереду: пухнасте «галіфе», гомілка нахиляється разом із кроком, пальці віялом із кігтями
    const fy = footY - lift, ax = x + sw, ay = fy - 6, y0 = hipY + 8;
    for (let d = -3; d <= 3; d++) lineG(g, x + d, y0, ax + d, ay, 'd');
    for (let d = -2; d <= 2; d++) lineG(g, x + d, y0, ax + d, ay, 'h');
    for (let d = -2; d <= -1; d++) lineG(g, x + d, y0, ax + d, ay, 'y');
    for (let k = 1; k < 5; k++) { const px = Math.round(x + (ax - x) * k / 5), py = Math.round(y0 + (ay - y0) * k / 5); R(g, px - 1, py, 4, 1, 'o'); }
    R(g, x - 8, hipY, 17, 7, 'd'); R(g, x - 7, hipY + 1, 15, 5, 'w'); R(g, x - 7, hipY + 1, 4, 5, 'W');
    [-8, -4, 0, 4, 7].forEach((dx, i) => { R(g, x + dx, hipY + 7, 3, 2 + (i % 2), 'd'); R(g, x + dx + 1, hipY + 7, 1, 1 + (i % 2), 'w'); });
    R(g, ax - 5, ay - 1, 10, 3, 'd'); R(g, ax - 4, ay, 8, 1, 'h');
    for (let d = 0; d < 3; d++) { lineG(g, ax - 1 + d, ay + 1, ax - 9 + d, fy, 'd'); lineG(g, ax - 1 + d, ay + 2, ax - 9 + d, fy, 'd'); lineG(g, ax + d + 1, ay + 1, ax + 9 + d, fy, 'd'); lineG(g, ax + d + 1, ay + 2, ax + 9 + d, fy, 'd'); }
    R(g, ax - 2, ay + 1, 4, fy - ay, 'd');
    lineG(g, ax - 1, ay + 1, ax - 9, fy, 'h'); lineG(g, ax + 2, ay + 1, ax + 10, fy, 'h'); R(g, ax - 1, ay + 1, 2, fy - ay, 'h');
    R(g, ax - 12, fy - 1, 4, 2, 'k'); R(g, ax + 10, fy - 1, 4, 2, 'k'); R(g, ax - 2, fy, 4, 1, 'k');
  }
  function face(g, cx, top, k, t) {                              // обличчя відьми: капелюх, рожеве волосся, блідий лик і усмішка
    const Rk = (dx, dy, w, h, c) => R(g, cx + dx * k, top + dy * k, w * k, h * k, c);
    const blink = (t % 3.2) > 3.05;
    Rk(-1, -2, 3, 1, 'V'); Rk(-2, -1, 5, 1, 'V'); Rk(-3, 0, 7, 1, 'V'); Rk(-1, 0, 3, 1, 'y'); Rk(-6, 1, 13, 2, 'V'); Rk(-6, 1, 2, 1, 'v');
    Rk(-6, 3, 3, 8, 'f'); Rk(-6, 3, 1, 8, 'J'); Rk(4, 3, 3, 6, 'f'); Rk(6, 3, 1, 6, 'J');
    Rk(-3, 3, 7, 8, 'W'); Rk(-3, 3, 7, 1, 'f'); Rk(-3, 3, 2, 2, 'f');
    if (blink) { Rk(-2, 7, 2, 1, 'k'); Rk(2, 7, 2, 1, 'k'); } else { Rk(-2, 6, 1, 2, 'k'); Rk(2, 6, 1, 2, 'k'); }
    Rk(-3, 8, 2, 1, 'q'); Rk(2, 8, 2, 1, 'q'); Rk(0, 9, 2, 1, 'r'); Rk(-2, 11, 5, 1, 'W');
  }
  function draw(g, t, s, moving) {
    g.clearRect(0, 0, 160, 84);
    const ss = s * s * (3 - 2 * s), walk = moving ? t * 5.2 : 0;
    const bob = moving ? Math.round(Math.abs(Math.sin(walk)) * 1.6) : 0, hipY = 56 + Math.round(ss * 18) - bob;
    const cabB = hipY + 3, cabH = 32, cabT = cabB - cabH, x0 = 44, x1 = 116, W = x1 - x0, groundY = 83;
    const stA = moving ? Math.sin(walk) : 0, stB = moving ? Math.sin(walk + Math.PI) : 0;
    leg(g, 66, hipY, groundY, Math.round(Math.max(0, stA) * 8), Math.round(stA * 3));
    leg(g, 96, hipY, groundY, Math.round(Math.max(0, stB) * 8), Math.round(stB * 3));
    // кістяний паркан й гарбузи, коли хатка присіла
    if (ss > 0.5) {
      const a = Math.min(1, (ss - 0.5) * 2); g.globalAlpha = a;
      [[16, 0], [28, 1], [132, 1], [144, 0]].forEach(([fx, tall]) => { R(g, fx, 70 + tall * 2, 2, 12 - tall * 2, 'd'); R(g, fx, 71 + tall * 2, 1, 11 - tall * 2, 'w'); R(g, fx - 2, 66 + tall * 2, 6, 5, 'd'); R(g, fx - 1, 67 + tall * 2, 4, 3, 'w'); R(g, fx - 1, 68 + tall * 2, 1, 1, 'k'); R(g, fx + 2, 68 + tall * 2, 1, 1, 'k'); });
      R(g, 28, 76, 104, 1, 'd');
      [[56, 80], [104, 80]].forEach(([px, py]) => { R(g, px - 5, py - 6, 11, 7, 'd'); R(g, px - 4, py - 5, 9, 5, 'o'); R(g, px - 4, py - 5, 3, 5, 'h'); R(g, px - 2, py - 4, 1, 1, 'k'); R(g, px + 2, py - 4, 1, 1, 'k'); R(g, px - 1, py - 2, 3, 1, 'k'); R(g, px, py - 8, 2, 2, 'g'); });
      g.globalAlpha = 1;
    }
    // стіни з колод
    R(g, x0, cabT, W, cabH, 'd'); R(g, x0 + 1, cabT + 1, W - 2, cabH - 2, 'b');
    for (let y = cabT + 6; y < cabB - 1; y += 6) { R(g, x0 + 1, y, W - 2, 1, 'd'); R(g, x0 + 1, y - 5, W - 2, 1, 'l'); }
    for (let y = cabT + 4; y < cabB - 2; y += 6) { R(g, x0 - 2, y - 2, 4, 5, 'd'); R(g, x0 - 1, y - 1, 2, 3, 'c'); R(g, x1 - 2, y - 2, 4, 5, 'd'); R(g, x1 - 1, y - 1, 2, 3, 'c'); }
    // вікна: тепле світло, фіранка
    const wf = Math.floor(t * 6) % 7 === 0 ? 'h' : 'y';
    [50, 98].forEach(wx => {
      const wy = cabT + 8;
      R(g, wx - 5, wy, 4, 13, 'k'); R(g, wx - 4, wy + 1, 2, 11, 'G'); R(g, wx - 4, wy + 1, 1, 11, 'g'); R(g, wx + 13, wy, 4, 13, 'k'); R(g, wx + 14, wy + 1, 2, 11, 'G'); R(g, wx + 15, wy + 1, 1, 11, 'g');   // віконниці
      R(g, wx - 1, wy - 1, 14, 14, 'k');
      [[0, 0], [7, 0], [0, 7], [7, 7]].forEach(([dx, dy]) => { R(g, wx + dx, wy + dy, 5, 5, wf); R(g, wx + dx, wy + dy, 2, 1, 'w'); R(g, wx + dx, wy + dy + 4, 5, 1, 'h'); });
      R(g, wx + 5, wy, 2, 12, 'd'); R(g, wx, wy + 5, 12, 2, 'd');
      R(g, wx, wy, 4, 2, 'r'); R(g, wx + 8, wy, 4, 2, 'r'); R(g, wx, wy + 2, 2, 1, 'r'); R(g, wx + 10, wy + 2, 2, 1, 'r');
      R(g, wx - 2, wy + 13, 16, 2, 'k'); R(g, wx - 2, wy + 13, 16, 1, 'l');
    });
    // двері: відчиняються, всередині тепло й видно Бабу Ягу
    const open = Math.max(0, Math.min(1, (s - 0.6) / 0.3));
    R(g, 72, cabB - 24, 17, 24, 'd'); R(g, 73, cabB - 23, 15, 23, open > 0.05 ? 'k' : 'P');
    if (open > 0.05) {
      R(g, 74, cabB - 22, 13, 22, 'o'); R(g, 74, cabB - 22, 13, 8, 'h');
      if (s > 0.85) { const wv = Math.floor(t * 2.5) % 2; face(g, 80, cabB - 21, 1, t); R(g, 76, cabB - 8, 9, 8, 'd'); R(g, 77, cabB - 8, 7, 8, 'P'); R(g, wv ? 85 : 86, cabB - 12 - wv * 2, 2, 5, 'm'); }
      R(g, 73, cabB - 23, Math.max(1, Math.round(3 * (1 - open))), 23, 'P');
    } else { R(g, 74, cabB - 22, 3, 22, 'u'); R(g, 78, cabB - 16, 1, 1, 'h'); R(g, 80, cabB - 17, 5, 4, 'd'); R(g, 81, cabB - 16, 3, 2, 'w'); R(g, 81, cabB - 16, 1, 1, 'k'); R(g, 83, cabB - 16, 1, 1, 'k'); }
    R(g, 74, cabB, 14, 2, 'e'); R(g, 74, cabB, 14, 1, 'E');
    // дах із черепиці й моху
    const apex = cabT - 25, ov = 8, half0 = W / 2 + ov;
    for (let r = 0; r < 25; r++) {
      const half = Math.round(half0 * (r + 1) / 25), y = apex + r;
      R(g, 80 - half, y, half * 2, 1, r % 4 === 3 ? 'd' : (r % 2 ? 'r' : 't'));
      R(g, 80 - half, y, 1, 1, 'd'); R(g, 80 + half - 1, y, 1, 1, 'd');
      for (let k = (r % 2) * 3; k < half * 2; k += 6) if (r % 4 !== 3) R(g, 80 - half + k, y, 1, 1, 'd');
      if ((r * 7) % 11 < 3) R(g, 80 - half + 6 + (r * 5) % 20, y, 5, 1, 'g');
    }
    R(g, 80 - half0, cabT - 2, half0 * 2, 3, 'd'); R(g, 80 - half0, cabT - 2, half0 * 2, 1, 'b');
    R(g, 78, apex - 1, 4, 2, 'd');
    R(g, 100, apex + 3, 9, 15, 'd'); R(g, 101, apex + 4, 7, 14, 'e'); R(g, 99, apex + 2, 11, 3, 'd'); R(g, 100, apex + 3, 9, 1, 'E');                       // димар
    for (let k = 0; k < 4; k++) { const ph = (t * 0.5 + k / 4) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.6; R(g, 103 + Math.round(Math.sin(t + k) * 3) + Math.round(ph * 8), apex - Math.round(ph * 22), 4 - Math.round(ph * 2) + 1, 3, k % 2 ? 'E' : 'w'); }
    g.globalAlpha = 1;
    R(g, 58, apex + 14, 4, 3, 'd'); R(g, 59, apex + 14, 2, 1, 'k'); R(g, 56, apex + 16, 2, 1, 'k'); R(g, 62, apex + 15, 2, 1, 'k'); R(g, 58, apex + 15, 1, 1, 'y');        // ворона на даху
    R(g, 52, cabT + 1, 1, 5, 'd'); R(g, 50, cabT + 6, 5, 7, 'd'); R(g, 51, cabT + 7, 3, 5, wf === 'h' ? 'h' : 'o'); R(g, 52, cabT + 8, 1, 2, 'y');                     // ліхтарик
  }
  const BUST = ['........kk........', '.......kPPk.......', '......kPvPPk......', '.....kPvPPPPk.....', '....kPPvPPPPPk....', '....kPPPPPPPPPk...', '...kPPyyyyyPPPPk..', '.kkkPPPPPPPPPPkkk.', 'kPPPPPPPPPPPPPPPPk', '.kJfkWWWWWWWWkfJk.', 'kfffkWWWWWWWWkfffk', 'kfffkWWkWWkWWkfffk', 'kfffkWqWWWWqWkfffk', 'kJffkWWWrrWWWkffJk', '.kffkkWWWWWWkkffk.', '..kffkkVVVVkkffk..', '.kPPPPPPPPPPPPPPk.', 'kPPPPPuuPPuuPPPPPk'];
  function window_(g, t) {                                       // портрет відьми у вікні хатки на тлі місяця (72×40)
    g.clearRect(0, 0, 72, 40);
    R(g, 0, 0, 72, 40, 'v'); R(g, 0, 20, 72, 20, 'u'); R(g, 0, 32, 72, 8, 'P');
    for (let i = 0; i < 14; i++) if (Math.sin(t * 2 + i) > -0.6) R(g, (i * 29 + 7) % 72, (i * 13 + 3) % 22, 1, 1, i % 3 ? 'w' : 'y');
    disc(g, 10, 11, 7, 'd'); disc(g, 10, 11, 6, 'o'); disc(g, 8, 9, 4, 'h'); R(g, 12, 12, 3, 2, 'o');
    const bx = Math.round(56 + Math.sin(t * 0.7) * 9), by = Math.round(7 + Math.sin(t * 1.9) * 2), fl = Math.floor(t * 8) % 2;
    R(g, bx - 1, by, 3, 2, 'k'); R(g, bx - 5, by - (fl ? 2 : 0), 4, 1, 'k'); R(g, bx + 2, by - (fl ? 2 : 0), 4, 1, 'k');
    const bob = Math.round(Math.sin(t * 2) * 1), blink = (t % 3.2) > 3.05;
    BUST.forEach((r, j) => { for (let i = 0; i < r.length; i++) { let c = r[i]; if (c === '.') continue; if (blink && j === 11 && c === 'k' && (i === 7 || i === 10)) c = 'W'; R(g, 18 + i * 2, 1 + bob + j * 2, 2, 2, c); } });
    R(g, 0, 36, 72, 4, 'd'); R(g, 0, 36, 72, 1, 'b');
    for (let i = 0; i < 5; i++) { R(g, 6 + i * 14, 33, 1, 4, 'w'); R(g, 5 + i * 14, 32, 3, 2, 'w'); }
  }
  return { draw: (g, t, s, moving) => hutV2(g, t, s, moving), window: hagPortraitV2 };
})();
