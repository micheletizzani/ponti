import {
  db,
  type EncryptedRecord,
  type EncryptedRecording,
  type EncryptedSession,
  type EncryptedStory,
  type RecordKind,
  type VaultMeta,
} from './db';
import type {
  DiaryEntry,
  RecordingMeta,
  SessionMetric,
  SharedGoal,
  SocialStory,
  VisualSchedule,
} from '../types/domain';

/**
 * Cassaforte locale.
 *
 * - AES-256-GCM su ogni record (IV casuale di 12 byte, AAD legata all'id).
 * - Chiave derivata dalla passphrase con PBKDF2-HMAC-SHA-256 (310.000 iterazioni,
 *   salt casuale di 16 byte) e non estraibile.
 * - La passphrase non viene mai salvata. La chiave vive solo in memoria:
 *   ricaricando la pagina la cassaforte torna chiusa.
 * - Nessun dato sanitario o audio è scritto in chiaro dopo la configurazione.
 */

const VAULT_ID = 'vault';
const VERIFIER_MAGIC = 'ponti-vault-v1';
const ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

let vaultKey: CryptoKey | null = null;

export type VaultErrorCode =
  | 'crypto-unavailable'
  | 'already-configured'
  | 'not-configured'
  | 'wrong-passphrase'
  | 'invalid-passphrase'
  | 'decrypt-failed'
  | 'storage';

export class VaultError extends Error {
  readonly code: VaultErrorCode;

  constructor(code: VaultErrorCode, message: string) {
    super(message);
    this.name = 'VaultError';
    this.code = code;
  }
}

function requireCrypto(): void {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new VaultError(
      'crypto-unavailable',
      'La cifratura richiede una pagina sicura (https o localhost). Apri Ponti da un indirizzo sicuro.',
    );
  }
}

function bytes(value: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(value);
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', bytes(passphrase.normalize('NFKC')), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptJson<T>(
  key: CryptoKey,
  value: T,
  additionalData: string,
): Promise<{ iv: Uint8Array<ArrayBuffer>; cipher: ArrayBuffer }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: bytes(additionalData) },
    key,
    bytes(JSON.stringify(value)),
  );
  return { iv, cipher };
}

async function decryptJson<T>(
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>,
  cipher: ArrayBuffer,
  additionalData: string,
): Promise<T> {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData: bytes(additionalData) },
    key,
    cipher,
  );
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}

async function encryptBlob(
  key: CryptoKey,
  blob: Blob,
  additionalData: string,
): Promise<{ iv: Uint8Array<ArrayBuffer>; cipher: ArrayBuffer }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: bytes(additionalData) },
    key,
    await blob.arrayBuffer(),
  );
  return { iv, cipher };
}

export function isVaultUnlocked(): boolean {
  return vaultKey !== null;
}

export async function vaultStatus(): Promise<'missing' | 'locked' | 'unlocked'> {
  if (vaultKey) return 'unlocked';
  try {
    const meta = await db.vault.get(VAULT_ID);
    return meta ? 'locked' : 'missing';
  } catch {
    return 'missing';
  }
}

/**
 * Protegge i dati già presenti sul dispositivo. Viene eseguita alla creazione
 * della cassaforte e a ogni sblocco, così un'interruzione non lascia record
 * in chiaro. I record vengono rimossi dalla tabella legacy solo dopo essere
 * stati cifrati con successo.
 */
