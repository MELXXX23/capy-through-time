# Телефони: Google Play і App Store

Це обгортка [Capacitor](https://capacitorjs.com): та сама гра (`game.html`) у «рамці» застосунку. Код гри не копіюється вручну: `sync-web.js` бере актуальну версію й правки для телефона робить лише у своїй копії.

## Чим телефонна збірка відрізняється від сайту
- Уся гра всередині застосунку, працює без інтернету з першого запуску.
- Шрифт локальний, Google Fonts нема.
- Режиму бога нема: прапорці вимкнені, а код власника не спрацьовує.
- «Написати розробникам» відкриває поштову програму гравця, форма Web3Forms вимкнена.
- Реклама лише за наявності `mobile/ads.json` (не в git). Нема файлу = реклами нема.
- Оплати лише за наявності `mobile/iap.json` (зразок `iap.example.json`, кроки `store/PLAY_PAYMENTS.md`). Нема файлу = у застосунку немає ні бібліотеки оплат, ні дозволів для неї.
- **Збереження окремі від сайту:** той самий ключ `capyThroughTime_save`, але інша адреса (`https://localhost`), тому прогрес із сайту сам не переїде. Гравець переносить його кодом збереження з налаштувань.

## Як зібрати Android
Інструменти лежать окремо в `D:\AndroidTools` (JDK 21, Android SDK), у систему нічого не ставиться. Видалити їх = видалити папку.
```bash
cd mobile
node setup-tools.js            # один раз; --emulator додає емулятор
node make-key.js               # один раз: створює ключ, пароль вводить власник гри
node build-aab.js              # AAB у previews/play/aab/, пароль спитає в терміналі
```
Перед кожним новим AAB підніми `versionCode` в `android/app/build.gradle` (1, 2, 3 …). Цільова версія Android: `android/variables.gradle`.

- `node build-aab.js --test`: одноразовий ключ для перевірки на своєму пристрої; такий файл у Play Console не завантажувати.
- `node build-aab.js --head`: гра з останнього коміту, коли в `src/` зараз хтось працює.

## Ключ підпису
`C:\GAMES\_capy_keys\capytap-upload.jks`, поза git. Правила збереження: `store/PLAY_CHECKLIST.md`.

## Магазин
Тексти й анкети: `store/PLAY.md`. Покроковий список: `store/PLAY_CHECKLIST.md`. Скріни й графіка: `store/play/`. Реклама на майбутнє: `store/ADS_PLAN.md`.

## iOS (на Mac)
```bash
cd mobile && npm install && npm run ios:add && npm run ios
```
Іконки з `store/icons/ios` додаються в Xcode → Assets → AppIcon.
