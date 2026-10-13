//#part 100_d_capy_coins_epoch_state.js
SPRITES.capy_pirate = { rows: makeCapySkinRows('pirate') };
SPRITES.capy_astro = { rows: makeCapySkinRows('astro'), variants: { blink: { K: PALETTE.B } } };
['wizard', 'chef', 'explorer', 'detective', 'sailor', 'santa', 'witch', 'flower', 'beach', 'autumn'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapySkinRows(k), variants: { blink: { K: PALETTE.B } } }; });   // незалежні від епохи скіни Капі
// Нові скіни Капі (затінені еліпсами, плащі й шарфи вигнуті): лицар, супергерой, ковбой, фея, вікінг, пілот
Object.assign(PALETTE, { '1': '#f1f5fb', '2': '#aab7cb', '3': '#6f7f9a', '4': '#454f69', '5': '#9a3326', '6': '#ec8a6e', '7': '#e3b04b', '8': '#b57a1f', '9': '#7a5a3a', '@': '#5a3d28', '#': '#c9a678', '%': '#e8d3a0', '&': '#3a6fb0', '*': '#8fc1f0' });
function makeCapyNewRows(kind) {
  const W = 38, H = 24;
  const grid = Array.from({ length: H }, (_, y) => (y < 3 || y > 23) ? Array(W).fill('.') : (CAPY_BASE[y - 3] + '.'.repeat(W - 27)).split(''));
  const at = (x, y) => (grid[y] ? grid[y][x] : undefined);
  const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (y >= 0 && y < H && x >= 0 && x < W) grid[y][x] = c; };
  const isFur = (x, y) => at(x, y) === 'B' || at(x, y) === 'L';
  const dye = (x0, x1, y0, y1, fn) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (isFur(x, y)) put(x, y, typeof fn === 'string' ? fn : fn(x, y)); };
  const rect = (x0, x1, y0, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  const art = (x0, y0, rows) => rows.forEach((r, j) => r.split('').forEach((c, i) => { if (c !== '.') put(x0 + i, y0 + j, c); }));
  // еліпс із освітленням зверху-ліворуч: tones = [світлий, середній, темний]; over — чи малювати поверх будь-чого
  const ell = (cx, cy, rx, ry, tones, over, y0, y1) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { if (y0 !== undefined && (y < y0 || y > y1)) continue; const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy; if (d > 1) continue; if (!over && at(x, y) !== '.') continue; const l = -dx * 0.6 - dy * 0.8; put(x, y, l > 0.55 ? tones[0] : l > -0.25 ? tones[1] : tones[2]); } };
  const outlineAll = (chars, col) => { const todo = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (chars.includes(at(x, y))) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (at(x + dx, y + dy) === '.') todo.push([x + dx, y + dy]); }); todo.forEach(([x, y]) => put(x, y, col || 'O')); };
  const stream = (x0, y0, x1, amp, th0, th1, wav, cols) => { for (let x = x0; x <= x1; x++) { const t = (x - x0) / (x1 - x0), cy = y0 + t * amp + Math.sin(t * wav) * 1.6, th = th0 + (th1 - th0) * t; for (let k = 0; k < th; k++) { const y = cy + k - th / 2; put(x, y, cols(x, k, th, t)); } } };
  if (kind === 'knight') {
    dye(12, 25, 9, 17, (x, y) => y === 9 ? '1' : y <= 11 ? '2' : y <= 14 ? '2' : y <= 16 ? '3' : '4');
    for (let y = 10; y <= 17; y++) if (isFur(12, y)) put(12, y, '1');
    for (let x = 16; x <= 25; x += 4) for (let y = 10; y <= 16; y++) if (at(x, y) === '2' || at(x, y) === '3') put(x, y, y > 13 ? '4' : '3');
    rect(14, 21, 11, 17, 'r'); rect(14, 21, 11, 12, '6'); rect(14, 14, 11, 17, '6'); rect(21, 21, 12, 17, '5'); rect(14, 21, 17, 17, '5');
    art(16, 12, ['.7.', '777', '.7.', '.7.', '.8.']);
    for (let x = 14; x <= 21; x += 2) put(x, 18, x % 4 ? '5' : 'r');
    ell(12.5, 10.5, 3.2, 2.6, ['1', '2', '3'], true);                               // наплічник
    ell(11, 10.5, 2.5, 3, ['2', '3', '3'], true, 9, 12);                            // горжет на шиї
    ell(8.2, 5.8, 7, 3.9, ['1', '2', '3'], true, 2, 7);                               // шолом
    rect(2, 14, 7, 7, '3'); rect(2, 14, 6, 6, '2'); put(3, 6, '1'); put(4, 6, '1');
    rect(8, 9, 7, 7, '4');
    art(7, 0, ['.66r.', '6rrr5', 'rrr55']); art(12, 2, ['5', '5']);

    outlineAll('123456rR');
  } else if (kind === 'hero') {
    stream(14, 8, 36, 5, 2, 5, 4.2, (x, k, th, t) => (k < 1 ? '6' : k > th - 2 ? '5' : 'r'));
    for (let x = 14; x < 27; x++) { put(x, 8, 'r'); put(x, 7, '5'); }
    rect(13, 14, 8, 10, 'r'); put(13, 9, '7'); put(14, 9, '7');
    dye(12, 25, 9, 17, (x, y) => y === 9 ? '*' : y <= 12 ? '&' : y <= 15 ? 'n' : 'z');
    for (let y = 10; y <= 16; y++) if (isFur(12, y)) put(12, y, '*');
    art(16, 11, ['..y..', '.y7y.', 'y777y', '.y7y.', '..y..']);
    rect(12, 25, 16, 16, '7'); put(18, 16, '8'); put(19, 16, 'y');
    for (let y = 21; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 21 ? 'r' : '5');
    for (let y = 7; y <= 10; y++) for (let x = 4; x <= 12; x++) if (isFur(x, y) || at(x, y) === 'K') put(x, y, 'z');
    put(7, 8, 'w'); put(8, 8, 'w'); put(7, 9, 'K'); put(8, 9, 'K'); put(4, 8, '4');
    put(13, 9, 'z'); put(14, 8, 'z'); put(15, 8, '4');
    outlineAll('rR56z&n*7');
  } else if (kind === 'cowboy') {
    dye(12, 25, 9, 17, (x, y) => y === 9 ? '#' : y >= 16 ? '@' : (x % 6 === 0 ? '@' : y <= 12 ? '9' : 'b'));
    for (let y = 10; y <= 16; y++) if (isFur(12, y)) put(12, y, '@');
    for (let x = 12; x <= 25; x++) { put(x, 17, x % 2 ? 'd' : 'b'); if (at(x, 18) === 'B') put(x, 18, x % 2 ? 'b' : '@'); }
    art(17, 11, ['..y..', 'yyyyy', '.yyy.', 'y.y.y']);
    art(5, 13, ['rrrrr', 'rwrwr', '.rrr.', '..r..']); put(4, 13, 'r'); put(10, 13, 'r');
    ell(8.3, 4.2, 4.6, 3.6, ['%', '#', '9'], true, 0, 5);                              // тулія
    rect(4, 12, 4, 4, '@'); put(8, 4, '7'); put(9, 4, '7');                            // стрічка з пряжкою
    for (let x = -1; x <= 17; x++) { const t = (x - 8) / 9, y = 5 + t * t * -2.2 + 2.2; put(x, y, x < 8 ? '#' : '9'); put(x, y + 1, '@'); }
    put(-1, 4, '9'); put(17, 4, '9');
    outlineAll('%#9@bd');
  } else if (kind === 'gold' || kind === 'diamond') {
    const fur0 = grid.map(r => r.map(c => c === 'B' || c === 'L')), spot0 = grid.map(r => r.map(c => c === 'L'));
    const fm = (x, y) => !!(fur0[y] && fur0[y][x]), sp = (x, y) => !!(spot0[y] && spot0[y][x]);
    if (kind === 'gold') {
      dye(0, 26, 0, 23, (x, y) => sp(x, y) ? '8' : (!fm(x, y - 1) || !fm(x - 1, y)) ? 'y' : (!fm(x, y + 1) || !fm(x + 1, y)) ? '8' : (x * 2 + y * 3) % 17 === 0 ? 'w' : ((x * 3 + y * 5) % 11 === 0 ? '7' : 'h'));
      art(5, 0, ['y..y..y.', 'yyyyyyyy', 'y7y6y7yy', '88888888']); put(8, 2, 'N'); put(5, 2, 'J'); put(12, 2, 'J');
      outlineAll('yh78', 'O');
      [[26, 4], [30, 7], [20, 0], [3, 1], [29, 15]].forEach(([x, y]) => { put(x, y, 'y'); put(x - 1, y, 'w'); put(x + 1, y, 'w'); put(x, y - 1, 'w'); put(x, y + 1, 'w'); });
    } else {
      dye(0, 26, 0, 23, (x, y) => { if (sp(x, y)) return 's'; if (!fm(x, y - 1) || !fm(x - 1, y)) return '1'; if (!fm(x, y + 1) || !fm(x + 1, y)) return 'n'; const f = (Math.floor((x + y) / 3) + Math.floor((x - y + 40) / 3)) % 4; return f === 0 ? 'S' : f === 1 ? 'a' : f === 2 ? 's' : 'w'; });
      art(5, 0, ['N..N..N.', 'NaN1N1Na', 'a1a1a1a1', 'sssssss.']); put(8, 2, 'w');
      outlineAll('NaS1sw', 'O');
      [[26, 4], [30, 7], [20, 0], [3, 1], [29, 15], [31, 11]].forEach(([x, y]) => { put(x, y, 'N'); put(x - 1, y, '1'); put(x + 1, y, '1'); put(x, y - 1, '1'); put(x, y + 1, '1'); });
    }
  } else if (kind === 'fairy') {
    const wing = (cx, cy, rx, ry, rot) => { for (let y = Math.floor(cy - ry - 4); y <= Math.ceil(cy + ry + 4); y++) for (let x = Math.floor(cx - rx - 4); x <= Math.ceil(cx + rx + 4); x++) { const dx = x - cx, dy = y - cy, c = Math.cos(rot), s = Math.sin(rot), u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry, d = u * u + v * v; if (d > 1 || at(x, y) !== '.') continue; put(x, y, d > 0.68 ? 'f' : d < 0.12 ? 'w' : (u * 0.6 + v * 0.8 < -0.1 ? 'q' : 'p')); } };
    wing(22, 3.5, 7, 3, -0.7); wing(25.5, 8, 5.2, 2.3, -0.2); wing(17.5, 2.5, 4.5, 2.2, -1.1);
    dye(12, 25, 9, 17, (x, y) => y === 9 ? 'w' : y <= 12 ? 'q' : y <= 14 ? 'p' : 'f');
    for (let y = 10; y <= 17; y++) if (isFur(12, y)) put(12, y, 'w');
    for (let x = 12; x <= 25; x++) { put(x, 17, x % 2 ? 'p' : 'q'); if (isFur(x, 18)) put(x, 18, x % 2 ? 'f' : 'p'); }
    art(16, 11, ['..y..', '.y7y.', '..y..']); for (let k = 0; k < 6; k++) put(13 + k * 2, 14, 'w');
    art(11, 9, ['www']); art(4, 3, ['.y.y.y.', '.y7y7y.', '..y6y..']); put(7, 2, 'w'); put(6, 1, 'y');
    [[26, 4], [30, 6], [20, 0], [3, 1]].forEach(([x, y]) => { put(x, y, 'y'); put(x - 1, y, 'w'); put(x + 1, y, 'w'); put(x, y - 1, 'w'); put(x, y + 1, 'w'); });
    outlineAll('qpfw', 'u');
    outlineAll('y7', 'O');
  } else if (kind === 'viking') {
    ell(26.5, 12.5, 4.6, 4.6, ['7', '8', '9'], true); ell(26.5, 12.5, 3.4, 3.4, ['b', '9', '@'], true); for (let a = 0; a < 8; a++) put(26.5 + Math.cos(a * 0.785) * 3.8, 12.5 + Math.sin(a * 0.785) * 3.8, '7');
    ell(26.5, 12.5, 1.5, 1.5, ['1', '7', '8'], true); put(26, 12, '1');
    outlineAll('789b@1', 'O');
    dye(12, 25, 9, 17, (x, y) => y <= 11 ? (x % 2 ? 'w' : 'E') : y <= 13 ? 'e' : 'b');
    for (let x = 12; x <= 25; x++) { put(x, 12, x % 2 ? 'E' : 'e'); if (isFur(x, 9)) put(x, 9, 'w'); }
    rect(12, 25, 15, 15, '@'); art(17, 15, ['77']); art(17, 14, ['88']);
    for (let x = 12; x <= 25; x++) { put(x, 17, x % 2 ? 'd' : 'b'); }

    ell(8.2, 5.8, 7, 3.9, ['Y', 'E', 'e'], true, 2, 7);
    rect(2, 14, 6, 6, '7'); rect(2, 14, 7, 7, '8'); put(8, 7, '7'); put(8, 6, '1'); rect(1, 15, 5, 5, 'e');
    art(0, 0, ['w.w'.slice(0,1)+'..', 'ww.', '.ww', '.ww', '..w']); art(0, 1, ['']);
    art(13, 0, ['..w', '.ww', 'ww.', 'ww.', 'w..']);

    outlineAll('wYEe7o', 'O');
  } else {
    stream(13, 10, 32, -2, 3, 3, 4.5, (x, k, th, t) => (Math.floor(x / 2) % 2 ? 'w' : 'r'));

    dye(12, 25, 9, 17, (x, y) => y === 9 ? '#' : y <= 11 ? 'b' : (y <= 15 ? '9' : '@'));
    for (let y = 10; y <= 17; y++) if (isFur(12, y)) put(12, y, 'b');
    for (let x = 13; x <= 25; x += 4) for (let y = 11; y <= 16; y++) if (['b', '9', '@'].includes(at(x, y))) put(x, y, y < 13 ? '9' : '@');
    rect(13, 25, 13, 13, '@'); art(17, 14, ['yy', 'yy']); put(17, 15, 'y');
    for (let x = 11; x <= 14; x++) { put(x, 9, 'w'); put(x, 10, x % 2 ? 'E' : 'w'); put(x, 11, 'w'); }
    art(10, 11, ['ww']); art(13, 12, ['w']);
    ell(8.3, 5.6, 6.8, 4.4, ['#', 'b', '@'], true, 1, 7);
    rect(2, 14, 7, 7, '@'); rect(2, 4, 8, 9, '@');                                          // клапани шолома над вухом
    put(3, 9, 'd'); put(13, 8, '@'); put(14, 8, '@'); put(14, 9, '@');
    ell(5.5, 4.8, 2.2, 1.9, ['y', 'h', '8'], true); ell(5.5, 4.8, 1.3, 1.1, ['1', 'a', '*'], true);
    ell(10.5, 4.8, 2.2, 1.9, ['y', 'h', '8'], true); ell(10.5, 4.8, 1.3, 1.1, ['1', 'a', '*'], true);
    rect(7, 9, 5, 5, 'd');
    outlineAll('#b9@hy8wEr5', 'O');
  }
  let maxX = 26; grid.forEach(r => r.forEach((c, x) => { if (c !== '.' && x > maxX) maxX = x; }));     // зайвий порожній простір ззаду обрізаємо
  return grid.map(row => '.' + row.slice(0, maxX + 1).reverse().join(''));
}

