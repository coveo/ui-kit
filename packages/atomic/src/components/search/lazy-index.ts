// Auto-generated file
export default {
  'atomic-pager': async () => await import('./atomic-pager/atomic-pager.js'),
  'atomic-query-summary': async () =>
    await import('./atomic-query-summary/atomic-query-summary.js'),
  'atomic-relevance-inspector': async () =>
    await import('./atomic-relevance-inspector/atomic-relevance-inspector.js'),
  'atomic-result-number': async () =>
    await import('./atomic-result-number/atomic-result-number.js'),
  'atomic-results-per-page': async () =>
    await import('./atomic-results-per-page/atomic-results-per-page.js'),
  'atomic-search-box-instant-results': async () =>
    await import(
      './atomic-search-box-instant-results/atomic-search-box-instant-results.js'
    ),
  'atomic-search-box-query-suggestions': async () =>
    await import(
      './atomic-search-box-query-suggestions/atomic-search-box-query-suggestions.js'
    ),
  'atomic-search-box-recent-queries': async () =>
    await import(
      './atomic-search-box-recent-queries/atomic-search-box-recent-queries.js'
    ),
  'atomic-search-interface': async () =>
    await import('./atomic-search-interface/atomic-search-interface.js'),
  'atomic-search-layout': async () =>
    await import('./atomic-search-layout/atomic-search-layout.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
