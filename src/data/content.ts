import type {
  CharacterId,
  MatrixRound,
  ModuleId,
  PacerStimulus,
  Story,
  SyntaxRound,
} from '../types/domain';

export interface ModuleInfo {
  id: ModuleId;
  path: string;
  name: string;
  kicker: string;
  short: string;
  trains: string;
}

export const MODULES: ModuleInfo[] = [
  {
    id: 'sintassi',
    path: '/app/sintassi',
    name: 'Sintassi dinamica',
    kicker: 'Modulo 02',
    short: 'Componi la frase e guarda la scena cambiare. Attivo e passivo, senza ambiguità.',
    trains: 'Ruoli di agente e paziente, frasi reversibili',
  },
  {
    id: 'matrici',
    path: '/app/matrici',
    name: 'Matrix-Talk',
    kicker: 'Modulo 01',
    short: 'Una matrice da completare, con una voce che ti dice dove guardare. Poi sempre meno aiuto.',
    trains: 'Ragionamento logico-visivo, self-talk',
  },
  {
    id: 'ritmo',
    path: '/app/ritmo',
    name: 'Ritmo e sillabe',
    kicker: 'Modulo 03',
    short: 'Un’onda continua su cui appoggiare le sillabe, senza pause tra una e l’altra.',
    trains: 'Coarticolazione, accento prosodico',
  },
  {
    id: 'racconto',
    path: '/app/racconto',
    name: 'Trama e nessi',
    kicker: 'Modulo 04',
    short: 'Tre quadri da collegare con le parole giuste: prima, dopo, perché, quindi.',
    trains: 'Nessi causali e temporali, memoria di lavoro',
  },
  {
    id: 'sociale',
    path: '/app/sociale',
    name: 'Social Deck',
    kicker: 'Modulo 05',
    short: 'Scegli un argomento che ti piace e una frase pronta per iniziare a parlare con qualcuno.',
    trains: 'Avvio del dialogo, ancoraggio sociale',
  },
  {
    id: 'storie',
    path: '/app/storie',
    name: 'Storie sociali',
    kicker: 'Modulo 06',
    short: 'Una storia da sfogliare con l’adulto, con la voce vera e una domanda finale.',
    trains: 'Comprensione sociale, flessibilità, autonomia',
  },
];

export function moduleInfo(id: ModuleId): ModuleInfo {
  return MODULES.find((module) => module.id === id) ?? MODULES[0]!;
}

/* ------------------------------------------------------------------ */
/* Personaggi e scene                                                  */
/* ------------------------------------------------------------------ */

export const CHARACTER_NAMES: Record<CharacterId, string> = {
  gatto: 'il gatto',
  cane: 'il cane',
  topo: 'il topo',
  bimba: 'la bambina',
  bimbo: 'il bambino',
};

export const SYNTAX_ROUNDS: SyntaxRound[] = [
  {
    id: 'gatto-topo',
    question: 'Chi insegue chi?',
    agent: 'gatto',
    patient: 'topo',
    action: 'inseguire',
    verbActive: 'insegue',
    verbPassive: 'è inseguito da',
    note: 'Coppia reversibile con lessico simmetrico: la frase passiva mantiene la scena.',
  },
  {
    id: 'cane-gatto',
    question: 'Chi spinge chi?',
    agent: 'cane',
    patient: 'gatto',
    action: 'spingere',
    verbActive: 'spinge',
    verbPassive: 'è spinto da',
    note: 'Verbo con participio irregolare: utile per il controllo morfologico.',
  },
  {
    id: 'bimba-bimbo',
    question: 'Chi saluta chi?',
    agent: 'bimba',
    patient: 'bimbo',
    action: 'salutare',
    verbActive: 'saluta',
    verbPassive: 'è salutato da',
    note: 'Azione reciproca solo in apparenza: i ruoli restano distinti.',
  },
  {
    id: 'topo-cane',
    question: 'E adesso chi insegue chi?',
    agent: 'topo',
    patient: 'cane',
    action: 'inseguire',
    verbActive: 'insegue',
    verbPassive: 'è inseguito da',
    note: 'Inversione inattesa: rompe l’euristica “il primo nome compie l’azione”.',
  },
];

/* ------------------------------------------------------------------ */
/* Matrix-Talk                                                         */
/* ------------------------------------------------------------------ */

