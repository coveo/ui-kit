import type {
  ProductList,
  SearchBox,
  Summary,
} from '@coveo/headless/ssr-commerce-next';
import {engineDefinition} from './common/engine.js';
import type {SearchStaticState} from './common/types.js';
import {ProductGrid} from './components/ProductGrid.js';
import {QuerySummary} from './components/QuerySummary.js';
import {Search} from './components/Search.js';
import {ShowError} from './components/ShowError.js';

async function initApp() {
  try {
    const staticState: SearchStaticState = window.__STATIC_STATE__!;
    const {controllers} =
      await engineDefinition.searchEngineDefinition.hydrateStaticState(
        staticState
      );

    Search(controllers.searchBox as SearchBox);
    ProductGrid(controllers.productList as ProductList);
    QuerySummary(
      controllers.summary as Summary,
      controllers.searchBox as SearchBox
    );
  } catch (_error) {
    const err = document.getElementById('query-error');
    if (!err) {
      const container = document.createElement('div');
      container.innerHTML = ShowError();
      document.body.appendChild(container.firstElementChild!);
    }
  }
}

// ===== Boot =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
