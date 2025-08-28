import type {InsightEngine} from '@coveo/headless/insight';
import {vi} from 'vitest';

export function buildFakeInsightEngine(
  config: Partial<InsightEngine> = {}
): InsightEngine {
  const fakeEngine = {
    configuration: {
      organizationId: 'test-org',
      accessToken: 'test-token',
      analytics: {
        trackingId: 'test-tracking-id',
      },
    },
    executeFirstSearch: vi.fn(),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
    state: {
      configuration: {
        organizationId: 'test-org',
        environment: 'prod',
      },
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    ...config,
  };

  // biome-ignore lint/suspicious/noExplicitAny: test fixture needs flexible typing
  return fakeEngine as any;
}
