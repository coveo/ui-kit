import './components/headless-search-box.js';
import {startPage} from './page.js';

// Search page: standard Atomic (facets, sort, pager, product grid), with a
// minimal Headless search box and a Headless add-to-cart button in each card.
const engine = await startPage('https://sports.barca.group/commerce-search');

// Bound only once the interface is initialized: `initializeWithEngine` installs
// the URL manager as its last step, so a query submitted before that would run
// but never reach the address bar.
document.querySelector('headless-search-box')?.initialize(engine);

document.querySelector('atomic-commerce-interface')?.executeFirstRequest();
