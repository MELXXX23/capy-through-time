//#part 230_c_news_wheel_events.js
let npI = 0, npN = 0, npDrag = null;
function newsPortrait(spr, bg) {                                                 // маленький піксельний портрет редактора
  const { c, g } = picCanvas(32, 32); R(g, 0, 0, 32, 32, bg); R(g, 0, 26, 32, 6, 'b');
  const sc = getSpriteCanvas(spr); g.drawImage(sc, 0, 0, sc.width, sc.height, (32 - sc.width) >> 1, 31 - sc.height, sc.width, sc.height);
  return c;
}

let newsSec = 'news';
const NP_SEC = { uk: { news: 'Про нас', guide: 'Поради', soon: 'Скоро' }, en: { news: 'About us', guide: 'Tips', soon: 'Coming soon' } };
const NP_GUIDE = {
  uk: { head: 'Поради', sub: 'Кілька підказок, щоб грати легше й розвиватися швидше.', items: [
    ['💰 Як швидше розбагатіти', '<ul class="np-list"><li>Найми Їжачка Голку якомога раніше. Він коштує всього 100 монет, а кожен тап стає сильнішим у 1,5 раза.</li><li>Кнопка «МАКС» у «Відділах» купує стільки, скільки вистачає грошей. Так не треба тиснути «Купити» двадцять разів.</li><li>Дивись на смужку вгорі екрана. Вона завжди підказує наступну ціль, наприклад «Купи “Свічки й сірники”: 7/25».</li></ul>', 'tipRich'],
    ['🏪 Як рости', '<ul class="np-list"><li>Щоб розширити магазин, треба виконати три умови: купити потрібні відділи, прокачати звірят і зібрати монети. Умови видно у вкладці «Відділи», у блоці «Розширення».</li><li>Кожен новий рівень магазину дає ×2 до всього доходу, тому розширюйся при першій нагоді.</li></ul>', 'tipGrow'],
    ['🎁 Безкоштовні бонуси', '<ul class="np-list"><li>Барабан фортуни щодня. Якщо пропустиш день, серія скинеться і призи стануть меншими.</li><li>Цирк фортуни дає скіни й кристали, тож не проходь повз намет.</li><li>Нагороди за досягнення. Заглядай у вкладку з кубком, там чекають призи.</li><li>Івенти на вулиці. Червоний «!», сова чи єнот з’являються ненадовго. Встиг тапнути, і отримаєш бонус.</li></ul>', 'tipFree'],
    ['⏳ На майбутнє', 'Подорож у часі скидає магазин, але дає осколки часу, нову епоху й постійний бонус до доходу. Не бійся її: наступне коло пройде набагато швидше.', 'clock']
  ] },
  en: { head: 'Tips', sub: 'A few hints to play easier and grow faster.', items: [
    ['💰 How to get rich faster', '<ul class="np-list"><li>Hire Spike the hedgehog as early as you can. He costs only 100 coins, and every tap becomes 1.5 times stronger.</li><li>The MAX button in Departments buys as much as your money allows. No need to press Buy twenty times.</li><li>Watch the strip at the top of the screen. It always shows the next goal, for example “Buy “Candles and matches”: 7/25”.</li></ul>', 'tipRich'],
    ['🏪 How to grow', '<ul class="np-list"><li>To expand the shop you need three things: buy the required departments, upgrade the animals and collect coins. The conditions are in the Departments tab, in the Expansion block.</li><li>Every new shop level gives ×2 to all income, so expand at the first chance.</li></ul>', 'tipGrow'],
    ['🎁 Free bonuses', '<ul class="np-list"><li>The fortune drum every day. If you skip a day the streak resets and prizes get smaller.</li><li>The fortune circus gives skins and crystals, so do not walk past the tent.</li><li>Achievement rewards. Look into the tab with the cup, prizes are waiting there.</li><li>Street events. The red “!”, an owl or a raccoon appear only for a moment. Tap in time and you get a bonus.</li></ul>', 'tipFree'],
    ['⏳ For the future', 'Time travel resets the shop but gives time shards, a new era and a permanent income bonus. Do not be afraid of it: the next round goes much faster.', 'clock']
  ] }
};
const NP_SOON = {
  uk: { head: 'Скоро в грі', sub: 'Те, що ми готуємо. Ще не вийшло, але вже майже.', items: [
    ['Нові бонусні епохи', 'Японія вже в грі. Далі будуть нові бонусні епохи, кожна зі своїм переходом, сюжетом, помічником, гостем і літаючими прикрасами.'],
    ['Застосунки для магазинів', 'Готуємо версії гри для телефона й комп’ютера в магазинах застосунків.']
  ] },
  en: { head: 'Coming soon', sub: 'What we are working on. Not out yet, but almost.', items: [
    ['More bonus eras', 'Japan is already in the game. More bonus eras are coming, each with its own travel animation, story, helper, guest and flying decorations.'],
    ['App store versions', 'We are preparing versions of the game for phones and computers in app stores.']
  ] }
};
function npArticle(h, p, pic, cap) {
  const a = document.createElement('article'); a.innerHTML = '<h3>' + h + '</h3>';
  if (pic) { const f = document.createElement('figure'); f.className = 'np-fig'; f.appendChild(newsPic(pic)); if (cap) f.insertAdjacentHTML('beforeend', '<figcaption>' + cap + '</figcaption>'); a.appendChild(f); }
  a.insertAdjacentHTML('beforeend', p.charAt(0) === '<' ? p : '<p>' + p + '</p>'); return a;
}
function buildListPages(D, perPage) {                                          // розділи «Інструкція» і «Скоро»: заголовок на першій сторінці, потім статті
  const pages = [];
  for (let i = 0; i < D.items.length; i += perPage) {
    const pg = document.createElement('div'); pg.className = 'np-in';
    if (i === 0) pg.insertAdjacentHTML('beforeend', '<div class="np-lead">' + D.head + '</div><p>' + D.sub + '</p>');
    D.items.slice(i, i + perPage).forEach(it => pg.appendChild(npArticle(it[0], it[1], it[2], it[3])));
    pages.push(pg);
  }
  return pages;
}
function newsAnimate(change, dir) {                                            // плавна заміна сторінок при перемиканні розділу чи випуску
  if (newsBusy) return; newsBusy = true; playSfx('paper');
  const pg = ui.newsBody, out = pg.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-dir * 36) + 'px) scale(.97)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
  out.onfinish = () => { change(); newsFill(); out.cancel(); pg.animate([{ opacity: 0, transform: 'translateX(' + (dir * 36) + 'px) scale(.97)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => { newsBusy = false; }; };
}
const NEWS_ABOUT = {
  uk: {
    mast: 'ПРО НАС', lead: 'Привіт, друже!',
    newH: 'Що нового', new: 'Бонусна епоха «Японія»! Після Неону час несе в країну вранішнього сонця: дерев’яні будинки з дашками, сакура, паперові ліхтарі й дракон, що літає над містом. У неї свій перехід, 8 нових глав, лисиця Сора з чайним будиночком і новий помічник, олениця Нара. Годинникова вежа тепер у стилі кожної епохи й стоїть просто на даху.',
    intro: ['Ми — MEL і NIKA, і цю гру зробили самі, піксель за пікселем.', 'Капі починає з однієї монетки й крихітної крамнички на розі. Твоє завдання: виростити її в справжній торговий центр і пройти крізь цілі епохи.'],
    nextH: 'Що попереду', next: 'Попереду 8 епох: від Відродження до Неону. Подорожуй у часі, і твій магазин стане чимось більшим…',
    giftH: 'Подарунок', gift: 'Забрати подарунок від розробників: +100 монет', giftDone: 'Подарунок уже забрано. Дякуємо, що граєш!',
    writeH: 'Зв’язок', write: 'Знайшов помилку чи маєш ідею? Тисни «Написати розробникам» унизу: ми читаємо все.'
  },
  en: {
    mast: 'ABOUT US', lead: 'Hi, friend!',
    newH: 'What is new', new: 'The bonus era “Japan”! After Neon, time carries you to the land of the rising sun: wooden houses with little roofs, sakura, paper lanterns and a dragon flying over town. It has its own travel animation, 8 new chapters, Sora the fox with her tea house and a new helper, Nara the doe. The clock tower now matches every era and stands right on the roof.',
    intro: ['We are MEL and NIKA, and we made this game ourselves, pixel by pixel.', 'Capy starts with one coin and a tiny shop on the corner. Your job: grow it into a real shopping mall and travel through whole eras.'],
    nextH: 'What is ahead', next: 'Ahead are 8 eras: from the Renaissance to Neon. Travel through time, and your shop will become something bigger…',
    giftH: 'A gift', gift: 'Claim the developers\' gift: +100 coins', giftDone: 'Gift already claimed. Thanks for playing!',
    writeH: 'Contact', write: 'Found a bug or have an idea? Press Write to the developers below: we read everything.'
  }
};
function newsGiftClaim(btn) {
  if (state.newsGift) return;                                   // подарунок лише один раз
  state.newsGift = 1; state.coins += 100; state.totalEarned += 100;
  recalcIncome(); updateUI(); saveGame();
  const W = NEWS_ABOUT[state.lang === 'uk' ? 'uk' : 'en'];
  btn.disabled = true; btn.textContent = W.giftDone;
  showToast(state.lang === 'uk' ? '+100 монет від розробників!' : '+100 coins from the developers!', 'big'); playSfx('wheelWin');
}
function buildNewsPages() {
  if (newsSec === 'guide') return buildListPages(NP_GUIDE[state.lang === 'uk' ? 'uk' : 'en'], 1);
  if (newsSec === 'soon') return buildListPages(NP_SOON[state.lang === 'uk' ? 'uk' : 'en'], 1);
  const L = state.lang === 'uk' ? 'uk' : 'en', W = NEWS_ABOUT[L], pages = [];
  const cover = document.createElement('div'); cover.className = 'np-in np-cover';
  const mast = document.createElement('div'); mast.className = 'np-mast';
  mast.innerHTML = '<div class="row"><div class="who" id="npWhoA"></div><b>MEL<br><i>&amp;</i> NIKA</b><div class="who" id="npWhoB"></div></div><small>' + (L === 'uk' ? 'ГАЗЕТА ВІД РОЗРОБНИКІВ · ' : 'NEWS FROM THE DEVELOPERS · ') + W.mast + '</small>';
  const wa = mast.querySelector('#npWhoA'), wb = mast.querySelector('#npWhoB');
  wa.appendChild(newsPortrait('capy_mel', '#cdb98d')); wa.insertAdjacentHTML('beforeend', '<span>MEL</span>');
  wb.appendChild(newsPortrait('capy_nika', '#e7c6c0')); wb.insertAdjacentHTML('beforeend', '<span>NIKA</span>');
  mast.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  cover.appendChild(mast);
  cover.insertAdjacentHTML('beforeend', '<div class="np-lead">' + W.lead + '</div>' + W.intro.map(x => '<p>' + x + '</p>').join(''));
  const f = document.createElement('figure'); f.className = 'np-fig'; f.appendChild(newsPic('cover')); cover.appendChild(f);
  pages.push(cover);
  const p2 = document.createElement('div'); p2.className = 'np-in';
  p2.insertAdjacentHTML('beforeend', '<article><h3>' + W.newH + '</h3><p>' + W.new + '</p></article>');
  p2.insertAdjacentHTML('beforeend', '<article><h3>' + W.nextH + '</h3><p>' + W.next + '</p></article>');
  const a = document.createElement('article'); a.innerHTML = '<h3>' + W.giftH + '</h3>';
  const gb = document.createElement('button'); gb.type = 'button'; gb.className = 'btn go np-gift';
  gb.textContent = state.newsGift ? W.giftDone : W.gift; gb.disabled = !!state.newsGift;
  gb.addEventListener('click', e => { e.stopPropagation(); newsGiftClaim(gb); });
  a.appendChild(gb);
  const gf = document.createElement('figure'); gf.className = 'np-fig'; gf.appendChild(newsPic('gift')); a.appendChild(gf); p2.appendChild(a);
  p2.insertAdjacentHTML('beforeend', '<article><h3>' + W.writeH + '</h3><p>' + W.write + '</p></article>');
  p2.insertAdjacentHTML('beforeend', '<p class="np-sign">' + t('newsSign') + '</p>');
  pages.push(p2);
  return pages;
}
function npShow(first) {
  const els = ui.newsBody.children;
  [...els].forEach((el, i) => { el.classList.toggle('flipped', i < npI); el.style.zIndex = String(npN - i); if (i === npI) { const sc = el.querySelector('.np-in'); if (sc) sc.scrollTop = 0; } });
  ui.npNum.textContent = (npI + 1) + ' / ' + npN; ui.npPrev.disabled = npI === 0; ui.npNext.disabled = npI === npN - 1;
}
function npGo(d) { const n = Math.max(0, Math.min(npN - 1, npI + d)); if (n === npI) return; npI = n; npShow(); playSfx('paper'); }
function newsFill() {                                                           // сторінки обраного розділу/випуску й вкладки
  ui.newsBody.innerHTML = '';
  buildNewsPages().forEach(inner => { const pg = document.createElement('div'); pg.className = 'np-page'; pg.appendChild(inner); ui.newsBody.appendChild(pg); });
  npI = 0; npN = ui.newsBody.children.length; npShow(true);
  const L = state.lang === 'uk' ? 'uk' : 'en', secs = ['news', 'guide', 'soon'];
  ui.npSecs.innerHTML = '';
  secs.forEach((k, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'np-tab' + (k === newsSec ? ' on' : ''); b.textContent = NP_SEC[L][k]; b.addEventListener('click', e => { e.stopPropagation(); if (k === newsSec || newsBusy) return; const dir = i > secs.indexOf(newsSec) ? 1 : -1; newsAnimate(() => { newsSec = k;  }, dir); }); ui.npSecs.appendChild(b); });
  ui.npTabs.innerHTML = ''; ui.npTabs.hidden = true;                          // архіву старих випусків нема: лише свіжий (або вітальний)
}
function openNews() {
  ui.newsTitle.textContent = t('newsTitle'); ui.newsSub.textContent = t('newsSub');
  newsSec = 'news'; newsBusy = false; newsFill();
  ui.newsClose.textContent = t('newsClose'); ui.npWrite.textContent = t('fbBtn');
  ui.newsModal.classList.remove('open'); void ui.newsModal.offsetWidth; ui.newsModal.classList.add('open');
  ui.newsModal.hidden = false; newsReveal(); playSfx('paper'); setTimeout(() => playSfx('wheelWin'), 650); setTimeout(() => playSfx('paper'), 900);
  if (newsUnread()) { state.newsSeen = NEWS_VERSION; saveGame(); }
}
// Куди надходять повідомлення гравців (заповнює розробник; усе порожнє = текст лише копіюється):
//   url   — адреса форми/сервісу, що приймає POST із JSON (Formspree, Google Apps Script тощо) і пересилає листом розробникам;
//   email — запасний варіант: відкриє поштову програму гравця з готовим листом;
//   form  — Google Форма (рекомендовано: відгуки збираються в таблицю, яку розробник відкриває за посиланням на ПК). Адреса виду
//           https://docs.google.com/forms/d/e/<ID>/formResponse, а entries — номери полів «Відгук» і «Контакт» (entry.1234567890).
//   key   — публічний ключ Web3Forms (призначений для вставки в код сторінки): відгук приходить розробникам листом, без реєстрації гравця.
const FEEDBACK = { url: 'https://api.web3forms.com/submit', key: 'e64b25f5-050c-4ad9-be85-0d3535b2b622', email: 'capytap.games@gmail.com', form: '', entries: { message: '', contact: '' } };
function openFeedback() {
  ui.fbTitle.textContent = t('fbTitle'); ui.fbHint.textContent = t('fbHint'); ui.fbText.placeholder = '…'; ui.fbContact.placeholder = t('fbContact');
  ui.fbSend.textContent = t('fbSend'); ui.fbCancel.textContent = t('fbCancel');
  let draft = ''; try { draft = localStorage.getItem('capyFeedbackDraft') || ''; } catch (e) { /* без чернетки теж працює */ }
  ui.fbText.value = draft; ui.fbCount.textContent = draft.length + ' / 800';
  ui.fbModal.hidden = false; setTimeout(() => { try { ui.fbText.focus(); } catch (e) { /* ok */ } }, 50);
}
function closeFeedback() { ui.fbModal.hidden = true; }
async function sendFeedback() {
  const msg = ui.fbText.value.trim(), contact = ui.fbContact.value.trim();
  if (msg.length < 3) { showToast(t('fbEmpty'), 'bad'); return; }
  const info = { message: msg, contact, game: 'CapyTap: Market', lang: state.lang, epoch: state.epoch, shopLevel: state.shopLevel, travels: (state.stats && state.stats.timeTravels) || 0, ua: (navigator.userAgent || '').slice(0, 120) };
  const done = () => { try { localStorage.removeItem('capyFeedbackDraft'); } catch (e) { /* ok */ } ui.fbText.value = ''; closeFeedback(); };
  if (FEEDBACK.form && FEEDBACK.entries.message) {                                   // Google Форма: надсилаємо як звичайну форму, відповідь браузер не показує (no-cors), тому помилкою вважаємо лише обрив мережі
    ui.fbSend.disabled = true;
    try {
      const fd = new URLSearchParams();
      fd.set(FEEDBACK.entries.message, msg + '\n\n— ' + info.game + ', ' + info.lang + ', епоха ' + info.epoch + ', рівень ' + info.shopLevel + ', подорожей ' + info.travels + ', ' + info.ua);
      if (FEEDBACK.entries.contact) fd.set(FEEDBACK.entries.contact, contact);
      await fetch(FEEDBACK.form, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
      done(); showToast(t('fbThanks'), 'good'); playSfx('wheelWin');
    } catch (e) { showToast(t('fbFail'), 'bad'); }
    ui.fbSend.disabled = false; return;
  }
  if (FEEDBACK.url) {
    ui.fbSend.disabled = true;
    try {
      const payload = Object.assign({}, info);
      if (FEEDBACK.key) {                                                           // Web3Forms: ключ, тема й відправник; «email» заповнюємо лише справжньою поштою, щоб розробник міг відповісти
        payload.access_key = FEEDBACK.key; payload.subject = 'CapyTap: Market — відгук гравця'; payload.from_name = 'CapyTap: Market';
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) payload.email = contact;
      }
      const r = await fetch(FEEDBACK.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      let ok = r.ok; try { const j = await r.json(); if (j && j.success === false) ok = false; } catch (e) { /* відповідь не JSON: довіряємо кодові статусу */ }
      if (!ok) throw new Error('http');
      done(); showToast(t('fbThanks'), 'good'); playSfx('wheelWin');
    } catch (e) { showToast(t('fbFail'), 'bad'); }
    ui.fbSend.disabled = false; return;
  }
  const body = msg + '\n\n— ' + (contact || '') + '\n(' + info.game + ', ' + info.lang + ', epoch ' + info.epoch + ', level ' + info.shopLevel + ')';
  if (FEEDBACK.email) { window.location.href = 'mailto:' + FEEDBACK.email + '?subject=' + encodeURIComponent('CapyTap: Market') + '&body=' + encodeURIComponent(body); done(); return; }
  try { await navigator.clipboard.writeText(body); } catch (e) { /* буфер недоступний */ }
  showToast(t('fbCopied'), 'good'); done();
}
let npRevealRaf = 0;
function newsReveal() {                                                         // з центру розходяться пікселі, заповнюються папером і переростають у газету
  const host = ui.npPaper; let cv = document.getElementById('npReveal'); if (cv) cv.remove();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { host.style.opacity = ''; return; }
  const W = host.clientWidth, H = host.clientHeight - 36; if (W < 40 || H < 40) return;
  const B = 12, cols = Math.ceil(W / B), rows = Math.ceil(H / B);
  cv = document.createElement('canvas'); cv.id = 'npReveal'; cv.width = cols; cv.height = rows; host.appendChild(cv);
  const g = cv.getContext('2d'), noise = new Float32Array(cols * rows).map((_, i) => ((i * 2654435761) >>> 8) % 100 / 100);
  const pages = ui.newsBody; pages.style.opacity = '0';
  const t0 = performance.now(), D = 950, maxD = Math.hypot(cols / 2 * (H / W), rows / 2) + 1;
  cancelAnimationFrame(npRevealRaf);
  const frame = now => {
    const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 2.2), rad = e * (maxD + 3);
    const fill = (x, y) => { if (x < 0 || y < 0 || x >= cols || y >= rows) return false; const dx = (x + .5 - cols / 2) * (H / W), dy = y + .5 - rows / 2; return Math.hypot(dx, dy) + noise[y * cols + x] * 1.6 <= rad; };
    g.clearRect(0, 0, cols, rows);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (!fill(x, y)) continue;
      const edge = !(fill(x - 1, y) && fill(x + 1, y) && fill(x, y - 1) && fill(x, y + 1));
      g.fillStyle = edge ? '#2a1d1a' : '#f6edd2'; g.fillRect(x, y, 1, 1);
    }
    const a = Math.max(0, (k - 0.45) / 0.55); pages.style.opacity = String(a * a * (3 - 2 * a));
    cv.style.opacity = k < 0.8 ? '1' : String(Math.max(0, 1 - (k - 0.8) / 0.2));
    if (k < 1 && !ui.newsModal.hidden) npRevealRaf = requestAnimationFrame(frame); else { pages.style.opacity = ''; cv.remove(); }
  };
  npRevealRaf = requestAnimationFrame(frame);
}
function closeNews() {
  cancelAnimationFrame(npRevealRaf); ui.newsBody.style.opacity = ''; const rv = document.getElementById('npReveal'); if (rv) rv.remove(); ui.newsModal.hidden = true; ui.newsModal.classList.remove('open'); }
function hitMail(p) {
  if (!state.events.mailPending) return false;
  const x = mailBoxX(), y = mailRoadY();
  if (Math.abs(p.x - x) <= 14 && p.y >= y - 38 && p.y <= y + 3) { openLetter(); return true; }
  return false;
}
// Лист: випадковий відправник (звірята-друзі) і випадковий бонус
const LETTER_SENDERS = ['spike', 'zoya', 'bodya', 'sonia', 'leo', 'pao'];
function openLetter() {
  const fin = state.story.finale;
  const kinds = [['income', 30], ['tap', 25], ['coins', 25], ['wheel', 10], ['sale', 8], ['crystal', 4]];
  let roll = Math.random() * kinds.reduce((a, k) => a + k[1], 0), kind = kinds[0][0];
  for (const k of kinds) { roll -= k[1]; if (roll < 0) { kind = k[0]; break; } }
  const sender = LETTER_SENDERS[Math.floor(Math.random() * LETTER_SENDERS.length)];
  mail.letter = { kind, sender };
  let boost = '';
  if (kind === 'income') { mail.letter.mult = Math.random() < 0.6 ? 2 : 3; mail.letter.min = mail.letter.mult === 2 ? 6 : 4; boost = t('letterBoost_income', mail.letter.mult, mail.letter.min); }
  else if (kind === 'tap') { mail.letter.mult = 5; mail.letter.min = 3; boost = t('letterBoost_tap', 5, 3); }
  else if (kind === 'coins') { mail.letter.gain = Math.floor(state.cps * 900 + 500 * levelMult()); boost = t('letterBoost_coins', fmt(mail.letter.gain)); }
  else if (kind === 'wheel') boost = t('letterBoost_wheel');
  else if (kind === 'sale') boost = t('letterBoost_sale');
  else boost = t('letterBoost_crystal');
  ui.letterTitle.textContent = t('letterTitle', t('team_' + sender));
  ui.letterText.textContent = t('letter_' + sender);
  ui.letterBoost.textContent = boost;
  ui.letterBtn.textContent = t('letterBtn');
  ui.letterModal.hidden = false;
  playSfx('wheelWin');
}
function claimLetter() {
  const L = mail.letter, now = Date.now(), ev = state.events;
  ui.letterModal.hidden = true;
  if (!L) return;
  mail.letter = null; ev.mailPending = 0;
  if (L.kind === 'income') { ev.incomeBoostUntil = now + L.min * 60000; ev.incomeBoostMult = L.mult; }
  else if (L.kind === 'tap') { ev.tapBoostUntil = now + L.min * 60000; ev.tapBoostMult = L.mult; }
  else if (L.kind === 'coins') { state.coins += L.gain; state.totalEarned += L.gain; }
  else if (L.kind === 'wheel') state.wheel.lastSpin = 0;
  else if (L.kind === 'sale') startSale(now);
  else { state.crystals += 1; state.crystalsTotal += 1; }
  recalcIncome();
  showToast(ui.letterBoost.textContent, 'good');
  playSfx('upgrade');
  updateUI(); saveGame();
}

/* ---------- Колесо фортуни ---------- */
function wheelCooldownMs() { return (WHEEL_HOURS_BY_LEVEL[wsLevel('wheelFast')] || CONFIG.WHEEL_COOLDOWN_HOURS) * 3600000; }
function wheelReady(now = Date.now()) { return now - state.wheel.lastSpin >= wheelCooldownMs(); }
// Серія днів: якщо крутили менше ніж 48 годин тому — серія продовжується
function projectedStreak(now = Date.now()) {
  return (state.wheel.lastSpin && now - state.wheel.lastSpin < Math.max(wheelCooldownMs() * 2, CONFIG.WHEEL_COOLDOWN_HOURS * 2 * 3600000)) ? state.wheel.streak + 1 : 1;
}
function streakMult(streak) { return 1 + CONFIG.WHEEL_STREAK_STEP * (Math.min(streak, CONFIG.WHEEL_STREAK_MAX_DAYS) - 1); }

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
function buildWheelTexture() {
  const S = 128, c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d');
  const cx = 64, cy = 64, step = Math.PI / 4;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.sqrt(dx * dx + dy * dy);
      if (r > 62) continue;
      let col;
      if (r >= 59) col = 'd';
      else if (r < 9) col = r >= 7 ? 'd' : 'h';
      else {
        let a = Math.atan2(dx, -dy); if (a < 0) a += Math.PI * 2;
        const sec = Math.floor(a / step), frac = a / step - sec;
        const edge = Math.min(frac, 1 - frac) * step * r;
        col = edge < 0.9 ? 'd' : (r >= 55.5 && r < 57 ? ((Math.floor(a / step * 3) % 2) ? 'w' : 'y') : WHEEL_SECTORS[sec].color);
      }
      R(g, x, y, 1, 1, col);
    }
  }
  WHEEL_SECTORS.forEach((s, i) => {
    const a = (i + 0.5) * step;
    drawWheelIcon(g, s.icon, Math.round(cx + Math.sin(a) * 36), Math.round(cy - Math.cos(a) * 36));
  });
  return c;
}
// Барабан фортуни: вертикальний барабан із 8 комірок-призів; обертається вгору, призова комірка зупиняється між двома червоними стрілками
let drumCells = null;
const DRUM_CELL_H = 38, DRUM_R = 50;          // висота клітинки й радіус барабана: проміжок між призами ~2–3 пікселі
// Клітинки барабана: sectors — призи, iconFn(g, sector, cx, cy) малює значок; H — висота клітинки
function buildDrumCellsFor(sectors, iconFn, H) {
  return sectors.map(sec => {
    const c = document.createElement('canvas'); c.width = 96; c.height = H; const g = c.getContext('2d');
    R(g, 0, 0, 96, H, 'd'); R(g, 2, 2, 92, H - 4, sec.color); R(g, 2, 2, 92, 3, 'w'); R(g, 2, H - 5, 92, 3, 'd'); g.globalAlpha = 0.25; R(g, 2, H - 5, 92, 3, 'd'); g.globalAlpha = 1;
    iconFn(g, sec, 26, H >> 1); iconFn(g, sec, 70, H >> 1);
    R(g, 47, 6, 2, H - 12, 'd'); R(g, 46, 4, 4, 2, 'w'); R(g, 46, H - 6, 4, 2, 'w');
    return c;
  });
}
function buildDrumCells() { return buildDrumCellsFor(WHEEL_SECTORS, (g, sec, x, y) => drawWheelIcon(g, sec.icon, x, y), DRUM_CELL_H); }
// Малює вертикальний барабан на полотні 128×140: n комірок, кут angle (як у колеса), усередині рамки з двома червоними стрілками
function paintDrum(g, cells, n, angle, H) {
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, 128, 140);
  R(g, 12, 18, 104, 116, 'd'); R(g, 14, 20, 100, 112, 'k');                                  // корпус барабана
  const step = Math.PI * 2 / n, order = [];
  for (let i = 0; i < n; i++) { const ang = (i + 0.5) * step + angle, c = Math.cos(ang); if (c > 0.05) order.push({ i, c, y: 76 - Math.sin(ang) * DRUM_R }); }
  g.save(); g.beginPath(); g.rect(14, 20, 100, 112); g.clip();                                // комірки не виходять за корпус
  order.sort((p, q) => p.c - q.c).forEach(o => {
    const h = Math.max(2, Math.round(H * o.c)), y = Math.round(o.y - h / 2);
    g.drawImage(cells[o.i], 0, 0, 96, H, 16, y, 96, h);
    if (o.c < 0.95) { g.globalAlpha = 0.55 * (1 - o.c); R(g, 16, y, 96, h, 'k'); g.globalAlpha = 1; }
  });
  g.restore();
  g.globalAlpha = 0.28; R(g, 16, 22, 96, 18, 'k'); R(g, 16, 112, 96, 18, 'k'); g.globalAlpha = 1;   // затемнення зверху й знизу — об'єм
  R(g, 8, 14, 112, 6, 'e'); R(g, 8, 14, 112, 2, 'E'); R(g, 8, 132, 112, 6, 'e'); R(g, 8, 136, 112, 2, 'd'); R(g, 8, 14, 112, 1, 'd'); R(g, 8, 19, 112, 1, 'd'); R(g, 8, 132, 112, 1, 'd');
  for (let x = 14; x < 118; x += 12) { R(g, x, 16, 2, 2, 'd'); R(g, x, 134, 2, 2, 'd'); }
  for (let i = 0; i < 9; i++) { R(g, 2 + i, 66 + i, 1, 20 - i * 2 > 0 ? 20 - i * 2 : 1, 'r'); R(g, 125 - i, 66 + i, 1, 20 - i * 2 > 0 ? 20 - i * 2 : 1, 'r'); }   // червоні стрілки-вказівники з боків
  R(g, 0, 66, 2, 20, 'd'); R(g, 126, 66, 2, 20, 'd');
}
function drawWheel() {
  if (!drumCells) drumCells = buildDrumCells();
  paintDrum(ui.wheelCanvas.getContext('2d'), drumCells, 8, wheelAngle, DRUM_CELL_H);
}
function updateWheelUI() {
  if (ui.wheelModal.hidden) return;
  const now = Date.now(), ready = wheelReady(now);
  const streak = (wheelAnim || !ready) ? Math.max(1, state.wheel.streak) : projectedStreak(now);
  setText(ui.wheelStreak, t('wheelStreak', streak, fmt(streakMult(streak), 2)), 'wStreak');
  if (wheelAnim) { setText(ui.wheelBtn, t('wheelSpin'), 'wBtn'); ui.wheelBtn.disabled = true; }
  else if (ready) { setText(ui.wheelBtn, t('wheelSpin'), 'wBtn'); ui.wheelBtn.disabled = false; }
  else { setText(ui.wheelBtn, t('wheelWait', fmtTime((state.wheel.lastSpin + wheelCooldownMs() - now) / 1000)), 'wBtn'); ui.wheelBtn.disabled = true; }
  // додатковий оберт за кристали привидів
  const showGhost = false;                       // кристали привидів прибрано
  ui.wheelGhostBtn.hidden = ui.wheelGhostNote.hidden = !showGhost;
  if (showGhost) {
    setText(ui.wheelGhostBtn, t('wheelGhostBtn', CONFIG.GHOST_RESPIN_COST), 'wGhostBtn');
    ui.wheelGhostBtn.disabled = !!wheelAnim || state.ghosts < CONFIG.GHOST_RESPIN_COST;
    setText(ui.wheelGhostNote, t('wheelGhostNote', state.ghosts, CONFIG.GHOST_RESPIN_COST), 'wGhostNote');
  }
}
function openWheel() {
  if (dialog.active) return;
  ui.wheelModal.hidden = false;
  if (!wheelAnim) ui.wheelResult.textContent = '';
  drawWheel();
  updateWheelUI();
}
function closeWheel() { ui.wheelModal.hidden = true; }
function spinWheel(extra) {
  const now = Date.now();
  if (wheelAnim) return;
  if (extra) { if (state.ghosts < CONFIG.GHOST_RESPIN_COST) return; state.ghosts -= CONFIG.GHOST_RESPIN_COST; }   // додатковий оберт за кристали привидів
  else if (!wheelReady(now)) return;
  // вибір сектора за вагами
  const weight = x => x.weight;
  const total = WHEEL_SECTORS.reduce((s, x) => s + weight(x), 0);
  let roll = Math.random() * total, idx = 0;
  for (; idx < WHEEL_SECTORS.length - 1; idx++) { roll -= weight(WHEEL_SECTORS[idx]); if (roll < 0) break; }
  const s = WHEEL_SECTORS[idx];
  if (!extra) { state.wheel.streak = projectedStreak(now); state.wheel.lastSpin = now; }   // додатковий оберт не чіпає чергу й серію днів
  state.stats.wheelSpins++;
  const mult = streakMult(Math.max(1, state.wheel.streak));
  let text;
  if (s.kind === 'coins' || s.kind === 'jackpot') {
    const gain = Math.floor((state.cps * s.seconds + s.flat * levelMult()) * mult);
    state.coins += gain; state.totalEarned += gain;
    text = t(s.kind === 'jackpot' ? 'prize_jackpot' : 'prize_coins', fmt(gain));
    if (s.kind === 'jackpot') state.stats.jackpots++;
  } else if (s.kind === 'crystal') {
    const gem = Math.max(1, Math.floor(mult));
    state.crystals += gem; state.crystalsTotal += gem;
    text = t('prize_crystal', gem);
  } else if (s.kind === 'income') {
    state.events.incomeBoostUntil = now + s.minutes * 60000; state.events.incomeBoostMult = s.mult;
    text = t('prize_income', s.mult, s.minutes);
  } else {
    state.events.tapBoostUntil = now + s.minutes * 60000; state.events.tapBoostMult = s.mult;
    text = t('prize_tap', s.mult, s.minutes);
  }
  recalcIncome();
  const step = Math.PI / 4;
  const jitter = rand(-0.35, 0.35) * step;
  const from = wheelAngle % (Math.PI * 2);
  const to = Math.PI * 2 * 5 + (Math.PI * 2 - (idx + 0.5) * step) + jitter;
  wheelAnim = { t: 0, dur: CONFIG.WHEEL_SPIN_SECONDS, from, to, text, jackpot: s.kind === 'jackpot' };
  ui.wheelResult.textContent = '…';
  updateWheelUI();
  updateUI();
  saveGame();
}
function updateWheel(dt) {
  if (!wheelAnim) return;
  wheelAnim.t += dt;
  const k = Math.min(1, wheelAnim.t / wheelAnim.dur), e = 1 - Math.pow(1 - k, 3);
  const prevSector = Math.floor(wheelAngle / (Math.PI / 4));
  wheelAngle = wheelAnim.from + (wheelAnim.to - wheelAnim.from) * e;
  if (Math.floor(wheelAngle / (Math.PI / 4)) !== prevSector && performance.now() - audio.lastTick > 40) { audio.lastTick = performance.now(); playSfx('wheelTick'); }
  if (!ui.wheelModal.hidden) drawWheel();
  if (k >= 1) {
    const done = wheelAnim;
    wheelAnim = null;
    wheelAngle = done.to % (Math.PI * 2);
    ui.wheelResult.textContent = done.text;
    playSfx(done.jackpot ? 'jackpot' : 'wheelWin');
    showToast(done.text, done.jackpot ? 'big' : 'good');
    updateWheelUI();
    updateUI();
  }
}