async function migratePlaintext(key: CryptoKey): Promise<{ sessions: number; recordings: number }> {
  const migratedSessions: string[] = [];
  const migratedRecordings: string[] = [];

  const legacySessions = await db.sessions.toArray();
  for (const session of legacySessions) {
    try {
      const encrypted = await encryptJson(key, session, `session:${session.id}`);
      await db.sessionsEnc.put({ id: session.id, ...encrypted });
      migratedSessions.push(session.id);
    } catch {
      /* il record resta in chiaro: meglio non perdere il dato, va segnalato al clinico */
    }
  }
  if (migratedSessions.length > 0) await db.sessions.bulkDelete(migratedSessions);

  const legacyRecordings = await db.recordings.toArray();
  for (const recording of legacyRecordings) {
    try {
      const { blob, ...meta } = recording;
      const payload = { ...meta, mimeType: blob.type || 'audio/webm' };
      const encryptedMeta = await encryptJson(key, payload, `recording-meta:${recording.id}`);
      const encryptedAudio = await encryptBlob(key, blob, `recording-audio:${recording.id}`);
      await db.recordingsEnc.put({
        id: recording.id,
        metaIv: encryptedMeta.iv,
        metaCipher: encryptedMeta.cipher,
        audioIv: encryptedAudio.iv,
        audioCipher: encryptedAudio.cipher,
      });
      migratedRecordings.push(recording.id);
    } catch {
      /* idem: nessuna cancellazione se la cifratura non è riuscita */
    }
  }
  if (migratedRecordings.length > 0) await db.recordings.bulkDelete(migratedRecordings);

  return { sessions: migratedSessions.length, recordings: migratedRecordings.length };
}

export async function setupVault(
  passphrase: string,
): Promise<{ migrated: { sessions: number; recordings: number } }> {
  requireCrypto();
  const existing = await db.vault.get(VAULT_ID);
  if (existing) {
    throw new VaultError('already-configured', 'Esiste già una cassaforte su questo dispositivo.');
  }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const key = await deriveKey(passphrase, salt, ITERATIONS);
    const verifier = await encryptJson(key, { magic: VERIFIER_MAGIC }, 'verifier');
    const meta: VaultMeta = {
      id: VAULT_ID,
      version: 1,
      salt,
      iterations: ITERATIONS,
      verifierIv: verifier.iv,
      verifierCipher: verifier.cipher,
      createdAt: new Date().toISOString(),
    };
    await db.vault.put(meta);
    vaultKey = key;
    const migrated = await migratePlaintext(key);
    return { migrated };
  } catch (error) {
    vaultKey = null;
    if (error instanceof VaultError) throw error;
    throw new VaultError('storage', 'Non riesco a creare la cassaforte. Controlla lo spazio disponibile e riprova.');
  }
}

export async function unlockVault(passphrase: string): Promise<boolean> {
  requireCrypto();
  let meta: VaultMeta | undefined;
  try {
    meta = await db.vault.get(VAULT_ID);
  } catch {
    throw new VaultError('storage', 'Non riesco a leggere la cassaforte su questo dispositivo.');
  }
  if (!meta) return false;

  const key = await deriveKey(passphrase, meta.salt, meta.iterations);
  try {
    const payload = await decryptJson<{ magic: string }>(key, meta.verifierIv, meta.verifierCipher, 'verifier');
    if (payload.magic !== VERIFIER_MAGIC) return false;
  } catch {
    // GCM fallisce con chiave errata: nessuna informazione sull'archivio viene rivelata.
    return false;
  }

  vaultKey = key;
  await migratePlaintext(key);
  return true;
}

/**
 * Cambia la passphrase ri-cifrando tutto l'archivio: sessioni, registrazioni,
 * storie personalizzate e record dell'area adulti.
 *
 * I record vengono decifrati e ri-cifrati interamente in memoria; il disco
 * viene toccato solo alla fine, in un'unica transazione. Se la passphrase
 * attuale è errata o un record non si legge, non viene scritto nulla e
 * l'archivio resta con la vecchia passphrase.
 */
