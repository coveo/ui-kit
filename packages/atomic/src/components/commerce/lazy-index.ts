export default {
  'atomic-commerce-load-more-products': () =>
    import(
      './atomic-commerce-load-more-products/atomic-commerce-load-more-products.js'
    ),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
