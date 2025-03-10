export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-component-error': async () =>
    await import('../common/atomic-component-error/atomic-component-error'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
