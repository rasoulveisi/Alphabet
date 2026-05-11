import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { AppProgress, HintLevel } from '../core/models';
import {
  applyLetterResult,
  emptyProgress,
  loadProgress,
  progressStorageKey,
  saveProgress,
} from '../core/progress-storage';
import { ScriptContextService } from './script-context.service';

export interface LetterOutcome {
  readonly correct: boolean;
  readonly nextStreak: number;
  readonly nextHintLevel: HintLevel;
}

@Injectable()
export class ProgressService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ctx = inject(ScriptContextService);

  readonly state = signal<AppProgress>(emptyProgress());

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    effect(() => {
      const id = this.ctx.scriptId();
      if (!id) {
        this.state.set(emptyProgress());
        return;
      }
      this.state.set(loadProgress(progressStorageKey(id)));
    });
  }

  recordLetterOutcome(letterKey: string, outcome: LetterOutcome): void {
    const id = this.ctx.scriptId();
    if (!id || !isPlatformBrowser(this.platformId)) {
      return;
    }
    const key = progressStorageKey(id);
    const next = applyLetterResult(this.state(), letterKey, outcome);
    this.state.set(next);
    saveProgress(key, next);
  }
}
