//#part 278_a_build_themes.js
/* =====================================================================
   ТЕМАТИЧНЕ БУДІВНИЦТВО ПО ЕПОХАХ: будинок росте знизу вгору на очах, команда епохи працює навколо.
   BTH.list[епоха] = { rise?, behind(G), work(G), finale(G) }; G — геометрія кадру (див. BTH.render).
   Тап по екрану під час будівництва додає build.boost (прискорення), див. updateBuild.
   ===================================================================== */
const BTH = { list: [], cache: {} };
function buildThemeRender() { return BTH.render(); }
(() => {
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const rnd = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const lerp = (a, b, u) => a + (b - a) * u;
  BTH.rnd = rnd; BTH.lerp = lerp; BTH.clamp01 = clamp01;
  // маленькі помічники малювання
  BTH.px = (x, y, c, a) => { if (a != null) ctx.globalAlpha = a; R(ctx, Math.round(x), Math.round(y), 1, 1, c); if (a != null) ctx.globalAlpha = 1; };
  BTH.rect = (x, y, w, h, c, a) => { if (a != null) ctx.globalAlpha = a; R(ctx, Math.round(x), Math.round(y), w, h, c); if (a != null) ctx.globalAlpha = 1; };
  BTH.spark = (x, y, c1, c2, big) => { x = Math.round(x); y = Math.round(y); R(ctx, x, y, 1, 1, c2 || 'w'); R(ctx, x - 1, y, 1, 1, c1 || 'y'); R(ctx, x + 1, y, 1, 1, c1 || 'y'); R(ctx, x, y - 1, 1, 1, c1 || 'y'); R(ctx, x, y + 1, 1, 1, c1 || 'y'); if (big) { R(ctx, x - 2, y, 1, 1, c2 || 'w'); R(ctx, x + 2, y, 1, 1, c2 || 'w'); R(ctx, x, y - 2, 1, 1, c2 || 'w'); R(ctx, x, y + 2, 1, 1, c2 || 'w'); } };
  BTH.note = (x, y, c) => { x = Math.round(x); y = Math.round(y); R(ctx, x + 2, y, 1, 4, c || 'd'); R(ctx, x, y + 3, 3, 2, c || 'd'); R(ctx, x + 3, y, 2, 1, c || 'd'); };

  // дрібний шрифт 3×5: цифри, латиниця, кілька кирилічних, знаки
  const F = { '0': '###|#.#|#.#|#.#|###', '1': '.#.|##.|.#.|.#.|###', '2': '###|..#|###|#..|###', '3': '###|..#|###|..#|###', '4': '#.#|#.#|###|..#|..#', '5': '###|#..|###|..#|###', '6': '###|#..|###|#.#|###', '7': '###|..#|.#.|.#.|.#.', '8': '###|#.#|###|#.#|###', '9': '###|#.#|###|..#|###',
    A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##', D: '##.|#.#|#.#|#.#|##.', E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..', G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#', I: '###|.#.|.#.|.#.|###', J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###', M: '#.#|###|###|#.#|#.#', N: '##.|#.#|#.#|#.#|#.#', O: '.#.|#.#|#.#|#.#|.#.', P: '##.|#.#|##.|#..|#..', Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#', S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.', U: '#.#|#.#|#.#|#.#|###', V: '#.#|#.#|#.#|#.#|.#.', W: '#.#|#.#|###|###|#.#', X: '#.#|#.#|.#.|#.#|#.#', Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
    'Б': '###|#..|##.|#.#|##.', 'Г': '###|#..|#..|#..|#..', 'Д': '.#.|#.#|#.#|###|#.#', 'З': '##.|..#|.#.|..#|##.', 'И': '#.#|#.#|###|###|#.#', 'Л': '.##|#.#|#.#|#.#|#.#', 'П': '###|#.#|#.#|#.#|#.#', 'Я': '.##|#.#|.##|#.#|#.#', 'Ц': '#.#|#.#|#.#|###|..#', 'Ч': '#.#|#.#|.##|..#|..#', 'Ш': '#.#|#.#|###|###|###',
    '%': '#.#|..#|.#.|#..|#.#', '!': '.#.|.#.|.#.|...|.#.', ':': '...|.#.|...|.#.|...', '.': '...|...|...|...|.#.', '-': '...|...|###|...|...', '+': '...|.#.|###|.#.|...', '?': '##.|..#|.#.|...|.#.', '/': '..#|..#|.#.|#..|#..', ' ': '...|...|...|...|...', '>': '#..|.#.|..#|.#.|#..', '*': '#.#|.#.|###|.#.|#.#' };
  const CYR = { 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X', 'А': 'A', 'Є': 'E', 'І': 'I', 'Ї': 'I' };
  BTH.text = function (x, y, str, col, sh) {                    // повертає ширину
    let cx = Math.round(x); y = Math.round(y);
    [...String(str).toUpperCase()].forEach(ch => {
      const g = F[CYR[ch] || ch]; if (!g) { cx += 4; return; }
      g.split('|').forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '#') { if (sh) R(ctx, cx + i + 1, y + j + 1, 1, 1, sh); } });
      g.split('|').forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '#') R(ctx, cx + i, y + j, 1, 1, col); });
      cx += 4;
    });
    return cx - Math.round(x) - 1;
  };
  BTH.textW = str => [...String(str)].length * 4 - 1;
  const vtCache = new WeakMap();
  BTH.visTop = function (cv) {                                      // перший непрозорий рядок спрайта (де справді починається дах)
    if (vtCache.has(cv)) return vtCache.get(cv);
    let r = 0; try { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; outer: for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 40) { r = y; break outer; } } catch (e) { r = 0; }
    vtCache.set(cv, r); return r;
  };
  // фінал: гірлянда над входом і стрічка (як у справжній анімації), кольори з теми
  BTH.bunting = function (G, cols) {
    const q = G.q; if (q < 0.2) return;
    cols = cols || ['r', 'y', 'g', 'n', 'p', 'o'];
    for (let x = 0; x < shop.w; x++) { const sag = Math.round(5 * Math.sin(x / shop.w * Math.PI)); R(ctx, shop.x + x, shop.y + 20 + sag, 1, 1, 'd'); if (x % 9 === 4) { const c = cols[Math.floor(x / 9) % cols.length]; R(ctx, shop.x + x - 1, shop.y + 21 + sag, 3, 2, c); R(ctx, shop.x + x, shop.y + 23 + sag, 1, 1, c); } }
    const dr = doorWorld(), hw = (shop.door.w >> 1) + 9, ry = shop.y + shop.door.y + 14;
    R(ctx, dr.cx - hw - 1, ry - 4, 2, 16, 'd'); R(ctx, dr.cx + hw - 1, ry - 4, 2, 16, 'd'); R(ctx, dr.cx - hw - 2, ry - 5, 4, 2, 'h'); R(ctx, dr.cx + hw - 2, ry - 5, 4, 2, 'h');
    const rq = (q - 0.2) / 0.8;
    if (rq < 0.5) { R(ctx, dr.cx - hw, ry, hw * 2, 2, 'r'); R(ctx, dr.cx - hw, ry, hw * 2, 1, 'J'); R(ctx, dr.cx - 3, ry - 2, 7, 6, 'r'); R(ctx, dr.cx - 1, ry - 1, 3, 3, 'y'); }
    else if (rq < 0.85) { const f = (rq - 0.5) / 0.35; for (let i = 0; i < hw - 1; i++) { const d = i / hw; R(ctx, dr.cx - hw + i, ry + Math.round(f * (0.4 + d) * 12), 1, 2, 'r'); R(ctx, dr.cx + hw - 1 - i, ry + Math.round(f * (0.4 + d) * 12), 1, 2, 'r'); } }
  };
  BTH.render = function () {
    const th = BTH.list[viewEpoch() % BTH.list.length];
    if (!th) return false;
    const b = build, p = b.t / b.dur, o = b.old, t = b.t;
    const base = shop.y + shop.h, q = p >= BUILD_C ? (p - BUILD_C) / (1 - BUILD_C) : 0;
    const wk = smooth01((p - 0.1) / 0.16), prog = smooth01((p - BUILD_A) / (BUILD_C - BUILD_A));
    const x0 = Math.round(o.x - 3 + (shop.x - 3 - (o.x - 3)) * wk), x1 = Math.round(o.x + o.w + 3 + (shop.x + shop.w + 3 - (o.x + o.w + 3)) * wk);
    const H = (p < BUILD_A ? o.h : Math.round(o.h + (shop.h - o.h) * prog)) + 2;
    const fall = p < 0.12 ? (1 - Math.pow(p / 0.12, 2)) * (H + 70) : 0;
    const lift = q > 0 ? smooth01(q / 0.3) * (H + 6) : 0;
    const bounce = p >= 0.12 && p < 0.2 ? Math.round(Math.sin((p - 0.12) / 0.08 * Math.PI) * 2) : 0;
    const G = { b, p, q, o, t, base, x0, x1, H, top: base - H, hem: Math.round(base - lift), lift, fall, bounce, prog, wp: clamp01((p - BUILD_A) / (BUILD_C - BUILD_A)), cx: Math.round((x0 + x1) / 2), gy: LAYOUT.curbY + 12, A: BUILD_A, C: BUILD_C, th };
    G.roof = shop.y + BTH.visTop(shop.canvas);
    if (th.back) th.back(G);
    G.mode = 'rise';
    {
      // будинок росте знизу вгору; старий розбирається зверху вниз
      const ch = shop.canvas.height, cw = shop.canvas.width, vt = BTH.visTop(shop.canvas), vh = ch - vt;
      const pr = th.rise ? th.rise(prog, G) : prog;
      let rh = p < BUILD_A ? 0 : p >= BUILD_C ? vh : Math.max(2, Math.round(pr * vh));
      if (p < BUILD_A) {
        const d = clamp01((p - 0.03) / (BUILD_A - 0.05)), oh = o.canvas.height, ovt = BTH.visTop(o.canvas), ovh = oh - ovt, sh = Math.max(0, Math.round((1 - d) * ovh));
        if (sh > 0) ctx.drawImage(o.canvas, 0, oh - sh, o.canvas.width, sh, o.x, o.y + oh - sh, o.canvas.width, sh);
        G.top = o.y + oh - sh; G.H = base - G.top; G.demo = d;
      } else {
        const rc = Math.max(1, Math.min(ch, rh));
        ctx.drawImage(shop.canvas, 0, ch - rc, cw, rc, shop.x, base - rc, cw, rc);
        G.top = base - rc; G.H = rc;
      }
      G.hem = base; G.lift = 0; G.fall = 0;
      if (th.behind) th.behind(G);
      if (th.front0) th.front0(G);
    }
    if (th.arrive) th.arrive(G);
    if (G.mode === 'rise' && p < BUILD_A && G.demo > 0) {               // пил і уламки на лінії розбирання старого
      for (let i = 0; i < 14; i++) { const k = Math.floor(t * 10 + i * 7), xx = o.x + rnd(k + i) * o.w, yy = G.top + 2 + ((t * 40 + i * 13) % 26); ctx.globalAlpha = 0.55; R(ctx, Math.round(xx), Math.round(yy), 2 + (i % 2), 2, i % 3 ? 'E' : 'e'); ctx.globalAlpha = 1; }
    }
    if (th.work) th.work(G);
    drawBeaverBuilder(b, p);
    if (th.finale && p >= BUILD_C - 0.02) th.finale(G);
    if (th.front) th.front(G);
    if (b.boost > 0.05) for (let i = 0; i < 6; i++) { const k = Math.floor(t * 14 + i * 5); BTH.spark(shop.x + rnd(k * 1.7 + i) * shop.w, G.top - 2 - rnd(k + i * 3) * 8, 'y', 'w'); }   // тап-прискорення: більше іскор по лінії кладки
    return true;
  };
})();

