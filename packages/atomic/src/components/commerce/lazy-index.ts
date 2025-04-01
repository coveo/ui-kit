export default {
  'atomic-commerce-load-more-products': () =>
    import(
      './atomic-commerce-load-more-products/atomic-commerce-load-more-products.js'
    ),
  'atomic-component-error': () =>
    import('../common/atomic-component-error/atomic-component-error'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
