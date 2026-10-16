import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <nav>
      <a routerLink="/wrapper" routerLinkActive="active">&#64;coveo/atomic-angular wrapper</a>
      <a routerLink="/custom-elements" routerLinkActive="active">Atomic custom elements</a>
      <span data-testid="zone-status">zone.js loaded: {{ zoneLoaded ? 'yes' : 'no' }}</span>
    </nav>
    <router-outlet />
  `,
})
export class AppComponent {
  protected readonly zoneLoaded = 'Zone' in globalThis;
}
