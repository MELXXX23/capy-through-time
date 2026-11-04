//#part 275_a_fuji.js
/* =====================================================================
   ФУДЗІ (Японія). Тіло гори, її розмір і схили — ті самі, що були. Нова лише верхівка: зрізана вершина з кратером,
   сніговий ковпак із довгими «пальцями», плоскі тони снігу, свої кольори снігу ввечері й уночі. Пікселі 1×1, як у будинків.
   Гора будується ОДИН раз у карту номерів кольорів (на кожен розмір). День, вечір і ніч — та сама карта з іншою
   палітрою: кадр лише копіює готове полотно, перефарбовується воно, коли змінюється фаза доби.
   Політ дракона рахується від того самого конуса, що й раніше (dseqBuild у 275_japan), кратер потрібен лише там,
   де тіло дракона ховається за гору (fujiHeight).
   ===================================================================== */
const FUJI_CRATER = 0.029;                                     // на яку частку висоти зрізана гостра вершина
function fujiCone(dx, H, hw) { return H * Math.pow(Math.max(0, 1 - Math.abs(dx) / hw), 1.3); }      // схил: висота над основою на відстані dx від осі
function fujiConeW(d, H, hw) { return hw * (1 - Math.pow(Math.max(0, 1 - d / H), 1 / 1.3)); }       // півширина конуса на глибині d від вершини
const FUJI_RIM = [[-1, 0], [-0.72, 1], [-0.46, 2], [-0.2, 1], [0.12, 0], [0.44, 2], [0.72, 1], [1, 0]];      // зубці кратера: на скільки пікселів нижче краю (при H = 350)
function fujiHeight(dx, H, hw) {                               // справжній силует: конус із кратером угорі
  const h = fujiCone(dx, H, hw), rim = H * (1 - FUJI_CRATER);
  if (h <= rim) return h;
  const q = dx / fujiConeW(H * FUJI_CRATER, H, hw); let i = 0;
  while (i < FUJI_RIM.length - 2 && q > FUJI_RIM[i + 1][0]) i++;
  const A = FUJI_RIM[i], B = FUJI_RIM[i + 1];
  return rim - (A[1] + (B[1] - A[1]) * Math.max(0, Math.min(1, (q - A[0]) / (B[0] - A[0])))) * Math.max(0.7, H / 350);
}

/* Яри й пальці снігу: [a — місце на схилі (−1 лівий край, 1 правий), довжина пальця, довжина яру нижче пальця, ширина, глибина тіні] */
const FUJI_RAV = [[-0.87, 0.3, 0.1, 0.03, 1], [-0.72, 0.62, 0.22, 0.034, 1], [-0.58, 0.28, 0.12, 0.026, 1], [-0.44, 1, 0.3, 0.036, 1], [-0.3, 0.42, 0.14, 0.026, 1], [-0.17, 0.76, 0.32, 0.032, 1], [-0.05, 0.32, 0.12, 0.024, 1],
  [0.07, 1.12, 0.38, 0.036, 2], [0.2, 0.4, 0.15, 0.026, 1], [0.33, 0.84, 0.3, 0.034, 1], [0.47, 0.3, 0.12, 0.026, 1], [0.6, 0.72, 0.26, 0.034, 1], [0.74, 0.34, 0.12, 0.028, 1], [0.88, 0.5, 0.16, 0.03, 1]];
/* Окремі латки снігу в тих самих ярах нижче довгих пальців: [a, початок, кінець, ширина] */
const FUJI_PATCH = FUJI_RAV.filter(r => r[1] >= 0.6).map(r => { const tip = 0.2 + 0.205 * r[1]; return [r[0], tip + 0.03, tip + 0.085, 0.006]; });
/* Темні скелі під кратером, клинці вістрям униз: [місце вздовж кратера (−1…1), висота, півширина] у пікселях при H = 350 */
const FUJI_ROCK = [[-0.74, 8, 2.5], [-0.42, 5, 2], [0.42, 9, 3], [0.76, 6, 2.5]];      // посередині порожньо: там хрест годинникової вежі
const FUJI_TAU = 0.53;                                         // нижче цієї глибини (частка висоти) снігу вже немає

