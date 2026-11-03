// Label Print desktop app (Windows / Mac).
// It opens the online app so it always has the newest version (and Settings → Check for updates works).
// Without internet it uses the copy saved by the app, or the copy built into this installer.
const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const SITE = "https://bhargavramya.github.io/lable-printer/";

function createWindow(){
  const win = new BrowserWindow({ width: 1440, height: 900, minWidth: 900, minHeight: 600, title: "Label Print",
    icon: path.join(__dirname, "icon.png"), autoHideMenuBar: true, backgroundColor: "#f6f5f8", webPreferences: { contextIsolation: true, spellcheck: false } });
  let offline = false;
  win.webContents.on("did-fail-load", (e, code, desc, url, isMain) => { if (isMain && !offline){ offline = true; win.loadFile(path.join(__dirname, "app", "index.html")); } });
  win.webContents.setWindowOpenHandler(({ url }) => { if (url.startsWith(SITE)) return { action: "allow" }; shell.openExternal(url); return { action: "deny" }; });
  win.loadURL(SITE);
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
