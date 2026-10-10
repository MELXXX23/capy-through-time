//#part 240_story.js
/* =====================================================================
   СЮЖЕТ І ДІАЛОГИ
   ===================================================================== */

const dialog = { active: false, kind: 'ch', chapter: 0, labelNo: 0, replay: false, pages: [], page: 0, shown: 0, text: '', after: null };
let storyTimer = 1;           // перша перевірка через секунду після старту
const cameos = [];            // гості-камео на вулиці (Шнирь, що тікає з печивом)

// Який спрайт показувати як портрет (null — оповідач, без портрета)
function speakerSprite(sp) {
  if (sp === 'narr' || sp === 'title') return null;
  if (sp === 'capy') return capySprite();
  if (sp === 'shnyr') return 'npc_shnyr';
  if (sp === 'clock') return 'npc_clock';
  if (/^shnyr\d$/.test(sp) || GUEST_IDS.includes(sp)) return 'npc_' + sp;       // костюми Шниря та гості епох
  return teamSprite(sp);
}
function speakerName(sp) {
  if (sp === 'narr' || sp === 'title') return '';
  if (sp === 'capy' || sp === 'shnyr' || sp === 'clock') return t('speaker_' + sp);
  if (/^shnyr\d$/.test(sp)) return t('speaker_shnyr');
  if (GUEST_IDS.includes(sp)) return t('speaker_' + sp);
  return t('team_' + sp);
}
function pageText(p) {
  if (p.speaker === 'title') return t(dialog.kind === 'ep' ? 'epochLabel' : 'chapterLabel', dialog.labelNo) + '\n' + t(dialog.kind + dialog.chapter + '_title');
  return t(p.key, HELP_NEED);
}

function renderDialogText() {
  ui.dlgText.textContent = dialog.text.slice(0, Math.floor(dialog.shown));
  ui.dlgNext.classList.toggle('on', !dialog.choosing && dialog.shown >= dialog.text.length);
}
// Вибір відповіді Капі: два варіанти — жартівливий (тап ×5) і серйозний (дохід ×2), обидва на 10 хвилин
function buildChoiceButtons() {
  const n = dialog.chapter;
  ui.dlgChoices.innerHTML = '';
  [1, 2].forEach(i => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn';
    const main = document.createElement('span'); main.textContent = t('ep' + n + '_o' + i);
    const hint = document.createElement('small'); hint.textContent = t(i === 1 ? 'choiceFun' : 'choiceSerious');
    b.append(main, hint);
    b.addEventListener('click', e => { e.stopPropagation(); chooseOption(i); });
    ui.dlgChoices.appendChild(b);
  });
  ui.dlgChoices.hidden = false;
}
function choicePages(n, def, i) { return [{ speaker: 'capy', key: 'ep' + n + '_o' + i }, { speaker: def.reply[i - 1], key: 'ep' + n + '_r' + i }]; }
function applyChoiceBonus(i) {
  const ev = state.events, now = Date.now(), ms = 10 * 60000;
  if (i === 1) { if (!(ev.tapBoostUntil > now && ev.tapBoostMult > 5)) { ev.tapBoostUntil = now + ms; ev.tapBoostMult = 5; } showToast(t('choiceBonusTap'), 'good'); }
  else { if (!(ev.incomeBoostUntil > now && ev.incomeBoostMult > 2)) { ev.incomeBoostUntil = now + ms; ev.incomeBoostMult = 2; } showToast(t('choiceBonusIncome'), 'good'); }
  recalcIncome();
}
function chooseOption(i) {
  if (!dialog.active || !dialog.choosing) return;
  const n = dialog.chapter, def = EPOCH_STORIES[n - 1];
  dialog.choosing = false;
  ui.dlgChoices.hidden = true;
  if (!dialog.replay) { state.story.choices[n - 1] = i; applyChoiceBonus(i); saveGame(); }
  dialog.pages.splice(dialog.page + 1, 0, ...choicePages(n, def, i));
  dialog.page++;
  showDialogPage();
}
function showDialogPage() {
  const p = dialog.pages[dialog.page];
  dialog.choosing = !!p.choice;
  ui.dlgChoices.hidden = true;
  dialog.text = p.choice ? t('choiceTitle') : pageText(p);
  dialog.shown = p.choice ? dialog.text.length : 0;
  ui.dlgText.classList.toggle('title', p.speaker === 'title');
  ui.dlgName.textContent = speakerName(p.speaker);
  const spr = speakerSprite(p.speaker);
  ui.dlgWrap.classList.toggle('none', !spr);
  if (spr) {
    const c = getSpriteCanvas(spr);
    const side = Math.max(c.width, c.height);          // портрет завжди квадратний, спрайт стоїть унизу посередині
    ui.dlgPortrait.width = side; ui.dlgPortrait.height = side;
    const g = ui.dlgPortrait.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(c, (side - c.width) >> 1, side - c.height);
  }
  renderDialogText();
  if (p.choice) buildChoiceButtons();
}

