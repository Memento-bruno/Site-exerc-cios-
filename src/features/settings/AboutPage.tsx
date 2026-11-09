import { HealthNotice } from '@/features/health/HealthNotice';

export function AboutPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Sobre</h1>
      <section className="card p-4 text-sm text-slate-700 dark:text-slate-200">
        <p>
          <strong>Rumo aos 5 km</strong> é um app pessoal de treino de 24 semanas: correr 5 km em
          menos de 30 minutos, ganhar força, melhorar a postura e reduzir dores.
        </p>
        <p className="mt-2">
          Funciona offline e guarda tudo só neste aparelho. Nada é enviado para servidores. Faça
          backups em Configurações.
        </p>
        <p className="mt-2 text-xs text-slate-500">Versão {__APP_VERSION__}</p>
      </section>
      <section className="card p-4 text-sm text-slate-700 dark:text-slate-200">
        <h2 className="font-bold">Créditos</h2>
        <ul className="mt-2 space-y-1">
          <li>
            • Imagens:{' '}
            <a
              className="underline"
              href="https://github.com/yuhonas/free-exercise-db"
              target="_blank"
              rel="noopener noreferrer"
            >
              free-exercise-db
            </a>{' '}
            (domínio público).
          </li>
          <li>• Animações em SVG e ícones: feitos para este app.</li>
          <li>• Construído com React, Vite, Tailwind, Dexie e Recharts.</li>
        </ul>
      </section>
      <HealthNotice />
    </div>
  );
}
