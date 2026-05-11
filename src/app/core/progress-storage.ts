import type { AppProgress, HintLevel, LetterProgress } from './models';

export function progressStorageKey(scriptId: string): string {
  return `reading-trainer-v1-${scriptId}`;
}

export function emptyProgress(): AppProgress {
  return { version: 1, letters: {} };
}

export function loadProgress(key: string): AppProgress {
  const raw = globalThis.localStorage?.getItem(key);
  if (!raw) {
    return emptyProgress();
  }
  try {
    const parsed = JSON.parse(raw) as AppProgress;
    if (parsed?.version !== 1 || typeof parsed.letters !== 'object' || parsed.letters === null) {
      return emptyProgress();
    }
    return { version: 1, letters: { ...parsed.letters } };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(key: string, state: AppProgress): void {
  globalThis.localStorage?.setItem(key, JSON.stringify(state));
}

export interface LetterOutcomeInput {
  correct: boolean;
  nextStreak: number;
  nextHintLevel: HintLevel;
}

export function applyLetterResult(
  state: AppProgress,
  letterKey: string,
  outcome: LetterOutcomeInput,
): AppProgress {
  const prev: LetterProgress = state.letters[letterKey] ?? {
    hintLevel: 2,
    consecutiveCorrect: 0,
    wrongAnswers: 0,
  };

  const wrongAnswers = outcome.correct ? prev.wrongAnswers : prev.wrongAnswers + 1;

  const nextLetter: LetterProgress = {
    hintLevel: outcome.nextHintLevel,
    consecutiveCorrect: outcome.nextStreak,
    wrongAnswers,
  };

  return {
    version: 1,
    letters: { ...state.letters, [letterKey]: nextLetter },
  };
}
