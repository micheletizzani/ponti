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
  {
    id: 'bimbo-bimba',
    question: 'Chi insegue chi, nel gioco?',
    agent: 'bimbo',
    patient: 'bimba',
    action: 'inseguire',
    verbActive: 'insegue',
    verbPassive: 'è inseguito da',
    note: 'Paziente femminile: al passivo il participio concorda con il soggetto («è inseguita»).',
  },
  {
    id: 'topo-gatto-saluta',
    question: 'Chi saluta chi?',
    agent: 'topo',
    patient: 'gatto',
    action: 'salutare',
    verbActive: 'saluta',
    verbPassive: 'è salutato da',
    note: 'Scena poco probabile nel mondo reale: la strategia “chi è più forte agisce” non aiuta.',
  },
  {
    id: 'gatto-cane-spinge',
    question: 'Chi spinge chi, questa volta?',
    agent: 'gatto',
    patient: 'cane',
    action: 'spingere',
    verbActive: 'spinge',
    verbPassive: 'è spinto da',
    note: 'Stessa coppia del secondo round con i ruoli invertiti: controlla l’effetto memoria.',
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
  {
    id: 'triangolo-quadrato',
    cells: [
      { shape: 'triangolo', color: 'verde' },
      { shape: 'triangolo', color: 'rosso' },
      { shape: 'quadrato', color: 'verde' },
      null,
    ],
    options: [
      {
        id: 'quadrato-rosso',
        shape: 'quadrato',
        color: 'rosso',
        correct: true,
        reason: 'Quadrato come la riga in basso, rosso come la colonna a destra.',
      },
      {
        id: 'triangolo-rosso',
        shape: 'triangolo',
        color: 'rosso',
        correct: false,
        reason: 'Il colore è giusto, ma nella riga in basso la forma è un quadrato.',
      },
      {
        id: 'quadrato-verde',
        shape: 'quadrato',
        color: 'verde',
        correct: false,
        reason: 'La forma è giusta, ma nella colonna a destra il colore è rosso.',
      },
    ],
    rule: 'In alto ci sono triangoli, in basso quadrati. A sinistra il colore è verde, a destra è rosso. Serve un quadrato rosso.',
    questionL2: 'Che forma c’è nella riga in basso? Che colore c’è nella colonna a destra?',
    cue: 'Quadrato. Rosso.',
  },
  {
    id: 'cerchio-triangolo-giallo',
    cells: [
      { shape: 'cerchio', color: 'blu' },
      { shape: 'triangolo', color: 'blu' },
      { shape: 'cerchio', color: 'giallo' },
      null,
    ],
    options: [
      {
        id: 'triangolo-blu',
        shape: 'triangolo',
        color: 'blu',
        correct: false,
        reason: 'La forma è giusta, ma il blu è il colore della riga in alto.',
      },
      {
        id: 'triangolo-giallo',
        shape: 'triangolo',
        color: 'giallo',
        correct: true,
        reason: 'Triangolo come la colonna a destra, giallo come la riga in basso.',
      },
      {
        id: 'quadrato-giallo',
        shape: 'quadrato',
        color: 'giallo',
        correct: false,
        reason: 'Il colore è giusto, ma nella colonna a destra la forma è un triangolo.',
      },
    ],
    rule: 'La riga in alto è blu, la riga in basso è gialla. A sinistra ci sono cerchi, a destra triangoli. Serve un triangolo giallo.',
    questionL2: 'Che colore ha la riga in basso? Che forma c’è nella colonna a destra?',
    cue: 'Triangolo. Giallo.',
  },
  {
    id: 'trappola-copia',
    cells: [
      { shape: 'quadrato', color: 'giallo' },
      { shape: 'cerchio', color: 'giallo' },
      { shape: 'quadrato', color: 'verde' },
      null,
    ],
    options: [
      {
        id: 'quadrato-giallo',
        shape: 'quadrato',
        color: 'giallo',
        correct: false,
        reason: 'È uguale al primo pezzo in alto. Qui servono il colore della riga in basso e la forma della colonna a destra.',
      },
      {
        id: 'cerchio-giallo',
        shape: 'cerchio',
        color: 'giallo',
        correct: false,
        reason: 'La forma è giusta, ma il giallo è il colore della riga in alto.',
      },
      {
        id: 'cerchio-verde',
        shape: 'cerchio',
        color: 'verde',
        correct: true,
        reason: 'Cerchio come la colonna a destra, verde come la riga in basso.',
      },
    ],
    rule: 'In alto il colore è giallo, in basso è verde. A sinistra ci sono quadrati, a destra cerchi. Serve un cerchio verde.',
    questionL2: 'Guarda la riga in basso: che colore? Guarda la colonna a destra: che forma?',
    cue: 'Cerchio. Verde.',
  },
];

