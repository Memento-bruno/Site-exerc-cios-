import { EXERCISES, EXERCISE_MAP } from './exercises';
import {
  DAILY_MOBILITY,
  DELOAD_WEEKS,
  PAIN_DAY_WORKOUT,
  PHASES,
  WEEKS,
  applyDeload,
  phaseForWeek,
} from './plan';
import type { DayWorkout } from './types';

function refsOf(day: DayWorkout) {
  return [...(day.exercises ?? []).map((r) => r.exerciseId), ...(day.basketball?.drillIds ?? [])];
}

describe('plano de 24 semanas', () => {
  it('tem 24 semanas com 7 dias cada, cobrindo todos os dias da semana', () => {
    expect(WEEKS).toHaveLength(24);
    for (const w of WEEKS) {
      expect(w.days).toHaveLength(7);
      expect(new Set(w.days.map((d) => d.weekday)).size).toBe(7);
    }
  });

  it('marca as semanas de deload', () => {
    for (const w of WEEKS) expect(w.deload).toBe(DELOAD_WEEKS.includes(w.number));
  });

  it('associa cada semana à fase certa', () => {
    expect(phaseForWeek(1).id).toBe(1);
    expect(phaseForWeek(4).id).toBe(1);
    expect(phaseForWeek(5).id).toBe(2);
    expect(phaseForWeek(12).id).toBe(3);
    expect(phaseForWeek(16).id).toBe(4);
    expect(phaseForWeek(24).id).toBe(5);
    expect(PHASES.map((p) => p.weeks)).toEqual([
      [1, 4],
      [5, 8],
      [9, 12],
      [13, 16],
      [17, 24],
    ]);
  });

  it('só referencia exercícios do catálogo', () => {
    const ids = new Set<string>();
    for (const w of WEEKS) for (const d of w.days) refsOf(d).forEach((id) => ids.add(id));
    DAILY_MOBILITY.forEach((r) => ids.add(r.exerciseId));
    refsOf(PAIN_DAY_WORKOUT).forEach((id) => ids.add(id));
    for (const id of ids) expect(EXERCISE_MAP[id], `exercício ${id}`).toBeDefined();
  });

  it('todo exercício tem mídia e substituições válidas', () => {
    for (const e of EXERCISES) {
      expect(e.media.datasetFolder || e.media.svgKeyframes, `mídia de ${e.id}`).toBeTruthy();
      for (const s of e.substitutes) expect(EXERCISE_MAP[s], `${e.id} → ${s}`).toBeDefined();
      expect(e.videoSearchUrl).toMatch(/^https:\/\/www\.youtube\.com\/results/);
    }
  });

  it('segue a tabela de corrida da especificação', () => {
    const fri = (n: number) => WEEKS[n - 1].days.find((d) => d.weekday === 5)!.run!;
    const sat = (n: number) => WEEKS[n - 1].days.find((d) => d.weekday === 6)!.run!;
    expect(fri(1).title).toBe('Caminhada rápida 15 min');
    expect(fri(3).inclinePct).toBe(1);
    expect(fri(5).title).toBe('1 corre + 2 anda ×6');
    expect(fri(6).title).toBe('1:30 corre + 2 anda ×6');
    expect(sat(12).mode).toBe('teste');
    expect(sat(12).distanceKm).toBe(3);
    expect(sat(16).distanceKm).toBe(5);
    expect(fri(17).title).toBe('6×400 m a 10,4 km/h');
    expect(sat(24).targetTimeMin).toBe(30);
  });

  it('deload reduz o volume', () => {
    expect(applyDeload({ exerciseId: 'x', sets: 3, reps: 10 }).sets).toBe(2);
    expect(applyDeload({ exerciseId: 'x', sets: 2, reps: 12 }).reps).toBe(8);
    const w4 = WEEKS[3].days.find((d) => d.weekday === 1)!.exercises![0];
    const w3 = WEEKS[2].days.find((d) => d.weekday === 1)!.exercises![0];
    expect(w4.reps).not.toEqual(w3.reps);
  });
});
