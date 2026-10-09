import './components/headless-search-box.js';
import {startPage} from './page.js';

// Home page: the Headless search box in standalone mode, redirecting to the
// search page, and Atomic recommendation lists with a Headless add-to-cart
// button in each card.
const engine = await startPage('https://sports.barca.group');

document.querySelector('headless-search-box')?.initialize(engine);
