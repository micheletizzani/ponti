import { useEffect, useMemo, useState } from 'react';
import type { StoryVisual } from '../types/domain';
import type { CachedSymbol } from '../lib/db';
import { ARASAAC_ATTRIBUTION, cachedCaaSearch, fetchCaaSymbols } from '../lib/caa';
import { STORY_SYMBOLS, StoryArt } from './StoryArt';

/**
 * Simboli base sempre offline; ricerca ARASAAC solo su gesto dell'adulto.
 * I risultati trovati restano in cache e il simbolo scelto viene incorporato
 * nella storia, così il player non richiede la rete.
 */
export function SymbolPicker({
  sceneId,
  selected,
  cacheVersion,
  onSelect,
}: {
  sceneId: string;
  selected: StoryVisual;
  /** Cambia quando l’adulto svuota la cache: i risultati locali vengono riletti. */
  cacheVersion: number;
  onSelect: (visual: StoryVisual) => void;
}) {
  const [query, setQuery] = useState('');
  const [cached, setCached] = useState<CachedSymbol[]>([]);
  const [remote, setRemote] = useState<CachedSymbol[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const normalized = query.trim().toLocaleLowerCase('it');

  useEffect(() => {
    let active = true;
    if (normalized.length < 2) {
      setCached([]);
      return;
    }
    void cachedCaaSearch(normalized).then((rows) => {
      if (active) setCached(rows);
    });
    return () => {
      active = false;
    };
  }, [normalized, cacheVersion]);

  useEffect(() => {
    setRemote([]);
    setMessage(null);
  }, [normalized, cacheVersion]);

  const localSymbols = useMemo(
    () =>
      normalized
        ? STORY_SYMBOLS.filter((symbol) => symbol.label.toLocaleLowerCase('it').includes(normalized))
        : STORY_SYMBOLS,
    [normalized],
  );

  const results = useMemo(() => {
    const seen = new Set<string>();
    return [...remote, ...cached].filter((symbol) => {
      if (seen.has(symbol.id)) return false;
      seen.add(symbol.id);
      return true;
    });
  }, [remote, cached]);

  const searchOnline = async () => {
    if (normalized.length < 2) return;
    setSearching(true);
    setMessage(null);
    try {
      const found = await fetchCaaSymbols(query);
      setRemote(found);
      if (found.length === 0) {
        setMessage('Nessun simbolo trovato per questa parola. Prova con un sinonimo o con il singolare.');
      }
    } catch {
      setMessage(
        'Non riesco a raggiungere la libreria CAA in questo momento. Restano disponibili i simboli già salvati e quelli di base.',
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={`caa-search-${sceneId}`} className="block text-sm font-bold">
          Cerca un simbolo per parola
        </label>
        <p id={`caa-help-${sceneId}`} className="mt-1 text-sm text-ink-soft">
          I simboli di base sono sempre offline. La ricerca online invia solo questa parola ad ARASAAC e salva i
          risultati sul dispositivo.
        </p>
        <input
          id={`caa-search-${sceneId}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Per esempio: cane, mangiare, turno"
          aria-describedby={`caa-help-${sceneId}`}
          className="mt-1 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-3 text-base"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void searchOnline()}
          disabled={searching || normalized.length < 2}
          className="ponti-btn-secondary min-h-16"
        >
          {searching ? 'Cerco nella libreria CAA…' : 'Cerca nella libreria CAA online'}
        </button>
        {normalized.length > 0 && normalized.length < 2 && (
          <p className="text-sm text-ink-soft">Scrivi almeno due lettere.</p>
        )}
      </div>

      {message && (
        <p role="status" className="rounded-tile border border-line bg-paper-deep px-3 py-2 text-sm text-ink-soft">
          {message}
        </p>
      )}

      {results.length > 0 && (
        <div>
          <p className="ponti-label">
            Pittogrammi CAA {remote.length === 0 ? 'già salvati' : 'trovati'}
          </p>
          <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {results.map((symbol) => {
              const active = selected.type === 'aac' && selected.id === symbol.id;
              return (
                <button
                  key={symbol.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onSelect({
                      type: 'aac',
                      id: symbol.id,
                      label: symbol.label,
                      dataUrl: symbol.dataUrl,
                      altText: symbol.label,
                      source: 'arasaac',
                    })
                  }
                  className={`rounded-tile border-2 p-2 text-sm font-bold ${
                    active ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
                  }`}
                >
                  <img src={symbol.dataUrl} alt="" className="mx-auto h-14 w-14 object-contain" />
                  <span className="mt-1 block break-words">{symbol.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-ink-soft">Nessuna di queste immagini viene richiesta alla rete durante la lettura.</p>
        </div>
      )}

      <div>
        <p className="ponti-label">Simboli di base, sempre offline</p>
        <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {localSymbols.map((symbol) => {
            const active = selected.type === 'symbol' && selected.key === symbol.key;
            return (
              <button
                key={symbol.key}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onSelect({ type: 'symbol', key: symbol.key, altText: symbol.label })
                }
                className={`rounded-tile border-2 p-2 text-sm font-bold ${
                  active ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
                }`}
              >
                <StoryArt
                  visual={{ type: 'symbol', key: symbol.key, altText: symbol.label }}
                  decorative
                  className="mx-auto h-14 w-full"
                />
                <span className="mt-1 block">{symbol.label}</span>
              </button>
            );
          })}
        </div>
        {normalized.length >= 2 && localSymbols.length === 0 && (
          <p className="mt-1 text-sm text-ink-soft">Nessun simbolo di base per questa parola: prova la ricerca CAA.</p>
        )}
      </div>

      <p className="text-xs text-ink-soft">
        {ARASAAC_ATTRIBUTION}{' '}
        <a
          href="https://arasaac.org/terms-of-use"
          target="_blank"
          rel="noreferrer"
          className="ponti-link text-xs"
        >
          Termini e licenza
        </a>
      </p>
    </div>
  );
}
