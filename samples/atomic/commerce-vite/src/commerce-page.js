import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import {buildEngine} from './engine.js';

// Shared entry for the search and product-listing pages: both have a single
// <atomic-commerce-interface> whose `type` (search / product-listing) and
// catalog URL (`data-view-url`) are declared in the page markup.
defineCustomElements();

const commerceInterface = document.querySelector('atomic-commerce-interface');
if (!commerceInterface) {
  throw new Error('No <atomic-commerce-interface> element found on the page.');
}

const viewUrl = commerceInterface.dataset.viewUrl;
if (!viewUrl) {
  throw new Error('The <atomic-commerce-interface> is missing its `data-view-url` attribute.');
}

await customElements.whenDefined('atomic-commerce-interface');

await commerceInterface.initializeWithEngine(buildEngine(viewUrl));

commerceInterface.executeFirstRequest();
