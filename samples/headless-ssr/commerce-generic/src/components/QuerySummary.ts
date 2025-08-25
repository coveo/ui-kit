import type {SearchBox, Summary} from '@coveo/headless/ssr-commerce-next';
import {getElement} from '../common/utils.js';
import {selectSearchValue} from './Search.js';

export function QuerySummary(summary: Summary, searchBox: SearchBox) {
  if (!summary || !searchBox) return;

  const container = getElement<HTMLDivElement>('query-summary');
  if (!container) return;

  const render = () => {
    const sum = selectSummary(summary);
    const searchValue = selectSearchValue(searchBox);
    container.textContent = formatQuerySummary(sum, searchValue);
  };

  searchBox.subscribe(render);
  render();
}

export function selectSummary(summary: Summary): Summary['state'] | undefined {
  return summary?.state;
}

export function formatQuerySummary(
  summary: Summary['state'] | undefined,
  searchValue: string
): string {
  if (!summary) {
    return 'Loading...';
  }
  const total = summary.totalNumberOfProducts || 0;
  let searchText = '';

  if (searchValue) {
    searchText = ` for "${searchValue}"`;
  }
  return `${total} products found${searchText}`;
}