/* ---------- Головний цикл подій ---------- */
function updateEvents(dt) {
  updateWheel(dt);
  updateTrouble(dt);
  updateGhostHunt(dt);
  updateWeather(dt);
  updateMail(dt);
  updateCircus(dt);
  updateBirds(dt);
  updateEpochFeatures(dt);
  updateShootingStar(dt);
  updateDecorFx(dt);
  updateEpochFx(dt);
  eventTimer -= dt;
  if (eventTimer > 0) return;
  eventTimer = 0.25;
  const now = Date.now();
  let changed = false;
  if (updateTheme()) changed = true;
  updateMusic();
  // зміна активних бустів → перерахунок доходу
  const sig = [state.events.saleUntil > now, state.events.incomeBoostUntil > now, state.events.tapBoostUntil > now].join();
  if (sig !== uiCache.eventSig) { uiCache.eventSig = sig; changed = true; }
  if (changed) recalcIncome();
  if (!theme.blackFriday && now >= state.events.nextSale) startSale(now);
  const quiet = !trouble && !ghostHunt && !dialog.active && !epochIntro.active && !build && ui.modal.hidden && ui.wheelModal.hidden;
  if (quiet && state.story.done >= 2) {                // раз на кілька хвилин вилітають привиди (Хелловін) або герої поточної епохи
    if (!nextGhostAt) nextGhostAt = now + rand(25, 50) * 1000;
    else if (now >= nextGhostAt) startGhostHunt();
  }
  if (quiet && state.story.done >= 3 && now >= state.events.nextTrouble) startTrouble(now);
  // колесо стало готовим
  const ready = wheelReady(now);
  if (wheelWasReady === false && ready) showToast(t('wheelReady'), 'big');
  wheelWasReady = ready;
  ui.wheelOpen.classList.toggle('ready', ready);
  updateBoostsUI();
  updateBanner();
  updateWheelUI();
  achTimer += 0.25;
  if (achTimer >= 1) { achTimer = 0; checkAchievements(); }
}

