import { useEffect, useMemo, useRef, useState } from 'react';
import type { Frame, Joint, Point, StickFigureSpec } from '@/data/svg-keyframes';
import { useReducedMotion } from '@/lib/motion';

const BONES: [Joint, Joint][] = [
  ['neck', 'hip'],
  ['neck', 'shoulderL'],
  ['neck', 'shoulderR'],
  ['shoulderL', 'elbowL'],
  ['elbowL', 'handL'],
  ['shoulderR', 'elbowR'],
  ['elbowR', 'handR'],
  ['hip', 'kneeL'],
  ['kneeL', 'footL'],
  ['hip', 'kneeR'],
  ['kneeR', 'footR'],
];

function lerp(a: Point, b: Point, t: number): Point {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function interpolate(a: Frame, b: Frame, t: number): Frame {
  const out = {} as Frame;
  for (const k of Object.keys(a) as Joint[]) out[k] = lerp(a[k], b[k], t);
  return out;
}

interface Props {
  spec: StickFigureSpec;
  /** 1 = normal, 0.5 = lenta. */
  speed?: number;
  playing?: boolean;
  className?: string;
  title?: string;
}

/** Boneco de palito animado por interpolação entre quadros (ida e volta). */
export function StickFigureAnimation({ spec, speed = 1, playing = true, className, title }: Props) {
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState<Frame>(spec.frames[0]);
  const [phase, setPhase] = useState(0);
  const raf = useRef(0);
  const start = useRef<number | null>(null);
  const stepMs = (spec.stepMs ?? 1200) / speed;
  const n = spec.frames.length;

  useEffect(() => {
    if (reduced || !playing || n < 2) return;
    start.current = null;
    const seq = spec.loop
      ? [...spec.frames, spec.frames[0]]
      : [...spec.frames, ...spec.frames.slice(0, -1).reverse()];
    const total = (seq.length - 1) * stepMs;
    const tick = (now: number) => {
      if (start.current == null) start.current = now;
      const t = (now - start.current) % total;
      const i = Math.min(seq.length - 2, Math.floor(t / stepMs));
      const local = ease((t - i * stepMs) / stepMs);
      setFrame(interpolate(seq[i], seq[i + 1], local));
      setPhase(i % n);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [spec, stepMs, playing, reduced, n]);

  if (reduced) {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className ?? ''}`} role="img" aria-label={title}>
        {spec.frames.slice(0, 2).map((fr, i) => (
          <div key={i} className="flex flex-col items-center">
            <Figure frame={fr} spec={spec} />
            {spec.caption && (
              <span className="mt-1 text-center text-xs text-slate-500">{spec.caption[i]}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className ?? ''}`} role="img" aria-label={title}>
      <Figure frame={frame} spec={spec} />
      {spec.caption && (
        <span className="mt-1 h-4 text-center text-xs text-slate-500" aria-hidden="true">
          {spec.caption[Math.min(phase, 1)]}
        </span>
      )}
    </div>
  );
}

function Figure({ frame, spec }: { frame: Frame; spec: StickFigureSpec }) {
  const held = useMemo(() => {
    if (!spec.held) return null;
    const p = frame[spec.held.joint];
    const o = spec.held.offset ?? [0, 0];
    return { cx: p[0] + o[0], cy: p[1] + o[1], r: spec.held.radius };
  }, [frame, spec.held]);

  return (
    <svg
      viewBox="-4 -4 108 104"
      className="aspect-square w-full max-w-xs text-slate-800 dark:text-slate-100"
    >
      {spec.props?.map((p, i) => {
        const stroke = 'currentColor';
        const common = { stroke, strokeWidth: 1.2, opacity: 0.35, fill: 'none' as const };
        if (p.type === 'line')
          return (
            <line
              key={i}
              x1={p.coords[0]}
              y1={p.coords[1]}
              x2={p.coords[2]}
              y2={p.coords[3]}
              {...common}
              strokeDasharray={p.dashed ? '3 3' : undefined}
            />
          );
        if (p.type === 'circle')
          return <circle key={i} cx={p.coords[0]} cy={p.coords[1]} r={p.coords[2]} {...common} />;
        return (
          <rect
            key={i}
            x={p.coords[0]}
            y={p.coords[1]}
            width={p.coords[2]}
            height={p.coords[3]}
            {...common}
          />
        );
      })}
      <g
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {BONES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={frame[a][0]}
            y1={frame[a][1]}
            x2={frame[b][0]}
            y2={frame[b][1]}
          />
        ))}
      </g>
      <circle cx={frame.head[0]} cy={frame.head[1]} r={6} fill="currentColor" />
      {held && <circle cx={held.cx} cy={held.cy} r={held.r} fill="#f97316" opacity={0.9} />}
      {(['elbowL', 'elbowR', 'kneeL', 'kneeR', 'hip', 'neck'] as Joint[]).map((j) => (
        <circle key={j} cx={frame[j][0]} cy={frame[j][1]} r={1.8} fill="currentColor" />
      ))}
    </svg>
  );
}
