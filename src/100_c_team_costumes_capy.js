//#part 100_c_team_costumes_capy.js
// Пакети з покупками по епохах (SHOPBAG_OPT[епоха].A() → canvas 12×16 з контуром): кошик, паперовий пакет, глітер-пакет, коробка гри, посилка, сітка з овочами, капсула, неонова торба
(function () {
  const mk = () => { const c = document.createElement('canvas'); c.width = 12; c.height = 16; return c; };
  const rc = (S, x, y, w, h, col) => { const g = S.getContext('2d'); g.fillStyle = col; g.fillRect(x, y, w, h); };
  const pxl = (S, x, y, col) => rc(S, x, y, 1, 1, col);
  const el = (S, cx, cy, rx, ry, col) => { const g = S.getContext('2d'); g.fillStyle = col; for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy <= 1) g.fillRect(x, y, 1, 1); } };
  const outl = (S, col) => { const g = S.getContext('2d'), d = g.getImageData(0, 0, 12, 16), o = g.createImageData(12, 16); const a = (x, y) => (x < 0 || y < 0 || x > 11 || y > 15) ? 0 : d.data[(y * 12 + x) * 4 + 3]; const cc = col; const rgb = [parseInt(cc.slice(1, 3), 16), parseInt(cc.slice(3, 5), 16), parseInt(cc.slice(5, 7), 16)];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 12; x++) if (!a(x, y) && (a(x + 1, y) || a(x - 1, y) || a(x, y + 1) || a(x, y - 1))) { const i = (y * 12 + x) * 4; o.data[i] = rgb[0]; o.data[i + 1] = rgb[1]; o.data[i + 2] = rgb[2]; o.data[i + 3] = 255; }
    for (let i = 0; i < d.data.length; i += 4) if (d.data[i + 3]) { o.data[i] = d.data[i]; o.data[i + 1] = d.data[i + 1]; o.data[i + 2] = d.data[i + 2]; o.data[i + 3] = 255; } g.putImageData(o, 0, 0); return S; };
  const O = '#4a3228', W = '#fff4dc';
  const E = [];
  const f = (ep, k, fn) => { (E[ep] = E[ep] || {})[k] = () => { const S = mk(); fn(S); return outl(S, O); }; };
  // 0 Відродження
  f(0, 'A', S => { rc(S, 1, 6, 10, 9, '#c98a3a'); for (let y = 6; y < 15; y++) for (let x = 1; x < 11; x++) if ((x + y) % 2) pxl(S, x, y, '#a8703f'); rc(S, 1, 6, 10, 1, '#8a5a2a'); rc(S, 2, 2, 1, 5, '#8a5a2a'); rc(S, 9, 2, 1, 5, '#8a5a2a'); rc(S, 2, 2, 8, 1, '#8a5a2a'); rc(S, 3, 3, 2, 4, '#e8b060'); el(S, 7, 5, 1.6, 1.6, '#8b6bb0'); el(S, 6, 4, 1.3, 1.3, '#8b6bb0'); pxl(S, 7, 3, '#4f9a63'); });
  // 1 Ретро
  f(1, 'A', S => { rc(S, 2, 5, 8, 10, '#d9a066'); rc(S, 2, 5, 8, 1, '#e8b87a'); rc(S, 2, 5, 1, 10, '#c48a50'); rc(S, 4, 1, 2, 5, '#e8b060'); pxl(S, 4, 1, '#f6d28a'); rc(S, 7, 2, 2, 4, '#4f9a63'); for (let k = 0; k < 5; k++) pxl(S, 3 + (k * 2) % 7, 8 + (k * 3) % 6, '#ffffff'); rc(S, 3, 12, 6, 2, '#c4553d'); });
  // 2 Диско
  f(2, 'A', S => { rc(S, 1, 5, 10, 10, '#c9d3e0'); rc(S, 1, 5, 10, 1, '#ffffff'); for (let k = 0; k < 8; k++) pxl(S, 2 + (k * 3) % 9, 7 + (k * 5) % 7, k % 2 ? '#ffffff' : '#ff5fa2'); rc(S, 1, 10, 10, 1, '#ff5fa2'); rc(S, 2, 2, 1, 4, '#ffe08a'); rc(S, 9, 2, 1, 4, '#ffe08a'); pxl(S, 5, 7, '#ffe08a'); });
  // 3 Аркади
  f(3, 'A', S => { rc(S, 1, 3, 10, 12, '#2a1d1a'); rc(S, 2, 4, 8, 6, '#3fa7a0'); rc(S, 3, 5, 6, 4, '#1b2a4a'); pxl(S, 4, 6, '#33e6ff'); pxl(S, 7, 6, '#33e6ff'); rc(S, 4, 8, 4, 1, '#33e6ff'); rc(S, 2, 11, 3, 2, '#ff5fa2'); rc(S, 7, 11, 3, 2, '#ffe08a'); });
  // 4 Інтернет
  f(4, 'A', S => { rc(S, 1, 4, 10, 11, '#d9a066'); rc(S, 1, 4, 10, 2, '#e8b87a'); rc(S, 5, 4, 2, 11, '#fff4dc'); rc(S, 1, 10, 4, 3, '#ffffff'); pxl(S, 2, 11, '#4a3228'); pxl(S, 3, 11, '#4a3228'); rc(S, 8, 8, 2, 3, '#ffffff'); pxl(S, 9, 9, '#3d5a8c'); });
  // 5 Еко
  f(5, 'A', S => { rc(S, 1, 5, 10, 10, '#c9b070'); for (let y = 5; y < 15; y++) for (let x = 1; x < 11; x++) if ((x + y) % 2) pxl(S, x, y, '#9a8040'); rc(S, 2, 2, 1, 4, '#8a6a30'); rc(S, 9, 2, 1, 4, '#8a6a30'); rc(S, 2, 2, 8, 1, '#8a6a30'); el(S, 4, 8, 1.7, 1.7, '#e8863c'); el(S, 8, 9, 1.7, 1.7, '#c4553d'); el(S, 6, 12, 1.7, 1.7, '#4f9a63'); rc(S, 6, 5, 1, 3, '#8ed4a6'); });
  // 6 Космос
  f(6, 'A', S => { rc(S, 1, 4, 10, 11, '#9c9087'); rc(S, 1, 4, 10, 1, '#cfc5b8'); rc(S, 2, 6, 8, 7, '#cfc5b8'); el(S, 6, 8, 2.2, 2.2, '#86cfe8'); pxl(S, 5, 7, '#ffffff'); rc(S, 2, 12, 8, 1, '#4a3228'); rc(S, 5, 1, 2, 3, '#9c9087'); pxl(S, 5, 0, '#c4553d'); });
  // 7 Неон
  f(7, 'A', S => { rc(S, 1, 5, 10, 10, '#1b1230'); for (let x = 1; x < 11; x++) { pxl(S, x, 5, '#ff5fa2'); pxl(S, x, 14, '#3fa7a0'); } for (let y = 5; y < 15; y++) { pxl(S, 1, y, '#ff5fa2'); pxl(S, 10, y, '#3fa7a0'); } rc(S, 3, 9, 6, 1, '#3fa7a0'); pxl(S, 4, 8, '#ff5fa2'); pxl(S, 6, 11, '#ffffff'); rc(S, 2, 2, 1, 3, '#ff5fa2'); rc(S, 9, 2, 1, 3, '#3fa7a0'); rc(S, 2, 2, 8, 1, '#ffe08a'); });
  window.SHOPBAG_OPT = E;
})();
// Додаємо покупців як спрайти «тип_кадр» (готові малюнки-canvas)
CUSTOMER_TYPES.forEach(type => {
  SPRITES[type + '_0'] = { canvas: CHIBI.make(type, 0) };
  SPRITES[type + '_1'] = { canvas: CHIBI.make(type, 1) };
});
// Звірята-працівники: збираємо 16×16 з верхньої половини голови + спільного тулуба, права половина — дзеркало
const CHIBI_LOWER = ['...d1111', '...d1122', '...d1222', '...d1222', '...d1111', '....33..'];
function composeChibi(p) {
  const lower = CHIBI_LOWER.map(r => r.replace(/1/g, p.body).replace(/2/g, p.belly).replace(/3/g, p.feet));
  return [...p.top, ...lower].map(r => r + r.split('').reverse().join(''));
}
TEAM.forEach(m => { SPRITES['team_' + m.id] = { rows: composeChibi(TEAM_PARTS[m.id]) }; });
// ===== Костюми героїв по епохах =====
const TEAM_GLASSES = (put, kind) => {
  if (kind === 'round') { [4,5,6,9,10,11].forEach(x => { put(x, 5, 'k'); put(x, 6, 'k'); }); put(7, 5, 'k'); put(8, 5, 'k'); put(4, 5, 'w'); put(9, 5, 'w'); }
  else if (kind === 'visor') { for (let x = 3; x <= 12; x++) { put(x, 4, 'T'); put(x, 6, 'T'); } put(3, 5, 'T'); put(12, 5, 'T'); put(2, 5, 'f'); put(13, 5, 'f'); }
  else if (kind === 'nerd') { [4,5,6,9,10,11].forEach(x => { put(x, 4, 'k'); put(x, 6, 'k'); }); put(4, 5, 'k'); put(6, 5, 'k'); put(9, 5, 'k'); put(11, 5, 'k'); put(7, 5, 'k'); put(8, 5, 'k'); }
};
// прикраси на тулубі
function teamDeco(kind, c, put) {
  const row = (y, x0, x1, col) => { for (let x = x0; x <= x1; x++) put(x, y, col); };
  switch (kind) {
    case 'belt': row(13, 4, 11, c); put(7, 13, 'y'); put(8, 13, 'y'); break;
    case 'stripes': row(11, 4, 11, c); row(13, 4, 11, c); break;
    case 'bow': row(10, 6, 9, c); put(7, 11, c); put(8, 11, c); break;
    case 'buttons': put(7, 11, c); put(8, 11, c); put(7, 13, c); put(8, 13, c); break;
    case 'scarf': row(10, 4, 11, c); put(10, 11, c); put(10, 12, c); put(11, 12, c); break;
    case 'pocket': row(13, 4, 6, c); put(5, 12, c); put(6, 12, c); break;
    case 'dots': [[4,11],[6,12],[9,11],[11,12],[5,14],[10,14],[7,13]].forEach(q => put(q[0], q[1], c)); break;
    case 'collar': put(5, 10, c); put(6, 10, c); put(9, 10, c); put(10, 10, c); break;
  }
}
const TEAM_COSTUMES = [
 {
   hats: [
     ['......dddd....y.', '....ddrrrrdd.yy.', '...drrrrrrrrd.y.', '...dddddddddd...'],
     ['................', '....dddddd......', '...dbbbbbbd.....', '..ddbbbbbbdd....'],
     ['.....dwwwwd.....', '....dwwwwwwd....', '...dwwqqqwwwd...', '...dwwwwwwwwd...'],
     ['....h.h..h.h....', '....hhhhhhhh....', '....hrhhhhrh....', '................'],
     ['.....dddd...y...', '....dGGGGd..yy..', '...dGGGGGGd.y...', '...dddddddddd...'],
     null ],
   outfits: [ {b:'c',l:'w',d:'belt',c:'b'}, {b:'r',l:'y',d:'collar',c:'w'}, {b:'g',l:'c',d:'pocket',c:'G'}, {b:'n',l:'w',d:'scarf',c:'y'}, {b:'u',l:'q',d:'buttons',c:'y'}, {b:'t',l:'W',d:'stripes',c:'b'} ] },
 {
   hats: [
     ['.....dddddd.....', '....dwwwwwwd....', '....drrrrrrd....', '....dwwwwwwd....'],
     ['.....dd..dd.....', '....dppddppd....', '.....dd..dd.....', '................'],
     ['................', '....dddddd......', '...duuuuuud.....', '..dduuuuuudd....'],
     ['................', '....dddddd......', '...dnnnnnnd.....', '..ddwwwwwwdd....'],
     ['.....rrrrr......', '....rrrrrrr.....', '....drrrrrd.....', '.......w........'],
     null ],
   outfits: [ {b:'S',l:'w',d:'bow',c:'r'}, {b:'p',l:'w',d:'dots',c:'w'}, {b:'w',l:'S',d:'stripes',c:'r'}, {b:'T',l:'w',d:'collar',c:'w'}, {b:'y',l:'w',d:'buttons',c:'r'}, {b:'n',l:'w',d:'pocket',c:'w'} ] },
 {
   hats: [
     ['.....dddddd.....', '.....dPPPPd..y..', '.....dffffd.....', '..dddddddddddd..'],
     ['...dkkkkkkkkd...', '..dkkkkkkkkkkd..', '..dkkkkkkkkkkd..', '...dkkkkkkkkd...'],
     ['....dEwEwEd.....', '...dEEEEEEEd....', '...dwEEwEEEd....', '....dEEEEEd.....'],
     ['................', '................', '..dffffffffffd..', '..dyffffffffyd..'],
     ['....dyyyyyyd....', '...dyyyyyyyyd...', '.dddddddddddddd.', '................'],
     null ],
   outfits: [ {b:'P',l:'f',d:'collar',c:'y'}, {b:'o',l:'y',d:'stripes',c:'r'}, {b:'f',l:'q',d:'buttons',c:'y'}, {b:'T',l:'w',d:'collar',c:'w'}, {b:'v',l:'P',d:'dots',c:'y'}, {b:'k',l:'f',d:'belt',c:'y'} ],
   glasses: ['round'] },
 {
   hats: [
     ['.....dddddd.....', '...dTTTTTTTd....', '..dTTffffTTTd...', '.dddddddddddd...'],
     ['.......f........', '......fff.......', '.....fffff......', '....dfffffd.....'],
     ['................', '....dgggggg.....', '...dgggggggd....', '..ddddddddd.....'],
     ['.....y..........', '....dddd........', '...dTTTTd.......', '...dfTfTd.......'],
     ['................', '................', '..dryyyyyyrd....', '..drrrrrrrrd....'],
     null ],
   outfits: [ {b:'v',l:'k',d:'buttons',c:'T'}, {b:'f',l:'z',d:'stripes',c:'y'}, {b:'T',l:'k',d:'collar',c:'y'}, {b:'o',l:'w',d:'stripes',c:'v'}, {b:'g',l:'k',d:'belt',c:'y'}, {b:'n',l:'y',d:'dots',c:'f'} ] },
 {
   hats: [
     'headphones',
     ['....dnnnnnnd....', '...dnnnnnnnnd...', '...dnnnnnnnnd...', '...dn......nd...'],
     ['................', '....dwwwwwd.....', '...dwwwwwwwd....', '..ddddddddddd...'],
     ['.....dkkkkd.....', '....dkkkkkkd....', '....dkkkkkkd....', '....dkkkkkkd....'],
     ['.......k........', '......kkk.......', '......k.k.......', '................'],
     null ],
   outfits: [ {b:'n',l:'S',d:'buttons',c:'w'}, {b:'k',l:'e',d:'stripes',c:'a'}, {b:'r',l:'w',d:'pocket',c:'w'}, {b:'u',l:'q',d:'dots',c:'w'}, {b:'g',l:'m',d:'collar',c:'w'}, {b:'w',l:'a',d:'belt',c:'n'} ],
   glasses: ['nerd'] },
 {
   hats: [
     ['.....hhhhhh.....', '....hhhhhhhh....', '....hggggggh....', '.hhhhhhhhhhhhhh.'],
     ['..g..g..g..g....', '..GgGgGgGgGg....', '...dGGGGGGd.....', '................'],
     ['................', '................', '..dgggggggggd...', '..dgwgwgwgwgd...'],
     ['....dwwwwwwd....', '...dwwwwwwwwd...', '.dwwwwwwwwwwwwd.', '.....p..p.......'],
     ['.....dmmmmd.....', '....dmmmmmmd....', '....dmwmwmmd....', '....dmmmmmmd....'],
     null ],
   outfits: [ {b:'c',l:'g',d:'pocket',c:'G'}, {b:'m',l:'w',d:'stripes',c:'g'}, {b:'w',l:'g',d:'belt',c:'b'}, {b:'g',l:'c',d:'buttons',c:'y'}, {b:'y',l:'w',d:'collar',c:'g'}, {b:'b',l:'c',d:'dots',c:'y'} ] },
 {
   hats: [
     'bubble',
     ['....y......y....', '.....e....e.....', '.....dddddd.....', '................'],
     ['................', '.....dddddd.....', '....dkaakaad....', '....dddddddd....'],
     ['................', '.....dddddd.....', '....drrrrrrd....', '....dryyyyrd....'],
     ['.....eeeee......', '....eEEEEEe.....', '....eEEEEEe.....', '.....eeeee......'],
     'bubble' ],
   outfits: [ {b:'E',l:'a',d:'buttons',c:'r'}, {b:'w',l:'E',d:'stripes',c:'r'}, {b:'o',l:'y',d:'collar',c:'w'}, {b:'n',l:'a',d:'belt',c:'y'}, {b:'u',l:'E',d:'dots',c:'y'}, {b:'g',l:'m',d:'pocket',c:'w'} ] },
 {
   hats: [
     ['.....f....f.....', '....fTffffTf....', '................', '................'],
     ['......TTTT......', '.....T....T.....', '......TTTT......', '................'],
     ['...f........f...', '...ff......ff...', '..dffffffffffd..', '................'],
     ['.......T........', '......TT........', '.....TTT........', '....dTTTTd......'],
     ['................', '.....dddddd.....', '....dTTTTTTd....', '....dffffffd....'],
     null ],
   outfits: [ {b:'k',l:'z',d:'stripes',c:'f'}, {b:'z',l:'T',d:'buttons',c:'f'}, {b:'u',l:'k',d:'belt',c:'T'}, {b:'f',l:'k',d:'collar',c:'T'}, {b:'T',l:'z',d:'dots',c:'w'}, {b:'v',l:'k',d:'pocket',c:'f'} ],
   glasses: ['visor'] },
 {
   hats: [
     ['.......yy.......', '.....yyyyyy.....', '...yyyyyyyyyy...', '..hhhhhhhhhhhh..'],
     ['................', '................', '..drrrrrrrrrd...', '..drrwwwwrrd....'],
     ['....d....d......', '....dkkkkkd.....', '...dkkhhkkkd....', '..dkkkkkkkkkd...'],
     ['................', '.........pp.....', '........pwwp....', '.........pp.....'],
     ['.....dddddd.....', '....dwwwwwwd....', '....drrwwrrd....', '................'],
     null ],
   outfits: [ {b:'r',l:'w',d:'belt',c:'y'}, {b:'n',l:'w',d:'collar',c:'w'}, {b:'g',l:'w',d:'belt',c:'w'}, {b:'p',l:'w',d:'stripes',c:'w'}, {b:'u',l:'q',d:'belt',c:'y'}, {b:'k',l:'w',d:'collar',c:'r'} ] }
];
function teamEyes(g, base) { for (let y = 4; y <= 7; y++) for (let x = 0; x < 16; x++) { const c = base[y][x]; if (c === 'X' || c === 'x') g[y][x] = c; } }       // костюм не закриває очі
// Костюм героя в епосі: тулуб, капелюх і прикраси (кожен герой одягнений по-своєму)
function composeTeamCostume(id, epoch) {
  const p = TEAM_PARTS[id] || NPC_PARTS[id], cs = TEAM_COSTUMES[epoch % TEAM_COSTUMES.length];
  let k = Object.keys(TEAM_PARTS).indexOf(id); if (k < 0) k = 7 + Math.max(0, Object.keys(NPC_PARTS).indexOf(id));      // гість у костюмі: той самий розрахунок
  const space = epoch % TEAM_COSTUMES.length === 6;                // Космос: усі звірята в скафандрі зі скляним шоломом
  const o = space ? { b: 'w', l: 'E', d: ['belt', 'stripes', 'buttons', 'collar'][k % 4], c: ['o', 'T', 'f', 'v', 'r', 'n'][k % 6] } : cs.outfits[(k * 5 + 1) % cs.outfits.length];
  const hat = space ? 'bubble' : cs.hats[(k * 2 + (k >> 2)) % cs.hats.length];
  const lower = CHIBI_LOWER.map(row => row.replace(/1/g, o.b).replace(/2/g, o.l).replace(/3/g, p.feet));
  const g = [...p.top, ...lower].map(row => (row + row.split('').reverse().join('')).split(''));
  const base0 = g.map(r => r.slice());
  const put = (x, y, c) => { if (y >= 0 && y < 16 && x >= 0 && x < 16) g[y][x] = c; };
  teamDeco(o.d, o.c, put);
  if (id === 'spike' && !space) { /* їжак без капелюха: колючки лишаються видимими */ }
  else if (Array.isArray(hat)) hat.forEach((row, i) => row.split('').forEach((c, x) => { if (c !== '.') put(x, i, c); }));
  else if (hat === 'headphones') {
    for (let x = 4; x <= 11; x++) put(x, 0, 'k');
    [[3, 1], [12, 1], [2, 2], [13, 2], [2, 3], [13, 3]].forEach(q => put(q[0], q[1], 'k'));
    [5, 6, 7].forEach(y => { put(1, y, 'k'); put(2, y, 'a'); put(14, y, 'k'); put(13, y, 'a'); });
  } else if (hat === 'bubble') {                                  // скляний шолом навколо голови
    const inE = (x, y) => Math.pow((x + .5 - 8) / 7.4, 2) + Math.pow((y + .5 - 5.2) / 6.1, 2) <= 1;
    for (let y = 0; y <= 10; y++) for (let x = 0; x < 16; x++) if (!inE(x, y) && (inE(x - 1, y) || inE(x + 1, y) || inE(x, y - 1) || inE(x, y + 1)) && g[y][x] === '.') g[y][x] = 'a';
    put(3, 2, 'w'); put(4, 1, 'w');
    for (let x = 3; x <= 12; x++) if (g[10][x] !== '.' && g[10][x] !== 'd') g[10][x] = 'e';
  }
  if (cs.glasses && k % 5 === 3) TEAM_GLASSES(put, cs.glasses[0]);
  teamEyes(g, base0);
  return g.map(row => row.join(''));
}
// Спрайти героїв для кожної епохи: team_<id>_e<номер>
TEAM.forEach(m => { for (let e = 0; e < TEAM_COSTUMES.length; e++) SPRITES['team_' + m.id + '_e' + e] = { rows: composeTeamCostume(m.id, e) }; });
// Скіни героїв (виграш у цирку): святкові костюми й ніндзя — однакові в усіх епохах
function composeTeamSkin(id, kind) {
  const p = TEAM_PARTS[id], k = Object.keys(TEAM_PARTS).indexOf(id);
  let body, legs, deco, decoC;
  if (kind === 'party') { body = ['f', 'T', 'o', 'v', 'p', 'm'][k % 6]; legs = 'w'; deco = ['dots', 'stripes', 'bow'][k % 3]; decoC = 'y'; }
  else if (kind === 'chef') { body = 'w'; legs = 'E'; deco = 'buttons'; decoC = 'r'; }
  else if (kind === 'wizard') { body = 'v'; legs = 'u'; deco = 'dots'; decoC = 'y'; }
  else if (kind === 'royal') { body = 'r'; legs = 'w'; deco = 'collar'; decoC = 'w'; }
  else if (kind === 'gold') { body = 'h'; legs = 'y'; deco = 'buttons'; decoC = 'w'; }
  else if (kind === 'diamond') { body = 'a'; legs = 's'; deco = 'dots'; decoC = 'w'; }
  else if (kind === 'santa') { body = 'r'; legs = 'k'; deco = 'belt'; decoC = 'k'; }
  else if (kind === 'witch') { body = 'V'; legs = 'P'; deco = 'dots'; decoC = 'o'; }
  else { body = 'z'; legs = 'n'; deco = 'belt'; decoC = 'r'; }
  const lower = CHIBI_LOWER.map(row => row.replace(/1/g, body).replace(/2/g, legs).replace(/3/g, p.feet));
  const g = [...p.top, ...lower].map(row => (row + row.split('').reverse().join('')).split(''));
  const base0 = g.map(r => r.slice());
  const put = (x, y, c) => { if (y >= 0 && y < 16 && x >= 0 && x < 16) g[y][x] = c; };
  const row = (y, x0, x1, c) => { for (let x = x0; x <= x1; x++) put(x, y, c); };
  const hat = rows => rows.forEach((r, y) => r.split('').forEach((c, x) => { if (c !== '.') put(x, y, c); }));
  teamDeco(deco, decoC, put);
  if (kind === 'party') {                                         // ковпак-конус із помпоном, конфеті на одязі
    hat(['.......yy.......', '......dffd......', '.....dfTfTd.....', '....dfTfTfTd....']);
    [[3, 11, 'y'], [11, 12, 'T'], [5, 13, 'w'], [9, 14, 'y'], [12, 13, 'f'], [4, 14, 'T']].forEach(q => put(q[0], q[1], q[2]));
  } else if (kind === 'chef') {                                   // високий білий ковпак
    hat(['.....wwwwww.....', '....wwwwwwww....', '....wwwwwwww....', '....EEEEEEEE....']);
  } else if (kind === 'wizard') {                                 // гостроверхий капелюх із зіркою
    hat(['.......yy.......', '......uuuu......', '.....uuyuuu.....', '...hhhhhhhhhh...']);
  } else if (kind === 'santa') {                                  // червоний ковпак з білим помпоном
    hat(['.......ww.......', '......rrrr......', '.....rrrrrr.....', '....wwwwwwww....']);
  } else if (kind === 'witch') {                                  // капелюх відьми з помаранчевою стрічкою
    hat(['.......VV.......', '......VVVV......', '....oooooooo....', '...VVVVVVVVVV...']);
  } else if (kind === 'gold') {                                   // світла золота корона з самоцвітами
    hat(['...y..y..y..y...', '...yyyyyyyyyy...', '...yNyyyyyyNy...']);
  } else if (kind === 'diamond') {                                // кришталева корона-«кластер»
    hat(['...N..N..N..N...', '...NaaNaaNaaN...', '...aw1aaaa1wa...']);
  } else if (kind === 'royal') {                                  // золота корона з рубінами
    hat(['...h..h..h..h...', '...hhhhhhhhhh...', '...hrhhhhhhrh...', '................']);
  } else {                                                        // капюшон ніндзя з червоною пов'язкою, маска на нижній частині морди
    row(1, 4, 11, 'z'); row(2, 3, 12, 'z'); row(3, 3, 12, 'z'); row(4, 2, 13, 'r');
    put(14, 4, 'r'); put(14, 5, 'r'); put(15, 6, 'r');
    row(8, 3, 12, 'z'); row(9, 4, 11, 'z');
    put(5, 5, 'w'); put(10, 5, 'w');
  }
  teamEyes(g, base0);
  return g.map(r => r.join(''));
}
['party', 'ninja', 'chef', 'wizard', 'royal', 'santa', 'witch', 'gold', 'diamond'].forEach(kind => TEAM.forEach(m => { SPRITES['team_' + m.id + '_sk_' + kind] = { rows: composeTeamSkin(m.id, kind) }; }));
function teamSprite(id) { const s = skinOn('hero'); return s ? 'team_' + id + '_sk_' + s : 'team_' + id + '_e' + (viewEpoch() % EPOCHS.length); }
Object.keys(NPC_PARTS).forEach(id => { SPRITES['npc_' + id] = { rows: composeChibi(NPC_PARTS[id]) }; });
SPRITES.npc_clock = { rows: CLOCK_ROWS };
// Космос: гості епох теж у скафандрі й шоломі (Орбіт уже в космічному вбранні; спрайт створюється, коли потрібен)
function guestSpriteName(id) {
  const base = 'npc_' + id;
  if (viewEpoch() % EPOCHS.length !== 6 || id === 'orbit' || !NPC_PARTS[id]) return base;
  const n = base + '_sp';
  if (!SPRITES[n]) SPRITES[n] = { rows: composeTeamCostume(id, 6) };
  return n;
}
// Капі: 28×24, дивиться вправо (у грі віддзеркалюється). Контур намальований прямо в спрайті.
// База — 27×21, намальована дивлячись ліворуч: O — контур, B — шерсть, M — морда/вушко, L — світліші плями, K — око.
// Одяг (капелюшок + вбрання) накладається поверх бази, потім усе віддзеркалюється.
const CAPY_BASE = [
  '......OO...OO..............',
  '.....OOOOOOMMO.............',
  '...OOBBBBBOBMO.............',
  '..OBBBBBBBBBOBO............',
  '.OBBBBBBBBBBBBBO...........',
  'OBBBBBBKKBBBBBBBOOOOOOO....',
  'OMMMBBBKKBBBBBBBBBBBBBBO...',
  'OMOMMBBBBBBBBBBBBBBBBBBBO..',
  'OMMMMBBBBBBBBBBBBBBBBBBBBO.',
  'OMMMMBBBBBBBBBBBBBBBBBBBBBO',
  'OMMMMBBBBBBBBBBBBBBBBBBBBBO',
  '.OMMMBBBBBBBBBBBBBBBBBBBBBO',
  '..OOOOLLBBBBBBBBBBBBBBBBBBO',
  '......OBBBBBBBBBBBBBBBBBBBO',
  '......OBBBBBBBBBBBBBBBBBBBO',
  '.......OBBBBBBBBBBBBBBBBBO.',
  '.......OLLBBBBBBBBBBBBBBBO.',
  '.......OLLOBBBOLLLLBBBBBO..',
  '........OMOBBOOOOOMMOBBO...',
  '........OOOMMO....OOOMMO...',
  '..........OOO.......OOO....'
];
// Одяг на все тулуб: фарбує кожен піксель шерсті від шиї до крупа (голова й ноги лишаються).
// paint(x, y, f) повертає колір; f — чи піксель на верхньому / нижньому / лівому / правому краю одягу
function paintBody(grid, off, paint) {
  const fur = (x, y) => { const c = grid[y] && grid[y][x + off]; return c === 'B' || c === 'L'; };
  const cells = new Set();
  for (let y = 9; y <= 20; y++) for (let x = 0; x < 27; x++) if (fur(x, y) && (x >= 12 || (y >= 15 && x >= 7))) cells.add(x + ',' + y);
  const on = (x, y) => cells.has(x + ',' + y);
  [...cells].map(k => k.split(',').map(Number)).forEach(([x, y]) => {
    const c = paint(x, y, { top: !on(x, y - 1), bottom: !on(x, y + 1), left: !on(x - 1, y), right: !on(x + 1, y) });
    if (c) grid[y][x + off] = c;
  });
}
function makeCapyRows(outfit) {
  const W = 27, grid = Array.from({ length: 24 }, (_, y) => y < 3 ? Array(W).fill('.') : CAPY_BASE[y - 3].split(''));
  const put = (x, y, c) => { if (grid[y] && x >= 0 && x < W) grid[y][x] = c; };
  const dye = (x0, x1, y0, y1, col) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (grid[y][x] === 'B' || grid[y][x] === 'L') grid[y][x] = col; };   // фарбує лише шерсть
  const box = (x, y, w, h, fill) => { for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) put(x + i, y + j, (i < 0 || j < 0 || i >= w || j >= h) ? 'O' : fill); };   // прямокутник із контуром
  const around = cells => cells.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (grid[y + dy] && grid[y + dy][x + dx] === '.') grid[y + dy][x + dx] = 'O'; }));   // контур навколо прикраси
  const pack = (fill, flap, strap) => {                    // портфель на спині (Капі дивиться вліво, потім усе віддзеркалюється)
    box(18, 6, 5, 4, fill);
    for (let x = 18; x < 23; x++) put(x, 6, flap);
    put(20, 8, 'y');
    put(18, 11, strap); put(18, 12, strap);
  };
  if (outfit === 'girl') {                                 // рожева квіточка на голові + рожевий портфель
    pack('p', 'f', 'q');                                  // маленький рожевий портфель на спині
    const fl = [[7, 1, 'p'], [6, 2, 'p'], [7, 2, 'y'], [8, 2, 'p'], [7, 3, 'p']];
    fl.forEach(([x, y, c]) => put(x, y, c)); around(fl);
  } else if (outfit === 'boy') {                           // зелений листочок на голові + синій портфель
    pack('n', 's', 'w');                                  // маленький синій портфель на спині
    const lf = [[6, 1, 'g'], [5, 2, 'g'], [6, 2, 'g'], [8, 1, 'g'], [8, 2, 'g'], [9, 2, 'g'], [7, 2, 'G'], [7, 3, 'G']];
    lf.forEach(([x, y, c]) => put(x, y, c)); around(lf);
  }
  return grid.map(row => '.' + row.reverse().join(''));
}
SPRITES.capy = { rows: makeCapyRows('girl'), variants: { blink: { K: PALETTE.B } } };
SPRITES.capy_m = { rows: makeCapyRows('boy'), variants: { blink: { K: PALETTE.B } } };
// Скіни Капі (виграш у цирку): капелюх і вбрання накладаються на ту саму базу, що й звичайний одяг (однакові для дівчинки й хлопчика)
function makeCapySkinRows(kind) {
  const ox = (kind === 'astro' || kind === 'ep6') ? 2 : 0, W = 27 + ox;          // у космічному скіні спереду є відступ на скляний шолом
  const grid = Array.from({ length: 24 }, (_, y) => y < 3 ? Array(W).fill('.') : ('.'.repeat(ox) + CAPY_BASE[y - 3]).split(''));
  const at = (x, y) => (grid[y] ? grid[y][x + ox] : undefined);
  const put = (x, y, c) => { if (grid[y] && x + ox >= 0 && x + ox < W) grid[y][x + ox] = c; };
  const dye = (x0, x1, y0, y1, col) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (at(x, y) === 'B' || at(x, y) === 'L') put(x, y, col); };
  const rect = (x0, x1, y0, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  const around = cells => cells.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (at(x + dx, y + dy) === '.') put(x + dx, y + dy, 'O'); }));
  const cellsOf = (x0, y0, rows) => { const out = []; rows.forEach((r, j) => r.split('').forEach((c, i) => { if (c !== '.') { put(x0 + i, y0 + j, c); out.push([x0 + i, y0 + j]); } })); return out; };
  if (kind === 'pirate') {                                   // трикутний капелюх з черепом, пов'язка на оці, смугаста тільняшка й червоний пояс
    paintBody(grid, ox, (x, y, f) => {                     // бордова піратська куртка на все тіло: золота облямівка, ґудзики, чорний пояс із пряжкою, біле жабо
      if ((x === 12 || x === 13) && y <= 15) return y % 2 ? 'w' : 'E';
      if (f.bottom) return 'h';
      if (x === 19 || x === 20) return (y === 14 || y === 15) ? 'h' : 'k';
      if (f.top) return 'r';
      if (x === 15 && y % 3 === 0) return 'h';
      return y <= 11 ? 'r' : (y >= 17 ? 'P' : 'R');
    });
    cellsOf(6, 14, ['rrrrr', '.rrr.', '..r..']);              // червона хустка на шиї
    around(cellsOf(2, 1, [
      '....kkkkkk....',
      '..kkkkkkkkkk..',
      '.kkkkkwwkkkkk.',
      '.kkkkwkkwkkkk.',
      'hhhhhhhhhhhhhh'
    ]));
    cellsOf(6, 8, ['kkk', 'kkk', 'kkk']);                    // пов'язка на оці (3×3)
    put(5, 7, 'k'); put(4, 6, 'k'); put(9, 9, 'k');          // зав'язка пов'язки
    put(14, 5, 'h'); put(14, 6, 'h');                         // золота сережка
  } else if (kind === 'astro') {                             // білий скафандр, ранець, шолом із блакитним склом
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'w') put(x, 17, 'E'); if (at(x, 16) === 'w') put(x, 16, 'E'); }
    rect(14, 19, 11, 11, 'o'); rect(14, 19, 12, 12, 'r');     // кольорова смужка на грудях
    put(21, 11, 'n'); put(22, 11, 'n'); put(21, 12, 'n'); put(22, 12, 'w');   // нашивка
    put(14, 14, 'a'); put(16, 14, 'o'); put(18, 14, 'r');     // кнопки на панелі
    cellsOf(5, 14, ['EEEEEE', '.EEEE.']);                     // комір
    around(cellsOf(17, 5, ['EEEEEE', 'EaEEaE', 'EEEEEE']));  // ранець на спині
    for (let y = 0; y <= 15; y++) for (let x = -2; x < 25; x++) {   // скляна куля навколо голови
      const d = Math.pow((x - 7.5) / 9.7, 2) + Math.pow((y - 8.8) / 9.1, 2);
      if (d >= 0.8 && d <= 1.1 && at(x, y) === '.') put(x, y, d >= 0.95 ? 'O' : 'a');   // скло з темним контуром, як у решти спрайтів
    }
    [[5, 1], [6, 1], [3, 2], [2, 3], [1, 4]].forEach(q => put(q[0], q[1], 'w'));   // блик на склі
    cellsOf(10, 0, ['.d', '.d']);                              // антенка на шоломі
    put(10, 0, 'r');
  } else if (kind === 'ep0') {                               // Відродження: бордовий берет із білим пером і брошкою, брижі, бордова накидка із золотою лілією
    dye(12, 25, 9, 17, 'R');
    for (let x = 12; x <= 25; x += 2) put(x, 9, 'h');
    [[19, 12], [19, 13], [19, 14], [18, 13], [20, 13], [19, 11]].forEach(q => put(q[0], q[1], 'h'));
    for (let y = 9; y <= 17; y++) if (at(25, y) === 'R') put(25, y, 'h');
    around(cellsOf(3, 1, ['...RRRRRR...', '.RRRRRRRRRR.', 'RRRRRRRRRRRR', 'hhhhhhhhhhhh']));
    put(9, 3, 'y'); put(8, 3, 'y');                           // брошка
    around(cellsOf(13, 0, ['.ww', 'www', 'ww.']));            // біле перо
    cellsOf(12, 10, ['.ww', 'ww.', '.ww', 'ww.', '.ww', 'ww.', '.ww']);   // брижі на шиї (між головою й накидкою)
  } else if (kind === 'ep1') {                               // Ретро: червоно-біла кепка, синя університетська куртка з літерою «C»
    dye(12, 25, 9, 17, 'n');
    for (let x = 12; x <= 25; x++) if (at(x, 9) === 'n') put(x, 9, 'w');
    cellsOf(15, 11, ['wwww', 'w...', 'w...', 'w...', 'wwww']);
    for (let y = 9; y <= 17; y++) if (at(12, y) === 'n') put(12, y, 'w');
    around(cellsOf(3, 2, ['...rrrrrrr...', '..rrrwwwrrr..', '.rrrrwrwrrrr.']));
    cellsOf(0, 5, ['rrrrrrrr']); put(8, 3, 'r');
  } else if (kind === 'ep2') {                               // Диско: великі фіолетові окуляри, блискуча срібна куртка, намисто з перлин
    dye(12, 25, 9, 17, 'E');
    for (let y = 9; y <= 17; y++) for (let x = 12; x <= 25; x++) { if (at(x, y) !== 'E') continue; const k = (x * 7 + y * 13) % 6; put(x, y, k === 0 ? 'w' : k === 1 ? 'a' : k === 2 ? 'S' : k === 3 ? 'q' : 'E'); }
    cellsOf(5, 6, ['.uuuu.', 'u....u', 'u....u', 'u....u', 'u....u', '.uuuu.']); put(6, 7, 'f'); cellsOf(11, 8, ['uuu']);
    put(16, 3, 'w'); put(15, 2, 'q'); put(17, 2, 'a');
  } else if (kind === 'ep3') {                               // Аркади: чорна кепка з інопланетянином, бірюзові навушники, темна толстовка з геймпадом
    dye(12, 25, 9, 17, 'z'); for (let x = 12; x <= 25; x++) if (at(x, 9) === 'z') put(x, 9, 'n');
    cellsOf(16, 12, ['wwwwww', 'wNwwrw', 'wwwwww']);
    around(cellsOf(3, 2, ['...kkkkkk...', '..kkkkkkkk..', '.kkkkkkkkkk.']));
    cellsOf(0, 5, ['kkkkkkkk']); cellsOf(6, 3, ['f.f', '.f.', 'f.f']);
    around(cellsOf(10, 6, ['NN', 'NN', 'NN', 'NN']));
  } else if (kind === 'ep4') {                               // Інтернет: синя кепка, навушники, біла толстовка, синій рюкзак
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 13) === 'w') put(x, 13, 'n'); if (at(x, 17) === 'w') put(x, 17, 'n'); }
    cellsOf(15, 10, ['.nn.', 'n..n', '.nn.']);
    cellsOf(6, 15, ['n.n']);
    around(cellsOf(3, 2, ['...nnnnnn...', '..nnnwwnnnn..', '.nnnnwwnnnnn.']));
    cellsOf(0, 5, ['nnnnnnn']);
    around(cellsOf(10, 6, ['kk', 'kN', 'kk']));
    around(cellsOf(18, 5, ['zzzzzz', 'zzzzzz', 'zNNzzz', 'zzzzzz', 'zzzzzz', 'zzzzzz']));
  } else if (kind === 'ep5') {                               // Еко: солом'яний капелюх із листочками, зелена куртка, рюкзак з листком
    dye(12, 25, 9, 17, 'g');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'g') put(x, 17, 'G'); if (at(x, 16) === 'g') put(x, 16, 'G'); }
    cellsOf(15, 12, ['.m.', 'mmm', 'mGm', '.G.']);
    around(cellsOf(18, 5, ['GGGGGG', 'GmmmGG', 'GGmGGG', 'GGGGGG', 'GGGGGG', 'GGGGGG']));
    around(cellsOf(2, 2, ['....cccccc....', '...cccccccc...', '...gggggggg...', '.cccccccccccc.', 'cccccccccccccc']));
    cellsOf(1, 4, ['gg']); cellsOf(14, 4, ['gg']); put(2, 5, 'G'); put(15, 5, 'G'); put(8, 1, 'g'); put(8, 0, 'm'); put(9, 0, 'g');
  } else if (kind === 'ep6') {                               // Космос: скляний шолом, білий скафандр з помаранчевими латками, синій ранець
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'w') put(x, 17, 'E'); if (at(x, 16) === 'w') put(x, 16, 'E'); }
    cellsOf(14, 11, ['oo', 'oo']); cellsOf(21, 12, ['nn', 'nw']); cellsOf(17, 13, ['rrr']);
    cellsOf(5, 14, ['EEEEEE', '.EEEE.']);
    around(cellsOf(17, 5, ['nnnnnn', 'nanana', 'nnnnnn']));
    for (let y = 0; y <= 15; y++) for (let x = -2; x < 25; x++) {
      const d = Math.pow((x - 7.5) / 9.7, 2) + Math.pow((y - 8.8) / 9.1, 2);
      if (d >= 0.8 && d <= 1.1 && at(x, y) === '.') put(x, y, d >= 0.95 ? 'O' : 'a');
    }
    [[5, 1], [6, 1], [3, 2], [2, 3], [1, 4]].forEach(q => put(q[0], q[1], 'w'));
  } else if (kind === 'ep7') {                               // Неон: чорний капюшон, бірюзовий візор, рожеві навушники, куртка з неоновими лініями
    dye(12, 25, 9, 17, 'V');
    for (let x = 12; x <= 25; x++) { if (at(x, 11) === 'V') put(x, 11, 'f'); if (at(x, 14) === 'V') put(x, 14, 'N'); }
    for (let y = 9; y <= 17; y++) { if (at(17, y) === 'V') put(17, y, 'N'); if (at(21, y) === 'V') put(21, y, 'f'); }
    around(cellsOf(2, 2, ['..VVVVVVVV..', '.VVVVVVVVVV.', 'VVVVVVVVVVVV', 'VVVVVVVVVVVV']));
    cellsOf(3, 7, ['NNNNNNNNN', 'NNwNNNNNN']); cellsOf(12, 7, ['NNN']);
    around(cellsOf(10, 5, ['ff', 'ff', 'ff', 'ff']));
  } else if (kind === 'wizard') {                            // чарівник: фіолетовий капелюх із зорями й золотою стрічкою, мантія із зірками
    dye(12, 25, 9, 17, 'u');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'u') put(x, 17, 'v'); if (at(x, 16) === 'u') put(x, 16, 'v'); }
    [[14, 11], [18, 13], [22, 11], [16, 15], [21, 15], [24, 13]].forEach(q => put(q[0], q[1], 'y'));
    around(cellsOf(4, 0, ['.....uy.....', '....uuuu....', '...uuuuuu...', '..uuuuyuuu..', '.uuuuuuuuuu.', 'hhhhhhhhhhhh']));
    put(14, 4, 'y');
  } else if (kind === 'santa') {                             // Дід Мороз: червона шуба з білим хутром і поясом, ковпак з помпоном
    dye(12, 25, 9, 17, 'r');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'r') put(x, 17, 'w'); if (at(x, 16) === 'r') put(x, 16, 'w'); if (at(x, 13) === 'r') put(x, 13, 'k'); }
    put(18, 13, 'h'); put(19, 13, 'h'); put(18, 12, 'r');
    for (let y = 9; y <= 17; y++) if (at(12, y) === 'r') put(12, y, 'w');
    cellsOf(6, 14, ['wwwww', '.www.', '..w..']);
    around(cellsOf(4, 0, ['.....ww.....', '....rrrr....', '...rrrrrr...', '..rrrrrrrr..', '.rrrrrrrrrr.', 'wwwwwwwwwwww']));
  } else if (kind === 'witch') {                             // відьма: гостроверхий капелюх з помаранчевою стрічкою, чорно-фіолетова накидка, гарбуз на спині
    dye(12, 25, 9, 17, 'V');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'V') put(x, 17, 'o'); if (at(x, 16) === 'V') put(x, 16, 'P'); }
    [[14, 11], [19, 12], [23, 11], [17, 14]].forEach(q => put(q[0], q[1], 'y'));
    around(cellsOf(18, 5, ['..gg..', '.oooo.', 'oooooo', 'oooooo', '.oooo.']));
    around(cellsOf(2, 0, ['.......VV.....', '......VVV.....', '.....VVVV.....', '....VVVVVV....', '....oooooo....', '.VVVVVVVVVVVV.']));
  } else if (kind === 'flower') {                            // весна: вінок із квітів, рожева сукня в квіточку
    dye(12, 25, 9, 17, 'q');
    for (let y = 9; y <= 17; y++) for (let x = 12; x <= 25; x++) if (at(x, y) === 'q' && (x * 3 + y * 5) % 7 === 0) put(x, y, 'f');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'q') put(x, 17, 'p'); if (at(x, 9) === 'q') put(x, 9, 'w'); }
    around(cellsOf(3, 3, ['..p...w...p.', '.pyp.wyw.pyp', 'gGgggggGgggg']));
    cellsOf(14, 12, ['.y.', 'yfy', '.y.']);
  } else if (kind === 'beach') {                             // літо: солом'яний капелюх, сонцезахисні окуляри, гавайська сорочка, намисто з квітів
    dye(12, 25, 9, 17, 'T');
    [[14, 11], [17, 13], [20, 11], [23, 13], [15, 15], [21, 15], [24, 16]].forEach(q => put(q[0], q[1], 'y'));
    for (let x = 12; x <= 25; x++) { if (at(x, 9) === 'T') put(x, 9, 'w'); if (at(x, 17) === 'T') put(x, 17, 'n'); }
    cellsOf(6, 14, ['fyofy', '.pyp.']);
    around(cellsOf(5, 8, ['kkkkk', 'kwkkk'])); cellsOf(10, 8, ['kkkk']);
    around(cellsOf(2, 2, ['....cccccc....', '...cccccccc...', '...rrrrrrrr...', '.cccccccccccc.']));
    cellsOf(0, 5, ['cccccccccccccccc']);
  } else if (kind === 'autumn') {                            // осінь: помаранчева в'язана кофта, смугастий шарф, ковпак-жолудь, кленовий листок на спині
    dye(12, 25, 9, 17, 'o');
    for (let x = 12; x <= 25; x++) { if (at(x, 12) === 'o') put(x, 12, 'r'); if (at(x, 15) === 'o') put(x, 15, 'r'); if (at(x, 17) === 'o') put(x, 17, 'b'); }
    cellsOf(5, 13, ['rwrwrwr', '.rwrwr.', '..rwr..']);
    around(cellsOf(18, 5, ['.r.r.', 'rrrrr', '.rrr.', '..b..']));
    around(cellsOf(4, 1, ['...bbbbbb...', '..bbbbbbbb..', '.hhhhhhhhhh.', 'hhhhhhhhhhhh']));
    put(9, 0, 'b'); put(9, 1, 'b');
  } else if (kind === 'chef') {                              // шеф-кухар: високий білий ковпак, біла куртка з ґудзиками, червона хустка
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 17) === 'w') put(x, 17, 'E'); if (at(x, 16) === 'w') put(x, 16, 'E'); }
    [11, 13, 15].forEach(y => put(16, y, 'k'));
    cellsOf(6, 14, ['rrrrr', '.rrr.', '..r..']);
    around(cellsOf(5, 0, ['..wwwwww..', '.wwwwwwww.', 'wwwwwwwwww', 'wwwwwwwwww', 'EEEEEEEEEE']));
  } else if (kind === 'explorer') {                          // дослідник: сафарі-капелюх, жилетка з кишенями, зелений рюкзак
    dye(12, 25, 9, 17, 'c');
    cellsOf(14, 12, ['bbbb', 'bccb', 'bbbb']); cellsOf(20, 12, ['bbbb', 'bccb', 'bbbb']);
    for (let x = 12; x <= 25; x++) if (at(x, 13) === 'c') put(x, 13, 'b');
    around(cellsOf(18, 5, ['gggggg', 'gGGGGg', 'gggggg', 'gggggg', 'gggggg']));
    around(cellsOf(3, 2, ['...cccccc...', '..cccccccc..', '.bbbbbbbbbb.']));
    cellsOf(0, 5, ['cccccccccccccccc']);
  } else if (kind === 'detective') {                         // детектив: коричневий капелюх-федора, бежевий плащ із поясом
    dye(12, 25, 9, 17, 'c');
    for (let x = 12; x <= 25; x++) { if (at(x, 13) === 'c') put(x, 13, 'b'); if (at(x, 17) === 'c') put(x, 17, 'l'); }
    [11, 15].forEach(y => put(16, y, 'b'));
    cellsOf(10, 9, ['bb', 'bw']); cellsOf(7, 14, ['cc.', 'ccc']);
    around(cellsOf(3, 2, ['..bbbbbbbb..', '.bbbbbbbbbb.', '.dddddddddd.']));
    cellsOf(1, 5, ['bbbbbbbbbbbbbb']);
  } else if (kind === 'mel' || kind === 'nika') {            // скіни розробників: MEL — лис, NIKA — зайка
    const fox = kind === 'mel';
    for (let y = 0; y < 24; y++) for (let x = 0; x < 27; x++) {
      const c = at(x, y); if (c !== 'B' && c !== 'L' && c !== 'M') continue;
      if (fox) put(x, y, c === 'B' ? 'o' : c === 'L' ? 'w' : (y >= 20 ? 'd' : (x <= 6 && y >= 10 ? 'w' : 'r')));
      else put(x, y, c === 'B' ? 'w' : c === 'L' ? 'q' : (y >= 20 ? 'q' : 'p'));
    }
    if (fox) {
      for (let y = 9; y <= 16; y++) for (let x = 0; x < 10; x++) if (at(x, y) === 'o' && (x < 5 || (y > 12 && x < 8))) put(x, y, 'w');                  // біла мордочка
      put(1, 8, 'k'); put(2, 8, 'k');
      around(cellsOf(4, -1 + 1, ['.oo.', 'oord'.replace('d', 'o'), 'orro', 'oooo'])); around(cellsOf(9, 0, ['..oo', '.oro', 'orro', 'oooo']));       // гострі вушка
      around(cellsOf(20, 1, ['....ww', '...wwo', '..wooo', '.ooooo', '.ooooo', '.oooo.', '..ooo.']));                                              // пухнастий хвіст із білим кінчиком
      cellsOf(12, 15, ['w', 'ww']); for (let x = 12; x <= 24; x++) { if (at(x, 15) === 'o') put(x, 15, 'w'); }                                       // біле черевце
    } else {
      around(cellsOf(4, 0, ['.ww.', 'wppw', 'wppw', 'wppw', 'wwww'])); around(cellsOf(9, 0, ['.ww.', 'wppw', 'wppw', 'wppw', 'wwww']));                       // довгі вушка
      around(cellsOf(21, 11, ['.ww', 'www', 'www', '.ww']));                                                                                       // хвостик-помпон
      cellsOf(6, 14, ['pp.pp', '.ppp.', 'pp.pp']); put(8, 14, 'f');                                                                                 // рожевий бант
      put(4, 10, 'q'); put(5, 10, 'q');
    }
  } else if (kind === 'sailor') {                            // моряк: біла матроска з синім коміром, шапка з якорем, червона хустка
    dye(12, 25, 9, 17, 'w');
    for (let x = 12; x <= 25; x++) { if (at(x, 9) === 'w') put(x, 9, 'n'); if (at(x, 10) === 'w') put(x, 10, 'n'); if (at(x, 16) === 'w') put(x, 16, 'n'); }
    for (let x = 13; x <= 24; x += 3) put(x, 12, 'n');
    cellsOf(6, 14, ['rrrr', '.rr.']);
    around(cellsOf(4, 2, ['..wwwwww..', '.wwwwwwww.', 'wwwwnnwwww']));
    cellsOf(3, 5, ['nnnnnnnnnn']);
  }
  return grid.map(row => '.' + row.reverse().join(''));
}
