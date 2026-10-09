//#part 230_circus.js
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
const SKIN_HIDDEN = ['street_snow', 'street_leaves', 'capy_sailor', 'capy_detective'];                // зимова й осіння бруківка вже є в порах року: зі списку прибрано (біти лишились, щоб не збити збереження)
const SKIN_TYPES = ['capy', 'shop', 'weather', 'street', 'hero'];   // групи скінів: Капі, магазин, погода, герої
const SKIN_POOL = ['capy_pirate', 'capy_astro', 'shop_candy', 'shop_gold', 'weather_rainbow', 'weather_lightning', 'hero_party', 'hero_ninja', 'capy_ep0', 'capy_ep1', 'capy_ep2', 'capy_ep3', 'capy_ep4', 'capy_ep5', 'capy_ep6', 'capy_ep7', 'capy_wizard', 'capy_chef', 'capy_explorer', 'capy_detective', 'capy_sailor', 'shop_ice', 'shop_wood', 'shop_garden', 'weather_cottoncloud', 'weather_goldcloud', 'weather_starcloud', 'hero_chef', 'hero_wizard', 'hero_royal', 'street_wood', 'street_brick', 'capy_santa', 'capy_witch', 'capy_flower', 'capy_beach', 'capy_autumn', 'hero_santa', 'hero_witch', 'shop_xmas', 'shop_halloween', 'shop_spring', 'shop_autumn', 'street_snow', 'street_leaves', 'capy_mel', 'capy_nika', 'capy_knight', 'capy_hero', 'capy_cowboy', 'capy_fairy', 'capy_viking', 'capy_pilot', 'weather_lightninggreen', 'weather_lightningred', 'street_moss', 'street_gold'];
const SKIN_SEASON = { capy_santa: '🎄', capy_witch: '🎃', capy_flower: '🌸', capy_beach: '🏖️', capy_autumn: '🍂', hero_santa: '🎄', hero_witch: '🎃', shop_xmas: '🎄', shop_halloween: '🎃', shop_spring: '🌸', shop_autumn: '🍂', street_snow: '❄️', street_leaves: '🍂' };   // сезонні скіни
function skinHas(i) { return i < 32 ? !!(state.skinsMask & (1 << i)) : !!(state.skinsMask2 & (1 << (i - 32))); }       // перші 32 скіни — у skinsMask, решта — у skinsMask2
function skinGrant(i) { if (i < 32) state.skinsMask |= (1 << i); else state.skinsMask2 |= (1 << (i - 32)); }
const SKINS_FREE = false;          // скіни відкриваються виграшем у цирку або купівлею
const SKIN_PRICE = 50;             // символічна ціна скіна в кристалах
function skinOwned(i) {
  if (SKIN_POOL[i] === 'capy_mel' || SKIN_POOL[i] === 'capy_nika') return true;                  // скіни розробників MEL і NIKA — подарунок усім
  const m = /^capy_ep(\d)$/.exec(SKIN_POOL[i]);
  if (m) return +m[1] === viewEpoch() % EPOCHS.length;      // скін епохи можна вдягнути лише в його власній епосі
  return SKINS_FREE || skinHas(i);
}
function skinName(i) { const id = SKIN_POOL[i], m = /^capy_ep(\d)$/.exec(id); return m ? t('skinEpoch', t('epoch_' + m[1])) : t('skin_' + id); }   // номер у списку = біт у state.skinsMask; перша частина — тип скіна
const circus = { x: 0, drive: 0, t: 0, bangT: 0, anim: null, angle: 0, tex: null, setup: 1, setupT: 0 };

