import type {Routes} from '@angular/router';
import {HomePage} from './pages/home-page';
import {ListingPage} from './pages/listing-page';
import {SearchPage} from './pages/search-page';

// Render Atomic interfaces from routed pages rather than directly in the root
// component: a routed view is built before it is attached to the document, so
// product templates already contain their <template> child when Atomic connects.
// Each listing has its own route, so navigating between listings creates a new
// ListingPage (and a new engine) bound to that listing's catalog URL.
export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'search', component: SearchPage},
  {
    path: 'listing/surf-accessories',
    component: ListingPage,
    data: {
      title: 'Surf accessories',
      viewUrl: 'https://sports.barca.group/browse/promotions/surf-accessories',
    },
  },
  {
    path: 'listing/toys',
    component: ListingPage,
    data: {
      title: 'Toys',
      viewUrl: 'https://sports.barca.group/browse/promotions/toys',
    },
  },
  {path: '**', redirectTo: ''},
];
