// Де лежать інструменти Android і ключ. Спільне для setup-tools.js, make-key.js, build-aab.js, test-device.js.
'use strict';
const path = require('path');
const TOOLS = process.env.CAPY_ANDROID_TOOLS || 'D:\\AndroidTools';
const JDK = path.join(TOOLS, 'jdk'), SDK = path.join(TOOLS, 'sdk'), GRADLE_HOME = path.join(TOOLS, 'gradle'), AVD_HOME = path.join(TOOLS, 'avd');
const BUNDLETOOL = path.join(TOOLS, 'bundletool.jar');
const KEY_DIR = process.env.CAPY_KEY_DIR || 'C:\\GAMES\\_capy_keys', KEYSTORE = path.join(KEY_DIR, 'capytap-upload.jks');
const TEST_KEY = path.join(TOOLS, 'test-key.jks'), TEST_PASS = 'capy-test-only';              // лише для перевірки на своєму пристрої
function toolEnv(extra) {
  const env = { ...process.env, JAVA_HOME: JDK, ANDROID_HOME: SDK, ANDROID_SDK_ROOT: SDK, GRADLE_USER_HOME: GRADLE_HOME, ANDROID_AVD_HOME: AVD_HOME, ...extra };
  env.Path = [path.join(JDK, 'bin'), path.join(SDK, 'platform-tools'), process.env.Path || process.env.PATH].join(';');
  delete env.PATH; delete env.ELECTRON_RUN_AS_NODE;
  return env;
}
const sdkTool = rel => path.join(SDK, ...rel.split('/'));
const javaTool = name => path.join(JDK, 'bin', name + '.exe');
module.exports = { TOOLS, JDK, SDK, GRADLE_HOME, AVD_HOME, BUNDLETOOL, KEY_DIR, KEYSTORE, TEST_KEY, TEST_PASS, toolEnv, sdkTool, javaTool };
