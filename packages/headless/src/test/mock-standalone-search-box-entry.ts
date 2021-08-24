import {StandaloneSearchBoxEntry} from '../features/standalone-search-box-set/standalone-search-box-set-state';

export function buildMockStandaloneSearchBoxEntry(
  config: Partial<StandaloneSearchBoxEntry> = {}
): StandaloneSearchBoxEntry {
  return {
    analytics: {
      cause: '',
      metadata: null,
    },
    defaultRedirectionUrl: '',
    isLoading: false,
    redirectTo: '',
    ...config,
  };
}
