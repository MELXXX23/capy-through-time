// Головний процес Electron: відкриває вікно з грою. Саму гру (app/game.html) тут не чіпаємо.
'use strict';
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const WINDOW_TITLE = 'Capy Through Time — Капі крізь час';
const DEBUG = process.argv.includes('--debug');      // npm run debug → відкриває гру з ?debug=1

app.setName('Capy Through Time');

// Дозволяємо лише один запуск: другий клік по ярлику просто піднімає вікно, яке вже відкрите
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: WINDOW_TITLE,
    icon: path.join(__dirname, 'app', 'icon.ico'),
    backgroundColor: '#2a1d1a',
    autoHideMenuBar: true,
    show: false,                         // показуємо, коли гра вже намальована, щоб не блимав білий екран
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      autoplayPolicy: 'no-user-gesture-required'   // музика й звуки без зайвих обмежень
    }
  });

  mainWindow.removeMenu();               // без стандартного меню
  mainWindow.setTitle(WINDOW_TITLE);
  // гра сама змінює <title> при перемиканні мови — а ми хочемо одну назву вікна
  mainWindow.on('page-title-updated', (e) => e.preventDefault());
  mainWindow.once('ready-to-show', () => mainWindow.show());

  const wc = mainWindow.webContents;
  wc.setVisualZoomLevelLimits(1, 1);     // жодного зуму: пікселі завжди чіткі (гра сама підбирає цілий масштаб)

  wc.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    // F11 — повноекранний режим (Esc виходить із нього)
    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    } else if (input.key === 'Escape' && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      event.preventDefault();
    } else if ((input.control || input.meta) && ['+', '-', '=', '0'].includes(input.key)) {
      event.preventDefault();            // Ctrl + / − не змінюють масштаб сторінки
    }
  });

  // посилання назовні відкриваємо у звичайному браузері, а не всередині гри
  wc.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  wc.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) { event.preventDefault(); if (/^https?:\/\//i.test(url)) shell.openExternal(url); }
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'game.html'), DEBUG ? { query: { debug: '1' } } : undefined);
  mainWindow.on('closed', () => { mainWindow = null; });
}

if (gotLock) {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });

  app.on('window-all-closed', () => { app.quit(); });
}
