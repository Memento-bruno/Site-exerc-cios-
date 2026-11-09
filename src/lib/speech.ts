/** Avisos por voz em pt-BR com a Web Speech API. */

let voice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (voice !== undefined) return voice;
  try {
    const voices = speechSynthesis.getVoices();
    voice =
      voices.find((v) => v.lang === 'pt-BR' && /google|luciana|francisca|natural/i.test(v.name)) ??
      voices.find((v) => v.lang === 'pt-BR') ??
      voices.find((v) => v.lang.startsWith('pt')) ??
      null;
    if (!voices.length) voice = undefined; // tenta de novo depois
  } catch {
    voice = null;
  }
  return voice ?? null;
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, opts: { interrupt?: boolean; rate?: number } = {}): void {
  if (!speechSupported()) return;
  try {
    if (opts.interrupt !== false) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = opts.rate ?? 1;
    const v = pickVoice();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch {
    /* ignora */
  }
}

/** Alguns navegadores só carregam as vozes depois de um evento. */
export function primeSpeech(): void {
  if (!speechSupported()) return;
  try {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => {
      voice = undefined;
    });
  } catch {
    /* ignora */
  }
}
