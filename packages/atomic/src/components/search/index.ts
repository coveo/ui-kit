export default {
  'atomic-text': async () => await import('./atomic-text/atomic-text.js'),
} as Record<string, () => Promise<unknown>>;

export type {AtomicText} from './atomic-text/atomic-text';
