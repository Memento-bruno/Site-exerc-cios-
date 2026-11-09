import { useMemo, useState } from 'react';
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Icon } from '@/components/Icon';
import { EXERCISES } from '@/data/exercises';
import { CHECKPOINTS, PHASES } from '@/data/plan';
import { PAIN_REGIONS, type PainRegion } from '@/data/types';
import {
  useAllSessions,
  usePainLogs,
  useRuns,
  useSettingsOrDefault,
  useWeights,
  todayIso,
} from '@/db/hooks';
import { db } from '@/db/schema';
import {
  addDays,
  fromISODate,
  planPosition,
  toISODate,
  effectiveStartDate,
  weekStartDate,
} from '@/lib/dates';
import { useTheme } from '@/lib/useTheme';
import {
  bmi,
  formatDuration,
  formatKg,
  formatPace,
  parseDuration,
  weightForBmi,
} from '@/lib/units';
import { ChartCard, SingleLine } from './charts';
import { useSeriesColors } from '@/lib/useTheme';
import { PhotosSection } from './PhotosSection';

const short = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7);

export function ProgressPage() {
  const settings = useSettingsOrDefault();
  const weights = useWeights();
  const runs = useRuns();
  const sessions = useAllSessions();
  const pains = usePainLogs();
  const start = effectiveStartDate(fromISODate(settings.startDate), settings.weekRepeats);
  const pos = planPosition(fromISODate(settings.startDate), new Date(), settings.weekRepeats);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Progresso</h1>
      <WeightSection />
      <FiveKSection />
      <LoadsSection />
      <PainSection />
      <ConsistencySection />
      <CheckpointsSection
        currentWeek={pos.status === 'em-andamento' ? pos.week : pos.status === 'concluido' ? 25 : 0}
      />
      <PhotosSection />
      <p className="text-center text-xs text-slate-400">
        {weights?.length ?? 0} pesagens · {runs?.length ?? 0} corridas ·{' '}
        {sessions?.filter((s) => s.finishedAt).length ?? 0} treinos · {pains?.length ?? 0} registros
        de dor · início {toISODate(weekStartDate(start, 1))}
      </p>
    </div>
  );
}

/* ───────────── Peso ───────────── */
function WeightSection() {
  const settings = useSettingsOrDefault();
  const weights = useWeights();
  const [w, setW] = useState('');
  const [waist, setWaist] = useState('');
  const [open, setOpen] = useState(false);
  const data = (weights ?? []).map((x) => ({ x: short(x.date), y: x.weightKg }));
  const last = weights?.at(-1);
  const bmiNow = last
    ? bmi(last.weightKg, settings.heightCm)
    : bmi(settings.startWeightKg, settings.heightCm);
  const ideal = weightForBmi(25, settings.heightCm);
  const waistData = (weights ?? [])
    .filter((x) => x.waistCm)
    .map((x) => ({ x: short(x.date), y: x.waistCm! }));

  async function save() {
    const kg = Number(w.replace(',', '.'));
    if (!kg) return;
    const date = todayIso();
    const existing = await db.weights.where('date').equals(date).first();
    const waistCm = Number(waist.replace(',', '.')) || undefined;
    if (existing)
      await db.weights.update(existing.id!, { weightKg: kg, waistCm: waistCm ?? existing.waistCm });
    else await db.weights.add({ date, weightKg: kg, waistCm, createdAt: new Date().toISOString() });
    setW('');
    setWaist('');
    setOpen(false);
  }

  const refs = [
    {
      y: settings.targetWeightKg,
      label: `Meta ${formatKg(settings.targetWeightKg)} kg`,
      color: '#16a34a',
    },
    ...PHASES.map((p) => ({ y: p.targetWeightKg[1], label: `F${p.id}`, color: p.color })),
  ];

  return (
    <ChartCard
      title="Peso"
      subtitle={`Pese 1× por semana, mesmo dia, de manhã em jejum. IMC ${bmiNow.toFixed(1)} · ideal < ${formatKg(ideal)} kg`}
      action={
        <button className="btn-secondary min-h-10 px-3 text-sm" onClick={() => setOpen((o) => !o)}>
          <Icon name="plus" className="size-4" /> Registrar
        </button>
      }
    >
      {open && (
        <form
          className="mb-3 grid grid-cols-[1fr_1fr_auto] gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="sr-only" htmlFor="peso">
            Peso em kg
          </label>
          <input
            id="peso"
            className="input"
            inputMode="decimal"
            placeholder="Peso (kg)"
            value={w}
            onChange={(e) => setW(e.target.value)}
            autoFocus
          />
          <label className="sr-only" htmlFor="cintura">
            Cintura em cm
          </label>
          <input
            id="cintura"
            className="input"
            inputMode="decimal"
            placeholder="Cintura (cm), opcional"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
          />
          <button className="btn-primary" type="submit">
            Salvar
          </button>
        </form>
      )}
      {data.length ? (
        <>
          <p className="mb-1 text-sm">
            Último: <strong>{formatKg(last!.weightKg)} kg</strong>
            {weights!.length > 1 && (
              <span className="text-slate-500">
                {' '}
                · {formatKg(last!.weightKg - weights![0].weightKg)} kg desde o início
              </span>
            )}
          </p>
          <SingleLine
            data={data}
            unit=" kg"
            refs={refs}
            domain={[Math.min(settings.targetWeightKg - 2, 74), 'auto']}
            formatY={(v) => formatKg(v)}
          />
          {waistData.length > 0 && (
            <>
              <p className="mt-3 text-sm font-semibold">Cintura (cm)</p>
              <SingleLine data={waistData} color="#8b5cf6" unit=" cm" height={160} />
            </>
          )}
        </>
      ) : (
        <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800/60">
          Nenhuma pesagem ainda. Registre o peso de referência ({formatKg(settings.startWeightKg)}{' '}
          kg) para começar o gráfico.
        </p>
      )}
    </ChartCard>
  );
}

