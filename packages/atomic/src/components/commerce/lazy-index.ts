export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-commerce-interface': async () =>
    await import('./atomic-commerce-interface/atomic-commerce-interface.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
