//#part 230_a1_skins_circus_hag.js
/* =====================================================================
   ЦИРК ФОРТУНИ: раз на ігрову добу в правому куті з’являється червоний «!», який мигає й грає марш.
   Тап по ньому → цирк-причіп їде справа наліво ~5 с → тап по цирку → вікно з колесом на 12 секторів (кристали й бонуси) і клоуном Бубоном.
   У Японії замість цирку лапшична, на Хелловін відьма: це бонус-ігри, їхній головний приз може бути скіном (барабан фортуни прибрано).
   ===================================================================== */
// 12 секторів цирку: кристали й бонуси (монети, дохід, тап, джекпот). Скінів у цирку нема: їх виграють у бонус-іграх (лапшична, хатка відьми)
const CIRCUS_SECTORS = (function () {
  const cr = (n, w, color) => ({ kind: 'crystal', amount: n, weight: w, color, icon: n > 1 ? 'gem' + n : 'gem' });
  const co = (seconds, flat, w, color, icon) => ({ kind: 'coins', seconds, flat, weight: w, color, icon });
  const bo = (kind, mult, minutes, w, color, icon) => ({ kind, mult, minutes, weight: w, color, icon });
  return [cr(1, 14, 'u'), co(60, 50, 12, 'r', 'coin1'), cr(2, 9, 'v'), bo('income', 2, 5, 9, 'h', 'up2'), cr(1, 14, 'u'), bo('tap', 3, 3, 8, 'p', 'tap3'),
    cr(3, 5, 'P'), co(180, 200, 8, 'm', 'coin2'), cr(1, 14, 'u'), bo('income', 3, 3, 5, 'o', 'up3'), cr(2, 9, 'v'), { kind: 'jackpot', seconds: 3600, flat: 10000, weight: 3, color: 'y', icon: 'star' }];
})();
// Скіни-призи (Капі двічі за вагою): додаються до пулу лише в бонус-іграх, коли вони дають головний приз
const BONUS_GAME_SKINS = [['capy', 'c', 'hat'], ['shop', 'q', 'house'], ['weather', 'S', 'cloud'], ['street', 'E', 'brick'], ['hero', 'w', 'paw'], ['capy', 'c', 'hat']]
  .map(([type, color, icon]) => ({ kind: 'skin', skin: type, weight: 7, color, icon }));
