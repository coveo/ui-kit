import pino from 'pino';
import {NoopPreprocessRequestMiddleware} from '../api/platform-client';
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
    renewAccessToken: async () => '',
    logger: pino({level: 'silent'}),
    deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
    postprocessSearchResponseMiddleware: NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware: NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware: NoopPostprocessQuerySuggestResponseMiddleware,
    ...options,
  });
}
