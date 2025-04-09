export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-icon': async () => await import('../common/atomic-icon/atomic-icon'),
  'atomic-component-error': async () =>
    await import('../common/atomic-component-error/atomic-component-error'),
  'atomic-commerce-search-box': async () =>
    await import(
      '../commerce/atomic-commerce-search-box/atomic-commerce-search-box'
    ),
  'atomic-commerce-search-box-recent-queries': async () =>
    await import(
      '../commerce/search-box-suggestions/atomic-commerce-search-box-recent-queries/atomic-commerce-search-box-recent-queries'
    ),
  'atomic-commerce-search-box-query-suggestions': async () =>
    await import(
      '../commerce/search-box-suggestions/atomic-commerce-search-box-query-suggestions/atomic-commerce-search-box-query-suggestions'
    ),
  'atomic-commerce-search-box-instant-products': async () =>
    await import(
      '../commerce/search-box-suggestions/atomic-commerce-search-box-instant-products/atomic-commerce-search-box-instant-products'
    ),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