/* ---- малюнок: шатро-причіп із колесом та клоуном (кольорові коди, окремий canvas 120×80) ---- */
const CIRCUS_ART = (function () {
  const D = '#4a3228', DD = '#2a1d1a', RED = '#c4553d', CR = '#fff4dc', YEL = '#ffe08a', GLD = '#f2b84b', BR = '#7a4f35', OUT = '#3a1f1a';
  const SEG = ['#c4553d', '#ffe08a', '#4f9a63', '#3d5a8c', '#ef8fa3', '#e8863c', '#8b6bb0', '#8ed4a6', '#f2b84b', '#86cfe8', '#ffc9d4', '#ff5fa2'];
  const rr = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const dsc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.4) rr(g, cx + x, cy + y, 1, 1, c); };
  const GL = {
    'Ц': ['#..#.', '#..#.', '#..#.', '#####', '....#'], 'И': ['#...#', '#..##', '#.#.#', '##..#', '#...#'], 'Р': ['####.', '#...#', '####.', '#....', '#....'],
    'К': ['#...#', '#..#.', '###..', '#..#.', '#...#'], 'Ф': ['..#..', '.###.', '#.#.#', '.###.', '..#..'], 'О': ['.###.', '#...#', '#...#', '#...#', '.###.'],
    'Т': ['#####', '..#..', '..#..', '..#..', '..#..'], 'У': ['#...#', '#...#', '.####', '....#', '.###.'], 'Н': ['#...#', '#...#', '#####', '#...#', '#...#'],
    'L': ['#....', '#....', '#....', '#....', '#####'], 'U': ['#...#', '#...#', '#...#', '#...#', '.###.'], 'C': ['.####', '#....', '#....', '#....', '.####'],
    'K': ['#...#', '#..#.', '###..', '#..#.', '#...#'], 'Y': ['#...#', '.#.#.', '..#..', '..#..', '..#..'], 'I': ['#####', '..#..', '..#..', '..#..', '#####'],
    'R': ['####.', '#...#', '####.', '#..#.', '#...#'], 'S': ['.####', '#....', '.###.', '....#', '####.']
  };
  // довгий прапор-стрічка з назвою; кожен стовпчик іде хвилею
  function flag(g, x0, y0, len, t, fill, ink, text) {
    const pix = {}; let cx = 3;
    for (const ch of text) { if (ch === ' ') { cx += 3; continue; } const gl = GL[ch]; if (!gl) continue; gl.forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') (pix[cx + rx] = pix[cx + rx] || []).push(ry); }); cx += 6; }
    for (let i = 0; i < len; i++) {
      const amp = 0.4 + 1.8 * (i / len), off = Math.round(Math.sin(i * 0.32 - t * 5) * amp), top = y0 + off, h = 9;
      const notch = i > len - 6 ? i - (len - 6) : 0;
      for (let y = 0; y < h; y++) { if (notch && Math.abs(y - 4) < Math.min(notch, 4) && i > len - notch) continue; rr(g, x0 + i, top + y, 1, 1, (y === 0 || y === h - 1) ? CR : fill); }
      (pix[i] || []).forEach(ry => rr(g, x0 + i, top + 2 + ry, 1, 1, ink));
    }
  }
  function wheelF(g, cx, cy, rad, t) {
    const rot = t * 0.4;
    for (let y = -rad - 2; y <= rad + 2; y++) for (let x = -rad - 2; x <= rad + 2; x++) {
      const r = Math.sqrt(x * x + y * y); if (r > rad + 1.6) continue; let col;
      if (r > rad - 0.6) col = D;
      else if (r > rad - 2.4) { const a = Math.atan2(y, x) + rot; col = (Math.floor(a / 0.4488) + Math.floor(t * 3)) % 2 ? YEL : CR; }
      else if (r < 2.4) col = r < 1.4 ? GLD : D;
      else { const a = Math.atan2(y, x) + rot + Math.PI * 2, k = Math.floor(a / (Math.PI * 2 / 12)) % 12; col = SEG[k]; const fr = (a / (Math.PI * 2 / 12)) % 1; if (fr < 0.1 || fr > 0.93) col = D; }
      rr(g, cx + x, cy + y, 1, 1, col);
    }
    rr(g, cx - 2, cy - rad - 3, 5, 1, GLD); rr(g, cx - 2, cy - rad - 2, 5, 1, D); rr(g, cx - 1, cy - rad - 1, 3, 1, RED); rr(g, cx, cy - rad, 1, 2, RED);
  }
  function clown(g, ox, by, t) {
    const arm = Math.floor(t * 3) % 2;
    rr(g, ox, by - 2, 5, 2, D); rr(g, ox + 1, by - 2, 3, 1, RED); rr(g, ox + 6, by - 2, 5, 2, D); rr(g, ox + 7, by - 2, 3, 1, RED);
    rr(g, ox + 1, by - 7, 3, 5, '#4f9a63'); rr(g, ox + 7, by - 7, 3, 5, YEL);
    rr(g, ox + 1, by - 14, 9, 8, D); rr(g, ox + 2, by - 13, 7, 7, '#8b6bb0');
    [[3, 11], [6, 9], [4, 8], [7, 12], [5, 13]].forEach(q => rr(g, ox + q[0], by - q[1], 1, 1, YEL));
    rr(g, ox + 1, by - 15, 9, 2, D); rr(g, ox + 2, by - 14, 7, 1, CR); rr(g, ox + 4, by - 14, 3, 1, '#ef8fa3');
    if (arm) { rr(g, ox - 2, by - 13, 3, 2, D); rr(g, ox - 3, by - 17, 2, 5, D); rr(g, ox - 2, by - 16, 1, 4, '#8b6bb0'); rr(g, ox - 4, by - 18, 2, 2, CR); rr(g, ox + 9, by - 12, 3, 5, D); rr(g, ox + 10, by - 11, 1, 4, '#8b6bb0'); }
    else { rr(g, ox - 2, by - 12, 3, 5, D); rr(g, ox - 1, by - 11, 1, 4, '#8b6bb0'); rr(g, ox + 9, by - 13, 3, 2, D); rr(g, ox + 11, by - 17, 2, 5, D); rr(g, ox + 11, by - 16, 1, 4, '#8b6bb0'); rr(g, ox + 12, by - 18, 2, 2, CR); }
    dsc(g, ox + 5, by - 20, 5, D); dsc(g, ox + 5, by - 20, 4, CR);
    dsc(g, ox - 1, by - 21, 2, D); dsc(g, ox - 1, by - 21, 1, '#e8863c'); dsc(g, ox + 11, by - 21, 2, D); dsc(g, ox + 11, by - 21, 1, '#e8863c');
    rr(g, ox + 3, by - 21, 1, 2, DD); rr(g, ox + 7, by - 21, 1, 2, DD);
    rr(g, ox + 4, by - 19, 3, 2, RED); rr(g, ox + 5, by - 20, 1, 1, '#ff8a7a');
    rr(g, ox + 3, by - 17, 5, 1, RED); rr(g, ox + 2, by - 18, 1, 1, RED); rr(g, ox + 8, by - 18, 1, 1, RED);
    rr(g, ox + 3, by - 28, 5, 1, D); rr(g, ox + 4, by - 27, 3, 2, '#3d5a8c'); rr(g, ox + 3, by - 25, 5, 1, '#3d5a8c'); rr(g, ox + 2, by - 24, 7, 1, D); rr(g, ox + 5, by - 29, 1, 1, YEL);
  }
  // шатро: гострий верх, смуги віялом, фестончасті стінки, темний вхід (кожне малюється один раз)
  function makeTent(o) {
    const W = o.w, H = o.h, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    const cx = o.cx, ay = o.ay, roofB = o.roofB, floor = o.floor, scallop = o.scallop, c1 = o.c1, c2 = o.c2, cap = '#7a2f2f', shade = '#c9bfb0', fan = o.fan;
    const hwRoof = y => 3 + (o.hw - 3) * Math.pow((y - ay) / (roofB - ay), 1.7);
    const edge = x => roofB + 2 - Math.round(o.sc * Math.sin(Math.PI * ((((x - cx + 600) % scallop) / scallop))));
    for (let y = ay; y <= floor; y++) {
      const inRoof = y <= roofB + 2;
      const hw = inRoof ? Math.round(hwRoof(Math.min(y, roofB))) : o.hw + 3 - Math.round(2 * Math.sin((y - roofB) / (floor - roofB) * Math.PI));
      for (let x = cx - hw; x <= cx + hw; x++) {
        const e = edge(x); let col;
        if (y < e) { if (y < ay + o.capH && Math.abs(x - cx) < 4 + (y - ay) * 0.2) col = cap; else col = Math.floor(((x - cx) / Math.max(2, y - ay + 2)) * fan + 200) % 2 ? c1 : c2; }
        else { col = Math.floor((x - cx + 200) / o.stripe) % 2 ? c1 : c2; if (y > e + 1 && y < e + 3 && (x + y) % 2) col = shade; }
        rr(g, x, y, 1, 1, col);
      }
    }
    [[cx - 2, ay + 6], [cx + 1, ay + 8], [cx - 1, ay + 4]].forEach(p => rr(g, p[0], p[1], 1, 1, CR));
    if (o.door) {
      for (let y = 48; y <= floor; y++) { const hw = y < 52 ? 3 + (y - 48) * 1.5 : 9; for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) rr(g, x, y, 1, 1, '#1d1410'); }
      for (let y = 50; y <= floor; y++) { rr(g, cx - 10 - Math.floor((y - 50) / 8), y, 2, 1, CR); rr(g, cx + 9 + Math.floor((y - 50) / 8), y, 2, 1, CR); }
    } else {
      for (let y = floor - 9; y <= floor; y++) { const hw = y < floor - 6 ? 2 : 4; for (let x = cx - hw; x <= cx + hw; x++) rr(g, x, y, 1, 1, '#1d1410'); }
    }
    const d = g.getImageData(0, 0, W, H).data, has = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0;
    const out = document.createElement('canvas'); out.width = W; out.height = H; const og = out.getContext('2d'); og.fillStyle = OUT;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!has(x, y) && (has(x - 1, y) || has(x + 1, y) || has(x, y - 1) || has(x, y + 1))) og.fillRect(x, y, 1, 1);
    og.drawImage(cv, 0, 0);
    return out;
  }
  let tents = null;
  const clamp01 = v => Math.max(0, Math.min(1, v)), eo = k => 1 - (1 - k) * (1 - k), back = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  // s: 0 — їде причіпом, 1 — розкладений: платформа й колеса зникли, шатро сіло на землю, виросли два малі шатра, клоун вийшов і махає
  function draw(g, t, s, moving) {
    if (!tents) tents = {
      main: makeTent({ w: 160, h: 84, cx: 80, ay: 14, roofB: 44, floor: 62, hw: 31, scallop: 12, sc: 3, fan: 5, stripe: 6, capH: 12, c1: RED, c2: CR, door: true }),
      side: makeTent({ w: 48, h: 44, cx: 24, ay: 3, roofB: 22, floor: 38, hw: 18, scallop: 8, sc: 2, fan: 4, stripe: 4, capH: 8, c1: RED, c2: CR, door: false }),
      side2: makeTent({ w: 48, h: 44, cx: 24, ay: 3, roofB: 22, floor: 38, hw: 18, scallop: 8, sc: 2, fan: 4, stripe: 4, capH: 8, c1: CR, c2: RED, door: false })
    };
    g.clearRect(0, 0, 160, 84);
    const e = (a, b) => clamp01((s - a) / (b - a)), GY = 76;
    const bob = moving ? Math.floor(t * 6) % 2 : 0, sink = 14 * eo(e(0.10, 0.45)), platA = 1 - eo(e(0.0, 0.30));
    // малі шатра виростають із землі (з відскоком) і здіймають пил
    [[tents.side, 30, e(0.30, 0.58)], [tents.side2, 130, e(0.45, 0.72)]].forEach(([cv, cx, k]) => {
      if (k <= 0) return;
      const sc = Math.max(0.05, back(k)), sx = 0.6 + 0.4 * Math.min(1, sc);
      g.save(); g.translate(cx, GY); g.scale(sx, sc); g.drawImage(cv, -24, -38); g.restore();
      if (k < 0.95) for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI, r = 2 + 6 * k + i % 2; g.globalAlpha = 0.6 * (1 - k); dsc(g, Math.round(cx + Math.cos(a) * (14 + 10 * k) * (i % 2 ? 1 : -1)), GY - 1 - Math.round(Math.sin(a) * 3 * k), 2, CR); }
      g.globalAlpha = 1;
    });
    // головне шатро (разом зі щоглою й прапором) осідає на землю
    g.save(); g.translate(0, bob + sink);
    g.drawImage(tents.main, 0, 0);
    rr(g, 80, 3, 1, 12, OUT); flag(g, 81, 3, 70, t, RED, CR, circusFlagText());
    g.restore();
    // платформа й колеса візка зникають
    if (platA > 0.02) {
      g.save(); g.globalAlpha = platA; g.translate(0, bob + (1 - platA) * 10);
      rr(g, 38, 62, 84, 6, D); rr(g, 39, 63, 82, 4, BR); rr(g, 39, 63, 82, 1, '#a8703f'); rr(g, 39, 67, 82, 1, '#5a3a28');
      for (let x = 42; x < 122; x += 6) rr(g, x, 65, 2, 1, YEL);
      rr(g, 34, 65, 5, 2, D); rr(g, 34, 64, 2, 1, GLD);
      for (let x = 40; x <= 124; x += 4) rr(g, x, 61, 2, 1, (Math.floor(t * 3) + (x - 40) / 4) % 2 ? YEL : '#4f9a63');
      g.restore();
      g.save(); g.globalAlpha = platA; g.translate(0, (1 - platA) * 12);
      [48, 110].forEach(wx => { const wy = 71; dsc(g, wx, wy, 5, DD); dsc(g, wx, wy, 4, '#6a5a50'); dsc(g, wx, wy, 1, GLD); for (let k = 0; k < 4; k++) { const a = t * 6 * platA + k * Math.PI / 2; for (let i = 1; i < 4; i++) rr(g, wx + Math.cos(a) * i, wy + Math.sin(a) * i, 1, 1, CR); } });
      g.restore();
      g.globalAlpha = 1;
    }
    // колесо фортуни їде з платформи на землю, ближче до малого шатра
    const wk = eo(e(0.10, 0.60)), wx = lerp(50, 108, wk), wy = lerp(52 + bob, 64, wk);
    if (wy + 10 < GY) rr(g, wx - 1, wy + 10, 3, GY - wy - 10, D);
    wheelF(g, Math.round(wx), Math.round(wy), 11, t);
    // клоун: стоїть на платформі → заходить у шатро → виходить на землю й махає рукою
    const walkIn = e(0.12, 0.30), walkOut = e(0.62, 0.84);
    let cxp = 96, vis = 1;
    if (s < 0.30) cxp = lerp(96, 75, eo(walkIn));
    else if (s < 0.62) { cxp = 75; vis = 0; }
    else cxp = lerp(75, 52, eo(walkOut));
    if (s > 0.26 && s <= 0.34) vis = 1 - e(0.26, 0.34); else if (s >= 0.56 && s < 0.64) vis = e(0.56, 0.64);
    if (vis > 0.02) { g.globalAlpha = vis; clown(g, Math.round(cxp), Math.round(62 + sink + bob * (s < 0.3 ? 1 : 0)), t); g.globalAlpha = 1; }
  }
  // клоун у вікні колеса: жонглює, підстрибує, моргає (canvas 72×40)
  function clownWindow(g, t) {
    g.clearRect(0, 0, 72, 40); rr(g, 0, 0, 72, 40, '#c4ebf5');
    for (let x = 0; x < 72; x += 6) { g.globalAlpha = 0.25; rr(g, x, 0, 3, 40, '#ffffff'); g.globalAlpha = 1; }
    rr(g, 0, 34, 72, 6, RED); rr(g, 0, 34, 72, 1, CR);
    for (let i = 0; i < 12; i++) rr(g, i * 6 + 1, 36, 2, 2, i % 2 ? YEL : CR);
    const hop = Math.abs(Math.sin(t * 3)) * 3, by = 33 - hop, ox = 30;
    ['#c4553d', YEL, '#4f9a63'].forEach((c, k) => { const a = t * 4 + k * 2.09, bx = ox + 5 + Math.cos(a) * 16, byb = by - 28 - Math.sin(a) * 10; dsc(g, bx, byb, 2, D); dsc(g, bx, byb, 1, c); });
    rr(g, ox, by - 2, 5, 2, D); rr(g, ox + 6, by - 2, 5, 2, D); rr(g, ox + 1, by - 2, 3, 1, RED); rr(g, ox + 7, by - 2, 3, 1, RED);
    rr(g, ox + 1, by - 7, 3, 5, '#4f9a63'); rr(g, ox + 7, by - 7, 3, 5, YEL);
    rr(g, ox + 1, by - 14, 9, 8, D); rr(g, ox + 2, by - 13, 7, 7, '#8b6bb0');
    [[3, 11], [6, 9], [4, 8], [7, 12], [5, 13]].forEach(q => rr(g, ox + q[0], by - q[1], 1, 1, YEL));
    rr(g, ox + 1, by - 15, 9, 2, D); rr(g, ox + 2, by - 14, 7, 1, CR); rr(g, ox + 4, by - 14, 3, 1, '#ef8fa3');
    const up = Math.floor(t * 4) % 2;
    rr(g, ox - 2, by - (up ? 17 : 12), 3, 5, D); rr(g, ox - 1, by - (up ? 16 : 11), 1, 4, '#8b6bb0');
    rr(g, ox + 10, by - (up ? 12 : 17), 3, 5, D); rr(g, ox + 11, by - (up ? 11 : 16), 1, 4, '#8b6bb0');
    const hy = by - 20;
    dsc(g, ox + 5, hy, 5, D); dsc(g, ox + 5, hy, 4, CR);
    dsc(g, ox - 1, hy - 1, 2, D); dsc(g, ox - 1, hy - 1, 1, '#e8863c'); dsc(g, ox + 11, hy - 1, 2, D); dsc(g, ox + 11, hy - 1, 1, '#e8863c');
    if ((t % 2.4) > 2.25) { rr(g, ox + 3, hy - 1, 2, 1, DD); rr(g, ox + 7, hy - 1, 2, 1, DD); } else { rr(g, ox + 3, hy - 1, 1, 2, DD); rr(g, ox + 7, hy - 1, 1, 2, DD); }
    rr(g, ox + 4, hy + 1, 3, 2, RED); rr(g, ox + 5, hy, 1, 1, '#ff8a7a');
    const sm = Math.floor(t * 2) % 2; rr(g, ox + 3, hy + 3 + sm, 5, 1, RED); rr(g, ox + 2, hy + 2 + sm, 1, 1, RED); rr(g, ox + 8, hy + 2 + sm, 1, 1, RED);
    rr(g, ox + 3, hy - 8, 5, 1, D); rr(g, ox + 4, hy - 7, 3, 2, '#3d5a8c'); rr(g, ox + 3, hy - 5, 5, 1, '#3d5a8c'); rr(g, ox + 2, hy - 4, 7, 1, D); rr(g, ox + 5, hy - 9, 1, 1, YEL);
    for (let i = 0; i < 8; i++) { const x = (i * 9 + t * 8) % 72, y = (i * 7 + t * 14) % 34; rr(g, x, y, 1, 1, ['#ef8fa3', YEL, '#4f9a63', '#3d5a8c'][i % 4]); }
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
function bangPos() { return { x: Math.min(visR() - 14, shop.x + shop.w + 50), y: LAYOUT.streetTop + 9 }; }   // «!» стоїть далеко праворуч від магазину, щоб не заважав обзору й тапам   // «!» стоїть біля самого магазину, на тротуарі біля правої стіни
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
    if (now >= c.next && circusQuiet() && mail.state === 'idle') { c.next = now + dayMs * (1.0 + 0.6 * Math.random()); c.phase = 1; c.spun = 0; c.hag = theme.season === 'halloween' ? 1 : 0; circus.bangT = 0; hagFly.on = false; hagFly.fast = false; hagFly.wait = 1.2; playSfx(c.hag ? 'hagTheme' : 'circusMarch'); showToast(t(c.hag ? 'hagBang' : 'circusBang'), 'good'); saveGame(); }
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
    if (circus.setup >= 1) { c.phase = 3; showToast(t(c.hag ? 'hagArrived' : 'circusArrived'), 'good'); playSfx('wheelWin'); saveGame(); }
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
  if (!ui.circusModal.hidden) { const g = ui.clownCanvas.getContext('2d'); g.imageSmoothingEnabled = false; if (c.hag) { drawHagGame(); HAG_ART.window(g, circus.t); } else { drawCircusWheel(); CIRCUS_ART.clownWindow(g, circus.t); } }
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
const circusCanvas = document.createElement('canvas'); circusCanvas.width = 160; circusCanvas.height = 84;
function drawCircus() {
  const c = state.circus; if (c.phase < 2) return;
  const s = circus.setup === undefined ? 0 : circus.setup, moving = c.phase === 2.5 || c.phase === 4;
  const g = circusCanvas.getContext('2d'); if (c.hag) HAG_ART.draw(g, circus.t, s, moving); else CIRCUS_ART.draw(g, circus.t, s, moving);
  const x = Math.round(circus.x) - 80, y = circusY();
  ctx.globalAlpha = 0.25; R(ctx, x + 6 + Math.round(8 * s), y - 2, 128 - Math.round(8 * s) * 2 + (s < 0.5 ? -30 + Math.round(60 * s) : 0), 3, 'd'); ctx.globalAlpha = 1;
  ctx.drawImage(circusCanvas, x, y - 76);
  if (c.phase === 3 && !c.spun && Math.floor(circus.t * 2) % 2) {        // мерехтливі іскри — «тапни на мене»
    R(ctx, x + 26, y - 78, 1, 3, 'y'); R(ctx, x + 25, y - 77, 3, 1, 'y'); R(ctx, x + 136, y - 56, 1, 3, 'y'); R(ctx, x + 135, y - 55, 3, 1, 'y'); R(ctx, x + 70, y - 90, 1, 3, 'y'); R(ctx, x + 69, y - 89, 3, 1, 'y');
  }
}
function drawBang() {
  const c = state.circus; if (c.phase !== 1) return;
  const p = bangPos(), steps = [1, 1.15, 1.3, 1.15], k = steps[Math.floor(circus.bangT * 4) % 4], spr = CIRCUS_ART.bangSprite();
  const w = Math.round(9 * k), h = Math.round(20 * k);
  if (circus.bangT > CONFIG.CIRCUS_BANG_SECONDS - 8 && Math.floor(circus.bangT * 6) % 2) return;       // наприкінці блимає й зникає
  ctx.globalAlpha = 0.25; R(ctx, p.x - 5, p.y - 1, 11, 2, 'd'); ctx.globalAlpha = 1;
  ctx.drawImage(spr, Math.round(p.x - w / 2), p.y - h, w, h);
}
function hitCircus(p) {
  const c = state.circus;
  if (c.phase === 1) {
    const b = bangPos();
    if (Math.abs(p.x - b.x) <= 12 && p.y >= b.y - 30 && p.y <= b.y + 6) {
      c.phase = 2.5; circus.drive = 0; circus.sx = undefined; circus.sx = circusStartX(); circus.x = circus.sx; saveGame();
      if (c.hag) { circus.hold = true; circus.holdT = 0; hagFly.fast = true; if (!hagFly.on) hagStartFlight(); playSfx('hagCackle'); } else playSfx('build');
      return true;
    }
  } else if (c.phase === 3) {
    const y = circusY();
    if (p.x >= circus.x - 80 && p.x <= circus.x + 80 && p.y >= y - 80 && p.y <= y) { openCircus(); return true; }
  }
  return false;
}

/* ---- вікно колеса ---- */
function drawCircusIcon(g, icon, cx, cy) {
  switch (icon) {
    case 'gem2': drawWheelIcon(g, 'gem', cx - 4, cy + 2); drawWheelIcon(g, 'gem', cx + 4, cy - 2); break;
    case 'gem3': drawWheelIcon(g, 'gem', cx - 5, cy + 3); drawWheelIcon(g, 'gem', cx + 5, cy + 3); drawWheelIcon(g, 'gem', cx, cy - 3); break;
    case 'brick': R(g, cx - 6, cy - 4, 13, 9, 'd'); R(g, cx - 5, cy - 3, 5, 3, 'E'); R(g, cx + 1, cy - 3, 5, 3, 'E'); R(g, cx - 5, cy + 1, 2, 3, 'E'); R(g, cx - 2, cy + 1, 5, 3, 'E'); R(g, cx + 4, cy + 1, 2, 3, 'E'); break;
    case 'house': R(g, cx - 5, cy - 1, 11, 7, 'd'); R(g, cx - 4, cy, 9, 5, 'w'); for (let i = 0; i < 5; i++) R(g, cx - 5 + i, cy - 2 - i, 11 - 2 * i, 1, 'd'); for (let i = 0; i < 4; i++) R(g, cx - 4 + i, cy - 2 - i, 9 - 2 * i, 1, 'r'); R(g, cx - 1, cy + 2, 3, 4, 'd'); break;
    case 'cloud': disc(g, cx - 3, cy + 1, 3, 'd'); disc(g, cx + 3, cy + 1, 3, 'd'); disc(g, cx, cy - 2, 4, 'd'); disc(g, cx - 3, cy + 1, 2, 'w'); disc(g, cx + 3, cy + 1, 2, 'w'); disc(g, cx, cy - 2, 3, 'w'); R(g, cx - 4, cy + 3, 9, 2, 'w'); disc(g, cx + 5, cy - 5, 2, 'y'); break;
    case 'paw': disc(g, cx, cy + 2, 4, 'd'); disc(g, cx, cy + 2, 3, 'c'); [[-4, -3], [-1, -5], [2, -5], [5, -3]].forEach(p => { disc(g, cx + p[0], cy + p[1], 2, 'd'); disc(g, cx + p[0], cy + p[1], 1, 'c'); }); break;
    case 'bag': R(g, cx - 4, cy - 2, 9, 8, 'd'); R(g, cx - 3, cy - 1, 7, 6, 'h'); R(g, cx - 2, cy - 5, 5, 3, 'd'); R(g, cx - 1, cy - 4, 3, 1, 'h'); R(g, cx, cy, 1, 3, 'd'); break;
    case 'hat': R(g, cx - 6, cy + 2, 13, 3, 'd'); R(g, cx - 5, cy + 3, 11, 1, 'u'); R(g, cx - 3, cy - 6, 7, 9, 'd'); R(g, cx - 2, cy - 5, 5, 7, 'u'); R(g, cx - 2, cy, 5, 2, 'y'); R(g, cx, cy - 3, 1, 1, 'w'); break;
    case 'gift': R(g, cx - 5, cy - 1, 11, 8, 'd'); R(g, cx - 4, cy, 9, 6, 'r'); R(g, cx - 1, cy - 1, 3, 8, 'y'); R(g, cx - 5, cy + 2, 11, 1, 'y'); R(g, cx - 4, cy - 4, 4, 3, 'd'); R(g, cx - 3, cy - 3, 2, 1, 'y'); R(g, cx + 1, cy - 4, 4, 3, 'd'); R(g, cx + 2, cy - 3, 2, 1, 'y'); break;
    case 'clover': disc(g, cx - 3, cy - 2, 3, 'd'); disc(g, cx + 3, cy - 2, 3, 'd'); disc(g, cx - 3, cy + 3, 3, 'd'); disc(g, cx + 3, cy + 3, 3, 'd'); disc(g, cx - 3, cy - 2, 2, 'g'); disc(g, cx + 3, cy - 2, 2, 'g'); disc(g, cx - 3, cy + 3, 2, 'g'); disc(g, cx + 3, cy + 3, 2, 'g'); R(g, cx, cy, 1, 7, 'G'); break;
    default: drawWheelIcon(g, icon, cx, cy);
  }
}
function buildCircusWheelTexture() {
  const S = 128, cv = document.createElement('canvas'); cv.width = S; cv.height = S; const g = cv.getContext('2d');
  const cx = 64, cy = 64, step = Math.PI / 6;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.sqrt(dx * dx + dy * dy);
    if (r > 62) continue;
    let col;
    if (r >= 59) col = 'd';
    else if (r < 9) col = r >= 7 ? 'd' : 'h';
    else { let a = Math.atan2(dx, -dy); if (a < 0) a += Math.PI * 2; const sec = Math.floor(a / step), frac = a / step - sec, edge = Math.min(frac, 1 - frac) * step * r; col = edge < 0.9 ? 'd' : (r >= 55.5 && r < 57 ? ((Math.floor(a / step * 3) % 2) ? 'w' : 'y') : CIRCUS_SECTORS[sec].color); }
    R(g, x, y, 1, 1, col);
  }
  CIRCUS_SECTORS.forEach((s, i) => { const a = (i + 0.5) * step; drawCircusIcon(g, s.icon, Math.round(cx + Math.sin(a) * 38), Math.round(cy - Math.cos(a) * 38)); });
  return cv;
}
function drawCircusWheel() {
  const g = ui.circusWheel.getContext('2d'); g.imageSmoothingEnabled = false;
  if (!circus.tex) circus.tex = buildCircusWheelTexture();
  g.clearRect(0, 0, 128, 140); g.save(); g.translate(64, 76); g.rotate(circus.angle); g.drawImage(circus.tex, -64, -64); g.restore();
  for (let i = 0; i < 12; i++) { R(g, 64 - (12 - i), 2 + i, (12 - i) * 2, 1, 'd'); if (i > 1) R(g, 64 - (12 - i) + 2, 2 + i, (12 - i) * 2 - 4, 1, 'r'); }
}
function circusBusy() { return !!circus.anim || (!!state.circus.hag && ['show', 'shuffle', 'pick', 'reveal'].includes(hagGame.phase)); }
function openCircus() {
  if (dialog.active) return;
  const hag = !!state.circus.hag;
  ui.circusModal.classList.toggle('hag', hag);
  if (hag) { ui.circusWheel.width = 192; ui.circusWheel.height = 120; if (hagGame.phase === 'idle' || hagGame.phase === 'done') hagReset(); if (state.circus.spun && hagGame.phase === 'idle') hagGame.phase = 'done'; }
  else { ui.circusWheel.width = 128; ui.circusWheel.height = 140; }
  ui.circusModal.hidden = false;
  ui.circusTitle.textContent = t(hag ? 'hagTitle' : 'circusTitle'); ui.circusSub.textContent = t(hag ? 'hagSub' : 'circusSub');
  ui.circusClose.textContent = t(state.circus.spun ? (hag ? 'hagDone' : 'circusDone') : 'wheelClose');
  ui.circusResult.textContent = '';
  updateCircusButtons();
}
function updateCircusButtons() {
  const hag = !!state.circus.hag;
  ui.circusBtn.textContent = t(hag ? 'hagStart' : 'circusSpin');
  ui.circusBtn.disabled = circusBusy() || !!state.circus.spun;
}
function closeCircus() {
  if (circusBusy()) return;
  ui.circusModal.hidden = true;
  if (state.circus.spun && state.circus.phase === 3) { state.circus.phase = 3.5; circus.setupT = CONFIG.CIRCUS_SETUP_SECONDS; circus.x = circusStopX(); playSfx('build'); saveGame(); }
}
function circusFreeSkins(type) { return SKIN_POOL.map((id, i) => i).filter(i => SKIN_POOL[i].split('_')[0] === type && !SKIN_HIDDEN.includes(SKIN_POOL[i]) && !SKIN_POOL[i].startsWith('capy_ep') && SKIN_POOL[i] !== 'capy_mel' && SKIN_POOL[i] !== 'capy_nika' && !skinHas(i)); }   // скіни епох у колесі не випадають
// Один випадковий сектор (з урахуванням скінів, що вже є) і його дія
function rollCircusSector(noSmall) {
  const weight = x => (x.kind === 'skin' && !circusFreeSkins(x.skin).length ? 0 : (noSmall && x.kind === 'crystal' && (x.amount || 1) === 1 ? 0 : x.weight));
  const total = CIRCUS_SECTORS.reduce((a, x) => a + weight(x), 0);
  let roll = Math.random() * total, idx = 0;
  for (; idx < CIRCUS_SECTORS.length - 1; idx++) { roll -= weight(CIRCUS_SECTORS[idx]); if (roll < 0) break; }
  return { sec: CIRCUS_SECTORS[idx], idx };
}
function applyCircusSector(sec, now) {
  let text, skinPick = -1;
  if (sec.kind === 'coins' || sec.kind === 'jackpot') {
    const gain = Math.floor(state.cps * sec.seconds + sec.flat * levelMult()); state.coins += gain; state.totalEarned += gain;
    text = t(sec.kind === 'jackpot' ? 'prize_jackpot' : 'prize_coins', fmt(gain)); if (sec.kind === 'jackpot') state.stats.jackpots++;
  } else if (sec.kind === 'crystal') { const n = sec.amount || 1; state.crystals += n; state.crystalsTotal += n; text = t('prize_crystal', n); }
  else if (sec.kind === 'income') { state.events.incomeBoostUntil = now + sec.minutes * 60000; state.events.incomeBoostMult = sec.mult; text = t('prize_income', sec.mult, sec.minutes); }
  else if (sec.kind === 'tap') { state.events.tapBoostUntil = now + sec.minutes * 60000; state.events.tapBoostMult = sec.mult; text = t('prize_tap', sec.mult, sec.minutes); }
  else { const free = circusFreeSkins(sec.skin), pick = free[Math.floor(Math.random() * free.length)]; skinGrant(pick); skinPick = pick; text = t('prize_skin', skinName(pick)); }
  recalcIncome();
  return { text, skin: skinPick };
}
function circusSpin() {
  if (circusBusy() || state.circus.spun) return;
  if (state.circus.hag) { hagStart(); return; }
  const now = Date.now(), { sec, idx } = rollCircusSector(false), pr = applyCircusSector(sec, now), text = pr.text, skinPick = pr.skin;
  const step = Math.PI / 6, from = circus.angle % (Math.PI * 2), to = Math.PI * 2 * 5 + (Math.PI * 2 - (idx + 0.5) * step) + rand(-0.35, 0.35) * step;
  circus.anim = { t: 0, dur: CONFIG.WHEEL_SPIN_SECONDS, from, to, text, again: false, skin: skinPick };
  ui.circusResult.textContent = '…';
  state.circus.spun = 1;
  updateCircusButtons(); updateUI(); saveGame();
}
// Епічний лут: окреме святкове вікно з промінням і блиском, коли випав скін
let lootSkin = -1;
function openLoot(i) {
  const id = SKIN_POOL[i], type = id.split('_')[0], name = id.slice(type.length + 1);
  lootSkin = i;
  const src = skinPreviewCanvas(type, name), cv = ui.lootCanvas;
  cv.width = src.width; cv.height = src.height;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(src, 0, 0);
  const scale = Math.max(2, Math.floor(Math.min(300 / src.width, 130 / src.height)));
  cv.style.width = (src.width * scale) + 'px'; cv.style.height = (src.height * scale) + 'px';
  ui.lootTag.textContent = t('lootTag');
  ui.lootName.textContent = (SKIN_SEASON[id] ? SKIN_SEASON[id] + ' ' : '') + skinName(i);
  ui.lootType.textContent = t('skinCat_' + type);
  ui.lootWear.textContent = t('lootWear'); ui.lootClose.textContent = t('lootClose');
  ui.lootModal.querySelectorAll('.loot-spark').forEach(e => e.remove());
  for (let k = 0; k < 18; k++) {
    const sp = document.createElement('span'); sp.className = 'loot-spark'; sp.textContent = k % 3 ? '✦' : '✧';
    sp.style.left = (8 + Math.random() * 84) + '%'; sp.style.top = (28 + Math.random() * 50) + '%';
    sp.style.animationDelay = (Math.random() * 2.4).toFixed(2) + 's'; sp.style.fontSize = (11 + Math.random() * 14).toFixed(0) + 'px';
    ui.lootModal.appendChild(sp);
  }
  ui.lootModal.hidden = false;
  playSfx('achievement'); buzz(40);
}
function closeLoot(wear) {
  ui.lootModal.hidden = true;
  if (wear && lootSkin >= 0) { const id = SKIN_POOL[lootSkin], type = id.split('_')[0]; if (state.skins[type] !== lootSkin) equipSkin(type, lootSkin); }
  lootSkin = -1;
}
function updateCircusSpin(dt) {
  const a = circus.anim; if (!a) return;
  a.t += dt;
  const k = Math.min(1, a.t / a.dur), e = 1 - Math.pow(1 - k, 3), prev = Math.floor(circus.angle / (Math.PI / 6));
  circus.angle = a.from + (a.to - a.from) * e;
  if (Math.floor(circus.angle / (Math.PI / 6)) !== prev && performance.now() - audio.lastTick > 40) { audio.lastTick = performance.now(); playSfx('wheelTick'); }
  if (k >= 1) {
    circus.anim = null; circus.angle = a.to % (Math.PI * 2);
    ui.circusResult.textContent = a.text; playSfx('wheelWin');
    if (a.skin >= 0) setTimeout(() => openLoot(a.skin), 500); else showToast(a.text, 'good');
    ui.circusClose.textContent = t(state.circus.spun ? 'circusDone' : 'wheelClose');
    updateCircusButtons(); updateUI(); saveGame();
  }
}


