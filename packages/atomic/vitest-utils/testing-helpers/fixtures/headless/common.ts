import type {Unsubscribe} from '@coveo/headless';
import {vi} from 'vitest';

export const genericSubscribe = vi.fn((subscribedFunction: () => void) => {
  subscribedFunction();
  return vi.fn() as Unsubscribe;
});
