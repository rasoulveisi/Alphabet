import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { isKnownScriptId } from '../../core/script-registry';
import { ProgressService } from '../../services/progress.service';
import { ScriptContextService } from '../../services/script-context.service';
import { PageNavBackController } from '../../services/page-nav-back.controller';
import { PageNav } from '../../ui/page-nav/page-nav';

@Component({
  selector: 'app-script-shell',
  imports: [RouterOutlet, PageNav],
  template: `
    <app-page-nav />
    <router-outlet />
  `,
  providers: [ScriptContextService, ProgressService, PageNavBackController],
})
export class ScriptShell {
  private readonly router = inject(Router);
  private readonly ctx = inject(ScriptContextService);

  constructor() {
    effect(() => {
      const id = this.ctx.scriptId();
      if (id && !isKnownScriptId(id)) {
        void this.router.navigate(['/']);
      }
    });
  }
}
