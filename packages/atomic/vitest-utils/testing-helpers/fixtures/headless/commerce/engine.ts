import {
  type CommerceEngine,
  type CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const buildFakeCommerceEngine = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<CommerceEngine>;
  config?: Partial<CommerceEngineConfiguration>;
  state?: Record<string, unknown>;
}> = {}): CommerceEngine => {
  const defaultState = {language: 'en'};
  const defaultImplementation = {
    addReducers: vi.fn(),
    disableAnalytics: vi.fn(),
    dispatch: vi.fn(),
    enableAnalytics: vi.fn(),
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    subscribe: vi.fn(() => ({unsubscribe: vi.fn()})),
    configuration: {
      ...getSampleCommerceEngineConfiguration(),
      commerce: {
        apiBaseUrl: 'https://fake-commerce-api.com',
      },
    },
  };

  return {
    ...defaultImplementation,
    ...implementation,
    state: {...defaultState, ...state},
  } as CommerceEngine;
};
