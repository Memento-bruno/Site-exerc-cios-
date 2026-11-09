import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/components/Icon';

export function TopBar() {
  const { pathname } = useLocation();
  const onSettings = pathname.startsWith('/config');
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between bg-slate-50/90 px-4 py-2 backdrop-blur dark:bg-slate-950/90"
      style={{ paddingTop: 'calc(0.5rem + var(--safe-top))' }}
    >
      <Link to="/" className="flex items-center gap-2 font-bold" aria-label="Início">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-500 text-white">
          <Icon name="run" className="size-5" />
        </span>
        <span>Rumo aos 5 km</span>
      </Link>
      <Link
        to={onSettings ? '/' : '/config'}
        className="btn-ghost size-12 px-0"
        aria-label={onSettings ? 'Fechar configurações' : 'Configurações'}
      >
        <Icon name={onSettings ? 'close' : 'settings'} className="size-6" />
      </Link>
    </header>
  );
}
