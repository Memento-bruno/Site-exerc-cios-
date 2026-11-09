import { TOTAL_WEEKS } from '@/data/plan';
import type { Weekday } from '@/data/types';

const DAY_MS = 86_400_000;

/** Converte uma data para "YYYY-MM-DD" no fuso local. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Lê "YYYY-MM-DD" como meia-noite local (evita o deslocamento de fuso do Date.parse). */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const r = startOfDay(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);
}

/** Próxima segunda-feira (se hoje for segunda, a de daqui a 7 dias). */
export function nextMonday(from: Date = new Date()): Date {
  const d = startOfDay(from);
  const diff = (8 - d.getDay()) % 7 || 7;
  return addDays(d, diff);
}

/** Segunda-feira da semana que contém a data. */
export function mondayOf(d: Date): Date {
  const day = d.getDay();
  return addDays(d, day === 0 ? -6 : 1 - day);
}

export interface WeekRepeat {
  /** Semana do plano que foi repetida. */
  week: number;
  /** Data (ISO) em que a repetição foi decidida. */
  decidedAt: string;
}

export interface PlanPosition {
  /** 1..24, ou 0 antes do início, ou TOTAL_WEEKS+1 depois do fim. */
  week: number;
  weekday: Weekday;
  /** Dia do plano (1 = primeiro dia). Negativo antes do início. */
  dayIndex: number;
  status: 'antes' | 'em-andamento' | 'concluido';
  /** Data efetiva de início depois das repetições. */
  effectiveStart: Date;
}

/**
 * A data efetiva de início é a data escolhida mais 7 dias por semana repetida.
 * Repetir uma semana empurra tudo para a frente.
 */
export function effectiveStartDate(startDate: Date, repeats: WeekRepeat[]): Date {
  return addDays(mondayOf(startDate), 7 * repeats.length);
}

export function planPosition(
  startDate: Date,
  today: Date,
  repeats: WeekRepeat[] = [],
): PlanPosition {
  const effectiveStart = effectiveStartDate(startDate, repeats);
  const dayIndex = daysBetween(effectiveStart, today) + 1;
  const weekday = startOfDay(today).getDay() as Weekday;
  if (dayIndex < 1) {
    return { week: 0, weekday, dayIndex, status: 'antes', effectiveStart };
  }
  const week = Math.ceil(dayIndex / 7);
  if (week > TOTAL_WEEKS) {
    return { week: TOTAL_WEEKS + 1, weekday, dayIndex, status: 'concluido', effectiveStart };
  }
  return { week, weekday, dayIndex, status: 'em-andamento', effectiveStart };
}

/** Data (segunda-feira) em que a semana N começa, dado o início efetivo. */
export function weekStartDate(effectiveStart: Date, week: number): Date {
  return addDays(effectiveStart, (week - 1) * 7);
}

/** Data de um dia específico (weekday 0..6) dentro da semana N. */
export function dateOfPlanDay(effectiveStart: Date, week: number, weekday: Weekday): Date {
  const offset = weekday === 0 ? 6 : weekday - 1;
  return addDays(weekStartDate(effectiveStart, week), offset);
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};
export const WEEKDAY_SHORT: Record<Weekday, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

export function formatDate(
  d: Date,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' },
) {
  return new Intl.DateTimeFormat('pt-BR', opts).format(d);
}

export function isSameDay(a: Date, b: Date) {
  return toISODate(a) === toISODate(b);
}
