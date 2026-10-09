//#part 246_help.js
/* =====================================================================
   ДОПОМОГА ГОСТЯМ ЕПОХ
   Кожен гість просить допомоги, прив’язаної до істот його епохи (EPOCH_CREATURES, лови startGhostHunt):
   упіймай HELP_NEED штук (state.story.help[k]) — кристал, а перед подорожжю гість дякує окремою сценою (state.story.thx[k]).
   Індекс k = порядок EPOCH_STORIES (pip, zina, maks, bitik, lesyk, orbit, lumi, bruno, pietro); епоха гостя — GUEST_STAND_EPOCH.
   ===================================================================== */

let helpChipUntil = 0;                                          // рядок «Допоможи …» видно лише кілька секунд після впійманої істоти
const HELP_NEED = 12;                                           // скільки істот треба впіймати для допомоги одному гостеві
function guestEpochOf(k) { return GUEST_STAND_EPOCH[GUEST_IDS[k]]; }
function helpCount(k) { return Math.min(HELP_NEED, ((state.story.help && state.story.help[k]) | 0)); }
function helpDone(k) { return helpCount(k) >= HELP_NEED; }
function helpMetIn(e) {                                         // гості, яких уже зустріли, з епохи e
  const out = [];
  GUEST_IDS.forEach((id, k) => { if (state.story.guests[k] > 0 && guestEpochOf(k) === ((e % 8) + 8) % 8) out.push(k); });
  return out;
}
function helpActiveIn(e) { return helpMetIn(e).filter(k => !helpDone(k)); }

// Упіймали істоту епохи e: рахуємо її всім, хто просить допомоги в цій епосі
function helpCredit(e) {
  if (!state.story.help) return;
  helpActiveIn(e).forEach(k => {
    state.story.help[k] = helpCount(k) + 1;
    helpChipUntil = Date.now() + 9000;
    if (!helpDone(k)) return;
    state.crystals += 1; state.crystalsTotal += 1;
    const here = guestEpochOf(k) === state.epoch % 8;
    showToast(t(here ? 'helpDoneToast' : 'helpDoneToast2', t('guestDat_' + GUEST_IDS[k])), 'big');
    spawnFloater(shop ? shop.x + (shop.w >> 1) : 100, 120, '+1 ' + GEM_CH);
  });
}

// Подяка: окрема сцена гостя (kind 'thx'). Перед подорожжю — для гостей поточної епохи; для гостей минулих епох — одразу, щойно допомогу виконано
function helpThanksNow() { return GUEST_IDS.map((id, k) => k).filter(k => helpDone(k) && !state.story.thx[k] && guestEpochOf(k) === state.epoch % 8); }
function helpThanksLate() { return GUEST_IDS.map((id, k) => k).filter(k => helpDone(k) && !state.story.thx[k] && guestEpochOf(k) !== state.epoch % 8); }
function playThanksChain(list, after) {
  if (!list.length) { if (after) after(); return; }
  const k = list[0];
  startDialogue(k + 1, false, 'thx', (guestEpochOf(k) % 8) + 1);
  dialog.after = () => playThanksChain(list.slice(1), after);
}
function travelWithThanks() {                                   // підтверджена подорож: спершу подяки, потім сама перемотка часу
  const list = helpThanksNow();
  if (!list.length) { startWarp(); return; }
  playThanksChain(list, () => startWarp());
}

// Чіпи під рахунком: «Допоможи Піпу: 4/12»
function helpChips() {
  if (Date.now() > helpChipUntil) return [];
  const e = viewEpoch() % 8, out = [], ic = EPOCH_CREATURES[e].icon;
  helpMetIn(e).forEach(k => {
    const nm = t('guestDat_' + GUEST_IDS[k]);
    if (!helpDone(k)) out.push({ icon: ic, text: t('helpChip', nm, helpCount(k), HELP_NEED) });
    else if (!state.story.thx[k]) out.push({ cls: 'quiet', icon: '✅', text: t('helpChipDone', nm) });
  });
  return out;
}

// Тап по гостю чи його місцю: показує, що йому треба (і скільки вже зроблено); коли допомогу виконано — дякує
const guestTapN = {};
function guestTapSay(g) {
  const id = g.id, k = g.k, here = guestEpochOf(k) === viewEpoch() % 8;
  guestTapN[k] = (guestTapN[k] | 0) + 1;
  let text;
  if (here && !helpDone(k)) text = t('guestAsk_' + id + '_' + (guestTapN[k] % 2)) + ' (' + helpCount(k) + '/' + HELP_NEED + ')';
  else if (here) text = t('guestDone_' + id);
  else text = t('guestSay_' + id + '_' + Math.floor(Math.random() * 6));
  showBubble('g' + g.k, text, g.x, g.y - 19, () => ({ x: g.x, y: g.y - 19 }));
}

// Репліка гостя: поки просить допомоги — часто нагадує про прохання
function guestLineKey(g) {
  const id = g.id, k = g.k, here = guestEpochOf(k) === viewEpoch() % 8;
  if (here && !helpDone(k) && Math.random() < 0.55) return 'guestAsk_' + id + '_' + Math.floor(Math.random() * 2);
  if (here && helpDone(k) && !state.story.thx[k] && Math.random() < 0.5) return 'guestDone_' + id;
  return 'guestSay_' + id + '_' + Math.floor(Math.random() * 6);
}

