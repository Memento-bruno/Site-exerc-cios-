import type { IconName } from '@/components/Icon';
import type { WorkoutType } from '@/data/types';

export const WORKOUT_TYPE_META: Record<
  WorkoutType,
  { icon: IconName; label: string; color: string }
> = {
  forca: { icon: 'dumbbell', label: 'Força', color: 'bg-violet-500' },
  bike: { icon: 'bike', label: 'Bike', color: 'bg-sky-500' },
  corrida: { icon: 'run', label: 'Corrida', color: 'bg-brand-500' },
  caminhada: { icon: 'run', label: 'Caminhada', color: 'bg-emerald-500' },
  basquete: { icon: 'ball', label: 'Basquete', color: 'bg-amber-500' },
  mini: { icon: 'dumbbell', label: 'Treino mini', color: 'bg-slate-500' },
  descanso: { icon: 'moon', label: 'Descanso', color: 'bg-slate-400' },
  dor: { icon: 'heart', label: 'Dia de dor', color: 'bg-rose-500' },
};
