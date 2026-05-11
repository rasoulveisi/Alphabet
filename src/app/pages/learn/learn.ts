import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EASTERN_ARMENIAN_ALPHABET } from '../../core/armenian-alphabet';
import { buildLearnSteps } from '../../core/learn-sequence';
import { LetterPick } from '../../exercises/letter-pick/letter-pick';

@Component({
  selector: 'app-learn',
  imports: [LetterPick, RouterLink],
  templateUrl: './learn.html',
})
export class Learn {
  protected readonly alphabet = EASTERN_ARMENIAN_ALPHABET;

  private readonly steps = buildLearnSteps(Math.random);

  protected readonly index = signal(0);
  protected readonly current = computed(() => this.steps[this.index()] ?? null);
  protected readonly done = computed(() => this.index() >= this.steps.length);
  protected readonly stepLabel = computed(
    () => `${Math.min(this.index() + 1, this.steps.length)} / ${this.steps.length}`,
  );

  protected readonly showWrong = signal(false);

  protected nextFromIntro(): void {
    this.showWrong.set(false);
    this.index.update((i) => i + 1);
  }

  protected onLearnMatch(letter: string, correct: boolean): void {
    if (correct) {
      this.showWrong.set(false);
      this.index.update((i) => i + 1);
      return;
    }
    this.showWrong.set(true);
  }
}
