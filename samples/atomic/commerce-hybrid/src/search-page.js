import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import './components/hybrid-search-box.js';
import {buildEngine} from './engine.js';

// The hybrid search page. Every part of the experience is a standard Atomic
// component except the search box, which is a plain custom element driven by
// Headless commerce controllers.
defineCustomElements();

const commerceInterface = document.querySelector('atomic-commerce-interface');
if (!commerceInterface) {
  throw new Error('No <atomic-commerce-interface> element found on the page.');
}

const viewUrl = commerceInterface.dataset.viewUrl;
if (!viewUrl) {
  throw new Error('The <atomic-commerce-interface> is missing its `data-view-url` attribute.');
}

// One engine, shared. This is the entire integration surface between the Atomic
// components and the custom search box.
const engine = buildEngine(viewUrl);

await customElements.whenDefined('atomic-commerce-interface');
await commerceInterface.initializeWithEngine(engine);

// Order matters. The interface installs its URL manager as the last step of
// `initializeWithEngine`, so the search box must not be able to submit before
// that promise resolves: the search would run, the products would update, and the
// query would silently never reach the address bar. Binding the box afterwards
// makes that impossible, because the input stays disabled until `initialize` runs.
document.querySelector('hybrid-search-box').initialize(engine);

commerceInterface.executeFirstRequest();
