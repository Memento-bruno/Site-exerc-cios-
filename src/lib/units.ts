/** Conversões entre velocidade (km/h) e ritmo (min/km). */

export function kmhToPaceSeconds(kmh: number): number {
  if (kmh <= 0) return Infinity;
  return 3600 / kmh;
}

export function paceSecondsToKmh(secPerKm: number): number {
  if (secPerKm <= 0) return 0;
  return 3600 / secPerKm;
}

/** "5:45" a partir de segundos por km. */
export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm)) return '—';
  const total = Math.round(secPerKm);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function kmhToPace(kmh: number): string {
  return formatPace(kmhToPaceSeconds(kmh));
}

/** "5:45" → segundos por km. Aceita "5:45", "5.45" não (ambíguo) e "5'45". */
export function parsePace(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2})[:'](\d{1,2})$/);
  if (!m) return null;
  const min = Number(m[1]);
  const sec = Number(m[2]);
  if (sec >= 60) return null;
  return min * 60 + sec;
}

/** Segundos necessários para percorrer `meters` a `kmh`. */
export function secondsForDistance(meters: number, kmh: number): number {
  if (kmh <= 0) return 0;
  return Math.round((meters / 1000 / kmh) * 3600);
}

/** "mm:ss" ou "h:mm:ss". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function formatKm(km: number, digits = 1): string {
  return km.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export function formatKg(kg: number): string {
  return kg.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

export function formatKmh(kmh: number): string {
  return kmh.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

/** IMC. */
export function bmi(kg: number, cm: number): number {
  const m = cm / 100;
  return kg / (m * m);
}

/** Peso para IMC 25 (limite do "peso normal"). */
export function weightForBmi(targetBmi: number, cm: number): number {
  const m = cm / 100;
  return targetBmi * m * m;
}

/** "mm:ss", "h:mm:ss" ou só minutos → segundos. */
export function parseDuration(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const parts = t.split(':').map(Number);
  if (parts.some((p) => Number.isNaN(p))) return null;
  if (parts.length === 1) return parts[0] * 60;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}
