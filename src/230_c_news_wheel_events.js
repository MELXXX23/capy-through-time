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
    ['🎁 Безкоштовні бонуси', '<ul class="np-list"><li>Бонус-ігри: лапшична діда Рьо в Японії й хатка відьми на Хелловін. Саме там виграють скіни.</li><li>Цирк фортуни дає кристали й бонуси, тож не проходь повз намет.</li><li>Нагороди за досягнення. Заглядай у вкладку з кубком, там чекають призи.</li><li>Івенти на вулиці. Червоний «!», сова чи єнот з’являються ненадовго. Встиг тапнути, і отримаєш бонус.</li></ul>', 'tipFree'],
    ['⏳ На майбутнє', 'Подорож у часі скидає магазин, але дає осколки часу, нову епоху й постійний бонус до доходу. Не бійся її: наступне коло пройде набагато швидше.', 'clock']
  ] },
  en: { head: 'Tips', sub: 'A few hints to play easier and grow faster.', items: [
    ['💰 How to get rich faster', '<ul class="np-list"><li>Hire Spike the hedgehog as early as you can. He costs only 100 coins, and every tap becomes 1.5 times stronger.</li><li>The MAX button in Departments buys as much as your money allows. No need to press Buy twenty times.</li><li>Watch the strip at the top of the screen. It always shows the next goal, for example “Buy “Candles and matches”: 7/25”.</li></ul>', 'tipRich'],
    ['🏪 How to grow', '<ul class="np-list"><li>To expand the shop you need three things: buy the required departments, upgrade the animals and collect coins. The conditions are in the Departments tab, in the Expansion block.</li><li>Every new shop level gives ×2 to all income, so expand at the first chance.</li></ul>', 'tipGrow'],
    ['🎁 Free bonuses', '<ul class="np-list"><li>Bonus games: Grandpa Ryo’s noodle cart in Japan and the witch’s hut at Halloween. That is where skins are won.</li><li>The fortune circus gives crystals and bonuses, so do not walk past the tent.</li><li>Achievement rewards. Look into the tab with the cup, prizes are waiting there.</li><li>Street events. The red “!”, an owl or a raccoon appear only for a moment. Tap in time and you get a bonus.</li></ul>', 'tipFree'],
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
    newH: 'Що нового', new: 'Бонусна епоха «Японія»! Після Неону час несе в країну вранішнього сонця: дерев’яні будинки з дашками, сакура, паперові ліхтарі, неонові вивіски, що світяться вночі, і дракон, який літає над містом і сам злітає до будівництва. У неї свій перехід, 8 нових глав, лисиця Сора з чайним будиночком, олениця Нара, лапшична діда Рьо замість цирку й Капі в кімоно. Попереду — нові бонусні епохи: дивись розділ «Скоро».',
    intro: ['Ми — MEL і NIKA, і цю гру зробили самі, піксель за пікселем.', 'Капі починає з однієї монетки й крихітної крамнички на розі. Твоє завдання: виростити її в справжній торговий центр і пройти крізь цілі епохи.'],
    nextH: 'Що попереду', next: 'Попереду 8 епох: від Відродження до Неону. Подорожуй у часі, і твій магазин стане чимось більшим…',
    giftH: 'Подарунок', gift: 'Забрати подарунок від розробників: +100 монет', giftDone: 'Подарунок уже забрано. Дякуємо, що граєш!',
    writeH: 'Зв’язок', write: 'Знайшов помилку чи маєш ідею? Тисни «Написати розробникам» унизу: ми читаємо все.'
  },
  en: {
    mast: 'ABOUT US', lead: 'Hi, friend!',
    newH: 'What is new', new: 'The bonus era “Japan”! After Neon, time carries you to the land of the rising sun: wooden houses with little roofs, sakura, paper lanterns, neon signs that glow at night, and a dragon that flies over town and swoops down to the building site. It has its own travel animation, 8 new chapters, Sora the fox with her tea house, Nara the doe, Grandpa Ryo’s noodle stall instead of the circus, and Capy in a kimono. More bonus eras are on the way: see “Coming soon”.',
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
  const pg0 = ui.newsBody.querySelector('.np-page'), paperCol = (pg0 && getComputedStyle(pg0).backgroundColor) || '#f6edd2';
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
      g.fillStyle = edge ? '#2a1d1a' : paperCol; g.fillRect(x, y, 1, 1);
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
  else if (L.kind === 'wheel') { if (state.circus.phase === 0) state.circus.next = Date.now() - 1; }   // лист «цирк уже в дорозі»
  else if (L.kind === 'sale') startSale(now);
  else { state.crystals += 1; state.crystalsTotal += 1; }
  recalcIncome();
  showToast(ui.letterBoost.textContent, 'good');
  playSfx('upgrade');
  updateUI(); saveGame();
}

/* ---------- Головний цикл подій ---------- */
function updateEvents(dt) {
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
  const quiet = !trouble && !ghostHunt && !dialog.active && !epochIntro.active && !build && ui.modal.hidden;
  if (quiet && state.story.done >= 2) {                // раз на кілька хвилин вилітають привиди (Хелловін) або герої поточної епохи
    if (!nextGhostAt) nextGhostAt = now + rand(25, 50) * 1000;
    else if (now >= nextGhostAt) startGhostHunt();
  }
  if (quiet && state.story.done >= 3 && now >= state.events.nextTrouble) startTrouble(now);
  updateBoostsUI();
  updateBanner();
  achTimer += 0.25;
  if (achTimer >= 1) { achTimer = 0; checkAchievements(); }
}

// Початок гри: розклад подій, тема
function initEvents() {
  const now = Date.now();
  if (!state.events.nextSale) scheduleSale(now);
  else if (state.events.nextSale <= now) state.events.nextSale = now + rand(1, 5) * 60000;   // розпродаж «проґавили» — буде скоро
  if (!state.events.nextTrouble) scheduleTrouble(now);
  else if (state.events.nextTrouble <= now) state.events.nextTrouble = now + rand(1, 5) * 60000;
  updateTheme();
  ui.circusBtn.addEventListener('click', circusSpin);
  ui.lootWear.addEventListener('click', () => closeLoot(true));
  ui.lootClose.addEventListener('click', () => closeLoot(false));
  ui.circusClose.addEventListener('click', closeCircus);
  ui.circusWheel.addEventListener('click', hagClick);
  ui.circusModal.addEventListener('click', e => { if (e.target === ui.circusModal) closeCircus(); });
  ui.dbgCircus.addEventListener('click', () => { const c = state.circus; if (c.phase === 0 || c.phase === 4) { c.phase = 0; c.next = Date.now() - 1; } showToast('Цирк скоро!', 'good'); });
  ui.letterBtn.addEventListener('click', claimLetter);
  if (theme.holiday) {
    const h = theme.holiday;
    const bonus = h.bonus.global ? t('hb_global', Math.round(h.bonus.global * 100)) : Object.keys(h.bonus.depts || {}).map(i => t('hb_dept', deptName(i), fmt(1 + h.bonus.depts[i], 2))).join(', ');
    showToast(t('holidayToast', h.icon + ' ' + t('holiday_' + h.id), bonus), 'big');
  }
}

