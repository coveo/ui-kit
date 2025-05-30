import {
  CommerceEngine,
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const buildFakeCommerceEngine = ({
  implementation,
  config,
  state,
}: Partial<{
  implementation?: Partial<CommerceEngine>;
  config?: Partial<CommerceEngineConfiguration>;
  state?: Record<string, unknown>;
}>): CommerceEngine => {
  const defaultState = {language: 'en'};
  const defaultImplementation = {
    addReducers: vi.fn(),
    dispatch: vi.fn(),
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    subscribe: vi.fn(() => ({unsubscribe: vi.fn()})),
    configuration: getSampleCommerceEngineConfiguration(),
  };

  const configuration = {
    ...getSampleCommerceEngineConfiguration(),
    ...config,
  } as CommerceEngineConfiguration;

  return {
    ...defaultImplementation,
    ...implementation,
    ...configuration,
    state: {...defaultState, ...state},
  } as CommerceEngine;
};