// Запускає главу n (kind 'ch'), фрагмент епохи (kind 'ep') або туторіал (kind 'tut').
// replay — перечитування з вкладки «Історія» (без наслідків для гри); labelNo — номер, що пишеться в заголовку
function startDialogue(n, replay = false, kind = 'ch', labelNo = n) {
  const def = kind === 'ch' ? CHAPTERS[n - 1] : (kind === 'ep' || kind === 'thx') ? EPOCH_STORIES[n - 1] : TUTORIAL;
  if (!def || dialog.active) return;
  dialog.after = null;
  dialog.active = true;
  dialog.kind = kind;
  dialog.chapter = n;
  dialog.labelNo = labelNo;
  dialog.replay = replay;
  dialog.page = 0;
  const prefix = kind === 'tut' ? 'tut' + n : kind + n;
  dialog.choosing = false;
  if (kind === 'ep') {
    // історія епохи: вступ → вибір Капі (жарт чи серйозно) → відповідь → завершення. При перечитуванні вибір береться зі збереженого
    const stored = replay ? state.story.choices[n - 1] : 0;
    dialog.pages = [{ speaker: 'title' }, ...def.pre.map((sp, k) => ({ speaker: sp, key: 'ep' + n + '_' + k })),
      ...(stored > 0 ? choicePages(n, def, stored) : [{ speaker: 'capy', choice: true }]),
      ...def.post.map((sp, j) => ({ speaker: sp, key: 'ep' + n + '_' + (def.pre.length + j) }))];
  } else if (kind === 'thx') {
    dialog.pages = def.thx.map((sp, k) => ({ speaker: sp, key: 'thx' + n + '_' + k }));          // подяка гостя за допомогу: окрема коротка сцена
  } else dialog.pages = [...(kind === 'tut' ? [] : [{ speaker: 'title' }]), ...def.lines.map((sp, k) => ({ speaker: sp, key: prefix + '_' + k }))];
  ui.dlgSkip.textContent = t('storySkip');
  ui.dialog.hidden = false;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  showDialogPage();
}

// Тап / клік: показати весь текст одразу, а якщо він уже повний — перейти далі
function advanceDialog() {
  if (!dialog.active || dialog.choosing) return;
  if (dialog.shown < dialog.text.length) { dialog.shown = dialog.text.length; renderDialogText(); return; }
  dialog.page++;
  if (dialog.page >= dialog.pages.length) endDialogue(); else showDialogPage();
}

