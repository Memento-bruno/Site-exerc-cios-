import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Settings } from './schema';
import { defaultSettings, mergeSettings } from './settings';
import { toISODate } from '@/lib/dates';

/** Configurações ao vivo (undefined enquanto carrega). Só leitura: nunca escreve dentro do liveQuery. */
export function useSettings(): Settings | undefined {
  const r = useLiveQuery(async () => ({ row: await db.settings.get('settings') }), []);
  if (!r) return undefined;
  return mergeSettings(r.row);
}

export function useSettingsOrDefault(): Settings {
  return useSettings() ?? defaultSettings();
}

export function useSessionsOn(dateIso: string) {
  return useLiveQuery(() => db.sessions.where('date').equals(dateIso).toArray(), [dateIso]);
}

export function useSessionsOfWeek(week: number) {
  return useLiveQuery(() => db.sessions.where('week').equals(week).toArray(), [week]);
}

export function useAllSessions() {
  return useLiveQuery(() => db.sessions.orderBy('date').toArray(), []);
}

export function useRuns() {
  return useLiveQuery(() => db.runs.orderBy('date').toArray(), []);
}

export function useWeights() {
  return useLiveQuery(() => db.weights.orderBy('date').toArray(), []);
}

export function usePainLogs() {
  return useLiveQuery(() => db.painLogs.orderBy('date').toArray(), []);
}

export function useHabitsOn(dateIso: string) {
  return useLiveQuery(() => db.habits.where('date').equals(dateIso).first(), [dateIso]);
}

export function useHabits() {
  return useLiveQuery(() => db.habits.orderBy('date').toArray(), []);
}

export function usePhotos() {
  return useLiveQuery(() => db.photos.orderBy('date').toArray(), []);
}

export function useWeekReviews() {
  return useLiveQuery(() => db.weekReviews.toArray(), []);
}

export function useLastSetsFor(exerciseId: string) {
  return useLiveQuery(async () => {
    const sessions = await db.sessions.orderBy('date').reverse().limit(60).toArray();
    for (const s of sessions) {
      const ex = s.exercises.find((e) => e.exerciseId === exerciseId && e.sets.some((x) => x.done));
      if (ex) return { date: s.date, sets: ex.sets };
    }
    return null;
  }, [exerciseId]);
}

export function todayIso(): string {
  return toISODate(new Date());
}
