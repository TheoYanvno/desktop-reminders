// The main process: starts the app, opens the window, and does the things only a desktop
// app can do (here, system notifications). It runs in Node.js, not in a web page.
const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('node:path');

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 560,
    minWidth: 340,
    minHeight: 460,
    title: 'Desktop Reminders',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // the page and the preload can't touch each other's variables
      nodeIntegration: false,   // the page can't use Node.js directly
      sandbox: true,
    },
  });
  win.removeMenu();
  win.loadFile('index.html');
}

// The page asks for a reminder; the main process waits, then shows a system notification.
ipcMain.handle('remind', (event, minutes, text) => {
  const delay = Number(minutes);
  const message = String(text ?? '').trim().slice(0, 120) || 'Time is up!';
  if (!Number.isFinite(delay) || delay < 1 || delay > 240) {
    return { ok: false, error: 'Pick from 1 to 240 minutes.' };
  }
  if (!Notification.isSupported()) {
    return { ok: false, error: 'Notifications are not supported on this computer.' };
  }
  const due = Date.now() + delay * 60_000;
  setTimeout(() => {
    new Notification({ title: 'Reminder', body: message }).show();
    event.sender.send('reminder-done', message);
  }, delay * 60_000);
  return { ok: true, due };
});

app.whenReady().then(() => {
  createWindow();
  // macOS: clicking the dock icon with no windows open makes a new one.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Windows and Linux: closing the last window quits the app. (On macOS apps stay open.)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
