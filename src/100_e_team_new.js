//#part 100_e_team_new.js
/* Герої команди в стилі покупців і скіна Ніки (р. 72): тіло — спрайт покупця того ж виду (18×23, м'яке затінення, живі мордочки),
   зверху одяг епохи або скіна: капелюх над головою, светр/жилет на тулубі. Обличчя не закриваємо. Спрайти малюються ліниво, при першому зверненні. */
const TEAM_SPECIES = { spike: 'hedgehog', bodya: 'squirrel', zoya: 'bunny', tonya: 'frog', mikhas: 'dog', sonia: 'chick', kria: 'duck', zhuzha: 'frog', leo: 'foxcub', pao: 'sheep', murzyk: 'cat', toma: 'koala', shnyr: 'raccoon', nara: 'deer' };
const TEAM_TINT = { tonya: [-38, 0.75, -0.12], sonia: [-24, 0.7, -0.2] };        // [зсув відтінку °, насиченість ×, світлість ±]: черепаха — оливкова, сова — коричнева
function tintCanvas(src, ht) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const id = g.getImageData(0, 0, c.width, c.height), d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l0 = (mx + mn) / 2, dl = mx - mn;
    let h = 0, s = 0;
    if (dl) { s = dl / (1 - Math.abs(2 * l0 - 1)); h = mx === r ? ((gg - b) / dl) % 6 : mx === gg ? (b - r) / dl + 2 : (r - gg) / dl + 4; h *= 60; if (h < 0) h += 360; }
    h = (h + ht[0] + 360) % 360; s = Math.min(1, s * ht[1]); const l = Math.max(0, Math.min(1, l0 + ht[2]));
    const cc = (1 - Math.abs(2 * l - 1)) * s, x = cc * (1 - Math.abs((h / 60) % 2 - 1)), m = l - cc / 2;
    const [r1, g1, b1] = h < 60 ? [cc, x, 0] : h < 120 ? [x, cc, 0] : h < 180 ? [0, cc, x] : h < 240 ? [0, x, cc] : h < 300 ? [x, 0, cc] : [cc, 0, x];
    d[i] = Math.round((r1 + m) * 255); d[i + 1] = Math.round((g1 + m) * 255); d[i + 2] = Math.round((b1 + m) * 255);
  }
  g.putImageData(id, 0, 0); return c;
}
const TEAM_PAD = 4;                                                 // запас над головою для капелюхів: усі спрайти героїв 18×27, ноги внизу
const teamBaseCache = {};
function teamBaseCanvas(id) {
  if (teamBaseCache[id]) return teamBaseCache[id];
  const src0 = SPRITES[TEAM_SPECIES[id] + '_0'].canvas, ht = TEAM_TINT[id], src = ht ? tintCanvas(src0, ht) : src0;
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height + TEAM_PAD;
  c.getContext('2d').drawImage(src, 0, TEAM_PAD);
  return (teamBaseCache[id] = c);
}
// Одяг скіна на ВСЕ тіло під головою (р. 73): колір ставимо по силуету звірка, світло/тінь/облямівку рахуємо від краю силуету.
const outRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const outMix = (a, b, t) => { const A = outRGB(a), B = outRGB(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const outTone = (h, t) => t <= -2 ? outMix(h, '#24151c', 0.62) : t === -1 ? outMix(h, '#3a2450', 0.26) : t === 1 ? outMix(h, '#ffffff', 0.28) : h;      // −2 контур, −1 тінь, 0 основа, 1 світло
// ot: { c: основний колір, paint(api): візерунок і деталі }; api: row(y,hex,від,до), px(x,y,hex,плоско), a(y)/b(y) — межі силуету в ряду, T0, cx
function paintOutfit(g, solid, ext, W, H, ot) {
  const T0 = 20, cx = W >> 1, key = {}, flat = {}, ex = {}, col = ch => PALETTE[ch] || ch;
  for (let y = T0; y < H; y++) ex[y] = ext(y);
  const inb = (x, y) => y >= T0 && y < H && solid(x, y) && x >= (y >= 25 ? 3 : 4) && x <= (y >= 25 ? W - 3 : W - 4);       // хвіст і вуха за межами тулуба лишаються рідними
  const api = { T0, cx, W, H, a: y => ex[y][0], b: y => ex[y][1],
    px: (x, y, h, f) => { if (inb(x, y)) { key[x + ',' + y] = col(h); if (f) flat[x + ',' + y] = 1; } },
    row: (y, h, i0 = 0, i1 = i0) => { if (ex[y][0] < 0) return; for (let x = ex[y][0] + i0; x <= ex[y][1] - i1; x++) api.px(x, y, h); } };
  if (ot.c) for (let y = T0; y < H; y++) for (let x = 0; x < W; x++) if (inb(x, y)) key[x + ',' + y] = col(ot.c);       // без c — лише окремі деталі (краватка, зірка)
  ot.paint(api);
  const rim = (x, y) => inb(x, y) && (!inb(x - 1, y) || !inb(x + 1, y) || !inb(x, y + 1) || (y > T0 && !inb(x, y - 1)));
  for (let y = T0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inb(x, y)) continue;
    const k = x + ',' + y; if (!(k in key)) continue;
    const t = rim(x, y) ? -2 : flat[k] ? 0 : y === T0 ? -1 : (rim(x + 1, y) || rim(x, y + 1)) ? -1 : (rim(x - 1, y) || rim(x, y - 1)) ? 1 : 0;
    g.fillStyle = outTone(key[k], t); g.fillRect(x, y, 1, 1);
  }
}
// капелюх зі скіна: той самий малюнок, але з облямівкою по краях і тінню знизу, щоб читався об'ємним
function paintHat(g, rows, x0, y0) {
  const col = ch => PALETTE[ch] || ch, has = {};
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') has[(x0 + i) + ',' + (y0 + j)] = r[i]; });
  const h = (x, y) => has[x + ',' + y];
  Object.keys(has).forEach(k => {
    const [x, y] = k.split(',').map(Number), c = col(has[k]);
    const t = (!h(x - 1, y) || !h(x + 1, y) || !h(x, y - 1)) ? -2 : !h(x, y + 1) ? -1 : (!h(x - 1, y - 1) || !h(x, y - 2) ? 1 : 0);
    g.fillStyle = outTone(c, t); g.fillRect(x, y, 1, 1);
  });
}
// o: { hat: [4 рядки 16 символів] | 'headphones' | 'bubble' | 'hood' | null, b, l, c, d (тулуб: колір, обшивка, акцент, прикраса), pat: [5 рядків по 8], outfit: опис одягу на все тіло }
function dressHero(id, o) {
  const base = teamBaseCanvas(id), W = base.width, H = base.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(base, 0, 0);
  const px = g.getImageData(0, 0, W, H).data, solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && px[(y * W + x) * 4 + 3] > 128;
  const ext = y => { let a = -1, b = -1; for (let x = 0; x < W; x++) if (solid(x, y)) { if (a < 0) a = x; b = x; } return [a, b]; };
  const col = ch => PALETTE[ch] || ch, put = (x, y, ch) => { g.fillStyle = col(ch); g.fillRect(x, y, 1, 1); };
  let y0 = 0; for (; y0 < H; y0++) { let run = 0, best = 0; for (let x = 0; x < W; x++) { run = solid(x, y0) ? run + 1 : 0; if (run > best) best = run; } if (best >= 8) break; }       // верх голови: перший рядок із суцільною смугою ≥ 8 (вуха не рахуємо)
  // тулуб: светр/жилет по силуету
  const T0 = 16 + TEAM_PAD, T1 = 21 + TEAM_PAD;
  if (o.outfit) paintOutfit(g, solid, ext, W, H, o.outfit);
  else if (o.b || o.pat) {
    for (let y = T0; y <= T1; y++) {
      const [a, b] = ext(y); if (a < 0) continue;
      for (let x = a + 2; x <= b - 2; x++) {
        let ch = o.b;
        if (o.pat) { const px0 = x - 5, py0 = y - T0; ch = (px0 >= 0 && px0 < 8 && py0 < 5) ? o.pat[py0][px0] : o.pat[Math.min(4, py0)][px0 < 0 ? 0 : 7]; }
        put(x, y, ch);
      }
    }
    if (!o.pat) {
      const accent = o.c || 'w', cx = W >> 1;
      if (o.l) for (let x = 0; x < W; x++) if (solid(x, T1) && x > 1) put(x, T1, o.l);
      if (o.d === 'stripes') { [T0 + 2, T0 + 4].forEach(y => { const [a, b] = ext(y); for (let x = a + 2; x <= b - 2; x++) put(x, y, accent); }); }
      else if (o.d === 'belt') { const [a, b] = ext(T0 + 4); for (let x = a + 2; x <= b - 2; x++) put(x, T0 + 4, accent); put(cx - 1, T0 + 4, 'y'); put(cx, T0 + 4, 'y'); }
      else if (o.d === 'buttons') { [T0 + 1, T0 + 3].forEach(y => { put(cx - 1, y, accent); put(cx, y, accent); }); }
      else if (o.d === 'collar') { put(cx - 3, T0, accent); put(cx - 2, T0, accent); put(cx - 1, T0 + 1, accent); put(cx, T0 + 1, accent); put(cx + 1, T0, accent); put(cx + 2, T0, accent); }
      else if (o.d === 'scarf') { const [a, b] = ext(T0 - 1); for (let x = a + 1; x <= b - 1; x++) put(x, T0 - 1, accent); for (let x = a + 2; x <= b - 2; x++) put(x, T0, accent); put(cx + 2, T0 + 1, accent); put(cx + 2, T0 + 2, accent); put(cx + 3, T0 + 2, accent); }
      else if (o.d === 'bow') { put(cx - 2, T0, accent); put(cx - 1, T0, accent); put(cx, T0, accent); put(cx + 1, T0, accent); put(cx - 1, T0 - 1, accent); put(cx, T0 - 1, accent); }
      else if (o.d === 'dots') { [[5, 1], [8, 3], [11, 1], [6, 4], [10, 4], [13, 3]].forEach(([dx, dy]) => { if (solid(dx, T0 + dy)) put(dx, T0 + dy, accent); }); }
      else if (o.d === 'pocket') { for (let x = cx - 4; x <= cx - 2; x++) put(x, T0 + 3, accent); put(cx - 4, T0 + 2, accent); put(cx - 3, T0 + 2, accent); }
    }
    g.globalAlpha = 0.14; g.fillStyle = '#1e140f'; for (let y = T1 - 1; y <= T1; y++) { const [a, b] = ext(y); for (let x = a + 2; x <= b - 2; x++) g.fillRect(x, y, 1, 1); } g.globalAlpha = 1;        // легка тінь внизу
  }
  // головний убір: стоїть на голові, обличчя не закриває
  const hy = y0 - 4;
  if (Array.isArray(o.hat) && o.outfit) paintHat(g, o.hat, 1, hy);
  else if (Array.isArray(o.hat)) o.hat.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') put(1 + i, hy + j, r[i]); });
  else if (o.hat === 'headphones') {
    for (let x = 4; x <= 13; x++) put(x, y0 - 1, 'k');
    [[3, y0], [14, y0], [2, y0 + 1], [15, y0 + 1]].forEach(([x, y]) => put(x, y, 'k'));
    for (let y = y0 + 3; y <= y0 + 6; y++) { put(1, y, 'k'); put(2, y, 'a'); put(16, y, 'k'); put(15, y, 'a'); }
  } else if (o.hat === 'bubble') {                                  // скляний шолом навколо голови
    const cx = W / 2, cy = y0 + 5.5;
    for (let y = y0 - 2; y <= y0 + 12; y++) for (let x = 0; x < W; x++) {
      const e = (px0, py0) => Math.pow((px0 + 0.5 - cx) / 8.6, 2) + Math.pow((py0 + 0.5 - cy) / 8.2, 2) <= 1;
      if (!e(x, y) && (e(x - 1, y) || e(x + 1, y) || e(x, y - 1) || e(x, y + 1)) && !solid(x, y)) put(x, y, 'a');
    }
    put(3, y0 + 1, 'w'); put(4, y0, 'w');
  } else if (o.hat === 'hood') {                                    // ніндзя: темний капюшон на тімені, червона пов'язка, лице видно
    for (let y = y0; y <= y0 + 2; y++) { const [a, b] = ext(y); for (let x = a; x <= b; x++) if (solid(x, y)) put(x, y, 'z'); }
    const [a, b] = ext(y0 + 3); for (let x = a; x <= b; x++) if (solid(x, y0 + 3)) put(x, y0 + 3, 'r'); put(b + 1, y0 + 3, 'r'); put(b + 2, y0 + 4, 'r');
  }
  return c;
}
// Костюми епох: ті самі капелюхи й светри, що були у 16×16, тільки на новому тілі
function teamEpochSprite(id, epoch) {
  const cs = TEAM_COSTUMES[epoch % TEAM_COSTUMES.length], keys = Object.keys(TEAM_PARTS);
  let k = keys.indexOf(id); if (k < 0) k = 0;
  const space = epoch % TEAM_COSTUMES.length === 6;
  const ou = space ? { b: 'w', l: 'E', d: ['belt', 'stripes', 'buttons', 'collar'][k % 4], c: ['o', 'T', 'f', 'v', 'r', 'n'][k % 6] } : cs.outfits[(k * 5 + 1) % cs.outfits.length];
  const hat = space ? 'bubble' : cs.hats[(k * 2 + (k >> 2)) % cs.hats.length];
  return dressHero(id, { hat, b: ou.b, l: ou.l, d: ou.d, c: ou.c });
}
// Скіни героїв (під вулиці): капелюх + тулуб
const TEAM_SKIN_HATS = {
  party: ['.......yy.......', '......dffd......', '.....dfTfTd.....', '....dfTfTfTd....'],
  chef: ['.....wwwwww.....', '....wwwwwwww....', '....wwwwwwww....', '....EEEEEEEE....'],
  wizard: ['.......yy.......', '......uuuu......', '.....uuyuuu.....', '...hhhhhhhhhh...'],
  santa: ['.......ww.......', '......rrrr......', '.....rrrrrr.....', '....wwwwwwww....'],
  witch: ['.......VV.......', '......VVVV......', '....oooooooo....', '...VVVVVVVVVV...'],
  candy: ['.......rr.......', '......wwww......', '.....qwqqwq.....', '...pppppppppp...'],
  sand: ['.....wwwwww.....', '....wwEwwEww....', '....wwwrrwww....', '....nnnnnnnn....'],
  moss: ['.....g.ff.g.....', '....gGgyyGgG....', '...GgmgGGgmgG...', '...GGGGGGGGGG...'],
  brick: ['.....yyyyyy.....', '....yywwwwyy....', '...yyyyyyyyyy...', '..hhhhhhhhhhhh..'],
  wood: ['......oooo......', '.....ooyyoo.....', '....oooooooo....', '....bbbbbbbb....'],
  gold: ['...y..y..y..y...', '...yyyyyyyyyy...', '...yryyyyyyry...', '...hhhhhhhhhh...'],
  diamond: ['...N..N..N..N...', '...NaaNaaNaaN...', '...awwaaaawwa...', '...ssssssssss...'],
  royal: ['...h..h..h..h...', '...hhhhhhhhhh...', '...hrhhhhhhrh...', '...hhhhhhhhhh...']
};
const TEAM_SKIN_BODY_OLD = {                                         // тулуб без візерунка: колір, обшивка, прикраса, акцент
  party: { b: 'f', l: 'w', d: 'dots', c: 'y' }, ninja: { b: 'z', l: 'n', d: 'belt', c: 'r' }, chef: { b: 'w', l: 'E', d: 'buttons', c: 'r' }, wizard: { b: 'v', l: 'u', d: 'dots', c: 'y' },
  royal: { b: 'r', l: 'w', d: 'collar', c: 'w' }, santa: { b: 'r', l: 'w', d: 'belt', c: 'k' }, witch: { b: 'V', l: 'P', d: 'dots', c: 'o' }, diamond: { b: 'a', l: 's', d: 'dots', c: 'w' }
};
// Одяг скінів на все тіло. Лінії візерунка — від координат, тому на всіх звірятах той самий малюнок.
const TEAM_OUTFITS = {
  party: { c: '#d94fa0', paint: a => {                                   // святковий светр із конфеті й жовтою краваткою-метеликом
    [[5, 21, '#ffe05a'], [8, 22, '#5ad2f0'], [11, 21, '#ffffff'], [6, 24, '#ffffff'], [10, 23, '#ffe05a'], [13, 22, '#5ad2f0'], [7, 25, '#5ad2f0'], [12, 25, '#ffe05a']].forEach(p => a.px(p[0], p[1], p[2], 1));
    a.row(a.T0, '#ffe05a', 3); a.px(a.cx - 1, a.T0, '#e0a020', 1); a.px(a.cx, a.T0, '#e0a020', 1);
    a.row(25, '#8a2a78', 0);
  } },
  ninja: { c: '#2b2b3d', paint: a => {                                    // чорна форма, схрещені стрічки на грудях, червоний пояс
    for (let y = 21; y <= 22; y++) { a.px(a.cx - 4 + (y - 21) * 2, y, '#4a4a63'); a.px(a.cx - 3 + (y - 21) * 2, y, '#4a4a63'); a.px(a.cx + 3 - (y - 21) * 2, y, '#4a4a63'); a.px(a.cx + 2 - (y - 21) * 2, y, '#4a4a63'); }
    a.row(24, '#d23a3a', 0); a.px(a.cx - 1, 24, '#ffd860', 1); a.px(a.cx, 24, '#ffd860', 1);
    a.px(a.cx + 3, 25, '#d23a3a'); a.px(a.cx + 3, 26, '#d23a3a');
  } },
  chef: { c: '#f4f4f4', paint: a => {                                      // білий кітель у два ряди ґудзиків, червона хустка, картата штанина
    a.row(a.T0, '#d23a3a', 2);
    [21, 23].forEach(y => { a.px(a.cx - 2, y, '#9aa4b0', 1); a.px(a.cx + 1, y, '#9aa4b0', 1); });
    a.px(a.cx - 1, 22, '#dfe5ea'); a.px(a.cx, 22, '#dfe5ea'); a.px(a.cx - 1, 24, '#dfe5ea'); a.px(a.cx, 24, '#dfe5ea');
    for (let x = 0; x < a.W; x++) a.px(x, 25, x % 2 ? '#e8edf2' : '#3f5f9c');
  } },
  wizard: { c: '#6a3fb0', paint: a => {                                    // фіолетова мантія із зорями, золотий пояс і облямівка
    [[6, 21], [11, 22], [8, 24], [13, 24], [5, 23]].forEach(p => { a.px(p[0], p[1], '#ffe05a', 1); });
    a.row(23, '#e8b030', 0); a.px(a.cx, 23, '#fff0a0', 1);
    a.row(25, '#e8b030', 0); a.row(a.T0, '#8a62d0', 3);
  } },
  royal: { c: '#c8302f', paint: a => {                                     // червона мантія, горностаєвий комір із плямками, золота стрічка
    a.row(a.T0, '#fbf6ea', 1); a.row(21, '#fbf6ea', 2);
    [[a.cx - 3, 21], [a.cx, 21], [a.cx + 2, 21], [a.cx - 1, a.T0], [a.cx + 3, a.T0]].forEach(p => a.px(p[0], p[1], '#2a2030', 1));
    for (let y = 22; y <= 25; y++) { a.px(a.cx - 1, y, '#f0b830'); a.px(a.cx, y, '#f0b830'); }
    a.row(24, '#f0b830', 0); a.row(25, '#f4f0e0', 0);
  } },
  santa: { c: '#d02a2a', paint: a => {                                     // червоний кожух, біле хутро, чорний пояс із пряжкою
    a.row(a.T0, '#fbf6ea', 1); a.row(21, '#fbf6ea', 3);
    a.row(23, '#26222a', 0); a.px(a.cx - 1, 23, '#f0c030', 1); a.px(a.cx, 23, '#f0c030', 1);
    a.row(25, '#fbf6ea', 0);
    [22, 23].forEach(y => { a.px(a.a(y), y, '#fbf6ea'); a.px(a.b(y), y, '#fbf6ea'); });
  } },
  witch: { c: '#5a2e82', paint: a => {                                      // темна мантія, помаранчева облямівка й пояс, місяць
    a.row(a.T0, '#e8863c', 3); a.row(23, '#e8863c', 0); a.px(a.cx, 23, '#ffe05a', 1);
    a.row(25, '#e8863c', 0);
    a.px(7, 21, '#ffe05a', 1); a.px(8, 21, '#ffe05a', 1); a.px(7, 22, '#ffe05a', 1); a.px(12, 24, '#ffe05a', 1);
  } },
  diamond: { c: '#7fd6f0', paint: a => {                                    // кришталеві грані, білий блиск і камінь
    for (let y = a.T0; y < a.H; y++) for (let x = 0; x < a.W; x++) if ((x - y + 40) % 5 === 0) a.px(x, y, '#bdeeff');
    for (let y = a.T0; y < a.H; y++) for (let x = 0; x < a.W; x++) if ((x + y) % 7 === 0) a.px(x, y, '#58b8dc');
    a.px(a.cx - 1, 22, '#ffffff', 1); a.px(a.cx, 22, '#ffffff', 1); a.px(a.cx - 1, 23, '#ffffff', 1); a.px(a.cx, 23, '#e0f8ff', 1);
    a.px(6, 21, '#ffffff', 1);
  } },
  sand: { c: '#e8cf9a', paint: a => {                                       // піщана роба, золота облямівка, червоний пояс, знаки
    a.row(a.T0, '#d9a53a', 2); a.row(23, '#b83a2a', 0); a.px(a.cx - 1, 23, '#ffe05a', 1); a.px(a.cx, 23, '#ffe05a', 1);
    a.row(25, '#d9a53a', 0);
    [[6, 21], [8, 22], [11, 21], [12, 22], [7, 24], [11, 24]].forEach(p => a.px(p[0], p[1], '#a07838'));
  } },
  moss: { c: '#4f9a63', paint: a => {                                        // туніка з листя, плями моху, ліана-пояс із квітками
    for (let y = a.T0; y < a.H; y++) for (let x = 0; x < a.W; x++) if ((x + 2 * y) % 5 === 0) a.px(x, y, '#2f6b48'); else if ((x + 2 * y) % 5 === 2) a.px(x, y, '#78c27a');
    a.row(23, '#7a5a30', 0); a.px(7, 23, '#ff9fb8', 1); a.px(11, 23, '#ffe05a', 1);
    a.row(a.T0, '#2f6b48', 2); a.row(25, '#2f6b48', 0);
  } },
  wood: { c: '#c04030', paint: a => {                                    // фланелева сорочка в клітинку, джинсовий напівкомбінезон із кнопками
    for (let y = a.T0; y < a.H; y++) for (let x = 0; x < a.W; x++) { const v = x % 4 === 0, h = y % 4 === 0; a.px(x, y, v && h ? '#3a1414' : v || h ? '#8c2a22' : '#c04030'); }
    for (let y = 25; y < a.H; y++) a.row(y, '#3f5f9c', 0);
    for (let y = 22; y <= 24; y++) for (let x = a.cx - 3; x <= a.cx + 2; x++) a.px(x, y, '#3f5f9c');
    a.px(a.cx - 3, 21, '#3f5f9c'); a.px(a.cx + 2, 21, '#3f5f9c'); a.px(a.cx - 3, 20, '#3f5f9c'); a.px(a.cx + 2, 20, '#3f5f9c');
    a.px(a.cx - 3, 22, '#ffd860', 1); a.px(a.cx + 2, 22, '#ffd860', 1);
    a.px(a.cx - 1, 24, '#2c4373'); a.px(a.cx, 24, '#2c4373');
  } },
  candy: { c: '#fff4f4', paint: a => {                                    // цукерково-смугастий светр, рожевий комір-рюш і пояс
    for (let y = a.T0; y < a.H; y++) for (let x = 0; x < a.W; x++) a.px(x, y, (x + y) % 4 < 2 ? '#e5384f' : '#fff4f4');
    for (let x = a.a(a.T0); x <= a.b(a.T0); x++) a.px(x, a.T0, x % 2 ? '#ff9fb8' : '#fff4f4');
    a.row(23, '#ff7aa0', 0); a.px(a.cx - 1, 23, '#ffd860', 1); a.px(a.cx, 23, '#ffd860', 1);
    a.row(25, '#ff9fb8', 0);
  } },
  brick: { c: '#8d949c', paint: a => {                                    // сіра футболка + помаранчевий жилет зі світловідбивними смугами
    for (let y = a.T0; y <= 24; y++) a.row(y, '#f08a1e', 2);
    a.row(22, '#f3f19a', 2); a.row(24, '#f3f19a', 2);
    for (let y = a.T0; y <= 24; y++) a.px(a.cx, y, '#8a4a10');
    a.row(25, '#3a3a44', 0); a.px(a.cx - 1, 25, '#c8c8d0', 1); a.px(a.cx, 25, '#c8c8d0', 1);
  } },
  gold: { c: '#f2c230', paint: a => {                                     // золоті лати: пластини, наплічники, червоний камінь
    a.row(22, '#c9961c', 1); a.row(24, '#c9961c', 1);
    for (let y = a.T0; y <= a.T0 + 2; y++) { a.px(a.a(y), y, '#ffe27a'); a.px(a.a(y) + 1, y, '#ffe27a'); a.px(a.b(y), y, '#ffe27a'); a.px(a.b(y) - 1, y, '#ffe27a'); }
    a.px(a.cx - 1, 21, '#d23a3a', 1); a.px(a.cx, 21, '#d23a3a', 1); a.px(a.cx - 1, 21, '#ff8a8a', 1);
    a.row(25, '#a87414', 0);
  } }
};
function teamSkinSprite(id, kind) {
  if (TEAM_OUTFITS[kind]) return dressHero(id, { hat: TEAM_SKIN_HATS[kind], outfit: TEAM_OUTFITS[kind] });
  if (TEAM_SKIN_BODY[kind]) return dressHero(id, { hat: TEAM_SKIN_HATS[kind], pat: TEAM_SKIN_BODY[kind] });
  const ob = TEAM_SKIN_BODY_OLD[kind] || { b: 'z', l: 'n', d: 'belt', c: 'r' };
  return dressHero(id, { hat: kind === 'ninja' ? 'hood' : TEAM_SKIN_HATS[kind], b: ob.b, l: ob.l, d: ob.d, c: ob.c });
}
// Підміна спрайтів команди: усе малюється при першому зверненні
(function () {
  const lazy = (name, make) => { SPRITES[name] = { get canvas() { delete this.canvas; return (this.canvas = make()); } }; };
  TEAM.forEach(m => {
    lazy('team_' + m.id, () => teamBaseCanvas(m.id));
    for (let e = 0; e < TEAM_COSTUMES.length; e++) lazy('team_' + m.id + '_e' + e, () => teamEpochSprite(m.id, e));
    ['party', 'ninja', 'chef', 'wizard', 'royal', 'santa', 'witch', 'gold', 'diamond', 'candy', 'sand', 'moss', 'brick', 'wood'].forEach(kind => lazy('team_' + m.id + '_sk_' + kind, () => teamSkinSprite(m.id, kind)));
  });
})();
