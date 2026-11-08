import type {
  DiaryMood,
  PeiDimension,
  StorySymbolKey,
  VisualSchedule,
} from '../types/domain';

/* ------------------------------------------------------------------ */
/* Diario scuola-casa                                                  */
/* ------------------------------------------------------------------ */

export const DIARY_MOODS: { value: DiaryMood; label: string; detail: string }[] = [
  { value: 'bene', label: 'Giornata serena', detail: 'Tranquilla, partecipe' },
  { value: 'stanchezza', label: 'Molta stanchezza', detail: 'Ha avuto bisogno di pause' },
  { value: 'agitazione', label: 'Un po’ di agitazione', detail: 'Cambi o rumore pesanti' },
  { value: 'difficile', label: 'Giornata difficile', detail: 'Meglio parlarne' },
];

export function moodLabel(mood: DiaryMood | null): string {
  return DIARY_MOODS.find((item) => item.value === mood)?.label ?? 'Non indicato';
}

/**
 * Momenti pronti, scritti in prima persona: diventano le carte che il bambino
 * usa per raccontare. Il marcatore {o|a} viene accordato al profilo.
 */
export const DIARY_MOMENTS: { symbol: StorySymbolKey; text: string }[] = [
  { symbol: 'cerchio', text: 'Abbiamo fatto il cerchio' },
  { symbol: 'musica', text: 'Ho cantato e suonato' },
  { symbol: 'giardino', text: 'Ho giocato in giardino' },
  { symbol: 'disegno', text: 'Ho disegnato' },
  { symbol: 'libro', text: 'Abbiamo letto una storia' },
  { symbol: 'gioco', text: 'Ho giocato con le costruzioni' },
  { symbol: 'palla', text: 'Ho fatto motoria' },
  { symbol: 'mangiare', text: 'Ho mangiato con i compagni' },
  { symbol: 'logopedia', text: 'Sono andat{o|a} in logopedia' },
  { symbol: 'auto', text: 'Ho fatto un giro in macchina' },
  { symbol: 'casa', text: 'Ho giocato a casa' },
  { symbol: 'famiglia', text: 'Ho visto i nonni' },
  { symbol: 'cane', text: 'Ho visto un cane' },
  { symbol: 'tablet', text: 'Ho giocato con Ponti' },
];

/** Segnalazioni rapide: si toccano invece di scrivere. */
export const DIARY_FLAGS: { id: string; label: string }[] = [
  { id: 'sonno', label: 'Ha dormito poco' },
  { id: 'appetito', label: 'Ha mangiato poco' },
  { id: 'pancia', label: 'Mal di pancia o fastidi' },
  { id: 'cambi', label: 'Ci sono stati cambi di programma' },
  { id: 'rumore', label: 'Ambiente molto rumoroso' },
  { id: 'parola', label: 'Tanta fatica con le parole' },
  { id: 'pausa', label: 'Ha chiesto una pausa da sol{o|a}' },
];

export function flagLabel(id: string): string {
  return DIARY_FLAGS.find((flag) => flag.id === id)?.label ?? id;
}

/* ------------------------------------------------------------------ */
/* Obiettivi condivisi                                                 */
/* ------------------------------------------------------------------ */

/**
 * Le quattro dimensioni del modello nazionale di PEI (D.I. 182/2020, con le
 * correzioni del D.I. 153/2023). Ponti le usa solo come etichette per ordinare
 * gli obiettivi: il PEI resta il documento del GLO.
 */
export const PEI_DIMENSIONS: { value: PeiDimension; label: string; short: string }[] = [
  {
    value: 'relazione',
    label: 'Relazione, interazione e socializzazione',
    short: 'Stare con gli altri',
  },
  {
    value: 'comunicazione',
    label: 'Comunicazione e linguaggio',
    short: 'Capire e farsi capire',
  },
  {
    value: 'autonomia',
    label: 'Autonomia e orientamento',
    short: 'Fare da sé, orientarsi',
  },
  {
    value: 'apprendimento',
    label: 'Cognitiva, neuropsicologica e dell’apprendimento',
    short: 'Ragionare, ricordare, imparare',
  },
];

