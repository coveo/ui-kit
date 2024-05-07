import {StandaloneSearchBoxEntry} from '../features/commerce/standalone-search-box-set/standalone-search-box-set-state';

export function buildMockCommerceStandaloneSearchBoxEntry(
  config: Partial<StandaloneSearchBoxEntry> = {}
): StandaloneSearchBoxEntry {
  return {
    defaultRedirectionUrl: '',
    isLoading: false,
    redirectTo: '',
    ...config,
  };
}
