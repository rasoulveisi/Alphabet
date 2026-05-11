import type { ConfusablePair } from './models';
import { EASTERN_ARMENIAN_ALPHABET } from './armenian-alphabet';

export const CONFUSABLE_PAIRS: readonly ConfusablePair[] = [
  {
    id: 'eh-e',
    glyphs: ['է', 'ե'],
    latinHints: ['ē (eh)', 'e (closed e)'],
  },
  {
    id: 'i-v',
    glyphs: ['ի', 'վ'],
    latinHints: ['i', 'v'],
  },
  {
    id: 'o-r',
    glyphs: ['ո', 'ռ'],
    latinHints: ['o', 'ṙ'],
  },
  {
    id: 'p-k',
    glyphs: ['պ', 'կ'],
    latinHints: ['p', 'k'],
  },
];

export function getPairById(id: string): ConfusablePair | undefined {
  return CONFUSABLE_PAIRS.find((p) => p.id === id);
}

/** Full alphabet order (39 letters, including և). */
export function allCurriculumLetters(): string[] {
  return EASTERN_ARMENIAN_ALPHABET.map((e) => e.letter);
}

/** Latin scaffold for any letter in the Eastern Armenian alphabet. */
export function getLatinHintForLetter(letter: string): string {
  const hit = EASTERN_ARMENIAN_ALPHABET.find((e) => e.letter === letter);
  return hit?.latinHint ?? '';
}
