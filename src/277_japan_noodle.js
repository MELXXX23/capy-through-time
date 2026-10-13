//#part 277_japan_noodle.js
/* =====================================================================
   ЛАПШИЧНА ДІДА РЬО (бонусна епоха «Японія»): замість Цирку Фортуни в Японії приїжджає візок-ятай із рамен-бар.
   Старенький Дід Рьо сам тягне візок, на місці стає за прилавок, розгортає навіс, засвічує ліхтарі й пропонує свою гру «Звари лапшу»:
   смужка варіння біжить зліва направо — тапни, коли лапша ідеальна (зелена зона). Ідеально — головний приз колеса,
   майже — 2 кристали, не влучив — 1 кристал. Логіка фаз візка (їде, розкладається, стоїть, складається) — та сама, що в цирку (230_a, state.circus.noodle).
   Малюнки: NOODLE_ART.draw(g, t, s, moving) 160×84 (як CIRCUS_ART), NOODLE_ART.window(g, t) 72×40; гра — drawNoodleGame() на полотні 192×120.
   ===================================================================== */
const NOODLE_BUST = [                                  // голова діда (18 колонок), 1× на вулиці й 2× у вікні
  '.....kkkkkkkk.....', '...kWWWWWWWWWWk...', '...kwwwwwwwwwwk...', '...kwwwwrrwwwwk...', '..kEkWWWWWWWWkEk..', '..kEkWEEWWEEWkEk..',
  '..kEkWkWWWWkWkEk..', '...kkWWWWWWWWkk...', '....kWqWllWqWk....', '....kwwwwwwwwk....', '...kwwwEwwEwwwk...', '...kwwwwwwwwwwk...', '....kwwwwwwwwk....',
  '.nnnnkwwwwwwknnnn.', 'nnnnnnkwwwwknnnnnn', 'nnnnnnnkwwknnnnnnn', 'nnnnnnnnnnnnnnnnnn'
].map(r => r.replace(/W/g, 'c'));   // шкіра — пісочна, щоб біла борода читалась
const noodleGame = { phase: 'idle', t: 0, p: 0, zc: 0.6, rt: 0, res: '', prize: null, main: false };
const NOODLE_ZH = 0.055, NOODLE_ZN = 0.15;             // половина ширини ідеальної й «майже» зон (частка шкали)
const NOODLE_ART = (function () {
  function head(g, x0, y0, rows, k) {                    // k — масштаб 1 або 2; рядки 0…rows-1 з NOODLE_BUST
    for (let j = 0; j < rows; j++) { const r = NOODLE_BUST[j]; for (let i = 0; i < r.length; i++) { const c = r[i]; if (c !== '.') R(g, x0 + i * k, y0 + j * k, k, k, c); } }
  }
  function elder(g, cx, fy, walk, hat, t) {              // дід: ноги, тулуб (синє хаппі + білий фартух), голова, капелюх-каса в дорозі
    const st = Math.sin(walk), l1 = walk ? Math.round(Math.max(0, st) * 3) : 0, l2 = walk ? Math.round(Math.max(0, -st) * 3) : 0;
    R(g, cx - 4, fy - 6 - l1, 3, 6, 'z'); R(g, cx + 1, fy - 6 - l2, 3, 6, 'z'); R(g, cx - 5, fy - l1 - 1, 5, 2, 'd'); R(g, cx + 1, fy - l2 - 1, 5, 2, 'd');
    R(g, cx - 5, fy - 17, 10, 11, 'd'); R(g, cx - 4, fy - 16, 8, 9, 'n'); R(g, cx - 3, fy - 11, 6, 5, 'w'); R(g, cx - 3, fy - 11, 6, 1, 'E'); R(g, cx - 1, fy - 16, 2, 5, 'w');
    R(g, cx - 8, fy - 16, 3, 9, 'd'); R(g, cx - 7, fy - 15, 1, 7, 'n'); R(g, cx + 5, fy - 16, 3, 9, 'd'); R(g, cx + 6, fy - 15, 1, 7, 'n'); R(g, cx - 8, fy - 8, 3, 2, 'c'); R(g, cx + 5, fy - 8, 3, 2, 'c');
    head(g, cx - 9, fy - 17 - 13 + 1, 13, 1);
    if (hat) { const hy = fy - 29;                       // солом'яний капелюх-каса
      for (let r = 0; r < 6; r++) { const hw = 3 + r * 2; R(g, cx - hw, hy + r - 3, hw * 2, 1, r % 2 ? 'h' : 'c'); R(g, cx - hw, hy + r - 3, 1, 1, 'd'); R(g, cx + hw - 1, hy + r - 3, 1, 1, 'd'); }
      R(g, cx - 10, hy + 3, 20, 1, 'd');
    }
  }
  function chochin(g, x, y, lit, t) {                    // червоний паперовий ліхтар (7×10) на мотузочці
    R(g, x + 3, y - 3, 1, 3, 'd');
    if (lit > 0) { g.globalAlpha = 0.3 * lit * (0.85 + 0.15 * Math.sin(t * 7 + x)); disc(g, x + 3, y + 5, 9, 'j'); g.globalAlpha = 1; }
    R(g, x + 1, y, 5, 1, 'd'); R(g, x, y + 1, 7, 8, 'd'); R(g, x + 1, y + 1, 5, 8, lit > 0.5 ? 'r' : 'R'); R(g, x + 1, y + 2, 2, 6, lit > 0.5 ? 'o' : 'r'); R(g, x + 1, y + 4, 5, 1, 'd'); R(g, x + 1, y + 6, 5, 1, 'd'); R(g, x + 1, y + 9, 5, 1, 'd');
    R(g, x + 3, y + 10, 1, 2, 'h');
  }
  function wheel(g, cx, ang) {
    const cy = 75; disc(g, cx, cy, 8, 'd'); disc(g, cx, cy, 7, 'l'); disc(g, cx, cy, 5, 'b');
    for (let k = 0; k < 4; k++) { const a = ang + k * Math.PI / 4, dx = Math.round(Math.cos(a) * 5), dy = Math.round(Math.sin(a) * 5); lineG(g, cx + dx, cy + dy, cx - dx, cy - dy, 'd'); }
    disc(g, cx, cy, 2, 'd'); R(g, cx, cy, 1, 1, 'c');
  }
  function draw(g, t, s, moving) {
    g.clearRect(0, 0, 160, 84);
    const ss = s * s * (3 - 2 * s), walkT = t * 6;
    const u = Math.min(1, ss / 0.55), v = Math.max(0, Math.min(1, (ss - 0.55) / 0.35));
    const walking = moving || (u > 0 && u < 1);
    const ex = moving ? 24 : Math.round(24 + 70 * u), ef = moving ? 83 : Math.round(83 - 25 * v);
    const bob = moving ? Math.round(Math.abs(Math.sin(walkT)) * 1) : 0, o = -bob;
    const hat = ss < 0.6;
    // дід (позаду візка; в дорозі тягне попереду)
    if (ex < 46) lineG(g, 47, 62 + o, ex + 6, ef - 11, 'd');
    elder(g, ex, ef, walking ? walkT : 0, hat, t);
    if (ex < 46) { R(g, ex + 5, ef - 9, 3, 2, 'c'); }
    // колеса
    wheel(g, 60, moving ? t * 5 : 0.4); wheel(g, 100, moving ? t * 5 : 0.4);
    // корпус
    R(g, 48, 54 + o, 65, 15, 'd'); R(g, 49, 55 + o, 63, 13, 'b'); R(g, 49, 61 + o, 63, 1, 'l'); R(g, 49, 65 + o, 63, 1, 'd');
    R(g, 54, 57 + o, 20, 8, 'd'); R(g, 55, 58 + o, 18, 6, 'r'); R(g, 55, 58 + o, 18, 1, 'o'); R(g, 62, 58 + o, 4, 6, 'w'); R(g, 63, 60 + o, 2, 2, 'r');
    disc(g, 98, 61 + o, 4, 'd'); disc(g, 98, 61 + o, 3, 'w'); disc(g, 98, 61 + o, 1, 'r');
    R(g, 106, 55 + o, 1, 13, 'd'); R(g, 50, 55 + o, 1, 13, 'l');
    // прилавок і начиння
    R(g, 43, 51 + o, 75, 3, 'd'); R(g, 44, 51 + o, 73, 2, 'c'); R(g, 44, 51 + o, 73, 1, 'y');
    R(g, 57, 40 + o, 21, 3, 'd'); R(g, 58, 40 + o, 19, 1, 'E'); R(g, 58, 42 + o, 19, 9, 'd'); R(g, 59, 43 + o, 17, 8, 'e'); R(g, 59, 43 + o, 3, 8, 'E'); R(g, 55, 43 + o, 3, 2, 'd'); R(g, 77, 43 + o, 3, 2, 'd');
    R(g, 102, 47 + o, 9, 5, 'd'); R(g, 103, 48 + o, 7, 3, 'w'); R(g, 103, 48 + o, 7, 1, 'r'); R(g, 103, 43 + o, 8, 4, 'd'); R(g, 104, 44 + o, 6, 2, 'w'); R(g, 104, 44 + o, 6, 1, 'r');
    // черпак діда в казані
    if (v > 0.8) { const lx = 66 + Math.round(Math.sin(t * 3) * 3); lineG(g, ex - 8, ef - 13, lx, 41 + o, 'd'); R(g, lx - 1, 40 + o, 3, 2, 'e'); }
    // стійки, дах, фіранка-норен
    R(g, 49, 19 + o, 2, 33, 'd'); R(g, 50, 19 + o, 1, 33, 'b'); R(g, 110, 19 + o, 2, 33, 'd'); R(g, 111, 19 + o, 1, 33, 'b');
    for (let r = 0; r < 9; r++) {
      const half = 29 + r + (r > 6 ? 1 : 0), y = 10 + r + o, col = r % 3 === 2 ? 'd' : (r % 2 ? 'z' : 'n');
      R(g, 80 - half, y, half * 2, 1, col); R(g, 80 - half, y, 1, 1, 'd'); R(g, 80 + half - 1, y, 1, 1, 'd');
      for (let k = (r % 2) * 3; k < half * 2; k += 6) if (col !== 'd') R(g, 80 - half + k, y, 1, 1, 'd');
    }
    R(g, 80 - 38, 17 + o, 3, 2, 'd'); R(g, 80 + 35, 17 + o, 3, 2, 'd'); R(g, 80 - 30, 9 + o, 60, 1, 'd'); R(g, 49, 7 + o, 3, 3, 'h'); R(g, 109, 7 + o, 3, 3, 'h'); R(g, 49, 7 + o, 3, 1, 'y');
    const nh = 2 + Math.round(7 * ss);
    for (let i = 0; i < 5; i++) {
      const nx = 51 + i * 12, hh = nh + (moving ? Math.round(Math.sin(walkT * 2 + i) * 1) : 0);
      R(g, nx, 19 + o, 11, hh, 'd'); R(g, nx + 1, 19 + o, 9, hh - 1, 'n'); R(g, nx + 1, 19 + o + hh - 3, 9, 2, 'w');
      if (ss > 0.5 && (i === 1 || i === 3)) { disc(g, nx + 5, 22 + o, 2, 'w'); R(g, nx + 5, 22 + o, 1, 1, 'r'); }
    }
    // ліхтарі, прапор-нобору, табуретки
    chochin(g, 41, 22 + o, ss, t); chochin(g, 113, 22 + o, ss, t);
    if (ss > 0.05) {
      const fh = Math.round(34 * ss);
      R(g, 128, 18 + o, 1, 65 - o, 'd'); R(g, 127, 18 + o, 3, 1, 'h');
      for (let y = 0; y < fh; y++) { const sw = Math.round(Math.sin(t * 3 + y * 0.25) * 1.2 * (y / 34)); R(g, 129 + sw, 20 + o + y, 9, 1, y % 9 < 2 || y % 9 > 6 ? 'd' : 'r'); if (y % 9 === 4) R(g, 131 + sw, 20 + o + y, 5, 1, 'w'); }
    }
    if (ss > 0.5) {
      const pop = Math.min(1, (ss - 0.5) * 2); g.globalAlpha = pop;
      [32, 80, 124].forEach(sx => { const dy = Math.round((1 - pop) * 6); R(g, sx - 4, 76 + dy, 9, 3, 'd'); R(g, sx - 3, 76 + dy, 7, 2, 'r'); R(g, sx - 3, 76 + dy, 7, 1, 'o'); R(g, sx - 3, 79 + dy, 1, 4 - dy, 'd'); R(g, sx + 3, 79 + dy, 1, 4 - dy, 'd'); });
      g.globalAlpha = 1;
    }
    // пара над казаном
    if (ss > 0.15) for (let k = 0; k < 4; k++) { const ph = (t * 0.45 + k / 4) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.7 * Math.min(1, ss * 2); R(g, 63 + k * 4 + Math.round(Math.sin(t * 2 + k) * 2), 36 + o - Math.round(ph * 26), 3 + (k % 2), 3, 'w'); }
    g.globalAlpha = 1;
  }
  function window_(g, t) {                                         // портрет діда у вікні гри (72×40): ніч, ліхтарі, пара, сакура
    g.clearRect(0, 0, 72, 40);
    R(g, 0, 0, 72, 40, 'z'); R(g, 0, 16, 72, 24, 'n'); R(g, 0, 30, 72, 10, 'V');
    for (let i = 0; i < 12; i++) if (Math.sin(t * 2 + i) > -0.5) R(g, (i * 31 + 5) % 72, (i * 13 + 2) % 18, 1, 1, i % 3 ? 'w' : 'y');
    disc(g, 60, 9, 5, 'W'); disc(g, 62, 8, 4, 'z');
    for (let i = 0; i < 6; i++) { const ph = (t * 0.25 + i / 6) % 1; R(g, Math.round((i * 23 + ph * 18) % 72), Math.round(ph * 36), 2, 1, i % 2 ? 'q' : 'p'); }
    const lit = 1;
    [[4, 3], [60, 17]].forEach(([x, y]) => { g.globalAlpha = 0.3; disc(g, x + 3, y + 5, 8, 'j'); g.globalAlpha = 1; R(g, x + 3, 0, 1, y, 'd'); R(g, x + 1, y, 5, 1, 'd'); R(g, x, y + 1, 7, 8, 'd'); R(g, x + 1, y + 1, 5, 8, 'r'); R(g, x + 1, y + 2, 2, 6, 'o'); R(g, x + 1, y + 4, 5, 1, 'd'); R(g, x + 1, y + 6, 5, 1, 'd'); R(g, x + 3, y + 9, 1, 2, 'h'); });
    const bob = Math.round(Math.sin(t * 2) * 1), blink = (t % 3.4) > 3.25;
    NOODLE_BUST.forEach((r, j) => { for (let i = 0; i < r.length; i++) { let c = r[i]; if (c === '.') continue; if (blink && j === 6 && c === 'k' && (i === 6 || i === 11)) c = 'c'; R(g, 18 + i * 2, 2 + bob + j * 2, 2, 2, c); } });
    R(g, 0, 36, 72, 4, 'd'); R(g, 0, 36, 72, 1, 'b'); R(g, 0, 37, 72, 3, 'b');
    for (let k = 0; k < 3; k++) { const ph = (t * 0.5 + k / 3) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.7; R(g, 6 + k * 3 + Math.round(Math.sin(t * 2 + k) * 2), 33 - Math.round(ph * 22), 3, 3, 'w'); }
    g.globalAlpha = 1;
  }
  return { draw, window: window_ };
})();