// Магазин часу «Цирк частіше» (id wheelFast): скільки від звичайної паузи між візитами цирку або бонус-гри
function circusFreq() { return CIRCUS_FREQ_BY_LEVEL[wsLevel('wheelFast')] || 1; }
const WEATHER_ORDER = ['rainbow', 'lightning', 'lightninggreen', 'lightningred', 'cottoncloud', 'goldcloud', 'starcloud', 'diamondcloud', 'aurora'];     // порядок у вкладці: хмари в кінці
const SKIN_HIDDEN = ['hero_party', 'hero_ninja', 'hero_chef', 'hero_wizard', 'hero_royal', 'hero_santa', 'hero_witch', 'hero_diamond', 'street_diamond', 'street_snow', 'street_leaves', 'capy_sailor', 'capy_detective', 'shop_ice', 'shop_spring', 'shop_autumn'];                // зимова й осіння бруківка вже є в порах року: зі списку прибрано (біти лишились, щоб не збити збереження)
const SKIN_TYPES = ['capy', 'shop', 'weather', 'street', 'hero'];   // групи скінів: Капі, магазин, погода, герої
const SKIN_POOL = ['capy_pirate', 'capy_astro', 'shop_candy', 'shop_gold', 'weather_rainbow', 'weather_lightning', 'hero_party', 'hero_ninja', 'capy_ep0', 'capy_ep1', 'capy_ep2', 'capy_ep3', 'capy_ep4', 'capy_ep5', 'capy_ep6', 'capy_ep7', 'capy_wizard', 'capy_chef', 'capy_explorer', 'capy_detective', 'capy_sailor', 'shop_ice', 'shop_wood', 'shop_garden', 'weather_cottoncloud', 'weather_goldcloud', 'weather_starcloud', 'hero_chef', 'hero_wizard', 'hero_royal', 'street_wood', 'street_brick', 'capy_santa', 'capy_witch', 'capy_flower', 'capy_beach', 'capy_autumn', 'hero_santa', 'hero_witch', 'shop_xmas', 'shop_halloween', 'shop_spring', 'shop_autumn', 'street_snow', 'street_leaves', 'capy_mel', 'capy_nika', 'capy_knight', 'capy_hero', 'capy_cowboy', 'capy_fairy', 'capy_viking', 'capy_pilot', 'weather_lightninggreen', 'weather_lightningred', 'street_moss', 'street_gold', 'capy_gold', 'capy_diamond', 'hero_gold', 'hero_diamond', 'shop_diamond', 'street_diamond', 'weather_diamondcloud', 'shop_ocean', 'street_candy', 'street_sand', 'weather_aurora', 'hero_wood', 'hero_brick', 'hero_moss', 'hero_candy', 'hero_sand'];
const SKIN_SEASON = { capy_santa: '🎄', capy_witch: '🎃', capy_flower: '🌸', capy_beach: '🏖️', capy_autumn: '🍂', hero_santa: '🎄', hero_witch: '🎃', shop_xmas: '🎄', shop_halloween: '🎃', shop_spring: '🌸', shop_autumn: '🍂', street_snow: '❄️', street_leaves: '🍂' };   // сезонні скіни
function skinHas(i) { return i < 32 ? !!(state.skinsMask & (1 << i)) : i < 64 ? !!(state.skinsMask2 & (1 << (i - 32))) : !!(state.skinsMask3 & (1 << (i - 64))); }       // перші 32 скіни — у skinsMask, решта — у skinsMask2
function skinGrant(i) { if (i < 32) state.skinsMask |= (1 << i); else if (i < 64) state.skinsMask2 |= (1 << (i - 32)); else state.skinsMask3 |= (1 << (i - 64)); }
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
    'R': ['####.', '#...#', '####.', '#..#.', '#...#'], 'S': ['.####', '#....', '.###.', '....#', '####.'],
    'A': ['.###.', '#...#', '#####', '#...#', '#...#'], 'B': ['####.', '#...#', '####.', '#...#', '####.'], 'D': ['####.', '#...#', '#...#', '#...#', '####.'],
    'E': ['#####', '#....', '####.', '#....', '#####'], 'F': ['#####', '#....', '####.', '#....', '#....'], 'G': ['.####', '#....', '#.###', '#...#', '.####'],
    'H': ['#...#', '#...#', '#####', '#...#', '#...#'], 'J': ['..###', '...#.', '...#.', '#..#.', '.##..'], 'M': ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
    'N': ['#...#', '##..#', '#.#.#', '#..##', '#...#'], 'O': ['.###.', '#...#', '#...#', '#...#', '.###.'], 'P': ['####.', '#...#', '####.', '#....', '#....'],
    'T': ['#####', '..#..', '..#..', '..#..', '..#..'], 'V': ['#...#', '#...#', '#...#', '.#.#.', '..#..'], 'W': ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
    'X': ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'], 'Z': ['#####', '...#.', '..#..', '.#...', '#####']
  };
  // довгий прапор-стрічка з назвою; кожен стовпчик іде хвилею
  function flag(g, x0, y0, len, t, fill, ink, text, edge) {
    const pix = {}; let cx = 3;
    for (const ch of text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/Ł/g, 'L')) { if (ch === ' ') { cx += 3; continue; } const gl = GL[ch]; if (!gl) continue; gl.forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') (pix[cx + rx] = pix[cx + rx] || []).push(ry); }); cx += 6; }
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
    rr(g, 80, 3, 1, 12, th.out); flag(g, 81, 3, 76, t, th.flag[0], th.flag[1], circusFlagText(), th.flag[2]);
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
const HAG_X = [48, 128, 208], HAG_CY = 136;
const hagGame = { phase: 'idle', t: 0, c: [], si: 0, st: 0, swaps: [], pairs: [], rt: 0, pick: -1, top: 0 };
