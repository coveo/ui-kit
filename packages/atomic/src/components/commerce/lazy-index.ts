export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-icon': async () => await import('../common/atomic-icon/atomic-icon'),
  'atomic-component-error': async () =>
    await import('../common/atomic-component-error/atomic-component-error'),
  'atomic-commerce-interface': async () =>
    await import('./atomic-commerce-interface/atomic-commerce-interface'),
  'atomic-commerce-product-list': async () =>
    await import('./atomic-commerce-product-list/atomic-commerce-product-list'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
