export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-icon': async () => await import('../common/atomic-icon/atomic-icon'),
  // TODO: check if should be public
  'atomic-commerce-facet': async () =>
    await import(
      '../commerce/facets/atomic-commerce-facet/atomic-commerce-facet'
    ),
  'atomic-commerce-facets': async () =>
    await import(
      '../commerce/facets/atomic-commerce-facets/atomic-commerce-facets'
    ),
  'atomic-commerce-sort-dropdown': async () =>
    await import(
      './atomic-commerce-sort-dropdown/atomic-commerce-sort-dropdown'
    ),
  'atomic-component-error': async () =>
    await import('../common/atomic-component-error/atomic-component-error'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
