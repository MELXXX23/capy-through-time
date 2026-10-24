//#part 190_c_cutscene_panel_tour_sfx.js
function cutCache(k, fn) { return cut.cache[k] || (cut.cache[k] = fn()); }
function cutW2S(wx, wy, z, f) { const sx = wx - cut.camX, sy = wy + cut.shift; return [(sx - f[0]) * z + f[0], (sy - f[1]) * z + f[1]]; }
function cutDrawFrame(T) {
  const Tn = T; T = Math.max(0, T);
  const g = cut.g, W = cut.W, H = cut.H, Q = CUT_Q, txt = CUT_TXT[state.lang] || CUT_TXT.uk, amb = cut.amb;
  cutRenderWorld(Tn < 0 ? Math.max(-CUT_PRE, Tn) : T); const L = cut.L;
  let z = cutZoom(T), f = [W / 2, H / 2];
  if (z > 1.001) {
    const sh = cut.shift; let target;
    if (T < 7.2 && cut.coinPos) target = [cut.coinPos[0] - cut.camX, cut.coinPos[1] + sh];
    else if (T < 15) target = [L.shopCX - cut.camX, 96 + sh];
    else if (T < CT.sign0) target = [L.shopCX - cut.camX, 170 - cut.shopH * 0.5 + sh];
    else target = [L.shopCX - cut.camX, 170 - cut.shopH + 22 + sh];
    f = [Math.max(10, Math.min(W - 10, target[0])), Math.max(10, Math.min(H - 10, target[1]))];
  }
  if (Tn < 0) { const ic = cutIntroCam(Tn, W, H); z = ic[0]; f = ic[1]; }
  let shk = 0; [[CT.flash, 4], [CT.asm0 + 0.02, 2.5], [CT.asm0 + CB.roof1, 4.5], [CT.asm0 + CB.scDown + 0.1, 1.2]].forEach(([te, a]) => { const d = T - te; if (d >= 0 && d < 0.3) shk = Math.max(shk, a * (1 - d / 0.3)); });
  if (cut.tapAmb >= 0) { const d = amb - cut.tapAmb; if (d >= 0 && d < 0.25) shk = Math.max(shk, 1.5 * (1 - d / 0.25)); }
  if (cut.chgAmb >= 0) { const d = amb - cut.chgAmb; if (d >= 0 && d < 0.15) shk = Math.max(shk, (0.6 + cut.chg * 0.25) * (1 - d / 0.15)); }
  const ox = shk ? Math.round(Math.sin(T * 91) * shk * Q) : 0, oy = shk ? Math.round(Math.cos(T * 77) * shk * Q) : 0;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#000'; g.fillRect(0, 0, W * Q, H * Q);
  g.drawImage(cut.wc, f[0] * (1 - 1 / z) * Q, f[1] * (1 - 1 / z) * Q, W * Q / z, H * Q / z, ox, oy, W * Q, H * Q);
  cutTf(g, 0, 0); g.imageSmoothingEnabled = false;
  const w2s = (wx, wy) => cutW2S(wx, wy, z, f);
  const u7 = cut.tapAmb >= 0 ? T - CT.u0 : -99;
  let dim = cutKf(T, [[13.8, 0], [14.5, 0.5], [14.7, 0.5], [CT.flash + 0.05, 0]]); if (u7 > -0.4 && u7 < 7.9) dim = Math.max(dim, 0.45 * cutSm((u7 + 0.4) / 0.5) * (u7 > 7.2 ? Math.max(0, 1 - (u7 - 7.2) / 0.7) : 1));
  if (dim > 0.01) { g.fillStyle = 'rgba(8,6,20,' + dim + ')'; g.fillRect(0, 0, W, H); }
  if (T >= CT.charge + 0.05 && T < CT.flash + 0.1) {
    const u = cutSm((T - CT.charge - 0.05) / 0.75), r = cutLerp(14, Math.max(W, H) * 0.62, u * u), cpos = T < CT.big1 ? w2s(L.shopCX, 96 + Math.sin(T * 4) * 2) : [W / 2, H / 2], cx = cutLerp(cpos[0], W / 2, u), cy = cutLerp(cpos[1], H / 2, u);
    cutCoin(g, cx, cy, r, T * (5 + u * 14), 0.8);
  }
  const fl = cutKf(T, [[14.55, 0], [CT.flash, 1], [CT.flash + 0.06, 1], [15.9, 0]]); if (fl > 0.01) { g.fillStyle = 'rgba(255,248,205,' + fl + ')'; g.fillRect(0, 0, W, H); }
  cutFxScreen(g, T, Tn, w2s, W, H);
  const F = cutFinale(T, L, w2s);
  if (F) {
    g.fillStyle = 'rgba(8,6,22,' + (0.68 * cutSm(F.fT / 0.9)) + ')'; g.fillRect(0, 0, W, H);
    const al = Math.min(1, F.fT / 0.4), step = F.fT < 2.8 ? Math.abs(Math.sin(F.fT * 8)) * -2 * F.sc : 0;
    cutDrawChar(g, F.melC, F.mx, F.foot + step, false, { sx: F.sc, sy: F.sc, alpha: al }); cutDrawChar(g, F.nikC, F.nx, F.foot + step, false, { sx: F.sc, sy: F.sc, alpha: al });
    if (F.wk > 0.25) cutMark(g, 'heart', F.fx, F.foot - F.h - 8, T);
  }
  const say = cutSayState(T, txt);
  if (say && z < 1.2) {
    let pos;
    if (say.who === 'c') pos = w2s(cutCapyX(T, L), 166 - 50); else if (say.who === 'b') pos = w2s(cutBodyX(T, L), 166 - 36); else if (F) pos = [say.who === 'm' ? F.mx : F.nx, F.foot - F.h + 6]; else pos = [W / 2, H / 2];
    cutBubble(g, say.text, pos[0], pos[1] - 4, say.who, say.prog, W);
  }
  [[CT.ting1, 'TING!', 0], [CT.ting2, 'TING!', 1]].forEach(([te, s, k]) => { const a = T - te; if (a >= 0 && a < 0.9) { const p = w2s(cutCapyX(T, L) + (k ? -36 : 36), 166 - 84); cutPopText(g, s, Math.max(40, Math.min(W - 40, p[0])), Math.max(14, p[1] - a * 8), 3, '#ffe36a', '#7a3a10', a); } });
  if (T >= CT.asm0 + 0.5 && T < CT.asm1) { const per = 0.7, a = (T - CT.asm0 - 0.5) % per, n = Math.floor((T - CT.asm0 - 0.5) / per); if (a < 0.5 && n % 2 === 0) { const p = w2s(L.shopCX - 88, 120); cutPopText(g, txt.tuk, Math.max(30, p[0]), p[1] - n % 3 * 8, 2, '#fff6c8', '#6b3a10', a); } }
  { const n = (cut.tapAmb >= 0 && T >= CT.TW + 0.75) ? 2 : 1, el = cut.hudEl; if (el) { const show = T >= CT.bIn0 ? '' : 'none'; if (el.style.display !== show) el.style.display = show; if (cut.hudN !== n) { cut.hudN = n; const cc = el.querySelector('#coinCount'); if (cc) cc.textContent = String(n); } } }
  const sr = cut.shopRectW, sS = w2s(sr[0], sr[1]); cut.rect = [sS[0], sS[1], sr[2] * z, sr[3] * z];
  if (T >= CT.TW - 0.01 && cut.tapAmb < 0) {
    const b = Math.abs(Math.sin(amb * 5)) * 4, pulse = 0.5 + 0.5 * Math.sin(amb * 6), top = sS[1];
    g.globalAlpha = 0.5 + 0.5 * pulse; g.fillStyle = '#fff6c8'; g.fillRect(sS[0] - 2, sS[1] - 2, sr[2] + 4, 1.5); g.fillRect(sS[0] - 2, sS[1] + sr[3], sr[2] + 4, 1.5); g.fillRect(sS[0] - 2, sS[1] - 2, 1.5, sr[3] + 4); g.fillRect(sS[0] + sr[2], sS[1] - 2, 1.5, sr[3] + 4); g.globalAlpha = 1;
    const ax = sS[0] + sr[2] / 2, ay = Math.max(30, top - 12) + b; g.fillStyle = '#3a2a22'; g.fillRect(ax - 7, ay - 1, 15, 3); g.fillRect(ax - 5, ay + 2, 11, 3); g.fillRect(ax - 3, ay + 5, 7, 3); g.fillRect(ax - 1, ay + 8, 3, 3); g.fillStyle = '#ffe36a'; g.fillRect(ax - 6, ay - 1, 13, 2); g.fillRect(ax - 4, ay + 1, 9, 2); g.fillRect(ax - 2, ay + 3, 5, 2); g.fillRect(ax, ay + 5, 1, 2);
    cutTextPx(g, txt.hint, W / 2, Math.max(14, Math.min(ay - 18, 28)), W < 300 ? 2 : 3, '#fff6c8', '#3a2a22', 'center');
  }
  if (cut.tapAmb >= 0) {
    const u = T - CT.TW, hp = cut.hit || [sS[0] + sr[2] / 2, sS[1] + sr[3] / 2];
    if (u >= 0 && u < 0.9) cutPopText(g, txt.click, hp[0], hp[1] - 6 - u * 14, 4, '#ffffff', '#c0392b', u);
    if (u >= 0.05 && u < 0.75) { const k = cutSm((u - 0.05) / 0.7), p0 = [sS[0] + sr[2] / 2, sS[1] + sr[3] * 0.7], p1 = [16, 14]; cutCoin(g, cutLerp(p0[0], p1[0], k), cutLerp(p0[1], p1[1], k) - Math.sin(Math.PI * k) * 26, 5, T * 12, 0.2); }
    for (let i = 0; i < 9; i++) { if (u < 0.2 || u > 1.3) break; const a = i / 9 * 6.283 + 0.4, d = (u - 0.2) * 60 * (0.6 + cutHash(i + 3)); cutSpark(g, hp[0] + Math.cos(a) * d, hp[1] + Math.sin(a) * d * 0.8, 1, ['#ffe36a', '#ff9fc0', '#9fd4ff'][i % 3]); }
  }
  if (u7 > -0.4 && u7 < 7.9) cutS7(g, u7, W, H, txt);
  cut.btn = null;
  if (T >= CT.fin + 7.2) {                                                       // кнопка «ПОЧИНАЄМО!»
    const a = cutSm((T - CT.fin - 7.2) / 0.4), bw = W < 300 ? 140 : 168, bh = 26, bx = Math.round((W - bw) / 2), by = Math.round(H - 40 + (1 - a) * 30 - (W < 300 ? 0 : 6)), pul = 0.5 + 0.5 * Math.sin(amb * 6);
    cutRc(g, bx - 2, by - 2, bw + 4, bh + 4, '#fff6c8'); cutRc(g, bx, by, bw, bh, '#2a7a3a'); cutRc(g, bx, by, bw, 3, '#7aff7a'); cutRc(g, bx, by + bh - 3, bw, 3, '#1d5a2a'); g.globalAlpha = 0.25 * pul; cutRc(g, bx, by, bw, bh, '#ffffff'); g.globalAlpha = 1;
    cutTextPx(g, txt.go, W / 2, by + bh / 2 + 0.5, 3, '#ffffff', '#1d5a2a', 'center'); cut.btn = [bx, by, bw, bh];
  }
  if (Tn < 0) cutIntroText(g, Tn, W, H, txt);                                   // вступ: текст над небом
  const goT = cut.goAmb >= 0 ? cut.amb - cut.goAmb : -1, fade = Math.max(Tn < 0 ? Math.max(0, 1 - (Tn + CUT_PRE) / 0.9) : 0, goT >= 0 ? cutSm(goT / 0.7) : 0);
  if (fade > 0.01) { g.fillStyle = goT >= 0 ? 'rgba(255,248,205,' + fade + ')' : 'rgba(0,0,0,' + fade + ')'; g.fillRect(0, 0, W, H); }
  g.drawImage(cutCache('vig' + W + 'x' + H, () => { const c = document.createElement('canvas'); c.width = W * Q; c.height = H * Q; const v = c.getContext('2d'), gr = v.createRadialGradient(W * Q / 2, H * Q / 2, H * Q * 0.45, W * Q / 2, H * Q / 2, Math.max(W, H) * Q * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.42)'); v.fillStyle = gr; v.fillRect(0, 0, W * Q, H * Q); return c; }), 0, 0, W, H);
}
// пояснення гри: ланцюжок ТАП → МОНЕТИ → ПОКРАЩЕННЯ → РІВЕНЬ, ріст магазину й гасло
function cutPanel(g, x, y, w, h) { g.fillStyle = '#3a2a22'; g.fillRect(x - 2, y - 2, w + 4, h + 4); g.fillStyle = '#c98a3c'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#fff3d6'; g.fillRect(x, y, w, h); g.fillStyle = '#fffaf0'; g.fillRect(x, y, w, 2); g.fillStyle = '#ecd9ae'; g.fillRect(x, y + h - 2, w, 2); }
function cutPix(g, map, pal, x, y, s) { map.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const col = pal[row[i]]; if (col) { g.fillStyle = col; g.fillRect(x + i * s, y + j * s, s, s); } } }); }
const CUT_ARROW = ['X..........', 'XX.........', 'XOX........', 'XOOX.......', 'XOOOX......', 'XOOOOX.....', 'XOOOOOX....', 'XOOOOOOX...', 'XOOOOOOOX..', 'XOOOOXXXXX.', 'XOXOOX.....', 'XX.XOOX....', 'X..XOOX....', '....XOOX...', '....XOOX...', '.....XX....'];
const CUT_UP = ['.....XX.....', '....XOOX....', '...XOOOOX...', '..XOOOOOOX..', '.XOOOOOOOOX.', 'XOOOOOOOOOOX', 'XXXXOOOOXXXX', '...XOOOOX...', '...XOOOOX...', '...XOOOOX...', '...XXXXXX...'];
function cutArrowR(g, x, y) { g.fillStyle = '#3a2a22'; g.fillRect(x - 5, y - 3, 7, 6); g.fillRect(x, y - 7, 3, 14); g.fillRect(x + 3, y - 5, 2, 10); g.fillRect(x + 5, y - 3, 2, 6); g.fillRect(x + 7, y - 1, 1, 2); g.fillStyle = '#e8a92a'; g.fillRect(x - 4, y - 2, 6, 4); g.fillRect(x + 1, y - 6, 2, 12); g.fillRect(x + 3, y - 4, 2, 8); g.fillRect(x + 5, y - 2, 2, 4); }
function cutIcon(g, i, u) {                      // значки 28×28
  if (i === 0) { g.fillStyle = '#7fb6e8'; for (let r = 0; r < 2; r++) for (let a = 0; a < 6.283; a += 0.22) g.fillRect(Math.round(Math.cos(a) * (10 + r * 4 + (Math.floor(u * 4) % 2))), Math.round(Math.sin(a) * (10 + r * 4 + (Math.floor(u * 4) % 2))) + 3, 1.5, 1.5); cutPix(g, CUT_ARROW, { X: '#2a1a14', O: '#ffffff' }, -6, -9, 1.5); }
  else if (i === 1) { cutCoin(g, -5, 6, 7, 0, 0); cutCoin(g, 6, 7, 7, 0, 0); cutCoin(g, 0, -2, 10, u * 3, 0); }
  else if (i === 2) cutPix(g, CUT_UP, { X: '#1d5a2a', O: '#7aff7a' }, -12, -11, 2);
  else { const t = cut.thumbs[1], s = Math.min(38 / t.w, 28 / t.h); g.drawImage(t.c, -t.w * s / 2, -t.h * s / 2 + 2, t.w * s, t.h * s); }
}
function cutS7(g, u, W, H, txt) {
  const nar = W < 300, pw = Math.min(W - 12, 350), px = Math.round((W - pw) / 2);
  if (u >= 0 && u < 3.3) {
    const row = W >= 392, grid = !row, cardW = row ? 86 : 84, gap = row ? 14 : 8, labels = [txt.i1, txt.i2, txt.i3, txt.i4], top = Math.max(12, Math.round((cut.hudBu || 0) + 3));
    const pw = row ? 4 * cardW + 3 * gap + 16 : 2 * cardW + gap + 12, ph = row ? 60 : 2 * 50 + 6 + 10, px = Math.round((W - pw) / 2), py = top;
    g.globalAlpha = cutSm((u + 0.4) / 0.4); cutPanel(g, px, py, pw, ph); g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) {
      const a = cutSm((u - (0.2 + 0.6 * i)) / 0.3); if (a <= 0) continue;
      const col = row ? i : i % 2, rw = row ? 0 : (i >> 1);
      const cx = px + (row ? 8 : 6) + cardW / 2 + col * (cardW + gap), cy = py + (row ? 22 : 18 + rw * 56), sc = 0.7 + 0.3 * a;
      g.save(); g.globalAlpha = a; g.translate(cx, cy); g.scale(sc, sc); cutIcon(g, i, u); g.restore(); g.globalAlpha = 1;
      cutTextPx(g, labels[i], cx, cy + (row ? 28 : 24), 2, '#3a2a22', null, 'center');
      if (a > 0.9) { if (row && i < 3) cutArrowR(g, cx + cardW / 2 + gap / 2, cy); else if (!row && i === 0) cutArrowR(g, cx + cardW / 2 + gap / 2, cy); else if (!row && i === 2) cutArrowR(g, cx + cardW / 2 + gap / 2, cy); else if (!row && i === 1) { g.save(); g.translate(px + pw / 2, py + 52); g.rotate(Math.PI / 2); cutArrowR(g, 0, 0); g.restore(); } }
    }
  } else if (u >= 3.3 && u < 5.5) {
    const k = u - 3.3, bw = nar ? 52 : 70, bh = nar ? 46 : 54, gap = nar ? 14 : 24, tw = bw * 3 + gap * 2, x0 = Math.round((W - tw) / 2), y0 = nar ? 40 : 22;
    for (let i = 0; i < 3; i++) {
      const a = cutSm((k - i * 0.5) / 0.3); if (a <= 0) continue; const t = cut.thumbs[i], s = Math.min(bw / t.w, bh / t.h), dw = Math.round(t.w * s), dh = Math.round(t.h * s), bx = x0 + i * (bw + gap) + (bw - dw) / 2, by = y0 + bh - dh;
      g.save(); g.globalAlpha = a; g.translate(bx + dw / 2, by + dh); g.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a); g.drawImage(t.c, -dw / 2, -dh, dw, dh); g.restore(); g.globalAlpha = 1;
      if (i < 2 && a > 0.9) cutTextPx(g, '▶', x0 + (i + 1) * (bw + gap) - gap / 2, y0 + bh / 2, 2, '#f6c744', null, 'center');
      if (i === 2 && a > 0.9) for (let q = 0; q < 4; q++) cutSpark(g, bx + dw * (0.1 + 0.27 * q), by + 6 + Math.sin(u * 8 + q) * 3, 1 + (Math.floor(u * 6 + q) % 2), '#fff6c8');
    }
  } else if (u >= 5.5) {
    const k = u - 5.5, y0 = nar ? 44 : 34, wds = [txt.w1, txt.w2, txt.w3];
    wds.forEach((w, i) => { const a = k - i * 0.6; if (a >= 0) cutPopText(g, w, W / 2, y0 + i * (nar ? 22 : 17), nar ? 2.5 : 3, ['#ffe36a', '#9fd4ff', '#7aff7a'][i], '#2a1a3a', a); });
  }
}
// звуки заставки
Object.assign(SFX, {
  cutTing() { const t = audio.ctx.currentTime + 0.01; tone(audio.sfxGain, 'sine', 2637, t, 0.35, 0.32, 2600); tone(audio.sfxGain, 'sine', 3951, t + 0.05, 0.4, 0.2, 3900); tone(audio.sfxGain, 'triangle', 1318, t, 0.2, 0.12); },
  cutPick() { melody('square', [['C6', 0.05], ['E6', 0.05], ['G6', 0.05], ['C7', 0.16]], 0.2); },
  cutBlipC() { tone(audio.sfxGain, 'square', 560 + Math.random() * 60, audio.ctx.currentTime + 0.01, 0.05, 0.1); },
  cutBlipB() { tone(audio.sfxGain, 'square', 260 + Math.random() * 40, audio.ctx.currentTime + 0.01, 0.06, 0.12); },
  cutWhoosh() { const t = audio.ctx.currentTime + 0.01; noiseHit(audio.sfxGain, t, 0.5, 0.2, 'bandpass', 1400); tone(audio.sfxGain, 'sawtooth', 280, t, 0.5, 0.1, 900); },
  cutCharge() { const t = audio.ctx.currentTime + 0.01; for (let i = 0; i < 18; i++) tone(audio.sfxGain, 'sawtooth', 180 * Math.pow(1.1, i), t + i * 0.045, 0.09, 0.11); tone(audio.sfxGain, 'sine', 120, t, 0.9, 0.2, 880); noiseHit(audio.sfxGain, t, 1.0, 0.1, 'highpass', 2500); },
  cutBoom() { const t = audio.ctx.currentTime + 0.01; noiseHit(audio.sfxGain, t, 0.9, 0.55, 'lowpass', 1100); tone(audio.sfxGain, 'sine', 90, t, 0.8, 0.5, 28); tone(audio.sfxGain, 'triangle', 1568, t + 0.05, 0.9, 0.2, 1500); tone(audio.sfxGain, 'triangle', 2093, t + 0.1, 0.9, 0.16, 2000); },
  cutThud() { const t = audio.ctx.currentTime + 0.01; tone(audio.sfxGain, 'triangle', 130, t, 0.14, 0.3, 60); noiseHit(audio.sfxGain, t, 0.08, 0.3, 'bandpass', 900); tone(audio.sfxGain, 'sine', 1800 + Math.random() * 600, t + 0.03, 0.12, 0.1); },
  cutDone() { melody('triangle', [['C5', 0.09], ['E5', 0.09], ['G5', 0.09], ['C6', 0.09], ['E6', 0.3]], 0.35); melody('square', [['C5', 0.09], ['E5', 0.09], ['G5', 0.09], ['C6', 0.09], ['E6', 0.3]], 0.1); },
  cutClick() { const t = audio.ctx.currentTime + 0.01; noiseHit(audio.sfxGain, t, 0.06, 0.4, 'bandpass', 2400); tone(audio.sfxGain, 'square', 900, t, 0.08, 0.2, 380); },
  cutChain(i) { tone(audio.sfxGain, 'triangle', noteFreq(['C5', 'E5', 'G5', 'C6'][i % 4]), audio.ctx.currentTime + 0.01, 0.2, 0.3); },
  cutWord(i) { melody('square', [[['G5', 'B5', 'D6'][i % 3], 0.07], [['C6', 'E6', 'G6'][i % 3], 0.14]], 0.2); },
  cutTock() {       // тік-так годинника: два трохи різні м'які удари (верхній і нижній), короткий клац і дзвінкий відгук
    const t = audio.ctx.currentTime + 0.01, hi = (audio._tock = (audio._tock || 0) + 1) % 2;
    tone(audio.sfxGain, 'sine', hi ? 1560 : 1040, t, 0.07, 0.14, hi ? 1180 : 760);
    tone(audio.sfxGain, 'triangle', hi ? 3120 : 2080, t, 0.025, 0.05);
    noiseHit(audio.sfxGain, t, 0.018, 0.16, 'highpass', 3200);
  },
  cutDoor() { const t = audio.ctx.currentTime + 0.01; tone(audio.sfxGain, 'sine', 880, t, 0.25, 0.2, 880); tone(audio.sfxGain, 'sine', 1175, t + 0.18, 0.4, 0.18, 1175); }
});
const CUT_EV = [[CT.ting1, 'cutTing'], [CT.ting2, 'cutTing'], [CT.pick, 'cutPick'], [CT.fly0, 'cutWhoosh'], [CT.charge, 'cutCharge'], [CT.flash, 'cutBoom'], [CT.asm1, 'cutDone'], [CT.fin + 0.4, 'cutDoor'],
  ...CUT_SAY.map(s => [s[0], s[2] === 'c' ? 'cutBlipC' : 'cutBlipB'])];
