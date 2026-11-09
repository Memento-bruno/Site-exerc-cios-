import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExerciseAnimation } from '@/components/ExerciseAnimation';
import { Icon } from '@/components/Icon';
import { getExercise } from '@/data/exercises';
import type { ExerciseRef } from '@/data/types';
import type { ExerciseLog, SetLog } from '@/db/schema';
import { useLastSetsFor } from '@/db/hooks';
import { formatReps, suggestNextLoad } from '@/lib/progression';

interface Props {
  index: number;
  refSpec: ExerciseRef;
  log: ExerciseLog;
  onChange: (log: ExerciseLog) => void;
  onSetDone: () => void;
}

export function ExerciseCard({ index, refSpec, log, onChange, onSetDone }: Props) {
  const exercise = getExercise(log.exerciseId);
  const original = getExercise(refSpec.exerciseId);
  const last = useLastSetsFor(log.exerciseId);
  const [showTips, setShowTips] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const doneCount = log.sets.filter((s) => s.done).length;
  const allDone = doneCount === log.sets.length;
  const suggestion = exercise.tracksLoad && last ? suggestNextLoad(refSpec, last.sets) : null;
  const substitutes = [
    ...new Set([...original.substitutes, ...(log.replacedId ? [log.replacedId] : [])]),
  ].filter((id) => id !== log.exerciseId);

  function updateSet(i: number, patch: Partial<SetLog>) {
    const sets = log.sets.map((s, j) => (j === i ? { ...s, ...patch } : s));
    onChange({ ...log, sets });
  }

  function toggleDone(i: number) {
    const was = log.sets[i].done;
    updateSet(i, { done: !was });
    if (!was) onSetDone();
  }

  function swapTo(id: string) {
    const sets = log.sets.map((s) => ({ ...s, done: false, loadKg: undefined }));
    onChange({ exerciseId: id, replacedId: refSpec.exerciseId, sets });
    setSwapOpen(false);
  }

  const label = refSpec.seconds ? 'seg' : refSpec.meters ? 'm' : 'reps';

  return (
    <article
      className={`card overflow-hidden ${allDone ? 'ring-2 ring-done/60' : ''}`}
      aria-labelledby={`ex-${index}`}
    >
      <div className="grid grid-cols-[6rem_1fr] gap-3 p-3">
        <ExerciseAnimation exercise={exercise} compact className="w-24" />
        <div className="min-w-0">
          <h3 id={`ex-${index}`} className="font-bold leading-tight">
            {index + 1}. {exercise.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {formatReps(refSpec)}
            {refSpec.suggestedLoad ? ` · ${refSpec.suggestedLoad}` : ''}
            {refSpec.optional ? ' · opcional' : ''}
          </p>
          {refSpec.note && <p className="text-xs text-slate-500">{refSpec.note}</p>}
          {log.replacedId && (
            <p className="text-xs text-brand-600 dark:text-brand-400">Substitui: {original.name}</p>
          )}
          {suggestion && (
            <p
              className={`mt-1 text-xs ${suggestion.increase ? 'font-semibold text-done' : 'text-slate-500'}`}
            >
              {suggestion.message}
            </p>
          )}
        </div>
      </div>

      {exercise.cautions.length > 0 && (
        <p className="mx-3 mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <Icon name="warn" className="mr-1 inline size-3.5 align-text-top" />
          {exercise.cautions[0]}
        </p>
      )}

      <div className="px-3 pb-3">
        <div className="grid grid-cols-[2rem_1fr_1fr_3rem] items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <span>Série</span>
          <span>{exercise.tracksLoad ? 'Carga (kg)' : ''}</span>
          <span>{label}</span>
          <span className="sr-only">Feita</span>
        </div>
        {log.sets.map((s, i) => (
          <div key={i} className="mt-1.5 grid grid-cols-[2rem_1fr_1fr_3rem] items-center gap-2">
            <span className="text-center font-semibold text-slate-500">{i + 1}</span>
            {exercise.tracksLoad ? (
              <input
                aria-label={`Carga da série ${i + 1} em kg`}
                inputMode="decimal"
                className="input min-h-11 px-2 text-center"
                value={s.loadKg ?? ''}
                placeholder="kg"
                onChange={(e) =>
                  updateSet(i, {
                    loadKg:
                      e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.')),
                  })
                }
              />
            ) : (
              <span />
            )}
            <input
              aria-label={`${label === 'reps' ? 'Repetições' : label === 'seg' ? 'Segundos' : 'Metros'} da série ${i + 1}`}
              inputMode="numeric"
              className="input min-h-11 px-2 text-center"
              value={s.reps || ''}
              onChange={(e) => updateSet(i, { reps: Number(e.target.value) || 0 })}
            />
            <button
              type="button"
              onClick={() => toggleDone(i)}
              aria-pressed={s.done}
              aria-label={`Série ${i + 1} ${s.done ? 'feita' : 'não feita'}`}
              className={`grid size-11 place-items-center rounded-xl border-2 transition ${
                s.done ? 'border-done bg-done text-white' : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {s.done && <Icon name="check" className="size-6" />}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 border-t border-slate-100 px-2 py-1 dark:border-slate-800">
        <button
          type="button"
          className="btn-ghost min-h-10 px-3 text-sm"
          onClick={() => setShowTips((v) => !v)}
          aria-expanded={showTips}
        >
          <Icon name="info" className="size-4" /> Dicas
        </button>
        {substitutes.length > 0 && (
          <button
            type="button"
            className="btn-ghost min-h-10 px-3 text-sm"
            onClick={() => setSwapOpen((v) => !v)}
            aria-expanded={swapOpen}
          >
            <Icon name="swap" className="size-4" /> Trocar exercício
          </button>
        )}
        <Link to={`/biblioteca/${exercise.id}`} className="btn-ghost ml-auto min-h-10 px-3 text-sm">
          Ver tudo
        </Link>
      </div>

      {showTips && (
        <div className="border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
          <ol className="list-decimal space-y-1 pl-4 text-slate-700 dark:text-slate-200">
            {exercise.steps.map((st) => (
              <li key={st}>{st}</li>
            ))}
          </ol>
          {exercise.commonMistakes.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              <strong>Evite:</strong> {exercise.commonMistakes.join('; ')}.
            </p>
          )}
        </div>
      )}

      {swapOpen && (
        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase text-slate-500">Substituições previstas</p>
          <div className="mt-2 flex flex-col gap-2">
            {substitutes.map((id) => (
              <button
                key={id}
                type="button"
                className="btn-secondary justify-start"
                onClick={() => swapTo(id)}
              >
                <Icon name="swap" className="size-4" /> {getExercise(id).name}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
