# PROGRESS — CapyTap: Market

Тут лише ОСТАННІ раунди (максимум 6 пунктів). Старі: `archive/PROGRESS_*.md` (не читай без потреби; шукай через Grep). Новий пункт додавай у кінець, коротко (до ~8 рядків); ротація: `node tools/progress_rotate.js`.

## 121. iPhone 17 Pro (Dynamic Island), вертикаль у програмі з головного екрана (р. 57, гілка android-wrapper; не опубліковано)
- Причина: помилка iOS 26.x у WebKit (301994 повернулась на 26.5.2): `env(safe-area-inset-top)`=0, а зверху або системна смуга ~62 px (вікно коротше за екран), або вміст під островом.
- `010_head.html` `iosFit()` міряє це в standalone-портреті: `sysbar` (екран−вікно 40–90 px, env=0) → висота = `innerHeight` (`--vhpx`); `satfix` (вікно = екран, env=0, ширина 393/402/420/430/440) → запасний відступ `--sat` 54/62 px для лічильника монет і «Пропустити». Горизонталь і 13 Pro (env>0) не змінено. Для тесту: `game.html?standalone=1`.
- Знімки й скрипти: `previews/ios17/` (shot.js, montage.js). Користувачка схвалила знімок «варіант 2 після». На справжньому iPhone ще не перевірено: діагностика = 5 швидких дотиків по лічильнику монет.
- Результат на телефоні (17 Pro): смуга зверху лишилась — це варіант 1 (системна, iOS 26). Далі: скрін діагностики (`fit`), спроба без `black-translucent` + `theme-color` під небо (перевстановити іконку); повний екран можливий лише в iOS-застосунку.

## 122. iPhone 17 / Air: спроба прибрати чорну смугу зверху (р. 57, гілка android-wrapper; не закомічено, не опубліковано)
- `010_head.html`: після мета-тегів маленький скрипт — лише для iPhone з екраном 402/420/440 pt (17 Pro, Air, 17 Pro Max): `apple-mobile-web-app-status-bar-style` = `default` замість `black-translucent`, `theme-color` = `#2E4580` (небо). Інші iPhone без змін. Клас `ios26bar` на `<html>`.
- Діє лише після видалення й повторного додавання іконки на головний екран. На справжньому iPhone не перевірено; autotest --quick ✓. Відкат: `git reset --hard before-ios26bar` (або `git checkout 010_head`).

## 123. itch.io: обкладинки, GIF, девлог, кнопка оцінки (р. 58, гілка android-wrapper; не опубліковано)
- Аналітика itch: 166 показів → 29 переглядів (CTR 1,2%) → 8 запусків; 0 оцінок. Готово в `previews/itch/ready/` (не в git): 2 обкладинки 1260×1000 (`cover_bigcapy`, `cover_mall`; скрипт `previews/itch/cover_big.js`, зум світу на Капі), GIF росту крамнички 2,7 МБ (з фінального трейлера).
- `src/275_z_itch_rate.js`: кнопка «⭐ Оціни гру на itch.io» у налаштуваннях і одна тост-підказка за ~10 хв гри — ЛИШЕ на домені itch.io/itch.zone (тест: `?itch=1`). autotest --quick ✓.
- `store/ITCH_DEVLOG.md`: текст девлогу uk/en і список дій. Девлог постити після завантаження нового ZIP на itch.

## 124. itch.io: опис, тема, банер, Embed BG (р. 58, у Chrome користувачки; нічого не закомічено в гру)
- Підготовлено в редакторах itch, Save натискає користувачка: форма «Edit game» (новий опис EN+UK з перевіреними фактами: 9 епох, 8 бонус-ігор, 64 скіни, 13 помічників; підпис «9 eras») і «Edit theme» (Renaissance terracotta: bg #2b1a14, bg2 #4a2c1f, text #f6e7d0, link #8fd0ff, headers #f2c46b, buttons #c8553a; банер 1800×600 з Фудзі й драконом; Embed BG 1600×900). Space night уже збережено на живій сторінці, її замінить Renaissance після Save.
- Файли в `previews/itch/ready/` (не в git): cover_bigcapy, banner_fuji_dragon_1800x600, embed_bg_1600x900, capytap_build.gif. Скрипти: `previews/itch/{cover_big,banner,embed_bg}.js` (знімає `previews/itch/shots.js`), `serve_dir.js` (локальна роздача для завантаження в форми через fetch). Текст опису — `store/itch_description.html`.
- Обкладинка bigcapy і GIF уже збережені на itch (12 скрінів, GIF першим).
