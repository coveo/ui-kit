export default {
  'atomic-commerce-interface': async () =>
    await import('./atomic-commerce-interface/atomic-commerce-interface'),
  'atomic-commerce-url-manager': async () =>
    await import('./atomic-commerce-url-manager/atomic-commerce-url-manager'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
