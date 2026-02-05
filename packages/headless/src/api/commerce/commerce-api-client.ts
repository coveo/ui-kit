import type {Logger} from 'pino';
import type {CommerceThunkExtraArguments} from '../../app/commerce-thunk-extra-arguments.js';
import type {CommerceAppState} from '../../state/commerce-app-state.js';
import type {PlatformEnvironment} from '../../utils/url-utils.js';
import {
  getOrganizationEndpoint,
  PlatformClient,
  type PlatformClientCallOptions,
} from '../platform-client.js';
import type {PreprocessRequest} from '../preprocess-request.js';
import type {SpecificFacetSearchResponse} from '../search/facet-search/specific-facet-search/specific-facet-search-response.js';
import {buildAPIResponseFromErrorOrThrow} from '../search/search-api-error-response.js';
import type {
  CommerceAPIErrorResponse,
  CommerceAPIErrorStatusResponse,
} from './commerce-api-error-response.js';
import {getRequestOptions} from './common/request.js';
import type {CommerceSuccessResponse} from './common/response.js';
import type {
  CommerceFacetSearchRequest,
  FacetSearchType,
} from './facet-search/facet-search-request.js';
import type {CommerceListingRequest} from './listing/request.js';
import type {ListingCommerceSuccessResponse} from './listing/response.js';
import {
  buildProductEnrichmentBadgesRequest,
  type ProductEnrichmentBadgesRequest,
} from './product-enrichment/product-enrichment-request.js';
import type {ProductEnrichmentSuccessBadgesResponse} from './product-enrichment/product-enrichment-response.js';
import {
  buildRecommendationsRequest,
  type CommerceRecommendationsRequest,
} from './recommendations/recommendations-request.js';
import type {RecommendationsCommerceSuccessResponse} from './recommendations/recommendations-response.js';
import {
  getQuerySuggestRequestOptions,
  type QuerySuggestRequest,
} from './search/query-suggest/query-suggest-request.js';
import type {QuerySuggestSuccessResponse} from './search/query-suggest/query-suggest-response.js';
import type {CommerceSearchRedirectRequest} from './search/redirect-request.js';
import type {CommerceSearchRequest} from './search/request.js';
import type {SearchCommerceSuccessResponse} from './search/response.js';

export interface CommerceFacetSearchAPIClient {
  facetSearch(
    req: CommerceFacetSearchRequest,
    facetSearchOrigin: string
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

interface CommerceAPISuccessResponse<T> {
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
    req: CommerceListingRequest
  ): Promise<CommerceAPIResponse<ListingCommerceSuccessResponse>> {
    const requestOptions = getRequestOptions(req, 'listing');
    return this.query({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        enableResults: Boolean(req?.enableResults),
      },
      ...this.options,
    });
  }

  async search(
    req: CommerceSearchRequest
  ): Promise<CommerceAPIResponse<SearchCommerceSuccessResponse>> {
    const requestOptions = getRequestOptions(req, 'search');
    return this.query({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        query: req?.query,
        enableResults: Boolean(req?.enableResults),
      },
      ...this.options,
    });
  }

  async searchRedirect(
    req: CommerceSearchRedirectRequest
  ): Promise<CommerceAPIResponse<SearchCommerceSuccessResponse>> {
    const requestOptions = getRequestOptions(req, 'search/redirect');
    return this.query({
      ...requestOptions,
      requestParams: {
        ...requestOptions.requestParams,
        query: req?.query,
        debug: req?.debug,
        refreshCache: req?.refreshCache,
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
    const requestOptions = getRequestOptions(req, 'search/productSuggest');
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
    const requestOptions = getQuerySuggestRequestOptions(req);
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
    req: CommerceFacetSearchRequest,
    type: FacetSearchType
  ): Promise<CommerceAPIResponse<SpecificFacetSearchResponse>> {
    const requestOptions = getRequestOptions(req, 'facet');
    return this.query<SpecificFacetSearchResponse>({
      ...requestOptions,
      url: `${requestOptions.url}?type=${type}`,
      requestParams: {
        ...requestOptions.requestParams,
        facetId: req?.facetId,
        facetQuery: req?.facetQuery,
        query: req?.query,
        numberOfValues: req?.numberOfValues,
      },
      ...this.options,
    });
  }

  async getBadges(
    req: ProductEnrichmentBadgesRequest
  ): Promise<CommerceAPIResponse<ProductEnrichmentSuccessBadgesResponse>> {
    return this.query<ProductEnrichmentSuccessBadgesResponse>({
      ...buildProductEnrichmentBadgesRequest(req),
      ...this.options,
    });
  }

  async plan(
    req: CommerceSearchRequest
  ): Promise<CommerceAPIResponse<CommerceSuccessResponse>> {
    const environment = extractEnvironmentFromUrl(req.url);

    // Convert the regular search request to a redirect request with the correct URL
    const redirectReq: CommerceSearchRedirectRequest = {
      ...req,
      // Replace the regular commerce API URL with the redirect API URL
      url: getCommerceRedirectApiBaseUrl(req.organizationId, environment),
      debug: false,
      refreshCache: false,
    };
    return this.searchRedirect(redirectReq);
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

export function getCommerceApiBaseUrl(
  organizationId: string,
  environment: PlatformEnvironment = 'prod'
) {
  const platformEndpoint = getOrganizationEndpoint(organizationId, environment);

  return `${platformEndpoint}/rest/organizations/${organizationId}/commerce/v2`;
}

export function getCommerceRedirectApiBaseUrl(
  organizationId: string,
  environment: PlatformEnvironment = 'prod'
) {
  const platformEndpoint = getOrganizationEndpoint(organizationId, environment);

  return `${platformEndpoint}/api/v2/organizations/${organizationId}/commerce/search/redirect`;
}

/**
 * Helper function to extract the platform environment from a URL.
 * Looks for 'dev' in the URL to determine if it's a dev environment.
 */
function extractEnvironmentFromUrl(url: string): PlatformEnvironment {
  return url.includes('dev') ? 'dev' : 'prod';
}
