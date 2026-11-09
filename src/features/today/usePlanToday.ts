import { useEffect, useMemo, useState } from 'react';
import { getDayWorkout, PAIN_DAY_WORKOUT, phaseForWeek, getWeek } from '@/data/plan';
import type { DayWorkout, Phase, Week, Weekday } from '@/data/types';
import { useSettings } from '@/db/hooks';
import { fromISODate, planPosition, startOfDay, toISODate, type PlanPosition } from '@/lib/dates';

export interface PlanToday {
  loading: boolean;
  today: Date;
  todayIso: string;
  position: PlanPosition;
  phase: Phase | null;
  week: Week | null;
  workout: DayWorkout | null;
  painDayWorkout: DayWorkout;
  isOfficeDay: boolean;
  weekday: Weekday;
}

/** Recalcula ao virar o dia (checa a cada minuto). */
export function useToday(): Date {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  useEffect(() => {
    const id = setInterval(() => {
      const now = startOfDay(new Date());
      if (now.getTime() !== today.getTime()) setToday(now);
    }, 60_000);
    return () => clearInterval(id);
  }, [today]);
  return today;
}

export function usePlanToday(): PlanToday {
  const settings = useSettings();
  const today = useToday();
  return useMemo(() => {
    const weekday = today.getDay() as Weekday;
    if (!settings) {
      return {
        loading: true,
        today,
        todayIso: toISODate(today),
        position: planPosition(today, today),
        phase: null,
        week: null,
        workout: null,
        painDayWorkout: PAIN_DAY_WORKOUT,
        isOfficeDay: false,
        weekday,
      };
    }
    const position = planPosition(fromISODate(settings.startDate), today, settings.weekRepeats);
    const inPlan = position.status === 'em-andamento';
    const week = inPlan ? getWeek(position.week) : null;
    return {
      loading: false,
      today,
      todayIso: toISODate(today),
      position,
      phase: inPlan ? phaseForWeek(position.week) : null,
      week,
      workout: inPlan ? getDayWorkout(position.week, weekday) : null,
      painDayWorkout: PAIN_DAY_WORKOUT,
      isOfficeDay: settings.officeDays.includes(weekday),
      weekday,
    };
  }, [settings, today]);
}
