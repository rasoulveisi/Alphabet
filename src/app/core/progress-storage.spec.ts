import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyLetterResult,
  emptyProgress,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
} from './progress-storage';

describe('progress-storage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('emptyProgress returns versioned empty map', () => {
    const p = emptyProgress();
    expect(p.version).toBe(1);
    expect(Object.keys(p.letters).length).toBe(0);
  });

  it('save and load round-trip', () => {
    const initial = emptyProgress();
    const updated = applyLetterResult(initial, 'է', {
      correct: true,
      nextStreak: 1,
      nextHintLevel: 2,
    });
    saveProgress(STORAGE_KEY, updated);
    const loaded = loadProgress(STORAGE_KEY);
    expect(loaded.letters['է']?.consecutiveCorrect).toBe(1);
  });

  it('applyLetterResult creates letter entry if missing', () => {
    const next = applyLetterResult(emptyProgress(), 'ե', {
      correct: false,
      nextStreak: 0,
      nextHintLevel: 2,
    });
    expect(next.letters['ե']?.wrongAnswers).toBe(1);
    expect(next.letters['ե']?.consecutiveCorrect).toBe(0);
  });
});
