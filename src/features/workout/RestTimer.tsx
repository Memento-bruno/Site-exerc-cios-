import { useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { formatDuration } from '@/lib/units';
import type { Countdown } from '@/lib/timer';

interface Props {
  countdown: Countdown;
  onClose: () => void;
}

/** Painel fixo do timer de descanso entre séries. */
export function RestTimer({ countdown, onClose }: Props) {
  const { remaining, running, finished, total } = countdown;
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;

  useEffect(() => {
    if (!finished) return;
    const id = setTimeout(onClose, 2500);
    return () => clearTimeout(id);
  }, [finished, onClose]);

  return (
    <div
      className="fixed inset-x-0 z-30 mx-auto max-w-xl px-3 md:max-w-3xl"
      style={{ bottom: 'calc(4.5rem + var(--safe-bottom))' }}
      role="region"
      aria-label="Timer de descanso"
    >
      <div
        className={`card overflow-hidden border-2 ${finished ? 'border-done' : 'border-brand-500'} p-3 shadow-xl`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {finished ? 'Descanso terminado' : 'Descanso'}
            </p>
            <p className="text-4xl font-bold tabular-nums" aria-live="polite" aria-atomic="true">
              {finished ? 'Vai!' : formatDuration(remaining)}
            </p>
          </div>
          {!finished && (
            <>
              <button
                className="btn-secondary min-h-11 px-3"
                onClick={() => countdown.add(-15)}
                aria-label="Menos 15 segundos"
              >
                −15
              </button>
              <button
                className="btn-secondary min-h-11 px-3"
                onClick={() => countdown.add(15)}
                aria-label="Mais 15 segundos"
              >
                +15
              </button>
              <button
                className="btn-secondary min-h-11 px-3"
                onClick={() => (running ? countdown.pause() : countdown.resume())}
                aria-label={running ? 'Pausar' : 'Continuar'}
              >
                <Icon name={running ? 'pause' : 'play'} className="size-5" />
              </button>
            </>
          )}
          <button
            className="btn-primary min-h-11 px-3"
            onClick={onClose}
            aria-label="Pular descanso"
          >
            <Icon name="skip" className="size-5" />
          </button>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={`h-full transition-[width] duration-300 ${finished ? 'bg-done' : 'bg-brand-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
