//#part 230_b_circus_loot_letters.js
const circusCanvas = document.createElement('canvas'); circusCanvas.width = 160; circusCanvas.height = 84;
function drawCircus() {
  const c = state.circus; if (c.phase < 2) return;
  const s = circus.setup === undefined ? 0 : circus.setup, moving = c.phase === 2.5 || c.phase === 4;
  const g = circusCanvas.getContext('2d'); if (c.hag) HAG_ART.draw(g, circus.t, s, moving); else if (c.noodle) NOODLE_ART.draw(g, circus.t, s, moving); else CIRCUS_ART.draw(g, circus.t, s, moving);
  const x = Math.round(circus.x) - 80, y = circusY();
  ctx.globalAlpha = 0.25; R(ctx, x + 6 + Math.round(8 * s), y - 2, 128 - Math.round(8 * s) * 2 + (s < 0.5 ? -30 + Math.round(60 * s) : 0), 3, 'd'); ctx.globalAlpha = 1;
  ctx.drawImage(circusCanvas, x, y - 76);
  if (c.phase === 3 && !c.spun && Math.floor(circus.t * 2) % 2) {        // мерехтливі іскри — «тапни на мене»
    R(ctx, x + 26, y - 78, 1, 3, 'y'); R(ctx, x + 25, y - 77, 3, 1, 'y'); R(ctx, x + 136, y - 56, 1, 3, 'y'); R(ctx, x + 135, y - 55, 3, 1, 'y'); R(ctx, x + 70, y - 90, 1, 3, 'y'); R(ctx, x + 69, y - 89, 3, 1, 'y');
  }
}
function drawBang() {
  const c = state.circus; if (c.phase !== 1) return;
  const p = bangPos(), steps = [1, 1.15, 1.3, 1.15], k = steps[Math.floor(circus.bangT * 4) % 4], spr = CIRCUS_ART.bangSprite();
  const w = Math.round(9 * k), h = Math.round(20 * k);
  if (circus.bangT > CONFIG.CIRCUS_BANG_SECONDS - 8 && Math.floor(circus.bangT * 6) % 2) return;       // наприкінці блимає й зникає
  ctx.globalAlpha = 0.25; R(ctx, p.x - 5, p.y - 1, 11, 2, 'd'); ctx.globalAlpha = 1;
  ctx.drawImage(spr, Math.round(p.x - w / 2), p.y - h, w, h);
}
function hitCircus(p) {
  const c = state.circus;
  if (c.phase === 1) {
    const b = bangPos();
    if (Math.abs(p.x - b.x) <= 12 && p.y >= b.y - 30 && p.y <= b.y + 6) {
      c.phase = 2.5; circus.drive = 0; circus.sx = undefined; circus.sx = circusStartX(); circus.x = circus.sx; saveGame();
      if (c.hag) { circus.hold = true; circus.holdT = 0; hagTap(); playSfx('hagCackle'); } else playSfx('build');
      return true;
    }
  } else if (c.phase === 3) {
    const y = circusY();
    if (p.x >= circus.x - 80 && p.x <= circus.x + 80 && p.y >= y - 80 && p.y <= y) { openCircus(); return true; }
  }
  return false;
}

