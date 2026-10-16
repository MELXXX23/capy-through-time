# PROGRESS — CapyTap: Market

Тут лише ОСТАННІ раунди (максимум 6 пунктів). Старі: `archive/PROGRESS_*.md` (не читай без потреби; шукай через Grep). Новий пункт додавай у кінець, коротко (до ~8 рядків); ротація: `node tools/progress_rotate.js`.

## 106. Y1 і S2 у чернетках YouTube (р. 56)
- Видалено S1_v2 і S3_v2; у чернетки (приватні) завантажено `CapyTap_Y1_time_travel_v2.mp4` («I Time-Traveled a Capybara's Shopping Mall Through 9 Eras (Idle Game)», мініатюра `thumb_Y1_time_travel.png`, опис із посиланням і хештегами) і `CapyTap_S2_nine_eras.mp4` («Same mall, nine eras. Which one is yours?», вкладка Shorts).
- Не заповнено: «Аудиторія» (призначене для дітей?) — рішення користувачки; публікація й видимість не чіпані.

## 107. Оновлення ПК, сайту й ZIP (р. 56)
- Сайт (GitHub Pages) байт у байт збігається з `docs/index.html` (bc3c5a9), політика відкривається; ZIP для itch (`desktop/dist/CapyTapMarket-itch-html.zip`, 711 КБ) зібраний із цього ж файлу, перезавантажувати не треба. Код гри після випуску не змінювався.
- exe: зібрано заново з bc3c5a9 (режим бога, п. 100–102) за рецептом із HANDOFF (кеш `previews/ebcache`), скопійовано на стіл як `D:\DESKTOP\CapyTapMarket-Portable-NEW.exe` (71,5 МБ); `desktop/app/game.html` повернуто без режиму бога.

## 108. Очищення відео й скрінів (р. 56)
- За списком `previews/r57/cleanup_plan.md` видалено 37 відео (862 МБ) і 1329 робочих картинок у `previews/` (≈167 МБ): ~1 ГБ звільнено. Лишились відео: Y1_v2, S2, трейлер YouTube `CapyTap_trailer_r53_16x9_web.mp4`, TikTok-трейлер v2; картинки: `previews/itch`, `r53/itch_upload|yt3|thumb`, `r56/itch_upload`, `r57/vid/out/final`, банер, `skins`.
- Побічне: кадри для банера (`previews/r57/eras`) видалено — банер зберігся, а скрипт `previews/r57/banner.js` без них не запуститься (кадри відтворюються `previews/r57/eras.js`).

## 109. Android-обгортка і публічний exe (р. 57, гілка android-wrapper, мітка before-android)
- `mobile/`: Capacitor піднято 6 → 8 (Play з 31.08.2026 вимагає targetSdk 36); створено `mobile/android/` (targetSdk 36, minSdk 24, плагіни App/Haptics/Preferences), іконки зі `store/icons/android`, фон `#2E4580`. Не зібрано: на ПК нема Android Studio/JDK; AAB ще не будувався.
- `desktop/build-public.sh` — публічний exe БЕЗ режиму бога (перевіряє, що прапорців нема в app/game.html); не запускався.
- Далі: акаунт Play ($25) → Android Studio → підписаний AAB → закритий тест 12×14 днів; потім AdMob/«Без реклами» (гра для всіх віків → неперсоналізована реклама, Families).