/* ───────────── 5 km ───────────── */
function FiveKSection() {
  const runs = useRuns();
  const [open, setOpen] = useState(false);
  const [dist, setDist] = useState('5');
  const [time, setTime] = useState('');
  const tests = (runs ?? []).filter(
    (r) => r.distanceKm && r.durationSec && (r.isTest || r.distanceKm >= 4.9),
  );
  const data = tests.map((r) => ({
    x: short(r.date),
    y: Math.round(((r.durationSec! / r.distanceKm!) * 5) / 6) / 10,
  })); // min para 5 km, normalizado
  const best = tests.length ? Math.min(...data.map((d) => d.y)) : null;

  async function save() {
    const sec = parseDuration(time);
    const km = Number(dist.replace(',', '.'));
    if (!sec || !km) return;
    await db.runs.add({
      date: todayIso(),
      week: 0,
      workoutId: 'teste-manual',
      title: `Teste ${km} km`,
      mode: 'teste',
      isTest: true,
      distanceKm: km,
      durationSec: sec,
      paceSecPerKm: sec / km,
      createdAt: new Date().toISOString(),
    });
    setOpen(false);
    setTime('');
  }

  return (
    <ChartCard
      title="5 km"
      subtitle="Tempo projetado para 5 km nos testes (semanas 12, 16, 24 e outros). Meta: abaixo de 30 min."
      action={
        <button className="btn-secondary min-h-10 px-3 text-sm" onClick={() => setOpen((o) => !o)}>
          <Icon name="plus" className="size-4" /> Teste
        </button>
      }
      empty={
        !open &&
        !data.length &&
        'Nenhum teste ainda. O primeiro é na semana 12 (3 km) e depois na 16 (5 km).'
      }
    >
      {open && (
        <form
          className="mb-3 grid grid-cols-[1fr_1fr_auto] gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <input
            className="input"
            inputMode="decimal"
            aria-label="Distância em km"
            placeholder="km"
            value={dist}
            onChange={(e) => setDist(e.target.value)}
          />
          <input
            className="input"
            inputMode="numeric"
            aria-label="Tempo mm:ss"
            placeholder="mm:ss"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            autoFocus
          />
          <button className="btn-primary" type="submit">
            Salvar
          </button>
        </form>
      )}
      {data.length > 0 && (
        <>
          <p className="mb-1 text-sm">
            Melhor: <strong>{formatDuration(best! * 60)}</strong> para 5 km
            {best! <= 30 ? ' · meta batida!' : ` · faltam ${formatDuration((best! - 30) * 60)}`}
          </p>
          <SingleLine
            data={data}
            unit=" min"
            refs={[{ y: 30, label: '30 min', color: '#16a34a' }]}
            formatY={(v) => formatDuration(v * 60)}
            domain={['auto', 'auto']}
          />
          <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
            {tests
              .slice(-5)
              .reverse()
              .map((r) => (
                <li key={r.id}>
                  {short(r.date)} · {r.distanceKm} km em {formatDuration(r.durationSec!)} (
                  {formatPace(r.durationSec! / r.distanceKm!)}/km)
                </li>
              ))}
          </ul>
        </>
      )}
    </ChartCard>
  );
}

