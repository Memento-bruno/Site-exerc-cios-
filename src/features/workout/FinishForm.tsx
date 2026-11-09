import { useState } from 'react';
import { PainScale, type PainScores } from '@/components/PainScale';

interface Props {
  initialNotes?: string;
  initialRpe?: number;
  onSubmit: (data: { pain: PainScores; rpe: number; notes: string }) => void;
  onCancel: () => void;
}

export function FinishForm({ initialNotes = '', initialRpe = 6, onSubmit, onCancel }: Props) {
  const [pain, setPain] = useState<PainScores>({});
  const [rpe, setRpe] = useState(initialRpe);
  const [notes, setNotes] = useState(initialNotes);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ pain, rpe, notes });
      }}
    >
      <section className="card p-4">
        <h2 className="font-bold">Como ficaram as dores?</h2>
        <p className="mb-3 text-xs text-slate-500">0 = nenhuma, 10 = a pior possível.</p>
        <PainScale value={pain} onChange={setPain} />
      </section>
      <section className="card p-4">
        <label htmlFor="rpe" className="font-bold">
          Esforço percebido: {rpe}/10
        </label>
        <input
          id="rpe"
          type="range"
          min={1}
          max={10}
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="mt-2 h-3 w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>Muito leve</span>
          <span>Máximo</span>
        </div>
      </section>
      <section className="card p-4">
        <label htmlFor="notes" className="font-bold">
          Observações
        </label>
        <textarea
          id="notes"
          className="input mt-2 min-h-24 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Como foi? Algo para lembrar na próxima?"
        />
      </section>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Voltar
        </button>
        <button type="submit" className="btn-primary flex-1">
          Salvar treino
        </button>
      </div>
    </form>
  );
}
