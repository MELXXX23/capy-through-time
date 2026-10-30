//#part 240_story.js
/* =====================================================================
   СЮЖЕТ І ДІАЛОГИ
   ===================================================================== */

const dialog = { active: false, kind: 'ch', chapter: 0, labelNo: 0, epk: 0, replay: false, pages: [], page: 0, shown: 0, text: '', after: null };
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
  if (p.speaker === 'title' && dialog.kind === 'ec') return t('epochTitle_' + dialog.epk) + ' · ' + t('chapterLabel', dialog.labelNo) + '\n' + t('ec' + dialog.epk + '_' + dialog.chapter + '_title');
  if (p.speaker === 'title' && dialog.kind === 'ch') return t('epochTitle_0') + ' · ' + t('chapterLabel', dialog.labelNo) + '\n' + t('ch' + dialog.chapter + '_title');
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
let dlgCloseT = 0;
function restartAnim(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }     // перезапуск CSS-анімації
function openDialogUI() {
  if (dlgCloseT) { clearTimeout(dlgCloseT); dlgCloseT = 0; }
  ui.dialog.classList.remove('closing');
  ui.dialog.hidden = false;                                  // анімація появи крутиться сама: #dialog:not([hidden])
}
function closeDialogUI() {                                   // плавне зникання: спершу клас closing, потім ховаємо
  if (ui.dialog.hidden || !animOn()) { ui.dialog.hidden = true; return; }
  ui.dialog.classList.add('closing');
  if (dlgCloseT) clearTimeout(dlgCloseT);
  dlgCloseT = setTimeout(() => { dlgCloseT = 0; if (!dialog.active) { ui.dialog.hidden = true; ui.dialog.classList.remove('closing'); } }, 280);
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
  const isTitle = p.speaker === 'title';
  ui.dialog.classList.toggle('isTitle', isTitle);
  if (animOn()) {
    if (isTitle) restartAnim(ui.dlgBox, 'titleIn');
    else {
      restartAnim(ui.dlgName, 'nameIn');
      if (dialog.lastSpeaker !== p.speaker) { restartAnim(ui.dlgWrap, 'portraitIn'); restartAnim(ui.dlgBox, 'pageIn'); }
    }
  }
  dialog.lastSpeaker = p.speaker;
  renderDialogText();
  if (p.choice) buildChoiceButtons();
}

