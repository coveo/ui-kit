import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import {buildEngine} from './engine.js';

// Cart page: recommendations scoped to the cart view, so the engine reports the
// shopper as being on the cart step rather than browsing a listing. Like the home
// page, the standalone search box and the recommendations are initialized
// independently so a slow interface never blocks the other from rendering.
defineCustomElements();

const engine = buildEngine('https://sports.barca.group/cart');

// Standalone search box: it only redirects, so it is not executed here.
customElements.whenDefined('atomic-commerce-interface').then(() => {
  document.querySelector('atomic-commerce-interface')?.initializeWithEngine(engine);
});

customElements.whenDefined('atomic-commerce-recommendation-interface').then(() => {
  for (const recommendationInterface of document.querySelectorAll(
    'atomic-commerce-recommendation-interface'
  )) {
    recommendationInterface.initializeWithEngine(engine);
  }
});
