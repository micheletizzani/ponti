import { useEffect, useRef, useState, type FormEvent } from 'react';
import type {
  SocialStory,
  SocialStoryCheck,
  SocialStoryScene,
  StorySentenceType,
} from '../types/domain';
import {
  SENTENCE_TYPES,
  STORY_CATEGORIES,
  grayStatus,
  newScene,
  newStory,
  sentenceTypeLabel,
  toneIssues,
  validateStory,
} from '../lib/socialStory';
import { StoryArt } from './StoryArt';
import { SymbolPicker } from './SymbolPicker';
import { CaaCacheControl } from './CaaCacheControl';
import { saveStory } from '../lib/vault';
import { VoiceRecorder } from '../lib/audio';
import { describeMediaError } from '../lib/hooks';
import { uid } from '../lib/metrics';

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('lettura'));
    reader.readAsDataURL(blob);
  });
}

/** Riduce la foto a un lato massimo di 1000 px prima di salvarla cifrata. */
async function photoToDataUrl(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch {
    return blobToDataUrl(file);
  }
}

/**
 * Story Studio: l'adulto compone la storia senza scrivere codice.
 * Il rapporto di Gray è calcolato mentre si scrive; nulla viene salvato
 * finché la cassaforte non conferma la scrittura cifrata.
 */