/* ───────────── Cargas ───────────── */
function LoadsSection() {
  const sessions = useAllSessions();
  const tracked = useMemo(() => EXERCISES.filter((e) => e.tracksLoad), []);
  const byExercise = useMemo(() => {
    const m = new Map<string, { x: string; y: number }[]>();
    for (const s of sessions ?? []) {
      for (const ex of s.exercises) {
        const loads = ex.sets.filter((x) => x.done && x.loadKg != null).map((x) => x.loadKg!);
        if (!loads.length) continue;
        const arr = m.get(ex.exerciseId) ?? [];
        arr.push({ x: short(s.date), y: Math.max(...loads) });
        m.set(ex.exerciseId, arr);
      }
    }
    return m;
  }, [sessions]);
  const withData = tracked.filter((e) => byExercise.has(e.id));
  const [sel, setSel] = useState<string>('');
  const current = sel || withData[0]?.id || '';
  const data = byExercise.get(current) ?? [];

  return (
    <ChartCard
      title="Cargas"
      subtitle="Maior carga usada por treino."
      empty={!withData.length && 'Registre a carga (kg) nas séries para ver a evolução aqui.'}
      action={
        withData.length > 0 && (
          <select
            className="input min-h-10 w-auto max-w-44 px-2 py-0 text-sm"
            value={current}
            onChange={(e) => setSel(e.target.value)}
            aria-label="Exercício"
          >
            {withData.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        )
      }
    >
      <SingleLine
        data={data}
        color="#8b5cf6"
        unit=" kg"
        height={200}
        formatY={(v) => formatKg(v)}
      />
    </ChartCard>
  );
}

/* ───────────── Dores ───────────── */
function PainSection() {
  const pains = usePainLogs();
  const colors = useSeriesColors();
  const dark = useTheme() === 'dark';
  const [table, setTable] = useState(false);
  const [visible, setVisible] = useState<Set<PainRegion>>(
    () => new Set(PAIN_REGIONS.map((r) => r.id)),
  );
  const settings = useSettingsOrDefault();

  const data = useMemo(() => {
    const byWeek = new Map<
      number,
      {
        count: number;
        sums: Partial<Record<PainRegion, number>>;
        n: Partial<Record<PainRegion, number>>;
      }
    >();
    for (const p of pains ?? []) {
      const wk =
        p.week ||
        planPosition(fromISODate(settings.startDate), fromISODate(p.date), settings.weekRepeats)
          .week;
      const e = byWeek.get(wk) ?? { count: 0, sums: {}, n: {} };
      e.count++;
      for (const r of PAIN_REGIONS) {
        const v = p.scores[r.id];
        if (v != null) {
          e.sums[r.id] = (e.sums[r.id] ?? 0) + v;
          e.n[r.id] = (e.n[r.id] ?? 0) + 1;
        }
      }
      byWeek.set(wk, e);
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([wk, e]) => {
        const row: Record<string, number | string> = { x: `S${wk}` };
        for (const r of PAIN_REGIONS)
          if (e.n[r.id]) row[r.id] = Math.round(((e.sums[r.id] ?? 0) / e.n[r.id]!) * 10) / 10;
        return row;
      });
  }, [pains, settings]);

  const ink = dark ? '#c3c2b7' : '#52514e';
  const grid = dark ? '#2b2b2a' : '#e8e8e6';

  return (
    <ChartCard
      title="Dores por semana"
      subtitle="Média (0–10) por região em cada semana do plano."
      empty={!data.length && 'As dores aparecem aqui depois do primeiro treino fechado.'}
      action={
        data.length > 0 && (
          <button
            className="btn-ghost min-h-10 px-3 text-sm"
            onClick={() => setTable((t) => !t)}
            aria-pressed={table}
          >
            {table ? 'Gráfico' : 'Tabela'}
          </button>
        )
      }
    >
      {table ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1 pr-2">Sem.</th>
                {PAIN_REGIONS.map((r) => (
                  <th key={r.id} className="px-1">
                    {r.label.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={String(row.x)} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1 pr-2 font-semibold">{row.x}</td>
                  {PAIN_REGIONS.map((r) => (
                    <td key={r.id} className="px-1 tabular-nums">
                      {row[r.id] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis
                  dataKey="x"
                  tick={{ fill: ink, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: grid }}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 3, 5, 10]}
                  tick={{ fill: ink, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: dark ? '#1a1a19' : '#fff',
                    border: `1px solid ${grid}`,
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: ink }}
                />
                <Legend
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 11, color: ink }}
                  onClick={(e) => {
                    const id = String((e as { dataKey?: unknown }).dataKey) as PainRegion;
                    setVisible((v) => {
                      const n = new Set(v);
                      if (n.has(id)) n.delete(id);
                      else n.add(id);
                      return n;
                    });
                  }}
                />
                {PAIN_REGIONS.map((r, i) => (
                  <Line
                    key={r.id}
                    type="monotone"
                    dataKey={r.id}
                    name={r.label}
                    stroke={colors[i]}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: colors[i] }}
                    hide={!visible.has(r.id)}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Toque na legenda para esconder/mostrar uma região. Linha de referência: até 3/10 é
            aceitável.
          </p>
        </>
      )}
    </ChartCard>
  );
}

/* ───────────── Constância ───────────── */
function ConsistencySection() {
  const sessions = useAllSessions();
  const runs = useRuns();
  const settings = useSettingsOrDefault();
  const start = effectiveStartDate(fromISODate(settings.startDate), settings.weekRepeats);
  const doneDates = useMemo(() => {
    const s = new Set<string>();
    for (const x of sessions ?? []) if (x.finishedAt) s.add(x.date);
    for (const x of runs ?? []) s.add(x.date);
    return s;
  }, [sessions, runs]);
  const today = todayIso();
  const weeksToShow = 24;
  const cells = Array.from({ length: weeksToShow * 7 }, (_, i) => toISODate(addDays(start, i)));
  const total = [...doneDates].filter((d) => d >= cells[0] && d <= today).length;
  const daysSoFar = Math.max(1, cells.filter((d) => d <= today).length);

  return (
    <ChartCard
      title="Constância"
      subtitle={`${total} dias com treino registrado em ${daysSoFar} dias de plano.`}
    >
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div
          className="grid grid-rows-7 gap-1 text-[10px] text-slate-500"
          style={{ gridAutoFlow: 'column' }}
        >
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
            <span key={i} className="flex h-3 items-center">
              {d}
            </span>
          ))}
        </div>
        <div
          className="grid grid-rows-7 gap-1 overflow-x-auto"
          style={{ gridAutoFlow: 'column', gridAutoColumns: '0.75rem' }}
          role="img"
          aria-label="Calendário de treinos feitos"
        >
          {cells.map((d) => {
            const done = doneDates.has(d);
            const future = d > today;
            return (
              <span
                key={d}
                title={`${d}${done ? ' · treino feito' : ''}`}
                className={`size-3 rounded-[3px] ${done ? 'bg-done' : future ? 'bg-slate-100 dark:bg-slate-800/60' : 'bg-slate-200 dark:bg-slate-700'} ${d === today ? 'ring-2 ring-brand-500' : ''}`}
              />
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}

/* ───────────── Checkpoints ───────────── */
function CheckpointsSection({ currentWeek }: { currentWeek: number }) {
  const weights = useWeights();
  const runs = useRuns();
  const settings = useSettingsOrDefault();
  const start = effectiveStartDate(fromISODate(settings.startDate), settings.weekRepeats);

  function status(cp: (typeof CHECKPOINTS)[number]) {
    const endIso = toISODate(addDays(weekStartDate(start, Math.max(cp.week, 1)), 6));
    const w = [...(weights ?? [])].filter((x) => x.date <= endIso).at(-1);
    const weightOk = w ? w.weightKg <= cp.targetWeightKg[1] + 0.001 : null;
    let runOk: boolean | null = null;
    if (cp.week === 12)
      runOk = (runs ?? []).some((r) => r.distanceKm && r.distanceKm >= 3 && r.date <= endIso)
        ? true
        : null;
    if (cp.week === 16)
      runOk = (runs ?? []).some((r) => r.distanceKm && r.distanceKm >= 5 && r.date <= endIso)
        ? true
        : null;
    if (cp.week === 24)
      runOk = (runs ?? []).some(
        (r) => r.distanceKm && r.distanceKm >= 5 && r.durationSec && r.durationSec <= 1800,
      )
        ? true
        : null;
    const reached = cp.week <= currentWeek - 1;
    return { weightOk, runOk, reached, w };
  }

  return (
    <ChartCard title="Checkpoints" subtitle="Atingido, não atingido ou ainda por vir.">
      <ul className="space-y-2">
        {CHECKPOINTS.map((cp) => {
          const s = status(cp);
          const okAll =
            s.weightOk !== false && (s.runOk !== null || cp.week < 12) && s.weightOk !== null;
          const cls = !s.reached
            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800'
            : okAll
              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100'
              : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100';
          return (
            <li key={cp.week} className={`rounded-xl p-3 text-sm ${cls}`}>
              <div className="flex items-center justify-between">
                <strong>Semana {cp.week}</strong>
                <span className="text-xs">
                  {!s.reached ? 'por vir' : okAll ? 'atingido' : 'parcial'}
                </span>
              </div>
              <p className="text-xs">
                {cp.run !== '—'
                  ? `${cp.run} ${s.runOk ? '✓' : s.reached ? '· sem registro' : ''} · `
                  : ''}
                {cp.targetWeightKg[0] === cp.targetWeightKg[1]
                  ? formatKg(cp.targetWeightKg[0])
                  : `${cp.targetWeightKg[0]}–${cp.targetWeightKg[1]}`}{' '}
                kg
                {s.w ? ` (${formatKg(s.w.weightKg)} kg ${s.weightOk ? '✓' : ''})` : ''} · {cp.other}
              </p>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
