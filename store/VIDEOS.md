# Нові відео (раунд 60): 2 ролики YouTube 16:9 + 2 Shorts 9:16

Усе лежить у `previews/yt/` (не в git). Готові файли з музикою: `CapyTap_YT1_Seasons.mp4`, `CapyTap_YT2_Secrets.mp4`, `CapyTap_Short5_Metro.mp4`, `CapyTap_Short6_Halloween.mp4` (1080p, 60 к/с; YouTube 1920×1080, Shorts 1080×1920). Чернетки `*_draft.mp4` у публікацію не йдуть.

## Що в роликах (чого не було в трейлері, тизері й Shorts 1–4)
| Файл | Хвилин. | Що показує |
|---|---|---|
| YT1 «Seasons» | 46,9 с | літо → осінь → зима (вечір, гірлянди) → весна; Хелловін (ніч, привиди: Капі ловить їх); скіни погоди (веселка, блискавки, зіркові/цукрові/золоті хмари); дощ |
| YT2 «Secrets» | 46,9 с | 4 секрети: єнот-злодій (ловимо), Цирк Фортуни (колесо, джекпот), історії з діалогами героїв, газета від розробників |
| Short 5 «Metro» | 23 с | людина в метро нудьгує → бачить гру на телефоні → наближення до екрана → переверни телефон (горизонтальний режим) → картка «Як встановити» |
| Short 6 «Halloween» | 22,5 с | привиди → прилітає відьма з хаткою → гра з казанками → новий скін (відьомський Капі) |

## Про «живу людину в метро»
Знімати справжню людину я не можу, тому сцена метро намальована в коді (плоска ілюстрація: людина в навушниках, телефон, вікна з тунелем, що пролітає). Екран телефона = справжні кадри гри (так само, як у рекламі «зелений екран»: кадри гри вставлено в телефон, камера наближається до екрана, і гра розкривається на весь кадр; потім телефон перевертається, і екран перемикається на горизонтальну гру). Якщо захочеш справжнє відео: зніми людину з телефоном, а екран закрий зеленим кольором; я підставлю гру через ffmpeg `chromakey` (скажи, коли буде відео).

## Голос
Справжній людський голос записати я не можу (немає мікрофона), а голос ШІ ти просила не ставити. Тому ролики зараз БЕЗ голосу: підписи на екрані + музика (Shorts і так дивляться без звуку). Живий голос додається так:
1. Запиши кожну фразу з таблиць нижче на телефон (диктофон, тиха кімната, 2–3 дублі), збережи як файли з іменами в таблиці (mp3, wav або m4a) у папку `previews/voice/yt/`.
2. Скажи мені «змікшуй голос» (або запусти команду для ролика): музика сама тихішає під голосом.
Фраза не повинна бути довшою за «вікно» (це секунди від початку фрази до наступного кадру).

