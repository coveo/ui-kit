import type {
  QuerySummary,
  ResultList,
  SearchBox,
} from '@coveo/headless/ssr-next';
import type {SearchStaticState} from './types.js';

function selectResults(resultList: ResultList) {
  return resultList.state.results;
}

function selectQuerySummary(querySummary: QuerySummary) {
  return querySummary.state;
}

function selectSearchValue(searchBox: SearchBox) {
  return searchBox.state.value;
}

function formatQuerySummary(summary: ReturnType<typeof selectQuerySummary>) {
  if (!summary.hasQuery) {
    return 'Enter a search query to see results';
  }
  if (summary.total === 0) {
    return `No results found for "${summary.query}"`;
  }
  return `Showing ${summary.firstResult}-${summary.lastResult} of ${summary.total} results for "${summary.query}"`;
}

function renderResultCard(result: ReturnType<typeof selectResults>[number]) {
  return `
    <div class="result-card">
      <h3 class="result-title">${result.title}</h3>
      <p class="result-excerpt">${result.excerpt || 'No description available'}</p>
      <a href="${result.clickUri}" class="result-link" target="_blank">View →</a>
    </div>
  `;
}

function renderResultList(results: ReturnType<typeof selectResults>) {
  if (results.length === 0) {
    return '';
  }
  return results.map(renderResultCard).join('');
}

export const renderApp = (staticState: SearchStaticState) => {
  const {controllers} = staticState;
  const results = selectResults(controllers.resultList as ResultList);
  const summary = selectQuerySummary(controllers.querySummary as QuerySummary);
  const searchValue = selectSearchValue(controllers.searchBox as SearchBox);

  return `
    <div class="app-container">
      <header class="app-header">
        <h1>🔍 SSR Search Demo</h1>
        <p class="subtitle">Search and discover content</p>
      </header>

      <main class="main-content">
        <section class="search-section">
          <form class="search-box" method="GET">
            <input type="text" id="search-input" name="q" placeholder="Search..." value="${searchValue}" />
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

          <div id="result-list" class="result-list">
            ${renderResultList(results)}
          </div>

          <div id="no-results" class="no-results" style="${results.length === 0 ? 'display: block;' : 'display: none;'}">
            <p>No results found. Try adjusting your search.</p>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <p>🔍 SSR Search Demo</p>
      </footer>
    </div>
  `;
};
