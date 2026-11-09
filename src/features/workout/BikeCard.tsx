import { useMemo } from 'react';
import { Icon } from '@/components/Icon';
import type { BikeWorkout } from '@/data/types';
import { beep, vibrate } from '@/lib/device';
import { useCountdown } from '@/lib/timer';
import { formatDuration } from '@/lib/units';

interface Props {
  bike: BikeWorkout;
  done: boolean;
  onDone: (minutes: number) => void;
  sound: boolean;
  vibration: boolean;
}

export function BikeCard({ bike, done, onDone, sound, vibration }: Props) {
  const total = bike.minutes * 60;
  const cd = useCountdown(total, () => {
    if (sound) beep(3, 660, 300);
    if (vibration) vibrate([300, 150, 300, 150, 600]);
  });
  // Mostra "forte/leve" nos tiros da bike: começam depois de 5 min de aquecimento.
  const intervalPhase = useMemo(() => {
    if (!bike.intervals || !cd.running) return null;
    const { count, hardSec, easySec } = bike.intervals;
    const inBlock = total - cd.remaining - 5 * 60;
    if (inBlock < 0) return 'Aquecendo';
    const cycle = hardSec + easySec;
    const n = Math.floor(inBlock / cycle);
    if (n >= count) return 'Leve até o fim';
    return inBlock % cycle < hardSec ? `FORTE ${n + 1}/${count}` : `leve ${n + 1}/${count}`;
  }, [bike.intervals, cd.remaining, cd.running, total]);

  return (
    <section
      className={`card p-4 ${done ? 'ring-2 ring-done/60' : ''}`}
      aria-labelledby="bike-title"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-sky-500 text-white">
          <Icon name="bike" className="size-5" />
        </span>
        <div className="flex-1">
          <h3 id="bike-title" className="font-bold">
            Bike leve · {bike.minutes} min
          </h3>
          <p className="text-xs text-slate-500">
            {bike.note ??
              'Ritmo em que dá para conversar. Joelho levemente dobrado com o pedal embaixo.'}
          </p>
        </div>
      </div>
      {!done && (
        <div className="mt-3">
          <p className="text-center text-5xl font-bold tabular-nums" aria-live="polite">
            {formatDuration(cd.remaining)}
          </p>
          {intervalPhase && (
            <p
              className={`text-center text-lg font-bold ${intervalPhase.startsWith('FORTE') ? 'text-run' : 'text-walk'}`}
              aria-live="assertive"
            >
              {intervalPhase}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {!cd.running ? (
              <button
                className="btn-primary flex-1"
                onClick={() =>
                  cd.remaining < total && cd.remaining > 0 ? cd.resume() : cd.start()
                }
              >
                <Icon name="play" className="size-5" />{' '}
                {cd.remaining < total ? 'Continuar' : 'Iniciar'}
              </button>
            ) : (
              <button className="btn-secondary flex-1" onClick={cd.pause}>
                <Icon name="pause" className="size-5" /> Pausar
              </button>
            )}
            <button
              className="btn-secondary"
              onClick={() => onDone(Math.round((total - cd.remaining) / 60) || bike.minutes)}
            >
              Concluir
            </button>
          </div>
        </div>
      )}
      {done && (
        <button className="btn-ghost mt-2 w-full text-sm" onClick={() => onDone(0)}>
          Desmarcar
        </button>
      )}
    </section>
  );
}
