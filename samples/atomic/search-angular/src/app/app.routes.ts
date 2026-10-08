import type {Routes} from '@angular/router';
import {SearchPage} from './search-page/search-page';

export const routes: Routes = [
  {path: '', component: SearchPage},
  {path: '**', redirectTo: ''},
];
