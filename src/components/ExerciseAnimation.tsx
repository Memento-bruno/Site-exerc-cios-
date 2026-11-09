import { useState } from 'react';
import type { Exercise } from '@/data/types';
import { SVG_KEYFRAMES } from '@/data/svg-keyframes';
import { MEDIA_MANIFEST as MEDIA, mediaSourceFor } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import { Icon } from './Icon';
import { StickFigureAnimation } from './StickFigureAnimation';

interface Props {
  exercise: Exercise;
  className?: string;
  compact?: boolean;
}

/**
 * Demonstração visual do exercício: vídeo próprio > fotos do dataset com crossfade > boneco SVG.
 * Respeita prefers-reduced-motion mostrando as duas fotos lado a lado.
 */
export function ExerciseAnimation({ exercise, className = '', compact = false }: Props) {
  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);
  const reduced = useReducedMotion();
  const source = mediaSourceFor(exercise);
  const m = MEDIA[exercise.id];

  const controls = !compact && !reduced && source !== 'none' && source !== 'video' && (
    <div className="mt-2 flex justify-center gap-2">
      <button
        type="button"
        className="btn-ghost min-h-10 px-3 text-sm"
        onClick={() => setPlaying((p) => !p)}
        aria-pressed={!playing}
        aria-label={playing ? 'Pausar animação' : 'Reproduzir animação'}
      >
        <Icon name={playing ? 'pause' : 'play'} className="size-5" />
        {playing ? 'Pausar' : 'Reproduzir'}
      </button>
      <button
        type="button"
        className="btn-ghost min-h-10 px-3 text-sm"
        onClick={() => setSlow((s) => !s)}
        aria-pressed={slow}
      >
        {slow ? 'Velocidade: lenta' : 'Velocidade: normal'}
      </button>
    </div>
  );

  if (source === 'video' && m?.video) {
    return (
      <figure className={className}>
        <video
          src={m.video}
          className="aspect-video w-full rounded-xl bg-black object-contain"
          autoPlay
          muted
          loop
          playsInline
          controls={!compact}
          aria-label={`Vídeo: ${exercise.name}`}
        />
      </figure>
    );
  }

  if (source === 'dataset' && m?.images) {
    const [a, b] = m.images;
    if (reduced) {
      return (
        <figure className={className}>
          <div
            className="grid grid-cols-2 gap-2"
            role="img"
            aria-label={`${exercise.name}: posição inicial e final`}
          >
            <img
              src={a}
              alt="Posição inicial"
              className="aspect-[4/3] w-full rounded-xl object-cover"
              loading="lazy"
            />
            <img
              src={b}
              alt="Posição final"
              className="aspect-[4/3] w-full rounded-xl object-cover"
              loading="lazy"
            />
          </div>
        </figure>
      );
    }
    return (
      <figure className={className}>
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 ${playing ? '' : 'xfade-paused'}`}
          style={{ ['--xfade-duration' as string]: slow ? '4.8s' : '2.4s' }}
          role="img"
          aria-label={`Demonstração animada: ${exercise.name}`}
        >
          <img
            src={a}
            alt=""
            className="xfade-a absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <img
            src={b}
            alt=""
            className="xfade-b absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        {controls}
      </figure>
    );
  }

  if (source === 'svg' && exercise.media.svgKeyframes) {
    const spec = SVG_KEYFRAMES[exercise.media.svgKeyframes];
    return (
      <figure className={className}>
        <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
          <StickFigureAnimation
            spec={spec}
            playing={playing}
            speed={slow ? 0.5 : 1}
            title={exercise.name}
          />
        </div>
        {controls}
      </figure>
    );
  }

  return (
    <figure className={className}>
      <div className="grid aspect-[4/3] w-full place-items-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Icon name="dumbbell" className="size-10" />
      </div>
    </figure>
  );
}
