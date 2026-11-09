import { useState } from 'react';
import type { RunWorkout } from '@/data/types';
import { formatDuration, formatPace, parseDuration } from '@/lib/units';

export interface RunLogData {
  distanceKm?: number;
  durationSec?: number;
  paceSecPerKm?: number;
  feeling?: string;
  notes?: string;
  rpe?: number;
}

const FEELINGS = ['Tranquilo', 'Ok', 'Puxado', 'Muito difícil'];

export function RunLogForm({
  run,
  elapsedSec,
  onSubmit,
  onCancel,
}: {
  run: RunWorkout;
  elapsedSec: number;
  onSubmit: (d: RunLogData) => void;
  onCancel: () => void;
}) {
  const [distance, setDistance] = useState(
    run.distanceKm ? String(run.distanceKm).replace('.', ',') : '',
  );
  const [time, setTime] = useState(elapsedSec > 0 ? formatDuration(elapsedSec) : '');
  const [feeling, setFeeling] = useState<string>('Ok');
  const [notes, setNotes] = useState('');
  const [rpe, setRpe] = useState(6);

  const km = Number(distance.replace(',', '.')) || 0;
  const sec = parseDuration(time);
  const pace = km > 0 && sec ? sec / km : null;
  const beatTarget = run.targetTimeMin && sec ? sec <= run.targetTimeMin * 60 : null;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          distanceKm: km || undefined,
          durationSec: sec || undefined,
          paceSecPerKm: pace ?? undefined,
          feeling,
          notes: notes || undefined,
          rpe,
        });
      }}
    >
      <section className="card p-4">
        <h2 className="font-bold">Registro da corrida</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="dist">
              Distância (km)
            </label>
            <input
              id="dist"
              className="input"
              inputMode="decimal"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="ex.: 3,2"
            />
          </div>
          <div>
            <label className="label" htmlFor="time">
              Tempo total
            </label>
            <input
              id="time"
              className="input"
              inputMode="numeric"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="mm:ss"
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Ritmo médio: <strong>{pace ? `${formatPace(pace)}/km` : '—'}</strong>
          {beatTarget != null && (
            <span
              className={`ml-2 badge ${beatTarget ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
            >
              {beatTarget
                ? `Abaixo de ${run.targetTimeMin} min!`
                : `Meta: ${run.targetTimeMin} min`}
            </span>
          )}
        </p>
      </section>
      <section className="card p-4">
        <p className="font-bold">Como foi?</p>
        <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Como foi">
          {FEELINGS.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={feeling === f}
              onClick={() => setFeeling(f)}
              className={`btn ${feeling === f ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <label htmlFor="run-rpe" className="mt-4 block font-medium">
          Esforço: {rpe}/10
        </label>
        <input
          id="run-rpe"
          type="range"
          min={1}
          max={10}
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="h-3 w-full accent-brand-500"
        />
        <label htmlFor="run-notes" className="label mt-3">
          Observações
        </label>
        <textarea
          id="run-notes"
          className="input min-h-20 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Dores, sensações, clima…"
        />
      </section>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Voltar
        </button>
        <button type="submit" className="btn-primary flex-1">
          Salvar corrida
        </button>
      </div>
    </form>
  );
}