['knight', 'hero', 'cowboy', 'fairy', 'viking', 'pilot', 'gold', 'diamond'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapyNewRows(k), variants: { blink: { K: PALETTE.B } } }; });
SPRITES.capy_mel = { canvas: SPRITES.foxcub_0.canvas }; SPRITES.capy_nika = { canvas: SPRITES.bunny_0.canvas };      // скіни розробників: лисеня (MEL) і зайчик (NIKA) з гри
for (let e = 0; e < 8; e++) SPRITES['capy_ep' + e] = { rows: makeCapySkinRows('ep' + e), variants: { blink: { K: PALETTE.B } } };   // по скіну Капі на кожну епоху
// Старі скіни Капі, детальна версія (як супергерой): еліпси з освітленням, 2–3 тони, чіткі деталі; замінює спрайти зі старої makeCapySkinRows
function makeCapyOldDetail(kind) {
  const ox = (kind === 'astro' || kind === 'ep6') ? 4 : kind === 'beach' ? 2 : 0, W = 40 + ox, H = 24;
  const grid = Array.from({ length: H }, (_, y) => (y < 3 || y > 23) ? Array(W).fill('.') : ('.'.repeat(ox) + CAPY_BASE[y - 3] + '.'.repeat(W - 27 - ox)).split(''));
  const at = (x, y) => (grid[y] ? grid[y][x + ox] : undefined);
  const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (y >= 0 && y < H && x + ox >= 0 && x + ox < W) grid[y][x + ox] = c; };
  const isFur = (x, y) => at(x, y) === 'B' || at(x, y) === 'L';
  const dye = (x0, x1, y0, y1, fn) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (isFur(x, y)) put(x, y, typeof fn === 'string' ? fn : fn(x, y)); };
  const rect = (x0, x1, y0, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  const art = (x0, y0, rows) => rows.forEach((r, j) => r.split('').forEach((c, i) => { if (c !== '.') put(x0 + i, y0 + j, c); }));
  const ell = (cx, cy, rx, ry, tones, over, y0, y1) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { if (y0 !== undefined && (y < y0 || y > y1)) continue; const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy; if (d > 1) continue; if (!over && at(x, y) !== '.') continue; const l = -dx * 0.6 - dy * 0.8; put(x, y, l > 0.55 ? tones[0] : l > -0.25 ? tones[1] : tones[2]); } };
  const outlineAll = (chars, col) => { const todo = []; for (let y = 0; y < H; y++) for (let x = -ox; x < W - ox; x++) if (chars.includes(at(x, y))) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (at(x + dx, y + dy) === '.') todo.push([x + dx, y + dy]); }); todo.forEach(([x, y]) => put(x, y, col || 'O')); };
  const stream = (x0, y0, x1, amp, th0, th1, wav, cols) => { for (let x = x0; x <= x1; x++) { const t = (x - x0) / (x1 - x0), cy = y0 + t * amp + Math.sin(t * wav) * 1.6, th = th0 + (th1 - th0) * t; for (let k = 0; k < th; k++) { const y = cy + k - th / 2; put(x, y, cols(x, k, th, t)); } } };
  const cloth = c => dye(12, 25, 9, 17, (x, y) => y === 9 ? c[0] : y <= 12 ? c[1] : y <= 15 ? c[2] : (c[3] || c[2]));
  const leftEdge = c => { for (let y = 10; y <= 17; y++) if (isFur(12, y)) put(12, y, c); };
  const folds = (cols, every, from) => { for (let x = 13 + (from || 0); x <= 25; x += every) for (let y = 10; y <= 17; y++) if (cols.includes(at(x, y))) put(x, y, cols[cols.length - 1]); };
  const glass = (tint) => { const inside = (x, y) => Math.pow((x - 7.5) / 10.2, 2) + Math.pow((y - 8.8) / 9.4, 2) <= 1; const ring = [], out = [];
    for (let y = -1; y <= 19; y++) for (let x = -4; x <= 25; x++) { if (at(x, y) !== '.') continue; if (inside(x, y)) { if (!(inside(x + 1, y) && inside(x - 1, y) && inside(x, y + 1) && inside(x, y - 1))) ring.push([x, y]); } else if (inside(x + 1, y) || inside(x - 1, y) || inside(x, y + 1) || inside(x, y - 1)) out.push([x, y]); }
    out.forEach(([x, y]) => put(x, y, 'O')); ring.forEach(([x, y]) => put(x, y, (x - 7.5 < -3 && y - 8.8 < -3) ? 'w' : tint)); };
  const sparkle = (x, y, c) => { put(x, y, c || 'y'); put(x - 1, y, 'w'); put(x + 1, y, 'w'); put(x, y - 1, 'w'); put(x, y + 1, 'w'); };
  const beard = cols => { [[15, 1, 8], [16, 1, 8], [17, 2, 8], [18, 2, 7], [19, 3, 6], [20, 4, 5]].forEach(([y, x0, x1]) => { for (let x = x0; x <= x1; x++) put(x, y, x === x0 ? cols[0] : (x === x1 ? cols[2] : cols[1])); }); art(1, 14, [cols[1] + cols[1] + cols[1] + cols[1] + cols[1]]); put(0, 13, cols[1]); put(1, 13, cols[0]); };

  const suit = (rows, rim, dark) => { for (let y = 9; y <= 17; y++) for (let x = 12; x <= 25; x++) if (isFur(x, y)) { let c = rows[y - 9]; if (dark && x >= 24 && y >= 11) c = dark; put(x, y, c); } };
  const cone = (spec, cols) => { spec.forEach(([y, x0, x1]) => { for (let x = x0; x <= x1; x++) put(x, y, x - x0 < 2 ? cols[0] : (x1 - x < 2 ? cols[2] : cols[1])); }); };
  const plus = (x, y, petal, mid) => { put(x, y, mid); put(x - 1, y, petal); put(x + 1, y, petal); put(x, y - 1, petal); put(x, y + 1, petal); };

  if (kind === 'pirate') {
    suit(['r', 'R', 'R', 'R', 'R', 'R', 'R', 'P', 'h'], 'w', 'P');
    for (let x = 12; x <= 25; x++) put(x, 9, x % 2 ? 'h' : 'r');
    rect(13, 25, 14, 14, 'k'); art(18, 13, ['hh', 'hh']); put(18, 14, 'k');                                  // чорний пояс із пряжкою
    [10, 11, 12].forEach(y => { put(14, y, 'h'); put(16, y, 'h'); });                                          // золоті ґудзики
    art(11, 9, ['ww', 'wE']); art(7, 14, ['rrrrrr', '.rrrr.', '..rr..']); [[7, 15], [12, 15], [8, 16], [11, 16], [9, 17], [10, 17]].forEach(q => put(q[0], q[1], 'O'));     // жабо й хустка (з темним контуром, щоб не скидалась на язик)
    art(19, 3, ['..rr.', '.rkrr', 'yrrr.', '.gggg', '.gnng', '..gg.']);                                         // зелений папуга
    ell(8.2, 5.2, 7, 3.7, ['4', 'k', 'k'], true, 1, 7);                                                         // трикутний капелюх
    rect(1, 15, 6, 6, 'k'); rect(0, 16, 7, 7, 'k'); put(0, 6, 'k'); put(16, 6, 'k'); rect(2, 14, 7, 7, 'h'); put(3, 7, 'y'); put(4, 7, 'y');
    art(6, 3, ['.ww.', 'wkkw', '.ww.']); put(3, 2, 'y'); put(13, 2, 'y');                                       // череп і золоті кутики
    rect(6, 8, 8, 10, 'k'); put(5, 7, 'k'); put(5, 6, 'k'); put(10, 9, 'k'); put(11, 8, 'k'); put(9, 10, 'k'); put(7, 9, '4'); put(6, 8, '4');   // пов'язка на оці
    put(13, 12, 'h'); put(13, 13, 'y');                                                                          // сережка
    outlineAll('rRPkh4wnyEgo', 'O');
  } else if (kind === 'astro') {
    suit(['1', '1', '1', '1', '1', '2', '2', '3', '3'], null, '2');
    rect(14, 20, 11, 13, '4'); rect(14, 20, 11, 11, '3'); put(15, 12, 'r'); put(17, 12, 'y'); put(19, 12, 'N'); put(15, 13, 'o'); put(17, 13, 'a'); put(19, 13, 'w');   // панель на грудях
    art(22, 10, ['nnn', 'wrw', 'nnn']);                                                                           // прапорець
    rect(12, 25, 15, 15, 'r');                                                                                    // червоний пояс
    rect(18, 24, 3, 8, 'E'); rect(18, 24, 3, 3, '1'); rect(24, 24, 4, 8, '3'); rect(18, 24, 8, 8, '3'); rect(20, 22, 5, 6, '4'); put(21, 5, 'N'); put(21, 6, 'o');   // ранець
    glass('a');
    [[6, 2], [7, 1], [4, 3]].forEach(q => put(q[0], q[1], 'w')); put(11, 2, 'w');
    art(10, -1 + 1, ['d', 'd']); put(10, 0, 'r');
    for (let y = 21; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 21 ? '2' : '3');
    outlineAll('1w23E4rynod', 'O');
  } else if (kind === 'wizard') {
    suit(['v', 'u', 'u', 'u', 'P', 'P', 'P', 'V', 'y'], 'v', 'V');
    [[15, 11], [19, 13], [22, 11], [16, 15], [21, 15], [24, 13]].forEach(q => put(q[0], q[1], 'y')); put(19, 12, 'w'); put(19, 14, 'w');
    art(13, 9, ['hhh']);
    beard(['1', 'w', 'E']);   // борода
    cone([[6, 2, 15], [5, 3, 14], [4, 4, 13], [3, 5, 12], [2, 7, 13], [1, 10, 14], [0, 12, 15]], ['v', 'u', 'P']);
    rect(0, 16, 7, 7, 'P'); rect(1, 15, 7, 7, 'u'); rect(0, 16, 7, 7, 'P'); rect(2, 14, 6, 6, 'h'); put(7, 6, 'y'); put(8, 6, 'w'); put(6, 6, 'y');
    put(7, 4, 'y'); put(10, 3, 'y'); put(9, 5, 'w'); sparkle(14, 1, 'y');
    outlineAll('vuPVyhw1E', 'O');
  } else if (kind === 'chef') {
    suit(['1', 'w', 'w', 'w', 'w', 'w', 'w', 'E', 'E'], '1', 'E');
    [11, 13, 15].forEach(y => { put(15, y, 'k'); put(19, y, 'k'); }); for (let y = 10; y <= 17; y++) put(17, y, 'E');
    art(7, 14, ['rrrrrr', '.rwrr.', '..rr..']); [[7, 15], [12, 15], [8, 16], [11, 16], [9, 17], [10, 17]].forEach(q => put(q[0], q[1], 'O'));
    art(21, 11, ['EEE', 'EEE']); put(22, 10, 'n');
    art(21, 3, ['l', 'c', 'c', 'c', 'c', 'c']); ell(21, 2, 1.7, 1.9, ['y', 'c', 'l'], true);                       // дерев'яна ложка на спині
    ell(5.2, 3.2, 3.2, 2.9, ['1', 'w', 'E'], true); ell(8.6, 2.4, 3.4, 2.6, ['1', 'w', 'E'], true); ell(12, 3.4, 3, 2.7, ['1', 'w', 'E'], true);
    rect(3, 14, 5, 7, 'w'); rect(3, 14, 7, 7, 'E'); rect(3, 14, 5, 5, '1');
    [4, 7, 10, 13].forEach(x => { put(x, 5, 'E'); put(x, 6, 'E'); }); [6, 9, 12].forEach(x => { put(x, 3, 'E'); put(x, 2, 'E'); });
    outlineAll('1wEclyn', 'O');
  } else if (kind === 'explorer') {
    suit(['%', 'c', 'c', 'c', 'c', 'c', 'c', 'l', 'b'], null, 'l');
    art(14, 11, ['bbbb', 'bccb', 'bbbb']); art(20, 11, ['bbbb', 'bccb', 'bbbb']); put(15, 11, 'h'); put(21, 11, 'h');
    for (let x = 12; x <= 25; x++) put(x, 14, 'b');
    art(7, 14, ['rrrrrr', '.rwrr.', '..rr..']); [[7, 15], [12, 15], [8, 16], [11, 16], [9, 17], [10, 17]].forEach(q => put(q[0], q[1], 'O'));                       // хустка на шиї (з темним контуром)
    rect(19, 24, 2, 9, 'g'); rect(19, 24, 2, 2, 'm'); rect(24, 24, 3, 9, 'G'); rect(19, 24, 9, 9, 'G'); rect(19, 24, 5, 5, 'G'); put(21, 6, 'y'); put(22, 6, 'y');   // рюкзак із клапаном
    rect(18, 25, -1 + 1, 1, 'c'); put(18, 0, '.'); rect(18, 25, 0, 0, '%'); rect(18, 25, 1, 1, 'l'); put(19, 1, 'b'); put(23, 1, 'b');                              // згорнутий килимок
    ell(8.2, 5.2, 7.2, 3.6, ['%', 'c', 'l'], true, 1, 7);
    rect(0, 16, 7, 7, 'l'); rect(1, 15, 6, 6, 'b'); put(8, 1, '%'); [4, 12].forEach(x => put(x, 3, 'l')); put(8, 2, 'c');
    outlineAll('%clbgGhykad', 'O');
  } else if (kind === 'santa') {
    suit(['w', 'r', 'r', 'r', 'r', 'r', 'r', 'R', 'w'], 'w', 'R');
    for (let x = 12; x <= 25; x++) { put(x, 14, 'k'); put(x, 9, 'w'); }
    art(18, 13, ['hhh', 'hkh', 'hhh']);
    beard(['1', 'w', 'E']);
    ell(8.2, 5.2, 7, 3.4, ['p', 'r', 'R'], true, 2, 6);
    cone([[5, 13, 17], [4, 14, 18], [6, 16, 20]], ['p', 'r', 'R']);
    rect(1, 15, 6, 7, 'w'); rect(2, 14, 7, 7, 'E'); [3, 7, 10, 13].forEach(x => put(x, 6, 'E'));
    ell(19.5, 7.5, 2.3, 2.3, ['1', 'w', 'E'], true);
    outlineAll('prRw1Ekhy', 'O');
  } else if (kind === 'witch') {
    suit(['v', 'V', 'V', 'V', 'P', 'P', 'P', 'V', 'o'], 'v', 'V');
    for (let x = 12; x <= 25; x++) if (isFur(x, 16) || at(x, 16) === 'V') put(x, 16, 'j');
    art(16, 10, ['yy', 'y.', 'y.', 'yy']); put(21, 12, 'y'); put(23, 15, 'y'); put(14, 14, 'y'); put(12, 10, 'h');
    ell(21.5, 6.6, 3.4, 2.8, ['y', 'o', 'j'], true); rect(21, 22, 2, 3, 'G'); put(23, 3, 'g'); put(20, 3, 'g');
    put(20, 5, 'k'); put(22, 5, 'k'); put(23, 5, 'k'); rect(20, 23, 7, 7, 'k'); put(21, 6, 'k'); put(22, 8, 'o'); put(21, 7, 'y');
    cone([[6, 2, 15], [5, 3, 14], [4, 4, 13], [3, 5, 12], [2, 7, 13], [1, 10, 14], [0, 12, 15]], ['v', 'V', 'P']);
    rect(0, 16, 7, 7, 'P'); rect(1, 15, 7, 7, 'V'); rect(2, 14, 6, 6, 'o'); put(7, 6, 'h'); put(8, 6, 'y'); put(6, 6, 'h'); put(3, 6, 'j'); put(4, 6, 'j');
    sparkle(14, 2, 'y');
    outlineAll('vVPojyGgkh', 'O');
  } else if (kind === 'flower') {
    suit(['w', 'q', 'q', 'q', 'q', 'm', 'p', 'p', 'w'], 'w', 'p');
    for (let x = 12; x <= 25; x++) { if (isFur(x, 18)) put(x, 18, x % 2 ? 'q' : 'w'); put(x, 17, x % 2 ? 'w' : 'q'); }
    plus(16, 12, 'w', 'f'); plus(22, 12, 'w', 'y'); put(14, 16, 'f'); put(19, 16, 'w'); put(24, 16, 'f');
    art(17, 13, ['pp.pp']);
    art(19, 5, ['uu.k.uu', 'uvukuvu', '.uukuu.', '..ukuu.'.slice(0, 7)]); put(20, 4, 'k'); put(22, 4, 'k');         // метелик
    rect(2, 14, 4, 4, 'g'); rect(2, 14, 5, 5, 'G');
    plus(3, 3, 'p', 'y'); plus(6, 3, 'w', 'y'); plus(9, 3, 'u', 'y'); plus(12, 3, 'f', 'y');
    put(4, 5, 'g'); put(8, 5, 'g'); put(11, 5, 'g'); put(13, 5, 'g');
    outlineAll('wqpfmgGuyabk', 'O');
  } else if (kind === 'beach') {
    suit(['*', 'T', 'T', 'T', 'T', 'T', 'n', 'n', 'w'], '*', 'n');
    plus(15, 12, 'f', 'y'); plus(21, 12, 'w', 'y'); plus(18, 15, 'y', 'f'); put(24, 15, 'f');
    art(6, 14, ['fyofyo', '.pyp.p', '..f.f.']); art(5, 13, ['m.m.m']);                                          // гірлянда з квітів
    ell(21.5, 5.5, 3.4, 3.4, ['w', 'w', 'E'], true); for (let y = 2; y <= 9; y++) for (let x = 18; x <= 25; x++) { const dx = x - 21.5, dy = y - 5.5; if (dx * dx + dy * dy <= 11.6) { const a = Math.atan2(dy, dx); put(x, y, ['r', 'w', 'n', 'w', 'h', 'w'][Math.floor(((a + Math.PI) / (Math.PI * 2)) * 6) % 6]); } }
    put(20, 3, '1'); put(21, 3, '1');
    rect(5, 10, 8, 9, 'k'); rect(11, 13, 8, 8, 'k'); put(6, 8, 'a'); put(9, 8, 'a'); put(6, 9, '4'); put(9, 9, '4');   // сонцезахисні окуляри
    ell(8.2, 5.4, 6.4, 3.3, ['%', 'c', 'h'], true, 2, 6);
    rect(-1, 17, 7, 7, 'h'); rect(0, 16, 6, 6, 'c'); rect(2, 14, 5, 5, 'r'); rect(2, 14, 4, 4, 'f');
    plus(14, 3, 'w', 'y'); [3, 5, 7, 9].forEach(x => put(x, 3, 'h'));
    outlineAll('*Tnwfyrgmhc%Ek4pao', 'O');
  } else if (kind === 'autumn') {
    stream(14, 11, 34, 3, 3, 4, 3.6, (x) => (Math.floor(x / 2) % 2 ? 'w' : 'r'));
    suit(['h', 'o', 'o', 'o', 'o', 'o', 'j', 'j', 'b'], 'h', 'j');
    for (let x = 12; x <= 25; x++) { if (at(x, 11) === 'o') put(x, 11, x % 4 < 2 ? 'r' : 'w'); if (at(x, 14) === 'o') put(x, 14, 'r'); if (at(x, 16) === 'j') put(x, 16, 'r'); }
    [[14, 12], [18, 12], [22, 12]].forEach(([x, y]) => { put(x, y, 'y'); put(x + 1, y + 1, 'y'); });
    art(4, 12, ['rwrwrwr']); art(4, 13, ['.rwrwr.']); art(5, 14, ['rwrwr']); art(6, 15, ['rwr']);
    art(20, 4, ['..r..', '.rrr.', 'rrorr', '.rrr.', '..b..']); put(19, 6, 'r'); put(25, 6, 'r');
    ell(8.2, 5.2, 6.4, 3.5, ['h', 'o', 'j'], true, 2, 5);
    rect(1, 15, 6, 7, 'r'); rect(1, 15, 7, 7, 'b'); [2, 4, 6, 8, 10, 12, 14].forEach(x => put(x, 6, 'w'));
    [4, 6, 8, 10, 12].forEach(x => { put(x, 3, 'j'); put(x, 4, 'j'); });
    ell(8.5, 1, 2.3, 2.1, ['y', 'h', 'o'], true);
    outlineAll('hojrwybk', 'O');
  } else if (kind === 'ep0') {
    suit(['h', 'R', 'R', 'R', 'R', 'R', 'P', 'P', 'h'], null, 'P');
    [14, 25].forEach(x => { for (let y = 10; y <= 16; y++) if (['R', 'P'].includes(at(x, y))) put(x, y, 'h'); });
    for (let x = 12; x <= 25; x++) put(x, 9, x % 2 ? 'h' : 'r');
    art(17, 11, ['.h.h.', 'hhhhh', '.hhh.', '..h..', '.hhh.']);
    ell(11, 12, 2.6, 3.8, ['1', 'w', 'E'], true, 9, 15); [10, 12, 14].forEach(y => { put(9, y, 'E'); put(10, y, 'E'); put(11, y, 'E'); put(12, y, 'E'); });          // гофрований комір
    art(5, 12, ['hh']); put(6, 13, 'h'); put(6, 14, 'y');
    ell(8.2, 5.2, 7, 3.2, ['r', 'R', 'P'], true, 2, 7);
    rect(1, 15, 6, 7, 'R'); rect(1, 15, 7, 7, 'P'); rect(2, 14, 6, 6, 'h'); put(3, 6, 'y'); put(4, 6, 'y');
    put(9, 4, 'y'); put(8, 4, 'y'); put(9, 5, 'a'); put(8, 5, 'y');
    art(12, 1, ['..ww', '.www', 'www.']); art(15, 0, ['ww']); art(16, 1, ['w']); put(17, 1, 'E'); put(14, 3, 'E');
    outlineAll('rRPhyw1Ea', 'O');
  } else if (kind === 'ep1') {
    suit(['w', '&', '&', 'n', 'n', 'n', 'n', 'z', 'w'], null, 'z');
    for (let x = 12; x <= 25; x++) { put(x, 9, 'w'); if (isFur(x, 17) || at(x, 17) === 'w') put(x, 17, 'r'); if (at(x, 16) === 'z') put(x, 16, 'w'); }
    for (let y = 10; y <= 16; y++) put(13, y, y % 2 ? 'w' : 'r');
    art(16, 10, ['.wwww', 'wwwww', 'ww...', 'ww...', 'ww...', 'wwwww', '.wwww']); put(22, 12, 'y'); put(22, 13, 'y');          // велика літера C
    art(18, 4, ['EEEEEEE', 'EkkEoYE', 'EkkE..E', '3333333']); put(24, 3, 'Y'); put(25, 2, 'Y'); put(25, 1, 'Y');   // радіоприймач
    ell(8.2, 5.3, 7, 3.7, ['p', 'r', '5'], true, 2, 7);
    rect(1, 15, 6, 6, 'r'); rect(1, 15, 7, 7, '5'); rect(0, 5, 7, 7, 'r'); rect(0, 5, 8, 8, '5');
    rect(3, 13, 4, 4, 'w'); art(8, 2, ['w', 'w']); put(3, 5, 'E'); put(13, 5, 'E');
    outlineAll('prw5y&nzEk3oYE', 'O');
  } else if (kind === 'ep2') {
    suit(['w', 'v', 'v', 'v', 'u', 'u', 'u', 'P', 'f'], null, 'P');
    for (let y = 9; y <= 14; y++) put(11 + (y - 9), y, 'w');
    for (let y = 10; y <= 16; y += 2) for (let x = 15; x <= 25; x += 4) if (['v', 'u'].includes(at(x, y))) put(x, y, 'q');
    plus(19, 12, 'y', 'w'); art(13, 15, ['y']);
    ell(20.5, 5.5, 3.3, 3.3, ['w', 'Y', '3'], true); for (let y = 2; y <= 9; y++) for (let x = 17; x <= 24; x++) { const dx = x - 20.5, dy = y - 5.5; if (dx * dx + dy * dy <= 10.9) { const bi = (Math.floor((x - 17) / 2) + Math.floor((y - 2) / 2)); put(x, y, bi % 3 === 0 ? 'w' : bi % 3 === 1 ? 'Y' : 'a'); } }
    put(20, 1, 'k'); put(20, 0, 'k'); sparkle(24, 3, 'q'); sparkle(16, 1, 'y');
    rect(1, 15, 4, 5, 'f'); rect(1, 15, 4, 4, 'p'); [3, 6, 9, 12].forEach(x => put(x, 4, 'y'));
    art(4, 6, ['.uuuu.', 'u....u', 'u....u', 'u....u', 'u....u', '.uuuu.']); art(11, 8, ['uuu']); put(5, 7, 'w'); put(6, 8, 'q'); put(8, 8, 'q'); put(9, 9, 'q'); put(10, 7, 'u');
    outlineAll('wvuPfqyYak3', 'O');
  } else if (kind === 'ep3') {
    suit(['4', 'z', 'z', 'z', 'z', 'k', 'k', 'k', 'n'], null, 'k');
    art(14, 10, ['.YYYYYYY.', 'YYYYYYYYY', 'YYYYYYYYY', '.EEEEEEE.']); put(16, 11, 'k'); put(15, 11, 'k'); put(17, 11, 'k'); put(16, 10, 'k'); put(16, 12, 'k'); put(20, 11, 'r'); put(21, 11, 'y'); put(20, 12, 'N'); put(21, 10, 'f');
    rect(14, 22, 15, 15, '4');
    ell(8.2, 5.2, 7, 3.7, ['4', 'z', 'k'], true, 2, 7);
    rect(1, 15, 6, 7, 'k'); rect(2, 14, 6, 6, '4'); rect(0, 4, 7, 8, 'k'); rect(0, 3, 7, 7, '4');
    art(5, 3, ['N.N.N', 'NNNNN', 'N.N.N']);
    ell(11.5, 8.2, 1.9, 2.6, ['a', 'T', 'n'], true); rect(11, 12, 6, 6, 'T'); put(12, 10, 'N');
    outlineAll('4zkNfyTnaYrE', 'O');
  } else if (kind === 'ep4') {
    suit(['1', 'w', 'w', 'w', 'w', 'w', 'E', 'n', '&'], null, 'E');
    art(15, 10, ['.nnn.', 'n...n', '.n.n.', '..n..']);
    rect(12, 25, 13, 13, 'a'); art(6, 14, ['n.n']); put(6, 15, 'a'); put(8, 15, 'a');
    ell(21.5, 6.3, 3.8, 3.3, ['3', '4', 'z'], true); art(21, 4, ['nnn', 'nNn', 'nnn']); put(23, 8, 'y'); put(19, 6, 'r'); put(19, 4, 'n'); put(19, 5, 'n');
    ell(8.2, 5.3, 7, 3.7, ['*', '&', 'n'], true, 2, 7);
    rect(1, 15, 6, 7, 'n'); rect(0, 4, 7, 8, '&'); rect(0, 4, 8, 8, 'n'); rect(0, 3, 7, 7, '*');
    art(6, 3, ['.ww.', 'wnnw', '.ww.']);
    ell(11.8, 8.6, 1.8, 2.8, ['f', 'p', 'r'], true); rect(11, 12, 6, 6, 'k'); put(12, 11, 'w');
    outlineAll('1wEan&*nfprzyhN34k', 'O');
  } else if (kind === 'ep5') {
    suit(['m', 'g', 'g', 'g', 'g', 'g', 'G', 'G', 'b'], 'm', 'G');
    art(15, 11, ['.m.', 'mgm', 'mGm', '.G.']); put(16, 12, 'g');
    ell(21.5, 7.3, 3.7, 3.1, ['g', 'G', 'G'], true); rect(18, 25, 8, 8, 'b'); art(19, 5, ['mmmm']); put(24, 8, 'b');
    art(21, 2, ['G', 'G']); art(19, 1, ['mm', '.m']); art(22, 1, ['gg', 'g.']);
    ell(8.2, 5.3, 7, 3.6, ['%', 'c', 'l'], true, 2, 6);
    rect(0, 16, 7, 7, 'l'); rect(1, 15, 6, 6, 'c'); rect(2, 14, 5, 5, 'g'); rect(3, 13, 6, 6, 'G'); [4, 7, 10].forEach(x => { put(x, 4, 'm'); put(x + 1, 4, 'g'); });
    plus(13, 3, 'f', 'y'); art(2, 4, ['mg']);
    outlineAll('mgGbl%cfyN', 'O');
  } else if (kind === 'ep6') {
    suit(['*', '&', '&', 'n', 'n', 'n', 'n', 'z', 'z'], null, 'z');
    rect(12, 25, 12, 12, 'N'); rect(12, 25, 15, 15, 'N');
    rect(14, 18, 10, 11, 'w'); put(15, 10, 'k'); put(17, 10, 'k'); art(21, 10, ['oo', 'oo']); art(21, 13, ['rr']);
    ell(21, 6, 3.8, 2.8, ['E', 'Y', '3'], true); rect(18, 24, 5, 5, '4'); put(19, 5, 'N'); put(21, 5, 'N'); put(23, 5, 'N'); put(25, 6, 'o'); put(26, 6, 'y'); put(25, 7, 'o'); put(26, 7, 'o'); put(27, 7, 'y'); put(25, 8, 'o'); put(26, 8, 'y');
    glass('N');
    [[6, 2], [7, 1], [4, 3]].forEach(q => put(q[0], q[1], 'w'));
    for (let y = 21; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 21 ? 'N' : '4');
    outlineAll('E1Y34nBoywrz*&', 'O');
  } else if (kind === 'ep7') {
    suit(['u', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'k'], 'N', 'k');
    for (let x = 12; x <= 25; x++) { if (at(x, 11) === 'V') put(x, 11, 'f'); if (at(x, 14) === 'V') put(x, 14, 'N'); if (isFur(x, 17) || at(x, 17) === 'k') put(x, 17, 'N'); }
    for (let y = 9; y <= 17; y++) { if (['V', 'k'].includes(at(17, y))) put(17, y, 'N'); if (['V', 'k'].includes(at(21, y))) put(21, y, 'f'); }
    put(15, 12, 'w'); put(24, 15, 'w'); put(19, 15, 'w');
    ell(11, 10.8, 3.2, 2.8, ['u', 'V', 'k'], true, 9, 12);
    ell(8.2, 5.4, 7, 3.7, ['u', 'V', 'k'], true, 2, 7); rect(1, 15, 6, 7, 'V'); rect(2, 14, 6, 6, 'u');
    rect(3, 13, 6, 7, 'N'); rect(3, 13, 6, 6, 'w'); put(5, 6, 'T'); put(10, 6, 'T'); put(6, 7, 'T'); put(9, 7, 'T');
    ell(10.8, 4.2, 1.7, 2.6, ['f', 'p', 'r'], true); put(10, 4, 'w');
    sparkle(25, 3, 'N'); sparkle(2, 1, 'f');
    for (let y = 21; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 21 ? 'N' : 'f');
    outlineAll('uVkNfwTprn', 'O');
  } else if (kind === 'ep8') {
    suit(['w', 'r', 'r', 'r', 'r', 'r', 'r', 'R', 'R'], 'w', 'R');
    for (let x = 12; x <= 25; x++) { if (isFur(x, 13) || at(x, 13) === 'r') put(x, 13, 'n'); if (isFur(x, 14) || at(x, 14) === 'r') put(x, 14, 'n'); }
    put(18, 13, 'h'); put(19, 13, 'h'); put(18, 14, 'h');
    art(21, 10, ['rrr', 'rwr', '.d.']);
    cone([[0, 6, 10], [1, 4, 12], [2, 3, 13], [3, 2, 14], [4, 1, 15], [5, 0, 16]], ['h', 'y', 'c']);
    rect(0, 16, 6, 6, 'l'); rect(2, 14, 7, 7, 'r'); put(7, 6, 'p'); put(9, 5, 'q'); put(3, 8, 'p'); put(14, 8, 'q'); put(24, 8, 'p');
    outlineAll('wrRnhycldpq', 'O');
  }
  let maxX = 26 + ox; grid.forEach(r => r.forEach((c, x) => { if (c !== '.' && x > maxX) maxX = x; }));
  return grid.map(row => '.' + row.slice(0, maxX + 1).reverse().join(''));
}
['pirate', 'astro', 'wizard', 'chef', 'explorer', 'santa', 'witch', 'flower', 'beach', 'autumn', 'ep0', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapyOldDetail(k), variants: k === 'pirate' ? undefined : { blink: { K: PALETTE.B } } }; });
// Привид 11×13 (для «Полювання на привидів») і малий привид 5×7 (блимає у вікнах будинків на Хелловін)
SPRITES.ghost = { rows: [
  '...ddddd...',
  '..dwwwwwd..',
  '.dwwwwwwwd.',
  'dwwkkwkkwwd',
  'dwwkkwkkwwd',
  'dwwwwwwwwwd',
  'dwwwkkkwwwd',
  'dwwwwkwwwwd',
  'dwwwwwwwwwd',
  'dwwwwwwwwwd',
  'dwSwwwwwSwd',
  'dwwdwwwdwwd',
  'dd.ddd.dd.d'
] };
SPRITES.ghost_s = { rows: ['.www.', 'wwwww', 'wkwkw', 'wwwww', 'wwwww', 'wwwww', 'w.w.w'] };
Object.keys(GLYPHS).forEach(k => { SPRITES['glyph_' + k] = { rows: GLYPHS[k] }; });
SPRITES.glyph_coin = SPRITES.coin;
// Монетки й кристали під стиль кожної епохи (індекс — як в EPOCHS): флорин, кафе-жетон, платівка, аркадний жетон, цифрова монета, листок, зоряна монета, неон
const EPOCH_COIN_ROWS = [
  ['..dddd..', '.dhyyhd.', 'dhyhohhd', 'dhhooohd', 'dhhhohhd', 'dhhooohd', '.dhhhhd.', '..dddd..'],
  ['..dddd..', '.dTwwTd.', 'dTTTwTTd', 'dTwwwwwd', 'dTTwwwTd', 'dTwTTwTd', '.dTTTTd.', '..dddd..'],
  ['..dddd..', '.dkkkwd.', 'dkkkkwkd', 'dkkffkkd', 'dkkffkkd', 'dkwkkkkd', '.dwkkkd.', '..dddd..'],
  ['..dddd..', '.dvTTvd.', 'dvTvvTvd', 'dvTTTTvd', 'dvTvvvvd', 'dvTvvvvd', '.dvvvvd.', '..dddd..'],
  ['..dddd..', '.dnaand.', 'dnanaand', 'dnaaaand', 'dnanaand', 'dnaannnd', '.dnnnnd.', '..dddd..'],
  ['..dddd..', '.dgmmgd.', 'dgmgggGd', 'dgggGGgd', 'dgGGGggd', 'dgGgggwd', '.dgggGd.', '..dddd..'],
  ['..dddd..', '.dEwwEd.', 'dEwEEEEd', 'dEEnnEEd', 'duunnuud', 'dEEnnEEd', '.dEEEEd.', '..dddd..'],
  ['..ffff..', '.fkkkkf.', 'fkkTTkkf', 'fkTkkTkf', 'fkTkkTkf', 'fkkTTkkf', '.fkkkkf.', '..ffff..'],
  ['..dddd..', '.dhyyhd.', 'dhyhhyhd', 'dhyddyhd', 'dhyddyhd', 'dhyhhyhd', '.dhyyhd.', '..dddd..']
];
EPOCH_COIN_ROWS.forEach((rows, i) => { SPRITES['coin_' + i] = { rows }; });
const EPOCH_COIN_COLORS = [['h', 'y'], ['T', 'w'], ['k', 'f'], ['v', 'T'], ['n', 'a'], ['g', 'm'], ['E', 'w'], ['k', 'T'], ['h', 'y']];    // [основа, відблиск] для колеса фортуни
[{ S: 'p', s: 'r', w: 'w' }, { S: 'T', s: 'n', w: 'w' }, { S: 'f', s: 'P', w: 'y' }, { S: 'v', s: 'V', w: 'T' },
 { S: 'a', s: 'n', w: 'w' }, { S: 'm', s: 'g', w: 'w' }, { S: 'S', s: 'u', w: 'y' }, { S: 'T', s: 'f', w: 'w' }, { S: 'q', s: 'p', w: 'w' }].forEach((map, i) => {
  SPRITES['gem_' + i] = { rows: GLYPHS.gem.map(row => row.replace(/[A-Za-z]/g, ch => map[ch] || ch)) };
  SPRITES.shard = { rows: GLYPHS.shard.slice() };
});
const SHARD_CH = '';                                                          // у текстах осколок позначається цим символом, а на екрані замінюється піксельним малюнком
const GEM_CH = '\uE001';                                                     // у текстах кристал позначається цим символом (як осколок), а на екрані замінюється піксельним значком епохи
const GEM_ROWS = [["..hhhh..",".dSSssd.","dSSsssnd","dSsssnnd",".dssnnd.","..dsnd..","...dd...","........"],["..dddd..",".dwqqpd.","dwqqppfd","dqqppffd",".dqppfd.","..dpfd..","...dd...","........"],["..dddd..",".dwSwSd.","dSqSwSEd","dwSEqwSd","dSwSEqwd",".dqwSEd.","..dddd..","...dd..."],["..dddd..",".dvvwud.","dvwvvuud","dvvvuuPd","dvvuuPPd",".duuPPd.","..dPPd..","...dd..."],["..dddd..",".dNNwNd.","dNwNNaad","dNNNaaad","dNNaaand",".dnnnnd.","..dddd..","........"],["...ddd..","..dmmgd.",".dmwmgGd","dmwmggGd","dmmgggGd",".dgggGd.","..dGGd..",".dd.dd.."],["...dd...","..dyyd..","dddyyddd","dyywhhyd","dyyhhhyd","dddhhddd","..dhhd..","...dd..."],["...kk...","..kNNk..",".kNffNk.","kNfwwfNk","kNffffNk",".kNNNNk.","..kkkk..","........"],["...dd...","..dpwd..",".dpwwpd.","dpwrrwpd","dpwrrwpd",".dpwwpd.","..dppd..","...dd..."]];    // 8 епох: Відродження, Ретро, Диско, Аркади, Інтернет, Еко, Космос, Неон
const gemUrls = [];
function setGemEpoch(ep) {
  ep = ((ep % GEM_ROWS.length) + GEM_ROWS.length) % GEM_ROWS.length;
  if (!gemUrls[ep]) { const c = document.createElement('canvas'); c.width = 8; c.height = 8; const g = c.getContext('2d'); GEM_ROWS[ep].forEach((row, y) => { for (let x = 0; x < 8; x++) if (row[x] !== '.' && PALETTE[row[x]]) { g.fillStyle = PALETTE[row[x]]; g.fillRect(x, y, 1, 1); } }); gemUrls[ep] = 'url(' + c.toDataURL() + ')'; }
  document.documentElement.style.setProperty('--gem', gemUrls[ep]);
}
(function shardIcons() {
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; const g = c.getContext('2d');
  GLYPHS.shard.forEach((row, y) => { for (let x = 0; x < 8; x++) if (row[x] !== '.') { g.fillStyle = PALETTE[row[x]]; g.fillRect(x, y, 1, 1); } });
  document.documentElement.style.setProperty('--shard', 'url(' + c.toDataURL() + ')');
  const RE = /[\uE000\uE001]/;
  const fix = node => {
    if (node.nodeType === 3) {
      if (!RE.test(node.data)) return;
      const parts = node.data.split(/([\uE000\uE001])/), frag = document.createDocumentFragment();
      parts.forEach(p => { if (p === '\uE000' || p === '\uE001') { const sp = document.createElement('span'); sp.className = p === '\uE000' ? 'shard' : 'gem'; frag.appendChild(sp); } else if (p) frag.appendChild(document.createTextNode(p)); });
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1 && node.tagName !== 'TEXTAREA' && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') { [...node.childNodes].forEach(fix); }
  };
  window.__shardFix = () => fix(document.body);
  new MutationObserver(muts => muts.forEach(m => { if (m.type === 'characterData') fix(m.target); else m.addedNodes.forEach(fix); })).observe(document.body, { childList: true, characterData: true, subtree: true });
  fix(document.body);
})();
// Яку епоху зараз показуємо: справжню або ту, що користувач переглядає (лише вигляд, прогрес не змінюється)
// Обрана минула епоха (state.activeEpoch, -1 — поточна). Заробіток, зокрема офлайн, записується в обрану епоху
// Номер епохи (0…8): окреме поле state.eid. Лічильник подорожей state.epoch росте далі (від нього ліміти й заставки), але епоха не обчислюється з нього: після Неону йде бонусна Японія (8), потім знову Відродження.
function curEpoch() { return (state.eid | 0); }
function nextEpochId(e) { return e === 7 ? 8 : e === 8 ? 0 : (e + 1) % 8; }
function previewIdx() { const a = state.activeEpoch; return ((DEV_OPEN_ALL || state.epoch >= 1) && a >= 0 && a < EPOCHS.length && a !== curEpoch()) ? a : null; }
function viewEpoch() { const p = previewIdx(); return p !== null ? p : curEpoch(); }
// Скільки монет зароблено в кожній епосі: різницю від останньої перевірки додаємо до обраної епохи
function syncEpochEarned() {
  if (state.epochSeen < 0) {                         // перший запуск після оновлення: те, що зароблено в цьому проході, — до поточної епохи
    if (state.epochEarned.every(v => v === 0)) state.epochEarned[curEpoch()] = Math.floor(Math.max(0, state.totalEarned - state.runStartEarned));
    state.epochSeen = state.totalEarned; return;
  }
  const d = state.totalEarned - state.epochSeen;
  if (d > 0) { const i = viewEpoch() % EPOCHS.length; state.epochEarned[i] = (state.epochEarned[i] || 0) + d; }
  state.epochSeen = state.totalEarned;
}
function coinSprite() { return 'coin_' + (viewEpoch() % EPOCH_COIN_ROWS.length); }
function gemSprite() { return 'gem_' + (viewEpoch() % EPOCH_COIN_ROWS.length); }
function refreshCoinIcon() {
  const g = ui.coinIcon.getContext('2d');
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, 8, 8);
  g.drawImage(getSpriteCanvas(coinSprite()), 0, 0);
}

