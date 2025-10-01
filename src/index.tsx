import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/main.scss';
import { router } from './routes/root';
import { themeStore } from './store/ThemeStore';

import './constants/i18n';

// Инициализируем тему
themeStore.loadTheme();

// Дополнительная проверка инициализации темы
const rootElement = document.documentElement;
if (!rootElement.getAttribute('data-theme')) {
    rootElement.setAttribute('data-theme', themeStore.currentTheme);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    // <React.StrictMode>
    <RouterProvider router={router} />
    // </React.StrictMode>
);
