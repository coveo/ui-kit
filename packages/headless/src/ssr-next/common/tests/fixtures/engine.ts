import {vi} from 'vitest';
import {
  getSampleSearchEngineConfiguration,
  type SearchEngine,
  type SearchEngineConfiguration,
} from '../../../../app/search-engine/search-engine.js';
import type {ConfigurationState} from '../../../../features/configuration/configuration-state.js';
import type {SearchState} from '../../../../features/search/search-state.js';

export const buildFakeSearchEngine = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<SearchEngine>;
  config?: Partial<SearchEngineConfiguration>;
  state?: Record<string, unknown>;
}> = {}): SearchEngine => {
  const defaultState = {
    debug: false,
    pipeline: 'default',
    searchHub: 'default',
    search: {} as unknown as SearchState, // TODO: fix this
    configuration: {} as unknown as ConfigurationState, // TODO: fix this
    version: 'x.x.x',
  };
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
      ...getSampleSearchEngineConfiguration(),
    },
  };

  return {
    ...defaultImplementation,
    ...implementation,
    state: {...defaultState, ...state},
  } as SearchEngine;
};
