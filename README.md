# NOCEUR PHOTO SORTER

> Modern desktop application for fast photo & video sorting with clean UI, keyboard shortcuts, batch sorting, duplicate finder, and auto rename system.

![Version](https://img.shields.io/badge/version-2.0.0-black)
![React](https://img.shields.io/badge/react-18-blue)
![Electron](https://img.shields.io/badge/electron-26-47848F)
![Vite](https://img.shields.io/badge/vite-4-purple)
![License](https://img.shields.io/badge/license-MIT-green)

---

# 📸 About The Project

**NOCEUR SORTER** is a desktop application built with Electron + React designed to speed up the process of sorting large amounts of photos and videos.

This application is perfect for:

* Event photographers
* Videographers
* Content creators
* Wedding documentation teams
* Media organizers
* Personal gallery management
* Editors who frequently sort thousands of files

With keyboard shortcuts and auto folder mapping, users can organize files much faster compared to traditional manual drag & drop workflows.

---

# ✨ Main Features

## ⚡ Fast Sorting System

Sort files instantly using keyboard number shortcuts.

| Key | Destination Folder |
| --- | ------------------ |
| 1   | Category Folder 1  |
| 2   | Category Folder 2  |
| 3   | Category Folder 3  |
| etc | etc                |

Users simply press a number key to automatically move files.

---

## 🖼️ Photo & Video Support

Supported media formats:

### Photos

* JPG
* JPEG
* PNG
* WEBP
* HEIC (depending on OS support)

### Videos

* MP4
* MOV
* AVI
* MKV
* WEBM

---

## 🎬 Media Preview

Preview media directly before sorting.

Features include:

* Fullscreen image viewer
* Video player preview
* Filmstrip preview
* Fast navigation

---

## 🧠 Auto Rename System

After moving files, the app can automatically rename them using custom patterns.

Example:

```txt
{event}_{category}_{counter}
```

Result:

```txt
WEDDING_SELECT_001.jpg
WEDDING_SELECT_002.jpg
```

Available tokens:

| Token        | Function         |
| ------------ | ---------------- |
| `{event}`    | Event name       |
| `{category}` | Category name    |
| `{counter}`  | Increment number |

---

## 📂 Folder Mapping

Users can fully customize folder categories.

Example:

| Key | Folder    |
| --- | --------- |
| 1   | Select    |
| 2   | Reject    |
| 3   | Client    |
| 4   | Instagram |

---

## 🔄 Undo System

Mistakes can easily be reverted using:

* Undo button
* Shortcut:

```txt
CTRL + Z
```

---

## 🔍 Duplicate Finder

Detect duplicate files inside folders.

Useful for:

* Saving storage space
* Removing duplicated media
* Improving editing workflow

---

## 📊 Progress Tracking

Built-in progress tracking system.

Users can monitor:

* Total files
* Sorted files
* Sorting progress

---

## ⭐ Rating System

Users can rate media files.

Perfect for:

* Photo culling
* Best pick selection
* Client preview workflows

---

## 🎞️ Compare Mode

Compare multiple photos side-by-side to choose the best result.

Useful for:

* Burst shots
* Multiple poses
* Similar compositions

---

## 📋 Export Log

All sorting activities can be exported.

Useful for:

* Workflow backup
* Project documentation
* Sorting history audit

---

## 🎨 Modern UI

Built with:

* React
* TailwindCSS
* Electron
* Vite

Providing:

* Clean interface
* Fast rendering
* Responsive desktop UI
* Smooth workflow experience

---

# 🏗️ Tech Stack

| Technology  | Function              |
| ----------- | --------------------- |
| React       | Frontend UI           |
| Electron    | Desktop App Framework |
| Vite        | Build Tool            |
| TailwindCSS | Styling               |
| Node.js     | Runtime Environment   |
| fs-extra    | File System Utilities |

---

# 📁 Project Structure

```txt
NOCEUR SORTER/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── assets/
│   ├── App.jsx
│   ├── store.jsx
│   └── main.jsx
│
├── main.js
├── preload.js
├── fileOps.js
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

# ⚙️ Required Applications

Before running this project, make sure you install:

## 1. Node.js

Download:

[https://nodejs.org/](https://nodejs.org/)

Recommended version:

```txt
Node.js v18 or newer
```

Check installation:

```bash
node -v
```

---

## 2. Git

Download:

[https://git-scm.com/](https://git-scm.com/)

Check installation:

```bash
git --version
```

---

## 3. Visual Studio Code (Recommended)

Download:

[https://code.visualstudio.com/](https://code.visualstudio.com/)

Recommended Extensions:

* ES7 React Snippets
* Tailwind CSS IntelliSense
* Prettier
* Error Lens

---

# 🚀 Installation & Running

## 1. Clone Repository

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
```

Go to project directory:

```bash
cd REPOSITORY
```

---

## 2. Install Dependencies

```bash
npm install
```

If PowerShell shows this error:

```powershell
npm.ps1 cannot be loaded because running scripts is disabled
```

Run:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then choose:

```txt
Y
```

After that:

```bash
npm install
```

---

## 3. Run Development Mode

```bash
npm run dev
```

Electron app will automatically launch.

---

# 📦 Available Scripts

## Development

```bash
npm run dev
```

Runs:

* Vite development server
* Electron application

At the same time.

---

## Build Frontend

```bash
npm run build
```

Build output will be generated inside:

```txt
dist/
```

---

## Start Electron

```bash
npm start
```

Launch Electron app.

---

## Preview

```bash
npm run preview
```

Preview production build.

---

# 🖥️ How To Use

## 1. Open Folder

Click:

```txt
Open Folder
```

Or drag & drop folders directly into the app.

---

## 2. Setup Folder Mapping

Example:

| Key | Folder |
| --- | ------ |
| 1   | Select |
| 2   | Reject |
| 3   | Client |

---

## 3. Setup Event Name

Example:

```txt
WEDDING_JOHN
```

---

## 4. Sort Files

Press keyboard numbers:

```txt
1
2
3
```

Files will automatically:

* Move to destination folder
* Rename automatically
* Save into activity logs

---

# ⌨️ Keyboard Shortcuts

| Shortcut    | Function             |
| ----------- | -------------------- |
| 1 - 0       | Sort into categories |
| CTRL + Z    | Undo                 |
| Arrow Left  | Previous media       |
| Arrow Right | Next media           |
| Space       | Pause/Play video     |
| ?           | Open shortcut help   |

---

# 🧩 Core System Explanation

## Electron

Used to build desktop applications using JavaScript.

Architecture:

* Main Process
* Renderer Process
* Preload Bridge

---

## React

Used for:

* UI rendering
* State management
* Interactive components

---

## File Operations

File operations are handled using:

```txt
fs-extra
```

Main functions:

* Move files
* Rename files
* Create folders
* Read directories
* Duplicate detection

---

# 🔒 Security

Using:

* Preload bridge
* Context isolation
* IPC communication

To avoid direct renderer access to Node.js.

---

# 📈 Future Improvements

Possible future features:

* AI image scoring
* Face detection
* Blur detection
* RAW image preview
* Cloud synchronization
* Multi-user collaboration
* Auto backup system
* Lightroom integration
* GPU acceleration
* Metadata filtering
* EXIF viewer

---

# 🐛 Common Errors

## Error: npm.ps1 cannot be loaded

Fix:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Error: electron not found

Fix:

```bash
npm install
```

---

## Error: node_modules missing

Fix:

```bash
npm install
```

---

# 💡 Development Notes

This project uses:

```txt
Electron + React + Vite Architecture
```

Focused on:

* Fast desktop performance
* Smooth media rendering
* Efficient sorting workflow
* Modern scalable structure

---

# 👨‍💻 Author

Made with passion by NOCEUR.

---

# 📜 License

MIT License.

Free to use, modify, and distribute.

---

# ⭐ Support

If this project helps you, don't forget to:

* ⭐ Star this repository
* 🍴 Fork this project
* 🛠️ Contribute
* 📢 Share with others
