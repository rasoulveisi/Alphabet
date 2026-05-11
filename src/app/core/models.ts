/** Latin-hint intensity: 2 = full scaffold, 1 = teaser, 0 = none (shape only). */
export type HintLevel = 0 | 1 | 2;

export interface ConfusablePair {
  readonly id: string;
  readonly glyphs: readonly [string, string];
  readonly latinHints: readonly [string, string];
}