// Тема 0 — Відродження: ангелята-будівельники (путті з німбами) і архангел-архітектор зводять магазин
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  // путто: (x,y) — центр тіла, dir ±1, o: { carry:'block'|'brush'|'trumpet'|'rope'|'hammer', ph }
  function cherub(x, y, t, dir, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const ph = o.ph || 0, fl = Math.sin(t * 15 + ph), up = fl > 0.35 ? 1 : fl < -0.35 ? -1 : 0;
    const P = (dx, dy, w, h, c) => R(ctx, dir > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, c);
    ctx.globalAlpha = 0.16; R(ctx, x - 4, y + 8, 9, 1, 'd'); ctx.globalAlpha = 1;
    // крильця (білі з тінню й контуром)
    if (up > 0) { P(-3, -6, 4, 3, 'w'); P(-6, -8, 4, 3, 'w'); P(-9, -10, 4, 3, 'w'); P(-10, -11, 2, 1, 'd'); P(-3, -4, 3, 1, 'E'); P(-6, -6, 3, 1, 'E'); P(-9, -8, 3, 1, 'E'); P(-3, -7, 4, 1, 'd'); }
    else if (up === 0) { P(-3, -5, 4, 3, 'w'); P(-7, -5, 4, 3, 'w'); P(-10, -4, 3, 3, 'w'); P(-11, -4, 1, 1, 'd'); P(-3, -3, 3, 1, 'E'); P(-7, -3, 3, 1, 'E'); P(-3, -6, 4, 1, 'd'); }
    else { P(-3, -4, 4, 3, 'w'); P(-6, -2, 4, 3, 'w'); P(-9, 0, 4, 3, 'w'); P(-10, 3, 2, 1, 'd'); P(-3, -2, 3, 1, 'E'); P(-6, 0, 3, 1, 'E'); P(-3, -5, 4, 1, 'd'); }
    // тіло, ніжки, пов'язка
    P(-2, -5, 6, 8, 'd'); P(-1, -4, 4, 6, 'W'); P(-1, 0, 4, 2, 'w'); P(-1, 1, 4, 1, 'E');
    P(-1, 3, 2, 3, 'd'); P(0, 3, 1, 2, 'W'); P(2, 3, 2, 3, 'd'); P(2, 3, 1, 2, 'W');
    // голова: кучері, око, рум'янець
    P(-3, -12, 7, 8, 'd'); P(-2, -13, 5, 1, 'd'); P(-2, -11, 5, 6, 'W'); P(-2, -12, 5, 2, 'h'); P(-3, -10, 1, 3, 'h'); P(3, -10, 1, 2, 'h'); P(-1, -12, 2, 1, 'y');
    P(1, -8, 1, 2, 'k'); P(2, -6, 1, 1, 'p');
    // німб
    P(-2, -16, 5, 1, 'y'); P(-3, -15, 1, 1, 'h'); P(3, -15, 1, 1, 'h'); P(-2, -17, 5, 1, 'h');
    // що несе
    if (o.carry === 'block') { P(3, -6, 8, 7, 'd'); P(4, -5, 6, 5, 'E'); P(4, -5, 6, 1, 'w'); P(2, -4, 3, 1, 'W'); }
    else if (o.carry === 'brush') { P(2, -5, 2, 1, 'W'); P(4, -11, 1, 9, 'b'); P(3, -14, 3, 3, 'r'); P(3, -14, 3, 1, 'J'); }
    else if (o.carry === 'trumpet') { P(2, -5, 3, 1, 'W'); P(3, -8, 8, 2, 'd'); P(3, -7, 8, 1, 'h'); P(10, -10, 2, 6, 'd'); P(11, -9, 1, 4, 'y'); }
    else if (o.carry === 'rope') { P(2, -6, 2, 1, 'W'); P(3, -10, 1, 5, 'd'); }
    else if (o.carry === 'hammer') { P(2, -5, 2, 1, 'W'); P(4, -12, 1, 8, 'b'); P(2, -14, 5, 3, 'e'); P(2, -14, 5, 1, 'E'); }
  }
  B.cherub = cherub;
  // архангел-архітектор: великі крила, ряса, золотий циркуль у піднятій руці
  function archangel(x, y, t, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const f = Math.floor((Math.sin(t * 3.2) + 1) * 1.5), cheer = o.cheer;
    ctx.globalAlpha = 0.16; disc(ctx, x, y - 6, 26, 'y'); ctx.globalAlpha = 0.14; disc(ctx, x, y - 6, 18, 'w'); ctx.globalAlpha = 1;
    [-1, 1].forEach(s => {
      for (let k = 0; k < 8; k++) {
        const wx = x + s * (5 + k * 2) - (s < 0 ? 1 : 0), wy = y - 15 - k * 2 + Math.round(f * (k * 0.45)), len = 16 - k;
        R(ctx, wx, wy, 2, len, k % 2 ? 'w' : 'W'); R(ctx, wx, wy + len - 1, 2, 1, 'E'); R(ctx, wx, wy - 1, 2, 1, 'd');
        R(ctx, wx + (s < 0 ? 0 : 1), wy, 1, len, s < 0 ? 'w' : 'E');
      }
    });
    for (let r = 0; r < 20; r++) { const w = 9 + Math.round(r * 0.55), rx = x - (w >> 1); R(ctx, rx, y - 9 + r, w, 1, 'w'); R(ctx, rx, y - 9 + r, 1, 1, 'd'); R(ctx, rx + w - 1, y - 9 + r, 1, 1, 'd'); R(ctx, rx + w - 3, y - 9 + r, 2, 1, 'E'); if (r % 5 === 3) R(ctx, x - 1 + ((r >> 2) & 1), y - 9 + r, 1, 1, 'E'); }
    R(ctx, x - 7, y + 10, 15, 1, 'd'); R(ctx, x - 6, y + 9, 13, 1, 'h'); R(ctx, x - 5, y - 2, 11, 2, 'h'); R(ctx, x - 5, y - 2, 11, 1, 'y');
    // голова
    R(ctx, x - 4, y - 19, 9, 9, 'd'); R(ctx, x - 3, y - 18, 7, 7, 'W'); R(ctx, x - 4, y - 19, 9, 3, 'd'); R(ctx, x - 3, y - 19, 7, 3, 'h'); R(ctx, x - 5, y - 17, 2, 6, 'h'); R(ctx, x + 4, y - 17, 2, 6, 'h');
    R(ctx, x - 2, y - 15, 1, 2, 'k'); R(ctx, x + 2, y - 15, 1, 2, 'k'); R(ctx, x - 3, y - 13, 1, 1, 'p'); R(ctx, x + 3, y - 13, 1, 1, 'p'); R(ctx, x - 1, y - 12, 3, 1, 'J');
    R(ctx, x - 5, y - 23, 11, 1, 'd'); R(ctx, x - 4, y - 24, 9, 1, 'd'); R(ctx, x - 4, y - 23, 9, 1, 'y'); R(ctx, x - 6, y - 22, 1, 1, 'd'); R(ctx, x + 6, y - 22, 1, 1, 'd');
    // руки: ліва піднята з циркулем (світиться), права тримає план
    const up = cheer ? -6 : 0;
    R(ctx, x - 9, y - 6, 4, 2, 'W'); R(ctx, x - 12, y - 14 + up, 2, 9 - up, 'W'); R(ctx, x - 13, y - 25 + up, 1, 11, 'h'); R(ctx, x - 9, y - 25 + up, 1, 11, 'h'); R(ctx, x - 13, y - 26 + up, 5, 1, 'y'); R(ctx, x - 10, y - 18 + up, 2, 1, 'y');
    if (Math.floor(t * 6) % 2) B.spark(x - 11, y - 28 + up, 'y', 'w');
    R(ctx, x + 5, y - 6, 5, 2, 'W'); R(ctx, x + 9, y - 10, 9, 8, 'd'); R(ctx, x + 10, y - 9, 7, 6, 'w'); R(ctx, x + 11, y - 8, 5, 1, 'n'); R(ctx, x + 11, y - 6, 3, 1, 'n'); R(ctx, x + 11, y - 4, 4, 1, 'r');
  }
  B.archangel = archangel;
  function dove(x, y, t, ph, dir) {
    x = Math.round(x); y = Math.round(y); const f = Math.floor(t * 9 + ph) % 2;
    R(ctx, x - 2, y, 5, 2, 'w'); R(ctx, x + (dir > 0 ? 3 : -3), y - 1, 2, 2, 'w'); R(ctx, x + (dir > 0 ? 4 : -4), y - 1, 1, 1, 'k'); R(ctx, x - dir * 3, y, 1, 1, 'E');
    if (f) { R(ctx, x - 2, y - 3, 3, 3, 'w'); R(ctx, x - 3, y - 4, 2, 1, 'E'); } else { R(ctx, x - 2, y + 2, 4, 2, 'w'); R(ctx, x - 3, y + 3, 2, 1, 'E'); }
  }
  B.dove = dove;
  // позиції путті для кадру; у фіналі перетікають у шеренгу над дахом
  function crew(G) {
    const { t, p, A, x0, x1, top, base, gy } = G, tA = A * G.b.dur, pileX = x0 - 22, out = [];
    const q = G.q, fin = smooth01(c01(q / 0.25));
    for (let i = 0; i < 4; i++) {                                           // 4 носії: купа → край будівництва
      const Tc = 3.3, u = (((t - tA) / Tc + i * 0.25) % 1 + 1) % 1, tx = lerp(x0 + 22, x1 - 22, (i + 0.5) / 4), ty = top - 12;
      let x, y, carry = null, dir = 1;
      if (p < A) { const s = smooth01(c01(p / A)); x = lerp((i % 2 ? x1 + 90 : x0 - 90) + i * 13, pileX + 4, s); y = lerp(top - 150 - i * 12, gy - 24, s); dir = x > pileX ? -1 : 1; }
      else if (u < 0.42) { const s = smooth01(u / 0.42); x = lerp(pileX + 4, tx, s); y = lerp(gy - 22, ty, s) - Math.sin(Math.PI * s) * 26; carry = 'block'; }
      else if (u < 0.55) { x = tx; y = ty + Math.sin(t * 8 + i) * 1.5; carry = u < 0.47 ? 'block' : null; }
      else { const s = smooth01((u - 0.55) / 0.45); x = lerp(tx, pileX + 4, s); y = lerp(ty, gy - 24, s) - Math.sin(Math.PI * s) * 14; dir = -1; }
      out.push({ x, y, dir, carry, ph: i * 1.7 });
    }
    for (let i = 0; i < 2; i++) {                                           // 2 майстри: біля краю будівництва
      let x, y, dir = i ? -1 : 1; const sw = G.sweep;
      if (p < A) { const s = smooth01(c01(p / A)); x = lerp(i ? x1 + 100 : x0 - 100, G.cx + (i ? 24 : -24), s); y = lerp(top - 170, base - 60 - i * 22, s); }
      else if (G.mode === 'rise') { x = G.cx + (i ? 1 : -1) * (58 + 22 * Math.sin(t * 1.3 + i)); y = G.top + 8 + Math.sin(t * 3 + i * 2) * 4; }
      else { x = G.cx - 24 + i * 48; y = base - 60 - i * 22; }
      out.push({ x, y, dir, carry: 'hammer', ph: 2 + i, work: true });
    }
    for (let i = 0; i < 2; i++) {                                           // 2 сурмачі
      let x = i ? x1 - 14 : x0 + 14, y = top - 22 + Math.sin(t * 4 + i * 3) * 1.5; const dir = i ? -1 : 1;
      if (p < A) { const s = smooth01(c01((p - 0.02) / (A - 0.02))); x = lerp(i ? visR() + 40 : visL() - 40, x, s); y = lerp(top - 190, y, s); }
      out.push({ x, y, dir, carry: 'trumpet', ph: 4 + i, trump: true });
    }
    if (q > 0) out.forEach((c, i) => {                                      // фінал: шеренга над дахом, сурми гримлять
      const fx = G.cx + (i - 3.5) * 36, fy = G.roof - 30 - Math.abs(i - 3.5) * 4 + Math.sin(t * 4 + i) * 2;
      c.x = lerp(c.x, fx, fin); c.y = lerp(c.y, fy, fin); c.dir = i < 4 ? 1 : -1;
      if (fin > 0.5) { c.carry = i % 2 ? 'trumpet' : null; c.trump = c.carry === 'trumpet'; }
    });
    return out;
  }
  B.list[0] = {
    id: 'ren',
    behind(G) {
      const t = G.t, a = G.p < G.A ? c01(G.p / 0.08) : G.q < 0.01 ? 1 : 1 - c01(G.q / 0.5);
      if (a > 0) {
        ctx.globalAlpha = 0.2 * a * (0.85 + 0.15 * Math.sin(t * 3));
        const yTop = -view.offY - 4, yBot = G.base;
        for (let y = yTop; y < yBot; y += 2) { const u = (y - yTop) / (yBot - yTop), hw = lerp(10, (G.x1 - G.x0) * 0.46, u * u); R(ctx, Math.round(G.cx - hw), y, Math.round(hw * 2), 2, 'y'); }
        ctx.globalAlpha = 0.16 * a; for (let y = yTop; y < yBot; y += 2) { const u = (y - yTop) / (yBot - yTop), hw = lerp(4, (G.x1 - G.x0) * 0.2, u * u); R(ctx, Math.round(G.cx - hw), y, Math.round(hw * 2), 2, 'w'); }
        ctx.globalAlpha = 1;
      }
      if (G.mode === 'rise' && G.p >= G.A - 0.02 && G.p < G.C) {          // сяюча лінія кладки
        const fw = shop.w + 6; R(ctx, shop.x - 3, G.top - 1, fw, 1, 'y'); ctx.globalAlpha = 0.5; R(ctx, shop.x - 3, G.top - 2, fw, 1, 'w'); R(ctx, shop.x - 3, G.top, fw, 2, 'h'); ctx.globalAlpha = 1;
        for (let i = 0; i < 9; i++) if (Math.sin(t * 7 + i * 1.9) > 0.1) B.spark(shop.x + rnd(i * 5 + Math.floor(t * 3)) * shop.w, G.top - 1 - rnd(i + 2) * 5, 'y', 'w');
      }
      if (G.q > 0.1) {                                                    // промені з даху у фіналі
        const a2 = c01((G.q - 0.1) / 0.25) * (1 - c01((G.q - 0.85) / 0.15)), rx = G.cx, ry = G.roof - 4;
        ctx.globalAlpha = 0.2 * a2;
        for (let k = 0; k < 9; k++) { const ang = -Math.PI / 2 + (k - 4) * 0.2 + Math.sin(t * 0.8 + k) * 0.02; for (let r = 14; r < 230; r += 2) { const w = 1 + r * 0.045; R(ctx, Math.round(rx + Math.cos(ang) * r - w / 2), Math.round(ry + Math.sin(ang) * r), Math.round(w), 2, k % 2 ? 'y' : 'w'); } }
        ctx.globalAlpha = 1;
      }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, pileX = x0 - 22;
      if (p > A - 0.04 && p < G.C + 0.1) {                                   // купа мармуру й колона-заготовка
        const left = Math.round(10 * (1 - G.wp * 0.8));
        for (let i = 0; i < left; i++) { const bx = pileX - 8 + (i % 4) * 7, by = gy - 4 - Math.floor(i / 4) * 5; R(ctx, bx, by, 7, 5, 'd'); R(ctx, bx + 1, by + 1, 5, 3, 'E'); R(ctx, bx + 1, by + 1, 5, 1, 'w'); }
        R(ctx, pileX + 22, gy - 9, 5, 9, 'd'); R(ctx, pileX + 23, gy - 8, 3, 7, 'w'); R(ctx, pileX + 22, gy - 12, 5, 3, 'h'); R(ctx, pileX + 22, gy - 13, 5, 1, 'y');
      }
      { const hx = G.cx, hy = Math.min(top - 52, base - 130) + Math.sin(t * 1.6) * 2; let ay = hy;       // архангел
        if (p < A) ay = lerp(top - 260, hy, smooth01(c01(p / A)));
        if (G.q > 0) ay = lerp(hy, G.roof - 64, smooth01(c01(G.q / 0.3)));
        archangel(hx, ay, t, { cheer: G.q > 0.1 }); }
      crew(G).forEach((c, i) => {
        cherub(c.x, c.y, t, c.dir, c);
        if (c.trump && p > A * 0.9) { const nu = ((t * 0.9 + i * 0.37) % 1); if (Math.floor(t * 2 + i) % 2 === 0) B.note(c.x + c.dir * 14 + c.dir * nu * 16, c.y - 12 - nu * 26, nu > 0.65 ? 'h' : 'k'); }
        if (c.work && G.mode === 'rise' && p > A && p < G.C) { const k = Math.floor(t * 8 + i * 3); if (k % 2 === 0) B.spark(c.x + c.dir * 8, c.y + 4 + rnd(k) * 6, 'y', 'w'); }
      });
      if (p > A && p < G.C) for (let i = 0; i < 4; i++) { const k = Math.floor(t * 4 + i * 3); if ((k + i) % 3 === 0) B.spark(lerp(x0 + 10, x1 - 10, rnd(k * 7 + i)), top - 2 + rnd(k + i) * 6, 'h', 'y'); }
    },
    finale(G) {
      const { t, q, base } = G;
      if (q > 0.25) for (let k = 0; k < 7; k++) { const u = c01((q - 0.25 - k * 0.025) / 0.65); if (u <= 0 || u >= 1) continue; const dr = doorWorld(); dove(dr.cx + (k - 3) * u * 76, base - 36 - u * 160 + Math.sin(u * 9 + k) * 5, t, k, k - 3 > 0 ? 1 : -1); }
      if (q > 0.1) for (let i = 0; i < 8; i++) if (Math.sin(t * 6 + i * 2.4) > 0.1) B.spark(shop.x + rnd(i + 3) * shop.w, G.roof + rnd(i + 9) * 50 - 6, 'y', 'w', i % 3 === 0);
      B.bunting(G, ['y', 'w', 'h', 'q', 'f', 'S']);
    }
  };
})();

