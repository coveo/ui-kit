import type {SearchAPIErrorWithStatusCode} from '../api/search/search-api-error-response.js';

export function buildMockSearchApiErrorWithStatusCode(
  config: Partial<SearchAPIErrorWithStatusCode> = {}
): SearchAPIErrorWithStatusCode {
  return {
    message: '',
    statusCode: 0,
    type: '',
    ...config,
  };
}
