// start-electron.js
// Menunggu Vite server siap, lalu launch Electron
// Lebih reliable dari wait-on di Windows

const { spawn } = require('child_process');
const http = require('http');

const VITE_URL = 'http://localhost:5173';
const MAX_RETRIES = 30;
let retries = 0;

function checkServer(cb) {
  http.get(VITE_URL, (res) => {
    cb(true);
  }).on('error', () => {
    retries++;
    if (retries >= MAX_RETRIES) {
      console.error('[launcher] Vite tidak bisa diakses setelah 15 detik. Coba jalankan ulang.');
      process.exit(1);
    }
    setTimeout(() => checkServer(cb), 500);
  });
}

console.log('[launcher] Menunggu Vite server...');

checkServer(() => {
  console.log('[launcher] Vite siap! Membuka Electron...');

  const electron = require('electron');
  const proc = spawn(String(electron), ['.', '--dev'], {
    stdio: 'inherit',
    shell: false,
  });

  proc.on('close', (code) => {
    process.exit(code || 0);
  });
});
