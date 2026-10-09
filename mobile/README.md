# Телефони: Google Play і App Store

Це обгортка [Capacitor](https://capacitorjs.com): та сама гра (`game.html`) у «рамці» застосунку. Код гри не копіюється вручну: `npm run web` бере актуальний `game.html`.

## Що вже готово
- `package.json`, `capacitor.config.json` (ідентифікатор `com.capy.capytapmarket`, змінити можна ДО першого випуску; потім змінювати не можна).
- `sync-web.js` — готує `mobile/www` (гра + локальний шрифт).
- Іконки всіх розмірів: `store/icons/android` і `store/icons/ios` (генерує `tools/mkstoreicons.js`).
- Політика конфіденційності: `docs/privacy.html` (адреса після публікації: https://melxxx23.github.io/capy-through-time/privacy.html). У ній треба вписати пошту розробника замість позначки.

## Що потрібно від тебе (я цього зробити не можу)
1. Android: акаунт Google Play Console (одноразово $25), встановлений Android Studio. iOS: акаунт Apple Developer ($99/рік) і Mac із Xcode (на Windows збирати iOS неможливо).
2. Підпис застосунку (ключ Android keystore; сертифікати Apple) — створюється на твоєму боці, ключі нікому не передавай.
3. Рейтинг віку, опис, скріншоти, країни — заповнюються в консолях магазинів.

## Як зібрати Android (на ПК з Android Studio)
```
cd mobile
npm install
npm run android:add     # один раз
npm run android         # оновить гру й відкриє Android Studio → Build → Generate Signed Bundle (AAB)
```
Іконки: скопіюй вміст `store/icons/android/mipmap-*` у `android/app/src/main/res/` (замінить стандартні).

## iOS (на Mac)
```
cd mobile && npm install && npm run ios:add && npm run ios
```
Іконки з `store/icons/ios` додаються в Xcode → Assets → AppIcon.

## Перевірити перед відправкою
- Вертикаль і горизонталь, виріз камери (iPhone), кнопка «Назад» на Android. Плагіни App (Назад/пауза), Haptics (вібрація) і Preferences (копія збереження в застосунку) уже вказані в package.json, а гра сама користується ними лише всередині обгортки (код: nativeMirror, setupNativeApp, buzz).
- Звук після першого дотику (правила браузерних рушіїв).
