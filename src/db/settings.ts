import { db, type Settings } from './schema';
import { nextMonday, toISODate } from '@/lib/dates';

export function defaultSettings(now = new Date()): Settings {
  const iso = now.toISOString();
  return {
    id: 'settings',
    onboardingDone: false,
    healthNoticeAccepted: false,
    startDate: toISODate(nextMonday(now)),
    heightCm: 174,
    startWeightKg: 88.7,
    targetWeightKg: 77,
    officeDays: [2, 3, 4],
    theme: 'system',
    sound: true,
    voice: true,
    vibration: true,
    restSeconds: 75,
    weekRepeats: [],
    reminders: {
      mobility: { enabled: false, time: '19:30' },
      sleep: { enabled: false, time: '22:00' },
      weighIn: { enabled: false, weekday: 1, time: '06:00' },
    },
    createdAt: iso,
    updatedAt: iso,
  };
}

export function mergeSettings(s: Settings | undefined): Settings {
  const d = defaultSettings();
  if (!s) return d;
  return { ...d, ...s, reminders: { ...d.reminders, ...s.reminders } };
}

export async function getSettings(): Promise<Settings> {
  return mergeSettings(await db.settings.get('settings'));
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = {
    ...current,
    ...patch,
    id: 'settings',
    updatedAt: new Date().toISOString(),
  };
  await db.settings.put(next);
  return next;
}
