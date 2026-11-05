import type {
  SocialStory,
  SocialStoryScene,
  StoryCategory,
  StorySentenceType,
} from '../types/domain';
import { uid } from './metrics';

export const SENTENCE_TYPES: { value: StorySentenceType; label: string; short: string }[] = [
  {
    value: 'descriptive',
    label: 'Descrittiva',
    short: 'Dice un fatto, senza giudizio: «A volte a scuola facciamo la ricreazione».',
  },
  {
    value: 'perspective',
    label: 'Prospettica',
    short: 'Racconta cosa pensa o prova l’altra persona.',
  },
  {
    value: 'coaching',
    label: 'Guida',
    short: 'Suggerisce una cosa da provare, con un tono gentile: «Posso provare a…».',
  },
  {
    value: 'affirmative',
    label: 'Affermativa',
    short: 'Rinforza un valore condiviso: «Questo aiuta tutti a stare bene».',
  },
];

export const STORY_CATEGORIES: { value: StoryCategory; label: string }[] = [
  { value: 'social_interaction', label: 'Stare con gli altri' },
  { value: 'speech_regulation', label: 'Quando le parole si fermano' },
  { value: 'emotional_coping', label: 'Emozioni e autocontrollo' },
  { value: 'daily_routines', label: 'Cambiamenti e routine' },
];

export function sentenceTypeLabel(value: StorySentenceType): string {
  return SENTENCE_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function categoryLabel(value: StoryCategory): string {
  return STORY_CATEGORIES.find((item) => item.value === value)?.label ?? value;
}

export interface GrayStatus {
  nonCoaching: number;
  coaching: number;
  /** null quando non ci sono frasi di guida: il rapporto è infinito. */
  ratio: number | null;
  compliant: boolean;
}

/**
 * Formula di Gray 10.2: (descrittive + prospettiche + affermative) / guida ≥ 2.
 * Con zero frasi di guida il rapporto è infinito: la storia descrive e basta.
 */
export function grayStatus(scenes: SocialStoryScene[]): GrayStatus {
  let nonCoaching = 0;
  let coaching = 0;
  for (const scene of scenes) {
    if (scene.sentenceType === 'coaching') coaching += 1;
    else nonCoaching += 1;
  }
  const ratio = coaching === 0 ? null : nonCoaching / coaching;
  return {
    nonCoaching,
    coaching,
    ratio,
    compliant: nonCoaching > 0 && (ratio === null || ratio >= 2),
  };
}

const IMPERATIVE_WORDS = ['devi', 'dovete', 'deve', 'devono', 'fai', 'fate', 'smetti', 'smettete', 'obbligatorio', 'obbligatoria'];
const ABSOLUTE_WORDS = ['sempre', 'mai'];

/** Segnala parole che trasformano la storia in un ordine o in una promessa assoluta. */
export function toneIssues(scenes: SocialStoryScene[]): string[] {
  const issues: string[] = [];
  for (const scene of scenes) {
    const lower = scene.text.toLowerCase();
    for (const word of IMPERATIVE_WORDS) {
      if (new RegExp(`\\b${word}\\b`).test(lower)) issues.push(`Tono impositivo: «${word}»`);
    }
    for (const word of ABSOLUTE_WORDS) {
      if (new RegExp(`\\b${word}\\b`).test(lower)) issues.push(`Parola assoluta: «${word}»`);
    }
  }
  return [...new Set(issues)];
}

export function validateStory(story: SocialStory): string | null {
  if (!story.title.trim()) return 'Dai un titolo alla storia.';
  if (story.scenes.length === 0) return 'Aggiungi almeno una scena.';
  if (story.scenes.some((scene) => !scene.text.trim())) return 'Ogni scena ha bisogno di una frase.';
  if (story.check) {
    if (!story.check.question.trim()) return 'Scrivi la domanda finale oppure toglila.';
    if (story.check.options.length < 2 || story.check.options.some((option) => !option.text.trim())) {
      return 'La domanda finale ha bisogno di due risposte scritte.';
    }
    if (!story.check.options.some((option) => option.correct)) return 'Segna qual è la risposta corretta.';
  }
  return null;
}

export function newScene(): SocialStoryScene {
  return {
    id: uid('scene'),
    sentenceType: 'descriptive',
    text: '',
    visual: { type: 'symbol', key: 'parole', altText: 'Due nuvolette di parole' },
    narration: { type: 'tts' },
    highlightKeywords: [],
  };
}

export function newStory(): SocialStory {
  const now = new Date().toISOString();
  return {
    id: uid('story'),
    title: '',
    category: 'social_interaction',
    protagonist: '',
    goal: '',
    createdAt: now,
    updatedAt: now,
    scenes: [newScene()],
  };
}

/** Copia una storia (anche nativa) in una bozza personalizzata modificabile. */
export function duplicateStory(story: SocialStory): SocialStory {
  const now = new Date().toISOString();
  return {
    id: uid('story'),
    title: `${story.title} (copia)`,
    category: story.category,
    protagonist: story.protagonist,
    goal: story.goal,
    createdAt: now,
    updatedAt: now,
    scenes: story.scenes.map((scene) => ({
      ...scene,
      id: uid('scene'),
      visual: { ...scene.visual },
      narration: { ...scene.narration },
      highlightKeywords: [...scene.highlightKeywords],
    })),
    ...(story.check
      ? {
          check: {
            question: story.check.question,
            options: story.check.options.map((option) => ({ ...option, id: uid('option') })),
          },
        }
      : {}),
  };
}
