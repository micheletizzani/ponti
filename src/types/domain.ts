/**
 * Modello dati di dominio.
 * I nomi delle metriche sono allineati alle risorse FHIR R4/R5
 * (Patient, CarePlan, Observation, Goal) per una futura mappatura clinica.
 */

export type ModuleId = 'matrici' | 'sintassi' | 'ritmo' | 'racconto' | 'sociale' | 'storie';

/** Livelli di fading: 1 = guida completa, 4 = self-talk autonomo. */
export type ScaffoldLevel = 1 | 2 | 3 | 4;

export type TextSize = 's' | 'm' | 'l';
/** Serve solo all'accordo grammaticale italiano (stanco/stanca). 'n' = non indicato. */
export type ChildGender = 'f' | 'm' | 'n';
/** Chi scrive nell'area adulti. Non è un controllo di sicurezza: è un'etichetta. */
export type AdultRole = 'famiglia' | 'scuola';
export type ContrastMode = 'soft' | 'high';
export type MotionMode = 'full' | 'calm';

export interface UserProfile {
  id: string;
  displayName: string;
  /** Anno di nascita: utile per il clinico, mai mostrato al bambino. */
  bornYear: number | null;
  role: 'child' | 'caregiver' | 'clinician';
  /** Solo per l'accordo grammaticale dei testi rivolti al bambino o alla bambina. */
  gender: ChildGender;
  /** Interessi dichiarati: alimentano il Social Deck. */
  interests: string[];
  createdAt: string;
}

export interface Preferences {
  textSize: TextSize;
  contrast: ContrastMode;
  motion: MotionMode;
  /** Velocità della sintesi vocale: lenta per default. */
  voiceRate: number;
  voiceEnabled: boolean;
  /** Pannello co-learning visibile accanto al compito. */
  dualUser: boolean;
  /** Blocco input durante la spiegazione vocale (ms). */
  inputLockMs: number;
}

export interface SessionMetric {
  id: string;
  profileId: string;
  moduleId: ModuleId;
  startedAt: string;
  endedAt: string;
  /** Prove completate nella sessione. */
  items: number;
  correct: number;
  /** Latenza media stimolo → prima interazione (ms). */
  latencyMs: number | null;
  scaffoldLevel: ScaffoldLevel;
  /** Accuratezza su frasi reversibili, 0–1. */
  reversibleAccuracy?: number;
  /** Stima dell'indice di segregazione sillabica, 0–1. */
  syllableSegregationIndex?: number;
  notes?: string;
}

export interface RecordingMeta {
  id: string;
  sessionId: string;
  moduleId: ModuleId;
  createdAt: string;
  durationMs: number;
  /** Inviluppo di ampiezza normalizzato (64 campioni) per la revisione visiva. */
  peaks: number[];
  /** Stima SSI: rapporto tra pausa più lunga e durata della produzione. */
  ssi: number | null;
  blob: Blob;
}

/* ---------------------------------------------------------------- */
/* Sintassi dinamica                                                */
/* ---------------------------------------------------------------- */

export type SyntaxRole = 'agent' | 'verb' | 'patient' | 'place';
export type SentenceForm = 'active' | 'passive';
export type CharacterId = 'gatto' | 'cane' | 'topo' | 'bimba' | 'bimbo';
export type ActionId = 'inseguire' | 'spingere' | 'salutare';

export interface SyntaxNode {
  id: string;
  text: string;
  role: SyntaxRole;
}

export interface SyntaxRound {
  id: string;
  /** Domanda guida mostrata in alto, una sola. */
  question: string;
  agent: CharacterId;
  patient: CharacterId;
  action: ActionId;
  verbActive: string;
  verbPassive: string;
  /** Descrizione breve del contrasto per il clinico. */
  note: string;
}

/* ---------------------------------------------------------------- */
/* Matrix-Talk                                                      */
/* ---------------------------------------------------------------- */

export type ShapeName = 'cerchio' | 'quadrato' | 'triangolo';
export type ColorName = 'rosso' | 'blu' | 'giallo' | 'verde';

