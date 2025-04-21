const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  uploadImage: (name) => ipcRenderer.invoke('upload-image', name),
  searchImages: (name) => ipcRenderer.invoke('search-images', name),
  deleteImage: (filePath) => ipcRenderer.invoke('delete-image', filePath),
  getImageInfo: (filePath) => ipcRenderer.invoke('get-image-info', filePath),
  copyImage: (filePath) => ipcRenderer.invoke('copy-image', filePath),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config'),
});
