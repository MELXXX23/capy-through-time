//#part 150_a2_facade_items_decor.js
function leafPileG(g, x, yb) {                       // купа осіннього листя
  for (let i = 0; i < 40; i++) { const hh = (i * 37 + 11) % 100, dx = (hh % 15) - 7, dy = Math.floor(((i * 53) % 100) / 100 * Math.max(1, 6 - Math.abs(dx) * 0.7)); R(g, x + dx, yb - 1 - dy, 2, 1, ['o', 'r', 'h', 'y', 't'][i % 5]); }
}
let skinGlints = [];                                    // точки, де золотий скін блищить (мерехтіння малює drawShopShine)
function bigLollipopG(g, x, yb, cy, r) {                // один великий довгий лоліпоп: паличка з рожевими смужками й спіральний диск
  for (let y = cy; y < yb; y++) { R(g, x - 2, y, 1, 1, 'd'); R(g, x + 1, y, 1, 1, 'd'); R(g, x - 1, y, 2, 1, ((y >> 1) & 1) ? 'f' : 'w'); }
  R(g, x - 2, yb - 1, 4, 1, 'd');
  disc(g, x, cy, r + 1, 'd'); disc(g, x, cy, r, 'w');
  for (let arm = 0; arm < 2; arm++) for (let t = 0; t < 1; t += 0.008) { const an = t * Math.PI * 2 * 2.3 + arm * Math.PI, rad = t * (r - 0.4); R(g, Math.round(x + Math.cos(an) * rad), Math.round(cy + Math.sin(an) * rad), 1, 1, arm ? 'm' : 'f'); }
  R(g, x - r + 2, cy - r + 3, 2, 1, 'w'); R(g, x - r + 3, cy - r + 2, 1, 1, 'w');
  R(g, x - 5, cy + r + 1, 4, 3, 'd'); R(g, x - 4, cy + r + 1, 3, 2, 'y'); R(g, x + 2, cy + r + 1, 4, 3, 'd'); R(g, x + 2, cy + r + 1, 3, 2, 'y'); R(g, x - 1, cy + r + 1, 3, 3, 'd'); R(g, x, cy + r + 2, 1, 1, 'h');       // бантик
}
function gumdropG(g, x, yb, c) { for (let dy = 0; dy < 4; dy++) { const hw = [1, 2, 3, 3][dy]; R(g, x - hw, yb - 4 + dy, hw * 2 + 1, 1, dy === 3 ? 'd' : c); R(g, x - hw - 1, yb - 4 + dy, 1, 1, 'd'); R(g, x + hw + 1, yb - 4 + dy, 1, 1, 'd'); } R(g, x - 3, yb, 7, 1, 'd'); R(g, x - 1, yb - 3, 1, 1, 'w'); }
function coinStackG(g, x, yb, n) { for (let i = 0; i < n; i++) { const y = yb - 2 - i * 2; R(g, x - 4, y, 9, 3, 'd'); R(g, x - 3, y, 7, 2, i % 2 ? 'h' : 'y'); R(g, x - 3, y, 7, 1, 'y'); } R(g, x - 1, yb - n * 2, 3, 1, 'w'); }
function goldBarsG(g, x, yb) { const bar = (bx, by) => { R(g, bx - 1, by - 3, 11, 5, 'd'); R(g, bx, by - 2, 9, 3, 'h'); R(g, bx, by - 2, 9, 1, 'y'); R(g, bx + 1, by - 2, 2, 1, 'w'); }; bar(x, yb); bar(x + 10, yb); bar(x + 5, yb - 4); }
function gemG(g, x, y, c1, c2) { R(g, x + 1, y, 3, 1, 'd'); R(g, x, y + 1, 5, 1, 'd'); R(g, x + 1, y + 1, 3, 1, c2); R(g, x, y + 2, 5, 1, 'd'); R(g, x + 1, y + 2, 3, 1, c1); R(g, x + 1, y + 3, 3, 1, 'd'); R(g, x + 2, y + 3, 1, 1, c1); R(g, x + 1, y + 1, 1, 1, 'w'); }
function snowmanG(g, x, yb) { disc(g, x, yb - 4, 5, 'd'); disc(g, x, yb - 4, 4, 'w'); disc(g, x, yb - 11, 4, 'd'); disc(g, x, yb - 11, 3, 'w'); R(g, x - 2, yb - 12, 1, 1, 'd'); R(g, x + 1, yb - 12, 1, 1, 'd'); R(g, x, yb - 10, 3, 1, 'o'); R(g, x - 3, yb - 8, 7, 1, 'r'); R(g, x + 2, yb - 7, 2, 3, 'r'); R(g, x - 3, yb - 15, 7, 1, 'd'); R(g, x - 2, yb - 18, 5, 3, 'd'); R(g, x - 1, yb - 3, 1, 1, 'd'); R(g, x + 1, yb - 5, 1, 1, 'd'); }
function giftG(g, x, yb, w, h, c) { R(g, x, yb - h, w, h, 'd'); R(g, x + 1, yb - h + 1, w - 2, h - 2, c); R(g, x + (w >> 1), yb - h + 1, 1, h - 2, 'y'); R(g, x + 1, yb - (h >> 1) - 1, w - 2, 1, 'y'); R(g, x + (w >> 1) - 1, yb - h - 1, 3, 1, 'y'); }
function candyCaneG(g, x, yb, hh) { for (let y = 0; y < hh; y++) { R(g, x, yb - y, 3, 1, ((y >> 1) & 1) ? 'r' : 'w'); } R(g, x - 1, yb - hh, 1, 3, 'd'); R(g, x, yb - hh - 1, 4, 1, 'd'); for (let k = 0; k < 4; k++) R(g, x + k, yb - hh, 1, 1, k % 2 ? 'r' : 'w'); }
function wreathG(g, x, y, r, c1, c2) { disc(g, x, y, r, 'd'); disc(g, x, y, r - 1, c1); disc(g, x, y, r - 3, 'd'); for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; R(g, Math.round(x + Math.cos(an) * (r - 2)), Math.round(y + Math.sin(an) * (r - 2)), 1, 1, c2); } R(g, x - 2, y + r - 2, 5, 2, 'r'); R(g, x - 1, y + r - 3, 3, 1, 'r'); }
function tombstoneG(g, x, yb) { R(g, x - 4, yb - 10, 9, 10, 'd'); R(g, x - 3, yb - 9, 7, 9, 'e'); R(g, x - 2, yb - 11, 5, 1, 'd'); R(g, x - 2, yb - 10, 5, 1, 'E'); R(g, x - 3, yb - 9, 1, 8, 'E'); R(g, x - 1, yb - 7, 3, 1, 'd'); R(g, x, yb - 8, 1, 4, 'd'); R(g, x - 3, yb - 1, 7, 1, 'd'); }
function candleG(g, x, yb) { R(g, x - 1, yb - 6, 4, 6, 'd'); R(g, x, yb - 5, 2, 5, 'w'); R(g, x, yb - 8, 2, 2, 'y'); R(g, x, yb - 9, 1, 1, 'o'); R(g, x, yb - 7, 2, 1, 'd'); }
function spiderG(g, x, y, len) { for (let i = 0; i < len; i++) R(g, x, y + i, 1, 1, 'w'); R(g, x - 2, y + len, 5, 3, 'd'); R(g, x - 1, y + len, 3, 2, 'k'); R(g, x - 1, y + len, 1, 1, 'r'); R(g, x + 1, y + len, 1, 1, 'r'); [[-4, 0], [-4, 2], [4, 0], [4, 2]].forEach(([dx, dy]) => R(g, x + dx, y + len + dy, 2, 1, 'k')); }
function butterflyG(g, x, y, c1, c2) { R(g, x, y + 1, 1, 3, 'd'); R(g, x - 3, y, 3, 3, 'd'); R(g, x - 2, y + 1, 2, 1, c1); R(g, x - 2, y + 2, 1, 1, c2); R(g, x + 1, y, 3, 3, 'd'); R(g, x + 1, y + 1, 2, 1, c1); R(g, x + 2, y + 2, 1, 1, c2); R(g, x - 1, y - 1, 1, 1, 'd'); R(g, x + 1, y - 1, 1, 1, 'd'); }
function sunflowerG(g, x, yb) { R(g, x, yb - 14, 1, 14, 'G'); R(g, x + 1, yb - 7, 3, 1, 'g'); R(g, x - 3, yb - 10, 3, 1, 'g'); disc(g, x, yb - 17, 4, 'd'); disc(g, x, yb - 17, 3, 'h'); disc(g, x, yb - 17, 1, 'b'); R(g, x - 4, yb - 17, 1, 1, 'y'); R(g, x + 4, yb - 17, 1, 1, 'y'); R(g, x, yb - 21, 1, 1, 'y'); }
function hayBaleG(g, x, yb) { R(g, x, yb - 9, 14, 9, 'd'); R(g, x + 1, yb - 8, 12, 7, 'h'); R(g, x + 1, yb - 8, 12, 1, 'y'); for (let k = 3; k < 13; k += 4) R(g, x + k, yb - 8, 1, 7, 'o'); R(g, x + 1, yb - 4, 12, 1, 'c'); }
function cornG(g, x, yb) { R(g, x, yb - 14, 1, 14, 'G'); R(g, x + 1, yb - 9, 3, 1, 'g'); R(g, x - 3, yb - 11, 3, 1, 'g'); R(g, x - 1, yb - 9, 4, 6, 'd'); R(g, x, yb - 8, 2, 4, 'h'); R(g, x, yb - 8, 1, 4, 'y'); R(g, x - 1, yb - 3, 1, 1, 'g'); R(g, x + 1, yb - 14, 1, 1, 'y'); }
function ghostG(g, x, y) {                          // маленький привид: біле тіло, хвилястий низ, чорні очі
  R(g, x - 3, y, 7, 8, 'd'); R(g, x - 2, y - 1, 5, 1, 'd'); R(g, x - 2, y, 5, 8, 'w'); R(g, x - 3, y + 1, 7, 6, 'w'); R(g, x - 3, y + 1, 1, 5, 'S');
  R(g, x - 2, y + 8, 1, 1, 'd'); R(g, x, y + 8, 1, 1, 'd'); R(g, x + 2, y + 8, 1, 1, 'd'); R(g, x - 1, y + 7, 1, 1, 'w'); R(g, x + 1, y + 7, 1, 1, 'w');
  R(g, x - 2, y + 2, 1, 2, 'k'); R(g, x + 1, y + 2, 1, 2, 'k'); R(g, x - 1, y + 5, 2, 1, 'k');
}
function cauldronG(g, x, yb) {                       // казанок із зеленим варивом і пухирцями
  R(g, x - 6, yb - 8, 13, 6, 'd'); R(g, x - 5, yb - 7, 11, 5, 'k'); R(g, x - 5, yb - 8, 11, 2, 'm'); R(g, x - 4, yb - 8, 3, 1, 'y');
  R(g, x - 5, yb - 2, 2, 2, 'd'); R(g, x + 4, yb - 2, 2, 2, 'd'); R(g, x - 7, yb - 7, 1, 2, 'd'); R(g, x + 7, yb - 7, 1, 2, 'd');
  R(g, x - 2, yb - 11, 2, 2, 'm'); R(g, x + 2, yb - 13, 1, 1, 'm'); R(g, x + 1, yb - 10, 1, 1, 'y');
}
function batG(g, x, y) { R(g, x - 3, y, 2, 1, 'k'); R(g, x + 2, y, 2, 1, 'k'); R(g, x - 4, y + 1, 3, 1, 'k'); R(g, x + 2, y + 1, 3, 1, 'k'); R(g, x - 1, y, 3, 2, 'k'); R(g, x - 1, y - 1, 1, 1, 'k'); R(g, x + 1, y - 1, 1, 1, 'k'); R(g, x - 3, y + 2, 1, 1, 'k'); R(g, x + 3, y + 2, 1, 1, 'k'); R(g, x, y, 1, 1, 'r'); }
function bunnyG(g, x, yb) {                          // кролик-статуетка: вуха, мордочка, хвостик
  R(g, x - 3, yb - 14, 2, 6, 'd'); R(g, x + 1, yb - 14, 2, 6, 'd'); R(g, x - 2, yb - 13, 1, 5, 'q'); R(g, x + 1, yb - 13, 1, 5, 'q');
  R(g, x - 4, yb - 9, 9, 7, 'd'); R(g, x - 3, yb - 8, 7, 5, 'w'); R(g, x - 2, yb - 7, 1, 1, 'k'); R(g, x + 1, yb - 7, 1, 1, 'k'); R(g, x - 1, yb - 5, 2, 1, 'p');
  R(g, x - 5, yb - 4, 11, 4, 'd'); R(g, x - 4, yb - 3, 9, 3, 'w'); R(g, x + 5, yb - 3, 2, 2, 'w');
}
function scarecrowG(g, x, yb) {                      // опудало: стовп, соломяні руки, сорочка в латках, гарбузова голова й капелюх
  R(g, x, yb - 22, 1, 22, 'd'); R(g, x - 7, yb - 15, 15, 2, 'd'); R(g, x - 6, yb - 15, 13, 1, 'b');
  R(g, x - 3, yb - 16, 7, 7, 'd'); R(g, x - 2, yb - 15, 5, 5, 'r'); R(g, x - 1, yb - 13, 2, 2, 'h'); R(g, x - 2, yb - 11, 5, 1, 'b');
  R(g, x - 9, yb - 15, 2, 4, 'y'); R(g, x + 8, yb - 15, 2, 4, 'y'); R(g, x - 3, yb - 9, 2, 3, 'y'); R(g, x + 2, yb - 9, 2, 3, 'y');
  disc(g, x, yb - 21, 4, 'd'); disc(g, x, yb - 21, 3, 'o'); R(g, x - 2, yb - 22, 1, 1, 'k'); R(g, x + 1, yb - 22, 1, 1, 'k'); R(g, x - 1, yb - 19, 3, 1, 'k');
  R(g, x - 5, yb - 25, 11, 1, 'd'); R(g, x - 3, yb - 29, 7, 4, 'd'); R(g, x - 3, yb - 26, 7, 1, 'h');
}
function mushroomG(g, x, yb) { R(g, x - 1, yb - 3, 3, 3, 'd'); R(g, x, yb - 3, 1, 3, 'w'); R(g, x - 3, yb - 6, 7, 3, 'd'); R(g, x - 2, yb - 5, 5, 2, 'r'); R(g, x - 1, yb - 5, 1, 1, 'w'); R(g, x + 1, yb - 4, 1, 1, 'w'); }
function tulipG(g, x, yb, c) { R(g, x, yb - 4, 1, 4, 'G'); R(g, x - 1, yb - 7, 3, 3, 'd'); R(g, x, yb - 6, 1, 2, c); R(g, x - 1, yb - 6, 1, 1, c); R(g, x + 1, yb - 6, 1, 1, c); }
function arrowShine(g, x, y, big) { skinGlints.push([x, y, big ? 1 : 0]); }
function crystalG(g, x, yb, hh) {                  // кристал-стовпчик з гострою верхівкою: світла ліва грань, темна права
  R(g, x, yb - hh, 1, 1, 'n');
  R(g, x - 1, yb - hh + 1, 3, 1, 'n'); R(g, x, yb - hh + 1, 1, 1, 'w');
  for (let y = yb - hh + 2; y < yb; y++) { R(g, x - 2, y, 5, 1, 'n'); R(g, x - 1, y, 1, 1, 'w'); R(g, x, y, 1, 1, 'S'); R(g, x + 1, y, 1, 1, 's'); }
  R(g, x - 1, yb, 3, 1, 'n');
}