/* ---------- Поштова машина: раз на 40 хвилин привозить лист із випадковим бонусом ---------- */
const mail = { state: 'idle', x: 0, t: 0, letter: null };
function mailRoadY() { return worldB() - 7; }                 // де стоять колеса на дорозі
function mailStopX() { return LAYOUT.centerX - 70; }
function mailBoxX() { return mailStopX() - 30; }
function updateMail(dt) {
  const now = Date.now(), ev = state.events;
  if (!ev.nextMail) ev.nextMail = now + CONFIG.MAIL_FIRST_SECONDS * 1000;
  const quiet = !dialog.active && !epochIntro.active && !build && ui.modal.hidden && ui.wheelModal.hidden && ui.letterModal.hidden;
  if (mail.state === 'idle') {
    if (now >= ev.nextMail && quiet && state.circus.phase === 0) {
      ev.nextMail = now + CONFIG.MAIL_MINUTES * 60000;
      if (!ev.mailPending) {
        const pool = CUSTOMER_TYPES.filter(k => k !== 'raccoon' && k !== mail.who);                          // щоразу інший звіряток-кур'єр
        mail.who = pool[Math.floor(Math.random() * pool.length)]; mail.said = false; mail.honk = false; mail.dustT = 0;
        mail.state = 'arriving'; mail.x = Math.max(mailStopX() + 130, Math.min(worldR() + 50, visR() + 60)); mail.t = 0; playSfx('sale'); showToast(t('mailArrive'), 'big');
      }
    }
    return;
  }
  mail.t += dt;
  const moving = mail.state === 'arriving' || mail.state === 'leaving', gy = mailRoadY();
  if (moving && animOn()) {                                                                                 // вихлопні клубочки позаду й пил із-під коліс
    mail.dustT -= dt;
    if (mail.dustT <= 0) { mail.dustT = 0.1; fx.dust.push({ x: mail.x + 19, y: gy - 3, r: 1.6, vx: rand(8, 16), vy: rand(-12, -5), age: 0, life: 0.7 }); if (mail.state === 'leaving') fx.dust.push({ x: mail.x + 17, y: gy - 1, r: 1.8, vx: rand(10, 20), vy: rand(-6, -1), age: 0, life: 0.5 }); }
  }
  if (mail.state === 'arriving') {
    const d = mail.x - mailStopX();
    mail.x -= Math.max(9, Math.min(55, d * 1.5)) * dt;                                                      // підʼїжджає повільніше й гальмує
    if (mail.x <= mailStopX() + 0.4) { mail.x = mailStopX(); mail.state = 'stopped'; mail.t = 0; spawnDust(mail.x - 11, gy, 3); spawnDust(mail.x + 9, gy, 2); playSfx('pip'); }
  } else if (mail.state === 'stopped') {
    const T = MAIL_T;
    if (mail.t > T.wave0 && !mail.said) { mail.said = true; const cp = mailCourier(); if (cp) showBubble('mailer', t('mailSay' + Math.floor(Math.random() * 4)), cp.x, cp.foot - 30, () => { const q = mailCourier(); if (q) mail.lastCp = { x: q.x, y: q.foot - 30 }; return mail.lastCp || { x: cp.x, y: cp.foot - 30 }; }); }
    if (mail.t > T.put1 && !ev.mailPending) { ev.mailPending = 1; saveGame(); playSfx('wheelWin'); }
    if (mail.t > T.in1 + 0.15 && !mail.honk) { mail.honk = true; playSfx('pip'); }
    if (mail.t > T.leave) { mail.state = 'leaving'; mail.t = 0; }
  } else if (mail.state === 'leaving') {
    mail.x -= Math.min(70, 12 + mail.t * 45) * dt;
    if (mail.x < worldL() - 50) { mail.state = 'idle'; }
  }
}
// Кур'єр: вистрибує із задніх дверцят, іде до поштомата, кладе лист, махає й повертається. Повертає позицію й позу (або null, коли він у кузові)
const MAIL_T = { out0: 0.45, out1: 0.95, walk1: 2.55, put1: 3.35, wave0: 3.4, wave1: 4.4, back1: 6.0, in1: 6.5, door1: 6.9, leave: 7.1 };
function mailCourier() {
  const t = mail.t, T = MAIL_T, gy = mailRoadY(), rx = Math.round(mail.x) + 20, bx = mailBoxX() + 15, foot0 = gy + 3;
  if (mail.state !== 'stopped' || t < T.out0 || t >= T.in1) return null;
  let x, foot = foot0, flip = true, pose = 'walk';
  if (t < T.out1) { const u = (t - T.out0) / (T.out1 - T.out0); x = rx - 8 + 8 * u; foot = gy - 9 + (foot0 - (gy - 9)) * u * u - Math.sin(u * Math.PI) * 6; pose = 'jump'; }
  else if (t < T.walk1) { const u = (t - T.out1) / (T.walk1 - T.out1); x = rx + (bx - rx) * u; }
  else if (t < T.wave0) { x = bx; pose = 'put'; }
  else if (t < T.wave1) { x = bx; flip = false; pose = 'wave'; foot -= Math.abs(Math.sin((t - T.wave0) * 8)) * 3; }
  else if (t < T.back1) { const u = (t - T.wave1) / (T.back1 - T.wave1); x = bx + (rx - bx) * u; flip = false; }
  else { const u = (t - T.back1) / (T.in1 - T.back1); x = rx - 8 * u; foot = foot0 + ((gy - 9) - foot0) * u * u - Math.sin(u * Math.PI) * 6; flip = false; pose = 'jump'; }
  return { x: Math.round(x), foot: Math.round(foot), flip, pose, fr: (pose === 'walk' || pose === 'put') && pose === 'walk' ? Math.floor(animClock * 7) % 2 : 0 };
}
function drawPostCap(cx, ht, flip) {                                                                        // поштова кепка: синя з жовтим значком і козирком
  R(ctx, cx - 4, ht - 2, 9, 3, 'd'); R(ctx, cx - 3, ht - 3, 7, 3, 'n'); R(ctx, cx - 2, ht - 4, 5, 1, 'n'); R(ctx, cx - 1, ht - 3, 3, 2, 'y'); R(ctx, cx, ht - 3, 1, 1, 'r');
  R(ctx, flip ? cx - 7 : cx + 3, ht, 5, 1, 'd'); R(ctx, flip ? cx - 6 : cx + 3, ht, 3, 1, 'z');
}
function drawMailTruck() {
  const x = Math.round(mail.x), moving = mail.state === 'arriving' || mail.state === 'leaving';
  const y = mailRoadY() - (moving && Math.floor(animClock * 10) % 2 ? 1 : 0);
  ctx.globalAlpha = 0.25; R(ctx, x - 17, y, 36, 2, 'd'); ctx.globalAlpha = 1;
  R(ctx, x - 18, y - 16, 35, 15, 'd');                                   // контур
  R(ctx, x - 2, y - 15, 17, 12, 'n'); R(ctx, x - 2, y - 15, 17, 1, 'v');   // фургон
  R(ctx, x + 2, y - 13, 9, 6, 'w'); R(ctx, x + 2, y - 13, 9, 1, 'd'); R(ctx, x + 2, y - 8, 9, 1, 'd'); lineG(ctx, x + 2, y - 13, x + 6, y - 10, 'd'); lineG(ctx, x + 10, y - 13, x + 6, y - 10, 'd');   // конверт на борту
  R(ctx, x - 2, y - 5, 17, 1, 'h');
  R(ctx, x - 15, y - 11, 13, 8, 'n'); R(ctx, x - 14, y - 10, 5, 4, 's'); R(ctx, x - 14, y - 10, 2, 1, 'S'); R(ctx, x - 6, y - 10, 3, 3, 'h');   // кабіна
  R(ctx, x - 17, y - 8, 3, 5, 'n'); R(ctx, x - 17, y - 4, 3, 2, 'e'); R(ctx, x - 17, y - 7, 1, 2, 'y');
  [x - 11, x + 9].forEach(wx => { disc(ctx, wx, y - 2, 3, 'd'); R(ctx, wx - 1, y - 3, 2, 2, 'e'); });
  const T = MAIL_T, st = mail.state === 'stopped', cp = mailCourier();
  if (!st || mail.t < T.out0 || mail.t >= T.in1) { R(ctx, x - 13, y - 9, 3, 3, 'l'); R(ctx, x - 14, y - 10, 5, 1, 'n'); R(ctx, x - 12, y - 8, 1, 1, 'd'); }          // водій у кабіні в кепці
  if (st) {                                                                                                // задні дверцята відчиняються, у кузові видно пакунки
    const open = mail.t < 0.3 ? 0 : mail.t < 0.5 ? (mail.t - 0.3) / 0.2 : mail.t < T.in1 ? 1 : mail.t < T.door1 ? 1 - (mail.t - T.in1) / (T.door1 - T.in1) : 0;
    if (open > 0.05) {
      R(ctx, x + 12, y - 14, 5, 12, 'k'); R(ctx, x + 12, y - 5, 4, 3, 'c'); R(ctx, x + 12, y - 5, 4, 1, 'w'); R(ctx, x + 13, y - 8, 3, 3, 'h'); R(ctx, x + 14, y - 8, 1, 3, 'r'); R(ctx, x + 12, y - 11, 3, 3, 'c');
      const dw = Math.max(1, Math.round(4 * open)); R(ctx, x + 17, y - 15, dw, 13, 'z'); R(ctx, x + 17, y - 15, dw, 1, 'n'); R(ctx, x + 17 + dw - 1, y - 15, 1, 13, 'd');
    }
  }
  if (cp) {                                                                                                // кур'єр-звіреня
    const sx = cp.x - 9, sy = cp.foot - 23;
    ctx.globalAlpha = 0.22; R(ctx, cp.x - 6, cp.foot, 12, 1, 'd'); ctx.globalAlpha = 1;
    drawSprite(ctx, mail.who + '_' + cp.fr, sx, sy, { flip: cp.flip });
    R(ctx, cp.flip ? sx + 10 : sx + 2, sy + 13, 6, 5, 'd'); R(ctx, cp.flip ? sx + 11 : sx + 3, sy + 14, 4, 3, 'h'); R(ctx, cp.flip ? sx + 12 : sx + 4, sy + 14, 2, 1, 'w');         // сумка з листами
    drawPostCap(sx + 9, sy + 8, cp.flip);
    const slotX = mailBoxX() + 1, slotY = y - 18;
    if (cp.pose === 'walk' && mail.t < T.walk1 + 0.001 || cp.pose === 'jump' && mail.t < T.out1) R(ctx, cp.flip ? sx - 1 : sx + 15, sy + 14, 4, 3, 'w');           // лист у лапках
    if (cp.pose === 'put') {                                                                              // конверт летить із лапки в комірку
      const u = Math.min(1, (mail.t - T.walk1) / 0.7), ex = Math.round(sx - 1 + (slotX - (sx - 1)) * u), ey = Math.round(sy + 14 + (slotY - (sy + 14)) * u - Math.sin(u * Math.PI) * 6);
      if (u < 1) { R(ctx, ex, ey, 4, 3, 'w'); R(ctx, ex + 1, ey + 1, 2, 1, 'r'); }
    }
    if (cp.pose === 'wave') { const w = Math.floor(animClock * 8) % 2; R(ctx, sx + 16, sy + 8 - w, 2, 5, 'd'); R(ctx, sx + 16, sy + 8 - w, 1, 4, 'B'); }                    // махає лапкою
  }
}
// Поштомат біля дороги: синя скринька на стовпчику. З листом прапорець піднімається, лист визирає й блимає
function drawMailBox() {
  const x = mailBoxX(), y = mailRoadY() - 1, pending = !!state.events.mailPending, blink = Math.floor(animClock * 3) % 2, g = ctx;
  g.globalAlpha = 0.28; R(g, x - 9, y - 1, 19, 2, 'd'); g.globalAlpha = 1;
  R(g, x - 2, y - 14, 5, 14, 'd'); R(g, x - 1, y - 14, 3, 14, 'b'); R(g, x - 1, y - 14, 1, 14, 'l');                // стовпчик
  R(g, x - 5, y - 2, 11, 2, 'd'); R(g, x - 4, y - 1, 9, 1, 'e');
  R(g, x - 7, y - 28, 15, 1, 'd'); R(g, x - 9, y - 27, 19, 1, 'd'); R(g, x - 10, y - 26, 21, 13, 'd');             // корпус із заокругленим верхом
  R(g, x - 6, y - 27, 13, 1, 'n'); R(g, x - 8, y - 26, 17, 1, 'n'); R(g, x - 9, y - 25, 19, 11, 'n');
  R(g, x - 6, y - 27, 11, 1, 's'); R(g, x - 8, y - 26, 4, 1, 's'); R(g, x - 9, y - 25, 2, 10, 'u');
  R(g, x + 6, y - 25, 3, 11, 'z');
  R(g, x - 9, y - 15, 19, 1, 'z');
  R(g, x - 5, y - 24, 9, 6, 'd'); R(g, x - 4, y - 23, 7, 4, 'w'); lineG(g, x - 4, y - 23, x, y - 20, 'e'); lineG(g, x + 2, y - 23, x, y - 20, 'e');   // конверт на дверцятах
  R(g, x - 3, y - 17, 7, 1, 'k');                                                                                  // щілина
  R(g, x + 10, y - 26, 2, 12, 'd'); R(g, x + 10, y - 26, 1, 12, 'e');                                               // вісь прапорця
  if (pending) {
    R(g, x + 9, y - 36, 1, 11, 'd'); R(g, x + 10, y - 36, 6, 4, 'd'); R(g, x + 11, y - 35, 4, 2, blink ? 'y' : 'r');   // прапорець угорі
    R(g, x - 4, y - 18, 7, 2, 'w'); R(g, x + 1, y - 18, 1, 1, 'r');                                                // лист визирає зі щілини
    if (Math.floor(animClock * 4) % 2) { R(g, x - 13, y - 24, 1, 3, 'y'); R(g, x - 14, y - 23, 3, 1, 'y'); R(g, x + 15, y - 20, 1, 3, 'y'); R(g, x + 14, y - 19, 3, 1, 'y'); }
  } else { R(g, x + 10, y - 20, 6, 3, 'd'); R(g, x + 11, y - 19, 4, 1, 'r'); }                                      // прапорець опущений
}
// Червона скринька «Новини» поруч із синім поштоматом: тап — відкриває лист від розробників; поки новину не прочитано, прапорець угорі блимає
const NEWS_VERSION = 17;
function newsUnread() { return (state.newsSeen | 0) < NEWS_VERSION; }
function newsBoxX() { return mailBoxX() - 27; }
function drawNewsBox() {
  const x = newsBoxX(), y = mailRoadY() - 1, unread = newsUnread(), blink = Math.floor(animClock * 3) % 2, g = ctx;
  g.globalAlpha = 0.28; R(g, x - 9, y - 1, 19, 2, 'd'); g.globalAlpha = 1;
  R(g, x - 2, y - 14, 5, 14, 'd'); R(g, x - 1, y - 14, 3, 14, 'b'); R(g, x - 1, y - 14, 1, 14, 'l');                // стовпчик
  R(g, x - 5, y - 2, 11, 2, 'd'); R(g, x - 4, y - 1, 9, 1, 'e');
  R(g, x - 7, y - 28, 15, 1, 'd'); R(g, x - 9, y - 27, 19, 1, 'd'); R(g, x - 10, y - 26, 21, 13, 'd');             // корпус
  R(g, x - 6, y - 27, 13, 1, 'r'); R(g, x - 8, y - 26, 17, 1, 'r'); R(g, x - 9, y - 25, 19, 11, 'r');
  R(g, x - 6, y - 27, 11, 1, 'J'); R(g, x - 8, y - 26, 4, 1, 'J'); R(g, x - 9, y - 25, 2, 10, 'o');
  R(g, x + 6, y - 25, 3, 11, 'P');
  R(g, x - 9, y - 15, 19, 1, 'P');
  R(g, x - 5, y - 24, 9, 6, 'd'); R(g, x - 4, y - 23, 7, 4, 'w'); R(g, x - 3, y - 22, 5, 1, 'e'); R(g, x - 3, y - 20, 3, 1, 'e'); R(g, x + 1, y - 22, 2, 2, 'h');   // газета на дверцятах
  R(g, x - 3, y - 17, 7, 1, 'k');                                                                                  // щілина
  R(g, x + 10, y - 26, 2, 12, 'd'); R(g, x + 10, y - 26, 1, 12, 'e');                                               // вісь прапорця
  if (unread) {
    R(g, x + 9, y - 36, 1, 11, 'd'); R(g, x + 10, y - 36, 6, 4, 'd'); R(g, x + 11, y - 35, 4, 2, blink ? 'y' : 'h');   // прапорець угорі
    R(g, x - 4, y - 18, 7, 2, 'w'); R(g, x - 3, y - 18, 3, 1, 'e');                                                // газета визирає зі щілини
    if (Math.floor(animClock * 4) % 2) { R(g, x - 13, y - 24, 1, 3, 'y'); R(g, x - 14, y - 23, 3, 1, 'y'); R(g, x + 15, y - 20, 1, 3, 'y'); R(g, x + 14, y - 19, 3, 1, 'y'); }
  } else { R(g, x + 10, y - 20, 6, 3, 'd'); R(g, x + 11, y - 19, 4, 1, 'r'); }
}
function hitNews(p) {
  const x = newsBoxX(), y = mailRoadY();
  if (Math.abs(p.x - x) <= 14 && p.y >= y - 38 && p.y <= y + 3) { openNews(); return true; }
  return false;
}
// Випуски газети (новий — першим). Картинки лише до найбільших змін; тексти двома мовами. Для нового випуску: додай запис угору й підніми NEWS_VERSION.
const NEWS_ISSUES = [{"ver":17,"uk":[["Гості епох просять допомоги.","Тепер кожен гість має свою біду, прив’язану до його місця: у П’єтро сови тягнуть монетки з фонтану, у Піпа їжаки розкотили платівки, у Зіни втекли дзеркальні кулі, у Макса з хапалки повтікали іграшки, у Бітика баги в сервері, у Лесика хамелеони на грядці, в Орбіта аксолотлі розтягли пальне, у Лумі кошенята забрали ліхтарики, а в Бруно сови крадуть фарби."],["Лови істот: 12 штук.","Під рахунком з’явиться рядок «Допоможи Піпу: 4/12». Тапай по істотах епохи, коли вони пробігають вулицею: кожна впіймана рахується. Упіймаєш 12 — отримаєш кристал. Поки гість просить допомоги, істоти приходять трохи частіше."],["Подяка перед подорожжю.","Коли захочеш рушати далі, гість окремою сценою подякує за допомогу. Не вдалося допомогти? Подорож усе одно дозволена, просто без подяки."],["Історії переписано.","Усі дев’ять історій у «Щоденнику» тепер про прохання гостей, а Шнирь тут завжди трохи винен. У «Щоденнику» видно, скільки вже допомоги зібрано, а подяку можна перечитати."],["Нові репліки гостей.","Гості нагадують про своє прохання, а коли допомогу завершено, дякують. Тапни по гостю чи його місцю, і почуєш."],["Зірки помічників.","Прокачав звірятко до 10-го рівня? Тепер можна дати йому до трьох зірок: бонус росте ×1,25, ×1,5 і ×2. Зірка коштує як 10-й рівень, помножений на 5, 25 і 125. Через це звичайна прокачка трохи подорожчала. Зірки скидаються разом із рівнями при подорожі в часі."],["Нові екрани завантаження.","Капі на екрані завантаження стала детальнішою й без рожевого та квіточки: з бірюзовим рюкзаком. Є п’ять сцен, і щоразу показується інша: нічне місто, світанок на ринку, дощ із блискавкою, снігопад із санями й подорож крізь час. Підказки лишились."],["Диско ожило.","У Диско над містом стоять великі прожектори. Промені блимають різними кольорами, і прожектори стоять на місці світу, а не рухаються разом з екраном."],["Тап по гостю чи його речах.","Тапни по гостю або його місцю, і він скаже, що йому потрібно, і скільки вже зроблено. Рядок «Допоможи …» показується лише на кілька секунд після впійманої істоти."],["Барабан на кнопці й їжак.","Кнопка щоденного «Барабана фортуни» тепер із малюнком барабана, а не ігрового автомата. Їжак Голка став більшим і круглішим, щоб його було видно за прилавком."]],"en":[["Era guests ask for help.","Every guest now has a problem tied to their place: Pietro’s owls pull coins out of the fountain, Pip’s hedgehogs rolled the records away, Zina’s mirror balls ran off, Max’s toys fled the claw machine, Bitik’s server has bugs, Lesyk’s chameleons hide on the bed, Orbit’s axolotls scattered the fuel, Lumi’s kittens took the lanterns, and Bruno’s owls steal paints."],["Catch 12 creatures.","A line appears under the balance: “Help Pip: 4/12”. Tap the creatures of the era when they run down the street: every catch counts. Catch 12 and you get a crystal. While a guest asks for help, the creatures come a bit more often."],["Thanks before the journey.","When you are ready to move on, the guest thanks you in a separate scene. Did not manage to help? The journey is still allowed, just without the thanks."],["Stories rewritten.","All nine stories in the Diary are now about the guests’ requests, and Shnyr is always a little guilty. The Diary shows how much help is collected, and you can reread the thanks."],["New guest lines.","Guests remind you about their request, and thank you when it is done. Tap a guest or their place and listen."],["Helper stars.","Upgraded a helper to level 10? Now it can earn up to three stars: the bonus grows ×1.25, ×1.5 and ×2. A star costs the level-10 price multiplied by 5, 25 and 125. Because of this, normal upgrades got a little pricier. Stars reset with the levels when you time travel."],["New loading screens.","Capy on the loading screen is more detailed, no longer pink and without the flower: now with a teal backpack. There are five scenes and a different one shows each time: night city, a market sunrise, rain with lightning, snowfall with a sleigh and a journey through time. The tips stay."],["Disco comes alive.","In the Disco era big spotlights stand above the town. The beams blink in different colors, and the spotlights stay fixed in the world instead of moving with the screen."],["Tap a guest or their things.","Tap a guest or their place and they tell you what they need and how far you are. The “Help …” line shows only for a few seconds after a creature is caught."],["A drum on the button and a better hedgehog.","The daily Fortune Drum button now shows a drum instead of a slot machine. Spike the hedgehog is bigger and rounder, so he is visible behind the counter."]],"pics":{},"intro":{"uk":"Привіт, друже! У цьому випуску: гості епох просять допомоги, зірки для помічників, нові екрани завантаження й оживлене Диско. Гортай сторінки!","en":"Hi, friend! In this issue: era guests ask for help, stars for helpers, new loading screens and a livelier Disco. Turn the pages!"}},{"ver":16,"uk":[["У кожного гостя епохи тепер своє місце.","Ліворуч від магазину стоять: розкішний фонтан бажань у П’єтро, джубокс і бар у Піпа, великі колонки в Зіни, автомат-хапалка в Макса, серверна стійка в Бітика, грядка в Лесика, ракета в Орбіта, неонове колесо в Лумі й галерея в Бруно. Усе рухається. Тапни по місцю, і гість щось скаже."],["Меню на телефоні нижче.","Нижня панель стала компактнішою, іконки заповнюють кнопки, а картина гри в портретному режимі стала вищою."],["М’якший звук тапання.","Звук тапу став нижчим і м’якшим, а при довгому тапанні ще й тихішає, щоб не різало вухо."],["Капі підстрибує.","Тапни по Капі, і вона підстрибне. Вночі світло магазину більше не перекриває її."],["Новий їжак Голка.","У Голки чіткіші колючки: тепер він справді схожий на їжака."],["Кристали без «часу».","У текстах кристали часу стали просто кристалами. Осколки часу лишились осколками."]],"en":[["Every era guest now has a place.","Left of the shop you will find: a lavish wishing fountain for Pietro, a jukebox and a bar for Pip, big speakers for Zina, a claw machine for Max, a server rack for Bitik, a garden bed for Lesyk, a rocket for Orbit, a neon wheel for Lumi and a gallery for Bruno. Everything moves. Tap a place and the guest will say something."],["The phone menu sits lower.","The bottom bar is more compact, the icons fill the buttons and the game picture is taller in portrait mode."],["Softer tap sound.","The tap sound is lower and softer, and it also fades during long tapping so it does not hurt your ears."],["Capy hops.","Tap Capy and she hops. At night the shop light no longer covers her."],["A new hedgehog Spike.","Spike has sharper quills: now he really looks like a hedgehog."],["Crystals without “time”.","In the texts time crystals became just crystals. Time shards stay shards."]],"pics":{},"intro":{"uk":"Привіт, друже! У цьому випуску: місця для гостей епох, фонтан П’єтро, нижче меню на телефоні й м’якший звук тапання. Гортай сторінки!","en":"Hi, friend! In this issue: places for era guests, Pietro’s fountain, a lower phone menu and a softer tap sound. Turn the pages!"}},{"ver":15,"uk":[["Планети в Космосі справжні.","Планета з кільцем і місяць стали об’ємними: світло, тінь, кратери, а кільце відкидає тінь на планету. Вони висять у небі й повільно пливуть, коли гортаєш вулицю, а не липнуть до екрана."],["Збереження тепер подвійне.","Гра тримає другу копію прогресу й сама відновлює її, якщо основне збереження пошкодилось. Раз на тиждень вона нагадає скопіювати код, а в налаштуваннях видно, коли це було востаннє."],["Режим економії.","Якщо гра гальмує, вона сама вимикає дощ, пару, птахів і зайві частинки. Увімкнути чи вимкнути його можна в налаштуваннях."],["Звіт про помилки.","У налаштуваннях з’явилась кнопка «Скопіювати звіт». Якщо щось зламалось, надішли цей текст розробникам. Особистих даних там нема."],["Про гру й політика конфіденційності.","Нова картка «Про гру» з версією та ліцензією шрифту і кнопка політики конфіденційності. Поштову скриньку розробників теж налаштовано: capytap.games@gmail.com."],["Дрібниці.","Гра краще працює у версії для телефона: збереження не губиться, кнопка «Назад» і пауза у фоні. Перед кожним випуском усе перевіряє автоматичний тест."]],"en":[["Real planets in Space.","The ringed planet and the moon now look three-dimensional: light, shadow, craters, and the ring casts a shadow on the planet. They hang in the sky and drift slowly when you scroll the street instead of sticking to the screen."],["Your save is now doubled.","The game keeps a second copy of your progress and restores it by itself if the main save gets damaged. Once a week it reminds you to copy your code, and Settings shows when you last did."],["Power saving mode.","If the game slows down, it switches off rain, steam, birds and extra particles by itself. You can turn it on or off in Settings."],["Error report.","Settings now has a “Copy report” button. If something breaks, send that text to the developers. It contains no personal data."],["About and privacy policy.","A new “About” card with the version and the font license, and a privacy policy button. The developers’ mailbox is set up too: capytap.games@gmail.com."],["Small things.","The phone version works better: saves are not lost, the Back button and pause in the background work. An automatic test checks everything before each release."]],"pics":{},"intro":{"uk":"Привіт, друже! У цьому випуску: справжні планети в Космосі, подвійне збереження, режим економії і звіт про помилки. Гортай сторінки!","en":"Hi, friend! In this issue: real planets in Space, a doubled save, power saving mode and an error report. Turn the pages!"}},{"ver":14,"uk":[["Нове небо в кожній епосі.","Відродження: повітряні кулі. Ретро: літак із полотнищем SALE. Диско: лазерний віяр. Аркади: тетріс-блоки, що падають. Інтернет: дрони-кур’єри з посилками. Еко: літаючі острівці з деревами й водоспадами. Космос: планета з кільцем і метеорний дощ."],["Птахи за бажанням.","З другої епохи птахів у небі більше нема, щоб не заважали новим прикрасам. Хто за ними сумує, може ввімкнути «Птахи в пізніх епохах» у налаштуваннях."],["Будівництво з двома машинами.","До мішалки приїжджає бетононасос зі стрілою. Барабан мішалки тепер крутиться, а стріла гойдається, поки качає бетон."],["Свої пакети в кожної епохи.","Кошик, паперовий пакет, блискучий пакет, коробка з грою, посилка, сітка з овочами, капсула й неонова торба. Покупці виходять з покупками відповідної епохи."],["Золота дорога сяє.","По золотій бруківці біжить смуга блиску, а на цеглинах спалахують зірочки."],["Живіші репліки.","Скіни Капі говорять різними фразами, не лише жартами про ціни. У Мела й Ніки їх по вісім."],["Дрібниці.","Іконки меню на телефоні більші. У заставці Капі з чорним рюкзаком, без квіточки на голові, а Мел і Ніка трохи менші. Заставку показують лише раз. Нічний ліхтар більше не засвічує Капі."]],"en":[["A new sky in every era.","Renaissance: hot-air balloons. Retro: a plane with a SALE banner. Disco: a laser fan. Arcade: falling Tetris blocks. Internet: courier drones with parcels. Eco: floating islands with trees and waterfalls. Space: a ringed planet and a meteor shower."],["Birds on request.","From the second era on there are no birds in the sky, so they do not hide the new decorations. If you miss them, switch on “Birds in later eras” in Settings."],["Building with two machines.","A concrete pump with a boom now joins the mixer. The mixer drum spins, and the boom sways while it pumps concrete."],["Own bags for every era.","A basket, a paper bag, a glittery bag, a game box, a parcel, a net of veggies, a capsule and a neon tote. Customers leave with the bag of their era."],["The golden road shines.","A streak of light runs across the golden cobbles and stars flash on the bricks."],["Livelier lines.","Capy skins say different things, not only price jokes. Mel and Nika have eight lines each."],["Little things.","Menu icons are bigger on phones. In the intro Capy has a black backpack and no flower on the head, and Mel and Nika are a bit smaller. The intro plays only once. The night street lamp no longer over-lights Capy."]],"pics":{},"intro":{"uk":"Привіт, друже! У цьому випуску: нове небо в кожній епосі, дві будівельні машини й пакети по епохах. Гортай сторінки!","en":"Hi, friend! In this issue: a new sky in every era, two building machines and bags for every era. Turn the pages!"}},{"ver":13,"uk":[["Капі стала детальнішою.","Усі старі скіни Капі оновили так само детально, як супергероя: пірат з папугою, астронавт зі скляним шоломом, чарівник і Дід Мороз з бородами, шеф-кухар з великим ковпаком, мандрівник з рюкзаком і килимком, відьма з гарбузом, квіткова Капі з метеликом, пляжна з м’ячем, осінна з розвіяним шарфом."],["Скіни епох.","Теж стали детальнішими: Відродження з гофрованим коміром, Ретро з радіо, Диско з дзеркальною кулею, Аркади з геймпадом, Інтернет з рюкзаком, Еко з паростком на рюкзаку, Космос зі скляним шоломом і Неон з сяючим візором."],["Рюкзак для заставки.","Ми ще обираємо новий рюкзак для вступної заставки, тому він з’явиться трохи пізніше."]],"en":[["Capy got more detailed.","All the older Capy skins now have the same detail as the superhero: the pirate with a parrot, the astronaut with a glass helmet, the wizard and Santa with beards, the chef with a big hat, the explorer with a backpack and bedroll, the witch with a pumpkin, the flower Capy with a butterfly, the beach one with a ball, and the autumn one with a flowing scarf."],["Era skins.","They are more detailed too: Renaissance with a ruff collar, Retro with a radio, Disco with a mirror ball, Arcade with a gamepad, Internet with a backpack, Eco with a sprout on the backpack, Space with a glass helmet and Neon with a glowing visor."],["Backpack for the intro.","We are still choosing a new backpack for the intro cutscene, so it will come a little later."]],"pics":{},"intro":{"uk":"Привіт, друже! У цьому випуску: старі скіни Капі стали набагато детальнішими.","en":"Hi, friend! In this issue: the older Capy skins got much more detail."}},{"ver":12,"uk":[["Магічні хмари.","Зоряні хмари тепер чарівні: вони переливаються від бузкового до бірюзового й рожевого, зорі мерехтять, а вниз сиплеться зоряний пил. Золоті хмари виблискують, а час від часу з них падають монети."],["Блискавки трьох кольорів.","До фіолетових блискавок додалися зелені й червоні. У вкладці «Скіни» вони стоять поруч, а хмари тепер у кінці списку погоди."],["Магазини з деталями.","Цукерковий магазин отримав один великий довгий лоліпоп, колони-тростини, глазур і мармеладки. Золотий блищить: по фасаду біжить блиск, а на золоті спалахують зірочки. Лід, дерево, сад, ялинка, Хелловін, весна й осінь теж стали детальнішими."],["Нова бруківка.","З’явилися «Замшіла бруківка» і «Золота дорога». Снігову й осінню бруківку прибрали зі списку, бо сніг і листя вже є в порах року."],["Порядок у скінах.","Лис Мел і зайка Ніка завжди стоять у кінці списку Капі, а нові скіни додаються перед ними. Прибрали «Звичайний» скін Капі, моряка й детектива. Хто їх носив, тепер носить скін епохи."],["Дрібниці.","Вивіска OPEN у вітрині більше не ховається за іншими деталями. Капелюх і шарфик Капі рухаються разом з її диханням."]],"en":[["Magic clouds.","Star clouds are enchanted now: they shimmer from lilac to turquoise and pink, the stars twinkle and star dust sprinkles down. Gold clouds glint, and now and then coins drop from them."],["Lightning in three colours.","Green and red lightning joined the purple one. They sit side by side in the Skins tab, and the clouds are now at the end of the weather list."],["Shops with more detail.","The candy shop got one big long lollipop, candy-cane columns, icing and gumdrops. The golden shop shines: a glint runs across the facade and stars flash on the gold. Ice, wood, garden, Christmas tree, Halloween, spring and autumn shops are more detailed too."],["New cobbles.","Mossy cobbles and the Golden road are here. The snowy and autumn cobbles left the list, because snow and leaves already come with the seasons."],["Skin order.","Mel the fox and Nika the bunny always stay at the end of the Capy list, and new skins go before them. The plain Capy skin, the sailor and the detective are gone. If you wore one, you now wear the era skin."],["Little things.","The OPEN sign in the window no longer hides behind other details. Capy’s hat and scarf move with her breathing."]],"pics":{},"intro":{"uk":"Привіт, друже! У цьому випуску: чарівні хмари, блискавки трьох кольорів, магазини з деталями й нова бруківка. Гортай сторінки!","en":"Hi, friend! In this issue: magic clouds, lightning in three colours, shops with more detail and new cobbles. Turn the pages!"}},{"ver":11,"uk":[["Газета з інструкцією й планами.","Тепер у газеті три розділи: «Новини», «Інструкція» (як грати) і «Скоро» (що ми готуємо). Текст став меншим і більше не вилазить за поля."],["Швидший початок гри.","Після екскурсії по меню ми прибрали зайве навчання: можна одразу тапати й заробляти. Скринька розробників більше не ховається за Мел і Нікою."],["Колючий Голка й нові рюкзачки.","Їжак Голка став схожий на їжака, а в Капі-дівчинки й Капі-хлопчика замість «футболки» тепер маленький портфель на спині: рожевий або синій."],["Більше героїв епох.","Тепер у кожній епосі треба зловити шістьох героїв замість двох, а часу на це більше. Награда та сама: кристал, і не частіше, ніж раніше."],["Чіткіший нічний магазин.","Нічне світло більше не розмиває вітрину й двері, а лічильник днів у барабані фортуни рахує правильно."],["Шість нових скінів Капі.","Лицар, супергерой, ковбой, фея, вікінг і пілот: їх можна виграти в цирку або купити за кристали у вкладці «Скіни»."],["Піксельні кристали.","Кристал тепер намальований пікселями й має свій вигляд у кожній епосі."]],"en":[["A newspaper with a guide and plans.","The newspaper now has three sections: News, How to play and Coming soon. The text is smaller and no longer runs out of the margins."],["A faster start.","After the menu tour we removed the extra tutorial: you can tap and earn right away. The developers mailbox no longer hides behind Mel and Nika."],["Spiky Spike and new backpacks.","Spike the hedgehog now looks like a hedgehog, and the girl and boy Capy wear a small backpack instead of the “T-shirt”: pink or blue."],["More era heroes.","In every era you now catch six heroes instead of two, and you have more time for it. The reward is the same crystal, and it comes no more often than before."],["A crisper shop at night.","The night glow no longer blurs the window and the door, and the day streak in the fortune drum counts correctly."],["Six new Capy skins.","Knight, superhero, cowboy, fairy, viking and pilot: win them at the circus or buy them for crystals in the Skins tab."],["Pixel crystals.","The crystal is now drawn in pixels and looks different in every era."]],"pics":{},"intro":{"uk":"Привіт, друже! У цьому випуску: газета з інструкцією, швидший початок і багато виправлень. Гортай сторінки!","en":"Hi, friend! In this issue: a guide in the newspaper, a faster start and many fixes. Turn the pages!"}},{"ver":10,"uk":[["Вступна заставка й екскурсія.","Нова гра тепер починається з маленької історії про Капі, а в кінці Мел і Ніка проводять екскурсію по меню. Заставку можна переглянути знову у вкладці «Щоденник»."]],"en":[["Intro cutscene and menu tour.","A new game now starts with a short story about Capy, and at the end Mel and Nika show you around the menu. You can watch the cutscene again in the Diary tab."]],"pics":{},"intro":{"uk":"Привіт, друже! У цьому випуску: вступна заставка з екскурсією по меню. Гортай сторінки!","en":"Hi, friend! In this issue: the intro cutscene with a menu tour. Turn the pages!"}},{"ver":9,"uk":[["Грузовик-бетономішалка на будівництві.","Коли магазин росте, приїжджає вантажівка з бетономішалкою, що крутиться, а Бодя в касці носить бетон і цеглу та будує під шатром. Поверхи більше не складаються самі."],["Заставка для кожної епохи.","Нова епоха відкривається своєю сценою: колони й оливкові гілки, стрічка VHS, дзеркальні кулі диско, прибульці аркад, вікно браузера, ліани еко, зорі космосу, неонова сітка. Поруч назва епохи й короткий опис."],["Звуки будівництва.","Гуркіт двигуна, пшик гальм, шум бетону з жолоба й стукіт молотка."],["Цирк приходить частіше.","Тепер він з'являється приблизно раз на 5-8 хвилин, тож колесо фортуни крутиться частіше."],["Магазин часу дорожчий.","Покращення в Магазині часу коштують приблизно в півтора раза більше, а осколки обнулено ще раз, щоб усі починали з однаковим запасом. Куплені покращення, скіни й кристали лишилися."]],"en":[["A mixer truck at the building site.","When the shop grows, a truck with a spinning concrete mixer drives in, and Bodya in a hard hat carries concrete and bricks and builds under the tent. Floors no longer stack up by themselves."],["An intro scene for every epoch.","A new epoch opens with its own scene: columns and olive branches, a VHS tape, disco mirror balls, arcade invaders, a browser window, eco vines, space stars, a neon grid. The epoch name and a short description come with it."],["Building sounds.","An engine rumble, the hiss of the brakes, concrete pouring from the chute and the knock of a hammer."],["The circus comes more often.","It now shows up about every 5-8 minutes, so the Wheel of Fortune spins more often."],["The Time shop costs more.","Time shop upgrades cost about one and a half times as much, and time shards were reset once more so everyone starts even. Upgrades you bought, skins and crystals stay."]],"intro":{"uk":"Привіт, друже! У цьому випуску: вантажівка-бетономішалка, заставки епох, звуки будівництва, частіший цирк і дорожчий Магазин часу. Гортай сторінки!","en":"Hi, friend! In this issue: a mixer truck, epoch intro scenes, building sounds, a more frequent circus and a pricier Time shop. Turn the pages!"},"pics":{},"caps":{"uk":{},"en":{}}},{"ver":8,"uk":[["Новий старт для всіх.","Гру стало занадто легко проходити, тому прогрес скинуто: монети, осколки часу, покращення Магазину часу, рівень магазину, відділи й звірята почалися з нуля. Скіни й кристали лишилися з тобою."],["Великі пишні дерева.","Дерева на вулиці стали більшими, об'ємнішими й гарнішими в кожну пору року: цвіт навесні, плоди й сонячні плями влітку, золото й багрянець восени, засніжені гілки взимку."],["Вечірнє світло.","Вночі маркети й особливо торговий центр світяться яскравіше: тепле світло з поверхів, лампи під стелею й пляма світла на бруківці. Вікна будинків теж гарніші, зі шторами, перемичками й квітами."],["П'ять кольорів будинків по колу.","Будинки на задньому плані тепер чергують п'ять кольорів, а відтінки залежать від епохи."],["Маркети різні.","У кожній епосі й на кожному рівні маркет має свій варіант: навіс, візерунок, шибки, прикраси фасаду й лавка, візок чи плакат біля дверей."],["Справжня зима.","На дахах і вулицях лежить багато снігу, а звірята скаржаться, що холодно, і просять накинути щось теплого."],["Нові репліки.","У кожного звірятка тепер 16 фраз, а ще є зимові й загальні репліки під кожну епоху. Репліки йдуть слідом за звірятком."],["Новий дирижабль.","Повітряне судно стало детальнішим: об'ємний корпус із ребрами, хвіст, гондола з вікнами й гвинти, що крутяться."],["Веселка-скін.","Скін погоди «Веселка» став великим і помітнішим: дугу видно над будинками і на ПК, і на телефоні."]],"en":[["A fresh start for everyone.","The game became too easy, so progress was reset: coins, time shards, Time shop upgrades, shop level, departments and animals start from zero. Your skins and crystals stay with you."],["Big lush trees.","Street trees are bigger, fuller and prettier in every season: blossoms in spring, fruit and sun spots in summer, gold and crimson in autumn, snowy branches in winter."],["Evening lights.","At night the markets, and the mall especially, glow brighter: warm light from the floors, ceiling lamps and a pool of light on the cobbles. House windows are prettier too, with curtains, lintels and flowers."],["Five house colours in a cycle.","The background houses now cycle through five colours, and the shades depend on the era."],["Different markets.","Every era and every level has its own market variant: awning, pattern, panes, facade decor and a bench, bike or poster by the door."],["A real winter.","Lots of snow lies on the roofs and streets, and the animals complain about the cold and ask for something warm."],["New lines.","Each animal now has 16 phrases, plus winter lines and general lines for every era. The bubbles follow the animal."],["A new airship.","The airship is more detailed: a volumetric hull with ribs, a tail, a gondola with windows and spinning propellers."],["The rainbow skin.","The \"Rainbow\" weather skin is bigger and easier to see: the arc rises above the houses on both PC and phone."]],"intro":{"uk":"Привіт, друже! У цьому номері: великі дерева, вечірнє світло, різні маркети, справжня зима, нові репліки, дирижабль і веселка. Гортай сторінки!","en":"Hi, friend! In this issue: big trees, evening lights, different markets, a real winter, new lines, an airship and a rainbow. Turn the pages!"},"pics":{},"caps":{"uk":{},"en":{}}},{"ver":7,"uk":[["Подорож у часі — своя анімація для кожної епохи.","Відродження: давня Греція з колонами, оливковими деревами й звірятами-ангелятками з німбами. Ретро: перемотка старої відеокасети. Диско: дзеркальна куля й танцпол. Аркади: великі пікселі, прибульці й LEVEL UP. Інтернет: цифровий дощ, спливаючі вікна й завантаження. Еко: вітер, листя й ліани. Космос: політ крізь зорі й планети. Неон: тунель з неонових кілець. Звук теж новий: цокання маятника, шестерні, свист і дзвін."],["Різнокольорові будинки й більше неба.","Усі будинки на фоні тепер різних кольорів, звірята-працівники стали більшими й чіткішими, а на ПК з відкритим меню завжди видно більше неба. Подорож у часі можна пропустити дотиком, коли вже бачив її раз, і в кожної епохи свій звук."],["Завдань для розширення стає більше з кожним рівнем.","Щоб збудувати наступний маркет, треба купити першого товару рівня 25, 28, 31, 34 чи 37 разів, а другого 15, 18, 21, 24 чи 27. Звірят цього рівня треба прокачати до 2-го рівня на ранніх етапах і до 3-го на пізніх."],["Торговий центр без нових відділів.","Фудкорт і кінотеатр прибрано: торговий центр лише завершує шлях до подорожі в часі."],["Осколки часу й подорожі.","За подорож тепер 3–9 осколків (+1 до колишнього), більше, якщо в епосі заробити багато. Кожна наступна епоха потребує в 4 рази більше монет, а дохід за подорож росте в 1,8 раза. Тож епохи довші й рівніші. Покращення Магазину часу високих рівнів відкриваються лише після кількох подорожей."],["Будівництво без крана.","Кран прибрано. Тепер Боді сам носить блоки магазину від купи до будівлі й підкидає їх на місце."],["Годинник рухається разом із магазином.","Годинникова вежа торгового центру більше не відстає, коли тапаєш по магазину."],["Вищі будинки.","Будинки позаду магазину стали майже вдвічі вищими, до середини четвертого поверху торгового центру. Небо не зачеплено."],["Капі більша.","Капі виросла на 30%."],["Цирк частіше.","Цирк Фортуни тепер приїздить трохи частіше."]],"en":[["Time trip: its own animation for every era.","Renaissance: ancient Greece with columns, olive trees and angel animals with halos. Retro: rewinding an old video tape. Disco: a mirror ball and dance floor. Arcade: big pixels, invaders and LEVEL UP. Internet: digital rain, pop-ups and loading. Eco: wind, leaves and vines. Space: a flight through stars and planets. Neon: a tunnel of neon rings. The sound is new too: pendulum ticks, gears, a whoosh and a chime."],["Colourful houses and more sky.","Every house in the background now has its own colour, the working animals are bigger and clearer, and on PC with the menu open you now see more sky. You can skip the time trip with a tap once you have seen it, and every era has its own sound."],["More tasks for expanding on every level.","To build the next market you need to buy the level's first product 25, 28, 31, 34 or 37 times and the second 15, 18, 21, 24 or 27 times. Animals of this level need level 2 on the early stages and level 3 on the late ones."],["A mall without new departments.","The food court and the cinema department are gone: the mall only completes the road to a time trip."],["Time shards and trips.","A trip now gives 3-9 shards (+1 more than before), more if you went far in the era. Every next era needs 4 times more coins and a trip multiplies income by 1.8. Eras are longer and steadier. High-level Time shop upgrades unlock only after several trips."],["Building without a crane.","The crane is gone. Now Bodya carries the shop's blocks from the pile to the building himself and tosses them into place."],["The clock moves with the shop.","The mall clock tower no longer lags when you tap the shop."],["Taller houses.","The houses behind the shop are nearly twice as tall now, up to the middle of the mall's fourth floor. The sky is untouched."],["Capy is bigger.","Capy grew by 30%."],["Circus more often.","The Fortune Circus comes by a little more often."]],"intro":{"uk":"Привіт, друже! У цьому номері: три нові подорожі в часі, більше завдань для розширення, вищі будинки, Боді з блоками й Капі побільшала. Гортай сторінки!","en":"Hi, friend! In this issue: three new time trips, more tasks for expanding, taller houses, Bodya with blocks and a bigger Capy. Turn the pages!"},"pics":{},"caps":{"uk":{},"en":{}}},{"ver":6,"uk":[["Павільйони на поверхах.","У маркетах і торговому центрі на кожному поверсі з’явилися павільйони під тему епохи: одяг із манекенами, іграшки, техніка, книжки, прикраси й рослини. Поки відділ не куплено, павільйон зачинений жалюзі. А що вищий рівень відділу, то повніша вітрина. На широких поверхах з’явилася кав’ярня з прилавком."],["Магазин часу став дорожчим.","«Швидкий старт» прибрано. Усі покращення стали слабшими, але дорожчими, щоб гра не прискорювалася. З’явилося «Золоте чуття»: золоті покупці приходять частіше. Осколки, які були витрачені в старому магазині, повернуто."],["Лис Мел.","Скін Мел тепер лис, а не лисиця. Хитрий лише в ціні."],["Вивіска без перекриттів.","Вивіска CAPYTAP на даху більше нічим не накрита: прапорці, димарі й прикраси стоять осторонь, а годинникова вежа піднята над нею."],["Крапля на місці.","Крапелька, що вмикає дощ, тепер висить на дереві праворуч від магазину й рухається лише разом з вулицею."],["Більше неба на телефоні.","На телефоні над дахом лишається більше неба, особливо коли відкрито меню."],["Чіткі рамки меню.","Рамка меню стала товщою й кольоровою. Вкладки мають виразний контур, як аркуші в таблиці: обрана світла, з кольоровою планкою знизу."],["Лічильник.","Кристали й осколки стоять стовпчиком, а великі числа більше не вилазять за край екрана."]],"en":[["Pavilions on every floor.","Shops and the mall now have pavilions on each floor, themed to the era: clothes with mannequins, toys, tech, books, jewellery and plants. Until a department is bought its pavilion is shut behind shutters. The higher the department level, the fuller the display. Wide floors also got a cafe with a counter."],["The Time shop costs more.","\"Head Start\" is gone. Every upgrade is weaker but pricier, so the game does not speed up. A new upgrade, \"Golden Nose\", makes golden shoppers come more often. Shards spent in the old shop were refunded."],["Mel the fox.","The Mel skin is now a he-fox. Sly only about the price."],["A clear sign.","The CAPYTAP roof sign is no longer covered by anything: flags, chimneys and decorations stand aside, and the clock tower is lifted above it."],["The drop stays put.","The little drop that turns the rain on now hangs on the tree to the right of the shop and moves only with the street."],["More sky on the phone.","On a phone there is more sky above the roof, especially when the menu is open."],["Crisp menu frames.","The menu frame is thicker and coloured. Tabs have a clear outline like sheets in a spreadsheet: the selected one is light with a coloured bar below."],["The counter.","Crystals and shards are stacked in a column, and big numbers no longer run off the edge of the screen."]],"intro":{"uk":"Привіт, друже! У цьому номері: павільйони на кожному поверсі, дорожчий Магазин часу, чіткі рамки меню й багато дрібниць. Гортай сторінки!","en":"Hi, friend! In this issue: pavilions on every floor, a pricier Time shop, crisp menu frames and many small things. Turn the pages!"},"pics":{},"caps":{"uk":{},"en":{}}},{"ver":5,"uk":[["Осколки часу й кристали.","Тепер дві валюти. Осколки часу (фіолетові) дає подорож у часі, і за них купуються покращення в Магазині часу. Кристали випадають з бустів, цирку й золотих покупців, і за них купуються скіни. Кожна подорож у часі ще й назавжди дає ×2 до тапів і доходу."],["Одна відьма.","Відьми більше не літають просто так. На Хелловін замість цирку прилітає лише одна відьма на мітлі. Потім вона запрошує зіграти в «Три казанки». Зелену бабусю прибрали."],["Нові лапки для хатки.","Хатка відьми тепер стоїть на справжніх курячих лапках: з коліньми, лусочками, пальцями й кігтями. Сама відьма стала піксельнішою."],["Скіни говорять.","У кожного скіна є своя репліка: пірат кричить по-піратськи, астронавт просить орбіту цін. Одягни скін і тапни по Капі. А ще з’явилися два скіни розробників: лис Мел і зайка Ніка. Вони безкоштовні."],["Золоті покупці.","Золоті звірята тепер просто золоті. Скіни, капелюхи й шарфи на них не вдягаються."],["Очі на місці.","Костюми героїв більше не закривають звірятам очі. А в Капі прибрали підсвітку, що відставала від скіна."],["Газета MEL & NIKA.","Газета тепер піксельна, з іменами редакторів і вкладками. У вкладках можна перечитати попередні випуски, а кнопка «Написати розробникам» надішле нам твою думку."],["Більший маркет на ПК.","Коли магазин росте, на комп’ютері картинка трохи віддаляється, щоб усе вміщалося зручно."],["Меню на телефоні.","Меню на вертикальному телефоні більше не залазить на цирк і дорогу: сцена тепер закінчується над панеллю."],["Кінозал у торговому центрі.","На торговому центрі з’явився п’ятий поверх із кінозалом: екран, завіси, крісла й неонова вивіска CINEMA. На екрані йде «кіно». Менші маркети теж стали трохи сучаснішими, а на ПК більше неба й ширша бруківка."]],"en":[["Time shards and crystals.","There are now two currencies. Time shards (purple) come from time travel and buy upgrades in the Time shop. Crystals drop from boosts, the circus and golden shoppers, and buy skins. And every time trip permanently gives ×2 to taps and income."],["Just one witch.","Witches no longer fly around for no reason. On Halloween, instead of the circus, a single witch on a broom arrives. Then she invites you to play \"Three cauldrons\". The green granny is gone."],["New legs for the hut.","The witch’s hut now stands on real chicken legs: knees, scales, toes and claws. The witch herself got more pixelated."],["Skins talk.","Every skin has its own line: the pirate shouts like a pirate, the astronaut asks for the orbit of prices. Wear a skin and tap Capy. Two developer skins are new: Mel the fox and Nika the bunny. They are free."],["Golden shoppers.","Golden animals are now just golden. Skins, hats and scarves do not go on them."],["Eyes in place.","Hero costumes no longer cover the animals’ eyes. And the glow around Capy, which lagged behind the skin, is gone."],["The MEL & NIKA paper.","The paper is now pixel-style, with the editors’ names and tabs. Use the tabs to reread earlier issues, and the “Write to the developers” button sends us your thoughts."],["A bigger market on PC.","When the shop grows, the picture on a computer zooms out a little so everything fits comfortably."],["The phone menu.","On a vertical phone the menu no longer covers the circus and the road: the scene now ends above the panel."],["A cinema in the mall.","The mall got a fifth floor with a cinema: a screen, curtains, seats and a neon CINEMA sign. The screen plays a little movie. Smaller shops got a bit more modern too, and on PC there is more sky and wider cobbles."]],"intro":{"uk":"Привіт, друже! У цьому номері: дві валюти (осколки й кристали), одна справжня відьма й хатка на курячих лапках, а ще скіни навчилися говорити. Гортай сторінки!","en":"Hi, friend! In this issue: two currencies (shards and crystals), one real witch and a hut on chicken legs, and skins have learned to talk. Turn the pages!"},"pics":{"0":"shards","1":"hut","2":"witch"},"caps":{"uk":{"0":"Осколок часу й кристал.","1":"Хатка відьми на новеньких лапках.","2":"Єдина відьма Хелловіну."},"en":{"0":"A time shard and a crystal.","1":"The witch’s hut on brand-new legs.","2":"The one witch of Halloween."}}},{"ver":4,"uk":[["Газета замість листа.","Пошта від розробників тепер газета: вона розгортається, а сторінки перегортаються. Свайп, тап чи стрілки: як зручніше."],["Годинникова вежа.","На торговому центрі виросла велика годинникова вежа. Перед подорожжю вона б’є: першої ночі раз, другої двічі, а третьої тричі. Тапни по ній, щоб вирушити в нову епоху."],["Нове завантаження.","Живе нічне місто з вікнами, машинами та птахами, а внизу корисні підказки. Тапни по підказці, щоб побачити наступну."],["Нова відьма.","Відьма на мітлі стала гарнішою: великий капелюх, пухнастий віник і зоряний шлейф."],["Більші маркети.","На вертикальному телефоні маркети всіх рівнів стали більшими, а коричневі смуги по краях зникли."],["Надкусані хмари.","У скіні «Цукрові хмари» частину хмар ніби надкусили."],["Крапля дощу.","Крапелька, що вмикає дощ, тепер висить праворуч біля вивіски магазину."],["Чіткі рамки.","Рамки меню мають виразний контур з усіх боків, а підписи вкладок не ховаються під замочком."],["Капі вночі.","У темряві Капі обведена теплим світлом, тож її добре видно, а туман більше не затягує звірят."]],"en":[["A newspaper instead of a letter.","The mail from the developers is now a newspaper: it unfolds and the pages turn. Swipe, tap or use the arrows."],["The clock tower.","A big clock tower rose on the mall. Before the trip it strikes: once on the first night, twice on the second and three times on the third. Tap it to set off for a new era."],["New loading screen.","A lively night city with windows, cars and birds, and useful tips below. Tap a tip to see the next one."],["A new witch.","The witch on a broom got prettier: a big hat, a fluffy broom and a trail of stars."],["Bigger markets.","On a vertical phone markets of every level are bigger and the brown strips at the edges are gone."],["Bitten clouds.","In the Cotton Clouds skin some of the clouds look as if somebody took a bite."],["The rain drop.","The little drop that turns the rain on now hangs on the right by the shop sign."],["Crisp frames.","Menu frames have a clear outline on all sides, and tab labels no longer hide under the padlock."],["Capy at night.","In the dark Capy gets a warm outline so she stands out, and the fog no longer veils the animals."]],"intro":{"uk":"Привіт, друже! Цього разу новини в газеті: годинникова вежа, нове завантаження й багато дрібниць. Гортай сторінки!","en":"Hi, friend! This time the news is in a newspaper: a clock tower, a new loading screen and many small things. Turn the pages!"},"pics":{"1":"clock","2":"city","3":"witch"},"caps":{"uk":{"1":"Годинникова вежа торгового центру опівночі.","2":"Нічне місто на екрані завантаження.","3":"Нова відьма облітає місто."},"en":{"1":"The mall clock tower at midnight.","2":"The night city on the loading screen.","3":"The new witch circles the town."}}},{"ver":3,"uk":[["Баба Яга на Хелловін.","Замість цирку на Хелловін над містом летить Баба Яга, а за нею приходить хатка на курячих лапках з грою «Три казанки»."],["Темніший Хелловін.","Небо стало темним, світить великий місяць, привиди вилітають із вікон частіше, а звірята від них тікають. Над дахами кружляє відьма на мітлі."],["Нова пошта.","Листи щоразу привозить інший звіреня в поштовій кепці: машина гальмує, кур’єр вистрибує, несе лист до скриньки й махає на прощання."],["Нова будівля під полотном.","Коли росте новий маркет, на старий падає біле полотно, а Бодя працює під ним. Наприкінці полотно знімають, і магазин більше не зникає."],["Ширша вулиця.","Місто стало ширшим: гортай далі вліво й вправо, там ще більше будинків, дерев і ліхтарів."],["Пелюстки навесні.","Навесні під деревами й на бруківці лежать рожеві пелюстки, а восени листя на дорозі поменшало."],["Магазин часу.","У майстерні часу список покращень за кристали тепер так і називається."],["Завантаження.","На екрані завантаження Капі плавно біжить нічним містом крізь піксельні монетки."],["Вікна й пара.","У всіх будинків є вікна, а пара з люків стала лагіднішою."]],"en":[["Baba Yaga for Halloween.","Instead of the circus, Baba Yaga flies over town on Halloween, and her hut on chicken legs follows with the Three Cauldrons game."],["A darker Halloween.","The sky is dark with a big moon, ghosts fly out of windows more often and the animals run from them. A witch circles over the roofs on a broom."],["New mail.","A different animal in a postal cap delivers the letters each time: the van brakes, the courier hops out, brings the letter to the box and waves goodbye."],["A new build under a tarp.","When a new market is built, a white tarp drops on the old one and Bodya works under it. At the end the tarp comes off, and the shop never disappears."],["A wider street.","The town got wider: scroll further left and right, there are more houses, trees and lamps."],["Spring petals.","In spring pink petals lie under the trees and on the cobblestones, and there are fewer leaves on the road in autumn."],["Time shop.","In the Time Workshop the crystal upgrade list is now called just that."],["Loading screen.","On the loading screen Capy smoothly runs through the night city and pixel coins."],["Windows and steam.","All houses have windows, and the manhole steam is gentler."]],"intro":{"uk":"Привіт, друже! Свіжа порція новин: Хелловін став моторошнішим, пошта привітнішою, а місто ширшим. Дивись, що встигли.","en":"Hi, friend! A fresh batch of news: Halloween got spookier, the mail friendlier and the town wider. Here is what we got done."},"pics":{"0":"hut","1":"witch","2":"van","3":"tent"},"caps":{"uk":{"0":"Хатка на курячих лапках прийшла.","1":"Відьма на мітлі над дахами.","2":"Пошта привозить новини.","3":"Нове будівництво під білим полотном."},"en":{"0":"The hut on chicken legs has arrived.","1":"A witch on a broom over the roofs.","2":"The mail van brings the news.","3":"New building work under a white tarp."}}},{"ver":2,"uk":[["Місто ожило.","Більше звірят-покупців, а ті, що купили багато, ідуть додому: стукають у двері, заходять і виходять із теплого світла."],["Золоті покупці й завдання дня.","Тапни по золотому — отримаєш ×5 золота або кристал. А щодня є три завдання з нагородами."],["Цирк і барабан — окремо.","Кристали можна виграти в обох, але події стали трохи рідшими, щоб було цікавіше чекати."],["Скіни для всіх.","Капі, герої, покупці, магазин, погода й бруківка. Один скін — 50 кристалів, або виграй його в цирку."],["Пори року.","Окрема кнопка в меню з колесом. Відкривається після 2-ї епохи, а кожна пора починається своєю маленькою виставою."],["Нова погода.","Плавні фіолетові блискавки й велика веселка над містом (їх можна виграти в цирку)."],["Бодя будує.","Новий рівень магазину тепер будується довго й епічно: молоток, кран, пил, салют."],["І ця скринька.","Вона червона, бо тут лише гарячі новини. Заглядай, коли прапорець блимає."],["Свіже.","Сюжет став веселішим і трохи гострішим (14+), магазини більші й з дрібницями на дахах, у Космосі й Неоні більше всього літає, а будівництво має власну музику. Золоті покупці швидші, клоун рідший."]],"en":[["The town came alive.","More animal shoppers, and those who bought a lot go home: they knock, step into the warm light and come back out."],["Golden shoppers and daily tasks.","Tap a golden one for ×5 gold or a crystal. Every day brings three tasks with rewards."],["Circus and drum, separate.","Both can give crystals, but events are a little rarer now, so waiting is more fun."],["Skins for everyone.","Capy, heroes, shoppers, the shop, weather and cobbles. One skin costs 50 crystals, or win it at the circus."],["Seasons.","A separate wheel button in the menu. It unlocks after era 2, and every season starts with its own little show."],["New weather.","Smooth purple lightning and a huge rainbow over the town (you can win them at the circus)."],["Bodie builds.","A new shop level now takes a long, epic build: hammer, crane, dust, fireworks."],["And this mailbox.","It is red because it carries hot news only. Check it when the flag blinks."],["Fresh.","The story is funnier and a little sharper (14+), shops are bigger with details on the roofs, Space and Neon have more things flying around, and construction has its own music. Golden shoppers are faster, the clown is rarer."]],"intro":{"uk":"Привіт, друже! Питаєш, чому оновлення довго не було? Бо ми не сиділи склавши лапки: капібара пильнувала касу, а ми — код. Дивись, що встигли.","en":"Hi, friend! Wondering why there was no update for so long? We were not sitting idle: the capybara guarded the till and we guarded the code. Here is what we got done."},"pics":{},"caps":{"uk":{},"en":{}}}];
let newsIssue = 0, newsBusy = false;
function picCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return { c, g }; }
function newsPic(kind) {
  const { c, g } = picCanvas(160, 84);
  if (kind === 'pinkclouds') {
    const bands = ['P', 'P', 'u', 'f', 'J', 'p', 'q', 'j', 'y'];
    for (let y = 0; y < 84; y++) R(g, 0, y, 160, 1, bands[Math.min(bands.length - 1, Math.floor(y / 9.5))]);
    for (let i = 0; i < 14; i++) R(g, (i * 37 + 11) % 160, (i * 17 + 3) % 22, 1, 1, i % 3 ? 'q' : 'w');
    disc(g, 118, 60, 15, 'h'); disc(g, 118, 60, 11, 'y'); R(g, 0, 62, 160, 22, 'z');
    const cloud = (cx, cy, s) => {
      const puffs = [[0, 0, 7], [-9, 2, 5], [9, 2, 5], [-4, -5, 6], [5, -4, 6]];
      puffs.forEach(([dx, dy, r]) => disc(g, Math.round(cx + dx * s), Math.round(cy + dy * s + 2), Math.round(r * s), 'f'));
      puffs.forEach(([dx, dy, r]) => disc(g, Math.round(cx + dx * s), Math.round(cy + dy * s), Math.round(r * s), 'p'));
      puffs.forEach(([dx, dy, r]) => disc(g, Math.round(cx + dx * s - 1), Math.round(cy + dy * s - 1), Math.max(2, Math.round(r * s) - 2), 'q'));
      disc(g, Math.round(cx - 6 * s), Math.round(cy - 6 * s), Math.max(2, Math.round(3 * s)), 'w');
    };
    cloud(34, 26, 1.5); cloud(104, 20, 1.1); cloud(78, 44, 1.2); cloud(146, 38, 0.9); cloud(12, 52, 0.9);
    for (let x = 0; x < 160; ) { const w = 11 + (x * 5) % 9, h = 8 + (x * 7) % 16; R(g, x, 66 - h + 8, w, h + 10, 'V'); for (let wy = 66 - h + 12; wy < 76; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 5) if ((wx + wy) % 3) R(g, wx, wy, 2, 3, 'y'); x += w; }
    R(g, 0, 76, 160, 8, 'z');
  } else if (kind === 'hut') {
    R(g, 0, 0, 160, 84, 'V'); R(g, 0, 40, 160, 44, 'P'); for (let i = 0; i < 14; i++) R(g, (i * 29 + 5) % 160, (i * 13 + 3) % 40, 1, 1, 'w'); disc(g, 138, 16, 9, 'o'); disc(g, 136, 14, 6, 'h');
    R(g, 0, 78, 160, 6, 'z'); const hc = document.createElement('canvas'); hc.width = 160; hc.height = 84; HAG_ART.draw(hc.getContext('2d'), 1.2, 1, false); g.drawImage(hc, 0, 0);
  } else if (kind === 'clock') {
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 30 ? 'z' : 'V'); for (let i = 0; i < 18; i++) R(g, (i * 29 + 9) % 160, (i * 13 + 4) % 50, 1, 1, i % 3 ? 'w' : 'y'); disc(g, 28, 18, 9, 'w'); disc(g, 31, 16, 8, 'z');
    R(g, 0, 66, 160, 18, 'z'); for (let x = 0; x < 160; x += 13) { const hh = 8 + (x * 5) % 12; R(g, x, 66 - hh + 8, 13, hh, 'k'); }
    const cx = 80; R(g, cx - 14, 54, 28, 14, 'd'); R(g, cx - 13, 54, 26, 14, 'c');
    R(g, cx - 17, 24, 34, 32, 'd'); R(g, cx - 16, 25, 32, 30, 'W'); R(g, cx - 16, 25, 4, 30, 'E'); R(g, cx + 12, 25, 4, 30, 'c');
    disc(g, cx, 40, 14, 'y'); g.globalAlpha = 0; g.globalAlpha = 1; disc(g, cx, 40, 13, 'd'); disc(g, cx, 40, 12, 'h'); disc(g, cx, 40, 10, 'd'); disc(g, cx, 40, 9, 'w');
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; R(g, Math.round(cx + Math.sin(a) * 7.5), Math.round(40 - Math.cos(a) * 7.5), i % 3 ? 1 : 2, i % 3 ? 1 : 2, 'd'); }
    lineG(g, cx, 40, cx, 34, 'd'); lineG(g, cx, 40, cx + 5, 43, 'd'); R(g, cx - 1, 39, 2, 2, 'h');
    R(g, cx - 12, 14, 24, 10, 'd'); R(g, cx - 11, 15, 22, 9, 'k'); [-6, 6].forEach(bx => { R(g, cx + bx - 2, 17, 5, 4, 'h'); R(g, cx + bx - 3, 21, 7, 2, 'h'); });
    for (let r = 0; r < 14; r++) { const half = 16 - r; R(g, cx - half, 13 - r, half * 2, 1, 'r'); R(g, cx - half, 13 - r, 2, 1, 'd'); R(g, cx + half - 2, 13 - r, 2, 1, 'd'); }
    R(g, cx, 0, 1, 3, 'd'); [18, 28, 38].forEach(rr => { for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; if (rr === 28) R(g, Math.round(cx + Math.cos(a) * (rr + 8)), Math.round(40 + Math.sin(a) * (rr + 8) * 0.8), 1, 1, 'y'); } });
  } else if (kind === 'city') {
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 24 ? 'z' : y < 48 ? 'V' : 'P'); for (let i = 0; i < 14; i++) R(g, (i * 31 + 7) % 160, (i * 11 + 2) % 30, 1, 1, 'w'); disc(g, 124, 22, 9, 'w');
    for (let x = 0; x < 160; ) { const w = 14 + (x * 3) % 9, h = 20 + (x * 7) % 30; R(g, x, 66 - h, w, h, x % 2 ? 'V' : 'z'); for (let wy = 66 - h + 4; wy < 62; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 6) if ((wx + wy) % 3) R(g, wx, wy, 3, 4, (wx * 3 + wy) % 4 ? 'y' : 'f'); x += w; }
    R(g, 0, 66, 160, 18, 'z'); R(g, 0, 66, 160, 2, 'u'); for (let x = 0; x < 160; x += 18) R(g, x, 76, 9, 1, 'h');
    R(g, 20, 46, 2, 22, 'd'); R(g, 17, 43, 8, 4, 'y');
    const cs = getSpriteCanvas('capy'); g.drawImage(cs, 0, 0, cs.width, cs.height, 70, 80 - cs.height * 1.6, cs.width * 1.6, cs.height * 1.6);
  } else if (kind === 'witch') {
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 24 ? 'z' : y < 54 ? 'V' : 'P'); for (let i = 0; i < 16; i++) R(g, (i * 31 + 7) % 160, (i * 11 + 2) % 50, 1, 1, i % 3 ? 'w' : 'y');
    disc(g, 112, 30, 18, 'd'); disc(g, 112, 30, 17, 'o'); disc(g, 109, 27, 13, 'h'); disc(g, 107, 25, 8, 'y');
    for (let x = 0; x < 160; x += 14) { const hh = 10 + (x * 7) % 14; R(g, x, 84 - hh, 14, hh, 'k'); R(g, x + 3, 84 - hh + 3, 2, 2, 'y'); }
    if (!witchCv) witchCv = buildWitchCanvas(); g.drawImage(witchCv, 42, 14); [[18, 14], [30, 30], [140, 52]].forEach(([bx, by]) => { R(g, bx, by, 3, 1, 'k'); R(g, bx - 3, by - 1, 3, 1, 'k'); R(g, bx + 3, by - 1, 3, 1, 'k'); });
  } else if (kind === 'shards') {
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 30 ? 'z' : y < 60 ? 'V' : 'P'); for (let i = 0; i < 20; i++) R(g, (i * 29 + 9) % 160, (i * 13 + 4) % 60, 1, 1, i % 3 ? 'w' : 'y');
    R(g, 0, 70, 160, 14, 'd'); R(g, 0, 70, 160, 2, 'b');
    const gem = (cx, cy, hh, hw, a, b) => { for (let r = -hh; r <= hh; r++) { const half = Math.round(hw * (1 - Math.abs(r) / hh)); R(g, cx - half, cy + r, half * 2 + 1, 1, r < -hh * 0.2 ? a : b); R(g, cx - half, cy + r, 1, 1, 'k'); R(g, cx + half, cy + r, 1, 1, 'k'); } R(g, cx - 1, cy - hh + 1, 3, 3, 'w'); R(g, cx - hw + 3, cy - 2, 2, 5, 'w'); };
    gem(80, 38, 26, 16, 'S', 's'); gem(38, 52, 14, 9, 'q', 'p'); gem(122, 54, 16, 10, 'm', 'T');
    [[60, 14], [100, 20], [24, 32], [136, 36]].forEach(([sx, sy]) => { R(g, sx, sy - 2, 1, 5, 'y'); R(g, sx - 2, sy, 5, 1, 'y'); });
  } else if (kind === 'van') {
    R(g, 0, 0, 160, 50, 'S'); R(g, 0, 50, 160, 34, 'E'); R(g, 0, 62, 160, 22, 'e'); for (let x = 0; x < 160; x += 24) R(g, x, 73, 12, 2, 'y'); disc(g, 130, 16, 8, 'y');
    const Rs = (x, y, w, h, col) => R(g, 24 + x * 3, 40 + y * 3, w * 3, h * 3, col), D = (cx, cy, r, col) => disc(g, 24 + cx * 3, 40 + cy * 3, r * 3, col);
    Rs(0, -16, 35, 15, 'd'); Rs(16, -15, 17, 12, 'n'); Rs(16, -15, 17, 1, 'v'); Rs(20, -13, 9, 6, 'w'); Rs(16, -5, 17, 1, 'h'); Rs(1, -11, 13, 8, 'n'); Rs(2, -10, 5, 4, 's'); Rs(10, -10, 3, 3, 'h'); Rs(-1, -8, 3, 5, 'n');
    [7, 27].forEach(wx => { D(wx, -2, 3, 'd'); D(wx, -2, 1, 'e'); }); Rs(23, -11, 3, 1, 'r'); R(g, 40, 22, 8, 6, 'r'); R(g, 41, 23, 6, 4, 'p');
  } else if (kind === 'tent') {
    R(g, 0, 0, 160, 60, 'S'); R(g, 0, 60, 160, 24, 'E'); R(g, 0, 60, 160, 2, 'e');
    R(g, 28, 22, 104, 40, 'c'); R(g, 28, 22, 104, 2, 'd'); for (let x = 36; x < 124; x += 20) { R(g, x, 32, 12, 12, 's'); R(g, x, 32, 12, 1, 'd'); }
    for (let r = 0; r < 22; r++) { const half = 3 + Math.round(r * 2.6); R(g, 80 - half, 2 + r, half * 2, 1, r % 5 === 4 ? 'E' : 'w'); R(g, 80 - half, 2 + r, 1, 1, 'd'); R(g, 80 + half - 1, 2 + r, 1, 1, 'd'); }
    R(g, 24, 24, 112, 38, 'w'); for (let x = 24; x < 136; x += 6) R(g, x, 24, 1, 38, 'E'); R(g, 23, 24, 1, 38, 'd'); R(g, 136, 24, 1, 38, 'd'); R(g, 24, 24, 112, 1, 'd');
    for (let x = 20; x <= 140; x += 24) R(g, x, 14, 2, 50, 'b'); [18, 40, 62].forEach(y => R(g, 18, y, 124, 2, 'l')); R(g, 74, 38, 12, 4, 'e'); R(g, 78, 42, 4, 14, 'b');
    R(g, 0, 58, 160, 4, 'h'); for (let x = 0; x < 160; x += 8) R(g, x, 58, 4, 4, 'k');
  } else {                                                                         // обкладинка: Капі на тлі променів
    for (let i = 0; i < 24; i++) { const a0 = i / 24 * Math.PI * 2; g.fillStyle = i % 2 ? PALETTE.y : PALETTE.h; g.beginPath(); g.moveTo(80, 60); g.arc(80, 60, 120, a0, a0 + Math.PI / 24 * 2); g.closePath(); g.fill(); }
    const cs = getSpriteCanvas('capy'); g.drawImage(cs, 0, 0, cs.width, cs.height, 80 - cs.width * 1.5, 82 - cs.height * 3, cs.width * 3, cs.height * 3);
  }
  return c;
}
let npI = 0, npN = 0, npDrag = null;
function newsPortrait(spr, bg) {                                                 // маленький піксельний портрет редактора
  const { c, g } = picCanvas(32, 32); R(g, 0, 0, 32, 32, bg); R(g, 0, 26, 32, 6, 'b');
  const sc = getSpriteCanvas(spr); g.drawImage(sc, 0, 0, sc.width, sc.height, (32 - sc.width) >> 1, 31 - sc.height, sc.width, sc.height);
  return c;
}

