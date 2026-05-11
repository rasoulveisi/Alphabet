# Armenian Script Decode MVP (Approach A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a mobile-first, offline Angular app that teaches **visual decoding** of Eastern Armenian letters using a **confusable-first** curriculum, two exercise types (letter identification and minimal-pair discrimination), Latin hint scaffolding that **fades with local mastery**, and **weak-letter** interleaving—no backend, accounts, AI, or gamification economies.

**Architecture:** Keep **domain logic pure** in `src/app/core/` (curriculum data, session construction, hint rules, storage serialization). Expose browser persistence through a single **`ProgressService`** (`providedIn: 'root'`) that reads/writes `localStorage` only on the browser platform. Route-level **pages** under `src/app/pages/` orchestrate a linear **practice session** composed of dumb **exercise child components** that emit `(answered)` events. Styling stays token-based in **component CSS** for mobile-first layout.

**Tech Stack:** Angular 21 (standalone components, signals, `provideRouter`), TypeScript 5.9, Vitest via `ng test`, RxJS (bundled; use only if needed), `localStorage`.

---

## File structure (create / modify)

| Path | Responsibility |
|------|----------------|
| `src/app/core/models.ts` | Shared types: exercises, session, letter progress, curriculum records. |
| `src/app/core/curriculum.ts` | `CONFUSABLE_PAIRS`, `allCurriculumLetters()`, ordered list for Approach A. |
| `src/app/core/hint-policy.ts` | Map `hintLevel` → Latin scaffold string; rules after correct/wrong. |
| `src/app/core/progress-storage.ts` | `emptyProgress`, `loadProgress`, `saveProgress`, `applyLetterResult` (immutable updates). |
| `src/app/core/session-builder.ts` | `buildSessionExercises(progress, options)` → ordered `Exercise[]` with shuffled options. |
| `src/app/core/curriculum.spec.ts` | Tests for curriculum invariants. |
| `src/app/core/hint-policy.spec.ts` | Tests for hint strings and level transitions. |
| `src/app/core/progress-storage.spec.ts` | Tests with `localStorage` stub. |
| `src/app/core/session-builder.spec.ts` | Deterministic RNG tests for exercise shape. |
| `src/app/services/progress.service.ts` | Signal-backed progress + `recordLetterOutcome`. |
| `src/app/services/progress.service.spec.ts` | `TestBed` + fake platform or service instantiation with DI overrides. |
| `src/app/pages/home/home.ts` | Landing: start session, show last session summary snippet. |
| `src/app/pages/home/home.html` | Template (inline if preferred—match project style: separate `.html`). |
| `src/app/pages/home/home.css` | Mobile-first layout for home. |
| `src/app/pages/home/home.spec.ts` | Smoke test for CTA. |
| `src/app/pages/session/session.ts` | Session host: iterates exercises, wires `ProgressService`. |
| `src/app/pages/session/session.html` | Router-outlet alternative: single template with `@switch` on current exercise. |
| `src/app/pages/session/session.css` | Touch targets, max-width container. |
| `src/app/pages/session/session.spec.ts` | Host logic with fake child events (optional component test). |
| `src/app/exercises/letter-pick/letter-pick.ts` | Letter-ID UI: Latin scaffold per hint level + four Armenian options. |
| `src/app/exercises/letter-pick/letter-pick.html` | Four large tap targets. |
| `src/app/exercises/letter-pick/letter-pick.css` | 44px min tap height, spacing. |
| `src/app/exercises/letter-pick/letter-pick.spec.ts` | Emits correct event on tap. |
| `src/app/exercises/minimal-pair-pick/minimal-pair-pick.ts` | Two glyphs + prompt for target. |
| `src/app/exercises/minimal-pair-pick/minimal-pair-pick.html` | Two buttons. |
| `src/app/exercises/minimal-pair-pick/minimal-pair-pick.css` | Side-by-side responsive. |
| `src/app/exercises/minimal-pair-pick/minimal-pair-pick.spec.ts` | Emits on tap. |
| `src/app/app.routes.ts` | Routes: `''` → home, `'session'` → session. |
| `src/app/app.ts` | Shell: `RouterOutlet` only (remove demo title signal if unused). |
| `src/app/app.html` | Minimal shell (remove CLI placeholder). |
| `src/app/app.css` | Global host layout reset if needed. |
| `src/app/app.spec.ts` | Update smoke test for router (navigate stub or shallow outlet). |
| `src/styles.css` | CSS variables: font stack including system Armenian-capable fonts. |