export function dimensionLabel(value: PeiDimension): string {
  return PEI_DIMENSIONS.find((item) => item.value === value)?.label ?? value;
}

export function dimensionShort(value: PeiDimension): string {
  return PEI_DIMENSIONS.find((item) => item.value === value)?.short ?? value;
}

export interface GoalPreset {
  id: string;
  title: string;
  dimension: PeiDimension;
  activityPath: string | null;
  activityLabel: string | null;
  strategy: string;
}

/**
 * Libreria di partenza, derivata dal profilo descritto in doc/. Ogni voce è una
 * proposta da discutere con logopedista e insegnanti, non un obiettivo clinico.
 */
export const GOAL_LIBRARY: GoalPreset[] = [
  {
    id: 'reversibili',
    title: 'Capisce chi fa l’azione anche quando la frase è al passivo',
    dimension: 'comunicazione',
    activityPath: '/app/sintassi',
    activityLabel: 'Sintassi dinamica',
    strategy:
      'Prima chiedete «Chi fa?», poi «Chi riceve?». Indicate le tessere colorate: arancione chi fa, giallo chi riceve.',
  },
  {
    id: 'prima-poi',
    title: 'Racconta due cose in ordine con PRIMA e POI',
    dimension: 'comunicazione',
    activityPath: '/app/racconta',
    activityLabel: 'Racconta la giornata',
    strategy:
      'Mostrate le carte della giornata e dite solo «Prima…». Aspettate almeno cinque secondi prima di aiutare.',
  },
  {
    id: 'perche-quindi',
    title: 'Collega una causa e la sua conseguenza con PERCHÉ e QUINDI',
    dimension: 'apprendimento',
    activityPath: '/app/racconto',
    activityLabel: 'Trama e nessi',
    strategy:
      'Nelle situazioni vere fate la domanda «perché?» una volta sola, e offrite due possibilità tra cui scegliere.',
  },
  {
    id: 'altra-strada',
    title: 'Quando la parola non esce, usa un’altra strada: indica, mostra, usa la carta',
    dimension: 'comunicazione',
    activityPath: '/app/come-sto',
    activityLabel: 'Come sto',
    strategy:
      'Accogliete il tentativo senza chiedere di ripetere più volte. Offrite la figura o la carta, poi date voi la parola.',
  },
  {
    id: 'novita',
    title: 'Apre la conversazione con una novità invece di una domanda già nota',
    dimension: 'relazione',
    activityPath: '/app/sociale',
    activityLabel: 'Social Deck',
    strategy:
      'Alla domanda ripetuta rispondete in breve e con calore, poi proponete: «Raccontami una novità». La carta Novità aiuta.',
  },
  {
    id: 'turno',
    title: 'Aspetta il proprio turno in uno scambio a due',
    dimension: 'relazione',
    activityPath: '/app/storie',
    activityLabel: 'Storie sociali',
    strategy: 'Usate un oggetto da passarsi, come una palla morbida: parla chi la tiene.',
  },
  {
    id: 'agenda',
    title: 'Segue l’agenda visiva nei passaggi da un’attività all’altra',
    dimension: 'autonomia',
    activityPath: '/app/agenda',
    activityLabel: 'La mia giornata',
    strategy:
      'Prima di ogni cambio mostrate la carta successiva e dite «Prima… poi…». Fate segnare «fatto» a lui o a lei.',
  },
  {
    id: 'pausa',
    title: 'Chiede una pausa con la carta quando è stanc{o|a}',
    dimension: 'autonomia',
    activityPath: '/app/come-sto',
    activityLabel: 'Come sto',
    strategy:
      'Quando la carta viene mostrata, la pausa si concede subito, anche breve: così la carta mantiene il suo valore.',
  },
  {
    id: 'regola-voce',
    title: 'Completa una matrice dicendo prima la regola a voce',
    dimension: 'apprendimento',
    activityPath: '/app/matrici',
    activityLabel: 'Matrix-Talk',
    strategy:
      'Partite dal livello «Domande». Passate a «Lo dico io» solo quando la regola esce senza suggerimenti per due volte.',
  },
  {
    id: 'ritmo',
    title: 'Ripete parole di due o tre sillabe tenendo la voce legata',
    dimension: 'comunicazione',
    activityPath: '/app/ritmo',
    activityLabel: 'Ritmo e sillabe',
    strategy:
      'Solo con le parole scelte dal logopedista. A casa e a scuola non si corregge: si registra e si lascia giudicare al logopedista.',
  },
];

