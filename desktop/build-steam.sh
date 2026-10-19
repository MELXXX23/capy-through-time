#!/bin/bash
# Збірка для Steam: розпакована папка (SteamPipe вантажить папку, не portable/Setup), БЕЗ режиму бога, БЕЗ автооновлення.
# Результат: desktop/dist-steam/win-unpacked/ (її вміст = depot). Запуск: bash desktop/build-steam.sh (з кореня проєкту).
set -e
cd "$(dirname "$0")"
CAPY_NOGOD=1 node prepare.js
if grep -q "DEV_OPEN_BUILD = true" app/game.html || grep -q "window.__debug = true" app/game.html; then
  echo "ПОМИЛКА: у app/game.html лишився режим бога. Збірку зупинено."; exit 1
fi
echo steam > app/steam.flag                       # main.js бачить прапорець і не запускає автооновлення
trap 'rm -f app/steam.flag' EXIT
ELECTRON_BUILDER_CACHE="${ELECTRON_BUILDER_CACHE:-C:/GAMES/capy-through-time/previews/ebcache}" \
  npx electron-builder --win dir --config.directories.output=dist-steam \
  --config.electronDist=node_modules/electron/dist --config.electronVersion=33.4.11
echo "Готово: desktop/dist-steam/win-unpacked/ (без режиму бога, без автооновлення)."
