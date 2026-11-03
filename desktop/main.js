// Label Print desktop app (Windows / Mac).
// Opens the online app so it always has the newest version (Settings → Check for updates works).
// Without internet it uses the copy saved by the app, or the copy built into this installer.
// Double-clicking a .lpd or .btw file opens it in a new tab; .lpd files are kept up to date with your changes.
const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path"), fs = require("fs");
const SITE = "https://bhargavramya.github.io/lable-printer/";
let win = null, pageReady = false; const pending = [];
const isDoc = p => typeof p === "string" && /\.(lpd|btw)$/i.test(p) && fs.existsSync(p);

function sendFile(p){
  if (!win || !pageReady){ pending.push(p); return; }
  try{ const data = fs.readFileSync(p).toString("base64"); win.webContents.send("lp-open-file", { name: path.basename(p), path: p, data }); }catch(e){}
  if (win.isMinimized()) win.restore(); win.focus();
}
function createWindow(){
  win = new BrowserWindow({ width: 1440, height: 900, minWidth: 900, minHeight: 600, title: "Label Print",
    icon: path.join(__dirname, "icon.png"), autoHideMenuBar: true, backgroundColor: "#f6f5f8",
    webPreferences: { contextIsolation: true, spellcheck: false, preload: path.join(__dirname, "preload.js") } });
  let offline = false;
  win.webContents.on("did-start-loading", () => { pageReady = false; });
  win.webContents.on("did-fail-load", (e, code, desc, url, isMain) => { if (isMain && !offline){ offline = true; win.loadFile(path.join(__dirname, "app", "index.html")); } });
  win.webContents.setWindowOpenHandler(({ url }) => { if (url.startsWith(SITE)) return { action: "allow" }; shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith(SITE) && !url.startsWith("file:")){ e.preventDefault(); shell.openExternal(url); } });
  win.loadURL(SITE);
}
ipcMain.on("lp-ready", () => { pageReady = true; pending.splice(0).forEach(sendFile); });
ipcMain.handle("lp-save-file", (e, p, text) => { if (!/\.lpd$/i.test(p)) return false; fs.writeFileSync(p, text); return true; });

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", (e, argv) => { argv.filter(isDoc).forEach(sendFile); if (win){ if (win.isMinimized()) win.restore(); win.focus(); } });
  app.on("open-file", (e, p) => { e.preventDefault(); if (app.isReady()) sendFile(p); else pending.push(p); });   // Mac
  app.whenReady().then(() => { createWindow(); process.argv.slice(1).filter(isDoc).forEach(p => pending.push(p)); });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
}
