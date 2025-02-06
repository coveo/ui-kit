export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-icon': async () => await import('../common/atomic-icon/atomic-icon'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
