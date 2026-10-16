# PROGRESS — CapyTap: Market

Тут лише ОСТАННІ раунди (максимум 6 пунктів). Старі: `archive/PROGRESS_*.md` (не читай без потреби; шукай через Grep). Новий пункт додавай у кінець, коротко (до ~8 рядків); ротація: `node tools/progress_rotate.js`.

## 113. Кнопка «Параметри реклами» (UMP) (р. 57, гілка android-wrapper, не закомічено)
- `275_ads.js`: якщо Google повертає `privacyOptionsRequirementStatus: REQUIRED`, у налаштуваннях під «Політикою» з'являється кнопка «Параметри реклами» (`showPrivacyOptionsForm`); тексти `adPrivacyBtn` (uk/en). Лише Android-обгортка.
- Перевірено підробним плагіном (`previews/ads_test/probe_priv.js`) і autotest --quick ✓; на справжньому Android ще ні. `AD_ID` у маніфесті прибрано — підтверджено.

## 114. Steam: план і заготовки (р. 57, гілка android-wrapper)
- `store/STEAM.md`: порядок і строки (Steamworks, $100, «Скоро», 30 днів), розміри капсул (виправлено в `store/README.md`), тексти uk/en, теги, технічні правки (автооновлення вимкнути для Steam, збірка `win-unpacked`, Auto-Cloud, досягнення — за бажанням). 9 скріншотів з itch уже 1920×1080.
- Відкрите: ціна (безкоштовно чи платно), акаунт Steamworks — за користувачкою. Нічого не публікувалось.

## 115. Steam: збірка, автооновлення, капсули-зразки (р. 57, гілка android-wrapper, мітка before-steam)
- Рішення: \$2.99, платна, без реклами й покупок усередині. `desktop/build-steam.sh` → `dist-steam/win-unpacked` без режиму бога; `main.js` не оновлює збірку з `app/steam.flag`. Запуск перевірено.
- Капсули (header, small, main, vertical, library, hero 3840×1240, logo) зібрані `previews/steam/compose.js` зі справжнього кадра в `previews/steam/out` (не в git). Чекають «окей» користувачки.

## 116. Steam: усе для виходу, що не залежить від акаунта (р. 57, гілка android-wrapper)
- Тексти звірено з грою (8 бонус-ігор, а не «в кожній епосі»; виправлено і `store/PLAY.md`), системні вимоги виміряно (~600 МБ ОЗП, 273 МБ диск), `store/STEAM.md` — чеклист користувачки; `store/steam/` — шаблон і `upload.sh` (SteamPipe), потрібні App ID, Depot ID, steamcmd.
- Картинки за слотами: `previews/steam/ready/` (не в git). Чекає: анкета Steamworks і $100 (користувачка).
