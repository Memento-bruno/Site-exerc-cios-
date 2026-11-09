import { WEEKS } from '@/data/plan';
import { blockAt, expandRun, expandRunSteps, totalSeconds } from './run-blocks';

const fri = (n: number) => WEEKS[n - 1].days.find((d) => d.weekday === 5)!.run!;
const sat = (n: number) => WEEKS[n - 1].days.find((d) => d.weekday === 6)!.run!;

describe('blocos do timer intervalado', () => {
  it('expande repetições em sequência corre/anda', () => {
    const blocks = expandRun(fri(5)); // 1 corre + 2 anda ×6
    expect(blocks.map((b) => b.kind)).toEqual([
      'warmup',
      ...Array(6).fill(['run', 'walk']).flat(),
      'cooldown',
    ]);
    expect(blocks[1]).toMatchObject({ kind: 'run', seconds: 60, rep: 1, repTotal: 6 });
    expect(blocks[2]).toMatchObject({ kind: 'walk', seconds: 120 });
    expect(totalSeconds(blocks)).toBe(5 * 60 + 6 * 180 + 5 * 60);
  });

  it('aceita minutos fracionados (1:30)', () => {
    const blocks = expandRun(fri(6));
    expect(blocks[1].seconds).toBe(90);
  });

  it('calcula a duração dos tiros pela velocidade', () => {
    const blocks = expandRun(fri(17)); // 6×400 m a 10,4 km/h
    const tiros = blocks.filter((b) => b.kind === 'run' && b.meters === 400);
    expect(tiros).toHaveLength(6);
    expect(tiros[0]).toMatchObject({ seconds: 138, speedKmh: 10.4, rep: 1, repTotal: 6 });
    expect(blocks[0]).toMatchObject({ kind: 'warmup', seconds: 600 });
  });

  it('semana 10 sábado: 8+2 ×2, + 5 corre', () => {
    const kinds = expandRun(sat(10)).map((b) => `${b.kind}:${b.seconds}`);
    expect(kinds).toEqual([
      'warmup:300',
      'run:480',
      'walk:120',
      'run:480',
      'walk:120',
      'run:300',
      'cooldown:300',
    ]);
  });

  it('corridas por distância não têm blocos', () => {
    expect(expandRun(sat(16))).toEqual([]);
    expect(sat(16).distanceKm).toBe(5);
  });

  it('acha o bloco atual pelo tempo decorrido', () => {
    const blocks = expandRunSteps([
      { type: 'warmup', min: 1 },
      {
        type: 'repeat',
        times: 2,
        steps: [
          { type: 'run', min: 1 },
          { type: 'walk', min: 1 },
        ],
      },
    ]);
    expect(blockAt(blocks, 0)).toMatchObject({ index: 0, remaining: 60 });
    expect(blockAt(blocks, 59)).toMatchObject({ index: 0, remaining: 1 });
    expect(blockAt(blocks, 60)).toMatchObject({ index: 1, remaining: 60, elapsedInBlock: 0 });
    expect(blockAt(blocks, 150)).toMatchObject({ index: 2, remaining: 30 });
    expect(blockAt(blocks, 300)).toBeNull();
  });
});
