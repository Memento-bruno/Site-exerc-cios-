import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { WorkoutParts } from '@/components/WorkoutParts';
import { WorkoutTypeIcon } from '@/components/WorkoutTypeIcon';
import { PAIN_REGIONS, type PainRegion } from '@/data/types';
import { useHabitsOn, useSessionsOn, useSettings } from '@/db/hooks';
import { db } from '@/db/schema';
import { updateSettings } from '@/db/settings';
import { WEEKDAY_LABELS, addDays, daysBetween, formatDate, mondayOf, toISODate } from '@/lib/dates';
import { usePlanToday } from './usePlanToday';
import { WeekReviewCard } from './WeekReviewCard';

export function TodayPage() {
  const t = usePlanToday();
  const settings = useSettings();
  const sessions = useSessionsOn(t.todayIso);
  const habits = useHabitsOn(t.todayIso);
  const navigate = useNavigate();
  const [painOpen, setPainOpen] = useState(false);
  const [painRegion, setPainRegion] = useState<PainRegion>('posterior-direita');

  if (t.loading || !settings) {
    return <div className="p-4 text-slate-500">Carregando…</div>;
  }

  const dateLabel = `${WEEKDAY_LABELS[t.weekday]}, ${formatDate(t.today, { day: 'numeric', month: 'long' })}`;

  if (t.position.status === 'antes') {
    const days = daysBetween(t.today, t.position.effectiveStart);
    return (
      <div className="space-y-4 p-4">
        <Header title="Quase lá" subtitle={dateLabel} />
        <section className="card p-5">
          <p className="text-lg font-semibold">
            O plano começa em {days} {days === 1 ? 'dia' : 'dias'}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Segunda-feira,{' '}
            {formatDate(t.position.effectiveStart, { day: 'numeric', month: 'long' })}. Enquanto
            isso, vale fazer a mobilidade diária e registrar o peso de referência em Progresso.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              className="btn-primary"
              onClick={() =>
                void updateSettings({ startDate: toISODate(mondayOf(t.today)), weekRepeats: [] })
              }
            >
              Começar esta semana
            </button>
            <Link to="/plano" className="btn-secondary">
              Ver o plano completo
            </Link>
          </div>
        </section>
        <MobilityCard done={!!habits?.mobility} dateIso={t.todayIso} />
      </div>
    );
  }

  if (t.position.status === 'concluido') {
    return (
      <div className="space-y-4 p-4">
        <Header title="24 semanas completas!" subtitle={dateLabel} />
        <section className="card p-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Você chegou ao fim do plano. Registre o teste dos 5 km em Progresso, tire novas fotos e
            revise a meta com o seu médico.
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            <strong>Novo ciclo:</strong> repete as Fases 4 e 5 (semanas 13–24) com cargas maiores,
            até o peso ideal.
          </p>
          <button
            className="btn-primary mt-4 w-full"
            onClick={() => {
              const start = addDays(mondayOf(t.today), -12 * 7);
              void updateSettings({ startDate: toISODate(start), weekRepeats: [] });
            }}
          >
            Começar novo ciclo (Fase 4)
          </button>
        </section>
      </div>
    );
  }

  const w = t.workout!;
  const week = t.week!;
  const phase = t.phase!;
  const done = (sessions ?? []).find((s) => s.finishedAt);
  const inProgress = (sessions ?? []).find((s) => !s.finishedAt);

  async function startPainDay() {
    await db.painLogs.add({
      date: t.todayIso,
      week: t.position.week,
      scores: { [painRegion]: 5 },
      notes: 'Dia de dor escolhido na tela Hoje',
      createdAt: new Date().toISOString(),
    });
    navigate(`/treino/${t.position.week}/${t.weekday}?dor=${painRegion}`);
  }

  return (
    <div className="space-y-4 p-4">
      <Header
        title={`Semana ${t.position.week} de 24`}
        subtitle={`${dateLabel} · Fase ${phase.id}: ${phase.name}`}
        badges={[
          ...(week.deload
            ? [
                {
                  text: 'Semana leve',
                  cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
                },
              ]
            : []),
          ...(t.isOfficeDay
            ? [
                {
                  text: 'Dia de escritório',
                  cls: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
                },
              ]
            : []),
        ]}
      />

      <WeekReviewCard week={t.position.week} weekday={t.weekday} />

      <section className="card overflow-hidden" aria-labelledby="treino-hoje">
        <div className="flex items-start gap-3 p-4">
          <WorkoutTypeIcon type={done?.painDay ? 'dor' : w.type} className="size-12" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Treino de hoje
            </p>
            <h2 id="treino-hoje" className="text-lg font-bold leading-tight">
              {done?.painDay ? t.painDayWorkout.title : w.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              ≈ {w.estimatedMin} min
              {w.light && !done ? ' · dia leve' : ''}
              {w.optional ? ' · opcional' : ''}
            </p>
          </div>
        </div>
        <div className="px-4 pb-4">
          <WorkoutParts workout={w} limit={6} />
        </div>
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          {done ? (
            <div className="flex items-center gap-3 text-done">
              <Icon name="check" className="size-6" />
              <div className="flex-1">
                <p className="font-semibold">Treino concluído</p>
                <p className="text-xs text-slate-500">Bom trabalho. Amanhã tem mais.</p>
              </div>
              <Link
                to={`/treino/${t.position.week}/${t.weekday}`}
                className="btn-ghost min-h-10 text-sm"
              >
                Ver
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to={`/treino/${t.position.week}/${t.weekday}`}
                className="btn-primary min-h-14 text-lg"
              >
                <Icon name="play" className="size-6" />
                {inProgress ? 'Continuar' : 'Começar'}
              </Link>
              {!painOpen ? (
                <button
                  className="btn bg-transparent text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  onClick={() => setPainOpen(true)}
                >
                  <Icon name="heart" className="size-5" />
                  Hoje estou com dor
                </button>
              ) : (
                <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40">
                  <label className="label" htmlFor="pain-region">
                    Onde dói mais?
                  </label>
                  <select
                    id="pain-region"
                    className="input"
                    value={painRegion}
                    onChange={(e) => setPainRegion(e.target.value as PainRegion)}
                  >
                    {PAIN_REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    Troca o treino por mobilidade + 15 min de bike leve + respiração. Nada de
                    corrida ou carga.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button className="btn-danger flex-1" onClick={() => void startPainDay()}>
                      Fazer o treino leve
                    </button>
                    <button className="btn-secondary" onClick={() => setPainOpen(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <MobilityCard done={!!habits?.mobility} dateIso={t.todayIso} />

      {week.notes && (
        <section className="card p-4">
          <h3 className="text-sm font-semibold">Nesta semana</h3>
          <ul className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {week.notes.map((n) => (
              <li key={n}>• {n}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/habitos" className="card p-4 hover:ring-brand-300">
          <p className="font-semibold">Hábitos de hoje</p>
          <p className="text-xs text-slate-500">Água, proteína, mobilidade, sono</p>
        </Link>
        <Link to="/seguranca" className="card p-4 hover:ring-brand-300">
          <p className="font-semibold">Segurança</p>
          <p className="text-xs text-slate-500">Regra da dor e sinais de alerta</p>
        </Link>
      </div>
    </div>
  );
}

function Header({
  title,
  subtitle,
  badges = [],
}: {
  title: string;
  subtitle: string;
  badges?: { text: string; cls: string }[];
}) {
  return (
    <header>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        {badges.map((b) => (
          <span key={b.text} className={`badge ${b.cls}`}>
            {b.text}
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </header>
  );
}

function MobilityCard({ done, dateIso }: { done: boolean; dateIso: string }) {
  async function toggle() {
    const existing = await db.habits.where('date').equals(dateIso).first();
    if (existing) await db.habits.update(existing.id!, { mobility: !done });
    else
      await db.habits.add({
        date: dateIso,
        water: false,
        protein: false,
        mobility: true,
        sleep: false,
      });
  }
  return (
    <section className="card flex items-center gap-3 p-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label="Mobilidade diária feita"
        onClick={() => void toggle()}
        className={`grid size-12 shrink-0 place-items-center rounded-xl border-2 transition ${
          done ? 'border-done bg-done text-white' : 'border-slate-300 dark:border-slate-600'
        }`}
      >
        {done && <Icon name="check" className="size-7" />}
      </button>
      <div className="flex-1">
        <p className="font-semibold">Mobilidade diária · 10 min</p>
        <p className="text-xs text-slate-500">
          Gato-vaca, flexor do quadril, open book, wall slide, chin tuck, posterior, peito.
        </p>
      </div>
      <Link
        to="/biblioteca?filtro=mobilidade"
        className="btn-ghost min-h-10 px-2 text-sm"
        aria-label="Ver exercícios de mobilidade"
      >
        Ver
      </Link>
    </section>
  );
}
