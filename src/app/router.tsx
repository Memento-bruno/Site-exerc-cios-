import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { Placeholder } from './Placeholder';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Placeholder title="Hoje" /> },
      { path: 'plano', element: <Placeholder title="Plano" /> },
      { path: 'progresso', element: <Placeholder title="Progresso" /> },
      { path: 'biblioteca', element: <Placeholder title="Biblioteca" /> },
      { path: 'config', element: <Placeholder title="Configurações" /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
