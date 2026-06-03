import {
  getSampleInsightEngineConfiguration,
  type InsightEngine,
  type InsightEngineConfiguration,
} from '@coveo/headless/insight';
import {vi} from 'vitest';

export const buildFakeInsightEngine = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<InsightEngine>;
  config?: Partial<InsightEngineConfiguration>;
  state?: Record<string, unknown>;
}> = {}): InsightEngine => {
  const defaultState = {};
  const defaultImplementation = {
    addReducers: vi.fn(),
    disableAnalytics: vi.fn(),
    dispatch: vi.fn(),
    enableAnalytics: vi.fn(),
    executeFirstSearch: vi.fn(),
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    subscribe: vi.fn(() => ({unsubscribe: vi.fn()})),
    configuration: {
      ...getSampleInsightEngineConfiguration(),
    },
  };

  return {
    ...defaultImplementation,
    ...implementation,
    state: {...defaultState, ...state} as never,
  } as InsightEngine;
};