export async function changePassphrase(
  currentPassphrase: string,
  newPassphrase: string,
): Promise<{ sessions: number; recordings: number; stories: number; records: number }> {
  requireCrypto();

  if (newPassphrase.trim().length < 8) {
    throw new VaultError('invalid-passphrase', 'La nuova passphrase deve avere almeno 8 caratteri.');
  }
  if (newPassphrase === currentPassphrase) {
    throw new VaultError('invalid-passphrase', 'La nuova passphrase deve essere diversa da quella attuale.');
  }

  let meta: VaultMeta | undefined;
  try {
    meta = await db.vault.get(VAULT_ID);
  } catch {
    throw new VaultError('storage', 'Non riesco a leggere la cassaforte su questo dispositivo.');
  }
  if (!meta) {
    throw new VaultError('not-configured', 'Non c’è ancora una cassaforte su questo dispositivo.');
  }

  const oldKey = await deriveKey(currentPassphrase, meta.salt, meta.iterations);
  try {
    const payload = await decryptJson<{ magic: string }>(oldKey, meta.verifierIv, meta.verifierCipher, 'verifier');
    if (payload.magic !== VERIFIER_MAGIC) throw new Error('verifier mismatch');
  } catch {
    throw new VaultError('wrong-passphrase', 'La passphrase attuale non è corretta. Non ho cambiato nulla.');
  }

  let sessions: SessionMetric[];
  let recordings: RecordingMeta[];
  let stories: SocialStory[];
  let records: { id: string; kind: RecordKind; value: unknown }[];
  try {
    const [sessionRows, recordingRows, storyRows, recordRows] = await Promise.all([
      db.sessionsEnc.toArray(),
      db.recordingsEnc.toArray(),
      db.storiesEnc.toArray(),
      db.recordsEnc.toArray(),
    ]);
    sessions = await Promise.all(
      sessionRows.map((row) => decryptJson<SessionMetric>(oldKey, row.iv, row.cipher, `session:${row.id}`)),
    );
    recordings = await Promise.all(recordingRows.map((row) => decryptRecordingRow(oldKey, row)));
    stories = await Promise.all(
      storyRows.map((row) => decryptJson<SocialStory>(oldKey, row.iv, row.cipher, `story:${row.id}`)),
    );
    records = await Promise.all(
      recordRows.map(async (row) => ({
        id: row.id,
        kind: row.kind,
        value: await decryptJson<unknown>(oldKey, row.iv, row.cipher, `${row.kind}:${row.id}`),
      })),
    );
  } catch {
    throw new VaultError(
      'decrypt-failed',
      'Non riesco a leggere tutti i dati con la passphrase attuale. Non ho cambiato nulla.',
    );
  }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const newKey = await deriveKey(newPassphrase, salt, ITERATIONS);
    const verifier = await encryptJson(newKey, { magic: VERIFIER_MAGIC }, 'verifier');

    const encryptedSessions: EncryptedSession[] = [];
    for (const session of sessions) {
      const encrypted = await encryptJson(newKey, session, `session:${session.id}`);
      encryptedSessions.push({ id: session.id, ...encrypted });
    }

    const encryptedRecordings: EncryptedRecording[] = [];
    for (const recording of recordings) {
      const { blob, ...rest } = recording;
      const payload = { ...rest, mimeType: blob.type || 'audio/webm' };
      const encryptedMeta = await encryptJson(newKey, payload, `recording-meta:${recording.id}`);
      const encryptedAudio = await encryptBlob(newKey, blob, `recording-audio:${recording.id}`);
      encryptedRecordings.push({
        id: recording.id,
        metaIv: encryptedMeta.iv,
        metaCipher: encryptedMeta.cipher,
        audioIv: encryptedAudio.iv,
        audioCipher: encryptedAudio.cipher,
      });
    }

    const encryptedStories: EncryptedStory[] = [];
    for (const story of stories) {
      const encrypted = await encryptJson(newKey, story, `story:${story.id}`);
      encryptedStories.push({ id: story.id, ...encrypted });
    }

    const encryptedRecords: EncryptedRecord[] = [];
    for (const record of records) {
      const encrypted = await encryptJson(newKey, record.value, `${record.kind}:${record.id}`);
      encryptedRecords.push({ id: record.id, kind: record.kind, ...encrypted });
    }

    const nextMeta: VaultMeta = {
      ...meta,
      salt,
      iterations: ITERATIONS,
      verifierIv: verifier.iv,
      verifierCipher: verifier.cipher,
    };

    await db.transaction(
      'rw',
      [db.vault, db.sessionsEnc, db.recordingsEnc, db.storiesEnc, db.recordsEnc],
      async () => {
        await db.vault.put(nextMeta);
        await db.sessionsEnc.clear();
        await db.recordingsEnc.clear();
        await db.storiesEnc.clear();
        await db.recordsEnc.clear();
        if (encryptedSessions.length > 0) await db.sessionsEnc.bulkPut(encryptedSessions);
        if (encryptedRecordings.length > 0) await db.recordingsEnc.bulkPut(encryptedRecordings);
        if (encryptedStories.length > 0) await db.storiesEnc.bulkPut(encryptedStories);
        if (encryptedRecords.length > 0) await db.recordsEnc.bulkPut(encryptedRecords);
      },
    );

    vaultKey = newKey;
    return {
      sessions: encryptedSessions.length,
      recordings: encryptedRecordings.length,
      stories: encryptedStories.length,
      records: encryptedRecords.length,
    };
  } catch (error) {
    if (error instanceof VaultError) throw error;
    throw new VaultError(
      'storage',
      'Non riesco a salvare la nuova passphrase. L’archivio è rimasto con quella attuale.',
    );
  }
}

