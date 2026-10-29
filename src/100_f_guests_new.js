//#part 100_f_guests_new.js
/* Гості епох у стилі героїв (р. 73): тіло — спрайт покупця потрібного виду, зверху капелюх і одяг на все тіло (paintOutfit). Малюються ліниво. */
const GUEST_LOOK = {
  shnyr:  { sp: 'raccoon' },
  shnyr0: { sp: 'raccoon', hat: ['..rr........yy..', '.rrrr......yyyy.', '..rrrr....yyyy..', '...rrryyyyrrr...'], of: { c: '#d83a3a', paint: a => { for (let y = a.T0; y < a.H; y++) for (let x = 0; x < a.W; x++) if ((x + y) % 4 < 2) a.px(x, y, '#f2c230'); a.row(a.T0, '#ffffff', 3); } } },       // блазень
  shnyr1: { sp: 'raccoon', hat: ['......yyyy......', '....yyyyyyyy....', '..rrrrrrrrrrrr..', '.yyyyyyyyyyyyyy.'], of: { c: '#7a4f35', paint: a => { a.row(a.T0, '#fff4dc', 2); a.px(a.cx, 21, '#c4553d'); a.px(a.cx, 22, '#c4553d'); a.px(a.cx - 1, 21, '#c4553d'); a.px(a.cx - 1, 22, '#c4553d'); a.row(25, '#4a3228', 0); } } },       // комівояжер
  shnyr2: { sp: 'raccoon', hat: 'headphones', of: { c: '#262636', paint: a => { a.row(21, '#ef4fb0', 2); a.row(24, '#4fd0ef', 2); } } },       // діджей
  shnyr3: { sp: 'raccoon', hat: ['................', '....vvvvvvvv....', '...vvvvvvvvvv...', '...vvvvvvvvvvvv.'], of: { c: '#7a4fc0', paint: a => { a.px(a.cx - 2, 22, '#e8e0ff'); a.px(a.cx - 1, 22, '#e8e0ff'); a.px(a.cx, 22, '#e8e0ff'); a.px(a.cx + 1, 22, '#e8e0ff'); a.row(a.T0, '#4a2a8c', 2); } } },       // геймер
  shnyr4: { sp: 'raccoon', hat: ['....kkkkkkkk....', '...kkkkkkkkkk...', '..kkkkkkkkkkkk..', '..kkk......kkk..'], of: { c: '#22222c', paint: a => { a.row(22, '#2fd0c0', 3); a.px(a.cx - 1, 24, '#2fd0c0', 1); a.px(a.cx, 24, '#2fd0c0', 1); } } },       // хакер
  shnyr5: { sp: 'raccoon', hat: ['.g..g..gg..g..g.', '.gggggggggggggg.', '..GgGgGgGgGgGg..', '...GGGGGGGGGG...'], of: { c: '#4f9a63', paint: a => { a.row(23, '#7a5a30', 0); a.px(7, 22, '#78c27a'); a.px(11, 21, '#78c27a'); a.px(a.cx, 24, '#e8f0c0'); } } },       // еко-інспектор
  shnyr6: { sp: 'raccoon', hat: 'bubble', of: { c: '#f4f4f4', paint: a => { a.px(a.cx - 2, 22, '#3f8fd0', 1); a.px(a.cx - 1, 22, '#3f8fd0', 1); a.px(a.cx + 1, 22, '#d23a3a', 1); a.row(24, '#e8863c', 0); } } },       // у скафандрі
  shnyr7: { sp: 'raccoon', hat: ['..f..f..f..f..f.', '..ffffffffffffff', '..faffaffaffaff.', '...ffffffffff...'], of: { c: '#d23aa8', paint: a => { a.row(22, '#4fe8f0', 2); a.row(24, '#4fe8f0', 2); } } },       // неоновий бос
  shnyr8: { sp: 'raccoon', hat: ['.......rr.......', '.....rrrrrr.....', '...rrrrrrrrrr...', '....rrrrrrrr....'], of: { c: '#e8dcc0', paint: a => { [[6, 21, '#d23a3a'], [10, 22, '#3f8fd0'], [8, 24, '#f2c230'], [12, 24, '#4f9a63']].forEach(p => a.px(p[0], p[1], p[2], 1)); a.row(a.T0, '#7a4f35', 3); } } },       // художник
  shnyr9: { sp: 'raccoon', hat: ['.......hh.......', '.....hhhhhh.....', '...hhhhhhhhhh...', '.hhhhhhhhhhhhhh.'], of: { c: '#3d5a8c', paint: a => { a.row(23, '#fff4dc', 0); a.row(a.T0, '#fff4dc', 3); a.px(a.cx - 1, 21, '#fff4dc'); a.px(a.cx, 21, '#fff4dc'); } } },       // Японія: кімоно
  pip:    { sp: 'penguin', hat: ['................', '.....wwwwww.....', '....wwwwwwww....', '....rrrrrrrr....'], of: { paint: a => { a.row(a.T0, '#d23a3a', 3); a.px(a.cx - 1, 21, '#d23a3a', 1); a.px(a.cx, 21, '#d23a3a', 1); } } },
  zina:   { sp: 'cow', hat: ['..pp........pp..', '.pppp......pppp.', '.pppp.pppp.pppp.', '..pp..pppp..pp..'], of: { c: '#ff8fc0', paint: a => { a.row(a.T0, '#ffffff', 3); a.row(24, '#c8508a', 0); a.px(7, 22, '#ffe0f0', 1); a.px(11, 23, '#ffe0f0', 1); } } },
  maks:   { sp: 'monkey', hat: ['................', '.....TTTTTT.....', '....TTTTTTTT....', '....yyyyyyyy....'], of: { c: '#2f8f9a', paint: a => { a.row(22, '#f2c230', 2); a.px(a.cx - 1, a.T0 + 1, '#1f6a74'); a.px(a.cx, a.T0 + 1, '#1f6a74'); } } },
  bitik:  { sp: 'mouse', robot: true, of: { c: '#8d98a6', paint: a => { a.row(22, '#6a7684', 2); a.px(a.cx - 1, 23, '#4fe8f0', 1); a.px(a.cx, 23, '#4fe8f0', 1); a.row(25, '#3f4854', 0); } } },
  lesyk:  { sp: 'deer', hat: ['.g...g..g...g...', '..GgggGgggGg....', '................', '................'], of: { c: '#4f9a63', paint: a => { for (let y = a.T0; y < a.H; y++) for (let x = 0; x < a.W; x++) if ((x + 2 * y) % 5 === 0) a.px(x, y, '#2f6b48'); else if ((x + 2 * y) % 5 === 2) a.px(x, y, '#78c27a'); a.row(23, '#7a5a30', 0); a.px(7, 23, '#ff9fb8', 1); } } },
  orbit:  { sp: 'hamster', hat: 'bubble', of: { c: '#f4f4f4', paint: a => { a.px(a.cx - 2, 22, '#3f8fd0', 1); a.px(a.cx - 1, 22, '#3f8fd0', 1); a.px(a.cx + 1, 22, '#d23a3a', 1); a.row(24, '#e8863c', 0); } } },
  lumi:   { sp: 'chick', hat: ['.f............f.', '..f..........f..', '...f........f...', '....ff....ff....'], of: { paint: a => { [[a.cx - 1, 22], [a.cx, 22], [a.cx - 1, 23], [a.cx, 23]].forEach(p => a.px(p[0], p[1], '#ffffff', 1)); a.px(a.cx - 2, 22, '#fff0a0', 1); a.px(a.cx + 1, 22, '#fff0a0', 1); a.px(a.cx - 2, 23, '#fff0a0', 1); a.px(a.cx + 1, 23, '#fff0a0', 1); a.px(a.cx - 1, 21, '#fff0a0', 1); a.px(a.cx, 21, '#fff0a0', 1); a.px(a.cx - 1, 24, '#fff0a0', 1); a.px(a.cx, 24, '#fff0a0', 1); } } },
  bruno:  { sp: 'koala', hat: ['.......rr.......', '....rrrrrrrr....', '...rrrrrrrrrr...', '...wwwwwwwwww...'], of: { c: '#4a5260', paint: a => { a.row(a.T0, '#d23a3a', 2); a.px(a.cx + 1, 21, '#d23a3a'); a.px(a.cx + 1, 22, '#d23a3a'); a.px(a.cx, 22, '#ffd860', 1); a.row(25, '#2a2f38', 0); } } },
  pietro: { sp: 'cat', hat: ['.......rr.......', '....nnnnnnnn....', '..nnnnnnnnnnnn..', '....nnnnnnnn....'], of: { c: '#e8863c', paint: a => { a.row(22, '#ffe08a', 2); a.row(24, '#ffe08a', 2); a.row(a.T0, '#fff4dc', 3); } } },
  sora:   { sp: 'tiger', hat: ['.......kk.......', '......kkkk......', '....kkkkkkkk....', '...kkkkkkkkkk...'], of: { c: '#3d5a8c', paint: a => { a.row(23, '#fff4dc', 0); a.row(a.T0, '#fff4dc', 3); a.px(a.cx - 1, 21, '#fff4dc'); a.px(a.cx, 21, '#fff4dc'); a.px(7, 22, '#8fb0e0', 1); a.px(11, 24, '#8fb0e0', 1); } } }
};
Object.keys(GUEST_LOOK).forEach(id => { if (!TEAM_SPECIES[id]) TEAM_SPECIES[id] = GUEST_LOOK[id].sp; });
function guestRobotHead(g, W, y0) {                                  // Бітик: металева голова із чорним екраном, блакитними очима й антеною
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  R(2, y0 - 1, 14, 12, '#2a2f38'); R(3, y0, 12, 10, '#aab4c0'); R(3, y0, 12, 1, '#dfe6ee'); R(3, y0 + 9, 12, 1, '#7a8694');
  R(1, y0 + 3, 1, 4, '#6a7684'); R(16, y0 + 3, 1, 4, '#6a7684');
  R(4, y0 + 2, 10, 6, '#14181f'); R(5, y0 + 4, 3, 2, '#4fe8f0'); R(10, y0 + 4, 3, 2, '#4fe8f0'); R(7, y0 + 7, 4, 1, '#4fe8f0');
  R(8, y0 - 3, 2, 2, '#6a7684'); R(8, y0 - 4, 2, 1, '#d23a3a');
}
function guestSprite(id, space) {
  const L = GUEST_LOOK[id], hat = space ? 'bubble' : L.hat;
  const of = space ? { c: '#f4f4f4', paint: a => { a.px(a.cx - 2, 22, '#3f8fd0', 1); a.px(a.cx - 1, 22, '#3f8fd0', 1); a.px(a.cx + 1, 22, '#d23a3a', 1); a.row(24, '#e8863c', 0); } } : L.of;
  const c = dressHero(id, { hat: L.robot && !space ? null : hat, outfit: of });
  if (L.robot && !space) {
    const g = c.getContext('2d'), px = g.getImageData(0, 0, c.width, c.height).data;
    let y0 = 0; for (; y0 < c.height; y0++) { let run = 0, best = 0; for (let x = 0; x < c.width; x++) { run = px[(y0 * c.width + x) * 4 + 3] > 128 ? run + 1 : 0; if (run > best) best = run; } if (best >= 8) break; }
    guestRobotHead(g, c.width, y0);
  }
  return c;
}
Object.keys(GUEST_LOOK).forEach(id => { SPRITES['npc_' + id] = { get canvas() { delete this.canvas; return (this.canvas = guestSprite(id, false)); } }; });
