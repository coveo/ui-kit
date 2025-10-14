import type {TabManager} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';

export const buildFakeTabManager = (
  options: Partial<TabManager['state']> = {}
): TabManager => {
  const defaultState = {
    activeTab: 'All',
    ...options,
  };

  return {
    state: defaultState,
    subscribe: genericSubscribe,
    select: vi.fn(),
  } as TabManager;
};
