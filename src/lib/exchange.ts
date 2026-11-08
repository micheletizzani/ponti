import type { DiaryEntry, SharedGoal, VisualSchedule, AdultRole } from '../types/domain';

/**
 * Scambio casa-scuola senza server.
 *
 * Famiglia e scuola usano spesso due dispositivi diversi. Ponti non ha un
 * server: il passaggio avviene con un file cifrato con AES-256-GCM, la cui
 * chiave nasce da una «parola di scambio» concordata a voce (PBKDF2-SHA-256,
 * 310.000 iterazioni, salt casuale). Il file può viaggiare per email o
 * chiavetta: senza la parola non si legge.
 */

const FORMAT = 'ponti-scambio';
const VERSION = 1;
const ITERATIONS = 310_000;
const MIN_WORD = 8;

export interface ExchangePayload {
  magic: typeof FORMAT;
  version: number;
  createdAt: string;
  from: AdultRole;
  diary: DiaryEntry[];
  goals: SharedGoal[];
  schedules: VisualSchedule[];
}

interface ExchangeFile {
  format: typeof FORMAT;
  version: number;
  salt: string;
  iterations: number;
  iv: string;
  cipher: string;
}

export class ExchangeError extends Error {}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function keyFrom(word: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(word.normalize('NFKC')),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export function validateExchangeWord(word: string): string | null {
  if (word.trim().length < MIN_WORD) return `La parola di scambio deve avere almeno ${MIN_WORD} caratteri.`;
  return null;
}

export async function createExchangeFile(payload: Omit<ExchangePayload, 'magic' | 'version' | 'createdAt'>, word: string) {
  const problem = validateExchangeWord(word);
  if (problem) throw new ExchangeError(problem);
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new ExchangeError('La cifratura richiede una pagina sicura (https).');
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFrom(word, salt, ITERATIONS);
  const full: ExchangePayload = { magic: FORMAT, version: VERSION, createdAt: new Date().toISOString(), ...payload };
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(FORMAT) },
    key,
    new TextEncoder().encode(JSON.stringify(full)),
  );
  const file: ExchangeFile = {
    format: FORMAT,
    version: VERSION,
    salt: toBase64(salt),
    iterations: ITERATIONS,
    iv: toBase64(iv),
    cipher: toBase64(new Uint8Array(cipher)),
  };
  return new Blob([JSON.stringify(file)], { type: 'application/json' });
}

export async function readExchangeFile(text: string, word: string): Promise<ExchangePayload> {
  let file: ExchangeFile;
  try {
    file = JSON.parse(text) as ExchangeFile;
  } catch {
    throw new ExchangeError('Questo file non è un pacchetto di scambio di Ponti.');
  }
  if (file.format !== FORMAT || typeof file.cipher !== 'string') {
    throw new ExchangeError('Questo file non è un pacchetto di scambio di Ponti.');
  }
  if (file.version > VERSION) {
    throw new ExchangeError('Il pacchetto viene da una versione più nuova di Ponti. Aggiorna l’app e riprova.');
  }
  try {
    const key = await keyFrom(word, fromBase64(file.salt), file.iterations);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(file.iv), additionalData: new TextEncoder().encode(FORMAT) },
      key,
      fromBase64(file.cipher),
    );
    const payload = JSON.parse(new TextDecoder().decode(plain)) as ExchangePayload;
    if (payload.magic !== FORMAT) throw new Error('magic');
    return {
      ...payload,
      diary: Array.isArray(payload.diary) ? payload.diary : [],
      goals: Array.isArray(payload.goals) ? payload.goals : [],
      schedules: Array.isArray(payload.schedules) ? payload.schedules : [],
    };
  } catch {
    throw new ExchangeError('Non riesco ad aprire il pacchetto: la parola di scambio non è quella giusta.');
  }
}

export interface MergeResult<T> {
  toSave: T[];
  added: number;
  updated: number;
  unchanged: number;
}

/** Vince la versione modificata più di recente. Nessun record viene cancellato. */
export function mergeLatest<T extends { id: string; updatedAt: string }>(local: T[], incoming: T[]): MergeResult<T> {
  const byId = new Map(local.map((item) => [item.id, item]));
  const toSave: T[] = [];
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  for (const item of incoming) {
    const current = byId.get(item.id);
    if (!current) {
      toSave.push(item);
      added += 1;
    } else if (item.updatedAt > current.updatedAt) {
      toSave.push(item);
      updated += 1;
    } else {
      unchanged += 1;
    }
  }
  return { toSave, added, updated, unchanged };
}

/**
 * Gli obiettivi si arricchiscono da due parti: le osservazioni di casa e di
 * scuola si sommano (per id), i campi descrittivi seguono la versione più recente.
 */
export function mergeGoals(local: SharedGoal[], incoming: SharedGoal[]): MergeResult<SharedGoal> {
  const byId = new Map(local.map((goal) => [goal.id, goal]));
  const toSave: SharedGoal[] = [];
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  for (const goal of incoming) {
    const current = byId.get(goal.id);
    if (!current) {
      toSave.push(goal);
      added += 1;
      continue;
    }
    const observations = new Map(current.observations.map((item) => [item.id, item]));
    let newObservations = 0;
    for (const observation of goal.observations) {
      if (!observations.has(observation.id)) {
        observations.set(observation.id, observation);
        newObservations += 1;
      }
    }
    const newer = goal.updatedAt > current.updatedAt ? goal : current;
    if (newObservations === 0 && newer === current) {
      unchanged += 1;
      continue;
    }
    const merged: SharedGoal = {
      ...newer,
      observations: [...observations.values()].sort((a, b) => a.date.localeCompare(b.date)),
      updatedAt: newer.updatedAt > current.updatedAt ? newer.updatedAt : current.updatedAt,
    };
    toSave.push(merged);
    updated += 1;
  }
  return { toSave, added, updated, unchanged };
}
