/**
 * Client-side hydration for Coveo Headless Search SSR sample.
 *
 * Client-side lifecycle:
 * 1. On page load, reads the SSR static state injected by the server (see server.ts)
 * 2. Hydrates the Coveo engine and controllers with this state
 * 3. Initializes UI components (search box, result grid, summary) with hydrated controllers
 * 4. Handles errors gracefully if hydration fails
 *
 * See server.ts for the server-side SSR lifecycle.
 */
import type {
  QuerySummary as QuerySummaryController,
  ResultList as ResultListController,
  SearchBox as SearchBoxController,
} from '@coveo/headless/ssr-next';
import type {SearchStaticState} from './common/types.js';
import {ErrorMessage} from './components/ErrorMessage.js';
import {QuerySummary} from './components/QuerySummary.js';
import {ResultList} from './components/ResultList.js';
import {Search} from './components/Search.js';
import {searchEngineDefinition} from './lib/engine-definition.js';

async function initApp() {
  try {
    const staticState: SearchStaticState = window.__STATIC_STATE__!;
    const {controllers} =
      await searchEngineDefinition.hydrateStaticState(staticState);

    Search(controllers.searchBox as SearchBoxController);
    ResultList(controllers.resultList as ResultListController);
    QuerySummary(controllers.summary as QuerySummaryController);
  } catch (_error) {
    const err = document.getElementById('query-error');
    if (!err) {
      const container = document.createElement('div');
      container.innerHTML = ErrorMessage(
        'Something went wrong. Please try again.'
      );
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
