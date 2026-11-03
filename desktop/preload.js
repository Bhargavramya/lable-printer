// Lets the Label Print page receive files you double-click, and save changes back into them.
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("lpDesktop", {
  onOpen: cb => ipcRenderer.on("lp-open-file", (e, d) => cb(d)),
  ready: () => ipcRenderer.send("lp-ready"),
  save: (path, text) => ipcRenderer.invoke("lp-save-file", path, text)
});
