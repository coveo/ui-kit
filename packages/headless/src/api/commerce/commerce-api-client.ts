import {Logger} from 'pino';
import {CommerceThunkExtraArguments} from '../../app/commerce-thunk-extra-arguments';
import {CommerceAppState} from '../../state/commerce-app-state';
import {PlatformClient, PlatformClientCallOptions} from '../platform-client';
import {PreprocessRequest} from '../preprocess-request';
import {SpecificFacetSearchResponse} from '../search/facet-search/specific-facet-search/specific-facet-search-response';
import {buildAPIResponseFromErrorOrThrow} from '../search/search-api-error-response';
import {
  CommerceAPIErrorResponse,
  CommerceAPIErrorStatusResponse,
} from './commerce-api-error-response';
import {buildRequest, CommerceAPIRequest} from './common/request';
import {CommerceSuccessResponse} from './common/response';
import {CommerceFacetSearchRequest} from './facet-search/facet-search-request';
import {
  CommerceRecommendationsRequest,
  buildRecommendationsRequest,
} from './recommendations/recommendations-request';
import {RecommendationsCommerceSuccessResponse} from './recommendations/recommendations-response';
import {
  buildQuerySuggestRequest,
  QuerySuggestRequest,
} from './search/query-suggest/query-suggest-request';
import {QuerySuggestSuccessResponse} from './search/query-suggest/query-suggest-response';
import {CommerceSearchRequest} from './search/request';
import {SearchCommerceSuccessResponse} from './search/response';

export interface CommerceFacetSearchAPIClient {
  facetSearch(
    req: CommerceFacetSearchRequest
  ): Promise<CommerceAPIResponse<SpecificFacetSearchResponse>>;
}

export interface AsyncThunkCommerceOptions<
  T extends Partial<CommerceAppState>,
> {
  state: T;
  rejectValue: CommerceAPIErrorStatusResponse;
  extra: CommerceThunkExtraArguments;
}

export interface CommerceAPIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
}

export type CommerceAPIResponse<T> =
  | CommerceAPISuccessResponse<T>
  | CommerceAPIErrorResponse;

export interface CommerceAPISuccessResponse<T> {
  success: T;
}

export const isErrorResponse = <T>(
  r: CommerceAPIResponse<T>
): r is CommerceAPIErrorResponse => {
  return (r as CommerceAPIErrorResponse).error !== undefined;
};

export class CommerceAPIClient implements CommerceFacetSearchAPIClient {
  constructor(private options: CommerceAPIClientOptions) {}

  async getProductListing(
    req: CommerceAPIRequest
  ): Promise<CommerceAPIResponse<CommerceSuccessResponse>> {
    return this.query({
      ...buildRequest(req, 'listing'),
      ...this.options,
    });
  }

  async search(
    req: CommerceSearchRequest
  ): Promise<CommerceAPIResponse<SearchCommerceSuccessResponse>> {
    const requestOptions = buildRequest(req, 'search');
    return this.query({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        query: req?.query,
      },
      ...this.options,
    });
  }

  async getRecommendations(
    req: CommerceRecommendationsRequest
  ): Promise<CommerceAPIResponse<RecommendationsCommerceSuccessResponse>> {
    return this.query({
      ...buildRecommendationsRequest(req, 'recommendations'),
      ...this.options,
    });
  }

  async productSuggestions(
    req: CommerceSearchRequest
  ): Promise<CommerceAPIResponse<SearchCommerceSuccessResponse>> {
    const requestOptions = buildRequest(req, 'search/productSuggest');
    return this.query({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        query: req?.query,
      },
      ...this.options,
    });
  }

  async querySuggest(
    req: QuerySuggestRequest
  ): Promise<CommerceAPIResponse<QuerySuggestSuccessResponse>> {
    const requestOptions = buildQuerySuggestRequest(req);
    return this.query<QuerySuggestSuccessResponse>({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        query: req?.query,
      },
      ...this.options,
    });
  }

  async facetSearch(
    req: CommerceFacetSearchRequest
  ): Promise<CommerceAPIResponse<SpecificFacetSearchResponse>> {
    const requestOptions = buildRequest(req, 'facet');
    return this.query<SpecificFacetSearchResponse>({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        facetId: req?.facetId,
        facetQuery: req?.facetQuery,
        query: req?.query,
      },
      ...this.options,
    });
  }

  // eslint-disable-next-line @cspell/spellchecker
  // TODO: CAPI-867 - Use Commerce API's equivalent of the /plan endpoint when it becomes available.
  async plan(
    req: CommerceSearchRequest
  ): Promise<CommerceAPIResponse<CommerceSuccessResponse>> {
    const requestOptions = buildRequest(req, 'search');
    return this.query({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        query: req?.query,
      },
      ...this.options,
    });
  }

  private async query<T = CommerceSuccessResponse>(
    options: PlatformClientCallOptions
  ) {
    const response = await PlatformClient.call(options);

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as T}
      : {error: body as CommerceAPIErrorStatusResponse};
  }
}
