#!/bin/bash
# Публічна збірка для ПК (itch, Steam, друзі): БЕЗ режиму бога.
# Режим бога лише в особистому exe на столі (звичайний prepare.js без CAPY_NOGOD).
# Запуск: bash desktop/build-public.sh   (з кореня проєкту; не з терміналу користувачки — кеш electron-builder там порожній)
set -e
cd "$(dirname "$0")"
CAPY_NOGOD=1 node prepare.js
if grep -q "DEV_OPEN_BUILD = true" app/game.html || grep -q "window.__debug = true" app/game.html; then
  echo "ПОМИЛКА: у app/game.html лишився режим бога. Збірку зупинено."; exit 1
fi
ELECTRON_BUILDER_CACHE="${ELECTRON_BUILDER_CACHE:-$(cd "$(dirname "$0")/.." && pwd -W)/previews/ebcache}" \
  npx electron-builder --win portable \
  --config.electronDist=node_modules/electron/dist --config.electronVersion=33.4.11 \
  --config.portable.artifactName='CapyTapMarket-Public-${version}.exe'
echo "Готово: desktop/dist/CapyTapMarket-Public-*.exe (без режиму бога)."
