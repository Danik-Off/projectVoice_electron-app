const { contextBridge, ipcRenderer } = require('electron')

// Безопасно экспортируем API в контекст рендерера
contextBridge.exposeInMainWorld('electronAPI', {
  // Здесь можно добавить методы для взаимодействия с главным процессом
  platform: process.platform,
  versions: process.versions
})

// Обработка загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})