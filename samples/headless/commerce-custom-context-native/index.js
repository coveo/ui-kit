// engine.js
import {
  buildCommerceEngine,
  buildContext,
  buildSearch,
  getSampleCommerceEngineConfiguration,
  loadSearchActions,
} from 'https://static.cloud.coveo.com/headless/v3/commerce/headless.esm.js';
import {renderSearchResults} from './renderSearchResults.js';

const coveoHeadlessCustomContext = () => {
  const intentSelect = document.getElementById('shopping-intent');
  const storeSelect = document.getElementById('store-id');
  const fitmentTextarea = document.getElementById('fitment-products');
  const applyButton = document.getElementById('apply-context');
  const contextStateEl = document.querySelector('#context-state pre code');
  const searchResultsEl = document.getElementById('search-results');

  const engine = buildCommerceEngine({
    configuration: getSampleCommerceEngineConfiguration(), // callout[This configuration does not have context mapping defined, meaning changing values for the context mapping elements will not affect the returned results.]
  });

  const contextController = buildContext(engine);
  const searchController = buildSearch(engine);
  const {executeSearch} = loadSearchActions(engine);

  searchController.subscribe(
    () => renderSearchResults(searchResultsEl, searchController.state.products) // callout[Dispatch updates to a render function when the search controllers received updates.]
  );

  contextController.subscribe(() => {
    const {custom, ...rest} = contextController.state;
    contextStateEl.textContent = JSON.stringify({...rest, custom}, null, 2); // callout[This is just for demonstration purposes, in a real-world example diplaying the values of the context being passed would not add value.]
  });

  applyButton.addEventListener('click', () => {
    const customContext = {
      shoppingIntent: intentSelect.value, // callout[In a real-world example this value is typically derived from the section of the site the user is browsing or from an explicit user selection.]
      storeId: storeSelect.value, // callout[In a real-world example this value often comes from a user preference stored in a cookie or session, such as a selected store location.]
      fitmentProducts: fitmentTextarea.value.split(',').map((s) => s.trim()), // callout[In a real-world example these are usually derived from user interactions (e.g., a vehicle selector that resolves to compatible part SKUs) or from <a href="https://docs.coveo.com/en/3382/">product recommendations</a>.]
    };

    contextController.setCustom(customContext); // callout[Set the values for context mapping before dispatching the search action to ensure the search results reflect the updated user intent.]

    engine.dispatch(executeSearch());
  });
};

document.addEventListener('DOMContentLoaded', coveoHeadlessCustomContext);
