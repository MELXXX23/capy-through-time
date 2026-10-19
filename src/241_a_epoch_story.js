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
      ["narr", "Місто ніби потрапило на листівку: смугасті навіси, хромовані столики, а всюди тихе «шур-шур» голок по платівках.", "The town seems to have stepped onto a postcard: striped awnings, chrome tables and the soft hiss of record needles everywhere."],
      ["G", "Привіт, я Піп, тримаю закусочну. Мій джубокс третю добу грає одну й ту саму пісню. Я її вже ненавиджу. Але підспівую.", "Hi, I'm Pip, I run the diner. My jukebox has played the same song for three days. I hate it by now. But I sing along."],
      ["capy", "Може, він просто хоче, щоб із ним поговорили?", "Maybe it just wants someone to talk to it?"],
      ["G", "Пробував. Він підспівує. Нижчим голосом. З придихом.", "I tried. It sings along. In a lower voice. Breathily."],
      ["narr", "З джубокса долинуло чхання. Піп відступив на крок, а Капі присіла послухати уважніше.", "A sneeze came from the jukebox. Pip stepped back, and Capy crouched down to listen closer."] ] },
    { t: ["Діджей із джубокса", "The DJ in the Jukebox"], L: [
      ["narr", "Кришка джубокса відкинулась, і звідти виліз єнот у картатому піджаку, з гребінцем у кишені.", "The jukebox lid flipped open and a raccoon in a checkered jacket climbed out, a comb sticking out of his pocket."],
      ["S", "Тихо! Я не злодій, я діджей. Платівка була така гарна, що я її позичив. Надовго. Ну, назавжди.", "Shh! I'm not a thief, I'm a DJ. The record was so pretty I borrowed it. For a long time. Okay, forever."],
      ["spike", "Позичив без розписки. Це зветься «взяв». Рахую збитки.", "Borrowed without a receipt. That's called “took”. Calculating damages."],
      ["capy", "Шнирю, давай так: платівка повертається, збитки не рахуємо.", "Shnyr, here's the deal: the record goes back, we skip the damages."],
      ["S", "Домовились. Але діджеїв не звільняють, ви ж знаєте.", "Deal. But DJs don't get fired, you know that."] ] },
    { t: ["Коктейль №13", "Milkshake Number 13"], L: [
      ["G", "Біда: я загубив рецепт фірмового коктейлю. Лишилось тринадцять інгредієнтів, а чотирнадцятий був секретом. Тепер навіть я не знаю який.", "Disaster: I lost the recipe of my signature milkshake. Thirteen ingredients remain, and the fourteenth was a secret. Now even I don't know it."],
      ["spike", "Я перерахував ціни. Чотирнадцятий інгредієнт, схоже, нічого не коштує. Це мене непокоїть.", "I ran the prices. The fourteenth ingredient seems to cost nothing. That worries me."],
      ["capy", "Нічого не коштує... Може, це не продукт, а те, як ти його подаєш?", "Costs nothing... Maybe it's not an ingredient but how you serve it?"],
      ["G", "Усмішка! Я завжди ставив склянку з усмішкою. А загубив її разом із рецептом!", "A smile! I always put the glass down with a smile. And I lost it along with the recipe!"],
      ["narr", "Піп усміхнувся, і коктейль знову став таким, як треба. Черга стояла до другого кварталу.", "Pip smiled, and the milkshake was right again. The queue stretched to the next block."] ] },
    { t: ["Літак із помилкою", "The Plane With a Typo"], L: [
      ["narr", "Над вулицею пролетів біплан із довгим банером. Усі задерли голови й прочитали вголос.", "A biplane flew over the street trailing a long banner. Everyone looked up and read it aloud."],
      ["zoya", "«ЗНИЖКИ НА САЛАТ». Ми ж не продаємо салат...", "“SALAD SALE”. But we don't sell salad..."],
      ["spike", "У друкарні хтось наплутав. А ми можемо на цьому заробити: до вечора буде черга за салатом.", "Someone at the print shop mixed it up. We could earn from it: by evening there'll be a queue for salad."],
      ["capy", "Тоді тягніть із комори все, що хоч трохи зелене!", "Then drag out of the storeroom everything even slightly green!"],
      ["S", "Я маю зелену шапку. Продаю. Недорого. Майже не носив, лише на справах.", "I have a green hat. For sale. Cheap. Barely worn, only on jobs."] ] },
    { t: ["Біп-біп із неба", "Beep-Beep From the Sky"], L: [
      ["narr", "Увечері над дахами прокотилась крихітна блискуча зірочка. Пискнула «біп-біп» і сховалась за хмару.", "That evening a tiny shiny star rolled over the rooftops. It went “beep-beep” and hid behind a cloud."],
      ["G", "Це новий дзвінок? Я не замовляв.", "Is that a new doorbell? I didn't order one."],
      ["tonya", "Невідомий об'єкт у небі. Охорона зауважила: він блимає в ритм. Це підозріло. Але гарно.", "Unknown object in the sky. Security notes: it blinks in rhythm. Suspicious. But pretty."],
      ["capy", "Схоже, хтось далеко звідси першим привітався з нами.", "Looks like someone far away said hello to us first."],
      ["clock", "(цок... цок...) Я чув цей сигнал у майбутньому. Там він гучніший.", "(tick... tick...) I've heard that signal in the future. It's louder there."] ] },
    { t: ["Танцювальний марафон", "The Dance Marathon"], L: [
      ["G", "Сьогодні марафон: хто довше танцює, отримує безкоштовний коктейль. Довічно! Я вже не можу відмовитись.", "Tonight's a marathon: whoever dances longest gets a free milkshake. For life! I can't back out now."],
      ["kria", "Я танцюю четверту годину. Лапи гудуть. Зате підлога нарешті блищить від моїх кроків.", "I've been dancing for four hours. My feet hum. But at last the floor shines from my steps."],
      ["S", "Я вдавав, що знепритомнів, а сам їв попкорн. Нікому не кажіть.", "I pretended to faint and ate popcorn. Don't tell anyone."],
      ["spike", "Я порахував оберти. Переможець — Капі. З великим відривом.", "I counted the spins. The winner is Capy. By a wide margin."],
      ["capy", "Я просто обертаюсь, коли хвилююсь. Дякую вам.", "I just spin when I'm nervous. Thank you."] ] },
    { t: ["Грозова ніч", "The Stormy Night"], L: [
      ["narr", "Гроза вдарила так, що в усьому кварталі погасли вивіски. Закусочна занурилась у темряву.", "A storm hit so hard that every sign in the block went dark. The diner sank into darkness."],
      ["G", "Без світла джубокс мовчить. А я без нього не знаю, куди дивитись.", "Without power the jukebox is silent. And without it I don't know where to look."],
      ["capy", "Запалимо свічки. Буде тепліше. І трохи романтично.", "Let's light candles. It'll be warmer. And a little romantic."],
      ["S", "Свічки розставлю я. На двох столах. Решту... їх же теж треба кудись діти, правда?", "I'll set out the candles. On two tables. The rest... they need to go somewhere too, right?"],
      ["clock", "Зверніть увагу: у темряві мене чути краще. Цок. Цок. Цок.", "Notice: in the dark you can hear me better. Tick. Tock. Tick."] ] },
    { t: ["Годинник у джубоксі", "The Watch in the Jukebox"], L: [
      ["narr", "Коли світло повернулось, на екрані джубокса замість назви пісні було написано «ЦОК».", "When the lights came back, the jukebox screen showed not a song title but “TICK”."],
      ["clock", "Це була гарна епоха, Капі. Мені сподобались шейки, коктейлі й ті біплани.", "That was a lovely era, Capy. I liked the shakes, the milkshakes and those biplanes."],
      ["capy", "Ми ще не закінчили. Піпові треба допомогти зі столиками.", "We're not done. Pip still needs help with the tables."],
      ["clock", "Допоможи. Я зачекаю. Хвилина більше, хвилина менше. Я ж Годинник.", "Help him. I'll wait. A minute more or less. I'm the Watch, after all."],
      ["narr", "Піп поставив нову платівку. Вона була про дорогу, яка веде далі, ніж можна уявити.", "Pip put on a new record. It was about a road that goes further than you can imagine."] ] }
  ],
  /* ---- 2. ДИСКО: дзеркальна куля й танцпол (гість Зіна) ---- */
  2: [
    { t: ["Куля, що впала", "The Ball That Fell"], L: [
      ["narr", "У місті зацвіли ліхтарики кольору цукерок. На розі хтось репетирує мелодію, яку потім не викинеш із голови.", "The town bloomed with candy-coloured lights. On the corner someone rehearses a tune you won't get out of your head."],
      ["G", "Я Зіна. Вітер зірвав мою дзеркальну кулю, і вона розбилась. Вечірка сьогодні, а я без блиску. Зовсім.", "I'm Zina. The wind tore down my mirror ball and it shattered. The party is tonight and I have no sparkle. At all."],
      ["capy", "Зберемо кожен шматочок. Без блиску вечірка не вечірка.", "We'll gather every piece. No sparkle, no party."],
      ["spike", "Збір уламків оцінюю в чотири монети й одну подряпину. Мою.", "I estimate collecting the shards at four coins and one scratch. Mine."],
      ["G", "Тільки не залишайте уламки без нагляду. Особливо поки поруч єнот.", "Just don't leave the shards unattended. Especially with the raccoon around."] ] },
    { t: ["Смугасте непорозуміння", "A Stripy Misunderstanding"], L: [
      ["narr", "Зіна вийшла на вулицю, і всі замовкли: її смуги стали різнокольоровими, ніби веселка вирішила бути зеброю.", "Zina stepped outside and everyone went quiet: her stripes had turned rainbow, as if a rainbow had decided to be a zebra."],
      ["G", "Я просила лише трохи кольору! Хто мене розмалював?", "I only asked for a little colour! Who painted me?"],
      ["S", "Я. Безкоштовний бонус до пакета «Блиск». Дякую за довіру.", "Me. A free bonus with the “Sparkle” package. Thanks for trusting me."],
      ["capy", "Шнирю, ти перефарбував цілу зебру?", "Shnyr, you recoloured a whole zebra?"],
      ["S", "Не цілу. Лише там, куди дотягнувся.", "Not the whole thing. Only where I could reach."] ] },
    { t: ["Мозаїка з тисячі шматочків", "A Mosaic of a Thousand Pieces"], L: [
      ["G", "Нова куля складається з тисячі дзеркалець. Клеїти треба по одному. Запасіться терпінням. Або кавою.", "The new ball is made of a thousand tiny mirrors. They get glued on one by one. Stock up on patience. Or coffee."],
      ["spike", "Я порахував: потрібно вісімсот дзеркалець. Ще двісті записав «про запас». Це не жадібність, це план.", "I counted: eight hundred mirrors needed. Another two hundred I wrote down as spare. That's not greed, that's a plan."],
      ["kria", "А якщо приклею одне догори дриґом? Блиск однаково блищить.", "What if I glue one upside down? Sparkle still sparkles."],
      ["capy", "Тоді куля трохи заграє навпаки. Нам навіть пасує.", "Then the ball will play a bit in reverse. Suits us, honestly."],
      ["narr", "До ранку куля стала схожа на велику зірку, що спустилась перепочити.", "By morning the ball looked like a big star that had come down for a rest."] ] },
    { t: ["Танцпол, який оживає", "The Dance Floor Comes Alive"], L: [
      ["narr", "Плитки тротуару загоряються по черзі: рожева, блакитна, жовта. Хтось ступив, і весь тротуар загудів басом.", "The sidewalk tiles light up in turn: pink, blue, yellow. Someone stepped, and the whole pavement hummed with bass."],
      ["G", "Це мій танцпол. У нього своє життя, і він любить, коли на ньому танцюють.", "That's my dance floor. It has a life of its own and it loves being danced on."],
      ["tonya", "Попереджаю: порушників ритму штрафуватимемо. Музикою. Повільною.", "Warning: offenders of rhythm will be fined. In music. Slow music."],
      ["S", "Я винайшов техніку «тихенько по краю». Без штрафів, без пригод.", "I invented the “quietly along the edge” technique. No fines, no adventures."],
      ["capy", "Усі на танцпол! Хто не вміє, навчиться за три такти.", "Everyone to the floor! Who can't dance will learn in three beats."] ] },
    { t: ["Конкурс кльошів", "The Flares Contest"], L: [
      ["G", "Сьогодні конкурс: чиї штани ширші. Журі: я, Тоня й бухгалтер. Серйозно.", "Today's contest: whose trousers are wider. The jury: me, Tonya and the accountant. Seriously."],
      ["spike", "У мене штанів немає. Це дискваліфікація чи привілей?", "I have no trousers. Is that a disqualification or a privilege?"],
      ["tonya", "Це спостереження. До речі, штани в єнота на розмір більші, ніж треба.", "That's an observation. By the way, the raccoon's trousers are a size bigger than needed."],
      ["S", "Там дві запасні кишені. Це не штани, це склад. Тома б заздрив.", "Two spare pockets. They're not trousers, they're a warehouse. Toma would be jealous."],
      ["capy", "Виграли всі. А найширші штани дісталися стійці з вішаками. Вона просто стояла поряд.", "Everyone won. The widest trousers went to the clothes rack. It was just standing nearby."] ] },
    { t: ["Тиха дискотека", "The Silent Disco"], L: [
      ["narr", "Увечері в кварталі вимкнули світло. Музика зникла разом із ним.", "That evening the block lost power. The music vanished with it."],
      ["G", "Без колонок я безпорадна... Ні, зачекайте. У нас є ліхтарики, їх можна гойдати.", "Without speakers I'm helpless... no, wait. We have flashlights. We can sway them."],
      ["capy", "Тоді танцюймо без музики. Кожен слухає власний ритм усередині.", "Then let's dance without music. Everyone listens to their own beat inside."],
      ["kria", "У мене всередині зараз марш. Це допускається?", "Inside me there's a march playing right now. Is that allowed?"],
      ["narr", "У темряві рухались сотні вогників, і ніхто нікому не наступив на ногу. Диво дня.", "In the dark hundreds of little lights moved and nobody stepped on anyone's foot. The wonder of the day."] ] },
    { t: ["Остання пісня вечора", "The Last Song of the Night"], L: [
      ["G", "Остання пісня має бути особлива. Хочу, щоб її вибрала Капі.", "The last song has to be special. I want Capy to choose it."],
      ["capy", "Я не знаю жодної... окрім тієї, що наспівує годинник у кишені.", "I don't know any... except the one the watch in my pocket hums."],
      ["clock", "(цок-цок, цок-цок-цок) Бум-бум, бум-ба-дум.", "(tick-tock, tick-tock-tock) Boom-boom, boom-ba-dum."],
      ["G", "Це ж справжній диско-біт! Годиннику, у тебе талант!", "That's a real disco beat! Watch, you've got talent!"],
      ["narr", "Весь квартал танцював під цокання аж до світанку. Хтось навіть записав його на плівку.", "The whole block danced to the ticking until dawn. Someone even recorded it on tape."] ] },
    { t: ["Світанок над танцполом", "Dawn Over the Dance Floor"], L: [
      ["narr", "На світанку дзеркальна куля зловила перший промінь і розсипала по стінах тисячу зайчиків.", "At dawn the mirror ball caught the first ray and scattered a thousand bright spots across the walls."],
      ["G", "Це була найкраща вечірка в моєму житті. Дякую, Капі. Тепер у мене є куля. І друзі.", "That was the best party of my life. Thank you, Capy. Now I have a ball. And friends."],
      ["clock", "Вітаю. Диско добігає кінця, як усяка гарна мелодія.", "Congratulations. Disco is coming to an end, like any good tune."],
      ["capy", "А що далі?", "And what comes next?"],
      ["clock", "Далі — світ, що живе в маленьких пікселях. Збирайся, коли зможеш.", "Next comes a world that lives in tiny pixels. Pack up when you can."] ] }
  ],
  /* ---- 3. АРКАДИ: пікселі й рекорди (гість Макс) ---- */
  3: [
    { t: ["Вставте монетку", "Insert Coin"], L: [
      ["narr", "Світ став квадратним, гучним і трохи блимливим. Над дверима горить напис INSERT COIN.", "The world became square, loud and a little flashy. Above the door a sign glows: INSERT COIN."],
      ["G", "Я Макс. Тримаю найкращу аркаду в місті. Щоб запуститись, вона просить монетку, а в мене лишилась тільки віра.", "I'm Max. I run the best arcade in town. It wants a coin to start, and all I have left is faith."],
      ["capy", "Ось монета. Тільки перший хід мій.", "Here's a coin. But the first turn is mine."],
      ["G", "Ого, спрацювало з першого разу! Це талант чи просто пощастило?", "Wow, it worked the first time! Is that talent or just luck?"],
      ["narr", "Екран спалахнув: «PLAYER 1: CAPY». Пішов відлік першого рівня.", "The screen flashed: “PLAYER 1: CAPY”. The first level began counting down."] ] },
    { t: ["Рекорд, якого не було", "A Record That Never Happened"], L: [
      ["narr", "У таблиці рекордів сяє нове ім'я: «ЄНТ — 999999». Усі повільно повернули голови.", "On the high-score board a new name shines: “RAC — 999999”. Everyone slowly turned their heads."],
      ["G", "Я цю гру проходив сто разів і ніколи не бачив стільки очок. Звідки?", "I've beaten this game a hundred times and never saw that many points. Where from?"],
      ["S", "Просто я дуже старанний. І трохи вмію поводитися з викрутками.", "I'm just very diligent. And a bit handy with screwdrivers."],
      ["spike", "Цей рахунок більший за всі монети в місті. Математично нечесно.", "That score is larger than all the coins in town. Mathematically unfair."],
      ["capy", "Шнирю, закрути назад, і ми забудемо про цей рекорд. Згода?", "Shnyr, screw it back and we'll forget about the record. Deal?"] ] },
    { t: ["Рівень із привидами", "The Level With Ghosts"], L: [
      ["narr", "На екрані з'явився лабіринт, а в залі між автоматами попливли кульки з очима. Вони хихотіли.", "A maze appeared on the screen, and balloon-like blobs with eyes floated between the machines. They giggled."],
      ["G", "Це привиди з першого рівня! Вилізли з гри, а я їх не кликав.", "Those are the ghosts from level one! They climbed out of the game and I never called them."],
      ["tonya", "Їх зручніше ловити, коли вони стають синіми. Це я з досвіду. Давно.", "They're easier to catch when they turn blue. I know from experience. A long time ago."],
      ["capy", "До автоматів! Хто з'їсть більше крапок, той визволяє зал!", "To the machines! Whoever eats the most dots frees the hall!"],
      ["S", "А я з'їм усе, що не прибито. Крапки смачні?", "I'll eat anything that isn't nailed down. Are dots tasty?"] ] },
    { t: ["Падаючі блоки", "Falling Blocks"], L: [
      ["narr", "З неба повільно спускаються різнокольорові фігурки, а лінії з'їдають їх рядок за рядком.", "Colourful shapes slowly descend from the sky while lines swallow them row by row."],
      ["G", "Це ж тетріс! Складаємо їх у рівні ряди, інакше завалять усю вулицю.", "That's Tetris! We fit them into neat rows or they'll bury the whole street."],
      ["spike", "Прямі ліворуч, криві праворуч. Я розмітив усе кольорами. Мені навіть подобається.", "Straight ones left, crooked ones right. I've colour-coded it all. I actually like it."],
      ["capy", "Команда, крутіть блоки! Хто стоїть без діла, стає паличкою!", "Team, rotate the blocks! Whoever stands idle becomes a stick!"],
      ["narr", "Ряди зникали один за одним, і вулиця раптом стала світліша, ніби після прибирання.", "Rows vanished one by one and the street suddenly looked brighter, as if just cleaned."] ] },
    { t: ["Секретний код", "The Secret Code"], L: [
      ["G", "Я знаю секрет: вгору-вгору-вниз-вниз-вліво-вправо... і тричі B. Це дає безкінечні життя.", "I know a secret: up-up-down-down-left-right... and B three times. It gives infinite lives."],
      ["spike", "Шахрайство. Чесно такі життя коштували б вісімдесят монет.", "Cheating. Honestly, such lives would cost eighty coins."],
      ["S", "Мій секрет кращий: «вгору, вправо, ще вправо і за касу». Там завжди хтось забуває здачу.", "Mine's better: “up, right, right again and behind the till”. Someone always forgets their change there."],
      ["capy", "Жодних кодів. Граємо по-справжньому.", "No codes. We play for real."],
      ["narr", "Макс зітхнув, але вперше за вечір усміхнувся. Чесна гра приємніша за підказки.", "Max sighed but smiled for the first time that night. An honest game beats any hint."] ] },
    { t: ["Бос рівня", "The Level Boss"], L: [
      ["narr", "У кінці довгого коридору стояв величезний пікселізований монстр із табличкою «ПОДАТКОВА ІНСПЕКЦІЯ».", "At the end of a long corridor stood a huge pixelated monster with a sign: “TAX OFFICE”."],
      ["spike", "О. Старий знайомий. Дозвольте, я з ним поговорю мовою цифр.", "Oh. An old acquaintance. Let me talk to it in the language of numbers."],
      ["capy", "Ми з тобою, Голко. Кожен кине в нього по монеті й по ідеї.", "We're with you, Spike. Each of us will throw a coin and an idea at it."],
      ["S", "Я відверну його. Спитаю, чи він чекає на подарунок.", "I'll distract it. I'll ask if it's expecting a gift."],
      ["narr", "Бос завмер, кліпнув і розсипався на двісті квадратиків із написом «ЗНИЖКА 20%».", "The boss froze, blinked and broke into two hundred squares labelled “20% OFF”."] ] },
    { t: ["Game over?", "Game Over?"], L: [
      ["narr", "Раптом усі екрани в залі мигнули й погасли. Лишився тільки один рядок: GAME OVER.", "Suddenly every screen in the hall flickered and went dark. Only one line remained: GAME OVER."],
      ["G", "Ні... Усе? Це кінець моєї аркади?", "No... That's it? Is this the end of my arcade?"],
      ["capy", "Ні, Максе. Дивись нижче, дрібним шрифтом: «CONTINUE? 10... 9... 8...»", "No, Max. Look below, in small print: “CONTINUE? 10... 9... 8...”"],
      ["G", "Тиснемо «Так»! Усі разом! Три, два, один!", "We press Yes! All together! Three, two, one!"],
      ["narr", "Екрани засвітились знову, яскравіше, ніж раніше. Макс обійняв Капі так, що аж затріщав ґудзик.", "The screens lit up again, brighter than before. Max hugged Capy so hard a button creaked."] ] },
    { t: ["Продовжити?", "Continue?"], L: [
      ["narr", "Коли гості розійшлись, на головному автоматі лишилось одне повідомлення. Воно блимало в ритм цокання.", "When the guests left, one message remained on the main machine. It blinked to the rhythm of ticking."],
      ["clock", "«CONTINUE?» — це питаю я, Капі. Попереду ще багато рівнів.", "“CONTINUE?” That's me asking, Capy. There are plenty of levels ahead."],
      ["capy", "А ти точно не бос рівня?", "Are you sure you're not a level boss?"],
      ["clock", "Я радше фінальний екран. Тільки з бонусами.", "I'm more of a final screen. Only with bonuses."],
      ["narr", "Автомат Макса тихо заграв музику нового рівня, а десь у кишені Капі відгукнувся годинник.", "Max's machine softly played the next level's music, and somewhere in Capy's pocket the watch answered."] ] }
  ],