/* ---- гра «Звари лапшу» (полотно 192×120 у вікні цирку) ---- */
function noodleReset() {
  noodleGame.phase = 'idle'; noodleGame.t = 0; noodleGame.p = 0; noodleGame.rt = 0; noodleGame.res = ''; noodleGame.prize = null; noodleGame.main = false;
  noodleGame.zc = 0.5 + Math.random() * 0.25;
}
function noodleStart() {
  if (noodleGame.phase !== 'idle' || state.circus.spun) return;
  noodleReset(); noodleGame.phase = 'cook'; noodleGame.t = 0;
  ui.circusResult.textContent = t('noodleCook'); updateCircusButtons(); playSfx('pip');
}
function noodleTake() {                                              // вийняти лапшу: оцінка за відстанню від центру ідеальної зони
  const G = noodleGame; if (G.phase !== 'cook') return;
  const d = Math.abs(G.p - G.zc);
  let sec, key;
  if (d <= NOODLE_ZH) { sec = rollCircusSector(true).sec; key = 'noodlePerfect'; G.res = 'perfect'; }
  else if (d <= NOODLE_ZN) { sec = { kind: 'crystal', amount: 2, icon: 'gem2', color: 'v', weight: 0 }; key = 'noodleNear'; G.res = 'near'; }
  else { sec = { kind: 'crystal', amount: 1, icon: 'gem', color: 'u', weight: 0 }; key = G.p < G.zc ? 'noodleRaw' : 'noodleSoft'; G.res = 'miss'; }
  G.main = G.res === 'perfect'; G.prize = sec; G.phase = 'reveal'; G.rt = 0;
  state.circus.spun = 1;
  const pr = applyCircusSector(sec, Date.now());
  ui.circusResult.textContent = t(key) + ' ' + pr.text;
  playSfx(G.main ? 'wheelWin' : 'pip'); buzz(25);
  if (pr.skin >= 0) setTimeout(() => openLoot(pr.skin), 1500); else showToast(pr.text, 'good');
  updateUI(); saveGame(); updateCircusButtons();
}
function updateNoodleGame(dt) {
  const G = noodleGame; G.t += dt;
  if (G.phase === 'cook') {
    G.p += dt * (0.3 + 0.16 * G.p);                                  // лапша «розганяється» під кінець — треба встигнути
    if (Math.floor(G.t * 8) !== Math.floor((G.t - dt) * 8) && Math.random() < 0.35) playSfx('wheelTick');
    if (G.p >= 1) { G.p = 1; noodleTake(); }
  } else if (G.phase === 'reveal') {
    G.rt += dt;
    if (G.rt > 2.2) { G.phase = 'done'; updateCircusButtons(); ui.circusClose.textContent = t('noodleDone'); }
  }
}
function noodleClick() { if (noodleGame.phase === 'cook') noodleTake(); }
function drawNoodleGame() {
  const cv = ui.circusWheel; if (cv.width !== 192) return;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const G = noodleGame, tt = G.t + circus.t * 0, W = 192, H = 120, cx = 100, T = circus.t;
  g.clearRect(0, 0, W, H);
  R(g, 0, 0, W, 40, 'z'); R(g, 0, 40, W, 44, 'n'); R(g, 0, 70, W, 14, 'V');
  for (let i = 0; i < 16; i++) if (Math.sin(T * 2 + i) > -0.5) R(g, (i * 47 + 11) % W, (i * 17 + 5) % 44, 1, 1, i % 3 ? 'w' : 'y');
  disc(g, 164, 40, 8, 'W'); disc(g, 167, 38, 7, 'n');
  for (let i = 0; i < 8; i++) { const ph = (T * 0.18 + i / 8) % 1; R(g, Math.round((i * 29 + ph * 30) % W), Math.round(ph * 78), 2, 1, i % 2 ? 'q' : 'p'); }
  R(g, 0, 7, W, 1, 'd');                                            // гірлянда ліхтарів
  for (let i = 0; i < 5; i++) { const x = 14 + i * 40, fl = 0.85 + 0.15 * Math.sin(T * 6 + i); g.globalAlpha = 0.3 * fl; disc(g, x + 3, 17, 10, 'j'); g.globalAlpha = 1; R(g, x + 3, 8, 1, 3, 'd'); R(g, x, 11, 7, 1, 'd'); R(g, x - 1, 12, 9, 10, 'd'); R(g, x, 12, 7, 10, 'r'); R(g, x, 13, 3, 8, 'o'); R(g, x, 15, 7, 1, 'd'); R(g, x, 18, 7, 1, 'd'); R(g, x + 3, 22, 1, 3, 'h'); }
  // прилавок
  R(g, 0, 90, W, 30, 'b'); R(g, 0, 90, W, 5, 'c'); R(g, 0, 90, W, 1, 'y'); R(g, 0, 95, W, 1, 'd'); for (let x = 0; x < W; x += 24) R(g, x, 100, 1, 20, 'd');
  // дід (голова 2×) ліворуч за прилавком
  const bob = Math.round(Math.sin(T * 2) * 1);
  NOODLE_BUST.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = r[i]; if (c !== '.') R(g, 6 + i * 2, 54 + bob + j * 2, 2, 2, c); } });
  // казан на плитці
  const px = cx, py = 86;
  R(g, px - 20, py - 3, 41, 9, 'd'); R(g, px - 19, py - 2, 39, 7, 'e'); for (let k = -16; k <= 16; k += 4) { const h = 2 + Math.round(Math.abs(Math.sin(T * 9 + k)) * 3); R(g, px + k, py + 3 - h, 3, h, 'o'); }
  for (let dy = -22; dy <= -2; dy++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - ((dy + 12) / 11) * ((dy + 12) / 11))) * 26); R(g, px - half, py + dy, half * 2 + 1, 1, 'd'); }
  for (let dy = -21; dy <= -3; dy++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - ((dy + 12) / 10.5) * ((dy + 12) / 10.5))) * 24.5); R(g, px - half, py + dy, half * 2 + 1, 1, 'k'); }
  R(g, px - 20, py - 18, 4, 11, 'e'); R(g, px - 19, py - 17, 1, 9, 'E');
  R(g, px - 28, py - 22, 57, 4, 'd'); R(g, px - 27, py - 21, 55, 2, 'e'); R(g, px - 27, py - 21, 55, 1, 'E');
  const cook = G.phase === 'idle' ? 0 : G.phase === 'cook' ? G.p : G.p;                              // колір лапші: сира (біла) → золота → розвалена (бура)
  const d = cook - G.zc, col = G.phase === 'idle' ? 'w' : (Math.abs(d) <= NOODLE_ZH ? 'y' : (d < 0 ? 'W' : 'c'));
  R(g, px - 26, py - 22, 53, 3, 'T'); R(g, px - 26, py - 22, 53, 1, 'S');                           // вода
  for (let k = 0; k < 9; k++) { const x0 = px - 22 + k * 5, wv = Math.round(Math.sin(T * 3 + k * 1.3) * 2); R(g, x0, py - 25 + wv, 4, 1, col); R(g, x0 + 1, py - 24 + wv, 3, 1, col); R(g, x0 + 2, py - 23, 2, 2, col); }
  for (let k = 0; k < 4; k++) { const ph = (T * 0.9 + k / 4) % 1; g.globalAlpha = 1 - ph; disc(g, px - 16 + k * 11 + Math.round(Math.sin(T * 3 + k) * 2), Math.round(py - 24 - ph * 8), 1, 'S'); g.globalAlpha = 1; }
  if (G.phase !== 'idle') for (let k = 0; k < 5; k++) { const ph = (T * 0.55 + k / 5) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.7; R(g, px - 16 + k * 8 + Math.round(Math.sin(T * 2 + k) * 3), Math.round(py - 30 - ph * 30), 4, 3, 'w'); } g.globalAlpha = 1;
  // шкала варіння
  const bx = 24, bw = 152, by = 103, bh = 9, zc = G.zc;
  R(g, bx - 2, by - 2, bw + 4, bh + 4, 'd');
  const seg = (a, b, c) => R(g, bx + Math.round(bw * a), by, Math.max(1, Math.round(bw * (b - a))), bh, c);
  seg(0, Math.max(0, zc - NOODLE_ZN), 'n'); seg(Math.max(0, zc - NOODLE_ZN), zc - NOODLE_ZH, 'h'); seg(zc - NOODLE_ZH, zc + NOODLE_ZH, 'g'); seg(zc + NOODLE_ZH, Math.min(1, zc + NOODLE_ZN), 'h'); seg(Math.min(1, zc + NOODLE_ZN), 1, 'r');
  R(g, bx + Math.round(bw * (zc - NOODLE_ZH)), by, Math.max(1, Math.round(bw * NOODLE_ZH * 2)), 2, 'm');
  if (G.phase === 'cook' || G.phase === 'reveal' || G.phase === 'done') {
    const mx = bx + Math.round(bw * G.p);
    R(g, mx - 2, by - 4, 5, bh + 8, 'd'); R(g, mx - 1, by - 3, 3, bh + 6, 'w');
  }
  // приз над казаном
  if (G.phase === 'reveal' || G.phase === 'done') {
    const a = Math.min(1, G.rt / 0.35 + (G.phase === 'done' ? 1 : 0)), by2 = Math.round(34 + Math.sin(T * 3) * 2);
    g.globalAlpha = 0.3 * a; disc(g, px, by2, 17, 'h'); g.globalAlpha = 0.5 * a; disc(g, px, by2, 13, 'y'); g.globalAlpha = a;
    if (G.prize) drawCircusIcon(g, G.prize.icon || 'gem', px, by2);
    g.globalAlpha = 1;
    if (G.main && Math.floor(T * 6) % 2) { R(g, px - 20, by2 - 12, 1, 3, 'y'); R(g, px - 21, by2 - 11, 3, 1, 'y'); R(g, px + 20, by2 - 6, 1, 3, 'y'); R(g, px + 19, by2 - 5, 3, 1, 'y'); }
  }
}
(function () {
  const UK = {
    noodleBang: '🍜 Пахне рамен… Хтось тягне візок! Тапни на «!»', noodleArrived: '🍜 Лапшична діда Рьо розклалась! Тапни її', noodleTitle: 'Лапшична діда Рьо',
    noodleSub: 'Дід Рьо: «Лапшу варю рівно стільки, скільки треба. Упіймай момент, і миска твоя!»', noodleStart: 'Варити!', noodleTake: 'Вийняти!',
    noodleCook: 'Тапни, коли лапша ідеальна (зелена зона)!', noodlePerfect: 'Ідеально! Головна миска твоя!', noodleNear: 'Майже! Смачна вийшла.', noodleRaw: 'Ще сира… але кристал твій.', noodleSoft: 'Переварилась… але кристал твій.',
    noodleDone: 'Дякую, діду!'
  };
  const EN = {
    noodleBang: '🍜 It smells like ramen… someone is pulling a cart! Tap the "!"', noodleArrived: '🍜 Grandpa Ryo’s noodle shop is open! Tap it', noodleTitle: 'Grandpa Ryo’s Noodle Cart',
    noodleSub: 'Grandpa Ryo: "I cook noodles exactly as long as needed. Catch the moment and the bowl is yours!"', noodleStart: 'Cook!', noodleTake: 'Pull out!',
    noodleCook: 'Tap when the noodles are perfect (the green zone)!', noodlePerfect: 'Perfect! The best bowl is yours!', noodleNear: 'Almost! Tasty anyway.', noodleRaw: 'Still raw… but the crystal is yours.', noodleSoft: 'Overcooked… but the crystal is yours.',
    noodleDone: 'Thanks, Grandpa!'
  };
  Object.assign(translations.uk, UK); Object.assign(translations.en, EN);
})();
