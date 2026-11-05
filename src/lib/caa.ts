import { db, type CachedSymbol } from './db';

/**
 * Libreria CAA.
 *
 * - I dodici simboli geometrici di base restano nel codice e funzionano sempre.
 * - I pittogrammi ARASAAC si cercano solo quando l'adulto preme il pulsante:
 *   in quel momento la parola viene inviata ad api.arasaac.org.
 * - Immagini e parole trovate restano in una cache IndexedDB pubblica: nessun
 *   dato del bambino, nessuna query salvata, nessun invio automatico.
 * - Il simbolo scelto viene incorporato nella storia come data URL, quindi il
 *   player e la lettura offline non fanno richieste di rete.
 *
 * Pittogrammi ARASAAC: autore Sergio Palao, origine ARASAAC (arasaac.org),
 * licenza CC BY-NC-SA, titolare Gobierno de Aragón. Uso non commerciale.
 */

const API_BASE = 'https://api.arasaac.org/api/pictograms/it/search';
const IMAGE_BASE = 'https://static.arasaac.org/pictograms';
export const CAA_CACHE_LIMIT = 240;
export const ARASAAC_ATTRIBUTION =
  'Pittogrammi: ARASAAC (arasaac.org), autore Sergio Palao, Gobierno de Aragón, licenza CC BY-NC-SA.';

interface AraasacKeyword {
  keyword?: string;
  type?: number;
}

interface AraasacPictogram {
  _id?: number;
  keywords?: AraasacKeyword[];
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('it');
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('lettura immagine'));
    reader.readAsDataURL(blob);
  });
}

function readLabel(item: AraasacPictogram, query: string): { label: string; keywords: string[] } | null {
  const keywords = (item.keywords ?? [])
    .map((keyword) => keyword.keyword?.trim())
    .filter((keyword): keyword is string => Boolean(keyword));
  if (keywords.length === 0) return null;
  const exact = keywords.find((keyword) => normalize(keyword) === normalize(query));
  const preferred = exact ?? (item.keywords ?? []).find((keyword) => keyword.type === 2 && keyword.keyword)?.keyword;
  return { label: preferred ?? keywords[0]!, keywords };
}

/** Cerca solo nella cache: nessuna rete, nessuna parola inviata a terzi. */
export async function cachedCaaSearch(query: string): Promise<CachedSymbol[]> {
  const normalized = normalize(query);
  if (normalized.length < 2) return [];
  try {
    const all = await db.caaSymbols.toArray();
    return all
      .filter(
        (symbol) =>
          normalize(symbol.label).includes(normalized) ||
          symbol.keywords.some((keyword) => normalize(keyword).includes(normalized)),
      )
      .sort((a, b) => a.label.localeCompare(b.label, 'it'))
      .slice(0, 24);
  } catch {
    return [];
  }
}

const cacheListeners = new Set<() => void>();

/** Notifica i componenti quando il contenuto della cache CAA cambia. */
export function subscribeCaaCache(listener: () => void): () => void {
  cacheListeners.add(listener);
  return () => {
    cacheListeners.delete(listener);
  };
}

function notifyCaaCache(): void {
  for (const listener of cacheListeners) listener();
}

/** Numero di pittogrammi attualmente in cache. */
export async function countCachedCaaSymbols(): Promise<number> {
  try {
    return await db.caaSymbols.count();
  } catch {
    return 0;
  }
}

/** Svuota solo la cache CAA e restituisce quanti pittogrammi sono stati rimossi. */
export async function clearCaaCache(): Promise<number> {
  const count = await db.caaSymbols.count();
  await db.caaSymbols.clear();
  notifyCaaCache();
  return count;
}

async function cacheSymbols(symbols: CachedSymbol[]): Promise<void> {
  if (symbols.length === 0) return;
  await db.transaction('rw', db.caaSymbols, async () => {
    await db.caaSymbols.bulkPut(symbols);
    const count = await db.caaSymbols.count();
    if (count > CAA_CACHE_LIMIT) {
      const excess = await db.caaSymbols.orderBy('cachedAt').limit(count - CAA_CACHE_LIMIT).primaryKeys();
      await db.caaSymbols.bulkDelete(excess);
    }
  });
}

/**
 * Cerca su ARASAAC e incorpora ogni immagine come data URL prima di salvarla.
 * Va chiamata solo da un gesto esplicito dell'adulto.
 */
export async function fetchCaaSymbols(query: string): Promise<CachedSymbol[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const response = await fetch(`${API_BASE}/${encodeURIComponent(trimmed)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`ARASAAC ha risposto ${response.status}`);

  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Risposta ARASAAC inattesa');

  const cachedAt = new Date().toISOString();
  const symbols: CachedSymbol[] = [];
  await Promise.all(
    (data as AraasacPictogram[]).slice(0, 12).map(async (item) => {
      const id = item?._id;
      if (typeof id !== 'number') return;
      const info = readLabel(item, trimmed);
      if (!info) return;
      try {
        const image = await fetch(`${IMAGE_BASE}/${id}/${id}_300.png`);
        if (!image.ok) return;
        const blob = await image.blob();
        if (!blob.type.startsWith('image/')) return;
        symbols.push({
          id: String(id),
          label: info.label,
          keywords: info.keywords,
          dataUrl: await blobToDataUrl(blob),
          cachedAt,
        });
      } catch {
        /* un pittogramma non raggiungibile non blocca gli altri */
      }
    }),
  );

  const sorted = symbols.sort((a, b) => a.label.localeCompare(b.label, 'it'));
  try {
    await cacheSymbols(sorted);
    if (sorted.length > 0) notifyCaaCache();
  } catch {
    /* se la cache è piena o non disponibile, i simboli restano selezionabili ora */
  }
  return sorted;
}
