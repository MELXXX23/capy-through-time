//#part 100_d_capy_coins_epoch_state.js
SPRITES.capy_pirate = { rows: makeCapySkinRows('pirate') };
SPRITES.capy_astro = { rows: makeCapySkinRows('astro'), variants: { blink: { K: PALETTE.B } } };
['wizard', 'chef', 'explorer', 'detective', 'sailor', 'santa', 'witch', 'flower', 'beach', 'autumn'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapySkinRows(k), variants: { blink: { K: PALETTE.B } } }; });   // незалежні від епохи скіни Капі
// Нові скіни Капі (затінені еліпсами, плащі й шарфи вигнуті): лицар, супергерой, ковбой, фея, вікінг, пілот
Object.assign(PALETTE, { '1': '#f1f5fb', '2': '#aab7cb', '3': '#6f7f9a', '4': '#454f69', '5': '#9a3326', '6': '#ec8a6e', '7': '#e3b04b', '8': '#b57a1f', '9': '#7a5a3a', '@': '#5a3d28', '#': '#c9a678', '%': '#e8d3a0', '&': '#3a6fb0', '*': '#8fc1f0', 'Ґ': '#e2403a', 'Ж': '#a82a30', 'Щ': '#ff9478', 'Ч': '#74182a', 'Ш': '#d9e2ef', 'Э': '#8b97ab', 'Я': '#5b6780', 'Ю': '#3a4358', 'Ь': '#e8d9ff', 'Ц': '#bfa8f0', 'Ф': '#ffe8f2', 'Л': '#b5482e', 'Д': '#f4a13a' });
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
    // лати: світло зліва-згори, блиск на наплічнику, синій табард із гербом, щит на спині, шолом із забралом і плюмажем
    const neckX = y => 14 - (y - 9) * 0.85;
    for (let y = 9; y <= 19; y++) for (let x = 5; x <= 26; x++) if (isFur(x, y) && x >= neckX(y)) put(x, y, y <= 10 ? '1' : y >= 18 || x >= 25 ? 'Я' : (x + y) % 9 === 0 ? 'Ш' : y >= 16 ? 'Э' : 'Ш');
    for (let x = 12; x <= 25; x += 4) for (let y = 10; y <= 19; y++) if (at(x, y) === 'Ш' || at(x, y) === 'Э') put(x, y, 'Э');       // стики пластин
    rect(13, 20, 11, 19, '&'); rect(13, 20, 11, 11, '*'); rect(13, 13, 11, 18, '*'); rect(20, 20, 12, 19, 'n'); rect(13, 20, 19, 19, 'n');   // табард
    art(15, 12, ['..y..', 'yyyyy', '..y..', '..y..', '..7..']);                                                     // золотий хрест
    for (let x = 7; x <= 12; x++) if (at(x, 17) !== '.' && at(x, 17) !== 'O') put(x, 17, '7');
    ell(11.5, 10.5, 3.2, 2.8, ['1', 'Ш', 'Э'], true);                                                                // наплічник
    // щит на спині
    art(20, 3, ['rrrrrr', 'r6rr5r', 'ryyyy5', 'r6yr5r', '.r6r5.', '..r5..']);
    ell(8.2, 5.8, 7, 3.9, ['1', 'Ш', 'Э'], true, 2, 7);                                                              // шолом
    rect(2, 14, 7, 7, 'Я'); rect(2, 14, 6, 6, 'Э'); rect(3, 5, 6, 6, 'Ш'); rect(3, 8, 7, 7, 'k'); rect(9, 9, 6, 7, 'Э');   // забрало
    art(6, 0, ['.66r.', '6rrr5', '.rr5.']); art(11, 2, ['r5', '.5']);                                                 // плюмаж
    for (let y = 20; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y) || (at(x, y) === 'M' && y >= 21)) put(x, y, y === 20 ? 'Ш' : y === 21 ? 'Э' : 'Я');
    outlineAll('1ШЭЯ&*n7y56rR', 'O');
  } else if (kind === 'hero') {
    // костюм на все тіло з природним коміром (не прямокутна попона), плащ намальований вручну: хвиля, складки, поділ (р. 78)
    const suitFrom = y => 14 - (y - 9) * 0.85;
    for (let y = 9; y <= 19; y++) for (let x = 6; x <= 26; x++) if (isFur(x, y) && x >= suitFrom(y)) put(x, y, y === 9 ? '*' : (x >= 25 || y >= 18) ? 'n' : x >= 23 || y >= 16 ? '&' : y <= 11 ? '*' : '&');
    for (let y = 10; y <= 16; y++) { const x = Math.ceil(suitFrom(y)); if (at(x, y) === '&' || at(x, y) === '*') put(x, y, 'S'); }      // світла окантовка коміра
    art(14, 12, ['..y..', '.y6y.', 'y6r6y', '.y6y.', '..y..']);                                                                     // емблема на грудях
    for (let x = 8; x <= 26; x++) if (at(x, 18) === '&' || at(x, 18) === 'n' || at(x, 18) === 'S') put(x, 18, x % 2 ? '7' : '8');
    art(20, 18, ['yy']);                                                                                                             // пояс із пряжкою
    for (let y = 20; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y)) put(x, y, y === 20 ? '6' : y === 21 ? 'r' : '5');    // чоботи
    for (let y = 7; y <= 10; y++) for (let x = 3; x <= 13; x++) if (isFur(x, y) || at(x, y) === 'K') put(x, y, 'z');             // маска
    put(2, 8, 'z'); put(14, 7, 'z'); put(15, 6, 'z');                                                                               // зав'язки маски
    art(6, 8, ['wwww', 'wKK.']);                                                                                                     // око в прорізі
    art(13, 5, [
      '........ЩЩЩЩЩЩ...........',
      '.....ЩЩЩҐҐҐҐҐҐҐЩЩ........',
      '..ЩЩҐҐҐҐҐҐҐҐҐҐҐҐҐҐЩЩ.....',
      'ЩЩҐҐҐҐҐҐЖЖҐҐҐҐҐҐҐҐҐҐЩЩЩ..',
      'ҐҐҐҐҐЖЖЖЖҐҐҐҐҐҐЖЖҐҐҐҐҐҐЩЩ',
      '.ҐҐҐҐҐҐҐҐҐҐҐҐЖЖЖЖҐҐҐҐҐҐҐҐ',
      '...ЧЧЧЧҐҐҐҐҐҐҐҐҐҐҐҐҐЖЖҐҐҐ',
      '......ЧЧЧЧЧҐҐҐҐҐҐҐҐЖЖЖЖҐҐ',
      '...........ЧЧЧЧҐҐҐҐҐҐҐҐЖЖ',
      '...............ЧЧҐҐҐҐҐҐҐҐ',
      '..................ЧҐҐҐҐЧҐ',
      '....................ЧЧЧ.Ч',
      '.....................Ч..Ч'
    ]);
    art(12, 8, ['yy', '77']);                                                                                                        // золота застібка на шиї
    outlineAll('ҐЖЩЧrR56z&n*7yS8', 'O');
  } else if (kind === 'cowboy') {
    // шкіряний жилет на світлій сорочці, джинси, червона бандана, зірка шерифа, капелюх із широкими крисами й ласо на спині
    const neckX = y => 14 - (y - 9) * 0.85;
    for (let y = 9; y <= 19; y++) for (let x = 5; x <= 26; x++) if (isFur(x, y) && x >= neckX(y)) put(x, y, y >= 16 ? (y === 19 || x >= 24 ? 'n' : '&') : y === 9 ? '%' : x >= 16 ? (x >= 24 ? '@' : 'b') : '%');
    for (let y = 10; y <= 15; y++) if (at(16, y) === 'b') put(16, y, '#');                                          // край жилета
    for (let x = 7; x <= 25; x++) if (at(x, 15) !== '.' && at(x, 15) !== 'O') put(x, 15, '@'); art(13, 15, ['y7']);  // пояс
    art(18, 11, ['..y..', 'yy7yy', '.yyy.', '.y.y.']);                                                              // зірка шерифа
    art(5, 13, ['rrrrr', 'rwrwr', '.rrr.', '..r..']); put(4, 13, 'r'); put(10, 13, 'r');
    for (let y = 20; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y) || (at(x, y) === 'M' && y >= 21)) put(x, y, y <= 21 ? '&' : '@');
    ell(8.3, 4.2, 4.6, 3.6, ['%', '#', '9'], true, 0, 5);                                                           // тулія
    rect(4, 12, 4, 4, '@'); put(8, 4, '7'); put(9, 4, '7');
    for (let x = -1; x <= 17; x++) { const t = (x - 8) / 9, y = 5 + t * t * -2.2 + 2.2; put(x, y, x < 8 ? '%' : '#'); put(x, y + 1, '9'); }
    put(-1, 4, '#'); put(17, 4, '9');
    outlineAll('%#9@bd&nry7', 'O');
  } else if (kind === 'gold' || kind === 'diamond') {
    const fur0 = grid.map(r => r.map(c => c === 'B' || c === 'L'));
    const fm = (x, y) => !!(fur0[y] && fur0[y][x]);
    if (kind === 'gold') {
      // золотий зливок у формі Капі (р. 78): чисті тони металу, широкий косий блиск, темні складки внизу, без дрібних цяток
      dye(0, 26, 0, 23, (x, y) => {
        if (!fm(x, y - 1) || !fm(x - 1, y)) return 'y';
        if (!fm(x, y + 1) || !fm(x + 1, y)) return '8';
        const band = (x + y * 0.6 - 13) % 15; if (band >= 0 && band < 2.4) return 'w';
        if (y >= 18 || x >= 24) return '7';
        return (x + y) % 19 === 0 ? 'y' : 'h';
      });
      for (let y = 0; y < H; y++) for (let x = 0; x <= 26; x++) { const ch = at(x, y); if (ch === 'M') put(x, y, y < 8 ? '7' : y < 16 ? '7' : '8'); }
      put(2, 10, '9'); put(1, 10, '9');                                                                                  // ніздря
      art(5, 0, ['y..y..y.', 'yyyyyyyy', 'y7y6y7yy', '88888888']); put(8, 2, 'N'); put(5, 2, 'J'); put(12, 2, 'J');
      outlineAll('yh78w', 'O');
    } else {
      // кришталева Капі (р. 78): тіло огранене трикутниками (світло зліва-згори, темніше до низу), голова гладша, темно-синій контур замість коричневого
      const SEED = [[4, 8, 'S'], [9, 6, '1'], [13, 8, 'a'], [8, 12, 'S'], [13, 13, 's']];
      const face = (x, y) => { let bi = 0, bd = 1e9; SEED.forEach((p, i) => { const q = Math.pow(p[0] - x, 2) + Math.pow(p[1] - y, 2) * 1.25; if (q < bd) { bd = q; bi = i; } }); return bi; };
      const TONE = ['1', 'S', 'a', 's', '*', '&'], CELL = 4;
      const facet = (x, y) => { const u = Math.floor(x / CELL), v = Math.floor(y / CELL), tri = (x % CELL) + (y % CELL) < CELL ? 0 : 1, k = Math.imul(u * 7 + v * 13 + tri * 5 + 3, 2654435761) >>> 0, r = (k >>> 8) % 100 / 100; if ((k >>> 16) % 11 === 0) return 'N'; const l = 0.55 * (y - 9) / 11 + 0.45 * (x - 13) / 13 + (r - 0.5) * 1.05; return TONE[Math.max(0, Math.min(5, Math.floor((l + 0.15) * 4.6)))]; };
      for (let y = 0; y < H; y++) for (let x = 0; x <= 26; x++) {
        if (!fm(x, y)) continue;
        if (x >= 14 || y >= 16) { put(x, y, facet(x, y)); continue; }
        const i = face(x, y), t0 = SEED[i][2], edge = face(x - 1, y) !== i || face(x, y - 1) !== i;
        put(x, y, edge && (t0 === '1' || t0 === 'S' || t0 === 'a') ? '1' : t0);
      }
      for (let y = 0; y < H; y++) for (let x = 0; x <= 26; x++) { const ch = at(x, y); if (ch === 'M') put(x, y, y < 8 ? 's' : y < 16 ? 'a' : '&'); else if (ch === 'O') put(x, y, 'z'); }
      put(2, 10, 'n'); put(1, 10, 'z'); put(3, 13, 's'); put(2, 13, 's'); put(1, 13, 's');                                              // ніздря й тінь під мордочкою
      put(7, 8, '1'); put(8, 8, 'z'); put(7, 9, 'K'); put(8, 9, 'K');                                                                    // око з блиском
      art(5, 0, ['...N....', 'N..N..N.', 'N1N1N1N.', 'SaSaSaS.']); put(8, 1, 'w');                                                       // корона
      outlineAll('NaS1sw*&', 'z');
    }
  } else if (kind === 'fairy') {
    // сукня з фігурним подолом, чисті прозорі на вигляд крила (дві пари, світла кромка, жилки), корона й чарівний пилок
    art(15, 0, [
      '..........ЬЬЬ.',
      '.......ЬЬЦЦЦЬ.',
      '....ЬЬЦЦqЦЦЦЬ.',
      '..ЬЦЦqqЦЦЦwЦЬ.',
      '.ЬЦqqЦЦЦЦwwЦ..',
      'ЬЦqЦЦЦЦЦЦЦЬЬ..',
      'ЬqЦЦЦЬЬЬЬЬ....',
      '.ЬЬЬЬ.........'
    ]);
    art(21, 8, [
      'ЬФФФФЬЬ...',
      '.ЬФФqФФФЬЬ',
      '..ЬФФqqФФЬ',
      '...ЬЬФФwФЬ',
      '.....ЬЬФЬ.',
      '.......Ь..'
    ]);
    const neckX = y => 14 - (y - 9) * 0.85;
    for (let y = 9; y <= 19; y++) for (let x = 5; x <= 26; x++) if (isFur(x, y) && x >= neckX(y)) put(x, y, y === 9 ? 'w' : y <= 12 ? 'q' : y <= 15 ? 'p' : y <= 17 ? 'f' : 'p');
    for (let x = 7; x <= 26; x++) { if (at(x, 19) !== '.' && at(x, 19) !== 'O') put(x, 19, x % 2 ? 'f' : 'w'); if (at(x, 18) !== '.' && at(x, 18) !== 'O') put(x, 18, x % 2 ? 'p' : 'f'); }
    art(16, 11, ['..y..', '.y7y.', '..y..']); for (let k = 0; k < 7; k++) put(10 + k * 2, 14, 'w');
    art(4, 3, ['.y.y.y.', '.y7y7y.', '..y6y..']); put(7, 2, 'w'); put(6, 1, 'y');
    [[3, 1], [20, 8]].forEach(([x, y]) => { put(x, y, 'y'); put(x - 1, y, 'w'); put(x + 1, y, 'w'); put(x, y - 1, 'w'); put(x, y + 1, 'w'); });
    outlineAll('ЬЦФqpfw', 'u');
    outlineAll('y7', 'O');
  } else if (kind === 'viking') {
    // хутряний комір, тканий пояс, круглий щит із чотирма секторами й залізним умбоном, рогатий шолом і руда борода
    const neckX = y => 14 - (y - 9) * 0.85;
    for (let y = 9; y <= 19; y++) for (let x = 5; x <= 26; x++) if (isFur(x, y) && x >= neckX(y)) put(x, y, y <= 11 ? ((x + y) % 2 ? 'w' : 'E') : y === 12 ? (x % 2 ? 'E' : 'e') : y >= 17 || x >= 25 ? '@' : y >= 15 ? 'b' : 'l');
    for (let x = 7; x <= 26; x++) if (at(x, 16) !== '.' && at(x, 16) !== 'O') put(x, 16, x % 3 ? '@' : '7'); art(17, 15, ['77', '88']);
    for (let y = 2; y <= 12; y++) for (let x = 16; x <= 27; x++) { const dx = x - 21.5, dy = y - 7, d = dx * dx + dy * dy; if (d > 24) continue; put(x, y, d > 16 ? '7' : d <= 2 ? 'Ш' : ((dx < 0) === (dy < 0)) ? 'r' : 'w'); }   // щит
    put(21, 6, '1'); put(21, 7, 'Э'); put(22, 7, 'Я');
    outlineAll('7rwШЭЯ1', 'O');
    ell(8.2, 5.8, 7, 3.9, ['Y', 'E', 'e'], true, 2, 7);
    rect(2, 14, 6, 6, '7'); rect(2, 14, 7, 7, '8'); put(8, 7, '7'); put(8, 6, '1'); rect(1, 15, 5, 5, 'e');
    art(0, 0, ['w..', 'ww.', '.ww', '.ww', '..w']); art(13, 0, ['..w', '.ww', 'ww.', 'ww.', 'w..']);                  // роги
    // борода
    art(3, 14, ['oooooo', 'ojjjjo', 'ojjAjo', '.ojjo.', '.oAo..', '..o...']);
    for (let y = 20; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y) || (at(x, y) === 'M' && y >= 21)) put(x, y, y <= 21 ? 'b' : '@');
    outlineAll('wYEe7oj@blA', 'O');
  } else if (kind === 'pilot') {
    // шкірянка з овчинним коміром, крильця-значок, довгий шарф, шолом з окулярами
    for (let x = 13; x <= 34; x++) { const t = (x - 13) / 21, cy = 9 - t * 3 + Math.sin(t * 7) * 1.3 * t; for (let k = 0; k < 3; k++) put(x, cy + k, Math.floor(x / 3) % 2 ? 'w' : 'r'); put(x, cy + 2, Math.floor(x / 3) % 2 ? 'E' : '5'); }
    const neckX = y => 14 - (y - 9) * 0.85;
    for (let y = 9; y <= 19; y++) for (let x = 5; x <= 26; x++) if (isFur(x, y) && x >= neckX(y)) put(x, y, y >= 18 || x >= 24 ? '@' : y <= 11 ? '#' : y === 16 ? 'd' : '9');
    for (let y = 10; y <= 15; y++) if (at(19, y) === '#' || at(19, y) === '9') put(19, y, '@');
    art(14, 12, ['yy.yy', '.yyy.']);                                                                                // значок-крильця
    art(21, 13, ['b', 'b']); put(16, 16, 'y'); put(17, 16, 'y');
    for (let x = 9; x <= 14; x++) { put(x, 9 + Math.max(0, 12 - x), 'w'); put(x, 10 + Math.max(0, 12 - x), x % 2 ? 'E' : 'w'); }   // овчинний комір
    ell(8.3, 5.6, 6.8, 4.4, ['#', 'b', '@'], true, 1, 7);
    rect(2, 14, 7, 7, '@'); rect(2, 4, 8, 9, '@');
    put(3, 9, 'd'); put(13, 8, '@'); put(14, 8, '@'); put(14, 9, '@');
    ell(5.5, 4.8, 2.2, 1.9, ['y', 'h', '8'], true); ell(5.5, 4.8, 1.3, 1.1, ['1', 'a', '*'], true);
    ell(10.5, 4.8, 2.2, 1.9, ['y', 'h', '8'], true); ell(10.5, 4.8, 1.3, 1.1, ['1', 'a', '*'], true);
    rect(7, 9, 5, 5, 'd');
    for (let y = 20; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y) || (at(x, y) === 'M' && y >= 21)) put(x, y, y <= 21 ? 'd' : 'k');
    outlineAll('#b9@hy8wEr5kd', 'O');
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

  // костюм на все тіло (р. 78): не прямокутна попона, а вся шерсть за лінією шиї; rows — кольори рядків 9…17, далі подовжуємо до живота
  const neckX = y => 14 - (y - 9) * 0.85;
  const suit = (rows, rim, dark) => { for (let y = 9; y <= 19; y++) for (let x = 5; x <= 26; x++) if (isFur(x, y) && x >= neckX(y)) { let c = y <= 16 ? rows[y - 9] : y === 19 ? rows[8] : rows[7]; if (dark && x >= 24 && y >= 11) c = dark; put(x, y, c); } if (rim) for (let y = 10; y <= 17; y++) { const x = Math.ceil(neckX(y)); if (at(x, y) !== '.' && at(x, y) !== 'O') put(x, y, rim); } };
  const boots = (a1, a2) => { for (let y = 20; y <= 23; y++) for (let x = 0; x < 27; x++) if (isFur(x, y) || (at(x, y) === 'M' && y >= 21)) put(x, y, y <= 21 ? a1 : a2); };
  const cone = (spec, cols) => { spec.forEach(([y, x0, x1]) => { for (let x = x0; x <= x1; x++) put(x, y, x - x0 < 2 ? cols[0] : (x1 - x < 2 ? cols[2] : cols[1])); }); };
  const plus = (x, y, petal, mid) => { put(x, y, mid); put(x - 1, y, petal); put(x + 1, y, petal); put(x, y - 1, petal); put(x, y + 1, petal); };

  if (kind === 'pirate') {
    suit(['h', 'r', 'r', 'r', 'r', 'r', 'r', 'R', 'h'], 'h', 'R');
    for (let x = 6; x <= 25; x++) if (at(x, 15) === 'r' || at(x, 15) === 'R' || at(x, 15) === 'h') put(x, 15, 'k');
    art(16, 14, ['hhh', 'hkh', 'hhh']);                                                                         // чорний пояс із пряжкою
    [11, 13].forEach(y => { put(16, y, 'h'); put(20, y, 'h'); put(24, y, 'h'); });                              // золоті ґудзики
    art(9, 11, ['.ww', 'wwE', 'wEw', '.wE']);                                                                   // жабо
    boots('k', 'k'); put(11, 21, '4'); put(21, 21, '4');
    art(18, 1, ['...rr.', '..rkrr', '.yrrr.', 'yy.ggg', '...gmgg', '...gmgG', '....gGG', '....h.h']);            // папуга: червона голова, зелене тіло, жовтий дзьоб, лапки на спині
    ell(8.2, 4.6, 7.4, 3.6, ['4', 'k', 'k'], true, 0, 6);                                                        // трикутний капелюх
    rect(1, 15, 6, 6, 'k'); rect(0, 16, 7, 7, 'k'); put(-1, 6, 'k'); put(17, 6, 'k'); put(-1, 5, 'k'); put(17, 5, 'k'); rect(1, 15, 6, 6, 'h'); rect(3, 4, 6, 6, 'y');
    art(6, 2, ['.ww.', 'wkkw', '.ww.', '.w.w']);                                                                 // череп
    rect(6, 8, 8, 10, 'k'); put(5, 8, 'k'); put(4, 7, 'k'); put(9, 9, 'k'); put(10, 9, 'k'); put(11, 8, 'k'); put(7, 9, '4');   // пов'язка на оці
    put(13, 12, 'h'); put(13, 13, 'y');                                                                          // сережка
    outlineAll('rRPkh4wnyEgmGo', 'O');
  } else if (kind === 'astro') {
    suit(['1', '1', '1', 'Ш', 'Ш', 'Ш', 'Ш', 'Э', 'Я'], '1', 'Э');
    rect(13, 18, 11, 14, 'Я'); rect(13, 18, 11, 11, 'Ю'); put(14, 12, 'r'); put(16, 12, 'y'); put(14, 13, 'N'); put(16, 13, 'o'); put(18, 12, 'w');   // панель на грудях
    art(21, 11, ['nnn', 'wrw', 'nnn']);                                                                           // прапорець
    for (let x = 7; x <= 25; x++) if (at(x, 16) !== '.' && at(x, 16) !== 'O') put(x, 16, x % 3 ? 'r' : '5');      // червоний пояс
    rect(18, 24, 3, 8, 'Ш'); rect(18, 24, 3, 3, '1'); rect(24, 24, 4, 8, 'Э'); rect(18, 24, 8, 8, 'Э'); rect(20, 22, 5, 6, 'Я'); put(21, 5, 'N'); put(21, 6, 'o');   // ранець
    glass('a');
    [[6, 2], [7, 1], [4, 3]].forEach(q => put(q[0], q[1], 'w')); put(11, 2, 'w');
    art(10, 0, ['d', 'd']); put(10, 0, 'r');
    boots('Ш', 'Э');
    outlineAll('1w23E4rynodШЭЯЮ5', 'O');
  } else if (kind === 'wizard') {
    suit(['v', 'v', 'u', 'u', 'u', 'P', 'P', 'P', 'y'], 'y', 'V');
    [[16, 11], [20, 13], [23, 11], [17, 15], [22, 15], [25, 13], [13, 13]].forEach(q => put(q[0], q[1], 'y')); put(20, 12, 'w'); put(20, 14, 'w'); put(19, 13, 'w'); put(21, 13, 'w');
    for (let x = 8; x <= 25; x++) if (at(x, 16) !== '.' && at(x, 16) !== 'O') put(x, 16, x % 2 ? 'h' : 'y');       // мотузяний пояс
    beard(['1', 'w', 'E']);   // борода
    cone([[6, 2, 15], [5, 3, 14], [4, 4, 13], [3, 5, 12], [2, 7, 13], [1, 10, 14], [0, 12, 15]], ['v', 'u', 'P']);
    rect(0, 16, 7, 7, 'P'); rect(1, 15, 7, 7, 'u'); rect(0, 16, 7, 7, 'P'); rect(2, 14, 6, 6, 'h'); put(7, 6, 'y'); put(8, 6, 'w'); put(6, 6, 'y');
    put(7, 4, 'y'); put(10, 3, 'y'); put(9, 5, 'w'); sparkle(14, 1, 'y');
    outlineAll('vuPVyhw1E', 'O');
  } else if (kind === 'chef') {
    suit(['1', 'w', 'w', 'w', 'w', 'w', 'w', 'E', 'E'], '1', 'E');
    [11, 13, 15].forEach(y => { put(14, y, 'k'); put(17, y, 'k'); });                                             // подвійний ряд ґудзиків
    for (let y = 10; y <= 19; y++) if (at(19, y) === 'w' || at(19, y) === 'E' || at(19, y) === '1') put(19, y, 'E');
    art(7, 14, ['rrrrrr', '.rwrr.', '..rr..']); [[7, 15], [12, 15], [8, 16], [11, 16], [9, 17], [10, 17]].forEach(q => put(q[0], q[1], 'O'));
    art(3, 0, [
      '..1111.1111.',
      '.1wwwwwwwwwE',
      '1wwwwwwwwwwE',
      '1wwEwwwEwwwE',
      '1wwEwwwEwwwE',
      '.1wEwwwEwwE.',
      '.wwwwwwwwwE.',
      '.EEEEEEEEEE.'
    ]);
    outlineAll('1wEclyn', 'O');
  } else if (kind === 'explorer') {
    suit(['%', '%', '#', '#', '#', '#', '#', '#', '9'], '%', '9');
    art(14, 11, ['9999', '9##9', '9999']); art(20, 11, ['9999', '9##9', '9999']); put(15, 11, 'h'); put(21, 11, 'h');  // кишені
    for (let x = 7; x <= 25; x++) if (at(x, 15) !== '.' && at(x, 15) !== 'O') put(x, 15, 'b'); art(17, 15, ['hh']);     // пояс
    art(7, 14, ['GGGGGG', '.GmGG.', '..GG..']); [[7, 15], [12, 15], [8, 16], [11, 16], [9, 17], [10, 17]].forEach(q => put(q[0], q[1], 'O'));   // зелена хустка
    art(18, 3, ['.GGGGGG.', 'GggggmmG', 'GggggggG', 'GbbGGbbG', 'GggggggG', '.GGGGGG.']); put(22, 2, 'b'); put(23, 2, 'b');   // рюкзак зі смужками
    boots('@', 'b');
    ell(8.2, 5.2, 7.2, 3.6, ['1', '%', '#'], true, 1, 7);                                                          // світлий тропічний шолом
    rect(0, 16, 7, 7, '#'); rect(1, 15, 6, 6, 'b'); put(8, 1, '1'); [4, 12].forEach(x => put(x, 3, '#')); put(8, 2, '%');
    outlineAll('%#9@1bgGmhyk', 'O');
  } else if (kind === 'detective') {
    // світлий тренч із поясом і коміром, темний капелюх, лупа на спині
    suit(['%', 'c', 'c', 'c', 'c', 'c', 'l', 'l', 'b'], '%', 'l');
    for (let x = 7; x <= 25; x++) if (at(x, 15) !== '.' && at(x, 15) !== 'O') put(x, 15, 'b'); art(16, 14, ['bhb', 'hbh', 'bhb']);
    [11, 13].forEach(y => { put(13, y, 'b'); put(16, y, 'b'); });
    art(8, 11, ['.%%%', '%%c.', '%c..']);                                                                               // комір
    art(19, 1, ['.hhhh.', 'haaaah', 'ha1aah', 'haaaah', '.hhhh.', '....bb', '.....bb']);                                // лупа
    boots('b', 'd');
    ell(8.2, 4.8, 6.4, 3.2, ['9', '@', 'd'], true, 1, 6); rect(0, 16, 7, 7, 'd'); rect(2, 14, 6, 6, 'k'); put(8, 1, 'd'); put(7, 1, 'd');
    outlineAll('%clbhad1@9k', 'O');
  } else if (kind === 'sailor') {
    // біла форма, синій гюйс зі смужками, червона хустка, якір, безкозирка
    suit(['w', 'w', 'w', 'w', 'w', 'w', 'E', 'n', 'n'], '*', 'E');
    for (let y = 9; y <= 13; y++) for (let x = 12; x <= 19; x++) if (at(x, y) !== '.' && at(x, y) !== 'O' && (x - 12) + (y - 9) * 0.9 < 7) put(x, y, (x + y) % 5 === 0 ? 'w' : 'n');   // гюйс
    art(19, 13, ['.n.', 'nnn', '.n.', 'n.n', '.n.']);                                                                   // якір
    art(7, 14, ['rrrrrr', '.rwrr.', '..rr..']); [[7, 15], [12, 15], [8, 16], [11, 16], [9, 17], [10, 17]].forEach(q => put(q[0], q[1], 'O'));
    boots('n', 'z');
    ell(8.2, 4.6, 6.4, 2.8, ['w', 'w', 'E'], true, 1, 6); rect(1, 15, 6, 6, 'E'); rect(1, 15, 7, 7, 'n'); rect(0, 16, 7, 7, 'n'); art(7, 3, ['y', 'y']);
    outlineAll('wEn*rzy', 'O');
  } else if (kind === 'santa') {
    suit(['w', 'r', 'r', 'r', 'r', 'r', 'R', 'R', 'w'], 'w', 'R');
    for (let x = 6; x <= 25; x++) if (at(x, 15) !== '.' && at(x, 15) !== 'O') put(x, 15, 'k');
    art(18, 14, ['hhh', 'hkh', 'hhh']);
    beard(['1', 'w', 'E']);
    // мішок із подарунками на спині
    ell(21.5, 6.2, 4.2, 3.6, ['c', 'l', 'b'], true); rect(19, 24, 2, 2, 'd'); put(21, 1, 'r'); put(22, 1, 'r'); put(21, 0, 'g'); put(23, 1, 'y'); put(19, 6, 'c'); put(23, 8, 'b');
    boots('k', 'k');
    ell(8.2, 5.2, 7, 3.4, ['p', 'r', 'R'], true, 2, 6);
    art(13, 1, ['.rr...', '.rrrr.', '..rrrr', '....rr']); art(17, 4, ['ww', 'ww']);                                  // кінчик шапки з помпоном
    rect(1, 15, 6, 7, 'w'); rect(2, 14, 7, 7, 'E'); [3, 7, 10, 13].forEach(x => put(x, 6, 'E'));
    outlineAll('prRw1Ekhyclbd', 'O');
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
    for (let x = 7; x <= 25; x++) { if (at(x, 19) !== '.' && at(x, 19) !== 'O') put(x, 19, x % 2 ? 'q' : 'w'); if (at(x, 18) !== '.' && at(x, 18) !== 'O') put(x, 18, x % 2 ? 'w' : 'p'); }
    plus(16, 12, 'w', 'f'); plus(22, 12, 'w', 'y'); put(14, 16, 'f'); put(19, 16, 'w'); put(24, 16, 'f');
    art(17, 13, ['pp.pp']);
    art(19, 1, ['uu.k.uu', 'uvukuvu', '.uukuu.', '..u.u..']); put(20, 0, 'k'); put(24, 0, 'k');                        // метелик вище спини, окремо від тіла
    rect(2, 14, 4, 4, 'g'); rect(2, 14, 5, 5, 'G');
    plus(3, 3, 'p', 'y'); plus(6, 3, 'w', 'y'); plus(9, 3, 'u', 'y'); plus(12, 3, 'f', 'y');
    put(4, 5, 'g'); put(8, 5, 'g'); put(11, 5, 'g'); put(13, 5, 'g');
    outlineAll('wqpfmgGuyvabk', 'O');
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
    // Еко-епоха: зелене худі з листком, солом'яний капелюх із паростком, полотняна торба
    suit(['m', 'g', 'g', 'g', 'g', 'g', 'G', 'G', 'b'], 'm', 'G');
    art(14, 11, ['..m..', '.mgm.', 'mggGm', '.mGm.', '..b..']);                                                        // листок на грудях
    for (let x = 7; x <= 25; x++) if (at(x, 17) !== '.' && at(x, 17) !== 'O') put(x, 17, x % 3 ? 'b' : 'c');
    art(19, 1, ['.mg.gm.', '.mgGgm.', '..gGg..', '...G...', 'tttttt.', '.ttQt..', '.tttt..']);        // паросток у глиняному горщику
    ell(8.2, 5.3, 7, 3.6, ['%', 'c', 'l'], true, 2, 6);
    rect(0, 16, 7, 7, 'l'); rect(1, 15, 6, 6, 'c'); rect(2, 14, 5, 5, 'g'); [4, 7, 10].forEach(x => { put(x, 4, 'y'); });
    art(7, 0, ['mg.gm', '.mgm.', '..G..']);                                                                             // паросток на капелюсі
    plus(13, 3, 'f', 'y');
    boots('l', 'b');
    outlineAll('mgGbl%#9cfyNtQ', 'O');
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
    // Японія: кімоно з коміром, візерунком сакури, хвилями на подолі, рукавом-фурісоде й оби з бантом; солом'яне кацу зі шнурком і квіткою; віяло, ґета
    suit(['w', 'r', 'r', 'r', 'r', 'r', 'r', 'R', 'R'], 'w', 'R');
    for (let x = 12; x <= 18; x++) if (isFur(x, 10) || at(x, 10) === 'r') put(x, 10, 'p');              // внутрішній рожевий комір
    for (let x = 12; x <= 25; x++) { if (isFur(x, 13) || at(x, 13) === 'r') put(x, 13, 'n'); if (isFur(x, 14) || at(x, 14) === 'r') put(x, 14, 'n'); }   // оби
    for (let x = 14; x <= 24; x += 4) { put(x, 13, 'h'); put(x + 2, 14, 'h'); }                          // золота парча на поясі
    for (let x = 12; x <= 25; x++) { const a = x % 4 === 1 || x % 4 === 2; if (at(x, 16) === 'R' || at(x, 16) === 'r' || isFur(x, 16)) put(x, 16, a ? 'w' : 'R'); if (at(x, 17) === 'R' || isFur(x, 17)) put(x, 17, a ? 'R' : 'w'); }   // хвилі сейгайха на подолі
    plus(14, 11, 'q', 'y'); plus(22, 11, 'q', 'y'); put(14, 15, 'q'); put(23, 15, 'q');                  // сакура на тканині
    rect(16, 20, 11, 16, 'R'); rect(16, 16, 11, 15, 'r'); rect(16, 20, 16, 16, 'w'); put(18, 12, 'q'); put(19, 14, 'q'); put(18, 15, 'w'); put(17, 13, 'w');   // довгий рукав із білою підкладкою
    rect(24, 26, 11, 16, 'n'); put(25, 13, 'h'); put(25, 14, 'h'); put(24, 11, 'h'); art(24, 17, ['nn', 'nn', 'n.', 'n.']);   // бант оби й кінці стрічки
    art(22, 3, ['.www.', 'wrrww', 'wrrww', 'wwwww', '.www.', '..d..', '..d..']);                          // віяло-учіва з червоним колом
    // капелюх-каса: плетена солома зі світлою лівою і темною правою стороною, ґудзик угорі
    const spec = [[0, 6, 10], [1, 4, 12], [2, 3, 13], [3, 2, 14], [4, 1, 15], [5, 0, 16]];
    spec.forEach(([y, x0, x1]) => { for (let x = x0; x <= x1; x++) put(x, y, x - x0 < 2 ? 'y' : x1 - x < 2 ? 'c' : (x + y) % 3 === 0 ? 'y' : 'h'); });
    rect(7, 9, 0, 0, 'd'); rect(0, 16, 6, 6, 'l'); for (let x = 2; x <= 14; x += 3) put(x, 6, 'c');       // ґудзик і тінь від крисів
    rect(2, 14, 7, 7, 'r'); put(8, 7, 'w'); put(5, 7, 'h'); put(11, 7, 'h');                             // червона пов'язка-хатімакі з білим колом
    for (let y = 8; y <= 14; y++) put(13, y, 'r'); put(12, 15, 'r'); put(14, 15, 'r'); put(13, 16, 'r');   // шнурок під підборіддя з бантом
    plus(13, 3, 'p', 'y'); put(3, 4, 'q'); put(15, 3, 'p');                                              // сакура на капелюсі
    put(6, 10, 'p'); put(7, 10, 'p');                                                                    // рум'янець
    put(9, 21, 'r'); put(10, 21, 'r'); put(19, 21, 'r'); put(20, 21, 'r'); put(9, 22, 'w'); put(19, 22, 'w');   // ремінці ґета й таби
    outlineAll('wrRnhycldpqJ', 'O');
  }
  let maxX = 26 + ox; grid.forEach(r => r.forEach((c, x) => { if (c !== '.' && x > maxX) maxX = x; }));
  return grid.map(row => '.' + row.slice(0, maxX + 1).reverse().join(''));
}
['pirate', 'astro', 'wizard', 'chef', 'explorer', 'detective', 'sailor', 'santa', 'witch', 'flower', 'beach', 'autumn', 'ep0', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8'].forEach(k => { SPRITES['capy_' + k] = { rows: makeCapyOldDetail(k), variants: k === 'pirate' ? undefined : { blink: { K: PALETTE.B } } }; });
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
// Колір іскор і цифри «+N» при тапі в стилі монети епохи: [іскра 1, іскра 2, цифра] (літери PALETTE)
const COIN_INK = [['h', 'y', 'y'], ['T', 'w', 'T'], ['f', 'w', 'f'], ['v', 'T', 'T'], ['a', 'w', 'a'], ['g', 'm', 'm'], ['E', 'w', 'E'], ['f', 'T', 'f'], ['r', 'J', 'r']];
function coinInk() { return COIN_INK[viewEpoch() % COIN_INK.length] || COIN_INK[0]; }
function gemSprite() { return 'gem_' + (viewEpoch() % EPOCH_COIN_ROWS.length); }
function refreshCoinIcon() {
  const g = ui.coinIcon.getContext('2d');
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, 8, 8);
  g.drawImage(getSpriteCanvas(coinSprite()), 0, 0);
}

