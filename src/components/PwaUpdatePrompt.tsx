import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh && !offlineReady) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="card fixed inset-x-4 z-40 mx-auto max-w-md p-4"
      style={{ bottom: 'calc(5.5rem + var(--safe-bottom))' }}
    >
      {needRefresh ? (
        <>
          <p className="font-semibold">Nova versão disponível</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Atualize para receber as melhorias.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => void updateServiceWorker(true)}>
              Atualizar
            </button>
            <button className="btn-secondary" onClick={() => setNeedRefresh(false)}>
              Depois
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="font-semibold">Pronto para usar offline</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            O app funciona mesmo sem internet.
          </p>
          <button className="btn-secondary mt-3 w-full" onClick={() => setOfflineReady(false)}>
            Ok
          </button>
        </>
      )}
    </div>
  );
}
