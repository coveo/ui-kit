import {QuerySuggestSuccessResponse} from './query-suggest/query-suggest-response';
import {FacetSearchResponse} from './facet-search/facet-search-response';
import {SearchResponseSuccess} from './search/search-response';
import {PlatformResponse} from '../platform-client';

export type PreprocessSearchResponseMiddleware = (
  response: PlatformResponse<SearchResponseSuccess>
) => PlatformResponse<SearchResponseSuccess>;

export type PreprocessFacetSearchResponseMiddleware = (
  response: PlatformResponse<FacetSearchResponse>
) => PlatformResponse<FacetSearchResponse>;

export type PreprocessQuerySuggestResponseMiddleware = (
  response: PlatformResponse<QuerySuggestSuccessResponse>
) => PlatformResponse<QuerySuggestSuccessResponse>;

export const NoopPreprocessSearchResponseMiddleware: PreprocessSearchResponseMiddleware = (
  response
) => response;

export const NoopPreprocessFacetSearchResponseMiddleware: PreprocessFacetSearchResponseMiddleware = (
  response
) => response;

export const NoopPreprocessQuerySuggestResponseMiddleware: PreprocessQuerySuggestResponseMiddleware = (
  response
) => response;