| Файл | З секунди | Вікно | Текст (англійською) |
|---|---|---|---|
| yt1_01 | 0,4 | 3,6 | One little shop... and every season changes everything. |
| yt1_02 | 4,4 | 3,8 | Golden autumn. |
| yt1_03 | 8,7 | 3,7 | Cozy, glowing winter nights. |
| yt1_04 | 12,9 | 3,7 | Blooming spring. |
| yt1_05 | 17,0 | 2,4 | And then... Halloween! |
| yt1_06 | 19,6 | 4,5 | Catch the ghosts before they vanish! |
| yt1_07 | 26,5 | 3,4 | Rainbows. Storms. Magic clouds. |
| yt1_08 | 30,6 | 4,5 | Weather skins for every mood. |
| yt1_09 | 39,8 | 6,5 | CapyTap: Market. Play it free: link in the description. |
| yt2_01 | 0,7 | 4,2 | Four secrets... you may have missed. |
| yt2_02 | 6,2 | 5,5 | A sneaky raccoon is robbing your shop! Tap him fast! |
| yt2_03 | 13,8 | 3,6 | The Circus of Fortune rolls into town. |
| yt2_04 | 19,0 | 4,8 | Spin the wheel... and win big! |
| yt2_05 | 27,7 | 5,5 | Every era has its own stories... and heroes. |
| yt2_06 | 36,4 | 2,8 | Plus mail from the developers! |
| yt2_07 | 39,8 | 6,5 | CapyTap: Market. Play it free: link below. |
| metro_01 | 0,3 | 1,8 | Another boring commute? |
| metro_02 | 2,2 | 2,6 | Not anymore. Tap, build, grow! |
| metro_03 | 5,2 | 2,8 | Build your shop in seconds. |
| metro_04 | 8,9 | 3,0 | Flip your phone for wide mode! |
| metro_05 | 14,1 | 5,2 | Open the link. Open the browser menu. Add to home screen. |
| metro_06 | 19,2 | 3,6 | CapyTap: Market. Free to play! |
| hw_01 | 0,3 | 1,6 | It's Halloween! |
| hw_02 | 1,7 | 4,2 | Catch the ghosts before they vanish! |
| hw_03 | 6,6 | 2,5 | The witch has arrived! |
| hw_04 | 9,2 | 5,5 | Watch the cauldrons... and pick the right one! |
| hw_05 | 15,2 | 2,5 | Pick one! |
| hw_06 | 18,0 | 2,3 | A brand-new skin! |
| hw_07 | 20,4 | 2,0 | CapyTap: Market. |

Мікс (з папки `previews/video`): `node mix_short.js ../yt/yt1_final.mp4 ../yt/yt1_mix.json ../yt/CapyTap_YT1_Seasons.mp4` (так само yt2, `metro_mix.json`, `hw_mix.json`; для Metro вхід — `short5_silent.mp4`, для Halloween — `hw_final.mp4`).

