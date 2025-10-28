import type {
  QuerySummary,
  ResultList,
  SearchBox,
} from '@coveo/headless/ssr-next';
import {ErrorMessage} from '../components/ErrorMessage.js';
import {formatQuerySummary, selectSummary} from '../components/QuerySummary.js';
import {renderResultGrid, selectResults} from '../components/ResultList.js';
import {selectSearchValue} from '../components/Search.js';
import type {SearchStaticState} from './types.js';

export const renderApp = (staticState: SearchStaticState) => {
  const {controllers} = staticState;
  const results = selectResults(controllers.resultList as ResultList);
  const summary = selectSummary(controllers.summary as QuerySummary);
  const searchValue = selectSearchValue(controllers.searchBox as SearchBox);

  return `
    <div class="app-container">
      <header class="app-header">
        <h1>SSR Search Demo</h1>
        <p class="subtitle">Search and discover content</p>
      </header>

      <main class="main-content">
        <section class="search-section">
          <form class="search-box" method="GET">
            <input type="text" id="search-input" name="q" placeholder="Search for content..." value="${searchValue}" />
            <button id="search-button" type="submit">Search</button>
          </form>
        </section>

        <section class="main-results">
          <div class="results-header">
            <div class="results-controls">
              <div id="query-summary" class="query-summary">
                ${formatQuerySummary(summary)}
              </div>
            </div>
          </div>

          <div id="result-grid" class="result-grid">
            ${renderResultGrid(results)}
          </div>
      
          ${ErrorMessage()}

          <div id="no-results" class="no-results" style="${results.length === 0 ? 'display: block;' : 'display: none;'}">>
            <p>No results found. Try adjusting your search.</p>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <p>SSR Search Demo</p>
      </footer>
    </div>
  `;
};
