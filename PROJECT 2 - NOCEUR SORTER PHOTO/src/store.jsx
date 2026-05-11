// ============================================================================
// store.jsx — Global State (QuickSort Pro v2)
// ============================================================================

import React, { createContext, useContext, useReducer } from 'react';

// ─── Initial State ────────────────────────────────────────────────────────────
export const initialState = {
  rootFolder:    null,
  allImages:     [],
  images:        [],
  sortedPaths:   [],
  index:         0,

  // Default mappings sesuai request user
  mappings: {
    '1': '[ Best Foto ]',
    '2': '[ Need Edit ]',
    '3': '[ Delete ]',
  },
  pattern:   '{counter}',
  eventName: 'Project2025',

  ratings: {},      // { [filePath]: { stars: 0–5, flag: 'none'|'pick'|'reject' } }
  selected: [],
  compareMode:   false,
  compareImages: [],
  fullscreen:    false,
  showShortcuts: false,
  showExport:    false,
  showPresets:   false,
  showDuplicates:false,
  sidebarOpen:   true,
  filter:        'all',
  log:           [],
  presets:       [],
  duplicateGroups:   [],
  findingDuplicates: false,
  categoryStats: {},
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getFiltered(allImages, sortedPaths, ratings, filter) {
  const sortedSet = new Set(sortedPaths);
  const unsorted = allImages.filter(img => !sortedSet.has(img));
  switch (filter) {
    case 'picks':   return unsorted.filter(img => ratings[img]?.flag === 'pick');
    case 'rejects': return unsorted.filter(img => ratings[img]?.flag === 'reject');
    case 'unrated': return unsorted.filter(img => { const r = ratings[img]; return !r || (!r.stars && r.flag !== 'pick' && r.flag !== 'reject'); });
    case 'rated':   return unsorted.filter(img => ratings[img]?.stars > 0);
    default:        return unsorted;
  }
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_IMAGES':
      return { ...state, rootFolder: action.folder, allImages: action.images, images: action.images, sortedPaths: [], index: 0, selected: [], compareMode: false, compareImages: [], log: [], categoryStats: {}, filter: 'all' };

    case 'SET_INDEX':   return { ...state, index: Math.max(0, Math.min(action.index, state.images.length - 1)) };
    case 'NEXT':        return { ...state, index: Math.min(state.index + 1, state.images.length - 1) };
    case 'PREV':        return { ...state, index: Math.max(state.index - 1, 0) };

    case 'SORT_IMAGE': {
      const newSortedPaths = [...state.sortedPaths, action.filePath];
      const newImages = getFiltered(state.allImages, newSortedPaths, state.ratings, state.filter);
      const newIndex = Math.min(state.index, Math.max(0, newImages.length - 1));
      const newCatStats = { ...state.categoryStats, [action.category]: (state.categoryStats[action.category] || 0) + 1 };
      const logEntry = { time: new Date().toLocaleTimeString(), type: 'sort', from: action.filePath, to: action.destPath, category: action.category, stars: state.ratings[action.filePath]?.stars || 0, flag: state.ratings[action.filePath]?.flag || 'none' };
      return { ...state, sortedPaths: newSortedPaths, images: newImages, index: newIndex, categoryStats: newCatStats, log: [logEntry, ...state.log], selected: state.selected.filter(s => s !== action.filePath) };
    }

    case 'UNDO_RESTORE': {
      const newSortedPaths = state.sortedPaths.filter(p => p !== action.filePath);
      const newImages = getFiltered(state.allImages, newSortedPaths, state.ratings, state.filter);
      const restoredIdx = newImages.indexOf(action.filePath);
      const newCatStats = { ...state.categoryStats };
      if (action.category && newCatStats[action.category]) newCatStats[action.category] = Math.max(0, newCatStats[action.category] - 1);
      return { ...state, sortedPaths: newSortedPaths, images: newImages, index: Math.max(0, Math.min(restoredIdx >= 0 ? restoredIdx : state.index, newImages.length - 1)), categoryStats: newCatStats, log: [{ time: new Date().toLocaleTimeString(), type: 'undo', filePath: action.filePath }, ...state.log] };
    }

    case 'SET_RATING': {
      const prev = state.ratings[action.filePath] || {};
      return { ...state, ratings: { ...state.ratings, [action.filePath]: { ...prev, stars: action.stars } } };
    }
    case 'SET_FLAG': {
      const prev = state.ratings[action.filePath] || {};
      return { ...state, ratings: { ...state.ratings, [action.filePath]: { ...prev, flag: action.flag } } };
    }

    case 'SET_SELECTED':    return { ...state, selected: action.selected };
    case 'TOGGLE_SELECTED': return { ...state, selected: state.selected.includes(action.filePath) ? state.selected.filter(p => p !== action.filePath) : [...state.selected, action.filePath] };
    case 'SELECT_RANGE': {
      const toIdx = state.images.indexOf(action.filePath);
      if (toIdx < 0) return state;
      const start = Math.min(state.index, toIdx);
      const end = Math.max(state.index, toIdx);
      return { ...state, selected: [...new Set([...state.selected, ...state.images.slice(start, end + 1)])] };
    }
    case 'CLEAR_SELECTED': return { ...state, selected: [] };

    case 'ENTER_COMPARE':     return { ...state, compareMode: true, compareImages: state.images.slice(state.index, state.index + 3).filter(Boolean) };
    case 'EXIT_COMPARE':      return { ...state, compareMode: false, compareImages: [] };
    case 'SET_COMPARE_IMAGES':return { ...state, compareImages: action.images };

    case 'SET_FILTER': {
      const filtered = getFiltered(state.allImages, state.sortedPaths, state.ratings, action.filter);
      return { ...state, filter: action.filter, images: filtered, index: 0 };
    }

    case 'TOGGLE_FULLSCREEN':   return { ...state, fullscreen:     !state.fullscreen };
    case 'TOGGLE_SHORTCUTS':    return { ...state, showShortcuts:  !state.showShortcuts };
    case 'TOGGLE_EXPORT':       return { ...state, showExport:     !state.showExport };
    case 'TOGGLE_PRESETS':      return { ...state, showPresets:    !state.showPresets };
    case 'TOGGLE_DUPLICATES':   return { ...state, showDuplicates: !state.showDuplicates };
    case 'TOGGLE_SIDEBAR':      return { ...state, sidebarOpen:    !state.sidebarOpen };

    case 'SET_MAPPINGS':   return { ...state, mappings:  action.mappings };
    case 'SET_PATTERN':    return { ...state, pattern:   action.pattern };
    case 'SET_EVENT_NAME': return { ...state, eventName: action.eventName };

    case 'SET_PRESETS':    return { ...state, presets: action.presets };
    case 'LOAD_PRESET':    return { ...state, mappings: action.preset.mappings, pattern: action.preset.pattern, eventName: action.preset.eventName };
    case 'SAVE_PRESET': {
      const exists = state.presets.findIndex(p => p.name === action.preset.name);
      return { ...state, presets: exists >= 0 ? state.presets.map((p, i) => i === exists ? action.preset : p) : [...state.presets, action.preset] };
    }
    case 'DELETE_PRESET':      return { ...state, presets: state.presets.filter(p => p.id !== action.id) };
    case 'SET_DUPLICATES':     return { ...state, duplicateGroups: action.groups, findingDuplicates: false };
    case 'FINDING_DUPLICATES': return { ...state, findingDuplicates: true };

    default: return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}

export function useCurrentImage(state)       { return state.images[state.index] || null; }
export function useImageRating(state, path)  { return state.ratings[path] || { stars: 0, flag: 'none' }; }
export function useSortedCount(state)        { return state.sortedPaths.length; }
export function useProgress(state)           {
  const total = state.allImages.length;
  const sorted = state.sortedPaths.length;
  return { total, sorted, remaining: total - sorted, pct: total > 0 ? Math.round((sorted / total) * 100) : 0 };
}
