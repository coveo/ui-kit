import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import './components/hybrid-search-box.js';
import {buildEngine} from './engine.js';

// Home page: a custom standalone search box that redirects to the search page,
// plus standard Atomic recommendation lists. Both read the same engine.
defineCustomElements();

const engine = buildEngine('https://sports.barca.group');

// The standalone box needs no interface of its own: it never renders products, it
// only stores the query and navigates. Building it against the engine directly is
// all that is required.
document.querySelector('hybrid-search-box').initialize(engine);

customElements.whenDefined('atomic-commerce-recommendation-interface').then(() => {
  for (const recommendationInterface of document.querySelectorAll(
    'atomic-commerce-recommendation-interface'
  )) {
    recommendationInterface.initializeWithEngine(engine);
  }
});
