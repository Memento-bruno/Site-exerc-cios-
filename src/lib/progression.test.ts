import { formatReps, maxTargetReps, suggestNextLoad, targetReps } from './progression';

describe('progressão de carga', () => {
  const ref = { exerciseId: 'x', sets: 3, reps: '8–10' };

  it('lê faixas de repetições', () => {
    expect(targetReps(ref)).toBe(8);
    expect(maxTargetReps(ref)).toBe(10);
    expect(targetReps({ exerciseId: 'x', sets: 2, reps: 12 })).toBe(12);
  });

  it('sugere subir quando todas as séries atingiram o topo', () => {
    const r = suggestNextLoad(ref, [
      { reps: 10, loadKg: 12, done: true },
      { reps: 10, loadKg: 12, done: true },
      { reps: 10, loadKg: 12, done: true },
    ]);
    expect(r).toMatchObject({ loadKg: 13, increase: true });
  });

  it('mantém a carga quando faltou repetição ou série', () => {
    expect(
      suggestNextLoad(ref, [
        { reps: 10, loadKg: 12, done: true },
        { reps: 8, loadKg: 12, done: true },
        { reps: 8, loadKg: 12, done: true },
      ]),
    ).toMatchObject({ loadKg: 12, increase: false });
    expect(
      suggestNextLoad(ref, [
        { reps: 10, loadKg: 12, done: true },
        { reps: 10, loadKg: 12, done: true },
      ]),
    ).toMatchObject({ loadKg: 12, increase: false });
  });

  it('sem histórico, pede para começar leve', () => {
    expect(suggestNextLoad(ref, []).loadKg).toBeNull();
  });

  it('formata séries e repetições', () => {
    expect(formatReps({ exerciseId: 'x', sets: 3, reps: 10 })).toBe('3×10');
    expect(formatReps({ exerciseId: 'x', sets: 2, reps: 6, perSide: true })).toBe('2×6 por lado');
    expect(formatReps({ exerciseId: 'x', sets: 3, seconds: 20 })).toBe('3×20 s');
    expect(formatReps({ exerciseId: 'x', sets: 3, meters: 30 })).toBe('3×30 m');
  });
});
