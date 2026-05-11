import { describe, expect, it } from 'vitest';
import {
  allCurriculumLetters,
  CONFUSABLE_PAIRS,
  getLatinHintForLetter,
  getPairById,
} from './curriculum';

describe('curriculum', () => {
  it('exposes at least three confusable pairs for MVP', () => {
    expect(CONFUSABLE_PAIRS.length).toBeGreaterThanOrEqual(3);
  });

  it('each pair has exactly two distinct Armenian glyphs', () => {
    for (const p of CONFUSABLE_PAIRS) {
      expect(p.glyphs.length).toBe(2);
      expect(p.glyphs[0]).not.toBe(p.glyphs[1]);
      expect(p.glyphs[0].length).toBe(1);
      expect(p.glyphs[1].length).toBe(1);
    }
  });

  it('getPairById returns pair or undefined', () => {
    const first = CONFUSABLE_PAIRS[0];
    expect(getPairById(first.id)).toEqual(first);
    expect(getPairById('__missing__')).toBeUndefined();
  });

  it('allCurriculumLetters returns the full Eastern Armenian alphabet in order', () => {
    const letters = allCurriculumLetters();
    expect(letters.length).toBe(39);
    expect(new Set(letters).size).toBe(letters.length);
  });

  it('getLatinHintForLetter returns hint for glyphs in curriculum', () => {
    expect(getLatinHintForLetter('է').length).toBeGreaterThan(0);
    expect(getLatinHintForLetter('ե').length).toBeGreaterThan(0);
    expect(getLatinHintForLetter('և').length).toBeGreaterThan(0);
    expect(getLatinHintForLetter('?')).toBe('');
  });
});
