#!/bin/bash
# Автоперевірка перед випуском: bash tools/autotest.sh [--quick]
cd "$(dirname "$0")/.."
CAPY_NOGOD=1 node desktop/prepare.js >/dev/null || exit 1
env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/autotest.js "$@"
