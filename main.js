const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const userDataPath = app.getPath('userData');
const imageDir = path.join(userDataPath, 'images');
const configPath = path.join(userDataPath, 'config.json');

if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('upload-image', async (_, folderName) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg'] }] });
  if (canceled) return [];

  const saveFolder = path.join(imageDir, folderName);
  if (!fs.existsSync(saveFolder)) fs.mkdirSync(saveFolder, { recursive: true });

  const savedPaths = [];

  for (const file of filePaths) {
    const fileName = path.basename(file);
    const cleanName = fileName.replace(/[|<>:"/\\?*]/g, '-');
    const dest = path.join(saveFolder, cleanName);
    await fs.promises.copyFile(file, dest);
    savedPaths.push(dest);
  }

  return savedPaths;
});

ipcMain.handle('search-images', async (_, folderName) => {
  const folderPath = path.join(imageDir, folderName);
  if (!fs.existsSync(folderPath)) return [];

  const files = await fs.promises.readdir(folderPath);
  return files.map(file => ({
    name: file,
    path: path.join(folderPath, file)
  }));
});

ipcMain.handle('delete-image', async (_, filePath) => {
  try {
    await fs.promises.unlink(filePath);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('get-image-info', async (_, filePath) => {
  const stats = await fs.promises.stat(filePath);
  return {
    size: stats.size,
    modified: stats.mtime
  };
});

ipcMain.handle('copy-image', async (_, filePath) => {
  const { filePath: destPath } = await dialog.showSaveDialog({ defaultPath: path.basename(filePath) });
  if (!destPath) return false;

  await fs.promises.copyFile(filePath, destPath);
  return true;
});

ipcMain.handle('save-config', async (_, config) => {
  await fs.promises.writeFile(configPath, JSON.stringify(config));
});

ipcMain.handle('load-config', async () => {
  try {
    const data = await fs.promises.readFile(configPath);
    return JSON.parse(data);
  } catch {
    return {};
  }
});