// Тема 1 — Ретро: дирижабль-кран спускає плити на тросі, ракетні жерстяні робоботи клепають, комікс-вибухи «БАМ!»
(() => {
  const B = BTH, rnd = B.rnd, lerp = B.lerp, c01 = B.clamp01;
  function blimp(x, y, t, word) {
    x = Math.round(x); y = Math.round(y);
    for (let i = -34; i <= 34; i++) {
      const h = Math.round(12 * Math.sqrt(Math.max(0, 1 - (i / 35) * (i / 35))));
      if (h <= 0) continue;
      R(ctx, x + i, y - h, 1, h * 2, 'd');
      R(ctx, x + i, y - h + 1, 1, h * 2 - 2, (i >> 3) & 1 ? 'm' : 'q');
      R(ctx, x + i, y - h + 1, 1, 2, 'w');                               // блік згори
      R(ctx, x + i, y + h - 3, 1, 2, 'p');                               // тінь знизу
    }
    R(ctx, x - 40, y - 8, 7, 3, 'd'); R(ctx, x - 39, y - 7, 5, 1, 'p'); R(ctx, x - 40, y + 5, 7, 3, 'd'); R(ctx, x - 39, y + 6, 5, 1, 'p'); R(ctx, x - 36, y - 5, 4, 10, 'd'); R(ctx, x - 35, y - 4, 2, 8, 'm');   // оперення
    R(ctx, x - 9, y + 12, 18, 6, 'd'); R(ctx, x - 8, y + 13, 16, 4, 'S'); [-6, -1, 4].forEach(wx => R(ctx, x + wx, y + 14, 3, 2, 'y'));      // гондола
    R(ctx, x + 37, y - 1, 2, 3, 'd'); const sp = Math.floor(t * 20) % 2; R(ctx, x + 39, y - 4 - sp, 1, 8 + sp * 2, 'e');                     // гвинт
    BTH.text(x - 14, y - 3, word || 'BUILD', 'k');
    R(ctx, x - 14, y + 4, 30, 1, 'r');
  }
  function slab(x, y, w) { x = Math.round(x); y = Math.round(y); R(ctx, x - (w >> 1), y, w, 8, 'd'); R(ctx, x - (w >> 1) + 1, y + 1, w - 2, 6, 'E'); R(ctx, x - (w >> 1) + 1, y + 1, w - 2, 1, 'w'); for (let i = 0; i < w - 4; i += 6) R(ctx, x - (w >> 1) + 2 + i, y + 6, 3, 1, 'h'); R(ctx, x - 1, y - 2, 3, 2, 'd'); }
  function robot(x, y, t, dir, o) {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const P = (dx, dy, w, h, c) => R(ctx, dir > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, c);
    const key = Math.floor(t * 6) % 2, fl = Math.floor(t * 18) % 3;
    if (o.fly) { P(-2, 6, 3, 3 + fl, 'o'); P(-1, 6, 1, 2 + fl, 'y'); }                       // реактивний ранець
    P(-6, -6, 3, 8, 'd'); P(-5, -5, 1, 6, 'Y');                                              // ранець
    P(-3, -12, 7, 6, 'd'); P(-2, -11, 5, 4, 'Y'); P(-1, -10, 1, 1, 'N'); P(1, -10, 1, 1, 'N'); P(-1, -8, 3, 1, 'd'); P(0, -15, 1, 3, 'd'); P(0, -16, 1, 1, 'r');    // голова-коробка
    P(-4, -6, 9, 8, 'd'); P(-3, -5, 7, 6, 'p'); P(-2, -4, 3, 2, 'w'); P(2, -3, 1, 1, 'r'); P(-3, -1, 7, 1, 'm');
    P(-1, 2, 2, 3, 'd'); P(2, 2, 2, 3, 'd'); P(-2, 5, 4, 1, 'd'); P(1, 5, 4, 1, 'd');
    P(-8, -8 + key * 2, 2, 1, 'h'); P(-8, -7 + key * 2, 1, 2, 'h');                         // ключ заводу
    if (o.gun) { P(4, -5, 3, 2, 'Y'); P(6, -6, 6, 3, 'd'); P(7, -5, 5, 1, 'e'); if (o.fire) { P(12, -6, 2, 3, 'y'); P(13, -5, 1, 1, 'w'); } }
  }
  function bubble(x, y, str, c) {
    const w = BTH.textW(str) + 8; x = Math.round(x - w / 2); y = Math.round(y);
    R(ctx, x + 1, y, w - 2, 11, 'd'); R(ctx, x, y + 1, w, 9, 'd'); R(ctx, x + 1, y + 1, w - 2, 9, c || 'y'); R(ctx, x + 2, y, w - 4, 1, c || 'y'); R(ctx, x + 2, y + 10, w - 4, 1, 'd');
    R(ctx, x - 2, y + 4, 2, 3, 'd'); R(ctx, x + w, y + 4, 2, 3, 'd'); R(ctx, x + (w >> 1) - 1, y - 2, 3, 2, 'd'); R(ctx, x + (w >> 1), y - 1, 1, 2, c || 'y');
    BTH.text(x + 4, y + 3, str, 'r');
  }
  function chute(x, y, t) {
    x = Math.round(x); y = Math.round(y);
    for (let i = -7; i <= 7; i++) { const h = Math.round(5 * Math.sqrt(1 - (i / 8) * (i / 8))); R(ctx, x + i, y - h, 1, h, (i + 8 >> 2) & 1 ? 'r' : 'w'); R(ctx, x + i, y - h, 1, 1, 'd'); }
    lineG(ctx, x - 7, y, x, y + 9, 'd'); lineG(ctx, x + 7, y, x, y + 9, 'd');
    R(ctx, x - 3, y + 9, 7, 6, 'd'); R(ctx, x - 2, y + 10, 5, 4, 'c'); R(ctx, x - 2, y + 11, 5, 1, 'b');
  }
  const WORDS_UK = ['БАМ!', 'ТРАХ!', 'БУМ!', 'ТУК!', 'ХЛОП!'], WORDS_EN = ['BAM!', 'CRASH!', 'BOOM!', 'POW!', 'WHAM!'];
  B.list[1] = {
    id: 'retro',
    behind(G) {
      const { t, q } = G;
      if (G.mode === 'rise' && G.p >= G.A - 0.02 && G.p < G.C + 0.02) {                       // м'ятна балка-ферма на лінії кладки
        const x = shop.x - 4, w = shop.w + 8, y = G.top - 4;
        R(ctx, x, y, w, 5, 'd'); R(ctx, x, y + 1, w, 3, 'm'); R(ctx, x, y + 1, w, 1, 'w');
        for (let i = 0; i < w; i += 8) { R(ctx, x + i, y + 1, 1, 3, 'd'); R(ctx, x + i + 1, y + 2, 2, 1, 'd'); }
        for (let i = 3; i < w; i += 16) R(ctx, x + i, y + 2, 1, 1, 'r');
      }
      if (q > 0.05) {                                                                        // пастельне сонце-промені за магазином
        const a = c01((q - 0.05) / 0.2) * (1 - c01((q - 0.85) / 0.15)), rx = G.cx, ry = G.roof + 30;
        ctx.globalAlpha = 0.28 * a;
        for (let k = 0; k < 14; k++) { const ang = -Math.PI + (k + 0.5) / 14 * Math.PI + Math.sin(t * 0.6) * 0.03; for (let r = 40; r < 190; r += 2) { const w = 2 + r * 0.14; R(ctx, Math.round(rx + Math.cos(ang) * r - w / 2), Math.round(ry + Math.sin(ang) * r), Math.round(w), 2, k % 3 === 0 ? 'q' : k % 3 === 1 ? 'm' : 'y'); } }
        ctx.globalAlpha = 1;
      }
    },
    work(G) {
      const { t, p, A, x0, x1, top, base, gy } = G, tA = A * G.b.dur;
      let bx = G.cx + Math.sin(t * 0.55) * 18, by = Math.min(top - 62, base - 160) + Math.sin(t * 1.3) * 2;
      if (p < A) { const s = smooth01(c01(p / A)); bx = lerp(visL() - 90, bx, s); by = lerp(by - 40, by, s); }
      if (G.q > 0.3) { const s = smooth01(c01((G.q - 0.3) / 0.6)); bx = lerp(bx, visR() + 100, s); by -= s * 20; }
      // стос ящиків і парашути, що приземляються
      if (p > A - 0.04) {
        const n = Math.round(8 * c01((G.wp * 1.0)) * (1 - 0.0)) , cnt = Math.max(0, 8 - Math.round(G.wp * 6));
        for (let i = 0; i < cnt; i++) { const bx2 = x1 + 10 + (i % 3) * 11, by2 = gy - 7 - Math.floor(i / 3) * 7; R(ctx, bx2, by2, 10, 7, 'd'); R(ctx, bx2 + 1, by2 + 1, 8, 5, 'c'); R(ctx, bx2 + 1, by2 + 3, 8, 1, 'b'); R(ctx, bx2 + 4, by2 + 1, 2, 5, 'h'); }
      }
      // плити на тросі
      if (p >= A * 0.7 && G.q < 0.1) {
        const T = 1.25, k = Math.floor((t - tA) / T), u = ((t - tA) / T) - k;
        const tx = lerp(x0 + 30, x1 - 30, rnd(k * 3.7 + 1)), ty = G.top - 8;
        const s = c01(u / 0.65), sy = lerp(by + 20, ty, smooth01(s)), sx = lerp(bx, tx, smooth01(s));
        const cab = (x, yy) => { R(ctx, Math.round(x), by + 14, 1, Math.round(yy - (by + 14)), 'd'); };
        if (u < 0.65) { cab(sx, sy); slab(sx, sy, 28); }
        else { cab(lerp(tx, bx, (u - 0.65) / 0.35), lerp(ty - 2, by + 20, (u - 0.65) / 0.35)); if (u < 0.78) { B.spark(tx - 8 + rnd(k) * 4, ty + 6, 'y', 'w', true); B.spark(tx + 8, ty + 4, 'o', 'y'); } }
      }
      blimp(bx, by, t, G.q > 0.12 ? 'OPEN!' : 'BUILD');
      if (p > A * 0.8 && G.q < 0.3) { const T2 = 4.2, k = Math.floor((t - 0.7) / T2), u = (t - 0.7) / T2 - k; if (u < 0.8) chute(lerp(bx, x1 + 25, smooth01(u / 0.8)) + Math.sin(u * 14) * 4, lerp(by + 20, gy - 26, smooth01(u / 0.8)), t); }
      // робоботи з ранцями: заклепують лінію кладки
      const RS = [-92, -40, 36, 88];
      RS.forEach((dx, i) => {
        let x = G.cx + dx + Math.sin(t * 1.1 + i) * 6, y = G.top - 20 + Math.sin(t * 3 + i * 1.7) * 3, dir = dx < 0 ? 1 : -1, fire = Math.floor(t * 4 + i * 1.3) % 3 === 0;
        if (p < A) { const s = smooth01(c01(p / A)); x = lerp(dx < 0 ? visL() - 30 : visR() + 30, x, s); y = lerp(gy - 8, y, s); }
        if (G.q > 0.2) { const s = smooth01(c01((G.q - 0.2) / 0.5)); y -= s * 80; x += (dx < 0 ? -1 : 1) * s * 70; }
        robot(x, y, t, dir, { fly: true, gun: true, fire });
        if (fire && p > A && G.q < 0.1) B.spark(x + dir * 14, y - 4, 'y', 'w');
      });
      if (p > A && G.q < 0.05) { const k = Math.floor(t * 1.6), pos = k % RS.length; const px = G.cx + RS[pos] * 0.9, py = G.top - 42 - (k % 3) * 6; if ((t * 1.6) % 1 < 0.7) bubble(px, py, (state.lang === 'uk' ? WORDS_UK : WORDS_EN)[k % 5]); }
    },
    finale(G) {
      const { t, q } = G;
      if (q > 0.08) {                                                                         // гармати з конфеті на кутах даху
        [[shop.x + 6, 1], [shop.x + shop.w - 6, -1]].forEach(([cx0, d], ci) => {
          const cy0 = G.roof + 6;
          R(ctx, cx0 - 4, cy0 - 2, 8, 6, 'd'); R(ctx, cx0 - 3, cy0 - 1, 6, 4, 'p'); R(ctx, cx0 + d * 3, cy0 - 7, 3, 7, 'd'); R(ctx, cx0 + d * 3 + (d > 0 ? 0 : 0), cy0 - 7, 2, 6, 'Y');
          const s = (q - 0.08) * G.b.dur * (1 - BUILD_C) * 0.9;
          for (let k = 0; k < 44; k++) { const u = s - k * 0.012; if (u <= 0 || u > 1.5) continue; const vx = d * (10 + rnd(k + ci * 50) * 90) * (k % 5 === 0 ? -0.4 : 1), vy = -(80 + rnd(k * 2.3 + ci) * 90); R(ctx, Math.round(cx0 + vx * u), Math.round(cy0 - 8 + vy * u + 150 * u * u), 2, 2, ['f', 'm', 'y', 'q', 'S', 'o'][(k + ci) % 6]); }
        });
      }
      B.bunting(G, ['f', 'm', 'y', 'q', 'S', 'p']);
    }
  };
})();

