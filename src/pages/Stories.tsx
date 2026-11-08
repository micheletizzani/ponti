import { useEffect, useState, type FormEvent } from 'react';
import type { SocialStory, StoryVisual } from '../types/domain';
import { NATIVE_STORIES } from '../data/socialStories';
import { categoryLabel, duplicateStory, personalizeStory } from '../lib/socialStory';
import { useAppStore } from '../lib/store';
import { StoryArt } from '../components/StoryArt';
import { StoryPlayer } from '../components/StoryPlayer';
import { StoryStudio } from '../components/StoryStudio';
import { countCachedCaaSymbols, subscribeCaaCache } from '../lib/caa';
import { deleteStory, loadStories, verifyPassphrase } from '../lib/vault';

type Mode =
  | { kind: 'library' }
  | { kind: 'player'; story: SocialStory }
  | { kind: 'gate'; pending?: SocialStory }
  | { kind: 'studio'; initial?: SocialStory };

const FALLBACK_VISUAL: StoryVisual = { type: 'symbol', key: 'parole', altText: 'Una storia' };

/**
 * Modulo 06: libreria delle storie, player per il bambino e Story Studio
 * protetto dalla passphrase dell'adulto.
 */
export function Stories() {
  const [custom, setCustom] = useState<SocialStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>({ kind: 'library' });
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adultVerified, setAdultVerified] = useState(false);
  const [caaCount, setCaaCount] = useState<number | null>(null);
  const gender = useAppStore((state) => state.profile.gender);
  const adultOpen = useAppStore((state) => state.adultOpen);
  const setAdultOpen = useAppStore((state) => state.setAdultOpen);

  const refresh = async () => {
    setLoading(true);
    setCustom(await loadStories());
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    let active = true;
    const refreshCaaCount = () => {
      void countCachedCaaSymbols().then((value) => {
        if (active) setCaaCount(value);
      });
    };
    refreshCaaCount();
    const unsubscribe = subscribeCaaCache(refreshCaaCount);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const requestStudio = (initial?: SocialStory) => {
    if (adultVerified || adultOpen) setMode({ kind: 'studio', initial });
    else setMode({ kind: 'gate', pending: initial });
  };

  if (mode.kind === 'player') {
    return <StoryPlayer story={personalizeStory(mode.story, gender)} onExit={() => setMode({ kind: 'library' })} />;
  }

  if (mode.kind === 'studio') {
    return (
      <StoryStudio
        initial={mode.initial}
        onCancel={() => setMode({ kind: 'library' })}
        onSaved={(story) => {
          setAdultVerified(true);
          setMode({ kind: 'library' });
          setNotice(`Storia «${story.title}» salvata e cifrata sul dispositivo.`);
          void refresh();
        }}
      />
    );
  }

  if (mode.kind === 'gate') {
    return (
      <AdultGate
        onCancel={() => setMode({ kind: 'library' })}
        onVerified={() => {
          setAdultVerified(true);
          setAdultOpen(true);
          setMode({ kind: 'studio', initial: mode.pending });
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-start gap-3">
          <a href="#/app" className="ponti-btn-quiet min-h-16 px-4">
            <span aria-hidden="true">←</span> Oggi
          </a>
          <div>
            <p className="ponti-label">Modulo 06</p>
            <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">Storie sociali</h1>
          </div>
        </div>
        <button type="button" onClick={() => requestStudio()} className="ponti-btn-primary">
          Crea una storia
        </button>
      </header>

      <p className="max-w-reading text-lg text-ink-soft">
        Una storia alla volta, con parole semplici e un’immagine che aiuta. Le storie pronte seguono i criteri di
        Carol Gray 10.2: descrivono più di quanto comandano.
      </p>
      <p className="max-w-reading text-xs text-ink-soft">
        I pittogrammi CAA opzionali provengono da ARASAAC (arasaac.org), autore Sergio Palao, Gobierno de Aragón,
        licenza CC BY-NC-SA. Le immagini scelte vengono salvate dentro la storia e restano disponibili offline.
      </p>
      <p aria-live="polite" className="max-w-reading text-xs text-ink-soft">
        {caaCount === null
          ? 'Cache CAA: conteggio in corso…'
          : caaCount === 0
            ? 'Cache CAA: 0 pittogrammi salvati sul dispositivo.'
            : caaCount === 1
              ? 'Cache CAA: 1 pittogramma salvato sul dispositivo, disponibile anche senza rete.'
              : `Cache CAA: ${caaCount} pittogrammi salvati sul dispositivo, disponibili anche senza rete.`}
      </p>

      {notice && (
        <p role="status" className="rounded-tile border-2 border-verb-line bg-verb-fill px-4 py-3 text-base text-verb-ink">
          {notice}
        </p>
      )}

      <section aria-labelledby="native-stories-heading">
        <div className="max-w-reading">
          <h2 id="native-stories-heading" className="text-2xl">
            Storie pronte
          </h2>
          <p className="mt-1 text-base text-ink-soft">
            Si possono leggere subito, anche in modalità senza salvataggio. Se vuoi cambiarle, creane una copia.
          </p>
        </div>
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          {NATIVE_STORIES.map((story) => (
            <li key={story.id}>
              <StoryCard
                story={story}
                native
                onRead={() => setMode({ kind: 'player', story })}
                onDuplicate={() => requestStudio(duplicateStory(personalizeStory(story, gender)))}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="custom-stories-heading">
        <div className="max-w-reading">
          <h2 id="custom-stories-heading" className="text-2xl">
            Le tue storie
          </h2>
          <p className="mt-1 text-base text-ink-soft">
            Foto, voci e testi restano cifrati nella cassaforte e non escono dal dispositivo.
          </p>
        </div>

        {loading ? (
          <p role="status" className="mt-4 text-lg text-ink-soft">
            Sto leggendo le storie sul dispositivo…
          </p>
        ) : custom.length === 0 ? (
          <div className="mt-4 rounded-card border border-line bg-paper-deep p-5">
            <p className="text-lg">Non hai ancora storie tue.</p>
            <p className="mt-1 max-w-reading text-base text-ink-soft">
              L’adulto può crearne una con le foto di casa o di scuola e la propria voce. Serve la passphrase della
              cassaforte.
            </p>
            <button type="button" onClick={() => requestStudio()} className="ponti-btn-secondary mt-4">
              Crea la prima storia
            </button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {custom.map((story) => (
              <li key={story.id}>
                <StoryCard
                  story={story}
                  onRead={() => setMode({ kind: 'player', story })}
                  onEdit={() => requestStudio(story)}
                  deleting={deleting === story.id}
                  onAskDelete={() => setDeleting(story.id)}
                  onCancelDelete={() => setDeleting(null)}
                  onDelete={() => {
                    void deleteStory(story.id).then(async () => {
                      setDeleting(null);
                      setNotice(`Storia «${story.title}» eliminata.`);
                      await refresh();
                    });
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StoryCard({
  story,
  native = false,
  onRead,
  onEdit,
  onDuplicate,
  deleting = false,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  story: SocialStory;
  native?: boolean;
  onRead: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  deleting?: boolean;
  onAskDelete?: () => void;
  onCancelDelete?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface">
      <div className="h-36 w-full overflow-hidden bg-paper-deep">
        <StoryArt visual={story.scenes[0]?.visual ?? FALLBACK_VISUAL} decorative className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="ponti-chip">{categoryLabel(story.category)}</p>
          {native && <p className="ponti-chip">Storia pronta</p>}
        </div>
        <h3 className="mt-3 text-xl leading-snug">{story.title}</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {story.scenes.length} {story.scenes.length === 1 ? 'pagina' : 'pagine'}
          {story.check ? ' · domanda finale' : ''}
        </p>
        {story.goal && <p className="mt-2 text-base text-ink-soft">{story.goal}</p>}

        <div className="mt-4 flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={onRead} className="ponti-btn-primary">
            Leggi
          </button>
          {native && onDuplicate && (
            <button type="button" onClick={onDuplicate} className="ponti-btn-quiet">
              Duplica e modifica
            </button>
          )}
          {onEdit && (
            <button type="button" onClick={onEdit} className="ponti-btn-secondary">
              Modifica
            </button>
          )}
          {onAskDelete && !deleting && (
            <button type="button" onClick={onAskDelete} className="ponti-btn-quiet">
              Elimina
            </button>
          )}
        </div>

        {deleting && onCancelDelete && onDelete && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-tile border-2 border-agent-line bg-agent-fill p-3">
            <p className="text-base text-agent-ink">Elimino questa storia? Non si può annullare.</p>
            <button type="button" onClick={onDelete} className="ponti-btn-primary">
              Sì, elimina
            </button>
            <button type="button" onClick={onCancelDelete} className="ponti-btn-quiet">
              No, lascia
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function AdultGate({ onVerified, onCancel }: { onVerified: () => void; onCancel: () => void }) {
  const [passphrase, setPassphrase] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!passphrase) {
      setError('Scrivi la passphrase della cassaforte.');
      return;
    }
    setBusy(true);
    const ok = await verifyPassphrase(passphrase);
    setBusy(false);
    if (!ok) {
      setError(
        'Passphrase non corretta. Serve la stessa frase segreta usata per aprire Ponti.',
      );
      return;
    }
    setPassphrase('');
    onVerified();
  };

  return (
    <div className="mx-auto max-w-[42rem] space-y-4">
      <button type="button" onClick={onCancel} className="ponti-btn-quiet min-h-16 px-4">
        <span aria-hidden="true">←</span> Storie
      </button>
      <section className="ponti-card p-6 sm:p-8" aria-labelledby="studio-gate-heading">
        <p className="ponti-label">Area adulti</p>
        <h1 id="studio-gate-heading" className="mt-2 text-3xl leading-tight">
          Apri lo Story Studio
        </h1>
        <p className="mt-3 max-w-reading text-base text-ink-soft">
          Creare o modificare una storia richiede la passphrase della cassaforte: serve a evitare modifiche
          accidentali mentre si gioca. Non viene salvata.
        </p>
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {error && (
            <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="studio-passphrase" className="block text-lg font-bold">
              Passphrase
            </label>
            <input
              id="studio-passphrase"
              type={show ? 'text' : 'password'}
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              autoComplete="current-password"
              disabled={busy}
              className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
            />
          </div>
          <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
            <input
              type="checkbox"
              checked={show}
              onChange={(event) => setShow(event.target.checked)}
              className="h-6 w-6 accent-[var(--accent)]"
            />
            <span className="text-base">Mostra la passphrase</span>
          </label>
          <button type="submit" disabled={busy} className="ponti-btn-primary">
            {busy ? 'Controllo la passphrase…' : 'Apri lo studio'}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink-soft">
          Se non hai ancora creato una cassaforte, aprila da Progressi. Lo studio non funziona in modalità senza
          salvataggio.
        </p>
      </section>
    </div>
  );
}