// Початок гри: розклад подій, тема, колесо
function initEvents() {
  const now = Date.now();
  if (!state.events.nextSale) scheduleSale(now);
  else if (state.events.nextSale <= now) state.events.nextSale = now + rand(1, 5) * 60000;   // розпродаж «проґавили» — буде скоро
  if (!state.events.nextTrouble) scheduleTrouble(now);
  else if (state.events.nextTrouble <= now) state.events.nextTrouble = now + rand(1, 5) * 60000;
  updateTheme();
  wheelTexture = buildWheelTexture();
  ui.wheelOpen.addEventListener('click', openWheel);
  ui.wheelClose.addEventListener('click', closeWheel);
  ui.wheelBtn.addEventListener('click', () => spinWheel(false));
  ui.circusBtn.addEventListener('click', circusSpin);
  ui.lootWear.addEventListener('click', () => closeLoot(true));
  ui.lootClose.addEventListener('click', () => closeLoot(false));
  ui.circusClose.addEventListener('click', closeCircus);
  ui.circusWheel.addEventListener('click', hagClick);
  ui.circusModal.addEventListener('click', e => { if (e.target === ui.circusModal) closeCircus(); });
  ui.dbgCircus.addEventListener('click', () => { const c = state.circus; if (c.phase === 0 || c.phase === 4) { c.phase = 0; c.next = Date.now() - 1; } showToast('Цирк скоро!', 'good'); });
  ui.letterBtn.addEventListener('click', claimLetter);
  ui.wheelGhostBtn.addEventListener('click', () => spinWheel(true));
  ui.wheelModal.addEventListener('click', e => { if (e.target === ui.wheelModal) closeWheel(); });
  if (theme.holiday) {
    const h = theme.holiday;
    const bonus = h.bonus.global ? t('hb_global', Math.round(h.bonus.global * 100)) : Object.keys(h.bonus.depts || {}).map(i => t('hb_dept', deptName(i), fmt(1 + h.bonus.depts[i], 2))).join(', ');
    showToast(t('holidayToast', h.icon + ' ' + t('holiday_' + h.id), bonus), 'big');
  }
}

