import type { WorkoutType } from '@/data/types';
import { Icon } from './Icon';
import { WORKOUT_TYPE_META } from '@/lib/workout-meta';

export function WorkoutTypeIcon({
  type,
  className = 'size-10',
}: {
  type: WorkoutType;
  className?: string;
}) {
  const m = WORKOUT_TYPE_META[type];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl text-white ${m.color} ${className}`}
      aria-hidden="true"
    >
      <Icon name={m.icon} className="size-[55%]" />
    </span>
  );
}
