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
  // рівно ×2 до ширини картки (р. 78): кожен піксель однаковий, більше сцени навколо; поза сторінкою — старий розмір
  const c = getSpriteCanvas(capySprite()), cw = cv.clientWidth, W = cw > 60 ? Math.max(c.width + 6, Math.floor(cw / 2)) : Math.max(44, c.width + 18), H = 38;
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
    if (sp[0] === 'weather' || sp[0] === 'street' || sp[0] === 'shop') { skinPreviewCanvas(sp[0], sp[1], cv); return; }
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

/* ---------- Картка скіна магазину (р. 78): фасад 1-го рівня в рідних пікселях (полотно = розмір картки), жива вивіска й частинки скіна ---------- */
const shopCardCache = {};
function shopCardBase(name) {
  const tiers = state.depts.map(tierOf), key = (name || '') + '|' + (viewEpoch() % EPOCHS.length) + '|' + tiers.slice(0, 2).join('');
  if (!shopCardCache[key]) { const geo = buildShopCanvas(1, tiers); shopCardCache[key] = { c: geo.canvas, w: geo.w, h: geo.h, sign: geo.sign }; }
  return shopCardCache[key];
}
const SHOP_CARD_SKY = { candy: ['#ffc4dc', '#ffe4ef'], gold: ['#ffe39a', '#fff4cc'], diamond: ['#a8dcfa', '#dcf4ff'], wood: ['#a8d8ec', '#dcf0f6'], garden: ['#a8e4c4', '#e4f8d4'], xmas: ['#8cb4dc', '#d4e4f4'], halloween: ['#1c1238', '#3a2458'], ocean: ['#5fc0ec', '#bff0f8'], ice: ['#a8dcfa', '#e8f8ff'], spring: ['#ffc8dc', '#fff0f4'], autumn: ['#f4c88c', '#fde8c0'] };
const SHOP_CARD_FX = {
  candy(g, W, H, t) { for (let i = 0; i < 12; i++) cardRect(g, cardMod(i * 37 + Math.sin(t + i) * 3, W), cardMod(i * 19 + t * 13, H), 2, 1, ['#ff5f8f', '#52c4ff', '#ffd23f', '#7ad66a'][i % 4]); },
  gold(g, W, H, t) { for (let i = 0; i < 8; i++) if ((t * 0.8 + i * 0.27) % 1 < 0.4) cardSparkle(g, 6 + (i * 37) % (W - 12), 6 + (i * 23) % (H - 12), '#fff6c0'); },
  diamond(g, W, H, t) { for (let i = 0; i < 9; i++) if ((t * 0.9 + i * 0.31) % 1 < 0.42) cardSparkle(g, 5 + (i * 41) % (W - 10), 5 + (i * 19) % (H - 10), i % 3 ? '#ffffff' : '#8ff0ff'); },
  wood(g, W, H, t) { for (let i = 0; i < 4; i++) { const p = (t * 0.28 + i * 0.25) % 1; g.globalAlpha = 0.65 * (1 - p); cardRect(g, Math.round(W * 0.2 + Math.sin(p * 6 + i) * 3 + p * 6), Math.round(14 - p * 16), 3 + Math.round(p * 2), 2 + Math.round(p * 2), '#e8e4dc'); g.globalAlpha = 1; } },
  garden(g, W, H, t) { [[0.2, 0.32, '#ff8fbc'], [0.72, 0.5, '#ffd84f']].forEach(([fx, fy, c], i) => { const x = Math.round(W * fx + Math.sin(t * 0.7 + i * 2) * 12), y = Math.round(H * fy + Math.sin(t * 1.3 + i) * 5), fl = Math.floor(t * 8 + i) % 2; cardRect(g, x, y, 1, 2, '#3a2a1e'); cardRect(g, x - 2, y - fl, 2, 2 - fl, c); cardRect(g, x + 1, y - fl, 2, 2 - fl, c); }); for (let i = 0; i < 5; i++) cardRect(g, cardMod(i * 29 + t * 6, W), cardMod(i * 17 + t * 8, H), 1, 1, '#ffffff'); },
  xmas(g, W, H, t) { for (let i = 0; i < 18; i++) cardRect(g, cardMod(i * 23 + Math.sin(t * 1.2 + i) * 3, W), cardMod(i * 13 + t * (8 + (i % 3) * 3), H), 1 + (i % 4 === 0 ? 1 : 0), 1 + (i % 4 === 0 ? 1 : 0), '#ffffff'); },
  halloween(g, W, H, t) { [[0.25, 8], [0.68, 14]].forEach(([fx, y0], i) => { const x = Math.round(W * fx + Math.sin(t * 0.8 + i * 2.2) * 16), y = y0 + Math.round(Math.sin(t * 1.7 + i) * 3), fl = Math.floor(t * 8 + i) % 2; cardRect(g, x - 1, y, 3, 2, '#120c24'); cardRect(g, x - 4, y - fl, 3, 1, '#120c24'); cardRect(g, x + 2, y - fl, 3, 1, '#120c24'); cardRect(g, x - 1, y, 1, 1, '#ff9e3c'); cardRect(g, x + 1, y, 1, 1, '#ff9e3c'); }); },
  ocean(g, W, H, t) { for (let i = 0; i < 10; i++) { const y = H - cardMod(i * 17 + t * (7 + (i % 3) * 2), H + 4), x = cardMod(i * 31, W) + Math.round(Math.sin(t * 2 + i) * 2), r = i % 3 === 0; cardRect(g, x, y, r ? 2 : 1, r ? 2 : 1, '#d8f6ff'); if (r) cardRect(g, x, y, 1, 1, '#ffffff'); } },
  ice(g, W, H, t) { SHOP_CARD_FX.xmas(g, W, H, t); },
  spring(g, W, H, t) { for (let i = 0; i < 12; i++) cardRect(g, cardMod(i * 23 + Math.sin(t + i) * 5, W), cardMod(i * 17 + t * 9, H), 2, 1, i % 2 ? '#ff9fc0' : '#ffe4ef'); },
  autumn(g, W, H, t) { for (let i = 0; i < 11; i++) cardRect(g, cardMod(i * 23 + Math.sin(t * 1.3 + i) * 5, W), cardMod(i * 17 + t * 10, H), 2, 1, ['#e8701e', '#d23a2a', '#f2b84b'][i % 3]); }
};
function shopSkinPreview(cv, name, t) {
  const sz = cardPixels(cv), W = sz[0], H = sz[1], base = shopCardBase(name);
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const sky = SHOP_CARD_SKY[name] || null;
  if (sky) { cardRect(g, 0, 0, W, H, sky[1]); cardRect(g, 0, 0, W, Math.round(H * 0.22), sky[0]); for (let x = 0; x < W; x += 2) cardRect(g, x, Math.round(H * 0.22), 1, 1, sky[0]); }
  else { const c = currentEpoch().sky || ['s', 'S', 'w']; for (let y = 0; y < H; y++) R(g, 0, y, W, 1, c[Math.min(2, Math.floor(y * 3 / H))]); }
  const x0 = Math.round((W - base.w) / 2), y0 = Math.round((H - base.h) * 0.3);
  g.drawImage(base.c, x0, y0);
  if (SKIN_SIGN_ANIM[name]) {
    const s = base.sign, keep = sg; sg = g;
    try { g.save(); g.beginPath(); g.rect(x0 + s.x, y0 + s.y, s.w, s.h); g.clip(); SKIN_SIGN_ANIM[name](x0 + s.x, y0 + s.y, s.w, s.h, t); g.restore(); } finally { sg = keep; g.globalAlpha = 1; }
  }
  if (SHOP_CARD_FX[name]) SHOP_CARD_FX[name](g, W, H, t);
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
// Денні картки погоди: небо смугами з пунктирними стиками, далекі пагорби, трава; хмари й веселка в рідних пікселях, не затуляють маркет
const DAY_CARD = {
  '': ['#7ec8e6', '#a8dcf0', '#d4f0fa'], rainbow: ['#7ec8e6', '#a8dcf0', '#e4f6fc'], cottoncloud: ['#9ad4ee', '#ffd8e8', '#fff2f6'], goldcloud: ['#8ccce4', '#d4e8cc', '#fff0c0'],
  starcloud: ['#5a4aa8', '#8f78d0', '#dcc4f0'], diamondcloud: ['#9adcf6', '#c8eefa', '#f0fbff']
};
const dayBackCache = {};
function dayCardBack(name) {
  const key = DAY_CARD[name] ? name : '';
  if (dayBackCache[key]) return dayBackCache[key];
  const S = DAY_CARD[key], c = document.createElement('canvas'); c.width = 128; c.height = 80;
  const g = c.getContext('2d'), P = AR.P, band = [0, 22, 44, 80];
  for (let i = 0; i < 3; i++) P(g, 0, band[i], 128, band[i + 1] - band[i], S[i]);
  for (let i = 1; i < 3; i++) for (let x = 0; x < 128; x++) { if ((x + band[i]) % 2 === 0) P(g, x, band[i], 1, 1, S[i - 1]); if (x % 4 === 0) P(g, x, band[i] + 1, 1, 1, S[i - 1]); }
  const hill = key === 'starcloud' ? ['#6a5a9a', '#54467e'] : ['#a4d8a8', '#7fc08a'];
  for (let x = 0; x < 128; x++) { const h1 = Math.round(10 + Math.sin(x * 0.07 + 1) * 4 + Math.sin(x * 0.19) * 1.5), h2 = Math.round(6 + Math.sin(x * 0.11 + 3) * 3); P(g, x, 72 - h1, 1, h1, hill[0]); P(g, x, 72 - h2, 1, h2, hill[1]); }
  P(g, 0, 72, 128, 8, '#5aa85a'); P(g, 0, 72, 128, 1, '#8fd47a'); for (let i = 0; i < 26; i++) { const hs = hash2(i * 7 + 1, 11); P(g, hs % 126, 73 + (hs >>> 5) % 6, 2, 1, i % 3 ? '#4a9450' : '#7cc46c'); }
  return (dayBackCache[key] = c);
}
const CARD_STAR_SPEC = ['star', 'sp_blue', 'star2', 'sp_green', 'sp_gold', 'sp_orange', 'sp_red', 'star3'];
function dayCardDraw(g, name, T) {
  const P = AR.P;
  g.drawImage(dayCardBack(name), 0, 0);
  const tint = CLOUD_SKIN_TINT[name] || '', cl = (k, b, y, sp) => { const cv = cloudCanvas(k, tint), x = Math.round(((b + T * sp) % (128 + cv.width + 8)) - cv.width - 4); return { cv, x, y }; };
  if (name === 'rainbow') {                                                       // велика дуга навколо маркету, блискітки біжать по ній, біля основ хмарки
    const rb = weatherRainbow(), cx = 64, cy = 74, R0 = 56;
    g.drawImage(rb, cx - rb.width / 2, cy - (rb.height - 2));
    for (let k = 0; k < 7; k++) {
      const th = ((T * 0.16 + k / 7) % 1) * Math.PI, r = R0 - 3 - (k * 5) % 22, x = Math.round(cx - Math.cos(th) * r), y = Math.round(cy - Math.sin(th) * r);
      if (Math.sin(T * 4 + k * 2.3) > 0) cardSparkle(g, x, y, '#fff6c0');
    }
    g.drawImage(cloudCanvas(1, ''), -14, 50); g.drawImage(cloudCanvas(1, ''), 98, 50);
    weatherHouse(g, 'day');
    return;
  }
  weatherHouse(g, 'day');
  if (!tint) {                                                                    // звичайна погода: сонце, білі хмарки, пташки
    P(g, 16, 8, 9, 9, '#ffe27a'); P(g, 14, 10, 13, 5, '#ffe27a'); P(g, 18, 6, 5, 13, '#ffe27a'); P(g, 18, 9, 3, 2, '#fff6c0');
    [[1, 6, 4, 4], [2, 70, 14, 3]].forEach(([k, b, y, sp]) => { const c = cl(k, b, y, sp); g.drawImage(c.cv, c.x, c.y); });
    [[34, 16, 0], [46, 11, 1], [92, 20, 2]].forEach(([x, y, i]) => { const fl = Math.floor(T * 3 + i) % 2, xx = Math.round(x + T * 4) % 128; P(g, xx - 2, y - fl, 2, 1, '#3a4a5a'); P(g, xx + 1, y - fl, 2, 1, '#3a4a5a'); P(g, xx, y, 1, 1, '#3a4a5a'); });
    return;
  }
  const clouds2 = [cl(0, 6, -3, 5), cl(1, 62, 6, 5), cl(2, 104, 0, 5)];
  clouds2.forEach(c => {
    if (name === 'starcloud') {                                                   // колір пливе всім спектром, зорі мерехтять
      const u = (((T * 0.14 + c.x * 0.004) % 1) + 1) % 1 * CARD_STAR_SPEC.length, i0 = Math.floor(u) % CARD_STAR_SPEC.length, fr = u - Math.floor(u), k = [0, 1, 2][clouds2.indexOf(c)];
      g.drawImage(cloudCanvas(k, CARD_STAR_SPEC[i0]), c.x, c.y); g.globalAlpha = fr; g.drawImage(cloudCanvas(k, CARD_STAR_SPEC[(i0 + 1) % CARD_STAR_SPEC.length]), c.x, c.y); g.globalAlpha = 1;
      cloudCanvas(k, 'star').starPts.forEach(([px, py], i) => { if (Math.sin(T * 2.6 + i * 1.9) > 0.45) { P(g, c.x + px, c.y + py, 1, 1, '#ffffff'); if (i % 3 === 0) { P(g, c.x + px - 1, c.y + py, 3, 1, '#ffe9a0'); P(g, c.x + px, c.y + py - 1, 1, 3, '#ffe9a0'); P(g, c.x + px, c.y + py, 1, 1, '#ffffff'); } } });
    } else {
      g.drawImage(c.cv, c.x, c.y);
      if (name === 'goldcloud' || name === 'diamondcloud') c.cv.litPts.forEach(([px, py], i) => { if (i % 3) return; const v = Math.sin(T * 2.2 + i * 2.7 + c.x * 0.02); if (v > 0.72) cardSparkle(g, c.x + px, c.y + py, name === 'goldcloud' ? '#fff2b0' : ['#d8f6ff', '#ffd6f4', '#c8fff0'][i % 3]); });
    }
  });
  if (name === 'goldcloud') for (let i = 0; i < 5; i++) {                         // монетки падають і зникають на траві
    const p = (T * 0.34 + i * 0.2) % 1, x = Math.round(14 + (i * 27) % 104 + Math.sin(i * 3) * 2), y = Math.round(26 + p * p * 48), w = [3, 2, 1, 2][Math.floor(T * 9 + i) % 4];
    P(g, x - (w >> 1), y, w, 3, '#b5802a'); P(g, x - (w >> 1), y, w, 2, '#ffd23f'); if (w > 1) P(g, x - (w >> 1), y, 1, 1, '#fff6c0');
  } else if (name === 'starcloud') for (let i = 0; i < 14; i++) {                 // зоряний пил
    P(g, cardMod(i * 19 + Math.sin(T + i) * 3, 128), 24 + cardMod(i * 11 + T * 9, 48), 1, 1, ['#fff6c0', '#c9b8ff', '#9be8ff', '#ffc4ec'][i % 4]);
  } else if (name === 'diamondcloud') for (let i = 0; i < 16; i++) {              // діамантовий пил
    const y = 24 + cardMod(i * 13 + T * 11, 48), x = cardMod(i * 23 + Math.sin(T * 0.8 + i) * 3, 128); P(g, x, y, 1, 1, ['#ffffff', '#d8f6ff', '#9be8ff'][i % 3]); if (i % 5 === 0 && (Math.floor(T * 4) + i) % 2) { P(g, x - 1, y, 3, 1, '#ffffff'); P(g, x, y - 1, 1, 3, '#ffffff'); }
  } else if (name === 'cottoncloud') for (let i = 0; i < 7; i++) {                // цукрова вата: клаптики повільно летять униз
    const x = cardMod(i * 31 + Math.sin(T * 0.6 + i) * 6, 128), y = 26 + cardMod(i * 13 + T * 5, 44); P(g, x, y, 3, 2, '#ffd9e8'); P(g, x + 1, y - 1, 2, 1, '#fff1f6'); P(g, x, y + 1, 2, 1, '#f4b6d0');
  }
}
let weatherRainbowCv = null;
function weatherRainbow() { return weatherRainbowCv || (weatherRainbowCv = buildRainbow(56, 4, 3, false)); }
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
  g.setTransform(1, 0, 0, 1, -ox, -oy);
  dayCardDraw(g, name, T);
}
