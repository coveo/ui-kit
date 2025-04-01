export default {
  // Add entries as such when new components are added/moved to Lit.
  // 'atomic-commerce-breadbox': async () => await import('./atomic-commerce-breadbox/atomic-commerce-breadbox.js'),

  'atomic-commerce-product-list': async () =>
    await import('./atomic-commerce-product-list/atomic-commerce-product-list'),
  'atomic-component-error': async () =>
    await import('../common/atomic-component-error/atomic-component-error'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
