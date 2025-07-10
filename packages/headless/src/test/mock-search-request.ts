import type {SearchRequest} from '../api/search/search/search-request.js';

export function buildMockSearchRequest(config?: Partial<SearchRequest>) {
  return {
    accessToken: '',
    url: '',
    organizationId: '',
    tab: '',
    referrer: '',
    timezone: '',
    ...config,
  };
}
