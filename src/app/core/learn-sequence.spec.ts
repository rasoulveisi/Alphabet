import { describe, expect, it } from 'vitest';
import { buildLearnSteps } from './learn-sequence';
import { allCurriculumLetters, CONFUSABLE_PAIRS } from './curriculum';

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

describe('learn-sequence', () => {
  it('starts with one pair-intro per curriculum pair', () => {
    const steps = buildLearnSteps(rng(1));
    const intros = steps.filter((s) => s.kind === 'pair-intro');
    expect(intros.length).toBe(CONFUSABLE_PAIRS.length);
    for (let i = 0; i < CONFUSABLE_PAIRS.length; i++) {
      expect(intros[i]?.pairId).toBe(CONFUSABLE_PAIRS[i]?.id);
    }
  });

  it('ends with match-letter steps that have four unique options', () => {
    const steps = buildLearnSteps(rng(2));
    const matches = steps.filter((s) => s.kind === 'match-letter');
    expect(matches.length).toBe(allCurriculumLetters().length);
    for (const m of matches) {
      expect(m.options.length).toBe(4);
      expect(new Set(m.options).size).toBe(4);
      expect(m.options.includes(m.targetLetter)).toBe(true);
    }
  });
});
