import { lazy, Suspense } from 'react';

const ProgressPage = lazy(() =>
  import('./ProgressPage').then((m) => ({ default: m.ProgressPage })),
);

export function ProgressPageLazy() {
  return (
    <Suspense fallback={<div className="p-4 text-slate-500">Carregando gráficos…</div>}>
      <ProgressPage />
    </Suspense>
  );
}
