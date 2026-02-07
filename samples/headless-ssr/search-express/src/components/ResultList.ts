import type {
  Result,
  ResultList as ResultListController,
} from '@coveo/headless/ssr-next';
import {getElement} from '../common/utils.js';

export function ResultList(resultList: ResultListController) {
  if (!resultList) return;

  const grid = getElement<HTMLDivElement>('result-list');
  const noResults = getElement<HTMLDivElement>('no-results');
  if (!grid) return;

  const render = () => {
    const results = selectResults(resultList);
    const hasResults = results.length > 0;

    if (noResults) {
      noResults.style.display = hasResults ? 'none' : 'block';
    }
    grid.innerHTML = hasResults ? renderResultList(results) : '';
  };

  resultList.subscribe(render);
  render();
}

function renderResultCard(result: Result): string {
  const title = result.title ?? 'Unknown Result';
  const excerpt = result.excerpt ?? 'No description available';

  return `
    <div class="result-card">
      <h3 class="result-title">${title}</h3>
      <p class="result-excerpt">${excerpt}</p>
      <a href="${result.clickUri}" class="result-link" target="_blank" rel="noopener noreferrer">View →</a>
    </div>
  `;
}

export function renderResultList(results: Result[]): string {
  return results.map(renderResultCard).join('');
}

export function selectResults(resultList: ResultListController): Result[] {
  return resultList?.state?.results || [];
}
