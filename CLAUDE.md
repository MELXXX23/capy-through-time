# CapyTap: Market

Піксельна гра-клікер у браузері: Капі росте від крамнички до ТЦ (6 рівнів), 9 епох (подорож у часі = престиж). ПК і телефон однаково важливі; мови uk + en (+ es/it/pl/pt частково). Збірка — один файл `game.html` (~3 МБ), код — у `src/` (~100 частин).

## Токени (головне)
- НІКОЛИ не читай `game.html`, `docs/index.html`, `desktop/app/game.html`, `backups/`, `archive/` цілком. Код — лише в `src/`.
- Шукай навігатором, не читанням: `node tools/c.js find "<regexp>" [-f частина] [-n 30]`, `fn <ім'я>`, `outline <частина>`, `use <ім'я>`, `lines <частина> <від> [до]`. Read — тільки з offset/limit ≤ 150.
- Карта частин: `src/MAP.md` (Grep по рядку). Підводні камені: `src/ARCH.md` (Grep по слову).
- Жирні рядки (6–30 тис. символів): `130_format` L8, L13; `040_boot_script` L133, L353; `110_a2_texts_uk`, `110_b2_texts_en`, `180_b_actor_draw_lines` — лише через `tools/c.js` або `cut -c1-200`.
- Вивід обрізай (`| tail -20`, `cut -c1-200`); `git diff --stat`, не повний diff.
- Перевіряй текстом: `env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/probe.js "<вираз>"`; знімки — лише коли треба побачити малюнок, один кадр, scale ≤ 0,5, кілька кадрів — одним листом.
- Автотест `bash tools/autotest.sh --quick` (~3 хв) — один раз наприкінці задачі, не після кожної правки.
- Незалежні виклики — паралельно. Не перечитуй те, що вже в контексті. Не переказуй код.
- Одна тема = один чат; ~30 повідомлень → оновити HANDOFF/PROGRESS і новий чат.
- Перед великою зміною — план у 3–6 рядках і список файлів; правки точкові.

## Структура
- `src/NNN_[літера]_тема.js|css|html` — частини (порядок за іменем, одна область видимості). Після правок: `node tools/build.js`. Нова частина — новий файл з `//#part ім'я` першим рядком; потім `node tools/mkmap.js`.
- CSS-частини: правила додавай ВСЕРЕДИНУ блоку `<style>` (у `025_style_late.css` закривний `</style>` стоїть у кінці).
- Стан — `state`; збереження `localStorage` ключ `capyThroughTime_save` (НЕ МІНЯТИ), нові поля через `SAVE_MIGRATIONS`/`mergeInto`. Епоха — `state.eid` (`curEpoch()`), не `state.epoch % 8`. Тексти — `translations` (частини `110_*`, `279_z_lang_*`).
- `docs/index.html` — сайт (робить `tools/publish.js`), https://melxxx23.github.io/capy-through-time/. `desktop/` — Electron (`prepare.js` → `desktop/app/game.html`; `serve.js` = сервер `capy` з `.claude/launch.json`, порт 8080).
- `previews/` (не в git) — лише робочі: `itch/` (скріни, обкладинки, zip, сценарії `shots.js`), `r5/`, `dragon/zip.ps1`, `video/scn_common.js`, `epoch_music/`, `boot/`, `ebcache/`. Старе — у `C:\GAMES\_capy_archive` (поза проєктом).

## Робота з користувачкою
- Українською, просто, без жаргону; про себе в чоловічому роді («зробив»). Користувачка — жінка.
- Після задачі: що зроблено і що перевірити (3–6 пунктів) + пункт у `PROGRESS.md` (≤ 8 рядків; `node tools/progress_rotate.js`).
- Перед змінами: `git tag -f before-<тема>` (відкат `git reset --hard before-<тема>`). Прогрес гравців не ламати.
- Великі візуальні зміни — спершу зразок (знімки `previews/itch/shots.js`) і «окей». Нічого не налазить і не вилазить: ПК 1920×1080 і телефон 390×844. Зміни показуй наживо у вбудованому браузері (`preview_start capy`); живий стан гри не лишай зміненим.
- «Збережи» = локальний коміт, без exe/файлів/посилань. Випуск (сайт, exe, itch) — лише на «публікуй»/«випускай»/«онови на сайті/пк/itch».
- Випуск: `bash previews/itch/release69.sh` (build → publish → exe з режимом бога на стіл `D:\DESKTOP\CapyTapMarket-Portable-NEW.exe` → exe без нього в `previews/itch/r69_upload` → коміт → push), далі `bash tools/watch-pages.sh 9 "<слово з нового коду>"`. Zip для itch — `node previews/itch/zip_autumn.js` (без авто-Хелловіну). Перед випуском автотест.
- itch (melxxxnika.itch.io/capytap-market, edit id 5134270) через Claude in Chrome: системне вікно файлу не відкривати — перехопити `HTMLInputElement.prototype.click`, input вставити в сторінку, `file_upload` (≤ 10 МБ за раз; скріни по одному). Після заміни zip — галочка «played in the browser», Save.
- РЕЖИМ БОГА лише в exe (`prepare.js` ставить прапорці в `desktop/app/game.html`); сайт і телефон без нього (`CAPY_NOGOD=1`). У `game.html` прапорці не вмикати.
- Велике оновлення: новий випуск газети — підняти `NEWS_VERSION` (230_b) і текст `NEWS_ABOUT` (230_c).
- `app.setName('Capy Through Time')` у `desktop/main.js` не чіпати. Облікові дані й паролі не чіпати.

## Підводні камені
- Electron у скриптах: `env -u ELECTRON_RUN_AS_NODE …`; звук вимикати, вкладку закривати. Вбудований браузер, коли панель схована, не крутить анімацію (rAF стоїть) — показати панель (`show_pane preview`).
- Автотест гасить сервер 8080 — перед ним `preview_stop`.
- Довгі скрипти — інструментом Write (heredoc ламає лапки й `\`). `python3` — заглушка, лише node. Не роби `rm -f dir/*`.
- `lineG` зависає на дробових координатах — округляй. Репліки не виходять за кадр.
- Сайт оновлюється із затримкою (GitHub Actions), телефон кешує ~10 хв.

## Перехід на новий чат
На «готова/готовий поміняти чат»: онови `HANDOFF.md` (≤ 40 рядків) і `PROGRESS.md`, локальний коміт, видай промпт з `PROMPT_NEW_CHAT.md`.
