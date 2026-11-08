import type { ChildGender, DiaryMoment } from '../types/domain';
import { genderize, lowerFirst } from './words';

/** Connettivi del racconto: gli stessi di Trama e nessi, in ordine fisso. */
export function sequenceWords(count: number): string[] {
  if (count <= 1) return [''];
  if (count === 2) return ['Prima', 'Poi'];
  return ['Prima', 'Poi', 'Alla fine'];
}

/** «Prima ho cantato. Poi ho giocato in giardino.» */
export function retellSentences(moments: DiaryMoment[], gender: ChildGender): string[] {
  const words = sequenceWords(moments.length);
  return moments.map((moment, index) => {
    const text = genderize(moment.text.trim(), gender).replace(/\.$/, '');
    const word = words[index] ?? '';
    return word ? `${word} ${lowerFirst(text)}.` : `${text}.`;
  });
}
