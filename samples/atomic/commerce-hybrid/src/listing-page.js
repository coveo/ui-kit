import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import {buildEngine} from './engine.js';

// Product-listing pages. These are deliberately 100% standard Atomic, including
// the search box: nothing on them needed a capability Atomic lacks, so nothing
// was replaced. Replacing the search box on the search page did not oblige this
// page to follow.
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
