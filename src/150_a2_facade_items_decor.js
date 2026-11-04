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
function tombstoneG(g, x, yb) { R(g, x - 4, yb - 10, 9, 10, 'd'); R(g, x - 3, yb - 9, 7, 9, 'e'); R(g, x - 2, yb - 11, 5, 1, 'd'); R(g, x - 2, yb - 10, 5, 1, 'E'); R(g, x - 3, yb - 9, 1, 8, 'E'); R(g, x - 1, yb - 7, 3, 1, 'd'); R(g, x, yb - 8, 1, 4, 'd'); R(g, x - 3, yb - 1, 7, 1, 'd'); }
function candleG(g, x, yb) { R(g, x - 1, yb - 6, 4, 6, 'd'); R(g, x, yb - 5, 2, 5, 'w'); R(g, x, yb - 8, 2, 2, 'y'); R(g, x, yb - 9, 1, 1, 'o'); R(g, x, yb - 7, 2, 1, 'd'); }
function spiderG(g, x, y, len) { for (let i = 0; i < len; i++) R(g, x, y + i, 1, 1, 'w'); R(g, x - 2, y + len, 5, 3, 'd'); R(g, x - 1, y + len, 3, 2, 'k'); R(g, x - 1, y + len, 1, 1, 'r'); R(g, x + 1, y + len, 1, 1, 'r'); [[-4, 0], [-4, 2], [4, 0], [4, 2]].forEach(([dx, dy]) => R(g, x + dx, y + len + dy, 2, 1, 'k')); }
function butterflyG(g, x, y, c1, c2) { R(g, x, y + 1, 1, 3, 'd'); R(g, x - 3, y, 3, 3, 'd'); R(g, x - 2, y + 1, 2, 1, c1); R(g, x - 2, y + 2, 1, 1, c2); R(g, x + 1, y, 3, 3, 'd'); R(g, x + 1, y + 1, 2, 1, c1); R(g, x + 2, y + 2, 1, 1, c2); R(g, x - 1, y - 1, 1, 1, 'd'); R(g, x + 1, y - 1, 1, 1, 'd'); }
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
function tulipG(g, x, yb, c) { R(g, x, yb - 4, 1, 4, 'G'); R(g, x - 1, yb - 7, 3, 3, 'd'); R(g, x, yb - 6, 1, 2, c); R(g, x - 1, yb - 6, 1, 1, c); R(g, x + 1, yb - 6, 1, 1, c); }
function arrowShine(g, x, y, big) { skinGlints.push([x, y, big ? 1 : 0]); }

