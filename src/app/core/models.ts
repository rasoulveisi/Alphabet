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
