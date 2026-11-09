import { useState } from 'react';
import { db } from '@/db/schema';
import { getSettings, updateSettings } from '@/db/settings';
import { useWeekReviews } from '@/db/hooks';
import { toISODate } from '@/lib/dates';

/**
 * Regra de avanço: no fim da semana, perguntar "As dores pioraram?".
 * Se sim, sugerir repetir a semana (empurra a data efetiva 7 dias).
 */
export function WeekReviewCard({ week, weekday }: { week: number; weekday: number }) {
  const reviews = useWeekReviews();
  const [asked, setAsked] = useState<'no' | 'yes' | null>(null);
  const [done, setDone] = useState(false);

  // Pergunta no domingo da semana atual, ou na segunda sobre a semana anterior.
  const target = weekday === 0 ? week : weekday === 1 ? week - 1 : 0;
  if (!reviews || target < 1 || done) return null;
  if (reviews.some((r) => r.week === target)) return null;

  async function answer(painWorse: boolean, repeat: boolean) {
    await db.weekReviews.put({
      week: target,
      painWorse,
      repeated: repeat,
      createdAt: new Date().toISOString(),
    });
    if (repeat) {
      const s = await getSettings();
      await updateSettings({
        weekRepeats: [...s.weekRepeats, { week: target, decidedAt: toISODate(new Date()) }],
      });
    }
    setDone(true);
  }

  return (
    <section className="card border-l-4 border-l-brand-500 p-4" aria-labelledby="review-title">
      <h2 id="review-title" className="font-semibold">
        Fim da semana {target}: as dores pioraram?
      </h2>
      {asked === null && (
        <div className="mt-3 flex gap-2">
          <button className="btn-secondary flex-1" onClick={() => void answer(false, false)}>
            Não, iguais ou melhores
          </button>
          <button className="btn-primary flex-1" onClick={() => setAsked('yes')}>
            Sim, pioraram
          </button>
        </div>
      )}
      {asked === 'yes' && (
        <div className="mt-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Sugestão: <strong>repetir a semana {target}</strong>. Repetir é parte do plano, não um
            atraso. O corpo consolida o que aprendeu e a próxima semana fica mais segura.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => void answer(true, true)}>
              Repetir a semana
            </button>
            <button className="btn-secondary flex-1" onClick={() => void answer(true, false)}>
              Seguir mesmo assim
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
