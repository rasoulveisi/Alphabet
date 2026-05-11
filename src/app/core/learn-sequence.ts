import { CONFUSABLE_PAIRS, allCurriculumLetters, getLatinHintForLetter } from './curriculum';

export type LearnStep =
  | { readonly kind: 'alphabet-overview' }
  | {
      readonly kind: 'pair-intro';
      readonly pairId: string;
      readonly glyphs: readonly [string, string];
      readonly latinHints: readonly [string, string];
    }
  | {
      readonly kind: 'match-letter';
      readonly targetLetter: string;
      readonly latinFull: string;
      readonly options: readonly string[];
    };

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Learning path: full alphabet grid → confusable pairs → one guided match per letter.
 */
export function buildLearnSteps(random: () => number): LearnStep[] {
  const steps: LearnStep[] = [{ kind: 'alphabet-overview' }];
  for (const p of CONFUSABLE_PAIRS) {
    steps.push({
      kind: 'pair-intro',
      pairId: p.id,
      glyphs: p.glyphs,
      latinHints: p.latinHints,
    });
  }
  const letters = allCurriculumLetters();
  for (const letter of letters) {
    const foils = letters.filter((l) => l !== letter);
    const options = shuffle(
      [letter, ...shuffle(foils, random).slice(0, 3)],
      random,
    ) as string[];
    steps.push({
      kind: 'match-letter',
      targetLetter: letter,
      latinFull: getLatinHintForLetter(letter),
      options,
    });
  }
  return steps;
}
