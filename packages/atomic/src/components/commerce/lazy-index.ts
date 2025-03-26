export default {
  'atomic-commerce-interface': async () =>
    await import('./atomic-commerce-interface/atomic-commerce-interface'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