export const MATRIX_ROUNDS: MatrixRound[] = [
  {
    id: 'quadrato-colore',
    cells: [
      { shape: 'quadrato', color: 'rosso' },
      { shape: 'quadrato', color: 'blu' },
      { shape: 'cerchio', color: 'rosso' },
      null,
    ],
    options: [
      {
        id: 'cerchio-blu',
        shape: 'cerchio',
        color: 'blu',
        correct: true,
        reason: 'Cerchio come quello sotto, blu come quello a destra.',
      },
      {
        id: 'triangolo-blu',
        shape: 'triangolo',
        color: 'blu',
        correct: false,
        reason: 'Il colore è giusto, ma la forma in basso è un cerchio.',
      },
      {
        id: 'cerchio-verde',
        shape: 'cerchio',
        color: 'verde',
        correct: false,
        reason: 'La forma è giusta, ma nella riga in alto il blu prende il posto del rosso.',
      },
    ],
    rule: 'Nella riga in alto la forma resta uguale e cambia il colore. In basso c’è un cerchio rosso: il quadrato mancante è un cerchio blu.',
    questionL2: 'Guarda la forma: come cambia? E il colore?',
    cue: 'Forma: cerchio. Colore: blu.',
  },
  {
    id: 'forma-giallo',
    cells: [
      { shape: 'cerchio', color: 'giallo' },
      { shape: 'triangolo', color: 'giallo' },
      { shape: 'cerchio', color: 'verde' },
      null,
    ],
    options: [
      {
        id: 'triangolo-verde',
        shape: 'triangolo',
        color: 'verde',
        correct: true,
        reason: 'La forma segue la colonna di destra, il colore segue la riga in basso.',
      },
      {
        id: 'cerchio-verde',
        shape: 'cerchio',
        color: 'verde',
        correct: false,
        reason: 'Il colore è giusto, ma la forma in alto a destra è un triangolo.',
      },
      {
        id: 'triangolo-giallo',
        shape: 'triangolo',
        color: 'giallo',
        correct: false,
        reason: 'La forma è giusta, ma il giallo è il colore della riga in alto.',
      },
    ],
    rule: 'In alto i colori sono tutti gialli, quindi anche in basso resta il verde. La forma cambia da cerchio a triangolo. Il pezzo mancante è un triangolo verde.',
    questionL2: 'Che colore ha la riga in basso? Che forma ha la colonna a destra?',
    cue: 'Triangolo. Verde.',
  },
  {
    id: 'quadrato-rosso',
    cells: [
      { shape: 'quadrato', color: 'blu' },
      { shape: 'cerchio', color: 'blu' },
      { shape: 'quadrato', color: 'rosso' },
      null,
    ],
    options: [
      {
        id: 'cerchio-rosso',
        shape: 'cerchio',
        color: 'rosso',
        correct: true,
        reason: 'La colonna a destra cambia forma, la riga in basso cambia colore.',
      },
      {
        id: 'quadrato-rosso',
        shape: 'quadrato',
        color: 'rosso',
        correct: false,
        reason: 'Il colore è giusto, ma in basso la forma non resta quadrata.',
      },
      {
        id: 'cerchio-blu',
        shape: 'cerchio',
        color: 'blu',
        correct: false,
        reason: 'La forma è giusta, ma il colore della riga in basso è rosso.',
      },
    ],
    rule: 'La riga in alto è tutta blu. La riga in basso è tutta rossa. La forma cambia: quadrato, poi cerchio. Serve un cerchio rosso.',
    questionL2: 'Il colore della riga in basso: quale è? E la forma della colonna a destra?',
    cue: 'Cerchio. Rosso.',
  },
];

/* ------------------------------------------------------------------ */
/* Speech Pacer                                                        */
/* ------------------------------------------------------------------ */

export const PACER_STIMULI: PacerStimulus[] = [
  {
    id: 'ba-ba',
    syllables: [
      { text: 'BA', stressed: true },
      { text: 'ba', stressed: false },
    ],
    label: 'BA-ba',
    hint: 'Grande, poi piccolo. La voce non si ferma.',
  },
  {
    id: 'ba-ba-inv',
    syllables: [
      { text: 'ba', stressed: false },
      { text: 'BA', stressed: true },
    ],
    label: 'ba-BA',
    hint: 'Piccolo, poi grande: l’accento va alla fine.',
  },
  {
    id: 'to-ki',
    syllables: [
      { text: 'TO', stressed: true },
      { text: 'ki', stressed: false },
    ],
    label: 'TO-ki',
    hint: 'Suono nuovo, stesso ritmo: grande, poi piccolo.',
  },
  {
    id: 'ma-ta-ka',
    syllables: [
      { text: 'MA', stressed: true },
      { text: 'ta', stressed: false },
      { text: 'ka', stressed: false },
    ],
    label: 'MA-ta-ka',
    hint: 'Tre sillabe legate: una grande e due piccole.',
  },
];

