//#part 275_k_stand_sora.js
/* Чайний будиночок Сори v2: дошки, черепиця, норен, чайник із парою, манекі-неко, ліхтарі. Зразок: previews/mock10/sora_new.js */
(() => {
  const rr = Math.round;
  const rc = (g, a, b, w, h, c) => R(g, rr(a), rr(b), rr(w), rr(h), c);
  const soraNew = (g, x, y, t) => {
    const OUT = '#1d1210';
    g.globalAlpha = 0.25; rc(g, x - 31, y, 62, 2, '#000'); g.globalAlpha = 1;
    // поміст з дошок
    rc(g, x - 28, y - 6, 56, 6, OUT); rc(g, x - 27, y - 5, 54, 4, '#8a5230'); rc(g, x - 27, y - 5, 54, 1, '#d29a58'); rc(g, x - 27, y - 2, 54, 1, '#5e3220');
    for (let i = -3; i <= 3; i++) rc(g, x + i * 8, y - 4, 1, 3, '#5e3220');
    // стіна позаду: тепле нутро, полиця з банками
    rc(g, x - 22, y - 36, 44, 30, OUT); rc(g, x - 21, y - 35, 42, 29, '#4a2c1c'); rc(g, x - 21, y - 35, 42, 3, '#2e1a10');
    rc(g, x - 20, y - 27, 40, 2, '#a86a38'); rc(g, x - 20, y - 27, 40, 1, '#d29a58');
    [[-17, '#d3342c'], [-11, '#e8b030'], [-5, '#4f9a3a'], [13, '#f4ece0'], [18, '#d3342c']].forEach(([dx, c], i) => { rc(g, x + dx, y - 33, 4, 6, OUT); rc(g, x + dx + 1, y - 32, 2, 4, c); rc(g, x + dx, y - 34, 4, 1, '#2a1a10'); rc(g, x + dx + 1, y - 32, 1, 3, 'rgba(255,255,255,.4)'); });
    // стовпи з текстурою
    [-24, 21].forEach((dx, k) => { rc(g, x + dx - 1, y - 38, 6, 33, OUT); rc(g, x + dx, y - 38, 4, 33, '#6a3a20'); rc(g, x + dx, y - 38, 1, 33, '#b97a42'); rc(g, x + dx + 3, y - 38, 1, 33, '#3e1f10'); for (let j = 0; j < 5; j++) rc(g, x + dx + 1, y - 34 + j * 6, 2, 1, '#8a5230'); });
    // дах: вигнута черепиця з відблисками й золотим гребенем
    for (let i = 0; i < 10; i++) {
      const ins = (9 - i) * 1.5, lx = x - 33 + ins, rw = 66 - 2 * ins, ry = y - 56 + i;
      rc(g, lx - 1, ry, rw + 2, 1, OUT); rc(g, lx, ry, rw, 1, i % 2 ? '#41605c' : '#2c4644');
      for (let k = lx + (i % 2) * 3; k < lx + rw - 1; k += 6) { rc(g, k, ry, 1, 1, '#1b2c2c'); rc(g, k + 2, ry, 1, 1, i % 2 ? '#7aa8a0' : '#5a8880'); }
    }
    rc(g, x - 34, y - 46, 68, 1, OUT); rc(g, x - 33, y - 47, 66, 1, '#5a8880'); rc(g, x - 36, y - 46, 3, 2, OUT); rc(g, x + 33, y - 46, 3, 2, OUT);        // загнуті краї
    rc(g, x - 8, y - 60, 16, 4, OUT); rc(g, x - 7, y - 59, 14, 2, '#f0c040'); rc(g, x - 7, y - 59, 14, 1, '#fff0a0'); rc(g, x - 3, y - 62, 6, 2, '#f0c040'); rc(g, x - 1, y - 64, 2, 2, '#fff0a0');
    g.globalAlpha = 0.35; rc(g, x - 22, y - 45, 44, 9, '#1a0e08'); g.globalAlpha = 1;                                                                // тінь під дахом
    // норен із емблемами, що колишеться
    rc(g, x - 22, y - 40, 44, 2, OUT); rc(g, x - 21, y - 40, 42, 1, '#7a4a28');
    [0, 1, 2, 3].forEach(i => {
      const sw = Math.round(Math.sin(t * 1.5 + i * 0.7) * (i % 2 ? 1.2 : 0.8)), nx = x - 20 + i * 10.4 + sw, ind = i % 2 === 0;
      rc(g, nx - 1, y - 38, 10, 14, OUT); rc(g, nx, y - 38, 8, 13, ind ? '#1c3a78' : '#f4ece0'); rc(g, nx, y - 38, 1, 13, ind ? '#3a62b0' : '#fff'); rc(g, nx, y - 26, 8, 1, ind ? '#10224a' : '#cfc4b0');
      if (ind) { rc(g, nx + 3, y - 34, 2, 5, '#f4ece0'); rc(g, nx + 2, y - 33, 4, 1, '#f4ece0'); rc(g, nx + 2, y - 30, 4, 1, '#f4ece0'); } else { rc(g, nx + 3, y - 34, 2, 2, '#d3342c'); rc(g, nx + 2, y - 31, 4, 1, '#d3342c'); rc(g, nx + 3, y - 29, 2, 1, '#d3342c'); }
    });
    // прилавок із дерева й червоною доріжкою
    rc(g, x - 20, y - 17, 40, 12, OUT); rc(g, x - 19, y - 16, 38, 10, '#9a5a30'); rc(g, x - 19, y - 16, 38, 2, '#d29a58'); rc(g, x - 19, y - 8, 38, 2, '#6a3a20');
    for (let i = 0; i < 5; i++) rc(g, x - 14 + i * 8, y - 14, 1, 6, '#7a4524');
    rc(g, x - 19, y - 13, 38, 2, '#d3342c'); rc(g, x - 19, y - 13, 38, 1, '#f06a50');
    // чайник із парою
    rc(g, x - 12, y - 24, 11, 8, OUT); rc(g, x - 11, y - 23, 9, 6, '#34383c'); rc(g, x - 11, y - 23, 3, 5, '#6a7078'); rc(g, x - 8, y - 26, 5, 2, '#34383c'); rc(g, x - 2, y - 22, 3, 2, '#34383c'); rc(g, x - 13, y - 22, 2, 3, '#34383c');
    for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; g.globalAlpha = (1 - ph) * 0.75; rc(g, x - 8 + Math.sin(t * 2 + i * 2) * 2, y - 29 - ph * 11, 2, 2, '#ffffff'); }
    g.globalAlpha = 1;
    // чашки з зеленим чаєм і тарілка данго
    [[3, 0], [8, 1]].forEach(([dx, k]) => { rc(g, x + dx, y - 21, 5, 5, OUT); rc(g, x + dx + 1, y - 20, 3, 3, '#ffffff'); rc(g, x + dx + 1, y - 20, 3, 1, '#7ab648'); rc(g, x + dx + 1, y - 17, 3, 1, '#c8d4e8'); });
    rc(g, x + 13, y - 19, 8, 3, OUT); rc(g, x + 14, y - 18, 6, 1, '#e8e0d0'); [[14, '#ff9fc0'], [16, '#ffffff'], [18, '#7ab648']].forEach(([dx, c]) => { rc(g, x + dx, y - 24, 2, 3, OUT); rc(g, x + dx, y - 23, 2, 2, c); }); rc(g, x + 14, y - 21, 6, 1, '#8a5230');
    // манекі-неко махає лапою
    const wv = Math.sin(t * 4) > 0 ? 1 : 0;
    rc(g, x + 22, y - 18, 8, 12, OUT); rc(g, x + 23, y - 17, 6, 10, '#ffffff'); rc(g, x + 23, y - 17, 6, 2, '#f4ece0'); rc(g, x + 23, y - 20, 2, 3, OUT); rc(g, x + 27, y - 20, 2, 3, OUT); rc(g, x + 24, y - 19, 1, 2, '#ff9fc0'); rc(g, x + 27, y - 19, 1, 2, '#ff9fc0');
    rc(g, x + 24, y - 15, 1, 1, OUT); rc(g, x + 27, y - 15, 1, 1, OUT); rc(g, x + 25, y - 13, 2, 1, '#d3342c'); rc(g, x + 23, y - 11, 6, 2, '#e8b030'); rc(g, x + 25, y - 11, 2, 1, '#fff0a0');
    rc(g, x + 20, y - 17 - wv * 2, 3, 5, OUT); rc(g, x + 21, y - 16 - wv * 2, 1, 4, '#ffffff');
    // ліхтарі, що розгойдуються, з теплим сяйвом
    [[-29, '#d3342c', 0], [29, '#e8503a', 1]].forEach(([dx, c, i]) => {
      const lx = x + dx + Math.sin(t * 1.3 + i * 1.5) * 1.6, ly = y - 38;
      rc(g, lx - 0.5, ly - 6, 1, 6, OUT); rc(g, lx - 4, ly, 9, 12, OUT); rc(g, lx - 3, ly + 1, 7, 10, c); rc(g, lx - 3, ly + 1, 2, 10, '#ff9a80'); rc(g, lx - 3, ly + 5, 7, 1, '#a82018'); rc(g, lx - 1, ly + 3, 3, 4, '#ffe08a'); rc(g, lx - 4, ly - 1, 9, 2, '#2a1a10'); rc(g, lx - 3, ly + 12, 7, 1, '#2a1a10');
      g.globalAlpha = 0.10 + 0.03 * Math.sin(t * 3 + i); disc(g, rr(lx), ly + 6, 9, '#ffd45c'); g.globalAlpha = 1;
    });
    // лавка з подушкою
    rc(g, x + 30, y - 11, 9, 3, OUT); rc(g, x + 31, y - 10, 7, 1, '#d29a58'); rc(g, x + 31, y - 9, 7, 1, '#8a5230'); rc(g, x + 31, y - 8, 1, 3, OUT); rc(g, x + 37, y - 8, 1, 3, OUT); rc(g, x + 32, y - 13, 5, 2, OUT); rc(g, x + 33, y - 13, 3, 1, '#d3342c');
    // пелюстки сакури
    for (let i = 0; i < 5; i++) { const ph = (t * 0.22 + i * 0.2) % 1, px = x - 30 + ((i * 17 + ph * 20) % 62) + Math.sin(t * 1.4 + i) * 3, py = y - 62 + ph * 62; g.globalAlpha = Math.min(1, ph * 6) * (1 - Math.max(0, ph - 0.85) * 6); rc(g, px, py, 2, 1, '#ffc9d4'); rc(g, px + 1, py + 1, 1, 1, '#ff8fb3'); }
    g.globalAlpha = 1;
  };
  STANDS.sora.draw = soraNew;
})();
