import type {MockSearchApi} from './mock.js';

type SearchEndpointResponse = Parameters<
  Parameters<MockSearchApi['searchEndpoint']['mockOnce']>[0]
>[0];

export const buildSearchResponseWithResults =
  (totalCount: number, numberOfResults = 10) =>
  (response: SearchEndpointResponse): SearchEndpointResponse => ({
    ...response,
    totalCount,
    totalCountFiltered: totalCount,
    results:
      'results' in response ? response.results.slice(0, numberOfResults) : [],
  });
