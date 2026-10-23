import type {Routes} from '@angular/router';
import {SearchPage} from './pages/search-page';

// Render Atomic interfaces from routed pages rather than directly in the root
// component: a routed view is built before it is attached to the document, so
// result templates already contain their <template> child when Atomic connects.
export const routes: Routes = [
  {path: '', component: SearchPage},
  {path: '**', redirectTo: ''},
];
