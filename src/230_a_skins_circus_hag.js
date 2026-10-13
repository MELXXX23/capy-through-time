//#part 230_a_skins_circus_hag.js
/* =====================================================================
   ЦИРК ФОРТУНИ: раз на 24 години в правому куті з'являється червоний «!», який мигає й грає марш.
   Тап по ньому → цирк-причіп їде справа наліво ~5 с → тап по цирку → вікно з колесом на 12 секторів і клоуном Бубоном.
   ===================================================================== */
// 12 секторів: 8 звичайних призів колеса (монети, дохід, тап, кристал, джекпот) та 4 скіни (Капі, магазин, погода, герої)
const CIRCUS_SECTORS = (function () {
  const sk = (type, color, icon) => ({ kind: 'skin', skin: type, weight: 7, color, icon }), cr = (n, w, color) => ({ kind: 'crystal', amount: n, weight: w, color, icon: n > 1 ? 'gem' + n : 'gem' });   // цирк дає лише скіни й кристали
  return [cr(1, 14, 'u'), sk('capy', 'c', 'hat'), cr(2, 9, 'v'), sk('shop', 'q', 'house'), cr(1, 14, 'u'), sk('weather', 'S', 'cloud'), cr(3, 5, 'P'), sk('street', 'E', 'brick'), cr(1, 14, 'u'), sk('hero', 'w', 'paw'), cr(2, 9, 'v'), sk('capy', 'c', 'hat')];
})();
const WEATHER_ORDER = ['rainbow', 'lightning', 'lightninggreen', 'lightningred', 'cottoncloud', 'goldcloud', 'starcloud'];     // порядок у вкладці: хмари в кінці
const SKIN_HIDDEN = ['street_snow', 'street_leaves', 'capy_sailor', 'capy_detective', 'shop_ice', 'shop_wood', 'shop_garden', 'shop_spring', 'shop_autumn'];                // зимова й осіння бруківка вже є в порах року: зі списку прибрано (біти лишились, щоб не збити збереження)
const SKIN_TYPES = ['capy', 'shop', 'weather', 'street', 'hero'];   // групи скінів: Капі, магазин, погода, герої
const SKIN_POOL = ['capy_pirate', 'capy_astro', 'shop_candy', 'shop_gold', 'weather_rainbow', 'weather_lightning', 'hero_party', 'hero_ninja', 'capy_ep0', 'capy_ep1', 'capy_ep2', 'capy_ep3', 'capy_ep4', 'capy_ep5', 'capy_ep6', 'capy_ep7', 'capy_wizard', 'capy_chef', 'capy_explorer', 'capy_detective', 'capy_sailor', 'shop_ice', 'shop_wood', 'shop_garden', 'weather_cottoncloud', 'weather_goldcloud', 'weather_starcloud', 'hero_chef', 'hero_wizard', 'hero_royal', 'street_wood', 'street_brick', 'capy_santa', 'capy_witch', 'capy_flower', 'capy_beach', 'capy_autumn', 'hero_santa', 'hero_witch', 'shop_xmas', 'shop_halloween', 'shop_spring', 'shop_autumn', 'street_snow', 'street_leaves', 'capy_mel', 'capy_nika', 'capy_knight', 'capy_hero', 'capy_cowboy', 'capy_fairy', 'capy_viking', 'capy_pilot', 'weather_lightninggreen', 'weather_lightningred', 'street_moss', 'street_gold', 'capy_gold', 'capy_diamond', 'hero_gold', 'hero_diamond', 'shop_diamond', 'street_diamond', 'weather_diamondcloud'];
const SKIN_SEASON = { capy_santa: '🎄', capy_witch: '🎃', capy_flower: '🌸', capy_beach: '🏖️', capy_autumn: '🍂', hero_santa: '🎄', hero_witch: '🎃', shop_xmas: '🎄', shop_halloween: '🎃', shop_spring: '🌸', shop_autumn: '🍂', street_snow: '❄️', street_leaves: '🍂' };   // сезонні скіни
function skinHas(i) { return i < 32 ? !!(state.skinsMask & (1 << i)) : !!(state.skinsMask2 & (1 << (i - 32))); }       // перші 32 скіни — у skinsMask, решта — у skinsMask2
function skinGrant(i) { if (i < 32) state.skinsMask |= (1 << i); else state.skinsMask2 |= (1 << (i - 32)); }
const SKINS_FREE_BUILD = false;   // прапорець збірки: для exe його ставить desktop/prepare.js
const SKINS_FREE = (SKINS_FREE_BUILD && !GOD_PAUSED) || GOD_ON;          // скіни відкриваються виграшем у цирку або купівлею
const SKIN_PRICE = 50;             // символічна ціна скіна в кристалах
function skinOwned(i) {
  if (SKIN_POOL[i] === 'capy_mel' || SKIN_POOL[i] === 'capy_nika') return true;                  // скіни розробників MEL і NIKA — подарунок усім
  const m = /^capy_ep(\d)$/.exec(SKIN_POOL[i]);
  if (m) return +m[1] === viewEpoch() % EPOCHS.length;      // скін епохи можна вдягнути лише в його власній епосі
  return SKINS_FREE || skinHas(i);
}
function skinName(i) { const id = SKIN_POOL[i], m = /^capy_ep(\d)$/.exec(id); return m ? t('skinEpoch', t('epoch_' + m[1])) : t('skin_' + id); }   // номер у списку = біт у state.skinsMask; перша частина — тип скіна
const circus = { x: 0, drive: 0, t: 0, bangT: 0, anim: null, angle: 0, tex: null, setup: 1, setupT: 0 };

