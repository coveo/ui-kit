import {PlatformResponse} from '../platform-client.js';
import {FacetSearchResponse} from './facet-search/facet-search-response.js';
import {QuerySuggestSuccessResponse} from './query-suggest/query-suggest-response.js';
import {SearchResponseSuccess} from './search/search-response.js';

export type PostprocessSearchResponseMiddleware = (
  response: PlatformResponse<SearchResponseSuccess>
) =>
  | PlatformResponse<SearchResponseSuccess>
  | Promise<PlatformResponse<SearchResponseSuccess>>;

export type PostprocessFacetSearchResponseMiddleware = (
  response: PlatformResponse<FacetSearchResponse>
) =>
  | PlatformResponse<FacetSearchResponse>
  | Promise<PlatformResponse<FacetSearchResponse>>;

export type PostprocessQuerySuggestResponseMiddleware = (
  response: PlatformResponse<QuerySuggestSuccessResponse>
) =>
  | PlatformResponse<QuerySuggestSuccessResponse>
  | Promise<PlatformResponse<QuerySuggestSuccessResponse>>;

export const NoopPostprocessSearchResponseMiddleware: PostprocessSearchResponseMiddleware =
  (response) => response;

export const NoopPostprocessFacetSearchResponseMiddleware: PostprocessFacetSearchResponseMiddleware =
  (response) => response;

export const NoopPostprocessQuerySuggestResponseMiddleware: PostprocessQuerySuggestResponseMiddleware =
  (response) => response;
