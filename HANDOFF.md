# Передача між чатами (оновлюй перед кожним переходом; тримай ≤ 40 рядків)

Читай: `CLAUDE.md` (правила, економія токенів), цей файл, останні пункти `PROGRESS.md` (137–140). Старі HANDOFF — `archive/` (лише Grep).

## Де ми (2026-10-22, раунд 61; PROGRESS п. 139–140)
- ОПУБЛІКОВАНО 2026-10-22 (коміт `e1f4487` + `dffd9e7`): сайт GitHub Pages (перевірено, новий код на сайті), exe на столі `D:/DESKTOP/CapyTapMarket-Portable-NEW.exe` (з режимом бога), ZIP на itch (`desktop/dist/CapyTapMarket-itch-html.zip`, docs без sw.js) завантажено й «played in the browser» відмічено — Save на itch натискає користувачка. `NEWS_VERSION` = 25 (новина про екрани завантаження й вибір музики, 6 мов). Збірка exe: `ELECTRON_BUILDER_CACHE=previews/ebcache`.
- Музика: 4-й стиль «🎃 Хелловін» у «Стилі музики» (`MUSIC_STYLES`, `halloweenStyleOk/halloweenMusicOn` у `190_a`). Пора Хелловін музику не вмикає; вибір пори лише перемикає стиль.
- Екрани завантаження (`040_boot_script`, `023_style_boot`): 7 сцен (night, dawn, rain, snow, time, halloween [1.10–10.11], fest), у кожній канва `.b-cv` (позаду міста) і `.b-cv.fr` (спереду). Користувачка просила: без зірок-цяток на небі, без конфеті/ліхтариків, без шапок (Капі скрізь `base`), машини колесами на дорозі (смуги `25% - 14px` / `25% - 3px`), +вантажівка й фургон, +2 хмари. Перегляд: `?boot=<сцена>&hold=1` (кат-сцену в новому профілі ховати через JS для знімка).
- Відкат усього раунду: мітка `before-boot2`.

## Не перевірено / відкрите
- Разова помилка автотесту на ПК (`Cannot read properties of undefined (reading 'length')`) один раз із трьох; по всіх 7 сценах у 1920×1080 не відтворилась. Якщо повториться — шукати стек.
- Гравці, що раніше вручну обрали пору «Хелловін», тепер чують музику епохи, доки не натиснуть «🎃 Хелловін».
- Питання користувачки «як люди на ПК скачуватимуть гру»: відповів — сайт/itch у браузері, згодом Steam; запропонував окремий Windows-файл на itch без режиму бога (не робили).

## Чекає (з минулого)
1. Користувачка: Save на itch; Play Console (Android); AdMob; Steamworks; «Аудиторія» й публікація 5 відео з чернеток YouTube (трейлер Steam v3, YT1, YT2, Short 5, Short 6); голос трейлера (живий чи Ava, `previews/voice/t3_user/`).
2. YouTube: відео «не залітають» — причина не з'ясована.
3. Сторінки Steam/Google Play: вказати 6 мов (`store/STEAM_LANGS.md`); тексти мов вичитати носіям (es, pt).
4. Android: підписаний AAB, закритий тест ≥12×14 днів; iOS останнім; Steam ($100, App ID); TikTok.
5. Необов'язкове з текстів: гостя Японії Сора (`276_japan_text`), `SKIN_LINES`, старі `team_*_say_*`.

## Перед випуском
Рецепт у `CLAUDE.md`. Не комітяться: `desktop/*.bat`, `tools/autotest_last.txt`, `previews/`, `backups/`; `desktop/app/game.html` після exe повертай `CAPY_NOGOD=1 node desktop/prepare.js`. ZIP для itch: копія `docs/` без sw.js у `previews/itchzip`, `tar -a -cf` у PowerShell; на itch файл подається через `previews/yt/serve_files.js desktop/dist 8765` + підміну `HTMLInputElement.click` (itch сам замінює однойменний файл).
