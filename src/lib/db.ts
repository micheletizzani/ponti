import Dexie, { type Table } from 'dexie';
import type { RecordingMeta, SessionMetric } from '../types/domain';

/**
 * Dexie — struttura dell'archivio locale.
 *
 * Le tabelle `sessions` e `recordings` restano solo per la migrazione dei dati
 * creati prima dell'introduzione della cassaforte: vengono svuotate appena la
 * passphrase è impostata. Da quel momento si usano esclusivamente le tabelle
 * cifrate (`sessionsEnc`, `recordingsEnc`), i cui campi non contengono testo
 * leggibile né audio in chiaro.
 */

export interface VaultMeta {
  id: string;
  version: number;
  /** Salt casuale per PBKDF2 (16 byte). */
  salt: Uint8Array<ArrayBuffer>;
  iterations: number;
  verifierIv: Uint8Array<ArrayBuffer>;
  /** Verifica della passphrase: cifratura AES-GCM di un valore noto. */
  verifierCipher: ArrayBuffer;
  createdAt: string;
}

export interface EncryptedSession {
  id: string;
  iv: Uint8Array<ArrayBuffer>;
  cipher: ArrayBuffer;
}

export interface CachedSymbol {
  id: string;
  label: string;
  keywords: string[];
  dataUrl: string;
  cachedAt: string;
}

export interface EncryptedStory {
  id: string;
  iv: Uint8Array<ArrayBuffer>;
  cipher: ArrayBuffer;
}

export interface EncryptedRecording {
  id: string;
  metaIv: Uint8Array<ArrayBuffer>;
  metaCipher: ArrayBuffer;
  audioIv: Uint8Array<ArrayBuffer>;
  audioCipher: ArrayBuffer;
}

class PontiDatabase extends Dexie {
  /** Dati legacy in chiaro: solo migrazione. */
  sessions!: Table<SessionMetric, string>;
  recordings!: Table<RecordingMeta, string>;
  vault!: Table<VaultMeta, string>;
  sessionsEnc!: Table<EncryptedSession, string>;
  recordingsEnc!: Table<EncryptedRecording, string>;
  storiesEnc!: Table<EncryptedStory, string>;
  /** Cache pubblica dei pittogrammi CAA: nessun dato del bambino. */
  caaSymbols!: Table<CachedSymbol, string>;

  constructor() {
    super('ponti-local');
    this.version(1).stores({
      sessions: 'id, moduleId, startedAt',
      recordings: 'id, sessionId, moduleId, createdAt',
    });
    this.version(2).stores({
      vault: 'id',
      sessionsEnc: 'id',
      recordingsEnc: 'id',
    });
    // Le storie contengono foto e voci del bambino: sempre cifrate.
    this.version(3).stores({
      storiesEnc: 'id',
    });
    // Cache dei pittogrammi pubblici: solo immagini e parole, mai dati del bambino.
    this.version(4).stores({
      caaSymbols: 'id, label, cachedAt',
    });
  }
}

export const db = new PontiDatabase();
