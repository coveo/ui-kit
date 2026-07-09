import type {Summary} from '@coveo/headless/ssr-commerce';
import {escapeHtml, getElement} from '../common/utils.js';

type SummaryState = Summary['state'];

/** Result count, plus the active query when there is one (search only). */
function formatSummary(state: SummaryState): string {
  if (state.isLoading) {
    return '<p>Loading…</p>';
  }

  const total = state.totalNumberOfProducts || 0;
  const query =
    'query' in state && typeof state.query === 'string' && state.query
      ? ` for <b>“${escapeHtml(state.query)}”</b>`
      : '';

  return `<p><b>${total.toLocaleString('en-US')}</b> products${query}</p>`;
}

export function renderSummary(state: SummaryState): string {
  return `<div id="query-summary" class="Summary">${formatSummary(state)}</div>`;
}

export function hydrateSummary(summary: Summary) {
  const container = getElement<HTMLDivElement>('query-summary');
  if (!container) return;

  const update = () => {
    container.innerHTML = formatSummary(summary.state);
  };

  summary.subscribe(update);
  update();
}
