import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
    },
    title: 'The Greggory Systems OS',
    backgroundColor: '#002D62',
  });

  win.maximize();

  if (isDev) {
    // Try localhost first, then 127.0.0.1
    win.loadURL('http://localhost:5173').catch(() => {
      win.loadURL('http://127.0.0.1:5173');
    });
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Clear white flash by ensuring background color matches theme
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS('body { background-color: transparent; }');
  });
}

function setupAutoUpdater() {
  // Auto-update only makes sense in packaged builds — never attempt a network
  // check during dev (it would fail/hang). Missing optional dep is tolerated.
  if (!app.isPackaged) return;
  try {
    const setup = require('./electron-updater-setup.js');
    setup.checkForUpdatesAndNotify();
  } catch (error) {
    console.warn('[AUTO-UPDATE] disabled:', error.message);
  }
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
