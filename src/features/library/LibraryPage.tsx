import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExerciseAnimation } from '@/components/ExerciseAnimation';
import { Icon } from '@/components/Icon';
import { EXERCISES } from '@/data/exercises';
import type { Category, Equipment } from '@/data/types';

const CATEGORIES: { id: Category | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'forca', label: 'Força' },
  { id: 'mobilidade', label: 'Mobilidade' },
  { id: 'corrida', label: 'Corrida' },
  { id: 'basquete', label: 'Basquete' },
  { id: 'respiracao', label: 'Respiração' },
];
const EQUIPMENT: { id: Equipment | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Qualquer lugar' },
  { id: 'academia', label: 'Academia' },
  { id: 'casa', label: 'Casa' },
  { id: 'bike', label: 'Bike' },
  { id: 'esteira', label: 'Esteira' },
  { id: 'bola', label: 'Bola' },
  { id: 'sem-equipamento', label: 'Sem equipamento' },
];

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const cat = (params.get('filtro') as Category | 'todos' | null) ?? 'todos';
  const eq = (params.get('equip') as Equipment | 'todos' | null) ?? 'todos';

  const list = useMemo(() => {
    const nq = normalize(q.trim());
    return EXERCISES.filter(
      (e) =>
        (cat === 'todos' || e.category === cat) &&
        (eq === 'todos' || e.equipment.includes(eq)) &&
        (!nq || normalize(e.name).includes(nq) || e.muscles.some((m) => normalize(m).includes(nq))),
    );
  }, [q, cat, eq]);

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(params);
    if (v === 'todos' || !v) p.delete(k);
    else p.set(k, v);
    setParams(p, { replace: true });
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Biblioteca</h1>
      <label className="relative block">
        <span className="sr-only">Buscar exercício</span>
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
        />
        <input
          className="input pl-10"
          placeholder="Buscar por nome ou músculo"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Categoria">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setParam('filtro', c.id)}
            className={`btn min-h-10 shrink-0 px-3 text-sm ${cat === c.id ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Equipamento">
        {EQUIPMENT.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={eq === c.id}
            onClick={() => setParam('equip', c.id)}
            className={`btn min-h-9 shrink-0 px-3 text-xs ${eq === c.id ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">{list.length} exercícios</p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {list.map((e) => (
          <li key={e.id}>
            <Link to={`/biblioteca/${e.id}`} className="card flex gap-3 p-3 hover:ring-brand-300">
              <div className="w-24 shrink-0">
                <ExerciseAnimation exercise={e} compact />
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{e.name}</p>
                <p className="mt-1 text-xs text-slate-500">{e.muscles.slice(0, 3).join(', ')}</p>
                <p className="mt-1 text-xs capitalize text-slate-400">
                  {CATEGORIES.find((c) => c.id === e.category)?.label}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && (
        <p className="card p-6 text-center text-slate-500">
          Nada encontrado. Tente outro nome ou limpe os filtros.
        </p>
      )}
    </div>
  );
}