/* ---- малюнок: шатро-причіп із колесом та клоуном (кольорові коди, окремий canvas 120×80); вигляд залежить від епохи: CIRCUS_THEMES (230_d_circus_themes.js) ---- */
const CIRCUS_ART = (function () {
  const D = '#4a3228', DD = '#2a1d1a', RED = '#c4553d', CR = '#fff4dc', YEL = '#ffe08a', GLD = '#f2b84b', BR = '#7a4f35', OUT = '#3a1f1a';
  const SEG = ['#c4553d', '#ffe08a', '#4f9a63', '#3d5a8c', '#ef8fa3', '#e8863c', '#8b6bb0', '#8ed4a6', '#f2b84b', '#86cfe8', '#ffc9d4', '#ff5fa2'];
  const rr = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const dsc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.4) rr(g, cx + x, cy + y, 1, 1, c); };
  const stamp = (g, x0, y0, rows, pal) => rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = pal[row[i]]; if (c) rr(g, x0 + i, y0 + j, 1, 1, c); } });
  const GL = {
    'Ц': ['#..#.', '#..#.', '#..#.', '#####', '....#'], 'И': ['#...#', '#..##', '#.#.#', '##..#', '#...#'], 'Р': ['####.', '#...#', '####.', '#....', '#....'],
    'К': ['#...#', '#..#.', '###..', '#..#.', '#...#'], 'Ф': ['..#..', '.###.', '#.#.#', '.###.', '..#..'], 'О': ['.###.', '#...#', '#...#', '#...#', '.###.'],
    'Т': ['#####', '..#..', '..#..', '..#..', '..#..'], 'У': ['#...#', '#...#', '.####', '....#', '.###.'], 'Н': ['#...#', '#...#', '#####', '#...#', '#...#'],
    'L': ['#....', '#....', '#....', '#....', '#####'], 'U': ['#...#', '#...#', '#...#', '#...#', '.###.'], 'C': ['.####', '#....', '#....', '#....', '.####'],
    'K': ['#...#', '#..#.', '###..', '#..#.', '#...#'], 'Y': ['#...#', '.#.#.', '..#..', '..#..', '..#..'], 'I': ['#####', '..#..', '..#..', '..#..', '#####'],
    'R': ['####.', '#...#', '####.', '#..#.', '#...#'], 'S': ['.####', '#....', '.###.', '....#', '####.']
  };
  // довгий прапор-стрічка з назвою; кожен стовпчик іде хвилею
  function flag(g, x0, y0, len, t, fill, ink, text, edge) {
    const pix = {}; let cx = 3;
    for (const ch of text) { if (ch === ' ') { cx += 3; continue; } const gl = GL[ch]; if (!gl) continue; gl.forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') (pix[cx + rx] = pix[cx + rx] || []).push(ry); }); cx += 6; }
    for (let i = 0; i < len; i++) {
      const amp = 0.4 + 1.8 * (i / len), off = Math.round(Math.sin(i * 0.32 - t * 5) * amp), top = y0 + off, h = 9;
      const notch = i > len - 6 ? i - (len - 6) : 0;
      for (let y = 0; y < h; y++) { if (notch && Math.abs(y - 4) < Math.min(notch, 4) && i > len - notch) continue; rr(g, x0 + i, top + y, 1, 1, (y === 0 || y === h - 1) ? edge : fill); }
      (pix[i] || []).forEach(ry => rr(g, x0 + i, top + 2 + ry, 1, 1, ink));
    }
  }
  // колесо фортуни: сектори (SEG) не змінюються, під епоху міняються лампочки обода, втулка й стрілка
  function wheelF(g, cx, cy, rad, t, th) {
    const rot = t * 0.4;
    for (let y = -rad - 2; y <= rad + 2; y++) for (let x = -rad - 2; x <= rad + 2; x++) {
      const r = Math.sqrt(x * x + y * y); if (r > rad + 1.6) continue; let col;
      if (r > rad - 0.6) col = D;
      else if (r > rad - 2.4) { const a = Math.atan2(y, x) + rot; col = (Math.floor(a / 0.4488) + Math.floor(t * 3)) % 2 ? th.rim[0] : th.rim[1]; }
      else if (r < 2.4) col = r < 1.4 ? th.hub : D;
      else { const a = Math.atan2(y, x) + rot + Math.PI * 2, k = Math.floor(a / (Math.PI * 2 / 12)) % 12; col = SEG[k]; const fr = (a / (Math.PI * 2 / 12)) % 1; if (fr < 0.1 || fr > 0.93) col = D; }
      rr(g, cx + x, cy + y, 1, 1, col);
    }
    rr(g, cx - 2, cy - rad - 3, 5, 1, th.hub); rr(g, cx - 2, cy - rad - 2, 5, 1, D); rr(g, cx - 1, cy - rad - 1, 3, 1, th.ptr); rr(g, cx, cy - rad, 1, 2, th.ptr);
  }
  // головний убір клоуна (hy — центр голови); карти 11 колонок, '.' порожньо, D контур, h основний колір, a акцент, w білий
  const HATS = {
    top: { y: -9, rows: ['.....a.....', '...DDDDD...', '....hhh....', '....hhh....', '...hhhhh...', '..DDDDDDD..'] },
    jester: { y: -9, rows: ['a.........a', 'Dh.......hD', '.Dh.....hD.', '..DhhhhhD..', '..DhahahD..', '..DDDDDDD..'] },
    visor: { y: -8, rows: ['...DDDDD...', '..DhhhhhD..', '..DhhhhhD..', '..DhaaahDDD', '..DDDDDDD..'] },
    cap: { y: -7, rows: ['...DDDDD...', '..DwwwwwD..', '..DwhhhwD..', '..DDDDDDD..'] },
    phones: { y: -8, rows: ['...DDDDD...', '..D.....D..', '.D.......D.', '.D.......D.', 'D.........D', 'D.........D', 'DD.......DD', 'DhD.....DhD', 'DhD.....DhD', 'DD.......DD'] },
    leaf: { y: -8, rows: ['...h...h...', '..hhh.hhh..', '.hhDhhhDhh.', '.hhhhahhhh.', '..hhhhhhh..'] },
    kasa: { y: -8, rows: ['.....D.....', '....DhD....', '...DhhhD...', '..DhhahhD..', '.DhhhhhhhD.', 'DDDDDDDDDDD'] }
  };
  function hatG(g, ox, hy, c) {
    const k = c.kind;
    if (k === 'helmet') {                                                  // скляна куля скафандра
      for (let y = -9; y <= 9; y++) for (let x = -3; x <= 13; x++) { const d = Math.sqrt((x - 5) * (x - 5) + y * y); if (d >= 6.4 && d < 7.6) rr(g, ox + x, hy + y, 1, 1, c.hat); else if (d >= 7.6 && d < 8.6) rr(g, ox + x, hy + y, 1, 1, D); }
      rr(g, ox + 1, hy - 5, 1, 1, '#ffffff'); rr(g, ox + 2, hy - 6, 2, 1, '#ffffff'); rr(g, ox + 4, hy + 8, 3, 1, '#c9d6e8'); return;
    }
    if (k === 'afro') {                                                    // пишна зачіска
      for (let y = -9; y <= 5; y++) for (let x = -3; x <= 13; x++) { const d = Math.sqrt((x - 5) * (x - 5) + (y + 2) * (y + 2)), f = (x - 5) * (x - 5) + y * y; if (d <= 7.4 && f > 25.4) rr(g, ox + x, hy + y, 1, 1, (x + y) % 3 ? c.hat : '#8a5a2a'); }
      return;
    }
    const H = HATS[k] || HATS.top; stamp(g, ox, hy + H.y, H.rows, { D, h: c.hat, a: c.tip, w: CR });
  }
  // клоун на вулиці (by — лінія землі)
  function clown(g, ox, by, t, th) {
    const c = th.cl, arm = Math.floor(t * 3) % 2, hy = by - 20;
    rr(g, ox, by - 2, 5, 2, D); rr(g, ox + 1, by - 2, 3, 1, c.shoe); rr(g, ox + 6, by - 2, 5, 2, D); rr(g, ox + 7, by - 2, 3, 1, c.shoe);
    rr(g, ox + 1, by - 7, 3, 5, c.legA); rr(g, ox + 7, by - 7, 3, 5, c.legB);
    rr(g, ox + 1, by - 14, 9, 8, D); rr(g, ox + 2, by - 13, 7, 7, c.suit);
    [[3, 11], [6, 9], [4, 8], [7, 12], [5, 13]].forEach(q => rr(g, ox + q[0], by - q[1], 1, 1, c.star));
    rr(g, ox + 1, by - 15, 9, 2, D); rr(g, ox + 2, by - 14, 7, 1, c.ruff); rr(g, ox + 4, by - 14, 3, 1, c.ruff2);
    if (arm) { rr(g, ox - 2, by - 13, 3, 2, D); rr(g, ox - 3, by - 17, 2, 5, D); rr(g, ox - 2, by - 16, 1, 4, c.suit); rr(g, ox - 4, by - 18, 2, 2, CR); rr(g, ox + 9, by - 12, 3, 5, D); rr(g, ox + 10, by - 11, 1, 4, c.suit); }
    else { rr(g, ox - 2, by - 12, 3, 5, D); rr(g, ox - 1, by - 11, 1, 4, c.suit); rr(g, ox + 9, by - 13, 3, 2, D); rr(g, ox + 11, by - 17, 2, 5, D); rr(g, ox + 11, by - 16, 1, 4, c.suit); rr(g, ox + 12, by - 18, 2, 2, CR); }
    dsc(g, ox + 5, hy, 5, D); dsc(g, ox + 5, hy, 4, CR);
    dsc(g, ox - 1, hy - 1, 2, D); dsc(g, ox - 1, hy - 1, 1, c.wig); dsc(g, ox + 11, hy - 1, 2, D); dsc(g, ox + 11, hy - 1, 1, c.wig);
    rr(g, ox + 3, hy - 1, 1, 2, DD); rr(g, ox + 7, hy - 1, 1, 2, DD);
    if (c.shades) { rr(g, ox + 2, hy - 1, 7, 2, '#1a0f2a'); rr(g, ox + 3, hy - 1, 1, 1, '#7ad8ff'); rr(g, ox + 7, hy - 1, 1, 1, '#7ad8ff'); }
    rr(g, ox + 4, hy + 1, 3, 2, RED); rr(g, ox + 5, hy, 1, 1, '#ff8a7a');
    rr(g, ox + 3, hy + 3, 5, 1, RED); rr(g, ox + 2, hy + 2, 1, 1, RED); rr(g, ox + 8, hy + 2, 1, 1, RED);
    hatG(g, ox, hy, c);
  }
  // шатро: гострий верх, смуги віялом, фестончасті стінки, темний вхід (кожне малюється один раз)
  function makeTent(o) {
    const W = o.w, H = o.h, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    const cx = o.cx, ay = o.ay, roofB = o.roofB, floor = o.floor, scallop = o.scallop, c1 = o.c1, c2 = o.c2, cap = o.cap, shade = o.shade, fan = o.fan;
    const hwRoof = y => 3 + (o.hw - 3) * Math.pow((y - ay) / (roofB - ay), 1.7);
    const edge = x => roofB + 2 - Math.round(o.sc * Math.sin(Math.PI * ((((x - cx + 600) % scallop) / scallop))));
    const hwAt = y => y <= roofB + 2 ? Math.round(hwRoof(Math.min(y, roofB))) : o.hw + 3 - Math.round(2 * Math.sin((y - roofB) / (floor - roofB) * Math.PI));
    for (let y = ay; y <= floor; y++) {
      const hw = hwAt(y);
      for (let x = cx - hw; x <= cx + hw; x++) {
        const e = edge(x); let col;
        if (y < e) { if (y < ay + o.capH && Math.abs(x - cx) < 4 + (y - ay) * 0.2) col = cap; else col = Math.floor(((x - cx) / Math.max(2, y - ay + 2)) * fan + 200) % 2 ? c1 : c2; }
        else { col = Math.floor((x - cx + 200) / o.stripe) % 2 ? c1 : c2; if (y > e + 1 && y < e + 3 && (x + y) % 2) col = shade; }
        rr(g, x, y, 1, 1, col);
      }
    }
    [[cx - 2, ay + 6], [cx + 1, ay + 8], [cx - 1, ay + 4]].forEach(p => rr(g, p[0], p[1], 1, 1, CR));
    if (o.door) {
      for (let y = 48; y <= floor; y++) { const hw = y < 52 ? 3 + (y - 48) * 1.5 : 9; for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) rr(g, x, y, 1, 1, o.doorC); }
      for (let y = 50; y <= floor; y++) { rr(g, cx - 10 - Math.floor((y - 50) / 8), y, 2, 1, o.trim); rr(g, cx + 9 + Math.floor((y - 50) / 8), y, 2, 1, o.trim); }
    } else {
      for (let y = floor - 9; y <= floor; y++) { const hw = y < floor - 6 ? 2 : 4; for (let x = cx - hw; x <= cx + hw; x++) rr(g, x, y, 1, 1, o.doorC); }
    }
    if (o.paint) o.paint(g, o.kind, { cx, ay, roofB, floor, fan, stripe: o.stripe, scallop, capH: o.capH, edge, hwAt });
    const d = g.getImageData(0, 0, W, H).data, has = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0;
    const out = document.createElement('canvas'); out.width = W; out.height = H; const og = out.getContext('2d'); og.fillStyle = o.out;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!has(x, y) && (has(x - 1, y) || has(x + 1, y) || has(x, y - 1) || has(x, y + 1))) og.fillRect(x, y, 1, 1);
    og.drawImage(cv, 0, 0);
    return out;
  }
  const tentSets = {};
  function tentSet(th) {
    if (tentSets[th.id]) return tentSets[th.id];
    const base = { cap: th.cap, shade: th.shade, trim: th.trim, doorC: th.door, out: th.out, paint: th.paint };
    return tentSets[th.id] = {
      main: makeTent(Object.assign({ kind: 'main', w: 160, h: 84, cx: 80, ay: 14, roofB: 44, floor: 62, hw: 31, scallop: 12, sc: 3, fan: 5, stripe: 6, capH: 12, c1: th.c1, c2: th.c2, door: true }, base)),
      side: makeTent(Object.assign({ kind: 'side', w: 48, h: 44, cx: 24, ay: 3, roofB: 22, floor: 38, hw: 18, scallop: 8, sc: 2, fan: 4, stripe: 4, capH: 8, c1: th.c1, c2: th.c2, door: false }, base)),
      side2: makeTent(Object.assign({ kind: 'side', w: 48, h: 44, cx: 24, ay: 3, roofB: 22, floor: 38, hw: 18, scallop: 8, sc: 2, fan: 4, stripe: 4, capH: 8, c1: th.c2, c2: th.c1, door: false }, base))
    };
  }
  const clamp01 = v => Math.max(0, Math.min(1, v)), eo = k => 1 - (1 - k) * (1 - k), back = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const themeOf = eid => CIRCUS_THEMES[eid === undefined ? viewEpoch() : eid] || CIRCUS_THEMES[0];
  // s: 0 — їде причіпом, 1 — розкладений: платформа й колеса зникли, шатро сіло на землю, виросли два малі шатра, клоун вийшов і махає
  function draw(g, t, s, moving, eid) {
    const th = themeOf(eid), ts = tentSet(th), P = th.plat;
    g.clearRect(0, 0, 160, 84);
    const e = (a, b) => clamp01((s - a) / (b - a)), GY = 76;
    const bob = moving ? Math.floor(t * 6) % 2 : 0, sink = 14 * eo(e(0.10, 0.45)), platA = 1 - eo(e(0.0, 0.30));
    const u = { rr, dsc, e, s, sink, bob, GY, moving };
    if (th.back) th.back(g, t, s, u);
    // малі шатра виростають із землі (з відскоком) і здіймають пил
    [[ts.side, 30, e(0.30, 0.58)], [ts.side2, 130, e(0.45, 0.72)]].forEach(([cv, cx, k]) => {
      if (k <= 0) return;
      const sc = Math.max(0.05, back(k)), sx = 0.6 + 0.4 * Math.min(1, sc);
      g.save(); g.translate(cx, GY); g.scale(sx, sc); g.drawImage(cv, -24, -38); g.restore();
      if (k < 0.95) for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI, r = 2 + 6 * k + i % 2; g.globalAlpha = 0.6 * (1 - k); dsc(g, Math.round(cx + Math.cos(a) * (14 + 10 * k) * (i % 2 ? 1 : -1)), GY - 1 - Math.round(Math.sin(a) * 3 * k), 2, CR); }
      g.globalAlpha = 1;
    });
    // головне шатро (разом зі щоглою й прапором) осідає на землю
    g.save(); g.translate(0, bob + sink);
    g.drawImage(ts.main, 0, 0);
    if (th.post) { th.post(g, t, 64); th.post(g, t, 91); }
    if (th.top) th.top(g, t, s, u);
    rr(g, 80, 3, 1, 12, th.out); flag(g, 81, 3, 70, t, th.flag[0], th.flag[1], circusFlagText(), th.flag[2]);
    g.restore();
    circusGarland(g, th, t, u);
    // платформа й колеса візка (у космосі — двигуни) зникають
    if (platA > 0.02) {
      g.save(); g.globalAlpha = platA; g.translate(0, bob + (1 - platA) * 10);
      rr(g, 38, 62, 84, 6, P.d); rr(g, 39, 63, 82, 4, P.m); rr(g, 39, 63, 82, 1, P.hi); rr(g, 39, 67, 82, 1, P.lo);
      for (let x = 42; x < 122; x += 6) rr(g, x, 65, 2, 1, P.dash);
      rr(g, 34, 65, 5, 2, P.d); rr(g, 34, 64, 2, 1, P.hitch);
      for (let x = 40; x <= 124; x += 4) rr(g, x, 61, 2, 1, (Math.floor(t * 3) + (x - 40) / 4) % 2 ? P.lt[0] : P.lt[1]);
      g.restore();
      g.save(); g.globalAlpha = platA; g.translate(0, (1 - platA) * 12);
      [48, 110].forEach(wx => {
        const wy = 71, Y = th.tyre;
        if (th.hover) { const h = 3 + Math.floor(t * 14) % 3; rr(g, wx - 4, 68, 9, 2, '#5a6a8a'); rr(g, wx - 3, 70, 7, h, '#7ad8ff'); rr(g, wx - 1, 70, 3, h - 1, '#ffffff'); return; }
        dsc(g, wx, wy, 5, Y[0]); dsc(g, wx, wy, 4, Y[1]); dsc(g, wx, wy, 1, Y[2]);
        for (let k = 0; k < 4; k++) { const a = t * 6 * platA + k * Math.PI / 2; for (let i = 1; i < 4; i++) rr(g, wx + Math.cos(a) * i, wy + Math.sin(a) * i, 1, 1, Y[3]); }
      });
      g.restore();
      g.globalAlpha = 1;
    }
    // колесо фортуни їде з платформи на землю, ближче до малого шатра
    const wk = eo(e(0.10, 0.60)), wx = lerp(50, 108, wk), wy = lerp(52 + bob, 64, wk);
    if (wy + 10 < GY) rr(g, wx - 1, wy + 10, 3, GY - wy - 10, D);
    wheelF(g, Math.round(wx), Math.round(wy), 11, t, th);
    // клоун: стоїть на платформі → заходить у шатро → виходить на землю й махає рукою
    const walkIn = e(0.12, 0.30), walkOut = e(0.62, 0.84);
    let cxp = 96, vis = 1;
    if (s < 0.30) cxp = lerp(96, 75, eo(walkIn));
    else if (s < 0.62) { cxp = 75; vis = 0; }
    else cxp = lerp(75, 52, eo(walkOut));
    if (s > 0.26 && s <= 0.34) vis = 1 - e(0.26, 0.34); else if (s >= 0.56 && s < 0.64) vis = e(0.56, 0.64);
    if (vis > 0.02) { g.globalAlpha = vis; clown(g, Math.round(cxp), Math.round(62 + sink + bob * (s < 0.3 ? 1 : 0)), t, th); g.globalAlpha = 1; }
  }
  // клоун у вікні колеса: жонглює, підстрибує, моргає (canvas 72×40)
  function clownWindow(g, t, eid) {
    const th = themeOf(eid), W = th.win, c = th.cl;
    g.clearRect(0, 0, 72, 40); rr(g, 0, 0, 72, 40, W.sky);
    for (let x = 0; x < 72; x += 6) { g.globalAlpha = 0.25; rr(g, x, 0, 3, 40, W.beam); g.globalAlpha = 1; }
    rr(g, 0, 34, 72, 6, W.floor); rr(g, 0, 34, 72, 1, W.line);
    for (let i = 0; i < 12; i++) rr(g, i * 6 + 1, 36, 2, 2, i % 2 ? W.dot[0] : W.dot[1]);
    if (W.extra) W.extra(g, t);
    const hop = Math.abs(Math.sin(t * 3)) * 3, by = 33 - hop, ox = 30, hy = by - 20;
    [W.conf[0], W.conf[1], W.conf[2]].forEach((col, k) => { const a = t * 4 + k * 2.09, bx = ox + 5 + Math.cos(a) * 16, byb = by - 28 - Math.sin(a) * 10; dsc(g, bx, byb, 2, D); dsc(g, bx, byb, 1, col); });
    rr(g, ox, by - 2, 5, 2, D); rr(g, ox + 6, by - 2, 5, 2, D); rr(g, ox + 1, by - 2, 3, 1, c.shoe); rr(g, ox + 7, by - 2, 3, 1, c.shoe);
    rr(g, ox + 1, by - 7, 3, 5, c.legA); rr(g, ox + 7, by - 7, 3, 5, c.legB);
    rr(g, ox + 1, by - 14, 9, 8, D); rr(g, ox + 2, by - 13, 7, 7, c.suit);
    [[3, 11], [6, 9], [4, 8], [7, 12], [5, 13]].forEach(q => rr(g, ox + q[0], by - q[1], 1, 1, c.star));
    rr(g, ox + 1, by - 15, 9, 2, D); rr(g, ox + 2, by - 14, 7, 1, c.ruff); rr(g, ox + 4, by - 14, 3, 1, c.ruff2);
    const up = Math.floor(t * 4) % 2;
    rr(g, ox - 2, by - (up ? 17 : 12), 3, 5, D); rr(g, ox - 1, by - (up ? 16 : 11), 1, 4, c.suit);
    rr(g, ox + 10, by - (up ? 12 : 17), 3, 5, D); rr(g, ox + 11, by - (up ? 11 : 16), 1, 4, c.suit);
    dsc(g, ox + 5, hy, 5, D); dsc(g, ox + 5, hy, 4, CR);
    dsc(g, ox - 1, hy - 1, 2, D); dsc(g, ox - 1, hy - 1, 1, c.wig); dsc(g, ox + 11, hy - 1, 2, D); dsc(g, ox + 11, hy - 1, 1, c.wig);
    if ((t % 2.4) > 2.25) { rr(g, ox + 3, hy - 1, 2, 1, DD); rr(g, ox + 7, hy - 1, 2, 1, DD); } else { rr(g, ox + 3, hy - 1, 1, 2, DD); rr(g, ox + 7, hy - 1, 1, 2, DD); }
    if (c.shades) { rr(g, ox + 2, hy - 1, 7, 2, '#1a0f2a'); rr(g, ox + 3, hy - 1, 1, 1, '#7ad8ff'); rr(g, ox + 7, hy - 1, 1, 1, '#7ad8ff'); }
    rr(g, ox + 4, hy + 1, 3, 2, RED); rr(g, ox + 5, hy, 1, 1, '#ff8a7a');
    const sm = Math.floor(t * 2) % 2; rr(g, ox + 3, hy + 3 + sm, 5, 1, RED); rr(g, ox + 2, hy + 2 + sm, 1, 1, RED); rr(g, ox + 8, hy + 2 + sm, 1, 1, RED);
    hatG(g, ox, hy, c);
    for (let i = 0; i < 8; i++) { const x = (i * 9 + t * 8) % 72, y = (i * 7 + t * 14) % 34; rr(g, x, y, 1, 1, W.conf[i % 4]); }
  }
  // червоний «!» (12×26)
  let bang = null;
  function bangSprite() {
    if (bang) return bang;
    bang = document.createElement('canvas'); bang.width = 12; bang.height = 26; const g = bang.getContext('2d');
    for (let y = 0; y < 18; y++) { const w = Math.round(10 - y * 0.32), x0 = 6 - (w >> 1); rr(g, x0, y, w, 1, '#d62f2f'); rr(g, x0 + w - 2, y, 2, 1, '#a82020'); rr(g, x0, y, 1, 1, '#ef5a4f'); }
    dsc(g, 6, 22, 3, '#d62f2f'); rr(g, 7, 22, 3, 2, '#a82020'); rr(g, 4, 20, 1, 1, '#ef5a4f');
    return bang;
  }
  return { draw, clownWindow, bangSprite };
})();
function circusFlagText() { return t('circusFlag'); }
/* ---- гра Баби Яги: у трьох казанках лежать призи, їх показують, накривають гарбузами-кришками й перемішують; треба вказати казанок з головним призом ---- */
const HAG_X = [34, 96, 158], HAG_CY = 104;
const hagGame = { phase: 'idle', t: 0, c: [], si: 0, st: 0, swaps: [], pairs: [], rt: 0, pick: -1, top: 0 };
function hagReset() {
  const main = rollCircusSector(true).sec, dec = { kind: 'crystal', amount: 1, icon: 'gem', color: 'u' }, top = Math.floor(Math.random() * 3);
  hagGame.c = [0, 1, 2].map(i => ({ slot: i, lid: 1, prize: i === top ? main : dec, main: i === top, dim: false }));
  hagGame.phase = 'idle'; hagGame.t = 0; hagGame.pick = -1; hagGame.top = top; hagGame.si = 0; hagGame.st = 0; hagGame.rt = 0;
  hagGame.swaps = [0.55, 0.5, 0.46, 0.42, 0.38, 0.35, 0.32];
  hagGame.pairs = hagGame.swaps.map((d, i) => { let a = Math.floor(Math.random() * 3), b = (a + 1 + Math.floor(Math.random() * 2)) % 3; return [a, b]; });
}
function hagStart() {
  if (circusBusy() || state.circus.spun) return;
  state.circus.spun = 1; hagReset(); hagGame.phase = 'show'; hagGame.t = 0;
  ui.circusResult.textContent = t('hagWatch'); updateCircusButtons(); saveGame(); playSfx('hagCackle');
}
function updateHagGame(dt) {
  const G = hagGame; G.t += dt;
  if (G.phase === 'show') {
    G.c.forEach(c => { c.lid = G.t < 0.35 ? 1 - G.t / 0.35 : G.t < 2.5 ? 0 : Math.min(1, (G.t - 2.5) / 0.4); });
    if (G.t >= 2.9) { G.phase = 'shuffle'; G.si = 0; G.st = 0; ui.circusResult.textContent = t('hagShuffle'); }
  } else if (G.phase === 'shuffle') {
    G.st += dt; const dur = G.swaps[G.si];
    if (G.st >= dur) {
      const [a, b] = G.pairs[G.si], ca = G.c.find(c => c.slot === a), cb = G.c.find(c => c.slot === b);
      if (ca && cb) { ca.slot = b; cb.slot = a; }
      G.si++; G.st = 0; if (G.si % 2 === 0) playSfx('wheelTick');
      if (G.si >= G.swaps.length) { G.phase = 'pick'; ui.circusResult.textContent = t('hagPick'); }
    }
  } else if (G.phase === 'reveal') {
    G.rt += dt; const ch = G.c[G.pick];
    ch.lid = Math.max(0, 1 - G.rt / 0.4);
    if (G.rt > 1.0) G.c.forEach((c, i) => { if (i !== G.pick) { c.lid = Math.max(0, 1 - (G.rt - 1.0) / 0.4); c.dim = true; } });
    if (G.rt > 2.4) { G.phase = 'done'; updateCircusButtons(); ui.circusClose.textContent = t('hagDone'); }
  }
}
function hagPos(c) {                                          // де зараз казанок (під час обміну двох — дугою один спереду, другий позаду)
  const G = hagGame; let x = HAG_X[c.slot], y = HAG_CY;
  if (G.phase === 'shuffle' && G.si < G.swaps.length) {
    const [a, b] = G.pairs[G.si], u0 = Math.min(1, G.st / G.swaps[G.si]), u = u0 * u0 * (3 - 2 * u0);
    if (c.slot === a) { x = HAG_X[a] + (HAG_X[b] - HAG_X[a]) * u; y += Math.sin(u * Math.PI) * 13; }
    else if (c.slot === b) { x = HAG_X[b] + (HAG_X[a] - HAG_X[b]) * u; y -= Math.sin(u * Math.PI) * 9; }
  }
  return { x: Math.round(x), y: Math.round(y) };
}
function hagClick(e) {
  if (state.circus.noodle) { noodleClick(); return; }
  const G = hagGame; if (G.phase !== 'pick') return;
  const cv = ui.circusWheel, r = cv.getBoundingClientRect(), lx = (e.clientX - r.left) * cv.width / r.width, ly = (e.clientY - r.top) * cv.height / r.height;
  let best = -1, bd = 1e9; G.c.forEach((c, i) => { const p = hagPos(c), d = Math.abs(lx - p.x); if (d < 21 && ly > 40 && d < bd) { bd = d; best = i; } });
  if (best < 0) return;
  G.pick = best; G.phase = 'reveal'; G.rt = 0;
  const c = G.c[best], pr = applyCircusSector(c.prize, Date.now());
  ui.circusResult.textContent = t(c.main ? 'hagGood' : 'hagMiss') + ' ' + pr.text;
  playSfx(c.main ? 'wheelWin' : 'pip'); buzz(25);
  if (pr.skin >= 0) setTimeout(() => openLoot(pr.skin), 1500); else showToast(pr.text, 'good');
  updateUI(); saveGame(); updateCircusButtons();
}
function hagCauldron(g, x, y, lid, t, dim, jump) {
  // вогонь під казанком
  const fy = y + 1;
  for (let k = -9; k <= 9; k += 3) { const h = 4 + Math.round(Math.abs(Math.sin(t * 9 + k)) * 5); R(g, x + k, fy - h, 3, h, 'o'); R(g, x + k, fy - Math.max(2, h - 3), 3, Math.max(2, h - 3), 'y'); }
  R(g, x - 13, fy, 27, 3, 'd'); R(g, x - 11, fy - 1, 5, 2, 'b'); R(g, x + 5, fy - 1, 5, 2, 'b');
  // чавунний казан
  const cy = y - 12;
  R(g, x - 10, y - 4, 3, 5, 'd'); R(g, x + 8, y - 4, 3, 5, 'd');
  for (let dy = -11; dy <= 10; dy++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - (dy / 11.5) * (dy / 11.5))) * 13.5); R(g, x - half, cy + dy, half * 2 + 1, 1, 'd'); }
  for (let dy = -10; dy <= 9; dy++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - (dy / 11) * (dy / 11))) * 12.5); R(g, x - half, cy + dy, half * 2 + 1, 1, 'k'); }
  R(g, x - 9, cy - 4, 3, 7, 'z'); R(g, x - 8, cy - 3, 1, 4, 'e');
  R(g, x - 14, cy - 11, 29, 4, 'd'); R(g, x - 13, cy - 10, 27, 2, 'e'); R(g, x - 13, cy - 10, 27, 1, 'Y');
  R(g, x - 12, cy - 11, 25, 2, 'm'); R(g, x - 10, cy - 11, 6, 1, 'S');                 // зілля
  R(g, x + 6, cy - 6, 3, 8, 'e'); R(g, x + 7, cy - 4, 1, 4, 'Y'); R(g, x - 15, cy - 4, 3, 3, 'e'); R(g, x + 13, cy - 4, 3, 3, 'e');       // відблиск і вушка казана
  if (lid < 0.99) for (let k = 0; k < 3; k++) { const ph = (t * 0.8 + k / 3) % 1; g.globalAlpha = (1 - ph) * 0.9; disc(g, x - 6 + k * 6 + Math.round(Math.sin(t * 3 + k) * 2), Math.round(cy - 12 - ph * 12), 1 + (k % 2), 'S'); }
  g.globalAlpha = 1;
  // кришка — капелюх відьми: коли відкрито, підіймається вгору й вбік
  if (lid > 0.02) {
    const up = Math.round((1 - lid) * 22), sx = Math.round((1 - lid) * 8), lx = x + sx, ly = cy - 10 - up;
    R(g, lx - 15, ly - 3, 31, 4, 'k'); R(g, lx - 14, ly - 3, 29, 3, 'P'); R(g, lx - 14, ly - 3, 29, 1, 'v');
    for (let r = 0; r < 15; r++) { const half = Math.round(11 * (1 - r / 15)) + 2, off = -Math.round(r * 0.25); R(g, lx + off - half - 1, ly - 4 - r, half * 2 + 3, 1, 'k'); R(g, lx + off - half, ly - 4 - r, half * 2 + 1, 1, r < 4 ? 'V' : 'P'); R(g, lx + off - half, ly - 4 - r, 2, 1, 'v'); }
    R(g, lx - 9, ly - 8, 19, 3, 'V'); R(g, lx - 3, ly - 8, 6, 3, 'y'); R(g, lx - 1, ly - 7, 2, 1, 'k');
  }
  if (dim) { g.globalAlpha = 0.35; R(g, x - 14, cy - 12, 29, 25, 'V'); g.globalAlpha = 1; }
}
function drawHagGame() {
  const cv = ui.circusWheel; if (cv.width !== 192) return;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const G = hagGame, tt = G.t, W = 192, H = 120;
  g.clearRect(0, 0, W, H);
  R(g, 0, 0, W, 40, 'z'); R(g, 0, 40, W, 40, 'V'); R(g, 0, 80, W, 40, 'P');
  for (let i = 0; i < 18; i++) if (Math.sin(tt * 2 + i) > -0.5) R(g, (i * 53 + 11) % W, (i * 17 + 5) % 52, 1, 1, i % 3 ? 'w' : 'y');
  disc(g, 168, 18, 9, 'd'); disc(g, 168, 18, 8, 'o'); disc(g, 166, 16, 5, 'h');
  R(g, 0, 93, W, 27, 'z'); R(g, 0, 93, W, 1, 'u'); for (let x = 0; x < W; x += 12) R(g, x, 100 + ((x / 12) % 2) * 6, 7, 1, 'P');
  const list = G.c.map((c, i) => ({ c, i, p: hagPos(c) })).sort((a, b) => a.p.y - b.p.y);
  list.forEach(({ c, i, p }) => {
    hagCauldron(g, p.x, p.y, c.lid, tt, c.dim, 0);
    if (c.lid < 0.6) {                                            // приз плаває над казанком у золотому сяйві
      const bob = Math.round(Math.sin(tt * 3 + i) * 2), a = Math.min(1, (0.6 - c.lid) / 0.4);
      g.globalAlpha = 0.3 * a; disc(g, p.x, p.y - 40 + bob, 16, 'w'); g.globalAlpha = 0.45 * a; disc(g, p.x, p.y - 40 + bob, 12, 'y'); g.globalAlpha = a;
      drawCircusIcon(g, c.prize.icon || 'gem', p.x, p.y - 40 + bob); g.globalAlpha = 1;
      if (G.phase === 'reveal' && i === G.pick && Math.floor(tt * 6) % 2) { R(g, p.x - 18, p.y - 52, 1, 3, 'y'); R(g, p.x - 19, p.y - 51, 3, 1, 'y'); R(g, p.x + 18, p.y - 46, 1, 3, 'y'); R(g, p.x + 17, p.y - 45, 3, 1, 'y'); }
    }
  });
  if (G.phase === 'pick' && Math.floor(tt * 3) % 2) { list.forEach(({ p }) => { R(g, p.x - 1, p.y - 52, 3, 2, 'y'); R(g, p.x, p.y - 50, 1, 2, 'y'); }); }
}

