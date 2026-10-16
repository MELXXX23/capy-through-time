# Передача між чатами (оновлюй перед кожним переходом; тримай ≤ 40 рядків)

Читай: `CLAUDE.md` (правила, економія токенів), цей файл, останні пункти `PROGRESS.md`. Старі HANDOFF — `archive/` (лише Grep).

## Де ми (2026-10-16, раунд 56; PROGRESS п. 82–108)
- Усе випущене й актуальне (коміт bc3c5a9, код гри після нього не змінювався): сайт (Японія, Хелловін, бонус-ігри всіх епох, політика з рекламою, спільний таймер бонус-ігор, щоденник 9/9); ZIP для itch (id 5134270, `desktop/dist/CapyTapMarket-itch-html.zip`); exe на столі `D:\DESKTOP\CapyTapMarket-Portable-NEW.exe` перезібрано 2026-10-15 23:26 з bc3c5a9 (режим бога; `desktop/app/game.html` повернуто без нього).
- Збірка exe: кеш electron-builder у профілі зашифровано (EFS), CopyFile у dist падає. Рецепт: копія кешу в `previews/ebcache` (не в git; поновити `node previews/copycache.js`), далі `cd desktop; node prepare.js; ELECTRON_BUILDER_CACHE=C:/GAMES/capy-through-time/previews/ebcache npx electron-builder --win portable --config.electronDist=node_modules/electron/dist --config.electronVersion=33.4.11`, копія на D:/DESKTOP, потім `CAPY_NOGOD=1 node desktop/prepare.js`. Не запускай збірку з терміналу користувачки (порожній кеш, нема прав на symlink).
- YouTube (@CapyTapGames, канал UCsm_WASQWBvP-OEUtbOJxZg): новий банер 2560×1440 із підписом «8 ERAS + BONUS» опубліковано (`previews/r57/yt_banner_2560x1440.png`). У приватних ЧЕРНЕТКАХ: Y1 «I Time-Traveled a Capybara's Shopping Mall Through 9 Eras (Idle Game)» (з мініатюрою) і Shorts S2 «Same mall, nine eras. Which one is yours?»; «Аудиторія» (для дітей?) ще не вибрана — рішення користувачки; публікує користувачка.
- Відео: файли `previews/r57/vid/out/final/` (Y1_v2, S2, мініатюри `thumb_Y*.png`), назви/описи `previews/r57/vid/metadata.txt`, збірка `previews/r57/vid/gen.js → build.js → previews/video/rec.js` (одна музика + mute — `fixTrack`, `mute`). Підписи мають підкладку (`capB`). Решту відео й скрінів видалено (п. 108); кадри банера теж, щоб міняти текст — спершу `previews/r57/eras.js`.
- Бонус-ігри: іконка `#bonusOpen`, реєстр `MG_DEFS` (`279_bonus_games.js`, `279_c_bonus_games_more.js`); перезарядка 12 год одна на всі епохи, приз скін. Лапшична (Японія), відьма — візок, цирк — колесо: НЕ ЧІПАТИ. Відкат: `git reset --hard before-bonus-all`.
- Поза кодом: itch.io, YouTube, TikTok-трейлер v2 (`previews/video/`).

## Чекає / не зроблено
0. itch: на сторінці 11 скрінів; решту 3 з 9 нових додати вручну з `previews/r56/itch_upload/screenshots/` і прибрати старі. Зайва копія ZIP у корені Google Диска користувачки.
1. YouTube: у чернетках Y1 і S2 обрати «Аудиторію», перевірити звук Y1, опублікувати (1 Shorts на день, довге раз на тиждень).
2. Користувачка перевіряє на телефоні 390×844: щоденник (кольори кнопок епох, 9/9), один таймер бонус-ігор, 8 бонус-ігор, лапшична у справжній подорожі без режиму бога (візок діда Рьо, а не цирк), музика й звуки тапа, обхід Капі в годину пік, плавність подорожі, скін Капі в Японії, неон і дракон уночі.
3. Наступне «публікуй»: `node tools/sync.js`, autotest --quick, `node tools/publish.js`, `CAPY_NOGOD=1 node desktop/prepare.js`, коміт docs/index.html, `git push`, `bash tools/watch-pages.sh 9 <слово>`; ZIP для itch (.NET ZipArchive з docs: index, privacy, manifest, fonts, icons), завантаження через Chrome (хук на HTMLInputElement.click, PROGRESS п. 103). «Зроби на пк» → рецепт exe вище.
4. Газета «Що нового»: про бонус-ігри всіх епох ще нема випуску (`NEWS_ISSUES`, підняти `NEWS_VERSION`, зараз 23).
5. Баги без відтворення: екран епохи Відродження «час від часу»; блимання звірят і кінозалу на телефоні.
6. Ідеї: таймлапс доби під час будівництва, глядачі-звірята, бос на 5–6 рівнях, Хелловін/зима-теми будівництва, нова бонусна епоха (рецепт у `src/ARCH.md`, рядок про `state.eid`); нові ролики: усі 8 бонус-ігор (потрібні боти для кожної гри).

## Перед випуском
Не комітяться: `desktop/*.bat`, `tools/autotest_last.txt`, `previews/`, `backups/`; `desktop/app/game.html` після exe повертай `CAPY_NOGOD=1 node desktop/prepare.js`.
Поза репозиторієм: W-8BEN на itch.io лишилось «Submit» і «Exit Interview».
