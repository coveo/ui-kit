import type {
  SearchSummaryState,
  Summary,
} from '@coveo/headless/ssr-commerce-next';
import {getElement} from '../common/utils.js';

export function QuerySummary(summary: Summary) {
  if (!summary) return;

  const container = getElement<HTMLDivElement>('query-summary');
  if (!container) return;

  const render = () => {
    const sum = selectSummary(summary);
    container.textContent = formatQuerySummary(sum);
  };

  summary.subscribe(render);
  render();
}

export function selectSummary(summary: Summary) {
  return summary?.state as SearchSummaryState;
}

export function formatQuerySummary(summary: SearchSummaryState): string {
  if (summary.isLoading) return 'Loading...';
  const total = summary.totalNumberOfProducts || 0;

  return `${total} products found${summary.query ? ` for "${summary.query}"` : ''}`;
}