/* ------------------------------------------------------------------ */
/* Narrative Weaver                                                    */
/* ------------------------------------------------------------------ */

export const STORIES: Story[] = [
  {
    id: 'pioggia',
    title: 'La pioggia e l’ombrello',
    frames: [
      { id: 'rain', caption: 'Ha iniziato a piovere.', art: 'rain' },
      { id: 'umbrella', caption: 'La bambina ha aperto l’ombrello.', art: 'umbrella' },
      { id: 'sun', caption: 'È uscito il sole.', art: 'sun' },
    ],
    links: ['quindi', 'dopo'],
  },
  {
    id: 'cane',
    title: 'Il cane con sete',
    frames: [
      { id: 'dog', caption: 'Il cane aveva sete.', art: 'dog' },
      { id: 'bowl', caption: 'Ha bevuto tutta l’acqua.', art: 'bowl' },
      { id: 'dog-happy', caption: 'Si è sentito meglio.', art: 'dog-happy' },
    ],
    links: ['quindi', 'dopo'],
  },
];

/* ------------------------------------------------------------------ */
/* Social Deck                                                         */
/* ------------------------------------------------------------------ */

export interface SocialTopic {
  id: string;
  label: string;
  script: string;
  adultPrompt: string;
  icon: 'dino' | 'train' | 'cat' | 'pencil' | 'music' | 'wave';
}

export const SOCIAL_TOPICS: SocialTopic[] = [
  {
    id: 'dinosauri',
    label: 'Dinosauri',
    script: 'Oggi ho pensato ai dinosauri. Il mio preferito è il triceratopo. Qual è il tuo?',
    adultPrompt: 'Rispondi con un dinosauro che conosci e chiedi: «perché ti piace?».',
    icon: 'dino',
  },
  {
    id: 'treni',
    label: 'Treni',
    script: 'I treni veloci mi piacciono molto. Io ho visto il Frecciarossa. Tu quale treno conosci?',
    adultPrompt: 'Nomina un treno o un viaggio. Poi lascia spazio alla risposta.',
    icon: 'train',
  },
  {
    id: 'animali',
    label: 'Animali',
    script: 'Il mio animale preferito è il gatto. Mi piace quando fa le fusa. A te piacciono i gatti?',
    adultPrompt: 'Racconta un animale che ti piace e perché.',
    icon: 'cat',
  },
  {
    id: 'disegno',
    label: 'Disegno',
    script: 'Ho fatto un disegno con tanti colori. Vuoi vederlo? Cosa disegni tu?',
    adultPrompt: 'Chiedi di mostrarti il disegno e descrivi cosa vedi.',
    icon: 'pencil',
  },
  {
    id: 'musica',
    label: 'Musica',
    script: 'Sto ascoltando una canzone che mi piace. Posso cantartela piano. Qual è la tua canzone?',
    adultPrompt: 'Canta un pezzo della tua canzone preferita, anche solo due parole.',
    icon: 'music',
  },
  {
    id: 'nuoto',
    label: 'Nuoto',
    script: 'In piscina mi piace fare le bolle nell’acqua. Sai fare le bolle anche tu?',
    adultPrompt: 'Racconta cosa fai in acqua e fai una domanda aperta.',
    icon: 'wave',
  },
];

export const CONNECTIVE_LABELS = {
  prima: 'PRIMA',
  dopo: 'DOPO',
  perche: 'PERCHÉ',
  quindi: 'QUINDI',
} as const;

export const CONNECTIVE_REASONS = {
  prima: 'PRIMA fa tornare indietro nel tempo. Qui la storia va avanti.',
  dopo: 'Qui una cosa non viene dopo l’altra: una cosa accade perché è successa l’altra.',
  perche: 'PERCHÉ va bene se la causa arriva dopo. Qui la causa è già nel primo quadro.',
  quindi: 'QUINDI collega una causa alla sua conseguenza: quello che viene prima provoca quello che viene dopo.',
} as const;

export const SCAFFOLD_LABELS = ['Guida piena', 'Domande', 'Piccolo aiuto', 'Lo dico io'] as const;
