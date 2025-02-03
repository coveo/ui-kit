export default {
  // Add entries as such when new components are added/moved to Lit.
  // 'atomic-ipx-body': async () => await import('./atomic-ipx-body/atomic-ipx-body.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