/* Номери кольорів у карті: 0 порожньо; 1–16 скеля (4 тони × 4 смуги серпанку); 17–32 те саме зі світлою лінією краю; далі контур, сніг і контур снігу */
const FJ_RIMC = 17, FJ_OT = 33, FJ_SNOW = 34, FJ_CSL = 38, FJ_CSR = 39, FJ_N = 40;
const FJ_SNOW_OF = [0, 1, 2, 3, 3];                            // тон у зоні світла → тон снігу
const fjHex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const fjMix = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
const FJ_BODY = (() => {                                       // тіло гори: старі кольори
  const RL = fjHex('#c2c8fb'), RS = fjHex('#454b90'), SL = fjHex('#ffffff'), HZ = fjHex('#d0d4f8'), P = [[0, 0, 0]];
  const rock = [0, 0.34, 0.68, 1].map(t => fjMix(RS, RL, t));
  [0, 0.2, 0.4, 0.62].forEach(h => rock.forEach(r => P.push(fjMix(r, HZ, h))));
  for (let i = 1; i <= 16; i++) P.push(fjMix(P[i], SL, 0.55));
  P.push(fjHex('#2c2b66'));
  return P;
})();
const FJ_CAP = [['#8fa1e6', '#c7d0f2', '#e6ebfa', '#ffffff', '#6f7fd6', '#4a55a8'],      // сніг удень (4 тони, контур зліва, контур справа)
  ['#b97fa8', '#eaa7a6', '#ffc9b0', '#ffe6cf', '#a8607f', '#7d4a84'],      // увечері
  ['#6f7fd0', '#97a8e8', '#c2cef6', '#e6ecff', '#4a58a8', '#38448f']].map(a => a.map(fjHex));      // уночі
function fujiColors(n, d) {                                    // палітра на фазу доби (n 0…24 ніч, d 0…12 сутінки). Тіло гори темніє, як раніше; сніг має свої кольори
  const P = new Array(FJ_N), NV = fjHex('#141a40'), OR = fjHex('#ff8a4a'), kn = n / 24, kd = d / 12;
  P[0] = [0, 0, 0];
  for (let i = 1; i <= FJ_OT; i++) P[i] = fjMix(fjMix(FJ_BODY[i], NV, kn * 0.72), OR, kd * 0.1);
  for (let j = 0; j < 6; j++) P[FJ_SNOW + j] = fjMix(fjMix(FJ_CAP[0][j], FJ_CAP[1][j], kd * 0.92), FJ_CAP[2][j], kn);
  return P;
}