/* ---- логіка ---- */
function circusStopX() { return mailBoxX() + 150; }   // стоїть на дорозі прямо над поштоматом (так, щоб шатра повністю його закрили) — прив'язаний до дороги, а не до екрана
function circusStartX() { return circus.sx !== undefined ? circus.sx : Math.max(visR() + 90, circusStopX() + 150); }   // звідки в'їжджає: трохи правіше від того, що видно в момент тапу, далі їде по дорозі
function bangPos() {
  const hi = TEAM.findIndex(m => m.spot && m.spot.x === null), hx = hi >= 0 ? actorHome(TEAM[hi]) : 0;      // «!» стоїть правіше за їжака з касою, щоб не перекривати його
  let x = Math.max(shop.x + shop.w + 50, hx + 36);
  if (x > visR() - 12) x = Math.max(visL() + 14, shop.x - 36);                                        // справа немає місця (телефон): ліворуч від магазину
  return { x, y: LAYOUT.streetTop + 9 };
}   // «!» стоїть далеко праворуч від магазину, щоб не заважав обзору й тапам   // «!» стоїть біля самого магазину, на тротуарі біля правої стіни
function circusY() { return mailRoadY() + 2; }
function circusQuiet() { return !dialog.active && !epochIntro.active && !build && !trouble && !ghostHunt && ui.modal.hidden && ui.wheelModal.hidden && ui.letterModal.hidden && ui.circusModal.hidden; }
function updateCircus(dt) {
  const c = state.circus, now = Date.now();
  circus.t += dt;
  const dayMs = CONFIG.DAY_SECONDS * 1000;
  if (!c.next) c.next = now + CONFIG.CIRCUS_FIRST_MINUTES * 60000;
  if (!circus.inited) {                           // після перезапуску цирк уже стоїть розкладений (або від'їжджає)
    circus.inited = true;
    if (c.phase === 2 || c.phase === 2.5 || c.phase === 2.7) { c.phase = 3; circus.setup = 1; }
    else if (c.phase === 3.5) c.phase = 4;
    if (c.phase === 3) circus.setup = 1;
  }
  if (c.phase === 0) {
    if (now >= c.next && circusQuiet() && mail.state === 'idle') { c.next = now + dayMs * (1.0 + 0.6 * Math.random()); c.phase = 1; c.spun = 0; c.hag = theme.season === 'halloween' ? 1 : 0; c.noodle = (!c.hag && curEpoch() === 8) ? 1 : 0; circus.bangT = 0; hagFly.on = false; hagFly.fast = false; hagFly.wait = 1.2; playSfx(c.hag ? 'hagTheme' : c.noodle ? 'noodleTheme' : 'circusMarch'); showToast(t(c.hag ? 'hagBang' : c.noodle ? 'noodleBang' : 'circusBang'), 'good'); saveGame(); }
  } else if (c.phase === 1) {                      // «!» чекає на тап, а з часом зникає (гравець сам вирішує, чи тикати)
    circus.bangT += dt;
    if (circus.bangT > CONFIG.CIRCUS_BANG_SECONDS) { c.phase = 0; saveGame(); }
  } else if (c.phase === 2.5) {                    // їде справа наліво
    if (c.hag && circus.hold) {                    // спершу Баба Яга пролітає, потім хатка виходить на дорогу
      circus.holdT += dt; circus.x = circusStartX(); circus.drive = 0; circus.setup = 0;
      if (!hagFly.on || hagFly.x < (visL() + visR()) / 2 || circus.holdT > 7) circus.hold = false;
    }
    if (!(c.hag && circus.hold)) circus.drive += dt;
    const k = Math.min(1, circus.drive / (c.hag ? 6 : CONFIG.CIRCUS_DRIVE_SECONDS));
    circus.x = circusStartX() + (circusStopX() - circusStartX()) * k;
    circus.setup = 0;
    if (k >= 1 && !(c.hag && circus.hold)) { c.phase = 2.7; circus.x = circusStopX(); circus.setupT = 0; playSfx(c.hag ? 'hagCackle' : 'build'); if (c.hag) spawnDust(circus.x, circusY(), 6); }
  } else if (c.phase === 2.7) {                    // шатро розкладається: колеса й платформа зникають, вилазять три куполи, виходить клоун
    circus.setupT += dt; circus.x = circusStopX();
    circus.setup = Math.min(1, circus.setupT / CONFIG.CIRCUS_SETUP_SECONDS);
    if (circus.setup >= 1) { c.phase = 3; showToast(t(c.hag ? 'hagArrived' : c.noodle ? 'noodleArrived' : 'circusArrived'), 'good'); playSfx('wheelWin'); saveGame(); }
  } else if (c.phase === 3) {
    circus.x = circusStopX(); circus.setup = 1;
  } else if (c.phase === 3.5) {                    // збирається назад
    circus.setupT -= dt; circus.x = circusStopX();
    circus.setup = Math.max(0, circus.setupT / CONFIG.CIRCUS_SETUP_SECONDS);
    if (circus.setup <= 0) { c.phase = 4; playSfx('pip'); }
  } else if (c.phase === 4) {                      // від'їжджає ліворуч
    circus.x -= (c.hag ? 48 : 60) * dt;
    if (circus.x < worldL() - 140) { c.phase = 0; if (c.next < now + 3 * 60000) c.next = now + 3 * 60000; saveGame(); }
  }
  updateHagFly(dt);
  updateCircusSpin(dt);
  if (c.hag) updateHagGame(dt);
  if (c.noodle) updateNoodleGame(dt);
  if (!ui.circusModal.hidden) { const g = ui.clownCanvas.getContext('2d'); g.imageSmoothingEnabled = false; if (c.hag) { drawHagGame(); HAG_ART.window(g, circus.t); } else if (c.noodle) { drawNoodleGame(); NOODLE_ART.window(g, circus.t); } else { drawCircusWheel(); CIRCUS_ART.clownWindow(g, circus.t); } }
}
/* ---- Баба Яга ---- */
const hagFly = { on: false, x: 0, y: 0, dir: -1, t: 0, wait: 0, fast: false };            // Баба Яга в ступі летить небом
function hagStartFlight() { hagFly.on = true; hagFly.dir = -1; hagFly.x = visR() + 60; hagFly.y = hallowSkyY() + rand(-4, 12); hagFly.t = 0; playSfx('hagCackle'); }
function updateHagFly(dt) {
  const c = state.circus;
  if (!(c.hag && (c.phase === 1 || (c.phase === 2.5 && (hagFly.on || hagFly.fast))))) { hagFly.on = false; hagFly.fast = false; return; }
  if (!hagFly.on) { if (c.phase !== 1) return; hagFly.wait -= dt; if (hagFly.wait <= 0) hagStartFlight(); return; }
  hagFly.t += dt; hagFly.x += hagFly.dir * (hagFly.fast ? 150 : 38) * dt;
  if (hagFly.x < visL() - 100) { hagFly.on = false; hagFly.fast = false; hagFly.wait = rand(2.5, 5); }
}
function drawHagFlyer() {                                           // єдина відьма: летить на мітлі замість цирку (лише на Хелловін)
  if (!hagFly.on) return;
  const x = Math.round(hagFly.x), y = Math.round(hagFly.y + Math.sin(hagFly.t * 2.2) * 5), dir = hagFly.dir;
  drawWitchSprite(x, y, dir, hagFly.t);
  if (hagFly.fast) { ctx.globalAlpha = 0.7; const P = (dx, dy, w) => R(ctx, dir < 0 ? x + dx : x - dx - w + 1, y + dy, w, 1, 'w'); P(30, -8, 10); P(36, 0, 12); P(28, 8, 8); ctx.globalAlpha = 1; }
}

