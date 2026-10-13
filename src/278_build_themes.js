//#part 278_build_themes.js
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