function* fujiMapGen(H, hw, viewW) {                        // карта номерів кольорів; віддає керування кожні кілька рядків, щоб подорож у часі не смикалась
  const Wf = hw * 2 + 8, Hc = Math.ceil(H / 2) * 2 + 2, crop = Math.max(0, (hw + 4 - (viewW >> 1) - 4) & ~1), W = Wf - 2 * crop;      // що за межами полотна сцени, не будуємо
  const map = new Uint8Array(W * Hc), n = Wf, i0 = crop, i1 = Wf - crop - 1, top = new Int16Array(n);
  const dxOf = i => i + 1 - hw - 4, colOf = dx => Math.round(dx + hw + 3);
  for (let i = 0; i < n; i++) { const h = fujiHeight(dxOf(i), H, hw); top[i] = h < 1 ? Hc : Math.max(0, Math.ceil(Hc - 1 - h)); }
  const ST = new Float32Array(1025);                           // межа снігу (глибина τ) для кожного місця на схилі
  for (let i = 0; i <= 1024; i++) {
    const a = i / 512 - 1; let v = 0;
    FUJI_RAV.forEach(r => { const u = Math.abs(a - r[0]) / 0.072; if (u < 1) v = Math.max(v, r[1] * Math.pow(1 - u, 1.25)); });
    ST[i] = 0.2 + 0.024 * Math.sin(a * 5.1 + 0.7) + 0.205 * v;
  }
  const zig = (seed, cnt) => { const pts = []; let t = 0.015, s = seed; for (let i = 0; i < cnt; i++) { s = (s * 16807) % 2147483647; const r = s / 2147483647; pts.push([t, (i % 2 ? 1 : -1) * (0.022 + 0.04 * r)]); t += 0.05 + 0.1 * ((s >>> 7) % 100) / 100; } return pts; };
  const at = (p, t) => { let i = 0; while (i < p.length - 2 && t > p[i + 1][0]) i++; const A = p[i], B = p[i + 1]; return A[1] + (B[1] - A[1]) * Math.max(0, Math.min(1, (t - A[0]) / (B[0] - A[0]))); };
  const ZB = [[-0.66, zig(11, 14)], [-0.2, zig(29, 14)], [0.12, zig(47, 14)], [0.44, zig(83, 14)]], ZT = [3, 4, 3, 2, 1];      // зони світла на снігу: зліва освітлений бік, справа тіньовий
  const gul = FUJI_RAV.map(r => { const tip = 0.2 + 0.205 * r[1]; return { a: r[0], t0: tip * 0.5, t1: tip + r[2], w: r[3], d: r[4], z: zig(101 + Math.round(r[0] * 90), 8) }; });
  const T = new Int8Array(n), G = new Uint8Array(n), F = new Uint8Array(n), C = new Uint8Array(n), PF = new Uint8Array(n);
  const ps = Math.max(0.7, H / 350), rimD = H * FUJI_CRATER, rimW = fujiConeW(rimD, H, hw);
  const RID = new Float32Array(4097), GUL = new Uint8Array(4097);      // промені на схилах: таблиця за кутом (u від −2 до 2), щоб не рахувати синуси на кожен піксель
  for (let i = 0; i <= 4096; i++) { const u = i / 1024 - 2; RID[i] = Math.sin(u * 15 + 0.9 * Math.sin(u * 4.3 + 1)) * 0.6 + Math.sin(u * 38 + 2) * 0.25 + Math.sin(u * 7 + 0.4) * 0.4; GUL[i] = Math.sin(u * 21 + 1.3 * Math.sin(u * 5 + 0.5)) > 0.9 ? 1 : 0; }
  for (let py = 0; py < Hc; py++) {
    if (!(py & 31)) yield;
    const hgt = Hc - py - 1, d = H - hgt, tau = d / H, cap = d > 0 && tau < FUJI_TAU;
    if (cap) {                                                 // верхівка: який тон і де сніг у цьому рядку
      const hr = Math.max(1, fujiConeW(d, H, hw)), calm = 1 / (1 + tau * tau * 9), xL = Math.max(i0, colOf(-hr) - 1), xR = Math.min(i1, colOf(hr) + 1);
      G.fill(0, xL, xR + 1); C.fill(0, xL, xR + 1);
      let x = xL; ZB.forEach((z, i) => { const b = Math.min(xR + 1, Math.max(x, colOf((z[0] + at(z[1], tau) * calm) * hr))); for (; x < b; x++) T[x] = ZT[i]; }); for (; x <= xR; x++) T[x] = ZT[4];
      for (const s of gul) {
        if (tau <= s.t0 || tau >= s.t1) continue;
        const u = (tau - s.t0) / (s.t1 - s.t0), wa = s.w * Math.min(1, u * 4) * (1 - u * u), ac = s.a + at(s.z, tau) * 0.28;
        const xa = Math.max(xL, colOf((ac - wa) * hr)), xb = Math.min(xR, colOf((ac + wa) * hr));
        for (let k = xa; k <= xb; k++) { T[k] = Math.max(0, T[k] - s.d); G[k] = 1; }
        const lit = Math.min(xR, xb + Math.max(1, Math.round((xb - xa) * 0.35)));
        if (xb > xa) for (let k = xb + 1; k <= lit; k++) T[k] = Math.min(4, T[k] + 1);
      }
      for (let i = xL; i <= xR; i++) F[i] = tau < ST[Math.max(0, Math.min(1024, ((dxOf(i) / hr + 1) * 512) | 0))] ? 1 : 0;
      for (const s of FUJI_PATCH) if (tau > s[1] && tau < s[2]) { const wa = s[3] * Math.sin((tau - s[1]) / (s[2] - s[1]) * Math.PI), xa = Math.max(xL, colOf((s[0] - wa) * hr)), xb = Math.min(xR, colOf((s[0] + wa) * hr)); for (let k = xa; k <= xb; k++) F[k] = 1; }
      for (const s of FUJI_ROCK) { const hh = s[1] * ps, dr = d - rimD; if (dr < hh) { const wa = s[2] * ps * (1 - Math.max(0, dr) / hh), xm = s[0] * rimW, xa = Math.max(xL, colOf(xm - wa)), xb = Math.min(xR, colOf(xm + wa)); for (let k = xa; k <= xb; k++) { F[k] = 0; C[k] = s[0] > 0 ? 1 : 2; } } }
    }
    for (let i = i0; i <= i1; i++) {
      const tp = top[i];
      if (py < tp) { PF[i] = 0; continue; }
      const dx = dxOf(i), edge = !(i > 0 && py >= top[i - 1] && i < n - 1 && py >= top[i + 1] && py - 1 >= tp && py + 1 < Hc);
      let v;
      if (cap && F[i]) { const t = T[i]; v = edge ? (dx < 0 ? FJ_CSL : FJ_CSR) : FJ_SNOW + Math.max(0, FJ_SNOW_OF[t] - (G[i] && t >= 3 ? 1 : 0)); PF[i] = 1; }
      else {                                                   // тіло гори: як було
        const ui = Math.max(0, Math.min(4096, ((dx / (d + 46) + 2) * 1024) | 0)), nxe = Math.max(-1, Math.min(1, dx / (hw * 0.75) + 0.26 * RID[ui]));
        let I = Math.max(0, Math.min(1, 0.5 - 0.46 * nxe + 0.1 * (hgt / H))); I = I * I * (3 - 2 * I) * 0.85 + I * 0.15;
        let L = Math.min(3, Math.floor(I * 4));
        if (GUL[ui] && hgt > 12) L = Math.max(0, L - 2);
        if (cap) { if (C[i]) L = C[i] - 1; else if (PF[i]) L = Math.max(0, L - 1); PF[i] = 0; }      // під краєм снігу тонка тінь: сніг лежить на скелі
        const band = hgt < 10 ? 3 : hgt < 22 ? 2 : hgt < 36 ? 1 : 0;
        v = edge ? FJ_OT : (dx < 0 && !(i >= 2 && py - 1 >= top[i - 2]) ? FJ_RIMC : 1) + L + 4 * band;
      }
      map[py * W + i - crop] = v;
    }
  }
  return { map, W, Hc, crop };
}
const fujiMaps = {};
let fujiCur = null, fujiCv = null, fujiIm = null, fujiPaintKey = '';
function* fujiPrepareGen(H, hw, cx, bY) {                      // готує гору для цього екрана (кеш за розміром: кілька рівнів і поворот екрана не перебудовують її знову)
  const key = H + '|' + hw + '|' + view.w;
  let e = fujiMaps[key];
  if (!e) {
    const ks = Object.keys(fujiMaps); if (ks.length >= 6) delete fujiMaps[ks[0]];
    e = yield* fujiMapGen(H, hw, view.w); fujiMaps[key] = e;
  }
  fujiCur = { e, x: cx - hw - 4 + e.crop, y: bY - e.Hc }; fujiPaintKey = '';
}
function fujiDraw(c, night, dusk) {                            // у кадрі: копія готового полотна; перефарбування лише коли змінилась фаза доби
  if (!fujiCur) return;
  const e = fujiCur.e, n = Math.round(night * 24), d = Math.round(dusk * 12), key = n + ':' + d + ':' + e.W + 'x' + e.Hc;
  if (key !== fujiPaintKey) {
    fujiPaintKey = key;
    if (!fujiCv) fujiCv = document.createElement('canvas');
    const g = fujiCv.getContext('2d', { willReadFrequently: true });
    if (fujiCv.width !== e.W || fujiCv.height !== e.Hc || !fujiIm) { fujiCv.width = e.W; fujiCv.height = e.Hc; fujiIm = g.createImageData(e.W, e.Hc); }
    const px = new Uint32Array(fujiIm.data.buffer), pal = new Uint32Array(FJ_N), P = fujiColors(n, d);
    for (let i = 1; i < FJ_N; i++) pal[i] = 0xff000000 | (Math.round(P[i][2]) << 16) | (Math.round(P[i][1]) << 8) | Math.round(P[i][0]);
    const m = e.map; for (let i = 0; i < m.length; i++) px[i] = pal[m[i]];
    g.putImageData(fujiIm, 0, 0);
  }
  c.drawImage(fujiCv, fujiCur.x + view.offX, fujiCur.y + view.offY);
}
