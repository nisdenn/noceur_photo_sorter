// ============================================================================
// fileOps.js — File System Operations (QuickSort Pro v2 - OPTIMIZED)
//
// Optimizations:
//  1. In-memory counter per folder (no readdir on every sort)
//  2. Folder creation cached (ensureFolders only once per session)
//  3. Fast path: move is fire-and-forget friendly
// ============================================================================

const fs     = require('fs-extra');
const path   = require('path');
const crypto = require('crypto');
const os     = require('os');

// ─── Media extensions ────────────────────────────────────────────────────────
const IMAGE_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.heic',
  '.tiff', '.tif', '.bmp', '.gif',
  '.raw', '.cr2', '.cr3', '.nef', '.arw', '.dng',
]);
const VIDEO_EXTS = new Set([
  '.mp4', '.mov', '.avi', '.mkv', '.webm',
  '.m4v', '.wmv', '.flv', '.3gp', '.mts', '.m2ts', '.mpg', '.mpeg',
]);
const MEDIA_EXTS = new Set([...IMAGE_EXTS, ...VIDEO_EXTS]);

const PRESETS_FILE = path.join(os.homedir(), '.quicksortpro', 'presets.json');

function isVideo(p) { return VIDEO_EXTS.has(path.extname(p || '').toLowerCase()); }
function isImage(p) { return IMAGE_EXTS.has(path.extname(p || '').toLowerCase()); }

// ─── In-memory caches ────────────────────────────────────────────────────────
// folderCounters: { [destDir]: number } — avoids readdir on every sort
const folderCounters = new Map();

// ensuredFolders: Set<string> — tracks which folders we already created
const ensuredFolders = new Set();

// ─── Undo Stack ───────────────────────────────────────────────────────────────
let undoStack = [];

