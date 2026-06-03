import type {SearchResponse} from './search-response.js';

export const buildSearchResponseWithResults =
  (totalCount: number, numberOfResults = 10) =>
  (response: SearchResponse): SearchResponse => ({
    ...response,
    totalCount,
    totalCountFiltered: totalCount,
    results: response.results.slice(0, numberOfResults),
  });
