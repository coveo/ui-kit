import {startPage} from './page.js';

// Home page: a standalone Atomic search box that redirects to the search page,
// and Atomic recommendation lists. Each recommendation card carries a Headless
// add-to-cart button. The standalone search box only redirects, so nothing is
// executed here; the recommendation lists fetch on initialization.
await startPage('https://sports.barca.group');
