const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vc', {
  roastDone: () => ipcRenderer.send('roast-done'),
  closeWindow: () => ipcRenderer.send('close-window'),
  submitAnswers: (data) => ipcRenderer.send('submit-answers', data),
  copyReport: (text) => ipcRenderer.send('copy-report', text),
  restart: () => ipcRenderer.send('restart'),
  onReport: (cb) => ipcRenderer.on('report-data', (_, data) => cb(data)),
  onError: (cb) => ipcRenderer.on('api-error', (_, msg) => cb(msg)),
});
