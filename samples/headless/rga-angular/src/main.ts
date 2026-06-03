import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {CoveoSearchComponent} from './app/coveo-headless-rga.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CoveoSearchComponent],
  template: '<app-coveo-search></app-coveo-search>',
})
export class App {}

bootstrapApplication(App);
