import {Logger} from 'pino';
import {ProductListingV2ThunkExtraArguments} from '../../../../app/product-listing-v2-thunk-extra-arguments';
import {ProductListingV2AppState} from '../../../../state/commerce-app-state';
import {PlatformClient} from '../../../platform-client';
import {PreprocessRequest} from '../../../preprocess-request';
import {FacetSearchRequest} from '../../../search/facet-search/facet-search-request';
import {FacetSearchResponse} from '../../../search/facet-search/facet-search-response';
import {
  FacetSearchAPIClient,
  SearchAPIClient,
} from '../../../search/search-api-client';
import {buildAPIResponseFromErrorOrThrow} from '../../../search/search-api-error-response';
import {
  buildProductListingV2Request,
  ProductListingV2Request,
  ProductListingV2SuccessResponse,
} from './product-listing-v2-request';

export interface AsyncThunkProductListingV2Options<
  T extends Partial<ProductListingV2AppState>
> {
  state: T;
  rejectValue: ProductListingV2APIErrorStatusResponse;
  extra: ProductListingV2ThunkExtraArguments;
}

/**
 * Initialization options for the `ProductListingV2APIClient`.
 */
export interface ProductListingV2APIClientOptions {
  logger: Logger;
  preprocessRequest: PreprocessRequest;
}

/**
 * Defines a Product Listing API response. It can represent an error or a successful response.
 */
export type ProductListingAPIResponse<TSuccessContent> =
  | ProductListingAPISuccessResponse<TSuccessContent>
  | ProductListingAPIErrorResponse;

/**
 * Defines a Product Listing API successful response.
 */
export interface ProductListingAPISuccessResponse<TContent> {
  success: TContent;
}

/**
 * Defines the content of a Product Listing API error response.
 */
export interface ProductListingV2APIErrorStatusResponse {
  statusCode: number;
  message: string;
  type: string;
  ignored?: boolean;
}

/**
 * Defines a Product Listing API error response.
 */
export interface ProductListingAPIErrorResponse {
  error: ProductListingV2APIErrorStatusResponse;
}

/**
 * The client to use to interface with the Product Listing API.
 */
export class ProductListingV2APIClient implements FacetSearchAPIClient {
  constructor(
    private options: ProductListingV2APIClientOptions,
    private searchAPIClient: SearchAPIClient
  ) {}

  /**
   * Retrieves the product listing from the API.
   *
   * @param req - The request parameters.
   * @returns The products for the requested product listing.
   */
  async getListing(
    req: ProductListingV2Request
  ): Promise<ProductListingAPIResponse<ProductListingV2SuccessResponse>> {
    const response = await PlatformClient.call({
      ...buildProductListingV2Request(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as ProductListingV2SuccessResponse}
      : {error: body as ProductListingV2APIErrorStatusResponse};
  }

  async facetSearch(req: FacetSearchRequest): Promise<FacetSearchResponse> {
    return this.searchAPIClient.facetSearch(req);
  }
}
