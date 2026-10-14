//#part 241_a_epoch_story.js
/* =====================================================================
   СЮЖЕТ ЕПОХ 2–8: у кожної епохи свій розділ із 8 глав (епоха 1 «Відродження» має класичні CHAPTERS).
   Рядок: [хто говорить, текст uk, текст en]. Особливі імена: 'S' — Шнирь у костюмі цієї епохи, 'G' — гість цієї епохи,
   'narr' — оповідач, capy / spike / clock / tonya / zoya / kria — як завжди.
   Прогрес: state.story.epDone[індекс епохи]; діалог kind 'ec'; тексти ec{епоха}_{глава}_{k} збираються в translations нижче.
   ===================================================================== */
translations.uk.shnyrPerk = 'Особливість Шниря: сам ловить золотих відвідувачів, і вони заходять на чверть частіше.';
translations.en.shnyrPerk = 'Shnyr perk: he catches golden customers himself, and they visit a quarter more often.';
translations.uk.shnyrCatch = 'Шнирь упіймав золотого відвідувача!';
translations.en.shnyrCatch = 'Shnyr caught a golden customer!';
const EC_TRIGGERS = [{}, { level: 2 }, { level: 2, eeSec: 240 }, { level: 3 }, { level: 4 }, { level: 5 }, { level: 6 }, { level: 6, near: true }];
const EC_DATA = {
  /* ---- 1. РЕТРО: закусочна й джубокс (гість Піп) ---- */
  1: [
    { t: ["Платівка, що заїла", "The Record That Got Stuck"], L: [
      ["narr", "Місто раптом стало схожим на листівку з минулого: смугасті навіси, хромовані столики й ледь чутне «шур-шур» голок.", "The town suddenly looks like a postcard from the past: striped awnings, chrome tables and the soft hiss of record needles."],
      ["G", "Привіт! Я Піп, господар закусочної. Мій джубокс грає одну й ту саму пісню вже третю добу.", "Hi! I'm Pip, I run the diner. My jukebox has played the same song for three days straight."],
      ["capy", "Може, його просто треба розговорити?", "Maybe it just needs someone to talk to?"],
      ["G", "Я пробував. Він лише підспівує. Нижчим голосом. З придихом.", "I tried. It just sings along. In a lower voice. Breathily."],
      ["narr", "З джубокса долинуло глухе чхання. Піп відступив на крок, а Капі присіла послухати уважніше.", "A muffled sneeze came from the jukebox. Pip stepped back, and Capy crouched down to listen closer."] ] },
    { t: ["Діджей із джубокса", "The DJ in the Jukebox"], L: [
      ["narr", "Кришка джубокса відкинулась, і звідти виліз єнот у картатому піджаку з гребінцем у кишені.", "The jukebox lid flipped open and a raccoon in a checkered jacket climbed out, a comb sticking from his pocket."],
      ["S", "Тихо! Я не злодій, я діджей. Просто платівка була така красива, що я її позичив. На навіки.", "Shh! I'm not a thief, I'm a DJ. The record was so pretty I borrowed it. Forever."],
      ["spike", "Позичив без розписки. Це розкрадання. Рахую збитки.", "Borrowed without a receipt. That's theft. Calculating damages."],
      ["capy", "Шнирю, давай домовимось: платівку повертаєш, а ми не рахуємо збитки.", "Shnyr, let's make a deal: the record goes back and we skip the damages."],
      ["S", "Домовились. Але діджеїв не звільняють, щоб ви знали.", "Deal. But DJs don't get fired, just so you know."] ] },
    { t: ["Коктейль №13", "Milkshake Number 13"], L: [
      ["G", "Видатна подія: втрачено рецепт мого фірмового коктейлю. Лишилось тринадцять інгредієнтів, а чотирнадцятий — таємниця.", "Disaster: I've lost my signature milkshake recipe. Thirteen ingredients remain, the fourteenth was a secret."],
      ["spike", "Я перерахував ціни: чотирнадцятий інгредієнт, імовірно, коштує нуль монет. Підозріло.", "I ran the numbers: the fourteenth ingredient probably costs zero coins. Suspicious."],
      ["capy", "Нуль монет... Може, це не продукт, а те, як його подають?", "Zero coins... maybe it isn't an ingredient but how it's served?"],
      ["G", "Усмішка! Саме так: я завжди ставив склянку з усмішкою. А втратив її разом із рецептом!", "A smile! That's it: I always handed the glass over with a smile. I lost it along with the recipe!"],
      ["narr", "Піп усміхнувся, і коктейль знову вийшов таким, як треба. Черга стояла аж до другого кварталу.", "Pip smiled, and the milkshake came out just right. The queue stretched to the next block."] ] },
    { t: ["Літак із помилкою", "The Plane With a Typo"], L: [
      ["narr", "Над вулицею пролетів біплан із довгим банером. Всі задерли голови й прочитали вголос.", "A biplane flew over the street trailing a long banner. Everyone looked up and read it aloud."],
      ["zoya", "«ЗНИЖКИ НА САЛАТ». Але ж ми не продаємо салат...", "“SALAD SALE.” But we don't sell salad..."],
      ["spike", "Це не друкарська помилка, це інвестиція в зелень. До вечора сюди прийде весь район.", "That's not a typo, that's an investment in greens. By evening the whole district will be here."],
      ["capy", "Тоді діставайте з комори все, що хоч трохи зелене!", "Then fetch everything even slightly green from the storeroom!"],
      ["S", "У мене є зелена шапка. Продається. Недорого.", "I've got a green hat. For sale. Cheap."] ] },
    { t: ["Біп-біп із неба", "Beep-Beep From the Sky"], L: [
      ["narr", "Увечері над дахами прокотилась маленька блискуча зірочка. Вона писнула: «біп-біп» — і сховалась за хмарою.", "That evening a tiny shiny star rolled across the rooftops. It went “beep-beep” and hid behind a cloud."],
      ["G", "Це що, новий дзвінок? Я не замовляв!", "Is that a new doorbell? I didn't order one!"],
      ["tonya", "Невідомий об'єкт у повітрі. Охороні сподобалось, що він блимає у ритм.", "Unknown object in the air. Security likes that it blinks in rhythm."],
      ["capy", "Схоже, хтось далеко звідси привітався з нами першим.", "Looks like someone far away just said hello to us first."],
      ["clock", "(цок... цок...) Я чув цей сигнал у майбутньому. Там він гучніший.", "(tick... tick...) I've heard that signal in the future. It's louder there."] ] },
    { t: ["Танцювальний марафон", "The Dance Marathon"], L: [
      ["G", "Сьогодні в нас марафон: хто довше танцює, той отримує безкоштовний коктейль. Нагороджую пожиттєво!", "Tonight's the marathon: whoever dances longest gets a free milkshake. For life!"],
      ["kria", "Я танцюю вже четверту годину! У мене лапи гудуть, але я не здамся.", "I've been dancing for four hours! My feet are buzzing but I won't quit."],
      ["S", "Я вдавав, що знепритомнів, а сам їв попкорн. Не кажіть нікому.", "I pretended to faint and ate popcorn. Don't tell anyone."],
      ["spike", "Підрахував: переможця визначено за кількістю обертів. Це Капі. З великим відривом.", "I've counted: the winner is decided by spins. It's Capy, by a wide margin."],
      ["capy", "Я просто обертаюсь, коли нервую. Дякую, всім.", "I just spin when I'm nervous. Thanks, everyone."] ] },
    { t: ["Грозова ніч", "The Stormy Night"], L: [
      ["narr", "Гроза вдарила так, що в усьому кварталі погасли вивіски. Закусочна занурилась у темряву.", "A storm hit so hard that every sign in the block went dark. The diner sank into the dark."],
      ["G", "Без світла мій джубокс німий, а я без нього сам не свій.", "Without power my jukebox is mute, and without it I'm lost."],
      ["capy", "Запалимо свічки. Зараз буде тепліше і навіть романтичніше.", "Let's light candles. It'll be warmer and even a bit romantic."],
      ["S", "Я розкладу свічки по столах. Лише з двох столів, бо решту мав на меті забрати.", "I'll put candles on the tables. Two of them, anyway, the rest I'd planned to pocket."],
      ["clock", "Зверніть увагу: в темряві мене чути краще. Цок. Цок. Цок.", "Notice: in the dark you can hear me better. Tick. Tock. Tick."] ] },
    { t: ["Годинник у джубоксі", "The Watch in the Jukebox"], L: [
      ["narr", "Коли світло повернулось, на екрані джубокса замість назви пісні було написано: «ЦОК».", "When the lights came back, the jukebox screen showed not a song title but: “TICK.”"],
      ["clock", "Це була чудова епоха, Капі. Мені сподобались шейки, коктейлі й ті біплани.", "That was a lovely era, Capy. I liked the shakes, the milkshakes and those biplanes."],
      ["capy", "Ми ще не закінчили. Піпу ще треба допомогти зі столиками.", "We're not done yet. Pip still needs help with the tables."],
      ["clock", "Допоможи. Я зачекаю. Хвилина більше, хвилина менше, я ж Годинник.", "Help him. I'll wait. A minute more or less, I'm the Watch."],
      ["narr", "Піп поставив нову платівку. Вона була про дорогу, яка веде далі, ніж вмієш уявити.", "Pip put on a new record. It was about a road that goes further than you can imagine."] ] }
  ],
  /* ---- 2. ДИСКО: дзеркальна куля й танцпол (гість Зіна) ---- */
  2: [
    { t: ["Куля, що впала", "The Ball That Fell"], L: [
      ["narr", "У місті зацвіли ліхтарики кольору цукерок. На розі хтось репетирував мелодію, яка не вимикається з голови.", "The town bloomed with candy-colored lights. On the corner someone rehearsed a tune that won't leave your head."],
      ["G", "Я Зіна! Мою дзеркальну кулю зірвало вітром, і вона розбилась. Сьогодні вечірка, а я без блиску!", "I'm Zina! The wind tore down my mirror ball and it shattered. Tonight's the party and I've got no sparkle!"],
      ["capy", "Ми зберемо кожен уламок. Без блиску вечірок не буває.", "We'll gather every shard. There's no party without sparkle."],
      ["spike", "Збір уламків оцінюю в чотири монети й одну подряпину.", "Shard collection: four coins and one scratch, I estimate."],
      ["G", "Тільки не забирайте нічого собі. Особливо єнота.", "Just don't keep any for yourselves. Especially the raccoon."] ] },
    { t: ["Смугасте непорозуміння", "A Stripy Misunderstanding"], L: [
      ["narr", "Зіна вийшла на вулицю, і всі завмерли: її смуги стали різнокольоровими, наче веселка вирішила стати зеброю.", "Zina stepped outside and everyone froze: her stripes had turned rainbow, as if a rainbow had decided to be a zebra."],
      ["G", "Я ж просила тільки трохи кольору! Хто розмалював мене?!", "I only asked for a little color! Who painted me?!"],
      ["S", "Я. Це безкоштовний бонус до пакета «Блиск». Дякую за довіру.", "That was me. A free bonus with the Sparkle package. Thanks for trusting me."],
      ["capy", "Шнирю. Ти змінив колір цілій зебрі?", "Shnyr. You changed a whole zebra's color?"],
      ["S", "Не всю. Лише ті ділянки, до яких дотягнувся.", "Not all of her. Only the parts I could reach."] ] },
    { t: ["Мозаїка з мільйона шматочків", "A Mosaic of a Million Pieces"], L: [
      ["G", "Нова куля складається з тисячі дзеркалець. Склеювати треба по одному. Наберіться терпіння.", "The new ball is made of a thousand tiny mirrors. They have to be glued on one by one. Be patient."],
      ["spike", "Порахував: потрібно вісімсот дзеркалець. Ще двісті я вписав «про запас».", "I counted: eight hundred mirrors needed. Another two hundred I wrote down as a spare."],
      ["kria", "А якщо я приклею догори дриґом? Блиск же однаково блищить!", "What if I glue one upside down? Sparkle still sparkles!"],
      ["capy", "Тоді куля гратиме у навпаки. І нам це навіть пасує.", "Then the ball will play in reverse. Honestly that suits us too."],
      ["narr", "До ранку куля стала схожою на велику зірку, що спустилась перепочити.", "By morning the ball looked like a big star that had come down for a rest."] ] },
    { t: ["Танцпол, який оживає", "The Dance Floor Comes Alive"], L: [
      ["narr", "Плитки на тротуарі світилися по черзі: рожева, блакитна, жовта. Хтось ступив — і весь тротуар загудів басом.", "The sidewalk tiles lit up in turn: pink, blue, yellow. Someone stepped, and the whole pavement hummed with bass."],
      ["G", "Це мій танцпол! Він живе власним життям і любить, коли на нього танцюють.", "That's my dance floor! It has a life of its own and loves being danced on."],
      ["tonya", "Попереджаю: порушники ритму будуть оштрафовані... музикою.", "Warning: offenders of rhythm will be fined... in music."],
      ["S", "А я винайшов техніку «тихенько по краю». Без штрафів і без пригод.", "I invented the 'quietly along the edge' technique. No fines, no adventures."],
      ["capy", "Усі на танцпол! Хто не вміє, той навчиться за три такти.", "Everyone to the floor! Who can't dance will learn in three beats."] ] },
    { t: ["Конкурс кльошів", "The Flares Contest"], L: [
      ["G", "Сьогодні конкурс: у кого ширші штанини! Журі: я, Тоня і ваш бухгалтер.", "Today's contest: whose trouser legs are widest! Judges: me, Tonya and your accountant."],
      ["spike", "Я не маю штанів. Це дискваліфікація чи привілей?", "I have no trousers. Is that a disqualification or a privilege?"],
      ["tonya", "Це спостереження. Я ж бачу, що штани в єнота на розмір більші, ніж треба.", "That's an observation. I can see the raccoon's trousers are a size bigger than needed."],
      ["S", "У них дві запасні кишені. Це не штани, це склад.", "They've got two spare pockets. They're not trousers, they're a warehouse."],
      ["capy", "Виграли всі. А найширші штани дісталися стійці з вішаками. Вона просто стояла там.", "Everyone won. The widest trousers went to the clothes rack. It was just standing there."] ] },
    { t: ["Тиха дискотека", "The Silent Disco"], L: [
      ["narr", "Увечері в усьому кварталі вимкнули світло. Музика зникла разом із ним.", "That evening the whole block lost power. The music vanished along with it."],
      ["G", "Без колонок я безпорадна... Ні, зачекайте. У нас же є ліхтарики, які можна гойдати.", "Without speakers I'm helpless... no, wait. We have flashlights that can be swung."],
      ["capy", "Танцюймо без музики. Кожен слухає свій ритм у серці.", "Let's dance without music. Everyone listens to their own beat inside."],
      ["kria", "У мене в серці зараз марш. Це припустимо?", "My heart is playing a march right now. Is that allowed?"],
      ["narr", "У темряві рухались сотні вогників і ніхто не наступив нікому на ногу. Диво дня.", "In the dark hundreds of little lights moved and nobody stepped on anyone's foot. The wonder of the day."] ] },
    { t: ["Остання пісня вечора", "The Last Song of the Night"], L: [
      ["G", "Остання пісня має бути особливою. Я хочу, щоб її вибрала Капі.", "The last song has to be special. I want Capy to pick it."],
      ["capy", "Я не знаю жодної... Окрім тієї, що наспівує годинник у моїй кишені.", "I don't know any... except the one the watch in my pocket hums."],
      ["clock", "(цок-цок, цок-цок-цок) Пам-пам, пам-па-рам.", "(tick-tock, tick-tock-tock) Bum-bum, bum-ba-dum."],
      ["G", "Це ж справжній диско-біт! Годинник, а в тебе талант.", "That's a proper disco beat! Watch, you've got talent."],
      ["narr", "Увесь квартал танцював під цокання аж до світанку. Хтось навіть записав його на плівку.", "The whole block danced to the ticking until dawn. Someone even recorded it on tape."] ] },
    { t: ["Світанок над танцполом", "Dawn Over the Dance Floor"], L: [
      ["narr", "На світанку дзеркальна куля зловила перший промінь і розсипала по стінах тисячу зайчиків.", "At dawn the mirror ball caught the first ray and scattered a thousand bright spots across the walls."],
      ["G", "Це була найкраща вечірка з усіх. Дякую, Капі. Тепер у мене є куля і є друзі.", "That was the best party ever. Thank you, Capy. Now I have a ball and friends."],
      ["clock", "Мої вітання. Диско добігає кінця, як будь-яка хороша мелодія.", "Congratulations. Disco is coming to an end, like any good tune."],
      ["capy", "А що далі?", "And what comes next?"],
      ["clock", "Далі — світ, що живе в маленьких пікселях. Збирайся, щойно зможеш.", "Next comes a world that lives in tiny pixels. Pack up as soon as you can."] ] }
  ],
  /* ---- 3. АРКАДИ: пікселі й рекорди (гість Макс) ---- */
  3: [
    { t: ["Вставте монетку", "Insert Coin"], L: [
      ["narr", "Світ став квадратним, голосним і трохи блимаючим. Над дверима горить напис: INSERT COIN.", "The world became square, loud and a little flashy. Above the door a sign glows: INSERT COIN."],
      ["G", "Я Макс! Тримаю найкращу аркаду у місті. Для старту вона просить монетку, а в мене лишилась тільки віра.", "I'm Max! I run the best arcade in town. It wants a coin to start, and all I have left is faith."],
      ["capy", "Ось монетка. Тільки дай перший хід мені.", "Here's a coin. Just let me take the first turn."],
      ["G", "Ого, вона спрацювала з першого разу! Це талант чи просто удача?", "Wow, it worked the first time! Is that talent or just luck?"],
      ["narr", "Екран спалахнув: «PLAYER 1: CAPY». Пішов відлік першого рівня.", "The screen flashed: “PLAYER 1: CAPY.” The first level began counting down."] ] },
    { t: ["Рекорд, якого не було", "A Record That Never Happened"], L: [
      ["narr", "На таблиці рекордів сяяло нове ім'я: «ЄНТ — 999999». Усі повільно повернули голови.", "On the high-score board a new name shone: “RAC — 999999.” Everyone slowly turned their heads."],
      ["G", "Я цю гру проходив сто разів і ніколи не бачив стільки очок. Звідки?", "I've beaten this game a hundred times and never saw that many points. Where from?"],
      ["S", "Я просто дуже старанний. І трохи вмію працювати з відвертками.", "I'm just really diligent. And a bit handy with screwdrivers."],
      ["spike", "Сума очок перевищує суму всіх монет міста. Це математично нечесно.", "That score exceeds all the coins in the city. Mathematically unfair."],
      ["capy", "Шнирю, відкрутив назад — і ми забудемо про цей рекорд. Домовились?", "Shnyr, screw it back and we'll forget about this record. Deal?"] ] },
    { t: ["Рівень із привидами", "The Level With Ghosts"], L: [
      ["narr", "На екрані з'явився лабіринт, а в залі — повітряні кульки з очима. Вони пливли повз столи й сміялись.", "A maze appeared on the screen and balloon-like blobs with eyes floated between the machines, giggling."],
      ["G", "Це ж привиди з першого рівня! Вони вилізли з гри, а я їх не просив.", "Those are the ghosts from level one! They climbed out of the game and I never asked them to."],
      ["tonya", "Ловити їх зручніше, коли вони синього кольору. Це я з досвіду.", "It's easier to catch them when they turn blue. I know from experience."],
      ["capy", "Усі до автоматів! Хто з'їсть більше крапок, той і звільняє зал!", "Everyone to the machines! Whoever eats the most dots frees the hall!"],
      ["S", "А я з'їм усе, що не прибито. Крапки — це смачно?", "I'll eat anything that isn't nailed down. Are dots tasty?"] ] },
    { t: ["Падаючі блоки", "Falling Blocks"], L: [
      ["narr", "Із неба поволі спускались різнокольорові фігурки, а пересмикнуті лінії з'їдали їх по рядочку.", "Colorful shapes slowly descended from the sky while lines swallowed them row by row."],
      ["G", "Це ж тетріс! Треба скласти їх у рівні ряди, інакше завалять усю вулицю.", "That's Tetris! We have to fit them into neat rows or they'll bury the whole street."],
      ["spike", "Прямокутні — на ліву сторону, косі — на праву. Я позначив мапою кольорів.", "Rectangles to the left, slanted ones to the right. I've mapped it out with colors."],
      ["capy", "Командо, повертайте блоки! Хто стоїть без діла — стає стержнем!", "Team, rotate the blocks! Whoever stands idle becomes a rod!"],
      ["narr", "Ряди зникали один за одним, і вулиця раптом стала світлішою, мов після прибирання.", "Rows vanished one by one and the street suddenly looked brighter, as if just cleaned."] ] },
    { t: ["Секретний код", "The Secret Code"], L: [
      ["G", "Я знаю секрет: вгору-вгору-вниз-вниз-вліво-вправо... і три рази В. Він дає безкінечні життя.", "I know a secret: up-up-down-down-left-right... and B three times. It gives infinite lives."],
      ["spike", "Це шахрайство. Чесним шляхом такі життя оцінюються у вісімдесят монет.", "That's cheating. By honest means such lives would cost eighty coins."],
      ["S", "А я знаю секрет кращий: «вгору, вправо, ще раз вправо — і ззаду у каси». Там завжди хтось забуває здачу.", "I know a better one: 'up, right, right again, behind the till.' Someone always forgets their change there."],
      ["capy", "Ніяких секретних кодів. Будемо проходити по-справжньому.", "No secret codes. We play it for real."],
      ["narr", "Макс зітхнув, але вперше за вечір усміхнувся. Чесна гра дає більше задоволення, ніж підказки.", "Max sighed but smiled for the first time that night. An honest game is more fun than any hint."] ] },
    { t: ["Бос рівня", "The Level Boss"], L: [
      ["narr", "У кінці довгого коридору стояв величезний пікселізований монстр із табличкою: «ПОДАТКОВА ІНСПЕКЦІЯ».", "At the end of a long corridor stood a huge pixelated monster with a sign: 'TAX OFFICE'."],
      ["spike", "Ага. Це мій старий знайомий. Дозвольте, я з ним поговорю мовою цифр.", "Aha. An old acquaintance. Let me talk to it in the language of numbers."],
      ["capy", "Ми з тобою, Колючко. Кожен кидає в нього по монетці й по ідеї.", "We're with you, Spike. Each of us throws a coin and an idea."],
      ["S", "Я відверну його увагу. Запитаю, чи чекає він на подарунок.", "I'll distract him. I'll ask if he's expecting a gift."],
      ["narr", "Бос завмер, моргнув і розсипався на двісті квадратиків із написом: «ЗНИЖКА 20%».", "The boss froze, blinked and broke into two hundred squares labeled: '20% OFF'."] ] },
    { t: ["Game over?", "Game Over?"], L: [
      ["narr", "Раптом усі екрани в залі мигнули й погасли. Лише один рядок ще світився: GAME OVER.", "Suddenly every screen in the hall flickered and went dark. Only one line still glowed: GAME OVER."],
      ["G", "Ні... Усе пропало? Це кінець моєї аркади?", "No... Is everything gone? Is this the end of my arcade?"],
      ["capy", "Ні, Максе. Дивись, нижче дрібним шрифтом: «CONTINUE? 10... 9... 8...»", "No, Max. Look below in small print: 'CONTINUE? 10... 9... 8...'"],
      ["G", "Тиснемо «Так»! Всі разом! Три, два, один!", "Press Yes! All together! Three, two, one!"],
      ["narr", "Екрани запалились знову, ще яскравіше, ніж раніше. Макс схопив Капі в обійми.", "The screens lit up again, brighter than before. Max grabbed Capy in a hug."] ] },
    { t: ["Продовжити?", "Continue?"], L: [
      ["narr", "Коли гості розійшлись, на головному автоматі лишилось єдине повідомлення. Воно блимало ритмічно, як цокання.", "When the guests left, one message remained on the main machine. It blinked rhythmically, like ticking."],
      ["clock", "«CONTINUE?» — це я питаю, Капі. У нас попереду ще багато рівнів.", "'CONTINUE?' That's me asking, Capy. We have plenty of levels ahead."],
      ["capy", "А ти точно не бос рівня?", "Are you sure you're not a level boss?"],
      ["clock", "Я більше схожий на фінальний екран. Тільки з бонусами.", "I'm more like the final screen. Only with bonuses."],
      ["narr", "Максів автомат тихенько заграв музику нового рівня, а десь у кишені Капі відгукнувся годинник.", "Max's machine softly played the next level's music, and somewhere in Capy's pocket the watch answered."] ] }
  ],
