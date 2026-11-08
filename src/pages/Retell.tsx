import { useMemo, useState } from 'react';
import { StoryArt, symbolLabel } from '../components/StoryArt';
import { LockNotice } from '../components/ui';
import { retellSentences, sequenceWords } from '../lib/diary';
import { useGuidedVoice } from '../lib/hooks';
import { useRecords, sortDiary } from '../lib/records';
import { useAppStore } from '../lib/store';
import { genderize, relativeDay } from '../lib/words';

/**
 * «Racconta la giornata»: i momenti scritti da un adulto diventano carte in
 * ordine (PRIMA, POI, ALLA FINE) con cui raccontare all'altro adulto.
 * Gli stessi connettivi di Trama e nessi, applicati alla vita vera.
 */
export function Retell() {
  const { items, loading } = useRecords('diary');
  const gender = useAppStore((state) => state.profile.gender);
  const dualUser = useAppStore((state) => state.preferences.dualUser);
  const vaultUnlocked = useAppStore((state) => state.vaultUnlocked);
  const entries = useMemo(() => sortDiary(items).filter((entry) => entry.moments.length > 0), [items]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const entry = entries.find((item) => item.id === selectedId) ?? entries[0] ?? null;
  const { locked, read } = useGuidedVoice();

  const back = (
    <a href="#/app" className="ponti-btn-quiet min-h-16 px-4">
      <span aria-hidden="true">←</span> Oggi
    </a>
  );

  if (loading) {
    return (
      <p role="status" className="text-lg text-ink-soft">
        Cerco i racconti…
      </p>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        {back}
        <section className="ponti-card max-w-reading p-6 sm:p-8">
          <p className="ponti-label">Racconta la giornata</p>
          <h1 className="mt-2 text-3xl">Non ci sono ancora racconti</h1>
          <p className="mt-3 text-lg text-ink-soft">
            {vaultUnlocked
              ? 'Quando la maestra o la famiglia scrivono nel Diario i momenti della giornata, qui diventano carte da raccontare.'
              : 'I racconti sono nella cassaforte: un adulto deve aprirla con la passphrase.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#/app/scuola/diario" className="ponti-btn-secondary">
              Diario (spazio scuola)
            </a>
            <a href="#/app/famiglia/diario" className="ponti-btn-quiet">
              Diario (spazio famiglia)
            </a>
          </div>
        </section>
      </div>
    );
  }

  const sentences = retellSentences(entry.moments, gender);
  const words = sequenceWords(entry.moments.length);
  const place = entry.author === 'scuola' ? 'a scuola' : 'a casa';
  const day = relativeDay(entry.date);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          {back}
          <div>
            <p className="ponti-label">Racconta la giornata</p>
            <h1 className="mt-1 text-2xl leading-tight first-letter:uppercase sm:text-3xl">
              {day} {place}
            </h1>
          </div>
        </div>
        {entries.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Scegli il giorno">
            {entries.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === entry.id}
                onClick={() => setSelectedId(item.id)}
                className={`min-h-16 rounded-full border-2 px-4 text-base font-bold first-letter:uppercase ${
                  item.id === entry.id ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
                }`}
              >
                {relativeDay(item.date)} {item.author === 'scuola' ? 'a scuola' : 'a casa'}
              </button>
            ))}
          </div>
        )}
      </div>

      <LockNotice locked={locked} />

      <ol className={`grid gap-4 ${entry.moments.length === 3 ? 'md:grid-cols-3' : entry.moments.length === 2 ? 'sm:grid-cols-2' : ''}`}>
        {entry.moments.map((moment, index) => (
          <li key={moment.id}>
            <button
              type="button"
              onClick={() => void read(sentences[index] ?? '')}
              disabled={locked}
              className="flex h-full w-full flex-col rounded-card border-2 border-place-line bg-surface p-4 text-left hover:border-accent"
            >
              {words[index] && (
                <span className="rounded-full bg-place-fill px-4 py-1 text-xl font-bold uppercase tracking-wide text-place-ink">
                  {words[index]}
                </span>
              )}
              <StoryArt
                visual={{ type: 'symbol', key: moment.symbol, altText: symbolLabel(moment.symbol) }}
                decorative
                className="mt-3 h-32 w-full md:h-auto md:aspect-[6/5]"
              />
              <span className="mt-3 block text-xl font-bold leading-snug sm:text-2xl">{genderize(moment.text, gender)}</span>
              <span className="mt-2 text-sm text-ink-soft">Tocca per ascoltare</span>
            </button>
          </li>
        ))}
      </ol>

      <button type="button" onClick={() => void read(sentences.join(' '))} disabled={locked} className="ponti-btn-primary">
        <span aria-hidden="true">🔊</span> Ascolta tutto il racconto
      </button>

      {dualUser && (
        <aside className="rounded-card border border-line bg-paper-deep p-5" aria-label="Suggerimento per l’adulto">
          <p className="ponti-label">Per chi ascolta</p>
          <ul className="mt-2 space-y-2 text-base">
            <li>Indica la prima carta e di’ solo «Prima…». Poi aspetta, contando fino a cinque.</li>
            <li>Se arriva una parola, ripetila aggiungendone una: «Giardino». «Sì, in giardino!»</li>
            <li>Non serve dire tutte le carte. Una carta raccontata bene vale più di tre ripetute.</li>
            {entry.highlight && (
              <li>
                <strong>Una cosa bella da chiedere:</strong> {entry.highlight}
              </li>
            )}
          </ul>
          {entry.authorName && <p className="mt-3 text-sm text-ink-soft">Nota scritta da {entry.authorName}.</p>}
        </aside>
      )}
    </div>
  );
}
