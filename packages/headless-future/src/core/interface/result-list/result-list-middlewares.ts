import {CoveoSearchEndpointResponse} from '@/src/api/interface/search-endpoint/search-endpoint-types.js';
import {SearchResult} from './result-list-types.js';
import * as resultListMutators from '@/src/core/interface/result-list/result-list-mutators.js';

export const searchResponseMiddleware = (
  response: CoveoSearchEndpointResponse
) => {
  const searchResults: SearchResult[] = response.results.map((result) => ({
    id: result.uri,
    title: result.title,
    uri: result.uri,
    excerpt: result.excerpt ?? '',
  }));
  resultListMutators.setResults(searchResults);
};
