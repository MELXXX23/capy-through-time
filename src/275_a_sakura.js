//#part 275_a_sakura.js
/* =====================================================================
   САКУРА v2 (Японія): справжня форма японської вишні — темний стовбур із поперечними рисками кори, гілки розходяться парасолькою,
   крона з шарів «хмаринок» (задні темніші, передні кидають тінь на задні), квіточки-плюсики на світлому боці, гілочки просвічують
   у тіні, 1px контур (зверху м'якший рожевий). Три види: 0 — сомеї-йосіно (бліда, широка), 1 — висока з куполом, 2 — яедзакура (густо-рожева, кругла). Восени — ті самі форми кольорами кленів, узимку — голі гілки зі снігом.
   Кожне дерево будується один раз у полотно (кеш за видом, сезоном і x & 3) і далі лише копіюється.
   ===================================================================== */
const SAKURA_W = 84, SAKURA_H = 104, SAKURA_OX = 42, SAKURA_OY = 96;          // полотно дерева; (OX, OY) — точка біля коренів
const SAKURA_CACHE = new Map();
const SAKURA_PAL = {                                                           // [контур, 5 тонів від тіні до відблиску]
  v0: ['#a2506f', '#d88aa6', '#f2afc3', '#ffd0dc', '#ffe8ef', '#ffffff'],
  v1: ['#9a4a6c', '#cf7c9c', '#eda2b9', '#fcc4d3', '#ffe2ea', '#ffffff'],
  v2: ['#86305a', '#c2557f', '#e17aa0', '#f6a2bd', '#ffcad8', '#fff0f5'],
  autumn: ['#5e2014', '#9c3424', '#c8502a', '#e47c34', '#f2aa48', '#ffd878'],
};
SAKURA_PAL.v3 = SAKURA_PAL.v4 = ['#173f20', '#27632f', '#3a8a3b', '#5cb046', '#86d457', '#c4f27a'];                 // звичайні дерева: літня зелень
SAKURA_PAL.halloween = ['#160c26', '#34195a', '#5a3190', '#8650c0', '#b278e4', '#dcaaff', '#ff9a2a'];     // Хелловін: фіолетова крона з помаранчевими вогниками
SAKURA_PAL.spring = ['#1d4a2a', '#2f7236', '#4a9a40', '#7cc552', '#a8e06e', '#e0f6a0', '#ffd2e0'];     // навесні: свіжа зелень і рожеві квіточки (7-й колір)
const SAKURA_WOOD = ['#1e1418', '#3a2626', '#563a32', '#74503f', '#9a7058'];   // контур, 4 тони кори
const SAKURA_SHAPES = [
  {   // 0 сомеї-йосіно: стовбур, три гілки парасолькою, широка пласка крона
    limbs: [[0, 0, -1, -16, 4.2, 3.4], [-1, -16, -2, -22, 3.4, 3], [-2, -22, -15, -31, 2.8, 2], [-15, -31, -26, -36, 2, 1.2], [-2, -21, 12, -30, 2.8, 2], [12, -30, 25, -35, 2, 1.2],
      [-2, -22, 1, -36, 2.3, 1.6], [1, -36, -3, -46, 1.6, 1], [-1, -1, -7, 1, 2, 1], [1, -1, 7, 1, 2, 1]],
    tips: [[-26, -36, -2.8], [25, -35, -0.35], [-3, -46, -1.9], [-15, -31, -2.2], [12, -30, -0.9]],
    clusters: [[-14, -48, 12, 8, 0], [13, -48, 12, 8, 0], [0, -56, 13, 8, 0], [-26, -40, 9, 6, 1], [26, -39, 9, 6, 1], [-6, -46, 11, 8, 1], [8, -45, 11, 8, 1],
      [-18, -36, 9, 5, 2], [17, -35, 9, 5, 2], [0, -39, 9, 5, 2]],
  },
  {   // 1 вища сакура: стовбур вищий, гілки аркою, купол крони
    limbs: [[0, 0, 1, -20, 4, 3.2], [1, -20, 0, -34, 3.2, 2.4], [0, -34, -12, -46, 2.2, 1.4], [-12, -46, -24, -44, 1.4, 1], [0, -34, 12, -47, 2.2, 1.4], [12, -47, 24, -43, 1.4, 1],
      [0, -34, 1, -52, 2, 1.2], [-1, -1, -7, 1, 2, 1], [1, -1, 7, 1, 2, 1]],
    tips: [[-24, -44, -3], [24, -43, -0.2], [1, -52, -1.6]],
    clusters: [[0, -54, 14, 7, 0], [-16, -48, 10, 6, 0], [16, -48, 10, 6, 0], [-24, -42, 8, 5, 1], [24, -41, 8, 5, 1], [-7, -48, 10, 6, 1], [8, -49, 10, 6, 1], [-14, -41, 9, 5, 2], [14, -40, 9, 5, 2]],
  },
  {   // 2 яедзакура: густа кругла крона
    limbs: [[0, 0, 0, -20, 4, 3.2], [0, -20, -12, -32, 2.6, 1.6], [0, -20, 12, -31, 2.6, 1.6], [0, -20, 1, -38, 2.4, 1.4], [-12, -32, -22, -36, 1.6, 1], [12, -31, 22, -35, 1.6, 1],
      [-1, -1, -7, 1, 2, 1], [1, -1, 7, 1, 2, 1]],
    tips: [[-22, -36, -2.7], [22, -35, -0.45], [1, -38, -1.6]],
    clusters: [[0, -52, 16, 11, 0], [-16, -46, 10, 8, 0], [16, -46, 10, 8, 0], [-22, -38, 8, 6, 1], [22, -37, 8, 6, 1], [-8, -44, 10, 8, 1], [9, -45, 10, 8, 1],
      [-12, -34, 8, 5, 2], [12, -33, 8, 5, 2], [0, -37, 8, 5, 2]],
  },
];
function drawSakura(g, x, v, season) {
  const base = LAYOUT.horizonY + 8, sd = Math.round(x) & 3, key = v + '|' + season + '|' + sd;
  let c = SAKURA_CACHE.get(key);
  if (!c) { if (SAKURA_CACHE.size > 48) SAKURA_CACHE.clear(); c = sakuraBuild(v % 3, season, sd * 977 + v * 131 + 7); SAKURA_CACHE.set(key, c); }
  g.drawImage(c, Math.round(x) - SAKURA_OX, base - SAKURA_OY);
}
function sakuraBuild(v, season, seed) {
  const big = v >= 3, W = big ? 108 : SAKURA_W, H = big ? 130 : SAKURA_H, OX = big ? 54 : SAKURA_OX, OY = big ? 116 : SAKURA_OY, N = W * H;
  let s = seed >>> 0; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const hh = (a, b) => { let h = (Math.imul(a + 999, 374761393) + Math.imul(b + 999, 668265263) + Math.imul(seed, 2246822519)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const winter = season === 'winter', autumn = season === 'autumn', SH = SAKURA_SHAPES[v];
  const PAL = autumn ? SAKURA_PAL.autumn : (big && season === 'spring') ? SAKURA_PAL.spring : (big && season === 'halloween') ? SAKURA_PAL.halloween : SAKURA_PAL['v' + v], OUT = PAL[0], T = PAL.slice(1), WD = SAKURA_WOOD, BL = T[5] || T[4];
  const kind = new Uint8Array(N), cid = new Int16Array(N).fill(-1), tone = new Int8Array(N), lit = new Float32Array(N), wasWood = new Uint8Array(N), isTwig = new Uint8Array(N), wdist = new Float32Array(N).fill(9);
  const col = new Array(N).fill(null), alpha = new Float32Array(N);
  const at = (x, y) => { const X = x + OX, Y = y + OY; return X < 0 || Y < 0 || X >= W || Y >= H ? -1 : Y * W + X; };
  const kindAt = (x, y) => { const k = at(x, y); return k < 0 ? 0 : kind[k]; };

  /* ---- дерево: стовбур, гілки, гілочки (світло зліва) ---- */
  function wood(x0, y0, x1, y1, r0, r1, tw) {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.ceil(L * 3));
    for (let i = 0; i <= n; i++) {
      const t = i / n, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t, r = Math.max(0.75, r0 + (r1 - r0) * t), R = Math.ceil(r) + 1;
      for (let py = Math.floor(cy - R); py <= cy + R; py++) for (let px = Math.floor(cx - R); px <= cx + R; px++) {
        const dx = px + 0.5 - cx, dy = py + 0.5 - cy, d = Math.hypot(dx, dy) / r; if (d > 1) continue;
        const k = at(px, py); if (k < 0 || d >= wdist[k]) continue;
        wdist[k] = d; kind[k] = 1; isTwig[k] = tw ? 1 : 0;
        const sh = dx / r; tone[k] = r < 1.3 ? 1 : sh < -0.4 ? 3 : sh < 0.05 ? 2 : sh < 0.5 ? 1 : 0;
      }
    }
  }
  function twig(x, y, a, len, d) {
    const x1 = x + Math.cos(a) * len, y1 = y + Math.sin(a) * len;
    wood(x, y, x1, y1, d > 1 ? 1 : 0.75, 0.75, 1);
    if (d > 0) { twig(x1, y1, a - 0.4 - rnd() * 0.3, len * 0.7, d - 1); twig(x1, y1, a + 0.35 + rnd() * 0.3, len * 0.7, d - 1); }
  }
  SH.limbs.forEach(l => wood(...l));
  SH.tips.forEach(([x, y, a]) => twig(x, y, a, winter ? 9 : 6, winter ? 3 : 1));
  if (winter) SH.limbs.forEach(([x0, y0, x1, y1, r0, r1]) => { if (y1 > -20) return; const a = Math.atan2(y1 - y0, x1 - x0); twig(x1, y1, a - 0.3, 8, 2); twig((x0 + x1) / 2, (y0 + y1) / 2, a - 0.9, 7, 2); });   // узимку густе плетиво гілочок
  for (let k = 0; k < N; k++) if (kind[k] === 1) wasWood[k] = 1;

  /* ---- крона: хмаринки з гребінцем зверху й пласким низом ---- */
  const cls = SH.clusters.map(c => [c[0] + Math.round((rnd() - 0.5) * 3), c[1] + Math.round((rnd() - 0.5) * 2) - 2, c[2] * 1.0, c[3] * 1.06, c[4]]);
  if (!winter) cls.forEach((cl, i) => {
    const [cx, cy, rx, ry, dep] = cl, nb = 5 + (i % 3), ph = i * 1.7;
    for (let py = Math.floor(cy - ry * 1.3); py <= cy + ry * 1.3; py++) for (let px = Math.floor(cx - rx * 1.3); px <= cx + rx * 1.3; px++) {
      const u = (px + 0.5 - cx) / rx, w0 = (py + 0.5 - cy) / ry, w = w0 > 0 ? w0 * 1.35 : w0;
      const r = Math.hypot(u, w), ang = Math.atan2(w, u);
      const lim = 1 + (w < 0.25 ? 0.14 * Math.cos(ang * nb + ph) : 0.06 * Math.cos(ang * nb * 1.6 + ph));
      if (r > lim) continue;
      const k = at(px, py); if (k < 0) continue;
      let L = 0.5 - (u * 0.5 + w0 * 0.8) * 0.5 + (dep - 1) * 0.08 + (r > lim - 0.18 && w0 > 0 ? -0.12 : 0) + (big && w0 > 0.4 ? -0.22 * (w0 - 0.4) : 0);
      kind[k] = 2; cid[k] = i; lit[k] = L;
      tone[k] = L < 0.2 ? 0 : L < 0.42 ? 1 : L < 0.64 ? 2 : L < 0.86 ? 3 : 4;
    }
  });
  if (!winter) {
    for (let k = 0; k < N; k++) if (kind[k] === 1 && isTwig[k]) kind[k] = 0;            // гілочки поза кроною не стирчать
    for (let y = -OY; y < H - OY; y++) for (let x = -OX; x < W - OX; x++) {          // тінь передньої хмаринки на задню + темніший низ передньої
      const k = at(x, y); if (kind[k] !== 2) continue;
      const a1 = at(x, y - 1), a2 = at(x, y - 2), b1 = at(x, y + 1);
      if (a1 >= 0 && kind[a1] === 2 && cid[a1] > cid[k]) tone[k] = 0;
      else if (a2 >= 0 && kind[a2] === 2 && cid[a2] > cid[k]) tone[k] = Math.min(tone[k], 1);
      if (b1 >= 0 && kind[b1] === 2 && cid[b1] < cid[k]) tone[k] = Math.min(tone[k], 1);
    }
    if (big) for (let i = 0; i < 90; i++) {                                              // дрібні купки листя: кожна має світлу шапку й темне дно, тож крона об'ємна
      const cx = Math.round((rnd() - 0.5) * 70), cy = -30 - Math.round(rnd() * 52), kc = at(cx, cy); if (kc < 0 || kind[kc] !== 2) continue;
      const t0 = tone[kc];
      for (let py = cy - 2; py <= cy + 2; py++) for (let px = cx - 3; px <= cx + 3; px++) {
        const dxx = (px + 0.5 - cx) / 3, dyy = (py + 0.5 - cy) / 2.2; if (dxx * dxx + dyy * dyy > 1) continue;
        const k = at(px, py); if (k < 0 || kind[k] !== 2 || cid[k] !== cid[kc]) continue;
        tone[k] = dyy < -0.35 ? Math.min(4, t0 + 1) : dyy > 0.45 ? Math.max(0, t0 - 1) : t0;
      }
    }
    for (let y = -OY; y < H - OY; y++) for (let x = -OX; x < W - OX; x++) {          // квіточки-плюсики на світлому, цятки в тіні
      const k = at(x, y); if (kind[k] !== 2) continue;
      const q = hh(x, y);
      if (tone[k] >= 2 && q < (big ? (season === 'spring' ? 0.06 : season === 'halloween' ? 0.05 : 0.03) : 0.055)) { col[k] = BL; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const n = at(x + dx, y + dy); if (n >= 0 && kind[n] === 2 && !col[n]) tone[n] = Math.min(4, Math.max(tone[n], tone[k] + 1)); }); }
      else if (tone[k] <= 1 && q < 0.045) col[k] = T[2];
    }
  }

  /* ---- контур: збоку й знизу темний, зверху м'якший; відблиск під верхнім краєм ---- */
  const edge = new Uint8Array(N);
  for (let y = -OY; y < H - OY; y++) for (let x = -OX; x < W - OX; x++) {
    const k = at(x, y); if (!kind[k]) continue;
    const up = kindAt(x, y - 1) === 0, emp = up || kindAt(x - 1, y) === 0 || kindAt(x + 1, y) === 0 || kindAt(x, y + 1) === 0;
    if (emp) edge[k] = up ? 2 : 1;
  }
  for (let k = 0; k < N; k++) {
    if (!kind[k]) continue;
    if (kind[k] === 1) col[k] = edge[k] ? WD[0] : WD[1 + tone[k]] || WD[4];
    else if (edge[k]) col[k] = edge[k] === 2 && lit[k] > 0.45 ? T[0] : OUT;
    else if (!col[k]) col[k] = wasWood[k] && tone[k] <= 1 && hh(k, 7) < 0.6 ? WD[1] : T[tone[k]];
    alpha[k] = 1;
  }
  for (let y = -OY + 1; y < H - OY; y++) for (let x = -OX; x < W - OX; x++) {       // світла смужка під верхнім контуром
    const k = at(x, y), a = at(x, y - 1); if (kind[k] === 2 && !edge[k] && edge[a] === 2 && tone[k] >= 2) col[k] = T[4];
  }
  for (let y = -30; y < 0; y++) for (let x = -6; x <= 6; x++) {                       // поперечні риски кори
    const k = at(x, y); if (kind[k] === 1 && !edge[k] && (y + 40) % 5 === 0 && hh(x, y) < 0.7) col[k] = WD[1];
  }
  if (winter) for (let y = -OY + 1; y < -14; y++) for (let x = -OX; x < W - OX; x++) {      // сніг на гілках
    const k = at(x, y); if (kind[k] === 1 && kindAt(x, y - 1) === 0) { col[k] = '#ffffff'; const b = at(x, y + 1); if (b >= 0 && kind[b] === 1 && hh(x, y) < 0.5) col[b] = '#dce8f8'; }
  }

  /* ---- земля: м'яка тінь, килим пелюсток, кілька пелюсток у повітрі ---- */
  const setA = (x, y, c, a) => { const k = at(x, y); if (k >= 0 && !kind[k]) { col[k] = c; alpha[k] = a; } };
  const gw = big ? 36 : 26;
  for (let y = 0; y <= 4; y++) for (let x = -gw; x <= gw; x++) if ((x / gw) ** 2 + ((y - 1.8) / (big ? 3 : 2.5)) ** 2 < 1) setA(x, y, '#2a1420', big ? 0.26 : 0.2);
  if (!winter) {
    const pc = autumn ? [T[2], T[3], T[4]] : big ? (season === 'spring' ? [BL, T[4], BL] : [T[1], T[2], T[1]]) : [T[2], T[3], T[4], T[3]];
    for (let i = 0; i < (big ? (season === 'summer' || season === 'halloween' ? 14 : 36) : 46); i++) { const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()), px = Math.round(Math.cos(a) * rr * (big ? 38 : 32)), py = Math.round(2.5 + Math.sin(a) * rr * 3.5); const k = at(px, py); if (k >= 0) { col[k] = pc[i % pc.length]; alpha[k] = 1; } }
    for (let i = 0; i < (big && (season === 'summer' || season === 'halloween') ? 0 : 9); i++) { const px = Math.round((rnd() - 0.5) * 60), py = -4 - Math.round(rnd() * 22); if (kindAt(px, py) || kindAt(px + 1, py)) continue; setA(px, py, T[3], 1); if (i % 2) setA(px + 1, py, T[2], 1); }
  }

  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const cg = c.getContext('2d'), im = cg.createImageData(W, H), d = im.data;
  for (let k = 0; k < N; k++) {
    if (!col[k]) continue;
    const h = col[k]; d[k * 4] = parseInt(h.slice(1, 3), 16); d[k * 4 + 1] = parseInt(h.slice(3, 5), 16); d[k * 4 + 2] = parseInt(h.slice(5, 7), 16); d[k * 4 + 3] = Math.round(alpha[k] * 255);
  }
  cg.putImageData(im, 0, 0);
  return c;
}

