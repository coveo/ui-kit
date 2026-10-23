import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly nav = [
    {path: '/', label: 'Home'},
    {path: '/search', label: 'Search'},
    {path: '/listing/surf-accessories', label: 'Surf Accessories'},
    {path: '/listing/toys', label: 'Toys'},
  ];
}
