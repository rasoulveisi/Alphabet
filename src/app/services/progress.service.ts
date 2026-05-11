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