// Запускає главу n (kind 'ch'), фрагмент епохи (kind 'ep') або туторіал (kind 'tut').
// replay — перечитування з вкладки «Історія» (без наслідків для гри); labelNo — номер, що пишеться в заголовку
function startDialogue(n, replay = false, kind = 'ch', labelNo = n, epk = 0) {
  const def = kind === 'ec' ? (EPOCH_CHAPTERS[epk] || [])[n - 1] : kind === 'ch' ? CHAPTERS[n - 1] : (kind === 'ep' || kind === 'thx') ? EPOCH_STORIES[n - 1] : TUTORIAL;
  if (!def || dialog.active) return;
  if (!replay && previewIdx() !== null) setEpochPreview(null);        // новий розділ історії — завжди у власній епосі: інакше заголовок («Епоха Відродження») не збігається з видом на екрані (перегляд іншої епохи)
  dialog.after = null;
  dialog.active = true;
  dialog.kind = kind;
  dialog.chapter = n;
  dialog.labelNo = labelNo;
  dialog.epk = epk;
  dialog.replay = replay;
  dialog.page = 0;
  const prefix = kind === 'tut' ? 'tut' + n : kind === 'ec' ? 'ec' + epk + '_' + n : kind + n;
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
  dialog.lastSpeaker = null;
  openDialogUI();
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
  const n = dialog.chapter, replay = dialog.replay, kind = dialog.kind, epk = dialog.epk;
  dialog.active = false;
  dialog.choosing = false;
  ui.dlgChoices.hidden = true;
  closeDialogUI();
  const after = dialog.after; dialog.after = null;
  if (kind === 'thx') { if (!replay) { state.story.thx[n - 1] = 1; saveGame(); } if (after) after(); return; }
  if (replay) return;
  if (kind === 'tut') { state.tutorialDone = true; storyTimer = 1; saveGame(); return; }
  if (kind === 'ec') {                                                                    // глава епохи 2–8
    const st = state.story; if (!st.epDone) st.epDone = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    st.epDone[epk] = Math.max(st.epDone[epk] || 0, n);
    if (epk === 7 && n === 8 && !st.shnyrJoined) joinShnyr();
    if (epk === 7 && n === 8 && !st.bonusSeen) { st.bonusSeen = true; showToast(t('bonusAvail'), 'big'); }
    if (epk === 8 && n === 8 && !st.japanJoined) joinNara();                              // фінал останньої епохи: Шнирь іде в команду
    storyTimer = 1.5; updateUI(); saveGame(); if (after) after(); return;
  }
  if (kind === 'ep') {
    const st = state.story;
    if (!st.guests[n - 1]) { st.guests[n - 1] = Math.max(...st.guests) + 1; syncGuests(n - 1); nextGhostAt = Date.now() + 25000; }       // гість лишається жити в місті; перші істоти для його прохання з’являться за пів хвилини
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
const CLOCK_H = 62;                                                        // на скільки вежа піднімається над дахом торгового центру
const CLOCK_ROOF = ['t', 'r', 'f', 'v', 'n', 'g', 'n', 'f', 'G'];
const clockFx = { chime: 0, rings: [], hint: 0 };
function clockReady() { return !!state.story.finale && prestigeGain() >= 1; }
function clockTowerGeom() { const cx = shop.x + (shop.w >> 1), y0 = shop.y + Math.max(0, (shop.roofTop | 0) - 2); return { cx, y0, faceY: y0 - 17, top: y0 - CLOCK_H, bottom: y0 + 6 }; }
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
// Вигляд вежі в кожній епосі: [стовбур: основа, світла, темна], [блок: основа, світла, темна], форма даху, колір даху
const CLOCK_LOOK = [
  { stem: ['c', 'E', 'l'], block: ['W', 'E', 'c'], shape: 'dome', rc: 't' },        // Відродження: купол із ліхтарем
  { stem: ['T', 'a', 'n'], block: ['w', 'W', 'c'], shape: 'atom', rc: 'r' },         // Ретро: хромований шпиль з атомною зіркою
  { stem: ['P', 'f', 'V'], block: ['v', 'u', 'V'], shape: 'ball', rc: 'f' },         // Диско: дзеркальна куля
  { stem: ['z', 'V', 'k'], block: ['V', 'v', 'z'], shape: 'invader', rc: 'v' },      // Аркади: піксельний прибулець
  { stem: ['Y', 'w', 'e'], block: ['a', 'S', 'n'], shape: 'dish', rc: 'n' },         // Інтернет: тарілка й антена
  { stem: ['b', 'l', 'd'], block: ['c', 'w', 'l'], shape: 'green', rc: 'g' },        // Еко: дах-сад і вітряк
  { stem: ['E', 'w', 'e'], block: ['w', 'a', 'Y'], shape: 'rocket', rc: 'n' },       // Космос: ракета на майданчику
  { stem: ['z', 'V', 'k'], block: ['k', 'z', 'V'], shape: 'holo', rc: 'f' },         // Неон: голографічне кільце
  { stem: ['b', 'l', 'd'], block: ['l', 'c', 'b'], shape: 'pagoda', rc: 'G' }        // Японія: пагода з двох дахів
];
function clockRoofG(shape, x, y0, rc) {                                                // дах і навершя вежі (до y0 − 66)
  const g = ctx, T = animClock;
  if (shape === 'dome') {
    for (let dy = 0; dy < 15; dy++) { const half = Math.round(17 * Math.sqrt(1 - Math.pow(dy / 15, 2))); R(g, x - half, y0 - 44 - dy, half * 2, 1, rc); R(g, x - half, y0 - 44 - dy, 2, 1, 'd'); R(g, x + half - 2, y0 - 44 - dy, 2, 1, 'd'); if (half > 4) R(g, x - Math.round(half * 0.55), y0 - 44 - dy, 1, 1, 'w'); }
    R(g, x - 18, y0 - 45, 36, 2, 'd'); for (const k of [-9, -3, 3, 9]) R(g, x + k, y0 - 56, 1, 11, 'w');
    R(g, x - 3, y0 - 63, 6, 5, 'W'); R(g, x - 3, y0 - 63, 6, 1, 'd'); R(g, x - 1, y0 - 61, 2, 2, 'y'); R(g, x - 4, y0 - 64, 8, 1, 'd'); R(g, x, y0 - 68, 1, 4, 'h'); R(g, x - 1, y0 - 66, 3, 1, 'h');
  } else if (shape === 'atom') {
    R(g, x - 18, y0 - 45, 36, 2, 'd'); R(g, x - 17, y0 - 46, 34, 2, 'Y'); R(g, x - 14, y0 - 49, 28, 3, 'w'); R(g, x - 14, y0 - 49, 28, 1, 'r'); R(g, x - 10, y0 - 52, 20, 3, 'Y');
    R(g, x, y0 - 62, 1, 11, 'e'); R(g, x - 1, y0 - 62, 1, 11, 'w');
    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([dx, dy], i) => { for (let k = 2; k <= 4; k++) R(g, x + dx * k, y0 - 63 + dy * k, 1, 1, 'e'); R(g, x + dx * 5 - 1, y0 - 63 + dy * 5 - 1, 2, 2, i % 3 === 0 ? 'r' : i % 3 === 1 ? 'y' : 'T'); });
    R(g, x - 1, y0 - 64, 3, 3, 'Y');
  } else if (shape === 'ball') {
    R(g, x - 18, y0 - 45, 36, 2, 'd'); R(g, x - 16, y0 - 48, 32, 3, 'P'); R(g, x - 16, y0 - 48, 32, 1, 'f'); R(g, x - 12, y0 - 51, 24, 3, 'v'); R(g, x, y0 - 57, 1, 6, 'Y');
    for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) if (xx * xx + yy * yy <= 38) R(g, x + xx, y0 - 63 + yy, 1, 1, ((xx >> 1) + (yy >> 1)) % 2 ? 'w' : (xx + yy < -2 ? 'a' : 'Y'));
    R(g, x - 4, y0 - 67, 2, 1, 'w'); R(g, x + 2, y0 - 60, 1, 1, 'w');
    const sp = Math.floor(T * 4) % 4; [[-10, -66], [9, -68], [-8, -58], [10, -60]].forEach(([dx, dy], i) => { if ((i + sp) % 4 === 0) { R(g, x + dx, y0 + dy - 2, 1, 5, 'w'); R(g, x + dx - 2, y0 + dy, 5, 1, 'w'); } });
  } else if (shape === 'invader') {
    R(g, x - 18, y0 - 45, 36, 2, 'd'); R(g, x - 15, y0 - 48, 30, 3, rc); R(g, x - 15, y0 - 48, 30, 1, 'N');
    ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'].forEach((row, j) => { for (let i = 0; i < 11; i++) if (row[i] === '#') R(g, x - 5 + i, y0 - 58 + j + (Math.floor(T * 2) % 2), 1, 1, 'N'); });
    R(g, x, y0 - 64, 1, 5, 'k'); R(g, x - 1, y0 - 65, 3, 1, 'f');
  } else if (shape === 'dish') {
    R(g, x - 18, y0 - 45, 36, 2, 'd'); R(g, x - 16, y0 - 48, 32, 3, 'Y'); R(g, x - 16, y0 - 48, 32, 1, 'w');
    for (let a2 = -9; a2 <= 9; a2++) { const hh = Math.round(Math.sqrt(81 - a2 * a2) * 0.6); R(g, x + 3 + a2, y0 - 51 - hh, 1, hh + 1, a2 < 0 ? 'w' : 'E'); R(g, x + 3 + a2, y0 - 51 - hh, 1, 1, 'e'); }
    R(g, x + 3, y0 - 51, 1, 4, 'e'); R(g, x + 6, y0 - 62, 1, 9, 'e'); R(g, x + 5, y0 - 63, 3, 2, 'E');
    R(g, x - 10, y0 - 66, 1, 18, 'e'); R(g, x - 12, y0 - 58, 5, 1, 'e'); R(g, x - 12, y0 - 52, 5, 1, 'e'); R(g, x - 11, y0 - 67, 3, 2, Math.floor(T * 2) % 2 ? 'r' : 'd');
  } else if (shape === 'green') {
    R(g, x - 18, y0 - 45, 36, 2, 'd'); R(g, x - 17, y0 - 49, 34, 4, 'g'); R(g, x - 17, y0 - 49, 34, 1, 'm'); R(g, x - 17, y0 - 46, 34, 1, 'G');
    for (let k = -16; k < 17; k += 2) { const h2 = 1 + ((k * 7 + 40) % 3); R(g, x + k, y0 - 49 - h2, 1, h2, k % 4 ? 'm' : 'g'); if (k % 6 === 0) R(g, x + k, y0 - 51 - h2, 1, 1, k % 12 ? 'f' : 'y'); }
    R(g, x + 9, y0 - 66, 2, 17, 'w'); R(g, x + 9, y0 - 66, 1, 17, 'E');
    const rot = T * 1.6; for (let b = 0; b < 3; b++) { const an = rot + b * 2.094; for (let k = 1; k <= 8; k++) R(g, x + 10 + Math.round(Math.cos(an) * k), y0 - 67 + Math.round(Math.sin(an) * k), 1, 1, 'w'); }
    R(g, x + 9, y0 - 68, 3, 3, 'e'); R(g, x - 12, y0 - 56, 8, 7, 'n'); R(g, x - 11, y0 - 55, 6, 2, 'S');
  } else if (shape === 'rocket') {
    R(g, x - 18, y0 - 45, 36, 2, 'd'); R(g, x - 16, y0 - 48, 32, 3, 'Y'); R(g, x - 16, y0 - 48, 32, 1, 'w');
    for (let j = 0; j < 17; j++) { const hw = j < 7 ? Math.round(1 + j * 0.45) : 3; R(g, x - hw, y0 - 66 + j, hw * 2 + 1, 1, 'w'); R(g, x - hw, y0 - 66 + j, 1, 1, 'E'); R(g, x + hw, y0 - 66 + j, 1, 1, 'e'); }
    R(g, x, y0 - 68, 1, 3, 'r'); R(g, x - 1, y0 - 66, 3, 2, 'r'); R(g, x - 1, y0 - 58, 3, 3, 'a'); R(g, x - 6, y0 - 55, 3, 7, 'r'); R(g, x + 4, y0 - 55, 3, 7, 'r');
    const fl = Math.floor(T * 10) % 3; R(g, x - 1, y0 - 49, 3, 2 + fl, 'o'); R(g, x, y0 - 49, 1, 1 + fl, 'y');
  } else if (shape === 'holo') {
    R(g, x - 18, y0 - 45, 36, 2, 'd'); R(g, x - 17, y0 - 48, 34, 3, 'z'); R(g, x - 17, y0 - 48, 34, 1, 'f'); R(g, x - 17, y0 - 46, 34, 1, 'N');
    ctx.globalAlpha = 0.18; for (let k = -6; k <= 6; k += 3) R(g, x + k, y0 - 66, 1, 18, 'N'); ctx.globalAlpha = 1;
    for (let i = 0; i < 18; i++) { const an = i / 18 * 6.283 + T * 1.4; R(g, x + Math.round(Math.cos(an) * 11), y0 - 58 + Math.round(Math.sin(an) * 4), 2, 1, i % 2 ? 'N' : 'f'); }
    for (let i = 0; i < 12; i++) { const an = i / 12 * 6.283 - T * 2; R(g, x + Math.round(Math.cos(an) * 7), y0 - 63 + Math.round(Math.sin(an) * 2), 1, 1, 'w'); }
    R(g, x, y0 - 70, 1, 8, 'k'); R(g, x - 1, y0 - 70, 3, 1, 'f');
  } else if (shape === 'pagoda') {
    for (let k = 0; k < 2; k++) {
      const yb = y0 - 44 - k * 9, w2 = 36 - k * 12;
      for (let r = 0; r < 4; r++) R(g, x - Math.round(w2 / 2) + r, yb - 4 + r, w2 - r * 2, 1, r % 2 ? 'n' : rc);
      R(g, x - Math.round(w2 / 2) - 3, yb - 3, 4, 2, rc); R(g, x - Math.round(w2 / 2) - 5, yb - 5, 2, 2, rc); R(g, x + Math.round(w2 / 2) - 1, yb - 3, 4, 2, rc); R(g, x + Math.round(w2 / 2) + 3, yb - 5, 2, 2, rc);
      R(g, x - Math.round(w2 / 2), yb, w2, 1, 'd');
      if (k === 0) { R(g, x - 10, yb - 8 + 0, 20, 4, 'd'); R(g, x - 9, yb - 7, 18, 3, 'b'); [-6, 0, 6].forEach(dx => R(g, x + dx - 1, yb - 7, 2, 3, 'y')); }
    }
    R(g, x - 5, y0 - 60, 10, 1, 'd'); R(g, x - 4, y0 - 61, 8, 1, 'G'); R(g, x, y0 - 70, 1, 9, 'h'); [0, 2, 4].forEach(k => R(g, x - 2 + (k >> 1), y0 - 68 + k, 5 - k, 1, 'h')); R(g, x - 1, y0 - 71, 3, 1, 'y');
  } else {                                                                              // піраміда з флюгером (запасний варіант)
    for (let r = 0; r < 15; r++) { const half = 17 - r; R(g, x - half, y0 - 44 - r, half * 2, 1, rc); R(g, x - half, y0 - 44 - r, 2, 1, 'd'); R(g, x + half - 2, y0 - 44 - r, 2, 1, 'd'); if (r % 4 === 3) R(g, x - half + 2, y0 - 44 - r, half * 2 - 4, 1, 'd'); R(g, x - half + 2, y0 - 44 - r, Math.max(1, Math.floor(half / 3)), 1, 'w'); }
    R(g, x - 18, y0 - 45, 36, 2, 'd');
    R(g, x, y0 - 63, 1, 8, 'd'); disc(g, x, y0 - 61, 2, 'h'); const wv = Math.round(Math.sin(T * 5)); R(g, x + 1, y0 - 64 + wv, 6, 3, 'r'); R(g, x + 1, y0 - 64 + wv, 6, 1, 'J');
  }
}
function drawClockTower() {
  if (!shop || shop.level < 6 || build) return;
  const G = clockTowerGeom(), cx = G.cx, y0 = G.y0, ep = viewEpoch() % EPOCHS.length, night = sky.night, ready = clockReady(), ch = clockFx.chime;
  const ox = animOn() ? Math.round(Math.sin(animClock * 55) * ch * 1.3) : 0, L = CLOCK_LOOK[ep] || CLOCK_LOOK[0];
  const x = cx + ox, [sB, sL, sD] = L.stem, [bB, bL, bD] = L.block;
  // стовбур вежі за дахом (сидить на даху магазину)
  R(ctx, x - 13, y0 - 6, 26, 16, 'd'); R(ctx, x - 12, y0 - 6, 24, 16, sB); R(ctx, x - 12, y0 - 6, 3, 16, sL); R(ctx, x + 9, y0 - 6, 3, 16, sD);
  for (let yy = y0 - 4; yy < y0 + 8; yy += 5) R(ctx, x - 12, yy, 24, 1, sD);
  // годинниковий блок: рамка, пілястри, гзимс
  R(ctx, x - 16, y0 - 33, 32, 29, 'd'); R(ctx, x - 15, y0 - 32, 30, 27, bB); R(ctx, x - 15, y0 - 32, 4, 27, bL); R(ctx, x + 11, y0 - 32, 4, 27, bD);
  R(ctx, x - 17, y0 - 34, 34, 3, 'd'); R(ctx, x - 16, y0 - 33, 32, 1, 'w'); R(ctx, x - 17, y0 - 6, 34, 3, 'd'); R(ctx, x - 16, y0 - 5, 32, 1, bD);
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
  R(ctx, x - 12, y0 - 43, 24, 10, 'd'); R(ctx, x - 11, y0 - 42, 22, 9, 'k'); R(ctx, x - 12, y0 - 43, 3, 10, bB); R(ctx, x + 9, y0 - 43, 3, 10, bB); R(ctx, x - 1, y0 - 43, 2, 10, bB);
  const sw = Math.round(Math.sin(animClock * 30) * ch * 3);
  [-6, 6].forEach(bx => { R(ctx, x + bx - 1 + sw, y0 - 41, 3, 1, 'd'); R(ctx, x + bx - 2 + sw, y0 - 40, 5, 4, 'h'); R(ctx, x + bx - 3 + sw, y0 - 36, 7, 2, 'h'); R(ctx, x + bx + sw, y0 - 34, 1, 1, 'd'); R(ctx, x + bx - 2 + sw, y0 - 40, 1, 4, 'y'); });
  clockRoofG(L.shape, x, y0, L.rc);
  // кільця звуку від ударів і іскри, коли можна вирушати
  clockFx.rings.forEach(rg => { const rr = 12 + rg.t * 40; ctx.globalAlpha = Math.max(0, 0.8 - rg.t * 0.6); for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; R(ctx, Math.round(x + Math.cos(a) * rr), Math.round(fy + Math.sin(a) * rr * 0.9), 2, 2, 'y'); } ctx.globalAlpha = 1; });
  if (ready && animOn()) for (let k = 0; k < 5; k++) { const ph = (animClock * 0.7 + k / 5) % 1, a = k * 1.9 + animClock * 0.8; ctx.globalAlpha = Math.sin(ph * Math.PI); R(ctx, Math.round(x + Math.cos(a) * (14 + ph * 10)), Math.round(fy + Math.sin(a) * (14 + ph * 10)), 1, 3, 'y'); R(ctx, Math.round(x + Math.cos(a) * (14 + ph * 10)) - 1, Math.round(fy + Math.sin(a) * (14 + ph * 10)) + 1, 3, 1, 'y'); ctx.globalAlpha = 1; }
}
function hitClock(p) {
  if (!shop || shop.level < 6 || build || warp) return false;
  const G = clockTowerGeom();
  if (p.x < G.cx - 17 || p.x > G.cx + 17 || p.y < G.top - 4 || p.y > G.bottom) return false;
  clockFx.chime = Math.max(clockFx.chime, 0.6); clockFx.rings.push({ t: 0 }); playSfx('clockTap');
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
    else {
      const b = document.getElementById('boot');                                                   // екран завантаження ще читають: заставка чекає, поки він почне зникати (а тим часом готує кадри)
      if (b && !b.classList.contains('done')) { storyTimer = 0.1; cutWarm('B'); return; }
      startIntroCutscene(); return;
    }
  }
  if (state.epochIntroSeen < state.epoch) { playEpochIntro(state.epoch); return; }               // нова епоха: спершу заставка
  if (!ghostHunt) { const late = helpThanksLate(); if (late.length) { playThanksChain(late); return; } }       // гостям минулих епох, яким уже допомогли, подяка одразу
  if (state.story.done >= 1 && !state.tutorialDone) { startDialogue(1, false, 'tut'); return; }   // коротке навчання після першої глави
  if (DEV_OPEN_ALL) return;                                                                      // режим бога: глави самі не вискакують (читати їх можна в щоденнику)
  if (state.story.done >= 4 && state.tutorialDone && !state.story.guests[8]) { startDialogue(9, false, 'ep', 1); return; }       // гість першої епохи
  { const ek = curEpoch(), st = state.story;                           // глави поточної епохи (з 2-ї): свій сюжет у кожній
    if (ek >= 1 && EPOCH_CHAPTERS[ek] && st.finale) { const nd = (st.epDone && st.epDone[ek]) || 0; if (nd < 8 && triggerMet(EPOCH_CHAPTERS[ek][nd].trigger, state)) { startDialogue(nd + 1, false, 'ec', nd + 1, ek); return; } } }
  if (state.story.shnyrJoined && !state.story.bonusSeen) { state.story.bonusSeen = true; showToast(t('bonusAvail'), 'big'); saveGame(); return; }
  const next = state.story.done;
  if (next >= CHAPTERS.length) return;
  if (triggerMet(CHAPTERS[next].trigger, state)) startDialogue(next + 1);
}

