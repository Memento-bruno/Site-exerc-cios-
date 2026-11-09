import { useEffect, useState } from 'react';
import { isIOS, isStandalone } from './device';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

/** Estado do prompt "Instalar app". */
export function useInstallPrompt() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    canPrompt: !!deferred,
    installed: isStandalone(),
    ios: isIOS() && !isStandalone(),
    prompt: async () => {
      if (!deferred) return 'unavailable' as const;
      await deferred.prompt();
      const r = await deferred.userChoice;
      deferred = null;
      force((n) => n + 1);
      return r.outcome;
    },
  };
}
