const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const trash = require('trash'); // Using the updated package

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    },
    show: false // Prevent flash of blank window
  });

  mainWindow.loadFile('index.html');

  // Show window only when fully loaded
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'bottom' });
    }
  });

  // Force refresh if needed
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.reload();
  });
}

// IPC Handlers
ipcMain.handle('open-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Image Folder'
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('copy-image', async (_, { src, dest }) => {
  try {
    await fs.copy(src, path.join(dest, path.basename(src)));
    return { success: true };
  } catch (error) {
    console.error('Copy failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-image', async (_, filePath) => {
  try {
    await trash(filePath);
    return { success: true };
  } catch (error) {
    console.error('Delete failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('rename-group', async (_, { oldPath, newName }) => {
  try {
    const newPath = path.join(path.dirname(oldPath), newName);
    await fs.rename(oldPath, newPath);
    return { success: true, newPath };
  } catch (error) {
    console.error('Rename failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-group', async (_, folderPath) => {
  try {
    await fs.remove(folderPath);
    return { success: true };
  } catch (error) {
    console.error('Delete group failed:', error);
    return { success: false, error: error.message };
  }
});

// Window management
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});