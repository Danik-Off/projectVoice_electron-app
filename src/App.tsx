import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './app/routes';
import './styles/main.scss';

// Создаем роутер приложения
const router = createAppRouter();

function App() {
  return <RouterProvider router={router} />;
}

export default App;
