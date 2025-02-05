export default {
  // Add entries as such when new components are added/moved to Lit.
  // 'atomic-recs-error': async () => await import('./atomic-recs-error/atomic-recs-error.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