function endDialogue() {
  if (!dialog.active) return;
  const n = dialog.chapter, replay = dialog.replay, kind = dialog.kind;
  dialog.active = false;
  dialog.choosing = false;
  ui.dlgChoices.hidden = true;
  ui.dialog.hidden = true;
  const after = dialog.after; dialog.after = null;
  if (kind === 'thx') { if (!replay) { state.story.thx[n - 1] = 1; saveGame(); } if (after) after(); return; }
  if (replay) return;
  if (kind === 'tut') { state.tutorialDone = true; storyTimer = 1; saveGame(); return; }
  if (kind === 'ep') {
    const st = state.story;
    if (!st.guests[n - 1]) { st.guests[n - 1] = Math.max(...st.guests) + 1; syncGuests(n - 1); nextGhostAt = Date.now() + 25000; }       // гість лишається жити в місті; перші істоти для його прохання з’являться за пів хвилини
    if (n === 7 && !st.shnyrJoined) { st.shnyrJoined = true; showToast(t('shnyrJoined'), 'big'); }   // у Неоновій епосі Шнирь стає другом і працівником
    storyTimer = 1; updateUI(); saveGame(); return;
  }
  state.story.done = Math.max(state.story.done, n);
  if (n === 3) spawnCameo('npc_shnyr');          // Шнирь тікає з печивом
  if (n === 6) state.story.shnyrFriend = true;
  if (n === 8) state.story.finale = true;         // відкриває подорож у часі (етап 7)
  storyTimer = 1.5;
  updateUI();
  saveGame();
}

// «Друкарська машинка»
function updateDialog(dt) {
  if (!dialog.active || dialog.shown >= dialog.text.length) return;
  const before = Math.floor(dialog.shown);
  dialog.shown = Math.min(dialog.text.length, dialog.shown + dt * CONFIG.DIALOG_CHARS_PER_SEC);
  const after = Math.floor(dialog.shown);
  if (after > before && dialog.text[after - 1] && dialog.text[after - 1].trim() && after % 2 === 0) playSfx('typing', speakerPitch(dialog.pages[dialog.page].speaker));
  renderDialogText();
}

// Мова змінилась посеред діалогу — оновлюємо поточну репліку
function refreshDialogLanguage() {
  if (!dialog.active) return;
  const ratio = dialog.text.length ? dialog.shown / dialog.text.length : 0;
  const p = dialog.pages[dialog.page];
  dialog.text = p.choice ? t('choiceTitle') : pageText(p);
  dialog.shown = ratio >= 1 || p.choice ? dialog.text.length : Math.floor(ratio * dialog.text.length);
  if (p.choice) buildChoiceButtons();
  ui.dlgName.textContent = speakerName(p.speaker);
  ui.dlgSkip.textContent = t('storySkip');
  renderDialogText();
}

