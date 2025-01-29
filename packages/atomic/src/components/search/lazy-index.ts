export default {
  'atomic-result-example-component': async () =>
    await import(
      './result-template-components/atomic-result-example-component/atomic-result-example-component.js'
    ),
  // Add entries as such when new components are added/moved to Lit.
  // 'atomic-text': async () => await import('./atomic-text/atomic-text.js'),
} as Record<string, () => Promise<unknown>>;

export type * from './index.js';
