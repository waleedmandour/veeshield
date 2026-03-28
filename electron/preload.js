// VeeShield Electron Preload Script
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog APIs
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  
  // System APIs
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
  
  // File APIs
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  deleteFile: (filePath) => ipcRenderer.invoke('file:delete', filePath),
  quarantineFile: (filePath) => ipcRenderer.invoke('file:quarantine', filePath),
  
  // Event listeners
  onAction: (callback) => {
    ipcRenderer.on('action', (_event, action) => callback(action));
  },
  removeActionListener: () => {
    ipcRenderer.removeAllListeners('action');
  }
});