// ─── List Media ───────────────────────────────────────────────────────────────
async function listImages(folder) {
  try {
    const entries = await fs.readdir(folder, { withFileTypes: true });
    const files = entries
      .filter(e => e.isFile() && MEDIA_EXTS.has(path.extname(e.name).toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    // Reset caches when loading a new folder
    folderCounters.clear();
    ensuredFolders.clear();
    return files.map(f => path.join(folder, f.name));
  } catch (err) {
    console.error('[fileOps] listImages error:', err.message);
    return [];
  }
}

// ─── Ensure Folders (CACHED — only hits disk once per folder per session) ────
async function ensureFolders(root, mappings) {
  try {
    const promises = [];
    for (const folderName of Object.values(mappings)) {
      if (!folderName) continue;
      const full = path.join(root, folderName);
      if (!ensuredFolders.has(full)) {
        ensuredFolders.add(full);
        promises.push(fs.ensureDir(full));
      }
    }
    await Promise.all(promises);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── Move & Rename (FAST — in-memory counter, no readdir) ────────────────────
async function moveAndRename(srcPath, destDir, pattern) {
  try {
    if (!(await fs.pathExists(srcPath))) {
      return { success: false, error: `Source not found: ${srcPath}` };
    }

    // ensureDir only if not already done
    if (!ensuredFolders.has(destDir)) {
      await fs.ensureDir(destDir);
      ensuredFolders.add(destDir);
    }

    const ext = path.extname(srcPath);

    // Use in-memory counter instead of readdir
    if (!folderCounters.has(destDir)) {
      // First time: seed from actual file count (one-time cost per folder)
      try {
        const existing = await fs.readdir(destDir);
        const count = existing.filter(f => MEDIA_EXTS.has(path.extname(f).toLowerCase())).length;
        folderCounters.set(destDir, count);
      } catch {
        folderCounters.set(destDir, 0);
      }
    }

    const current = folderCounters.get(destDir);
    folderCounters.set(destDir, current + 1); // increment immediately
    const counter = String(current + 1).padStart(4, '0');

    let baseName = (pattern || '{counter}')
      .replace('{counter}', counter)
      .replace('{ext}', ext.replace('.', ''))
      .replace(/[\\/:*?"<>|]/g, '');

    let destPath = path.join(destDir, `${baseName}${ext}`);

    // Conflict check (very fast, usually 0 iterations)
    let attempt = 1;
    while (await fs.pathExists(destPath)) {
      destPath = path.join(destDir, `${baseName}_${attempt}${ext}`);
      attempt++;
    }

    await fs.move(srcPath, destPath);

    undoStack.push({ from: destPath, to: srcPath, category: path.basename(destDir) });
    return { success: true, destPath };
  } catch (err) {
    // Roll back counter on failure
    if (folderCounters.has(destDir)) {
      folderCounters.set(destDir, folderCounters.get(destDir) - 1);
    }
    return { success: false, error: err.message };
  }
}

// ─── Undo ─────────────────────────────────────────────────────────────────────
async function undoLast() {
  const last = undoStack.pop();
  if (!last) return null;
  try {
    await fs.move(last.from, last.to);
    // Roll back counter
    const destDir = path.dirname(last.from);
    if (folderCounters.has(destDir)) {
      folderCounters.set(destDir, Math.max(0, folderCounters.get(destDir) - 1));
    }
    return { restoredPath: last.to, category: last.category };
  } catch (err) {
    undoStack.push(last);
    return { error: err.message };
  }
}

async function undoMany(count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const r = await undoLast();
    if (!r) break;
    results.push(r);
  }
  return results;
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────
async function computeFileHash(filePath) {
  try {
    const buf = Buffer.alloc(65536);
    const fd = await fs.open(filePath, 'r');
    await fs.read(fd, buf, 0, 65536, 0);
    await fs.close(fd);
    return crypto.createHash('md5').update(buf).digest('hex');
  } catch { return null; }
}

async function findDuplicates(folder) {
  try {
    const media = await listImages(folder);
    const hashMap = new Map();
    for (const p of media) {
      const hash = await computeFileHash(p);
      if (!hash) continue;
      if (!hashMap.has(hash)) hashMap.set(hash, []);
      hashMap.get(hash).push(p);
    }
    return [...hashMap.values()].filter(g => g.length > 1);
  } catch (err) {
    return [];
  }
}

// ─── Presets ──────────────────────────────────────────────────────────────────
function getDefaultPresets() {
  return [
    {
      id: 'default', name: 'Default (Foto & Video)',
      mappings: { '1': '[ Best Foto ]', '2': '[ Need Edit ]', '3': '[ Delete ]' },
      pattern: '{counter}', eventName: 'Project2025',
    },
    {
      id: 'wedding', name: 'Wedding',
      mappings: { '1': '[ Best Foto ]', '2': '[ Need Edit ]', '3': '[ Delete ]', '4': '[ Ceremony ]', '5': '[ Reception ]', '6': '[ Candid ]' },
      pattern: '{event}_{counter}', eventName: 'Wedding2025',
    },
    {
      id: 'event', name: 'Event',
      mappings: { '1': '[ Best Foto ]', '2': '[ Need Edit ]', '3': '[ Delete ]', '4': '[ Groups ]', '5': '[ Venue ]' },
      pattern: '{event}_{counter}', eventName: 'Event2025',
    },
    {
      id: 'product', name: 'Product',
      mappings: { '1': '[ Best Foto ]', '2': '[ Need Edit ]', '3': '[ Delete ]', '4': '[ Detail ]', '5': '[ Context ]' },
      pattern: '{event}_{counter}', eventName: 'Product2025',
    },
  ];
}

async function loadPresets() {
  try {
    if (await fs.pathExists(PRESETS_FILE)) return await fs.readJSON(PRESETS_FILE);
    return getDefaultPresets();
  } catch { return getDefaultPresets(); }
}

async function savePresets(presets) {
  try {
    await fs.ensureDir(path.dirname(PRESETS_FILE));
    await fs.writeJSON(PRESETS_FILE, presets, { spaces: 2 });
    return true;
  } catch { return false; }
}

// ─── Export Log ───────────────────────────────────────────────────────────────
async function exportLog(log, filePath, format) {
  try {
    if (format === 'json') {
      await fs.writeJSON(filePath, log, { spaces: 2 });
    } else {
      const header = 'Time,Filename,Destination,Category,Stars,Flag\n';
      const rows = log.filter(e => e.from).map(e =>
        [e.time, path.basename(e.from||''), path.basename(e.to||''), e.category||'', e.stars||0, e.flag||'none']
          .map(v => `"${String(v).replace(/"/g,'""')}"`)
          .join(',')
      );
      await fs.writeFile(filePath, header + rows.join('\n'), 'utf8');
    }
    return true;
  } catch { return false; }
}

module.exports = {
  listImages, ensureFolders, moveAndRename,
  undoLast, undoMany, findDuplicates,
  loadPresets, savePresets, exportLog,
  isVideo, isImage,
};