let newsSec = 'news';
const NP_SEC = { uk: { news: 'Новини', guide: 'Інструкція', soon: 'Скоро' }, en: { news: 'News', guide: 'How to play', soon: 'Coming soon' } };
const NP_GUIDE = {
  uk: { head: 'Інструкція гри', sub: 'Коротко про головне. Усе, про що тут написано, є в меню гри.', items: [
    ['Тапай і заробляй', 'Тапай по магазину: кожен тап дає монети. У вкладці «Магазин» прокачуй силу тапа, а коли монет вистачить, розширюй магазин: нові рівні відкривають відділи й помічників.'],
    ['Відділи й команда', '«Відділи» приносять монети самі, навіть коли ти не граєш. У «Команді» наймай звірят-помічників: кожен допомагає по-своєму. Тапни по звірятку на сцені, і воно щось скаже.'],
    ['Події на вулиці', 'Тут буває всяке: єнот-злодій, протікання даху, привиди й особливі звірі епохи. Тапай по них. Зловиш усіх звірів за один раз, отримаєш кристал. Поштова машина привозить листа з бонусом, а раз на ігрову добу приїздить цирк із барабаном фортуни.'],
    ['Подорож у часі', 'Коли пройдеш історію й виростиш торговий центр, тапни по годинниковій вежі: почнеться нова епоха. Ти отримаєш осколки часу й постійний бонус до тапів і доходу, а місто, магазин і музика змінять вигляд. Осколки витрачай у вкладці «Годинник».'],
    ['Кристали й скіни', 'Кристали дають за пійманих звірів, цирк, золотих покупців і завдання. Їх витрачають у вкладці «Скіни»: змінюй вигляд Капі, магазину й героїв. Пори року й час доби в окремій вкладці, вона відкривається після 2-ї епохи.'],
    ['Куди писати', 'Червона скринька на дорозі біля синьої: це ця газета. Кнопка «Написати розробникам» внизу чекає на твої ідеї та знайдені помилки.']
  ] },
  en: { head: 'How to play', sub: 'The short version. Everything described here is in the game menu.', items: [
    ['Tap and earn', 'Tap the shop: every tap gives coins. In the Shop tab boost your tap, and when you have enough coins, expand the shop: new levels open departments and helpers.'],
    ['Departments and team', 'Departments bring in coins by themselves, even when you are away. In Team, hire animal helpers: each one helps in their own way. Tap an animal on the scene and it might say something.'],
    ['Street events', 'All sorts happen here: the raccoon thief, a leaking roof, ghosts and the special animals of the era. Tap them. Catch all the animals in one go to get a crystal. The mail van brings a letter with a bonus, and once per game day the circus arrives with the fortune drum.'],
    ['Time travel', 'When you finish the story and grow the mall, tap the clock tower: a new era begins. You get time shards and a permanent bonus to taps and income, and the town, the shop and the music change their look. Spend shards in the Workshop tab.'],
    ['Crystals and skins', 'Crystals come from caught animals, the circus, golden customers and tasks. Spend them in the Skins tab: change the look of Capy, the shop and the heroes. Seasons and time of day have their own tab, which opens after the 2nd era.'],
    ['Where to write', 'The red mailbox on the road next to the blue one is this newspaper. The Write to the developers button at the bottom waits for your ideas and bug reports.']
  ] }
};
const NP_SOON = {
  uk: { head: 'Скоро в грі', sub: 'Те, що ми готуємо. Ще не вийшло, але вже майже.', items: [
    ['Застосунки для магазинів', 'Готуємо версії гри для телефона й комп’ютера в магазинах застосунків.']
  ] },
  en: { head: 'Coming soon', sub: 'What we are working on. Not out yet, but almost.', items: [
    ['App store versions', 'We are preparing versions of the game for phones and computers in app stores.']
  ] }
};
function npArticle(h, p, pic, cap) {
  const a = document.createElement('article'); a.innerHTML = '<h3>' + h + '</h3>';
  if (pic) { const f = document.createElement('figure'); f.className = 'np-fig'; f.appendChild(newsPic(pic)); if (cap) f.insertAdjacentHTML('beforeend', '<figcaption>' + cap + '</figcaption>'); a.appendChild(f); }
  a.insertAdjacentHTML('beforeend', '<p>' + p + '</p>'); return a;
}
function buildListPages(D, perPage) {                                          // розділи «Інструкція» і «Скоро»: заголовок на першій сторінці, потім статті
  const pages = [];
  for (let i = 0; i < D.items.length; i += perPage) {
    const pg = document.createElement('div'); pg.className = 'np-in';
    if (i === 0) pg.insertAdjacentHTML('beforeend', '<div class="np-lead">' + D.head + '</div><p>' + D.sub + '</p>');
    D.items.slice(i, i + perPage).forEach(it => pg.appendChild(npArticle(it[0], it[1], it[2], it[3])));
    pages.push(pg);
  }
  return pages;
}
function newsAnimate(change, dir) {                                            // плавна заміна сторінок при перемиканні розділу чи випуску
  if (newsBusy) return; newsBusy = true; playSfx('paper');
  const pg = ui.newsBody, out = pg.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-dir * 36) + 'px) scale(.97)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
  out.onfinish = () => { change(); newsFill(); out.cancel(); pg.animate([{ opacity: 0, transform: 'translateX(' + (dir * 36) + 'px) scale(.97)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => { newsBusy = false; }; };
}
function buildNewsPages() {
  if (newsSec === 'guide') return buildListPages(NP_GUIDE[state.lang === 'uk' ? 'uk' : 'en'], 2);
  if (newsSec === 'soon') return buildListPages(NP_SOON[state.lang === 'uk' ? 'uk' : 'en'], 1);
  const L = state.lang === 'uk' ? 'uk' : 'en', is = NEWS_ISSUES[newsIssue], items = is[L], pics = is.pics || {}, caps = (is.caps && is.caps[L]) || {};
  const pages = [];
  const cover = document.createElement('div'); cover.className = 'np-in np-cover';
  const mast = document.createElement('div'); mast.className = 'np-mast';
  mast.innerHTML = '<div class="row"><div class="who" id="npWhoA"></div><b>MEL<br><i>&amp;</i> NIKA</b><div class="who" id="npWhoB"></div></div><small>' + (L === 'uk' ? 'ГАЗЕТА ВІД РОЗРОБНИКІВ · ВИПУСК №' : 'NEWS FROM THE DEVELOPERS · ISSUE #') + is.ver + '</small>';
  const wa = mast.querySelector('#npWhoA'), wb = mast.querySelector('#npWhoB');
  wa.appendChild(newsPortrait('capy_mel', '#cdb98d')); wa.insertAdjacentHTML('beforeend', '<span>MEL</span>');
  wb.appendChild(newsPortrait('capy_nika', '#e7c6c0')); wb.insertAdjacentHTML('beforeend', '<span>NIKA</span>');
  mast.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  cover.appendChild(mast);
  cover.insertAdjacentHTML('beforeend', '<div class="np-lead">' + (newsIssue === 0 ? t('npCoverHead') : (L === 'uk' ? 'З архіву' : 'From the archive')) + '</div>');
  cover.insertAdjacentHTML('beforeend', '<p>' + is.intro[L] + '</p><b>' + t('npIn') + '</b><ol class="np-toc">' + items.map(it => '<li>' + it[0] + '</li>').join('') + '</ol>');
  pages.push(cover);
  const groups = []; for (let i = 0; i < items.length; ) { if (!pics[i] && i + 1 < items.length && !pics[i + 1]) { groups.push([i, i + 1]); i += 2; } else { groups.push([i]); i++; } }       // стаття з картинкою — на окремій сторінці
  groups.forEach((grp, gi) => {
    const pg = document.createElement('div'); pg.className = 'np-in';
    grp.forEach(k => {
      const a = document.createElement('article'); a.innerHTML = '<h3>' + items[k][0] + '</h3>';
      if (pics[k]) { const f = document.createElement('figure'); f.className = 'np-fig'; f.appendChild(newsPic(pics[k])); if (caps[k]) f.insertAdjacentHTML('beforeend', '<figcaption>' + caps[k] + '</figcaption>'); a.appendChild(f); }
      a.insertAdjacentHTML('beforeend', '<p>' + items[k][1] + '</p>'); pg.appendChild(a);
    });
    if (gi === groups.length - 1) pg.insertAdjacentHTML('beforeend', '<p class="np-sign">' + t('newsSign') + '</p>');
    pages.push(pg);
  });
  return pages;
}
function npShow(first) {
  const els = ui.newsBody.children;
  [...els].forEach((el, i) => { el.classList.toggle('flipped', i < npI); el.style.zIndex = String(npN - i); if (i === npI) { const sc = el.querySelector('.np-in'); if (sc) sc.scrollTop = 0; } });
  ui.npNum.textContent = (npI + 1) + ' / ' + npN; ui.npPrev.disabled = npI === 0; ui.npNext.disabled = npI === npN - 1;
}
function npGo(d) { const n = Math.max(0, Math.min(npN - 1, npI + d)); if (n === npI) return; npI = n; npShow(); playSfx('paper'); }
function newsFill() {                                                           // сторінки обраного розділу/випуску й вкладки
  ui.newsBody.innerHTML = '';
  buildNewsPages().forEach(inner => { const pg = document.createElement('div'); pg.className = 'np-page'; pg.appendChild(inner); ui.newsBody.appendChild(pg); });
  npI = 0; npN = ui.newsBody.children.length; npShow(true);
  const L = state.lang === 'uk' ? 'uk' : 'en', secs = ['news', 'guide', 'soon'];
  ui.npSecs.innerHTML = '';
  secs.forEach((k, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'np-tab' + (k === newsSec ? ' on' : ''); b.textContent = NP_SEC[L][k]; b.addEventListener('click', e => { e.stopPropagation(); if (k === newsSec || newsBusy) return; const dir = i > secs.indexOf(newsSec) ? 1 : -1; newsAnimate(() => { newsSec = k; newsIssue = 0; }, dir); }); ui.npSecs.appendChild(b); });
  ui.npTabs.innerHTML = ''; ui.npTabs.hidden = newsSec !== 'news';
  if (newsSec === 'news') NEWS_ISSUES.forEach((is, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'np-tab' + (k === newsIssue ? ' on' : ''); b.textContent = (k === 0 ? (state.lang === 'uk' ? 'Свіжий №' : 'New #') : '№') + is.ver; b.addEventListener('click', e => { e.stopPropagation(); if (k === newsIssue || newsBusy) return; newsAnimate(() => { newsIssue = k; }, k > newsIssue ? 1 : -1); }); ui.npTabs.appendChild(b); });
}
function openNews() {
  ui.newsTitle.textContent = t('newsTitle'); ui.newsSub.textContent = t('newsSub');
  newsIssue = 0; newsSec = 'news'; newsBusy = false; newsFill();
  ui.newsClose.textContent = t('newsClose'); ui.npWrite.textContent = t('fbBtn');
  ui.newsModal.classList.remove('open'); void ui.newsModal.offsetWidth; ui.newsModal.classList.add('open');
  ui.newsModal.hidden = false; newsReveal(); playSfx('paper'); setTimeout(() => playSfx('wheelWin'), 650); setTimeout(() => playSfx('paper'), 900);
  if (newsUnread()) { state.newsSeen = NEWS_VERSION; saveGame(); }
}
// Куди надходять повідомлення гравців (заповнює розробник; усе порожнє = текст лише копіюється):
//   url   — адреса форми/сервісу, що приймає POST із JSON (Formspree, Google Apps Script тощо) і пересилає листом розробникам;
//   email — запасний варіант: відкриє поштову програму гравця з готовим листом;
//   form  — Google Форма (рекомендовано: відгуки збираються в таблицю, яку розробник відкриває за посиланням на ПК). Адреса виду
//           https://docs.google.com/forms/d/e/<ID>/formResponse, а entries — номери полів «Відгук» і «Контакт» (entry.1234567890).
const FEEDBACK = { url: '', email: 'capytap.games@gmail.com', form: '', entries: { message: '', contact: '' } };
function openFeedback() {
  ui.fbTitle.textContent = t('fbTitle'); ui.fbHint.textContent = t('fbHint'); ui.fbText.placeholder = '…'; ui.fbContact.placeholder = t('fbContact');
  ui.fbSend.textContent = t('fbSend'); ui.fbCancel.textContent = t('fbCancel');
  let draft = ''; try { draft = localStorage.getItem('capyFeedbackDraft') || ''; } catch (e) { /* без чернетки теж працює */ }
  ui.fbText.value = draft; ui.fbCount.textContent = draft.length + ' / 800';
  ui.fbModal.hidden = false; setTimeout(() => { try { ui.fbText.focus(); } catch (e) { /* ok */ } }, 50);
}
function closeFeedback() { ui.fbModal.hidden = true; }
async function sendFeedback() {
  const msg = ui.fbText.value.trim(), contact = ui.fbContact.value.trim();
  if (msg.length < 3) { showToast(t('fbEmpty'), 'bad'); return; }
  const info = { message: msg, contact, game: 'CapyTap: Market', lang: state.lang, epoch: state.epoch, shopLevel: state.shopLevel, travels: (state.stats && state.stats.timeTravels) || 0, ua: (navigator.userAgent || '').slice(0, 120) };
  const done = () => { try { localStorage.removeItem('capyFeedbackDraft'); } catch (e) { /* ok */ } ui.fbText.value = ''; closeFeedback(); };
  if (FEEDBACK.form && FEEDBACK.entries.message) {                                   // Google Форма: надсилаємо як звичайну форму, відповідь браузер не показує (no-cors), тому помилкою вважаємо лише обрив мережі
    ui.fbSend.disabled = true;
    try {
      const fd = new URLSearchParams();
      fd.set(FEEDBACK.entries.message, msg + '\n\n— ' + info.game + ', ' + info.lang + ', епоха ' + info.epoch + ', рівень ' + info.shopLevel + ', подорожей ' + info.travels + ', ' + info.ua);
      if (FEEDBACK.entries.contact) fd.set(FEEDBACK.entries.contact, contact);
      await fetch(FEEDBACK.form, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
      done(); showToast(t('fbThanks'), 'good'); playSfx('wheelWin');
    } catch (e) { showToast(t('fbFail'), 'bad'); }
    ui.fbSend.disabled = false; return;
  }
  if (FEEDBACK.url) {
    ui.fbSend.disabled = true;
    try { const r = await fetch(FEEDBACK.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(info) }); if (!r.ok) throw new Error('http'); done(); showToast(t('fbThanks'), 'good'); playSfx('wheelWin'); }
    catch (e) { showToast(t('fbFail'), 'bad'); }
    ui.fbSend.disabled = false; return;
  }
  const body = msg + '\n\n— ' + (contact || '') + '\n(' + info.game + ', ' + info.lang + ', epoch ' + info.epoch + ', level ' + info.shopLevel + ')';
  if (FEEDBACK.email) { window.location.href = 'mailto:' + FEEDBACK.email + '?subject=' + encodeURIComponent('CapyTap: Market') + '&body=' + encodeURIComponent(body); done(); return; }
  try { await navigator.clipboard.writeText(body); } catch (e) { /* буфер недоступний */ }
  showToast(t('fbCopied'), 'good'); done();
}
let npRevealRaf = 0;
function newsReveal() {                                                         // з центру розходяться пікселі, заповнюються папером і переростають у газету
  const host = ui.npPaper; let cv = document.getElementById('npReveal'); if (cv) cv.remove();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { host.style.opacity = ''; return; }
  const W = host.clientWidth, H = host.clientHeight - 36; if (W < 40 || H < 40) return;
  const B = 12, cols = Math.ceil(W / B), rows = Math.ceil(H / B);
  cv = document.createElement('canvas'); cv.id = 'npReveal'; cv.width = cols; cv.height = rows; host.appendChild(cv);
  const g = cv.getContext('2d'), noise = new Float32Array(cols * rows).map((_, i) => ((i * 2654435761) >>> 8) % 100 / 100);
  const pages = ui.newsBody; pages.style.opacity = '0';
  const t0 = performance.now(), D = 950, maxD = Math.hypot(cols / 2 * (H / W), rows / 2) + 1;
  cancelAnimationFrame(npRevealRaf);
  const frame = now => {
    const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 2.2), rad = e * (maxD + 3);
    const fill = (x, y) => { if (x < 0 || y < 0 || x >= cols || y >= rows) return false; const dx = (x + .5 - cols / 2) * (H / W), dy = y + .5 - rows / 2; return Math.hypot(dx, dy) + noise[y * cols + x] * 1.6 <= rad; };
    g.clearRect(0, 0, cols, rows);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (!fill(x, y)) continue;
      const edge = !(fill(x - 1, y) && fill(x + 1, y) && fill(x, y - 1) && fill(x, y + 1));
      g.fillStyle = edge ? '#2a1d1a' : '#f6edd2'; g.fillRect(x, y, 1, 1);
    }
    const a = Math.max(0, (k - 0.45) / 0.55); pages.style.opacity = String(a * a * (3 - 2 * a));
    cv.style.opacity = k < 0.8 ? '1' : String(Math.max(0, 1 - (k - 0.8) / 0.2));
    if (k < 1 && !ui.newsModal.hidden) npRevealRaf = requestAnimationFrame(frame); else { pages.style.opacity = ''; cv.remove(); }
  };
  npRevealRaf = requestAnimationFrame(frame);
}
function closeNews() {
  cancelAnimationFrame(npRevealRaf); ui.newsBody.style.opacity = ''; const rv = document.getElementById('npReveal'); if (rv) rv.remove(); ui.newsModal.hidden = true; ui.newsModal.classList.remove('open'); }
function hitMail(p) {
  if (!state.events.mailPending) return false;
  const x = mailBoxX(), y = mailRoadY();
  if (Math.abs(p.x - x) <= 14 && p.y >= y - 38 && p.y <= y + 3) { openLetter(); return true; }
  return false;
}
// Лист: випадковий відправник (звірята-друзі) і випадковий бонус
const LETTER_SENDERS = ['spike', 'zoya', 'bodya', 'sonia', 'leo', 'pao'];
function openLetter() {
  const fin = state.story.finale;
  const kinds = [['income', 30], ['tap', 25], ['coins', 25], ['wheel', 10], ['sale', 8], ['crystal', 4]];
  let roll = Math.random() * kinds.reduce((a, k) => a + k[1], 0), kind = kinds[0][0];
  for (const k of kinds) { roll -= k[1]; if (roll < 0) { kind = k[0]; break; } }
  const sender = LETTER_SENDERS[Math.floor(Math.random() * LETTER_SENDERS.length)];
  mail.letter = { kind, sender };
  let boost = '';
  if (kind === 'income') { mail.letter.mult = Math.random() < 0.6 ? 2 : 3; mail.letter.min = mail.letter.mult === 2 ? 6 : 4; boost = t('letterBoost_income', mail.letter.mult, mail.letter.min); }
  else if (kind === 'tap') { mail.letter.mult = 5; mail.letter.min = 3; boost = t('letterBoost_tap', 5, 3); }
  else if (kind === 'coins') { mail.letter.gain = Math.floor(state.cps * 900 + 500 * levelMult()); boost = t('letterBoost_coins', fmt(mail.letter.gain)); }
  else if (kind === 'wheel') boost = t('letterBoost_wheel');
  else if (kind === 'sale') boost = t('letterBoost_sale');
  else boost = t('letterBoost_crystal');
  ui.letterTitle.textContent = t('letterTitle', t('team_' + sender));
  ui.letterText.textContent = t('letter_' + sender);
  ui.letterBoost.textContent = boost;
  ui.letterBtn.textContent = t('letterBtn');
  ui.letterModal.hidden = false;
  playSfx('wheelWin');
}
function claimLetter() {
  const L = mail.letter, now = Date.now(), ev = state.events;
  ui.letterModal.hidden = true;
  if (!L) return;
  mail.letter = null; ev.mailPending = 0;
  if (L.kind === 'income') { ev.incomeBoostUntil = now + L.min * 60000; ev.incomeBoostMult = L.mult; }
  else if (L.kind === 'tap') { ev.tapBoostUntil = now + L.min * 60000; ev.tapBoostMult = L.mult; }
  else if (L.kind === 'coins') { state.coins += L.gain; state.totalEarned += L.gain; }
  else if (L.kind === 'wheel') state.wheel.lastSpin = 0;
  else if (L.kind === 'sale') startSale(now);
  else { state.crystals += 1; state.crystalsTotal += 1; }
  recalcIncome();
  showToast(ui.letterBoost.textContent, 'good');
  playSfx('upgrade');
  updateUI(); saveGame();
}

/* ---------- Колесо фортуни ---------- */
function wheelCooldownMs() { return (WHEEL_HOURS_BY_LEVEL[wsLevel('wheelFast')] || CONFIG.WHEEL_COOLDOWN_HOURS) * 3600000; }
function wheelReady(now = Date.now()) { return now - state.wheel.lastSpin >= wheelCooldownMs(); }
// Серія днів: якщо крутили менше ніж 48 годин тому — серія продовжується
function projectedStreak(now = Date.now()) {
  return (state.wheel.lastSpin && now - state.wheel.lastSpin < Math.max(wheelCooldownMs() * 2, CONFIG.WHEEL_COOLDOWN_HOURS * 2 * 3600000)) ? state.wheel.streak + 1 : 1;
}
function streakMult(streak) { return 1 + CONFIG.WHEEL_STREAK_STEP * (Math.min(streak, CONFIG.WHEEL_STREAK_MAX_DAYS) - 1); }

// Маленькі піксельні значки на секторах
function drawWheelIcon(g, kind, cx, cy) {
  const cc = EPOCH_COIN_COLORS[viewEpoch() % EPOCH_COIN_COLORS.length];
  const coin = (x, y) => { disc(g, x, y, 4, 'd'); disc(g, x, y, 3, cc[0]); R(g, x - 1, y - 2, 2, 1, cc[1]); };
  switch (kind) {
    case 'gem': { const rows = SPRITES[gemSprite()].rows; rows.forEach((row, ry) => { for (let rx = 0; rx < 8; rx++) if (row[rx] !== '.') R(g, cx - 4 + rx, cy - 4 + ry, 1, 1, row[rx]); }); break; }
    case 'coin1': coin(cx, cy); break;
    case 'coin2': coin(cx - 4, cy + 2); coin(cx + 4, cy - 2); break;
    case 'coin3': coin(cx - 5, cy + 3); coin(cx + 5, cy + 3); coin(cx, cy - 3); break;
    case 'up':
      for (let i = 0; i < 6; i++) { R(g, cx - i - 1, cy - 7 + i, 2 * i + 3, 1, 'd'); R(g, cx - i, cy - 7 + i, 2 * i + 1, 1, 'w'); }
      R(g, cx - 3, cy - 1, 7, 8, 'd'); R(g, cx - 2, cy - 1, 5, 7, 'w'); break;
    case 'tap':
      for (let i = 0; i < 9; i++) { R(g, cx - 4, cy - 7 + i, Math.min(i + 2, 7), 1, 'd'); R(g, cx - 3, cy - 7 + i, Math.max(1, Math.min(i, 5)), 1, 'w'); }
      R(g, cx - 1, cy + 1, 3, 7, 'd'); R(g, cx, cy + 1, 1, 6, 'w'); break;
    case 'star': {
      const star = ['.....y.....', '....yyy....', '....yyy....', 'yyyyyyyyyyy', '.yyyyyyyyy.', '..yyyyyyy..', '..yyyyyyy..', '.yyyy.yyyy.', '.yyy...yyy.', 'yy.......yy'];
      const draw = (ox, oy, col) => star.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] === 'y') R(g, cx - 5 + rx + ox, cy - 5 + ry + oy, 1, 1, col); });
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([ox, oy]) => draw(ox, oy, 'd'));   // контур
      draw(0, 0, 'w'); draw(0, 1, 'h');
      break;
    }
  }
}
function buildWheelTexture() {
  const S = 128, c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d');
  const cx = 64, cy = 64, step = Math.PI / 4;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.sqrt(dx * dx + dy * dy);
      if (r > 62) continue;
      let col;
      if (r >= 59) col = 'd';
      else if (r < 9) col = r >= 7 ? 'd' : 'h';
      else {
        let a = Math.atan2(dx, -dy); if (a < 0) a += Math.PI * 2;
        const sec = Math.floor(a / step), frac = a / step - sec;
        const edge = Math.min(frac, 1 - frac) * step * r;
        col = edge < 0.9 ? 'd' : (r >= 55.5 && r < 57 ? ((Math.floor(a / step * 3) % 2) ? 'w' : 'y') : WHEEL_SECTORS[sec].color);
      }
      R(g, x, y, 1, 1, col);
    }
  }
  WHEEL_SECTORS.forEach((s, i) => {
    const a = (i + 0.5) * step;
    drawWheelIcon(g, s.icon, Math.round(cx + Math.sin(a) * 36), Math.round(cy - Math.cos(a) * 36));
  });
  return c;
}
// Барабан фортуни: вертикальний барабан із 8 комірок-призів; обертається вгору, призова комірка зупиняється між двома червоними стрілками
let drumCells = null;
const DRUM_CELL_H = 38, DRUM_R = 50;          // висота клітинки й радіус барабана: проміжок між призами ~2–3 пікселі
// Клітинки барабана: sectors — призи, iconFn(g, sector, cx, cy) малює значок; H — висота клітинки
function buildDrumCellsFor(sectors, iconFn, H) {
  return sectors.map(sec => {
    const c = document.createElement('canvas'); c.width = 96; c.height = H; const g = c.getContext('2d');
    R(g, 0, 0, 96, H, 'd'); R(g, 2, 2, 92, H - 4, sec.color); R(g, 2, 2, 92, 3, 'w'); R(g, 2, H - 5, 92, 3, 'd'); g.globalAlpha = 0.25; R(g, 2, H - 5, 92, 3, 'd'); g.globalAlpha = 1;
    iconFn(g, sec, 26, H >> 1); iconFn(g, sec, 70, H >> 1);
    R(g, 47, 6, 2, H - 12, 'd'); R(g, 46, 4, 4, 2, 'w'); R(g, 46, H - 6, 4, 2, 'w');
    return c;
  });
}
function buildDrumCells() { return buildDrumCellsFor(WHEEL_SECTORS, (g, sec, x, y) => drawWheelIcon(g, sec.icon, x, y), DRUM_CELL_H); }
// Малює вертикальний барабан на полотні 128×140: n комірок, кут angle (як у колеса), усередині рамки з двома червоними стрілками
function paintDrum(g, cells, n, angle, H) {
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, 128, 140);
  R(g, 12, 18, 104, 116, 'd'); R(g, 14, 20, 100, 112, 'k');                                  // корпус барабана
  const step = Math.PI * 2 / n, order = [];
  for (let i = 0; i < n; i++) { const ang = (i + 0.5) * step + angle, c = Math.cos(ang); if (c > 0.05) order.push({ i, c, y: 76 - Math.sin(ang) * DRUM_R }); }
  g.save(); g.beginPath(); g.rect(14, 20, 100, 112); g.clip();                                // комірки не виходять за корпус
  order.sort((p, q) => p.c - q.c).forEach(o => {
    const h = Math.max(2, Math.round(H * o.c)), y = Math.round(o.y - h / 2);
    g.drawImage(cells[o.i], 0, 0, 96, H, 16, y, 96, h);
    if (o.c < 0.95) { g.globalAlpha = 0.55 * (1 - o.c); R(g, 16, y, 96, h, 'k'); g.globalAlpha = 1; }
  });
  g.restore();
  g.globalAlpha = 0.28; R(g, 16, 22, 96, 18, 'k'); R(g, 16, 112, 96, 18, 'k'); g.globalAlpha = 1;   // затемнення зверху й знизу — об'єм
  R(g, 8, 14, 112, 6, 'e'); R(g, 8, 14, 112, 2, 'E'); R(g, 8, 132, 112, 6, 'e'); R(g, 8, 136, 112, 2, 'd'); R(g, 8, 14, 112, 1, 'd'); R(g, 8, 19, 112, 1, 'd'); R(g, 8, 132, 112, 1, 'd');
  for (let x = 14; x < 118; x += 12) { R(g, x, 16, 2, 2, 'd'); R(g, x, 134, 2, 2, 'd'); }
  for (let i = 0; i < 9; i++) { R(g, 2 + i, 66 + i, 1, 20 - i * 2 > 0 ? 20 - i * 2 : 1, 'r'); R(g, 125 - i, 66 + i, 1, 20 - i * 2 > 0 ? 20 - i * 2 : 1, 'r'); }   // червоні стрілки-вказівники з боків
  R(g, 0, 66, 2, 20, 'd'); R(g, 126, 66, 2, 20, 'd');
}
function drawWheel() {
  if (!drumCells) drumCells = buildDrumCells();
  paintDrum(ui.wheelCanvas.getContext('2d'), drumCells, 8, wheelAngle, DRUM_CELL_H);
}
function updateWheelUI() {
  if (ui.wheelModal.hidden) return;
  const now = Date.now(), ready = wheelReady(now);
  const streak = (wheelAnim || !ready) ? Math.max(1, state.wheel.streak) : projectedStreak(now);
  setText(ui.wheelStreak, t('wheelStreak', streak, fmt(streakMult(streak), 2)), 'wStreak');
  if (wheelAnim) { setText(ui.wheelBtn, t('wheelSpin'), 'wBtn'); ui.wheelBtn.disabled = true; }
  else if (ready) { setText(ui.wheelBtn, t('wheelSpin'), 'wBtn'); ui.wheelBtn.disabled = false; }
  else { setText(ui.wheelBtn, t('wheelWait', fmtTime((state.wheel.lastSpin + wheelCooldownMs() - now) / 1000)), 'wBtn'); ui.wheelBtn.disabled = true; }
  // додатковий оберт за кристали привидів
  const showGhost = false;                       // кристали привидів прибрано
  ui.wheelGhostBtn.hidden = ui.wheelGhostNote.hidden = !showGhost;
  if (showGhost) {
    setText(ui.wheelGhostBtn, t('wheelGhostBtn', CONFIG.GHOST_RESPIN_COST), 'wGhostBtn');
    ui.wheelGhostBtn.disabled = !!wheelAnim || state.ghosts < CONFIG.GHOST_RESPIN_COST;
    setText(ui.wheelGhostNote, t('wheelGhostNote', state.ghosts, CONFIG.GHOST_RESPIN_COST), 'wGhostNote');
  }
}
function openWheel() {
  if (dialog.active) return;
  ui.wheelModal.hidden = false;
  if (!wheelAnim) ui.wheelResult.textContent = '';
  drawWheel();
  updateWheelUI();
}
function closeWheel() { ui.wheelModal.hidden = true; }
function spinWheel(extra) {
  const now = Date.now();
  if (wheelAnim) return;
  if (extra) { if (state.ghosts < CONFIG.GHOST_RESPIN_COST) return; state.ghosts -= CONFIG.GHOST_RESPIN_COST; }   // додатковий оберт за кристали привидів
  else if (!wheelReady(now)) return;
  // вибір сектора за вагами
  const weight = x => x.weight;
  const total = WHEEL_SECTORS.reduce((s, x) => s + weight(x), 0);
  let roll = Math.random() * total, idx = 0;
  for (; idx < WHEEL_SECTORS.length - 1; idx++) { roll -= weight(WHEEL_SECTORS[idx]); if (roll < 0) break; }
  const s = WHEEL_SECTORS[idx];
  if (!extra) { state.wheel.streak = projectedStreak(now); state.wheel.lastSpin = now; }   // додатковий оберт не чіпає чергу й серію днів
  state.stats.wheelSpins++;
  const mult = streakMult(Math.max(1, state.wheel.streak));
  let text;
  if (s.kind === 'coins' || s.kind === 'jackpot') {
    const gain = Math.floor((state.cps * s.seconds + s.flat * levelMult()) * mult);
    state.coins += gain; state.totalEarned += gain;
    text = t(s.kind === 'jackpot' ? 'prize_jackpot' : 'prize_coins', fmt(gain));
    if (s.kind === 'jackpot') state.stats.jackpots++;
  } else if (s.kind === 'crystal') {
    const gem = Math.max(1, Math.floor(mult));
    state.crystals += gem; state.crystalsTotal += gem;
    text = t('prize_crystal', gem);
  } else if (s.kind === 'income') {
    state.events.incomeBoostUntil = now + s.minutes * 60000; state.events.incomeBoostMult = s.mult;
    text = t('prize_income', s.mult, s.minutes);
  } else {
    state.events.tapBoostUntil = now + s.minutes * 60000; state.events.tapBoostMult = s.mult;
    text = t('prize_tap', s.mult, s.minutes);
  }
  recalcIncome();
  const step = Math.PI / 4;
  const jitter = rand(-0.35, 0.35) * step;
  const from = wheelAngle % (Math.PI * 2);
  const to = Math.PI * 2 * 5 + (Math.PI * 2 - (idx + 0.5) * step) + jitter;
  wheelAnim = { t: 0, dur: CONFIG.WHEEL_SPIN_SECONDS, from, to, text, jackpot: s.kind === 'jackpot' };
  ui.wheelResult.textContent = '…';
  updateWheelUI();
  updateUI();
  saveGame();
}
function updateWheel(dt) {
  if (!wheelAnim) return;
  wheelAnim.t += dt;
  const k = Math.min(1, wheelAnim.t / wheelAnim.dur), e = 1 - Math.pow(1 - k, 3);
  const prevSector = Math.floor(wheelAngle / (Math.PI / 4));
  wheelAngle = wheelAnim.from + (wheelAnim.to - wheelAnim.from) * e;
  if (Math.floor(wheelAngle / (Math.PI / 4)) !== prevSector && performance.now() - audio.lastTick > 40) { audio.lastTick = performance.now(); playSfx('wheelTick'); }
  if (!ui.wheelModal.hidden) drawWheel();
  if (k >= 1) {
    const done = wheelAnim;
    wheelAnim = null;
    wheelAngle = done.to % (Math.PI * 2);
    ui.wheelResult.textContent = done.text;
    playSfx(done.jackpot ? 'jackpot' : 'wheelWin');
    showToast(done.text, done.jackpot ? 'big' : 'good');
    updateWheelUI();
    updateUI();
  }
}

