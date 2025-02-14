const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  message: () => "Hello from Electron!",
});
