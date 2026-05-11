import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageNavBackController } from '../../services/page-nav-back.controller';

@Component({
  selector: 'app-page-nav',
  imports: [RouterLink],
  template: `
    <nav
      class="mx-auto mb-3 flex max-w-md items-center justify-between gap-3 border-b border-neutral-200 pb-3"
      aria-label="Page"
    >
      <button
        type="button"
        class="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-900 outline-none transition-colors active:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        (click)="goBack()"
        aria-label="Go back"
      >
        Back
      </button>
      <a
        routerLink="/"
        class="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-lg border border-neutral-900 bg-neutral-900 px-3 text-sm font-semibold text-white outline-none transition-colors active:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        aria-label="Letterwise home — choose a script"
      >
        Home
      </a>
    </nav>
  `,
})
export class PageNav {
  private readonly location = inject(Location);
  private readonly navBack = inject(PageNavBackController, { optional: true });

  protected goBack(): void {
    if (this.navBack) {
      this.navBack.goBack();
      return;
    }
    this.location.back();
  }
}
