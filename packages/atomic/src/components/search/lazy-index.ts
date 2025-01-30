export default {
  // Add entries as such when new components are added/moved to Lit.
  'atomic-boom': async () => await import('./atomic-boom/atomic-boom.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
