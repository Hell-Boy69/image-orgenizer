const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  pickImages: () => ipcRenderer.invoke('pick-images'),
  saveImages: (groupName, imagePaths) => ipcRenderer.invoke('save-images', { groupName, imagePaths }),
  loadImages: (groupName) => ipcRenderer.invoke('load-images', groupName)
});
