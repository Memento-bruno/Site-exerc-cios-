import { getExercise } from '@/data/exercises';
import type { DayWorkout } from '@/data/types';
import { formatReps } from '@/lib/progression';

/** Lista resumida do que compõe um treino. */
export function WorkoutParts({ workout, limit }: { workout: DayWorkout; limit?: number }) {
  const items: string[] = [];
  if (workout.mobilityFirst) items.push('Mobilidade diária (10 min)');
  if (workout.bike) {
    items.push(
      `Bike ${workout.bike.minutes} min${workout.bike.intervals ? ` com ${workout.bike.intervals.count}×${workout.bike.intervals.hardSec} s forte` : ''}`,
    );
  }
  for (const r of workout.exercises ?? []) {
    items.push(
      `${getExercise(r.exerciseId).name} · ${formatReps(r)}${r.optional ? ' (opcional)' : ''}`,
    );
  }
  if (workout.run) items.push(workout.run.title);
  if (workout.basketball) {
    items.push(
      `Basquete: ${workout.basketball.drillIds.map((d) => getExercise(d).name).join(', ')}`,
    );
  }
  const shown = limit ? items.slice(0, limit) : items;
  const rest = items.length - shown.length;
  return (
    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
      {shown.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="text-brand-500">
            •
          </span>
          <span>{t}</span>
        </li>
      ))}
      {rest > 0 && <li className="text-xs text-slate-500">+ {rest} itens</li>}
    </ul>
  );
}
