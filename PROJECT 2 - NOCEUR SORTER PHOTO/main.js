// ============================================================================
// main.js — Electron Main Process (QuickSort Pro v2)
// Handles: window creation, IPC routing, file-system ops via fileOps.js
// ============================================================================

const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const fileOps = require('./fileOps');

const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

let mainWindow;

// ─── Window Creation ──────────────────────────────────────────────────────────
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1600, width),
    height: Math.min(1000, height),
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0f1117',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Required to load local file:// images from any folder
      webSecurity: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Forward drag-and-drop folder path to renderer
  mainWindow.webContents.on('will-navigate', (e) => e.preventDefault());
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ─── Core IPC Handlers ────────────────────────────────────────────────────────

ipcMain.handle('pick-folder', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Photo Folder',
  });
  return res.canceled ? null : res.filePaths[0];
});

ipcMain.handle('list-images', async (_, folder) => {
  return await fileOps.listImages(folder);
});

ipcMain.handle('ensure-folders', async (_, root, mappings) => {
  return await fileOps.ensureFolders(root, mappings);
});

ipcMain.handle('move-and-rename', async (_, srcPath, destDir, pattern) => {
  return await fileOps.moveAndRename(srcPath, destDir, pattern);
});

// ─── Undo (single + multi-step) ───────────────────────────────────────────────
ipcMain.handle('undo-move', async () => {
  return await fileOps.undoLast();
});

ipcMain.handle('undo-many', async (_, count) => {
  return await fileOps.undoMany(count);
});

// ─── Duplicate Detection ──────────────────────────────────────────────────────
ipcMain.handle('find-duplicates', async (_, folder) => {
  return await fileOps.findDuplicates(folder);
});

// ─── Presets (persisted to disk) ─────────────────────────────────────────────
ipcMain.handle('load-presets', async () => {
  return await fileOps.loadPresets();
});

ipcMain.handle('save-presets', async (_, presets) => {
  return await fileOps.savePresets(presets);
});

// ─── Export Log ───────────────────────────────────────────────────────────────
ipcMain.handle('export-log', async (_, log, format) => {
  const res = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Sorting Log',
    defaultPath: `sort-log-${new Date().toISOString().slice(0, 10)}.${format}`,
    filters: format === 'csv'
      ? [{ name: 'CSV', extensions: ['csv'] }]
      : [{ name: 'JSON', extensions: ['json'] }],
  });
  if (res.canceled) return false;
  return await fileOps.exportLog(log, res.filePath, format);
});

// ─── File Utilities ───────────────────────────────────────────────────────────
ipcMain.handle('get-file-stats', async (_, filePath) => {
  try {
    const stat = await fs.stat(filePath);
    return { size: stat.size, mtime: stat.mtime };
  } catch { return null; }
});

ipcMain.handle('check-file-exists', async (_, filePath) => {
  return await fs.pathExists(filePath);
});

// ─── Fullscreen ───────────────────────────────────────────────────────────────
ipcMain.handle('set-fullscreen', async (_, flag) => {
  mainWindow.setFullScreen(flag);
  return mainWindow.isFullScreen();
});
