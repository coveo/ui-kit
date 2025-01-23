export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-load-more-results-lit': async () =>
    await import('./atomic-load-more-results/lit-atomic-load-more-results.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
