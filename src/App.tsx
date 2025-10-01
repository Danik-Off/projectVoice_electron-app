import { RouterProvider } from 'react-router-dom';
import { router } from './routes/root';
import './styles/main.scss';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
