import {startPage} from './page.js';

// Search page: entirely standard Atomic (search box, facets, sort, pager), with a
// Headless add-to-cart button in each product card.
await startPage('https://sports.barca.group/commerce-search');

document.querySelector('atomic-commerce-interface')?.executeFirstRequest();
