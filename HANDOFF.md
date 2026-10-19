# Передача між чатами (оновлюй перед кожним переходом; тримай ≤ 40 рядків)

Читай: `CLAUDE.md` (правила, економія токенів), цей файл, останні пункти `PROGRESS.md` (121–126). Старі HANDOFF — `archive/` (лише Grep).

## Де ми (2026-10-19, раунд 58; PROGRESS п. 82–126)
- Опубліковане: main, коміт 660ec9c (злиття android-wrapper, мітка відкату `before-itchrelease`): сайт GitHub Pages оновлено (кнопка оцінки лише на itch, iPhone 17, код реклами лише для Android; `docs/privacy.html` лишився без реклами). Нова робота — прямо в main (або нова гілка). ZIP на itch оновлено (п. 126), exe на столі НЕ оновлювався.
- iPhone 17/Air (п. 121–122, коміт 766ffa6): чорна смуга зверху — помилка iOS 26; спроба: `010_head.html` для екранів 402/420/440 pt ставить `status-bar-style=default` і `theme-color=#2E4580` (діє після перевстановлення іконки). На справжньому iPhone не перевірено; чекаю скрін діагностики (5 тапів по лічильнику монет, рядок `fit`). Повний екран = лише iOS-застосунок (Apple Developer $99).
- itch.io (п. 123–126, усе збережено й опубліковано; девлог ще не запостили): кнопка «⭐ Оціни гру на itch.io» + разова підказка за ~10 хв — `src/275_z_itch_rate.js`, лише на домені itch.io/itch.zone (тест `?itch=1`), потрапить у новий ZIP при «публікуй». На сторінці в редакторах (Chrome користувачки) підготовлено, Save натискає вона: форма «Edit game» (новий опис EN+UK, підпис «9 eras», `store/itch_description.html`) і «Edit theme» (Renaissance terracotta + банер 1800×600 Фудзі/дракон + Embed BG). Обкладинка bigcapy і GIF уже збережені. Файли в `previews/itch/ready/`, тексти девлогу і чеклист — `store/ITCH_DEVLOG.md`. Девлог постити після нового ZIP. Аналітика: 166 показів, 29 переглядів (CTR 1,2%), 8 запусків, 0 оцінок.
- `mobile/`: Capacitor 8 (targetSdk 36), AdMob 8.2.1; реклама лише в Android (`src/275_ads.js`, прапорець `window.__ADS`), тестові ID, AAB не збирався (немає Android Studio/JDK). `docs/privacy.html` оновлено під рекламу, не публікувати без Android. `store/PLAY.md`, `store/ADS_PLAN.md`.
- Google Play: акаунт CapyTap Company, $25 сплачено. Чекає: документ, Android-пристрій для підтвердження, телефон.
- Steam (п. 114–116): $2.99, без реклами; збірка `bash desktop/build-steam.sh`, картинки `previews/steam/ready`, `store/STEAM.md`, `store/steam/upload.sh`. Чекає: анкета Steamworks, $100, App ID + Depot ID.
- Трейлер і Shorts (п. 117–120, `store/TRAILER.md`, `SHORTS.md`, `SHORTS_YT.md`): трейлер 1080p60 і Shorts 1–4 на YouTube чернетками (голос Edge; аудиторію «для дітей?» й публікацію робить користувачка). Справжній голос — ElevenLabs (A–I у `previews/voice/final/`), чекає її. TikTok не завантажено. Будування в трейлері повні по 8,5 с; рівень магазину в сценаріях = 1.

## Чекає / не зроблено
1. Користувачка: Save у двох редакторах itch; Play Console (документ, Android); AdMob (App ID, блок Rewarded); Android Studio; Steamworks; «Аудиторія» й публікація Y1/S2 на YouTube.
2. На слово «публікуй»: випуск (рецепт у `CLAUDE.md`; ZIP для itch = `docs/` без sw.js, зібраний з прямими слешами, п. 126), девлог на itch (текст у `store/ITCH_DEVLOG.md`, публікує лише з дозволу), `NEWS_VERSION` зараз 23. Не публікуй `docs/privacy.html` з рекламою без Android.
3. Android: підписаний AAB (keystore створює користувачка; `versionCode` піднімати), закритий тест ≥12 тестувальників × 14 днів (перший білд без реклами); живі ID реклами, Families Policy, Data safety.
4. iOS (останнім): Apple Developer $99, збірка через хмару, TestFlight; поки PWA.
5. Раніше: перевірка телефону 390×844 (щоденник, таймер бонус-ігор, лапшична); баги без відтворення (Відродження, блимання звірят).

## Перед випуском
Не комітяться: `desktop/*.bat`, `tools/autotest_last.txt`, `previews/`, `backups/`; `desktop/app/game.html` після exe повертай `CAPY_NOGOD=1 node desktop/prepare.js`. Не публікуй `docs/privacy.html` без Android-випуску.
