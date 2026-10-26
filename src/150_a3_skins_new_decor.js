//#part 150_a3_skins_new_decor.js
/* =====================================================================
   НОВІ СКІНИ: магазин «Океан» (палітра + декор фасаду), бруківки «Цукерна», «Піщана».
   Підключаються гачками: SHOP_DECO_EXTRA (skinShopDeco у 150_a2), STREET_EXTRA (cobbleExtra у 140_a); літаючі прикраси — у 211_skins_new_fx.js.
   ===================================================================== */
Object.assign(SHOP_SKINS, {
  ocean:  { roofPal: { r: 'n', n: 'T' }, trim: 'o', col: ['T', 'S'], frame: ['n', 's'], glass: 'S', base: 'n', band: null, awningCols: ['T', 'w'], signFill: 'n', inner: ['a', 'S', 'm', '*'] }
});
// стіни поверхів під стиль скіна (у старих скінів теж)
[['candy', ['q', 'W', 'm', 'y']], ['gold', ['y', '%', 'W', 'c']], ['diamond', ['S', 'a', '1', '*']], ['xmas', ['W', 'q', '1', 'm']], ['halloween', ['u', 'j', 'v', 'o']],
 ['spring', ['q', 'm', 'y', 'S']], ['autumn', ['%', 'j', 'c', 'W']], ['ice', ['S', '1', 'a', '*']], ['wood', ['c', '%', 'W', 'B']], ['garden', ['m', 'y', 'q', '%']]]
  .forEach(([k, inner]) => { if (SHOP_SKINS[k]) SHOP_SKINS[k].inner = inner; });
