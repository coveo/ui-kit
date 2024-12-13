export default {
  'atomic-text': async () => await import('./atomic-text/atomic-text.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
