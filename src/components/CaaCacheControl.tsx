import { useEffect, useState } from 'react';
import { clearCaaCache, countCachedCaaSymbols, subscribeCaaCache } from '../lib/caa';

/**
 * Mostra quanti pittogrammi pubblici sono in cache e permette di svuotarla
 * senza toccare storie, foto o voci. Il conteggio si aggiorna anche dopo una
 * nuova ricerca CAA.
 */
export function CaaCacheControl({ onCacheCleared }: { onCacheCleared: () => void }) {
  const [count, setCount] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void countCachedCaaSymbols().then((value) => {
        if (!active) return;
        setCount(value);
        // Una nuova ricerca ha ripopolato la cache: il vecchio esito non è più attuale.
        setMessage((current) => (value > 0 ? null : current));
      });
    };
    refresh();
    const unsubscribe = subscribeCaaCache(refresh);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const clear = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const removed = await clearCaaCache();
      setCount(0);
      setConfirming(false);
      setMessage(
        removed === 0
          ? 'La cache era già vuota.'
          : removed === 1
            ? 'Cache svuotata: 1 pittogramma rimosso.'
            : `Cache svuotata: ${removed} pittogrammi rimossi.`,
      );
      onCacheCleared();
    } catch {
      setMessage('Non riesco a svuotare la cache in questo momento. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="ponti-card p-4 sm:p-5" aria-labelledby="caa-cache-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="caa-cache-heading" className="text-xl">
            Cache dei simboli CAA
          </h2>
          <p aria-live="polite" className="mt-1 text-base text-ink-soft">
            {count === null
              ? 'Conteggio in corso…'
              : count === 0
                ? 'Nessun pittogramma salvato sul dispositivo.'
                : count === 1
                  ? '1 pittogramma salvato, disponibile anche senza rete.'
                  : `${count} pittogrammi salvati, disponibili anche senza rete.`}
          </p>
        </div>
        {count !== null && count > 0 && !confirming && (
          <button
            type="button"
            onClick={() => {
              setConfirming(true);
              setMessage(null);
            }}
            className="ponti-btn-quiet min-h-16"
          >
            Svuota la cache CAA
          </button>
        )}
      </div>

      <p className="mt-2 text-sm text-ink-soft">
        Svuotare la cache non modifica storie, foto o voci. I pittogrammi già inseriti restano dentro le storie.
      </p>

      {confirming && (
        <div role="group" aria-label="Conferma svuotamento cache CAA" className="mt-3 rounded-tile border border-line bg-paper-deep p-3">
          <p className="text-base">Svuoto solo la cache dei pittogrammi CAA?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => void clear()} disabled={busy} className="ponti-btn-secondary min-h-16">
              {busy ? 'Svuoto…' : 'Sì, svuota la cache'}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="ponti-btn-quiet min-h-16">
              No, lascia
            </button>
          </div>
        </div>
      )}

      {message && (
        <p role="status" className="mt-3 rounded-tile border border-line bg-paper-deep px-3 py-2 text-sm text-ink-soft">
          {message}
        </p>
      )}
    </section>
  );
}
