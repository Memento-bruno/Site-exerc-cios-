import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import type { Weekday } from '@/data/types';
import { useSettings } from '@/db/hooks';
import type { Settings } from '@/db/schema';
import { updateSettings } from '@/db/settings';
import { WEEKDAY_SHORT, fromISODate, mondayOf, nextMonday, toISODate } from '@/lib/dates';
import { HealthNotice } from '@/features/health/HealthNotice';

const ALL_DAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export function OnboardingPage() {
  const settings = useSettings();
  if (!settings) return <div className="p-4 text-slate-500">Carregando…</div>;
  return <OnboardingForm initial={settings} />;
}

function OnboardingForm({ initial }: { initial: Settings }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState(initial.startDate || toISODate(nextMonday()));
  const [weight, setWeight] = useState(String(initial.startWeightKg).replace('.', ','));
  const [height, setHeight] = useState(String(initial.heightCm));
  const [target, setTarget] = useState(String(initial.targetWeightKg).replace('.', ','));
  const [office, setOffice] = useState<Weekday[]>(initial.officeDays);
  const [saving, setSaving] = useState(false);

  const num = (s: string) => Number(s.replace(',', '.'));
  const valid =
    !Number.isNaN(num(weight)) &&
    !Number.isNaN(num(height)) &&
    !Number.isNaN(num(target)) &&
    !!startDate;

  async function finish() {
    setSaving(true);
    const monday = toISODate(mondayOf(fromISODate(startDate)));
    await updateSettings({
      startDate: monday,
      startWeightKg: num(weight),
      heightCm: num(height),
      targetWeightKg: num(target),
      officeDays: office,
      onboardingDone: true,
      healthNoticeAccepted: true,
    });
    navigate('/', { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-500 text-white">
          <Icon name="run" className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Rumo aos 5 km</h1>
          <p className="text-sm text-slate-500">24 semanas, um passo por dia.</p>
        </div>
      </div>

      <ol className="mb-6 flex gap-2" aria-label="Etapas">
        {['Plano', 'Você', 'Rotina', 'Saúde'].map((s, i) => (
          <li
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`}
            aria-current={i === step ? 'step' : undefined}
          />
        ))}
      </ol>

      {step === 0 && (
        <section className="card p-5">
          <h2 className="text-lg font-semibold">Quando você começa?</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            O plano sempre começa numa segunda-feira. Se escolher outro dia, usamos a segunda
            daquela semana.
          </p>
          <label className="label mt-4" htmlFor="start">
            Data de início
          </label>
          <input
            id="start"
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <p className="mt-2 text-xs text-slate-500">Padrão: próxima segunda-feira.</p>
        </section>
      )}

      {step === 1 && (
        <section className="card p-5">
          <h2 className="text-lg font-semibold">Sobre você</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="weight">
                Peso atual (kg)
              </label>
              <input
                id="weight"
                inputMode="decimal"
                className="input"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="height">
                Altura (cm)
              </label>
              <input
                id="height"
                inputMode="numeric"
                className="input"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="label" htmlFor="target">
                Peso-alvo (kg)
              </label>
              <input
                id="target"
                inputMode="decimal"
                className="input"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                Meta do plano: 77 kg em 24 semanas. Peso ideal pelo IMC: abaixo de 75,5 kg.
              </p>
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card p-5">
          <h2 className="text-lg font-semibold">Sua rotina</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Marque os dias de escritório. Neles o app sugere treino leve (bike ou mobilidade).
          </p>
          <div className="mt-4 grid grid-cols-7 gap-1" role="group" aria-label="Dias de escritório">
            {ALL_DAYS.map((d) => {
              const on = office.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setOffice(on ? office.filter((x) => x !== d) : [...office, d])}
                  className={`min-h-12 rounded-xl text-sm font-semibold ${
                    on
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {WEEKDAY_SHORT[d]}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Escritório:{' '}
            {office.length
              ? ALL_DAYS.filter((d) => office.includes(d))
                  .map((d) => WEEKDAY_SHORT[d])
                  .join(', ')
              : 'nenhum'}
            . Os outros dias são de casa.
          </p>
        </section>
      )}

      {step === 3 && <HealthNotice />}

      <div className="mt-auto flex gap-2 pt-6">
        {step > 0 && (
          <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
            Voltar
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={!valid}
            onClick={() => setStep(step + 1)}
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={saving}
            onClick={() => void finish()}
          >
            Entendi, vamos começar
          </button>
        )}
      </div>
    </div>
  );
}
