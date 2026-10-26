//#part 279_e_bonus_bg.js
/* =====================================================================
   ФОН ВІКНА БОНУСІВ (р. 69): живе піксельне свято за вмістом вікна (рулетка, відьма, лапша, бонус-ігри).
   Шари: градієнт з дизерингом (кешується) → повільні промені → гірлянда прапорців угорі → мерехтливі зірочки →
   подарунки/монетки спливають знизу → конфеті чи пелюстки падають згори. Кожна фігурка з 1px контуром.
   Тема: Японія (лапша, гра епохи 8) — рожева з пелюстками й ліхтариками; відьма й Хелловін — бузкова з гарбузиками й кажанами; решта — блакитна.
   Полотно в низькій роздільності (1 піксель = BBG_P CSS px) лежить під вмістом; малюється лише поки вікно відкрите (виклик з 230_a2).
   ===================================================================== */
const BBG_P = 3;
const BBG_THEMES = {
  sky:   { top: '#bfe1f7', bot: '#eef8ff', ray: '#ffffff', flags: ['#e8503a', '#ffd23f', '#4fb36a', '#4a8fe0', '#c86ad8'], rise: ['gift', 'coin', 'gift', 'balloon'], fall: 'confetti', conf: ['#e8503a', '#ffd23f', '#4fb36a', '#4a8fe0', '#c86ad8', '#ffffff'] },
  japan: { top: '#f6cddb', bot: '#fff2f6', ray: '#ffffff', flags: ['#e0405a', '#ffffff', '#f7a8c0', '#ffd23f'], rise: ['lantern', 'coin', 'lantern'], fall: 'petal', conf: ['#f7a8c0', '#ffc8d8', '#ffffff', '#f088a8'] },
  witch: { top: '#d6c6ee', bot: '#f4eefc', ray: '#fff6d8', flags: ['#ff8c2a', '#7a4fb0', '#3a2a50', '#9be05a'], rise: ['pumpkin', 'bat', 'pumpkin'], fall: 'confetti', conf: ['#ff8c2a', '#ffd23f', '#9be05a', '#b07ae0'] }
};
// фігурки: рядки пікселів; літери — кольори з палітри фігурки (r — колір тіла, підставляється)
const BBG_ART = {
  gift:    { pal: { b: 'r', y: '#ffd23f', h: '#fff3a0' }, f: [['.y.y.', '..y..', 'bbybb', 'bbybb', 'yyhyy', 'bbybb', 'bbybb']] },
  coin:    { pal: { o: '#c97a10', y: '#ffd23f', w: '#fff6c0' }, f: [['.ooo.', 'oyyyo', 'oywyo', 'oyyyo', '.ooo.'], ['.o.', 'oyo', 'owo', 'oyo', '.o.'], ['o', 'y', 'w', 'y', 'o'], ['.o.', 'oyo', 'owo', 'oyo', '.o.']] },
  balloon: { pal: { b: 'r', w: '#ffffff', s: '#7a6a60' }, f: [['.bbb.', 'bwbbb', 'bbbbb', 'bbbbb', '.bbb.', '..b..', '..s..', '...s.', '..s..']] },
  lantern: { pal: { k: '#5a2a20', r: '#e0405a', y: '#ffd23f', l: '#ff8a9a' }, f: [['..k..', '.rrr.', 'rlyrr', 'rlyrr', 'rlyrr', '.rrr.', '..y..']] },
  pumpkin: { pal: { g: '#4f9a3a', o: '#ff8c2a', d: '#d0601a', k: '#3a2410' }, f: [['...g...', '.oodoo.', 'okodoko', 'oododoo', 'odkkkdo', '.oodoo.']] },
  bat:     { pal: { k: '#3a2a50', e: '#ffd23f' }, f: [['k.....k', 'kk.k.kk', '.kkekk.'], ['...k...', '.kkekk.', 'k.....k']] },
  star:    { pal: { w: '#ffffff', y: '#ffd23f' }, f: [['..w..', '.wyw.', 'wyyyw', '.wyw.', '..w..'], ['.w.', 'wyw', '.w.'], ['w']] }
};
const bbg = { cv: null, g: null, base: null, key: '', w: 0, h: 0, t: 0, last: 0, acc: 0, theme: '', parts: [], stars: [], seed: 1 };
function bbgShade(hex, k) {                                              // темніший відтінок для контуру
  const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c * k)));
  return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
}
function bbgMix(a, b, k) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), m = s => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k);
  return 'rgb(' + m(16) + ',' + m(8) + ',' + m(0) + ')';
}
function bbgThemeId() {
  if (circus.bonus) { const d = circus.bonusDef || {}; return d.eid === 8 ? 'japan' : d.eid === 9 ? 'witch' : 'sky'; }
  return state.circus.noodle ? 'japan' : state.circus.hag ? 'witch' : 'sky';
}
// одна фігурка з 1px контуром: спершу темна тінь у 4 боки, потім кольори
function bbgSprite(g, name, frame, x, y, body, alpha) {
  const A = BBG_ART[name], rows = A.f[frame % A.f.length], ox = Math.round(x - rows[0].length / 2), oy = Math.round(y - rows.length / 2);
  const col = ch => { const c = A.pal[ch]; return c === 'r' ? body : c; };
  const outline = bbgShade(body || col(Object.keys(A.pal).find(k => A.pal[k] !== '#ffffff')) || '#888888', 0.55);
  g.globalAlpha = alpha * 0.85; g.fillStyle = name === 'bat' ? 'rgba(255,255,255,.55)' : outline;
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') { g.fillRect(ox + i - 1, oy + j, 1, 1); g.fillRect(ox + i + 1, oy + j, 1, 1); g.fillRect(ox + i, oy + j - 1, 1, 1); g.fillRect(ox + i, oy + j + 1, 1, 1); } });
  g.globalAlpha = alpha;
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') { g.fillStyle = col(r[i]); g.fillRect(ox + i, oy + j, 1, 1); } });
  g.globalAlpha = 1;
}
function bbgRand() { bbg.seed = (bbg.seed * 16807) % 2147483647; return bbg.seed / 2147483647; }
function bbgSpawn(kind, T, fresh) {
  const W = bbg.w, H = bbg.h, r = bbgRand;
  if (kind === 'rise') {
    const name = T.rise[Math.floor(r() * T.rise.length)];
    return { kind, name, x: 6 + r() * (W - 12), y: fresh ? r() * H : H + 8, v: 5 + r() * 6, sw: 1.5 + r() * 2.5, ph: r() * 6.3, body: T.flags[Math.floor(r() * T.flags.length)], fr: Math.floor(r() * 4) };
  }
  return { kind, x: r() * W, y: fresh ? r() * H : -3, v: 9 + r() * 10, sw: 2 + r() * 4, ph: r() * 6.3, c: T.conf[Math.floor(r() * T.conf.length)], fl: r() * 6.3 };
}
function bbgReset(T) {
  const area = bbg.w * bbg.h;
  bbg.parts = [];
  const nr = Math.max(4, Math.min(10, Math.round(area / 4200))), nf = Math.max(10, Math.min(26, Math.round(area / 1700)));
  for (let i = 0; i < nr; i++) bbg.parts.push(bbgSpawn('rise', T, true));
  for (let i = 0; i < nf; i++) bbg.parts.push(bbgSpawn('fall', T, true));
  bbg.stars = Array.from({ length: Math.max(5, Math.round(area / 3500)) }, () => ({ x: 4 + bbgRand() * (bbg.w - 8), y: 10 + bbgRand() * (bbg.h - 16), ph: bbgRand() * 6.3, sp: 0.6 + bbgRand() * 0.8 }));
}
// градієнт з дизерингом між смугами — кешується, поки не зміниться розмір чи тема
function bbgBase(T) {
  const c = document.createElement('canvas'); c.width = bbg.w; c.height = bbg.h;
  const g = c.getContext('2d'), N = 6, bh = bbg.h / N;
  for (let b = 0; b < N; b++) { g.fillStyle = bbgMix(T.top, T.bot, b / (N - 1)); g.fillRect(0, Math.floor(b * bh), bbg.w, Math.ceil(bh) + 1); }
  for (let b = 1; b < N; b++) {                                           // шахові пікселі на межі смуг
    const y = Math.floor(b * bh); g.fillStyle = bbgMix(T.top, T.bot, (b - 1) / (N - 1));
    for (let x = 0; x < bbg.w; x += 2) { g.fillRect(x, y, 1, 1); g.fillRect(x + 1, y + 1, 1, 1); }
  }
  g.fillStyle = 'rgba(74,50,40,.10)'; g.fillRect(0, bbg.h - 3, bbg.w, 3);   // тінь знизу, як у рамки
  return c;
}
function bbgEnsure(box) {
  if (!bbg.cv) {
    bbg.cv = document.createElement('canvas'); bbg.cv.className = 'bonus-bg'; bbg.cv.setAttribute('aria-hidden', 'true');
    bbg.g = bbg.cv.getContext('2d');
    box.addEventListener('scroll', () => { bbg.cv.style.top = (box.scrollTop + 8) + 'px'; }, { passive: true });
  }
  if (bbg.cv.parentNode !== box) box.insertBefore(bbg.cv, box.firstChild);
  const cw = Math.max(8, box.clientWidth - 16), ch = Math.max(8, box.clientHeight - 16);
  const w = Math.ceil(cw / BBG_P), h = Math.ceil(ch / BBG_P), th = bbgThemeId();
  if (w !== bbg.w || h !== bbg.h || th !== bbg.theme) {
    const resized = w !== bbg.w || h !== bbg.h || th !== bbg.theme;
    bbg.w = w; bbg.h = h; bbg.theme = th; bbg.cv.width = w; bbg.cv.height = h;
    bbg.cv.style.width = (w * BBG_P) + 'px'; bbg.cv.style.height = (h * BBG_P) + 'px';
    bbg.base = bbgBase(BBG_THEMES[th]);
    if (resized) bbgReset(BBG_THEMES[th]);
  }
  bbg.cv.style.top = (box.scrollTop + 8) + 'px';
}
function bbgDraw(dt) {
  const T = BBG_THEMES[bbg.theme], g = bbg.g, W = bbg.w, H = bbg.h, t = bbg.t;
  g.imageSmoothingEnabled = false;
  g.drawImage(bbg.base, 0, 0);
  // промені з-під заголовка, повільно обертаються
  const cx = W / 2, cy = H * 0.3, R = Math.max(W, H) * 1.2, n = 12, a0 = t * 0.12;
  g.fillStyle = T.ray; g.globalAlpha = 0.22;
  for (let i = 0; i < n; i++) { const a = a0 + i * Math.PI * 2 / n; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a + 0.2) * R, cy + Math.sin(a + 0.2) * R); g.closePath(); g.fill(); }
  g.globalAlpha = 1;
  // зірочки мерехтять
  bbg.stars.forEach(s => { const k = Math.sin(t * s.sp * 2 + s.ph); if (k > 0.2) bbgSprite(g, 'star', k > 0.85 ? 0 : k > 0.55 ? 1 : 2, s.x, s.y, '#ffd23f', 0.75); });
  // фігурки й конфеті
  bbg.parts.forEach((p, i) => {
    if (p.kind === 'rise') {
      p.y -= p.v * dt;
      const x = p.x + Math.sin(t * 0.9 + p.ph) * p.sw;
      const fr = p.name === 'coin' ? Math.floor(t * 6 + p.ph) : p.name === 'bat' ? Math.floor(t * 5 + p.ph) : 0;
      bbgSprite(g, p.name, fr, x, p.y + (p.name === 'bat' ? Math.sin(t * 3 + p.ph) * 2 : 0), p.body, 0.7);
      if (p.y < -10) bbg.parts[i] = bbgSpawn('rise', T, false);
    } else {
      p.y += p.v * dt; p.fl += dt * 5;
      const x = Math.round(p.x + Math.sin(t * 1.3 + p.ph) * p.sw), y = Math.round(p.y);
      g.globalAlpha = 0.85; g.fillStyle = p.c;
      if (T.fall === 'petal') { const f = Math.floor(p.fl) % 3; if (f === 0) g.fillRect(x, y, 2, 1); else if (f === 1) { g.fillRect(x, y, 1, 1); g.fillRect(x + 1, y + 1, 1, 1); } else g.fillRect(x, y, 1, 2); g.fillStyle = '#ffffff'; g.globalAlpha = 0.5; g.fillRect(x, y, 1, 1); }
      else if (Math.sin(p.fl) > 0) g.fillRect(x, y, 2, 1); else g.fillRect(x, y, 1, 2);
      g.globalAlpha = 1;
      if (p.y > H + 3) bbg.parts[i] = bbgSpawn('fall', T, false);
    }
  });
  // гірлянда прапорців угорі: дві провислі дуги, прапорці гойдаються
  const sag = 2, step = 6;
  for (let x = 0; x < W; x++) { const u = (x % (W / 2)) / (W / 2); g.fillStyle = '#7a5a48'; g.fillRect(x, 1 + Math.round(Math.sin(u * Math.PI) * sag), 1, 1); }
  for (let k = 0, x = 3; x < W - 2; x += step, k++) {
    const u = (x % (W / 2)) / (W / 2), y = 2 + Math.round(Math.sin(u * Math.PI) * sag), c = T.flags[k % T.flags.length], sw = Math.round(Math.sin(t * 2.2 + k * 0.9) * 0.8);
    g.fillStyle = bbgShade(c, 0.6); g.fillRect(x - 3, y, 7, 1); g.fillRect(x - 2 + sw, y + 3, 5, 1); g.fillRect(x - 1 + sw, y + 4, 3, 1); g.fillRect(x + sw, y + 5, 1, 1);
    g.fillStyle = c; g.fillRect(x - 2, y, 5, 1); g.fillRect(x - 2 + Math.round(sw / 2), y + 1, 5, 1); g.fillRect(x - 1 + sw, y + 2, 3, 1); g.fillRect(x - 1 + sw, y + 3, 3, 1); g.fillRect(x + sw, y + 4, 1, 1);
    g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(x - 2, y, 1, 1);
  }
}
// виклик щокадру з оновлення вікна (230_a2): ~30 кадрів/с, лише коли вікно відкрите
function drawBonusBg(dt) {
  const box = ui.circusModal.querySelector('.modal-box'); if (!box) return;
  bbgEnsure(box);
  bbg.acc += dt; bbg.t += dt;
  if (bbg.acc < 1 / 30) return;
  const d = Math.min(0.1, bbg.acc); bbg.acc = 0;
  bbgDraw(d);
}
