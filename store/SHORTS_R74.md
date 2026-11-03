# Медіа р. 74: скріни й гіфки itch, 5 роликів Shorts/TikTok (2026-11-02)

Файли не в git (папка `previews/`). Усе англійською, зі свіжої збірки (коміт 0dacd2c, включно з ще не випущеною меншою карткою рівня; у кадрах вона вимкнена).

## Де лежить
- Скріни ПК, 1920×1080, пікселі рівні: `previews/itch/r74/screens_pc/` (16 шт., номер = порядок на сторінці).
- Скріни телефона, 975×2110 (itch приймає зображення до 3840×2160): `previews/itch/r74/screens_phone/` (5 шт.).
- Гіфки, кожна до 3 МБ (ліміт itch): `previews/itch/r74/gifs/` (7 шт.).
- Ролики 1080×1920, 60 к/с, −14 LUFS: `previews/shorts/out_r74/*.mp4`, поруч обкладинки `*_cover.png`. На YouTube 5 чернеток (канал CapyTap Games, вкладка Shorts) з назвами й описами, 3.11; «Аудиторію» й публікацію робить сам користувач. У TikTok не викладено.

## Порядок на itch
Залито 2026-11-03, 28 нових стоять першими, у такому порядку: `01_japan_dragon`, `capytap_build.gif`, `02_capy_closeup`, `capytap_eras.gif`, `05_time_travel`, `capytap_skins.gif`, `06_disco`, `capytap_dragon.gif`, `08_neon_mall`, `capytap_seasons.gif`, `11_skins`, `capytap_tap.gif`, `03_renaissance_mall`, `04_building`, `capytap_time_travel.gif`, `07_arcade`, `09_space`, `10_japan_shop`, `12_autumn`, `13_winter`, `14_spring_trees`, `15_retro`, `16_eco`, далі 5 телефонних. Нижче лишаються 11 старих: їх видаляє сам користувач (Edit game → Screenshots → Delete), копії старих скрінів у `previews/itch/r69_en/`, стара гіфка в `previews/itch/ready/`.

## Як зібрати заново
1. Скріни: `node previews/itch/r74/run_shots.js` (сценарії `shots_pc.js`, `shots_phone.js`).
2. Сценарії: `node previews/shorts/mkscn.js`.
3. Гіфки: `node previews/shorts/render.js gif 7 g1_build g2_eras g3_warp g4_skins g5_seasons g6_dragon g7_tap`, далі `node previews/shorts/mkgif.js`.
4. Ролики: `node previews/shorts/render.js final 2 sa_build sb_eras sc_skins sd_japan se_seasons`, далі `node previews/shorts/mix.js final`. Швидка перевірка кадрів: режим `check` (360 px, 15 к/с).

## Що важливо знати для запису
- Масштаб сцени гра міняє з кожним рівнем (`layoutScene`, `snapK`), тому будування міняє весь кадр. Для запису `snapK` підмінено на сталу (`PREP` у `mkscn.js`).
- 800×450 при `CAPY_Z=0.625` і `snapK=1`: піксель гри = піксель гіфки. ПК при `CAPY_Z=1.5`: рівні 5–6 і рівень 3 мають цілий масштаб. Телефон 390×844 при `CAPY_Z=3`: цілий масштаб.
- Вертикальний кадр записується 360×706 css: нижні 66 css — кнопки гри, `mix.js` їх відрізає.
- Запущені з Electron програми потребують `windowsHide: true`, інакше на столі вискакують чорні вікна.

## Тексти
Посилання в усіх описах: гра https://melxxx23.github.io/capy-through-time/ · itch https://melxxxnika.itch.io/capytap-market
На екрані написано LINK IN BIO: посилання треба поставити в профіль TikTok і в опис каналу YouTube.

Обов'язковий підпис музики (CC BY 4.0), підставити назву треку:
> Music: "<назва>" Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License. http://creativecommons.org/licenses/by/4.0/

### A. CapyTap_Short_TinyShop_to_Mall (20,5 с, музика «Nowhere Land»)
- YouTube: This tiny shop becomes a MALL 🏬 Satisfying pixel build #shorts
- TikTok: This tiny shop becomes a mall 🏬 Free cozy pixel game, link in bio #idlegame #pixelart #cozygames #capybara #indiegame
- Опис YouTube: Tap, build, grow! From a tiny corner shop to a mighty mall in CapyTap: Market, a cozy pixel-art idle tycoon with a capybara in charge. Play free in your browser (link below).

### B. CapyTap_Short_One_Shop_Nine_Eras (19 с, музика «Nowhere Land»)
- YouTube: One shop. Nine eras. ⏳ Time travel in a cozy pixel game #shorts
- TikTok: One shop, nine eras ⏳ Which one is your favorite? Free game, link in bio #timetravel #pixelart #idlegame #cozygames #indiegame
- Опис YouTube: Retro, disco, arcade, internet, eco, space, neon... and one secret era. Build your shop, then travel through time in CapyTap: Market. Play free in your browser.

### C. CapyTap_Short_Which_Capy_Are_You (19 с, музика «Nowhere Land»)
- YouTube: Which capy are you? 🦫 Comment your pick! #shorts
- TikTok: Which capy are you? 🦫 Comment your pick! Free game, link in bio #capybara #pixelart #cozygames #idlegame #cute
- Опис YouTube: Pirate, astronaut, wizard, knight, chef, viking, fairy or golden? Dress up Capy, then pave the streets with gold in CapyTap: Market. Play free in your browser.

### D. CapyTap_Short_Secret_Era_Japan (16,5 с, музика «Kawai Kitsune»)
- YouTube: There is a secret era in this game... 🐉🗻 #shorts
- TikTok: There's a secret era in this game 🐉🗻 Can you find it? Link in bio #japan #dragon #pixelart #cozygames #indiegame
- Опис YouTube: Beyond the eight eras of time there is one more: Japan, with Mount Fuji, sakura and dragons. Can you find it? CapyTap: Market, play free in your browser.

### E. CapyTap_Short_One_Street_One_Year (17 с, музика «Inspired»)
- YouTube: One street. One year. 🌸☀️🍂❄️ Relaxing pixel art #shorts
- TikTok: One street, one year 🌸☀️🍂❄️ Relax, tap, build. Free game, link in bio #cozygames #pixelart #relaxing #seasons #idlegame
- Опис YouTube: Spring blossoms, summer sun, autumn leaves, winter snow. Relax, tap and build in CapyTap: Market, a cozy pixel-art idle tycoon. Play free in your browser.

## Чесно про монтаж
Будування в роликах прискорені (×3,1), у гіфці ×6,5. Дракон на скрінах і в роликах намальований поверх сцени тим самим спрайтом, що в грі, але більший. Камера й підписи додані для запису, інтерфейс гри в більшості кадрів сховано.