export interface MatrixCell {
  shape: ShapeName;
  color: ColorName;
}

export interface MatrixOption extends MatrixCell {
  id: string;
  correct: boolean;
  /** Perché l'opzione non completa la regola: spiegazione neutra. */
  reason: string;
}

export interface MatrixRound {
  id: string;
  cells: [MatrixCell, MatrixCell, MatrixCell, null];
  options: MatrixOption[];
  /** Regola in linguaggio semplice, usata dallo scaffolding di livello 1. */
  rule: string;
  questionL2: string;
  cue: string;
}

/* ---------------------------------------------------------------- */
/* Speech Pacer                                                     */
/* ---------------------------------------------------------------- */

export interface PacerStimulus {
  id: string;
  syllables: { text: string; stressed: boolean }[];
  label: string;
  hint: string;
  /** Gruppo mostrato all'adulto: sillabe senza significato o parole vere. */
  group: 'sillabe' | 'parole';
  /** Testo per la sintesi vocale, con l'accento grafico quando serve (papà). */
  model?: string;
}

/* ---------------------------------------------------------------- */
/* Narrative Weaver                                                 */
/* ---------------------------------------------------------------- */

export type ConnectiveId = 'prima' | 'dopo' | 'perche' | 'quindi';

export interface StoryFrame {
  id: string;
  caption: string;
  art: 'rain' | 'umbrella' | 'sun' | 'dog' | 'bowl' | 'dog-happy' | 'tower' | 'tower-fallen' | 'bell' | 'door';
}

export interface Story {
  id: string;
  title: string;
  frames: [StoryFrame, StoryFrame, StoryFrame];
  /** Connettivo atteso tra frame 1→2 e 2→3. */
  links: [ConnectiveId, ConnectiveId];
  /**
   * Spiegazioni specifiche per legame: sostituiscono quelle generiche quando
   * il motivo per cui una tessera non va dipende dalla storia.
   */
  reasons?: [Partial<Record<ConnectiveId, string>>, Partial<Record<ConnectiveId, string>>];
}

/* ---------------------------------------------------------------- */
/* Storie sociali (Modulo 06)                                      */
/* ---------------------------------------------------------------- */

export type StorySentenceType = 'descriptive' | 'perspective' | 'coaching' | 'affirmative';
export type StoryCategory =
  | 'social_interaction'
  | 'speech_regulation'
  | 'emotional_coping'
  | 'daily_routines';

export type StorySymbolKey =
  | 'bambina'
  | 'zaino'
  | 'mangiare'
  | 'bagno'
  | 'gioco'
  | 'libro'
  | 'musica'
  | 'disegno'
  | 'giardino'
  | 'casa'
  | 'auto'
  | 'letto'
  | 'cuffie'
  | 'pausa'
  | 'logopedia'
  | 'cerchio'
  | 'vestirsi'
  | 'denti'
  | 'aiuto'
  | 'palla'
  | 'treno'
  | 'respiro'
  | 'tablet'
  | 'agenda'
  | 'pallamorbida'
  | 'maestra'
  | 'bambino'
  | 'scuola'
  | 'parole'
  | 'famiglia'
  | 'cane';

export type StoryVisual =
  | { type: 'symbol'; key: StorySymbolKey; altText: string }
  | { type: 'photo'; dataUrl: string; altText: string }
  | {
      type: 'aac';
      id: string;
      label: string;
      /** Immagine incorporata: il player non deve mai richiederla alla rete. */
      dataUrl: string;
      altText: string;
      source: 'arasaac';
    };

export type StoryNarration =
  | { type: 'tts' }
  | { type: 'recorded'; dataUrl: string; mimeType: string };

export interface SocialStoryScene {
  id: string;
  sentenceType: StorySentenceType;
  text: string;
  visual: StoryVisual;
  narration: StoryNarration;
  /** Parole da evidenziare mentre si legge o si ascolta. */
  highlightKeywords: string[];
}

