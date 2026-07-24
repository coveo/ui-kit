import type {SearchResponse} from './search-response.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';

export const buildSearchResponseWithResults =
  (totalCount: number, numberOfResults = 10) =>
  (response: SearchResponse | APIErrorWithStatusCode): SearchResponse | APIErrorWithStatusCode => {
    if (!('results' in response)) {
      return response;
    }

    return {
      ...response,
      totalCount,
      totalCountFiltered: totalCount,
      results: response.results.slice(0, numberOfResults),
    };
  };
