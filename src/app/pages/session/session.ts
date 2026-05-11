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
