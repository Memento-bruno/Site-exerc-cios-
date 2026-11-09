/**
 * Camada de acesso ao dispositivo. Usa APIs web com fallback silencioso;
 * no futuro pode ser trocada por plugins do Capacitor (Haptics, KeepAwake, LocalNotifications).
 */

export function vibrate(pattern: number | number[] = 200): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* sem suporte */
  }
}

type WakeLockSentinelLike = { release: () => Promise<void>; released?: boolean };

let sentinel: WakeLockSentinelLike | null = null;
let wanted = false;

async function acquire() {
  try {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinelLike> };
    };
    if (!nav.wakeLock) return;
    sentinel = await nav.wakeLock.request('screen');
  } catch {
    sentinel = null;
  }
}

function onVisibility() {
  if (wanted && document.visibilityState === 'visible') void acquire();
}

/** Mantém a tela acesa. Reativa ao voltar para o app. Retorna função para liberar. */
export async function keepAwake(): Promise<() => void> {
  wanted = true;
  await acquire();
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    wanted = false;
    document.removeEventListener('visibilitychange', onVisibility);
    void sentinel?.release().catch(() => {});
    sentinel = null;
  };
}

export function wakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

/* ───── Som (bip por WebAudio, sem arquivos) ───── */

let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

export function beep(times = 1, freq = 880, ms = 160): void {
  try {
    unlockAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0 + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.4, t0 + i * 0.25 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.25 + ms / 1000);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + i * 0.25);
      osc.stop(t0 + i * 0.25 + ms / 1000 + 0.05);
    }
  } catch {
    /* sem áudio */
  }
}

/* ───── Notificações locais ───── */

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!notificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function notify(title: string, body?: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  try {
    navigator.serviceWorker?.ready
      .then((reg) =>
        reg.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        }),
      )
      .catch(() => new Notification(title, { body, icon: '/icons/icon-192.png' }));
  } catch {
    /* ignora */
  }
}

export function isStandalone(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isIOS(): boolean {
  return typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