/* ---------- Головний цикл подій ---------- */
function updateEvents(dt) {
  updateWheel(dt);
  updateTrouble(dt);
  updateGhostHunt(dt);
  updateWeather(dt);
  updateMail(dt);
  updateCircus(dt);
  updateBirds(dt);
  updateEpochFeatures(dt);
  updateShootingStar(dt);
  updateDecorFx(dt);
  updateEpochFx(dt);
  eventTimer -= dt;
  if (eventTimer > 0) return;
  eventTimer = 0.25;
  const now = Date.now();
  let changed = false;
  if (updateTheme()) changed = true;
  updateMusic();
  // зміна активних бустів → перерахунок доходу
  const sig = [state.events.saleUntil > now, state.events.incomeBoostUntil > now, state.events.tapBoostUntil > now].join();
  if (sig !== uiCache.eventSig) { uiCache.eventSig = sig; changed = true; }
  if (changed) recalcIncome();
  if (!theme.blackFriday && now >= state.events.nextSale) startSale(now);
  const quiet = !trouble && !ghostHunt && !dialog.active && !epochIntro.active && !build && ui.modal.hidden && ui.wheelModal.hidden;
  if (quiet && state.story.done >= 2) {                // раз на кілька хвилин вилітають привиди (Хелловін) або герої поточної епохи
    if (!nextGhostAt) nextGhostAt = now + rand(25, 50) * 1000;
    else if (now >= nextGhostAt) startGhostHunt();
  }
  if (quiet && state.story.done >= 3 && now >= state.events.nextTrouble) startTrouble(now);
  // колесо стало готовим
  const ready = wheelReady(now);
  if (wheelWasReady === false && ready) showToast(t('wheelReady'), 'big');
  wheelWasReady = ready;
  ui.wheelOpen.classList.toggle('ready', ready);
  updateBoostsUI();
  updateBanner();
  updateWheelUI();
  achTimer += 0.25;
  if (achTimer >= 1) { achTimer = 0; checkAchievements(); }
}

