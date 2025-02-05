export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-commerce-sort-dropdown': async () =>
    await import(
      './atomic-commerce-sort-dropdown/atomic-commerce-sort-dropdown.js'
    ),
  'atomic-boom': async () =>
    await import('./atomic-commerce-sort-dropdown/atomic-boom.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
