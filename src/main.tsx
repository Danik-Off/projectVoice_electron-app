import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeApp } from './app/initialize'
import App from './App.tsx'

// Инициализируем приложение (модули, плагины, MobX)
initializeApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((error) => {
  console.error('Failed to initialize app:', error);
});
