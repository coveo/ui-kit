export default {
  'atomic-icon': async () => await import('../common/atomic-icon/atomic-icon'),
  'atomic-component-error': async () =>
    await import('../common/atomic-component-error/atomic-component-error'),
  'atomic-commerce-pager': async () =>
    await import('./atomic-commerce-pager/atomic-commerce-pager.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
