import type {SearchEngine, SearchEngineConfiguration} from '@coveo/headless';
import {vi} from 'vitest';

export const buildFakeSearchEngine = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<SearchEngine>;
  config?: Partial<SearchEngineConfiguration>;
  state?: Record<string, unknown>;
}> = {}): SearchEngine => {
  const defaultState = {};
  const defaultImplementation = {
    dispatch: vi.fn(),
    disableAnalytics: vi.fn(),
    enableAnalytics: vi.fn(),
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    executeFirstSearch: vi.fn(),
    executeFirstSearchAfterStandaloneSearchBoxRedirect: vi.fn(),
  };

  return {
    ...defaultImplementation,
    ...implementation,
    state: {...defaultState, ...state},
  } as SearchEngine;
};
