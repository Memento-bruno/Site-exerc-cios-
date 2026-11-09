// @vitest-environment node
import {
  blobToArrayBuffer,
  clearAllData,
  exportBackup,
  importBackup,
  validateBackup,
} from './backup';
import { db } from './schema';
import { getSettings, updateSettings } from './settings';

beforeEach(async () => {
  await clearAllData();
});

describe('backup JSON', () => {
  it('exportar → apagar → importar restaura tudo', async () => {
    await updateSettings({ startDate: '2026-11-16', restSeconds: 90, onboardingDone: true });
    await db.weights.add({ date: '2026-11-16', weightKg: 88.7, createdAt: 'x' });
    await db.sessions.add({
      date: '2026-11-16',
      week: 1,
      weekday: 1,
      workoutId: 'w01-seg',
      type: 'forca',
      exercises: [
        { exerciseId: 'leg-press', sets: [{ setIndex: 0, reps: 12, loadKg: 40, done: true }] },
      ],
      mobilityDone: true,
      startedAt: 'x',
    });
    await db.photos.add({
      date: '2026-11-16',
      week: 0,
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
      createdAt: 'x',
    });

    const backup = await exportBackup();
    expect(validateBackup(backup)).toBe(true);
    const json = JSON.parse(JSON.stringify(backup));

    await clearAllData();
    expect(await db.weights.count()).toBe(0);
    expect((await getSettings()).restSeconds).toBe(75); // padrão recriado

    await importBackup(json);
    expect((await getSettings()).restSeconds).toBe(90);
    expect((await getSettings()).startDate).toBe('2026-11-16');
    expect(await db.weights.count()).toBe(1);
    const s = await db.sessions.toArray();
    expect(s[0].exercises[0].sets[0].loadKg).toBe(40);
    const p = await db.photos.toArray();
    expect(p[0].blob.type).toBe('image/png');
    expect(new Uint8Array(await blobToArrayBuffer(p[0].blob))).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('rejeita arquivo inválido', async () => {
    await expect(importBackup({ foo: 1 })).rejects.toThrow('inválido');
    expect(validateBackup(null)).toBe(false);
  });
});
