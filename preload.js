// The preload script runs before the page, with access to a few Electron tools. It exposes
// a small, safe API to the page as window.desktop, instead of giving the page all of Node.js.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  remind: (minutes, text) => ipcRenderer.invoke('remind', minutes, text),
  onReminderDone: (callback) => ipcRenderer.on('reminder-done', (_event, text) => callback(text)),
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});