// Початок гри: розклад подій, тема, колесо
function initEvents() {
  const now = Date.now();
  if (!state.events.nextSale) scheduleSale(now);
  else if (state.events.nextSale <= now) state.events.nextSale = now + rand(1, 5) * 60000;   // розпродаж «проґавили» — буде скоро
  if (!state.events.nextTrouble) scheduleTrouble(now);
  else if (state.events.nextTrouble <= now) state.events.nextTrouble = now + rand(1, 5) * 60000;
  updateTheme();
  wheelTexture = buildWheelTexture();
  ui.wheelOpen.addEventListener('click', openWheel);
  ui.wheelClose.addEventListener('click', closeWheel);
  ui.wheelBtn.addEventListener('click', () => spinWheel(false));
  ui.circusBtn.addEventListener('click', circusSpin);
  ui.lootWear.addEventListener('click', () => closeLoot(true));
  ui.lootClose.addEventListener('click', () => closeLoot(false));
  ui.circusClose.addEventListener('click', closeCircus);
  ui.circusWheel.addEventListener('click', hagClick);
  ui.circusModal.addEventListener('click', e => { if (e.target === ui.circusModal) closeCircus(); });
  ui.dbgCircus.addEventListener('click', () => { const c = state.circus; if (c.phase === 0 || c.phase === 4) { c.phase = 0; c.next = Date.now() - 1; } showToast('Цирк скоро!', 'good'); });
  ui.letterBtn.addEventListener('click', claimLetter);
  ui.wheelGhostBtn.addEventListener('click', () => spinWheel(true));
  ui.wheelModal.addEventListener('click', e => { if (e.target === ui.wheelModal) closeWheel(); });
  if (theme.holiday) {
    const h = theme.holiday;
    const bonus = h.bonus.global ? t('hb_global', Math.round(h.bonus.global * 100)) : Object.keys(h.bonus.depts || {}).map(i => t('hb_dept', deptName(i), fmt(1 + h.bonus.depts[i], 2))).join(', ');
    showToast(t('holidayToast', h.icon + ' ' + t('holiday_' + h.id), bonus), 'big');
  }
}