function skinShopDeco(g, skin, w, h, look, yG, door) {
  const top = look.top, rb = top + 3;
  if (SHOP_DECO_EXTRA[skin]) { SHOP_DECO_EXTRA[skin](g, w, h, look, yG, door, top); return; }       // нові скіни: 150_a3_skins_new_decor.js
  if (skin === 'xmas') {
    for (let x = 4; x < w - 4; x += 4) { const c = ['r', 'y', 'g', 'n'][(x >> 2) % 4], wy = yG + 11 + ((x >> 2) % 2); R(g, x, wy, 2, 2, c); R(g, x, wy - 1, 1, 1, 'd'); }
    treeXmasG(g, door.x + door.w + 14, h - 7);
    R(g, door.x - 4, yG + 10, door.w + 8, 2, 'r'); R(g, door.x - 2, yG + 12, 2, 2, 'y');
    wreathG(g, door.x + (door.w >> 1), yG + 4, 6, 'g', 'G'); R(g, door.x + (door.w >> 1) - 2, yG + 9, 5, 1, 'd');
    giftG(g, 11, h - 7, 9, 7, 'r'); giftG(g, 21, h - 7, 8, 5, 'n'); giftG(g, 14, h - 14, 7, 5, 'g');
    candyCaneG(g, door.x - 8, h - 7, 10); candyCaneG(g, door.x + door.w + 6, h - 7, 8);
    R(g, 4, top + 14, 1, 14, 'd'); R(g, 5, top + 24, 7, 8, 'd'); R(g, 6, top + 25, 5, 6, 'r'); R(g, 6, top + 25, 5, 1, 'w');             // шкарпетка біля краю
    snowCap(g.canvas, top + 4);
    for (let x = 6; x < w - 6; x += 5) { if (x > door.x - 8 && x < door.x + door.w + 8) continue; const c = ['r', 'y', 'g', 'n'][(x / 5 | 0) % 4]; R(g, x, top + 6, 2, 2, c); R(g, x, top + 6, 1, 1, 'w'); R(g, x, top + 5, 1, 1, 'd'); }           // вогники по краю даху
    [3, w - 8].forEach(cx => { for (let y = top + 12; y < h - 12; y += 6) R(g, cx + 1, y, 1, 1, 'y'); });                                            // золоті вогники на колонах
    for (let x = 4; x < w - 4; x += 9) { if (x > door.x - 6 && x < door.x + door.w + 6) continue; R(g, x, h - 9, 5, 2, 'w'); R(g, x + 1, h - 10, 3, 1, 'w'); }   // замети під вітриною
    if (w - 14 > door.x + door.w + 28) snowmanG(g, w - 14, h - 7);
  } else if (skin === 'halloween') {
    pumpkinG(g, door.x - 12, h - 7, 5); pumpkinG(g, door.x + door.w + 11, h - 7, 4);
    tombstoneG(g, 14, h - 7); tombstoneG(g, w - 12, h - 7); candleG(g, 24, h - 7); candleG(g, w - 22, h - 7);
    spiderG(g, door.x + door.w - 4, yG + 10, 8); spiderG(g, 30, yG + 12, 5);
    for (let x = 6; x < w - 6; x += 9) { R(g, x, yG + 10, 2, 2 + ((x * 3) % 4), 'm'); }                                               // слиз із навісу
    g.globalAlpha = 0.85; lineG(g, 3, top + 6, 17, top + 6, 'w'); lineG(g, 3, top + 6, 3, top + 20, 'w'); lineG(g, 3, top + 6, 14, top + 17, 'w'); lineG(g, 3, top + 10, 10, top + 10, 'w'); lineG(g, 3, top + 14, 7, top + 14, 'w'); g.globalAlpha = 1;
    [[w - 20, top + 3], [w - 12, top + 7]].forEach(([bx, by]) => { R(g, bx, by, 5, 1, 'k'); R(g, bx - 1, by - 1, 2, 2, 'k'); R(g, bx + 4, by - 1, 2, 2, 'k'); R(g, bx + 2, by + 1, 1, 1, 'k'); });
    ghostG(g, w - 22, top + 18); ghostG(g, 26, yG + 6);
    if (door.x - 20 > 10) cauldronG(g, door.x - 18, h - 7);
    batG(g, Math.round(w * 0.3), top + 14); batG(g, Math.round(w * 0.7), top + 10); batG(g, door.x + door.w + 20, yG + 8);
    for (let x = 8; x < w - 8; x += 6) R(g, x, top + 6, 2, 1, x % 12 ? 'o' : 'P');                                                              // оранжево-фіолетовий ряд по даху
  } else if (skin === 'spring') {
    lineG(g, 2, top + 5, 26, top + 12, 'b'); lineG(g, 2, top + 6, 26, top + 13, 'd');
    for (let i = 0; i < 16; i++) { const px = 4 + ((i * 7) % 24), py = top + 6 + Math.round(px * 0.28) + ((i * 5) % 7) - 3; R(g, px, py, 2, 2, i % 3 ? 'p' : 'q'); R(g, px, py, 1, 1, 'w'); }
    potG(g, door.x - 18, yG + 24, 'f'); potG(g, door.x + door.w + 13, yG + 24, 'y');
    for (let x = 6; x < w - 6; x += 11) R(g, x, yG + 12, 2, 2, 'q');
    for (let a = 0; a < 15; a++) { const t = a / 14, ax = door.x - 4 + t * (door.w + 8), ay = yG + 9 - Math.sin(t * Math.PI) * 6; if (a % 2) { R(g, Math.round(ax) - 1, Math.round(ay) - 1, 3, 3, 'd'); R(g, Math.round(ax) - 1, Math.round(ay) - 1, 2, 2, a % 4 === 1 ? 'p' : 'w'); } else R(g, Math.round(ax), Math.round(ay), 1, 2, 'g'); }       // арка з квітів над дверима
    butterflyG(g, 24, top + 22, 'p', 'w'); butterflyG(g, w - 24, top + 18, 'y', 'o');
    R(g, 8, h - 13, 12, 6, 'd'); R(g, 9, h - 12, 10, 4, 'b'); for (let i = 0; i < 4; i++) { R(g, 10 + i * 2, h - 15, 2, 3, i % 2 ? 'f' : 'p'); R(g, 10 + i * 2, h - 13, 1, 1, 'g'); }       // ящик із тюльпанами
    R(g, w - 20, h - 12, 10, 5, 'd'); R(g, w - 19, h - 11, 8, 3, 'w'); R(g, w - 16, h - 14, 4, 3, 'w'); R(g, w - 15, h - 15, 2, 1, 'd'); R(g, w - 14, h - 13, 1, 1, 'f');                   // великодній кошик
    lineG(g, w - 3, top + 5, w - 27, top + 12, 'b'); lineG(g, w - 3, top + 6, w - 27, top + 13, 'd');                                      // друга гілка з цвітом справа
    for (let i = 0; i < 14; i++) { const px = w - 5 - ((i * 7) % 24), py = top + 6 + Math.round((w - px) * 0.28) + ((i * 5) % 7) - 3; R(g, px, py, 2, 2, i % 3 ? 'q' : 'w'); R(g, px, py, 1, 1, 'p'); }
    for (let x = 5; x < w - 5; x += 7) { if (x > door.x - 4 && x < door.x + door.w + 4) continue; tulipG(g, x, h - 7, ['f', 'p', 'y', 'q', 'o'][(x / 7 | 0) % 5]); }   // клумба з тюльпанами
    if (w - 18 > door.x + door.w + 26) bunnyG(g, w - 18, h - 7);
    butterflyG(g, Math.round(w * 0.5), top + 14, 'q', 'f');
  } else if (skin === 'autumn') {
    for (let x = 5; x < w - 8; x += 8) { const c = ['o', 'r', 'h'][(x >> 3) % 3]; R(g, x, top + 8, 3, 2, c); R(g, x + 1, top + 10, 1, 1, 'b'); }
    pumpkinG(g, door.x + door.w + 12, h - 7, 4); leafPileG(g, door.x - 14, h - 7); leafPileG(g, w - 12, h - 7);
    hayBaleG(g, 8, h - 7); hayBaleG(g, 12, h - 16); cornG(g, 26, h - 7); cornG(g, 31, h - 7);
    wreathG(g, door.x + (door.w >> 1), yG + 4, 6, 'o', 'r'); R(g, door.x + (door.w >> 1) - 2, yG + 9, 5, 1, 'd');
    R(g, w - 30, h - 12, 12, 6, 'd'); R(g, w - 29, h - 11, 10, 4, 'b'); for (let i = 0; i < 4; i++) { disc(g, w - 27 + i * 3, h - 13, 2, 'd'); disc(g, w - 27 + i * 3, h - 13, 1, i % 2 ? 'r' : 'J'); }     // ящик яблук
    for (let x = 6; x < w - 6; x += 4) R(g, x, yG + 12 + ((x >> 2) & 1), 2, 2, ['o', 'r', 'h'][(x >> 2) % 3]);                          // гірлянда з листя
    R(g, door.x + 1, yG + 11, door.w - 2, 1, 'r'); R(g, door.x + 2, yG + 12, door.w - 4, 1, 'o');
    if (w - 14 > door.x + door.w + 30) scarecrowG(g, w - 14, h - 7);
    mushroomG(g, 40, h - 7); mushroomG(g, 46, h - 7); if (door.x + door.w + 12 < w - 40) mushroomG(g, door.x + door.w + 10, h - 7);
    [3, w - 8].forEach((cx, i) => { for (let y = top + 10; y < h - 12; y += 5) R(g, cx + (y % 2), y, 2, 1, ['o', 'r', 'h'][((y / 5 | 0) + i) % 3]); });         // листя на колонах
    for (let x = 7; x < w - 7; x += 11) R(g, x, top + 6, 3, 1, ['o', 'r', 'h'][(x / 11 | 0) % 3]);
  }
  else if (skin === 'candy') {
    const colTop = top + 8;
    [3, w - 8].forEach(cx => { for (let yy = colTop; yy < h - 8; yy++) for (let dx = 0; dx < 3; dx++) R(g, cx + dx, yy, 1, 1, ((yy + dx * 2) % 8 < 4) ? 'r' : 'w'); R(g, cx - 1, colTop, 1, h - 8 - colTop, 'd'); R(g, cx + 3, colTop, 1, h - 8 - colTop, 'd'); });      // колони — цукерові тростини в червоно-білу смужку
    for (let x = 6; x < w - 16; x += 6) { const dh = 2 + ((x * 7) % 4); R(g, x, top + 8, 4, 1, 'w'); R(g, x, top + 9, 4, dh, 'w'); R(g, x + 1, top + 9 + dh, 2, 1, 'w'); R(g, x + 1, top + 9, 1, dh, 'q'); }        // глазур стікає з верху вивіски
    for (let i = 0; i < 26; i++) { const sx = 8 + ((i * 53) % (w - 30)), sy = top + 8 + ((i * 29) % 3); R(g, sx, sy, 2, 1, ['y', 'm', 's', 'o', 'u', 'f'][i % 6]); }      // посипка
    R(g, door.x - 3, yG + 10, door.w + 6, 4, 'd'); R(g, door.x - 2, yG + 10, door.w + 4, 3, 'h'); for (let x = door.x - 2; x < door.x + door.w + 2; x += 3) { R(g, x, yG + 10, 1, 3, 'c'); } R(g, door.x - 2, yG + 11, door.w + 4, 1, 'c');         // вафельний наличник над дверима
    [['f'], ['m'], ['y'], ['u'], ['o']].forEach((c, i) => { const gx = 12 + i * 8; if (gx < door.x - 6) gumdropG(g, gx, h - 7, c[0]); });         // мармеладки під вітриною ліворуч
    [['y'], ['f'], ['m'], ['u']].forEach((c, i) => { const gx = door.x + door.w + 10 + i * 8; if (gx < w - 24) gumdropG(g, gx, h - 7, c[0]); });
    bigLollipopG(g, w - 15, h - 7, top + 6, 7);                // єдиний великий довгий лоліпоп попереду
  } else if (skin === 'ice') {                                   // бурульки під навісом, сніг на даху, сніговик і крижані блоки
    for (let x = 3; x < w - 3; x += 6) { const L = 3 + ((x * 5) % 4); R(g, x, yG + 11, 2, L, 'a'); R(g, x, yG + 11 + L, 1, 2, 'w'); R(g, x + 3, yG + 11, 1, 2, 'S'); R(g, x, yG + 11, 1, L, 'w'); }
    snowCap(g.canvas, top + 4);
    snowmanG(g, w - 14, h - 7);
    [[10, 0], [20, 1], [15, -7]].forEach(([bx, k]) => { const by = h - 7 + (k < 0 ? -9 + 7 : 0); R(g, bx - 4, by - 8 + (k < 0 ? 2 : 0), 9, 8, 'd'); R(g, bx - 3, by - 7 + (k < 0 ? 2 : 0), 7, 6, k < 0 ? 'S' : 'a'); R(g, bx - 3, by - 7 + (k < 0 ? 2 : 0), 7, 1, 'w'); R(g, bx - 2, by - 6 + (k < 0 ? 2 : 0), 1, 3, 'w'); });
    for (let x = 6; x < w - 6; x += 4) if ((x * 7) % 5 < 2) R(g, x, h - 8 + ((x >> 2) & 1), 4, 2, 'w');                  // замети
    [[w - 6, top + 14], [8, top + 14]].forEach(([sx, sy]) => { R(g, sx, sy - 2, 1, 5, 'w'); R(g, sx - 2, sy, 5, 1, 'w'); R(g, sx - 1, sy - 1, 3, 3, 'S'); });                // сніжинки
  } else if (skin === 'wood') {                                  // колоди біля дверей і діжка
    for (let i = 0; i < 3; i++) { R(g, 11, h - 14 + i * 4, 12, 4, 'd'); R(g, 12, h - 13 + i * 4, 10, 2, 'l'); R(g, 12, h - 13 + i * 4, 3, 2, 'c'); R(g, 21, h - 13 + i * 4, 1, 2, 'b'); }
    barrelG(g, w - 24, h - 7);
    R(g, 26, h - 12, 8, 5, 'd'); R(g, 27, h - 11, 6, 3, 'l'); R(g, 28, h - 11, 2, 3, 'c'); R(g, 31, h - 17, 1, 6, 'b'); R(g, 29, h - 18, 5, 3, 'd'); R(g, 30, h - 17, 3, 1, 'Y'); R(g, 33, h - 18, 1, 2, 'Y');     // пеньок із сокирою
    R(g, door.x - 2, yG + 9, door.w + 4, 1, 'd'); [[-2, -1], [door.w + 1, 1]].forEach(([dx, s]) => { R(g, door.x + dx, yG + 5, 1, 4, 'c'); R(g, door.x + dx + s, yG + 4, 1, 3, 'c'); R(g, door.x + dx - s, yG + 6, 1, 2, 'c'); });     // роги над дверима
    for (let y = yG + 14; y < h - 8; y += 4) { R(g, 2, y, 2, 1, 'd'); R(g, w - 4, y, 2, 1, 'd'); }          // стики колод по краях
    R(g, door.x + door.w + 9, yG + 5, 1, 6, 'd'); R(g, door.x + door.w + 6, yG + 11, 7, 5, 'd'); R(g, door.x + door.w + 7, yG + 12, 5, 3, 'y'); R(g, door.x + door.w + 9, yG + 12, 1, 3, 'h');           // підвісний ліхтар
  } else if (skin === 'garden') {                                // ліани з даху, квіткові горщики, шпалера з трояндами, лійка, соняшники й метелики
    [8, w - 10, Math.round(w * 0.5)].forEach((x, i) => vinesG(g, x, top + 8, 6 + i * 2));
    potG(g, door.x - 18, yG + 24, 'f'); potG(g, door.x + door.w + 13, yG + 24, 'y');
    sunflowerG(g, 12, h - 7); sunflowerG(g, 21, h - 7); sunflowerG(g, w - 12, h - 7);
    for (let y = yG + 12; y < h - 9; y += 3) { R(g, w - 30, y, 14, 1, 'b'); } for (let x = w - 30; x < w - 16; x += 4) R(g, x, yG + 12, 1, h - 9 - yG - 12, 'b');
    for (let i = 0; i < 10; i++) { const rx = w - 29 + ((i * 5) % 13), ry = yG + 13 + ((i * 7) % 18); R(g, rx, ry, 3, 3, 'd'); R(g, rx, ry, 2, 2, i % 2 ? 'r' : 'f'); R(g, rx, ry, 1, 1, 'q'); R(g, rx + 3, ry + 2, 2, 1, 'g'); }
    R(g, door.x - 14, h - 11, 8, 5, 'd'); R(g, door.x - 13, h - 10, 6, 3, 'Y'); R(g, door.x - 7, h - 13, 4, 1, 'd'); R(g, door.x - 5, h - 12, 1, 2, 'd'); R(g, door.x - 17, h - 12, 3, 1, 'd');       // лійка
    butterflyG(g, 30, top + 22, 'o', 'y'); butterflyG(g, w - 38, top + 16, 'v', 'a'); butterflyG(g, 44, h - 24, 'p', 'q');
  } else if (skin === 'diamond') {
    R(g, door.x - 3, yG + 10, door.w + 6, 1, 'w'); R(g, door.x - 2, yG + 11, 1, 22, 'a'); R(g, door.x + door.w + 1, yG + 11, 1, 22, 'a');      // кришталева рамка дверей
    gemG(g, door.x + (door.w >> 1) - 2, yG + 5, 'N', 'a');                                                                                // діамант над дверима
    for (let x = 6; x < w - 6; x += 6) { R(g, x, yG + 11, 1, 3, 'S'); R(g, x, yG + 14, 1, 1, 'w'); R(g, x + 3, yG + 11, 1, 2, 'a'); }       // кришталеві підвіски під навісом
    [3, w - 8].forEach(cx => { R(g, cx + 1, top + 8, 1, h - 16 - top, 'w'); R(g, cx + 2, top + 8, 1, h - 16 - top, 'S'); });                 // блиск на колонах
    for (let x = 4; x < w - 4; x += 7) { R(g, x, h - 6, 1, 3, 'S'); R(g, x + 1, h - 6, 1, 1, 'w'); }                                       // кришталевий цоколь
    crystalG(g, 12, h - 7, 9); crystalG(g, 18, h - 7, 6); crystalG(g, door.x - 8, h - 7, 7);
    crystalG(g, w - 24, h - 7, 6); crystalG(g, w - 17, h - 7, 11); crystalG(g, w - 10, h - 7, 7);
    gemG(g, 6, yG + 18, 'N', 'a'); gemG(g, w - 11, yG + 18, 'S', 'w'); gemG(g, 6, yG + 30, 'a', 'w'); gemG(g, w - 11, yG + 30, 'N', 'a');         // самоцвіти на колонах
    [[8, top + 9, 1], [w - 9, top + 9, 1], [8, yG + 20, 0], [w - 9, yG + 20, 0], [8, yG + 32, 1], [w - 9, yG + 32, 0], [door.x + (door.w >> 1), yG + 6, 1], [12, h - 17, 0], [w - 17, h - 19, 1], [door.x - 8, h - 15, 0], [4, h - 20, 0], [w - 6, h - 26, 0]].forEach(([x, y, b]) => arrowShine(g, x, y, b));
  } else if (skin === 'gold') {
    R(g, door.x - 3, yG + 10, door.w + 6, 1, 'y'); R(g, door.x - 2, yG + 11, 1, 22, 'h'); R(g, door.x + door.w + 1, yG + 11, 1, 22, 'h');   // позолочена рамка дверей
    R(g, door.x - 3, yG + 10, door.w + 6, 1, 'w'); gemG(g, door.x + (door.w >> 1) - 2, yG + 5, 'N', 'a');                                       // діамант над дверима
    for (let x = 6; x < w - 6; x += 5) { R(g, x, yG + 11, 3, 3, 'd'); R(g, x, yG + 11, 2, 2, 'w'); R(g, x, yG + 11, 1, 1, 'S'); }               // нитки перлів під навісом
    [3, w - 8].forEach(cx => { R(g, cx + 1, top + 8, 1, h - 16 - top, 'w'); R(g, cx + 2, top + 8, 1, h - 16 - top, 'y'); });                  // блиск на колонах
    for (let x = 4; x < w - 4; x += 7) { R(g, x, h - 6, 1, 3, 'y'); R(g, x + 1, h - 6, 1, 1, 'w'); }                                              // позолочений цоколь
    coinStackG(g, 12, h - 7, 4); coinStackG(g, 24, h - 7, 2); coinStackG(g, door.x - 8, h - 7, 3);
    goldBarsG(g, w - 30, h - 7); coinStackG(g, w - 12, h - 7, 5);
    gemG(g, 6, yG + 18, 'f', 'q'); gemG(g, w - 11, yG + 18, 'N', 'a'); gemG(g, 6, yG + 30, 'r', 'J'); gemG(g, w - 11, yG + 30, 'f', 'q');         // самоцвіти на колонах
    [[8, top + 9, 1], [w - 9, top + 9, 1], [8, yG + 20, 0], [w - 9, yG + 20, 0], [8, yG + 32, 1], [w - 9, yG + 32, 0], [door.x + (door.w >> 1), yG + 6, 1], [12, h - 14, 0], [w - 30, h - 15, 0], [w - 12, h - 18, 1], [door.x - 8, h - 12, 0], [4, h - 20, 0], [w - 6, h - 26, 0]].forEach(([x, y, b]) => arrowShine(g, x, y, b));
  }
}
