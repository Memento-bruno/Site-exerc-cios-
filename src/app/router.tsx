import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { Placeholder } from './Placeholder';
import { ErrorPage } from './ErrorPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { TodayPage } from '@/features/today/TodayPage';
import { WorkoutPage } from '@/features/workout/WorkoutPage';
import { RunTimerPage } from '@/features/run-timer/RunTimerPage';
import { PlanPage, WeekPage } from '@/features/plan/PlanPage';
import { LibraryPage } from '@/features/library/LibraryPage';
import { ExercisePage } from '@/features/library/ExercisePage';
import { SafetyPage } from '@/features/health/SafetyPage';
import { HabitsPage } from '@/features/health/HabitsPage';
import { AboutPage } from '@/features/settings/AboutPage';
const ProgressPage = lazy(() =>
  import('@/features/progress/ProgressPage').then((m) => ({ default: m.ProgressPage })),
);

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
      { path: 'plano', element: <PlanPage /> },
      { path: 'plano/:week', element: <WeekPage /> },
      {
        path: 'progresso',
        element: (
          <Suspense fallback={<div className="p-4 text-slate-500">Carregando gráficos…</div>}>
            <ProgressPage />
          </Suspense>
        ),
      },
      { path: 'biblioteca', element: <LibraryPage /> },
      { path: 'biblioteca/:id', element: <ExercisePage /> },
      { path: 'config', element: <Placeholder title="Configurações" /> },
      { path: 'seguranca', element: <SafetyPage /> },
      { path: 'habitos', element: <HabitsPage /> },
      { path: 'sobre', element: <AboutPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
