import type {SearchSummaryState, Summary} from '@coveo/headless/ssr-commerce';
import {escapeHtml, getElement} from '../common/utils.js';

export function QuerySummary(summary: Summary) {
  if (!summary) return;

  const container = getElement<HTMLDivElement>('query-summary');
  if (!container) return;

  const render = () => {
    container.innerHTML = formatQuerySummary(selectSummary(summary));
  };

  summary.subscribe(render);
  render();
}

export function selectSummary(summary: Summary) {
  return summary?.state as SearchSummaryState;
}

export function formatQuerySummary(summary: SearchSummaryState): string {
  if (summary.isLoading) {
    return '<p>Loading…</p>';
  }

  const total = summary.totalNumberOfProducts || 0;
  const query = summary.query
    ? ` for <b>“${escapeHtml(summary.query)}”</b>`
    : '';

  return `<p><b>${total.toLocaleString('en-US')}</b> products${query}</p>`;
}
