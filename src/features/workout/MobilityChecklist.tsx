import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { getExercise } from '@/data/exercises';
import { DAILY_MOBILITY } from '@/data/plan';
import { formatReps } from '@/lib/progression';

export function MobilityChecklist({
  done,
  onDone,
}: {
  done: boolean;
  onDone: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(!done);
  const [checked, setChecked] = useState<boolean[]>(() => DAILY_MOBILITY.map(() => done));

  function toggle(i: number) {
    const next = checked.map((c, j) => (j === i ? !c : c));
    setChecked(next);
    if (next.every(Boolean)) onDone(true);
  }

  return (
    <section className={`card ${done ? 'ring-2 ring-done/60' : ''}`} aria-labelledby="mob-title">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-4 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span
          className={`grid size-10 place-items-center rounded-xl ${done ? 'bg-done text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'}`}
        >
          <Icon name={done ? 'check' : 'heart'} className="size-5" />
        </span>
        <span className="flex-1">
          <span id="mob-title" className="block font-bold">
            Mobilidade diária · 10 min
          </span>
          <span className="block text-xs text-slate-500">
            Antes de todo treino.{' '}
            {done ? 'Feita!' : `${checked.filter(Boolean).length}/${DAILY_MOBILITY.length}`}
          </span>
        </span>
      </button>
      {open && (
        <ul className="space-y-1 px-4 pb-3">
          {DAILY_MOBILITY.map((r, i) => {
            const ex = getExercise(r.exerciseId);
            return (
              <li key={r.exerciseId} className="flex items-center gap-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked[i]}
                  onClick={() => toggle(i)}
                  className={`grid size-10 shrink-0 place-items-center rounded-lg border-2 ${checked[i] ? 'border-done bg-done text-white' : 'border-slate-300 dark:border-slate-600'}`}
                  aria-label={ex.name}
                >
                  {checked[i] && <Icon name="check" className="size-5" />}
                </button>
                <Link to={`/biblioteca/${ex.id}`} className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{ex.name}</span>
                  <span className="text-slate-500"> · {formatReps(r)}</span>
                  {r.note && <span className="text-slate-500"> · {r.note}</span>}
                </Link>
              </li>
            );
          })}
          <li className="pt-2">
            <button type="button" className="btn-secondary w-full" onClick={() => onDone(!done)}>
              {done ? 'Desmarcar' : 'Marcar tudo como feito'}
            </button>
          </li>
        </ul>
      )}
    </section>
  );
}
