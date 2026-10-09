# Підготовка до магазинів (Steam, Google Play, App Store)

Готово:
- `docs/privacy.html` — політика конфіденційності (uk/en); пошту ще треба вписати. Кнопка «Політика конфіденційності» є в налаштуваннях гри.
- `store/icons/` — іконки Android (mipmap + Play Store 512), iOS (усі розміри 20…1024), web. Генерація: `env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/mkstoreicons.js`.
- `mobile/` — обгортка Capacitor для Android і iOS (див. `mobile/README.md`).
- ПК: інсталятор NSIS (`CapyTapMarket-Setup-*.exe`) тепер вміє самооновлюватись із релізів GitHub (electron-updater, `desktop/main.js` `startAutoUpdate`, `build.publish`). Працює лише в Setup, не в portable. Щоб оновлення з'явились, нову версію треба збирати `npx electron-builder --win nsis --publish always` із токеном GH_TOKEN і підняти `version` у `desktop/package.json`.

Потрібно від користувачки:
1. Пошта розробника для політики конфіденційності й карток магазинів.
2. Назва студії: CapyTap Company (обрано). Для магазинів ще потрібне юридичне ім'я/адреса власника акаунта: це робиться в самих магазинах.
3. Акаунти: Steamworks ($100 за гру), Google Play Console ($25), Apple Developer ($99/рік; потрібен Mac).
4. Для Steam потрібні картинки-капсули (header 460×215, small capsule 231×87, main capsule 616×353, library 600×900, library hero 3840×1240) і скріншоти 1920×1080: їх я зроблю окремим раундом зі справжніх знімків гри, якщо скажеш.
