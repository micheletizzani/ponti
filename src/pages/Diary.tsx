import { useMemo, useState, type FormEvent } from 'react';
import type { AdultRole, DiaryEntry, DiaryMoment, DiaryMood } from '../types/domain';
import { DIARY_FLAGS, DIARY_MOMENTS, DIARY_MOODS, flagLabel, moodLabel } from '../data/adults';
import { PageHeader } from '../components/PageHeader';
import { StoryArt, symbolLabel } from '../components/StoryArt';
import { retellSentences } from '../lib/diary';
import { useRecords, sortDiary } from '../lib/records';
import { useAppStore } from '../lib/store';
import { deleteRecord, saveRecord } from '../lib/vault';
import { uid } from '../lib/metrics';
import { genderize, relativeDay, todayIso } from '../lib/words';
import { ROLE_INFO } from './AdultSpace';

const MAX_MOMENTS = 3;

function emptyEntry(role: AdultRole, authorName: string): DiaryEntry {
  const now = new Date().toISOString();
  return {
    id: uid('diary'),
    date: todayIso(),
    author: role,
    authorName,
    mood: null,
    moments: [],
    highlight: '',
    childWords: '',
    flags: [],
    forOther: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function Diary({ role }: { role: AdultRole }) {
  const info = ROLE_INFO[role];
  const { items, loading, refresh } = useRecords('diary');
  const [editing, setEditing] = useState<DiaryEntry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const entries = useMemo(() => sortDiary(items), [items]);
  const lastName = entries.find((entry) => entry.author === role && entry.authorName)?.authorName ?? '';

  if (editing) {
    return (
      <DiaryForm
        role={role}
        initial={editing}
        isNew={!items.some((item) => item.id === editing.id)}
        onCancel={() => setEditing(null)}
        onSaved={async (entry) => {
          setEditing(null);
          setNotice(`Nota di ${relativeDay(entry.date)} salvata e cifrata.`);
          await refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`#${info.path}`}
        backLabel={info.title}
        eyebrow="Diario scuola-casa"
        title="Com’è andata la giornata"
        intro={
          role === 'scuola'
            ? 'Una nota breve a fine giornata. I momenti che scegli diventano le carte con cui raccontare a casa.'
            : 'Qui leggete le note della scuola e scrivete le vostre. I momenti di casa possono essere raccontati a scuola.'
        }
        action={
          <button type="button" onClick={() => setEditing(emptyEntry(role, lastName))} className="ponti-btn-primary">
            Scrivi la nota di oggi
          </button>
        }
      />

      {notice && (
        <p role="status" className="rounded-tile border-2 border-verb-line bg-verb-fill px-4 py-3 text-base text-verb-ink">
          {notice}
        </p>
      )}

      {loading ? (
        <p role="status" className="text-lg text-ink-soft">
          Sto leggendo il diario…
        </p>
      ) : entries.length === 0 ? (
        <div className="rounded-card border border-line bg-paper-deep p-6">
          <h2 className="text-2xl">Il diario è vuoto</h2>
          <p className="mt-2 max-w-reading text-base text-ink-soft">
            Scrivete la prima nota: bastano lo stato della giornata e uno o due momenti. Se famiglia e scuola usano
            tablet diversi, le note viaggiano con «{role === 'scuola' ? 'Invia o ricevi dalla famiglia' : 'Invia o ricevi dalla scuola'}».
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <DiaryCard
                entry={entry}
                ownRole={role}
                deleting={deleting === entry.id}
                onEdit={() => setEditing(entry)}
                onAskDelete={() => setDeleting(entry.id)}
                onCancelDelete={() => setDeleting(null)}
                onDelete={async () => {
                  await deleteRecord(entry.id);
                  setDeleting(null);
                  setNotice('Nota eliminata.');
                  await refresh();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DiaryCard({
  entry,
  ownRole,
  deleting,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  entry: DiaryEntry;
  ownRole: AdultRole;
  deleting: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const gender = useAppStore((state) => state.profile.gender);
  const from = entry.author === 'scuola' ? 'Da scuola' : 'Da casa';
  const sentences = retellSentences(entry.moments, gender);
  return (
    <article className="rounded-card border border-line bg-surface p-5" aria-label={`Nota di ${relativeDay(entry.date)}, ${from.toLowerCase()}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl capitalize">{relativeDay(entry.date)}</h2>
        <p className={`ponti-chip ${entry.author === ownRole ? '' : 'border-place-line bg-place-fill text-place-ink'}`}>
          {from}
          {entry.authorName ? ` · ${entry.authorName}` : ''}
        </p>
      </div>
      <p className="mt-2 text-base">
        <strong>{moodLabel(entry.mood)}</strong>
      </p>

      {entry.moments.length > 0 && (
        <ol className="mt-3 grid gap-2 sm:grid-cols-3">
          {entry.moments.map((moment, index) => (
            <li key={moment.id} className="flex items-center gap-3 rounded-tile border border-line bg-paper-deep p-2">
              <StoryArt visual={{ type: 'symbol', key: moment.symbol, altText: symbolLabel(moment.symbol) }} decorative className="h-14 w-16 shrink-0" />
              <span className="text-base">{sentences[index]}</span>
            </li>
          ))}
        </ol>
      )}

      <dl className="mt-3 space-y-2 text-base">
        {entry.highlight && (
          <div>
            <dt className="font-bold">Una cosa bella</dt>
            <dd className="text-ink-soft">{entry.highlight}</dd>
          </div>
        )}
        {entry.childWords && (
          <div>
            <dt className="font-bold">Parole o frasi nuove</dt>
            <dd className="text-ink-soft">«{entry.childWords}»</dd>
          </div>
        )}
        {(entry.flags.length > 0 || entry.forOther) && (
          <div>
            <dt className="font-bold">Da sapere</dt>
            <dd className="text-ink-soft">
              {entry.flags.length > 0 && (
                <span className="mt-1 flex flex-wrap gap-2">
                  {entry.flags.map((flag) => (
                    <span key={flag} className="ponti-chip">
                      {genderize(flagLabel(flag), gender)}
                    </span>
                  ))}
                </span>
              )}
              {entry.forOther && <span className="mt-2 block">{entry.forOther}</span>}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {entry.moments.length > 0 && (
          <a href="#/app/racconta" className="ponti-btn-secondary">
            Apri il racconto
          </a>
        )}
        <button type="button" onClick={onEdit} className="ponti-btn-quiet">
          Modifica
        </button>
        {!deleting && (
          <button type="button" onClick={onAskDelete} className="ponti-btn-quiet">
            Elimina
          </button>
        )}
      </div>
      {deleting && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-tile border-2 border-agent-line bg-agent-fill p-3">
          <p className="text-base text-agent-ink">Elimino questa nota? Non si può annullare.</p>
          <button type="button" onClick={onDelete} className="ponti-btn-primary">
            Sì, elimina
          </button>
          <button type="button" onClick={onCancelDelete} className="ponti-btn-quiet">
            No, lascia
          </button>
        </div>
      )}
    </article>
  );
}

function DiaryForm({
  role,
  initial,
  isNew,
  onCancel,
  onSaved,
}: {
  role: AdultRole;
  initial: DiaryEntry;
  isNew: boolean;
  onCancel: () => void;
  onSaved: (entry: DiaryEntry) => void | Promise<void>;
}) {
  const info = ROLE_INFO[role];
  const gender = useAppStore((state) => state.profile.gender);
  const [entry, setEntry] = useState<DiaryEntry>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const update = (patch: Partial<DiaryEntry>) => setEntry((current) => ({ ...current, ...patch }));
  const preview = retellSentences(entry.moments, gender);

  const addMoment = (preset: { symbol: DiaryMoment['symbol']; text: string }) => {
    if (entry.moments.length >= MAX_MOMENTS) return;
    update({ moments: [...entry.moments, { id: uid('moment'), symbol: preset.symbol, text: genderize(preset.text, gender) }] });
  };

  const moveMoment = (index: number, delta: -1 | 1) => {
    const next = [...entry.moments];
    const target = index + delta;
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    update({ moments: next });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const hasContent =
      entry.mood !== null ||
      entry.moments.length > 0 ||
      entry.highlight.trim() ||
      entry.childWords.trim() ||
      entry.forOther.trim() ||
      entry.flags.length > 0;
    if (!hasContent) {
      setError('La nota è vuota. Basta scegliere com’è andata o un momento della giornata.');
      return;
    }
    if (entry.moments.some((moment) => !moment.text.trim())) {
      setError('Un momento è senza testo. Scrivilo oppure toglilo.');
      return;
    }
    setBusy(true);
    const saved: DiaryEntry = {
      ...entry,
      author: initial.author,
      authorName: entry.authorName.trim(),
      highlight: entry.highlight.trim(),
      childWords: entry.childWords.trim(),
      forOther: entry.forOther.trim(),
      moments: entry.moments.map((moment) => ({ ...moment, text: moment.text.trim() })),
      updatedAt: new Date().toISOString(),
    };
    const ok = await saveRecord('diary', saved);
    setBusy(false);
    if (!ok) {
      setError('Non riesco a salvare la nota. Controlla che la cassaforte sia aperta e riprova.');
      return;
    }
    await onSaved(saved);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <PageHeader
        backHref={`#${info.path}/diario`}
        backLabel="Diario"
        eyebrow="Diario scuola-casa"
        title={isNew ? 'Nuova nota' : 'Modifica la nota'}
        intro="Tutto è facoltativo. Due tocchi bastano: com’è andata e un momento."
      />

      {error && (
        <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="diary-date" className="block text-lg font-bold">
            Giorno
          </label>
          <input
            id="diary-date"
            type="date"
            value={entry.date}
            max={todayIso()}
            onChange={(event) => update({ date: event.target.value || todayIso() })}
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          />
        </div>
        <div>
          <label htmlFor="diary-author" className="block text-lg font-bold">
            Chi scrive <span className="font-normal text-ink-soft">(facoltativo)</span>
          </label>
          <input
            id="diary-author"
            type="text"
            value={entry.authorName}
            placeholder={role === 'scuola' ? 'Maestra Anna' : 'Papà'}
            onChange={(event) => update({ authorName: event.target.value })}
            autoComplete="off"
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          />
        </div>
      </div>

      <fieldset className="rounded-card border border-line bg-surface p-5">
        <legend className="px-1 text-lg font-bold">1. Com’è andata?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DIARY_MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              aria-pressed={entry.mood === mood.value}
              onClick={() => update({ mood: entry.mood === mood.value ? null : (mood.value as DiaryMood) })}
              className={`min-h-20 rounded-tile border-2 px-4 py-2 text-left ${
                entry.mood === mood.value ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
              }`}
            >
              <span className="block text-base font-bold">{mood.label}</span>
              <span className="block text-sm text-ink-soft">{mood.detail}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-card border border-line bg-surface p-5">
        <legend className="px-1 text-lg font-bold">2. Cosa avete fatto? Fino a tre momenti, in ordine</legend>
        <p className="mt-1 text-base text-ink-soft">
          Scritti in prima persona, come li direbbe {role === 'scuola' ? 'a casa' : 'a scuola'}. Puoi cambiare le parole.
        </p>

        {entry.moments.length > 0 && (
          <ol className="mt-4 space-y-3">
            {entry.moments.map((moment, index) => (
              <li key={moment.id} className="space-y-3 rounded-tile border-2 border-accent bg-accent-soft p-3">
                <div className="flex flex-wrap items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-paper">
                  {index + 1}
                </span>
                <StoryArt visual={{ type: 'symbol', key: moment.symbol, altText: symbolLabel(moment.symbol) }} decorative className="h-14 w-16" />
                <div className="ml-auto flex gap-2">
                  <button type="button" onClick={() => moveMoment(index, -1)} disabled={index === 0} className="ponti-btn-quiet min-h-16 px-3 disabled:opacity-40" aria-label={`Sposta prima il momento ${index + 1}`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMoment(index, 1)}
                    disabled={index === entry.moments.length - 1}
                    className="ponti-btn-quiet min-h-16 px-3 disabled:opacity-40"
                    aria-label={`Sposta dopo il momento ${index + 1}`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ moments: entry.moments.filter((item) => item.id !== moment.id) })}
                    className="ponti-btn-quiet min-h-16 px-3"
                  >
                    Togli
                  </button>
                </div>
                </div>
                <label className="sr-only" htmlFor={`moment-${moment.id}`}>
                  Testo del momento {index + 1}
                </label>
                <input
                  id={`moment-${moment.id}`}
                  type="text"
                  value={moment.text}
                  onChange={(event) =>
                    update({
                      moments: entry.moments.map((item) => (item.id === moment.id ? { ...item, text: event.target.value } : item)),
                    })
                  }
                  className="min-h-16 w-full rounded-tile border-2 border-line bg-surface px-3 text-lg"
                />
              </li>
            ))}
          </ol>
        )}

        {entry.moments.length < MAX_MOMENTS ? (
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-label="Momenti da aggiungere">
            {DIARY_MOMENTS.map((preset) => (
              <li key={preset.text}>
                <button
                  type="button"
                  onClick={() => addMoment(preset)}
                  className="flex h-full min-h-24 w-full flex-col items-center gap-1 rounded-tile border-2 border-line bg-surface p-2 text-center text-sm font-bold hover:border-accent"
                >
                  <StoryArt visual={{ type: 'symbol', key: preset.symbol, altText: '' }} decorative className="h-12 w-14" />
                  {genderize(preset.text, gender)}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-base text-ink-soft">Tre momenti bastano: di più diventano difficili da ricordare.</p>
        )}

        {preview.length > 0 && (
          <div className="mt-4 rounded-tile border border-line bg-paper-deep p-4">
            <p className="ponti-label">Come lo vedrà {role === 'scuola' ? 'a casa' : 'a scuola'}</p>
            <p className="mt-1 text-lg">{preview.join(' ')}</p>
          </div>
        )}
      </fieldset>

      <fieldset className="rounded-card border border-line bg-surface p-5">
        <legend className="px-1 text-lg font-bold">3. Da raccontare</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="diary-highlight" className="block text-base font-bold">
              Una cosa bella
            </label>
            <textarea
              id="diary-highlight"
              value={entry.highlight}
              rows={3}
              placeholder="Ha passato la palla a Marco e ha riso."
              onChange={(event) => update({ highlight: event.target.value })}
              className="mt-2 w-full rounded-tile border-2 border-line bg-surface px-4 py-3 text-lg"
            />
          </div>
          <div>
            <label htmlFor="diary-words" className="block text-base font-bold">
              Parole o frasi nuove
            </label>
            <textarea
              id="diary-words"
              value={entry.childWords}
              rows={3}
              placeholder="«Ancora palla!»"
              onChange={(event) => update({ childWords: event.target.value })}
              className="mt-2 w-full rounded-tile border-2 border-line bg-surface px-4 py-3 text-lg"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-card border border-line bg-surface p-5">
        <legend className="px-1 text-lg font-bold">4. Da sapere per {info.other}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DIARY_FLAGS.map((flag) => {
            const active = entry.flags.includes(flag.id);
            return (
              <button
                key={flag.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  update({ flags: active ? entry.flags.filter((item) => item !== flag.id) : [...entry.flags, flag.id] })
                }
                className={`min-h-16 rounded-full border-2 px-4 text-base font-bold ${
                  active ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
                }`}
              >
                {genderize(flag.label, gender)}
              </button>
            );
          })}
        </div>
        <label htmlFor="diary-other" className="mt-4 block text-base font-bold">
          Altro <span className="font-normal text-ink-soft">(facoltativo)</span>
        </label>
        <textarea
          id="diary-other"
          value={entry.forOther}
          rows={2}
          onChange={(event) => update({ forOther: event.target.value })}
          className="mt-2 w-full rounded-tile border-2 border-line bg-surface px-4 py-3 text-lg"
        />
        <p className="mt-2 text-sm text-ink-soft">
          Scrivete solo ciò che serve all’altro adulto. Diagnosi e referti non vanno qui.
        </p>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="ponti-btn-primary">
          {busy ? 'Salvo nella cassaforte…' : 'Salva la nota'}
        </button>
        <button type="button" onClick={onCancel} className="ponti-btn-quiet">
          Annulla
        </button>
      </div>
    </form>
  );
}
