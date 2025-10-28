import type {
  Result,
  ResultList as ResultListSSR,
} from '@coveo/headless/ssr-next';
import {getElement} from '../common/utils.js';

export function ResultList(resultList: ResultListSSR) {
  if (!resultList) return;

  const grid = getElement<HTMLDivElement>('result-list');
  const noProducts = getElement<HTMLDivElement>('no-results');
  if (!grid) return;

  const render = () => {
    const results = selectResults(resultList);
    const hasResults = results.length > 0;

    if (noProducts) {
      noProducts.style.display = hasResults ? 'none' : 'block';
    }
    grid.innerHTML = hasResults ? renderResultList(results) : '';
  };

  resultList.subscribe(render);
  render();
}

function renderResultCard(result: Result): string {
  const title = result.title ?? 'Untitled';
  const excerpt = result.excerpt ?? '';
  const uri = result.uri ?? '#';
  const printableUri = result.printableUri ?? '';

  // Extract additional metadata from the result
  const source = result.raw?.source ?? result.raw?.syssource ?? '';
  const sourceType = result.raw?.sourcetype ?? result.raw?.syssourcetype ?? '';
  const objectType = result.raw?.objecttype ?? '';

  return `
    <div class="result-card">
      <div class="result-header">
        <div class="result-title">
          <a href="${uri}" target="_blank">${title}</a>
        </div>
        ${objectType ? `<span class="result-object-type">${objectType}</span>` : ''}
      </div>

      ${excerpt ? `<div class="result-excerpt">${excerpt}</div>` : ''}

      <div class="result-metadata">
        ${source ? `<div class="result-source"><strong>Source:</strong> ${source}</div>` : ''}
        ${sourceType ? `<div class="result-source-type"><strong>Source Type:</strong> ${sourceType}</div>` : ''}
        ${printableUri ? `<div class="result-uri"><strong>URL:</strong> ${printableUri}</div>` : ''}
      </div>
    </div>
  `;
}

export function renderResultList(results: Result[]): string {
  return results.map(renderResultCard).join('');
}

export function selectResults(resultList: ResultListSSR): Result[] {
  return (
    resultList?.state?.results || [
      {
        title: 'No Results',
        excerpt: '',
        uri: '',
        printableUri: '',
        children: [],
      },
    ]
  );
}
