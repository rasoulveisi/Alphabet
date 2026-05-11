/** Latin-hint intensity: 2 = full scaffold, 1 = teaser, 0 = none (shape only). */
export type HintLevel = 0 | 1 | 2;

export interface ConfusablePair {
  readonly id: string;
  readonly glyphs: readonly [string, string];
  readonly latinHints: readonly [string, string];
}

export interface LetterProgress {
  readonly hintLevel: HintLevel;
  readonly consecutiveCorrect: number;
  readonly wrongAnswers: number;
}

export interface AppProgress {
  readonly version: 1;
  readonly letters: Readonly<Record<string, LetterProgress>>;
}

export interface LetterPickExercise {
  readonly kind: 'letter-pick';
  readonly targetLetter: string;
  readonly latinFull: string;
  readonly options: readonly string[];
}

export interface MinimalPairExercise {
  readonly kind: 'minimal-pair';
  readonly pairId: string;
  readonly targetLetter: string;
  readonly latinFull: string;
  readonly glyphs: readonly [string, string];
}

export type Exercise = LetterPickExercise | MinimalPairExercise;
