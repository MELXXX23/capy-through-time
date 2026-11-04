//#part 265_icons_plus.js
/* Іконки плюс (р. 72): піксельні іконки продуктів у рамках, картки-зразки скінів звірят,
   частинки й анімація всіх скінів Капі, бруківка, що «лягає» на землю при виборі скіна. */

/* ---------- 1. Іконки продуктів: емодзі → чистий піксель-арт з контуром ---------- */
const pxIconCache = {};
function pxEmojiIcon(ch) {
  if (pxIconCache[ch]) return pxIconCache[ch];
  const big = document.createElement('canvas'); big.width = big.height = 48;
  const bg = big.getContext('2d');
  bg.textAlign = 'center'; bg.textBaseline = 'middle';
  bg.font = '40px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  bg.fillText(ch, 24, 26);
  const N = 16, small = document.createElement('canvas'); small.width = small.height = N;
  const sg = small.getContext('2d'); sg.imageSmoothingEnabled = true; sg.imageSmoothingQuality = 'high';
  sg.drawImage(big, 0, 0, 48, 48, 0, 0, N, N);
  const id = sg.getImageData(0, 0, N, N), d = id.data;
  for (let i = 0; i < d.length; i += 4) {                         // різкі краї + «палітра»: кольори збираємо в кілька рівнів, трохи насичуємо
    if (d[i + 3] < 120) { d[i + 3] = 0; continue; }
    d[i + 3] = 255;
    const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]), av = (d[i] + d[i + 1] + d[i + 2]) / 3;
    for (let k = 0; k < 3; k++) { let v = av + (d[i + k] - av) * 1.18; v = Math.round(v / 40) * 40; d[i + k] = Math.max(0, Math.min(255, v)); }
    if (mx - mn < 20) { const v = Math.round(av / 40) * 40; d[i] = d[i + 1] = d[i + 2] = v; }
  }
  sg.putImageData(id, 0, 0);
  const out = document.createElement('canvas'); out.width = out.height = N + 2;
  const og = out.getContext('2d'), solid = (x, y) => x >= 0 && y >= 0 && x < N && y < N && d[(y * N + x) * 4 + 3] > 0;
  og.fillStyle = '#4a3228';
  for (let y = -1; y <= N; y++) for (let x = -1; x <= N; x++) {
    if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) og.fillRect(x + 1, y + 1, 1, 1);
  }
  og.drawImage(small, 1, 1);
  return (pxIconCache[ch] = out);
}
// Рамка з іконкою: size — 'sm' (вимоги) або звичайна (картка відділу)
function iconBox(src, size) {
  const box = document.createElement('span'); box.className = 'ico-box' + (size ? ' ' + size : '');
  setIconBox(box, src); return box;
}
function setIconBox(box, src) {                                   // src — емодзі або готовий canvas
  const key = typeof src === 'string' ? src : '#c';
  if (typeof src === 'string' && box.dataset.ch === src) return;
  box.dataset.ch = key; box.textContent = '';
  const cv = document.createElement('canvas'), base = typeof src === 'string' ? pxEmojiIcon(src) : src;
  cv.width = base.width; cv.height = base.height; cv.getContext('2d').drawImage(base, 0, 0);
  cv.setAttribute('aria-hidden', 'true'); box.appendChild(cv);
}

/* ---------- 2. Картки-зразки: тло, підлога, світло ---------- */
function iconBackdrop(g, w, h, cols, floor) {                     // cols — 3 смуги неба зверху вниз; floor — [світла, темна] підлога
  const fh = Math.max(5, Math.round(h * 0.2)), sh = h - fh;
  cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, Math.round(sh * i / cols.length), w, Math.ceil(sh / cols.length) + 1); });
  g.fillStyle = floor[0]; g.fillRect(0, sh, w, fh); g.fillStyle = floor[1]; g.fillRect(0, sh, w, 1); g.fillRect(0, sh + fh - 2, w, 2);
}
function iconAvgColor(cv) {                                       // середній колір спрайта (без прозорих і майже чорних пікселів)
  try {
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let r = 0, gg = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] + d[i + 1] + d[i + 2] > 120) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
    return n ? [r / n, gg / n, b / n] : [200, 190, 170];
  } catch (e) { return [200, 190, 170]; }
}
function mixCol(c, t, to) { return 'rgb(' + c.map((v, i) => Math.round(v + (to - v) * t)).join(',') + ')'; }
function skinTwinkles(g, w, h, t, n) {
  for (let i = 0; i < n; i++) {
    const hs = hash2(i * 7 + 3, 11), x = 3 + hs % (w - 6), y = 2 + (hs >>> 8) % Math.max(4, h - 14);
    const ph = (t * 0.9 + i * 0.37) % 1; if (ph > 0.5) continue;
    const a = Math.sin(ph * 2 * Math.PI); g.globalAlpha = a; g.fillStyle = '#ffffff';
    g.fillRect(x, y, 1, 1); if (a > 0.6) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
  }
  g.globalAlpha = 1;
}
// heroSkinPreview — у 265_d_card_scenes.js (сцени скінів)

