// ЗРАЗОК першого платного набору «Плюшеві костюми» (дракон, єдиноріг, панда, тигр). У гру ще НЕ входить: чекає «окей».
// Після «окей»: перенести в src/100_d, додати в кінець SKIN_POOL і в SKIN_PAID, тексти в 6 мовах, репліки SKIN_LINES.
Object.assign(PALETTE, {
  'i': '#7fd858', 'Z': '#4fb048', 'U': '#2f8640', '+': '#f2d45c', '=': '#d9ae3f', '$': '#ef7d2e', '!': '#c9551f', '?': '#fff0b0', '~': '#8a5fd0', '^': '#6a43a8',
  '<': '#ffffff', '>': '#f1e6ff', '/': '#d3c1ef', '_': '#ffd9ec', ':': '#ff6b8a', ';': '#ffb14a', '[': '#ffe45c', ']': '#7fe07a', '{': '#5ac8f0', '}': '#a77bf0', '|': '#ffe27a', '`': '#d9a93a',
  '"': '#eef1f5', "'": '#c5ccd8', ',': '#2b2d38', '-': '#4a4e5e',
  '(': '#ffb347', ')': '#f08a24', '0': '#c96a14', 'Ѡ': '#2b2230', 'Є': '#fff3da', 'Ї': '#ecd9b4'
});
function makeCapyOnesieRows(kind) {
  const W = 38, H = 24;
  const grid = Array.from({ length: H }, (_, y) => (y < 3 ? Array(W).fill('.') : (CAPY_BASE[y - 3] + '.'.repeat(W - 27)).split('')));
  const at = (x, y) => (grid[y] ? grid[y][x] : undefined);
  const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (y >= 0 && y < H && x >= 0 && x < W) grid[y][x] = c; };
  const art = (x0, y0, rows) => rows.forEach((r, j) => r.split('').forEach((c, i) => { if (c !== '.') put(x0 + i, y0 + j, c); }));
  const face = (x, y) => Math.pow((x - 5.5) / 7.2, 2) + Math.pow((y - 10.6) / 4.9, 2) < 1;
  const T = { dragon: ['i', 'Z', 'U', '+', '='], unicorn: ['<', '>', '/', '_', '_'], panda: ['<', '"', "'", '<', '"'], tiger: ['(', ')', '0', 'Є', 'Ї'] }[kind];
  // костюм по всьому тілу: обличчя лишається своє, навколо нього край капюшона
  for (let y = 3; y < H; y++) for (let x = 0; x < 28; x++) {
    const c = at(x, y);
    if (c !== 'B' && c !== 'L' && !(c === 'M' && (y < 7 || y > 19))) continue;
    if (face(x, y)) continue;
    const belly = Math.pow((x - 15.5) / 8.6, 2) + Math.pow((y - 19.6) / 4.2, 2) < 1 && y >= 15;
    const tone = belly ? (y >= 19 ? T[4] : T[3]) : (y <= 9 || (x <= 16 && y <= 11)) ? T[0] : (y >= 17 || x >= 25) ? T[2] : T[1];
    put(x, y, tone);
  }
  for (let y = 3; y < 17; y++) for (let x = 0; x < 16; x++) if (face(x, y) && !face(x + 1, y) && at(x + 1, y) !== 'O' && at(x, y) !== 'O' && at(x, y) !== 'K') put(x + 1, y, T[2]);   // край капюшона
  for (let x = 2; x < 13; x++) for (let y = 3; y < 9; y++) if (face(x, y) && !face(x, y - 1) && at(x, y - 1) !== 'O' && at(x, y) !== 'K') put(x, y - 1, T[2]);
  // лапи
  [[11, 12, 13], [21, 22, 23]].forEach(xs => xs.forEach(x => { for (let y = 20; y <= 22; y++) if (at(x, y) === 'M') put(x, y, T[2]); }));
  const topOf = x => { for (let y = 0; y < H; y++) if (at(x, y) !== '.') return y; return H; };
  const outline = () => { const add = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) !== '.' && at(x, y) !== 'O') [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (at(x + dx, y + dy) === '.') add.push([x + dx, y + dy]); }); add.forEach(([x, y]) => put(x, y, 'O')); };
  const tail = (x0, y0, len, drop, th0, cols) => { for (let i = 0; i <= len; i++) { const t = i / len, x = x0 + i, cy = y0 + drop * t - Math.sin(t * 3.1) * 2.2, th = th0 * (1 - t * 0.7); for (let y = Math.round(cy - th); y <= Math.round(cy + th); y++) put(x, y, typeof cols === 'function' ? cols(i, y - cy) : cols); } };
  if (kind === 'dragon') {
    for (let x = 15; x <= 25; x += 3) { const y = topOf(x); art(x - 1, y - 2, ['.$.', '$!$'].map(s => s)); put(x, y, '$'); }           // гребінь на спині
    art(2, 2, ['.?', '?`', '?`']); art(8, 1, ['.?', '?`', '?`', '?`']);                                                                  // ріжки
    tail(26, 14, 8, 3, 2.1, (i, d) => (d < -0.6 ? 'i' : d > 0.8 ? 'U' : 'Z'));
    art(33, 13, ['.$.', '$$$', '.$!', '..!']);
    for (let y = 10; y <= 14; y++) for (let x = 15; x <= 21; x++) { const k = (x - 15) + Math.abs(y - 12) * 1.4; if (k < 6.4) put(x, y - 1, (x + y) % 3 === 0 ? '^' : '~'); }  // крильце
    for (let x = 11; x <= 20; x += 3) for (let y = 16; y <= 21; y++) if (at(x, y) === '+' || at(x, y) === '=') { if (y % 2 === 0) put(x, y, '='); }
  } else if (kind === 'unicorn') {
    art(4, 0, ['...|', '..|`', '..|.', '.|`.', '.|..']);                                                                                // ріг
    const rb = [':', ';', '[', ']', '{', '}'];
    for (let x = 9; x <= 23; x++) { const y = topOf(x); const c = rb[Math.floor((x - 9) / 2.5) % 6]; put(x, y, c); put(x, y + 1, c); if (x % 2) put(x, y + 2, c); }   // грива
    art(10, 2, ['.<<.', '<__<', '<__<']);                                                                                                // вушко
    tail(26, 13, 8, 5, 2.6, (i, d) => rb[Math.min(5, Math.max(0, Math.floor(d + 3)))]);
    [[17, 12], [21, 15], [14, 16]].forEach(([x, y]) => { put(x, y, '|'); put(x + 1, y, '`'); put(x, y + 1, '`'); });                      // зірочки
  } else if (kind === 'panda') {
    art(1, 3, [',,,.', ',-,,', ',,,,']); art(10, 2, ['.,,,', ',,-,', ',,,,']);                                                           // чорні вушка
    for (let y = 10; y <= 22; y++) for (let x = 7; x <= 14; x++) if (at(x, y) !== 'O' && at(x, y) !== '.' && !face(x, y) && (y >= 15 || x >= 9)) { if (x + (y >= 15 ? 0 : y - 10) <= 16 && (y <= 14 || x <= 13)) put(x, y, y < 13 ? ',' : '-'); }
    for (let y = 18; y <= 22; y++) for (let x = 7; x <= 26; x++) { const c = at(x, y); if (c !== 'O' && c !== '.' && (x <= 14 || x >= 19)) put(x, y, y <= 19 ? '-' : ','); }
    tail(26, 15, 3, 1, 1.4, ',');
  } else if (kind === 'tiger') {
    art(1, 3, [')))', '(_)', ')))']); art(10, 2, ['.))).', ')(_)', ')))']);                                                              // вушка
    for (let x = 15; x <= 25; x += 3) { const y = topOf(x) + 1; for (let k = 0; k < 4; k++) { const c = at(x - (k >> 1), y + k); if (c === '(' || c === ')' || c === '0') put(x - (k >> 1), y + k, 'Ѡ'); } }  // смуги на спині
    [[9, 16], [12, 19], [24, 15]].forEach(([x, y]) => { for (let k = 0; k < 3; k++) { const c = at(x + k, y); if (c === '(' || c === ')' || c === '0') put(x + k, y, 'Ѡ'); } });
    art(7, 5, ['Ѡ.Ѡ', 'Ѡ.Ѡ']); put(2, 7, 'Ѡ');                                                                                            // смужки на капюшоні
    tail(26, 14, 8, 2, 1.6, (i, d) => (i % 3 === 2 ? 'Ѡ' : d < -0.5 ? '(' : ')'));
  }
  outline();
  let maxX = 26; grid.forEach(r => r.forEach((c, x) => { if (c !== '.' && x > maxX) maxX = x; }));
  return grid.map(row => '.' + row.slice(0, maxX + 1).reverse().join(''));     // як у решти скінів: мордою вправо
}
['dragon', 'unicorn', 'panda', 'tiger'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapyOnesieRows(k), variants: { blink: { K: PALETTE.B } } }; });
