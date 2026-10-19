const { app, BrowserWindow } = require('electron');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), OUT = process.argv[2];
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 720, show: false, webPreferences: { partition: 'probe' } });
  win.webContents.setAudioMuted(true);
  await win.loadFile(path.join(ROOT, 'game.html'));
  await new Promise(r => setTimeout(r, 1500));
  const r = await win.webContents.executeJavaScript('JSON.stringify({en:translations.en,skin:SKIN_LINES,tour:TOUR_TXT,cut:CUT_TXT,about:NEWS_ABOUT,guide:NP_GUIDE,soon:NP_SOON,sec:NP_SEC})');
  fs.writeFileSync(OUT, r);
  app.exit(0);
});
