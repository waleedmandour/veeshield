// VeeShield Electron Main Process
const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'VeeShield - AI Security Suite',
    icon: path.join(__dirname, '../public/veeshield-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    frame: true,
    backgroundColor: '#0f172a',
    show: false,
    autoHideMenuBar: true
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  if (!isDev) {
    const indexPath = path.join(__dirname, '../out/index.html');
    if (!fs.existsSync(indexPath)) {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>VeeShield - Error</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { text-align: center; max-width: 500px; padding: 2rem; }
            h1 { color: #ef4444; font-size: 2rem; margin-bottom: 1rem; }
            p { color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.6; }
            code { background: #1e293b; padding: 0.5rem 1rem; border-radius: 0.5rem; color: #38bdf8; display: inline-block; font-size: 0.875rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠ Application Error</h1>
            <p>VeeShield failed to load. The application files could not be found.</p>
            <p>Expected path: <code>${indexPath}</code></p>
            <p>Please reinstall VeeShield or contact support.</p>
          </div>
        </body>
        </html>
      `;
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
      return;
    }
  }

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      if (mainWindow) mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/veeshield-logo.png');
  let icon;
  
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open VeeShield',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Quick Scan',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('action', 'quick_scan');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit VeeShield',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('VeeShield - Protected');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function setupIpcHandlers() {
  ipcMain.handle('dialog:openFile', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Executables', extensions: ['exe', 'dll', 'bat', 'cmd', 'ps1', 'vbs'] }
      ]
    });
    return result.filePaths;
  });

  ipcMain.handle('dialog:openFolder', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    return result.filePaths;
  });

  ipcMain.handle('system:getInfo', () => ({
    platform: process.platform,
    arch: process.arch,
    version: process.getSystemVersion(),
    cpuUsage: process.getCPUUsage(),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  }));

  ipcMain.handle('file:read', async (_event, filePath) => {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      return { success: true, size: stats.size, content: content.toString('base64'), path: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('file:delete', async (_event, filePath) => {
    try {
      fs.unlinkSync(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('file:quarantine', async (_event, filePath) => {
    try {
      const quarantineDir = path.join(app.getPath('userData'), 'quarantine');
      if (!fs.existsSync(quarantineDir)) {
        fs.mkdirSync(quarantineDir, { recursive: true });
      }
      const fileName = path.basename(filePath);
      const quarantinePath = path.join(quarantineDir, `${Date.now()}_${fileName}`);
      fs.renameSync(filePath, quarantinePath);
      return { success: true, quarantinePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      // Allow file:// protocol (production) and localhost (development)
      if (parsedUrl.protocol === 'file:') return;
      const allowedOrigins = ['localhost:3000', 'localhost'];
      if (!allowedOrigins.includes(parsedUrl.host)) {
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
