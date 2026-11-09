import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { PwaUpdatePrompt } from '@/components/PwaUpdatePrompt';
import { applyTheme, getThemePreference, watchSystemTheme } from '@/lib/theme';

export function AppLayout() {
  useEffect(() => {
    applyTheme(getThemePreference());
    return watchSystemTheme();
  }, []);

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
