// ============================================================================
// preload.js — Context Bridge (QuickSort Pro v2)
// Safely exposes Node/Electron APIs to the sandboxed renderer process.
// ============================================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // ── Core ────────────────────────────────────────────────────────────────
  pickFolder:      ()           => ipcRenderer.invoke('pick-folder'),
  listImages:      (folder)     => ipcRenderer.invoke('list-images', folder),
  ensureFolders:   (root, map)  => ipcRenderer.invoke('ensure-folders', root, map),
  moveAndRename:   (src, dest, pat) => ipcRenderer.invoke('move-and-rename', src, dest, pat),

  // ── Undo ────────────────────────────────────────────────────────────────
  undoMove:        ()           => ipcRenderer.invoke('undo-move'),
  undoMany:        (count)      => ipcRenderer.invoke('undo-many', count),

  // ── Duplicates ──────────────────────────────────────────────────────────
  findDuplicates:  (folder)     => ipcRenderer.invoke('find-duplicates', folder),

  // ── Presets ─────────────────────────────────────────────────────────────
  loadPresets:     ()           => ipcRenderer.invoke('load-presets'),
  savePresets:     (presets)    => ipcRenderer.invoke('save-presets', presets),

  // ── Export ──────────────────────────────────────────────────────────────
  exportLog:       (log, fmt)   => ipcRenderer.invoke('export-log', log, fmt),

  // ── Utilities ───────────────────────────────────────────────────────────
  getFileStats:    (p)          => ipcRenderer.invoke('get-file-stats', p),
  checkFileExists: (p)          => ipcRenderer.invoke('check-file-exists', p),
  setFullscreen:   (flag)       => ipcRenderer.invoke('set-fullscreen', flag),
});
