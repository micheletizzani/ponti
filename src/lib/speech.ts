/**
 * Sintesi vocale: sempre controllabile, mai automatica e invadente.
 * Usiamo la voce italiana di sistema; se assente, l'interfaccia resta
 * pienamente usabile perché ogni contenuto vocale è anche scritto.
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;
let voiceCache: SpeechSynthesisVoice | null | undefined;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickItalianVoice(): SpeechSynthesisVoice | null {
  if (voiceCache !== undefined) return voiceCache;
  if (!speechSupported()) {
    voiceCache = null;
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  const italian = voices.filter((voice) => voice.lang.toLowerCase().startsWith('it'));
  const preferred = italian.find((voice) => /elsa|alice|paola|italian/i.test(voice.name)) ?? italian[0];
  voiceCache = preferred ?? null;
  return voiceCache;
}

// Le voci possono arrivare in ritardo (Safari/iOS): rinfreschiamo la cache.
if (speechSupported()) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    voiceCache = undefined;
  });
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  /** Indice del carattere raggiunto: consente l’evidenziazione parola per parola. */
  onBoundary?: (charIndex: number) => void;
}

export function stopSpeaking(): void {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

/**
 * Legge un testo e risolve quando la voce ha finito (o se non è disponibile).
 * Chiamare sempre da un gesto utente: è così che iOS consente la sintesi.
 */
export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  if (!speechSupported() || !text.trim()) return Promise.resolve();

  const synth = window.speechSynthesis;
  synth.cancel();

  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickItalianVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'it-IT';
    utterance.rate = options.rate ?? 0.82;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = 1;
    utterance.onstart = () => options.onStart?.();
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') options.onBoundary?.(event.charIndex);
    };
    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    utterance.onerror = () => {
      currentUtterance = null;
      resolve();
    };
    currentUtterance = utterance;
    synth.speak(utterance);

    // Rete di sicurezza: alcuni browser non emettono onend.
    const words = text.split(/\s+/).length;
    const expected = (words / 2.6 / utterance.rate) * 1000 + 2500;
    window.setTimeout(() => {
      if (currentUtterance === utterance) resolve();
    }, expected);
  });
}

export function isSpeaking(): boolean {
  return speechSupported() && window.speechSynthesis.speaking;
}