/* ---------- 3. Скіни Капі: частинки (у грі й у картці) ---------- */
// l — шари частинок: [форма, кольори, рух, вага]; rate — частинок за секунду
const CAPY_FX = {
  pirate:    { rate: 4, l: [['coin', ['#f2c230', '#fff0a0'], 'rise', 2], ['drop', ['#6ec6f0', '#ffffff'], 'burst', 2]] },
  astro:     { rate: 5, l: [['star', ['#ffffff', '#9fe4ff', '#ffe27a'], 'orbit', 3], ['dot', ['#ffffff', '#9fe4ff'], 'rise', 1]] },
  wizard:    { rate: 6, l: [['star', ['#c58bff', '#ff8fe0', '#8fe0ff'], 'rise', 3], ['spark', ['#fff0a0', '#ffffff'], 'orbit', 1]] },
  chef:      { rate: 4, l: [['puff', ['#ffffff', '#f0f0f0'], 'rise', 3], ['dot', ['#ffd890'], 'burst', 1]] },
  explorer:  { rate: 4, l: [['leaf', ['#5da84a', '#8fc85a', '#3f8a3a'], 'fall', 2], ['dot', ['#d9b27a', '#c49a62'], 'drift', 2]] },
  detective: { rate: 3, l: [['puff', ['#c8c8d0', '#a8a8b4'], 'rise', 3], ['spark', ['#ffffff', '#cfe8ff'], 'burst', 1]] },
  sailor:    { rate: 5, l: [['bubble', ['#9fdcff', '#ffffff'], 'rise', 3], ['drop', ['#6ec6f0'], 'burst', 1]] },
  santa:     { rate: 7, l: [['flake', ['#ffffff', '#dff0ff'], 'fall', 3], ['star', ['#ff6a6a', '#ffffff'], 'orbit', 1]] },
  witch:     { rate: 5, l: [['puff', ['#9a5fd0', '#5fd07a', '#c88cff'], 'rise', 3], ['star', ['#7dff8a', '#d7a8ff'], 'orbit', 1]] },
  flower:    { rate: 6, l: [['petal', ['#ffb3c6', '#ff8fb0', '#ffe0ea'], 'fall', 3], ['dot', ['#ffe45a'], 'drift', 1]] },
  beach:     { rate: 5, l: [['bubble', ['#9fdcff', '#ffffff'], 'rise', 2], ['spark', ['#ffe45a', '#fff6b0'], 'burst', 2]] },
  autumn:    { rate: 6, l: [['leaf', ['#e8863c', '#c4553d', '#f2b84b', '#a8703f'], 'fall', 1]] },
  mel:       { rate: 4, l: [['note', ['#7ad0ff', '#b8f0ff'], 'rise', 2], ['star', ['#ffffff', '#7ad0ff'], 'orbit', 1]] },
  nika:      { rate: 4, l: [['heart', ['#ff7fa8', '#ffb3c8'], 'rise', 2], ['star', ['#ffffff', '#ff9fc4'], 'orbit', 1]] },
  knight:    { rate: 4, l: [['spark', ['#ffffff', '#cfd8e8', '#9fb0c8'], 'burst', 3], ['dot', ['#cfd8e8'], 'rise', 1]] },
  hero:      { rate: 6, l: [['spark', ['#ffffff', '#ff5a5a', '#ffd84a'], 'burst', 3], ['star', ['#4aa8ff', '#ffd84a'], 'orbit', 1]] },
  cowboy:    { rate: 4, l: [['dot', ['#e0c08a', '#c49a62'], 'drift', 3], ['star', ['#ffd84a', '#ffffff'], 'orbit', 1]] },
  fairy:     { rate: 8, l: [['star', ['#ff9fe0', '#9fe8ff', '#d7b0ff', '#fff0a0'], 'fall', 3], ['spark', ['#ffffff'], 'orbit', 1]] },
  viking:    { rate: 5, l: [['ember', ['#ff9a3a', '#ffd84a'], 'rise', 2], ['flake', ['#ffffff'], 'fall', 1]] },
  pilot:     { rate: 5, l: [['line', ['#ffffff', '#dff0ff'], 'drift', 3], ['puff', ['#ffffff'], 'drift', 1]] },
  ep0:       { rate: 4, l: [['spark', ['#ffd84a', '#fff0a0'], 'rise', 2], ['star', ['#c8102e', '#ffd84a'], 'orbit', 1]] },
  ep1:       { rate: 4, l: [['note', ['#ff9fd0', '#7ad0ff'], 'rise', 2], ['dot', ['#ffd84a', '#ff7fa8'], 'burst', 2]] },
  ep2:       { rate: 6, l: [['star', ['#ff7fd0', '#7ad0ff', '#ffd84a', '#ffffff'], 'burst', 3], ['spark', ['#ffffff'], 'orbit', 1]] },
  ep3:       { rate: 5, l: [['bit', ['#4aff8a', '#ff4ad8', '#4ad8ff'], 'rise', 3], ['dot', ['#ffffff'], 'burst', 1]] },
  ep4:       { rate: 5, l: [['bit', ['#4aa8ff', '#9fe4ff', '#ffffff'], 'fall', 3], ['spark', ['#9fe4ff'], 'burst', 1]] },
  ep5:       { rate: 5, l: [['leaf', ['#5da84a', '#8fc85a', '#c8e870'], 'rise', 3], ['dot', ['#e8ff8a'], 'orbit', 1]] },
  ep6:       { rate: 5, l: [['star', ['#ffffff', '#b8c8ff', '#ffe27a'], 'orbit', 3], ['spark', ['#9fe4ff'], 'burst', 1]] },
  ep7:       { rate: 6, l: [['spark', ['#4affff', '#ff4ad8', '#ffffff'], 'burst', 3], ['line', ['#4affff', '#ff4ad8'], 'drift', 1]] }
};
const CAPY_BG = {                                                 // небо й підлога картки-зразка: [3 смуги неба, [підлога, межа]]
  astro: [['#0b1030', '#16204a', '#26326a'], ['#6a7088', '#454a60']], witch: [['#2a1a4a', '#4a2a6a', '#6a3a80'], ['#3a2a4a', '#241830']],
  santa: [['#a8c8e8', '#c8e0f4', '#e4f0fa'], ['#f4f9ff', '#a9c0dc']], viking: [['#8fb0c8', '#b0cade', '#d0e2ee'], ['#e8f0f6', '#a9c0dc']],
  ep3: [['#2a0f4a', '#3a1a6a', '#52288a'], ['#241040', '#10081f']], ep4: [['#1a2a5a', '#2a4a8a', '#4a74b8'], ['#2a3a5a', '#161e34']],
  ep6: [['#0b1030', '#16204a', '#26326a'], ['#8a8aa0', '#4c4c60']], ep7: [['#1a0f3a', '#2a1a5a', '#3f2a80'], ['#2a1a4a', '#120a28']],
  ep2: [['#4a1a6a', '#6a2a8a', '#8a3aa8'], ['#3a1a4a', '#20102a']], ep1: [['#f4b8d0', '#f8d0e0', '#fce4ee'], ['#d890b0', '#a85c80']],
  pirate: [['#8fd3ea', '#b8e3f5', '#dff3fa'], ['#d9b27a', '#a8803f']], beach: [['#8fd3ea', '#b8e3f5', '#dff3fa'], ['#ecd49a', '#c8a468']],
  sailor: [['#8fd3ea', '#b8e3f5', '#dff3fa'], ['#5aa8d8', '#2e78a8']]
};
const CAPY_SHAPES = {
  dot: (g, x, y, c, p) => { g.fillStyle = c; g.fillRect(x, y, p.big ? 2 : 1, p.big ? 2 : 1); },
  bit: (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 2, 2); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); },
  spark: (g, x, y, c) => { g.fillStyle = c; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); },
  star: (g, x, y, c, p) => { const tw = Math.floor(p.age * 8 + p.ph) % 2; g.fillStyle = c; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); if (tw) { g.fillRect(x - 2, y, 5, 1); g.fillRect(x, y - 2, 1, 5); } g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); },
  leaf: (g, x, y, c, p) => { const fl = Math.floor(p.age * 3 + p.ph) % 2, sx = x + Math.round(Math.sin(p.age * 3 + p.ph) * 2); g.fillStyle = c; if (fl) { g.fillRect(sx - 1, y, 3, 2); g.fillRect(sx, y - 1, 1, 1); } else { g.fillRect(sx, y - 1, 2, 3); } g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(sx, y, 1, 1); },
  petal: (g, x, y, c, p) => { const sx = x + Math.round(Math.sin(p.age * 3.4 + p.ph) * 2); g.fillStyle = c; g.fillRect(sx, y, 2, 2); g.fillStyle = '#ffffff'; g.fillRect(sx, y, 1, 1); },
  flake: (g, x, y, c, p) => { const sx = x + Math.round(Math.sin(p.age * 2.6 + p.ph) * 1.5); g.fillStyle = c; g.fillRect(sx - 1, y, 3, 1); g.fillRect(sx, y - 1, 1, 3); },
  heart: (g, x, y, c) => { g.fillStyle = c; g.fillRect(x - 2, y - 1, 2, 2); g.fillRect(x + 1, y - 1, 2, 2); g.fillRect(x - 2, y, 5, 1); g.fillRect(x - 1, y + 1, 3, 1); g.fillRect(x, y + 2, 1, 1); g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - 1, 1, 1); },
  note: (g, x, y, c) => { g.fillStyle = c; g.fillRect(x + 1, y - 3, 1, 5); g.fillRect(x - 1, y + 1, 3, 2); g.fillRect(x + 2, y - 3, 2, 1); },
  bubble: (g, x, y, c) => { g.fillStyle = c; g.fillRect(x - 1, y - 2, 3, 1); g.fillRect(x - 1, y + 2, 3, 1); g.fillRect(x - 2, y - 1, 1, 3); g.fillRect(x + 2, y - 1, 1, 3); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 1, 1); },
  puff: (g, x, y, c, p) => { const r = p.age < p.life * 0.5 ? 1 : 2; g.fillStyle = c; g.fillRect(x - r, y - r + 1, r * 2 + 1, r * 2 - 1); g.fillRect(x - r + 1, y - r, r * 2 - 1, r * 2 + 1); },
  coin: (g, x, y, c, p) => { const w = [3, 2, 1, 2][Math.floor(p.age * 7 + p.ph) % 4]; g.fillStyle = '#8a5a14'; g.fillRect(x - 1 - (w > 2), y - 2, w + 2, 5); g.fillStyle = c; g.fillRect(x - (w >> 1), y - 1, w, 3); g.fillStyle = '#ffffff'; g.fillRect(x - (w >> 1), y - 1, 1, 1); },
  drop: (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 2); },
  ember: (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 2); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); },
  line: (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 5, 1); g.globalAlpha *= 0.5; g.fillRect(x + 5, y, 3, 1); }
};
function capyFxPick(fx) {                                         // вибір шару за вагою
  let tot = 0; fx.l.forEach(l => tot += l[3]); let r = Math.random() * tot;
  for (const l of fx.l) { r -= l[3]; if (r <= 0) return l; }
  return fx.l[0];
}
let capyFxAcc = 0;
function capyAmbientFx(dt) {                                      // викликається з updateSkinDust: у кожного скіна Капі свої частинки
  const nm = skinOn('capy'), fx = CAPY_FX[nm], cp = LAYOUT.capy;
  if (!fx || !cp) return;
  capyFxAcc += dt * fx.rate * (ecoOn() ? 0.5 : 1);
  const cx = cp.x + 14, cap = ecoOn() ? 50 : 110;
  while (capyFxAcc >= 1) {
    capyFxAcc -= 1; if (skinDust.length >= cap) break;
    const l = capyFxPick(fx), mo = l[2], col = l[1][Math.floor(Math.random() * l[1].length)];
    let x = cx + rand(-20, 20), y = cp.footY - rand(4, 36), vx = rand(-2, 2), vy = rand(-9, -4), life = rand(1.1, 2);
    if (mo === 'fall') { y = cp.footY - rand(46, 58); vx = rand(-3, 3); vy = rand(6, 12); life = rand(1.2, 1.8); }
    else if (mo === 'orbit') { const a = rand(0, 6.28); x = cx + Math.cos(a) * 24; y = cp.footY - 20 + Math.sin(a) * 18; vx = -Math.sin(a) * 18; vy = Math.cos(a) * 14; life = rand(0.9, 1.4); }
    else if (mo === 'burst') { vx = rand(-14, 14); vy = rand(-14, -2); life = rand(0.6, 1); }
    else if (mo === 'drift') { vx = rand(-20, -9); vy = rand(-2, 2); life = rand(0.9, 1.5); x = cx + rand(-6, 24); }
    skinDust.push({ kind: 'cfx', shape: l[0], col, x, y, vx, vy, age: 0, life, c: 0, big: Math.random() < 0.25, ph: rand(0, 6.28) });
  }
}
// Той самий вигляд без симуляції: частинки картки-зразка рахуються з часу
function capyFxPreview(g, nm, w, h, t) {
  const fx = CAPY_FX[nm]; if (!fx) return;
  const N = 9, cx = w / 2, cy = h * 0.62;
  for (let i = 0; i < N; i++) {
    const l = fx.l[i % fx.l.length], mo = l[2], hs = hash2(i * 13 + 5, 7), life = mo === 'burst' ? 0.9 : 1.6;
    const k = ((t / life) + i * 0.173) % 1, rr = (hs % 1000) / 1000, a = Math.sin(k * Math.PI);
    let x, y;
    if (mo === 'rise') { x = cx + (rr - 0.5) * 30; y = h * 0.8 - k * h * 0.6; }
    else if (mo === 'fall') { x = cx + (rr - 0.5) * 34; y = 2 + k * h * 0.6; }
    else if (mo === 'orbit') { const ang = rr * 6.28 + t * 2.2; x = cx + Math.cos(ang) * 18; y = cy + Math.sin(ang) * 10 - 3; }
    else if (mo === 'burst') { const ang = rr * 6.28; x = cx + Math.cos(ang) * k * 20; y = cy - 4 + Math.sin(ang) * k * 14; }
    else { x = w - 4 - k * (w - 8); y = cy + (rr - 0.5) * 18; }
    g.globalAlpha = a;
    CAPY_SHAPES[l[0]](g, Math.round(x), Math.round(y), l[1][hs % l[1].length], { age: k * life, life, ph: rr * 6.28, big: hs % 4 === 0 });
  }
  g.globalAlpha = 1;
}
function capySkinPreview(cv, name, t) {                           // Капі в скіні «дихає» на тлі, навколо — частинки скіна
  const c = getSpriteCanvas(capySprite()), W = Math.max(44, c.width + 18), H = 38;
  if (cv.width !== W) { cv.width = W; cv.height = H; }
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
  const bg = CAPY_BG[name] || [['#8fd3ea', '#b8e3f5', '#dff3fa'], ['#8fcf7a', '#5aa85a']];
  iconBackdrop(g, W, H, bg[0], bg[1]);
  const scn = CAPY_SCENES[name]; if (scn) scn(g, W, H, t);                 // сценка скіна (265_e_capy_scenes.js)
  const breath = Math.sin(t * 2.2) > 0.4 ? 1 : 0, fy = H - 6;
  g.globalAlpha = 0.25; g.fillStyle = '#1a1208'; g.fillRect((W - c.width) / 2 + 3, fy + 1, c.width - 6, 2); g.globalAlpha = 1;
  g.drawImage(c, Math.round((W - c.width) / 2), fy - c.height + 2 - breath);
  if (name && !/^ep\d$/.test(name)) g.drawImage(capyOverlayCanvas('capy_' + name, Math.floor(t * 4.5) % SKIN_NF), Math.round((W - c.width) / 2), fy - c.height + 2 - breath);
  capyFxPreview(g, name, W, H, t);
}
// Усі живі картки-зразки скінів (Капі й герої) оновлюються кілька разів за секунду
setInterval(() => {
  if (typeof ui === 'undefined' || !ui.skinsList || !ui.skinsList.offsetParent || document.hidden || !animOn()) return;
  const t = performance.now() / 1000;
  ui.skinsList.querySelectorAll('canvas.skin-prev').forEach(cv => {
    const sp = cv._sp; if (!sp) return;
    if (sp[0] === 'weather' || sp[0] === 'street') { skinPreviewCanvas(sp[0], sp[1], cv); return; }
    if (sp[0] !== 'capy' && sp[0] !== 'hero') return;
    const save = skinPreview[sp[0]]; skinPreview[sp[0]] = sp[1];
    try { if (sp[0] === 'capy') capySkinPreview(cv, sp[1] || '', t); else heroSkinPreview(cv, t); } finally { if (save === undefined) delete skinPreview[sp[0]]; else skinPreview[sp[0]] = save; }
  });
}, 110);

