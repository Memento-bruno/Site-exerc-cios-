import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { Placeholder } from './Placeholder';
import { ErrorPage } from './ErrorPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { TodayPage } from '@/features/today/TodayPage';
import { WorkoutPage } from '@/features/workout/WorkoutPage';
import { RunTimerPage } from '@/features/run-timer/RunTimerPage';

export const router = createBrowserRouter([
  { path: '/bem-vindo', element: <OnboardingPage />, errorElement: <ErrorPage /> },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'treino/:week/:weekday', element: <WorkoutPage /> },
      { path: 'corrida/:week/:weekday', element: <RunTimerPage /> },
      { path: 'plano', element: <Placeholder title="Plano" /> },
      { path: 'plano/:week', element: <Placeholder title="Semana" /> },
      { path: 'progresso', element: <Placeholder title="Progresso" /> },
      { path: 'biblioteca', element: <Placeholder title="Biblioteca" /> },
      { path: 'biblioteca/:id', element: <Placeholder title="Exercício" /> },
      { path: 'config', element: <Placeholder title="Configurações" /> },
      { path: 'seguranca', element: <Placeholder title="Segurança" /> },
      { path: 'habitos', element: <Placeholder title="Hábitos" /> },
      { path: 'sobre', element: <Placeholder title="Sobre" /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
