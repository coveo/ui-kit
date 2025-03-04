export default {
  'atomic-commerce-pager': async () =>
    await import('./atomic-commerce-pager/atomic-commerce-pager.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
