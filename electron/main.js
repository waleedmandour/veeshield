// VeeShield Electron Main Process
// Includes auto-update engine via electron-updater
const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// ─── Logging ────────────────────────────────────────────────────────────────────
log.transports.file.level = 'info';
log.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';
log.info('VeeShield starting...');

let mainWindow = null;
let tray = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// ─── Window Creation ─────────────────────────────────────────────────────────────

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
      // After showing the window, push current app version + run first check
      sendStatusToRenderer();
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

// ─── System Tray ──────────────────────────────────────────────────────────────────

let updateAvailableLabel = 'No updates available';

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

  const buildContextMenu = () => Menu.buildFromTemplate([
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
      label: updateAvailableLabel,
      enabled: updateAvailableLabel !== 'No updates available',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('update:show');
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

  refreshTray();
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  function refreshTray() {
    tray.setContextMenu(buildContextMenu());
    const version = app.getVersion();
    const updateText = updateAvailableLabel !== 'No updates available'
      ? `VeeShield v${version} — ${updateAvailableLabel}`
      : `VeeShield v${version} — Protected`;
    tray.setToolTip(updateText);
  }

  // Expose refresh for the update engine to call when status changes
  createTray._refresh = refreshTray;
}

function refreshTray() {
  if (createTray._refresh) createTray._refresh();
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────────

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

  // ─── Update IPC Handlers ────────────────────────────────────────────────────────

  ipcMain.handle('update:checkNow', async () => {
    log.info('Manual update check requested from renderer');
    try {
      const result = await autoUpdater.checkForUpdates();
      return {
        success: true,
        updateAvailable: result !== null,
        updateInfo: result ? {
          version: result.version,
          releaseDate: result.releaseDate,
          releaseNotes: result.releaseNotes,
          currentVersion: app.getVersion()
        } : null
      };
    } catch (error) {
      log.error('Manual update check failed:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update:downloadAndInstall', async () => {
    log.info('Download and install requested from renderer');
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      log.error('Download/update failed:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update:quitAndInstall', () => {
    log.info('Quit and install requested from renderer');
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle('update:getStatus', () => {
    return {
      currentVersion: app.getVersion(),
      updateAvailable: autoUpdater.updateInfoAndProvider?.info !== undefined,
      downloaded: autoUpdater.downloadUpdate !== undefined,
      error: null
    };
  });

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });
}

// Helper to send the full update status object to the renderer
function sendStatusToRenderer() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const info = autoUpdater.updateInfoAndProvider?.info;
  mainWindow.webContents.send('update:status', {
    currentVersion: app.getVersion(),
    updateAvailable: !!info,
    updateInfo: info ? {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: typeof info.releaseNotes === 'string'
        ? info.releaseNotes
        : JSON.stringify(info.releaseNotes),
    } : null,
  });
}

// ─── Auto-Updater Engine ────────────────────────────────────────────────────────────
//
// Strategy:
//   1. On app start: check once silently after 10s (don't annoy the user)
//   2. Every 4 hours: background check, only notify if a NEW version is found
//   3. When update found: download in background, notify user when ready
//   4. User decides: install now (restarts) or install on next quit
//   5. On quit: if an update is downloaded but not installed, install it
//
// Delta updates: electron-updater uses .blockmap files for differential
//   patches — only changed bytes are downloaded, saving ~80% bandwidth.

function setupAutoUpdater() {
  if (isDev) {
    log.info('Auto-updater disabled in development mode');
    return;
  }

  // Configure auto-updater
  autoUpdater.autoDownload = true;         // Download silently in background
  autoUpdater.autoInstallOnAppQuit = true; // Install when user closes app
  autoUpdater.allowPrerelease = false;      // Only stable releases
  autoUpdater.allowDowngrade = false;       // Don't go backwards
  autoUpdater.downloadUpdate = true;       // Use built-in download with progress
  autoUpdater.logger = log;

  log.info(`Current version: ${app.getVersion()}`);
  log.info(`Update feed: GitHub releases for waleedmandour/veeshield`);

  // ── Event: Update available ────────────────────────────────────────────────
  autoUpdater.on('update-available', (info) => {
    log.info(`Update available: v${info.version} (release: ${info.releaseDate})`);
    updateAvailableLabel = `✨ v${info.version} available`;
    refreshTray();

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:available', {
        version: info.version,
        currentVersion: app.getVersion(),
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string'
          ? info.releaseNotes
          : Array.isArray(info.releaseNotes)
            ? info.releaseNotes.map(n => n.note || n).join('\n')
            : JSON.stringify(info.releaseNotes),
      });
    }
  });

  // ── Event: Update NOT available ─────────────────────────────────────────────
  autoUpdater.on('update-not-available', (info) => {
    log.info(`No update available. Current: ${info.version}`);
    updateAvailableLabel = 'No updates available';
    refreshTray();

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:not-available', {
        version: info.version,
        currentVersion: app.getVersion(),
      });
    }
  });

  // ── Event: Download progress ──────────────────────────────────────────────
  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent);
    const transferredMB = (progress.transferred / (1024 * 1024)).toFixed(1);
    const totalMB = (progress.total / (1024 * 1024)).toFixed(1);
    const speedKBps = Math.round(progress.bytesPerSecond / 1024);

    log.info(`Download progress: ${percent}% (${transferredMB}/${totalMB} MB) @ ${speedKBps} KB/s`);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:progress', {
        percent,
        transferredMB,
        totalMB,
        speedKBps,
      });
    }
  });

  // ── Event: Update downloaded ────────────────────────────────────────────────
  autoUpdater.on('update-downloaded', (info) => {
    log.info(`Update downloaded: v${info.version}. Ready to install.`);
    updateAvailableLabel = `🔄 v${info.version} ready to install`;
    refreshTray();

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:downloaded', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string'
          ? info.releaseNotes
          : Array.isArray(info.releaseNotes)
            ? info.releaseNotes.map(n => n.note || n).join('\n')
            : JSON.stringify(info.releaseNotes),
      });
    }
  });

  // ── Event: Error ──────────────────────────────────────────────────────────
  autoUpdater.on('error', (error) => {
    // Filter out expected "no update" network errors in the log
    if (error.message?.includes('404') || error.message?.includes('ENOENT')) {
      log.info('No update found (feed returned 404 or file not found — this is normal)');
      return;
    }
    log.error('Auto-updater error:', error.message);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:error', {
        message: error.message,
        code: error.code || 'UNKNOWN',
      });
    }
  });

  // ── Schedule periodic checks ──────────────────────────────────────────────
  // First check: 15 seconds after startup (gives the window time to load)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log.warn('Initial update check failed:', err.message);
    });
  }, 15_000);

  // Periodic check: every 4 hours
  const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log.warn('Periodic update check failed:', err.message);
    });
  }, CHECK_INTERVAL_MS);

  log.info(`Auto-updater configured. Background checks every ${CHECK_INTERVAL_MS / 3600000}h`);
}

// ─── App Lifecycle ──────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();
  createTray();
  setupIpcHandlers();
  setupAutoUpdater();

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
