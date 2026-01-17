import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { initializeApp } from './app';
import { createRouter } from './routes/root';
import { themeStore } from './core';
import NoConnectionModal from './components/NoConnectionModal';
import './styles/main.scss';
import './constants/i18n';

// Инициализируем тему
themeStore.loadTheme();

// Дополнительная проверка инициализации темы
const rootElement = document.documentElement;
if (!rootElement.getAttribute('data-theme')) {
    rootElement.setAttribute('data-theme', themeStore.currentTheme);
}

// Инициализируем приложение (модули, плагины, MobX)
initializeApp()
    .then(() => {
        // Создаем роутер ПОСЛЕ инициализации модулей
        const router = createRouter();

        const rootElement = document.getElementById('root');
        if (!rootElement) {
            throw new Error('Root element not found');
        }
        createRoot(rootElement).render(
            <StrictMode>
                <RouterProvider router={router} />
                <NoConnectionModal />
            </StrictMode>
        );
    })
    .catch((error: unknown) => {
        console.error('Failed to initialize app:', error);
        // Показываем ошибку пользователю
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            throw new Error('Root element not found');
        }
        const root = createRoot(rootElement);
        root.render(
            <div style={{ padding: '20px', color: 'red' }}>
                <h1>Ошибка инициализации приложения</h1>
                <p>{error instanceof Error ? error.message : String(error)}</p>
            </div>
        );
    });
