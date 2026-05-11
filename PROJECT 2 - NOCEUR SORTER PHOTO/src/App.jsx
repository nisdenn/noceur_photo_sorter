// ============================================================================
// App.jsx — Noceur Sorter
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StoreProvider, useStore, useCurrentImage, useImageRating } from './store';
import useKeyboard from './hooks/useKeyboard';
import logo from './assets/logo.png';
import {
  StarRating, FlagBadge, ProgressBar, MediaViewer, Filmstrip,
  CompareMode, CategoryStats, ShortcutsOverlay, ExportModal,
  PresetsModal, DuplicatesModal, ActivityLog, FilterBar, isVideoFile,
} from './components';

function Inner() {
  const { state, dispatch } = useStore();
  const currentImage = useCurrentImage(state);
  const rating       = useImageRating(state, currentImage);
  const [dragOver, setDragOver] = useState(false);
  const [fileStats, setFileStats] = useState(null);
  const preloadCache = useRef(new Map());

  useEffect(() => {
    window.api?.loadPresets().then(presets => dispatch({ type: 'SET_PRESETS', presets }));
  }, []);

  useEffect(() => {
    state.images.slice(state.index + 1, state.index + 4).forEach(src => {
      if (!isVideoFile(src) && !preloadCache.current.has(src)) {
        const img = new Image();
        img.src = `file://${src}`;
        preloadCache.current.set(src, img);
      }
    });
    const keys = [...preloadCache.current.keys()];
    if (keys.length > 12) keys.slice(0, keys.length - 12).forEach(k => preloadCache.current.delete(k));
  }, [state.index, state.images]);

  useEffect(() => {
    setFileStats(null);
    if (currentImage) window.api?.getFileStats(currentImage).then(setFileStats);
  }, [currentImage]);

  const handleSort = useCallback(async (filePaths, _key, category) => {
    if (!state.rootFolder) return;
    await window.api.ensureFolders(state.rootFolder, state.mappings);
    const destDir = `${state.rootFolder}\\${category}`;
    for (const filePath of filePaths) {
      const res = await window.api.moveAndRename(
        filePath, destDir,
        state.pattern.replace('{event}', state.eventName).replace('{category}', category)
      );
      if (res?.success) dispatch({ type: 'SORT_IMAGE', filePath, destPath: res.destPath, category });
    }
  }, [state.rootFolder, state.mappings, state.pattern, state.eventName, dispatch]);

  const handleUndo = useCallback(async () => {
    const res = await window.api?.undoMove();
    if (res?.restoredPath) dispatch({ type: 'UNDO_RESTORE', filePath: res.restoredPath, category: res.category });
  }, [dispatch]);

  useKeyboard({ onSort: handleSort, onUndo: handleUndo });

  const onDrop = async (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.path) {
      const list = await window.api.listImages(file.path);
      if (list.length) dispatch({ type: 'LOAD_IMAGES', folder: file.path, images: list });
    }
  };

  const pickFolder = async () => {
    const folder = await window.api.pickFolder();
    if (!folder) return;
    const list = await window.api.listImages(folder);
    dispatch({ type: 'LOAD_IMAGES', folder, images: list });
  };

  const findDuplicates = async () => {
    if (!state.rootFolder) return;
    dispatch({ type: 'FINDING_DUPLICATES' });
    dispatch({ type: 'TOGGLE_DUPLICATES' });
    const groups = await window.api.findDuplicates(state.rootFolder);
    dispatch({ type: 'SET_DUPLICATES', groups });
  };

  const batchSort = (key) => {
    const targets = state.selected.length > 0 ? state.selected : [currentImage].filter(Boolean);
    const category = state.mappings[key];
    if (category && targets.length) handleSort(targets, key, category);
  };

  const isVid = isVideoFile(currentImage);

  return (
    <div
      className={`h-screen flex flex-col bg-[var(--bg-800)] select-none ${dragOver ? 'ring-2 ring-inset ring-[var(--amber)]' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-900)] flex-shrink-0 z-10">
        
        {/* Logo + App Name */}
        <div className="flex items-center gap-2.5 mr-3">
          <img
            src={logo}
            alt="Noceur Logo"
            className="w-8 h-8 rounded object-cover"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-white" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
              NOCEUR
            </span>
            <span className="text-[10px] text-[var(--amber)] tracking-widest uppercase font-medium">
              Sorter
            </span>
          </div>
        </div>

        {/* File count chips */}
        <div className="flex items-center gap-2 text-xs">
          {state.allImages.length > 0 && (
            <>
              <span className="px-2 py-0.5 rounded bg-[var(--bg-500)] text-[var(--text-2)]">
                📷 {state.allImages.filter(f => !isVideoFile(f)).length} foto
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-300">
                🎬 {state.allImages.filter(f => isVideoFile(f)).length} video
              </span>
            </>
          )}
        </div>

        <div className="flex-1 text-xs font-mono text-[var(--text-3)] truncate">
          {state.rootFolder || 'Drop folder ke sini atau klik Buka Folder →'}
        </div>

        <FilterBar />
        <div className="w-px h-4 bg-[var(--border)]" />
        {state.rootFolder && <button className="btn btn-ghost text-xs" onClick={findDuplicates}>Duplikat</button>}
        <button className="btn btn-ghost text-xs" onClick={() => dispatch({ type: 'TOGGLE_PRESETS' })}>Preset</button>
        <button className="btn btn-ghost text-xs" onClick={() => dispatch({ type: 'TOGGLE_EXPORT' })} disabled={!state.log.length}>Export</button>
        <button className="btn btn-ghost text-xs" onClick={handleUndo} title="Undo (U / Ctrl+Z)">↩ Undo</button>
        <button className="btn btn-primary text-xs" onClick={pickFolder}>Buka Folder</button>
        <button className="btn btn-ghost text-xs" onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS' })}>?</button>
      </header>

      {/* ── Progress ──────────────────────────────────────────────────── */}
      {state.allImages.length > 0 && <ProgressBar />}

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Sidebar kiri */}
        {state.sidebarOpen && (
          <aside className="w-56 flex flex-col border-r border-[var(--border)] bg-[var(--bg-700)] flex-shrink-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div>
                <label className="text-xs text-[var(--text-3)] uppercase tracking-widest">Nama Event</label>
                <input className="mt-1 w-full bg-[var(--bg-600)] border border-[var(--border)] rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--amber)]"
                  value={state.eventName} onChange={e => dispatch({ type: 'SET_EVENT_NAME', eventName: e.target.value })} />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-2">Folder Tujuan</p>
                <div className="space-y-1.5">
                  {['1','2','3','4','5','6','7','8','9','0'].map(k => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="kbd">{k}</span>
                      <input
                        className="flex-1 bg-[var(--bg-600)] border border-[var(--border)] rounded px-2 py-1 text-xs outline-none focus:border-[var(--amber)]"
                        value={state.mappings[k] || ''}
                        placeholder="Nama folder…"
                        onChange={e => dispatch({ type: 'SET_MAPPINGS', mappings: { ...state.mappings, [k]: e.target.value } })}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] uppercase tracking-widest">Pola Rename</label>
                <input className="mt-1 w-full bg-[var(--bg-600)] border border-[var(--border)] rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--amber)]"
                  value={state.pattern} onChange={e => dispatch({ type: 'SET_PATTERN', pattern: e.target.value })} />
                <p className="text-[10px] text-[var(--text-3)] mt-1">Token: <code className="text-[var(--amber)]">{'{event} {category} {counter}'}</code></p>
              </div>
              <CategoryStats />
            </div>
          </aside>
        )}

        {/* Main viewer */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {state.compareMode ? (
            <CompareMode onPickBest={img => { dispatch({ type: 'SET_INDEX', index: state.images.indexOf(img) }); dispatch({ type: 'EXIT_COMPARE' }); }} />
          ) : (
            <>
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {currentImage ? (
                  <MediaViewer src={currentImage} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
                    <img src={logo} alt="Noceur" className="w-24 h-24 rounded-xl object-cover opacity-40" />
                    <div>
                      <p className="text-[var(--text-2)] font-medium text-lg" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.1em' }}>NOCEUR SORTER</p>
                      <p className="text-[var(--text-3)] text-sm mt-1">Buka folder atau drop di sini</p>
                      <p className="text-[var(--text-3)] text-xs mt-0.5">Mendukung foto & video</p>
                    </div>
                    <button className="btn btn-primary" onClick={pickFolder}>Buka Folder</button>
                  </div>
                )}
              </div>

              {/* Info bar */}
              {currentImage && (
                <div className="flex items-center gap-3 px-4 py-2 border-t border-[var(--border)] bg-[var(--bg-800)] flex-shrink-0 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isVid
                      ? <span className="text-xs font-bold text-purple-400 bg-purple-900/40 px-1.5 py-0.5 rounded">VIDEO</span>
                      : <span className="text-xs font-bold text-blue-400 bg-blue-900/40 px-1.5 py-0.5 rounded">FOTO</span>
                    }
                    <p className="text-xs font-mono text-[var(--text-1)] truncate">{currentImage.split(/[\\/]/).pop()}</p>
                    {fileStats && <p className="text-[10px] text-[var(--text-3)] font-mono flex-shrink-0">{fmtSize(fileStats.size)}</p>}
                  </div>
                  {!isVid && <StarRating filePath={currentImage} />}
                  <FlagBadge flag={rating.flag} onClick={() => dispatch({ type: 'SET_FLAG', filePath: currentImage, flag: 'none' })} />
                  {(!rating.flag || rating.flag === 'none') && (
                    <div className="flex gap-1">
                      <button className="btn text-xs flag-pick"   onClick={() => dispatch({ type: 'SET_FLAG', filePath: currentImage, flag: 'pick' })}>✓ W</button>
                      <button className="btn text-xs flag-reject" onClick={() => dispatch({ type: 'SET_FLAG', filePath: currentImage, flag: 'reject' })}>✗ Q</button>
                    </div>
                  )}
                  {state.selected.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-[var(--select)]/20 border border-[var(--select)]/40">
                      <span className="text-xs text-blue-300">{state.selected.length} dipilih</span>
                      <button className="text-[10px] text-blue-300 hover:text-white" onClick={() => dispatch({ type: 'CLEAR_SELECTED' })}>✕</button>
                    </div>
                  )}
                  <button className="btn btn-ghost text-xs" onClick={() => state.images.length > 1 && dispatch({ type: 'ENTER_COMPARE' })}>⊞ Compare</button>
                  <button className="btn btn-ghost text-xs" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>⊟ Panel</button>
                </div>
              )}

              {/* Sort buttons */}
              {currentImage && (
                <div className="flex gap-1 px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-900)] flex-shrink-0 flex-wrap">
                  {Object.entries(state.mappings).filter(([, v]) => v).map(([key, name]) => (
                    <button key={key} className="flex items-center gap-1.5 btn btn-ghost text-xs" onClick={() => batchSort(key)}>
                      <span className="kbd">{key}</span>
                      <span className="truncate max-w-32">{name}</span>
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button className="btn btn-ghost text-xs" onClick={() => dispatch({ type: 'PREV' })}>← Prev</button>
                  <button className="btn btn-ghost text-xs" onClick={() => dispatch({ type: 'NEXT' })}>Next →</button>
                </div>
              )}
            </>
          )}
          <Filmstrip />
        </main>

        {/* Log sidebar */}
        {state.log.length > 0 && (
          <aside className="w-52 border-l border-[var(--border)] bg-[var(--bg-700)] p-3 overflow-hidden flex flex-col flex-shrink-0">
            <ActivityLog />
          </aside>
        )}
      </div>

      {/* Modals */}
      {state.showShortcuts  && <ShortcutsOverlay />}
      {state.showExport     && <ExportModal />}
      {state.showPresets    && <PresetsModal />}
      {state.showDuplicates && <DuplicatesModal />}

      {dragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="panel p-10 text-center">
            <p className="text-3xl mb-2">📁</p>
            <p className="text-[var(--amber)] font-semibold">Drop folder foto/video</p>
          </div>
        </div>
      )}
    </div>
  );
}

function fmtSize(b) { return b > 1e6 ? `${(b/1e6).toFixed(1)}MB` : `${(b/1e3).toFixed(0)}KB`; }

export default function App() {
  return <StoreProvider><Inner /></StoreProvider>;
}
