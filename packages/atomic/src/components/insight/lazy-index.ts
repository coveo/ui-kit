export default {
  // Add entries as such when new components are added/moved to Lit.
  // 'atomic-insight-facet': async () => await import('./atomic-insight-facet/atomic-insight-facet.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
