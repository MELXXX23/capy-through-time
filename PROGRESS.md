# PROGRESS — CapyTap: Market

Тут лише ОСТАННІ раунди (максимум 6 пунктів). Старі: `archive/PROGRESS_*.md` (не читай без потреби; шукай через Grep). Новий пункт додавай у кінець, коротко (до ~8 рядків); ротація: `node tools/progress_rotate.js`.

## 112. Політика під рекламу і Data safety (р. 57, не опубліковано)
- `docs/privacy.html` (uk/en, 16.10.2026): реклама лише в Android-версії (AdMob, нагороджені ролики, дитячий режим, без AD_ID, згода UMP); сайт/itch/ПК без реклами. НЕ запушено: публікувати разом з Android-випуском.
- `store/PLAY.md`: відповіді для Data safety (білд з рекламою: приблизне місце за IP, ідентифікатори пристрою, взаємодія з рекламою, діагностика; AD_ID ні) і для білда без реклами; звірити з довідкою Google перед відправкою.

## 113. Кнопка «Параметри реклами» (UMP) (р. 57, гілка android-wrapper, не закомічено)
- `275_ads.js`: якщо Google повертає `privacyOptionsRequirementStatus: REQUIRED`, у налаштуваннях під «Політикою» з'являється кнопка «Параметри реклами» (`showPrivacyOptionsForm`); тексти `adPrivacyBtn` (uk/en). Лише Android-обгортка.
- Перевірено підробним плагіном (`previews/ads_test/probe_priv.js`) і autotest --quick ✓; на справжньому Android ще ні. `AD_ID` у маніфесті прибрано — підтверджено.

## 114. Steam: план і заготовки (р. 57, гілка android-wrapper)
- `store/STEAM.md`: порядок і строки (Steamworks, $100, «Скоро», 30 днів), розміри капсул (виправлено в `store/README.md`), тексти uk/en, теги, технічні правки (автооновлення вимкнути для Steam, збірка `win-unpacked`, Auto-Cloud, досягнення — за бажанням). 9 скріншотів з itch уже 1920×1080.
- Відкрите: ціна (безкоштовно чи платно), акаунт Steamworks — за користувачкою. Нічого не публікувалось.

## 115. Steam: збірка, автооновлення, капсули-зразки (р. 57, гілка android-wrapper, мітка before-steam)
- Рішення: \$2.99, платна, без реклами й покупок усередині. `desktop/build-steam.sh` → `dist-steam/win-unpacked` без режиму бога; `main.js` не оновлює збірку з `app/steam.flag`. Запуск перевірено.
- Капсули (header, small, main, vertical, library, hero 3840×1240, logo) зібрані `previews/steam/compose.js` зі справжнього кадра в `previews/steam/out` (не в git). Чекають «окей» користувачки.