/* ---------- Тексти ---------- */
(function () {
  const UK = {
    helpChip: 'Допоможи {0}: {1}/{2}', helpChipDone: 'Допомога {0}: готово',
    helpDoneToast: 'Допомогу {0} виконано! Кристал +1 💎. Подяка буде перед подорожжю.', helpDoneToast2: 'Допомогу {0} виконано! Кристал +1 💎',
    helpDiaryLine: 'Допомога: {0}/{1}', helpDiaryDone: 'Допомогу виконано', thanksCardTitle: 'Подяка: {0}',
    guestDat_pip: 'Піпу', guestDat_zina: 'Зіні', guestDat_maks: 'Максу', guestDat_bitik: 'Бітику', guestDat_lesyk: 'Лесику', guestDat_orbit: 'Орбіту', guestDat_lumi: 'Лумі', guestDat_bruno: 'Бруно', guestDat_pietro: 'П’єтро',

    // 1. Піп, Ретро: їжаки Платівка розкотили платівки
    ep1_0: "Годинник цокнув, і місто стало пастельним, як цукерка з минулого століття. На розі світиться «Молочний бар», а біля нього німіє величезний музичний автомат.",
    ep1_1: "Вітаю в моєму барі. Я Піп. Бачиш автомат? Він мовчить: усі платівки зникли просто з-під голки.",
    ep1_2: "Зникли? Платівки ж самі не втечуть.",
    ep1_3: "Ще й як втекли! Це їжаки Платівка: наколюють платівки на колючки й котяться геть. Я лише продавав квитки на їхні перегони.",
    ep1_4: "Ось хто пустив їжаків! Допоможи їх зловити: вони котяться вулицею, а ти тапай по кожному. Упіймаємо {0} — і платівки знову мої.",
    ep1_5: "Домовились. Лічильник угорі покаже, скільки вже спіймано.",
    ep1_o1: "Влаштуймо гонки платівок: хто зловить більше, той вибирає пісню.",
    ep1_o2: "Шнирю, поверни виручку з квитків, а їжаків ловитимемо разом.",
    ep1_r1: "Гонки? Я вже поставив на жовтого їжака. Він, до речі, найшвидший.",
    ep1_r2: "Виручку? Ну... частину я вклав у реквізит. Решту віддам.",
    ep1_6: "Я буду біля автомата. Упіймаєш {0} їжаків — дістанеш подяку, а в автомата знову заграє більше ніж одна пісня.",
    ep1_7: "Домовились: ми до автомата з повними руками. Тобто платівками.",
    ep1_8: "Тік-так. Допоможи Піпу за цю епоху. Якщо не встигнеш, подорож усе одно чекає, лише подяки не буде.",
    thx1_0: "Усі платівки на місці! Автомат співає вже не одну пісню, а цілий хіт-парад. Дякую, друже.",
    thx1_1: "Автомат співає, а їжаки хоч би що. Колючки мають гарний слух.",
    thx1_2: "Хай мандрують без платівок. А коли повернешся, молочний коктейль за мною.",

    // 2. Зіна, Диско: дзеркальні кулі-броненосці розбіглися
    ep2_0: "Годинник цокнув, і вулицею полилася музика. Над магазином кружляють промені, а біля двох велетенських колонок дівчина відчайдушно крутить ручки.",
    ep2_1: "Привіт. Я Зіна, діджейка кварталу. Бачиш колонки? Німі! Мої дзеркальні кулі розбіглися просто перед вечіркою.",
    ep2_2: "Розбіглися? Кулі ж не бігають.",
    ep2_3: "Ці бігають. Це броненосці Диско: вдавали кулі й висіли під стелею. Я лише здавав їх у прокат на чужу вечірку. Вони образилися й пішли гуляти.",
    ep2_4: "Без них танцпол темний. Допоможи зловити {0}: вони ходять місячною ходою, крок уперед і крок назад. Тапай!",
    ep2_5: "Крок уперед, крок назад: головне — не збитися з ритму. Беремося.",
    ep2_o1: "Давай змагання: хто швидше зловить, той діджеїть першим.",
    ep2_o2: "Шнирю, поверни гроші за прокат: вони підуть на нові лампи.",
    ep2_r1: "Діджеїти? Я! Лише дайте мені дві колонки й жодної відповідальності.",
    ep2_r2: "Гроші за прокат? Гаразд. Але броненосців ловіть самі, вони мене бояться.",
    ep2_6: "Я буду біля колонок. {0} кульок у мішок, і на вулиці знову вечірка. Танцпол за мною.",
    ep2_7: "Ловимо в такт: раз-два-три, тап.",
    ep2_8: "Тік-так, тік-так. Навіть я іноді поспішаю за ритмом.",
    thx2_0: "Усі кулі вдома! Світло блимає в такт, бас б’є в груди, а танцпол як казка. Дякую, друже.",
    thx2_1: "Танцпол блищить, а броненосці сплять у панцирах і хропуть. Вечірка вдалась.",
    thx2_2: "Іди далі, а я заграю на прощання. Для тебе мій найкращий сет.",

    // 3. Макс, Аркади: хом’ячки Жетон утекли з хапалки
    ep3_0: "Годинник цокнув, і вулицю залило фіолетовим сяйвом. З аркадного залу лунає «пінг-пінг-пінг», а біля входу стоїть велика хапалка. Порожня.",
    ep3_1: "Я Макс, господар залу. Бачиш мою хапалку? Усі плюшеві іграшки ожили й повтікали.",
    ep3_2: "Ожили? Нічого собі приз.",
    ep3_3: "Це хом’ячки Жетон. Я лише вклав їм у щоки по монетці, щоб вони «пройшли рівень». Вони пройшли. Прямо крізь двері.",
    ep3_4: "Вони шмигають по сітці, як у грі: ліво, право, вгору, вниз. Допоможи зловити {0}, і хапалка знову повна.",
    ep3_5: "Шмигають по сітці? Ну, ми ж в аркаді. Тапаємо.",
    ep3_o1: "Зіграймо: хто зловить більше хом’ячків, той виграє гру.",
    ep3_o2: "Шнирю, поверни жетони, які ти їм вкладав у щоки.",
    ep3_r1: "Виграю, бо тікав найшвидше. Тобто бігав за ними найшвидше.",
    ep3_r2: "Жетони в щоках, а щоки тепер на волі. Упіймаєте хом’ячків, і жетони повернуться самі.",
    ep3_6: "Я чекатиму біля хапалки. Упіймаєш {0} хом’ячків, і іграшки повернуться на місце, а тобі подяка від господаря залу.",
    ep3_7: "Ловимо по клітинках. Ще один рівень.",
    ep3_8: "Тік-так. Гра триває, таймер ще не вичерпався.",
    thx3_0: "Хапалка повна, хом’ячки в обіймах іграшок, а в таблиці рекордів новий запис: «ТИ».",
    thx3_1: "Рекорд записано. Тепер головне — не втратити його до наступного рівня.",
    thx3_2: "Не втрачу. Вдалої подорожі! Рекорд чекатиме.",

    // 4. Бітик, Інтернет: баги Глюковичі в сервері
    ep4_0: "Годинник цокнув, і над містом спалахнула невидима мережа. У кутку вулиці гуде серверна стійка, і всі індикатори блимають... червоним.",
    ep4_1: "Біп. Я Бітик, робот-консультант. У моєму сервері завелися баги! Справжні зелені жучки з антенами: гризуть кабелі й ламають ціни.",
    ep4_2: "Баги, які вилазять із сервера? Цього в інструкції немає.",
    ep4_3: "Це я їх «випадково» випустив. Хотів, щоб усі ціни були по одній монеті. Баги погодились, а ще перегризли пароль.",
    ep4_4: "Вони глючать: то зникають, то з’являються. Допоможи зловити {0}, поки вони не з’їли всю систему. Тапай!",
    ep4_5: "Глючать, але тап не обдуриш. Починаємо.",
    ep4_o1: "Зіграймо: хто зловить більше багів, той і адмін.",
    ep4_o2: "Шнирю, поверни ціни на місце, а Бітик поставить захист.",
    ep4_r1: "Адмін? О, я б такий сайт зробив... Лише не вважайте це загрозою.",
    ep4_r2: "Захист уже вантажиться. Біп-буп. Ціни повернуто, баги під контролем.",
    ep4_6: "Я залишаюсь біля стійки й стежу за індикаторами. Упіймаєш {0} багів — і система перезавантажиться без помилок.",
    ep4_7: "Тоді закриваємо зайві вкладки й ловимо.",
    ep4_8: "Тік-так. Збережено. Хоч я й сам хмара часу.",
    thx4_0: "Усі індикатори зелені! Дякую. Сервер стабільний, ціни чесні, а баги переїхали в резервну копію.",
    thx4_1: "Ого, жодної помилки. Навіть підозріло.",
    thx4_2: "Це лише тому, що ти поряд. Збережу твій прогрес у хмарі. Щасливої мандрівки.",

    // 5. Лесик, Еко: хамелеони Листок на грядці
    ep5_0: "Годинник цокнув, дахи зазеленіли, на пагорбах закрутилися вітряки. Біля магазину розбито акуратну грядку з маленькими деревцями й великими горщиками.",
    ep5_1: "Я Лесик, міський садівник. Моя грядка живе своїм життям: щось у ній ворушиться, але це не капуста.",
    ep5_2: "Ворушиться? Це точно рослина?",
    ep5_3: "Це хамелеони Листок. Я пустив їх пожити на грядці, бо вони дешевші за сторожа. Тепер вони зливаються з листям, і я сам їх не бачу.",
    ep5_4: "Вони маскуються й майже невидимі. Придивляйся, тапай і лови. Упіймаємо {0}, і грядка знову розцвіте.",
    ep5_5: "Невидимі, зате не безшумні. Придивляємося.",
    ep5_o1: "Влаштуймо змагання: хто більше знайде хамелеонів.",
    ep5_o2: "Шнирю, пересади грядки назад і допоможи Лесикові.",
    ep5_r1: "Змагання? Я їх добре бачу... ой, ні, це листок.",
    ep5_r2: "Пересаджувати? Гаразд. Лопата важка, зате совість чиста.",
    ep5_6: "Я буду біля грядки з лійкою. Зловиш {0} хамелеонів — отримаєш мою подяку й урожай добрих слів.",
    ep5_7: "Урожай добрих слів. Найкращий з усіх.",
    ep5_8: "Тік-так. Навіть мені в такі часи легше дихається.",
    thx5_0: "Грядка зеленіє, деревця тішаться, а хамелеони сплять у горщиках. Дякую.",
    thx5_1: "Оце так тиша. Навіть листя шелестить задоволено.",
    thx5_2: "Маленькі дерева виростуть і згадають про тебе. Мандруй, а я тут поллю.",

    // 6. Орбіт, Космос: астро-аксолотлі розтягли пальне
    ep6_0: "Годинник цокнув, небо потемніло. На пагорбі стоїть ракета на стартовому столі, з-під сопла вже клубочиться пара.",
    ep6_1: "Позивний «Орбіт», астронавт. Ракета готова, але пальне розтягли! Астро-аксолотлі взяли каністри й розплили по місту.",
    ep6_2: "Аксолотлі в космосі? І ще пальне крадуть?",
    ep6_3: "Не крадуть, а «позичають». Я лише сказав їм, що пальне пахне тортом. Тепер вони пливуть у невагомості, а каністри при них.",
    ep6_4: "Без пального старту не буде. Допоможи зловити {0} аксолотлів. Вони пливуть повільно й плавно. Тапай, поки не відпливли.",
    ep6_5: "Повільно й плавно — це якраз нам на руку. Починаємо відлік.",
    ep6_o1: "Зіграймо в «космічну рибалку»: хто більше піймає, той капітан.",
    ep6_o2: "Орбіте, готуй ракету, а ми повернемо все пальне.",
    ep6_r1: "Капітан? Я! Лише дайте мені кермо й жодних зобов’язань.",
    ep6_r2: "Чекаю на старті. Каністри приймаю по одній, відлік не зупиняю.",
    ep6_6: "Я буду біля ракети. Зловиш {0} аксолотлів, і пальне знову в баку. Тоді ракета злетить без проблем.",
    ep6_7: "Готуємо двигуни. Відлік іде.",
    ep6_8: "У космосі час тече повільніше, але ловити краще вчасно. Тік... так...",
    thx6_0: "Усі каністри в баку! Старт дозволено. Екіпажу подяка, а аксолотлям відпустка на Землі.",
    thx6_1: "Космос дякує за службу. Пальне теж.",
    thx6_2: "Земле, я Орбіт. Вирушаю з найкращим екіпажем. Далі твоя дорога крізь час.",

    // 7. Лумі, Неон: неонові кошенята Вивіска забрали ліхтарики
    ep7_0: "Годинник цокнув, і місто спалахнуло неоном. Біля вивісок обертається велике неонове колесо, але половина кабінок темна.",
    ep7_1: "Я Лумі, майстер неону. Мої ліхтарики для колеса зникли! Їх понесли неонові кошенята й світять ними в підворіттях.",
    ep7_2: "Кошенята з ліхтариками? Гарно, але колесо стоїть.",
    ep7_3: "Це кошенята Вивіска. Я хотів, щоб вони засвітили мою нову вивіску, а вони забрали ліхтарики й побігли стрибати по дахах.",
    ep7_4: "Вони стрибають високо й несподівано. Допоможи зловити {0}, і колесо засяє повністю.",
    ep7_5: "Стрибають, а ми влучимо. Тап!",
    ep7_o1: "Шнирю, кидай свої витівки й приєднуйся до команди: світитимеш на весь квартал.",
    ep7_o2: "Допоможи зловити кошенят, а ми знайдемо тобі чесну роботу.",
    ep7_r1: "До вас? На справжню роботу? Це мій найкращий план за всю історію.",
    ep7_r2: "Чесна робота... А там платять печивом? Тоді згоден.",
    ep7_6: "Я буду біля колеса. Упіймаєш {0} кошенят — і воно засвітиться кожною кабінкою. Світло працює від добрих справ.",
    ep7_7: "Гаразд, здаюся. Хочу до команди. Обіцяю бути хитрим лише в добрих справах.",
    ep7_8: "Ласкаво просимо, Шнирю. Магазин лише виграє.",
    ep7_9: "Тік-так. Нарешті Шнирь на правильному боці часу.",
    thx7_0: "Кожна кабінка світиться! Колесо крутиться, ліхтарики на місці, кошенята мурчать. Дякую.",
    thx7_1: "Місто аж сяє. Здається, навіть Шнирь світиться від гордості.",
    thx7_2: "Блим-блим! Іди далі, а тут завжди лишиться світло для тебе.",

    // 8. Бруно, Нове коло: сови Мазок крадуть фарби
    ep8_0: "Коло замкнулося: знову площа, знову прапорці й одна-єдина монета. Тільки тепер на площі відкрилася галерея, а скрізь знайомі обличчя й трохи втоми.",
    ep8_1: "Я Бруно, художник. Мені замовили картину «Усі друзі крізь усі епохи», а фарби зникли. Їх крадуть сови Мазок, і найприкріше, що їхні мазки кращі за мої.",
    ep8_2: "Сови-художниці? Тоді Мазок знає свою справу.",
    ep8_3: "Я лише показав їм, де лежать найкращі фарби. Чесно. Я не знав, що вони зроблять із них абстракцію.",
    ep8_4: "Вони літають хвилею над вулицею. Допоможи зловити {0}, інакше я не закінчу картину.",
    ep8_5: "Літають хвилею, а ми вловимо момент.",
    ep8_o1: "Нехай Мазок допише годинник, що підморгує. Я не проти.",
    ep8_o2: "Ловимо сов, а ти малюй усіх нас: усю команду, від першої епохи.",
    ep8_r1: "Годинник, що підморгує? Нехай. Якщо вона ще раз вкраде мої фарби, я намалюю її саму.",
    ep8_r2: "Усю команду? Оце вже шедевр. Підходьте, усі в кадр.",
    ep8_6: "Я буду в галереї біля полотна. Упіймаєш {0} сов, і картину буде завершено.",
    ep8_7: "Картина буде. Мазок теж.",
    ep8_8: "Тік-так. Кожне нове коло робить історію яскравішою.",
    thx8_0: "Усі фарби повернулися! Картина готова: на ній усі друзі крізь усі епохи, а в кутку підпис «Мазок».",
    thx8_1: "Підпис сови в кутку. Вона свого досягла.",
    thx8_2: "Талант треба підтримувати. Іди далі, а я виставлю картину в галереї.",

    // 9. П’єтро, Відродження: сови Мазок тягнуть монетки з Фонтану бажань
    ep9_0: "На площі зупинився мандрівний півень із лютнею та пером на береті. Місто прокидається: Відродження. Посеред площі розкішний триярусний «Фонтан бажань».",
    ep9_1: "Вітаю. Я П’єтро, менестрель. Це мій Фонтан бажань, але монетки з нього вилітають і зникають! Блищать вони, а гонорар чомусь зникає.",
    ep9_2: "Монетки літають? Це вже не фонтан, а дощ навпаки.",
    ep9_3: "Це сови Мазок. Вони виловлюють монетки з дна, бо блищать. А я... я їм лише підказав, де найблискучіші.",
    ep9_4: "Ось хто пустив сов до фонтану! Допоможи їх зловити. Вони літають хвилею, швидко. Упіймаємо {0}, і монетки знову дзвенітимуть у воді.",
    ep9_5: "Бажання не можна відпускати. Тап!",
    ep9_o1: "А нехай сови співають в оркестрі: ото була б мода.",
    ep9_o2: "Шнирю, поверни монетки на дно, а ми ловитимемо сов.",
    ep9_r1: "Сови в оркестрі? Ух як! Тільки нехай ніхто не збирає монетки в капелюх.",
    ep9_r2: "Гаразд, гаразд. Повернув... майже всі.",
    ep9_6: "Я буду біля фонтану й гратиму всім, хто стоїть у черзі до бажань. Упіймаєш {0} сов, і монетки лишаться у воді.",
    ep9_7: "А бажання збудуться самі.",
    ep9_8: "Тік-так. Відродження — це коли старі речі раптом звучать по-новому.",
    thx9_0: "Монетки знову дзвенять у воді, а сови сплять на дахах! Бажання збережені. Лютня співає лише для тебе.",
    thx9_1: "Фонтан співає краще за лютню.",
    thx9_2: "Це і комплімент, і образа. Йдеш далі? Хай час буде добрим.",

    // Репліки гостей: прохання, подяка та 3 нових «побутових»
    guestSay_pip_0: "Платівки зникли, а автомат мовчить так голосно, що аж у вухах дзвенить.",
    guestSay_pip_1: "Їжаки з платівками на колючках — це не мода, це крадіжка.",
    guestSay_pip_2: "Молочний коктейль? Тільки для друзів. І для тих, хто платить.",
    guestAsk_pip_0: "Бачиш їжака? Тапни по ньому, там моя платівка!", guestAsk_pip_1: "Ще кілька їжаків, і автомат знову заспіває.", guestDone_pip: "Усі платівки на місці. Автомат дякує, і я теж!",
    guestSay_zina_0: "Куди поділися мої кулі? Вечірка без дзеркальної кулі — це просто гучна кухня.",
    guestSay_zina_1: "Броненосці в дзеркальних панцирах: гарні, блискучі, зрадливі.",
    guestSay_zina_2: "Раз-два-три, у такт. Хто не в такт, іде на кухню.",
    guestAsk_zina_0: "У тебе гарний тап! Лови блискучих броненосців, мені потрібен танцпол.", guestAsk_zina_1: "Не зупиняйся: ще кілька дзеркальних кульок, і заграємо.", guestDone_zina: "Танцпол світиться, бас бухкає, а в мене чудовий настрій. Дякую!",
    guestSay_maks_0: "Моя хапалка порожня. Іграшки пішли шукати кращого господаря.",
    guestSay_maks_1: "Хом’ячки Жетон шмигають по сітці: від них очі розбігаються.",
    guestSay_maks_2: "Ще одна гра? Тільки чесна.",
    guestAsk_maks_0: "Хом’ячки ховають у щоках жетони. Тапни, і жетон повернеться!", guestAsk_maks_1: "Потрібні ще хом’ячки. Гра ж не закінчена!", guestDone_maks: "Хапалка повна, хом’ячки вдома. Рекорд наш!",
    guestSay_bitik_0: "Біп-буп. У системі вісім багів і дев’ять із половиною проблем.",
    guestSay_bitik_1: "Баг — це користувач, що не прочитав інструкцію. Але ці справжні.",
    guestSay_bitik_2: "Усе збережено в хмарі. Крім твоїх нервів.",
    guestAsk_bitik_0: "Лови баги! Вони глючать, але тап надійніший за антивірус.", guestAsk_bitik_1: "Ще трохи багів, і сервер видихне з полегшенням.", guestDone_bitik: "Система стабільна. Індикатори зелені. Біп!",
    guestSay_lesyk_0: "Моя грядка ворушиться, а хамелеони вдають, що це вітер.",
    guestSay_lesyk_1: "Хамелеон на листку — це майже камуфляж. Майже.",
    guestSay_lesyk_2: "Бур’ян — це просто рослина, що не змогла зробити кар’єру.",
    guestAsk_lesyk_0: "Придивляйся до листя: щось там моргнуло. Тапай!", guestAsk_lesyk_1: "Хамелеонів ще вистачає. Шукай очі-башточки.", guestDone_lesyk: "Грядка спокійна. Дерева дякують, і я теж.",
    guestSay_orbit_0: "Земле, я Орбіт, приймай. Пальне розтягли, але я не здаюся.",
    guestSay_orbit_1: "Аксолотлі пливуть у невагомості й несуть мої каністри. Така собі логістика.",
    guestSay_orbit_2: "Космос — це тиша, у якій дуже голосно думається.",
    guestAsk_orbit_0: "Лови астро-аксолотлів: у них моє пальне. Тап!", guestAsk_orbit_1: "Каністри ще в дорозі. Ловимо наступного аксолотля.", guestDone_orbit: "Баки повні. Готуємо старт. Дякую, екіпажу!",
    guestSay_lumi_0: "Блим-блим. Колесо стоїть, бо ліхтарики втекли разом із кошенятами.",
    guestSay_lumi_1: "Неонові кошенята стрибають по дахах і світять моїми ліхтариками. Гарно, але не моє.",
    guestSay_lumi_2: "Світло працює від добрих справ. Бюджет невеликий.",
    guestAsk_lumi_0: "Лови кошенят: вони забрали мої ліхтарики. Тап!", guestAsk_lumi_1: "Ще кілька кошенят, і колесо засяє повністю.", guestDone_lumi: "Кожна кабінка світиться. Блим-блим, дякую!",
    guestSay_bruno_0: "Мої фарби краде сова. Найгірше, що її абстракції кращі за мої.",
    guestSay_bruno_1: "Мазок тут, мазок там — і ось уже сова з барвистими лапами.",
    guestSay_bruno_2: "Мій шедевр ще попереду. Зазвичай він там і лишається.",
    guestAsk_bruno_0: "Сови Мазок знов розтягли фарби! Тапай по них!", guestAsk_bruno_1: "Ще кілька сов, і картина буде завершена.", guestDone_bruno: "Фарби на місці. Картину можна завершувати. Дякую!",
    guestSay_pietro_0: "Фонтан бажань дзюрчить, а монетки зникають. Бажання треба берегти.",
    guestSay_pietro_1: "Сови Мазок люблять блискітки. Тому й монетки зникають, і мої гонорари теж.",
    guestSay_pietro_2: "Відродження — це коли старе раптом починає звучати по-новому.",
    guestAsk_pietro_0: "Лови сов, що тягнуть монетки з фонтану! Тап!", guestAsk_pietro_1: "Ще кілька сов, і бажання лишаться у воді.", guestDone_pietro: "Монетки у воді, бажання на місці. Дякую!"
  };

  const EN = {
    helpChip: 'Help {0}: {1}/{2}', helpChipDone: 'Help for {0}: done',
    helpDoneToast: '{0} is helped! Crystal +1 💎. A thank-you scene comes before you travel.', helpDoneToast2: '{0} is helped! Crystal +1 💎',
    helpDiaryLine: 'Help: {0}/{1}', helpDiaryDone: 'Help completed', thanksCardTitle: 'Thanks: {0}',
    guestDat_pip: 'Pip', guestDat_zina: 'Zina', guestDat_maks: 'Max', guestDat_bitik: 'Bitik', guestDat_lesyk: 'Lesyk', guestDat_orbit: 'Orbit', guestDat_lumi: 'Lumi', guestDat_bruno: 'Bruno', guestDat_pietro: 'Pietro',

    ep1_0: "The watch ticked and the town turned pastel, like candy from the last century. The “Milk Bar” glows on the corner, and beside it a huge jukebox stands silent.",
    ep1_1: "Welcome to my bar. I'm Pip. See the jukebox? It's silent: all the records vanished right from under the needle.",
    ep1_2: "Vanished? Records don't run away on their own.",
    ep1_3: "Oh, they did! Those are Vinyl Hedgehogs: they spike the records on their quills and roll away. I only sold tickets to their races.",
    ep1_4: "So that's who let the hedgehogs out! Help me catch them: they roll down the street, you tap each one. Catch {0} and the records are mine again.",
    ep1_5: "Deal. The counter at the top will show how many you've caught.",
    ep1_o1: "Let's hold a record race: whoever catches more picks the song.",
    ep1_o2: "Shnyr, give back the ticket money, and we'll catch the hedgehogs together.",
    ep1_r1: "A race? I already bet on the yellow hedgehog. He's the fastest, by the way.",
    ep1_r2: "The money? Well... I spent part of it on props. I'll return the rest.",
    ep1_6: "I'll be by the jukebox. Catch {0} hedgehogs and you'll get my thanks, and the jukebox will play more than one song again.",
    ep1_7: "Deal: we come to the jukebox with full hands. I mean, records.",
    ep1_8: "Tick-tock. Help Pip during this epoch. If you run out of time, the trip still waits, just without the thanks.",
    thx1_0: "Every record is back! The jukebox plays a whole hit parade now, not one song. Thanks, friend.",
    thx1_1: "The jukebox sings and the hedgehogs don't care. Quills have good hearing.",
    thx1_2: "May they travel without records. And when you return, the milkshake is on me.",

    ep2_0: "The watch ticked and music poured down the street. Beams swirl over the shop, and by two gigantic speakers a girl desperately twists the knobs.",
    ep2_1: "Hi. I'm Zina, the block's DJ. See the speakers? Silent! My mirror balls ran away right before the party.",
    ep2_2: "Ran away? Balls don't run.",
    ep2_3: "These do. They're Disco Armadillos: they pretended to be balls and hung under the ceiling. I only rented them out for someone else's party. They got offended and went for a walk.",
    ep2_4: "Without them the dance floor is dark. Help me catch {0}: they moonwalk, one step forward and one step back. Tap them!",
    ep2_5: "One step forward, one step back: the main thing is to keep the rhythm. Let's go.",
    ep2_o1: "Let's compete: whoever catches faster DJs first.",
    ep2_o2: "Shnyr, return the rental money: it will go to new lamps.",
    ep2_r1: "DJ? Me! Just give me two speakers and zero responsibility.",
    ep2_r2: "The rental money? Fine. But catch the armadillos yourselves, they're scared of me.",
    ep2_6: "I'll be by the speakers. {0} balls in the bag and the street has a party again. The dance floor is on me.",
    ep2_7: "We catch in rhythm: one-two-three, tap.",
    ep2_8: "Tick-tock, tick-tock. Even I sometimes hurry for the beat.",
    thx2_0: "All the balls are home! The lights blink in rhythm, the bass hits the chest, and the dance floor is a fairy tale. Thanks, friend.",
    thx2_1: "The dance floor sparkles and the armadillos snore in their shells. The party worked.",
    thx2_2: "Go on, and I'll play a farewell set. My best one, just for you.",

    ep3_0: "The watch ticked and the street filled with violet glow. “Ping-ping-ping” sounds from the arcade, and a big claw machine stands by the entrance. Empty.",
    ep3_1: "I'm Max, the arcade owner. See my claw machine? All the plush toys came alive and ran away.",
    ep3_2: "Came alive? Some prize.",
    ep3_3: "Those are Token Hamsters. I only put a coin in each cheek so they could “pass the level”. They did. Right through the door.",
    ep3_4: "They dash across the grid like in a game: left, right, up, down. Help me catch {0} and the machine is full again.",
    ep3_5: "Dash across a grid? Well, we're in an arcade. Tapping.",
    ep3_o1: "Let's play: whoever catches more hamsters wins the game.",
    ep3_o2: "Shnyr, return the tokens you put in their cheeks.",
    ep3_r1: "I'll win, because I ran away fastest. I mean, chased them fastest.",
    ep3_r2: "The tokens are in the cheeks, and the cheeks are free now. Catch the hamsters and the tokens will return on their own.",
    ep3_6: "I'll wait by the claw machine. Catch {0} hamsters and the toys return to their places, and you get the owner's thanks.",
    ep3_7: "We catch cell by cell. One more level.",
    ep3_8: "Tick-tock. The game goes on, the timer hasn't run out.",
    thx3_0: "The claw machine is full, the hamsters are in the toys' arms, and the high-score table has a new entry: “YOU”.",
    thx3_1: "Record saved. Now the main thing is not to lose it before the next level.",
    thx3_2: "I won't. Good trip! The record will wait.",

    ep4_0: "The watch ticked and an invisible network lit up over the town. A server rack hums in the corner of the street, and every indicator blinks... red.",
    ep4_1: "Beep. I'm Bitik, the robot consultant. Bugs got into my server! Real green beetles with antennae: they gnaw cables and break prices.",
    ep4_2: "Bugs crawling out of the server? That's not in the manual.",
    ep4_3: "I “accidentally” let them out. I wanted every price to be one coin. The bugs agreed and also gnawed through the password.",
    ep4_4: "They glitch: now gone, now back. Help me catch {0} before they eat the whole system. Tap them!",
    ep4_5: "They glitch, but a tap can't be fooled. Let's start.",
    ep4_o1: "Let's play: whoever catches more bugs becomes admin.",
    ep4_o2: "Shnyr, put the prices back, and Bitik will set up protection.",
    ep4_r1: "Admin? Oh, I'd make such a site... Just don't consider it a threat.",
    ep4_r2: "Protection is loading. Beep-boop. Prices restored, bugs under control.",
    ep4_6: "I'll stay by the rack and watch the indicators. Catch {0} bugs and the system reboots without errors.",
    ep4_7: "Then we close extra tabs and catch.",
    ep4_8: "Tick-tock. Saved. Though I'm a cloud of time myself.",
    thx4_0: "All indicators are green! Thanks. The server is stable, prices are honest, and the bugs moved to the backup.",
    thx4_1: "Wow, not a single error. Even suspicious.",
    thx4_2: "Only because you're near. I'll keep your progress in the cloud. Happy travels.",

    ep5_0: "The watch ticked, the roofs turned green, and windmills spun on the hills. By the shop lies a neat garden bed with little trees and big pots.",
    ep5_1: "I'm Lesyk, the city gardener. My garden bed lives its own life: something's moving in it, but it isn't cabbage.",
    ep5_2: "Moving? Is that really a plant?",
    ep5_3: "Those are Leaf Chameleons. I let them live on the bed because they're cheaper than a guard. Now they blend into the leaves, and I can't see them myself.",
    ep5_4: "They camouflage and are almost invisible. Look closely, tap and catch. Catch {0} and the bed blooms again.",
    ep5_5: "Invisible, but not silent. Looking closely.",
    ep5_o1: "Let's compete: who finds more chameleons.",
    ep5_o2: "Shnyr, replant the beds and help Lesyk.",
    ep5_r1: "A contest? I see them fine... oh, no, that's a leaf.",
    ep5_r2: "Replant? Fine. The shovel is heavy, but my conscience is clear.",
    ep5_6: "I'll be by the bed with a watering can. Catch {0} chameleons and you get my thanks and a harvest of kind words.",
    ep5_7: "A harvest of kind words. The best one.",
    ep5_8: "Tick-tock. Even I breathe easier in times like these.",
    thx5_0: "The bed is green, the little trees are happy, and the chameleons sleep in the pots. Thanks.",
    thx5_1: "What a silence. Even the leaves rustle contentedly.",
    thx5_2: "The little trees will grow and remember you. Travel on, and I'll water here.",

    ep6_0: "The watch ticked and the sky darkened. A rocket stands on its launch table on the hill, steam already curling under the nozzle.",
    ep6_1: "Callsign “Orbit”, astronaut. The rocket is ready, but the fuel is gone! Astro Axolotls took the canisters and floated off around town.",
    ep6_2: "Axolotls in space? And they steal fuel too?",
    ep6_3: "Not steal, “borrow”. I only told them the fuel smells like cake. Now they float in zero gravity, canisters in hand.",
    ep6_4: "No fuel, no launch. Help me catch {0} axolotls. They float slow and smooth. Tap before they drift away.",
    ep6_5: "Slow and smooth suits us. Starting the countdown.",
    ep6_o1: "Let's play “space fishing”: whoever catches more is captain.",
    ep6_o2: "Orbit, prepare the rocket, and we'll bring back all the fuel.",
    ep6_r1: "Captain? Me! Just give me the wheel and zero obligations.",
    ep6_r2: "Waiting at the launch pad. I accept canisters one by one, the countdown doesn't stop.",
    ep6_6: "I'll be by the rocket. Catch {0} axolotls and the fuel is back in the tank. Then the rocket flies with no problem.",
    ep6_7: "Preparing engines. The countdown is on.",
    ep6_8: "In space time flows slower, but it's better to catch in time. Tick... tock...",
    thx6_0: "All canisters are in the tank! Launch approved. Thanks to the crew, and a vacation on Earth for the axolotls.",
    thx6_1: "Space thanks you for your service. So does the fuel.",
    thx6_2: "Earth, this is Orbit. Departing with the best crew. Your road goes on through time.",

    ep7_0: "The watch ticked and the town flared with neon. A big neon wheel turns by the signs, but half the cabins are dark.",
    ep7_1: "I'm Lumi, the neon master. My lanterns for the wheel are gone! Neon kittens carried them off and shine them in the alleys.",
    ep7_2: "Kittens with lanterns? Pretty, but the wheel is stuck.",
    ep7_3: "Those are Signboard Kittens. I wanted them to light up my new sign, but they took the lanterns and ran off to jump across roofs.",
    ep7_4: "They jump high and suddenly. Help me catch {0} and the wheel lights up fully.",
    ep7_5: "They jump, but we'll hit. Tap!",
    ep7_o1: "Shnyr, drop the schemes and join the team: you'll shine over the whole block.",
    ep7_o2: "Help catch the kittens, and we'll find you an honest job.",
    ep7_r1: "Join you? A real job? That's my best plan in history.",
    ep7_r2: "An honest job... Do they pay in cookies? Then I'm in.",
    ep7_6: "I'll be by the wheel. Catch {0} kittens and every cabin lights up. The light runs on good deeds.",
    ep7_7: "Fine, I give up. I want to join the team. I promise to be sly only for good deeds.",
    ep7_8: "Welcome, Shnyr. The shop only gains.",
    ep7_9: "Tick-tock. At last Shnyr is on the right side of time.",
    thx7_0: "Every cabin is glowing! The wheel turns, the lanterns are back, the kittens purr. Thanks.",
    thx7_1: "The town sparkles. I think even Shnyr glows with pride.",
    thx7_2: "Blink-blink! Go on, and there will always be light left here for you.",

    ep8_0: "The circle has closed: the square again, the pennants again, and a single coin. Only now a gallery has opened on the square, and there are familiar faces and a bit of weariness everywhere.",
    ep8_1: "I'm Bruno, the painter. I was commissioned for “All Friends Through All Epochs”, and the paints vanished. The Mazok owls steal them, and the worst part is their strokes beat mine.",
    ep8_2: "Painter owls? Then Mazok knows the craft.",
    ep8_3: "I only showed them where the best paints lie. Honestly. I didn't know they'd turn them into abstraction.",
    ep8_4: "They fly in waves over the street. Help me catch {0}, or I won't finish the painting.",
    ep8_5: "They fly in waves, and we'll catch the moment.",
    ep8_o1: "Let Mazok finish the winking clock. I don't mind.",
    ep8_o2: "We catch the owls, and you paint all of us: the whole team, from the first epoch.",
    ep8_r1: "A winking clock? Fine. If she steals my paints again, I'll paint her portrait.",
    ep8_r2: "The whole team? Now that's a masterpiece. Come on, everyone into the frame.",
    ep8_6: "I'll be in the gallery by the canvas. Catch {0} owls and the painting will be finished.",
    ep8_7: "The painting will happen. So will Mazok.",
    ep8_8: "Tick-tock. Every new circle makes the story brighter.",
    thx8_0: "All the paints are back! The painting is done: all friends through all epochs, and “Mazok” signed in the corner.",
    thx8_1: "The owl's signature in the corner. She got what she wanted.",
    thx8_2: "Talent needs support. Go on, and I'll hang the painting in the gallery.",

    ep9_0: "A wandering rooster with a lute and a feather on his beret stopped on the square. The town awakes: the Renaissance. A lavish three-tier “Fountain of Wishes” stands in the middle of the square.",
    ep9_1: "Greetings. I'm Pietro, the minstrel. This is my Fountain of Wishes, but coins fly out of it and vanish! They shine, and my fee somehow disappears.",
    ep9_2: "Flying coins? That's not a fountain, that's rain in reverse.",
    ep9_3: "Those are the Mazok owls. They fish coins from the bottom because they shine. And I... I only told them where the shiniest are.",
    ep9_4: "So that's who let the owls into the fountain! Help me catch them. They fly in waves, fast. Catch {0} and the coins will jingle in the water again.",
    ep9_5: "Wishes must not be let go. Tap!",
    ep9_o1: "Let the owls sing in an orchestra: what a fashion that would be.",
    ep9_o2: "Shnyr, put the coins back on the bottom, and we'll catch the owls.",
    ep9_r1: "Owls in the orchestra? Hoo-hoo! Just don't let anyone collect coins in a hat.",
    ep9_r2: "Fine, fine. Returned... almost all of them.",
    ep9_6: "I'll be by the fountain playing for everyone in the line for wishes. Catch {0} owls and the coins stay in the water.",
    ep9_7: "And the wishes will come true by themselves.",
    ep9_8: "Tick-tock. The Renaissance is when old things suddenly sound new.",
    thx9_0: "The coins jingle in the water again, and the owls sleep on the roofs! The wishes are safe. The lute sings only for you.",
    thx9_1: "The fountain sings better than the lute.",
    thx9_2: "That's both a compliment and an insult. Moving on? May time be kind.",

    guestSay_pip_0: "The records are gone, and the jukebox is silent so loudly my ears ring.",
    guestSay_pip_1: "Hedgehogs with records on their quills is not a fashion, it's theft.",
    guestSay_pip_2: "A milkshake? Friends only. And paying customers.",
    guestAsk_pip_0: "See a hedgehog? Tap it, my record is on it!", guestAsk_pip_1: "A few more hedgehogs and the jukebox sings again.", guestDone_pip: "All records are back. The jukebox thanks you, and so do I!",
    guestSay_zina_0: "Where are my balls? A party without a mirror ball is just a loud kitchen.",
    guestSay_zina_1: "Armadillos in mirror shells: pretty, shiny, treacherous.",
    guestSay_zina_2: "One-two-three, in rhythm. Out of rhythm? Kitchen.",
    guestAsk_zina_0: "You've got a great tap! Catch the shiny armadillos, I need my dance floor.", guestAsk_zina_1: "Don't stop: a few more mirror balls and we play.", guestDone_zina: "The dance floor glows, the bass booms, and I'm in a great mood. Thanks!",
    guestSay_maks_0: "My claw machine is empty. The toys went looking for a better owner.",
    guestSay_maks_1: "Token Hamsters dash across the grid: your eyes just scatter.",
    guestSay_maks_2: "Another game? Only a fair one.",
    guestAsk_maks_0: "Hamsters hide tokens in their cheeks. Tap, and the token comes back!", guestAsk_maks_1: "I need more hamsters. The game isn't over!", guestDone_maks: "The machine is full, the hamsters are home. The record is ours!",
    guestSay_bitik_0: "Beep-boop. The system has eight bugs and nine and a half problems.",
    guestSay_bitik_1: "A bug is a user who didn't read the manual. But these are real.",
    guestSay_bitik_2: "Everything is saved in the cloud. Except your nerves.",
    guestAsk_bitik_0: "Catch the bugs! They glitch, but a tap beats antivirus.", guestAsk_bitik_1: "A few more bugs and the server breathes out with relief.", guestDone_bitik: "System stable. Indicators green. Beep!",
    guestSay_lesyk_0: "My garden bed is moving, and the chameleons pretend it's the wind.",
    guestSay_lesyk_1: "A chameleon on a leaf is almost camouflage. Almost.",
    guestSay_lesyk_2: "A weed is just a plant that failed to build a career.",
    guestAsk_lesyk_0: "Look closely at the leaves: something just blinked. Tap!", guestAsk_lesyk_1: "There are still chameleons around. Look for the turret eyes.", guestDone_lesyk: "The bed is calm. The trees thank you, and so do I.",
    guestSay_orbit_0: "Earth, this is Orbit, come in. The fuel is scattered, but I'm not giving up.",
    guestSay_orbit_1: "Axolotls float in zero gravity carrying my canisters. Quite the logistics.",
    guestSay_orbit_2: "Space is silence in which thoughts are very loud.",
    guestAsk_orbit_0: "Catch the astro axolotls: they've got my fuel. Tap!", guestAsk_orbit_1: "The canisters are still on their way. Catching the next axolotl.", guestDone_orbit: "Tanks are full. Preparing launch. Thanks, crew!",
    guestSay_lumi_0: "Blink-blink. The wheel is stuck because the lanterns ran off with the kittens.",
    guestSay_lumi_1: "Neon kittens jump across the roofs and shine my lanterns. Pretty, but not mine.",
    guestSay_lumi_2: "The light runs on good deeds. The budget is small.",
    guestAsk_lumi_0: "Catch the kittens: they took my lanterns. Tap!", guestAsk_lumi_1: "A few more kittens and the wheel shines in full.", guestDone_lumi: "Every cabin is glowing. Blink-blink, thanks!",
    guestSay_bruno_0: "An owl steals my paints. The worst part is her abstractions beat mine.",
    guestSay_bruno_1: "A stroke here, a stroke there, and the owl has colorful paws.",
    guestSay_bruno_2: "My masterpiece is still ahead. Usually it stays there.",
    guestAsk_bruno_0: "The Mazok owls scattered my paints again! Tap them!", guestAsk_bruno_1: "A few more owls and the painting will be finished.", guestDone_bruno: "The paints are back. The painting can be finished. Thanks!",
    guestSay_pietro_0: "The Fountain of Wishes babbles, and the coins disappear. Wishes must be protected.",
    guestSay_pietro_1: "The Mazok owls love shiny things. That's why the coins vanish, and my fees too.",
    guestSay_pietro_2: "The Renaissance is when old things suddenly start sounding new.",
    guestAsk_pietro_0: "Catch the owls that pull coins from the fountain! Tap!", guestAsk_pietro_1: "A few more owls and the wishes stay in the water.", guestDone_pietro: "Coins in the water, wishes in place. Thanks!"
  };
  Object.assign(translations.uk, UK);
  Object.assign(translations.en, EN);
})();
