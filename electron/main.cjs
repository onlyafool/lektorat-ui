const { app, BrowserWindow, shell, Menu, session } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

// Custom protocol for OAuth callbacks in Electron
function registerCustomProtocol() {
  try {
    if (process.platform === 'win32') {
      const isSet = app.setAsDefaultProtocolClient('lektorat')
      log('INFO', 'Custom protocol registered:', isSet)
    }
    app.on('open-url', (event, url) => {
      event.preventDefault()
      handleOAuthCallback(url)
    })
    app.on('open-file', (event, path) => {
      event.preventDefault()
    })
  } catch (error) {
    log('ERROR', 'Failed to register custom protocol:', error.message)
  }
}

function handleOAuthCallback(url) {
  // Extract the code from the URL and send to renderer
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('oauth-callback', url)
  }
}

// File-based logging - write next to the exe so it always works
let logFile = null
try {
  const logDir = path.join(path.dirname(process.execPath), 'logs')
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
  logFile = path.join(logDir, 'main-' + Date.now() + '.log')
} catch (_) {
  // Fallback: write to user data dir (only works when app is ready)
  try {
    const logDir2 = path.join(app.getPath('userData'), 'logs')
    if (!fs.existsSync(logDir2)) fs.mkdirSync(logDir2, { recursive: true })
    logFile = path.join(logDir2, 'main-' + Date.now() + '.log')
  } catch (_) {}
}

function log(level, ...args) {
  const ts = new Date().toISOString()
  const msg = `[${ts}] [${level}] ${args.join(' ')}`
  console.log(msg)
  if (logFile) {
    try { fs.appendFileSync(logFile, msg + '\n') } catch (_) {}
  }
}

// Global error handlers
process.on('uncaughtException', (err) => {
  log('FATAL', 'Uncaught exception:', err.stack || err.message || String(err))
})
process.on('unhandledRejection', (reason) => {
  log('FATAL', 'Unhandled rejection:', reason instanceof Error ? reason.stack || reason.message : String(reason))
})

let mainWindow

function showErrorPage(title, details) {
  if (!mainWindow) return
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="background:#111827;color:#e2e8f0;font-family:system-ui,sans-serif;padding:40px;max-width:800px;margin:0 auto">
<h1 style="color:#ef4444">${title}</h1>
<pre style="background:#1e293b;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;white-space:pre-wrap">${details}</pre>
<p style="color:#64748b;font-size:12px">Log-Datei: ${logFile || 'nicht verfügbar'}</p>
</body></html>`
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
}

function createWindow() {
  log('INFO', 'Creating BrowserWindow...')
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'Lektorat',
    icon: path.join(__dirname, '..', 'dist', 'favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  Menu.setApplicationMenu(null)

  if (isDev) {
    log('INFO', 'Dev mode - loading localhost:3000')
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
const filePath = path.join(__dirname, '..', 'dist', 'index.html')
log('INFO', 'Production mode - loading:', filePath)
log('INFO', '__dirname:', __dirname)
log('INFO', 'File exists:', fs.existsSync(filePath))

// Additional debug logs for CI white-screen issue
log('INFO', 'app.getAppPath():', app.getAppPath())
log('INFO', 'process.resourcesPath:', process.resourcesPath)
log('INFO', 'dist/ exists:', fs.existsSync(path.join(__dirname, '..', 'dist')))
log('INFO', 'dist/index.html exists:', fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html')))
log('INFO', 'assets/ exists:', fs.existsSync(path.join(__dirname, '..', 'dist', 'assets')))

    // Log the dist directory contents
    const distDir = path.join(__dirname, '..', 'dist')
    try {
      if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir)
        log('INFO', 'dist/ contents:', files.join(', '))
      } else {
        log('ERROR', 'dist/ directory does not exist at:', distDir)
      }
    } catch (e) {
      log('ERROR', 'Failed to read dist/ directory:', e.message)
    }

    // Log asar path
    log('INFO', 'App path:', app.getAppPath())
    log('INFO', 'Resource path:', process.resourcesPath)

    mainWindow.loadFile(filePath)

    // Open DevTools in production for debugging
    mainWindow.webContents.openDevTools()
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    log('ERROR', 'Page failed to load:', errorCode, errorDescription, 'URL:', validatedURL)
    showErrorPage(
      'Seite konnte nicht geladen werden',
      `Fehler ${errorCode}: ${errorDescription}\nURL: ${validatedURL}\nPfad: ${path.join(__dirname, '..', 'dist', 'index.html')}\n__dirname: ${__dirname}\nApp-Pfad: ${app.getAppPath()}\nResources: ${process.resourcesPath}\nLog: ${logFile || 'nicht verfügbar'}`
    )
  })

  mainWindow.webContents.on('did-finish-load', () => {
    log('INFO', 'Page loaded successfully')
  })

  mainWindow.webContents.on('console-message', (_event, level, message) => {
    const levels = ['verbose', 'info', 'warning', 'error']
    log('RENDERER', `[${levels[level] || level}] ${message}`)
  })

  mainWindow.webContents.on('crashed', (_event, code) => {
    log('FATAL', 'Renderer process crashed with code:', code)
    showErrorPage(
      'Renderer-Prozess abgestürzt',
      `Code: ${code}\nLog-Datei: ${logFile || 'nicht verfügbar'}`
    )
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log('FATAL', 'Render process gone:', details.reason, details.exitCode)
    showErrorPage(
      'Renderer-Prozess beendet',
      `Grund: ${details.reason}\nExit-Code: ${details.exitCode}\nLog-Datei: ${logFile || 'nicht verfügbar'}`
    )
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  log('INFO', 'App ready, Electron version:', process.versions.electron)
  log('INFO', 'Chrome version:', process.versions.chrome)
  log('INFO', 'Node version:', process.versions.node)
  log('INFO', 'Platform:', process.platform, process.arch)
  log('INFO', 'isPackaged:', app.isPackaged)
  
  // Register custom protocol for OAuth
  registerCustomProtocol()
  
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
