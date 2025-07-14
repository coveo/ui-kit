import {pino} from 'pino';
import {NoopPreprocessRequest} from '../api/preprocess-request.js';
import {
  SearchAPIClient,
  type SearchAPIClientOptions,
} from '../api/search/search-api-client.js';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../api/search/search-api-client-middleware.js';

export function buildMockSearchAPIClient(
  options?: Partial<SearchAPIClientOptions>
) {
  return new SearchAPIClient({
    logger: pino({level: 'silent'}),
    preprocessRequest: NoopPreprocessRequest,
    postprocessSearchResponseMiddleware:
      NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware:
      NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware:
      NoopPostprocessQuerySuggestResponseMiddleware,
    ...options,
  });
}
