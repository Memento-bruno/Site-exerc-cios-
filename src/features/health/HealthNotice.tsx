import { Icon } from '@/components/Icon';

export function HealthNotice() {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2">
        <Icon name="shield" className="size-6 text-brand-500" />
        <h2 className="text-lg font-semibold">Aviso de saúde</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        Este app organiza um plano de treino, mas{' '}
        <strong>não substitui médico, fisioterapeuta ou educador físico</strong>. Você tem
        tireoidite de Hashimoto, usa medicação prescrita e convive com dores: converse com seu
        médico antes de começar e sempre que algo mudar.
      </p>
      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
        <li>• Dor até 3/10 durante o exercício é aceitável, desde que passe em 24 h.</li>
        <li>
          • Se piorar no dia seguinte, reduza a carga ou a amplitude. Repetir uma semana é parte do
          plano.
        </li>
        <li>
          • Dor forte abaixo da costela, formigamento que desce pela perna, dor no peito, falta de
          ar ou tontura: pare e procure um médico.
        </li>
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        A página "Segurança" fica sempre acessível em Configurações.
      </p>
    </section>
  );
}
