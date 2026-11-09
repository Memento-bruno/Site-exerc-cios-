import type { RunStep, RunWorkout } from '@/data/types';
import { secondsForDistance } from './units';

export type BlockKind = 'warmup' | 'run' | 'walk' | 'cooldown' | 'fast';

export interface RunBlock {
  kind: BlockKind;
  seconds: number;
  label: string;
  speedKmh?: number;
  meters?: number;
  /** Índice do tiro/intervalo (1..n) quando faz parte de uma repetição. */
  rep?: number;
  repTotal?: number;
}

const LABELS: Record<BlockKind, string> = {
  warmup: 'Aquecimento',
  run: 'Corra',
  walk: 'Ande',
  cooldown: 'Desaquecimento',
  fast: 'Acelere',
};

/** Achata os passos (inclusive repetições) numa sequência de blocos com segundos. */
export function expandRunSteps(steps: RunStep[], defaultSpeedKmh?: number): RunBlock[] {
  const out: RunBlock[] = [];
  const walk = (list: RunStep[], rep?: number, repTotal?: number) => {
    for (const s of list) {
      switch (s.type) {
        case 'repeat':
          for (let i = 1; i <= s.times; i++) walk(s.steps, i, s.times);
          break;
        case 'fast':
          out.push({ kind: 'fast', seconds: s.sec, label: s.label ?? LABELS.fast, rep, repTotal });
          break;
        case 'run': {
          const speed = s.speedKmh ?? defaultSpeedKmh;
          const seconds =
            s.min != null
              ? Math.round(s.min * 60)
              : s.meters && speed
                ? secondsForDistance(s.meters, speed)
                : 0;
          out.push({
            kind: 'run',
            seconds,
            label: s.label ?? LABELS.run,
            speedKmh: s.speedKmh,
            meters: s.meters,
            rep,
            repTotal,
          });
          break;
        }
        default:
          out.push({
            kind: s.type,
            seconds: Math.round(s.min * 60),
            label: s.label ?? LABELS[s.type],
            rep,
            repTotal,
          });
      }
    }
  };
  walk(steps);
  return out.filter((b) => b.seconds > 0);
}

export function expandRun(run: RunWorkout): RunBlock[] {
  return expandRunSteps(run.steps, run.speedKmh);
}

export function totalSeconds(blocks: RunBlock[]): number {
  return blocks.reduce((n, b) => n + b.seconds, 0);
}

/** Posição atual dado o tempo decorrido. */
export function blockAt(
  blocks: RunBlock[],
  elapsedSec: number,
): {
  index: number;
  remaining: number;
  elapsedInBlock: number;
} | null {
  let acc = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (elapsedSec < acc + b.seconds) {
      return {
        index: i,
        remaining: acc + b.seconds - elapsedSec,
        elapsedInBlock: elapsedSec - acc,
      };
    }
    acc += b.seconds;
  }
  return null;
}
