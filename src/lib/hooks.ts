import { useCallback, useEffect, useRef, useState } from 'react';
import type { ModuleId, ScaffoldLevel, SessionMetric } from '../types/domain';
import { saveSession } from './vault';
import { uid } from './metrics';
import { speak, stopSpeaking } from './speech';
import { useAppStore } from './store';

/** Apre l'audio sempre da un gesto e blocca i tocchi durante l'ascolto. */
export function useGuidedVoice() {
  const voiceRate = useAppStore((state) => state.preferences.voiceRate);
  const voiceEnabled = useAppStore((state) => state.preferences.voiceEnabled);
  const inputLockMs = useAppStore((state) => state.preferences.inputLockMs);
  const [locked, setLocked] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const releaseTimer = useRef<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
      stopSpeaking();
    };
  }, []);

  const read = useCallback(
    async (text: string) => {
      if (!voiceEnabled) return;
      if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
      setLocked(true);
      setSpeaking(true);
      await speak(text, { rate: voiceRate });
      if (!mounted.current) return;
      releaseTimer.current = window.setTimeout(() => {
        setLocked(false);
        setSpeaking(false);
      }, Math.max(400, inputLockMs * 0.25));
    },
    [inputLockMs, voiceEnabled, voiceRate],
  );

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    setLocked(false);
  }, []);

  return { locked, speaking, read, stop };
}

/** Registra la sessione in IndexedDB alla fine del compito. */
export function useSessionTracker(moduleId: ModuleId, scaffoldLevel: ScaffoldLevel) {
  const profileId = useAppStore((state) => state.profile.id);
  const sessionId = useRef(uid('session'));
  const startedAt = useRef(new Date().toISOString());
  const promptAt = useRef<number>(Date.now());
  const firstInteraction = useRef<number | null>(null);
  const saved = useRef(false);
  const [items, setItems] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  const touch = useCallback(() => {
    if (firstInteraction.current === null) firstInteraction.current = Date.now();
  }, []);

  const recordRound = useCallback((isCorrect: boolean) => {
    setItems((value) => value + 1);
    if (isCorrect) setCorrect((value) => value + 1);
  }, []);

  const latency = useCallback((): number | null => {
    const first = firstInteraction.current;
    return first === null ? null : Math.max(0, first - promptAt.current);
  }, []);

  const resetPromptClock = useCallback(() => {
    promptAt.current = Date.now();
    firstInteraction.current = null;
  }, []);

  const finish = useCallback(
    async (extra: Partial<SessionMetric> = {}) => {
      if (saved.current) return;
      saved.current = true;
      const metric: SessionMetric = {
        id: sessionId.current,
        profileId,
        moduleId,
        startedAt: startedAt.current,
        endedAt: new Date().toISOString(),
        items: extra.items ?? 0,
        correct: extra.correct ?? 0,
        latencyMs: extra.latencyMs ?? latency(),
        scaffoldLevel,
        ...extra,
      };
      await saveSession(metric);
      setSavedCount((value) => value + 1);
    },
    [latency, moduleId, profileId, scaffoldLevel],
  );

  useEffect(() => {
    return () => {
      if (items > 0 && !saved.current) {
        void saveSession({
          id: sessionId.current,
          profileId,
          moduleId,
          startedAt: startedAt.current,
          endedAt: new Date().toISOString(),
          items,
          correct,
          latencyMs: latency(),
          scaffoldLevel,
        });
        saved.current = true;
      }
    };
  }, [correct, items, latency, moduleId, profileId, scaffoldLevel]);

  return {
    touch,
    recordRound,
    latency,
    resetPromptClock,
    finish,
    items,
    correct,
    savedCount,
    sessionId: sessionId.current,
  };
}

/** Abilità di rete assenti o permessi negati non devono bloccare il compito. */
export function describeMediaError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return 'Il microfono non è autorizzato. Puoi continuare senza registrare.';
    if (error.name === 'NotFoundError') return 'Nessun microfono trovato. Puoi continuare senza registrare.';
  }
  return 'La registrazione non è partita. Puoi continuare senza registrare.';
}
