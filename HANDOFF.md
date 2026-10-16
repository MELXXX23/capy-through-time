# Передача між чатами (оновлюй перед кожним переходом; тримай ≤ 40 рядків)

Читай: `CLAUDE.md` (правила, економія токенів), цей файл, останні пункти `PROGRESS.md` (116–119). Старі HANDOFF — `archive/` (лише Grep).

## Де ми (2026-10-16, раунд 57; PROGRESS п. 82–119)
- Опубліковане (main, коміт bc3c5a9) НЕ змінювалось: сайт, ZIP для itch (id 5134270), exe на столі (з режимом бога). YouTube: банер опубліковано; Y1 і S2 у чернетках (потрібна «Аудиторія», публікує користувачка).
- Усе нове — у ГІЛЦІ `android-wrapper` (мітки відкату `before-android`, `before-ads`), локальні коміти, НЕ запушено, НЕ опубліковано:
  · `mobile/`: Capacitor 8 (targetSdk 36, Play вимагає з 31.08.2026), створено `mobile/android/`, іконки, фон `#2E4580`, плагін AdMob 8.2.1; AAB НЕ збирався (на ПК нема Android Studio/JDK, поставити має користувачка самотужки).
  · `src/275_ads.js`: нагороджена реклама AdMob лише в Android-обгортці (прапорець `window.__ADS` вставляє `mobile/sync-web.js`; тестові ID; живі — `mobile/ads.json`; App ID — `mobile/android/app/src/main/res/values/admob.xml`). Усі гравці = дитяча аудиторія (child-directed, G, без AD_ID). Місця: «×2» у вікні офлайну, пропуск очікування бонус-гри, чіп «🎬 ×2 прибуток 10 хв». Перевірено підробним плагіном (`previews/ads_test/`), autotest ✓.
  · `docs/privacy.html` оновлено під рекламу (НЕ опубліковано; випускати разом з Android). `store/PLAY.md` (тексти, анкети, Data safety), `store/ADS_PLAN.md` (план).
  · `desktop/build-public.sh`: публічний exe БЕЗ режиму бога (не запускався).
- Google Play: акаунт CapyTap Company (особистий) створено, $25 сплачено. Чекає: підтвердження особи (документ), підтвердження пристрою Android (програма Play Console на Android-телефоні; у користувачки iPhone → позичити Android на 5 хв), телефон. Платіжний профіль з іменем лише власниці документа.
- Steam (п. 114–116): ціна $2.99, платна, без реклами й покупок; збірка `bash desktop/build-steam.sh` (win-unpacked, без бога, без автооновлення), картинки `previews/steam/ready`, тексти й чеклист `store/STEAM.md`, завантаження `store/steam/upload.sh`. Чекає користувачку: анкета Steamworks, $100, App ID + Depot ID.
- ТРЕЙЛЕР (п. 117–118, `store/TRAILER.md`): драфт 3 готовий (≈79 с, 42 такти 128 BPM, шоти A–I, ПОВНІ будівництва по 8,5 с — користувачка наполягає, не скорочувати): `previews/video/out/CapyTap_trailer_draft3.mp4`. Сценарій `scn_trailer_v3.src.js`, музика власна `previews/music/compose.js` (→ capy_theme.wav), мікс `previews/video/mix.js`. Чекає: голос — ElevenLabs (Eleven v3, платний Starter), користувачка генерує A–I за таблицею в TRAILER.md у `previews/voice/final/`; "окей" на музику/драфт; тоді фінальний рендер 1920×1080/60 (~16 хв).
- YouTube: 3 Shorts завантажено ЧЕРНЕТКАМИ (Приватні, не опубліковані; аудиторію «для дітей?» не обрано — обирає користувачка; для S2–S3 теги не додано). Тексти: store/SHORTS_YT.md. Файли для завантаження: previews/shorts/upload/ (стиснені <10 МБ), оригінали previews/shorts/final/.
- SHORTS (п. 119, `store/SHORTS.md`, `SHORTS_YT.md`): 3 вертикальні відео 1080×1920/60 ГОТОВІ з чорновим голосом Edge (рішення користувачки, ElevenLabs для Shorts не потрібен): `previews/shorts/final/CapyTap_Short1..3.mp4`. Short 1 = скорочений трейлер, 2 = прокачка, 3 = секретна бонус-гра (2–3 лише Ренесанс). Рендер `bash previews/shorts/render_shorts.sh`, мікс `previews/video/mix_short.js` + `sN_mix_draftvoice.json`. Камера `cam.js` тепер тримає світ у межах кадру (без порожніх смуг) — важливо для нових відео. TikTok: ще не завантажено (потрібен «link in bio»).

## Чекає / не зроблено
1. Користувачка: Play Console — документ, Android-пристрій, телефон; створити акаунт AdMob (з того ж Google-акаунта; W-8BEN; App ID і блок Rewarded → дати мені); поставити Android Studio.
2. Зібрати підписаний AAB (keystore — створює користувачка; `versionCode` піднімати), закритий тест: ≥12 тестувальників з Android × 14 днів. Перший білд тесту БЕЗ реклами (Data safety = «не збираємо»), рекламний — для production.
3. Реклама: вставити живі ID, перевірити на справжньому Android; кнопка «Параметри реклами» зроблена (п. 113, не закомічено), AD_ID прибрано ✓; перевірити Families Policy; Data safety → `store/PLAY.md`.
4. Steam: усе без акаунта готове (п. 116): збірка, картинки у `previews/steam/ready`, тексти, `store/steam/upload.sh`. Чекає користувачку: анкета Steamworks, $100, App ID + Depot ID → я вантажу збірку (потрібен steamcmd). Необов’язково: досягнення Steam, Cloud, трейлер.
5. iOS (останнім): Apple Developer $99/рік, збірка через хмару (Codemagic / GitHub Actions macOS), TestFlight на iPhone користувачки; поки є PWA в Safari.
6. Раніше: itch — додати 3 скріни з `previews/r56/itch_upload/screenshots/`, W-8BEN; YouTube — «Аудиторія» й публікація Y1/S2; перевірка на телефоні 390×844 (щоденник, таймер бонус-ігор, лапшична); газета «Що нового» про бонус-ігри (`NEWS_VERSION` зараз 23); баги без відтворення (Відродження, блимання звірят).
7. Злиття гілки в main лише з дозволу користувачки (перед «публікуй»); рецепт випуску — `CLAUDE.md`.

## Перед випуском
Не комітяться: `desktop/*.bat`, `tools/autotest_last.txt`, `previews/`, `backups/`; `desktop/app/game.html` після exe повертай `CAPY_NOGOD=1 node desktop/prepare.js`. Не публікуй `docs/privacy.html` без Android-випуску (там уже описана реклама).