---

### Task 1: Core models and confusable-first curriculum

**Files:**
- Create: `src/app/core/models.ts`
- Create: `src/app/core/curriculum.ts`
- Create: `src/app/core/curriculum.spec.ts`
- Test: `src/app/core/curriculum.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/core/curriculum.spec.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { allCurriculumLetters, CONFUSABLE_PAIRS, getPairById } from './curriculum';

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

  it('allCurriculumLetters returns unique sorted code points from pairs', () => {
    const letters = allCurriculumLetters();
    expect(new Set(letters).size).toBe(letters.length);
    expect(letters.length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/curriculum.spec.ts'
```

Expected: FAIL with messages such as `Cannot find module './curriculum'` or `CONFUSABLE_PAIRS is not exported`.

- [ ] **Step 3: Write minimal implementation**

Create `src/app/core/models.ts`:

```typescript
/** Latin-hint intensity: 2 = full scaffold, 1 = teaser, 0 = none (shape only). */
export type HintLevel = 0 | 1 | 2;

export interface ConfusablePair {
  readonly id: string;
  /** Exactly two single-character Armenian glyphs that learners confuse. */
  readonly glyphs: readonly [string, string];
  /** Latin scaffolding for hint fading — not vocabulary teaching. */
  readonly latinHints: readonly [string, string];
}
```

Create `src/app/core/curriculum.ts`:

```typescript
import type { ConfusablePair } from './models';

/**
 * Confusable-first seed curriculum (Eastern Armenian script).
 * Expand by appending pairs; `allCurriculumLetters` derives the active alphabet subset.
 */
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

export function allCurriculumLetters(): string[] {
  const set = new Set<string>();
  for (const p of CONFUSABLE_PAIRS) {
    set.add(p.glyphs[0]);
    set.add(p.glyphs[1]);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'hy'));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/curriculum.spec.ts'
```

Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
cd /Users/rasoul/rasoul/Alphabet && git add src/app/core/models.ts src/app/core/curriculum.ts src/app/core/curriculum.spec.ts && git commit -m "feat(core): add confusable-first curriculum data and tests"
```

---

### Task 2: Hint policy (Latin scaffold fading)

**Files:**
- Create: `src/app/core/hint-policy.ts`
- Create: `src/app/core/hint-policy.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/core/hint-policy.spec.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { latinScaffoldForHint, nextHintLevelAfterResult } from './hint-policy';

