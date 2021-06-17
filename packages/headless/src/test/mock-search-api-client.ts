import pino from 'pino';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {
  SearchAPIClient,
  SearchAPIClientOptions,
} from '../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../api/search/search-api-client-middleware';

export function buildMockSearchAPIClient(
  options?: Partial<SearchAPIClientOptions>
) {
  return new SearchAPIClient({
    logger: pino({level: 'silent'}),
    preprocessRequest: NoopPreprocessRequest,
    postprocessSearchResponseMiddleware: NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware: NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware: NoopPostprocessQuerySuggestResponseMiddleware,
    ...options,
  });
}
