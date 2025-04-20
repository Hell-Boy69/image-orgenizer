const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('pick-images', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }]
  });
  return result.filePaths;
});

ipcMain.handle('save-images', async (event, { groupName, imagePaths }) => {
  const targetDir = path.join(app.getPath('userData'), groupName);
  await fs.ensureDir(targetDir);
  for (const imgPath of imagePaths) {
    const fileName = path.basename(imgPath);
    await fs.copy(imgPath, path.join(targetDir, fileName));
  }
  return true;
});

ipcMain.handle('load-images', async (event, groupName) => {
  const dirPath = path.join(app.getPath('userData'), groupName);
  if (!fs.existsSync(dirPath)) return [];
  const files = await fs.readdir(dirPath);
  return files.map(file => path.join(dirPath, file));
});
