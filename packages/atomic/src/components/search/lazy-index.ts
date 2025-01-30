export default {
  // Add entries as such when new components are added/moved to Lit.
  // 'atomic-text': async () => await import('./atomic-text/atomic-text.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