export function lockVault(): void {
  vaultKey = null;
}

export async function saveSession(metric: SessionMetric): Promise<boolean> {
  const key = vaultKey;
  if (!key) return false;
  try {
    const encrypted = await encryptJson(key, metric, `session:${metric.id}`);
    const row: EncryptedSession = { id: metric.id, ...encrypted };
    await db.sessionsEnc.put(row);
    return true;
  } catch {
    return false;
  }
}

export async function loadSessions(): Promise<SessionMetric[]> {
  const key = vaultKey;
  if (!key) return [];
  try {
    const rows = await db.sessionsEnc.toArray();
    const sessions: SessionMetric[] = [];
    for (const row of rows) {
      try {
        sessions.push(await decryptJson<SessionMetric>(key, row.iv, row.cipher, `session:${row.id}`));
      } catch {
        /* record illeggibile (chiave diversa o corruzione): lo si ignora */
      }
    }
    return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  } catch {
    return [];
  }
}

export async function saveRecording(recording: RecordingMeta): Promise<boolean> {
  const key = vaultKey;
  if (!key) return false;
  try {
    const { blob, ...meta } = recording;
    const payload = { ...meta, mimeType: blob.type || 'audio/webm' };
    const encryptedMeta = await encryptJson(key, payload, `recording-meta:${recording.id}`);
    const encryptedAudio = await encryptBlob(key, blob, `recording-audio:${recording.id}`);
    const row: EncryptedRecording = {
      id: recording.id,
      metaIv: encryptedMeta.iv,
      metaCipher: encryptedMeta.cipher,
      audioIv: encryptedAudio.iv,
      audioCipher: encryptedAudio.cipher,
    };
    await db.recordingsEnc.put(row);
    return true;
  } catch {
    return false;
  }
}

async function decryptRecordingRow(key: CryptoKey, row: EncryptedRecording): Promise<RecordingMeta> {
  const meta = await decryptJson<Omit<RecordingMeta, 'blob'> & { mimeType?: string }>(
    key,
    row.metaIv,
    row.metaCipher,
    `recording-meta:${row.id}`,
  );
  const audio = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: row.audioIv,
      additionalData: bytes(`recording-audio:${row.id}`),
    },
    key,
    row.audioCipher,
  );
  const { mimeType, ...rest } = meta;
  return {
    ...rest,
    blob: new Blob([audio], { type: mimeType ?? 'audio/webm' }),
  };
}

/** Verifica la passphrase senza cambiare la chiave in memoria (area adulti). */
export async function verifyPassphrase(passphrase: string): Promise<boolean> {
  requireCrypto();
  try {
    const meta = await db.vault.get(VAULT_ID);
    if (!meta) return false;
    const key = await deriveKey(passphrase, meta.salt, meta.iterations);
    const payload = await decryptJson<{ magic: string }>(key, meta.verifierIv, meta.verifierCipher, 'verifier');
    return payload.magic === VERIFIER_MAGIC;
  } catch {
    return false;
  }
}

export async function saveStory(story: SocialStory): Promise<boolean> {
  const key = vaultKey;
  if (!key) return false;
  try {
    const encrypted = await encryptJson(key, story, `story:${story.id}`);
    await db.storiesEnc.put({ id: story.id, ...encrypted });
    return true;
  } catch {
    return false;
  }
}