function cutFire(T) {
  if (cut.seek >= 0) return;                                                     // перегляд кадру (seek) — без звуків
  const fire = (te, name, arg) => { const key = te + name; if (!cut.fired[key] && T >= te) { cut.fired[key] = 1; playSfx(name, arg); } };
  CUT_EV.forEach(([te, n]) => fire(te, n));
  cutFireBuild(T);
  if (cut.tapAmb >= 0) {
    [[0, 'cutClick'], [0.05, 'cutWhoosh'], [0.75, 'cutPick']].forEach(([d, n]) => fire(CT.TW + d, n));
    for (let i = 0; i < 4; i++) { const te = CT.u0 + 0.2 + 0.6 * i; if (!cut.fired['ch' + i] && T >= te) { cut.fired['ch' + i] = 1; playSfx('cutChain', i); } }
    for (let i = 0; i < 3; i++) { const te = CT.u0 + 3.3 + 0.5 * i; if (!cut.fired['gr' + i] && T >= te) { cut.fired['gr' + i] = 1; playSfx('cutChain', i + 1); } }
    for (let i = 0; i < 3; i++) { const te = CT.u0 + 5.5 + 0.6 * i; if (!cut.fired['wd' + i] && T >= te) { cut.fired['wd' + i] = 1; playSfx('cutWord', i); } }
    if (!cut.fired.fan && T >= CT.u0 + 7.3) { cut.fired.fan = 1; playSfx('levelup'); }
    [[CT.fin + 2.2, 'cutBlipC'], [CT.fin + 3.4, 'cutBlipC'], [CT.fin + 5.3, 'cutBlipC']].forEach(([te, n]) => fire(te, n));
  }
}
function cutLayout() {
  const dpr = window.devicePixelRatio || 1, vwD = innerWidth * dpr, vhD = (innerHeight + (window.__gap || 0)) * dpr, Q = CUT_Q;
  let m = Math.min(vwD / (192 * Q), vhD / (216 * Q)); m = m >= 1 ? Math.floor(m) : m;      // низький екран (телефон горизонтально): дробовий масштаб, щоб усе влізло          // фізичних пікселів на піксель полотна: ціле число, тож картинка й текст чіткі
  let W = Math.ceil(vwD / (m * Q)), H = Math.ceil(vhD / (m * Q));      // з запасом, щоб картинка заповнювала весь екран (зайве обрізається по краях)
  W = Math.max(192, Math.min(W, 760)); H = Math.max(216, Math.min(H, 480));
  cut.W = W; cut.H = H; cut.S = m * Q / dpr;
  const cv = cut.cv; cv.width = W * Q; cv.height = H * Q; cv.style.width = (W * m * Q / dpr) + 'px'; cv.style.height = (H * m * Q / dpr) + 'px';
  ['wc', 'al'].forEach(k => { const c = cut[k] || (cut[k] = document.createElement('canvas')); c.width = W * Q; c.height = H * Q; });
  cut.wg = cut.wc.getContext('2d'); cut.ag = cut.al.getContext('2d'); cut.g = cv.getContext('2d');
  const hud = document.getElementById('hud'), cr = cv.getBoundingClientRect();
  cut.hudBu = hud && hud.getBoundingClientRect().height > 0 ? (hud.getBoundingClientRect().bottom - cr.top) / cut.S : 0;
}
function cutTick(now) {
  if (!cut.on) return;
  const dt = Math.min(0.1, (now - cut.t0) / 1000); cut.t0 = now; cut.amb += dt;
  if (cut.seek >= 0) cut.T = cut.seek;
  else {
    let lim = CT.END;
    if (cut.tapAmb < 0) lim = Math.min(lim, CT.TW);
    if (cut.g1 < 0) lim = Math.min(lim, CT.g1);
    if (cut.g2 < 0) lim = Math.min(lim, CT.g2);
    if (cut.goAmb < 0) lim = Math.min(lim, CT.finBtn);
    cut.T = Math.min(lim, cut.T + dt / CUT_SLOW * cutRate(cut.T));
  }
  cutFire(cut.T);
  try { cutDrawFrame(cut.T); } catch (e) { console.error('cutscene', e); }
  if (cut.goAmb >= 0 && cut.amb - cut.goAmb > 0.75 && cut.seek < 0) { cutStop(true); return; }
  cut.raf = requestAnimationFrame(cutTick);
}
function playCutscene(style, opts) {
  opts = opts || {}; cut.cb = null; cutStop(false);
  const box = document.getElementById('cutscene'); box.hidden = false; box.classList.remove('picking');
  cut.cv = document.getElementById('cutCv'); cut.style = CUT_STYLES[style] ? style : 'A'; cut.cb = opts.done || null;
  cut.fired = {}; cut.tapAmb = -1; cut.goAmb = -1; cut.T = (opts.seek !== undefined) ? 0 : -CUT_PRE; cut.amb = 0; cut.hit = null; cut.seek = opts.seek !== undefined ? opts.seek : -1;
  cut.g1 = cut.g2 = cut.chgAmb = -1; cut.chg = 0; cut.taps = []; cut.coinScr = null;
  if (opts.seek !== undefined || opts.tapped) { cut.g1 = cut.g2 = 0; cut.chg = CUT_CHG; }
  if (opts.tapped) cut.tapAmb = 0;
  if (opts.go) cut.goAmb = 0;
  document.getElementById('cutSkip').textContent = (CUT_TXT[state.lang] || CUT_TXT.uk).skip + ' ▶▶';
  try { if (typeof initAudio === 'function') initAudio(); } catch (e) { /* без звуку */ }
  cutLayout(); cutPrep(); cutHudMake();
  const go = () => { cut.on = true; cut.t0 = performance.now(); cut.raf = requestAnimationFrame(cutTick); };
  if (document.fonts && document.fonts.load) document.fonts.load('8px "Press Start 2P"').then(go, go); else go();
}
function cutHudMake() {
  cutHudKill(); const src = document.getElementById('hud'); if (!src) return; const r = src.getBoundingClientRect(); if (r.width < 4) return;
  const cl = src.cloneNode(true); cl.classList.add('cut-hud'); cl.style.cssText = 'position:fixed;z-index:4;margin:0;display:none;left:' + r.left + 'px;top:' + r.top + 'px;';
  const gm = cl.querySelector('#gems'); if (gm) gm.style.display = 'none'; const cp = cl.querySelector('#cps'); if (cp) cp.textContent = '0/' + (state.lang === 'en' ? 's' : 'с');
  const ic = cl.querySelector('#coinIcon'), oi = src.querySelector('#coinIcon'); if (ic && oi) ic.getContext('2d').drawImage(oi, 0, 0);
  document.getElementById('cutscene').appendChild(cl); cut.hudEl = cl; cut.hudN = -1;
}
function cutHudKill() { if (cut.hudEl) cut.hudEl.remove(); cut.hudEl = null; }
function cutStop(finished) {
  cutHudKill();
  cut.on = false; if (cut.raf) cancelAnimationFrame(cut.raf); cut.raf = 0;
  const box = document.getElementById('cutscene'); if (!box) return; box.hidden = true;
  const cb = cut.cb; cut.cb = null; if (cb && finished !== undefined) cb(!!finished);
}
function cutPicker() {
  const box = document.getElementById('cutscene'); box.hidden = false; box.classList.add('picking'); cut.on = false;
  document.getElementById('cutPick').hidden = false;
}
function cutAfter(ok) { if (ok) startMenuTour(() => cutPicker()); else cutPicker(); }
function cutSeenDevice(set) { try { if (set) localStorage.setItem('capyCutSeen', '1'); return localStorage.getItem('capyCutSeen') === '1'; } catch (e) { return false; } }
function startIntroCutscene(replay) {                             // нова гра: заставка, потім екскурсія по меню; з «Щоденника» — лише заставка (її можна пропустити)
  state.cutSeen = true; saveGame(); if (!replay) cutSeenDevice(true);
  playCutscene('B', { done: ok => { if (ok && !replay) startMenuTour(null); } });
}
function initCutscene() {
  const box = document.getElementById('cutscene'); if (!box) return;
  document.getElementById('cutSkip').addEventListener('click', e => { e.stopPropagation(); cutStop(true); });
  document.getElementById('cutClose').addEventListener('click', () => { document.getElementById('cutscene').hidden = true; });
  document.getElementById('cutPick').querySelectorAll('button[data-s]').forEach(b => b.addEventListener('click', () => { document.getElementById('cutPick').hidden = true; playCutscene(b.dataset.s, { done: ok => cutAfter(ok) }); }));
  box.addEventListener('pointerdown', e => {
    if (!cut.on) return;
    const r = cut.cv.getBoundingClientRect(), x = (e.clientX - r.left) / cut.S, y = (e.clientY - r.top) / cut.S;
    if (cutGateTap(x, y)) return;
    if (cut.tapAmb < 0 && cut.T >= CT.TW - 0.01 && cut.rect) { const q = cut.rect, pad = 14; if (x >= q[0] - pad && x <= q[0] + q[2] + pad && y >= q[1] - pad && y <= q[1] + q[3] + pad) { cut.tapAmb = cut.amb; cut.hit = [x, y]; } }
    else if (cut.goAmb < 0 && cut.btn) { const q = cut.btn; if (x >= q[0] - 6 && x <= q[0] + q[2] + 6 && y >= q[1] - 6 && y <= q[1] + q[3] + 6) cut.goAmb = cut.amb; }
  });
  addEventListener('keydown', e => { if (cut.on && e.key === 'Escape') cutStop(true); else if (cut.on && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); cutKeyTap(); } });
  addEventListener('resize', () => { if (cut.on) cutLayout(); });
  const q = new URLSearchParams(location.search);
  if (q.has('cutpick')) setTimeout(cutPicker, 900);
  else if (q.has('cut')) setTimeout(() => playCutscene(q.get('cut').toUpperCase(), { seek: q.has('seek') ? parseFloat(q.get('seek')) : undefined, tapped: q.has('tapped'), done: ok => cutAfter(ok) }), 900);
}

