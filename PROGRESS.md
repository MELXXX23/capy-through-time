# PROGRESS — CapyTap: Market

Тут лише ОСТАННІ раунди (максимум 6 пунктів). Старі: `archive/PROGRESS_*.md` (не читай без потреби; шукай через Grep). Новий пункт додавай у кінець, коротко (до ~8 рядків); ротація: `node tools/progress_rotate.js`.

## 105. Шість відео для YouTube і Shorts/TikTok (р. 56)
- Лишено в `previews/r57/vid/out/final/` (за вибором користувачки): YouTube — `CapyTap_Y1_time_travel_v2.mp4` (1:35, одна музика без ефектів); Shorts/TikTok 1080×1920 — `CapyTap_S1_one_coin_v2.mp4`, `CapyTap_S2_nine_eras.mp4`, `CapyTap_S3_satisfying_builds_v2.mp4` (v2 = одна музика без ефектів); мініатюри `thumb_Y*.png` не чіпано. Y2, Y3 і перші версії видалено (відтворюються з `gen.js`). Назви/описи — `previews/r57/vid/metadata.txt`.
- Збірка: `previews/r57/vid/gen.js` → `build.js` → запис `previews/video/rec.js` (скрипти `run_all.sh`, `compress.sh`, `thumb.js`). Код гри не чіпав; на YouTube/TikTok не завантажено.
- Підводне: Y2 з першого разу записався з 52 кадрами (завис насос кадрів), повторний запис вийшов нормально; підписи мають темну підкладку (`capB`), бо на світлих епохах не читалися.

## 106. Y1 і S2 у чернетках YouTube (р. 56)
- Видалено S1_v2 і S3_v2; у чернетки (приватні) завантажено `CapyTap_Y1_time_travel_v2.mp4` («I Time-Traveled a Capybara's Shopping Mall Through 9 Eras (Idle Game)», мініатюра `thumb_Y1_time_travel.png`, опис із посиланням і хештегами) і `CapyTap_S2_nine_eras.mp4` («Same mall, nine eras. Which one is yours?», вкладка Shorts).
- Не заповнено: «Аудиторія» (призначене для дітей?) — рішення користувачки; публікація й видимість не чіпані.

## 107. Оновлення ПК, сайту й ZIP (р. 56)
- Сайт (GitHub Pages) байт у байт збігається з `docs/index.html` (bc3c5a9), політика відкривається; ZIP для itch (`desktop/dist/CapyTapMarket-itch-html.zip`, 711 КБ) зібраний із цього ж файлу, перезавантажувати не треба. Код гри після випуску не змінювався.
- exe: зібрано заново з bc3c5a9 (режим бога, п. 100–102) за рецептом із HANDOFF (кеш `previews/ebcache`), скопійовано на стіл як `D:\DESKTOP\CapyTapMarket-Portable-NEW.exe` (71,5 МБ); `desktop/app/game.html` повернуто без режиму бога.

## 108. Очищення відео й скрінів (р. 56)
- За списком `previews/r57/cleanup_plan.md` видалено 37 відео (862 МБ) і 1329 робочих картинок у `previews/` (≈167 МБ): ~1 ГБ звільнено. Лишились відео: Y1_v2, S2, трейлер YouTube `CapyTap_trailer_r53_16x9_web.mp4`, TikTok-трейлер v2; картинки: `previews/itch`, `r53/itch_upload|yt3|thumb`, `r56/itch_upload`, `r57/vid/out/final`, банер, `skins`.
- Побічне: кадри для банера (`previews/r57/eras`) видалено — банер зберігся, а скрипт `previews/r57/banner.js` без них не запуститься (кадри відтворюються `previews/r57/eras.js`).
