import type { ChildGender } from '../types/domain';

/**
 * Accordo grammaticale per i testi italiani.
 * Nei testi scritti per il bambino si usa il marcatore {o|a}: con «f» diventa
 * la seconda forma, con «m» la prima, con «n» (non indicato) entrambe: «o/a».
 */
export function genderize(text: string, gender: ChildGender): string {
  return text.replace(/\{([^|{}]*)\|([^|{}]*)\}/g, (_match, masculine: string, feminine: string) => {
    if (gender === 'f') return feminine;
    if (gender === 'm') return masculine;
    return masculine === feminine ? masculine : `${masculine}/${feminine}`;
  });
}

export interface ChildWords {
  /** «la bambina», «il bambino», «il bambino o la bambina» */
  noun: string;
  /** Con la maiuscola iniziale. */
  Noun: string;
  /** «alla bambina», «al bambino» */
  toNoun: string;
  /** Nome scelto dall'adulto oppure il nome comune. */
  name: string;
}

export function childWords(gender: ChildGender, displayName: string): ChildWords {
  const noun = gender === 'f' ? 'la bambina' : gender === 'm' ? 'il bambino' : 'il bambino o la bambina';
  const toNoun = gender === 'f' ? 'alla bambina' : gender === 'm' ? 'al bambino' : 'al bambino o alla bambina';
  const name = displayName.trim();
  return {
    noun,
    Noun: noun.charAt(0).toUpperCase() + noun.slice(1),
    toNoun,
    name: name || (gender === 'f' ? 'la bambina' : gender === 'm' ? 'il bambino' : 'il bambino'),
  };
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Abbassa solo la prima lettera: utile per comporre «Prima ho cantato». */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Data locale in formato AAAA-MM-GG, senza passare da UTC. */
export function todayIso(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** «oggi», «ieri» oppure «martedì 4 novembre». */
export function relativeDay(iso: string, today = todayIso()): string {
  if (iso === today) return 'oggi';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(year, month - 1, day);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (todayIso(yesterday) === iso) return 'ieri';
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Testo del pulsante che chiude l'area adulti: «Passa a Giulia», «Passa alla bambina». */
export function handoffLabel(gender: ChildGender, displayName: string): string {
  const name = displayName.trim();
  if (name) return `Passa a ${name}`;
  return `Passa ${childWords(gender, '').toNoun}`;
}