export interface SocialStoryCheckOption {
  id: string;
  text: string;
  correct: boolean;
  /** Spiegazione neutra: nessun rimprovero, nessun suono di errore. */
  feedback: string;
}

export interface SocialStoryCheck {
  question: string;
  options: SocialStoryCheckOption[];
}

/**
 * Storia sociale secondo i criteri Gray 10.2: le frasi sono tipizzate e il
 * rapporto tra frasi che descrivono e frasi di guida è calcolato, non stimato.
 */
export interface SocialStory {
  id: string;
  title: string;
  category: StoryCategory;
  protagonist: string;
  /** Obiettivo sociale o didattico, in linguaggio semplice, per l'adulto. */
  goal: string;
  createdAt: string;
  updatedAt: string;
  scenes: SocialStoryScene[];
  check?: SocialStoryCheck;
  /** Solo per le tre storie precaricate: non vengono salvate nella cassaforte. */
  native?: boolean;
}

/* ---------------------------------------------------------------- */
/* Area adulti: diario scuola-casa, obiettivi condivisi, agende      */
/* ---------------------------------------------------------------- */

export type DiaryMood = 'bene' | 'stanchezza' | 'agitazione' | 'difficile';

/** Un momento della giornata, scritto in prima persona per il racconto del bambino. */
export interface DiaryMoment {
  id: string;
  symbol: StorySymbolKey;
  text: string;
}

export interface DiaryEntry {
  id: string;
  /** Giorno a cui si riferisce la nota (AAAA-MM-GG). */
  date: string;
  author: AdultRole;
  /** Come si firma l'adulto: «Maestra Anna», «Papà». Facoltativo. */
  authorName: string;
  mood: DiaryMood | null;
  /** Al massimo tre momenti, in ordine: diventano PRIMA, POI, ALLA FINE. */
  moments: DiaryMoment[];
  /** Una cosa bella, da raccontare. */
  highlight: string;
  /** Parole o frasi nuove dette dal bambino. */
  childWords: string;
  /** Segnalazioni rapide (sonno, appetito, cambi di programma…). */
  flags: string[];
  /** Cosa deve sapere l'altro adulto. */
  forOther: string;
  createdAt: string;
  updatedAt: string;
}

/** Le quattro dimensioni del modello nazionale di PEI (D.I. 182/2020). */
export type PeiDimension = 'relazione' | 'comunicazione' | 'autonomia' | 'apprendimento';

export interface GoalObservation {
  id: string;
  date: string;
  author: AdultRole;
  /** Stessa scala dell'app: 1 guida piena … 4 in autonomia. */
  level: ScaffoldLevel;
  note: string;
}

export interface SharedGoal {
  id: string;
  /** Obiettivo preso dalla libreria: permette di non duplicarlo. */
  presetId?: string;
  title: string;
  dimension: PeiDimension;
  /** Attività di Ponti collegata, se esiste. */
  activityPath: string | null;
  /** Come aiutare: una strategia concreta, uguale a casa e a scuola. */
  strategy: string;
  createdBy: AdultRole;
  status: 'attivo' | 'raggiunto' | 'in-pausa';
  observations: GoalObservation[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleStep {
  id: string;
  label: string;
  visual: StoryVisual;
}

export interface VisualSchedule {
  id: string;
  title: string;
  context: 'casa' | 'scuola';
  steps: ScheduleStep[];
  /** Agende pronte: vivono nel codice, non nella cassaforte. */
  native?: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ---------------------------------------------------------------- */
/* Stato esercizio (predisposto a una macchina a stati)             */
/* ---------------------------------------------------------------- */

export interface ExerciseState {
  moduleId: ModuleId;
  stepIndex: number;
  totalSteps: number;
  scaffoldLevel: ScaffoldLevel;
  attempts: number;
  /** Timestamp del primo tocco, per la latenza. */
  firstInteractionAt: number | null;
  promptShownAt: number;
  /** Blocco input durante l'audio-guida (errorless + anti-tapping). */
  lockedUntil: number | null;
}
