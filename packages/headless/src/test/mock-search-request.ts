import {SearchRequest} from '../api/search/search/search-request';

export function buildMockSearchRequest(config?: Partial<SearchRequest>) {
  return {
    accessToken: '',
    url: '',
    organizationId: '',
    tab: '',
    referrer: '',
    ...config,
  };
}
