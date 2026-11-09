import { Link, useParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { WorkoutParts } from '@/components/WorkoutParts';
import { WorkoutTypeIcon } from '@/components/WorkoutTypeIcon';
import { CHECKPOINTS, PHASES, TIPS, WEEKS, getWeek, phaseForWeek } from '@/data/plan';
import { useAllSessions, useRuns, useSettings } from '@/db/hooks';
import {
  WEEKDAY_LABELS,
  dateOfPlanDay,
  effectiveStartDate,
  formatDate,
  fromISODate,
  weekStartDate,
} from '@/lib/dates';
import { usePlanToday } from '@/features/today/usePlanToday';

export function PlanPage() {
  const t = usePlanToday();
  const settings = useSettings();
  const sessions = useAllSessions();
  const current = t.position.status === 'em-andamento' ? t.position.week : 0;
  const start = settings
    ? effectiveStartDate(fromISODate(settings.startDate), settings.weekRepeats)
    : null;
  const doneWeeks = new Set((sessions ?? []).filter((s) => s.finishedAt).map((s) => s.week));

  return (
    <div className="space-y-5 p-4">
      <header>
        <h1 className="text-2xl font-bold">Plano de 24 semanas</h1>
        <p className="text-sm text-slate-500">
          {current
            ? `Você está na semana ${current}.`
            : t.position.status === 'antes'
              ? 'Ainda não começou.'
              : 'Plano concluído.'}
          {settings?.weekRepeats.length
            ? ` ${settings.weekRepeats.length} semana(s) repetida(s).`
            : ''}
        </p>
      </header>

      {PHASES.map((ph) => (
        <section key={ph.id} aria-labelledby={`fase-${ph.id}`}>
          <div className="mb-2 flex items-baseline gap-2">
            <span
              className="size-3 rounded-full"
              style={{ background: ph.color }}
              aria-hidden="true"
            />
            <h2 id={`fase-${ph.id}`} className="font-bold">
              Fase {ph.id}: {ph.name}
            </h2>
            <span className="text-xs text-slate-500">
              sem. {ph.weeks[0]}–{ph.weeks[1]} · {ph.targetWeightKg[0]}–{ph.targetWeightKg[1]} kg
            </span>
          </div>
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">{ph.description}</p>
          <div className="grid grid-cols-4 gap-2">
            {WEEKS.filter((w) => w.phaseId === ph.id).map((w) => {
              const isCurrent = w.number === current;
              const done = doneWeeks.has(w.number) && w.number < current;
              return (
                <Link
                  key={w.number}
                  to={`/plano/${w.number}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={`card flex min-h-16 flex-col items-center justify-center p-2 text-center ${
                    isCurrent ? 'ring-2 ring-brand-500' : ''
                  } ${w.number < current && !isCurrent ? 'opacity-70' : ''}`}
                >
                  <span className="text-lg font-bold">{w.number}</span>
                  <span className="text-[10px] uppercase text-slate-500">
                    {w.deload ? 'leve' : start ? formatDate(weekStartDate(start, w.number)) : ''}
                  </span>
                  {done && <Icon name="check" className="size-3 text-done" />}
                </Link>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            <strong>Para avançar:</strong> {ph.advanceRule}
          </p>
        </section>
      ))}

      <section className="card p-4">
        <h2 className="font-bold">Checkpoints</h2>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-1">Sem.</th>
              <th>Corrida</th>
              <th>Peso</th>
            </tr>
          </thead>
          <tbody>
            {CHECKPOINTS.map((c) => (
              <tr key={c.week} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-1.5 font-semibold">{c.week}</td>
                <td>{c.run}</td>
                <td>
                  {c.targetWeightKg[0] === c.targetWeightKg[1]
                    ? c.targetWeightKg[0]
                    : `${c.targetWeightKg[0]}–${c.targetWeightKg[1]}`}{' '}
                  kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-500">
          Depois da semana 24: "Novo ciclo", repetindo as Fases 4–5 com cargas maiores.
        </p>
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Dicas fixas</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          {TIPS.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function WeekPage() {
  const params = useParams();
  const n = Math.min(24, Math.max(1, Number(params.week) || 1));
  const week = getWeek(n);
  const phase = phaseForWeek(n);
  const settings = useSettings();
  const sessions = useAllSessions();
  const runs = useRuns();
  const start = settings
    ? effectiveStartDate(fromISODate(settings.startDate), settings.weekRepeats)
    : null;
  const ordered = [...week.days].sort((a, b) => ((a.weekday + 6) % 7) - ((b.weekday + 6) % 7));

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center gap-2">
        <Link to="/plano" className="btn-ghost size-12 px-0" aria-label="Voltar ao plano">
          <Icon name="back" className="size-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Semana {n}</h1>
          <p className="text-sm text-slate-500">
            Fase {phase.id}: {phase.name}
            {week.deload ? ' · semana leve' : ''}
            {start ? ` · a partir de ${formatDate(weekStartDate(start, n))}` : ''}
          </p>
        </div>
      </header>
      <div className="flex gap-2">
        {n > 1 && (
          <Link to={`/plano/${n - 1}`} className="btn-secondary min-h-10 flex-1 text-sm">
            ← Semana {n - 1}
          </Link>
        )}
        {n < 24 && (
          <Link to={`/plano/${n + 1}`} className="btn-secondary min-h-10 flex-1 text-sm">
            Semana {n + 1} →
          </Link>
        )}
      </div>
      {week.notes && (
        <ul className="rounded-xl bg-brand-50 p-3 text-sm text-brand-900 dark:bg-brand-900/20 dark:text-brand-100">
          {week.notes.map((x) => (
            <li key={x}>• {x}</li>
          ))}
        </ul>
      )}
      {ordered.map((d) => {
        const date = start ? dateOfPlanDay(start, n, d.weekday) : null;
        const iso = date ? date.toISOString().slice(0, 10) : '';
        const done =
          (sessions ?? []).some((s) => s.workoutId === d.id && s.finishedAt) ||
          (runs ?? []).some((r) => r.workoutId === d.id);
        return (
          <article key={d.id} className={`card p-4 ${done ? 'ring-2 ring-done/60' : ''}`}>
            <div className="flex items-start gap-3">
              <WorkoutTypeIcon type={d.type} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {WEEKDAY_LABELS[d.weekday]}
                  {date ? ` · ${formatDate(date)}` : ''}
                  {d.light ? ' · leve' : ''}
                  {d.optional ? ' · opcional' : ''}
                </p>
                <h2 className="font-bold leading-tight">{d.title}</h2>
                <p className="text-xs text-slate-500">≈ {d.estimatedMin} min</p>
              </div>
              {done && <Icon name="check" className="size-6 text-done" />}
            </div>
            <div className="mt-3">
              <WorkoutParts workout={d} />
            </div>
            {d.type !== 'descanso' && (
              <Link
                to={`/treino/${n}/${d.weekday}`}
                className="btn-secondary mt-3 min-h-10 w-full text-sm"
                data-date={iso}
              >
                Abrir este treino
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
