import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { getDayWorkout } from '@/data/plan';
import type { Weekday } from '@/data/types';
import { useRuns, useSettingsOrDefault } from '@/db/hooks';
import { db } from '@/db/schema';
import { toISODate } from '@/lib/dates';
import { isIOS, keepAwake, unlockAudio } from '@/lib/device';
import { primeSpeech, speechSupported } from '@/lib/speech';
import { useStopwatch } from '@/lib/timer';
import { formatDuration, formatKmh, formatPace, kmhToPace } from '@/lib/units';
import type { BlockKind } from '@/lib/run-blocks';
import { RunLogForm, type RunLogData } from './RunLogForm';
import { useRunEngine } from './useRunEngine';

const KIND_STYLE: Record<BlockKind, { bg: string; label: string }> = {
  warmup: { bg: 'bg-sky-600', label: 'Aquecimento' },
  run: { bg: 'bg-run', label: 'CORRA' },
  fast: { bg: 'bg-rose-600', label: 'ACELERE' },
  walk: { bg: 'bg-walk', label: 'ANDE' },
  cooldown: { bg: 'bg-slate-600', label: 'Desaquecimento' },
};

export function RunTimerPage() {
  const params = useParams();
  const week = Math.min(24, Math.max(1, Number(params.week) || 1));
  const weekday = (Number(params.weekday) || 0) as Weekday;
  const workout = getDayWorkout(week, weekday);
  const run = workout.run;
  const settings = useSettingsOrDefault();
  const navigate = useNavigate();
  const runs = useRuns();
  const existing = runs?.find(
    (r) => r.workoutId === workout.id && r.date === toISODate(new Date()),
  );
  const [logging, setLogging] = useState(false);
  const [elapsedForLog, setElapsedForLog] = useState(0);

  useEffect(() => primeSpeech(), []);

  if (!run) {
    return (
      <div className="p-4">
        <p>Este dia não tem corrida.</p>
        <Link to="/" className="btn-secondary mt-4">
          Voltar
        </Link>
      </div>
    );
  }

  async function save(d: RunLogData) {
    await db.runs.add({
      date: toISODate(new Date()),
      week,
      workoutId: workout.id,
      title: run!.title,
      mode: run!.mode,
      isTest: run!.mode === 'teste' || undefined,
      createdAt: new Date().toISOString(),
      ...d,
    });
    navigate(`/treino/${week}/${weekday}`, { replace: true });
  }

  if (logging) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">{run.title}</h1>
        <RunLogForm
          run={run}
          elapsedSec={elapsedForLog}
          onSubmit={(d) => void save(d)}
          onCancel={() => setLogging(false)}
        />
      </div>
    );
  }

  if (existing) {
    return (
      <div className="space-y-4 p-4">
        <Header title={run.title} week={week} weekday={weekday} />
        <section className="card p-4">
          <p className="font-semibold text-done">Corrida registrada hoje</p>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
            <Stat
              label="Distância"
              value={
                existing.distanceKm ? `${existing.distanceKm.toLocaleString('pt-BR')} km` : '—'
              }
            />
            <Stat
              label="Tempo"
              value={existing.durationSec ? formatDuration(existing.durationSec) : '—'}
            />
            <Stat
              label="Ritmo"
              value={existing.paceSecPerKm ? `${formatPace(existing.paceSecPerKm)}/km` : '—'}
            />
          </dl>
          {existing.feeling && (
            <p className="mt-2 text-sm text-slate-500">Como foi: {existing.feeling}</p>
          )}
          <button
            className="btn-secondary mt-3 w-full"
            onClick={() => {
              void db.runs.delete(existing.id!);
            }}
          >
            Apagar e refazer
          </button>
        </section>
      </div>
    );
  }

  const hasBlocks = run.steps.length > 0;
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col p-4">
      <Header title={run.title} week={week} weekday={weekday} />
      {run.note && <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{run.note}</p>}
      {hasBlocks ? (
        <IntervalTimer
          runKey={workout.id}
          run={run}
          opts={{ voice: settings.voice, sound: settings.sound, vibration: settings.vibration }}
          onFinish={(elapsed) => {
            setElapsedForLog(elapsed);
            setLogging(true);
          }}
        />
      ) : (
        <DistanceTimer
          run={run}
          onFinish={(elapsed) => {
            setElapsedForLog(elapsed);
            setLogging(true);
          }}
        />
      )}
      <Limitations />
    </div>
  );
}

