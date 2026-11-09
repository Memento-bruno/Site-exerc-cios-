import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';

export function SafetyPage() {
  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center gap-2">
        <Icon name="shield" className="size-7 text-brand-500" />
        <h1 className="text-2xl font-bold">Segurança</h1>
      </header>

      <section className="card p-4">
        <h2 className="font-bold">Regra da dor</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
          Dor <strong>até 3/10</strong> durante o exercício é aceitável,{' '}
          <strong>desde que passe em 24 horas</strong>. Se piorar no dia seguinte,{' '}
          <strong>reduza a carga ou a amplitude</strong>. Se continuar piorando, repita a semana:
          repetir é parte do plano.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
            <strong>0–3</strong>
            <br />
            siga
          </div>
          <div className="rounded-lg bg-amber-100 p-2 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
            <strong>4–6</strong>
            <br />
            reduza carga ou amplitude
          </div>
          <div className="rounded-lg bg-rose-100 p-2 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100">
            <strong>7–10</strong>
            <br />
            pare e use o dia de dor
          </div>
        </div>
      </section>

      <section className="card border-l-4 border-l-rose-500 p-4">
        <h2 className="font-bold text-rose-700 dark:text-rose-300">
          Sinais de alerta: procure um médico
        </h2>
        <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <li>
            • Dor abaixo da costela esquerda <strong>forte ou constante</strong>, que vai para as
            costas, ou com náusea/vômito.
          </li>
          <li>
            • <strong>Formigamento</strong>, dor que desce abaixo do joelho ou{' '}
            <strong>fraqueza</strong> na perna.
          </li>
          <li>
            • <strong>Dor no peito</strong>, falta de ar desproporcional ao esforço, tontura.
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">Em emergência, ligue 192 (SAMU).</p>
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Exames sugeridos</h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
          Antes de começar e na semana 12, converse com seu médico sobre:
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {['TSH e T4 livre', 'Ferritina', 'Vitamina B12', 'Vitamina D'].map((e) => (
            <li key={e} className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
              {e}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          Hashimoto e Mounjaro pedem acompanhamento: leve o registro de peso e dores do app para a
          consulta.
        </p>
      </section>

      <section className="card p-4">
        <h2 className="font-bold">Dia de dor</h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
          Mobilidade completa + 15 min de bike leve + 5 min de respiração diafragmática. Nada de
          corrida ou carga. Use o botão "Hoje estou com dor" na tela Hoje.
        </p>
      </section>

      <p className="text-xs text-slate-500">
        Este app não substitui médico, fisioterapeuta ou educador físico.{' '}
        <Link to="/sobre" className="underline">
          Sobre o app
        </Link>
        .
      </p>
    </div>
  );
}
