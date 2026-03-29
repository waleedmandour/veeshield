// VeeShield Electron Preload Script
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── Dialog APIs ────────────────────────────────────────────────────────────────
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),

  // ─── System APIs ───────────────────────────────────────────────────────────────
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),

  // ─── File APIs ──────────────────────────────────────────────────────────────────
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  deleteFile: (filePath) => ipcRenderer.invoke('file:delete', filePath),
  quarantineFile: (filePath) => ipcRenderer.invoke('file:quarantine', filePath),

  // ─── Update APIs ────────────────────────────────────────────────────────────────
  checkForUpdates: () => ipcRenderer.invoke('update:checkNow'),
  downloadAndInstall: () => ipcRenderer.invoke('update:downloadAndInstall'),
  quitAndInstall: () => ipcRenderer.invoke('update:quitAndInstall'),
  getUpdateStatus: () => ipcRenderer.invoke('update:getStatus'),

  // ─── Update Event Listeners ────────────────────────────────────────────────────
  // These fire automatically from the auto-updater engine in the main process.

  onUpdateAvailable: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update:available', handler);
    // Return unsubscribe function for React cleanup
    return () => ipcRenderer.removeListener('update:available', handler);
  },

  onUpdateNotAvailable: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update:not-available', handler);
    return () => ipcRenderer.removeListener('update:not-available', handler);
  },

  onUpdateProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update:progress', handler);
    return () => ipcRenderer.removeListener('update:progress', handler);
  },

  onUpdateDownloaded: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update:downloaded', handler);
    return () => ipcRenderer.removeListener('update:downloaded', handler);
  },

  onUpdateError: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update:error', handler);
    return () => ipcRenderer.removeListener('update:error', handler);
  },

  // ─── Generic Action Events ─────────────────────────────────────────────────────
  onAction: (callback) => {
    ipcRenderer.on('action', (_event, action) => callback(action));
  },
  removeActionListener: () => {
    ipcRenderer.removeAllListeners('action');
  },
});