/* ====================== ЕКСКУРСІЯ ПО МЕНЮ ======================
   Після заставки: стрілка веде до кожної вкладки меню по черзі, гравець натискає на неї, а в куті стоять Мел і Ніка й пояснюють. */
const TOUR_IDS = ['shop', 'departments', 'team', 'story', 'skins', 'seasons', 'achievements', 'settings', 'news'];
const TOUR_TXT = {
  uk: { shop: ['m', 'Це «Магазин». Тут ти тапаєш, прокачуєш тап і розширюєш магазин. Натисни сюди!'], departments: ['n', '«Відділи» самі приносять монети, навіть коли ти не граєш. Тисни!'], team: ['m', 'У «Команді» наймаєш звірят-помічників. Кожен допомагає по-своєму.'],
    story: ['n', '«Щоденник»: глави історії та історії епох. Їх можна перечитати.'], skins: ['m', '«Скіни»: змінюй вигляд Капі, магазину й героїв за кристали.'], seasons: ['n', '«Пори року» і час доби. Замок відкриється після 2-ї епохи.'],
    achievements: ['m', '«Нагороди»: тут чекають призи за досягнення.'], settings: ['n', '«Налаштування»: мова, звук, перегляд епох та анімації.'], news: ['m', 'А це скринька розробників! Там новини про оновлення, а ще можна написати нам. Відкрий її!'], end: ['m', 'От і все! Тапай по магазину й розвивай його. Ми завжди поруч!'], endBtn: 'ГРАТИ!', skip: 'Пропустити тур' },
  en: { shop: ['m', 'This is the Shop. Tap, boost your tap and expand the shop here. Press it!'], departments: ['n', 'Departments earn coins by themselves, even when you are away. Press!'], team: ['m', 'In Team you hire animal helpers. Each one helps in their own way.'],
    story: ['n', 'Diary: story chapters and epoch stories. You can reread them.'], skins: ['m', 'Skins: change the look of Capy, the shop and heroes for crystals.'], seasons: ['n', 'Seasons and time of day. The lock opens after the 2nd epoch.'],
    achievements: ['m', 'Awards: prizes wait here for your achievements.'], settings: ['n', 'Settings: language, sound, epoch viewing and animations.'], news: ['m', 'And this is the developers mailbox! News about updates are there, and you can write to us. Open it!'], end: ['m', 'That is all! Tap the shop and grow it. We are always nearby!'], endBtn: 'PLAY!', skip: 'Skip tour' }
};
const tour = { on: false, i: 0, cb: null, timer: 0, btn: null, handler: null, talk: 0, news: false, wrapped: false };
function tourVisible(el) { return !!el && el.offsetParent !== null && el.getBoundingClientRect().width > 0; }
function startMenuTour(cb) {
  const box = document.getElementById('tour'); if (!box) { if (cb) cb(); return; }
  tourStop(false); tour.on = true; tour.i = 0; tour.cb = cb || null; tour.news = false;
  if (!tour.wrapped && typeof openNews === 'function') { tour.wrapped = true; const orig = openNews; openNews = function () { const r = orig.apply(this, arguments); if (tour.on && tour.news) { tour.news = false; setTimeout(() => { if (tour.on) { tour.i++; tourStep(); } }, 400); } return r; }; }
  ['tourMel', 'tourNika'].forEach((id, k) => { const cv = document.getElementById(id), hi = k ? cutHi('bunny_0', SPRITES.capy_nika.canvas) : cutHi('foxcub_0', SPRITES.capy_mel.canvas); cv.width = hi.width; cv.height = hi.height; cv.getContext('2d').drawImage(hi, 0, 0); });
  if (!(typeof mobileMQ !== 'undefined' && mobileMQ.matches) && !state.settings.panelOpen) { state.settings.panelOpen = true; try { applyPanel(); } catch (e) { /* не страшно */ } }
  box.hidden = false; document.getElementById('tourSkip').textContent = (TOUR_TXT[state.lang] || TOUR_TXT.uk).skip;
  tourStep(); tour.timer = setInterval(tourPlace, 120);
}
function tourStep() {
  const T = TOUR_TXT[state.lang] || TOUR_TXT.uk, id = TOUR_IDS[tour.i], bub = document.getElementById('tourBubble'), btnEnd = document.getElementById('tourGo');
  if (tour.btn && tour.handler) tour.btn.removeEventListener('click', tour.handler); tour.btn = null; tour.handler = null;
  if (!id) { const e = T.end; tourSay(e[0], e[1]); btnEnd.hidden = false; btnEnd.textContent = T.endBtn; document.getElementById('tourArrow').style.display = 'none'; document.getElementById('tourRing').style.display = 'none'; tourPlace(); return; }
  btnEnd.hidden = true; tour.news = false;
  if (id === 'news') { tour.news = true; try { panBy(newsBoxX() - (visL() + (visR() - visL()) * 0.3)); } catch (e) { /* на ПК видно все */ } tourSay(T.news[0], T.news[1]); document.getElementById('tourArrow').style.display = ''; document.getElementById('tourRing').style.display = ''; tourPlace(); return; }
  const b = ui.tabs.querySelector('.tab[data-tab="' + id + '"]');
  if (!b || b.hidden) { tour.i++; tourStep(); return; }
  tour.btn = b; tour.handler = () => { setTimeout(() => { if (tour.on && tour.btn === b) { tour.i++; tourStep(); } }, 350); }; b.addEventListener('click', tour.handler, { once: true });
  tourSay(T[id][0], T[id][1]); document.getElementById('tourArrow').style.display = ''; document.getElementById('tourRing').style.display = ''; tourPlace();
}
function tourSay(who, text) {
  const bub = document.getElementById('tourBubble'); document.getElementById('tourText').textContent = text; bub.dataset.who = who;
  document.getElementById('tourMel').classList.toggle('talk', who === 'm'); document.getElementById('tourNika').classList.toggle('talk', who === 'n'); playSfx('cutBlipC');
}
function tourPlace() {
  if (!tour.on) return;
  const sc = document.getElementById('scene').getBoundingClientRect(), chars = document.getElementById('tourChars'), bub = document.getElementById('tourBubble'), arrow = document.getElementById('tourArrow'), ring = document.getElementById('tourRing');
  const phone = typeof mobileMQ !== 'undefined' && mobileMQ.matches;
  let side = 'left', nr = null;
  if (tour.news) {                                                                                  // скринька розробників: герої стають з іншого боку, а репліка — над стрілкою, щоб нічого її не закривало
    const wr0 = ui.world.getBoundingClientRect(), sx = u => wr0.left + (u + view.offX) / view.w * wr0.width, sy = u => wr0.top + (u + view.offY) / view.h * wr0.height, x = newsBoxX(), y = mailRoadY();
    nr = { left: sx(x - 14), top: sy(y - 38), width: sx(x + 14) - sx(x - 14), height: sy(y + 3) - sy(y - 38) };
    side = nr.left + nr.width / 2 < sc.left + sc.width * 0.5 ? 'right' : 'left';
  }
  const edge = side === 'left' ? Math.round(sc.left + 8) + 'px' : Math.round(innerWidth - sc.right + 8) + 'px';
  chars.style.left = side === 'left' ? edge : 'auto'; chars.style.right = side === 'right' ? edge : 'auto'; chars.style.bottom = Math.max(8, Math.round(innerHeight - sc.bottom + 8)) + 'px';
  const ch = chars.getBoundingClientRect(), skp = document.getElementById('tourSkip'); bub.style.left = side === 'left' ? edge : 'auto'; bub.style.right = side === 'right' ? edge : 'auto'; bub.style.bottom = (nr ? Math.max(Math.round(innerHeight - nr.top + 56), Math.round(innerHeight - ch.top + 8)) : Math.round(innerHeight - ch.top + 8)) + 'px'; bub.style.maxWidth = Math.min(320, Math.round(innerWidth * (phone ? 0.84 : 0.4))) + 'px'; const br = bub.getBoundingClientRect(); skp.style.left = Math.round(br.left) + 'px'; skp.style.bottom = Math.round(innerHeight - br.top + 6) + 'px';
  if (arrow.style.display === 'none') return;
  let r;
  if (tour.news) r = nr;
  else { let target = tour.btn; if (!tourVisible(target)) target = (typeof ui !== 'undefined' && ui.tabMore && tourVisible(ui.tabMore)) ? ui.tabMore : target; if (!tourVisible(target)) return; r = target.getBoundingClientRect(); } ring.style.left = (r.left - 4) + 'px'; ring.style.top = (r.top - 4) + 'px'; ring.style.width = (r.width + 8) + 'px'; ring.style.height = (r.height + 8) + 'px';
  if (phone || tour.news) { arrow.style.setProperty('--rot', '90deg'); arrow.style.left = Math.round(r.left + r.width / 2 - 20) + 'px'; arrow.style.top = Math.round(r.top - 46) + 'px'; arrow.dataset.dir = 'down'; }
  else { arrow.style.setProperty('--rot', '0deg'); arrow.style.left = Math.round(r.left - 52) + 'px'; arrow.style.top = Math.round(r.top + r.height / 2 - 14) + 'px'; arrow.dataset.dir = 'right'; }
}
function tourStop(finished) {
  if (tour.timer) clearInterval(tour.timer); tour.timer = 0;
  if (tour.btn && tour.handler) tour.btn.removeEventListener('click', tour.handler); tour.btn = null; tour.handler = null;
  const was = tour.on; tour.on = false; const box = document.getElementById('tour'); if (box) box.hidden = true;
  const cb = tour.cb; tour.cb = null; if (was && cb && finished !== false) cb();
}
function initTour() {
  const go = document.getElementById('tourGo'), sk = document.getElementById('tourSkip'); if (!go) return;
  go.addEventListener('click', () => tourStop(true)); sk.addEventListener('click', () => tourStop(true));
  if (new URLSearchParams(location.search).has('tour')) setTimeout(() => startMenuTour(null), 1500);
}
/* PWA: службовий файл лише на сайті (https), щоб гру можна було поставити на екран і щоб вона запускалась без інтернету */
/* Діагностика екрана для телефона: 5 швидких дотиків по лічильнику монет показують розміри екрана й відступи (ще раз тицьни по тексту — зникне) */
window.addEventListener('load', () => {
  const hud = document.getElementById('hud'); if (!hud) return; let cnt = 0, last = 0;
  hud.addEventListener('click', () => { const now = Date.now(); cnt = now - last < 700 ? cnt + 1 : 1; last = now; if (cnt >= 5) { cnt = 0; capyDiag(); } });
});
function capyDiag() {
  let d = document.getElementById('capyDiag'); if (d) { d.remove(); return; }
  d = document.createElement('div'); d.id = 'capyDiag'; d.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483000;pointer-events:none';
  const pr = document.createElement('div'); pr.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'; document.body.appendChild(pr);
  const cs = getComputedStyle(pr), ins = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' / '); pr.remove();
  const vv = window.visualViewport, mm = q => matchMedia(q).matches ? 'так' : 'ні';
  const txt = ['inner ' + innerWidth + 'x' + innerHeight, 'outer ' + outerWidth + 'x' + outerHeight, 'screen ' + screen.width + 'x' + screen.height, 'visual ' + (vv ? Math.round(vv.width) + 'x' + Math.round(vv.height) : '-'), 'insets ' + ins, 'dpr ' + devicePixelRatio, 'gap ' + window.__gap, 'fit ' + (window.__fit || '-'),'standalone ' + navigator.standalone, 'display standalone ' + mm('(display-mode: standalone)'), 'fullscreen ' + mm('(display-mode: fullscreen)'), 'browser ' + mm('(display-mode: browser)')].join('\n');
  d.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;height:8px;background:#f00"></div><div style="position:absolute;left:0;right:0;bottom:0;height:8px;background:#00f"></div><div style="position:absolute;left:0;top:0;bottom:0;width:8px;background:#0a0"></div><div style="position:absolute;right:0;top:0;bottom:0;width:8px;background:#fa0"></div><pre style="position:absolute;left:14px;top:90px;margin:0;padding:8px;background:rgba(0,0,0,.85);color:#fff;font:12px/1.5 monospace;pointer-events:auto"></pre>';
  d.querySelector('pre').textContent = txt; d.querySelector('pre').addEventListener('click', () => d.remove()); document.body.appendChild(d);
}
if ('serviceWorker' in navigator && location.protocol === 'https:') window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
window.addEventListener('load', initCutscene); window.addEventListener('load', initTour);
function playSfx(name, ...args) {
  const ac = audio.ctx;
  if (!ac || ac.state !== 'running' || state.settings.muted || state.settings.sfxVol <= 0) return;
  try { SFX[name](...args); } catch (e) { /* звук ніколи не має ламати гру */ }
}
// Висота «друкування» залежить від того, хто говорить
function speakerPitch(sp) {
  let h = 0;
  for (let i = 0; i < sp.length; i++) h += sp.charCodeAt(i);
  return sp === 'narr' ? 330 : 360 + (h % 7) * 55;
}