/* =====================================================================
   ЗВИЧАЙНІ ДЕРЕВА v2 (улітку, навесні, восени): та сама майстерня, що й сакура, але об'ємніші — 4 шари «хмаринок» крони
   (задні темніші, передні кидають тінь), темніший низ кожної, дрібні купки листя зі світлою шапкою, товстий стовбур із корінням.
   Три види: 3 — розлогий дуб, 4 — висока липа, 5 — широка крона. Узимку лишається голе дерево, на Хелловін — старе з гарбузами.
   ===================================================================== */
SAKURA_SHAPES.push(
  {   // 3 дуб: густа кругла крона
    limbs: [[0, 0, 0, -18, 5.6, 4.6], [0, -18, -9, -30, 3.6, 2.6], [0, -18, 9, -30, 3.6, 2.6], [0, -18, 0, -36, 3.2, 2.2], [-9, -30, -20, -38, 2.2, 1.4], [9, -30, 20, -38, 2.2, 1.4],
      [-1, -1, -9, 1, 2.8, 1], [1, -1, 9, 1, 2.8, 1], [-2, 0, -13, 1, 1.8, 1], [2, 0, 13, 1, 1.8, 1]],
    tips: [[-20, -38, -2.8], [20, -38, -0.35]],
    clusters: [[0, -58, 15, 10, 0], [-17, -50, 11, 8, 0], [17, -50, 11, 8, 0], [-9, -64, 10, 7, 0], [9, -64, 10, 7, 0], [0, -44, 14, 8, 0],
      [-21, -42, 9, 7, 1], [21, -42, 9, 7, 1], [-8, -54, 11, 8, 1], [9, -55, 11, 8, 1], [0, -62, 10, 7, 1],
      [-15, -40, 9, 6, 2], [15, -40, 9, 6, 2], [0, -48, 11, 7, 2], [-6, -36, 8, 5, 2], [7, -37, 8, 5, 2],
      [-22, -33, 7, 5, 3], [22, -33, 7, 5, 3], [0, -34, 9, 5, 3]],
  },
  {   // 4 липа: висока, крона завширшки майже як у дуба (~58 px проти 63)
    limbs: [[0, 0, 1, -22, 5, 4], [1, -22, 0, -38, 3.4, 2.4], [0, -38, -13, -48, 2.2, 1.4], [0, -38, 13, -49, 2.2, 1.4], [0, -38, 2, -56, 2, 1.2], [-1, -1, -9, 1, 2.6, 1], [1, -1, 9, 1, 2.6, 1]],
    tips: [[-13, -48, -2.6], [13, -49, -0.5]],
    clusters: [[0, -74, 13, 9, 0], [0, -60, 17, 10, 0], [-16, -52, 11, 7, 0], [16, -52, 11, 7, 0], [0, -45, 16, 8, 0],
      [-10, -66, 11, 7, 1], [11, -64, 11, 7, 1], [-19, -48, 10, 6, 1], [19, -48, 10, 6, 1],
      [0, -56, 13, 8, 2], [-13, -42, 10, 5, 2], [13, -42, 10, 5, 2], [0, -50, 11, 6, 3]],
  }
);
const TREE2_CACHE = new Map();
function drawTreeV2(g, x, v, season) {
  const base = LAYOUT.horizonY + 8, sd = Math.round(x) & 3, vi = v % 3 === 1 ? 4 : 3, key = vi + '|' + season + '|' + sd;
  let c = TREE2_CACHE.get(key);
  if (!c) { if (TREE2_CACHE.size > 40) TREE2_CACHE.clear(); c = sakuraBuild(vi, season, sd * 977 + vi * 131 + 11); TREE2_CACHE.set(key, c); }
  g.drawImage(c, Math.round(x) - 54, base - 116);
}