// Чи настав час для наступної глави
const CLOCK_H = 58;                                                        // на скільки вежа піднімається над дахом торгового центру
const CLOCK_ROOF = ['r', 'n', 'P', 'V', 'n', 'G', 'u', 'f'];
const clockFx = { chime: 0, rings: [], hint: 0 };
function clockReady() { return !!state.story.finale && prestigeGain() >= 1; }
function clockTowerGeom() { const cx = shop.x + (shop.w >> 1); return { cx, faceY: shop.y - 17, top: shop.y - CLOCK_H, bottom: shop.y + 6 }; }
function clockFaceFrac() {                                                // де на екрані циферблат (частки ширини й висоти): звідти починається перехід
  if (!shop || shop.level < 6) return [0.5, 0.5];
  const G = clockTowerGeom(), r = ui.view.getBoundingClientRect();
  return [Math.max(0.1, Math.min(0.9, (r.left + (G.cx + view.offX) * sceneUnit) / window.innerWidth)), Math.max(0.1, Math.min(0.9, (r.top + (G.faceY + view.offY) * sceneUnit) / window.innerHeight))];
}
function clockChime(n) {                                                   // n ударів: перша ніч — один, друга — два, третя — три
  for (let i = 0; i < n; i++) setTimeout(() => { playSfx('clockBong'); clockFx.chime = 1; clockFx.rings.push({ t: 0 }); buzz(30); }, 700 + i * 1300);
}
function updateClockFx(dt) {
  clockFx.chime = Math.max(0, clockFx.chime - dt * 1.3);
  for (let i = clockFx.rings.length - 1; i >= 0; i--) { clockFx.rings[i].t += dt; if (clockFx.rings[i].t > 1.4) clockFx.rings.splice(i, 1); }
  clockFx.hint = Math.max(0, clockFx.hint - dt);
}
function drawClockTower() {
  if (!shop || shop.level < 6 || build) return;
  const G = clockTowerGeom(), cx = G.cx, y0 = shop.y, ep = viewEpoch() % 8, night = sky.night, ready = clockReady(), ch = clockFx.chime;
  const ox = animOn() ? Math.round(Math.sin(animClock * 55) * ch * 1.3) : 0, roof = CLOCK_ROOF[ep];
  const x = cx + ox;
  // стовбур вежі за куполом
  R(ctx, x - 13, y0 - 6, 26, 16, 'd'); R(ctx, x - 12, y0 - 6, 24, 16, 'c'); R(ctx, x - 12, y0 - 6, 3, 16, 'E'); R(ctx, x + 9, y0 - 6, 3, 16, 'l');
  for (let yy = y0 - 4; yy < y0 + 8; yy += 5) R(ctx, x - 12, yy, 24, 1, 'b');
  // годинниковий блок: рамка, пілястри, гзимс
  R(ctx, x - 16, y0 - 33, 32, 29, 'd'); R(ctx, x - 15, y0 - 32, 30, 27, 'W'); R(ctx, x - 15, y0 - 32, 4, 27, 'E'); R(ctx, x + 11, y0 - 32, 4, 27, 'c');
  R(ctx, x - 17, y0 - 34, 34, 3, 'd'); R(ctx, x - 16, y0 - 33, 32, 1, 'w'); R(ctx, x - 17, y0 - 6, 34, 3, 'd'); R(ctx, x - 16, y0 - 5, 32, 1, 'c');
  // циферблат
  const fy = G.faceY, lit = night > 0.25 || ready;
  if (lit) { ctx.globalAlpha = Math.min(0.5, 0.18 + night * 0.3) + (ready ? 0.12 * Math.sin(animClock * 4) : 0); disc(ctx, x, fy, 17, 'y'); ctx.globalAlpha = 0.14; disc(ctx, x, fy, 22, 'y'); ctx.globalAlpha = 1; }
  disc(ctx, x, fy, 13, 'd'); disc(ctx, x, fy, 12, 'h'); disc(ctx, x, fy, 10, 'd'); disc(ctx, x, fy, 9, lit ? 'y' : 'w'); disc(ctx, x - 2, fy - 2, 6, lit ? 'w' : 'W');
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, big = i % 3 === 0, rr = big ? 7.2 : 7.8; R(ctx, Math.round(x + Math.sin(a) * rr), Math.round(fy - Math.cos(a) * rr), big ? 2 : 1, big ? 2 : 1, 'd'); }
  const hrs = (state.dayPhase * 24) % 12, mins = (state.dayPhase * 24 * 60) % 60, ha = hrs / 12 * Math.PI * 2, ma = mins / 60 * Math.PI * 2, sa = (animClock * 1.0 % 60) / 60 * Math.PI * 2 * 6;
  lineG(ctx, x, fy, Math.round(x + Math.sin(ha) * 5), Math.round(fy - Math.cos(ha) * 5), 'd'); lineG(ctx, x + 1, fy, Math.round(x + 1 + Math.sin(ha) * 5), Math.round(fy - Math.cos(ha) * 5), 'd');
  lineG(ctx, x, fy, Math.round(x + Math.sin(ma) * 8), Math.round(fy - Math.cos(ma) * 8), 'd');
  lineG(ctx, x, fy, Math.round(x + Math.sin(sa) * 8), Math.round(fy - Math.cos(sa) * 8), 'r'); R(ctx, x - 1, fy - 1, 2, 2, 'h');
  // дзвіниця з дзвоном, що гойдається при ударах
  R(ctx, x - 12, y0 - 43, 24, 10, 'd'); R(ctx, x - 11, y0 - 42, 22, 9, 'k'); R(ctx, x - 12, y0 - 43, 3, 10, 'c'); R(ctx, x + 9, y0 - 43, 3, 10, 'c'); R(ctx, x - 1, y0 - 43, 2, 10, 'c');
  const sw = Math.round(Math.sin(animClock * 30) * ch * 3);
  [-6, 6].forEach(bx => { R(ctx, x + bx - 1 + sw, y0 - 41, 3, 1, 'd'); R(ctx, x + bx - 2 + sw, y0 - 40, 5, 4, 'h'); R(ctx, x + bx - 3 + sw, y0 - 36, 7, 2, 'h'); R(ctx, x + bx + sw, y0 - 34, 1, 1, 'd'); R(ctx, x + bx - 2 + sw, y0 - 40, 1, 4, 'y'); });
  // дах-піраміда й флюгер
  for (let r = 0; r < 15; r++) { const half = 17 - r; R(ctx, x - half, y0 - 44 - r, half * 2, 1, roof); R(ctx, x - half, y0 - 44 - r, 2, 1, 'd'); R(ctx, x + half - 2, y0 - 44 - r, 2, 1, 'd'); if (r % 4 === 3) R(ctx, x - half + 2, y0 - 44 - r, half * 2 - 4, 1, 'd'); R(ctx, x - half + 2, y0 - 44 - r, Math.max(1, Math.floor(half / 3)), 1, 'w'); }
  R(ctx, x - 18, y0 - 45, 36, 2, 'd');
  R(ctx, x, y0 - 63, 1, 8, 'd'); disc(ctx, x, y0 - 61, 2, 'h'); const wv = Math.round(Math.sin(animClock * 5)); R(ctx, x + 1, y0 - 64 + wv, 6, 3, 'r'); R(ctx, x + 1, y0 - 64 + wv, 6, 1, 'J');
  // кільця звуку від ударів і іскри, коли можна вирушати
  clockFx.rings.forEach(rg => { const rr = 12 + rg.t * 40; ctx.globalAlpha = Math.max(0, 0.8 - rg.t * 0.6); for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; R(ctx, Math.round(x + Math.cos(a) * rr), Math.round(fy + Math.sin(a) * rr * 0.9), 2, 2, 'y'); } ctx.globalAlpha = 1; });
  if (ready && animOn()) for (let k = 0; k < 5; k++) { const ph = (animClock * 0.7 + k / 5) % 1, a = k * 1.9 + animClock * 0.8; ctx.globalAlpha = Math.sin(ph * Math.PI); R(ctx, Math.round(x + Math.cos(a) * (14 + ph * 10)), Math.round(fy + Math.sin(a) * (14 + ph * 10)), 1, 3, 'y'); R(ctx, Math.round(x + Math.cos(a) * (14 + ph * 10)) - 1, Math.round(fy + Math.sin(a) * (14 + ph * 10)) + 1, 3, 1, 'y'); ctx.globalAlpha = 1; }
}
function hitClock(p) {
  if (!shop || shop.level < 6 || build || warp) return false;
  const G = clockTowerGeom();
  if (p.x < G.cx - 17 || p.x > G.cx + 17 || p.y < G.top - 4 || p.y > G.bottom) return false;
  clockFx.chime = Math.max(clockFx.chime, 0.6); clockFx.rings.push({ t: 0 }); playSfx('clockBong');
  if (!state.story.finale) showToast(t('clockWait'), 'good');
  else if (prestigeGain() < 1) showToast(t('clockNoGain'), 'good');
  else askTimeTravel();
  return true;
}
// Лічильник ночей після торгового центру: на третю ніч годинник «оживає» (глава 8)
let nightAcc = 0;
function countNights(dt, prevPhase) {
  if (state.shopLevel < 6 || state.story.done < 7 || state.story.nights >= 3) return;
  let passed = false;
  if (dayNightOn()) { const p = state.dayPhase; passed = prevPhase < 0.72 && p >= 0.72; }          // настає вечір
  else { nightAcc += dt; if (nightAcc >= CONFIG.DAY_SECONDS) { nightAcc = 0; passed = true; } }    // без зміни дня й ночі — раз на 5 хвилин
  if (!passed) return;
  state.story.nights++;
  clockChime(state.story.nights);                                          // годинник б'є: 1, 2, а на третю ніч — тричі (попередження)
  if (state.story.nights < 3) showToast(t('nightHint_' + state.story.nights), 'big'); else showToast(t('clockWarn'), 'big');
  saveGame();
}
function checkStory(dt) {
  storyTimer -= dt;
  if (storyTimer > 0) return;
  storyTimer = CONFIG.STORY_CHECK_SECONDS;
  if (dialog.active || build || !ui.modal.hidden || warp || epochIntro.active || cut.on || tour.on) return;
  if (!state.cutSeen) {                                                                          // нова гра: спершу заставка й екскурсія; хто вже грає — не чіпаємо
    if (state.story.done >= 1 || state.epoch > 0 || state.stats.timeTravels > 0 || cutSeenDevice()) { state.cutSeen = true; saveGame(); }       // також якщо заставку вже бачили на цьому пристрої (скидання прогресу її не повертає)
    else { startIntroCutscene(); return; }
  }
  if (state.epochIntroSeen < state.epoch) { playEpochIntro(state.epoch); return; }               // нова епоха: спершу заставка
  if (!ghostHunt) { const late = helpThanksLate(); if (late.length) { playThanksChain(late); return; } }       // гостям минулих епох, яким уже допомогли, подяка одразу
  if (state.story.done >= 1 && !state.tutorialDone) { startDialogue(1, false, 'tut'); return; }   // коротке навчання після першої глави
  if (state.story.done >= 4 && state.tutorialDone && !state.story.guests[8]) { startDialogue(9, false, 'ep', 1); return; }       // гість першої епохи
  const next = state.story.done;
  if (next >= CHAPTERS.length) return;
  if (triggerMet(CHAPTERS[next].trigger, state)) startDialogue(next + 1);
}

