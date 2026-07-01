const { app, BrowserWindow, shell, Menu } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'Lektorat',
    icon: path.join(__dirname, '..', 'public', 'favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    const filePath = path.join(__dirname, '..', 'dist', 'index.html')
    console.log('[Main] Loading file:', filePath)
    mainWindow.loadFile(filePath)
    // Open DevTools in production for debugging (can be removed later)
    mainWindow.webContents.openDevTools()
  }

  Menu.setApplicationMenu(null)

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription)
    // Show a visible error page instead of blank white
    mainWindow.loadURL(`data:text/html,
      <html>
        <body style="background:#111827;color:#e2e8f0;font-family:sans-serif;padding:40px;text-align:center">
          <h1>Seite konnte nicht geladen werden</h1>
          <p style="color:#94a3b8">Fehler ${errorCode}: ${errorDescription}</p>
          <p style="color:#94a3b8">Pfad: ${path.join(__dirname, '..', 'dist', 'index.html')}</p>
        </body>
      </html>
    `)
  })

  mainWindow.webContents.on('console-message', (_event, level, message) => {
    console.log('[Renderer]', message)
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
