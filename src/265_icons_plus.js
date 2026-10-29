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
function heroSkinPreview(cv, t) {                                 // троє героїв у вбранні скіна на кольоровому тлі, підстрибують по черзі
  const W = 46, H = 36;
  if (cv.width !== W) { cv.width = W; cv.height = H; }
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
  const ids = [TEAM[0].id, TEAM[2].id], spr = ids.map(id => getOutlinedCanvas(teamSprite(id)));
  const avg = iconAvgColor(spr[0]);
  iconBackdrop(g, W, H, [mixCol(avg, 0.62, 255), mixCol(avg, 0.74, 255), mixCol(avg, 0.84, 255)], [mixCol(avg, 0.3, 255), mixCol(avg, 0.45, 0)]);
  skinTwinkles(g, W, H, t, 5);
  spr.forEach((c, k) => {
    const x = 2 + k * 22, ph = (t * 1.6 + k * 0.33) % 1, hop = ph < 0.3 ? Math.round(Math.sin(ph / 0.3 * Math.PI) * 3) : 0, fy = H - 7;
    g.globalAlpha = 0.28; g.fillStyle = '#2a1a14'; g.fillRect(x + 3, fy + 2, 12 - hop, 2); g.globalAlpha = 1;
    g.drawImage(c, x, fy - c.height + 3 - hop);
  });
}

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
  const breath = Math.sin(t * 2.2) > 0.4 ? 1 : 0, fy = H - 6;
  g.globalAlpha = 0.25; g.fillStyle = '#1a1208'; g.fillRect((W - c.width) / 2 + 3, fy + 1, c.width - 6, 2); g.globalAlpha = 1;
  g.drawImage(c, Math.round((W - c.width) / 2), fy - c.height + 2 - breath);
  capyFxPreview(g, name, W, H, t);
}
// Усі живі картки-зразки скінів (Капі й герої) оновлюються кілька разів за секунду
setInterval(() => {
  if (typeof ui === 'undefined' || !ui.skinsList || !ui.skinsList.offsetParent || document.hidden || !animOn()) return;
  const t = performance.now() / 1000;
  ui.skinsList.querySelectorAll('canvas.skin-prev').forEach(cv => {
    const sp = cv._sp; if (!sp) return;
    if (sp[0] === 'weather') { skinPreviewCanvas('weather', sp[1], cv); return; }
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
function weatherMarket(kind) {                                          // зменшений до 0,4 маркет; ніч і гроза трохи затемнюють його
  const key = kind + '|' + state.lang;
  if (weatherMarketCache[key]) return weatherMarketCache[key];
  const geo = buildShopCanvas(1, state.depts.map(tierOf)), w = Math.round(geo.w * 0.4), h = Math.round(geo.h * 0.4);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(geo.canvas, 0, 0, w, h);
  if (kind !== 'day') { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = kind === 'night' ? 0.6 : 0.42; g.fillStyle = kind === 'night' ? '#0c1636' : '#1a1030'; g.fillRect(0, 0, w, h); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  return (weatherMarketCache[key] = c);
}
function weatherHouse(g, kind) {
  const m = weatherMarket(kind); g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(m, Math.round((128 - m.width) / 2), 74 - m.height); g.restore();
}
function weatherSkinPreview(cv, name, T) {
  const W = 64, H = 40; cv.width = 128; cv.height = 80;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(2, 0, 0, 2, 0, 0);
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
  if (BOLT_COLS[name]) {                                         // гроза: темне небо, хмари пливуть, раз на ~2,4 с — спалах і блискавка
    const bc = { lightning: ['#2a1650', '#3d2275', '#5a3a96', '#8a6ad0'], lightninggreen: ['#0f3a1e', '#1a5a30', '#2f8a4c', '#6acf8a'], lightningred: ['#3a0f16', '#5a1a24', '#8a2f3c', '#d06a7a'] }[name];
    g.fillStyle = bc[0]; g.fillRect(0, 0, W, H); g.fillStyle = bc[1]; g.fillRect(0, 0, W, 18);
    [[0, 3, 24], [32, 9, 20]].forEach(([b, y, w]) => { const x = Math.round(wrap(b, w)); g.fillStyle = bc[2]; g.fillRect(x, y, w, 5); g.fillRect(x + 4, y - 2, w - 9, 3); g.fillStyle = bc[1]; g.fillRect(x, y + 4, w, 1); });
    g.fillStyle = bc[3]; for (let i = 0; i < 14; i++) { const hs = hash2(i * 5 + 2, 9), x = ((hs % 70) - Math.floor(T * 14) % 70 + 70) % 70 - 3, y = (Math.floor(T * 30) + hs % 40) % 34; if (y > 12) g.fillRect(x, y, 1, 2); }       // косий дощ
    R(g, 0, 34, W, 6, 'G'); weatherHouse(g, 'storm');
    const C = 2.4, cyc = Math.floor(T / C), p = T % C;
    const on = p < 0.1 || (p > 0.17 && p < 0.34), fade = p > 0.34 ? Math.max(0, 1 - (p - 0.34) / 0.25) : 1;
    if (p < 0.06) { g.globalAlpha = 0.35; g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, 34); g.globalAlpha = 1; }
    if (on || (p > 0.34 && fade > 0)) {
      const PV = [[5, BOLT_COLS[name].main[1][1], 0.28], [3, BOLT_COLS[name].main[3][1], 0.75], [1, '#ffffff', 1]], st = pts => { const d = boltDense(pts); strokeBolt(g, d, d.length, PV, 1); };
      g.globalAlpha = on ? 1 : fade * 0.6;
      if (cyc % 2 === 0) { st([[18, 0], [22, 6], [17, 11], [23, 17], [19, 22], [22, 27]]); st([[22, 6], [28, 10], [31, 15]]); st([[17, 11], [11, 15], [9, 19]]); }
      else { st([[46, 0], [43, 5], [48, 10], [44, 16], [47, 21], [44, 27]]); st([[48, 10], [54, 14]]); st([[44, 16], [39, 19]]); }
      g.globalAlpha = 1;
    }
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
