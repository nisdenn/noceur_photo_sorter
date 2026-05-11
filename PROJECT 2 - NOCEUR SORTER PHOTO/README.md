# QuickSort Pro v2 — Professional Photo Sorting Tool

A keyboard-first, professional-grade photo sorting application for photographers built with Electron + React.

---

## 🚀 Setup & Run

### Requirements
- Node.js >= 18
- npm or yarn

### Install & Start (Dev mode)

```bash
npm install
npm run dev
```

### Build for production

```bash
npm run build
npm run preview
```

> **Note:** `webSecurity: false` is set in `main.js` so Electron can load `file://` images from arbitrary folders.

---

## 📁 File Structure

```
quicksort-pro/
├── main.js              # Electron main process (window, IPC)
├── preload.js           # Context bridge (secure API to renderer)
├── fileOps.js           # File system: move, rename, undo, duplicates, presets
├── index.html           # HTML entry point (Google Fonts loaded here)
├── vite.config.js       # Vite bundler config
├── tailwind.config.js   # Tailwind CSS config
├── src/
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles + design tokens (CSS variables)
│   ├── store.jsx        # Global state (Context + useReducer)
│   ├── App.jsx          # Root component — wires everything
│   ├── hooks/
│   │   └── useKeyboard.js   # All keyboard shortcuts in one place
│   └── components/
│       └── index.jsx        # All UI components
```

---

## ⌨️ Keyboard Shortcuts

| Key               | Action                          |
|-------------------|---------------------------------|
| `→` / `D`         | Next image                      |
| `←` / `A`         | Previous image                  |
| `1–9`             | Sort to mapped folder           |
| `Ctrl+1–5`        | Set star rating (no sort)       |
| `Ctrl+0`          | Clear star rating               |
| `W` / `Space`     | Flag as Pick (toggle)           |
| `Q` / `Delete`    | Flag as Reject (toggle)         |
| `Ctrl+Z` / `U`    | Undo last sort                  |
| `C`               | Enter/exit compare mode         |
| `F`               | Toggle fullscreen               |
| `?`               | Keyboard shortcuts overlay      |
| `Escape`          | Close overlays / exit mode      |
| `Scroll`          | Zoom in/out on image            |
| `Double-click`    | Zoom to 250%                    |
| `Shift+Click`     | Select range in filmstrip       |
| `Ctrl+Click`      | Multi-select in filmstrip       |

---

## ✨ Features

### Core (Original)
- Select source folder
- Display images one-by-one
- Keyboard 1–9 to sort into folders
- Undo last move
- Auto rename with pattern tokens

### New in v2

**Batch Selection**
- Shift+click or Ctrl+click in filmstrip to select multiple images
- Sort action applies to all selected images at once

**Zoom & Inspection**
- Scroll wheel to zoom in/out
- Double-click to jump to 250%
- Click-drag to pan when zoomed
- Reset zoom button

**Compare Mode**
- Press `C` to compare current + next 2 images side-by-side
- Click the best image to mark it
- Press `Esc` to exit

**Rating System**
- 1–5 star ratings (stored in app state, shown in filmstrip)
- Pick flag (W) and Reject flag (Q) per image
- Ratings included in export log

**Progress Tracking**
- "230 / 1200" counter with amber highlight
- Sorted / Remaining / Total stats
- Progress bar with smooth animation
- Per-category count in sidebar

**Smart Navigation**
- Auto-advance after sorting
- Filter: All / Unrated / Picks / Rejects / Rated

**Duplicate Detection**
- Click "Duplicates" button to scan
- Hash-based detection (first 64KB MD5)
- Groups shown visually with thumbnails

**Preset System**
- Built-in presets: Wedding, Event, Product, Portrait
- Save current mappings as named preset
- Presets persist to `~/.quicksortpro/presets.json`

**Export Log**
- Export as CSV or JSON
- Includes: filename, destination, category, stars, flag

**Filmstrip**
- Scrollable thumbnail row at bottom
- Click to jump; Shift+click for range select
- Highlights: active (amber), selected (blue), pick (green dot), reject (red dot)

**Drag & Drop**
- Drop a folder directly into the app to load images

**Fullscreen**
- Press `F` to toggle fullscreen mode

**Image Preloading**
- Preloads next 3 images in background for smooth navigation

**Error Handling**
- Broken images handled gracefully (opacity fallback)
- Rename conflicts resolved automatically with `_N` suffix
- Missing files checked before move

---

## 🎨 Design System

All colors are CSS variables in `src/index.css`:

```css
--bg-900 to --bg-400   Dark background scale
--amber / --amber-lt   Primary accent (amber/gold)
--pick                 Green for flagged picks
--reject               Red for rejected images
--select               Blue for multi-select
--text-1/2/3           Text hierarchy
```

Font: **DM Sans** (UI) + **JetBrains Mono** (code/counters)

---

## 🏗️ Architecture

- **State**: `useReducer` + React Context (no Redux needed)
- **Side effects**: all IPC calls in `App.jsx` handlers — clean separation
- **Keyboard**: single `useKeyboard` hook with all shortcuts in one place
- **File ops**: all Node.js/fs code isolated in `fileOps.js` (main process only)
- **Components**: pure presentational, receive data via `useStore()`