/* ---- вікно колеса ---- */
// Маленькі піксельні значки на секторах
function drawWheelIcon(g, kind, cx, cy) {
  const cc = EPOCH_COIN_COLORS[viewEpoch() % EPOCH_COIN_COLORS.length];
  const coin = (x, y) => { disc(g, x, y, 4, 'd'); disc(g, x, y, 3, cc[0]); R(g, x - 1, y - 2, 2, 1, cc[1]); };
  switch (kind) {
    case 'gem': { const rows = SPRITES[gemSprite()].rows; rows.forEach((row, ry) => { for (let rx = 0; rx < 8; rx++) if (row[rx] !== '.') R(g, cx - 4 + rx, cy - 4 + ry, 1, 1, row[rx]); }); break; }
    case 'coin1': coin(cx, cy); break;
    case 'coin2': coin(cx - 4, cy + 2); coin(cx + 4, cy - 2); break;
    case 'coin3': coin(cx - 5, cy + 3); coin(cx + 5, cy + 3); coin(cx, cy - 3); break;
    case 'up':
      for (let i = 0; i < 6; i++) { R(g, cx - i - 1, cy - 7 + i, 2 * i + 3, 1, 'd'); R(g, cx - i, cy - 7 + i, 2 * i + 1, 1, 'w'); }
      R(g, cx - 3, cy - 1, 7, 8, 'd'); R(g, cx - 2, cy - 1, 5, 7, 'w'); break;
    case 'tap':
      for (let i = 0; i < 9; i++) { R(g, cx - 4, cy - 7 + i, Math.min(i + 2, 7), 1, 'd'); R(g, cx - 3, cy - 7 + i, Math.max(1, Math.min(i, 5)), 1, 'w'); }
      R(g, cx - 1, cy + 1, 3, 7, 'd'); R(g, cx, cy + 1, 1, 6, 'w'); break;
    case 'star': {
      const star = ['.....y.....', '....yyy....', '....yyy....', 'yyyyyyyyyyy', '.yyyyyyyyy.', '..yyyyyyy..', '..yyyyyyy..', '.yyyy.yyyy.', '.yyy...yyy.', 'yy.......yy'];
      const draw = (ox, oy, col) => star.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] === 'y') R(g, cx - 5 + rx + ox, cy - 5 + ry + oy, 1, 1, col); });
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([ox, oy]) => draw(ox, oy, 'd'));   // контур
      draw(0, 0, 'w'); draw(0, 1, 'h');
      break;
    }
  }
}
function drawCircusIcon(g, icon, cx, cy) {
  switch (icon) {
    case 'gem2': drawWheelIcon(g, 'gem', cx - 4, cy + 2); drawWheelIcon(g, 'gem', cx + 4, cy - 2); break;
    case 'gem3': drawWheelIcon(g, 'gem', cx - 5, cy + 3); drawWheelIcon(g, 'gem', cx + 5, cy + 3); drawWheelIcon(g, 'gem', cx, cy - 3); break;
    case 'brick': R(g, cx - 6, cy - 4, 13, 9, 'd'); R(g, cx - 5, cy - 3, 5, 3, 'E'); R(g, cx + 1, cy - 3, 5, 3, 'E'); R(g, cx - 5, cy + 1, 2, 3, 'E'); R(g, cx - 2, cy + 1, 5, 3, 'E'); R(g, cx + 4, cy + 1, 2, 3, 'E'); break;
    case 'house': R(g, cx - 5, cy - 1, 11, 7, 'd'); R(g, cx - 4, cy, 9, 5, 'w'); for (let i = 0; i < 5; i++) R(g, cx - 5 + i, cy - 2 - i, 11 - 2 * i, 1, 'd'); for (let i = 0; i < 4; i++) R(g, cx - 4 + i, cy - 2 - i, 9 - 2 * i, 1, 'r'); R(g, cx - 1, cy + 2, 3, 4, 'd'); break;
    case 'cloud': disc(g, cx - 3, cy + 1, 3, 'd'); disc(g, cx + 3, cy + 1, 3, 'd'); disc(g, cx, cy - 2, 4, 'd'); disc(g, cx - 3, cy + 1, 2, 'w'); disc(g, cx + 3, cy + 1, 2, 'w'); disc(g, cx, cy - 2, 3, 'w'); R(g, cx - 4, cy + 3, 9, 2, 'w'); disc(g, cx + 5, cy - 5, 2, 'y'); break;
    case 'paw': disc(g, cx, cy + 2, 4, 'd'); disc(g, cx, cy + 2, 3, 'c'); [[-4, -3], [-1, -5], [2, -5], [5, -3]].forEach(p => { disc(g, cx + p[0], cy + p[1], 2, 'd'); disc(g, cx + p[0], cy + p[1], 1, 'c'); }); break;
    case 'bag': R(g, cx - 4, cy - 2, 9, 8, 'd'); R(g, cx - 3, cy - 1, 7, 6, 'h'); R(g, cx - 2, cy - 5, 5, 3, 'd'); R(g, cx - 1, cy - 4, 3, 1, 'h'); R(g, cx, cy, 1, 3, 'd'); break;
    case 'hat': R(g, cx - 6, cy + 2, 13, 3, 'd'); R(g, cx - 5, cy + 3, 11, 1, 'u'); R(g, cx - 3, cy - 6, 7, 9, 'd'); R(g, cx - 2, cy - 5, 5, 7, 'u'); R(g, cx - 2, cy, 5, 2, 'y'); R(g, cx, cy - 3, 1, 1, 'w'); break;
    case 'gift': R(g, cx - 5, cy - 1, 11, 8, 'd'); R(g, cx - 4, cy, 9, 6, 'r'); R(g, cx - 1, cy - 1, 3, 8, 'y'); R(g, cx - 5, cy + 2, 11, 1, 'y'); R(g, cx - 4, cy - 4, 4, 3, 'd'); R(g, cx - 3, cy - 3, 2, 1, 'y'); R(g, cx + 1, cy - 4, 4, 3, 'd'); R(g, cx + 2, cy - 3, 2, 1, 'y'); break;
    case 'clover': disc(g, cx - 3, cy - 2, 3, 'd'); disc(g, cx + 3, cy - 2, 3, 'd'); disc(g, cx - 3, cy + 3, 3, 'd'); disc(g, cx + 3, cy + 3, 3, 'd'); disc(g, cx - 3, cy - 2, 2, 'g'); disc(g, cx + 3, cy - 2, 2, 'g'); disc(g, cx - 3, cy + 3, 2, 'g'); disc(g, cx + 3, cy + 3, 2, 'g'); R(g, cx, cy, 1, 7, 'G'); break;
    default: drawWheelIcon(g, icon, cx, cy);
  }
}
function buildCircusWheelTexture() {
  const S = 128, cv = document.createElement('canvas'); cv.width = S; cv.height = S; const g = cv.getContext('2d');
  const cx = 64, cy = 64, step = Math.PI / 6;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.sqrt(dx * dx + dy * dy);
    if (r > 62) continue;
    let col;
    if (r >= 59) col = 'd';
    else if (r < 9) col = r >= 7 ? 'd' : 'h';
    else { let a = Math.atan2(dx, -dy); if (a < 0) a += Math.PI * 2; const sec = Math.floor(a / step), frac = a / step - sec, edge = Math.min(frac, 1 - frac) * step * r; col = edge < 0.9 ? 'd' : (r >= 55.5 && r < 57 ? ((Math.floor(a / step * 3) % 2) ? 'w' : 'y') : CIRCUS_SECTORS[sec].color); }
    R(g, x, y, 1, 1, col);
  }
  CIRCUS_SECTORS.forEach((s, i) => { const a = (i + 0.5) * step; drawCircusIcon(g, s.icon, Math.round(cx + Math.sin(a) * 38), Math.round(cy - Math.cos(a) * 38)); });
  return cv;
}
function drawCircusWheel() {
  const g = ui.circusWheel.getContext('2d'); g.imageSmoothingEnabled = false;
  if (!circus.tex) circus.tex = buildCircusWheelTexture();
  g.clearRect(0, 0, 128, 140); g.save(); g.translate(64, 76); g.rotate(circus.angle); g.drawImage(circus.tex, -64, -64); g.restore();
  for (let i = 0; i < 12; i++) { R(g, 64 - (12 - i), 2 + i, (12 - i) * 2, 1, 'd'); if (i > 1) R(g, 64 - (12 - i) + 2, 2 + i, (12 - i) * 2 - 4, 1, 'r'); }
}
function circusBusy() { return !!circus.anim || (!!circus.bonus && mgBusy()) || (!!state.circus.hag && ['show', 'shuffle', 'pick', 'reveal'].includes(hagGame.phase)) || (!!state.circus.noodle && ['cook', 'reveal'].includes(noodleGame.phase)); }
function openCircus() {
  if (dialog.active) return;
  circus.bonus = false;
  const hag = !!state.circus.hag, nd = !!state.circus.noodle;
  ui.circusModal.classList.toggle('hag', hag || nd); ui.circusModal.classList.remove('mg');
  if (nd) { ui.circusWheel.width = 192; ui.circusWheel.height = 120; if (noodleGame.phase === 'idle' || noodleGame.phase === 'done') noodleReset(); if (state.circus.spun) noodleGame.phase = 'done'; }
  else if (hag) { ui.circusWheel.width = HAG_W; ui.circusWheel.height = HAG_H; if (hagGame.phase === 'idle' || hagGame.phase === 'done') hagReset(); if (state.circus.spun && hagGame.phase === 'idle') hagGame.phase = 'done'; }
  else { ui.circusWheel.width = 128; ui.circusWheel.height = 140; }
  ui.clownCanvas.width = hag ? 144 : 72; ui.clownCanvas.height = hag ? 80 : 40;       // портрет відьми в подвійній роздільності
  ui.circusModal.hidden = false;
  ui.circusTitle.textContent = t(nd ? 'noodleTitle' : hag ? 'hagTitle' : 'circusTitle'); ui.circusSub.textContent = t(nd ? 'noodleSub' : hag ? 'hagSub' : 'circusSub');
  ui.circusSkinNote.textContent = t('mgSkinOnly'); ui.circusSkinNote.hidden = false;                 // у вкладці «Бонуси» завжди: «Тут лише скіни»
  ui.circusClose.textContent = t(state.circus.spun ? (nd ? 'noodleDone' : hag ? 'hagDone' : 'circusDone') : 'wheelClose');
  ui.circusResult.textContent = '';
  updateCircusButtons();
}
function updateCircusButtons() {
  if (circus.bonus) { const b = mgButton(); ui.circusBtn.textContent = t(b.key); ui.circusBtn.disabled = b.off; return; }
  const hag = !!state.circus.hag, nd = !!state.circus.noodle;
  if (nd) {
    const cook = noodleGame.phase === 'cook';
    ui.circusBtn.textContent = t(cook ? 'noodleTake' : 'noodleStart');
    ui.circusBtn.disabled = cook ? false : (circusBusy() || !!state.circus.spun);
    return;
  }
  ui.circusBtn.textContent = t(hag ? 'hagStart' : 'circusSpin');
  ui.circusBtn.disabled = circusBusy() || !!state.circus.spun;
}
function closeCircus() {
  if (circusBusy()) return;
  ui.circusModal.hidden = true;
  if (circus.bonus) { circus.bonus = false; return; }
  if (state.circus.spun && state.circus.phase === 3) { state.circus.phase = 3.5; circus.setupT = CONFIG.CIRCUS_SETUP_SECONDS; circus.x = circusStopX(); playSfx('build'); saveGame(); }
}
function circusFreeSkins(type) { return SKIN_POOL.map((id, i) => i).filter(i => SKIN_POOL[i].split('_')[0] === type && !SKIN_HIDDEN.includes(SKIN_POOL[i]) && !SKIN_POOL[i].startsWith('capy_ep') && SKIN_POOL[i] !== 'capy_mel' && SKIN_POOL[i] !== 'capy_nika' && !skinHas(i)); }   // скіни епох у колесі не випадають
// Один випадковий сектор (з урахуванням скінів, що вже є) і його дія
function rollCircusSector(noSmall, withSkins) {
  const pool = withSkins ? CIRCUS_SECTORS.concat(BONUS_GAME_SKINS) : CIRCUS_SECTORS;   // скіни є лише в призах бонус-ігор (лапшична, відьма), у цирку їх нема
  const weight = x => (x.kind === 'skin' && !circusFreeSkins(x.skin).length ? 0 : (noSmall && x.kind === 'crystal' && (x.amount || 1) === 1 ? 0 : x.weight));
  const total = pool.reduce((a, x) => a + weight(x), 0);
  let roll = Math.random() * total, idx = 0;
  for (; idx < pool.length - 1; idx++) { roll -= weight(pool[idx]); if (roll < 0) break; }
  return { sec: pool[idx], idx };
}
function applyCircusSector(sec, now) {
  let text, skinPick = -1;
  state.stats.wheelSpins++;                       // лічильник «цирк і бонус-ігри» (нагорода, щоденне завдання, статистика)
  if (sec.kind === 'coins' || sec.kind === 'jackpot') {
    const gain = Math.floor(state.cps * sec.seconds + sec.flat * levelMult()); state.coins += gain; state.totalEarned += gain;
    text = t(sec.kind === 'jackpot' ? 'prize_jackpot' : 'prize_coins', fmt(gain)); if (sec.kind === 'jackpot') state.stats.jackpots++;
  } else if (sec.kind === 'crystal') { const n = sec.amount || 1; state.crystals += n; state.crystalsTotal += n; text = t('prize_crystal', n); }
  else if (sec.kind === 'income') { state.events.incomeBoostUntil = now + sec.minutes * 60000; state.events.incomeBoostMult = sec.mult; text = t('prize_income', sec.mult, sec.minutes); }
  else if (sec.kind === 'tap') { state.events.tapBoostUntil = now + sec.minutes * 60000; state.events.tapBoostMult = sec.mult; text = t('prize_tap', sec.mult, sec.minutes); }
  else { const free = circusFreeSkins(sec.skin), pick = free[Math.floor(Math.random() * free.length)]; skinGrant(pick); skinPick = pick; text = t('prize_skin', skinName(pick)); }
  recalcIncome();
  return { text, skin: skinPick };
}
function circusSpin() {
  if (circus.bonus) { mgAct(); return; }
  if (state.circus.noodle) { if (noodleGame.phase === 'cook') noodleTake(); else noodleStart(); return; }
  if (circusBusy() || state.circus.spun) return;
  if (state.circus.hag) { hagStart(); return; }
  const now = Date.now(), { sec, idx } = rollCircusSector(false), pr = applyCircusSector(sec, now), text = pr.text, skinPick = pr.skin;
  const step = Math.PI / 6, from = circus.angle % (Math.PI * 2), to = Math.PI * 2 * 5 + (Math.PI * 2 - (idx + 0.5) * step) + rand(-0.35, 0.35) * step;
  circus.anim = { t: 0, dur: CONFIG.WHEEL_SPIN_SECONDS, from, to, text, again: false, skin: skinPick };
  ui.circusResult.textContent = '…';
  state.circus.spun = 1;
  updateCircusButtons(); updateUI(); saveGame();
}
// Епічний лут: окреме святкове вікно з промінням і блиском, коли випав скін
let lootSkin = -1;
function openLoot(i) {
  const id = SKIN_POOL[i], type = id.split('_')[0], name = id.slice(type.length + 1);
  lootSkin = i;
  const src = skinPreviewCanvas(type, name), cv = ui.lootCanvas;
  cv.width = src.width; cv.height = src.height;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(src, 0, 0);
  const scale = Math.max(2, Math.floor(Math.min(300 / src.width, 130 / src.height)));
  cv.style.width = (src.width * scale) + 'px'; cv.style.height = (src.height * scale) + 'px';
  ui.lootTag.textContent = t('lootTag');
  ui.lootName.textContent = (SKIN_SEASON[id] ? SKIN_SEASON[id] + ' ' : '') + skinName(i);
  ui.lootType.textContent = t('skinCat_' + type);
  ui.lootWear.textContent = t('lootWear'); ui.lootClose.textContent = t('lootClose');
  ui.lootModal.querySelectorAll('.loot-spark').forEach(e => e.remove());
  for (let k = 0; k < 18; k++) {
    const sp = document.createElement('span'); sp.className = 'loot-spark'; sp.textContent = k % 3 ? '✦' : '✧';
    sp.style.left = (8 + Math.random() * 84) + '%'; sp.style.top = (28 + Math.random() * 50) + '%';
    sp.style.animationDelay = (Math.random() * 2.4).toFixed(2) + 's'; sp.style.fontSize = (11 + Math.random() * 14).toFixed(0) + 'px';
    ui.lootModal.appendChild(sp);
  }
  ui.lootModal.hidden = false;
  playSfx('achievement'); buzz(40);
}
function closeLoot(wear) {
  ui.lootModal.hidden = true;
  if (wear && lootSkin >= 0) { const id = SKIN_POOL[lootSkin], type = id.split('_')[0]; if (state.skins[type] !== lootSkin) equipSkin(type, lootSkin); }
  lootSkin = -1;
}
function updateCircusSpin(dt) {
  const a = circus.anim; if (!a) return;
  a.t += dt;
  const k = Math.min(1, a.t / a.dur), e = 1 - Math.pow(1 - k, 3), prev = Math.floor(circus.angle / (Math.PI / 6));
  circus.angle = a.from + (a.to - a.from) * e;
  if (Math.floor(circus.angle / (Math.PI / 6)) !== prev && performance.now() - audio.lastTick > 40) { audio.lastTick = performance.now(); playSfx('wheelTick'); }
  if (k >= 1) {
    circus.anim = null; circus.angle = a.to % (Math.PI * 2);
    ui.circusResult.textContent = a.text; playSfx('wheelWin');
    if (a.skin >= 0) setTimeout(() => openLoot(a.skin), 500); else showToast(a.text, 'good');
    ui.circusClose.textContent = t(state.circus.spun ? 'circusDone' : 'wheelClose');
    updateCircusButtons(); updateUI(); saveGame();
  }
}


