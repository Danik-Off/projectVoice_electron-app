import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/main.scss';
import { createRouter } from './routes/root';
import { themeStore } from './core';
import { initializeApp } from './app/initialize';

import './constants/i18n';

// Инициализируем тему
themeStore.loadTheme();

// Дополнительная проверка инициализации темы
const rootElement = document.documentElement;
if (!rootElement.getAttribute('data-theme')) {
    rootElement.setAttribute('data-theme', themeStore.currentTheme);
}

// Инициализируем приложение (модули, плагины) и создаем роутер
initializeApp()
    .then(() => {
        console.log('✅ App initialized, creating router...');
        const router = createRouter();
        
        const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
        root.render(
            // <React.StrictMode>
            <RouterProvider router={router} />
            // </React.StrictMode>
        );
    })
    .catch((error: unknown) => {
        console.error('❌ Failed to initialize app:', error);
        // Показываем ошибку пользователю
        const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
        root.render(
            <div style={{ padding: '20px', color: 'red' }}>
                <h1>Ошибка инициализации приложения</h1>
                <p>{error instanceof Error ? error.message : String(error)}</p>
            </div>
        );
    });
