import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { enableMobX } from './store/authStore'
import App from './App.tsx'

// Включаем MobX для работы с реактивностью
enableMobX();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