/* ---------- Поштова машина: раз на 40 хвилин привозить лист із випадковим бонусом ---------- */
const mail = { state: 'idle', x: 0, t: 0, letter: null };
function mailRoadY() { return worldB() - 7; }                 // де стоять колеса на дорозі
function mailStopX() { return LAYOUT.centerX - 70; }
function mailBoxX() { return mailStopX() - 30; }
function updateMail(dt) {
  const now = Date.now(), ev = state.events;
  if (!ev.nextMail) ev.nextMail = now + CONFIG.MAIL_FIRST_SECONDS * 1000;
  const quiet = !dialog.active && !epochIntro.active && !build && ui.modal.hidden && ui.letterModal.hidden;
  if (mail.state === 'idle') {
    if (now >= ev.nextMail && quiet && state.circus.phase === 0) {
      ev.nextMail = now + CONFIG.MAIL_MINUTES * 60000;
      if (!ev.mailPending) {
        const pool = CUSTOMER_TYPES.filter(k => k !== 'raccoon' && k !== mail.who);                          // щоразу інший звіряток-кур'єр
        mail.who = pool[Math.floor(Math.random() * pool.length)]; mail.said = false; mail.honk = false; mail.dustT = 0;
        mail.state = 'arriving'; mail.x = Math.max(mailStopX() + 130, Math.min(worldR() + 50, visR() + 60)); mail.t = 0; playSfx('sale'); showToast(t('mailArrive'), 'big');
      }
    }
    return;
  }
  mail.t += dt;
  const moving = mail.state === 'arriving' || mail.state === 'leaving', gy = mailRoadY();
  if (moving && animOn()) {                                                                                 // вихлопні клубочки позаду й пил із-під коліс
    mail.dustT -= dt;
    if (mail.dustT <= 0) { mail.dustT = 0.1; fx.dust.push({ x: mail.x + 19, y: gy - 3, r: 1.6, vx: rand(8, 16), vy: rand(-12, -5), age: 0, life: 0.7 }); if (mail.state === 'leaving') fx.dust.push({ x: mail.x + 17, y: gy - 1, r: 1.8, vx: rand(10, 20), vy: rand(-6, -1), age: 0, life: 0.5 }); }
  }
  if (mail.state === 'arriving') {
    const d = mail.x - mailStopX();
    mail.x -= Math.max(9, Math.min(55, d * 1.5)) * dt;                                                      // підʼїжджає повільніше й гальмує
    if (mail.x <= mailStopX() + 0.4) { mail.x = mailStopX(); mail.state = 'stopped'; mail.t = 0; spawnDust(mail.x - 11, gy, 3); spawnDust(mail.x + 9, gy, 2); playSfx('pip'); }
  } else if (mail.state === 'stopped') {
    const T = MAIL_T;
    if (mail.t > T.wave0 && !mail.said) { mail.said = true; const cp = mailCourier(); if (cp) showBubble('mailer', t('mailSay' + Math.floor(Math.random() * 4)), cp.x, cp.foot - 30, () => { const q = mailCourier(); if (q) mail.lastCp = { x: q.x, y: q.foot - 30 }; return mail.lastCp || { x: cp.x, y: cp.foot - 30 }; }); }
    if (mail.t > T.put1 && !ev.mailPending) { ev.mailPending = 1; saveGame(); playSfx('wheelWin'); }
    if (mail.t > T.in1 + 0.15 && !mail.honk) { mail.honk = true; playSfx('pip'); }
    if (mail.t > T.leave) { mail.state = 'leaving'; mail.t = 0; }
  } else if (mail.state === 'leaving') {
    mail.x -= Math.min(70, 12 + mail.t * 45) * dt;
    if (mail.x < worldL() - 50) { mail.state = 'idle'; }
  }
}
// Кур'єр: вистрибує із задніх дверцят, іде до поштомата, кладе лист, махає й повертається. Повертає позицію й позу (або null, коли він у кузові)
const MAIL_T = { out0: 0.45, out1: 0.95, walk1: 2.55, put1: 3.35, wave0: 3.4, wave1: 4.4, back1: 6.0, in1: 6.5, door1: 6.9, leave: 7.1 };
function mailCourier() {
  const t = mail.t, T = MAIL_T, gy = mailRoadY(), rx = Math.round(mail.x) + 20, bx = mailBoxX() + 15, foot0 = gy + 3;
  if (mail.state !== 'stopped' || t < T.out0 || t >= T.in1) return null;
  let x, foot = foot0, flip = true, pose = 'walk';
  if (t < T.out1) { const u = (t - T.out0) / (T.out1 - T.out0); x = rx - 8 + 8 * u; foot = gy - 9 + (foot0 - (gy - 9)) * u * u - Math.sin(u * Math.PI) * 6; pose = 'jump'; }
  else if (t < T.walk1) { const u = (t - T.out1) / (T.walk1 - T.out1); x = rx + (bx - rx) * u; }
  else if (t < T.wave0) { x = bx; pose = 'put'; }
  else if (t < T.wave1) { x = bx; flip = false; pose = 'wave'; foot -= Math.abs(Math.sin((t - T.wave0) * 8)) * 3; }
  else if (t < T.back1) { const u = (t - T.wave1) / (T.back1 - T.wave1); x = bx + (rx - bx) * u; flip = false; }
  else { const u = (t - T.back1) / (T.in1 - T.back1); x = rx - 8 * u; foot = foot0 + ((gy - 9) - foot0) * u * u - Math.sin(u * Math.PI) * 6; flip = false; pose = 'jump'; }
  return { x: Math.round(x), foot: Math.round(foot), flip, pose, fr: (pose === 'walk' || pose === 'put') && pose === 'walk' ? Math.floor(animClock * 7) % 2 : 0 };
}
function drawPostCap(cx, ht, flip) {                                                                        // поштова кепка: синя з жовтим значком і козирком
  R(ctx, cx - 4, ht - 2, 9, 3, 'd'); R(ctx, cx - 3, ht - 3, 7, 3, 'n'); R(ctx, cx - 2, ht - 4, 5, 1, 'n'); R(ctx, cx - 1, ht - 3, 3, 2, 'y'); R(ctx, cx, ht - 3, 1, 1, 'r');
  R(ctx, flip ? cx - 7 : cx + 3, ht, 5, 1, 'd'); R(ctx, flip ? cx - 6 : cx + 3, ht, 3, 1, 'z');
}
function drawMailTruck() {
  const x = Math.round(mail.x), moving = mail.state === 'arriving' || mail.state === 'leaving';
  const y = mailRoadY() - (moving && Math.floor(animClock * 10) % 2 ? 1 : 0);
  ctx.globalAlpha = 0.25; R(ctx, x - 17, y, 36, 2, 'd'); ctx.globalAlpha = 1;
  R(ctx, x - 18, y - 16, 35, 15, 'd');                                   // контур
  R(ctx, x - 2, y - 15, 17, 12, 'n'); R(ctx, x - 2, y - 15, 17, 1, 'v');   // фургон
  R(ctx, x + 2, y - 13, 9, 6, 'w'); R(ctx, x + 2, y - 13, 9, 1, 'd'); R(ctx, x + 2, y - 8, 9, 1, 'd'); lineG(ctx, x + 2, y - 13, x + 6, y - 10, 'd'); lineG(ctx, x + 10, y - 13, x + 6, y - 10, 'd');   // конверт на борту
  R(ctx, x - 2, y - 5, 17, 1, 'h');
  R(ctx, x - 15, y - 11, 13, 8, 'n'); R(ctx, x - 14, y - 10, 5, 4, 's'); R(ctx, x - 14, y - 10, 2, 1, 'S'); R(ctx, x - 6, y - 10, 3, 3, 'h');   // кабіна
  R(ctx, x - 17, y - 8, 3, 5, 'n'); R(ctx, x - 17, y - 4, 3, 2, 'e'); R(ctx, x - 17, y - 7, 1, 2, 'y');
  [x - 11, x + 9].forEach(wx => { disc(ctx, wx, y - 2, 3, 'd'); R(ctx, wx - 1, y - 3, 2, 2, 'e'); });
  const T = MAIL_T, st = mail.state === 'stopped', cp = mailCourier();
  if (!st || mail.t < T.out0 || mail.t >= T.in1) { R(ctx, x - 13, y - 9, 3, 3, 'l'); R(ctx, x - 14, y - 10, 5, 1, 'n'); R(ctx, x - 12, y - 8, 1, 1, 'd'); }          // водій у кабіні в кепці
  if (st) {                                                                                                // задні дверцята відчиняються, у кузові видно пакунки
    const open = mail.t < 0.3 ? 0 : mail.t < 0.5 ? (mail.t - 0.3) / 0.2 : mail.t < T.in1 ? 1 : mail.t < T.door1 ? 1 - (mail.t - T.in1) / (T.door1 - T.in1) : 0;
    if (open > 0.05) {
      R(ctx, x + 12, y - 14, 5, 12, 'k'); R(ctx, x + 12, y - 5, 4, 3, 'c'); R(ctx, x + 12, y - 5, 4, 1, 'w'); R(ctx, x + 13, y - 8, 3, 3, 'h'); R(ctx, x + 14, y - 8, 1, 3, 'r'); R(ctx, x + 12, y - 11, 3, 3, 'c');
      const dw = Math.max(1, Math.round(4 * open)); R(ctx, x + 17, y - 15, dw, 13, 'z'); R(ctx, x + 17, y - 15, dw, 1, 'n'); R(ctx, x + 17 + dw - 1, y - 15, 1, 13, 'd');
    }
  }
  if (cp) {                                                                                                // кур'єр-звіреня
    const sx = cp.x - 9, sy = cp.foot - 23;
    ctx.globalAlpha = 0.22; R(ctx, cp.x - 6, cp.foot, 12, 1, 'd'); ctx.globalAlpha = 1;
    drawSprite(ctx, mail.who + '_' + cp.fr, sx, sy, { flip: cp.flip });
    R(ctx, cp.flip ? sx + 10 : sx + 2, sy + 13, 6, 5, 'd'); R(ctx, cp.flip ? sx + 11 : sx + 3, sy + 14, 4, 3, 'h'); R(ctx, cp.flip ? sx + 12 : sx + 4, sy + 14, 2, 1, 'w');         // сумка з листами
    drawPostCap(sx + 9, sy + 8, cp.flip);
    const slotX = mailBoxX() + 1, slotY = y - 18;
    if (cp.pose === 'walk' && mail.t < T.walk1 + 0.001 || cp.pose === 'jump' && mail.t < T.out1) R(ctx, cp.flip ? sx - 1 : sx + 15, sy + 14, 4, 3, 'w');           // лист у лапках
    if (cp.pose === 'put') {                                                                              // конверт летить із лапки в комірку
      const u = Math.min(1, (mail.t - T.walk1) / 0.7), ex = Math.round(sx - 1 + (slotX - (sx - 1)) * u), ey = Math.round(sy + 14 + (slotY - (sy + 14)) * u - Math.sin(u * Math.PI) * 6);
      if (u < 1) { R(ctx, ex, ey, 4, 3, 'w'); R(ctx, ex + 1, ey + 1, 2, 1, 'r'); }
    }
    if (cp.pose === 'wave') { const w = Math.floor(animClock * 8) % 2; R(ctx, sx + 16, sy + 8 - w, 2, 5, 'd'); R(ctx, sx + 16, sy + 8 - w, 1, 4, 'B'); }                    // махає лапкою
  }
}
// Поштомат біля дороги: синя скринька на стовпчику. З листом прапорець піднімається, лист визирає й блимає
function drawMailBox() {
  const x = mailBoxX(), y = mailRoadY() - 1, pending = !!state.events.mailPending, blink = Math.floor(animClock * 3) % 2, g = ctx;
  g.globalAlpha = 0.28; R(g, x - 9, y - 1, 19, 2, 'd'); g.globalAlpha = 1;
  R(g, x - 2, y - 14, 5, 14, 'd'); R(g, x - 1, y - 14, 3, 14, 'b'); R(g, x - 1, y - 14, 1, 14, 'l');                // стовпчик
  R(g, x - 5, y - 2, 11, 2, 'd'); R(g, x - 4, y - 1, 9, 1, 'e');
  R(g, x - 7, y - 28, 15, 1, 'd'); R(g, x - 9, y - 27, 19, 1, 'd'); R(g, x - 10, y - 26, 21, 13, 'd');             // корпус із заокругленим верхом
  R(g, x - 6, y - 27, 13, 1, 'n'); R(g, x - 8, y - 26, 17, 1, 'n'); R(g, x - 9, y - 25, 19, 11, 'n');
  R(g, x - 6, y - 27, 11, 1, 's'); R(g, x - 8, y - 26, 4, 1, 's'); R(g, x - 9, y - 25, 2, 10, 'u');
  R(g, x + 6, y - 25, 3, 11, 'z');
  R(g, x - 9, y - 15, 19, 1, 'z');
  R(g, x - 5, y - 24, 9, 6, 'd'); R(g, x - 4, y - 23, 7, 4, 'w'); lineG(g, x - 4, y - 23, x, y - 20, 'e'); lineG(g, x + 2, y - 23, x, y - 20, 'e');   // конверт на дверцятах
  R(g, x - 3, y - 17, 7, 1, 'k');                                                                                  // щілина
  R(g, x + 10, y - 26, 2, 12, 'd'); R(g, x + 10, y - 26, 1, 12, 'e');                                               // вісь прапорця
  if (pending) {
    R(g, x + 9, y - 36, 1, 11, 'd'); R(g, x + 10, y - 36, 6, 4, 'd'); R(g, x + 11, y - 35, 4, 2, blink ? 'y' : 'r');   // прапорець угорі
    R(g, x - 4, y - 18, 7, 2, 'w'); R(g, x + 1, y - 18, 1, 1, 'r');                                                // лист визирає зі щілини
    if (Math.floor(animClock * 4) % 2) { R(g, x - 13, y - 24, 1, 3, 'y'); R(g, x - 14, y - 23, 3, 1, 'y'); R(g, x + 15, y - 20, 1, 3, 'y'); R(g, x + 14, y - 19, 3, 1, 'y'); }
  } else { R(g, x + 10, y - 20, 6, 3, 'd'); R(g, x + 11, y - 19, 4, 1, 'r'); }                                      // прапорець опущений
}
// Червона скринька «Новини» поруч із синім поштоматом: тап — відкриває лист від розробників; поки новину не прочитано, прапорець угорі блимає
const NEWS_VERSION = 27;
function newsUnread() { return (state.newsSeen | 0) < NEWS_VERSION; }
function newsBoxX() { return mailBoxX() - 27; }
function drawNewsBox() {
  const x = newsBoxX(), y = mailRoadY() - 1, unread = newsUnread(), blink = Math.floor(animClock * 3) % 2, g = ctx;
  g.globalAlpha = 0.28; R(g, x - 9, y - 1, 19, 2, 'd'); g.globalAlpha = 1;
  R(g, x - 2, y - 14, 5, 14, 'd'); R(g, x - 1, y - 14, 3, 14, 'b'); R(g, x - 1, y - 14, 1, 14, 'l');                // стовпчик
  R(g, x - 5, y - 2, 11, 2, 'd'); R(g, x - 4, y - 1, 9, 1, 'e');
  R(g, x - 7, y - 28, 15, 1, 'd'); R(g, x - 9, y - 27, 19, 1, 'd'); R(g, x - 10, y - 26, 21, 13, 'd');             // корпус
  R(g, x - 6, y - 27, 13, 1, 'r'); R(g, x - 8, y - 26, 17, 1, 'r'); R(g, x - 9, y - 25, 19, 11, 'r');
  R(g, x - 6, y - 27, 11, 1, 'J'); R(g, x - 8, y - 26, 4, 1, 'J'); R(g, x - 9, y - 25, 2, 10, 'o');
  R(g, x + 6, y - 25, 3, 11, 'P');
  R(g, x - 9, y - 15, 19, 1, 'P');
  R(g, x - 5, y - 24, 9, 6, 'd'); R(g, x - 4, y - 23, 7, 4, 'w'); R(g, x - 3, y - 22, 5, 1, 'e'); R(g, x - 3, y - 20, 3, 1, 'e'); R(g, x + 1, y - 22, 2, 2, 'h');   // газета на дверцятах
  R(g, x - 3, y - 17, 7, 1, 'k');                                                                                  // щілина
  R(g, x + 10, y - 26, 2, 12, 'd'); R(g, x + 10, y - 26, 1, 12, 'e');                                               // вісь прапорця
  if (unread) {
    R(g, x + 9, y - 36, 1, 11, 'd'); R(g, x + 10, y - 36, 6, 4, 'd'); R(g, x + 11, y - 35, 4, 2, blink ? 'y' : 'h');   // прапорець угорі
    R(g, x - 4, y - 18, 7, 2, 'w'); R(g, x - 3, y - 18, 3, 1, 'e');                                                // газета визирає зі щілини
    if (Math.floor(animClock * 4) % 2) { R(g, x - 13, y - 24, 1, 3, 'y'); R(g, x - 14, y - 23, 3, 1, 'y'); R(g, x + 15, y - 20, 1, 3, 'y'); R(g, x + 14, y - 19, 3, 1, 'y'); }
  } else { R(g, x + 10, y - 20, 6, 3, 'd'); R(g, x + 11, y - 19, 4, 1, 'r'); }
}
function hitNews(p) {
  const x = newsBoxX(), y = mailRoadY();
  if (Math.abs(p.x - x) <= 14 && p.y >= y - 38 && p.y <= y + 3) { openNews(); return true; }
  return false;
}
// Газета з червоної скриньки: розділи «Про нас», «Поради», «Скоро».
// «Про нас» (газета): сторінки будує buildNewsPages. Старого архіву випусків нема.
let newsBusy = false;
function picCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return { c, g }; }
function newsPic(kind) {
  const { c, g } = picCanvas(160, 84);
  if (kind === 'pinkclouds') {
    const bands = ['P', 'P', 'u', 'f', 'J', 'p', 'q', 'j', 'y'];
    for (let y = 0; y < 84; y++) R(g, 0, y, 160, 1, bands[Math.min(bands.length - 1, Math.floor(y / 9.5))]);
    for (let i = 0; i < 14; i++) R(g, (i * 37 + 11) % 160, (i * 17 + 3) % 22, 1, 1, i % 3 ? 'q' : 'w');
    disc(g, 118, 60, 15, 'h'); disc(g, 118, 60, 11, 'y'); R(g, 0, 62, 160, 22, 'z');
    const cloud = (cx, cy, s) => {
      const puffs = [[0, 0, 7], [-9, 2, 5], [9, 2, 5], [-4, -5, 6], [5, -4, 6]];
      puffs.forEach(([dx, dy, r]) => disc(g, Math.round(cx + dx * s), Math.round(cy + dy * s + 2), Math.round(r * s), 'f'));
      puffs.forEach(([dx, dy, r]) => disc(g, Math.round(cx + dx * s), Math.round(cy + dy * s), Math.round(r * s), 'p'));
      puffs.forEach(([dx, dy, r]) => disc(g, Math.round(cx + dx * s - 1), Math.round(cy + dy * s - 1), Math.max(2, Math.round(r * s) - 2), 'q'));
      disc(g, Math.round(cx - 6 * s), Math.round(cy - 6 * s), Math.max(2, Math.round(3 * s)), 'w');
    };
    cloud(34, 26, 1.5); cloud(104, 20, 1.1); cloud(78, 44, 1.2); cloud(146, 38, 0.9); cloud(12, 52, 0.9);
    for (let x = 0; x < 160; ) { const w = 11 + (x * 5) % 9, h = 8 + (x * 7) % 16; R(g, x, 66 - h + 8, w, h + 10, 'V'); for (let wy = 66 - h + 12; wy < 76; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 5) if ((wx + wy) % 3) R(g, wx, wy, 2, 3, 'y'); x += w; }
    R(g, 0, 76, 160, 8, 'z');
  } else if (kind === 'hut') {
    R(g, 0, 0, 160, 84, 'V'); R(g, 0, 40, 160, 44, 'P'); for (let i = 0; i < 14; i++) R(g, (i * 29 + 5) % 160, (i * 13 + 3) % 40, 1, 1, 'w'); disc(g, 138, 16, 9, 'o'); disc(g, 136, 14, 6, 'h');
    R(g, 0, 78, 160, 6, 'z'); const hc = document.createElement('canvas'); hc.width = 160; hc.height = 84; HAG_ART.draw(hc.getContext('2d'), 1.2, 1, false); g.drawImage(hc, 0, 0);
  } else if (kind === 'clock') {
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 30 ? 'z' : 'V'); for (let i = 0; i < 18; i++) R(g, (i * 29 + 9) % 160, (i * 13 + 4) % 50, 1, 1, i % 3 ? 'w' : 'y'); disc(g, 28, 18, 9, 'w'); disc(g, 31, 16, 8, 'z');
    R(g, 0, 66, 160, 18, 'z'); for (let x = 0; x < 160; x += 13) { const hh = 8 + (x * 5) % 12; R(g, x, 66 - hh + 8, 13, hh, 'k'); }
    const cx = 80; R(g, cx - 14, 54, 28, 14, 'd'); R(g, cx - 13, 54, 26, 14, 'c');
    R(g, cx - 17, 24, 34, 32, 'd'); R(g, cx - 16, 25, 32, 30, 'W'); R(g, cx - 16, 25, 4, 30, 'E'); R(g, cx + 12, 25, 4, 30, 'c');
    disc(g, cx, 40, 14, 'y'); g.globalAlpha = 0; g.globalAlpha = 1; disc(g, cx, 40, 13, 'd'); disc(g, cx, 40, 12, 'h'); disc(g, cx, 40, 10, 'd'); disc(g, cx, 40, 9, 'w');
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; R(g, Math.round(cx + Math.sin(a) * 7.5), Math.round(40 - Math.cos(a) * 7.5), i % 3 ? 1 : 2, i % 3 ? 1 : 2, 'd'); }
    lineG(g, cx, 40, cx, 34, 'd'); lineG(g, cx, 40, cx + 5, 43, 'd'); R(g, cx - 1, 39, 2, 2, 'h');
    R(g, cx - 12, 14, 24, 10, 'd'); R(g, cx - 11, 15, 22, 9, 'k'); [-6, 6].forEach(bx => { R(g, cx + bx - 2, 17, 5, 4, 'h'); R(g, cx + bx - 3, 21, 7, 2, 'h'); });
    for (let r = 0; r < 14; r++) { const half = 16 - r; R(g, cx - half, 13 - r, half * 2, 1, 'r'); R(g, cx - half, 13 - r, 2, 1, 'd'); R(g, cx + half - 2, 13 - r, 2, 1, 'd'); }
    R(g, cx, 0, 1, 3, 'd'); [18, 28, 38].forEach(rr => { for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; if (rr === 28) R(g, Math.round(cx + Math.cos(a) * (rr + 8)), Math.round(40 + Math.sin(a) * (rr + 8) * 0.8), 1, 1, 'y'); } });
  } else if (kind === 'city') {
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 24 ? 'z' : y < 48 ? 'V' : 'P'); for (let i = 0; i < 14; i++) R(g, (i * 31 + 7) % 160, (i * 11 + 2) % 30, 1, 1, 'w'); disc(g, 124, 22, 9, 'w');
    for (let x = 0; x < 160; ) { const w = 14 + (x * 3) % 9, h = 20 + (x * 7) % 30; R(g, x, 66 - h, w, h, x % 2 ? 'V' : 'z'); for (let wy = 66 - h + 4; wy < 62; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 6) if ((wx + wy) % 3) R(g, wx, wy, 3, 4, (wx * 3 + wy) % 4 ? 'y' : 'f'); x += w; }
    R(g, 0, 66, 160, 18, 'z'); R(g, 0, 66, 160, 2, 'u'); for (let x = 0; x < 160; x += 18) R(g, x, 76, 9, 1, 'h');
    R(g, 20, 46, 2, 22, 'd'); R(g, 17, 43, 8, 4, 'y');
    const cs = getSpriteCanvas('capy'); g.drawImage(cs, 0, 0, cs.width, cs.height, 70, 80 - cs.height * 1.6, cs.width * 1.6, cs.height * 1.6);
  } else if (kind === 'witch') {
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 24 ? 'z' : y < 54 ? 'V' : 'P'); for (let i = 0; i < 16; i++) R(g, (i * 31 + 7) % 160, (i * 11 + 2) % 50, 1, 1, i % 3 ? 'w' : 'y');
    disc(g, 112, 30, 18, 'd'); disc(g, 112, 30, 17, 'o'); disc(g, 109, 27, 13, 'h'); disc(g, 107, 25, 8, 'y');
    for (let x = 0; x < 160; x += 14) { const hh = 10 + (x * 7) % 14; R(g, x, 84 - hh, 14, hh, 'k'); R(g, x + 3, 84 - hh + 3, 2, 2, 'y'); }
    if (!witchCv) witchCv = buildWitchCanvas(); g.drawImage(witchCv, 42, 14); [[18, 14], [30, 30], [140, 52]].forEach(([bx, by]) => { R(g, bx, by, 3, 1, 'k'); R(g, bx - 3, by - 1, 3, 1, 'k'); R(g, bx + 3, by - 1, 3, 1, 'k'); });
  } else if (kind === 'shards') {
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 30 ? 'z' : y < 60 ? 'V' : 'P'); for (let i = 0; i < 20; i++) R(g, (i * 29 + 9) % 160, (i * 13 + 4) % 60, 1, 1, i % 3 ? 'w' : 'y');
    R(g, 0, 70, 160, 14, 'd'); R(g, 0, 70, 160, 2, 'b');
    const gem = (cx, cy, hh, hw, a, b) => { for (let r = -hh; r <= hh; r++) { const half = Math.round(hw * (1 - Math.abs(r) / hh)); R(g, cx - half, cy + r, half * 2 + 1, 1, r < -hh * 0.2 ? a : b); R(g, cx - half, cy + r, 1, 1, 'k'); R(g, cx + half, cy + r, 1, 1, 'k'); } R(g, cx - 1, cy - hh + 1, 3, 3, 'w'); R(g, cx - hw + 3, cy - 2, 2, 5, 'w'); };
    gem(80, 38, 26, 16, 'S', 's'); gem(38, 52, 14, 9, 'q', 'p'); gem(122, 54, 16, 10, 'm', 'T');
    [[60, 14], [100, 20], [24, 32], [136, 36]].forEach(([sx, sy]) => { R(g, sx, sy - 2, 1, 5, 'y'); R(g, sx - 2, sy, 5, 1, 'y'); });
  } else if (kind === 'van') {
    R(g, 0, 0, 160, 50, 'S'); R(g, 0, 50, 160, 34, 'E'); R(g, 0, 62, 160, 22, 'e'); for (let x = 0; x < 160; x += 24) R(g, x, 73, 12, 2, 'y'); disc(g, 130, 16, 8, 'y');
    const Rs = (x, y, w, h, col) => R(g, 24 + x * 3, 40 + y * 3, w * 3, h * 3, col), D = (cx, cy, r, col) => disc(g, 24 + cx * 3, 40 + cy * 3, r * 3, col);
    Rs(0, -16, 35, 15, 'd'); Rs(16, -15, 17, 12, 'n'); Rs(16, -15, 17, 1, 'v'); Rs(20, -13, 9, 6, 'w'); Rs(16, -5, 17, 1, 'h'); Rs(1, -11, 13, 8, 'n'); Rs(2, -10, 5, 4, 's'); Rs(10, -10, 3, 3, 'h'); Rs(-1, -8, 3, 5, 'n');
    [7, 27].forEach(wx => { D(wx, -2, 3, 'd'); D(wx, -2, 1, 'e'); }); Rs(23, -11, 3, 1, 'r'); R(g, 40, 22, 8, 6, 'r'); R(g, 41, 23, 6, 4, 'p');
  } else if (kind === 'tent') {
    R(g, 0, 0, 160, 60, 'S'); R(g, 0, 60, 160, 24, 'E'); R(g, 0, 60, 160, 2, 'e');
    R(g, 28, 22, 104, 40, 'c'); R(g, 28, 22, 104, 2, 'd'); for (let x = 36; x < 124; x += 20) { R(g, x, 32, 12, 12, 's'); R(g, x, 32, 12, 1, 'd'); }
    for (let r = 0; r < 22; r++) { const half = 3 + Math.round(r * 2.6); R(g, 80 - half, 2 + r, half * 2, 1, r % 5 === 4 ? 'E' : 'w'); R(g, 80 - half, 2 + r, 1, 1, 'd'); R(g, 80 + half - 1, 2 + r, 1, 1, 'd'); }
    R(g, 24, 24, 112, 38, 'w'); for (let x = 24; x < 136; x += 6) R(g, x, 24, 1, 38, 'E'); R(g, 23, 24, 1, 38, 'd'); R(g, 136, 24, 1, 38, 'd'); R(g, 24, 24, 112, 1, 'd');
    for (let x = 20; x <= 140; x += 24) R(g, x, 14, 2, 50, 'b'); [18, 40, 62].forEach(y => R(g, 18, y, 124, 2, 'l')); R(g, 74, 38, 12, 4, 'e'); R(g, 78, 42, 4, 14, 'b');
    R(g, 0, 58, 160, 4, 'h'); for (let x = 0; x < 160; x += 8) R(g, x, 58, 4, 4, 'k');
  } else if (kind === 'tipRich' || kind === 'tipGrow' || kind === 'tipFree') {   // картинки до порад
    const GL = { M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], A: ['.###.', '#...#', '#####', '#...#', '#...#'], X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
      '2': ['####.', '....#', '.###.', '#....', '#####'], '1': ['..#..', '.##..', '..#..', '..#..', '.###.'], '0': ['.###.', '#...#', '#...#', '#...#', '.###.'],
      '5': ['#####', '#....', '####.', '....#', '####.'], '7': ['#####', '....#', '...#.', '..#..', '..#..'], '/': ['....#', '...#.', '..#..', '.#...', '#....'], '!': ['..#..', '..#..', '..#..', '.....', '..#..'] };
    const tx = (x, y, str, col) => { [...str].forEach((ch, i) => (GL[ch] || []).forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '#') R(g, x + i * 6 + rx, y + ry, 1, 1, col); })); };
    if (kind === 'tipRich') {
      for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 24 ? 'S' : y < 48 ? 'W' : 'y'); R(g, 0, 68, 160, 16, 'm'); R(g, 0, 68, 160, 2, 'g');
      const sp = getSpriteCanvas('team_spike_e0'); g.drawImage(sp, 0, 0, sp.width, sp.height, 8, 68 - 56, 56, 56);
      R(g, 58, 56, 30, 12, 'd'); R(g, 59, 57, 28, 3, 'l'); R(g, 59, 60, 28, 7, 'b'); R(g, 63, 48, 10, 8, 'd'); R(g, 64, 49, 8, 6, 'g'); R(g, 76, 52, 6, 4, 'h');
      R(g, 96, 8, 54, 22, 'd'); R(g, 98, 10, 50, 18, 'h'); R(g, 98, 10, 50, 3, 'y'); R(g, 98, 25, 50, 3, 'o'); tx(114, 15, 'MAX', 'd');
      R(g, 76, 40, 78, 14, 'd'); R(g, 78, 42, 74, 10, 'V'); R(g, 78, 42, 22, 10, 'y'); tx(104, 44, '7/25', 'w');
      [[100, 66], [112, 64], [124, 67], [136, 65]].forEach(([cx, cy]) => { disc(g, cx, cy, 5, 'd'); disc(g, cx, cy, 4, 'h'); R(g, cx - 1, cy - 2, 2, 3, 'y'); });
    } else if (kind === 'tipGrow') {
      for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 30 ? 'S' : 'W'); disc(g, 140, 12, 7, 'y'); disc(g, 140, 12, 5, 'w'); R(g, 0, 68, 160, 16, 'e'); R(g, 0, 68, 160, 2, 'E');
      const house = (x, w, h, wall, roof, rows) => { R(g, x, 68 - h, w, h, 'd'); R(g, x + 1, 69 - h, w - 2, h - 1, wall); R(g, x - 2, 64 - h, w + 4, 5, 'd'); R(g, x - 1, 65 - h, w + 2, 3, roof);
        for (let ry = 0; ry < rows; ry++) for (let wx = x + 4; wx < x + w - 6; wx += 9) { R(g, wx, 72 - h + ry * 14, 6, 8, 'd'); R(g, wx + 1, 73 - h + ry * 14, 4, 6, 's'); }
        R(g, x + (w >> 1) - 3, 60, 7, 8, 'd'); R(g, x + (w >> 1) - 2, 61, 5, 7, 'b'); };
      house(10, 28, 22, 'c', 'r', 0); house(54, 38, 36, 'q', 'p', 2); house(110, 44, 54, 'w', 'n', 3);
      R(g, 112, 8, 1, 6, 'd'); R(g, 113, 8, 6, 4, 'r');
      tx(44, 30, 'X2', 'd'); tx(98, 22, 'X2', 'd');
      [[43, 52], [98, 46]].forEach(([ax, ay]) => { R(g, ax, ay, 8, 2, 'd'); R(g, ax + 8, ay - 2, 2, 6, 'd'); R(g, ax + 10, ay - 1, 2, 4, 'd'); });
    } else {
      for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 24 ? 'V' : y < 48 ? 'P' : 'u'); for (let i = 0; i < 14; i++) R(g, (i * 29 + 7) % 160, (i * 11 + 2) % 30, 1, 1, i % 3 ? 'w' : 'y');
      R(g, 0, 72, 160, 12, 'z'); const SEC = ['r', 'h', 'm', 'n', 'p', 'o', 'T', 'y'], cx = 46, cy = 42;
      disc(g, cx, cy, 31, 'd');
      for (let y = -29; y <= 29; y++) for (let x = -29; x <= 29; x++) { const d = Math.hypot(x, y); if (d > 28.5) continue; const ang = (Math.atan2(y, x) + Math.PI * 2.5) % (Math.PI * 2); R(g, cx + x, cy + y, 1, 1, d > 26 ? 'd' : SEC[Math.floor(ang / (Math.PI / 4)) % 8]); }
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 8 * 0; lineG(g, cx, cy, Math.round(cx + Math.cos(a - Math.PI / 2) * 27), Math.round(cy + Math.sin(a - Math.PI / 2) * 27), 'd'); }
      disc(g, cx, cy, 6, 'd'); disc(g, cx, cy, 4, 'w');
      R(g, cx - 3, 8, 7, 3, 'd'); R(g, cx - 2, 11, 5, 3, 'd'); R(g, cx - 1, 14, 3, 3, 'd'); R(g, cx - 2, 9, 5, 2, 'r'); R(g, cx - 1, 11, 3, 3, 'r');
      R(g, 96, 20, 36, 22, 'd'); R(g, 98, 20, 32, 20, 'h'); R(g, 98, 20, 32, 3, 'y'); R(g, 90, 22, 8, 12, 'd'); R(g, 92, 24, 5, 8, 'h'); R(g, 130, 22, 8, 12, 'd'); R(g, 132, 24, 5, 8, 'h');
      R(g, 108, 42, 12, 10, 'd'); R(g, 110, 42, 8, 10, 'h'); R(g, 102, 52, 24, 5, 'd'); R(g, 104, 52, 20, 3, 'h'); R(g, 102, 28, 6, 8, 'y');
      disc(g, 145, 14, 9, 'd'); disc(g, 145, 14, 7, 'r'); tx(143, 11, '!', 'w');
      disc(g, 134, 60, 4, 'd'); disc(g, 134, 60, 3, 'S'); R(g, 133, 58, 1, 2, 'w');
    }
  } else if (kind === 'gift') {                                                  // подарунок від розробників
    for (let y = 0; y < 84; y += 6) R(g, 0, y, 160, 6, y < 30 ? 'z' : y < 60 ? 'V' : 'P');
    for (let i = 0; i < 18; i++) R(g, (i * 29 + 9) % 160, (i * 13 + 4) % 50, 1, 1, i % 3 ? 'w' : 'y');
    R(g, 0, 70, 160, 14, 'd'); R(g, 0, 70, 160, 2, 'b');
    R(g, 50, 36, 60, 36, 'd'); R(g, 52, 38, 56, 32, 'r'); R(g, 52, 38, 56, 4, 'o'); R(g, 76, 36, 8, 36, 'h'); R(g, 78, 38, 4, 32, 'y');
    R(g, 46, 26, 68, 12, 'd'); R(g, 48, 28, 64, 8, 'r'); R(g, 48, 28, 64, 2, 'o'); R(g, 76, 26, 8, 12, 'h');
    R(g, 66, 14, 12, 12, 'd'); R(g, 68, 16, 8, 8, 'h'); R(g, 82, 14, 12, 12, 'd'); R(g, 84, 16, 8, 8, 'h');
    [[20, 20], [136, 24], [30, 52], [130, 54]].forEach(([sx, sy]) => { R(g, sx, sy - 3, 1, 7, 'y'); R(g, sx - 3, sy, 7, 1, 'y'); });
  } else {                                                                         // обкладинка: Капі на тлі променів
    for (let i = 0; i < 24; i++) { const a0 = i / 24 * Math.PI * 2; g.fillStyle = i % 2 ? PALETTE.y : PALETTE.h; g.beginPath(); g.moveTo(80, 60); g.arc(80, 60, 120, a0, a0 + Math.PI / 24 * 2); g.closePath(); g.fill(); }
    const cs = getSpriteCanvas('capy'); g.drawImage(cs, 0, 0, cs.width, cs.height, 80 - cs.width * 1.5, 82 - cs.height * 3, cs.width * 3, cs.height * 3);
  }
  return c;
}