## Що показало дослідження ринку (коротко; джерела наприкінці)
- Shorts пролистують миттєво: ударну картинку й суть пропозиції дати в перші 3 с, перші 6 с — гачок; 10–30 с вертикально, звук увімкнено, «органічний» стиль.
- Для інді-ігор: дія в перші 2 с, без довгих логотипів; кращі ролики показують ядро гри; Shorts живуть місяцями (пошук), TikTok ~48 год: тому «як ...» й «секрети» краще за щоденні дев-логи.
- Тому: Metro стартує зі «POV» (впізнаваний формат) і за 1,4 с показує екран; YT2 — «4 секрети»; кожен ролик закінчується «Play free / link» і яскравою заставкою.
Джерела: [YouTube Shorts Ads Best Practices 2026](https://insense.pro/blog/youtube-shorts-ads-best-practices), [Google Ads: Shorts ads](https://support.google.com/google-ads/answer/16041697), [Gameplay in trailers](https://wnhub.io/news/analytics/item-237), [YouTube Shorts для інді](https://bugnet.io/blog/youtube-shorts-for-indie-game-marketing).

## Заголовки й описи для YouTube (чернетки; публікує користувачка)
Посилання: безкоштовна гра на телефоні й ПК (веб-версія) https://melxxx23.github.io/capy-through-time/ , сторінка на itch https://melxxxnika.itch.io/capytap-market . «Coming soon to Steam» — лише поки гра не вийшла.

### YT1 (16:9, 46,9 с)
TITLE: One tiny shop, FOUR seasons + HALLOWEEN 🎃❄️🌸 | CapyTap: Market (cozy pixel idle game)
DESCRIPTION:
```
Spring, summer, autumn, winter and a spooky Halloween: your tiny capybara shop looks different in every season! 🦫
Rainbows, storms, magic clouds, day & night, ghosts to catch... all in a free cozy pixel idle game.

▶ PLAY FREE (phone & PC, in your browser): https://melxxx23.github.io/capy-through-time/
▶ itch.io: https://melxxxnika.itch.io/capytap-market
Coming soon to Steam.

📱 HOW TO INSTALL ON YOUR PHONE (30 seconds, no store needed):
1) Open the link above in Chrome (Android) or Safari (iPhone).
2) Android: tap the menu ⋮ → "Install app" / "Add to Home screen". iPhone: tap Share → "Add to Home Screen".
3) Tap the new CapyTap icon and play, even offline!

0:00 Summer · 0:04 Autumn · 0:08 Winter · 0:13 Spring · 0:17 Halloween · 0:26 Weather skins · 0:39 CapyTap: Market

#capytap #idlegame #cozygames #pixelart #halloween #capybara
```
TAGS: capybara, pixel art, idle game, cozy game, clicker game, halloween game, seasons, browser game, free game, mobile game

### YT2 (16:9, 46,9 с)
TITLE: 4 SECRETS in this cozy pixel idle game you missed 🦫 (raccoon thief, Circus of Fortune...)
DESCRIPTION:
```
A sneaky raccoon, a Circus of Fortune that rolls into town, heroes with their own stories and a newspaper from the developers: 4 secrets in CapyTap: Market! 🦫
Free cozy pixel idle game for phone and PC.

▶ PLAY FREE: https://melxxx23.github.io/capy-through-time/
▶ itch.io: https://melxxxnika.itch.io/capytap-market
Coming soon to Steam.

📱 Install on your phone: open the link in Chrome/Safari → menu (⋮ or Share) → "Add to Home screen".

0:00 Intro · 0:06 Secret #1: the raccoon thief · 0:13 Secret #2: Circus of Fortune · 0:26 Secret #3: stories & heroes · 0:35 Secret #4: mail from the devs

#capytap #idlegame #cozygames #pixelart #secrets #capybara
```
TAGS: capybara, idle game secrets, pixel art, cozy game, clicker game, circus, raccoon, browser game, free game, hidden features

### Short 5 «Metro» (23 с)
TITLE: POV: your boring commute 📱 → play this cozy game (free, how to install) #shorts
DESCRIPTION:
```
Turn any commute into a cozy shop empire! 🦫 Flip your phone for wide mode too.

HOW TO GET IT ON YOUR PHONE (free, 30 seconds):
1) Open https://melxxx23.github.io/capy-through-time/ in Chrome or Safari
2) Menu ⋮ (Android) or Share (iPhone) → "Add to Home Screen"
3) Tap the CapyTap icon. Done!
Also on itch.io: https://melxxxnika.itch.io/capytap-market

#shorts #idlegame #cozygames #pixelart #mobilegame #capybara
```
TAGS: pov, commute game, mobile game, idle game, cozy game, pixel art, capybara, free game, how to install, add to home screen

### Short 6 «Halloween» (22,5 с)
TITLE: Catch the ghosts 👻 + the witch's cauldron game 🎃 #shorts #halloween
DESCRIPTION:
```
Halloween event in CapyTap: Market! Catch the ghosts, meet the witch and win a new skin for Capi 🦫🎃
Free cozy pixel idle game: https://melxxx23.github.io/capy-through-time/
Install on phone: open the link → menu (⋮ / Share) → "Add to Home screen".
itch.io: https://melxxxnika.itch.io/capytap-market

#shorts #halloween #idlegame #cozygames #pixelart #capybara
```
TAGS: halloween game, ghosts, witch, cauldron game, idle game, cozy game, pixel art, capybara, free game

Налаштування під час завантаження: видимість — спершу Приватне; «Чи це для дітей»: рішення за користувачкою (не обирати автоматично). Хелловінне відео має сенс виставити до 31 жовтня.

## Steam (що підготовлено)
- Картинки й 9 скріншотів уже були в `previews/steam/ready/` (див. `store/STEAM.md`); додано нові чисті скріншоти пір року (раунд 60): `previews/steam/ready/screenshots/10_halloween.png` … (якщо файли є).
- Тексти сторінки на 6 мов: `store/STEAM_LANGS.md` (pt-BR, es, it, pl + рядок про мови для uk/en).
- Трейлер: `previews/video/out/CapyTap_trailer_final_1080p.mp4` (≈79 с, з музикою, без голосу). Голос ElevenLabs/живий для нього ще чекає (`store/TRAILER.md`).
