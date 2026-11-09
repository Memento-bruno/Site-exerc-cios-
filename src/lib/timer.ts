import { useCallback, useEffect, useRef, useState } from 'react';

export interface Countdown {
  remaining: number;
  running: boolean;
  finished: boolean;
  total: number;
  start: (seconds?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  add: (seconds: number) => void;
}

/**
 * Contagem regressiva baseada em timestamp (não perde tempo quando a aba é pausada).
 * `onFinish` dispara uma única vez quando chega a zero.
 */
export function useCountdown(initialSeconds: number, onFinish?: () => void): Countdown {
  const [total, setTotal] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endAt = useRef<number | null>(null);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (endAt.current == null) return;
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        setFinished(true);
        endAt.current = null;
        onFinishRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    const vis = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [running]);

  const start = useCallback(
    (seconds?: number) => {
      const s = seconds ?? total;
      setTotal(s);
      setRemaining(s);
      setFinished(false);
      endAt.current = Date.now() + s * 1000;
      setRunning(true);
    },
    [total],
  );

  const pause = useCallback(() => {
    if (endAt.current != null)
      setRemaining(Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000)));
    endAt.current = null;
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (remaining <= 0) return;
    endAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);

  const reset = useCallback(() => {
    endAt.current = null;
    setRunning(false);
    setFinished(false);
    setRemaining(total);
  }, [total]);

  const add = useCallback((seconds: number) => {
    setRemaining((r) => Math.max(0, r + seconds));
    setTotal((t) => Math.max(0, t + seconds));
    if (endAt.current != null) endAt.current += seconds * 1000;
  }, []);

  return { remaining, running, finished, total, start, pause, resume, reset, add };
}

/** Cronômetro crescente (usado em corridas por distância). */
export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startAt = useRef<number | null>(null);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (startAt.current != null) setElapsed(base.current + (Date.now() - startAt.current) / 1000);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    startAt.current = Date.now();
    setRunning(true);
  }, []);
  const pause = useCallback(() => {
    if (startAt.current != null) base.current += (Date.now() - startAt.current) / 1000;
    startAt.current = null;
    setRunning(false);
  }, []);
  const reset = useCallback(() => {
    base.current = 0;
    startAt.current = null;
    setRunning(false);
    setElapsed(0);
  }, []);

  return { elapsed, running, start, pause, reset };
}
