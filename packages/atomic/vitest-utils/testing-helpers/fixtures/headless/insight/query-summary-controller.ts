import type {QuerySummary as InsightQuerySummary} from '@coveo/headless/insight';
import {vi} from 'vitest';

export function buildFakeInsightQuerySummary(
  config: Partial<InsightQuerySummary> = {}
): InsightQuerySummary {
  const fakeController: InsightQuerySummary = {
    state: {
      isLoading: false,
      firstResult: 1,
      lastResult: 10,
      total: 100,
      hasResults: true,
      query: '',
      hasQuery: false,
      durationInMilliseconds: 100,
      durationInSeconds: 0.1,
      hasDuration: true,
      hasError: false,
      firstSearchExecuted: true,
      ...config.state,
    },
    subscribe: vi.fn((listener) => {
      listener();
      return vi.fn();
    }),
    ...config,
  };

  return fakeController;
}