// Вкладка «Історія»: відкриті глави з кнопкою «Читати»
function updateStoryUI() {
  if (ui.paneStory.hidden) return;
  const sig = state.story.done + '|' + state.lang + '|' + state.stats.timeTravels + '|' + state.story.guests[8] + '|' + state.story.help.join() + '|' + state.story.thx.join();
  if (uiCache.storySig === sig) return;
  uiCache.storySig = sig;
  ui.storyList.innerHTML = '';
  { const card = document.createElement('div'); card.className = 'card chapter-card';
    const num = document.createElement('div'); num.className = 'num'; num.textContent = '🎬';
    const title = document.createElement('div'); title.className = 'title'; title.textContent = t('introCutTitle');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn'; btn.textContent = t('introCutBtn');
    btn.addEventListener('click', () => startIntroCutscene(true));
    card.append(num, title, btn); ui.storyList.appendChild(card); }
  for (let n = 1; n <= Math.min(state.story.done, CHAPTERS.length); n++) {
    const card = document.createElement('div');
    card.className = 'card chapter-card';
    const num = document.createElement('div'); num.className = 'num'; num.textContent = n;
    const title = document.createElement('div'); title.className = 'title'; title.textContent = t('ch' + n + '_title');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn'; btn.textContent = t('storyRead');
    btn.addEventListener('click', () => startDialogue(n, true));
    card.append(num, title, btn);
    ui.storyList.appendChild(card);
  }
  // фрагменти епох (відкриваються подорожами в часі)
  const epEntries = [];
  if (state.story.guests[8] > 0) epEntries.push(9);                                   // історія першої епохи (П'єтро)
  for (let k = 1; k <= Math.min(EPOCHS.length, state.stats.timeTravels); k++) epEntries.push(k);
  for (const k of epEntries) {
    const label = k === 9 ? 1 : (k % EPOCHS.length) + 1;
    const card = document.createElement('div');
    card.className = 'card chapter-card';
    const num = document.createElement('div'); num.className = 'num'; num.textContent = '⏳';
    const title = document.createElement('div'); title.className = 'title'; title.textContent = t('epochLabel', label) + ': ' + t('ep' + k + '_title');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn'; btn.textContent = t('storyRead');
    btn.addEventListener('click', () => startDialogue(k, true, 'ep', label));
    if (state.story.guests[k - 1] > 0) {                                                 // як іде допомога гостеві
      const sub = document.createElement('small'); sub.textContent = (helpDone(k - 1) ? '✅ ' + t('helpDiaryDone') : EPOCH_CREATURES[guestEpochOf(k - 1)].icon + ' ' + t('helpDiaryLine', helpCount(k - 1), HELP_NEED));
      title.appendChild(sub);
    }
    card.append(num, title, btn);
    ui.storyList.appendChild(card);
    if (state.story.thx[k - 1]) {                                                        // подяку можна перечитати
      const tc = document.createElement('div'); tc.className = 'card chapter-card';
      const tn = document.createElement('div'); tn.className = 'num'; tn.textContent = '💌';
      const tt = document.createElement('div'); tt.className = 'title'; tt.textContent = t('thanksCardTitle', t('speaker_' + GUEST_IDS[k - 1]));
      const tb = document.createElement('button'); tb.type = 'button'; tb.className = 'btn'; tb.textContent = t('storyRead');
      tb.addEventListener('click', () => startDialogue(k, true, 'thx', label));
      tc.append(tn, tt, tb); ui.storyList.appendChild(tc);
    }
  }
  if (state.story.done < CHAPTERS.length) {
    const lock = document.createElement('div');
    lock.className = 'card dept locked';
    lock.textContent = t('storyLocked');
    ui.storyList.appendChild(lock);
  }
}