function Header({ title, week, weekday }: { title: string; week: number; weekday: number }) {
  return (
    <header className="mb-3 flex items-center gap-2">
      <Link
        to={`/treino/${week}/${weekday}`}
        className="btn-ghost size-12 px-0"
        aria-label="Voltar ao treino"
      >
        <Icon name="back" className="size-6" />
      </Link>
      <h1 className="text-xl font-bold leading-tight">{title}</h1>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-lg font-bold">{value}</dd>
    </div>
  );
}

function IntervalTimer({
  run,
  runKey,
  opts,
  onFinish,
}: {
  run: NonNullable<ReturnType<typeof getDayWorkout>['run']>;
  runKey: string;
  opts: { voice: boolean; sound: boolean; vibration: boolean };
  onFinish: (elapsed: number) => void;
}) {
  const eng = useRunEngine(run, opts);
  const cur = eng.current;
  const style = cur ? KIND_STYLE[cur.kind] : null;
  const speed = cur?.speedKmh ?? (cur?.kind === 'run' ? run.speedKmh : undefined);
  const started = eng.elapsed > 0 || eng.running;

  useEffect(() => {
    if (eng.finished) onFinish(Math.round(eng.elapsed));
  }, [eng.finished, eng.elapsed, onFinish]);

  return (
    <div className="flex flex-1 flex-col" key={runKey}>
      <section
        className={`flex flex-1 flex-col items-center justify-center rounded-3xl p-6 text-center text-white transition-colors duration-500 ${style?.bg ?? 'bg-slate-700'}`}
        aria-live="assertive"
        aria-atomic="true"
      >
        <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
          {cur ? `Bloco ${eng.index + 1} de ${eng.blocks.length}` : 'Pronto'}
          {cur?.rep && cur.repTotal
            ? ` · ${cur.kind === 'walk' ? 'Pausa' : 'Tiro'} ${cur.rep}/${cur.repTotal}`
            : ''}
        </p>
        <p className="mt-2 text-5xl font-black leading-none sm:text-6xl">
          {cur ? style!.label : run.title}
        </p>
        {cur?.label && cur.label !== style!.label && cur.kind !== 'run' && cur.kind !== 'walk' && (
          <p className="mt-1 text-lg opacity-90">{cur.label}</p>
        )}
        <p className="mt-6 text-7xl font-bold tabular-nums leading-none sm:text-8xl">
          {formatDuration(eng.remaining)}
        </p>
        {speed && (
          <p className="mt-4 rounded-full bg-white/20 px-4 py-1 text-lg font-semibold">
            {formatKmh(speed)} km/h · {kmhToPace(speed)}/km
          </p>
        )}
        {cur?.meters && <p className="mt-1 text-sm opacity-90">{cur.meters} m</p>}
        <p className="mt-6 text-sm opacity-90">
          {eng.next
            ? `Depois: ${KIND_STYLE[eng.next.kind].label.toLowerCase()} ${formatDuration(eng.next.seconds)}`
            : cur
              ? 'Último bloco'
              : ''}
        </p>
      </section>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span>Total {formatDuration(eng.elapsed)}</span>
        <span>de {formatDuration(eng.total)}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-brand-500"
          style={{ width: `${(eng.elapsed / eng.total) * 100}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
        {eng.running ? (
          <button className="btn-secondary min-h-16 text-lg" onClick={eng.pause}>
            <Icon name="pause" className="size-6" /> Pausar
          </button>
        ) : (
          <button className="btn-primary min-h-16 text-lg" onClick={eng.start}>
            <Icon name="play" className="size-6" /> {started ? 'Continuar' : 'Iniciar'}
          </button>
        )}
        <button
          className="btn-secondary min-h-16 px-4"
          onClick={eng.skip}
          aria-label="Pular bloco"
          disabled={!started}
        >
          <Icon name="skip" className="size-6" />
        </button>
        <button
          className="btn-secondary min-h-16 px-4"
          onClick={eng.stop}
          aria-label="Encerrar e registrar"
          disabled={!started}
        >
          <Icon name="flag" className="size-6" />
        </button>
      </div>
      {!started && (
        <ol className="mt-4 max-h-40 space-y-1 overflow-auto text-sm text-slate-600 dark:text-slate-300">
          {eng.blocks.map((b, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {KIND_STYLE[b.kind].label}
                {b.rep ? ` ${b.rep}/${b.repTotal}` : ''}
                {b.speedKmh ? ` · ${formatKmh(b.speedKmh)} km/h` : ''}
              </span>
              <span className="tabular-nums">{formatDuration(b.seconds)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function DistanceTimer({
  run,
  onFinish,
}: {
  run: NonNullable<ReturnType<typeof getDayWorkout>['run']>;
  onFinish: (elapsed: number) => void;
}) {
  const sw = useStopwatch();
  const targetPace =
    run.targetTimeMin && run.distanceKm ? (run.targetTimeMin * 60) / run.distanceKm : null;

  useEffect(() => {
    if (!sw.running) return;
    let release: (() => void) | undefined;
    void keepAwake().then((r) => (release = r));
    return () => release?.();
  }, [sw.running]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-run p-6 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
          Meta: {run.distanceKm?.toLocaleString('pt-BR')} km
        </p>
        <p className="mt-4 text-7xl font-bold tabular-nums sm:text-8xl">
          {formatDuration(sw.elapsed)}
        </p>
        {targetPace && (
          <p className="mt-4 rounded-full bg-white/20 px-4 py-1 text-lg font-semibold">
            Ritmo-alvo {formatPace(targetPace)}/km · {formatKmh(3600 / targetPace)} km/h
          </p>
        )}
        {run.targetTimeMin && (
          <p className="mt-2 text-sm opacity-90">
            Meta de tempo: {run.targetTimeMin} min · 1º km a 6:05, depois 6:00
          </p>
        )}
      </section>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        {sw.running ? (
          <button className="btn-secondary min-h-16 text-lg" onClick={sw.pause}>
            <Icon name="pause" className="size-6" /> Pausar
          </button>
        ) : (
          <button
            className="btn-primary min-h-16 text-lg"
            onClick={() => {
              unlockAudio();
              sw.start();
            }}
          >
            <Icon name="play" className="size-6" /> {sw.elapsed > 0 ? 'Continuar' : 'Iniciar'}
          </button>
        )}
        <button
          className="btn-secondary min-h-16 px-4"
          onClick={() => {
            sw.pause();
            onFinish(Math.round(sw.elapsed));
          }}
          aria-label="Encerrar e registrar"
        >
          <Icon name="flag" className="size-6" />
        </button>
      </div>
      <button className="btn-ghost mt-2 text-sm" onClick={() => onFinish(0)}>
        Registrar sem cronômetro (fiz na rua com relógio)
      </button>
    </div>
  );
}

function Limitations() {
  const ios = isIOS();
  return (
    <details className="mt-4 text-xs text-slate-500">
      <summary className="cursor-pointer">Tela bloqueada e avisos por voz</summary>
      <p className="mt-1">
        O app mantém a tela acesa durante a corrida (Wake Lock). Com a tela bloqueada, os
        navegadores pausam timers e a voz pode falhar. Deixe a tela ligada com o brilho baixo.
        {ios &&
          ' No iPhone, abra pelo ícone na tela inicial e mantenha o Safari em primeiro plano; a voz só funciona com a tela ligada.'}
        {!speechSupported() && ' Este navegador não tem voz; usamos bips e vibração.'}
      </p>
    </details>
  );
}
