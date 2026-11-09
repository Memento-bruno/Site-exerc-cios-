import { Icon } from '@/components/Icon';
import { useHabits, useHabitsOn, useSettingsOrDefault, todayIso } from '@/db/hooks';
import { db, type HabitLog } from '@/db/schema';
import { formatKg } from '@/lib/units';

const ITEMS: { key: keyof Omit<HabitLog, 'id' | 'date'>; label: string; hint: string }[] = [
  { key: 'water', label: 'Água ao longo do dia', hint: 'Garrafa na mesa; um copo a cada hora.' },
  {
    key: 'protein',
    label: 'Proteína em todas as refeições',
    hint: 'Meta ≈ 1,6 g por kg de peso por dia.',
  },
  { key: 'mobility', label: 'Mobilidade (10 min)', hint: 'Antes do treino ou à noite.' },
  { key: 'sleep', label: 'Deitar até 22h30', hint: 'Para acordar 5h50 com 7 h de sono.' },
];

export function HabitsPage() {
  const date = todayIso();
  const today = useHabitsOn(date);
  const all = useHabits();
  const settings = useSettingsOrDefault();
  const proteinG = Math.round(settings.startWeightKg * 1.6);
  const last7 = (all ?? []).slice(-7);
  const streak = last7.filter((h) => h.water && h.protein && h.mobility && h.sleep).length;

  async function toggle(key: keyof Omit<HabitLog, 'id' | 'date'>) {
    if (today) await db.habits.update(today.id!, { [key]: !today[key] });
    else
      await db.habits.add({
        date,
        water: false,
        protein: false,
        mobility: false,
        sleep: false,
        [key]: true,
      });
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Hábitos</h1>

      <section className="card p-4" aria-labelledby="check-hoje">
        <h2 id="check-hoje" className="font-bold">
          Checklist de hoje
        </h2>
        <ul className="mt-2 space-y-2">
          {ITEMS.map((it) => {
            const on = !!today?.[it.key];
            return (
              <li key={it.key}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => void toggle(it.key)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl border-2 ${on ? 'border-done bg-done text-white' : 'border-slate-300 dark:border-slate-600'}`}
                  >
                    {on && <Icon name="check" className="size-6" />}
                  </span>
                  <span>
                    <span className="block font-medium">{it.label}</span>
                    <span className="block text-xs text-slate-500">{it.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-slate-500">Últimos 7 dias completos: {streak}/7.</p>
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Comer melhor sem sofrer</h2>
        <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <li>
            • <strong>Proteína ≈ {proteinG} g/dia</strong> ({formatKg(settings.startWeightKg)} kg ×
            1,6). Divida em 4 refeições de ~{Math.round(proteinG / 4)} g: ovos, frango, carne,
            peixe, iogurte, queijo, feijão + arroz.
          </li>
          <li>
            • <strong>Lanche planejado às 16h</strong> (iogurte + fruta, ou pão com queijo): evita
            chegar em casa faminto.
          </li>
          <li>
            • À noite, pergunte: <strong>fome ou cansaço?</strong> Se for cansaço, um chá e deitar
            mais cedo resolvem melhor que comida.
          </li>
          <li>
            • <strong>Coma devagar</strong>: com Mounjaro, a saciedade chega antes; pare quando
            estiver satisfeito, não cheio.
          </li>
          <li>
            • <strong>Água</strong>: 2 a 2,5 litros por dia; mais em dia de corrida.
          </li>
          <li>
            • <strong>Sono</strong>: deitar ~22h30 para acordar 5h50. Sem tela na cama; o treino de
            segunda depende disso.
          </li>
        </ul>
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Nos dias de escritório</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
          <li>• No fretado: apoio lombar e chin tuck a cada 15–20 min.</li>
          <li>• Levante a cada hora; 2 min de mobilidade no home office.</li>
          <li>• Bike leve à noite é o treino do dia; sem culpa se for só 15 min.</li>
        </ul>
      </section>
    </div>
  );
}
