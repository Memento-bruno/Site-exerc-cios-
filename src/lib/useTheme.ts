import { useEffect, useState } from 'react';

/** Tema efetivo (classe .dark no <html>). */
export function useTheme(): 'light' | 'dark' {
  const [t, setT] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setT(document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return t;
}

/** Paleta categórica validada (claro/escuro) para as 7 regiões de dor. */
export const SERIES_LIGHT = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#008300',
  '#6250d6',
];
export const SERIES_DARK = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
];

export function useSeriesColors() {
  return useTheme() === 'dark' ? SERIES_DARK : SERIES_LIGHT;
}
