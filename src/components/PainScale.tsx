import { PAIN_REGIONS, type PainRegion } from '@/data/types';

export type PainScores = Partial<Record<PainRegion, number>>;

/** Escala 0–10 por região de dor. */
export function PainScale({
  value,
  onChange,
}: {
  value: PainScores;
  onChange: (v: PainScores) => void;
}) {
  return (
    <div className="space-y-3">
      {PAIN_REGIONS.map((r) => {
        const v = value[r.id] ?? 0;
        return (
          <div key={r.id}>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor={`pain-${r.id}`} className="font-medium">
                {r.label}
              </label>
              <span
                className={`badge ${v >= 4 ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' : v > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
              >
                {v}/10
              </span>
            </div>
            <input
              id={`pain-${r.id}`}
              type="range"
              min={0}
              max={10}
              step={1}
              value={v}
              onChange={(e) => onChange({ ...value, [r.id]: Number(e.target.value) })}
              className="mt-1 h-3 w-full accent-brand-500"
              aria-valuetext={`${v} de 10`}
            />
          </div>
        );
      })}
      <p className="text-xs text-slate-500">
        Até 3/10 é aceitável se passar em 24 h. Acima disso, reduza carga ou amplitude.
      </p>
    </div>
  );
}
