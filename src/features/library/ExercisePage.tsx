import { Link, useNavigate, useParams } from 'react-router-dom';
import { ExerciseAnimation } from '@/components/ExerciseAnimation';
import { Icon } from '@/components/Icon';
import { EXERCISE_MAP } from '@/data/exercises';
import { useAllSessions } from '@/db/hooks';
import { mediaSourceFor } from '@/lib/media';

export function ExercisePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const ex = EXERCISE_MAP[id];
  const sessions = useAllSessions();

  if (!ex) {
    return (
      <div className="p-4">
        <p>Exercício não encontrado.</p>
        <Link to="/biblioteca" className="btn-secondary mt-3">
          Voltar
        </Link>
      </div>
    );
  }

  const history = (sessions ?? [])
    .flatMap((s) =>
      s.exercises
        .filter((e) => e.exerciseId === ex.id && e.sets.some((x) => x.done))
        .map((e) => ({ date: s.date, sets: e.sets })),
    )
    .slice(-5)
    .reverse();
  const source = mediaSourceFor(ex);

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center gap-2">
        <button
          type="button"
          className="btn-ghost size-12 px-0"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <Icon name="back" className="size-6" />
        </button>
        <h1 className="text-xl font-bold leading-tight">{ex.name}</h1>
      </header>

      <ExerciseAnimation exercise={ex} />
      <p className="text-center text-xs text-slate-400">
        {source === 'dataset' && 'Fotos: free-exercise-db (domínio público)'}
        {source === 'svg' && 'Animação ilustrativa'}
        {source === 'video' && 'Vídeo próprio'}
      </p>

      <div className="flex flex-wrap gap-2">
        <span className="badge bg-slate-100 capitalize dark:bg-slate-800">{ex.category}</span>
        {ex.equipment.map((e) => (
          <span key={e} className="badge bg-slate-100 dark:bg-slate-800">
            {e.replace('-', ' ')}
          </span>
        ))}
      </div>

      {ex.cautions.length > 0 && (
        <section className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <h2 className="flex items-center gap-1 font-bold">
            <Icon name="warn" className="size-4" /> Cuidados com as suas dores
          </h2>
          <ul className="mt-1 space-y-1">
            {ex.cautions.map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card p-4">
        <h2 className="font-bold">Passo a passo</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-200">
          {ex.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      {ex.commonMistakes.length > 0 && (
        <section className="card p-4">
          <h2 className="font-bold">Erros comuns</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            {ex.commonMistakes.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card p-4">
        <h2 className="font-bold">Músculos</h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{ex.muscles.join(', ')}</p>
      </section>

      {ex.substitutes.length > 0 && (
        <section className="card p-4">
          <h2 className="font-bold">Substituições</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ex.substitutes.map((s) => (
              <li key={s}>
                <Link to={`/biblioteca/${s}`} className="btn-secondary min-h-10 text-sm">
                  <Icon name="swap" className="size-4" /> {EXERCISE_MAP[s]?.name ?? s}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {history.length > 0 && (
        <section className="card p-4">
          <h2 className="font-bold">Últimos registros</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {history.map((h) => (
              <li key={h.date} className="flex justify-between">
                <span className="text-slate-500">
                  {h.date.split('-').reverse().slice(0, 2).join('/')}
                </span>
                <span>
                  {h.sets
                    .filter((s) => s.done)
                    .map((s) => (s.loadKg != null ? `${s.loadKg}kg×${s.reps}` : `${s.reps}`))
                    .join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <a
        href={ex.videoSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary w-full"
      >
        <Icon name="youtube" className="size-5 text-red-600" /> Ver vídeo no YouTube
      </a>
    </div>
  );
}