/* ---------- Налаштування звуку (кнопка 🔊) ---------- */
function updateSoundUI() {
  const s = state.settings;
  ui.musicVol.value = Math.round(s.musicVol * 100);
  ui.sfxVol.value = Math.round(s.sfxVol * 100);
  ui.muteBtn.textContent = t(s.muted ? 'soundMuteOff' : 'soundMuteOn');
  if (!ui.musicStyleRow.children.length) {
    MUSIC_STYLES.forEach((st, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn' + (st.id === 'halloween' ? ' hw' : ''); b.dataset.style = i;
      b.addEventListener('click', () => { state.settings.musicStyle = i; updateMusic(); updateSoundUI(); saveGame(); });
      ui.musicStyleRow.appendChild(b);
    });
  }
  ui.musicStyleRow.querySelectorAll('button').forEach(b => { b.hidden = MUSIC_STYLES[b.dataset.style].id === 'halloween' && !halloweenStyleOk(); });
  ui.musicStyleRow.querySelectorAll('button').forEach(b => { b.textContent = t('musicStyle_' + MUSIC_STYLES[b.dataset.style].id); b.setAttribute('aria-pressed', String(Number(b.dataset.style) === (s.musicStyle | 0))); });
}
function setupSound() {
  parseMusic();
  // перший дотик/натискання вмикає звук (вимога браузерів); далі будить його, якщо він заснув
  ['pointerdown', 'pointerup', 'keydown', 'touchstart', 'touchend', 'click'].forEach(ev => document.addEventListener(ev, initAudio, { passive: true }));
  ui.soundClose.addEventListener('click', () => { ui.soundModal.hidden = true; saveGame(); });
  ui.soundModal.addEventListener('click', e => { if (e.target === ui.soundModal) { ui.soundModal.hidden = true; saveGame(); } });
  ui.musicVol.addEventListener('input', () => { state.settings.musicVol = ui.musicVol.value / 100; applyVolumes(); });
  ui.sfxVol.addEventListener('input', () => { state.settings.sfxVol = ui.sfxVol.value / 100; applyVolumes(); });
  ui.sfxVol.addEventListener('change', () => playSfx('tap'));
  ui.muteBtn.addEventListener('click', () => { state.settings.muted = !state.settings.muted; applyVolumes(); updateSoundUI(); saveGame(); });
  // неактивна вкладка — музика (і весь звук) завмирає, активна — продовжується
  document.addEventListener('visibilitychange', () => {
    if (!audio.ctx) return;
    if (document.hidden) audio.ctx.suspend(); else resumeAudio();
  });
  updateSoundUI();
}

