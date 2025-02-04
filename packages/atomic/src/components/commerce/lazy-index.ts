export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-commerce-sort-dropdown': async () =>
    await import(
      './atomic-commerce-sort-dropdown/atomic-commerce-sort-dropdown.js'
    ),
  'lit-atomic-icon': async () =>
    await import('../common/atomic-icon/atomic-icon.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
