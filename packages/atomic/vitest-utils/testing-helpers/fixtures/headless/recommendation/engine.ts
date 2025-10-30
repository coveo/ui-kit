import type {
  RecommendationEngine,
  RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {vi} from 'vitest';

export const buildFakeRecommendationEngine = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<RecommendationEngine>;
  config?: Partial<RecommendationEngineConfiguration>;
  state?: Record<string, unknown>;
}> = {}): RecommendationEngine => {
  const defaultState = {
    debug: false,
    pipeline: '',
    searchHub: 'default',
    recommendation: {
      searchUid: 'test-uid',
      id: 'test-id',
    },
  };

  const defaultImplementation = {
    addReducers: vi.fn(),
    dispatch: vi.fn(),
    disableAnalytics: vi.fn(),
    enableAnalytics: vi.fn(),
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    subscribe: vi.fn(() => vi.fn()),
  };

  return {
    ...defaultImplementation,
    ...implementation,
    state: {...defaultState, ...state},
  } as RecommendationEngine;
};
