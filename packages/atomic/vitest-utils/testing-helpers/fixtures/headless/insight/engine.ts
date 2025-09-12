import type {InsightEngine} from '@coveo/headless/insight';
import {vi} from 'vitest';

export function buildFakeInsightEngine(
  config: Partial<InsightEngine> = {}
): InsightEngine {
  const fakeEngine: InsightEngine = {
    configuration: {
      organizationId: 'test-org',
      accessToken: 'test-token',
      analytics: {
        trackingId: 'test-tracking-id',
      },
      ...config.configuration,
    },
    executeFirstSearch: vi.fn(),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
    state: {},
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    ...config,
  };

  return fakeEngine;
}
