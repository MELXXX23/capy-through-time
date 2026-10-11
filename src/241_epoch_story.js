//#part 241_epoch_story.js
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
  /* ---- 4. ІНТЕРНЕТ: мережа й дрони (гість Бітик) ---- */
  4: [
    { t: ["Пароль від Wi-Fi", "The Wi-Fi Password"], L: [
      ["narr", "У місті з'явилась мережа. Над дахами миготіли значки сигналу, а дроти лежали вздовж вулиць, мов гірлянди.", "The town got a network. Signal icons blinked above the roofs and cables lay along the streets like garlands."],
      ["G", "Привіт, я Бітик! Я налаштовую зв'язок. Пароль від мережі — «копійка123». Тільки нікому.", "Hi, I'm Bitik! I set up connections. The network password is 'penny123'. Don't tell anyone."],
      ["spike", "Ви щойно сказали вголос пароль. Тепер він не пароль, а оголошення.", "You just said the password out loud. It's now an announcement, not a password."],
      ["capy", "Нічого, ми його змінимо. На «копійка124».", "No problem, we'll change it. To 'penny124'."],
      ["narr", "Це був перший інтернет у їхньому житті, і він одразу вирішив розповісти їм усе про котів.", "It was their first internet ever and it immediately decided to tell them everything about cats."] ] },
    { t: ["Магазин у мережі", "The Shop Online"], L: [
      ["G", "Давайте відкриємо сайт. Кожен зможе купити капібарин товар, не виходячи з дому.", "Let's open a website. Anyone could buy Capy's goods without leaving home."],
      ["capy", "А як вони підуть по печиво, якщо печиво буде на екрані?", "How will they get cookies if the cookies live on a screen?"],
      ["G", "Приїде дрон. Він доставляє в межах півтори хвилини і завжди каже «дякую».", "A drone will come. It delivers within ninety seconds and always says thanks."],
      ["S", "Я вже замовив собі ліхтарик. Він приїхав... до сусіда. Ліхтарик нині його.", "I already ordered myself a flashlight. It arrived... at the neighbor's. The flashlight is his now."],
      ["narr", "До вечора на сайті було сто відвідувачів, п'ятдесят «обране» й один відгук: «Смачно».", "By evening the site had a hundred visitors, fifty favorites and one review: 'Tasty.'"] ] },
    { t: ["Кіт, що став зіркою", "The Cat Who Became a Star"], L: [
      ["narr", "Хтось виклав фото сплячого кота в капібариному кошику. За годину його побачило півміста.", "Someone posted a photo of a cat asleep in Capy's basket. Within an hour half the town had seen it."],
      ["G", "Лайків уже п'ять тисяч! Це називається вірусним. Тепер кіт відомий.", "Five thousand likes already! That's called viral. The cat is famous now."],
      ["tonya", "У нього з'явилась охорона із шести хом'яків. Я не при чому.", "He now has a security detail of six hamsters. Nothing to do with me."],
      ["spike", "Кіт заробляє більше, ніж наша каса. Прошу переглянути умови договору.", "The cat earns more than our till. Please revise the contract terms."],
      ["capy", "Нехай спить. Він приносить більше людей, ніж будь-яка реклама.", "Let him sleep. He brings more people than any ad."] ] },
    { t: ["Лавина листів", "An Avalanche of Mail"], L: [
      ["narr", "Скринька не мовчала: сотня листів, тисяча сповіщень і лист від принца, якому терміново потрібна допомога.", "The inbox never stopped: a hundred letters, a thousand notifications and a message from a prince in urgent need of help."],
      ["G", "Це спам! Не відкривайте, поки я не поставлю фільтр.", "That's spam! Don't open anything until I set up a filter."],
      ["S", "Принц просив лише п'ять монет. Я вже відправив десять. Щоб точно дійшло.", "The prince only wanted five coins. I already sent ten. To be sure it arrives."],
      ["spike", "Шнирю. Ти щойно подарував принцеві десять монет.", "Shnyr. You just gifted the prince ten coins."],
      ["capy", "Так, фільтр потрібен нам усім. Навіть тобі, Шнирю.", "Right, we all need a filter. Even you, Shnyr."] ] },
    { t: ["Чотири з половиною зірки", "Four and a Half Stars"], L: [
      ["G", "Перші відгуки прийшли! Читайте вголос: «Смачно. Дуже. Шкода, що вдома».", "The first reviews are in! Read aloud: 'Tasty. Very. Pity it's at home.'"],
      ["kria", "А тут: «Дуже ввічливий дрон, але розбив одне яйце». Це я просто так.", "And here: 'A very polite drone but it broke one egg.' Just saying."],
      ["spike", "Середня оцінка: 4,6. Це нижче, ніж 4,7. Але вище, ніж 4,5. Тішуся.", "Average rating: 4.6. Lower than 4.7 but higher than 4.5. I rejoice."],
      ["capy", "Подякуємо всім. І додамо до відділу дроніків маленьку подушку для яєць.", "We'll thank everyone. And give the drone department a tiny pillow for eggs."],
      ["narr", "Наступного ранку над містом пролетів дрон із милою наклейкою «обережно, яйця».", "Next morning a drone flew over town wearing a cute sticker: 'careful, eggs'."] ] },
    { t: ["Хмара, що не з води", "A Cloud That Isn't Water"], L: [
      ["G", "Усі наші дані зберігаються у хмарі. Дивіться, он вона, на горизонті!", "All our data is kept in the cloud. Look, there it is, on the horizon!"],
      ["capy", "Це ж звичайна хмара. З неї ще й дощ іде.", "That's just an ordinary cloud. It's even raining."],
      ["G", "Так, але там усередині — сервер. Одна крапля дощу — це одне замовлення.", "Yes, but inside there's a server. One raindrop is one order."],
      ["S", "Якщо я зловлю хмару, то можу прочитати чужі замовлення? Питаю суто з інтересу.", "If I catch the cloud, can I read other people's orders? Asking purely out of interest."],
      ["tonya", "Не можеш. І більше не питай.", "You can't. And don't ask again."] ] },
    { t: ["Оновлення 4.0", "Update 4.0"], L: [
      ["narr", "На екрані з'явився рядок: «Оновлення. Не вимикайте магазин». Усі завмерли, як перед уколом.", "A line appeared on the screen: 'Updating. Do not switch off the store.' Everyone froze as if before a shot."],
      ["G", "Це займе максимум хвилину. 20%... 40%... 99%...", "It'll take a minute at most. 20%... 40%... 99%..."],
      ["spike", "Звідки оця 99% тягнеться вже десять хвилин?", "Why has this 99% been dragging on for ten minutes?"],
      ["capy", "Просто вибач йому. Він думає, що так у нього більше шансів вразити нас.", "Just forgive it. It thinks that gives it a better chance to impress us."],
      ["narr", "Оновлення завершилось. Усе працювало так само, але кнопки тепер були на два піксели правіше.", "The update finished. Everything worked the same, but the buttons were now two pixels further right."] ] },
    { t: ["Перезавантаження", "Reboot"], L: [
      ["narr", "Увечері Бітик підійшов до Капі з надзвичайно серйозним виглядом і поставив перед нею паперову ромашку.", "In the evening Bitik approached Capy with an exceptionally serious look and set a paper daisy before her."],
      ["G", "Я знаю, що ти скоро поїдеш далі. Я зробив для тебе резервну копію нашої дружби.", "I know you'll soon move on. I made a backup copy of our friendship for you."],
      ["capy", "Бітику... Це найкраща резервна копія, яку я бачила.", "Bitik... that's the best backup I've ever seen."],
      ["clock", "Нагадую: коли час підійде, мене достатньо завести. Перезавантаження займе мить.", "A reminder: when the time comes, just wind me. A reboot takes a moment."],
      ["narr", "Над містом спалахнуло мільйон вогників, і здавалось, що це хтось набрав «до побачення» на всіх екранах.", "A million lights flashed over the city and it looked as if someone typed 'goodbye' on every screen."] ] }
  ],
  /* ---- 5. ЕКО: дерева й вітряки (гість Лесик) ---- */
  5: [
    { t: ["Дерево на даху", "A Tree on the Roof"], L: [
      ["narr", "Дахи вкрились зеленню, а повітря стало прозорішим. Десь поруч шумів вітряк і пахло нагрітою травою.", "Rooftops turned green and the air grew clearer. A windmill whirred nearby and the smell of warm grass was everywhere."],
      ["G", "Я Лесик! Маю на дахах цілий сад. Але одне дерево не росте. Воно просто сидить і дивиться.", "I'm Lesyk! I keep a whole garden on the roofs. But one tree won't grow. It just sits and stares."],
      ["capy", "Може, йому бракує компанії?", "Maybe it's just missing company?"],
      ["G", "Ти диви! Може. Принесемо друзів: ромашок, кульбаб і кропиву — для різноманіття.", "Hey, maybe! We'll bring it friends: daisies, dandelions and some nettle for variety."],
      ["narr", "Наступного ранку на дереві виросла перша гілка. Лесик так зрадів, що поцілував її в листочок.", "By morning the tree had its first branch. Lesyk was so happy he kissed it on a leaf."] ] },
    { t: ["Компост для всіх", "Compost for Everyone"], L: [
      ["G", "Усе, що ми викидаємо, перетворюється на ґрунт. Це компост: смердить, зате корисно.", "Everything we throw away turns into soil. That's compost: it stinks but it's good."],
      ["S", "Я продавав його за ціною золота. Один пан купив відро, понюхав і збідів.", "I sold it at gold prices. One gentleman bought a bucket, sniffed it and went broke."],
      ["spike", "Це не збідніння, це інвестиція в аромат. Тільки у гіршу сторону.", "That's not going broke, that's an investment in aroma. Just the worse sort."],
      ["capy", "Шнирю, повертай гроші. А компост віднесемо туди, де він справді потрібен.", "Shnyr, give the money back. We'll take the compost where it's actually needed."],
      ["narr", "На городі за тиждень виросли такі морквини, що їх довелось викопувати удвох.", "Within a week the garden grew carrots so big it took two to dig them out."] ] },
    { t: ["Сонячна панель", "The Solar Panel"], L: [
      ["narr", "На даху магазину з'явилась велика синя панель. Вона повільно вмикала лампочки по всій вулиці.", "A big blue panel appeared on the shop roof. Slowly it switched on the lamps along the whole street."],
      ["G", "Це власна електрика сонця. Безкоштовна, чесна і без рахунків.", "That's the sun's own electricity. Free, honest and billless."],
      ["spike", "Я роздратований: у мене тепер немає рахунків. Чим мені займатись?", "I'm annoyed: now I have no bills. What am I supposed to do?"],
      ["capy", "Рахуй промені. Їх дуже багато, і вони не втомлюються.", "Count the rays. There are many and they never tire."],
      ["narr", "Колючка просидів весь день на даху, записуючи кожен промінь у блокнот. І був вельми щасливий, бо рахувати промені — його мрія.", "Spike sat on the roof all day writing each ray into a notebook. And was most happy."] ] },
    { t: ["Бджоли-партнери", "Bee Partners"], L: [
      ["narr", "Над вуликом на даху загудів рій. Перші бджоли вилетіли на розвідку й повернулись із повними лапками пилку.", "A swarm began humming above the rooftop hive. The first scouts flew out and returned with paws full of pollen."],
      ["G", "Вони партнери, не працівники. У них є профспілка і вимоги: більше квітів, менше метушні.", "They're partners, not workers. They have a union and demands: more flowers, less fuss."],
      ["zoya", "Я прошу їх про мед для відділу випічки. Вони обіцяли розглянути.", "I asked them for honey for the bakery. They promised to consider it."],
      ["S", "А я їм запропонував угоду: я охороняю вулик, а вони не жалять мене.", "I offered them a deal: I guard the hive, they don't sting me."],
      ["capy", "Бджоли, до речі, вже підписали. Ось. Гудуть підпис.", "The bees already signed, by the way. See? Humming a signature."] ] },
    { t: ["Ярмарок врожаю", "The Harvest Fair"], L: [
      ["G", "Давайте влаштуємо ярмарок! Кожен принесе по одній корисній речі та одній смачній.", "Let's hold a fair! Everyone brings one useful thing and one tasty thing."],
      ["kria", "Я принесла кошик грибів і шарф. Шарф корисний, гриби смачні.", "I brought a basket of mushrooms and a scarf. The scarf is useful, the mushrooms tasty."],
      ["S", "Я принесу гроші, які ви принесете. Це стратегія.", "I'll bring the money you bring. That's a strategy."],
      ["spike", "Це не стратегія, це податок із загальної ніжності.", "That's not a strategy, that's a tax on general warmth."],
      ["narr", "Ярмарок працював до пізнього вечора. Найсмачнішим виявився пиріг з яблук — і ніхто не хотів його ділити.", "The fair ran until late evening. The tastiest was the apple pie and nobody wanted to share it."] ] },
    { t: ["Дощова ніч", "A Rainy Night"], L: [
      ["narr", "Перший за кілька тижнів дощ барабанив по даху, а в бочках дзвеніли краплі. Лесик вискочив у нічній сорочці.", "The first rain in weeks drummed on the roof and drops rang in the barrels. Lesyk ran out in his nightshirt."],
      ["G", "Дощ! Дощ! Дивіться, як росте трава, мабуть, дві іглинки за секунду!", "Rain! Rain! Look at the grass grow, must be two blades a second!"],
      ["capy", "Лесику, ти змокнеш. І застудишся. І сам почнеш рости.", "Lesyk, you'll get soaked. And catch a cold. And start growing yourself."],
      ["G", "Це моя мрія. Нехай рогами вгору.", "That's my dream. Antlers up."],
      ["narr", "Вранці у калюжі відбивалось сонце, а на листочках сиділи сотні крапельок, схожих на намисто.", "In the morning the sun shone in the puddles and hundreds of droplets sat on the leaves like beads."] ] },
    { t: ["Остання крапля", "The Last Drop"], L: [
      ["narr", "Одного ранку струмок за містом пересох. Вода, що живила всі сади, зникла зовсім.", "One morning the stream outside town ran dry. The water that fed all the gardens was gone."],
      ["G", "Це біда. Без води моє дерево, мої ромашки, мої... мій чайник.", "This is trouble. Without water my tree, my daisies, my... my kettle."],
      ["capy", "Шукаймо джерело. Хтось мусить знати, куди воно поділось.", "Let's look for the spring. Someone must know where it went."],
      ["S", "Я бачив, як вночі барсук ніс відро. Куди — не знаю. Але шляхом, де лежить камінь.", "I saw a badger carrying a bucket at night. Where, I don't know. But along the path with the rock."],
      ["narr", "Під каменем знайшлось джерело. Хтось лише поставив на нього відро, щоб воно не втекло.", "Under the rock they found the spring. Someone had simply put a bucket on it so it wouldn't run away."] ] },
    { t: ["Дерево зацвіло", "The Tree Blooms"], L: [
      ["narr", "Дерево на даху розцвіло рожевими квітами за одну ніч. Усі збіглися дивитись.", "The tree on the roof bloomed with pink flowers overnight. Everyone ran to see."],
      ["G", "Воно чекало. Чекало, що ми будемо поруч, коли воно вирішить розцвісти.", "It was waiting. Waiting for us to be near when it decided to bloom."],
      ["capy", "Лесику, це чудово. Я так рада, що ми були поруч.", "Lesyk, it's wonderful. I'm so glad we were here."],
      ["clock", "Чудова епоха. Пахне медом і теплим деревом. Але попереду — зірки.", "A lovely era. Smells of honey and warm wood. But the stars lie ahead."],
      ["narr", "Пелюстки літали над вулицею, і хтось у кишені Капі тихо цокав у ритм вітру.", "Petals flew over the street and something in Capy's pocket ticked softly to the wind's rhythm."] ] }
  ],
  /* ---- 6. КОСМОС: зорі й ракети (гість Орбіт) ---- */
  6: [
    { t: ["Сигнал із космосу", "A Signal From Space"], L: [
      ["narr", "Над дахами замість зірок майорять станції, а де-не-де повільно пропливають рожеві планети. Ввімкнули гравітацію.", "Above the roofs stations replace the stars and pink planets drift by. Gravity was switched on."],
      ["G", "Я Орбіт, старший оператор зв'язку! Перехопив сигнал: «біп-біп-біп-біп-біп-біп-біп-біп».", "I'm Orbit, senior comms operator! I picked up a signal: 'beep-beep-beep-beep-beep-beep-beep-beep'."],
      ["capy", "Це схоже на те, що ми чули в Ретро-епосі.", "That's like what we heard in the Retro era."],
      ["G", "Саме так! Той самий супутник. Він усі ці роки вертівся й чекав, коли ми відповімо.", "Exactly! The same satellite. All these years it kept spinning and waiting for our reply."],
      ["capy", "Тоді відповімо: «біп».", "Then we'll reply: 'beep'."] ] },
    { t: ["Скафандр для Шниря", "A Spacesuit for Shnyr"], L: [
      ["narr", "Шнирь вийшов на вулицю в надувному скафандрі з банкою замість шолома. Банка була від огірків.", "Shnyr stepped outside in an inflatable spacesuit with a jar for a helmet. The jar was a pickle jar."],
      ["S", "Я готовий до зовнішніх завдань. Лише ніхто не пояснив, що в банці немає повітря.", "I'm ready for external missions. Nobody explained there's no air in the jar."],
      ["G", "Банку треба відкрити! Інакше ти там заціпенієш на третій хвилині.", "You need to open the jar! Otherwise you'll go numb in three minutes."],
      ["spike", "Шолом із рахунком: чотири монети й один огірок. Беру в зарплату.", "Helmet with receipt: four coins and one pickle. Taking it from his salary."],
      ["capy", "Шнирю, давай обміняємо банку на справжній шолом. Це вигідніше.", "Shnyr, let's swap the jar for a real helmet. It's a better deal."] ] },
    { t: ["Невагомість у відділі", "Zero Gravity in the Aisles"], L: [
      ["narr", "Раптом усе, що не прикручене, повільно здійнялось у повітря: пакети, цукерки, окуляри Колючки.", "Suddenly everything not screwed down floated up: bags, sweets, Spike's glasses."],
      ["spike", "Мої окуляри! Вони відлітають до стелі! Це порушення законів фізики й моєї фізіономії.", "My glasses! They're floating to the ceiling! A violation of the laws of physics and my face."],
      ["G", "Це збій гравітаційного поля. Вимикаю, вмикаю. Не допомагає. Тоді просто плюю на нього.", "Gravitational field glitch. Off, on. Doesn't help. Then I'll just spit on it."],
      ["capy", "Ловимо все по черзі! Хто перший — отримує безкоштовну цукерку.", "Catch everything in turn! First one gets a free candy."],
      ["S", "Я вже зловив двадцять цукерок. Вони в мене в кишені. Не питайте, звідки там місце.", "I've already caught twenty candies. They're in my pocket. Don't ask how there's room."] ] },
    { t: ["Метеоритний дощ", "Meteor Shower"], L: [
      ["narr", "Нічне небо перекреслили довгі світлі смуги. Хтось у натовпі прошепотів: «Загадуй бажання».", "Long bright streaks crossed the night sky. Someone in the crowd whispered: 'Make a wish.'"],
      ["G", "Це метеорити! Дрібні, але яскраві. Збираю в сумку на пам'ять.", "Meteorites! Tiny but bright. I'm collecting them in a bag as souvenirs."],
      ["kria", "Я загадала, щоб усі були здорові й щоб у касі лишалась дрібниця.", "I wished that everyone's healthy and that the till keeps some change."],
      ["S", "Я загадав, щоб метеорит упав мені на ногу, але легенько. І не на мою.", "I wished a meteor would fall on my foot, gently. And not on mine."],
      ["capy", "Моє бажання таке: щоб ми дійшли до кінця й нікого не згубили по дорозі.", "My wish is that we reach the end and lose no one along the way."] ] },
    { t: ["Місяць у вітрині", "The Moon in the Window"], L: [
      ["G", "Сьогодні Місяць найближче до Землі! Бачите? Він ледь не торкається вітрини нашого магазину.", "Tonight the Moon is the closest to Earth! See? It nearly touches our shop window."],
      ["capy", "Цікаво, що він думає про наш магазин.", "I wonder what it thinks of our shop."],
      ["spike", "Скаже: «Оренда місця мені не потрібна. Беруся за сир».", "It'll say: 'I don't need rent. I'll take the cheese.'"],
      ["S", "Я спробував відкусити шматок. Це не сир. Це ніби прогоріла біла цегла.", "I tried to bite a piece. It's not cheese. It's like a burnt white brick."],
      ["narr", "Місяць повільно моргнув у відповідь, і всі вирішили, що це був жест вибачення.", "The Moon slowly blinked in reply and everyone decided that was an apology."] ] },
    { t: ["Інопланетний покупець", "The Alien Customer"], L: [
      ["narr", "Двері магазину відчинились із легким шиплячим звуком. Усередину увійшла фіолетова істота з трьома очима.", "The shop door opened with a soft hiss. A violet creature with three eyes stepped inside."],
      ["G", "Це інопланетянин! Він, мабуть, із дуже далекої планети. Скажіть йому щось привітне.", "That's an alien! He's probably from a very distant planet. Say something friendly."],
      ["capy", "Доброго дня! Бажаєте купити щось на пам'ять про Землю?", "Good day! Would you like to buy something to remember Earth by?"],
      ["narr", "Істота показала на пакет цукерок, видихнула сяючу хмаринку й розрахувалась камінцем, що світиться.", "The creature pointed at a bag of candy, exhaled a glowing puff and paid with a shining pebble."],
      ["spike", "Це найцінніша валюта, яку я бачив. Прошу не подавати здачу відрами.", "That's the most valuable currency I've seen. Please don't hand back change by the bucket."] ] },
    { t: ["Зворотний відлік", "The Countdown"], L: [
      ["narr", "На найвищому даху ожила ракета. Навколо неї збирались усі: жителі, гості, навіть кіт-зірка.", "On the highest roof a rocket came to life. Everyone gathered around: residents, guests, even the cat star."],
      ["G", "Усе готово! Лишилось лише відлік: десять, дев'ять, вісім...", "Everything is ready! Only the countdown left: ten, nine, eight..."],
      ["capy", "Орбіте, а ти полетиш?", "Orbit, will you fly?"],
      ["G", "Я залишаюсь тут, доки ви не повернетесь. Хтось же має вмикати світло.", "I'm staying here until you're back. Someone has to turn on the lights."],
      ["narr", "Ракета здійнялась у небо і розсипалась на мільйон іскор. Насправді то були вогники свята.", "The rocket soared and burst into a million sparks. In fact it was festival fireworks."] ] },
    { t: ["Остання зірка", "The Last Star"], L: [
      ["narr", "Вночі Капі довго дивилась на небо. Між зірками висіла одна, яка раз у раз блимала у такт цокання.", "At night Capy gazed at the sky for a long time. Among the stars hung one that blinked in time with ticking."],
      ["clock", "Це я. Точніше, мій колега з майбутнього. Він шле нам привіт.", "That's me. Rather, my colleague from the future. He's sending us regards."],
      ["capy", "Тобі там не самотньо?", "Aren't you lonely up there?"],
      ["clock", "Я ж Годинник. Для мене самотність — це коли ніхто не питає, котра година.", "I'm a Watch. For me loneliness is when nobody asks the time."],
      ["narr", "Орбіт вручив Капі маленьку зірочку на пам'ять. «Світитиме, якщо буде треба», — сказав він.", "Orbit gave Capy a tiny star as a keepsake. 'It will glow if you need it,' he said."] ] }
  ],
  /* ---- 7. НЕОН: місто без сну (гість Лумі) ---- */
  7: [
    { t: ["Місто, що не спить", "The City That Never Sleeps"], L: [
      ["narr", "Вулиці засяяли рожевим і бірюзовим, а над дахами пливли голограми, що розповідали про вигідні знижки.", "The streets glowed pink and turquoise and holograms drifted over the roofs telling of great discounts."],
      ["G", "Я Лумі! Світлячок із вічною нічною зміною. Допомагаю неоновим вивіскам не втомлюватись.", "I'm Lumi! A firefly on a permanent night shift. I help the neon signs not get tired."],
      ["capy", "У вас тут ніколи не темно?", "Is it never dark here?"],
      ["G", "Тільки коли ми вмикаємо «режим затишку». Тоді всі просто світяться тихіше.", "Only when we turn on 'cozy mode'. Then everyone simply glows quieter."],
      ["narr", "Над головою мигнуло літаюче авто, і вітер пахнув озоном та жуйкою.", "A flying car flickered overhead and the wind smelled of ozone and bubblegum."] ] },
    { t: ["Голограма Капі", "Capy's Hologram"], L: [
      ["narr", "Над магазином спалахнула гігантська голограма Капі з усмішкою та написом «ВАШ ЩАСЛИВИЙ ПРОДАВЕЦЬ».", "Above the shop a giant hologram of Capy flared up with a smile and the words 'YOUR LUCKY SELLER'."],
      ["capy", "Це не я. Я не маю таких вусів.", "That's not me. I don't have such whiskers."],
      ["S", "Я лише трохи підправив. Тепер ви схожі на кіно-зірку. Це безкоштовно.", "I only touched it up a bit. Now you look like a movie star. It's free."],
      ["spike", "Я перерахував: вона збільшила потік клієнтів на двадцять відсотків. Незрозуміло, чому саме вуса.", "I did the math: it raised customer traffic by twenty percent. Unclear why whiskers in particular."],
      ["capy", "Нехай поки що висить. Але наступного разу — без вусів.", "Let it hang for now. But next time, no whiskers."] ] },
    { t: ["Роботи-охоронці", "Robot Guards"], L: [
      ["narr", "Біля входу поставили двох роботів із яскравими лінзами. Вони синхронно вклонялись усім відвідувачам.", "Two robots with bright lenses were placed at the entrance. They bowed in sync to every visitor."],
      ["tonya", "Я їх навчила стояти, не позіхаючи. Це найважче, що я робила в житті.", "I taught them to stand without yawning. It's the hardest thing I've ever done."],
      ["G", "Вони бачать усе в інфрачервоному. Особливо мають слабкість до єнота.", "They see everything in infrared. They have a particular weakness for the raccoon."],
      ["S", "Вони мене підозрюють. Навіть коли я не роблю нічого незаконного. Це дискримінація.", "They suspect me. Even when I'm doing nothing illegal. That's discrimination."],
      ["capy", "Просто не носи на собі вісім пакетів кави з сусідньої крамниці.", "Just don't carry eight bags of coffee from the neighboring shop."] ] },
    { t: ["Літаючі таксі", "Flying Taxis"], L: [
      ["narr", "Над вулицею проносились таксі з напівпрозорими куполами. Кожне світилось своїм кольором і голосно клацало дверима.", "Taxis with translucent domes whooshed down the street. Each glowed its own color and slammed doors loudly."],
      ["G", "Є ще вільне! Сідай, Капі: до торгового центру — три хвилини.", "There's a free one! Hop in, Capy: three minutes to the mall."],
      ["capy", "Три хвилини? Я ж можу дійти за дві.", "Three minutes? I can walk it in two."],
      ["G", "Так, але в таксі грає музика і подають гарячий чай.", "True, but the taxi has music and serves hot tea."],
      ["narr", "Капі їхала, пила чай і дивилась на неонові ріки під собою. Вперше за довгий час вона нікуди не поспішала.", "Capy rode, drank tea and watched the neon rivers below. For the first time in ages she wasn't in a hurry."] ] },
    { t: ["Нічний ринок", "The Night Market"], L: [
      ["G", "Раз на місяць у нас відкривається нічний ринок. Продають усе: від світлячків у банках до зоряного пилу.", "Once a month our night market opens. They sell everything from fireflies in jars to stardust."],
      ["S", "Я вже знайшов стенд зі «справжніми підробками». Це чесний бізнес: чесно підробляють.", "I already found a 'genuine fakes' stand. Honest business: honestly forged."],
      ["spike", "Прошу всіх зберігати чеки. На ринку чеків не дають, тому записуємо вручну.", "Everyone please keep receipts. The market doesn't give any, so we note them by hand."],
      ["capy", "Дивіться, яка лампа! Вона світиться різними кольорами залежно від настрою.", "Look at that lamp! It glows different colors depending on your mood."],
      ["narr", "Лампа в руках Капі стала м'яко-золотою. «Спокій», — прочитав продавець.", "In Capy's hands the lamp turned soft gold. 'Calm,' the seller read."] ] },
    { t: ["Хакер у масці", "The Masked Hacker"], L: [
      ["narr", "Раптом усі вивіски в місті показали одне й те саме: усміхнене єнотове обличчя з написом «ВИТАЮ».", "Suddenly every sign in the city showed the same thing: a smiling raccoon face with the word 'HELLO'."],
      ["G", "Нас зламали! Хтось розсилає на вивіски власні жарти!", "We've been hacked! Someone's sending their own jokes to the signs!"],
      ["S", "Це не я. Я лише дав комусь пароль. За невеликий гонорар.", "It wasn't me. I only gave someone a password. For a small fee."],
      ["capy", "Шнирю, чий це пароль?", "Shnyr, whose password was it?"],
      ["S", "Ну... мій. Я його дуже люблю. «Копійка123». Я його щойно придумав.", "Well... mine. I love it. 'penny123'. I just came up with it."] ] },
    { t: ["Темрява", "The Blackout"], L: [
      ["narr", "Місто миттєво померкло. Вивіски, голограми, літаючі авто: усе завмерло, мов хтось вимкнув світ.", "The city went dark in an instant. Signs, holograms, flying cars: all froze as if someone switched off the world."],
      ["G", "Я знаю, що робити! Усі світлячки — до мене! Ми запалимо вулицю самі.", "I know what to do! All fireflies to me! We'll light the street ourselves."],
      ["narr", "Тисячі маленьких вогників здійнялись над дахами. Вони були не такі яскраві, як неон, зате теплі.", "Thousands of tiny lights rose above the roofs. Not as bright as neon, but warm."],
      ["capy", "Дивіться. Місто світиться саме по собі.", "Look. The city glows all by itself."],
      ["S", "Я нікому не казав, але мені подобається така вулиця. З нею хочеться залишитись.", "I never said it to anyone, but I like the street like this. It makes me want to stay."] ] },
    { t: ["Шнирь у команді", "Shnyr Joins the Team"], L: [
      ["narr", "Світло повернулось на світанку. Шнирь стояв перед Капі, переминаючись із лапи на лапу, і тримав у руках весь свій «трофейний» скарб.", "Light returned at dawn. Shnyr stood before Capy, shifting from paw to paw, holding all his 'trophy' treasures."],
      ["S", "Ось. Усе, що я колись «позичив». Забирайте. А мене беріть у команду. Чесно.", "Here. Everything I ever 'borrowed'. Take it. And take me into the team. Honestly."],
      ["spike", "Ти ж не гратимеш із касою?", "You're not going to play with the till, are you?"],
      ["S", "Я перестав. Мені більше подобається, коли ми разом рахуємо монетки.", "I stopped. I like it better when we count coins together."],
      ["capy", "Ласкаво просимо в команду, Шнирю. Тепер золоті відвідувачі від тебе нікуди не дінуться.", "Welcome to the team, Shnyr. Now golden customers can't get away from you."],
      ["clock", "Це була остання епоха кола. Але подорож у часі — це спіраль. Нове коло починається.", "That was the last era of the circle. But time travel is a spiral. A new circle begins."] ] }
  ]
};
// Дані → описи глав (для сюжетного двигуна) і тексти (для translations)
const EPOCH_CHAPTERS = {};
(function () {
  Object.keys(EC_DATA).forEach(k => {
    const ek = +k, guest = GUEST_IDS[ek - 1];
    EPOCH_CHAPTERS[ek] = EC_DATA[k].map((ch, n) => {
      const lines = ch.L.map(r => (r[0] === 'S' ? 'shnyr' + ek : r[0] === 'G' ? guest : r[0]));
      translations.uk['ec' + ek + '_' + (n + 1) + '_title'] = ch.t[0]; translations.en['ec' + ek + '_' + (n + 1) + '_title'] = ch.t[1];
      ch.L.forEach((r, i) => { translations.uk['ec' + ek + '_' + (n + 1) + '_' + i] = r[1]; translations.en['ec' + ek + '_' + (n + 1) + '_' + i] = r[2]; });
      return { id: n + 1, trigger: EC_TRIGGERS[n], lines };
    });
  });
})();
