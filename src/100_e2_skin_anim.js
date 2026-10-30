//#part 100_e2_skin_anim.js
/* Оживлення скінів героїв (р. 73): лише скінований одяг, звичайні спрайти не чіпаємо.
   Кожен скін — SKIN_NF готових кадрів (ліниво, кеш-канвас), кадр = floor(animClock*4.5) % SKIN_NF: це копійки на кадр гри.
   Кадр 0 — «спокій» (тут усе як у нерухомого). Вимкнені анімації — завжди кадр 0, економний режим — удвічі рідше (лише парні кадри).
   Опис скіна: hat(рядки, f) — зміна капелюха (хитання, моргання каменів), paint(a, f) — зміна одягу поверх основного малюнка,
   shine — кольори, що відблискують косою смугою, glints — [x, y, кадр, колір?] іскорки-хрестики на тілі. */
const SKIN_NF = 10;
function skinAF() { return animOn() ? (ecoOn() ? (Math.floor(animClock * 2.25) * 2) % SKIN_NF : Math.floor(animClock * 4.5) % SKIN_NF) : 0; }
const sk_sw = f => Math.round(Math.sin(f / SKIN_NF * 6.2832) * 1.2);                // −1…1: хитання вліво-вправо
const sk_set = (rows, r, c, ch) => { const s = rows[r]; if (c >= 0 && c < s.length) rows[r] = s.slice(0, c) + ch + s.slice(c + 1); };
const sk_tip = (rows, r, s, ch, n = 2) => { rows[r] = '.'.repeat(7 + s) + ch.repeat(n) + '.'.repeat(Math.max(0, 9 - n - s)); };       // верхівка капелюха зсувається на s
const sk_on = (f, per, ph, len) => ((f + ph) % per) < len;                          // «ввімкнено» len кадрів із per
const SK_GOLD = ['#ffe08a', '#f2b84b', '#ffe27a', '#f2c230', '#ffe05a', '#f0b830', '#c9961c', '#e8b030', '#d9a53a'];
const SKIN_ANIM = {
  party: {
    hat: (h, f) => { sk_tip(h, 0, sk_sw(f), 'y'); if (sk_on(f, 4, 0, 2)) h[2] = h[2].replace(/T/g, 'y'); return h; },
    paint: (a, f) => { const cl = ['#ffe05a', '#5ad2f0', '#ffffff', '#ff9fd0']; [[5, 21], [8, 22], [11, 21], [6, 24], [10, 23], [13, 22], [7, 25], [12, 25]].forEach((p, i) => a.px(p[0], p[1], cl[(i + (f >> 1)) % 4], 1)); },
    glints: [[8, 20, 2, '#fff7b0'], [13, 24, 7, '#ffffff']]
  },
  ninja: {
    hat: (h, f) => { const s = sk_sw(f); if (s >= 0) sk_set(h, 3, 15, 'r'); if (s > 0) sk_set(h, 2, 15, 'r'); return h; },
    paint: (a, f) => { const s = sk_sw(f); if (s > 0) a.px(a.cx + 4, 26, '#d23a3a'); else if (s < 0) { a.px(a.cx + 3, 26, '#2b2b3d'); a.px(a.cx + 2, 26, '#d23a3a'); } },
    shine: ['#ffd860', '#d23a3a'], glints: [[8, 24, 3, '#fff2a0'], [4, 22, 8, '#c7c7ff']]
  },
  chef: {
    hat: (h, f) => { const s = sk_sw(f); h[0] = '.'.repeat(5 + s) + 'wwwwww' + '.'.repeat(5 - s); return h; },
    glints: [[7, 21, 1, '#bfe6ff'], [10, 23, 6, '#ffffff'], [6, 20, 4, '#ff9a9a']], shine: ['#d23a3a']
  },
  wizard: {
    hat: (h, f) => { if (sk_on(f, 10, 3, 2)) h[0] = '.......ww.......'; if (sk_on(f, 10, 6, 2)) sk_set(h, 2, 7, 'w'); return h; },
    paint: (a, f) => { [[6, 21], [11, 22], [8, 24], [13, 24], [5, 23]].forEach((p, i) => { const k = (f + i * 2) % SKIN_NF; a.px(p[0], p[1], k < 2 ? '#ffffff' : k > 6 ? '#c9a020' : '#ffe05a', 1); }); },
    shine: SK_GOLD, glints: [[11, 22, 1, '#fff7b0'], [6, 21, 6, '#ffffff']]
  },
  royal: {
    hat: (h, f) => { if (sk_on(f, 10, 0, 3)) sk_set(h, 2, 4, 'w'); if (sk_on(f, 10, 5, 3)) sk_set(h, 2, 11, 'w'); if (sk_on(f, 10, 2, 2)) sk_set(h, 0, 6, 'w'); return h; },
    shine: SK_GOLD, glints: [[8, 23, 3, '#fff7b0'], [9, 25, 8, '#ffffff']]
  },
  santa: {
    hat: (h, f) => { const s = sk_sw(f); sk_tip(h, 0, s, 'w'); if (s) sk_set(h, 1, 7 + s * 2, '.'); return h; },
    shine: ['#f0c030'], glints: [[5, 22, 1, '#d8f0ff'], [13, 24, 6, '#ffffff']]
  },
  witch: {
    hat: (h, f) => { sk_tip(h, 0, sk_sw(f), 'V'); return h; },
    paint: (a, f) => { const b = sk_on(f, 10, 0, 3), c = sk_on(f, 10, 5, 4); [[7, 21], [8, 21], [7, 22]].forEach(p => a.px(p[0], p[1], b ? '#fffbd0' : '#ffe05a', 1)); a.px(12, 24, c ? '#ffffff' : '#ffe05a', 1); },
    shine: ['#e8863c', '#ffe05a'], glints: [[12, 24, 5, '#ffffff'], [5, 21, 9, '#ffd0ff']]
  },
  gold: {
    hat: (h, f) => { [3, 6, 9, 12].forEach((c, i) => { if (sk_on(f, 10, i * 3, 2)) sk_set(h, 0, c, 'w'); }); return h; },
    paint: (a, f) => { const k = f % 5; a.px(a.cx - 1, 21, k === 0 ? '#ffffff' : k < 3 ? '#ff6a6a' : '#d23a3a', 1); a.px(a.cx, 21, '#d23a3a', 1); },
    shine: SK_GOLD, glints: [[5, 21, 2, '#ffffff'], [13, 23, 7, '#ffffff'], [8, 25, 4, '#fff7b0']]
  },
  diamond: {
    hat: (h, f) => { [3, 6, 9, 12].forEach((c, i) => { if (sk_on(f, 10, i * 3 + 1, 2)) sk_set(h, 0, c, 'w'); }); return h; },
    shine: ['#bdeeff', '#7fd6f0', '#58b8dc', '#e0f8ff', '#ffffff'], glints: [[6, 21, 0, '#ffffff'], [11, 23, 3, '#ffffff'], [8, 25, 6, '#ffffff'], [13, 21, 8, '#ffffff'], [9, 22, 5, '#ffffff']]
  },
  candy: {
    hat: (h, f) => { sk_tip(h, 0, sk_sw(f), 'r'); return h; },
    paint: (a, f) => {
      const sh = (f >> 1) % 4;
      for (let y = a.T0 + 1; y < a.H; y++) for (let x = 0; x < a.W; x++) a.px(x, y, (x + y + sh) % 4 < 2 ? '#e5384f' : '#fff4f4');
      for (let x = a.a(a.T0); x <= a.b(a.T0); x++) a.px(x, a.T0, (x + (f >> 2)) % 2 ? '#ff9fb8' : '#fff4f4');
      a.row(23, '#ff7aa0', 0); a.px(a.cx - 1, 23, '#ffd860', 1); a.px(a.cx, 23, '#ffd860', 1); a.row(25, '#ff9fb8', 0);
    },
    shine: ['#ffd860'], glints: [[8, 23, 4, '#ffffff']]
  },
  sand: {
    hat: (h, f) => { if (sk_on(f, 10, 0, 3)) h[2] = h[2].replace('rr', 'yy'); return h; },
    shine: SK_GOLD, glints: [[9, 23, 2, '#fff7b0'], [7, 21, 7, '#ffffff']]
  },
  moss: {
    hat: (h, f) => { h[0] = h[0].replace(/ff/, sk_on(f, 10, 0, 5) ? 'yy' : 'ff'); const s = sk_sw(f); if (s) { sk_set(h, 0, 5, s > 0 ? '.' : 'g'); sk_set(h, 0, 11, s > 0 ? 'g' : '.'); } return h; },
    paint: (a, f) => { a.px(7, 23, sk_on(f, 10, 0, 5) ? '#ff9fb8' : '#ffe05a', 1); a.px(11, 23, sk_on(f, 10, 0, 5) ? '#ffe05a' : '#ff9fb8', 1); },
    glints: [[5, 22, 1, '#f6ff9a'], [13, 25, 5, '#f6ff9a'], [10, 20, 8, '#f6ff9a']]
  },
  brick: {
    hat: (h, f) => { if (sk_on(f, 10, 0, 2)) sk_set(h, 1, 7, 'y'); return h; },
    shine: ['#f3f19a', '#ffe08a'], glints: [[5, 22, 2, '#ffffff'], [12, 24, 7, '#ffffff']]
  },
  wood: {
    hat: (h, f) => { const s = sk_sw(f); if (s) h[0] = '.'.repeat(6 + s) + 'oooo' + '.'.repeat(6 - s); return h; },
    shine: ['#ffd860'], glints: [[6, 22, 3, '#ffe9b0'], [11, 20, 8, '#ffffff']]
  }
};
// Післяобробка готового кадру: коса смуга відблиску по кольорах shine та іскорки-хрестики
function skinPost(c, an, f, base) {
  const g = c.getContext('2d'), W = c.width, H = c.height;
  if (an.shine) {
    const id = g.getImageData(0, 0, W, H), d = id.data, b0 = base.getContext('2d').getImageData(0, 0, W, H).data, cols = an.shine.map(outRGB), band = 12 + f * 3.4;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (Math.abs(x + y - band) > 1.3) continue;
      const i = (y * W + x) * 4; if (d[i + 3] < 200 || (d[i] === b0[i] && d[i + 1] === b0[i + 1] && d[i + 2] === b0[i + 2])) continue;       // лише одяг, обличчя й шерсть не блищать
      if (cols.some(k => Math.abs(k[0] - d[i]) + Math.abs(k[1] - d[i + 1]) + Math.abs(k[2] - d[i + 2]) < 70)) { d[i] += (255 - d[i]) * 0.62; d[i + 1] += (255 - d[i + 1]) * 0.62; d[i + 2] += (255 - d[i + 2]) * 0.62; }
    }
    g.putImageData(id, 0, 0);
  }
  if (an.glints) {
    const al = (x, y) => x >= 0 && y >= 0 && x < W && y < H && g.getImageData(x, y, 1, 1).data[3] > 200;
    an.glints.forEach(([x, y, f0, col]) => {
      const k = (f - f0 + SKIN_NF) % SKIN_NF; if (k > 2 || !al(x, y)) return;
      g.fillStyle = col || '#ffffff'; g.fillRect(x, y, 1, 1);
      if (k === 1) { g.globalAlpha = 0.85; [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => { if (al(x + dx, y + dy)) g.fillRect(x + dx, y + dy, 1, 1); }); g.globalAlpha = 1; }
    });
  }
  return c;
}
// Герой або покупець у скіні, кадр анімації f (0 — спокій)
function skinAnimDress(id, kind, f, base) {
  const an = f ? SKIN_ANIM[kind] : null, of = TEAM_OUTFITS[kind], hat = TEAM_SKIN_HATS[kind];
  const bs = base || teamBaseCanvas(id), c = dressHero(id, {
    base: bs,
    hat: an && an.hat ? an.hat(hat.slice(), f) : hat,
    outfit: an && an.paint ? Object.assign({}, of, { paint: a => { of.paint(a); an.paint(a, f); } }) : of
  });
  return an ? skinPost(c, an, f, bs) : c;
}
(function () {
  const lazy = (name, make) => { SPRITES[name] = { get canvas() { delete this.canvas; return (this.canvas = make()); } }; };
  TEAM.forEach(m => Object.keys(SKIN_ANIM).forEach(kind => { for (let f = 1; f < SKIN_NF; f++) lazy('team_' + m.id + '_sk_' + kind + '~' + f, () => skinAnimDress(m.id, kind, f)); }));
})();