describe('hint-policy', () => {
  it('level 2 shows full Latin hint', () => {
    expect(latinScaffoldForHint('է', 2, 'ē (eh)')).toBe('ē (eh)');
  });

  it('level 1 shows only first grapheme cluster as teaser', () => {
    expect(latinScaffoldForHint('է', 1, 'ē (eh)')).toBe('ē…');
  });

  it('level 0 hides Latin completely', () => {
    expect(latinScaffoldForHint('է', 0, 'ē (eh)')).toBe('');
  });

  it('after three consecutive correct, hint level steps down until zero', () => {
    expect(nextHintLevelAfterResult(2, true, 2)).toBe(2);
    expect(nextHintLevelAfterResult(2, true, 3)).toBe(1);
    expect(nextHintLevelAfterResult(1, true, 3)).toBe(0);
    expect(nextHintLevelAfterResult(0, true, 99)).toBe(0);
  });

  it('wrong answer resets streak and raises hint toward max', () => {
    expect(nextHintLevelAfterResult(0, false, 3)).toBe(1);
    expect(nextHintLevelAfterResult(1, false, 0)).toBe(2);
    expect(nextHintLevelAfterResult(2, false, 0)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/hint-policy.spec.ts'
```

Expected: FAIL (module or export missing).

- [ ] **Step 3: Write minimal implementation**

Create `src/app/core/hint-policy.ts`:

```typescript
import type { HintLevel } from './models';

const MAX_LEVEL: HintLevel = 2;

export function latinScaffoldForHint(
  _letter: string,
  level: HintLevel,
  fullLatin: string,
): string {
  if (level >= 2) {
    return fullLatin;
  }
  if (level === 1) {
    const trimmed = fullLatin.trim();
    if (!trimmed) {
      return '';
    }
    const first = trimmed.codePointAt(0);
    if (first === undefined) {
      return '';
    }
    const firstChar = String.fromCodePoint(first);
    return `${firstChar}…`;
  }
  return '';
}

/**
 * @param currentLevel current hint scaffolding level
 * @param correct whether the learner answered correctly
 * @param newStreak consecutive correct after this answer is applied
 */
export function nextHintLevelAfterResult(
  currentLevel: HintLevel,
  correct: boolean,
  newStreak: number,
): HintLevel {
  if (!correct) {
    return (Math.min(MAX_LEVEL, currentLevel + 1) as HintLevel);
  }
  if (newStreak < 3) {
    return currentLevel;
  }
  return (Math.max(0, currentLevel - 1) as HintLevel);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/hint-policy.spec.ts'
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/rasoul/rasoul/Alphabet && git add src/app/core/hint-policy.ts src/app/core/hint-policy.spec.ts && git commit -m "feat(core): add Latin hint fading policy"
```

---

### Task 3: Progress storage (local only, immutable updates)

**Files:**
- Modify: `src/app/core/models.ts` — append `LetterProgress` and `AppProgress` (single source of truth for `HintLevel` remains `models.ts` from Task 1)

Append to `models.ts`:

```typescript
export interface LetterProgress {
  readonly hintLevel: HintLevel;
  /** Consecutive correct answers for this letter at the current exercise types. */
  readonly consecutiveCorrect: number;
  readonly wrongAnswers: number;
}

export interface AppProgress {
  readonly version: 1;
  readonly letters: Readonly<Record<string, LetterProgress>>;
}
```

- Create: `src/app/core/progress-storage.ts`
- Create: `src/app/core/progress-storage.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/core/progress-storage.spec.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/progress-storage.spec.ts'
```

Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Create `src/app/core/progress-storage.ts`:

```typescript
import type { AppProgress, HintLevel, LetterProgress } from './models';

export const STORAGE_KEY = 'armenian-decode-progress-v1';

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
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/progress-storage.spec.ts'
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/rasoul/rasoul/Alphabet && git add src/app/core/models.ts src/app/core/progress-storage.ts src/app/core/progress-storage.spec.ts && git commit -m "feat(core): add local progress storage and letter outcomes"
```

If `hint-policy.ts` was not yet updated in Task 2 to import `HintLevel` from `./models`, amend that import in this task before committing.

---

### Task 4: Session builder (mixed exercises + deterministic shuffle)

**Files:**
- Create: `src/app/core/session-builder.ts`
- Create: `src/app/core/session-builder.spec.ts`
- Modify: `src/app/core/models.ts` — add `Exercise` union type

Append to `models.ts`:

```typescript
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
```

Create `src/app/core/session-builder.ts`:

```typescript
import { CONFUSABLE_PAIRS } from './curriculum';
import type { AppProgress, Exercise } from './models';
import { allCurriculumLetters } from './curriculum';

export interface BuildSessionOptions {
  /** Injected pseudo-random; default `Math.random`. Tests pass a seeded PRNG. */
  readonly random: () => number;
  readonly exerciseCount: number;
}

function pickWeightedWeakLetters(progress: AppProgress, limit: number): string[] {
  const entries = Object.entries(progress.letters);
  entries.sort((a, b) => b[1].wrongAnswers - a[1].wrongAnswers);
  const keys = entries.map(([k]) => k);
  const pool = keys.length ? keys : allCurriculumLetters();
  return pool.slice(0, limit);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function randomItem<T>(arr: readonly T[], random: () => number): T {
  return arr[Math.floor(random() * arr.length)] as T;
}

function latinForLetter(letter: string): string {
  for (const p of CONFUSABLE_PAIRS) {
    const i = p.glyphs.indexOf(letter);
    if (i >= 0) {
      return p.latinHints[i] ?? '';
    }
  }
  return '';
}

function buildLetterPick(weak: string[], random: () => number): Exercise {
  const letters = allCurriculumLetters();
  const target = weak.length ? randomItem(weak, random) : randomItem(letters, random);
  const foils = letters.filter((l) => l !== target);
  const options = shuffle([target, ...shuffle(foils, random).slice(0, 3)], random);
  return {
    kind: 'letter-pick',
    targetLetter: target,
    latinFull: latinForLetter(target),
    options,
  };
}

function buildMinimalPair(random: () => number): Exercise {
  const pair = randomItem([...CONFUSABLE_PAIRS], random);
  const targetIdx = random() < 0.5 ? 0 : 1;
  const targetLetter = pair.glyphs[targetIdx] ?? pair.glyphs[0];
  return {
    kind: 'minimal-pair',
    pairId: pair.id,
    targetLetter,
    latinFull: pair.latinHints[targetIdx] ?? '',
    glyphs: pair.glyphs,
  };
}

export function buildSessionExercises(progress: AppProgress, opts: BuildSessionOptions): Exercise[] {
  const { random, exerciseCount } = opts;
  const weak = pickWeightedWeakLetters(progress, 6);
  const out: Exercise[] = [];
  for (let i = 0; i < exerciseCount; i++) {
    const mix = i % 3 === 0 ? buildMinimalPair(random) : buildLetterPick(weak, random);
    out.push(mix);
  }
  return out;
}
```

- [ ] **Step 1: Write the failing test**

Create `src/app/core/session-builder.spec.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { buildSessionExercises } from './session-builder';
import { emptyProgress } from './progress-storage';

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

describe('session-builder', () => {
  it('returns requested length', () => {
    const exercises = buildSessionExercises(emptyProgress(), {
      random: rng(42),
      exerciseCount: 8,
    });
    expect(exercises.length).toBe(8);
  });

  it('letter-pick exercises have four unique options including target', () => {
    const exercises = buildSessionExercises(emptyProgress(), {
      random: rng(1),
      exerciseCount: 10,
    });
    for (const ex of exercises) {
      if (ex.kind === 'letter-pick') {
        expect(ex.options.length).toBe(4);
        expect(new Set(ex.options).size).toBe(4);
        expect(ex.options.includes(ex.targetLetter)).toBe(true);
      }
    }
  });

  it('minimal-pair exercises reference known pair id', () => {
    const exercises = buildSessionExercises(emptyProgress(), {
      random: rng(2),
      exerciseCount: 9,
    });
    for (const ex of exercises) {
      if (ex.kind === 'minimal-pair') {
        expect(ex.glyphs[0]).not.toBe(ex.glyphs[1]);
        expect([ex.glyphs[0], ex.glyphs[1]].includes(ex.targetLetter)).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/session-builder.spec.ts'
```

Expected: FAIL.

- [ ] **Step 3: Implement** (included above in Step 3 block for Task 4 — create `session-builder.ts`).

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/session-builder.spec.ts'
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/rasoul/rasoul/Alphabet && git add src/app/core/models.ts src/app/core/session-builder.ts src/app/core/session-builder.spec.ts && git commit -m "feat(core): add session exercise builder"
```

---

### Task 5: ProgressService (Angular integration)

**Files:**
- Create: `src/app/services/progress.service.ts`
- Create: `src/app/services/progress.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/services/progress.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { PLATFORM_ID } from '@angular/core';
import { ProgressService } from './progress.service';
import { STORAGE_KEY } from '../core/progress-storage';

describe('ProgressService', () => {
  afterEach(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, ProgressService],
    });
  });

  it('loads empty state when storage empty', () => {
    const svc = TestBed.inject(ProgressService);
    expect(svc.state().letters).toEqual({});
  });

  it('recordLetterOutcome updates hint and streak', () => {
    const svc = TestBed.inject(ProgressService);
    svc.recordLetterOutcome('է', { correct: true, nextStreak: 3, nextHintLevel: 1 });
    expect(svc.state().letters['է']?.hintLevel).toBe(1);
    expect(svc.state().letters['է']?.consecutiveCorrect).toBe(3);
  });

  it('persists to localStorage when browser', () => {
    const svc = TestBed.inject(ProgressService);
    svc.recordLetterOutcome('ե', { correct: false, nextStreak: 0, nextHintLevel: 2 });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).letters['ե'].wrongAnswers).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/progress.service.spec.ts'
```

Expected: FAIL (`ProgressService` missing).

- [ ] **Step 3: Write minimal implementation**

Create `src/app/services/progress.service.ts`:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import type { AppProgress, HintLevel } from '../core/models';
import {
  applyLetterResult,
  emptyProgress,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
} from '../core/progress-storage';

export interface LetterOutcome {
  readonly correct: boolean;
  readonly nextStreak: number;
  readonly nextHintLevel: HintLevel;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly state = signal<AppProgress>(emptyProgress());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.state.set(loadProgress(STORAGE_KEY));
    }
  }

  recordLetterOutcome(letterKey: string, outcome: LetterOutcome): void {
    const next = applyLetterResult(this.state(), letterKey, outcome);
    this.state.set(next);
    if (isPlatformBrowser(this.platformId)) {
      saveProgress(STORAGE_KEY, next);
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/progress.service.spec.ts'
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/rasoul/rasoul/Alphabet && git add src/app/services/progress.service.ts src/app/services/progress.service.spec.ts && git commit -m "feat(services): add ProgressService with localStorage"
```

---

### Task 6: Routes, shell, and Home page

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/app.ts`
- Modify: `src/app/app.html`
- Modify: `src/app/app.css`
- Modify: `src/app/app.spec.ts`
- Create: `src/app/pages/home/home.ts`
- Create: `src/app/pages/home/home.html`
- Create: `src/app/pages/home/home.css`
- Create: `src/app/pages/home/home.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/pages/home/home.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home, RouterModule.forRoot([])],
    }).compileComponents();
  });

  it('should show start practice action', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Start');
  });
});
```

Update `src/app/app.spec.ts` to assert router-outlet instead of CLI h1 (replace second test):

```typescript
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have a router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/home.spec.ts'
```

Expected: FAIL (Home missing).

- [ ] **Step 3: Write minimal implementation**

`src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'session',
    loadComponent: () => import('./pages/session/session').then((m) => m.Session),
  },
];
```

`src/app/app.ts` (keep `RouterOutlet`):

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
```

`src/app/app.html`:

```html
<main class="shell">
  <router-outlet />
</main>
```

`src/app/app.css`:

```css
.shell {
  min-height: 100dvh;
  margin: 0 auto;
  max-width: 28rem;
  padding: 1rem;
}
```

`src/app/pages/home/home.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
```

`src/app/pages/home/home.html`:

```html
<section class="home">
  <h1 class="title">Armenian script</h1>
  <p class="lede">Decode letters you see on signs — not a language course.</p>
  <a class="primary" routerLink="/session">Start practice</a>
</section>
```

`src/app/pages/home/home.css`:

```css
.home {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 650;
  margin: 0;
}

.lede {
  margin: 0;
  line-height: 1.5;
  color: var(--muted, #555);
}

.primary {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
  padding: 0 1rem;
  border-radius: 0.5rem;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}
```

Create a **stub** `src/app/pages/session/session.ts` so lazy route resolves (Session implemented in Task 7):

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-session',
  template: '<p>session placeholder</p>',
})
export class Session {}
```

- [ ] **Step 4: Run tests**

Run:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false --include='**/app.spec.ts' --include='**/home.spec.ts'
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/rasoul/rasoul/Alphabet && git add src/app/app.routes.ts src/app/app.ts src/app/app.html src/app/app.css src/app/app.spec.ts src/app/pages/home/home.ts src/app/pages/home/home.html src/app/pages/home/home.css src/app/pages/home/home.spec.ts src/app/pages/session/session.ts && git commit -m "feat(app): add routes, shell, and home page stub session"
```

---

### Task 7: Exercise components and Session page

**Files:**
- Create: `src/app/exercises/letter-pick/letter-pick.ts` (+ `.html`, `.css`, `.spec.ts`)
- Create: `src/app/exercises/minimal-pair-pick/minimal-pair-pick.ts` (+ `.html`, `.css`, `.spec.ts`)
- Modify: `src/app/pages/session/session.ts`
- Create: `src/app/pages/session/session.html`
- Create: `src/app/pages/session/session.css`
- Create: `src/app/pages/session/session.spec.ts`

**Letter pick component** — `letter-pick.ts`:

```typescript
import { Component, input, output } from '@angular/core';
import { latinScaffoldForHint } from '../../core/hint-policy';
import type { HintLevel } from '../../core/models';

@Component({
  selector: 'app-letter-pick',
  imports: [],
  templateUrl: './letter-pick.html',
  styleUrl: './letter-pick.css',
})
export class LetterPick {
  readonly targetLetter = input.required<string>();
  readonly latinFull = input.required<string>();
  readonly hintLevel = input.required<HintLevel>();
  readonly options = input.required<readonly string[]>();

  readonly chosen = output<string>();

  protected scaffold(): string {
    return latinScaffoldForHint(this.targetLetter(), this.hintLevel(), this.latinFull());
  }

  protected pick(letter: string): void {
    this.chosen.emit(letter);
  }
}
```

`letter-pick.html`:

```html
<section class="card">
  <p class="prompt">Tap the matching letter.</p>
  @if (scaffold(); as hint) {
    <p class="hint" data-testid="latin-hint">{{ hint }}</p>
  }
  <div class="grid">
    @for (opt of options(); track opt) {
      <button type="button" class="tile" (click)="pick(opt)">{{ opt }}</button>
    }
  </div>
</section>
```

`letter-pick.spec.ts` (key behavior):

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { LetterPick } from './letter-pick';

describe('LetterPick', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterPick],
    }).compileComponents();
  });

  it('emits chosen letter', () => {
    const fixture = TestBed.createComponent(LetterPick);
    fixture.setInput('targetLetter', 'է');
    fixture.setInput('latinFull', 'ē (eh)');
    fixture.setInput('hintLevel', 2);
    fixture.setInput('options', ['է', 'ե', 'ի', 'վ']);
    let out = '';
    fixture.componentInstance.chosen.subscribe((c) => (out = c));
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button.tile');
    (buttons[0] as HTMLButtonElement).click();
    expect(out).toBe('է');
  });
});
```

**Minimal pair component** — `minimal-pair-pick.ts`:

```typescript
import { Component, input, output } from '@angular/core';
import { latinScaffoldForHint } from '../../core/hint-policy';
import type { HintLevel } from '../../core/models';

@Component({
  selector: 'app-minimal-pair-pick',
  imports: [],
  templateUrl: './minimal-pair-pick.html',
  styleUrl: './minimal-pair-pick.css',
})
export class MinimalPairPick {
  readonly glyphs = input.required<readonly [string, string]>();
  readonly targetLetter = input.required<string>();
  readonly latinFull = input.required<string>();
  readonly hintLevel = input.required<HintLevel>();

  readonly chosen = output<string>();

  protected scaffold(): string {
    return latinScaffoldForHint(this.targetLetter(), this.hintLevel(), this.latinFull());
  }

  protected pick(letter: string): void {
    this.chosen.emit(letter);
  }
}
```

`minimal-pair-pick.html`:

```html
<section class="card">
  <p class="prompt">Which letter matches the hint?</p>
  @if (scaffold(); as hint) {
    <p class="hint">{{ hint }}</p>
  }
  <div class="pair">
    <button type="button" class="tile" (click)="pick(glyphs()[0])">{{ glyphs()[0] }}</button>
    <button type="button" class="tile" (click)="pick(glyphs()[1])">{{ glyphs()[1] }}</button>
  </div>
</section>
```

**Session page** — `session.ts` (orchestration; implementer fills template URL):

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { buildSessionExercises } from '../../core/session-builder';
import type { Exercise } from '../../core/models';
import { nextHintLevelAfterResult } from '../../core/hint-policy';
import { LetterPick } from '../../exercises/letter-pick/letter-pick';
import { MinimalPairPick } from '../../exercises/minimal-pair-pick/minimal-pair-pick';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-session',
  imports: [LetterPick, MinimalPairPick, RouterLink],
  templateUrl: './session.html',
  styleUrl: './session.css',
})
export class Session {
  private readonly progress = inject(ProgressService);

  private readonly exercises = signal<Exercise[]>(
    buildSessionExercises(this.progress.state(), {
      random: Math.random,
      exerciseCount: 8,
    }),
  );

  protected readonly index = signal(0);
  protected readonly current = computed(() => this.exercises()[this.index()] ?? null);
  protected readonly done = computed(() => this.index() >= this.exercises().length);

  protected hintFor(letter: string) {
    return this.progress.state().letters[letter]?.hintLevel ?? 2;
  }

  protected onAnswer(letterKey: string, correct: boolean): void {
    const prev = this.progress.state().letters[letterKey] ?? {
      hintLevel: 2 as const,
      consecutiveCorrect: 0,
      wrongAnswers: 0,
    };
    const nextStreak = correct ? prev.consecutiveCorrect + 1 : 0;
    const nextHint = nextHintLevelAfterResult(prev.hintLevel, correct, nextStreak);
    this.progress.recordLetterOutcome(letterKey, {
      correct,
      nextStreak,
      nextHintLevel: nextHint,
    });
    this.index.update((i) => i + 1);
  }
}
```

`session.html` (outline):

```html
@if (done()) {
  <section class="summary">
    <h2>Session complete</h2>
    <a routerLink="/">Back home</a>
  </section>
} @else if (current(); as ex) {
  @switch (ex.kind) {
    @case ('letter-pick') {
      <app-letter-pick
        [targetLetter]="ex.targetLetter"
        [latinFull]="ex.latinFull"
        [hintLevel]="hintFor(ex.targetLetter)"
        [options]="ex.options"
        (chosen)="onAnswer(ex.targetLetter, $event === ex.targetLetter)"
      />
    }
    @case ('minimal-pair') {
      <app-minimal-pair-pick
        [glyphs]="ex.glyphs"
        [targetLetter]="ex.targetLetter"
        [latinFull]="ex.latinFull"
        [hintLevel]="hintFor(ex.targetLetter)"
        (chosen)="onAnswer(ex.targetLetter, $event === ex.targetLetter)"
      />
    }
  }
}
```

- [ ] **Step 1:** Add `letter-pick.spec.ts` minimal test and `session.spec.ts` smoke (session shows summary after advancing index — optional mock `ProgressService`).

- [ ] **Step 2:** Run `npx ng test --watch=false` for included specs.

- [ ] **Step 3:** Implement files listed (full `.css` files: use `min-height: 48px` on `.tile`, `font-size: clamp(2rem, 8vw, 3.5rem)` for Armenian glyphs).

- [ ] **Step 4:** Run full suite:

```bash
cd /Users/rasoul/rasoul/Alphabet && npx ng test --watch=false
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/rasoul/rasoul/Alphabet && git add src/app/exercises src/app/pages/session && git commit -m "feat(session): wire letter pick and minimal pair exercises"
```

---

### Task 8: Global styles, a11y, and production smoke

**Files:**
- Modify: `src/styles.css`
- Modify: `src/index.html` (set `<title>` and `lang="en"`)
- Modify: exercise CSS files for `:focus-visible` outlines

- [ ] **Step 1:** Add to `src/styles.css`:

```css
:root {
  font-family:
    system-ui,
    'Noto Sans Armenian',
    'Segoe UI Armenian',
    sans-serif;
  color: #111;
  background: #fafafa;
}

body {
  margin: 0;
}
```

- [ ] **Step 2:** Add `outline: 2px solid #2563eb` for `button:focus-visible` in `letter-pick.css` and `minimal-pair-pick.css`.

- [ ] **Step 3:** Run `npx ng build` — expect success.

- [ ] **Step 4:** Manual smoke: `npx ng serve`, tap through session on narrow viewport.

- [ ] **Step 5: Commit**

```bash
cd /Users/rasoul/rasoul/Alphabet && git add src/styles.css src/index.html src/app/exercises && git commit -m "chore(ui): mobile-first fonts and focus styles"
```

---

## Spec coverage (self-review)

| Brainstorm / Approach A requirement | Task |
|-------------------------------------|------|
| Confusable-first curriculum | Task 1 |
| Letter identification + minimal-pair types | Tasks 4, 7 |
| Latin hint fades with mastery | Tasks 2, 3, 5, 7 |
| Local-only progress | Tasks 3, 5 |
| Weak-letter weighting in sessions | Task 4 (`pickWeightedWeakLetters`) |
| No backend / accounts / AI | Architecture (no tasks add server) |
| Mobile-first UI | Tasks 6–8 |

**Placeholder scan:** None intentional; `HintLevel` is defined only in `models.ts` (Task 1); import it from there everywhere.

**Type consistency:** `LetterOutcome.nextHintLevel` must use the same `HintLevel` type as `LetterProgress.hintLevel` and `latinScaffoldForHint`.

---

## Plan complete and saved to `docs/superpowers/plans/2026-05-11-armenian-script-decode-mvp.md`. Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