const SHOP_DECO_EXTRA = {};
const STREET_EXTRA = {};
// спрайт із рядків: літери — ключі палітри, «.» — прозоро
function sprG(g, x, y, rows, map) {
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = r[i]; if (c !== '.') R(g, x + i, y + j, 1, 1, (map && map[c]) || c); } });
}
function thickG(g, x0, y0, x1, y1, c) {                 // товста (2 px) лінія з темним контуром
  lineG(g, x0 - 1, y0, x1 - 1, y1, 'd'); lineG(g, x0 + 2, y0, x1 + 2, y1, 'd'); lineG(g, x0, y0 - 1, x1, y1 - 1, 'd');
  lineG(g, x0, y0, x1, y1, c); lineG(g, x0 + 1, y0, x1 + 1, y1, c);
}
// перефарбовує лише пікселі даху (кольори з map) там, де pred(x, y) — смуги шапіто, хвилі океану
function roofRecolor(g, w, y0, y1, map, pred) {
  y0 = Math.max(0, y0); const id = g.getImageData(0, y0, w, y1 - y0), d = id.data;
  const rgb = k => { const h = PALETTE[k] || k; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  const M = typeof map === 'function' ? [] : map.map(([a, b]) => [rgb(a), rgb(b)]);
  for (let y = 0; y < y1 - y0; y++) for (let x = 0; x < w; x++) {
    if (!pred(x, y + y0)) continue;
    const i = (y * w + x) * 4; if (d[i + 3] < 200) continue;
    if (typeof map === 'function') { const o = map(d[i], d[i + 1], d[i + 2]); if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; } continue; }
    for (const [a, b] of M) if (Math.abs(d[i] - a[0]) + Math.abs(d[i + 1] - a[1]) + Math.abs(d[i + 2] - a[2]) < 14) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; }
  }
  g.putImageData(id, 0, y0);
}
const SPR_STAR7 = ['...d...', '..dyd..', 'ddyyydd', 'dywyyyd', '.dyyyd.', '.dyddyd', '.dd..dd'];
const SPR_CHEST = ['..dddddddd..', '.dlllllllld.', 'dbbbbbbbbbbd', 'dddddyyddddd', 'dbbbbdydbbbd', 'dbbbbbbbbbbd', 'dddddddddddd'];
function wheelG(g, cx, cy) {                              // штурвал над дверима
  [[-5, 0], [5, 0], [0, -5], [0, 5], [-4, -4], [4, 4], [-4, 4], [4, -4]].forEach(([dx, dy]) => { R(g, cx + dx - 1, cy + dy - 1, 3, 3, 'd'); R(g, cx + dx, cy + dy, 1, 1, 'h'); });
  disc(g, cx, cy, 4, 'd'); disc(g, cx, cy, 3, 'c'); disc(g, cx, cy, 2, 'd'); R(g, cx - 3, cy, 7, 1, 'l'); R(g, cx, cy - 3, 1, 7, 'l'); R(g, cx, cy, 1, 1, 'h');
}
const SPR_STARFISH =['...d...', '..dod..', 'ddooodd', '.dyoyd.', '.dodod.', '.d...d.'];
const SPR_CRAB = ['dd.....dd', 'drd...drd', '.drdddrd.', '.drwrwrd.', 'drrrrrrrd', 'd.d...d.d'];
const SPR_SHELL = ['..ddddd..', '.dqpqpqd.', 'dqpqpqpqd', 'dpqpqpqpd', '.ddddddd.'];
const SPR_FISH = ['..d....dd', '.dod..dod', 'dooodddoo', 'dowoooyod', '.ddooooyd', '...dddd..'];
function seaweedG(g, x, yb, len) {                        // водорість-хвиля
  for (let i = 0; i < len; i++) { const dx = Math.round(Math.sin(i * 0.8 + x * 0.7) * 1.6); R(g, x + dx - 1, yb - i, 4, 1, 'G'); }
  for (let i = 0; i < len; i++) { const dx = Math.round(Math.sin(i * 0.8 + x * 0.7) * 1.6); R(g, x + dx, yb - i, 2, 1, i % 5 === 0 ? 'm' : 'g'); }
}
function coralG(g, x, yb, c1, c2, hh) {                   // кущ коралів із гілками й світлими кінчиками
  R(g, x - 3, yb - 2, 8, 2, 'd'); R(g, x - 2, yb - 2, 6, 1, c1);
  thickG(g, x, yb - 2, x, yb - hh, c1);
  thickG(g, x, yb - 4, x - 4, yb - hh + 1, c1); thickG(g, x + 1, yb - 5, x + 5, yb - hh - 1, c1);
  thickG(g, x - 3, yb - hh + 4, x - 6, yb - hh - 1, c2);
  [[x, yb - hh - 1], [x - 4, yb - hh], [x + 5, yb - hh - 2], [x - 6, yb - hh - 2]].forEach(([tx, ty]) => { R(g, tx, ty, 2, 1, 'q'); });
}
function lifeRingG(g, cx, cy) {                           // рятувальне коло
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d >= 1.7 && d < 2.8) R(g, cx + dx, cy + dy, 1, 1, 'd');
    else if (d >= 2.8 && d < 5.1) R(g, cx + dx, cy + dy, 1, 1, (Math.floor((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 4)) % 2) ? 'w' : 'r');
    else if (d >= 5.1 && d < 6.2) R(g, cx + dx, cy + dy, 1, 1, 'd');
  }
  R(g, cx - 4, cy - 4, 2, 1, 'q');
}
function bubbleG(g, x, y, r) { disc(g, x, y, r, 'S'); disc(g, x, y, r - 1, 's'); R(g, x - r + 1, y - r + 1, 1, 1, 'w'); R(g, x - r + 2, y - r + 1, 1, 1, 'w'); }
function anchorG(g, x, y) {                               // якір на стіні
  sprG(g, x, y, ['...ddd...', '...dwd...', '...ddd...', '..ddYdd..', '.dddYddd.', '...dYd...', 'd..dYd..d', 'dd.dYd.dd', '.dddYddd.', '..ddYdd..', '...ddd...'], { Y: 'Y', w: 'w' });
}
SHOP_DECO_EXTRA.ocean = function (g, w, h, look, yG, door, top) {
  const yb = h - 7, dc = door.x + (door.w >> 1);
  for (let x = 6; x < w - 6; x += 5) { const sag = Math.round(Math.sin((x / w) * Math.PI * 2) * 2); R(g, x, yG + 11 + sag + ((x / 5 | 0) % 2), 2, 2, (x / 5 | 0) % 3 === 0 ? 'o' : 'w'); }   // гірлянда з буйків під навісом
  for (let x = 4; x < w - 4; x += 5) { R(g, x, h - 7, 3, 1, 'S'); R(g, x + 3, h - 6, 2, 1, 's'); }                                                   // хвилі на цоколі
  [3, w - 8].forEach((cx, i) => { for (let y = top + 22; y < h - 10; y++) { const dx = Math.round(Math.sin(y * 0.5 + i * 2) * 1.2); R(g, cx + 1 + dx, y, 1, 1, y % 6 < 2 ? 'm' : 'g'); } for (let y = top + 26; y < h - 12; y += 11) { R(g, cx, y, 3, 3, 'd'); R(g, cx + 1, y + 1, 1, 1, 'w'); R(g, cx, y + 1, 1, 1, 'S'); } });   // водорості й перли на колонах
  anchorG(g, 8, yG + 18); lifeRingG(g, w - 14, yG + 22);
  sprG(g, door.x - 14, yG + 22, SPR_STARFISH); sprG(g, door.x + door.w + 7, yG + 14, SPR_STARFISH);
  wheelG(g, dc, yG + 7);                                                                                                                         // штурвал над дверима
  if (door.x + door.w + 30 < w - 44) { sprG(g, door.x + door.w + 22, yb - 7, SPR_CHEST); [[0, 'h'], [3, 'y'], [6, 'h'], [12, 'y']].forEach(([dx, c]) => R(g, door.x + door.w + 20 + dx, yb - 1, 2, 1, c)); }   // скриня зі скарбами
  [[10, 0], [door.x - 24, 1], [w - 34, 0], [door.x + door.w + 14, 1]].forEach(([sx, k], i) => { if (sx > 4 && sx + 7 < w) seaweedG(g, sx + 2, yb, 12 + (i % 3) * 4); });
  coralG(g, 20, yb, 'J', 'f', 12); coralG(g, door.x - 8, yb, 'o', 'y', 9); coralG(g, w - 22, yb, 'f', 'q', 11); coralG(g, door.x + door.w + 7, yb, 'J', 'q', 8);
  sprG(g, 30, yb - 4, SPR_SHELL); sprG(g, w - 40, yb - 4, SPR_SHELL);
  if (door.x - 34 > 34) sprG(g, door.x - 30, yb - 5, SPR_CRAB);
  [[w - 12, top + 52, 2], [10, top + 46, 2], [dc, yG + 4, 2]].forEach(([bx, by, br]) => bubbleG(g, bx, by, br));                                  // бульбашки на колонах (нижче вивіски)
};
// ---------------- Бруківки ----------------
STREET_EXTRA.candy = function (g, X0, Y0, W, H) {            // цукерна: пастельні плитки-цукерки з посипкою й мармеладками
  const RH = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  RH(X0, Y0, W, H, '#f4cfe0');
  const SETS = [['#ffb6d2', '#ffd9e8', '#e58bb0'], ['#bff0d8', '#e4fff1', '#8fcfb0'], ['#fff1a8', '#fffbd4', '#e3cc6a'], ['#cbbcff', '#e6deff', '#a090e0'], ['#ffd2a8', '#ffe8d0', '#e6a674']];
  for (let r = 0, y = Y0; y < Y0 + H; r++, y += 6) for (let x = Math.floor((X0 - 12) / 12) * 12 + (r % 2) * 6 - 12; x < X0 + W; x += 12) {
    const hs = hash2(x, r), P = SETS[hs % 5];
    RH(x + 1, y + 1, 11, 5, P[0]); RH(x + 1, y + 1, 11, 1, P[1]); RH(x + 1, y + 5, 11, 1, P[2]); RH(x + 11, y + 2, 1, 4, P[2]);
    if (hs % 4 === 0) { for (let i = 0; i < 5; i++) RH(x + 2 + i * 2, y + 2 + (i % 2), 1, 1, '#ffffff'); }               // білі смужки-глазур
    else if (hs % 4 === 1) { RH(x + 3, y + 3, 2, 1, '#ff6fa8'); RH(x + 7, y + 2, 2, 1, '#52c4ff'); RH(x + 5, y + 4, 2, 1, '#ffd23f'); RH(x + 9, y + 4, 1, 1, '#7ad66a'); }   // посипка
    else if (hs % 4 === 2 && hs % 7 < 3) { RH(x + 4, y + 2, 4, 3, '#ffffff'); RH(x + 5, y + 2, 2, 3, '#ff6fa8'); RH(x + 4, y + 3, 4, 1, '#ff6fa8'); }                          // льодяник-закрутка
  }
};
STREET_EXTRA.sand = function (g, X0, Y0, W, H) {              // піщана: пісок із хвилястими слідами, мушлями й морськими зірками
  const RH = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  RH(X0, Y0, W, H, '#ead4a0');
  for (let gy = Math.floor(Y0 / 5) * 5; gy < Y0 + H; gy += 5) for (let gx = Math.floor(X0 / 7) * 7; gx < X0 + W; gx += 7) {
    const hs = hash2(gx + 3, gy + 8);
    RH(gx + (hs % 5), gy + ((hs >>> 3) % 4), 1, 1, hs % 3 ? '#d6b878' : '#f8ecc4');
    if (hs % 6 === 0) { RH(gx, gy + 2, 5, 1, '#d9bc7c'); RH(gx + 1, gy + 3, 3, 1, '#f4e4b0'); }                                       // хвилька на піску
  }
  for (let gy = Math.floor(Y0 / 12) * 12; gy < Y0 + H; gy += 12) for (let gx = Math.floor(X0 / 20) * 20; gx < X0 + W; gx += 20) {
    const hs = hash2(gx * 5 + 1, gy * 3 + 2), x = gx + (hs % 14), y = gy + ((hs >>> 4) % 8), k = (hs >>> 8) % 6;
    if (k === 0) { RH(x, y, 6, 4, '#7a4f35'); RH(x + 1, y, 4, 3, '#ffc9d4'); RH(x + 2, y, 1, 3, '#ef8fa3'); RH(x + 4, y, 1, 3, '#ef8fa3'); RH(x + 1, y + 3, 4, 1, '#c98a9a'); }   // мушля-віяло
    else if (k === 1) { RH(x + 1, y, 1, 4, '#7a4f35'); RH(x, y + 1, 3, 1, '#7a4f35'); RH(x + 3, y + 1, 3, 1, '#7a4f35'); RH(x + 2, y, 3, 4, '#e8863c'); RH(x + 3, y + 1, 1, 1, '#ffe08a'); }   // морська зірка
    else if (k === 2) { RH(x, y, 4, 3, '#7a8aa0'); RH(x + 1, y, 3, 2, '#aab7cb'); RH(x + 1, y, 1, 1, '#f1f5fb'); }                    // камінець
    else if (k === 3) { RH(x, y + 1, 5, 1, '#fff4dc'); RH(x + 1, y, 3, 3, '#fff4dc'); RH(x + 2, y + 1, 1, 1, '#c9a678'); }             // ракушка-спіраль
  }
};
