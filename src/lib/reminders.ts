import type { Settings } from '@/db/schema';
import { notify } from './device';

const KEY = 'rumo5k.reminders.fired';

function firedToday(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

/**
 * Lembretes locais: sem backend, só disparam enquanto o app está aberto (ou em segundo plano
 * em alguns navegadores). Verifica a cada minuto se passou da hora configurada e dispara uma vez por dia.
 */
export function startReminderLoop(getSettings: () => Settings | undefined): () => void {
  const check = () => {
    const s = getSettings();
    if (!s) return;
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().slice(0, 10);
    const fired = firedToday();
    const fire = (id: string, title: string, body: string) => {
      if (fired[id] === today) return;
      fired[id] = today;
      localStorage.setItem(KEY, JSON.stringify(fired));
      notify(title, body);
    };
    const r = s.reminders;
    if (r.mobility.enabled && hhmm >= r.mobility.time)
      fire(
        'mobility',
        'Mobilidade de 10 min',
        'Gato-vaca, open book, wall slide, chin tuck… seu corpo agradece.',
      );
    if (r.sleep.enabled && hhmm >= r.sleep.time)
      fire('sleep', 'Hora de desacelerar', 'Deitar até 22h30 para acordar 5h50 inteiro.');
    if (r.weighIn.enabled && now.getDay() === r.weighIn.weekday && hhmm >= r.weighIn.time)
      fire('weigh', 'Pesagem semanal', 'Em jejum, antes do café. Registre em Progresso.');
  };
  check();
  const id = setInterval(check, 60_000);
  return () => clearInterval(id);
}
