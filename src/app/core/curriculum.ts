import type { ConfusablePair } from './models';

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

/** Latin scaffold for a single Armenian glyph from the curriculum table. */
export function getLatinHintForLetter(letter: string): string {
  for (const p of CONFUSABLE_PAIRS) {
    const i = p.glyphs.indexOf(letter);
    if (i >= 0) {
      return p.latinHints[i] ?? '';
    }
  }
  return '';
}

export function allCurriculumLetters(): string[] {
  const set = new Set<string>();
  for (const p of CONFUSABLE_PAIRS) {
    set.add(p.glyphs[0]);
    set.add(p.glyphs[1]);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'hy'));
}