export function StoryStudio({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: SocialStory;
  onCancel: () => void;
  onSaved: (story: SocialStory) => void;
}) {
  const [story, setStory] = useState<SocialStory>(() => initial ?? newStory());
  const [caaCacheVersion, setCaaCacheVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [recordingScene, setRecordingScene] = useState<string | null>(null);
  const recorder = useRef(new VoiceRecorder());

  useEffect(() => {
    const instance = recorder.current;
    return () => instance.cancel();
  }, []);

  const gray = grayStatus(story.scenes);
  const issues = toneIssues(story.scenes);
  const ratioText = gray.ratio === null ? '∞' : gray.ratio.toFixed(1).replace('.', ',');

  const update = (patch: Partial<SocialStory>) => setStory((current) => ({ ...current, ...patch }));

  const patchScene = (id: string, patch: Partial<SocialStoryScene>) =>
    setStory((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => (scene.id === id ? { ...scene, ...patch } : scene)),
    }));

  const patchCheck = (patch: Partial<SocialStoryCheck>) =>
    setStory((current) =>
      current.check ? { ...current, check: { ...current.check, ...patch } } : current,
    );

  const patchOption = (id: string, patch: Partial<SocialStoryCheck['options'][number]>) =>
    setStory((current) =>
      current.check
        ? {
            ...current,
            check: {
              ...current.check,
              options: current.check.options.map((option) =>
                option.id === id ? { ...option, ...patch } : option,
              ),
            },
          }
        : current,
    );

  const toggleCheck = (enabled: boolean) => {
    if (enabled) {
      update({
        check: {
          question: 'Cosa può fare il protagonista in questa situazione?',
          options: [
            { id: uid('option'), text: '', correct: true, feedback: 'Sì: è la strada che racconta la storia.' },
            {
              id: uid('option'),
              text: '',
              correct: false,
              feedback: 'La storia propone un’altra strada. Rileggi l’ultima pagina e prova.',
            },
          ],
        },
      });
      return;
    }
    setStory((current) => {
      const next = { ...current };
      delete next.check;
      return next;
    });
  };

  const addScene = () => setStory((current) => ({ ...current, scenes: [...current.scenes, newScene()] }));

  const removeScene = (id: string) => {
    setStory((current) => ({
      ...current,
      scenes: current.scenes.length > 1 ? current.scenes.filter((scene) => scene.id !== id) : current.scenes,
    }));
  };

  const moveScene = (index: number, direction: -1 | 1) => {
    setStory((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.scenes.length) return current;
      const scenes = [...current.scenes];
      const item = scenes[index];
      const other = scenes[target];
      if (!item || !other) return current;
      scenes[index] = other;
      scenes[target] = item;
      return { ...current, scenes };
    });
  };

  const updateAltText = (scene: SocialStoryScene, altText: string) => {
    if (scene.visual.type === 'photo') {
      patchScene(scene.id, { visual: { type: 'photo', dataUrl: scene.visual.dataUrl, altText } });
      return;
    }
    if (scene.visual.type === 'aac') {
      patchScene(scene.id, {
        visual: {
          type: 'aac',
          id: scene.visual.id,
          label: scene.visual.label,
          dataUrl: scene.visual.dataUrl,
          altText,
          source: 'arasaac',
        },
      });
      return;
    }
    patchScene(scene.id, { visual: { type: 'symbol', key: scene.visual.key, altText } });
  };

  const startRecording = async (sceneId: string) => {
    setMediaMessage(null);
    if (recordingScene) {
      setMediaMessage('Prima ferma la registrazione in corso.');
      return;
    }
    try {
      await recorder.current.start();
      setRecordingScene(sceneId);
    } catch (caught) {
      setMediaMessage(describeMediaError(caught));
    }
  };

  const stopRecording = async (sceneId: string) => {
    try {
      const result = await recorder.current.stop();
      const dataUrl = await blobToDataUrl(result.blob);
      patchScene(sceneId, {
        narration: { type: 'recorded', dataUrl, mimeType: result.blob.type || 'audio/webm' },
      });
    } catch (caught) {
      setMediaMessage(describeMediaError(caught));
    } finally {
      setRecordingScene(null);
    }
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateStory(story);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError(null);
    const next: SocialStory = {
      ...story,
      title: story.title.trim(),
      protagonist: story.protagonist.trim(),
      goal: story.goal.trim(),
      updatedAt: new Date().toISOString(),
    };
    const saved = await saveStory(next);
    setSaving(false);
    if (!saved) {
      setError(
        'Non riesco a salvare: la cassaforte è chiusa o lo spazio è finito. I testi restano in questa pagina.',
      );
      return;
    }
    onSaved(next);
  };

  return (
    <form onSubmit={save} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-start gap-3">
          <button type="button" onClick={onCancel} className="ponti-btn-quiet min-h-16 px-4">
            <span aria-hidden="true">←</span> Storie
          </button>
          <div>
            <p className="ponti-label">Area adulti · Story Studio</p>
            <h1 className="mt-1 text-3xl leading-tight">Crea una storia</h1>
          </div>
        </div>
        <p className="ponti-chip">Salvataggio cifrato</p>
      </div>

      <p className="max-w-reading text-base text-ink-soft">
        Una storia sociale descrive più di quanto comanda. Il rapporto si aggiorna mentre scrivi: servono almeno due
        frasi descrittive o prospettiche per ogni frase di guida. Foto e voci restano sul dispositivo, dentro la
        cassaforte.
      </p>

      <CaaCacheControl onCacheCleared={() => setCaaCacheVersion((version) => version + 1)} />

      {error && (
        <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
          {error}
        </p>
      )}

      <section className="ponti-card p-5 sm:p-6" aria-labelledby="gray-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="gray-heading" className="text-xl">
              Formula di Gray 10.2
            </h2>
            <p className="mt-1 text-base text-ink-soft">
              {gray.nonCoaching} {gray.nonCoaching === 1 ? 'frase che descrive' : 'frasi che descrivono'} ·{' '}
              {gray.coaching} {gray.coaching === 1 ? 'frase di guida' : 'frasi di guida'} · rapporto{' '}
              <strong className="text-ink">{ratioText}</strong>
            </p>
          </div>
          <p
            className={`ponti-chip ${
              gray.compliant
                ? 'border-verb-line bg-verb-fill text-verb-ink'
                : 'border-agent-line bg-agent-fill text-agent-ink'
            }`}
          >
            {gray.compliant ? 'Conforme: rapporto ≥ 2' : 'Da riequilibrare'}
          </p>
        </div>
        {!gray.compliant && (
          <p className="mt-3 text-base text-agent-ink">
            Aggiungi frasi descrittive o prospettiche: una storia sociale descrive più di quanto comandi.
          </p>
        )}
        {issues.length > 0 && (
          <div className="mt-3 rounded-tile border border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
            <p className="font-bold">Tono da rivedere</p>
            <ul className="mt-1 list-inside list-disc">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
            <p className="mt-1 text-sm">Preferisci «posso provare a…» e quantificatori come «a volte», «di solito».</p>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Dati della storia">
        <div className="sm:col-span-2">
          <label htmlFor="story-title" className="block text-lg font-bold">
            Titolo
          </label>
          <input
            id="story-title"
            value={story.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Per esempio: Quando devo aspettare il mio turno"
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          />
        </div>
        <div>
          <label htmlFor="story-category" className="block text-lg font-bold">
            Categoria
          </label>
          <select
            id="story-category"
            value={story.category}
            onChange={(event) => update({ category: event.target.value as SocialStory['category'] })}
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          >
            {STORY_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="story-protagonist" className="block text-lg font-bold">
            Protagonista
          </label>
          <input
            id="story-protagonist"
            value={story.protagonist}
            onChange={(event) => update({ protagonist: event.target.value })}
            placeholder="Nome o animale guida"
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="story-goal" className="block text-lg font-bold">
            Obiettivo per l’adulto
          </label>
          <input
            id="story-goal"
            value={story.goal}
            onChange={(event) => update({ goal: event.target.value })}
            placeholder="Una frase semplice: che cosa vogliamo rendere più facile?"
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="scenes-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="scenes-heading" className="text-2xl">
            Scene
          </h2>
          <button type="button" onClick={addScene} className="ponti-btn-secondary">
            Aggiungi una scena
          </button>
        </div>

        {story.scenes.map((scene, index) => (
          <fieldset key={scene.id} className="rounded-card border border-line bg-surface p-5">
            <legend className="px-2 text-lg font-bold">Scena {index + 1}</legend>

            <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
              <p className="ponti-label">{sentenceTypeLabel(scene.sentenceType)}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveScene(index, -1)}
                  disabled={index === 0}
                  aria-label={`Sposta in su la scena ${index + 1}`}
                  className="ponti-btn-quiet min-h-16 px-4"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveScene(index, 1)}
                  disabled={index === story.scenes.length - 1}
                  aria-label={`Sposta in giù la scena ${index + 1}`}
                  className="ponti-btn-quiet min-h-16 px-4"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeScene(scene.id)}
                  disabled={story.scenes.length === 1}
                  className="ponti-btn-quiet min-h-16 px-4"
                >
                  Togli
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
              <div>
                <div className="mx-auto max-w-[15rem]">
                  <StoryArt visual={scene.visual} className="h-auto w-full" />
                </div>
                <label htmlFor={`alt-${scene.id}`} className="mt-2 block text-sm font-bold">
                  Descrizione dell’immagine
                </label>
                <input
                  id={`alt-${scene.id}`}
                  value={scene.visual.altText}
                  onChange={(event) => updateAltText(scene, event.target.value)}
                  className="mt-1 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-3 text-base"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor={`type-${scene.id}`} className="block text-base font-bold">
                    Tipo di frase
                  </label>
                  <select
                    id={`type-${scene.id}`}
                    value={scene.sentenceType}
                    onChange={(event) =>
                      patchScene(scene.id, { sentenceType: event.target.value as StorySentenceType })
                    }
                    className="mt-1 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-3 text-base"
                  >
                    {SENTENCE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-ink-soft">
                    {SENTENCE_TYPES.find((type) => type.value === scene.sentenceType)?.short}
                  </p>
                </div>

                <div>
                  <label htmlFor={`text-${scene.id}`} className="block text-base font-bold">
                    Testo della scena
                  </label>
                  <textarea
                    id={`text-${scene.id}`}
                    value={scene.text}
                    onChange={(event) => patchScene(scene.id, { text: event.target.value })}
                    rows={4}
                    className="mt-1 w-full rounded-tile border-2 border-line bg-surface px-3 py-3 text-base"
                  />
                </div>

                <div>
                  <label htmlFor={`keywords-${scene.id}`} className="block text-base font-bold">
                    Parole da evidenziare
                  </label>
                  <input
                    id={`keywords-${scene.id}`}
                    value={scene.highlightKeywords.join(', ')}
                    onChange={(event) =>
                      patchScene(scene.id, {
                        highlightKeywords: event.target.value
                          .split(',')
                          .map((word) => word.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Per esempio: respiro lento, tablet"
                    className="mt-1 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-3 text-base"
                  />
                </div>

                <details className="rounded-tile border border-line bg-paper-deep p-3">
                  <summary className="min-h-16 cursor-pointer list-none py-2 text-base font-bold [&::-webkit-details-marker]:hidden">
                    Cambia immagine o simbolo
                  </summary>
                  <div className="mt-2 space-y-3">
                    <SymbolPicker
                      sceneId={scene.id}
                      selected={scene.visual}
                      cacheVersion={caaCacheVersion}
                      onSelect={(visual) => patchScene(scene.id, { visual })}
                    />
                    <label className="ponti-btn-quiet min-h-16 w-full cursor-pointer sm:w-auto">
                      Carica una foto
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          void photoToDataUrl(file)
                            .then((dataUrl) =>
                              patchScene(scene.id, {
                                visual: {
                                  type: 'photo',
                                  dataUrl,
                                  altText: scene.visual.altText || 'Foto caricata dall’adulto',
                                },
                              }),
                            )
                            .catch(() =>
                              setMediaMessage('Non riesco a leggere questa immagine. Prova con un’altra foto.'),
                            );
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </details>

                <div className="rounded-tile border border-line bg-paper-deep p-3">
                  <p className="text-base font-bold">Voce della scena</p>
                  <p className="text-sm text-ink-soft">
                    La voce registrata dall’adulto ha la precedenza; senza registrazione si usa la voce di sistema.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {scene.narration.type === 'recorded' ? (
                      <>
                        <audio controls src={scene.narration.dataUrl} className="w-full sm:w-auto" />
                        <button
                          type="button"
                          onClick={() => patchScene(scene.id, { narration: { type: 'tts' } })}
                          className="ponti-btn-quiet min-h-16"
                        >
                          Usa la voce di sistema
                        </button>
                      </>
                    ) : recordingScene === scene.id ? (
                      <button
                        type="button"
                        onClick={() => void stopRecording(scene.id)}
                        className="ponti-btn-primary min-h-16"
                      >
                        Ferma e usa la registrazione
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void startRecording(scene.id)}
                        className="ponti-btn-secondary min-h-16"
                      >
                        Registra la voce
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        ))}
      </section>

      {mediaMessage && (
        <p role="status" className="rounded-tile border border-line bg-paper-deep px-4 py-3 text-base text-ink-soft">
          {mediaMessage}
        </p>
      )}

      <section className="ponti-card p-5" aria-labelledby="check-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="check-heading" className="text-xl">
              Domanda finale
            </h2>
            <p className="text-base text-ink-soft">Due risposte, una sola corretta, nessun punteggio.</p>
          </div>
          <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
            <input
              type="checkbox"
              checked={Boolean(story.check)}
              onChange={(event) => toggleCheck(event.target.checked)}
              className="h-6 w-6 accent-[var(--accent)]"
            />
            <span className="text-base font-bold">Aggiungi la domanda</span>
          </label>
        </div>

        {story.check && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="check-question" className="block text-base font-bold">
                Domanda
              </label>
              <input
                id="check-question"
                value={story.check.question}
                onChange={(event) => patchCheck({ question: event.target.value })}
                className="mt-1 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-3 text-base"
              />
            </div>
            {story.check.options.map((option, optionIndex) => (
              <div key={option.id} className="rounded-tile border border-line bg-paper-deep p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-bold">Risposta {optionIndex + 1}</p>
                  <label className="flex min-h-16 items-center gap-2 text-sm font-bold">
                    <input
                      type="radio"
                      name="story-check-correct"
                      checked={option.correct}
                      onChange={() =>
                        setStory((current) =>
                          current.check
                            ? {
                                ...current,
                                check: {
                                  ...current.check,
                                  options: current.check.options.map((item) => ({
                                    ...item,
                                    correct: item.id === option.id,
                                  })),
                                },
                              }
                            : current,
                        )
                      }
                      className="h-6 w-6 accent-[var(--accent)]"
                    />
                    È quella corretta
                  </label>
                </div>
                <label htmlFor={`option-${option.id}`} className="mt-1 block text-sm font-bold">
                  Testo della risposta
                </label>
                <input
                  id={`option-${option.id}`}
                  value={option.text}
                  onChange={(event) => patchOption(option.id, { text: event.target.value })}
                  className="mt-1 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-3 text-base"
                />
                <label htmlFor={`feedback-${option.id}`} className="mt-2 block text-sm font-bold">
                  Risposta dell’adulto se viene scelta
                </label>
                <input
                  id={`feedback-${option.id}`}
                  value={option.feedback}
                  onChange={(event) => patchOption(option.id, { feedback: event.target.value })}
                  className="mt-1 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-3 text-base"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="submit" disabled={saving} className="ponti-btn-primary">
          {saving ? 'Salvo la storia…' : 'Salva la storia'}
        </button>
        <button type="button" onClick={onCancel} className="ponti-btn-quiet">
          Annulla
        </button>
        <p className="text-sm text-ink-soft">Il salvataggio richiede la cassaforte aperta.</p>
      </div>
    </form>
  );
}
