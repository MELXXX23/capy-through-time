# PROGRESS — CapyTap: Market

Тут лише ОСТАННІ раунди (максимум 6 пунктів). Старі: `archive/PROGRESS_*.md` (не читай без потреби; шукай через Grep). Новий пункт додавай у кінець, коротко (до ~8 рядків); ротація: `node tools/progress_rotate.js`.

## 78. itch.io: обкладинка, 5 скріншотів, новий ZIP (р. 52)
- На сторінку (id 5134270) завантажено обкладинку 630×500 і 5 скріншотів EN (`previews/r53/itch_upload/`). Новий архів `desktop/dist/CapyTapMarket-itch-html.zip` (index.html = game.html через ту саму обробку, що й `tools/publish.js`, без режиму бога; `fonts/`, `icons/`, `manifest.webmanifest`; зібрано `tar -a -c`); старий — `backups/CapyTapMarket-itch-html_old.zip`. Завантаження через Claude in Chrome (приховані `input[type=file]` перехоплено патчем `HTMLInputElement.prototype.click`).
- Галочка «This file will be played in the browser» для нового файлу поставлена, Save натискає користувачка. Опис (Details) і посилання на трейлер лишаються порожніми.

## 79. YouTube: канал, трейлер 16:9 EN (р. 52)
- Канал: банер 2048×1152 і аватар 800×800 з чистою Капі, опис uk+en, посилання на itch, водяний знак 150×150 — завантажено в чернетку YouTube Studio (публікує користувачка). Файли: `previews/r53/yt/`.
- Трейлер: `previews/video/CapyTap_trailer_r53_16x9_web.mp4` (1920×1080, 68 с, 23 МБ; зі звуком гри). Сценарій складається `previews/video/gen_trailer.js` → `scn_trailer_r53.src.js` → `build_scn.js` → запис `rec.js` (`CAPY_CW=1280 CAPY_CH=720 CAPY_Z=1.5 CAPY_OW=1920 CAPY_OH=1080 CAPY_LANG=en-US`). Мініатюра 1280×720 і текст метаданих: `previews/video/youtube_thumbnail_1280x720.png`, `youtube_metadata.txt`.
- Інструменти: `tools/crop.js`, `tools/resize.js`, `tools/montage.js`.

## 80. Трейлер: музика без пауз (р. 52)
- Причина пауз у музиці відео (на ~8, 10, 15, 19, 21, 24, 31, 56, 67 с): живу музику гри писав MediaRecorder у момент, коли головний потік гри був заблокований перебудовою сцен (0,5–1,5 с); планувальник нот не встигав планувати наперед. Це лише артефакт запису; у грі перебудови ховає подорож/заставка.
- Рішення: музика рендериться офлайн без блокувань — `previews/r53/music_render48.js` (48 кГц, 70 с, ключ `ep3:A:1:classic`, адаптація `previews/r50/music_render.js`), далі `ffmpeg` (loudnorm −16 LUFS, fade 0,3 с / 4,5 с) і заміна доріжки: `previews/video/CapyTap_trailer_music_clean.{mp3,wav}`, `CapyTap_trailer_r53_upload_9MB_v2.mp4` (9,6 МБ), `CapyTap_trailer_r53_fullquality_v2.mp4` (90 МБ). Паузи в новій доріжці відсутні (перевірено `silencedetect`).
- На YouTube у чернетці ще СТАРЕ відео (з паузами): потрібне перезавантаження.

## 81. Аудит токенів (р. 52)
- Частини ≤ 48 КБ (найбільші `040_boot_script`, `275_japan`, `190_a`); `275_japan` без довгих рядків — читати шматками нормально. Токени їсть не розмір, а «жирні» рядки даних (до 30 К символів) у 5 частинах: тепер перелічені в CLAUDE.md п. 5а. `tools/c.js` їх уже обрізає (перевірено: вивід ≤ 1 КБ). Код гри не змінювався.
