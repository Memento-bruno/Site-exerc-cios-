export type ThemePreference = 'system' | 'light' | 'dark';

const KEY = 'rumo5k.theme';

export function getThemePreference(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* sem localStorage */
  }
  return 'system';
}

export function applyTheme(pref: ThemePreference): void {
  try {
    if (pref === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
  } catch {
    /* ignora */
  }
  const dark =
    pref === 'dark' ||
    (pref === 'system' &&
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

/** Mantém o tema em sincronia com o sistema quando a preferência é "system". */
export function watchSystemTheme(): () => void {
  if (typeof matchMedia === 'undefined') return () => {};
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getThemePreference() === 'system') applyTheme('system');
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