/* ------------------------------------------------------------------ */
/* Speech Pacer                                                        */
/* ------------------------------------------------------------------ */

/**
 * Due gruppi. Le sillabe senza significato isolano ritmo e accento; le parole
 * vere li portano nel lessico quotidiano. L'adulto usa solo quelle indicate dal
 * logopedista: la scelta degli stimoli per la DVE è clinica, non dell'app.
 * Gli accenti seguono le tre forme dell'italiano: piana, tronca, sdrucciola.
 */
export const PACER_STIMULI: PacerStimulus[] = [
  {
    id: 'ba-ba',
    group: 'sillabe',
    syllables: [
      { text: 'BA', stressed: true },
      { text: 'ba', stressed: false },
    ],
    label: 'BA-ba',
    hint: 'Grande, poi piccolo. La voce non si ferma.',
  },
  {
    id: 'ba-ba-inv',
    group: 'sillabe',
    syllables: [
      { text: 'ba', stressed: false },
      { text: 'BA', stressed: true },
    ],
    label: 'ba-BA',
    hint: 'Piccolo, poi grande: l’accento va alla fine.',
    model: 'babà',
  },
  {
    id: 'to-ki',
    group: 'sillabe',
    syllables: [
      { text: 'TO', stressed: true },
      { text: 'ki', stressed: false },
    ],
    label: 'TO-ki',
    hint: 'Suono nuovo, stesso ritmo: grande, poi piccolo.',
  },
  {
    id: 'ma-ta-ka',
    group: 'sillabe',
    syllables: [
      { text: 'MA', stressed: true },
      { text: 'ta', stressed: false },
      { text: 'ka', stressed: false },
    ],
    label: 'MA-ta-ka',
    hint: 'Tre sillabe legate: una grande e due piccole.',
    model: 'màtaka',
  },
  {
    id: 'pu-ma-ti',
    group: 'sillabe',
    syllables: [
      { text: 'pu', stressed: false },
      { text: 'MA', stressed: true },
      { text: 'ti', stressed: false },
    ],
    label: 'pu-MA-ti',
    hint: 'Piccola, grande, piccola: la sfera grande sta nel mezzo.',
    model: 'pumàti',
  },
  {
    id: 'luna',
    group: 'parole',
    syllables: [
      { text: 'LU', stressed: true },
      { text: 'na', stressed: false },
    ],
    label: 'LU-na',
    hint: 'Parola piana: la forza sta sulla prima sillaba.',
    model: 'luna',
  },
  {
    id: 'papa',
    group: 'parole',
    syllables: [
      { text: 'pa', stressed: false },
      { text: 'PÀ', stressed: true },
    ],
    label: 'pa-PÀ',
    hint: 'Parola tronca: la forza arriva alla fine.',
    model: 'papà',
  },
  {
    id: 'patata',
    group: 'parole',
    syllables: [
      { text: 'pa', stressed: false },
      { text: 'TA', stressed: true },
      { text: 'ta', stressed: false },
    ],
    label: 'pa-TA-ta',
    hint: 'Tre sillabe, la forza nel mezzo, come quasi tutte le parole italiane.',
    model: 'patata',
  },
  {
    id: 'banana',
    group: 'parole',
    syllables: [
      { text: 'ba', stressed: false },
      { text: 'NA', stressed: true },
      { text: 'na', stressed: false },
    ],
    label: 'ba-NA-na',
    hint: 'Stesso ritmo di patata, suoni diversi.',
    model: 'banana',
  },
  {
    id: 'tavolo',
    group: 'parole',
    syllables: [
      { text: 'TA', stressed: true },
      { text: 'vo', stressed: false },
      { text: 'lo', stressed: false },
    ],
    label: 'TA-vo-lo',
    hint: 'Parola sdrucciola: grande all’inizio, poi due piccole.',
    model: 'tavolo',
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
    reasons: [
      { dopo: 'DOPO dice solo l’ordine. Qui c’è di più: la pioggia è il motivo per cui si apre l’ombrello.' },
      {
        quindi: 'QUINDI vorrebbe dire che aprire l’ombrello fa uscire il sole. Il sole esce dopo, e basta.',
        perche: 'PERCHÉ vorrebbe dire che l’ombrello si apre a causa del sole. Non è così.',
      },
    ],
  },
  {
    id: 'cane',
    title: 'Il cane con sete',
    frames: [
      { id: 'dog', caption: 'Il cane aveva sete.', art: 'dog' },
      { id: 'bowl', caption: 'Ha bevuto tutta l’acqua.', art: 'bowl' },
      { id: 'dog-happy', caption: 'Si è sentito meglio.', art: 'dog-happy' },
    ],
    // Bere è la causa del sentirsi meglio: il secondo legame è QUINDI, non DOPO.
    links: ['quindi', 'quindi'],
    reasons: [
      { dopo: 'DOPO dice solo l’ordine. Qui c’è di più: la sete è il motivo per cui beve.' },
      { dopo: 'DOPO dice solo l’ordine. Qui c’è di più: bere l’acqua lo fa stare meglio.' },
    ],
  },
  {
    id: 'torre',
    title: 'La torre di cubi',
    frames: [
      { id: 'tower', caption: 'La bambina ha costruito una torre alta.', art: 'tower' },
      { id: 'dog-run', caption: 'Il cane è passato correndo vicino alla torre.', art: 'dog' },
      { id: 'tower-fallen', caption: 'La torre è caduta.', art: 'tower-fallen' },
    ],
    links: ['dopo', 'quindi'],
    reasons: [
      {
        quindi: 'QUINDI vorrebbe dire che costruire la torre ha fatto arrivare il cane. Il cane passa dopo, e basta.',
        perche: 'PERCHÉ vorrebbe dire che la torre è stata costruita a causa del cane. Non è così.',
      },
      {
        dopo: 'DOPO dice solo l’ordine. Qui c’è di più: il cane che corre fa cadere la torre.',
      },
    ],
  },
  {
    id: 'campanello',
    title: 'Il campanello',
    frames: [
      { id: 'dog-bark', caption: 'Il cane abbaia forte.', art: 'dog' },
      { id: 'bell', caption: 'Qualcuno ha suonato il campanello.', art: 'bell' },
      { id: 'door', caption: 'Il papà apre la porta.', art: 'door' },
    ],
    links: ['perche', 'quindi'],
    reasons: [
      {
        dopo: 'Il campanello non suona dopo: ha suonato prima, ed è il motivo per cui il cane abbaia.',
        quindi: 'QUINDI vorrebbe dire che il cane ha fatto suonare il campanello. È il contrario.',
        prima: 'PRIMA dice solo quando. Qui la domanda è un’altra: perché il cane abbaia?',
      },
      {
        perche: 'PERCHÉ vorrebbe dire che il campanello suona a causa del papà. Qui il papà apre a causa del campanello.',
      },
    ],
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
  icon: TopicIconName;
}

export type TopicIconName = 'dino' | 'train' | 'cat' | 'pencil' | 'music' | 'wave' | 'ball' | 'book' | 'food' | 'news';

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
  {
    id: 'parco',
    label: 'Giochi al parco',
    script: 'Al parco mi piace lo scivolo. Scendo veloce! Tu che gioco fai al parco?',
    adultPrompt: 'Dì il tuo gioco preferito, poi chiedi: «Mi fai vedere come scendi?».',
    icon: 'ball',
  },
  {
    id: 'libri',
    label: 'Libri e storie',
    script: 'Ho letto una storia con un lupo. Alla fine scappa via. Tu conosci una storia di animali?',
    adultPrompt: 'Racconta in due frasi una storia che conosci. Lascia che sia lui o lei a fare la domanda dopo.',
    icon: 'book',
  },
  {
    id: 'merenda',
    label: 'Merenda',
    script: 'Oggi a merenda ho mangiato la mela. Era dolce. Tu cosa hai mangiato?',
    adultPrompt: 'Rispondi con il tuo cibo e un aggettivo: «croccante», «dolce», «freddo».',
    icon: 'food',
  },
];

/** Conferme specifiche per connettivo: dicono che legame è stato riconosciuto. */
export const CONNECTIVE_CONFIRMS = {
  prima: 'Sì: la seconda cosa era successa prima.',
  dopo: 'Sì: una cosa viene dopo l’altra, nel tempo.',
  perche: 'Sì: la seconda cosa spiega perché è successa la prima.',
  quindi: 'Sì: la prima cosa provoca la seconda.',
} as const;

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

/** La stessa scala, vista dall'adulto che osserva a casa o a scuola. */
export const OBSERVATION_LABELS = ['Con guida piena', 'Con domande', 'Con un piccolo aiuto', 'In autonomia'] as const;

export function observationLabel(level: number): string {
  return OBSERVATION_LABELS[level - 1] ?? OBSERVATION_LABELS[0];
}
