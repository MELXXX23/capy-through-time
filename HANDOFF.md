# Передача між чатами (оновлюй перед кожним переходом; тримай ≤ 40 рядків)

Читай: `CLAUDE.md` (правила, економія токенів), цей файл, останні пункти `PROGRESS.md` (141–143). Старі HANDOFF — `archive/` (лише Grep).

## Правила користувачки для цього чату
- Мінімум токенів: відповідь чітко на задачу, без переказу коду й довгих пояснень; правки лише точково через Edit (не переписувати файли гри); нічого зайвого, що не просили.
- Якщо вона просила спершу питання/зразок — спершу питай/показуй і чекай «окей»; великі візуальні зміни — зразком.
- Стиль арту: кольори й характер ті самі, піксель-арт ЧІТКИЙ (піксель не лізе на піксель), без реалізму, без вицвітання кольорів.

## Де ми (2026-10-25, раунд 63; гілка `guests10`, НЕ влита в main, НЕ опубліковано; відкат — мітка `before-guests10`)
- Випущено 2026-10-24 (main `5c0568f`): кат-сцена v3, газета №26.
- На гілці зроблено: золоті/діамантові герої видно на покупцях (`drawSkinGear`, 180_c); кнопки «Перегляд епох» у кольорах епох, стать рожева/блакитна (025_style_late.css); нові іконки меню 48×48 (`165_tab_icons_hd.js`, генератор `previews/mock10/art.js`+`icons.js`+`gen_icons.js`); Рьо й відьма завжди дають скін (`mgSkinSector`), напис `circusSkinNote` «Тут лише скіни»; нові бонус-ігри Японії «Тайко» (MG_DEFS[8]) і Хелловіну «Привиди з могил» (MG_DEFS[9], `mgActive`) у `279_d_bonus_games_jp_hw.js`.
- Автотест `--quick` проходить; тепер друкує `@game.html:<рядок>` у помилці консолі.

## НАСТУПНА ЗАДАЧА (користувачка сказала «зроби усі 10 так»)
Переробити усі 10 «місць гостей» (`STANDS`) у стилі зразка чайного будиночка: `previews/mock10/sora_new.js` (функція `soraNew`) і картинка `previews/mock10/sora_cmp_v2.png`. Затверджено: більше деталей, анімація, 1px темний контур, ті самі кольори (літери PALETTE + hex).
- Де код: `src/245_stands.js` (pip, zina, maks, bitik, lesyk, orbit, lumi, bruno, pietro; кожен `STANDS.<id> = { w, h, draw(g, x, y, t) }`, хелпери rc/px/ln/box/shadow/glow/text/awning у IIFE) і `src/275_japan.js` від рядка ~541 (sora).
- Робота: по 2–3 гості за раз: замінити лише тіло `draw` потрібного гостя (Edit), `node tools/build.js`, оглянути всі 10 одним листом: `env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe previews/mock10/pagejs.js out.png previews/mock10/stands_now.js` (малює усі STANDS ×3). Розмір `w`/`h` лишати або чесно оновити (за ними гість стає на місце).
- Першу пару показати користувачці зразком і чекати «окей», далі решту. Інтегрувати й sora_new у `STANDS.sora`.

## Відкрите
- Будинки й маркети: мій «реалістичний» зразок користувачка відхилила (втратив колорит). Треба лише чіткість поточного вигляду. СПЕРШУ ЗАПИТАТИ, де саме не чітко; не переробляти.
- Мови es/it/pl/pt: немає ключів `mgTaikoTitle/Sub/Start/Done`, `mgGhostTitle/Sub/Start/Done` (є лише uk/en; `mgSkinOnly` є в усіх).
- Випадкова помилка автотесту `Cannot read properties of undefined (reading 'length')` (рідко, раз у кілька запусків, ПК і телефон): знайти рядок із нового `@game.html:N`.
- Баланс нових ігор (`goalP` 20/18) не вивірено. Перед випуском: газета №27 (`NEWS_VERSION`), `node tools/progress_rotate.js`, merge `guests10` у main, рецепт `previews/cut2/release.sh`.

## Чекає (з минулого)
Save на itch (ZIP `desktop/dist/CapyTapMarket-itch-html.zip`); Play Console/AdMob/Steamworks; публікація 5 відео з чернеток YouTube; голос трейлера; `store/STEAM_LANGS.md`; Android AAB і закритий тест. Не комітяться: `desktop/*.bat`, `tools/autotest_last.txt`, `desktop/app/game.html` (до випуску), `previews/`, `backups/`.