/* ---------- Гості епох: після історії лишаються ходити містом ---------- */
const guestWalkers = [];
const GUESTS_MAX = 4;             // скільки гостей одночасно гуляє (найновіші)
// Узгоджує гостей на вулиці зі збереженням; arrive — номер гостя, що тільки-но прийшов (заходить зліва)
function syncGuests(arrive) {
  const met = state.story.guests.map((o, k) => [o, k]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, GUESTS_MAX).map(x => x[1]);
  for (let i = guestWalkers.length - 1; i >= 0; i--) if (!met.includes(guestWalkers[i].k)) guestWalkers.splice(i, 1);
  met.forEach(k => {
    if (guestWalkers.some(g => g.k === k)) return;
    guestWalkers.push({ k, id: GUEST_IDS[k], x: arrive === k ? worldL() - 12 : rand(worldL() + 20, worldR() - 20), y: rand(LAYOUT.streetTop + 10, roadFloor()),
      dir: 1, t: rand(0, 10), mode: 'idle', wait: rand(0.3, 2), speed: rand(12, 20), moving: false, tx: 0, ty: 0, sayIn: rand(15, 40) });
  });
}
function updateGuests(dt) {
  guestWalkers.forEach(g => {
    g.t += dt;
    g.y = Math.min(g.y, roadFloor());
    if (g.mode === 'idle') {
      g.moving = false; g.wait -= dt;
      if (g.wait <= 0) {
        const st = guestStands().find(s => s.k === g.k);                                      // є своє місце — гуляє біля нього
        if (st) { g.tx = Math.max(st.x - st.w / 2 - 6, Math.min(st.x + st.w / 2 + 6, g.x + rand(-26, 26))); g.ty = rand(st.y + 4, Math.max(st.y + 5, Math.min(roadFloor(), st.y + 16))); }
        else { g.tx = Math.max(worldL() + 14, Math.min(worldR() - 14, g.x + rand(-90, 90))); g.ty = rand(LAYOUT.streetTop + 8, roadFloor()); }
        g.speed = rand(12, 20); g.mode = 'walk';
      }
    } else {
      const dx = g.tx - g.x, dy = g.ty - g.y, d = Math.hypot(dx, dy), step = g.speed * dt;
      if (d <= step) { g.x = g.tx; g.y = g.ty; g.mode = 'idle'; g.wait = rand(1, 5); g.moving = false; }
      else { g.x += dx / d * step; g.y += dy / d * step; g.moving = true; if (Math.abs(dx) > 0.5) g.dir = dx > 0 ? 1 : -1; }
    }
    g.sayIn -= dt;
    if (g.sayIn <= 0) { g.sayIn = rand(35, 70); if (Object.keys(bubbleEls).length < 1 && animOn()) guestSay(g); }
  });
}
function guestSay(g) {
  showBubble('g' + g.k, t(guestLineKey(g)), g.x, g.y - 19 * ACTOR_K, () => ({ x: g.x, y: g.y - 19 * ACTOR_K }));
}
function hitStandGuest(p) {
  const st = guestStands().find(s => Math.abs(p.x - s.x) <= s.w / 2 && p.y >= s.y - s.h && p.y <= s.y + 3);
  return st ? guestWalkers.find(g => g.k === st.k) || { id: GUEST_IDS[st.k], k: st.k, x: st.x, y: st.y + 4 } : null;       // гостя нема на вулиці (їх гуляє найбільше 4), але його місце відповідає
}
function hitGuest(p) {
  let best = null;
  guestWalkers.forEach(g => { if (Math.abs(p.x - g.x) <= 10 * ACTOR_K && p.y >= g.y - 19 * ACTOR_K && p.y <= g.y + 3 && (!best || g.y > best.y)) best = g; });
  return best;
}
function drawGuest(g) {                                   // гість такого ж розміру й чіткості, як звірята команди (ACTOR_K)
  const x = Math.round(g.x), y = Math.round(g.y), step = g.moving ? Math.floor(g.t * 5) % 2 : 0, k = ACTOR_K;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
  ctx.globalAlpha = 0.22; R(ctx, x - 6, y, 12, 2, 'd'); ctx.globalAlpha = 1;
  ctx.restore();
  drawCrispFigure('npc_' + g.id, x, y, step, step === 1);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
  if (hasHats()) drawHat(x, y - 13 - step, 20 + g.k);
  if (hasScarves()) drawScarf(x, y - 16 - step, g.k);
  ctx.restore();
}

/* ---------- Камео: гість пробігає вулицею ---------- */
function spawnCameo(sprite) {
  cameos.push({ sprite, x: worldL() - 12, y: 168, vx: 62, t: 0 });
}
function updateCameos(dt) {
  for (let i = cameos.length - 1; i >= 0; i--) {
    const c = cameos[i];
    c.t += dt;
    c.x += c.vx * dt;
    if (c.x > worldR() + 16) cameos.splice(i, 1);
  }
}
function drawCameo(c) {
  const step = Math.floor(c.t * 8) % 2;
  const x = Math.round(c.x), y = c.y;
  ctx.globalAlpha = 0.22; R(ctx, x - 6, y, 12, 2, 'd'); ctx.globalAlpha = 1;
  drawSprite(ctx, c.sprite, x - 8, y - 16 - step, { flip: step === 1 });
  R(ctx, x + 6, y - 9 - step, 4, 4, 'c'); R(ctx, x + 7, y - 8 - step, 1, 1, 'd'); R(ctx, x + 8, y - 7 - step, 1, 1, 'd');   // печиво
}

