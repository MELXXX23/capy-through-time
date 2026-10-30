//#part 276_zz_lines_b.js
/* =====================================================================
   РЕПЛІКИ ЗВІРЯТ І КАПІ, стиль B: у кожного мрія / біда / стосунки з колегами; 10 фраз на героя (TEAM_PHRASES = CAPY_PHRASES = 10).
   Тут же — репліки при наймі: team_{id}_hire (перший раз), teamReturn_* (повернення після подорожі), teamUpMile_* (рівні 5 і 10), teamUpShort.
   Старі team_*_say_* і capy_say_* цей файл стирає й пише заново; «холодні» (cold) і репліки епох не чіпає.
   ===================================================================== */
(function () {
  const L = {
    spike: {
      uk: ["Колись мені довірять сейф. Невеликий, на одного їжака.", "Тоня йде до дверей уже годину. Я поставив на «до обіду». Програю.", "Монета в голках — це не крадіжка, це доставка. Мені так здається.", "Перерахував утретє. Сходиться. Це лякає більше, ніж коли не сходиться.", "Мама казала: хто рахує, той спить спокійно. Мама в магазині не працювала.", "Хтось залишив чайові: три копійки й стрічку. Беру обидва.", "Кажуть, у мене колючий характер. Я перевіряв: просто голки.", "Тома пам’ятає борги, я пам’ятаю решту. Разом ми непереможні.", "Вночі мені сниться сейф. Він усміхається. Прокидаюсь щасливим.", "Лео просить звіт. Кажу: «Звіт у касі». Він кивнув. Не зрозумів."],
      en: ["One day they'll trust me with a safe. A small one, hedgehog-sized.", "Tonya has been walking to the door for an hour. I bet on \"by lunch\". I'm going to lose.", "A coin stuck in my quills isn't theft, it's delivery. That's how I see it.", "Counted it three times. It adds up. That scares me more than when it doesn't.", "Mum used to say: whoever counts, sleeps well. Mum never worked in a shop.", "Someone left a tip: three pennies and a ribbon. I'm taking both.", "They say I have a prickly personality. I checked: it's just the quills.", "Toma remembers the debts, I remember the change. Together we're unbeatable.", "At night I dream about a safe. It smiles. I wake up happy.", "Leo wants a report. I say, \"The report is in the till\". He nodded. Didn't get it."]
    },
    bodya: {
      uk: ["Колись збудую греблю. Справжню, з табличкою «Збудував Бодя».", "Михась носить ящики повз мої сходи. Я їх щойно вирівняв. Щойно!", "Креслення у мене є. Поки що в голові. І трохи на серветці.", "Дошка скрипнула, і я вже знаю: не та. Спина мені вірить більше, ніж лінійка.", "Усі кажуть «будівельник». А я ще й гарно малюю плани. Ніхто ж не питає.", "Колись у мене була ідеальна дошка. Не знаю, куди поділась. Може, Тома знає.", "Нахилена полиця — не помилка. Це ухил на смак покупців.", "Чуєш, як гуде вулиця? Це не шум. Це план будови.", "Я люблю дерево. Воно не сперечається. Не те що Михась.", "Кря щойно натерла підлогу. Тепер я бобер, а не ковзаняр."],
      en: ["One day I'll build a dam. A real one, with a plaque: \"Built by Bodya\".", "Mikhas carries crates past my stairs. I just straightened them. Just now!", "I have the blueprints. They're in my head for now. And a bit on a napkin.", "A board creaked and I already know: wrong one. My back trusts me more than a ruler.", "Everyone says \"builder\". I also draw nice plans. Nobody asks.", "I once had the perfect board. No idea where it went. Maybe Toma knows.", "A slanted shelf isn't a mistake. It's a tilt toward what customers like.", "Hear how the street hums? That's not noise. That's a building plan.", "I love wood. It doesn't argue. Unlike Mikhas.", "Kria just waxed the floor. Now I'm a beaver, not an ice skater."]
    },
    zoya: {
      uk: ["Мрію про власну вітрину. Ніжно-рожеву. Щоб навіть каса мала настрій.", "Жужа назвала мій колір «персиковий шок». Беру як комплімент.", "Лео вчить мене «стратегій продажу». Я їх уже пів року застосовую. Просто називаю це «розмова».", "Є покупці, яким ще нічого не треба. Я чекаю. Вони зараз прозріють.", "Сьогодні шість разів сказала «останній екземпляр». Склад чесний, просто мовчить.", "Покупець замислився. Це моє улюблене. Допоможу йому замислитись ще трохи.", "Перша реакція — «дорого». Друга — «візьму». Я чекаю другої.", "Пао намалювала мій портрет на плакаті. Вуха вийшли великі. Мені подобається.", "Сьогодні мені подякували. Ще й повернулись. Я розчулилась.", "Жужа каже, що в мене «вічна розпродажна усмішка». Не знаю, що вона мала на увазі."],
      en: ["I dream of my own shop window. Soft pink. So even the till has a mood.", "Zhuzha called my colour \"peach shock\". I'm taking it as a compliment.", "Leo teaches me \"sales strategies\". I've been using them for half a year. I just call it \"chatting\".", "Some customers don't need anything yet. I wait. They'll see the light.", "Said \"last one in stock\" six times today. The stockroom is honest, just quiet.", "A customer is thinking it over. My favourite part. I'll help them think a little longer.", "First reaction: \"too expensive\". Second: \"I'll take it\". I wait for the second.", "Pao drew my portrait on a poster. The ears came out huge. I like it.", "Someone thanked me today. And came back. I got misty.", "Zhuzha says I have a \"permanent sale smile\". I don't know what she meant."]
    },
    tonya: {
      uk: ["Шість власників бачила ця крамниця за сто сорок років. Цей — найцікавіший.", "Стежу за єнотом, а він за мною. Така в нас дружба.", "Поки всі біжать, я встигаю помітити, що вони впустили. Мовчки піднімаю.", "Хто поспішає, пробігає повз найцікавіше. Я йду. Я бачу все.", "Голка поставив на мене «до обіду». Я його не підведу. Може.", "Єнот щойно пройшов повз. Я помітила. Через п’ять хвилин скажу.", "Тут шість поверхів. Я піднімалась пішки. Ще не дійшла.", "Ніч — найкращий час для охорони. Нічого не рухається. Крім мене. Ледве.", "Панцир — мій кабінет. Тут усе при мені.", "Кря перемила підлогу, а я на тому ж місці. Вона не ображається."],
      en: ["This shop has had six owners in a hundred and forty years. This one is the most interesting.", "I watch the raccoon, and he watches me. That's our friendship.", "While everyone runs, I have time to notice what they dropped. I quietly pick it up.", "Whoever hurries runs past the best parts. I walk. I see everything.", "Spike bet on me \"by lunch\". I won't let him down. Maybe.", "The raccoon just walked past. I noticed. I'll mention it in five minutes.", "There are six floors here. I walked up. Haven't arrived yet.", "Night is the best time for guarding. Nothing moves. Except me. Barely.", "My shell is my office. Everything's with me.", "Kria mopped the floor and I'm in the same spot. She doesn't mind."]
    },
    mikhas: {
      uk: ["Мріяв про пасіку. Став вантажником. Мед усе одно поряд, то й нічого.", "Тома пам’ятає, де що лежить. Я пам’ятаю, що воно важке. Гарна пара.", "Бодя будує, я ношу. Було б чудово, якби хтось іще казав «обережно».", "Ящик не питає, чи я втомився. За це я його й люблю.", "Не питай, що в коробці. Я теж не питаю. Так спокійніше.", "Мед у складі є. Не питайте звідки. Не мій.", "Люблю, коли ящик легкий. Буває раз на тиждень. Відзначаю.", "Соня спить удень, я працюю вдень. Зустрічаємось на повороті, обоє втомлені.", "Хтось сказав «підніми, будь ласка». Це вже хороша зміна.", "Моя спина тримає півміста. Дякую, що ніхто не сів зверху."],
      en: ["I dreamed of a beehive. Became a porter. Honey's still nearby, so it's fine.", "Toma remembers where everything is. I remember that it's heavy. Good pair.", "Bodya builds, I carry. Would be great if someone also said \"careful\".", "A crate never asks if I'm tired. That's why I love it.", "Don't ask what's in the box. I don't either. It's calmer that way.", "There's honey in the stockroom. Don't ask where from. Not mine.", "I love it when a crate is light. Happens once a week. I mark the date.", "Sonia sleeps by day, I work by day. We meet at the corner, both exhausted.", "Someone said \"lift this, please\". Already a good shift.", "My back holds up half the town. Thanks for not sitting on top."]
    },
    sonia: {
      uk: ["Колись знайду ту копійку, що зникла в березні. Вона десь тут. Відчуваю.", "Лео сподобалась моя таблиця. Він не розуміє, що в ній, але сподобалась.", "Кава о третій ночі — не залежність. Це графік.", "Вдень я лише моргаю. Голова вмикається, коли гасне світло.", "Хтось залишив чек без дати. Не скажу хто. Але я бачу.", "Дебет із кредитом посварились. Я не втручаюсь. Ну, майже.", "Нічого так не заспокоює, як порожній стовпчик у таблиці.", "Лео, цифри не слухаються нарад. Я перевіряла.", "Тихіше ходіть: ніч любить рахувати в тиші.", "Мудра сова не дивиться на годинник. Вона дивиться на касу."],
      en: ["One day I'll find that penny that vanished in March. It's here somewhere. I can feel it.", "Leo liked my spreadsheet. He doesn't understand it, but he liked it.", "Coffee at three a.m. isn't an addiction. It's a schedule.", "By day I just blink. My head switches on when the lights go out.", "Someone left a receipt with no date. I won't say who. But I see.", "Debit and credit had a fight. I'm not getting involved. Well, almost.", "Nothing calms me like an empty column in a spreadsheet.", "Leo, numbers don't obey meetings. I checked.", "Walk softer: the night likes to count in silence.", "A wise owl doesn't watch the clock. She watches the till."]
    },
    kria: {
      uk: ["Усе життя мию чужі сліди. Колись залишу власний.", "Тоня — ідеальна колега: стоїть на місці й не наслідить.", "Мрію про полірувальну машину. З мигалкою. Щоб усі знали: тут чисто.", "Хтось залишив слід від кави. Я його запам’ятала. Ми ще зустрінемось.", "Вранці підлога чиста. До обіду вже ні. Не засмучуюсь, просто повертаюсь.", "Піна — це мій настрій. Сьогодні він високий.", "Нікому не кажіть, але мені подобаються сліди. Просто не люблю їх прибирати.", "Мурзик пролив воду біля розетки. Я стояла й дивилась. Він живий.", "Скло блищить, значить, я ще тут. Це моє «доброго ранку».", "У кожної швабри є ім’я. Мою звуть Зінаїда. Не питайте."],
      en: ["All my life I've washed other people's footprints. One day I'll leave my own.", "Tonya is the perfect colleague: stands still and leaves no mess.", "I dream of a floor polisher. With a flashing light. So everyone knows: it's clean here.", "Someone left a coffee stain. I remember it. We'll meet again.", "In the morning the floor is clean. By lunch it isn't. I don't mind, I just come back.", "Foam is my mood. Today it's high.", "Don't tell anyone, but I kind of like footprints. I just don't like cleaning them.", "Murzyk spilled water near the socket. I stood and watched. He's alive.", "The glass shines, so I'm still here. That's my \"good morning\".", "Every mop has a name. Mine is Zinaida. Don't ask."]
    },
    zhuzha: {
      uk: ["Колись мене запросять на тиждень моди. Капелюх уже обрала. Бракує запрошення.", "Зоя продає, я підбираю. Разом ми майже бізнес.", "Мурзик порадив «вдягнути щось із дротів». Подякувала й відійшла.", "Це не червоний. Це «вогонь у ліхтарі». Чуєте різницю? Ніхто не чує.", "Шарф і капелюх разом — ні. Я пробувала. Було погано. Дуже.", "Новий колір! Ні, не новий. Просто хтось нарешті його помітив.", "Пао питає, який колір плаката. Кажу: «Менше червоного». Вона додала червоного.", "Дві смужки — класика. Три — бунт. Чотири — це вже ми з Мурзиком.", "Люблю блискітки. Вони не виправдовуються. Вони просто сяють.", "Мода повертається. Спина теж. Не одночасно."],
      en: ["One day they'll invite me to fashion week. I've already picked the hat. Just need the invite.", "Zoya sells, I style. Together we're almost a business.", "Murzyk advised me to \"wear something made of wires\". I thanked him and walked away.", "It's not red. It's \"fire in a lantern\". Hear the difference? Nobody does.", "Scarf and hat together? No. I tried. It was bad. Very bad.", "A new colour! No, not new. Someone finally noticed it.", "Pao asks what colour the poster should be. I say, \"Less red\". She added red.", "Two stripes: classic. Three: rebellion. Four: that's me and Murzyk.", "I love glitter. It doesn't make excuses. It just shines.", "Fashion comes back. So does my back pain. Not at the same time."]
    },
    leo: {
      uk: ["Усі думають, що я нічого не роблю. Я роблю нічого дуже наполегливо.", "Скоро ювілей крамниці. Треба вигадати, що ми святкуємо.", "Соня знайшла помилку в моєму звіті. Тепер я її побоююсь і поважаю.", "Нарада на п’ять хвилин. Тобто на годину. Принесіть печиво.", "Я не тікаю з нарад. Я виходжу по свіжі ідеї. Вони зазвичай у коридорі.", "Ми працюємо над планом. Він у процесі. Процес теж у процесі.", "Спізнююсь не я. Це решта приходять раніше за графік.", "Нова політика: нарада не довша за каву. Окрема нарада про те, яка це кава.", "Капі, на хвилинку? Це на пів години. Максимум.", "Головна навичка менеджера: мовчки дивитись у вікно. Практикую щодня."],
      en: ["Everyone thinks I do nothing. I do nothing very hard.", "The shop's anniversary is coming. We need to decide what we're celebrating.", "Sonia found a mistake in my report. Now I fear and respect her.", "A five-minute meeting. Meaning an hour. Bring cookies.", "I don't flee meetings. I step out for fresh ideas. They're usually in the corridor.", "We're working on a plan. It's in progress. The progress is in progress too.", "I'm not late. Everyone else just arrives ahead of schedule.", "New policy: no meeting longer than a coffee. A separate meeting on which coffee.", "Capy, got a minute? It's half an hour. Max.", "A manager's key skill: staring silently out the window. I practise daily."]
    },
    pao: {
      uk: ["Хочу зняти ролик, де всі танцюють. Ніхто не погоджується. Поки.", "Лео каже, що мій слоган уже зайнятий. Вигадаю гірший, щоб точно наш.", "Новий плакат! Усе на ньому моє. Навіть кривий шрифт.", "Бамбук смачний. Це не реклама. Хоча... трішки реклама.", "Хештег вигадала вчора. Три лайки вже є. Два мої, один мамин.", "Моя поза на плакаті — найкраща. Інші пози відхилено.", "Сьогодні роздала двадцять листівок. Дев’ятнадцять повернулись. Це популярність.", "Зоя бере мої плакати для вітрини. Ще не сказала їй, що вони не готові.", "Мрію про рекламний щит на весь квартал. Ну або хоча б на дах.", "Бамбуковий чай — мій улюблений. Сьорбаю гучно. Для атмосфери."],
      en: ["I want to shoot a video where everyone dances. Nobody agrees. Yet.", "Leo says my slogan is already taken. I'll invent a worse one, so it's definitely ours.", "New poster! Everything on it is mine. Even the crooked font.", "Bamboo is tasty. That's not an ad. Although... a little bit an ad.", "I made up a hashtag yesterday. Three likes already. Two are mine, one is Mum's.", "My pose on the poster is the best. Other poses rejected.", "Handed out twenty flyers today. Nineteen came back. That's popularity.", "Zoya takes my posters for the window. I haven't told her they aren't finished.", "I dream of a billboard across the whole block. Or at least on the roof.", "Bamboo tea is my favourite. I slurp loudly. For atmosphere."]
    },
    murzyk: {
      uk: ["Мрію про день без короткого замикання. Не сьогодні. Може, завтра.", "Шнирь просив позичити батарейку. Я сказав «позичай». Він сказав «ага». Більше я її не бачив.", "Дроти заплуталися. Я знаю, звідки вони. Це моя справа.", "Не чіпав. Воно саме. Просто поруч стояв я.", "Лампочку замінив. Світить не так, як раніше, але світить. Це вже перемога.", "Хтось просив «увімкнути світло». Шукав вимикач. Знайшов кнопку. Тепер у нас музика.", "Іскра була невеличка. Майже непомітна. Тільки Кря помітила.", "Лампочки мене люблять. Особливо перегорілі.", "У шафі сидить роутер. Дивиться на мене. Я на нього. Ніхто не кліпає.", "Якщо гасне світло, то це не я. Скоріше за все."],
      en: ["I dream of a day with no short circuit. Not today. Maybe tomorrow.", "Shnyr asked to borrow a battery. I said \"sure\". He said \"yep\". Never saw it again.", "The wires are tangled. I know where they come from. That's my business.", "Didn't touch it. It did it itself. I just happened to be standing nearby.", "Changed the bulb. It doesn't shine like before, but it shines. That's a win.", "Someone asked to \"turn on the light\". I looked for the switch. Found a button. Now we have music.", "The spark was small. Almost unnoticeable. Only Kria noticed.", "Light bulbs love me. Especially the burnt-out ones.", "There's a router in the cupboard. It looks at me. I look at it. Nobody blinks.", "If the lights go out, it's not me. Most likely."]
    },
    toma: {
      uk: ["Слонова пам’ять — не метафора. Тому я пам’ятаю й те, що вам хочеться забути.", "Михась носить, я записую. Він не любить, коли я записую.", "Мрію про склад, де нічого не губиться. Поки що трохи губиться. Мишка в курсі.", "Хто переставив ящики? Я пам’ятаю хто. Не скажу. Поки.", "Хобот — найкраща лінійка. Нею міряю все, навіть настрій.", "У вівторок о 14:32 хтось сказав «потім». Минуло вже багато вівторків. Я чекаю.", "Склад — мій храм. Михась — єдиний, кому я дозволяю торкатись ящиків.", "Мишка знову в складі. Я знаю її на ім’я. Вона мене теж.", "Інвентар — це любов, виміряна в коробках. Я люблю багато.", "Нікому не кажіть, але я все пам’ятаю, і це втомлює."],
      en: ["An elephant's memory isn't a metaphor. That's why I remember what you'd rather forget.", "Mikhas carries, I write it down. He doesn't like it when I write it down.", "I dream of a stockroom where nothing gets lost. A little gets lost. The mouse knows.", "Who moved the crates? I remember who. Won't tell. Yet.", "The trunk is the best ruler. I measure everything with it, even moods.", "On a Tuesday at 14:32 someone said \"later\". Many Tuesdays have passed. I'm waiting.", "The stockroom is my temple. Mikhas is the only one I let touch the crates.", "The mouse is back in the stockroom. I know her by name. She knows mine too.", "Inventory is love, measured in boxes. I love a lot.", "Don't tell anyone, but I remember everything, and it's tiring."]
    },
    shnyr: {
      uk: ["Тоня за мною стежить. Мені навіть подобається: ніхто досі так довго мною не цікавився.", "Виправляюсь. Вчора повернув п’ять монет. Три з них мої.", "Хочу, щоб тут довіряли. Хоч би один ключ. Від чогось невеликого.", "Бачу блискуче, лапа сама тягнеться. Тримаю її другою лапою. Допомагає.", "Мурзик про батарейку не питає. Я теж. Дружба.", "Бачу кишеню, розумію, що чужа. Відводжу очі. Роблю успіхи.", "Голка бачив, як я дивлюсь на касу. Тепер нам обом ніяково.", "Мене тут не бояться. Це вперше. Не знаю, що робити з руками.", "Раніше я тікав. Тепер мене кличуть на обід. Дивне відчуття.", "Тоня навчила мене чекати. Вчора чекав цілу хвилину. Пишаюсь."],
      en: ["Tonya watches me. I kind of like it: nobody's ever been so interested in me for so long.", "I'm reforming. Yesterday I returned five coins. Three of them were mine.", "I want to be trusted here. Just one key. To something small.", "I see something shiny and my paw reaches out. I hold it back with my other paw. It helps.", "Murzyk doesn't ask about the battery. Neither do I. Friendship.", "I see a pocket, realise it's not mine. Look away. Making progress.", "Spike saw me looking at the till. Now we're both awkward.", "Nobody's afraid of me here. First time ever. Don't know what to do with my hands.", "I used to run away. Now they call me to lunch. Weird feeling.", "Tonya taught me to wait. Yesterday I waited a whole minute. Proud of myself."]
    },
    nara: {
      uk: ["Чай заварюється рівно стільки, скільки треба. Не питайте скільки.", "На рогах у мене мох. Це не недогляд, це сад.", "Єнот приходить по чай. Я наливаю. Він приходить знову. Це дружба.", "Колись здавалося, що вистачить одного дерева. Тепер тут цілий сад.", "Пелюстки падають, а я слухаю. Тихо, але чутно.", "Мрію про чайну вулицю, де всі говорять тихо й п’ють багато.", "Тоня й я рухаємось однаково повільно. Нам є про що мовчати.", "Тайко б’є вдалині. Серце теж. Не сперечаємось.", "Лео кличе на нараду, я кличу на чай. Поки що чай виграє.", "Хто поспішає, забуває дихати. А я дихаю. Бачите, нічого страшного."],
      en: ["Tea steeps exactly as long as it needs. Don't ask how long.", "I have moss on my antlers. It's not neglect, it's a garden.", "The raccoon comes for tea. I pour. He comes again. That's friendship.", "I used to think one tree would be enough. Now there's a whole garden.", "Petals fall and I listen. Quiet, but audible.", "I dream of a tea street where everyone speaks softly and drinks a lot.", "Tonya and I move at the same slow pace. We have plenty to be silent about.", "A taiko drum beats in the distance. So does my heart. We don't argue.", "Leo calls me to a meeting, I call him to tea. Tea is winning so far.", "Whoever hurries forgets to breathe. I breathe. See? Nothing scary."]
    }
  };
  const CAPY = {
    uk: ["Нова епоха, ті самі обличчя. Лише капелюхи інші.", "Колись мріялось про будку на розі. А ось вона. Іноді ще не віриться.", "Тоня й досі йде до дверей. Починаю вірити, що дійде.", "Голка перерахував утретє. Не заважаю: це його ритуал.", "Вранці тут тихо. Потім хтось відчиняє двері, і починається життя.", "Тут уже майже все моє. Решту куплю завтра.", "Ранок: перша монета й перше «доброго дня». Жодна не зайва.", "Хтось залишив чайові у вазі. Не знаю, чия ваза. Беру.", "Тримаю в голові список: не забути подякувати кожному. Поки що я на третьому.", "Коли ввечері вулиця світиться, здається, що всі ми одна велика вивіска."],
    en: ["New era, same faces. Just different hats.", "I used to dream of a booth on the corner. And here it is. Sometimes I still can't believe it.", "Tonya is still walking to the door. I'm starting to believe she'll make it.", "Spike counted it three times. I don't interfere: it's his ritual.", "It's quiet here in the morning. Then someone opens the door and life begins.", "Almost everything here is mine already. I'll buy the rest tomorrow.", "Morning: the first coin and the first \"good morning\". Neither is wasted.", "Someone left a tip in a vase. No idea whose vase. I'll take it.", "I keep a list in my head: remember to thank everyone. So far I'm on the third.", "When the street lights up in the evening, it feels like we're one big shop sign."]
  };
  const HIRE = {
    spike: ["Каса моя. Руки не тягнути.", "The till is mine. Hands off."],
    bodya: ["Де тут що ламати? Тобто будувати.", "Where's something to break? I mean build."],
    zoya: ["Покажіть, хто тут ще без обновки.", "Show me who's still without something new."],
    tonya: ["Я на місці. Майже. Скоро.", "I'm here. Almost. Soon."],
    mikhas: ["Ящики — до мене.", "Crates, come to me."],
    sonia: ["Я вже рахую.", "I'm already counting."],
    kria: ["Підлога, тримайся. Я йду.", "Floor, brace yourself. I'm coming."],
    zhuzha: ["Хто тут без смаку? Усі? Чудово.", "Who here has no taste? Everyone? Wonderful."],
    leo: ["Збираємось на нараду. Вона коротка. Це жарт.", "Let's gather for a meeting. It's short. That's a joke."],
    pao: ["Вітаю. Я принесла плакати.", "Hello. I brought posters."],
    murzyk: ["Нічого не чіпав. Ще.", "Haven't touched anything. Yet."],
    toma: ["Я прийшов. Склад чекає.", "I've arrived. The stockroom is waiting."],
    shnyr: ["Я тут. Руки на видноті. Обіцяю.", "I'm here. Hands in plain sight. Promise."],
    nara: ["Чай уже заварюється. Сідайте.", "The tea is already steeping. Sit down."]
  };
  const RET = {
    uk: ["{0} повернувся. Лише капелюх інший.", "{0}: знову в штаті, і вже все знає.", "{0} каже, що нічого не змінилося. Окрім усього.", "{0} впізнає вулицю, але не вивіску."],
    en: ["{0} is back. Only the hat is different.", "{0}: back on staff, and already knows everything.", "{0} says nothing has changed. Except everything.", "{0} recognises the street, but not the sign."]
  };
  const MILE = {
    uk: ["{0}: рівень {1}. Помітно виріс. Хоч би знати, на скільки.", "{0}: рівень {1}. Зарплата та сама, посмішка ширша.", "{0}: рівень {1}. Тепер ще впевненіше робить те саме.", "{0}: рівень {1}. Колеги кивають. Це майже оплески."],
    en: ["{0}: level {1}. Visibly grown. If only we knew by how much.", "{0}: level {1}. Same pay, wider smile.", "{0}: level {1}. Now does the same thing with more confidence.", "{0}: level {1}. Colleagues nod. That's almost applause."]
  };
  // Загальні репліки епох (каже будь-хто з команди приблизно кожну третю фразу), по 6 на епоху 0–7; Японія (8) лишається в 276_japan_text
  const EPS = {
    uk: [
      ["Пахне воском і свіжим хлібом. Затишно.", "Хтось знову малює на стіні. Кажуть, мистецтво.", "Гільдія купців схвалила наші ціни. Чи принаймні мовчить.", "Тут усе пишуть пером. Чеки досі пахнуть чорнилом.", "Тут би гобелен — і був би справжній палац.", "Хтось грає на лютні під вікном. Фальшивить, але з душею."],
      ["Радіо грає й шипить водночас. Таке воно, ретро.", "Над дахами знову дирижабль. Мабуть, везе знижки.", "Молочний коктейль — і день удався.", "Кіно за копійку? Беру два квитки.", "Касету перемотую олівцем. Дідусь теж так робив.", "Пастельні кольори — найкращі кольори. Не сперечайтесь."],
      ["Дзеркальна куля знову підморгує. Хтось танцює без музики?", "Платформи на підборах, а ціни вищі. Закономірність.", "Ритм такий, що прилавки трохи танцюють.", "Блискітки — не бруд. Це стиль. Кря вже знає.", "Диско не вмерло, воно просто на касі.", "Раз, два, три... знижка!"],
      ["Ще одна монетка — і новий рівень. Я знаю, що кажу.", "Автомати блимають. Серце теж. У ритм.", "Рекорд на табло? Це не я. Це Шнирь. Знову.", "Тут у кожного по три життя. Хтось уже використав друге.", "Піксель — це маленька цеглинка щастя.", "Чую «пінг» і біжу. Навіть коли не мені."],
      ["Сигнал є, а толку нема. Класика.", "Ця вкладка п’ять років чекає, що я її закрию.", "Дрон пролетів над вухом. Привітався. Я підстрибнув.", "Хтось знову виклав фото їжі. Моє печиво, до речі.", "Пароль «1234» — це не пароль, а прохання.", "Wi-Fi ловить усюди, крім мого настрою."],
      ["Вітряк крутиться, лампа світить. Тихо, чисто, приємно.", "Бджола гуде над вухом. Це не напад, це розмова.", "На даху щось росте. Ніхто не пам’ятає, хто це садив.", "Чай із м’ятою з власного балкона. Це розкіш.", "Сонце гріє безкоштовно. Дивно, що раніше ніхто не здогадався.", "Велосипеди тут дзвенять, а не гудуть. Люблю."],
      ["Зорі сьогодні близько. Можна ледь не торкнутись.", "Скафандр гріє, вітрина холодить. Збалансовано.", "Тут усе трохи легше. Навіть ціни.", "Підстрибнеш — повиснеш на секунду. Не перевіряв. Багато разів.", "Ракета шумить, але вже не лякає. Звикли.", "Зі станції видно ціле місто. Воно маленьке й світиться."],
      ["Вивіска блимає. Здається, нагадує, що я не їв.", "Місто не спить. Я, мабуть, теж.", "У цій тіні ліхтар світить яскравіше за день.", "Рожевий і бірюзовий — єдина палітра, яка нам потрібна.", "Таксі пролетіло над головою. Глянув — і вже запізнився.", "Дощ тут світиться. Тому не заважає."]
    ],
    en: [
      ["Smells of wax and fresh bread. Cosy.", "Someone's painting on the wall again. They call it art.", "The merchants' guild approved our prices. Or at least kept quiet.", "Everything is written with a quill here. Receipts still smell of ink.", "A tapestry here and it'd be a real palace.", "Someone's playing a lute under the window. Off-key, but with feeling."],
      ["The radio plays and hisses at once. That's retro.", "A blimp above the roofs again. Probably carrying discounts.", "A milkshake and the day is made.", "A movie for a penny? Two tickets, please.", "I rewind the tape with a pencil. Grandpa did too.", "Pastel colours are the best colours. Don't argue."],
      ["The mirror ball winks again. Is someone dancing without music?", "Platform shoes and higher prices. There's a pattern.", "The beat is so strong the counters are almost dancing.", "Glitter isn't dirt. It's style. Kria knows.", "Disco isn't dead, it's just at the till.", "One, two, three... discount!"],
      ["One more coin and a new level. I know what I'm talking about.", "The machines blink. So does my heart. In rhythm.", "A new record on the board? Not me. Shnyr. Again.", "Everyone here has three lives. Someone's already used the second.", "A pixel is a little brick of happiness.", "I hear a ping and run. Even when it isn't for me."],
      ["There's a signal, but no use. Classic.", "This tab has been waiting five years for me to close it.", "A drone flew by my ear. Said hi. I jumped.", "Someone posted a photo of food again. My cookie, by the way.", "The password “1234” isn't a password, it's a request.", "Wi-Fi reaches everywhere except my mood."],
      ["The windmill turns, the lamp glows. Quiet, clean, nice.", "A bee buzzes by my ear. Not an attack, a conversation.", "Something is growing on the roof. Nobody remembers who planted it.", "Mint tea from my own balcony. That's luxury.", "The sun warms for free. Strange nobody thought of it earlier.", "Bicycles here ring, not roar. I love it."],
      ["The stars are close tonight. You can almost touch them.", "The spacesuit warms, the window cools. Balanced.", "Everything is a bit lighter here. Even the prices.", "If you jump, you hang for a second. Haven't checked. Many times.", "The rocket roars but no longer scares us. We got used to it.", "From the station you can see the whole city. It's small and glowing."],
      ["The sign flickers. I think it's reminding me I haven't eaten.", "The city doesn't sleep. Neither do I, probably.", "In this shade a lamp shines brighter than daylight.", "Pink and turquoise are the only palette we need.", "A taxi flew overhead. One glance and I'm already late.", "The rain glows here. So it doesn't bother me."]
    ]
  };
  // «Холодні» репліки (зима), стиль B: по 3 на героя і Капі.
  const COLD = {
    spike: {
      uk: ["Монети в голках покрились памороззю. Рахувати тепер холодно й дзвінко.", "Зоя пов’язала мені шарфик на одну голку. Решті доведеться терпіти.", "Зимою тепла лише та частина каси, на якій лежить моя лапа."],
      en: ["The coins in my quills are frosted. Counting is cold and jingly now.", "Zoya tied a scarf onto one of my quills. The rest will have to cope.", "In winter only the part of the till under my paw stays warm."]
    },
    bodya: {
      uk: ["Дошки на морозі співають. Ніхто не просив, а виходить як оркестр.", "Михась приніс ящики, і від них пахне снігом. Поставлю біля печі, хай оживуть.", "Мрію про майстерню з камінком. Креслення є, на серветці з-під чаю."],
      en: ["Planks sing in the frost. Nobody asked, yet it sounds like an orchestra.", "Mikhas brought crates and they smell of snow. I'll put them by the stove to wake up.", "I dream of a workshop with a fireplace. The plans exist, on a tea napkin."]
    },
    zoya: {
      uk: ["У вітрині іній малює візерунки. Це конкуренція, і вона гарна.", "Вушка змерзли, а настрій рожевий. Шапку б ще, теж рожеву.", "Жужа каже, що шарф — це аксесуар. Я кажу: порятунок, просто гарний."],
      en: ["Frost draws patterns on the window. That's competition, and it's pretty.", "My ears are frozen but my mood is pink. A hat would help, a pink one.", "Zhuzha says a scarf is an accessory. I say it's a rescue, just a pretty one."]
    },
    tonya: {
      uk: ["Я повільна, а холод ще повільніший. Нарешті є з ким змагатися.", "У панцирі тепло. Решта мають кишені, нехай заздрять.", "Сто сорок зим бачила ця крамниця. Ця чомусь холодніша. Чи я старша."],
      en: ["I'm slow and the cold is even slower. At last, someone to race.", "It's warm in the shell. The others have pockets; let them envy me.", "This shop has seen a hundred and forty winters. This one feels colder. Or I'm older."]
    },
    mikhas: {
      uk: ["Я ведмідь, мені не холодно. Мені просто хочеться спати до весни.", "Ящики змерзлись у башту. Голка каже «архітектура». Я кажу «проблема».", "Мрію про барліг із мисочкою меду. Хоч би на зиму, хоч би тимчасово."],
      en: ["I'm a bear, I'm not cold. I just want to sleep until spring.", "The crates froze into a tower. Spike says \"architecture\". I say \"problem\".", "I dream of a den with a bowl of honey. Just for winter, just for now."]
    },
    sonia: {
      uk: ["Чорнило мерзне, цифри кострубаті. Баланс сходиться, але з іскрою.", "Лео каже «холод — це виклик». Я кажу «холод — це привід для пледа».", "Пір’я настовбурчила, стала втричі більша. Бухгалтерія мене не впізнає."],
      en: ["The ink is freezing, the numbers come out jagged. The balance adds up, with a spark.", "Leo says \"cold is a challenge\". I say \"cold is a reason for a blanket\".", "I puffed up my feathers and tripled in size. Accounting doesn't recognise me."]
    },
    kria: {
      uk: ["Швабра в обіймах криги. Рятую, як можу: калошами й щирим серцем.", "Жужа каже, що калоші — не зимове взуття. Для мене вони і літні, і зимові, і святкові.", "Мию підлогу, а вона одразу замерзає. Вічний блиск без зусиль."],
      en: ["The mop is in the ice's embrace. I rescue it as best I can: with galoshes and a sincere heart.", "Zhuzha says galoshes aren't winter boots. For me they're summer, winter and festive.", "I mop the floor and it freezes at once. Eternal shine, no effort."]
    },
    zhuzha: {
      uk: ["Шість шарів одягу — це не надмір, це стратегія.", "Мої лапки ще ніколи не були так далеко від калюжі. Сумую за нею.", "Кря не розуміє, чому шарфів має бути два. Це ж очевидно: один для стилю, другий для душі."],
      en: ["Six layers of clothing isn't excess, it's strategy.", "My feet have never been this far from a puddle. I miss it.", "Kria doesn't get why I need two scarves. It's obvious: one for style, one for the soul."]
    },
    leo: {
      uk: ["Холод — чудова нагода перенести мітинг на літо.", "Ефективність упала до нуля Цельсія. Це теж показник, між іншим.", "Вдягайтеся тепліше, команда. Це не порада, а ключовий показник."],
      en: ["The cold is a great chance to move the meeting to summer.", "Efficiency dropped to zero Celsius. That's a metric too, by the way.", "Dress warmer, team. Not advice, a key performance indicator."]
    },
    pao: {
      uk: ["Бамбук замерз. Це не тренд, а катастрофа, і я вже придумую рекламу.", "Новий слоган: «Купи шарф — отримай тепло». Зоя вже хоче відсоток.", "Мрію про мандарини й плед. І щоб хтось заплатив за цей плед."],
      en: ["The bamboo froze. It's not a trend, it's a disaster, and I'm already writing the ad.", "New slogan: \"Buy a scarf, get warmth\". Zoya already wants a cut.", "I dream of tangerines and a blanket. And someone else paying for the blanket."]
    },
    murzyk: {
      uk: ["Лапи примерзли до клавіатури. Нічого, друкую двома, решта чекає.", "Дроти взимку тендітні, як мої нерви. Обидва краще не чіпати.", "Холодно? Увімкніть обігрівач. Або мене: я гарячий, коли встигаю з релізом."],
      en: ["My paws froze to the keyboard. Fine, I type with two, the rest can wait.", "Wires in winter are fragile like my nerves. Best not to touch either.", "Cold? Turn on the heater. Or me: I run hot when a release is due."]
    },
    toma: {
      uk: ["Пам’ятаю, як було тепло. Це було в липні. Колись.", "Хобот замерз і став льодяником. Не пробуй, я вже пробував.", "Дякую тому, хто вкрив мене ковдрою. Я не забуду. Я взагалі нічого не забуваю."],
      en: ["I remember when it was warm. It was in July. Once.", "My trunk froze into a lollipop. Don't try it, I already did.", "Thanks to whoever covered me with a blanket. I won't forget. I never forget anything."]
    },
    shnyr: {
      uk: ["Я не мерзну. Я просто позичив шапку. Власнику вона вже не потрібна.", "Лапки мерзнуть, а в смітнику зимою тепліше. Це факт, не пропозиція.", "Голка тримає касу, я тримаю шарф. Він був нічий. Тепер мій."],
      en: ["I'm not cold. I just borrowed a hat. Its owner doesn't need it anymore.", "My paws are freezing, and the bin is warmer in winter. A fact, not a suggestion.", "Spike holds the till, I hold a scarf. It was nobody's. Now it's mine."]
    },
    capy: {
      uk: ["Сніг на дахах, а в мені ностальгія за літом і гарячою ванною.", "Холодно, але в крамниці гуде робота. Тепле слово теж гріє.", "Капібари взимку теж мріють. Я, наприклад, про гарячі джерела й тишу."],
      en: ["Snow on the roofs, and in me a longing for summer and a hot bath.", "It's cold, but the shop hums with work. A warm word helps too.", "Capybaras dream in winter too. Me, about hot springs and quiet."]
    }
  };
  ['uk', 'en'].forEach((lang, li) => {
    const T = translations[lang];
    Object.keys(COLD).forEach(id => {
      const pre = id === 'capy' ? 'capy_cold_' : 'team_' + id + '_cold_';
      COLD[id][lang].forEach((x, i) => { T[pre + i] = x; });
    });
    EPS[lang].forEach((arr, e) => arr.forEach((s, i) => { T['epoch_say_' + e + '_' + i] = s; }));
    Object.keys(L).forEach(id => {
      for (let i = 0; i < 16; i++) delete T['team_' + id + '_say_' + i];
      L[id][lang].forEach((s, i) => { T['team_' + id + '_say_' + i] = s; });
      T['team_' + id + '_hire'] = HIRE[id][li];
    });
    for (let i = 0; i < 16; i++) delete T['capy_say_' + i];
    CAPY[lang].forEach((s, i) => { T['capy_say_' + i] = s; });
    RET[lang].forEach((s, i) => { T['teamReturn_' + i] = s; });
    MILE[lang].forEach((s, i) => { T['teamUpMile_' + i] = s; });
    T.teamUpShort = lang === 'uk' ? '{0}: рівень {1}' : '{0}: level {1}';
  });
})();