/* ---------- 4. Бруківка «лягає» на землю при виборі скіна ---------- */
let cobbleLay = null;
function startCobbleLay(oldLayer) {
  if (!animOn() || !oldLayer || reduceMotionOn()) { cobbleLay = null; return; }
  cobbleLay = { old: oldLayer, t0: performance.now() };
}
function reduceMotionOn() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
const COBBLE_SW = 5, COBBLE_BANDS = 3, COBBLE_DUR = 0.9, COBBLE_SPREAD = 1.1;     // ширина смужки, кількість поясів по висоті, тривалість однієї клітинки, розкид затримок
function drawCobbleLay() {                                        // true — малюнок вулиці зроблено тут; стара бруківка плавно підіймається й тане, а нова проступає з-під неї; дорога внизу стоїть
  if (!cobbleLay) return false;
  const T = (performance.now() - cobbleLay.t0) / 1000;
  if (T > COBBLE_SPREAD + COBBLE_DUR + 0.1) { cobbleLay = null; return false; }
  const ox = -view.offX, oy = -view.offY, cw = groundLayer.width, ch = groundLayer.height, H = worldB();
  const top = Math.max(0, Math.round(LAYOUT.streetTop + 1 + view.offY)), bot = Math.min(ch, Math.round((view.extraB >= 30 ? H - 37 : H) + view.offY)), h = bot - top;
  ctx.drawImage(groundLayer, ox, oy);                               // нова вулиця (разом із бруківкою) вже лежить під старою
  const mid = (shop ? shop.x + shop.w / 2 : 0) + view.offX, bh = Math.ceil(h / COBBLE_BANDS), old = cobbleLay.old;
  for (let x = 0; x < cw; x += COBBLE_SW) {
    const w = Math.min(COBBLE_SW, cw - x), dist = Math.min(1, Math.abs(x + COBBLE_SW / 2 - mid) / Math.max(200, cw / 2));
    for (let b = 0; b < COBBLE_BANDS; b++) {
      const y = top + b * bh, hh = Math.min(bh, bot - y); if (hh <= 0) break;
      const delay = dist * COBBLE_SPREAD * 0.8 + (Math.sin(x * 0.045 + b * 1.3) * 0.5 + 0.5) * COBBLE_SPREAD * 0.2, k = Math.max(0, Math.min(1, (T - delay) / COBBLE_DUR));
      if (k >= 1) continue;                                          // ця клітинка вже стала новою
      const e = k * k * (3 - 2 * k), lift = Math.round(e * 3);       // стара трохи підіймається вгору й розчиняється
      ctx.globalAlpha = 1 - e;
      ctx.drawImage(old, x, y + lift, w, hh - lift, ox + x, oy + y, w, hh - lift);
    }
  }
  ctx.globalAlpha = 1;
  return true;
}

