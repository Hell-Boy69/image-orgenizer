const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // File operations
  openFolder: () => ipcRenderer.invoke('open-folder'),
  copyImage: (args) => ipcRenderer.invoke('copy-image', args),
  deleteImage: (path) => ipcRenderer.invoke('delete-image', path),
  
  // Group operations
  renameGroup: (args) => ipcRenderer.invoke('rename-group', args),
  deleteGroup: (path) => ipcRenderer.invoke('delete-group', path),
  
  // Utils
  showToast: (message) => ipcRenderer.send('show-toast', message)
});