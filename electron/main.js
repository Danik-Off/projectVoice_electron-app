const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const { spawn } = require('child_process')
const isDev = process.env.NODE_ENV === 'development'

let serverProcess = null

function startServer() {
  if (!isDev && !serverProcess) {
    const serverPath = path.join(__dirname, '../server.js')
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    })
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`)
    })
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`)
    })
  }
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../public/vite.svg'),
    show: false,
    autoHideMenuBar: true
  })

  // Показываем окно когда оно готово
  win.once('ready-to-show', () => {
    win.show()
  })

  // Загружаем приложение
  if (isDev) {
    win.loadURL('http://localhost:3000')
    // Открываем DevTools в режиме разработки
    win.webContents.openDevTools()
  } else {
    // Запускаем сервер и загружаем приложение
    startServer()
    // Ждем немного для запуска сервера
    setTimeout(() => {
      win.loadURL('http://localhost:3000')
    }, 2000)
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill()
    }
    app.quit()
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
})