export async function loadStories(): Promise<SocialStory[]> {
  const key = vaultKey;
  if (!key) return [];
  try {
    const rows = await db.storiesEnc.toArray();
    const stories: SocialStory[] = [];
    for (const row of rows) {
      try {
        stories.push(await decryptJson<SocialStory>(key, row.iv, row.cipher, `story:${row.id}`));
      } catch {
        /* storia illeggibile: la si ignora, senza cancellarla */
      }
    }
    return stories.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function deleteStory(id: string): Promise<void> {
  try {
    await db.storiesEnc.delete(id);
  } catch {
    /* nulla da eliminare */
  }
}

export async function loadRecordings(): Promise<RecordingMeta[]> {
  const key = vaultKey;
  if (!key) return [];
  try {
    const rows = await db.recordingsEnc.toArray();
    const recordings: RecordingMeta[] = [];
    for (const row of rows) {
      try {
        recordings.push(await decryptRecordingRow(key, row));
      } catch {
        /* ignora il campione illeggibile */
      }
    }
    return recordings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

/* ---------------------------------------------------------------- */
/* Area adulti: diario, obiettivi, agende                           */
/* ---------------------------------------------------------------- */

interface RecordTypes {
  diary: DiaryEntry;
  goal: SharedGoal;
  schedule: VisualSchedule;
}

export async function saveRecord<Kind extends RecordKind>(kind: Kind, value: RecordTypes[Kind]): Promise<boolean> {
  const key = vaultKey;
  if (!key) return false;
  try {
    const encrypted = await encryptJson(key, value, `${kind}:${value.id}`);
    await db.recordsEnc.put({ id: value.id, kind, ...encrypted });
    return true;
  } catch {
    return false;
  }
}

/** Salva più record insieme (importazione): tutto o niente. */
export async function saveRecords(
  items: { kind: RecordKind; value: DiaryEntry | SharedGoal | VisualSchedule }[],
): Promise<boolean> {
  const key = vaultKey;
  if (!key) return false;
  try {
    const rows: EncryptedRecord[] = [];
    for (const item of items) {
      const encrypted = await encryptJson(key, item.value, `${item.kind}:${item.value.id}`);
      rows.push({ id: item.value.id, kind: item.kind, ...encrypted });
    }
    if (rows.length > 0) await db.recordsEnc.bulkPut(rows);
    return true;
  } catch {
    return false;
  }
}

export async function loadRecords<Kind extends RecordKind>(kind: Kind): Promise<RecordTypes[Kind][]> {
  const key = vaultKey;
  if (!key) return [];
  try {
    const rows = await db.recordsEnc.where('kind').equals(kind).toArray();
    const values: RecordTypes[Kind][] = [];
    for (const row of rows) {
      try {
        values.push(await decryptJson<RecordTypes[Kind]>(key, row.iv, row.cipher, `${kind}:${row.id}`));
      } catch {
        /* record illeggibile: lo si ignora senza cancellarlo */
      }
    }
    return values;
  } catch {
    return [];
  }
}

export async function deleteRecord(id: string): Promise<void> {
  try {
    await db.recordsEnc.delete(id);
  } catch {
    /* nulla da eliminare */
  }
}

/** Cancella dati cifrati, dati legacy e metadati della cassaforte. */
export async function clearAllData(): Promise<void> {
  vaultKey = null;
  try {
    await db.transaction(
      'rw',
      [
        db.sessions,
        db.recordings,
        db.sessionsEnc,
        db.recordingsEnc,
        db.storiesEnc,
        db.recordsEnc,
        db.caaSymbols,
        db.vault,
      ],
      async () => {
        await db.sessions.clear();
        await db.recordings.clear();
        await db.sessionsEnc.clear();
        await db.recordingsEnc.clear();
        await db.storiesEnc.clear();
        await db.recordsEnc.clear();
        await db.caaSymbols.clear();
        await db.vault.clear();
      },
    );
  } catch {
    /* nulla da cancellare */
  }
}