/* ---------- 5. Скіни погоди: рухомі картки (р. 72) ---------- */
// Картка погоди: полотно 128×80, логіка малюнка — у координатах 64×40 (масштаб ×2); маркет 1-го рівня (×0,4) малюється вже в повних пікселях (р. 73)
const weatherMarketCache = {};
function weatherMarket(kind) {                                          // маленький маркет, намальований у повних пікселях; уночі й у грозу темніший, а вікна світяться
  if (weatherMarketCache[kind]) return weatherMarketCache[kind];
  const W = 74, H = 40, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), P = AR.P, WALL = '#ecdcb2', WALL2 = '#cdb98a', TRIM = '#f8eed0', DK = '#6a4a30', W1 = '#f6bccb', W2 = '#bfe3c8';
  const glass = (x, y, w, h, col) => { P(g, x, y, w, h, DK); P(g, x + 1, y + 1, w - 2, h - 2, col); };
  // дах і вивіска
  for (let y = 8; y <= 13; y++) { const a = 9 - (y - 8), b = W - 9 + (y - 8); P(g, a, y, b - a, 1, y === 8 ? '#e08a5a' : y % 2 ? '#c9643a' : '#b4552f'); for (let k = a + 1 + (y % 2) * 2; k < b - 1; k += 4) P(g, k, y, 1, 1, '#8a3f24'); }
  P(g, 19, 0, 36, 9, '#3a2415'); P(g, 20, 1, 34, 7, '#5a3a20'); P(g, 20, 1, 34, 1, '#7a5230'); AR.txt(g, 23, 2, 'CAPYTAP', '#ffd870');
  // карниз, стіна, верхні вікна
  P(g, 1, 14, W - 2, 1, TRIM); P(g, 1, 15, W - 2, 1, '#a8946a'); P(g, 3, 16, W - 6, 10, WALL); P(g, 3, 16, 2, 22, WALL2); P(g, W - 5, 16, 2, 22, WALL2);
  const lit = [];
  for (let i = 0; i < 5; i++) {
    const x = 7 + i * 13; glass(x, 17, 9, 8, i % 2 ? W2 : W1); P(g, x, 17, 1, 1, WALL); P(g, x + 8, 17, 1, 1, WALL); P(g, x + 4, 18, 1, 6, DK); P(g, x + 2, 19, 1, 2, '#ffffff');
    P(g, x + 1, 25, 7, 1, '#7a4a2a'); P(g, x + 2, 24, 1, 1, '#e8353a'); P(g, x + 4, 24, 1, 1, '#ffd84f'); P(g, x + 6, 24, 1, 1, '#e8353a'); lit.push([x + 1, 18, 3, 6], [x + 5, 18, 3, 6]);
  }
  // навіс
  P(g, 2, 26, W - 4, 1, TRIM);
  for (let x = 2, i = 0; x < W - 2; x += 5, i++) { const cl = i % 2 ? '#fff4dc' : '#d9483b', w = Math.min(5, W - 2 - x); P(g, x, 27, w, 4, cl); P(g, x + 1, 31, Math.max(1, w - 2), 1, cl); }
  // низ: вітрини й двері
  P(g, 3, 31, W - 6, 6, WALL); for (let x = 2, i = 0; x < W - 2; x += 5, i++) { const cl = i % 2 ? '#fff4dc' : '#d9483b', w = Math.min(5, W - 2 - x); P(g, x + 1, 31, Math.max(1, w - 2), 1, cl); }
  P(g, 3, 32, W - 6, 1, WALL2);
  [[7, 21], [46, 21]].forEach(([x, w]) => { glass(x, 33, w, 5, '#ffe9ae'); P(g, x + 1, 35, w - 2, 1, '#d9a860'); for (let k = x + 2; k < x + w - 2; k += 3) P(g, k, 34, 1, 1, ['#e8353a', '#4f9a63', '#3a6fb0'][(k >> 1) % 3]); lit.push([x + 1, 34, w - 2, 3]); });
  P(g, 30, 32, 14, 6, DK); P(g, 31, 33, 5, 5, '#7fbce8'); P(g, 38, 33, 5, 5, '#7fbce8'); P(g, 32, 34, 1, 3, '#d8f0ff'); P(g, 39, 34, 1, 3, '#d8f0ff');
  P(g, 28, 34, 1, 2, '#ffd870'); P(g, 45, 34, 1, 2, '#ffd870');
  // цоколь
  P(g, 0, 38, W, 1, '#c8b48a'); P(g, 0, 39, W, 1, '#7a6648'); P(g, 28, 38, 18, 1, TRIM);
  if (kind !== 'day') {
    g.globalCompositeOperation = 'source-atop'; g.globalAlpha = kind === 'night' ? 0.62 : 0.4; g.fillStyle = kind === 'night' ? '#0c1636' : '#1a1030'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    lit.forEach(([x, y, w, h]) => P(g, x, y, w, h, '#ffe28a'));                    // вікна світяться
    AR.txt(g, 23, 2, 'CAPYTAP', '#ffd870');
  }
  return (weatherMarketCache[kind] = c);
}
function weatherHouse(g, kind) {
  const m = weatherMarket(kind), ox = g._ox || 0, oy = g._oy || 0; g.save(); g.setTransform(1, 0, 0, 1, -ox, -oy);
  g.drawImage(m, Math.round((128 - m.width) / 2), 76 - m.height); g.restore();
}
// Статичні тла карток гроз: небо смугами з пунктирними переходами, силует далекого міста, мокра бруківка
const STORM_CARD = {
  lightning: { sky: ['#1c1038', '#2a1650', '#3d2275', '#5a3a96'], hill: '#20123e', win: '#ffd870', road: ['#2c2440', '#463a60', '#7a6aa8'], rain: '#a58ae0', tint: 'storm_v', cols: [[5, '#7a2fd0', 0.75], [3, '#c9a0ff', 1], [1, '#ffffff', 1]] },
  lightninggreen: { sky: ['#0a2414', '#0f3a1e', '#1a5a30', '#2f8a4c'], hill: '#0c2c18', win: '#ffe28a', road: ['#1a2c22', '#2e4a38', '#5a8a6a'], rain: '#7fd8a0', tint: 'storm_g', cols: [[5, '#1d9a45', 0.75], [3, '#8ff0ac', 1], [1, '#ffffff', 1]] },
  lightningred: { sky: ['#240a10', '#3a0f16', '#5a1a24', '#8a2f3c'], hill: '#2c0c14', win: '#ffd870', road: ['#2c1a20', '#4a2e36', '#8a5a66'], rain: '#e88a96', tint: 'storm_r', cols: [[5, '#c4202e', 0.75], [3, '#ff9a9a', 1], [1, '#ffffff', 1]] }
};
const stormBackCache = {};
function stormBack(name) {
  if (stormBackCache[name]) return stormBackCache[name];
  const S = STORM_CARD[name], c = document.createElement('canvas'); c.width = 128; c.height = 80;
  const g = c.getContext('2d'), P = AR.P, band = [0, 16, 32, 48, 80];
  for (let i = 0; i < 4; i++) P(g, 0, band[i], 128, band[i + 1] - band[i], S.sky[i]);
  for (let i = 1; i < 4; i++) for (let x = 0; x < 128; x++) { if ((x + band[i]) % 2 === 0) P(g, x, band[i], 1, 1, S.sky[i - 1]); if (x % 4 === 0) P(g, x, band[i] + 1, 1, 1, S.sky[i - 1]); }
  // далеке місто
  [[0, 22], [10, 28], [20, 18], [84, 20], [96, 30], [108, 24], [118, 16]].forEach(([x, h], i) => { P(g, x, 72 - h, 12, h, S.hill); for (let k = 0; k < 3; k++) if ((i + k) % 2 === 0) P(g, x + 2 + k * 3, 72 - h + 3 + (k % 2) * 4, 2, 2, S.win); });
  // мокра дорога
  P(g, 0, 72, 128, 8, S.road[0]); P(g, 0, 72, 128, 1, S.road[2]); for (let i = 0; i < 12; i++) { const hs = hash2(i * 7 + 1, 3); P(g, hs % 124, 74 + (hs >>> 5) % 5, 3 + (hs >>> 9) % 6, 1, S.road[1]); }
  return (stormBackCache[name] = c);
}
function stormCardDraw(g, name, T) {
  const S = STORM_CARD[name], P = AR.P;
  g.drawImage(stormBack(name), 0, 0);
  const C = 1.7, cyc = Math.floor(T / C), p = animOn() ? T % C : 0.2, flash = p < 0.09 || (p > 0.15 && p < 0.26);
  if (flash) { g.globalAlpha = 0.28; P(g, 0, 0, 128, 72, S.cols[1][1]); g.globalAlpha = 1; }
  // дощ
  for (let i = 0; i < 26; i++) { const hs = hash2(i * 5 + 2, 9), x = ((hs % 136) - Math.floor(T * 30) % 136 + 136) % 136 - 4, y = (Math.floor(T * 74) + (hs >>> 5) % 80) % 80; if (y < 73) { P(g, x, y, 1, 2, S.rain); P(g, x - 1, y + 2, 1, 2, S.rain); } }
  weatherHouse(g, 'storm');
  // блискавка: з-під хмари вниз, кожного разу з іншого боку
  if (p < 0.62) {
    const I = p < 0.26 ? 1 : Math.max(0, 1 - (p - 0.26) / 0.36), v = cyc % 3;
    const paths = [
      [[[28, 12], [35, 23], [26, 32], [34, 43], [25, 54], [30, 70]], [[35, 23], [45, 29], [48, 39]], [[26, 32], [17, 38], [14, 49]]],
      [[[100, 10], [93, 21], [102, 30], [94, 42], [103, 52], [97, 70]], [[93, 21], [83, 27], [80, 37]], [[102, 30], [112, 37], [116, 47]]],
      [[[60, 12], [53, 22], [62, 30], [55, 36]], [[53, 22], [43, 26], [38, 36]], [[62, 30], [72, 34], [76, 42]]]
    ][v];
    paths.forEach((pp, i) => { const d = boltDense(pp); strokeBolt(g, d, d.length, i ? S.cols.slice(1).map(l => [Math.max(1, l[0] - 2), l[1], l[2]]) : S.cols, I, !i); });
    if (I > 0.4 && v < 2) { const e = paths[0][paths[0].length - 1]; for (let k = 0; k < 5; k++) { const a = T * 19 + k * 1.3, r = 2 + ((T * 30 + k * 3) % 6); P(g, Math.round(e[0] + Math.cos(a) * r), Math.round(e[1] - Math.abs(Math.sin(a)) * r), 1, 1, k % 2 ? '#ffffff' : S.cols[1][1]); } }
  }
  // хмари поверх початку блискавки; у спалах підсвічені
  [[0, 2, -2], [1, 52, 4], [2, 92, -3]].forEach(([k, b, y]) => { const cv = cloudCanvas(k, S.tint + (flash ? 'l' : '')), x = ((b + T * 7) % (128 + cv.width + 8)) - cv.width - 4; g.drawImage(cv, Math.round(x), y); });
}
function cardPixels(cv) {                                                 // розмір полотна = розмір картки в CSS-пікселях (не більше 128×80): картинка не зменшується, тож жоден рядок пікселів не випадає
  const now = performance.now();
  if (!cv._sz || now - cv._szT > 900) { const w = cv.clientWidth, h = cv.clientHeight; cv._sz = w > 60 && h > 40 ? [Math.min(128, w), Math.min(80, h)] : [128, 80]; cv._szT = now; }
  return cv._sz;
}
function weatherSkinPreview(cv, name, T) {
  const W = 64, H = 40, sz = cardPixels(cv), ox = Math.round((128 - sz[0]) / 2), oy = Math.round((80 - sz[1]) * 0.62); cv.width = sz[0]; cv.height = sz[1];
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g._ox = ox; g._oy = oy; g.setTransform(2, 0, 0, 2, -ox, -oy);
  const SPEED = 5, wrap = (x0, w) => ((x0 + T * SPEED) % (W + w + 12 + 0)) - w - 6 + 6;     // усі хмари пливуть вправо з однаковою швидкістю
  if (name === 'aurora') {                                       // ніч, зорі, три шторки сяйва з променями, гори, сніг і хатка зі світлим вікном
    const gr = g.createLinearGradient(0, 0, 0, 34); gr.addColorStop(0, '#060a20'); gr.addColorStop(0.6, '#10224a'); gr.addColorStop(1, '#1c3d5e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) { const hs = hash2(i * 9 + 1, 5), x = hs % W, y = (hs >>> 6) % 20; if (Math.sin(T * 2 + i * 1.9) > -0.4) { g.fillStyle = i % 3 ? '#ffffff' : '#bfe4ff'; g.fillRect(x, y, 1, 1); } }
    g.globalCompositeOperation = 'lighter';
    for (let c = 0; c < 3; c++) for (let x = 0; x < W; x++) {
      const yb = 18 + c * 3 + Math.sin(x * 0.12 + T * 0.45 + c * 2.1) * 4 + Math.sin(x * 0.31 - T * 0.8 + c) * 1.4;
      const n = Math.max(0, 0.55 + 0.45 * Math.sin(x * 0.9 + c * 3 + T * 1.3) * Math.sin(x * 0.23 - T * 0.4 + c)), hh = 11 + 12 * n;
      for (let k = 0; k < hh; k++) { g.globalAlpha = Math.pow(1 - k / hh, 1.5) * 0.6 * (0.4 + n * 0.8); g.fillStyle = AURORA_COLS[(c + (k > hh * 0.65 ? 1 : 0)) % 3]; g.fillRect(x, Math.round(yb - k), 1, 1); }
      g.globalAlpha = 0.5 * (0.5 + n * 0.5); g.fillStyle = AURORA_COLS[c % 3]; g.fillRect(x, Math.round(yb), 1, 1);       // яскравіша нижня кромка шторки
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#0b1a30'; g.beginPath(); g.moveTo(0, 34); [[0, 28], [8, 24], [15, 29], [24, 26], [34, 30], [46, 24], [56, 28], [64, 25], [64, 34]].forEach(p => g.lineTo(p[0], p[1])); g.fill();
    g.fillStyle = '#dff1ff'; g.fillRect(0, 34, W, 6); g.fillStyle = '#a9c8e6'; g.fillRect(0, 34, W, 1);
    g.globalAlpha = 0.16 + 0.06 * Math.sin(T * 0.9); g.fillStyle = '#2cf09a'; g.fillRect(0, 34, W, 6); g.globalAlpha = 1;      // відблиск сяйва на снігу
    [[8, 36, 6], [14, 37, 5], [52, 36, 6], [58, 37, 5]].forEach(([x, y, h]) => { g.fillStyle = '#10361f'; g.fillRect(x, y - h, 1, h); g.fillRect(x - 1, y - h + 2, 3, 1); g.fillRect(x - 2, y - h + 4, 5, 1); });
    weatherHouse(g, 'night');
    return;
  }
  if (BOLT_COLS[name]) {                                         // гроза: важкі хмари, косий дощ, місто вдалині; блискавка б'є з хмари й підсвічує її
    g.setTransform(1, 0, 0, 1, -ox, -oy);
    stormCardDraw(g, name, T);
    return;
  }
  for (let y = 0; y < H; y++) { g.fillStyle = y < 14 ? '#8fd3ea' : y < 28 ? '#b8e3f5' : '#dff3fa'; g.fillRect(0, y, W, 1); }
  R(g, 0, 34, W, 6, 'g'); R(g, 0, 34, W, 1, 'm');
  if (name === 'rainbow') {                                      // веселка розкривається зліва направо, тримається й тане; цикл 5,5 с
    const C = 6.5, p = T % C, r = Math.min(1, p / 2.6), e = r * r * (3 - 2 * r), a = p > 5.6 ? Math.max(0, 1 - (p - 5.6) / 0.9) : 1;
    const rb = buildRainbow(30, 3.4, 3, false);
    g.save(); g.beginPath(); g.rect(0, 0, Math.round(e * (W + 2)), H); g.clip(); g.globalAlpha = a; g.drawImage(rb, -1, 1); g.restore(); g.globalAlpha = 1;
    if (r < 1) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(e * (W + 2)) - 1, 14 + Math.round(Math.abs(Math.sin(e * 3.14)) * -2), 1, 1); }
    weatherHouse(g, 'day');
    [[3, 6], [34, 12]].forEach(([b, y]) => { const x = Math.round(wrap(b, 14)); R(g, x, y, 12, 4, 'w'); R(g, x + 3, y - 2, 8, 3, 'w'); });
    return;
  }
  weatherHouse(g, 'day');
  if (CLOUD_SKIN_TINT[name]) {
    const c0 = cloudCanvas(0, CLOUD_SKIN_TINT[name]), c1 = cloudCanvas(1, CLOUD_SKIN_TINT[name]);
    g.drawImage(c0, Math.round(wrap(2, c0.width)), 0); g.drawImage(c1, Math.round(wrap(34, c1.width)), 6);
  } else {
    [[6, 8], [40, 14]].forEach(([b, y]) => { const x = Math.round(wrap(b, 14)); R(g, x, y, 12, 4, 'w'); R(g, x + 3, y - 2, 8, 3, 'w'); });
  }
}
