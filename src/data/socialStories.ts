import type {
  SocialStory,
  SocialStoryScene,
  StorySentenceType,
  StorySymbolKey,
} from '../types/domain';

const scene = (
  id: string,
  sentenceType: StorySentenceType,
  text: string,
  key: StorySymbolKey,
  altText: string,
  highlightKeywords: string[],
): SocialStoryScene => ({
  id,
  sentenceType,
  text,
  visual: { type: 'symbol', key, altText },
  narration: { type: 'tts' },
  highlightKeywords,
});

const CREATED = '2026-11-05T09:00:00.000Z';

/**
 * Storie precaricate, costruite sulla formula di Gray 10.2:
 * ogni frase è etichettata e il rapporto descrittive/guida resta ≥ 2.
 * Non contengono dati del bambino: non vengono salvate nella cassaforte.
 */
export const NATIVE_STORIES: SocialStory[] = [
  {
    id: 'passarsi-la-palla',
    title: 'Chiacchierare è come passarsi la palla',
    category: 'social_interaction',
    protagonist: 'Leo',
    goal: 'Trovare un’altra cosa da dire quando la domanda ha già una risposta conosciuta.',
    createdAt: CREATED,
    updatedAt: CREATED,
    native: true,
    scenes: [
      scene(
        'palla-1',
        'descriptive',
        'A me piace parlare con i grandi e con i miei amici.',
        'parole',
        'Due nuvolette di parole vicine',
        ['parlare', 'amici'],
      ),
      scene(
        'palla-2',
        'perspective',
        'Quando parlo con qualcuno, l’altra persona è felice di ascoltarmi.',
        'maestra',
        'Una maestra sorridente ascolta',
        ['ascoltarmi'],
      ),
      scene(
        'palla-3',
        'descriptive',
        'Parlare insieme è come giocare a passarsi la palla: prima la tiro io, poi la prendi tu.',
        'palla',
        'Una palla che passa da una mano all’altra',
        ['palla', 'passarsi'],
      ),
      scene(
        'palla-4',
        'descriptive',
        'A volte mi viene da fare una domanda di cui conosco già la risposta. Lo faccio perché voglio stare vicino a quella persona.',
        'bambino',
        'Un bambino con una nuvola di pensiero',
        ['domanda', 'vicino'],
      ),
      scene(
        'palla-5',
        'perspective',
        'Gli adulti capiscono che ho voglia di chiacchierare.',
        'famiglia',
        'Tre figure vicine, una famiglia',
        ['capiscono', 'chiacchierare'],
      ),
      scene(
        'palla-6',
        'coaching',
        'Quando conosco già la risposta, posso provare a dire una cosa nuova: «Oggi ho visto un cane!» oppure usare il mio Social Deck per scegliere una figura.',
        'cane',
        'Un cane semplice, disegnato con poche linee',
        ['cosa nuova', 'Social Deck'],
      ),
      scene(
        'palla-7',
        'affirmative',
        'Passarsi la palla delle parole è un bel modo per stare insieme.',
        'palla',
        'La palla passa tra due persone',
        ['stare insieme'],
      ),
    ],
    check: {
      question: 'Cosa può fare Leo quando conosce già la risposta?',
      options: [
        {
          id: 'palla-si',
          text: 'Dire una cosa nuova, per esempio «Oggi ho visto un cane!»',
          correct: true,
          feedback: 'Sì: la storia propone un’altra cosa da dire, non la stessa domanda.',
        },
        {
          id: 'palla-no',
          text: 'Ripetere la stessa domanda',
          correct: false,
          feedback:
            'La storia non vieta di farlo: propone un’altra strada per stare vicino alla persona. Rileggi la pagina e prova.',
        },
      ],
    },
  },
  {
    id: 'treno-delle-parole',
    title: 'Il treno delle mie parole',
    category: 'speech_regulation',
    protagonist: 'Leo',
    goal: 'Normalizzare il blocco della parola e ricordare che respiro e CAA sono strade legittime.',
    createdAt: CREATED,
    updatedAt: CREATED,
    native: true,
    scenes: [
      scene(
        'treno-1',
        'descriptive',
        'Nella mia testa ci sono tantissime idee bellissime e tanti giochi che conosco.',
        'parole',
        'Nuvolette piene di idee',
        ['idee', 'giochi'],
      ),
      scene(
        'treno-2',
        'descriptive',
        'La mia bocca a volte deve fare un grande lavoro per mettere in fila tutti i suoni, come i vagoni di un treno lungo.',
        'treno',
        'Un treno con molti vagoni in fila',
        ['bocca', 'suoni', 'treno'],
      ),
      scene(
        'treno-3',
        'descriptive',
        'A volte i suoni partono veloci, altre volte hanno bisogno di fare una sosta.',
        'treno',
        'Il treno si ferma a una stazione',
        ['veloci', 'sosta'],
      ),
      scene(
        'treno-4',
        'perspective',
        'Quando una parola si ferma, io posso sentirmi arrabbiato o stanco. È normale sentirsi così.',
        'bambino',
        'Un bambino con le sopracciglia aggrottate',
        ['arrabbiato', 'normale'],
      ),
      scene(
        'treno-5',
        'perspective',
        'Gli adulti sanno che ho cose importanti da dire e possono aspettare con calma.',
        'famiglia',
        'Due adulti in attesa, vicini al bambino',
        ['aspettare', 'calma'],
      ),
      scene(
        'treno-6',
        'coaching',
        'Se la bocca è stanca, posso fare un respiro lento.',
        'respiro',
        'Una spirale che indica un respiro lento',
        ['respiro lento'],
      ),
      scene(
        'treno-7',
        'coaching',
        'Posso anche toccare la figura sul tablet o indicare la tessera per far capire subito cosa voglio.',
        'tablet',
        'Un tablet con una figura da toccare',
        ['figura', 'tablet', 'tessera'],
      ),
      scene(
        'treno-8',
        'affirmative',
        'Ci sono tanti modi per far viaggiare le mie idee.',
        'parole',
        'Tre nuvolette che si allontanano',
        ['tanti modi', 'idee'],
      ),
    ],
    check: {
      question: 'Cosa può fare Leo se la parola si ferma?',
      options: [
        {
          id: 'treno-si',
          text: 'Fare un respiro lento e indicare la figura sul tablet',
          correct: true,
          feedback: 'Sì: respiro e figura sono due appoggi concreti, non una sconfitta.',
        },
        {
          id: 'treno-no',
          text: 'Aspettare in silenzio che la parola torni',
          correct: false,
          feedback:
            'La storia riconosce la fatica e propone un modo per farsi capire subito. Rileggi la pagina e prova.',
        },
      ],
    },
  },
  {
    id: 'programmi-altra-strada',
    title: 'Quando i programmi prendono un’altra strada',
    category: 'daily_routines',
    protagonist: 'Leo',
    goal: 'Trovare un appoggio quando un’attività cambia all’improvviso.',
    createdAt: CREATED,
    updatedAt: CREATED,
    native: true,
    scenes: [
      scene(
        'strada-1',
        'descriptive',
        'Ogni giorno a scuola e a casa ci sono attività che conosco bene. Guardare la mia agenda visiva mi fa sentire tranquillo.',
        'agenda',
        'Un’agenda con tessere e una spunta',
        ['agenda', 'tranquillo'],
      ),
      scene(
        'strada-2',
        'descriptive',
        'A volte capita che un’attività cambi all’improvviso, per esempio se piove o se un materiale non c’è.',
        'scuola',
        'Una scuola sotto la pioggia',
        ['cambia', 'improvviso'],
      ),
      scene(
        'strada-3',
        'perspective',
        'Quando le cose cambiano, posso sentirmi sorpreso o confuso. Anche ai grandi capita.',
        'bambino',
        'Un bambino sorpreso, con un punto interrogativo',
        ['sorpreso', 'confuso'],
      ),
      scene(
        'strada-4',
        'coaching',
        'Se qualcosa cambia, posso guardare la nuova tessera sull’agenda o stringere la palla morbida.',
        'pallamorbida',
        'Una mano che stringe una palla morbida',
        ['nuova tessera', 'palla morbida'],
      ),
      scene(
        'strada-5',
        'coaching',
        'Posso pensare che faremo qualcosa di diverso e poi torneremo alle nostre solite cose.',
        'scuola',
        'La scuola con una freccia che torna indietro',
        ['qualcosa di diverso', 'solite cose'],
      ),
      scene(
        'strada-6',
        'affirmative',
        'I cambiamenti possono portarci a scoprire giochi nuovi e divertenti.',
        'palla',
        'Un gioco nuovo accanto a una palla',
        ['giochi nuovi'],
      ),
    ],
    check: {
      question: 'Cosa può fare Leo se il programma cambia?',
      options: [
        {
          id: 'strada-si',
          text: 'Guardare la nuova tessera sull’agenda o stringere la palla morbida',
          correct: true,
          feedback: 'Sì: un appoggio visivo e uno tattile aiutano ad attraversare il cambiamento.',
        },
        {
          id: 'strada-no',
          text: 'Chiedere che tutto torni come prima',
          correct: false,
          feedback:
            'La storia accoglie la sorpresa e propone qualcosa da fare mentre il programma cambia. Rileggi la pagina e prova.',
        },
      ],
    },
  },
];
