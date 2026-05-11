import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALL_SCRIPTS } from '../../core/script-registry';
import { PageNav } from '../../ui/page-nav/page-nav';

@Component({
  selector: 'app-home',
  imports: [RouterLink, PageNav],
  templateUrl: './home.html',
})
export class Home {
  protected readonly scripts = ALL_SCRIPTS;
}
