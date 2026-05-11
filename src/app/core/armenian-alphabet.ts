/**
 * Eastern Armenian alphabet in standard order (39 letters, including և).
 * Latin hints are short pronunciation scaffolds for readers — not a language course.
 */
export interface AlphabetLetter {
  readonly letter: string;
  readonly latinHint: string;
}

/** Parallel to `ORDER` — one Latin hint per letter. */
const LATIN_HINTS: readonly string[] = [
  'a',
  'b',
  'g',
  'd',
  'e / ye',
  'z',
  'ē (eh)',
  'ə (uh)',
  't’',
  'zh',
  'i',
  'l',
  'kh',
  'ts',
  'k',
  'h',
  'dz',
  'ł / gh',
  'ch',
  'm',
  'y',
  'n',
  'sh',
  'o',
  'ch’',
  'p',
  'j',
  'ṙ',
  's',
  'v',
  't',
  'r',
  'ts’',
  'w / v',
  'p’',
  'k’',
  'o (open)',
  'f',
  'ev',
];

const ORDER =
  'աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆև';

function buildAlphabet(): readonly AlphabetLetter[] {
  const letters = [...ORDER];
  if (letters.length !== LATIN_HINTS.length) {
    throw new Error(
      `Alphabet length mismatch: ${letters.length} letters vs ${LATIN_HINTS.length} hints`,
    );
  }
  return letters.map((letter, i) => ({
    letter,
    latinHint: LATIN_HINTS[i] ?? '',
  }));
}

export const EASTERN_ARMENIAN_ALPHABET: readonly AlphabetLetter[] = buildAlphabet();
