import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RunWorkout } from '@/data/types';
import { beep, keepAwake, unlockAudio, vibrate } from '@/lib/device';
import { blockAt, expandRun, totalSeconds, type RunBlock } from '@/lib/run-blocks';
import { speak } from '@/lib/speech';

export interface RunEngineOptions {
  voice: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface RunEngineState {
  blocks: RunBlock[];
  total: number;
  elapsed: number;
  running: boolean;
  finished: boolean;
  index: number;
  remaining: number;
  current: RunBlock | null;
  next: RunBlock | null;
  start: () => void;
  pause: () => void;
  skip: () => void;
  stop: () => void;
}

const VOICE: Record<RunBlock['kind'], string> = {
  warmup: 'Aquecimento. Caminhe ou trote leve.',
  run: 'Corra!',
  walk: 'Ande.',
  cooldown: 'Desaquecimento. Ande para soltar as pernas.',
  fast: 'Acelere!',
};

/** Motor do timer intervalado: um cronômetro único, bloco derivado do tempo decorrido. */
export function useRunEngine(run: RunWorkout, opts: RunEngineOptions): RunEngineState {
  const blocks = useMemo(() => expandRun(run), [run]);
  const total = useMemo(() => totalSeconds(blocks), [blocks]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const base = useRef(0);
  const startAt = useRef<number | null>(null);
  const lastIndex = useRef(-1);
  const warned30 = useRef(-1);
  const lastTick = useRef(-1);
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  const announce = useCallback(
    (b: RunBlock, idx: number) => {
      const o = optsRef.current;
      if (o.vibration) vibrate(b.kind === 'run' || b.kind === 'fast' ? [300, 100, 300] : 400);
      if (o.sound)
        beep(b.kind === 'run' || b.kind === 'fast' ? 2 : 1, b.kind === 'walk' ? 520 : 880, 200);
      if (o.voice) {
        let text = VOICE[b.kind];
        if (b.rep && b.repTotal && (b.kind === 'run' || b.kind === 'fast'))
          text += ` ${b.rep} de ${b.repTotal}.`;
        if (b.speedKmh) text += ` ${b.speedKmh.toLocaleString('pt-BR')} quilômetros por hora.`;
        if (idx === blocks.length - 1) text += ' Último bloco.';
        speak(text);
      }
    },
    [blocks.length],
  );

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (startAt.current == null) return;
      const e = base.current + (Date.now() - startAt.current) / 1000;
      setElapsed(e);
      const pos = blockAt(blocks, e);
      if (!pos) {
        setRunning(false);
        setFinished(true);
        startAt.current = null;
        base.current = total;
        const o = optsRef.current;
        if (o.vibration) vibrate([500, 200, 500, 200, 800]);
        if (o.sound) beep(3, 988, 300);
        if (o.voice) speak('Treino concluído. Muito bem!');
        return;
      }
      if (pos.index !== lastIndex.current) {
        lastIndex.current = pos.index;
        announce(blocks[pos.index], pos.index);
      }
      const rem = Math.ceil(pos.remaining);
      if (rem === 30 && warned30.current !== pos.index && blocks[pos.index].seconds > 45) {
        warned30.current = pos.index;
        if (optsRef.current.voice) speak('Faltam 30 segundos.');
      }
      if (rem <= 3 && rem >= 1 && lastTick.current !== rem * 1000 + pos.index) {
        lastTick.current = rem * 1000 + pos.index;
        if (optsRef.current.sound) beep(1, 660, 100);
      }
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [running, blocks, total, announce]);

  useEffect(() => {
    if (!running) return;
    let release: (() => void) | undefined;
    void keepAwake().then((r) => (release = r));
    return () => release?.();
  }, [running]);

  const start = useCallback(() => {
    unlockAudio();
    if (finished) return;
    startAt.current = Date.now();
    setRunning(true);
  }, [finished]);

  const pause = useCallback(() => {
    if (startAt.current != null) base.current += (Date.now() - startAt.current) / 1000;
    startAt.current = null;
    setRunning(false);
    if (optsRef.current.voice) speak('Pausado.');
  }, []);

  const skip = useCallback(() => {
    const e =
      startAt.current != null ? base.current + (Date.now() - startAt.current) / 1000 : base.current;
    const pos = blockAt(blocks, e);
    if (!pos) return;
    const target = e + pos.remaining + 0.01;
    base.current = target;
    if (startAt.current != null) startAt.current = Date.now();
    setElapsed(target);
  }, [blocks]);

  const stop = useCallback(() => {
    if (startAt.current != null) base.current += (Date.now() - startAt.current) / 1000;
    startAt.current = null;
    setRunning(false);
    setFinished(true);
  }, []);

  const pos = blockAt(blocks, elapsed);
  const index = pos ? pos.index : blocks.length;
  return {
    blocks,
    total,
    elapsed,
    running,
    finished,
    index,
    remaining: pos ? pos.remaining : 0,
    current: pos ? blocks[pos.index] : null,
    next: pos && pos.index + 1 < blocks.length ? blocks[pos.index + 1] : null,
    start,
    pause,
    skip,
    stop,
  };
}
