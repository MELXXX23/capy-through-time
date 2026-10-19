# PROGRESS — CapyTap: Market

Тут лише ОСТАННІ раунди (максимум 6 пунктів). Старі: `archive/PROGRESS_*.md` (не читай без потреби; шукай через Grep). Новий пункт додавай у кінець, коротко (до ~8 рядків); ротація: `node tools/progress_rotate.js`.

## 124. itch.io: опис, тема, банер, Embed BG (р. 58, у Chrome користувачки; нічого не закомічено в гру)
- Підготовлено в редакторах itch, Save натискає користувачка: форма «Edit game» (новий опис EN+UK з перевіреними фактами: 9 епох, 8 бонус-ігор, 64 скіни, 13 помічників; підпис «9 eras») і «Edit theme» (Renaissance terracotta: bg #2b1a14, bg2 #4a2c1f, text #f6e7d0, link #8fd0ff, headers #f2c46b, buttons #c8553a; банер 1800×600 з Фудзі й драконом; Embed BG 1600×900). Space night уже збережено на живій сторінці, її замінить Renaissance після Save.
- Файли в `previews/itch/ready/` (не в git): cover_bigcapy, banner_fuji_dragon_1800x600, embed_bg_1600x900, capytap_build.gif. Скрипти: `previews/itch/{cover_big,banner,embed_bg}.js` (знімає `previews/itch/shots.js`), `serve_dir.js` (локальна роздача для завантаження в форми через fetch). Текст опису — `store/itch_description.html`.
- Обкладинка bigcapy і GIF уже збережені на itch (12 скрінів, GIF першим).

## 125. itch.io: повний прохід по вкладках дашборда (р. 58; у Chrome користувачки, у гру нічого не змінено)
- Metadata (збережено): Input methods + Mouse + Keyboard; Languages English + Ukrainian; External links: Homepage = сайт GitHub Pages. Release info/ліцензії залишені «No license» (комерційна гра); Engines & tools — у базі немає підходящого.
- Promo images (збережено, 4 шт., знімає `previews/itch/promo.js` зі steam-зображень; `previews/itch/ready/`): social 1200×630, favicon 512, wide cover 21:9 (2100×900), logo прозорий PNG.
- Перевірено: сторінка Published, тема Renaissance + банер застосовані, оцінки й коментарі увімкнені, відео-трейлер є, 0 оцінок. Девлог — після нового ZIP (на «публікуй»).

## 126. Випуск: злиття android-wrapper у main, сайт і новий ZIP для itch (р. 58)
- `git merge --no-ff android-wrapper` у main (мітка `before-itchrelease` = main до злиття); `docs/privacy.html` повернуто як у main (без реклами). autotest --quick ✓. Коміт 660ec9c, push, сайт оновився (~2 хв).
- ZIP: `desktop/dist/CapyTapMarket-itch-html.zip` = `docs/` без `sw.js` (PowerShell ZipFile з `/` у шляхах; tar з Git Bash дає не-zip). На itch завантажено через Edit game → Uploads (файл з тією ж назвою замінив старий, 700 КБ), «played in browser» увімкнено, Save; гра на сторінці запускається. Кнопка оцінки видна лише всередині itch.
- Девлог опубліковано на itch (https://melxxxnika.itch.io/capytap-market/devlog/1716496), тип «Major update», EN, коментарі увімкнені. exe на столі не оновлювався.

## 127. Правки р. 59: істоти +10%, замок Хелловіну, погода у скінах, бонус-ігри на всю рамку (не закомічено; мітка відкату `before-tweaks59`)
- Істоти епох у полюванні (`CREATURE_SCALE` 1.1 у `220_d_night_garlands_halloween.js`): малюнок і зона тапу на 10% більші; привиди Хелловіну без змін.
- Пора року «Хелловін» у налаштуваннях: замок (як в інших) до проходження 5 епохи (`seasonPickLocked`/`seasonLockText`, `200_a`; тост «Необхідно пройти 5 епоху»). «Авто» за датою не змінено.
- Скіни → Погода: «діамантова хмара» додана в `WEATHER_ORDER` (стояла одразу після «звичайного», тепер після зоряної, серед хмар).
- Бонус-ігри епох: без клоуна й вікна з фоном; модалка клас `mg` (`024_style_modal_phone.css`), поле гри ~612 px на ПК, на всю ширину рамки на телефоні. Старі ігри Цирку/Баби/Локшини не чіпав.
- autotest --quick ✓; бекап `game.html` не створено (cp заблоковано), відкат — `git reset --hard before-tweaks59`.
