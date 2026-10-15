# CapyTap: Market (раніше «Капі крізь час»)

Браузерна гра-клікер з піксель-артом, один файл `game.html` (ЗІБРАНИЙ, ~2 МБ). Капібара Капі перетворює крамничку на торговий центр (6 рівнів), гра ходить через 9 епох (подорож у часі = престиж). Телефон і ПК однаково важливі; мови uk + en. Далі планується серія (CapyTap: Hotel, Restaurant) у тому самому стилі.

## ЕКОНОМІЯ ТОКЕНІВ (головне правило; тижневий ліміт горить від читання файлів)
1. НІКОЛИ не читай `game.html`, `docs/index.html`, `desktop/app/game.html`, `backups/` (заборонено в `.claude/settings.json`; потрібне з архіву — лише `grep -n … | head` через Bash). Код живе в `src/` (76 частин, переважно 20–40 КБ).
2. Шукай не читанням, а навігатором (виводить лише потрібне, довгі рядки обрізає):
   - `node tools/c.js find "<regexp>" [-f частина] [-n 30]` — де зустрічається;
   - `node tools/c.js fn <ім'я>` — одна функція/const/метод повністю;
   - `node tools/c.js outline <частина>` — список функцій частини з номерами рядків;
   - `node tools/c.js use <ім'я>` — у яких частинах використовується;
   - `node tools/c.js lines <частина> <від> [до]` — шматок із номерами рядків.
   Далі правиш частину в `src/` через Edit; для Read завжди `offset`/`limit` (не більше 150 рядків).
3. Карта «що де»: `src/MAP.md` (читай рядок потрібної частини, не весь файл через Grep по імені). Технічні факти й підводні камені: `src/ARCH.md` — Grep по ключовому слову або розділ через offset; цілком не читати.
4. `PROGRESS.md` (4 останні пункти) і `HANDOFF.md` короткі; архів у `archive/` не читати (лише Grep, якщо потрібна стара подробиця).
5. Grep по `src/` з `head_limit` ≤ 30; пошук з довгими рядками (дані, тексти) — через `tools/c.js find`, інакше один збіг = тисячі символів.
5а. Жирні рядки (дані по 6–30 тис. символів): `130_format` L8, L13; `040_boot_script` L133, L353; `110_a2_texts_uk`, `110_b2_texts_en`, `180_b_actor_draw_lines`. Read/Grep по ним — лише через `tools/c.js` або `offset` повз ці рядки (один такий рядок = ~10 тис. токенів).
6. Вивід команд обрізай: `| tail -20`, `| head -30`; `git diff --stat`, не повний diff; автотест `bash tools/autotest.sh --quick` сам друкує лише підсумок (≈15 рядків, також у `tools/autotest_last.txt`).
7. Перевіряй текстом, не картинками: `env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/probe.js "<вираз>"` (відкриває гру приховано й друкує JSON зі стану: `state`, `curEpoch()` …), `read_page`, `javascript_tool`, `preview_logs`; скріншоти — лише коли треба побачити малюнок, один кадр, з `scale` ≤ 0,5 і `zoom` на область. Не знімай «на всяк випадок».
8. Незалежні виклики роби паралельно в одному повідомленні. Не перечитуй те, що вже є в контексті. Не переказуй код у відповіді.
9. Довгі дослідження («де це і як працює») віддавай агенту `Explore` (дешевша модель), а не читай сам. Рутинні правки й перевірки — на середньому рівні зусиль; високий лише для проєктування великих нових систем.
10. Одна тема = один чат. Закінчив тему (або ~30 повідомлень) — онови HANDOFF.md/PROGRESS.md і починай новий чат (див. «Перехід»). Не веди два чати в одній папці.
11. Не вмикай конектори/плагіни без потреби (Gmail, Canva, everygen вимкнено; кожен додає інструменти до кожного повідомлення).
12. Перед великою зміною — план у 3–6 рядках і список файлів; правки мінімальні й точкові.

