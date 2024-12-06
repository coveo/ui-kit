export default {
  'atomic-text': async () => await import('./atomic-text/atomic-text'),
} as Record<string, () => Promise<unknown>>;
