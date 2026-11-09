import { useCallback, useEffect, useRef, useState } from 'react';
import { getExercise } from '@/data/exercises';
import type { DayWorkout, Weekday } from '@/data/types';
import { db, type ExerciseLog, type Session, type SetLog } from '@/db/schema';
import { targetReps } from '@/lib/progression';
import { toISODate } from '@/lib/dates';

async function lastLoadFor(exerciseId: string): Promise<number | undefined> {
  const sessions = await db.sessions.orderBy('date').reverse().limit(60).toArray();
  for (const s of sessions) {
    const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
    const loads = ex?.sets.filter((x) => x.done && x.loadKg != null).map((x) => x.loadKg!) ?? [];
    if (loads.length) return Math.max(...loads);
  }
  return undefined;
}

export async function buildExerciseLogs(workout: DayWorkout): Promise<ExerciseLog[]> {
  const logs: ExerciseLog[] = [];
  for (const ref of workout.exercises ?? []) {
    const ex = getExercise(ref.exerciseId);
    const load = ex.tracksLoad ? await lastLoadFor(ref.exerciseId) : undefined;
    const reps = targetReps(ref) ?? 0;
    const sets: SetLog[] = Array.from({ length: ref.sets }, (_, i) => ({
      setIndex: i,
      reps,
      loadKg: load,
      done: false,
    }));
    logs.push({ exerciseId: ref.exerciseId, sets });
  }
  return logs;
}

/**
 * Carrega (ou cria) a sessão de hoje para o treino e persiste cada alteração.
 */
export function useWorkoutSession(
  workout: DayWorkout,
  week: number,
  weekday: Weekday,
  painDay: boolean,
  painReason?: string,
) {
  const [session, setSession] = useState<Session | null>(null);
  const dateIso = toISODate(new Date());
  const saving = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await db.sessions
        .where('date')
        .equals(dateIso)
        .filter((s) => s.workoutId === workout.id)
        .first();
      if (cancelled) return;
      if (existing) {
        setSession(existing);
        return;
      }
      const fresh: Session = {
        date: dateIso,
        week,
        weekday,
        workoutId: workout.id,
        type: workout.type,
        painDay: painDay || undefined,
        painDayReason: painReason,
        exercises: await buildExerciseLogs(workout),
        mobilityDone: false,
        startedAt: new Date().toISOString(),
      };
      const id = await db.sessions.add(fresh);
      if (!cancelled) setSession({ ...fresh, id: id as number });
    })();
    return () => {
      cancelled = true;
    };
  }, [workout, week, weekday, painDay, painReason, dateIso]);

  const update = useCallback((patch: Partial<Session> | ((s: Session) => Partial<Session>)) => {
    setSession((prev) => {
      if (!prev) return prev;
      const p = typeof patch === 'function' ? patch(prev) : patch;
      const next = { ...prev, ...p };
      saving.current = saving.current.then(() => db.sessions.put(next));
      return next;
    });
  }, []);

  return { session, update };
}
