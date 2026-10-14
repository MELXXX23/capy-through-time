#!/bin/bash
# Автоперевірка перед випуском: bash tools/autotest.sh [--quick]
# Підсумок (≈15 рядків) лежить у tools/autotest_last.txt; на екран виводиться лише він.
cd "$(dirname "$0")/.."
CAPY_NOGOD=1 node desktop/prepare.js >/dev/null || exit 1
env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/autotest.js "$@" >/dev/null 2>&1
code=$?
tail -n 25 tools/autotest_last.txt
exit $code