/* ------------------------------------------------------------------ */
/* Agende visive pronte                                                */
/* ------------------------------------------------------------------ */

const CREATED = '2026-11-08T08:00:00.000Z';

function step(id: string, label: string, key: StorySymbolKey, altText: string) {
  return { id, label, visual: { type: 'symbol' as const, key, altText } };
}

/** Agende pronte: si usano subito, anche senza cassaforte, e si possono copiare. */
export const NATIVE_SCHEDULES: VisualSchedule[] = [
  {
    id: 'mattina-scuola',
    title: 'Mattina a scuola',
    context: 'scuola',
    native: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    steps: [
      step('ms-1', 'Arrivo e appendo lo zaino', 'zaino', 'Uno zaino'),
      step('ms-2', 'Cerchio del mattino', 'cerchio', 'Persone sedute in cerchio'),
      step('ms-3', 'Lavoro al banco', 'libro', 'Un libro aperto'),
      step('ms-4', 'Lavo le mani', 'bagno', 'Mani sotto il rubinetto'),
      step('ms-5', 'Merenda', 'mangiare', 'Un piatto con le posate'),
      step('ms-6', 'Ricreazione', 'giardino', 'Un albero nel giardino'),
      step('ms-7', 'Laboratorio', 'disegno', 'Un foglio e un pennarello'),
      step('ms-8', 'Torno a casa', 'casa', 'Una casa'),
    ],
  },
  {
    id: 'pranzo-scuola',
    title: 'Pranzo a scuola',
    context: 'scuola',
    native: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    steps: [
      step('ps-1', 'Lavo le mani', 'bagno', 'Mani sotto il rubinetto'),
      step('ps-2', 'Pranzo', 'mangiare', 'Un piatto con le posate'),
      step('ps-3', 'Gioco tranquillo', 'gioco', 'Tre cubi colorati'),
      step('ps-4', 'Pausa con le cuffie', 'cuffie', 'Cuffie antirumore'),
    ],
  },
  {
    id: 'mattina-casa',
    title: 'Mattina a casa',
    context: 'casa',
    native: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    steps: [
      step('mc-1', 'Mi sveglio', 'letto', 'Un letto'),
      step('mc-2', 'Vado in bagno', 'bagno', 'Mani sotto il rubinetto'),
      step('mc-3', 'Mi vesto', 'vestirsi', 'Una maglietta'),
      step('mc-4', 'Colazione', 'mangiare', 'Un piatto con le posate'),
      step('mc-5', 'Lavo i denti', 'denti', 'Uno spazzolino'),
      step('mc-6', 'Prendo lo zaino', 'zaino', 'Uno zaino'),
      step('mc-7', 'Andiamo a scuola', 'scuola', 'La scuola'),
    ],
  },
  {
    id: 'sera-casa',
    title: 'Sera a casa',
    context: 'casa',
    native: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    steps: [
      step('sc-1', 'Cena', 'mangiare', 'Un piatto con le posate'),
      step('sc-2', 'Gioco tranquillo', 'gioco', 'Tre cubi colorati'),
      step('sc-3', 'Lavo i denti', 'denti', 'Uno spazzolino'),
      step('sc-4', 'Una storia', 'libro', 'Un libro aperto'),
      step('sc-5', 'Nanna', 'letto', 'Un letto'),
    ],
  },
  {
    id: 'logopedia',
    title: 'Vado in logopedia',
    context: 'casa',
    native: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    steps: [
      step('lg-1', 'Viaggio in macchina', 'auto', 'Una macchina'),
      step('lg-2', 'Lavoro in logopedia', 'logopedia', 'Un viso e una nuvoletta di parole'),
      step('lg-3', 'Un gioco per finire', 'palla', 'Una palla'),
      step('lg-4', 'Torno a casa', 'casa', 'Una casa'),
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Guide pratiche                                                      */
/* ------------------------------------------------------------------ */

export interface GuideCard {
  id: string;
  title: string;
  /** Tre frasi al massimo: cosa fare. */
  points: string[];
  /** Perché: da dove viene il consiglio e quanto è solido. */
  why: string;
}

export const FAMILY_GUIDES: GuideCard[] = [
  {
    id: 'poco-spesso',
    title: 'Dieci minuti, non un’ora',
    points: [
      'Meglio poche prove al giorno, quando è riposat{o|a}, che una seduta lunga nel fine settimana.',
      'Fermatevi prima che arrivi la stanchezza: chiudere bene conta più che finire.',
      'Non serve usare Ponti ogni giorno. Il gioco e il racconto della giornata contano altrettanto.',
    ],
    why:
      'Nei principi di apprendimento motorio la pratica distribuita nel tempo favorisce il mantenimento. Attenzione: questi principi sono stati studiati soprattutto negli adulti, e pochi sono stati verificati uno per uno nella disprassia verbale infantile.',
  },
  {
    id: 'non-correggere',
    title: 'Ritmo e sillabe a casa: non correggere',
    points: [
      'Il vostro compito è tenere il ritmo e il buon umore, non giudicare se il suono è giusto.',
      'Se il logopedista lo chiede, registrate. Ascolta lui o lei, e decide.',
      'Usate solo le parole indicate in terapia, anche se l’app ne propone altre.',
    ],
    why:
      'Negli studi sul trattamento ReST, la pratica condotta dai genitori ha dato risultati inferiori rispetto a quella del clinico; la parte più difficile per i genitori era proprio dare un riscontro preciso sul suono prodotto.',
  },
  {
    id: 'domanda-ripetuta',
    title: 'Quando arriva la stessa domanda',
    points: [
      'Rispondete in breve e con calore: è un modo per stare vicino a voi, non un capriccio.',
      'Poi offrite un’alternativa: «Raccontami una novità» oppure la carta Novità del Social Deck.',
      'Evitate di ignorare la domanda: toglie l’appiglio senza dare un’altra strada.',
    ],
    why:
      'È la lettura proposta nella relazione clinica in doc/: la domanda già nota garantisce lo scambio con un costo minimo di pianificazione. È un’interpretazione clinica del caso, non un dato di ricerca.',
  },
  {
    id: 'raccontare',
    title: 'Raccontare la giornata',
    points: [
      'Aprite «Racconta la giornata»: le carte arrivano dal diario della scuola.',
      'Indicate la prima carta e dite solo «Prima…». Aspettate in silenzio, contando fino a cinque.',
      'Se dice una parola, ripetetela aggiungendone una: «Giardino». «Sì, in giardino!»',
    ],
    why:
      'Le carte riducono il carico di memoria e di pianificazione; PRIMA e POI sono gli stessi connettivi di Trama e nessi. Sono suggerimenti pratici, non un protocollo validato.',
  },
  {
    id: 'stanchezza',
    title: 'Sonno, pancia, stanchezza: ditelo alla scuola',
    points: [
      'Nel diario ci sono segnalazioni rapide: «ha dormito poco», «mal di pancia».',
      'Bastano due tocchi. La maestra capisce perché quel giorno serve più aiuto.',
      'Parlate con il pediatra di sonno e disturbi gastrointestinali: sono frequenti in questo quadro.',
    ],
    why:
      'Nella casistica pubblicata sulla sindrome di White-Sutton sono riportati sintomi di apnea notturna e problemi gastrointestinali più frequenti dell’atteso (Batzir e coll., 2020).',
  },
  {
    id: 'vista-udito',
    title: 'Vista e udito: controlli regolari',
    points: [
      'Nella sindrome sono descritti problemi visivi e uditivi: tenete aggiornati i controlli.',
      'Se fatica a vedere bene, nelle impostazioni potete aumentare testo e contrasto.',
      'Un udito non controllato può sembrare una difficoltà di linguaggio o di attenzione.',
    ],
    why:
      'Anomalie oculari e perdita uditiva sono tra i problemi frequenti riportati da Batzir e coll. (2020). Le decisioni restano del pediatra e degli specialisti.',
  },
];

export const SCHOOL_GUIDES: GuideCard[] = [
  {
    id: 'attesa',
    title: 'Il tempo di attesa',
    points: [
      'Dopo una domanda aspettate, contando fino a cinque, senza ripeterla subito.',
      'Non completate la frase al posto suo: riformulatela dopo, aggiungendo una parola.',
      'Una domanda per volta. Due domande insieme raddoppiano il lavoro di pianificazione.',
    ],
    why:
      'Nella disprassia verbale il problema è pianificare e programmare i movimenti della parola: serve tempo prima che la risposta parta. È la base del profilo descritto in doc/.',
  },
  {
    id: 'visivo',
    title: 'Una consegna alla volta, con un supporto visivo',
    points: [
      'Accompagnate la consegna orale con una carta o un gesto, e lasciatela visibile.',
      'Usate l’agenda visiva per i passaggi: «Prima merenda, poi giardino».',
      'Annunciate i cambi prima che avvengano, mostrando la carta nuova.',
    ],
    why:
      'I supporti visivi sono classificati come pratica basata su evidenze per l’autismo (NCAEP 2020); le agende visive lo sono anche per persone con disabilità intellettiva in diversi ambiti di autonomia (Spriggs e coll., 2016).',
  },
  {
    id: 'farsi-capire',
    title: 'Farsi capire quando la parola non esce',
    points: [
      'Accettate tutte le strade: indicare, mostrare, usare la carta o il tablet.',
      'Non chiedete di ripetere più volte davanti alla classe. Dite voi la parola, con calma.',
      'Se non capite, ditelo con sincerità e offrite due possibilità tra cui scegliere.',
    ],
    why:
      'Ripetizioni forzate e incomprensioni prolungate aumentano la frustrazione. Sono indicazioni pratiche coerenti con la relazione clinica in doc/, non il risultato di uno studio specifico.',
  },
  {
    id: 'domande-classe',
    title: 'Le domande ripetute in classe',
    points: [
      'Rispondete brevemente: la domanda serve a mantenere il contatto con voi.',
      'Proponete un incarico o una novità da raccontare al gruppo, con la carta del diario.',
      'Segnalate nel diario quando le domande aumentano: spesso coincidono con stanchezza o cambi.',
    ],
    why:
      'Lettura clinica del caso descritta in doc/. Il diario serve a verificarla nel tempo, invece di darla per scontata.',
  },
  {
    id: 'storie-prudenza',
    title: 'Storie sociali: usatele con prudenza',
    points: [
      'Usatele per descrivere una situazione prima che accada, non per correggere dopo.',
      'Leggetele con calma e senza interrogare. La domanda finale non è un voto.',
      'Osservate se qualcosa cambia davvero. Se dopo alcune settimane non cambia nulla, cambiate strada.',
    ],
    why:
      'Le prove sull’efficacia delle storie sociali sono contrastanti: alcune revisioni trovano effetti, altre no, e i risultati variano molto da persona a persona (Kokina e Kern, 2010; Qi e coll., 2018).',
  },
  {
    id: 'privacy',
    title: 'Privacy: dove scrivere e dove no',
    points: [
      'Il PEI e le informazioni di salute riguardano solo la famiglia e chi lavora con l’alunna o l’alunno.',
      'Non usate le chat di classe per notizie su salute o comportamento.',
      'Prima di usare Ponti a scuola chiedete al dirigente e al responsabile protezione dati (DPO).',
    ],
    why:
      'Il Garante per la protezione dei dati personali ha sanzionato scuole che avevano reso visibili dati di alunni con disabilità; il vademecum «La scuola a prova di privacy» raccoglie le regole.',
  },
];

/* ------------------------------------------------------------------ */
/* Fonti                                                                */
/* ------------------------------------------------------------------ */

export interface SourceNote {
  id: string;
  citation: string;
  what: string;
  /** Quanto è solida l'informazione, detto con parole semplici. */
  strength: string;
}

/**
 * Fonti verificate tramite ricerca bibliografica durante lo sviluppo. Dove il
 * testo completo non era accessibile, la nota lo dice.
 */
export const SOURCES: SourceNote[] = [
  {
    id: 'batzir',
    citation:
      'Batzir N.A. e coll. (2020). Phenotypic expansion of POGZ-related intellectual disability syndrome (White-Sutton syndrome). Am J Med Genet A, 182(1), 38–52.',
    what: 'Coorte di 22 persone: ritardo del linguaggio in tutti; anomalie oculari, perdita uditiva, sintomi di apnea notturna, problemi gastrointestinali.',
    strength: 'Serie clinica descrittiva. Letto l’abstract, non il testo completo.',
  },
  {
    id: 'genereviews',
    citation: 'GeneReviews: White-Sutton Syndrome (NCBI Bookshelf, NBK573972).',
    what: 'Criteri diagnostici e indicazioni di gestione multidisciplinare.',
    strength: 'Revisione clinica di riferimento. Non è stato possibile leggerla integralmente da questo ambiente.',
  },
  {
    id: 'ncaep',
    citation:
      'Steinbrenner J.R. e coll. (2020). Evidence-Based Practices for Children, Youth, and Young Adults with Autism. NCAEP, FPG Child Development Institute, UNC.',
    what: 'Supporti visivi e intervento condotto dai genitori classificati tra le 28 pratiche basate su evidenze.',
    strength: 'Revisione sistematica ampia, riferita all’autismo, non alla sindrome di White-Sutton.',
  },
  {
    id: 'spriggs',
    citation:
      'Knight V., Sartini E., Spriggs A.D. (2015). J Autism Dev Disord, 45(1), 157–178; Spriggs A.D. e coll. (2016). J Spec Educ, 51(1), 14–26.',
    what: 'Le agende visive risultano pratica basata su evidenze per l’autismo e, per diversi ambiti di autonomia, per la disabilità intellettiva.',
    strength: 'Revisioni di studi a caso singolo. Gli studi sulla disabilità intellettiva riguardano soprattutto adolescenti e adulti.',
  },
  {
    id: 'maas',
    citation: 'Maas E. e coll. (2008). Principles of motor learning in treatment of motor speech disorders. AJSLP, 17(3), 277–298.',
    what: 'Pratica distribuita, variabilità, frequenza del riscontro.',
    strength: 'Principi nati soprattutto da studi su adulti; pochi sono stati verificati singolarmente nella disprassia verbale infantile.',
  },
  {
    id: 'rest',
    citation: 'Thomas D.C., McCabe P., Ballard K.J. (2018). Combined clinician-parent delivery of ReST treatment for CAS. Int J Speech-Language Pathol.',
    what: 'La pratica condotta in parte dai genitori è risultata meno efficace di quella del solo clinico; la fedeltà del riscontro era più bassa a casa.',
    strength: 'Studio piccolo (cinque bambini), disegno a linee di base multiple.',
  },
  {
    id: 'social-stories',
    citation: 'Kokina A., Kern L. (2010), J Autism Dev Disord; Qi C.H. e coll. (2018), Res Autism Spectr Disord.',
    what: 'Effetti delle storie sociali variabili; più marcati sulla riduzione di comportamenti che sull’insegnamento di abilità.',
    strength: 'Evidenza contrastante; poche persone con disabilità intellettiva nei campioni.',
  },
  {
    id: 'pei',
    citation: 'D.I. 182/2020 e D.I. 153/2023: modello nazionale di PEI.',
    what: 'Quattro dimensioni: relazione, interazione e socializzazione; comunicazione e linguaggio; autonomia e orientamento; cognitiva, neuropsicologica e dell’apprendimento.',
    strength: 'Norma, non ricerca. Il decreto ha avuto un percorso giudiziario: verificate la versione in vigore sul sito del Ministero.',
  },
  {
    id: 'garante',
    citation: 'Garante per la protezione dei dati personali: vademecum «La scuola a prova di privacy» e provvedimenti 2025 su dati di alunni con disabilità.',
    what: 'Il PEI è conoscibile solo da famiglia, docenti e soggetti coinvolti; la diffusione di dati sanitari è una violazione grave.',
    strength: 'Fonte normativa. Riportata da stampa di settore: leggete i provvedimenti sul sito del Garante.',
  },
];
