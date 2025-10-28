import type {
  QuerySummary as QuerySummaryController,
  QuerySummaryState,
} from '@coveo/headless/ssr-next';
import {getElement} from '../common/utils.js';

export function QuerySummary(summary: QuerySummaryController) {
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

export function selectSummary(summary: QuerySummaryController) {
  return summary?.state as QuerySummaryState;
}

export function formatQuerySummary(summary: QuerySummaryState): string {
  if (summary.isLoading) return 'Loading...';
  const total = summary.total || 0;

  return `${total} results found${summary.query ? ` for "${summary.query}"` : ''}`;
}
