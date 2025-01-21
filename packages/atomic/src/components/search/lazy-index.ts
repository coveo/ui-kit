export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-dummy': async () => await import('./atomic-text/atomic-dummy.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