// Шнирь іде в команду: одразу найнятий і отримує особливу здібність — сам ловить золотих відвідувачів
function naraIdx() { return TEAM.findIndex(m => m.id === 'nara'); }
function joinNara() {
  state.story.japanJoined = true; const i = naraIdx();
  if (i >= 0 && !(state.team[i] > 0)) state.team[i] = 1;
  try { recalcIncome(); syncActors(); } catch (e) { /* не страшно */ }
  showToast(t('naraJoined'), 'big');
}
function shnyrIdx() { return TEAM.findIndex(m => m.id === 'shnyr'); }
function shnyrPerk() { const i = shnyrIdx(); return !!(state.story.shnyrJoined && i >= 0 && state.team[i] > 0); }
function joinShnyr() {
  state.story.shnyrJoined = true; const i = shnyrIdx();
  if (i >= 0 && !(state.team[i] > 0)) state.team[i] = 1;
  try { recalcIncome(); syncActors(); } catch (e) { /* не страшно */ }
  showToast(t('shnyrJoined'), 'big'); showToast(t('shnyrPerk'), 'good');
}
// Щоденник: кнопка кожної епохи має свій колір (за стилем епохи); у розділі 8 глав + подяка гостя = 9/9
const DIARY_EP_COL = ['t', 'p', 'P', 'T', 'n', 'g', 'u', 'f', 'r'];                        // літери PALETTE: Відродження, Ретро, Диско, Аркада, Інтернет, Еко, Космос, Неон, Японія (червоний)
const DIARY_THX = ['pietro', 'pip', 'zina', 'maks', 'bitik', 'lesyk', 'orbit', 'lumi', 'sora'];   // чия подяка закриває розділ епохи
function diaryInk(hex) { const n = parseInt(hex.slice(1), 16); return (((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150) ? PALETTE.k : PALETTE.w; }   // читабельний колір тексту на кольоровій кнопці
// Вкладка «Історія»: відкриті глави з кнопкою «Читати»
// Режим бога: тап «Читати» на 4-й главі епохи одразу приводить гостя(ів) цієї епохи (у грі вони приходять, коли ти потрапляєш в епоху)
function godGuests(ek) {
  const st = state.story, ks = ek === 0 ? [8, 7] : [guestIdxOfEpoch(ek)];
  ks.forEach(k => { if (!st.guests[k]) { st.guests[k] = Math.max(...st.guests) + 1; syncGuests(k); } });
  saveGame(); updateUI();
}
function updateStoryUI() {
  if (ui.paneStory.hidden) return;
  const god = !!DEV_OPEN_ALL;                                                                      // режим бога: у щоденнику відкриті всі глави й історії (лише для власника)
  const mainDone = god ? CHAPTERS.length : Math.min(state.story.done, CHAPTERS.length);
  const sig = (god ? 'G' : '') + state.story.done + '|' + state.lang + '|' + state.stats.timeTravels + '|' + state.story.guests[8] + '|' + state.story.guests[9] + '|' + state.story.help.join() + '|' + state.story.thx.join() + '|' + (state.story.epDone || []).join();
  if (uiCache.storySig === sig) return;
  uiCache.storySig = sig;
  ui.storyList.innerHTML = '';
  { const card = document.createElement('div'); card.className = 'card chapter-card';
    const num = document.createElement('div'); num.className = 'num'; num.textContent = '🎬';
    const title = document.createElement('div'); title.className = 'title'; title.textContent = t('introCutTitle');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn'; btn.textContent = t('introCutBtn');
    btn.addEventListener('click', () => startIntroCutscene(true));
    card.append(num, title, btn); ui.storyList.appendChild(card); }
  const curEp = curEpoch();
  if (!uiCache.storyOpen) uiCache.storyOpen = {};
  const isOpen = ek => (uiCache.storyOpen[ek] !== undefined ? uiCache.storyOpen[ek] : ek === curEp);        // за замовчуванням розкрита лише поточна епоха
  const colOf = ek => PALETTE[DIARY_EP_COL[ek]] || PALETTE.r;                                  // колір кнопки епохи (за її стилем)
  const thxIdx = ek => GUEST_IDS.indexOf(DIARY_THX[ek]);                                        // гість, чия подяка — 9-й пункт епохи
  const hasThx = ek => { const gi = thxIdx(ek); return gi >= 0 && (god || !!state.story.thx[gi]); };
  const sectionHead = (ek, nd) => {                                                           // заголовок розділу епохи (тап — згорнути/розкрити): назва · скільки пунктів із 9 (8 глав + подяка гостя)
    if (nd === 0 && !hasThx(ek) && ek !== curEp) {                                             // епоха ще не відкрита: заголовок із замком
      const lk = document.createElement('div'); lk.className = 'card chapter-card'; const ln = document.createElement('div'); ln.className = 'num'; ln.textContent = '🔒';
      const lt = document.createElement('div'); lt.className = 'title'; lt.textContent = t('epochTitle_' + ek) + ' · 0/9'; lk.style.opacity = '0.6'; lk.append(ln, lt); ui.storyList.appendChild(lk); return false;
    }
    const col = colOf(ek), ink = diaryInk(col);
    const head = document.createElement('button'); head.type = 'button'; head.className = 'card chapter-card'; head.style.cssText = 'width:100%;text-align:left;cursor:pointer;font:inherit;color:' + ink + ';background:' + col + ';';
    head.setAttribute('aria-expanded', String(isOpen(ek)));
    const hn = document.createElement('div'); hn.className = 'num'; hn.style.color = ink; hn.textContent = ek === curEp ? '★' : '⏳';
    const ht = document.createElement('div'); ht.className = 'title'; ht.textContent = (isOpen(ek) ? '[−] ' : '[+] ') + t('epochTitle_' + ek) + ' · ' + (nd + (hasThx(ek) ? 1 : 0)) + '/9';
    head.addEventListener('click', () => { uiCache.storyOpen[ek] = !isOpen(ek); uiCache.storySig = ''; updateStoryUI(); });
    head.append(hn, ht); ui.storyList.appendChild(head);
    return true;
  };
  const chapterCard = (ek, n, title, onRead) => {                                              // глава епохи: номер у кольорі епохи + «Читати»
    const card = document.createElement('div'); card.className = 'card chapter-card'; card.style.borderLeft = '6px solid ' + colOf(ek);
    const num = document.createElement('div'); num.className = 'num'; num.style.color = colOf(ek); num.textContent = n;
    const ttl = document.createElement('div'); ttl.className = 'title'; ttl.textContent = title;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn'; btn.textContent = t('storyRead');
    btn.addEventListener('click', onRead);
    card.append(num, ttl, btn); ui.storyList.appendChild(card);
  };
  const thxCard = ek => {                                                                      // 9-й пункт епохи: подяка гостя (можна перечитати)
    if (!hasThx(ek)) return;
    const gi = thxIdx(ek), label = guestEpochOf(gi) + 1;
    chapterCard(ek, '💌', t('thanksCardTitle', t('speaker_' + GUEST_IDS[gi])), () => startDialogue(gi + 1, true, 'thx', label));
  };
  const lockCard = () => { const lock = document.createElement('div'); lock.className = 'card dept locked'; lock.textContent = t('storyLocked'); ui.storyList.appendChild(lock); };
  // епоха 0 (Відродження): 8 глав основного сюжету + подяка П'єтра
  if (sectionHead(0, mainDone) && isOpen(0)) {
    for (let n = 1; n <= mainDone; n++) chapterCard(0, n, t('ch' + n + '_title'), () => { startDialogue(n, true); if (god && n === 4) godGuests(0); });
    thxCard(0);
    if (!god && state.story.done < CHAPTERS.length) lockCard();
  }
  // епохи 1–8 (Ретро … Країна вранішнього сонця): 8 глав + подяка гостя епохи
  for (let ek = 1; ek < EPOCHS.length; ek++) {
    const nd = god ? 8 : Math.min(8, (state.story.epDone && state.story.epDone[ek]) || 0);
    if (!sectionHead(ek, nd) || !isOpen(ek)) continue;
    for (let n = 1; n <= nd; n++) chapterCard(ek, n, t('ec' + ek + '_' + n + '_title'), () => { startDialogue(n, true, 'ec', n, ek); if (god && n === 4) godGuests(ek); });
    thxCard(ek);
    if (ek === curEp && nd < 8) lockCard();
  }
}

/* ---------- Гості епох: після історії лишаються ходити містом ---------- */
const guestWalkers = [];
let guestSyncEpoch = -1;           // епоха, під яку зараз зібрано guestWalkers
const GUESTS_MAX = 4;             // скільки гостей одночасно гуляє (найновіші)
// Узгоджує гостей на вулиці зі збереженням; arrive — номер гостя, що тільки-но прийшов (заходить зліва)
function syncGuests(arrive) {
  const ev = viewEpoch() % EPOCHS.length;                                                    // на вулиці гуляють лише гості ТІЄЇ епохи, яку зараз видно
  guestSyncEpoch = ev;
  const met = state.story.guests.map((o, k) => [o, k]).filter(x => x[0] > 0 && GUEST_STAND_EPOCH[GUEST_IDS[x[1]]] === ev).sort((a, b) => b[0] - a[0]).slice(0, GUESTS_MAX).map(x => x[1]);
  for (let i = guestWalkers.length - 1; i >= 0; i--) if (!met.includes(guestWalkers[i].k)) guestWalkers.splice(i, 1);
  met.forEach(k => {
    if (guestWalkers.some(g => g.k === k)) return;
    const fresh = arrive === k;
    guestWalkers.push({ k, id: GUEST_IDS[k], x: fresh ? Math.max(worldL() - 12, visL() - 14) : rand(worldL() + 20, worldR() - 20), y: fresh ? roadFloor() - 4 : rand(LAYOUT.streetTop + 10, roadFloor()),
      dir: 1, t: rand(0, 10), mode: 'idle', wait: fresh ? 0.1 : rand(0.3, 2), speed: fresh ? 34 : rand(12, 20), moving: false, tx: 0, ty: 0, sayIn: rand(15, 40) });
    if (fresh && typeof guestArrived === 'function') guestArrived(k);                           // місце гостя з'явиться, коли він дійде
  });
}
function updateGuests(dt) {
  if (viewEpoch() % EPOCHS.length !== guestSyncEpoch) syncGuests();                         // змінилась епоха (подорож, перегляд) — гості інших епох зникають
  guestWalkers.forEach(g => {
    g.t += dt;
    if (typeof standPending !== 'undefined' && standPending[g.k] !== undefined) {              // новий гість іде до свого місця
      const st = guestStands(true).find(s => s.k === g.k);
      if (!st || Math.abs(g.x - st.x) < st.w / 2 + 10 || animClock > standPending[g.k]) {
        delete standPending[g.k]; if (st) { standReveal[g.k] = animClock; try { spawnDust(st.x, st.y, 8); playSfx('upgrade'); } catch (e) { /* не страшно */ } }
      } else if (g.mode === 'idle' || g.mode === 'walk') { g.tx = st.x; g.ty = Math.min(roadFloor(), st.y + 8); g.mode = 'walk'; g.speed = 34; }
    }
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
  ctx.globalAlpha = 0.24; R(ctx, x - 7, y, 14, 2, 'd'); ctx.globalAlpha = 0.12; R(ctx, x - 4, y + 2, 8, 1, 'd'); ctx.globalAlpha = 1;
  ctx.restore();
  drawCrispFigure(guestSpriteName(g.id), x, y, step, step === 1);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
  if (hasHats()) drawHat(x, y - 13 - step, 20 + g.k);
  if (hasScarves()) drawScarf(x, y - 16 - step, g.k);
  ctx.restore();
  drawCrispEars(guestSpriteName(g.id), x, y, step, step === 1);
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
  ctx.globalAlpha = 0.24; R(ctx, x - 7, y, 14, 2, 'd'); ctx.globalAlpha = 0.12; R(ctx, x - 4, y + 2, 8, 1, 'd'); ctx.globalAlpha = 1;
  drawSprite(ctx, c.sprite, x - 8, y - 16 - step, { flip: step === 1 });
  R(ctx, x + 6, y - 9 - step, 4, 4, 'c'); R(ctx, x + 7, y - 8 - step, 1, 1, 'd'); R(ctx, x + 8, y - 7 - step, 1, 1, 'd');   // печиво
}

