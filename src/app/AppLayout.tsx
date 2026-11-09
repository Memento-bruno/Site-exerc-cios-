import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { PwaUpdatePrompt } from '@/components/PwaUpdatePrompt';
import { applyTheme, getThemePreference, watchSystemTheme } from '@/lib/theme';
import { useSettings } from '@/db/hooks';

export function AppLayout() {
  const settings = useSettings();
  const location = useLocation();
  useEffect(() => {
    applyTheme(getThemePreference());
    return watchSystemTheme();
  }, []);
  useEffect(() => {
    if (settings) applyTheme(settings.theme);
  }, [settings]);

  if (settings && !settings.onboardingDone) {
    return <Navigate to="/bem-vindo" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col md:max-w-3xl">
      <TopBar />
      <main className="flex-1 pb-24" style={{ paddingBottom: 'calc(6rem + var(--safe-bottom))' }}>
        <Outlet />
      </main>
      <BottomNav />
      <PwaUpdatePrompt />
    </div>
  );
}