const HAG_ART = (function () {
  function leg(g, x, hipY, footY, lift, sw) {                   // куряча лапа спереду: пухнасте «галіфе», гомілка нахиляється разом із кроком, пальці віялом із кігтями
    const fy = footY - lift, ax = x + sw, ay = fy - 6, y0 = hipY + 8;
    for (let d = -3; d <= 3; d++) lineG(g, x + d, y0, ax + d, ay, 'd');
    for (let d = -2; d <= 2; d++) lineG(g, x + d, y0, ax + d, ay, 'h');
    for (let d = -2; d <= -1; d++) lineG(g, x + d, y0, ax + d, ay, 'y');
    for (let k = 1; k < 5; k++) { const px = Math.round(x + (ax - x) * k / 5), py = Math.round(y0 + (ay - y0) * k / 5); R(g, px - 1, py, 4, 1, 'o'); }
    R(g, x - 8, hipY, 17, 7, 'd'); R(g, x - 7, hipY + 1, 15, 5, 'w'); R(g, x - 7, hipY + 1, 4, 5, 'W');
    [-8, -4, 0, 4, 7].forEach((dx, i) => { R(g, x + dx, hipY + 7, 3, 2 + (i % 2), 'd'); R(g, x + dx + 1, hipY + 7, 1, 1 + (i % 2), 'w'); });
    R(g, ax - 5, ay - 1, 10, 3, 'd'); R(g, ax - 4, ay, 8, 1, 'h');
    for (let d = 0; d < 3; d++) { lineG(g, ax - 1 + d, ay + 1, ax - 9 + d, fy, 'd'); lineG(g, ax - 1 + d, ay + 2, ax - 9 + d, fy, 'd'); lineG(g, ax + d + 1, ay + 1, ax + 9 + d, fy, 'd'); lineG(g, ax + d + 1, ay + 2, ax + 9 + d, fy, 'd'); }
    R(g, ax - 2, ay + 1, 4, fy - ay, 'd');
    lineG(g, ax - 1, ay + 1, ax - 9, fy, 'h'); lineG(g, ax + 2, ay + 1, ax + 10, fy, 'h'); R(g, ax - 1, ay + 1, 2, fy - ay, 'h');
    R(g, ax - 12, fy - 1, 4, 2, 'k'); R(g, ax + 10, fy - 1, 4, 2, 'k'); R(g, ax - 2, fy, 4, 1, 'k');
  }
  function face(g, cx, top, k, t) {                              // обличчя відьми: капелюх, рожеве волосся, блідий лик і усмішка
    const Rk = (dx, dy, w, h, c) => R(g, cx + dx * k, top + dy * k, w * k, h * k, c);
    const blink = (t % 3.2) > 3.05;
    Rk(-1, -2, 3, 1, 'V'); Rk(-2, -1, 5, 1, 'V'); Rk(-3, 0, 7, 1, 'V'); Rk(-1, 0, 3, 1, 'y'); Rk(-6, 1, 13, 2, 'V'); Rk(-6, 1, 2, 1, 'v');
    Rk(-6, 3, 3, 8, 'f'); Rk(-6, 3, 1, 8, 'J'); Rk(4, 3, 3, 6, 'f'); Rk(6, 3, 1, 6, 'J');
    Rk(-3, 3, 7, 8, 'W'); Rk(-3, 3, 7, 1, 'f'); Rk(-3, 3, 2, 2, 'f');
    if (blink) { Rk(-2, 7, 2, 1, 'k'); Rk(2, 7, 2, 1, 'k'); } else { Rk(-2, 6, 1, 2, 'k'); Rk(2, 6, 1, 2, 'k'); }
    Rk(-3, 8, 2, 1, 'q'); Rk(2, 8, 2, 1, 'q'); Rk(0, 9, 2, 1, 'r'); Rk(-2, 11, 5, 1, 'W');
  }
  function draw(g, t, s, moving) {
    g.clearRect(0, 0, 160, 84);
    const ss = s * s * (3 - 2 * s), walk = moving ? t * 5.2 : 0;
    const bob = moving ? Math.round(Math.abs(Math.sin(walk)) * 1.6) : 0, hipY = 56 + Math.round(ss * 18) - bob;
    const cabB = hipY + 3, cabH = 32, cabT = cabB - cabH, x0 = 44, x1 = 116, W = x1 - x0, groundY = 83;
    const stA = moving ? Math.sin(walk) : 0, stB = moving ? Math.sin(walk + Math.PI) : 0;
    leg(g, 66, hipY, groundY, Math.round(Math.max(0, stA) * 8), Math.round(stA * 3));
    leg(g, 96, hipY, groundY, Math.round(Math.max(0, stB) * 8), Math.round(stB * 3));
    // кістяний паркан й гарбузи, коли хатка присіла
    if (ss > 0.5) {
      const a = Math.min(1, (ss - 0.5) * 2); g.globalAlpha = a;
      [[16, 0], [28, 1], [132, 1], [144, 0]].forEach(([fx, tall]) => { R(g, fx, 70 + tall * 2, 2, 12 - tall * 2, 'd'); R(g, fx, 71 + tall * 2, 1, 11 - tall * 2, 'w'); R(g, fx - 2, 66 + tall * 2, 6, 5, 'd'); R(g, fx - 1, 67 + tall * 2, 4, 3, 'w'); R(g, fx - 1, 68 + tall * 2, 1, 1, 'k'); R(g, fx + 2, 68 + tall * 2, 1, 1, 'k'); });
      R(g, 28, 76, 104, 1, 'd');
      [[56, 80], [104, 80]].forEach(([px, py]) => { R(g, px - 5, py - 6, 11, 7, 'd'); R(g, px - 4, py - 5, 9, 5, 'o'); R(g, px - 4, py - 5, 3, 5, 'h'); R(g, px - 2, py - 4, 1, 1, 'k'); R(g, px + 2, py - 4, 1, 1, 'k'); R(g, px - 1, py - 2, 3, 1, 'k'); R(g, px, py - 8, 2, 2, 'g'); });
      g.globalAlpha = 1;
    }
    // стіни з колод
    R(g, x0, cabT, W, cabH, 'd'); R(g, x0 + 1, cabT + 1, W - 2, cabH - 2, 'b');
    for (let y = cabT + 6; y < cabB - 1; y += 6) { R(g, x0 + 1, y, W - 2, 1, 'd'); R(g, x0 + 1, y - 5, W - 2, 1, 'l'); }
    for (let y = cabT + 4; y < cabB - 2; y += 6) { R(g, x0 - 2, y - 2, 4, 5, 'd'); R(g, x0 - 1, y - 1, 2, 3, 'c'); R(g, x1 - 2, y - 2, 4, 5, 'd'); R(g, x1 - 1, y - 1, 2, 3, 'c'); }
    // вікна: тепле світло, фіранка
    const wf = Math.floor(t * 6) % 7 === 0 ? 'h' : 'y';
    [50, 98].forEach(wx => {
      const wy = cabT + 8;
      R(g, wx - 5, wy, 4, 13, 'k'); R(g, wx - 4, wy + 1, 2, 11, 'G'); R(g, wx - 4, wy + 1, 1, 11, 'g'); R(g, wx + 13, wy, 4, 13, 'k'); R(g, wx + 14, wy + 1, 2, 11, 'G'); R(g, wx + 15, wy + 1, 1, 11, 'g');   // віконниці
      R(g, wx - 1, wy - 1, 14, 14, 'k');
      [[0, 0], [7, 0], [0, 7], [7, 7]].forEach(([dx, dy]) => { R(g, wx + dx, wy + dy, 5, 5, wf); R(g, wx + dx, wy + dy, 2, 1, 'w'); R(g, wx + dx, wy + dy + 4, 5, 1, 'h'); });
      R(g, wx + 5, wy, 2, 12, 'd'); R(g, wx, wy + 5, 12, 2, 'd');
      R(g, wx, wy, 4, 2, 'r'); R(g, wx + 8, wy, 4, 2, 'r'); R(g, wx, wy + 2, 2, 1, 'r'); R(g, wx + 10, wy + 2, 2, 1, 'r');
      R(g, wx - 2, wy + 13, 16, 2, 'k'); R(g, wx - 2, wy + 13, 16, 1, 'l');
    });
    // двері: відчиняються, всередині тепло й видно Бабу Ягу
    const open = Math.max(0, Math.min(1, (s - 0.6) / 0.3));
    R(g, 72, cabB - 24, 17, 24, 'd'); R(g, 73, cabB - 23, 15, 23, open > 0.05 ? 'k' : 'P');
    if (open > 0.05) {
      R(g, 74, cabB - 22, 13, 22, 'o'); R(g, 74, cabB - 22, 13, 8, 'h');
      if (s > 0.85) { const wv = Math.floor(t * 2.5) % 2; face(g, 80, cabB - 21, 1, t); R(g, 76, cabB - 8, 9, 8, 'd'); R(g, 77, cabB - 8, 7, 8, 'P'); R(g, wv ? 85 : 86, cabB - 12 - wv * 2, 2, 5, 'm'); }
      R(g, 73, cabB - 23, Math.max(1, Math.round(3 * (1 - open))), 23, 'P');
    } else { R(g, 74, cabB - 22, 3, 22, 'u'); R(g, 78, cabB - 16, 1, 1, 'h'); R(g, 80, cabB - 17, 5, 4, 'd'); R(g, 81, cabB - 16, 3, 2, 'w'); R(g, 81, cabB - 16, 1, 1, 'k'); R(g, 83, cabB - 16, 1, 1, 'k'); }
    R(g, 74, cabB, 14, 2, 'e'); R(g, 74, cabB, 14, 1, 'E');
    // дах із черепиці й моху
    const apex = cabT - 25, ov = 8, half0 = W / 2 + ov;
    for (let r = 0; r < 25; r++) {
      const half = Math.round(half0 * (r + 1) / 25), y = apex + r;
      R(g, 80 - half, y, half * 2, 1, r % 4 === 3 ? 'd' : (r % 2 ? 'r' : 't'));
      R(g, 80 - half, y, 1, 1, 'd'); R(g, 80 + half - 1, y, 1, 1, 'd');
      for (let k = (r % 2) * 3; k < half * 2; k += 6) if (r % 4 !== 3) R(g, 80 - half + k, y, 1, 1, 'd');
      if ((r * 7) % 11 < 3) R(g, 80 - half + 6 + (r * 5) % 20, y, 5, 1, 'g');
    }
    R(g, 80 - half0, cabT - 2, half0 * 2, 3, 'd'); R(g, 80 - half0, cabT - 2, half0 * 2, 1, 'b');
    R(g, 78, apex - 1, 4, 2, 'd');
    R(g, 100, apex + 3, 9, 15, 'd'); R(g, 101, apex + 4, 7, 14, 'e'); R(g, 99, apex + 2, 11, 3, 'd'); R(g, 100, apex + 3, 9, 1, 'E');                       // димар
    for (let k = 0; k < 4; k++) { const ph = (t * 0.5 + k / 4) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.6; R(g, 103 + Math.round(Math.sin(t + k) * 3) + Math.round(ph * 8), apex - Math.round(ph * 22), 4 - Math.round(ph * 2) + 1, 3, k % 2 ? 'E' : 'w'); }
    g.globalAlpha = 1;
    R(g, 58, apex + 14, 4, 3, 'd'); R(g, 59, apex + 14, 2, 1, 'k'); R(g, 56, apex + 16, 2, 1, 'k'); R(g, 62, apex + 15, 2, 1, 'k'); R(g, 58, apex + 15, 1, 1, 'y');        // ворона на даху
    R(g, 52, cabT + 1, 1, 5, 'd'); R(g, 50, cabT + 6, 5, 7, 'd'); R(g, 51, cabT + 7, 3, 5, wf === 'h' ? 'h' : 'o'); R(g, 52, cabT + 8, 1, 2, 'y');                     // ліхтарик
  }
  const BUST = ['........kk........', '.......kPPk.......', '......kPvPPk......', '.....kPvPPPPk.....', '....kPPvPPPPPk....', '....kPPPPPPPPPk...', '...kPPyyyyyPPPPk..', '.kkkPPPPPPPPPPkkk.', 'kPPPPPPPPPPPPPPPPk', '.kJfkWWWWWWWWkfJk.', 'kfffkWWWWWWWWkfffk', 'kfffkWWkWWkWWkfffk', 'kfffkWqWWWWqWkfffk', 'kJffkWWWrrWWWkffJk', '.kffkkWWWWWWkkffk.', '..kffkkVVVVkkffk..', '.kPPPPPPPPPPPPPPk.', 'kPPPPPuuPPuuPPPPPk'];
  function window_(g, t) {                                       // портрет відьми у вікні хатки на тлі місяця (72×40)
    g.clearRect(0, 0, 72, 40);
    R(g, 0, 0, 72, 40, 'v'); R(g, 0, 20, 72, 20, 'u'); R(g, 0, 32, 72, 8, 'P');
    for (let i = 0; i < 14; i++) if (Math.sin(t * 2 + i) > -0.6) R(g, (i * 29 + 7) % 72, (i * 13 + 3) % 22, 1, 1, i % 3 ? 'w' : 'y');
    disc(g, 10, 11, 7, 'd'); disc(g, 10, 11, 6, 'o'); disc(g, 8, 9, 4, 'h'); R(g, 12, 12, 3, 2, 'o');
    const bx = Math.round(56 + Math.sin(t * 0.7) * 9), by = Math.round(7 + Math.sin(t * 1.9) * 2), fl = Math.floor(t * 8) % 2;
    R(g, bx - 1, by, 3, 2, 'k'); R(g, bx - 5, by - (fl ? 2 : 0), 4, 1, 'k'); R(g, bx + 2, by - (fl ? 2 : 0), 4, 1, 'k');
    const bob = Math.round(Math.sin(t * 2) * 1), blink = (t % 3.2) > 3.05;
    BUST.forEach((r, j) => { for (let i = 0; i < r.length; i++) { let c = r[i]; if (c === '.') continue; if (blink && j === 11 && c === 'k' && (i === 7 || i === 10)) c = 'W'; R(g, 18 + i * 2, 1 + bob + j * 2, 2, 2, c); } });
    R(g, 0, 36, 72, 4, 'd'); R(g, 0, 36, 72, 1, 'b');
    for (let i = 0; i < 5; i++) { R(g, 6 + i * 14, 33, 1, 4, 'w'); R(g, 5 + i * 14, 32, 3, 2, 'w'); }
  }
  return { draw, window: window_ };
})();
