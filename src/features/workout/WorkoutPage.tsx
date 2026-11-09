import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { WorkoutTypeIcon } from '@/components/WorkoutTypeIcon';
import { getExercise } from '@/data/exercises';
import { PAIN_DAY_WORKOUT, getDayWorkout, getWeek } from '@/data/plan';
import { PAIN_REGIONS, type PainRegion, type Weekday } from '@/data/types';
import { useRuns, useSettingsOrDefault } from '@/db/hooks';
import { db } from '@/db/schema';
import { beep, keepAwake, unlockAudio, vibrate } from '@/lib/device';
import { useCountdown } from '@/lib/timer';
import { BikeCard } from './BikeCard';
import { ExerciseCard } from './ExerciseCard';
import { FinishForm } from './FinishForm';
import { MobilityChecklist } from './MobilityChecklist';
import { RestTimer } from './RestTimer';
import { useWorkoutSession } from './useWorkoutSession';

export function WorkoutPage() {
  const params = useParams();
  const [search] = useSearchParams();
  const week = Math.min(24, Math.max(1, Number(params.week) || 1));
  const weekday = (Number(params.weekday) || 0) as Weekday;
  const painParam = search.get('dor');
  const painDay = painParam != null;
  const painReason = painDay
    ? (PAIN_REGIONS.find((r) => r.id === (painParam as PainRegion))?.label ?? painParam)
    : undefined;
  const workout = useMemo(
    () => (painDay ? PAIN_DAY_WORKOUT : getDayWorkout(week, weekday)),
    [painDay, week, weekday],
  );
  const settings = useSettingsOrDefault();
  const navigate = useNavigate();
  const { session, update } = useWorkoutSession(workout, week, weekday, painDay, painReason);
  const runs = useRuns();
  const [finishing, setFinishing] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [restOverride, setRestSeconds] = useState<number | null>(null);
  const restSeconds = restOverride ?? settings.restSeconds;
  const runDone = runs?.some((r) => r.workoutId === workout.id && r.date === session?.date);

  const rest = useCountdown(restSeconds, () => {
    if (settings.sound) beep(2, 880, 200);
    if (settings.vibration) vibrate([200, 100, 200]);
  });

  useEffect(() => {
    let release: (() => void) | undefined;
    void keepAwake().then((r) => (release = r));
    return () => release?.();
  }, []);

  const onSetDone = useCallback(() => {
    unlockAudio();
    rest.start(restSeconds);
    setRestOpen(true);
  }, [rest, restSeconds]);

  const closeRest = useCallback(() => {
    rest.reset();
    setRestOpen(false);
  }, [rest]);

  if (!session) return <div className="p-4 text-slate-500">Preparando o treino…</div>;

  const refs = workout.exercises ?? [];
  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0);
  const doneSets = session.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const weekInfo = getWeek(week);

  async function finish(data: { pain: Record<string, number>; rpe: number; notes: string }) {
    const finishedAt = new Date().toISOString();
    const durationSec = Math.round(
      (Date.parse(finishedAt) - Date.parse(session!.startedAt)) / 1000,
    );
    update({ finishedAt, durationSec, rpe: data.rpe, notes: data.notes });
    await db.painLogs.add({
      date: session!.date,
      week,
      sessionId: session!.id,
      scores: data.pain,
      notes: data.notes || undefined,
      createdAt: finishedAt,
    });
    const habit = await db.habits.where('date').equals(session!.date).first();
    if (session!.mobilityDone) {
      if (habit) await db.habits.update(habit.id!, { mobility: true });
      else
        await db.habits.add({
          date: session!.date,
          water: false,
          protein: false,
          mobility: true,
          sleep: false,
        });
    }
    navigate('/', { replace: true });
  }

  if (finishing) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">Fechar o treino</h1>
        <FinishForm
          initialNotes={session.notes}
          initialRpe={session.rpe}
          onSubmit={(d) => void finish(d)}
          onCancel={() => setFinishing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-start gap-3">
        <Link to="/" className="btn-ghost size-12 shrink-0 px-0" aria-label="Voltar">
          <Icon name="back" className="size-6" />
        </Link>
        <WorkoutTypeIcon type={workout.type} className="size-12" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-tight">{workout.title}</h1>
          <p className="text-sm text-slate-500">
            Semana {week}
            {weekInfo.deload ? ' · semana leve' : ''} · ≈ {workout.estimatedMin} min
            {session.finishedAt ? ' · concluído' : ''}
          </p>
          {painDay && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Dia de dor: {painReason}. Nada de corrida ou carga.
            </p>
          )}
        </div>
      </header>

      {totalSets > 0 && (
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={doneSets}
          aria-valuemax={totalSets}
          aria-label="Séries feitas"
        >
          <div
            className="h-full bg-brand-500 transition-[width]"
            style={{ width: `${(doneSets / totalSets) * 100}%` }}
          />
        </div>
      )}

      {workout.notes && (
        <ul className="text-sm text-slate-600 dark:text-slate-300">
          {workout.notes.map((n) => (
            <li key={n}>• {n}</li>
          ))}
        </ul>
      )}

      {workout.mobilityFirst && (
        <MobilityChecklist
          done={session.mobilityDone}
          onDone={(v) => update({ mobilityDone: v })}
        />
      )}

      {workout.bike && (
        <BikeCard
          bike={workout.bike}
          done={!!session.bikeMinutes}
          onDone={(m) => update({ bikeMinutes: m || undefined })}
          sound={settings.sound}
          vibration={settings.vibration}
        />
      )}

      {refs.length > 0 && (
        <section className="space-y-3" aria-label="Exercícios">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">
              Exercícios · {doneSets}/{totalSets} séries
            </h2>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              Descanso
              <select
                className="input min-h-9 w-auto px-2 py-0 text-sm"
                value={restSeconds}
                onChange={(e) => setRestSeconds(Number(e.target.value))}
                aria-label="Duração do descanso"
              >
                {[45, 60, 75, 90, 120, 150, 180].map((s) => (
                  <option key={s} value={s}>
                    {s} s
                  </option>
                ))}
              </select>
            </label>
          </div>
          {refs.map((ref, i) => {
            const log = session.exercises[i];
            if (!log) return null;
            return (
              <ExerciseCard
                key={ref.exerciseId + i}
                index={i}
                refSpec={ref}
                log={log}
                onChange={(l) =>
                  update((s) => ({ exercises: s.exercises.map((x, j) => (j === i ? l : x)) }))
                }
                onSetDone={onSetDone}
              />
            );
          })}
        </section>
      )}

      {workout.run && (
        <section className={`card p-4 ${runDone ? 'ring-2 ring-done/60' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-500 text-white">
              <Icon name="run" className="size-5" />
            </span>
            <div className="flex-1">
              <h3 className="font-bold">{workout.run.title}</h3>
              <p className="text-xs text-slate-500">{workout.run.note}</p>
            </div>
          </div>
          <Link
            to={`/corrida/${week}/${weekday}`}
            className={`${runDone ? 'btn-secondary' : 'btn-primary'} mt-3 w-full`}
          >
            {runDone
              ? 'Corrida registrada · ver'
              : workout.run.distanceKm && !workout.run.steps.length
                ? 'Abrir cronômetro'
                : 'Abrir timer de corrida'}
          </Link>
        </section>
      )}

      {workout.basketball && (
        <section className="card p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-500 text-white">
              <Icon name="ball" className="size-5" />
            </span>
            <div className="flex-1">
              <h3 className="font-bold">Basquete · {workout.basketball.minutes} min</h3>
              <p className="text-xs text-slate-500">{workout.basketball.note}</p>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {workout.basketball.drillIds.map((id) => {
              const ex = getExercise(id);
              return (
                <li key={id}>
                  <Link to={`/biblioteca/${id}`} className="flex items-center gap-2 text-sm">
                    <Icon name="ball" className="size-4 text-amber-500" />
                    <span className="font-medium">{ex.name}</span>
                    <span className="text-slate-500">· {ex.steps[0]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="pt-2">
        <button className="btn-primary min-h-14 w-full text-lg" onClick={() => setFinishing(true)}>
          <Icon name="check" className="size-6" />
          {session.finishedAt ? 'Atualizar registro' : 'Terminar treino'}
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          Tudo o que você marcou já está salvo.
        </p>
      </div>

      {restOpen && <RestTimer countdown={rest} onClose={closeRest} />}
    </div>
  );
}
