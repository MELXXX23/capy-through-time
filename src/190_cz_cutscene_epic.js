//#part 190_cz_cutscene_epic.js
/* ====================== КАТ-СЦЕНА v3: КІНО, ТАПИ Й БУДІВНИЦТВО МАРКЕТУ ======================
   Уповільнення (cutRate), кінорамки, вступ-проліт камери з неба, два клікабельні моменти (тапнути монетку; CUT_CHG тапів — зарядити)
   і окрема анімація зведення маркету: удар світла → креслення → риштування → блоки летять з монетки-ядра знизу вгору →
   дах із вивіскою падає в уповільненні → риштування ховається → смуга світла, промені, іскри. Усе — функції сюжетного часу T. */
const CUT_CHG = 5;
CT.g1 = 5.95; CT.g2 = 13.85;                                          // де сцена чекає тапу гравця
// фази будівництва в сюжетних секундах від CT.asm0 (будівництво йде уповільнено, див. cutRate)
const CB = { bp0: 0.12, bp1: 0.75, sc0: 0.35, sc1: 0.75, t0: 0.55, fly: 0.42, t1: 2.35, orbUp: 2.42, roof0: 2.5, roof1: 2.78, scDown: 3.0, light: 3.22, rays: 3.0 };
const CUT_TXT2 = {
  uk: { tapCoin: 'ТАПНИ МОНЕТКУ!', charge: 'ТАПАЙ-ТАПАЙ!' }, en: { tapCoin: 'TAP THE COIN!', charge: 'TAP FAST!' },
  es: { tapCoin: '¡TOCA LA MONEDA!', charge: '¡TOCA RÁPIDO!' }, it: { tapCoin: 'TOCCA LA MONETA!', charge: 'TOCCA VELOCE!' },
  pl: { tapCoin: 'DOTKNIJ MONETY!', charge: 'STUKAJ SZYBKO!' }, pt: { tapCoin: 'TOCA NA MOEDA!', charge: 'TOCA RÁPIDO!' }
};
const cutT2 = k => (CUT_TXT2[state.lang] || CUT_TXT2.en)[k];
function cutRate(T) {                                                 // швидкість сюжетного часу: <1 — уповільнення
  const b = T - CT.asm0;
  if (T >= CT.pick - 0.05 && T < CT.pick + 0.85) return 0.5;          // монетка летить у рюкзак
  if (b >= CB.roof1 - 0.14 && b < CB.roof1 + 0.22) return 0.3;        // дах падає
  if (b >= -0.1 && b < 4.0) return 0.62;                              // будівництво
  return 1;
}
function cutBars(T, Tn) { return Tn < 0 ? 1 : cutKf(T, [[0.5, 1], [1.6, 0], [CT.g2 + 0.05, 0], [14.3, 1], [CT.sign1 - 0.2, 1], [CT.sign1 + 0.6, 0]]); }
function cutIntroCam(Tn, W, H) {                                      // вступ: камера дивиться в небо, потім відʼїжджає до вулиці
  const s = Tn + CUT_PRE, e = cutSm((s - 1.7) / (CUT_PRE - 1.7)), sky = [W * 0.5 + s * 2, (156 + cut.shift) * 0.34];
  return [cutLerp(2.3, 1, e), [cutLerp(sky[0], W / 2, e), cutLerp(sky[1], H / 2, e)]];
}
function cutIntroText(g, Tn, W, H, txt) {
  const s = Tn + CUT_PRE, nar = W < 300, lines = nar ? txt.introN : txt.intro, k = nar ? 2 : 3, cw = 8 * k / CUT_Q, a = 1 - cutSm((s - (CUT_PRE - 1.5)) / 0.8);
  if (a <= 0) return;
  const lh = nar ? 16 : 20, y0 = Math.round(H * 0.3 - (lines.length - 1) * lh / 2), gr = g.createLinearGradient(0, y0 - 40, 0, y0 + lines.length * lh + 30);
  gr.addColorStop(0, 'rgba(5,6,15,0)'); gr.addColorStop(0.5, 'rgba(5,6,15,' + 0.5 * a + ')'); gr.addColorStop(1, 'rgba(5,6,15,0)'); g.fillStyle = gr; g.fillRect(0, y0 - 40, W, lines.length * lh + 70);
  let left = Math.floor((s - 0.5) * 22); g.globalAlpha = a;
  lines.forEach((l, i) => { if (left > 0) { cutTextPx(g, l.slice(0, left), Math.round((W - l.length * cw) / 2), y0 + i * lh, k, '#fff6c8', '#6b3a10', 'left'); left -= l.length; } });
  g.globalAlpha = 1;
}
// Підготовка будівництва: блоки 4×4 (без верхньої смуги — дах падає цілим), контур креслення, синій «привид» магазину
function cutBuildPrep() {
  const src = cut.thumbs[0].c; if (cut.bt && cut.bt.src === src) return cut.bt;
  const w = cut.shopW, h = cut.shopH, TS = 4, d = src.getContext('2d').getImageData(0, 0, w, h).data;
  const al = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 40;
  const lum = (x, y) => { const i = (y * w + x) * 4; return d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; };
  const top = Math.max(TS, Math.round(h * 0.27 / TS) * TS), span = CB.t1 - CB.t0 - CB.fly, tiles = [];
  for (let ty = top; ty < h; ty += TS) for (let tx = 0; tx < w; tx += TS) {
    let n = 0; for (let y = ty; y < Math.min(h, ty + TS); y++) for (let x = tx; x < Math.min(w, tx + TS); x++) if (al(x, y)) n++;
    if (!n) continue;
    const r = 1 - (ty - top) / Math.max(1, h - TS - top);            // 0 — низ, 1 — верх: будується знизу вгору
    tiles.push({ x: tx, y: ty, w: Math.min(TS, w - tx), h: Math.min(TS, h - ty), land: CB.t0 + CB.fly + Math.min(1, r * 0.8 + cutHash(tx * 7.3 + ty * 1.7) * 0.2) * span,
      side: cutHash(tx * 3.1 + ty * 13) < 0.5 ? -1 : 1, arc: 10 + cutHash(tx + ty * 5) * 16 });
  }
  const gh = document.createElement('canvas'); gh.width = w; gh.height = h; const gg = gh.getContext('2d'), edge = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!al(x, y)) continue;
    if (!al(x - 1, y) || !al(x + 1, y) || !al(x, y - 1) || !al(x, y + 1)) { edge.push([x, y, Math.abs(Math.atan2(x - w / 2, y - h * 0.5)) / Math.PI]); continue; }
    const det = (al(x + 1, y) && Math.abs(lum(x, y) - lum(x + 1, y)) > 48) || (al(x, y + 1) && Math.abs(lum(x, y) - lum(x, y + 1)) > 48);
    gg.fillStyle = det ? 'rgba(150,230,255,.75)' : (x % 6 === 0 || y % 6 === 0) ? 'rgba(90,190,255,.3)' : 'rgba(40,120,220,.15)'; gg.fillRect(x, y, 1, 1);
  }
  const wh = document.createElement('canvas'); wh.width = w; wh.height = top; const wg = wh.getContext('2d');      // біла тінь даху для спалаху
  wg.drawImage(src, 0, 0); wg.globalCompositeOperation = 'source-in'; wg.fillStyle = '#fff6c8'; wg.fillRect(0, 0, w, top);
  return (cut.bt = { src, w, h, TS, top, tiles, gh, wh, edge, sw: null });
}
function cutPuff(g, seed, x0, y0, t, n, spd, col) {                    // хмарка пилу
  if (t < 0 || t > 1.3) return;
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (1.02 + cutHash(seed + i) * 0.96), v = spd * (0.4 + cutHash(seed + i * 3.7)), m = 1 - Math.exp(-t * 3.2);
    const x = x0 + Math.cos(a) * v * m, y = y0 + Math.sin(a) * v * 0.32 * m - t * 7, r = 1.5 + t * 6 * (0.5 + cutHash(i + seed * 2));
    g.globalAlpha = 0.5 * (1 - t / 1.3); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
  }
  g.globalAlpha = 1;
}
// Позаду магазину: промені, стовп світла, ударні хвилі, креслення, риштування
function cutBuildBack(g, T, L, sx0, sy0) {
  const b = T - CT.asm0, B = cutBuildPrep(), amb = cut.amb, cx = L.shopCX, sh = cut.shift;
  g.save(); g.globalCompositeOperation = 'lighter';
  const ra = cutSm((b - CB.rays) / 0.5) * (1 - cutSm((T - CT.sign1) / 0.8));
  if (ra > 0.01) {
    const ox = cx, oy = sy0 + B.h * 0.42;
    for (let i = 0; i < 16; i++) {
      const a = amb * 0.22 + i / 16 * 6.283, wd = 0.07 + 0.035 * Math.sin(i * 1.7), R2 = 280; if (Math.sin(a) > 0.12) continue;    // лише вгору й убоки
      g.fillStyle = 'rgba(255,214,130,' + (0.12 * ra) + ')'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(a - wd) * R2, oy + Math.sin(a - wd) * R2); g.lineTo(ox + Math.cos(a + wd) * R2, oy + Math.sin(a + wd) * R2); g.fill();
    }
    const gr = g.createRadialGradient(ox, oy, 4, ox, oy, 110); gr.addColorStop(0, 'rgba(255,236,170,' + 0.4 * ra + ')'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(ox - 110, oy - 110, 220, 220);
  }
  if (b > -0.4 && b < 1.0) {                                           // стовп світла з неба
    const u = (b + 0.4) / 1.4, wd = 30 * (1 - u) * cutSm((b + 0.4) / 0.25) + 1, top = -sh - 4, gr = g.createLinearGradient(cx - wd, 0, cx + wd, 0);
    gr.addColorStop(0, 'rgba(255,220,120,0)'); gr.addColorStop(0.5, 'rgba(255,250,220,' + (0.9 * (1 - u)) + ')'); gr.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gr; g.fillRect(cx - wd, top, wd * 2, 170 - top);
  }
  for (let k = 0; k < 2; k++) {                                        // ударні хвилі по землі
    const u = (b - k * 0.14) / 0.75; if (u <= 0 || u >= 1) continue; const rx = 8 + cutSm(u) * 200;
    g.strokeStyle = 'rgba(255,240,190,' + (0.85 * (1 - u)) + ')'; g.lineWidth = 2.5 * (1 - u) + 0.5; g.beginPath(); g.ellipse(cx, 170, rx, rx * 0.16, 0, 0, 6.283); g.stroke();
  }
  if (b >= 0 && b < 1.6) { const u = b / 1.6, gr = g.createRadialGradient(cx, 170, 2, cx, 170, 90); gr.addColorStop(0, 'rgba(255,220,140,' + 0.6 * (1 - u) + ')'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.save(); g.translate(cx, 170); g.scale(1, 0.3); g.fillStyle = gr; g.fillRect(-90, -90, 180, 180); g.restore(); }
  const bpEnd = 1 - cutSm((b - CB.light) / 0.5);                       // креслення: контур малюється з низу вгору, потім синій «привид»
  if (b > CB.bp0 && bpEnd > 0) {
    const p = cutSm((b - CB.bp0) / (CB.bp1 - CB.bp0)), ga = cutSm((b - CB.bp1 + 0.25) / 0.35) * bpEnd;
    if (ga > 0) { g.globalAlpha = ga; g.drawImage(B.gh, sx0, sy0); }
    g.globalAlpha = bpEnd;
    for (const e of B.edge) { if (e[2] > p) continue; g.fillStyle = p < 1 && p - e[2] < 0.03 ? '#ffffff' : 'rgba(120,220,255,.9)'; g.fillRect(sx0 + e[0], sy0 + e[1], 1, 1); }
    g.globalAlpha = 1;
    if (p < 1) for (const e of B.edge) if (Math.abs(e[2] - p) < 0.004) cutSpark(g, sx0 + e[0], sy0 + e[1], 1, '#dff6ff');
  }
  g.restore();
  if (b > CB.sc0 && b < CB.scDown + 0.45) {                            // риштування вистрибує з землі, потім ховається
    const u = Math.min(1, (b - CB.sc0) / (CB.sc1 - CB.sc0)), c1 = 1.70158, up = 1 + (c1 + 1) * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
    const dn = cutSm((b - CB.scDown) / 0.4), Hs = (B.h + 12) * up, base = 170 + dn * (B.h + 16), pl = [sx0 - 8, sx0 + B.w + 4];
    g.save(); g.beginPath(); g.rect(sx0 - 40, -400, B.w + 80, 570); g.clip();
    pl.forEach(px => { cutRc(g, px, base - Hs, 3, Hs, '#8a5a30'); cutRc(g, px, base - Hs, 1, Hs, '#b88450'); });
    for (let lv = 0; lv < 5; lv++) {
      const t = CB.t0 + CB.fly + lv * 0.34; if (b < t) break;
      const pop = Math.min(1, (b - t) / 0.12), y = base - 2 - lv * (B.h + 10) / 5, wd = (pl[1] - pl[0] + 7) * pop;
      cutRc(g, pl[0] - 2, y, wd, 2, '#a06a38'); cutRc(g, pl[0] - 2, y, wd, 0.5, '#d9a46a');
    }
    g.restore();
  }
}
// Сам магазин під час будівництва: покладені блоки й дах, що падає
function cutBuildShop(g, T, L, sx0, sy0) {
  const b = T - CT.asm0, B = cutBuildPrep(), src = B.src;
  for (const t of B.tiles) {
    if (b < t.land) continue;
    g.drawImage(src, t.x, t.y, t.w, t.h, sx0 + t.x, sy0 + t.y, t.w, t.h);
    const f = b - t.land; if (f < 0.14) { g.globalAlpha = (1 - f / 0.14) * 0.85; cutRc(g, sx0 + t.x, sy0 + t.y, t.w, t.h, '#fff6c8'); g.globalAlpha = 1; }
  }
  if (b >= CB.roof0) {
    const u = Math.min(1, (b - CB.roof0) / (CB.roof1 - CB.roof0)), v = b - CB.roof1, fall = (1 - u * u) * (sy0 + cut.shift + B.top + 30);
    const y = sy0 - fall + (v > 0 ? Math.sin(Math.min(1, v / 0.22) * Math.PI) * 2.5 * Math.max(0, 1 - v / 0.22) : 0);
    if (u < 1) for (let k = 3; k >= 1; k--) { g.globalAlpha = 0.22 / k; g.drawImage(src, 0, 0, B.w, B.top, sx0, y - k * 10, B.w, B.top); }      // слід руху
    g.globalAlpha = 1; g.drawImage(src, 0, 0, B.w, B.top, sx0, y, B.w, B.top);
    if (v >= 0 && v < 0.18) { g.globalAlpha = (1 - v / 0.18) * 0.9; g.drawImage(B.wh, sx0, y); g.globalAlpha = 1; }
  }
}
// Спереду: блоки в польоті, монетка-ядро, пил, уламки паркану, смуга світла, іскри
function cutBuildFront(g, T, L, sx0, sy0) {
  const b = T - CT.asm0, B = cutBuildPrep(), amb = cut.amb, cx = L.shopCX, src = B.src;
  let ox = cx, oy = sy0 - 26 + Math.sin(amb * 3) * 1.5;
  if (b > CB.orbUp) oy -= Math.pow((b - CB.orbUp) / 0.3, 2) * 260;
  if (b >= 0 && b < 1.4) for (let k = 0; k < 8; k++) {                 // паркан розлітається від удару
    const x0 = L.lotL + 6 + k * 22, dir = x0 < cx ? -1 : 1, vx = dir * (50 + cutHash(k * 9) * 70), vy = -(70 + cutHash(k * 5) * 70), x = x0 + vx * b, y = 134 + vy * b + 230 * b * b;
    if (y > 200) continue; g.save(); g.translate(x, y); g.rotate(dir * b * (6 + cutHash(k) * 6)); cutRc(g, -2, -14, 4, 28, '#8a5a30'); cutRc(g, -2, -14, 4, 2, '#b88450'); g.restore();
  }
  for (const t of B.tiles) {                                           // блоки летять дугами з монетки на свої місця
    const s = b - (t.land - CB.fly); if (s < 0 || s >= CB.fly) continue;
    const u = s / CB.fly, tx = sx0 + t.x, ty = sy0 + t.y, pos = q => { const e = 1 - Math.pow(1 - q, 3); return [cutLerp(ox, tx, e) + t.side * Math.sin(Math.PI * q) * t.arc, cutLerp(oy, ty, e) - Math.sin(Math.PI * q) * t.arc * 0.6]; };
    for (let k = 3; k >= 1; k--) { const p = pos(Math.max(0, u - k * 0.07)); g.globalAlpha = 0.5 / k; cutRc(g, p[0] + 1, p[1] + 1, 2, 2, '#ffd75a'); }
    const p = pos(u); g.globalAlpha = 1; g.drawImage(src, t.x, t.y, t.w, t.h, p[0], p[1], t.w, t.h); g.globalAlpha = 0.75 * (1 - u); cutRc(g, p[0], p[1], t.w, t.h, '#ffe36a'); g.globalAlpha = 1;
  }
  if (b > CB.t0 - 0.25 && b < CB.orbUp + 0.35) {                       // монетка-ядро: світиться, крутиться, меншає з кожним блоком
    let left = 0; for (const t of B.tiles) if (t.land - CB.fly > b) left++;
    const r = Math.max(1.5, (3 + 5 * left / B.tiles.length) * cutSm((b - CB.t0 + 0.25) / 0.3) + Math.sin(amb * 14) * 0.4);
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(ox, oy, 1, ox, oy, r * 5); gr.addColorStop(0, 'rgba(255,240,180,.9)'); gr.addColorStop(0.35, 'rgba(255,200,90,.35)'); gr.addColorStop(1, 'rgba(255,180,60,0)');
    g.fillStyle = gr; g.fillRect(ox - r * 5, oy - r * 5, r * 10, r * 10);
    if (b > CB.orbUp) { const lg = g.createLinearGradient(0, oy, 0, oy + 60); lg.addColorStop(0, 'rgba(255,240,180,.8)'); lg.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = lg; g.fillRect(ox - 2, oy, 4, 60); }
    g.restore();
    cutCoin(g, ox, oy, r, amb * 9, 0);
    for (let k = 0; k < 6; k++) { const a = amb * 4 + k / 6 * 6.283; cutSpark(g, ox + Math.cos(a) * (r + 7), oy + Math.sin(a) * (r + 7) * 0.5, 1, k % 2 ? '#fff6c8' : '#ffe36a'); }
  }
  const dc = cut.style === 'C' ? '#e8eef8' : '#cdb894';
  cutPuff(g, 11, cx, 168, b, 22, 95, dc);                              // пил від удару, від даху, від риштування
  cutPuff(g, 41, sx0, sy0 + B.top, b - CB.roof1, 9, 40, dc); cutPuff(g, 53, sx0 + B.w, sy0 + B.top, b - CB.roof1, 9, 40, dc); cutPuff(g, 67, cx, 169, b - CB.roof1, 14, 120, dc);
  cutPuff(g, 83, cx, 169, b - CB.scDown, 10, 75, dc);
  if (b > CB.light && b < CB.light + 0.55) {                           // смуга світла пробігає по новому магазину
    const u = (b - CB.light) / 0.55; if (!B.sw) { B.sw = document.createElement('canvas'); B.sw.width = B.w; B.sw.height = B.h; }
    const sg = B.sw.getContext('2d'); sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, B.w, B.h); sg.drawImage(src, 0, 0); sg.globalCompositeOperation = 'source-in';
    const bx = cutLerp(-B.w * 0.4, B.w * 1.4, u), gr = sg.createLinearGradient(bx - 16, -8, bx + 16, 8); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,240,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    sg.fillStyle = gr; sg.fillRect(0, 0, B.w, B.h); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.9; g.drawImage(B.sw, sx0, sy0); g.restore();
  }
  if (b > CB.light - 0.1 && T < CT.sign1 + 0.8) {                      // іскри піднімаються над магазином
    for (let i = 0; i < 18; i++) {
      const ph = ((b - CB.light) / 1.4 + cutHash(i * 4.1)) % 1, x = sx0 - 6 + cutHash(i * 2.3) * (B.w + 12) + Math.sin(amb * 2 + i) * 3, y = sy0 + B.h - ph * (B.h + 30);
      g.globalAlpha = Math.sin(ph * Math.PI) * (1 - cutSm((T - CT.sign1) / 0.8)); cutSpark(g, x, y, 1 + (i % 2), i % 3 ? '#fff6c8' : '#ffe36a');
    }
    g.globalAlpha = 1;
  }
}
// Екранний шар: кінорамки, підказки клікабельних моментів, хвилі від тапів
function cutDownArrow(g, ax, ay) {
  g.fillStyle = '#3a2a22'; g.fillRect(ax - 7, ay - 1, 15, 3); g.fillRect(ax - 5, ay + 2, 11, 3); g.fillRect(ax - 3, ay + 5, 7, 3); g.fillRect(ax - 1, ay + 8, 3, 3);
  g.fillStyle = '#ffe36a'; g.fillRect(ax - 6, ay - 1, 13, 2); g.fillRect(ax - 4, ay + 1, 9, 2); g.fillRect(ax - 2, ay + 3, 5, 2); g.fillRect(ax, ay + 5, 1, 2);
}
function cutFxScreen(g, T, Tn, w2s, W, H) {
  const amb = cut.amb, bar = Math.round(Math.min(H * 0.085, W * 0.1) * cutBars(T, Tn)), cp = cut.coinPos ? w2s(cut.coinPos[0], cut.coinPos[1]) : null; cut.coinScr = cp;
  if (bar > 0) { g.fillStyle = '#05060f'; g.fillRect(0, 0, W, bar); g.fillRect(0, H - bar, W, bar); }
  const hintTxt = s => cutTextPx(g, s, W / 2, Math.max(22, Math.round(H * 0.12)), W < 300 ? 2 : 3, '#fff6c8', '#3a2a22', 'center');
  if (cut.g1 < 0 && T >= CT.g1 - 0.01 && cp) {                        // 1) тапни монетку
    const R = 18 + Math.sin(amb * 6) * 1.5;
    g.strokeStyle = 'rgba(255,246,200,' + (0.6 + 0.4 * Math.sin(amb * 6)) + ')'; g.lineWidth = 1.5; g.beginPath(); g.arc(cp[0], cp[1], R, 0, 6.283); g.stroke();
    const rp = (amb % 0.9) / 0.9; g.strokeStyle = 'rgba(255,227,106,' + (1 - rp) + ')'; g.beginPath(); g.arc(cp[0], cp[1], R + rp * 16, 0, 6.283); g.stroke();
    cutDownArrow(g, Math.round(cp[0]), Math.round(cp[1] - R - 16 - Math.abs(Math.sin(amb * 5)) * 4)); hintTxt(cutT2('tapCoin'));
  }
  if (cut.g2 < 0 && T >= CT.g2 - 0.01 && cp) {                        // 2) тапай — зарядити монетку
    const n = cut.chg, pulse = cut.chgAmb >= 0 ? Math.max(0, 1 - (amb - cut.chgAmb) / 0.25) : 0, cr = (8 + n * 1.8) * (1 + pulse * 0.25), R = cr + 11 + n;
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(cp[0], cp[1], 2, cp[0], cp[1], R * 2.4); gr.addColorStop(0, 'rgba(255,230,140,' + (0.3 + 0.1 * n + 0.3 * pulse) + ')'); gr.addColorStop(1, 'rgba(255,200,90,0)');
    g.fillStyle = gr; g.fillRect(cp[0] - R * 2.4, cp[1] - R * 2.4, R * 4.8, R * 4.8); g.restore();
    cutCoin(g, cp[0], cp[1], cr, amb * (4 + n * 3), 0);
    for (let i = 0; i < CUT_CHG; i++) {
      const a0 = -Math.PI / 2 + i * 6.283 / CUT_CHG + 0.1, a1 = a0 + 6.283 / CUT_CHG - 0.2;
      g.lineWidth = 4; g.strokeStyle = '#3a2a22'; g.beginPath(); g.arc(cp[0], cp[1], R, a0, a1); g.stroke();
      g.lineWidth = 2.4; g.strokeStyle = i < n ? (i === n - 1 && pulse > 0 ? '#ffffff' : '#ffd23a') : 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(cp[0], cp[1], R, a0, a1); g.stroke();
    }
    for (let k = 0; k < n * 2; k++) { const a = amb * (3 + n) + k / (n * 2) * 6.283; cutSpark(g, cp[0] + Math.cos(a) * (R + 6), cp[1] + Math.sin(a) * (R + 6), 1, '#fff6c8'); }
    if (n === 0) cutDownArrow(g, Math.round(cp[0]), Math.round(cp[1] - R - 16 - Math.abs(Math.sin(amb * 5)) * 4));
    hintTxt(cutT2('charge'));
  }
  if (cut.taps) {
    cut.taps = cut.taps.filter(t => amb - t[2] < 0.45);
    cut.taps.forEach(t => {
      const d = (amb - t[2]) / 0.45; g.strokeStyle = 'rgba(255,246,200,' + (1 - d) + ')'; g.lineWidth = 2 * (1 - d) + 0.5; g.beginPath(); g.arc(t[0], t[1], 3 + d * 22, 0, 6.283); g.stroke();
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + 0.5; g.globalAlpha = 1 - d; cutSpark(g, t[0] + Math.cos(a) * (6 + d * 26), t[1] + Math.sin(a) * (6 + d * 26), 1, '#ffe36a'); }
      g.globalAlpha = 1;
    });
  }
}
// Тапи: спершу клікабельні моменти; повертає true, якщо тап «зʼїдено»
function cutGateTap(x, y) {
  (cut.taps || (cut.taps = [])).push([x, y, cut.amb]);
  if (cut.g1 < 0 && cut.T >= CT.g1 - 0.01) { cut.g1 = cut.amb; playSfx('cutClick'); return true; }
  if (cut.g2 < 0 && cut.T >= CT.g2 - 0.01) { cut.chg++; cut.chgAmb = cut.amb; playSfx('cutPop', cut.chg * 3); if (cut.chg >= CUT_CHG) cut.g2 = cut.amb; return true; }
  return false;
}
function cutKeyTap() {                                                 // пробіл / Enter на ПК = тап у потрібне місце
  const c = cut.coinScr || [cut.W / 2, cut.H / 2];
  if (cutGateTap(c[0], c[1])) return;
  if (cut.tapAmb < 0 && cut.T >= CT.TW - 0.01 && cut.rect) { const q = cut.rect; cut.tapAmb = cut.amb; cut.hit = [q[0] + q[2] / 2, q[1] + q[3] / 2]; }
  else if (cut.goAmb < 0 && cut.btn) cut.goAmb = cut.amb;
}
function cutFireBuild(T) {                                             // звуки будівництва
  const b = T - CT.asm0, f = (k, te, n, a) => { if (!cut.fired[k] && b >= te) { cut.fired[k] = 1; playSfx(n, a); } };
  for (let i = 0; i < 16; i++) f('bp' + i, CB.t0 + CB.fly + i * (CB.t1 - CB.t0 - CB.fly) / 15, 'cutPop', i);
  f('bUp', CB.orbUp, 'cutWhoosh'); f('bRf', CB.roof1, 'cutBoom'); f('bSc', CB.scDown + 0.1, 'cutThud'); f('bLt', CB.light, 'cutShine');
}
Object.assign(SFX, {
  cutPop(i) { const t = audio.ctx.currentTime + 0.01, fq = 330 * Math.pow(2, (i || 0) / 9); tone(audio.sfxGain, 'square', fq, t, 0.05, 0.07, fq * 1.5); tone(audio.sfxGain, 'triangle', fq * 2, t, 0.06, 0.08); },
  cutShine() { melody('sine', [['G6', 0.05], ['C7', 0.05], ['E7', 0.05], ['G7', 0.22]], 0.18); }
});
