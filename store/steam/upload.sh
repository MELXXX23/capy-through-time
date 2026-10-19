#!/bin/bash
# Завантаження збірки в Steam (SteamPipe). Запуск: bash store/steam/upload.sh <APP_ID> <DEPOT_ID> <steam_логін>
# Потрібно: steamcmd (https://developer.valvesoftware.com/wiki/SteamCMD; шлях у STEAMCMD, за замовчуванням C:/steamcmd/steamcmd.exe),
#           свіжа збірка `bash desktop/build-steam.sh`. Пароль і Steam Guard steamcmd просить сам; я їх не бачу й не зберігаю.
# SetLive лишаємо порожнім: збірка потрапляє лише в Steamworks, на гілку default вмикає користувачка вручну (Builds → Set Build Live).
set -e
APP="$1"; DEPOT="$2"; USER_NAME="$3"
if [ -z "$APP" ] || [ -z "$DEPOT" ] || [ -z "$USER_NAME" ]; then echo "Використання: bash store/steam/upload.sh <APP_ID> <DEPOT_ID> <steam_логін>"; exit 1; fi
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
[ -f "$ROOT/desktop/dist-steam/win-unpacked/CapyTap Market.exe" ] || { echo "Нема збірки: спершу bash desktop/build-steam.sh"; exit 1; }
mkdir -p "$ROOT/previews/steam/steambuild_output"
VDF="$ROOT/previews/steam/app_build_$APP.vdf"
sed "s/APP_ID/$APP/; s/DEPOT_ID/$DEPOT/" "$HERE/app_build.vdf" > "$VDF"
STEAMCMD="${STEAMCMD:-C:/steamcmd/steamcmd.exe}"
"$STEAMCMD" +login "$USER_NAME" +run_app_build "$(cygpath -w "$VDF" 2>/dev/null || echo "$VDF")" +quit
echo "Готово. У Steamworks: App Admin → SteamPipe → Builds → обрати збірку → Set Build Live (default) після перевірки."
