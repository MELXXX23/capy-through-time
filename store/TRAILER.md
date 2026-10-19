# Трейлер CapyTap: Market (Steam + YouTube), драфт 3

Формат: 1920×1080, 60 к/с, 16:9, англійська, ≈79 с (42 такти по 1,875 с, 128 BPM). Усе в `previews/` (не в git).
- Запис: `previews/video/rec2.js` (покадровий, віртуальний годинник), сценарій `previews/video/scn_trailer_v3.src.js`, збірка `node build_scn.js scn_trailer_v3.src.js scn_trailer_v3.js`.
- Драфт (640×360, 30 к/с, ≈2 хв): `CAPY_CDP=1 CAPY_Z=0.6 CAPY_FPS=30 CAPY_CRF=26 CAPY_PRESET=ultrafast env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe previews/video/rec2.js out/draftN.mp4 scn_trailer_v3.js` (з папки `previews/video`). Фінал: без CAPY_Z (1920×1080 = Z 1.5, FPS 60), `CAPY_CRF=16`, `CAPY_PRESET=medium` (довго: ≈0,2 с/кадр × 4725 кадрів ≈ 16+ хв).
- Музика: `previews/music/compose.js` → `capy_theme.wav` (власна, згенерована кодом, ліцензія наша, без сторонніх прав). Накладання музики й голосу: `node mix.js <відео> <музика.wav> <папка_голосу|-> <вихід.mp4>`.
- Кожен шот прив’язаний до такту музики (`SH` у сценарії = секунди початку). **Будівництва — повні, 8,5 с кожне (не скорочувати й не прискорювати).**

## Шоти і такти
| # | Що | Такти | Секунди |
|---|---|---|---|
| A | Крихітна крамничка, камера від’їжджає (музична скринька) | 1–3 | 0–5,6 |
| B | Ренесанс: ДВА повні будівництва (лютня, клавесин, блокфлейта) | 4–13 | 5,6–24,4 |
| C | Подорож у часі (варп) → Диско | 14–15 | 24,4–28,1 |
| D | Диско: повне будівництво (диско-бас, струнні) | 16–20 | 28,1–37,5 |
| E | Огляд епох: Ретро, Аркада, Інтернет, Еко, Космос, Неон (кожні 2 долі інший тембр) | 21–23 | 37,5–43,1 |
| F | Крупні плани: Капі та два гості з репліками | 24–27 | 43,1–50,6 |
| G | Меню → скіни: Капі (астронавт/чарівник/лицар), бруківка (дерево, золото), хмари (зоряні, цукрова вата) | 28–34 | 50,6–63,75 |
| H | Японія (бонусна епоха), дракон влітає в камеру (кото, тайко, сякухаті) | 35–38 | 63,75–71,25 |
| I | Назва, «Coming soon to Steam», фінальний акорд | 39–42 | 71,25–78,75 |

## Озвучка (жіночий голос, живий, «кінотрейлер»; повна готова версія — у ElevenLabs)
Сервіс: **ElevenLabs** (elevenlabs.io), модель **Eleven v3** (підтримує емоційні теги в `[ ]`). Для комерційного відео потрібен платний тариф (Starter ≈ $5–6/міс; безкоштовний — лише некомерційний і з обов’язковим підписом). Ціни звірити на сайті. Голос обрати зі списку «Voices» (фільтр: English, Female, Narrative/Characters; прослухати 3–4, шукати «тепла, впевнена, трохи грайлива оповідачка»). Налаштування: Stability ≈ 35–45% (живіше), Similarity ≈ 75%, Style ≈ 30%.
Кожну фразу згенерувати ОКРЕМО й зберегти як `A.mp3 … I.mp3` у `previews/voice/final/` (не змінюючи тексту; теги в дужках читаються не словами, а інтонацією). Після цього я накладу (`mix.js`) на тактову сітку.

| Файл | Текст для вставлення | Вікно, c |
|---|---|---|
| A | `[warmly] Meet Capi. One tiny shop... and one very big dream.` | ≤ 5,3 |
| B | `[upbeat, building excitement] Tap. Earn. Upgrade. Hire animal helpers... and build your shop, floor by floor, into a mighty mall!` | ≤ 10,5 |
| C | `[dramatic, hushed] Then... travel through time.` | ≤ 3,3 |
| D | `[excited] Every era builds in its own style.` | ≤ 4,5 |
| E | `[fast, energetic] Nine eras. Each with its own look, music... and heroes.` | ≤ 5,4 |
| F | `[playful] Meet the locals. Everyone in town has something to say.` | ≤ 6,5 |
| G | `[cheerful] Choose your style. Skins for Capi, your shop, your street... even the clouds!` | ≤ 8,5 |
| H | `[mysterious, then excited] And a secret bonus era... Japan. Dragons included!` | ≤ 6,5 |
| I | `[confident, warm] CapyTap: Market. The pixel tapper you won't put down. Coming soon to Steam.` | ≤ 7,0 |
Якщо фраза довша за вікно — скорочу текст або зсуну такт (повідомте тривалість).
Тимчасовий «чорновий» голос для підгонки (Edge neural) лежить у `previews/voice/guide/` (`node previews/voice/gen_guide.js`); у фінал не йде.

## Чекає
1. Голос: користувачка генерує A–I в ElevenLabs (потрібен її акаунт і підписка) і кладе файли в `previews/voice/final/`.
2. «Окей» на музику й драфт; правки: тембри, енергія, довжина.
3. Фінальний рендер 1920×1080/60 (≈16 хв), накладання звуку, вивід `CapyTap_Market_trailer.mp4`; завантаження на Steam/YouTube робить користувачка.
