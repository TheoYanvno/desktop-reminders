# Desktop Reminders

A small desktop app built with [Electron](https://www.electronjs.org/): a live clock, and quick reminders ("stretch in 20 minutes") that pop up as real Windows, macOS or Linux notifications, even when the window is minimized.

## Run it

You need [Node.js](https://nodejs.org/) (the LTS version).

```text
npm install
npm start
```

## How it's built

| File | Runs in | Job |
|---|---|---|
| `main.js` | main process (Node.js) | opens the window, checks each reminder request, and shows the notification when it's due |
| `preload.js` | preload | exposes a small, safe API to the page as `window.desktop` with `contextBridge` |
| `index.html`, `renderer.js`, `style.css` | renderer (Chromium) | the clock and the reminder form |

The page and the main process talk over IPC: the page calls `window.desktop.remind(minutes, text)`, which uses `ipcRenderer.invoke`, and the main process answers with `ipcMain.handle`.

## Security

- `contextIsolation: true`, `nodeIntegration: false` and `sandbox: true`, so the page has no direct access to Node.js
- The preload exposes two specific functions, never `ipcRenderer` itself
- A Content Security Policy allows only the app's own files
- The main process validates every request (1 to 240 minutes, text up to 120 characters)

---

Built with help from AI coding tools, as part of my learning and portfolio.
