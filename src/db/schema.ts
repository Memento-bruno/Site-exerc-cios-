import Dexie, { type EntityTable } from 'dexie';
import type { PainRegion, Weekday } from '@/data/types';
import type { WeekRepeat } from '@/lib/dates';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  id: 'settings';
  onboardingDone: boolean;
  healthNoticeAccepted: boolean;
  /** ISO "YYYY-MM-DD" (sempre uma segunda-feira). */
  startDate: string;
  heightCm: number;
  startWeightKg: number;
  targetWeightKg: number;
  officeDays: Weekday[];
  theme: ThemePreference;
  sound: boolean;
  voice: boolean;
  vibration: boolean;
  /** Descanso padrão entre séries, em segundos. */
  restSeconds: number;
  weekRepeats: WeekRepeat[];
  reminders: {
    mobility: { enabled: boolean; time: string };
    sleep: { enabled: boolean; time: string };
    weighIn: { enabled: boolean; weekday: Weekday; time: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface SetLog {
  setIndex: number;
  reps: number;
  loadKg?: number;
  done: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  /** Exercício originalmente previsto, quando houve troca. */
  replacedId?: string;
  sets: SetLog[];
}

export interface Session {
  id?: number;
  /** "YYYY-MM-DD" */
  date: string;
  week: number;
  weekday: Weekday;
  workoutId: string;
  type: string;
  /** Treino feito na versão "dia de dor". */
  painDay?: boolean;
  painDayReason?: string;
  exercises: ExerciseLog[];
  mobilityDone: boolean;
  bikeMinutes?: number;
  rpe?: number;
  notes?: string;
  startedAt: string;
  finishedAt?: string;
  durationSec?: number;
}

export interface Run {
  id?: number;
  date: string;
  week: number;
  workoutId: string;
  title: string;
  mode: string;
  distanceKm?: number;
  durationSec?: number;
  /** segundos por km */
  paceSecPerKm?: number;
  /** Teste de 3 ou 5 km. */
  isTest?: boolean;
  feeling?: string;
  notes?: string;
  rpe?: number;
  createdAt: string;
}

export interface PainLog {
  id?: number;
  date: string;
  week: number;
  sessionId?: number;
  scores: Partial<Record<PainRegion, number>>;
  notes?: string;
  createdAt: string;
}

export interface WeightLog {
  id?: number;
  date: string;
  weightKg: number;
  waistCm?: number;
  createdAt: string;
}

export interface HabitLog {
  id?: number;
  date: string;
  water: boolean;
  protein: boolean;
  mobility: boolean;
  sleep: boolean;
}

export interface Photo {
  id?: number;
  date: string;
  week: number;
  label?: string;
  blob: Blob;
  createdAt: string;
}

export interface WeekReview {
  id?: number;
  week: number;
  /** Resposta a "As dores pioraram?" */
  painWorse: boolean;
  repeated: boolean;
  createdAt: string;
}

export class RumoDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  runs!: EntityTable<Run, 'id'>;
  painLogs!: EntityTable<PainLog, 'id'>;
  weights!: EntityTable<WeightLog, 'id'>;
  habits!: EntityTable<HabitLog, 'id'>;
  photos!: EntityTable<Photo, 'id'>;
  weekReviews!: EntityTable<WeekReview, 'id'>;

  constructor(name = 'rumo-aos-5km') {
    super(name);
    this.version(1).stores({
      settings: 'id',
      sessions: '++id, date, week, workoutId, [week+weekday]',
      runs: '++id, date, week, isTest',
      painLogs: '++id, date, week, sessionId',
      weights: '++id, &date',
      habits: '++id, &date',
      photos: '++id, date, week',
      weekReviews: '++id, &week',
    });
  }
}

export const db = new RumoDB();

export const TABLE_NAMES = [
  'settings',
  'sessions',
  'runs',
  'painLogs',
  'weights',
  'habits',
  'photos',
  'weekReviews',
] as const;
