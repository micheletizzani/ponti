import { useEffect, useRef, useState } from 'react';
import type { ModuleId } from '../types/domain';
import { VoiceRecorder, type RecordingResult } from '../lib/audio';
import { describeMediaError } from '../lib/hooks';
import { saveRecording } from '../lib/vault';
import { uid } from '../lib/metrics';
import { useAppStore } from '../lib/store';

interface Props {
  moduleId: ModuleId;
  sessionId: string;
  label?: string;
  onSaved?: (result: RecordingResult) => void;
}

/**
 * Registrazione locale, senza riconoscimento automatico.
 * Il giudizio resta umano: qui si conserva solo il campione e la sua forma.
 */
export function RecorderPanel({ moduleId, sessionId, label = 'Registra la tua voce', onSaved }: Props) {
  const motion = useAppStore((state) => state.preferences.motion);
  const recorder = useRef<VoiceRecorder>(new VoiceRecorder());
  const [state, setState] = useState<'idle' | 'recording' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [stored, setStored] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const instance = recorder.current;
    return () => {
      instance.cancel();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const start = async () => {
    setMessage(null);
    try {
      await recorder.current.start();
      setState('recording');
    } catch (error) {
      setState('error');
      setMessage(describeMediaError(error));
    }
  };

  const stop = async () => {
    try {
      const recording = await recorder.current.stop();
      setResult(recording);
      setAudioUrl(URL.createObjectURL(recording.blob));
      setState('ready');
      const savedToVault = await saveRecording({
        id: uid('rec'),
        sessionId,
        moduleId,
        createdAt: new Date().toISOString(),
        durationMs: recording.durationMs,
        peaks: recording.peaks,
        ssi: recording.ssi,
        blob: recording.blob,
      });
      setStored(savedToVault);
      if (!savedToVault) {
        setMessage('Registrazione ascoltabile ora, ma non salvata: la cassaforte è chiusa.');
      }
      onSaved?.(recording);
    } catch (error) {
      setState('error');
      setMessage(describeMediaError(error));
    }
  };

  return (
    <section className="rounded-card border border-line bg-surface p-4 sm:p-5" aria-labelledby="recorder-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="recorder-heading" className="text-base font-bold">
            {label}
          </h3>
          <p className="text-sm text-ink-soft">L’audio viene cifrato e resta qui. Nessuno lo analizza al posto del logopedista.</p>
        </div>
        {state === 'recording' ? (
          <button type="button" onClick={stop} className="ponti-btn-primary min-h-16 px-6">
            <span aria-hidden="true" className={`h-3 w-3 rounded-full bg-paper ${motion === 'full' ? 'motion-safe-pulse' : ''}`} />
            Ferma
          </button>
        ) : (
          <button type="button" onClick={start} className="ponti-btn-secondary min-h-16 px-6">
            <span aria-hidden="true" className="text-lg">●</span>
            {state === 'ready' ? 'Registra di nuovo' : 'Registra'}
          </button>
        )}
      </div>

      {state === 'recording' && (
        <p role="status" className="mt-3 text-base text-accent-ink">
          Sto registrando. Prenditi tutto il tempo che ti serve.
        </p>
      )}

      {message && (
        <p role="status" className="mt-3 rounded-xl border border-line bg-paper-deep px-3 py-2 text-base">
          {message}
        </p>
      )}

      {result && audioUrl && (
        <div className="mt-4 space-y-3">
          <div className="flex items-end gap-[2px]" aria-hidden="true">
            {result.peaks.map((value, index) => (
              <span
                key={index}
                className="w-full rounded-sm bg-accent"
                style={{ height: `${Math.max(4, Math.round(value * 62))}px`, opacity: 0.35 + value * 0.65 }}
              />
            ))}
          </div>
          <p className="text-sm text-ink-soft">
            Forma dell’onda registrata. {result.ssi !== null && `Pausa più lunga: ${Math.round(result.ssi * 100)}% della durata.`}
          </p>
          <audio src={audioUrl} controls className="w-full" aria-label="Riascolta la registrazione" />
          <p className="text-sm text-accent-ink">
            {stored
              ? 'Salvata sul dispositivo e cifrata: disponibile per la revisione del logopedista.'
              : 'Non salvata: resta ascoltabile solo finché la pagina è aperta.'}
          </p>
        </div>
      )}
    </section>
  );
}
