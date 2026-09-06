import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Necessary for local DB/API dev
    },
    title: "The Greggory Systems OS",
    backgroundColor: '#002D62'
  })

  win.maximize()

  if (isDev) {
    // Try localhost first, then 127.0.0.1
    win.loadURL('http://localhost:5173').catch(() => {
      win.loadURL('http://127.0.0.1:5173');
    });
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  // Clear white flash by ensuring background color matches theme
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS('body { background-color: transparent; }')
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
