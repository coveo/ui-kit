import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import {buildEngine} from './engine.js';

// Home page: a standalone search box (redirects to the search page on submit)
// plus product recommendations. Both are driven by the sample commerce engine
// scoped to the homepage view, and are initialized independently so a slow
// interface never blocks the other from rendering.
defineCustomElements();

const engine = buildEngine('https://sports.barca.group');

// Standalone search box: it only redirects, so it is not executed here.
customElements.whenDefined('atomic-commerce-interface').then(() => {
  document
    .querySelector('atomic-commerce-interface')
    ?.initializeWithEngine(engine);
});

// Product recommendations.
customElements
  .whenDefined('atomic-commerce-recommendation-interface')
  .then(() => {
    for (const recommendationInterface of document.querySelectorAll(
      'atomic-commerce-recommendation-interface'
    )) {
      recommendationInterface.initializeWithEngine(engine);
    }
  });
