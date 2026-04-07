import {
  buildCommerceEngine,
  buildContext,
  buildSearch,
  getSampleCommerceEngineConfiguration,
  loadSearchActions,
} from 'https://static.cloud.coveo.com/headless/v3/commerce/headless.esm.js';

/**
 * This sample assumes the following context mappings are configured on the
 * target tracking ID (see https://docs.coveo.com/en/q3bc0472):
 *
 *   fitmentProducts  — PRODUCT_LIST  → QUERY_PIPELINE_CONTEXT
 *   shoppingIntent   — STRING        → ML_CONTEXT, QUERY_PIPELINE_CONTEXT
 *   storeId          — STRING        → FIELD_ALIASES (price_dict)
 */

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

const renderSearchResults = (el, products) => {
  if (!products.length) {
    el.innerHTML = '<h2>Search Results</h2><p>No results.</p>';
    return;
  }

  const items = products
    .slice(0, 10)
    .map((product) => {
      const price = product.ec_price
        ? `<span class="product-price">$${Number(product.ec_price).toFixed(2)}</span>`
        : '';
      return `<li><span class="product-name">${product.ec_name ?? product.permanentid}</span>${price}</li>`;
    })
    .join('');

  el.innerHTML = `
    <h2>Search Results <small>(${products.length} products)</small></h2>
    <ul>${items}</ul>
  `;
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const coveoHeadlessCustomContext = () => {
  const engine = buildCommerceEngine({
    configuration: getSampleCommerceEngineConfiguration(),
  }); // callout[Refer to <a href="../../interfaces/Commerce.CommerceEngineOptions.html">`CommerceEngineOptions`</a> for details on configuring a Commerce engine]

  const contextController = buildContext(engine);
  const searchController = buildSearch(engine);
  const {executeSearch} = loadSearchActions(engine);

  const intentSelect = document.getElementById('shopping-intent');
  const storeSelect = document.getElementById('store-id');
  const fitmentTextarea = document.getElementById('fitment-products');
  const applyButton = document.getElementById('apply-context');
  const contextStateEl = document.querySelector('#context-state pre code');
  const searchResultsEl = document.getElementById('search-results');

  contextController.subscribe(() => {
    const {custom, ...rest} = contextController.state;
    contextStateEl.textContent = JSON.stringify({...rest, custom}, null, 2);
  });

  searchController.subscribe(() =>
    renderSearchResults(searchResultsEl, searchController.state.products)
  );

  applyButton.addEventListener('click', () => {
    const customContext = {
      shoppingIntent: intentSelect.value,
      storeId: storeSelect.value,
      fitmentProducts: fitmentTextarea.value.split(',').map((s) => s.trim()), // callout[In a real-world example these would be de derived from user interactions with the site or from <a href="https://docs.coveo.com/en/3382/">product recommendations</a>.]
    };

    contextController.setCustom(customContext);

    engine.dispatch(executeSearch());
  });
};

document.addEventListener('DOMContentLoaded', coveoHeadlessCustomContext);
