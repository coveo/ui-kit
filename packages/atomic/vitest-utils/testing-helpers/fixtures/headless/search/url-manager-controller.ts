import type {UrlManager} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const buildFakeUrlManager = (
  options: Partial<UrlManager['state']> = {}
): UrlManager => {
  const defaultState = {
    fragment: '',
    ...options,
  };

  return {
    state: defaultState,
    subscribe: genericSubscribe,
    synchronize: vi.fn(),
  } as UrlManager;
};
