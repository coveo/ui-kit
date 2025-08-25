import type {
  ProductList,
  SearchBox,
  Summary,
} from '@coveo/headless/ssr-commerce-next';
import {renderProductGrid, selectProducts} from '../components/ProductGrid.js';
import {formatQuerySummary, selectSummary} from '../components/QuerySummary.js';
import {selectSearchValue} from '../components/Search.js';
import type {SearchStaticState} from './types.js';

export const renderApp = (staticState: SearchStaticState) => {
  const {controllers} = staticState;
  const products = selectProducts(controllers.productList as ProductList);
  const summary = selectSummary(controllers.summary as Summary);
  const searchValue = selectSearchValue(controllers.searchBox as SearchBox);

  return `
    <div class="app-container">
      <header class="app-header">
        <h1>🛍️ SSR Commerce Search Demo</h1>
        <p class="subtitle">Search and discover products</p>
      </header>

      <main class="main-content">
        <section class="search-section">
          <div class="search-box">
            <input type="text" id="search-input" placeholder="Search for products..." value="${searchValue}" />
            <button id="search-button">Search</button>
          </div>
        </section>

        <section class="main-results">
          <div class="results-header">
            <div class="results-controls">
              <div id="query-summary" class="query-summary">
                ${formatQuerySummary(summary, searchValue)}
              </div>
            </div>
          </div>

          <div id="product-grid" class="product-grid">
            ${renderProductGrid(products)}
          </div>

          <div id="query-error" class="query-error" style="display: none;">
            <p>Something went wrong. Please try again.</p>
          </div>

          <div id="no-products" class="no-products" style="${products.length === 0 ? 'display: block;' : 'display: none;'}">
            <p>No products found. Try adjusting your search.</p>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <p>🛍️ SSR Commerce Search Demo</p>
      </footer>
    </div>
  `;
};
