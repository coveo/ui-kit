import type {Routes} from '@angular/router';
import {HomePage} from './home-page/home-page';
import {ListingPage} from './listing-page/listing-page';
import {SearchPage} from './search-page/search-page';

// Each listing is a route of its own rather than a `listing/:id` parameter, so
// navigating between listings recreates `ListingPage`, and with it the engine
// bound to that listing's catalog `viewUrl`.
export const routes: Routes = [
  {path: '', component: HomePage, title: 'Atomic Commerce Sample — Home'},
  {path: 'search', component: SearchPage, title: 'Atomic Commerce Sample — Search'},
  {
    path: 'listing/surf-accessories',
    component: ListingPage,
    title: 'Atomic Commerce Sample — Surf Accessories',
    data: {
      heading: 'Surf Accessories',
      viewUrl: 'https://sports.barca.group/browse/promotions/surf-accessories',
    },
  },
  {
    path: 'listing/toys',
    component: ListingPage,
    title: 'Atomic Commerce Sample — Toys',
    data: {
      heading: 'Toys',
      viewUrl: 'https://sports.barca.group/browse/promotions/toys',
    },
  },
  {path: '**', redirectTo: ''},
];
