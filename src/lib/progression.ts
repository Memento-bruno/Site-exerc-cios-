import type { ExerciseRef } from '@/data/types';

export interface SetRecord {
  reps: number;
  loadKg?: number;
  done: boolean;
}

/** Número-alvo de repetições de uma referência (para faixas, o menor valor). */
export function targetReps(ref: ExerciseRef): number | null {
  if (typeof ref.reps === 'number') return ref.reps;
  if (typeof ref.reps === 'string') {
    const m = ref.reps.match(/(\d+)/);
    return m ? Number(m[1]) : null;
  }
  return null;
}

/** Maior repetição-alvo de uma faixa ("8–10" → 10). */
export function maxTargetReps(ref: ExerciseRef): number | null {
  if (typeof ref.reps === 'number') return ref.reps;
  if (typeof ref.reps === 'string') {
    const nums = ref.reps.match(/\d+/g)?.map(Number);
    return nums?.length ? Math.max(...nums) : null;
  }
  return null;
}

/**
 * Regra do plano: "quando fizer todas as séries com folga, suba o peso".
 * Consideramos "com folga" quando todas as séries foram feitas e atingiram o topo da faixa.
 */
export function suggestNextLoad(
  ref: ExerciseRef,
  lastSets: SetRecord[],
): {
  loadKg: number | null;
  increase: boolean;
  message: string;
} {
  const done = lastSets.filter((s) => s.done);
  const lastLoad = done.map((s) => s.loadKg).filter((x): x is number => typeof x === 'number');
  const current = lastLoad.length ? Math.max(...lastLoad) : null;
  if (current == null) {
    return { loadKg: null, increase: false, message: 'Comece leve e anote a carga.' };
  }
  const top = maxTargetReps(ref);
  const allSetsDone = done.length >= ref.sets;
  const allAtTop = top != null && done.every((s) => s.reps >= top);
  if (allSetsDone && allAtTop) {
    const step = current >= 20 ? 2 : current >= 10 ? 1 : 0.5;
    return {
      loadKg: round05(current + step),
      increase: true,
      message: `Última vez: ${current} kg com folga. Tente ${round05(current + step)} kg.`,
    };
  }
  return {
    loadKg: current,
    increase: false,
    message: `Repita ${current} kg e busque o topo da faixa.`,
  };
}

function round05(n: number) {
  return Math.round(n * 2) / 2;
}

export function formatReps(ref: ExerciseRef): string {
  const parts: string[] = [];
  if (ref.seconds) parts.push(`${ref.sets}×${ref.seconds} s`);
  else if (ref.meters) parts.push(`${ref.sets}×${ref.meters} m`);
  else if (ref.reps != null) parts.push(`${ref.sets}×${ref.reps}`);
  else parts.push(`${ref.sets} séries`);
  if (ref.perSide) parts.push('por lado');
  return parts.join(' ');
}
