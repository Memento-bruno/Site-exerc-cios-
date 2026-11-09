import { render, screen } from '@testing-library/react';
import { EXERCISES } from '@/data/exercises';
import { mediaSourceFor } from '@/lib/media';
import { ExerciseAnimation } from './ExerciseAnimation';

describe('ExerciseAnimation', () => {
  it('todo exercício do catálogo tem uma fonte de mídia', () => {
    for (const e of EXERCISES) expect(mediaSourceFor(e), e.id).not.toBe('none');
  });

  it('renderiza o crossfade para exercícios do dataset', () => {
    const e = EXERCISES.find((x) => x.id === 'dead-bug')!;
    render(<ExerciseAnimation exercise={e} />);
    expect(screen.getByRole('img', { name: /dead bug/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument();
  });

  it('renderiza o boneco SVG para exercícios sem foto', () => {
    const e = EXERCISES.find((x) => x.id === 'wall-slide')!;
    const { container } = render(<ExerciseAnimation exercise={e} />);
    expect(container.querySelector('svg line')).not.toBeNull();
  });
});
