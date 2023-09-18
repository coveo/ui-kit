import {Logger} from 'pino';
import {ProductListingThunkExtraArguments} from '../../../app/product-listing-thunk-extra-arguments';
import {ProductListingAppState} from '../../../state/product-listing-app-state';
import {PlatformClient} from '../../platform-client';
import {PreprocessRequest} from '../../preprocess-request';
import {FacetSearchRequest} from '../../search/facet-search/facet-search-request';
import {FacetSearchResponse} from '../../search/facet-search/facet-search-response';
import {
  FacetSearchAPIClient,
  SearchAPIClient,
} from '../../search/search-api-client';
import {buildAPIResponseFromErrorOrThrow} from '../../search/search-api-error-response';
import {
  buildProductListingRequest,
  ProductListingRequest,
  ProductListingSuccessResponse,
} from './product-listing-request';

export interface AsyncThunkProductListingOptions<
  T extends Partial<ProductListingAppState>,
> {
  state: T;
  rejectValue: ProductListingAPIErrorStatusResponse;
  extra: ProductListingThunkExtraArguments;
}

/**
 * Initialization options for the `ProductListingAPIClient`.
 */
export interface ProductListingAPIClientOptions {
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
export interface ProductListingAPIErrorStatusResponse {
  statusCode: number;
  message: string;
  type: string;
  ignored?: boolean;
}

/**
 * Defines a Product Listing API error response.
 */
export interface ProductListingAPIErrorResponse {
  error: ProductListingAPIErrorStatusResponse;
}

/**
 * The client to use to interface with the Product Listing API.
 */
export class ProductListingAPIClient implements FacetSearchAPIClient {
  constructor(
    private options: ProductListingAPIClientOptions,
    private searchAPIClient: SearchAPIClient
  ) {}

  /**
   * Retrieves the product listing from the API.
   *
   * @param req - The request parameters.
   * @returns The products for the requested product listing.
   */
  async getProducts(
    req: ProductListingRequest
  ): Promise<ProductListingAPIResponse<ProductListingSuccessResponse>> {
    const response = await PlatformClient.call({
      ...buildProductListingRequest(req),
      ...this.options,
    });

    if (response instanceof Error) {
      return buildAPIResponseFromErrorOrThrow(response);
    }

    const body = await response.json();
    return response.ok
      ? {success: body as ProductListingSuccessResponse}
      : {error: body as ProductListingAPIErrorStatusResponse};
  }

  async facetSearch(req: FacetSearchRequest): Promise<FacetSearchResponse> {
    return this.searchAPIClient.facetSearch(req);
  }
}