## Структура
- `src/NNN_[літера]_тема.js|css|html` — частини гри (порядок за іменем; один спільний скрипт, одна область видимості). Правиш ТІЛЬКИ тут, потім `node tools/build.js` (збирає `game.html`). Якщо правили `game.html` напряму (старі латки `previews/*/lib.js`) — `node tools/split.js`; `node tools/sync.js` бере новішу сторону.
- Розбиття/перейменування частин: `node tools/resplit.js <частина> <N>` (ріже без зміни тексту), потім `node tools/build.js && node tools/check_parts.js && node tools/mkmap.js`. Нову частину — новим файлом з маркером `//#part ім'я` першим рядком (див. `src/README.md`).
- `docs/index.html` — копія для GitHub Pages (робить `tools/publish.js`), сайт https://melxxx23.github.io/capy-through-time/ (репозиторій MELXXX23/capy-through-time).
- `desktop/` — Electron-обгортка (`prepare.js` копіює `game.html` → `desktop/app/game.html`; `serve.js` — локальний сервер, конфіг `capy` у `.claude/launch.json`). Збірки в `desktop/dist/`.
- `backups/` (копії `game.html`, не в git), `previews/` (зразки/знімки, не в git), `archive/` (старі PROGRESS/HANDOFF/PROMPTS), `tools/` (`autotest.sh [--quick]`, `build/split/sync/resplit/check_parts/mkmap/c.js`, `probe.js`, `publish.js`, `shot*.js`, `watch-pages.sh`, `progress_rotate.js`).
- Дані й ключі: тексти — `translations` (uk/en, частини `110_*`); весь стан — `state`; збереження `localStorage` ключ `capyThroughTime_save` (НЕ МІНЯТИ), нові поля через `SAVE_MIGRATIONS`/`mergeInto`. Номер епохи — `state.eid` (`curEpoch()`), а не `state.epoch % 8`. Деталі — `src/ARCH.md`.

## Як працювати з користувачем
- Спілкуйся українською, простими словами, без жаргону; про себе в чоловічому роді («зробив»). Користувачка — жінка.
- Після завершеної задачі: що зроблено і що перевірити (3–6 коротких пунктів) + короткий пункт у `PROGRESS.md` (до ~8 рядків; потім `node tools/progress_rotate.js`).
- ПЕРЕД змінами: копія `game.html` у `backups/game_before_<тема>.html` і мітка `git tag -f before-<тема>`; велике — у гілці. Відкат: `git reset --hard before-<тема>`. Прогрес гравців не ламати.
- Великі візуальні зміни спершу показуй зразком (справжні знімки гри `tools/shot*.js`) і чекай «окей». Нічого не вилазить із рамок і не налазить одне на одне (особливо телефон); при зміні розкладки перевіряй ПК 1920×1080 із відкритим меню і телефон 390×844 (закрите/відкрите меню).
- «Збережи» = локальний коміт, БЕЗ нових exe/файлів/посилань. Збірку для ПК — лише на «зроби на пк»: оновлюй той самий файл на столі `CapyTapMarket-Portable-NEW.exe` («Device busy» → попроси закрити гру); старих portable в `desktop/dist` не лишай.
- На GitHub — ТІЛЬКИ після слова «публікуй»/«випускай». Рецепт: `bash previews/r5/release.sh` (або вручну: `node tools/publish.js` → `node desktop/prepare.js` → коміт з трейлером `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` → `git push` → `bash tools/watch-pages.sh 9 <слово з нового коду>`). Перед випуском `bash tools/autotest.sh --quick`.
- РЕЖИМ БОГА: exe ЗАВЖДИ з ним (`desktop/prepare.js` ставить `DEV_OPEN_ALL`, `SKINS_FREE`, `window.__debug` лише в `desktop/app/game.html`); сайт і телефонний сервер без нього (`CAPY_NOGOD=1`). Не вмикай прапорці в самому `game.html`.
- Нове велике оновлення: додай НОВИЙ випуск першим у `NEWS_ISSUES` і підніми `NEWS_VERSION` (газета «Пошта від розробників»).
- Збірка exe: `cd desktop; node prepare.js; npx electron-builder --win portable --config.electronDist=node_modules/electron/dist --config.electronVersion=33.4.11`. `app.setName('Capy Through Time')` у `desktop/main.js` лишити (папка збережень). Не чіпай облікові дані й паролі.

## Підводні камені (коротко; решта в `src/ARCH.md`)
- Electron у скриптах: `env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe ...`. У тестах звук вимикай (`setAudioMuted(true)`), вкладку перегляду закривай.
- Довгі скрипти пиши інструментом Write, не heredoc (апострофи й зворотні слеші ламаються в Bash на Windows). `python3` — заглушка, лише node. Не роби `rm -f dir/*` (блокується).
- У живій вкладці (порт 8080) не лишай тестових змін `state`.
- `lineG` (Брезенхем) зависає на дробових координатах — округляй. Репліки не виходять за кадр. Дорога з поштою малюється лише при `view.extraB >= 30`.
- Сайт оновлюється із затримкою (GitHub Actions), телефон тримає кеш ~10 хв.

## Перехід на новий чат
Коли користувачка пише «я готовий поміняти чат» (або схоже): онови `HANDOFF.md` (де ми, що чекає, що не зроблено, ≤ 40 рядків) і `PROGRESS.md`, локальний коміт, і видай готовий промпт одним блоком: «Прочитай CLAUDE.md, HANDOFF.md і останні пункти PROGRESS.md, потім продовжуй. Зараз: <1–3 речення>». Нову розмову радь починати після кожної завершеної теми.
