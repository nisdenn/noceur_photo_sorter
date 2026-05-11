// ============================================================================
// useKeyboard.js — Keyboard Shortcut Handler (QuickSort Pro v2)
//
// ALL keyboard shortcuts are defined here in one place for easy maintenance.
// The hook is mounted inside the StoreProvider so it has full access to state.
//
// Shortcut Map:
//   Arrow keys / A/D     → Navigate images
//   1–9                  → Sort image to mapped folder (+ auto-advance)
//   Ctrl+1–5             → Set star rating (no move)
//   W                    → Flag as Pick (green)
//   Q                    → Flag as Reject (red)
//   Ctrl+Z / U           → Undo last move
//   C                    → Toggle compare mode
//   F                    → Toggle fullscreen
//   ?                    → Toggle shortcut overlay
//   Escape               → Close overlays / exit compare
//   Space                → Toggle pick flag
//   Delete / Backspace   → Flag as reject
// ============================================================================

import { useEffect, useCallback } from 'react';
import { useStore, useCurrentImage } from '../store';

export default function useKeyboard({ onSort, onUndo }) {
  const { state, dispatch } = useStore();
  const currentImage = useCurrentImage(state);

  const handleKey = useCallback(async (e) => {
    const tag = e.target.tagName;
    // Don't intercept keys in input/textarea
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    const key = e.key;
    const ctrl = e.ctrlKey || e.metaKey;

    // ── Escape: close everything ────────────────────────────────────────────
    if (key === 'Escape') {
      if (state.compareMode)    dispatch({ type: 'EXIT_COMPARE' });
      if (state.showShortcuts)  dispatch({ type: 'TOGGLE_SHORTCUTS' });
      if (state.showExport)     dispatch({ type: 'TOGGLE_EXPORT' });
      if (state.showPresets)    dispatch({ type: 'TOGGLE_PRESETS' });
      if (state.showDuplicates) dispatch({ type: 'TOGGLE_DUPLICATES' });
      return;
    }

    // ── Shortcut overlay ────────────────────────────────────────────────────
    if (key === '?') {
      dispatch({ type: 'TOGGLE_SHORTCUTS' });
      return;
    }

    // ── Fullscreen ──────────────────────────────────────────────────────────
    if (key === 'f' || key === 'F') {
      if (ctrl) return; // don't intercept Ctrl+F (find)
      const nextFs = !state.fullscreen;
      dispatch({ type: 'TOGGLE_FULLSCREEN' });
      window.api?.setFullscreen(nextFs);
      return;
    }

    // ── Compare mode ────────────────────────────────────────────────────────
    if ((key === 'c' || key === 'C') && !ctrl) {
      if (state.compareMode) {
        dispatch({ type: 'EXIT_COMPARE' });
      } else if (state.images.length > 1) {
        dispatch({ type: 'ENTER_COMPARE' });
      }
      return;
    }

    // ── Undo ────────────────────────────────────────────────────────────────
    if ((ctrl && key.toLowerCase() === 'z') || (!ctrl && key.toLowerCase() === 'u')) {
      e.preventDefault();
      onUndo && onUndo();
      return;
    }

    // No images loaded — stop here
    if (!state.images.length) return;

    // ── Navigation ──────────────────────────────────────────────────────────
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      dispatch({ type: 'NEXT' });
      return;
    }
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      dispatch({ type: 'PREV' });
      return;
    }
    if (key === 'ArrowDown') {
      dispatch({ type: 'NEXT' });
      return;
    }
    if (key === 'ArrowUp') {
      dispatch({ type: 'PREV' });
      return;
    }

    // ── Star Rating (Ctrl + 1–5, no move) ────────────────────────────────────
    if (ctrl && key >= '1' && key <= '5' && currentImage) {
      e.preventDefault();
      dispatch({ type: 'SET_RATING', filePath: currentImage, stars: parseInt(key) });
      return;
    }

    // ── Clear rating (Ctrl+0) ───────────────────────────────────────────────
    if (ctrl && key === '0' && currentImage) {
      e.preventDefault();
      dispatch({ type: 'SET_RATING', filePath: currentImage, stars: 0 });
      return;
    }

    // ── Pick flag: W or Space ────────────────────────────────────────────────
    if ((key === 'w' || key === 'W' || key === ' ') && !ctrl && currentImage) {
      e.preventDefault();
      const current = state.ratings[currentImage]?.flag;
      dispatch({
        type: 'SET_FLAG',
        filePath: currentImage,
        flag: current === 'pick' ? 'none' : 'pick',
      });
      return;
    }

    // ── Reject flag: Q or Delete ─────────────────────────────────────────────
    if ((key === 'q' || key === 'Q' || key === 'Delete' || key === 'Backspace') && !ctrl && currentImage) {
      e.preventDefault();
      const current = state.ratings[currentImage]?.flag;
      dispatch({
        type: 'SET_FLAG',
        filePath: currentImage,
        flag: current === 'reject' ? 'none' : 'reject',
      });
      return;
    }

    // ── Sort: 1–9 (move image to mapped folder) ───────────────────────────────
    if (!ctrl && key >= '1' && key <= '9' && currentImage) {
      const category = state.mappings[key];
      if (!category) return;
      onSort && onSort(
        state.compareMode ? state.compareImages : [currentImage],
        key,
        category
      );
      return;
    }

    // ── Sort: 0 (often mapped to rejection folder) ────────────────────────────
    if (!ctrl && key === '0' && currentImage) {
      const category = state.mappings['0'];
      if (!category) return;
      onSort && onSort([currentImage], '0', category);
      return;
    }

  }, [state, dispatch, currentImage, onSort, onUndo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);
}
