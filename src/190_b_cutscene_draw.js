//#part 190_b_cutscene_draw.js
// Лице на спрайті ×4 (око ≈ (80,36), мордочка праворуч); координати в пікселях ×4
function cutFace(g, e) {
  const ex = 80, ey = 36, dk = '#2a1a14', R_ = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const ell = (cx, cy, rx, ry, c) => { g.fillStyle = c; for (let dy = -ry; dy <= ry; dy++) { const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5)))); g.fillRect(cx - half, cy + dy, half * 2 + 1, 1); } };
  if (e.blush) { g.globalAlpha = 0.55; ell(ex + 9, ey + 11, 6, 3, '#ff8fa8'); g.globalAlpha = 1; }
  switch (e.eye) {
    case 'wide': ell(ex, ey, 7, 8, dk); ell(ex, ey, 6, 7, '#ffffff'); ell(ex + 1, ey + 1, 3, 4, dk); R_(ex - 1, ey - 2, 2, 2, '#ffffff'); break;
    case 'happy': for (let dx = -6; dx <= 6; dx++) { const y = ey - Math.round(Math.sqrt(Math.max(0, 1 - (dx / 6.5) * (dx / 6.5))) * 5); R_(ex + dx, y + 1, 1, 3, dk); } break;
    case 'sparkle': ell(ex, ey, 5, 6, dk); R_(ex - 3, ey - 4, 3, 3, '#ffffff'); R_(ex + 1, ey + 1, 2, 2, '#ffffff'); R_(ex + 3, ey - 5, 1, 3, '#ffffff'); R_(ex + 2, ey - 4, 3, 1, '#ffffff'); break;
    case 'half': ell(ex, ey, 5, 6, dk); R_(ex - 6, ey - 7, 13, 7, '#b57a3e'); R_(ex - 6, ey - 1, 13, 2, dk); R_(ex - 2, ey + 1, 2, 2, '#ffffff'); break;
    case 'blink': R_(ex - 5, ey, 11, 3, dk); break;
    default: ell(ex, ey, 4, 5, dk); R_(ex - 2, ey - 3, 2, 3, '#ffffff'); R_(ex + 1, ey + 1, 1, 1, '#ffffff');
  }
  const brow = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) R_(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 3, 3, dk); };
  if (e.brow === 'up') brow(ex - 6, ey - 12, ex + 6, ey - 14); else if (e.brow === 'worry') brow(ex - 6, ey - 9, ex + 6, ey - 15); else if (e.brow === 'think') brow(ex - 6, ey - 11, ex + 6, ey - 9); else if (e.brow === 'cross') brow(ex - 6, ey - 15, ex + 6, ey - 9);
  const mx = 97, my = 49;
  if (e.mouth === 'smile') { for (let dx = -6; dx <= 6; dx++) R_(mx + dx, my + Math.round(3 * (1 - (dx / 6.5) * (dx / 6.5))), 1, 2, dk); }
  else if (e.mouth === 'big') { for (let dy = 0; dy <= 6; dy++) { const half = Math.round(7 * Math.sqrt(1 - (dy / 7) * (dy / 7))); R_(mx - half, my + dy, half * 2 + 1, 1, dk); } R_(mx - 3, my + 4, 7, 2, '#ff7a90'); }
  else if (e.mouth === 'o') { ell(mx, my + 3, 3, 4, dk); R_(mx - 1, my + 4, 3, 2, '#ff7a90'); }
  else if (e.mouth === 'frown') { for (let dx = -5; dx <= 5; dx++) R_(mx + dx, my + 3 - Math.round(2 * (1 - (dx / 5.5) * (dx / 5.5))), 1, 2, dk); }
  else R_(mx - 5, my + 2, 11, 2, dk);
}
// Значки над головою: ! ? серце іскри краплина
function cutMark(g, kind, x, y, T) {
  const b = Math.sin(T * 9) * 1.2;
  if (kind === '!') { cutPopText(g, '!', x, y + b, 4, '#ff5a5a', '#ffffff'); }
  else if (kind === '?') { cutPopText(g, '?', x, y + b, 4, '#ffe36a', '#7a3a10'); }
  else if (kind === 'heart') { const h = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']; h.forEach((r, j) => r.split('').forEach((c, i) => { if (c === 'X') { g.fillStyle = j < 1 ? '#ff9fb4' : '#ff4f78'; g.fillRect(x - 3.5 + i, y - 3 + j + b, 1, 1); } })); }
  else if (kind === 'spark') { for (let k = 0; k < 3; k++) { const ph = (T * 2 + k * 0.33) % 1; if (ph < 0.6) cutSpark(g, x + (k - 1) * 9, y + 4 - ph * 10, ph < 0.3 ? 1 : 2, '#fff7c0'); } }
}
function cutEmo(T, amb) {
  const TW = CT.TW, u = cut.tapAmb >= 0 ? T - TW : -1;
  let e;
  if (u >= 0) e = u < 1.4 ? { eye: 'happy', mouth: 'big', blush: 1, mark: 'heart' } : T < CT.fin ? { eye: 'sparkle', brow: 'up', mouth: 'smile', blush: 1 } : { eye: 'happy', mouth: 'big', blush: 1, mark: 'heart' };
  else if (T < CT.ting1) e = { eye: 'half', brow: 'think', mouth: 'frown' };
  else if (T < CT.ting2) e = { eye: 'wide', brow: 'up', mouth: 'o', mark: '!' };
  else if (T < CT.pick) e = { eye: 'wide', brow: 'up', mouth: 'o' };
  else if (T < 7.9) e = { eye: 'happy', mouth: 'big', blush: 1, mark: 'spark' };
  else if (T < 10.5) e = { eye: 'open', brow: 'up', mouth: 'smile' };
  else if (T < 11.4) e = { eye: 'open', brow: 'worry', mouth: 'o', mark: '?' };
  else if (T < 13.0) e = { eye: 'sparkle', brow: 'up', mouth: 'smile', blush: 1 };
  else if (T < CT.asm0) e = { eye: 'wide', brow: 'up', mouth: 'o', mark: 'spark' };
  else if (T < CT.asm1 + 0.4) e = { eye: 'wide', brow: 'up', mouth: 'big', blush: 1, mark: 'spark' };
  else if (T < 21.6) e = { eye: 'happy', mouth: 'big', blush: 1, mark: 'heart' };
  else if (T < 22.5) e = { eye: 'open', brow: 'worry', mouth: 'o', mark: '?' };
  else e = { eye: 'sparkle', brow: 'up', mouth: 'smile', blush: 1 };
  if ((e.eye === 'open' || e.eye === 'half' || e.eye === 'sparkle') && (amb * 10) % 31 < 1.1) e = Object.assign({}, e, { eye: 'blink' });
  return e;
}
// Текст: шрифт 8 px малюється у проміжне полотно й масштабується без згладжування (k — пікселів полотна на піксель шрифту)
function cutTextPx(g, str, x, y, k, fill, edge, align, alpha) {
  if (!str) return; k = Math.max(1, Math.round(k));
  const key = str + '|' + fill + '|' + (edge || ''), cache = cutCache('txtmap', () => new Map());
  let c = cache.get(key);
  if (!c) {
    const w = str.length * 8, pad = edge ? 1 : 0, base = document.createElement('canvas'); base.width = w + 2; base.height = 10;
    const bg = base.getContext('2d'); bg.font = '8px "Press Start 2P", monospace'; bg.textBaseline = 'top'; bg.fillStyle = '#000'; bg.fillText(str, 1, 1);
    const id = bg.getImageData(0, 0, w + 2, 10), d = id.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;       // чіткі пікселі
    bg.putImageData(id, 0, 0);
    c = document.createElement('canvas'); c.width = w + 2 + pad * 2; c.height = 10 + pad * 2; const cg = c.getContext('2d');
    const tinted = col => { const t = document.createElement('canvas'); t.width = w + 2; t.height = 10; const tg = t.getContext('2d'); tg.drawImage(base, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = col; tg.fillRect(0, 0, w + 2, 10); return t; };
    if (edge) { const e = tinted(edge); [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]].forEach(([dx, dy]) => cg.drawImage(e, pad + dx, pad + dy)); }
    cg.drawImage(tinted(fill), pad, pad);
    if (cache.size > 400) cache.clear(); cache.set(key, c);
  }
  const dw = c.width * k / CUT_Q, dh = c.height * k / CUT_Q, ox = align === 'center' ? -dw / 2 : align === 'right' ? -dw : 0;
  g.save(); g.imageSmoothingEnabled = false; if (alpha !== undefined) g.globalAlpha = alpha; g.drawImage(c, Math.round((x + ox) * CUT_Q) / CUT_Q, Math.round((y - dh / 2) * CUT_Q) / CUT_Q, dw, dh); g.restore();
}
function cutPopText(g, str, x, y, k, fill, edge, age) { const a = age === undefined ? 1 : age, s = a < 0.12 ? a / 0.12 * 1.3 : a < 0.26 ? 1.3 - (a - 0.12) / 0.14 * 0.3 : 1; cutTextPx(g, str, x, y, Math.max(0.5, k * s), fill, edge, 'center'); }
function cutSpark(g, x, y, s, col) { g.fillStyle = col || '#fff'; g.fillRect(Math.round(x - s), Math.round(y), s * 2 + 1, 1); g.fillRect(Math.round(x), Math.round(y - s), 1, s * 2 + 1); g.fillRect(Math.round(x - 1), Math.round(y - 1), 3, 3); }
function cutBubble(g, text, sx, sy, who, prog, W) {
  const k = 2, cw = 8 * k / CUT_Q, maxChars = Math.max(10, Math.floor((Math.min(W - 24, W >= 300 ? 214 : 160)) / cw)), words = text.split(' '), lines = []; let cur = '';
  words.forEach(w => { const t2 = cur ? cur + ' ' + w : w; if (t2.length > maxChars && cur) { lines.push(cur); cur = w; } else cur = t2; });
  if (cur) lines.push(cur);
  const wmax = Math.max(...lines.map(l => l.length)) * cw, lh = 8 * k / CUT_Q * 1.4, bw = Math.ceil(wmax) + 9, bh = Math.ceil(lines.length * lh + 5);
  const bx = Math.round(Math.max(4, Math.min(W - 4 - bw, sx - bw / 2))), by = Math.round(sy - bh - 8);
  const edge = { c: state.settings.gender === 'm' ? '#3f6fc4' : '#c04f7a', b: '#8a5a2a', m: '#d9822b', n: '#9b7fd0' }[who] || '#8a5a2a', fill = who === 'b' ? '#fff6dc' : '#fff3f8';
  g.fillStyle = edge; g.fillRect(bx, by - 1, bw, bh + 2); g.fillRect(bx - 1, by, bw + 2, bh); g.fillStyle = fill; g.fillRect(bx, by, bw, bh);
  const tx = Math.round(Math.max(bx + 4, Math.min(bx + bw - 5, sx)));
  g.fillStyle = edge; g.fillRect(tx - 3, by + bh, 7, 1); g.fillRect(tx - 2, by + bh + 1, 5, 1); g.fillRect(tx - 1, by + bh + 2, 3, 1); g.fillRect(tx, by + bh + 3, 1, 1);
  g.fillStyle = fill; g.fillRect(tx - 2, by + bh, 5, 1); g.fillRect(tx - 1, by + bh + 1, 3, 1); g.fillRect(tx, by + bh + 2, 1, 1);
  let left = Math.floor(prog);
  lines.forEach((l, i) => { if (left > 0) { cutTextPx(g, l.slice(0, left), bx + 4.5, by + 2.5 + lh * (i + 0.5), k, '#3a2a22', null, 'left'); left -= l.length + 1; } });
}
function cutSayState(T, txt) {
  for (const s of CUT_SAY) if (T >= s[0] && T < s[1]) return { who: s[2], text: txt[s[3]], prog: (T - s[0]) * 26, end: s[1] };
  if (cut.tapAmb >= 0) {
    const u = T - CT.u0; if (u >= 0 && u < 3) return { who: 'b', text: txt.b6, prog: u * 26, end: CT.u0 + 3 }; if (u >= 3 && u < 5.4) return { who: 'b', text: txt.b7, prog: (u - 3) * 26, end: CT.u0 + 5.4 };
    const f = T - CT.fin; if (f >= 2.2 && f < 3.4) return { who: 'm', text: txt.m1, prog: (f - 2.2) * 26, end: CT.fin + 3.4 }; if (f >= 3.4 && f < 5.3) return { who: 'n', text: txt.n1, prog: (f - 3.4) * 26, end: CT.fin + 5.3 }; if (f >= 5.3) return { who: 'm', text: txt.m2, prog: (f - 5.3) * 26, end: CT.fin + 7.2 };
  }
  return null;
}
// розкладка залежить від ширини екрана: на вузькому телефоні актори стоять ближче
function cutFinale(T, L, w2s) {
  const fT = T - CT.fin; if (fT <= 0) return null; const W = cut.W, H = cut.H, melC = cutPx('foxcub_0', SPRITES.capy_mel.canvas), nikC = cutPx('bunny_0', SPRITES.capy_nika.canvas), h0 = melC.height / CUT_Q, w0 = melC.width / CUT_Q;
  const wk = cutSm((fT - 0.5) / 2.2), ph = mobileMQ.matches || landscapePhoneMQ.matches, scF = Math.min(ph ? 2.0 : 2.6, H * (ph ? 0.3 : 0.4) / h0, W * (ph ? 0.33 : 0.42) / w0), pk = 4 * (cut.K || 1), scI = Math.max(1, Math.floor(scF * pk)) / pk, sc = wk >= 1 ? scI : cutLerp(0.5, scI, wk), door = w2s(L.shopCX, 158);
  const fx = cutLerp(door[0], W / 2, wk), foot = cutLerp(door[1], H - (W < 300 ? 76 : 66), wk), gx = w0 * sc * 0.52;      // у кінці кроку пікселі героїв — ціла кількість пікселів полотна (scI), тож усі однакові
  const q = CUT_Q * (cut.K || 1), rq = v => Math.round(v * q) / q;
  return { fT, wk, sc, melC, nikC, mx: rq(fx - gx), nx: rq(fx + gx), foot: rq(foot), h: h0 * sc, fx };
}
function cutLay() {
  const nar = cut.W < 300, L = { nar, shopCX: 385, lotL: 305, lotR: 465 };
  L.capyStop = nar ? 265 : 205; L.coinX = L.capyStop + 28; L.bodyStop = L.capyStop + (nar ? 58 : 72); L.bodyStart = 560;
  L.flankC = L.shopCX - 78; L.flankB = L.shopCX + 78; L.capyStart = L.capyStop - CT.walk * 34;
  return L;
}
function cutCapyX(T, L) { if (T < CT.walk) return L.capyStart + T * 34; if (T < CT.flank0) return L.capyStop; return cutLerp(L.capyStop, L.flankC, cutSm((T - CT.flank0) / (CT.flank1 - CT.flank0))); }
function cutBodyX(T, L) {
  if (T < CT.bIn0) return L.bodyStart; if (T < CT.bIn1) return cutLerp(L.bodyStart, L.bodyStop, cutSm((T - CT.bIn0) / (CT.bIn1 - CT.bIn0)));
  if (T < CT.asm0 - 0.4) return L.bodyStop; if (T < CT.asm0 + 0.6) return cutLerp(L.bodyStop, L.shopCX - 100, cutSm((T - CT.asm0 + 0.4) / 1.0));
  if (T < CT.sign1 + 0.3) return L.shopCX - 100; return cutLerp(L.shopCX - 100, L.flankB, cutSm((T - CT.sign1 - 0.3) / 1.4));
}
function cutCamCx(T, L) {
  const W = cut.W;
  if (T < CT.walk) return cutCapyX(T, L) + W * 0.14;
  return cutKf(T, [[CT.walk, L.capyStop + W * 0.14], [6.6, L.capyStop + W * 0.14], [8.0, (L.capyStop + L.bodyStop) / 2], [12.2, (L.capyStop + L.bodyStop) / 2], [13.2, L.shopCX]]);
}
function cutZoom(T) { return cutKf(T, [[5.35, 1], [5.9, 2.4], [6.3, 2.4], [6.9, 1], [12.95, 1], [13.9, 2.1], [14.6, 2.1], [14.62, 1], [CT.asm0 + 0.9, 1], [CT.asm0 + CB.roof0, 1.22], [CT.asm0 + CB.roof1 + 0.05, 1.3], [CT.asm0 + CB.light, 1.08], [CT.sign0, 1], [CT.sign0 + 0.7, 2.5], [CT.sign1 - 0.5, 2.5], [CT.sign1 + 0.3, 1]]); }
function cutPrep() {
  if (cut.shopPx) return;
  const oe = state.epoch; let geo = [];
  state.epoch = 0;
  try { [1, 3, 5].forEach(lv => geo.push(buildShopCanvas(lv, state.depts.map(tierOf)))); } finally { state.epoch = oe; }
  try { if (typeof shop !== 'undefined' && shop) rebuildShop(true); } catch (e) { /* не страшно */ }
  cut.thumbs = geo.map(o => ({ c: o.canvas, w: o.w, h: o.h })); cut.door = geo[0].door || null;
  const g0 = geo[0], d = g0.canvas.getContext('2d').getImageData(0, 0, g0.w, g0.h).data, px = [];
  for (let y = 0; y < g0.h; y++) for (let x = 0; x < g0.w; x++) { const i = (y * g0.w + x) * 4; if (d[i + 3] > 200) px.push({ x, y, c: 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')', o: (1 - y / g0.h) * 0.8 + cutHash(x * 13 + y * 7) * 0.2, a: cutHash(x * 3 + y * 17 + 1) * 6.283, r: cutHash(x * 5 + y * 11 + 2), w: cutHash(x + y * 31) * 6 }); }
  px.sort((p, q) => p.o - q.o); px.forEach((p, i) => { p.o = i / px.length; });
  cut.shopPx = px; cut.shopW = g0.w; cut.shopH = g0.h;
}
function cutSky(W, H, shift) {
  const key = 'sky' + cut.style + W + 'x' + H + 's' + shift; if (cut.cache[key]) return cut.cache[key];
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), st = CUT_STYLES[cut.style];
  const hexc = v => v.length === 1 ? PALETTE[v] : v, hx = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const A = hx(hexc(st.sky[0])), B = hx(hexc(st.sky[1])), C = hx(hexc(st.sky[2])), mix = (p, q, t) => p.map((v, i) => Math.round(v + (q[i] - v) * t));
  const col = u => { const lvl = Math.floor(u * 5) / 5; return u < 1 ? mix(A, B, lvl) : mix(B, C, Math.floor((u - 1) * 5) / 5); };
  const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], hor = 156 + shift;
  for (let y = 0; y < hor; y++) {
    const f = y / hor, u = f < 0.45 ? f / 0.45 : 1 + Math.pow((f - 0.45) / 0.55, 0.9), step = 1 / 5, fr = ((u < 1 ? u : u - 1) / step) % 1, c0 = col(u), c1b = col(Math.min(2, u + step));
    for (let x = 0; x < W; x++) { const th = bayer[y & 3][x & 3] / 16, cc = fr > th ? c1b : c0; g.fillStyle = 'rgb(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ')'; g.fillRect(x, y, 1, 1); }
  }
  g.fillStyle = 'rgb(' + C.join(',') + ')'; g.fillRect(0, hor, W, H - hor);
  for (let k = 0; k < 14; k++) { g.globalAlpha = 0.012 * (14 - k) * 2; g.fillStyle = '#ffffff'; g.fillRect(0, hor - 28 + k * 2, W, 2); }          // тепле сяйво біля обрію
  g.globalAlpha = 1; return (cut.cache[key] = c);
}
function cutCoin(g, cx, cy, r, ang, glow) {
  const f = Math.max(0.16, Math.abs(Math.cos(ang))), rx = Math.max(1, r * f), ry = r;
  if (glow) { const gr = g.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * (2.2 + glow)); gr.addColorStop(0, 'rgba(255,230,120,' + (0.55 * Math.min(1, glow + 0.2)) + ')'); gr.addColorStop(1, 'rgba(255,230,120,0)'); g.fillStyle = gr; g.fillRect(cx - r * 4, cy - r * 4, r * 8, r * 8); }
  const S = 1 / CUT_Q, ell = (k, col) => { g.fillStyle = col; const n = Math.round(ry * k * CUT_Q); for (let i = -n; i <= n; i++) { const dy = i / CUT_Q, half = rx * k * Math.sqrt(Math.max(0, 1 - (i * i) / Math.max(1, n * n))); g.fillRect(Math.round((cx - half) * CUT_Q) / CUT_Q, cy + dy, Math.round(half * 2 * CUT_Q + 1) / CUT_Q, S); } };
  ell(1, '#9a5e12'); ell(0.94, '#c98a1c'); ell(0.88, '#e8a92a'); ell(0.8, '#f8cf4a'); ell(0.66, '#e8a92a'); ell(0.6, '#f8d85c');
  // проста монетка: без хреста й значка всередині (за проханням гравчині), лише ободок, диск і відблиск
  g.fillStyle = '#fff7c0'; for (let i = Math.round(-ry * 0.78 * CUT_Q); i < Math.round(-ry * 0.2 * CUT_Q); i++) g.fillRect(cx - rx * 0.62 + (i + ry * 0.78 * CUT_Q) * 0.25 / CUT_Q, cy + i / CUT_Q, Math.max(0.5, r * 0.07), S);
}
function cutDrawChar(g, cv, x, foot, flip, opts) {
  opts = opts || {}; const w = cv.width / CUT_Q, h = cv.height / CUT_Q, sx = opts.sx || 1, sy = opts.sy || 1;
  g.save(); g.translate(x, foot); if (opts.rot) g.rotate(opts.rot); g.scale(flip ? -sx : sx, sy);
  g.globalAlpha = 0.28; g.fillStyle = '#000'; g.beginPath(); g.ellipse(0, 0.5, w * 0.42, 2.2, 0, 0, 7); g.fill(); g.globalAlpha = opts.alpha === undefined ? 1 : opts.alpha;
  g.imageSmoothingEnabled = false; g.drawImage(cv, -w / 2, -h, w, h);
  if (opts.after) { g.save(); g.translate(-w / 2, -h); g.scale(1 / CUT_Q, 1 / CUT_Q); opts.after(g); g.restore(); }
  g.restore();
}
const CUT_BAG_NAMES = ['Плюшевий рюкзачок', 'Ведмедик', 'Курчатко', 'Мішок на шнурку', 'Сонечко', 'Хмаринка'];
function cutBagDraw(gg, style, boy) {                       // м'які рюкзаки: круглі, плюшеві; одна лямка охоплює «руку» спереду. Координати ×4 спрайта Капі
  const dk = '#2a1a14', R_ = (x, y, w, h, c) => { gg.fillStyle = c; gg.fillRect(x, y, w, h); };
  const B = (cx, cy, rx, ry, c) => { gg.fillStyle = c; for (let dy = -ry; dy <= ry; dy++) { const h = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5)))); gg.fillRect(cx - h, cy + dy, h * 2, 1); } };
  const soft = (cx, cy, rx, ry, c0, c1, c2) => { B(cx, cy, rx + 1, ry + 1, dk); B(cx, cy + 1, rx, ry, c2); B(cx - 1, cy - 1, rx - 1, ry - 1, c0); B(cx - 5, cy - 6, Math.round(rx * 0.45), Math.round(ry * 0.3), c1); };
  const SEG = [[40, 20, 4, 3], [42, 23, 4, 4], [43, 27, 4, 5], [44, 32, 4, 6], [44, 38, 4, 6], [43, 44, 4, 5]];
  const strap = (c, c2) => { SEG.forEach(r => R_(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2, dk)); SEG.forEach(r => { R_(r[0], r[1], r[2], r[3], c); R_(r[0], r[1], 1, r[3], c2); }); };
  gg.save(); gg.translate(0, 9);
  if (style === 0) {                                        // плюшевий рюкзачок: рожевий (хлопчик — синій), кругла кишенька, петелька
    const c = boy ? ['#4a82da', '#8abaff', '#2f5aa8', '#2a4a94'] : ['#ee7aa6', '#ffb8d2', '#c24f80', '#a8406a'];
    R_(25, 2, 10, 3, dk); R_(26, 3, 8, 1, c[2]);
    soft(28, 21, 17, 14, c[0], c[1], c[2]);
    B(34, 27, 8, 6, dk); B(34, 27, 7, 5, c[2]); B(34, 26, 6, 4, c[0]); R_(29, 26, 11, 1, c[2]); R_(33, 24, 1, 3, '#f6c744'); R_(33, 24, 2, 1, '#f6c744');
    strap(c[0], c[1]);
  } else if (style === 1) {                                 // ведмедик: круглі вушка, мордочка
    B(17, 7, 6, 5, dk); B(41, 7, 6, 5, dk); B(17, 7, 5, 4, '#a8703a'); B(41, 7, 5, 4, '#a8703a'); B(17, 8, 3, 2, '#e8b87a'); B(41, 8, 3, 2, '#e8b87a');
    soft(29, 21, 17, 14, '#c98a4a', '#e8b06a', '#8a5a2a');
    B(29, 26, 8, 6, dk); B(29, 26, 7, 5, '#f0d29a'); B(29, 25, 6, 4, '#f6e4b8'); R_(27, 23, 5, 3, dk); R_(28, 22, 3, 1, '#7a4a20'); R_(29, 27, 1, 3, dk); R_(25, 14, 3, 4, dk); R_(33, 14, 3, 4, dk);
    strap('#c98a4a', '#e8b06a');
  } else if (style === 2) {                                 // курчатко: жовтий, дзьобик, очка, крильця
    soft(29, 21, 17, 14, '#ffd84a', '#fff09a', '#d9a21a');
    B(14, 24, 4, 6, dk); B(14, 24, 3, 5, '#f0b82a'); B(44, 24, 3, 6, dk); B(44, 24, 2, 5, '#f0b82a');
    R_(22, 15, 4, 5, dk); R_(32, 15, 4, 5, dk); R_(23, 16, 2, 2, '#fff'); R_(33, 16, 2, 2, '#fff'); R_(24, 18, 1, 1, '#fff');
    B(29, 24, 5, 3, dk); B(29, 24, 4, 2, '#ff9a3a'); R_(26, 24, 6, 1, '#d96a1a'); R_(26, 10, 2, 3, dk); R_(29, 8, 2, 4, dk); R_(32, 10, 2, 3, dk);
    strap('#ffd84a', '#fff09a');
  } else if (style === 3) {                                 // мішок на шнурку: стягнутий зверху, шнурок із бантиком
    B(29, 22, 15, 14, dk); B(29, 23, 14, 12, '#b88a52'); B(28, 22, 13, 11, '#d9ae72'); B(24, 15, 6, 4, '#ecc990');
    R_(22, 6, 14, 5, dk); R_(23, 7, 12, 3, '#d9ae72'); R_(25, 4, 3, 4, dk); R_(31, 4, 3, 4, dk); R_(26, 3, 1, 4, '#d9ae72'); R_(32, 3, 1, 4, '#d9ae72');
    R_(21, 10, 16, 3, dk); R_(22, 10, 14, 2, '#e84a4a'); R_(26, 12, 3, 8, dk); R_(27, 12, 1, 7, '#e84a4a'); R_(31, 12, 3, 6, dk); R_(32, 12, 1, 5, '#e84a4a');
    R_(16, 20, 1, 12, '#b88a52'); R_(24, 18, 1, 14, '#b88a52'); R_(32, 18, 1, 14, '#b88a52');
    strap('#e84a4a', '#ff8a8a');
  } else if (style === 4) {                                 // сонечко (божа корівка): червоне з чорними цятками
    B(29, 22, 17, 14, dk); B(29, 23, 16, 13, '#b82a2a'); B(28, 21, 15, 12, '#ee4a4a'); B(22, 14, 6, 3, '#ff8a8a');
    R_(28, 8, 3, 28, dk); B(18, 24, 3, 3, dk); B(40, 24, 3, 3, dk); B(20, 14, 2, 2, dk); B(38, 14, 2, 2, dk); B(24, 30, 2, 2, dk); B(34, 30, 2, 2, dk);
    R_(24, 3, 2, 5, dk); R_(33, 3, 2, 5, dk); R_(22, 2, 3, 2, dk); R_(34, 2, 3, 2, dk);
    strap('#ee4a4a', '#ff8a8a');
  } else {                                                  // хмаринка: ліловий з пухнастим краєм і сердечком
    B(17, 12, 7, 6, dk); B(29, 7, 8, 6, dk); B(41, 12, 7, 6, dk);
    B(17, 12, 6, 5, '#c9b0f0'); B(29, 7, 7, 5, '#c9b0f0'); B(41, 12, 6, 5, '#c9b0f0');
    soft(29, 21, 17, 13, '#c9b0f0', '#eadcff', '#9a7ac8');
    R_(24, 19, 4, 3, '#ff9ac0'); R_(30, 19, 4, 3, '#ff9ac0'); R_(23, 20, 12, 3, '#ff9ac0'); R_(25, 23, 8, 2, '#ff9ac0'); R_(27, 25, 4, 1, '#ff9ac0'); R_(25, 19, 2, 1, '#ffd0e4');
    strap('#c9b0f0', '#eadcff');
  }
  gg.restore();
}
// Рюкзак у заставці: чорний, лежить уздовж спини Капі, два ремені навколо тулуба
function cutBagDrawBlack(gg, style, boy) {                      // справжні рюкзаки збоку: корпус, передня кишеня, ручка, блискавки, пляшечка, ремінь через плече. Координати ×4 спрайта Капі
  const dk = '#2a1a14', R_ = (x, y, w, h, c) => { gg.fillStyle = c; gg.fillRect(x, y, w, h); };
  const B = (cx, cy, rx, ry, c) => { gg.fillStyle = c; for (let dy = -ry; dy <= ry; dy++) { const h = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5)))); gg.fillRect(cx - h, cy + dy, h * 2, 1); } };
  // заокруглений прямокутник із контуром, світлою кромкою зверху-ліворуч і тінню знизу-праворуч
  const RR = (x, y, w, h, r, c, hi, sh) => { for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) { const cx = i < r ? r - i : i >= w - r ? i - (w - 1 - r) : 0, cy = j < r ? r - j : j >= h - r ? j - (h - 1 - r) : 0; const inside = (cx * cx + cy * cy) <= r * r + 0.5 && i >= 0 && j >= 0 && i < w && j < h; const edge = (cx * cx + cy * cy) <= (r + 1) * (r + 1) + 0.5 && i >= -1 && j >= -1 && i <= w && j <= h; if (inside) { R_(x + i, y + j, 1, 1, c); } else if (edge) { R_(x + i, y + j, 1, 1, dk); } } if (hi) { R_(x + r, y, w - r * 2, 2, hi); R_(x, y + r, 2, h - r * 2, hi); } if (sh) { R_(x + r, y + h - 2, w - r * 2, 2, sh); R_(x + w - 2, y + r, 2, h - r * 2, sh); } };
  const SEG = [[40, 20, 4, 3], [42, 23, 4, 4], [43, 27, 4, 5], [44, 32, 4, 6], [44, 38, 4, 6], [43, 44, 4, 5]];
  const strap = (c, c2) => { SEG.forEach(r => R_(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2, dk)); SEG.forEach(r => { R_(r[0], r[1], r[2], r[3], c); R_(r[0], r[1], 1, r[3], c2); }); R_(34, 18, 8, 4, dk); R_(35, 19, 6, 2, c); R_(36, 19, 3, 1, c2); };      // ремінь над спиною й під лапою
  const zip = (x, y, w) => { R_(x, y, w, 1, dk); R_(x + w - 3, y - 1, 3, 3, '#d0d6e0'); R_(x + w - 2, y, 1, 1, dk); };
  gg.save(); gg.translate(0, 9);
  const c = ['#3a3f4c', '#6a7284', '#1e222c'];
  const vs = (x, y0, y1, dx) => { for (let y = y0; y <= y1; y++) { const o = Math.round(Math.sin((y - y0) / (y1 - y0) * 1.6) * dx); R_(x + o - 1, y, 6, 1, dk); } for (let y = y0; y <= y1; y++) { const o = Math.round(Math.sin((y - y0) / (y1 - y0) * 1.6) * dx); R_(x + o, y, 4, 1, c[0]); R_(x + o, y, 1, 1, c[1]); } };   // ремінь навколо тулуба
  {                                        // лежачий чорний рюкзак: корпус уздовж спини, ручка зверху, оранжева смуга, передня кишеня до голови, два ремені навколо тулуба
    vs(21, 24, 44, -2); vs(45, 24, 46, 2);
    RR(14, 5, 36, 21, 8, c[0], c[1], c[2]);                                              // корпус
    R_(26, 2, 14, 4, dk); R_(27, 3, 12, 2, c[2]);                                         // ручка
    R_(21, 5, 3, 21, '#ff8a2a'); R_(21, 5, 1, 21, '#ffc080');                              // помаранчева смуга
    RR(36, 9, 13, 15, 4, '#555c6e', '#8a92a6', c[2]); zip(37, 14, 11); R_(39, 18, 7, 2, '#ff8a2a');   // передня кишеня
    R_(14, 14, 4, 8, dk); R_(15, 15, 2, 6, '#8a92a6');                                    // бічна пряжка
  }
  gg.restore();
}
function cutDrawCapy(g, x, T, L, hop, flip, squash, emo) {
  const cv = cutCapyHi(), moving = (T < CT.walk) || (T > CT.flank0 && T < CT.flank1), bob = moving ? Math.abs(Math.sin(T * 8)) * -1.4 : 0, boy = state.settings.gender === 'm';
  const bag = boy ? ['#3f6fc4', '#6fa0f0', '#2a4a94'] : ['#e0709a', '#ff9fc0', '#a8406a'];
  cutDrawChar(g, cv, x, 166 - hop + bob, flip, { sy: squash || 1, rot: moving ? Math.sin(T * 8) * 0.03 : 0, after: gg => {
    cutFace(gg, emo);
    cutBagDrawBlack(gg, 0, boy);
  } });
  if (emo.mark) { const hx = (flip ? -1 : 1) * 8; cutMark(g, emo.mark, x + hx, 166 - hop - 56, T); }
}
function cutDrawBodya(g, x, T, point, faceLeft, hammer) {
  const cv = cutHi('team_bodya_e0'), walking = (T > CT.bIn0 && T < CT.bIn1) || (T > CT.sign1 + 0.3 && T < CT.sign1 + 1.7) || (T > CT.asm0 - 0.4 && T < CT.asm0 + 0.6), bob = walking ? Math.abs(Math.sin(T * 9)) * -1.2 : 0;
  cutDrawChar(g, cv, x, 166 + bob, !faceLeft, { after: gg => {
    gg.fillStyle = '#f5c518'; gg.fillRect(8, -6, 48, 14); gg.fillRect(16, -14, 32, 10); gg.fillStyle = '#e8a010'; gg.fillRect(8, 6, 48, 3); gg.fillStyle = '#fff3a0'; gg.fillRect(20, -10, 8, 3);       // каска
  } });
  const dir = faceLeft ? -1 : 1, wave = T >= 7.7 && T < 8.6;
  if (wave) { const wy = Math.sin(T * 14) * 2; g.fillStyle = '#7a5230'; g.fillRect(dir > 0 ? x + 8 : x - 11, 166 - 30 + wy, 3, 13); g.fillStyle = '#c99a62'; g.fillRect(dir > 0 ? x + 7 : x - 12, 166 - 34 + wy, 5, 5); }
  if (hammer) { const a = Math.sin(T * 13) * 0.7 - 0.2; g.save(); g.translate(x - dir * 7, 166 - 15); g.scale(-dir, 1); g.rotate(-1.0 + a); g.fillStyle = '#7a5230'; g.fillRect(0, -1, 14, 2); g.fillStyle = '#8f98a8'; g.fillRect(11, -4, 6, 7); g.fillStyle = '#c9d1de'; g.fillRect(11, -4, 6, 2); g.restore(); }
  else if (point) { g.fillStyle = '#7a5230'; g.fillRect(dir > 0 ? x + 6 : x - 20, 166 - 15, 14, 3); g.fillStyle = '#c99a62'; g.fillRect(dir > 0 ? x + 19 : x - 23, 166 - 16, 4, 5); }
}
function cutRenderWorld(T) {
  const g = cut.wg, W = cut.W, H = cut.H, Q = CUT_Q, st = CUT_STYLES[cut.style], L = cutLay(), shift = Math.round((H - 216) * 0.9), amb = cut.amb;      // зайву висоту (телефон) заповнюють небо зверху й трохи бруківки знизу
  const camX = Math.round(cutCamCx(T, L) * Q - W * Q / 2) / Q; cut.camX = camX;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(cutSky(W, H, shift), 0, 0, W * Q, H * Q);
  cutTf(g, 0, 0);
  const hz = 156 + shift;
  if (st.stars) for (let i = 0; i < 90; i++) { const x = Math.floor(cutHash(i) * W), y = Math.floor(cutHash(i + 99) * (hz * 0.72)), tw = 0.55 + 0.45 * Math.sin(amb * (1.2 + cutHash(i + 5)) + i * 7); if (cutHash(i + 40) < st.stars) { g.globalAlpha = 0.5 * tw + 0.3; cutRc(g, x, y, 1, 1, '#ffffff'); if (i % 9 === 0) { g.globalAlpha = 0.5 * tw; cutRc(g, x - 1, y, 3, 1, '#cfe0ff'); cutRc(g, x, y - 1, 1, 3, '#cfe0ff'); } } }
  g.globalAlpha = 1;
  if (st.sun === 'sun' || st.sun === 'low') {                                   // сонце з гри (низьке — помаранчеве)
    const low = st.sun === 'low', x = Math.round(low ? W * 0.3 : W * 0.78), y = Math.round(low ? hz - 14 : hz - 36);
    g.globalAlpha = 0.45; disc(g, x, y, 13, low ? 'o' : 'w'); g.globalAlpha = 1; disc(g, x, y, 9, low ? 'o' : 'y'); disc(g, x, y, 6, low ? 'h' : 'w');
  } else {                                                                       // місяць з гри: ореол, кратери, моря
    const x = Math.round(W * 0.76), y = 44; g.globalAlpha = 0.09; disc(g, x, y, 20, 'w'); g.globalAlpha = 0.14; disc(g, x, y, 16, 'w'); g.globalAlpha = 0.24; disc(g, x, y, 13, 'w'); g.globalAlpha = 1;
    disc(g, x, y, 10, 'e'); disc(g, x, y, 9, 'W'); disc(g, x - 1, y - 1, 8, 'w');
    g.globalAlpha = 0.55; R(g, x - 6, y - 4, 4, 3, 'e'); R(g, x + 1, y - 6, 5, 3, 'e'); R(g, x + 2, y + 1, 4, 4, 'e'); R(g, x - 5, y + 2, 3, 3, 'e'); R(g, x - 1, y + 5, 3, 2, 'e'); g.globalAlpha = 0.8;
    R(g, x - 6, y - 5, 2, 1, 'w'); R(g, x + 1, y - 7, 3, 1, 'w'); R(g, x + 2, y, 2, 1, 'w'); R(g, x - 5, y + 1, 2, 1, 'w'); R(g, x - 1, y + 4, 2, 1, 'w'); g.globalAlpha = 1;
  }
  const nCl = 4 + Math.floor((H - 216) / 34), tint = { A: '', B: 'grey', C: 'dark' }[cut.style];                                     // хмари — ті самі, що в грі
  for (let i = 0; i < nCl; i++) { const cw = W + 120, x = Math.round((((i * 170 - amb * (2 + (i % 3)) - camX * 0.06) % cw) + cw) % cw - 60), y = Math.round(4 + (i * 37) % Math.max(50, hz - 110)); g.globalAlpha = cut.style === 'C' ? 0.5 : 0.95; g.drawImage(cloudCanvas(i % 3, tint), x, y); }
  g.globalAlpha = 1;
  if (cut.style !== 'C') { const bx = ((amb * 7 + W * 0.3) % (W + 120)) - 60, by = 36 + Math.sin(amb * 0.7) * 2, bc = cut.style === 'B' ? '#d96a6a' : '#e8e4d8'; g.globalAlpha = 0.95; cutRc(g, bx + 1, by, 28, 11, bc); cutRc(g, bx + 3, by - 1.5, 24, 14, bc); cutRc(g, bx + 5, by + 2, 20, 2, '#ffffff'); cutRc(g, bx - 5, by + 1, 6, 3, '#b04a4a'); cutRc(g, bx - 5, by + 6, 6, 3, '#b04a4a'); cutRc(g, bx + 10, by + 13, 10, 4, '#6b4a2a'); cutRc(g, bx + 11, by + 14, 3, 2, '#bfe3f2'); g.globalAlpha = 1; }
  // світ
  cutTf(g, -camX, shift);
  const layer = (p, fn) => { g.save(); g.translate(camX * (1 - p), 0); fn(camX * p, camX * p + W); g.restore(); };
  layer(0.25, (a, b) => { for (let i = Math.floor(a / 46) - 1; i < Math.ceil(b / 46) + 1; i++) { const x = i * 46 + cutHash(i) * 10, w = 28 + cutHash(i + 5) * 18, h = 40 + cutHash(i + 9) * 52; cutRc(g, x, 138 - h, w, h, cut.style === 'A' ? '#a9bfdc' : cut.style === 'B' ? '#6a4a86' : '#1c2a5a'); for (let k = 0; k < h / 12; k++) if (cutHash(i * 7 + k) < st.win) cutRc(g, x + 4 + (k % 2) * 10, 138 - h + 6 + k * 10, 3, 3, 'rgba(255,214,120,.8)'); } });
  layer(0.55, (a, b) => { for (let i = Math.floor(a / 62) - 1; i < Math.ceil(b / 62) + 1; i++) { const hc = cutHouseCv(i + 3); g.globalAlpha = 0.55; g.drawImage(hc.c, i * 62 + cutHash(i + 21) * 14, 146 - hc.h * 0.5, hc.w * 0.5, hc.h * 0.5); g.globalAlpha = 1; } });
  const lotBuilt = T >= CT.asm1 - 0.1;
  { let rx = L.lotL; for (let j = 0; j < 14; j++) { const hc = cutHouseCv(-1 - j); rx -= hc.hw; if (rx + hc.hw > camX - 30 && rx < camX + W + 30) g.drawImage(hc.c, rx - hc.ox, 148 - hc.h + 1); }
    rx = L.lotR; for (let j = 0; j < 14; j++) { const hc = cutHouseCv(j); if (rx > camX - 120 && rx < camX + W + 30) g.drawImage(hc.c, rx - hc.ox, 148 - hc.h + 1); rx += hc.hw; } }
  // тротуар
  g.fillStyle = PALETTE.E; g.fillRect(camX, 148, W, 24); g.fillStyle = PALETTE.e; g.fillRect(camX, 148, W, 1);
  for (let x = Math.floor(camX / 20) * 20 + 6; x < camX + W; x += 20) g.fillRect(x, 149, 1, 9);
  const st4 = CUT_STYLES[cut.style].tint; g.fillStyle = 'rgba(' + st4[0] + ',' + st4[1] + ',' + st4[2] + ',' + st4[3] * 0.85 + ')'; g.fillRect(camX, 148, W, 24);
  if (cut.style === 'C') { g.fillStyle = 'rgba(240,248,255,.7)'; g.fillRect(camX, 148, W, 3); for (let x = Math.floor(camX / 7) * 7; x < camX + W; x += 7) g.fillRect(x, 151, 3 + (x % 5), 1 + (x % 3)); }
  g.fillStyle = PALETTE.e; g.fillRect(camX, 172, W, 2); g.fillStyle = PALETTE.w; g.fillRect(camX, 172, W, 1);
  const cb = cutCobbleCv(); for (let yy = 174, r = 0; yy < H - shift + 44; yy += 44, r++) for (let x = Math.floor(camX / 512) * 512 - 200; x < camX + W; x += 512) g.drawImage(cb, x + (r % 2) * 190, yy); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(camX, 208, W, 10);
  // ділянка: паркан і земля
  if (!lotBuilt) {
    cutRc(g, L.lotL, 150, L.lotR - L.lotL, 22, '#a88c5e'); for (let k = 0; k < 18; k++) { const x = L.lotL + 6 + cutHash(k + 61) * (L.lotR - L.lotL - 14); cutRc(g, x, 152 + cutHash(k + 9) * 16, 3, 1.5, cutHash(k) < 0.5 ? '#8a6c40' : '#c0a374'); }
    if (T < CT.asm0) { for (let k = 0; k < 8; k++) { const x = L.lotL + 4 + k * 22; cutRc(g, x, 120, 4, 28, '#8a5a30'); cutRc(g, x, 120, 4, 2, '#b88450'); cutRc(g, x, 122, 1, 26, '#a06a38'); } cutRc(g, L.lotL, 128, L.lotR - L.lotL, 3, '#a06a38'); cutRc(g, L.lotL, 138, L.lotR - L.lotL, 3, '#a06a38'); }
    for (let k = 0; k < 11; k++) { const x = L.lotL + 8 + cutHash(k + 71) * (L.lotR - L.lotL - 16); cutRc(g, x, 164, 1, 5, '#5f9a48'); cutRc(g, x + 2, 166, 1, 3, '#4f8a3a'); cutRc(g, x - 2, 167, 1, 2, '#6fb058'); }
    if (T < CT.asm0) { cutRc(g, L.lotL + 6, 100, 3, 50, '#6b4a2a'); cutRc(g, L.lotL - 6, 96, 22, 14, '#d8c08a'); cutRc(g, L.lotL - 6, 96, 22, 2, '#a88c5e'); }
    if (cut.style === 'C') { g.fillStyle = 'rgba(240,248,255,.75)'; g.fillRect(L.lotL, 150, L.lotR - L.lotL, 3); g.fillRect(L.lotL - 6, 94, 22, 2); }
  }
  const lamp = cutLampCv();
  for (let k = Math.floor(camX / 110) - 1; k < Math.ceil((camX + W) / 110) + 1; k++) { const x = 40 + k * 110; if (x > L.lotL - 12 && x < L.lotR + 12 && !lotBuilt) continue; g.drawImage(lamp.c, x - 10, 158 - lamp.h + 2); }
  for (let k = Math.floor(camX / 160) - 1; k < Math.ceil((camX + W) / 160) + 1; k++) { const x = 90 + k * 160; if (x > L.lotL - 30 && x < L.lotR + 30) continue; const tc = cutTreeCv(((k % 3) + 3) % 3); g.drawImage(tc.c, x - 55, 156 - tc.base); }
  // монета: на землі, у руках, летить
  const coinOn = T >= 3.9 && T < CT.pick, put = T >= CT.pick && T < CT.pick + 0.8, fly = T >= CT.fly0 && T < CT.flash;
  const capyXn = cutCapyX(T, L), spin = T * 5, bagX = capyXn - 13, bagY = 124; let coinPos = null, coinR = 5;
  if (coinOn) coinPos = [L.coinX, 163 - Math.max(0, Math.sin((T - 3.9) * 6) * Math.max(0, 1 - (T - 3.9) * 2) * 6)];
  else if (put) { const u = cutSm((T - CT.pick) / 0.8); coinPos = [cutLerp(L.coinX, bagX, u), cutLerp(163, bagY - 4, u) - Math.sin(Math.PI * u) * 20]; coinR = u > 0.7 ? 5 - (u - 0.7) / 0.3 * 3.5 : 5; }
  else if (fly) { const u = cutSm((T - CT.fly0) / 0.8), a = T < CT.fly1 ? u : 1; coinPos = [cutLerp(bagX, L.shopCX, a), cutLerp(bagY - 4, 96, a) - Math.sin(Math.PI * Math.min(1, u)) * 26 + (T > CT.fly1 ? Math.sin(T * 4) * 2 : 0)]; coinR = (T < CT.fly0 + 0.25 ? 1.5 + (T - CT.fly0) / 0.25 * 3.5 : 5) + Math.max(0, T - CT.fly1) * 1.2; }
  cut.coinPos = coinPos;
  // магазин: збирається з пікселів монети; риштування й Бодя-будівельник
  const sx0 = L.shopCX - cut.shopW / 2, sy0 = 170 - cut.shopH;
  const bOn = T >= CT.asm0 - 0.4 && T < CT.sign1 + 1;                 // будівництво маркету — 190_cz_cutscene_epic.js
  if (bOn) cutBuildBack(g, T, L, sx0, sy0);
  if (T >= CT.asm1) {
    const k = Math.max(0, 1 - (T - CT.asm1) / 0.45), tap = cut.tapAmb >= 0 ? Math.max(0, 1 - (cut.amb - cut.tapAmb) / 0.18) : 0;
    g.save(); g.translate(L.shopCX, 170); g.scale(1 + 0.03 * tap + 0.03 * k, 1 - 0.05 * tap + 0.03 * k); g.drawImage(cut.thumbs[0].c, -cut.shopW / 2, -cut.shopH); g.restore();
    if (k > 0) { g.globalAlpha = k * 0.7; cutRc(g, sx0, sy0, cut.shopW, cut.shopH, '#fff6c8'); g.globalAlpha = 1; }
  } else if (T >= CT.asm0) cutBuildShop(g, T, L, sx0, sy0);
  if (bOn) cutBuildFront(g, T, L, sx0, sy0);
  if (coinPos && T < CT.flash) { cutCoin(g, coinPos[0], coinPos[1], coinR, spin, (T > CT.fly0 ? 0.9 + Math.sin(T * 6) * 0.2 : 0.5)); if (coinOn) { for (let k = 0; k < 3; k++) { const ph = (T * 1.6 + k * 0.33) % 1; if (ph < 0.5) cutSpark(g, coinPos[0] + (k - 1) * 9, coinPos[1] - 6 - ph * 8, ph < 0.25 ? 1 : 2, '#fff7c0'); } } }
  // пил за Капі
  if (T < CT.walk) for (let n = 0; n < 12; n++) { const tn = T - n * 0.22; if (tn < 0) break; const age = n * 0.22, x = cutCapyX(tn, L) - 16; g.globalAlpha = Math.max(0, 0.5 - age * 0.18); cutRc(g, x - age * 5, 164 - age * 6, 3 + age * 3, 3 + age * 2, '#e8dcc0'); }
  g.globalAlpha = 1;
  // актори на окремому шарі, трохи затонованому
  const ag = cut.ag; ag.setTransform(1, 0, 0, 1, 0, 0); ag.clearRect(0, 0, W * Q, H * Q); cutTf(ag, -camX, shift); ag.imageSmoothingEnabled = false;
  const u2 = cut.tapAmb >= 0 ? T - CT.TW : -1, hop = (u2 >= 0.1 && u2 < 0.9) ? Math.abs(Math.sin((u2 - 0.1) / 0.8 * Math.PI)) * 12 : (T >= 6.0 && T < 6.45 ? Math.abs(Math.sin((T - 6.0) / 0.45 * Math.PI)) * 6 : (T > CT.flank0 && T < CT.flank1 ? Math.abs(Math.sin((T - CT.flank0) * 9)) * 3 : 0));
  const emo = cutEmo(T, cut.amb), look = (T >= 4.55 && T < 5.05) ? 1 : 0, down = (T >= 5.5 && T < 6.2) ? 0.94 : 1;
  cutDrawCapy(ag, capyXn, T, L, hop, look, down, emo);
  const hammering = T >= CT.asm0 + 0.6 && T < CT.asm1 + 0.2;
  if (T >= CT.bIn0) cutDrawBodya(ag, cutBodyX(T, L), T, T >= 11.7 && T < 13.4, T < 11.7 || T >= CT.asm1 + 0.4, hammering);
  if (hammering) { const sw = Math.sin(T * 13); if (sw > 0.9) for (let k = 0; k < 3; k++) cutSpark(ag, L.shopCX - 80 + k * 4, 150 - k * 3, 1, '#ffe36a'); }
  cutTf(ag, 0, 0); ag.setTransform(1, 0, 0, 1, 0, 0); ag.globalCompositeOperation = 'source-atop'; ag.fillStyle = 'rgba(' + st.tint[0] + ',' + st.tint[1] + ',' + st.tint[2] + ',' + (st.tint[3] * 0.55) + ')'; ag.fillRect(0, 0, W * Q, H * Q); ag.globalCompositeOperation = 'source-over';
  // світло ліхтарів, вікон і монети
  if (st.glow) {
    g.globalCompositeOperation = 'lighter';
    for (let k = Math.floor(camX / 110) - 1; k < Math.ceil((camX + W) / 110) + 1; k++) { const x = 40 + k * 110; if (x > L.lotL - 12 && x < L.lotR + 12 && !lotBuilt) continue; const gr = g.createRadialGradient(x, 124, 2, x, 134, 52); gr.addColorStop(0, 'rgba(255,214,120,' + 0.42 * st.glow + ')'); gr.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gr; g.fillRect(x - 56, 74, 112, 110); g.fillStyle = 'rgba(255,200,110,' + 0.10 * st.glow + ')'; g.beginPath(); g.ellipse(x, 168, 44, 6, 0, 0, 7); g.fill(); }
    g.globalCompositeOperation = 'source-over';
  }
  if (coinPos && T < CT.flash && st.glow) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(coinPos[0], coinPos[1], 2, coinPos[0], coinPos[1], 46); gr.addColorStop(0, 'rgba(255,220,110,.45)'); gr.addColorStop(1, 'rgba(255,220,110,0)'); g.fillStyle = gr; g.fillRect(coinPos[0] - 50, coinPos[1] - 50, 100, 100); g.globalCompositeOperation = 'source-over'; }
  if (lotBuilt && st.glow) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(L.shopCX, 150, 4, L.shopCX, 150, 96); gr.addColorStop(0, 'rgba(255,214,120,' + 0.30 * st.glow + ')'); gr.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gr; g.fillRect(L.shopCX - 100, 80, 200, 110); g.globalCompositeOperation = 'source-over'; }
  g._st(1, 0, 0, 1, 0, 0); g.drawImage(cut.al, 0, 0); cutTf(g, -camX, shift);       // шари однакового розміру й виду — 1:1
  if ((T > CT.pick + 0.6 && T < CT.pick + 1.2) || (T > CT.fly0 - 0.15 && T < CT.fly0 + 0.4)) for (let k = 0; k < 3; k++) { const ph = (T * 3 + k * 0.33) % 1; cutSpark(g, bagX + (k - 1) * 6, bagY - 4 - ph * 9, ph < 0.4 ? 1 : 2, '#fff7c0'); }
  // листя, пелюстки або сніг, що падають
  { cutTf(g, 0, 0); const n = st.fall === 'snow' ? 90 : 36; for (let i = 0; i < n; i++) { const sp = 12 + cutHash(i + 3) * 24, x = (((cutHash(i) * (W + 80) + Math.sin(amb * 0.9 + i) * 8 - amb * 4 * (st.fall === 'snow' ? 0.3 : 1)) % (W + 80)) + W + 80) % (W + 80) - 40, y = ((cutHash(i + 50) * (H + 40) + amb * sp) % (H + 40)) - 20;
      if (st.fall === 'snow') { g.globalAlpha = 0.85; cutRc(g, x, y, 1.5, 1.5, '#ffffff'); } else { g.globalAlpha = 0.9; cutRc(g, x, y, 3, 1.5, st.fall === 'petal' ? ['#ffc9d4', '#ef8fa3', '#fff0f4'][i % 3] : ['#c4553d', '#e8863c', '#f2b84b', '#a8703f'][i % 4]); } } g.globalAlpha = 1; cutTf(g, -camX, shift); }
  // передній план: кут сусіднього будинку, з-за якого виходить Боді
  g.setTransform(1, 0, 0, 1, 0, 0);
  cut.shopRectW = [sx0, sy0, cut.shopW, cut.shopH]; cut.L = L; cut.shift = shift;
}
