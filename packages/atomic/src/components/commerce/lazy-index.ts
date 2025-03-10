export default {
  // Add entries as such when new components are added/moved to Lit.
  // 'atomic-commerce-breadbox': async () => await import('./atomic-commerce-breadbox/atomic-commerce-breadbox.js'),

  'atomic-commerce-product-list': async () =>
    await import(
      './atomic-commerce-product-list/atomic-commerce-product-list.js'
    ),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
